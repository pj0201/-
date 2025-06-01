import React, { useState } from 'react';
import { ALL_METRICS } from '../data/metrics';
import Header from '../components/layout/Header';

export default function FinancialReport() {
  const [selectedPeriods, setSelectedPeriods] = useState(['2023', '2022', '2021']);
  const [activeCategory, setActiveCategory] = useState('all');
  
  // カテゴリーごとにメトリクスをフィルタリング
  const filteredMetrics = ALL_METRICS.filter(metric => 
    activeCategory === 'all' || metric.category === activeCategory
  );

  // カテゴリーごとにグループ化
  const groupedMetrics = {};
  filteredMetrics.forEach(metric => {
    if (!groupedMetrics[metric.category]) {
      groupedMetrics[metric.category] = [];
    }
    groupedMetrics[metric.category].push(metric);
  });

  // カテゴリー名とカラー定義
  const categories = {
    'profitability': { name: '収益性指標', color: '#1a365d', bgColor: '#ebf8ff' }, 
    'safety': { name: '安全性指標', color: '#22543d', bgColor: '#e6fffa' }, 
    'efficiency': { name: '効率性指標', color: '#44337a', bgColor: '#faf5ff' }, 
    'growth': { name: '成長性指標', color: '#744210', bgColor: '#fffff0' }, 
    'credit': { name: '与信評価指標', color: '#742a2a', bgColor: '#fff5f5' }, 
  };

  // 数値のフォーマット関数
  const formatValue = (value, format) => {
    if (value === null) return '-';
    
    if (format === 'percent') {
      return `${value.toFixed(1)}%`;
    } else if (format === 'currency') {
      return `${value.toLocaleString()}百万円`;
    }
    return value.toLocaleString();
  };

  return (
    <div>
      <Header />
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px', color: '#2d3748' }}>
          財務指標分析
        </h1>
        
        {/* テーブル */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', 
          overflow: 'hidden',
          border: '1px solid #e2e8f0',
        }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#2c3e50', color: 'white' }}>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold', borderRight: '1px solid #4a5568' }}>
                  指標名
                </th>
                <th style={{ padding: '15px', textAlign: 'left', fontWeight: 'bold', borderRight: '1px solid #4a5568' }}>
                  カテゴリ
                </th>
                {selectedPeriods.map(period => (
                  <th 
                    key={period}
                    style={{ 
                      padding: '15px', 
                      textAlign: 'right', 
                      fontWeight: 'bold',
                      borderRight: '1px solid #4a5568',
                    }}
                  >
                    {period}年度
                  </th>
                ))}
                <th style={{ padding: '15px', textAlign: 'right', fontWeight: 'bold' }}>
                  業界平均
                </th>
              </tr>
            </thead>
            
            <tbody>
              {Object.entries(groupedMetrics).map(([category, metrics]) => {
                const { name, bgColor } = categories[category] || 
                                         { name: category, bgColor: '#f7fafc' };
                
                return (
                  <React.Fragment key={category}>
                    {/* カテゴリーヘッダー */}
                    <tr style={{ backgroundColor: bgColor }}>
                      <td 
                        colSpan={selectedPeriods.length + 2}
                        style={{
                          padding: '12px 15px',
                          fontWeight: 'bold',
                          borderBottom: '2px solid #2c3e50',
                        }}
                      >
                        {name}
                      </td>
                    </tr>
                    
                    {/* 指標行 */}
                    {metrics.map((metric, idx) => {
                      const rowBgColor = idx % 2 === 0 ? 'white' : '#f8fafc';
                      
                      return (
                        <tr key={metric.id} style={{ backgroundColor: rowBgColor }}>
                          <td style={{ 
                            padding: '12px 15px', 
                            borderBottom: '1px solid #e2e8f0',
                            borderRight: '1px solid #e2e8f0',
                          }}>
                            <div style={{ fontWeight: 'bold' }}>{metric.name}</div>
                            <div style={{ fontSize: '12px', color: '#718096' }}>{metric.description}</div>
                          </td>
                          
                          <td style={{ 
                            padding: '12px 15px', 
                            borderBottom: '1px solid #e2e8f0',
                            borderRight: '1px solid #e2e8f0',
                            color: '#718096',
                            fontSize: '14px',
                          }}>
                            {name}
                          </td>
                          
                          {selectedPeriods.map(period => {
                            // 値と業界平均との比較
                            const value = metric.values[period];
                            const benchmark = metric.benchmarks?.[period];
                            
                            let valueStyle = {};
                            if (value !== null && benchmark !== null) {
                              const isAboveBenchmark = value > benchmark;
                              const isGood = metric.thresholdDirection === 'below' ? !isAboveBenchmark : isAboveBenchmark;
                              
                              if (isGood) {
                                valueStyle = { color: '#38a169', fontWeight: 'bold' };
                              } else {
                                valueStyle = { color: '#e53e3e', fontWeight: 'bold' };
                              }
                            }
                            
                            return (
                              <td 
                                key={`${metric.id}-${period}`}
                                style={{ 
                                  padding: '12px 15px', 
                                  borderBottom: '1px solid #e2e8f0',
                                  borderRight: '1px solid #e2e8f0',
                                  textAlign: 'right',
                                  fontFamily: 'monospace',
                                  fontSize: '15px',
                                }}
                              >
                                <span style={valueStyle}>
                                  {formatValue(value, metric.format)}
                                </span>
                              </td>
                            );
                          })}
                          
                          {/* 業界平均 */}
                          <td style={{ 
                            padding: '12px 15px', 
                            borderBottom: '1px solid #e2e8f0',
                            textAlign: 'right',
                            fontFamily: 'monospace',
                            fontSize: '15px',
                            color: '#718096',
                          }}>
                            {formatValue(metric.benchmarks?.[selectedPeriods[0]], metric.format)}
                          </td>
                        </tr>
                      );
                    })}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}