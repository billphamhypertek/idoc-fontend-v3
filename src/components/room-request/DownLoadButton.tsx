"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import attachmentDynamicService from "@/services/attachment-dynamic.service";
import { saveFile } from "@/utils/common.utils";
import { ToastUtils } from "@/utils/toast.utils";

interface DownloadButtonProps {
  fileName: string;
  className?: string;
  variant?:
    | "default"
    | "outline"
    | "ghost"
    | "link"
    | "destructive"
    | "secondary";
  size?: "default" | "sm" | "lg" | "icon";
  showIcon?: boolean;
  children?: React.ReactNode;
}

export const DownloadButton: React.FC<DownloadButtonProps> = ({
  fileName,
  className = "",
  variant = "outline",
  size = "sm",
  showIcon = true,
  children,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!fileName) {
      ToastUtils.error("Tên file không hợp lệ");
      return;
    }

    try {
      setIsDownloading(true);
      const blob = await attachmentDynamicService.downloadAttachment(fileName);
      saveFile(fileName, blob);
      ToastUtils.success("Tải file thành công");
    } catch (error) {
      console.error("Error downloading file:", error);
      ToastUtils.error("Không thể tải file");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Button
      variant={variant}
      size={size}
      className={`flex items-center gap-1 ${className}`}
      onClick={handleDownload}
      disabled={isDownloading}
    >
      {showIcon && <Download className="w-4 h-4" />}
      {children || (isDownloading ? "Đang tải..." : "Tải xuống")}
    </Button>
  );
};
