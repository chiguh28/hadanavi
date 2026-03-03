import { ImageResponse } from "@vercel/og";
import type { NextRequest } from "next/server";
import type { SkinType } from "@/types/diagnosis";

export const runtime = "edge";

const SKIN_TYPE_NAMES: Record<SkinType, string> = {
  dry: "乾燥肌",
  oily: "脂性肌",
  combination: "混合肌",
  sensitive: "敏感肌",
  normal: "普通肌",
};

const VALID_SKIN_TYPES: SkinType[] = [
  "dry",
  "oily",
  "combination",
  "sensitive",
  "normal",
];

function isValidSkinType(v: string): v is SkinType {
  return (VALID_SKIN_TYPES as string[]).includes(v);
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const typeParam = searchParams.get("type") ?? "";

  const skinType: SkinType = isValidSkinType(typeParam) ? typeParam : "normal";
  const skinTypeName = SKIN_TYPE_NAMES[skinType];

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #E8907E 0%, #F5B0A0 50%, #F2C4D0 100%)",
          fontFamily: "sans-serif",
        }}
      >
        {/* Logo text */}
        <div
          style={{
            display: "flex",
            fontSize: 48,
            fontWeight: 700,
            color: "#FFFFFF",
            marginBottom: 24,
            textShadow: "0 2px 8px rgba(0,0,0,0.15)",
          }}
        >
          肌ナビ
        </div>

        {/* Card */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            borderRadius: 24,
            padding: "48px 80px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
          }}
        >
          {/* Label */}
          <div
            style={{
              display: "flex",
              fontSize: 28,
              color: "#666666",
              marginBottom: 16,
            }}
          >
            私の肌タイプは
          </div>

          {/* Skin type name */}
          <div
            style={{
              display: "flex",
              fontSize: 72,
              fontWeight: 700,
              color: "#E8907E",
              marginBottom: 20,
            }}
          >
            {skinTypeName}
          </div>

          {/* Tagline */}
          <div
            style={{
              display: "flex",
              fontSize: 24,
              color: "#999999",
            }}
          >
            おすすめルーティンを見てみて！
          </div>
        </div>

        {/* URL at bottom */}
        <div
          style={{
            display: "flex",
            fontSize: 22,
            color: "rgba(255, 255, 255, 0.85)",
            marginTop: 32,
          }}
        >
          hadanavi.vercel.app
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      headers: {
        "Cache-Control": "public, max-age=86400",
      },
    }
  );
}
