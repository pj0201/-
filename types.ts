export type FinancialMetric = {
  id: string;
  name: string;
  category: string;
  values: {
    [year: string]: number;
  };
  benchmarks?: {
    [year: string]: number;
  };
  format?: 'percent' | 'currency' | 'number';
  unit?: string;
  description?: string;
  thresholdDirection?: 'above' | 'below';
};
