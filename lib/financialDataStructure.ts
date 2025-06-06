// 財務データの構造化スキーマ
export interface FinancialDataStructure {
  company_id: number;
  period: string;
  file_id: string;
  
  // 貸借対照表（BS）データ
  balanceSheet?: {
    // 資産の部
    assets: {
      currentAssets: {
        cash: number | null;                    // 現金及び預金
        accountsReceivable: number | null;      // 売掛金
        inventory: number | null;               // 棚卸資産
        otherCurrentAssets: number | null;      // その他流動資産
        totalCurrentAssets: number | null;      // 流動資産合計
      };
      fixedAssets: {
        tangibleAssets: number | null;          // 有形固定資産
        intangibleAssets: number | null;        // 無形固定資産
        investmentAssets: number | null;        // 投資その他の資産
        totalFixedAssets: number | null;        // 固定資産合計
      };
      totalAssets: number | null;               // 資産合計
    };
    
    // 負債の部
    liabilities: {
      currentLiabilities: {
        accountsPayable: number | null;         // 買掛金
        shortTermLoans: number | null;          // 短期借入金
        otherCurrentLiabilities: number | null; // その他流動負債
        totalCurrentLiabilities: number | null; // 流動負債合計
      };
      fixedLiabilities: {
        longTermLoans: number | null;           // 長期借入金
        otherFixedLiabilities: number | null;   // その他固定負債
        totalFixedLiabilities: number | null;   // 固定負債合計
      };
      totalLiabilities: number | null;          // 負債合計
    };
    
    // 純資産の部
    equity: {
      capital: number | null;                   // 資本金
      retainedEarnings: number | null;          // 利益剰余金
      otherEquity: number | null;               // その他純資産
      totalEquity: number | null;               // 純資産合計
    };
  };
  
  // 損益計算書（PL）データ
  incomeStatement?: {
    revenue: {
      sales: number | null;                     // 売上高
      otherRevenue: number | null;              // その他収益
      totalRevenue: number | null;              // 収益合計
    };
    costs: {
      costOfSales: number | null;               // 売上原価
      sellingExpenses: number | null;           // 販売費
      administrativeExpenses: number | null;    // 一般管理費
      totalOperatingExpenses: number | null;    // 営業費用合計
    };
    profit: {
      grossProfit: number | null;               // 売上総利益
      operatingProfit: number | null;           // 営業利益
      ordinaryProfit: number | null;            // 経常利益
      netIncome: number | null;                 // 当期純利益
    };
    otherIncome: {
      nonOperatingIncome: number | null;        // 営業外収益
      nonOperatingExpenses: number | null;      // 営業外費用
      extraordinaryIncome: number | null;       // 特別利益
      extraordinaryLoss: number | null;         // 特別損失
      taxExpenses: number | null;               // 法人税等
    };
  };
  
  // キャッシュフロー計算書データ
  cashFlowStatement?: {
    operatingCashFlow: number | null;           // 営業キャッシュフロー
    investingCashFlow: number | null;           // 投資キャッシュフロー
    financingCashFlow: number | null;           // 財務キャッシュフロー
    netCashFlow: number | null;                 // 純増減額
  };
  
  // 補足データ
  supplementaryData?: {
    employeeCount: number | null;               // 従業員数
    averageSalary: number | null;               // 平均給与
    notes: string | null;                       // 備考
  };
  
  // メタデータ
  metadata: {
    extractedAt: string;                        // 抽出日時
    extractionMethod: 'OCR' | 'MANUAL' | 'API'; // 抽出方法
    confidence: number;                         // 信頼度（0-1）
    originalFileName: string;                   // 元ファイル名
    fileType: 'bs' | 'pl' | 'trial_balance' | 'payroll' | 'settlement' | 'other';
  };
}

// OCR抽出用のキーワードマッピング
export const OCR_KEYWORDS = {
  // 貸借対照表キーワード
  balanceSheet: {
    cash: ['現金', '預金', '現金及び預金', 'キャッシュ'],
    accountsReceivable: ['売掛金', '受取手形', '売上債権'],
    inventory: ['棚卸資産', '商品', '製品', '仕掛品', '原材料'],
    totalCurrentAssets: ['流動資産合計', '流動資産計'],
    tangibleAssets: ['有形固定資産', '建物', '機械装置', '土地'],
    totalAssets: ['資産合計', '資産の部合計', '総資産'],
    accountsPayable: ['買掛金', '支払手形', '仕入債務'],
    shortTermLoans: ['短期借入金', '短期貸付金'],
    totalCurrentLiabilities: ['流動負債合計', '流動負債計'],
    longTermLoans: ['長期借入金', '長期貸付金'],
    totalLiabilities: ['負債合計', '負債の部合計'],
    capital: ['資本金', '出資金'],
    retainedEarnings: ['利益剰余金', '繰越利益剰余金'],
    totalEquity: ['純資産合計', '純資産の部合計', '自己資本']
  },
  
  // 損益計算書キーワード
  incomeStatement: {
    sales: ['売上高', '売上収入', '営業収益'],
    costOfSales: ['売上原価', '仕入原価'],
    grossProfit: ['売上総利益', '売上総益'],
    sellingExpenses: ['販売費', '販売費及び一般管理費'],
    operatingProfit: ['営業利益', '営業損益'],
    ordinaryProfit: ['経常利益', '経常損益'],
    netIncome: ['当期純利益', '当期利益', '純利益'],
    nonOperatingIncome: ['営業外収益', 'その他の収益'],
    nonOperatingExpenses: ['営業外費用', 'その他の費用'],
    taxExpenses: ['法人税', '法人税等', '税金']
  }
};

