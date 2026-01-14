"use client";
import React, { useMemo } from "react";

import { usePathname } from "next/navigation";
import { AuthLayout } from "~/components/layouts/authLayout";
import { ELocale } from "~/definitions";
import useLoadingStore from "~/stores/loading.store";
import Header from "~/components/dashboard/header";
import SideBar from "@/components/dashboard/SideBar";
import { useSidebarStore } from "~/stores/sideBar.store";
import { Toaster } from "@/components/ui/toaster";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import Footer from "@/components/common/Footer";
import ChatButton from "@/components/common/ChatButton";

interface ILayoutProps {
  locale: ELocale;
  children: React.ReactNode;
}

export default function RootLayoutWrapper({ children }: ILayoutProps) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith("/login");
  const isViewerPage = pathname?.startsWith("/viewer/");
  const isLoading = useLoadingStore((state) => state.isLoading);
  const { isCollapsed } = useSidebarStore();

  const [isInitializing, setInitializing] = React.useState(true);

  React.useEffect(() => {
    setInitializing(false);
  }, []);

  const layoutContent = useMemo(() => {
    if (isAuthPage) {
      return <AuthLayout>{children}</AuthLayout>;
    }

    if (isViewerPage) {
      return (
        <>
          <Toaster />
          <div className="min-h-screen">{children}</div>
        </>
      );
    }

    // Show loader if initializing OR global loading is active
    if (isInitializing || isLoading) {
      return (
        <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
          <div className="flex flex-col items-center gap-4">
            <Spinner variant="ring" size={48} className="text-blue-600" />
            <p className="text-gray-600 text-sm">Đang tải dữ liệu...</p>
          </div>
        </div>
      );
    }

    return (
      <>
        <Toaster />
        <div
          className="fixed inset-x-0 top-0 h-[96px] z-40"
          style={{
            background:
              "linear-gradient(90deg, #E8F1FC 0%, #D7EAFB 40%, #C5E1FF 70%, #B3DAFF 100%)",
            boxShadow: "0 8px 16px -8px rgba(0,0,0,0.25)",
          }}
        >
          <Header />
        </div>

        <SideBar />

        <main
          className={`overflow-y-auto transition-all duration-300 mt-[130px] ${
            isCollapsed ? "ml-16" : "ml-64"
          }`}
          style={{ height: "calc(100vh - 130px)" }}
        >
          <div className="flex-1">{children}</div>
          <ChatButton />
          <Footer />
        </main>

        {/* {(isInitializing || isLoading) && (
          <div className="fixed inset-0 flex items-center justify-center bg-gray-400 bg-opacity-50 z-[9999]">
            <div className="flex flex-col items-center gap-4">
              <Spinner variant="ring" size={80} className="text-blue-600" />
            </div>
          </div>
        )} */}
      </>
    );
  }, [
    isAuthPage,
    isViewerPage,
    isLoading,
    isInitializing,
    children,
    isCollapsed,
  ]);

  return <div>{layoutContent}</div>;
}
