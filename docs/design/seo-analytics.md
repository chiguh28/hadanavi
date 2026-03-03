# SEO・アナリティクス・収益設計書

## 1. SEO設計

### 1.1 構造化データ (JSON-LD)

| ページ | スキーマ | 目的 |
|--------|---------|------|
| 全ページ | BreadcrumbList | パンくずリスト |
| 入門ガイド | HowTo | 「スキンケア 順番」検索対応 |
| 悩み別/肌タイプ別 | FAQPage | FAQ表示・検索結果拡張 |
| 商品詳細 | Product | 商品情報リッチスニペット |

### 1.2 メタタグ戦略

```typescript
// 各ページで適切なメタタグを生成
interface PageMeta {
  title: string;       // 最大60文字
  description: string; // 最大120文字
  ogImage: string;     // OGP画像URL
  canonical: string;   // 正規URL
}

// 例: 肌タイプ別ページ
// title: "乾燥肌におすすめのプチプラスキンケア｜肌ナビ"
// description: "乾燥肌に合うプチプラ化粧水・乳液・美容液を厳選。セラミド配合のおすすめ商品と正しいケア順番を解説。"
```

### 1.3 ターゲットキーワード

| キーワード | 検索意図 | 対応ページ | 優先度 |
|-----------|---------|-----------|--------|
| 乾燥肌 化粧水 プチプラ | 商品探し | /skin-type/dry | 高 |
| 毛穴 美容液 おすすめ | 商品探し | /concern/pores | 高 |
| スキンケア 順番 初心者 | 知識 | /guide/skincare-basics | 高 |
| 肌診断 無料 | 診断 | /shindan | 高 |
| ニキビ スキンケア プチプラ | 商品探し | /concern/acne | 中 |
| 敏感肌 化粧水 おすすめ | 商品探し | /skin-type/sensitive | 中 |
| セラミド 化粧水 | 成分探し | /ingredients/ceramide | 中 |

### 1.4 内部リンク戦略

- 診断結果 → 関連する肌タイプページ/悩みページ
- 悩みページ → 関連商品詳細ページ
- 商品詳細 → 同カテゴリの他商品
- 全ページ → 診断CTAボタン
- 入門ガイド → 各ステップの悩みページ

## 2. GA4イベント設計

### 2.1 イベント定義

```typescript
// lib/analytics/events.ts

type GA4Event =
  | { name: "shindan_start"; params: { referrer_page: string } }
  | { name: "shindan_q_answer"; params: { question_id: string; answer_label: string } }
  | { name: "shindan_complete"; params: { skin_type: string; concerns: string; budget: string } }
  | { name: "product_click"; params: { product_id: string; step: string; position: number } }
  | { name: "affiliate_click"; params: { product_id: string; asp_name: string; price: number } }
  | { name: "drugstore_click"; params: { product_id: string } }
  | { name: "result_share"; params: { skin_type: string; platform: string } }
  | { name: "full_routine_expand"; params: { skin_type: string; budget: string } };

function trackEvent(event: GA4Event): void {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", event.name, event.params);
  }
}
```

### 2.2 ファネル分析

```
診断開始 (shindan_start)
    ↓ 完了率目標: 60-75%
診断完了 (shindan_complete)
    ↓ CTR目標: 3-5%
商品クリック (product_click)
    ↓ CVR目標: 1.5-2%
アフィリクリック (affiliate_click)
```

### 2.3 GA4スクリプト配置

```typescript
// app/layout.tsx でグローバル配置
// GTM ID は環境変数で管理
// NEXT_PUBLIC_GA_MEASUREMENT_ID
```

## 3. 収益実装

### 3.1 アフィリエイトURL管理

```typescript
// アフィリエイトURLはビルド時にJSONから埋め込み
// クライアントサイドでの改ざん防止
interface AffiliateConfig {
  amazon: {
    tag: string;  // アソシエイトタグ
    base_url: "https://www.amazon.co.jp/dp/";
  };
  rakuten: {
    affiliate_id: string;
    base_url: string;
  };
}
```

### 3.2 「近くのドラッグストア」ボタン

```typescript
// Google Maps検索へのリンク
function getDrugstoreSearchUrl(productName: string): string {
  const query = encodeURIComponent(`ドラッグストア ${productName}`);
  return `https://www.google.com/maps/search/${query}`;
}
```

### 3.3 CSPヘッダー設定

```typescript
// next.config.ts
const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' https://www.googletagmanager.com",
      "img-src 'self' data: https://m.media-amazon.com https://thumbnail.image.rakuten.co.jp",
      "connect-src 'self' https://www.google-analytics.com",
    ].join("; ")
  }
];
```

## 4. 薬機法対応チェックリスト

### 4.1 許容表現 (化粧品)

- 肌を整える / うるおいを与える / キメを整える
- なめらかにする / 清浄にする / ツヤを与える
- ハリを与える / すこやかに保つ / 引き締める

### 4.2 禁止表現

- ❌ シワ改善 / 美白 / ニキビを治す
- ❌ シミが消える / アンチエイジング / 若返り

### 4.3 実装方針

- key_pointフィールドはすべて薬機法準拠テキストを事前作成
- ビルド時に禁止表現の自動チェック (テスト)
- 免責事項をフッターと結果ページに常時表示
