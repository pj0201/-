// 業界平均データと同業種比較機能

export interface IndustryBenchmarkData {
  categoryId: number;
  categoryName: string;
  categoryCode: string;
  level: 'major' | 'middle' | 'minor';
  
  // 収益性指標
  totalAssetTurnover?: number;      // 総資産回転率
  currentRatio?: number;            // 流動比率
  debtToEquityRatio?: number;       // 負債比率
  equityRatio?: number;             // 自己資本比率
  returnOnAssets?: number;          // ROA
  returnOnEquity?: number;          // ROE
  netProfitMargin?: number;         // 売上高純利益率
  grossProfitMargin?: number;       // 売上総利益率
  operatingMargin?: number;         // 営業利益率
  
  // 安全性指標
  quickRatio?: number;              // 当座比率
  interestCoverageRatio?: number;   // インタレストカバレッジレシオ
  debtToAssetRatio?: number;        // 総資産負債比率
  
  // 効率性指標
  inventoryTurnover?: number;       // 棚卸資産回転率
  receivablesTurnover?: number;     // 売上債権回転率
  payablesTurnover?: number;        // 仕入債務回転率
  
  // SME特化指標
  laborProductivity?: number;       // 労働生産性
  salesPerEmployee?: number;        // 従業員一人当たり売上高
  profitPerEmployee?: number;       // 従業員一人当たり利益
  
  // データソース情報
  sampleSize?: number;              // サンプル数
  dataYear?: number;                // データ年度
  lastUpdated?: string;             // 最終更新日
}

export interface ComparisonResult {
  companyValue: number;
  industryAverage: number;
  difference: number;
  percentageDifference: number;
  ranking: 'excellent' | 'good' | 'average' | 'below_average' | 'poor';
  comment: string;
}

export interface IndustryComparison {
  categoryInfo: {
    id: number;
    name: string;
    code: string;
    level: string;
  };
  metrics: {
    [key: string]: ComparisonResult;
  };
  overallScore: number;
  recommendations: string[];
}

