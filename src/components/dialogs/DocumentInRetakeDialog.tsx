import React, { useState } from "react";
import {
  CustomDialogContent,
  Dialog,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowRight,
  ChevronLeft,
  Eye,
  X,
  Upload,
  Send,
  Key,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ToastUtils } from "@/utils/toast.utils";

interface TrackingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  onSubmit: (data: { processingContent: string; files: File[] }) => void;
}

const initData = {
  processingContent: "",
  userId: "",
};

export function DocumentInRetakeDialog({
  isOpen,
  onOpenChange,
  onClose,
  onSubmit,
}: TrackingDialogProps) {
  const [retakeData, setRetakeData] = useState(initData);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const [files, setFiles] = useState<File[]>([]);
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const picked = Array.from(e.target.files ?? []);
    setFiles((prev) => {
      const all = [...prev, ...picked];
      const uniq = new Map<string, File>();
      for (const f of all) {
        const key = `${f.name}-${f.size}-${f.lastModified}`;
        if (!uniq.has(key)) uniq.set(key, f);
      }
      return Array.from(uniq.values());
    });
    // allow re-selecting the same file(s) again
    if (inputRef.current) inputRef.current.value = "";
  };
  const handleOpenPicker = () => inputRef.current?.click();

  const removeFileAt = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };
  const handlePreview = (file: File) => {
    const url = URL.createObjectURL(file);
    window.open(url, "_blank", "noopener,noreferrer");
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  };

  const handleRetakeCancel = () => {
    setRetakeData(initData);
    setFiles([]);
    onClose();
  };
  const handleRetakeSubmit = () => {
    if (retakeData.processingContent.length > 2000) {
      return;
    }
    if (files.length > 0 && !retakeData.processingContent) {
      ToastUtils.phaiNhapLyDoTraLaiKhiCoTepDinhKem();
      return;
    }
    onSubmit({
      processingContent: retakeData.processingContent,
      files: files,
    });
    setRetakeData(initData);
    setFiles([]);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <CustomDialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900">
                Thu hồi
              </DialogTitle>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleRetakeCancel}
                className="h-9 px-4 text-sm font-medium border-gray-300 hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Hủy
              </Button>
              <Button
                onClick={handleRetakeSubmit}
                className="h-9 px-3 text-white border-0 hover:text-white bg-blue-600 hover:bg-blue-700"
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#3a7bc8")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#4798e8")
                }
              >
                <Send className="w-4 h-4 mr-1" />
                Thu hồi
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nội dung xử lý */}
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <Label
              htmlFor="processingContent"
              className="text-sm font-semibold text-gray-900 mb-3 block"
            >
              Lý do thu hồi{" "}
            </Label>
            <Textarea
              id="processingContent"
              placeholder="Nhập lý do thu hồi"
              value={retakeData.processingContent}
              onChange={(e) => {
                const value = e.target.value;
                setRetakeData((prev) => ({
                  ...prev,
                  processingContent: value,
                }));
              }}
              className="min-h-[120px] resize-none"
            />
            {retakeData.processingContent.length > 2000 && (
              <p className="text-sm text-red-600 mt-2">
                Lý do thu hồi không được dài quá 2000 ký tự
              </p>
            )}
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <Label className="text-sm font-semibold text-gray-900 mb-3 block">
              Tệp đính kèm
            </Label>

            {/* Hidden native input (no "No file chosen") */}
            <input
              ref={inputRef}
              id="attachments"
              type="file"
              multiple
              className="sr-only"
              onChange={handleFileChange}
            />

            <div className="flex items-center gap-3">
              <Button
                type="button"
                onClick={handleOpenPicker}
                className="h-9 px-3 text-white border-0 hover:text-white bg-blue-600 hover:bg-blue-700"
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#3a7bc8")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#4798e8")
                }
              >
                <Upload className="w-4 h-4 mr-1" />
                Chọn tệp
              </Button>
              {files.length > 0 && (
                <span className="text-sm text-gray-500">
                  {files.length} tệp đã chọn
                </span>
              )}
            </div>

            {files.length > 0 && (
              <ul className="mt-3 divide-y divide-gray-200 rounded-md border border-gray-200">
                {files.map((f, idx) => (
                  <li
                    key={f.name + idx}
                    className="flex items-center justify-between px-3 py-2"
                  >
                    {/* Left side: key + file info */}
                    <div className="flex items-center gap-2 min-w-0">
                      <KeyRound className="w-4 h-4 shrink-0 text-gray-500" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {f.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(f.size / 1024).toFixed(1)} KB
                        </p>
                      </div>
                    </div>

                    {/* Right side: actions (Eye before X) */}
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-9"
                        onClick={() => handlePreview(f)}
                        aria-label={`Xem ${f.name}`}
                        title="Xem"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-9"
                        onClick={() => removeFileAt(idx)}
                        aria-label={`Xóa ${f.name}`}
                        title="Xóa"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Bảng chọn đơn vị/cá nhân */}
        </div>
      </CustomDialogContent>
    </Dialog>
  );
}
