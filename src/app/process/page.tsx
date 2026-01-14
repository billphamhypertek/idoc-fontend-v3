"use client";
import React, { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAddProcess,
  useDeleteProcess,
  useGetProcessDetailQuery,
  useGetProcessListQuery,
  useUpdateProcess,
  useUpdateProcessDetail,
} from "@/hooks/data/process.data";
import { Column, queryKeys } from "@/definitions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Pencil,
  Search,
  Trash2,
  Unlock,
  Lock,
  Settings,
  Plus,
} from "lucide-react";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import { Table } from "@/components/ui/table";
import { Process, ProcessRequest } from "@/definitions/types/process.type";
import { ToastUtils } from "@/utils/toast.utils";
import SelectCustom from "@/components/common/SelectCustom";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import { handleError } from "@/utils/common.utils";
import AddUpdateProcessModal from "@/components/dialogs/AddUpdateProcessModal";
import { useRouter } from "next/navigation";

const defaultSearchState = {
  type: "All",
  name: "",
  orgId: "",
  page: 1,
  sortBy: "",
  direction: "DESC",
  size: 10,
};

const DOCUMENT_TYPES = [
  { id: "All", name: "Tất cả" },
  { id: "INCOMING", name: "Văn bản đến" },
  { id: "OUTCOMING", name: "Văn bản đi" },
  { id: "CONSULT", name: "Xin ý kiến văn bản đi" },
  { id: "WORD_EDITOR", name: "Soạn thảo văn bản" },
  { id: "EXAM_FOR_OTHERS", name: "Thử nghiệm" },
  { id: "CABINET_DRAFT", name: "Cabinet-Dự thảo" },
  { id: "ASSIGN", name: "Giao việc" },
];

type SearchState = typeof defaultSearchState;

