import Link from "next/link";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";

export default function Home() {
  return (
    <div className="bg-background">
      {/* Hero section */}
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
        <Button href="/shindan" variant="primary" size="lg" className="shadow-md font-bold">
          無料で肌診断する
        </Button>
        <p className="mt-3 text-sm text-text-sub">約1分・5つの質問</p>
      </section>

      {/* How to use - 3 steps */}
      <section id="how-to-use" className="mx-auto max-w-5xl px-4 py-12">
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
            <Card key={item.step} className="text-center">
              <span className="mb-2 inline-block rounded-full bg-primary-light px-3 py-1 text-sm font-bold text-primary">
                {item.step}
              </span>
              <h3 className="mb-2 text-lg font-bold">{item.title}</h3>
              <p className="text-sm text-text-sub">{item.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Skin type recommendations */}
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

      {/* Concern guide */}
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
    </div>
  );
}
