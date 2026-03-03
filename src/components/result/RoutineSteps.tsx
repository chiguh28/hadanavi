"use client";

import type { StepRecommendation } from "@/types/skincare";
import ProductCard from "./ProductCard";

interface RoutineStepsProps {
  steps: StepRecommendation[];
  title: string;
}

export default function RoutineSteps({ steps, title }: RoutineStepsProps) {
  return (
    <section>
      <h3 className="mb-6 text-xl font-bold text-foreground">{title}</h3>
      <div className="space-y-8">
        {steps.map((step) => (
          <div key={step.step}>
            {/* Step header */}
            <div className="mb-3 flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                {step.step_order}
              </span>
              <h4 className="text-lg font-bold text-foreground">
                {step.step_label}
              </h4>
            </div>

            {/* Fallback note */}
            {step.fallback_applied && step.fallback_note && (
              <div className="mb-3 rounded-lg bg-warning/10 p-3">
                <p className="text-sm text-warning">{step.fallback_note}</p>
              </div>
            )}

            {/* Product cards */}
            {step.products.length > 0 ? (
              <div className="space-y-4 pl-4 md:pl-11">
                {step.products.map((product) => (
                  <ProductCard key={product.name} product={product} />
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-border p-4 pl-4 text-center md:ml-11">
                <p className="text-sm text-text-sub">
                  このステップに該当する商品が見つかりませんでした
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
