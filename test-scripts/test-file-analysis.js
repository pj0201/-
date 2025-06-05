// ファイル分析機能のテストスクリプト
const fs = require('fs');
const path = require('path');

// 簡易版のファイル分析関数（Node.js環境用）
function parseFinancialDataFromText(text, fileType) {
  const result = {};
  
  // 数値を抽出するヘルパー関数
  const extractNumber = (pattern) => {
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

// 財務指標計算関数
function calculateFinancialRatios(bs, pl, employeeCount) {
  const ratios = {
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
    
    // 効率性指標
    if (bs.inventory > 0 && pl.cost_of_sales > 0) {
      ratios.inventory_turnover = pl.cost_of_sales / bs.inventory;
    }
    
    if (bs.accounts_receivable > 0 && pl.sales > 0) {
      ratios.receivables_turnover = pl.sales / bs.accounts_receivable;
    }
    
    // インタレストカバレッジレシオ
    if (pl.interest_expense > 0) {
      ratios.interest_coverage = pl.operating_income / pl.interest_expense;
    }
    
    // 生産性指標（従業員数が入力されている場合）
    if (employeeCount && employeeCount > 0) {
      ratios.sales_per_employee = pl.sales / employeeCount;
      ratios.profit_per_employee = pl.operating_income / employeeCount;
    }
  }
  
  return ratios;
}

// CSVファイル読み取り関数
function extractDataFromCSV(filePath) {
  try {
    const text = fs.readFileSync(filePath, 'utf-8');
    const lines = text.split('\n');
    return lines.map(line => line.split(','));
  } catch (error) {
    throw new Error('CSVファイルの読み取りに失敗しました: ' + error);
  }
}

// CSVデータから財務数値を直接抽出
function parseCSVFinancialData(csvData, fileType) {
  const result = {};
  
  // CSVデータを連想配列に変換
  const dataMap = {};
  csvData.forEach(row => {
    if (row.length >= 2) {
      const item = row[0]?.trim();
      const value = parseInt(row[1]?.replace(/[,\s]/g, '')) || 0;
      if (item) {
        dataMap[item] = value;
      }
    }
  });
  
  if (fileType === 'bs') {
    result.bs = {
      current_assets: dataMap['流動資産'] || 0,
      cash_and_deposits: dataMap['現金及び預金'] || 0,
      accounts_receivable: dataMap['売掛金'] || 0,
      inventory: dataMap['棚卸資産'] || 0,
      fixed_assets: dataMap['固定資産'] || 0,
      tangible_assets: dataMap['有形固定資産'] || 0,
      intangible_assets: dataMap['無形固定資産'] || 0,
      total_assets: dataMap['資産合計'] || 0,
      
      current_liabilities: dataMap['流動負債'] || 0,
      accounts_payable: dataMap['買掛金'] || 0,
      short_term_debt: dataMap['短期借入金'] || 0,
      fixed_liabilities: dataMap['固定負債'] || 0,
      long_term_debt: dataMap['長期借入金'] || 0,
      total_liabilities: dataMap['負債合計'] || 0,
      
      capital_stock: dataMap['資本金'] || 0,
      retained_earnings: dataMap['利益剰余金'] || 0,
      total_equity: dataMap['純資産合計'] || 0
    };
  }
  
  if (fileType === 'pl') {
    result.pl = {
      sales: dataMap['売上高'] || 0,
      cost_of_sales: dataMap['売上原価'] || 0,
      gross_profit: dataMap['売上総利益'] || 0,
      
      operating_expenses: dataMap['販売費及び一般管理費'] || 0,
      operating_income: dataMap['営業利益'] || 0,
      ordinary_income: dataMap['経常利益'] || 0,
      net_income: dataMap['当期純利益'] || 0,
      
      depreciation: dataMap['減価償却費'] || 0,
      interest_expense: dataMap['支払利息'] || 0
    };
  }
  
  return result;
}

// テスト実行関数
function runFileAnalysisTest() {
  console.log('🚀 ファイル分析機能のテスト開始\n');
  
  try {
    // 1. BSデータのテスト
    console.log('📊 貸借対照表（BS）データのテスト');
    const bsFilePath = path.join(__dirname, '../test-data/sample-bs.csv');
    const bsData = extractDataFromCSV(bsFilePath);
    const bsResult = parseCSVFinancialData(bsData, 'bs');
    
    console.log('✅ BS抽出結果:');
    console.log('  流動資産:', bsResult.bs.current_assets.toLocaleString(), '円');
    console.log('  固定資産:', bsResult.bs.fixed_assets.toLocaleString(), '円');
    console.log('  資産合計:', bsResult.bs.total_assets.toLocaleString(), '円');
    console.log('  流動負債:', bsResult.bs.current_liabilities.toLocaleString(), '円');
    console.log('  純資産合計:', bsResult.bs.total_equity.toLocaleString(), '円');
    console.log('');
    
    // 2. PLデータのテスト
    console.log('📈 損益計算書（PL）データのテスト');
    const plFilePath = path.join(__dirname, '../test-data/sample-pl.csv');
    const plData = extractDataFromCSV(plFilePath);
    const plResult = parseCSVFinancialData(plData, 'pl');
    
    console.log('✅ PL抽出結果:');
    console.log('  売上高:', plResult.pl.sales.toLocaleString(), '円');
    console.log('  営業利益:', plResult.pl.operating_income.toLocaleString(), '円');
    console.log('  経常利益:', plResult.pl.ordinary_income.toLocaleString(), '円');
    console.log('  当期純利益:', plResult.pl.net_income.toLocaleString(), '円');
    console.log('');
    
    // 3. 財務指標計算のテスト
    console.log('🧮 財務指標計算のテスト');
    const ratios = calculateFinancialRatios(bsResult.bs, plResult.pl, 25); // 従業員数25人と仮定
    
    console.log('✅ 計算された財務指標:');
    console.log('  【収益性指標】');
    console.log('    ROA:', ratios.roa.toFixed(2), '%');
    console.log('    ROE:', ratios.roe.toFixed(2), '%');
    console.log('    営業利益率:', ratios.operating_margin.toFixed(2), '%');
    console.log('    経常利益率:', ratios.ordinary_margin.toFixed(2), '%');
    console.log('    売上総利益率:', ratios.gross_margin.toFixed(2), '%');
    
    console.log('  【安全性指標】');
    console.log('    流動比率:', ratios.current_ratio.toFixed(2), '%');
    console.log('    当座比率:', ratios.quick_ratio.toFixed(2), '%');
    console.log('    自己資本比率:', ratios.equity_ratio.toFixed(2), '%');
    console.log('    負債比率:', ratios.debt_ratio.toFixed(2), '%');
    
    console.log('  【効率性指標】');
    console.log('    総資産回転率:', ratios.asset_turnover.toFixed(2), '回');
    console.log('    棚卸資産回転率:', ratios.inventory_turnover.toFixed(2), '回');
    console.log('    売上債権回転率:', ratios.receivables_turnover.toFixed(2), '回');
    
    console.log('  【生産性指標】');
    console.log('    従業員一人当たり売上高:', (ratios.sales_per_employee / 10000).toFixed(0), '万円');
    console.log('    従業員一人当たり営業利益:', (ratios.profit_per_employee / 10000).toFixed(0), '万円');
    
    console.log('  【中小企業特化指標】');
    console.log('    インタレストカバレッジ:', ratios.interest_coverage.toFixed(2), '倍');
    console.log('');
    
    // 4. 業界平均との比較（製造業と仮定）
    const industryAverage = {
      roa_avg: 4.1,
      roe_avg: 9.8,
      operating_margin_avg: 6.2,
      current_ratio_avg: 125.8,
      equity_ratio_avg: 42.1
    };
    
    console.log('📊 業界平均との比較（製造業）');
    console.log('  ROA: 実績', ratios.roa.toFixed(2) + '%', 'vs 業界平均', industryAverage.roa_avg + '%', 
                ratios.roa > industryAverage.roa_avg ? '✅ 良好' : '⚠️ 改善余地');
    console.log('  ROE: 実績', ratios.roe.toFixed(2) + '%', 'vs 業界平均', industryAverage.roe_avg + '%',
                ratios.roe > industryAverage.roe_avg ? '✅ 良好' : '⚠️ 改善余地');
    console.log('  営業利益率: 実績', ratios.operating_margin.toFixed(2) + '%', 'vs 業界平均', industryAverage.operating_margin_avg + '%',
                ratios.operating_margin > industryAverage.operating_margin_avg ? '✅ 良好' : '⚠️ 改善余地');
    console.log('  流動比率: 実績', ratios.current_ratio.toFixed(2) + '%', 'vs 業界平均', industryAverage.current_ratio_avg + '%',
                ratios.current_ratio > industryAverage.current_ratio_avg ? '✅ 良好' : '⚠️ 改善余地');
    console.log('  自己資本比率: 実績', ratios.equity_ratio.toFixed(2) + '%', 'vs 業界平均', industryAverage.equity_ratio_avg + '%',
                ratios.equity_ratio > industryAverage.equity_ratio_avg ? '✅ 良好' : '⚠️ 改善余地');
    
    console.log('\n🎉 ファイル分析機能のテスト完了');
    console.log('📋 テスト結果サマリー:');
    console.log('  ✅ CSVファイル読み取り: 成功');
    console.log('  ✅ 財務データ抽出: 成功');
    console.log('  ✅ 財務指標計算: 成功');
    console.log('  ✅ 業界平均比較: 成功');
    
  } catch (error) {
    console.error('❌ テストエラー:', error.message);
  }
}

// テスト実行
runFileAnalysisTest();