import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import axios from 'axios';

interface CompanyData {
  id: number;
  name: string;
}

interface FinancialInputData {
  company_id: number;
  period: string;
  employee_count?: number;
  
  // 詳細勘定科目
  cash_and_deposits?: number;
  accounts_receivable?: number;
  inventory?: number;
  tangible_assets?: number;
  intangible_assets?: number;
  accounts_payable?: number;
  short_term_debt?: number;
  long_term_debt?: number;
  depreciation?: number;
  interest_expense?: number;
  
  // メモ
  notes?: string;
}

export default function FinancialInput() {
  const [companies, setCompanies] = useState<CompanyData[]>([]);
  const [formData, setFormData] = useState<FinancialInputData>({
    company_id: 0,
    period: new Date().getFullYear().toString(),
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('/api/companies');
      setCompanies(response.data);
      if (response.data.length > 0) {
        setFormData(prev => ({ ...prev, company_id: response.data[0].id }));
      }
    } catch (error) {
      console.error('企業データの取得に失敗:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'company_id' ? parseInt(value) : 
             ['employee_count', 'cash_and_deposits', 'accounts_receivable', 'inventory', 
              'tangible_assets', 'intangible_assets', 'accounts_payable', 'short_term_debt', 
              'long_term_debt', 'depreciation', 'interest_expense'].includes(name) 
             ? (value ? parseFloat(value) : undefined) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await axios.post('/api/financial-input', formData);
      setMessage('財務データの補完情報が保存されました');
    } catch (error: any) {
      setMessage('保存に失敗しました: ' + (error.response?.data?.error || 'サーバーエラー'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">財務データ補完入力</h1>
            <p className="mt-2 text-sm text-gray-600">
              従業員数や詳細勘定科目を入力して、より正確な財務分析を行います
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6">
            <div className="space-y-6">
              {/* 基本情報 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">基本情報</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      対象企業
                    </label>
                    <select
                      name="company_id"
                      value={formData.company_id}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value={0}>企業を選択してください</option>
                      {companies.map(company => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      対象期間
                    </label>
                    <input
                      type="text"
                      name="period"
                      value={formData.period}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="2024"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      従業員数（人）
                    </label>
                    <input
                      type="number"
                      name="employee_count"
                      value={formData.employee_count || ''}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="例: 25"
                      min="1"
                    />
                    <p className="text-xs text-gray-500 mt-1">生産性指標の計算に使用されます</p>
                  </div>
                </div>
              </div>

              {/* 詳細勘定科目（資産） */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">詳細勘定科目（資産の部）</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      現金及び預金（円）
                    </label>
                    <input
                      type="number"
                      name="cash_and_deposits"
                      value={formData.cash_and_deposits || ''}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="45000000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      売掛金（円）
                    </label>
                    <input
                      type="number"
                      name="accounts_receivable"
                      value={formData.accounts_receivable || ''}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="35000000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      棚卸資産（円）
                    </label>
                    <input
                      type="number"
                      name="inventory"
                      value={formData.inventory || ''}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="25000000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      有形固定資産（円）
                    </label>
                    <input
                      type="number"
                      name="tangible_assets"
                      value={formData.tangible_assets || ''}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="150000000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      無形固定資産（円）
                    </label>
                    <input
                      type="number"
                      name="intangible_assets"
                      value={formData.intangible_assets || ''}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="10000000"
                    />
                  </div>
                </div>
              </div>

              {/* 詳細勘定科目（負債） */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">詳細勘定科目（負債の部）</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      買掛金（円）
                    </label>
                    <input
                      type="number"
                      name="accounts_payable"
                      value={formData.accounts_payable || ''}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="30000000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      短期借入金（円）
                    </label>
                    <input
                      type="number"
                      name="short_term_debt"
                      value={formData.short_term_debt || ''}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="25000000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      長期借入金（円）
                    </label>
                    <input
                      type="number"
                      name="long_term_debt"
                      value={formData.long_term_debt || ''}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="60000000"
                    />
                  </div>
                </div>
              </div>

              {/* 損益項目 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">詳細損益項目</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      減価償却費（円）
                    </label>
                    <input
                      type="number"
                      name="depreciation"
                      value={formData.depreciation || ''}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="15000000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      支払利息（円）
                    </label>
                    <input
                      type="number"
                      name="interest_expense"
                      value={formData.interest_expense || ''}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="3000000"
                    />
                  </div>
                </div>
              </div>

              {/* メモ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メモ・備考
                </label>
                <textarea
                  name="notes"
                  value={formData.notes || ''}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="補完データに関する備考やメモを入力..."
                />
              </div>

              {/* 保存ボタン */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading || formData.company_id === 0}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? '保存中...' : '補完データを保存'}
                </button>
              </div>

              {message && (
                <div className={`mt-4 p-3 rounded-md text-sm ${
                  message.includes('保存されました') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                  {message}
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
}