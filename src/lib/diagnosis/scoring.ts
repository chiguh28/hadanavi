import type { SkinType, Question } from "@/types/diagnosis";

const SKIN_TYPES: SkinType[] = ["dry", "oily", "combination", "sensitive", "normal"];

/**
 * Calculate skin type scores from the user's selected answers.
 *
 * @param selectedOptionIndices - Array of selected option indices, one per question
 * @param questions - Array of Question objects (from questions.json)
 * @returns Record mapping each SkinType to its accumulated score
 */
export function calculateScores(
  selectedOptionIndices: number[],
  questions: Question[]
): Record<SkinType, number> {
  const scores: Record<SkinType, number> = {
    dry: 0,
    oily: 0,
    combination: 0,
    sensitive: 0,
    normal: 0,
  };

  for (let i = 0; i < questions.length; i++) {
    const optionIndex = selectedOptionIndices[i];
    if (optionIndex === undefined || optionIndex === null) {
      continue;
    }

    const question = questions[i];
    const option = question.options[optionIndex];
    if (!option) {
      continue;
    }

    for (const skinType of SKIN_TYPES) {
      scores[skinType] += option.scores[skinType] ?? 0;
    }
  }

  return scores;
}
