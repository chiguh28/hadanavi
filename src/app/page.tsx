import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-bg-card">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-xl font-bold text-primary">
            肌ナビ
          </Link>
          <Link
            href="/shindan"
            className="rounded-full bg-primary px-5 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90"
          >
            診断する
          </Link>
        </div>
      </header>

      <main>
        <section className="bg-primary-light px-4 py-16 text-center">
          <h1 className="mb-4 text-3xl font-bold leading-tight text-foreground md:text-4xl">
            あなたの肌に合う
            <br />
            プチプラコスメ、見つかる。
          </h1>
          <p className="mb-8 text-text-sub">
            肌タイプ診断(5問)・肌悩み選択・予算指定で
            <br />
            最適なスキンケア商品を提案します
          </p>
          <Link
            href="/shindan"
            className="inline-block rounded-full bg-primary px-8 py-3 text-lg font-bold text-white shadow-md transition-opacity hover:opacity-90"
          >
            無料で肌診断する
          </Link>
          <p className="mt-3 text-sm text-text-sub">約1分・5つの質問</p>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-12">
          <h2 className="mb-8 text-center text-2xl font-bold">
            使い方3ステップ
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                step: "STEP 1",
                title: "肌診断",
                desc: "5つの質問に答えて肌タイプを判定",
              },
              {
                step: "STEP 2",
                title: "悩み・予算を選択",
                desc: "あなたの肌悩みと月の予算を選ぶ",
              },
              {
                step: "STEP 3",
                title: "おすすめGET!",
                desc: "あなた専用のスキンケアセットを提案",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="rounded-xl bg-bg-card p-6 text-center shadow-sm"
              >
                <span className="mb-2 inline-block rounded-full bg-primary-light px-3 py-1 text-sm font-bold text-primary">
                  {item.step}
                </span>
                <h3 className="mb-2 text-lg font-bold">{item.title}</h3>
                <p className="text-sm text-text-sub">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-bg-card px-4 py-12">
          <div className="mx-auto max-w-5xl">
            <h2 className="mb-8 text-center text-2xl font-bold">
              肌タイプ別おすすめ
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
              {[
                { id: "dry", name: "乾燥肌" },
                { id: "oily", name: "脂性肌" },
                { id: "combination", name: "混合肌" },
                { id: "sensitive", name: "敏感肌" },
                { id: "normal", name: "普通肌" },
              ].map((type) => (
                <Link
                  key={type.id}
                  href={`/skin-type/${type.id}`}
                  className="rounded-lg border border-border bg-background p-4 text-center transition-shadow hover:shadow-md"
                >
                  <span className="text-lg font-bold text-foreground">
                    {type.name}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 py-12">
          <h2 className="mb-8 text-center text-2xl font-bold">
            お悩み別ケアガイド
          </h2>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {[
              { id: "dryness", name: "乾燥" },
              { id: "pores", name: "毛穴" },
              { id: "acne", name: "ニキビ" },
              { id: "dullness", name: "くすみ" },
              { id: "spots", name: "シミ" },
              { id: "aging", name: "ハリ不足" },
              { id: "redness", name: "赤み" },
              { id: "oiliness", name: "テカリ" },
            ].map((concern) => (
              <Link
                key={concern.id}
                href={`/concern/${concern.id}`}
                className="rounded-lg border border-border bg-bg-card p-4 text-center transition-shadow hover:shadow-md"
              >
                <span className="font-bold text-foreground">
                  {concern.name}
                </span>
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-bg-card px-4 py-8">
        <div className="mx-auto max-w-5xl text-center text-sm text-text-sub">
          <p className="mb-2">
            ※当サイトは医療アドバイスを提供するものではありません
          </p>
          <p className="mb-4">
            ※肌に合わない場合は使用を中止し、皮膚科を受診してください
          </p>
          <p>&copy; 2026 肌ナビ</p>
        </div>
      </footer>
    </div>
  );
}
