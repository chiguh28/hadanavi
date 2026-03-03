# データ設計書

## 1. 型定義

### 1.1 商品 (Product)

```typescript
interface Product {
  product_id: string;           // ユニーク識別子 例: "cleansing_001"
  name: string;                 // 商品名
  brand: string;                // ブランド名
  price: number;                // 税込価格 (円)
  category: ProductCategory;    // 商品カテゴリ
  key_point: string;            // 提案理由 (薬機法準拠)
  sensitivity_safe: boolean;    // 敏感肌対応フラグ
  exclude_skin_types: SkinType[];  // 除外肌タイプ
  ceramide_type?: "human_type" | "pseudo";  // セラミド種別
  evidence_level: "cosmetic" | "quasi_drug";  // 化粧品/医薬部外品
  availability: "current" | "discontinued";   // 販売状態
  concentration_note?: string;  // 高濃度成分注意書き
  price_updated_at: string;     // 価格更新日 (ISO 8601)
  affiliate_urls: AffiliateUrls;  // アフィリエイトURL
  image_url?: string;           // 商品画像パス
}

interface AffiliateUrls {
  amazon?: string;
  rakuten?: string;
  yahoo?: string;
}

type ProductCategory = "cleansing" | "face_wash" | "toner" | "serum" | "moisturizer" | "sunscreen";
```

### 1.2 肌タイプ (SkinType)

```typescript
type SkinType = "dry" | "oily" | "combination" | "sensitive" | "normal";

interface SkinTypeInfo {
  id: SkinType;
  name: string;        // 日本語名 "乾燥肌"
  description: string; // 概要
  characteristics: string[];  // 特徴リスト
  care_tips: string[];        // ケアポイント
}
```

### 1.3 肌悩み (Concern)

```typescript
type ConcernId = "dryness" | "pores" | "acne" | "dullness" | "spots" | "aging" | "redness" | "oiliness";

interface Concern {
  id: ConcernId;
  name: string;           // 日本語名
  description: string;    // 説明
  recommended_ingredients: string[];  // 推奨成分
  sensitive_alternatives?: string[];  // 敏感肌向け代替成分
}
```

### 1.4 予算 (Budget)

```typescript
type BudgetId = "under_1000" | "under_3000" | "under_5000" | "no_limit";

interface Budget {
  id: BudgetId;
  label: string;           // 表示ラベル
  max_price: number | null; // 上限価格 (null = 制限なし)
  description: string;     // 説明
  routine_type: "minimal" | "standard" | "full";  // ルーティン種別
}
```

### 1.5 診断質問 (Question)

```typescript
interface Question {
  id: string;              // "q1" ~ "q5"
  text: string;            // 質問文
  options: QuestionOption[];
}

interface QuestionOption {
  label: string;           // 選択肢テキスト
  scores: Record<SkinType, number>;  // 肌タイプ別スコア
}
```

### 1.6 診断結果 (DiagnosisResult)

```typescript
interface DiagnosisResult {
  skin_type: SkinType;
  scores: Record<SkinType, number>;  // 各肌タイプの合計スコア
  concerns: ConcernId[];
  budget: BudgetId;
  recommendations: RoutineRecommendation;
}

interface RoutineRecommendation {
  minimal: StepRecommendation[];   // 3ステップ (洗顔・化粧水・乳液)
  full: StepRecommendation[];      // 6ステップ
  seasonal_advice: SeasonalAdvice;
}

interface StepRecommendation {
  step: ProductCategory;
  step_label: string;      // "洗顔" etc
  step_order: number;      // 表示順
  products: Product[];     // フィルタ済み商品リスト (優先順位ソート済)
  fallback_applied?: boolean;  // フォールバック適用フラグ
  fallback_note?: string;     // フォールバック注記
}

interface SeasonalAdvice {
  season: "spring" | "summer" | "autumn" | "winter";
  concerns: string[];
  ingredients: string[];
}
```

## 2. JSONデータ構造

### 2.1 商品データ配置

