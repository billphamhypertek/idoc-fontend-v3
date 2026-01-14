"use client";

import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import { Table } from "@/components/ui/table";
import type {
  DocumentOutItem,
  FindDocByTypeHandleParams,
  TypeHandle,
} from "@/definitions/types/document-out.type";
import type { Column } from "@/definitions/types/table.type";
import { useGetDocInManipulation } from "@/hooks/data/document-out.data";
import { formatDate } from "@/utils/datetime.utils";
import { memo, useEffect, useMemo, useState } from "react";

import { SearchInput } from "@/components/document-in/SearchInput";
import EncryptDisplaySelect from "@/components/document-out/EncryptDisplaySelect";
import AdvancedSearch from "@/components/document-out/list/AdvancedSearch";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import {
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Clock,
  FileCheck,
  FileText,
  MessageCircle,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import DocumentOutComment from "@/components/document-out/DocumentOutComment";
import { Constant } from "@/definitions/constants/constant";
import { useGetCategoriesByCode } from "@/hooks/data/category.data";
import { EmptyDocument } from "@/components/common/EmptyDocument";
import { useEncryptStore } from "@/stores/encrypt.store";
import { EncryptionService } from "@/services/encryption.service";

type OpinionTab = "CHO_Y_KIEN" | "XIN_Y_KIEN";

const STATUS_LABEL: Record<
  OpinionTab,
  { label: string; icon: React.ComponentType<any> }
> = {
  CHO_Y_KIEN: { label: "Cho ý kiến", icon: FileCheck },
  XIN_Y_KIEN: { label: "Xin ý kiến", icon: Clock },
};

const defaultAdvanceSearchState = {
  startDate: "",
  endDate: "",
  docTypeId: "",
  sign: "",
  preview: "",
  important: "",
  userEnter: "",
  orgName: "",
};

const DocInOpinionPage = memo(function DocInOpinionPage() {
  const { isEncrypt } = useEncryptStore();

  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const router = useRouter();
  const [text, setText] = useState("");
  const [isAdvancedSearchExpanded, setIsAdvancedSearchExpanded] =
    useState(false);
  const [advancedSearch, setAdvancedSearch] = useState(
    defaultAdvanceSearchState
  );
  const [tempAdvancedSearch, setTempAdvancedSearch] = useState(
    defaultAdvanceSearchState
  );
  const [sortBy, setSortBy] = useState("CREATEDATE");
  const [sortDirection, setSortDirection] = useState<"ASC" | "DESC">("DESC");
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [tab, setTab] = useState<OpinionTab>("CHO_Y_KIEN");
  const [currentDocumentId, setCurrentDocumentId] = useState<number | null>(
    null
  );
  const [showCommentModal, setShowCommentModal] = useState(false);
  const { data: docTypeCategory } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.DOC_TYPE
  );

  const isCanHandleDoc = !isEncrypt;

  useEffect(() => {
    if (isEncrypt) EncryptionService.isCheckStartUsbTokenWatcher();
  }, [isEncrypt]);

  const baseParams: FindDocByTypeHandleParams = useMemo(() => {
    const base = {
      dayLeft: "",
      page,
      sortBy,
      direction: sortDirection,
      posId: "",
      size: itemsPerPage,
      typeHandle: 1 as TypeHandle,
    };

    if (isAdvancedSearchExpanded) {
      return {
        ...base,
        preview: advancedSearch.preview,
        docTypeId: advancedSearch.docTypeId,
        important: advancedSearch.important,
        startDate: advancedSearch.startDate,
        endDate: advancedSearch.endDate,
        sign: advancedSearch.sign,
        userEnter: advancedSearch.userEnter,
        orgName: advancedSearch.orgName,
      };
    }

    return {
      ...base,
      text,
    };
  }, [
    advancedSearch,
    isAdvancedSearchExpanded,
    itemsPerPage,
    page,
    sortBy,
    sortDirection,
    text,
  ]);

  const { data, isLoading, isError, error } = useGetDocInManipulation({
    ...baseParams,
    type: tab,
  });

  const raw: any = data;
  const payload = raw?.objList ? raw : (raw?.data ?? raw);

  const rawRows: DocumentOutItem[] = payload?.objList ?? payload?.content ?? [];
  const total: number =
    payload?.totalRecord ?? payload?.totalElements ?? rawRows.length;

  const rows = rawRows; // Use raw data from API (server-side sorting)

  // Handler for sort from Table component
  const handleSort = (
    config: { key: string; direction: "asc" | "desc" | null } | null
  ) => {
    if (!config || !config.direction) {
      setSortBy("CREATEDATE");
      setSortDirection("DESC");
    } else {
      const mappedDirection = config.direction === "asc" ? "ASC" : "DESC";
      setSortBy(config.key);
      setSortDirection(mappedDirection);
    }
    setPage(1); // Reset to page 1 when sorting
  };

  useEffect(() => {
    setSelectedRowKeys([]);
    setCurrentDocumentId(null);
  }, [data, tab]);

  // useEffect(() => {
  //   if (selectedDocumentType === "Văn bản mật") {
  //     enableEncryptionAndWatch();
  //   } else {
  //     removeDataEncrypt();
  //   }
  // }, [selectedDocumentType, enableEncryptionAndWatch]);

  const getCurrentDocumentId = () => {
    return currentDocumentId;
  };

  const doOpenCommentPopup = () => {
    setShowCommentModal(true);
  };
  const leadingCols: Column<DocumentOutItem>[] = [
    {
      header: "STT",
      sortable: false,
      accessor: (r, idx) => {
        const stt = (page - 1) * itemsPerPage + idx + 1;
        const checked = selectedRowKeys.includes(r.docId);
        return (
          <div className="flex items-center justify-center gap-3">
            <span>{stt}</span>
            {tab == "CHO_Y_KIEN" &&
              r.handleStatus == "Chờ cho ý kiến" &&
              !isEncrypt && (
                <Checkbox
                  checked={checked}
                  onCheckedChange={(v) => {
                    if (v) {
                      setSelectedRowKeys([r.docId]);
                      setCurrentDocumentId(r.docId);
                    } else {
                      setSelectedRowKeys([]);
                      setCurrentDocumentId(null);
                    }
                  }}
                  onClick={(e) => e.stopPropagation()}
                  aria-label={`Chọn hàng ${stt}`}
                />
              )}
          </div>
        );
      },
      className: "text-center w-[90px]",
    },
  ];

  const columns: Column<DocumentOutItem>[] = [
    ...leadingCols,
    {
      header: "Ngày văn bản",
      sortKey: "DATE_ARRIVAL",
      accessor: (r) => (
        <span
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/document-out/done/detail/${r.docId}`);
          }}
        >
          {formatDate(r.dateArrival)}
        </span>
      ),
      className: "text-center whitespace-nowrap tabular-nums w-28",
    },
    {
      header: "Ngày vào sổ",
      sortKey: "DATEISSUED",
      accessor: (r) => (
        <span
          onClick={(e) => {
            e.stopPropagation();
            router.push(`/document-out/done/detail/${r.docId}`);
          }}
        >
          {formatDate(r.dateIssued)}
        </span>
      ),
      className: "text-center whitespace-nowrap tabular-nums w-28",
    },
    {
      header: "Số đến",
      sortKey: "NUMBER_ARRIVAL",
      accessor: (r) => {
        const value = r.numberArrival ?? "";
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="block truncate">{value}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{value}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
      className: "text-center w-20",
    },
    {
      header: "Trích yếu",
      sortKey: "PREVIEW",
      accessor: (r) => {
        const value = r.preview ?? "";
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="max-w-[700px] line-clamp-2 text-sm leading-relaxed text-ellipsis">
                  {value}
                </div>
              </TooltipTrigger>
              <TooltipContent className="max-w-md">
                <p className="whitespace-pre-wrap">{value}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
      className: "text-left min-w-[300px] w-[45%]",
    },
    {
      header: "Độ mật",
      sortKey: "SECURITY_NAME",
      accessor: (r) => r.securityName ?? "",
      className: "text-center w-20",
    },
    {
      header: "Độ khẩn",
      accessor: (r) => {
        const value = r.urgentName ?? "";
        return (
          <span
            className={value === "Hỏa tốc" ? "text-red-600 font-medium" : ""}
          >
            {value}
          </span>
        );
      },
      className: "text-center w-20",
      sortable: false,
    },
    {
      header: "Số, KH của VB đến",
      sortable: false,
      accessor: (r) => {
        const value = r.numberArrivalStr ?? "";
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="block truncate">{value}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{value}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
      className: "text-center w-32",
    },
    {
      header: "Người xin ý kiến",
      sortKey: "FR_USER_STR",
      accessor: (r: any) => {
        const value = r.frUserStr ?? "";
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="block truncate">{value}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{value}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
      className: "text-left w-32",
    },
    {
      header: "Người cho ý kiến",
      sortKey: "TO_USER_STR",
      accessor: (r: any) => {
        const value = r.toUserStr ?? "";
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="block truncate">{value}</span>
              </TooltipTrigger>
              <TooltipContent>
                <p>{value}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
      className: "text-left w-32",
    },
    {
      header: "Trạng thái xử lý",
      sortKey: "STATUS",
      accessor: (r) => {
        const status = (r as any).handleStatus ?? r.pstatusName ?? "";
        return (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
      },
      className: "text-center w-28",
    },
  ];

  if (isError) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Lỗi tải dữ liệu
          </h3>
          <p className="text-gray-600">
            {(error as Error)?.message || "Có lỗi xảy ra khi tải dữ liệu"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <BreadcrumbNavigation
          items={[
            {
              label: "Văn bản đến",
            },
          ]}
          currentPage="Danh sách văn bản xin ý kiến"
          showHome={false}
        />

        <div className="flex items-center gap-3">
          <SearchInput
            placeholder="Tìm kiếm theo Số, KH của VB đến | Trích yếu"
            value={text}
            setSearchInput={(v) => {
              setText(v);
              setPage(1);
              setIsAdvancedSearchExpanded(false);
              setAdvancedSearch(defaultAdvanceSearchState);
            }}
          />

          {/* <Button
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
          </Button> */}
        </div>
      </div>

      {/* {isAdvancedSearchExpanded && (
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
          expired=""
          onChangeExpired={() => {}}
          onSubmit={() => {
            setAdvancedSearch(tempAdvancedSearch);
            setPage(1);
          }}
          // Extended fields
          startDate={tempAdvancedSearch.startDate}
          onChangeStartDate={(v) =>
            setTempAdvancedSearch((p) => ({
              ...p,
              startDate: v,
            }))
          }
          endDate={tempAdvancedSearch.endDate}
          onChangeEndDate={(v) =>
            setTempAdvancedSearch((p) => ({
              ...p,
              endDate: v,
            }))
          }
          sign={tempAdvancedSearch.sign}
          onChangeSign={(val) =>
            setTempAdvancedSearch((p) => ({
              ...p,
              sign: val === "all" ? "" : val,
            }))
          }
          userEnter={tempAdvancedSearch.userEnter}
          onChangeUserEnter={(v) =>
            setTempAdvancedSearch((p) => ({
              ...p,
              userEnter: v,
            }))
          }
          orgName={tempAdvancedSearch.orgName}
          onChangeOrgName={(v) =>
            setTempAdvancedSearch((p) => ({
              ...p,
              orgName: v,
            }))
          }
        />
      )} */}
      {tab === "CHO_Y_KIEN" && Constant.ASK_IDEA_H05 && isCanHandleDoc && (
        <div className="flex min-h-9">
          <Button
            className={cn(
              "mr-1",
              getCurrentDocumentId() != null
                ? "bg-blue-600 hover:bg-blue-600 text-white"
                : "bg-gray-400 text-gray-600 cursor-not-allowed"
            )}
            disabled={getCurrentDocumentId() == null}
            onClick={doOpenCommentPopup}
          >
            <MessageCircle className="w-4 h-4 mr-2" />
            Cho ý kiến
          </Button>
        </div>
      )}
      <div className="flex items-center justify-between gap-4">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          {(["CHO_Y_KIEN", "XIN_Y_KIEN"] as const).map((tabKey) => {
            const active = tab === tabKey;
            const { label } = STATUS_LABEL[tabKey];
            return (
              <button
                key={tabKey}
                onClick={() => {
                  setSelectedRowKeys([]);
                  setCurrentDocumentId(null);
                  setTab(tabKey);
                  setPage(1);
                  setIsAdvancedSearchExpanded(false);
                  setAdvancedSearch(defaultAdvanceSearchState);
                }}
                className={cn(
                  "flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded transition-all duration-200",
                  active
                    ? "bg-white text-blue-600 shadow-sm"
                    : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        <EncryptDisplaySelect
          onChange={() => {
            setPage(1);
            setSelectedRowKeys([]);
            setCurrentDocumentId(null);
          }}
          selectClassName="w-36 h-9 text-xs"
        />
      </div>
      <Table<DocumentOutItem>
        sortable={true}
        clientSort={false}
        onSort={handleSort}
        columns={columns}
        dataSource={rows}
        itemsPerPage={itemsPerPage}
        currentPage={page}
        onPageChange={setPage}
        totalItems={total}
        showPagination
        emptyText={<EmptyDocument />}
        loading={isLoading}
        hasAllChange
        onItemsPerPageChange={(n) => {
          setItemsPerPage(n);
          setPage(1);
        }}
        bgColor="bg-white"
        rowClassName={(record, index) =>
          index % 2 === 0
            ? "bg-white hover:!bg-white"
            : "bg-[#0000000d] hover:!bg-[#0000000d]"
        }
        rowSelection={{
          selectedRowKeys,
          onChange: setSelectedRowKeys,
          rowKey: "docId" as keyof DocumentOutItem,
        }}
        onRowClick={(record) => {
          router.push(`/document-out/opinion/detail/${record.docId}`);
        }}
      />

      <DocumentOutComment
        docId={currentDocumentId?.toString() || ""}
        isFinishReceive={false}
        onClose={() => {
          setShowCommentModal(false);
        }}
        showAskIdeaModal={showCommentModal}
        setShowAskIdeaModal={(show: boolean) => {
          setShowCommentModal(show);
          if (!show) {
            setCurrentDocumentId(null);
            setSelectedRowKeys([]);
          }
        }}
      />
    </div>
  );
});

export default DocInOpinionPage;
