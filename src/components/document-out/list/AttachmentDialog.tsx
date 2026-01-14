"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table } from "@/components/ui/table";
import { Column } from "@/definitions/types/table.type";
import { ReactNode } from "react";
import { canViewNoStatus } from "@/utils/common.utils";
import { useFileViewer } from "@/hooks/useFileViewer";
import { Constant } from "@/definitions/constants/constant";
import { downloadFileTable } from "@/services/file.service";
import { Badge } from "@/components/ui/badge";

interface AttachmentDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  data: any[];
}

interface ExtendedColumn<T> extends Column<T> {
  render?: (record: T, index: number) => ReactNode;
  sortKey?: string;
}

export default function AttachmentDialog({
  open,
  onOpenChange,
  data,
}: AttachmentDialogProps) {
  const { viewFile } = useFileViewer();
  const isView = (fileName: string) => canViewNoStatus(fileName);
  const columns: ExtendedColumn<any>[] = [
    {
      header: "STT",
      accessor: (_record, index) => index + 1,
      className: "text-left w-[5%]",
    },
    {
      header: "Tên file",
      accessor: (record) => record.displayName,
      className: "text-left w-[35%]",
    },
    {
      header: "Người tạo",
      accessor: () => "",
      className: "text-left w-[30%]",
    },
    {
      header: "Trạng thái",
      accessor: (record) =>
        record.active ? (
          <Badge
            variant="outline"
            className="text-green-600 border-green-200 bg-green-50"
          >
            Hoạt động
          </Badge>
        ) : (
          <Badge
            variant="outline"
            className="text-red-600 border-red-200 bg-red-50"
          >
            Không hoạt động
          </Badge>
        ),
      className: "text-left w-[14%]",
    },
    {
      header: "Thao tác",
      accessor: (record) =>
        isView(record.name) ? (
          <a
            className="text-blue-600 hover:text-blue-900 cursor-pointer"
            onClick={() =>
              viewFile(record, "", true, Constant.ATTACHMENT.DOWNLOAD)
            }
          >
            Xem
          </a>
        ) : (
          <a
            className="text-blue-600 hover:text-blue-900 cursor-pointer"
            onClick={() => downloadFileTable(record.name, record.displayName)}
          >
            Tải về
          </a>
        ),
      className: "text-center w-[10%]",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Danh sách đính kèm</DialogTitle>
        </DialogHeader>
        <div
          className=" max-h-[50vh] overflow-y-auto pr-2"
          style={{ minHeight: "200px" }}
        >
          <Table
            sortable={true}
            columns={columns}
            dataSource={data}
            className="min-w-full mb-4"
            showPagination={false}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
