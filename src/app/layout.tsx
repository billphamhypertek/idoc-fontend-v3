import type { Metadata } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import localFont from "next/font/local";
import { ELocale } from "~/definitions";
import QueryProvider from "~/provider/query-provider";
import AuthProvider from "~/providers/auth-provider";
import ErrorBoundary from "~/components/common/ErrorBoundary";
import "./globals.css";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import RootLayoutWrapper from "~/components/layouts/rootLayoutWrapper";
import Script from "next/script";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Hệ thống Quản lý văn bản và Điều hành tác nghiệp",
  description: "Ban Cơ yếu Chính phủ - Hệ thống quản lý văn bản",
  icons: "/v2/images/dashboard/logo-icon.png",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = (await getLocale()) as ELocale;
  const messages = await getMessages({ locale: "en" });
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Script src="/v2/assets/js/vgcaplugin.js" strategy="afterInteractive" />

        <ErrorBoundary>
          <AuthProvider>
            <QueryProvider>
              <NextIntlClientProvider messages={messages}>
                <RootLayoutWrapper locale={locale}>
                  {children}
                </RootLayoutWrapper>
              </NextIntlClientProvider>
            </QueryProvider>
          </AuthProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
