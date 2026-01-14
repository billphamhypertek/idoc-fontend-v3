"use client";

import React, { useState, useEffect } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SelectCustom from "@/components/common/SelectCustom";
import { Calendar, Save } from "lucide-react";
import {
  useGetHeadingTree,
  useGetMaintenancePeriods,
  useGetApprovers,
} from "@/hooks/data/document-record.data";
import { DocumentRecordService } from "@/services/document-record.service";
import { CustomDatePicker } from "@/components/ui/calendar";
import { formatDateYMD, parseDateStringYMD } from "@/utils/datetime.utils";

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
}

interface EditWorkProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: WorkProfileFormData) => void;
  folderId: string | number;
}

export default function EditWorkProfileModal({
  isOpen,
  onClose,
  onSubmit,
  folderId,
}: EditWorkProfileModalProps) {
  const { data: headingTree } = useGetHeadingTree();
  const { data: maintenancePeriods } = useGetMaintenancePeriods();
  const { data: approvers } = useGetApprovers();

  const [formData, setFormData] = useState<WorkProfileFormData>({
    code: "",
    year: "",
    fileNumber: "",
    title: "",
    headingId: "",
    maintenance: "",
    usageMode: "",
    language: "",
    startDate: "",
    endDate: "",
    infoCode: "",
    description: "",
    keywords: "",
    sheetCount: "",
    pageCount: "",
    physicalStatus: "",
    approverId: "",
  });

  const [errors, setErrors] = useState<
    Partial<Record<keyof WorkProfileFormData, string>>
  >({});
  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && folderId) {
      loadProfileData();
    } else if (!isOpen) {
      setFormData({
        code: "",
        year: "",
        fileNumber: "",
        title: "",
        headingId: "",
        maintenance: "",
        usageMode: "",
        language: "",
        startDate: "",
        endDate: "",
        infoCode: "",
        description: "",
        keywords: "",
        sheetCount: "",
        pageCount: "",
        physicalStatus: "",
        approverId: "",
      });
    }
  }, [isOpen, folderId]);

  const loadProfileData = async () => {
    try {
      setLoading(true);
      const [
        profileResponse,
        documentsResponse,
        headingsResponse,
        approversResponse,
      ] = await Promise.all([
        DocumentRecordService.getById(String(folderId)),
        DocumentRecordService.getListVBByFolderId(String(folderId), 10, 1),
        DocumentRecordService.getHeadingTree(),
        DocumentRecordService.getUsersByOrgWithAuthority("2", "DUYET_HOSO"),
      ]);
      const profileData = profileResponse;
      const mappedData = {
        code: profileData.fileCode || "",
        year: profileData.year?.toString() || "",
        fileNumber: profileData.fileNotation || "",
        title: profileData.title || "",
        headingId: profileData.headingsId?.toString() || "",
        maintenance: profileData.maintenance?.toString() || "",
        usageMode: profileData.rights || "",
        language: profileData.language || "",
        startDate: profileData.startDate
          ? new Date(profileData.startDate).toISOString().split("T")[0]
          : "",
        endDate: profileData.endDate
          ? new Date(profileData.endDate).toISOString().split("T")[0]
          : "",
        infoCode: profileData.inforSign || "",
        description: profileData.description || "",
        keywords: profileData.keyword || "",
        sheetCount: profileData.sheerNumber?.toString() || "",
        pageCount: profileData.pageNumber?.toString() || "",
        physicalStatus:
          profileData.format === "BT"
            ? "BT"
            : profileData.format === "HH"
              ? "HH"
              : "",
        approverId: profileData.createBy?.toString() || "",
      };
      setFormData(mappedData);
    } catch (error) {
      console.error("Error loading profile data:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
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
      formData.maintenance !== ""
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Sửa hồ sơ</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center items-center py-8">
            <div className="text-gray-500">Đang tải dữ liệu...</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 py-4">
            <div>
              <Label className="block text-sm font-normal text-gray-700 mb-1.5">
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
              <Label className="block text-sm font-normal text-gray-700 mb-1.5">
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
              <Label className="block text-sm font-normal text-gray-700 mb-1.5">
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
                    code: `000.00.07.G11.${prev.year}.${formatted}`,
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
              <Label className="block text-sm font-normal text-gray-700 mb-1.5">
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
              <Label className="block text-sm font-normal text-gray-700 mb-1.5">
                Đề mục <span className="text-red-500">*</span>
              </Label>
              <SelectCustom
                options={
                  headingTree?.map((heading: any) => ({
                    value: heading.id.toString(),
                    label: heading.name,
                  })) || []
                }
                value={formData.headingId}
                onChange={(value) =>
                  handleSelectChange(
                    "headingId",
                    Array.isArray(value) ? value[0] : value
                  )
                }
                placeholder="Chọn đề mục"
                className={errors.headingId ? "border-red-500" : ""}
              />
              {errors.headingId && (
                <p className="mt-1 text-xs text-red-500">{errors.headingId}</p>
              )}
            </div>

            <div>
              <Label className="block text-sm font-normal text-gray-700 mb-1.5">
                Thời hạn bảo quản <span className="text-red-500">*</span>
              </Label>
              <SelectCustom
                options={
                  maintenancePeriods?.map((period: any) => ({
                    value: period.id.toString(),
                    label: period.name,
                  })) || []
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
              {errors.maintenance && (
                <p className="mt-1 text-xs text-red-500">
                  {errors.maintenance}
                </p>
              )}
            </div>

            <div>
              <Label className="block text-sm font-normal text-gray-700 mb-1.5">
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
              <Label className="block text-sm font-normal text-gray-700 mb-1.5">
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
              <Label className="block text-sm font-normal text-gray-700 mb-1.5">
                Thời gian bắt đầu
              </Label>
              <div className="flex">
                <Input
                  type="text"
                  value={formatDateDisplay(formData.startDate)}
                  readOnly
                  placeholder="dd/mm/yyyy"
                  className="flex-1 pointer-events-none bg-white"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="ml-2"
                  onClick={() => setShowStartDatePicker((prev) => !prev)}
                >
                  <Calendar size={16} />
                </Button>
              </div>
              {showStartDatePicker && (
                <CustomDatePicker
                  selected={
                    formData.startDate
                      ? parseDateStringYMD(formData.startDate)
                      : null
                  }
                  onChange={(date) => {
                    setFormData((prev) => ({
                      ...prev,
                      startDate: formatDateYMD(date),
                    }));
                    setShowStartDatePicker(false);
                  }}
                  className="mt-1"
                />
              )}
            </div>

            <div>
              <Label className="block text-sm font-normal text-gray-700 mb-1.5">
                Thời gian kết thúc
              </Label>
              <div className="flex">
                <Input
                  type="text"
                  value={formatDateDisplay(formData.endDate)}
                  readOnly
                  placeholder="dd/mm/yyyy"
                  className="flex-1 pointer-events-none bg-white"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="ml-2"
                  onClick={() => setShowEndDatePicker((prev) => !prev)}
                >
                  <Calendar size={16} />
                </Button>
              </div>
              {showEndDatePicker && (
                <CustomDatePicker
                  selected={
                    formData.endDate
                      ? parseDateStringYMD(formData.endDate)
                      : null
                  }
                  onChange={(date) => {
                    setFormData((prev) => ({
                      ...prev,
                      endDate: formatDateYMD(date),
                    }));
                    setShowEndDatePicker(false);
                  }}
                  className="mt-1"
                  min={formData.startDate || undefined}
                />
              )}
            </div>

            <div>
              <Label className="block text-sm font-normal text-gray-700 mb-1.5">
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
              <Label className="block text-sm font-normal text-gray-700 mb-1.5">
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
              <Label className="block text-sm font-normal text-gray-700 mb-1.5">
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
              <Label className="block text-sm font-normal text-gray-700 mb-1.5">
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
              <Label className="block text-sm font-normal text-gray-700 mb-1.5">
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
              <Label className="block text-sm font-normal text-gray-700 mb-1.5">
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

            <div className="lg:col-span-3">
              <Label className="block text-sm font-normal text-red-600 mb-1.5">
                Người duyệt
              </Label>
              <SelectCustom
                options={
                  approvers && approvers.length > 0
                    ? approvers.map((approver: any) => ({
                        value: approver.id.toString(),
                        label: approver.fullName,
                      }))
                    : []
                }
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
          </div>
        )}

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={!isFormValid() || loading}
            className="bg-blue-600 hover:bg-blue-600 text-white"
          >
            <Save size={16} className="mr-2" />
            Cập nhật
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
