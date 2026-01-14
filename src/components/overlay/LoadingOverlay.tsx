import React, { useEffect, useRef, useState } from "react";

type Props = {
  isOpen: boolean;
  isLoading: boolean | undefined;
  text?: string;
};

export default function LoadingOverlay({
  isOpen,
  isLoading,
  text = "Đang tải tệp",
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
    if (isOpen && !!isLoading) {
      startTimer();
      return;
    }

    // Download complete: stop and reset
    if (!isLoading) {
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
  }, [isOpen, isLoading]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg space-y-4 w-96">
        <div className="flex justify-between">
          <h4>{text}</h4>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Thời gian chạy {elapsedSeconds} giây</span>
          </div>
        </div>
      </div>
    </div>
  );
}
