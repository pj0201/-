import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  useReactTable, getCoreRowModel, flexRender, createColumnHelper, type ColumnDef,
} from '@tanstack/react-table';
import Layout from '../components/layout/Layout';
import axios from 'axios';

type UploadedFile = {
  id: number;
  name: string;
  type: 'bs' | 'pl';
  date: string;
};

type FinancialPeriod = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
};

type FinancialMetric = {
  name: string;
  category: string;
  values: {
    [period: string]: number;
  };
  unit?: string; // 単位（円、%、倍など）
  format?: 'percent' | 'currency' | 'number'; // 表示形式
  description?: string; // 指標の説明
};

const columnHelper = createColumnHelper<FinancialMetric>();

const calculateChange = (currentValue: number, previousValue: number, format?: string, unit?: string) => {
  if (format === 'currency') {
    const diff = currentValue - previousValue;
    const isPositive = diff > 0;
    return (
      <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
        {isPositive ? '+' : ''}{diff.toLocaleString()}{unit || ''}
      </span>
    );
  } else {
    const change = previousValue !== 0 ? ((currentValue - previousValue) / previousValue) * 100 : 0;
    const isPositive = change > 0;
    return (
      <span className={isPositive ? 'text-green-600' : 'text-red-600'}>
        {isPositive ? '+' : ''}{change.toFixed(1)}%
      </span>
    );
  }
};

const formatValue = (value: number | null | undefined, format?: string, unit?: string) => {
  if (value === null || value === undefined) {
    return '-';
  }
  if (format === 'percent') {
    return `${value.toFixed(1)}%`;
  } else if (format === 'currency') {
    return `${value.toLocaleString()}${unit || ''}`;
  }
  return `${value.toLocaleString()}${unit || ''}`;
};

