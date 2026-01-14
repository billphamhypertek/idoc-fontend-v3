"use client";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import SelectCustom from "@/components/common/SelectCustom";
import { Table } from "@/components/ui/table";
import type {
  DocumentOutItem,
  FindDocByTypeHandleParams,
} from "@/definitions/types/document-out.type";
import type { Column } from "@/definitions/types/table.type";
import {
  DocumentOutMode,
  DocumentOutStatus,
  useGetDocumentOutListByStatus,
  useToggleImportant,
} from "@/hooks/data/document-out.data";
import { formatDate } from "@/utils/datetime.utils";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  Eye,
  FileCheck,
  MessageCircle,
  Paperclip,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Star,
} from "lucide-react";
import { memo, useEffect, useMemo, useRef, useState } from "react";

import ProgressControlDialog from "@/components/common/ProgressControlDialog";
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
import { Constant } from "@/definitions/constants/constant";
import { useGetNextNodes, useGetStartNodes } from "@/hooks/data/bpmn.data";
import { cn } from "@/lib/utils";
import { notificationService } from "@/services/notification.service";
import { ToastUtils } from "@/utils/toast.utils";
import { getUserInfo } from "@/utils/token.utils";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AttachmentDialog2 from "@/components/common/AttachmentDialog2";
import { canViewNoStatus } from "@/utils/common.utils";
import { useFileViewer } from "@/hooks/useFileViewer";
import { downloadFileTable } from "@/services/file.service";
import { useGetCategoriesByCode } from "@/hooks/data/category.data";
import { EmptyDocument } from "@/components/common/EmptyDocument";
import { useEncryptStore } from "@/stores/encrypt.store";
import { EncryptionService } from "@/services/encryption.service";
import WorkAssignDialog from "@/components/work-assign/createDialog";
import { queryKeys } from "@/definitions/constants/queryKey.constants";
import { useQueryClient } from "@tanstack/react-query";

