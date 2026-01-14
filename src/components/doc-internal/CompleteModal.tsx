"use client";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { X, Upload, Check } from "lucide-react";
import { ToastUtils } from "@/utils/toast.utils";
import { validFileSSize } from "@/utils/file.utils";

interface CompleteModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (comment: string, files: File[]) => void;
  isSubmitting?: boolean;
}

export default function CompleteModal({
  open,
  onClose,
  onConfirm,
  isSubmitting = false,
}: CompleteModalProps) {
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [validFiles, setValidFiles] = useState(true);

  // Reset form when modal closes
  const handleClose = () => {
    setComment("");
    setFiles([]);
    setValidFiles(true);
    onClose();
  };

  const handleConfirm = () => {
    // Comment is optional for complete
    // Validate comment length if provided
    if (comment && comment.length > 2000) {
      ToastUtils.error("Lý do hoàn thành không được dài quá 2000 ký tự");
      return;
    }

    onConfirm(comment.trim(), files);
    handleClose();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles || selectedFiles.length === 0) return;

    // Validate file size
    if (!validFileSSize(selectedFiles)) {
      setValidFiles(false);
      ToastUtils.error("Tệp tin vượt quá dung lượng cho phép");
      e.target.value = "";
      return;
    }

    setValidFiles(true);

    // Add new files (avoid duplicates)
    const newFiles = Array.from(selectedFiles);
    const existingNames = new Set(files.map((f) => f.name));
    const filesToAdd = newFiles.filter((f) => !existingNames.has(f.name));

    setFiles([...files, ...filesToAdd]);
    e.target.value = "";
  };

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
  };

  const getFileSizeString = (size: number): string => {
    const KB = size / 1024;
    const MB = KB / 1024;
    if (MB >= 0.1) {
      return `${MB.toFixed(2)} MB`;
    }
    if (KB > 0) {
      return `${KB.toFixed(2)} KB`;
    }
    return `${size} B`;
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Hoàn thành</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Comment textarea */}
          <div className="space-y-2">
            <Label htmlFor="complete-comment" className="font-bold">
              Lý do hoàn thành
            </Label>
            <Textarea
              id="complete-comment"
              placeholder="Nhập lý do hoàn thành (tùy chọn)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              maxLength={2000}
              className="resize-none"
            />
            {comment && comment.length > 1900 && (
              <p className="text-sm text-gray-500">
                {comment.length}/2000 ký tự
              </p>
            )}
            {comment && comment.length > 2000 && (
              <p className="text-red-500 text-sm">
                Lý do hoàn thành không được dài quá 2000 ký tự
              </p>
            )}
          </div>

          {/* File upload */}
          <div className="space-y-2">
            <Label htmlFor="complete-file-upload" className="cursor-pointer">
              <Button
                type="button"
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
                asChild
              >
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Chọn tệp
                </span>
              </Button>
            </Label>
            <input
              id="complete-file-upload"
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
            />

            {!validFiles && (
              <p className="text-red-500 text-sm">
                Dung lượng tệp tin vượt quá giới hạn cho phép
              </p>
            )}

            {/* File list */}
            {files.length > 0 && (
              <div className="space-y-2 mt-3">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                  >
                    <span className="text-sm truncate flex-1">
                      {file.name} ({getFileSizeString(file.size)})
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(index)}
                      className="ml-2 h-6 w-6 p-0 text-red-500 hover:text-red-700"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-between">
          <Button
            type="button"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleConfirm}
            disabled={isSubmitting || comment.length > 2000}
          >
            <Check className="w-4 h-4 mr-2" />
            {isSubmitting ? "Đang xử lý..." : "Hoàn thành"}
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
      </DialogContent>
    </Dialog>
  );
}
