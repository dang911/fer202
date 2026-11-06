import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ShelfLifeProvider } from "@/components/providers/shelflife-provider";
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
  title: "ShelfLife",
  description: "Keep your reading list, track your progress, and search your personal bookshelf.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Context tồn tại khi chuyển trang; mọi component đọc cùng một nguồn dữ liệu. */}
        <ShelfLifeProvider>
          {/* Header dùng chung trên mọi trang, đọc phiên đăng nhập từ Context. */}
          <SiteHeader />
          {children}
        </ShelfLifeProvider>
      </body>
    </html>
  );
}
