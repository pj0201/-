import mysql from 'mysql2/promise';

const config = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'financial_analysis',
  port: parseInt(process.env.DB_PORT || '3306'),
};

let connection: mysql.Connection | null = null;

export async function getConnection() {
  if (!connection) {
    connection = await mysql.createConnection(config);
  }
  return connection;
}

export async function initDatabase() {
  const conn = await getConnection();
  
  // 法人テーブル
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS companies (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      address TEXT,
      representative VARCHAR(255),
      capital_amount BIGINT,
      fiscal_month INT,
      main_bank VARCHAR(255),
      memo TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      UNIQUE KEY unique_name (name)
    )
  `);
  
  // 事業分類テーブル
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS business_categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(10) NOT NULL,
      name VARCHAR(255) NOT NULL,
      parent_id INT,
      UNIQUE KEY unique_code (code),
      FOREIGN KEY (parent_id) REFERENCES business_categories(id) ON DELETE SET NULL
    )
  `);
  
  // 企業と事業分類の関連テーブル
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS company_business_categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      category_id INT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES business_categories(id) ON DELETE CASCADE,
      UNIQUE KEY unique_company_category (company_id, category_id)
    )
  `);
  
  // アップロードファイルテーブル
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS uploaded_files (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      filename VARCHAR(255) NOT NULL,
      file_type ENUM('bs', 'pl', 'trial_balance', 'payroll', 'settlement', 'other') NOT NULL,
      period VARCHAR(20) NOT NULL,
      file_path VARCHAR(500),
      file_size INT,
      upload_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      processed BOOLEAN DEFAULT FALSE,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      INDEX idx_company_period (company_id, period),
      INDEX idx_file_type (file_type)
    )
  `);
  
  // 財務データテーブル
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS financial_data (
      id INT AUTO_INCREMENT PRIMARY KEY,
      company_id INT NOT NULL,
      period VARCHAR(20) NOT NULL,
      data_type ENUM('bs', 'pl', 'trial_balance') NOT NULL,
      data_json JSON NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      UNIQUE KEY unique_company_period_type (company_id, period, data_type)
    )
  `);
  
  // ファイル分析結果テーブル
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS file_analysis_results (
      id INT AUTO_INCREMENT PRIMARY KEY,
      file_id INT NOT NULL,
      company_id INT NOT NULL,
      period VARCHAR(20) NOT NULL,
      extracted_text TEXT,
      parsed_data JSON,
      bs_data JSON,
      pl_data JSON,
      calculated_ratios JSON,
      analysis_status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
      error_message TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (file_id) REFERENCES uploaded_files(id) ON DELETE CASCADE,
      FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
      INDEX idx_company_period (company_id, period)
    )
  `);
  
  console.log('Database tables initialized successfully');
}

export async function insertCompany(name: string) {
  const conn = await getConnection();
  const [result] = await conn.execute(
    'INSERT IGNORE INTO companies (name) VALUES (?)',
    [name]
  );
  
  // 会社IDを取得
  const [rows] = await conn.execute(
    'SELECT id FROM companies WHERE name = ?',
    [name]
  );
  return (rows as any[])[0]?.id;
}

