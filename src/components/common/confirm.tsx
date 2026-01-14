"use client";

import React, { useState } from "react";
import { createRoot } from "react-dom/client";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";

type ConfirmOptions = {
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
};

export function confirmDialog(options: ConfirmOptions = {}): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || typeof document === "undefined") {
      resolve(false);
      return;
    }

    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    const {
      title = "Xác nhận",
      description = "Bạn có chắc chắn?",
      confirmText = "Đồng ý",
      cancelText = "Hủy",
    } = options;

    const cleanup = () => {
      setTimeout(() => {
        try {
          root.unmount();
        } catch {}
        if (container.parentNode) {
          container.parentNode.removeChild(container);
        }
      }, 0);
    };

    function Wrapper() {
      const [open, setOpen] = useState(true);

      return (
        <ConfirmDeleteDialog
          isOpen={open}
          onOpenChange={(o) => {
            setOpen(o);
            if (!o) {
              resolve(false);
              cleanup();
            }
          }}
          onConfirm={() => {
            resolve(true);
            cleanup();
          }}
          title={title}
          description={description}
          confirmText={confirmText}
          cancelText={cancelText}
        />
      );
    }

    root.render(<Wrapper />);
  });
}
