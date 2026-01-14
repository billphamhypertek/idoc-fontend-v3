import {
  DecryptionProgress,
  DecryptionService,
} from "@/services/decryption.service";
import { Progress } from "@/components/ui/progress";
type Props = {
  isOpen: boolean;
  progress: DecryptionProgress;
};
export default function EncryptProcessOverlay({ isOpen, progress }: Props) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg space-y-4 w-96">
        <div className="flex justify-between">
          <h4>
            {progress.currentProgress === 0
              ? "Đang chờ ký số"
              : "Đang mã tệp tin"}
          </h4>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Tổng số tệp:</span>
            <span>{progress.totalFiles}</span>
          </div>
          {progress.currentProgress !== 0 && (
            <div className="flex justify-between">
              <span>Đang mã hóa:</span>
              <span>
                {progress.currentFile}/{progress.totalFiles}
              </span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Tên tệp:</span>
            <span>{progress.fileName}</span>
          </div>
        </div>
        {progress.currentProgress !== 0 && (
          <Progress value={progress.currentProgress} />
        )}
      </div>
    </div>
  );
}
