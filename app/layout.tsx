import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import { Toaster } from "sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MC Addon Generator - AI 기반 마인크래프트 에드온 생성기",
  description: "자연어로 설명하면 AI가 마인크래프트 베드락 에디션 에드온을 자동으로 생성합니다. 커스텀 엔티티, 아이템, 블록을 쉽게 만들어보세요.",
  keywords: ["마인크래프트", "minecraft", "addon", "에드온", "bedrock", "베드락", "AI", "generator"],
  authors: [{ name: "MC Addon Generator" }],
  openGraph: {
    title: "MC Addon Generator - AI 기반 마인크래프트 에드온 생성기",
    description: "자연어로 설명하면 AI가 마인크래프트 베드락 에디션 에드온을 자동으로 생성합니다.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
