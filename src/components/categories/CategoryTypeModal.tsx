"use client";
import React, { useState, useEffect } from "react";
import {
  CategoryType,
  CategoryTypeCreateUpdateRequest,
} from "@/definitions/types/category-type.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SelectCustom from "@/components/common/SelectCustom";
import {
  useCreateCategoryType,
  useUpdateCategoryType,
} from "@/hooks/data/category-type.data";
import { ToastUtils } from "@/utils/toast.utils";
import { handleError } from "@/utils/common.utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Save, X } from "lucide-react";

interface CategoryTypeModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  categoryType?: CategoryType | null;
  isView?: boolean;
  onSuccess?: () => void;
}

export default function CategoryTypeModal({
  isOpen,
  onOpenChange,
  categoryType,
  isView = false,
  onSuccess,
}: CategoryTypeModalProps) {
  // State
  const [formData, setFormData] = useState<CategoryTypeCreateUpdateRequest>({
    name: "",
    code: "",
    active: true,
    superAdmin: false,
  });

  // Mutations
  const { mutate: createCategoryType, isPending: isCreating } =
    useCreateCategoryType();
  const { mutate: updateCategoryType, isPending: isUpdating } =
    useUpdateCategoryType();

  // Computed values
  const isEdit = !!categoryType?.id;
  const isLoading = isCreating || isUpdating;

  // Initialize form data
  useEffect(() => {
    if (categoryType) {
      setFormData({
        name: categoryType.name,
        code: categoryType.code,
        active: categoryType.active,
        superAdmin: categoryType.superAdmin,
      });
    } else {
      setFormData({
        name: "",
        code: "",
        active: true,
        superAdmin: false,
      });
    }
  }, [categoryType]);

  // Handle form submission
  const handleSubmit = () => {
    // Validation
    if (!formData.name.trim()) {
      ToastUtils.error("Tên loại danh mục không được để trống");
      return;
    }

    if (!formData.code.trim()) {
      ToastUtils.error("Tên loại danh mục tắt không được để trống");
      return;
    }

    if (formData.code.length > 50) {
      ToastUtils.error("Tên loại danh mục tắt không được dài quá 50 ký tự");
      return;
    }

    if (formData.name.length > 100) {
      ToastUtils.error("Tên loại danh mục không được dài quá 100 ký tự");
      return;
    }

    // Check for special characters in code (same logic as v1 mustBeAlphanumeric directive)
    if (!isAlphanumeric(formData.code)) {
      ToastUtils.error("Tên loại danh mục tắt không được chứa ký tự đặc biệt");
      return;
    }

    // Check for special characters in name (same logic as v1 mustBeAlphanumeric directive)
    if (!isAlphanumeric(formData.name)) {
      ToastUtils.error("Tên loại danh mục không được chứa ký tự đặc biệt");
      return;
    }

    if (isEdit) {
      updateCategoryType(
        { id: categoryType!.id!, data: formData },
        {
          onSuccess: () => {
            ToastUtils.success("Cập nhật loại danh mục thành công");
            onSuccess?.();
            onOpenChange(false);
          },
          onError: (error) => {
            handleError(error);
          },
        }
      );
    } else {
      createCategoryType(formData, {
        onSuccess: () => {
          ToastUtils.success("Thêm mới loại danh mục thành công");
          onSuccess?.();
          onOpenChange(false);
        },
        onError: (error) => {
          handleError(error);
        },
      });
    }
  };

  // Helper function to check alphanumeric (same logic as v1 mustBeAlphanumeric directive)
  const isAlphanumeric = (name: string) => {
    const specialChars = "<>@!#$%^&*()_+[]{}?:;|'\"\\,./~`-=";
    for (const specialChar of specialChars) {
      if (name && name.includes(specialChar)) {
        return false;
      }
    }
    return true;
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isView
              ? "Xem loại danh mục"
              : isEdit
                ? "Cập nhật loại danh mục"
                : "Thêm mới loại danh mục"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Tên loại danh mục tắt */}
          <div className="space-y-2">
            <Label htmlFor="code" className="font-bold">
              Tên loại danh mục tắt <span className="text-red-500">*</span>
            </Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, code: e.target.value }))
              }
              disabled={isView || isEdit}
              maxLength={50}
              placeholder="Nhập tên loại danh mục tắt"
            />
          </div>

          {/* Tên loại danh mục */}
          <div className="space-y-2">
            <Label htmlFor="name" className="font-bold">
              Tên loại danh mục <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              disabled={isView}
              maxLength={100}
              placeholder="Nhập tên loại danh mục"
            />
          </div>

          {/* Trạng thái */}
          <div className="space-y-2">
            <Label htmlFor="active" className="font-bold">
              Trạng thái
            </Label>
            <SelectCustom
              value={formData.active ? "true" : "false"}
              onChange={(value: string | string[]) => {
                const boolValue = Array.isArray(value)
                  ? value[0] === "true"
                  : value === "true";
                setFormData((prev) => ({ ...prev, active: boolValue }));
              }}
              options={[
                { label: "Hoạt động", value: "true" },
                { label: "Không hoạt động", value: "false" },
              ]}
              disabled={isView}
            />
          </div>
        </div>

        {/* Actions */}
        {!isView && (
          <div className="flex justify-end gap-2 pt-4 border-t">
            {isEdit ? (
              <>
                <Button
                  className="text-white border-0 h-9 px-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-[#4798e8] hover:bg-[#3a7bc8] hover:text-white flex items-center justify-center gap-2"
                  onClick={handleSubmit}
                  disabled={isLoading}
                >
                  {!isLoading && <Save className="w-4 h-4 mr-2" />}
                  {isLoading ? "Đang xử lý..." : "Cập nhật"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Hủy
                </Button>
              </>
            ) : (
              <>
                <Button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="text-white border-0 h-9 px-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-[#4798e8] hover:bg-[#3a7bc8] hover:text-white flex items-center justify-center gap-2"
                >
                  {!isLoading && <Save className="w-4 h-4 mr-2" />}
                  {isLoading ? "Đang xử lý..." : "Tạo mới"}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Hủy
                </Button>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
