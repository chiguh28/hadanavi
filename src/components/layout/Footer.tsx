import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border bg-bg-card px-4 py-8">
      <div className="mx-auto max-w-5xl text-center text-sm text-text-sub">
        <p className="mb-2">
          ※当サイトは医療アドバイスを提供するものではありません
        </p>
        <p className="mb-4">
          ※肌に合わない場合は使用を中止し、皮膚科を受診してください
        </p>
        <div className="mb-4 flex items-center justify-center gap-4">
          <Link
            href="#"
            className="text-text-sub underline transition-colors hover:text-primary"
          >
            利用規約
          </Link>
          <span className="text-border">|</span>
          <Link
            href="#"
            className="text-text-sub underline transition-colors hover:text-primary"
          >
            免責事項
          </Link>
        </div>
        <p>&copy; 2026 肌ナビ</p>
      </div>
    </footer>
  );
}
