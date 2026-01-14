import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { notificationService } from "@/services/notification.service";
import {
  getFileSizeString,
  isExistFile,
  validFileSize,
} from "@/utils/file.utils";
import { File, FileCheck, Trash2, Upload, X } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { ToastUtils } from "@/utils/toast.utils";
import { useUpdateAcceptTask } from "@/hooks/data/task-action.data";
import { handleError } from "@/utils/common.utils";

interface RefuseTaskProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  isExecute: boolean;
  taskId: number;
  refetch: () => void;
  UserInfo: any;
  isV2?: boolean;
}
export default function RefuseTask({
  isOpen,
  onOpenChange,
  onClose,
  isExecute,
  taskId,
  refetch,
  UserInfo,
  isV2 = false,
}: RefuseTaskProps) {
  const [reason, setReason] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const [validFileAttr, setValidFileAttr] = useState({
    validFiles: true,
    isValidFileSize: true,
    isValidExtension: true,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: updateAcceptTask, isPending } = useUpdateAcceptTask(
    isV2 ?? false
  );

  // Clear all information when dialog opens
  useEffect(() => {
    if (isOpen) {
      setReason("");
      setSelectedFiles([]);
      setValidFileAttr({
        validFiles: true,
        isValidFileSize: true,
        isValidExtension: true,
      });
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    try {
      const result = await updateAcceptTask({
        taskId,
        status: 2,
        isExcute: isExecute,
        userId: UserInfo?.id,
        comment: reason,
        files: selectedFiles,
      });

      if (result) {
        await notificationService.countUnreadNotification();
        ToastUtils.success("Từ chối công việc thành công");
        onClose();
        refetch();
      } else {
        ToastUtils.error("Từ chối công việc thất bại");
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Validate file size
    if (!validFileSize(files)) {
      setValidFileAttr((prev) => ({
        ...prev,
        validFiles: false,
        isValidFileSize: false,
      }));
      event.target.value = "";
      return;
    }

    setValidFileAttr({
      validFiles: true,
      isValidFileSize: true,
      isValidExtension: true,
    });

    const fileArray = Array.from(files);
    if (selectedFiles.length === 0) {
      setSelectedFiles(fileArray);
    } else {
      const newFiles = fileArray.filter(
        (file) => !isExistFile(file.name, selectedFiles)
      );
      setSelectedFiles((prev) => [...prev, ...newFiles]);
    }

    // Reset file input
    event.target.value = "";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Từ chối</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <div className="flex flex-col gap-4">
            {/* Comment */}
            <div className="space-y-2">
              <Label
                htmlFor="reason"
                className="text-sm font-bold text-gray-900 mb-3 block"
              >
                Lý do từ chối
              </Label>
              <Textarea
                id="reason"
                placeholder="Nhập lý do từ chối"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                className="resize-none"
              />
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Chọn tệp
              </Button>
              <Input
                ref={fileInputRef}
                id="refuseFileUpload"
                type="file"
                name="attachment"
                multiple
                accept="zip,application/octet-stream,application/zip,application/x-zip,application/x-zip-compressed,application/msword,application/vnd.ms-excel,application/vnd.ms-powerpoint,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />

              {!validFileAttr.validFiles && (
                <div className="space-y-1">
                  {!validFileAttr.isValidFileSize && (
                    <p className="text-red-500 text-xs">
                      Dung lượng file phải nhỏ hơn 300MB.
                    </p>
                  )}
                  {!validFileAttr.isValidExtension && (
                    <p className="text-red-500 text-xs">
                      File không đúng định dạng.
                    </p>
                  )}
                </div>
              )}

              {/* File List */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-900">
                    Danh sách tệp đính kèm ({selectedFiles.length})
                  </Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <File className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {getFileSizeString(file.size)}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(index)}
                          className="flex-shrink-0 h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                          title="Xóa file"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogDescription>
        <DialogFooter>
          <Button
            disabled={isPending}
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 hover:text-white text-white flex items-center gap-2"
          >
            {isPending ? (
              "Đang xử lý..."
            ) : (
              <>
                <FileCheck className="w-4 h-4" />
                Xác nhận
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onClose}>
            <X className="w-4 h-4" />
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
