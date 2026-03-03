import type { Product, ProductCategory } from "@/types/product";
import type { SkinType, ConcernId, BudgetId } from "@/types/diagnosis";
import type { FilteredResult } from "@/types/skincare";
import decisionTree from "@/data/decision-tree.json";

// ---------------------------------------------------------------------------
// Types for the raw JSON structure
// ---------------------------------------------------------------------------

interface RawProduct {
  name: string;
  brand: string;
  price: number;
  size?: string;
  type?: string;
  key_point: string;
  ingredients_highlight: string;
  evidence_level: string;
  sensitivity_safe: boolean;
  exclude_skin_types: string[];
  amazon_search?: string;
  ceramide_type?: string;
  concentration_note?: string;
  inci_name?: string;
  active_ingredient?: string;
  origin?: string;
  regulatory_note?: string;
  spf?: string;
  uv_filter_type?: string;
  uv_filter_note?: string;
}

interface BudgetFilter {
  label: string;
  max_per_item: number;
  description: string;
}

// ---------------------------------------------------------------------------
// Helper: map JSON evidence_level strings to Product type values
// ---------------------------------------------------------------------------

function mapEvidenceLevel(raw: string): "cosmetic" | "quasi_drug" {
  if (raw === "医薬部外品") return "quasi_drug";
  return "cosmetic";
}

// ---------------------------------------------------------------------------
// Helper: convert a raw JSON product object to the Product type
// ---------------------------------------------------------------------------

function toProduct(raw: RawProduct, category: ProductCategory): Product {
  return {
    product_id: raw.name, // Use name as identifier since JSON has no product_id
    name: raw.name,
    brand: raw.brand,
    price: raw.price,
    category,
    key_point: raw.key_point,
    sensitivity_safe: raw.sensitivity_safe,
    exclude_skin_types: raw.exclude_skin_types,
    ceramide_type: raw.ceramide_type === "human_type"
      ? "human_type"
      : raw.ceramide_type === "pseudo"
        ? "pseudo"
        : undefined,
    evidence_level: mapEvidenceLevel(raw.evidence_level),
    availability: "current",
    concentration_note: raw.concentration_note,
    price_updated_at: (decisionTree as Record<string, unknown>).updated_at as string,
    affiliate_urls: {
      amazon: raw.amazon_search
        ? `https://www.amazon.co.jp/s?k=${encodeURIComponent(raw.amazon_search)}`
        : undefined,
    },
  };
}

// ---------------------------------------------------------------------------
// Accessors for the JSON data
// ---------------------------------------------------------------------------

const productRecs = (decisionTree as Record<string, unknown>).product_recommendations as Record<
  string,
  Record<string, RawProduct[] | Record<string, RawProduct[]>>
>;

const budgetFilters = (decisionTree as Record<string, unknown>).budget_filters as Record<
  string,
  BudgetFilter
>;

/**
 * Map our internal category names to the JSON keys.
 * The JSON uses "cleansing_evening" while ProductCategory uses "cleansing".
 */
function jsonCategoryKey(category: ProductCategory): string {
  if (category === "cleansing") return "cleansing_evening";
  return category;
}

// ---------------------------------------------------------------------------
// Load raw products from decision-tree.json
// ---------------------------------------------------------------------------

/**
 * Load raw products for a non-serum category by skin type.
 */
function loadRawBySkinType(
  category: ProductCategory,
  skinType: SkinType
): RawProduct[] {
  const key = jsonCategoryKey(category);
  const categoryData = productRecs[key] as Record<string, RawProduct[]> | undefined;
  if (!categoryData) return [];
  return (categoryData[skinType] as RawProduct[]) ?? [];
}

/**
 * Load raw serum products by concern IDs.
 * For sensitive skin with safe_count=0 on a concern, also pull from sensitive_alternatives.
 */
