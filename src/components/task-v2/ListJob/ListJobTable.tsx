"use client";

import { Table } from "@/components/ui/table";
import { Column } from "@/definitions";
import { Button } from "@/components/ui/button";
import { Pencil, Check, X } from "lucide-react";
import dayjs from "dayjs";

interface ListJobTableProps {
  tabKey?: string;
  data?: any[];
  isLoading?: boolean;
  onEdit?: (row: any) => void;
  onAccept?: (row: any) => void;
  onReject?: (row: any) => void;
  onRowClick?: (row: any) => void;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (size: number) => void;
  currentPage?: number;
  itemsPerPage?: number;
  totalItems?: number;
}

export default function ListJobTable({
  tabKey,
  data = [],
  isLoading = false,
  onEdit,
  onAccept,
  onReject,
  onRowClick,
  onPageChange,
  onItemsPerPageChange,
  currentPage,
  itemsPerPage,
  totalItems,
}: ListJobTableProps) {
  const columns: Column<any>[] = [
    {
      header: "STT",
      accessor: (_row, index) =>
        ((currentPage ?? 1) - 1) * (itemsPerPage ?? 10) + index + 1,
      className: "text-center w-16",
    },
    {
      header: "Tên công việc",
      accessor: (row) => row.taskName || "N/A",
      className: "text-left",
    },
    {
      header: "Mô tả",
      accessor: (row) => row.description || "N/A",
      className: "text-left",
    },
    {
      header: "Mức độ phức tạp",
      accessor: (row) => row.complexityName || "N/A",
      className: "text-center",
    },
    {
      header: "Người thực hiện",
      accessor: (row) => row.handlerName || "N/A",
      className: "text-center",
    },
    {
      header: "Ngày tạo",
      accessor: (row) =>
        row.startDate ? dayjs(row.startDate).format("DD/MM/YYYY") : "N/A",
      className: "text-center",
    },
    {
      header: "Ngày kết thúc",
      accessor: (row) =>
        row.endDate ? dayjs(row.endDate).format("DD/MM/YYYY") : "N/A",
      className: "text-center",
    },
  ];

  if (tabKey === "NEW") {
    columns.push({
      header: "Trạng thái",
      type: "actions",
      className: "text-center w-32",
      accessor: () => null,
      renderActions: (row: any) => (
        <div className="flex items-center justify-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="p-1 hover:bg-green-100 rounded transition-colors"
            title="Duyệt"
            onClick={(e) => {
              e.stopPropagation();
              onAccept?.(row);
            }}
          >
            <Check className="w-4 h-4 text-green-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 hover:bg-red-100 rounded transition-colors"
            title="Từ chối"
            onClick={(e) => {
              e.stopPropagation();
              onReject?.(row);
            }}
          >
            <X className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      ),
    });
    columns.push({
      header: "Thao tác",
      type: "actions",
      className: "text-center w-24",
      accessor: () => null,
      renderActions: (row: any) => (
        <div className="flex items-center justify-center gap-1.5">
          <Button
            variant="ghost"
            size="sm"
            className="p-1 hover:bg-blue-100 rounded transition-colors"
            title="Sửa"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(row);
            }}
          >
            <Pencil className="w-4 h-4 text-blue-600" />
          </Button>
        </div>
      ),
    });
  } else if (tabKey === "ACCEPTED") {
    columns.push({
      header: "Trạng thái",
      accessor: () => (
        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <Check className="w-3 h-3 mr-1" />
          Đã duyệt
        </span>
      ),
      className: "text-center",
    });
  }

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={isLoading}
      emptyText="Không có dữ liệu"
      {...(onRowClick && { onRowClick })}
      onPageChange={onPageChange}
      onItemsPerPageChange={onItemsPerPageChange}
      showPagination={true}
      showPageSize={true}
      pageSizeOptions={[10, 20, 50, 100]}
      currentPage={currentPage}
      itemsPerPage={itemsPerPage}
      totalItems={totalItems}
    />
  );
}
