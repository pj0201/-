import React from 'react';

interface FinancialMetricCardProps {
  title: string;
  value: number;
  previousValue?: number;
  benchmark?: number;
  unit?: string;
  format?: 'percent' | 'currency' | 'number';
  description?: string;
}

const FinancialMetricCard: React.FC<FinancialMetricCardProps> = ({
  title,
  value,
  previousValue,
  benchmark,
  unit = '',
  format = 'number',
  description,
}) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className="mt-1 text-2xl font-semibold">
        {format === 'percent' 
          ? `${value.toFixed(1)}%%`
          : `${value.toLocaleString()}${unit}`
        }
      </p>
      {description && (
        <p className="mt-1 text-xs text-gray-500">{description}</p>
      )}
    </div>
  );
};

export default FinancialMetricCard;