export default function ProcessPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [searchParams, setSearchParams] =
    useState<SearchState>(defaultSearchState);
  const [tempSearchParams, setTempSearchParams] =
    useState<SearchState>(defaultSearchState);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // State for modal
  const [selectedProcess, setSelectedProcess] = useState<Process | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [processDetail, setProcessDetail] = useState<ProcessRequest | null>(
    null
  );
  const [confirmChangeProcessStatus, setConfirmChangeProcessStatus] =
    useState(false);
  const [confirmDeleteProcess, setConfirmDeleteProcess] = useState(false);
  const [errors, setErrors] = useState<{ [k: string]: string }>({});
  const advanceParams = useMemo(
    () => ({
      page: currentPage,
      size: itemsPerPage,
      direction: searchParams.direction,
      sortBy: searchParams.sortBy,
      type: searchParams.type === "All" ? null : searchParams.type,
      name: searchParams.name ?? null,
    }),
    [searchParams, currentPage, itemsPerPage]
  );

  const { mutate: doUpdateProcess } = useUpdateProcess();
  const { mutate: doUpdateProcessDetail } = useUpdateProcessDetail();
  const { mutate: doAddProcess } = useAddProcess();
  const { mutate: doDeleteProcess } = useDeleteProcess();
  const { mutate: doGetProcessDetail } = useGetProcessDetailQuery();
  const {
    data: currentData,
    isLoading,
    error,
  } = useGetProcessListQuery(advanceParams);

  const totalItems: number = currentData?.totalElements || 0;
  const totalPages: number = currentData?.totalPages || 0;
  const processList: Process[] = currentData?.content || [];

  const handleSearchSubmit = () => {
    setCurrentPage(1);
    setSearchParams((prev) => ({
      ...prev,
      ...tempSearchParams,
    }));
  };

  const handleSearchReset = () => {
    setSearchParams(defaultSearchState);
    setTempSearchParams(defaultSearchState);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getDocumentTypeName = (type: string) => {
    return DOCUMENT_TYPES.find((item) => item.id === type)?.name;
  };

  const handleUpdateProcessStatus = () => {
    const payload = {
      ...selectedProcess,
      active: !selectedProcess?.active,
    };
    doUpdateProcess(
      { payload: payload as Process },
      {
        onSuccess: () => {
          ToastUtils.success(
            selectedProcess?.active
              ? "Ngừng kích hoạt luồng xử lý thành công"
              : "Kích hoạt luồng xử lý thành công"
          );
          queryClient.invalidateQueries({
            queryKey: [queryKeys.bpmn.search, advanceParams],
          });
          setConfirmChangeProcessStatus(false);
          setSelectedProcess(null);
        },
        onError: (error) => {
          handleError(error);
          setConfirmChangeProcessStatus(false);
          setSelectedProcess(null);
        },
      }
    );
  };

  const handleDeleteProcess = () => {
    doDeleteProcess(
      { id: selectedProcess?.id as number },
      {
        onSuccess: () => {
          ToastUtils.success("Xóa luồng xử lý thành công");
          queryClient.invalidateQueries({
            queryKey: [queryKeys.bpmn.search, advanceParams],
          });
          setConfirmDeleteProcess(false);
          setSelectedProcess(null);
        },
        onError: (error) => {
          handleError(error);
          setConfirmDeleteProcess(false);
          setSelectedProcess(null);
        },
      }
    );
  };

  const onEditProcess = (process: Process) => {
    doGetProcessDetail(
      { id: process.id },
      {
        onSuccess: (data) => {
          setProcessDetail(data);
          setSelectedProcess(process);
          setIsEditModalOpen(true);
        },
        onError: (error) => {
          handleError(error);
        },
      }
    );
  };

  const handleAddProcess = (process: ProcessRequest) => {
    doAddProcess(
      { payload: process },
      {
        onSuccess: () => {
          ToastUtils.success("Thêm luồng thành công");
          queryClient.invalidateQueries({
            queryKey: [queryKeys.bpmn.search, advanceParams],
          });
          setIsAddModalOpen(false);
        },
        onError: (error) => {
          const messageData = (error as any)?.response?.data?.message;
          let duplicate = false;
          if (messageData) {
            if (
              typeof messageData === "string" &&
              messageData.includes("Duplicate")
            ) {
              duplicate = true;
            } else if (
              typeof messageData === "object" &&
              typeof messageData.message === "string" &&
              messageData.message.includes("Duplicate")
            ) {
              duplicate = true;
            }
          }
          if (duplicate) {
            setErrors({
              name: "Tên luồng đã được đăng ký",
            });
          } else {
            handleError(error);
          }
        },
      }
    );
  };

  const handleEditProcess = (process: ProcessRequest) => {
    doUpdateProcessDetail(
      { payload: process },
      {
        onSuccess: () => {
          ToastUtils.success("Cập nhật luồng thành công");
          queryClient.invalidateQueries({
            queryKey: [queryKeys.bpmn.search, advanceParams],
          });
          setIsEditModalOpen(false);
        },
        onError: (error) => {
          handleError(error);
        },
      }
    );
  };

  const SearchSection = useMemo(
    () => (
      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-8">
          <div className="space-y-2 flex-1 w-full">
            <div className="font-bold text-sm">Tên luồng</div>
            <div>
              <Input
                className="h-9 text-sm"
                placeholder="Nhập tên luồng…"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setTempSearchParams((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                value={tempSearchParams.name}
              />
            </div>
          </div>
          <div className="space-y-2 flex-1 w-full">
            <div className="font-bold text-sm">Quy trình áp dụng</div>
            <div className="flex-1 min-w-0">
              <SelectCustom
                options={DOCUMENT_TYPES}
                value={tempSearchParams.type}
                onChange={(value: string | string[]) =>
                  setTempSearchParams((prev) => {
                    const newValue = Array.isArray(value) ? value[0] : value;
                    return {
                      ...prev,
                      type: newValue,
                    };
                  })
                }
                placeholder="Tất cả"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-center lg:justify-end gap-2">
          <Button
            size="sm"
            onClick={handleSearchSubmit}
            className="h-9 px-3 text-xs bg-blue-600 hover:bg-blue-700"
          >
            <Search className="w-3 h-3 mr-1" />
            Tìm kiếm
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSearchReset}
            className="h-9 px-3 text-xs"
          >
            <Search className="w-3 h-3 mr-1" />
            Đặt lại
          </Button>
        </div>
      </div>
    ),
    [tempSearchParams, handleSearchSubmit, handleSearchReset]
  );

  const processColumns: Column<Process>[] = [
    {
      header: "STT",
      accessor: (item: Process, index: number) =>
        (currentPage - 1) * itemsPerPage + index + 1,
      className: "w-3 text-center border-r",
    },
    {
      header: "Tên luồng",
      accessor: (item: Process) => item.name,
      className: "w-10 text-center border-r",
    },
    {
      header: "Loại đối tượng",
      accessor: (item: Process) => getDocumentTypeName(item.typeDocument),
      className: "w-10 text-center border-r",
    },
    {
      header: "Đơn vị",
      accessor: (item: Process) => item.orgName,
      className: "w-10 text-center border-r",
    },
    {
      header: "Cấu hình",
      type: "actions" as const,
      className: "text-center py-2 w-16 border-r",
      renderActions: (item: Process) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-7 p-0 hover:bg-blue-50"
            onClick={() => router.push(`/process/config/${item.id}`)}
            title="Cấu hình sơ đồ"
          >
            <Settings className="h-4 w-4 text-blue-600" />
          </Button>
        </div>
      ),
    },
    {
      header: "Thao tác",
      type: "actions" as const,
      className: "text-center py-2 w-16",
      renderActions: (item: Process) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-7 p-0 hover:bg-blue-50"
            onClick={() => {
              onEditProcess(item);
            }}
          >
            <Pencil className="h-4 w-4 text-blue-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 hover:bg-green-100 rounded transition-colors"
            title={item.active ? "Ngừng kích hoạt" : "Kích hoạt"}
            onClick={() => {
              setSelectedProcess(item);
              setConfirmChangeProcessStatus(true);
            }}
          >
            {item.active ? (
              <Unlock className="h-4 w-4 text-green-600" />
            ) : (
              <Lock className="h-4 w-4 text-red-600" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-7 p-0 hover:bg-blue-50"
            onClick={() => {
              setSelectedProcess(item);
              setConfirmDeleteProcess(true);
            }}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4 px-4">
      <div className="flex items-center justify-between">
        <BreadcrumbNavigation
          items={[
            {
              href: "/",
              label: "Quản trị hệ thống",
            },
          ]}
          currentPage="Danh sách luồng"
          showHome={false}
        />
      </div>
      <div
        className="flex items-center justify-between border rounded-lg p-4"
        style={{ backgroundColor: "#E8E9EB" }}
      >
        <div>
          <div className="text-gray-900 text-xl font-bold">
            Quản lý luồng xử lý
          </div>
          <div className="text-gray-500 text-xs">
            Danh sách thông tin luồng xử lý văn bản đến, văn bản đi tại đơn vị
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 text-sm font-medium"
            onClick={() => setIsAddModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm mới
          </Button>
        </div>
      </div>
      {SearchSection}
      <Table
        sortable
        columns={processColumns}
        dataSource={processList}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        showPagination
        bgColor="bg-white"
        rowClassName={(_item: Process, index: number) =>
          index % 2 === 0 ? "bg-white" : "bg-[#0000000d]"
        }
        emptyText={
          isLoading
            ? "Đang tải dữ liệu..."
            : error
              ? `Lỗi: ${error && typeof error === "object" && "message" in error ? ((error as { message?: string }).message ?? "Không xác định") : "Không xác định"}`
              : "Không tồn tại luồng"
        }
        onItemsPerPageChange={(size: number) => {
          setItemsPerPage(size);
          setCurrentPage(1);
        }}
        loading={isLoading}
      />

      <ConfirmDeleteDialog
        isOpen={confirmChangeProcessStatus}
        onOpenChange={setConfirmChangeProcessStatus}
        onConfirm={handleUpdateProcessStatus}
        title="Hãy xác nhận"
        description={
          selectedProcess?.active
            ? "Bạn có muốn ngừng kích hoạt luồng xử lý?"
            : "Bạn có muốn kích hoạt luồng xử lý?"
        }
        confirmText="Đồng ý"
        cancelText="Đóng"
      />

      <ConfirmDeleteDialog
        isOpen={confirmDeleteProcess}
        onOpenChange={setConfirmDeleteProcess}
        onConfirm={handleDeleteProcess}
        title="Hãy xác nhận"
        description="Bạn có muốn xóa luồng xử lý?"
        confirmText="Đồng ý"
        cancelText="Đóng"
      />

      <AddUpdateProcessModal
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSave={handleAddProcess}
        loading={false}
        isEdit={false}
        processData={null}
        errorSubmit={errors}
      />

      <AddUpdateProcessModal
        isOpen={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        onSave={handleEditProcess}
        loading={false}
        isEdit={true}
        processData={processDetail}
      />
    </div>
  );
}
