import { useState } from 'react';
import Link from 'next/link';

type FinancialMetric = {
  name: string;
  category: string;
  values: {
    [period: string]: number;
  };
  unit?: string;
  format?: 'percent' | 'currency' | 'number';
  description?: string;
};

const formatValue = (value: number, format?: string, unit?: string) => {
  if (format === 'percent') {
    return `${value.toFixed(1)}%`;
  } else if (format === 'currency') {
    return `${value.toLocaleString()}${unit || ''}`;
  }
  return `${value.toLocaleString()}${unit || ''}`;
};

export default function Compare() {
  const [selectedPeriods] = useState<string[]>(['2023', '2022', '2021', '2020', '2019']);

  const [metrics] = useState<FinancialMetric[]>([
    // 経営規模指標
    {
      name: '売上高',
      category: '経営規模',
      values: {
        '2023': 500000000,
        '2022': 480000000,
        '2021': 450000000,
        '2020': 420000000,
        '2019': 400000000,
      },
      format: 'currency',
      unit: '円'
    },
    // ... (他の指標も同様に5期分のデータを追加)
  ]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">5期比較分析</h1>
            <Link href="/" className="text-sm text-blue-600 hover:text-blue-500">
              3期比較に戻る
            </Link>
          </div>
          <p className="mt-2 text-sm text-gray-600">過去5期間の財務指標の推移を確認できます</p>
        </div>

        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-lg p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-300">
              <thead>
                <tr>
                  <th className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">指標名</th>
                  <th className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">カテゴリ</th>
                  {selectedPeriods.map((period) => (
                    <th key={period} className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">
                      {period}年度
                    </th>
                  ))}
                  <th className="py-3.5 px-3 text-left text-sm font-semibold text-gray-900">前年比</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {metrics.map((metric) => (
                  <tr key={metric.name}>
                    <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-900">{metric.name}</td>
                    <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">{metric.category}</td>
                    {selectedPeriods.map((period) => (
                      <td key={period} className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
                        {formatValue(metric.values[period], metric.format, metric.unit)}
                      </td>
                    ))}
                    <td className="whitespace-nowrap py-4 px-3 text-sm text-gray-500">
                      <span className={`inline-flex items-center ${(metric.values[selectedPeriods[0]] > metric.values[selectedPeriods[1]]) ? 'text-green-600' : 'text-red-600'}`}>
                        {(metric.values[selectedPeriods[0]] > metric.values[selectedPeriods[1]]) ? '↑' : '↓'}
                        {formatValue(Math.abs(((metric.values[selectedPeriods[0]] - metric.values[selectedPeriods[1]]) / metric.values[selectedPeriods[1]]) * 100), 'percent', '%')}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
