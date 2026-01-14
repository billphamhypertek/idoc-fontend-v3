"use client";

import AttachmentDialog2 from "@/components/common/AttachmentDialog2";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import { SearchInput } from "@/components/document-in/SearchInput";
import DocumentOutAskidea from "@/components/document-out/DocumentOutAskidea";
import DocumentOutDeadline from "@/components/document-out/DocumentOutDeadline";
import DocumentOutEvaluate from "@/components/document-out/DocumentOutEvaluate";
import DocumentOutRetakeByStep from "@/components/document-out/DocumentOutRetakeByStep";
import DocumentProcessDone from "@/components/document-out/DocumentProcessDone";
import DocumentReject from "@/components/document-out/DocumentReject";
import EncryptDisplaySelect from "@/components/document-out/EncryptDisplaySelect";
import AdvancedSearch from "@/components/document-out/list/AdvancedSearch";
import RetakeDoneDocument from "@/components/document-out/RetakeDoneDocument";
import { SwitchAndAddUser } from "@/components/document-out/SwitchAndAddUser";
import { TransferDocumentOut } from "@/components/document-out/TransferDocumentOut";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import SelectCustom from "@/components/common/SelectCustom";
import { Table } from "@/components/ui/table";
import { Constant } from "@/definitions/constants/constant";
import type {
  DocumentOutItem,
  FindDocByTypeHandleParams,
} from "@/definitions/types/document-out.type";
import type { Column } from "@/definitions/types/table.type";
import { useGetStartNodes, useGetNextNodes } from "@/hooks/data/bpmn.data";
import {
  DocumentOutMode,
  DocumentOutStatus,
  useGetDocumentOutListByStatus,
  useToggleImportant,
} from "@/hooks/data/document-out.data";
import { useFileViewer } from "@/hooks/useFileViewer";
import { downloadFileTable } from "@/services/file.service";
import { canViewNoStatus, toDateOnly } from "@/utils/common.utils";
import { formatDate } from "@/utils/datetime.utils";
import { cn } from "@/lib/utils";
import {
  CheckCircle,
  Clock,
  FileCheck,
  Paperclip,
  MessageCircle,
  Search,
  Star,
  Plus,
  RotateCcw,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useGetCategoriesByCode } from "@/hooks/data/category.data";
import { EmptyDocument } from "@/components/common/EmptyDocument";
import { useEncryptStore } from "@/stores/encrypt.store";
import { EncryptionService } from "@/services/encryption.service";
import WorkAssignDialog from "@/components/work-assign/createDialog";
import { queryKeys } from "@/definitions/constants/queryKey.constants";
import { useQueryClient } from "@tanstack/react-query";
import DocumentOutRetakeModal from "@/components/retake/DocumentOutRetake";
import { SharedService } from "@/services/shared.service";

type StatusKey = "toKnow_waitHandleTab" | "toKnow_handlingTab" | "doneTab";
const STATUS_LABEL: Record<StatusKey, { label: string; icon: any }> = {
  toKnow_waitHandleTab: { label: "Chưa xử lý", icon: Clock },
  toKnow_handlingTab: { label: "Đã xử lý", icon: CheckCircle },
  doneTab: { label: "Hoàn thành", icon: FileCheck },
};
const STATUS_MAP: Record<StatusKey, DocumentOutStatus> = {
  toKnow_waitHandleTab: DocumentOutStatus.TODO,
  toKnow_handlingTab: DocumentOutStatus.PROCESSED,
  doneTab: DocumentOutStatus.DONE,
};

const defaultAdvanceSearchState = {
  preview: "",
  docTypeId: "",
  docFieldsId: "",
  important: "",
  expired: "",
};

const DATE_FILTER_OPTIONS = [
  { value: null, label: "Tất cả" },
  { value: 15, label: "15 ngày" },
  { value: 30, label: "30 ngày" },
];

