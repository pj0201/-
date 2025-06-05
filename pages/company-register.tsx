import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import axios from 'axios';

interface BusinessCategory {
  id: number;
  code: string;
  name: string;
}

interface CompanyFormData {
  name: string;
  address: string;
  representative: string;
  capital_amount: string;
  fiscal_month: string;
  main_bank: string;
  memo: string;
  business_categories: number[];
}

export default function CompanyRegister() {
  const [formData, setFormData] = useState<CompanyFormData>({
    name: '',
    address: '',
    representative: '',
    capital_amount: '',
    fiscal_month: '',
    main_bank: '',
    memo: '',
    business_categories: [],
  });

  const [businessCategories, setBusinessCategories] = useState<BusinessCategory[]>([]);
  const [majorCategories, setMajorCategories] = useState<BusinessCategory[]>([]);
  const [middleCategories, setMiddleCategories] = useState<BusinessCategory[]>([]);
  const [minorCategories, setMinorCategories] = useState<BusinessCategory[]>([]);
  const [selectedMajor, setSelectedMajor] = useState('');
  const [selectedMiddle, setSelectedMiddle] = useState('');
  const [selectedMinor, setSelectedMinor] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    fetchBusinessCategories();
  }, []);

  const fetchBusinessCategories = async () => {
    try {
      const response = await axios.get('/api/business-categories?level=major');
      setMajorCategories(response.data.categories);
      setBusinessCategories(response.data.categories); // 後方互換のため
    } catch (error) {
      console.error('事業分類の取得に失敗:', error);
      // フォールバック: 固定データを使用（日本標準産業分類完全版）
      const fallbackCategories = [
        { id: 1, code: 'A', name: '農業・林業' },
        { id: 2, code: 'B', name: '漁業' },
        { id: 3, code: 'C', name: '鉱業・採石業・砂利採取業' },
        { id: 4, code: 'D', name: '建設業' },
        { id: 5, code: 'E', name: '製造業' },
        { id: 6, code: 'F', name: '電気・ガス・熱供給・水道業' },
        { id: 7, code: 'G', name: '情報通信業' },
        { id: 8, code: 'H', name: '運輸業・郵便業' },
        { id: 9, code: 'I', name: '卸売業・小売業' },
        { id: 10, code: 'J', name: '金融業・保険業' },
        { id: 11, code: 'K', name: '不動産業・物品賃貸業' },
        { id: 12, code: 'L', name: '学術研究・専門・技術サービス業' },
        { id: 13, code: 'M', name: '宿泊業・飲食サービス業' },
        { id: 14, code: 'N', name: '生活関連サービス業・娯楽業' },
        { id: 15, code: 'O', name: '教育・学習支援業' },
        { id: 16, code: 'P', name: '医療・福祉' },
        { id: 17, code: 'Q', name: '複合サービス事業' },
        { id: 18, code: 'R', name: 'サービス業（他に分類されないもの）' },
        { id: 19, code: 'S', name: '公務（他に分類されるものを除く）' },
        { id: 20, code: 'T', name: 'その他' }
      ];
      setMajorCategories(fallbackCategories);
      setBusinessCategories(fallbackCategories);
    }
  };

  const fetchMiddleCategories = async (parentId: number) => {
    try {
      console.log('Fetching middle categories for parent:', parentId);
      const response = await axios.get(`/api/business-categories?level=middle&parent_id=${parentId}`);
      console.log('Middle categories response:', response.data);
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // エラーをクリア
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleCategoryChange = (categoryId: number, checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      business_categories: checked
        ? [...prev.business_categories, categoryId]
        : prev.business_categories.filter(id => id !== categoryId)
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = '企業名は必須です';
    }

    if (!formData.representative.trim()) {
      newErrors.representative = '代表者名は必須です';
    }

    if (formData.capital_amount && isNaN(Number(formData.capital_amount))) {
      newErrors.capital_amount = '資本金は数値で入力してください';
    }

    if (formData.fiscal_month && (Number(formData.fiscal_month) < 1 || Number(formData.fiscal_month) > 12)) {
      newErrors.fiscal_month = '決算月は1-12の数値で入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const submitData = {
        ...formData,
        capital_amount: formData.capital_amount ? Number(formData.capital_amount) : undefined,
        fiscal_month: formData.fiscal_month ? Number(formData.fiscal_month) : undefined,
      };

      await axios.post('/api/company-register', submitData);
      
      setMessage('企業登録が完了しました');
      
      // フォームをリセット
      setFormData({
        name: '',
        address: '',
        representative: '',
        capital_amount: '',
        fiscal_month: '',
        main_bank: '',
        memo: '',
        business_categories: [],
      });
      
    } catch (error: any) {
      setMessage('登録に失敗しました: ' + (error.response?.data?.error || 'サーバーエラー'));
    } finally {
      setLoading(false);
    }
  };

  const months = Array.from({ length: 12 }, (_, i) => i + 1);

  return (
    <Layout>
      <div className="flex-1 overflow-auto bg-gray-50">
        <div className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900">企業登録</h1>
            <p className="mt-2 text-sm text-gray-600">
              新規企業の詳細情報を登録します
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
                      企業名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className={`w-full border rounded-md px-3 py-2 text-sm ${
                        errors.name ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="株式会社〇〇"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      代表者名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="representative"
                      value={formData.representative}
                      onChange={handleInputChange}
                      className={`w-full border rounded-md px-3 py-2 text-sm ${
                        errors.representative ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="代表取締役 田中太郎"
                    />
                    {errors.representative && <p className="text-red-500 text-xs mt-1">{errors.representative}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      住所
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="〒000-0000 東京都..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      資本金（円）
                    </label>
                    <input
                      type="text"
                      name="capital_amount"
                      value={formData.capital_amount}
                      onChange={handleInputChange}
                      className={`w-full border rounded-md px-3 py-2 text-sm ${
                        errors.capital_amount ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="10000000"
                    />
                    {errors.capital_amount && <p className="text-red-500 text-xs mt-1">{errors.capital_amount}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      決算月
                    </label>
                    <select
                      name="fiscal_month"
                      value={formData.fiscal_month}
                      onChange={handleInputChange}
                      className={`w-full border rounded-md px-3 py-2 text-sm ${
                        errors.fiscal_month ? 'border-red-500' : 'border-gray-300'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="">選択してください</option>
                      {months.map(month => (
                        <option key={month} value={month}>{month}月</option>
                      ))}
                    </select>
                    {errors.fiscal_month && <p className="text-red-500 text-xs mt-1">{errors.fiscal_month}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      取引先金融機関
                    </label>
                    <input
                      type="text"
                      name="main_bank"
                      value={formData.main_bank}
                      onChange={handleInputChange}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="〇〇銀行 △△支店"
                    />
                  </div>
                </div>
              </div>

              {/* 事業分類 */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">事業分類（階層選択）</h3>
                
                {/* 大分類選択 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    大分類
                  </label>
                  <select
                    value={selectedMajor}
                    onChange={(e) => {
                      console.log('Major category selected:', e.target.value);
                      setSelectedMajor(e.target.value);
                      setSelectedMiddle('');
                      setSelectedMinor('');
                      setMiddleCategories([]); // リセット
                      setMinorCategories([]); // リセット
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
                {selectedMajor && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      中分類 (選択肢数: {middleCategories.length})
                    </label>
                    <select
                      value={selectedMiddle}
                      onChange={(e) => {
                        console.log('Middle category selected:', e.target.value);
                        setSelectedMiddle(e.target.value);
                        setSelectedMinor('');
                        if (e.target.value) {
                          fetchMinorCategories(parseInt(e.target.value));
                        }
                      }}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- 中分類を選択 --</option>
                      {middleCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.code}: {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* 小分類選択 */}
                {selectedMiddle && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      小分類
                    </label>
                    <select
                      value={selectedMinor}
                      onChange={(e) => setSelectedMinor(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">-- 小分類を選択 --</option>
                      {minorCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.code}: {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* 選択確定ボタン */}
                {(selectedMajor || selectedMiddle || selectedMinor) && (
                  <div className="mb-4">
                    <button
                      type="button"
                      onClick={() => {
                        const targetId = selectedMinor ? parseInt(selectedMinor) : 
                                        selectedMiddle ? parseInt(selectedMiddle) : 
                                        parseInt(selectedMajor);
                        if (targetId && !formData.business_categories.includes(targetId)) {
                          handleCategoryChange(targetId, true);
                        }
                        // リセット
                        setSelectedMajor('');
                        setSelectedMiddle('');
                        setSelectedMinor('');
                        setMiddleCategories([]);
                        setMinorCategories([]);
                      }}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      選択した分類を追加
                    </button>
                  </div>
                )}

                {/* 選択された事業分類の表示 */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    選択済み事業分類
                  </label>
                  <div className="min-h-[100px] border border-gray-200 rounded-md p-3 bg-gray-50">
                    {formData.business_categories.length === 0 ? (
                      <p className="text-gray-500 text-sm">まだ事業分類が選択されていません</p>
                    ) : (
                      <div className="space-y-2">
                        {formData.business_categories.map((categoryId) => {
                          // 全ての分類から検索
                          const category = [...majorCategories, ...middleCategories, ...minorCategories]
                            .find(c => c.id === categoryId) || businessCategories.find(c => c.id === categoryId);
                          if (!category) return null;
                          return (
                            <div
                              key={categoryId}
                              className="flex items-center justify-between bg-blue-100 text-blue-800 px-3 py-2 rounded-md text-sm"
                            >
                              <span className="font-medium">
                                {category.code}: {category.name}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCategoryChange(categoryId, false)}
                                className="text-blue-600 hover:text-blue-800 ml-2 font-bold"
                                title="削除"
                              >
                                ×
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* チェックボックス形式（バックアップ表示） */}
                <details className="mt-4">
                  <summary className="text-sm text-gray-600 cursor-pointer hover:text-gray-800">
                    チェックボックス形式で選択する場合はこちら
                  </summary>
                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-md p-4 bg-gray-50">
                    {businessCategories.map((category) => (
                      <label key={category.id} className="flex items-center space-x-2 text-sm">
                        <input
                          type="checkbox"
                          checked={formData.business_categories.includes(category.id)}
                          onChange={(e) => handleCategoryChange(category.id, e.target.checked)}
                          className="text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-gray-700">{category.code}: {category.name}</span>
                      </label>
                    ))}
                  </div>
                </details>
              </div>

              {/* メモ */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  メモ
                </label>
                <textarea
                  name="memo"
                  value={formData.memo}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="その他の企業情報やメモを入力..."
                />
              </div>

              {/* 送信ボタン */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 text-white px-4 py-3 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      登録中...
                    </>
                  ) : (
                    '企業を登録'
                  )}
                </button>
              </div>

              {message && (
                <div className={`mt-4 p-3 rounded-md text-sm ${
                  message.includes('完了') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
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