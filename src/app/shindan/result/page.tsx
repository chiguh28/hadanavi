"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import type { SkinType, ConcernId, BudgetId } from "@/types/diagnosis";
import type { SeasonalAdvice } from "@/types/skincare";
import { buildRecommendation } from "@/lib/recommendation/engine";
import SkinTypeResult from "@/components/result/SkinTypeResult";
import RoutineSteps from "@/components/result/RoutineSteps";
import Button from "@/components/common/Button";
import Card from "@/components/common/Card";

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

const VALID_SKIN_TYPES: SkinType[] = [
  "dry",
  "oily",
  "combination",
  "sensitive",
  "normal",
];
const VALID_CONCERNS: ConcernId[] = [
  "dryness",
  "pores",
  "acne",
  "dullness",
  "spots",
  "aging",
  "redness",
  "oiliness",
];
const VALID_BUDGETS: BudgetId[] = [
  "under_1000",
  "under_3000",
  "under_5000",
  "no_limit",
];

function isValidSkinType(v: string): v is SkinType {
  return (VALID_SKIN_TYPES as string[]).includes(v);
}

function isValidConcern(v: string): v is ConcernId {
  return (VALID_CONCERNS as string[]).includes(v);
}

function isValidBudget(v: string): v is BudgetId {
  return (VALID_BUDGETS as string[]).includes(v);
}

// ---------------------------------------------------------------------------
// Season display names
// ---------------------------------------------------------------------------

const SEASON_NAMES: Record<string, string> = {
  spring: "春",
  summer: "夏",
  autumn: "秋",
  winter: "冬",
};

// ---------------------------------------------------------------------------
// SeasonalAdviceCard
// ---------------------------------------------------------------------------

