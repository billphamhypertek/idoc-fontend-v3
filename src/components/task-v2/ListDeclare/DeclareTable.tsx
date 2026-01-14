"use client";

import { Table } from "@/components/ui/table";
import { Column } from "@/definitions";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import dayjs from "dayjs";

interface DeclareTableProps {
  tabKey?: string;
  data?: any[];
  isLoading?: boolean;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  onRowClick?: (row: any) => void;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (size: number) => void;
  currentPage?: number;
  itemsPerPage?: number;
  totalItems?: number;
}

export default function DeclareTable({
  tabKey,
  data = [],
  isLoading = false,
  onEdit,
  onDelete,
  onRowClick,
  onPageChange,
  onItemsPerPageChange,
  currentPage,
  itemsPerPage,
  totalItems,
}: DeclareTableProps) {
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
      className: "text-center",
    },
    {
      header: "Mô tả",
      accessor: (row) => row.description || "N/A",
      className: "text-left",
    },
    {
      header: "Ngày bắt đầu",
      accessor: (row) => dayjs(row.startDate).format("DD/MM/YYYY"),
      className: "text-center",
    },
    {
      header: "Ngày kết thúc",
      accessor: (row) => dayjs(row.endDate).format("DD/MM/YYYY"),
      className: "text-center",
    },
    {
      header: "Mức độ phức tạp",
      accessor: (row) => row.complexityName || "N/A",
      className: "text-center",
    },
    {
      header: "Người giao",
      accessor: (row) => row.assignerName || "N/A",
      className: "text-center",
    },
    {
      header: "Người thực hiện",
      accessor: (row) => row.handlerName || "N/A",
      className: "text-center",
    },
  ];

  if (tabKey === "NEW") {
    columns.push({
      header: "Thao tác",
      type: "actions",
      className: "text-center w-24",
      accessor: () => null,
      renderActions: (row: any) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="p-1 hover:bg-blue-100 rounded transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(row);
            }}
            title="Sửa"
          >
            <Pencil className="w-4 h-4 text-blue-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="p-1 hover:bg-red-100 rounded transition-colors"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.(row);
            }}
            title="Xóa"
          >
            <Trash2 className="w-4 h-4 text-red-600" />
          </Button>
        </div>
      ),
    });
  }

  return (
    <Table
      columns={columns}
      dataSource={data}
      loading={isLoading}
      onRowClick={onRowClick}
      emptyText="Không có dữ liệu"
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
