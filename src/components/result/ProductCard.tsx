"use client";

import type { Product } from "@/types/product";
import Card from "@/components/common/Card";
import { trackEvent } from "@/lib/analytics/events";

interface ProductCardProps {
  product: Product;
  /** Routine step name for GA4 tracking (e.g. "toner") */
  step?: string;
  /** Position within the step for GA4 tracking (0-indexed) */
  position?: number;
}

/**
 * Format a number as Japanese Yen.
 */
function formatPrice(price: number): string {
  return `\u00a5${price.toLocaleString("ja-JP")}`;
}

/**
 * Build affiliate URLs for a product.
 * Amazon uses the pre-built affiliate_urls.amazon if available,
 * otherwise constructs from product name.
 * Rakuten and drugstore map search are always constructed from name.
 */
function getAffiliateLinks(product: Product) {
  const amazonUrl =
    product.affiliate_urls?.amazon ??
    `https://www.amazon.co.jp/s?k=${encodeURIComponent(product.name)}`;

  const rakutenUrl = `https://search.rakuten.co.jp/search/mall/${encodeURIComponent(product.name)}/`;

  const drugstoreUrl = `https://www.google.com/maps/search/${encodeURIComponent(
    "\u30C9\u30E9\u30C3\u30B0\u30B9\u30C8\u30A2 " + product.name
  )}/`;

  return { amazonUrl, rakutenUrl, drugstoreUrl };
}

export default function ProductCard({ product, step = "", position = 0 }: ProductCardProps) {
  const { amazonUrl, rakutenUrl, drugstoreUrl } = getAffiliateLinks(product);

  return (
    <Card
      className="border border-border"
      onClick={() => {
        trackEvent({
          name: "product_click",
          params: {
            product_id: product.product_id,
            step,
            position,
          },
        });
      }}
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-xs text-text-sub">{product.brand}</p>
          <h4 className="text-sm font-bold leading-tight text-foreground md:text-base">
            {product.name}
          </h4>
        </div>
        <p className="shrink-0 text-lg font-bold text-primary">
          {formatPrice(product.price)}
        </p>
      </div>

      {/* Key point */}
      <p className="mb-3 text-sm text-text-sub">{product.key_point}</p>

      {/* Badges */}
      <div className="mb-3 flex flex-wrap gap-2">
        {product.evidence_level === "quasi_drug" && (
          <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
            医薬部外品
          </span>
        )}
        {product.evidence_level === "cosmetic" && (
          <span className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600">
            一般化粧品
          </span>
        )}
        {product.sensitivity_safe && (
          <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
            敏感肌OK
          </span>
        )}
      </div>

      {/* Concentration note warning */}
      {product.concentration_note && (
        <div className="mb-3 rounded-lg bg-warning/10 p-2.5">
          <p className="text-xs text-warning">
            {product.concentration_note}
          </p>
        </div>
      )}

      {/* Affiliate buttons */}
      <div className="flex flex-wrap gap-2">
        <a
          href={amazonUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-full bg-[#FF9900] px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
          onClick={() => {
            trackEvent({
              name: "affiliate_click",
              params: {
                product_id: product.product_id,
                asp_name: "amazon",
                price: product.price,
              },
            });
          }}
        >
          Amazon
        </a>
        <a
          href={rakutenUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-full bg-[#BF0000] px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
          onClick={() => {
            trackEvent({
              name: "affiliate_click",
              params: {
                product_id: product.product_id,
                asp_name: "rakuten",
                price: product.price,
              },
            });
          }}
        >
          楽天
        </a>
        <a
          href={drugstoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center rounded-full bg-secondary px-3 py-1.5 text-xs font-medium text-white transition-opacity hover:opacity-90"
          onClick={() => {
            trackEvent({
              name: "drugstore_click",
              params: { product_id: product.product_id },
            });
          }}
        >
          近くのドラッグストア
        </a>
      </div>
    </Card>
  );
}
