export type SkinType = "dry" | "oily" | "combination" | "sensitive" | "normal";

export type ConcernId =
  | "dryness"
  | "pores"
  | "acne"
  | "dullness"
  | "spots"
  | "aging"
  | "redness"
  | "oiliness";

export type BudgetId =
  | "under_1000"
  | "under_3000"
  | "under_5000"
  | "no_limit";

export interface QuestionOption {
  label: string;
  scores: Record<SkinType, number>;
}

export interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
}

export interface Budget {
  id: BudgetId;
  label: string;
  max_price: number | null;
  description: string;
  routine_type: "minimal" | "standard" | "full";
}

export interface Concern {
  id: ConcernId;
  name: string;
  description: string;
  serum_count: number;
  safe_count: number;
  recommended_ingredients: string[];
  sensitive_alternatives?: string[];
}

export interface SkinTypeInfo {
  id: SkinType;
  name: string;
  description: string;
  characteristics: string[];
  care_tips: string[];
}
