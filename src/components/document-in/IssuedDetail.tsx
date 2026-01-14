"use client";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import { attachmentTypeInit } from "@/components/document-in/DraftForm";
import InternalReceivePlace from "@/components/document-in/InternalReceivePlace";
import OutsideReceivePlace from "@/components/document-in/OutsideReceivePlace";
import ReplyDocSelection from "@/components/document-in/ReplyDocSelection";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DocAttachment,
  Draft,
  ReceiveToKnow,
  ReplyDoc,
  TaskAssignment,
} from "@/definitions/types/document.type";
import { uploadFileService } from "@/services/file.service";
import { UploadFileService } from "@/services/upload-file.service";
import {
  Check,
  Copy,
  Download,
  Eye,
  File,
  FileText,
  Folder,
  KeyRound,
  Newspaper,
  Paperclip,
  Pencil,
  Scan,
  Trash2,
  Undo2,
} from "lucide-react";

import SearchableSelect from "@/components/common/SearchableSelect";
import SelectCustom from "@/components/common/SelectCustom";
import SignerSearch from "@/components/document-in/SignerSearch";
import { Column } from "@/definitions";
import { Constant } from "@/definitions/constants/constant";
import { CERT_OBJ_TYPE, OBJ_TYPE } from "@/definitions/enums/document.enum";
import { useUserByAuthority } from "@/hooks/data/common.data";
import {
  useAddDocument,
  useAddDraft,
  useDeleteDraft,
  useDetailEditDocument,
  useInitDraftData,
  useIssuedDraft,
  useIssuedDraftNew,
  useUpdateDraft,
} from "@/hooks/data/document-in.data";
import { useGetAllOrganizations } from "@/hooks/data/vehicle.data";
import { useDeleteAttachmentMutation } from "@/hooks/data/attachment.data";
import {
  EncryptionProgress,
  EncryptionService,
} from "@/services/encryption.service";
import { notificationService } from "@/services/notification.service";
import {
  connectScanService,
  getIsConnect,
  getWebSocket,
  scanMessage,
} from "@/services/scandocument.service";
import { UserService } from "@/services/user.service";
import {
  canViewNoStatus,
  getAssetIcon,
  includes,
  isExistFile,
  isVerifierPDF,
  orginName,
  validFileSSize,
} from "@/utils/common.utils";
import { convertDraftToDraftDTO } from "@/utils/draft-mapper";
import { ToastUtils } from "@/utils/toast.utils";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { CustomDatePicker } from "../ui/calendar";
import { useEncryptStore } from "@/stores/encrypt.store";
import {
  UploadEncryptionProgress,
  UploadEncryptionService,
} from "@/services/upload-encryption.service";
import { Label } from "@/components/ui/label";
import UploadEncryptOverlay from "@/components/overlay/UploadEncryptOverlay";
import EncryptOverlay from "@/components/overlay/EncryptOverlay";
import LoadingOverlay from "@/components/overlay/LoadingOverlay";

interface DraftFormProps {
  action: "insert" | "update";
  id: string | null;
}

export const issueInitData = {
  dateIssued: new Date(),
  listAttachVersion: [],
  nodeId: null,
  listSignersName: "",
  docSecurityName: "",
  docTypeName: "",
  docUrgentName: "",
  note: "",
  numberInBook: "",
  id: null,
  attachments: [] as DocAttachment[],
  orgCreateName: "",
  userCreateName: "",
  orgIssuedId: null,
  docTypeId: 0,
  docFieldId: 0,
  securityId: 0,
  urgentId: 0,
  bookId: null,
  preview: "",
  listReceive: [] as ReceiveToKnow[],
  autoIssued: false,
  replyDoc: false,
  replyTask: false,
  bookName: "",
  replyDocIds: "",
  listReplyDoc: [] as ReplyDoc[],
  listRelateTask: [] as TaskAssignment[],
  draftFiles: [],
  documentFiles: [],
  encrypt: false,
  numberOrSign: "",
  docFieldsName: "",
  listSignerIds: "",
  relateTaskIds: "",
  outsideReceives: [],
  outsideReceiveLgsps: [],
  paperHandle: false,
  personEnterName: "",
  signCA: false, //mirror paperhandle
  docId: 0,
};
const applyEncryptionLogic = (
  files: DocAttachment[],
  encryptShowing: boolean
): DocAttachment[] => {
  if (encryptShowing) {
    return files.map((file) => {
      const name = (file?.name || "").toLowerCase();
      const isExcluded =
        name.includes("phieu_trinh_xu_ly_van_ban_den") ||
        name.includes("phieu_trinh_van_ban_di");
      file.encrypt = !isExcluded;
      return file;
    });
  }
  return files.map((file) => {
    if (file) file.encrypt = false;
    return file;
  });
};

