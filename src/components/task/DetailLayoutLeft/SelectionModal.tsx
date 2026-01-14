"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import SelectCustom from "@/components/common/SelectCustom";
import { useGetByUserExecute } from "@/hooks/data/task.data";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import { cn } from "@/lib/utils";
import { useGetByUserExecuteV2 } from "@/hooks/data/taskv2.data";

interface SelectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: any) => void;
  type: "parent" | "subtask" | "related";
  title: string;
  userInfo: any;
  currentTaskId?: number;
  selectedItems?: {
    parent?: any;
    subtask?: any[];
    related?: any[];
  };
  isV2?: boolean;
}

export default function SelectionModal({
  isOpen,
  onClose,
  onSelect,
  type,
  title,
  userInfo,
  currentTaskId,
  selectedItems,
  isV2 = false,
}: SelectionModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [assignedWork, setAssignedWork] = useState<boolean>(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<any>(null);

  const getApiParams = () => {
    const baseParams = {
      userId: userInfo?.id || 0,
      assignedWork: true,
      page: currentPage,
      parentId: currentTaskId || 0,
      listId: 0,
    };

    switch (type) {
      case "parent":
        return {
          ...baseParams,
          checkParentId: true,
          listId:
            selectedItems?.subtask && selectedItems?.subtask?.length > 0
              ? selectedItems?.subtask?.map((task) => task.id).join(",")
              : 0,
          parentId: currentTaskId || 0,
        };
      case "subtask":
        return {
          ...baseParams,
          checkParentId: false,
          listId: selectedItems?.parent?.id || 0,
          parentId: currentTaskId || 0,
        };
      case "related":
        return {
          ...baseParams,
          assignedWork: assignedWork,
          checkParentId: selectedItems?.parent?.id ? false : true,
          listId: selectedItems?.parent?.id || 0,
          parentId: currentTaskId || 0,
        };
      default:
        return baseParams;
    }
  };

  // API call
  const {
    data: taskData,
    isLoading,
    error,
  } = useGetByUserExecute(getApiParams(), isOpen && !!userInfo);

  const {
    data: taskDataV2,
    isLoading: isLoadingV2,
    error: errorV2,
  } = useGetByUserExecuteV2(getApiParams(), isOpen && !!userInfo);

  const taskDataMerged = isV2 ? taskDataV2 : taskData;
  const isLoadingMerged = isV2 ? isLoadingV2 : isLoading;
  const errorMerged = isV2 ? errorV2 : error;

  const taskList = (taskDataMerged as any)?.objList || [];

  const filteredData = taskList?.filter((item: any) =>
    item.taskName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const columns = [
    {
      header: "STT",
      accessor: "no" as const,
      className: "w-16 text-center border-r",
    },
    {
      header: "Tên công việc",
      accessor: "taskName" as const,
      className: "w-64 text-center border-r",
    },
    {
      header: "Người giao việc",
      accessor: "userAssign" as const,
      className: "w-32 text-center border-r",
    },
    {
      header: "",
      accessor: "actions" as const,
      className: "w-20 text-center border-r",
    },
  ];

  const handleSelect = (item: any) => {
    onSelect(item);
    if (type === "parent") {
      onClose();
    }
  };

  const handleDeselect = (item: any) => {
    setItemToDelete(item);
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onSelect(itemToDelete);
    setShowDeleteConfirm(false);
    setItemToDelete(null);
  };

  // Check if item is already selected
  const isItemSelected = (item: any) => {
    if (!selectedItems) return false;

    switch (type) {
      case "parent":
        return selectedItems.parent?.id === item.id;
      case "subtask":
        return (
          selectedItems.subtask?.some((task) => task.id === item.id) || false
        );
      case "related":
        return (
          selectedItems.related?.some((task) => task.id === item.id) || false
        );
      default:
        return false;
    }
  };

  const handleClose = () => {
    setSearchTerm("");
    setCurrentPage(1);
    onClose();
  };

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
  };

  // Reset page when assignedWork changes for related type
  useEffect(() => {
    if (type === "related") {
      setCurrentPage(1);
    }
  }, [assignedWork, type]);

  const dataSource = useMemo(() => {
    return (
      filteredData
        ?.filter((item: any) => item.id !== currentTaskId)
        .map((item: any, index: number) => ({
          no: (currentPage - 1) * 10 + index + 1,
          taskName: (
            <div className="font-medium text-blue-600 hover:text-blue-800 cursor-pointer">
              {item.taskName}
            </div>
          ),
          userAssign: item.userAssignName || item.userAssign?.fullName || "N/A",
          status: <Badge variant="outline">{item.statusName || "N/A"}</Badge>,
          actions: (
            <Button
              variant={isItemSelected(item) ? "default" : "outline"}
              size="sm"
              onClick={() =>
                isItemSelected(item) ? handleDeselect(item) : handleSelect(item)
              }
              className={cn(
                "h-8 px-3",
                isItemSelected(item)
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : ""
              )}
            >
              {isItemSelected(item) ? "Bỏ chọn" : "Chọn"}
            </Button>
          ),
        })) || []
    );
  }, [
    filteredData,
    currentTaskId,
    currentPage,
    selectedItems,
    type,
    handleSelect,
    handleDeselect,
  ]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 flex-1 overflow-hidden flex flex-col mt-2">
          {/* Filter for related type */}
          {type === "related" && (
            <div className="flex items-center gap-4">
              <Label className="text-sm font-medium">Loại công việc:</Label>

              <SelectCustom
                className="w-48 focus:ring-0"
                options={[
                  { label: "Việc được giao", value: "true" },
                  { label: "Việc đã giao", value: "false" },
                ]}
                value={assignedWork ? "true" : "false"}
                onChange={(value) => {
                  const normalized = Array.isArray(value) ? value[0] : value;
                  setAssignedWork(normalized === "true");
                }}
                placeholder="Chọn loại công việc"
              />
            </div>
          )}

          {/* Table */}
          <div className="flex-1 overflow-auto">
            {isLoadingMerged ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-gray-500">Đang tải...</div>
              </div>
            ) : errorMerged ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-sm text-red-500">
                  Có lỗi xảy ra khi tải dữ liệu
                </div>
              </div>
            ) : (
              <Table
                columns={columns}
                dataSource={dataSource}
                showPagination={false}
                currentPage={currentPage}
                onPageChange={handlePageChange}
                emptyText="Không có dữ liệu"
                className="mb-3"
                totalItems={taskDataMerged?.totalRecord || 0}
              />
            )}
          </div>
        </div>
      </DialogContent>

      <ConfirmDeleteDialog
        isOpen={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleConfirmDelete}
        title="Hãy xác nhận"
        description={
          type === "parent"
            ? "Bạn muốn xóa công việc mức trên?"
            : type === "subtask"
              ? "Bạn muốn xóa công việc mức dưới?"
              : "Bạn muốn xóa công việc liên quan?"
        }
        confirmText="Đồng ý "
        cancelText="Đóng"
      />
    </Dialog>
  );
}
