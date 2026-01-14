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
import { Check, X } from "lucide-react";

interface ConfirmAcceptDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export default function ConfirmAcceptDialog({
  isOpen,
  onOpenChange,
  onConfirm,
  title = "Hãy xác nhận",
  description = "Bạn có muốn tiếp nhận công việc này?",
  confirmText = "Đồng ý",
  cancelText = "Đóng",
  isLoading = false,
}: ConfirmAcceptDialogProps) {
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
        </DialogDescription>
        <DialogFooter className="flex gap-2 pt-3">
          <Button
            size="sm"
            onClick={handleConfirm}
            className="bg-blue-600 hover:bg-blue-700 px-4 h-9 text-sm inline-flex items-center justify-center"
            disabled={isLoading}
          >
            <Check className="w-4 h-4 mr-2" />
            {confirmText}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="px-4 h-9 text-sm inline-flex items-center justify-center"
            disabled={isLoading}
          >
            <X className="w-4 h-4 mr-2" />
            {cancelText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
