import { Button } from "@/components/ui/button";
import { Undo2 } from "lucide-react";
import React, { useState } from "react";
import {
  useRejectDocumentIn,
  useReturnHandleList,
} from "@/hooks/data/document-in.data";
import DocumentReject from "@/components/document-out/DocumentReject";

interface ReturnHandlerProps {
  selectedItemId: number | null; // ID của item được chọn (chỉ hỗ trợ 1 item)
  currentNode: number | null;
  onSuccess: () => void; // Callback sau khi consult thành công (ví dụ: refetch, clear selection)
  className?: string; // Class tùy chỉnh cho button
}

export function ReturnHandler({
  selectedItemId,
  currentNode,
  onSuccess,
}: ReturnHandlerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: rejectUserList } = useRejectDocumentIn(
    selectedItemId?.toString()
  );
  const returnMutation = useReturnHandleList();

  const handleClose = () => {
    setIsDialogOpen(false);
  };

  const handleReturnDialogSubmit = (submitData: {
    processingContent: string;
    userId?: string;
    files: File[];
  }) => {
    if (!selectedItemId || !currentNode) {
      console.error("No item, role, or currentNode selected");
      return;
    }
    if (!submitData.userId) {
      return;
    }
    const fd = new FormData();
    fd.append("docId", String(selectedItemId) ?? "");
    fd.append("comment", submitData.processingContent ?? "");
    fd.append("userId", submitData.userId);
    fd.append("nodeId", String(currentNode) ?? "");
    submitData.files.forEach((file: File) => {
      fd.append("files", file);
    });
    returnMutation.mutate(fd, {
      onSuccess: () => {
        console.log("Trả lại thành công");
        setIsDialogOpen(false);
        if (onSuccess) onSuccess();
      },
      onError: (err) => {
        console.error("Lỗi trả lại văn bản:", err);
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
        <Undo2 className="w-4 h-4 mr-1" />
        Trả lại
      </Button>
      <DocumentReject
        docId={String(selectedItemId)}
        onClose={handleClose}
        showRejectModal={isDialogOpen}
        setShowRejectModal={setIsDialogOpen}
        onSuccess={onSuccess}
        listReceiveAndSend={rejectUserList ?? []}
        onSubmit={handleReturnDialogSubmit}
      />
    </>
  );
}
