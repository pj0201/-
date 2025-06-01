import React from 'react';
import { FinancialMetric } from '../../types';

interface FinancialTableProps {
  metrics: FinancialMetric[];
  selectedPeriods: string[];
}

const EnhancedFinancialTable: React.FC<FinancialTableProps> = ({ metrics, selectedPeriods }) => {
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

  // カテゴリーの色
  const categoryColors = {
    'profitability': '#e3f2fd', // 淡い青
    'safety': '#e8f5e9', // 淡い緑
    'efficiency': '#f3e5f5', // 淡い紫
    'growth': '#fffde7', // 淡い黄
    'credit': '#ffebee', // 淡い赤
  };

  // タイトル部分
  const tableStyle = {
    width: '100%',
    borderCollapse: 'collapse' as const,
    borderSpacing: 0,
    border: '2px solid #2c3e50',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    fontFamily: 'Arial, sans-serif',
    marginBottom: '20px',
  };

  // ヘッダー部分のスタイル
  const thStyle = {
    backgroundColor: '#2c3e50',
    color: 'white',
    padding: '12px 15px',
    textAlign: 'center' as const,
    borderRight: '1px solid #ddd',
    fontWeight: 'bold',
  };

  // テーブルセルのスタイル
  const tdStyle = {
    padding: '10px 15px',
    borderBottom: '1px solid #ddd',
    borderRight: '1px solid #ddd',
  };

  // カテゴリーヘッダーのスタイル
  const categoryHeaderStyle = {
    textAlign: 'left' as const,
    padding: '10px 15px',
    fontWeight: 'bold',
    color: '#2c3e50',
  };

  // 数値セルのスタイル（右寄せ）
  const numberCellStyle = {
    ...tdStyle,
    textAlign: 'right' as const,
    fontFamily: 'monospace',
  };

  // 増加値スタイル
  const positiveStyle = {
    color: '#4caf50',
    fontWeight: 'bold',
  };

  // 減少値スタイル
  const negativeStyle = {
    color: '#f44336',
    fontWeight: 'bold',
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

  // 変化率の計算と表示
  const getChangeDisplay = (current: number | null, previous: number | null, direction?: string) => {
    if (current === null || previous === null) return { text: '-', isPositive: false };
    
    const change = current - previous;
    const isPositive = change > 0;
    
    // 方向性の考慮（'above'の場合は高い方が良い、'below'の場合は低い方が良い）
    const isGood = direction === 'below' ? !isPositive : isPositive;
    
    return { 
      text: `${isPositive ? '+' : ''}${change.toLocaleString()}`, 
      isGood,
    };
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>指標名</th>
            <th style={thStyle}>カテゴリ</th>
            {selectedPeriods.map(period => (
              <th key={period} style={thStyle}>{period}年度</th>
            ))}
            {selectedPeriods.length > 1 && selectedPeriods.slice(0, -1).map((_, index) => (
              <th key={`change-${index}`} style={thStyle}>
                {selectedPeriods[index]}との差
              </th>
            ))}
            <th style={thStyle}>業界平均</th>
          </tr>
        </thead>
        <tbody>
          {Object.keys(groupedMetrics).map(category => (
            <React.Fragment key={category}>
              {/* カテゴリー行 */}
              <tr style={{ backgroundColor: categoryColors[category as keyof typeof categoryColors] || '#f8f9fa' }}>
                <td 
                  colSpan={selectedPeriods.length + 3} 
                  style={{
                    ...categoryHeaderStyle,
                    backgroundColor: categoryColors[category as keyof typeof categoryColors] || '#f8f9fa',
                    borderBottom: '2px solid #2c3e50',
                  }}
                >
                  {categoryNames[category as keyof typeof categoryNames] || category}
                </td>
              </tr>
              
              {/* 指標行 */}
              {groupedMetrics[category].map((metric, idx) => (
                <tr 
                  key={metric.id} 
                  style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#f8f9fa' }}
                >
                  <td style={tdStyle}>
                    <div style={{ fontWeight: 'bold' }}>{metric.name}</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{metric.description}</div>
                  </td>
                  
                  <td style={tdStyle}>{categoryNames[category as keyof typeof categoryNames]}</td>
                  
                  {selectedPeriods.map(period => {
                    const value = metric.values[period];
                    const benchmark = metric.benchmarks?.[period];
                    
                    // 業界平均との比較
                    let valueStyle = {};
                    if (benchmark !== undefined && value !== null) {
                      const isAbove = value > benchmark;
                      if ((metric.thresholdDirection === 'above' && isAbove) || 
                          (metric.thresholdDirection === 'below' && !isAbove)) {
                        valueStyle = positiveStyle;
                      } else {
                        valueStyle = negativeStyle;
                      }
                    }
                    
                    return (
                      <td key={`${metric.id}-${period}`} style={numberCellStyle}>
                        <span style={valueStyle}>
                          {formatValue(value, metric.format)}
                        </span>
                      </td>
                    );
                  })}
                  
                  {/* 前年比 */}
                  {selectedPeriods.length > 1 && selectedPeriods.slice(0, -1).map((_, index) => {
                    const current = metric.values[selectedPeriods[index]];
                    const previous = metric.values[selectedPeriods[index + 1]];
                    const change = getChangeDisplay(current, previous, metric.thresholdDirection);
                    
                    return (
                      <td key={`change-${index}`} style={numberCellStyle}>
                        <span style={change.isGood ? positiveStyle : negativeStyle}>
                          {change.text}
                        </span>
                      </td>
                    );
                  })}
                  
                  {/* 業界平均 */}
                  <td style={numberCellStyle}>
                    {formatValue(metric.benchmarks?.[selectedPeriods[0]], metric.format)}
                  </td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={selectedPeriods.length + 3} style={{ padding: '10px', backgroundColor: '#f8f9fa', fontSize: '12px', color: '#666' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>※ 緑色の数値は良好、赤色は注意が必要な数値を表します</span>
                <span>更新日: 2025年5月20日</span>
              </div>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default EnhancedFinancialTable;
