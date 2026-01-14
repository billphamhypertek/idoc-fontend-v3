"use client";
import React, { useEffect, useMemo, useRef, useState, memo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { Constant } from "@/definitions/constants/constant";
import { FileService } from "@/services/file.service";
import { getExtension } from "@/utils/common.utils";
import dynamic from "next/dynamic";
import DocxViewer from "@/components/common/DocxViewer";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import { usePdfStore } from "@/stores/pdf.store";
import { useFetchViewFile } from "@/hooks/useFetchViewFile";

const PDFViewerClient = dynamic(
  async () => {
    const { Worker, Viewer } = await import("@react-pdf-viewer/core");
    const { defaultLayoutPlugin } = await import(
      "@react-pdf-viewer/default-layout"
    );

    const PDFViewerClient = ({ fileUrl }: { fileUrl: string }) => {
      const pluginInstance = defaultLayoutPlugin();
      return (
        <Worker workerUrl={"/v3/pdf.worker.min.js"}>
          <Viewer fileUrl={fileUrl} plugins={[pluginInstance]} />
        </Worker>
      );
    };

    return PDFViewerClient;
  },
  { ssr: false }
);

interface DocumentViewerProps {
  files: any;
  documentTitle?: string;
  selectedFile?: any;
  handleDownloadFile?: (file: any) => Promise<void>;
  noHeader?: boolean;
  onFileChange?: (fileId: number) => void;
  fileType: string;
}

function DocumentViewer({
  files,
  documentTitle,
  selectedFile,
  handleDownloadFile,
  noHeader = false,
  fileType,
}: DocumentViewerProps) {
  const { pdf } = usePdfStore();
  const fileList = Array.isArray(files) ? files : [files];
  const currentFileId = selectedFile?.id || fileList[0]?.id;
  const currentFile =
    fileList.find((f) => f.id === currentFileId) || fileList[0];

  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const objectUrlRef = useRef<string | null>(null);

  const ext = useMemo(
    () => getExtension(currentFile?.name || "") || "",
    [currentFile?.name]
  );
  const isPdf = ext === "pdf";
  const isDocx = ext === "docx";

  // Prepare fetch parameters
  const idOrName = useMemo(() => {
    if (!currentFile) return "";
    return fileType === Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_INTERNAL ||
      fileType === Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_VEHICLE
      ? String(currentFile.id)
      : String(currentFile.name);
  }, [currentFile, fileType]);

  const baseUrl = useMemo(
    () => FileService.getDownloadFileUrl(fileType),
    [fileType]
  );

  // Use hook for non-encrypted PDFs
  const shouldFetchPdf = isPdf && currentFile && !currentFile.encrypt;
  const {
    blob: pdfBlob,
    loading: pdfLoading,
    error: pdfError,
  } = useFetchViewFile({
    url: baseUrl,
    idOrName,
    enabled: shouldFetchPdf,
  });

  // Use hook for DOCX files
  const shouldFetchDocx = isDocx && currentFile;
  const {
    blob: docxBlob,
    loading: docxLoading,
    error: docxError,
  } = useFetchViewFile({
    url: baseUrl,
    idOrName,
    enabled: shouldFetchDocx,
  });

  // Handle encrypted PDFs separately
  useEffect(() => {
    if (!currentFile) return;

    if (isPdf && currentFile.encrypt) {
      if (pdf == null) {
        setError("Fetch PDF failed");
        return;
      }

      const blob = new Blob([pdf], { type: "application/pdf" });
      const nextUrl = URL.createObjectURL(blob);

      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = nextUrl;
      setPdfUrl(nextUrl);
    }
  }, [currentFile, isPdf, pdf]);

  // Convert blob to URL for non-encrypted PDFs
  useEffect(() => {
    if (pdfBlob && !currentFile?.encrypt) {
      const nextUrl = URL.createObjectURL(pdfBlob);

      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = nextUrl;
      setPdfUrl(nextUrl);
    }
  }, [pdfBlob, currentFile?.encrypt]);

  // Handle errors from hooks
  useEffect(() => {
    if (pdfError) {
      setError("Không thể tải tệp PDF");
    } else if (docxError) {
      setError("Không thể tải tệp DOCX");
    } else {
      setError(null);
    }
  }, [pdfError, docxError]);

  // Reset error when file changes
  useEffect(() => {
    if (currentFile) setError(null);
  }, [currentFileId, currentFile]);

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    };
  }, []);

  // Error state
  if (error) {
    return (
      <Card
        className={
          noHeader
            ? "border-none shadow-none mt-3"
            : "shadow-sm border-gray-200 mt-3"
        }
      >
        {!noHeader && (
          <CardHeader className="p-3">
            <CardTitle className="text-lg">
              {documentTitle || "Chi tiết tệp văn bản"}
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className="p-4">
          <p className="text-red-600">{error}</p>
        </CardContent>
      </Card>
    );
  }

  // PDF Loading state
  if (isPdf && pdfLoading) {
    return (
      <Card className="mt-3">
        <CardContent className="p-8 text-center">
          <div className="flex flex-col items-center gap-4">
            <Spinner variant="ring" size={48} className="text-blue-600" />
            <p className="text-gray-600 text-sm">Đang tải PDF...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render PDF
  if (isPdf && pdfUrl) {
    return (
      <Card className="mt-3">
        {!noHeader && (
          <CardHeader>
            <CardTitle>
              {documentTitle || currentFile?.displayName || currentFile?.name}
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className="p-0">
          <div style={{ height: "100vh" }}>
            <PDFViewerClient fileUrl={pdfUrl} />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render DOCX
  if (isDocx && currentFile) {
    return (
      <Card className="mt-3">
        {!noHeader && (
          <CardHeader>
            <CardTitle>
              {documentTitle || currentFile?.displayName || currentFile?.name}
            </CardTitle>
          </CardHeader>
        )}
        <CardContent className="p-0">
          <div className="h-[1000px]">
            <DocxViewer
              name={currentFile?.displayName || currentFile?.name}
              blob={docxBlob || undefined}
              onDownload={async () => {
                if (typeof handleDownloadFile === "function") {
                  await handleDownloadFile(currentFile);
                }
              }}
            />
          </div>
        </CardContent>
      </Card>
    );
  }

  return null;
}

function areEqual(prev: DocumentViewerProps, next: DocumentViewerProps) {
  const prevSelectedId =
    prev.selectedFile?.id ??
    (Array.isArray(prev.files) ? prev.files[0]?.id : (prev.files as any)?.id);
  const nextSelectedId =
    next.selectedFile?.id ??
    (Array.isArray(next.files) ? next.files[0]?.id : (next.files as any)?.id);

  if (prevSelectedId !== nextSelectedId) return false;
  if (prev.fileType !== next.fileType) return false;
  if (prev.noHeader !== next.noHeader) return false;

  const prevIds = Array.isArray(prev.files)
    ? prev.files.map((f: any) => f.id).join(",")
    : String(prevSelectedId ?? "");
  const nextIds = Array.isArray(next.files)
    ? next.files.map((f: any) => f.id).join(",")
    : String(nextSelectedId ?? "");
  if (prevIds !== nextIds) return false;

  return true;
}

export default memo(DocumentViewer, areEqual);
