"use client";

type Phase = "questions" | "concerns" | "budget";

type ProgressBarProps = {
  phase: Phase;
  currentQuestion: number;
  totalQuestions: number;
};

export default function ProgressBar({
  phase,
  currentQuestion,
  totalQuestions,
}: ProgressBarProps) {
  // Total steps: totalQuestions + concern step + budget step
  const totalSteps = totalQuestions + 2;

  let completedSteps: number;
  if (phase === "questions") {
    completedSteps = currentQuestion;
  } else if (phase === "concerns") {
    completedSteps = totalQuestions;
  } else {
    completedSteps = totalQuestions + 1;
  }

  const progressPercent = (completedSteps / totalSteps) * 100;

  return (
    <div className="w-full">
      {/* Section labels */}
      <div className="mb-2 flex items-center justify-between text-xs text-text-sub">
        <span
          className={
            phase === "questions" ? "font-bold text-primary" : "text-text-sub"
          }
        >
          質問（{phase === "questions" ? currentQuestion + 1 : totalQuestions}/
          {totalQuestions}）
        </span>
        <span
          className={
            phase === "concerns" ? "font-bold text-primary" : "text-text-sub"
          }
        >
          悩み選択
        </span>
        <span
          className={
            phase === "budget" ? "font-bold text-primary" : "text-text-sub"
          }
        >
          予算選択
        </span>
      </div>

      {/* Progress bar track */}
      <div className="h-2 w-full overflow-hidden rounded-full bg-primary-light">
        <div
          className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
}
