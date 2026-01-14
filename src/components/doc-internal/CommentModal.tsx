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
import { X, Upload } from "lucide-react";
import { ToastUtils } from "@/utils/toast.utils";
import { validFileSSize } from "@/utils/file.utils";

interface CommentModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (comment: string, files: File[]) => void;
  isApprove?: boolean;
  isComment?: boolean; // true = "Cho ý kiến", false = "Ký duyệt"
  isSubmitting?: boolean;
}

export default function CommentModal({
  open,
  onClose,
  onConfirm,
  isApprove = true,
  isComment = false,
  isSubmitting = false,
}: CommentModalProps) {
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
    if (!comment || comment.trim() === "") {
      ToastUtils.error("Vui lòng nhập lý do");
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

  const getTitle = () => {
    if (isApprove) {
      return isComment ? "Cho ý kiến" : "Ký duyệt";
    }
    return "Từ chối";
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Comment textarea */}
          <div className="space-y-2">
            <Label htmlFor="comment" className="font-bold">
              {isComment ? "Ý kiến" : "Lý do"}
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Textarea
              id="comment"
              placeholder={`Nhập ${isComment ? "ý kiến" : "lý do"}...`}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>

          {/* File upload */}
          <div className="space-y-2">
            <Label htmlFor="file-upload" className="cursor-pointer">
              <Button
                type="button"
                variant="outline"
                className="w-full sm:w-auto"
                asChild
              >
                <span>
                  <Upload className="w-4 h-4 mr-2" />
                  Chọn tệp
                </span>
              </Button>
            </Label>
            <input
              id="file-upload"
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

        <DialogFooter>
          {" "}
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={!comment || comment.trim() === "" || isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting && <i className="fa fa-spinner fa-spin mr-2" />}
            {isApprove ? "Phê duyệt" : "Từ chối"}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isSubmitting}
          >
            Hủy
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
