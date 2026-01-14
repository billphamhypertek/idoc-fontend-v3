"use client";

import React, { useState } from "react";
import { FormField, FormValue } from "@/definitions/types/form.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Edit } from "lucide-react";

interface EditFieldDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editField: FormField | null;
  onUpdate: (field: FormField) => void;
}

const EditFieldDialog: React.FC<EditFieldDialogProps> = ({
  open,
  onOpenChange,
  editField,
  onUpdate,
}) => {
  const [field, setField] = useState<FormField | null>(editField);
  const [value, setValue] = useState<FormValue>({ label: "", value: "" });

  React.useEffect(() => {
    setField(editField);
    setValue({ label: "", value: "" });
  }, [editField]);

  const handleUpdate = () => {
    if (field) {
      onUpdate(field);
      onOpenChange(false);
    }
  };

  if (!field) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa thông số trường</DialogTitle>
          <DialogDescription>
            Cập nhật thông tin cho trường {field.label}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Kiểu trường</Label>
            <div className="col-span-3">
              <Input value={field.type || ""} disabled />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Nhãn</Label>
            <div className="col-span-3">
              <Input
                value={field.label || ""}
                onChange={(e) => setField({ ...field, label: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Placeholder</Label>
            <div className="col-span-3">
              <Input
                value={field.placeholder || ""}
                onChange={(e) =>
                  setField({
                    ...field,
                    placeholder: e.target.value,
                  })
                }
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Tên trường</Label>
            <div className="col-span-3">
              <Input
                value={field.name || ""}
                onChange={(e) => setField({ ...field, name: e.target.value })}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label className="text-right">Yêu cầu</Label>
            <div className="col-span-3">
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={field.required === true}
                    onChange={() => setField({ ...field, required: true })}
                  />
                  Có
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    checked={field.required === false}
                    onChange={() => setField({ ...field, required: false })}
                  />
                  Không
                </label>
              </div>
            </div>
          </div>

          {(field.type === "radio" ||
            field.type === "checkbox" ||
            field.type === "autocomplete") && (
            <div>
              <Label>Field options</Label>
              <Card className="mt-2">
                <CardContent>
                  <div className="grid grid-cols-12 gap-2 mb-2">
                    <div className="col-span-5">
                      <Label>Nhãn</Label>
                    </div>
                    <div className="col-span-5">
                      <Label>Giá trị</Label>
                    </div>
                    <div className="col-span-2">
                      <Label>Thao tác</Label>
                    </div>
                  </div>
                  {(field.fieldOption || []).map((opt, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 mb-2">
                      <div className="col-span-5">
                        <Input
                          value={opt.label || ""}
                          onChange={(e) => {
                            const newOptions = [...(field.fieldOption || [])];
                            newOptions[idx].label = e.target.value;
                            setField({
                              ...field,
                              fieldOption: newOptions,
                            });
                          }}
                        />
                      </div>
                      <div className="col-span-5">
                        <Input
                          value={opt.value || ""}
                          onChange={(e) => {
                            const newOptions = [...(field.fieldOption || [])];
                            newOptions[idx].value = e.target.value;
                            setField({
                              ...field,
                              fieldOption: newOptions,
                            });
                          }}
                        />
                      </div>
                      <div className="col-span-2">
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => {
                            const newOptions = field.fieldOption?.filter(
                              (_, i) => i !== idx
                            );
                            setField({
                              ...field,
                              fieldOption: newOptions,
                            });
                          }}
                        >
                          Xóa
                        </Button>
                      </div>
                    </div>
                  ))}
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-5">
                      <Input
                        placeholder="Nhãn"
                        value={value.label || ""}
                        onChange={(e) =>
                          setValue({ ...value, label: e.target.value })
                        }
                      />
                    </div>
                    <div className="col-span-5">
                      <Input
                        placeholder="Giá trị"
                        value={value.value || ""}
                        onChange={(e) =>
                          setValue({ ...value, value: e.target.value })
                        }
                      />
                    </div>
                    <div className="col-span-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (value.label && value.value) {
                            setField({
                              ...field,
                              fieldOption: [
                                ...(field.fieldOption || []),
                                { ...value },
                              ],
                            });
                            setValue({ label: "", value: "" });
                          }
                        }}
                      >
                        Thêm
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
          <Button onClick={handleUpdate}>
            <Edit className="mr-2 h-4 w-4" />
            Sửa
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditFieldDialog;
