"use client";
import { Button } from "@/components/ui/button";
import { useCalendarReviewValueDynamic } from "@/hooks/data/value-dynamic.data";
import { Calendar } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import ConfirmDialog from "@/components/common/ConfirmDialog";

interface CalendarReviewButtonProps {
  valueIds: number | number[];
  onSuccess?: () => void;
  onError?: (error: any) => void;
  disabled?: boolean;
  className?: string;
  text?: string;
  showIcon?: boolean;
}

export function CalendarReviewButton({
  valueIds,
  onSuccess,
  onError,
  disabled = false,
  className = "",
  text = "Duyệt lịch",
  showIcon = true,
}: CalendarReviewButtonProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const calendarReviewMutation = useCalendarReviewValueDynamic();

  const handleCalendarReview = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirm = async () => {
    const ids = Array.isArray(valueIds) ? valueIds : [valueIds];

    try {
      for (const id of ids) {
        await calendarReviewMutation.mutateAsync({
          valueId: id,
        });
      }

      toast({
        title: "Thành công",
        description: `Đã duyệt lịch ${ids.length} phiếu`,
      });

      setIsConfirmOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Lỗi khi duyệt lịch:", error);

      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi duyệt lịch",
        variant: "destructive",
      });

      onError?.(error);
      setIsConfirmOpen(false);
    }
  };

  const itemCount = Array.isArray(valueIds) ? valueIds.length : 1;

  return (
    <>
      <Button
        disabled={disabled || calendarReviewMutation.isPending}
        onClick={handleCalendarReview}
        className={`h-9 px-3 text-white border-0 bg-green-600 hover:bg-green-700 disabled:opacity-50 ${className}`}
      >
        {showIcon && <Calendar className="w-4 h-4 mr-1" />}
        {calendarReviewMutation.isPending ? "Đang xử lý..." : text}
      </Button>

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Xác nhận duyệt lịch"
        description={`Bạn có chắc chắn muốn duyệt lịch ${itemCount} phiếu đã chọn?`}
        onConfirm={handleConfirm}
        confirmText="Duyệt lịch"
        cancelText="Hủy"
        variant="default"
      />
    </>
  );
}
