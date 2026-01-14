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
import { Label } from "@/components/ui/label";
import { X, Save } from "lucide-react";
import { AddDelegateFlow } from "@/definitions/types/delegate_flow.type";
import { CategoryCode } from "@/definitions/types/category.type";
import SelectCustom from "../common/SelectCustom";
import { ToastUtils } from "@/utils/toast.utils";

interface AddDelegateFlowModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (delegateFlow: AddDelegateFlow) => void;
  loading?: boolean;
  positionList: CategoryCode[];
}

export default function AddDelegateFlowModal({
  isOpen,
  onOpenChange,
  onSave,
  loading = false,
  positionList,
}: AddDelegateFlowModalProps) {
  const [formData, setFormData] = useState<AddDelegateFlow>({
    from: "",
    to: "",
  });

  useEffect(() => {
    setFormData({
      from: "",
      to: "",
    });
  }, [isOpen]);

  const handleInputChange = (field: keyof AddDelegateFlow, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      // Nếu thay đổi "from" và "to" đang trùng với "from" mới, reset "to"
      if (field === "from" && updated.to === value) {
        updated.to = "";
      }
      return updated;
    });
  };

  const handleSave = () => {
    if (formData.from === "" || formData.to === "") {
      ToastUtils.error(
        "Vui lòng chọn chức danh ủy quyền và chức danh được ủy quyền"
      );
      return;
    }
    if (formData.from === formData.to) {
      ToastUtils.error(
        "Chức danh ủy quyền và chức danh được ủy quyền không được trùng nhau"
      );
      return;
    }
    onSave(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[160vh] overflow-x-hidden">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle>Thêm mới luồng ủy quyền</DialogTitle>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName" className="font-semibold">
                Chức danh ủy quyền<span className="text-red-500">*</span>
              </Label>
              <SelectCustom
                options={positionList.map((item) => ({
                  label: item.name,
                  value: item.id.toString(),
                }))}
                value={formData.from as string}
                onChange={(value: string | string[]) =>
                  handleInputChange("from", value)
                }
                placeholder="Chọn chức danh ủy quyền"
                className="w-auto"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="positionName" className="font-semibold">
                Chức danh được ủy quyền<span className="text-red-500">*</span>
              </Label>
              <SelectCustom
                options={positionList
                  .filter((item) => item.id.toString() !== formData.from)
                  .map((item) => ({
                    label: item.name,
                    value: item.id.toString(),
                  }))}
                value={formData.to as string}
                onChange={(value: string | string[]) =>
                  handleInputChange("to", value)
                }
                placeholder="Chọn chức danh được ủy quyền"
                className="w-auto"
                disabled={!formData.from}
              />
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              "Đang lưu..."
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Lưu lại
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            <X className="w-4 h-4 mr-2" />
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
