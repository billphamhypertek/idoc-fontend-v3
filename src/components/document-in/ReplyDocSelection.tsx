import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Column } from "@/definitions";
import { ReplyDoc } from "@/definitions/types/document.type";
import { ReplyDocDialog } from "@/components/document-in/ReplyDocDialog";
import { Table } from "@/components/ui/table";

interface Props {
  data: ReplyDoc[];
  onSubmit?: (s: string) => void;
  editable?: boolean;
}

export default function ReplyDocSelection({ data, onSubmit, editable }: Props) {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [replyDoc, setReplyDoc] = useState<ReplyDoc[]>(data);
  const columns: Column<ReplyDoc>[] = [
    {
      header: "STT",
      className: "text-center py-1 min-w-[60px] w-[5%]",
      accessor: (item: ReplyDoc, index: number) => (
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs font-medium">{index + 1}</span>
        </div>
      ),
    },
    {
      header: "Số đến",
      className: "text-center py-1 min-w-[80px] w-[8%]",
      accessor: (item: ReplyDoc) => (
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs font-medium">{item.numberArrival}</span>
        </div>
      ),
    },
    {
      header: "Số/Ký hiệu",
      className: "text-center py-1 min-w-[120px] w-[12%]",
      accessor: (item: ReplyDoc) => (
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs font-medium">{item.numberOrSign}</span>
        </div>
      ),
    },
    {
      header: "Trích yếu",
      className: "text-left py-1 min-w-[200px] flex-1",
      accessor: (item: ReplyDoc) => (
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">{item.preview}</span>
        </div>
      ),
    },
    {
      header: "Đơn vị ban hành",
      className: "text-left py-1 min-w-[150px] w-[20%]",
      accessor: (item: ReplyDoc) => (
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium">{item.orgIssuedName}</span>
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
              Tìm kiếm văn bản
            </Button>
          )}
          <span className="text-sm text-gray-500 italic font-bold whitespace-nowrap">
            Là văn bản trả lời của văn bản đến:
          </span>
          {replyDoc.length === 0 ? (
            <span className="text-sm text-gray-500 italic whitespace-nowrap">
              Chưa có văn bản nào được chọn.
            </span>
          ) : (
            <span className="text-sm text-gray-500 italic whitespace-nowrap">
              {replyDoc.length} văn bản đã chọn.
            </span>
          )}
        </div>
        {replyDoc.length > 0 && (
          <div className="mt-2 w-full overflow-x-auto">
            <Table
              sortable={true}
              columns={columns}
              dataSource={replyDoc}
              showPagination={false}
              bgColor={"bg-white"}
              emptyText={"Không có dữ liệu..."}
              className="w-full"
            />
          </div>
        )}
      </div>
      {editable && onSubmit && (
        <ReplyDocDialog
          data={replyDoc}
          setData={setReplyDoc}
          isOpen={isDialogOpen}
          onOpenChange={setDialogOpen}
          onClose={() => setDialogOpen(false)}
          onSubmit={onSubmit}
        />
      )}
    </>
  );
}
