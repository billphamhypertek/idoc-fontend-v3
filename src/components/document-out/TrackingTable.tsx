import React from "react";
import { Table } from "@/components/ui/table";
import type { Column } from "@/definitions/types/table.type";
import { ChevronDown, ChevronUp } from "lucide-react";

type TrackingNode = {
  data: { name: string };
  hidden?: boolean;
  children?: TrackingNode[];
};

type Props = {
  rows: TrackingNode[];
  onToggle: (row: TrackingNode) => void;
};

const TrackingTable: React.FC<Props> = ({ rows, onToggle }) => {
  const columns: Column<TrackingNode>[] = [
    {
      header: "Người gửi/nhận",
      accessor: (item) => (
        <div className="flex items-center">
          <span>{item.data.name}</span>
          {item.children?.length ? (
            <span className="ml-2">
              {item.hidden ? <ChevronDown /> : <ChevronUp />}
            </span>
          ) : null}
        </div>
      ),
    },
  ];

  return (
    <Table
      sortable={true}
      columns={columns}
      dataSource={rows}
      showPagination={false}
      onRowClick={(record) => onToggle(record)}
    />
  );
};

export default TrackingTable;
