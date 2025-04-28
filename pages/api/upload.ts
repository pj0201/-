import type { NextApiRequest, NextApiResponse } from 'next';

// 仮の分析処理: 実際はここでファイル内容を解析し、指標を算出する
function analyzeFinancialFile(type: string, buffer: Buffer) {
  // 本来はここでExcelやPDF等を解析し、BS/PLデータを抽出
  // 今回はダミーデータを返す
  if (type === 'bs') {
    return {
      type: 'bs',
      period: '2024',
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
      period: '2024',
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
  return null;
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

  const busboy = require('busboy');
  const bb = busboy({ headers: req.headers });
  let fileBuffer: Buffer[] = [];
  let fileType = '';

  bb.on('file', (name: string, file: any, info: any) => {
    file.on('data', (data: Buffer) => {
      fileBuffer.push(data);
    });
  });
  bb.on('field', (name: string, val: string) => {
    if (name === 'type') fileType = val;
  });
  bb.on('finish', () => {
    const buffer = Buffer.concat(fileBuffer);
    const result = analyzeFinancialFile(fileType, buffer);
    if (result) {
      res.status(200).json(result);
    } else {
      res.status(400).json({ error: 'Invalid file type or content' });
    }
  });
  req.pipe(bb);
}