export default function DocumentOutKnowPage() {
  const router = useRouter();
  const { isEncrypt } = useEncryptStore();
  const sp = useSearchParams();
  const currentTab = sp?.get("currentTab");
  const paramPage = sp?.get("page");
  const paramSize = sp?.get("size");
  useEffect(() => {
    if (currentTab) setStatus(currentTab as StatusKey);
    if (paramSize) setItemsPerPage(Number(paramSize));
    if (paramPage) setPage(Number(paramPage));
  }, [sp]);
  const { viewFile } = useFileViewer();
  const { mutate: toggleImportant } = useToggleImportant();
  const { data: docTypeCategory } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.DOC_TYPE
  );
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<StatusKey>("toKnow_waitHandleTab");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [sortBy, setSortBy] = useState("");
  const [sortDirection, setSortDirection] = useState<"ASC" | "DESC">("DESC");
  const [dateSearch, setDateSearch] = useState<number | null>(null);
  const [isAdvancedSearchExpanded, setIsAdvancedSearchExpanded] =
    useState(false);
  const [advancedSearch, setAdvancedSearch] = useState(
    defaultAdvanceSearchState
  );
  const [tempAdvancedSearch, setTempAdvancedSearch] = useState(
    defaultAdvanceSearchState
  );
  const [openAttach, setOpenAttach] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState<any[]>([]);

  const [showSwitchUserModal, setShowSwitchUserModal] = useState(false);
  const [showAskIdeaModal, setShowAskIdeaModal] = useState(false);
  const [showDeadlineModal, setShowDeadlineModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showEvaluateModal, setShowEvaluateModal] = useState({
    open: false,
    isEvaluate: false,
  });
  const [showRetakeByStepModal, setShowRetakeByStepModal] = useState(false);
  const [showRetakeDoneModal, setShowRetakeDoneModal] = useState(false);
  const [showRetakeModal, setShowRetakeModal] = useState(false);
  const [showProcessDoneModal, setShowProcessDoneModal] = useState({
    open: false,
    isFinishReceive: false,
  });
  const [listNextNodeOrg, setListNextNodeOrg] = useState<any[]>([]);
  const [listNextNode, setListNextNode] = useState<any[]>([]);

  useEffect(() => {
    if (isEncrypt) {
      EncryptionService.isCheckStartUsbTokenWatcher();
    }
  }, [isEncrypt]);

  const handleDateSearchChange = (value: string) => {
    const numValue = value === "all" ? null : Number(value);
    setDateSearch(numValue);
    setPage(1);
  };

  const isCanHandleDoc = !isEncrypt;

  const isStarred = (r: DocumentOutItem) => Boolean(r.important);
  const onStarClick = (r: DocumentOutItem) => {
    toggleImportant({ docId: r.docId, important: !isStarred(r) });
  };

  const handleAttachmentClick = (row: DocumentOutItem) => {
    if (row.attachments?.length === 1) {
      const attachment = row.attachments[0];
      if (canViewNoStatus(attachment.name)) {
        viewFile(attachment.name, "", true, Constant.ATTACHMENT.DOWNLOAD);
      } else {
        downloadFileTable(attachment.name, attachment?.displayName ?? "");
      }
      return;
    } else {
      setSelectedAttachments(row.attachments || []);
      setOpenAttach(true);
    }
  };
  const params: FindDocByTypeHandleParams = useMemo(() => {
    const baseParams = {
      dayLeft: "",
      page,
      sortBy,
      direction: sortDirection,
      posId: "",
      size: itemsPerPage,
      dateSearch,
    };

    if (isAdvancedSearchExpanded) {
      return {
        ...baseParams,
        preview: advancedSearch.preview,
        docTypeId: advancedSearch.docTypeId,
        docFieldsId: advancedSearch.docFieldsId,
        important: advancedSearch.important,
        expired: advancedSearch.expired,
      };
    } else {
      return {
        ...baseParams,
        text,
      };
    }
  }, [
    text,
    page,
    itemsPerPage,
    status,
    sortBy,
    sortDirection,
    isAdvancedSearchExpanded,
    advancedSearch,
    dateSearch,
  ]);

  const { data, isLoading, isError, error } = useGetDocumentOutListByStatus(
    STATUS_MAP[status],
    params,
    DocumentOutMode.KNOW
  );

  const rows = data?.objList ?? [];
  const total = data?.totalRecord ?? 0;

  const selectedList = useMemo(() => {
    // return selectedRowKeys.map((key) => rows.find((r) => r.docId === key));//dòng trên đúng
    return selectedRowKeys.map((key) => rows.find((r: any) => r.docId === key));
  }, [selectedRowKeys, rows]);

  const selectedDocuments = useMemo(
    () => rows.filter((r) => selectedRowKeys.includes(r.docId)),
    [rows, selectedRowKeys]
  );

  // Get processNode from first selected document
  const currentProcessNode = useMemo(() => {
    return selectedList?.[0]?.processNode || null;
  }, [selectedList]);

  // Fetch start nodes when no processNode (Angular: if (!this.docCurrentNode || this.docCurrentNode == 0))
  const { data: startNodes } = useGetStartNodes(
    "INCOMING",
    false,
    !!(selectedList?.[0] && (!currentProcessNode || currentProcessNode === 0))
  );

  // Fetch next nodes when has processNode (Angular: await this.getNextNode(this.docCurrentNode))
  const { data: nextNodes } = useGetNextNodes(
    currentProcessNode && currentProcessNode > 0 ? currentProcessNode : null
  );

  useEffect(() => {
    // Use nextNodes if available (has processNode), otherwise use startNodes
    const nodesToUse = nextNodes || startNodes;
    if (!nodesToUse) {
      setListNextNode([]);
      setListNextNodeOrg([]);
      return;
    }

    const nonMulti = nodesToUse.filter(
      (x: any) => !x.allowMultiple && !x.lastNode
    );
    const multi = nodesToUse.filter((x: any) => x.allowMultiple);
    setListNextNode(nonMulti);
    setListNextNodeOrg(multi);
  }, [startNodes, nextNodes]);

  const currentDocument = useMemo(() => {
    if (selectedRowKeys.length !== 1) return null;
    return rows.find((r) => r.docId === selectedRowKeys[0]) ?? null;
  }, [rows, selectedRowKeys]);

  const defaultBtnStatus = useMemo(
    () => ({
      canAsk: false,
      canDone: false,
      canReply: false,
      canReview: false,
      canRequestReview: false,
      canReturn: false,
      canTransfer: false,
      canRetake: false,
      canRetakeDone: false,
      canSwitchOrAdd: false,
      canOrgTransfer: false,
      canFinish: false,
      canRead: false,
    }),
    []
  );

  const [buttonStatus, setButtonStatus] = useState(defaultBtnStatus);

  // Derive buttonStatus from selected documents (parity with Angular isSelected logic)
  useEffect(() => {
    const len = selectedDocuments.length;
    if (len === 0) {
      setButtonStatus(defaultBtnStatus);
      return;
    }

    // Angular: if currentTab == 'doneTab' => hideButton(true) - disable all buttons
    if (status === "doneTab") {
      setButtonStatus(defaultBtnStatus);
      return;
    }

    const everyHas = (prop: keyof typeof defaultBtnStatus) =>
      selectedDocuments.every((d) => (d as any)?.button?.[prop]);

    const derived = { ...defaultBtnStatus };

    // Determine if multi-transfer allowed (Angular MULTI_TRANSFER_H05 parity)
    const multiTransferAllowed = (Constant as any).MULTI_TRANSFER_H05 === true;
    const allSameProcessNode = selectedDocuments.every(
      (d) => d.processNode === selectedDocuments[0].processNode
    );

    // Transfer & Done logic:
    if (len === 1) {
      derived.canTransfer = everyHas("canTransfer");
      derived.canDone = everyHas("canDone");
    } else if (
      multiTransferAllowed &&
      (status === "toKnow_waitHandleTab" || status === "toKnow_handlingTab") &&
      allSameProcessNode
    ) {
      // For multi selection only if every doc supports
      derived.canTransfer = everyHas("canTransfer");
      derived.canDone = everyHas("canDone");
    }

    // Org transfer only when every doc supports and multi allowed
    if (len === 1) {
      derived.canOrgTransfer = everyHas("canOrgTransfer");
    } else if (
      multiTransferAllowed &&
      status === "toKnow_waitHandleTab" &&
      allSameProcessNode
    ) {
      derived.canOrgTransfer = everyHas("canOrgTransfer");
    }

    // Single-selection-only buttons (Angular hideButton behavior)
    if (len === 1) {
      const b = (selectedDocuments[0] as any)?.button || {};
      derived.canAsk = !!b.canAsk;
      derived.canReturn = !!b.canReturn;
      derived.canRetake = !!b.canRetake;
      derived.canRetakeDone = !!b.canRetakeDone;
      derived.canSwitchOrAdd = !!b.canSwitchOrAdd;
      derived.canFinish = !!b.canFinish;
      derived.canReview = !!b.canReview;
      derived.canRequestReview = !!b.canRequestReview;
    }

    if (
      Constant.MULTI_TRANSFER_H05 &&
      selectedDocuments.length > 0 &&
      (status == "toKnow_waitHandleTab" || status == "toKnow_handlingTab")
    ) {
      derived.canDone = true;
      derived.canTransfer = true;
      derived.canRead = true;
      selectedDocuments.forEach((e) => {
        if (!e?.button?.canDone) {
          derived.canDone = false;
        }
        if (!e?.button?.canTransfer) {
          derived.canTransfer = false;
        }
        if (!e?.button?.canRead) {
          derived.canRead = false;
        }
      });
    }
    setButtonStatus(derived);
  }, [selectedDocuments, status, defaultBtnStatus]);

  const onTableSort = (
    config: { key: string; direction: "asc" | "desc" | null } | null
  ) => {
    if (!config || !config.direction) {
      setSortBy("");
      setSortDirection("DESC");
      return;
    }
    const mappedDirection = config.direction === "asc" ? "ASC" : "DESC";
    setSortBy(config.key);
    setSortDirection(mappedDirection);
    setPage(1);
    router.push(
      `/document-out/know?page=1&size=${itemsPerPage}&currentTab=${status}`
    );
  };

  const getStatusColors = (statusName: string) => {
    const status = statusName?.toLowerCase() || "";

    if (status.includes("đang xử lý") || status.includes("xử lý")) {
      return {
        bg: "bg-red-200",
        text: "text-red-900",
      };
    } else if (status.includes("trả lại")) {
      return {
        bg: "bg-yellow-200",
        text: "text-yellow-900",
      };
    } else if (status.includes("quá hạn")) {
      return {
        bg: "bg-red-600",
        text: "text-white",
      };
    } else if (
      status.includes("hạn xử lý không quá 3 ngày") ||
      status.includes("hạn xử lý <= 3 ngày")
    ) {
      return {
        bg: "bg-blue-600",
        text: "text-white",
      };
    } else if (
      status.includes("hạn xử lý hơn 3 ngày") ||
      status.includes("Hạn xử lý hơn 3 ngày")
    ) {
      return {
        bg: "bg-black",
        text: "text-white",
      };
    }

    return {
      bg: "bg-gray-100",
      text: "text-gray-900",
    };
  };

  const currentDeadlineDateOnly: string | undefined = toDateOnly(
    selectedList?.[0]?.deadline as number | string | null | undefined
  );

  const allPageSelected = useMemo(
    () =>
      rows.length > 0 && rows.every((r) => selectedRowKeys.includes(r.docId)),
    [rows, selectedRowKeys]
  );

  const getRowBackgroundColor = (item: DocumentOutItem) => {
    const statusName = (
      item.pstatusName ??
      item.docStatusName ??
      ""
    ).toLowerCase();

    if (statusName.includes("đang xử lý")) {
      return "bg-red-200";
    } else if (statusName.includes("trả lại")) {
      return "bg-yellow-200";
    } else if (statusName.includes("quá hạn")) {
      return "bg-red-600";
    } else if (
      statusName.includes("hạn xử lý không quá 3 ngày") ||
      statusName.includes("hạn xử lý <= 3 ngày")
    ) {
      return "bg-blue-600";
    } else if (
      statusName.includes("hạn xử lý hơn 3 ngày") ||
      statusName.includes("Hạn xử lý hơn 3 ngày")
    ) {
      return "bg-black";
    }

    return "bg-gray-100";
  };

  const getRowTextColor = (item: DocumentOutItem) => {
    const statusName = (
      item.pstatusName ??
      item.docStatusName ??
      ""
    ).toLowerCase();

    if (
      statusName.includes("quá hạn") ||
      statusName.includes("hạn xử lý không quá 3 ngày") ||
      statusName.includes("hạn xử lý <= 3 ngày") ||
      statusName.includes("hạn xử lý hơn 3 ngày") ||
      statusName.includes("Hạn xử lý hơn 3 ngày")
    ) {
      return "text-white";
    }

    return "text-gray-900";
  };

  const leadingCols: Column<DocumentOutItem>[] = [
    {
      header: (
        <div className="flex items-center justify-center gap-3">
          <span>STT</span>
          {status === "toKnow_waitHandleTab" && !isEncrypt && (
            <Checkbox
              checked={allPageSelected}
              onCheckedChange={() => {
                setSelectedRowKeys((prev) => {
                  const pageKeys: React.Key[] = rows.map(
                    (r) => r.docId as React.Key
                  );
                  if (!allPageSelected) {
                    return Array.from(
                      new Set<React.Key>([...prev, ...pageKeys])
                    );
                  }
                  const pageSet = new Set<React.Key>(pageKeys);
                  return prev.filter((k) => !pageSet.has(k));
                });
              }}
              onClick={(e) => e.stopPropagation()}
              aria-label="Chọn tất cả"
            />
          )}
        </div>
      ),
      accessor: (r, idx) => {
        const stt = (page - 1) * itemsPerPage + idx + 1;
        const checked = selectedRowKeys.includes(r.docId);
        return (
          <div className="flex items-center justify-center gap-3">
            <span>{stt}</span>
            <Checkbox
              checked={checked}
              onCheckedChange={(v) =>
                setSelectedRowKeys((prev) =>
                  v
                    ? Array.from(new Set([...prev, r.docId]))
                    : prev.filter((k) => k !== r.docId)
                )
              }
              onClick={(e) => e.stopPropagation()}
              aria-label={`Chọn hàng ${stt}`}
            />
          </div>
        );
      },
      className: "text-center w-[90px]",
      sortable: false,
    },
    {
      header: <Star className="h-4 w-4 stroke-gray-400 stroke-2" />,
      sortKey: "IMPORTANT",
      type: "actions",
      className: "text-center w-10",
      renderActions: (r) => {
        const starred = isStarred(r);
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStarClick(r);
            }}
            aria-label={starred ? "Bỏ đánh dấu" : "Đánh dấu"}
            title={starred ? "Bỏ đánh dấu" : "Đánh dấu"}
            className="inline-flex items-center justify-center"
          >
            <Star
              className={
                "h-4 w-4 " +
                (starred
                  ? "fill-yellow-400 stroke-yellow-600 stroke-2"
                  : "stroke-gray-400 stroke-2")
              }
            />
          </button>
        );
      },
    },
  ];

  const columnsTodo: Column<DocumentOutItem>[] = [
    ...leadingCols,
    {
      header: "Ngày văn bản",
      sortKey: "DATE_ARRIVAL",
      accessor: (r) => formatDate(r.dateArrival),
      className: "text-center whitespace-nowrap tabular-nums w-48 py-2",
    },
    {
      header: "Ngày văn bản đến",
      sortKey: "DATEISSUED",
      accessor: (r) => formatDate(r.dateIssued ?? r.dateArrival),
      className: "text-center whitespace-nowrap tabular-nums w-48 py-2",
    },
    {
      header: "Số đến",
      sortKey: "NUMBER_ARRIVAL",
      accessor: (r) => r.numberArrival ?? "",
      className: "text-center w-[80px]",
    },
    {
      header: "Trích yếu",
      sortKey: "PREVIEW",
      accessor: (r) => (
        <div
          title={r.preview ?? ""}
          className="max-w-[700px] line-clamp-2 text-sm leading-relaxed text-ellipsis"
        >
          {r.preview}
        </div>
      ),
      className: "text-left min-w-[300px] w-[45%]",
    },
    {
      header: "Đính kèm",
      sortable: false,
      accessor: (r) => (
        <div className="flex items-center justify-center">
          {(r.attachments?.length ?? 0) > 0 ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleAttachmentClick(r);
              }}
              className="flex items-center justify-center gap-1 text-blue-600 hover:underline"
              title={`Có ${r.attachments?.length} tệp đính kèm`}
            >
              <Paperclip className="w-4 h-4 text-blue-600" />
            </button>
          ) : (
            ""
          )}
        </div>
      ),
      className: "text-center w-[90px]",
    },
    {
      header: "Độ mật",
      sortKey: "SECURITY_NAME",
      accessor: (r) => r.securityName ?? "",
      className: "text-center w-[90px]",
    },
    {
      header: "Độ khẩn",
      sortable: false,
      accessor: (r) => {
        const urgentName = r.urgentName ?? "";
        return (
          <span
            className={
              urgentName === "Hỏa tốc" ? "text-red-600 font-semibold" : ""
            }
          >
            {urgentName}
          </span>
        );
      },
      className: "text-center w-[90px]",
    },
    {
      header: "Số, KH của VB đến",
      sortable: false,
      accessor: (r) => r.numberArrivalStr ?? "",
      className: "text-left w-[150px]",
    },
    {
      header: "Hạn xử lý",
      sortKey: "DEADLINE",
      accessor: (r) => formatDate(r.deadline),
      className: "text-center whitespace-nowrap tabular-nums w-48 py-2",
    },
  ];

  const columnsProcessed: Column<DocumentOutItem>[] = [
    ...leadingCols,
    {
      header: "Ngày văn bản",
      sortKey: "DATE_ARRIVAL",
      accessor: (r) => formatDate(r.dateArrival),
      className: "text-center whitespace-nowrap tabular-nums w-48 py-2",
    },
    {
      header: "Ngày văn bản đến",
      sortKey: "DATEISSUED",
      accessor: (r) => formatDate(r.dateIssued),
      className: "text-center whitespace-nowrap tabular-nums w-48 py-2",
    },
    {
      header: "Ngày vào sổ",
      sortKey: "DATEISSUED",
      accessor: (r) => formatDate(r.receivedDate),
      className: "text-center whitespace-nowrap tabular-nums w-48 py-2",
    },
    {
      header: "Số đến",
      sortKey: "NUMBER_ARRIVAL",
      accessor: (r) => r.numberArrival ?? "",
      className: "text-center w-[70px]",
    },
    {
      header: "Trích yếu",
      sortKey: "PREVIEW",
      accessor: (r) => (
        <span
          title={r.preview ?? ""}
          className="max-w-[700px] line-clamp-2 text-sm leading-relaxed text-ellipsis"
        >
          {r.preview}
        </span>
      ),
      className: "text-left min-w-[300px] w-[45%]",
    },
    {
      header: "Đính kèm",
      sortable: false,
      accessor: (r) => (
        <div className="flex items-center justify-center">
          {(r.attachments?.length ?? 0) > 0 ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleAttachmentClick(r);
              }}
              className="flex items-center justify-center gap-1 text-blue-600 hover:underline"
              title={`Có ${r.attachments?.length} tệp đính kèm`}
            >
              <Paperclip className="w-4 h-4 text-blue-600" />
            </button>
          ) : (
            ""
          )}
        </div>
      ),
      className: "text-center w-[90px]",
    },
    {
      header: "Độ mật",
      sortKey: "SECURITY_NAME",
      accessor: (r) => r.securityName ?? "",
      className: "text-center w-[90px]",
    },
    {
      header: "Độ khẩn",
      sortable: false,
      accessor: (r) => {
        const urgentName = r.urgentName ?? "";
        return (
          <span
            className={
              urgentName === "Hỏa tốc" ? "text-red-600 font-semibold" : ""
            }
          >
            {urgentName}
          </span>
        );
      },
      className: "text-center w-[90px]",
    },
    {
      header: "Số, KH của VB đến",
      sortable: false,
      accessor: (r) => r.numberArrivalStr ?? "",
      className: "text-left w-[150px]",
    },
    {
      header: "Người xử lý",
      sortKey: "PERSON_HANDLE",
      accessor: (r) => r.nextHandle ?? "",
      className: "text-left w-[150px]",
    },
    {
      header: "Hạn xử lý",
      sortKey: "DEADLINE",
      accessor: (r) => formatDate(r.deadline),
      className: "text-center w-[120px]",
    },
    {
      header: "Trạng thái xử lý",
      sortKey: "STATUS",
      accessor: (r) => {
        const statusName = r.docStatusName ?? "";
        const colors = getStatusColors(statusName);
        return (
          <span
            className={`px-2 py-1 rounded-md text-xs font-medium ${colors.bg} ${colors.text}`}
          >
            {statusName}
          </span>
        );
      },
      className: "text-center w-[110px]",
    },
  ];

  const columnsDone: Column<DocumentOutItem>[] = [
    ...leadingCols,
    {
      header: "Ngày văn bản",
      sortKey: "DATE_ARRIVAL",
      accessor: (r) => formatDate(r.dateArrival),
      className: "text-center whitespace-nowrap tabular-nums w-48 py-2",
    },
    {
      header: "Ngày văn bản đến",
      sortKey: "DATEISSUED",
      accessor: (r) => formatDate(r.dateIssued),
      className: "text-center whitespace-nowrap tabular-nums w-48 py-2",
    },
    {
      header: "Ngày vào sổ",
      sortKey: "DATEISSUED",
      accessor: (r) => formatDate(r.receivedDate),
      className: "text-center w-48 py-2",
    },
    {
      header: "Số đến",
      sortKey: "NUMBER_ARRIVAL",
      accessor: (r) => r.numberArrival ?? "",
      className: "text-center w-[80px]",
    },
    {
      header: "Trích yếu",
      sortKey: "PREVIEW",
      accessor: (r) => (
        <span
          title={r.preview ?? ""}
          className="max-w-[700px] line-clamp-2 text-sm leading-relaxed text-ellipsis"
        >
          {r.preview}
        </span>
      ),
      className: "text-left min-w-[300px] w-[45%]",
    },
    {
      header: "Đính kèm",
      sortable: false,
      accessor: (r) => (
        <div className="flex items-center justify-center">
          {(r.attachments?.length ?? 0) > 0 ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleAttachmentClick(r);
              }}
              className="flex items-center justify-center gap-1 text-blue-600 hover:underline"
              title={`Có ${r.attachments?.length} tệp đính kèm`}
            >
              <Paperclip className="w-4 h-4 text-blue-600" />
            </button>
          ) : (
            ""
          )}
        </div>
      ),
      className: "text-center w-[90px]",
    },
    {
      header: "Độ mật",
      sortKey: "SECURITY_NAME",
      accessor: (r) => r.securityName ?? "",
      className: "text-center w-[90px]",
    },
    {
      header: "Độ khẩn",
      sortable: false,
      accessor: (r) => {
        const urgentName = r.urgentName ?? "";
        return (
          <span
            className={
              urgentName === "Hỏa tốc" ? "text-red-600 font-semibold" : ""
            }
          >
            {urgentName}
          </span>
        );
      },
      className: "text-center w-[90px]",
    },
    {
      header: "Số, KH của VB đến",
      sortable: false,
      accessor: (r) => r.numberArrivalStr ?? "",
      className: "text-left w-[150px]",
    },
    {
      header: "Hạn xử lý",
      sortKey: "DEADLINE",
      accessor: (r) => formatDate(r.deadline),
      className: "text-center w-[120px]",
    },
  ];

  // Angular shows continuous loading on error, not error message
  // This prevents UI breaking when sort by security returns error
  const showLoading = isLoading || isError;

  return (
    <div className="px-4 space-y-4">
      {/* Breadcrumb và Search cùng hàng */}
      <div className="flex items-center justify-between gap-4">
        <BreadcrumbNavigation
          items={[
            {
              label: "Văn bản đến",
            },
          ]}
          currentPage="Danh sách văn bản nhận để biết"
          showHome={false}
        />

        <div className="flex items-center gap-3">
          <SearchInput
            placeholder="Tìm kiếm Số, KH của VB đến | Trích yếu"
            value={text}
            setSearchInput={(v) => {
              setText(v);
              setPage(1);
              setIsAdvancedSearchExpanded(false);
              setAdvancedSearch(defaultAdvanceSearchState);
            }}
          />

          <SelectCustom
            options={DATE_FILTER_OPTIONS.map((option) => ({
              label: option.label,
              value: option.value?.toString() || "all",
            }))}
            value={dateSearch?.toString() || "all"}
            onChange={(val) => handleDateSearchChange(val as string)}
            className="w-32 h-8"
            placeholder="Lọc theo ngày"
          />

          <Button
            onClick={() => {
              const newExpanded = !isAdvancedSearchExpanded;
              setIsAdvancedSearchExpanded(newExpanded);
              if (!newExpanded) {
                setAdvancedSearch(defaultAdvanceSearchState);
                setPage(1);
              }
            }}
            className="h-8 py-1 px-3 text-xs transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700 hover:text-white border-none"
          >
            <Search className="mr-1 h-4 w-4" />
            {isAdvancedSearchExpanded
              ? "Thu gọn tìm kiếm"
              : "Tìm kiếm nâng cao"}
          </Button>
        </div>
      </div>

      {isAdvancedSearchExpanded && (
        <AdvancedSearch
          preview={tempAdvancedSearch.preview}
          onChangePreview={(v) =>
            setTempAdvancedSearch((p) => ({
              ...p,
              preview: v,
            }))
          }
          docTypeOptions={
            docTypeCategory
              ?.filter((item) => item.id !== null && item.id !== undefined)
              .map((item) => ({
                id: String(item.id),
                name: item.name,
              })) || []
          }
          docTypeId={tempAdvancedSearch.docTypeId}
          onChangeDocType={(val) =>
            setTempAdvancedSearch((p) => ({
              ...p,
              docTypeId: val === "all" ? "" : val,
            }))
          }
          important={tempAdvancedSearch.important}
          onChangeImportant={(val) =>
            setTempAdvancedSearch((p) => ({
              ...p,
              important: val === "all" ? "" : val,
            }))
          }
          expired={tempAdvancedSearch.expired}
          onChangeExpired={(val) =>
            setTempAdvancedSearch((p) => ({
              ...p,
              expired: val === "all" ? "" : val,
            }))
          }
          onSubmit={() => {
            setAdvancedSearch(tempAdvancedSearch);
            setPage(1);
          }}
          extraBtn={
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setTempAdvancedSearch(defaultAdvanceSearchState);
                  setAdvancedSearch(defaultAdvanceSearchState);
                  setPage(1);
                }}
                className="h-9 px-4 text-sm font-medium"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Đặt lại
              </Button>
            </>
          }
        />
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap items-center gap-2 mb-4 min-h-9">
        {selectedRowKeys.length === 1 &&
          buttonStatus.canSwitchOrAdd &&
          selectedList?.[0] &&
          Constant.SWITCH_AND_ADD_USER_BCY &&
          isCanHandleDoc && (
            <Button
              variant="outline"
              className="h-9 px-3 text-sm text-white bg-blue-600 hover:bg-blue-700 hover:text-white"
              onClick={() => setShowSwitchUserModal(true)}
            >
              Thêm xử lý
            </Button>
          )}

        {selectedRowKeys.length === 1 &&
          status === "toKnow_waitHandleTab" &&
          buttonStatus.canAsk &&
          selectedList?.[0] &&
          Constant.ASK_IDEA_H05 &&
          isCanHandleDoc && (
            <Button
              variant="outline"
              onClick={() => setShowAskIdeaModal(true)}
              className="h-9 px-3 text-sm text-white bg-blue-600 hover:bg-blue-700 hover:text-white"
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Xin ý kiến
            </Button>
          )}

        {selectedRowKeys.length === 1 &&
          isCanHandleDoc &&
          selectedList?.[0] &&
          !!selectedDocuments[0]?.allowConfig && (
            <Button
              variant="outline"
              onClick={() => setShowDeadlineModal(true)}
              className="h-9 px-3 text-sm text-white bg-blue-600 hover:bg-blue-700 hover:text-white"
            >
              Gia hạn xử lý
            </Button>
          )}

        {status === "toKnow_waitHandleTab" &&
          buttonStatus.canTransfer &&
          isCanHandleDoc &&
          (listNextNode?.length ?? 0) > 0 &&
          selectedDocuments.every((d) => d?.button?.canTransfer) && (
            <TransferDocumentOut
              selectedItemId={selectedRowKeys[0] as number}
              disabled={false}
              onSuccess={() => {
                queryClient.invalidateQueries({
                  queryKey: [
                    queryKeys.documentOut.root,
                    queryKeys.documentOut.comments,
                    selectedRowKeys[0],
                  ],
                });
              }}
              listNextNode={listNextNode}
            />
          )}
        {Constant.ORG_MULTI_TRANSFER_BCY &&
          status === "toKnow_waitHandleTab" &&
          buttonStatus.canOrgTransfer &&
          isCanHandleDoc &&
          (listNextNodeOrg?.length ?? 0) > 0 &&
          selectedDocuments.every((d) => d?.button?.canOrgTransfer) && (
            <TransferDocumentOut
              selectedItemId={Number(selectedRowKeys[0])}
              disabled={false}
              onSuccess={() => {
                queryClient.invalidateQueries({
                  queryKey: [
                    queryKeys.documentOut.root,
                    queryKeys.documentOut.comments,
                    selectedRowKeys[0],
                  ],
                });
              }}
              listNextNode={listNextNodeOrg}
              unit
            />
          )}

        {(status === "toKnow_waitHandleTab" ||
          status === "toKnow_handlingTab") &&
          selectedRowKeys.length > 0 && (
            <Button
              variant="outline"
              className="h-9 px-3 text-sm text-white bg-blue-600 hover:bg-blue-700 hover:text-white"
              onClick={() =>
                setShowProcessDoneModal({ open: true, isFinishReceive: false })
              }
            >
              Hoàn thành xử lý
            </Button>
          )}

        {status === "toKnow_waitHandleTab" &&
          selectedRowKeys.length === 1 &&
          buttonStatus.canFinish &&
          selectedList?.[0] &&
          isCanHandleDoc && (
            <Button
              variant="outline"
              className="h-9 px-3 text-sm text-white bg-blue-600 hover:bg-blue-700 hover:text-white"
              onClick={() =>
                setShowProcessDoneModal({ open: true, isFinishReceive: true })
              }
            >
              Hoàn thành văn bản
            </Button>
          )}

        {selectedRowKeys.length === 1 &&
          buttonStatus.canReturn &&
          selectedList?.[0] &&
          isCanHandleDoc && (
            <Button
              variant="outline"
              onClick={() => setShowRejectModal(true)}
              className="h-9 px-3 text-sm text-white bg-blue-600 hover:bg-blue-700 hover:text-white"
            >
              Trả lại
            </Button>
          )}

        {Constant.RETAKE_BY_STEP_BCY &&
          (status === "toKnow_handlingTab" || status === "doneTab") &&
          selectedRowKeys.length === 1 &&
          buttonStatus.canRetake &&
          selectedList?.[0] &&
          isCanHandleDoc && (
            <Button
              variant="outline"
              className="h-9 px-3 text-sm text-white bg-blue-600 hover:bg-blue-700 hover:text-white"
              onClick={() => setShowRetakeByStepModal(true)}
            >
              Thu hồi
            </Button>
          )}

        {selectedRowKeys.length === 1 &&
          currentDocument &&
          (currentDocument as any)?.canRetake &&
          SharedService.isOfCurrentUser(
            (currentDocument as any)?.doc?.createBy
          ) &&
          isCanHandleDoc && (
            <Button
              variant="outline"
              className="h-9 px-3 text-sm text-white bg-blue-600 hover:bg-blue-700 hover:text-white"
              onClick={() => setShowRetakeModal(true)}
            >
              Thu hồi
            </Button>
          )}

        {Constant.RETAKE_DONE_DOCUMENT_BCY &&
          status !== "toKnow_waitHandleTab" &&
          selectedRowKeys.length === 1 &&
          buttonStatus.canRetakeDone &&
          selectedList?.[0] &&
          isCanHandleDoc && (
            <Button
              variant="outline"
              className="h-9 px-3 text-sm text-white bg-blue-600 hover:bg-blue-700 hover:text-white"
              onClick={() => setShowRetakeDoneModal(true)}
            >
              Thu hồi hoàn thành
            </Button>
          )}

        {Constant.EVALUTE_BCY &&
          selectedRowKeys.length === 1 &&
          buttonStatus.canRequestReview &&
          selectedList?.[0] &&
          isCanHandleDoc && (
            <Button
              variant="outline"
              className="h-9 px-3 text-sm text-white bg-blue-600 hover:bg-blue-700 hover:text-white"
              onClick={() =>
                setShowEvaluateModal({ open: true, isEvaluate: false })
              }
            >
              Xin đánh giá
            </Button>
          )}

        {Constant.EVALUTE_BCY &&
          selectedRowKeys.length === 1 &&
          buttonStatus.canReview &&
          selectedList?.[0] &&
          isCanHandleDoc && (
            <Button
              variant="outline"
              className="h-9 px-3 text-sm text-white bg-blue-600 hover:bg-blue-700 hover:text-white"
              onClick={() =>
                setShowEvaluateModal({ open: true, isEvaluate: true })
              }
            >
              Đánh giá
            </Button>
          )}
      </div>
      {/* Status Tabs với Document Type Selector */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          {(
            ["toKnow_waitHandleTab", "toKnow_handlingTab", "doneTab"] as const
          ).map((k) => {
            const active = status === k;
            return (
              <button
                key={k}
                type="button"
                role="tab"
                aria-selected={active}
                aria-current={active ? "page" : undefined}
                onClick={() => {
                  setStatus(k);
                  setIsAdvancedSearchExpanded(false);
                  setSelectedRowKeys([]);
                  setPage(1);
                  router.push(
                    `/document-out/know?page=1&size=${itemsPerPage}&currentTab=${k}`
                  );
                  setAdvancedSearch(defaultAdvanceSearchState);
                  setTempAdvancedSearch(defaultAdvanceSearchState);
                }}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded transition-all duration-200",
                  active
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                )}
              >
                {STATUS_LABEL[k].label}
              </button>
            );
          })}
        </div>

        <EncryptDisplaySelect
          onChange={() => {
            setPage(1);
          }}
          selectClassName="w-36 h-9 text-xs"
        />
      </div>

      <Table<DocumentOutItem>
        sortable={true}
        clientSort={false}
        onSort={onTableSort}
        columns={
          status === "toKnow_handlingTab"
            ? columnsProcessed
            : status === "doneTab"
              ? columnsDone
              : columnsTodo
        }
        dataSource={rows}
        itemsPerPage={itemsPerPage}
        currentPage={page}
        onPageChange={(p) => {
          setPage(p);
          router.push(
            `/document-out/know?page=${p}&size=${itemsPerPage}&currentTab=${status}`
          );
        }}
        totalItems={total}
        showPagination
        emptyText={<EmptyDocument />}
        loading={showLoading}
        hasAllChange
        onItemsPerPageChange={(n) => {
          setItemsPerPage(n);
          setPage(1);
          setTimeout(() => {
            router.push(
              `/document-out/know?page=1&size=${n}&currentTab=${status}`
            );
          }, 0);
        }}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
          rowKey: "docId" as keyof DocumentOutItem,
        }}
        bgColor={"bg-white"}
        rowClassName={(item: DocumentOutItem) => {
          const bg = getRowBackgroundColor(item);

          return cn(bg, "group", {
            "hover:!bg-gray-100": bg === "bg-gray-100",
            "hover:!bg-red-200": bg === "bg-red-200",
            "hover:!bg-yellow-200": bg === "bg-yellow-200",
            "hover:!bg-red-600": bg === "bg-red-600",
            "hover:!bg-blue-600": bg === "bg-blue-600",
            "hover:!bg-black": bg === "bg-black",
          });
        }}
        rowTextColor={(item: DocumentOutItem) => getRowTextColor(item)}
        onRowClick={(r) => {
          const allowedComment = status == "toKnow_waitHandleTab";
          const queryParams = new URLSearchParams({
            allowedComment: String(allowedComment),
          });

          router.push(
            `/document-out/know/detail/${r.docId}?${queryParams.toString()}`
          );
        }}
      />

      {/* Status Color Legend */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Chú thích:</h4>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-200 rounded border"></div>
            <span className="text-sm text-gray-700">Đang xử lý</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-200 rounded border"></div>
            <span className="text-sm text-gray-700">Trả lại</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded border"></div>
            <span className="text-sm text-gray-700">Quá hạn</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-600 rounded border"></div>
            <span className="text-sm text-gray-700">
              Hạn xử lý không quá 3 ngày
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-black rounded border"></div>
            <span className="text-sm text-gray-700">Hạn xử lý hơn 3 ngày</span>
          </div>
        </div>
      </div>

      <AttachmentDialog2
        open={openAttach}
        onOpenChange={setOpenAttach}
        data={selectedAttachments}
      />

      <DocumentProcessDone
        docId={selectedRowKeys.map((k) => String(k))}
        onClose={() =>
          setShowProcessDoneModal({ open: false, isFinishReceive: false })
        }
        showProcessDoneModal={showProcessDoneModal.open}
        isFinishReceive={showProcessDoneModal.isFinishReceive}
        opinionRequired={false}
        setShowProcessDoneModal={(open: boolean) =>
          setShowProcessDoneModal({ open, isFinishReceive: false })
        }
      />

      <DocumentOutAskidea
        docId={selectedRowKeys?.[0]?.toString()}
        onClose={() => setShowAskIdeaModal(false)}
        showAskIdeaModal={showAskIdeaModal}
        setShowAskIdeaModal={setShowAskIdeaModal}
      />

      <DocumentOutDeadline
        docId={selectedRowKeys?.[0]?.toString()}
        type="THREADS"
        currentDeadline={currentDeadlineDateOnly ?? null}
        onClose={() => setShowDeadlineModal(false)}
        showDeadlineModal={showDeadlineModal}
        setShowDeadlineModal={setShowDeadlineModal}
      />

      <DocumentReject
        docId={selectedRowKeys?.[0]?.toString()}
        onClose={() => setShowRejectModal(false)}
        showRejectModal={showRejectModal}
        setShowRejectModal={setShowRejectModal}
      />

      <DocumentOutEvaluate
        docId={selectedRowKeys?.[0]?.toString()}
        isEvaluate={showEvaluateModal.isEvaluate}
        onClose={() => setShowEvaluateModal({ open: false, isEvaluate: false })}
        showEvaluateModal={showEvaluateModal.open}
        setShowEvaluateModal={(open: boolean) =>
          setShowEvaluateModal({ open, isEvaluate: false })
        }
      />

      <DocumentOutRetakeByStep
        docId={selectedRowKeys?.[0]?.toString()}
        isDelegate={false}
        onSuccess={() => {
          router.refresh();
        }}
        onClose={() => setShowRetakeByStepModal(false)}
        nodeHandleByUser={selectedList?.[0]?.processNode}
        type="retake"
        title="Thu hồi văn bản"
        showRetakeByStepModal={showRetakeByStepModal}
        setShowRetakeByStepModal={setShowRetakeByStepModal}
      />

      <RetakeDoneDocument
        docId={selectedRowKeys?.[0]?.toString()}
        onClose={() => setShowRetakeDoneModal(false)}
        showRetakeDoneModal={showRetakeDoneModal}
        setShowRetakeDoneModal={setShowRetakeDoneModal}
      />

      {/* Thu hồi cơ bản */}
      <DocumentOutRetakeModal
        isOpen={showRetakeModal}
        onOpenChange={setShowRetakeModal}
        onClose={() => setShowRetakeModal(false)}
        documentId={selectedRowKeys?.[0]?.toString() || ""}
      />

      <SwitchAndAddUser
        isOpen={showSwitchUserModal}
        onOpenChange={setShowSwitchUserModal}
        onClose={() => setShowSwitchUserModal(false)}
        documentId={selectedRowKeys?.[0]?.toString()}
        step={Number(selectedList?.[0]?.processStep) || 0}
        isSwitchMainUser={true}
        isCombine={true}
        onSuccess={() => {
          setShowSwitchUserModal(false);
        }}
      />
    </div>
  );
}
