"use client";

import React, { useEffect, useRef, useState } from "react";
import { renderAsync } from "docx-preview";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type DocxViewerProps = {
  name?: string;
  blob?: Blob;
  src?: string;
  fetcher?: () => Promise<Blob>;
  onDownload?: () => void;
};

export default function DocxViewer({
  name,
  blob,
  src,
  fetcher,
  onDownload,
}: DocxViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setError("");

        let sourceBlob: Blob | null = null;
        if (blob) sourceBlob = blob;
        else if (src) {
          const resp = await fetch(src);
          sourceBlob = await resp.blob();
        } else if (fetcher) {
          sourceBlob = await fetcher();
        }

        if (!mounted) return;
        if (!sourceBlob) throw new Error("Không có dữ liệu tệp để hiển thị");

        const container = containerRef.current!;
        container.innerHTML = "";

        // render DOCX với kích thước thật
        await renderAsync(sourceBlob, container, undefined as any, {
          inWrapper: true,
          ignoreWidth: false,
          ignoreHeight: false,
          breakPages: true,
          className: "docx",
          experimental: true,
          trimXmlDeclaration: true,
        });

        // fix CSS margin lệch & giữ layout gốc
        const style = document.createElement("style");
        style.textContent = `
          .docx-wrapper {
            display: flex;
            justify-content: center;
            padding: 32px 0;
            background: #f1f1f1;
          }

          .docx-wrapper .docx {
            width: 17.8cm !important;
            background: white;
            box-shadow: 0 0 6px rgba(0, 0, 0, 0.1);
            box-sizing: border-box;
            padding: 2.54cm 2.54cm 2.54cm 2.54cm; /* lề chuẩn Word */
            margin: 0 auto;
          }

          .docx-wrapper .docx p,
          .docx-wrapper .docx table,
          .docx-wrapper .docx td {
            margin-inline-start: 0 !important;
            margin-inline-end: 0 !important;
            text-indent: 0 !important;
          }

          .docx-wrapper .docx table {
            table-layout: fixed;
            width: 100% !important;
          }

          .docx-wrapper .docx img {
            max-width: 100% !important;
            height: auto !important;
          }
        `;
        container.appendChild(style);
      } catch (e: any) {
        if (!mounted) return;
        setError(e?.message || "Không thể hiển thị tệp DOCX");
      } finally {
        if (mounted) {
          setLoading(false);
          setProgress(100);
        }
      }
    };

    load();
    return () => {
      mounted = false;
    };
  }, [blob, src, fetcher]);

  return (
    <div className="flex flex-col items-center w-full h-full bg-gray-100 p-4 overflow-hidden">
      {/* Header */}
      <div className="w-full max-w-[900px] flex items-center justify-between mb-3">
        <div
          className="text-sm font-medium text-gray-600 truncate"
          title={name}
        >
          {name || "Xem tài liệu DOCX"}
        </div>
        {onDownload && (
          <Button
            size="sm"
            variant="outline"
            className="text-sm"
            onClick={onDownload}
          >
            Tải xuống
          </Button>
        )}
      </div>

      {/* Viewer container */}
      <div className="relative flex-1 w-full flex items-start justify-center overflow-auto bg-gray-200 rounded-lg border border-gray-300 shadow-inner">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm z-10">
            <div className="text-gray-600 mb-2">Đang tải tài liệu...</div>
            <Progress value={progress} className="w-64" />
          </div>
        )}

        {error && !loading && (
          <div className="absolute inset-0 flex items-center justify-center text-red-500 text-sm z-10">
            {error}
          </div>
        )}

        {/* DOCX Container */}
        <div
          ref={containerRef}
          className="docx-wrapper overflow-auto w-full h-full"
        />
      </div>
    </div>
  );
}
