import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Constant } from "@/definitions/constants/constant";
import { DocumentService } from "@/services/document.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { handleError } from "@/utils/common.utils";
import { CustomDatePicker } from "../ui/calendar";
import { formatDateYMD, parseDateStringYMD } from "@/utils/datetime.utils";
import { ToastUtils } from "@/utils/toast.utils";

interface DocumentOutDeadlineProps {
  docId: string | number;
  type?: string;
  currentDeadline?: string | null;
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
  showDeadlineModal: boolean;
  setShowDeadlineModal: (show: boolean) => void;
}

export default function DocumentOutDeadline({
  docId,
  type = "",
  currentDeadline = null,
  onClose,
  onSuccess,
  showDeadlineModal,
  setShowDeadlineModal,
}: DocumentOutDeadlineProps) {
  const [newDeadline, setNewDeadline] = useState("");
  const [minDate, setMinDate] = useState("");

  useEffect(() => {
    const current = currentDeadline ? dayjs(currentDeadline) : dayjs();

    if (Constant.UPDATE_DEADLINE_BCY) {
      if (!currentDeadline) {
        // today
        setMinDate(dayjs().format("YYYY-MM-DD"));
      } else {
        // ngày sau currentDeadline
        setMinDate(current.add(1, "day").format("YYYY-MM-DD"));
      }
    } else {
      setMinDate(dayjs().format("YYYY-MM-DD"));
    }
  }, [currentDeadline]);

  const doUpdateDeadline = async () => {
    if (!newDeadline) return;

    try {
      await DocumentService.doUpdateDeadline(Number(docId), newDeadline, type);
      ToastUtils.success("Thiết lập hạn xử lý thành công");
      if (onSuccess) {
        await onSuccess();
      }
      onClose();
    } catch (e) {
      handleError(e);
    }
  };

  return (
    <Dialog open={showDeadlineModal} onOpenChange={setShowDeadlineModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Gia hạn</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Hạn xử lý hiện tại */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Hạn xử lý hiện tại</label>
            <CustomDatePicker
              selected={
                currentDeadline ? parseDateStringYMD(currentDeadline) : null
              }
              onChange={() => {}}
              placeholder="Chọn ngày"
            />
          </div>

          {/* Ngày gia hạn */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Ngày gia hạn</label>
            <CustomDatePicker
              selected={parseDateStringYMD(newDeadline)}
              onChange={(e) => setNewDeadline(formatDateYMD(e))}
              placeholder="Chọn ngày"
            />
          </div>

          {/* Nút hành động */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
            <Button onClick={doUpdateDeadline} disabled={!newDeadline}>
              <i className="fas fa-check-square mr-2" /> Gia hạn xử lý
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
