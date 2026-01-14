"use client";

import React, { useState, useEffect } from "react";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import FormBuilder from "@/components/form-builder/FormBuilder";
import EditFieldDialog from "@/components/form/EditFieldDialog";
import {
  FormField,
  Category,
  CategoryNames,
} from "@/definitions/types/form.type";
import { FieldService } from "@/services/field.service";
import { ToastUtils } from "@/utils/toast.utils";
import { Button } from "@/components/ui/button";
import {
  TableBase,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2 } from "lucide-react";

export default function FormPage() {
  const [catSelectedIndex, setCatSelectedIndex] = useState<number | null>(null);
  const [updateFieldID, setUpdateFieldID] = useState<number>(-1);
  const [UpdateField, setUpdateField] = useState<boolean>(false);
  const [fieldlist, setFieldlist] = useState<FormField[]>([]);
  const [editField, setEditField] = useState<FormField | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const categories: Category[] = [
    { id: 1, name: CategoryNames.VB },
    { id: 2, name: CategoryNames.GV },
  ];

  const refreshFieldList = async (catId: number) => {
    try {
      const data = await FieldService.getFields(catId);
      setFieldlist(data || []);
    } catch (err) {
      console.error("Error get fields", err);
    }
  };

  useEffect(() => {
    if (catSelectedIndex !== null) {
      refreshFieldList(catSelectedIndex);
    } else {
      setFieldlist([]);
    }
  }, [catSelectedIndex]);

  const doEditField = (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    e?.preventDefault();

    if (catSelectedIndex === id && updateFieldID === id && UpdateField) {
      return;
    }

    if (catSelectedIndex !== id) {
      setCatSelectedIndex(id);
      setUpdateFieldID(id);
      setUpdateField(true);
    } else {
      if (updateFieldID !== id || !UpdateField) {
        setUpdateFieldID(id);
        setUpdateField(true);
      }
    }
  };

  const handleEditField = (field: FormField) => {
    setEditField({ ...field });
    setIsEditDialogOpen(true);
  };

  const handleUpdateField = async (field: FormField) => {
    try {
      const fieldToUpdate = { ...field };
      if (fieldToUpdate.fieldOption == null) {
        fieldToUpdate.fieldOption = [];
      }

      const objEdit = {
        objects: [fieldToUpdate],
      };

      const data = await FieldService.updateField(JSON.stringify(objEdit));

      if (data) {
        ToastUtils.success("Cập nhật trường thành công!");
        setIsEditDialogOpen(false);
        setEditField(null);
        if (catSelectedIndex !== null) {
          refreshFieldList(catSelectedIndex);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteField = async (field: FormField) => {
    try {
      const objDelete = {
        objects: [field],
      };

      const data = await FieldService.delField(JSON.stringify(objDelete));

      if (data) {
        ToastUtils.success("Xóa trường thành công!");
        if (catSelectedIndex !== null) {
          refreshFieldList(catSelectedIndex);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-4 p-3">
      <BreadcrumbNavigation
        items={[
          {
            href: "/",
            label: "Quản trị hệ thống",
          },
        ]}
        currentPage="Quản lý thuộc tính form"
        showHome={false}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">
                Danh sách văn bản
              </CardTitle>
              <p className="text-sm text-muted-foreground">Thông tin văn bản</p>
            </CardHeader>
            <CardContent>
              <TableBase>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[10%] text-center">STT</TableHead>
                    <TableHead>Tên</TableHead>
                    <TableHead className="w-[15%] text-center">
                      Thao tác
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {categories.map((cat, i) => (
                    <TableRow
                      key={cat.id}
                      className={`cursor-pointer ${
                        catSelectedIndex === cat.id
                          ? "bg-blue-50 hover:bg-blue-100"
                          : "hover:bg-gray-50"
                      }`}
                      onClick={(e) => doEditField(cat.id, e)}
                    >
                      <TableCell className="text-center">{i + 1}</TableCell>
                      <TableCell>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            doEditField(cat.id, e);
                          }}
                          className={`font-medium ${
                            catSelectedIndex === cat.id
                              ? "text-blue-600 hover:text-blue-800"
                              : "text-gray-900 hover:text-gray-700"
                          }`}
                        >
                          {cat.name}
                        </button>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            doEditField(cat.id, e);
                          }}
                        >
                          <Edit className="h-4 w-4 text-blue-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </TableBase>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-bold">
                Danh sách trường động
              </CardTitle>
              <p className="text-sm text-muted-foreground">Thông tin trường</p>
            </CardHeader>
            <CardContent>
              <TableBase>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-center">STT</TableHead>
                    <TableHead>Nhãn</TableHead>
                    <TableHead>Tên trường</TableHead>
                    <TableHead className="text-center">Kiểu</TableHead>
                    <TableHead className="text-center">Yêu cầu</TableHead>
                    <TableHead className="text-center">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fieldlist.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="text-center text-gray-400"
                      >
                        Không có dữ liệu
                      </TableCell>
                    </TableRow>
                  ) : (
                    fieldlist.map((field, i) => (
                      <TableRow key={field.id || i}>
                        <TableCell className="text-center">{i + 1}</TableCell>
                        <TableCell>{field.label}</TableCell>
                        <TableCell>{field.name}</TableCell>
                        <TableCell className="text-center">
                          {field.type}
                        </TableCell>
                        <TableCell className="text-center">
                          {field.required ? "C" : "Khng"}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteField(field)}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditField(field)}
                            >
                              <Edit className="h-4 w-4 text-blue-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </TableBase>
            </CardContent>
          </Card>
        </div>
      </div>

      {UpdateField && catSelectedIndex !== null && (
        <div className="mt-4">
          <FormBuilder
            catSelectedIndex={catSelectedIndex}
            updateFieldID={updateFieldID}
            UpdateField={UpdateField}
            onEditField={doEditField}
            onRefreshFieldList={() => {
              if (catSelectedIndex !== null) {
                refreshFieldList(catSelectedIndex);
              }
            }}
          />
        </div>
      )}

      <EditFieldDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        editField={editField}
        onUpdate={handleUpdateField}
      />
    </div>
  );
}
