"use client";

import React, { useState } from "react";
import { Edit, Plus, Power, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SearchInput } from "@/components/document-in/SearchInput";
import { Table } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Column } from "@/definitions/types/table.type";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import SelectCustom from "@/components/common/SelectCustom";
import { EmptyDocument } from "@/components/common/EmptyDocument";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useAddApi,
  useApiList,
  useDeleteApi,
  useToggleApiActive,
  useUpdateApi,
} from "@/hooks/data/api.data";
import type { ApiRecord, ApiSearchParams } from "@/definitions/types/api.type";
import { ToastUtils } from "@/utils/toast.utils";
import ConfirmDialog from "@/components/common/ConfirmDialog";

type ApiMethod = "GET" | "POST" | "PUT" | "DELETE";

const METHOD_OPTIONS = [
  { label: "GET", value: "GET" },
  { label: "POST", value: "POST" },
  { label: "PUT", value: "PUT" },
  { label: "DELETE", value: "DELETE" },
];

interface ApiFormData {
  name: string;
  api: string;
  method: ApiMethod;
}

export default function ApiManagement() {
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "all" | "active" | "inactive"
  >("all");
  const [showDialog, setShowDialog] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ApiRecord | null>(null);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ApiRecord | null>(null);
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean;
    type: "delete" | "toggle" | null;
    record: ApiRecord | null;
  }>({
    isOpen: false,
    type: null,
    record: null,
  });

  const [formData, setFormData] = useState<ApiFormData>({
    name: "",
    api: "",
    method: "GET",
  });

  const queryParams: ApiSearchParams = {
    searchKey: searchText,
    size: itemsPerPage,
  };

  if (activeFilter === "active") {
    queryParams.active = true;
  } else if (activeFilter === "inactive") {
    queryParams.active = false;
  }

  const { data: apiData, isLoading } = useApiList(page, queryParams);

  const addApiMutation = useAddApi();
  const updateApiMutation = useUpdateApi();
  const toggleActiveMutation = useToggleApiActive();
  const deleteApiMutation = useDeleteApi();

  const apiList = apiData?.content || [];
  const totalItems = apiData?.totalElements || 0;

  const handleOpenCreateDialog = () => {
    setEditingRecord(null);
    setFormData({ name: "", api: "", method: "GET" as ApiMethod });
    setShowDialog(true);
  };

  const handleOpenEditDialog = (record: ApiRecord) => {
    setEditingRecord(record);
    setFormData({
      name: record.name,
      api: record.api,
      method: record.method as ApiMethod,
    });
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setEditingRecord(null);
    setFormData({ name: "", api: "", method: "GET" as ApiMethod });
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.api.trim()) {
      ToastUtils.requiredField();
      return;
    }

    try {
      if (editingRecord) {
        await updateApiMutation.mutateAsync({
          id: editingRecord.id,
          data: formData,
        });
        ToastUtils.updateSuccess();
      } else {
        await addApiMutation.mutateAsync(formData);
        ToastUtils.createSuccess();
      }
      handleCloseDialog();
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };

  const handleResetForm = () => {
    setFormData({ name: "", api: "", method: "GET" as ApiMethod });
  };

  const handleRowClick = (record: ApiRecord) => {
    setSelectedRecord(record);
    setShowDetailDialog(true);
  };

  const handleDeactivate = async (record: ApiRecord) => {
    setConfirmDialog({
      isOpen: true,
      type: "toggle",
      record: record,
    });
  };

  const handleDelete = async (id: number, record: ApiRecord) => {
    setConfirmDialog({
      isOpen: true,
      type: "delete",
      record: record,
    });
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog.record) return;

    try {
      if (confirmDialog.type === "delete") {
        await deleteApiMutation.mutateAsync(confirmDialog.record.id);
        ToastUtils.deleteSuccess();
      } else if (confirmDialog.type === "toggle") {
        await toggleActiveMutation.mutateAsync(confirmDialog.record.id);
        ToastUtils.updateSuccess();
      }
      setConfirmDialog({ isOpen: false, type: null, record: null });
    } catch (error) {
      console.error("Error performing action:", error);
    }
  };

  const columns: Column<ApiRecord>[] = [
    {
      header: <span className="text-xs font-bold">STT</span>,
      sortable: false,
      className: "text-center w-[5%]",
      accessor: (_item: ApiRecord, idx: number) => (
        <div className="flex justify-center items-center py-1">
          {(page - 1) * itemsPerPage + idx + 1}
        </div>
      ),
    },
    {
      header: "Tên API",
      className: "text-left w-[25%]",
      sortKey: "name",
      accessor: (r: ApiRecord) => (
        <span className="font-medium">{r.name || ""}</span>
      ),
    },
    {
      header: "Đường dẫn API",
      className: "text-left w-[30%]",
      sortKey: "api",
      accessor: (r: ApiRecord) => (
        <span className="text-sm font-mono text-gray-700">{r.api || ""}</span>
      ),
    },
    {
      header: "Phương thức",
      className: "text-center w-[10%]",
      sortKey: "method",
      accessor: (r: ApiRecord) => (
        <span
          className={cn(
            "inline-block px-3 py-1 rounded text-xs font-semibold",
            r.method === "GET" &&
              "bg-green-100 text-green-700 border border-green-300",
            r.method === "POST" &&
              "bg-blue-100 text-blue-700 border border-blue-300",
            r.method === "PUT" &&
              "bg-yellow-100 text-yellow-700 border border-yellow-300",
            r.method === "DELETE" &&
              "bg-red-100 text-red-700 border border-red-300"
          )}
        >
          {r.method || ""}
        </span>
      ),
    },
    {
      header: "Trạng thái",
      className: "text-center w-[10%]",
      sortable: false,
      accessor: (r: ApiRecord) => (
        <span
          className={cn(
            "inline-block px-3 py-1 rounded text-xs font-semibold border",
            r.active
              ? "bg-green-100 text-green-700 border-green-300"
              : "bg-gray-100 text-gray-700 border-gray-300"
          )}
        >
          {r.active ? "Hoạt động" : "Không hoạt động"}
        </span>
      ),
    },
    {
      header: "Thao tác",
      className: "text-center w-[15%]",
      sortable: false,
      accessor: (r: ApiRecord) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-yellow-50"
            onClick={(e) => {
              e.stopPropagation();
              handleDeactivate(r);
            }}
            title={r.active ? "Vô hiệu hóa" : "Kích hoạt"}
            disabled={toggleActiveMutation.isPending}
          >
            <Power
              className={cn(
                "w-4 h-4",
                r.active ? "text-yellow-600" : "text-gray-400"
              )}
            />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-red-50"
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(r.id, r);
            }}
            title="Xóa"
            disabled={deleteApiMutation.isPending}
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="px-4 space-y-4">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <BreadcrumbNavigation
            items={[{ label: "Trang chủ" }]}
            currentPage="Quản lý API"
            showHome={false}
          />

          <div className="flex items-center gap-2">
            <SearchInput
              placeholder="Tìm kiếm tên API hoặc đường dẫn..."
              value={searchText}
              setSearchInput={setSearchText}
            />

            <div className="flex items-center gap-2">
              <Button
                variant={activeFilter === "all" ? "default" : "outline"}
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={() => setActiveFilter("all")}
              >
                Tất cả
              </Button>
              <Button
                variant={activeFilter === "active" ? "default" : "outline"}
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={() => setActiveFilter("active")}
              >
                Hoạt động
              </Button>
              <Button
                variant={activeFilter === "inactive" ? "default" : "outline"}
                size="sm"
                className="h-8 px-3 text-xs"
                onClick={() => setActiveFilter("inactive")}
              >
                Không hoạt động
              </Button>
            </div>

            <Button
              onClick={handleOpenCreateDialog}
              className="h-8 px-3 text-xs bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-1" />
              Thêm API
            </Button>
          </div>
        </div>
      </div>

      <Table
        sortable={true}
        columns={columns}
        dataSource={apiList}
        itemsPerPage={itemsPerPage}
        currentPage={page}
        onPageChange={setPage}
        totalItems={totalItems}
        showPagination
        emptyText={<EmptyDocument />}
        loading={isLoading}
        hasAllChange={false}
        onItemsPerPageChange={(n) => {
          setItemsPerPage(n);
          setPage(1);
        }}
        bgColor="bg-white"
        rowClassName={(_record, index) =>
          index % 2 === 0 ? "bg-white" : "bg-[#0000000d]"
        }
        onRowClick={handleRowClick}
      />

      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent
          className="max-w-2xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              Chi tiết API
            </DialogTitle>
          </DialogHeader>

          {selectedRecord && (
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <Label className="font-bold text-right w-32 flex-shrink-0">
                  Tên API
                </Label>
                <div className="flex-1 text-gray-700">
                  {selectedRecord.name}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Label className="font-bold text-right w-32 flex-shrink-0">
                  Đường dẫn
                </Label>
                <div className="flex-1 font-mono text-sm text-gray-700">
                  {selectedRecord.api}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Label className="font-bold text-right w-32 flex-shrink-0">
                  Phương thức
                </Label>
                <div className="flex-1">
                  <span
                    className={cn(
                      "inline-block px-3 py-1 rounded text-xs font-semibold",
                      selectedRecord.method === "GET" &&
                        "bg-green-100 text-green-700 border border-green-300",
                      selectedRecord.method === "POST" &&
                        "bg-blue-100 text-blue-700 border border-blue-300",
                      selectedRecord.method === "PUT" &&
                        "bg-yellow-100 text-yellow-700 border border-yellow-300",
                      selectedRecord.method === "DELETE" &&
                        "bg-red-100 text-red-700 border border-red-300"
                    )}
                  >
                    {selectedRecord.method}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Label className="font-bold text-right w-32 flex-shrink-0">
                  Trạng thái
                </Label>
                <div className="flex-1">
                  <span
                    className={cn(
                      "inline-block px-3 py-1 rounded text-xs font-semibold border",
                      selectedRecord.active
                        ? "bg-green-100 text-green-700 border-green-300"
                        : "bg-gray-100 text-gray-700 border-gray-300"
                    )}
                  >
                    {selectedRecord.active ? "Hoạt động" : "Không hoạt động"}
                  </span>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex items-center justify-center gap-3">
            <Button
              variant="outline"
              onClick={() => setShowDetailDialog(false)}
              className="h-9 px-6"
            >
              Đóng
            </Button>
            <Button
              onClick={() => {
                if (selectedRecord) {
                  setShowDetailDialog(false);
                  handleOpenEditDialog(selectedRecord);
                }
              }}
              className="h-9 px-6 bg-blue-600 hover:bg-blue-700"
            >
              <Edit className="w-4 h-4 mr-2" />
              Chỉnh sửa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent
          className="max-w-2xl"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">
              {editingRecord ? "Chỉnh sửa API" : "Thêm API mới"}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmitForm}>
            <div className="space-y-4 py-4">
              <div className="flex items-center gap-4">
                <Label className="font-bold text-right w-32 flex-shrink-0">
                  Tên API <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.name}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Tên API"
                  required
                  className="flex-1"
                />
              </div>

              <div className="flex items-center gap-4">
                <Label className="font-bold text-right w-32 flex-shrink-0">
                  Đường dẫn <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={formData.api}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, api: e.target.value }))
                  }
                  placeholder="Đường dẫn API"
                  required
                  className="flex-1 font-mono text-sm"
                />
              </div>

              <div className="flex items-center gap-4">
                <Label className="font-bold text-right w-32 flex-shrink-0">
                  Phương thức <span className="text-red-500">*</span>
                </Label>
                <div className="flex-1">
                  <SelectCustom
                    value={formData.method}
                    onChange={(v) => {
                      const value = (Array.isArray(v) ? v[0] : v) as ApiMethod;
                      setFormData((prev) => ({ ...prev, method: value }));
                    }}
                    options={METHOD_OPTIONS}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="flex items-center justify-center gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={handleCloseDialog}
                className="h-9 px-6"
              >
                Hủy
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleResetForm}
                className="h-9 px-6"
              >
                Đặt lại
              </Button>
              <Button
                type="submit"
                className="h-9 px-6 bg-blue-600 hover:bg-blue-700"
                disabled={
                  addApiMutation.isPending || updateApiMutation.isPending
                }
              >
                {addApiMutation.isPending || updateApiMutation.isPending
                  ? "Đang xử lý..."
                  : editingRecord
                    ? "Cập nhật"
                    : "Thêm mới"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={confirmDialog.isOpen}
        onOpenChange={(change) =>
          setConfirmDialog({ isOpen: change, type: null, record: null })
        }
        title={"Hãy xác nhận"}
        description={
          confirmDialog.type === "delete"
            ? "Bạn có chắc muốn xóa API này? Thao tác này không thể hoàn tác."
            : confirmDialog.type === "toggle" && confirmDialog.record
              ? `Bạn có chắc muốn ${confirmDialog.record.active ? "vô hiệu hóa" : "kích hoạt"} API này?`
              : ""
        }
        onConfirm={handleConfirmAction}
      />
    </div>
  );
}
