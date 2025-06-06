import { createWorker } from 'tesseract.js';
import axios from 'axios';

interface OCRResult {
  text: string;
  confidence: number;
  boundingBoxes?: Array<{
    text: string;
    x: number;
    y: number;
    width: number;
    height: number;
    confidence: number;
  }>;
}

interface FinancialDataExtraction {
  extracted_values: {
    [key: string]: {
      value: number | null;
      confidence: number;
      source_text: string;
      reasoning: string;
    };
  };
  period_detection: {
    detected_period: string;
    confidence: number;
    reasoning: string;
  };
  document_type: {
    type: 'balance_sheet' | 'income_statement' | 'trial_balance' | 'cash_flow' | 'unknown';
    confidence: number;
    reasoning: string;
  };
  quality_assessment: {
    overall_score: number;
    issues: string[];
    recommendations: string[];
  };
}

/**
 * 高精度OCR + エージェント分析システム
 */
export class IntelligentOCRAgent {
  private openaiApiKey: string;

  constructor(openaiApiKey: string) {
    this.openaiApiKey = openaiApiKey;
  }

  /**
   * ステップ1: 高精度OCR実行（複数エンジン・複数パス）
   */
  async performHighAccuracyOCR(imageBuffer: Buffer): Promise<OCRResult> {
    const results: OCRResult[] = [];

    try {
      // パス1: 日本語最適化設定
      const worker1 = await createWorker('jpn', 1, {
        logger: m => console.log(`OCR日本語パス: ${m.status} ${m.progress || ''}`),
      });
      
      await worker1.setParameters({
        tessedit_char_whitelist: '0123456789.,円万千百十億兆売上高営業利益純利益総資産純資産流動固定負債資本金剰余金貸借対照表損益計算書（）',
        tessedit_pageseg_mode: '6', // 単一ブロック
      });

      const result1 = await worker1.recognize(imageBuffer);
      results.push({
        text: result1.data.text,
        confidence: result1.data.confidence,
        boundingBoxes: result1.data.words?.map(word => ({
          text: word.text,
          x: word.bbox.x0,
          y: word.bbox.y0,
          width: word.bbox.x1 - word.bbox.x0,
          height: word.bbox.y1 - word.bbox.y0,
          confidence: word.confidence
        }))
      });
      await worker1.terminate();

      // パス2: 数値特化設定
      const worker2 = await createWorker('jpn', 1);
      await worker2.setParameters({
        tessedit_char_whitelist: '0123456789.,',
        tessedit_pageseg_mode: '8', // 単語レベル
      });

      const result2 = await worker2.recognize(imageBuffer);
      results.push({
        text: result2.data.text,
        confidence: result2.data.confidence
      });
      await worker2.terminate();

      // 最も信頼度の高い結果を選択
      const bestResult = results.reduce((best, current) => 
        current.confidence > best.confidence ? current : best
      );

      console.log(`OCR完了: 信頼度${bestResult.confidence}%, テキスト長${bestResult.text.length}文字`);
      return bestResult;

    } catch (error) {
      console.error('OCR処理エラー:', error);
      throw new Error('OCR処理に失敗しました');
    }
  }

