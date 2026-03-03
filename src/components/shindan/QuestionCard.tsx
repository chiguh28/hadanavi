"use client";

import type { Question } from "@/types/diagnosis";

type QuestionCardProps = {
  question: Question;
  questionIndex: number;
  totalQuestions: number;
  onAnswer: (optionIndex: number) => void;
  onBack: () => void;
  canGoBack: boolean;
};

export default function QuestionCard({
  question,
  questionIndex,
  totalQuestions,
  onAnswer,
  onBack,
  canGoBack,
}: QuestionCardProps) {
  return (
    <div className="animate-[fadeSlideIn_0.3s_ease-out]">
      <div className="rounded-xl bg-bg-card p-6 shadow-sm">
        {/* Question number badge */}
        <div className="mb-4 flex items-center gap-3">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
            {questionIndex + 1}
          </span>
          <span className="text-sm text-text-sub">
            Q{questionIndex + 1} / {totalQuestions}
          </span>
        </div>

        {/* Question text */}
        <h2 className="mb-6 text-lg font-bold leading-relaxed">
          {question.text}
        </h2>

        {/* Option buttons */}
        <div className="flex flex-col gap-3">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => onAnswer(index)}
              className="w-full rounded-lg border-2 border-border px-4 py-3 text-left text-sm transition-all hover:border-primary hover:bg-primary-light active:scale-[0.98]"
            >
              {option.label}
            </button>
          ))}
        </div>

        {/* Back button */}
        {canGoBack && (
          <button
            onClick={onBack}
            className="mt-4 flex items-center gap-1 text-sm text-text-sub transition-colors hover:text-primary"
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
        )}
      </div>
    </div>
  );
}
