# アーキテクチャ設計書

## 1. システム全体構成

```
┌─────────────────────────────────────────────────┐
│                    Vercel CDN                     │
│  ┌──────────────┐  ┌──────────────┐  ┌─────────┐│
│  │  SSG Pages   │  │ API Routes   │  │ Static  ││
│  │  (HTML/JSON) │  │ (/api/og)    │  │ Assets  ││
│  └──────────────┘  └──────────────┘  └─────────┘│
└─────────────────────────────────────────────────┘
         ↑                  ↑
         │                  │
┌────────┴──────────────────┴─────────────────────┐
│              Next.js App Router                   │
│  ┌────────────┐ ┌────────────┐ ┌──────────────┐ │
│  │ Pages      │ │ Components │ │ Data (JSON)  │ │
│  │ (SSG)      │ │ (Client)   │ │ v3.1         │ │
│  └────────────┘ └────────────┘ └──────────────┘ │
│                                                   │
│  ┌────────────────────────────────────────────┐  │
│  │       診断エンジン (クライアントJS)          │  │
│  │  スコアリング → 肌タイプ判定 → フィルタ     │  │
│  │  → レコメンド → 結果表示                    │  │
│  └────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────┘
         ↑
         │ GA4 / Affiliate Links
         ↓
┌──────────────────────────────────────────────────┐
│  外部サービス                                     │
│  - Google Analytics 4                             │
│  - Amazon アソシエイト                            │
│  - 楽天アフィリエイト                             │
│  - Google Maps (ドラッグストア検索)               │
└──────────────────────────────────────────────────┘
```

## 2. 技術スタック

| レイヤー | 技術 | バージョン | 理由 |
|----------|------|-----------|------|
| フレームワーク | Next.js (App Router) | 15.x | SSG/SEO最適化・Vercelとの親和性 |
| UI | TailwindCSS | 4.x | ユーティリティファースト・軽量 |
| 言語 | TypeScript | 5.x | 型安全性 |
| OGP生成 | @vercel/og | latest | Edge Runtime対応 |
| 解析 | GA4 | - | イベント設計済 |
| テスト | Vitest + Playwright | - | 単体テスト + E2E |
| Lint | ESLint + Prettier | - | コード品質 |
| ホスティング | Vercel (Free) | - | CDN・ゼロコスト |

## 3. ディレクトリ構成

