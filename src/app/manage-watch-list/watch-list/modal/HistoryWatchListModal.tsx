import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Table } from "@/components/ui/table";
import { Column } from "@/definitions/types/table.type";
import { X, XCircle } from "lucide-react";

interface ChangeHistoryItem {
  orgName: string;
  createDate: string;
  user: string;
  actionStr: string;
  comment: string;
}

interface HistoryWatchListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  changeHistory: ChangeHistoryItem[];
}

export default function HistoryWatchListModal({
  open,
  onOpenChange,
  changeHistory,
}: HistoryWatchListModalProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Define columns for the history table
  const columns: Column<ChangeHistoryItem>[] = [
    {
      header: "CƠ QUAN, ĐƠN VỊ",
      accessor: "orgName",
      className: "text-center font-medium",
    },
    {
      header: "THỜI GIAN",
      accessor: (item) => formatDate(item.createDate),
      className: "text-center",
    },
    {
      header: "HỌ VÀ TÊN",
      accessor: "user",
      className: "text-center",
    },
    {
      header: "HÀNH ĐỘNG",
      accessor: "actionStr",
      className: "text-center",
    },
    {
      header: "Ý KIẾN",
      accessor: "comment",
      className: "text-center",
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-full max-h-[90vh] [&>button]:hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-lg font-semibold">
            Lịch sử chỉnh sửa
          </DialogTitle>
          <X className="w-4 h-4" onClick={() => onOpenChange(false)} />
        </DialogHeader>

        <div className="space-y-4 overflow-y-auto max-h-[60vh] pr-2 pb-2">
          <Table
            columns={columns}
            dataSource={changeHistory}
            showPagination={false}
            emptyText="Không có lịch sử chỉnh sửa"
          />
        </div>

        <DialogFooter className="flex gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
