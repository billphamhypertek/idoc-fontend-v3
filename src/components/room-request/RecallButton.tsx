"use client";
import { Button } from "@/components/ui/button";
import { useRecallValueDynamic } from "@/hooks/data/value-dynamic.data";
import { ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import ConfirmDialog from "@/components/common/ConfirmDialog";

interface RecallButtonProps {
  /**
   * ID hoặc danh sách IDs cần thu hồi
   */
  valueIds: number | number[];
  /**
   * Callback khi thu hồi thành công
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

export function RecallButton({
  valueIds,
  onSuccess,
  onError,
  disabled = false,
  className = "",
  text = "Thu hồi",
  showIcon = true,
}: RecallButtonProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const recallMutation = useRecallValueDynamic();

  const handleRecall = () => {
    setIsConfirmOpen(true);
  };

  const handleConfirm = async () => {
    const ids = Array.isArray(valueIds) ? valueIds : [valueIds];

    // Gọi API thu hồi cho từng ID
    try {
      for (const id of ids) {
        await recallMutation.mutateAsync(id);
      }

      toast({
        title: "Thành công",
        description: `Đã thu hồi ${ids.length} phiếu thành công`,
        variant: "default",
      });

      setIsConfirmOpen(false);
      onSuccess?.();
    } catch (error) {
      console.error("Lỗi khi thu hồi:", error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi thu hồi phiếu",
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
        disabled={disabled || recallMutation.isPending}
        onClick={handleRecall}
        className={`h-9 px-3 text-white border-0 bg-blue-600 hover:bg-blue-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {showIcon && <ArrowLeft className="w-4 h-4 mr-1" />}
        {recallMutation.isPending ? "Đang xử lý..." : text}
      </Button>

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Xác nhận thu hồi"
        description={`Bạn có chắc chắn muốn thu hồi ${itemCount} phiếu đã chọn?`}
        onConfirm={handleConfirm}
        confirmText="Thu hồi"
        cancelText="Hủy"
        variant="default"
      />
    </>
  );
}
