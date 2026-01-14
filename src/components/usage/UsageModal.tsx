"use client";
import React, { useState, useEffect } from "react";
import {
  Usage,
  UsageCreateRequest,
  UsageUpdateRequest,
} from "@/definitions/types/usage.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useSaveUsage,
  useSaveNewUsage,
  useSaveFileUsage,
} from "@/hooks/data/usage.data";
import { ToastUtils } from "@/utils/toast.utils";
import { handleError } from "@/utils/common.utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface UsageModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  usage?: Usage | null;
  isView?: boolean;
  onSuccess?: () => void;
}

export default function UsageModal({
  isOpen,
  onOpenChange,
  usage,
  isView = false,
  onSuccess,
}: UsageModalProps) {
  // State
  const [formData, setFormData] = useState({
    value: "",
  });
  const [userFile, setUserFile] = useState<File | null>(null);
  const [showValidation, setShowValidation] = useState(false);

  // Mutations
  const { mutate: saveUsage, isPending: isSaving } = useSaveUsage();
  const { mutate: saveNewUsage, isPending: isCreating } = useSaveNewUsage();
  const { mutate: saveFileUsage, isPending: isUploading } = useSaveFileUsage();

  // Computed values
  const isEdit = !!usage?.id;
  const isLoading = isSaving || isCreating || isUploading;

  // Initialize form data
  useEffect(() => {
    if (usage) {
      setFormData({
        value: usage.value,
      });
    } else {
      setFormData({
        value: "",
      });
    }
    setUserFile(null);
    setShowValidation(false);
  }, [usage, isOpen]);

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setUserFile(file);
    } else {
      setUserFile(null);
    }
  };

  // Handle form submission
  const handleSubmit = () => {
    setShowValidation(true);

    // Validation - messages will be shown under inputs
    if (!formData.value.trim()) {
      return; // Message already shown under input
    }

    if (!userFile && !isEdit) {
      return; // Message already shown under input
    }

    if (isEdit) {
      // Update existing usage
      const updateData: UsageUpdateRequest = {
        id: usage!.id,
        value: formData.value,
        file: userFile || undefined,
      };

      saveUsage(updateData, {
        onSuccess: () => {
          ToastUtils.success("Cập nhật hướng dẫn sử dụng thành công");
          onSuccess?.();
          // Reset file input
          const fileInput = document.getElementById("file") as HTMLInputElement;
          if (fileInput) {
            fileInput.value = "";
          }
          onOpenChange(false);
        },
        onError: (error) => {
          handleError(error);
        },
      });
    } else {
      // Create new usage
      const createData: UsageCreateRequest = {
        name: formData.value,
      };

      saveNewUsage(createData, {
        onSuccess: (result) => {
          // Upload file after creating usage
          if (userFile) {
            const fileData = {
              week: 0,
              year: 0,
              files: userFile,
              catId: result.id,
            };

            saveFileUsage(fileData, {
              onSuccess: () => {
                ToastUtils.success("Thêm mới hướng dẫn sử dụng thành công");
                onSuccess?.();
                // Reset file input
                const fileInput = document.getElementById(
                  "file"
                ) as HTMLInputElement;
                if (fileInput) {
                  fileInput.value = "";
                }
                onOpenChange(false);
              },
              onError: (error) => {
                handleError(error);
              },
            });
          } else {
            ToastUtils.success("Thêm mới hướng dẫn sử dụng thành công");
            onSuccess?.();
            // Reset file input
            const fileInput = document.getElementById(
              "file"
            ) as HTMLInputElement;
            if (fileInput) {
              fileInput.value = "";
            }
            onOpenChange(false);
          }
        },
        onError: (error) => {
          handleError(error);
        },
      });
    }
  };

  const handleCancel = () => {
    setShowValidation(false);
    // Reset file input
    const fileInput = document.getElementById("file") as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-bold">
            {isView
              ? "Xem hướng dẫn sử dụng"
              : isEdit
                ? "Cập nhật hướng dẫn sử dụng"
                : "Thêm mới hướng dẫn sử dụng"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tên vai trò */}
          <div className="space-y-2">
            <Label htmlFor="value" className="font-bold">
              Tên vai trò <span className="text-red-500">*</span>
            </Label>
            <Input
              id="value"
              value={formData.value}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, value: e.target.value }))
              }
              disabled={isView}
              placeholder="Nhập tên vai trò"
            />
            {showValidation && !formData.value.trim() && (
              <p className="text-sm text-red-500">
                Tên vai trò không được để trống
              </p>
            )}
          </div>

          {/* Tệp hướng dẫn */}
          <div className="space-y-2">
            <Label htmlFor="file" className="font-bold">
              Tệp hướng dẫn <span className="text-red-500">*</span>
            </Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileSelect}
              disabled={isView}
              accept=".xlsx,.xls,image/*,.doc, .docx,.ppt, .pptx,.txt,.pdf"
            />
            {showValidation && !userFile && !isEdit && (
              <p className="text-sm text-red-500">
                Bạn chưa chọn Tệp hướng dẫn
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        {!isView && (
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Đóng
            </Button>
            <Button onClick={handleSubmit} disabled={isLoading}>
              {isLoading ? "Đang xử lý..." : "Lưu lại"}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
