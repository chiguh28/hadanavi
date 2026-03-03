import type { Product, ProductCategory } from "./product";
import type { SkinType, ConcernId, BudgetId } from "./diagnosis";

export type Season = "spring" | "summer" | "autumn" | "winter";

export interface SeasonalAdvice {
  season: Season;
  concerns: string[];
  ingredients: string[];
}

export interface FilteredResult {
  products: Product[];
  fallback_applied: boolean;
  fallback_note?: string;
}

export interface StepRecommendation {
  step: ProductCategory;
  step_label: string;
  step_order: number;
  products: Product[];
  fallback_applied?: boolean;
  fallback_note?: string;
}

export interface RoutineRecommendation {
  minimal: StepRecommendation[];
  full: StepRecommendation[];
  seasonal_advice: SeasonalAdvice;
}

export interface DiagnosisResult {
  skin_type: SkinType;
  scores: Record<SkinType, number>;
  concerns: ConcernId[];
  budget: BudgetId;
  recommendations: RoutineRecommendation;
}