export function IssuedDetail({ action, id }: DraftFormProps) {
  const router = useRouter();
  const { isEncrypt: encryptShowing } = useEncryptStore();

  const [draftData, setDraftData] = useState<any>({
    ...issueInitData,
    attachmentType: attachmentTypeInit,
  });
  const [isOpenScanModal, setIsOpenScanModal] = useState(false);
  const [isCheckOpenDownLoadFileEncrypt, setIsCheckOpenDownLoadFileEncrypt] =
    useState(false);
  const [isCheckEncrypt, setIsCheckEncrypt] = useState(false);
  const [hasIssued, setHasIssued] = useState(false);
  const [isShowKySo, setIsShowKySo] = useState(false);
  const [checkNumberOrSign, setCheckNumberOrSign] = useState(true);
  const [docName, setDocName] = useState("");
  const [isShowChooseEncrypt, setIsShowChooseEncrypt] = useState(false);
  const [isShowLoadingEncrypt, setIsShowLoadingEncrypt] = useState(false);
  const [isFileEncrypt, setIsFileEncrypt] = useState(false);

  const [selectedFiles, setSelectedFiles] = useState<DocAttachment[]>([]);

  const [docTypeScan, setDocTypeScan] = useState<"get pdf" | "get png" | "">(
    ""
  );
  const [isFromPaper, setIsFromPaper] = useState(true);
  const [isCanEditnumberOrSign, setCanEditnumberOrSign] = useState(true);
  const [securityCategoryFilter, setSecurityCategoryFilter] = useState<any>([]);
  const [bookFilter, setBookFilter] = useState<any>([]);
  const [issuedOrgList, setIssuedOrgList] = useState<any[]>([]);
  const [createOrgList, setCreateOrgList] = useState<any[]>([]);
  const [validFileAttr, setValidFileAttr] = useState({
    hasError: true,
    isValidFileSize: true,
    isValidExtension: true,
    isValidNumberOfFiles: true,
    isHasFile: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [fileScanner, setFileScanner] = useState<any[]>([]);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [pendingDeleteIndex, setPendingDeleteIndex] = useState<number | null>(
    null
  );
  const [uploadEncryptionProgress, setUploadEncryptionProgress] =
    useState<UploadEncryptionProgress>({});
  const [encryptionProgress, setEncryptionProgress] =
    useState<EncryptionProgress>({
      expectedChunks: 0,
      currentProgress: 0,
      receivedChunks: 0,
    });

  const { data: initDraftDataHook } = useInitDraftData();
  const { data: orgList } = useGetAllOrganizations();
  const { data: userList } = useUserByAuthority();
  const { mutateAsync: addDraft } = useAddDraft();
  const { mutateAsync: updateDraft } = useUpdateDraft();
  const { mutateAsync: issueNewDraft } = useIssuedDraftNew();
  const { mutateAsync: deleteDraft } = useDeleteDraft();

  const { mutateAsync: addDocument } = useAddDocument();
  const { mutateAsync: issueDraft } = useIssuedDraft();
  const { data: detailDoc } = useDetailEditDocument(id);
  const { mutateAsync: deleteAttachmentMutation } =
    useDeleteAttachmentMutation();
  // Helper: warn when a book year is about to expire (less than 15 days to year end)
  const isBookWarning = (bookYear: number): boolean => {
    const currentDate = new Date();
    const maxBookDate = new Date(bookYear, 11, 31);
    const numberOfDayLeft = Math.floor(
      (maxBookDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24)
    );
    return numberOfDayLeft < 15 && numberOfDayLeft > 0;
  };

  const changeBook = (bookId: string | number, isIncrement = true) => {
    const currentBook = initDraftDataHook?.bookCategories?.find(
      (item) => String(item.id) === String(bookId)
    );
    if (!currentBook) return;

    // Compute security categories available for the selected book
    let securityCategory: any[] = [];
    if (isFromPaper) {
      securityCategory = (initDraftDataHook?.securityCategories || []).filter(
        (item: any) => currentBook.securityIds.includes(item.id)
      ) as any[];
      setSecurityCategoryFilter(securityCategory as any);
    }

    // Single state update for all derived fields when changing book
    setDraftData((prev: any) => {
      // Determine securityId (default to first available if incompatible or not chosen)
      let nextSecurityId = prev.securityId;
      if (
        isFromPaper &&
        securityCategory.length > 0 &&
        (!nextSecurityId || !currentBook.securityIds.includes(nextSecurityId))
      ) {
        nextSecurityId = securityCategory[0].id;
      }

      // Compute numbering fields when incrementing
      const nextNumberInBook = isIncrement
        ? String((currentBook.value ?? 0) + 1)
        : prev.numberInBook;
      const nextNumberOrSign = isIncrement
        ? (currentBook.numberOrSign ?? prev.numberOrSign)
        : prev.numberOrSign;

      // Apply encryption flags (mimics checkedEntry) in the same update to avoid extra setState calls
      const updatedAttachments = (prev.attachments || []).map((item: any) => {
        const lower = (item?.name || "").toLowerCase();
        const isException =
          lower.includes("phieu_trinh_xu_ly_van_ban_den") ||
          lower.includes("phieu_trinh_van_ban_di");
        const encrypt = encryptShowing ? !isException : false;
        return { ...item, encrypt };
      });
      const nextOutsideReceiveLgsps = encryptShowing
        ? []
        : prev.outsideReceiveLgsps;

      return {
        ...prev,
        securityId: nextSecurityId,
        numberInBook: nextNumberInBook,
        numberOrSign: nextNumberOrSign,
        attachments: updatedAttachments,
        outsideReceiveLgsps: nextOutsideReceiveLgsps,
      } as Draft;
    });

    // Warn if the selected book is about to expire
    if (
      typeof currentBook.year === "number" &&
      isBookWarning(currentBook.year)
    ) {
      ToastUtils.soVanBanSapHetHan();
    }
  };

  // Toggle attachment encryption flags based on encryptShowing, mirroring Angular checkedEntry
  const checkedEntry = () => {
    setIsCheckOpenDownLoadFileEncrypt(encryptShowing);
    setIsCheckEncrypt(encryptShowing);
    setIsFileEncrypt(encryptShowing);
    setSelectedFiles((prev: DocAttachment[]) =>
      applyEncryptionLogic(prev, encryptShowing)
    );
    setDraftData((prev: Draft) => {
      return {
        ...prev,
        outsideReceiveLgsps: encryptShowing ? [] : prev.outsideReceiveLgsps,
      } as Draft;
    });
  };

  const doAfterRemoveOrSelectFile = () => {
    const count = (selectedFiles as any[])?.length || 0;
    if (count === 0) {
      setValidFileAttr((prev) => ({
        ...prev,
        hasError: true,
        isHasFile: false,
      }));
    } else {
      setValidFileAttr({
        hasError: false,
        isValidFileSize: true,
        isValidExtension: true,
        isValidNumberOfFiles: true,
        isHasFile: true,
      });
    }
  };

  const doSelectFiles: React.ChangeEventHandler<HTMLInputElement> = (event) => {
    const files = event.target.files;
    if (!files) return;
    if (!uploadFileService.doCheckFileExtension(files)) {
      setValidFileAttr((prev) => ({
        ...prev,
        isValidExtension: false,
        hasError: true,
      }));
      event.target.value = "";
      return;
    }
    if (!validFileSSize(files)) {
      setValidFileAttr((prev) => ({
        ...prev,
        isValidFileSize: false,
        hasError: true,
      }));
      event.target.value = "";
      return;
    }
    if (
      !uploadFileService.validateNumberOfFileUpload(selectedFiles, files, false)
    ) {
      setValidFileAttr((prev) => ({
        ...prev,
        isValidNumberOfFiles: false,
        hasError: true,
      }));
      event.target.value = "";
      return;
    }

    const updatedFile: DocAttachment[] = selectedFiles
      ? [...selectedFiles]
      : [];
    for (const f of Array.from(files)) {
      if (!isExistFile(f.name, updatedFile)) {
        updatedFile.push(f as unknown as DocAttachment);
      }
    }

    setSelectedFiles(updatedFile);

    setValidFileAttr({
      hasError: false,
      isValidFileSize: true,
      isValidExtension: true,
      isValidNumberOfFiles: true,
      isHasFile: true,
    });

    checkedEntry();
    doAfterRemoveOrSelectFile();
    event.target.value = "";
  };
  const doSelectFileEncrypt = async () => {
    setIsShowChooseEncrypt(true);
    if (encryptShowing) {
      const fileEncryptCheck =
        await UploadEncryptionService.openChooseFileToCheck();
      setSelectedFiles((prev) => [...prev, ...fileEncryptCheck]);
      setIsShowChooseEncrypt(false);
      setUploadEncryptionProgress({});
    }
    checkedEntry();
  };

  const doRemoveFile = (index: number) => {
    setDraftData((prev: any) => ({
      ...prev,
      attachments: ((prev.attachments as any[]) || []).filter(
        (_, i) => i !== index
      ),
    }));
    if (fileInputRef.current) fileInputRef.current.value = "";
    doAfterRemoveOrSelectFile();
  };

  const handleConfirmDelete = async () => {
    if (pendingDeleteIndex !== null) {
      const file = (draftData.attachments as any[])?.[pendingDeleteIndex];
      try {
        if (file?.id) {
          await deleteAttachmentMutation(file.id);
        }
        doRemoveFile(pendingDeleteIndex);
        ToastUtils.xoaTepThanhCong();
      } catch (e) {
        ToastUtils.fileDeleteError();
      }
    }
    setPendingDeleteIndex(null);
    setIsConfirmDeleteOpen(false);
  };

  const getFileSizeString = (size: number) => {
    if (size === 0) return "0 B";
    const units = ["B", "KB", "MB", "GB", "TB"] as const;
    const i = Math.floor(Math.log(size) / Math.log(1024));
    const num = size / Math.pow(1024, i);
    return `${num.toFixed(2)} ${units[i]}`;
  };
  const isView = (file: any): boolean => {
    return file && canViewNoStatus(file.name) && !file.oEncrypt;
  };
  const verifierPDF = (file: any) => {
    if (file.docId) {
      uploadFileService.verifierPDF(
        file.name,
        "",
        Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_IN
      );
    } else {
      let fileData;
      if (file) {
        const reader = new FileReader();
        reader.onload = (event: any) => {
          fileData = event.target.result;
          uploadFileService.verifierPDF(
            file.name,
            fileData,
            Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_OUT
          );
        };
        reader.readAsDataURL(file as Blob);
      }
    }
  };
  const ocrFile = async (file: any) => {
    const res = await uploadFileService.ocrFile(file as any);
    if (res) autoFillData(res.value);
  };
  const autoFillData = (data: any) => {
    if (data.trich_yeu || data.noi_dung) {
      if (
        typeof data.trich_yeu === "string" ||
        typeof data.noi_dung === "string"
      ) {
        setDraftData((prev: any) => ({
          ...prev,
          preview: data.trich_yeu || data.noi_dung,
        }));
      } else {
        if (data.trich_yeu.trich_yeu) {
          setDraftData((prev: any) => ({
            ...prev,
            preview: data.trich_yeu,
          }));
        }
        if (data.trich_yeu.so_ky_hieu) {
          setDraftData((prev: any) => ({
            ...prev,
            numberOrSign: data.trich_yeu.so_ky_hieu,
          }));
        }
      }
    }

    if (data.noi_nhan_ben_trong) {
      data.noi_nhan_ben_trong.forEach((element: any) => {
        const listReceive: ReceiveToKnow[] = [];
        const org = orgList?.find((item) => includes(item.name, element));
        if (org) {
          const mapOrg = {
            type: "ORG",
            receiveId: org.id,
            fullName: org.name,
            orgName: org.name,
            orgId: org.id,
          };
          listReceive.push(mapOrg as ReceiveToKnow);
        } else {
          const user = userList?.find((item) =>
            includes(item.fullName, element)
          );
          if (user) {
            const mapUser = {
              type: "USER",
              id: user.id,
              receiveId: user.id,
              fullName: user.fullName,
              orgName: "",
              orgId: 0,
              positionName: user.positionName,
            };
            listReceive.push(mapUser as ReceiveToKnow);
          }
        }
        setDraftData((prev: any) => ({ ...prev, listReceive: listReceive }));
      });
    }

    if (data.so_ky_hieu)
      setDraftData((prev: any) => ({ ...prev, numberOrSign: data.so_ky_hieu }));

    if (data.ngay_ban_hanh) {
      setDraftData((prev: any) => ({
        ...prev,
        dateIssued: new Date(
          Number(data.ngay_ban_hanh.nam),
          Number(data.ngay_ban_hanh.thang) - 1,
          Number(data.ngay_ban_hanh.ngay)
        ),
      }));
    }
    if (data.ten_van_ban) {
      const docType = initDraftDataHook?.docTypeCategories.find(
        (item) =>
          item?.name?.toLowerCase().includes(data.ten_van_ban.toLowerCase()) ||
          data.ten_van_ban.toLowerCase().includes(item.name.toLowerCase())
      );
      if (docType)
        setDraftData((prev: any) => ({ ...prev, docTypeId: docType.id }));
    }
    if (data.nguoi_ky) {
      const listSignersName: any[] = [];

      listSignersName.push(data.nguoi_ky);

      setDraftData((prev: any) => ({
        ...prev,
        listSignersName: listSignersName.join(","),
      }));
    }
  };
  const downloadFile = (fileName: string, encrypt: boolean) => {
    uploadFileService.downloadFile(
      fileName,
      Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_IN,
      encrypt
    );
  };

  const renderButtonFileNotUpdated = (file: any) => {
    return (
      <TooltipProvider>
        <div className="flex items-center justify-center gap-1">
          {isView(file) && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => viewFile(file)}
                  size="icon"
                  className="h-8 w-8"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Xem</p>
              </TooltipContent>
            </Tooltip>
          )}
          {!file.id && isVerifierPDF(file) && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => verifierPDF(file)}
                  size="icon"
                  className="h-8 w-8"
                >
                  <Check className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Xác thực chữ ký</p>
              </TooltipContent>
            </Tooltip>
          )}
          {isFromPaper && !file.id && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => ocrFile(file)}
                  size="icon"
                  className="h-8 w-8"
                >
                  <FileText className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>OCR</p>
              </TooltipContent>
            </Tooltip>
          )}
          {Constant.ENCRYPTION_TWD && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="h-8 w-8 flex items-center justify-center">
                  <KeyRound
                    className={`h-4 w-4 ${file.encrypt ? "text-red-500" : "text-gray-400"}`}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  {file.encrypt ? "File sẽ được mã hóa" : "File không mã hóa"}
                </p>
              </TooltipContent>
            </Tooltip>
          )}
          {isFromPaper && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => {
                    const index = selectedFiles.findIndex((f) => f === file);
                    if (index !== -1) {
                      setPendingDeleteIndex(index);
                      setIsConfirmDeleteOpen(true);
                    }
                  }}
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Xóa</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
    );
  };
  const renderButtonFileUpdated = (file: any) => {
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        // TODO: Implement showPopUpAskingChangeFile logic
        console.log("File selected for edit:", files[0]);
      }
    };

    return (
      <TooltipProvider>
        <div className="flex items-center justify-center gap-1">
          {file.id && hasIssued && !file.oEncrypt && (
            <>
              <input
                ref={editFileInputRef}
                type="file"
                hidden
                accept={Constant.ALLOWED_DRAFT_FILE_EXTENSION}
                onChange={handleFileChange}
              />
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    onClick={() => editFileInputRef.current?.click()}
                    size="icon"
                    className="h-8 w-8"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sửa tệp đính kèm</p>
                </TooltipContent>
              </Tooltip>
            </>
          )}
          {isView(file) && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => viewFile(file)}
                  size="icon"
                  className="h-8 w-8"
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Xem</p>
              </TooltipContent>
            </Tooltip>
          )}
          {!isView(file) && !file.encrypt && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => downloadFile(file.name, file.encrypt)}
                  size="icon"
                  className="h-8 w-8"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Tải xuống</p>
              </TooltipContent>
            </Tooltip>
          )}
          {file.id && isVerifierPDF(file) && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => verifierPDF(file)}
                  size="icon"
                  className="h-8 w-8"
                >
                  <Check className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Xác thực chữ ký</p>
              </TooltipContent>
            </Tooltip>
          )}
          {file.encrypt && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() =>
                    signFileEncrypt(file.name, file.encrypt, file.id)
                  }
                  size="icon"
                  className="h-8 w-8"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ký số file mã hóa</p>
              </TooltipContent>
            </Tooltip>
          )}
          {Constant.ENCRYPTION_TWD && (
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="h-8 w-8 flex items-center justify-center">
                  <KeyRound
                    className={`h-4 w-4 ${file.encrypt ? "text-red-500" : "text-gray-400"}`}
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Mã hóa tệp tin</p>
              </TooltipContent>
            </Tooltip>
          )}
          {isFromPaper && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => {
                    const index = selectedFiles.findIndex(
                      (f) => f.id === file.id
                    );
                    if (index !== -1) {
                      setPendingDeleteIndex(index);
                      setIsConfirmDeleteOpen(true);
                    }
                  }}
                  size="icon"
                  className="h-8 w-8 text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Xóa</p>
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      </TooltipProvider>
    );
  };
  const viewFile = (file: any) => {
    if (!file.id) {
      const fileToView = new (File as any)([file], file.name, {
        type: file.type,
        lastModified: file.lastModified,
      });

      (fileToView as any).encrypt = false;

      uploadFileService.viewFile(
        fileToView,
        Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_IN
      );
    } else {
      uploadFileService.viewFile(
        file,
        Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_IN
      );
    }
  };

  const callScanService = () => {
    if (!getIsConnect()) {
      connectScanService((data: any) => {
        if (data === "-100") {
          ToastUtils.error(
            "Chức năng này cần cài đặt EcoScanner service để tiếp tục!"
          );
        } else {
          doOpenScanForm();
        }
      });
    } else {
      doOpenScanForm();
    }
  };

  const doOpenScanForm = () => {
    setFileScanner([]);
    setDocName("");
    setDocTypeScan("");
    setIsOpenScanModal(true);
  };

  const doScan = () => {
    if (getIsConnect() && getWebSocket() && docTypeScan) {
      scanMessage(docTypeScan, (data: any) => {
        if (data instanceof Blob) {
          let tmp: File;
          if (docTypeScan === "get pdf") {
            tmp = new (File as any)([data], `${docName || "scan"}.pdf`, {
              type: "application/pdf",
            });
          } else if (docTypeScan === "get png") {
            tmp = new (File as any)([data], `${docName || "scan"}.png`, {
              type: "image/png",
            });
          } else {
            return;
          }
          setDraftData((prev: any) => ({
            ...prev,
            attachments: [...((prev.attachments as any[]) || []), tmp],
          }));
          setIsOpenScanModal(false);
          setDocTypeScan("");
          setDocName("");
        } else {
          ToastUtils.error(String(data) || "Scan lỗi", "Thông báo");
        }
      });
    }
  };
  const doForceDisconnect = () => {
    UploadEncryptionService.disconnect();
    setIsShowChooseEncrypt(false);
    setIsShowLoadingEncrypt(false);
  };

  const signFileEncrypt = async (
    fileName: string,
    encrypt: boolean,
    fileId: number
  ) => {
    await uploadFileService.uploadFileEncryptToSign(
      fileName,
      Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_IN,
      true,
      draftData?.id,
      null,
      fileId.toString(),
      "VAN_BAN_DI_DU_THAO"
    );
  };

  const columns: Column<any>[] = [
    {
      header: "",
      className: "text-left py-3 px-3 w-4",
      accessor: (item: any, index: number) =>
        item.id && (
          <div className="flex items-center justify-center">
            <Input
              type={"checkbox"}
              checked={item.isIssued}
              onChange={(e) => {
                setDraftData((prev: any) => ({
                  ...prev,
                  attachments: (prev.attachments || []).map(
                    (att: any, i: number) =>
                      i === index ? { ...att, isIssued: e.target.checked } : att
                  ),
                }));
              }}
              className="w-[15px] h-[15px]"
            />
          </div>
        ),
    },
    {
      header: "Tên tệp tin",
      className: "text-center py-3 w-20",
      accessor: (item: any) => (
        <div className="flex items-center justify-center">
          <img
            src={getAssetIcon(item.name)}
            alt={item.name}
            className="w-4 h-4 mr-1"
          />
          {orginName(item.name)}
        </div>
      ),
    },
    {
      header: "Kích thước",
      className: "text-center py-3 w-20",
      accessor: (item: any) => getFileSizeString(item.size),
    },
    {
      header: "Thao tác",
      className: "text-center py-3 w-20",
      accessor: (item: any) => (
        <>
          {!item.id && renderButtonFileNotUpdated(item)}
          {item.id && renderButtonFileUpdated(item)}
        </>
      ),
    },
  ];
  useEffect(() => {
    const unsubs = [
      UploadEncryptionService.subscribe(setUploadEncryptionProgress),
      // DecryptionService.subscribe(setDecryptionProgress),
      EncryptionService.subscribe(setEncryptionProgress),
    ];

    return () =>
      unsubs.forEach((u) => {
        if (typeof u === "function") u();
      });
  }, []);

  useEffect(() => {
    if (id) {
      setIsFromPaper(Constant.ENABLE_BTN_EDIT_FILE_DOCUMENT_ISSUED);
    } else {
      setCanEditnumberOrSign(true);
    }
  }, []);
  useEffect(() => {
    // Re-apply encryption flags whenever mode changes
    checkedEntry();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [encryptShowing]);

  useEffect(() => {
    if (detailDoc) {
      // Convert dateIssued from timestamp to Date object if it's a number
      const processedData = {
        ...detailDoc,
        dateIssued: detailDoc.dateIssued
          ? typeof detailDoc.dateIssued === "number"
            ? new Date(detailDoc.dateIssued)
            : detailDoc.dateIssued
          : new Date(),
      };

      setDraftData((prev: any) => ({
        ...prev,
        ...processedData,
      }));
      if (detailDoc.securityId == 135 && !encryptShowing) {
        setDraftData((prev: any) => ({
          ...prev,
          outsideReceiveLgsps: detailDoc.outsideReceiveLgsps,
        }));
      }
      if (detailDoc.attachments) {
        for (const attachment of detailDoc.attachments) {
          if (
            attachment.isIssued === undefined ||
            attachment.isIssued === null
          ) {
            attachment.isIssued = true;
          }
        }
      }
      if (detailDoc.securityId && initDraftDataHook?.bookCategories) {
        setBookFilter(
          initDraftDataHook?.bookCategories.filter((item) =>
            item.securityIds.includes(detailDoc.securityId)
          )
        );
      }
      if (detailDoc.status === "DA_BAN_HANH") {
        setHasIssued(true);
      }
      if (!securityCategoryFilter) {
        setSecurityCategoryFilter(initDraftDataHook?.securityCategories);
      }
      if (!detailDoc.bookId && bookFilter) {
        setDraftData((prev: any) => {
          const bookId = bookFilter[0]?.id;
          const securityId = bookFilter[0]?.securityIds[0];
          return { ...prev, bookId: Number(bookId), securityId: securityId };
        });
      }
      changeBook(detailDoc.bookId!, false);
      if (detailDoc.paperHandle) {
        setIsShowKySo(true);
        setDraftData((prev: any) => ({
          ...prev,
          signCA: true,
        }));
      } else {
        setIsShowKySo(false);
        setDraftData((prev: any) => ({
          ...prev,
          signCA: false,
        }));
      }
      if (detailDoc.attachments) {
        setSelectedFiles(detailDoc.attachments);
      }
    }
  }, [detailDoc]);

  // Filter organization lists based on user role (similar to Angular updateIssuedOrgLsAndCreateOrgLs)
  useEffect(() => {
    if (
      orgList &&
      orgList.length > 0 &&
      initDraftDataHook &&
      initDraftDataHook.checkRoleLibrarian
    ) {
      const userOrgId = initDraftDataHook.orgIdOfUser;
      const userOrgArr = orgList.filter((org: any) => org.id === userOrgId);

      if (userOrgArr.length === 0) {
        return;
      }

      const userOrg = userOrgArr[0];

      if (userOrg.parentId) {
        // User org has parent - filter accordingly
        const newIssuedOrgList = orgList.filter(
          (org: any) => org.id === userOrg.parentId
        );
        const newCreateOrgList = orgList.filter(
          (org: any) => org.parentId === userOrg.parentId
        );

        setIssuedOrgList(newIssuedOrgList);
        setCreateOrgList(newCreateOrgList);

        // Set default orgIssuedId if not set (matching Angular logic)
        if (!draftData.orgIssuedId && newIssuedOrgList.length > 0) {
          setDraftData((prev: any) => ({
            ...prev,
            orgIssuedId: newIssuedOrgList[0].id,
            orgCreateId: null,
          }));
        }
      } else {
        // User org is top level - filter accordingly
        const newIssuedOrgList = orgList.filter(
          (org: any) => org.id === userOrg.id
        );
        const newCreateOrgList = orgList.filter(
          (org: any) => org.parentId === userOrg.id
        );

        setIssuedOrgList(newIssuedOrgList);
        setCreateOrgList(newCreateOrgList);

        // Set default orgIssuedId if not set (matching Angular logic)
        if (!draftData.orgIssuedId && newIssuedOrgList.length > 0) {
          setDraftData((prev: any) => ({
            ...prev,
            orgIssuedId: newIssuedOrgList[0].id,
            orgCreateId: null,
          }));
        }
      }
    }
  }, [orgList, initDraftDataHook]);

  useEffect(() => {
    if (!draftData.docTypeId && initDraftDataHook?.docTypeCategories?.length) {
      const first = initDraftDataHook.docTypeCategories[0];
      setDraftData((p: any) => ({ ...p, docTypeId: first.id }));
    }
    // Set default Lĩnh vực (docFieldId) similar to Angular loadMustHaveField
    if (
      (!draftData.docFieldId || draftData.docFieldId === 0) &&
      initDraftDataHook?.docFieldCategories?.length
    ) {
      const firstField = initDraftDataHook.docFieldCategories[0];
      setDraftData((p: any) => ({ ...p, docFieldId: firstField.id }));
    }
    if (initDraftDataHook?.bookCategories?.length) {
      setBookFilter(initDraftDataHook?.bookCategories);

      const bookId = initDraftDataHook.bookCategories[0].id;
      const securityId = initDraftDataHook.bookCategories[0].securityIds[0];
      // Set default book and security; then apply changeBook logic for derived fields
      setDraftData((p: any) => ({ ...p, bookId: Number(bookId), securityId }));
      if (!draftData.numberInBook) {
        changeBook(bookId);
      }
    }
    if (
      !draftData.urgentId && // not set yet
      initDraftDataHook?.urgentCategories?.length
    ) {
      const first = initDraftDataHook.urgentCategories[0];
      setDraftData((p: any) => ({ ...p, urgentId: first.id }));
    }
    if (!draftData.userCreateName) {
      setDraftData((p: any) => ({
        ...p,
        userCreateName: initDraftDataHook?.userCreateName ?? "",
      }));
    }
    if (!draftData.orgCreateName) {
      setDraftData((p: any) => ({
        ...p,
        orgCreateName: initDraftDataHook?.orgCreateName ?? "",
      }));
    }
  }, [
    initDraftDataHook?.docTypeCategories,
    draftData.docTypeId,
    initDraftDataHook?.docFieldCategories,
    draftData.docFieldId,
    initDraftDataHook?.securityCategories,
    draftData.securityId,
    initDraftDataHook?.urgentCategories,
    draftData.urgentId,
    draftData.orgCreateName,
    draftData.userCreateName,
    initDraftDataHook?.orgCreateName,
    initDraftDataHook?.userCreateName,
  ]);

  // Auto-fill dateIssued with current date on form load - matching Angular loadMustHaveField (line 339-341)
  // This must run separately to ensure it always sets the date even when other fields change
  useEffect(() => {
    if (!draftData.dateIssued && !id) {
      setDraftData((p: any) => ({
        ...p,
        dateIssued: new Date(),
      }));
    }
  }, [draftData.dateIssued, id]);

  const issuedDocument = async (
    mode: "issue" | "renew" | "reuse" | "save",
    issued: boolean = false
  ) => {
    // Keep React state for UI/navigation, but use the "issued" flag directly
    // when deciding backend behaviour (similar to Angular this.hasIssued)
    setHasIssued(issued);

    // Validation for required fields - matching Angular issueDocument logic (line 771-802)
    if (!draftData.preview || draftData.preview.trim().length === 0) {
      ToastUtils.error("Trích yếu không được để trống.");
      return;
    }

    // Validate bookId (sổ văn bản) is required
    if (!draftData.bookId) {
      ToastUtils.error("Sổ văn bản không được để trống.");
      return;
    }

    // Validate securityId (độ mật) is required
    if (!draftData.securityId) {
      ToastUtils.error("Độ mật không được để trống.");
      return;
    }

    // Validate urgentId (độ khẩn) is required
    if (!draftData.urgentId) {
      ToastUtils.error("Độ khẩn không được để trống.");
      return;
    }

    if (!checkNumberOrSign) {
      ToastUtils.error("Số/Ký hiệu trùng, vui lòng nhập lại.");
      return;
    }

    // Validation for issued documents - matching Angular justIssueDocument logic (line 846-870)
    if (issued) {
      // Check LGSP requirements (line 847-859)
      if (
        draftData.outsideReceiveLgsps &&
        draftData.outsideReceiveLgsps.length > 0
      ) {
        if (!draftData.numberOrSign || !draftData.numberInBook) {
          ToastUtils.error("Số/Ký hiệu không được để trống");
          return;
        }
        if (!selectedFiles || selectedFiles.length === 0) {
          ToastUtils.error("Vui lòng chọn tệp đính kèm");
          return;
        }
      }

      // Check signCA is not null (line 861-866)
      if (draftData.signCA === null || draftData.signCA === undefined) {
        ToastUtils.error("Ký số không được để trống");
        return;
      }

      // Check signer is required for issued documents (line 793-802)
      if (
        !draftData.listSignersName ||
        draftData.listSignersName.trim().length === 0
      ) {
        if (
          !draftData.listSignerIds ||
          draftData.listSignerIds.trim().length === 0
        ) {
          ToastUtils.error("Người ký không được để trống");
          return;
        }
      }
    }
    if (selectedFiles && selectedFiles.length > 0) {
      // Filter encrypt files matching Angular logic
      const filteredEncryptArr = selectedFiles.filter(
        (i: DocAttachment) =>
          (i.encrypt && !i.id) || // New file with encryption
          (i.encrypt && i.id && !i.oEncrypt) || // Uploaded file, encrypt now, but not encrypted before
          (i.template && i.encrypt) // Template file with encryption
      );

      if (filteredEncryptArr && filteredEncryptArr.length > 0) {
        const connect = await EncryptionService.checkConnect();
        if (!connect) {
          return false;
        }
      }
    }

    const currentId: string | null = draftData.id ? String(draftData.id) : null;
    if (encryptShowing) setIsShowLoadingEncrypt(true);

    if (action === "insert") {
      // For insert, always call createDraftAndIssued, but pass the issued flag
      // so BE knows whether this is just save or save+issue (matching Angular createDraftAndIssued(this.hasIssued))
      await createDraftAndIssued(issued);
    } else if (action === "update" && currentId) {
      // For update, only share permissions when actually issuing, so pass issued flag
      await saveDraftAndIssue(issued);
    }
    // After save/update
    setIsShowLoadingEncrypt(false);

    if (mode === "issue") {
      ToastUtils.documentCreateSuccess();
      router.push(
        `/document-in/draft-issued?currentTab=${issued ? "issued" : "waitIssued"}`
      );
      return;
    }
    if (mode === "renew") {
      setDraftData({
        ...issueInitData,
        attachmentType: attachmentTypeInit,
      });
      ToastUtils.documentCreateSuccess();
      return;
    }
    if (mode === "reuse") {
      // keep the current data as-is
      ToastUtils.documentCreateSuccess();
      return;
    }
    if (mode === "save") {
      ToastUtils.documentCreateSuccess();
      return;
    }
  };
  const createDraftAndIssued = async (issuedFlag: boolean) => {
    const orgIds = draftData.listReceive
      .filter((i: any) => i.type === "ORG")
      .map((i: any) => i.receiveId);
    const userIds = draftData.listReceive
      .filter((i: any) => i.type === "USER")
      .map((i: any) => i.receiveId);
    const fullNameArr = draftData.listSignersName
      ? draftData.listSignersName.split(",")
      : [];
    const uIds = await UserService.getUserIdByFullNames(fullNameArr);

    // Set hasIssued and FORCE userCreateName to empty string like Angular (line 346-347).
    // Use issuedFlag directly instead of relying on potentially stale React state.
    const draftToSave = {
      ...draftData,
      hasIssued: issuedFlag,
      userCreateName: "", // Always force empty string for insert, matching Angular
    };

    const draftDto = {
      ...convertDraftToDraftDTO(draftToSave as any),
      // If issuedFlag is true, BE may accept this flag to directly mark issued
      ...(issuedFlag ? { issued: true } : {}),
    } as any;

    await addDraft(draftDto).then(async (res) => {
      setDraftData((prev: any) => ({
        ...prev,
        docId: res.id,
      }));
      const encryptArr = await uploadFileService.filterFile(
        selectedFiles,
        EncryptionService.ENCRYPT,
        OBJ_TYPE.VAN_BAN_DI
      );
      const nonEncryptArr = await uploadFileService.filterFile(
        selectedFiles,
        "",
        OBJ_TYPE.VAN_BAN_DI
      );

      if (encryptArr && encryptArr.length > 0) {
        const rs0 = await EncryptionService.doEncryptExecute(
          encryptArr as File[],
          res.id!,
          "VAN_BAN_DI_DU_THAO"
        );
        if (rs0 == false) {
          // rollback
          rollBack(res.id);
          return false;
        }
      }
      if (userIds != null && userIds.length > 0) {
        uIds.push(...userIds);
      }
      if (uIds || orgIds) {
        const dataFile = setSharedFileData(res.id, uIds, orgIds) as any;
        dataFile.attType = CERT_OBJ_TYPE.doc_out_internal;

        // Share permission for encrypted files
        const rsFile =
          await UploadFileService.doSharePermissionDocOutFile(dataFile);
        if (!rsFile) {
          rollBack(res.id);
          ToastUtils.error("Ban hành không thành công!!");
          return false;
        }
      }

      // Upload non-encrypted files. Use issuedFlag explicitly so we don't rely on
      // potentially stale React state when deciding whether to issue the draft.
      await doSaveDocumentAttactment(
        "DRAFT",
        res.id!,
        nonEncryptArr,
        issuedFlag
      );

      // For insert, behaviour depends on whether this is just save or save+issue
      if (!issuedFlag) {
        moveToWaitIssuedTab();
      }
    });
  };
  const saveDraftAndIssue = async (issuedFlag: boolean) => {
    const issueObj = {
      id: draftData.id,
      bookId: draftData.bookId,
      numberInBook: draftData.numberInBook,
      numberOrSign: draftData.numberOrSign,
      dateIssued: draftData.dateIssued,
      listReceive: draftData.listReceive,
      listSignersName: draftData.listSignersName,
      paperHandle: draftData.paperHandle,
    };
    if (!isCanEditnumberOrSign) {
      const issueObj = {
        id: draftData.id,
        dateIssued: draftData.dateIssued,
        listReceive: draftData.listReceive,
        listSignersName: draftData.listSignersName,
        paperHandle: draftData.paperHandle,
      };
    }
    const orgIds = draftData.listReceive
      .filter((i: any) => i.type === "ORG")
      .map((i: any) => i.receiveId);
    const userIds = draftData.listReceive
      .filter((i: any) => i.type === "USER")
      .map((i: any) => i.receiveId);
    const fullNameArr = draftData.listSignersName
      ? draftData.listSignersName.split(",")
      : [];
    const uIds = await UserService.getUserIdByFullNames(fullNameArr);
    const filteredEncryptArr = selectedFiles.filter(
      (i: DocAttachment) =>
        (i.encrypt && !i.id) || // New file with encryption
        (i.encrypt && i.id && !i.oEncrypt) || // Uploaded file, encrypt now, but not encrypted before
        (i.template && i.encrypt) // Template file with encryption
    );

    if (filteredEncryptArr && filteredEncryptArr.length > 0) {
      const encFiles = filteredEncryptArr.filter((i) => i.encrypt);
      if (encFiles && encFiles.length > 0) {
        const cert = await uploadFileService.getCert(uIds);
        if (!cert) {
          return false;
        }
      }

      const currentEncryptArray = await uploadFileService.filterFile(
        filteredEncryptArr,
        EncryptionService.ENCRYPT,
        OBJ_TYPE.VAN_BAN_DI
      );

      if (currentEncryptArray && currentEncryptArray.length > 0) {
        const rs = await EncryptionService.doEncryptExecute(
          currentEncryptArray as any[],
          draftData.id ?? 0,
          "VAN_BAN_DI_DU_THAO"
        );
        if (rs == false) {
          // this.rollBack(this.draft.id);
          return false;
        }
      }
    }
    // For update, only share encrypted files when actually issuing (matching Angular `if (this.hasIssued) { ... }`)
    if (issuedFlag) {
      if (userIds.length > 0) {
        uIds.push(...userIds);
        const dataFile = setSharedFileData(draftData.id, uIds, orgIds) as any;
        dataFile.attType = CERT_OBJ_TYPE.doc_out_internal;

        // Share permission for encrypted files
        const rs1 =
          await UploadFileService.doSharePermissionDocOutFile(dataFile);
        if (rs1 === false) {
          return false;
        }

        // Convert draft data before updating, ensure userCreateName is empty string like Angular
        const draftToUpdate = {
          ...draftData,
          userCreateName: draftData.userCreateName || "",
        };
        const draftDto = convertDraftToDraftDTO(draftToUpdate as any);
        draftDto.id = draftData.id;
        await updateDraft({ id: draftData.id, params: draftDto });
        setTimeout(() => {
          issueNewDraft(issueObj);
        }, 3000);
      }
    } else {
      // Convert draft data before updating, ensure userCreateName is empty string like Angular
      const draftToUpdate = {
        ...draftData,
        userCreateName: draftData.userCreateName || "",
      };
      const draftDto = convertDraftToDraftDTO(draftToUpdate as any);
      // Add id back for update API call (convertDraftToDraftDTO removes it)
      draftDto.id = draftData.id;
      await updateDraft({ id: draftData.id, params: draftDto });
      moveToWaitIssuedTab();
    }
  };
  const rollBack = (documentId: number | null) => {
    if (!documentId) {
      return;
    }
    deleteDraft(String(documentId));
  };

  const setSharedFileData = (
    docId: number | null,
    userIds: any,
    orgIds: any[]
  ) => {
    return {
      objId: docId,
      comment: "",
      files: [],
      orgIds: orgIds,
      userIds: userIds || [],
      userIdShared: [],
      allFileNames: [],
      attType: CERT_OBJ_TYPE.doc_out_add,
      cmtType: "VAN_BAN_DI_BINH_LUAN",
      objType: CERT_OBJ_TYPE.doc_out_add,
      userOrobj: CERT_OBJ_TYPE.user,
    };
  };

  const moveToWaitIssuedTab = () => {
    if (!hasIssued && !draftData.docId) {
      ToastUtils.success("Thêm mới dự thảo thành công.");
    } else {
      ToastUtils.error("Thêm mới dự thảo thất bại");
    }
    router.push(
      `/document-in/draft-issued?currentTab=${hasIssued ? "issued" : "waitIssued"}`
    );
  };
  const doSaveDocumentAttactment = async (
    attactmentType: "DRAFT" | "DOCUMENT",
    draftId: number,
    files: any,
    issuedFlag?: boolean
  ) => {
    const fd = new FormData();
    files.forEach((file: any) => {
      fd.append("files", file);
    });
    addDocument({
      action: attactmentType,
      draftId: String(draftId),
      params: fd,
    }).then((res) => {
      // Use the explicit issuedFlag from the caller (insert/update flow)
      // instead of relying on React state hasIssued, which may be stale
      // at the time this callback runs.
      if (issuedFlag) {
        doIssueDraft(draftId);
      }
    });
  };
  const doIssueDraft = (draftId: number) => {
    issueDraft(draftId).then((res) => {
      router.push(`/document-in/draft-issued?currentTab=issued`);
      notificationService.countUnreadNotification();
    });
  };
  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <ConfirmDeleteDialog
        isOpen={isConfirmDeleteOpen}
        onOpenChange={(open) => {
          setIsConfirmDeleteOpen(open);
          if (!open) setPendingDeleteIndex(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Xác nhận"
        description="Bạn chắc chắn muốn xóa tệp này?"
        confirmText="Xóa"
        cancelText="Hủy"
      />
      <div className="flex">
        <div className="flex-1 p-3 space-y-4">
          {/* Breadcrumb */}
          <BreadcrumbNavigation
            items={[
              {
                href: "",
                label: "Văn bản đi",
              },
              {
                href: "/document-in/draft-issued",
                label: "Văn bản ban hành",
              },
            ]}
            currentPage="Dự thảo văn bản ban hành"
            showHome={false}
          />

          <div className="flex items-center gap-1 flex-wrap justify-start lg:justify-start">
            <Button
              variant="outline"
              size="sm"
              className="flex items-center justify-center gap-2 h-9 bg-white-600 hover:bg-white-700"
              onClick={() => router.back()}
            >
              <Undo2 className="w-4 h-4" />
            </Button>
            <Button
              variant="default"
              size="sm"
              className="flex items-center gap-1 h-9 px-2 text-xs text-white hover:bg-blue-700 hover:text-white border-none bg-blue-600"
              onClick={() => issuedDocument("issue", true)}
            >
              <Folder className="w-4 h-4" />
              Ban hành và đóng
            </Button>

            <Button
              variant="default"
              size="sm"
              className="flex items-center gap-1 h-9 px-2 text-xs text-white hover:bg-blue-700 hover:text-white border-none bg-blue-600"
              onClick={() => issuedDocument("renew", true)}
            >
              <Newspaper className="w-4 h-4" />
              Ban hành và thêm mới
            </Button>
            <Button
              variant="default"
              size="sm"
              className="flex items-center gap-1 h-9 px-2 text-xs text-white hover:bg-blue-700 hover:text-white border-none bg-blue-600"
              onClick={() => issuedDocument("reuse", true)}
            >
              <Copy className="w-4 h-4" />
              Ban hành và sao lưu
            </Button>
            <Button
              variant="default"
              size="sm"
              className="flex items-center gap-1 h-9 px-2 text-xs text-white hover:bg-blue-700 hover:text-white border-none bg-blue-600"
              onClick={() => issuedDocument("save")}
            >
              <Copy className="w-4 h-4" />
              Lưu lại
            </Button>
          </div>
        </div>
      </div>
      <Card className="shadow-sm">
        <CardHeader className="p-4">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <Paperclip className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 flex-shrink-0">
              Thông tin văn bản
            </h1>
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="flex flex-col space-y-4">
            {/* Row: Book + DocType */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Sổ văn bản */}
              <div className="grid grid-cols-[140px,1fr] items-start gap-2">
                <label className="text-sm font-bold text-black text-right">
                  Sổ văn bản<span className="text-red-500">*</span>:
                </label>
                <div className="min-w-0 w-full">
                  <SelectCustom
                    options={bookFilter.map((b: any) => ({
                      value: String(b.id),
                      label: b.name,
                    }))}
                    value={draftData.bookId ? String(draftData.bookId) : ""}
                    onChange={(v) => {
                      const idNum = v ? Number(v) : null;
                      setDraftData((p: any) => ({ ...p, bookId: idNum }));
                      if (idNum != null) changeBook(idNum);
                    }}
                    placeholder="Chọn sổ văn bản"
                    className="h-9 max-w-full min-w-0"
                  />
                </div>
              </div>
              {/* Loại văn bản */}
              <div className="grid grid-cols-[140px,1fr] items-start gap-2">
                <label className="text-sm font-bold text-black text-right">
                  Loại văn bản:
                </label>
                <SearchableSelect
                  options={
                    initDraftDataHook?.docTypeCategories?.map((doc: any) => ({
                      value: String(doc.id),
                      label: doc.name,
                    })) || []
                  }
                  value={draftData.docTypeId ? String(draftData.docTypeId) : ""}
                  onChange={(v) =>
                    setDraftData((p: any) => ({
                      ...p,
                      docTypeId: v ? Number(v) : null,
                    }))
                  }
                  placeholder="Chọn loại văn bản"
                  className="w-full"
                />
              </div>
            </div>

            {/* Row: NumberInBook + NumberOrSign */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid grid-cols-[140px,1fr] items-start gap-2">
                <label className="text-sm font-bold text-black text-right">
                  Ngày ban hành:
                </label>
                <CustomDatePicker
                  id="dateIssued"
                  selected={
                    draftData.dateIssued
                      ? draftData.dateIssued instanceof Date
                        ? draftData.dateIssued
                        : typeof draftData.dateIssued === "number"
                          ? new Date(draftData.dateIssued)
                          : new Date(draftData.dateIssued)
                      : null
                  }
                  onChange={(date) =>
                    setDraftData((p: any) => ({
                      ...p,
                      dateIssued: date,
                    }))
                  }
                  placeholder="dd/mm/yyyy"
                  readOnly={!isCanEditnumberOrSign}
                  className="h-9 w-full"
                  showClearButton={false}
                />
              </div>
              <div className="grid grid-cols-[140px,1fr] items-start gap-2">
                <label className="text-sm font-bold text-black text-right">
                  Số/Ký hiệu:
                </label>
                {Constant.AUTO_NUMBER_IN_BOOK_DOC_OUT ? (
                  <div className="flex gap-2">
                    <Input
                      value={draftData.numberInBook || ""}
                      onChange={(e) =>
                        setDraftData((p: any) => ({
                          ...p,
                          numberInBook: e.target.value,
                        }))
                      }
                      className="h-9 flex-1"
                      placeholder="Số"
                      disabled={!isCanEditnumberOrSign}
                    />
                    <Input
                      value={draftData.numberOrSign || ""}
                      onChange={(e) =>
                        setDraftData((p: any) => ({
                          ...p,
                          numberOrSign: e.target.value,
                        }))
                      }
                      className="h-9 flex-1"
                      placeholder="Ký hiệu"
                      disabled={!isCanEditnumberOrSign}
                    />
                  </div>
                ) : (
                  <Input
                    value={draftData.numberOrSign || ""}
                    onChange={(e) =>
                      setDraftData((p: any) => ({
                        ...p,
                        numberOrSign: e.target.value,
                      }))
                    }
                    className="h-9"
                    disabled={!isCanEditnumberOrSign}
                  />
                )}
              </div>
            </div>

            {/* Row: Loại (paperHandle) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid grid-cols-[140px,1fr] items-start gap-2">
                <label className="text-sm font-bold text-black text-right">
                  Loại<span className="text-red-500">*</span>:
                </label>
                <div className="min-w-0 w-full">
                  <SelectCustom
                    value={draftData.paperHandle.toString()}
                    defaultValue="get pdf"
                    onChange={(v) => {
                      setDraftData((p: any) => ({
                        ...p,
                        paperHandle: v === "true",
                      }));
                    }}
                    options={[
                      { value: "true", label: "VĂN BẢN ĐIỆN TỬ" },
                      { value: "false", label: "VĂN BẢN XỬ LÝ GIẤY" },
                    ]}
                  />
                </div>
              </div>
            </div>

            {/* Row: Đơn vị soạn thảo + Đơn vị ban hành */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid grid-cols-[140px,1fr] items-start gap-2">
                <label className="text-sm font-bold text-black text-right">
                  Đơn vị ban hành:
                </label>
                {isFromPaper ? (
                  <div className="min-w-0 w-full">
                    <SelectCustom
                      options={
                        issuedOrgList?.map((org: any) => ({
                          value: String(org.id),
                          label: org.name,
                        })) || []
                      }
                      value={
                        draftData.orgIssuedId
                          ? String(draftData.orgIssuedId)
                          : ""
                      }
                      onChange={(v) =>
                        setDraftData((p: any) => ({
                          ...p,
                          orgIssuedId: v ? Number(v) : null,
                        }))
                      }
                      placeholder="Chọn đơn vị ban hành"
                      className="h-9"
                    />
                  </div>
                ) : (
                  <Input
                    value={draftData.orgCreateName || ""}
                    className="text-sm text-gray-900 font-medium bg-gray-50 px-2 py-1.5 rounded-md border h-9"
                    disabled
                  />
                )}
              </div>
              <div className="grid grid-cols-[140px,1fr] items-start gap-2">
                <label className="text-sm font-bold text-black text-right">
                  Đơn vị soạn thảo:
                </label>
                {isFromPaper ? (
                  <div className="min-w-0 w-full">
                    <SelectCustom
                      options={
                        createOrgList?.map((org: any) => ({
                          value: String(org.id),
                          label: org.name,
                        })) || []
                      }
                      value={
                        draftData.orgCreateId
                          ? String(draftData.orgCreateId)
                          : ""
                      }
                      onChange={(v) =>
                        setDraftData((p: any) => ({
                          ...p,
                          orgCreateId: v ? Number(v) : null,
                        }))
                      }
                      placeholder="Chọn đơn vị soạn thảo"
                      className="h-9"
                    />
                  </div>
                ) : (
                  <Input
                    value={draftData.orgCreateName || ""}
                    className="text-sm text-gray-900 font-medium bg-gray-50 px-2 py-1.5 rounded-md border h-9"
                    disabled
                  />
                )}
              </div>
            </div>

            {!isFromPaper && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid grid-cols-[140px,1fr] items-start gap-2">
                  <label className="text-sm font-bold text-black text-right">
                    Người soạn thảo:
                  </label>
                  <Input
                    value={draftData.personEnterName || ""}
                    className="text-sm text-gray-900 font-medium bg-gray-50 px-2 py-1.5 rounded-md border h-9"
                    disabled
                  />
                </div>
              </div>
            )}

            {/* Row: Trích yếu */}
            <div className="grid grid-cols-[140px,1fr] items-start gap-2">
              <label className="text-sm font-bold text-black text-right">
                Trích yếu<span className="text-red-500">*</span>:
              </label>
              <Textarea
                value={draftData.preview || ""}
                onChange={(e) =>
                  setDraftData((p: any) => ({ ...p, preview: e.target.value }))
                }
                className="min-h-[80px] px-2 py-1.5"
              />
            </div>

            {/* Row: Người ký (display if pre-populated, else show selector) */}
            {draftData.listSignersName &&
            draftData.listSignersName.trim().length > 0 ? (
              <div className="grid grid-cols-[140px,1fr] items-start gap-2">
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-black text-right">
                    Người ký<span className="text-red-500">*</span>:
                  </label>
                  <span className="text-xs text-gray-600 mt-1 text-right">
                    {
                      draftData.listSignersName
                        .split(",")
                        .filter((n: any) => n && n.trim().length > 0).length
                    }{" "}
                    người ký
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                  {draftData.listSignersName
                    .split(",")
                    .map((name: any, idx: any) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-3 py-1.5 rounded-md bg-gray-100 text-sm border text-blue-700 font-medium"
                      >
                        {name.trim()}
                      </span>
                    ))}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-[140px,1fr] items-start gap-2">
                <div className="flex flex-col">
                  <label className="text-sm font-bold text-black text-right">
                    Người ký<span className="text-red-500">*</span>:
                  </label>
                  <span className="text-xs text-gray-600 mt-1 text-right">
                    {
                      (draftData.listSignerIds || "")
                        .split(",")
                        .filter((n: any) => n && n.trim().length > 0).length
                    }{" "}
                    người ký
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <SignerSearch
                    onSubmit={(ids: string) =>
                      setDraftData((prev: any) => ({
                        ...prev,
                        listSignerIds: ids,
                      }))
                    }
                    onNamesChange={(names: string) =>
                      setDraftData((prev: any) => ({
                        ...prev,
                        listSignersName: names,
                      }))
                    }
                  />
                </div>
              </div>
            )}

            {/* Row: Nơi nhận nội bộ */}
            <div className="grid grid-cols-[140px,1fr] items-start gap-2">
              <label className="text-sm font-bold text-black text-right">
                Nơi nhận nội bộ:
              </label>
              <div className="flex items-center gap-2">
                <InternalReceivePlace
                  data={draftData.listReceive}
                  onSubmit={(list: ReceiveToKnow[]) =>
                    setDraftData((prev: any) => ({
                      ...prev,
                      listReceive: list,
                    }))
                  }
                />
              </div>
            </div>

            {/* Row: Nơi nhận bên ngoài */}
            <div className="grid grid-cols-[140px,1fr] items-start gap-2">
              <label className="text-sm font-bold text-black text-right">
                Nơi nhận bên ngoài:
              </label>
              <div className="flex items-center gap-2">
                <OutsideReceivePlace
                  onSubmit={(list) =>
                    setDraftData((prev: any) => ({
                      ...prev,
                      outsideReceives: list,
                    }))
                  }
                />
              </div>
            </div>

            {!isFileEncrypt && (
              <div className="grid grid-cols-[140px,1fr] items-start gap-2">
                <label className="text-sm font-bold text-black text-right">
                  Nơi nhận bên ngoài (Trục liên thông):
                </label>
                <div className="flex items-center gap-2">
                  <OutsideReceivePlace
                    onSubmit={(list) =>
                      setDraftData((prev: any) => ({
                        ...prev,
                        outsideReceiveLgsps: list,
                      }))
                    }
                  />
                </div>
              </div>
            )}
            {/* Row: Độ mật + Độ khẩn */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Độ mật */}
              <div className="grid grid-cols-[140px,1fr] items-start gap-2">
                <label className="text-sm font-bold text-black text-right">
                  Độ mật<span className="text-red-500">*</span>:
                </label>
                <Select
                  value={String(draftData.securityId ?? "")}
                  onValueChange={(v) =>
                    setDraftData((prev: any) => ({
                      ...prev,
                      securityId: Number(v),
                    }))
                  }
                >
                  <SelectTrigger className="h-9 bg-background">
                    <SelectValue placeholder="Chọn độ mật" />
                  </SelectTrigger>
                  <SelectContent>
                    {(securityCategoryFilter?.length
                      ? securityCategoryFilter
                      : initDraftDataHook?.securityCategories || []
                    ).map((doc: any) => (
                      <SelectItem key={doc.id} value={String(doc.id)}>
                        {doc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {/* Độ khẩn */}
              <div className="grid grid-cols-[140px,1fr] items-start gap-2">
                <label className="text-sm font-bold text-black text-right">
                  Độ khẩn<span className="text-red-500">*</span>:
                </label>
                <Select
                  value={String(draftData.urgentId ?? "")}
                  onValueChange={(v) =>
                    setDraftData((prev: any) => ({
                      ...prev,
                      urgentId: Number(v),
                    }))
                  }
                >
                  <SelectTrigger className="h-9 bg-background">
                    <SelectValue placeholder="Chọn độ khẩn" />
                  </SelectTrigger>
                  <SelectContent>
                    {initDraftDataHook?.urgentCategories?.map((doc: any) => (
                      <SelectItem key={doc.id} value={String(doc.id)}>
                        {doc.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Row: Phúc đáp văn bản + Ký số */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="grid grid-cols-[140px,1fr] items-start gap-2">
                <label className="text-sm font-bold text-black text-right">
                  Phúc đáp văn bản:
                </label>
                <input
                  type="checkbox"
                  checked={Boolean(draftData.replyDoc)}
                  onChange={(e) =>
                    setDraftData((p: any) => ({
                      ...p,
                      replyDoc: e.target.checked,
                    }))
                  }
                  className="h-4 w-4"
                />
              </div>
              {/* Ký số - Matching Angular logic */}
              {isFromPaper && Constant.BCY_ADD_SIGN_IN_ISSUED && isShowKySo && (
                <div className="grid grid-cols-[140px,1fr] items-start gap-2">
                  <label className="text-sm font-bold text-black text-right">
                    Ký số <span className="text-red-500">*</span>:
                  </label>
                  <Select
                    value={draftData.signCA ? "true" : "false"}
                    onValueChange={(v) =>
                      setDraftData((p: any) => ({
                        ...p,
                        signCA: v === "true",
                        paperHandle: v === "true",
                      }))
                    }
                  >
                    <SelectTrigger className="h-9 bg-background">
                      <SelectValue placeholder="Chọn ký số CA" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">Có</SelectItem>
                      <SelectItem value="false">Không</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
              {isFromPaper &&
                Constant.BCY_ADD_SIGN_IN_ISSUED &&
                !isShowKySo && (
                  <div className="grid grid-cols-[140px,1fr] items-start gap-2">
                    <label className="text-sm font-bold text-black text-right">
                      Ký số:
                    </label>
                    <Select
                      value={draftData.signCA ? "true" : "false"}
                      onValueChange={(v) =>
                        setDraftData((p: any) => ({
                          ...p,
                          signCA: v === "true",
                          paperHandle: v === "true",
                        }))
                      }
                    >
                      <SelectTrigger className="h-9 bg-background">
                        <SelectValue placeholder="Chọn ký số CA" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="true">Có</SelectItem>
                        <SelectItem value="false">Không</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
            </div>
            {draftData.replyDoc && (
              <div className="grid grid-cols-1 gap-2">
                <Card>
                  <CardHeader className="py-3">
                    <CardTitle className="text-sm font-bold">
                      Là văn bản trả lời của văn bản đến:{" "}
                      {!draftData.listReplyDoc ||
                      draftData.listReplyDoc.length === 0 ? (
                        <span className="text-gray-500 font-normal">
                          Không có văn bản nào được chọn
                        </span>
                      ) : null}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ReplyDocSelection
                      editable={true}
                      data={draftData.listReplyDoc}
                      onSubmit={(ids: string) =>
                        setDraftData((prev: any) => ({
                          ...prev,
                          replyDocIds: ids,
                        }))
                      }
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Row: Ghi chú */}
            <div className="grid grid-cols-[140px,1fr] items-start gap-2">
              <label className="text-sm font-bold text-black text-right">
                Ghi chú:
              </label>
              <Textarea
                value={draftData.note || ""}
                onChange={(e) =>
                  setDraftData((p: any) => ({ ...p, note: e.target.value }))
                }
                className="min-h-[60px] px-2 py-1.5"
              />
            </div>

            {/* Row: Tệp đính kèm */}
            <div className="grid grid-cols-[140px,1fr] items-start gap-2">
              <label className="text-sm font-bold text-black text-right">
                Tệp đính kèm:
              </label>
              <div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    asChild
                    variant="secondary"
                    className="h-9"
                    style={{ backgroundColor: "#22c6ab", color: "white" }}
                  >
                    {isCheckOpenDownLoadFileEncrypt ? (
                      <Label
                        className="flex items-center gap-2 cursor-pointer"
                        onClick={doSelectFileEncrypt}
                      >
                        <File className="h-4 w-4" /> Chọn tệp
                      </Label>
                    ) : (
                      <Label
                        htmlFor="upload-photo"
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <File className="h-4 w-4" /> Chọn tệp
                      </Label>
                    )}
                  </Button>

                  <Button
                    onClick={callScanService}
                    variant="secondary"
                    className="flex items-center gap-2 h-9"
                    style={{ backgroundColor: "#22c6ab", color: "white" }}
                  >
                    <Scan className="h-4 w-4" /> Scan tài liệu
                  </Button>
                  <input
                    ref={fileInputRef}
                    id="upload-photo"
                    type="file"
                    multiple
                    accept={Constant.ALLOWED_FILE_EXTENSION}
                    onChange={doSelectFiles}
                    className="hidden"
                  />
                </div>
                {validFileAttr.hasError && (
                  <div className="mt-2 text-red-500 text-sm">
                    {!validFileAttr.isValidFileSize && (
                      <p>Kích thước file quá lớn</p>
                    )}
                    {!validFileAttr.isValidExtension && (
                      <p>File không đúng định dạng</p>
                    )}
                  </div>
                )}
                {!validFileAttr.isValidNumberOfFiles && (
                  <p className="mt-2 text-red-500 text-sm">
                    Số lượng file tối đa cho phép là {Constant.MAX_FILES_UPLOAD}
                    .
                  </p>
                )}
                {(selectedFiles || []).length === 0 && (
                  <p className="text-muted my-1 text-xs">
                    Không có tệp nào được chọn
                  </p>
                )}
                {(selectedFiles || []).length > 0 && (
                  <div className="mt-2">
                    <Table
                      columns={columns}
                      dataSource={selectedFiles}
                      showPagination={false}
                    />
                  </div>
                )}
              </div>
            </div>
            <UploadEncryptOverlay
              isOpen={isShowChooseEncrypt}
              progress={uploadEncryptionProgress}
              onForceDisconnect={doForceDisconnect}
            />
            {encryptionProgress?.currentProgress < 100 ? (
              <EncryptOverlay
                isOpen={isShowLoadingEncrypt}
                progress={encryptionProgress}
                onForceDisconnect={doForceDisconnect}
                encryptTimer={true}
              />
            ) : (
              <LoadingOverlay
                isOpen={isShowLoadingEncrypt}
                isLoading={!(encryptionProgress?.currentProgress < 100)}
                text={"Đang tải file lên và chia sẻ khoá..."}
              />
            )}

            {/* Scan Modal */}
            <Dialog open={isOpenScanModal} onOpenChange={setIsOpenScanModal}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Thông tin tài liệu</DialogTitle>
                </DialogHeader>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    doScan();
                  }}
                  className="space-y-4"
                >
                  <div className="space-y-1">
                    <label className="font-medium">
                      Nhập tên tài liệu <span className="text-red-500">*</span>
                    </label>
                    <Input
                      value={docName}
                      onChange={(e) => setDocName(e.target.value)}
                      disabled={fileScanner.length > 0}
                      required
                      maxLength={200}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-medium">
                      Chọn định dạng tài liệu{" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="min-w-0 w-full">
                      <SelectCustom
                        value={docTypeScan}
                        defaultValue="get pdf"
                        onChange={(value) => setDocTypeScan(value as any)}
                        disabled={fileScanner.length > 0}
                        options={[
                          { value: "get pdf", label: "PDF" },
                          { value: "get png", label: "PNG" },
                        ]}
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="submit"
                      className="bg-blue-600 text-white h-9"
                    >
                      Scan
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
