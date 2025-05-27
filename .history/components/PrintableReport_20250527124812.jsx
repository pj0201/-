// c:\dev\financial-analysis-app2\components\PrintableReport.jsx
import React from 'react';
import { Box, Typography, Paper, Divider } from '@mui/material';
import BalanceSheet from './BalanceSheet'; // Assuming BalanceSheet can be reused or adapted
import IncomeStatement from './IncomeStatement'; // Assuming IncomeStatement can be reused or adapted
import FinancialRatios from './FinancialRatios'; // Assuming FinancialRatios can be reused or adapted

// This component is designed to be used with react-to-print
// It will be hidden in the normal view and only rendered for printing.

const PrintableReport = React.forwardRef(({ data, companyName, reportDate, years }, ref) => {
  if (!data) {
    return (
      <Box ref={ref} sx={{ p: 3, display: 'none' }} className="printable-content">
        <Typography variant="h5" gutterBottom>レポート生成エラー</Typography>
        <Typography>印刷するデータがありません。</Typography>
      </Box>
    );
  }

  const reportYears = years || (data.sampleData && data.sampleData.financials ? Object.keys(data.sampleData.financials.balanceSheet.cashAndDeposits) : ['2021', '2022', '2023']);


  return (
    <Box ref={ref} sx={{ p: 3, display: 'none' }} className="printable-content">
      <Paper elevation={0} sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom align="center">
          財務分析レポート
        </Typography>
        <Typography variant="h6" gutterBottom align="center">
          {companyName || '対象企業'}
        </Typography>
        <Typography variant="subtitle1" gutterBottom align="center">
          レポート作成日: {reportDate || new Date().toLocaleDateString('ja-JP')}
        </Typography>
        
        <Divider sx={{ my: 2 }} />

        <Typography variant="h5" gutterBottom sx={{ mt: 3, mb: 1 }}>
          貸借対照表
        </Typography>
        {data.balanceSheet && <BalanceSheet data={data.balanceSheet} years={reportYears} manualInputMode={false} />}
        
        <Divider sx={{ my: 2 }} />

        <Typography variant="h5" gutterBottom sx={{ mt: 3, mb: 1 }}>
          損益計算書
        </Typography>
        {data.incomeStatement && <IncomeStatement data={data.incomeStatement} years={reportYears} manualInputMode={false} />}
        
        <Divider sx={{ my: 2 }} />

        <Typography variant="h5" gutterBottom sx={{ mt: 3, mb: 1 }}>
          主要財務比率
        </Typography>
        {data.balanceSheet && data.incomeStatement && <FinancialRatios data={{balanceSheet: data.balanceSheet, incomeStatement: data.incomeStatement}} years={reportYears} />}

        {/* Add more sections as needed, e.g., charts if they can be printed well */}
        
        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Typography variant="caption">
            本レポートは提供されたデータに基づいて作成されたものです。
          </Typography>
        </Box>
      </Paper>
    </Box>
  );
});

PrintableReport.displayName = 'PrintableReport';
export default PrintableReport;
