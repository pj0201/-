import type { NextApiRequest, NextApiResponse } from 'next';
import { compareWithIndustry, getBenchmarkData } from '../../lib/industryBenchmark';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { financialData, categoryId } = req.body;

    // 入力検証
    if (!financialData || !categoryId) {
      return res.status(400).json({ 
        error: '財務データと業種IDが必要です' 
      });
    }

    // 業界平均データの取得
    const benchmarkData = getBenchmarkData(parseInt(categoryId));
    if (!benchmarkData) {
      return res.status(404).json({ 
        error: '指定された業種の業界平均データが見つかりません' 
      });
    }

    // 同業種比較の実行
    const comparison = compareWithIndustry(financialData, parseInt(categoryId));
    if (!comparison) {
      return res.status(500).json({ 
        error: '同業種比較の計算に失敗しました' 
      });
    }

    res.status(200).json({
      success: true,
      comparison,
      benchmarkInfo: {
        categoryName: benchmarkData.categoryName,
        categoryCode: benchmarkData.categoryCode,
        level: benchmarkData.level,
        sampleSize: benchmarkData.sampleSize,
        dataYear: benchmarkData.dataYear,
        lastUpdated: benchmarkData.lastUpdated
      }
    });

  } catch (error) {
    console.error('Industry comparison API error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
}