import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SpendWiseProvider } from "@/components/providers/spendwise-provider";
import { SiteHeader } from "@/components/site-header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SpendWise",
  description: "Track your expenses, filter by month and category, and see where your money goes.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Context tồn tại khi chuyển trang; mọi component đọc cùng một nguồn dữ liệu. */}
        <SpendWiseProvider>
          {/* Header dùng chung trên mọi trang, đọc phiên đăng nhập từ Context. */}
          <SiteHeader />
          {children}
        </SpendWiseProvider>
      </body>
    </html>
  );
}
