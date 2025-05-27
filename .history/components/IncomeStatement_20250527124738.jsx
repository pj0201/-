// c:\dev\financial-analysis-app2\components\IncomeStatement.jsx
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  Button,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

const IncomeStatement = ({ data, years = ['2019', '2020', '2021', '2022', '2023'], manualInputMode }) => {
  const [editingCell, setEditingCell] = useState(null);
  const [manuallyEditedCells, setManuallyEditedCells] = useState({});
  const [editedValues, setEditedValues] = useState({});

  // 前年比計算ヘルパー関数
  const calculateYoyChange = (current, previous) => {
    if (!previous || previous === 0) return null;
    const change = ((current - previous) / previous) * 100;
    // 増加の場合は+、減少の場合は-を付ける
    return change >= 0 ? `+${change.toFixed(1)}%` : `${change.toFixed(1)}%`;
  };

  // 行の値を取得（手入力値があればそれを優先）
  const getRowValue = (section, item, year) => {
    const key = `${section}.${item}.${year}`;
    return editedValues[key] !== undefined ? editedValues[key] : 
           data && data[section] && data[section][item] ? data[section][item][year] : null;
  };

  // セル編集開始ハンドラ
  const handleCellClick = (section, item, year) => {
    if (!manualInputMode) return;
    
    setEditingCell({
      section,
      item,
      year,
      value: getRowValue(section, item, year)
    });
  };

  // 編集値変更ハンドラ
  const handleInputChange = (e) => {
    if (!editingCell) return;
    
    setEditingCell({
      ...editingCell,
      value: e.target.value
    });
  };

  // 編集保存ハンドラ
  const handleSaveEdit = () => {
    if (!editingCell) return;
    
    const { section, item, year, value } = editingCell;
    const key = `${section}.${item}.${year}`;
    
    setEditedValues({
      ...editedValues,
      [key]: value
    });
    
    setManuallyEditedCells({
      ...manuallyEditedCells,
      [key]: true
    });
    
    setEditingCell(null);
  };

  // セルスタイル取得
  const getCellStyle = (section, item, year) => {
    const key = `${section}.${item}.${year}`;
    const isEditing = editingCell && 
                      editingCell.section === section && 
                      editingCell.item === item && 
                      editingCell.year === year;
    
    const isManuallyEdited = manuallyEditedCells[key];
    
    return {
      backgroundColor: isEditing 
        ? 'rgba(255, 236, 179, 1)'
        : isManuallyEdited 
          ? 'rgba(255, 248, 225, 0.5)'
          : 'inherit',
    };
  };

  // セル表示内容
  const renderCell = (section, item, year, value, isYoy = false) => {
    const isEditing = editingCell && 
                      editingCell.section === section && 
                      editingCell.item === item && 
                      editingCell.year === year;
    
    // 昨対行の場合は編集不可
    if (isYoy) {
      return value || '-';
    }
    
    if (isEditing) {
      return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            value={editingCell.value || ''}
            onChange={handleInputChange}
            autoFocus
            style={{
              width: '70%',
              padding: '4px',
              border: '1px solid #ccc'
            }}
          />
          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={handleSaveEdit}
            sx={{ ml: 1, minWidth: 'auto', fontSize: '0.7rem' }}
            startIcon={<SaveIcon fontSize="small" />}
          >
            保存
          </Button>
        </Box>
      );
    }
    
    // 通常表示
    return value !== null ? `¥${value.toLocaleString()}` : '-';
  };

  // 損益計算書の項目定義
  const plItems = [
    { key: 'revenue', name: '売上高', section: 'revenue', isBold: true },
    { key: 'costOfSales', name: '売上原価', section: 'expenses' },
    { key: 'grossProfit', name: '売上総利益', section: 'profits', isBold: true },
    { key: 'sellingExpenses', name: '販売費', section: 'expenses' },
    { key: 'administrativeExpenses', name: '一般管理費', section: 'expenses' },
    { key: 'operatingProfit', name: '営業利益', section: 'profits', isBold: true },
    { key: 'nonOperatingIncome', name: '営業外収益', section: 'nonOperating' },
    { key: 'nonOperatingExpenses', name: '営業外費用', section: 'nonOperating' },
    { key: 'ordinaryProfit', name: '経常利益', section: 'profits', isBold: true },
    { key: 'extraordinaryGains', name: '特別利益', section: 'extraordinary' },
    { key: 'extraordinaryLosses', name: '特別損失', section: 'extraordinary' },
    { key: 'profitBeforeTax', name: '税引前当期純利益', section: 'profits', isBold: true },
    { key: 'incomeTaxes', name: '法人税等', section: 'taxes' },
    { key: 'netProfit', name: '当期純利益', section: 'profits', isBold: true }
  ];

  // 追加指標の計算（限界粗利、損益分岐点等）
  const additionalItems = [
    { key: 'marginalProfit', name: '限界粗利', section: 'additional', isBold: true },
    { key: 'fixedCost', name: '固定費', section: 'additional' },
    { key: 'breakEvenPoint', name: '損益分岐売上高', section: 'additional', isBold: true }
  ];

  if (!data) return <Typography>データがありません</Typography>;

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: '#f5f5f5' }}>
            <TableCell>損益計算書項目</TableCell>
            {years.map(year => (
              <TableCell key={year} align="right">{year}年</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {/* 損益計算書項目 */}
          {plItems.map((item) => (
            <React.Fragment key={item.key}>
              {/* データ行 */}
              <TableRow>
                <TableCell sx={item.isBold ? { fontWeight: 'bold' } : {}}>
                  {item.name}
                </TableCell>
                {years.map(year => (
                  <TableCell 
                    key={year} 
                    align="right"
                    onClick={() => handleCellClick(item.section, item.key, year)}
                    sx={{
                      ...getCellStyle(item.section, item.key, year),
                      fontWeight: item.isBold ? 'bold' : 'normal'
                    }}
                  >
                    {renderCell(
                      item.section, 
                      item.key, 
                      year, 
                      getRowValue(item.section, item.key, year)
                    )}
                  </TableCell>
                ))}
              </TableRow>
              
              {/* 昨対行 */}
              <TableRow sx={{ bgcolor: '#fafafa' }}>
                <TableCell>昨対</TableCell>
                {years.map((year, index) => {
                  const currentValue = getRowValue(item.section, item.key, year);
                  const previousYear = index > 0 ? years[index - 1] : null;
                  const previousValue = previousYear ? getRowValue(item.section, item.key, previousYear) : null;
                  return (
                    <TableCell key={`${year}-yoy`} align="right">
                      {previousYear ? calculateYoyChange(currentValue, previousValue) : '-'}
                    </TableCell>
                  );
                })}
              </TableRow>
            </React.Fragment>
          ))}

          {/* 区切り線 */}
          <TableRow>
            <TableCell colSpan={years.length + 1} sx={{ height: '20px', bgcolor: '#e0e0e0' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                追加経営指標
              </Typography>
            </TableCell>
          </TableRow>
          
          {/* 追加指標 */}
          {additionalItems.map((item) => (
            <React.Fragment key={item.key}>
              {/* データ行 */}
              <TableRow>
                <TableCell sx={item.isBold ? { fontWeight: 'bold' } : {}}>
                  {item.name}
                </TableCell>
                {years.map(year => (
                  <TableCell 
                    key={year} 
                    align="right"
                    onClick={() => handleCellClick(item.section, item.key, year)}
                    sx={{
                      ...getCellStyle(item.section, item.key, year),
                      fontWeight: item.isBold ? 'bold' : 'normal'
                    }}
                  >
                    {renderCell(
                      item.section, 
                      item.key, 
                      year, 
                      getRowValue(item.section, item.key, year)
                    )}
                  </TableCell>
                ))}
              </TableRow>
              
              {/* 昨対行 */}
              <TableRow sx={{ bgcolor: '#fafafa' }}>
                <TableCell>昨対</TableCell>
                {years.map((year, index) => {
                  const currentValue = getRowValue(item.section, item.key, year);
                  const previousYear = index > 0 ? years[index - 1] : null;
                  const previousValue = previousYear ? getRowValue(item.section, item.key, previousYear) : null;
                  return (
                    <TableCell key={`${year}-yoy`} align="right">
                      {previousYear ? calculateYoyChange(currentValue, previousValue) : '-'}
                    </TableCell>
                  );
                })}
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default IncomeStatement;