  /**
   * ステップ2: エージェントによる知的データ抽出
   */
  async extractFinancialDataWithAgent(ocrResult: OCRResult): Promise<FinancialDataExtraction> {
    const prompt = `
あなたは財務分析のエキスパートエージェントです。OCRで抽出されたテキストから、正確な財務データを抽出してください。

# OCR抽出テキスト:
"""
${ocrResult.text}
"""

# 抽出タスク:
1. **数値の正確な特定**: 売上高、営業利益、純利益、総資産、純資産等の財務数値を特定
2. **期間の検出**: 決算期間（年度）を特定  
3. **書類種別の判定**: 貸借対照表、損益計算書等の種別を判定
4. **データ品質評価**: 抽出データの信頼性を評価

# 出力形式（必須JSON形式）:
{
  "extracted_values": {
    "sales": {"value": 52220967, "confidence": 0.95, "source_text": "純売上高 52,220,967", "reasoning": "明確に「純売上高」として記載"},
    "operating_profit": {"value": -7175778, "confidence": 0.90, "source_text": "営業利益 -7,175,778", "reasoning": "売上総利益から販管費を差し引いた結果"},
    "net_income": {"value": null, "confidence": 0.0, "source_text": "", "reasoning": "当期純利益の記載が見つからない"},
    "total_assets": {"value": null, "confidence": 0.0, "source_text": "", "reasoning": "資産合計の記載が不明確"}
  },
  "period_detection": {
    "detected_period": "2023",
    "confidence": 0.85,
    "reasoning": "「令和4年4月1日 至 令和5年3月31日」から2023年度と判定"
  },
  "document_type": {
    "type": "income_statement",
    "confidence": 0.90,
    "reasoning": "売上高、営業利益等の損益項目が含まれている"
  },
  "quality_assessment": {
    "overall_score": 0.85,
    "issues": ["一部の数値が不明確", "貸借対照表データが不足"],
    "recommendations": ["追加のOCR処理が必要", "他のページも確認推奨"]
  }
}

重要な注意点:
- 数値は必ずカンマを除去した整数で出力
- 負の値は正しくマイナス符号を付ける
- 不明確な場合はnullとし、その理由を明記
- 信頼度は0.0-1.0の範囲で評価
`;

    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4',
          messages: [
            {
              role: 'system',
              content: 'あなたは財務分析専門のAIエージェントです。OCR結果から正確に財務データを抽出し、JSON形式で回答してください。'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.1, // 一貫性重視
          max_tokens: 2000,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.openaiApiKey}`,
          },
        }
      );

      const agentResponse = response.data.choices[0].message.content;
      console.log('エージェント分析結果:', agentResponse);

      // JSONパースを試行
      const jsonMatch = agentResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const extractedData = JSON.parse(jsonMatch[0]);
        return extractedData as FinancialDataExtraction;
      } else {
        throw new Error('エージェントからのJSON応答が取得できませんでした');
      }

    } catch (error) {
      console.error('エージェント分析エラー:', error);
      
      // フォールバック: 基本的なパターンマッチング
      return this.fallbackExtraction(ocrResult.text);
    }
  }

  /**
   * ステップ3: 結果の検証と補正
   */
  async validateAndCorrectData(extraction: FinancialDataExtraction): Promise<FinancialDataExtraction> {
    // 論理チェック（例：売上総利益 = 売上高 - 売上原価）
    const sales = extraction.extracted_values.sales?.value;
    const grossProfit = extraction.extracted_values.gross_profit?.value;
    const costOfSales = extraction.extracted_values.cost_of_sales?.value;

    if (sales && grossProfit && costOfSales) {
      const calculatedGrossProfit = sales - costOfSales;
      const deviation = Math.abs(grossProfit - calculatedGrossProfit) / grossProfit;
      
      if (deviation > 0.1) { // 10%以上の乖離
        extraction.quality_assessment.issues.push(
          `売上総利益の計算に不整合: 記載${grossProfit} vs 計算${calculatedGrossProfit}`
        );
        extraction.quality_assessment.overall_score *= 0.8;
      }
    }

    return extraction;
  }

  /**
   * フォールバック抽出（エージェント失敗時）
   */
  private fallbackExtraction(text: string): FinancialDataExtraction {
    const extractNumber = (pattern: RegExp): number | null => {
      const match = text.match(pattern);
      if (match) {
        const numStr = match[1].replace(/[,\s]/g, '');
        return parseInt(numStr) || null;
      }
      return null;
    };

    return {
      extracted_values: {
        sales: {
          value: extractNumber(/(?:純)?売上高[：:\s,]*(-?[0-9,\s]+)/i),
          confidence: 0.7,
          source_text: '',
          reasoning: 'パターンマッチングによる抽出'
        }
      },
      period_detection: {
        detected_period: '不明',
        confidence: 0.0,
        reasoning: 'エージェント分析失敗のためフォールバック'
      },
      document_type: {
        type: 'unknown',
        confidence: 0.0,
        reasoning: 'エージェント分析失敗のためフォールバック'
      },
      quality_assessment: {
        overall_score: 0.5,
        issues: ['エージェント分析が失敗'],
        recommendations: ['再度OCR処理を実行']
      }
    };
  }

  /**
   * メイン実行関数
   */
  async analyzeFinancialDocument(imageBuffer: Buffer): Promise<FinancialDataExtraction> {
    console.log('=== 知的OCR分析開始 ===');
    
    // ステップ1: 高精度OCR
    const ocrResult = await this.performHighAccuracyOCR(imageBuffer);
    
    // ステップ2: エージェント分析
    const extraction = await this.extractFinancialDataWithAgent(ocrResult);
    
    // ステップ3: 検証・補正
    const validatedResult = await this.validateAndCorrectData(extraction);
    
    console.log('=== 知的OCR分析完了 ===');
    console.log(`全体スコア: ${validatedResult.quality_assessment.overall_score}`);
    
    return validatedResult;
  }
}

// ファクトリー関数
export function createIntelligentOCRAgent(openaiApiKey: string): IntelligentOCRAgent {
  return new IntelligentOCRAgent(openaiApiKey);
}