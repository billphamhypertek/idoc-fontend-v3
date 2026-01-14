"use client";

import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "../ui/textarea";
import { Check, X } from "lucide-react";

interface ConfirmDeleteDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  haveNote?: boolean;
  note?: string;
  setNote?: (note: string) => void;
  positionButton?: boolean;
  maxLength?: number;
}

export default function ConfirmDeleteDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  title = "Hãy xác nhận",
  description = "Bạn có muốn xóa văn bản này",
  confirmText = "Đồng ý",
  cancelText = "Đóng",
  isLoading = false,
  haveNote = false,
  note = "",
  setNote,
  positionButton = false,
  maxLength = 500,
}: ConfirmDeleteDialogProps) {
  const handleConfirm = () => {
    onConfirm();
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-base font-bold text-gray-900">
            {title}
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-base text-gray-700 py-1">
          {description}
          {haveNote && (
            <div className="mt-3">
              <Textarea
                value={note}
                onChange={(e) => setNote?.(e.target.value)}
                placeholder="Nhập ghi chú..."
                className="min-h-[80px]"
                maxLength={maxLength}
              />
            </div>
          )}
        </DialogDescription>
        <DialogFooter className="flex gap-1 pt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className={`px-4 h-9 text-sm inline-flex items-center justify-center ${
              positionButton ? "order-2" : "order-1"
            }`}
            disabled={isLoading}
          >
            <X className="w-4 h-4 mr-2" />
            {cancelText}
          </Button>
          <Button
            size="sm"
            onClick={handleConfirm}
            className={`bg-blue-600 hover:bg-blue-700 px-4 h-9 text-sm inline-flex items-center justify-center ${
              positionButton ? "order-1" : "order-2"
            }`}
            disabled={isLoading}
          >
            <Check className="w-4 h-4 mr-2" />
            {confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
