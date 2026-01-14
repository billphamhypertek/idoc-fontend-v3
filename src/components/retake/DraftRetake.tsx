"use client";

import React, { useState, useRef } from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { X, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  getFileSizeString,
  isExistFile,
  validFileSize,
} from "@/utils/file.utils";
import { useAddAttachmentToDoneDoc } from "@/hooks/data/document-in.data";
import { useRetakeDraftOut } from "@/hooks/data/draft.data";
import { ToastUtils } from "@/utils/toast.utils";

interface DraftRetakeProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: (success?: boolean) => void;
  documentId: string;
  refetch?: () => void;
}

interface Comment {
  comment: string;
  attachments: File[];
}

interface FileWithEncrypt extends File {
  encrypt?: boolean;
}

export default function DraftRetakeModal({
  isOpen,
  onOpenChange,
  onClose,
  documentId,
  refetch,
}: DraftRetakeProps) {
  const { toast } = useToast();
  const retakeDraftMutation = useRetakeDraftOut();
  const addAttachmentMutation = useAddAttachmentToDoneDoc();
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

  const handleRetakeDocument = async () => {
    setInSubmit(true);
    try {
      const response = await retakeDraftMutation.mutateAsync({
        docId: documentId,
        comment: comment.comment,
      });
      ToastUtils.success("Thu hồi dự thảo thành công");

      if (response.data > 0 && comment.attachments.length > 0) {
        const formData = new FormData();
        for (const file of comment.attachments) {
          formData.append("files", file);
        }
        await addAttachmentMutation.mutateAsync({
          commentId: response.data,
          formData: formData,
        });
      }

      setComment({
        comment: "",
        attachments: [],
      });

      onClose(true);
      refetch?.();
    } catch (error) {
      ToastUtils.error("Có lỗi xảy ra khi thu hồi dự thảo");
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

    const fileArray = Array.from(files) as FileWithEncrypt[];
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

  const handleChangeEncrypt = (index: number) => {
    setComment((prev) => ({
      ...prev,
      attachments: prev.attachments.map((file, i) =>
        i === index
          ? { ...file, encrypt: !(file as FileWithEncrypt).encrypt }
          : file
      ),
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
                className="bg-blue-600 hover:bg-blue-700"
              >
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
                  <div className="flex flex-wrap gap-2">
                    {comment.attachments.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-2 bg-gray-100 p-2 rounded border"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium">{file.name}</p>
                          <p className="text-xs text-gray-500">
                            {getFileSizeString(file.size)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          <Checkbox
                            id={`encrypt-${index}`}
                            checked={(file as FileWithEncrypt).encrypt || false}
                            onCheckedChange={() => handleChangeEncrypt(index)}
                            className="h-4 w-4"
                          />
                          <Label
                            htmlFor={`encrypt-${index}`}
                            className="text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Shield className="h-3 w-3" />
                            Mã hóa
                          </Label>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveFile(index)}
                            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
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
            className="bg-blue-600 hover:bg-blue-700"
          >
            {inSubmit ? "Đang xử lý..." : "Thu hồi"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
