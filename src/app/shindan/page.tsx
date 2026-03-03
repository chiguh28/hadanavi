"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import type { ConcernId, BudgetId, Question } from "@/types/diagnosis";
import { calculateScores } from "@/lib/diagnosis/scoring";
import { determineSkinType } from "@/lib/diagnosis/tieBreaking";
import questionsData from "@/data/questions.json";
import concernsData from "@/data/concerns.json";
import budgetsData from "@/data/budgets.json";
import ProgressBar from "@/components/shindan/ProgressBar";
import QuestionCard from "@/components/shindan/QuestionCard";
import ConcernSelector from "@/components/shindan/ConcernSelector";
import BudgetSelector from "@/components/shindan/BudgetSelector";
import type { Concern, Budget } from "@/types/diagnosis";

type Phase = "questions" | "concerns" | "budget";

const questions = questionsData as Question[];
const concerns = concernsData as Concern[];
const budgets = budgetsData as Budget[];

export default function ShindanPage() {
  const router = useRouter();

  const [currentPhase, setCurrentPhase] = useState<Phase>("questions");
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [selectedConcerns, setSelectedConcerns] = useState<ConcernId[]>([]);
  const [selectedBudget, setSelectedBudget] = useState<BudgetId | null>(null);

  // Handle answering a question and auto-advance
  const handleAnswer = useCallback(
    (optionIndex: number) => {
      const newAnswers = [...answers];
      newAnswers[currentQuestion] = optionIndex;
      setAnswers(newAnswers);

      if (currentQuestion < questions.length - 1) {
        // Advance to next question
        setCurrentQuestion(currentQuestion + 1);
      } else {
        // All questions answered, move to concern selection
        setCurrentPhase("concerns");
      }
    },
    [answers, currentQuestion]
  );

  // Handle going back from a question
  const handleQuestionBack = useCallback(() => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  }, [currentQuestion]);

  // Handle going back from concern selection to last question
  const handleConcernBack = useCallback(() => {
    setCurrentPhase("questions");
    setCurrentQuestion(questions.length - 1);
  }, []);

  // Handle toggling a concern
  const handleConcernToggle = useCallback(
    (concernId: ConcernId) => {
      setSelectedConcerns((prev) =>
        prev.includes(concernId)
          ? prev.filter((id) => id !== concernId)
          : [...prev, concernId]
      );
    },
    []
  );

  // Handle moving from concerns to budget
  const handleConcernNext = useCallback(() => {
    setCurrentPhase("budget");
  }, []);

  // Handle going back from budget to concerns
  const handleBudgetBack = useCallback(() => {
    setCurrentPhase("concerns");
  }, []);

  // Handle budget selection
  const handleBudgetSelect = useCallback((budgetId: BudgetId) => {
    setSelectedBudget(budgetId);
  }, []);

  // Handle final submission - redirect to result page
  const handleSubmit = useCallback(() => {
    // AC-D03: Cannot proceed if no questions answered
    if (answers.length === 0) return;
    if (selectedBudget === null) return;

    // Calculate skin type from answers
    const scores = calculateScores(answers, questions);
    const skinType = determineSkinType(scores);

    // Build URL params
    const params = new URLSearchParams();
    params.set("type", skinType);
    if (selectedConcerns.length > 0) {
      params.set("concerns", selectedConcerns.join(","));
    }
    params.set("budget", selectedBudget);

    router.push(`/shindan/result?${params.toString()}`);
  }, [answers, selectedConcerns, selectedBudget, router]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Page title */}
      <h1 className="mb-6 text-center text-2xl font-bold">肌タイプ診断</h1>

      {/* Progress bar */}
      <div className="mb-8">
        <ProgressBar
          phase={currentPhase}
          currentQuestion={currentQuestion}
          totalQuestions={questions.length}
        />
      </div>

      {/* Phase: Questions */}
      {currentPhase === "questions" && (
        <QuestionCard
          key={currentQuestion}
          question={questions[currentQuestion]}
          questionIndex={currentQuestion}
          totalQuestions={questions.length}
          onAnswer={handleAnswer}
          onBack={handleQuestionBack}
          canGoBack={currentQuestion > 0}
        />
      )}

      {/* Phase: Concern selection */}
      {currentPhase === "concerns" && (
        <ConcernSelector
          concerns={concerns}
          selectedConcerns={selectedConcerns}
          onToggle={handleConcernToggle}
          onNext={handleConcernNext}
          onBack={handleConcernBack}
        />
      )}

      {/* Phase: Budget selection */}
      {currentPhase === "budget" && (
        <BudgetSelector
          budgets={budgets}
          selectedBudget={selectedBudget}
          onSelect={handleBudgetSelect}
          onSubmit={handleSubmit}
          onBack={handleBudgetBack}
        />
      )}
    </div>
  );
}