```
hadanavi/
├── src/
│   ├── app/                      # App Router
│   │   ├── layout.tsx            # ルートレイアウト
│   │   ├── page.tsx              # トップページ (/)
│   │   ├── shindan/
│   │   │   ├── page.tsx          # 診断ページ (/shindan)
│   │   │   └── result/
│   │   │       └── page.tsx      # 結果ページ (/shindan/result)
│   │   ├── concern/
│   │   │   └── [id]/
│   │   │       └── page.tsx      # 悩み別ページ (/concern/[id])
│   │   ├── skin-type/
│   │   │   └── [id]/
│   │   │       └── page.tsx      # 肌タイプ別ページ (/skin-type/[id])
│   │   ├── guide/
│   │   │   └── skincare-basics/
│   │   │       └── page.tsx      # 入門ガイド
│   │   ├── ingredients/
│   │   │   └── [name]/
│   │   │       └── page.tsx      # 成分辞典
│   │   ├── product/
│   │   │   └── [id]/
│   │   │       └── page.tsx      # 商品詳細
│   │   └── api/
│   │       └── og/
│   │           └── route.tsx     # OGP画像生成
│   ├── components/
│   │   ├── layout/               # ヘッダー・フッター・ナビ
│   │   ├── shindan/              # 診断UI関連
│   │   │   ├── QuestionCard.tsx
│   │   │   ├── ProgressBar.tsx
│   │   │   ├── ConcernSelector.tsx
│   │   │   └── BudgetSelector.tsx
│   │   ├── result/               # 結果表示関連
│   │   │   ├── SkinTypeResult.tsx
│   │   │   ├── ProductCard.tsx
│   │   │   ├── RoutineSteps.tsx
│   │   │   └── ShareButton.tsx
│   │   └── common/               # 共通コンポーネント
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       └── SEOHead.tsx
│   ├── lib/
│   │   ├── diagnosis/            # 診断ロジック
│   │   │   ├── scoring.ts        # スコアリング計算
│   │   │   ├── tieBreaking.ts    # 同点判定
│   │   │   └── types.ts          # 診断関連型定義
│   │   ├── recommendation/       # レコメンドロジック
│   │   │   ├── filter.ts         # フィルタリング
│   │   │   ├── fallback.ts       # フォールバック
│   │   │   └── sort.ts           # 優先順位ソート
│   │   ├── analytics/            # GA4
│   │   │   └── events.ts
│   │   └── utils/                # ユーティリティ
│   │       ├── seasonal.ts       # 季節判定
│   │       └── format.ts         # 価格フォーマット等
│   ├── data/
│   │   ├── products/             # 商品データ (JSON)
│   │   │   ├── cleansing.json
│   │   │   ├── face_wash.json
│   │   │   ├── toner.json
│   │   │   ├── serum.json        # concern別
│   │   │   ├── moisturizer.json
│   │   │   └── sunscreen.json
│   │   ├── questions.json        # 診断質問
│   │   ├── scoring-matrix.json   # スコアリングマトリクス
│   │   └── concerns.json         # 肌悩み定義
│   └── types/                    # グローバル型定義
│       ├── product.ts
│       ├── diagnosis.ts
│       └── skincare.ts
├── public/
│   ├── images/
│   └── fonts/
├── tests/
│   ├── unit/                     # Vitest単体テスト
│   └── e2e/                      # Playwright E2E
├── docs/
│   ├── requirements.md
│   └── design/                   # 設計書
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

## 4. レンダリング戦略

| ページ | レンダリング | キャッシュ | 理由 |
|--------|-------------|-----------|------|
| トップ (/) | SSG | ISR不要(静的) | SEO・パフォーマンス |
| 診断 (/shindan) | SSG + Client JS | 静的シェル | 診断ロジックはクライアント |
| 結果 (/shindan/result) | CSR (Client Only) | なし | ユーザー入力依存 |
| 悩み別 (/concern/[id]) | SSG (8ページ) | 静的 | SEO |
| 肌タイプ (/skin-type/[id]) | SSG (5ページ) | 静的 | SEO |
| 入門ガイド | SSG | 静的 | SEO |
| 成分辞典 | SSG (~10ページ) | 静的 | SEO |
| 商品詳細 | SSG (58ページ) | 静的 | SEO |
| OGP API | Edge Runtime | 短期キャッシュ | 動的生成 |

## 5. 状態管理

診断フローの状態はクライアントサイドで管理:

- **診断回答:** React useState / useReducer
- **ページ間状態渡し:** URL クエリパラメータ (`/shindan/result?type=dry&concerns=pores,acne&budget=under_3000`)
- **グローバル状態管理:** 不要 (ページ間はURLパラメータで完結)

## 6. パフォーマンス戦略

| 施策 | 目標 |
|------|------|
| SSGによる静的HTML配信 | FCP 1.5秒以内 |
| TailwindCSS PurgeによるCSS最小化 | CSS < 20KB |
| 画像最適化 (next/image + WebP) | LCP 2.5秒以内 |
| 商品データの分割ロード | 初期JS < 100KB |
| Edge Runtimeでのogp生成 | OGP応答 < 500ms |
| フォント最適化 (next/font) | CLS < 0.1 |

目標: Lighthouse Performance 90+, SEO 95+

## 7. セキュリティ

| 対策 | 内容 |
|------|------|
| CSP | アフィリエイトURL改ざん防止 |
| アフィリURL | ビルド時埋込み (ハードコード) |
| 個人情報 | 収集なし。Cookie最小限 (GA4のみ) |
| XSS | React標準のエスケープ + CSPヘッダー |
