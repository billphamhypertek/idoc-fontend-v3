"use client";

import React, { useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Table as UiTable } from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Plus, Download, Trash2, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";

import {
  useTemplateList,
  useAddTemplate,
  useDeleteTemplate,
  useTemplateDownload,
} from "@/hooks/data/template.data";
import type { Template } from "@/services/template.service";
import type { Column } from "@/definitions/types/table.type";
import SelectCustom from "@/components/common/SelectCustom";
import { ToastUtils } from "@/utils/toast.utils";

const SELECT_ALL = "ALL";

const TYPE_OPTIONS = [
  { value: SELECT_ALL, label: "-- Chọn loại văn bản mẫu --" },
  { value: "VAN_BAN_NOI_BO", label: "Văn bản nội bộ" },
  { value: "VAN_BAN_SOAN_THAO", label: "Văn bản soạn thảo" },
  { value: "VAN_BAN_DI", label: "Văn bản đi" },
  { value: "VAN_BAN_DEN", label: "Văn bản đến" },
];

const TYPE_DISPLAY = TYPE_OPTIONS.filter((o) => o.value !== SELECT_ALL);

const DEFAULT_SIZE = 10;

export default function TemplateListPage() {
  // ---- filter UI ----
  const [fileNameInput, setFileNameInput] = useState("");
  const [typeInput, setTypeInput] = useState<string>(SELECT_ALL);

  // ---- filter thực tế gọi API ----
  const [fileName, setFileName] = useState<string | undefined>(undefined);
  const [type, setType] = useState<string>(""); // "" = tất cả

  // ---- phân trang ----
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(DEFAULT_SIZE);

  // ---- query list ----
  const { data, isFetching } = useTemplateList({
    fileName, // "" or undefined
    type, // "" or ?type=
    page,
    size,
    sortBy: "",
    totalRecord: 0,
  });

  const rows = (data?.content ?? []) as Template[];
  const total = data?.totalElements ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const sttBase = useMemo(() => (page - 1) * size, [page, size]);

  // ---- mutations ----
  const addMutation = useAddTemplate();
  const deleteMutation = useDeleteTemplate();
  const download = useTemplateDownload();

  const onSearch = () => {
    const realType = typeInput === SELECT_ALL ? "" : typeInput;
    setType(realType);
    setFileName(fileNameInput);
    setPage(1);
  };

  const handleTypeChange = (val: string) => {
    setTypeInput(val);
    setType(val === SELECT_ALL ? "" : val);
    setPage(1);
  };

  const handleDownload = async (t: Template) => {
    try {
      await download(t.name, t.displayName || t.name);
    } catch {
      ToastUtils.error("Tải xuống thất bại");
    }
  };

  const handleDelete = (t: Template) => {
    if (!confirm("Xóa văn bản mẫu này?")) return;
    deleteMutation.mutate(
      { type: t.type || type, id: t.id },
      {
        onSuccess: () => ToastUtils.success("Đã xóa"),
        onError: () => ToastUtils.error("Xóa thất bại"),
      }
    );
  };

  // ---- Modal Thêm ----
  const [openAdd, setOpenAdd] = useState(false);
  const [uploadType, setUploadType] = useState<string>("");
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const openModal = () => {
    setUploadType("");
    setUploadFiles([]);
    setOpenAdd(true);
  };
  const closeModal = () => setOpenAdd(false);

  const pickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) setUploadFiles((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  const removePicked = (idx: number) =>
    setUploadFiles((prev) => prev.filter((_, i) => i !== idx));

  const saveUpload = () => {
    if (!uploadType) return ToastUtils.error("Chọn loại văn bản mẫu");
    if (!uploadFiles.length) return ToastUtils.error("Chọn ít nhất 1 tệp");

    addMutation.mutate(
      { files: uploadFiles, type: uploadType },
      {
        onSuccess: () => {
          ToastUtils.success("Thêm văn bản mẫu thành công");
          setTypeInput(uploadType);
          setType(uploadType);
          setFileName("");
          setPage(1);
          closeModal();
        },
        onError: () => {
          ToastUtils.error("Thêm thất bại");
        },
      }
    );
  };

  const columns: Column<Template>[] = useMemo(
    () => [
      {
        header: "STT",
        className: "w-[80px] text-center",
        accessor: (_row, idx) => sttBase + idx + 1,
      },
      {
        header: "Tên văn bản mẫu",
        accessor: (r) => r.displayName || r.name,
      },
      {
        header: "Loại văn bản mẫu",
        className: "w-[220px]",
        accessor: (r) =>
          TYPE_DISPLAY.find((o) => o.value === (r.docType ?? ""))?.label ||
          r.type ||
          "-",
      },
      {
        header: "Hành động",
        type: "actions",
        className: "w-[180px] text-right",
        renderActions: (r) => (
          <div className="space-x-2 text-right">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload(r)}
            >
              <Download className="mr-1 h-4 w-4" /> Tải
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => handleDelete(r)}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="mr-1 h-4 w-4" /> Xóa
            </Button>
          </div>
        ),
      },
    ],
    [sttBase, deleteMutation.isPending, handleDownload, handleDelete]
  );

  return (
    <div className="mx-auto p-4">
      <BreadcrumbNavigation
        items={[
          {
            href: "/",
            label: "Quản trị hệ thống",
          },
        ]}
        currentPage="Quản lý văn bản mẫu"
        showHome={false}
      />
      <div
        className="flex flex-row items-center justify-between border rounded-lg p-4 mt-4"
        style={{ backgroundColor: "#E8E9EB" }}
      >
        <div>
          <div className="text-xl font-medium text-gray-900">
            Quản lý văn bản mẫu
          </div>
          <p className="text-sm text-gray-500">
            Danh sách thông tin văn bản mẫu tại đơn vị
          </p>
        </div>
        <Button
          className="flex-shrink-0 text-white font-bold inline-flex items-center justify-center"
          style={{ backgroundColor: "#22c6ab" }}
          onClick={openModal}
        >
          <Plus className="mr-2 h-4 w-4" />
          <span className="leading-none">Thêm văn bản mẫu</span>
        </Button>
      </div>

      <div className="mt-4">
        <div className="mb-4 grid grid-cols-1 gap-3 md:grid-cols-3">
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-muted-foreground">
              Tên văn bản mẫu
            </label>
            <Input
              placeholder="Tên văn bản mẫu"
              value={fileNameInput}
              onChange={(e) => setFileNameInput(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-muted-foreground">
              Loại văn bản mẫu
            </label>
            <SelectCustom
              options={TYPE_OPTIONS}
              value={typeInput}
              onChange={(v) => handleTypeChange(String(v))}
              placeholder="Chọn loại"
              className=""
            />
          </div>

          <div className="flex items-end">
            <Button
              onClick={onSearch}
              className="w-full md:w-auto text-white font-bold bg-blue-600 hover:bg-blue-700"
              disabled={isFetching}
            >
              Tìm kiếm
            </Button>
          </div>
        </div>

        {/* Bảng */}
        <UiTable
          columns={columns}
          dataSource={rows}
          loading={isFetching}
          currentPage={page}
          onPageChange={setPage}
          itemsPerPage={size}
          onItemsPerPageChange={(n) => {
            setSize(n);
            setPage(1);
          }}
          totalItems={total}
          showPageSize
        />

        <div className="mt-3 text-sm text-muted-foreground">
          Tổng: <b>{total}</b> bản ghi ({page}/{Math.max(1, totalPages)})
        </div>
      </div>

      {/* Modal Thêm văn bản mẫu */}
      <Dialog open={openAdd} onOpenChange={setOpenAdd}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Thêm văn bản mẫu</DialogTitle>
          </DialogHeader>

          <div className="space-y-3">
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium">
                Loại văn bản mẫu<span className="text-red-500">*</span>
              </label>
              <SelectCustom
                options={TYPE_DISPLAY}
                value={uploadType}
                onChange={(v) => setUploadType(String(v))}
                placeholder="--Chọn loại văn bản mẫu--"
                className=""
              />
            </div>

            <div className="flex items-center gap-2">
              <input
                ref={inputRef}
                type="file"
                multiple
                className="hidden"
                onChange={pickFiles}
              />
              <Button
                type="button"
                className="bg-emerald-500 hover:bg-emerald-600"
                onClick={() => inputRef.current?.click()}
              >
                Chọn tệp
              </Button>
            </div>

            {uploadFiles.length > 0 && (
              <div className="max-h-56 overflow-auto rounded border p-2">
                {uploadFiles.map((f, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between py-1 text-sm"
                  >
                    <span className="truncate pr-2">{f.name}</span>
                    <button
                      className="p-1 text-muted-foreground hover:text-foreground"
                      onClick={() => removePicked(idx)}
                      title="Xóa"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2">
            <DialogClose asChild>
              <Button variant="outline">Đóng</Button>
            </DialogClose>
            <Button onClick={saveUpload} disabled={addMutation.isPending}>
              Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
