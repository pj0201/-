import { FinancialMetric } from '../types';

// 収益性指標
export const PROFITABILITY_METRICS: FinancialMetric[] = [
  { 
    id: 'roe', 
    name: 'ROE（自己資本利益率）', 
    category: 'profitability',
    values: { '2025': 8.9, '2024': 8.5, '2023': 7.2, '2022': 6.9, '2021': 6.2 },
    benchmarks: { '2025': 7.5, '2024': 7.2, '2023': 7.0, '2022': 6.8, '2021': 6.5 },
    format: 'percent',
    unit: '%',
    description: '自己資本に対する当期純利益の比率',
    thresholdDirection: 'above'
  },
  { 
    id: 'roa', 
    name: 'ROA（総資産利益率）', 
    category: 'profitability',
    values: { '2025': 4.2, '2024': 4.1, '2023': 3.8, '2022': 3.5, '2021': 3.2 },
    benchmarks: { '2025': 3.8, '2024': 3.7, '2023': 3.6, '2022': 3.5, '2021': 3.4 },
    format: 'percent',
    unit: '%',
    description: '総資産に対する当期純利益の比率',
    thresholdDirection: 'above'
  },
  { 
    id: 'operating_margin', 
    name: '営業利益率', 
    category: 'profitability',
    values: { '2025': 15.2, '2024': 14.8, '2023': 13.9, '2022': 12.5, '2021': 11.8 },
    benchmarks: { '2025': 12.0, '2024': 11.8, '2023': 11.5, '2022': 11.2, '2021': 11.0 },
    format: 'percent',
    unit: '%',
    description: '売上高に対する営業利益の比率',
    thresholdDirection: 'above'
  },
  { 
    id: 'net_margin', 
    name: '純利益率', 
    category: 'profitability',
    values: { '2025': 8.5, '2024': 8.1, '2023': 7.5, '2022': 6.9, '2021': 6.5 },
    benchmarks: { '2025': 7.0, '2024': 6.8, '2023': 6.5, '2022': 6.3, '2021': 6.0 },
    format: 'percent',
    unit: '%',
    description: '売上高に対する当期純利益の比率',
    thresholdDirection: 'above'
  },
  { 
    id: 'ebitda_margin', 
    name: 'EBITDAマージン', 
    category: 'profitability',
    values: { '2025': 20.5, '2024': 19.8, '2023': 18.5, '2022': 17.2, '2021': 16.5 },
    benchmarks: { '2025': 18.0, '2024': 17.5, '2023': 17.0, '2022': 16.5, '2021': 16.0 },
    format: 'percent',
    unit: '%',
    description: '売上高に対するEBITDAの比率',
    thresholdDirection: 'above'
  },
  { 
    id: 'roi', 
    name: 'ROI（投下資本利益率）', 
    category: 'profitability',
    values: { '2025': 12.5, '2024': 11.8, '2023': 10.5, '2022': 9.8, '2021': 9.2 },
    benchmarks: { '2025': 10.0, '2024': 9.8, '2023': 9.5, '2022': 9.3, '2021': 9.0 },
    format: 'percent',
    unit: '%',
    description: '投下資本に対する利益の比率',
    thresholdDirection: 'above'
  }
];

// 安全性指標
export const SAFETY_METRICS: FinancialMetric[] = [
  { 
    id: 'equity_ratio', 
    name: '自己資本比率', 
    category: 'safety',
    values: { '2025': 42.5, '2024': 41.8, '2023': 40.2, '2022': 38.9, '2021': 37.5 },
    benchmarks: { '2025': 40.0, '2024': 40.0, '2023': 40.0, '2022': 40.0, '2021': 40.0 },
    format: 'percent',
    unit: '%',
    description: '総資産に対する自己資本の比率',
    thresholdDirection: 'above'
  },
  { 
    id: 'current_ratio', 
    name: '流動比率', 
    category: 'safety',
    values: { '2025': 185.3, '2024': 178.5, '2023': 170.2, '2022': 165.8, '2021': 160.4 },
    benchmarks: { '2025': 200.0, '2024': 200.0, '2023': 200.0, '2022': 200.0, '2021': 200.0 },
    format: 'percent',
    unit: '%',
    description: '流動負債に対する流動資産の比率',
    thresholdDirection: 'above'
  },
  { 
    id: 'quick_ratio', 
    name: '当座比率', 
    category: 'safety',
    values: { '2025': 120.5, '2024': 115.8, '2023': 110.2, '2022': 105.6, '2021': 102.3 },
    benchmarks: { '2025': 100.0, '2024': 100.0, '2023': 100.0, '2022': 100.0, '2021': 100.0 },
    format: 'percent',
    unit: '%',
    description: '流動負債に対する当座資産の比率',
    thresholdDirection: 'above'
  },
  { 
    id: 'debt_equity_ratio', 
    name: '負債資本倍率', 
    category: 'safety',
    values: { '2025': 1.2, '2024': 1.3, '2023': 1.4, '2022': 1.5, '2021': 1.6 },
    benchmarks: { '2025': 1.5, '2024': 1.5, '2023': 1.5, '2022': 1.5, '2021': 1.5 },
    format: 'number',
    unit: '倍',
    description: '自己資本に対する負債の比率',
    thresholdDirection: 'below'
  },
  { 
    id: 'fixed_longterm_ratio', 
    name: '固定長期適合率', 
    category: 'safety',
    values: { '2025': 90.5, '2024': 92.3, '2023': 94.8, '2022': 96.5, '2021': 98.2 },
    benchmarks: { '2025': 100.0, '2024': 100.0, '2023': 100.0, '2022': 100.0, '2021': 100.0 },
    format: 'percent',
    unit: '%',
    description: '固定資産を自己資本と固定負債で資金調達している割合',
    thresholdDirection: 'below'
  }
];

