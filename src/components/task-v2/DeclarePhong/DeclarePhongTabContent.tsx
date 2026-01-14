"use client";

import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";
import { Column } from "@/definitions/types";
import dayjs from "dayjs";
import { Check, SquarePen, Trash2, X } from "lucide-react";

interface DeclarePhongTabContentProps {
  tabKey?: string;
  isPermission?: boolean;
  isLoading?: boolean;
  data: any[];
  currentPage?: number;
  itemsPerPage?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onValidateTask?: (task: any, status: boolean) => void;
  onDeleteTask?: (task: any) => void;
  onEditTask?: (task: any) => void;
  onRowClick?: (task: any) => void;
}
export default function DeclarePhongTabContent({
  tabKey,
  isPermission = false,
  isLoading = false,
  data = [],
  currentPage = 1,
  itemsPerPage = 10,
  totalItems,
  onPageChange,
  onValidateTask,
  onDeleteTask,
  onEditTask,
  onRowClick,
}: DeclarePhongTabContentProps) {
  const columns: Column<any>[] = [
    {
      header: "STT",
      accessor: (row, index) => (currentPage - 1) * itemsPerPage + index + 1,
      className: "text-center w-16",
    },
    {
      header: "Tên công việc",
      accessor: (row) => row.taskName || "N/A",
      className: "text-center",
    },
    {
      header: "Ngày bắt đầu",
      accessor: (row) => dayjs(row.startDate).format("DD/MM/YYYY"),
      className: "text-center",
    },
    {
      header: "Hạn xử lý",
      accessor: (row) => dayjs(row.deadline).format("DD/MM/YYYY"),
      className: "text-center",
    },
    {
      header: "Mức độ phức tạp",
      accessor: (row) => row.complexityName || "N/A",
      className: "text-center",
    },
  ];

  if (tabKey === "NEW") {
    columns.push({
      header: "Thao tác",
      type: "actions",
      className: "text-center w-24",
      renderActions: (row: any) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            title="Sửa"
            onClick={(e) => {
              e.stopPropagation();
              onEditTask?.(row);
            }}
            className="bg-transparent hover:bg-transparent text-black border-none shadow-none outline-none"
          >
            <SquarePen className="w-4 h-4" />
          </Button>
          <Button
            title="Xóa"
            onClick={(e) => {
              e.stopPropagation();
              onDeleteTask?.(row.id);
            }}
            className="bg-transparent hover:bg-transparent text-black border-none shadow-none outline-none"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
          {isPermission && (
            <div className="flex items-center justify-center gap-2">
              <Button
                title="Duyệt"
                onClick={(e) => {
                  e.stopPropagation();
                  onValidateTask?.(row, true);
                }}
                className="bg-transparent hover:bg-transparent text-black border-none shadow-none outline-none"
              >
                <Check className="w-4 h-4" />
              </Button>
              <Button
                title="Từ chối"
                onClick={(e) => {
                  e.stopPropagation();
                  onValidateTask?.(row, false);
                }}
                className="bg-transparent hover:bg-transparent text-black border-none shadow-none outline-none"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      ),
    });
  }

  return (
    <div className="space-y-4">
      <Table
        columns={columns}
        dataSource={data}
        emptyText="Không có dữ liệu"
        loading={isLoading}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
        onPageChange={onPageChange}
        showPageSize={false}
        onRowClick={onRowClick}
      />
    </div>
  );
}
