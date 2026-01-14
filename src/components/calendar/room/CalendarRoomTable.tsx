"use client";

import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";
import { Column } from "@/definitions/types";
import { ArrowDown, ArrowUp, Trash2 } from "lucide-react";
import { useState } from "react";
import { useDeleteRoomAction } from "@/hooks/data/calendar.actions";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import { ToastUtils } from "@/utils/toast.utils";
import { handleError } from "@/utils/common.utils";

interface CalendarRoomTableProps {
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
  onEditRoom: (room: any) => void;
}

const SearchTitles = {
  NAME: "NAME",
  ADDRESS: "ADDRESS",
  QUANTITY: "QUANTITY",
  ACREAGE: "ACREAGE",
  DESCRIPTION: "DESCRIPTION",
};

export default function CalendarRoomTable({
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
  onEditRoom,
}: CalendarRoomTableProps) {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [roomToDelete, setRoomToDelete] = useState<any>(null);
  const deleteRoomMutation = useDeleteRoomAction();

  const handleDeleteClick = (e: React.MouseEvent, room: any) => {
    e.stopPropagation();
    setRoomToDelete(room);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!roomToDelete?.id) return;

    try {
      await deleteRoomMutation.mutateAsync(roomToDelete.id);
      ToastUtils.success("Xóa phòng họp thành công");
      setDeleteConfirmOpen(false);
      setRoomToDelete(null);
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
          onClick={() => onSort(SearchTitles.NAME)}
        >
          Tên phòng họp
          {getSortIcon(SearchTitles.NAME) && (
            <span className="text-xs">{getSortIcon(SearchTitles.NAME)}</span>
          )}
        </div>
      ),
      accessor: (row) => row.name,
      className:
        "text-center max-w-[300px] w-[40%] whitespace-pre-wrap break-words leading-5",
      sortKey: SearchTitles.NAME,
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
      className: "text-center max-w-[100px] w-[10%]",
      sortKey: SearchTitles.ADDRESS,
    },
    {
      header: (
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => onSort(SearchTitles.QUANTITY)}
        >
          Số người
          {getSortIcon(SearchTitles.QUANTITY) && (
            <span className="text-xs">
              {getSortIcon(SearchTitles.QUANTITY)}
            </span>
          )}
        </div>
      ),
      accessor: (row) => row.quantity || "",
      className: "text-center max-w-[100px] w-[10%]",
      sortKey: SearchTitles.QUANTITY,
    },
    {
      header: (
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => onSort(SearchTitles.ACREAGE)}
        >
          Diện tích
          {getSortIcon(SearchTitles.ACREAGE) && (
            <span className="text-xs">{getSortIcon(SearchTitles.ACREAGE)}</span>
          )}
        </div>
      ),
      accessor: (row) => row.acreage || "",
      className: "text-center max-w-[100px] w-[10%]",
      sortKey: SearchTitles.ACREAGE,
    },
    {
      header: (
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => onSort(SearchTitles.DESCRIPTION)}
        >
          Mô tả
          {getSortIcon(SearchTitles.DESCRIPTION) && (
            <span className="text-xs">
              {getSortIcon(SearchTitles.DESCRIPTION)}
            </span>
          )}
        </div>
      ),
      accessor: (row) => row.description || "",
      className:
        "text-center max-w-[300px] w-[35%] whitespace-pre-wrap break-words leading-5",
      sortKey: SearchTitles.DESCRIPTION,
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
    },
  ];

  return (
    <>
      <div className="px-4">
        <Table
          columns={columns}
          dataSource={data}
          loading={loading}
          onRowClick={onEditRoom}
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
        description="Bạn có chắc chắn muốn xóa phòng họp?"
        confirmText="Đồng ý"
        cancelText="Hủy"
        isLoading={deleteRoomMutation.isPending}
      />
    </>
  );
}
