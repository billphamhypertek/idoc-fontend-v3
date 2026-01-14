"use client";

import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import OutSysAddEditModal from "@/components/dialogs/OutSysAddEditModal";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Column, queryKeys } from "@/definitions";
import { OutSys, OutSysHistory } from "@/definitions/types/out-sys.type";
import {
  useAddNewOutSys,
  useActiveOutSys,
  useDeactiveOutSys,
  useGetOutSystemListQuery,
  useUpdateOutSys,
  useDeleteOutSys,
  useCreateLinkOutSys,
  useGetOutSystemHistoryListQuery,
} from "@/hooks/data/out-sys.data";
import { handleError } from "@/utils/common.utils";
import { ToastUtils } from "@/utils/toast.utils";
import { useQueryClient } from "@tanstack/react-query";
import { Edit, Link2, Lock, Plus, Trash2, Unlock } from "lucide-react";
import { useMemo, useState } from "react";

export default function OutSysPage() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [currentPageHistory, setCurrentPageHistory] = useState(1);
  const [itemsPerPageHistory, setItemsPerPageHistory] = useState<number>(10);

  // State for modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [selectedOutSystem, setSelectedOutSystem] = useState<OutSys | null>(
    null
  );
  const [confirmDeactiveOutSys, setConfirmDeactiveOutSys] = useState(false);
  const [confirmActiveOutSys, setConfirmActiveOutSys] = useState(false);

  const advanceParams = useMemo(
    () => ({
      page: currentPage,
      size: itemsPerPage,
    }),
    [currentPage, itemsPerPage]
  );

  const advanceHistoryParams = useMemo(
    () => ({
      page: currentPageHistory,
      size: itemsPerPageHistory,
    }),
    [currentPageHistory, itemsPerPageHistory]
  );

  const {
    data: currentData,
    isLoading,
    error,
  } = useGetOutSystemListQuery(advanceParams);

  const {
    data: historyData,
    isLoading: isLoadingHistory,
    error: errorHistory,
  } = useGetOutSystemHistoryListQuery(advanceHistoryParams);
  const { mutate: addNewOutSys } = useAddNewOutSys();
  const { mutate: updateOutSys } = useUpdateOutSys();
  const { mutate: deactiveOutSys } = useDeactiveOutSys();
  const { mutate: activeOutSys } = useActiveOutSys();
  const { mutate: deleteOutSys } = useDeleteOutSys();
  const { mutate: createLinkOutSys } = useCreateLinkOutSys();

  const outSystemList: OutSys[] = currentData?.content || [];
  const historyList: OutSysHistory[] = historyData?.content || [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageHistoryChange = (page: number) => {
    setCurrentPageHistory(page);
  };

  const handleItemsPerPageHistoryChange = (size: number) => {
    setItemsPerPageHistory(size);
    setCurrentPageHistory(1);
  };

  const handleOpenAddModal = () => {
    setSelectedOutSystem(null);
    setIsAddEditModalOpen(true);
  };

  const handleEditOutSys = (item: OutSys) => {
    setSelectedOutSystem(item);
    setIsAddEditModalOpen(true);
  };

  const handleDeleteOutSys = (item: OutSys) => {
    setSelectedOutSystem(item);
    setIsDeleteModalOpen(true);
  };

  const handleToggleOutSysStatus = (item: OutSys) => {
    setSelectedOutSystem(item);
    if (item.active) {
      setConfirmDeactiveOutSys(true);
    } else {
      setConfirmActiveOutSys(true);
    }
  };

  const handleAddOutSys = (item: OutSys) => {
    addNewOutSys(
      { payload: item },
      {
        onSuccess: () => {
          ToastUtils.success("Thêm mới hệ thống liên kết ngoài thành công");
          queryClient.invalidateQueries({
            queryKey: [queryKeys.outSys.getList, advanceParams],
          });
          setIsAddEditModalOpen(false);
          setSelectedOutSystem(null);
        },
        onError: (error: any) => {
          handleError(error);
        },
      }
    );
  };

  const handleUpdateOutSys = (item: OutSys) => {
    updateOutSys(
      { payload: item },
      {
        onSuccess: () => {
          ToastUtils.success("Cập nhật hệ thống liên kết ngoài thành công");
          queryClient.invalidateQueries({
            queryKey: [queryKeys.outSys.getList, advanceParams],
          });
          setIsAddEditModalOpen(false);
          setSelectedOutSystem(null);
        },
        onError: (error: any) => {
          handleError(error);
        },
      }
    );
  };

  const handleDeactiveOutSys = () => {
    if (selectedOutSystem) {
      deactiveOutSys(
        { id: selectedOutSystem.id },
        {
          onSuccess: () => {
            ToastUtils.success(
              "Ngừng kích hoạt hệ thống liên kết ngoài thành công"
            );
            queryClient.invalidateQueries({
              queryKey: [queryKeys.outSys.getList, advanceParams],
            });
            setConfirmDeactiveOutSys(false);
            setSelectedOutSystem(null);
          },
          onError: (error) => {
            ToastUtils.error("Lỗi khi ngừng kích hoạt hệ thống liên kết ngoài");
            setConfirmDeactiveOutSys(false);
            setSelectedOutSystem(null);
          },
        }
      );
    }
  };

  const handleActiveOutSys = () => {
    if (selectedOutSystem) {
      activeOutSys(
        { id: selectedOutSystem.id },
        {
          onSuccess: () => {
            ToastUtils.success("Kích hoạt hệ thống liên kết ngoài thành công");
            queryClient.invalidateQueries({
              queryKey: [queryKeys.outSys.getList, advanceParams],
            });
            setConfirmActiveOutSys(false);
            setSelectedOutSystem(null);
          },
          onError: (error) => {
            ToastUtils.error("Lỗi khi kích hoạt hệ thống liên kết ngoài");
            setConfirmActiveOutSys(false);
            setSelectedOutSystem(null);
          },
        }
      );
    }
  };

  const handleConfirmDeleteOutSys = () => {
    if (selectedOutSystem) {
      deleteOutSys(selectedOutSystem.id, {
        onSuccess: () => {
          ToastUtils.success("Xóa hệ thống liên kết ngoài thành công");
          queryClient.invalidateQueries({
            queryKey: [queryKeys.outSys.getList, advanceParams],
          });
          setIsDeleteModalOpen(false);
          setSelectedOutSystem(null);
        },
        onError: () => {
          ToastUtils.error("Lỗi khi xóa hệ thống liên kết ngoài");
          setIsDeleteModalOpen(false);
          setSelectedOutSystem(null);
        },
      });
    }
  };

  const handleLinkOutSys = (item: OutSys) => {
    createLinkOutSys(
      { payload: item },
      {
        onSuccess: () => {
          ToastUtils.success("Tạo liên kết hệ thống liên kết ngoài thành công");
          queryClient.invalidateQueries({
            queryKey: [queryKeys.outSys.getList, advanceParams],
          });
        },
        onError: (error) => {
          handleError(error);
        },
      }
    );
  };

  const handleConnectOutSys = (item: OutSys) => {
    createLinkOutSys(
      { payload: item },
      {
        onSuccess: () => {
          ToastUtils.success("Tạo liên kết hệ thống liên kết ngoài thành công");
        },
        onError: (error: any) => {
          handleError(error);
        },
      }
    );
  };

  const outSystemColumns: Column<OutSys>[] = [
    {
      header: "STT",
      accessor: (item: OutSys, index: number) => index + 1,
      className: "w-12 min-w-12 max-w-12 text-center border-r",
    },
    {
      header: "Tên hệ thống",
      accessor: (item: OutSys) => item.name,
      className: "text-left border-r px-2",
    },
    {
      header: "URL",
      accessor: (item: OutSys) => item.domain,
      className: "text-left border-r px-2",
    },
    {
      header: "Khoá liên kết",
      accessor: (item: OutSys) => item.key,
      className: "text-left border-r px-2",
    },
    {
      header: "Thao tác",
      type: "actions" as const,
      className: "text-center py-2 w-16 min-w-16 max-w-16",
      renderActions: (item: OutSys) => (
        <TooltipProvider>
          <div className="flex flex-col items-center justify-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => handleLinkOutSys(item)}
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-blue-50"
                >
                  <Link2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Kết nối</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => handleEditOutSys(item)}
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-blue-50"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sửa</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => handleToggleOutSysStatus(item)}
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0 hover:bg-gray-50"
                >
                  {item.active ? (
                    <Unlock className="h-4 w-4 text-green-600" />
                  ) : (
                    <Lock className="h-4 w-4 text-red-600" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{item.active ? "Khóa" : "Mở khóa"}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 hover:bg-red-50"
                  onClick={() => handleDeleteOutSys(item)}
                >
                  <Trash2 className="h-4 w-4 text-red-600" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Xóa</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      ),
    },
  ];

  const historyColumns: Column<OutSysHistory>[] = [
    {
      header: "STT",
      accessor: (item: OutSysHistory, index: number) => index + 1,
      className: "w-3 text-center border-r",
    },
    {
      header: "Tên hệ thống",
      accessor: (item: OutSysHistory) => item.name,
      className: "w-10 text-center border-r",
    },
    {
      header: "URL",
      accessor: (item: OutSysHistory) => item.domain,
      className: "w-10 text-center border-r",
    },
    {
      header: "Hành động",
      accessor: (item: OutSysHistory) => item.action,
      className: "w-10 text-center border-r",
    },
    {
      header: "Sơ lược",
      accessor: (item: OutSysHistory) => item.summary,
      className: "w-10 text-center border-r",
    },
    {
      header: "Kết quả",
      accessor: (item: OutSysHistory) => item.result,
      className: "w-10 text-center border-r",
    },
  ];

  return (
    <div className="container mx-auto px-4">
      <BreadcrumbNavigation
        items={[
          {
            href: "/",
            label: "Quản trị hệ thống",
          },
        ]}
        currentPage="Quản trị hệ thống liên kết ngoài"
        showHome={false}
      />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-4">
        {/* Left Column - Role List */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="text-lg font-semibold mb-1">
                  Danh sách hệ thống liên kết ngoài
                </h4>
              </div>
              <Button
                onClick={handleOpenAddModal}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="overflow-x-hidden">
              <Table
                dataSource={outSystemList}
                columns={outSystemColumns}
                showPagination={true}
                sortable={false}
                bgColor="bg-white"
                rowClassName={(_item: OutSys, index: number) =>
                  index % 2 === 0 ? "bg-white" : "bg-[#0000000d]"
                }
                loading={isLoading}
                emptyText={
                  isLoading
                    ? "Đang tải dữ liệu..."
                    : error
                      ? `Lỗi: ${error && typeof error === "object" && "message" in error ? ((error as { message?: string }).message ?? "Không xác định") : "Không xác định"}`
                      : "Không tồn tại hệ thống liên kết ngoài"
                }
                onPageChange={handlePageChange}
                onItemsPerPageChange={(size: number) => {
                  setItemsPerPage(size);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-1">
                Lịch sử liên kết ngoài
              </h4>
            </div>

            <div className="overflow-x-auto">
              <Table
                dataSource={historyList}
                columns={historyColumns}
                showPagination={true}
                sortable={false}
                loading={isLoadingHistory}
                bgColor="bg-white"
                rowClassName={(_item: OutSysHistory, index: number) =>
                  index % 2 === 0 ? "bg-white" : "bg-[#0000000d]"
                }
                emptyText={
                  isLoadingHistory
                    ? "Đang tải dữ liệu..."
                    : errorHistory
                      ? `Lỗi: ${errorHistory && typeof errorHistory === "object" && "message" in errorHistory ? ((errorHistory as { message?: string }).message ?? "Không xác định") : "Không xác định"}`
                      : "Không tồn tại lịch sử liên kết ngoài"
                }
                onPageChange={handlePageHistoryChange}
                onItemsPerPageChange={handleItemsPerPageHistoryChange}
              />
            </div>
          </div>
        </div>
      </div>

      <OutSysAddEditModal
        isOpen={isAddEditModalOpen}
        onOpenChange={setIsAddEditModalOpen}
        onSave={selectedOutSystem ? handleUpdateOutSys : handleAddOutSys}
        outSysData={selectedOutSystem}
        onConnectOutSys={handleConnectOutSys}
        existingSystems={outSystemList}
      />

      <ConfirmDeleteDialog
        isOpen={confirmDeactiveOutSys}
        onOpenChange={setConfirmDeactiveOutSys}
        onConfirm={handleDeactiveOutSys}
        title="Hãy xác nhận"
        description="Bạn có muốn ngừng kích hoạt hệ thống liên kết ngoài?"
        confirmText="Đồng ý"
        cancelText="Đóng"
      />
      <ConfirmDeleteDialog
        isOpen={confirmActiveOutSys}
        onOpenChange={setConfirmActiveOutSys}
        onConfirm={handleActiveOutSys}
        title="Hãy xác nhận"
        description="Bạn có muốn kích hoạt hệ thống liên kết ngoài?"
        confirmText="Đồng ý"
        cancelText="Đóng"
      />
      <ConfirmDeleteDialog
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={handleConfirmDeleteOutSys}
        title="Hãy xác nhận"
        description="Bạn có muốn xóa hệ thống liên kết ngoài?"
        confirmText="Đồng ý"
        cancelText="Đóng"
      />
    </div>
  );
}