// 財務データ抽出関数
export function extractFinancialData(
  ocrText: string, 
  fileType: string,
  companyId: number,
  period: string,
  originalFileName: string
): FinancialDataStructure {
  const data: FinancialDataStructure = {
    company_id: companyId,
    period,
    file_id: `${companyId}_${period}_${Date.now()}`,
    metadata: {
      extractedAt: new Date().toISOString(),
      extractionMethod: 'OCR',
      confidence: 0.7, // デフォルト信頼度
      originalFileName,
      fileType: fileType as any
    }
  };

  // ファイル種別に応じてデータ抽出
  if (fileType === 'bs' || fileType === 'settlement') {
    data.balanceSheet = extractBalanceSheetData(ocrText);
  }
  
  if (fileType === 'pl' || fileType === 'settlement') {
    data.incomeStatement = extractIncomeStatementData(ocrText);
  }
  
  return data;
}

// 貸借対照表データ抽出
function extractBalanceSheetData(text: string): FinancialDataStructure['balanceSheet'] {
  const extractValue = (keywords: string[]): number | null => {
    for (const keyword of keywords) {
      // 負の数値にも対応
      const regex = new RegExp(`${keyword}[\\s\\t]*(-?[\\d,]+)`, 'g');
      const match = regex.exec(text);
      if (match) {
        return parseInt(match[1].replace(/,/g, ''));
      }
    }
    return null;
  };

  return {
    assets: {
      currentAssets: {
        cash: extractValue(OCR_KEYWORDS.balanceSheet.cash),
        accountsReceivable: extractValue(OCR_KEYWORDS.balanceSheet.accountsReceivable),
        inventory: extractValue(OCR_KEYWORDS.balanceSheet.inventory),
        otherCurrentAssets: null,
        totalCurrentAssets: extractValue(OCR_KEYWORDS.balanceSheet.totalCurrentAssets)
      },
      fixedAssets: {
        tangibleAssets: extractValue(OCR_KEYWORDS.balanceSheet.tangibleAssets),
        intangibleAssets: null,
        investmentAssets: null,
        totalFixedAssets: null
      },
      totalAssets: extractValue(OCR_KEYWORDS.balanceSheet.totalAssets)
    },
    liabilities: {
      currentLiabilities: {
        accountsPayable: extractValue(OCR_KEYWORDS.balanceSheet.accountsPayable),
        shortTermLoans: extractValue(OCR_KEYWORDS.balanceSheet.shortTermLoans),
        otherCurrentLiabilities: null,
        totalCurrentLiabilities: extractValue(OCR_KEYWORDS.balanceSheet.totalCurrentLiabilities)
      },
      fixedLiabilities: {
        longTermLoans: extractValue(OCR_KEYWORDS.balanceSheet.longTermLoans),
        otherFixedLiabilities: null,
        totalFixedLiabilities: null
      },
      totalLiabilities: extractValue(OCR_KEYWORDS.balanceSheet.totalLiabilities)
    },
    equity: {
      capital: extractValue(OCR_KEYWORDS.balanceSheet.capital),
      retainedEarnings: extractValue(OCR_KEYWORDS.balanceSheet.retainedEarnings),
      otherEquity: null,
      totalEquity: extractValue(OCR_KEYWORDS.balanceSheet.totalEquity)
    }
  };
}

// 損益計算書データ抽出
function extractIncomeStatementData(text: string): FinancialDataStructure['incomeStatement'] {
  const extractValue = (keywords: string[]): number | null => {
    for (const keyword of keywords) {
      // 負の数値にも対応
      const regex = new RegExp(`${keyword}[\\s\\t]*(-?[\\d,]+)`, 'g');
      const match = regex.exec(text);
      if (match) {
        return parseInt(match[1].replace(/,/g, ''));
      }
    }
    return null;
  };

  return {
    revenue: {
      sales: extractValue(OCR_KEYWORDS.incomeStatement.sales),
      otherRevenue: null,
      totalRevenue: null
    },
    costs: {
      costOfSales: extractValue(OCR_KEYWORDS.incomeStatement.costOfSales),
      sellingExpenses: extractValue(OCR_KEYWORDS.incomeStatement.sellingExpenses),
      administrativeExpenses: null,
      totalOperatingExpenses: null
    },
    profit: {
      grossProfit: extractValue(OCR_KEYWORDS.incomeStatement.grossProfit),
      operatingProfit: extractValue(OCR_KEYWORDS.incomeStatement.operatingProfit),
      ordinaryProfit: extractValue(OCR_KEYWORDS.incomeStatement.ordinaryProfit),
      netIncome: extractValue(OCR_KEYWORDS.incomeStatement.netIncome)
    },
    otherIncome: {
      nonOperatingIncome: extractValue(OCR_KEYWORDS.incomeStatement.nonOperatingIncome),
      nonOperatingExpenses: extractValue(OCR_KEYWORDS.incomeStatement.nonOperatingExpenses),
      extraordinaryIncome: null,
      extraordinaryLoss: null,
      taxExpenses: extractValue(OCR_KEYWORDS.incomeStatement.taxExpenses)
    }
  };
}