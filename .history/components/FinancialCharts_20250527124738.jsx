// c:\dev\financial-analysis-app2\components\FinancialCharts.jsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Paper, Typography, Grid, Box } from '@mui/material';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const FinancialCharts = ({ data, years = ['2019', '2020', '2021', '2022', '2023'] }) => {
  if (!data || !data.incomeStatement || !data.balanceSheet) {
    return <Typography>チャートデータを表示するためのデータがありません。</Typography>;
  }

  const incomeData = years.map(year => ({
    year,
    売上高: data.incomeStatement.revenue?.revenue?.[year] || 0,
    営業利益: data.incomeStatement.profits?.operatingProfit?.[year] || 0,
    当期純利益: data.incomeStatement.profits?.netProfit?.[year] || 0,
  }));

  const latestYear = years[years.length - 1];
  const assetsCompositionData = [
    { name: '流動資産', value: data.balanceSheet.currentAssets?.totalCurrentAssets?.[latestYear] || 0 },
    { name: '固定資産', value: data.balanceSheet.fixedAssets?.totalFixedAssets?.[latestYear] || 0 },
  ];
   const liabilitiesEquityCompositionData = [
    { name: '流動負債', value: data.balanceSheet.currentLiabilities?.totalCurrentLiabilities?.[latestYear] || 0 },
    { name: '固定負債', value: data.balanceSheet.fixedLiabilities?.totalFixedLiabilities?.[latestYear] || 0 },
    { name: '純資産', value: data.balanceSheet.equity?.totalEquity?.[latestYear] || 0 },
  ];
  
  const equityRatioData = years.map(year => ({
    year,
    自己資本比率: data.balanceSheet.totals?.totalAssets?.[year] > 0 ? 
                ((data.balanceSheet.equity?.totalEquity?.[year] || 0) / (data.balanceSheet.totals?.totalAssets?.[year] || 1)) * 100 
                : 0,
  }));


  return (
    <Box sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ mb: 2, p:1, bgcolor: 'primary.main', color: 'common.white' }}>
        財務チャート
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 300 }}>
            <Typography variant="subtitle1" gutterBottom>収益推移</Typography>
            <ResponsiveContainer width="100%" height="85%">
              <BarChart data={incomeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="売上高" fill="#8884d8" />
                <Bar dataKey="営業利益" fill="#82ca9d" />
                <Bar dataKey="当期純利益" fill="#ffc658" />
              </BarChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 300 }}>
            <Typography variant="subtitle1" gutterBottom>自己資本比率推移</Typography>
            <ResponsiveContainer width="100%" height="85%">
              <LineChart data={equityRatioData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" />
                <YAxis unit="%"/>
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="自己資本比率" stroke="#8884d8" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 300 }}>
            <Typography variant="subtitle1" gutterBottom>{latestYear}年 資産構成</Typography>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={assetsCompositionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {assetsCompositionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2, height: 300 }}>
            <Typography variant="subtitle1" gutterBottom>{latestYear}年 負債・純資産構成</Typography>
            <ResponsiveContainer width="100%" height="85%">
              <PieChart>
                <Pie
                  data={liabilitiesEquityCompositionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {liabilitiesEquityCompositionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default FinancialCharts;
