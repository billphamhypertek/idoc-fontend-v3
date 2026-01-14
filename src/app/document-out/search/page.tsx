"use client";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import { Table } from "@/components/ui/table";
import type {
  DocumentOutItem,
  FindDocByTypeHandleParams,
} from "@/definitions/types/document-out.type";
import type { Column } from "@/definitions/types/table.type";
import {
  useDocumentOutStatuses,
  useExportDocumentOutExcel,
  useFindBasicAllDoc,
  useGetImportantDocs,
  useGetListOrgEnter,
  useGetListUserEnter,
  useToggleImportant,
} from "@/hooks/data/document-out.data";
import {
  formatDate,
  formatDateYMD,
  parseDateStringYMD,
} from "@/utils/datetime.utils";
import {
  Calendar,
  Paperclip,
  PencilLine,
  RotateCcw,
  Search,
  Star,
} from "lucide-react";
import { memo, useEffect, useMemo, useState } from "react";

import AttachmentDialog2 from "@/components/common/AttachmentDialog2";
import { SearchInput } from "@/components/document-in/SearchInput";
import EncryptDisplaySelect from "@/components/document-out/EncryptDisplaySelect";
import FilterField from "@/components/common/FilterFiled";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Constant } from "@/definitions/constants/constant";
import { useGetCategoriesByCode } from "@/hooks/data/category.data";
import { useGetDocumentBookByType } from "@/hooks/data/document-book.data";
import { useFileViewer } from "@/hooks/useFileViewer";
import { cn } from "@/lib/utils";
import { generateExcelDocumentOut } from "@/services/export.service";
import { downloadFileTable } from "@/services/file.service";
import { canViewNoStatus } from "@/utils/common.utils";
import { ToastUtils } from "@/utils/toast.utils";
import { useRouter } from "next/navigation";
import { useIsClerical } from "@/hooks/data/user.data";
import { EmptyDocument } from "@/components/common/EmptyDocument";
import { useEncryptStore } from "@/stores/encrypt.store";
import { EncryptionService } from "@/services/encryption.service";
import { CustomDatePicker } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";
import { useGetFindOrgAll } from "@/hooks/data/task.data";
import SelectCustom from "@/components/common/SelectCustom";

const defaultAdvanceSearchState = {
  bookId: "",
  startArrival: "",
  endArrival: "",
  startIssued: "",
  endIssued: "",
  startReceived: "",
  endReceived: "",
  personSign: "",
  orgIssuedName: "",
  docTypeId: "",
  numberOrSign: "",
  securityId: "",
  urgentId: "",
  docFieldsId: "",
  docStatusId: "",
  numberArrival: "",
  numberArrivalStr: "",
  preview: "",
  userExe: "",
  orgExe: "",
  handleType: "NULL",
  handleStatus: "NULL",
  important: "",
  expired: "",
};

