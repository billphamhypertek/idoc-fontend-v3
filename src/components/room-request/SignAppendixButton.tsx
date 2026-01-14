"use client";
import { Button } from "@/components/ui/button";
import { Save, Stamp } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { useSignAppendix } from "@/hooks/data/sign.data";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Constant } from "@/definitions/constants/constant";

interface SignAppendixButtonProps {
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
  file: any;
  callback?: (file: any) => void;
}

export function SignAppendixButton({
  disabled = false,
  className = "",
  text = "Ký xác nhận",
  showIcon = true,
  file,
  callback,
}: SignAppendixButtonProps) {
  const [showSignConfirm, setShowSignConfirm] = useState(false);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  const handlSign = () => {
    setIsConfirmOpen(true);
  };
  const signAppendix = useSignAppendix();

  const handleConfirm = async () => {
    const docNumber = "001"; //todo hardcode
    const commonParams = {
      fileNameOrId: file.name,
      attachId: file.id,
      attachType: Constant.ATTACHMENT_DOWNLOAD_TYPE.DYNAMIC_FORM,
    };
    const onSuccess = () => {
      setShowSignConfirm(true);
      console.log("calling callback");
      callback?.(file);
    };
    const onError = (error: any) => {
      console.error("Error signing document:", error);
    };

    // Gọi API ký phụ lục cho  ID đầu tiên
    try {
      signAppendix.mutateAsync(
        { ...commonParams, docNumber },
        { onSuccess, onError }
      );

      toast({
        title: "Thành công",
        description: `Đã ký xác nhận phiếu thành công`,
        variant: "default",
      });

      setIsConfirmOpen(false);
    } catch (error) {
      console.error("Lỗi khi ký xác nhận:", error);
      toast({
        title: "Lỗi",
        description: "Có lỗi xảy ra khi ký xác nhận phiếu",
        variant: "destructive",
      });
      onError?.(error);
      setIsConfirmOpen(false);
    }
  };

  return (
    <>
      <Button
        disabled={disabled || signAppendix.isPending}
        onClick={handlSign}
        className={`h-9 px-3 text-white border-0 bg-green-600 hover:bg-green-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      >
        {showIcon && <Stamp className="w-4 h-4 mr-1" />}
        {signAppendix.isPending ? "Đang xử lý..." : text}
      </Button>

      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Xác nhận ký xác nhận"
        description={`Bạn có chắc chắn muốn ký xác nhận phiếu đã chọn?`}
        onConfirm={handleConfirm}
        confirmText="Ký xác nhận"
        cancelText="Hủy"
        variant="default"
      />
      <Dialog open={showSignConfirm} onOpenChange={setShowSignConfirm}>
        <DialogContent className="max-w-md p-0">
          <DialogHeader className="p-4 border-b border-gray-200">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Hãy xác nhận
            </DialogTitle>
          </DialogHeader>

          <div className="p-4"></div>

          <DialogFooter className="p-4 border-t border-gray-200">
            <button
              onClick={() => {
                setShowSignConfirm(false);
              }}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black transition-colors flex items-center gap-2"
            >
              <Save size={16} className="text-black" />
              Đồng ý
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
