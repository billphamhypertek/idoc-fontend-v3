import React from "react";
import { Table } from "@/components/ui/table";
import type { Column } from "@/definitions/types/table.type";

type ChildDoc = {
  id: string;
  preview: string;
  orgReceive: string;
  typeOrg: string | null;
  statusName: string;
};

type Props = {
  docs: ChildDoc[];
  isShowRejectChildDoc: boolean;
  ORG_MULTI_TRANSFER_BCY: boolean;
  onOpenChild: (id: string) => void;
  onRetakeChild: (id: string) => void;
  getStatus: (status: string | null) => string;
};

const ChildrenLinkedDocTable: React.FC<Props> = ({
  docs,
  isShowRejectChildDoc,
  ORG_MULTI_TRANSFER_BCY,
  onOpenChild,
  onRetakeChild,
  getStatus,
}) => {
  const columns: Column<ChildDoc>[] = [
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
      header: "Tình trạng",
      accessor: (item) => getStatus(item.typeOrg),
      className: "w-16 text-center cursor-pointer",
    },
    {
      header: "Trạng thái",
      accessor: (item) => item.statusName,
      className: "w-16 text-center cursor-pointer",
    },
    ...(ORG_MULTI_TRANSFER_BCY && isShowRejectChildDoc
      ? ([
          {
            header: "Thao tác",
            type: "actions" as const,
            renderActions: (item) => (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  if (item.statusName === "DONE") onRetakeChild(item.id);
                }}
                className={
                  item.statusName === "DONE"
                    ? "cursor-pointer bg-green-500 text-white px-2 py-1 rounded"
                    : "bg-gray-500 text-white px-2 py-1 rounded"
                }
              >
                Thu hồi
              </span>
            ),
            className: "w-16 text-center",
          },
        ] as Column<ChildDoc>[])
      : []),
  ];

  return (
    <Table
      columns={columns}
      dataSource={docs}
      showPagination={false}
      sortable={true}
      onRowClick={(record) => onOpenChild(record.id)}
    />
  );
};

export default ChildrenLinkedDocTable;
