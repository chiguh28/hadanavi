"use client";

import type { SkinType, SkinTypeInfo } from "@/types/diagnosis";
import Card from "@/components/common/Card";
import ShareButton from "@/components/result/ShareButton";
import skinTypesData from "@/data/skin-types.json";

const SKIN_TYPE_COLORS: Record<SkinType, { bg: string; border: string; badge: string }> = {
  dry: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-blue-100 text-blue-700",
  },
  oily: {
    bg: "bg-yellow-50",
    border: "border-yellow-200",
    badge: "bg-yellow-100 text-yellow-700",
  },
  combination: {
    bg: "bg-green-50",
    border: "border-green-200",
    badge: "bg-green-100 text-green-700",
  },
  sensitive: {
    bg: "bg-red-50",
    border: "border-red-200",
    badge: "bg-red-100 text-red-700",
  },
  normal: {
    bg: "bg-purple-50",
    border: "border-purple-200",
    badge: "bg-purple-100 text-purple-700",
  },
};

interface SkinTypeResultProps {
  skinType: SkinType;
  concerns?: string[];
  budget?: string;
}

export default function SkinTypeResult({ skinType, concerns = [], budget = "" }: SkinTypeResultProps) {
  const skinTypeInfo = (skinTypesData as SkinTypeInfo[]).find(
    (s) => s.id === skinType
  );

  if (!skinTypeInfo) {
    return null;
  }

  const colors = SKIN_TYPE_COLORS[skinType];

  return (
    <Card className={`${colors.bg} border ${colors.border} text-center`}>
      <p className="mb-2 text-sm font-medium text-text-sub">
        あなたの肌タイプは…
      </p>
      <h2 className="mb-3 text-3xl font-bold text-foreground md:text-4xl">
        {skinTypeInfo.name}
      </h2>
      <span
        className={`mb-4 inline-block rounded-full px-4 py-1 text-sm font-medium ${colors.badge}`}
      >
        {skinType.toUpperCase()} TYPE
      </span>
      <p className="mb-6 text-text-sub">{skinTypeInfo.description}</p>

      {/* Characteristics */}
      <div className="mb-6 text-left">
        <h3 className="mb-2 text-sm font-bold text-foreground">特徴</h3>
        <ul className="space-y-1">
          {skinTypeInfo.characteristics.map((c) => (
            <li
              key={c}
              className="flex items-start gap-2 text-sm text-text-sub"
            >
              <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              {c}
            </li>
          ))}
        </ul>
      </div>

      {/* Care tips */}
      <div className="mb-6 text-left">
        <h3 className="mb-2 text-sm font-bold text-foreground">
          ケアのポイント
        </h3>
        <ul className="space-y-1">
          {skinTypeInfo.care_tips.map((tip) => (
            <li
              key={tip}
              className="flex items-start gap-2 text-sm text-text-sub"
            >
              <span className="mt-1 block h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
              {tip}
            </li>
          ))}
        </ul>
      </div>

      {/* Share buttons */}
      <ShareButton skinType={skinType} concerns={concerns} budget={budget} />
    </Card>
  );
}
