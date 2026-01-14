import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X, Save } from "lucide-react";

type ChangeFilenameDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (fileName: string) => void;
  onCancel: () => void;
  originalFileName?: string;
};

const ChangeFilenameDialog: React.FC<ChangeFilenameDialogProps> = ({
  open,
  onClose,
  onConfirm,
  onCancel,
  originalFileName = "",
}) => {
  const [fileName, setFileName] = useState(originalFileName);

  const handleSave = () => {
    if (fileName.trim()) {
      onConfirm(fileName.trim());
    }
  };

  const handleCancel = () => {
    onCancel();
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent
        className="sm:max-w-md"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-bold text-gray-900">
            Đổi tên tệp
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label
              htmlFor="filename"
              className="text-sm font-medium text-gray-700"
            >
              Tên tệp
            </Label>
            <Input
              id="filename"
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              placeholder="Nhập tên tệp"
              className="w-full"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleCancel}
            className="flex items-center gap-1 h-9 px-3 text-xs text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-md font-medium transition-colors"
          >
            <X className="w-3 h-3" />
            Hủy
          </Button>
          <Button
            onClick={handleSave}
            disabled={!fileName || fileName.trim() === ""}
            className="flex items-center gap-1 h-9 px-3 text-xs bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-md font-medium transition-colors"
          >
            <Save className="w-3 h-3" />
            Lưu
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ChangeFilenameDialog;