export default function Home() {
  const router = useRouter();
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>(['2025', '2024', '2023']);
  const [companyName, setCompanyName] = useState<string>('株式会社サンプル企業');
  const [companies, setCompanies] = useState<any[]>([]);
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(null);
  const [financialData, setFinancialData] = useState<any[]>([]);
  const [systemMessages, setSystemMessages] = useState<string[]>([]);

  useEffect(() => {
    // URLパラメータから企業IDを取得
    const { companyId } = router.query;
    if (companyId) {
      setSelectedCompanyId(parseInt(companyId as string));
      // 企業情報を取得してcompanyNameを更新
      fetchCompanyInfo(parseInt(companyId as string));
    }
    fetchCompanies();
  }, [router.query]);

  const fetchCompanies = async () => {
    try {
      const response = await axios.get('/api/companies');
      setCompanies(response.data);
    } catch (error) {
      console.error('企業データの取得に失敗:', error);
    }
  };

  const fetchCompanyInfo = async (companyId: number) => {
    try {
      const response = await axios.get('/api/companies');
      const company = response.data.find((c: any) => c.id === companyId);
      if (company) {
        setCompanyName(company.name);
        // 財務データも取得
        await fetchFinancialData(companyId);
      }
    } catch (error) {
      console.error('企業情報の取得に失敗:', error);
    }
  };

  const fetchFinancialData = async (companyId: number) => {
    const data: any[] = [];
    const messages: string[] = [];
    
    console.log(`財務データを取得中: companyId=${companyId}, periods=`, selectedPeriods);
    
    for (const period of selectedPeriods) {
      try {
        const response = await axios.get(`/api/financial-data/${companyId}/${period}`);
        console.log(`${period}年度の財務データ取得成功:`, response.data);
        data.push({
          period,
          metrics: response.data.metrics,
          confidence: response.data.confidence
        });
      } catch (error) {
        console.log(`${period}年度の財務データが見つかりません:`, error);
        messages.push(`${period}年度: 財務データが未登録です。決算書をアップロードしてください。`);
      }
    }
    
    console.log('最終的な財務データ:', data);
    setFinancialData(data);
    setSystemMessages(messages);
  };

  const handleCompanyChange = (companyId: number) => {
    console.log('企業選択変更:', { companyId, previousId: selectedCompanyId });
    setSelectedCompanyId(companyId);
    const company = companies.find(c => c.id === companyId);
    if (company) {
      console.log('企業情報:', company);
      setCompanyName(company.name);
      fetchFinancialData(companyId);
      router.push(`/?companyId=${companyId}`, undefined, { shallow: true });
    }
  };

  const defaultMetrics: FinancialMetric[] = [
    // 1. 経営規模（基本的な財務数値）
    { name: '売上高', category: '経営規模', description: '企業の規模を示す基本的な指標', format: 'currency', unit: '円', values: { '2025': 500000000, '2024': 480000000, '2023': 470000000 } },
    { name: '営業利益', category: '経営規模', description: '本業での収益力を示す指標', format: 'currency', unit: '円', values: { '2025': 75000000, '2024': 72000000, '2023': 70000000 } },
    { name: '経常利益', category: '経営規模', description: '営業外収益・費用も含む利益', format: 'currency', unit: '円', values: { '2025': 70000000, '2024': 67000000, '2023': 65000000 } },
    { name: '当期純利益', category: '経営規模', description: '最終的な利益', format: 'currency', unit: '円', values: { '2025': 50000000, '2024': 48000000, '2023': 46000000 } },
    { name: '総資産', category: '経営規模', description: '企業が保有する全資産の合計', format: 'currency', unit: '円', values: { '2025': 800000000, '2024': 780000000, '2023': 760000000 } },
    { name: '純資産', category: '経営規模', description: '総資産から負債を差し引いた額', format: 'currency', unit: '円', values: { '2025': 400000000, '2024': 380000000, '2023': 360000000 } },

    // 2. 収益性（利益率・効率性）
    { name: 'ROE（自己資本利益率）', category: '収益性', description: '自己資本に対する利益の割合', format: 'percent', unit: '%', values: { '2025': 12.5, '2024': 12.6, '2023': 12.8 } },
    { name: 'ROA（総資産利益率）', category: '収益性', description: '総資産に対する利益の割合', format: 'percent', unit: '%', values: { '2025': 6.3, '2024': 6.2, '2023': 6.1 } },
    { name: '売上高総利益率', category: '収益性', description: '売上高に対する売上総利益の割合', format: 'percent', unit: '%', values: { '2025': 45.0, '2024': 44.5, '2023': 44.0 } },
    { name: '営業利益率', category: '収益性', description: '売上高に対する営業利益の割合', format: 'percent', unit: '%', values: { '2025': 15.0, '2024': 15.0, '2023': 14.9 } },
    { name: '経常利益率', category: '収益性', description: '売上高に対する経常利益の割合', format: 'percent', unit: '%', values: { '2025': 14.0, '2024': 14.0, '2023': 13.8 } },
    { name: '売上高純利益率', category: '収益性', description: '売上高に対する純利益の割合', format: 'percent', unit: '%', values: { '2025': 10.0, '2024': 10.0, '2023': 9.8 } },

    // 3. 安全性（支払能力・財務安定性）
    { name: '流動比率', category: '安全性', description: '短期的な支払能力を示す指標', format: 'percent', unit: '%', values: { '2025': 128.5, '2024': 125.0, '2023': 120.0 } },
    { name: '当座比率', category: '安全性', description: '現金・預金などの即時支払能力', format: 'percent', unit: '%', values: { '2025': 95.0, '2024': 93.0, '2023': 90.0 } },
    { name: '自己資本比率', category: '安全性', description: '自己資本の割合を示す指標', format: 'percent', unit: '%', values: { '2025': 50.0, '2024': 48.7, '2023': 47.4 } },
    { name: '固定比率', category: '安全性', description: '固定資産の自己資本に対する割合', format: 'percent', unit: '%', values: { '2025': 80.0, '2024': 82.0, '2023': 85.0 } },
    { name: '固定長期適合率', category: '安全性', description: '固定資産が長期資本で賄われているか', format: 'percent', unit: '%', values: { '2025': 75.0, '2024': 77.0, '2023': 80.0 } },

    // 4. 効率性（資産活用効率）
    { name: '総資産回転率', category: '効率性', description: '総資産に対する売上高の割合', format: 'number', unit: '回', values: { '2025': 0.63, '2024': 0.62, '2023': 0.62 } },
    { name: '売上債権回転率', category: '効率性', description: '売上債権の回収効率', format: 'number', unit: '回', values: { '2025': 8.0, '2024': 7.8, '2023': 7.5 } },
    { name: '棚卸資産回転率', category: '効率性', description: '棚卸資産の回転効率', format: 'number', unit: '回', values: { '2025': 6.0, '2024': 5.8, '2023': 5.5 } },

    // 5. 成長性（前年比成長率）
    { name: '売上高成長率', category: '成長性', description: '売上高の前年比成長率', format: 'percent', unit: '%', values: { '2025': 4.2, '2024': 2.1, '2023': 3.5 } },
    { name: '営業利益成長率', category: '成長性', description: '営業利益の前年比成長率', format: 'percent', unit: '%', values: { '2025': 4.2, '2024': 2.9, '2023': 5.0 } },
    { name: '純利益成長率', category: '成長性', description: '純利益の前年比成長率', format: 'percent', unit: '%', values: { '2025': 4.2, '2024': 4.3, '2023': 6.0 } },
    { name: '総資産成長率', category: '成長性', description: '総資産の前年比成長率', format: 'percent', unit: '%', values: { '2025': 2.6, '2024': 2.6, '2023': 2.0 } },
  ];

  // 実際の財務データから動的メトリクスを生成（useMemoで最適化）
  const dynamicMetrics = React.useMemo(() => {
    console.log('動的メトリクス計算中:', { financialDataLength: financialData.length, selectedCompanyId });
    
    if (financialData.length === 0) {
      console.log('財務データが空のため、デフォルトメトリクスを使用');
      // デフォルトのサンプルデータを返す
      return { metrics: defaultMetrics, messages: [] };
    }

    console.log('実際の財務データから動的メトリクスを生成:', financialData);
    const dynamicMetrics: FinancialMetric[] = [];
    const messages: string[] = [];

    // 各期間のデータから指標を計算
    const periodValues: { [key: string]: any } = {};
    
    financialData.forEach(yearData => {
      const period = yearData.period;
      const m = yearData.metrics;
      
      console.log(`${period}年度のメトリクス処理:`, m);
      
      periodValues[period] = {
        sales: m.rawData?.sales || null,
        totalAssets: m.rawData?.totalAssets || null,
        totalEquity: m.rawData?.totalEquity || null,
        netIncome: m.rawData?.netIncome || null,
        operatingProfit: m.rawData?.operatingProfit || null,
        grossProfitMargin: m.profitability?.grossProfitMargin || null,
        operatingProfitMargin: m.profitability?.operatingProfitMargin || null,
        netProfitMargin: m.profitability?.netProfitMargin || null,
        roa: m.profitability?.roa || null,
        roe: m.profitability?.roe || null,
        currentRatio: m.safety?.currentRatio || null,
        equityRatio: m.safety?.equityRatio || null,
        debtRatio: m.safety?.debtRatio || null
      };
      
      console.log(`${period}年度の値:`, periodValues[period]);
    });

    // 経営規模指標
    const createMetric = (name: string, category: string, description: string, format: any, unit: string, valueKey: string) => {
      const values: { [period: string]: number } = {};
      let hasData = false;
      
      selectedPeriods.forEach(period => {
        if (periodValues[period] && periodValues[period][valueKey] !== null) {
          values[period] = periodValues[period][valueKey];
          hasData = true;
        }
      });
      
      if (!hasData) {
        messages.push(`${name}: データが不足しています。${category}の計算に必要な基礎数値を確認してください。`);
      }
      
      return { name, category, description, format, unit, values };
    };

    // 1. 経営規模指標
    dynamicMetrics.push(createMetric('売上高', '経営規模', '企業の規模を示す基本的な指標', 'currency', '円', 'sales'));
    dynamicMetrics.push(createMetric('営業利益', '経営規模', '本業での収益力を示す指標', 'currency', '円', 'operatingProfit'));
    dynamicMetrics.push(createMetric('当期純利益', '経営規模', '最終的な利益', 'currency', '円', 'netIncome'));
    dynamicMetrics.push(createMetric('総資産', '経営規模', '企業が保有する全資産の合計', 'currency', '円', 'totalAssets'));
    dynamicMetrics.push(createMetric('純資産', '経営規模', '総資産から負債を差し引いた額', 'currency', '円', 'totalEquity'));

    // 2. 収益性指標
    dynamicMetrics.push(createMetric('ROE（自己資本利益率）', '収益性', '自己資本に対する利益の割合', 'percent', '%', 'roe'));
    dynamicMetrics.push(createMetric('ROA（総資産利益率）', '収益性', '総資産に対する利益の割合', 'percent', '%', 'roa'));
    dynamicMetrics.push(createMetric('売上高総利益率', '収益性', '売上高に対する売上総利益の割合', 'percent', '%', 'grossProfitMargin'));
    dynamicMetrics.push(createMetric('営業利益率', '収益性', '売上高に対する営業利益の割合', 'percent', '%', 'operatingProfitMargin'));
    dynamicMetrics.push(createMetric('売上高純利益率', '収益性', '売上高に対する純利益の割合', 'percent', '%', 'netProfitMargin'));

    // 3. 安全性指標
    dynamicMetrics.push(createMetric('流動比率', '安全性', '短期的な支払能力を示す指標', 'percent', '%', 'currentRatio'));
    dynamicMetrics.push(createMetric('自己資本比率', '安全性', '自己資本の割合を示す指標', 'percent', '%', 'equityRatio'));

    const finalMetrics = dynamicMetrics.filter(m => Object.keys(m.values).length > 0);
    console.log('最終的な動的メトリクス:', finalMetrics);
    console.log('メッセージ:', messages);
    
    // 最初の指標の詳細を表示
    if (finalMetrics.length > 0) {
      console.log('最初の指標の詳細:', finalMetrics[0]);
    }
    
    return {
      metrics: finalMetrics,
      messages
    };
  }, [financialData, selectedPeriods]);

  // システムメッセージを別途useEffectで管理
  React.useEffect(() => {
    setSystemMessages(dynamicMetrics.messages || []);
  }, [dynamicMetrics.messages]);

  const columns = React.useMemo<ColumnDef<FinancialMetric, any>[]>(() => [
    columnHelper.accessor('name', {
      header: () => '指標名',
      cell: info => (
        <div>
          <div className="text-base font-semibold text-gray-900">{info.getValue()}</div>
          {info.row.original.description && (
            <div className="text-xs text-gray-400 mt-0.5">{info.row.original.description}</div>
          )}
        </div>
      ),
    }),
    columnHelper.accessor('category', {
      header: () => 'カテゴリ',
      cell: info => {
        const category = info.getValue();
        let colorClass = '';
        switch (category) {
          case '経営効率':
            colorClass = 'bg-emerald-100 text-emerald-800';
            break;
          case 'リスク管理':
            colorClass = 'bg-rose-100 text-rose-800';
            break;
          case '経営規模':
            colorClass = 'bg-blue-100 text-blue-800';
            break;
          case '収益性':
            colorClass = 'bg-green-100 text-green-800';
            break;
          case '安全性':
            colorClass = 'bg-blue-100 text-blue-800';
            break;
          case '財務健全性':
            colorClass = 'bg-yellow-100 text-yellow-800';
            break;
          case '成長性':
            colorClass = 'bg-purple-100 text-purple-800';
            break;
          case '資産・負債':
            colorClass = 'bg-orange-100 text-orange-800';
            break;
          default:
            colorClass = 'bg-gray-100 text-gray-800';
        }
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
            {category}
          </span>
        );
      },
    }),
    // 3期分の年度と差分を交互に表示
    columnHelper.accessor(row => row.values[selectedPeriods[2]], {
      id: 'period2',
      header: () => `${selectedPeriods[2]}年度`,
      cell: info => formatValue(info.getValue(), info.row.original.format, info.row.original.unit),
    }),
    // 差分（2→1）
    {
      id: 'diff21',
      header: () => `${selectedPeriods[1]}との差`,
      cell: info => {
        const row = info.row.original;
        return calculateChange(row.values[selectedPeriods[1]], row.values[selectedPeriods[2]], row.format, row.unit);
      },
    },
    columnHelper.accessor(row => row.values[selectedPeriods[1]], {
      id: 'period1',
      header: () => `${selectedPeriods[1]}年度`,
      cell: info => formatValue(info.getValue(), info.row.original.format, info.row.original.unit),
    }),
    // 差分（1→0）
    {
      id: 'diff10',
      header: () => `${selectedPeriods[0]}との差`,
      cell: info => {
        const row = info.row.original;
        return calculateChange(row.values[selectedPeriods[0]], row.values[selectedPeriods[1]], row.format, row.unit);
      },
    },
    columnHelper.accessor(row => row.values[selectedPeriods[0]], {
      id: 'period0',
      header: () => `${selectedPeriods[0]}年度`,
      cell: info => formatValue(info.getValue(), info.row.original.format, info.row.original.unit),
    }),
  ], [selectedPeriods]);

  // 動的メトリクスまたはデフォルトメトリクスを使用
  const displayMetrics = selectedCompanyId ? dynamicMetrics.metrics : defaultMetrics;
  
  console.log('表示メトリクス選択:', {
    selectedCompanyId,
    dynamicMetricsCount: dynamicMetrics.metrics.length,
    displayMetricsCount: displayMetrics.length,
    usingDynamic: selectedCompanyId ? true : false
  });

  const table = useReactTable({
    data: displayMetrics,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <Layout>
      {/* ヘッダー */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-gray-900">財務指標分析</h1>
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">対象企業</label>
                <select
                  value={selectedCompanyId || 0}
                  onChange={(e) => {
                    const id = parseInt(e.target.value);
                    if (id > 0) handleCompanyChange(id);
                  }}
                  className="text-sm font-medium text-gray-900 border border-gray-300 rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value={0}>企業を選択してください</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>
                      {company.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-gray-900">{companyName}</div>
                <div className="text-xs text-gray-500">選択中の企業</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="mt-6 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">財務指標一覧</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-300">
                <thead>
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id}>
                      {headerGroup.headers.map(header => (
                        <th key={header.id} className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {table.getRowModel().rows.map(row => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} className="py-4 px-3 text-sm text-gray-500">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex space-x-2">
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md ${selectedPeriods[0] === '2025' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => {
                  setSelectedPeriods(['2025', '2024', '2023']);
                  if (selectedCompanyId) fetchFinancialData(selectedCompanyId);
                }}
              >
                直近期
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md ${selectedPeriods[0] === '2024' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => {
                  setSelectedPeriods(['2024', '2023', '2022']);
                  if (selectedCompanyId) fetchFinancialData(selectedCompanyId);
                }}
              >
                前期
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md ${selectedPeriods[0] === '2023' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => {
                  setSelectedPeriods(['2023', '2022', '2021']);
                  if (selectedCompanyId) fetchFinancialData(selectedCompanyId);
                }}
              >
                前々期
              </button>
            </div>
          </div>

          {/* システムメッセージ表示 */}
          {systemMessages.length > 0 && (
            <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-yellow-800 mb-2">システムからのお知らせ</h3>
              <ul className="text-sm text-yellow-700 space-y-1">
                {systemMessages.map((message, index) => (
                  <li key={index} className="flex items-start">
                    <svg className="h-4 w-4 text-yellow-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    {message}
                  </li>
                ))}
              </ul>
              <div className="mt-3 text-xs text-yellow-600">
                <p>対処方法:</p>
                <ul className="list-disc list-inside space-y-1 mt-1">
                  <li>未登録の年度: メニューの「財務資料UP」から決算書をアップロードしてください</li>
                  <li>計算エラー: 必要な基礎数値（売上高、資産、負債等）が抽出されているか確認してください</li>
                  <li>数値異常: アップロードしたファイルの内容や品質を確認してください</li>
                </ul>
              </div>
            </div>
          )}
        </div>
        </div>
      </div>
    </Layout>
  );
}

