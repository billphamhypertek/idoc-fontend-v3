"use client";

import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import DigitalSign from "@/components/common/DigitalSign";
import SelectCustom from "@/components/common/SelectCustom";
import TooltipWrapper from "@/components/common/TooltipWrapper";
import DocumentOutCommentsSection from "@/components/document-out/CommentsSection";
import DecryptOverlay from "@/components/overlay/DecryptOverlay";
import DownloadingOverlay from "@/components/overlay/DownloadingOverlay";
import EncryptOverlay from "@/components/overlay/EncryptOverlay";
import EncryptProcessOverlay from "@/components/overlay/EncryptProcessOverlay";
import LoadingOverlay from "@/components/overlay/LoadingOverlay";
import UploadEncryptOverlay from "@/components/overlay/UploadEncryptOverlay";
import { Button } from "@/components/ui/button";
import { CustomDatePicker } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { queryKeys } from "@/definitions";
import { Constant } from "@/definitions/constants/constant";
import { PdfSignType } from "@/definitions/enums/common.enum";
import { OBJ_TYPE } from "@/definitions/enums/document.enum";
import type { NextNode } from "@/definitions/types/document-out";
import { useSaveNewAttachmentMutation } from "@/hooks/data/attachment.data";
import { useGetNextNodes, useGetStartNodes } from "@/hooks/data/bpmn.data";
import { useGetCategoriesByCode } from "@/hooks/data/category.data";
import {
  useDeleteDocument,
  useFinishDocument,
  useRejectDocument,
  useSaveDocumentOut,
  useSaveNewDocumentOut,
  useUpdateReceiveDoc,
} from "@/hooks/data/document-out.actions";
import {
  useGetDocumentOutArrival,
  useGetDocumentOutById,
  useGetDocumentOutComments,
  useGetDocumentOutDetailLegacy,
  useGetListOrgEnter,
  useGetListUserEnter,
} from "@/hooks/data/document-out.data";
import { useGetFields } from "@/hooks/data/field.data";
import {
  useAddValues,
  useGetValues,
  useUpdateValues,
} from "@/hooks/data/value.data";
import { cn } from "@/lib/utils";
import {
  DecryptionProgress,
  DecryptionService,
} from "@/services/decryption.service";
import {
  EncryptionProgress,
  EncryptionService,
} from "@/services/encryption.service";
import {
  currentMessage$,
  decryptResult$,
} from "@/services/event-emitter.service";
import { uploadFileService } from "@/services/file.service";
import {
  connectScanService,
  getIsConnect,
  getWebSocket,
  scanMessage,
} from "@/services/scandocument.service";
import {
  UploadEncryptionProgress,
  UploadEncryptionService,
} from "@/services/upload-encryption.service";
import { useEncryptStore } from "@/stores/encrypt.store";
import { canViewNoStatus, getExtension } from "@/utils/common.utils";
import { convertDocumentToDocumentDTO } from "@/utils/map-data";
import { ToastUtils } from "@/utils/toast.utils";
import { useQueryClient } from "@tanstack/react-query";
import { isAfter, isBefore } from "date-fns";
import {
  Check,
  CheckIcon,
  ChevronDown,
  Copy,
  Download,
  Eye,
  File,
  KeyRound,
  Pencil,
  Printer,
  Save,
  Trash2,
  Undo2,
} from "lucide-react";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import LoadingFull from "../common/LoadingFull";
import { TransferDocumentOut } from "./TransferDocumentOut";
import PdfViewerDialog from "@/components/document-out/PdfViewerDialog";

// Interfaces
interface Category {
  id: number;
  name: string;
  securityIds?: number[];
  value?: number;
  currentNumber?: number;
  year?: number;
  numberOrSign?: string;
}

interface Document {
  id?: number;
  bookName?: string;
  bookId: number | null;
  numberArrival: number | null;
  numberArrivalStr: string;
  receivedDate: Date | null;
  dateArrival: Date | null;
  dateIssued: Date | null;
  placeSendId: number | null;
  placeSendOthers: string;
  docTypeId: number | null;
  urgentId: number | null;
  methodReceiptId: number | null;
  securityId: number | null;
  preview: string;
  confidential?: boolean;
  attachments: FileAttachment[];
  node?: any;
  status?: string;
  isComplete?: boolean;
  isDisableVBDT?: boolean;
  securityName?: string;
  dayLeft?: number;
  deadline?: Date | null;
  orgReceiveDocument?: string;
  docFieldsId?: number | null;
  personSign?: string;
  personSignId?: number | null;
  numberOrSign?: string;
  numberSupport?: string;
  placeReceive?: string;
  documentDetail?: string;
  rqRely?: boolean;
  feedback?: boolean;
  legalDoc?: boolean;
  sendEnvelope?: boolean;
}

interface FileAttachment {
  id?: number;
  name: string;
  type?: string;
  encrypt?: boolean;
  oEncrypt?: boolean;
  displayName?: string;
  atmType?: string;
  documentId?: number;
  autoEntry?: boolean;
}

interface DocumentDetail {
  document?: any;
}

const bpmnService = {
  currentSelectedNodeID: null as any,
  currentNodeOrg: [] as any[],
  currentNodeUser: [] as any[],
};
const validationService = {
  getMaxDay: (): Date => new Date(),
  getMinDay: (date: Date | null): Date => new Date(),
};

// Local storage mocks
const isClericalRole = (): boolean => true;

// Helper functions
const getTodayNgbDate = (): Date => new Date();

