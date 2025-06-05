import { createWorker } from 'tesseract.js';
import * as XLSX from 'xlsx';

interface BSData {
  // 資産の部
  current_assets: number;        // 流動資産
  cash_and_deposits: number;     // 現金及び預金
  accounts_receivable: number;   // 売掛金
  inventory: number;             // 棚卸資産
  fixed_assets: number;          // 固定資産
  tangible_assets: number;       // 有形固定資産
  intangible_assets: number;     // 無形固定資産
  total_assets: number;          // 資産合計
  
  // 負債の部
  current_liabilities: number;   // 流動負債
  accounts_payable: number;      // 買掛金
  short_term_debt: number;       // 短期借入金
  fixed_liabilities: number;     // 固定負債
  long_term_debt: number;        // 長期借入金
  total_liabilities: number;     // 負債合計
  
  // 純資産の部
  capital_stock: number;         // 資本金
  retained_earnings: number;     // 利益剰余金
  total_equity: number;          // 純資産合計
}

interface PLData {
  // 売上・収益
  sales: number;                 // 売上高
  cost_of_sales: number;         // 売上原価
  gross_profit: number;          // 売上総利益
  
  // 費用
  operating_expenses: number;    // 販売費及び一般管理費
  operating_income: number;      // 営業利益
  ordinary_income: number;       // 経常利益
  net_income: number;           // 当期純利益
  
  // その他
  depreciation: number;         // 減価償却費
  interest_expense: number;     // 支払利息
}

interface FinancialRatios {
  // 収益性指標
  roa: number;                  // 総資産利益率
  roe: number;                  // 自己資本利益率
  operating_margin: number;     // 営業利益率
  ordinary_margin: number;      // 経常利益率
  gross_margin: number;         // 売上総利益率
  
  // 安全性指標
  current_ratio: number;        // 流動比率
  quick_ratio: number;          // 当座比率
  equity_ratio: number;         // 自己資本比率
  debt_ratio: number;           // 負債比率
  fixed_ratio: number;          // 固定比率
  fixed_long_term_ratio: number; // 固定長期適合率
  
  // 効率性指標
  asset_turnover: number;       // 総資産回転率
  inventory_turnover: number;   // 棚卸資産回転率
  receivables_turnover: number; // 売上債権回転率
  working_capital_turnover: number; // 運転資本回転率
  
  // 成長性指標
  sales_growth: number;         // 売上高成長率
  profit_growth: number;        // 利益成長率
  
  // 中小企業特化指標
  interest_coverage: number;    // インタレストカバレッジレシオ
  cash_ratio: number;           // 現金比率
  tangible_equity_ratio: number; // 有形純資産比率
  working_capital_ratio: number; // 運転資本比率
  
  // 生産性指標（従業員数が入力された場合）
  sales_per_employee?: number;   // 従業員一人当たり売上高
  profit_per_employee?: number;  // 従業員一人当たり営業利益
  labor_productivity?: number;   // 労働生産性
}

// OCRでテキストを抽出
export async function extractTextFromImage(imageBuffer: Buffer): Promise<string> {
  const worker = await createWorker('jpn');
  
  try {
    const { data: { text } } = await worker.recognize(imageBuffer);
    await worker.terminate();
    return text;
  } catch (error) {
    await worker.terminate();
    throw error;
  }
}

// ExcelファイルからデータをExcel形式で読み取り
export function extractDataFromExcel(buffer: Buffer): any {
  try {
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const result: any = {};
    
    workbook.SheetNames.forEach(sheetName => {
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
      result[sheetName] = jsonData;
    });
    
    return result;
  } catch (error) {
    throw new Error('Excelファイルの読み取りに失敗しました: ' + error);
  }
}

// CSVファイルからデータを抽出
export function extractDataFromCSV(buffer: Buffer): any {
  try {
    const text = buffer.toString('utf-8');
    const lines = text.split('\n');
    const result = lines.map(line => line.split(','));
    return result;
  } catch (error) {
    throw new Error('CSVファイルの読み取りに失敗しました: ' + error);
  }
}