const DocOutSearchPage = memo(function DocOutSearchPage() {
  const { isEncrypt } = useEncryptStore();
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [text, setText] = useState("");
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
  const [sortBy, setSortBy] = useState("");
  const [sortDirection, setSortDirection] = useState<"ASC" | "DESC">("DESC");
  const [showOrgExeSuggestions, setShowOrgExeSuggestions] = useState(false);
  const [showUserExeSuggestions, setShowUserExeSuggestions] = useState(false);
  const [showPlaceSendSuggestions, setShowPlaceSendSuggestions] =
    useState(false);
  const [allExeOrgs, setAllExeOrgs] = useState<any[]>([]);
  const { viewFile } = useFileViewer();
  const { mutateAsync: exportDocumentOutExcel } = useExportDocumentOutExcel();

  const { data: bookCategory } = useGetDocumentBookByType(
    Constant.DOCUMENT_BOOK_TYPE[0].code
  );
  const { data: docTypeCategory } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.DOC_TYPE
  );
  const { data: securityCategory } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.SECURITY
  );
  const { data: urgentCategory } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.URGENT
  );
  const { data: docFieldCategory } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.DOC_FIELDS
  );
  const { data: placeSendCategory } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.ORG_SEND
  );

  const { data: allExeOrgsEnter } = useGetListOrgEnter();
  const { data: allExeOrgsEnterBCY } = useGetFindOrgAll();
  const { data: allSignedUsers } = useGetListUserEnter();
  const { data: statusOptions } = useDocumentOutStatuses();
  const { data: isClerical = false } = useIsClerical(
    "VAN_BAN_DEN",
    Constant.BCY_ADD_EDIT_BUTTON_FOR_CLERICAL
  );

  useEffect(() => {
    if (isEncrypt) {
      EncryptionService.isCheckStartUsbTokenWatcher();
    }
  }, [isEncrypt]);

  useEffect(() => {
    if (Constant.ORG_DOC_OUT_SEARCH_BCY) {
      setAllExeOrgs(allExeOrgsEnterBCY ?? []);
    } else {
      setAllExeOrgs(allExeOrgsEnter ?? []);
    }
  }, [allExeOrgsEnter, allExeOrgsEnterBCY]);

  const { mutate: toggleImportant } = useToggleImportant();

  const isStarred = (r: DocumentOutItem) => Boolean(r.important);
  const onStarClick = (r: DocumentOutItem) => {
    toggleImportant(
      { docId: r.docId, important: !isStarred(r) },
      {
        onSettled: () => {
          refetch();
        },
      }
    );
  };

  const params: FindDocByTypeHandleParams = useMemo(() => {
    if (!isAdvancedSearchExpanded) {
      return {
        text,
        dayLeft: "",
        page,
        sortBy,
        direction: sortDirection,
        posId: "",
        size: itemsPerPage,
      };
    } else {
      return {
        ...advancedSearch,
        text: "",
        page,
        sortBy,
        direction: sortDirection,
        size: itemsPerPage,
      };
    }
  }, [
    text,
    page,
    itemsPerPage,
    sortBy,
    sortDirection,
    isAdvancedSearchExpanded,
    advancedSearch,
  ]);

  const { data, isLoading, isError, error, refetch } =
    useFindBasicAllDoc(params);

  const {
    data: dataSearchAd,
    isLoading: isLoadingSearchAd,
    isError: isErrorSearchAd,
    error: errorSearchAd,
    refetch: refetchSearchAd,
  } = useGetImportantDocs(params, isAdvancedSearchExpanded);

  const rawRows = useMemo(() => {
    if (isAdvancedSearchExpanded) {
      return dataSearchAd?.objList || [];
    }
    return data?.objList || [];
  }, [data, dataSearchAd, isAdvancedSearchExpanded]);
  const total = !isAdvancedSearchExpanded
    ? data?.totalRecord
    : dataSearchAd?.totalRecord;

  // Handler for sort from Table component
  const handleSort = (
    config: { key: string; direction: "asc" | "desc" | null } | null
  ) => {
    if (!config || !config.direction) {
      setSortBy("");
      setSortDirection("DESC");
    } else {
      const mappedDirection = config.direction === "asc" ? "ASC" : "DESC";
      setSortBy(config.key);
      setSortDirection(mappedDirection);
    }
    setPage(1); // Reset to page 1 when sorting
  };

  const showLoading =
    isLoading || isLoadingSearchAd || isError || isErrorSearchAd;

  const columns: Column<DocumentOutItem>[] = [
    {
      header: <span className="whitespace-normal leading-tight">STT</span>,
      accessor: (_r, idx) => (page - 1) * itemsPerPage + idx + 1,
      className: "text-center w-8 min-w-[32px] whitespace-normal",
      sortable: false,
    },
    {
      header: <Star className="w-4 h-4 text-gray-400 mx-auto" />,
      sortKey: "IMPORTANT",
      type: "actions",
      className: "text-center w-8 min-w-[32px]",
      renderActions: (r) => {
        const starred = Boolean(r.important);
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
                "w-4 h-4 mx-auto cursor-pointer hover:opacity-70",
                starred
                  ? "fill-yellow-400 text-yellow-400 stroke-yellow-600 stroke-2"
                  : "text-gray-400"
              )}
            />
          </button>
        );
      },
    },
    {
      header: <span className="whitespace-normal leading-tight">Ngày đến</span>,
      sortKey: "DATEISSUED",
      accessor: (r) => formatDate(r.dateIssued),
      className: "text-center min-w-[60px] w-[5%] whitespace-normal",
    },
    {
      header: <span className="whitespace-normal leading-tight">Số đến</span>,
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
      className: "text-center min-w-[60px] w-[5%] whitespace-normal",
    },
    {
      header: (
        <span className="whitespace-normal leading-tight">
          Cơ quan ban hành
        </span>
      ),
      sortKey: "ORG_ISSUED_NAME",
      accessor: (r) => {
        const value = r.parentPlaceSend ?? "";
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
      className: "text-left min-w-[80px] w-[6%] whitespace-normal",
    },
    {
      header: (
        <span className="whitespace-normal leading-tight">
          Đơn vị soạn thảo
        </span>
      ),
      sortKey: "ORG_ISSUED_NAME",
      accessor: (r) => {
        const value = r.placeSend ?? "";
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="line-clamp-3 text-sm leading-tight">
                  {value}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{value}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
      className: "text-left min-w-[80px] w-[6%] whitespace-normal",
    },
    {
      header: (
        <span className="whitespace-normal leading-tight">
          Số, KH của VB đến
        </span>
      ),
      sortKey: "NUMBERSIGN",
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
      className: "text-left min-w-[40px] w-[3%] whitespace-normal",
    },
    {
      header: (
        <span className="whitespace-normal leading-tight">Ngày văn bản</span>
      ),
      sortKey: "DATE_ARRIVAL",
      accessor: (r) => formatDate(r.dateArrival),
      className: "text-center min-w-[60px] w-[5%] whitespace-normal",
    },
    {
      header: (
        <span className="whitespace-normal leading-tight">Trích yếu</span>
      ),
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
      className: "text-left min-w-[60px] flex-1 whitespace-normal",
    },
    {
      header: <span className="whitespace-normal leading-tight">Độ mật</span>,
      accessor: (r) => r.securityName ?? "",
      sortable: false,
      className: "text-center min-w-[50px] w-[3%] whitespace-normal",
    },
    {
      header: <span className="whitespace-normal leading-tight">Độ khẩn</span>,
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
      sortable: false,
      className: "text-center min-w-[50px] w-[3%] whitespace-normal",
    },
    {
      header: <span className="whitespace-normal leading-tight">Đính kèm</span>,
      sortable: false,
      accessor: (r) => (
        <div className="flex items-center justify-center">
          {(r.attachments?.length ?? 0) > 0 ? (
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
              className="flex items-center justify-center hover:underline"
              title={`Có ${r.attachments?.length} tệp đính kèm`}
            >
              <Paperclip className="w-4 h-4 text-blue-600" />
            </button>
          ) : (
            ""
          )}
        </div>
      ),
      className: "text-center min-w-[50px] w-[3%] whitespace-normal",
    },
    {
      header: (
        <span className="whitespace-normal leading-tight">
          Đơn vị nhận bản lưu
        </span>
      ),
      sortKey: "ORG_HANDLE",
      accessor: (r) => {
        const value = r.orgExe ?? r.orgReceiveDocument ?? "";
        return (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="line-clamp-3 text-sm leading-tight">
                  {value}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{value}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        );
      },
      className: "text-left min-w-[80px] w-[6%] whitespace-normal",
    },
    {
      header: (
        <span className="whitespace-normal leading-tight">Hạn văn bản</span>
      ),
      sortKey: "DEADLINE",
      accessor: (r) => formatDate(r.deadline),
      className: "text-center min-w-[60px] w-[5%] whitespace-normal",
    },
    {
      header: (
        <span className="whitespace-normal leading-tight">
          Trạng thái xử lý
        </span>
      ),
      sortable: false,
      accessor: (r) => {
        const getStatusColor = (statusName: string) => {
          if (statusName?.toLowerCase().includes("hoàn thành"))
            return "bg-green-500 text-white";
          if (statusName?.toLowerCase().includes("đang xử lý"))
            return "bg-blue-600 text-white";
          if (statusName?.toLowerCase().includes("chờ"))
            return "bg-yellow-500 text-white";
          if (statusName?.toLowerCase().includes("tiếp nhận"))
            return "bg-purple-500 text-white";
          return "bg-gray-500 text-white";
        };
        const status = r.docStatusName ?? r.pstatusName ?? "";
        return (
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(r.docStatusName)}`}
          >
            {status}
          </span>
        );
      },
      className: "text-center min-w-[80px] w-[6%] whitespace-normal",
    },
    ...(isClerical
      ? [
          {
            header: (
              <span className="whitespace-normal leading-tight">Thao tác</span>
            ),
            type: "actions" as const,
            sortable: false,
            className: "text-center min-w-[50px] w-[3%] whitespace-normal",
            renderActions: (r: DocumentOutItem) => (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/document-out/search/update/${r.docId}`);
                }}
                className="inline-flex items-center justify-center text-blue-600 hover:text-blue-700"
                title="Sửa"
                aria-label="Sửa"
              >
                <PencilLine className="w-4 h-4" />
              </button>
            ),
          } as Column<DocumentOutItem>,
        ]
      : []),
  ];

  const handleAdvancedSearchSubmit = () => {
    setAdvancedSearch(tempAdvancedSearch);
    setIsAdvancedSearchExpanded(true);
    setPage(1);
  };

  const handleReset = () => {
    setAdvancedSearch(defaultAdvanceSearchState);
    setTempAdvancedSearch(defaultAdvanceSearchState);
    setIsAdvancedSearchExpanded(false);
    setPage(1);
  };

  const filteredOrgExeSuggestions = useMemo(() => {
    if (!allExeOrgs || allExeOrgs.length === 0) return [];
    const searchValue = tempAdvancedSearch.orgExe?.toLowerCase() || "";
    if (!searchValue) return allExeOrgs.map((org) => org.name);
    return allExeOrgs
      .filter((org) => org.name?.toLowerCase().includes(searchValue))
      .map((org) => org.name);
  }, [allExeOrgs, tempAdvancedSearch.orgExe]);

  const handleOrgExeFocus = () => {
    setShowOrgExeSuggestions(true);
  };

  const handleOrgExeBlur = () => {
    setTimeout(() => setShowOrgExeSuggestions(false), 200);
  };

  const handleOrgExeSelect = (value: string) => {
    setTempAdvancedSearch((p) => ({ ...p, orgExe: value }));
    setShowOrgExeSuggestions(false);
  };

  const filteredUserExeSuggestions = useMemo(() => {
    if (!allSignedUsers || allSignedUsers.length === 0) return [];
    const searchValue = tempAdvancedSearch.userExe?.toLowerCase() || "";
    if (!searchValue) return allSignedUsers.map((user) => user.fullName);
    return allSignedUsers
      .filter((user) => user.fullName?.toLowerCase().includes(searchValue))
      .map((user) => user.fullName);
  }, [allSignedUsers, tempAdvancedSearch.userExe]);

  const handleUserExeFocus = () => {
    setShowUserExeSuggestions(true);
  };

  const handleUserExeBlur = () => {
    setTimeout(() => setShowUserExeSuggestions(false), 200);
  };

  const handleUserExeSelect = (value: string) => {
    setTempAdvancedSearch((p) => ({ ...p, userExe: value }));
    setShowUserExeSuggestions(false);
  };

  const filteredPlaceSendSuggestions = useMemo(() => {
    if (!placeSendCategory || placeSendCategory.length === 0) return [];
    const searchValue = tempAdvancedSearch.orgIssuedName?.toLowerCase() || "";
    if (!searchValue) return placeSendCategory.map((place) => place.name);
    return placeSendCategory
      .filter((place) => place.name?.toLowerCase().includes(searchValue))
      .map((place) => place.name);
  }, [placeSendCategory, tempAdvancedSearch.orgIssuedName]);

  const handlePlaceSendFocus = () => {
    setShowPlaceSendSuggestions(true);
  };

  const handlePlaceSendBlur = () => {
    setTimeout(() => setShowPlaceSendSuggestions(false), 200);
  };

  const handlePlaceSendSelect = (value: string) => {
    setTempAdvancedSearch((p) => ({ ...p, orgIssuedName: value }));
    setShowPlaceSendSuggestions(false);
  };

  const handleExportExcel = async () => {
    try {
      const base: Record<string, any> = {
        sortBy,
        direction: sortDirection,
      };
      const query = isAdvancedSearchExpanded
        ? { ...base, ...advancedSearch }
        : { ...base, text };

      const data = await exportDocumentOutExcel(query);
      const list: any[] = Array.isArray(data) ? data : (data?.objList ?? []);

      const excelJson: any[] = [];
      let index = 0;
      list.forEach((r) => {
        excelJson.push([
          ++index,
          // Ngày đến (giữ theo UI hiện tại dùng dateIssued)
          r.dateIssued
            ? new Date(r.dateIssued).toLocaleDateString("vi-VN")
            : "",
          // Số đến
          r.numberArrival ?? "",
          // Cơ quan ban hành
          r.parentPlaceSend ?? "",
          // Số ký hiệu
          r.numberArrivalStr ?? r.numberOrSign ?? "",
          // Ngày văn bản
          r.dateArrival
            ? new Date(r.dateArrival).toLocaleDateString("vi-VN")
            : "",
          // Trích yếu
          r.preview ?? "",
          // Đơn vị nhận
          r.orgExe ?? r.orgReceiveDocument ?? "",
        ]);
      });

      const header = [
        "STT",
        "Ngày đến",
        "Số đến",
        "Cơ quan ban hành",
        "Số ký hiệu",
        "Ngày văn bản",
        "Trích yếu",
        "Đơn vị nhận",
      ];

      await generateExcelDocumentOut(
        "SỔ IN BÁO CÁO VĂN BẢN ĐẾN",
        header,
        excelJson,
        "THONG_KE_VAN_BAN_DEN",
        Array.isArray(list) ? list.length : 0,
        null,
        null
      );
    } catch (err: any) {
      if ((ToastUtils as any)?.coLoiXayRaKhiExportExcel) {
        (ToastUtils as any).coLoiXayRaKhiExportExcel();
      } else {
        ToastUtils.error(err?.message || "Có lỗi xảy ra khi export Excel");
      }
    }
  };

  return (
    <div className="px-4 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <BreadcrumbNavigation
          items={[
            {
              label: "Văn bản đến",
            },
          ]}
          currentPage="Tra cứu văn bản đến"
          showHome={false}
        />

        <div className="flex items-center gap-3">
          <SearchInput
            placeholder="Tìm kiếm theo Số, KH của VB đến | Trích yếu"
            value={text}
            setSearchInput={(v) => {
              setText(v);
              setIsAdvancedSearchExpanded(false);
              setAdvancedSearch(defaultAdvanceSearchState);
            }}
          />

          <Button
            variant="outline"
            onClick={() => {
              const newExpanded = !isAdvancedSearchExpanded;
              setIsAdvancedSearchExpanded(newExpanded);
              if (!newExpanded) {
                setAdvancedSearch(defaultAdvanceSearchState);
                setTempAdvancedSearch(defaultAdvanceSearchState);
                setPage(1);
              }
            }}
            className={cn(
              "h-8 py-1 px-3 text-xs transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700 hover:text-white border-none"
            )}
          >
            <Search className="w-4 h-4 mr-2" />
            {isAdvancedSearchExpanded
              ? "Thu gọn tìm kiếm"
              : "Tìm kiếm nâng cao"}
          </Button>
        </div>
      </div>
      {isAdvancedSearchExpanded && (
        <div className="bg-white rounded-lg border mb-4">
          <h3 className="font-bold text-info mb-10 p-4 bg-blue-100">
            Tìm kiếm nâng cao
          </h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAdvancedSearchSubmit();
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-4 px-8">
              {isEncrypt && (
                <>
                  {/* 1. Sổ văn bản */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Sổ văn bản
                    </Label>
                    <div className="flex-1 min-w-0">
                      <SelectCustom
                        options={[
                          { label: "-- Chọn --", value: "" },
                          ...(bookCategory || []).map((item: any) => ({
                            label: item.name,
                            value: item.id.toString(),
                          })),
                        ]}
                        value={tempAdvancedSearch.bookId}
                        onChange={(val) =>
                          setTempAdvancedSearch((prev) => ({
                            ...prev,
                            bookId: typeof val === "string" ? val : "",
                          }))
                        }
                        placeholder="-- Chọn --"
                        className="h-9 bg-background flex-1"
                      />
                    </div>
                  </div>
                  {/* 2-3. Ngày văn bản */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Ngày văn bản, từ ngày
                    </Label>
                    <div className="flex-1 min-w-0">
                      <CustomDatePicker
                        selected={parseDateStringYMD(
                          tempAdvancedSearch.startArrival
                        )}
                        onChange={(date) =>
                          setTempAdvancedSearch((s) => ({
                            ...s,
                            startArrival: formatDateYMD(date),
                          }))
                        }
                        placeholder="Chọn ngày"
                        disabledFuture={true}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      đến ngày
                    </Label>
                    <div className="flex-1 min-w-0">
                      <CustomDatePicker
                        selected={parseDateStringYMD(
                          tempAdvancedSearch.endArrival
                        )}
                        onChange={(date) =>
                          setTempAdvancedSearch((s) => ({
                            ...s,
                            endArrival: formatDateYMD(date),
                          }))
                        }
                        placeholder="Chọn ngày"
                        disabledFuture={true}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* 4. Loại văn bản */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Loại văn bản
                    </Label>
                    <div className="flex-1 min-w-0">
                      <SelectCustom
                        options={[
                          { label: "-- Chọn --", value: "" },
                          ...(docTypeCategory || []).map((item) => ({
                            label: item.name,
                            value: item.id.toString(),
                          })),
                        ]}
                        value={tempAdvancedSearch.docTypeId}
                        onChange={(val) =>
                          setTempAdvancedSearch((prev) => ({
                            ...prev,
                            docTypeId: typeof val === "string" ? val : "",
                          }))
                        }
                        placeholder="-- Chọn --"
                        className="h-9 bg-background flex-1"
                      />
                    </div>
                  </div>

                  {/* 5. Số đến */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Số đến
                    </Label>
                    <Input
                      value={tempAdvancedSearch.numberArrival}
                      onChange={(e) =>
                        setTempAdvancedSearch((p) => ({
                          ...p,
                          numberArrival: e.target.value,
                        }))
                      }
                      className="h-9 text-sm bg-background"
                    />
                  </div>

                  {/* 6. Độ khẩn */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Độ khẩn
                    </Label>
                    <div className="flex-1 min-w-0">
                      <SelectCustom
                        options={[
                          { label: "-- Chọn --", value: "" },
                          ...(urgentCategory || []).map((item) => ({
                            label: item.name,
                            value: item.id.toString(),
                          })),
                        ]}
                        value={tempAdvancedSearch.urgentId}
                        onChange={(val) =>
                          setTempAdvancedSearch((prev) => ({
                            ...prev,
                            urgentId: typeof val === "string" ? val : "",
                          }))
                        }
                        placeholder="-- Chọn --"
                        className="h-9 bg-background flex-1"
                      />
                    </div>
                  </div>

                  {/* 7-8. Ngày vào sổ */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Ngày vào sổ, từ ngày
                    </Label>
                    <div className="flex-1 min-w-0">
                      <CustomDatePicker
                        selected={parseDateStringYMD(
                          tempAdvancedSearch.startIssued
                        )}
                        onChange={(date) =>
                          setTempAdvancedSearch((s) => ({
                            ...s,
                            startIssued: formatDateYMD(date),
                          }))
                        }
                        placeholder="Chọn ngày"
                        disabledFuture={true}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      đến ngày
                    </Label>
                    <div className="flex-1 min-w-0">
                      <CustomDatePicker
                        selected={parseDateStringYMD(
                          tempAdvancedSearch.endIssued
                        )}
                        onChange={(date) =>
                          setTempAdvancedSearch((s) => ({
                            ...s,
                            endIssued: formatDateYMD(date),
                          }))
                        }
                        placeholder="Chọn ngày"
                        disabledFuture={true}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* 9. Nơi gửi */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Nơi gửi
                    </Label>
                    <div className="flex-1 min-w-0 relative [&>div>label]:hidden [&>div]:space-y-0">
                      <FilterField
                        label=""
                        field="orgIssuedName"
                        value={tempAdvancedSearch.orgIssuedName || ""}
                        withSuggestions={true}
                        showSuggestions={showPlaceSendSuggestions}
                        suggestions={filteredPlaceSendSuggestions}
                        onChange={(_, value) =>
                          setTempAdvancedSearch((p) => ({
                            ...p,
                            orgIssuedName: value,
                          }))
                        }
                        onFocus={handlePlaceSendFocus}
                        onBlur={handlePlaceSendBlur}
                        onSelectSuggestion={(_, value) =>
                          handlePlaceSendSelect(value)
                        }
                      />
                    </div>
                  </div>

                  {/* 10-11. Ngày nhận văn bản */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Ngày nhận văn bản, từ ngày
                    </Label>
                    <div className="flex-1 min-w-0">
                      <CustomDatePicker
                        selected={parseDateStringYMD(
                          tempAdvancedSearch.startReceived
                        )}
                        onChange={(date) =>
                          setTempAdvancedSearch((s) => ({
                            ...s,
                            startReceived: formatDateYMD(date),
                          }))
                        }
                        disabledFuture={true}
                        placeholder="Chọn ngày"
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      đến ngày
                    </Label>
                    <div className="flex-1 min-w-0">
                      <CustomDatePicker
                        selected={parseDateStringYMD(
                          tempAdvancedSearch.endReceived
                        )}
                        onChange={(date) =>
                          setTempAdvancedSearch((s) => ({
                            ...s,
                            endReceived: formatDateYMD(date),
                          }))
                        }
                        placeholder="Chọn ngày"
                        disabledFuture={true}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* 12. Trạng thái văn bản */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Trạng thái văn bản
                    </Label>
                    <div className="flex-1 min-w-0">
                      <SelectCustom
                        options={[
                          { label: "-- Chọn --", value: "" },
                          ...(statusOptions || []).map((item: any) => ({
                            label: item.value,
                            value: item.key,
                          })),
                        ]}
                        value={tempAdvancedSearch.docStatusId}
                        onChange={(val) =>
                          setTempAdvancedSearch((prev) => ({
                            ...prev,
                            docStatusId: typeof val === "string" ? val : "",
                          }))
                        }
                        placeholder="-- Chọn --"
                        className="h-9 bg-background flex-1"
                      />
                    </div>
                  </div>

                  {/* 13. Số, KH của VB đến */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Số, KH của VB đến
                    </Label>
                    <Input
                      value={tempAdvancedSearch.numberArrivalStr}
                      onChange={(e) =>
                        setTempAdvancedSearch((p) => ({
                          ...p,
                          numberArrivalStr: e.target.value,
                        }))
                      }
                      className="h-9 text-sm bg-background"
                    />
                  </div>

                  {/* 14. Độ mật */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Độ mật
                    </Label>
                    <div className="flex-1 min-w-0">
                      <SelectCustom
                        options={[
                          { label: "-- Chọn --", value: "" },
                          ...(securityCategory || []).map((item) => ({
                            label: item.name,
                            value: item.id.toString(),
                          })),
                        ]}
                        value={tempAdvancedSearch.securityId}
                        onChange={(val) =>
                          setTempAdvancedSearch((prev) => ({
                            ...prev,
                            securityId: typeof val === "string" ? val : "",
                          }))
                        }
                        placeholder="-- Chọn --"
                        className="h-9 bg-background flex-1"
                      />
                    </div>
                  </div>

                  {/* 15. Đơn vị xử lý */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Đơn vị xử lý
                    </Label>
                    <div className="flex-1 min-w-0 relative [&>div>label]:hidden [&>div]:space-y-0">
                      <FilterField
                        label=""
                        field="orgExe"
                        value={tempAdvancedSearch.orgExe || ""}
                        withSuggestions={true}
                        showSuggestions={showOrgExeSuggestions}
                        suggestions={filteredOrgExeSuggestions}
                        onChange={(_, value) =>
                          setTempAdvancedSearch((p) => ({
                            ...p,
                            orgExe: value,
                          }))
                        }
                        onFocus={handleOrgExeFocus}
                        onBlur={handleOrgExeBlur}
                        onSelectSuggestion={(_, value) =>
                          handleOrgExeSelect(value)
                        }
                      />
                    </div>
                  </div>

                  {/* 16. Người xử lý */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Người xử lý
                    </Label>
                    <div className="flex-1 min-w-0 relative [&>div>label]:hidden [&>div]:space-y-0">
                      <FilterField
                        label=""
                        field="userExe"
                        value={tempAdvancedSearch.userExe || ""}
                        withSuggestions={true}
                        showSuggestions={showUserExeSuggestions}
                        suggestions={filteredUserExeSuggestions}
                        onChange={(_, value) =>
                          setTempAdvancedSearch((p) => ({
                            ...p,
                            userExe: value,
                          }))
                        }
                        onFocus={handleUserExeFocus}
                        onBlur={handleUserExeBlur}
                        onSelectSuggestion={(_, value) =>
                          handleUserExeSelect(value)
                        }
                      />
                    </div>
                  </div>

                  {/* 17. Trích yếu */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Trích yếu
                    </Label>
                    <Input
                      value={tempAdvancedSearch.preview}
                      onChange={(e) =>
                        setTempAdvancedSearch((p) => ({
                          ...p,
                          preview: e.target.value,
                        }))
                      }
                      className="h-9 text-sm bg-background"
                    />
                  </div>

                  {/* 18. Văn bản quan trọng */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Văn bản quan trọng
                    </Label>
                    <div className="flex-1 min-w-0">
                      <SelectCustom
                        options={[
                          { label: "-- Chọn --", value: "" },
                          { label: "Quan trọng", value: "true" },
                          { label: "Không quan trọng", value: "false" },
                        ]}
                        value={tempAdvancedSearch.important}
                        onChange={(val) =>
                          setTempAdvancedSearch((prev) => ({
                            ...prev,
                            important: typeof val === "string" ? val : "",
                          }))
                        }
                        placeholder="-- Chọn --"
                        className="h-9 bg-background flex-1"
                      />
                    </div>
                  </div>

                  {/* 19. Vai trò xử lý */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Vai trò xử lý
                    </Label>
                    <div className="flex-1 min-w-0">
                      <SelectCustom
                        options={[
                          { label: "-- Chọn --", value: "" },
                          { label: "Xử lý chính", value: "MAIN" },
                          { label: "Xử lý phối hợp", value: "SUPPORT" },
                          { label: "Nhận để biết", value: "SHOW" },
                        ]}
                        value={tempAdvancedSearch.handleType}
                        onChange={(val) =>
                          setTempAdvancedSearch((prev) => ({
                            ...prev,
                            handleType: typeof val === "string" ? val : "",
                          }))
                        }
                        placeholder="-- Chọn --"
                        className="h-9 bg-background flex-1"
                      />
                    </div>
                  </div>

                  {/* 20. Trạng thái xử lý */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Trạng thái xử lý
                    </Label>
                    <div className="flex-1 min-w-0">
                      <SelectCustom
                        options={[
                          { label: "-- Chọn --", value: "" },
                          { label: "Chờ xử lý", value: "CHO_XU_LY" },
                          { label: "Đang xử lý", value: "DANG_XU_LY" },
                          { label: "Đã xử lý", value: "DA_XU_LY" },
                          { label: "Đã trả lại", value: "DA_TRA_LAI" },
                          { label: "Chuyển đơn vị", value: "CHUYEN_DON_VI" },
                          { label: "Hoàn thành", value: "HOAN_THANH" },
                        ]}
                        value={tempAdvancedSearch.handleStatus}
                        onChange={(val) =>
                          setTempAdvancedSearch((prev) => ({
                            ...prev,
                            handleStatus: typeof val === "string" ? val : "",
                          }))
                        }
                        placeholder="-- Chọn --"
                        className="h-9 bg-background flex-1"
                      />
                    </div>
                  </div>

                  {/* 21. Hạn văn bản */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Hạn văn bản
                    </Label>
                    <div className="flex-1 min-w-0">
                      <SelectCustom
                        options={[
                          { label: "-- Chọn --", value: "" },
                          { label: "Văn bản còn hạn", value: "false" },
                          { label: "Văn bản hết hạn", value: "true" },
                        ]}
                        value={tempAdvancedSearch.expired}
                        onChange={(val) =>
                          setTempAdvancedSearch((prev) => ({
                            ...prev,
                            expired: typeof val === "string" ? val : "",
                          }))
                        }
                        placeholder="-- Chọn --"
                        className="h-9 bg-background flex-1"
                      />
                    </div>
                  </div>
                </>
              )}

              {!isEncrypt && (
                <>
                  {/* 1-2. Ngày văn bản */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Ngày văn bản, từ ngày
                    </Label>
                    <div className="flex-1 min-w-0">
                      <CustomDatePicker
                        selected={parseDateStringYMD(
                          tempAdvancedSearch.startArrival
                        )}
                        onChange={(date) =>
                          setTempAdvancedSearch((s) => ({
                            ...s,
                            startArrival: formatDateYMD(date),
                          }))
                        }
                        placeholder="Chọn ngày"
                        disabledFuture={true}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      đến ngày
                    </Label>
                    <div className="flex-1 min-w-0">
                      <CustomDatePicker
                        selected={parseDateStringYMD(
                          tempAdvancedSearch.endArrival
                        )}
                        onChange={(date) =>
                          setTempAdvancedSearch((s) => ({
                            ...s,
                            endArrival: formatDateYMD(date),
                          }))
                        }
                        placeholder="Chọn ngày"
                        disabledFuture={true}
                        className="w-full"
                      />
                    </div>
                  </div>
                  {/* 3. Số đến */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Số đến
                    </Label>
                    <Input
                      value={tempAdvancedSearch.numberArrival}
                      onChange={(e) =>
                        setTempAdvancedSearch((p) => ({
                          ...p,
                          numberArrival: e.target.value,
                        }))
                      }
                      className="h-9 text-sm bg-background"
                    />
                  </div>

                  {/* 4. Độ khẩn */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Độ khẩn
                    </Label>
                    <div className="flex-1 min-w-0">
                      <SelectCustom
                        options={[
                          { label: "-- Chọn --", value: "" },
                          ...(urgentCategory || []).map((item) => ({
                            label: item.name,
                            value: item.id.toString(),
                          })),
                        ]}
                        value={tempAdvancedSearch.urgentId}
                        onChange={(val) =>
                          setTempAdvancedSearch((prev) => ({
                            ...prev,
                            urgentId: typeof val === "string" ? val : "",
                          }))
                        }
                        placeholder="-- Chọn --"
                        className="h-9 bg-background flex-1"
                      />
                    </div>
                  </div>
                  {/* 5-6. Ngày vào sổ */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Ngày vào sổ, từ ngày
                    </Label>
                    <div className="flex-1 min-w-0">
                      <CustomDatePicker
                        selected={parseDateStringYMD(
                          tempAdvancedSearch.startIssued
                        )}
                        onChange={(date) =>
                          setTempAdvancedSearch((s) => ({
                            ...s,
                            startIssued: formatDateYMD(date),
                          }))
                        }
                        placeholder="Chọn ngày"
                        disabledFuture={true}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      đến ngày
                    </Label>
                    <div className="flex-1 min-w-0">
                      <CustomDatePicker
                        selected={parseDateStringYMD(
                          tempAdvancedSearch.endIssued
                        )}
                        onChange={(date) =>
                          setTempAdvancedSearch((s) => ({
                            ...s,
                            endIssued: formatDateYMD(date),
                          }))
                        }
                        placeholder="Chọn ngày"
                        disabledFuture={true}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* 7-8. Ngày nhận văn bản */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Ngày nhận văn bản, từ ngày
                    </Label>
                    <div className="flex-1 min-w-0">
                      <CustomDatePicker
                        selected={parseDateStringYMD(
                          tempAdvancedSearch.startReceived
                        )}
                        onChange={(date) =>
                          setTempAdvancedSearch((s) => ({
                            ...s,
                            startReceived: formatDateYMD(date),
                          }))
                        }
                        disabledFuture={true}
                        placeholder="Chọn ngày"
                        className="w-full"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      đến ngày
                    </Label>
                    <div className="flex-1 min-w-0">
                      <CustomDatePicker
                        selected={parseDateStringYMD(
                          tempAdvancedSearch.endReceived
                        )}
                        onChange={(date) =>
                          setTempAdvancedSearch((s) => ({
                            ...s,
                            endReceived: formatDateYMD(date),
                          }))
                        }
                        placeholder="Chọn ngày"
                        disabledFuture={true}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* 9. Trạng thái văn bản */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Trạng thái văn bản
                    </Label>
                    <div className="flex-1 min-w-0">
                      <SelectCustom
                        options={[
                          { label: "-- Chọn --", value: "" },
                          ...(statusOptions || []).map((item: any) => ({
                            label: item.value,
                            value: item.key,
                          })),
                        ]}
                        value={tempAdvancedSearch.docStatusId}
                        onChange={(val) =>
                          setTempAdvancedSearch((prev) => ({
                            ...prev,
                            docStatusId: typeof val === "string" ? val : "",
                          }))
                        }
                        placeholder="-- Chọn --"
                        className="h-9 bg-background flex-1"
                      />
                    </div>
                  </div>

                  {/* 10. Số, KH của VB đến */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Số, KH của VB đến
                    </Label>
                    <Input
                      value={tempAdvancedSearch.numberArrivalStr}
                      onChange={(e) =>
                        setTempAdvancedSearch((p) => ({
                          ...p,
                          numberArrivalStr: e.target.value,
                        }))
                      }
                      className="h-9 text-sm bg-background"
                    />
                  </div>

                  {/* 11. Độ mật */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Độ mật
                    </Label>
                    <div className="flex-1 min-w-0">
                      <SelectCustom
                        options={[
                          { label: "-- Chọn --", value: "" },
                          ...(securityCategory || []).map((item) => ({
                            label: item.name,
                            value: item.id.toString(),
                          })),
                        ]}
                        value={tempAdvancedSearch.securityId}
                        onChange={(val) =>
                          setTempAdvancedSearch((prev) => ({
                            ...prev,
                            securityId: typeof val === "string" ? val : "",
                          }))
                        }
                        placeholder="-- Chọn --"
                        className="h-9 bg-background flex-1"
                      />
                    </div>
                  </div>
                  {/* 12. Người xử lý */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Người xử lý
                    </Label>
                    <div className="flex-1 min-w-0 relative [&>div>label]:hidden [&>div]:space-y-0">
                      <FilterField
                        label=""
                        field="userExe"
                        value={tempAdvancedSearch.userExe || ""}
                        withSuggestions={true}
                        showSuggestions={showUserExeSuggestions}
                        suggestions={filteredUserExeSuggestions}
                        onChange={(_, value) =>
                          setTempAdvancedSearch((p) => ({
                            ...p,
                            userExe: value,
                          }))
                        }
                        onFocus={handleUserExeFocus}
                        onBlur={handleUserExeBlur}
                        onSelectSuggestion={(_, value) =>
                          handleUserExeSelect(value)
                        }
                      />
                    </div>
                  </div>

                  {/* 13. Trích yếu */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Trích yếu
                    </Label>
                    <Input
                      value={tempAdvancedSearch.preview}
                      onChange={(e) =>
                        setTempAdvancedSearch((p) => ({
                          ...p,
                          preview: e.target.value,
                        }))
                      }
                      className="h-9 text-sm bg-background"
                    />
                  </div>

                  {/* 14. Văn bản quan trọng */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Văn bản quan trọng
                    </Label>
                    <div className="flex-1 min-w-0">
                      <SelectCustom
                        options={[
                          { label: "-- Chọn --", value: "" },
                          { label: "Quan trọng", value: "true" },
                          { label: "Không quan trọng", value: "false" },
                        ]}
                        value={tempAdvancedSearch.important}
                        onChange={(val) =>
                          setTempAdvancedSearch((prev) => ({
                            ...prev,
                            important: typeof val === "string" ? val : "",
                          }))
                        }
                        placeholder="-- Chọn --"
                        className="h-9 bg-background flex-1"
                      />
                    </div>
                  </div>

                  {/* 15. Đơn vị soạn thảo */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Đơn vị soạn thảo
                    </Label>
                    <div className="flex-1 min-w-0 relative [&>div>label]:hidden [&>div]:space-y-0">
                      <FilterField
                        label=""
                        field="orgExe"
                        value={tempAdvancedSearch.orgExe || ""}
                        withSuggestions={true}
                        showSuggestions={showOrgExeSuggestions}
                        suggestions={filteredOrgExeSuggestions}
                        onChange={(_, value) =>
                          setTempAdvancedSearch((p) => ({
                            ...p,
                            orgExe: value,
                          }))
                        }
                        onFocus={handleOrgExeFocus}
                        onBlur={handleOrgExeBlur}
                        onSelectSuggestion={(_, value) =>
                          handleOrgExeSelect(value)
                        }
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
            <div className="flex items-center justify-center gap-3 my-6">
              <Button
                type="submit"
                className="h-9 px-4 text-sm font-medium bg-blue-600 hover:bg-blue-700"
              >
                <Search className="w-4 h-4 mr-1" />
                Tìm kiếm
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="h-9 px-4 text-sm font-medium"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Đặt lại
              </Button>
              <Button
                type="button"
                className="h-9 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleExportExcel}
                disabled={total === 0}
              >
                Xuất Excel
              </Button>
            </div>
          </form>
        </div>
      )}{" "}
      <div className="flex items-center justify-end gap-4">
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
        onSort={handleSort}
        columns={columns}
        dataSource={rawRows}
        itemsPerPage={itemsPerPage}
        currentPage={page}
        onPageChange={setPage}
        totalItems={total}
        showPagination
        emptyText={<EmptyDocument />}
        loading={showLoading}
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
        onRowClick={(record) =>
          router.push(`/document-out/search/detail/${record.docId}`)
        }
      />
      <AttachmentDialog2
        open={openAttach}
        onOpenChange={setOpenAttach}
        data={selectedAttachments}
      />
    </div>
  );
});

export default DocOutSearchPage;
