import React from 'react';
import { FinancialMetric } from '../../types';

interface FinancialTableProps {
  metrics: FinancialMetric[];
  selectedPeriods: string[];
}

const SimpleFinancialTable: React.FC<FinancialTableProps> = ({ metrics, selectedPeriods }) => {
  // カテゴリーごとにグループ化
  const groupedMetrics: { [key: string]: FinancialMetric[] } = {};
  metrics.forEach(metric => {
    if (!groupedMetrics[metric.category]) {
      groupedMetrics[metric.category] = [];
    }
    groupedMetrics[metric.category].push(metric);
  });

  // カテゴリー名
  const categoryNames = {
    'profitability': '収益性指標',
    'safety': '安全性指標',
    'efficiency': '効率性指標',
    'growth': '成長性指標',
    'credit': '与信評価指標',
  };

  // 数値のフォーマット
  const formatValue = (value: number | null, format?: string) => {
    if (value === null) return '-';
    
    if (format === 'percent') {
      return `${value.toFixed(1)}%`;
    } else if (format === 'currency') {
      return `${value.toLocaleString()}百万円`;
    }
    return value.toLocaleString();
  };

  // 変化率の計算
  const getChangeText = (current: number | null, previous: number | null) => {
    if (current === null || previous === null) return '-';
    
    const change = current - previous;
    const sign = change >= 0 ? '+' : '';
    return `${sign}${change.toLocaleString()}`;
  };

  // 良し悪しの判定
  const getValueClass = (value: number | null, benchmark: number | null, direction?: string) => {
    if (value === null || benchmark === null) return '';
    
    const isGood = direction === 'above' 
      ? value > benchmark 
      : value < benchmark;
      
    return isGood ? 'text-green-600 font-bold' : 'text-red-600 font-bold';
  };

  return (
    <div className="overflow-hidden border border-gray-300 rounded-lg shadow-lg">
      <table className="min-w-full bg-white">
        <thead>
          <tr className="bg-blue-700 text-white">
            <th className="p-3 text-left border border-blue-600">指標名</th>
            {selectedPeriods.map(period => (
              <th key={period} className="p-3 text-right border border-blue-600">{period}年度</th>
            ))}
            <th className="p-3 text-right border border-blue-600">業界平均</th>
            {selectedPeriods.length > 1 && (
              <th className="p-3 text-right border border-blue-600">前年対比</th>
            )}
          </tr>
        </thead>
        <tbody>
          {Object.keys(groupedMetrics).map(category => (
            <React.Fragment key={category}>
              {/* カテゴリーヘッダー */}
              <tr className="bg-gray-200">
                <td colSpan={selectedPeriods.length + 2 + (selectedPeriods.length > 1 ? 1 : 0)} 
                    className="p-2 font-bold border border-gray-300">
                  {categoryNames[category as keyof typeof categoryNames] || category}
                </td>
              </tr>
              
              {/* 指標行 */}
              {groupedMetrics[category].map((metric, idx) => (
                <tr key={metric.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="p-3 border border-gray-300">
                    <div className="font-medium">{metric.name}</div>
                    <div className="text-xs text-gray-500">{metric.description}</div>
                  </td>
                  
                  {selectedPeriods.map(period => (
                    <td key={`${metric.id}-${period}`} className="p-3 text-right border border-gray-300">
                      <span className={getValueClass(
                        metric.values[period], 
                        metric.benchmarks?.[period], 
                        metric.thresholdDirection
                      )}>
                        {formatValue(metric.values[period], metric.format)}
                      </span>
                    </td>
                  ))}
                  
                  <td className="p-3 text-right border border-gray-300 text-gray-700">
                    {formatValue(metric.benchmarks?.[selectedPeriods[0]], metric.format)}
                  </td>
                  
                  {selectedPeriods.length > 1 && (
                    <td className="p-3 text-right border border-gray-300">
                      <span className={metric.values[selectedPeriods[0]] > metric.values[selectedPeriods[1]] ? 'text-green-600' : 'text-red-600'}>
                        {getChangeText(metric.values[selectedPeriods[0]], metric.values[selectedPeriods[1]])}
                      </span>
                    </td>
                  )}
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      
      {/* 凡例 */}
      <div className="p-3 bg-gray-100 border-t border-gray-300 text-xs text-gray-600">
        <div className="flex space-x-4">
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 bg-green-600 rounded-full mr-1"></span>
            <span>業界平均より良好</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 bg-red-600 rounded-full mr-1"></span>
            <span>業界平均より低い</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleFinancialTable;
