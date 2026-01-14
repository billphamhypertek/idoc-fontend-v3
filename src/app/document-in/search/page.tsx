"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import { useAllDocuments } from "@/hooks/data/document-in.data";
import { useGetCategoriesByCode } from "@/hooks/data/category.data";
import { useGetDocumentBookByType } from "@/hooks/data/document-book.data";
import { useInitDraftDataOut } from "@/hooks/data/draft.data";
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
  numberOrSign: "",
  preview: "",
  docTypeId: "",
  bookId: "",
  personEnter: "",
  startIssued: "",
  endIssued: "",
  startCreate: "",
  endCreate: "",
  orgCreateName: "",
  docFieldsId: "",
  important: "",
  outsideReceive: "",
  urgentId: "",
  securityId: "",
  startDeadline: "",
  endDeadline: "",
  numberOut: "",
  docStatusId: "",
};

const getRowId = (row: any): number | null => {
  const raw = row?.docOutId ?? row?.docId ?? row?.id ?? null;
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
};

export default function DocumentInSearch() {
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
  const { data: docStatusCategory } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.DOC_STATUS
  );
  const { data: listUser } = useGetListUserEnter();
  const { data: listOrg } = useGetListOrgEnter();
  const { data: outsideList = [] } = useLoadOutSideReceive();
  const { data: draftDataInit } = useInitDraftDataOut();

  const urgentCategory: any[] = draftDataInit?.urgentCategories || [];
  const securityCategory: any[] = draftDataInit?.securityCategories || [];

  const statusOptions = useMemo(() => {
    return (docStatusCategory || []).map((item: any) => ({
      key: item.code || item.id?.toString(),
      value: item.name,
    }));
  }, [docStatusCategory]);

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

  // Keep text input in sync with selected outsideReceive
  useEffect(() => {
    if (!tempAdvancedSearch.outsideReceive) {
      setOutsideReceiveInput("");
      return;
    }
    setOutsideReceiveInput(tempAdvancedSearch.outsideReceive);
  }, [tempAdvancedSearch.outsideReceive]);

  // Close person dropdown when clicking outside
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
  const basicParams = useMemo(
    () => ({
      text,
      page,
      sortBy: sortBy || "",
      direction: direction ?? "DESC",
      size: itemsPerPage,
    }),
    [text, page, sortBy, direction, itemsPerPage]
  );

  const advanceParams = useMemo(
    () => ({
      numberOrSign: advancedSearch.numberOrSign,
      preview: advancedSearch.preview,
      docTypeId: advancedSearch.docTypeId,
      docFieldsId: advancedSearch.docFieldsId,
      bookId: advancedSearch.bookId,
      personEnter: advancedSearch.personEnter,
      orgCreateName: advancedSearch.orgCreateName,
      startIssued: advancedSearch.startIssued,
      endIssued: advancedSearch.endIssued,
      startCreate: advancedSearch.startCreate,
      endCreate: advancedSearch.endCreate,
      outsideReceive: advancedSearch.outsideReceive,
      important: advancedSearch.important,
      page,
      sortBy: sortBy || "",
      direction: direction ?? "DESC",
      size: itemsPerPage,
    }),
    [advancedSearch, page, sortBy, direction, itemsPerPage]
  );

  // Fetch data (unified by useAllDocuments)
  const actualParams = useMemo(() => {
    if (isBasicSearch) {
      return basicParams;
    } else if (hasSubmittedAdvancedSearch) {
      return advanceParams;
    }
    return basicParams;
  }, [isBasicSearch, hasSubmittedAdvancedSearch, basicParams, advanceParams]);

  const { data, isLoading, error } = useAllDocuments(actualParams);

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
      let receive = element.listReceive
        ? getListNameReceive(element.listReceive)
        : "";
      const outsideReceive = element.outsideReceives
        ? element.outsideReceives
            .map((r: { address: string }) => r.address)
            .toString()
        : "";
      if (outsideReceive) {
        receive += `, ${outsideReceive}`;
      }

      excelJson.push([
        ++index,
        element.numberOut ? element.numberOut : "",
        element.numberOrSign ? element.numberOrSign : "",
        element.dateIssued
          ? dayjs(element.dateIssued).format("DD-MM-YYYY")
          : "",
        element.preview ? element.preview : "",
        element.orgCreateName ? element.orgCreateName : "",
        element.signerName ? element.signerName : "",
        receive,
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
    if (advancedSearch.startCreate)
      return getDateCalendar(advancedSearch.startCreate);
    if (advancedSearch.startIssued)
      return getDateCalendar(advancedSearch.startIssued);
    return null;
  };

  const getEndDateExcel = (): string | null => {
    if (advancedSearch.endCreate && advancedSearch.startCreate)
      return getDateCalendar(advancedSearch.endCreate);
    if (advancedSearch.endIssued && advancedSearch.startIssued)
      return getDateCalendar(advancedSearch.endIssued);
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
            numberOrSign: advancedSearch.numberOrSign,
            preview: advancedSearch.preview,
            docTypeId: advancedSearch.docTypeId,
            docFieldsId: advancedSearch.docFieldsId,
            bookId: advancedSearch.bookId,
            personEnter: advancedSearch.personEnter,
            orgCreateName: advancedSearch.orgCreateName,
            startIssued: advancedSearch.startIssued,
            endIssued: advancedSearch.endIssued,
            startCreate: advancedSearch.startCreate,
            endCreate: advancedSearch.endCreate,
            outsideReceive: advancedSearch.outsideReceive,
            important: advancedSearch.important,
          }
        : { ...base, text };

      const data = await DocumentOutService.exportExcelDocumentOut(query);
      const excelJson = prettyJSON(data ?? []);
      const header = [
        "STT",
        "Số đi",
        "Số/Ký hiệu",
        "Ngày ban hành",
        "Trích yếu",
        "Đơn vị soạn thảo",
        "Người ký",
        "Nơi nhận",
      ];
      // Gọi hàm generate Excel (frontend render)
      generateExcelDocumentOut(
        "SỔ IN BÁO CÁO VĂN BẢN ĐI",
        header,
        excelJson,
        "THONG_KE_VB_DI",
        data ? data.length : 0,
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
      header: <span className="text-xs font-bold">STT</span>,
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
        <button
          onClick={() => handleSort(SearchTitles.IMPORTANT)}
          className="flex items-center gap-1 hover:text-blue-600 transition-colors mx-auto"
        >
          <Star className="w-4 h-4 tex-gray-400 mx-auto" />
          {getSortIcon(SearchTitles.IMPORTANT)}
        </button>
      ),
      sortable: false,
      sortKey: "IMPORTANT",
      className: "text-center w-[2%] min-w-[30px]",
      accessor: (r: any) => {
        const starred = Boolean(r.important);
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onStarClick(r);
            }}
            title={starred ? "Bỏ đánh dấu" : "Đánh dấu"}
            className="inline-flex items-center justify-center w-full"
          >
            <Star
              className={cn(
                "w-4 h-4 mx-auto cursor-pointer hover:opacity-70",
                starred
                  ? "fill-yellow-400 text-yellow-400 stroke-yellow-600 stroke-2"
                  : "text-gray-400"
              )}
              aria-hidden
            />
          </button>
        );
      },
    },
    {
      header: (
        <div className="text-center leading-tight whitespace-normal">Số đi</div>
      ),
      className: "text-center w-[3%] min-w-[40px]",
      sortable: false,
      accessor: (r: any) => r.numberOut ?? r.numberInBook ?? "",
    },
    {
      header: (
        <button
          onClick={() => handleSort(SearchTitles.NUMBERSIGN)}
          className="flex items-center gap-1 hover:text-blue-600 transition-colors mx-auto whitespace-normal leading-tight"
        >
          Số/Ký hiệu
        </button>
      ),
      className: "text-center w-[4%] min-w-[50px]",
      sortKey: "NUMBERSIGN",
      accessor: (r: any) => r.numberOrSign ?? r.numberArrivalStr ?? "",
    },
    {
      header: (
        <button
          onClick={() => handleSort(SearchTitles.DATEISSUED)}
          className="flex items-center gap-1 hover:text-blue-600 transition-colors mx-auto whitespace-normal leading-tight"
        >
          Ngày ban hành
        </button>
      ),
      className: "text-center w-[4%] min-w-[50px]",
      sortKey: "DATEISSUED",
      accessor: (r: any) => formatDate(r.createDate),
    },
    {
      header: (
        <button
          onClick={() => handleSort(SearchTitles.PREVIEW)}
          className="flex items-center gap-1 hover:text-blue-600 transition-colors whitespace-normal leading-tight"
        >
          Trích yếu
        </button>
      ),
      className: "text-left w-[29%] min-w-[200px]",
      sortKey: "PREVIEW",
      accessor: (r: any) => (
        <span
          className="max-w-[700px] line-clamp-2 text-sm leading-relaxed text-ellipsis"
          title={r.preview ?? ""}
        >
          {r.preview ?? ""}
        </span>
      ),
    },
    {
      header: (
        <button
          onClick={() => handleSort(SearchTitles.USER_ENTER)}
          className="flex items-center gap-1 hover:text-blue-600 transition-colors mx-auto whitespace-normal leading-tight"
        >
          Đơn vị soạn thảo
        </button>
      ),
      className: "text-center w-[8%] min-w-[80px]",
      sortKey: "USER_ENTER",
      accessor: (r: any) => r.placeSend ?? r.orgCreateName ?? r.orgExe ?? "",
    },
    {
      header: (
        <div className="text-center leading-tight whitespace-normal">
          Đơn vị ban hành
        </div>
      ),
      className: "text-center w-[8%] min-w-[80px]",
      sortable: false,
      accessor: (r: any) => r.parentPlaceSend ?? r.orgIssuedName ?? "",
    },
    {
      header: (
        <span className="whitespace-normal leading-tight">Người tạo</span>
      ),
      className: "text-center w-[7%] min-w-[70px]",
      sortable: false,
      accessor: (r: any) =>
        r.personEnter ?? r.userCreateName ?? r.creatorName ?? "",
    },
    {
      header: <span className="whitespace-normal leading-tight">Người ký</span>,
      className: "text-center w-[7%] min-w-[70px]",
      sortable: false,
      accessor: (r: any) => {
        const signer = r.personSign ?? r.signerName ?? "";
        if (!signer) return "";

        // Nếu có nhiều người ký cách nhau bằng dấu phẩy, chia thành từng dòng
        const signers = signer
          .split(",")
          .map((s: string) => s.trim())
          .filter(Boolean);
        return (
          <div className="space-y-1">
            {signers.map((s: string, index: number) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                {/* <UserCheck className="w-3 h-3 text-blue-600 flex-shrink-0 mt-0.5" /> */}
                <span>{s}</span>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      header: "File",
      className: "text-center py-2 w-[2%] min-w-[30px]",
      sortable: false,
      accessor: (r: any) =>
        (r.attachments?.length ?? r.attachDrafts?.length ?? 0) > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-9 p-0"
            onClick={(e) => {
              e.stopPropagation();
              handleAttachmentClick(r);
            }}
          >
            <Paperclip className="w-4 h-4 text-blue-600" />
          </Button>
        ) : null,
    },
    {
      header: <span className="whitespace-normal leading-tight">Nơi nhận</span>,
      className: "text-center w-[6%] min-w-[60px]",
      sortable: false,
      accessor: (r: any) => {
        // Prefer listReceive like Angular: combine orgName/fullName
        const lr = (r.listReceive ?? r.receiveToKnow ?? []) as any[];
        if (Array.isArray(lr) && lr.length > 0) {
          const names = lr
            .map((x) => x?.orgName || x?.fullName)
            .filter(Boolean);
          if (names.length > 0) {
            return (
              <div className="space-y-1">
                {names.map((name: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <Building className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>{name}</span>
                  </div>
                ))}
              </div>
            );
          }
        }
        // Fallbacks from other endpoints
        const fallback = r.receiverName ?? r.placeReceive ?? "";
        if (!fallback) return "";

        // Nếu có nhiều nơi nhận cách nhau bằng dấu phẩy, chia thành từng dòng
        const places = fallback
          .split(",")
          .map((p: string) => p.trim())
          .filter(Boolean);
        return (
          <div className="space-y-1">
            {places.map((place: string, index: number) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <Building className="w-3 h-3 text-green-600 flex-shrink-0 mt-0.5" />
                <span>{place}</span>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      header: (
        <span className="whitespace-normal leading-tight text-center">
          Nơi nhận bên ngoài
        </span>
      ),
      className: "text-center w-[6%] min-w-[60px]",
      sortable: false,
      accessor: (r: any) => {
        const outs = (r.outsideReceives ??
          r.outsideReceiveLgsps ??
          []) as any[];
        if (Array.isArray(outs) && outs.length > 0) {
          const names = outs.map((x) => x?.address || x?.name).filter(Boolean);
          if (names.length > 0) {
            return (
              <div className="space-y-1">
                {names.map((name: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <Globe className="w-3 h-3 text-orange-600 flex-shrink-0 mt-0.5" />
                    <span>{name}</span>
                  </div>
                ))}
              </div>
            );
          }
        }

        const fallback = r.outsideReceive ?? "";
        if (!fallback) return "";

        // Nếu có nhiều nơi nhận bên ngoài cách nhau bằng dấu phẩy, chia thành từng dòng
        const places = fallback
          .split(",")
          .map((p: string) => p.trim())
          .filter(Boolean);
        return (
          <div className="space-y-1">
            {places.map((place: string, index: number) => (
              <div key={index} className="flex items-start gap-2 text-sm">
                <Globe className="w-3 h-3 text-orange-600 flex-shrink-0 mt-0.5" />
                <span>{place}</span>
              </div>
            ))}
          </div>
        );
      },
    },
    {
      header: (
        <button
          onClick={() => handleSort(SearchTitles.STATUS)}
          className="flex items-center gap-1 hover:text-blue-600 transition-colors mx-auto whitespace-normal leading-tight"
        >
          Trạng thái {getSortIcon(SearchTitles.STATUS)}
        </button>
      ),
      className: "text-center w-[6%] min-w-[60px]",
      sortKey: "STATUS",
      sortable: false,
      accessor: (item: any) => (
        <span
          className={cn(
            "inline-block px-2 py-1 rounded border text-xs whitespace-normal break-words leading-tight font-semibold text-center",
            getStatusColor(
              item.status ?? item.docStatusName ?? item.pstatusName ?? ""
            )
          )}
          style={getStatusStyle(
            item.status ?? item.docStatusName ?? item.pstatusName ?? ""
          )}
        >
          {item.status ?? item.docStatusName ?? item.pstatusName ?? ""}
        </span>
      ),
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
                label: "Văn bản đi",
              },
            ]}
            currentPage="Tra cứu tìm kiếm"
            showHome={false}
          />

          {/* Input search + Advanced search button */}
          <div className="flex items-center gap-3">
            <SearchInput
              placeholder="Tìm kiếm Số/Ký hiệu | Trích yếu"
              value={text}
              setSearchInput={(v) => {
                setText(v);
                setIsBasicSearch(true);
              }}
            />
            <Button
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
            </Button>
          </div>
        </div>

        {/* Display type row - Below breadcrumb + search */}
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-3">
            <EncryptDisplaySelect
              onChange={() => {
                setPage(1);
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
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4 mb-4 px-8">
              {isEncrypt && (
                <>
                  {/* 1. Số/Ký hiệu */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Số/Ký hiệu
                    </Label>
                    <Input
                      value={tempAdvancedSearch.numberOrSign}
                      onChange={(e) =>
                        setTempAdvancedSearch((s) => ({
                          ...s,
                          numberOrSign: e.target.value,
                        }))
                      }
                      placeholder="Nhập số/ký hiệu"
                      className="flex-1 min-w-1 h-9 text-sm bg-background"
                    />
                  </div>

                  {/* 2. Trích yếu */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Trích yếu
                    </Label>
                    <Input
                      value={tempAdvancedSearch.preview}
                      onChange={(e) =>
                        setTempAdvancedSearch((s) => ({
                          ...s,
                          preview: e.target.value,
                        }))
                      }
                      placeholder="Nhập trích yếu"
                      className="flex-1 min-w-0 h-9 text-sm bg-background"
                    />
                  </div>

                  {/* 3. Loại văn bản */}
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

                  {/* 4. Sổ văn bản đi */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Sổ văn bản đi
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

                  {/* 5-6. Ngày tạo */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Ngày tạo, từ ngày
                    </Label>
                    <CustomDatePicker
                      selected={parseDateStringYMD(
                        tempAdvancedSearch.startCreate
                      )}
                      onChange={(date) =>
                        setTempAdvancedSearch((s) => ({
                          ...s,
                          startCreate: formatDateYMD(date),
                        }))
                      }
                      placeholder="dd/mm/yyyy"
                      disabledFuture={true}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      đến ngày
                    </Label>
                    <CustomDatePicker
                      selected={parseDateStringYMD(
                        tempAdvancedSearch.endCreate
                      )}
                      onChange={(date) =>
                        setTempAdvancedSearch((s) => ({
                          ...s,
                          endCreate: formatDateYMD(date),
                        }))
                      }
                      placeholder="dd/mm/yyyy"
                      disabledFuture={true}
                      className="w-full"
                    />
                  </div>

                  {/* 7. Người soạn thảo */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Người soạn thảo
                    </Label>
                    <div
                      className="flex-1 min-w-0 relative"
                      data-person-dropdown
                    >
                      <Input
                        value={tempAdvancedSearch.personEnter}
                        onChange={(e) => {
                          const value = e.target.value;
                          setTempAdvancedSearch((s) => ({
                            ...s,
                            personEnter: value,
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
                        className="w-full pr-7 h-9 text-sm bg-background"
                      />
                      {tempAdvancedSearch.personEnter && (
                        <button
                          type="button"
                          onClick={() => {
                            setTempAdvancedSearch((s) => ({
                              ...s,
                              personEnter: "",
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
                                        personEnter: u.fullName || label,
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

                  {/* 8-9. Ngày ban hành */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Ngày ban hành, từ ngày
                    </Label>
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
                      disabledFuture={true}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      đến ngày
                    </Label>
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
                      placeholder="dd/mm/yyyy"
                      disabledFuture={true}
                      className="w-full"
                    />
                  </div>

                  {/* 10. Độ khẩn */}
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

                  {/* 11-12. Hạn xử lý */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Hạn xử lý từ ngày
                    </Label>
                    <CustomDatePicker
                      selected={parseDateStringYMD(
                        tempAdvancedSearch.startDeadline
                      )}
                      onChange={(date) =>
                        setTempAdvancedSearch((s) => ({
                          ...s,
                          startDeadline: formatDateYMD(date),
                        }))
                      }
                      placeholder="dd/mm/yyyy"
                      disabledFuture={true}
                      className="w-full"
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      đến ngày
                    </Label>
                    <div className="flex-1 min-w-0">
                      <CustomDatePicker
                        selected={parseDateStringYMD(
                          tempAdvancedSearch.endDeadline
                        )}
                        onChange={(date) =>
                          setTempAdvancedSearch((s) => ({
                            ...s,
                            endDeadline: formatDateYMD(date),
                          }))
                        }
                        placeholder="dd/mm/yyyy"
                        disabledFuture={true}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* 13. Đơn vị soạn thảo */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Đơn vị soạn thảo
                    </Label>
                    <div className="flex-1 min-w-0">
                      <SelectCustom
                        options={[
                          { label: "-- Chọn --", value: "" },
                          ...(listOrg || []).map((item) => ({
                            label: item.name,
                            value: item.name,
                          })),
                        ]}
                        value={tempAdvancedSearch.orgCreateName}
                        onChange={(val) =>
                          setTempAdvancedSearch((prev) => ({
                            ...prev,
                            orgCreateName: typeof val === "string" ? val : "",
                          }))
                        }
                        placeholder="-- Chọn --"
                        className="h-9 bg-background flex-1"
                      />
                    </div>
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

                  {/* 15. Nơi nhận bên ngoài */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Nơi nhận bên ngoài
                    </Label>
                    <div className="flex-1 min-w-0 relative [&>div>label]:hidden [&>div]:space-y-0">
                      <FilterField
                        label=""
                        field="outsideReceive"
                        value={tempAdvancedSearch.outsideReceive || ""}
                        withSuggestions={true}
                        showSuggestions={showSuggestions.outsideReceive}
                        suggestions={filteredOutsideReceiveSuggestions}
                        onChange={(_, value) =>
                          setTempAdvancedSearch((p) => ({
                            ...p,
                            outsideReceive: value,
                          }))
                        }
                        onFocus={() =>
                          filterOutsideReceive(
                            tempAdvancedSearch.outsideReceive
                          )
                        }
                        onBlur={() =>
                          setTimeout(
                            () =>
                              setShowSuggestions((p) => ({
                                ...p,
                                outsideReceive: false,
                              })),
                            200
                          )
                        }
                        onSelectSuggestion={(_, value) =>
                          selectOutsideReceive(value)
                        }
                      />
                    </div>
                  </div>

                  {/* 16. Mức độ bảo mật */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Mức độ bảo mật
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
                  {/* 17. Số đi */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Số đi
                    </Label>
                    <Input
                      value={tempAdvancedSearch.numberOut}
                      onChange={(e) =>
                        setTempAdvancedSearch((p) => ({
                          ...p,
                          numberOut: e.target.value,
                        }))
                      }
                      placeholder="Nhập số đi"
                      className="h-9 text-sm bg-background"
                    />
                  </div>

                  {/* 18. Trạng thái văn bản */}
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
                        value={tempAdvancedSearch.docStatusId || ""}
                        onChange={(val) =>
                          setTempAdvancedSearch((p) => ({
                            ...p,
                            docStatusId:
                              typeof val === "string" ? val : val[0] || "",
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
                  {/* Hàng 1 */}
                  {/* 1. Số/Ký hiệu */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Số/Ký hiệu
                    </Label>
                    <Input
                      value={tempAdvancedSearch.numberOrSign}
                      onChange={(e) =>
                        setTempAdvancedSearch((s) => ({
                          ...s,
                          numberOrSign: e.target.value,
                        }))
                      }
                      placeholder="Nhập số/ký hiệu"
                      className="flex-1 min-w-0 h-9 text-sm bg-background"
                    />
                  </div>

                  {/* 2. Trích yếu */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Trích yếu
                    </Label>
                    <Input
                      value={tempAdvancedSearch.preview}
                      onChange={(e) =>
                        setTempAdvancedSearch((s) => ({
                          ...s,
                          preview: e.target.value,
                        }))
                      }
                      placeholder="Nhập trích yếu"
                      className="flex-1 min-w-0 h-9 text-sm bg-background"
                    />
                  </div>

                  {/* 3. Ngày tạo, từ ngày */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Ngày tạo, từ ngày
                    </Label>
                    <div className="flex-1 min-w-0">
                      <CustomDatePicker
                        selected={parseDateStringYMD(
                          tempAdvancedSearch.startCreate
                        )}
                        onChange={(date) =>
                          setTempAdvancedSearch((s) => ({
                            ...s,
                            startCreate: formatDateYMD(date),
                          }))
                        }
                        placeholder="dd/mm/yyyy"
                        disabledFuture={true}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Hàng 2 */}
                  {/* 1. Đến ngày (thuộc Ngày tạo) */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      đến ngày
                    </Label>
                    <div className="flex-1 min-w-0">
                      <CustomDatePicker
                        selected={parseDateStringYMD(
                          tempAdvancedSearch.endCreate
                        )}
                        onChange={(date) =>
                          setTempAdvancedSearch((s) => ({
                            ...s,
                            endCreate: formatDateYMD(date),
                          }))
                        }
                        placeholder="dd/mm/yyyy"
                        disabledFuture={true}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* 2. Người soạn thảo */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Người soạn thảo
                    </Label>
                    <div
                      className="flex-1 min-w-0 relative"
                      data-person-dropdown
                    >
                      <Input
                        value={tempAdvancedSearch.personEnter}
                        onChange={(e) => {
                          const value = e.target.value;
                          setTempAdvancedSearch((s) => ({
                            ...s,
                            personEnter: value,
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
                        className="w-full pr-7 h-9 text-sm bg-background"
                      />
                      {tempAdvancedSearch.personEnter && (
                        <button
                          type="button"
                          onClick={() => {
                            setTempAdvancedSearch((s) => ({
                              ...s,
                              personEnter: "",
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
                                        personEnter: u.fullName || label,
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

                  {/* 3. Ngày ban hành, từ ngày */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
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
                        disabledFuture={true}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Hàng 3 */}
                  {/* 1. Đến ngày (thuộc Ngày ban hành) */}
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
                        placeholder="dd/mm/yyyy"
                        disabledFuture={true}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* 2. Độ khẩn */}
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
                        value={tempAdvancedSearch.urgentId || ""}
                        onChange={(val) =>
                          setTempAdvancedSearch((p) => ({
                            ...p,
                            urgentId:
                              typeof val === "string" ? val : val[0] || "",
                          }))
                        }
                        placeholder="-- Chọn --"
                        className="h-9 bg-background flex-1"
                      />
                    </div>
                  </div>

                  {/* 3. Hạn xử lý từ ngày */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Hạn xử lý từ ngày
                    </Label>
                    <div className="flex-1 min-w-0">
                      <CustomDatePicker
                        selected={parseDateStringYMD(
                          tempAdvancedSearch.startDeadline
                        )}
                        onChange={(date) =>
                          setTempAdvancedSearch((s) => ({
                            ...s,
                            startDeadline: formatDateYMD(date),
                          }))
                        }
                        placeholder="dd/mm/yyyy"
                        disabledFuture={true}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* Hàng 4 */}
                  {/* 1. Đến ngày (thuộc Hạn xử lý) */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      đến ngày
                    </Label>
                    <div className="flex-1 min-w-0">
                      <CustomDatePicker
                        selected={parseDateStringYMD(
                          tempAdvancedSearch.endDeadline
                        )}
                        onChange={(date) =>
                          setTempAdvancedSearch((s) => ({
                            ...s,
                            endDeadline: formatDateYMD(date),
                          }))
                        }
                        placeholder="dd/mm/yyyy"
                        disabledFuture={true}
                        className="w-full"
                      />
                    </div>
                  </div>

                  {/* 2. Đơn vị soạn thảo */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Đơn vị soạn thảo
                    </Label>
                    <div className="flex-1 min-w-0">
                      <SelectCustom
                        options={[
                          { label: "-- Chọn --", value: "" },
                          ...(listOrg || []).map((item) => ({
                            label: item.name,
                            value: item.name,
                          })),
                        ]}
                        value={tempAdvancedSearch.orgCreateName}
                        onChange={(val) =>
                          setTempAdvancedSearch((prev) => ({
                            ...prev,
                            orgCreateName: typeof val === "string" ? val : "",
                          }))
                        }
                        placeholder="-- Chọn --"
                        className="h-9 bg-background flex-1"
                      />
                    </div>
                  </div>

                  {/* 3. Văn bản quan trọng */}
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

                  {/* Hàng 5 */}
                  {/* 1. Mức độ bảo mật */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Mức độ bảo mật
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
                  {/* 2. Số đi */}
                  <div className="flex items-center gap-3">
                    <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                      Số đi
                    </Label>
                    <Input
                      value={tempAdvancedSearch.numberOut}
                      onChange={(e) =>
                        setTempAdvancedSearch((p) => ({
                          ...p,
                          numberOut: e.target.value,
                        }))
                      }
                      placeholder="Nhập số đi"
                      className="h-9 text-sm bg-background"
                    />
                  </div>

                  {/* 3. Trạng thái văn bản */}
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
                </>
              )}
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
            SharedService.setCurrentMenuDocIn(Constant.DOCUMENT_IN_MENU.DRAFT);
            SharedService.setCurrentTabDocIn(TabNames.DUTHAO);
            router.push(`/document-in/search/draft-detail/${id}`);
          } else ToastUtils.error("Không tìm thấy ID văn bản");
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
