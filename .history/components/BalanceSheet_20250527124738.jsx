// c:\dev\financial-analysis-app2\components\BalanceSheet.jsx
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

const BalanceSheet = ({ data, years = ['2019', '2020', '2021', '2022', '2023'], manualInputMode }) => {
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

  // 仮のデータ構造（実際の実装では適宜調整）
  const sections = [
    {
      title: '資産の部',
      items: [
        { key: 'cashAndDeposits', name: '現金・預金', section: 'currentAssets' },
        { key: 'accountsReceivable', name: '売掛金', section: 'currentAssets' },
        { key: 'inventory', name: '棚卸資産', section: 'currentAssets' },
        { key: 'otherCurrentAssets', name: 'その他流動資産', section: 'currentAssets' },
        { key: 'totalCurrentAssets', name: '流動資産合計', section: 'currentAssets', isTotal: true },
        { key: 'buildingsAndEquipment', name: '建物・設備', section: 'fixedAssets' },
        { key: 'land', name: '土地', section: 'fixedAssets' },
        { key: 'intangibleAssets', name: '無形固定資産', section: 'fixedAssets' },
        { key: 'investments', name: '投資その他の資産', section: 'fixedAssets' },
        { key: 'totalFixedAssets', name: '固定資産合計', section: 'fixedAssets', isTotal: true },
        { key: 'totalAssets', name: '資産合計', section: 'totals', isGrandTotal: true }
      ]
    },
    {
      title: '負債の部',
      items: [
        { key: 'accountsPayable', name: '買掛金', section: 'currentLiabilities' },
        { key: 'shortTermLoans', name: '短期借入金', section: 'currentLiabilities' },
        { key: 'otherCurrentLiabilities', name: 'その他流動負債', section: 'currentLiabilities' },
        { key: 'totalCurrentLiabilities', name: '流動負債合計', section: 'currentLiabilities', isTotal: true },
        { key: 'longTermLoans', name: '長期借入金', section: 'fixedLiabilities' },
        { key: 'otherFixedLiabilities', name: 'その他固定負債', section: 'fixedLiabilities' },
        { key: 'totalFixedLiabilities', name: '固定負債合計', section: 'fixedLiabilities', isTotal: true },
        { key: 'totalLiabilities', name: '負債合計', section: 'totals', isTotal: true }
      ]
    },
    {
      title: '純資産の部',
      items: [
        { key: 'capital', name: '資本金', section: 'equity' },
        { key: 'capitalSurplus', name: '資本剰余金', section: 'equity' },
        { key: 'retainedEarnings', name: '利益剰余金', section: 'equity' },
        { key: 'totalEquity', name: '純資産合計', section: 'equity', isTotal: true },
        { key: 'totalLiabilitiesAndEquity', name: '負債・純資産合計', section: 'totals', isGrandTotal: true }
      ]
    }
  ];

  if (!data) return <Typography>データがありません</Typography>;

  return (
    <TableContainer component={Paper}>
      <Table size="small">
        <TableHead>
          <TableRow sx={{ bgcolor: '#f5f5f5' }}>
            <TableCell>貸借対照表項目</TableCell>
            {years.map(year => (
              <TableCell key={year} align="right">{year}年</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {sections.map((section) => (
            <React.Fragment key={section.title}>
              {/* セクションヘッダー */}
              <TableRow>
                <TableCell colSpan={years.length + 1} sx={{ fontWeight: 'bold', bgcolor: '#e0e0e0' }}>
                  {section.title}
                </TableCell>
              </TableRow>

              {/* セクション内の各項目 */}
              {section.items.map((item) => (
                <React.Fragment key={item.key}>
                  {/* データ行 */}
                  <TableRow sx={item.isTotal || item.isGrandTotal ? { bgcolor: item.isGrandTotal ? '#e0e0e0' : '#f0f0f0' } : {}}>
                    <TableCell sx={item.isTotal || item.isGrandTotal ? { fontWeight: 'bold' } : {}}>
                      {item.name}
                    </TableCell>
                    {years.map(year => (
                      <TableCell 
                        key={year} 
                        align="right"
                        onClick={() => !item.isTotal && !item.isGrandTotal && handleCellClick(item.section, item.key, year)}
                        sx={{
                          ...getCellStyle(item.section, item.key, year),
                          fontWeight: item.isTotal || item.isGrandTotal ? 'bold' : 'normal'
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
                  
                  {/* 昨対行 - 合計行以外に表示 */}
                  {!item.isTotal && !item.isGrandTotal && (
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
                  )}
                </React.Fragment>
              ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default BalanceSheet;
