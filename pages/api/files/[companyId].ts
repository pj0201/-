import type { NextApiRequest, NextApiResponse } from 'next';
import { getCompanyFiles } from '../../../lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const { companyId } = req.query;
      
      if (!companyId || isNaN(Number(companyId))) {
        return res.status(400).json({ error: '有効な会社IDが必要です' });
      }
      
      const files = await getCompanyFiles(Number(companyId));
      res.status(200).json(files);
    } catch (error) {
      console.error('Company files fetch error:', error);
      res.status(500).json({ error: 'データベースエラーが発生しました' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}