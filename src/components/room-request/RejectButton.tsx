"use client";
import { Button } from "@/components/ui/button";
import { useRejectValueDynamic } from "@/hooks/data/value-dynamic.data";
import { X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

interface RejectButtonProps {
  valueIds: number | number[];
  onSuccess?: () => void;
  onError?: (error: any) => void;
  disabled?: boolean;
  className?: string;
  text?: string;
  showIcon?: boolean;
}

export function RejectButton({
  valueIds,
  onSuccess,
  onError,
  disabled = false,
  className = "",
  text = "Từ chối",
  showIcon = true,
}: RejectButtonProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const rejectMutation = useRejectValueDynamic();

  const MAX_LENGTH = 1000;

  const handleReject = () => {
    setIsConfirmOpen(true);
    setReason("");
    setErrorMessage("");
  };

  const handleReasonChange = (value: string) => {
    setReason(value);

    if (value.length > MAX_LENGTH) {
      setErrorMessage(`Lý do từ chối không được vượt quá ${MAX_LENGTH} ký tự`);
    } else {
      setErrorMessage("");
    }
  };

  const handleConfirm = async () => {
    // Validate reason is required and length
    if (!reason.trim()) {
      setErrorMessage("Vui lòng nhập lý do từ chối");
      return;
    }

    if (reason.length > MAX_LENGTH) {
      setErrorMessage(`Lý do từ chối không được vượt quá ${MAX_LENGTH} ký tự`);
      return;
    }

    const ids = Array.isArray(valueIds) ? valueIds : [valueIds];

    try {
      for (const id of ids) {
        await rejectMutation.mutateAsync({
          valueId: id,
          reason: reason.trim() || undefined,
        });
      }

      toast({
        title: "Thành công",
        description: `Đã từ chối ${ids.length} phiếu`,
      });

      setIsConfirmOpen(false);
      setReason("");
      setErrorMessage("");
      onSuccess?.();
    } catch (error) {
      console.error("Lỗi khi từ chối:", error);

      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi từ chối",
        variant: "destructive",
      });

      onError?.(error);
      setIsConfirmOpen(false);
    }
  };

  const handleCancel = () => {
    setIsConfirmOpen(false);
    setReason("");
    setErrorMessage("");
  };

  const itemCount = Array.isArray(valueIds) ? valueIds.length : 1;

  return (
    <>
      <Button
        disabled={disabled || rejectMutation.isPending}
        onClick={handleReject}
        className={`h-9 px-3 text-white border-0 bg-red-600 hover:bg-red-700 disabled:opacity-50 ${className}`}
      >
        {showIcon && <X className="w-4 h-4 mr-1" />}
        {rejectMutation.isPending ? "Đang xử lý..." : text}
      </Button>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Xác nhận từ chối</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn từ chối phiếu đã chọn?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lý do từ chối <span className="text-red-500">*</span>
              </label>
              <Textarea
                value={reason}
                onChange={(e) => handleReasonChange(e.target.value)}
                placeholder="Nhập lý do từ chối..."
                rows={4}
                className={`resize-none ${errorMessage ? "border-red-500" : ""}`}
                maxLength={MAX_LENGTH}
              />
              <div className="flex justify-between items-center mt-1">
                {errorMessage && (
                  <p className="text-sm text-red-600">{errorMessage}</p>
                )}
                <p className="text-sm text-gray-500 ml-auto">
                  {reason.length}/{MAX_LENGTH}
                </p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCancel}>
              Hủy
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirm}
              disabled={
                rejectMutation.isPending ||
                !reason.trim() ||
                reason.length > MAX_LENGTH
              }
              className="flex items-center gap-1 h-9 px-2 text-xs text-white hover:bg-red-700 hover:text-white border-none bg-red-600"
            >
              {rejectMutation.isPending ? "Đang xử lý..." : "Từ chối"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