// 業界平均データ（実際のデータに基づく概算値）
const industryBenchmarks: IndustryBenchmarkData[] = [
  // 大分類：建設業
  {
    categoryId: 1,
    categoryName: '建設業',
    categoryCode: 'D',
    level: 'major',
    totalAssetTurnover: 1.2,
    currentRatio: 1.15,
    debtToEquityRatio: 2.8,
    equityRatio: 0.26,
    returnOnAssets: 3.2,
    returnOnEquity: 12.5,
    netProfitMargin: 2.8,
    grossProfitMargin: 18.5,
    operatingMargin: 4.2,
    quickRatio: 0.95,
    interestCoverageRatio: 8.5,
    debtToAssetRatio: 0.74,
    inventoryTurnover: 12.5,
    receivablesTurnover: 6.8,
    payablesTurnover: 8.2,
    laborProductivity: 950,
    salesPerEmployee: 850,
    profitPerEmployee: 24,
    sampleSize: 1250,
    dataYear: 2023,
    lastUpdated: '2024-03-01'
  },
  
  // 大分類：製造業
  {
    categoryId: 2,
    categoryName: '製造業',
    categoryCode: 'E',
    level: 'major',
    totalAssetTurnover: 1.0,
    currentRatio: 1.35,
    debtToEquityRatio: 1.8,
    equityRatio: 0.36,
    returnOnAssets: 4.8,
    returnOnEquity: 13.2,
    netProfitMargin: 4.5,
    grossProfitMargin: 22.8,
    operatingMargin: 6.2,
    quickRatio: 1.1,
    interestCoverageRatio: 12.5,
    debtToAssetRatio: 0.64,
    inventoryTurnover: 8.5,
    receivablesTurnover: 7.2,
    payablesTurnover: 9.5,
    laborProductivity: 1200,
    salesPerEmployee: 1150,
    profitPerEmployee: 52,
    sampleSize: 2150,
    dataYear: 2023,
    lastUpdated: '2024-03-01'
  },
  
  // 大分類：情報通信業
  {
    categoryId: 3,
    categoryName: '情報通信業',
    categoryCode: 'G',
    level: 'major',
    totalAssetTurnover: 1.4,
    currentRatio: 1.8,
    debtToEquityRatio: 1.2,
    equityRatio: 0.45,
    returnOnAssets: 8.5,
    returnOnEquity: 18.8,
    netProfitMargin: 6.2,
    grossProfitMargin: 28.5,
    operatingMargin: 8.8,
    quickRatio: 1.7,
    interestCoverageRatio: 25.5,
    debtToAssetRatio: 0.55,
    inventoryTurnover: 45.0,
    receivablesTurnover: 8.5,
    payablesTurnover: 12.8,
    laborProductivity: 1850,
    salesPerEmployee: 1650,
    profitPerEmployee: 102,
    sampleSize: 850,
    dataYear: 2023,
    lastUpdated: '2024-03-01'
  },
  
  // 大分類：卸売業・小売業
  {
    categoryId: 4,
    categoryName: '卸売業・小売業',
    categoryCode: 'I',
    level: 'major',
    totalAssetTurnover: 2.2,
    currentRatio: 1.25,
    debtToEquityRatio: 2.5,
    equityRatio: 0.29,
    returnOnAssets: 3.8,
    returnOnEquity: 13.1,
    netProfitMargin: 1.7,
    grossProfitMargin: 12.5,
    operatingMargin: 2.8,
    quickRatio: 0.85,
    interestCoverageRatio: 9.5,
    debtToAssetRatio: 0.71,
    inventoryTurnover: 18.5,
    receivablesTurnover: 12.8,
    payablesTurnover: 15.2,
    laborProductivity: 780,
    salesPerEmployee: 720,
    profitPerEmployee: 12,
    sampleSize: 1850,
    dataYear: 2023,
    lastUpdated: '2024-03-01'
  },
  
  // 大分類：宿泊業・飲食サービス業
  {
    categoryId: 5,
    categoryName: '宿泊業・飲食サービス業',
    categoryCode: 'M',
    level: 'major',
    totalAssetTurnover: 1.8,
    currentRatio: 0.95,
    debtToEquityRatio: 3.5,
    equityRatio: 0.22,
    returnOnAssets: 2.8,
    returnOnEquity: 12.8,
    netProfitMargin: 1.5,
    grossProfitMargin: 65.5,
    operatingMargin: 3.2,
    quickRatio: 0.75,
    interestCoverageRatio: 6.5,
    debtToAssetRatio: 0.78,
    inventoryTurnover: 85.0,
    receivablesTurnover: 25.5,
    payablesTurnover: 18.5,
    laborProductivity: 520,
    salesPerEmployee: 485,
    profitPerEmployee: 7,
    sampleSize: 950,
    dataYear: 2023,
    lastUpdated: '2024-03-01'
  },
  
  // 中分類：食料品製造業
  {
    categoryId: 21,
    categoryName: '食料品製造業',
    categoryCode: 'E09',
    level: 'middle',
    totalAssetTurnover: 1.1,
    currentRatio: 1.4,
    debtToEquityRatio: 1.7,
    equityRatio: 0.37,
    returnOnAssets: 4.2,
    returnOnEquity: 11.5,
    netProfitMargin: 3.8,
    grossProfitMargin: 25.2,
    operatingMargin: 5.5,
    quickRatio: 1.0,
    interestCoverageRatio: 11.8,
    debtToAssetRatio: 0.63,
    inventoryTurnover: 12.5,
    receivablesTurnover: 9.2,
    payablesTurnover: 11.5,
    laborProductivity: 950,
    salesPerEmployee: 890,
    profitPerEmployee: 34,
    sampleSize: 450,
    dataYear: 2023,
    lastUpdated: '2024-03-01'
  },
  
  // 中分類：金属製品製造業
  {
    categoryId: 24,
    categoryName: '金属製品製造業',
    categoryCode: 'E24',
    level: 'middle',
    totalAssetTurnover: 0.95,
    currentRatio: 1.5,
    debtToEquityRatio: 1.9,
    equityRatio: 0.34,
    returnOnAssets: 4.5,
    returnOnEquity: 13.2,
    netProfitMargin: 4.7,
    grossProfitMargin: 28.5,
    operatingMargin: 6.8,
    quickRatio: 1.2,
    interestCoverageRatio: 10.5,
    debtToAssetRatio: 0.66,
    inventoryTurnover: 6.8,
    receivablesTurnover: 6.5,
    payablesTurnover: 8.2,
    laborProductivity: 1180,
    salesPerEmployee: 1120,
    profitPerEmployee: 53,
    sampleSize: 320,
    dataYear: 2023,
    lastUpdated: '2024-03-01'
  },
  
  // 中分類：情報サービス業
  {
    categoryId: 33,
    categoryName: '情報サービス業',
    categoryCode: 'G39',
    level: 'middle',
    totalAssetTurnover: 1.6,
    currentRatio: 1.9,
    debtToEquityRatio: 1.1,
    equityRatio: 0.48,
    returnOnAssets: 9.2,
    returnOnEquity: 19.2,
    netProfitMargin: 5.8,
    grossProfitMargin: 32.5,
    operatingMargin: 9.5,
    quickRatio: 1.8,
    interestCoverageRatio: 28.5,
    debtToAssetRatio: 0.52,
    inventoryTurnover: 95.0,
    receivablesTurnover: 7.8,
    payablesTurnover: 14.5,
    laborProductivity: 2150,
    salesPerEmployee: 1950,
    profitPerEmployee: 113,
    sampleSize: 280,
    dataYear: 2023,
    lastUpdated: '2024-03-01'
  }
];

