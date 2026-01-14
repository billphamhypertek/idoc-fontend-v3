import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Constant } from "@/definitions/constants/constant";
import { isClericalRole } from "@/utils/authentication.utils";
import { checkViewFileStatus } from "@/utils/common.utils";
import {
  CheckIcon,
  ChevronUp,
  Download,
  Eye,
  PencilIcon,
  Share,
} from "lucide-react";
import React, { useMemo, useState } from "react";

interface DocumentFile {
  id: string;
  name: string;
  displayName?: string;
  encrypt: boolean;
  createBy?: string;
}

interface AttachedFilesProps {
  files: any[];
  selectedFileId?: string;
  onViewFile: (
    file: DocumentFile,
    isView?: boolean,
    isDownload?: boolean
  ) => void;
  onDownloadFile: (file: DocumentFile) => void;
  onShareFile: (file: DocumentFile) => void;
  onVerifierPDF: (fileName: string) => void;
  onSignFileEncrypt: (
    fileName: string,
    encrypt: boolean,
    fileId: string
  ) => void;
  encryptShowing: boolean;
}

export default function AttachedFiles({
  files,
  selectedFileId,
  onViewFile,
  onDownloadFile,
  onShareFile,
  onVerifierPDF,
  onSignFileEncrypt,
  encryptShowing,
}: AttachedFilesProps) {
  const [showAllAttachments, setShowAllAttachments] = useState(false);

  const isViewPdfEncrypt = (file: DocumentFile) => {
    return (
      file.name &&
      (file.name.toLowerCase().includes(".pdf") ||
        file.name.toLowerCase().includes(".docx")) &&
      file.encrypt
    );
  };
  const isViewFilePdfOrDocx = (file: DocumentFile) => {
    return (
      file.name &&
      (file.name.toLowerCase().includes(".pdf") ||
        file.name.toLowerCase().includes(".docx")) &&
      !file.encrypt
    );
  };
  const fileColumns = [
    {
      header: "STT",
      accessor: (_: DocumentFile, index: number) => index + 1,
      className: "text-center w-16",
    },
    {
      header: "Tên file",
      accessor: (file: DocumentFile, index: number) => (
        <span
          className={`text-blue-600 font-medium cursor-pointer ${
            Number(selectedFileId) === Number(file.id) ? "underline" : ""
          }`}
          onClick={() => onViewFile(file, true, false)}
        >
          {file.displayName || file.name}
          {file.encrypt && (
            <span className="text-red-500 ml-2">(Đã mã hóa)</span>
          )}
        </span>
      ),
    },
    {
      header: (
        <div className="flex justify-center items-center py-1">
          <span className="text-xs font-medium">Thao tác</span>
        </div>
      ),
      accessor: (file: DocumentFile, index: number) => (
        <div className="flex items-center justify-center gap-1.5 py-1">
          {isViewPdfEncrypt(file) ||
            (isViewFilePdfOrDocx(file) && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 w-8 p-0 hover:bg-gray-100"
                      onClick={() => onViewFile(file)}
                    >
                      <Eye className="w-3.5 h-3.5 text-gray-600" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Xem tệp đính kèm</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          {(!Constant.FIX_LAYOUT_AND_ADD_ATTACH_BUTTON_H05 ||
            (((!isViewPdfEncrypt(file) && !encryptShowing) ||
              (!isViewPdfEncrypt(file) &&
                encryptShowing &&
                isClericalRole())) &&
              Constant.FIX_LAYOUT_AND_ADD_ATTACH_BUTTON_H05)) && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-8 p-0 hover:bg-gray-100"
                    onClick={() => onDownloadFile(file)}
                  >
                    <Download className="w-3.5 h-3.5 text-gray-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Tải tệp đính kèm</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {/* {isVerifierPDF(file) && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-8 p-0 hover:bg-gray-100"
                    onClick={() => onVerifierPDF(file.name)}
                  >
                    <CheckIcon className="w-3.5 h-3.5 text-gray-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Xác thực ký số</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )} */}

          {file.encrypt && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-8 p-0 hover:bg-gray-100"
                    onClick={() => onShareFile(file)}
                  >
                    <Share className="w-3.5 h-3.5 text-gray-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Chia sẻ tệp đính kèm</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {file.encrypt && !Constant.FIX_LAYOUT_AND_ADD_ATTACH_BUTTON_H05 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-9 w-8 p-0 hover:bg-gray-100"
                    onClick={() =>
                      onSignFileEncrypt(file.name, file.encrypt, file.id)
                    }
                  >
                    <PencilIcon className="w-3.5 h-3.5 text-gray-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Ký số file mã hóa</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      ),
      className: "text-center w-40",
    },
  ];

  const displayFiles = useMemo(() => {
    if (!files) return [] as DocumentFile[];
    if (showAllAttachments) return files;
    return files.slice(0, 3);
  }, [files, showAllAttachments]);

  return (
    <Card className="shadow-sm border-gray-200">
      <CardContent className="p-0">
        <div className="overflow-hidden">
          <Table
            columns={fileColumns}
            dataSource={displayFiles}
            showPagination={false}
            sortable={true}
            onRowClick={(item: any) => onViewFile(item, true, false)}
          />
        </div>
        {files && files.length > 3 && (
          <div className="px-3 py-2 text-center text-sm">
            <a
              onClick={() => setShowAllAttachments((v) => !v)}
              className="text-blue-600 cursor-pointer hover:underline"
            >
              {showAllAttachments
                ? "Thu gọn"
                : `Xem thêm ${files.length - 3} tài liệu`}
            </a>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
