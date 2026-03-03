"use client";

import type { Budget, BudgetId } from "@/types/diagnosis";
import Button from "@/components/common/Button";

type BudgetSelectorProps = {
  budgets: Budget[];
  selectedBudget: BudgetId | null;
  onSelect: (budgetId: BudgetId) => void;
  onSubmit: () => void;
  onBack: () => void;
};

export default function BudgetSelector({
  budgets,
  selectedBudget,
  onSelect,
  onSubmit,
  onBack,
}: BudgetSelectorProps) {
  return (
    <div className="rounded-xl bg-bg-card p-6 shadow-sm">
      <h2 className="mb-2 text-lg font-bold">月々の予算を選んでください</h2>
      <p className="mb-6 text-sm text-text-sub">
        予算に合わせたスキンケアルーティンを提案します
      </p>

      {/* Budget options */}
      <div className="flex flex-col gap-3">
        {budgets.map((budget) => {
          const isSelected = selectedBudget === budget.id;
          return (
            <button
              key={budget.id}
              onClick={() => onSelect(budget.id)}
              className={`w-full rounded-lg border-2 px-4 py-4 text-left transition-all active:scale-[0.98] ${
                isSelected
                  ? "border-primary bg-primary-light"
                  : "border-border bg-white hover:border-primary hover:bg-primary-light"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold">{budget.label}</span>
                {budget.max_price !== null && (
                  <span className="text-xs text-text-sub">
                    1品あたり〜{budget.max_price.toLocaleString()}円
                  </span>
                )}
              </div>
              <p className="mt-1 text-sm text-text-sub">
                {budget.description}
              </p>
            </button>
          );
        })}
      </div>

      {/* Navigation buttons */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-1 text-sm text-text-sub transition-colors hover:text-primary"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 12H5" />
            <path d="m12 19-7-7 7-7" />
          </svg>
          戻る
        </button>

        <Button
          onClick={onSubmit}
          size="lg"
          disabled={selectedBudget === null}
          className={selectedBudget === null ? "opacity-50 cursor-not-allowed" : ""}
        >
          結果を見る
        </Button>
      </div>
    </div>
  );
}
