"use client";
import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronDown, ChevronRight, Paperclip, Plus } from "lucide-react";
import DraftAttachmentFiles from "@/components/document-in/DraftAttachmentFiles";
import DocumentAttachmentFiles from "@/components/document-in/DocumentAttachmentFiles";
import AttachmentVersionFiles from "@/components/document-in/AttachmentVersionFiles";
import { DocAttachment } from "@/definitions/types/document.type";
import { Button } from "@/components/ui/button";
import { Constant } from "@/definitions/constants/constant";
import useAuthStore from "@/stores/auth.store";

import dynamic from "next/dynamic";
const DocumentViewer = dynamic(
  () => import("@/components/common/DocumentViewer"),
  {
    ssr: false,
  }
);

export interface AttachmentsCardProps {
  attachments: DocAttachment[];
  draftFile: DocAttachment[];
  documentFile: DocAttachment[];
  listAttachVersion: DocAttachment[];
  selectedFile?: DocAttachment | undefined;
  encryptShowing: boolean;
  isDownloading: boolean;
  downloadName: string;
  onSelect: (file: DocAttachment) => void;
  onView: (file: any, isView?: boolean, isDownload?: boolean) => void;
  onDownload: (file: DocAttachment) => Promise<void>;
  onShare: (file: DocAttachment) => void;
  onVerifyPDF: (fileName: string) => void | Promise<void>;
  onSignEncrypt: (
    fileName: string,
    encrypt: boolean,
    fileId: string
  ) => void | Promise<void>;
  onSignIssuedEncrypt: (
    fileName: string,
    encrypt: boolean,
    fileId: string
  ) => void | Promise<void>;
  doSelectFiles: (e: any, type: string) => void;
  buttonStatus: {
    editButton: boolean;
    canRETAKE: boolean;
  };
  onDelete: (file: DocAttachment) => void;
  checkShowAttachmentVersion: boolean;
  docNumber: string;
  draftStatusNotIssued: boolean;
}

