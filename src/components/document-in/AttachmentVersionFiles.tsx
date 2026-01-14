import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { isClericalRole } from "@/utils/authentication.utils";
import { getExtension } from "@/utils/common.utils";
import { Download, Eye } from "lucide-react";
import React, { useMemo, useState } from "react";
import { formatDate } from "@/utils/datetime.utils";
import { isView } from "@/utils/file.utils";

interface DocumentFile {
  id: string;
  name: string;
  displayName?: string;
  encrypt: boolean;
  userFullName: string;
  createDate?: string;
}

interface AttachedFilesProps {
  files: any[];
  selectedFileId?: string | null;
  onFileSelect: (file: DocumentFile) => void;
  onViewFile: (
    file: DocumentFile,
    isViewPopup?: boolean,
    isViewEncrypt?: boolean
  ) => void;
  onDownloadFile: (file: DocumentFile) => void;
  encryptShowing: boolean;
  isTruongOrPhoTruongPhong: boolean;
}

export default function AttachmentVersionFiles({
  files,
  selectedFileId,
  onFileSelect,
  onViewFile,
  onDownloadFile,
  encryptShowing,
  isTruongOrPhoTruongPhong,
}: AttachedFilesProps) {
  const [showAllAttachments, setShowAllAttachments] = useState(false);
  const isViewable = (file: DocumentFile) => {
    return checkViewFileStatus(file.name) && !file.encrypt;
  };
  const checkViewFileStatus = (fileName: string) => {
    let extension = getExtension(fileName);
    if (extension) {
      extension = extension.toLowerCase();
    }
    return fileName && extension === "pdf";
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
          onClick={() => onViewFile(file, false, true)}
        >
          {file.displayName || file.name}
          {file.encrypt && (
            <span className="text-red-500 ml-2">(Đã mã hóa)</span>
          )}
        </span>
      ),
    },
    {
      header: "Thời gian cập nhật",
      accessor: (file: DocumentFile, index: number) => (
        <span
          className={`text-blue-600 font-medium cursor-pointer ${
            Number(selectedFileId) === Number(file.id) ? "underline" : ""
          }`}
          onClick={() => onViewFile(file, false, true)}
        >
          {formatDate(file.createDate)}
        </span>
      ),
    },
    {
      header: "Người tạo",
      accessor: (file: DocumentFile, index: number) => (
        <span
          className={`text-blue-600 font-medium cursor-pointer ${
            Number(selectedFileId) === Number(file.id) ? "underline" : ""
          }`}
          onClick={() => onViewFile(file, false, true)}
        >
          {file.userFullName}
        </span>
      ),
    },
    {
      header: (
        <div className="flex justify-center items-center py-1">
          <span className="font-bold">Thao tác</span>
        </div>
      ),
      accessor: (file: DocumentFile, index: number) => (
        <div className="flex items-center justify-center gap-1.5 py-1">
          {isViewable(file) && (
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
          )}

          {((isView(file) && !encryptShowing) ||
            (encryptShowing &&
              (isClericalRole() || isTruongOrPhoTruongPhong))) && (
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
            onRowClick={(item: any) => onFileSelect(item.id)}
            emptyText={"Không có dữ liệu"}
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
