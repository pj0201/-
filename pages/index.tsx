import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  useReactTable, getCoreRowModel, flexRender, createColumnHelper, type ColumnDef,
} from '@tanstack/react-table';

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

const formatValue = (value: number, format?: string, unit?: string) => {
  if (format === 'percent') {
    return `${value.toFixed(1)}%`;
  } else if (format === 'currency') {
    return `${value.toLocaleString()}${unit || ''}`;
  }
  return `${value.toLocaleString()}${unit || ''}`;
};

export default function Home() {
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>(['2023', '2022', '2021']);
  const [metrics] = useState<FinancialMetric[]>([
    // 経営規模
    {
      name: '売上高', category: '経営規模', description: '企業の規模を示す基本的な指標', format: 'currency', unit: '百万円', values: { '2023': 500000, '2022': 480000, '2021': 470000, '2020': 450000, '2019': 430000 } },
    { name: '営業利益', category: '経営規模', description: '本業での収益力を示す指標', format: 'currency', unit: '百万円', values: { '2023': 150000, '2022': 120000, '2021': 100000, '2020': 90000, '2019': 85000 } },
    { name: '経常利益', category: '経営規模', description: '営業外収益・費用も含む利益', format: 'currency', unit: '百万円', values: { '2023': 140000, '2022': 115000, '2021': 95000, '2020': 87000, '2019': 82000 } },
    { name: '純利益', category: '経営規模', description: '最終的な利益', format: 'currency', unit: '百万円', values: { '2023': 100000, '2022': 90000, '2021': 80000, '2020': 70000, '2019': 65000 } },
    { name: '総資産', category: '経営規模', description: '企業が保有する全資産の合計', format: 'currency', unit: '百万円', values: { '2023': 800000, '2022': 780000, '2021': 760000, '2020': 740000, '2019': 720000 } },
    { name: '純資産', category: '経営規模', description: '総資産から負債を差し引いた額', format: 'currency', unit: '百万円', values: { '2023': 400000, '2022': 380000, '2021': 360000, '2020': 340000, '2019': 320000 } },

    // 収益性
    { name: 'ROE', category: '収益性', description: '自己資本利益率', format: 'percent', unit: '%', values: { '2023': 8.5, '2022': 7.2, '2021': 6.9, '2020': 6.2, '2019': 5.8 } },
    { name: 'ROA', category: '収益性', description: '総資産利益率', format: 'percent', unit: '%', values: { '2023': 4.1, '2022': 3.8, '2021': 3.5, '2020': 3.2, '2019': 3.0 } },
    { name: '営業利益率', category: '収益性', description: '売上高に対する営業利益の割合', format: 'percent', unit: '%', values: { '2023': 30.0, '2022': 25.0, '2021': 21.3, '2020': 20.0, '2019': 19.8 } },
    { name: '経常利益率', category: '収益性', description: '売上高に対する経常利益の割合', format: 'percent', unit: '%', values: { '2023': 28.0, '2022': 24.0, '2021': 20.2, '2020': 19.3, '2019': 19.1 } },
    { name: '売上高総利益率', category: '収益性', description: '売上高に対する売上総利益の割合', format: 'percent', unit: '%', values: { '2023': 45.0, '2022': 43.5, '2021': 41.2, '2020': 40.0, '2019': 39.5 } },
    { name: 'ROI', category: '収益性', description: '投下資本利益率', format: 'percent', unit: '%', values: { '2023': 9.1, '2022': 8.7, '2021': 8.2, '2020': 7.8, '2019': 7.5 } },

    // 生産性
    { name: '労働生産性', category: '生産性', description: '従業員1人あたりの付加価値額', format: 'currency', unit: '万円', values: { '2023': 1200, '2022': 1150, '2021': 1100, '2020': 1050, '2019': 1000 } },
    { name: '資本生産性', category: '生産性', description: '資本1単位あたりの付加価値額', format: 'currency', unit: '万円', values: { '2023': 500, '2022': 490, '2021': 480, '2020': 470, '2019': 460 } },
    { name: '従業員一人当たり売上高', category: '生産性', description: '従業員1人あたりの売上高', format: 'currency', unit: '万円', values: { '2023': 3000, '2022': 2950, '2021': 2900, '2020': 2850, '2019': 2800 } },
    { name: '従業員一人当たり営業利益', category: '生産性', description: '従業員1人あたりの営業利益', format: 'currency', unit: '万円', values: { '2023': 900, '2022': 880, '2021': 860, '2020': 850, '2019': 840 } },

    // 安全性
    { name: '流動比率', category: '安全性', description: '短期的な支払能力を示す指標', format: 'percent', unit: '%', values: { '2023': 128.5, '2022': 122.3, '2021': 119.7, '2020': 115.0, '2019': 110.0 } },
    { name: '当座比率', category: '安全性', description: '現金・預金などの即時支払能力', format: 'percent', unit: '%', values: { '2023': 98.2, '2022': 95.1, '2021': 92.5, '2020': 90.0, '2019': 88.0 } },
    { name: '自己資本比率', category: '安全性', description: '自己資本の割合を示す指標', format: 'percent', unit: '%', values: { '2023': 45.2, '2022': 43.1, '2021': 41.8, '2020': 40.0, '2019': 38.5 } },
    { name: '有利子負債比率', category: '安全性', description: '有利子負債の自己資本に対する割合', format: 'percent', unit: '%', values: { '2023': 60.3, '2022': 62.1, '2021': 63.5, '2020': 65.0, '2019': 66.0 } },
    { name: '固定比率', category: '安全性', description: '固定資産の自己資本に対する割合', format: 'percent', unit: '%', values: { '2023': 80.0, '2022': 82.0, '2021': 83.0, '2020': 85.0, '2019': 87.0 } },
    { name: '固定長期適合率', category: '安全性', description: '固定資産が長期資本で賄われているか', format: 'percent', unit: '%', values: { '2023': 95.0, '2022': 96.0, '2021': 97.0, '2020': 98.0, '2019': 99.0 } },

    // 成長性
    { name: '売上高成長率', category: '成長性', description: '売上高の前年比成長率', format: 'percent', unit: '%', values: { '2023': 4.2, '2022': 2.1, '2021': 4.4, '2020': 4.7, '2019': 5.1 } },
    { name: '営業利益成長率', category: '成長性', description: '営業利益の前年比成長率', format: 'percent', unit: '%', values: { '2023': 25.0, '2022': 20.0, '2021': 11.1, '2020': 5.9, '2019': 6.3 } },
    { name: 'EPS（一株当たり利益）', category: '成長性', description: '一株あたりの純利益', format: 'currency', unit: '円', values: { '2023': 210.5, '2022': 180.2, '2021': 160.8, '2020': 150.0, '2019': 140.0 } },
    { name: 'BPS（一株当たり純資産）', category: '成長性', description: '一株あたりの純資産', format: 'currency', unit: '円', values: { '2023': 1800.0, '2022': 1700.0, '2021': 1600.0, '2020': 1500.0, '2019': 1400.0 } },

    // 経営効率
    { name: '総資産回転率', category: '経営効率', description: '総資産に対する売上高の割合', format: 'number', unit: '回', values: { '2023': 0.62, '2022': 0.61, '2021': 0.62, '2020': 0.61, '2019': 0.60 } },
    { name: '売上債権回転率', category: '経営効率', description: '売上債権の回収効率', format: 'number', unit: '回', values: { '2023': 8.2, '2022': 8.0, '2021': 7.9, '2020': 7.8, '2019': 7.7 } },
    { name: '棚卸資産回転率', category: '経営効率', description: '棚卸資産の回転効率', format: 'number', unit: '回', values: { '2023': 6.0, '2022': 5.9, '2021': 5.8, '2020': 5.7, '2019': 5.6 } },
    { name: '営業キャッシュフロー', category: '経営効率', description: '営業活動によるキャッシュの流入出', format: 'currency', unit: '百万円', values: { '2023': 135000, '2022': 128000, '2021': 120000, '2020': 115000, '2019': 110000 } },

    // 資産・負債
    { name: '自己資本', category: '資産・負債', description: '株主資本の金額', format: 'currency', unit: '百万円', values: { '2023': 360000, '2022': 340000, '2021': 320000, '2020': 310000, '2019': 300000 } },
    { name: '負債合計', category: '資産・負債', description: '全負債の合計', format: 'currency', unit: '百万円', values: { '2023': 400000, '2022': 400000, '2021': 400000, '2020': 400000, '2019': 400000 } },

    // 損益分岐点
    { name: '損益分岐点売上高', category: '損益分岐点', description: '損益分岐点となる売上高', format: 'currency', unit: '百万円', values: { '2023': 120000, '2022': 115000, '2021': 110000, '2020': 108000, '2019': 105000 } },
    { name: '損益分岐点比率', category: '損益分岐点', description: '損益分岐点売上高の売上高に対する割合', format: 'percent', unit: '%', values: { '2023': 24.0, '2022': 23.9, '2021': 23.4, '2020': 24.0, '2019': 24.4 } },
    { name: 'EPS（一株当たり利益）', category: '成長性', description: '一株あたりの純利益', format: 'currency', unit: '円', values: { '2023': 210.5, '2022': 180.2, '2021': 160.8, '2020': 150.0, '2019': 140.0 } },
    { name: 'BPS（一株当たり純資産）', category: '成長性', description: '一株あたりの純資産', format: 'currency', unit: '円', values: { '2023': 1800.0, '2022': 1700.0, '2021': 1600.0, '2020': 1500.0, '2019': 1400.0 } },
    { name: '自己資本利益率（ROE）', category: '収益性', description: '自己資本に対する利益の割合', format: 'percent', unit: '%', values: { '2023': 8.5, '2022': 7.2, '2021': 6.9 } },
  ]);

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

  const table = useReactTable({
    data: metrics,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 sm:px-0">
          <div className="mt-6 bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">財務指標分析</h2>
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
                className={`px-4 py-2 text-sm font-medium rounded-md ${selectedPeriods[0] === '2023' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setSelectedPeriods(['2023', '2022', '2021'])}
              >
                直近期
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md ${selectedPeriods[0] === '2022' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setSelectedPeriods(['2022', '2021', '2020'])}
              >
                前期
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium rounded-md ${selectedPeriods[0] === '2021' ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setSelectedPeriods(['2021', '2020', '2019'])}
              >
                前々期
              </button>
            </div>
          </div>
        </div>
        <div className="mt-8">
          <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">クイックアクション</h2>
            <div className="space-y-4">
              <Link href="/upload" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 w-full justify-center">
                新規ファイルをアップロード
              </Link>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 w-full justify-center">
                分析レポートを表示
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

