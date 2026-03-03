/* eslint-disable @typescript-eslint/no-explicit-any */

// ---------------------------------------------------------------------------
// Window interface extension for gtag
// ---------------------------------------------------------------------------

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

// ---------------------------------------------------------------------------
// GA4 event types
// ---------------------------------------------------------------------------

type GA4Event =
  | { name: "shindan_start"; params: { referrer_page: string } }
  | { name: "shindan_q_answer"; params: { question_id: string; answer_label: string } }
  | { name: "shindan_complete"; params: { skin_type: string; concerns: string; budget: string } }
  | { name: "product_click"; params: { product_id: string; step: string; position: number } }
  | { name: "affiliate_click"; params: { product_id: string; asp_name: string; price: number } }
  | { name: "drugstore_click"; params: { product_id: string } }
  | { name: "result_share"; params: { skin_type: string; platform: string } }
  | { name: "full_routine_expand"; params: { skin_type: string; budget: string } };

// ---------------------------------------------------------------------------
// Track a GA4 event
// ---------------------------------------------------------------------------

export function trackEvent(event: GA4Event): void {
  if (typeof window !== "undefined" && window.gtag) {
    window.gtag("event", event.name, event.params);
  }
}
