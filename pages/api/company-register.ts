import type { NextApiRequest, NextApiResponse } from 'next';
import { initDatabase, insertFullCompany } from '../../lib/database';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      // フォールバック: データベースなしでも企業登録可能
      let useFallback = false;
      try {
        await initDatabase();
      } catch (dbError) {
        console.log('Database connection failed, using fallback mode');
        useFallback = true;
      }
      
      const {
        name,
        address,
        representative,
        capital_amount,
        fiscal_month,
        main_bank,
        memo,
        business_categories
      } = req.body;

      // バリデーション
      if (!name || !representative) {
        return res.status(400).json({ error: '企業名と代表者名は必須です' });
      }

      const companyData = {
        name: name.trim(),
        address: address?.trim(),
        representative: representative.trim(),
        capital_amount: capital_amount ? Number(capital_amount) : undefined,
        fiscal_month: fiscal_month ? Number(fiscal_month) : undefined,
        main_bank: main_bank?.trim(),
        memo: memo?.trim(),
        business_categories: business_categories || []
      };

      let companyId;
      
      if (!useFallback) {
        // データベース使用
        companyId = await insertFullCompany(companyData);
      } else {
        // フォールバック: ローカルファイルに保存
        const companiesDir = path.join(process.cwd(), 'data', 'companies');
        if (!fs.existsSync(companiesDir)) {
          fs.mkdirSync(companiesDir, { recursive: true });
        }
        
        companyId = Date.now(); // 簡易ID生成
        const companyFile = path.join(companiesDir, `company-${companyId}.json`);
        fs.writeFileSync(companyFile, JSON.stringify({ id: companyId, ...companyData }, null, 2));
      }
      
      res.status(200).json({
        message: '企業登録が完了しました',
        companyId: companyId,
        mode: useFallback ? 'fallback' : 'database'
      });
      
    } catch (error: any) {
      console.error('Company registration error:', error);
      
      if (error.code === 'ER_DUP_ENTRY') {
        res.status(400).json({ error: 'この企業名は既に登録されています' });
      } else {
        res.status(500).json({ error: 'データベースエラーが発生しました' });
      }
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}