import React from "react";
import { Table } from "@/components/ui/table";
import type { Column } from "@/definitions/types/table.type";

type Task = {
  id: string;
  name: string;
  assigner: string;
  assignee: string;
  status: string;
};

type Props = {
  tasks: Task[];
  onOpen: (id: string) => void;
};

const TasksTable: React.FC<Props> = ({ tasks, onOpen }) => {
  const columns: Column<Task>[] = [
    {
      header: "STT",
      accessor: (_item, index) => index + 1,
      className: "w-12 text-center",
    },
    {
      header: "Tên công việc",
      accessor: (item) => item.name,
      className: "w-2/5 cursor-pointer",
    },
    {
      header: "Người giao",
      accessor: (item) => item.assigner,
      className: "w-1/4 text-center cursor-pointer",
    },
    {
      header: "Người thực hiện",
      accessor: (item) => item.assignee,
      className: "w-1/4 text-center cursor-pointer",
    },
    {
      header: "Trạng thái",
      accessor: (item) => item.status,
      className: "w-16 text-center cursor-pointer",
    },
  ];
  return (
    <Table
      columns={columns}
      dataSource={tasks}
      showPagination={false}
      sortable={true}
      onRowClick={(r) => onOpen(r.id)}
    />
  );
};

export default TasksTable;