// テキストから財務データを抽出（パターンマッチング）
export function parseFinancialDataFromText(text: string, fileType: string): { bs?: BSData, pl?: PLData } {
  const result: { bs?: BSData, pl?: PLData } = {};
  
  // 数値を抽出するヘルパー関数
  const extractNumber = (pattern: RegExp): number => {
    const match = text.match(pattern);
    if (match) {
      const numStr = match[1].replace(/[,\s]/g, '');
      return parseInt(numStr) || 0;
    }
    return 0;
  };
  
  if (fileType === 'bs' || fileType === 'settlement') {
    // 貸借対照表データの抽出
    result.bs = {
      current_assets: extractNumber(/流動資産[：:\s,]*([0-9,\s]+)/i),
      cash_and_deposits: extractNumber(/現金及び預金[：:\s,]*([0-9,\s]+)/i) || extractNumber(/現金預金[：:\s,]*([0-9,\s]+)/i),
      accounts_receivable: extractNumber(/売掛金[：:\s,]*([0-9,\s]+)/i),
      inventory: extractNumber(/棚卸資産[：:\s,]*([0-9,\s]+)/i) || extractNumber(/在庫[：:\s,]*([0-9,\s]+)/i),
      fixed_assets: extractNumber(/固定資産[：:\s,]*([0-9,\s]+)/i),
      tangible_assets: extractNumber(/有形固定資産[：:\s,]*([0-9,\s]+)/i),
      intangible_assets: extractNumber(/無形固定資産[：:\s,]*([0-9,\s]+)/i),
      total_assets: extractNumber(/資産合計[：:\s,]*([0-9,\s]+)/i) || extractNumber(/総資産[：:\s,]*([0-9,\s]+)/i),
      
      current_liabilities: extractNumber(/流動負債[：:\s,]*([0-9,\s]+)/i),
      accounts_payable: extractNumber(/買掛金[：:\s,]*([0-9,\s]+)/i),
      short_term_debt: extractNumber(/短期借入金[：:\s,]*([0-9,\s]+)/i),
      fixed_liabilities: extractNumber(/固定負債[：:\s,]*([0-9,\s]+)/i),
      long_term_debt: extractNumber(/長期借入金[：:\s,]*([0-9,\s]+)/i),
      total_liabilities: extractNumber(/負債合計[：:\s,]*([0-9,\s]+)/i),
      
      capital_stock: extractNumber(/資本金[：:\s,]*([0-9,\s]+)/i),
      retained_earnings: extractNumber(/利益剰余金[：:\s,]*([0-9,\s]+)/i),
      total_equity: extractNumber(/純資産合計[：:\s,]*([0-9,\s]+)/i) || extractNumber(/自己資本[：:\s,]*([0-9,\s]+)/i)
    };
  }
  
  if (fileType === 'pl' || fileType === 'settlement') {
    // 損益計算書データの抽出
    result.pl = {
      sales: extractNumber(/売上高[：:\s,]*([0-9,\s]+)/i),
      cost_of_sales: extractNumber(/売上原価[：:\s,]*([0-9,\s]+)/i),
      gross_profit: extractNumber(/売上総利益[：:\s,]*([0-9,\s]+)/i),
      
      operating_expenses: extractNumber(/販売費及び一般管理費[：:\s,]*([0-9,\s]+)/i) || extractNumber(/販売管理費[：:\s,]*([0-9,\s]+)/i),
      operating_income: extractNumber(/営業利益[：:\s,]*([0-9,\s]+)/i),
      ordinary_income: extractNumber(/経常利益[：:\s,]*([0-9,\s]+)/i),
      net_income: extractNumber(/当期純利益[：:\s,]*([0-9,\s]+)/i),
      
      depreciation: extractNumber(/減価償却費[：:\s,]*([0-9,\s]+)/i),
      interest_expense: extractNumber(/支払利息[：:\s,]*([0-9,\s]+)/i)
    };
  }
  
  return result;
}

