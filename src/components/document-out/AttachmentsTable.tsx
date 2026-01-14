import React from "react";
import { Table } from "@/components/ui/table";
import type { Column } from "@/definitions/types/table.type";
import {
  Check,
  Download,
  Eye,
  Key,
  KeyRound,
  Pencil,
  Share as ShareIcon,
} from "lucide-react";

type Attachment = {
  id: string;
  name: string;
  displayName: string;
  encrypt?: boolean;
  createBy?: string;
};

type Props = {
  attachments?: Attachment[];
  encryptShowing: boolean;
  isClericalRole: boolean;
  showAll: boolean;
  onToggleShowAll: () => void;
  onLoadPdf: (index: number) => void;
  viewFile: (file: Attachment, index: number) => void;
  isViewFile: (file: Attachment) => boolean;
  isViewPdfEncrypt: (file: Attachment) => boolean;
  isVerifierPDF: (file: Attachment) => boolean;
  verifierPDF: (fileName: string) => void;
  isView: (fileName: string) => boolean;
  downloadFile: (file: Attachment) => void;
  doOpenShare: (file: Attachment) => void;
  signFileEncrypt: (fileName: string, encrypt: boolean, fileId: string) => void;
  FIX_LAYOUT_AND_ADD_ATTACH_BUTTON_H05: boolean;
  getFilenameClass: (index: number) => string;
};

const AttachmentsTable: React.FC<Props> = ({
  attachments = [],
  encryptShowing,
  isClericalRole,
  showAll,
  onToggleShowAll,
  onLoadPdf,
  viewFile,
  isViewFile,
  isViewPdfEncrypt,
  isVerifierPDF,
  verifierPDF,
  isView,
  downloadFile,
  doOpenShare,
  signFileEncrypt,
  FIX_LAYOUT_AND_ADD_ATTACH_BUTTON_H05,
  getFilenameClass,
}) => {
  const displayed = FIX_LAYOUT_AND_ADD_ATTACH_BUTTON_H05
    ? showAll
      ? attachments
      : attachments?.slice(0, 3)
    : attachments;

  const columns: Column<Attachment>[] = [
    {
      header: "STT",
      accessor: (_item, index) => index + 1,
      className: "w-12 text-center",
    },
    {
      header: "Tên file",
      accessor: (item, index) => (
        <span className={getFilenameClass(index)}>
          {item.displayName}
          {item.encrypt && (
            <KeyRound className="inline-block text-red-500 ml-2" />
          )}
        </span>
      ),
      className: "w-1/2 cursor-pointer",
    },
    {
      header: "Thao tác",
      type: "actions",
      renderActions: (item, index) => (
        <div className="flex items-center justify-center gap-2">
          {(isViewFile(item) || isViewPdfEncrypt(item)) && (
            <a
              onClick={(e) => {
                e.stopPropagation();
                // !encryptShowing ? onLoadPdf(index) : viewFile(item, index);
              }}
              className="mx-2 cursor-pointer"
            >
              <Eye />
            </a>
          )}
          {isVerifierPDF(item) && (
            <a
              onClick={(e) => {
                e.stopPropagation();
                verifierPDF(item.name);
              }}
              className="mx-2 cursor-pointer"
            >
              <Check />
            </a>
          )}
          {((!isView(item.name) && !encryptShowing) ||
            (!isView(item.name) && encryptShowing && isClericalRole)) && (
            <a
              onClick={(e) => {
                e.stopPropagation();
                downloadFile(item);
              }}
              className="mx-2 cursor-pointer"
            >
              <Download />
            </a>
          )}
          {item.encrypt && (
            <>
              <a
                onClick={(e) => {
                  e.stopPropagation();
                  doOpenShare(item);
                }}
                className="mx-2 cursor-pointer"
              >
                <ShareIcon />
              </a>
              {!FIX_LAYOUT_AND_ADD_ATTACH_BUTTON_H05 && (
                <a
                  onClick={(e) => {
                    e.stopPropagation();
                    signFileEncrypt(item.name, !!item.encrypt, item.id);
                  }}
                  className="mx-2 cursor-pointer"
                >
                  <Pencil />
                </a>
              )}
            </>
          )}
        </div>
      ),
      className: "w-36 text-center",
    },
  ];

  return (
    <div>
      <Table
        sortable={true}
        columns={columns}
        dataSource={displayed}
        showPagination={false}
        onRowClick={(_record, index) => {
          //   !encryptShowing ? onLoadPdf(index) : viewFile(displayed[index], index);
        }}
      />
      {FIX_LAYOUT_AND_ADD_ATTACH_BUTTON_H05 && attachments?.length > 3 && (
        <div className="text-center mt-2">
          <button onClick={onToggleShowAll} className="text-blue-500">
            {showAll ? "Thu gọn" : "Xem thêm"}
          </button>
        </div>
      )}
    </div>
  );
};

export default AttachmentsTable;
