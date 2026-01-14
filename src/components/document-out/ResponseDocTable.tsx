import React from "react";
import { Table } from "@/components/ui/table";
import type { Column } from "@/definitions/types/table.type";

type ResDoc = {
  id: string;
  preview: string;
  orgReceive: string;
  statusName: string;
};

type Props = {
  docs: ResDoc[];
  onOpen: (id: string) => void;
};

const ResponseDocTable: React.FC<Props> = ({ docs, onOpen }) => {
  const columns: Column<ResDoc>[] = [
    {
      header: "STT",
      accessor: (_item, index) => index + 1,
      className: "w-12 text-center",
    },
    {
      header: "Trích Yếu",
      accessor: (item) => item.preview,
      className: "w-2/5 cursor-pointer",
    },
    {
      header: "Đơn vị tiếp nhận",
      accessor: (item) => item.orgReceive,
      className: "w-1/4 text-center cursor-pointer",
    },
    {
      header: "Trạng thái",
      accessor: (item) => item.statusName,
      className: "w-16 text-center cursor-pointer",
    },
  ];
  return (
    <Table
      columns={columns}
      dataSource={docs}
      showPagination={false}
      sortable={true}
      onRowClick={(r) => onOpen(r.id)}
    />
  );
};

export default ResponseDocTable;
