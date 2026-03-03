# 診断ロジック設計書

## 1. 診断フロー全体

```
[Q1] → [Q2] → [Q3] → [Q4] → [Q5]
  ↓       ↓       ↓       ↓       ↓
 スコア加算 (各回答 → 5肌タイプへスコア付与)
                                    ↓
                           [合計スコア算出]
                                    ↓
                           [同点判定 tie_breaking]
                                    ↓
                           [肌タイプ確定]
                                    ↓
                           [肌悩み選択] (複数可)
                                    ↓
                           [予算選択]
                                    ↓
                           [商品フィルタリング]
                                    ↓
                           [結果表示]
```

## 2. スコアリング

### 2.1 アルゴリズム

```typescript
function calculateScores(answers: SelectedOption[]): Record<SkinType, number> {
  const scores: Record<SkinType, number> = {
    dry: 0, oily: 0, combination: 0, sensitive: 0, normal: 0
  };

  for (const answer of answers) {
    for (const [skinType, score] of Object.entries(answer.scores)) {
      scores[skinType as SkinType] += score;
    }
  }

  return scores;
}
```

### 2.2 理論最大スコア

| 肌タイプ | 最大スコア | 組み合わせ |
|----------|-----------|-----------|
| dry | 11 | Q1(3)+Q2(3)+Q4(3)+Q5(2) |
| oily | 11 | Q1(3)+Q2(3)+Q4(3)+Q5(2) |
| combination | 11 | Q1(3)+Q2(3)+Q4(3)+Q5(2) |
| sensitive | 7 | Q1(1)+Q2(1)+Q3(3)+Q4(1)+Q5(1) |
| normal | 12 | Q1(3)+Q2(3)+Q3(1)+Q4(3)+Q5(2) |

## 3. 同点判定 (tie_breaking)

### 3.1 優先順位

```
sensitive > dry > combination > oily > normal
```

### 3.2 ロジック

```typescript
const TIE_BREAKING_ORDER: SkinType[] = [
  "sensitive", "dry", "combination", "oily", "normal"
];

function determineSkinType(scores: Record<SkinType, number>): SkinType {
  const maxScore = Math.max(...Object.values(scores));
  const candidates = Object.entries(scores)
    .filter(([_, score]) => score === maxScore)
    .map(([type]) => type as SkinType);

  if (candidates.length === 1) return candidates[0];

  // 同点時: tie_breaking優先順で決定
  for (const type of TIE_BREAKING_ORDER) {
    if (candidates.includes(type)) return type;
  }

  return candidates[0]; // フォールバック
}
```

### 3.3 理由

- **sensitive最優先:** 安全性直結。刺激成分を避ける必要がある
- 結果画面では「○○肌寄りの△△肌」と両方表示可能

## 4. 商品フィルタリング

### 4.1 フィルタリングフロー

```
Step1: 肌タイプで商品プール選択
  ↓
Step2: 肌悩みで美容液(serum)選択
  ↓
Step3: 敏感肌フィルタ (sensitive → sensitivity_safe=false を除外)
  ↓
Step4: exclude_skin_types フィルタ
  ↓
Step5: 予算フィルタ + フォールバック
  ↓
Step6: 優先順位ソート
  ↓
Step7: 濃度注意書き付与
```

### 4.2 フィルタリング実装

```typescript
function filterProducts(
  products: Product[],
  skinType: SkinType,
  budget: Budget
): FilteredResult {
  let filtered = products;

  // Step3: 敏感肌フィルタ
  if (skinType === "sensitive") {
    filtered = filtered.filter(p => p.sensitivity_safe);
  }

  // Step4: 除外フィルタ
  filtered = filtered.filter(p => !p.exclude_skin_types.includes(skinType));

  // Step5: 予算フィルタ
  if (budget.max_price !== null) {
    const withinBudget = filtered.filter(p => p.price <= budget.max_price!);

    if (withinBudget.length > 0) {
      filtered = withinBudget;
    } else {
      // フォールバック Rule1: 最安商品1件 + 注記
      filtered = [filtered.sort((a, b) => a.price - b.price)[0]];
      return {
        products: filtered,
        fallback_applied: true,
        fallback_note: "予算を少し超えますが、こちらの商品がおすすめです"
      };
    }
  }

  return { products: filtered, fallback_applied: false };
}
```

### 4.3 フォールバックルール

