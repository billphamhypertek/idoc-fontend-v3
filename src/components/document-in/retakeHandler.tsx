import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import React, { useState } from "react";
import { useRetakeDoc } from "@/hooks/data/document-in.data";
import { DocumentInRetakeDialog } from "@/components/dialogs/DocumentInRetakeDialog";

interface RetakeHandlerProps {
  selectedItemId: number | null; // ID của item được chọn (chỉ hỗ trợ 1 item)
  onSuccess: () => void; // Callback sau khi consult thành công (ví dụ: refetch, clear selection)
  className?: string; // Class tùy chỉnh cho button
}

export function RetakeHandler({
  selectedItemId,
  onSuccess,
}: RetakeHandlerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const retakeMutation = useRetakeDoc();

  const handleReturnDialogSubmit = (submitData: {
    processingContent: string;
    files: File[];
  }) => {
    if (!selectedItemId) {
      console.error("No item, role, or currentNode selected");
      return;
    }
    const fd = new FormData();
    fd.append("docId", String(selectedItemId) ?? "");
    fd.append("comment", submitData.processingContent ?? "");
    submitData.files.forEach((file: File) => {
      fd.append("files", file);
    });
    retakeMutation.mutate(fd, {
      onSuccess: () => {
        console.log("Thu hồi thành công");
        setIsDialogOpen(false);
        if (onSuccess) onSuccess();
      },
      onError: (err) => {
        console.error("Lỗi thu hồi văn bản:", err);
      },
    });
  };

  return (
    <>
      <Button
        variant="outline"
        className="text-white border-0 h-9 px-3 text-xs disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 hover:text-white"
        onClick={() => setIsDialogOpen(true)}
      >
        <RotateCcw className="w-4 h-4 mr-1" />
        Thu hồi
      </Button>
      <DocumentInRetakeDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleReturnDialogSubmit}
      />
    </>
  );
}
