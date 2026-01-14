import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Save, X, XCircle } from "lucide-react";
import { useState } from "react";
import {
  useRejectWatchList,
  useRejectWatchListFromFinish,
} from "@/hooks/data/watch-list.action";
import { toast } from "@/hooks/use-toast";
import { handleError } from "@/utils/common.utils";
import { format } from "date-fns";
import { ToastUtils } from "@/utils/toast.utils";

interface RejectWatchListModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orgRejectId: number;
  isReturnToUnit?: boolean;
  fromDate: string;
  toDate: string;
  onSuccess?: () => void;
}

export default function RejectWatchListModal({
  open,
  onOpenChange,
  orgRejectId,
  isReturnToUnit = false,
  fromDate,
  toDate,
  onSuccess,
}: RejectWatchListModalProps) {
  const [rejectComment, setRejectComment] = useState("");
  const [isRejecting, setIsRejecting] = useState(false);

  const { mutateAsync: rejectWatchList } = useRejectWatchList();
  const { mutateAsync: rejectWatchListFromFinish } =
    useRejectWatchListFromFinish();

  const handleReject = async () => {
    if (!rejectComment.trim()) return;

    try {
      setIsRejecting(true);

      const formData = new FormData();
      formData.append("fromDate", fromDate);
      formData.append("toDate", toDate);
      formData.append("orgIds", orgRejectId.toString());
      formData.append("comment", rejectComment);

      let response;
      if (isReturnToUnit) {
        response = await rejectWatchListFromFinish(formData);
      } else {
        response = await rejectWatchList(formData);
      }

      if (response.success) {
        ToastUtils.success("Trả lại lịch trực đơn vị thành công");

        setRejectComment("");
        onOpenChange(false);
        onSuccess?.();
      } else {
        ToastUtils.error("Lỗi trả lại lịch trực đơn vị");
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsRejecting(false);
    }
  };

  const handleClose = (open: boolean) => {
    if (!open) {
      setRejectComment("");
    }
    onOpenChange(open);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl w-full">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-lg font-semibold">
            Trả lại lịch trực
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="rejectComment" className="text-xs !font-bold">
              Nội dung trả lại
            </Label>
            <Textarea
              id="rejectComment"
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
              placeholder="Nhập nội dung trả lại..."
              rows={3}
              required
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-2 pt-4">
          <Button
            onClick={handleReject}
            className="bg-blue-600 hover:bg-blue-700"
            disabled={!rejectComment.trim() || isRejecting}
          >
            <Save className="w-4 h-4 mr-2" />
            {isRejecting
              ? "Đang xử lý..."
              : isReturnToUnit
                ? "Xác nhận trả về đơn vị"
                : "Xác nhận"}
          </Button>
          <Button
            variant="outline"
            onClick={() => handleClose(false)}
            disabled={isRejecting}
          >
            <X className="w-4 h-4 mr-1" />
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
