"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building,
  ChevronDown,
  ChevronUp,
  FileDown,
  Globe,
  Paperclip,
  RotateCcw,
  Search,
  Star,
  UserCheck,
  User2,
  Loader2,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchInput } from "@/components/document-in/SearchInput";
import { formatDateYMD, parseDateStringYMD } from "@/utils/datetime.utils";
import { CustomDatePicker } from "@/components/ui/calendar";
import { Table } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { formatDate } from "@/utils/datetime.utils";
import { ToastUtils } from "@/utils/toast.utils";
import { Column } from "@/definitions/types/table.type";
import AttachmentDialog from "@/components/common/AttachmentDialog";
import EncryptDisplaySelect from "@/components/document-out/EncryptDisplaySelect";
import { isCheckStartUsbTokenWatcher } from "@/services/usbTokenService";
import {
  useGetListOrgEnter,
  useGetListUserEnter,
  useToggleImportant,
} from "@/hooks/data/document-out.data";
import { useAllDocuments, useQuickSearch } from "@/hooks/data/document-in.data";
import { useGetCategoriesByCode } from "@/hooks/data/category.data";
import { useGetDocumentBookByType } from "@/hooks/data/document-book.data";
import { Constant } from "@/definitions/constants/constant";
import { DocumentOutService } from "@/services/document-out.service";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import { useLoadOutSideReceive } from "@/hooks/data/draft.data";
import { generateExcelDocumentOut } from "@/services/export.service";
import dayjs from "dayjs";
import SelectCustom from "@/components/common/SelectCustom";
import { EmptyDocument } from "@/components/common/EmptyDocument";
import { useEncryptStore } from "@/stores/encrypt.store";
import FilterField from "@/components/common/FilterFiled";
import { getStatusColor, getStatusStyle } from "@/utils/status-colors.utils";
import { SharedService } from "@/services/shared.service";
import { TabNames } from "@/definitions/enums/document.enum";
import { Label } from "@/components/ui/label";

type SortDirection = "ASC" | "DESC" | null;

const SearchTitles = {
  UPDATEDATE: "UPDATEDATE",
  CREATEDATE: "CREATEDATE",
  DOCID: "DOCID",
  NUMBERSIGN: "NUMBERSIGN",
  PREVIEW: "PREVIEW",
  DATEISSUED: "DATEISSUED",
  USER_ENTER: "USER_ENTER",
  DOCTYPE: "DOCTYPE",
  STATUS: "STATUS",
  IMPORTANT: "IMPORTANT",
} as const;

const defaultAdvanceSearch = {
  code: "",
  numberArrival: "",
  numberArrivalStr: "",
  preview: "",
  docTypeId: "",
  bookId: "",
  userId: "",
  startArrival: "",
  endArrival: "",
  startIssued: "",
  endIssued: "",
  startReceived: "",
  endReceived: "",
  orgExe: "",
  docFieldsId: "",
  securityId: "",
  urgentId: "",
  docStatusName: "",
  important: "",
  typeDocument: "",
};
const getRowId = (row: any): number | null => {
  const raw = row?.id ?? null;
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
};

