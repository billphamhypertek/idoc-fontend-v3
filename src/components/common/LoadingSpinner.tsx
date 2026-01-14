"use client";

import React from "react";

interface LoadingSpinnerProps {
  size?: "small" | "default" | "large";
  tip?: string;
  className?: string;
}

export default function LoadingSpinner({
  size = "default",
  tip = "Loading...",
  className = "",
}: LoadingSpinnerProps) {
  return (
    <div
      className={`flex justify-center items-center min-h-[200px] ${className}`}
    >
      <div
        className={`animate-spin rounded-full border-4 border-t-4 border-gray-200 ${size === "small" ? "h-4 w-4" : size === "large" ? "h-9 w-8" : "h-6 w-6"}`}
      />
      <span className="ml-2">{tip}</span>
    </div>
  );
}
