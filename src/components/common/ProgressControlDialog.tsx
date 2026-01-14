"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { DocumentService } from "@/services/document.service";
import { ToastUtils } from "@/utils/toast.utils";
import { handleError } from "@/utils/common.utils";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/definitions";

type ProgressControlDialogProps = {
  isOpen: boolean;
  onOpenChange?: (open: boolean) => void;
  onToggle?: (open: boolean) => void; // backward compatibility
  // Service-submit mode
  documentId?: string;
  currentTab?: string;
  onSuccess?: () => void;
  // Callback-submit mode
  onSubmit?: (data: {
    progress: number;
    comment: string;
  }) => Promise<void> | void;
  // Initial value (accept both for backward compatibility)
  currentProgress?: number;
  progress?: number;
};

export default function ProgressControlDialog({
  isOpen,
  onOpenChange,
  onToggle,
  documentId,
  currentProgress,
  progress,
  currentTab = "",
  onSuccess,
  onSubmit,
}: ProgressControlDialogProps) {
  const queryClient = useQueryClient();
  const close = (open: boolean) => {
    if (onOpenChange) return onOpenChange(open);
    if (onToggle) return onToggle(open);
  };
  const initialProgress = currentProgress ?? progress ?? 0;
  const [localProgress, setLocalProgress] =
    React.useState<number>(initialProgress);
  const [comment, setComment] = React.useState<string>("");
  const [submitting, setSubmitting] = React.useState(false);

  // keep state in sync when dialog opens with new props
  React.useEffect(() => {
    if (isOpen) {
      setLocalProgress(currentProgress ?? progress ?? 0);
      setComment("");
    } else {
      // Clear comment when dialog closes
      setComment("");
    }
  }, [isOpen, currentProgress, progress]);

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      if (onSubmit) {
        await onSubmit({ progress: localProgress, comment });
      } else if (documentId) {
        await DocumentService.doUpdateProgress(
          Number(documentId),
          String(localProgress ?? 0),
          comment ?? "",
          currentTab ?? ""
        );
        ToastUtils.success("Thiết lập tiến độ thành công");
        onSuccess?.();
      }
      close(false);
      queryClient.invalidateQueries({
        queryKey: [queryKeys.documentOut.list],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.delegate.getListByHandleTypeAndStatus],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.task.getFindByIdTask],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.task.getTracking],
      });
    } catch (err: any) {
      handleError(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={close}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-bold">
            Thiết lập tiến độ xử lý
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-1">
          <div className="grid grid-cols-12 items-center gap-3">
            <label className="col-span-4 text-right text-sm text-gray-700 font-bold">
              Tiến độ xử lý
            </label>
            <div className="col-span-8">
              <div className="flex items-center gap-3">
                <div className="w-full">
                  <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={[localProgress]}
                    onValueChange={(v) => setLocalProgress(v?.[0] ?? 0)}
                  />
                </div>
                <div className="w-12 text-right text-sm font-medium">
                  {localProgress}%
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-3 items-start">
            <label className="col-span-4 text-right text-sm text-gray-700 mt-2 font-bold">
              Nội dung ý kiến
            </label>
            <div className="col-span-8">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Nhập nội dung ý kiến"
                maxLength={200}
                className="h-[90px]"
              />
              <div className="text-xs text-gray-500 text-right mt-1">
                {comment.length}/200
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => close(false)}
            disabled={submitting}
          >
            Đóng
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {submitting ? "Đang cập nhật..." : "Cập nhật"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