function SeasonalAdviceCard({ advice }: { advice: SeasonalAdvice }) {
  return (
    <Card className="border border-secondary/30 bg-blue-50">
      <h3 className="mb-3 text-base font-bold text-foreground">
        {SEASON_NAMES[advice.season] ?? advice.season}のスキンケアアドバイス
      </h3>
      <div className="mb-3">
        <p className="mb-1 text-xs font-medium text-text-sub">注意ポイント</p>
        <ul className="space-y-1">
          {advice.concerns.map((c) => (
            <li key={c} className="flex items-start gap-2 text-sm text-foreground">
              <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
              {c}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <p className="mb-1 text-xs font-medium text-text-sub">
          おすすめ成分
        </p>
        <div className="flex flex-wrap gap-2">
          {advice.ingredients.map((i) => (
            <span
              key={i}
              className="rounded-full bg-secondary/20 px-3 py-0.5 text-xs font-medium text-secondary"
            >
              {i}
            </span>
          ))}
        </div>
      </div>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Disclaimers
// ---------------------------------------------------------------------------

function Disclaimers() {
  return (
    <Card className="border border-border bg-gray-50">
      <h3 className="mb-3 text-sm font-bold text-foreground">ご注意</h3>
      <ul className="space-y-2">
        <li className="flex items-start gap-2 text-xs text-text-sub">
          <span className="mt-0.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
          新しい化粧品を使用する前に、必ずパッチテストを行ってください。
        </li>
        <li className="flex items-start gap-2 text-xs text-text-sub">
          <span className="mt-0.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
          肌トラブルが続く場合は、皮膚科の受診をおすすめします。
        </li>
        <li className="flex items-start gap-2 text-xs text-text-sub">
          <span className="mt-0.5 block h-1.5 w-1.5 shrink-0 rounded-full bg-warning" />
          本サイトの情報は医療アドバイスではありません。参考情報としてご活用ください。
        </li>
      </ul>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Error state
// ---------------------------------------------------------------------------

function MissingParamsError() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <Card>
        <h2 className="mb-4 text-xl font-bold text-foreground">
          診断データがありません
        </h2>
        <p className="mb-6 text-sm text-text-sub">
          診断結果を表示するためには、まず肌診断を行ってください。
        </p>
        <Button href="/shindan" variant="primary" size="lg">
          肌診断をはじめる
        </Button>
      </Card>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Loading state
// ---------------------------------------------------------------------------

function ResultLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 text-center">
      <p className="text-text-sub">診断結果を読み込み中...</p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Result content (reads searchParams)
// ---------------------------------------------------------------------------

function ResultContent() {
  const searchParams = useSearchParams();
  const [showFullRoutine, setShowFullRoutine] = useState(false);

  // Parse and validate URL parameters
  const typeParam = searchParams.get("type") ?? "";
  const concernsParam = searchParams.get("concerns") ?? "";
  const budgetParam = searchParams.get("budget") ?? "";

  const validationResult = useMemo(() => {
    if (!isValidSkinType(typeParam)) return null;
    if (!isValidBudget(budgetParam)) return null;

    const concernStrings = concernsParam
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const validConcerns = concernStrings.filter(isValidConcern);

    // At least the skin type and budget must be valid
    return {
      skinType: typeParam,
      concerns: validConcerns as ConcernId[],
      budget: budgetParam as BudgetId,
    };
  }, [typeParam, concernsParam, budgetParam]);

  // Build recommendation
  const recommendation = useMemo(() => {
    if (!validationResult) return null;
    return buildRecommendation(
      validationResult.skinType,
      validationResult.concerns,
      validationResult.budget
    );
  }, [validationResult]);

  // Missing or invalid params
  if (!validationResult || !recommendation) {
    return <MissingParamsError />;
  }

  const { skinType, budget } = validationResult;
  const isLowBudget = budget === "under_1000";

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="space-y-8">
        {/* Skin type hero card */}
        <SkinTypeResult skinType={skinType} />

        {/* Seasonal advice */}
        <SeasonalAdviceCard advice={recommendation.seasonal_advice} />

        {/* Minimal routine */}
        <RoutineSteps
          steps={recommendation.minimal}
          title="基本ルーティン（最小限3ステップ）"
        />

        {/* Low budget note */}
        {isLowBudget && (
          <Card className="border border-primary/30 bg-primary-light">
            <p className="text-sm text-foreground">
              現在の予算（1,000円以下/個）では、まず基本の3ステップから始めるのがおすすめです。余裕ができたら、下のフルルーティンも検討してみてください。
            </p>
          </Card>
        )}

        {/* Full routine toggle */}
        {!isLowBudget ? (
          <>
            {!showFullRoutine && (
              <div className="text-center">
                <button
                  onClick={() => setShowFullRoutine(true)}
                  className="inline-flex items-center rounded-full border-2 border-primary px-6 py-2 text-sm font-medium text-primary transition-all hover:bg-primary-light"
                >
                  フルルーティンを見る
                </button>
              </div>
            )}
            {showFullRoutine && (
              <>
                <RoutineSteps
                  steps={recommendation.full}
                  title="フルルーティン（6ステップ）"
                />
                <div className="text-center">
                  <button
                    onClick={() => setShowFullRoutine(false)}
                    className="text-sm text-text-sub underline transition-opacity hover:opacity-70"
                  >
                    フルルーティンを閉じる
                  </button>
                </div>
              </>
            )}
          </>
        ) : (
          <>
            <div className="text-center">
              <button
                onClick={() => setShowFullRoutine(!showFullRoutine)}
                className="inline-flex items-center rounded-full border-2 border-primary px-6 py-2 text-sm font-medium text-primary transition-all hover:bg-primary-light"
              >
                {showFullRoutine
                  ? "フルルーティンを閉じる"
                  : "余裕ができたら追加（フルルーティン）"}
              </button>
            </div>
            {showFullRoutine && (
              <RoutineSteps
                steps={recommendation.full}
                title="フルルーティン（6ステップ）"
              />
            )}
          </>
        )}

        {/* Disclaimers */}
        <Disclaimers />

        {/* Navigation buttons */}
        <div className="flex flex-col items-center gap-3 pb-8">
          <Button href="/shindan" variant="outline" size="lg" className="w-full max-w-xs">
            もう一度診断する
          </Button>
          <Link
            href="/"
            className="text-sm text-text-sub underline transition-opacity hover:opacity-70"
          >
            トップへ戻る
          </Link>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Page (wraps ResultContent in Suspense for useSearchParams)
// ---------------------------------------------------------------------------

export default function ResultPage() {
  return (
    <Suspense fallback={<ResultLoading />}>
      <ResultContent />
    </Suspense>
  );
}
