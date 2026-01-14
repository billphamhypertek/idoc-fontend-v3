"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Link2, RefreshCcw, X } from "lucide-react";
import { OutSys } from "@/definitions/types/out-sys.type";

interface OutSysAddEditModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (outSys: OutSys) => void;
  outSysData: OutSys | null;
  onConnectOutSys: (outSys: OutSys) => void;
  existingSystems?: OutSys[];
}

interface FormErrors {
  name?: string;
  domain?: string;
  key?: string;
}

const MAX_NAME_LENGTH = 50;
const MAX_URL_LENGTH = 50;
const MAX_KEY_LENGTH = 50;

function isAlphanumericWithSpace(str: string) {
  // Cho phép ký tự chữ, số và khoảng trắng, không ký tự đặc biệt
  return /^[a-zA-Z0-9À-ỹà-ỹ\s]+$/.test(str);
}

export default function OutSysAddEditModal({
  isOpen,
  onOpenChange,
  onSave,
  outSysData,
  onConnectOutSys,
  existingSystems = [],
}: OutSysAddEditModalProps) {
  const [formData, setFormData] = useState<OutSys>({
    id: 0,
    name: "",
    key: "",
    domain: "",
    frDomain: "",
    timeExpired: 0,
    clientId: 0,
    active: true,
  } as OutSys);

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [touchedFields, setTouchedFields] = useState<Set<keyof OutSys>>(
    new Set()
  );

  useEffect(() => {
    setErrors({});
    setIsSubmitted(false);
    setTouchedFields(new Set());
    if (isOpen && outSysData) {
      setFormData(outSysData);
    } else if (isOpen) {
      setFormData({
        id: 0,
        name: "",
        key: "",
        domain: "",
        frDomain: "",
        timeExpired: 0,
        clientId: 0,
        active: true,
      } as OutSys);
    }
  }, [outSysData, isOpen]);

  const validate = (data: OutSys = formData): FormErrors => {
    const newErrors: FormErrors = {};

    if (!data.name || data.name.trim() === "") {
      newErrors.name = "Tên hệ thống không được để trống";
    } else if (!isAlphanumericWithSpace(data.name.trim())) {
      newErrors.name = "Tên hệ thống chứa ký tự đặc biệt";
    } else if (data.name.trim().length > MAX_NAME_LENGTH) {
      newErrors.name = `Tên hệ thống chỉ tối đa ${MAX_NAME_LENGTH} ký tự`;
    } else {
      // Kiểm tra trùng tên (chỉ khi thêm mới hoặc đổi tên khi edit)
      const isDuplicate = existingSystems.some(
        (sys) =>
          sys.name.trim().toLowerCase() === data.name.trim().toLowerCase() &&
          sys.id !== data.id
      );
      if (isDuplicate) {
        newErrors.name = "Tên hệ thống đã tồn tại trong hệ thống";
      }
    }

    if (!data.domain || data.domain.trim() === "") {
      newErrors.domain = "URL không được để trống";
    } else if (data.domain.trim().length > MAX_URL_LENGTH) {
      newErrors.domain = `URL chỉ tối đa ${MAX_URL_LENGTH} ký tự`;
    } else {
      // Kiểm tra trùng URL
      const isDuplicate = existingSystems.some(
        (sys) =>
          sys.domain.trim().toLowerCase() ===
            data.domain.trim().toLowerCase() && sys.id !== data.id
      );
      if (isDuplicate) {
        newErrors.domain = "URL đã tồn tại trong hệ thống";
      }
    }

    if (!data.key || data.key.trim() === "") {
      newErrors.key = "Khóa liên kết không được để trống";
    } else if (data.key.trim().length > MAX_KEY_LENGTH) {
      newErrors.key = `Khóa liên kết chỉ tối đa ${MAX_KEY_LENGTH} ký tự`;
    } else {
      // Kiểm tra trùng khóa
      const isDuplicate = existingSystems.some(
        (sys) => sys.key.trim() === data.key.trim() && sys.id !== data.id
      );
      if (isDuplicate) {
        newErrors.key = "Khóa liên kết đã tồn tại trong hệ thống";
      }
    }

    return newErrors;
  };

  const handleInputChange = (field: keyof OutSys, value: any) => {
    setFormData((prev) => {
      const newValue = typeof value === "string" ? value : value;
      const nextForm = { ...prev, [field]: newValue };
      if (isSubmitted) {
        setErrors(validate(nextForm));
      }
      return nextForm;
    });
  };

  const handleSave = () => {
    setIsSubmitted(true);
    const foundErrors = validate(formData);
    setErrors(foundErrors);
    if (Object.keys(foundErrors).length === 0) {
      onSave(formData);
      onOpenChange(false);
    }
  };

  const handleConnectOutSys = (outSys: OutSys) => {
    setIsSubmitted(true);
    const foundErrors = validate(outSys);
    setErrors(foundErrors);
    if (Object.keys(foundErrors).length === 0) {
      onConnectOutSys(outSys);
    }
  };
  const generateRandomString = (length: number) => {
    const chars =
      "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let result = "";
    for (let i = length; i > 0; --i) {
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader className="text-black -m-6 mb-0 p-4 rounded-t-lg border-b">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-black font-bold">
              {outSysData
                ? "Chỉnh sửa liên kết hệ thống ngoài"
                : "Đăng ký liên kết hệ thống ngoài"}
            </DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tên hệ thống */}
            <div className="space-y-2">
              <Label htmlFor="name" className="font-bold">
                Tên hệ thống <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                value={formData.name || ""}
                placeholder="Nhập tên hệ thống"
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="bg-white"
                onBlur={() => {
                  setTouchedFields((prev) => new Set(prev).add("name"));
                  if (isSubmitted) {
                    setErrors(validate(formData));
                  }
                }}
                required
              />
              {errors.name && (isSubmitted || touchedFields.has("name")) ? (
                <div className="text-red-500 text-sm mt-1">{errors.name}</div>
              ) : null}
            </div>

            {/* Url */}
            <div className="space-y-2">
              <Label htmlFor="domain" className="font-bold">
                URL <span className="text-red-500">*</span>
              </Label>
              <Input
                id="domain"
                value={formData.domain || ""}
                placeholder="Nhập URL"
                onChange={(e) => handleInputChange("domain", e.target.value)}
                className="bg-white"
                onBlur={() => {
                  setTouchedFields((prev) => new Set(prev).add("domain"));
                  if (isSubmitted) {
                    setErrors(validate(formData));
                  }
                }}
                required
              />
              {errors.domain && (isSubmitted || touchedFields.has("domain")) ? (
                <div className="text-red-500 text-sm mt-1">{errors.domain}</div>
              ) : null}
            </div>

            {/* Key liên kết */}
            <div className="space-y-2">
              <Label htmlFor="key" className="font-bold">
                Khóa liên kết <span className="text-red-500">*</span>
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="key"
                  value={formData.key || ""}
                  placeholder="Nhập khoá liên kết"
                  onChange={(e) => handleInputChange("key", e.target.value)}
                  className="bg-white flex-1"
                  onBlur={() => {
                    setTouchedFields((prev) => new Set(prev).add("key"));
                    if (isSubmitted) {
                      setErrors(validate(formData));
                    }
                  }}
                  required
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 hover:bg-blue-100 rounded transition-colors"
                  onClick={() =>
                    handleInputChange("key", generateRandomString(10))
                  }
                  title="Sinh khoá ngẫu nhiên"
                  type="button"
                >
                  <RefreshCcw className="w-4 h-4" />
                </Button>
              </div>
              {errors.key && (isSubmitted || touchedFields.has("key")) ? (
                <div className="text-red-500 text-sm mt-1">{errors.key}</div>
              ) : null}
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700"
            type="button"
          >
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
            {outSysData?.id ? "Lưu lại" : "Đăng ký"}
          </Button>
          <Button
            onClick={() => handleConnectOutSys(formData)}
            className="bg-blue-600 hover:bg-blue-700"
            type="button"
          >
            <Link2 className="w-4 h-4 mr-2" />
            Kết nối
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            type="button"
          >
            <X className="w-4 h-4 mr-2" />
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
