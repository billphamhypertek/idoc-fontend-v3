"use client";
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import { CategoryCode } from "@/definitions/types/category.type";
import {
  useAddAdditionalPosition,
  useRemoveAdditionalPosition,
} from "@/hooks/data/category.data";
import { ToastUtils } from "@/utils/toast.utils";
import { handleError } from "@/utils/common.utils";
import { queryKeys } from "@/definitions";
import { useQueryClient } from "@tanstack/react-query";
import { Save, X } from "lucide-react";

interface AddMorePositionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  positionList: CategoryCode[];
  selectedPositions: number[];
  onSuccess?: () => void;
}

export default function AddMorePositionDialog({
  isOpen,
  onOpenChange,
  userId,
  positionList,
  selectedPositions,
  onSuccess,
}: AddMorePositionDialogProps) {
  const queryClient = useQueryClient();
  const [selectedIds, setSelectedIds] = useState<number[]>(selectedPositions);
  const [removedPositions, setRemovedPositions] = useState<number[]>([]);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);
  const [confirmMessage, setConfirmMessage] = useState<string>("");

  const { mutate: addAdditionalPosition } = useAddAdditionalPosition();
  const { mutate: removeAdditionalPosition } = useRemoveAdditionalPosition();

  useEffect(() => {
    if (isOpen) {
      setSelectedIds(selectedPositions);
      setRemovedPositions([]);
    }
  }, [isOpen, selectedPositions]);

  const handlePositionChange = (positionId: number, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, positionId]);
    } else {
      setSelectedIds((prev) => prev.filter((id) => id !== positionId));
      // Track removed positions
      if (selectedPositions.includes(positionId)) {
        setRemovedPositions((prev) => [...prev, positionId]);
      }
    }
  };

  const handleSave = () => {
    const newPositions = selectedIds.filter(
      (id) => !selectedPositions.includes(id)
    );
    const removedPositionsIds = selectedPositions.filter(
      (id) => !selectedIds.includes(id)
    );

    // Check if there are any changes
    if (newPositions.length === 0 && removedPositionsIds.length === 0) {
      ToastUtils.warning("Bạn chưa có thay đổi nào!");
      return;
    }

    // If only adding new positions, no confirmation needed
    if (removedPositionsIds.length === 0 && newPositions.length > 0) {
      addAdditionalPosition(
        { userId, positions: newPositions },
        {
          onSuccess: () => {
            ToastUtils.success("Thêm chức vụ phụ mới thành công!");
            queryClient.invalidateQueries({
              queryKey: [queryKeys.users.search],
            });
            onOpenChange(false);
            onSuccess?.();
          },
          onError: (error) => {
            handleError(error);
          },
        }
      );
      return;
    }

    // If removing positions, show confirmation dialog
    if (removedPositionsIds.length > 0) {
      const removedPositionNames = removedPositionsIds
        .map((id) => getPositionName(id))
        .join(", ");
      const newPositionNames = newPositions
        .map((id) => getPositionName(id))
        .join(", ");

      let message = `Bạn chắc chắn sẽ xóa chức danh ${removedPositionNames}`;
      if (newPositions.length > 0) {
        message += ` thay thế bằng chức danh ${newPositionNames}`;
      }

      setConfirmMessage(message);
      setShowConfirmDialog(true);
    }
  };

  const handleConfirmSave = () => {
    const newPositions = selectedIds.filter(
      (id) => !selectedPositions.includes(id)
    );
    const removedPositionsIds = selectedPositions.filter(
      (id) => !selectedIds.includes(id)
    );

    if (removedPositionsIds.length > 0) {
      // Remove positions first
      removeAdditionalPosition(
        { userId, positions: removedPositionsIds },
        {
          onSuccess: () => {
            ToastUtils.success("Xóa chức vụ phụ thành công!");
            // Then add new positions if any
            if (newPositions.length > 0) {
              addAdditionalPosition(
                { userId, positions: newPositions },
                {
                  onSuccess: () => {
                    ToastUtils.success("Thêm chức vụ phụ mới thành công!");
                    queryClient.invalidateQueries({
                      queryKey: [queryKeys.users.search],
                    });
                    onOpenChange(false);
                    onSuccess?.();
                  },
                  onError: (error) => {
                    handleError(error);
                  },
                }
              );
            } else {
              queryClient.invalidateQueries({
                queryKey: [queryKeys.users.search],
              });
              onOpenChange(false);
              onSuccess?.();
            }
          },
          onError: (error) => {
            handleError(error);
          },
        }
      );
    }
    setShowConfirmDialog(false);
  };

  const getPositionName = (id: number) => {
    const position = positionList.find((item) => item.id === id);
    return position ? position.name : "";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Chức danh phụ</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Chức danh</Label>
            <div className="max-h-60 overflow-y-auto border rounded-md p-3 space-y-2">
              {positionList.map((position) => (
                <div key={position.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`position-${position.id}`}
                    checked={selectedIds.includes(position.id)}
                    onCheckedChange={(checked) =>
                      handlePositionChange(position.id, checked as boolean)
                    }
                  />
                  <Label
                    htmlFor={`position-${position.id}`}
                    className="text-sm font-normal cursor-pointer"
                  >
                    {position.name}
                  </Label>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSave}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4" />
            Lưu lại
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            <X className="w-4 h-4" />
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>

      {/* Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleConfirmSave}
        title="Xác nhận"
        description={confirmMessage}
        confirmText="Đồng ý"
        cancelText="Hủy"
      />
    </Dialog>
  );
}
