// c:\dev\financial-analysis-app2\components\FinancialRatios.jsx
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Tooltip,
  IconButton
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

// 仮の財務比率データと計算ロジック
const calculateRatios = (data, year) => {
  if (!data || !data.balanceSheet || !data.incomeStatement) {
    return {};
  }

  const bs = data.balanceSheet;
  const is = data.incomeStatement;

  // 安全性分析
  const currentAssets = bs.currentAssets?.totalCurrentAssets?.[year] || 0;
  const currentLiabilities = bs.currentLiabilities?.totalCurrentLiabilities?.[year] || 0;
  const fixedAssets = bs.fixedAssets?.totalFixedAssets?.[year] || 0;
  const totalAssets = bs.totals?.totalAssets?.[year] || 0;
  const equity = bs.equity?.totalEquity?.[year] || 0;
  
  const currentRatio = currentLiabilities > 0 ? (currentAssets / currentLiabilities) * 100 : null;
  const quickRatio = currentLiabilities > 0 ? ((bs.currentAssets?.cashAndDeposits?.[year] || 0) + (bs.currentAssets?.accountsReceivable?.[year] || 0)) / currentLiabilities * 100 : null;
  const fixedRatio = equity > 0 ? (fixedAssets / equity) * 100 : null;
  const equityRatio = totalAssets > 0 ? (equity / totalAssets) * 100 : null;

  // 収益性分析
  const revenue = is.revenue?.revenue?.[year] || 0;
  const grossProfit = is.profits?.grossProfit?.[year] || 0;
  const operatingProfit = is.profits?.operatingProfit?.[year] || 0;
  const netProfit = is.profits?.netProfit?.[year] || 0;

  const grossProfitMargin = revenue > 0 ? (grossProfit / revenue) * 100 : null;
  const operatingProfitMargin = revenue > 0 ? (operatingProfit / revenue) * 100 : null;
  const netProfitMargin = revenue > 0 ? (netProfit / revenue) * 100 : null;
  const roa = totalAssets > 0 ? (netProfit / totalAssets) * 100 : null;
  const roe = equity > 0 ? (netProfit / equity) * 100 : null;
  
  // 活動性分析 (仮の売掛債権回転期間と棚卸資産回転期間)
  const accountsReceivable = bs.currentAssets?.accountsReceivable?.[year] || 0;
  const inventory = bs.currentAssets?.inventory?.[year] || 0;
  const accountsReceivableTurnover = revenue > 0 && accountsReceivable > 0 ? revenue / accountsReceivable : null;
  const inventoryTurnover = (is.expenses?.costOfSales?.[year] || 0) > 0 && inventory > 0 ? (is.expenses?.costOfSales?.[year] || 0) / inventory : null;


  return {
    // 安全性
    currentRatio: { value: currentRatio, unit: '%', description: '流動比率: 流動資産 ÷ 流動負債 × 100。短期的な支払い能力を示す。目安は200%以上。' },
    quickRatio: { value: quickRatio, unit: '%', description: '当座比率: (現金・預金 + 売掛金) ÷ 流動負債 × 100。より厳密な短期支払い能力を示す。目安は100%以上。' },
    fixedRatio: { value: fixedRatio, unit: '%', description: '固定比率: 固定資産 ÷ 自己資本 × 100。設備投資が自己資本でどれだけ賄われているかを示す。目安は100%以下。' },
    equityRatio: { value: equityRatio, unit: '%', description: '自己資本比率: 自己資本 ÷ 総資産 × 100。総資本に占める自己資本の割合。高いほど財務安定性が高い。目安は40%以上。' },
    // 収益性
    grossProfitMargin: { value: grossProfitMargin, unit: '%', description: '売上高総利益率: 売上総利益 ÷ 売上高 × 100。商品やサービスの基本的な収益力を示す。' },
    operatingProfitMargin: { value: operatingProfitMargin, unit: '%', description: '売上高営業利益率: 営業利益 ÷ 売上高 × 100。本業での稼ぐ力を示す。' },
    netProfitMargin: { value: netProfitMargin, unit: '%', description: '売上高当期純利益率: 当期純利益 ÷ 売上高 × 100。最終的な利益率を示す。' },
    roa: { value: roa, unit: '%', description: '総資産利益率 (ROA): 当期純利益 ÷ 総資産 × 100。総資産をどれだけ効率的に利益に結びつけているかを示す。' },
    roe: { value: roe, unit: '%', description: '自己資本利益率 (ROE): 当期純利益 ÷ 自己資本 × 100。自己資本をどれだけ効率的に利益に結びつけているかを示す。株主視点の重要な指標。' },
    // 活動性
    accountsReceivableTurnover: { value: accountsReceivableTurnover, unit: '回', description: '売上債権回転率: 売上高 ÷ 売上債権。売上債権の回収効率を示す。高いほど効率が良い。' },
    inventoryTurnover: { value: inventoryTurnover, unit: '回', description: '棚卸資産回転率: 売上原価 ÷ 棚卸資産。棚卸資産の運用効率を示す。高いほど効率が良い。' },
  };
};

const ratioCategories = [
  {
    name: '安全性分析',
    ratios: ['currentRatio', 'quickRatio', 'fixedRatio', 'equityRatio']
  },
  {
    name: '収益性分析',
    ratios: ['grossProfitMargin', 'operatingProfitMargin', 'netProfitMargin', 'roa', 'roe']
  },
  {
    name: '活動性分析',
    ratios: ['accountsReceivableTurnover', 'inventoryTurnover']
  }
];

const FinancialRatios = ({ data, years = ['2021', '2022', '2023'] }) => {
  if (!data) return <Typography>財務比率データを計算するためのデータがありません。</Typography>;

  const yearlyRatios = years.reduce((acc, year) => {
    acc[year] = calculateRatios(data, year);
    return acc;
  }, {});

  return (
    <TableContainer component={Paper} sx={{ mt: 2 }}>
      <Typography variant="h6" sx={{ p: 2, bgcolor: 'primary.main', color: 'common.white' }}>
        主要財務比率
      </Typography>
      <Table size="small">
        <TableHead sx={{ bgcolor: '#f5f5f5' }}>
          <TableRow>
            <TableCell>指標名</TableCell>
            {years.map(year => (
              <TableCell key={year} align="right">{year}年</TableCell>
            ))}
            <TableCell align="center">解説</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {ratioCategories.map(category => (
            <React.Fragment key={category.name}>
              <TableRow sx={{ bgcolor: '#e0e0e0' }}>
                <TableCell colSpan={years.length + 2} sx={{ fontWeight: 'bold' }}>
                  {category.name}
                </TableCell>
              </TableRow>
              {category.ratios.map(ratioKey => {
                const firstYearRatio = yearlyRatios[years[0]]?.[ratioKey];
                if (!firstYearRatio) return null; // データがない場合は表示しない

                return (
                  <TableRow key={ratioKey}>
                    <TableCell>{firstYearRatio.description.split(':')[0]}</TableCell>
                    {years.map(year => {
                      const ratioData = yearlyRatios[year]?.[ratioKey];
                      return (
                        <TableCell key={year} align="right">
                          {ratioData && ratioData.value !== null ? `${ratioData.value.toFixed(2)}${ratioData.unit}` : '-'}
                        </TableCell>
                      );
                    })}
                    <TableCell align="center">
                      <Tooltip title={firstYearRatio.description}>
                        <IconButton size="small">
                          <InfoOutlinedIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default FinancialRatios;
