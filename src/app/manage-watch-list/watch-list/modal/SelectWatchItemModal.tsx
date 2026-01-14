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
import {
  Pencil,
  StickyNote,
  Trash2,
  XCircle,
  CalendarPlus,
  X,
} from "lucide-react";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import {
  useDeleteWatchList,
  useSendNoteWatchList,
} from "@/hooks/data/watch-list.action";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { ToastUtils } from "@/utils/toast.utils";

interface WatchUpdateItem {
  orgName: string;
  date: string;
  handler: string;
  departmentName: string;
  handlerPosition: string;
  schedulePosition: string;
  handlerPhone: string;
  orgId?: number;
  departmentId?: number;
  note?: string;
}

interface SelectWatchItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  watchUpdateList: WatchUpdateItem[];
  isFinishWatchItem?: boolean;
  isDeleteWatchItem?: boolean;
  isAddWatchItem?: boolean;
  onEditWatchItem?: (item: WatchUpdateItem) => void;
}

export default function SelectWatchItemModal({
  open,
  onOpenChange,
  watchUpdateList,
  isFinishWatchItem = false,
  isDeleteWatchItem = false,
  isAddWatchItem = false,
  onEditWatchItem,
}: SelectWatchItemModalProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<WatchUpdateItem | null>(
    null
  );
  const [showNoteConfirm, setShowNoteConfirm] = useState(false);
  const [itemToNote, setItemToNote] = useState<WatchUpdateItem | null>(null);
  const [noteText, setNoteText] = useState("");
  const { mutateAsync: deleteWatchList, isPending: isDeleting } =
    useDeleteWatchList();
  const { mutateAsync: sendNoteWatchList, isPending: isSendingNote } =
    useSendNoteWatchList();

  // Define columns for the table
  const columns: Column<WatchUpdateItem>[] = [
    {
      header: "CƠ QUAN, ĐƠN VỊ",
      accessor: "orgName",
      className: "text-center font-medium",
    },
    {
      header: "THỨ/NGÀY",
      accessor: "date",
      className: "text-center",
    },
    {
      header: "HỌ VÀ TÊN",
      accessor: "handler",
      className: "text-center",
    },
    {
      header: "PHÒNG BAN",
      accessor: "departmentName",
      className: "text-center",
    },
    {
      header: "CHỨC VỤ",
      accessor: "handlerPosition",
      className: "text-center",
    },
    {
      header: "VAI TRÒ",
      accessor: "schedulePosition",
      className: "text-center",
    },
    {
      header: "SỐ ĐIỆN THOẠI",
      accessor: "handlerPhone",
      className: "text-center",
    },
    {
      header: "THAO TÁC",
      type: "actions",
      className: "text-center",
      renderActions: (item: WatchUpdateItem) => (
        <div className="flex justify-center space-x-1">
          {!isFinishWatchItem && !isDeleteWatchItem && !isAddWatchItem && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditWatchItem?.(item)}
              className="action-table text-info"
              title="Chỉnh sửa"
            >
              <Pencil className="h-4 w-4 text-blue-500" />
            </Button>
          )}

          {isAddWatchItem && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {}}
              className="action-table text-success"
              title="Thêm mới ca trực"
            >
              <CalendarPlus className="h-4 w-4 text-green-500" />
            </Button>
          )}

          {isFinishWatchItem && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNoteClick(item)}
              className="action-table text-success"
              title="Ghi chú ca trực"
            >
              <StickyNote className="h-4 w-4 text-green-500" />
            </Button>
          )}

          {isDeleteWatchItem && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteClick(item)}
              className="action-table text-danger"
              title="Xóa ca trực"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const handleDeleteClick = (item: WatchUpdateItem) => {
    setItemToDelete(item);
    setShowDeleteConfirm(true);
  };

  const handleNoteClick = (item: WatchUpdateItem) => {
    setItemToNote(item);
    setNoteText(item?.note || "");
    setShowNoteConfirm(true);
  };

  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      const payload = [
        {
          orgId: itemToDelete.orgId || 0,
          departmentId: itemToDelete.departmentId || 0,
          date: itemToDelete.date,
        },
      ];

      await deleteWatchList(payload);
      ToastUtils.success(
        `Xóa ca trực ngày ${itemToDelete.date} của ${itemToDelete.handler} thành công!`
      );

      setShowDeleteConfirm(false);
      setItemToDelete(null);
      onOpenChange(false);
    } catch (error) {
      ToastUtils.error("Không thể xóa ca trực");
    }
  };

  const handleConfirmNote = async () => {
    if (!itemToNote) return;

    try {
      const payload = {
        orgId: itemToNote.orgId || 0,
        departmentId: itemToNote.departmentId || 0,
        date: itemToNote.date,
        note: noteText,
      };

      await sendNoteWatchList(payload);
      ToastUtils.success(
        `Ghi chú ca trực ngày ${itemToNote.date} của ${itemToNote.handler} thành công!`
      );

      setShowNoteConfirm(false);
      setItemToNote(null);
      setNoteText("");
      onOpenChange(false);
    } catch (error) {
      ToastUtils.error("Lỗi không thể ghi chú ca trực");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl w-full max-h-[90vh] overflow-y-auto [&>button]:hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-lg font-semibold">
            Chỉnh sửa lịch trực ban
          </DialogTitle>
          <X className="w-4 h-4" onClick={() => onOpenChange(false)} />
        </DialogHeader>

        <div className="space-y-4">
          <Table
            columns={columns}
            dataSource={watchUpdateList}
            showPagination={false}
            emptyText="Không có dữ liệu ca trực"
          />
        </div>

        <DialogFooter className="flex gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>

      <ConfirmDeleteDialog
        isOpen={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleConfirmDelete}
        title="Hãy xác nhận"
        description={
          itemToDelete
            ? `Xóa ca trực ngày ${itemToDelete.date} của ${itemToDelete.handler}-${itemToDelete.handlerPosition}`
            : "Bạn có muốn xóa ca trực này?"
        }
        confirmText="Đồng ý"
        cancelText="Đóng"
        isLoading={isDeleting}
        positionButton={true}
      />

      <ConfirmDeleteDialog
        isOpen={showNoteConfirm}
        onOpenChange={setShowNoteConfirm}
        onConfirm={handleConfirmNote}
        title="Ghi chú ca trực"
        description=""
        confirmText="Lưu lại"
        cancelText="Đóng"
        isLoading={isSendingNote}
        haveNote={true}
        note={noteText}
        setNote={setNoteText}
      />
    </Dialog>
  );
}
