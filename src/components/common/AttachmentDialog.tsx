// src/components/common/AttachmentDialog.tsx
"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Paperclip } from "lucide-react";

import { Table } from "@/components/ui/table";
import type { Column } from "@/definitions/types/table.type";

function cleanFileName(name?: string) {
  const n = name ?? "";
  return n.replace(/__\d+(?=\.[^.\s]+$)/, "").replace(/__\d+$/, "");
}

type Attachment = {
  id?: string | number;
  fileName?: string;
  name?: string;
  creatorName?: string;
  previewUrl?: string;
};

export default function AttachmentDialog({
  isOpen,
  onOpenChange,
  attachments = [],
}: {
  isOpen: boolean;
  onOpenChange: (v: boolean) => void;
  attachments?: Attachment[];
}) {
  const cols: Column<Attachment>[] = [
    {
      header: "STT",
      accessor: (_r, idx) => idx + 1,
      className: "text-center w-12",
    },
    {
      header: "Tên file",
      accessor: (r) => (
        <div className="flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-blue-600 shrink-0" />
          <span className="truncate block max-w-[280px]">
            {cleanFileName(r.fileName ?? r.name)}
          </span>
        </div>
      ),
      className: "w-[320px] max-w-[320px]",
    },
    {
      header: "Người tạo",
      accessor: (r) => r.creatorName ?? "--",
      className: "text-center w-[150px]",
    },
    {
      header: "Trạng thái",
      accessor: () => (
        <Badge
          variant="outline"
          className="text-green-600 border-green-200 bg-green-50"
        >
          Hoạt động
        </Badge>
      ),
      className: "text-center w-[150px]",
    },
    {
      header: "Thao tác",
      accessor: (r) => (
        <Button
          variant="link"
          className="p-0 h-auto"
          onClick={() => r.previewUrl && window.open(r.previewUrl, "_blank")}
        >
          <Eye className="w-4 h-4 mr-1" />
          Xem
        </Button>
      ),
      className: "text-center w-[100px]",
    },
  ];

  const data = (attachments as Attachment[]) ?? [];
  const total = data.length;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-[90vw] max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Danh sách đính kèm</DialogTitle>
        </DialogHeader>

        <div className="max-h-[65vh] overflow-y-auto">
          <Table<Attachment>
            sortable={true}
            columns={cols}
            dataSource={data}
            itemsPerPage={total || 1}
            currentPage={1}
            totalItems={total}
            showPagination={false}
            emptyText="Không có tệp đính kèm"
          />
        </div>

        <DialogFooter className="pt-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            × Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
