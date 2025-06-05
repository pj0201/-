import type { NextApiRequest, NextApiResponse } from 'next';
import { initDatabase, insertCompany, insertUploadedFile, insertFileAnalysisResult, updateFileAnalysisResult } from '../../lib/database';
import { analyzeFinancialFile } from '../../lib/fileAnalyzer';
import path from 'path';
import fs from 'fs';

// ファイル形式チェック
function isAllowedFile(filename: string): boolean {
  const allowedExtensions = ['.xlsx', '.xls', '.pdf', '.png', '.jpg', '.jpeg', '.csv'];
  const ext = path.extname(filename).toLowerCase();
  return allowedExtensions.includes(ext);
}

// 仮の分析処理: 実際はここでファイル内容を解析し、指標を算出する
function analyzeFinancialFile(type: string, buffer: Buffer, filename: string) {
  // 本来はここでExcelやPDF等を解析し、BS/PLデータを抽出
  // 今回はダミーデータを返す
  if (type === 'bs') {
    return {
      type: 'bs',
      data: {
        '流動資産': 1200,
        '固定資産': 800,
        '流動負債': 900,
        '固定負債': 500,
        '純資産': 600,
      }
    };
  } else if (type === 'pl') {
    return {
      type: 'pl', 
      data: {
        '売上高': 5000,
        '売上原価': 3000,
        '販売費及び一般管理費': 1200,
        '営業利益': 800,
        '経常利益': 700,
        '当期純利益': 500,
      }
    };
  }
  return {
    type: type,
    data: {
      'filename': filename,
      'size': buffer.length,
      'uploaded': true
    }
  };
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
    // データベース初期化
    await initDatabase();

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
        
        // 会社をDBに登録（重複の場合は既存IDを取得）
        const companyId = await insertCompany(companyName);
        
        // アップロードディレクトリ作成
        const uploadDir = path.join(process.cwd(), 'uploads', companyName);
        if (!fs.existsSync(uploadDir)) {
          fs.mkdirSync(uploadDir, { recursive: true });
        }
        
        // ファイル保存
        const filePath = path.join(uploadDir, `${period}_${fileType}_${filename}`);
        fs.writeFileSync(filePath, buffer);
        
        // DBにファイル情報を保存
        const fileId = await insertUploadedFile(
          companyId,
          filename,
          fileType,
          period,
          filePath,
          buffer.length
        );
        
        // 分析結果レコードを作成
        const analysisId = await insertFileAnalysisResult({
          file_id: fileId,
          company_id: companyId,
          period,
          analysis_status: 'processing'
        });
        
        try {
          // ファイル分析を実行
          const analysisResult = await analyzeFinancialFile(buffer, filename, fileType);
          
          // 分析結果をDBに保存
          await updateFileAnalysisResult(analysisId, {
            ...analysisResult,
            analysis_status: 'completed'
          });
          
          res.status(200).json({
            companyName,
            period,
            filename,
            message: 'ファイルアップロードと分析が完了しました',
            analysis: analysisResult
          });
          
        } catch (analysisError) {
          console.error('Analysis error:', analysisError);
          
          // 分析エラーをDBに記録
          await updateFileAnalysisResult(analysisId, {
            analysis_status: 'failed',
            error_message: analysisError instanceof Error ? analysisError.message : 'Unknown error'
          });
          
          // ファイルアップロードは成功したが分析に失敗
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
