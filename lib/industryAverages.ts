// 業界平均データ（中小企業向け）
export interface IndustryAverages {
  industry_code: string;
  industry_name: string;
  
  // 収益性指標の業界平均
  roa_avg: number;           // ROA平均値
  roe_avg: number;           // ROE平均値
  operating_margin_avg: number;  // 営業利益率平均値
  ordinary_margin_avg: number;   // 経常利益率平均値
  gross_margin_avg: number;      // 売上総利益率平均値
  
  // 安全性指標の業界平均
  current_ratio_avg: number;     // 流動比率平均値
  equity_ratio_avg: number;      // 自己資本比率平均値
  debt_ratio_avg: number;        // 負債比率平均値
  
  // 効率性指標の業界平均
  asset_turnover_avg: number;    // 総資産回転率平均値
  inventory_turnover_avg: number; // 棚卸資産回転率平均値
  receivables_turnover_avg: number; // 売上債権回転率平均値
  
  // 生産性指標の業界平均
  sales_per_employee_avg: number;    // 従業員一人当たり売上高平均値
  profit_per_employee_avg: number;   // 従業員一人当たり営業利益平均値
  
  // 中小企業特有の指標
  working_capital_ratio_avg: number; // 運転資本回転率平均値
  interest_coverage_avg: number;     // インタレストカバレッジ平均値
}

// 日本の主要業界の平均データ（中小企業庁データ等を基に設定）
export const INDUSTRY_AVERAGES: IndustryAverages[] = [
  {
    industry_code: 'D',
    industry_name: '建設業',
    roa_avg: 3.2,
    roe_avg: 8.5,
    operating_margin_avg: 4.8,
    ordinary_margin_avg: 4.2,
    gross_margin_avg: 18.5,
    current_ratio_avg: 115.2,
    equity_ratio_avg: 38.7,
    debt_ratio_avg: 61.3,
    asset_turnover_avg: 0.76,
    inventory_turnover_avg: 8.2,
    receivables_turnover_avg: 6.4,
    sales_per_employee_avg: 2850,
    profit_per_employee_avg: 137,
    working_capital_ratio_avg: 5.8,
    interest_coverage_avg: 12.3
  },
  {
    industry_code: 'E',
    industry_name: '製造業',
    roa_avg: 4.1,
    roe_avg: 9.8,
    operating_margin_avg: 6.2,
    ordinary_margin_avg: 5.8,
    gross_margin_avg: 22.4,
    current_ratio_avg: 125.8,
    equity_ratio_avg: 42.1,
    debt_ratio_avg: 57.9,
    asset_turnover_avg: 0.66,
    inventory_turnover_avg: 7.5,
    receivables_turnover_avg: 8.1,
    sales_per_employee_avg: 3200,
    profit_per_employee_avg: 198,
    working_capital_ratio_avg: 6.2,
    interest_coverage_avg: 15.7
  },
  {
    industry_code: 'I',
    industry_name: '卸売業・小売業',
    roa_avg: 2.8,
    roe_avg: 7.2,
    operating_margin_avg: 3.1,
    ordinary_margin_avg: 2.8,
    gross_margin_avg: 28.6,
    current_ratio_avg: 108.5,
    equity_ratio_avg: 39.2,
    debt_ratio_avg: 60.8,
    asset_turnover_avg: 0.91,
    inventory_turnover_avg: 12.3,
    receivables_turnover_avg: 15.2,
    sales_per_employee_avg: 4500,
    profit_per_employee_avg: 139,
    working_capital_ratio_avg: 8.7,
    interest_coverage_avg: 9.8
  },
  {
    industry_code: 'M',
    industry_name: '宿泊業・飲食サービス業',
    roa_avg: 2.1,
    roe_avg: 5.8,
    operating_margin_avg: 2.8,
    ordinary_margin_avg: 2.3,
    gross_margin_avg: 65.2,
    current_ratio_avg: 95.3,
    equity_ratio_avg: 36.1,
    debt_ratio_avg: 63.9,
    asset_turnover_avg: 0.75,
    inventory_turnover_avg: 45.2,
    receivables_turnover_avg: 52.1,
    sales_per_employee_avg: 1850,
    profit_per_employee_avg: 52,
    working_capital_ratio_avg: 12.5,
    interest_coverage_avg: 7.2
  },
  {
    industry_code: 'G',
    industry_name: '情報通信業',
    roa_avg: 5.2,
    roe_avg: 12.4,
    operating_margin_avg: 8.7,
    ordinary_margin_avg: 8.1,
    gross_margin_avg: 45.3,
    current_ratio_avg: 142.6,
    equity_ratio_avg: 41.8,
    debt_ratio_avg: 58.2,
    asset_turnover_avg: 0.59,
    inventory_turnover_avg: 18.5,
    receivables_turnover_avg: 6.8,
    sales_per_employee_avg: 2650,
    profit_per_employee_avg: 230,
    working_capital_ratio_avg: 4.2,
    interest_coverage_avg: 18.9
  },
  {
    industry_code: 'L',
    industry_name: '学術研究・専門・技術サービス業',
    roa_avg: 4.5,
    roe_avg: 10.2,
    operating_margin_avg: 7.1,
    ordinary_margin_avg: 6.8,
    gross_margin_avg: 52.1,
    current_ratio_avg: 135.2,
    equity_ratio_avg: 44.1,
    debt_ratio_avg: 55.9,
    asset_turnover_avg: 0.63,
    inventory_turnover_avg: 25.0,
    receivables_turnover_avg: 7.2,
    sales_per_employee_avg: 2350,
    profit_per_employee_avg: 167,
    working_capital_ratio_avg: 5.1,
    interest_coverage_avg: 16.3
  },
  {
    industry_code: 'H',
    industry_name: '運輸業・郵便業',
    roa_avg: 3.0,
    roe_avg: 7.8,
    operating_margin_avg: 4.2,
    ordinary_margin_avg: 3.8,
    gross_margin_avg: 38.5,
    current_ratio_avg: 98.7,
    equity_ratio_avg: 38.5,
    debt_ratio_avg: 61.5,
    asset_turnover_avg: 0.71,
    inventory_turnover_avg: 85.2,
    receivables_turnover_avg: 18.7,
    sales_per_employee_avg: 2100,
    profit_per_employee_avg: 88,
    working_capital_ratio_avg: 7.8,
    interest_coverage_avg: 11.5
  },
  {
    industry_code: 'T',
    industry_name: 'その他',
    roa_avg: 3.5,
    roe_avg: 8.2,
    operating_margin_avg: 5.0,
    ordinary_margin_avg: 4.5,
    gross_margin_avg: 30.0,
    current_ratio_avg: 120.0,
    equity_ratio_avg: 40.0,
    debt_ratio_avg: 60.0,
    asset_turnover_avg: 0.70,
    inventory_turnover_avg: 10.0,
    receivables_turnover_avg: 10.0,
    sales_per_employee_avg: 2500,
    profit_per_employee_avg: 125,
    working_capital_ratio_avg: 6.5,
    interest_coverage_avg: 12.0
  }
];

