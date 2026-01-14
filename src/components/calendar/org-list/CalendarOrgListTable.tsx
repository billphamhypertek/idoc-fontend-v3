"use client";

import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";
import { Column } from "@/definitions/types";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { useState } from "react";
import {
  useDeleteOrgAction,
  useDeleteRoomAction,
} from "@/hooks/data/calendar.actions";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import { ToastUtils } from "@/utils/toast.utils";
import { handleError } from "@/utils/common.utils";

interface CalendarOrgListTableProps {
  data: any[];
  loading?: boolean;
  currentPage: number;
  itemsPerPage: number;
  totalItems: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  sortBy: string;
  sortDirection: "ASC" | "DESC";
  onSort: (field: string) => void;
  onEditOrg: (org: any) => void;
}

const SearchTitles = {
  ADDRESS: "ADDRESS",
};

export default function CalendarOrgListTable({
  data,
  loading = false,
  currentPage,
  itemsPerPage,
  totalItems,
  onPageChange,
  onPageSizeChange,
  sortBy,
  sortDirection,
  onSort,
  onEditOrg,
}: CalendarOrgListTableProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [orgToDelete, setOrgToDelete] = useState<any>(null);
  const deleteOrgMutation = useDeleteOrgAction();

  const handleDeleteClick = (e: React.MouseEvent, org: any) => {
    e.stopPropagation();
    setOrgToDelete(org);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!orgToDelete?.id) return;

    try {
      await deleteOrgMutation.mutateAsync(orgToDelete.id);
      ToastUtils.success("Xóa phòng họp thành công");
      setDeleteConfirmOpen(false);
      setOrgToDelete(null);
    } catch (error) {
      handleError(error);
    }
  };

  const getSortIcon = (field: string) => {
    if (sortBy !== field) return null;
    return sortDirection === "ASC" ? (
      <ArrowUp className="w-4 h-4 text-blue-600" />
    ) : (
      <ArrowDown className="w-4 h-4 text-blue-600" />
    );
  };

  const columns: Column<any>[] = [
    {
      header: "STT",
      accessor: (row, index) => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return startIndex + index + 1;
      },
      className: "text-center max-w-[50px] w-[5%]",
    },
    {
      header: (
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => onSort(SearchTitles.ADDRESS)}
        >
          Địa điểm
          {getSortIcon(SearchTitles.ADDRESS) && (
            <span className="text-xs">{getSortIcon(SearchTitles.ADDRESS)}</span>
          )}
        </div>
      ),
      accessor: (row) => row.meetingAddress?.address || row.address || "",
      className: "text-center max-w-[500px] w-[85%]",
      sortKey: SearchTitles.ADDRESS,
    },
    {
      header: "Thao tác",
      type: "actions",
      renderActions: (row) => {
        return (
          <div className="flex items-center justify-center gap-1">
            <Button
              variant="outline"
              size="sm"
              className="p-1 border-none hover:bg-transparent shadow-none outline-none bg-transparent"
              onClick={(e) => handleDeleteClick(e, row)}
              title="Xóa"
            >
              <Trash2 className="w-4 h-4 text-black" />
            </Button>
          </div>
        );
      },
      className: "text-center max-w-[100px] w-[10%]",
    },
  ];

  return (
    <>
      <div className="px-4">
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          onRowClick={onEditOrg}
          currentPage={currentPage}
          itemsPerPage={itemsPerPage}
          totalItems={totalItems}
          onPageChange={onPageChange}
          onItemsPerPageChange={onPageSizeChange}
          pageSizeOptions={[10, 20, 50, 100]}
          emptyText="Không tồn tại dữ liệu"
          sortable={false}
          clientSort={false}
          bgColor="bg-white"
          className="overflow-hidden"
        />
      </div>

      <ConfirmDeleteDialog
        isOpen={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa"
        description="Bạn có chắc chắn muốn xóa địa điểm này không?"
        confirmText="Đồng ý"
        cancelText="Hủy"
        isLoading={deleteOrgMutation.isPending}
      />
    </>
  );
}
