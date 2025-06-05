import type { NextApiRequest, NextApiResponse } from 'next';
import { getCompanies, getCompanyFiles } from '../../lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const companies = await getCompanies();
      res.status(200).json(companies);
    } catch (error) {
      console.error('Companies fetch error:', error);
      res.status(500).json({ error: 'データベースエラーが発生しました' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}