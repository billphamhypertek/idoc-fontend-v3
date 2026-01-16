import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import "../styles/tokens.css";
import { ThemeProvider } from "@/lib/theme-context";

const manrope = Manrope({
  subsets: ["latin", "vietnamese"],
  variable: "--font-manrope",
  weight: ["400", "500", "600", "700"],
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
    <html lang="vi" suppressHydrationWarning>
      <body className={`${manrope.variable} antialiased bg-[hsl(var(--v3-background))]`}>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