export function getBenchmarkData(categoryId: number): IndustryBenchmarkData | null {
  return industryBenchmarks.find(benchmark => benchmark.categoryId === categoryId) || null;
}

export function calculateRanking(value: number, industryAvg: number, isHigherBetter: boolean = true): 'excellent' | 'good' | 'average' | 'below_average' | 'poor' {
  const ratio = value / industryAvg;
  
  if (isHigherBetter) {
    if (ratio >= 1.2) return 'excellent';
    if (ratio >= 1.1) return 'good';
    if (ratio >= 0.9) return 'average';
    if (ratio >= 0.8) return 'below_average';
    return 'poor';
  } else {
    if (ratio <= 0.8) return 'excellent';
    if (ratio <= 0.9) return 'good';
    if (ratio <= 1.1) return 'average';
    if (ratio <= 1.2) return 'below_average';
    return 'poor';
  }
}

export function generateComment(ranking: string, metricName: string): string {
  const comments = {
    excellent: `${metricName}は業界平均を大幅に上回っており、優秀な水準です。`,
    good: `${metricName}は業界平均を上回っており、良好な水準です。`,
    average: `${metricName}は業界平均程度であり、標準的な水準です。`,
    below_average: `${metricName}は業界平均を下回っており、改善の余地があります。`,
    poor: `${metricName}は業界平均を大幅に下回っており、重点的な改善が必要です。`
  };
  return comments[ranking as keyof typeof comments] || '評価できませんでした。';
}

export function compareWithIndustry(
  companyData: { [key: string]: number },
  categoryId: number
): IndustryComparison | null {
  const benchmark = getBenchmarkData(categoryId);
  if (!benchmark) return null;

  const metrics: { [key: string]: ComparisonResult } = {};
  let totalScore = 0;
  let metricCount = 0;

  // 指標ごとの比較（高い方が良い指標）
  const higherBetterMetrics = [
    'totalAssetTurnover', 'currentRatio', 'equityRatio', 'returnOnAssets', 
    'returnOnEquity', 'netProfitMargin', 'grossProfitMargin', 'operatingMargin',
    'quickRatio', 'interestCoverageRatio', 'inventoryTurnover', 'receivablesTurnover',
    'payablesTurnover', 'laborProductivity', 'salesPerEmployee', 'profitPerEmployee'
  ];

  // 低い方が良い指標
  const lowerBetterMetrics = ['debtToEquityRatio', 'debtToAssetRatio'];

  [...higherBetterMetrics, ...lowerBetterMetrics].forEach(metric => {
    const companyValue = companyData[metric];
    const industryAverage = benchmark[metric as keyof IndustryBenchmarkData] as number;
    
    if (companyValue !== undefined && industryAverage !== undefined) {
      const isHigherBetter = higherBetterMetrics.includes(metric);
      const difference = companyValue - industryAverage;
      const percentageDifference = ((companyValue - industryAverage) / industryAverage) * 100;
      const ranking = calculateRanking(companyValue, industryAverage, isHigherBetter);
      
      metrics[metric] = {
        companyValue,
        industryAverage,
        difference,
        percentageDifference,
        ranking,
        comment: generateComment(ranking, metric)
      };

      // スコア計算
      const rankingScores = { excellent: 5, good: 4, average: 3, below_average: 2, poor: 1 };
      totalScore += rankingScores[ranking];
      metricCount++;
    }
  });

  const overallScore = metricCount > 0 ? Math.round((totalScore / metricCount) * 20) : 0;

  // 改善提案の生成
  const recommendations: string[] = [];
  Object.entries(metrics).forEach(([metric, result]) => {
    if (result.ranking === 'poor' || result.ranking === 'below_average') {
      switch (metric) {
        case 'currentRatio':
          recommendations.push('流動資産の増加または流動負債の減少により、短期支払能力の改善を図る');
          break;
        case 'debtToEquityRatio':
          recommendations.push('自己資本の増強や有利子負債の削減により、財務安全性の向上を図る');
          break;
        case 'returnOnAssets':
          recommendations.push('資産効率の改善や収益性の向上により、ROAの改善を図る');
          break;
        case 'inventoryTurnover':
          recommendations.push('在庫管理の効率化により、棚卸資産回転率の改善を図る');
          break;
        case 'laborProductivity':
          recommendations.push('業務効率化や従業員スキル向上により、労働生産性の改善を図る');
          break;
        default:
          recommendations.push(`${metric}の改善に注力する`);
      }
    }
  });

  return {
    categoryInfo: {
      id: benchmark.categoryId,
      name: benchmark.categoryName,
      code: benchmark.categoryCode,
      level: benchmark.level
    },
    metrics,
    overallScore,
    recommendations: recommendations.slice(0, 5) // 最大5つの提案
  };
}

export function getAvailableBenchmarks(): IndustryBenchmarkData[] {
  return industryBenchmarks;
}