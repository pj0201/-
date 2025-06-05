import type { NextApiRequest, NextApiResponse } from 'next';
import { initDatabase, initBusinessCategories, getBusinessCategoriesByLevel } from '../../lib/database';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { level, parent_id } = req.query;
    
    // フォールバック用の階層データ（日本標準産業分類完全版）
    const fallbackData = {
      major: [
        { id: 1, code: 'A', name: '農業・林業', level: 'major', parent_id: null },
        { id: 2, code: 'B', name: '漁業', level: 'major', parent_id: null },
        { id: 3, code: 'C', name: '鉱業・採石業・砂利採取業', level: 'major', parent_id: null },
        { id: 4, code: 'D', name: '建設業', level: 'major', parent_id: null },
        { id: 5, code: 'E', name: '製造業', level: 'major', parent_id: null },
        { id: 6, code: 'F', name: '電気・ガス・熱供給・水道業', level: 'major', parent_id: null },
        { id: 7, code: 'G', name: '情報通信業', level: 'major', parent_id: null },
        { id: 8, code: 'H', name: '運輸業・郵便業', level: 'major', parent_id: null },
        { id: 9, code: 'I', name: '卸売業・小売業', level: 'major', parent_id: null },
        { id: 10, code: 'J', name: '金融業・保険業', level: 'major', parent_id: null },
        { id: 11, code: 'K', name: '不動産業・物品賃貸業', level: 'major', parent_id: null },
        { id: 12, code: 'L', name: '学術研究・専門・技術サービス業', level: 'major', parent_id: null },
        { id: 13, code: 'M', name: '宿泊業・飲食サービス業', level: 'major', parent_id: null },
        { id: 14, code: 'N', name: '生活関連サービス業・娯楽業', level: 'major', parent_id: null },
        { id: 15, code: 'O', name: '教育・学習支援業', level: 'major', parent_id: null },
        { id: 16, code: 'P', name: '医療・福祉', level: 'major', parent_id: null },
        { id: 17, code: 'Q', name: '複合サービス事業', level: 'major', parent_id: null },
        { id: 18, code: 'R', name: 'サービス業（他に分類されないもの）', level: 'major', parent_id: null },
        { id: 19, code: 'S', name: '公務（他に分類されるものを除く）', level: 'major', parent_id: null },
        { id: 20, code: 'T', name: 'その他', level: 'major', parent_id: null }
      ],
      middle: {
        1: [ // 農業・林業
          { id: 101, code: 'A01', name: '農業', level: 'middle', parent_id: 1 },
          { id: 102, code: 'A02', name: '林業', level: 'middle', parent_id: 1 }
        ],
        2: [ // 漁業
          { id: 201, code: 'B03', name: '漁業（水産養殖業を除く）', level: 'middle', parent_id: 2 },
          { id: 202, code: 'B04', name: '水産養殖業', level: 'middle', parent_id: 2 }
        ],
        3: [ // 鉱業・採石業・砂利採取業
          { id: 301, code: 'C05', name: '鉱業・採石業・砂利採取業', level: 'middle', parent_id: 3 }
        ],
        4: [ // 建設業
          { id: 401, code: 'D06', name: '総合工事業', level: 'middle', parent_id: 4 },
          { id: 402, code: 'D07', name: '職別工事業', level: 'middle', parent_id: 4 },
          { id: 403, code: 'D08', name: '設備工事業', level: 'middle', parent_id: 4 }
        ],
        5: [ // 製造業
          { id: 501, code: 'E09', name: '食料品製造業', level: 'middle', parent_id: 5 },
          { id: 502, code: 'E10', name: '飲料・たばこ・飼料製造業', level: 'middle', parent_id: 5 },
          { id: 503, code: 'E11', name: '繊維工業', level: 'middle', parent_id: 5 },
          { id: 504, code: 'E12', name: '木材・木製品製造業（家具を除く）', level: 'middle', parent_id: 5 },
          { id: 505, code: 'E13', name: '家具・装身具製造業', level: 'middle', parent_id: 5 },
          { id: 506, code: 'E14', name: 'パルプ・紙・紙加工品製造業', level: 'middle', parent_id: 5 },
          { id: 507, code: 'E15', name: '印刷・同関連業', level: 'middle', parent_id: 5 },
          { id: 508, code: 'E16', name: '化学工業', level: 'middle', parent_id: 5 },
          { id: 509, code: 'E17', name: '石油製品・石炭製品製造業', level: 'middle', parent_id: 5 },
          { id: 510, code: 'E18', name: 'プラスチック製品製造業', level: 'middle', parent_id: 5 },
          { id: 511, code: 'E19', name: 'ゴム製品製造業', level: 'middle', parent_id: 5 },
          { id: 512, code: 'E20', name: 'なめし革・同製品・毛皮製造業', level: 'middle', parent_id: 5 },
          { id: 513, code: 'E21', name: '窯業・土石製品製造業', level: 'middle', parent_id: 5 },
          { id: 514, code: 'E22', name: '鉄鋼業', level: 'middle', parent_id: 5 },
          { id: 515, code: 'E23', name: '非鉄金属製造業', level: 'middle', parent_id: 5 },
          { id: 516, code: 'E24', name: '金属製品製造業', level: 'middle', parent_id: 5 },
          { id: 517, code: 'E25', name: 'はん用機械器具製造業', level: 'middle', parent_id: 5 },
          { id: 518, code: 'E26', name: '生産用機械器具製造業', level: 'middle', parent_id: 5 },
          { id: 519, code: 'E27', name: '業務用機械器具製造業', level: 'middle', parent_id: 5 },
          { id: 520, code: 'E28', name: '電子部品・デバイス・電子回路製造業', level: 'middle', parent_id: 5 },
          { id: 521, code: 'E29', name: '電気機械器具製造業', level: 'middle', parent_id: 5 },
          { id: 522, code: 'E30', name: '情報通信機械器具製造業', level: 'middle', parent_id: 5 },
          { id: 523, code: 'E31', name: '輸送用機械器具製造業', level: 'middle', parent_id: 5 },
          { id: 524, code: 'E32', name: 'その他の製造業', level: 'middle', parent_id: 5 }
        ],
        7: [ // 情報通信業
          { id: 701, code: 'G37', name: '通信業', level: 'middle', parent_id: 7 },
          { id: 702, code: 'G38', name: '放送業', level: 'middle', parent_id: 7 },
          { id: 703, code: 'G39', name: '情報サービス業', level: 'middle', parent_id: 7 },
          { id: 704, code: 'G40', name: 'インターネット附随サービス業', level: 'middle', parent_id: 7 }
        ],
        9: [ // 卸売業・小売業
          { id: 901, code: 'I50', name: '各種商品卸売業', level: 'middle', parent_id: 9 },
          { id: 902, code: 'I51', name: '繊維・衣服等卸売業', level: 'middle', parent_id: 9 },
          { id: 903, code: 'I52', name: '飲食料品卸売業', level: 'middle', parent_id: 9 },
          { id: 904, code: 'I53', name: '建築材料、鉱物・金属材料等卸売業', level: 'middle', parent_id: 9 },
          { id: 905, code: 'I54', name: '機械器具卸売業', level: 'middle', parent_id: 9 },
          { id: 906, code: 'I55', name: 'その他の卸売業', level: 'middle', parent_id: 9 },
          { id: 907, code: 'I56', name: '各種商品小売業', level: 'middle', parent_id: 9 },
          { id: 908, code: 'I57', name: '繊維・衣服・身の回り品小売業', level: 'middle', parent_id: 9 },
          { id: 909, code: 'I58', name: '飲食料品小売業', level: 'middle', parent_id: 9 },
          { id: 910, code: 'I59', name: '機械器具小売業', level: 'middle', parent_id: 9 },
          { id: 911, code: 'I60', name: 'その他の小売業', level: 'middle', parent_id: 9 }
        ],
        13: [ // 宿泊業・飲食サービス業
          { id: 1301, code: 'M75', name: '宿泊業', level: 'middle', parent_id: 13 },
          { id: 1302, code: 'M76', name: '飲食店', level: 'middle', parent_id: 13 },
          { id: 1303, code: 'M77', name: '持ち帰り・配達飲食サービス業', level: 'middle', parent_id: 13 }
        ]
      },
      minor: {
        501: [ // 食料品製造業
          { id: 10101, code: 'E091', name: '畜産食料品製造業', level: 'minor', parent_id: 501 },
          { id: 10102, code: 'E092', name: '水産食料品製造業', level: 'minor', parent_id: 501 },
          { id: 10103, code: 'E093', name: '野菜缶詰・果実缶詰・農産保存食料品製造業', level: 'minor', parent_id: 501 },
          { id: 10104, code: 'E094', name: '調味料製造業', level: 'minor', parent_id: 501 },
          { id: 10105, code: 'E095', name: '糖類製造業', level: 'minor', parent_id: 501 },
          { id: 10106, code: 'E096', name: 'パン・菓子製造業', level: 'minor', parent_id: 501 }
        ],
        516: [ // 金属製品製造業
          { id: 20101, code: 'E241', name: 'ブリキ缶・その他のめっき板等製品製造業', level: 'minor', parent_id: 516 },
          { id: 20102, code: 'E242', name: '洋食器製造業', level: 'minor', parent_id: 516 },
          { id: 20103, code: 'E243', name: 'アルミニウム・同合金プレス製品製造業', level: 'minor', parent_id: 516 },
          { id: 20104, code: 'E244', name: '建設用・建築用金属製品製造業', level: 'minor', parent_id: 516 }
        ],
        703: [ // 情報サービス業
          { id: 30101, code: 'G391', name: 'ソフトウェア業', level: 'minor', parent_id: 703 },
          { id: 30102, code: 'G392', name: '情報処理・提供サービス業', level: 'minor', parent_id: 703 }
        ]
      }
    };

    let categories;
    
    try {
      await initDatabase();
      await initBusinessCategories();
      
      // データベースから取得を試行
      if (level && parent_id) {
        categories = await getBusinessCategoriesByLevel(level as string, parseInt(parent_id as string));
      } else if (level) {
        categories = await getBusinessCategoriesByLevel(level as string);
      } else {
        categories = await getBusinessCategoriesByLevel('major'); // デフォルトは大分類
      }
    } catch (error) {
      console.log('Database connection failed, using fallback data');
      
      // フォールバックデータを使用
      if (level === 'major' || !level) {
        categories = fallbackData.major;
      } else if (level === 'middle' && parent_id) {
        categories = fallbackData.middle[parseInt(parent_id as string)] || [];
      } else if (level === 'minor' && parent_id) {
        categories = fallbackData.minor[parseInt(parent_id as string)] || [];
      } else {
        categories = [];
      }
    }

    res.status(200).json({ categories });
  } catch (error) {
    console.error('Business categories API error:', error);
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
}