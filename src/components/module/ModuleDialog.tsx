"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  CustomDialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Module, ModuleDetail } from "@/definitions/types/module.type";
import { ToastUtils } from "@/utils/toast.utils";
import { X } from "lucide-react";
import { TreeSelectItems } from "./TreeSelect";

interface ModuleDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (module: ModuleDetail) => void;
  moduleData: ModuleDetail;
  isEdit?: boolean;
  loading?: boolean;
  listModule?: Module[];
}

export default function ModuleDialog({
  isOpen,
  onOpenChange,
  onSave,
  moduleData,
  isEdit = false,
  loading = false,
  listModule,
}: ModuleDialogProps) {
  const [formData, setFormData] = useState<ModuleDetail>({} as ModuleDetail);

  // Quản lý expanded id cho tree menu cha
  // Khi mở dialog hoặc thay module, reset -> mọi node đều đóng
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    setExpandedIds(new Set());
    if (isOpen) {
      if (isEdit && moduleData) {
        setFormData(moduleData);
      } else {
        setFormData({
          hide: false,
          isDefault: true,
        } as ModuleDetail);
      }
    }
  }, [isOpen, isEdit, moduleData]);

  // Tree toggle helper
  const handleToggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  // Hàm set chọn khi click item ngoài Select (tránh trùng? thận trọng)
  const handleDirectSelect = (id: number | null) => {
    handleInputChange("parentId", id);
  };

  const handleSave = async () => {
    if (!formData.name?.trim()) {
      ToastUtils.error("Vui lòng nhập tên menu");
      return;
    }
    if (!formData.code?.trim()) {
      ToastUtils.error("Vui lòng nhập mã code");
      return;
    }
    if (!formData.componentName?.trim()) {
      ToastUtils.error("Vui lòng nhập đường dẫn");
      return;
    }

    try {
      onSave({ ...formData });
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving module:", error);
      ToastUtils.error("Lỗi khi lưu module");
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Lấy đầy đủ cả cha và con (không lọc chỉ top-level), nhưng exclude self
  const getValidParentModules = (): Module[] => {
    if (!listModule) return [];
    // Loại bỏ chính mình khỏi danh sách tree (không thể chọn mình làm cha)
    const excludeSelf = (mods: Module[]): Module[] =>
      mods
        .filter((m) => !isEdit || !moduleData || m.id !== moduleData.id)
        .map((mod) => ({
          ...mod,
          subModule:
            Array.isArray(mod.subModule) && mod.subModule.length > 0
              ? excludeSelf(
                  mod.subModule.filter(
                    (child) =>
                      !isEdit || !moduleData || child.id !== moduleData.id
                  )
                )
              : [],
        }));
    return excludeSelf(listModule);
  };

  // Tìm module theo id
  const findModuleById = (
    id: number | null | undefined
  ): Module | undefined => {
    if (!id || !listModule) return undefined;
    const stack = [...listModule];
    while (stack.length) {
      const item = stack.pop();
      if (!item) continue;
      if (item.id === id) return item;
      if (item.subModule && item.subModule.length > 0)
        stack.push(...item.subModule);
    }
    return undefined;
  };

  // Hiển thị label của menu cha đã chọn, kể cả khi chưa expand node
  const parentModuleLabel = useMemo(() => {
    if (
      formData.parentId === null ||
      formData.parentId === undefined ||
      !listModule
    )
      return undefined;
    const mod = findModuleById(formData.parentId);
    return mod ? mod.name : undefined;
  }, [formData.parentId, listModule]);

  // NEW: Hàm clear giá trị ParentId về null
  const handleClearParentId = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    handleInputChange("parentId", null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <CustomDialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader className="bg-blue-600 text-white -m-6 mb-0 p-4 rounded-t-lg">
          <div className="flex items-center relative">
            <DialogTitle className="text-white flex-1 text-left">
              {isEdit ? "Cập nhật menu" : "Thêm mới menu"}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-white hover:bg-blue-700 p-1 h-auto flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4 px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
            {/* Menu cha Select Tree */}
            <div className="space-y-2 min-w-0">
              <Label htmlFor="parent" className="font-semibold">
                Menu cha
              </Label>
              <div className="relative min-w-0">
                {formData.parentId !== null &&
                  formData.parentId !== undefined && (
                    <button
                      type="button"
                      aria-label="Xóa menu cha"
                      className="absolute right-2 z-10 top-1.5 p-1 rounded hover:bg-gray-100 hover:text-red-600 focus:outline-none"
                      tabIndex={0}
                      onClick={handleClearParentId}
                      onMouseDown={(e) => e.preventDefault()}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                <Select
                  value={
                    formData.parentId !== null &&
                    formData.parentId !== undefined
                      ? formData.parentId.toString()
                      : ""
                  }
                  onValueChange={(value) =>
                    handleInputChange(
                      "parentId",
                      value === "" || value === "0" ? null : parseInt(value)
                    )
                  }
                >
                  <SelectTrigger className="min-w-0 w-full">
                    <SelectValue placeholder="Chọn menu cha">
                      {parentModuleLabel && (
                        <span className="truncate">{parentModuleLabel}</span>
                      )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {getValidParentModules().length > 0 && (
                      <TreeSelectItems
                        modules={getValidParentModules()}
                        expandedIds={expandedIds}
                        toggleExpand={handleToggleExpand}
                        excludeModuleId={
                          isEdit && moduleData ? moduleData.id : undefined
                        }
                        setSelect={handleDirectSelect}
                        maxDepth={1}
                      />
                    )}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tên menu */}
            <div className="space-y-2 min-w-0">
              <Label htmlFor="name" className="font-semibold">
                Tên menu <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name || ""}
                onChange={(e) => handleInputChange("name", e.target.value)}
                placeholder="Nhập tên menu"
                required
                className="min-w-0 w-full"
              />
            </div>

            {/* Mã code */}
            <div className="space-y-2 min-w-0">
              <Label htmlFor="code" className="font-semibold">
                Mã code <span className="text-red-500">*</span>
              </Label>
              <Input
                id="code"
                value={formData.code || ""}
                onChange={(e) => handleInputChange("code", e.target.value)}
                placeholder="Nhập mã code"
                required
                className="min-w-0 w-full"
              />
            </div>

            {/* Đường dẫn */}
            <div className="space-y-2 min-w-0">
              <Label htmlFor="componentName" className="font-semibold">
                Đường dẫn <span className="text-red-500">*</span>
              </Label>
              <Input
                id="componentName"
                value={formData.componentName || ""}
                onChange={(e) =>
                  handleInputChange("componentName", e.target.value)
                }
                placeholder="Nhập đường dẫn"
                required
                className="min-w-0 w-full"
              />
            </div>

            {/* Icon */}
            <div className="space-y-2 min-w-0">
              <Label htmlFor="faIcon" className="font-semibold">
                Icon đại diện
              </Label>
              <Input
                id="faIcon"
                value={formData.faIcon || ""}
                onChange={(e) => handleInputChange("faIcon", e.target.value)}
                placeholder="Nhập icon (ví dụ: fa fa-home)"
                className="min-w-0 w-full"
              />
            </div>

            {/* Source */}
            <div className="space-y-2 min-w-0">
              <Label htmlFor="routerPath" className="font-semibold">
                Đường dẫn source
              </Label>
              <Input
                id="routerPath"
                value={formData.routerPath || ""}
                onChange={(e) =>
                  handleInputChange("routerPath", e.target.value)
                }
                placeholder="Nhập đường dẫn source"
                className="min-w-0 w-full"
              />
            </div>

            {/* Mô tả */}
            <div className="space-y-2 min-w-0">
              <Label htmlFor="description" className="font-semibold">
                Mô tả
              </Label>
              <Textarea
                id="description"
                value={formData.description || ""}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                placeholder="Nhập mô tả"
                rows={2}
                className="min-w-0 w-full resize-none"
              />
            </div>

            {/* Thứ tự sắp xếp */}
            <div className="space-y-2 min-w-0">
              <Label htmlFor="orderNumber" className="font-semibold">
                Thứ tự sắp xếp
              </Label>
              <Input
                id="orderNumber"
                type="number"
                value={
                  formData.orderNumber !== null &&
                  formData.orderNumber !== undefined
                    ? formData.orderNumber
                    : ""
                }
                onChange={(e) =>
                  handleInputChange(
                    "orderNumber",
                    e.target.value ? parseInt(e.target.value) : null
                  )
                }
                placeholder="Nhập thứ tự"
                className="min-w-0 w-full"
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="hide"
                checked={!formData.hide}
                onCheckedChange={(checked) =>
                  handleInputChange("hide", !checked)
                }
              />
              <Label htmlFor="hide" className="font-semibold">
                Kích hoạt
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="isDefault"
                checked={Boolean(formData.isDefault)}
                onCheckedChange={(checked) =>
                  handleInputChange("isDefault", checked)
                }
              />
              <Label htmlFor="isDefault" className="font-semibold">
                Menu mặc định
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-4 px-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="min-w-0"
          >
            <X className="w-4 h-4 mr-2" />
            Đóng
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 min-w-0"
          >
            {loading ? (
              "Đang lưu..."
            ) : (
              <>
                <svg
                  className="w-4 h-4 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                Lưu lại
              </>
            )}
          </Button>
        </DialogFooter>
      </CustomDialogContent>
    </Dialog>
  );
}
