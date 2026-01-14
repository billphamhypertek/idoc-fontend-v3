"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ChevronDown, ChevronRight, Paperclip } from "lucide-react";
import AttachedFiles from "@/components/document-out/AttachedFiles";
import LoadingDownloadVb from "@/components/document-out/LoadingDownloadVb";
import { Constant } from "@/definitions/constants/constant";
import type { Attachment } from "@/components/document-out/types";
import dynamic from "next/dynamic";
const DocumentViewer = dynamic(
  () => import("@/components/common/DocumentViewer"),
  {
    ssr: false,
  }
);

export interface AttachmentsCardProps {
  title?: string;
  files: Attachment[];
  selectedFile?: Attachment | undefined;
  encryptShowing: boolean;
  isDownloading: boolean;
  downloadName: string;
  viewContent: boolean;
  onView: (file: Attachment, isView?: boolean, isDownload?: boolean) => void;
  onDownload: (file: Attachment) => Promise<void>;
  onShare: (file: Attachment) => void;
  onVerifyPDF: (fileName: string) => void | Promise<void>;
  onSignEncrypt: (
    fileName: string,
    encrypt: boolean,
    fileId: string
  ) => void | Promise<void>;
}

const AttachmentsCard: React.FC<AttachmentsCardProps> = ({
  title = "Tệp chứa nội dung toàn văn bản",
  files,
  selectedFile,
  encryptShowing,
  isDownloading,
  downloadName,
  viewContent,
  onView,
  onDownload,
  onShare,
  onVerifyPDF,
  onSignEncrypt,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <Card className="shadow-sm">
      <CardHeader
        className="p-4 cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <Paperclip className="w-4 h-4 text-white" />
            </div>
            {title}
          </CardTitle>
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </div>
      </CardHeader>
      {!isCollapsed && viewContent && (
        <CardContent>
          <AttachedFiles
            files={files || []}
            selectedFileId={selectedFile?.id?.toString() || ""}
            onViewFile={(file: any, isView?: boolean, isDownload?: boolean) =>
              onView(file, isView, isDownload)
            }
            onDownloadFile={(file: any) => onDownload(file)}
            onShareFile={(file: any) => onShare(file)}
            onVerifierPDF={(fileName: string) => onVerifyPDF(fileName)}
            onSignFileEncrypt={(
              fileName: string,
              encrypt: boolean,
              fileId: string
            ) => onSignEncrypt(fileName, encrypt, fileId)}
            encryptShowing={encryptShowing}
          />

          {isDownloading && (
            <LoadingDownloadVb
              nameFile={downloadName}
              isdownloadFile={isDownloading}
              isShowLoadingEncrypt={false}
            />
          )}

          {selectedFile?.id && (
            <DocumentViewer
              files={files}
              selectedFile={selectedFile}
              handleDownloadFile={onDownload}
              fileType={Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_OUT}
            />
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default AttachmentsCard;
