import { Constant } from "@/definitions/constants/constant";
import { canViewNoStatus, handleError } from "@/utils/common.utils";
import { downloadFile, viewFile } from "@/utils/file.utils";
import { Button } from "../ui/button";
import { Table } from "../ui/table";
import { Eye, Download } from "lucide-react";
import {
  Dialog,
  CustomDialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogContent,
} from "../ui/dialog";
import { toast } from "@/hooks/use-toast";
import { ToastUtils } from "@/utils/toast.utils";
import { Badge } from "../ui/badge";

interface DailyReportAttachmentInfoProps {
  attachments: any[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  constant: any;
}

export default function DailyReportAttachmentInfo({
  attachments = [],
  isOpen,
  onOpenChange,
  constant,
}: DailyReportAttachmentInfoProps) {
  const isView = (fileName: string) => canViewNoStatus(fileName);

  const handleViewFile = async (fileName: any) => {
    try {
      await viewFile(fileName, constant);
    } catch (error) {
      ToastUtils.error("Lỗi không tìm thấy tệp phù hợp");
    }
  };

  const handleDownloadFile = async (fileName: any, encrypt: boolean) => {
    try {
      await downloadFile(fileName, constant, encrypt);
    } catch (error) {
      ToastUtils.error("Lỗi không tìm thấy tệp phù hợp");
    }
  };

  const columns = [
    {
      header: "STT",
      accessor: (item: any, index: number) => (
        <span className="text-center text-sm">{index + 1}</span>
      ),
      className: "w-12 text-center border-r",
    },
    {
      header: "Tên file",
      accessor: (item: any) => item.displayName,
      className: "w-80 border-r text-start",
    },
    {
      header: "Người tạo",
      accessor: (item: any) => (
        <span className="text-sm">{item.createdBy || ""}</span>
      ),
      className: "w-60 border-r text-start",
    },
    {
      header: "Trạng thái",
      accessor: (item: any) => (
        <Badge
          variant="outline"
          className={`${item.active ? "text-green-600 border-green-200 bg-green-50" : "text-red-600 border-red-200 bg-red-50"}`}
        >
          {item.active ? "Hoạt động" : "Không hoạt động"}
        </Badge>
      ),
      className: "w-32 border-r text-center",
    },
    {
      header: "Thao tác",
      accessor: (item: any) => (
        <div className="flex justify-center gap-2">
          {isView(item.name) ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleViewFile(item)}
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            >
              <Eye className="w-4 h-4 mr-1" />
              Xem
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDownloadFile(item, item.encrypt)}
              className="text-green-600 hover:text-green-800 hover:bg-green-50"
            >
              <Download className="w-4 h-4 mr-1" />
              Tải về
            </Button>
          )}
        </div>
      ),
      className: "w-32 text-center",
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Danh sách đính kèm</DialogTitle>
        </DialogHeader>

        <div className="min-h-[200px] max-h-[50vh] overflow-y-auto pr-2">
          {attachments.length > 0 ? (
            <Table
              columns={columns}
              dataSource={attachments}
              showPagination={false}
              emptyText="Không có file đính kèm"
            />
          ) : (
            <div className="flex items-center justify-center h-48 text-gray-500">
              <div className="text-center">
                <p>Không có file đính kèm</p>
              </div>
            </div>
          )}
        </div>

        {/* <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex items-center gap-2"
          >
            Đóng
          </Button>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}
