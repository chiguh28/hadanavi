import type { ProductCategory } from "@/types/product";
import type { SkinType, ConcernId, BudgetId } from "@/types/diagnosis";
import type { StepRecommendation, RoutineRecommendation } from "@/types/skincare";
import { filterProducts } from "./filter";
import { sortProducts } from "./sort";
import { getSeasonalAdvice } from "@/lib/utils/seasonal";

// ---------------------------------------------------------------------------
// Step definitions
// ---------------------------------------------------------------------------

/**
 * Step labels mapping category to Japanese display name.
 */
const STEP_LABELS: Record<string, string> = {
  cleansing: "クレンジング",
  face_wash: "洗顔",
  toner: "化粧水",
  serum: "美容液",
  moisturizer: "乳液・クリーム",
  sunscreen: "日焼け止め",
};

/**
 * Full routine steps with their categories and display order.
 * Order: cleansing(evening) -> face_wash -> toner -> serum -> moisturizer -> sunscreen
 */
interface StepDefinition {
  category: ProductCategory;
  order: number;
}

const FULL_ROUTINE_STEPS: StepDefinition[] = [
  { category: "cleansing", order: 1 },
  { category: "face_wash", order: 2 },
  { category: "toner", order: 3 },
  { category: "serum", order: 4 },
  { category: "moisturizer", order: 5 },
  { category: "sunscreen", order: 6 },
];

/**
 * Minimal routine: face_wash, toner, moisturizer (3 steps).
 */
const MINIMAL_ROUTINE_CATEGORIES: ProductCategory[] = [
  "face_wash",
  "toner",
  "moisturizer",
];

// ---------------------------------------------------------------------------
// Build a single step recommendation
// ---------------------------------------------------------------------------

function buildStepRecommendation(
  category: ProductCategory,
  order: number,
  skinType: SkinType,
  budgetId: BudgetId,
  concernIds: ConcernId[]
): StepRecommendation {
  const result = filterProducts(category, skinType, budgetId, concernIds);
  const sorted = sortProducts(result.products);

  return {
    step: category,
    step_label: STEP_LABELS[category] ?? category,
    step_order: order,
    products: sorted,
    fallback_applied: result.fallback_applied || undefined,
    fallback_note: result.fallback_note,
  };
}

// ---------------------------------------------------------------------------
// Deduplication across steps
// ---------------------------------------------------------------------------

/**
 * Track seen product names across all steps for global deduplication.
 * Within a single step, deduplication is already handled by filterProducts.
 * Across steps, the same product name in different categories is fine
 * (e.g., a brand might have both a toner and a moisturizer).
 * Deduplication here is within the serum step where products from
 * multiple concerns might overlap.
 *
 * Note: cross-step deduplication is not needed because products in
 * different categories are inherently different items. The deduplication
 * in filterProducts already handles within-category (especially serum) overlap.
 */

// ---------------------------------------------------------------------------
// Fallback Rule 3: If all steps fail, prioritize minimal routine
// ---------------------------------------------------------------------------

/**
 * Check if a routine has any steps with zero products and apply
 * Rule 3 fallback: prioritize minimal routine (3 steps).
 */
function applyMinimalFallback(
  fullSteps: StepRecommendation[],
  skinType: SkinType,
  budgetId: BudgetId,
  concernIds: ConcernId[]
): StepRecommendation[] {
  const hasEmptySteps = fullSteps.some((step) => step.products.length === 0);

  if (!hasEmptySteps) {
    return fullSteps;
  }

  // Filter to just the minimal routine steps (face_wash, toner, moisturizer)
  // and rebuild those if needed
  const minimalSteps = fullSteps.filter((step) =>
    MINIMAL_ROUTINE_CATEGORIES.includes(step.step)
  );

  // If minimal steps all have products, return those
  const allMinimalHaveProducts = minimalSteps.every(
    (step) => step.products.length > 0
  );

  if (allMinimalHaveProducts) {
    return minimalSteps;
  }

  // Rebuild minimal steps with relaxed budget (no_limit)
  return MINIMAL_ROUTINE_CATEGORIES.map((category) => {
    const order = FULL_ROUTINE_STEPS.find((s) => s.category === category)?.order ?? 0;
    const step = buildStepRecommendation(
      category,
      order,
      skinType,
      "no_limit",
      concernIds
    );
    if (step.products.length === 0) {
      // This should be extremely rare; the data covers all skin types
      return step;
    }
    // Mark as fallback if budget was relaxed
    if (budgetId !== "no_limit") {
      return {
        ...step,
        fallback_applied: true,
        fallback_note:
          step.fallback_note ??
          "予算内の商品が見つからなかったため、最小限のルーティンでおすすめします",
      };
    }
    return step;
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Build the full recommendation engine output.
 *
 * @param skinType - Diagnosed skin type
 * @param concerns - Array of selected concern IDs
 * @param budgetId - Selected budget tier
 * @param month - Optional month override for seasonal advice (1-12)
 * @returns RoutineRecommendation with minimal and full routines plus seasonal advice
 */
export function buildRecommendation(
  skinType: SkinType,
  concerns: ConcernId[],
  budgetId: BudgetId,
  month?: number
): RoutineRecommendation {
  // Build full routine (6 steps)
  const fullSteps = FULL_ROUTINE_STEPS.map(({ category, order }) =>
    buildStepRecommendation(category, order, skinType, budgetId, concerns)
  );

  // Build minimal routine (3 steps)
  const minimalSteps = MINIMAL_ROUTINE_CATEGORIES.map((category) => {
    const order =
      FULL_ROUTINE_STEPS.find((s) => s.category === category)?.order ?? 0;
    return buildStepRecommendation(category, order, skinType, budgetId, concerns);
  });

  // Apply Rule 3 fallback for minimal if needed
  const finalMinimal = applyMinimalFallback(
    minimalSteps,
    skinType,
    budgetId,
    concerns
  );

  // Get seasonal advice
  const seasonalAdvice = getSeasonalAdvice(month);

  return {
    minimal: finalMinimal,
    full: fullSteps,
    seasonal_advice: seasonalAdvice,
  };
}
