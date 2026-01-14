import React from "react";
import { Table } from "@/components/ui/table";
import type { Column } from "@/definitions/types/table.type";

type ParentDoc = {
  preview: string;
  orgReceive: string;
  statusName: string;
};

type Props = {
  parentDoc: ParentDoc;
};

const ParentLinkedDocTable: React.FC<Props> = ({ parentDoc }) => {
  const dataSource = parentDoc ? [parentDoc] : [];
  const columns: Column<ParentDoc>[] = [
    {
      header: "STT",
      accessor: (_item, index) => index + 1,
      className: "w-12 text-center",
    },
    {
      header: "Trích Yếu",
      accessor: (item) => item.preview,
      className: "w-1/2 whitespace-pre-wrap",
    },
    {
      header: "Đơn vị chuyển văn bản",
      accessor: (item) => item.orgReceive,
      className: "w-1/3 text-center",
    },
    {
      header: "Trạng thái",
      accessor: (item) => item.statusName,
      className: "w-24 text-center",
    },
  ];
  return (
    <Table
      columns={columns}
      dataSource={dataSource}
      showPagination={false}
      sortable={true}
    />
  );
};

export default ParentLinkedDocTable;
