import type { Metadata } from "next";
import { Noto_Sans_JP } from "next/font/google";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import GoogleAnalytics from "@/components/analytics/GoogleAnalytics";
import "./globals.css";

const notoSansJP = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "肌ナビ｜あなたの肌に合うプチプラコスメ、見つかる。",
    template: "%s｜肌ナビ",
  },
  description:
    "肌タイプ診断(5問)・肌悩み選択・予算指定で、最適なプチプラスキンケア商品を提案。ブランド横断×スキンケア手順×商品リンクのセット提案。",
  metadataBase: new URL("https://hadanavi.vercel.app"),
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: "肌ナビ",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJP.variable} antialiased`}>
        <GoogleAnalytics />
        <Header />
        <main className="min-h-screen">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
