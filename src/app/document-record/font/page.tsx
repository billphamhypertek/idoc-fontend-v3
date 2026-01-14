"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Table } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Plus, Save, Trash2, X } from "lucide-react";
import {
  useAddFont,
  useDeleteFont,
  useGetListFont,
  useUpdateFont,
} from "@/hooks/data/document-record.data";
import type { Column } from "@/definitions/types/table.type";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "@/hooks/use-toast";
import { handleError } from "@/utils/common.utils";
import { ToastUtils } from "@/utils/toast.utils";

export default function FontListPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetListFont(page);
  const { mutate: addFont, isPending: isAdding } = useAddFont();
  const { mutate: updateFont, isPending: isUpdating } = useUpdateFont();
  const { mutate: deleteFont } = useDeleteFont();
  const router = useRouter();

  const [isDialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [form, setForm] = useState({
    id: undefined as number | undefined,
    identifier: "000.00.07.G11",
    organld: "",
    fondName: "",
    fondHistory: "",
    archivesTime: "",
    paperTotal: 0,
    paperDigital: 0,
    otherTypes: "",
    keyGroups: "",
    lookupTools: "",
    language: "",
    copyNumber: 0,
    description: "",
  });

  const rows = data?.content ?? [];
  const total = data?.totalElements ?? 0;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "number" && Number(value) < 0) return;
    setForm({ ...form, [name]: type === "number" ? Number(value) : value });
  };
  const saveDisable =
    !form.fondName ||
    form.fondName == "" ||
    !form.organld ||
    form.organld == "";

  const handleSubmit = () => {
    if (!form.organld || !form.fondName) {
      ToastUtils.error("Vui lòng nhập đầy đủ Tên phông và Mã phông");
      return;
    }

    if (isEditing) {
      updateFont(form, {
        onSuccess: () => {
          setDialogOpen(false);
          resetForm();
          ToastUtils.success("Thao tác thành công");
        },
        onError: (err) => {
          handleError(err);
        },
      });
    } else {
      addFont(form, {
        onSuccess: () => {
          setDialogOpen(false);
          resetForm();
          ToastUtils.success("Thao tác thành công");
        },
        onError: (err) => {
          handleError(err);
        },
      });
    }
  };

  const handleEdit = (record: any) => {
    setForm(record);
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleDelete = (record: any) => {
    deleteFont(record.id, {
      onSuccess: () => {
        ToastUtils.success("Thao tác thành công");
      },
    });
  };

  const resetForm = () => {
    setForm({
      id: undefined,
      identifier: "000.00.07.G11",
      organld: "",
      fondName: "",
      fondHistory: "",
      archivesTime: "",
      paperTotal: 0,
      paperDigital: 0,
      otherTypes: "",
      keyGroups: "",
      lookupTools: "",
      language: "",
      copyNumber: 0,
      description: "",
    });
    setIsEditing(false);
  };

  const columns: Column<any>[] = [
    {
      header: "STT",
      accessor: (_r, idx) => (page - 1) * 10 + idx + 1,
      className: "text-center w-[70px]",
    },
    {
      header: "Tên phông",
      accessor: (r) => r.fondName ?? "",
      className: "text-center",
    },
    {
      header: "Mã phông",
      accessor: (r) => r.organld ?? "",
      className: "text-center",
    },
    {
      header: "Lịch sử hình thành phông",
      accessor: (r) => r.fondHistory ?? "",
      className: "text-center",
    },
    {
      header: "Thời gian tài liệu",
      accessor: (r) => r.archivesTime ?? "",
      className: "text-center",
    },
    {
      header: "Thao tác",
      type: "actions",
      className: "text-center w-[100px]",
      renderActions: (r) => (
        <div className="flex items-center justify-center gap-3">
          <button
            className="text-blue-600 hover:text-blue-800"
            title="Chỉnh sửa"
            onClick={() => handleEdit(r)}
          >
            <Pencil className="w-4 h-4" />
          </button>
          <button
            className="text-red-600 hover:text-red-800"
            title="Xóa"
            onClick={() => handleDelete(r)}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 px-4">
      <BreadcrumbNavigation
        items={[
          {
            href: "document-record/font",
            label: "Hồ sơ tài liệu",
          },
        ]}
        currentPage="Quản lý phông"
        showHome={false}
      />

      <div
        className="flex items-center justify-between mb-4 border rounded-lg p-4 mt-4"
        style={{ backgroundColor: "#E8E9EB" }}
      >
        <div className="space-y-0.5">
          <h1 className="text-xl font-bold text-gray-900">Quản lý phông</h1>
          <p className="text-gray-500 text-sm">Danh sách phông</p>
        </div>
        <Button
          className="inline-flex items-center gap-2 text-white text-sm h-9 px-3 rounded-md bg-blue-600 hover:bg-blue-700"
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#3a7bc8";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#4798e8";
          }}
          onClick={() => {
            resetForm();
            setDialogOpen(true);
          }}
        >
          <Plus className="w-4 h-4" /> Thêm mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={rows}
        loading={isLoading}
        showPagination
        itemsPerPage={10}
        totalItems={total}
        currentPage={page}
        onPageChange={setPage}
        emptyText={
          <div className="text-center text-gray-500 py-6">Không có dữ liệu</div>
        }
        onRowClick={(record) =>
          router.push(`/document-record/font/detail?id=${record.id}`)
        }
        showPageSize={false}
        rowClassName={() => "h-12"}
        cellClassName={() => "py-3 text-sm"}
      />

      <Dialog open={isDialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-7xl w-[90vw] max-h-[90vh] overflow-hidden">
          <DialogHeader className="pb-4 border-b border-gray-200">
            <DialogTitle>
              {isEditing ? "Chỉnh sửa phông" : "Thêm mới phông"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-3 gap-4 mt-2">
            <div>
              <Label className="inline-block mb-1 font-bold text-base">
                Mã cơ quan lưu trữ lịch sử{" "}
                <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                name="identifier"
                value={form.identifier}
                disabled
                className="bg-gray-100 text-gray-600"
              />
            </div>

            <div>
              <Label className="inline-block mb-1 font-bold text-base">
                Mã phông <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                name="organld"
                value={form.organld}
                disabled={isEditing}
                className={isEditing ? "bg-gray-100 text-gray-600" : ""}
                onChange={handleChange}
                placeholder="Mã phông"
              />
            </div>

            <div>
              <Label className="inline-block mb-1 font-bold text-base">
                Lịch sử đơn vị hình thành phông
              </Label>
              <Input
                type="text"
                name="fondHistory"
                value={form.fondHistory}
                onChange={handleChange}
                placeholder="Lịch sử đơn vị hình thành phông"
              />
            </div>

            <div className="col-span-2">
              <Label className="inline-block mb-1 font-bold text-base">
                Tên phông <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                name="fondName"
                value={form.fondName}
                onChange={handleChange}
                placeholder="Tên phông"
              />
            </div>

            <div>
              <Label className="inline-block mb-1 font-bold text-base">
                Thời gian tài liệu
              </Label>
              <Input
                type="text"
                name="archivesTime"
                value={form.archivesTime}
                onChange={handleChange}
                placeholder="Thời gian tài liệu"
              />
            </div>

            <div>
              <Label className="inline-block mb-1 font-bold text-base">
                Tổng số tài liệu giấy
              </Label>
              <Input
                type="number"
                name="paperTotal"
                value={form.paperTotal}
                onChange={handleChange}
                placeholder="Tổng số tài liệu giấy"
              />
            </div>

            <div>
              <Label className="inline-block mb-1 font-bold text-base">
                Số lượng tài liệu giấy đã số hóa
              </Label>
              <Input
                type="number"
                name="paperDigital"
                value={form.paperDigital}
                onChange={handleChange}
                placeholder="Số lượng tài liệu giấy đã số hóa"
              />
            </div>
            <div>
              <Label className="inline-block mb-1 font-bold text-base">
                Các nhóm tài liệu chủ yếu{" "}
              </Label>
              <Input
                type="number"
                name="paperDigital"
                value={form.paperDigital}
                onChange={handleChange}
                placeholder="Các nhóm tài liệu chủ yếu"
              />
            </div>
            <div>
              <Label className="inline-block mb-1 font-bold text-base">
                Các loại hình tài liệu khác{" "}
              </Label>
              <Input
                type="number"
                name="paperDigital"
                value={form.paperDigital}
                onChange={handleChange}
                placeholder="Các loại hình tài liệu khác"
              />
            </div>

            <div>
              <Label className="inline-block mb-1 font-bold text-base">
                Ngôn ngữ
              </Label>
              <Input
                type="text"
                name="language"
                value={form.language}
                onChange={handleChange}
                placeholder="Ngôn ngữ"
              />
            </div>

            <div>
              <Label className="inline-block mb-1 font-bold text-base">
                Công cụ tra cứu
              </Label>
              <Input
                type="text"
                name="lookupTools"
                value={form.lookupTools}
                onChange={handleChange}
                placeholder="Công cụ tra cứu"
              />
            </div>
            <div className="col-span-2">
              <Label className="inline-block mb-1 font-bold text-base">
                Ghi chú
              </Label>
              <Textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                className="h-20 resize-none"
                placeholder="Ghi chú"
              />
            </div>

            <div>
              <Label className="inline-block mb-1 font-bold text-base">
                Số lượng trang tài liệu đã lập bản sao bảo hiểm
              </Label>
              <Input
                type="number"
                name="copyNumber"
                value={form.copyNumber}
                onChange={handleChange}
                placeholder="Số lượng trang tài liệu đã lập bản sao bảo hiểm"
              />
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button
              onClick={handleSubmit}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm h-9"
              disabled={isAdding || isUpdating || saveDisable}
            >
              <Save className="w-4 h-4 mr-2" />
              {isAdding || isUpdating
                ? "Đang lưu..."
                : isEditing
                  ? "Cập nhật"
                  : "Lưu lại"}
            </Button>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              <X className="w-4 h-4 mr-2" />
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
