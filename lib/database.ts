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
  
  // 事業分類テーブル（階層構造）
  await conn.execute(`
    CREATE TABLE IF NOT EXISTS business_categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      code VARCHAR(10) NOT NULL,
      name VARCHAR(255) NOT NULL,
      level ENUM('major', 'middle', 'minor') DEFAULT 'major',
      parent_id INT,
      industry_avg_data JSON,
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
  
  // 日本標準産業分類に基づく階層構造データ（完全版）
  const categoryData = [
    // 大分類
    { id: 1, code: 'A', name: '農業・林業', level: 'major', parent_id: null },
    { id: 2, code: 'B', name: '漁業', level: 'major', parent_id: null },
    { id: 3, code: 'C', name: '鉱業・採石業・砂利採取業', level: 'major', parent_id: null },
    { id: 4, code: 'D', name: '建設業', level: 'major', parent_id: null },
    { id: 5, code: 'E', name: '製造業', level: 'major', parent_id: null },
    { id: 6, code: 'F', name: '電気・ガス・熱供給・水道業', level: 'major', parent_id: null },
    { id: 7, code: 'G', name: '情報通信業', level: 'major', parent_id: null },
    { id: 8, code: 'H', name: '運輸業・郵便業', level: 'major', parent_id: null },
    { id: 9, code: 'I', name: '卸売業・小売業', level: 'major', parent_id: null },
    { id: 10, code: 'J', name: '金融業・保険業', level: 'major', parent_id: null },
    { id: 11, code: 'K', name: '不動産業・物品賃貸業', level: 'major', parent_id: null },
    { id: 12, code: 'L', name: '学術研究・専門・技術サービス業', level: 'major', parent_id: null },
    { id: 13, code: 'M', name: '宿泊業・飲食サービス業', level: 'major', parent_id: null },
    { id: 14, code: 'N', name: '生活関連サービス業・娯楽業', level: 'major', parent_id: null },
    { id: 15, code: 'O', name: '教育・学習支援業', level: 'major', parent_id: null },
    { id: 16, code: 'P', name: '医療・福祉', level: 'major', parent_id: null },
    { id: 17, code: 'Q', name: '複合サービス事業', level: 'major', parent_id: null },
    { id: 18, code: 'R', name: 'サービス業（他に分類されないもの）', level: 'major', parent_id: null },
    { id: 19, code: 'S', name: '公務（他に分類されるものを除く）', level: 'major', parent_id: null },
    { id: 20, code: 'T', name: 'その他', level: 'major', parent_id: null },
    
    // 建設業の中分類
    { id: 401, code: 'D06', name: '総合工事業', level: 'middle', parent_id: 4 },
    { id: 402, code: 'D07', name: '職別工事業', level: 'middle', parent_id: 4 },
    { id: 403, code: 'D08', name: '設備工事業', level: 'middle', parent_id: 4 },
    
    // 製造業の中分類
    { id: 501, code: 'E09', name: '食料品製造業', level: 'middle', parent_id: 5 },
    { id: 502, code: 'E10', name: '飲料・たばこ・飼料製造業', level: 'middle', parent_id: 5 },
    { id: 503, code: 'E11', name: '繊維工業', level: 'middle', parent_id: 5 },
    { id: 504, code: 'E12', name: '木材・木製品製造業（家具を除く）', level: 'middle', parent_id: 5 },
    { id: 505, code: 'E13', name: '家具・装身具製造業', level: 'middle', parent_id: 5 },
    { id: 506, code: 'E14', name: 'パルプ・紙・紙加工品製造業', level: 'middle', parent_id: 5 },
    { id: 507, code: 'E15', name: '印刷・同関連業', level: 'middle', parent_id: 5 },
    { id: 508, code: 'E16', name: '化学工業', level: 'middle', parent_id: 5 },
    { id: 509, code: 'E17', name: '石油製品・石炭製品製造業', level: 'middle', parent_id: 5 },
    { id: 510, code: 'E18', name: 'プラスチック製品製造業', level: 'middle', parent_id: 5 },
    { id: 511, code: 'E19', name: 'ゴム製品製造業', level: 'middle', parent_id: 5 },
    { id: 512, code: 'E20', name: 'なめし革・同製品・毛皮製造業', level: 'middle', parent_id: 5 },
    { id: 513, code: 'E21', name: '窯業・土石製品製造業', level: 'middle', parent_id: 5 },
    { id: 514, code: 'E22', name: '鉄鋼業', level: 'middle', parent_id: 5 },
    { id: 515, code: 'E23', name: '非鉄金属製造業', level: 'middle', parent_id: 5 },
    { id: 516, code: 'E24', name: '金属製品製造業', level: 'middle', parent_id: 5 },
    { id: 517, code: 'E25', name: 'はん用機械器具製造業', level: 'middle', parent_id: 5 },
    { id: 518, code: 'E26', name: '生産用機械器具製造業', level: 'middle', parent_id: 5 },
    { id: 519, code: 'E27', name: '業務用機械器具製造業', level: 'middle', parent_id: 5 },
    { id: 520, code: 'E28', name: '電子部品・デバイス・電子回路製造業', level: 'middle', parent_id: 5 },
    { id: 521, code: 'E29', name: '電気機械器具製造業', level: 'middle', parent_id: 5 },
    { id: 522, code: 'E30', name: '情報通信機械器具製造業', level: 'middle', parent_id: 5 },
    { id: 523, code: 'E31', name: '輸送用機械器具製造業', level: 'middle', parent_id: 5 },
    { id: 524, code: 'E32', name: 'その他の製造業', level: 'middle', parent_id: 5 },
    
    // 情報通信業の中分類
    { id: 701, code: 'G37', name: '通信業', level: 'middle', parent_id: 7 },
    { id: 702, code: 'G38', name: '放送業', level: 'middle', parent_id: 7 },
    { id: 703, code: 'G39', name: '情報サービス業', level: 'middle', parent_id: 7 },
    { id: 704, code: 'G40', name: 'インターネット附随サービス業', level: 'middle', parent_id: 7 },
    
    // 卸売業・小売業の中分類
    { id: 901, code: 'I50', name: '各種商品卸売業', level: 'middle', parent_id: 9 },
    { id: 902, code: 'I51', name: '繊維・衣服等卸売業', level: 'middle', parent_id: 9 },
    { id: 903, code: 'I52', name: '飲食料品卸売業', level: 'middle', parent_id: 9 },
    { id: 904, code: 'I53', name: '建築材料、鉱物・金属材料等卸売業', level: 'middle', parent_id: 9 },
    { id: 905, code: 'I54', name: '機械器具卸売業', level: 'middle', parent_id: 9 },
    { id: 906, code: 'I55', name: 'その他の卸売業', level: 'middle', parent_id: 9 },
    { id: 907, code: 'I56', name: '各種商品小売業', level: 'middle', parent_id: 9 },
    { id: 908, code: 'I57', name: '繊維・衣服・身の回り品小売業', level: 'middle', parent_id: 9 },
    { id: 909, code: 'I58', name: '飲食料品小売業', level: 'middle', parent_id: 9 },
    { id: 910, code: 'I59', name: '機械器具小売業', level: 'middle', parent_id: 9 },
    { id: 911, code: 'I60', name: 'その他の小売業', level: 'middle', parent_id: 9 },
    
    // 宿泊業・飲食サービス業の中分類
    { id: 1301, code: 'M75', name: '宿泊業', level: 'middle', parent_id: 13 },
    { id: 1302, code: 'M76', name: '飲食店', level: 'middle', parent_id: 13 },
    { id: 1303, code: 'M77', name: '持ち帰り・配達飲食サービス業', level: 'middle', parent_id: 13 },
    
    // 小分類の例（食料品製造業から抜粋）
    { id: 10101, code: 'E091', name: '畜産食料品製造業', level: 'minor', parent_id: 501 },
    { id: 10102, code: 'E092', name: '水産食料品製造業', level: 'minor', parent_id: 501 },
    { id: 10103, code: 'E093', name: '野菜缶詰・果実缶詰・農産保存食料品製造業', level: 'minor', parent_id: 501 },
    { id: 10104, code: 'E094', name: '調味料製造業', level: 'minor', parent_id: 501 },
    { id: 10105, code: 'E095', name: '糖類製造業', level: 'minor', parent_id: 501 },
    { id: 10106, code: 'E096', name: 'パン・菓子製造業', level: 'minor', parent_id: 501 },
    { id: 10107, code: 'E097', name: '動植物油脂製造業', level: 'minor', parent_id: 501 },
    { id: 10108, code: 'E099', name: 'その他の食料品製造業', level: 'minor', parent_id: 501 },
    
    // 小分類の例（金属製品製造業から抜粋）
    { id: 20101, code: 'E241', name: 'ブリキ缶・その他のめっき板等製品製造業', level: 'minor', parent_id: 516 },
    { id: 20102, code: 'E242', name: '洋食器製造業', level: 'minor', parent_id: 516 },
    { id: 20103, code: 'E243', name: 'アルミニウム・同合金プレス製品製造業', level: 'minor', parent_id: 516 },
    { id: 20104, code: 'E244', name: '建設用・建築用金属製品製造業', level: 'minor', parent_id: 516 },
    { id: 20105, code: 'E245', name: '金属素形材製品製造業', level: 'minor', parent_id: 516 },
    { id: 20106, code: 'E246', name: '金属被覆・彫刻業、熱処理業', level: 'minor', parent_id: 516 },
    { id: 20107, code: 'E247', name: '金属線製品製造業', level: 'minor', parent_id: 516 },
    { id: 20108, code: 'E248', name: 'ボルト・ナット・リベット・小ねじ・木ねじ等製造業', level: 'minor', parent_id: 516 },
    { id: 20109, code: 'E249', name: 'その他の金属製品製造業', level: 'minor', parent_id: 516 },
    
    // 小分類の例（情報サービス業から抜粋）
    { id: 30101, code: 'G391', name: 'ソフトウェア業', level: 'minor', parent_id: 703 },
    { id: 30102, code: 'G392', name: '情報処理・提供サービス業', level: 'minor', parent_id: 703 }
  ];
  
  // データを順次挿入
  for (const cat of categoryData) {
    await conn.execute(
      'INSERT IGNORE INTO business_categories (id, code, name, level, parent_id) VALUES (?, ?, ?, ?, ?)',
      [cat.id, cat.code, cat.name, cat.level, cat.parent_id]
    );
  }
  
  console.log('業種分類データを初期化しました');
}

export async function getBusinessCategoriesByLevel(level?: string, parentId?: number) {
  const conn = await getConnection();
  let query = 'SELECT * FROM business_categories';
  const params: any[] = [];
  
  if (level || parentId !== undefined) {
    const conditions = [];
    if (level) {
      conditions.push('level = ?');
      params.push(level);
    }
    if (parentId !== undefined) {
      conditions.push('parent_id = ?');
      params.push(parentId);
    }
    query += ' WHERE ' + conditions.join(' AND ');
  }
  
  query += ' ORDER BY code';
  
  const [rows] = await conn.execute(query, params);
  return rows;
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