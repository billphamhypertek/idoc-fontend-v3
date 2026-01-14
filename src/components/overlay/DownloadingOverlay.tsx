import React, { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  isOpen: boolean;
  fileName?: string;
  progress?: number;
  onCancel?: () => void;
}

const DownloadingOverlay: React.FC<Props> = ({
  isOpen,
  fileName,
  progress = 0,
  onCancel,
}) => {
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
    if (isOpen && progress < 100) {
      startTimer();
      return;
    }

    // Download complete: stop and reset
    if (progress >= 100) {
      stopTimer(true);
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
  }, [isOpen, progress]);

  // Handle cancel button
  const handleCancel = () => {
    stopTimer(true);
    onCancel?.();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg space-y-4 w-96">
        <div className="flex justify-between">
          <h4>Đang tải tệp về: {fileName}</h4>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Thời gian tải {elapsedSeconds} giây</span> q
          </div>
        </div>
        <Button onClick={handleCancel}>Hủy</Button>
      </div>
    </div>
  );
};
export default DownloadingOverlay;
