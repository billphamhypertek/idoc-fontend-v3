"use client";
import AddLable from "@/components/label/AddLable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MultiSelect } from "@/components/ui/mutil-select";
import { checkViewFileStatus, getExtension } from "@/utils/common.utils";
import { Download, Eye, FileText, Paperclip, PlusIcon } from "lucide-react";
import React, { useState } from "react";

export interface GeneralInfoInternalCardProps {
  detail: any;
  onToggle?: () => void;
  collapse?: boolean;
  dropdownList?: Array<{ id: string | number; name: string }>;
  selectedItems?: Array<{ id: string | number; name: string }>;
  onChangeTags?: (items: Array<{ id: string | number; name: string }>) => void;
  // File attachments
  docFiles?: any[];
  addendumFiles?: any[];
  onViewFile?: (file: any) => void;
  onDownloadFile?: (file: any) => void;
  onShareFile?: (file: any) => void;
  // additional info strings
  textMainChecked?: string;
  textToknowChecked?: string;
}

const GeneralInfoInternalCard: React.FC<GeneralInfoInternalCardProps> = ({
  detail,
  onToggle,
  collapse = true,
  dropdownList = [],
  selectedItems = [],
  onChangeTags,
  docFiles = [],
  addendumFiles = [],
  onViewFile,
  onDownloadFile,
  onShareFile,
  textMainChecked = "",
  textToknowChecked = "",
}) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");

  const render = (label: string, value?: React.ReactNode) => (
    <div className="flex items-start gap-2 my-4">
      <label className="w-[160px] text-sm font-semibold text-gray-800 text-right">
        {label}
      </label>
      <div className="flex-1 text-sm text-gray-900">{value ?? ""}</div>
    </div>
  );

  // Get file icon based on extension
  const getFileIcon = (fileName: string) => {
    const ext = getExtension(fileName)?.toLowerCase() || "";
    const iconMap: Record<string, string> = {
      pdf: "/v2/assets/images/files/PDF.png",
      doc: "/v2/assets/images/files/DOC.png",
      docx: "/v2/assets/images/files/DOC.png",
      xls: "/v2/assets/images/files/Excel.png",
      xlsx: "/v2/assets/images/files/Excel.png",
      png: "/v2/assets/images/files/Image.png",
      jpg: "/v2/assets/images/files/Image.png",
      jpeg: "/v2/assets/images/files/Image.png",
    };
    return iconMap[ext] || "/v2/assets/images/files/unknow.gif";
  };

  // Check if file can be viewed (based on Angular's isViewFile logic)
  const canViewFile = (file: any) => {
    if (!file || !file.name) return false;
    return checkViewFileStatus(file.name) && !file.oEncrypt;
  };

  // Get original file name (like Angular's getOrginName)
  const getOriginName = (file: any) => {
    return file.displayName || file.name || "";
  };

  // Render file list with icons (like Angular HTML template)
  const renderFileList = (label: string, files: any[]) => {
    return (
      <div className="flex items-start gap-2 my-4">
        <label className="w-[160px] text-sm font-semibold text-gray-800 text-right">
          {label}
        </label>
        <div className="flex-1">
          {files && files.length > 0 ? (
            files.map((file, idx) => (
              <div key={idx} className="flex items-center gap-2 mb-1">
                {/* File icon */}
                <img
                  src={getFileIcon(file.name)}
                  width={16}
                  height={16}
                  alt="file"
                  className="flex-shrink-0"
                />

                {/* File name - clickable (like Angular: view if viewable, otherwise download) */}
                <span
                  className="text-sm text-blue-600 hover:underline cursor-pointer"
                  onClick={() => {
                    // Like Angular's onClickFile: view if viewable, download otherwise
                    if (canViewFile(file)) {
                      onViewFile?.(file);
                    } else {
                      onDownloadFile?.(file);
                    }
                  }}
                  title={getOriginName(file)}
                >
                  {getOriginName(file)}
                </span>

                {/* Share icon - only if file.encrypt */}
                {file.encrypt && onShareFile && (
                  <button
                    onClick={() => onShareFile(file)}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                    title="Chia sẻ tệp đính kèm"
                  >
                    <i className="fas fa-share" />
                  </button>
                )}

                {/* Download icon */}
                <button
                  onClick={() => onDownloadFile?.(file)}
                  className="text-gray-600 hover:text-blue-600 transition-colors"
                  title="Tải xuống"
                >
                  <Download className="w-4 h-4" />
                </button>

                {/* View icon - only for viewable files */}
                {canViewFile(file) && (
                  <button
                    onClick={() => onViewFile?.(file)}
                    className="text-gray-600 hover:text-blue-600 transition-colors"
                    title="Xem tệp đính kèm"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          ) : (
            <span className="text-sm text-gray-500"></span>
          )}
        </div>
      </div>
    );
  };

  return (
    <Card className="shadow-sm">
      <CardHeader className="p-4 cursor-pointer" onClick={onToggle}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <Paperclip className="w-4 h-4 text-white" />
            </div>
            Thông tin chung
          </CardTitle>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Thông tin cơ bản */}
        {render("Số văn bản:", detail?.numberOrSign)}
        {render("Trích yếu:", detail?.preview)}

        {/* Tệp văn bản - with icons */}
        {renderFileList("Tệp văn bản:", docFiles)}

        {/* Tệp phụ lục - with icons */}
        {renderFileList("Tệp phụ lục:", addendumFiles)}

        {render(
          "Ngày văn bản:",
          detail?.documentDate || detail?.dateDocument || detail?.createDate
            ? new Date(
                detail.documentDate || detail.dateDocument || detail.createDate
              ).toLocaleDateString("vi-VN")
            : ""
        )}
        {render("Nơi soạn thảo:", detail?.orgCreateName)}
        {render("Thực hiện:", textMainChecked)}
        {render("Xem để biết:", textToknowChecked)}

        {/* Gắn nhãn */}
        <div className="mt-3">
          <div className="flex items-center gap-2">
            <label className="min-w-[160px] w-[160px] text-sm font-semibold text-gray-800 text-right flex items-center justify-end">
              Gắn nhãn:
              <button
                className="ml-1 text-green-600 hover:text-green-700"
                onClick={() => setIsAddDialogOpen(true)}
                title="Thêm mới nhãn"
              >
                <i className="fa fa-plus-circle"></i>
              </button>
            </label>
            <div className="flex-1 flex items-center gap-2 max-w-[calc(100%-160px)]">
              <MultiSelect
                options={(dropdownList || []) as any}
                value={(selectedItems || []) as any}
                onChange={(items: any[]) => onChangeTags?.(items as any)}
                placeholder="Chọn nhãn"
                className="w-full min-h-9 h-auto"
                showNumberOfItems
              />
              <AddLable
                isAddDialogOpen={isAddDialogOpen}
                handleDialogOpenChange={setIsAddDialogOpen}
                newLabelName={newLabelName}
                setNewLabelName={setNewLabelName}
                onClose={() => {
                  setIsAddDialogOpen(false);
                  setNewLabelName("");
                }}
                className="w-[30px] min-h-[28px] flex items-center"
                onCreated={(label) => {
                  const exists = (selectedItems || []).some(
                    (s) => String(s.id) === String((label as any).id)
                  );
                  if (!exists)
                    onChangeTags?.([...(selectedItems || []), label as any]);
                }}
                renderBtn={() => (
                  <button
                    className="h-6 border rounded px-1 text-xs text-white bg-blue-600 hover:bg-blue-700 flex items-center justify-center"
                    onMouseEnter={(e) =>
                      ((
                        e.currentTarget as HTMLButtonElement
                      ).style.backgroundColor = "#3a7bc8")
                    }
                    onMouseLeave={(e) =>
                      ((
                        e.currentTarget as HTMLButtonElement
                      ).style.backgroundColor = "#4798e8")
                    }
                  >
                    <PlusIcon className="w-4 h-4" />
                  </button>
                )}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GeneralInfoInternalCard;
