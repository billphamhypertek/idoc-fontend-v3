"use client";

import React, { useState, useCallback, useMemo, useEffect } from "react";
import { Mail, Clock, Share2, Check, Loader2, ChevronDown } from "lucide-react";
import CompleteModal from "@/components/dialogs/CompleteModal";
import ConfirmAcceptDialog from "@/components/common/ConfirmAcceptDialog";
import { cn } from "@/lib/utils";
import { setAllEncryptFlags, useEncryptStore } from "@/stores/encrypt.store";
import { EncryptionService } from "@/services/encryption.service";
import { isClericalOrDeputyRoleDashboard } from "@/utils/token.utils";
import WorkAssignDialog from "../work-assign/createDialog";
import { Constant } from "@/definitions/constants/constant";

enum DocumentStatus {
  DONE = "DONE",
}

interface DocumentItem {
  id: string;
  title: string;
  type: "incoming" | "outgoing";
  priority: string; // "urgent" | "regular" | ...
  status: string;
  from?: string;
  to?: string;
  handlingType?: "main" | "coordinate";
  documentNumber?: string; // Số văn bản đến
  documentSymbol?: string; // Ký hiệu văn bản đến
  numberArrivalStr: string;
  urgentName: string;
  dateArrival: string | number;
}

interface Props {
  incomingHandling: "main" | "coordinate";
  onIncomingHandlingChange: (val: "main" | "coordinate") => void;
  documents: DocumentItem[];
  isClient: boolean;
  expandedItems: Record<string, boolean>;
  onToggleExpanded: (id: string) => void;
  onDetailClick: (id: string) => void;
  getPriorityColor: (priority: string) => string;
  onUpdateDocument: (id: string, status: string) => void;
  isFiltering?: boolean;
  setIsFiltering?: (value: boolean) => void;
}

const IncomingDocumentsCard: React.FC<Props> = ({
  incomingHandling,
  onIncomingHandlingChange,
  documents,
  isClient,
  expandedItems,
  onToggleExpanded,
  onDetailClick,
  getPriorityColor,
  onUpdateDocument,
  isFiltering = false,
  setIsFiltering,
}) => {
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showEncryptConfirmDialog, setShowEncryptConfirmDialog] =
    useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(
    null
  );
  const [openWorkAssignDialog, setOpenWorkAssignDialog] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentItem | null>(
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
    async (_opinion: string, _file?: File) => {
      if (selectedDocumentId) {
        onUpdateDocument(selectedDocumentId, DocumentStatus.DONE);
      }
    },
    [selectedDocumentId, onUpdateDocument]
  );

  const currentDateString = useMemo(
    () => (isClient ? new Date().toLocaleDateString("vi-VN") : "Đang tải..."),
    [isClient]
  );

  const documentItems = useMemo(
    () =>
      documents.map((doc) => {
        const key = `incoming-${doc.id}`;
        return (
          <div
            key={doc.id}
            className="mb-4 p-4 rounded-xl shadow-md border border-red-400 bg-red-50 transition-all duration-300 cursor-pointer hover:shadow-xl hover:border-red-500"
            onClick={() => onDetailClick(key)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-1 flex-wrap">
                <div className="relative ml-2 inline-flex">
                  <span className="animate-ping absolute inline-flex h-4 w-4 rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500"></span>
                </div>
                <span className="inline-block px-2 py-1 text-sm rounded-md text-[#1b539e] font-semibold cursor-pointer">
                  {doc.numberArrivalStr}
                </span>

                <span
                  className={cn(
                    "inline-block px-1 text-sm border rounded-lg cursor-pointer",
                    doc.urgentName === "Thường"
                      ? "bg-yellow-100 text-yellow-800 border-yellow-200"
                      : "bg-red-100 text-red-700 border-red-200 font-bold"
                  )}
                  // onClick={() =>
                  //   navigate(`/document-out/main/detail/${doc.docId}`)
                  // }
                >
                  {doc.urgentName}
                </span>
              </div>
            </div>

            <p className="text-xl font-bold text-gray-800 mb-3">{doc.title}</p>

            <div className="mb-2 space-y-1">
              {doc.to && (
                <div className="flex items-center gap-1 text-base text-gray-600">
                  <span>📤</span>
                  <span>Từ: {doc.to}</span>
                </div>
              )}

              {(doc.documentNumber || doc.documentSymbol) && (
                <div className="flex items-center gap-1 text-base text-gray-600">
                  <span>📄</span>
                  <span>Số, KH: </span>
                  <span className="font-medium">
                    {doc.documentNumber}
                    {doc.documentNumber && doc.documentSymbol && ", "}
                    {doc.documentSymbol}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-lg text-gray-600">
                <Clock className="w-4 h-4" />
                <span>
                  Hạn: {new Date(doc.dateArrival).toLocaleDateString("vi-VN")}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className="px-4 py-1.5 bg-white border border-gray-300 rounded-md text-blue-900 font-bold text-lg hover:bg-gray-100 hover:text-blue-950 transition-colors"
                  onClick={(e) => handleCompleteClick(doc.id, e)}
                >
                  <Check className="w-4 h-4 mr-1 inline" />
                  Hoàn thành
                </button>

                {!isClericalOrDeputyRoleDashboard() && (
                  <button
                    className="px-4 py-1.5 bg-white border border-gray-300 rounded-md text-blue-900 font-bold text-base hover:bg-gray-100 hover:text-blue-950 transition-colors"
                    onClick={(e) => {
                      setOpenWorkAssignDialog(true);
                      e.stopPropagation();
                      setSelectedDocument(doc);
                    }}
                  >
                    <Share2 className="w-4 h-4 mr-1 inline" />
                    Giao việc
                  </button>
                )}
              </div>
            </div>
          </div>
        );
      }),
    [
      documents,
      onDetailClick,
      getPriorityColor,
      handleCompleteClick,
      currentDateString,
    ]
  );
  useEffect(() => {
    if (isEncrypt) {
      EncryptionService.isCheckStartUsbTokenWatcher();
    }
  }, [isEncrypt]);

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
          <Mail className="w-6 h-6 text-blue-400" />
          <span className="font-bold text-2xl">Văn bản đến cần xử lý</span>

          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <select
                className="text-base border border-gray-300 rounded-lg bg-white h-11 px-4 py-2 pr-10 appearance-none cursor-pointer hover:bg-gray-50 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 transition-all outline-none min-w-[140px]"
                value={incomingHandling}
                onChange={(e) => {
                  if (setIsFiltering) {
                    setIsFiltering(true);
                    setTimeout(() => setIsFiltering(false), 500);
                  }
                  const value =
                    e.target.value === "main" ? "main" : "coordinate";
                  onIncomingHandlingChange(value);
                }}
              >
                <option value="main">Xử lý chính</option>
                <option value="coordinate">Phối hợp</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
      <div className="pb-4 px-4 flex-1 overflow-y-auto max-h-96 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
        {documentItems}
        {documents.length === 0 && (
          <p className="text-lg text-gray-600">không tìm thấy dữ liệu</p>
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
      {openWorkAssignDialog && (
        <WorkAssignDialog
          open={openWorkAssignDialog}
          onClose={() => {
            setOpenWorkAssignDialog(false);
          }}
          // isAddChildTask={true}
          // parentTaskFromDetail={selectedDocument}
          documentDetail={selectedDocument}
          documentType={Constant.HSTL_DOCUMENT_TYPE.VAN_BAN_DEN}
        />
      )}{" "}
    </div>
  );
};

export default IncomingDocumentsCard;
