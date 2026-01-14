import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { UploadEncryptionProgress } from "@/services/upload-encryption.service";
import { Progress } from "@/components/ui/progress";
import React from "react";

type Props = {
  isOpen: boolean;
  progress: UploadEncryptionProgress;
  onForceDisconnect: () => void;
};

export default function UploadEncryptOverlay({
  isOpen,
  progress,
  onForceDisconnect,
}: Props) {
  if (!isOpen || progress === null) {
    return null;
  }
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg space-y-4 w-96">
        <div className="flex justify-between">
          {progress?.currentProgress === 0
            ? "Đang chọn tệp"
            : "Đang tải tệp lên"}
          <Button variant="ghost" onClick={onForceDisconnect} size="icon">
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Tên tệp:</span>
            <span>{progress.fileName}</span>
          </div>
          <Progress value={progress.currentProgress} />
        </div>
      </div>
    </div>
  );
}
