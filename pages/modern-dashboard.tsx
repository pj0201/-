import React, { useState } from 'react';
import { ALL_METRICS } from '../data/metrics';
import Header from '../components/layout/Header';

export default function ModernDashboard() {
  const [selectedYear, setSelectedYear] = useState('2023');
  
  // 収益性、効率性、安全性、成長性の指標をフィルタリング
  const profitabilityMetrics = ALL_METRICS.filter(metric => metric.category === 'profitability');
  const efficiencyMetrics = ALL_METRICS.filter(metric => metric.category === 'efficiency');
  const safetyMetrics = ALL_METRICS.filter(metric => metric.category === 'safety');
  const growthMetrics = ALL_METRICS.filter(metric => metric.category === 'growth');
  
  // 数値のフォーマット関数
  const formatValue = (value: number | null, format?: string) => {
    if (value === null) return '-';
    
    if (format === 'percent') {
      return `${value.toFixed(1)}%`;
    } else if (format === 'currency') {
      return `${value.toLocaleString()}百万円`;
    } else if (format === 'times') {
      return `${value.toFixed(1)}倍`;
    }
    return value.toLocaleString();
  };
  
  // 指標の良し悪しを判断する関数
  const getPerformanceClass = (metric: typeof ALL_METRICS[0], year: string) => {
    const value = metric.values[year];
    const benchmark = metric.benchmarks?.[year];
    
    if (value === null || benchmark === null) return '';
    
    const isAboveBenchmark = value > benchmark;
    const isGood = metric.thresholdDirection === 'below' ? !isAboveBenchmark : isAboveBenchmark;
    
    return isGood ? 'good' : 'bad';
  };
  
  // カード型のメトリクス表示を生成
  const renderMetricsCard = (title: string, metrics: typeof ALL_METRICS, color: string, icon: string) => {
    return (
      <div style={{
        backgroundColor: 'white',
        borderRadius: '8px',
        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
        overflow: 'hidden',
        border: '1px solid #e2e8f0',
        marginBottom: '24px',
      }}>
        <div style={{
          backgroundColor: color,
          color: 'white',
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontWeight: 'bold',
        }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ marginRight: '10px' }}>{icon}</span>
            <span>{title}</span>
          </div>
          <select 
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            style={{
              backgroundColor: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '4px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            <option value="2023">2023年度</option>
            <option value="2022">2022年度</option>
            <option value="2021">2021年度</option>
          </select>
        </div>
        
        <div style={{ padding: '0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc' }}>
                <th style={{ padding: '12px 15px', textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                  指標名
                </th>
                <th style={{ padding: '12px 15px', textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>
                  {selectedYear}年度
                </th>
                <th style={{ padding: '12px 15px', textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>
                  業界平均
                </th>
                <th style={{ padding: '12px 15px', textAlign: 'right', borderBottom: '1px solid #e2e8f0' }}>
                  評価
                </th>
              </tr>
            </thead>
            <tbody>
              {metrics.map((metric, idx) => {
                const performanceClass = getPerformanceClass(metric, selectedYear);
                
                return (
                  <tr key={metric.id} style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#f8fafc' }}>
                    <td style={{ padding: '12px 15px', borderBottom: '1px solid #e2e8f0' }}>
                      <div style={{ fontWeight: 'bold' }}>{metric.name}</div>
                      <div style={{ fontSize: '12px', color: '#718096' }}>{metric.description}</div>
                    </td>
                    <td style={{ 
                      padding: '12px 15px', 
                      textAlign: 'right', 
                      fontFamily: 'monospace',
                      fontWeight: 'bold',
                      fontSize: '15px',
                      color: performanceClass === 'good' ? '#38a169' : performanceClass === 'bad' ? '#e53e3e' : 'inherit',
                      borderBottom: '1px solid #e2e8f0'
                    }}>
                      {formatValue(metric.values[selectedYear], metric.format)}
                    </td>
                    <td style={{ 
                      padding: '12px 15px', 
                      textAlign: 'right', 
                      fontFamily: 'monospace',
                      color: '#718096',
                      borderBottom: '1px solid #e2e8f0'
                    }}>
                      {formatValue(metric.benchmarks?.[selectedYear], metric.format)}
                    </td>
                    <td style={{ 
                      padding: '12px 15px', 
                      textAlign: 'right',
                      borderBottom: '1px solid #e2e8f0' 
                    }}>
                      {performanceClass === 'good' ? (
                        <div style={{ 
                          display: 'inline-block',
                          backgroundColor: '#c6f6d5', 
                          color: '#22543d',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          良好
                        </div>
                      ) : performanceClass === 'bad' ? (
                        <div style={{ 
                          display: 'inline-block',
                          backgroundColor: '#fed7d7', 
                          color: '#742a2a',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontSize: '12px',
                          fontWeight: 'bold'
                        }}>
                          注意
                        </div>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  return (
    <div>
      <Header />
      
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{ 
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px'
        }}>
          <h1 style={{ fontSize: '24px', fontWeight: 'bold', color: '#2d3748' }}>
            財務状況ダッシュボード
          </h1>
          
          <div style={{ 
            backgroundColor: '#f7fafc', 
            padding: '8px 16px', 
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            color: '#4a5568',
            fontSize: '14px'
          }}>
            最終更新日: 2025年5月20日
          </div>
        </div>
        
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 580px), 1fr))', 
          gap: '20px',
          marginBottom: '30px'
        }}>
          {/* 概要カード */}
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            padding: '20px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '14px', color: '#718096', marginBottom: '4px' }}>総売上高（2023年度）</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2d3748' }}>
                {formatValue(ALL_METRICS.find(m => m.id === 'revenue')?.values['2023'] || null, 'currency')}
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                marginTop: '8px',
                color: '#38a169',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                <span style={{ marginRight: '4px' }}>↑</span>
                <span>前年比 +4.2%</span>
              </div>
            </div>
            
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#ebf8ff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#3182ce',
              fontSize: '24px'
            }}>
              ¥
            </div>
          </div>
          
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
            padding: '20px',
            border: '1px solid #e2e8f0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '14px', color: '#718096', marginBottom: '4px' }}>純利益（2023年度）</div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: '#2d3748' }}>
                {formatValue(ALL_METRICS.find(m => m.id === 'net_profit')?.values['2023'] || null, 'currency')}
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center',
                marginTop: '8px',
                color: '#38a169',
                fontSize: '14px',
                fontWeight: 'bold'
              }}>
                <span style={{ marginRight: '4px' }}>↑</span>
                <span>前年比 +11.1%</span>
              </div>
            </div>
            
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              backgroundColor: '#e6fffa',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#319795',
              fontSize: '24px'
            }}>
              💰
            </div>
          </div>
        </div>
        
        {/* 収益性指標 */}
        {renderMetricsCard('収益性指標', profitabilityMetrics, '#1a365d', '📈')}
        
        {/* 効率性指標 */}
        {renderMetricsCard('効率性指標', efficiencyMetrics, '#44337a', '⚙️')}
        
        {/* 安全性指標 */}
        {renderMetricsCard('安全性指標', safetyMetrics, '#22543d', '🛡️')}
        
        {/* 成長性指標 */}
        {renderMetricsCard('成長性指標', growthMetrics, '#744210', '📊')}
        
        {/* 凡例 */}
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#f7fafc', 
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px' }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#38a169', marginRight: '6px' }}></div>
              <span style={{ fontSize: '14px', color: '#4a5568' }}>業界平均より良好</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#e53e3e', marginRight: '6px' }}></div>
              <span style={{ fontSize: '14px', color: '#4a5568' }}>業界平均を下回る</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
