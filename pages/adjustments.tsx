import React, { useState } from 'react';
import Layout from '../components/layout/Layout';

interface AdjustmentItem {
  id: string;
  category: 'bs' | 'pl';
  subcategory: 'actual_balance' | 'normal_profit';
  item: string;
  originalValue: number;
  adjustedValue: number;
  reason: string;
}

export default function Adjustments() {
  const [selectedCompany, setSelectedCompany] = useState('株式会社サンプル企業');
  const [selectedPeriod, setSelectedPeriod] = useState('2024');
  const [activeTab, setActiveTab] = useState<'actual_balance' | 'normal_profit'>('actual_balance');
  const [adjustments, setAdjustments] = useState<AdjustmentItem[]>([]);
  const [saving, setSaving] = useState(false);

  // 実態バランスの調整項目
  const actualBalanceItems = [
    { id: 'bs_1', item: '貸倒懸念債権', originalValue: 0, category: 'assets' },
    { id: 'bs_2', item: '不良在庫', originalValue: 0, category: 'assets' },
    { id: 'bs_3', item: '含み損のある有価証券', originalValue: 0, category: 'assets' },
    { id: 'bs_4', item: '回収困難な貸付金', originalValue: 0, category: 'assets' },
    { id: 'bs_5', item: '償却不足の固定資産', originalValue: 0, category: 'assets' },
    { id: 'bs_6', item: '簿外債務', originalValue: 0, category: 'liabilities' },
    { id: 'bs_7', item: '退職給付債務', originalValue: 0, category: 'liabilities' },
    { id: 'bs_8', item: '未払賞与', originalValue: 0, category: 'liabilities' },
  ];

  // 正常収益力の調整項目
  const normalProfitItems = [
    { id: 'pl_1', item: '役員報酬（適正額との差額）', originalValue: 0, category: 'expenses' },
    { id: 'pl_2', item: '役員退職金', originalValue: 0, category: 'expenses' },
    { id: 'pl_3', item: '交際費（過大分）', originalValue: 0, category: 'expenses' },
    { id: 'pl_4', item: '減価償却費（不足分）', originalValue: 0, category: 'expenses' },
    { id: 'pl_5', item: '賞与引当金', originalValue: 0, category: 'expenses' },
    { id: 'pl_6', item: '不動産賃借料（適正家賃との差額）', originalValue: 0, category: 'expenses' },
    { id: 'pl_7', item: '特別損失（一過性）', originalValue: 0, category: 'special' },
    { id: 'pl_8', item: '特別利益（一過性）', originalValue: 0, category: 'special' },
  ];

  const handleAdjustmentChange = (id: string, field: 'adjustedValue' | 'reason', value: string | number) => {
    const item = (activeTab === 'actual_balance' ? actualBalanceItems : normalProfitItems).find(item => item.id === id);
    if (!item) return;

    setAdjustments(prev => {
      const existingIndex = prev.findIndex(adj => adj.id === id);
      const adjustmentData: AdjustmentItem = {
        id,
        category: activeTab === 'actual_balance' ? 'bs' : 'pl',
        subcategory: activeTab,
        item: item.item,
        originalValue: item.originalValue,
        adjustedValue: field === 'adjustedValue' ? Number(value) : prev.find(adj => adj.id === id)?.adjustedValue || 0,
        reason: field === 'reason' ? String(value) : prev.find(adj => adj.id === id)?.reason || '',
      };

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = adjustmentData;
        return updated;
      } else {
        return [...prev, adjustmentData];
      }
    });
  };

  const handleSave = async () => {
    setSaving(true);
    // 実際の保存処理をここに実装
    setTimeout(() => {
      setSaving(false);
      alert('調整内容を保存しました（仮実装）');
    }, 1000);
  };

  const getAdjustmentValue = (id: string, field: 'adjustedValue' | 'reason') => {
    const adjustment = adjustments.find(adj => adj.id === id);
    return adjustment ? adjustment[field] : (field === 'adjustedValue' ? 0 : '');
  };

  const getTotalAdjustment = (items: any[]) => {
    return items.reduce((total, item) => {
      const adjustedValue = Number(getAdjustmentValue(item.id, 'adjustedValue'));
      return total + adjustedValue;
    }, 0);
  };

  return (
    <Layout>
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">決算修正</h1>
            <p className="mt-2 text-sm text-gray-600">
              実態バランスと正常収益力の決算補正を入力します
            </p>
          </div>

          {/* 企業・期間選択 */}
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">対象企業</label>
                <select 
                  value={selectedCompany} 
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="株式会社サンプル企業">株式会社サンプル企業</option>
                  <option value="テスト株式会社">テスト株式会社</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">対象期間</label>
                <select 
                  value={selectedPeriod} 
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm"
                >
                  <option value="2024">2024年度</option>
                  <option value="2023">2023年度</option>
                  <option value="2022">2022年度</option>
                </select>
              </div>
            </div>
          </div>

          {/* タブナビゲーション */}
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg overflow-hidden">
            <div className="border-b border-gray-200">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('actual_balance')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'actual_balance'
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  実態バランス（BS調整）
                </button>
                <button
                  onClick={() => setActiveTab('normal_profit')}
                  className={`px-6 py-4 text-sm font-medium border-b-2 ${
                    activeTab === 'normal_profit'
                      ? 'border-blue-500 text-blue-600 bg-blue-50'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  正常収益力（PL調整）
                </button>
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'actual_balance' ? (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">実態バランス調整</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    貸借対照表の各項目について、実態に即した調整を行います。
                  </p>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            調整項目
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            帳簿価額
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            調整額
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            調整理由
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {actualBalanceItems.map((item) => (
                          <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.item}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.originalValue.toLocaleString()}円
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="number"
                                value={getAdjustmentValue(item.id, 'adjustedValue')}
                                onChange={(e) => handleAdjustmentChange(item.id, 'adjustedValue', e.target.value)}
                                className="w-32 border border-gray-300 rounded-md px-2 py-1 text-sm"
                                placeholder="0"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="text"
                                value={getAdjustmentValue(item.id, 'reason')}
                                onChange={(e) => handleAdjustmentChange(item.id, 'reason', e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                                placeholder="調整理由を入力"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50">
                          <td className="px-6 py-3 text-sm font-medium text-gray-900">合計調整額</td>
                          <td className="px-6 py-3"></td>
                          <td className="px-6 py-3 text-sm font-medium text-gray-900">
                            {getTotalAdjustment(actualBalanceItems).toLocaleString()}円
                          </td>
                          <td className="px-6 py-3"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">正常収益力調整</h3>
                  <p className="text-sm text-gray-600 mb-6">
                    損益計算書の各項目について、正常収益力を算定するための調整を行います。
                  </p>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-300">
                      <thead>
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            調整項目
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            決算書計上額
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            調整額
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            調整理由
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {normalProfitItems.map((item) => (
                          <tr key={item.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.item}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.originalValue.toLocaleString()}円
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="number"
                                value={getAdjustmentValue(item.id, 'adjustedValue')}
                                onChange={(e) => handleAdjustmentChange(item.id, 'adjustedValue', e.target.value)}
                                className="w-32 border border-gray-300 rounded-md px-2 py-1 text-sm"
                                placeholder="0"
                              />
                            </td>
                            <td className="px-6 py-4">
                              <input
                                type="text"
                                value={getAdjustmentValue(item.id, 'reason')}
                                onChange={(e) => handleAdjustmentChange(item.id, 'reason', e.target.value)}
                                className="w-full border border-gray-300 rounded-md px-2 py-1 text-sm"
                                placeholder="調整理由を入力"
                              />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="bg-gray-50">
                          <td className="px-6 py-3 text-sm font-medium text-gray-900">合計調整額</td>
                          <td className="px-6 py-3"></td>
                          <td className="px-6 py-3 text-sm font-medium text-gray-900">
                            {getTotalAdjustment(normalProfitItems).toLocaleString()}円
                          </td>
                          <td className="px-6 py-3"></td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
              )}

              {/* 保存ボタン */}
              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="bg-blue-600 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? '保存中...' : '調整内容を保存'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}