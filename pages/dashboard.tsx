import React, { useState } from 'react';
import Header from '../components/layout/Header';
import CategoryTabs from '../components/dashboard/CategoryTabs';
import PeriodSelector from '../components/dashboard/PeriodSelector';
import EnhancedFinancialTable from '../components/dashboard/EnhancedFinancialTable';
import { ALL_METRICS } from '../data/metrics';
import { FinancialMetric } from '../types';

export default function Dashboard() {
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>(['2025', '2024']);
  const [activeCategory, setActiveCategory] = useState('all');
  const [companyName, setCompanyName] = useState('サンプル株式会社');
  const [view, setView] = useState<'table' | 'analytics'>('table');

  const filteredMetrics = activeCategory === 'all'
    ? ALL_METRICS
    : ALL_METRICS.filter(metric => metric.category === activeCategory);

  return (
    <div className="min-h-screen bg-gray-100">
      {/* ヘッダー */}
      <Header />

      {/* メインコンテンツ */}
      <div className="pt-4 pb-10">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 会社情報とアクションボタン */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 bg-white p-5 rounded-lg shadow-md border border-gray-200">
            <div className="flex items-center mb-4 md:mb-0">
              <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div>
                <div className="flex items-center">
                  <h2 className="text-xl font-bold text-gray-800">{companyName}</h2>
                  <span className="ml-3 px-2 py-1 text-xs font-semibold text-blue-800 bg-blue-100 rounded-md">会社コード: SC12345</span>
                </div>
                <p className="text-sm text-gray-500">財務分析レポート | 最終更新: 2025年5月17日</p>
              </div>
            </div>
            
            <div className="flex space-x-3">
              <button 
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                onClick={() => {}}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                印刷
              </button>
              
              <button 
                className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none"
                onClick={() => {}}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                エクスポート
              </button>
              
              <button 
                className="flex items-center px-4 py-2 bg-blue-600 rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none"
                onClick={() => setView(view === 'table' ? 'analytics' : 'table')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                {view === 'table' ? 'グラフ表示' : 'テーブル表示'}
              </button>
            </div>
          </div>
          
          {/* 設定エリア */}
          <div className="mb-6">
            {/* 期間選択 */}
            <PeriodSelector 
              selectedPeriods={selectedPeriods}
              setSelectedPeriods={setSelectedPeriods}
            />

            {/* カテゴリタブ */}
            <CategoryTabs 
              activeCategory={activeCategory}
              setActiveCategory={setActiveCategory}
            />
          </div>

          {/* データ表示エリア */}
          <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '8px', boxShadow: '0 4px 8px rgba(0,0,0,0.1)', border: '1px solid #ddd', padding: '16px', marginBottom: '16px' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', borderSpacing: 0, border: '2px solid #2c3e50' }}>
              <thead>
                <tr style={{ backgroundColor: '#2c3e50', color: 'white' }}>
                  <th style={{ padding: '12px 15px', textAlign: 'left', borderRight: '1px solid #ddd', fontWeight: 'bold' }}>
                    指標名
                  </th>
                  <th style={{ padding: '12px 15px', textAlign: 'left', borderRight: '1px solid #ddd', fontWeight: 'bold' }}>
                    カテゴリ
                  </th>
                  {selectedPeriods.map(period => (
                    <th key={period} style={{ padding: '12px 15px', textAlign: 'right', borderRight: '1px solid #ddd', fontWeight: 'bold' }}>
                      {period}年度
                    </th>
                  ))}
                  <th style={{ padding: '12px 15px', textAlign: 'right', borderRight: '1px solid #ddd', fontWeight: 'bold' }}>
                    業界平均
                  </th>
                  <th style={{ padding: '12px 15px', textAlign: 'right', fontWeight: 'bold' }}>
                    前年比較
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.entries({
                  'profitability': { name: '収益性指標', color: '#e3f2fd' },
                  'safety': { name: '安全性指標', color: '#e8f5e9' },
                  'efficiency': { name: '効率性指標', color: '#f3e5f5' },
                  'growth': { name: '成長性指標', color: '#fffde7' },
                  'credit': { name: '与信評価指標', color: '#ffebee' }
                }).map(([category, { name, color }]) => {
                  const categoryMetrics = filteredMetrics.filter(m => m.category === category);
                  if (categoryMetrics.length === 0) return null;
                  
                  return (
                    <React.Fragment key={category}>
                      {/* カテゴリーヘッダー */}
                      <tr style={{ backgroundColor: color }}>
                        <td 
                          colSpan={selectedPeriods.length + 3} 
                          style={{
                            padding: '10px 15px',
                            textAlign: 'left',
                            fontWeight: 'bold',
                            color: '#2c3e50',
                            borderBottom: '2px solid #2c3e50',
                          }}
                        >
                          {name}
                        </td>
                      </tr>
                      
                      {/* 指標行 */}
                      {categoryMetrics.map((metric, idx) => {
                        // 前年比の計算
                        const currentValue = metric.values[selectedPeriods[0]];
                        const prevValue = selectedPeriods.length > 1 ? metric.values[selectedPeriods[1]] : null;
                        const change = currentValue !== null && prevValue !== null ? currentValue - prevValue : null;
                        const isPositive = change !== null ? change > 0 : false;
                        const isGood = metric.thresholdDirection === 'below' ? !isPositive : isPositive;
                        
                        return (
                          <tr 
                            key={metric.id} 
                            style={{ backgroundColor: idx % 2 === 0 ? 'white' : '#f8f9fa' }}
                          >
                            <td style={{ padding: '10px 15px', borderBottom: '1px solid #ddd', borderRight: '1px solid #ddd' }}>
                              <div style={{ fontWeight: 'bold' }}>{metric.name}</div>
                              <div style={{ fontSize: '12px', color: '#666' }}>{metric.description}</div>
                            </td>
                            
                            <td style={{ padding: '10px 15px', borderBottom: '1px solid #ddd', borderRight: '1px solid #ddd' }}>{name}</td>
                            
                            {selectedPeriods.map(period => {
                              const value = metric.values[period];
                              const benchmark = metric.benchmarks?.[period];
                              
                              // 業界平均との比較
                              let valueStyle = {};
                              if (benchmark !== undefined && value !== null) {
                                const isAbove = value > benchmark;
                                if ((metric.thresholdDirection === 'above' && isAbove) || 
                                    (metric.thresholdDirection === 'below' && !isAbove)) {
                                  valueStyle = { color: '#4caf50', fontWeight: 'bold' };
                                } else {
                                  valueStyle = { color: '#f44336', fontWeight: 'bold' };
                                }
                              }
                              
                              return (
                                <td key={`${metric.id}-${period}`} style={{ 
                                  padding: '10px 15px', 
                                  borderBottom: '1px solid #ddd', 
                                  borderRight: '1px solid #ddd',
                                  textAlign: 'right',
                                  fontFamily: 'monospace',
                                }}>
                                  <span style={valueStyle}>
                                    {value === null ? '-' : 
                                     metric.format === 'percent' ? `${value.toFixed(1)}%` :
                                     metric.format === 'currency' ? `${value.toLocaleString()}百万円` :
                                     value.toLocaleString()}
                                  </span>
                                </td>
                              );
                            })}
                            
                            {/* 業界平均 */}
                            <td style={{ 
                              padding: '10px 15px', 
                              borderBottom: '1px solid #ddd', 
                              borderRight: '1px solid #ddd',
                              textAlign: 'right',
                              fontFamily: 'monospace',
                              color: '#666',
                            }}>
                              {metric.benchmarks?.[selectedPeriods[0]] === null ? '-' : 
                               metric.format === 'percent' ? `${metric.benchmarks?.[selectedPeriods[0]]?.toFixed(1)}%` :
                               metric.format === 'currency' ? `${metric.benchmarks?.[selectedPeriods[0]]?.toLocaleString()}百万円` :
                               metric.benchmarks?.[selectedPeriods[0]]?.toLocaleString()}
                            </td>
                            
                            {/* 前年比 */}
                            <td style={{ 
                              padding: '10px 15px', 
                              borderBottom: '1px solid #ddd',
                              textAlign: 'right',
                              fontFamily: 'monospace',
                            }}>
                              {change === null ? '-' : (
                                <span style={{ color: isGood ? '#4caf50' : '#f44336', fontWeight: 'bold' }}>
                                  {isPositive ? '+' : ''}
                                  {metric.format === 'percent' ? `${change.toFixed(1)}%` :
                                   metric.format === 'currency' ? `${change.toLocaleString()}百万円` :
                                   change.toLocaleString()}
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={selectedPeriods.length + 3} style={{ 
                    padding: '10px 15px', 
                    backgroundColor: '#f8f9fa', 
                    fontSize: '12px', 
                    color: '#666',
                    borderTop: '2px solid #ddd',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span>※ 緑色の数値は良好、赤色は注意が必要な数値を表します</span>
                      <span>更新日: 2025年5月20日</span>
                    </div>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
          
          {/* 説明エリア */}
          <div className="mt-6 bg-white rounded-lg shadow-md p-5 border border-gray-200">
            <h3 className="text-md font-medium text-gray-800 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              分析注記
            </h3>
            <div className="text-sm text-gray-600 space-y-2">
              <p>※ 当ダッシュボードに表示されている財務指標は、財務資料に基づいて算出されています。</p>
              <p>※ 業界平均は、同業種中央値を使用しています。</p>
              <p>※ 増減の色は、その指標が高い方が良い場合は緑、低い方が良い場合は赤で表示されています。</p>
            </div>
          </div>
        </main>
      </div>
      
      {/* フッター */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center text-sm text-gray-500">
            <div>© 2025 財務分析アシスタント</div>
            <div>バージョン 2.5.0</div>
          </div>
        </div>
      </footer>
    </div>
  );
}
