"use client";
import React, { useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Column, queryKeys } from "@/definitions";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import { Table } from "@/components/ui/table";
import { ToastUtils } from "@/utils/toast.utils";
import {
  AddDelegateFlow,
  DelegateFlow,
} from "@/definitions/types/delegate_flow.type";
import {
  useAddDelegateFlow,
  useDeleteDelegateFlow,
  useGetDelegateFlowListQuery,
} from "@/hooks/data/delegate_flow.data";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import { useGetCategoriesByCode } from "@/hooks/data/category.data";
import { Constant } from "@/definitions/constants/constant";
import AddDelegateFlowModal from "@/components/dialogs/AddDelegateFlowModal";

export default function DelegateFlowPage() {
  const queryClient = useQueryClient();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // State for modal
  const [delegateFlowIdToDelete, setDelegateFlowIdToDelete] = useState<
    number | null
  >(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const advanceParams = useMemo(
    () => ({
      page: currentPage,
      size: itemsPerPage,
      direction: "DESC",
      sortBy: "",
    }),
    [currentPage, itemsPerPage]
  );

  const {
    data: delegateFlowList,
    isLoading: isDelegateFlowListLoading,
    error: delegateFlowListError,
  } = useGetDelegateFlowListQuery(advanceParams);
  const { data: positionList } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.USER_POSITION
  );
  const { mutate: addDelegateFlow } = useAddDelegateFlow();
  const { mutate: deleteDelegateFlow } = useDeleteDelegateFlow();

  const totalItems: number = delegateFlowList?.totalElements || 0;
  const totalPages: number = delegateFlowList?.totalPages || 0;
  const delegateFlowListData: DelegateFlow[] = delegateFlowList?.content || [];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleAddDelegateFlow = (delegateFlow: AddDelegateFlow) => {
    addDelegateFlow(delegateFlow, {
      onSuccess: () => {
        ToastUtils.success("Thêm luồng ủy quyền thành công");
        setIsAddModalOpen(false);
        queryClient.invalidateQueries({
          queryKey: [queryKeys.delegateFlow.getList, advanceParams],
        });
      },
      onError: () => {
        ToastUtils.error("Thêm luồng ủy quyền thất bại");
      },
    });
  };

  const doDeleteDelegateFlow = () => {
    if (delegateFlowIdToDelete) {
      deleteDelegateFlow(delegateFlowIdToDelete, {
        onSuccess: () => {
          ToastUtils.success("Xóa luồng ủy quyền thành công");
          setIsDeleteModalOpen(false);
          setDelegateFlowIdToDelete(null);
          queryClient.invalidateQueries({
            queryKey: [queryKeys.delegateFlow.getList, advanceParams],
          });
        },
        onError: () => {
          ToastUtils.error("Xóa luồng ủy quyền thất bại");
        },
      });
    }
  };

  const delegateFlowColumns: Column<DelegateFlow>[] = [
    {
      header: "STT",
      accessor: (item: DelegateFlow, index: number) => index + 1,
      className: "w-3 text-center border-r",
    },
    {
      header: "Chức danh ủy quyền",
      accessor: (item: DelegateFlow) => item.fromPosition,
      className: "w-10 text-center border-r",
    },
    {
      header: "Chức danh được ủy quyền",
      accessor: (item: DelegateFlow) => item.toPosition,
      className: "w-10 text-center border-r",
    },
    {
      header: "Thao tác",
      type: "actions" as const,
      className: "text-center py-2 w-16",
      renderActions: (item: DelegateFlow) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-7 p-0 hover:bg-red-50"
            onClick={() => {
              setDelegateFlowIdToDelete(item.id);
              setIsDeleteModalOpen(true);
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
          currentPage="Quản lý luồng ủy quyền"
          showHome={false}
        />
      </div>
      <div
        className="flex items-center justify-between border rounded-lg p-4"
        style={{ backgroundColor: "#E8E9EB" }}
      >
        <div>
          <div className="font-medium text-gray-900 text-lg">
            Quản lý luồng ủy quyền
          </div>
          <div className="text-gray-500 text-xs mt-1">
            Hiển thị thông tin luồng uỷ quyền
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
      <Table
        sortable
        columns={delegateFlowColumns}
        dataSource={delegateFlowListData}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        showPagination
        bgColor="bg-white"
        rowClassName={(_item: DelegateFlow, index: number) =>
          index % 2 === 0 ? "bg-white" : "bg-[#0000000d]"
        }
        emptyText={
          isDelegateFlowListLoading
            ? "Đang tải dữ liệu..."
            : delegateFlowListError
              ? `Lỗi: ${delegateFlowListError && typeof delegateFlowListError === "object" && "message" in delegateFlowListError ? ((delegateFlowListError as { message?: string }).message ?? "Không xác định") : "Không xác định"}`
              : "Không tồn tại luồng ủy quyền"
        }
        onItemsPerPageChange={(size: number) => {
          setItemsPerPage(size);
          setCurrentPage(1);
        }}
        loading={isDelegateFlowListLoading}
      />

      <ConfirmDeleteDialog
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={doDeleteDelegateFlow}
        title="Hãy xác nhận"
        description="Bạn muốn xóa luồng ủy quyền này?"
        confirmText="Đồng ý"
        cancelText="Đóng"
      />

      {/* Modal for update/edit */}
      <AddDelegateFlowModal
        isOpen={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onSave={handleAddDelegateFlow}
        positionList={positionList || []}
        loading={false}
      />
    </div>
  );
}
