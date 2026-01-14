"use client";

import { useState, useMemo, useEffect } from "react";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import RegularFilter from "./RegularFilter";
import { Constant } from "@/definitions/constants/constant";
import { useRegularTaskList, useDeleteRegular } from "@/hooks/data/task.data";
import RegularTable from "./RegularTable";
import RegularModal from "./RegularModal";
import LoadingFull from "@/components/common/LoadingFull";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/definitions";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import { ToastUtils } from "@/utils/toast.utils";

export default function RegularPage() {
  const queryClient = useQueryClient();
  const [paging, setPaging] = useState({
    itemsPerPage: Constant.ITEMS_PER_PAGE,
    currentPage: 1,
    totalRecord: -1,
  });

  const [searchField, setSearchField] = useState({
    taskName: "",
    complexityId: null as string | null,
    orgIds: [] as string[],
  });

  const [searchParams, setSearchParams] = useState({
    taskName: "",
    complexityId: null as string | null,
    orgIds: [] as string[],
  });

  const [modalState, setModalState] = useState<{
    open: boolean;
    task: any | null;
  }>({
    open: false,
    task: null,
  });

  const [isOpenConfirmDeleteDialog, setIsOpenConfirmDeleteDialog] =
    useState(false);
  const [taskToDelete, setTaskToDelete] = useState<any | null>(null);

  const orgId = useMemo(() => {
    if (searchParams.orgIds && searchParams.orgIds.length > 0) {
      const id = searchParams.orgIds[0];
      return typeof id === "string" ? parseInt(id, 10) : id;
    }
    return undefined;
  }, [searchParams.orgIds]);

  const complexityIdNumber = useMemo(() => {
    if (!searchParams.complexityId) return undefined;
    return typeof searchParams.complexityId === "string"
      ? parseInt(searchParams.complexityId, 10)
      : searchParams.complexityId;
  }, [searchParams.complexityId]);

  const { data, isLoading, refetch } = useRegularTaskList(
    paging.currentPage,
    paging.itemsPerPage,
    searchParams.taskName.trim() || undefined,
    orgId,
    complexityIdNumber,
    true
  );

  const deleteMutation = useDeleteRegular();

  const listTask = data?.content || [];

  useEffect(() => {
    if (data) {
      setPaging((prev) => ({
        ...prev,
        totalRecord: data.totalElements || 0,
      }));
    }
  }, [data]);

  const handleReset = () => {
    const resetFields = {
      taskName: "",
      complexityId: null,
      orgIds: [],
    };
    setSearchField(resetFields);
    setSearchParams(resetFields);
    setPaging((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleSearch = () => {
    setSearchParams({ ...searchField });
    setPaging((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPaging((prev) => ({ ...prev, currentPage: page }));
  };

  const handlePageSizeChange = (size: number) => {
    setPaging({
      itemsPerPage: size,
      currentPage: 1,
      totalRecord: paging.totalRecord,
    });
  };

  const handleAddNew = () => {
    setModalState({ open: true, task: null });
  };

  const handleEditTask = (task: any) => {
    setModalState({ open: true, task });
  };

  const handleModalSuccess = () => {
    queryClient.invalidateQueries({
      queryKey: [queryKeys.task.regularList],
    });
    refetch();
  };

  const handleDeleteTask = async () => {
    if (!taskToDelete?.regularTaskId) return;

    try {
      await deleteMutation.mutateAsync(taskToDelete.regularTaskId);
      ToastUtils.success("Xóa công việc thành công", "Thành công");
      setIsOpenConfirmDeleteDialog(false);
      setTaskToDelete(null);
      refetch();
    } catch (error) {
      ToastUtils.error("Có lỗi xảy ra khi xóa công việc", "Lỗi");
    }
  };

  const handleRowClick = (task: any) => {
    handleEditTask(task);
  };

  return (
    <div className="px-4 py-0">
      <BreadcrumbNavigation
        items={[
          {
            label: "Quản lý công việc",
            href: "/task/regular",
          },
        ]}
        currentPage="Danh sách công việc thường xuyên"
        showHome={false}
      />
      <RegularFilter
        searchField={searchField}
        setSearchField={setSearchField}
        onSearch={handleSearch}
        onAddNew={handleAddNew}
        onReset={handleReset}
      />
      <RegularTable
        data={listTask}
        isLoading={isLoading}
        paging={paging}
        onPageChange={handlePageChange}
        onItemsPerPageChange={handlePageSizeChange}
        onRowClick={handleRowClick}
        deleteTask={(task: any) => {
          setTaskToDelete(task);
          setIsOpenConfirmDeleteDialog(true);
        }}
      />
      <LoadingFull isLoading={isLoading} />

      <RegularModal
        open={modalState.open}
        onOpenChange={(open) => setModalState({ ...modalState, open })}
        task={modalState.task}
        onSuccess={handleModalSuccess}
      />

      <ConfirmDeleteDialog
        isOpen={isOpenConfirmDeleteDialog}
        onOpenChange={setIsOpenConfirmDeleteDialog}
        onConfirm={handleDeleteTask}
        title="Xác nhận xóa"
        description="Bạn có chắc chắn muốn xóa công việc này không?"
        confirmText="Xóa"
        cancelText="Đóng"
        positionButton={true}
      />
    </div>
  );
}
