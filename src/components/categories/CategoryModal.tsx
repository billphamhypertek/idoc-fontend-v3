"use client";
import React, { useState, useEffect } from "react";
import {
  Category,
  CategoryCreateUpdateRequest,
} from "@/definitions/types/category.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SelectCustom from "@/components/common/SelectCustom";
import {
  useCreateCategory,
  useUpdateCategory,
} from "@/hooks/data/category.data";
import { ToastUtils } from "@/utils/toast.utils";
import { handleError } from "@/utils/common.utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Save, X } from "lucide-react";

interface CategoryModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  category?: Category | null;
  categoryTypeId: number;
  isView?: boolean;
  onSuccess?: () => void;
  nextOrder: number;
}

export default function CategoryModal({
  isOpen,
  onOpenChange,
  category,
  categoryTypeId,
  isView = false,
  onSuccess,
  nextOrder,
}: CategoryModalProps) {
  // State
  const [formData, setFormData] = useState<CategoryCreateUpdateRequest>({
    name: "",
    active: true,
    order: null,
    categoryTypeId: categoryTypeId,
  });

  // Mutations
  const { mutate: createCategory, isPending: isCreating } = useCreateCategory();
  const { mutate: updateCategory, isPending: isUpdating } = useUpdateCategory();

  // Computed values
  const isEdit = !!category?.id;
  const isLoading = isCreating || isUpdating;

  // Initialize form data
  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        active: category.active,
        order: category.order,
        categoryTypeId: categoryTypeId,
      });
    } else {
      setFormData({
        name: "",
        active: true,
        order: null,
        categoryTypeId: categoryTypeId,
      });
    }
  }, [category, categoryTypeId]);
  useEffect(() => {
    if (nextOrder && !isEdit) {
      setFormData((prev) => ({ ...prev, order: nextOrder }));
    }
  }, [nextOrder, isEdit, isOpen]);

  // Handle form submission
  const handleSubmit = () => {
    // Validation
    if (!formData.name.trim()) {
      ToastUtils.error("Tên danh mục không được để trống");
      return;
    }

    if (formData.name.length > 100) {
      ToastUtils.error("Tên danh mục không được dài quá 100 ký tự");
      return;
    }

    if (formData.order && formData.order < 1) {
      ToastUtils.error("Thứ tự phải lớn hơn 0");
      return;
    }

    // Check for special characters in name (same logic as v1 mustBeAlphanumeric directive)
    if (!isAlphanumeric(formData.name)) {
      ToastUtils.error("Tên danh mục không được chứa ký tự đặc biệt");
      return;
    }

    if (isEdit) {
      updateCategory(
        { id: category!.id!, data: formData },
        {
          onSuccess: () => {
            ToastUtils.success("Cập nhật danh mục thành công");
            onSuccess?.();
            onOpenChange(false);
          },
          onError: (error) => {
            handleError(error);
          },
        }
      );
    } else {
      createCategory(formData, {
        onSuccess: () => {
          ToastUtils.success("Thêm mới danh mục thành công");
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
              ? "Xem danh mục"
              : isEdit
                ? "Cập nhật danh mục"
                : "Thêm mới danh mục"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Mã danh mục - chỉ hiển thị khi edit */}
          {isEdit && (
            <div className="space-y-2">
              <Label htmlFor="code" className="font-bold">
                Mã danh mục <span className="text-red-500">*</span>
              </Label>
              <Input id="code" value={category?.id} disabled maxLength={50} />
            </div>
          )}

          {/* Tên danh mục */}
          <div className="space-y-2">
            <Label htmlFor="name" className="font-bold">
              Tên danh mục <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, name: e.target.value }))
              }
              disabled={isView}
              maxLength={100}
              placeholder="Nhập tên danh mục"
            />
          </div>

          {/* Thứ tự */}
          <div className="space-y-2">
            <Label htmlFor="order" className="font-bold">
              Thứ tự ưu tiên
            </Label>
            <Input
              id="order"
              type="text"
              inputMode="numeric"
              pattern="\\d*"
              value={formData.order ?? ""}
              onKeyDown={(e) => {
                if (["-", "e", "E", "+", "."].includes(e.key)) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                const value = e.target.value; // string
                if (value === "") {
                  setFormData((prev) => ({ ...prev, order: null }));
                  return;
                }
                const parsed = parseInt(value, 10);
                if (Number.isNaN(parsed)) return;

                const safe = parsed < 0 ? 0 : parsed;
                setFormData((prev) => ({ ...prev, order: safe }));
              }}
              onBlur={(e) => {
                const value = e.target.value;
                if (value === "") return;
                const parsed = parseInt(value, 10);
                if (Number.isNaN(parsed) || parsed < 0) {
                  setFormData((prev) => ({ ...prev, order: 0 }));
                }
              }}
              disabled={isView}
              placeholder="Nhập thứ tự"
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
              disabled={isView || isEdit}
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
