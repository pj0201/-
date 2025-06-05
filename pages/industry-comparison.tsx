import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import axios from 'axios';

interface BusinessCategory {
  id: number;
  code: string;
  name: string;
  level: string;
  parent_id?: number;
}

interface ComparisonResult {
  companyValue: number;
  industryAverage: number;
  difference: number;
  percentageDifference: number;
  ranking: 'excellent' | 'good' | 'average' | 'below_average' | 'poor';
  comment: string;
}

interface IndustryComparison {
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

export default function IndustryComparisonPage() {
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [categories, setCategories] = useState<BusinessCategory[]>([]);
  const [majorCategories, setMajorCategories] = useState<BusinessCategory[]>([]);
  const [middleCategories, setMiddleCategories] = useState<BusinessCategory[]>([]);
  const [minorCategories, setMinorCategories] = useState<BusinessCategory[]>([]);
  const [selectedMajor, setSelectedMajor] = useState('');
  const [selectedMiddle, setSelectedMiddle] = useState('');
  const [selectedMinor, setSelectedMinor] = useState('');
  const [comparison, setComparison] = useState<IndustryComparison | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // サンプル財務データ（実際の使用時はファイルアップロードや入力フォームから取得）
  const [sampleFinancialData] = useState({
    totalAssetTurnover: 1.1,
    currentRatio: 1.3,
    debtToEquityRatio: 2.1,
    equityRatio: 0.32,
    returnOnAssets: 4.5,
    returnOnEquity: 14.2,
    netProfitMargin: 4.1,
    grossProfitMargin: 24.5,
    operatingMargin: 6.5,
    quickRatio: 1.1,
    interestCoverageRatio: 11.5,
    debtToAssetRatio: 0.68,
    inventoryTurnover: 8.2,
    receivablesTurnover: 7.5,
    payablesTurnover: 9.2,
    laborProductivity: 1100,
    salesPerEmployee: 1050,
    profitPerEmployee: 43
  });

  useEffect(() => {
    fetchMajorCategories();
  }, []);

  const fetchMajorCategories = async () => {
    try {
      const response = await axios.get('/api/business-categories?level=major');
      setMajorCategories(response.data.categories);
      setCategories(response.data.categories);
    } catch (error) {
      console.error('大分類の取得に失敗:', error);
    }
  };

  const fetchMiddleCategories = async (parentId: number) => {
    try {
      const response = await axios.get(`/api/business-categories?level=middle&parent_id=${parentId}`);
      setMiddleCategories(response.data.categories);
    } catch (error) {
      console.error('中分類の取得に失敗:', error);
      setMiddleCategories([]);
    }
  };

  const fetchMinorCategories = async (parentId: number) => {
    try {
      const response = await axios.get(`/api/business-categories?level=minor&parent_id=${parentId}`);
      setMinorCategories(response.data.categories);
    } catch (error) {
      console.error('小分類の取得に失敗:', error);
      setMinorCategories([]);
    }
  };

  const handleCompareWithIndustry = async () => {
    if (!selectedCategory) {
      setError('業種を選択してください');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/api/industry-comparison', {
        financialData: sampleFinancialData,
        categoryId: selectedCategory
      });

      if (response.data.success) {
        setComparison(response.data.comparison);
      } else {
        setError('比較データの取得に失敗しました');
      }
    } catch (error: any) {
      console.error('同業種比較エラー:', error);
      setError(error.response?.data?.error || '同業種比較の実行に失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const getRankingColor = (ranking: string) => {
    switch (ranking) {
      case 'excellent': return 'text-green-600 bg-green-50';
      case 'good': return 'text-blue-600 bg-blue-50';
      case 'average': return 'text-yellow-600 bg-yellow-50';
      case 'below_average': return 'text-orange-600 bg-orange-50';
      case 'poor': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRankingText = (ranking: string) => {
    switch (ranking) {
      case 'excellent': return '優秀';
      case 'good': return '良好';
      case 'average': return '平均';
      case 'below_average': return '平均以下';
      case 'poor': return '要改善';
      default: return '不明';
    }
  };

  const getMetricName = (key: string) => {
    const names: { [key: string]: string } = {
      totalAssetTurnover: '総資産回転率',
      currentRatio: '流動比率',
      debtToEquityRatio: '負債比率',
      equityRatio: '自己資本比率',
      returnOnAssets: 'ROA',
      returnOnEquity: 'ROE',
      netProfitMargin: '売上高純利益率',
      grossProfitMargin: '売上総利益率',
      operatingMargin: '営業利益率',
      quickRatio: '当座比率',
      interestCoverageRatio: 'インタレストカバレッジレシオ',
      debtToAssetRatio: '総資産負債比率',
      inventoryTurnover: '棚卸資産回転率',
      receivablesTurnover: '売上債権回転率',
      payablesTurnover: '仕入債務回転率',
      laborProductivity: '労働生産性',
      salesPerEmployee: '従業員一人当たり売上高',
      profitPerEmployee: '従業員一人当たり利益'
    };
    return names[key] || key;
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h1 className="text-2xl font-bold text-gray-900">同業種比較分析</h1>
              <p className="mt-2 text-gray-600">
                自社の財務指標を同業種の平均と比較し、競争力を分析します
              </p>
            </div>

            <div className="p-6">
              {/* 業種選択 */}
              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">業種選択</h2>
                
                {/* 大分類選択 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    大分類
                  </label>
                  <select
                    value={selectedMajor}
                    onChange={(e) => {
                      setSelectedMajor(e.target.value);
                      setSelectedMiddle('');
                      setSelectedMinor('');
                      setSelectedCategory(parseInt(e.target.value) || null);
                      if (e.target.value) {
                        fetchMiddleCategories(parseInt(e.target.value));
                      }
                    }}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- 大分類を選択 --</option>
                    {majorCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.code}: {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 中分類選択 */}
                {selectedMajor && middleCategories.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      中分類
                    </label>
                    <select
                      value={selectedMiddle}
                      onChange={(e) => {
                        setSelectedMiddle(e.target.value);
                        setSelectedMinor('');
                        setSelectedCategory(parseInt(e.target.value) || parseInt(selectedMajor));
                        if (e.target.value) {
                          fetchMinorCategories(parseInt(e.target.value));
                        }
                      }}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- 中分類を選択（大分類での比較の場合は未選択のまま） --</option>
                      {middleCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.code}: {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* 小分類選択 */}
                {selectedMiddle && minorCategories.length > 0 && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      小分類
                    </label>
                    <select
                      value={selectedMinor}
                      onChange={(e) => {
                        setSelectedMinor(e.target.value);
                        setSelectedCategory(parseInt(e.target.value) || parseInt(selectedMiddle));
                      }}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- 小分類を選択（中分類での比較の場合は未選択のまま） --</option>
                      {minorCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.code}: {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* 比較実行ボタン */}
                <button
                  onClick={handleCompareWithIndustry}
                  disabled={!selectedCategory || loading}
                  className={`px-6 py-3 rounded-md text-white font-medium ${
                    selectedCategory && !loading
                      ? 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500'
                      : 'bg-gray-400 cursor-not-allowed'
                  }`}
                >
                  {loading ? '分析中...' : '同業種比較を実行'}
                </button>

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                )}
              </div>

              {/* 比較結果 */}
              {comparison && (
                <div className="space-y-6">
                  {/* 概要 */}
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-blue-900 mb-2">
                      比較結果概要
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-blue-700">比較対象業種</p>
                        <p className="font-medium text-blue-900">
                          {comparison.categoryInfo.code}: {comparison.categoryInfo.name}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-700">総合スコア</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {comparison.overallScore}/100
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-blue-700">分析指標数</p>
                        <p className="font-medium text-blue-900">
                          {Object.keys(comparison.metrics).length}項目
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* 詳細比較表 */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      指標別比較結果
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white border border-gray-200 rounded-lg">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              指標名
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              自社値
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              業界平均
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              差異
                            </th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              評価
                            </th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {Object.entries(comparison.metrics).map(([key, metric]) => (
                            <tr key={key} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">
                                {getMetricName(key)}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {metric.companyValue.toFixed(2)}
                                {key.includes('Ratio') || key.includes('Margin') ? '%' : ''}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-700">
                                {metric.industryAverage.toFixed(2)}
                                {key.includes('Ratio') || key.includes('Margin') ? '%' : ''}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                <span className={metric.difference >= 0 ? 'text-green-600' : 'text-red-600'}>
                                  {metric.difference >= 0 ? '+' : ''}{metric.difference.toFixed(2)}
                                  <span className="text-xs ml-1">
                                    ({metric.percentageDifference >= 0 ? '+' : ''}{metric.percentageDifference.toFixed(1)}%)
                                  </span>
                                </span>
                              </td>
                              <td className="px-4 py-3">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getRankingColor(metric.ranking)}`}>
                                  {getRankingText(metric.ranking)}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* 改善提案 */}
                  {comparison.recommendations.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-yellow-900 mb-4">
                        改善提案
                      </h3>
                      <ul className="space-y-2">
                        {comparison.recommendations.map((recommendation, index) => (
                          <li key={index} className="flex items-start">
                            <span className="flex-shrink-0 w-6 h-6 bg-yellow-200 text-yellow-800 rounded-full flex items-center justify-center text-xs font-medium mr-3 mt-0.5">
                              {index + 1}
                            </span>
                            <span className="text-sm text-yellow-800">{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}