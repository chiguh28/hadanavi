"use client";

import { useState, useCallback } from "react";
import type { SkinType } from "@/types/diagnosis";

const SKIN_TYPE_NAMES: Record<SkinType, string> = {
  dry: "乾燥肌",
  oily: "脂性肌",
  combination: "混合肌",
  sensitive: "敏感肌",
  normal: "普通肌",
};

interface ShareButtonProps {
  skinType: SkinType;
  concerns: string[];
  budget: string;
}

export default function ShareButton({
  skinType,
  concerns,
  budget,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const skinTypeName = SKIN_TYPE_NAMES[skinType];

  const getShareUrl = useCallback(() => {
    const base = "https://hadanavi.vercel.app/shindan/result";
    const params = new URLSearchParams();
    params.set("type", skinType);
    if (concerns.length > 0) {
      params.set("concerns", concerns.join(","));
    }
    if (budget) {
      params.set("budget", budget);
    }
    return `${base}?${params.toString()}`;
  }, [skinType, concerns, budget]);

  const shareText = `私の肌タイプは${skinTypeName}！肌ナビで無料診断してみてね`;

  const handleShareX = useCallback(() => {
    const url = getShareUrl();
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(url)}`;
    window.open(twitterUrl, "_blank", "noopener,noreferrer");
  }, [getShareUrl, shareText]);

  const handleShareLine = useCallback(() => {
    const url = getShareUrl();
    const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodeURIComponent(url)}&text=${encodeURIComponent(shareText)}`;
    window.open(lineUrl, "_blank", "noopener,noreferrer");
  }, [getShareUrl, shareText]);

  const handleCopyLink = useCallback(async () => {
    const url = getShareUrl();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = url;
      textArea.style.position = "fixed";
      textArea.style.left = "-9999px";
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [getShareUrl]);

  return (
    <div className="space-y-3">
      <p className="text-center text-sm font-medium text-text-sub">
        結果をシェアする
      </p>
      <div className="flex items-center justify-center gap-3">
        {/* X (Twitter) */}
        <button
          onClick={handleShareX}
          className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80"
          aria-label="Xでシェア"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          X
        </button>

        {/* LINE */}
        <button
          onClick={handleShareLine}
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-80"
          style={{ backgroundColor: "#06C755" }}
          aria-label="LINEでシェア"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
          >
            <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314" />
          </svg>
          LINE
        </button>

        {/* Copy link */}
        <button
          onClick={handleCopyLink}
          className="relative inline-flex items-center gap-2 rounded-full border-2 border-border bg-white px-5 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-gray-50"
          aria-label="リンクをコピー"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
          </svg>
          {copied ? "コピーしました！" : "リンクをコピー"}
        </button>
      </div>

      {/* Toast notification */}
      {copied && (
        <div className="flex justify-center">
          <span className="inline-block rounded-full bg-success px-4 py-1.5 text-xs font-medium text-white">
            リンクをクリップボードにコピーしました
          </span>
        </div>
      )}
    </div>
  );
}
