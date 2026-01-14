"use client";

import React from "react";
import TransferDone from "./TransferDone";
import { DelegateService } from "@/services/delegate.service";

interface InTransferDoneProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  fromUserId?: string;
  tab?: string;
  isFinishReceive?: boolean;
  onSuccess?: () => void;
}

export default function InTransferDone({
  isOpen,
  onOpenChange,
  documentId,
  fromUserId,
  tab,
  isFinishReceive = false,
  onSuccess,
}: InTransferDoneProps) {
  const handleSubmit = async (params: {
    documentId: string;
    comment: string;
    files: File[];
    tab?: string;
    isFinishReceive?: boolean;
  }) => {
    await DelegateService.docInTransferDone(
      params.documentId,
      params.comment,
      params.files,
      params.tab || "",
      params.isFinishReceive || false
    );
  };

  return (
    <TransferDone
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      documentId={documentId}
      fromUserId={fromUserId}
      onSuccess={onSuccess}
      onSubmit={handleSubmit}
      requireCommentAlways={true}
      requireCommentWhenHasFiles={false}
      fileMaxSize={10}
      tab={tab}
      isFinishReceive={isFinishReceive}
    />
  );
}
