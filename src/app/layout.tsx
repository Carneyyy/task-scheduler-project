import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "爬虫任务管理系统",
  description: "实时监控和管理您的爬虫任务",
  keywords: ["爬虫", "任务管理", "监控系统", "自动化"],
  authors: [{ name: "Development Team" }],
  openGraph: {
    title: "爬虫任务管理系统",
    description: "实时监控和管理您的爬虫任务",
    url: "https://yoursite.com",
    siteName: "爬虫管理系统",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "爬虫任务管理系统",
    description: "实时监控和管理您的爬虫任务",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
