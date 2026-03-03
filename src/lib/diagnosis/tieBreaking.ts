import type { SkinType } from "@/types/diagnosis";

/**
 * Priority order for tie-breaking.
 * When multiple skin types share the highest score, the one appearing
 * earlier in this list wins.
 */
const PRIORITY_ORDER: SkinType[] = [
  "sensitive",
  "dry",
  "combination",
  "oily",
  "normal",
];

/**
 * Determine the winning skin type from a scores record.
 *
 * - If a single skin type has the highest score, return it.
 * - If multiple skin types are tied for the highest score,
 *   use the priority order: sensitive > dry > combination > oily > normal.
 *
 * @param scores - Record mapping each SkinType to its score
 * @returns The winning SkinType
 */
export function determineSkinType(scores: Record<SkinType, number>): SkinType {
  const maxScore = Math.max(...Object.values(scores));

  const tiedTypes = PRIORITY_ORDER.filter(
    (skinType) => scores[skinType] === maxScore
  );

  // tiedTypes is already ordered by priority, so the first element wins
  return tiedTypes[0] ?? "normal";
}