export default function SearchDoc() {
  const router = useRouter();
  const { isEncrypt } = useEncryptStore();

  // UI state
  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [text, setText] = useState("");
  const [isAdvancedSearchExpanded, setIsAdvancedSearchExpanded] =
    useState(false);
  const [isBasicSearch, setIsBasicSearch] = useState(true);
  const [hasSubmittedAdvancedSearch, setHasSubmittedAdvancedSearch] =
    useState(false);
  const [advancedSearch, setAdvancedSearch] = useState(defaultAdvanceSearch);
  const [tempAdvancedSearch, setTempAdvancedSearch] =
    useState(defaultAdvanceSearch);
  const [sortBy, setSortBy] = useState<string>("");
  const [direction, setDirection] = useState<SortDirection>(null);

  const [openAttach, setOpenAttach] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState<any[]>([]);
  const [personOpen, setPersonOpen] = useState(false);
  const [personSearchQuery, setPersonSearchQuery] = useState("");

  // DocType suggestions state
  const [showSuggestions, setShowSuggestions] = useState({
    docTypeId: false,
    outsideReceive: false,
  });
  const [docTypeInput, setDocTypeInput] = useState("");
  const [filteredDocTypeSuggestions, setFilteredDocTypeSuggestions] = useState<
    string[]
  >([]);
  const [outsideReceiveInput, setOutsideReceiveInput] = useState("");
  const [
    filteredOutsideReceiveSuggestions,
    setFilteredOutsideReceiveSuggestions,
  ] = useState<string[]>([]);

  // Data sources
  const { data: bookCategory } = useGetDocumentBookByType(
    Constant.DOCUMENT_BOOK_TYPE[1].code // Angular uses book type for VB đi
  );
  const { data: docTypeCategory } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.DOC_TYPE
  );
  const { data: docFieldCategory } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.DOC_FIELDS
  );
  const { data: securityCategory } = useGetCategoriesByCode(
    Constant.CATEGORY_TYPE_CODE.SECURITY
  );
  const { data: urgentCategory } = useGetCategoriesByCode(
    Constant.CATEGORY_TYPE_CODE.URGENT
  );
  const { data: listUser } = useGetListUserEnter();
  const { data: listOrg } = useGetListOrgEnter();
  const { data: outsideList = [] } = useLoadOutSideReceive();

  const searchParams = useSearchParams();

  useEffect(() => {
    if (!searchParams) return;
    const searchQuery = searchParams.get("search");
    if (searchQuery) {
      setText(searchQuery);
      setIsBasicSearch(true);
      setIsAdvancedSearchExpanded(false);
      setHasSubmittedAdvancedSearch(false);
    }
  }, [searchParams]);

  // Encryption watcher
  useEffect(() => {
    if (isEncrypt) {
      isCheckStartUsbTokenWatcher();
    }
  }, [isEncrypt]);

  // Keep text input in sync with selected docTypeId
  useEffect(() => {
    if (!tempAdvancedSearch.docTypeId) {
      setDocTypeInput("");
      return;
    }
    const match = docTypeCategory?.find(
      (c) => c.id.toString() === tempAdvancedSearch.docTypeId
    );
    setDocTypeInput(match?.name || "");
  }, [tempAdvancedSearch.docTypeId, docTypeCategory]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        personOpen &&
        !target.closest("[data-person-dropdown]") &&
        !target.closest('input[placeholder*="người soạn thảo"]')
      ) {
        setPersonOpen(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, [personOpen]);

  const filterDocTypes = (keyword: string = "") => {
    const base = ["Tất cả", ...(docTypeCategory || []).map((c) => c.name)];
    const k = keyword.trim().toLowerCase();
    const data = k ? base.filter((n) => n.toLowerCase().includes(k)) : base;
    setFilteredDocTypeSuggestions(data);
    setShowSuggestions((p) => ({ ...p, docTypeId: true }));
  };

  const selectDocType = (label: string) => {
    setDocTypeInput(label);
    const matched = docTypeCategory?.find((c) => c.name === label);
    setTempAdvancedSearch((prev) => ({
      ...prev,
      docTypeId: label === "Tất cả" ? "" : matched?.id?.toString() || "",
    }));
    setShowSuggestions((p) => ({ ...p, docTypeId: false }));
  };

  const filterOutsideReceive = (keyword: string = "") => {
    const k = keyword.trim().toLowerCase();
    const data = k
      ? (outsideList as string[]).filter((n) => n.toLowerCase().includes(k))
      : (outsideList as string[]);
    setFilteredOutsideReceiveSuggestions(data);
    setShowSuggestions((p) => ({ ...p, outsideReceive: true }));
  };

  const selectOutsideReceive = (value: string) => {
    setOutsideReceiveInput(value);
    setTempAdvancedSearch((prev) => ({
      ...prev,
      outsideReceive: value,
    }));
    setShowSuggestions((p) => ({ ...p, outsideReceive: false }));
  };

  // Query params
  const basicParams = useMemo(() => {
    const params = {
      text: text,
    };
    return params;
  }, [text]);

  const advanceParams = useMemo(
    () => ({
      code: advancedSearch.code || null,
      numberArrival: advancedSearch.numberArrival || null,
      numberArrivalStr: advancedSearch.numberArrivalStr || null,
      preview: advancedSearch.preview || null,
      docTypeId: advancedSearch.docTypeId
        ? parseInt(advancedSearch.docTypeId, 10)
        : null,
      docFieldsId: advancedSearch.docFieldsId
        ? parseInt(advancedSearch.docFieldsId, 10)
        : null,
      userId: advancedSearch.userId || null,
      orgExe: advancedSearch.orgExe || null,
      typeDocument: advancedSearch.typeDocument || null,

      dateArrivalFrom: advancedSearch.startArrival || null,
      dateArrivalTo: advancedSearch.endArrival || null,
      dateIssuedFrom: advancedSearch.startIssued || null,
      dateIssuedTo: advancedSearch.endIssued || null,
      deadlineFrom: advancedSearch.startReceived || null,
      deadlineTo: advancedSearch.endReceived || null,

      security: advancedSearch.securityId
        ? parseInt(advancedSearch.securityId, 10)
        : null,
      urgent: advancedSearch.urgentId
        ? parseInt(advancedSearch.urgentId, 10)
        : null,
      docStatusName: advancedSearch.docStatusName || null,

      important:
        advancedSearch.important === ""
          ? null
          : advancedSearch.important === "true",
    }),
    [advancedSearch]
  );

  // Fetch data (unified by useAllDocuments)
  const actualParams = useMemo(() => {
    const params = isBasicSearch
      ? basicParams
      : hasSubmittedAdvancedSearch
        ? advanceParams
        : basicParams;
    return params;
  }, [isBasicSearch, hasSubmittedAdvancedSearch, basicParams, advanceParams]);

  const { data, isLoading, error } = useQuickSearch(actualParams);

  const rows: any[] = useMemo(() => data?.objList ?? [], [data]);
  const totalItems: number = data?.totalRecord ?? 0;

  // Sorting helpers
  const handleSort = (field: string) => {
    setSortBy((prev) => {
      if (prev !== field) {
        setDirection("ASC");
        return field;
      }
      // toggle
      setDirection((d) => (d === "ASC" ? "DESC" : d === "DESC" ? null : "ASC"));
      return field;
    });
    setPage(1);
  };
  const getSortIcon = (field: string) => {
    if (sortBy !== field || !direction) return null;
    return direction === "ASC" ? (
      <ChevronUp className="w-4 h-4 text-blue-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-blue-600" />
    );
  };

  const toggleImportant = useToggleImportant();

  const getListNameReceive = (listReceive: any[]) => {
    const listName = [];
    for (let i = 0; i < listReceive.length; i++) {
      listName.push(listReceive[i].orgName);
    }
    return listName.toString();
  };

  const prettyJSON = (objlist: any[]) => {
    const excelJson = [];
    let index = 0;
    for (const element of objlist) {
      excelJson.push([
        ++index,
        element.name ? element.name : "",
        element.code ? element.code : "",
        element.name ? element.name : "",
        element.createDate
          ? dayjs(element.createDate).format("DD-MM-YYYY")
          : "",
        element.type ? element.type : "",
      ]);
    }
    return excelJson;
  };

  const onStarClick = (r: any) => {
    const id = getRowId(r);
    if (id == null) return;
    toggleImportant.mutate({ docId: id, important: !Boolean(r.important) });
  };

  const handleAttachmentClick = (row: any) => {
    setSelectedAttachments(row.attachments || row.attachDrafts || []);
    setOpenAttach(true);
  };

  const getDateCalendar = (date?: any): string => {
    if (!date || !date.year || !date.month || !date.day) return "";
    const formatTwoNumber = (num: number) => num.toString().padStart(2, "0");
    return `${formatTwoNumber(date.day)}-${formatTwoNumber(date.month)}-${date.year}`;
  };

  const getStartDateExcel = (): string | null => {
    if (advancedSearch.startArrival)
      return getDateCalendar(advancedSearch.startArrival);
    if (advancedSearch.startIssued)
      return getDateCalendar(advancedSearch.startIssued);
    if (advancedSearch.startReceived)
      return getDateCalendar(advancedSearch.startReceived);
    return null;
  };

  const getEndDateExcel = (): string | null => {
    if (advancedSearch.endArrival && advancedSearch.startArrival)
      return getDateCalendar(advancedSearch.endArrival);
    if (advancedSearch.endIssued && advancedSearch.startIssued)
      return getDateCalendar(advancedSearch.endIssued);
    if (advancedSearch.endReceived && advancedSearch.startReceived)
      return getDateCalendar(advancedSearch.endReceived);
    return null;
  };

  const handleExportExcel = async () => {
    try {
      const base: Record<string, any> = {
        sortBy: sortBy || "",
        direction: direction ?? "DESC",
      };
      const query = isAdvancedSearchExpanded
        ? {
            ...base,
            code: advancedSearch.code || null,
            numberArrival: advancedSearch.numberArrival || null,
            numberArrivalStr: advancedSearch.numberArrivalStr || null,
            preview: advancedSearch.preview || null,
            docTypeId: advancedSearch.docTypeId
              ? parseInt(advancedSearch.docTypeId, 10)
              : null,
            docFieldsId: advancedSearch.docFieldsId
              ? parseInt(advancedSearch.docFieldsId, 10)
              : null,
            userId: advancedSearch.userId || null,
            orgExe: advancedSearch.orgExe || null,
            typeDocument: advancedSearch.typeDocument || null,
            dateArrivalFrom: advancedSearch.startArrival || null,
            dateArrivalTo: advancedSearch.endArrival || null,
            dateIssuedFrom: advancedSearch.startIssued || null,
            dateIssuedTo: advancedSearch.endIssued || null,
            deadlineFrom: advancedSearch.startReceived || null,
            deadlineTo: advancedSearch.endReceived || null,
            security: advancedSearch.securityId
              ? parseInt(advancedSearch.securityId, 10)
              : null,
            urgent: advancedSearch.urgentId
              ? parseInt(advancedSearch.urgentId, 10)
              : null,
            docStatusName: advancedSearch.docStatusName || null,
            important:
              advancedSearch.important === ""
                ? null
                : advancedSearch.important === "true",
          }
        : { ...base, text: text };

      const data = await DocumentOutService.exportExcelDocumentOut(query);
      const excelJson = prettyJSON(data?.objList ?? []);
      const header = [
        "STT",
        "Tên đối tượng/Trích yếu",
        "Số kí hiệu/Mã công việc",
        "Mô tả",
        "Ngày tạo",
        "Đơn vị",
      ];
      generateExcelDocumentOut(
        "KẾT QUẢ TÌM KIẾM VĂN BẢN",
        header,
        excelJson,
        "KET_QUA_TIM_KIEM",
        data?.objList ? data.objList.length : 0,
        getStartDateExcel(),
        getEndDateExcel()
      );
    } catch (err: any) {
      if ((ToastUtils as any)?.coLoiXayRaKhiExportExcel) {
        (ToastUtils as any).coLoiXayRaKhiExportExcel();
      } else {
        ToastUtils.error(err?.message || "Có lỗi xảy ra khi export Excel");
      }
    }
  };

  const columns: Column<any>[] = [
    {
      header: <span className="text-xs font-bold">ID</span>,
      sortable: false,
      className: "text-center w-[2%] min-w-[30px]",
      accessor: (_item: any, idx: number) => (
        <div className="flex justify-center items-center py-1">
          {(page - 1) * itemsPerPage + idx + 1}
        </div>
      ),
    },
    {
      header: (
        <div className="text-center leading-tight whitespace-normal">
          Tên đối tượng/Trích yếu
        </div>
      ),
      className: "text-center w-[29%] min-w-[40px]",
      sortable: false,
      accessor: (r: any) => r.name || "",
    },
    {
      header: (
        <button
          onClick={() => handleSort(SearchTitles.NUMBERSIGN)}
          className="flex items-center gap-1 hover:text-blue-600 transition-colors mx-auto whitespace-normal leading-tight"
        >
          Số kí hiệu/Mã công việc
        </button>
      ),
      className: "text-center w-[5%] min-w-[50px]",
      sortKey: "NUMBERSIGN",
      accessor: (r: any) => r.code || "",
    },
    {
      header: (
        <button
          onClick={() => handleSort(SearchTitles.DATEISSUED)}
          className="flex items-center gap-1 hover:text-blue-600 transition-colors mx-auto whitespace-normal leading-tight"
        >
          Mô tả
        </button>
      ),
      className: "text-center w-[4%] min-w-[50px]",
      sortKey: "DATEISSUED",
      // accessor: (r: any) => r.name || "",
    },
    {
      header: (
        <button
          onClick={() => handleSort(SearchTitles.PREVIEW)}
          className="flex items-center gap-1 hover:text-blue-600 transition-colors whitespace-normal leading-tight"
        >
          Ngày tạo
        </button>
      ),
      className: "text-left w-[3%] min-w-[200px]",
      sortKey: "PREVIEW",
      accessor: (r: any) => (
        <span
          className="max-w-[700px] line-clamp-2 text-sm leading-relaxed text-ellipsis"
          title={r.createDate ? formatDate(r.createDate) : ""}
        >
          {r.createDate ? formatDate(r.createDate) : ""}
        </span>
      ),
    },
    {
      header: (
        <button
          onClick={() => handleSort(SearchTitles.USER_ENTER)}
          className="flex items-center gap-1 hover:text-blue-600 transition-colors mx-auto whitespace-normal leading-tight"
        >
          Đơn vị
        </button>
      ),
      className: "text-center w-[8%] min-w-[80px]",
      sortKey: "USER_ENTER",
      accessor: (r: any) => r.type || "",
    },
  ];

  return (
    <div className="px-4 space-y-4">
      <div className="space-y-3">
        {/* Breadcrumb + Search row */}
        <div className="flex items-center justify-between">
          <BreadcrumbNavigation
            items={[
              {
                label: "Trang chủ",
              },
            ]}
            currentPage="Tìm kiếm văn bản"
            showHome={false}
          />

          {/* Input search + Advanced search button */}
          <div className="flex items-center gap-2">
            <SearchInput
              placeholder="Tìm kiếm Số/Ký hiệu | Trích yếu"
              value={text}
              setSearchInput={(v) => {
                setText(v);
                setIsBasicSearch(true);
              }}
            />
            {/* <Button
              variant="outline"
              onClick={() => setIsAdvancedSearchExpanded((p) => !p)}
              className={cn(
                "h-8 py-1 px-3 text-xs transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700 hover:text-white border-none"
              )}
            >
              <Search className="w-4 h-4 mr-1" />
              {isAdvancedSearchExpanded
                ? "Thu gọn tìm kiếm"
                : "Tìm kiếm nâng cao"}
            </Button> */}
          </div>
        </div>

        {/* Display type row - Below breadcrumb + search */}
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-2">
            <EncryptDisplaySelect
              onChange={() => {
                console.log("empty");
              }}
              selectClassName="w-36 h-9 text-xs"
            />
          </div>
        </div>
      </div>

      {isAdvancedSearchExpanded && (
        <div className="bg-white rounded-lg border mb-4">
          <h3 className="font-bold text-info mb-10 p-4 bg-blue-100 rounded-t-lg">
            Tìm kiếm nâng cao
          </h3>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setAdvancedSearch(tempAdvancedSearch);
              setHasSubmittedAdvancedSearch(true);
              setIsBasicSearch(false);
              setPage(1);
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-8">
              <div className="flex items-center gap-2">
                <Label className="font-bold text-right w-40 flex-shrink-0 text-[14px]">
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
                    placeholder="dd/mm/yyyy"
                    disabledFuture
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Label className="font-bold text-right w-40 flex-shrink-0 text-[14px]">
                  đến ngày
                </Label>
                <div className="flex-1 min-w-0">
                  <CustomDatePicker
                    selected={parseDateStringYMD(tempAdvancedSearch.endArrival)}
                    onChange={(date) =>
                      setTempAdvancedSearch((s) => ({
                        ...s,
                        endArrival: formatDateYMD(date),
                      }))
                    }
                    placeholder="dd/mm/yyyy"
                    disabledFuture
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Label className="font-bold text-right w-40 flex-shrink-0 text-[14px]">
                  Số/Ký hiệu
                </Label>
                <Input
                  value={tempAdvancedSearch.code}
                  onChange={(e) =>
                    setTempAdvancedSearch((s) => ({
                      ...s,
                      code: e.target.value,
                    }))
                  }
                  placeholder="Nhập số/ký hiệu"
                  className="flex-1 min-w-0"
                />
              </div>

              <div className="flex items-center gap-2">
                <Label className="font-bold text-right w-40 flex-shrink-0 text-[14px]">
                  Độ khẩn
                </Label>
                <div className="flex-1 min-w-0">
                  <SelectCustom
                    value={tempAdvancedSearch.urgentId}
                    onChange={(v) => {
                      const value = Array.isArray(v) ? v[0] : v;
                      setTempAdvancedSearch((prev) => ({
                        ...prev,
                        urgentId: value === "all" ? "" : String(value),
                      }));
                    }}
                    options={[
                      { label: "--- Chọn ---", value: "all" },
                      ...(urgentCategory || [])?.map((item: any) => ({
                        label: item.name,
                        value: item.id.toString(),
                      })),
                    ]}
                    className="w-full data-[placeholder]:text-black"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Label className="font-bold text-right w-40 flex-shrink-0 text-[14px]">
                  Ngày ban hành, từ ngày
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
                    placeholder="dd/mm/yyyy"
                    disabledFuture
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Label className="font-bold text-right w-40 flex-shrink-0 text-[14px]">
                  Đến ngày
                </Label>
                <div className="flex-1 min-w-0">
                  <CustomDatePicker
                    selected={parseDateStringYMD(tempAdvancedSearch.endIssued)}
                    onChange={(date) =>
                      setTempAdvancedSearch((s) => ({
                        ...s,
                        endIssued: formatDateYMD(date),
                      }))
                    }
                    placeholder="dd/mm/yyyy"
                    disabledFuture
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Label className="font-bold text-right w-40 flex-shrink-0 text-[14px]">
                  Trạng thái văn bản
                </Label>
                <div className="flex-1 min-w-0">
                  <SelectCustom
                    value={tempAdvancedSearch.docStatusName || undefined}
                    onChange={(v) => {
                      const value = Array.isArray(v) ? v[0] : v;
                      setTempAdvancedSearch((prev) => ({
                        ...prev,
                        docStatusName: value === "all" ? "" : String(value),
                      }));
                    }}
                    options={[
                      { label: "--- Tất Cả ---", value: "all" },
                      { label: "Trả lại văn bản", value: "Trả lại văn bản" },
                      { label: "Thu hồi văn bản", value: "Thu hồi văn bản" },
                      { label: "Đang xử lý", value: "Đang xử lý" },
                      { label: "Chờ xử lý", value: "Chờ xử lý" },
                      { label: "Hoàn thành", value: "Hoàn thành" },
                      { label: "Văn bản ủy quyền", value: "Văn bản ủy quyền" },
                    ]}
                    className="w-full data-[placeholder]:text-black"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                  Số, KH của VB đến
                </Label>
                <Input
                  // value={tempAdvancedSearch.numberArrivalStr}
                  onChange={(e) =>
                    setTempAdvancedSearch((p) => ({
                      ...p,
                      numberArrivalStr: e.target.value,
                    }))
                  }
                  className="h-9 text-sm bg-background"
                />
              </div>

              <div className="flex items-center gap-2">
                <Label className="font-bold text-right w-40 flex-shrink-0 text-[14px]">
                  Độ mật
                </Label>
                <div className="flex-1 min-w-0">
                  <SelectCustom
                    value={tempAdvancedSearch.securityId}
                    onChange={(v) => {
                      const value = Array.isArray(v) ? v[0] : v;
                      setTempAdvancedSearch((prev) => ({
                        ...prev,
                        securityId: value === "all" ? "" : String(value),
                      }));
                    }}
                    options={[
                      { label: "--- Chọn ---", value: "all" },
                      ...(securityCategory || [])?.map((item: any) => ({
                        label: item.name,
                        value: item.id.toString(),
                      })),
                    ]}
                    className="w-full data-[placeholder]:text-black"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Label className="font-bold text-right w-40 flex-shrink-0 text-[14px]">
                  Người soạn thảo/xử lý
                </Label>
                <div className="flex-1 min-w-0 relative" data-person-dropdown>
                  <Input
                    value={tempAdvancedSearch.userId}
                    onChange={(e) => {
                      const value = e.target.value;
                      setTempAdvancedSearch((s) => ({
                        ...s,
                        userId: value,
                      }));
                      setPersonSearchQuery(value);
                      if (listUser && listUser.length > 0) {
                        setPersonOpen(true);
                      }
                    }}
                    onFocus={() => {
                      if (listUser && listUser.length > 0) {
                        setPersonOpen(true);
                      }
                    }}
                    placeholder="Chọn hoặc nhập người soạn thảo"
                    className="w-full pr-7"
                  />
                  {tempAdvancedSearch.userId && (
                    <button
                      type="button"
                      onClick={() => {
                        setTempAdvancedSearch((s) => ({
                          ...s,
                          userId: "",
                        }));
                        setPersonSearchQuery("");
                        setPersonOpen(false);
                      }}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  {personOpen && listUser && listUser.length > 0 && (
                    <div className="absolute z-50 mt-1 w-full rounded-md border bg-background shadow-sm max-h-60 overflow-auto">
                      {(() => {
                        const filtered = listUser.filter((u: any) => {
                          const query = personSearchQuery.toLowerCase();
                          const fullName = (u.fullName || "").toLowerCase();
                          const userName = (u.userName || "").toLowerCase();
                          const orgName = (u.orgName || "").toLowerCase();
                          return (
                            fullName.includes(query) ||
                            userName.includes(query) ||
                            orgName.includes(query)
                          );
                        });
                        return filtered.length === 0 ? (
                          <div className="p-2 text-sm text-gray-500">
                            Không tìm thấy
                          </div>
                        ) : (
                          filtered.map((u: any) => {
                            const label = `${u.fullName || ""}${
                              u.orgName ? " - " + u.orgName : ""
                            }`.trim();
                            return (
                              <div
                                key={u.id ?? u.userName ?? u.fullName}
                                className="px-3 py-2 text-sm hover:bg-gray-50 cursor-pointer flex items-center gap-2"
                                onClick={() => {
                                  setTempAdvancedSearch((s) => ({
                                    ...s,
                                    userId: u.fullName || label,
                                  }));
                                  setPersonOpen(false);
                                  setPersonSearchQuery("");
                                }}
                              >
                                <User2 className="w-4 h-4 text-blue-600" />
                                <span className="truncate">{label}</span>
                              </div>
                            );
                          })
                        );
                      })()}
                    </div>
                  )}
                </div>
              </div>
              <div className="items-center gap-2 hidden">
                <Label className="font-bold text-right w-40 flex-shrink-0 text-[14px]">
                  Lĩnh vực
                </Label>
                <div className="flex-1 min-w-0">
                  <SelectCustom
                    className="w-full"
                    value={tempAdvancedSearch.docFieldsId}
                    onChange={(v) => {
                      const value = String(Array.isArray(v) ? v[0] : v);
                      setTempAdvancedSearch((prev) => ({
                        ...prev,
                        docFieldsId: value === "all" ? "" : value,
                      }));
                    }}
                    options={[
                      { label: "Tất cả", value: "all" },
                      ...(docFieldCategory || [])?.map((item) => ({
                        label: item.name,
                        value: item.id.toString(),
                      })),
                    ]}
                    placeholder="Chọn loại văn bản"
                    type="single"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                  {/* <Paperclip className="w-4 h-4 text-blue-600" /> */}
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

              <div className="flex items-center gap-2">
                <Label className="font-bold text-right w-40 flex-shrink-0 text-[14px]">
                  Văn bản quan trọng
                </Label>
                <div className="flex-1 min-w-0">
                  <SelectCustom
                    options={[
                      { label: "-- Chọn --", value: "all" },
                      { label: "Quan trọng", value: "true" },
                      { label: "Không quan trọng", value: "false" },
                    ]}
                    value={tempAdvancedSearch.important}
                    onChange={(v) => {
                      const value = String(Array.isArray(v) ? v[0] : v);
                      setTempAdvancedSearch((prev) => ({
                        ...prev,
                        important: value === "all" ? "" : value,
                      }));
                    }}
                    // placeholder="-- Chọn --"
                    className="w-full data-[placeholder]:text-black"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Label className="font-bold text-right w-40 flex-shrink-0 text-[14px]">
                  Đơn vị soạn thảo/xử lý
                </Label>
                <div className="flex-1 min-w-0">
                  <SelectCustom
                    value={tempAdvancedSearch.orgExe || undefined}
                    onChange={(v) => {
                      const value = Array.isArray(v) ? v[0] : v;
                      setTempAdvancedSearch((prev) => ({
                        ...prev,
                        orgExe: value === "all" ? "" : String(value),
                      }));
                    }}
                    options={[
                      { label: "--- Chọn ---", value: "all" },
                      ...(listOrg || [])?.map((item) => ({
                        label: item.name,
                        value: item.name,
                      })),
                    ]}
                    className="w-full data-[placeholder]:text-black"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Label className="font-bold text-right w-40 flex-shrink-0 text-[14px]">
                  Luồng văn bản
                </Label>
                <div className="flex-1 min-w-0">
                  <SelectCustom
                    value={tempAdvancedSearch.typeDocument || undefined}
                    onChange={(v) => {
                      const value = Array.isArray(v) ? v[0] : v;
                      setTempAdvancedSearch((prev) => ({
                        ...prev,
                        typeDocument: value === "all" ? "" : String(value),
                      }));
                    }}
                    options={[
                      { label: "---Chọn luồng văn bản---", value: "all" },
                      { label: "Văn bản đến", value: "2" },
                      { label: "Văn bản đi", value: "1" },
                    ]}
                    className="w-full data-[placeholder]:text-black"
                  />
                </div>
              </div>
            </div>
            {/* Search Actions */}
            <div className="flex items-center justify-center gap-3 my-6">
              <Button
                type="submit"
                size="sm"
                className="h-9 px-3 text-xs bg-blue-600 hover:bg-blue-700"
              >
                <Search className="w-4 h-4 mr-1" />
                Tìm kiếm
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-9 px-3 text-xs"
                onClick={() => {
                  setTempAdvancedSearch(defaultAdvanceSearch);
                  setAdvancedSearch(defaultAdvanceSearch);
                  setHasSubmittedAdvancedSearch(false);
                  setIsBasicSearch(true);
                  setPage(1);
                }}
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                Đặt lại
              </Button>
              <Button
                type="button"
                size="sm"
                className="h-9 px-3 text-xs bg-blue-600 hover:bg-blue-700"
                onClick={handleExportExcel}
                disabled={rows.length <= 0}
              >
                <FileDown className="w-4 h-4 mr-1" />
                Xuất Excel
              </Button>
            </div>
          </form>
        </div>
      )}

      <Table
        sortable={true}
        columns={columns}
        dataSource={rows}
        itemsPerPage={itemsPerPage}
        currentPage={page}
        onPageChange={(p) => setPage(p)}
        totalItems={totalItems}
        showPagination
        emptyText={<EmptyDocument />}
        loading={isLoading}
        hasAllChange
        onItemsPerPageChange={(n) => {
          setItemsPerPage(n);
          setPage(1);
        }}
        bgColor="bg-white"
        rowClassName={(_record, index) =>
          index % 2 === 0 ? "bg-white" : "bg-[#0000000d]"
        }
        onRowClick={(record) => {
          const id = getRowId(record);
          if (id != null) {
            if (record.type === "Văn bản đến") {
              SharedService.setCurrentMenuDocIn(
                Constant.DOCUMENT_IN_MENU.DRAFT
              );
              SharedService.setCurrentTabDocIn(TabNames.DUTHAO);
              router.push(`/document-out/search/detail/${id}`);
            } else if (record.type === "Văn bản đi") {
              SharedService.setCurrentMenuDocIn(
                Constant.DOCUMENT_IN_MENU.DRAFT
              );
              SharedService.setCurrentTabDocIn(TabNames.DUTHAO);
              router.push(`/document-in/search/draft-detail/${id}`);
            } else {
              ToastUtils.error("Không xác định được loại văn bản");
            }
          } else {
            ToastUtils.error("Không tìm thấy ID văn bản");
          }
        }}
      />

      <AttachmentDialog
        isOpen={openAttach}
        onOpenChange={setOpenAttach}
        attachments={selectedAttachments}
      />
    </div>
  );
}
