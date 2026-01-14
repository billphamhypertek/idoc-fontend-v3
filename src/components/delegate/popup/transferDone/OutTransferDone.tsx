"use client";

import React from "react";
import TransferDone from "./TransferDone";
import { handleError } from "@/utils/common.utils";
import { DraftService } from "@/services/draft.service";

interface OutTransferDoneProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  fromUserId?: string;
  onSuccess?: () => void;
}

export default function OutTransferDone({
  isOpen,
  onOpenChange,
  documentId,
  fromUserId,
  onSuccess,
}: OutTransferDoneProps) {
  const handleSubmit = async (params: {
    documentId: string;
    comment: string;
    files: File[];
    tab?: string;
    isFinishReceive?: boolean;
  }) => {
    // Gọi finish trước
    await DraftService.finish(params.documentId, params.comment);

    // Sau đó gọi addAttachments nếu có files
    if (params.files && params.files.length > 0) {
      try {
        await DraftService.addAttachments(
          "DOCUMENT",
          params.documentId,
          params.files
        );
      } catch (attachmentError) {
        handleError(attachmentError);
        throw attachmentError;
      }
    }
  };

  return (
    <TransferDone
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      documentId={documentId}
      fromUserId={fromUserId}
      onSuccess={onSuccess}
      onSubmit={handleSubmit}
      requireCommentAlways={false}
      requireCommentWhenHasFiles={true}
      fileMaxSize={10}
    />
  );
}
