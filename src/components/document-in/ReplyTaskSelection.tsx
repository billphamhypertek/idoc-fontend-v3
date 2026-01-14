import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Column } from "@/definitions";
import { TaskAssignment } from "@/definitions/types/document.type";
import { Table } from "@/components/ui/table";
import { ReplyTaskDialog } from "@/components/document-in/ReplyTaskDialog";

interface Props {
  editable: boolean;
  data: TaskAssignment[];
  onSubmit?: (v: string) => void;
}

export default function ReplyTaskSelection({
  data,
  onSubmit,
  editable,
}: Props) {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [replyTask, setTaskAssignment] = useState<TaskAssignment[]>(data);
  const columns: Column<TaskAssignment>[] = [
    {
      header: "STT",
      className: "text-center py-1 min-w-[60px] w-[5%]",
      accessor: (item: TaskAssignment, index: number) => (
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs font-medium">{index + 1}</span>
        </div>
      ),
    },
    {
      header: "Tên công việc",
      className: "text-left py-1 min-w-[200px] flex-1",
      accessor: (item: TaskAssignment) => (
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">{item.taskName}</span>
        </div>
      ),
    },
    {
      header: "Người giao việc",
      className: "text-left py-1 min-w-[150px] w-[20%]",
      accessor: (item: TaskAssignment) => (
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">{item.userAssignName}</span>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className="w-full mb-3">
        <div className="flex items-center gap-3 py-2">
          {editable && (
            <Button
              variant={"outline"}
              onClick={() => setDialogOpen(true)}
              className="flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 hover:text-white border-none w-[200px] flex-shrink-0"
            >
              Chọn công việc liên quan
            </Button>
          )}
          <span className="text-sm text-gray-500 italic font-bold whitespace-nowrap">
            Là công việc trả lời của công việc:
          </span>
          {replyTask.length === 0 ? (
            <span className="text-sm text-gray-500 italic whitespace-nowrap">
              Chưa có công việc nào được chọn.
            </span>
          ) : (
            <span className="text-sm text-gray-500 italic whitespace-nowrap">
              {replyTask.length} công việc đã chọn.
            </span>
          )}
        </div>
        {replyTask.length > 0 && (
          <div className="mt-2 w-full overflow-x-auto">
            <Table
              sortable={true}
              columns={columns}
              dataSource={replyTask}
              showPagination={false}
              bgColor={"bg-white"}
              emptyText={"Không có dữ liệu..."}
              className="w-full"
            />
          </div>
        )}
      </div>
      {editable && onSubmit && (
        <ReplyTaskDialog
          data={replyTask}
          setData={setTaskAssignment}
          isOpen={isDialogOpen}
          onOpenChange={setDialogOpen}
          onClose={() => setDialogOpen(false)}
          onSubmit={onSubmit}
        />
      )}
    </>
  );
}
