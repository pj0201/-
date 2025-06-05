import type { NextApiRequest, NextApiResponse } from 'next';
import { initDatabase, getConnection } from '../../lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      await initDatabase();
      const conn = await getConnection();
      
      const {
        company_id,
        period,
        employee_count,
        cash_and_deposits,
        accounts_receivable,
        inventory,
        tangible_assets,
        intangible_assets,
        accounts_payable,
        short_term_debt,
        long_term_debt,
        depreciation,
        interest_expense,
        notes
      } = req.body;

      if (!company_id || !period) {
        return res.status(400).json({ error: '企業IDと対象期間は必須です' });
      }

      // 補完データテーブルが存在しない場合は作成
      await conn.execute(`
        CREATE TABLE IF NOT EXISTS financial_supplement_data (
          id INT AUTO_INCREMENT PRIMARY KEY,
          company_id INT NOT NULL,
          period VARCHAR(20) NOT NULL,
          employee_count INT,
          cash_and_deposits BIGINT,
          accounts_receivable BIGINT,
          inventory BIGINT,
          tangible_assets BIGINT,
          intangible_assets BIGINT,
          accounts_payable BIGINT,
          short_term_debt BIGINT,
          long_term_debt BIGINT,
          depreciation BIGINT,
          interest_expense BIGINT,
          notes TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
          FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE,
          UNIQUE KEY unique_company_period (company_id, period)
        )
      `);

      // データを挿入または更新
      await conn.execute(`
        INSERT INTO financial_supplement_data 
        (company_id, period, employee_count, cash_and_deposits, accounts_receivable, inventory, 
         tangible_assets, intangible_assets, accounts_payable, short_term_debt, long_term_debt, 
         depreciation, interest_expense, notes)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
        employee_count = VALUES(employee_count),
        cash_and_deposits = VALUES(cash_and_deposits),
        accounts_receivable = VALUES(accounts_receivable),
        inventory = VALUES(inventory),
        tangible_assets = VALUES(tangible_assets),
        intangible_assets = VALUES(intangible_assets),
        accounts_payable = VALUES(accounts_payable),
        short_term_debt = VALUES(short_term_debt),
        long_term_debt = VALUES(long_term_debt),
        depreciation = VALUES(depreciation),
        interest_expense = VALUES(interest_expense),
        notes = VALUES(notes),
        updated_at = CURRENT_TIMESTAMP
      `, [
        company_id, period, employee_count || null, cash_and_deposits || null,
        accounts_receivable || null, inventory || null, tangible_assets || null,
        intangible_assets || null, accounts_payable || null, short_term_debt || null,
        long_term_debt || null, depreciation || null, interest_expense || null,
        notes || null
      ]);
      
      res.status(200).json({
        message: '財務補完データが保存されました'
      });
      
    } catch (error: any) {
      console.error('Financial supplement data save error:', error);
      res.status(500).json({ error: 'データベースエラーが発生しました' });
    }
  } else if (req.method === 'GET') {
    try {
      await initDatabase();
      const conn = await getConnection();
      
      const { company_id, period } = req.query;
      
      if (!company_id || !period) {
        return res.status(400).json({ error: '企業IDと対象期間が必要です' });
      }
      
      const [rows] = await conn.execute(
        'SELECT * FROM financial_supplement_data WHERE company_id = ? AND period = ?',
        [company_id, period]
      );
      
      res.status(200).json((rows as any[])[0] || null);
      
    } catch (error: any) {
      console.error('Financial supplement data fetch error:', error);
      res.status(500).json({ error: 'データベースエラーが発生しました' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}