| ルール | 条件 | アクション |
|--------|------|-----------|
| Rule1 | カテゴリ0件 | 最安商品1件 + 「予算を少し超えますが」注記 |
| Rule2 | sensitive + under_1000 | max_price 1.5倍緩和 (¥800→¥1,200) |
| Rule3 | 全ステップ不可 | minimal_routine (3ステップ) 優先 |

```typescript
function applyBudgetWithFallback(
  products: Product[],
  skinType: SkinType,
  budgetId: BudgetId,
  maxPrice: number
): FilteredResult {
  // Rule2: 敏感肌 + under_1000 の場合、1.5倍に緩和
  let effectiveMax = maxPrice;
  if (skinType === "sensitive" && budgetId === "under_1000") {
    effectiveMax = Math.floor(maxPrice * 1.5); // 800 → 1200
  }

  const withinBudget = products.filter(p => p.price <= effectiveMax);

  if (withinBudget.length > 0) {
    return { products: withinBudget, fallback_applied: false };
  }

  // Rule1: 最安商品1件
  const cheapest = products.sort((a, b) => a.price - b.price)[0];
  return {
    products: cheapest ? [cheapest] : [],
    fallback_applied: true,
    fallback_note: "予算を少し超えますが、こちらの商品がおすすめです"
  };
}
```

## 5. 優先順位ソート

```typescript
function sortProducts(products: Product[]): Product[] {
  return products.sort((a, b) => {
    // 1位: sensitivity_safe=true 優先
    if (a.sensitivity_safe !== b.sensitivity_safe) {
      return a.sensitivity_safe ? -1 : 1;
    }
    // 2位: 価格安い順
    if (a.price !== b.price) {
      return a.price - b.price;
    }
    // 3位: 医薬部外品優先
    if (a.evidence_level !== b.evidence_level) {
      return a.evidence_level === "quasi_drug" ? -1 : 1;
    }
    return 0;
  });
}
```

## 6. ルーティン構成

### 6.1 ルーティン定義

| ルーティン | ステップ | 対象予算 |
|-----------|---------|---------|
| minimal (朝/夜共通) | 洗顔 → 化粧水 → 乳液 | under_1000 |
| standard (朝) | 洗顔 → 化粧水 → 美容液 → 乳液 → 日焼け止め | under_3000+ |
| standard (夜) | クレンジング → 洗顔 → 化粧水 → 美容液 → 乳液 | under_3000+ |

### 6.2 ステップ順序

```typescript
const STEP_ORDER: Record<string, { order: number; label: string; routine: string[] }> = {
  cleansing:    { order: 1, label: "クレンジング", routine: ["night"] },
  face_wash:    { order: 2, label: "洗顔",        routine: ["morning", "night", "minimal"] },
  toner:        { order: 3, label: "化粧水",      routine: ["morning", "night", "minimal"] },
  serum:        { order: 4, label: "美容液",      routine: ["morning", "night"] },
  moisturizer:  { order: 5, label: "乳液",        routine: ["morning", "night", "minimal"] },
  sunscreen:    { order: 6, label: "日焼け止め",  routine: ["morning"] },
};
```

## 7. 季節アドバイス

```typescript
function getSeasonalAdvice(month: number): SeasonalAdvice {
  if (month >= 3 && month <= 5) {
    return {
      season: "spring",
      concerns: ["花粉による肌荒れに注意"],
      ingredients: ["セラミド", "CICA"]
    };
  }
  if (month >= 6 && month <= 8) {
    return {
      season: "summer",
      concerns: ["テカリ・UV対策を重点的に"],
      ingredients: ["ビタミンC", "ナイアシンアミド"]
    };
  }
  if (month >= 9 && month <= 11) {
    return {
      season: "autumn",
      concerns: ["夏ダメージの回復を"],
      ingredients: ["レチノール", "セラミド"]
    };
  }
  return {
    season: "winter",
    concerns: ["乾燥・バリア機能低下に注意"],
    ingredients: ["セラミド", "スクワラン"]
  };
}
```

## 8. 重複排除

結果画面で同一商品が複数ステップに出現する場合:

```typescript
function deduplicateProducts(recommendations: StepRecommendation[]): StepRecommendation[] {
  const seen = new Set<string>();
  return recommendations.map(step => ({
    ...step,
    products: step.products.filter(p => {
      if (seen.has(p.product_id)) return false;
      seen.add(p.product_id);
      return true;
    })
  }));
}
```
