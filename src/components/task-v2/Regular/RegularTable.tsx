"use client";

import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";
import { Column } from "@/definitions";
import { Trash2 } from "lucide-react";
import { useMemo } from "react";

interface RegularTableProps {
  data: any[];
  isLoading: boolean;
  paging: {
    itemsPerPage: number;
    currentPage: number;
    totalRecord: number;
  };
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (size: number) => void;
  onRowClick?: (row: any) => void;
  deleteTask: (task: any) => void;
}

export default function RegularTable({
  data,
  isLoading,
  paging,
  onPageChange,
  onItemsPerPageChange,
  onRowClick,
  deleteTask,
}: RegularTableProps) {
  const columns: Column<any>[] = useMemo(
    () => [
      {
        header: "STT",
        accessor: (row, index) =>
          (paging.currentPage - 1) * paging.itemsPerPage + index + 1,
        className: "w-16 text-center",
      },
      {
        header: "Tên công việc",
        accessor: (row) => (
          <div
            className="flex items-center justify-center gap-2"
            //onClick={() => onRowClick?.(row)}
          >
            {row.taskName}
          </div>
        ),
        className: "text-center w-32",
      },
      {
        header: "Mức độ phức tạp",
        accessor: (row) => (
          <div
            className="flex items-center justify-center gap-2"
            //onClick={() => onRowClick?.(row)}
          >
            {row.complexityName}
          </div>
        ),
        className: "text-center w-16",
      },
      {
        header: "Đơn vị",
        accessor: (row) => (
          <div
            className="flex items-center justify-center gap-2"
            //onClick={() => onRowClick?.(row)}
          >
            {row.orgNames.join(", ")}
          </div>
        ),
        className: "text-center w-64",
      },
      {
        header: "Thao tác",
        className: "text-center w-32",
        accessor: (row) => (
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                deleteTask(row);
              }}
              title="Xóa"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </Button>
          </div>
        ),
      },
    ],
    [paging.currentPage, paging.itemsPerPage, onRowClick, deleteTask]
  );

  return (
    <div className="px-4">
      <Table
        columns={columns}
        dataSource={data}
        itemsPerPage={paging.itemsPerPage}
        currentPage={paging.currentPage}
        totalItems={paging.totalRecord}
        onPageChange={onPageChange}
        onItemsPerPageChange={onItemsPerPageChange}
        emptyText="Không tồn tại công việc"
        showPagination={true}
        onRowClick={onRowClick}
      />
    </div>
  );
}