// 業界平均データを取得
export function getIndustryAverage(industryCode: string): IndustryAverages | null {
  return INDUSTRY_AVERAGES.find(avg => avg.industry_code === industryCode) || 
         INDUSTRY_AVERAGES.find(avg => avg.industry_code === 'T'); // デフォルトは「その他」
}

// 指標と業界平均を比較
export function compareWithIndustryAverage(
  value: number, 
  industryAverage: number, 
  higherIsBetter: boolean = true
): {
  status: 'excellent' | 'good' | 'average' | 'below_average' | 'poor';
  difference: number;
  percentile: number;
} {
  const difference = value - industryAverage;
  const percentDifference = (difference / industryAverage) * 100;
  
  let status: 'excellent' | 'good' | 'average' | 'below_average' | 'poor';
  let percentile: number;
  
  if (higherIsBetter) {
    if (percentDifference >= 20) {
      status = 'excellent';
      percentile = 90;
    } else if (percentDifference >= 10) {
      status = 'good';
      percentile = 75;
    } else if (percentDifference >= -5) {
      status = 'average';
      percentile = 50;
    } else if (percentDifference >= -15) {
      status = 'below_average';
      percentile = 25;
    } else {
      status = 'poor';
      percentile = 10;
    }
  } else {
    // 低い方が良い指標（負債比率等）
    if (percentDifference <= -20) {
      status = 'excellent';
      percentile = 90;
    } else if (percentDifference <= -10) {
      status = 'good';
      percentile = 75;
    } else if (percentDifference <= 5) {
      status = 'average';
      percentile = 50;
    } else if (percentDifference <= 15) {
      status = 'below_average';
      percentile = 25;
    } else {
      status = 'poor';
      percentile = 10;
    }
  }
  
  return { status, difference, percentile };
}