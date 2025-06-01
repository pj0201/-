import React from 'react';
import { FinancialMetric } from '../../types';

interface FinancialTableProps {
  metrics: FinancialMetric[];
  selectedPeriods: string[];
}

const FinancialTable: React.FC<FinancialTableProps> = ({ metrics, selectedPeriods }) => {
  // 指標をカテゴリーごとにグループ化
  const groupedMetrics: { [key: string]: FinancialMetric[] } = {};
  
  metrics.forEach(metric => {
    if (!groupedMetrics[metric.category]) {
      groupedMetrics[metric.category] = [];
    }
    groupedMetrics[metric.category].push(metric);
  });

  // カテゴリーの順序を定義
  const categoryOrder = ['profitability', 'safety', 'efficiency', 'growth', 'credit'];

  // カテゴリー名のマッピング
  const categoryNames: { [key: string]: string } = {
    'profitability': '収益性指標',
    'safety': '安全性指標',
    'efficiency': '効率性指標',
    'growth': '成長性指標',
    'credit': '与信評価指標',
  };

  // カテゴリーごとの色設定
  const categoryColors: { [key: string]: { bg: string, border: string, hover: string } } = {
    'profitability': { bg: 'bg-blue-100', border: 'border-blue-500', hover: 'hover:bg-blue-50' },
    'safety': { bg: 'bg-green-100', border: 'border-green-500', hover: 'hover:bg-green-50' },
    'efficiency': { bg: 'bg-purple-100', border: 'border-purple-500', hover: 'hover:bg-purple-50' },
    'growth': { bg: 'bg-yellow-100', border: 'border-yellow-500', hover: 'hover:bg-yellow-50' },
    'credit': { bg: 'bg-red-100', border: 'border-red-500', hover: 'hover:bg-red-50' },
  };

  // 数値のフォーマット
  const formatValue = (value: number | null, format?: string, unit?: string): string => {
    if (value === null) return '-';
    
    switch (format) {
      case 'percent':
        return `${value.toFixed(1)}%`;
      case 'currency':
        return `${value.toLocaleString()}${unit || '百万円'}`;
      case 'ratio':
        return value.toFixed(2);
      default:
        return `${value.toLocaleString()}${unit || ''}`;
    }
  };

  // 前年比の計算と表示
  const getChangeDisplay = (currentValue: number | null, prevValue: number | null, format?: string, unit?: string, thresholdDirection?: string): JSX.Element | string => {
    if (currentValue === null || prevValue === null) return '-';
    
    const change = currentValue - prevValue;
    const percentChange = prevValue !== 0 ? (change / Math.abs(prevValue) * 100).toFixed(1) : '0.0';
    const isPositive = change > 0;
    const isGood = thresholdDirection === 'above' ? isPositive : !isPositive;
    
    const formattedChange = formatValue(Math.abs(change), format, unit);
    const sign = isPositive ? '+' : '-';
    
    return (
      <div className="flex flex-col">
        <span className={`font-medium ${isGood ? 'text-green-600' : 'text-red-600'}`}>
          {sign} {formattedChange}
        </span>
        <span className={`text-xs ${isGood ? 'text-green-500' : 'text-red-500'}`}>
          ({sign}{percentChange}%)
        </span>
      </div>
    );
  };

  // 値とベンチマークの比較
  const getValueClassNames = (value: number | null, benchmark: number | null, thresholdDirection?: string): string => {
    if (value === null || benchmark === null) return '';
    
    const isAboveBenchmark = value > benchmark;
    const isBelowBenchmark = value < benchmark;
    
    if (thresholdDirection === 'above' && isAboveBenchmark) return 'text-green-700 font-bold';
    if (thresholdDirection === 'above' && isBelowBenchmark) return 'text-red-700 font-bold';
    if (thresholdDirection === 'below' && isBelowBenchmark) return 'text-green-700 font-bold';
    if (thresholdDirection === 'below' && isAboveBenchmark) return 'text-red-700 font-bold';
    
    return '';
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-300 overflow-hidden">
      {/* ヘッダー部分 */}
      <div className="p-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white border-b border-blue-800">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg flex items-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            財務指標分析
          </h3>
          <div className="text-sm">
            表示期間: {selectedPeriods.join('年度, ')}年度
          </div>
        </div>
      </div>

      {/* テーブル部分 */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-300">
          <thead>
            <tr className="bg-gray-100">
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider border-b-2 border-r border-gray-300">
                指標
              </th>
              {selectedPeriods.map(period => (
                <th key={period} scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider border-b-2 border-r border-gray-300">
                  {period}年度
                </th>
              ))}
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider border-b-2 border-r border-gray-300">
                業界平均
              </th>
              {selectedPeriods.length > 1 && (
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider border-b-2 border-gray-300">
                  前年比較
                </th>
              )}
            </tr>
          </thead>
          
          <tbody className="bg-white divide-y divide-gray-200">
            {categoryOrder.filter(category => groupedMetrics[category]?.length > 0).map(category => (
              <React.Fragment key={category}>
                {/* カテゴリヘッダー */}
                <tr className={`${categoryColors[category]?.bg || 'bg-gray-100'} border-t-2 ${categoryColors[category]?.border || 'border-gray-400'}`}>
                  <td colSpan={selectedPeriods.length + 2} className="px-6 py-2 text-left text-sm font-bold text-gray-800">
                    <div className="flex items-center">
                      {/* カテゴリごとのアイコン */}
                      {category === 'profitability' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                        </svg>
                      )}
                      {category === 'safety' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                      {category === 'efficiency' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-purple-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                        </svg>
                      )}
                      {category === 'growth' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-yellow-600" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                      {category === 'credit' && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-600" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                          <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                        </svg>
                      )}
                      {categoryNames[category] || category}
                    </div>
                  </td>
                </tr>
                
                {/* 指標項目 */}
                {groupedMetrics[category].map((metric, idx) => (
                  <tr 
                    key={metric.id} 
                    className={`border-b border-gray-200 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} ${categoryColors[category]?.hover || 'hover:bg-gray-100'}`}
                  >
                    <td className="px-6 py-3 text-sm text-gray-800 border-r border-gray-200">
                      <div className="font-medium">{metric.name}</div>
                      <div className="text-xs text-gray-500">{metric.description}</div>
                    </td>
                    
                    {selectedPeriods.map(period => (
                      <td key={`${metric.id}-${period}`} className="px-6 py-3 text-right text-sm font-medium text-gray-900 border-r border-gray-200">
                        <span className={getValueClassNames(metric.values[period], metric.benchmarks?.[period], metric.thresholdDirection)}>
                          {formatValue(metric.values[period], metric.format, metric.unit)}
                        </span>
                      </td>
                    ))}
                    
                    <td className="px-6 py-3 text-right text-sm text-gray-600 border-r border-gray-200">
                      {formatValue(metric.benchmarks?.[selectedPeriods[0]], metric.format, metric.unit)}
                    </td>
                    
                    {selectedPeriods.length > 1 && (
                      <td className="px-6 py-3 text-right text-sm">
                        {getChangeDisplay(
                          metric.values[selectedPeriods[0]],
                          metric.values[selectedPeriods[1]],
                          metric.format,
                          metric.unit,
                          metric.thresholdDirection
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
          
          <tfoot className="bg-gray-100 border-t-2 border-gray-300">
            <tr>
              <td colSpan={selectedPeriods.length + 2} className="px-6 py-3 text-xs text-gray-500">
                <div className="flex justify-between items-center">
                  <div>※ 緑色の数値は業界平均より良好、赤色は注意が必要な数値を表します</div>
                  <div>データ更新日: 2025年5月17日</div>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
      
      {/* 凡例部分 */}
      <div className="p-4 bg-gray-50 border-t border-gray-300">
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-1"></span>
            <span className="text-xs text-gray-600">業界平均より良好</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-1"></span>
            <span className="text-xs text-gray-600">業界平均より低い</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-1"></span>
            <span className="text-xs text-gray-600">前年より改善</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-yellow-500 mr-1"></span>
            <span className="text-xs text-gray-600">前年より悪化</span>
          </div>
        </div>
      </div>
      
      {/* 操作ボタン */}
      <div className="p-4 border-t border-gray-300 flex justify-end">
        <button className="flex items-center px-4 py-2 mr-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          印刷
        </button>
        <button className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-green-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Excelにエクスポート
        </button>
      </div>
    </div>
  );
};

export default FinancialTable;