type StatusKey = "waitHandleTab" | "handlingTab" | "doneTab";
const STATUS_LABEL: Record<StatusKey, { label: string; icon: any }> = {
  waitHandleTab: { label: "Chưa xử lý", icon: Clock },
  handlingTab: { label: "Đã xử lý", icon: CheckCircle },
  doneTab: { label: "Hoàn thành", icon: FileCheck },
};
const STATUS_MAP: Record<StatusKey, DocumentOutStatus> = {
  waitHandleTab: DocumentOutStatus.TODO,
  handlingTab: DocumentOutStatus.PROCESSED,
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

const DocumentOutCombinePage = memo(function DocumentOutCombinePage() {
  const { isEncrypt } = useEncryptStore();
  const sp = useSearchParams();

  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const currentTab = sp?.get("currentTab");
  const paramPage = sp?.get("page");
  const paramSize = sp?.get("size");
  const paramSortBy = sp?.get("sortBy");
  const paramDirection = sp?.get("direction");
  useEffect(() => {
    if (currentTab) setStatus(currentTab as StatusKey);
    if (paramSize) setItemsPerPage(Number(paramSize));
    if (paramPage) setPage(Number(paramPage));
    if (paramSortBy) setSortBy(paramSortBy);
    if (paramDirection) setDirection(paramDirection);
  }, [sp]);

  const [text, setText] = useState("");
  const [status, setStatus] = useState<StatusKey>("waitHandleTab");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [sortBy, setSortBy] = useState("");
  const [direction, setDirection] = useState("DESC");
  const [dateSearch, setDateSearch] = useState<number | null>(null);
  const [dayLeft, setDayLeft] = useState("");
  const [listNextNodeOrg, setListNextNodeOrg] = useState<any[]>([]);
  const [advancedSearch, setAdvancedSearch] = useState(
    defaultAdvanceSearchState
  );
  const [tempAdvancedSearch, setTempAdvancedSearch] = useState(
    defaultAdvanceSearchState
  );
  const { data: docTypeCategory } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.DOC_TYPE
  );

  const [isAdvancedSearchExpanded, setIsAdvancedSearchExpanded] =
    useState(false);
  const [showProcessDoneModal, setShowProcessDoneModal] = useState({
    open: false,
    isFinishReceive: false,
  });
  const nodeStart = null;
  const [showSwitchUserModal, setShowSwitchUserModal] = useState(false);

  const [showAskIdeaModal, setShowAskIdeaModal] = useState(false);
  const [showDeadlineModal, setShowDeadlineModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showEvaluateModal, setShowEvaluateModal] = useState({
    open: false,
    isEvaluate: false,
  });
  const [showRetakeByStepModal, setShowRetakeByStepModal] = useState(false);
  const [showStepRetakeModal, setShowStepRetakeModal] = useState(false);
  const [showRetakeDoneModal, setShowRetakeDoneModal] = useState(false);
  const [showProgressControlModal, setShowProgressControlModal] = useState({
    open: false,
    data: { docId: "", progress: 0, tab: "" },
  });

  // Added parity with Angular: position dropdown + flags
  const [posId, setPosId] = useState("");
  const [listPositions, setListPositions] = useState<any[]>([]);
  const [isBpmnChanhVanPhong, setIsBpmnChanhVanPhong] = useState(false);
  const [openWorkAssignDialog, setOpenWorkAssignDialog] = useState(false);

  useEffect(() => {
    try {
      const raw = getUserInfo();
      if (!raw) return;
      const info = JSON.parse(raw);
      const mainPos = info.positionModel;
      const addPos = info.additionalPositions || [];
      const arr: any[] = [];
      if (mainPos) arr.push(mainPos);
      if (Array.isArray(addPos)) {
        addPos.forEach((p: any) => {
          if (p && !arr.some((x) => x.id === p.id)) arr.push(p);
        });
      }
      setListPositions(arr);
      if (info.position === Constant.ID_CHANH_VAN_PHONG) {
        setIsBpmnChanhVanPhong(true);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  useEffect(() => {
    // reset page when switch position
    setPage(1);
  }, [posId]);

  const { mutate: toggleImportant } = useToggleImportant();
  const router = useRouter();

  const isStarred = (r: DocumentOutItem) => Boolean(r.important);
  const onStarClick = (r: DocumentOutItem) => {
    toggleImportant({ docId: r.docId, important: !isStarred(r) });
  };
  const [listNextNode, setListNextNode] = useState<any[]>([]);
  const queryClient = useQueryClient();
  const { data: startNodes } = useGetStartNodes("INCOMING");
  // Node lists are populated based on selection below (after selectedDocuments is defined)
  const lastNodeIdsRef = useRef<string>("");

  useEffect(() => {
    if (!startNodes) return;
    if (startNodes.length <= 0) {
      ToastUtils.error("Đơn vị của bạn chưa có luồng văn bản đến", "Thông báo");
    }
  }, [startNodes]);

  const [openAttach, setOpenAttach] = useState(false);
  const { viewFile } = useFileViewer();
  const [selectedAttachments, setSelectedAttachments] = useState<any[]>([]);
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

  const isCanHandleDoc = !isEncrypt;
  useEffect(() => {
    if (isEncrypt) {
      EncryptionService.isCheckStartUsbTokenWatcher();
    }
  }, [isEncrypt]);

  useEffect(() => {
    if (isAdvancedSearchExpanded) {
      setTempAdvancedSearch(advancedSearch);
    }
  }, [isAdvancedSearchExpanded, advancedSearch]);

  useEffect(() => {
    setPage(1);
  }, [text]);

  const handleDateSearchChange = (value: string) => {
    const numValue = value === "all" ? null : Number(value);
    setDateSearch(numValue);
    setPage(1);
  };

  const params: FindDocByTypeHandleParams = useMemo(
    () => ({
      text,
      dayLeft,
      page,
      sortBy,
      direction: direction === "" ? undefined : (direction as "ASC" | "DESC"),
      posId: posId || "",
      size: itemsPerPage,
      typeHandle: status === "handlingTab" ? 0 : status === "doneTab" ? 2 : 1,
      dateSearch,
      ...advancedSearch,
    }),
    [
      text,
      dayLeft,
      page,
      sortBy,
      direction,
      itemsPerPage,
      status,
      advancedSearch,
      posId,
      dateSearch,
    ]
  );

  const { data, isLoading, isError, error } = useGetDocumentOutListByStatus(
    STATUS_MAP[status],
    params,
    DocumentOutMode.COORDINATE
  );

  const rows = data?.objList ?? [];
  const total = data?.totalRecord ?? 0;

  const selectedDocuments = useMemo(
    () => rows.filter((r) => selectedRowKeys.includes(r.docId)),
    [rows, selectedRowKeys]
  );

  const isSingle = selectedDocuments.length === 1;
  const isMulti = selectedDocuments.length > 0;
  const currentDocument = selectedDocuments[0];
  const selectedList = useMemo(() => {
    return selectedRowKeys.map((key) => {
      const row = rows.find((r) => r.docId === key);
      return row;
    });
  }, [selectedRowKeys, rows]);

  const disableNode = useMemo(() => {
    return selectedDocuments?.length > 0
      ? selectedDocuments?.map((d) => d.processNode)
      : null;
  }, [selectedDocuments]);
  // Align with Angular: for single selection, rely on current item's canTransfer;
  // for multiple, all must be transferable and share the same processNode
  const canTransferSingle = isSingle
    ? (currentDocument?.button?.canTransfer ?? false)
    : false;
  const canTransferMulti =
    isMulti &&
    selectedDocuments.every(
      (d) =>
        d.button?.canTransfer &&
        d.processNode === selectedDocuments[0].processNode
    );
  const canOrgTransfer =
    isMulti && selectedDocuments.every((d) => d.button?.canOrgTransfer);
  const canReturn = currentDocument?.button?.canReturn ?? false;
  const canRetake = currentDocument?.button?.canRetake ?? false;
  const canRetakeDone = currentDocument?.button?.canRetakeDone ?? false;
  const canSwitchOrAdd = currentDocument?.button?.canSwitchOrAdd ?? false;
  const canAsk = currentDocument?.button?.canAsk ?? false;
  const canFinish = currentDocument?.button?.canFinish ?? false;
  const canRequestReview = currentDocument?.button?.canRequestReview ?? false;
  const canReview = currentDocument?.button?.canReview ?? false;
  const showDeadlinePopupVal = currentDocument?.allowConfig ?? false;

  // Compute common process node for current selection using stable inputs
  const commonProcessNode = useMemo(() => {
    if (selectedRowKeys.length === 0) return null;
    const selected = rows.filter((r) => selectedRowKeys.includes(r.docId));
    if (selected.length === 1) return selected[0]?.processNode ?? null;
    const first = selected[0]?.processNode ?? null;
    const allSame = selected.every((d) => d?.processNode === first);
    return allSame ? first : null;
  }, [rows, selectedRowKeys]);

  const { data: nextNodes } = useGetNextNodes(
    typeof commonProcessNode === "number" && commonProcessNode > 0
      ? commonProcessNode
      : undefined
  );

  // Eligible keys for header select-all (respect same-node constraint like Angular)
  const eligibleRowKeys = useMemo(() => {
    if (!rows || rows.length === 0) return [] as React.Key[];
    if (typeof commonProcessNode === "number" && commonProcessNode > 0) {
      return rows
        .filter((r) => r.processNode === commonProcessNode)
        .map((r) => r.docId);
    }
    // No selection yet -> all current rows are eligible
    return rows.map((r) => r.docId);
  }, [rows, commonProcessNode]);

  // Header checkbox display should be checked ONLY when ALL rows on the page are selected
  const allPageSelected = useMemo(
    () =>
      rows.length > 0 && rows.every((r) => selectedRowKeys.includes(r.docId)),
    [rows, selectedRowKeys]
  );

  // Sync available nodes based on selection
  useEffect(() => {
    if (selectedRowKeys.length === 0) {
      setListNextNode([]);
      setListNextNodeOrg([]);
      lastNodeIdsRef.current = "";
      return;
    }
    // Multiple selection with different nodes -> no transfer targets
    if (
      selectedRowKeys.length > 1 &&
      (typeof commonProcessNode !== "number" || !(commonProcessNode > 0))
    ) {
      setListNextNode([]);
      setListNextNodeOrg([]);
      lastNodeIdsRef.current = "";
      return;
    }
    // Single with process node or multi with same node -> load next nodes
    if (typeof commonProcessNode === "number" && commonProcessNode > 0) {
      if (nextNodes) {
        const nextIds = nextNodes.map((n: any) => n.id).join(",");
        if (nextIds !== lastNodeIdsRef.current) {
          setListNextNode(nextNodes);
          setListNextNodeOrg(nextNodes.filter((x: any) => x.allowMultiple));
          lastNodeIdsRef.current = nextIds;
        }
      }
      return;
    }
    // Single without process node -> start nodes
    if (selectedRowKeys.length === 1 && startNodes) {
      const startIds = startNodes.map((n: any) => n.id).join(",");
      if (startIds !== lastNodeIdsRef.current) {
        setListNextNode(startNodes);
        setListNextNodeOrg(startNodes.filter((x: any) => x.allowMultiple));
        lastNodeIdsRef.current = startIds;
      }
    }
  }, [selectedRowKeys.join(","), commonProcessNode, nextNodes, startNodes]);

  // Action functions (placeholders for modal opens)
  const doOpenSwitchUserPopup = () => {
    setShowSwitchUserModal(true);
  };

  const doOpenAskIdeaPopup = () => {
    setShowAskIdeaModal(true);
  };

  const doOpenDeadlinePopup = () => {
    setShowDeadlineModal(true);
  };

  const doOpenProcessDonePopup = (isFinish: boolean) => {
    setShowProcessDoneModal({ open: true, isFinishReceive: isFinish });
  };

  const doOpenRejectPopup = () => {
    setShowRejectModal(true);
  };

  const doOrgTransferPopup = () => {
    setShowStepRetakeModal(true);
  };

  const doOpenRetakePopup = () => {
    setShowRetakeByStepModal(true);
  };

  const doOpenRetakeDoneDocument = () => {
    setShowRetakeDoneModal(true);
  };

  const doRequestEvaluate = () => {
    setShowEvaluateModal({ open: true, isEvaluate: true });
  };

  const doEvaluate = () => {
    setShowEvaluateModal({ open: true, isEvaluate: false });
  };

  const openProgressControl = (r: DocumentOutItem) => {
    setShowProgressControlModal({
      open: true,
      data: {
        docId: String(r.docId),
        progress: Number(r.progress || 0),
        tab: "",
      },
    });
  };

  // Function to get status colors for badges
  const getStatusColors = (statusName: string) => {
    const status = statusName?.toLowerCase() || "";

    if (status.includes("đang xử lý")) {
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

    // Default colors
    return {
      bg: "bg-gray-100",
      text: "text-gray-900",
    };
  };

  // Function to get row background color based on status (same as status badge colors)
  const getRowBackgroundColor = (item: DocumentOutItem) => {
    const statusName = (
      item.pstatusName ??
      item.docStatusName ??
      ""
    ).toLowerCase();

    if (statusName.includes("đang xử lý")) {
      return "bg-red-200"; // Same as status badge: rgb(249, 172, 172)
    } else if (statusName.includes("trả lại")) {
      return "bg-yellow-200"; // Same as status badge: rgb(251, 235, 154)
    } else if (statusName.includes("quá hạn")) {
      return "bg-red-600"; // Same as status badge: red
    } else if (
      statusName.includes("hạn xử lý không quá 3 ngày") ||
      statusName.includes("hạn xử lý <= 3 ngày")
    ) {
      return "bg-blue-600"; // Same as status badge: blue
    } else if (
      statusName.includes("hạn xử lý hơn 3 ngày") ||
      statusName.includes("Hạn xử lý hơn 3 ngày")
    ) {
      return "bg-black"; // Same as status badge: black
    }

    return "bg-gray-100"; // Same as default status badge
  };

  // Function to get text color for rows with dark backgrounds
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
      return "text-white"; // White text for dark backgrounds
    }

    return "text-gray-900"; // Dark text for light backgrounds
  };

  const leadingCols: (Column<DocumentOutItem> & { sortKey?: string })[] = [
    {
      header: (
        <div className="flex items-center justify-center gap-3">
          <span>STT</span>
          {status == "waitHandleTab" && !isEncrypt && (
            <Checkbox
              checked={allPageSelected}
              onCheckedChange={() => {
                setSelectedRowKeys((prev) => {
                  const pageKeys: React.Key[] = rows.map(
                    (r) => r.docId as React.Key
                  );
                  if (!allPageSelected) {
                    // Only add eligible rows:
                    // - If no selection yet: all rows on page
                    // - Else: only rows with the same processNode as current selection
                    const eligibleKeys: React.Key[] =
                      prev.length === 0 || typeof commonProcessNode !== "number"
                        ? pageKeys
                        : rows
                            .filter((r) => r.processNode === commonProcessNode)
                            .map((r) => r.docId as React.Key);
                    return Array.from(
                      new Set<React.Key>([...prev, ...eligibleKeys])
                    );
                  }
                  // Deselect all rows on the current page
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
              disabled={
                disableNode ? !disableNode?.includes(r.processNode) : false
              }
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
              className={cn(
                "h-4 w-4 cursor-pointer",
                r.important
                  ? "fill-yellow-400 stroke-yellow-600 stroke-2"
                  : "stroke-gray-400 stroke-2"
              )}
            />
          </button>
        );
      },
    },
  ];

  const columnsTodo: (Column<DocumentOutItem> & { sortKey?: string })[] = [
    ...leadingCols,
    {
      header: "Ngày văn bản",
      sortKey: "DATE_ARRIVAL",
      accessor: (r) => (
        <Link href={`/document-out/combine/detail/${r.docId}`}>
          {formatDate(r.dateArrival)}
        </Link>
      ),
      className: "text-center w-[140px]",
    },
    {
      header: "Ngày văn bản đến",
      sortKey: "DATEISSUED",
      accessor: (r) => (
        <Link href={`/document-out/combine/detail/${r.docId}`}>
          {formatDate(r.dateArrival)}
        </Link>
      ),
      className: "text-center w-[140px]",
    },
    {
      header: "Số đến",
      sortKey: "NUMBER_ARRIVAL",
      accessor: (r) => (
        <Link href={`/document-out/combine/detail/${r.docId}`}>
          {r.numberArrival ?? ""}
        </Link>
      ),
      className: "text-center w-[80px]",
    },
    {
      header: "Trích yếu",
      sortKey: "PREVIEW",
      accessor: (r) => (
        <Link href={`/document-out/combine/detail/${r.docId}`}>
          <div
            title={r.preview ?? ""}
            className="max-w-[700px] line-clamp-2 text-sm leading-relaxed text-ellipsis"
          >
            {r.preview}
          </div>
        </Link>
      ),
      className: "text-left min-w-[200px] w-[30%]",
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
              <Paperclip className="w-4 h-4 text-white" />
            </button>
          ) : (
            ""
          )}
          {r.delegatedDoc && (
            <span className="ml-2 bg-red-200 text-red-900 px-2 py-1 rounded-md text-xs">
              Ủy quyền
            </span>
          )}
        </div>
      ),
      className: "text-center w-[90px]",
    },
    {
      header: "Độ mật",
      sortKey: "SECURITY_NAME",
      accessor: (r) => (
        <Link href={`/document-out/combine/detail/${r.docId}`}>
          {r.securityName ?? ""}
        </Link>
      ),
      className: "text-center w-[110px]",
    },
    {
      header: "Độ khẩn",
      sortable: false,
      accessor: (r) => {
        const urgentName = r.urgentName ?? "";
        return (
          <Link href={`/document-out/combine/detail/${r.docId}`}>
            <span
              className={
                urgentName === "Hỏa tốc" ? "text-red-600 font-semibold" : ""
              }
            >
              {urgentName}
            </span>
          </Link>
        );
      },
      className: "text-center w-[110px]",
    },
    {
      header: "Số, KH của VB đến",
      sortKey: "NUMBER_ARRIVAL_STR",
      sortable: false,
      accessor: (r) => (
        <Link href={`/document-out/combine/detail/${r.docId}`}>
          {r.numberArrivalStr ?? ""}
        </Link>
      ),
      className: "text-left w-[180px]",
    },
    {
      header: "Hạn xử lý",
      sortKey: "DEADLINE",
      accessor: (r) => (
        <Link href={`/document-out/combine/detail/${r.docId}`}>
          {formatDate(r.deadline)}
        </Link>
      ),
      className: "text-center w-[140px]",
    },
    {
      header: <span className="block text-center w-full">Tiến độ</span>,
      sortKey: "PROGRESS",
      accessor: (r) => {
        const progressValue = parseInt(
          String(r.progress ?? "0")?.replace("%", "")
        );
        const pct = Math.max(0, Math.min(progressValue, 100));
        return (
          <div
            className="relative w-[100px] h-2.5 rounded-full bg-gray-200 overflow-hidden cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              openProgressControl(r);
            }}
            title={`${pct}%`}
            role="progressbar"
            aria-valuenow={pct}
            aria-valuemin={0}
            aria-valuemax={100}
          >
            <div
              className="absolute left-0 top-0 h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className={
                  "text-[10px] leading-[10px] font-semibold " +
                  (pct >= 50 ? "!text-white" : "!text-gray-800")
                }
              >
                {pct}%
              </span>
            </div>
          </div>
        );
      },
      className: "text-center min-w-[30px] w-[30px] px-1",
    },
  ];

  const columnsProcessed: (Column<DocumentOutItem> & { sortKey?: string })[] = [
    ...leadingCols,
    {
      header: "Ngày văn bản",
      sortKey: "DATE_ARRIVAL",
      accessor: (r) => (
        <Link href={`/document-out/combine/detail/${r.docId}`}>
          {formatDate(r.dateArrival)}
        </Link>
      ),
      className: "text-center w-[140px]",
    },
    {
      header: "Ngày văn bản đến",
      sortKey: "DATEISSUED",
      accessor: (r) => (
        <Link href={`/document-out/combine/detail/${r.docId}`}>
          {formatDate(r.dateIssued)}
        </Link>
      ),
      className: "text-center w-[140px]",
    },
    {
      header: "Ngày vào sổ",
      sortKey: "DATEISSUED",
      accessor: (r) => (
        <Link href={`/document-out/combine/detail/${r.docId}`}>
          {formatDate(r.dateArrival)}
        </Link>
      ),
      className: "text-center w-[140px]",
    },
    {
      header: "Số đến",
      sortKey: "NUMBER_ARRIVAL",
      accessor: (r) => (
        <Link href={`/document-out/combine/detail/${r.docId}`}>
          {r.numberArrival ?? ""}
        </Link>
      ),
      className: "text-center w-[70px]",
    },
    {
      header: "Trích yếu",
      sortKey: "PREVIEW",
      accessor: (r) => (
        <Link href={`/document-out/combine/detail/${r.docId}`}>
          <div
            title={r.preview ?? ""}
            className="max-w-[700px] line-clamp-2 text-sm leading-relaxed text-ellipsis"
          >
            {r.preview}
          </div>
        </Link>
      ),
      className: "text-left min-w-[200px] w-[30%]",
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
          {r.delegatedDoc && (
            <span className="ml-2 bg-red-200 text-red-900 px-2 py-1 rounded-md text-xs">
              Ủy quyền
            </span>
          )}
        </div>
      ),
      className: " text-center w-[90px]",
    },
    {
      header: "Độ mật",
      sortable: false,
      accessor: (r) => (
        <Link href={`/document-out/combine/detail/${r.docId}`}>
          {r.securityName ?? ""}
        </Link>
      ),
      className: "text-center w-[90px]",
    },
    {
      header: "Độ khẩn",
      sortable: false,
      accessor: (r) => {
        const urgentName = r.urgentName ?? "";
        return (
          <Link href={`/document-out/combine/detail/${r.docId}`}>
            <span
              className={
                urgentName === "Hỏa tốc" ? "text-red-600 font-semibold" : ""
              }
            >
              {urgentName}
            </span>
          </Link>
        );
      },
      className: "text-center w-[90px]",
    },
    {
      header: "Số, KH của VB đến",
      sortKey: "NUMBER_ARRIVAL_STR",
      accessor: (r) => (
        <Link href={`/document-out/combine/detail/${r.docId}`}>
          {r.numberArrivalStr ?? ""}
        </Link>
      ),
      className: "text-left w-[150px]",
    },
    {
      header: "Người xử lý",
      sortKey: "PERSON_HANDLE",
      accessor: (r) => (
        <Link href={`/document-out/combine/detail/${r.docId}`}>
          {r.nextHandle ?? ""}
        </Link>
      ),
      className: "text-left w-[150px]",
    },
    {
      header: "Hạn xử lý",
      sortKey: "DEADLINE",
      accessor: (r) => (
        <Link href={`/document-out/combine/detail/${r.docId}`}>
          {formatDate(r.deadline)}
        </Link>
      ),
      className: "text-center w-[120px]",
    },
    {
      header: "Trạng thái",
      sortKey: "STATUS",
      accessor: (r) => {
        const statusName = r.pstatusName ?? r.docStatusName ?? "";
        const colors = getStatusColors(statusName);
        return (
          <Link href={`/document-out/combine/detail/${r.docId}`}>
            <span
              className={`px-2 py-1 rounded-md text-xs font-medium whitespace-nowrap ${colors.bg} ${colors.text}`}
            >
              {statusName}
            </span>
          </Link>
        );
      },
      className: "text-center whitespace-nowrap w-[200px]",
    },
  ];

  const columnsDone: (Column<DocumentOutItem> & { sortKey?: string })[] = [
    ...leadingCols,
    {
      header: "Ngày văn bản",
      sortKey: "DATE_ARRIVAL",
      accessor: (r) => (
        <Link href={`/document-out/combine/detail/${r.docId}`}>
          {formatDate(r.dateArrival)}
        </Link>
      ),
      className: "text-center w-[140px]",
    },
    {
      header: "Ngày văn bản đến",
      sortKey: "DATEISSUED",
      accessor: (r) => (
        <Link href={`/document-out/combine/detail/${r.docId}`}>
          {formatDate(r.dateIssued)}
        </Link>
      ),
      className: "text-center w-[140px]",
    },
    {
      header: "Số đến",
      sortKey: "NUMBER_ARRIVAL",
      accessor: (r) => (
        <Link href={`/document-out/combine/detail/${r.docId}`}>
          {r.numberArrival ?? ""}
        </Link>
      ),
      className: "text-center w-[80px]",
    },
    {
      header: "Trích yếu",
      sortKey: "PREVIEW",
      accessor: (r) => (
        <Link href={`/document-out/combine/detail/${r.docId}`}>
          <div
            title={r.preview ?? ""}
            className="max-w-[700px] line-clamp-2 text-sm leading-relaxed text-ellipsis"
          >
            {r.preview}
          </div>
        </Link>
      ),
      className: "text-left min-w-[200px] w-[30%]",
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
              <Paperclip className="w-4 h-4 text-white" />
            </button>
          ) : (
            ""
          )}
          {r.delegatedDoc && (
            <span className="ml-2 bg-red-200 text-red-900 px-2 py-1 rounded-md text-xs">
              Ủy quyền
            </span>
          )}
        </div>
      ),
      className: "text-center w-[90px]",
    },
    {
      header: "Độ mật",
      sortable: false,
      accessor: (r) => (
        <Link href={`/document-out/combine/detail/${r.docId}`}>
          {r.securityName ?? ""}
        </Link>
      ),
      className: "text-center w-[90px]",
    },
    {
      header: "Độ khẩn",
      sortable: false,
      accessor: (r) => {
        const urgentName = r.urgentName ?? "";
        return (
          <Link href={`/document-out/combine/detail/${r.docId}`}>
            <span
              className={
                urgentName === "Hỏa tốc" ? "text-red-600 font-semibold" : ""
              }
            >
              {urgentName}
            </span>
          </Link>
        );
      },
      className: "text-center w-[90px]",
    },
    {
      header: "Số, KH của VB đến",
      sortKey: "NUMBER_ARRIVAL_STR",
      accessor: (r) => (
        <Link href={`/document-out/combine/detail/${r.docId}`}>
          {r.numberArrivalStr ?? ""}
        </Link>
      ),
      className: "text-left w-[150px]",
    },
    {
      header: "Hạn xử lý",
      sortKey: "DEADLINE",
      accessor: (r) => (
        <Link href={`/document-out/combine/detail/${r.docId}`}>
          {formatDate(r.deadline)}
        </Link>
      ),
      className: "text-center w-[120px]",
    },
  ];

  const columns =
    status === "handlingTab"
      ? columnsProcessed
      : status === "doneTab"
        ? columnsDone
        : columnsTodo;

  const handleSortChange = (
    config: { key: string; direction: "asc" | "desc" | null } | null
  ) => {
    if (!config || !config.direction) {
      setSortBy("");
      setDirection("DESC");
      // Reset sort: go to page 1
      setPage(1);
      router.push(
        `/document-out/combine?page=1&size=${itemsPerPage}&currentTab=${status}`
      );
    } else {
      const mappedDirection = config.direction === "asc" ? "ASC" : "DESC";
      setSortBy(config.key);
      setDirection(mappedDirection);
      // When sorting, reset to page 1 to see all sorted results
      setPage(1);
      router.push(
        `/document-out/combine?page=1&size=${itemsPerPage}&currentTab=${status}&sortBy=${config.key}&direction=${mappedDirection}`
      );
    }
  };

  // Show continuous loading on error (like Angular)
  const showLoading = isLoading || isError;

  return (
    <div className="pl-4 pr-4 space-y-4">
      {/* Breadcrumb và Search cùng hàng */}
      <div className="flex items-center justify-between gap-4">
        <BreadcrumbNavigation
          items={[
            {
              label: "Văn bản đến",
            },
          ]}
          currentPage="Danh sách văn bản phối hợp"
          showHome={false}
        />

        <div className="flex items-center gap-3">
          <SearchInput
            placeholder="Tìm kiếm Số, KH của VB đến | Trích yếu"
            value={text}
            setSearchInput={(v) => {
              setText(v);
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
          onChangePreview={(v) => {
            setTempAdvancedSearch((p) => ({
              ...p,
              preview: v,
            }));
          }}
          docTypeOptions={
            docTypeCategory
              ?.filter((item) => item.id !== null && item.id !== undefined)
              .map((item) => ({
                id: String(item.id),
                name: item.name,
              })) || []
          }
          docTypeId={tempAdvancedSearch.docTypeId}
          onChangeDocType={(val) => {
            setTempAdvancedSearch((p) => ({
              ...p,
              docTypeId: val === "all" ? "" : val,
            }));
          }}
          important={tempAdvancedSearch.important}
          onChangeImportant={(val) => {
            setTempAdvancedSearch((p) => ({
              ...p,
              important: val === "all" ? "" : val,
            }));
          }}
          expired={tempAdvancedSearch.expired}
          onChangeExpired={(val) => {
            setTempAdvancedSearch((p) => ({
              ...p,
              expired: val === "all" ? "" : val,
            }));
          }}
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
      <div className="flex flex-wrap gap-2 mt-2 mb-2 min-h-9">
        {isCanHandleDoc &&
          canSwitchOrAdd &&
          isSingle &&
          selectedList?.[0] &&
          Constant.SWITCH_AND_ADD_USER_BCY && (
            <Button
              className="h-9 px-3 text-sm text-white hover:opacity-90 bg-blue-600 hover:bg-blue-700 hover:text-white"
              onClick={doOpenSwitchUserPopup}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Thêm xử lý
            </Button>
          )}
        {isCanHandleDoc &&
          canAsk &&
          status === "handlingTab" &&
          selectedList?.[0] &&
          Constant.ASK_IDEA_H05 && (
            <Button
              className="h-9 px-3 text-sm text-white hover:opacity-90 bg-blue-600 hover:bg-blue-700 hover:text-white"
              onClick={doOpenAskIdeaPopup}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Xin ý kiến
            </Button>
          )}
        {isCanHandleDoc && showDeadlinePopupVal && selectedList?.[0] && (
          <Button
            className="h-9 px-3 text-sm text-white hover:opacity-90 bg-blue-600 hover:bg-blue-700 hover:text-white"
            onClick={doOpenDeadlinePopup}
          >
            <Calendar className="w-4 h-4 mr-2" />
            Gia hạn xử lý
          </Button>
        )}
        {isCanHandleDoc &&
          selectedRowKeys.length > 0 &&
          (isSingle ? canTransferSingle : canTransferMulti) &&
          status === "handlingTab" &&
          selectedList?.[0] &&
          listNextNode.length > 0 && (
            <TransferDocumentOut
              selectedItemId={selectedRowKeys[0] as number}
              disabled={false}
              onSuccess={() => {
                notificationService.countUnreadNotification?.();
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
        {isCanHandleDoc &&
          canOrgTransfer &&
          status === "handlingTab" &&
          selectedList?.[0] &&
          Constant.ORG_MULTI_TRANSFER_BCY &&
          selectedRowKeys.length === 1 && (
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
        {isCanHandleDoc &&
          (status === "waitHandleTab" || status === "handlingTab") &&
          selectedList?.[0] && (
            <Button
              className="h-9 px-3 text-sm text-white hover:opacity-90 bg-blue-600 hover:bg-blue-700 hover:text-white"
              onClick={() => doOpenProcessDonePopup(false)}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Hoàn thành xử lý
            </Button>
          )}
        {isCanHandleDoc &&
          canFinish &&
          status === "waitHandleTab" &&
          selectedList?.[0] && (
            <Button
              className="h-9 px-3 text-sm text-white hover:opacity-90 bg-blue-600 hover:bg-blue-700 hover:text-white"
              onClick={() => doOpenProcessDonePopup(true)}
            >
              <FileCheck className="w-4 h-4 mr-2" />
              Hoàn thành văn bản
            </Button>
          )}
        {isCanHandleDoc && canReturn && selectedList?.[0] && (
          <Button
            className="h-9 px-3 text-sm text-white hover:opacity-90 bg-blue-600 hover:bg-blue-700 hover:text-white"
            onClick={doOpenRejectPopup}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Trả lại
          </Button>
        )}
        {isCanHandleDoc &&
          selectedList?.[0] &&
          canRetake &&
          Constant.RETAKE_BY_STEP_BCY && (
            <Button
              className="h-9 px-3 text-sm text-white hover:opacity-90 bg-blue-600 hover:bg-blue-700 hover:text-white"
              onClick={doOpenRetakePopup}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Thu hồi
            </Button>
          )}
        {isCanHandleDoc &&
          selectedList?.[0] &&
          canRetakeDone &&
          status !== "waitHandleTab" &&
          Constant.RETAKE_DONE_DOCUMENT_BCY && (
            <Button
              className="h-9 px-3 text-sm text-white hover:opacity-90 bg-blue-600 hover:bg-blue-700 hover:text-white"
              onClick={doOpenRetakeDoneDocument}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Thu hồi hoàn thành
            </Button>
          )}
        {isCanHandleDoc &&
          selectedList?.[0] &&
          canRequestReview &&
          Constant.EVALUTE_BCY && (
            <Button
              className="h-9 px-3 text-sm text-white hover:opacity-90 bg-blue-600 hover:bg-blue-700 hover:text-white"
              onClick={doRequestEvaluate}
            >
              <Eye className="w-4 h-4 mr-2" />
              Xin đánh giá
            </Button>
          )}
        {isCanHandleDoc &&
          selectedList?.[0] &&
          canReview &&
          Constant.EVALUTE_BCY && (
            <Button
              className="h-9 px-3 text-sm text-white hover:opacity-90 bg-blue-600 hover:bg-blue-700 hover:text-white"
              onClick={doEvaluate}
            >
              <Eye className="w-4 h-4 mr-2" />
              Đánh giá
            </Button>
          )}

        {selectedRowKeys.length === 1 && (
          <Button
            className="text-white hover:text-white bg-blue-600 hover:bg-blue-700"
            onClick={() => setOpenWorkAssignDialog(true)}
          >
            <Plus className="w-4 h-4 mr-1" />
            Giao việc
          </Button>
        )}
      </div>
      {/* Status Tabs với Document Type Selector */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          {(["waitHandleTab", "handlingTab", "doneTab"] as const).map((k) => {
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
                  setPage(1);
                  setPosId("");
                  setSelectedRowKeys([]);
                  setIsAdvancedSearchExpanded(false);
                  router.push(
                    `/document-out/combine?page=1&size=${itemsPerPage}&currentTab=${k}`
                  );
                }}
                className={cn(
                  "flex items-center gap-1 px-3 h-9 text-xs font-medium rounded transition-all duration-200",
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

        <EncryptDisplaySelect selectClassName="w-36 h-9 text-xs" />
      </div>
      {/* Position selection (parity) */}
      {isBpmnChanhVanPhong && listPositions.length > 0 && (
        <div className="flex items-center gap-2 mt-3 mb-1">
          <span className="text-xs font-semibold text-gray-600">Vị trí:</span>
          <select
            value={posId}
            onChange={(e) => setPosId(e.target.value)}
            className="border rounded px-2 py-1 text-xs h-9"
          >
            <option value="">-- Chọn --</option>
            {listPositions.map((p) => (
              <option key={p.id} value={p.id}>
                {(p.name || "")
                  .replaceAll("Chánh văn Phòng", "VB đến Văn phòng")
                  .replaceAll("Trợ lý Trưởng ban", "VB đến Ban")}
              </option>
            ))}
          </select>
        </div>
      )}
      <Table<DocumentOutItem>
        sortable={true}
        clientSort={false}
        columns={columns}
        dataSource={rows}
        itemsPerPage={itemsPerPage}
        currentPage={page}
        onPageChange={(p) => {
          setPage(p);
          const sortParams = sortBy
            ? `&sortBy=${sortBy}&direction=${direction}`
            : "";
          router.push(
            `/document-out/combine?page=${p}&size=${itemsPerPage}&currentTab=${status}${sortParams}`
          );
        }}
        totalItems={total}
        showPagination
        emptyText={<EmptyDocument />}
        loading={showLoading}
        hasAllChange
        onRowClick={(r) => {
          router.push(`/document-out/combine/detail/${r.docId}`);
        }}
        onItemsPerPageChange={(n) => {
          setItemsPerPage(n);
          setPage(1);
          const sortParams = sortBy
            ? `&sortBy=${sortBy}&direction=${direction}`
            : "";
          setTimeout(() => {
            router.push(
              `/document-out/combine?page=1&size=${n}&currentTab=${status}${sortParams}`
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

          return cn(
            bg,
            status === "waitHandleTab" && !item.read && "font-bold",
            "group",
            {
              "hover:!bg-gray-100": bg === "bg-gray-100",
              "hover:!bg-red-200": bg === "bg-red-200",
              "hover:!bg-yellow-200": bg === "bg-yellow-200",
              "hover:!bg-red-600": bg === "bg-red-600",
              "hover:!bg-blue-600": bg === "bg-blue-600",
              "hover:!bg-black": bg === "bg-black",
            }
          );
        }}
        rowTextColor={(item: DocumentOutItem) => getRowTextColor(item)}
        onSort={handleSortChange}
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
          <div
            className="flex items-center gap-2 clickable"
            onClick={() => {
              setDayLeft("0");
              setPage(1);
            }}
          >
            <div className="w-4 h-4 bg-red-600 rounded border"></div>
            <span className="text-sm text-gray-700">Quá hạn</span>
          </div>
          <div
            className="flex items-center gap-2 clickable"
            onClick={() => {
              setDayLeft("3");
              setPage(1);
            }}
          >
            <div className="w-4 h-4 bg-blue-600 rounded border"></div>
            <span className="text-sm text-gray-700">
              Hạn xử lý không quá 3 ngày
            </span>
          </div>
          <div
            className="flex items-center gap-2 clickable"
            onClick={() => {
              setDayLeft("4");
              setPage(1);
            }}
          >
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
        docId={selectedRowKeys as string[]}
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
        currentDeadline={
          selectedList?.[0]?.deadline
            ? formatDate(selectedList?.[0]?.deadline)
            : null
        }
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
        onClose={() =>
          showStepRetakeModal
            ? setShowStepRetakeModal(false)
            : setShowRetakeByStepModal(false)
        }
        nodeHandleByUser={selectedList?.[0]?.processNode}
        type={showStepRetakeModal ? "step-retake" : "retake"}
        title={showStepRetakeModal ? "Thu hồi chuyển xử lý" : "Thu hồi văn bản"}
        showRetakeByStepModal={showRetakeByStepModal || showStepRetakeModal}
        setShowRetakeByStepModal={
          showStepRetakeModal
            ? setShowStepRetakeModal
            : setShowRetakeByStepModal
        }
      />
      <RetakeDoneDocument
        docId={selectedRowKeys?.[0]?.toString()}
        onClose={() => setShowRetakeDoneModal(false)}
        showRetakeDoneModal={showRetakeDoneModal}
        setShowRetakeDoneModal={setShowRetakeDoneModal}
      />
      <ProgressControlDialog
        documentId={showProgressControlModal.data?.docId || ""}
        currentProgress={showProgressControlModal.data?.progress}
        currentTab={showProgressControlModal.data?.tab}
        onSuccess={() =>
          setShowProgressControlModal({
            open: false,
            data: { docId: "", progress: 0, tab: "" },
          })
        }
        isOpen={showProgressControlModal.open}
        onOpenChange={(open: boolean) =>
          setShowProgressControlModal({
            open,
            data: { docId: "", progress: 0, tab: "" },
          })
        }
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
      {openWorkAssignDialog && (
        <WorkAssignDialog
          open={openWorkAssignDialog}
          onClose={() => {
            setOpenWorkAssignDialog(false);
          }}
          // isAddChildTask={true}
          // parentTaskFromDetail={selectedRowKeys?.[0]?.toString()}
          documentDetail={selectedDocuments[0]}
          documentType={Constant.HSTL_DOCUMENT_TYPE.VAN_BAN_DEN}
        />
      )}{" "}
    </div>
  );
});

export default DocumentOutCombinePage;
