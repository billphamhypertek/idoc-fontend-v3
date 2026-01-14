"use client";
import AttachmentDialog2 from "@/components/common/AttachmentDialog2";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
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
import { useGetNextNodes, useGetStartNodes } from "@/hooks/data/bpmn.data";
import {
  DocumentOutMode,
  DocumentOutStatus,
  useGetDocumentOutListByStatus,
  useToggleImportant,
} from "@/hooks/data/document-out.data";
import { useFileViewer } from "@/hooks/useFileViewer";
import { cn } from "@/lib/utils";
import { downloadFileTable } from "@/services/file.service";
import { canViewNoStatus, toDateOnly } from "@/utils/common.utils";
import { formatDate } from "@/utils/datetime.utils";
import {
  Calendar,
  CheckCircle,
  Clock,
  FileCheck,
  Paperclip,
  MessageCircle,
  Pencil,
  RotateCcw,
  RotateCcw as RotateCcwIcon,
  RotateCw,
  Search,
  Star,
  Star as StarIcon,
  ThumbsUp,
  Undo2,
  UserPlus,
  Plus,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { memo, useEffect, useMemo, useState } from "react";
import { useGetCategoriesByCode } from "@/hooks/data/category.data";
import { EmptyDocument } from "@/components/common/EmptyDocument";
import { useEncryptStore } from "@/stores/encrypt.store";
import { EncryptionService } from "@/services/encryption.service";
import WorkAssignDialog from "@/components/work-assign/createDialog";

type StatusKey = "waitHandleTab" | "handlingTab" | "doneTab";
const STATUS_LABEL: Record<
  StatusKey,
  { label: string; icon: React.ComponentType<any> }
> = {
  waitHandleTab: { label: "Chưa xử lý", icon: Clock },
  handlingTab: { label: "Đã xử lý", icon: FileCheck },
  doneTab: { label: "Hoàn Thành", icon: CheckCircle },
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

const WHITE_CHECKBOX =
  "w-3.5 h-3.5 bg-white border border-neutral-600 shadow-sm " +
  "data-[state=checked]:bg-white data-[state=checked]:text-blue-600";

const Cell: React.FC<React.PropsWithChildren<{ className?: string }>> = ({
  className,
  children,
}) => (
  <div className={cn("[&_*]:transition-colors", className)}>{children}</div>
);

const DocumentOutMainPage = memo(function DocumentOutMainPage() {
  const { isEncrypt } = useEncryptStore();
  const sp = useSearchParams();

  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const currentTab = sp?.get("currentTab");
  const paramPage = sp?.get("page");
  const paramSize = sp?.get("size");
  useEffect(() => {
    if (currentTab) setStatus(currentTab as StatusKey);
    if (paramSize) setItemsPerPage(Number(paramSize));
    if (paramPage) setPage(Number(paramPage));
  }, [sp]);

  const pathname = usePathname();
  const router = useRouter();
  const [text, setText] = useState("");
  const [showSwitchUserModal, setShowSwitchUserModal] = useState(false);
  const [status, setStatus] = useState<StatusKey>("waitHandleTab");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [showProcessDoneModal, setShowProcessDoneModal] = useState({
    open: false,
    isFinishReceive: false,
  });

  const { viewFile } = useFileViewer();
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
  const [advancedSearch, setAdvancedSearch] = useState(
    defaultAdvanceSearchState
  );
  const [appliedAdvancedSearch, setAppliedAdvancedSearch] = useState(
    defaultAdvanceSearchState
  );
  const [isAdvancedSearchExpanded, setIsAdvancedSearchExpanded] =
    useState(false);

  const { mutate: toggleImportant, isPending: isTogglingImportant } =
    useToggleImportant();
  const { data: docTypeCategory } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.DOC_TYPE
  );

  const [openAttach, setOpenAttach] = useState(false);
  const [listNextNodeOrg, setListNextNodeOrg] = useState<any[]>([]);
  const [selectedAttachments, setSelectedAttachments] = useState<any[]>([]);
  const [showProgressControlModal, setShowProgressControlModal] = useState({
    open: false,
    data: { docId: "", progress: 0, tab: "" },
  });

  const handleAttachmentClick = (row: DocumentOutItem) => {
    setSelectedAttachments(row.attachments || []);
    setOpenAttach(true);
  };
  const [listNextNode, setListNextNode] = useState<any[]>([]);
  const { data: startNodes } = useGetStartNodes("INCOMING");

  const isCanHandleDoc = !isEncrypt;

  const [sortBy, setSortBy] = useState("");
  const [sortDirection, setSortDirection] = useState<"ASC" | "DESC">("DESC");
  const [dateSearch, setDateSearch] = useState<number | null>(null);

  const [openWorkAssignDialog, setOpenWorkAssignDialog] = useState(false);

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
        preview: appliedAdvancedSearch.preview,
        docTypeId: appliedAdvancedSearch.docTypeId,
        docFieldsId: appliedAdvancedSearch.docFieldsId,
        important: appliedAdvancedSearch.important,
        expired: appliedAdvancedSearch.expired,
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
    isAdvancedSearchExpanded,
    appliedAdvancedSearch,
    sortBy,
    sortDirection,
    dateSearch,
  ]);

  const { data, isLoading, isError, error } = useGetDocumentOutListByStatus(
    STATUS_MAP[status],
    params,
    DocumentOutMode.MAIN
  );

  useEffect(() => {
    if (isEncrypt) EncryptionService.isCheckStartUsbTokenWatcher();
  }, [isEncrypt]);

  const rows = data?.objList ?? [];
  const total = data?.totalRecord ?? 0;

  const selectedDocuments = useMemo(
    () => rows.filter((r) => selectedRowKeys.includes(r.docId)),
    [rows, selectedRowKeys]
  );

  const currentDocument = useMemo(() => {
    if (selectedRowKeys.length !== 1) return null;
    return rows.find((r) => r.docId === selectedRowKeys[0]) ?? null;
  }, [rows, selectedRowKeys]);

  // Lấy danh sách node tiếp theo theo tài liệu được chọn (nếu có),
  // nếu chưa chọn tài liệu hoặc processNode trống thì dùng startNodes
  const { data: _nextNodes } = useGetNextNodes(
    currentDocument?.processNode ?? null
  );

  useEffect(() => {
    // Ưu tiên nextNodes khi đã có processNode cho tài liệu hiện tại,
    // ngược lại fallback sang startNodes
    const sourceNodes = (
      currentDocument?.processNode ? _nextNodes : startNodes
    ) as any[] | undefined;

    if (!sourceNodes) {
      setListNextNode([]);
      setListNextNodeOrg([]);
      return;
    }

    // Giống Angular: listNextNode = !allowMultiple && !lastNode; listNextNodeOrg = allowMultiple
    const nonMulti = sourceNodes.filter(
      (x: any) => !x.allowMultiple && !x.lastNode
    );
    const multi = sourceNodes.filter((x: any) => x.allowMultiple);
    setListNextNode(nonMulti);
    setListNextNodeOrg(multi);
  }, [startNodes, _nextNodes, currentDocument?.processNode]);

  const buttonStatus = currentDocument?.button || {
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
  };

  const selectedList = useMemo(() => {
    return selectedRowKeys.map((key) => rows.find((r) => r.docId === key));
  }, [selectedRowKeys, rows]);

  const firstProcessNode =
    selectedRowKeys.length > 0
      ? rows.find((r) => r.docId === selectedRowKeys[0])?.processNode
      : null;

  // ===== helper: phân loại deadline (null => không áp dụng) =====
  const getDeadlineBucket = (deadline?: number | null) => {
    if (deadline == null) return null;
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    const diffMs = deadline - endOfToday.getTime();
    const daysLeft = Math.ceil(diffMs / Constant.TIME_MILISECOND_24H);
    if (daysLeft < 0) return "OVERDUE";
    if (daysLeft <= 3) return "WITHIN_3";
    return "AFTER_3";
  };

  // ===== màu nhãn trạng thái (badge) =====
  const getStatusColors = (statusName: string) => {
    const status = statusName?.toLowerCase() || "";

    if (status.includes("đang xử lý")) {
      return { bg: "bg-red-200", text: "text-red-900" };
    } else if (status.includes("trả lại")) {
      return { bg: "bg-yellow-200", text: "text-yellow-900" };
    } else if (status.includes("quá hạn")) {
      return { bg: "bg-red-600", text: "text-white" };
    } else if (
      status.includes("hạn xử lý không quá 3 ngày") ||
      status.includes("hạn xử lý <= 3 ngày")
    ) {
      return { bg: "bg-blue-600", text: "text-white" };
    } else if (
      status.includes("hạn xử lý hơn 3 ngày") ||
      status.includes("Hạn xử lý hơn 3 ngày")
    ) {
      return { bg: "bg-black", text: "text-white" };
    }

    return { bg: "bg-gray-100", text: "text-gray-900" };
  };

  const getStrongBg = (item: DocumentOutItem): string | null => {
    const bucket = getDeadlineBucket(item?.deadline ?? null);
    if (bucket === "OVERDUE") return "bg-red-600";
    if (bucket === "WITHIN_3") return "bg-blue-600";
    if (bucket === "AFTER_3") return "bg-black";
    const statusName = (
      item?.pstatusName ??
      item?.docStatusName ??
      ""
    ).toLowerCase();
    if (statusName.includes("trả lại")) return "bg-yellow-200";
    return null;
  };

  // ===== NỀN HÀNG =====
  const getRowBackgroundColor = (item: DocumentOutItem) => {
    const strongBg = getStrongBg(item);
    if (item?.read === false) return strongBg ?? "bg-white";
    if (strongBg) return strongBg;
    const statusName = (
      item?.pstatusName ??
      item?.docStatusName ??
      ""
    ).toLowerCase();
    if (statusName.includes("đang xử lý")) return "bg-red-200";
    return "bg-gray-100";
  };

  // ===== MÀU & ĐỘ ĐẬM CHỮ =====
  const getRowTextColor = (item: DocumentOutItem) => {
    const strongBg = getStrongBg(item);
    const isUnread = item?.read === false;
    const weight = isUnread ? "font-semibold" : "font-normal";
    const isDark = strongBg === "bg-blue-600" || strongBg === "bg-black";
    if (strongBg)
      return `${isDark ? "text-white hover:!text-white" : "text-gray-900"} ${weight}`;
    return `text-gray-900 ${weight}`;
  };

  const getGroupRowClassName = (item: DocumentOutItem) => {
    const strongBg = getStrongBg(item);
    const groupClassName =
      "group-hover:!text-blue-700 group-hover:[&_a]:!text-blue-700 group-hover:[&_button]:!text-blue-700 group-hover:[&_svg]:!text-blue-700";
    const isDark = strongBg === "bg-blue-600" || strongBg === "bg-black";
    // if (strongBg)
    //   return `${!isDark ? groupClassName : "group-hover:!text-white group-hover:[&_a]:!text-white group-hover:[&_button]:!text-white group-hover:[&_svg]:!text-white !text-white "}`;
    // return groupClassName;
    return isDark ? "!text-white hover:!text-white" : "";
  };

  const openProgressControl = (document: DocumentOutItem) => {
    setShowProgressControlModal({
      open: true,
      data: {
        docId: String(document.docId),
        progress: Number(document.progress),
        tab: "",
      },
    });
  };

  // Handler cho sort từ Table
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
      `/document-out/main?page=1&size=${itemsPerPage}&currentTab=${status}`
    );
  };

  // ====== CỘT DẪN ======
  const leadingCols: Column<DocumentOutItem>[] = [
    {
      header: "STT",
      accessor: (r, idx) => {
        const stt = (page - 1) * itemsPerPage + idx + 1;
        const checked = selectedRowKeys.includes(r.docId);
        const strongBg = getStrongBg(r);
        const isDark = strongBg === "bg-blue-600" || strongBg === "bg-black";

        return (
          <Cell className={getGroupRowClassName(r)}>
            <div className="flex items-center justify-center gap-3">
              <span className={isDark ? "!text-white" : ""}>{stt}</span>
              {!isEncrypt && (
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
                  className={cn(
                    isDark && [
                      "!border-white",
                      "data-[state=checked]:!bg-white",
                      "data-[state=checked]:!text-blue-600",
                      "[&>svg]:!stroke-blue-600",
                    ]
                  )}
                  style={
                    isDark
                      ? {
                          borderColor: "white",
                          backgroundColor: checked ? "white" : "transparent",
                        }
                      : undefined
                  }
                />
              )}
            </div>
          </Cell>
        );
      },
      className: "text-center w-[90px]",
      sortable: false,
    },
    {
      header: <Star className="w-4 h-4 stroke-gray-400 stroke-2" />,
      type: "actions",
      sortKey: "IMPORTANT",
      className: "text-center w-10",
      renderActions: (r) => {
        const starred = Boolean(r.important);
        const isLoading = isTogglingImportant;
        return (
          <Cell
            className={cn(
              "flex items-center justify-center",
              getGroupRowClassName(r)
            )}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                toggleImportant({ docId: r.docId, important: !starred });
              }}
              aria-label={starred ? "Bỏ đánh dấu" : "Đánh dấu"}
              title={starred ? "Bỏ đánh dấu" : "Đánh dấu"}
              className="inline-flex items-center justify-center disabled:opacity-50"
              disabled={isLoading}
            >
              <Star
                className={cn(
                  "h-4 w-4 transition-all duration-200",
                  starred
                    ? "fill-yellow-400 stroke-yellow-600 stroke-2"
                    : "stroke-gray-400 stroke-2",
                  isLoading && "animate-pulse"
                )}
              />
            </button>
          </Cell>
        );
      },
    },
  ];

  // ====== CỘT THEO TRẠNG THÁI ======
  const columnsTodo: Column<DocumentOutItem>[] = [
    ...leadingCols,
    {
      header: "Ngày văn bản",
      sortKey: "DATE_ARRIVAL",
      accessor: (r) => (
        <Cell className={getGroupRowClassName(r)}>
          {formatDate(r.dateArrival)}
        </Cell>
      ),
      className: "text-center whitespace-nowrap tabular-nums w-48 py-2",
    },
    {
      header: "Ngày văn bản đến",
      sortKey: "DATEISSUED",
      accessor: (r) => (
        <Cell className={getGroupRowClassName(r)}>
          {formatDate(r.receivedDate)}
        </Cell>
      ),
      className: "text-center whitespace-nowrap tabular-nums w-48 py-2",
    },
    {
      header: "Số đến",
      sortKey: "NUMBER_ARRIVAL",
      accessor: (r) => (
        <Cell className={getGroupRowClassName(r)}>{r.numberArrival ?? ""}</Cell>
      ),
      className: "text-center w-[80px]",
    },
    {
      header: "Trích yếu",
      sortKey: "PREVIEW",
      accessor: (r) => (
        <Cell className={getGroupRowClassName(r)}>
          <div
            title={r.preview ?? ""}
            className="max-w-[700px] line-clamp-2 text-sm leading-relaxed text-ellipsis"
          >
            {r.preview}
          </div>
        </Cell>
      ),
      className: "text-left min-w-[200px] w-[30%]",
    },
    {
      header: "Đính kèm",
      sortable: false,
      accessor: (r) =>
        (r.attachments?.length ?? 0) > 0 ? (
          <Cell
            className={cn(
              getGroupRowClassName(r),
              "flex items-center justify-center"
            )}
          >
            <button
              type="button"
              onClick={async (e) => {
                e.stopPropagation();
                if (r.attachments?.length === 1) {
                  const attachment = r.attachments[0];
                  if (canViewNoStatus(attachment.name)) {
                    await viewFile(
                      attachment,
                      "",
                      true,
                      Constant.ATTACHMENT.DOWNLOAD
                    );
                  } else {
                    await downloadFileTable(
                      attachment.name,
                      attachment?.displayName ?? ""
                    );
                  }
                  return;
                } else {
                  setSelectedAttachments(r.attachments || []);
                  setOpenAttach(true);
                }
              }}
              className="flex items-center justify-center gap-1 text-blue-600 hover:underline"
              title={`Có ${r.attachments?.length} tệp đính kèm`}
            >
              <Paperclip className="w-4 h-4 text-blue-600" />
            </button>
          </Cell>
        ) : (
          <Cell className={getGroupRowClassName(r)} />
        ),
      className: "text-center w-[90px]",
    },
    {
      header: "Độ mật",
      sortKey: "SECURITY_NAME",
      accessor: (r) => (
        <Cell className={getGroupRowClassName(r)}>{r.securityName ?? ""}</Cell>
      ),
      className: "text-center w-[110px]",
    },
    {
      header: "Độ khẩn",
      sortable: false,
      accessor: (r) => (
        <Cell className={getGroupRowClassName(r)}>
          <span
            className={cn(
              (r.urgentName || "").trim() === "Hỏa tốc" ||
                (r.urgentName || "").trim() === "Hoả tốc"
                ? "text-red-600 font-semibold"
                : ""
            )}
          >
            {r.urgentName ?? ""}
          </span>
        </Cell>
      ),
      className: "text-center w-[110px]",
    },
    {
      header: "Số, KH của VB đến",
      sortable: false,
      accessor: (r) => (
        <Cell className={getGroupRowClassName(r)}>
          {r.numberArrivalStr ?? ""}
        </Cell>
      ),
      className: "text-left w-[180px]",
    },
    {
      header: "Hạn xử lý",
      sortKey: "DEADLINE",
      accessor: (r) => (
        <Cell className={getGroupRowClassName(r)}>
          {formatDate(r.deadline)}
        </Cell>
      ),
      className: "text-center w-[40px]",
    },
    {
      header: "Trạng thái xử lý",
      sortKey: "PROCESS_STATUS",
      accessor: (r) => {
        const statusName = r.docStatusName ?? "";
        return (
          <Cell className={getGroupRowClassName(r)}>
            <span className="text-xs font-medium">{statusName}</span>
          </Cell>
        );
      },
      className: "text-center w-[70px]",
    },
    {
      header: <span className="blocktext-center w-full">Tiến độ</span>,
      sortKey: "PROGRESS",
      accessor: (r) => {
        const progressValue = parseInt(
          String(r.progress ?? "0")?.replace("%", "")
        );
        const pct = Math.max(0, Math.min(progressValue, 100));
        return (
          <Cell>
            <div
              className="relative w-[100px] h-2.5 rounded-full bg-gray-200 overflow-hidden cursor-pointer"
              onClick={(e) => {
                e.stopPropagation();
                openProgressControl(r);
              }}
              title={r.comment ? `${pct}% - ${r.comment}` : `${pct}%`}
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
          </Cell>
        );
      },
      className: "text-center min-w-[30px] w-[30px] px-1",
    },
  ];

  const columnsProcessed: Column<DocumentOutItem>[] = [
    ...leadingCols,
    {
      header: "Ngày văn bản",
      sortKey: "DATE_ARRIVAL",
      accessor: (r) => (
        <Cell className={getGroupRowClassName(r)}>
          {formatDate(r.dateArrival)}
        </Cell>
      ),
      className: "text-center whitespace-nowrap tabular-nums w-48 py-2",
    },
    {
      header: "Ngày văn bản đến",
      sortKey: "DATEISSUED",
      accessor: (r) => (
        <Cell className={getGroupRowClassName(r)}>
          {formatDate(r.receivedDate)}
        </Cell>
      ),
      className: "text-center whitespace-nowrap tabular-nums w-48 py-2",
    },
    {
      header: "Ngày vào sổ",
      sortKey: "DATEISSUED",
      accessor: (r) => (
        <Cell className={getGroupRowClassName(r)}>
          {formatDate(r.receivedDate)}
        </Cell>
      ),
      className: "text-center whitespace-nowrap tabular-nums w-48 py-2",
    },
    {
      header: "Số đến",
      sortKey: "NUMBER_ARRIVAL",
      accessor: (r) => (
        <Cell className={getGroupRowClassName(r)}>{r.numberArrival ?? ""}</Cell>
      ),
      className: "text-center w-[70px]",
    },
    {
      header: "Trích yếu",
      sortKey: "PREVIEW",
      accessor: (r) => (
        <Cell className={getGroupRowClassName(r)}>
          <span
            title={r.preview ?? ""}
            className="max-w-[700px] line-clamp-2 text-sm leading-relaxed text-ellipsis"
          >
            {r.preview}
          </span>
        </Cell>
      ),
      className: "text-left min-w-[200px] w-[30%]",
    },
    {
      header: "Đính kèm",
      sortable: false,
      accessor: (r) =>
        (r.attachments?.length ?? 0) > 0 ? (
          <Cell className="flex items-center justify-center">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (r.attachments?.length === 1) {
                  const attachment = r.attachments[0];
                  if (canViewNoStatus(attachment.name)) {
                    viewFile(
                      attachment.name,
                      "",
                      true,
                      Constant.ATTACHMENT.DOWNLOAD
                    );
                  } else {
                    downloadFileTable(
                      attachment.name,
                      attachment?.displayName ?? ""
                    );
                  }
                  return;
                } else {
                  setSelectedAttachments(r.attachments || []);
                  setOpenAttach(true);
                }
              }}
              className="flex items-center justify-center gap-1 text-blue-600 hover:underline"
              title={`Có ${r.attachments?.length} tệp đính kèm`}
            >
              <Paperclip className="w-4 h-4 text-blue-600" />
            </button>
          </Cell>
        ) : (
          <Cell />
        ),
      className: "text-center w-[90px]",
    },
    {
      header: "Độ mật",
      sortKey: "SECURITY_NAME",
      accessor: (r) => (
        <Cell className={getGroupRowClassName(r)}>{r.securityName ?? ""}</Cell>
      ),
      className: "text-center w-[90px]",
    },
    {
      header: "Độ khẩn",
      sortable: false,
      accessor: (r) => (
        <Cell className={getGroupRowClassName(r)}>
          <span
            className={cn(
              (r.urgentName || "").trim() === "Hỏa tốc" ||
                (r.urgentName || "").trim() === "Hoả tốc"
                ? "text-red-600 font-semibold"
                : ""
            )}
          >
            {r.urgentName ?? ""}
          </span>
        </Cell>
      ),
      className: "text-center w-[90px]",
    },
    {
      header: "Số, KH của VB đến",
      sortable: false,
      accessor: (r) => (
        <Cell className={getGroupRowClassName(r)}>
          {r.numberArrivalStr ?? ""}
        </Cell>
      ),
      className: "text-left w-[150px]",
    },
    {
      header: "Người xử lý",
      sortKey: "PERSON_HANDLE",
      accessor: (r) => (
        <Cell className={getGroupRowClassName(r)}>{r.nextHandle ?? ""}</Cell>
      ),
      className: "text-left w-[150px]",
    },
    {
      header: "Hạn xử lý",
      sortKey: "DEADLINE",
      accessor: (r) => (
        <Cell className={getGroupRowClassName(r)}>
          {formatDate(r.deadline)}
        </Cell>
      ),
      className: "text-center w-[120px]",
    },
    {
      header: "Trạng thái",
      sortKey: "STATUS",
      accessor: (r) => {
        const statusName = r.pstatusName ?? r.docStatusName ?? "";
        const colors = getStatusColors(statusName);
        const strongBg = getStrongBg(r);
        const isDark = strongBg === "bg-blue-600" || strongBg === "bg-black";
        return (
          <Cell className={getGroupRowClassName(r)}>
            <span
              className={`px-2 py-1 rounded-md text-xs font-medium ${colors.bg} ${isDark ? "!text-gray-900" : colors.text}`}
            >
              {statusName}
            </span>
          </Cell>
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
      accessor: (r) => (
        <Cell className={getGroupRowClassName(r)}>
          {formatDate(r.dateArrival)}
        </Cell>
      ),
      className: "text-center whitespace-nowrap tabular-nums w-48 py-2",
    },
    {
      header: "Ngày văn bản đến",
      sortKey: "DATEISSUED",
      accessor: (r) => (
        <Cell className={getGroupRowClassName(r)}>
          {formatDate(r.dateIssued)}
        </Cell>
      ),
      className: "text-center whitespace-nowrap tabular-nums w-48 py-2",
    },
    {
      header: "Ngày vào sổ",
      sortKey: "DATEISSUED",
      accessor: (r) => (
        <Cell className={getGroupRowClassName(r)}>
          {formatDate(r.dateIssued)}
        </Cell>
      ),
      className: "text-center whitespace-nowrap tabular-nums w-48 py-2",
    },
    {
      header: "Số đến",
      sortKey: "NUMBER_ARRIVAL",
      accessor: (r) => (
        <Cell className={getGroupRowClassName(r)}>{r.numberArrival ?? ""}</Cell>
      ),
      className: "text-center w-[80px]",
    },
    {
      header: "Trích yếu",
      sortKey: "PREVIEW",
      accessor: (r) => (
        <Cell className={getGroupRowClassName(r)}>
          <span
            title={r.preview ?? ""}
            className="max-w-[700px] line-clamp-2 text-sm leading-relaxed text-ellipsis"
          >
            {r.preview}
          </span>
        </Cell>
      ),
      className: "text-left min-w-[200px] w-[30%]",
    },
    {
      header: "Đính kèm",
      sortable: false,
      accessor: (r) =>
        (r.attachments?.length ?? 0) > 0 ? (
          <Cell
            className={cn(
              "flex items-center justify-center",
              getGroupRowClassName(r)
            )}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (r.attachments?.length === 1) {
                  const attachment = r.attachments[0];
                  if (canViewNoStatus(attachment.name)) {
                    viewFile(
                      attachment.name,
                      "",
                      true,
                      Constant.ATTACHMENT.DOWNLOAD
                    );
                  } else {
                    downloadFileTable(
                      attachment.name,
                      attachment?.displayName ?? ""
                    );
                  }
                  return;
                } else {
                  setSelectedAttachments(r.attachments || []);
                  setOpenAttach(true);
                }
              }}
              className="flex items-center justify-center gap-1 text-blue-600 hover:underline"
              title={`Có ${r.attachments?.length} tệp đính kèm`}
            >
              <Paperclip className="w-4 h-4 text-blue-600" />
            </button>
          </Cell>
        ) : (
          <Cell className={getGroupRowClassName(r)} />
        ),
      className: "text-center w-[90px]",
    },
    {
      header: "Độ mật",
      sortKey: "SECURITY_NAME",
      accessor: (r) => (
        <Cell className={getGroupRowClassName(r)}>{r.securityName ?? ""}</Cell>
      ),
      className: "text-center w-[90px]",
    },
    {
      header: "Độ khẩn",
      sortable: false,
      accessor: (r) => (
        <Cell className={getGroupRowClassName(r)}>
          <span
            className={cn(
              (r.urgentName || "").trim() === "Hỏa tốc" ||
                (r.urgentName || "").trim() === "Hoả tốc"
                ? "text-red-600 font-semibold"
                : ""
            )}
          >
            {r.urgentName ?? ""}
          </span>
        </Cell>
      ),
      className: "text-center w-[90px]",
    },
    {
      header: "Số, KH của VB đến",
      sortable: false,
      accessor: (r) => (
        <Cell className={getGroupRowClassName(r)}>
          {r.numberArrivalStr ?? ""}
        </Cell>
      ),
      className: "text-left w-[150px]",
    },
    {
      header: "Hạn xử lý",
      sortKey: "DEADLINE",
      accessor: (r) => (
        <Cell className={getGroupRowClassName(r)}>
          {formatDate(r.deadline)}
        </Cell>
      ),
      className: "text-center w-[120px]",
    },
    {
      header: "Trạng thái xử lý",
      sortKey: "PROCESS_STATUS",
      accessor: (r) => {
        const statusName = r.docStatusName ?? "";
        const colors = getStatusColors(statusName);
        return (
          <Cell className={getGroupRowClassName(r)}>
            <span
              className={`px-2 py-1 rounded-md text-xs font-medium ${colors.bg} ${colors.text} ${getGroupRowClassName(r)}`}
            >
              {statusName}
            </span>
          </Cell>
        );
      },
      className: "text-center w-[120px]",
    },
  ];

  const columns =
    status === "handlingTab"
      ? columnsProcessed
      : status === "doneTab"
        ? columnsDone
        : columnsTodo;

  // Angular shows continuous loading on error, not error message
  // This prevents UI breaking when sort by security returns error
  const showLoading = isLoading || isError;

  const handleDateSearchChange = (value: string) => {
    const numValue = value === "all" ? null : Number(value);
    setDateSearch(numValue);
    setPage(1);
  };

  const goToDetailPage = (document: DocumentOutItem) => {
    const isEvaluate = document.pstatusName === "Chờ đánh giá";
    const queryParams = new URLSearchParams({
      orgTransfer: String(document.pstatus === "CHUYEN_DON_VI"),
      isEvaluate: String(isEvaluate),
      previousUrl: pathname || "",
    });
    router.push(
      `/document-out/main/detail/${document.docId}?${queryParams.toString()}`
    );
  };

  const currentDeadlineDateOnly: string | undefined = toDateOnly(
    selectedList?.[0]?.deadline as number | string | null | undefined
  );

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
          currentPage="Danh sách văn bản xử lý chính"
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
          preview={advancedSearch.preview}
          onChangePreview={(v) => {
            setAdvancedSearch((p) => ({
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
          docTypeId={advancedSearch.docTypeId}
          onChangeDocType={(val) => {
            setAdvancedSearch((p) => ({
              ...p,
              docTypeId: val === "all" ? "" : val,
            }));
          }}
          important={advancedSearch.important}
          onChangeImportant={(val) => {
            setAdvancedSearch((p) => ({
              ...p,
              important: val === "all" ? "" : val,
            }));
          }}
          expired={advancedSearch.expired}
          onChangeExpired={(val) => {
            setAdvancedSearch((p) => ({
              ...p,
              expired: val === "all" ? "" : val,
            }));
          }}
          onSubmit={() => {
            setAppliedAdvancedSearch(advancedSearch);
            setPage(1);
          }}
          extraBtn={
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setAppliedAdvancedSearch(defaultAdvanceSearchState);
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
          Constant.SWITCH_AND_ADD_USER_BCY &&
          isCanHandleDoc && (
            <Button
              className="h-9 px-3 text-white border-0 bg-blue-600 hover:bg-blue-700 hover:text-white"
              onClick={() => setShowSwitchUserModal(true)}
            >
              <UserPlus className="w-4 h-4 mr-1" />
              Thêm xử lý
            </Button>
          )}

        {selectedRowKeys.length === 1 &&
          status === "waitHandleTab" &&
          buttonStatus.canAsk &&
          Constant.ASK_IDEA_H05 &&
          isCanHandleDoc && (
            <Button
              className="h-9 bg-[rgb(71,152,232)] text-white hover:bg-[rgb(61,132,202)]"
              onClick={() => setShowAskIdeaModal(true)}
            >
              <MessageCircle className="w-4 h-4 mr-2" />
              Xin ý kiến
            </Button>
          )}

        {currentDocument?.allowConfig &&
          selectedRowKeys.length === 1 &&
          isCanHandleDoc && (
            <Button
              className="h-9 px-3 text-white border-0 bg-blue-600 hover:bg-blue-700 hover:text-white"
              onClick={() => setShowDeadlineModal(true)}
            >
              <Calendar className="w-4 h-4 mr-1" />
              Gia hạn xử lý
            </Button>
          )}

        {selectedRowKeys.length === 1 &&
          status === "waitHandleTab" &&
          selectedDocuments.every((d) => d?.button?.canTransfer) &&
          isCanHandleDoc &&
          (listNextNode?.length ?? 0) > 0 && (
            <TransferDocumentOut
              selectedItemId={selectedRowKeys[0] as number}
              disabled={false}
              onSuccess={() => {}}
              listNextNode={listNextNode}
              singleRole={listNextNode.length === 1 ? listNextNode[0] : null}
            />
          )}
        {Constant.ORG_MULTI_TRANSFER_BCY &&
          selectedRowKeys.length > 0 &&
          status === "waitHandleTab" &&
          selectedDocuments.every((d) => d?.button?.canOrgTransfer) &&
          isCanHandleDoc &&
          (listNextNodeOrg?.length ?? 0) > 0 && (
            <TransferDocumentOut
              selectedItemId={Number(selectedRowKeys[0])}
              disabled={false}
              onSuccess={() => {}}
              listNextNode={listNextNodeOrg}
              unit
              singleRole={
                listNextNodeOrg.length === 1 ? listNextNodeOrg[0] : null
              }
            />
          )}

        {(status === "waitHandleTab" || status === "handlingTab") &&
          selectedDocuments.every((d) => d?.button?.canDone) &&
          selectedRowKeys.length > 0 &&
          isCanHandleDoc && (
            <Button
              className="h-9 px-3 text-white border-0 hover:text-white bg-blue-600 hover:bg-blue-700"
              onClick={() =>
                setShowProcessDoneModal({ open: true, isFinishReceive: false })
              }
            >
              <CheckCircle className="w-4 h-4 mr-1" />
              Hoàn thành xử lý
            </Button>
          )}

        {status === "waitHandleTab" &&
          selectedRowKeys.length === 1 &&
          buttonStatus.canFinish &&
          isCanHandleDoc && (
            <Button
              className="h-9 px-3 text-white border-0 hover:text-white bg-blue-600 hover:bg-blue-700"
              onClick={() =>
                setShowProcessDoneModal({ open: true, isFinishReceive: true })
              }
            >
              <FileCheck className="w-4 h-4 mr-1" />
              Hoàn thành văn bản
            </Button>
          )}

        {selectedRowKeys.length === 1 &&
          buttonStatus.canReturn &&
          isCanHandleDoc && (
            <Button
              className="bg-blue-600 hover:bg-blue-700 h-9 px-3 text-white border-0 hover:text-white"
              onClick={() => setShowRejectModal(true)}
            >
              <Undo2 className="w-4 h-4 mr-1" />
              Trả lại
            </Button>
          )}

        {Constant.RETAKE_BY_STEP_BCY &&
          (status === "handlingTab" || status === "doneTab") &&
          selectedRowKeys.length === 1 &&
          buttonStatus.canRetake &&
          isCanHandleDoc && (
            <Button
              className="bg-blue-600 hover:bg-blue-700 h-9 px-3 text-white border-0 hover:text-white"
              onClick={() => setShowRetakeByStepModal(true)}
            >
              <RotateCcwIcon className="w-4 h-4 mr-1" />
              Thu hồi
            </Button>
          )}

        {Constant.RETAKE_BY_STEP_BCY &&
          (status === "handlingTab" || status === "doneTab") &&
          selectedRowKeys.length === 1 &&
          buttonStatus.canRetake &&
          isCanHandleDoc && (
            <Button
              className="bg-blue-600 hover:bg-blue-700 h-9 px-3 text-white border-0 hover:text-white"
              onClick={() => setShowStepRetakeModal(true)}
            >
              <RotateCw className="w-4 h-4 mr-1" />
              Thu hồi chuyển xử lý
            </Button>
          )}

        {Constant.RETAKE_DONE_DOCUMENT_BCY &&
          status !== "waitHandleTab" &&
          selectedRowKeys.length === 1 &&
          buttonStatus.canRetakeDone &&
          isCanHandleDoc && (
            <Button
              className="h-9 px-3 text-white border-0 hover:text-white bg-blue-600 hover:bg-blue-700"
              onClick={() => setShowRetakeDoneModal(true)}
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Thu hồi hoàn thành
            </Button>
          )}

        {Constant.EVALUTE_BCY &&
          selectedRowKeys.length === 1 &&
          buttonStatus.canRequestReview &&
          isCanHandleDoc && (
            <Button
              className="h-9 px-3 text-white border-0 hover:text-white bg-blue-600 hover:bg-blue-700"
              onClick={() =>
                setShowEvaluateModal({ open: true, isEvaluate: false })
              }
            >
              <StarIcon className="w-4 h-4 mr-1" />
              Xin đánh giá
            </Button>
          )}

        {Constant.EVALUTE_BCY &&
          selectedRowKeys.length === 1 &&
          buttonStatus.canReview &&
          isCanHandleDoc && (
            <Button
              className="h-9 px-3 text-white border-0 hover:text-white bg-blue-600 hover:bg-blue-700"
              onClick={() =>
                setShowEvaluateModal({ open: true, isEvaluate: true })
              }
            >
              <ThumbsUp className="w-4 h-4 mr-1" />
              Đánh giá
            </Button>
          )}

        {selectedRowKeys.length === 1 && (
          <Button
            className="h-9 px-3 text-white border-0 hover:text-white bg-blue-600 hover:bg-blue-700"
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
                  setSelectedRowKeys([]);
                  setIsAdvancedSearchExpanded(false);
                  setSortBy("");
                  setSortDirection("DESC");
                  router.push(
                    `/document-out/main?page=1&size=${itemsPerPage}&currentTab=${k}`
                  );
                  setAdvancedSearch(defaultAdvanceSearchState);
                  setAppliedAdvancedSearch(defaultAdvanceSearchState);
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
        columns={columns}
        dataSource={rows}
        itemsPerPage={itemsPerPage}
        currentPage={page}
        onPageChange={(p) => {
          setPage(p);
          router.push(
            `/document-out/main?page=${p}&size=${itemsPerPage}&currentTab=${status}`
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
              `/document-out/main?page=1&size=${n}&currentTab=${status}`
            );
          }, 0);
        }}
        onRowClick={(row) => {
          goToDetailPage(row);
        }}
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
          rowKey: "docId" as keyof DocumentOutItem,
        }}
        bgColor={"bg-white"}
        rowClassName={(item: DocumentOutItem) =>
          cn(getRowBackgroundColor(item), "group", {
            "hover:!bg-white": getRowBackgroundColor(item) === "bg-white",
            "hover:!bg-gray-100": getRowBackgroundColor(item) === "bg-gray-100",
            "hover:!bg-red-200": getRowBackgroundColor(item) === "bg-red-200",
            "hover:!bg-yellow-200":
              getRowBackgroundColor(item) === "bg-yellow-200",
            "hover:!bg-red-600": getRowBackgroundColor(item) === "bg-red-600",
            "hover:!bg-blue-600": getRowBackgroundColor(item) === "bg-blue-600",
            "hover:!bg-black": getRowBackgroundColor(item) === "bg-black",
          })
        }
        rowTextColor={(item: DocumentOutItem) => getRowTextColor(item)}
        cellClassName={(record?: DocumentOutItem, index?: number) => {
          const bgStrong = getStrongBg(record ?? ({} as DocumentOutItem));
          const isDark = bgStrong === "bg-blue-600" || bgStrong === "bg-black";
          return cn(isDark ? "text-black hover:!text-white" : "text-gray-900");
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

export default DocumentOutMainPage;
