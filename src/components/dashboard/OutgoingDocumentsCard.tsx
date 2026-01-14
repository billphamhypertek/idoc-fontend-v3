"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { SendHorizontal, Clock } from "lucide-react";
import CompleteModal from "@/components/dialogs/CompleteModal";
import ConfirmAcceptDialog from "@/components/common/ConfirmAcceptDialog";
import { cn } from "@/lib/utils";
import { setAllEncryptFlags, useEncryptStore } from "@/stores/encrypt.store";
import { EncryptionService } from "@/services/encryption.service";

interface DocumentItem {
  id: string;
  title: string;
  type: "incoming" | "outgoing";
  priority: string;
  status: string;
  from?: string;
  to?: string;
  handlingType?: "main" | "coordinate";
  urgentName?: string;
  numberOrSign?: string;
  createDate: string;
}

interface Props {
  documents: DocumentItem[];
  isClient: boolean;
  expandedItems: Record<string, boolean>;
  onToggleExpanded: (id: string) => void;
  onDetailClick: (id: string) => void;
  getPriorityColor: (priority: string) => string;
  onUpdateDocument: (id: string, status: string) => void;
}

const URGENT_PRIORITY = "urgent";

// Component tái sử dụng cho notification dots
const NotificationDot = React.memo<{ showPing?: boolean; className?: string }>(
  ({ showPing = true, className = "" }) => (
    <div className={`relative inline-flex h-4 w-4 ${className}`}>
      {showPing && (
        <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-red-400 opacity-75"></span>
      )}
      <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
    </div>
  )
);

NotificationDot.displayName = "NotificationDot";

const OutgoingDocumentsCard: React.FC<Props> = ({
  documents,
  isClient,
  expandedItems,
  onToggleExpanded,
  onDetailClick,
  getPriorityColor,
  onUpdateDocument,
}) => {
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showEncryptConfirmDialog, setShowEncryptConfirmDialog] =
    useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null
  );
  const { isEncrypt, setEncrypt } = useEncryptStore();

  const handleChange = (val: boolean) => {
    setEncrypt(val);
    setAllEncryptFlags(val);
  };

  const handleConfirmEncrypt = () => {
    setEncrypt(true);
    setAllEncryptFlags(true);
    setShowEncryptConfirmDialog(false);
  };

  const handleCompleteClick = useCallback(
    (documentId: string, e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedDocumentId(documentId);
      setShowCompleteModal(true);
    },
    []
  );

  const handleComplete = useCallback(
    async (opinion: string, file?: File) => {
      if (selectedDocumentId) {
        onUpdateDocument(selectedDocumentId, "completed");
      }
    },
    [selectedDocumentId, onUpdateDocument]
  );

  const currentDateString = useMemo(
    () => (isClient ? new Date().toLocaleDateString("vi-VN") : "Đang tải..."),
    [isClient]
  );
  useEffect(() => {
    if (isEncrypt) {
      EncryptionService.isCheckStartUsbTokenWatcher();
    }
  }, [isEncrypt]);

  const documentItems = useMemo(
    () =>
      documents.map((doc) => {
        const key = `outgoing-${doc.id}`;
        return (
          <div
            key={doc.id}
            className="mb-4 p-4 rounded-xl shadow-md border border-red-400 bg-red-50 transition-all duration-300 cursor-pointer hover:shadow-xl hover:border-red-500"
            onClick={() => onDetailClick(key)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3 flex-wrap">
                {doc.priority === URGENT_PRIORITY && (
                  <NotificationDot className="mr-1" />
                )}
                <NotificationDot className="ml-2" />
                {doc.numberOrSign && (
                  <span className="inline-block px-2 py-1 text-sm rounded-md text-[#1b539e] font-semibold cursor-pointer">
                    {doc.numberOrSign}
                  </span>
                )}

                <span
                  className={cn(
                    "inline-block px-1 text-sm border rounded-lg cursor-pointer",
                    doc.urgentName === "Thường"
                      ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                      : "bg-red-100 text-red-700 border-red-200 font-bold"
                  )}
                >
                  {doc.urgentName}
                </span>
              </div>
            </div>

            <p className="text-lg font-semibold text-gray-800 mb-3">
              {doc.title}
            </p>

            <div className="mb-2 space-y-1">
              {doc.to && (
                <div className="flex items-center gap-1 text-base text-gray-600">
                  <span>📤</span>
                  <span>Đơn vị soạn thảo: {doc.to}</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-base text-gray-600">
                <Clock className="w-4 h-4" />
                <span>
                  Ngày Văn Bản:{" "}
                  {new Date(doc.createDate).toLocaleDateString("vi-VN")}
                </span>
              </div>
            </div>
          </div>
        );
      }),
    [documents, onDetailClick, getPriorityColor, currentDateString]
  );

  return (
    <div className="bg-white border border-gray-200 shadow-lg h-auto flex flex-col pb-4 rounded-xl overflow-hidden">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          className={cn(
            "py-3 px-6 text-base font-semibold transition-colors relative",
            !isEncrypt
              ? "bg-white text-gray-900 border-b-2 border-blue-500"
              : "bg-gray-100 text-gray-600 hover:bg-gray-50"
          )}
          onClick={() => handleChange(false)}
        >
          Văn bản thường
        </button>
        <button
          className={cn(
            "py-3 px-6 text-base font-semibold transition-colors relative",
            isEncrypt
              ? "bg-white text-gray-900 border-b-2 border-blue-500"
              : "bg-gray-100 text-gray-600 hover:bg-gray-50"
          )}
          onClick={() => handleChange(true)}
        >
          Văn bản mật
        </button>
        <div className="flex-1 bg-gray-100"></div>
      </div>

      <div className="pt-3 px-4">
        <div className="mb-1 flex items-center gap-2 p-2 text-gray-800">
          <SendHorizontal className="w-6 h-6 text-orange-500" />
          <span className="font-bold text-2xl">Văn bản đi cần xử lý</span>
          <div className="ml-auto flex items-center gap-2">
            <div className="invisible h-11 min-w-[140px]"></div>
          </div>
        </div>
      </div>

      <div className="pb-4 px-4 flex-1 overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
        {documentItems}
        {documents.length === 0 && (
          <p className="text-base text-gray-600">không tìm thấy dữ liệu</p>
        )}
      </div>
      <CompleteModal
        isOpen={showCompleteModal}
        onClose={() => setShowCompleteModal(false)}
        onComplete={handleComplete}
        title="Hoàn thành"
      />

      <ConfirmAcceptDialog
        isOpen={showEncryptConfirmDialog}
        onOpenChange={setShowEncryptConfirmDialog}
        onConfirm={handleConfirmEncrypt}
        title="Hãy xác nhận"
        description="Mã hóa tệp tin cần khởi chạy công cụ ký mã. Ấn đồng ý để khởi động công cụ!"
        confirmText="Đồng ý"
        cancelText="Đóng"
      />
    </div>
  );
};

export default OutgoingDocumentsCard;
