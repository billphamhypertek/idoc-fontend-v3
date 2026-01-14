"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  CustomDialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Upload, X, CheckSquare } from "lucide-react";
import { handleError, isExistFile } from "@/utils/common.utils";
import { getFileSizeString } from "@/utils/file.utils";
import { toast } from "@/hooks/use-toast";
import { ToastUtils } from "@/utils/toast.utils";

interface TransferDoneProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  fromUserId?: string;
  onSuccess?: () => void;
  onSubmit: (params: {
    documentId: string;
    comment: string;
    files: File[];
    tab?: string;
    isFinishReceive?: boolean;
  }) => Promise<void>;
  requireCommentWhenHasFiles?: boolean;
  requireCommentAlways?: boolean;
  fileMaxSize?: number;
  tab?: string;
  isFinishReceive?: boolean;
}

export default function TransferDone({
  isOpen,
  onOpenChange,
  documentId,
  fromUserId,
  onSuccess,
  onSubmit,
  requireCommentWhenHasFiles = false,
  requireCommentAlways = true,
  fileMaxSize = 10,
  tab,
  isFinishReceive = false,
}: TransferDoneProps) {
  const [doneComment, setDoneComment] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [validFiles, setValidFiles] = useState<boolean>(true);
  const [validComment, setValidComment] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setDoneComment("");
      setSelectedFiles([]);
      setValidFiles(true);
      setValidComment(true);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const changeComment = () => {
    if (requireCommentWhenHasFiles) {
      if (doneComment.trim().length <= 0) {
        if (selectedFiles.length > 0) {
          setValidComment(false);
        } else {
          setValidComment(true);
        }
      } else {
        setValidComment(true);
      }
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const maxSize = fileMaxSize * 1024 * 1024; // Convert MB to bytes
    const invalidFiles = Array.from(files).filter(
      (file) => file.size > maxSize
    );

    if (invalidFiles.length > 0) {
      setValidFiles(false);
      event.target.value = "";
      ToastUtils.error(`Kích thước file không được vượt quá ${fileMaxSize}MB`);
      return;
    }

    setValidFiles(true);

    if (requireCommentWhenHasFiles && !doneComment.trim()) {
      setValidComment(false);
    }

    const newFiles = Array.from(files).filter(
      (file) => !isExistFile(file.name, selectedFiles)
    );
    setSelectedFiles((prev) => [...prev, ...newFiles]);
    event.target.value = "";
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));

    if (requireCommentWhenHasFiles && selectedFiles.length <= 1) {
      setValidComment(true);
    }
  };

  const doDoneDocumentTask = async () => {
    // Validate comment
    if (requireCommentAlways && !doneComment.trim()) {
      ToastUtils.error("Vui lòng nhập ý kiến xử lý");
      return;
    }

    if (
      requireCommentWhenHasFiles &&
      selectedFiles.length > 0 &&
      !doneComment.trim()
    ) {
      setValidComment(false);
      ToastUtils.error("Phải nhập ý kiến xử lý khi có tệp đính kèm.");
      return;
    }

    if (!validComment || !validFiles) {
      ToastUtils.error("Vui lòng kiểm tra lại thông tin nhập");
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        documentId,
        comment: doneComment,
        files: selectedFiles,
        tab,
        isFinishReceive,
      });

      ToastUtils.success("Hoàn thành xử lý thành công");

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <CustomDialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Hoàn thành</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Done Comment */}
          <div>
            <Label htmlFor="doneComment">Ý kiến xử lý</Label>
            <Textarea
              id="doneComment"
              value={doneComment}
              onChange={(e) => {
                setDoneComment(e.target.value);
                if (requireCommentWhenHasFiles) {
                  changeComment();
                }
              }}
              onKeyUp={requireCommentWhenHasFiles ? changeComment : undefined}
              rows={3}
              placeholder="Nhập ý kiến xử lý..."
              className="mt-1"
              required={requireCommentAlways}
            />
            {!validComment && requireCommentWhenHasFiles && (
              <p className="text-red-500 text-sm mt-1">
                Phải nhập ý kiến xử lý khi có tệp đính kèm.
              </p>
            )}
          </div>

          {/* File Upload */}
          <div>
            <Label htmlFor="doneFileUpload">Tệp đính kèm</Label>
            <div className="mt-1">
              <input
                ref={fileInputRef}
                type="file"
                id="doneFileUpload"
                multiple
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Chọn tệp
              </Button>
              {!validFiles && (
                <p className="text-red-500 text-sm mt-1">
                  Kích thước file không được vượt quá {fileMaxSize}MB
                </p>
              )}
              {selectedFiles.length > 0 && (
                <div className="mt-2 space-y-1">
                  {selectedFiles.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>
                        {file.name} ({getFileSizeString(file.size)})
                      </span>
                      <button
                        type="button"
                        onClick={() => removeFile(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={doDoneDocumentTask}
            disabled={
              isSubmitting ||
              !validComment ||
              !validFiles ||
              (requireCommentAlways && !doneComment.trim())
            }
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Đang xử lý...
              </>
            ) : (
              <>
                <CheckSquare className="w-4 h-4 mr-2" />
                Hoàn thành
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            <X className="w-4 h-4 mr-2" />
            Đóng
          </Button>
        </DialogFooter>
      </CustomDialogContent>
    </Dialog>
  );
}