export async function insertFullCompany(companyData: {
  name: string;
  address?: string;
  representative?: string;
  capital_amount?: number;
  fiscal_month?: number;
  main_bank?: string;
  memo?: string;
  business_categories?: number[];
}) {
  const conn = await getConnection();
  
  // 企業情報を挿入
  const [result] = await conn.execute(
    `INSERT INTO companies (name, address, representative, capital_amount, fiscal_month, main_bank, memo) 
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      companyData.name,
      companyData.address || null,
      companyData.representative || null,
      companyData.capital_amount || null,
      companyData.fiscal_month || null,
      companyData.main_bank || null,
      companyData.memo || null
    ]
  );
  
  const companyId = (result as any).insertId;
  
  // 事業分類を関連付け
  if (companyData.business_categories && companyData.business_categories.length > 0) {
    for (const categoryId of companyData.business_categories) {
      await conn.execute(
        'INSERT IGNORE INTO company_business_categories (company_id, category_id) VALUES (?, ?)',
        [companyId, categoryId]
      );
    }
  }
  
  return companyId;
}

export async function getBusinessCategories() {
  const conn = await getConnection();
  const [rows] = await conn.execute('SELECT * FROM business_categories ORDER BY code');
  return rows;
}

export async function initBusinessCategories() {
  const conn = await getConnection();
  
  // 基本的な事業分類データを挿入（日本標準産業分類から抜粋）
  const categories = [
    { code: 'A', name: '農業・林業' },
    { code: 'B', name: '漁業' },
    { code: 'C', name: '鉱業・採石業・砂利採取業' },
    { code: 'D', name: '建設業' },
    { code: 'E', name: '製造業' },
    { code: 'F', name: '電気・ガス・熱供給・水道業' },
    { code: 'G', name: '情報通信業' },
    { code: 'H', name: '運輸業・郵便業' },
    { code: 'I', name: '卸売業・小売業' },
    { code: 'J', name: '金融業・保険業' },
    { code: 'K', name: '不動産業・物品賃貸業' },
    { code: 'L', name: '学術研究・専門・技術サービス業' },
    { code: 'M', name: '宿泊業・飲食サービス業' },
    { code: 'N', name: '生活関連サービス業・娯楽業' },
    { code: 'O', name: '教育・学習支援業' },
    { code: 'P', name: '医療・福祉' },
    { code: 'Q', name: '複合サービス事業' },
    { code: 'R', name: 'サービス業（他に分類されないもの）' },
    { code: 'S', name: '公務（他に分類されるものを除く）' },
    { code: 'T', name: 'その他' }
  ];
  
  for (const category of categories) {
    await conn.execute(
      'INSERT IGNORE INTO business_categories (code, name) VALUES (?, ?)',
      [category.code, category.name]
    );
  }
}

export async function insertUploadedFile(
  companyId: number,
  filename: string,
  fileType: string,
  period: string,
  filePath?: string,
  fileSize?: number
) {
  const conn = await getConnection();
  const [result] = await conn.execute(
    'INSERT INTO uploaded_files (company_id, filename, file_type, period, file_path, file_size) VALUES (?, ?, ?, ?, ?, ?)',
    [companyId, filename, fileType, period, filePath, fileSize]
  );
  return (result as any).insertId;
}

export async function getCompanyFiles(companyId: number) {
  const conn = await getConnection();
  const [rows] = await conn.execute(
    'SELECT * FROM uploaded_files WHERE company_id = ? ORDER BY upload_date DESC',
    [companyId]
  );
  return rows;
}

export async function getCompanies() {
  const conn = await getConnection();
  const [rows] = await conn.execute('SELECT * FROM companies ORDER BY name');
  return rows;
}

export async function insertFileAnalysisResult(data: {
  file_id: number;
  company_id: number;
  period: string;
  extracted_text?: string;
  parsed_data?: any;
  bs_data?: any;
  pl_data?: any;
  calculated_ratios?: any;
  analysis_status?: string;
  error_message?: string;
}) {
  const conn = await getConnection();
  const [result] = await conn.execute(
    `INSERT INTO file_analysis_results 
     (file_id, company_id, period, extracted_text, parsed_data, bs_data, pl_data, calculated_ratios, analysis_status, error_message) 
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.file_id,
      data.company_id,
      data.period,
      data.extracted_text || null,
      data.parsed_data ? JSON.stringify(data.parsed_data) : null,
      data.bs_data ? JSON.stringify(data.bs_data) : null,
      data.pl_data ? JSON.stringify(data.pl_data) : null,
      data.calculated_ratios ? JSON.stringify(data.calculated_ratios) : null,
      data.analysis_status || 'pending',
      data.error_message || null
    ]
  );
  return (result as any).insertId;
}

export async function updateFileAnalysisResult(analysisId: number, data: {
  extracted_text?: string;
  parsed_data?: any;
  bs_data?: any;
  pl_data?: any;
  calculated_ratios?: any;
  analysis_status?: string;
  error_message?: string;
}) {
  const conn = await getConnection();
  const setClause = [];
  const values = [];
  
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      if (['parsed_data', 'bs_data', 'pl_data', 'calculated_ratios'].includes(key)) {
        setClause.push(`${key} = ?`);
        values.push(JSON.stringify(value));
      } else {
        setClause.push(`${key} = ?`);
        values.push(value);
      }
    }
  });
  
  if (setClause.length > 0) {
    values.push(analysisId);
    await conn.execute(
      `UPDATE file_analysis_results SET ${setClause.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
      values
    );
  }
}

export async function getFileAnalysisResult(fileId: number) {
  const conn = await getConnection();
  const [rows] = await conn.execute(
    'SELECT * FROM file_analysis_results WHERE file_id = ?',
    [fileId]
  );
  return (rows as any[])[0];
}