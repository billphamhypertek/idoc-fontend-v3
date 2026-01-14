"use client";

import { useParams, usePathname, useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";
import type {
  ButtonStatus,
  DocAttachment,
  Draft,
} from "@/definitions/types/document.type";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import { Constant } from "@/definitions/constants/constant";
import DocumentInCommentsSection, {
  DocumentInCommentsSectionRef,
} from "@/components/document-in/DocumentInCommentsSection";
import ActionButtons from "@/components/document-in/ActionButtons";
import {
  useAddDocument,
  useCheckActionImportDocDocument,
  useCheckActionRetakeDocument,
  useDeleteDraft,
  useDetailEditDocument,
} from "@/hooks/data/document-in.data";
import { useListTagUnpageQuery } from "@/hooks/data/label.data";
import type { TagItem } from "@/components/document-out/types";
import { LabelService } from "@/services/label.service";
import type { CollapseState } from "@/definitions/types/document-out";
import DocumentInInfoCard from "@/components/document-in/DocumentInInfocard";
import { useGetHstlContainDocId } from "@/hooks/data/document-record.data";
import { getUserInfo, isClericalRole } from "@/utils/token.utils";
import { SharedService } from "@/services/shared.service";
import { useGetNextConsultNodes } from "@/hooks/data/bpmn2.data";
import useAuthStore from "@/stores/auth.store";
import { useGetNextNodes, useGetStartNodes } from "@/hooks/data/bpmn.data";
import { uploadFileService } from "@/services/file.service";
import DocumentInAttachmentsCard from "@/components/document-in/DocumentInAttachmentsCard";
import { UserService } from "@/services/user.service";
import { ToastUtils } from "@/utils/toast.utils";
import DocumentInTracking from "@/components/document-in/DocumentInTracking";
import {
  handleError,
  isExistFile,
  isVerifierPDF,
  isVerifierPDFOrDocx,
  validFileSSize,
} from "@/utils/common.utils";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import { queryKeys } from "@/definitions";
import { useQueryClient } from "@tanstack/react-query";
import { useDeleteAttachmentMutation } from "@/hooks/data/attachment.data";
import { viewFileCheck } from "@/utils/file.utils";
import {
  DecryptionProgress,
  DecryptionService,
} from "@/services/decryption.service";
import {
  useSignCA,
  useSignComment,
  useSignCopy,
  useSignIssued,
} from "@/hooks/data/sign.data";
import { useEncryptStore } from "@/stores/encrypt.store";
import { TabNames } from "@/definitions/enums/document.enum";
import { DocumentInReplyTask } from "./DocumentInReplyTask";
import { decryptResult$ } from "@/services/event-emitter.service";
import { usePdfStore } from "@/stores/pdf.store";
import DecryptOverlay from "@/components/overlay/DecryptOverlay";
import DownloadingOverlay from "@/components/overlay/DownloadingOverlay";
import LoadingOverlay from "@/components/overlay/LoadingOverlay";

const baseStatus: ButtonStatus = {
  hideAll: false,
  rejectButton: false,
  doneButton: false,
  transferButton: false,
  consultButton: false,
  toKnowButton: false,
  issuedButton: false,
  retakeButton: false,
  editButton: false,
  bookButton: false,
  retakeByStepButton: false,
  createTaskButton: false,
  canRETAKE: false,
};
const CREATE_TASK_AT_DOC_DETAIL_H05 = Constant.CREATE_TASK_AT_DOC_DETAIL_H05;

// ==== THÊM: hằng type dùng thống nhất cho doc-in ====
const TAG_TYPE = "VAN_BAN_DI" as const;

const vanbandiduthao = "VAN_BAN_DI_DU_THAO";
const DocumentInDetail: React.FC = () => {
  const pathname = usePathname();
  const qc = useQueryClient();
  const router = useRouter();
  const { user } = useAuthStore();
  const params =
    useParams<{
      id?: string;
      isDelegate?: string;
      isTrackDocumentList?: string;
      previousUrl?: string;
      allowComment?: string;
    }>() ?? {};
  const documentId = params.id ?? "";
  const isDelegate = params.isDelegate === "true";
  const isTrackDocumentList = params.isTrackDocumentList === "true";
  const previousUrl = params.previousUrl ?? "";
  const { setPdf, clearPdf } = usePdfStore();

  const [draftData, setDraftData] = useState<Draft>({} as Draft);
  const [currentMenuTab, setCurrentMenuTab] = useState<{
    currentMenu: number;
    currentTab: string;
  }>(() => SharedService.loadCurrentMenuTab());
  const [selectedFile, setSelectedFile] = useState<DocAttachment | undefined>(
    undefined
  );

  // Ưu tiên hiển thị file dự thảo khi vào chi tiết, ưu tiên PDF trước
  const preferredDraftFiles = useMemo(() => {
    const drafts = (draftData?.draftFiles || []).map((att: any) => ({
      ...att,
      id: att.id,
      name: att.name,
      displayName: att.displayName,
      encrypt: att.encrypt,
      fileType: Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_IN,
    }));
    const isPdf = (f: any) => isVerifierPDF(f);
    const pdfs = drafts.filter(isPdf);
    const others = drafts.filter((f) => !isPdf(f));
    return [...pdfs, ...others];
  }, [draftData.draftFiles]);
  useEffect(() => {
    // chỉ set lần đầu (khi chưa có selectedFile)
    if (!selectedFile && preferredDraftFiles.length > 0) {
      setSelectedFile(preferredDraftFiles[0] as DocAttachment);
    }
  }, [preferredDraftFiles, selectedFile]);

  const [validFileAttr, setValidFileAttr] = useState({
    hasError: true,
    isValidFileSize: true,
    isValidExtension: true,
    isValidNumberOfFiles: true,
    isHasFile: false,
  });
  const [addAttachment, setAddAttachment] = useState({
    type: "",
    documentId: "",
    files: [] as File[],
  });
  const [deleteAttachment, setDeleteAttachment] = useState<{
    id: number;
    displayName: string | undefined;
  }>({
    id: 0,
    displayName: "",
  });

  const [showCommentForm, setShowCommentForm] = useState(true);
  const [collapseState, setCollapseState] = useState<CollapseState>({
    docInfo: true,
    docProcess: true,
    listTask: true,
    attachments: true,
  });

  const [buttonStatus, setButtonStatus] = useState<ButtonStatus>(baseStatus);
  const [newComment, setNewComment] = useState({
    comment: "",
    attachments: [] as File[],
    isToken: false,
    endDate: null as Date | null,
  });
  const [isCanHandleDoc, setIsCanHandleDoc] = useState(true);
  const [isShowLoadingDecrypt, setIsShowLoadingDecrypt] = useState(false);
  const [encrypProccessLoading, setEncrypProccessLoading] = useState(false);
  const [decryptionProgress, setDecryptionProgress] =
    useState<DecryptionProgress>({});

  const [selectedItems, setSelectedItems] = useState<TagItem[]>([]);
  const [dropdownList, setDropdownList] = useState<TagItem[]>([]);
  const [hstlList, setHstlList] = useState<any[]>([]);

  const [allowedComment, setAllowedComment] = useState(
    // params.allowComment === "true" //doc in always can comment => always true
    true
  );
  const [isdownloadFile, setIsdownloadFile] = useState(false);
  const [nameFileDownload, setNameFileDownload] = useState("");

  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [showRetakeByStepModal, setShowRetakeByStepModal] = useState(false);
  const [showAddAttachmentModal, setShowAddAttachmentModal] = useState(false);
  const [showDeleteAttachmentModal, setShowDeleteAttachmentModal] =
    useState(false);
  const [showRetakeDoneModal, setShowRetakeDoneModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showProcessDoneModal, setShowProcessDoneModal] = useState({
    open: false,
    isFinishReceive: false,
  });
  const [showSharedUserModal, setShowSharedUserModal] = useState(false);

  const { isEncrypt: encryptShowing } = useEncryptStore();
  const isClericalRoles = isClericalRole();
  const commentSectionRef = useRef<DocumentInCommentsSectionRef | null>(null);
  const addDocument = useAddDocument();

  // ==== THÊM: lưu thao tác nhãn gần nhất (localStorage) ====
  const LAST_ACTION_KEY = `docin:lastTagAction:${documentId}`;
  const [lastTagAction, setLastTagAction] = useState<{
    action: "assign" | "remove";
    tagId: string;
    at: number;
  } | null>(null);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LAST_ACTION_KEY);
      if (raw) setLastTagAction(JSON.parse(raw));
    } catch {}
  }, [LAST_ACTION_KEY]);
  const saveLastTagAction = (a: {
    action: "assign" | "remove";
    tagId: string;
    at: number;
  }) => {
    setLastTagAction(a);
    try {
      localStorage.setItem(LAST_ACTION_KEY, JSON.stringify(a));
    } catch {}
  };

  const doCreateTask = () => {
    router.push(`/task/userAssign?draftId=${documentId}`);
  };
  const { data: draft } = useDetailEditDocument(documentId);
  const { data: tags } = useListTagUnpageQuery();
  const deleteMutation = useDeleteDraft();
  const deleteAttachmentMutation = useDeleteAttachmentMutation();

  // ==== SỬA: đồng bộ dropdown và selected nhãn ====
  useEffect(() => {
    if (tags) setDropdownList(tags as any);
  }, [tags]);

  // Load các nhãn đã gắn ngay khi có documentId
  useEffect(() => {
    if (!documentId) return;
    (async () => {
      try {
        const attached = await LabelService.listObjectTag(
          documentId!,
          TAG_TYPE
        );
        setSelectedItems(attached as any);
      } catch (e) {
        // ignore
      }
    })();
  }, [documentId]);
  const goBack = () => {
    if (pathname == null) {
      return;
    }
    const path = pathname.split("/");
    if (path.includes("retake")) {
      if (path.includes("in")) {
        router.push("/retake/in");
      } else if (path.includes("out")) {
        router.push("/retake/out");
      }
    } else if (previousUrl) {
      if (previousUrl.indexOf("?") > -1) {
        const [basePath, queryStr] = previousUrl.split("?");
        const params = new URLSearchParams(queryStr);
        const page = params.get("page");
        const size = params.get("size");
        const currentTab = params.get("currentTab");

        const newQuery = new URLSearchParams({
          ...(page && { page }),
          ...(size && { size }),
          ...(currentTab && { currentTab }),
        }).toString();

        router.push(`${basePath}?${newQuery}`);
      } else {
        router.push(previousUrl);
      }
    } else router.back();
    router.back();
  };
  const onItemSelect = async (item: TagItem) => {
    // lưu thao tác
    saveLastTagAction({
      action: "assign",
      tagId: String(item.id),
      at: Date.now(),
    });

    // gọi API đúng type cho doc-in
    const tag = { objId: documentId, tagId: item.id, type: TAG_TYPE };
    try {
      const success = await LabelService.assignTag(tag);
      if (success) {
        ToastUtils.success("Gán nhãn thành công.");
        const updated = await LabelService.listObjectTag(documentId!, TAG_TYPE);
        setSelectedItems(updated as any);
      }
    } catch (err: any) {
      // xử lý lỗi 404 như log hệ thống trước đó
      if (err?.response?.status === 404) {
        ToastUtils.error("Không tìm thấy nhãn");
      } else {
        ToastUtils.error("Gán nhãn thất bại");
      }
    }
  };

  const onItemDeSelect = async (item: TagItem) => {
    // lưu thao tác
    saveLastTagAction({
      action: "remove",
      tagId: String(item.id),
      at: Date.now(),
    });

    try {
      const success = await LabelService.removeObject(
        item.id,
        documentId!,
        TAG_TYPE // SỬA: đúng type doc-in
      );
      if (success) {
        ToastUtils.success("Hủy gán nhãn thành công.");
        const updated = await LabelService.listObjectTag(documentId!, TAG_TYPE);
        setSelectedItems(updated as any);
      }
    } catch (err) {
      ToastUtils.error("Hủy gán nhãn thất bại");
    }
  };

  const handleMultiSelectChange = (items: TagItem[]) => {
    if (items.length > selectedItems.length) {
      const newItem = items.find(
        (item) => !selectedItems.some((s) => s.id === item.id)
      );
      if (newItem) onItemSelect(newItem);
    } else {
      const removedItem = selectedItems.find(
        (item) => !items.some((i) => i.id === item.id)
      );
      if (removedItem) onItemDeSelect(removedItem);
    }
  };
  const docInfoUpdateStatus = () => {
    setCollapseState((prev) => ({ ...prev, docInfo: !prev.docInfo }));
  };

  const docProcessUpdateStatus = () => {
    setCollapseState((prev) => ({ ...prev, docProcess: !prev.docProcess }));
  };

  const listTaskUpdateStatus = () => {
    setCollapseState((prev) => ({ ...prev, listTask: !prev.listTask }));
  };

  const attachmentsUpdateStatus = () => {
    setCollapseState((prev) => ({ ...prev, attachments: !prev.attachments }));
  };
  const checkShowAttachmentVersion =
    draftData.docStatusName !== Constant.DOCUMENT_STATUS.DONE_ISSUED;
  const downloadFile = async (file: DocAttachment): Promise<void> => {
    setNameFileDownload(file.name);
    setIsdownloadFile(true);

    try {
      if (file.encrypt) {
        const userInfo = JSON.parse(getUserInfo()!);
        const positionName = userInfo.positionModel?.name?.toLowerCase() ?? "";

        if (positionName === "văn thư ban") {
          const res = await UserService.findByUserId(file.createBy); // đổi Observable -> Promise
          if (res.cert) {
            await uploadFileService.downloadFile(
              file.name,
              Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_IN,
              file.encrypt,
              null,
              res.cert
            );
            console.log("Tải thành công!");
            setIsCanHandleDoc(true);
          }
        } else {
          await uploadFileService.downloadFile(
            file.name,
            Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_IN,
            file.encrypt,
            null
          );
          console.log("Tải thành công!");
          setIsCanHandleDoc(true);
        }
      } else {
        await uploadFileService.downloadFile(
          file.name,
          Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_IN,
          file.encrypt
        );
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsdownloadFile(false);
    }
  };
  const doSelectFiles = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
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
      !uploadFileService.validateNumberOfFileUpload(
        draftData.attachments as any[],
        files,
        false
      )
    ) {
      setValidFileAttr((prev) => ({
        ...prev,
        isValidNumberOfFiles: false,
        hasError: true,
      }));
      event.target.value = "";
      return;
    }

    const newFiles = Array.from(files).filter(
      (file) => !isExistFile(file.name, (draftData.attachments as any[]) || [])
    );
    setDraftData((prev: any) => ({
      ...prev,
      attachments: [...((prev.attachments as any[]) || []), ...newFiles],
    }));

    setValidFileAttr({
      hasError: false,
      isValidFileSize: true,
      isValidExtension: true,
      isValidNumberOfFiles: true,
      isHasFile: true,
    });
    const selectedFiles = Array.from(event.target.files || []);
    doAssginFileValuetoIns(event, selectedFiles, type);
    event.target.value = "";
  };
  const doAssginFileValuetoIns = (
    event: React.ChangeEvent<HTMLInputElement>,
    selectedFiles: File[],
    type: string
  ) => {
    if (
      type == Constant.DOCUMENT_IN_FILE_TYPE.DRAFT ||
      type == Constant.DOCUMENT_IN_FILE_TYPE.DOCUMENT
    ) {
      doAddAttachment(event, type, documentId, selectedFiles);
    }
  };
  const doAddAttachment = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: string,
    documentId: string,
    selectedFiles: any
  ) => {
    setAddAttachment({
      type: type,
      documentId: documentId,
      files: selectedFiles,
    });
    setShowAddAttachmentModal(true);
  };
  const doDeleteFile = (file: DocAttachment) => {
    setDeleteAttachment({ id: file.id, displayName: file.displayName });
    setShowDeleteAttachmentModal(true);
  };
  const confirmAddAttachment = () => {
    const params = new FormData();
    for (const file of addAttachment.files) params.append("files", file);
    addDocument.mutate(
      {
        action: addAttachment.type as "DRAFT" | "DOCUMENT",
        draftId: addAttachment.documentId,
        params: params,
      },
      {
        onSuccess: async () => {
          await qc.invalidateQueries({
            queryKey: [queryKeys.document_in.detail, documentId],
          });
        },
      }
    );
  };
  const confirmDeleteDocument = () => {
    deleteMutation.mutate(documentId, {
      onSuccess: () => {
        ToastUtils.success("Xóa văn bản thành công.");
        router.push("/document-in/draft-issued");
      },
      onError: (err) => {
        handleError(err);
      },
    });
  };
  const confirmDeleteFile = () => {
    deleteAttachmentMutation.mutate(deleteAttachment.id!, {
      onSuccess: async () => {
        ToastUtils.success("Xóa tệp thành công.");
        await qc.invalidateQueries({
          queryKey: [queryKeys.document_in.detail, documentId],
        });
      },
      onError: (err) => {
        handleError(err);
      },
    });
  };

  const { data: hstl } = useGetHstlContainDocId(
    documentId as any,
    "VAN_BAN_DI"
  );
  const onSignFileEncrypt = async (
    fileName: string,
    encrypt: boolean,
    fileId: string
  ) => {
    setEncrypProccessLoading(true);
    try {
      uploadFileService
        .uploadFileEncryptToSign(
          fileName,
          Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_IN,
          true,
          draftData.id,
          null,
          fileId,
          vanbandiduthao
        )
        .then(() =>
          qc.invalidateQueries({
            queryKey: [queryKeys.document_in.detail, documentId],
          })
        );
      setIsCanHandleDoc(true);
      setEncrypProccessLoading(false);
    } catch (error) {
      handleError(error);
    }
  };
  const signFileIssuedEncrypt = async (
    fileName: string,
    encrypt: boolean,
    fileId: string
  ) => {
    setEncrypProccessLoading(true);
    if (encryptShowing) {
      DecryptionService.updateProgress({
        totalFiles: 0,
        currentFile: 0,
        currentProgress: 0,
        fileName: "",
        namedraftFiles: "",
        expectedChunks: 0,
        receivedChunks: 0,
        fileSize: 0,
        error: false,
        isDownLoad: true,
      });
    }
    try {
      await uploadFileService.uploadFileEncryptToSignIssued(
        fileName,
        Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_IN,
        true,
        draftData.id,
        null,
        fileId,
        vanbandiduthao,
        draftData
      );
      setEncrypProccessLoading(false);
      setIsCanHandleDoc(true);
    } catch (error) {
      await handleError(error);
    }
  };
  const viewFile = (
    file: any,
    isClick: boolean = true,
    isOpentab: boolean = true
  ) => {
    if (!isOpentab && !encryptShowing) {
      if (isVerifierPDFOrDocx(file)) {
        setSelectedFile(file);
      } else {
        ToastUtils.khongTheXemFile();
      }
      return;
    } else if (encryptShowing) {
      // bật loading
      setIsShowLoadingDecrypt(true);
      clearPdf();
      DecryptionService.updateProgress({
        totalFiles: 0,
        currentFile: 0,
        currentProgress: 0,
        fileName: "",
        namedraftFiles: "",
        expectedChunks: 0,
        receivedChunks: 0,
        fileSize: 0,
        error: false,
        isDownLoad: true,
      });

      // gọi backend hoặc service để chuẩn bị decrypt
      viewFileCheck(
        file,
        Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_IN,
        documentId,
        (file) => {
          setIsCanHandleDoc(true);
          if (file.encrypt) setIsShowLoadingDecrypt(false);
        },
        (file) => {
          setIsCanHandleDoc(false);
          if (file.encrypt) setIsShowLoadingDecrypt(false);
        }
      );
    } else if (isClick) {
      try {
        uploadFileService.viewFile(
          file,
          Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_IN
        );
      } catch (e) {
        console.log(e);
      }
    }

    // lắng nghe kết quả decrypt (nếu encrypt)
    if (encryptShowing) {
      decryptResult$.subscribe((decryptedBlob: Blob) => {
        setPdf(decryptedBlob);
        setSelectedFile(file);
        setIsShowLoadingDecrypt(false);
      });
    }
  };

  const { mutate: signCA } = useSignCA();
  const { mutate: signComment } = useSignComment();
  const { mutate: signCopy } = useSignCopy();
  const { mutate: signIssued } = useSignIssued();
  const getDocNumber = (): string => {
    const numberOrSign = draftData.numberOrSign ? draftData.numberOrSign : "";
    const numberInBook = draftData.numberInBook
      ? `${draftData.numberInBook}`
      : "";

    if (numberOrSign.startsWith(numberInBook)) {
      return numberOrSign;
    }
    return numberInBook + numberOrSign;
  };

  const currentItemParam = useMemo(
    () => ({
      docId: documentId,
      isDelegate: false,
    }),
    []
  );

  // ==== THÊM: Hàm refresh toàn bộ data sau khi hoàn thành action ====
  const refreshDocumentInDetail = async () => {
    await Promise.all([
      qc.refetchQueries({
        queryKey: [queryKeys.document_in.detail, documentId],
      }),
      qc.refetchQueries({
        queryKey: [queryKeys.document_in.check_action_retake, currentItemParam],
      }),
      qc.refetchQueries({
        queryKey: [
          queryKeys.document_in.check_action_import_doc,
          { ...currentItemParam, tab: "CHO_XU_LY" },
        ],
      }),
      qc.refetchQueries({
        queryKey: [queryKeys.document_in.list_root],
      }),
    ]);
    // Sau khi refetch xong, tính lại trạng thái nút
    recomputeButtonStatus();
  };
  const onCancelDownload = () => {
    setIsdownloadFile(false);
    doForceDisconnect();
  };
  const doForceDisconnect = () => {
    DecryptionService.disconnect();
    setEncrypProccessLoading(false);
    setIsShowLoadingDecrypt(false);
    setIsdownloadFile(false);
  };

  const { data: consultNodeData } = useGetNextConsultNodes(user);
  const { data: startNodes } = useGetStartNodes(
    Constant.THREAD_TYPE.OUTCOMING,
    false,
    draftData.nodeId === null
  );
  const { data: nextNode } = useGetNextNodes(draftData.nodeId);
  const listNode = (draftData.nodeId === null ? startNodes : nextNode) ?? [];
  const { data: checkActionRetakeData } = useCheckActionRetakeDocument(
    currentItemParam,
    !!documentId
  );
  const { data: checkActionImportDocData } = useCheckActionImportDocDocument(
    { ...currentItemParam, tab: "CHO_XU_LY" },
    !!documentId
  );
  const retakeByStepButton = useMemo(() => {
    if (!checkActionRetakeData) return false;
    return checkActionRetakeData.canRetake;
  }, [checkActionRetakeData]);
  const bookButton = useMemo(() => {
    if (!checkActionImportDocData) return false;
    let v =
      checkActionImportDocData.importDocBook &&
      draftData.numberInBook == null &&
      Constant.IMPORT_DOC_BOOK_BCY;

    if (
      currentMenuTab.currentMenu === Constant.DOCUMENT_IN_MENU.HANDLE &&
      currentMenuTab.currentTab !== TabNames.CHOXULY
    ) {
      v = false;
    }
    return v;
  }, [
    checkActionImportDocData,
    draftData.numberInBook,
    currentMenuTab.currentMenu,
    currentMenuTab.currentTab,
  ]);
  const draftStatusNotIssued = draftData.status !== "DA_BAN_HANH";
  function computeButtonStatus(
    currentMenu: number,
    currentTab: string,
    opts: {
      isTrackDocumentList?: boolean;
      checkImportBookButton?: boolean;
      checkButtonRetakeByStep?: boolean;
    } = {}
  ): ButtonStatus {
    const {
      isTrackDocumentList,
      checkImportBookButton,
      checkButtonRetakeByStep,
    } = opts;
    const s: ButtonStatus = { ...baseStatus };

    // DRAFT
    if (currentMenu === Constant.DOCUMENT_IN_MENU.DRAFT) {
      if (currentTab === TabNames.DUTHAO) {
        s.transferButton = true;
        s.consultButton = true;
        s.editButton = true;
      } else if (
        currentTab === TabNames.DATRINHKY ||
        currentTab === TabNames.DABANHANH
      ) {
        s.retakeButton = true;
        s.hideAll = true;
      }
    }
    // HANDLE
    else if (currentMenu === Constant.DOCUMENT_IN_MENU.HANDLE) {
      if (currentTab === TabNames.CHOXULY) {
        s.doneButton = true;
        s.transferButton = true;
        s.consultButton = true;
        s.rejectButton = true;
        s.editButton = true;
        if (checkImportBookButton) s.bookButton = checkImportBookButton;
        if (checkButtonRetakeByStep)
          s.retakeByStepButton = checkButtonRetakeByStep;
      } else if (currentTab === TabNames.CHOCHOYKIEN) {
        if (checkButtonRetakeByStep)
          s.retakeByStepButton = checkButtonRetakeByStep;
        s.editButton = true;
        s.hideAll = true;
      } else if (currentTab === TabNames.DAXULY) {
        if (checkButtonRetakeByStep)
          s.retakeByStepButton = checkButtonRetakeByStep;
        s.hideAll = true;
      }
    }
    // ISSUED
    else if (currentMenu === Constant.DOCUMENT_IN_MENU.ISSUED) {
      if (currentTab === TabNames.DABANHANH_DOC) {
        s.toKnowButton = true;
        s.retakeByStepButton = true;
      } else {
        s.issuedButton = true;
      }
    }
    // DOC_IN
    else if (currentMenu === Constant.DOCUMENT_IN_MENU.DOC_IN) {
      s.hideAll = true;
    }

    // Track list override
    if (isTrackDocumentList) {
      s.hideAll = true;
      s.retakeButton = false;
    }
    if (user && CREATE_TASK_AT_DOC_DETAIL_H05) {
      const createTaskButton = user?.authoritys.find(
        (x) =>
          (x.authority == "LEADERSHIP" || x.authority == "LEADERSHIP_UNIT") &&
          x.active
      );
      s.createTaskButton = !!createTaskButton;
    }
    return s;
  }

  // Hàm tiện ích: tính lại trạng thái nút dựa trên trạng thái hiện tại
  const recomputeButtonStatus = () => {
    setButtonStatus(
      computeButtonStatus(
        currentMenuTab.currentMenu,
        currentMenuTab.currentTab,
        {
          isTrackDocumentList,
          checkImportBookButton: bookButton,
          checkButtonRetakeByStep: retakeByStepButton,
        }
      )
    );
  };

  useEffect(() => {
    if (!draft) return;
    setDraftData(draft);
    const listPdf = draft.draftFiles?.filter(
      (x) => x.name.toLowerCase().indexOf(".pdf") > 0
    );
    const firstFile = listPdf[0];
    if (firstFile && encryptShowing) {
      viewFile(firstFile);
    }
  }, [draft]);
  useEffect(() => {
    const isAllowed =
      draftData.docStatusName === Constant.DOCUMENT_STATUS.DONE_ISSUED ||
      draftData.docStatusName === Constant.DOCUMENT_STATUS.WAIT_ISSUED;

    if (isAllowed !== allowedComment) {
      // avoid unnecessary re-renders
      // setAllowedComment(isAllowed);
      setAllowedComment(true); //alway true
    }
  }, [draftData]);

  useEffect(() => {
    if (hstl) setHstlList(hstl as any);
  }, [hstl]);

  useEffect(() => {
    if (tags) setDropdownList(tags as any);
  }, [tags]);
  useEffect(() => {
    let newDoneStatus: boolean = false;
    if (currentMenuTab.currentMenu !== Constant.DOCUMENT_IN_MENU.HANDLE) {
      if (!draftData.nodeId) {
        if (
          !buttonStatus.doneButton &&
          currentMenuTab.currentMenu != 0 &&
          currentMenuTab.currentMenu != Constant.DOCUMENT_IN_MENU.ISSUED
        ) {
          const oldLength = listNode.length;
          const newlength = listNode.filter((e) => !e.lastNode).length;
          newDoneStatus = oldLength != newlength;
        }
      } else {
        if (
          currentMenuTab.currentMenu != 0 &&
          currentMenuTab.currentMenu != Constant.DOCUMENT_IN_MENU.ISSUED
        ) {
          const oldLength = listNode.length;
          const newlength = listNode.filter((e) => !e.lastNode).length;
          newDoneStatus = oldLength != newlength;
        }
      }
      if (buttonStatus.doneButton === newDoneStatus) return;
      setButtonStatus((prev) => ({
        ...prev,
        doneButton: newDoneStatus,
      }));
    }
  }, [listNode, currentMenuTab.currentMenu]);

  useEffect(() => {
    if (encryptShowing) {
      setIsCanHandleDoc(!encryptShowing);
    }
  }, [encryptShowing]);
  useEffect(() => {
    const unsubs = [
      // UploadEncryptionService.subscribe(setUploadEncryptionProgress),
      DecryptionService.subscribe(setDecryptionProgress),
      // EncryptionService.subscribe(setEncryptionProgress),
    ];

    return () =>
      unsubs.forEach((u) => {
        if (typeof u === "function") u();
      });
  }, []);

  useEffect(() => {
    setButtonStatus(
      computeButtonStatus(
        currentMenuTab.currentMenu,
        currentMenuTab.currentTab,
        {
          isTrackDocumentList,
          checkImportBookButton: bookButton,
          checkButtonRetakeByStep: retakeByStepButton,
        }
      )
    );
  }, [
    bookButton,
    currentMenuTab.currentMenu,
    currentMenuTab.currentTab,
    retakeByStepButton,
  ]);

  return (
    <div className="mx-auto px-4">
      <BreadcrumbNavigation
        items={[
          {
            href: "document-in/list",
            label: "Văn bản đi",
          },
        ]}
        currentPage="Chi tiết văn bản đi"
        showHome={false}
      />
      {/* Action Buttons */}
      <div className="flex justify-start">
        <ActionButtons
          buttonStatus={buttonStatus}
          selectedDocId={parseInt(documentId)}
          onBack={goBack}
          onShowTracking={() => setShowTrackingModal(true)}
          onCreateTask={doCreateTask}
          draft={draftData}
          isCanHandleDoc={isCanHandleDoc}
          encryptShowing={encryptShowing}
          listNextNode={listNode}
          onDeleteDocument={() => setShowDeleteModal(true)}
          isFastTransfer={false}
          textFastTransfer={""}
          consultNodeData={consultNodeData}
          isDelegate={isDelegate}
          onSuccess={refreshDocumentInDetail}
        />
      </div>

      <div className="flex gap-4">
        <div className="w-full flex gap-6 flex-col">
          <DocumentInInfoCard
            draft={draftData}
            collapse={collapseState.docInfo}
            onToggle={docInfoUpdateStatus}
            dropdownList={dropdownList}
            selectedItems={selectedItems}
            onChangeTags={handleMultiSelectChange}
          />
          <DocumentInReplyTask draft={draftData} />
          <DocumentInAttachmentsCard
            attachments={draftData.attachments}
            documentFile={draftData.documentFiles}
            draftFile={draftData.draftFiles}
            listAttachVersion={draftData.listAttachVersion}
            selectedFile={selectedFile}
            encryptShowing={encryptShowing}
            isDownloading={isdownloadFile}
            downloadName={nameFileDownload}
            onSelect={(file) => setSelectedFile(file)}
            onView={viewFile}
            onDownload={downloadFile}
            onShare={() => setShowSharedUserModal(true)}
            onVerifyPDF={(fileName) => uploadFileService.verifierPDF(fileName)}
            onSignEncrypt={onSignFileEncrypt}
            onSignIssuedEncrypt={signFileIssuedEncrypt}
            doSelectFiles={doSelectFiles}
            buttonStatus={buttonStatus}
            onDelete={doDeleteFile}
            checkShowAttachmentVersion={checkShowAttachmentVersion}
            docNumber={draftData.numberOrSign}
            draftStatusNotIssued={draftStatusNotIssued}
          />
        </div>

        {Constant.FIX_SHOW_COMMENT_H05 && showCommentForm && (
          <div className="bg-white border border-gray-200 p-4 space-y-6 min-h-screen min-w-[350px] w-[350px] rounded-lg">
            <DocumentInCommentsSection
              ref={commentSectionRef}
              id={Number(documentId!)}
              allowAttachments
              allowedComment={true}
              setNewComment={setNewComment}
              newComment={newComment}
            />
          </div>
        )}
      </div>
      <DocumentInTracking
        docId={documentId!}
        onClose={() => setShowTrackingModal(false)}
        showTrackingModal={showTrackingModal}
        setShowTrackingModal={setShowTrackingModal}
      />
      <ConfirmDeleteDialog
        isOpen={showAddAttachmentModal}
        onOpenChange={setShowAddAttachmentModal}
        onConfirm={confirmAddAttachment}
        title="Hãy xác nhận"
        description={`Bạn muốn thêm tệp ${addAttachment?.files[0]?.name}?`}
        confirmText="Đồng ý"
        cancelText="Đóng"
      />
      <ConfirmDeleteDialog
        isOpen={showDeleteAttachmentModal}
        onOpenChange={setShowDeleteAttachmentModal}
        onConfirm={confirmDeleteFile}
        title="Hãy xác nhận"
        description={`Bạn muốn xoá tệp ${deleteAttachment?.displayName}?`}
        confirmText="Đồng ý"
        cancelText="Đóng"
      />
      <ConfirmDeleteDialog
        isOpen={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={confirmDeleteDocument}
        title="Hãy xác nhận"
        description={`Bạn có chắc chắn muốn xóa văn bản?`}
        confirmText="Đồng ý"
        cancelText="Đóng"
      />
      <DecryptOverlay
        isOpen={isShowLoadingDecrypt}
        progress={decryptionProgress}
        onForceDisconnect={doForceDisconnect}
      />
      <DownloadingOverlay
        isOpen={isdownloadFile}
        fileName={nameFileDownload}
        onCancel={onCancelDownload}
      />
      {!decryptionProgress.error &&
        (decryptionProgress.fileName ? (
          <LoadingOverlay
            isOpen={encrypProccessLoading}
            isLoading={decryptionProgress.isDownLoad}
            text={"Đang tải tệp..."}
          />
        ) : (
          <DecryptOverlay
            isOpen={encrypProccessLoading}
            progress={decryptionProgress}
            onForceDisconnect={doForceDisconnect}
          />
        ))}
    </div>
  );
};

export default DocumentInDetail;
