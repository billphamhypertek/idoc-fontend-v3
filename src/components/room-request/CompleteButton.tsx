"use client";
import { Button } from "@/components/ui/button";
import { useDoneValueDynamic } from "@/hooks/data/value-dynamic.data";
import { CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import ConfirmDialog from "@/components/common/ConfirmDialog";

interface CompleteButtonProps {
  /**
   * ID hoặc danh sách IDs cần hoàn thành
   */
  valueIds: number | number[];
  /**
   * Callback khi hoàn thành thành công
   */
  onSuccess?: () => void;
  /**
   * Callback khi có lỗi
   */
  onError?: (error: any) => void;
  /**
   * Disable button
   */
  disabled?: boolean;
  /**
   * Custom className
   */
  className?: string;
  /**
   * Text hiển thị trên button
   */
  text?: string;
  /**
   * Hiển thị icon
   */
  showIcon?: boolean;
}

export function CompleteButton({
  valueIds,
  onSuccess,
  onError,
  disabled = false,
  className = "",
  text = "Hoàn thành",
  showIcon = true,
}: CompleteButtonProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const doneMutation = useDoneValueDynamic();

  const handleComplete = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirm = async () => {
    const ids = Array.isArray(valueIds) ? valueIds : [valueIds];

    // Gọi API hoàn thành cho từng ID
    try {
      for (const id of ids) {
        await doneMutation.mutateAsync(id);
      }

      toast({
        title: "Thành công",
        description: `Đã hoàn thành ${ids.length} phiếu thành công`,
        variant: "default",
      });

      setIsConfirmOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Lỗi khi hoàn thành:", error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi hoàn thành phiếu",
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
        disabled={disabled || doneMutation.isPending}
        onClick={handleComplete}
        className={`h-9 px-3 text-white border-0 bg-blue-600 hover:bg-blue-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {showIcon && <CheckCircle2 className="w-4 h-4 mr-1" />}
        {doneMutation.isPending ? "Đang xử lý..." : text}
      </Button>

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Xác nhận hoàn thành"
        description={`Bạn có chắc chắn muốn hoàn thành ${itemCount} phiếu đã chọn?`}
        onConfirm={handleConfirm}
        confirmText="Hoàn thành"
        cancelText="Hủy"
        variant="default"
      />
    </>
  );
}
