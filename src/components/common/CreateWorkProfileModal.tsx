"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import SelectCustom from "@/components/common/SelectCustom";
import DropdownTree, { TreeNode } from "@/components/common/DropdownTree";
import { CustomDatePicker } from "@/components/ui/calendar";
import { FileCheck, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useGetHeadingTree,
  useGetMaintenancePeriods,
  useGetApprovers,
} from "@/hooks/data/document-record.data";
import useAuthStore from "@/stores/auth.store";

interface WorkProfileFormData {
  code: string;
  year: string;
  fileNumber: string;
  title: string;
  headingId: string;
  maintenance: string;
  usageMode: string;
  language: string;
  startDate: string;
  endDate: string;
  infoCode: string;
  description: string;
  keywords: string;
  sheetCount: string;
  pageCount: string;
  physicalStatus: string;
  approverId: string;
  folderType: string;
}

interface CreateWorkProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WorkProfileFormData) => void;
  hideApprover?: boolean;
  hideFolderType?: boolean;
}

export default function CreateWorkProfileModal({
  isOpen,
  onClose,
  onSubmit,
  hideApprover = false,
  hideFolderType = false,
}: CreateWorkProfileModalProps) {
  const user = useAuthStore((state) => state.user);

  const orgIdentifier = user?.orgModel?.identifier || "000.00.07.G11";

  const { data: headingTree, isLoading: isLoadingHeadings } =
    useGetHeadingTree();
  const { data: maintenancePeriods, isLoading: isLoadingMaintenance } =
    useGetMaintenancePeriods();
  const { data: approvers, isLoading: isLoadingApprovers } = useGetApprovers();

  const currentYear = new Date().getFullYear().toString();

  const [formData, setFormData] = useState<WorkProfileFormData>({
    code: `${orgIdentifier}.${currentYear}.`,
    year: currentYear,
    fileNumber: "",
    title: "",
    headingId: "",
    maintenance: "",
    usageMode: "",
    language: "",
    startDate: new Date().toISOString().split("T")[0],
    endDate: "",
    infoCode: "",
    description: "",
    keywords: "",
    sheetCount: "",
    pageCount: "",
    physicalStatus: "",
    approverId: "",
    folderType: "CANHAN",
  });

  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      code: `${orgIdentifier}.${prev.year}.${prev.fileNumber}`,
    }));
  }, [formData.year, formData.fileNumber, orgIdentifier]);

  const [errors, setErrors] = useState<
    Partial<Record<keyof WorkProfileFormData, string>>
  >({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof WorkProfileFormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof WorkProfileFormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const formatDateToLocalString = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof WorkProfileFormData, string>> = {};

    if (!formData.year.trim()) {
      newErrors.year = "Vui lòng nhập năm hồ sơ";
    }
    if (!formData.fileNumber.trim()) {
      newErrors.fileNumber = "Vui lòng nhập số và ký hiệu";
    }
    if (!formData.title.trim()) {
      newErrors.title = "Vui lòng nhập tiêu đề hồ sơ";
    }
    if (!formData.headingId || formData.headingId === "") {
      newErrors.headingId = "Vui lòng chọn đề mục";
    }
    if (!formData.maintenance || formData.maintenance === "") {
      newErrors.maintenance = "Vui lòng chọn thời hạn bảo quản";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const isFormValid = () => {
    return (
      formData.year.trim() &&
      formData.fileNumber.trim() &&
      formData.title.trim() &&
      formData.headingId &&
      formData.headingId !== "" &&
      formData.maintenance &&
      formData.maintenance !== "" &&
      (hideApprover || (formData.approverId && formData.approverId !== ""))
    );
  };

  const formatFileNumber = (value: string): string => {
    let formatted = value.toUpperCase();
    formatted = formatted.replace(/[^0-9A-Z.]/g, "");
    if (formatted.length >= 1) {
      if (!/^\d/.test(formatted)) {
        return "";
      }
    }

    if (formatted.length >= 2) {
      if (!/^\d{2}/.test(formatted)) {
        return formatted.substring(0, 1);
      }
    }

    if (formatted.length === 2 && !formatted.includes(".")) {
      formatted = formatted + ".";
    }

    if (formatted.length > 3) {
      const firstTwo = formatted.substring(0, 2);
      const dot = ".";
      let rest = formatted.substring(3);
      rest = rest.replace(/[0-9]/g, "");
      formatted = firstTwo + dot + rest;
    }

    if (formatted.length > 10) {
      formatted = formatted.substring(0, 10);
    }

    return formatted;
  };

  // Convert headingTree data to TreeNode format
  const convertToTreeNode = (data: any[]): TreeNode[] => {
    if (!data || !Array.isArray(data)) return [];

    return data.map((item: any) => ({
      id: typeof item.id === "number" ? item.id : parseInt(item.id) || 0,
      name: item.name || item.label || "",
      parentId: item.parentId || item.parent_id || null,
      children:
        item.children && item.children.length > 0
          ? convertToTreeNode(item.children)
          : undefined,
      hasChildren: item.children && item.children.length > 0,
    }));
  };

  const treeData = useMemo(() => {
    return convertToTreeNode(headingTree || []);
  }, [headingTree]);

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
    >
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm hồ sơ</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
          <div>
            <Label className="block text-sm font-bold text-gray-700 mb-1.5">
              Mã hồ sơ <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              name="code"
              value={formData.code}
              disabled
              placeholder="Mã hồ sơ"
              className="bg-gray-100 text-gray-500 cursor-not-allowed"
            />
          </div>

          <div>
            <Label className="block text-sm font-bold text-gray-700 mb-1.5">
              Năm hồ sơ <span className="text-red-500">*</span>
            </Label>
            <Input
              type="number"
              name="year"
              value={formData.year}
              onChange={handleChange}
              min="0"
              placeholder="yyyy"
              className={errors.year ? "border-red-500" : ""}
            />
            {errors.year && (
              <p className="mt-1 text-xs text-red-500">{errors.year}</p>
            )}
          </div>

          <div>
            <Label className="block text-sm font-bold text-gray-700 mb-1.5">
              Số và ký hiệu <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              name="fileNumber"
              value={formData.fileNumber}
              onChange={(e) => {
                const formatted = formatFileNumber(e.target.value);

                setFormData((prev) => ({
                  ...prev,
                  fileNumber: formatted,
                }));

                if (errors.fileNumber) {
                  setErrors((prev) => ({ ...prev, fileNumber: "" }));
                }
              }}
              placeholder="00.XXXX"
              className={errors.fileNumber ? "border-red-500" : ""}
            />
            {errors.fileNumber && (
              <p className="mt-1 text-xs text-red-500">{errors.fileNumber}</p>
            )}
          </div>

          <div className="lg:col-span-2">
            <Label className="block text-sm font-bold text-gray-700 mb-1.5">
              Tiêu đề hồ sơ <span className="text-red-500">*</span>
            </Label>
            <Input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Nhập Tiêu đề hồ sơ"
              className={errors.title ? "border-red-500" : ""}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-red-500">{errors.title}</p>
            )}
          </div>

          <div>
            <Label className="block text-sm font-bold text-gray-700 mb-1.5">
              Đề mục <span className="text-red-500">*</span>
            </Label>
            <DropdownTree
              value={formData.headingId ? parseInt(formData.headingId) : null}
              onChange={(value) => {
                handleSelectChange(
                  "headingId",
                  value !== null ? value.toString() : ""
                );
              }}
              dataSource={treeData}
              placeholder="Chọn đề mục"
              multiple={false}
              className={cn("h-9", errors.headingId ? "border-red-500" : "")}
            />
            {errors.headingId && (
              <p className="mt-1 text-xs text-red-500">{errors.headingId}</p>
            )}
          </div>

          <div>
            <Label className="block text-sm font-bold text-gray-700 mb-1.5">
              Thời hạn bảo quản <span className="text-red-500">*</span>
            </Label>
            <div className="flex-1 min-w-0">
              <SelectCustom
                options={
                  maintenancePeriods && maintenancePeriods.length > 0
                    ? maintenancePeriods.map((period: any) => ({
                        value: period.id.toString(),
                        label: period.name,
                      }))
                    : []
                }
                value={formData.maintenance}
                onChange={(value) =>
                  handleSelectChange(
                    "maintenance",
                    Array.isArray(value) ? value[0] : value
                  )
                }
                placeholder="Chọn thời gian bảo quản"
                className={errors.maintenance ? "border-red-500" : ""}
              />
            </div>
            {errors.maintenance && (
              <p className="mt-1 text-xs text-red-500">{errors.maintenance}</p>
            )}
          </div>

          <div>
            <Label className="block text-sm font-bold text-gray-700 mb-1.5">
              Chế độ sử dụng
            </Label>
            <Input
              type="text"
              name="usageMode"
              value={formData.usageMode}
              onChange={handleChange}
              placeholder="Chế độ sử dụng"
            />
          </div>

          <div>
            <Label className="block text-sm font-bold text-gray-700 mb-1.5">
              Ngôn ngữ
            </Label>
            <Input
              type="text"
              name="language"
              value={formData.language}
              onChange={handleChange}
              placeholder="Ngôn ngữ"
            />
          </div>

          <div>
            <Label className="block text-sm font-bold text-gray-700 mb-1.5">
              Thời gian bắt đầu
            </Label>
            <CustomDatePicker
              selected={
                formData.startDate
                  ? new Date(formData.startDate + "T00:00:00")
                  : null
              }
              onChange={(date) => {
                setFormData((prev) => ({
                  ...prev,
                  startDate: date ? formatDateToLocalString(date) : "",
                }));
              }}
              placeholder="dd/mm/yyyy"
              showClearButton={false}
            />
          </div>

          <div>
            <Label className="block text-sm font-bold text-gray-700 mb-1.5">
              Thời gian kết thúc
            </Label>
            <CustomDatePicker
              selected={
                formData.endDate
                  ? new Date(formData.endDate + "T00:00:00")
                  : null
              }
              onChange={(date) => {
                setFormData((prev) => ({
                  ...prev,
                  endDate: date ? formatDateToLocalString(date) : "",
                }));
              }}
              placeholder="dd/mm/yyyy"
              showClearButton={false}
            />
          </div>

          <div>
            <Label className="block text-sm font-bold text-gray-700 mb-1.5">
              Ký hiệu thông tin
            </Label>
            <Input
              type="text"
              name="infoCode"
              value={formData.infoCode}
              onChange={handleChange}
              placeholder="Ký hiệu thông tin"
            />
          </div>

          <div className="lg:col-span-2">
            <Label className="block text-sm font-bold text-gray-700 mb-1.5">
              Chú giải
            </Label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Chú giải"
              rows={2}
              className="resize-none"
            />
          </div>

          <div>
            <Label className="block text-sm font-bold text-gray-700 mb-1.5">
              Từ khóa
            </Label>
            <Input
              type="text"
              name="keywords"
              value={formData.keywords}
              onChange={handleChange}
              placeholder="Từ khóa"
            />
          </div>

          <div>
            <Label className="block text-sm font-bold text-gray-700 mb-1.5">
              Số lượng tờ
            </Label>
            <Input
              type="number"
              name="sheetCount"
              value={formData.sheetCount}
              onChange={handleChange}
              min="1"
              placeholder="Số lượng tờ"
            />
          </div>

          <div>
            <Label className="block text-sm font-bold text-gray-700 mb-1.5">
              Số lượng trang
            </Label>
            <Input
              type="number"
              name="pageCount"
              value={formData.pageCount}
              onChange={handleChange}
              min="1"
              placeholder="Số lượng trang"
            />
          </div>

          <div>
            <Label className="block text-sm font-bold text-gray-700 mb-1.5">
              Tình trạng vật lý
            </Label>
            <SelectCustom
              options={[
                { value: "BT", label: "Bình thường" },
                { value: "HH", label: "Hư hỏng" },
              ]}
              value={formData.physicalStatus}
              onChange={(value) =>
                handleSelectChange(
                  "physicalStatus",
                  Array.isArray(value) ? value[0] : value
                )
              }
              placeholder="Chọn tình trạng vật lý"
            />
          </div>

          {!hideApprover && (
            <div className="lg:col-span-3">
              <Label className="block text-sm font-bold text-red-600 mb-1.5">
                Người duyệt
              </Label>
              <SelectCustom
                options={(approvers ?? []).map((approver: any) => ({
                  value: approver.id.toString(),
                  label: approver.fullName,
                }))}
                value={formData.approverId}
                onChange={(value) =>
                  handleSelectChange(
                    "approverId",
                    Array.isArray(value) ? value[0] : value
                  )
                }
                placeholder="Chọn người duyệt"
              />
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!isFormValid()}
            className="bg-blue-600 hover:bg-blue-600 text-white"
          >
            <FileCheck size={16} className="mr-2" />
            Đồng ý
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
