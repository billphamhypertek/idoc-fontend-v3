import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { DecryptionProgress } from "@/services/decryption.service";
import { Progress } from "@/components/ui/progress";
import { useEffect, useRef, useState } from "react";

type Props = {
  isOpen: boolean;
  onForceDisconnect: () => void;
  progress: DecryptionProgress;
  encryptTimer?: boolean;
};
export default function DecryptOverlay({
  isOpen,
  onForceDisconnect,
  progress,
  encryptTimer = false,
}: Props) {
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const timerIdRef = useRef<NodeJS.Timeout | null>(null);

  // Start timer function
  const startTimer = () => {
    if (timerIdRef.current) return;

    timerIdRef.current = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
  };

  // Stop timer function
  const stopTimer = (reset: boolean) => {
    if (timerIdRef.current) {
      clearInterval(timerIdRef.current);
      timerIdRef.current = null;
    }
    if (reset) {
      setElapsedSeconds(0);
    }
  };

  // Handle show/progress changes
  useEffect(() => {
    if (isOpen) {
      startTimer();
      return;
    }

    // Hide popup: stop and reset
    if (!isOpen) {
      stopTimer(true);
    }

    // Cleanup on unmount
    return () => {
      stopTimer(true);
    };
  }, [isOpen]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg space-y-4 w-96">
        <div className="flex justify-between">
          <h4>Đang giải mã tệp tin...</h4>
          <Button variant="ghost" onClick={onForceDisconnect} size="icon">
            <XCircle className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Tổng số tệp:</span>
            <span>{progress.totalFiles}</span>
          </div>
          <div className="flex justify-between">
            <span>Đang giải mã:</span>
            <span>
              {progress.currentFile}/{progress.totalFiles}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Tên tệp:</span>
            <span>{progress.fileName}</span>
          </div>
          {encryptTimer && (
            <div className="flex justify-between">
              <span>Thời gian mã hoá:</span>
              <span>{elapsedSeconds}</span>
            </div>
          )}
        </div>
        <Progress value={progress.currentProgress} />
      </div>
    </div>
  );
}
