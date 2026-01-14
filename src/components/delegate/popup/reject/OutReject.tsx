"use client";

import React, { useState, useEffect } from "react";
import DocumentReject from "@/components/document-out/DocumentReject";
import { DraftService } from "@/services/draft.service";
import { handleError } from "@/utils/common.utils";
import type { ReturnDocumentInUser } from "@/definitions/types/document.type";

interface OutRejectProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  fromUserId?: string;
  onSuccess?: () => void;
}

interface User {
  userId: string;
  fullName: string;
  positionName: string;
  orgName: string;
  nodeId: string;
  checked?: boolean;
}

export default function OutReject({
  isOpen,
  onOpenChange,
  documentId,
  fromUserId,
  onSuccess,
}: OutRejectProps) {
  const [userList, setUserList] = useState<ReturnDocumentInUser[]>([]);
  // Map để lưu nodeId theo userId (vì ReturnDocumentInUser không có nodeId)
  const [userIdToNodeIdMap, setUserIdToNodeIdMap] = useState<
    Map<string, string>
  >(new Map());

  useEffect(() => {
    if (isOpen) {
      doLoadUsers();
    }
  }, [isOpen, documentId]);

  const doLoadUsers = async () => {
    try {
      const data = await DraftService.getUsersReject(documentId);
      // Map data từ getUsersReject sang ReturnDocumentInUser format
      const mappedData: ReturnDocumentInUser[] = data.map((user: User) => ({
        userId: Number(user.userId),
        fullName: user.fullName,
        positionName: user.positionName,
        orgName: user.orgName,
        pId: Number(user.userId), // Map userId thành pId
      }));
      setUserList(mappedData);

      // Tạo Map để lưu nodeId theo userId
      const nodeIdMap = new Map<string, string>();
      data.forEach((user: User) => {
        nodeIdMap.set(String(user.userId), String(user.nodeId));
      });
      setUserIdToNodeIdMap(nodeIdMap);
    } catch (error) {
      handleError(error);
      setUserList([]);
      setUserIdToNodeIdMap(new Map());
    }
  };

  const handleSubmit = async (data: {
    processingContent: string;
    userId?: string;
    files: File[];
  }) => {
    if (!data.userId) {
      throw new Error("Bạn cần chọn người trả lại");
    }

    // Lấy nodeId từ Map
    const nodeId = userIdToNodeIdMap.get(data.userId);

    await DraftService.rejectToUser({
      docId: documentId,
      comment: data.processingContent,
      userId: data.userId,
      nodeId: nodeId,
      delegate: true,
      files: data.files,
    });
  };

  return (
    <DocumentReject
      docId={documentId}
      onClose={() => onOpenChange(false)}
      showRejectModal={isOpen}
      setShowRejectModal={onOpenChange}
      onSuccess={onSuccess}
      listReceiveAndSend={userList}
      showUserSelection={true}
      onSubmit={handleSubmit}
    />
  );
}
