import type { Product } from "@/types/product";

/**
 * Priority sort for recommended products.
 *
 * Sort order:
 * 1. sensitivity_safe = true first
 * 2. Lower price first
 * 3. evidence_level = "quasi_drug" (医薬部外品) before "cosmetic" (一般化粧品)
 *
 * @param products - Array of products to sort
 * @returns New sorted array (does not mutate the input)
 */
export function sortProducts(products: Product[]): Product[] {
  return [...products].sort((a, b) => {
    // 1. sensitivity_safe=true first
    if (a.sensitivity_safe !== b.sensitivity_safe) {
      return a.sensitivity_safe ? -1 : 1;
    }

    // 2. Lower price first
    if (a.price !== b.price) {
      return a.price - b.price;
    }

    // 3. "quasi_drug" (医薬部外品) before "cosmetic" (一般化粧品)
    if (a.evidence_level !== b.evidence_level) {
      return a.evidence_level === "quasi_drug" ? -1 : 1;
    }

    return 0;
  });
}
