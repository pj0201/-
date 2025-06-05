import React, { useState } from 'react';
import Layout from '../components/layout/Layout';

export default function Reports() {
  const [selectedCompany, setSelectedCompany] = useState('株式会社サンプル企業');
  const [selectedPeriod, setSelectedPeriod] = useState('2024');
  const [reportType, setReportType] = useState('comprehensive');
  const [generating, setGenerating] = useState(false);

  const handleGenerateReport = async () => {
    setGenerating(true);
    // 実際のレポート生成処理をここに実装
    setTimeout(() => {
      setGenerating(false);
      alert('レポートが生成されました（仮実装）');
    }, 2000);
  };

  return (
    <Layout>
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">レポート作成</h1>
            <p className="mt-2 text-sm text-gray-600">
              財務分析レポートを自動生成します
            </p>
          </div>

          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6">
            <div className="space-y-6">
              {/* 企業選択 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  対象企業
                </label>
                <select 
                  value={selectedCompany} 
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="株式会社サンプル企業">株式会社サンプル企業</option>
                  <option value="テスト株式会社">テスト株式会社</option>
                </select>
              </div>

              {/* 期間選択 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  対象期間
                </label>
                <select 
                  value={selectedPeriod} 
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="2024">2024年度</option>
                  <option value="2023">2023年度</option>
                  <option value="2022">2022年度</option>
                </select>
              </div>

              {/* レポートタイプ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  レポート種類
                </label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="reportType"
                      value="comprehensive"
                      checked={reportType === 'comprehensive'}
                      onChange={(e) => setReportType(e.target.value)}
                      className="mr-3 text-blue-600"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">総合分析レポート</div>
                      <div className="text-xs text-gray-500">収益性・安全性・成長性・効率性の総合的な分析</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="reportType"
                      value="profitability"
                      checked={reportType === 'profitability'}
                      onChange={(e) => setReportType(e.target.value)}
                      className="mr-3 text-blue-600"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">収益性分析</div>
                      <div className="text-xs text-gray-500">ROE・ROA・利益率等の収益性に特化した分析</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="reportType"
                      value="safety"
                      checked={reportType === 'safety'}
                      onChange={(e) => setReportType(e.target.value)}
                      className="mr-3 text-blue-600"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">安全性分析</div>
                      <div className="text-xs text-gray-500">流動比率・自己資本比率等の財務安全性分析</div>
                    </div>
                  </label>
                  
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="reportType"
                      value="cashflow"
                      checked={reportType === 'cashflow'}
                      onChange={(e) => setReportType(e.target.value)}
                      className="mr-3 text-blue-600"
                    />
                    <div>
                      <div className="text-sm font-medium text-gray-900">キャッシュフロー分析</div>
                      <div className="text-xs text-gray-500">資金繰り・現金創出力の分析</div>
                    </div>
                  </label>
                </div>
              </div>

              {/* オプション設定 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  出力オプション
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2 text-blue-600" defaultChecked />
                    <span className="text-sm text-gray-700">グラフ・チャートを含める</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2 text-blue-600" defaultChecked />
                    <span className="text-sm text-gray-700">業界平均との比較を含める</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2 text-blue-600" />
                    <span className="text-sm text-gray-700">改善提案を含める</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2 text-blue-600" />
                    <span className="text-sm text-gray-700">エグゼクティブサマリーを含める</span>
                  </label>
                </div>
              </div>

              {/* 生成ボタン */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleGenerateReport}
                  disabled={generating}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {generating ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      レポート生成中...
                    </>
                  ) : (
                    'レポートを生成'
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* プレビューエリア */}
          <div className="mt-8 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">レポートプレビュー</h2>
            <div className="text-center py-12 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              レポートを生成するとここにプレビューが表示されます
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}