```
src/data/products/
├── cleansing.json     # { "dry": [...], "oily": [...], ... }  肌タイプ別
├── face_wash.json     # { "dry": [...], "oily": [...], ... }  肌タイプ別
├── toner.json         # { "dry": [...], "oily": [...], ... }  肌タイプ別
├── serum.json         # { "dryness": [...], "pores": [...], ... }  悩み別
├── moisturizer.json   # { "dry": [...], "oily": [...], ... }  肌タイプ別
└── sunscreen.json     # { "dry": [...], "oily": [...], ... }  肌タイプ別
```

**serum以外:**
```json
{
  "dry": [
    {
      "product_id": "cleansing_001",
      "name": "商品名",
      "brand": "ブランド名",
      "price": 660,
      "key_point": "ヒト型セラミド配合でうるおいを守りながら洗う",
      "sensitivity_safe": true,
      "exclude_skin_types": [],
      "ceramide_type": "human_type",
      "evidence_level": "cosmetic",
      "availability": "current",
      "price_updated_at": "2026-03-01",
      "affiliate_urls": {
        "amazon": "https://...",
        "rakuten": "https://..."
      }
    }
  ],
  "oily": [...],
  "combination": [...],
  "sensitive": [...],
  "normal": [...]
}
```

**serum (悩み別):**
```json
{
  "dryness": [
    {
      "product_id": "serum_001",
      "name": "商品名",
      "brand": "ブランド名",
      "price": 980,
      "key_point": "セラミド配合でうるおいを与える",
      "sensitivity_safe": true,
      "exclude_skin_types": [],
      "evidence_level": "quasi_drug",
      "availability": "current",
      "concentration_note": null,
      "price_updated_at": "2026-03-01",
      "affiliate_urls": { "amazon": "https://..." }
    }
  ],
  "pores": [...],
  "acne": [...]
}
```

### 2.2 診断質問データ

```json
// src/data/questions.json
[
  {
    "id": "q1",
    "text": "洗顔後10分放置した肌の状態は？",
    "options": [
      {
        "label": "全体的につっぱる",
        "scores": { "dry": 3, "oily": 0, "combination": 0, "sensitive": 1, "normal": 0 }
      },
      {
        "label": "全体的にベタつく",
        "scores": { "dry": 0, "oily": 3, "combination": 0, "sensitive": 0, "normal": 0 }
      },
      {
        "label": "Tゾーンはベタつくが頬はつっぱる",
        "scores": { "dry": 0, "oily": 0, "combination": 3, "sensitive": 0, "normal": 0 }
      },
      {
        "label": "特に変化なし",
        "scores": { "dry": 0, "oily": 0, "combination": 0, "sensitive": 0, "normal": 3 }
      }
    ]
  }
]
```

### 2.3 肌悩みデータ

```json
// src/data/concerns.json
[
  {
    "id": "dryness",
    "name": "乾燥",
    "description": "肌のうるおい不足、カサつき",
    "serum_count": 2,
    "safe_count": 2,
    "recommended_ingredients": ["セラミド", "ヒアルロン酸", "スクワラン"],
    "sensitive_alternatives": null
  },
  {
    "id": "pores",
    "name": "毛穴",
    "description": "毛穴の開き、黒ずみ",
    "serum_count": 3,
    "safe_count": 0,
    "recommended_ingredients": ["ナイアシンアミド", "ビタミンC誘導体", "レチノール"],
    "sensitive_alternatives": ["ナイアシンアミド低濃度", "アゼライン酸"]
  }
]
```

## 3. ビルド時前処理

### 3.1 商品インデックス生成

ビルド時に全JSONを読み込み、以下を生成:

1. **product_idユニーク配列:** 全商品のフラット配列 (重複排除)
2. **逆引きインデックス:** product_id → 出現ステップ×肌タイプ/悩みのマッピング
3. **商品詳細ページパス:** SSGのgenerateStaticParamsで使用

```typescript
// ビルド時処理 (lib/data/buildIndex.ts)
interface ProductIndex {
  products: Record<string, Product>;  // product_id → Product
  byStep: Record<ProductCategory, Record<string, string[]>>;  // step → skinType/concern → product_ids
}
```

### 3.2 generateStaticParams

```typescript
// 商品詳細ページ用
export async function generateStaticParams() {
  const index = await buildProductIndex();
  return Object.keys(index.products).map(id => ({ id }));
}
```