// 財務指標を計算（拡張版）
export function calculateFinancialRatios(
  bs?: BSData, 
  pl?: PLData, 
  previousData?: { bs?: BSData, pl?: PLData },
  employeeCount?: number
): FinancialRatios {
  const ratios: FinancialRatios = {
    // 収益性指標
    roa: 0, roe: 0, operating_margin: 0, ordinary_margin: 0, gross_margin: 0,
    
    // 安全性指標
    current_ratio: 0, quick_ratio: 0, equity_ratio: 0, debt_ratio: 0, 
    fixed_ratio: 0, fixed_long_term_ratio: 0,
    
    // 効率性指標
    asset_turnover: 0, inventory_turnover: 0, receivables_turnover: 0, working_capital_turnover: 0,
    
    // 成長性指標
    sales_growth: 0, profit_growth: 0,
    
    // 中小企業特化指標
    interest_coverage: 0, cash_ratio: 0, tangible_equity_ratio: 0, working_capital_ratio: 0
  };
  
  if (bs && pl) {
    // 収益性指標
    if (bs.total_assets > 0) {
      ratios.roa = (pl.net_income / bs.total_assets) * 100;
      ratios.asset_turnover = pl.sales / bs.total_assets;
    }
    
    if (bs.total_equity > 0) {
      ratios.roe = (pl.net_income / bs.total_equity) * 100;
      ratios.fixed_ratio = (bs.fixed_assets / bs.total_equity) * 100;
    }
    
    if (pl.sales > 0) {
      ratios.operating_margin = (pl.operating_income / pl.sales) * 100;
      ratios.ordinary_margin = (pl.ordinary_income / pl.sales) * 100;
      ratios.gross_margin = (pl.gross_profit / pl.sales) * 100;
    }
    
    // 安全性指標
    if (bs.current_liabilities > 0) {
      ratios.current_ratio = (bs.current_assets / bs.current_liabilities) * 100;
      
      // 当座比率（当座資産 = 現金預金 + 売掛金）
      const quick_assets = bs.cash_and_deposits + bs.accounts_receivable;
      ratios.quick_ratio = (quick_assets / bs.current_liabilities) * 100;
      
      // 現金比率
      ratios.cash_ratio = (bs.cash_and_deposits / bs.current_liabilities) * 100;
    }
    
    if (bs.total_assets > 0) {
      ratios.equity_ratio = (bs.total_equity / bs.total_assets) * 100;
      ratios.debt_ratio = (bs.total_liabilities / bs.total_assets) * 100;
      
      // 有形純資産比率
      const tangible_equity = bs.total_equity - bs.intangible_assets;
      ratios.tangible_equity_ratio = (tangible_equity / bs.total_assets) * 100;
    }
    
    // 固定長期適合率
    const long_term_capital = bs.total_equity + bs.fixed_liabilities;
    if (long_term_capital > 0) {
      ratios.fixed_long_term_ratio = (bs.fixed_assets / long_term_capital) * 100;
    }
    
    // 効率性指標
    if (bs.inventory > 0 && pl.cost_of_sales > 0) {
      ratios.inventory_turnover = pl.cost_of_sales / bs.inventory;
    }
    
    if (bs.accounts_receivable > 0 && pl.sales > 0) {
      ratios.receivables_turnover = pl.sales / bs.accounts_receivable;
    }
    
    // 運転資本関連
    const working_capital = bs.current_assets - bs.current_liabilities;
    if (working_capital > 0 && pl.sales > 0) {
      ratios.working_capital_turnover = pl.sales / working_capital;
    }
    if (bs.total_assets > 0) {
      ratios.working_capital_ratio = (working_capital / bs.total_assets) * 100;
    }
    
    // インタレストカバレッジレシオ
    if (pl.interest_expense > 0) {
      ratios.interest_coverage = pl.operating_income / pl.interest_expense;
    }
    
    // 生産性指標（従業員数が入力されている場合）
    if (employeeCount && employeeCount > 0) {
      ratios.sales_per_employee = pl.sales / employeeCount;
      ratios.profit_per_employee = pl.operating_income / employeeCount;
      
      // 労働生産性（付加価値/従業員数）
      const value_added = pl.gross_profit + pl.depreciation; // 簡易付加価値
      ratios.labor_productivity = value_added / employeeCount;
    }
    
    // 成長性指標（前期データがある場合）
    if (previousData?.pl) {
      if (previousData.pl.sales > 0) {
        ratios.sales_growth = ((pl.sales - previousData.pl.sales) / previousData.pl.sales) * 100;
      }
      if (previousData.pl.net_income > 0) {
        ratios.profit_growth = ((pl.net_income - previousData.pl.net_income) / previousData.pl.net_income) * 100;
      }
    }
  }
  
  return ratios;
}

// メインのファイル分析関数
export async function analyzeFinancialFile(
  buffer: Buffer, 
  filename: string, 
  fileType: string
): Promise<{
  extracted_text?: string;
  parsed_data?: any;
  bs_data?: BSData;
  pl_data?: PLData;
  calculated_ratios?: FinancialRatios;
}> {
  const result: any = {};
  
  try {
    const fileExtension = filename.toLowerCase().split('.').pop();
    
    if (fileExtension === 'xlsx' || fileExtension === 'xls') {
      // Excelファイルの処理
      result.parsed_data = extractDataFromExcel(buffer);
      
      // Excelデータから財務データを抽出（簡易実装）
      const excelText = JSON.stringify(result.parsed_data);
      const financialData = parseFinancialDataFromText(excelText, fileType);
      result.bs_data = financialData.bs;
      result.pl_data = financialData.pl;
      
    } else if (fileExtension === 'csv') {
      // CSVファイルの処理
      result.parsed_data = extractDataFromCSV(buffer);
      
      const csvText = JSON.stringify(result.parsed_data);
      const financialData = parseFinancialDataFromText(csvText, fileType);
      result.bs_data = financialData.bs;
      result.pl_data = financialData.pl;
      
    } else if (['png', 'jpg', 'jpeg'].includes(fileExtension || '')) {
      // 画像ファイルのOCR処理
      result.extracted_text = await extractTextFromImage(buffer);
      
      const financialData = parseFinancialDataFromText(result.extracted_text, fileType);
      result.bs_data = financialData.bs;
      result.pl_data = financialData.pl;
      
    } else if (fileExtension === 'pdf') {
      // PDFファイルの処理（簡易実装 - 実際にはPDF解析ライブラリが必要）
      result.extracted_text = 'PDF解析機能は未実装（OCR対応予定）';
    }
    
    // 財務指標を計算
    if (result.bs_data || result.pl_data) {
      result.calculated_ratios = calculateFinancialRatios(result.bs_data, result.pl_data);
    }
    
    return result;
    
  } catch (error) {
    throw new Error('ファイル分析に失敗しました: ' + error);
  }
}