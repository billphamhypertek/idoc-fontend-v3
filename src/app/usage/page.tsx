"use client";
import React, { useState } from "react";
import { Usage } from "@/definitions/types/usage.type";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";
import { Column } from "@/definitions";
import { Plus, Edit, Trash2 } from "lucide-react";
import { useGetUsageList, useDeleteUsage } from "@/hooks/data/usage.data";
import { ToastUtils } from "@/utils/toast.utils";
import { handleError } from "@/utils/common.utils";
import UsageModal from "@/components/usage/UsageModal";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/definitions";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";

export default function UsagePage() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [selectedUsage, setSelectedUsage] = useState<Usage | null>(null);
  const [showUsageModal, setShowUsageModal] = useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false);

  // Queries
  const { data: usageList, isLoading, error, refetch } = useGetUsageList();

  // Mutations
  const { mutate: deleteUsage } = useDeleteUsage();

  // Extract data from usage list
  const usages = usageList?.data || [];
  const totalItems = usages.length;

  // Handlers
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  const handleAddUsage = () => {
    setSelectedUsage(null);
    setIsViewMode(false);
    setShowUsageModal(true);
  };

  const handleEditUsage = (usage: Usage) => {
    setSelectedUsage(usage);
    setIsViewMode(false);
    setShowUsageModal(true);
  };

  const handleDeleteUsage = (usage: Usage) => {
    setSelectedUsage(usage);
    setConfirmDelete(true);
  };

  const doDeleteUsage = () => {
    if (!selectedUsage) return;

    deleteUsage(
      { id: selectedUsage.id },
      {
        onSuccess: () => {
          ToastUtils.success("Xóa hướng dẫn sử dụng thành công");
          queryClient.invalidateQueries({
            queryKey: [queryKeys.usage.list],
          });
          setConfirmDelete(false);
          setSelectedUsage(null);
        },
        onError: (error) => {
          handleError(error);
          setConfirmDelete(false);
          setSelectedUsage(null);
        },
      }
    );
  };

  // Table columns
  const usageColumns: Column<Usage>[] = [
    {
      header: (
        <div className="flex justify-center items-center py-1">
          <span className="text-xs font-semibold">STT</span>
        </div>
      ),
      className: "text-center py-1 w-16",
      accessor: (_item: Usage, index: number) => (
        <div className="flex justify-center items-center py-1">
          <span className="text-xs font-medium">
            {(currentPage - 1) * itemsPerPage + index + 1}
          </span>
        </div>
      ),
    },
    {
      header: (
        <div className="flex justify-center items-center py-1">
          <span className="text-xs font-semibold">Tên vai trò</span>
        </div>
      ),
      className: "py-2",
      accessor: (usage: Usage) => (
        <div className="flex items-center gap-2">
          <span className="text-sm">{usage.value}</span>
        </div>
      ),
    },
    {
      header: (
        <div className="flex justify-center items-center py-1">
          <span className="text-xs font-semibold">Tệp hướng dẫn</span>
        </div>
      ),
      className: "py-2",
      accessor: (usage: Usage) => (
        <div className="flex items-center gap-2">
          <span className="text-sm">{usage.label}</span>
        </div>
      ),
    },
    {
      header: (
        <div className="flex justify-center items-center py-1">
          <span className="text-xs font-semibold">Thao tác</span>
        </div>
      ),
      type: "actions",
      className: "text-center py-2 w-24",
      renderActions: (usage: Usage) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="p-1 hover:bg-blue-100 rounded transition-colors"
            onClick={() => handleEditUsage(usage)}
            title="Sửa"
          >
            <Edit className="w-4 h-4 text-blue-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 hover:bg-red-100 rounded transition-colors"
            onClick={() => handleDeleteUsage(usage)}
            title="Xóa"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-2 md:px-4">
      <div className="space-y-4">
        <BreadcrumbNavigation
          items={[
            {
              href: "/",
              label: "Quản trị hệ thống",
            },
          ]}
          currentPage="Quản lý hướng dẫn sử dụng"
          showHome={false}
        />
        <div
          className="flex items-center justify-between border rounded-lg p-4 mt-4"
          style={{ backgroundColor: "#E8E9EB" }}
        >
          <div>
            <div className="font-medium text-gray-900 text-lg">
              Quản lý hướng dẫn sử dụng
            </div>
            <div className="text-gray-500 text-xs">
              Danh sách thông tin hướng dẫn sử dụng
            </div>
          </div>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-3 text-sm font-medium"
            onClick={handleAddUsage}
          >
            <Plus className="w-4 h-4 mr-1" />
            Thêm mới
          </Button>
        </div>

        <Table
          columns={usageColumns}
          dataSource={usages}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          showPagination
          bgColor="bg-white"
          rowClassName={(_item: Usage, index: number) =>
            index % 2 === 0 ? "bg-white" : "bg-[#0000000d]"
          }
          emptyText={
            isLoading
              ? "Đang tải dữ liệu..."
              : error
                ? `Lỗi: ${error.message}`
                : "Không tồn tại dữ liệu"
          }
          onItemsPerPageChange={handleItemsPerPageChange}
          loading={isLoading}
        />

        {/* Usage Modal */}
        <UsageModal
          isOpen={showUsageModal}
          onOpenChange={setShowUsageModal}
          usage={selectedUsage}
          isView={isViewMode}
          onSuccess={() => {
            refetch();
          }}
        />

        {/* Confirmation Dialog */}
        <ConfirmDeleteDialog
          isOpen={confirmDelete}
          onOpenChange={setConfirmDelete}
          onConfirm={doDeleteUsage}
          title="Xác nhận"
          description="Bạn có chắc chắn muốn xóa hướng dẫn sử dụng này?"
          confirmText="Đồng ý"
          cancelText="Hủy"
        />
      </div>
    </div>
  );
}
