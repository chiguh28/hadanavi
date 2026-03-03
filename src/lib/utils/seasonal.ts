import type { Season, SeasonalAdvice } from "@/types/skincare";

/**
 * Map of season to its seasonal advice data.
 */
const SEASONAL_ADVICE_MAP: Record<Season, SeasonalAdvice> = {
  spring: {
    season: "spring",
    concerns: ["花粉肌荒れ", "紫外線量の増加", "寒暖差によるゆらぎ"],
    ingredients: ["セラミド", "CICA"],
  },
  summer: {
    season: "summer",
    concerns: ["テカリ/UV", "皮脂増加", "エアコンによる乾燥"],
    ingredients: ["ビタミンC", "ナイアシンアミド"],
  },
  autumn: {
    season: "autumn",
    concerns: ["夏ダメージ回復", "乾燥の始まり", "ターンオーバーの乱れ"],
    ingredients: ["レチノール", "セラミド"],
  },
  winter: {
    season: "winter",
    concerns: ["乾燥・バリア低下", "血行不良によるくすみ"],
    ingredients: ["セラミド", "スクワラン"],
  },
};

/**
 * Determine the season from a month number (1-12).
 *
 * - Spring: 3-5
 * - Summer: 6-8
 * - Autumn: 9-11
 * - Winter: 12, 1, 2
 */
export function getSeasonFromMonth(month: number): Season {
  if (month >= 3 && month <= 5) return "spring";
  if (month >= 6 && month <= 8) return "summer";
  if (month >= 9 && month <= 11) return "autumn";
  return "winter"; // 12, 1, 2
}

/**
 * Get seasonal skincare advice based on the current month.
 *
 * @param month - Month number (1-12). Defaults to the current month.
 * @returns SeasonalAdvice with season, concerns, and recommended ingredients
 */
export function getSeasonalAdvice(month?: number): SeasonalAdvice {
  const m = month ?? new Date().getMonth() + 1;
  const season = getSeasonFromMonth(m);
  return SEASONAL_ADVICE_MAP[season];
}
