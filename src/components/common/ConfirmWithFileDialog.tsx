"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Key, KeyRound, Check, X, File, Trash2, Upload } from "lucide-react";
import {
  getFileSizeString,
  isExistFile,
  validFileSize,
} from "@/utils/file.utils";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Define a type for files with optional encrypt property
type EncryptableFile = File & { encrypt?: boolean };

export interface Config {
  title: string;
  label: { input: string; button_confirm: string };
  has_upload_file: boolean;
  has_encrypt: boolean;
  max_file_size: number;
}

type ConfirmWithFileDialogProps = {
  isOpen: boolean;
  onSubmit?: (reason: string, files: EncryptableFile[]) => Promise<void> | void;
  onToggle: (open: boolean) => void;
  config?: Partial<Config>;
};

export default function ConfirmWithFileDialog({
  isOpen,
  onToggle,
  onSubmit = () => {},
  config = {},
}: ConfirmWithFileDialogProps) {
  const defaultConfig: Config = {
    title: "Từ chối",
    label: { input: "Lí do từ chối", button_confirm: "Xác nhận" },
    has_upload_file: true,
    has_encrypt: false,
    max_file_size: 300,
  };

  const [selectedFiles, setSelectedFiles] = useState<EncryptableFile[]>([]);
  const [isLoading, setLoading] = useState<boolean>(false);
  const [reason, setReason] = useState<string>("");
  const [validFiles, setValidFiles] = useState<boolean>(true);
  const [errorReason, setErrorReason] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [localConfig, setLocalConfig] = useState<Config>(defaultConfig);
  const [validFileAttr, setValidFileAttr] = useState({
    validFiles: true,
    isValidFileSize: true,
    isValidExtension: true,
  });

  useEffect(() => {
    if (isOpen) {
      setLocalConfig({ ...defaultConfig, ...config });
      setReason("");
      setSelectedFiles([]);
      setValidFiles(true);
      setErrorReason("");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, config]);

  const handleSelectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // Validate file size
    if (!validFileSize(files)) {
      setValidFileAttr((prev) => ({
        ...prev,
        validFiles: false,
        isValidFileSize: false,
      }));
      e.target.value = "";
      return;
    }

    setValidFileAttr({
      validFiles: true,
      isValidFileSize: true,
      isValidExtension: true,
    });

    const fileArray = Array.from(files);
    if (selectedFiles.length === 0) {
      setSelectedFiles(fileArray as EncryptableFile[]);
    } else {
      const newFiles = fileArray.filter(
        (file) => !isExistFile(file.name, selectedFiles)
      );
      setSelectedFiles((prev) => [...prev, ...(newFiles as EncryptableFile[])]);
    }

    // Reset file input
    e.target.value = "";
  };

  const handleRemoveFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    setSelectedFiles(newFiles);
  };

  const toggleEncrypt = (index: number) => {
    const newFiles = [...selectedFiles];
    // Toggle the encrypt property
    newFiles[index] = Object.assign(newFiles[index], {
      encrypt: !newFiles[index].encrypt,
    });
    setSelectedFiles(newFiles);
  };

  const handleSubmit = async () => {
    if (!reason.trim()) {
      setErrorReason("Vui lòng nhập ý kiến xử lý.");
      return;
    }
    setLoading(true);
    try {
      await onSubmit?.(reason, selectedFiles);
      handleClose();
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setReason("");
    setSelectedFiles([]);
    setValidFiles(true);
    setErrorReason("");
    onToggle(false);
  };

  const handleTriggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const renderFileUpload = () => {
    if (!localConfig.has_upload_file) return null;
    return (
      <div className="space-y-2">
        <Button
          type="button"
          onClick={handleTriggerFileInput}
          className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
        >
          <Upload className="w-4 h-4" />
          Chọn tệp
        </Button>
        <Input
          ref={fileInputRef}
          type="file"
          multiple
          accept="zip,application/octet-stream,application/zip,application/x-zip,application/x-zip-compressed,application/msword,application/vnd.ms-excel,application/vnd.ms-powerpoint,application/pdf"
          className="hidden"
          onChange={handleSelectFiles}
        />

        {!validFileAttr.validFiles && (
          <div className="space-y-1">
            {!validFileAttr.isValidFileSize && (
              <p className="text-red-500 text-xs">
                Dung lượng file phải nhỏ hơn {localConfig.max_file_size}MB.
              </p>
            )}
            {!validFileAttr.isValidExtension && (
              <p className="text-red-500 text-xs">File không đúng định dạng.</p>
            )}
          </div>
        )}

        {selectedFiles.length > 0 && (
          <div className="space-y-2">
            <Label className="text-sm font-bold text-gray-900">
              Danh sách tệp đính kèm ({selectedFiles.length})
            </Label>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {selectedFiles.map((f, i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <File className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {f.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {getFileSizeString(f.size)}
                      {f.encrypt && (
                        <span className="ml-2 text-blue-500">(Mã hóa)</span>
                      )}
                    </p>
                  </div>
                  {localConfig.has_encrypt && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 hover:bg-gray-100"
                            onClick={() => toggleEncrypt(i)}
                            title={f.encrypt ? "Bỏ mã hóa" : "Mã hóa"}
                          >
                            <KeyRound
                              size={16}
                              className={
                                f.encrypt ? "text-red-500" : "text-gray-400"
                              }
                            />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          {f.encrypt ? "Bỏ mã hóa tệp này" : "Mã hóa tệp này"}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRemoveFile(i)}
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
    );
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => (open ? onToggle(true) : handleClose())}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{localConfig.title}</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <div className="flex flex-col gap-4">
            {/* Comment */}
            <div className="space-y-2">
              <Label
                htmlFor="reason"
                className="text-sm font-bold text-gray-900 mb-3 block"
              >
                {localConfig.label.input}
                <span className="ml-2 text-red-500">*</span>
              </Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (errorReason && e.target.value.trim()) {
                    setErrorReason("");
                  }
                }}
                rows={3}
                placeholder={`Nhập ${localConfig.label.input.toLowerCase()}...`}
                className={`resize-none ${errorReason ? "border-red-500" : ""}`}
              />
              {errorReason && (
                <p className="text-sm text-red-500">{errorReason}</p>
              )}
            </div>

            {/* File Upload */}
            {renderFileUpload()}
          </div>
        </DialogDescription>
        <DialogFooter>
          <Button
            disabled={isLoading || !reason.trim()}
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            {isLoading ? (
              "Đang xử lý..."
            ) : (
              <>
                <Check className="w-4 h-4" />
                {localConfig.label.button_confirm}
              </>
            )}
          </Button>
          <Button variant="outline" onClick={handleClose}>
            <X className="w-4 h-4" />
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
