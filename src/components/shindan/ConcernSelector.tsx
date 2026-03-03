"use client";

import type { Concern, ConcernId } from "@/types/diagnosis";
import Button from "@/components/common/Button";

type ConcernSelectorProps = {
  concerns: Concern[];
  selectedConcerns: ConcernId[];
  onToggle: (concernId: ConcernId) => void;
  onNext: () => void;
  onBack: () => void;
};

export default function ConcernSelector({
  concerns,
  selectedConcerns,
  onToggle,
  onNext,
  onBack,
}: ConcernSelectorProps) {
  return (
    <div className="rounded-xl bg-bg-card p-6 shadow-sm">
      <h2 className="mb-2 text-lg font-bold">気になる肌悩みを選んでください</h2>
      <p className="mb-6 text-sm text-text-sub">
        複数選択できます。悩みがない場合はスキップできます
      </p>

      {/* Concern chips grid: 2 columns on mobile, 4 on desktop */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {concerns.map((concern) => {
          const isSelected = selectedConcerns.includes(concern.id);
          return (
            <button
              key={concern.id}
              onClick={() => onToggle(concern.id)}
              className={`rounded-lg border-2 px-3 py-3 text-center transition-all active:scale-[0.97] ${
                isSelected
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-white text-foreground hover:border-primary hover:bg-primary-light"
              }`}
            >
              <span className="block text-sm font-bold">{concern.name}</span>
              <span
                className={`mt-1 block text-xs ${
                  isSelected ? "text-white/80" : "text-text-sub"
                }`}
              >
                {concern.description}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected count */}
      {selectedConcerns.length > 0 && (
        <p className="mt-4 text-center text-sm text-primary">
          {selectedConcerns.length}件選択中
        </p>
      )}

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

        <Button onClick={onNext} size="md">
          次へ
        </Button>
      </div>
    </div>
  );
}