const getRemainedDays = (deadline: Date | null): number => {
  if (!deadline) return 0;
  const today = new Date();
  return Math.ceil(
    (deadline.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );
};

const isBookWarning = (year: number): boolean => {
  const currentYear = new Date().getFullYear();
  return year < currentYear;
};

const validFileSSize = (files: FileList): boolean => {
  for (let i = 0; i < files.length; i++) {
    if (files[i].size > 300 * 1024 * 1024) return false; // 300MB limit
  }
  return true;
};

const isExistFile = (name: string, files: FileAttachment[]): boolean =>
  files.some((f) => f.name === name);

// Helper function to apply encryption logic
const applyEncryptionLogic = (
  files: FileAttachment[],
  encryptShowing: boolean
): FileAttachment[] => {
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
type Props = {
  hasComment?: boolean;
};
type InsertFormValues = {
  bookId: number | null;
  numberArrival: number | null;
  dateArrival: Date | null;
  placeSendId?: number | null;
  placeSendOthers?: string;
  docTypeId: number | null;
  urgentId: number | null;
  methodReceiptId: number | null;
  securityId: number | null;
  preview: string;
};

const DocumentOutInsert: React.FC<Props> = ({ hasComment = true }) => {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { isEncrypt: encryptShowing } = useEncryptStore();
  const path = usePathname();
  const isCheckStatusSecurityDocument = path?.includes("update") || false;
  const [loading, setLoading] = useState(false);
  // Remove dedicated delete dialog state; reuse generic confirm dialog

  const createDefaultDocument = (): Document => ({
    bookId: null,
    numberArrival: null,
    numberArrivalStr: "",
    receivedDate: getTodayNgbDate(),
    dateArrival: getTodayNgbDate(),
    dateIssued: getTodayNgbDate(),
    placeSendId: null,
    placeSendOthers: "",
    docTypeId: null,
    urgentId: null,
    methodReceiptId: null,
    securityId: null,
    preview: "",
    attachments: [],
    deadline: null,
    orgReceiveDocument: "",
  });

  const createDefaultFormValues = (): InsertFormValues => ({
    bookId: null,
    numberArrival: null,
    dateArrival: getTodayNgbDate(),
    placeSendId: null,
    placeSendOthers: "",
    docTypeId: null,
    urgentId: null,
    methodReceiptId: null,
    securityId: null,
    preview: "",
  });

  const [document, setDocument] = useState<Document>(createDefaultDocument());

  const [documentSecurity] = useState<Document>({
    bookId: null,
    numberArrival: null,
    numberArrivalStr: "*****",
    receivedDate: new Date(0),
    dateArrival: new Date(0),
    dateIssued: new Date(0),
    placeSendId: null,
    placeSendOthers: "*****",
    docTypeId: null,
    urgentId: null,
    methodReceiptId: null,
    securityId: null,
    preview: "*****",
    attachments: [],
  });
  const [isShowPreviewPdf, setIsShowPreviewPdf] = useState(false);
  const [filePreview, setFilePreview] = useState<{
    file: FileAttachment | undefined;
    blob: Blob | undefined;
  }>({
    file: undefined,
    blob: undefined,
  });

  const [selectedFiles, setSelectedFiles] = useState<FileAttachment[]>([]);
  const [urgentCategory, setUrgentCategory] = useState<Category[]>([]);
  const [docTypeCategory, setDocTypeCategory] = useState<Category[]>([]);
  const [docFieldCategory, setDocFieldCategory] = useState<Category[]>([]);
  const [methodReceiptCategory, setMethodReceiptCategory] = useState<
    Category[]
  >([]);
  const [placeSendData, setPlaceSendData] = useState<Category[]>([]);
  const [placeSendPopoverOpen, setPlaceSendPopoverOpen] = useState(false);
  const [securityCategoryFilter, setSecurityCategoryFilter] = useState<
    Category[]
  >([]);
  const [isUpdate, setIsUpdate] = useState(false);
  const [isCopyDocument, setIsCopyDocument] = useState(false);
  const [isWaitReceiveDocument, setIsWaitReceiveDocument] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [inValidation, setInValidation] = useState(true);
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [isCheckEncrypt, setIsCheckEncrypt] = useState(false);
  const [isCanHandleDoc, setIsCanHandleDoc] = useState(false);
  const [isShowLoadingEncrypt, setIsShowLoadingEncrypt] = useState(false);
  const [isShowLoadingDeEncrypt, setIsShowLoadingDeEncrypt] = useState(false);
  const [decryptionProgress, setDecryptionProgress] =
    useState<DecryptionProgress>({});
  const [encryptionProgress, setEncryptionProgress] =
    useState<EncryptionProgress>({
      expectedChunks: 0,
      currentProgress: 0,
      receivedChunks: 0,
    });
  const [uploadEncryptionProgress, setUploadEncryptionProgress] =
    useState<UploadEncryptionProgress>({});
  const [skipAutoNumberArrivalOnce, setSkipAutoNumberArrivalOnce] =
    useState(false);

  const [isdownloadFile, setIsdownloadFile] = useState(false);
  const [nameFileDownload, setNameFileDownload] = useState("");
  const [progress, setProgress] = useState(0);
  const [encryptProcessLoading, setEncryptProcessLoading] = useState(false);
  const [isCheckOpenDownLoadFileEncrypt, setIsCheckOpenDownLoadFileEncrypt] =
    useState(false);
  const [isShowChooseEncrypt, setIsShowChooseEncrypt] = useState(false);
  const [currentTab, setCurrentTab] = useState("");
  const [fromMenu, setFromMenu] = useState("");
  const [listNextNode, setListNextNode] = useState<any[]>([]);
  const [nodeStart, setNodeStart] = useState<NextNode | null>(null);
  const [isshowDoneButton, setIsshowDoneButton] = useState(false);
  const [listArrival, setListArrival] = useState<Category[]>([]);
  const [currentArrival, setCurrentArrival] = useState<Category | null>(null);
  const [personSigndata, setPersonSigndata] = useState<any[]>([]);
  const [validPlaceSend, setValidPlaceSend] = useState(true);
  const [documentComments, setDocumentComments] = useState<any[]>([]);
  const [displayCommentForm, setDisplayCommentForm] = useState(false);
  const [isClericalRoleState, setIsClericalRoleState] = useState(false);
  const [isBookDateWarning, setIsBookDateWarning] = useState(false);
  const queryClient = useQueryClient();
  const [newComment, setNewComment] = useState({
    comment: "",
    attachments: [] as File[],
    isToken: false,
    endDate: null as Date | null,
  });
  const [validFileAttr, setValidFileAttr] = useState({
    hasError: true,
    isValidFileSize: true,
    isValidExtension: true,
    isValidNumberOfFiles: true,
    isHasFile: false,
  });
  const [fileScanner, setFileScanner] = useState<any[]>([]);
  const [docName, setDocName] = useState("");
  const [docTypeScan, setDocTypeScan] = useState("");
  const [model, setModel] = useState({ objects: [] as any[] });
  const [valueslist, setValueslist] = useState<any[]>([]);
  const [documentDetail, setDocumentDetail] = useState<DocumentDetail>(
    {} as DocumentDetail
  );
  const [encryptArr, setEncryptArr] = useState<any[]>([]);
  const [nonEncryptArr, setNonEncryptArr] = useState<any[]>([]);
  const [isShowUploadProgress, setIsShowUploadProgress] = useState(false);
  const [isCreateDocSuccess, setIsCreateDocSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [isOpenScanModal, setIsOpenScanModal] = useState(false);
  const [filteredPlaceSendCategories, setFilteredPlaceSendCategories] =
    useState<string[]>([]);
  // React Hook Form for required validations
  const form = useForm<InsertFormValues>({
    mode: "onSubmit",
    defaultValues: createDefaultFormValues(),
  });
  const { setValue, trigger, formState, setError, clearErrors, reset } = form;
  const { errors } = formState;

  const formRef = useRef<HTMLFormElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: securityCategoryData } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.SECURITY
  );
  const [isManualBookChange, setIsManualBookChange] = useState(false);

  useEffect(() => {
    setIsSubmitted(false);
    setIsShowUploadProgress(false);
    setIsClericalRoleState(isClericalRole());

    const docId = params?.id ? Number(params.id) : 0;
    if (path?.includes("insert")) {
      setIsUpdate(false);
      initNewDocument(false);
      doGetTheadComming();
      if (docId > 0) setIsCopyDocument(true);
    } else if (path?.includes("update")) {
      setIsUpdate(true);
      if (docId) {
        doLoadValues(1, docId);
      }
      setIsCanHandleDoc(false);
      setFromMenu(searchParams?.get("fromMenu") || "");
      setCurrentTab(searchParams?.get("currentTab") || "");
    }
  }, [params, searchParams, document.docFieldsId, securityCategoryFilter]);

  const loadNgOnInit = async () => {
    await loadDataInit();
  };

  const loadDataInit = async () => {
    doLoadFields();
  };

  const initNewDocument = (flgLoadBook: boolean) => {
    setDocument((prev) => ({
      ...prev,
      dateArrival: getTodayNgbDate(),
      dateIssued: getTodayNgbDate(),
      receivedDate: getTodayNgbDate(),
      deadline: null,
    }));
    setValue("dateArrival", getTodayNgbDate());
    dealineChange();
    loadCategoryFields();

    // Set default values for form fields
    setTimeout(() => {
      if (docTypeCategory.length > 0 && !document.docTypeId) {
        setDocument((prev) => ({ ...prev, docTypeId: docTypeCategory[0].id }));
        setValue("docTypeId", docTypeCategory[0].id);
      }
      if (urgentCategory.length > 0 && !document.urgentId) {
        setDocument((prev) => ({ ...prev, urgentId: urgentCategory[0].id }));
        setValue("urgentId", urgentCategory[0].id);
      }
      if (methodReceiptCategory.length > 0 && !document.methodReceiptId) {
        setDocument((prev) => ({
          ...prev,
          methodReceiptId: methodReceiptCategory[0].id,
        }));
        setValue("methodReceiptId", methodReceiptCategory[0].id);
      }
      if (securityCategoryFilter?.length && !document.securityId) {
        const securityOption =
          securityCategoryFilter.length > 0
            ? securityCategoryFilter
            : securityCategoryData || [];
        setDocument((prev) => ({
          ...prev,
          securityId: securityOption[0].id,
        }));
        setValue("securityId", securityOption[0].id);
      }
    }, 100);
  };

  const loadCategoryFields = () => {
    // if (securityCategoryData?.length)
    //   setDocument((prev) => ({
    //     ...prev,
    //     securityId: securityCategoryData[0].id,
    //   }));
    // if (securityCategoryData?.length)
    //   setValue("securityId", securityCategoryData[0].id);
    if (urgentCategory.length)
      setDocument((prev) => ({ ...prev, urgentId: urgentCategory[0].id }));
    if (urgentCategory.length) setValue("urgentId", urgentCategory[0].id);
    if (docTypeCategory.length)
      setDocument((prev) => ({ ...prev, docTypeId: docTypeCategory[0].id }));
    if (docTypeCategory.length) setValue("docTypeId", docTypeCategory[0].id);
    if (docFieldCategory.length)
      setDocument((prev) => ({ ...prev, docFieldsId: docFieldCategory[0].id }));
    if (bookCategoryData?.length)
      setDocument((prev) => ({ ...prev, bookId: bookCategoryData[0].id }));
    if (bookCategoryData?.length) setValue("bookId", bookCategoryData[0].id);
    if (methodReceiptCategory.length)
      setDocument((prev) => ({
        ...prev,
        methodReceiptId: methodReceiptCategory[0].id,
      }));
    if (methodReceiptCategory.length)
      setValue("methodReceiptId", methodReceiptCategory[0].id);
  };

  const { data: documentOutById, isLoading } = useGetDocumentOutById(
    params?.id ? Number(params.id) : undefined
  );
  const isLoadSecurityDocument = documentOutById?.securityId || 0;
  useEffect(() => {
    if (!documentOutById) return;
    const res: any = documentOutById;
    setDocument(res);
    setIsWaitReceiveDocument(
      res.status === "WAIT_RECEIVE" && Constant.ORG_MULTI_TRANSFER_BCY
    );
    if (isCopyDocument) {
      setDocument((prev) => ({
        ...prev,
        id: undefined,
        attachments: [],
      }));
    }
  }, [documentOutById, encryptShowing]);

  useEffect(() => {
    if (!documentOutById) return;
    const files: FileAttachment[] = Array.isArray(documentOutById.attachments)
      ? (documentOutById.attachments as FileAttachment[])
      : [];
    setSelectedFiles(() => {
      let updatedFiles: FileAttachment[] = applyEncryptionLogic(
        files,
        encryptShowing
      );
      updatedFiles = updatedFiles.map((file: FileAttachment) => ({
        ...file,
        oEncrypt: file.encrypt,
      }));
      if (isCopyDocument) {
        updatedFiles = [];
      }
      updatedFiles = EncryptionService.checkedEntry(
        securityCategoryFilter,
        documentOutById.securityId || null,
        updatedFiles
      );
      return updatedFiles;
    });
  }, [documentOutById, securityCategoryFilter, encryptShowing, isCopyDocument]);

  const { data: docTypeCategoryData } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.DOC_TYPE
  );
  useEffect(() => {
    if (docTypeCategoryData) {
      setDocTypeCategory(docTypeCategoryData);
      // Set default docTypeId like Angular does (first option)
      if (!document.docTypeId && docTypeCategoryData.length > 0) {
        setDocument((prev) => ({
          ...prev,
          docTypeId: docTypeCategoryData[0].id,
        }));
      }
    }
  }, [docTypeCategoryData]);

  const { data: docFieldCategoryData } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.DOC_FIELDS
  );
  useEffect(() => {
    if (docFieldCategoryData) setDocFieldCategory(docFieldCategoryData);
  }, [docFieldCategoryData]);
  const { mutateAsync: saveNewDocumentOut } = useSaveNewDocumentOut();

  const { data: bookCategoryData } = useGetDocumentOutArrival();

  // Hooks for field and value services
  const { data: fieldsData } = useGetFields(1, isDataLoaded);
  const { mutateAsync: addValues } = useAddValues();
  const { mutateAsync: updateValues } = useUpdateValues();

  // Update model when fieldsData is loaded
  useEffect(() => {
    if (fieldsData) {
      setModel({ objects: fieldsData });
    }
  }, [fieldsData]);

  const [action, setAction] = useState<number | null>(-1);
  // Keep security default in sync when the filtered list changes
  useEffect(() => {
    if (securityCategoryFilter.length > 0) {
      if (
        !document.securityId ||
        !securityCategoryFilter.some((s) => s.id === document.securityId)
      ) {
        setDocument((prev) => ({
          ...prev,
          securityId: securityCategoryFilter[0].id,
        }));
      }
    }
  }, [securityCategoryFilter]);
  // When editing (update/copy): hydrate book and numberArrival based on existing doc
  // useEffect(() => {
  //   if (!bookCategoryData || !documentOutById || !securityCategoryData) return;
  //   setListArrival(bookCategoryData);
  //   changeBook(documentOutById?.bookId || -1, action, documentOutById);
  //   getNumArrival(documentOutById?.bookId || -1);
  // }, [bookCategoryData, documentOutById, securityCategoryData]);

  // When inserting a new document: select the first Book after API returns and auto-fill numberArrival
  // ✅ CHỈ GIỮ LẠI CÁI NÀY VÀ SỬA LẠI
  useEffect(() => {
    if (!bookCategoryData || !securityCategoryData) return;
    if (isManualBookChange) return;

    setListArrival(bookCategoryData);

    // Xử lý cho UPDATE/COPY
    if (documentOutById) {
      changeBook(documentOutById?.bookId || -1, action, documentOutById);
      getNumArrival(documentOutById?.bookId || -1);
      return;
    }

    // Xử lý cho INSERT mới
    if (isUpdate || isCopyDocument) return;

    const firstBookId = bookCategoryData[0]?.id;
    if (firstBookId) {
      setDocument((prev) => ({ ...prev, bookId: firstBookId }));
      changeBook(firstBookId, Constant.SAVE_ACTION.SAVE_AND_NEW);
      getNumArrival(firstBookId, true);
    }
  }, [
    bookCategoryData,
    securityCategoryData,
    documentOutById,
    isUpdate,
    isCopyDocument,
    isManualBookChange,
  ]);
  const { data: urgentCategoryData } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.URGENT
  );
  useEffect(() => {
    if (urgentCategoryData) {
      setUrgentCategory(urgentCategoryData);
      if (!document.urgentId && urgentCategoryData.length > 0) {
        setDocument((prev) => ({
          ...prev,
          urgentId: urgentCategoryData[0].id,
        }));
      }
    }
  }, [urgentCategoryData]);

  const { data: methodReceiptCategoryData } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.METHOD_RECEIPT
  );
  useEffect(() => {
    if (methodReceiptCategoryData) {
      setMethodReceiptCategory(methodReceiptCategoryData);
      if (!document.methodReceiptId && methodReceiptCategoryData.length > 0) {
        setDocument((prev) => ({
          ...prev,
          methodReceiptId: methodReceiptCategoryData[0].id,
        }));
      }
    }
  }, [methodReceiptCategoryData]);

  const { data: placeSendCategoryData } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.ORG_SEND
  );
  const { data: listOrgEnter } = useGetListOrgEnter();
  useEffect(() => {
    if (Array.isArray(placeSendCategoryData) && placeSendCategoryData.length) {
      setPlaceSendData(placeSendCategoryData as any);
    } else if (Array.isArray(listOrgEnter) && listOrgEnter.length) {
      // Fallback to org list if category returns empty
      const mapped = listOrgEnter.map((o: any) => ({ id: o.id, name: o.name }));
      setPlaceSendData(mapped);
    }
  }, [placeSendCategoryData, listOrgEnter]);

  const filterPlaceSendCategory = (event: string) => {
    if (!event) {
      setFilteredPlaceSendCategories(placeSendData.map((place) => place.name));
    } else {
      setFilteredPlaceSendCategories(
        placeSendData
          .filter(
            (item) =>
              item.id.toString() === event ||
              item.name.toLowerCase().includes(event.toLowerCase())
          )
          .map((place) => place.name)
      );
    }
  };

  const changeBook = (
    id: number,
    action: number | null = null,
    documentDefault?: any
  ) => {
    const bookSelected = bookCategoryData?.find((item) => item.id === id);

    if (!bookSelected) {
      setSecurityCategoryFilter([]);
      setDocument((prev) => ({ ...prev, securityId: null, bookId: id }));
      return;
    }

    const filtered = (securityCategoryData || []).filter((item) =>
      (bookSelected.securityIds || []).includes(item.id)
    );

    const isUserChangingBook =
      document.bookId && document.bookId !== id && document.id !== undefined;

    const currentSecurityNotInNewBook =
      document.securityId &&
      bookSelected.securityIds &&
      !bookSelected.securityIds.includes(document.securityId);

    if (
      isUpdate &&
      isUserChangingBook &&
      currentSecurityNotInNewBook &&
      document.securityName
    ) {
      ToastUtils.vanBanCoDoMatHayChonSoPhuHop(document.securityName);
      return;
    }

    if (currentTab === "waitTab") {
      const allSec = [...(securityCategoryData || [])];
      setSecurityCategoryFilter(allSec);
      setDocument((prev) => ({
        ...prev,
        securityId: document.securityId || allSec[0]?.id || null,
        bookId: id,
      }));
    } else {
      setSecurityCategoryFilter(filtered);

      const newSecurityId =
        document.securityId &&
        filtered.some((s) => s.id === document.securityId)
          ? document.securityId
          : filtered[0]?.id || null;

      setDocument((prev) => ({
        ...prev,
        securityId: newSecurityId,
        bookId: id,
      }));
    }

    if (isUpdate && !isWaitReceiveDocument) {
      getNumArrival(id);
    } else {
      getNumArrival(id, true);
    }

    checkedEntry();
  };

  // Sửa useEffect để không ghi đè
  useEffect(() => {
    if (!bookCategoryData || !documentOutById || !securityCategoryData) return;
    setListArrival(bookCategoryData);
    changeBook(documentOutById?.bookId || -1, action, documentOutById);
    getNumArrival(documentOutById?.bookId || -1);
  }, [bookCategoryData, documentOutById, securityCategoryData]);

  const getNumArrival = (bookid: number, changeBook = false) => {
    if (bookid === -1) {
      setDocument((prev) => ({ ...prev, numberArrival: null }));
    } else if (listArrival) {
      const source = (
        listArrival && listArrival.length ? listArrival : bookCategoryData || []
      ) as any[];
      const arrival = source.find((item) => item.id === bookid);
      if (arrival) {
        setCurrentArrival(arrival);
        updateBookDateWarning(arrival.year ?? new Date().getFullYear());
        // Nếu vừa submit xong và cần clear số đến, bỏ qua auto-fill 1 lần
        if (skipAutoNumberArrivalOnce) {
          setSkipAutoNumberArrivalOnce(false);
          setDocument((prev) => ({ ...prev, numberArrival: null }));
          return;
        }
        if (!isUpdate || changeBook) {
          const nextNumber = (arrival.value ?? arrival.currentNumber ?? 0) + 1;
          setDocument((prev) => ({ ...prev, numberArrival: nextNumber }));
        }
      }
    }
  };

  const doGetTheadComming = () => {
    if (!document.node) {
      setNodeStart(null);
      setListNextNode([]);
    } else {
      setNodeStart(null);
      setListNextNode([]);
    }
  };

  const { data: startNodes } = useGetStartNodes("INCOMING");
  useEffect(() => {
    if (!startNodes) return;
    const raw: NextNode[] = Array.isArray(startNodes)
      ? (startNodes as NextNode[])
      : [];
    const filtered = raw.filter((e) => !e.lastNode);
    setListNextNode(filtered);
    setIsshowDoneButton(filtered.length !== raw.length);
    if (raw.length <= 0) {
      ToastUtils.donViChuaCoLuongVanBanDen();
    }
  }, [startNodes]);

  const { data: nextNodes } = useGetNextNodes(document.node as any);
  useEffect(() => {
    if (!nextNodes) return;
    const raw: NextNode[] = Array.isArray(nextNodes)
      ? (nextNodes as NextNode[])
      : [];
    const filtered = raw.filter((e) => !e.lastNode);
    setListNextNode(filtered);
    setIsshowDoneButton(filtered.length !== raw.length);
  }, [nextNodes]);

  const checkProcessDone = () => {
    const filtered = listNextNode.filter((e) => !e.lastNode);
    setListNextNode(filtered);
    setIsshowDoneButton(filtered.length !== listNextNode.length);
  };

  const doOpenTransferPopup = (node: NextNode) => {
    doOpenProcessTree(node);
  };

  const doOpenProcessTree = (node: NextNode) => {
    bpmnService.currentSelectedNodeID = node.id;
    bpmnService.currentNodeOrg = [];
    bpmnService.currentNodeUser = [];
    if ((node as any).conditions) {
      (node as any).conditions.forEach((x: any) => {
        if (x.orgId && !x.userId)
          bpmnService.currentNodeOrg.push({ org: x.orgId, pos: x.positionId });
        if (x.userId) bpmnService.currentNodeUser.push(x.userId);
      });
    }
  };

  const validateRequiredFields = (): boolean => {
    // Clear previous programmatic errors
    clearErrors();
    let ok = true;
    const must = (
      cond: boolean,
      name: keyof InsertFormValues,
      message: string
    ) => {
      if (!cond) {
        setError(name, { type: "required", message });
        ok = false;
      }
    };
    const isCreate = !document.id || document.id === 0;
    must(!!document.bookId, "bookId", "Sổ văn bản là bắt buộc");
    must(!!document.numberArrival, "numberArrival", "Số đến là bắt buộc");
    must(!!document.dateArrival, "dateArrival", "Ngày văn bản là bắt buộc");
    // One of placeSendId OR placeSendOthers must be provided on create
    if (isCreate) {
      const hasPlace =
        !!document.placeSendId ||
        !!(document.placeSendOthers && document.placeSendOthers.trim());

      if (!hasPlace) {
        // Prefer to set error on placeSendId; UI shows message under existing block
        setError("placeSendId" as any, {
          type: "required",
          message: "Nơi gửi cần phải được nhập",
        });
        setValidPlaceSend(false);
        ok = false;
      }
    }
    must(!!document.docTypeId, "docTypeId", "Loại văn bản là bắt buộc");
    // must(!!document.urgentId, "urgentId", "Độ khẩn là bắt buộc");
    must(
      !!document.methodReceiptId,
      "methodReceiptId",
      "Phương thức nhận là bắt buộc"
    );
    // must(!!document.securityId, "securityId", "Độ mật là bắt buộc");
    must(
      !!(document.preview && document.preview.trim()),
      "preview",
      "Trích yếu là bắt buộc"
    );

    return ok;
  };

  const doSubmitIfValid = async (action: number) => {
    if (document.bookId === -1) {
      ToastUtils.soVanBanChuaDuocNhap();
      return;
    }
    // Sync controlled state into RHF before validation
    setValue("bookId", document.bookId);
    setValue("numberArrival", document.numberArrival);
    setValue("dateArrival", document.dateArrival);
    setValue("placeSendId", document.placeSendId);
    setValue("placeSendOthers", document.placeSendOthers);
    setValue("docTypeId", document.docTypeId);
    setValue("urgentId", document.urgentId);
    setValue("methodReceiptId", document.methodReceiptId);
    setValue("securityId", document.securityId);
    setValue("preview", document.preview);

    // Declare per-field rules implicitly via trigger; RHF requires rules at register or schema.
    // We'll validate presence here by checking the current values after setValue.
    // Programmatic required checks (ensures we block without fully registering all inputs)
    const ok = validateRequiredFields();
    if (!ok) {
      setInValidation(true);
      return;
    }
    if (!validatePlaceSendOthers()) return;
    if (encryptShowing && !isWaitReceiveDocument) setIsShowLoadingEncrypt(true);
    const result = await doSubmit(action);

    // Chỉ clear data và invalidate queries khi lưu thành công
    if (result) {
      await queryClient.invalidateQueries({
        queryKey: [
          queryKeys.documentOut.root,
          queryKeys.documentOut.basicSearchIncoming,
        ],
      });

      if (action === Constant.SAVE_ACTION.SAVE_AND_NEW) {
        setSkipAutoNumberArrivalOnce(true);
        setDocument(createDefaultDocument());
        reset(createDefaultFormValues());
        // Clear numberArrival và bỏ qua auto-fill 1 lần do useEffect chạy lại
        setValue("numberArrival", null);
        setSelectedFiles([]);
      }
      setInValidation(false);
    }
  };

  const validatePlaceSendOthers = () => {
    if (!document.id || document.id === 0) {
      if (!document.placeSendId && !document.placeSendOthers) {
        setError("placeSendId" as any, {
          type: "required",
          message: "Nơi gửi cần phải được nhập",
        });
        setValidPlaceSend(false);
        return false;
      }
    } else if (!document.placeSendId) {
      setValidPlaceSend(false);
      return false;
    }
    return true;
  };

  const doSubmit = async (action: number): Promise<boolean> => {
    if (isSubmitted) return false;
    setIsSubmitted(true);
    if (action === Constant.SAVE_ACTION.SAVE_AND_CLOSE) {
      setLoading(true);
    }
    try {
      if (selectedFiles.length) {
        const encryptFiles = selectedFiles.filter(
          (i) => (i.encrypt && !i.id) || (i.encrypt && i.id && !i.oEncrypt)
        );
        if (encryptFiles.length) {
          const connect = await EncryptionService.checkConnect();
          if (!connect) {
            setInValidation(true);
            setIsSubmitted(false);
            setLoading(false);
            return false;
          }
        }
      }
      let rs;
      if (!document.id) {
        rs = await doSaveNewDocumentOut(action);
      } else if (!isWaitReceiveDocument) {
        rs = await doSaveDocumentOutMutation(action);
      } else {
        rs = await doUpdateReceiveDoc(action);
      }
      if (rs === false) {
        setIsSubmitted(false);
        return false;
      }
      setIsSubmitted(false);
      setAction(action);
      return true;
    } catch (error) {
      console.error("Error in doSubmit:", error);
      setIsSubmitted(false);
      return false;
    } finally {
      if (action === Constant.SAVE_ACTION.SAVE_AND_CLOSE) {
        setLoading(false);
      }
    }
  };
  const { mutateAsync: doUpdateReceiveDocMutation } = useUpdateReceiveDoc();

  const doUpdateReceiveDoc = async (action: number) => {
    try {
      setIsUpdate(true);
      const dto = convertDocumentToDocumentDTO(document as any);
      await doUpdateReceiveDocMutation(dto);
      doSaveAction(action);
      return await doAddAttachments(document.id!, action);
    } catch (error) {
      console.error("Error updating receive document:", error);
      return false;
    }
  };

  const { mutateAsync: doSaveDocumentOut } = useSaveDocumentOut();

  const doSaveDocumentOutMutation = async (action: number) => {
    try {
      setIsUpdate(true);

      const dto = convertDocumentToDocumentDTO(document as any);
      if (action === Constant.SAVE_ACTION.SAVE_OF_DONE) {
        dto.isComplete = true;
      }
      dto.id = document.id!;

      return new Promise<boolean>((resolve) => {
        doSaveDocumentOut(dto, {
          onSuccess: async (res) => {
            const rs = await doAddAttachments(res?.id as number, action);
            if (rs === false) {
              resolve(false);
              return;
            }

            if (action === Constant.SAVE_ACTION.SAVE_OF_TRANSFER) {
              // Handle transfer
            }
            await queryClient.invalidateQueries({
              queryKey: [
                queryKeys.documentOut.root,
                queryKeys.documentOut.basicSearchIncoming,
              ],
            });
            doSaveAction(action);
            resolve(true);
          },
          onError: (err) => {
            console.error("Save document out failed:", err);
            resolve(false);
          },
        });
      });
    } catch (error) {
      console.error("Error in doSaveDocumentOutMutation:", error);
      return false;
    }
  };

  const doSaveNewDocumentOut = async (action: number) => {
    try {
      setIsUpdate(false);
      if (action === Constant.SAVE_ACTION.SAVE_OF_DONE)
        setDocument((prev) => ({ ...prev, isComplete: true }));
      const dto = convertDocumentToDocumentDTO(document as any);
      const res: any = await saveNewDocumentOut(dto);
      const documentId = res?.id as number;
      const rs = await doAddAttachments(documentId, action);
      if (!rs) {
        rollBack(documentId);
        setIsSubmitted(false);
        return false;
      }
      doUpdateAddFieldsValue(documentId);
      setIsCreateDocSuccess(true);
      if (action === Constant.SAVE_ACTION.SAVE_OF_TRANSFER) {
        // Handle transfer
      }
      await queryClient.invalidateQueries({
        queryKey: [
          queryKeys.documentOut.root,
          queryKeys.documentOut.basicSearchIncoming,
        ],
      });

      return true;
    } catch (error) {
      console.error("Error in doSaveNewDocumentOut:", error);
      return false;
    }
  };
  const { mutate: doDeleteDocumentMutation } = useDeleteDocument();

  const rollBack = async (documentId: number) => {
    await doDeleteDocumentMutation(documentId);
  };

  const { mutateAsync: doSaveNewAttachmentMutation } =
    useSaveNewAttachmentMutation();

  const doAddAttachments = async (documentId: number, action: number) => {
    try {
      setIsShowUploadProgress(true);
      setMessage("");

      // Lọc file encrypt và non-encrypt tại thời điểm hiện tại
      const encrypt = await uploadFileService.filterFile(
        selectedFiles,
        EncryptionService.ENCRYPT,
        OBJ_TYPE.VAN_BAN_DEN
      );
      const nonEncrypt = await uploadFileService.filterFile(
        selectedFiles,
        "",
        OBJ_TYPE.VAN_BAN_DEN
      );

      setEncryptArr(encrypt);
      setNonEncryptArr(nonEncrypt);

      // Nếu có file cần encrypt
      if (encrypt.length) {
        const rs = await EncryptionService.doEncryptExecute(
          encrypt as File[],
          documentId,
          "VAN_BAN_DEN"
        );
        if (!rs) {
          console.warn("Encrypt thất bại");
          setSelectedFiles((prev) =>
            prev.map((i) => ({ ...i, encrypt: false }))
          );
          return false;
        }
      }

      // Upload file thường
      if (documentId && nonEncrypt.length) {
        await doSaveNewAttachmentMutation({
          type: "",
          documentId,
          files: nonEncrypt,
        });
      }

      // Chỉ gọi doSaveAction một lần duy nhất sau khi hoàn tất tất cả
      doSaveAction(action);
      setIsSubmitted(false);

      return true;
    } catch (err) {
      console.error("doAddAttachments failed:", err);
      return false;
    }
  };

  const doSaveAction = (action: number) => {
    const msg = `${document.id ? "Cập nhập" : "Thêm mới"} văn bản đến thành công.`;
    if (action === Constant.SAVE_ACTION.SAVE_AND_CLOSE) {
      ToastUtils.success(msg);
      if (fromMenu && (fromMenu === "main" || fromMenu === "search")) {
        router.back();
      } else {
        router.push("/document-out/list");
      }
    } else if (action === Constant.SAVE_ACTION.SAVE_AND_NEW) {
      ToastUtils.success(msg);
      router.push("/document-out/list/insert");
      setSelectedFiles([]);
    } else if (action === Constant.SAVE_ACTION.SAVE_AND_COPY) {
      ToastUtils.success(msg);
      if (isUpdate) {
        router.push(`/document-out/list/insert/${document.id}`);
      }
    } else if (action === Constant.SAVE_ACTION.SAVE_OF_DONE) {
      ToastUtils.documentCompleteSuccess();
      router.push("/document-out/main?currentTab=doneTab");
    }
    setIsShowLoadingEncrypt(false);
  };

  const doRemoveFile = (
    index: number,
    type: string,
    file: FileAttachment,
    elementId: string
  ) => {
    if (file.id) {
      removeFileAction(index, type, file, elementId);
    } else {
      removeFileFromView(index, type, file, elementId);
    }
  };

  const removeFileAction = async (
    index: number,
    type: string,
    file: FileAttachment,
    elementId: string
  ) => {
    await uploadFileService.deleteDocumentOutAttachment(file.id!);
    ToastUtils.fileDeleteSuccess();
    removeFileFromView(index, type, file, elementId);
  };

  const removeFileFromView = (
    index: number,
    type: string,
    file: FileAttachment,
    elementId: string
  ) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    doAfterRemoveOrSelectFile(type);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const doSelectFiles = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
    const files = event.target.files;
    if (!files) return;
    if (!uploadFileService.doCheckFileExtension(files)) {
      setValidFileAttr({
        ...validFileAttr,
        isValidExtension: false,
        hasError: true,
      });
      event.target.value = "";
      return;
    }
    if (!validFileSSize(files)) {
      setValidFileAttr({
        ...validFileAttr,
        isValidFileSize: false,
        hasError: true,
      });
      event.target.value = "";
      return;
    }
    if (
      !uploadFileService.validateNumberOfFileUpload(selectedFiles, files, false)
    ) {
      setValidFileAttr({
        ...validFileAttr,
        isValidNumberOfFiles: false,
        hasError: true,
      });
      event.target.value = "";
      return;
    }
    setValidFileAttr({
      hasError: false,
      isValidFileSize: true,
      isValidExtension: true,
      isValidNumberOfFiles: true,
      isHasFile: true,
    });
    const newFiles = Array.from(files).filter(
      (file) => !isExistFile(file.name, selectedFiles)
    );
    setSelectedFiles((prev) => {
      const updatedFiles = [...prev, ...newFiles];
      return applyEncryptionLogic(updatedFiles, encryptShowing);
    });
    doAfterRemoveOrSelectFile(type);
    checkedEntry();
    event.target.value = "";
  };
  const doSelectFileEncrypt = async (type: string) => {
    UploadEncryptionService.updateProcess({
      totalFiles: 0,
      currentFile: 0,
      currentProgress: 0,
      fileName: "",
      expectedChunks: 0,
      receivedChunks: 0,
      fileSize: 0,
      namedraftFiles: "",
      error: false,
    });
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

  const doAfterRemoveOrSelectFile = (type: string) => {
    if (selectedFiles.length === 0) {
      setValidFileAttr({ ...validFileAttr, hasError: true, isHasFile: false });
    }
  };

  const viewFile = async (file: FileAttachment, index: number) => {
    try {
      if (!isUpdate) {
        const fileToView = { ...file, encrypt: false };
        await viewFileCheck(
          fileToView,
          Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_OUT
        );
      } else {
        if (encryptShowing) setIsShowLoadingDeEncrypt(true);
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
        });
        if (encryptShowing) {
          decryptResult$.subscribe((decryptedBlob: Blob) => {
            setFilePreview({
              file: file,
              blob: decryptedBlob,
            });
            setIsShowLoadingEncrypt(false);
            setIsShowPreviewPdf(true);
          });
        }
        await viewFileCheck(
          file,
          Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_OUT
        );
      }
    } catch (error) {
      console.error("Error viewing file:", error);
      ToastUtils.khongTheMoTepTin();
      setIsShowLoadingDeEncrypt(false);
    }
  };

  const viewFileCheck = async (file: any, type: string) => {
    try {
      const extension = getExtension(file.name)?.toLowerCase();
      if (isCheckStatusSecurityDocument) {
        if (extension?.includes("pdf")) {
          await uploadFileService.viewPdfFile(
            file,
            type,
            false,
            String(docId),
            Constant.HSTL_DOCUMENT_TYPE.VAN_BAN_DEN
          );
          setIsCanHandleDoc(false);
          setIsShowLoadingDeEncrypt(false);
        } else {
          await viewDocFileCheck(file, type);
        }
      } else {
        if (extension?.includes("pdf")) {
          await uploadFileService.viewPdfFile(file, type);
          setIsCanHandleDoc(false);
        } else {
          await viewDocFileCheck(file, type);
        }
      }
    } catch (error) {
      console.error("Error in viewFileCheck:", error);
      throw error; // Re-throw để hàm viewFile có thể catch
    }
  };

  const viewDocFileCheck = async (file: any, type: string) => {
    try {
      const extension = getExtension(file.name)?.toLowerCase();
      if (extension) {
        let fileData;
        if (file && !file.id && !file.encrypt) {
          const reader = new FileReader();
          reader.onload = (event) => {
            fileData = event.target?.result;
            uploadFileService.openDoc(file, type, fileData);
          };
          reader.readAsDataURL(file as Blob);
        } else if (file.encrypt) {
          const url = uploadFileService.getUrl(type);
          await uploadFileService
            .doDecrypt(
              type !== Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_INTERNAL
                ? file.name
                : file.id.toString(),
              url,
              true,
              null
            )
            .then(() => {
              setIsCanHandleDoc(true);
            })
            .catch((error) => {
              console.error("Decrypt error:", error);
              setIsCanHandleDoc(false);
              throw error;
            });
        } else {
          uploadFileService.openDoc(file, type, null);
        }
      }
    } catch (error) {
      console.error("Error in viewDocFileCheck:", error);
      throw error;
    }
  };

  const isVerifierPDF = (file: FileAttachment) =>
    file.name.toLowerCase().includes(".pdf") && !file.oEncrypt;

  const verifierPDF = (file: FileAttachment) => {
    if (file.documentId) {
      uploadFileService.verifierPDF(
        file.name,
        "",
        Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_OUT
      );
    } else {
      const reader = new FileReader();
      reader.onload = (event) => {
        const fileData = event.target?.result as string;
        uploadFileService.verifierPDF(
          file.name,
          fileData,
          Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_OUT
        );
      };
      reader.readAsDataURL(file as any);
    }
  };

  const successSignCallback = (ev: any, callback: () => void) => {
    uploadFileService.signNotification(ev, callback);
    loadNgOnInit();
  };

  const onCancelDownload = () => {
    setIsdownloadFile(false);
    doForceDisconnect();
  };

  const downloadFile = async (fileName: string, encrypt: boolean) => {
    if (
      isUpdate &&
      fileName.toLowerCase().includes("phieu_trinh_xu_ly_van_ban")
    ) {
      await uploadFileService.downloadFile(
        fileName,
        Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_OUT,
        false
      );
    } else {
      setNameFileDownload(fileName);
      setIsdownloadFile(true);
      setProgress(0);
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
      });
      await uploadFileService.downloadFile(
        fileName,
        Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_OUT,
        encrypt,
        null,
        null,
        String(document?.id),
        Constant.HSTL_DOCUMENT_TYPE.VAN_BAN_DEN
      );
      setProgress(100);
      setIsdownloadFile(false);
      setIsCanHandleDoc(true);
    }
  };

  const doForceDisconnect = () => {
    DecryptionService.disconnect();
    setIsShowLoadingEncrypt(false);
    setEncryptProcessLoading(false);
    setIsShowLoadingDeEncrypt(false);
    setIsdownloadFile(false);
  };

  const signFileEncrypt = async (
    documentId: number,
    fileName: string,
    encrypt: boolean,
    fileId: number
  ) => {
    setEncryptProcessLoading(true);
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
    });
    await uploadFileService.uploadFileEncryptToSign(
      fileName,
      Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_OUT,
      true,
      document?.id,
      null,
      fileId.toString(),
      "VAN_BAN_DEN"
    );
    setEncryptProcessLoading(false);
    setIsCanHandleDoc(true);
    loadNgOnInit();
  };

  const dealineChange = () => {
    setDocument({
      ...document,
      dayLeft: getRemainedDays(document.deadline || null),
    });
  };

  // doLoadFields is now handled by useGetFields hook and useEffect above
  const doLoadFields = async () => {
    // Data is automatically loaded via useGetFields hook
    // The useEffect above handles setting the model when fieldsData changes
  };

  const doUpdateAddFieldsValue = async (docId: number) => {
    // Only send fields that actually have a value (match Angular behavior)
    const values = { objects: [] as any[] };
    model.objects.forEach((item) => {
      if (item.value) {
        values.objects.push({
          formId: docId,
          content: item.value,
          fieldsId: item.id,
          catId: item.catId,
        });
      }
    });
    // Skip API call when nothing to save
    if (!values.objects.length) return;

    // Use mutation hooks instead of direct service calls
    if (!isUpdate) {
      await addValues(values);
    } else {
      await updateValues(values);
    }
  };
  const docId = params?.id ? Number(params.id) : 0;
  // Create a hook-based version for loading values
  const { data: valuesDataQuery, refetch: refetchValues } = useGetValues(
    1,
    docId ?? undefined,
    false // Disabled by default, we'll trigger it manually
  );

  const doLoadValues = async (catid: number, docid: number) => {
    // Trigger the query manually
    const { data } = await refetchValues();
    if (data) {
      setValueslist(data);
      const updatedObjects = model.objects.map((item) => {
        const val = data.find(
          (v: any) => Number(item.id) === Number(v.fields.id)
        );
        if (val) item.value = val.content;
        return item;
      });
      setModel({ objects: updatedObjects });
    }
  };

  const goBack = () => {
    router.back();
  };

  const doOpenTransferPopupIfValid = async (node: any) => {
    // Kiểm tra required qua native và validate thủ công để hiện error messages
    if (formRef.current?.checkValidity() === false) {
      setInValidation(true);
    }
    const fieldsOk = validateRequiredFields();
    const placeOk = validatePlaceSendOthers();
    if (!fieldsOk || !placeOk) {
      setInValidation(true);
      return;
    }
    await doOpenProcessTree(node);
    setInValidation(false);
  };
  // Validate chỉ để block mở \"Chuyển xử lý\" (không mở dialog)
  const validateBeforeTransfer = () => {
    if (formRef.current?.checkValidity() === false) {
      setInValidation(true);
    }
    const fieldsOk = validateRequiredFields();
    const placeOk = validatePlaceSendOthers();
    if (!fieldsOk || !placeOk) {
      setInValidation(true);
      return false;
    }
    return true;
  };
  const { mutate: doFinishDocumentMutation } = useFinishDocument();

  const doFinishDocument = async () => {
    await doFinishDocumentMutation([document.id!]);
    ToastUtils.documentCompleteSuccess();
    router.push("/document-out/list");
  };

  const dateArrivalChange = () => {
    const date = document.dateArrival;
    if (date && isAfter(date, document.receivedDate || new Date())) {
      setDocument((prev) => ({ ...prev, receivedDate: null }));
    }
  };

  const receivedDateChange = () => {
    const date = document.receivedDate;
    if (date) {
      if (isAfter(date, document.dateIssued || new Date()))
        setDocument((prev) => ({ ...prev, dateIssued: null }));
      if (isBefore(date, document.dateArrival || new Date()))
        setDocument((prev) => ({ ...prev, dateArrival: null }));
    }
  };

  const issuedDateChange = () => {
    const date = document.dateIssued;
    if (date) {
      if (isAfter(date, document.deadline || new Date()))
        setDocument((prev) => ({ ...prev, deadline: null }));
      if (isBefore(date, document.receivedDate || new Date()))
        setDocument((prev) => ({ ...prev, receivedDate: null }));
    }
  };

  const { data: listUserEnter } = useGetListUserEnter();
  useEffect(() => {
    if (listUserEnter) {
      setPersonSigndata(listUserEnter);
    }
  }, [listUserEnter]);

  const onChangePlaceSend = (event: any) => {
    if (event.isInteracted) setValidPlaceSend(true);
  };

  const updateBookDateWarning = (year: number) => {
    setIsBookDateWarning(isBookWarning(year));
    if (isBookDateWarning) ToastUtils.soVanBanSapHetHan();
  };
  // Confirm dialog state (replace commonUtils.showPopupConfirm)
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [confirmConfig, setConfirmConfig] = useState<{
    title?: string;
    description?: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void | Promise<void>;
  }>({ onConfirm: () => {} });

  const callScanService = () => {
    if (getIsConnect() && getWebSocket()) {
      doOpenScanForm();
    } else {
      connectScanService((data: any) => {
        if (data === "-100") {
          setConfirmConfig({
            title: "Yêu cầu cài đặt",
            description:
              "Chức năng này cần cài đặt EcoScanner service để tiếp tục!",
            confirmText: "Tải về",
            cancelText: "Đóng",
            onConfirm: () => {
              const link = globalThis.document.createElement("a");
              link.href = "/assets/ecoscanner/Release.zip";
              link.download = "Release.zip";
              link.click();
            },
          });
          setConfirmOpen(true);
        } else {
          doOpenScanForm();
        }
      });
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
          let tmp: FileAttachment;
          if (docTypeScan === "get pdf") {
            const file = new globalThis.File([data], `${docName}.pdf`, {
              type: "application/pdf",
            });
            tmp = file as unknown as FileAttachment;
          } else if (docTypeScan === "get png") {
            const file = new globalThis.File([data], `${docName}.png`, {
              type: "image/png",
            });
            tmp = file as unknown as FileAttachment;
          } else {
            return;
          }
          setSelectedFiles((prev) => [...prev, tmp]);
        } else {
          ToastUtils.error(data, "Thông báo");
        }
        setIsOpenScanModal(false);
      });
    }
  };

  const ocrFile = async (file: FileAttachment) => {
    const res = await uploadFileService.ocrFile(file as any);
    if (res) autoFillData(res.value);
  };

  const autoFillData = (data: any) => {
    if (data.trich_yeu || data.noi_dung) {
      setDocument((prev) => ({
        ...prev,
        preview: data.trich_yeu || data.noi_dung,
      }));
    }
    if (data.so_ky_hieu)
      setDocument((prev) => ({ ...prev, numberOrSign: data.so_ky_hieu }));
    if (data.ngay_ban_hanh) {
      setDocument((prev) => ({
        ...prev,
        dateArrival: new Date(
          Number(data.ngay_ban_hanh.nam),
          Number(data.ngay_ban_hanh.thang) - 1,
          Number(data.ngay_ban_hanh.ngay)
        ),
      }));
    }
    if (data.co_quan_ban_hanh) {
      const place = placeSendData.find(
        (item) =>
          item.name
            .toLowerCase()
            .includes(data.co_quan_ban_hanh.toLowerCase()) ||
          data.co_quan_ban_hanh.toLowerCase().includes(item.name.toLowerCase())
      );
      if (place) setDocument((prev) => ({ ...prev, placeSendId: place.id }));
    }
    if (data.ten_van_ban) {
      const docType = docTypeCategory.find(
        (item) =>
          item.name.toLowerCase().includes(data.ten_van_ban.toLowerCase()) ||
          data.ten_van_ban.toLowerCase().includes(item.name.toLowerCase())
      );
      if (docType) setDocument((prev) => ({ ...prev, docTypeId: docType.id }));
    }
  };

  const checkedEntry = useCallback(() => {
    try {
      setIsCanHandleDoc(
        encryptShowing || (isCheckStatusSecurityDocument && isCanHandleDoc)
      );
      setIsCheckEncrypt(encryptShowing);
      setIsCheckOpenDownLoadFileEncrypt(encryptShowing);

      setSelectedFiles((prevFiles) => {
        let updatedFiles = applyEncryptionLogic(prevFiles, encryptShowing);
        updatedFiles = EncryptionService.checkedEntry(
          securityCategoryFilter,
          document.securityId,
          updatedFiles
        );
        return updatedFiles;
      });
    } catch (error) {
      ToastUtils.error("Không thể cập nhật trạng thái mã hóa tệp");
    }
  }, [
    encryptShowing,
    isCheckStatusSecurityDocument,
    securityCategoryFilter,
    document.securityId,
  ]);
  const { mutate: doRejectMutation } = useRejectDocument();

  const doReject = () => {
    setConfirmConfig({
      title: "Xác nhận",
      description: "Bạn có chắc muốn từ chối?",
      confirmText: "Đồng ý",
      cancelText: "Đóng",
      onConfirm: async () => {
        await doRejectMutation([document.id!]);
        ToastUtils.documentRejectSuccess();
        router.back();
      },
    });
    setConfirmOpen(true);
  };

  const doCopyDocument = () => {
    router.push(`/document-out/list/insert/${document.id}`);
  };

  const changeEncrypt = (file: FileAttachment) => {
    if (!(file.id && file.oEncrypt)) {
      setSelectedFiles((prev) => {
        const updatedFiles = prev.map((f) =>
          f === file ? { ...f, encrypt: !f.encrypt } : f
        );
        return updatedFiles;
      });
      checkedEntry();
    }
  };

  const selectVb = (id: number) => {
    const cat = methodReceiptCategory.find((x) => x.id === id);
    setDocument((prev) => ({
      ...prev,
      isDisableVBDT: cat?.name === "Văn bản giấy",
    }));
  };

  const { data: detailLegacy } = useGetDocumentOutDetailLegacy(
    params?.id ? Number(params.id) : undefined,
    {
      notId: searchParams?.get("notificationId"),
      tab: searchParams?.get("currentTab"),
    }
  );
  useEffect(() => {
    if (!detailLegacy) return;
    setDocumentDetail(detailLegacy?.data ?? {});
    setIsDataLoaded(true);
  }, [detailLegacy]);

  const { data: commentList } = useGetDocumentOutComments(
    params?.id ? Number(params.id) : 0
  );
  useEffect(() => {
    if (!commentList) return;
    setDocumentComments(commentList);
    setIsDataLoaded(true);
  }, [commentList]);
  useEffect(() => {
    const unsubs = [
      UploadEncryptionService.subscribe(setUploadEncryptionProgress),
      DecryptionService.subscribe(setDecryptionProgress),
      EncryptionService.subscribe(setEncryptionProgress),
    ];

    return () =>
      unsubs.forEach((u) => {
        if (typeof u === "function") u();
      });
  }, []);
  useEffect(() => {
    currentMessage$.subscribe((event) => {
      if (event === Constant.SHARE_DATA.CLOSE_POPUP) doForceDisconnect();
    });
  }, []);

  const doshowCommentForm = () => {
    setDisplayCommentForm(!displayCommentForm);
  };
  // Render
  return (
    <div className="p-4">
      <BreadcrumbNavigation
        items={[
          {
            href: "/document-out/list",
            label: "Danh sách văn bản đến",
          },
        ]}
        currentPage="Dự thảo văn bản đến"
        showHome={false}
      />
      <div className="flex flex-wrap items-center my-4 gap-2">
        <Button
          onClick={goBack}
          variant="outline"
          className="flex items-center gap-2 h-9"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        {!isWaitReceiveDocument && !document.confidential && (
          <Button
            onClick={() => doSubmitIfValid(Constant.SAVE_ACTION.SAVE_AND_NEW)}
            disabled={isSubmitted}
            className={`bg-blue-600 hover:bg-blue-700 hover:text-white text-white border-0 h-9 px-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            <Save className="h-4 w-4" /> Lưu và thêm mới
          </Button>
        )}
        <Button
          onClick={() => doSubmitIfValid(Constant.SAVE_ACTION.SAVE_AND_CLOSE)}
          className={`text-white border-0 h-9 px-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700`}
        >
          <Check className="h-4 w-4" />{" "}
          {!isWaitReceiveDocument ? "Lưu và đóng" : "Tiếp nhận"}
        </Button>
        {!document.confidential && (
          <Button
            onClick={() => doSubmitIfValid(Constant.SAVE_ACTION.SAVE_AND_COPY)}
            className={`text-white border-0 h-9 px-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700`}
          >
            <Copy className="h-4 w-4" /> Lưu và sao lưu
          </Button>
        )}
        {currentTab === "handleTab" && isCanHandleDoc && (
          <Button
            onClick={doCopyDocument}
            disabled={!document.id}
            className={`text-white border-0 h-9 px-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700`}
          >
            <Copy className="h-4 w-4" /> Sao chép
          </Button>
        )}
        {currentTab === "waitTab" && isCanHandleDoc && (
          <Button
            onClick={doReject}
            className={`text-white border-0 h-9 px-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700`}
          >
            Từ chối
          </Button>
        )}
        {!isWaitReceiveDocument &&
          !fromMenu &&
          !document.confidential &&
          !isCanHandleDoc && (
            <>
              {nodeStart && (
                <TransferDocumentOut
                  selectedItemId={Number(document.id)}
                  disabled={false}
                  onSuccess={() => {
                    queryClient.invalidateQueries({
                      queryKey: [
                        queryKeys.documentOut.root,
                        queryKeys.documentOut.comments,
                        document.id,
                      ],
                    });
                  }}
                  listNextNode={listNextNode}
                  onBeforeOpen={validateBeforeTransfer}
                />
              )}
              {listNextNode.length > 0 && (
                <TransferDocumentOut
                  selectedItemId={Number(document.id)}
                  disabled={false}
                  onSuccess={() => {
                    queryClient.invalidateQueries({
                      queryKey: [
                        queryKeys.documentOut.root,
                        queryKeys.documentOut.comments,
                        document.id,
                      ],
                    });
                  }}
                  listNextNode={listNextNode}
                  onBeforeOpen={validateBeforeTransfer}
                />
              )}
            </>
          )}
        {isDataLoaded && (
          <>
            {!document.confidential &&
              currentTab !== "waitTab" &&
              document.isDisableVBDT &&
              !isCanHandleDoc && (
                <Button
                  onClick={() =>
                    doSubmitIfValid(Constant.SAVE_ACTION.SAVE_OF_DONE)
                  }
                  className={`text-white border-0 h-9 px-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700`}
                >
                  <Check className="h-4 w-4" /> Hoàn thành
                </Button>
              )}
            {!document.confidential &&
              currentTab === "handleTab" &&
              !isCanHandleDoc && (
                <Button
                  onClick={doFinishDocument}
                  className={`text-white border-0 h-9 px-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700`}
                >
                  <Check className="h-4 w-4" /> Hoàn thành
                </Button>
              )}
          </>
        )}
      </div>
      <form
        ref={formRef}
        onSubmit={(e) => e.preventDefault()}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-4">
            <div className="border rounded-md p-4">
              <h3 className="text-lg font-bold text-blue-600">
                Thông tin văn bản
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <Label htmlFor="book" className="font-bold">
                    Sổ văn bản <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex-1 min-w-0">
                    <SelectCustom
                      value={document.bookId?.toString() || ""}
                      onChange={(val) => {
                        setIsManualBookChange(true);
                        changeBook(Number(val));
                      }}
                      options={(bookCategoryData || []).map((item) => ({
                        label: item.name,
                        value: item.id.toString(),
                      }))}
                      placeholder="Chọn sổ"
                      className="bg-white"
                      disabled={document.confidential}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="numberArrival" className="font-bold">
                    Số đến <span className="text-red-500">*</span>
                  </Label>
                  {isUpdate && !isWaitReceiveDocument ? (
                    <Input
                      type="text"
                      value={document.numberArrival?.toString() || ""}
                      readOnly
                      className="bg-white"
                    />
                  ) : (
                    <div className="flex">
                      <Input
                        type="number"
                        value={document.numberArrival?.toString() || ""}
                        onChange={(e) =>
                          setDocument({
                            ...document,
                            numberArrival: Number(e.target.value),
                          })
                        }
                        className="w-3/5 bg-white"
                        required
                      />
                      <Input
                        value={currentArrival?.numberOrSign || ""}
                        readOnly
                        className="w-2/5 ml-2 bg-white"
                      />
                    </div>
                  )}
                  {errors.numberArrival && (
                    <p className="text-red-500 text-sm">Số đến là bắt buộc</p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="numberArrivalStr" className="font-bold">
                    Số, KH của VB đến
                  </Label>
                  {!document.confidential ? (
                    <Input
                      value={document.numberArrivalStr}
                      onChange={(e) =>
                        setDocument({
                          ...document,
                          numberArrivalStr: e.target.value,
                        })
                      }
                      maxLength={50}
                      className="bg-white"
                      disabled={isWaitReceiveDocument || document.confidential}
                    />
                  ) : (
                    <Input
                      value={documentSecurity.numberArrivalStr}
                      readOnly
                      disabled
                      className="bg-white"
                    />
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="receivedDate" className="font-bold">
                    Ngày nhận văn bản
                  </Label>
                  <CustomDatePicker
                    selected={
                      document.receivedDate
                        ? new Date(document.receivedDate)
                        : null
                    }
                    onChange={(date) => {
                      setDocument((prev) => ({
                        ...prev,
                        receivedDate: date
                          ? new Date(
                              `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
                            )
                          : null,
                      }));
                      receivedDateChange();
                    }}
                    readOnly={isWaitReceiveDocument || !!document.confidential}
                    placeholder="dd/MM/yyyy"
                    disabledFuture={true}
                    showClearButton={false}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="dateArrival" className="font-bold">
                    Ngày văn bản <span className="text-red-500">*</span>
                  </Label>
                  <CustomDatePicker
                    selected={
                      document.dateArrival
                        ? new Date(document.dateArrival)
                        : null
                    }
                    onChange={(date) => {
                      setDocument((prev) => ({
                        ...prev,
                        dateArrival: date
                          ? new Date(
                              `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
                            )
                          : null,
                      }));
                      dateArrivalChange();
                    }}
                    readOnly={!!document.confidential}
                    placeholder="dd/MM/yyyy"
                    disabledFuture={true}
                    showClearButton={false}
                  />
                  {errors.dateArrival && (
                    <p className="text-red-500 text-sm">
                      Ngày văn bản là bắt buộc
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="dateIssued" className="font-bold">
                    Ngày vào sổ
                  </Label>
                  <CustomDatePicker
                    selected={
                      document.dateIssued ? new Date(document.dateIssued) : null
                    }
                    onChange={(date) => {
                      setDocument((prev) => ({
                        ...prev,
                        dateIssued: date
                          ? new Date(
                              `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
                            )
                          : null,
                      }));
                      issuedDateChange();
                    }}
                    readOnly={!!document.confidential}
                    placeholder="dd/MM/yyyy"
                    disabledFuture={true}
                    showClearButton={false}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="placeSendId" className="font-bold">
                    Cơ quan ban hành <span className="text-red-500">*</span>
                  </Label>
                  <Popover
                    open={placeSendPopoverOpen}
                    onOpenChange={setPlaceSendPopoverOpen}
                  >
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={placeSendPopoverOpen}
                        className="w-full justify-between h-[36px]"
                        disabled={
                          isWaitReceiveDocument || document.confidential
                        }
                      >
                        <span className="truncate">
                          {document.placeSendId ? (
                            (placeSendData || []).find(
                              (item) => item.id === document.placeSendId
                            )?.name || "Không tìm thấy"
                          ) : document.confidential ? (
                            "*****"
                          ) : (
                            <span className="text-gray-500">Chọn nơi gửi</span>
                          )}
                        </span>
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-[var(--radix-popover-trigger-width)] p-0"
                      align="start"
                      side="bottom"
                      sideOffset={4}
                    >
                      <Command shouldFilter={false}>
                        <CommandInput
                          placeholder="Tìm kiếm cơ quan..."
                          className="h-9"
                        />
                        <CommandList className="max-h-[200px] overflow-auto">
                          <CommandEmpty>
                            Không tìm thấy cơ quan nào.
                          </CommandEmpty>
                          <CommandGroup>
                            {(placeSendData || []).map((item) => (
                              <CommandItem
                                key={item.id}
                                value={item.name || ""}
                                className="cursor-pointer"
                                onSelect={() => {
                                  if (
                                    isWaitReceiveDocument ||
                                    document.confidential
                                  )
                                    return;
                                  setDocument((prev) => ({
                                    ...prev,
                                    placeSendId: item.id,
                                  }));
                                  onChangePlaceSend({ isInteracted: true });
                                  setPlaceSendPopoverOpen(false);
                                }}
                              >
                                <CheckIcon
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    document.placeSendId === item.id
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                <span className="truncate">
                                  {item.name || ""}
                                </span>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {errors.bookId && (
                    <p className="text-red-500 text-sm">
                      Sổ văn bản là bắt buộc
                    </p>
                  )}
                  {!validPlaceSend && (
                    <p className="text-red-500 text-sm">
                      Nơi gửi cần phải được nhập
                    </p>
                  )}
                </div>
                {(!document.id || document.id === 0) && (
                  <div className="space-y-1">
                    <Label htmlFor="placeSendOthers" className="font-bold">
                      Thêm mới cơ quan ban hành
                    </Label>
                    <Input
                      value={document.placeSendOthers}
                      className="bg-white"
                      onChange={(e) => {
                        const value = e.target.value;
                        setDocument({
                          ...document,
                          placeSendOthers: value,
                        });
                        setValidPlaceSend(!!value);
                      }}
                      disabled={isWaitReceiveDocument || document.confidential}
                      placeholder="Nhập cơ quan ban hành"
                    />
                  </div>
                )}
                <div className="space-y-1">
                  <Label htmlFor="docTypeId" className="font-bold">
                    Loại văn bản <span className="text-red-500">*</span>
                  </Label>
                  <div className="flex-1 min-w-0">
                    <SelectCustom
                      className="bg-white"
                      value={document.docTypeId?.toString() || ""}
                      onChange={(value) =>
                        setDocument((prev) => ({
                          ...prev,
                          docTypeId: Number(value as string),
                        }))
                      }
                      options={docTypeCategory.map((item) => ({
                        label: item.name,
                        value: item.id.toString(),
                      }))}
                      placeholder={
                        document.confidential ? "*****" : "Chọn loại văn bản"
                      }
                      disabled={document.confidential}
                      defaultValue={
                        docTypeCategory.length > 0
                          ? docTypeCategory[0].id.toString()
                          : ""
                      }
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="urgentId" className="font-bold">
                    Độ khẩn
                  </Label>
                  <div className="flex-1 min-w-0">
                    <SelectCustom
                      className="bg-white"
                      value={document.urgentId?.toString() || ""}
                      defaultValue={
                        urgentCategory.length > 0
                          ? urgentCategory[0].id.toString()
                          : ""
                      }
                      onChange={(value) => {
                        if (value !== document.urgentId?.toString()) {
                          setDocument((prev) => ({
                            ...prev,
                            urgentId: Number(value as string),
                          }));
                        }
                      }}
                      options={urgentCategory.map((item) => ({
                        label: item.name,
                        value: item.id.toString(),
                      }))}
                      disabled={
                        document.confidential || currentTab === "waitTab"
                      }
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="methodReceiptId" className="font-bold">
                    Phương thức nhận
                  </Label>
                  <div className="flex-1 min-w-0">
                    <SelectCustom
                      className="bg-white"
                      value={document.methodReceiptId?.toString() || ""}
                      defaultValue={
                        methodReceiptCategory.length > 0
                          ? methodReceiptCategory[0].id.toString()
                          : ""
                      }
                      onChange={(value) => {
                        setDocument((prev) => ({
                          ...prev,
                          methodReceiptId: Number(value as string),
                        }));
                        selectVb(Number(value as string));
                      }}
                      options={methodReceiptCategory.map((item) => ({
                        label: item.name,
                        value: item.id.toString(),
                      }))}
                      disabled={isWaitReceiveDocument || document.confidential}
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="securityId" className="font-bold">
                    Độ mật
                  </Label>
                  <SelectCustom
                    className="bg-white"
                    value={document.securityId?.toString() || ""}
                    defaultValue={
                      securityCategoryData?.length
                        ? securityCategoryData[0].id.toString()
                        : ""
                    }
                    onChange={(value) => {
                      setDocument((prev) => ({
                        ...prev,
                        securityId: Number(value as string),
                      }));
                      checkedEntry();
                    }}
                    options={(securityCategoryFilter.length > 0
                      ? securityCategoryFilter
                      : securityCategoryData || []
                    ).map((item) => ({
                      label: item.name,
                      value: item.id.toString(),
                    }))}
                    disabled={document.confidential || currentTab === "waitTab"}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {model.objects.map((item) => (
                  <div key={item.id} className="space-y-1">
                    <Label htmlFor={item.id.toString()} className="font-bold">
                      {item.label}{" "}
                      {item.required && <span className="text-red-500">*</span>}
                    </Label>
                    {item.type === "text" && (
                      <Input
                        className="bg-white"
                        value={item.value || ""}
                        onChange={(e) => (item.value = e.target.value)}
                        placeholder={item.placeholder}
                        required={item.required}
                        disabled={document.confidential}
                      />
                    )}
                    {item.type === "number" && (
                      <Input
                        className="bg-white"
                        type="number"
                        value={item.value || ""}
                        onChange={(e) => (item.value = e.target.value)}
                        min={item.min}
                        max={item.max}
                        placeholder={item.placeholder}
                        disabled={document.confidential}
                      />
                    )}
                    {item.type === "date" && (
                      <CustomDatePicker
                        selected={item.value ? new Date(item.value) : null}
                        onChange={(date) => {
                          item.value = date
                            ? new Date(
                                `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
                              )
                            : "";
                        }}
                        readOnly={!!document.confidential}
                        placeholder="dd/MM/yyyy"
                      />
                    )}
                    {item.type === "datetime-local" && (
                      <Input
                        type="datetime-local"
                        className="bg-white"
                        value={item.value || ""}
                        onChange={(e) => (item.value = e.target.value)}
                        disabled={document.confidential}
                      />
                    )}
                    {item.type === "textarea" && (
                      <Textarea
                        className="bg-white"
                        value={item.value || ""}
                        onChange={(e) => (item.value = e.target.value)}
                        placeholder={item.placeholder}
                        disabled={document.confidential}
                      />
                    )}
                    {item.type === "autocomplete" && (
                      <div className="flex-1 min-w-0">
                        <SelectCustom
                          className="bg-white"
                          value={item.value || ""}
                          defaultValue={
                            item.fieldOption.length > 0
                              ? item.fieldOption[0].value
                              : ""
                          }
                          onChange={(value) => (item.value = value)}
                          disabled={document.confidential}
                          options={item.fieldOption.map((v: any) => ({
                            label: v.label,
                            value: v.value,
                          }))}
                        />
                      </div>
                    )}
                    {item.type === "checkbox" && (
                      <div className="flex flex-wrap gap-2">
                        {item.fieldOption.map((v: any) => (
                          <div
                            key={v.value}
                            className="flex items-center gap-2"
                          >
                            <Checkbox
                              className="bg-white"
                              checked={v.selected}
                              onCheckedChange={(checked) =>
                                (v.selected = !!checked)
                              }
                              disabled={document.confidential}
                            />
                            <Label>{v.label}</Label>
                          </div>
                        ))}
                      </div>
                    )}
                    {item.type === "radio" && (
                      <div className="flex flex-wrap gap-2">
                        {item.fieldOption.map((v: any) => (
                          <div
                            key={v.value}
                            className="flex items-center gap-2"
                          >
                            <Checkbox
                              className="bg-white"
                              checked={item.value === v.value}
                              onCheckedChange={() => (item.value = v.value)}
                              disabled={document.confidential}
                            />
                            <Label>{v.label}</Label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-1">
                  <Label htmlFor="preview" className="font-bold">
                    Trích yếu <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    className="bg-white"
                    value={document.preview}
                    onChange={(e) =>
                      setDocument({ ...document, preview: e.target.value })
                    }
                    rows={3}
                    disabled={isWaitReceiveDocument || document.confidential}
                  />
                  {errors.preview && !document.preview && (
                    <p className="text-red-500 text-sm">
                      Trích yếu là bắt buộc
                    </p>
                  )}
                </div>
                <div className="space-y-1">
                  <Label htmlFor="fileAttach" className="font-bold">
                    Danh sách tệp đính kèm
                  </Label>
                  <div className="border rounded-md p-2 min-h-[80px]">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        className="bg-[#22c6ab] text-white"
                      >
                        {isCheckOpenDownLoadFileEncrypt ? (
                          <Label
                            className="flex items-center gap-2 cursor-pointer"
                            onClick={() => doSelectFileEncrypt("document")}
                          >
                            <File className="h-4 w-4" /> Chọn tệp
                          </Label>
                        ) : (
                          <Label
                            htmlFor="upload-photo1"
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <File className="h-4 w-4" /> Chọn tệp
                          </Label>
                        )}
                      </Button>
                      <Button
                        onClick={callScanService}
                        variant="secondary"
                        disabled={document.confidential}
                        className="flex items-center gap-2 bg-[#22c6ab] text-white"
                      >
                        <Printer className="h-4 w-4" /> Scan tài liệu
                      </Button>
                      <input
                        ref={fileInputRef}
                        id="upload-photo1"
                        type="file"
                        multiple
                        accept={Constant.ALLOWED_FILE_EXTENSION}
                        onChange={(e) => doSelectFiles(e, "document")}
                        disabled={document.confidential}
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
                        Số lượng file tối đa cho phép là 100.
                      </p>
                    )}
                    <div className="mt-2 space-y-2">
                      {selectedFiles.map((file, i) => (
                        <div key={i} className="flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[14px]">
                              {file.displayName || file.name}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            {(canViewNoStatus(file.name) ||
                              (canViewNoStatus(file.name) && file.encrypt)) && (
                              <TooltipWrapper title="Xem">
                                <Button
                                  variant="ghost"
                                  onClick={() => viewFile(file, i)}
                                  size="icon"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              </TooltipWrapper>
                            )}
                            {file.id &&
                              (!encryptShowing || isClericalRoleState) && (
                                <TooltipWrapper title="Tải Xuống">
                                  <Button
                                    variant="ghost"
                                    onClick={() =>
                                      downloadFile(
                                        file.name,
                                        file?.encrypt || false
                                      )
                                    }
                                    size="icon"
                                  >
                                    <Download className="h-4 w-4" />
                                  </Button>
                                </TooltipWrapper>
                              )}
                            {!file.id && !encryptShowing && (
                              <Button
                                variant="ghost"
                                onClick={() => ocrFile(file)}
                                size="icon"
                              >
                                OCR
                              </Button>
                            )}
                            {Constant.ENCRYPTION_TWD &&
                              file.atmType !== "RESOLVED_FILE" &&
                              !isCheckEncrypt && (
                                <TooltipWrapper title="Mã hóa tệp tin">
                                  <KeyRound className="h-4 w-4 text-gray-500" />
                                </TooltipWrapper>
                              )}
                            {Constant.ENCRYPTION_TWD &&
                              file.atmType !== "RESOLVED_FILE" &&
                              isCheckEncrypt && (
                                <TooltipWrapper title="Mã hóa tệp tin">
                                  <KeyRound className="h-4 w-4 text-red-500" />
                                </TooltipWrapper>
                              )}
                            {Constant.ENCRYPTION_TWD && (
                              <Checkbox
                                checked={file.encrypt}
                                onCheckedChange={() => changeEncrypt(file)}
                                disabled={!!file.id && !!file.oEncrypt}
                                hidden={true}
                              />
                            )}
                            {!file.encrypt && !isWaitReceiveDocument && (
                              <TooltipWrapper title="Xóa">
                                <Button
                                  variant="ghost"
                                  onClick={() => {
                                    setConfirmConfig({
                                      title: "Hãy xác nhận",
                                      description: `Tệp ${file?.name} sẽ được xóa khỏi dữ liệu?`,
                                      confirmText: "Xóa",
                                      cancelText: "Hủy",
                                      onConfirm: () =>
                                        doRemoveFile(
                                          i as unknown as number,
                                          "document",
                                          file as any,
                                          "upload-photo1"
                                        ),
                                    });
                                    setConfirmOpen(true);
                                  }}
                                  size="icon"
                                  disabled={isWaitReceiveDocument}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              </TooltipWrapper>
                            )}
                            {file.encrypt &&
                              canViewNoStatus(file.name) &&
                              file.id != undefined && (
                                <Button
                                  variant="ghost"
                                  onClick={() =>
                                    signFileEncrypt(
                                      documentDetail.document?.id ||
                                        document.id!,
                                      file.name,
                                      file.encrypt || false,
                                      file.id!
                                    )
                                  }
                                  size="icon"
                                >
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              )}
                            {file.documentId &&
                              isVerifierPDF(file) &&
                              !file.encrypt && (
                                // Assume PdfSign component
                                <DigitalSign
                                  fileId={file.id!}
                                  fileName={file.name}
                                  skips={[PdfSignType.ISSUED]}
                                  attachmentType={
                                    Constant.ATTACHMENT_DOWNLOAD_TYPE
                                      .DOCUMENT_OUT
                                  }
                                />
                              )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4">
                <div className="space-y-1">
                  <Label htmlFor="orgReceiveDocument" className="font-bold">
                    Đơn vị nhận lưu
                  </Label>
                  <Input
                    className="bg-white"
                    value={document.orgReceiveDocument || ""}
                    onChange={(e) =>
                      setDocument({
                        ...document,
                        orgReceiveDocument: e.target.value,
                      })
                    }
                    disabled={isWaitReceiveDocument || document.confidential}
                  />
                </div>
              </div>
            </div>
          </div>
          {hasComment && (
            <div className="border rounded-md p-4">
              {/* DocumentOutComment component */}
              <DocumentOutCommentsSection
                id={Number(document.id!)}
                allowAttachments
                setNewComment={setNewComment}
                newComment={newComment}
              />
            </div>
          )}
        </div>

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
                <Label htmlFor="docName" className="font-bold">
                  Nhập tên tài liệu <span className="text-red-500">*</span>
                </Label>
                <Input
                  value={docName}
                  onChange={(e) => setDocName(e.target.value)}
                  disabled={fileScanner.length > 0}
                  required
                  maxLength={200}
                  className="bg-white"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="docTypeScan" className="font-bold">
                  Chọn định dạng tài liệu{" "}
                  <span className="text-red-500">*</span>
                </Label>
                <SelectCustom
                  value={docTypeScan}
                  defaultValue="get pdf"
                  onChange={(value) => setDocTypeScan(value as string)}
                  disabled={fileScanner.length > 0}
                  options={[
                    { label: "--Chọn--", value: "" },
                    { label: "PDF", value: "get pdf" },
                    { label: "PNG", value: "get png" },
                  ]}
                  className="bg-white"
                />
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  disabled={fileScanner.length > 0}
                  className="flex items-center gap-2"
                >
                  <Printer className="h-4 w-4" /> Scan
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {encryptProcessLoading && !decryptionProgress.error && (
          <EncryptProcessOverlay
            isOpen={encryptProcessLoading}
            progress={decryptionProgress}
          />
        )}
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

        {!decryptionProgress.error &&
          (decryptionProgress.isDownLoad ? (
            <LoadingOverlay
              isOpen={isShowLoadingDeEncrypt}
              isLoading={decryptionProgress.isDownLoad}
              text={"Đang tải tệp..."}
            />
          ) : (
            <DecryptOverlay
              isOpen={isShowLoadingDeEncrypt}
              progress={decryptionProgress}
              onForceDisconnect={doForceDisconnect}
            />
          ))}
        <UploadEncryptOverlay
          isOpen={isShowChooseEncrypt}
          progress={uploadEncryptionProgress}
          onForceDisconnect={doForceDisconnect}
        />

        <DownloadingOverlay
          isOpen={isdownloadFile}
          fileName={nameFileDownload}
          onCancel={onCancelDownload}
        />

        {/* {(isLoading || loading) && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        )} */}
        <PdfViewerDialog
          isOpen={isShowPreviewPdf}
          onOpenChange={setIsShowPreviewPdf}
          name={filePreview.file?.name}
          blob={filePreview.blob}
        />
        <LoadingFull isLoading={isLoading || loading} />
      </form>
      {/* Generic confirm dialog (replace commonUtils.showPopupConfirm) */}
      <ConfirmDeleteDialog
        isOpen={confirmOpen}
        onOpenChange={setConfirmOpen}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        description={confirmConfig.description}
        confirmText={confirmConfig.confirmText}
        cancelText={confirmConfig.cancelText}
      />
    </div>
  );
};

export default DocumentOutInsert;
