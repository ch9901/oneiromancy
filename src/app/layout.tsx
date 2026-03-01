import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { TopHeader } from "@/components/layout/TopHeader";
import { BottomNav } from "@/components/layout/BottomNav";
import { WriteModal } from "@/components/features/write/WriteModal";

export const metadata: Metadata = {
  title: "DreamLog | 당신의 꿈을 기록하고 해석해 보세요",
  description: "잊기 전 기록하고, 몽냥이와 집단지성으로 해석하는 꿈 관리 플랫폼",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className="antialiased min-h-screen bg-background text-foreground"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          {/* Mobile web container */}
          <div className="mx-auto max-w-md min-h-[100dvh] relative pb-20 shadow-xl overflow-x-hidden bg-background">
            <TopHeader />
            <main className="p-4">{children}</main>
            <BottomNav />
            <WriteModal />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
