"use client";

import React, { useCallback } from "react";
import { useSearchParams } from "next/navigation";
import DocxViewer from "@/components/common/DocxViewer";
import { uploadFileService } from "@/services/file.service";

export default function DocxDocViewerPage() {
  const params = useSearchParams();
  const src = params!.get("src");
  const name =
    params!.get("name") || params!.get("displayName") || "document.docx";
  const typeBase = params!.get("type"); // e.g. /attachment/download/
  const downloadType = params!.get("downloadType") || "";

  const fetcher = useCallback(async () => {
    if (src) {
      const resp = await fetch(src);
      return await resp.blob();
    }
    if (typeBase && name) {
      // Dùng SDK lấy blob (timeout 0 cho file lớn)
      const blob = await uploadFileService.getValidatedFile(
        name,
        `${typeBase}`
      );
      return blob as Blob;
    }
    throw new Error("Thiếu tham số nguồn tài liệu");
  }, [src, typeBase, name]);

  const onDownload = useCallback(() => {
    if (!name) return;
    // If we have direct src blob, just open link (browser save) as fallback
    if (src) {
      window.open(src, "_blank");
      return;
    }
    void uploadFileService.downloadFile(name, downloadType || "");
  }, [name, src, downloadType]);

  return (
    <DocxViewer
      name={name || undefined}
      src={src || undefined}
      fetcher={fetcher}
      onDownload={onDownload}
    />
  );
}
