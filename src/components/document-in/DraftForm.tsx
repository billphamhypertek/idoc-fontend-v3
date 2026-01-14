import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import InternalReceivePlace from "@/components/document-in/InternalReceivePlace";
import OutsideReceivePlace from "@/components/document-in/OutsideReceivePlace";
import ReceiveToKnowButton from "@/components/document-in/ReceiveToKnow";
import ReplyDocSelection from "@/components/document-in/ReplyDocSelection";
import ReplyTaskSelection from "@/components/document-in/ReplyTaskSelection";
import { TransferDocumentIn } from "@/components/document-in/TranferDocumentIn";
import { ConsultHandler } from "@/components/document-in/consultHandler";
import { DoneHandler } from "@/components/document-in/doneHandler";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SearchableSelect } from "@/components/ui/searchable-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Constant } from "@/definitions/constants/constant";
import {
  DocAttachment,
  Draft,
  FileLike,
  ReceiveToKnow,
  ReplyDoc,
  TaskAssignment,
} from "@/definitions/types/document.type";
import {
  processDraftInsert,
  useAddDocument,
  useAddDraft,
  useDetailEditDocument,
  useInitDraftData,
  useLoadTaskReport,
  useUpdateAlreadyFile,
  useUpdateDraft,
  useUpdateTemplate,
} from "@/hooks/data/document-in.data";
import { useGetNextNodes, useGetStartNodes } from "@/hooks/data/bpmn.data";
import { useGetNextConsultNodes } from "@/hooks/data/bpmn2.data";
import { ToastUtils } from "@/utils/toast.utils";
import { parsedUserInfo } from "@/utils/token.utils";
import { convertDraftToDraftDTO } from "@/utils/draft-mapper";
import {
  Check,
  Copy,
  Download,
  Eye,
  File,
  File as FileIcon,
  Folder,
  KeyRound,
  Newspaper,
  Paperclip,
  Plus,
  Undo2,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import useAuthStore from "@/stores/auth.store";
import { useEncryptStore } from "@/stores/encrypt.store";
import { Label } from "@/components/ui/label";
import { SelectTemplateDialog } from "@/components/common/SelectTemplateDialog";
import {
  UploadEncryptionProgress,
  UploadEncryptionService,
} from "@/services/upload-encryption.service";
import {
  canViewNoStatus,
  isExistFile,
  validFileSSize,
} from "@/utils/common.utils";
import { uploadFileService } from "@/services/file.service";
import { ATTACHMENT_DOWNLOAD_TYPE } from "@/definitions/constants/common.constant";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { useDeleteTemplate } from "@/hooks/data/template.data";
import { useDeleteAttachmentMutation } from "@/hooks/data/attachment.data";
import {
  EncryptionProgress,
  EncryptionService,
} from "@/services/encryption.service";
import { OBJ_TYPE } from "@/definitions/enums/document.enum";
import { useDeleteDocument } from "@/hooks/data/document-out.actions";
import UploadEncryptOverlay from "@/components/overlay/UploadEncryptOverlay";
import { DecryptionService } from "@/services/decryption.service";
import EncryptOverlay from "@/components/overlay/EncryptOverlay";
import LoadingOverlay from "@/components/overlay/LoadingOverlay";

interface DraftFormProps {
  action: "insert" | "update";
  id: string | null;
}

export const attachmentTypeInit: Draft["attachmentType"] = {
  document: "RELATE",
  draft: "DRAFT",
  comment: "COMMENT",
};

export const draftInitData: Omit<Draft, "attachmentType"> = {
  listReplyTask: [],
  docId: null,
  dateIssued: new Date(),
  listAttachVersion: [],
  canAddUser: false,
  canForward: false,
  editable: false,
  nodeId: null,
  docStatusName: "",
  listSignersName: "",
  docSecurityName: "",
  docTypeName: "",
  docUrgentName: "",
  note: "",
  numberInBook: "",
  status: "",
  id: null,
  attachments: [] as DocAttachment[],
  orgCreateName: "",
  userCreateName: "",
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
  signCA: false,
  relateTaskIds: "",
  outsideReceives: [],
  outsideReceiveLgsps: [],
  paperHandle: false,
  personEnterName: "",
};

type ValidFileAttr = {
  validFiles: boolean;
  isValidFileSize: boolean;
  isValidExtension: boolean;
  isValidNumberOfFiles: boolean;
  currentNumberOfFiles: number;
};

export function DraftForm({ action, id }: DraftFormProps) {
  const router = useRouter();
  const { user } = useAuthStore();
  const { isEncrypt: encryptShowing } = useEncryptStore();

  const searchParams = useSearchParams();
  const taskReportId = searchParams?.get("taskReportId") ?? "";

  const [draftData, setDraftData] = useState<Draft>({
    ...draftInitData,
    attachmentType: attachmentTypeInit,
  });
  const [draftSelectedFiles, setDraftSelectedFiles] = useState<DocAttachment[]>(
    []
  );
  const [documentSelectedFiles, setDocumentSelectedFiles] = useState<
    DocAttachment[]
  >([]);
  const [isFileEncrypt, setIsFileEncrypt] = useState(false);
  const [isAttachMore, setIsAttachMore] = useState(true);
  const [isCheckOpenDownLoadFileEncrypt, setIsCheckOpenDownLoadFileEncrypt] =
    useState(false);
  const [validFileAttr, setValidFileAttr] = useState<ValidFileAttr>({
    validFiles: true,
    isValidFileSize: true,
    isValidExtension: true,
    isValidNumberOfFiles: true,
    currentNumberOfFiles: 0,
  });
  const [isShowChooseEncrypt, setIsShowChooseEncrypt] = useState(false);
  const [isShowLoadingEncrypt, setIsShowLoadingEncrypt] = useState(false);
  const [isCheckEncrypt, setIsCheckEncrypt] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [hasDraftFileError, setHasDraftFileError] = useState(false);
  const [currentSelectedFileType, setCurrentSelectedFileType] = useState("");
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [confirmDialogData, setConfirmDialogData] = useState<{
    title: string;
    description: string;
    onConfirm: (params?: Record<string, any>) => void;
    params?: Record<string, any>;
  }>({
    title: "",
    description: "",
    onConfirm: (_?: Record<string, any>) => {},
    params: undefined,
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [uploadEncryptionProgress, setUploadEncryptionProgress] =
    useState<UploadEncryptionProgress>({});
  const [encryptionProgress, setEncryptionProgress] =
    useState<EncryptionProgress>({
      expectedChunks: 0,
      currentProgress: 0,
      receivedChunks: 0,
    });

  const { data: initDraftDataHook } = useInitDraftData();
  const { mutateAsync: addDraft } = useAddDraft();
  const { mutateAsync: updateDraft } = useUpdateDraft();
  const { mutateAsync: addDocument } = useAddDocument();
  const { mutateAsync: updateTemplate } = useUpdateTemplate();
  const { mutateAsync: updateAlreadyFile } = useUpdateAlreadyFile();
  const { data: detailDoc } = useDetailEditDocument(id);
  const userInfo = parsedUserInfo();
  const { mutateAsync: deleteMutation } = useDeleteTemplate();
  const { mutateAsync: deleteAttachmentMutation } =
    useDeleteAttachmentMutation();
  const { data: taskReport } = useLoadTaskReport(taskReportId);
  // Workflow nodes for transfer and consult
  const { data: startNodes } = useGetStartNodes(
    Constant.THREAD_TYPE.OUTCOMING,
    false,
    draftData.nodeId === null
  );
  const { data: nextNode } = useGetNextNodes(draftData.nodeId);
  const listNextNodeRaw = useMemo(() => {
    return (draftData.nodeId === null ? startNodes : nextNode) ?? [];
  }, [draftData.nodeId, startNodes, nextNode]);

  const { data: consultNodeData } = useGetNextConsultNodes(user);
  const listNextNodeConsult = consultNodeData ?? [];

  // Filter nodes and check done button - matching Angular's checkProcessDone()
  const { listNextNode, isshowDoneButton } = useMemo(() => {
    const rawList = listNextNodeRaw || [];
    const oldLength = rawList.length;
    const filteredList = rawList.filter((node: any) => !node.lastNode);
    const showDone = filteredList.length !== oldLength; // Has lastNode that was filtered out

    return {
      listNextNode: filteredList,
      isshowDoneButton: showDone,
    };
  }, [listNextNodeRaw]);
  const setAttachment = (items: any[]) => {
    setDraftSelectedFiles((prev) => [
      ...prev,
      ...items.map((item) => ({ ...item, template: true })),
    ]);
  };

  // Đảm bảo có draftId trước khi mở các action (mô phỏng Angular: auto save trước khi mở popup)
  const ensureDraftSaved = async (): Promise<number | null> => {
    if (draftData.id) return Number(draftData.id);
    // Validate tương tự Angular: cần có file và trích yếu
    if (draftSelectedFiles.length === 0) {
      ToastUtils.fileRequired();
      return null;
    }
    if (!draftData.preview || draftData.preview.trim().length === 0) {
      ToastUtils.abstractRequired();
      return null;
    }
    // Save mới
    const res = await addDraft(
      processDraftInsert({ ...draftData, paperHandle: true })
    );
    const newId = Number(res.id);
    // Gắn id vào state
    setDraftData((p) => ({ ...p, id: newId }) as Draft);

    // Upload attachments giống flow lưu
    await doSaveAllAttchment(newId);
    return newId;
  };

  // Validate trước khi mở các action (kể cả khi đã có id) - giống Angular doOpen...IfValid
  const validateDraftForAction = (): boolean => {
    if (!draftData.preview || draftData.preview.trim().length === 0) {
      ToastUtils.abstractRequired();
      return false;
    }
    if (draftSelectedFiles.length === 0) {
      ToastUtils.fileRequired();
      return false;
    }
    return true;
  };
  const doSelectFiles = (
    e: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
    const files = e.currentTarget.files;
    if (!files || files.length === 0) return;

    const setSelectedFiles =
      type === attachmentTypeInit.draft
        ? setDraftSelectedFiles
        : setDocumentSelectedFiles;
    const selectedFiles =
      type === attachmentTypeInit.draft
        ? draftSelectedFiles
        : documentSelectedFiles;
    setCurrentSelectedFileType(type);
    setValidFileAttr((v) => ({
      ...v,
      currentNumberOfFiles: v.currentNumberOfFiles + (files?.length ?? 0),
    }));

    if (!doCheckFileExtension(files, type)) {
      setValidFileAttr((v) => ({
        ...v,
        isValidExtension: false,
        validFiles: false,
      }));
      e.currentTarget.value = "";
      return;
    }

    if (!validFileSSize(files)) {
      setValidFileAttr((v) => ({
        ...v,
        isValidFileSize: false,
        validFiles: false,
      }));
      e.currentTarget.value = "";
      return;
    }

    if (!validateNumberOfFileUpload(selectedFiles, files, false)) return;

    // Passed all validation
    setValidFileAttr({
      validFiles: true,
      isValidFileSize: true,
      isValidExtension: true,
      isValidNumberOfFiles: true,
      currentNumberOfFiles: (selectedFiles?.length ?? 0) + files.length,
    });

    // Merge files without duplicates
    const updatedFile: DocAttachment[] = selectedFiles
      ? [...selectedFiles]
      : [];
    for (const f of Array.from(files)) {
      if (!isExistFile(f.name, updatedFile)) {
        updatedFile.push(f as unknown as DocAttachment);
      }
    }
    setSelectedFiles(updatedFile);
    setHasDraftFileError(false);
    setFormErrors((prev) => {
      const next = { ...prev };
      delete next.draftFiles;
      return next;
    });

    e.currentTarget.value = "";
    checkedEntry();
  };

  const doSelectFileEncrypt = async (type: string) => {
    setIsShowChooseEncrypt(true);
    if (encryptShowing) {
      const fileEncryptCheck =
        await UploadEncryptionService.openChooseFileToCheck();
      const setSelectedFiles =
        type === attachmentTypeInit.draft
          ? setDraftSelectedFiles
          : setDocumentSelectedFiles;
      setSelectedFiles((prev) => [...prev, ...fileEncryptCheck]);
      setIsShowChooseEncrypt(false);
    }
    checkedEntry();
  };
  const checkedEntry = () => {
    const setSelectedFiles =
      currentSelectedFileType === attachmentTypeInit.draft
        ? setDraftSelectedFiles
        : setDocumentSelectedFiles;

    setIsCheckOpenDownLoadFileEncrypt(encryptShowing);
    setIsCheckEncrypt(encryptShowing);
    setIsFileEncrypt(encryptShowing);

    if (encryptShowing) {
      setSelectedFiles((prevFiles) => {
        const updatedFile = EncryptionService.checkedEntry(
          initDraftDataHook?.securityCategories ?? [],
          draftData.securityId,
          prevFiles
        );
        return updatedFile.map((file) => {
          if (file) file.encrypt = true;
          return file;
        });
      });
    } else {
      setSelectedFiles((prevFiles) => {
        const updatedFile = EncryptionService.checkedEntry(
          initDraftDataHook?.securityCategories ?? [],
          draftData.securityId,
          prevFiles
        );
        return updatedFile.map((file) => {
          if (file) file.encrypt = false;
          return file;
        });
      });
    }
  };
  const doCheckFileExtension = (files: FileList, fileType: string | number) => {
    const exts = (s: string) =>
      s
        .split(",")
        .map((x) => x.trim().toLowerCase())
        .filter(Boolean);
    const draftExts = exts(Constant.ALLOWED_DRAFT_FILE_EXTENSION);
    const docExts = exts(Constant.ALLOWED_FILE_EXTENSION);

    for (const file of Array.from(files)) {
      const dot = file.name.lastIndexOf(".");
      const ext = dot >= 0 ? file.name.slice(dot).toLowerCase() : "";
      if (fileType === draftData.attachmentType.draft) {
        if (!draftExts.includes(ext)) return false;
      } else {
        if (!docExts.includes(ext)) return false;
      }
    }
    return true;
  };

  const isView = useCallback(
    (file: FileLike) => !!file && canViewNoStatus(file.name) && !file.oEncrypt,
    []
  );
  const viewFile = (file: any) => {
    if (action === "insert") {
      const isFreshUpload = !file?.id && !file?.docId; // file vừa upload từ máy
      if (isFreshUpload) {
        const name = (file?.name || "").toLowerCase();
        const type = file?.type || "";
        const isPdf = name.endsWith(".pdf") || type.includes("pdf");

        if (isPdf) {
          try {
            const blob: Blob =
              file instanceof Blob
                ? file
                : new Blob([file], { type: type || "application/pdf" });
            const url = URL.createObjectURL(blob);
            window.open(url, "_blank", "noopener,noreferrer");
          } catch {
            ToastUtils.khongTheXemFile();
          }
        } else {
          ToastUtils.error("Lỗi không tìm thấy tệp phù hợp");
        }
        return;
      }
      // Trường hợp chọn từ mẫu hoặc tệp đã tồn tại -> gọi API
      uploadFileService.viewFile(
        file,
        Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_IN
      );
      return;
    }
    // Các trường hợp khác giữ nguyên hành vi gọi API
    uploadFileService.viewFile(
      file,
      Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_IN
    );
  };
  const isVerifierPDF = (_: any, file: FileLike) => {
    if (!file || !file.id || file.oEncrypt) return false;
    return file.name.toLowerCase().includes(".pdf");
  };
  const verifierPDF = (file: FileLike) => {
    if (file.docId) {
      uploadFileService.verifierPDF(
        file.name,
        "",
        ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_IN
      );
    } else {
      // read and pass base64 like Angular
      const reader = new FileReader();
      reader.onload = (ev: any) => {
        const base64 = ev.target?.result ?? "";
        uploadFileService.verifierPDF(
          file.name,
          base64,
          ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_OUT
        );
      };
      try {
        reader.readAsDataURL(file as unknown as Blob);
      } catch {
        // ignore
      }
    }
  };
  const downloadFile = (name?: string, encrypt?: boolean) => {
    if (!name) return;
    uploadFileService.downloadFile(
      name,
      ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_IN,
      encrypt
    );
  };
  const doRemoveFile = (
    index: number,
    selectedFiles: DocAttachment[],
    type: string,
    file: DocAttachment
  ) => {
    if (file.id && file.docId) {
      const handleRemove = (param: Record<string, any>) =>
        removeFileAction(
          param.index,
          param.selectedFiles,
          param.type,
          param.file
        );
      setConfirmDialogData({
        title: "Xác nhận",
        description: `Tệp ${file.name} sẽ được xóa khỏi dữ liệu?`,
        onConfirm: (params) => {
          if (params) handleRemove(params);
        },
        params: { index, selectedFiles, type, file },
      });
      setIsConfirmDialogOpen(true);
    } else if (file.id) {
      deleteTemplateFile(file, selectedFiles);
    } else {
      removeFileFromView(index, selectedFiles, type, file);
    }
  };
  const deleteTemplateFile = (file: any, files: any) => {
    const doDelete = (f: any) => {
      deleteMutation({
        type: Constant.TYPE_TEMPLATE.VAN_BAN_DI,
        id: f.id,
      }).then(() => {
        ToastUtils.success("Xóa tệp thành công.");
        files.forEach((item: any, i: number) => {
          if (item.id === file.id) {
            files.splice(i, 1);
          }
        });
      });
    };
    setConfirmDialogData({
      title: "Xác nhận",
      description: `Bạn chắc chắn muốn xóa tệp này?`,
      onConfirm: doDelete,
      params: file,
    });
    setIsConfirmDialogOpen(true);
  };
  const removeFileAction = (
    index: any,
    selectedFiles: any,
    type: string,
    file: any
  ) => {
    deleteAttachmentMutation(file.id);
    removeFileFromView(index, selectedFiles, type, file);
  };

  const removeFileFromView = (
    index: number,
    selectedFiles: DocAttachment[],
    type: string,
    file: DocAttachment
  ) => {
    const next = (selectedFiles ?? []).slice();
    if (index >= 0 && index < next.length) next.splice(index, 1);

    const setSelectedFiles =
      type === attachmentTypeInit.draft
        ? setDraftSelectedFiles
        : setDocumentSelectedFiles;
    setSelectedFiles((prev) => {
      return prev.filter((f) => f.id !== file.id);
    });

    setValidFileAttr((v) => ({
      ...v,
      currentNumberOfFiles: Math.max(0, v.currentNumberOfFiles - 1),
    }));

    validateNumberOfFileUpload(next, new DataTransfer().files, true);
  };
  const validateNumberOfFileUpload = (
    selectedFiles: DocAttachment[],
    currentUploaded: FileList,
    isRemove: boolean
  ) => {
    const selectedSize = selectedFiles ? selectedFiles.length : 0;
    if (!isRemove) {
      if (selectedSize + currentUploaded.length > Constant.MAX_FILES_UPLOAD) {
        setValidFileAttr((v) => ({ ...v, isValidNumberOfFiles: false }));
        return false;
      }
    } else if (selectedSize < Constant.MAX_FILES_UPLOAD) {
      setValidFileAttr((v) => ({ ...v, isValidNumberOfFiles: true }));
      return true;
    }
    return true;
  };

  const renderFileRow = (
    file: DocAttachment,
    i: number,
    type: string,
    listRef: DocAttachment[]
  ) => (
    <div className="mb-2" key={`${type}-${i}`}>
      <div className="flex flex-wrap items-center gap-2">
        <span className="truncate text-sm font-medium">
          {file.displayName || file.name}
        </span>

        <div
          className="cursor-pointer hover:text-blue-600 transition-colors"
          onClick={() => viewFile(file)}
          title="Xem tệp đính kèm"
        >
          <Eye className="h-4 w-4" />
        </div>

        {isVerifierPDF(draftData, file) && (
          <div
            className="cursor-pointer hover:text-green-600 transition-colors"
            onClick={() => verifierPDF(file)}
            title="Xác thực ký số"
          >
            <Check className="h-4 w-4" />
          </div>
        )}

        {file && file.id && !isView(file) && (
          <div
            className="cursor-pointer hover:text-blue-600 transition-colors"
            onClick={() => downloadFile(file.name, file.encrypt)}
            title="Tải tệp đính kèm"
          >
            <Download className="h-4 w-4" />
          </div>
        )}

        {Constant.ENCRYPTION_TWD && !isCheckEncrypt && !file.encrypt && (
          <span
            className="inline-flex items-center rounded p-1 text-gray-400"
            title="Mã hóa tệp tin"
          >
            <KeyRound className="h-4 w-4" />
          </span>
        )}

        {Constant.ENCRYPTION_TWD && isCheckEncrypt && file.encrypt && (
          <span
            className="inline-flex items-center rounded p-1 text-red-500"
            title="Mã hóa tệp tin"
          >
            <KeyRound className="h-4 w-4" />
          </span>
        )}

        <div
          className="cursor-pointer text-red-600 hover:text-red-800 transition-colors"
          onClick={() => doRemoveFile(i, listRef, type, file)}
          title="Xóa tệp đính kèm"
        >
          <X className="h-4 w-4" />
        </div>
      </div>
    </div>
  );

  const handleSubmit = async (mode: "reset" | "redirect" | "keep") => {
    const validate = () => {
      const errs: Record<string, string> = {};
      if (!draftData.docTypeId) errs.docTypeId = "Vui lòng chọn loại văn bản.";
      if (!draftData.securityId) errs.securityId = "Vui lòng chọn độ mật.";
      if (!draftData.urgentId) errs.urgentId = "Vui lòng chọn độ khẩn.";
      if (!draftData.preview || draftData.preview.trim().length === 0) {
        errs.preview = "Trích yếu phải có ít nhất một ký tự.";
      }
      if (draftSelectedFiles.length === 0) {
        errs.draftFiles = "Yêu cầu phải nhập tệp đính kèm";
        setHasDraftFileError(true);
      } else {
        setHasDraftFileError(false);
      }
      setFormErrors(errs);
      return errs;
    };
    if (Object.keys(validate()).length > 0) return;
    if (encryptShowing) setIsShowLoadingEncrypt(true);
    setDraftData((p) => ({ ...p, paperHandle: true }));
    if (action === "insert") {
      const res = await addDraft(processDraftInsert(draftData));
      const currentId = res.id!;
      const rs = await doSaveAllAttchment(currentId);
      if (!rs) rollBack(currentId);
    } else if (action === "update") {
      // Convert draft data before updating, ensure userCreateName is empty string like Angular
      const draftToUpdate = {
        ...draftData,
        userCreateName: draftData.userCreateName || "",
      };
      const draftDto = convertDraftToDraftDTO(draftToUpdate as any);
      const currentId = draftData.id!;
      await updateDraft({ id: currentId, params: draftDto });
      const rs = await doSaveAllAttchment(currentId);
    }
    if (mode === "redirect") {
      router.push("/document-in/draft-list");
    }
    if (mode === "reset") {
      setDraftData({
        ...draftInitData,
        attachmentType: attachmentTypeInit,
      });
    }
    if (action === "insert") ToastUtils.documentCreateSuccess();
    else ToastUtils.documentUpdateSuccess();
  };
  const { mutate: doDeleteDocumentMutation } = useDeleteDocument();

  const rollBack = async (documentId: number) => {
    await doDeleteDocumentMutation(documentId);
  };

  const doSaveAllAttchment = async (documentId: number) => {
    const encryptArrDraft = await uploadFileService.filterFile(
      draftSelectedFiles,
      EncryptionService.ENCRYPT,
      OBJ_TYPE.VAN_BAN_DI
    );
    const nonEncryptArrDraft = await uploadFileService.filterFile(
      draftSelectedFiles,
      "",
      OBJ_TYPE.VAN_BAN_DI
    );
    const encryptArrDoc = await uploadFileService.filterFile(
      documentSelectedFiles,
      EncryptionService.ENCRYPT,
      OBJ_TYPE.VAN_BAN_DI
    );
    const nonEncryptArrDoc = await uploadFileService.filterFile(
      documentSelectedFiles,
      "",
      OBJ_TYPE.VAN_BAN_DI
    );
    const rs = await EncryptionService.doEncryptExecute(
      encryptArrDraft as File[],
      documentId,
      "VAN_BAN_DI_DU_THAO"
    );
    if (!rs) {
      console.warn("Encrypt thất bại");
      setDraftSelectedFiles((prev) =>
        prev.map((i) => ({ ...i, encrypt: false }))
      );
      return false;
    }
    const rs1 = await EncryptionService.doEncryptExecute(
      encryptArrDoc as File[],
      documentId,
      "VAN_BAN_DI_LIEN_QUAN"
    );
    if (!rs1) {
      console.warn("Encrypt thất bại");
      setDocumentSelectedFiles((prev) =>
        prev.map((i) => ({ ...i, encrypt: false }))
      );
      return false;
    }
    const documentFilesFd = new FormData();
    nonEncryptArrDoc.forEach((file: any) => {
      documentFilesFd.append("files", file);
    });
    await addDocument({
      action: "DOCUMENT",
      draftId: String(documentId),
      params: documentFilesFd,
    });
    if (nonEncryptArrDraft.length !== 0) {
      for (const item of nonEncryptArrDraft) {
        if (item.id && !item.docId && item.template) {
          await updateTemplate({
            type: Constant.TYPE_TEMPLATE.VAN_BAN_DI,
            templateId: item.id.toString(),
            docId: String(documentId),
          });
        }
        if (item.id && !item.docId) {
          const listAtt: number[] = nonEncryptArrDraft
            .map((item) => item.id)
            .filter((id): id is string | number => id !== undefined)
            .map((id) => Number(id));
          await updateAlreadyFile({
            docId: String(documentId),
            listId: listAtt,
          });
        }
      }
    }
    const draftFileFd = new FormData();
    nonEncryptArrDraft.forEach((file: any) => {
      draftFileFd.append("files", file);
    });
    await addDocument({
      action: "DRAFT",
      draftId: String(documentId),
      params: draftFileFd,
    });
    return true;
  };
  const doForceDisconnect = async () => {
    DecryptionService.disconnect();
    setIsFileEncrypt(false);
    setIsShowChooseEncrypt(false);
  };
  useEffect(() => {
    checkedEntry();
  }, []);
  useEffect(() => {
    setIsFileEncrypt(encryptShowing);
  }, [encryptShowing]);
  useEffect(() => {
    if (detailDoc) {
      setDraftData({
        ...detailDoc,
        attachmentType: detailDoc.attachmentType ?? attachmentTypeInit,
        userCreateName:
          detailDoc.personEnterName ?? initDraftDataHook?.userCreateName,
      });
      const documentFiles = detailDoc.attachments.filter(
        (file) => file.attachmentType === attachmentTypeInit.document
      );

      const draftFiles = detailDoc.attachments.filter(
        (file) => file.attachmentType === attachmentTypeInit.draft
      );

      setDraftSelectedFiles(draftFiles);
      setDocumentSelectedFiles(documentFiles);
    }
  }, [detailDoc, initDraftDataHook?.userCreateName]);
  useEffect(() => {
    if (!draftData.docTypeId && initDraftDataHook?.docTypeCategories?.length) {
      const first = initDraftDataHook.docTypeCategories[0];
      setDraftData((p) => ({ ...p, docTypeId: first.id }));
    }
    if (
      !draftData.securityId && // not set yet
      initDraftDataHook?.securityCategories?.length
    ) {
      const first = initDraftDataHook.securityCategories[0];
      setDraftData((p) => ({ ...p, securityId: first.id }));
    }
    if (
      !draftData.urgentId && // not set yet
      initDraftDataHook?.urgentCategories?.length
    ) {
      const first = initDraftDataHook.urgentCategories[0];
      setDraftData((p) => ({ ...p, urgentId: first.id }));
    }
    if (!draftData.userCreateName) {
      setDraftData((p) => ({
        ...p,
        userCreateName: initDraftDataHook?.userCreateName ?? "",
      }));
    }
    if (!draftData.orgCreateName) {
      setDraftData((p) => ({
        ...p,
        orgCreateName: initDraftDataHook?.orgCreateName ?? "",
      }));
    }
  }, [
    initDraftDataHook?.docTypeCategories,
    draftData.docTypeId,
    initDraftDataHook?.securityCategories,
    draftData.securityId,
    initDraftDataHook?.urgentCategories,
    draftData.urgentId,
    draftData.orgCreateName,
    draftData.userCreateName,
    initDraftDataHook?.orgCreateName,
    initDraftDataHook?.userCreateName,
  ]);
  useEffect(() => {
    if (taskReport) {
      setDraftSelectedFiles((prev) => [...prev, taskReport]);
      setIsAttachMore(false);
    }
  }, [taskReport]);
  useEffect(() => {
    const unsubs = [
      UploadEncryptionService.subscribe(setUploadEncryptionProgress),
      EncryptionService.subscribe(setEncryptionProgress),
    ];

    return () =>
      unsubs.forEach((u) => {
        if (typeof u === "function") u();
      });
  }, []);

  return (
    <>
      <div className="min-h-screen bg-gray-50 p-4">
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
                  href: "/document-in/draft-list",
                  label: "Danh sách dự thảo",
                },
              ]}
              currentPage="Dự thảo văn bản trình ký"
              showHome={false}
            />

            <div className="space-y-3 lg:space-y-0">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
                <div className="flex items-center gap-1 flex-wrap justify-start lg:justify-end">
                  <Button
                    variant="default"
                    size="sm"
                    className="flex items-center gap-1 h-9 px-2 text-xs text-white hover:bg-blue-700 hover:text-white border-none bg-blue-600"
                    onClick={() => router.back()}
                  >
                    <Undo2 className="w-4 h-4" />
                  </Button>
                  {!isFileEncrypt && (
                    <Button
                      variant="default"
                      size="sm"
                      className="flex items-center gap-1 h-9 px-2 text-xs text-white hover:bg-blue-700 hover:text-white border-none bg-blue-600"
                      onClick={() => handleSubmit("reset")}
                      disabled={isFileEncrypt}
                    >
                      <Newspaper className="w-4 h-4" />
                      Lưu và thêm mới
                    </Button>
                  )}
                  <Button
                    variant="default"
                    size="sm"
                    className="flex items-center gap-1 h-9 px-2 text-xs text-white hover:bg-blue-700 hover:text-white border-none bg-blue-600"
                    onClick={() => handleSubmit("redirect")}
                  >
                    <Folder className="w-4 h-4" />
                    Lưu và đóng
                  </Button>
                  {!isFileEncrypt && (
                    <Button
                      variant="default"
                      size="sm"
                      className="flex items-center gap-1 h-9 px-2 text-xs text-white bg-blue-600 hover:bg-blue-700"
                      onClick={() => handleSubmit("keep")}
                      disabled={isFileEncrypt}
                    >
                      <Copy className="w-4 h-4" />
                      Lưu và sao lưu
                    </Button>
                  )}
                  {/* Hoàn thành xử lý - hiện khi có lastNode; nếu chưa có id thì hiển thị nút disabled để đúng UX với Angular */}
                  {isshowDoneButton &&
                    (isFileEncrypt ? (
                      <Button
                        variant="outline"
                        disabled
                        className="text-white border-0 h-9 px-3 text-xs disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 hover:text-white"
                        title="Đang mã hóa tệp - Không thể hoàn thành"
                      >
                        Hoàn thành xử lý
                      </Button>
                    ) : (
                      <DoneHandler
                        selectedItem={draftData.id ? [draftData.id] : []}
                        onSuccess={async () => {
                          ToastUtils.success("Hoàn thành văn bản thành công!");
                          router.push("/document-in/draft-list");
                        }}
                        isDoneFromEditOrNew={true}
                        onEnsureId={ensureDraftSaved}
                        beforeOpenValidate={validateDraftForAction}
                      />
                    ))}
                  {/* Chuyển xử lý - luôn hiển thị khi có node; component tự disabled nếu chưa có id */}
                  {!isFileEncrypt &&
                    listNextNode &&
                    listNextNode.length > 0 && (
                      <TransferDocumentIn
                        selectedItemId={draftData.id ?? null}
                        listNextNode={listNextNode}
                        onSuccess={async () => {
                          ToastUtils.success("Chuyển xử lý thành công!");
                          router.push("/document-in/draft-list");
                        }}
                        isTransferDraft={false}
                        onEnsureId={ensureDraftSaved}
                        beforeOpenValidate={validateDraftForAction}
                      />
                    )}
                  {/* Luồng xin ý kiến - luôn hiển thị khi có node; component tự disabled nếu chưa có id */}
                  {listNextNodeConsult && listNextNodeConsult.length > 0 && (
                    <ConsultHandler
                      selectedItemId={draftData.id ?? null}
                      currentNode={draftData.nodeId}
                      consultNodeData={listNextNodeConsult}
                      onSuccess={async () => {
                        ToastUtils.success("Xin ý kiến thành công!");
                      }}
                      onEnsureId={ensureDraftSaved}
                    />
                  )}
                </div>
              </div>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Row: Đơn vị soạn thảo */}
                <div className="grid grid-cols-[140px,1fr] items-start gap-2">
                  <label className="text-sm font-bold text-black text-right">
                    Đơn vị soạn thảo:
                  </label>
                  <Input
                    value={draftData.orgCreateName || userInfo?.orgModel?.name}
                    className="text-sm text-gray-900 font-medium bg-gray-50 px-2 py-1.5 rounded-md border h-9"
                    disabled
                  />
                </div>

                {/* Row: Người soạn thảo */}
                <div className="grid grid-cols-[140px,1fr] items-start gap-2">
                  <label className="text-sm font-bold text-black text-right">
                    Người soạn thảo:
                  </label>
                  <Input
                    value={draftData.userCreateName}
                    className="text-sm text-gray-900 font-medium bg-gray-50 px-2 py-1.5 rounded-md border h-9"
                    disabled
                  />
                </div>
              </div>
              {/* Row: Loại văn bản + Độ mật + Độ khẩn side by side */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Loại văn bản */}
                <div className="grid grid-cols-[140px,1fr] items-start gap-2">
                  <label className="text-sm font-bold text-black text-right">
                    Loại văn bản:<span className="text-red-500">*</span>
                  </label>
                  <SearchableSelect
                    options={
                      initDraftDataHook?.docTypeCategories?.map((doc) => ({
                        value: String(doc.id),
                        label: doc.name,
                      })) || []
                    }
                    value={String(draftData.docTypeId ?? "")}
                    onValueChange={(v) => {
                      setDraftData((p) => ({
                        ...p,
                        docTypeId: v ? Number(v) : 0,
                      }));
                      setFormErrors((prev) => {
                        const next = { ...prev };
                        delete next.docTypeId;
                        return next;
                      });
                    }}
                    placeholder="Chọn loại văn bản"
                    searchPlaceholder="Tìm kiếm loại văn bản..."
                    emptyMessage="Không tìm thấy loại văn bản"
                    className="h-9 w-auto"
                  />
                  {formErrors.docTypeId && (
                    <p className="col-span-2 md:col-span-1 mt-1 text-xs text-red-600 ml-[150px]">
                      {formErrors.docTypeId}
                    </p>
                  )}
                </div>

                {/* Độ mật */}
                <div className="grid grid-cols-[140px,1fr] items-start gap-2">
                  <label className="text-sm font-bold text-black text-right">
                    Độ mật:<span className="text-red-500">*</span>
                  </label>
                  <Select
                    value={String(draftData.securityId ?? "")}
                    onValueChange={(v) => {
                      setDraftData((prev) => ({
                        ...prev,
                        securityId: Number(v),
                      }));
                      setFormErrors((prev) => {
                        const next = { ...prev };
                        delete next.securityId;
                        return next;
                      });
                    }}
                  >
                    <SelectTrigger className="h-9 bg-background">
                      <SelectValue placeholder="Chọn độ mật" />
                    </SelectTrigger>
                    <SelectContent>
                      {initDraftDataHook?.securityCategories?.map((doc) => (
                        <SelectItem key={doc.id} value={String(doc.id)}>
                          {doc.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formErrors.securityId && (
                    <p className="col-span-2 md:col-span-1 mt-1 text-xs text-red-600 ml-[150px]">
                      {formErrors.securityId}
                    </p>
                  )}
                </div>

                {/* Độ khẩn */}
                <div className="grid grid-cols-[140px,1fr] gap-2">
                  <label className="text-sm font-bold text-black text-right">
                    Độ khẩn:<span className="text-red-500">*</span>
                  </label>
                  <SearchableSelect
                    value={String(draftData.urgentId ?? "")}
                    onValueChange={(v) => {
                      setDraftData((prev) => ({
                        ...prev,
                        urgentId: Number(v),
                      }));
                      setFormErrors((prev) => {
                        const next = { ...prev };
                        delete next.urgentId;
                        return next;
                      });
                    }}
                    options={
                      initDraftDataHook?.urgentCategories?.map((doc) => ({
                        value: String(doc.id),
                        label: doc.name,
                      })) || []
                    }
                    placeholder="Chọn độ khẩn"
                    className="h-9 w-auto"
                  />
                </div>
              </div>
              {/* Row: Trích yếu (textarea stays in the right cell) */}
              <div className="grid grid-cols-[140px,1fr] gap-2">
                <label className="text-sm font-bold text-black text-right">
                  Trích yếu:<span className="text-red-500">*</span>
                </label>
                <Textarea
                  value={draftData.preview || ""}
                  onChange={(e) => {
                    setDraftData((p) => ({ ...p, preview: e.target.value }));
                    if (formErrors.preview) {
                      setFormErrors((prev) => {
                        const next = { ...prev };
                        delete next.preview;
                        return next;
                      });
                    }
                  }}
                  className="min-h-[80px] px-2 py-1.5"
                />
                {formErrors.preview && (
                  <p className="col-span-2 mt-1 text-xs text-red-600 ml-[150px]">
                    {formErrors.preview}
                  </p>
                )}
              </div>
              {/* Row: Người ký */}
              <div className="grid grid-cols-[140px,1fr] items-start gap-2">
                <label className="text-sm font-bold text-black text-right">
                  Người ký:
                </label>
                <div className="flex items-center gap-2">
                  <ReceiveToKnowButton
                    onSubmit={(ids: string) =>
                      setDraftData((prev) => ({
                        ...prev,
                        listSignerIds: ids,
                      }))
                    }
                  />
                </div>
              </div>
              {/* Row: Nơi nhận nội bộ */}
              <div className="grid grid-cols-[140px,1fr] items-start gap-2">
                <label className="text-sm font-bold text-black text-right">
                  Nơi nhận nội bộ:
                </label>
                <div className="flex items-center gap-2">
                  <InternalReceivePlace
                    data={draftData.listReceive}
                    onSubmit={(list: ReceiveToKnow[]) =>
                      setDraftData((prev) => ({
                        ...prev,
                        listReceive: list,
                      }))
                    }
                  />
                </div>
              </div>
              {/* Row: Nơi nhận bên ngoài */}
              {!isFileEncrypt && (
                <div className="grid grid-cols-[140px,1fr] items-start gap-2">
                  <label className="text-sm font-bold text-black text-right">
                    Nơi nhận bên ngoài:
                  </label>
                  <div className="flex items-center gap-2">
                    <OutsideReceivePlace
                      onSubmit={(list) =>
                        setDraftData((prev) => ({
                          ...prev,
                          outsideReceives: list,
                        }))
                      }
                    />
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Row: Phúc đáp văn bản */}
                <div className="grid grid-cols-[140px,1fr] items-center gap-2">
                  <label className="text-sm font-bold text-black text-right">
                    Phúc đáp văn bản:
                  </label>
                  <input
                    type="checkbox"
                    checked={Boolean(draftData.replyDoc)}
                    onChange={(e) =>
                      setDraftData((p) => ({
                        ...p,
                        replyDoc: e.target.checked,
                      }))
                    }
                    className="h-4 w-4"
                  />
                </div>

                {/* Row: Công việc liên quan */}
                <div className="grid grid-cols-[140px,1fr] items-center gap-2">
                  <label className="text-sm font-bold text-black text-right">
                    Công việc liên quan:
                  </label>
                  <input
                    type="checkbox"
                    checked={Boolean(draftData.replyTask)}
                    onChange={(e) =>
                      setDraftData((p) => ({
                        ...p,
                        replyTask: e.target.checked,
                      }))
                    }
                    className="h-4 w-4"
                  />
                </div>
              </div>
              {/* Row: Phúc đáp văn bản table */}
              {draftData.replyDoc && (
                <div className="grid grid-cols-[140px,1fr] items-start gap-2">
                  <div className="min-w-0 col-span-2">
                    <ReplyDocSelection
                      editable={true}
                      data={draftData.listReplyDoc}
                      onSubmit={(ids: string) =>
                        setDraftData((prev) => ({
                          ...prev,
                          replyDocIds: ids,
                        }))
                      }
                    />
                  </div>
                </div>
              )}
              {/* Row: Công việc table */}
              {draftData.replyTask && (
                <div className="grid grid-cols-[140px,1fr] items-start gap-2">
                  <div className="min-w-0 col-span-2">
                    <ReplyTaskSelection
                      editable={true}
                      data={draftData.listRelateTask}
                      onSubmit={(ids: string) =>
                        setDraftData((prev) => ({
                          ...prev,
                          relateTaskIds: ids,
                        }))
                      }
                    />
                  </div>
                </div>
              )}
              {/* Row: Tệp đính kèm */}
              <div className="grid grid-cols-[140px,1fr] items-start gap-2">
                <label className="text-sm font-bold text-black text-right">
                  Tệp đính kèm:<span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  {/* Dự thảo */}
                  <div className="rounded-2xl border shadow-sm">
                    <div className="border-b px-4 py-2 text-center">
                      <strong>Dự thảo</strong>
                    </div>
                    <div className="p-4">
                      {isAttachMore && (
                        <div className="mb-3 space-x-2">
                          {isCheckOpenDownLoadFileEncrypt ? (
                            <Button
                              type="button"
                              onClick={() =>
                                doSelectFileEncrypt(
                                  draftData.attachmentType.draft
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm  bg-green-500 text-white hover:bg-green-600 hover:text-white border-none"
                            >
                              <FileIcon className="h-4 w-4" />
                              Chọn tệp
                            </Button>
                          ) : (
                            <Label
                              htmlFor="upload-draft"
                              className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm  bg-green-500 text-white hover:bg-green-600 hover:text-white border-none"
                            >
                              <FileIcon className="h-4 w-4" />
                              Chọn tệp
                            </Label>
                          )}

                          <Button
                            variant={"outline"}
                            type="button"
                            onClick={() => setShowTemplateDialog(true)}
                            className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm  bg-green-500 text-white hover:bg-green-600 hover:text-white border-none"
                          >
                            <Plus className="h-4 w-4" />
                            Chọn mẫu
                          </Button>

                          <Input
                            id="upload-draft"
                            type="file"
                            name="attachment"
                            multiple
                            accept={Constant.ALLOWED_DRAFT_FILE_EXTENSION}
                            onChange={(e) =>
                              doSelectFiles(e, draftData.attachmentType.draft)
                            }
                            className="hidden"
                          />

                          {/* Validation messages for DRAFT */}
                          {currentSelectedFileType ===
                            draftData.attachmentType.draft && (
                            <>
                              {!validFileAttr.isValidFileSize && (
                                <p className="mt-2 text-xs text-red-600">
                                  Kích thước tệp vượt quá giới hạn.
                                </p>
                              )}
                              {!validFileAttr.isValidExtension && (
                                <p className="mt-1 text-xs text-red-600">
                                  File không đúng định dạng.
                                </p>
                              )}
                              {!validFileAttr.isValidNumberOfFiles && (
                                <p className="mt-1 text-xs text-red-600">
                                  Số lượng file tối đa cho phép là{" "}
                                  {Constant.MAX_FILES_UPLOAD}.
                                </p>
                              )}
                            </>
                          )}

                          {!validFileAttr.validFiles && (
                            <p className="mt-1 text-xs text-red-600">
                              Tệp dự thảo phải có
                            </p>
                          )}

                          {draftSelectedFiles.length === 0 && (
                            <p className="mt-1 text-xs text-gray-500">
                              Không có tệp nào được chọn
                            </p>
                          )}
                        </div>
                      )}

                      <div className="space-y-3">
                        {draftSelectedFiles.map((f, i) =>
                          renderFileRow(
                            f,
                            i,
                            draftData.attachmentType.draft,
                            draftSelectedFiles
                          )
                        )}
                      </div>

                      {hasDraftFileError && (
                        <div className="mt-2 text-sm text-red-600">
                          Tệp dự thảo phải có
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Văn bản đính kèm */}
                  <div className="rounded-2xl border shadow-sm">
                    <div className="border-b px-4 py-2 text-center">
                      <strong>Văn bản đính kèm</strong>
                    </div>
                    <div className="p-4">
                      {isAttachMore && (
                        <div className="mb-3 space-x-2">
                          {isCheckOpenDownLoadFileEncrypt ? (
                            <Button
                              type="button"
                              onClick={() =>
                                doSelectFileEncrypt(
                                  draftData.attachmentType.document
                                )
                              }
                              className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm  bg-green-500 text-white hover:bg-green-600 hover:text-white border-none"
                            >
                              <FileIcon className="h-4 w-4" />
                              Chọn tệp
                            </Button>
                          ) : (
                            <Label
                              htmlFor="upload-document"
                              className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-1.5 text-sm  bg-green-500 text-white hover:bg-green-600 hover:text-white border-none"
                            >
                              <FileIcon className="h-4 w-4" />
                              Chọn tệp
                            </Label>
                          )}

                          <Input
                            id="upload-document"
                            type="file"
                            name="attachment"
                            multiple
                            accept={Constant.ALLOWED_FILE_EXTENSION}
                            onChange={(e) =>
                              doSelectFiles(
                                e,
                                draftData.attachmentType.document
                              )
                            }
                            className="hidden"
                          />

                          {/* Validation messages for DOCUMENT */}
                          {currentSelectedFileType ===
                            draftData.attachmentType.document && (
                            <>
                              {!validFileAttr.isValidFileSize && (
                                <p className="mt-2 text-xs text-red-600">
                                  Kích thước tệp vượt quá giới hạn.
                                </p>
                              )}
                              {!validFileAttr.isValidExtension && (
                                <p className="mt-1 text-xs text-red-600">
                                  File không đúng định dạng.
                                </p>
                              )}
                              {!validFileAttr.isValidNumberOfFiles && (
                                <p className="mt-1 text-xs text-red-600">
                                  Số lượng file tối đa cho phép là{" "}
                                  {Constant.MAX_FILES_UPLOAD}.
                                </p>
                              )}
                            </>
                          )}

                          {documentSelectedFiles.length === 0 && (
                            <p className="mt-1 text-xs text-gray-500">
                              Không có tệp nào được chọn
                            </p>
                          )}
                        </div>
                      )}

                      <div className="space-y-3">
                        {documentSelectedFiles.map((f, i) =>
                          renderFileRow(
                            f,
                            i,
                            draftData.attachmentType.document,
                            documentSelectedFiles
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <SelectTemplateDialog
                  setData={setAttachment}
                  isOpen={showTemplateDialog}
                  onOpenChange={setShowTemplateDialog}
                  onClose={() => setShowTemplateDialog(false)}
                />
                <ConfirmDialog
                  open={isConfirmDialogOpen}
                  onOpenChange={setIsConfirmDialogOpen}
                  title={confirmDialogData.title}
                  description={confirmDialogData.description}
                  onConfirm={confirmDialogData.onConfirm}
                  confirmText="Đồng ý"
                  cancelText="Hủy"
                  confirmParams={confirmDialogData.params}
                />
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
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
