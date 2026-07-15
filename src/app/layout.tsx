import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "웨드페이퍼 — 모바일 청첩장",
    template: "%s | 웨드페이퍼",
  },
  description: "우리 둘의 이야기를 담은 모바일 청첩장을 만들어보세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  );
}