const DocumentInAttachmentsCard: React.FC<AttachmentsCardProps> = ({
  attachments,
  draftFile,
  documentFile,
  listAttachVersion,
  selectedFile,
  encryptShowing,
  isDownloading,
  downloadName,
  onSelect,
  onView,
  onDownload,
  onShare,
  onVerifyPDF,
  onSignEncrypt,
  onSignIssuedEncrypt,
  doSelectFiles,
  buttonStatus,
  onDelete,
  checkShowAttachmentVersion,
  docNumber,
  draftStatusNotIssued,
}) => {
  const [detailCollapse, setDetailCollapse] = useState(false);
  const [draftCollapse, setDraftCollapse] = useState(false);
  const [documentCollapse, setDocumentCollapse] = useState(false);
  const [attachmentVersionCollapse, setAttachmentVersionCollapse] =
    useState(false);
  const { user: userInfo } = useAuthStore();
  const allFiles = useMemo(() => {
    const a = Array.isArray(draftFile) ? draftFile : [];
    const b = Array.isArray(documentFile) ? documentFile : [];
    const c = Array.isArray(listAttachVersion) ? listAttachVersion : [];
    return [...a, ...b, ...c];
  }, [draftFile, documentFile, listAttachVersion]);
  const isTruongOrPhoTruongPhong = () => {
    try {
      const norm = (s: any): string =>
        (s ? String(s) : "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase()
          .trim();

      const keys = ["truong phong", "pho truong phong"];
      const hasKey = (text: any): boolean => {
        const n = norm(text);
        for (let i = 0; i < keys.length; i++) {
          if (n.indexOf(keys[i]) !== -1) return true;
        }
        return false;
      };
      if (
        userInfo &&
        userInfo.positionModel &&
        hasKey(userInfo.positionModel.name)
      ) {
        return true;
      }
      if (userInfo && Array.isArray(userInfo.additionalPositions)) {
        for (let i = 0; i < userInfo.additionalPositions.length; i++) {
          const p: any = userInfo.additionalPositions[i];
          if (p && hasKey(p.name)) return true;
        }
      }
      if (userInfo && Array.isArray(userInfo.roles)) {
        for (let i = 0; i < userInfo.roles.length; i++) {
          const r = userInfo.roles[i];
          if (r && hasKey(r.name)) return true;
        }
      }
      return false;
    } catch (e) {
      console.error("Invalid user info format:", e);
      return false;
    }
  };

  return (
    <>
      {selectedFile && (
        <Card className="shadow-sm">
          <CardHeader
            className="p-4 cursor-pointer"
            onClick={() => setDetailCollapse(!detailCollapse)}
          >
            <div className="flex justify-between items-center">
              <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <Paperclip className="w-4 h-4 text-white" />
                </div>
                Chi tiết tệp văn bản:
              </CardTitle>
              {detailCollapse ? (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              )}
            </div>
          </CardHeader>
          {!detailCollapse && (
            <CardContent>
              {selectedFile?.id && (
                <DocumentViewer
                  files={allFiles}
                  selectedFile={selectedFile}
                  handleDownloadFile={onDownload}
                  fileType={Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_IN}
                />
              )}
            </CardContent>
          )}
        </Card>
      )}
      <Card className="shadow-sm">
        <CardHeader
          className="p-4 cursor-pointer"
          onClick={() => setDraftCollapse(!draftCollapse)}
        >
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <Paperclip className="w-4 h-4 text-white" />
              </div>
              Tệp đính kèm( dự thảo )
              {Constant.FIX_LAYOUT_AND_ADD_ATTACH_BUTTON_H05 &&
                buttonStatus.editButton &&
                !encryptShowing && (
                  <Button
                    asChild={true}
                    variant={"outline"}
                    className={
                      "bg-[#22c6ab] text-white hover:bg-emerald-600 font-medium py-2 px-4 ml-2 hover:text-white cursor-pointer"
                    }
                  >
                    <label htmlFor={"upload-draft"}>
                      <Plus className="w-4 h-4" />
                      Thêm tệp
                    </label>
                  </Button>
                )}
              <input
                id="upload-draft"
                type="file"
                multiple
                accept={Constant.ALLOWED_FILE_EXTENSION}
                onChange={(e) =>
                  doSelectFiles(e, Constant.DOCUMENT_IN_FILE_TYPE.DRAFT)
                }
                className="hidden"
              />
            </CardTitle>
            {draftCollapse ? (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </div>
        </CardHeader>
        {!draftCollapse && draftFile?.length > 0 && !buttonStatus.canRETAKE && (
          <CardContent>
            <DraftAttachmentFiles
              files={draftFile || []}
              selectedFileId={selectedFile?.id?.toString() || null}
              onFileSelect={(file: any) => onSelect(file)}
              onViewFile={(
                file: any,
                isViewPopup?: boolean,
                isViewEncrypt?: boolean
              ) => onView(file, isViewPopup, isViewEncrypt)}
              onDownloadFile={(file: any) => onDownload(file)}
              onShareFile={(file: any) => onShare(file)}
              onVerifierPDF={(fileName: string) => onVerifyPDF(fileName)}
              onSignFileEncrypt={(
                fileName: string,
                encrypt: boolean,
                fileId: string
              ) => onSignEncrypt(fileName, encrypt, fileId)}
              onSignFileIssuedEncrypt={(
                fileName: string,
                encrypt: boolean,
                fileId: string
              ) => onSignIssuedEncrypt(fileName, encrypt, fileId)}
              encryptShowing={encryptShowing}
              buttonStatus={buttonStatus}
              onDeleteFile={(file: any) => onDelete(file)}
              docNumber={docNumber}
              draftStatusNotIssued={draftStatusNotIssued}
              isTruongOrPhoTruongPhong={isTruongOrPhoTruongPhong()}
            />
          </CardContent>
        )}
      </Card>
      <Card className="shadow-sm">
        <CardHeader
          className="p-4 cursor-pointer"
          onClick={() =>
            setAttachmentVersionCollapse(!attachmentVersionCollapse)
          }
        >
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <Paperclip className="w-4 h-4 text-white" />
              </div>
              Các phiên bản dự thảo
            </CardTitle>
            {attachmentVersionCollapse ? (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </div>
        </CardHeader>
        {!attachmentVersionCollapse &&
          attachments?.length > 0 &&
          checkShowAttachmentVersion &&
          !buttonStatus.canRETAKE && (
            <CardContent>
              <AttachmentVersionFiles
                files={listAttachVersion || []}
                selectedFileId={selectedFile?.id?.toString() || null}
                onFileSelect={(file: any) => onSelect(file)}
                onViewFile={(
                  file: any,
                  isViewPopup?: boolean,
                  isViewEncrypt?: boolean
                ) => onView(file, isViewPopup, isViewEncrypt)}
                onDownloadFile={(file: any) => onDownload(file)}
                encryptShowing={encryptShowing}
                isTruongOrPhoTruongPhong={isTruongOrPhoTruongPhong()}
              />
            </CardContent>
          )}
      </Card>
      <Card className="shadow-sm">
        <CardHeader
          className="p-4 cursor-pointer"
          onClick={() => setDocumentCollapse(!documentCollapse)}
        >
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <Paperclip className="w-4 h-4 text-white" />
              </div>
              Tệp đính kèm( tài liệu liên quan )
              {Constant.FIX_LAYOUT_AND_ADD_ATTACH_BUTTON_H05 &&
                buttonStatus.editButton &&
                !encryptShowing && (
                  <Button
                    asChild={true}
                    variant={"outline"}
                    className={
                      "bg-[#22c6ab] text-white hover:bg-emerald-600 font-medium py-2 px-4 ml-2 hover:text-white cursor-pointer"
                    }
                  >
                    <label htmlFor={"upload-document"}>
                      <Plus className="w-4 h-4" />
                      Thêm tệp
                    </label>
                  </Button>
                )}
              <input
                id="upload-document"
                type="file"
                multiple
                accept={Constant.ALLOWED_FILE_EXTENSION}
                onChange={(e) =>
                  doSelectFiles(e, Constant.DOCUMENT_IN_FILE_TYPE.DOCUMENT)
                }
                className="hidden"
              />
            </CardTitle>
            {documentCollapse ? (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            )}
          </div>
        </CardHeader>
        {!documentCollapse &&
          documentFile?.length > 0 &&
          !buttonStatus.canRETAKE && (
            <CardContent>
              <DocumentAttachmentFiles
                files={documentFile || []}
                selectedFileId={selectedFile?.id?.toString() || null}
                onFileSelect={(file: any) => onSelect(file)}
                onViewFile={(
                  file: any,
                  isClick?: boolean,
                  isOpentab?: boolean
                ) => onView(file, isClick, isOpentab)}
                onDownloadFile={(file: any) => onDownload(file)}
                onShareFile={(file: any) => onShare(file)}
                encryptShowing={encryptShowing}
                onDeleteFile={(file: any) => onDelete(file)}
                buttonStatus={buttonStatus}
                isTruongOrPhoTruongPhong={isTruongOrPhoTruongPhong()}
              />
            </CardContent>
          )}
      </Card>
    </>
  );
};

export default DocumentInAttachmentsCard;
