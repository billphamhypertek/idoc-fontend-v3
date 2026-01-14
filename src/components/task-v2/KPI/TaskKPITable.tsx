"use client";

import { Table } from "@/components/ui/table";
import { Column } from "@/definitions/types/table.type";
import { useMemo } from "react";

interface TaskKPITableProps {
  data: any[];
  isLoading: boolean;
  paging: {
    itemsPerPage: number;
    currentPage: number;
    totalRecord: number;
  };
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  onRowClick?: (row: any) => void;
}

export default function TaskKPITable({
  data,
  isLoading,
  paging,
  onPageChange,
  onPageSizeChange,
  onRowClick,
}: TaskKPITableProps) {
  const columns: Column<any>[] = useMemo(
    () => [
      {
        header: "STT",
        accessor: (row, index) =>
          (paging.currentPage - 1) * paging.itemsPerPage + index + 1,
        className: "w-16 text-center",
      },
      {
        header: "Họ tên",
        accessor: "userName",
        className: "text-center",
      },
      {
        header: "Đơn vị",
        accessor: "orgName",
        className: "text-center",
      },
      {
        header: "Số lượng công việc",
        accessor: "taskCount",
        className: "text-center",
      },
      {
        header: "Điểm số",
        accessor: (row) => (row.score === null ? 0 : row.score),
        className: "text-center",
      },
    ],
    [paging.currentPage, paging.itemsPerPage]
  );

  return (
    <div className="px-4">
      <Table
        columns={columns}
        dataSource={data}
        itemsPerPage={paging.itemsPerPage}
        currentPage={paging.currentPage}
        onPageChange={onPageChange}
        totalItems={paging.totalRecord}
        onItemsPerPageChange={onPageSizeChange}
        showPagination={true}
        loading={isLoading}
        emptyText="Không tồn tại công việc"
        showPageSize={true}
        pageSizeOptions={[10, 20, 50, 100]}
        onRowClick={onRowClick}
      />
    </div>
  );
}
