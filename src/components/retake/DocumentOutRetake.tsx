"use client";

import React, { useState, useRef, useEffect } from "react";
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
import { X, File, Trash2, Undo2, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { RetakeService } from "@/services/retake.service";
import { DocumentService } from "@/services/document.service";
import { notificationService } from "@/services/notification.service";
import {
  getFileSizeString,
  isExistFile,
  validFileSize,
} from "@/utils/file.utils";
import { ToastUtils } from "@/utils/toast.utils";

interface DocumentOutRetakeProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: (success?: boolean) => void;
  documentId: string;
  isFromRetakeModule?: boolean;
  pid?: any;
  refetch?: () => void;
}

interface Comment {
  comment: string;
  attachments: File[];
}

export default function DocumentOutRetakeModal({
  isOpen,
  onOpenChange,
  onClose,
  documentId,
  isFromRetakeModule = false,
  pid,
  refetch,
}: DocumentOutRetakeProps) {
  const { toast } = useToast();
  const [inSubmit, setInSubmit] = useState(false);
  const [comment, setComment] = useState<Comment>({
    comment: "",
    attachments: [],
  });

  const [validFileAttr, setValidFileAttr] = useState({
    validFiles: true,
    isValidFileSize: true,
    isValidExtension: true,
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Clear all information when dialog opens
  useEffect(() => {
    if (isOpen) {
      setComment({
        comment: "",
        attachments: [],
      });
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

  const handleRetakeDocument = async () => {
    if (isFromRetakeModule) {
      await retakeInRetakeModule();
    } else {
      await retakeInDocumentModule();
    }
  };

  const retakeInRetakeModule = async () => {
    setInSubmit(true);
    try {
      const response = await RetakeService.doRetakeDocumentOut(
        documentId,
        comment.comment,
        comment.attachments
      );

      setComment({
        comment: "",
        attachments: [],
      });
      ToastUtils.success("Thu hồi văn bản thành công");

      await notificationService.countUnreadNotification();
      onClose(true);
      refetch?.();
    } catch (error) {
      ToastUtils.error("Có lỗi xảy ra khi thu hồi văn bản");
    } finally {
      setInSubmit(false);
    }
  };

  const retakeInDocumentModule = async () => {
    setInSubmit(true);
    try {
      const item = {
        documentId: parseInt(documentId),
        rejectComment: comment.comment,
        selectedFiles: [comment.attachments],
        pid: pid || "",
      };

      const response = await DocumentService.doRetakeDocument(item);
      ToastUtils.success("Thu hồi văn bản thành công");

      setComment({
        comment: "",
        attachments: [],
      });

      await notificationService.countUnreadNotification();
      onClose(true);
      refetch?.();
    } catch (error) {
      ToastUtils.error("Có lỗi xảy ra khi thu hồi văn bản");
    } finally {
      setInSubmit(false);
    }
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
    if (comment.attachments.length === 0) {
      setComment((prev) => ({
        ...prev,
        attachments: fileArray,
      }));
    } else {
      const newFiles = fileArray.filter(
        (file) => !isExistFile(file.name, comment.attachments)
      );
      setComment((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...newFiles],
      }));
    }

    // Reset file input
    event.target.value = "";
  };

  const handleRemoveFile = (index: number) => {
    setComment((prev) => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index),
    }));
  };

  const isSubmitDisabled = inSubmit;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thu hồi</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <div className="flex flex-col gap-4">
            {/* Comment */}
            <div className="space-y-2">
              <Label
                htmlFor="comment"
                className="text-sm font-bold text-gray-900 mb-3 block"
              >
                Lý do thu hồi
              </Label>
              <Textarea
                id="comment"
                value={comment.comment}
                onChange={(e) =>
                  setComment((prev) => ({ ...prev, comment: e.target.value }))
                }
                rows={3}
                placeholder="Nhập lý do thu hồi..."
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
                id="retakeFileUpload"
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
              {comment.attachments.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-900">
                    Danh sách tệp đính kèm ({comment.attachments.length})
                  </Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {comment.attachments.map((file, index) => (
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
            onClick={handleRetakeDocument}
            disabled={isSubmitDisabled}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            {inSubmit ? (
              "Đang xử lý..."
            ) : (
              <>
                <Undo2 className="w-4 h-4" />
                Thu hồi
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
