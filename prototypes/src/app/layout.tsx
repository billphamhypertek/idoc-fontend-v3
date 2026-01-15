import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "../styles/tokens.css";
import { ThemeProvider } from "@/lib/theme-context";

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Hệ thống Quản lý văn bản và Điều hành tác nghiệp",
  description: "Ban Cơ yếu Chính phủ - Prototype Dashboard v3",
  icons: {
    icon: "/favicon.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <body className={`${inter.variable} font-sans antialiased bg-[hsl(var(--v3-background))]`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
