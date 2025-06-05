import type { NextApiRequest, NextApiResponse } from 'next';
import { initDatabase, initBusinessCategories, getBusinessCategories } from '../../lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      await initDatabase();
      await initBusinessCategories();
      const categories = await getBusinessCategories();
      res.status(200).json(categories);
    } catch (error) {
      console.error('Business categories fetch error:', error);
      res.status(500).json({ error: 'データベースエラーが発生しました' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}