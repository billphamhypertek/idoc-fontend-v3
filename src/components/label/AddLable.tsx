import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus, PlusIcon, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { XCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { ToastUtils } from "@/utils/toast.utils";
import { useState } from "react";
import { useAddTagMutation } from "@/hooks/data/label.data";

interface AddLableProps {
  isAddDialogOpen: boolean;
  handleDialogOpenChange: (open: boolean) => void;
  newLabelName: string;
  setNewLabelName: (name: string) => void;
  onClose: () => void;
  renderBtn: () => React.ReactNode;
  onCreated?: (label: { id: string; name: string }) => void;
  className?: string;
}

interface ErrorResponse {
  response?: {
    status: number;
  };
}
const MAX_LABEL_LENGTH = 50;
const AddLable = ({
  isAddDialogOpen,
  handleDialogOpenChange,
  newLabelName,
  setNewLabelName,
  onClose,
  renderBtn,
  onCreated,
  className,
}: AddLableProps) => {
  const [errorMessage, setErrorMessage] = useState("");
  const addMutation = useAddTagMutation();

  const handleAddLabel = async () => {
    if (newLabelName?.trim()?.length < 1) {
      setErrorMessage("Tên nhãn không được để trống.");
      return;
    }

    if (newLabelName.trim()) {
      // Check label length validation
      if (newLabelName.trim().length > MAX_LABEL_LENGTH) {
        setErrorMessage(
          `Tên nhãn không được vượt quá ${MAX_LABEL_LENGTH} ký tự. `
        );
        return;
      }

      try {
        setErrorMessage(""); // Clear previous error
        const res = await addMutation.mutateAsync(newLabelName.trim());
        if (res?.id) {
          // Clear all data and close dialog on success
          // Notify parent to auto-select this label if provided
          try {
            onCreated?.({ id: String(res.id), name: res.name });
          } catch {}
          setNewLabelName("");
          onClose();
          ToastUtils.daThemNhanMoiThanhCong();
        }
      } catch (error: unknown) {
        console.error("Error adding label:", error);

        // Handle specific error cases
        const errorResponse = error as ErrorResponse;
        if (
          errorResponse?.response?.status === 404 ||
          errorResponse?.response?.status === 400
        ) {
          setErrorMessage("Tên nhãn đã tồn tại. Vui lòng chọn tên khác.");
        } else if (errorResponse?.response?.status === 500) {
          setErrorMessage("Lỗi server. Vui lòng thử lại sau.");
        } else {
          setErrorMessage("Có lỗi xảy ra khi thêm nhãn. Vui lòng thử lại.");
        }
      }
    }
  };
  return (
    <Dialog open={isAddDialogOpen} onOpenChange={handleDialogOpenChange}>
      <DialogTrigger asChild className={className}>
        {renderBtn()}
      </DialogTrigger>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            Thêm nhãn mới
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label
              htmlFor="label-name"
              className="text-sm font-bold text-gray-700"
            >
              Tên nhãn <span className="text-red-500">*</span>
            </Label>
            <Input
              id="label-name"
              value={newLabelName}
              onChange={(e) => {
                setNewLabelName(e.target.value);
                if (errorMessage) {
                  setErrorMessage(""); // Clear error when user types
                }
              }}
              placeholder="Nhập tên nhãn..."
              className={`h-9 text-sm ${
                newLabelName.length > MAX_LABEL_LENGTH
                  ? "border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  : "border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              }`}
              onKeyDown={(e) => {
                if (
                  e.key === "Enter" &&
                  newLabelName.trim() &&
                  newLabelName.trim().length <= MAX_LABEL_LENGTH
                ) {
                  handleAddLabel();
                }
              }}
            />
            {errorMessage && (
              <div className="flex items-center">
                <p className="text-xs text-red-700">{errorMessage}</p>
              </div>
            )}
          </div>
          <div className="flex justify-end gap-4 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setErrorMessage("");
                onClose();
              }}
              className="h-9 px-4 text-sm"
            >
              Hủy
            </Button>
            <Button
              onClick={handleAddLabel}
              className="h-9 px-4 bg-blue-600 hover:bg-blue-700 text-sm font-medium disabled:bg-gray-400 disabled:cursor-not-allowed gap-0"
            >
              <Save className="w-4 h-4 mr-2" />
              Lưu
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddLable;