// 効率性指標
export const EFFICIENCY_METRICS: FinancialMetric[] = [
  { 
    id: 'asset_turnover', 
    name: '総資産回転率', 
    category: 'efficiency',
    values: { '2025': 1.2, '2024': 1.15, '2023': 1.1, '2022': 1.05, '2021': 1.0 },
    benchmarks: { '2025': 1.0, '2024': 1.0, '2023': 1.0, '2022': 1.0, '2021': 1.0 },
    format: 'number',
    unit: '回',
    description: '総資産に対する売上高の比率',
    thresholdDirection: 'above'
  },
  { 
    id: 'inventory_turnover', 
    name: '棚卸回転率', 
    category: 'efficiency',
    values: { '2025': 8.5, '2024': 8.1, '2023': 7.8, '2022': 7.5, '2021': 7.2 },
    benchmarks: { '2025': 8.0, '2024': 8.0, '2023': 8.0, '2022': 8.0, '2021': 8.0 },
    format: 'number',
    unit: '回',
    description: '平均棚卸資産に対する売上原価の比率',
    thresholdDirection: 'above'
  },
  { 
    id: 'receivables_turnover', 
    name: '売上債権回転率', 
    category: 'efficiency',
    values: { '2025': 9.8, '2024': 9.5, '2023': 9.2, '2022': 8.9, '2021': 8.5 },
    benchmarks: { '2025': 9.0, '2024': 9.0, '2023': 9.0, '2022': 9.0, '2021': 9.0 },
    format: 'number',
    unit: '回',
    description: '売上債権に対する売上高の比率',
    thresholdDirection: 'above'
  },
  { 
    id: 'payables_turnover', 
    name: '買入債務回転率', 
    category: 'efficiency',
    values: { '2025': 7.2, '2024': 7.0, '2023': 6.8, '2022': 6.5, '2021': 6.2 },
    benchmarks: { '2025': 6.0, '2024': 6.0, '2023': 6.0, '2022': 6.0, '2021': 6.0 },
    format: 'number',
    unit: '回',
    description: '買入債務に対する売上原価の比率',
    thresholdDirection: 'above'
  },
  { 
    id: 'break_even_point', 
    name: '損益分岐点', 
    category: 'efficiency',
    values: { '2025': 780000, '2024': 760000, '2023': 740000, '2022': 720000, '2021': 700000 },
    benchmarks: { '2025': 750000, '2024': 740000, '2023': 730000, '2022': 720000, '2021': 710000 },
    format: 'currency',
    unit: '千円',
    description: '利益がゼロになる売上高',
    thresholdDirection: 'below'
  }
];

