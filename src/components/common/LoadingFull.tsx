"use client";

import React from "react";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

interface LoadingFullProps {
  isLoading?: boolean;
  opacity?: boolean;
}

export default function LoadingFull({
  isLoading = false,
  opacity = false,
}: LoadingFullProps) {
  if (!isLoading) return null;

  return (
    <div
      className={
        opacity
          ? "fixed inset-0 flex items-center justify-center bg-white z-50"
          : "fixed inset-0 flex items-center justify-center bg-white/70 z-50"
      }
    >
      <div className="flex flex-col items-center gap-4">
        <Spinner variant="ring" size={48} className="text-blue-600" />
        <p className="text-gray-600 text-sm">Đang tải...</p>
      </div>
    </div>
  );
}
