"use client";

import React from "react";
import DocumentReject from "@/components/document-out/DocumentReject";
import { DelegateService } from "@/services/delegate.service";
import { handleError } from "@/utils/common.utils";

interface InRejectProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  fromUserId?: string;
  onSuccess?: () => void;
}

export default function InReject({
  isOpen,
  onOpenChange,
  documentId,
  fromUserId,
  onSuccess,
}: InRejectProps) {
  const handleSubmit = async (data: {
    processingContent: string;
    userId?: string;
    files: File[];
  }) => {
    await DelegateService.docInReject(
      documentId,
      data.processingContent,
      data.files
    );
  };

  return (
    <DocumentReject
      docId={documentId}
      onClose={() => onOpenChange(false)}
      showRejectModal={isOpen}
      setShowRejectModal={onOpenChange}
      onSuccess={onSuccess}
      showUserSelection={false}
      onSubmit={handleSubmit}
    />
  );
}