function loadRawSerums(
  concernIds: ConcernId[],
  skinType: SkinType
): RawProduct[] {
  const serumData = productRecs["serum"] as Record<string, unknown> | undefined;
  if (!serumData) return [];

  const allRaw: RawProduct[] = [];

  for (const concernId of concernIds) {
    // Load the main concern products
    const concernProducts = (serumData[concernId] as RawProduct[]) ?? [];
    allRaw.push(...concernProducts);

    // For sensitive skin: also load sensitive_alternatives for this concern
    if (skinType === "sensitive") {
      const alternatives = serumData["sensitive_alternatives"] as
        | Record<string, RawProduct[]>
        | undefined;
      if (alternatives) {
        const safeKey = `${concernId}_safe`;
        const safeProducts = (alternatives[safeKey] as RawProduct[]) ?? [];
        allRaw.push(...safeProducts);
      }
    }
  }

  return allRaw;
}

// ---------------------------------------------------------------------------
// Filtering logic
// ---------------------------------------------------------------------------

/**
 * Apply skin type and sensitivity filters to products.
 */
function applyBaseFilters(
  products: Product[],
  skinType: SkinType
): Product[] {
  return products.filter((p) => {
    // Exclude products that explicitly exclude this skin type
    if (p.exclude_skin_types.includes(skinType)) {
      return false;
    }

    // For sensitive skin: only keep sensitivity_safe products
    if (skinType === "sensitive" && !p.sensitivity_safe) {
      return false;
    }

    return true;
  });
}

/**
 * Apply budget filter and fallback rules.
 *
 * Fallback rules:
 * - Rule 1: If 0 products after budget filter, return cheapest 1 with note
 * - Rule 2: If sensitive + under_1000, relax max_price by 1.5x
 * - Rule 3: Not applied here (handled at engine level for full routine)
 */
function applyBudgetFilter(
  products: Product[],
  budgetId: BudgetId,
  skinType: SkinType
): FilteredResult {
  if (products.length === 0) {
    return { products: [], fallback_applied: false };
  }

  const budgetConfig = budgetFilters[budgetId];
  if (!budgetConfig) {
    // no_limit or unknown budget: return all products
    return { products, fallback_applied: false };
  }

  let maxPrice = budgetConfig.max_per_item;

  // Rule 2: If sensitive + under_1000, relax max_price by 1.5x
  if (skinType === "sensitive" && budgetId === "under_1000") {
    maxPrice = Math.round(maxPrice * 1.5);
  }

  const withinBudget = products.filter((p) => p.price <= maxPrice);

  if (withinBudget.length > 0) {
    return { products: withinBudget, fallback_applied: false };
  }

  // Rule 1: If 0 products after budget filter, return cheapest 1 with note
  const sorted = [...products].sort((a, b) => a.price - b.price);
  return {
    products: [sorted[0]],
    fallback_applied: true,
    fallback_note: "予算を少し超えますが、肌タイプに合った商品をおすすめします",
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Filter products for a given category, skin type, budget, and optionally concerns.
 *
 * @param category - Product category (cleansing, face_wash, toner, serum, moisturizer, sunscreen)
 * @param skinType - The user's diagnosed skin type
 * @param budgetId - The user's selected budget tier
 * @param concernIds - Array of concern IDs (only used for serum category)
 * @returns FilteredResult with filtered products and fallback info
 */
export function filterProducts(
  category: ProductCategory,
  skinType: SkinType,
  budgetId: BudgetId,
  concernIds: ConcernId[] = []
): FilteredResult {
  // 1. Load raw products from JSON
  let rawProducts: RawProduct[];
  if (category === "serum") {
    rawProducts = loadRawSerums(concernIds, skinType);
  } else {
    rawProducts = loadRawBySkinType(category, skinType);
  }

  // 2. Convert to Product type
  const products = rawProducts.map((raw) => toProduct(raw, category));

  // 3. Deduplicate by name (since same product can appear in multiple concerns)
  const seen = new Set<string>();
  const deduplicated = products.filter((p) => {
    if (seen.has(p.name)) return false;
    seen.add(p.name);
    return true;
  });

  // 4. Apply skin type and sensitivity filters
  const filtered = applyBaseFilters(deduplicated, skinType);

  // 5. Apply budget filter with fallback rules
  return applyBudgetFilter(filtered, budgetId, skinType);
}

/**
 * Get the max_per_item price for a budget tier.
 */
export function getBudgetMaxPrice(budgetId: BudgetId): number {
  const config = budgetFilters[budgetId];
  return config?.max_per_item ?? 99999;
}
