import type { NextApiRequest, NextApiResponse } from 'next';
import { initDatabase, insertCompany, insertUploadedFile, insertFileAnalysisResult, updateFileAnalysisResult } from '../../lib/database';
import { analyzeFinancialFile } from '../../lib/fileAnalyzer';
import { extractFinancialData, type FinancialDataStructure } from '../../lib/financialDataStructure';
import { IntelligentOCRAgent } from '../../lib/intelligentOCRAgent';
import path from 'path';
import fs from 'fs';

// ファイル形式チェック
function isAllowedFile(filename: string): boolean {
  const allowedExtensions = ['.xlsx', '.xls', '.pdf', '.png', '.jpg', '.jpeg', '.csv'];
  const ext = path.extname(filename).toLowerCase();
  return allowedExtensions.includes(ext);
}

// IntelligentOCRAgentを使った高精度OCR分析関数
async function performIntelligentOCRAnalysis(
  buffer: Buffer, 
  filename: string, 
  fileType: string, 
  companyId: number, 
  period: string
): Promise<FinancialDataStructure> {
  try {
    console.log(`IntelligentOCRAgent処理開始: ${filename}`);
    
    // IntelligentOCRAgentを初期化
    const ocrAgent = new IntelligentOCRAgent();
    
    // ファイルをバッファから一時ファイルに保存
    const tempDir = path.join(process.cwd(), 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempFilePath = path.join(tempDir, `temp_${Date.now()}_${filename}`);
    fs.writeFileSync(tempFilePath, buffer);
    
    try {
      // IntelligentOCRAgentでOCR実行
      const ocrResult = await ocrAgent.performOCR(tempFilePath);
      console.log(`OCR信頼度: ${ocrResult.confidence}`);
      console.log(`抽出テキスト長: ${ocrResult.text.length}文字`);
      
      // AIエージェントによる財務データ抽出
      const extractionResult = await ocrAgent.extractFinancialDataWithAgent(ocrResult);
      console.log(`財務データ抽出完了 - 信頼度: ${extractionResult.confidence}`);
      
      // 抽出された財務データをFinancialDataStructure形式に変換
      const financialData: FinancialDataStructure = {
        companyId,
        companyName: `Company_${companyId}`,
        period,
        fileType,
        fileName: filename,
        extractedAt: new Date().toISOString(),
        
        // 損益計算書データ
        incomeStatement: {
          revenue: extractionResult.data.revenue || null,
          operatingIncome: extractionResult.data.operatingIncome || null,
          ordinaryIncome: extractionResult.data.ordinaryIncome || null,
          netIncome: extractionResult.data.netIncome || null,
          costOfSales: extractionResult.data.costOfSales || null,
          sellingGeneralAdminExpenses: extractionResult.data.sellingGeneralAdminExpenses || null,
          grossProfit: extractionResult.data.grossProfit || null
        },
        
        // 貸借対照表データ
        balanceSheet: {
          totalAssets: extractionResult.data.totalAssets || null,
          currentAssets: extractionResult.data.currentAssets || null,
          fixedAssets: extractionResult.data.fixedAssets || null,
          totalLiabilities: extractionResult.data.totalLiabilities || null,
          currentLiabilities: extractionResult.data.currentLiabilities || null,
          fixedLiabilities: extractionResult.data.fixedLiabilities || null,
          totalEquity: extractionResult.data.totalEquity || null,
          capital: extractionResult.data.capital || null,
          retainedEarnings: extractionResult.data.retainedEarnings || null
        },
        
        // メタデータ
        metadata: {
          ocrConfidence: ocrResult.confidence,
          extractionConfidence: extractionResult.confidence,
          qualityScore: extractionResult.qualityAssessment.overallScore,
          warnings: extractionResult.qualityAssessment.warnings,
          aiAnalysis: extractionResult.reasoning
        }
      };
      
      console.log('IntelligentOCRAgent による財務データ抽出完了');
      return financialData;
      
    } finally {
      // 一時ファイルを削除
      if (fs.existsSync(tempFilePath)) {
        fs.unlinkSync(tempFilePath);
      }
    }
    
  } catch (error) {
    console.error('IntelligentOCRAgent処理エラー:', error);
    
    // エラーの場合は従来の extractFinancialData でフォールバック
    const fallbackData = extractFinancialData('', fileType, companyId, period, filename);
    
    // エラー情報を追加
    fallbackData.metadata = {
      ...fallbackData.metadata,
      ocrError: error instanceof Error ? error.message : 'Unknown OCR error',
      fallbackUsed: true
    };
    
    return fallbackData;
  }
}


export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    // データベース初期化（フォールバックモード対応）
    let useDatabase = true;
    try {
      await initDatabase();
    } catch (dbError) {
      console.log('Database connection failed, using file-based fallback for upload');
      useDatabase = false;
    }

    const busboy = require('busboy');
    const bb = busboy({ headers: req.headers });
    let fileBuffer: Buffer[] = [];
    let fileType = '';
    let companyName = '';
    let period = '';
    let filename = '';

    bb.on('file', (name: string, file: any, info: any) => {
      filename = info.filename;
      
      // ファイル形式チェック
      if (!isAllowedFile(filename)) {
        file.resume();
        return res.status(400).json({ 
          error: `対応していないファイル形式です: ${path.extname(filename)}` 
        });
      }

      file.on('data', (data: Buffer) => {
        fileBuffer.push(data);
      });
    });

    bb.on('field', (name: string, val: string) => {
      if (name === 'type') fileType = val;
      if (name === 'companyName') companyName = val;
      if (name === 'period') period = val;
    });

    bb.on('finish', async () => {
      try {
        if (!fileBuffer.length || !fileType || !companyName || !period) {
          return res.status(400).json({ error: '必要な情報が不足しています' });
        }

        const buffer = Buffer.concat(fileBuffer);
        
        let companyId: number;
        let fileId: string;
        
        if (useDatabase) {
          // データベース使用時の処理
          try {
            companyId = await insertCompany(companyName);
            fileId = await insertUploadedFile(
              companyId,
              filename,
              fileType,
              period,
              '',
              buffer.length
            );
          } catch (dbError) {
            console.log('Database operation failed, switching to file mode');
            useDatabase = false;
          }
        }
        
        if (!useDatabase) {
          // ファイルベースフォールバック処理
          // 企業情報の取得または作成
          const companiesDir = path.join(process.cwd(), 'data', 'companies');
          if (!fs.existsSync(companiesDir)) {
            fs.mkdirSync(companiesDir, { recursive: true });
          }
          
          // 企業IDの取得（既存企業の検索）
          const files = fs.readdirSync(companiesDir);
          let existingCompany = null;
          for (const file of files) {
            if (file.startsWith('company-') && file.endsWith('.json')) {
              const filePath = path.join(companiesDir, file);
              const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
              if (data.name === companyName) {
                existingCompany = data;
                break;
              }
            }
          }
          
          companyId = existingCompany ? existingCompany.id : Date.now();
          fileId = `${companyId}_${period}_${Date.now()}`;
        }
        
        // アップロードディレクトリ作成
        const uploadDir = path.join(process.cwd(), 'data', 'uploads', companyName);
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        // ファイル保存
        const filePath = path.join(uploadDir, `${period}_${fileType}_${filename}`);
        fs.writeFileSync(filePath, buffer);
        
        // ファイル情報をJSONで保存（ファイルベース）
        const fileInfo = {
          id: fileId,
          company_id: companyId,
          company_name: companyName,
          original_filename: filename,
          file_type: fileType,
          period,
          file_path: filePath,
          file_size: buffer.length,
          uploaded_at: new Date().toISOString()
        };
        
        const fileInfoPath = path.join(uploadDir, `${fileId}_info.json`);
        fs.writeFileSync(fileInfoPath, JSON.stringify(fileInfo, null, 2));
        
        try {
          // IntelligentOCRAgentによる高精度OCR分析を実行
          const analysisResult = await performIntelligentOCRAnalysis(buffer, filename, fileType, companyId, period);
          
          // 分析結果をファイルに保存
          const analysisPath = path.join(uploadDir, `${fileId}_analysis.json`);
          fs.writeFileSync(analysisPath, JSON.stringify(analysisResult, null, 2));
          
          res.status(200).json({
            companyName,
            period,
            filename,
            message: 'ファイルアップロードと分析が完了しました',
            analysis: analysisResult
          });
          
        } catch (analysisError) {
          console.error('Analysis error:', analysisError);
          
          // エラー情報を保存
          const errorInfo = {
            file_id: fileId,
            error: analysisError instanceof Error ? analysisError.message : 'Unknown error',
            timestamp: new Date().toISOString()
          };
          
          const errorPath = path.join(uploadDir, `${fileId}_error.json`);
          fs.writeFileSync(errorPath, JSON.stringify(errorInfo, null, 2));
          
          res.status(200).json({
            companyName,
            period,
            filename,
            message: 'ファイルアップロードは完了しましたが、分析に失敗しました',
            error: analysisError instanceof Error ? analysisError.message : 'Unknown error'
          });
        }
        
      } catch (error) {
        console.error('Upload processing error:', error);
        res.status(500).json({ error: 'ファイル処理中にエラーが発生しました' });
      }
    });

    req.pipe(bb);
    
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'データベースエラーが発生しました' });
  }
}