// 成長性指標
export const GROWTH_METRICS: FinancialMetric[] = [
  { 
    id: 'sales_growth', 
    name: '売上高成長率', 
    category: 'growth',
    values: { '2025': 8.5, '2024': 7.8, '2023': 6.5, '2022': 5.2, '2021': 4.8 },
    benchmarks: { '2025': 5.0, '2024': 5.0, '2023': 5.0, '2022': 5.0, '2021': 5.0 },
    format: 'percent',
    unit: '%',
    description: '前年比の売上高増加率',
    thresholdDirection: 'above'
  },
  { 
    id: 'profit_growth', 
    name: '利益成長率', 
    category: 'growth',
    values: { '2025': 10.5, '2024': 9.8, '2023': 8.5, '2022': 7.2, '2021': 6.5 },
    benchmarks: { '2025': 8.0, '2024': 8.0, '2023': 8.0, '2022': 8.0, '2021': 8.0 },
    format: 'percent',
    unit: '%',
    description: '前年比の純利益増加率',
    thresholdDirection: 'above'
  },
  { 
    id: 'assets_growth', 
    name: '総資産成長率', 
    category: 'growth',
    values: { '2025': 6.5, '2024': 6.2, '2023': 5.8, '2022': 5.5, '2021': 5.0 },
    benchmarks: { '2025': 5.0, '2024': 5.0, '2023': 5.0, '2022': 5.0, '2021': 5.0 },
    format: 'percent',
    unit: '%',
    description: '前年比の総資産増加率',
    thresholdDirection: 'above'
  },
  { 
    id: 'equity_growth', 
    name: '自己資本成長率', 
    category: 'growth',
    values: { '2025': 9.2, '2024': 8.8, '2023': 8.5, '2022': 8.0, '2021': 7.5 },
    benchmarks: { '2025': 8.0, '2024': 8.0, '2023': 8.0, '2022': 8.0, '2021': 8.0 },
    format: 'percent',
    unit: '%',
    description: '前年比の自己資本増加率',
    thresholdDirection: 'above'
  },
  { 
    id: 'sales_per_employee', 
    name: '従業員一人当たり売上高', 
    category: 'growth',
    values: { '2025': 35000, '2024': 33500, '2023': 32000, '2022': 30500, '2021': 29000 },
    benchmarks: { '2025': 32000, '2024': 31000, '2023': 30000, '2022': 29000, '2021': 28000 },
    format: 'currency',
    unit: '千円',
    description: '従業員一人当たりの売上高',
    thresholdDirection: 'above'
  },
  { 
    id: 'profit_per_employee', 
    name: '従業員一人当たり利益', 
    category: 'growth',
    values: { '2025': 2800, '2024': 2650, '2023': 2500, '2022': 2350, '2021': 2200 },
    benchmarks: { '2025': 2500, '2024': 2400, '2023': 2300, '2022': 2200, '2021': 2100 },
    format: 'currency',
    unit: '千円',
    description: '従業員一人当たりの純利益',
    thresholdDirection: 'above'
  }
];

// 与信評価指標
export const CREDIT_METRICS: FinancialMetric[] = [
  { 
    id: 'dscr', 
    name: '元利金返済比率（DSCR）', 
    category: 'credit',
    values: { '2025': 1.5, '2024': 1.4, '2023': 1.3, '2022': 1.25, '2021': 1.2 },
    benchmarks: { '2025': 1.25, '2024': 1.25, '2023': 1.25, '2022': 1.25, '2021': 1.25 },
    format: 'number',
    unit: '倍',
    description: '元利金返済に対するキャッシュフローの比率',
    thresholdDirection: 'above'
  },
  { 
    id: 'icr', 
    name: 'インタレストカバレッジレシオ', 
    category: 'credit',
    values: { '2025': 6.0, '2024': 5.5, '2023': 5.0, '2022': 4.5, '2021': 4.0 },
    benchmarks: { '2025': 3.0, '2024': 3.0, '2023': 3.0, '2022': 3.0, '2021': 3.0 },
    format: 'number',
    unit: '倍',
    description: '支払利息に対する営業利益の比率',
    thresholdDirection: 'above'
  },
  { 
    id: 'debt_service_ratio', 
    name: '債務返済年数', 
    category: 'credit',
    values: { '2025': 3.2, '2024': 3.5, '2023': 3.8, '2022': 4.0, '2021': 4.3 },
    benchmarks: { '2025': 3.5, '2024': 3.5, '2023': 3.5, '2022': 3.5, '2021': 3.5 },
    format: 'number',
    unit: '年',
    description: '現在のキャッシュフローで負債を返済するのに必要な年数',
    thresholdDirection: 'below'
  },
  { 
    id: 'fixed_charge_coverage', 
    name: '固定負担カバレッジ率', 
    category: 'credit',
    values: { '2025': 2.8, '2024': 2.6, '2023': 2.4, '2022': 2.2, '2021': 2.0 },
    benchmarks: { '2025': 2.0, '2024': 2.0, '2023': 2.0, '2022': 2.0, '2021': 2.0 },
    format: 'number',
    unit: '倍',
    description: '固定負担（支払利息やリース料など）に対するEBITDAの比率',
    thresholdDirection: 'above'
  }
];

// すべてのメトリクスを一つの配列に結合
export const ALL_METRICS: FinancialMetric[] = [
  ...PROFITABILITY_METRICS,
  ...SAFETY_METRICS,
  ...EFFICIENCY_METRICS,
  ...GROWTH_METRICS,
  ...CREDIT_METRICS
];
