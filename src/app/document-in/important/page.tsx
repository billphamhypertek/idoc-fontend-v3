"use client";

import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import React, { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Paperclip,
  RotateCcw,
  Search,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Table } from "@/components/ui/table";
import { formatDate } from "@/utils/datetime.utils";
import { SearchInput } from "@/components/document-in/SearchInput";
import { useRouter } from "next/navigation";
import { Column } from "@/definitions/types/table.type";
import AttachmentDialog from "@/components/common/AttachmentDialog";
import { Input } from "@/components/ui/input";
import {
  useImportantDocuments,
  useInBookType,
  useToggleImportant,
} from "@/hooks/data/document-in.data";
import { ToastUtils } from "@/utils/toast.utils";
import EncryptDisplaySelect from "@/components/document-out/EncryptDisplaySelect";
import { isCheckStartUsbTokenWatcher } from "@/services/usbTokenService";
import {
  useGetListOrgEnter,
  useGetListUserEnter,
} from "@/hooks/data/document-out.data";
import { DocumentOutService } from "@/services/document-out.service";
import { generateExcelDocumentOut } from "@/services/export.service";
import { useGetCategoriesByCode } from "@/hooks/data/category.data";
import { Constant } from "@/definitions/constants/constant";
import SelectCustom from "@/components/common/SelectCustom";
import { EmptyDocument } from "@/components/common/EmptyDocument";
import { useEncryptStore } from "@/stores/encrypt.store";
import { EncryptionService } from "@/services/encryption.service";
import FilterField from "@/components/common/FilterFiled";
import { getStatusColor, getStatusStyle } from "@/utils/status-colors.utils";
import { SharedService } from "@/services/shared.service";
import { TabNames } from "@/definitions/enums/document.enum";
import { isClericalDocumentOut } from "@/utils/token.utils";
import { Label } from "@/components/ui/label";

const getRowId = (row: any): number | null => {
  const raw = row?.docOutId ?? row?.docId ?? row?.id ?? null;
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
};

export default function ImportantDocuments() {
  const router = useRouter();
  const { isEncrypt } = useEncryptStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAdvancedSearchExpanded, setIsAdvancedSearchExpanded] =
    useState(false);
  const [isBasicSearch, setIsBasicSearch] = useState(true);
  const [hasSubmittedAdvancedSearch, setHasSubmittedAdvancedSearch] =
    useState(false);
  const [advancedSearch, setAdvancedSearch] = useState({
    numberOrSign: "",
    preview: "",
    docTypeId: "",
    bookId: "all",
    personEnter: "",
    orgCreateName: "all",
    docFieldsId: "",
  });
  const [openAttach, setOpenAttach] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState<any[]>([]);
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "ASC" | "DESC" | null;
  } | null>(null);

  // DocType suggestions state
  const [showSuggestions, setShowSuggestions] = useState({
    docTypeId: false,
    personEnter: false,
  });
  const [docTypeInput, setDocTypeInput] = useState("");
  const [filteredDocTypeSuggestions, setFilteredDocTypeSuggestions] = useState<
    string[]
  >([]);
  const [filteredPersonEnterSuggestions, setFilteredPersonEnterSuggestions] =
    useState<string[]>([]);

  const toggleImportant = useToggleImportant();

  const handleAttachmentClick = (row: any) => {
    setSelectedAttachments(row.attachments || []);
    setOpenAttach(true);
  };

  const { data: docTypeCategory } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.DOC_TYPE
  );
  const { data: bookCategories } = useInBookType();
  const { data: listUser } = useGetListUserEnter();
  const { data: orgIssued } = useGetListOrgEnter();

  const params = useMemo(() => {
    const base = {
      page: currentPage,
      sortBy: "",
      direction: "DESC" as const,
      size: itemsPerPage,
      important: "true",
    };
    if (isBasicSearch) {
      return {
        ...base,
        text: searchQuery,
        sortBy: sortConfig?.key || "",
        direction: sortConfig?.direction || "DESC",
      } as Record<string, any>;
    }
    return {
      ...base,
      numberOrSign: advancedSearch.numberOrSign,
      preview: advancedSearch.preview,
      docTypeId: advancedSearch.docTypeId,
      docFieldsId: advancedSearch.docFieldsId,
      bookId: advancedSearch.bookId,
      personEnter: advancedSearch.personEnter,
      orgCreateName: advancedSearch.orgCreateName,
      sortBy: sortConfig?.key || "",
      direction: sortConfig?.direction || "DESC",
    } as Record<string, any>;
  }, [
    searchQuery,
    currentPage,
    itemsPerPage,
    isBasicSearch,
    advancedSearch,
    sortConfig,
  ]);

  const [actualParams, setActualParams] = useState(params);

  useEffect(() => {
    if (isBasicSearch) {
      setActualParams(params);
    } else if (hasSubmittedAdvancedSearch) {
      setActualParams(params);
    }
  }, [isBasicSearch, params, hasSubmittedAdvancedSearch]);

  const {
    data: currentData,
    isLoading,
    error,
  } = useImportantDocuments(actualParams);

  // Keep text input in sync with selected docTypeId
  useEffect(() => {
    if (!advancedSearch.docTypeId) {
      setDocTypeInput("");
      return;
    }
    const match = docTypeCategory?.find(
      (c) => c.id.toString() === advancedSearch.docTypeId
    );
    setDocTypeInput(match?.name || "");
  }, [advancedSearch.docTypeId, docTypeCategory]);

  const filterDocTypes = (keyword: string = "") => {
    const base = [...(docTypeCategory || []).map((c) => c.name)];
    const k = keyword.trim().toLowerCase();
    const data = k ? base.filter((n) => n.toLowerCase().includes(k)) : base;
    setFilteredDocTypeSuggestions(data);
    setShowSuggestions((p) => ({ ...p, docTypeId: true }));
  };

  const selectDocType = (label: string) => {
    setDocTypeInput(label);
    const matched = docTypeCategory?.find((c) => c.name === label);
    setAdvancedSearch((prev) => ({
      ...prev,
      docTypeId: label === "Tất cả" ? "" : matched?.id?.toString() || "",
    }));
    setShowSuggestions((p) => ({ ...p, docTypeId: false }));
  };

  const filterPersonEnter = (keyword: string = "") => {
    const base = (listUser || []).map((u: any) => u.fullName || "");
    const k = keyword.trim().toLowerCase();
    const data = k ? base.filter((n) => n.toLowerCase().includes(k)) : base;
    setFilteredPersonEnterSuggestions(data);
    setShowSuggestions((p) => ({ ...p, personEnter: true }));
  };

  const selectPersonEnter = (name: string) => {
    setAdvancedSearch((prev) => ({
      ...prev,
      personEnter: name,
    }));
    setShowSuggestions((p) => ({ ...p, personEnter: false }));
  };

  const rawRows: any[] = currentData?.objList ?? [];
  // Client-side sorting similar to document-out important page
  const rows: any[] = useMemo(() => {
    if (!sortConfig || !sortConfig.direction) return rawRows;
    const { key, direction } = sortConfig;
    return [...rawRows].sort((a, b) => {
      let aValue = a?.[key];
      let bValue = b?.[key];
      if (aValue == null) aValue = "";
      if (bValue == null) bValue = "";

      // Date fields
      if (["createDate", "dateIssued"].includes(key)) {
        const aDate = aValue ? new Date(aValue as string).getTime() : 0;
        const bDate = bValue ? new Date(bValue as string).getTime() : 0;
        return direction === "ASC" ? aDate - bDate : bDate - aDate;
      }

      // Default string/number compare
      const aStr = String(aValue).toLowerCase();
      const bStr = String(bValue).toLowerCase();
      return direction === "ASC"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [rawRows, sortConfig]);
  const totalItems: number = currentData?.totalRecord ?? 0;

  // Handle sorting toggle
  const handleSort = (key: string) => {
    let direction: "ASC" | "DESC" | null = "ASC";
    if (sortConfig && sortConfig.key === key && sortConfig.direction === "ASC")
      direction = "DESC";
    else if (
      sortConfig &&
      sortConfig.key === key &&
      sortConfig.direction === "DESC"
    )
      direction = null;
    setSortConfig(direction ? { key, direction } : null);
    setCurrentPage(1);
  };

  // USB token watcher for encrypted docs (mirror doc-out important)
  useEffect(() => {
    if (isEncrypt) {
      isCheckStartUsbTokenWatcher();
    }
  }, [isEncrypt]);

  const buildExcelJson = (objList: any[]): any[][] => {
    const excelJson: any[][] = [];
    let index = 0;

    objList.forEach((element) => {
      excelJson.push([
        ++index,
        element.numberOrSign ?? "",
        element.personEnter ?? "",
        element.createDate
          ? new Date(element.createDate).toLocaleDateString("vi-VN")
          : "",
        element.dateIssued
          ? new Date(element.dateIssued).toLocaleDateString("vi-VN")
          : "",
        element.docTypeName ?? "",
        element.preview ?? "",
        element.securityName ?? "",
        element.status ?? "",
        element.showToKnow ?? "",
      ]);
    });

    return excelJson;
  };

  const handleExportExcel = async () => {
    try {
      const baseParams: Record<string, any> = {
        page: currentPage,
        sortBy: "",
        direction: "DESC",
        size: itemsPerPage,
      };
      const query = isAdvancedSearchExpanded
        ? {
            ...baseParams,
            numberOrSign: advancedSearch.numberOrSign,
            preview: advancedSearch.preview,
            docTypeId: advancedSearch.docTypeId,
            docFieldsId: advancedSearch.docFieldsId,
            bookId: advancedSearch.bookId,
            personEnter: advancedSearch.personEnter,
            orgCreateName: advancedSearch.orgCreateName,
          }
        : { ...baseParams, text: searchQuery };
      // Gọi API từ service
      const data = await DocumentOutService.exportExcelDocumentOut(query);

      const excelJson = buildExcelJson(data ?? []);
      const header = [
        "STT",
        "Số đi",
        "Số/Ký hiệu",
        "Ngày văn bản",
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
        data ? data?.length : 0,
        null,
        null
      );
    } catch (err) {
      ToastUtils.error("Có lỗi xảy ra khi export Excel");
    }
  };

  useEffect(() => {
    SharedService.setCurrentMenuDocIn(Constant.DOCUMENT_IN_MENU.DRAFT);
  }, []);
  useEffect(() => {
    if (isEncrypt) {
      EncryptionService.isCheckStartUsbTokenWatcher();
    }
  }, [isEncrypt]);

  const getSortIcon = (field: string) => {
    const sortBy = sortConfig?.key;
    const direction = sortConfig?.direction;
    if (sortBy !== field || !direction) return null;
    return direction === "ASC" ? (
      <ChevronUp className="w-4 h-4 text-blue-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-blue-600" />
    );
  };
  const columns: Column<any>[] = [
    {
      header: (
        <div className="flex justify-center items-center py-1">
          <span className="text-xs font-medium whitespace-normal leading-tight">
            STT
          </span>
        </div>
      ),
      className: "text-center py-1 w-[4%] min-w-[40px] whitespace-normal",
      accessor: (_item: any, idx: number) => (
        <div className="flex justify-center items-center py-1">
          {(currentPage - 1) * itemsPerPage + idx + 1}
        </div>
      ),
    },
    {
      header: (
        <div
          className="flex justify-center items-center py-1 cursor-pointer"
          onClick={() => handleSort("important")}
        >
          <Star className="w-4 h-4 text-gray-400 mx-auto" />
          {getSortIcon("important")}
        </div>
      ),
      className: "text-center w-[4%] min-w-[40px]",
      sortKey: "IMPORTANT",
      sortable: false,
      accessor: (item: any) => {
        const id = getRowId(item);
        const isImportant = !!item.important;
        return (
          <button
            type="button"
            className="flex items-center justify-center w-full"
            onClick={(e) => {
              e.stopPropagation();
              if (id == null) {
                ToastUtils.error("Không tìm thấy ID văn bản");
                return;
              }
              toggleImportant.mutate({ docId: id, important: !isImportant });
            }}
            title={isImportant ? "Bỏ quan trọng" : "Đánh dấu quan trọng"}
          >
            <Star
              className={cn(
                "w-4 h-4 mx-auto cursor-pointer hover:opacity-70",
                isImportant
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
        <button
          onClick={() => handleSort("numberOrSign")}
          className="flex items-center gap-1 hover:text-blue-600 transition-colors mx-auto whitespace-normal leading-tight"
        >
          Số/Ký hiệu
        </button>
      ),
      sortKey: "numberOrSign",
      className: "text-center min-w-[80px] w-[7%] whitespace-normal",
      accessor: (item: any) => item.numberOrSign ?? "",
    },
    {
      header: (
        <button
          onClick={() => handleSort("USER_ENTER")}
          className="flex items-center gap-1 hover:text-blue-600 transition-colors mx-auto whitespace-normal leading-tight"
        >
          Người soạn thảo
        </button>
      ),
      sortKey: "USER_ENTER",
      className: "text-center py-2 min-w-[120px] w-[12%] whitespace-normal",
      accessor: (item: any) => item.personEnter,
    },
    {
      header: (
        <button
          onClick={() => handleSort("CREATEDATE")}
          className="flex items-center gap-1 hover:text-blue-600 transition-colors mx-auto whitespace-normal leading-tight"
        >
          Ngày tạo
        </button>
      ),
      className: "text-center min-w-[90px] w-[7%] whitespace-normal",
      sortKey: "CREATEDATE",
      accessor: (item: any) => formatDate(item.createDate),
    },
    {
      header: (
        <button
          onClick={() => handleSort("DATEISSUED")}
          className="flex items-center gap-1 hover:text-blue-600 transition-colors mx-auto whitespace-normal leading-tight"
        >
          Ngày ban hành
        </button>
      ),
      className: "text-center min-w-[100px] w-[7%] whitespace-normal",
      sortKey: "DATEISSUED",
      accessor: (item: any) => formatDate(item.dateIssued ?? item.handleDate),
    },
    {
      header: (
        <button
          onClick={() => handleSort("DOCTYPE")}
          className="flex items-center gap-1 hover:text-blue-600 transition-colors mx-auto whitespace-normal leading-tight"
        >
          Loại văn bản
        </button>
      ),
      className: "text-center min-w-[90px] w-[7%] whitespace-normal",
      sortKey: "DOCTYPE",
      accessor: (item: any) => item.docTypeName,
    },
    {
      header: (
        <button
          onClick={() => handleSort("preview")}
          className="max-w-[700px] line-clamp-2 text-sm leading-relaxed text-ellipsis"
        >
          Trích yếu
        </button>
      ),
      className: "text-left min-w-[250px] w-[40%]",
      sortKey: "preview",
      accessor: (item: any) => (
        <span
          className="text-sm line-clamp-2 cursor-help text-gray-900"
          title={item.preview ?? ""}
        >
          {item.preview
            ? item.preview.length > 60
              ? `${item.preview.substring(0, 60)}...`
              : item.preview
            : ""}
        </span>
      ),
    },
    {
      header: (
        <button
          onClick={() => handleSort("SECURITY_NAME")}
          className="flex items-center gap-1 hover:text-blue-600 transition-colors mx-auto whitespace-normal leading-tight"
        >
          Độ mật
        </button>
      ),
      className: "text-center min-w-[60px] w-[4%] whitespace-normal",
      sortKey: "SECURITY_NAME",
      accessor: (item: any) => item.security?.name ?? "Thường",
    },
    {
      header: (
        <button
          onClick={() => handleSort("status")}
          className="flex items-center gap-1 hover:text-blue-600 transition-colors mx-auto whitespace-normal leading-tight"
        >
          Trạng thái
        </button>
      ),
      className: "text-center min-w-[80px] w-[4%] whitespace-normal",
      sortKey: "status",
      accessor: (item: any) => (
        <span
          className={cn(
            "inline-flex items-center px-1 py-0.5 rounded border text-sm whitespace-nowrap font-semibold ",
            getStatusColor(item.status)
          )}
          style={getStatusStyle(item.status)}
        >
          {item.status}
        </span>
      ),
    },
    {
      header: <span className="whitespace-normal leading-tight">File</span>,
      sortable: false,
      className: "text-center py-2 min-w-[50px] w-[4%] whitespace-normal",
      accessor: (item: any) =>
        item.attachments?.length > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            className="w-8 h-9 p-0"
            onClick={(e) => {
              e.stopPropagation();
              handleAttachmentClick(item);
            }}
          >
            <Paperclip className="w-4 h-4 text-blue-600" />
          </Button>
        ) : null,
    },
  ];
  const handleRowClick = (item: any) => {
    const id = getRowId(item);
    if (id == null) ToastUtils.error("Không tìm thấy ID văn bản");
    const isClerical = isClericalDocumentOut();
    switch (item.docStatusEnum) {
      case "DU_THAO":
        if (item.statusHandleEnum == "CHO_Y_KIEN") {
          SharedService.setCurrentMenuDocIn(Constant.DOCUMENT_IN_MENU.HANDLE);
          SharedService.setCurrentTabDocIn(TabNames.CHOCHOYKIEN);
        } else if (
          item.statusHandleEnum == "DA_Y_KIEN" ||
          item.statusHandleEnum == "DA_XU_LY"
        ) {
          SharedService.setCurrentMenuDocIn(Constant.DOCUMENT_IN_MENU.HANDLE);
          SharedService.setCurrentTabDocIn(TabNames.DAXULY);
        } else if (item.statusHandleEnum == "DA_TRINH_KY") {
          SharedService.setCurrentMenuDocIn(Constant.DOCUMENT_IN_MENU.DRAFT);
          SharedService.setCurrentTabDocIn(TabNames.DATRINHKY);
        } else if (
          item.statusHandleEnum == "CHO_XU_LY" ||
          item.statusHandleEnum == "BI_TRA_LAI"
        ) {
          SharedService.setCurrentMenuDocIn(Constant.DOCUMENT_IN_MENU.HANDLE);
          SharedService.setCurrentTabDocIn(TabNames.CHOXULY);
        } else {
          SharedService.setCurrentMenuDocIn(Constant.DOCUMENT_IN_MENU.DRAFT);
          SharedService.setCurrentTabDocIn(TabNames.DUTHAO);
        }
        break;
      case "DANG_XU_LY":
        if (item.statusHandleEnum == "DA_TRINH_KY") {
          SharedService.setCurrentMenuDocIn(Constant.DOCUMENT_IN_MENU.DRAFT);
          SharedService.setCurrentTabDocIn(TabNames.DATRINHKY);
        } else if (
          item.statusHandleEnum == "CHO_XU_LY" ||
          item.statusHandleEnum == "CHO_Y_KIEN"
        ) {
          SharedService.setCurrentMenuDocIn(Constant.DOCUMENT_IN_MENU.HANDLE);
          SharedService.setCurrentTabDocIn(TabNames.CHOXULY);
        } else if (
          item.statusHandleEnum == "DA_Y_KIEN" ||
          item.statusHandleEnum == "DA_XU_LY"
        ) {
          SharedService.setCurrentMenuDocIn(Constant.DOCUMENT_IN_MENU.HANDLE);
          SharedService.setCurrentTabDocIn(TabNames.DAXULY);
        } else {
          SharedService.setCurrentMenuDocIn(Constant.DOCUMENT_IN_MENU.HANDLE);
          SharedService.setCurrentTabDocIn(TabNames.CHOXULY);
        }
        break;
      case "CHO_BAN_HANH":
        if (isClerical) {
          SharedService.setCurrentMenuDocIn(Constant.DOCUMENT_IN_MENU.ISSUED);
          SharedService.setCurrentTabDocIn(TabNames.CHOBANHANH);
        } else {
          SharedService.setCurrentMenuDocIn(Constant.DOCUMENT_IN_MENU.DRAFT);
          SharedService.setCurrentTabDocIn(TabNames.DATRINHKY);
        }
        break;
      case "DA_BAN_HANH":
        if (isClerical) {
          SharedService.setCurrentMenuDocIn(Constant.DOCUMENT_IN_MENU.ISSUED);
          SharedService.setCurrentTabDocIn(TabNames.DABANHANH_DOC);
        } else {
          SharedService.setCurrentMenuDocIn(Constant.DOCUMENT_IN_MENU.DRAFT);
          SharedService.setCurrentTabDocIn(TabNames.DATRINHKY);
        }
        break;
      case "BI_TRA_LAI":
        if (item.statusHandleEnum == "CHO_Y_KIEN") {
          SharedService.setCurrentMenuDocIn(Constant.DOCUMENT_IN_MENU.HANDLE);
          SharedService.setCurrentTabDocIn(TabNames.CHOCHOYKIEN);
        } else if (item.statusHandleEnum == "DA_Y_KIEN") {
          SharedService.setCurrentMenuDocIn(Constant.DOCUMENT_IN_MENU.HANDLE);
          SharedService.setCurrentTabDocIn(TabNames.DAXULY);
        } else {
          SharedService.setCurrentMenuDocIn(Constant.DOCUMENT_IN_MENU.DRAFT);
          SharedService.setCurrentTabDocIn(TabNames.DUTHAO);
        }
        break;
      case "THU_HOI_XL":
        if (item.statusHandleEnum == "CHO_Y_KIEN") {
          SharedService.setCurrentMenuDocIn(Constant.DOCUMENT_IN_MENU.HANDLE);
          SharedService.setCurrentTabDocIn(TabNames.CHOCHOYKIEN);
        } else if (item.statusHandleEnum == "DA_Y_KIEN") {
          SharedService.setCurrentMenuDocIn(Constant.DOCUMENT_IN_MENU.HANDLE);
          SharedService.setCurrentTabDocIn(TabNames.DAXULY);
        } else {
          SharedService.setCurrentMenuDocIn(Constant.DOCUMENT_IN_MENU.DRAFT);
          SharedService.setCurrentTabDocIn(TabNames.DUTHAO);
        }
        break;
      default:
        break;
    }
    router.push(`/document-in/search/draft-detail/${id}`);
  };
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <BreadcrumbNavigation
          items={[
            {
              href: "/document-in/list",
              label: "Văn bản đến",
            },
          ]}
          currentPage="Văn bản quan trọng"
          showHome={false}
          className="ml-3"
        />
        <div className="flex items-center gap-3">
          <SearchInput
            placeholder="Tìm kiếm Số/Ký hiệu | Trích yếu"
            value={searchQuery}
            setSearchInput={(v) => setSearchQuery(v)}
          />
          <Button
            variant="outline"
            onClick={() =>
              setIsAdvancedSearchExpanded(!isAdvancedSearchExpanded)
            }
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
      <div className="flex items-center justify-end">
        <div className="flex items-center gap-2">
          <EncryptDisplaySelect selectClassName="w-36 h-9 text-xs" />
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
              setHasSubmittedAdvancedSearch(true);
              setIsBasicSearch(false);
              setCurrentPage(1);
            }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-8">
              <div className="flex items-center gap-2">
                <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                  Số/Ký hiệu
                </Label>
                <Input
                  value={advancedSearch.numberOrSign}
                  onChange={(e) =>
                    setAdvancedSearch((s) => ({
                      ...s,
                      numberOrSign: e.target.value,
                    }))
                  }
                  placeholder="Nhập số/ký hiệu..."
                  className="flex-1 min-w-0"
                />
              </div>

              <div className="flex items-center gap-2">
                <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                  Trích yếu
                </Label>
                <Input
                  value={advancedSearch.preview}
                  onChange={(e) =>
                    setAdvancedSearch((s) => ({
                      ...s,
                      preview: e.target.value,
                    }))
                  }
                  placeholder="Nhập từ khóa..."
                  className="flex-1 min-w-0"
                />
              </div>

              <div className="flex items-center gap-2">
                <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                  Loại văn bản
                </Label>
                <div className="flex-1 min-w-0 relative [&>div>label]:hidden [&>div]:space-y-0">
                  <FilterField
                    label=""
                    field="docTypeId"
                    value={docTypeInput}
                    placeholder="Chọn loại văn bản"
                    withSuggestions={true}
                    showSuggestions={showSuggestions.docTypeId}
                    suggestions={filteredDocTypeSuggestions}
                    onChange={(_, v) => {
                      setDocTypeInput(v);
                      filterDocTypes(v);
                    }}
                    onFocus={() => filterDocTypes("")}
                    onBlur={() => {
                      setTimeout(
                        () =>
                          setShowSuggestions((prev) => ({
                            ...prev,
                            docTypeId: false,
                          })),
                        150
                      );
                    }}
                    onSelectSuggestion={(_, v) => selectDocType(v)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                  Sổ văn bản đi
                </Label>
                <div className="flex-1 min-w-0">
                  <SelectCustom
                    value={advancedSearch.bookId}
                    onChange={(v) => {
                      const value = String(Array.isArray(v) ? v[0] : v);
                      setAdvancedSearch((prev) => ({
                        ...prev,
                        bookId: value === "all" ? "" : value,
                      }));
                    }}
                    options={[
                      { label: "---Chọn---", value: "all" },
                      ...(bookCategories || [])?.map((item: any) => ({
                        label: item.name,
                        value: item.id.toString(),
                      })),
                    ]}
                    placeholder=""
                    type="single"
                    className="w-full"
                    contentClassName="w-[var(--radix-select-trigger-width)]"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                  Người soạn thảo
                </Label>
                <div className="flex-1 min-w-0 relative [&>div>label]:hidden [&>div]:space-y-0">
                  <FilterField
                    label=""
                    field="personEnter"
                    value={advancedSearch.personEnter}
                    placeholder=""
                    withSuggestions={true}
                    showSuggestions={showSuggestions.personEnter}
                    suggestions={filteredPersonEnterSuggestions}
                    onChange={(_, v) => {
                      setAdvancedSearch((s) => ({
                        ...s,
                        personEnter: v,
                      }));
                      filterPersonEnter(v);
                    }}
                    onFocus={() => filterPersonEnter("")}
                    onBlur={() => {
                      setTimeout(
                        () =>
                          setShowSuggestions((prev) => ({
                            ...prev,
                            personEnter: false,
                          })),
                        150
                      );
                    }}
                    onSelectSuggestion={(_, v) => selectPersonEnter(v)}
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                  Đơn vị soạn thảo
                </Label>
                <div className="flex-1 min-w-0">
                  <SelectCustom
                    value={advancedSearch.orgCreateName || undefined}
                    onChange={(v) => {
                      const value = String(Array.isArray(v) ? v[0] : v);
                      setAdvancedSearch((prev) => ({
                        ...prev,
                        orgCreateName: value === "all" ? "" : value,
                      }));
                    }}
                    options={[
                      { label: "---Chọn---", value: "all" },
                      ...(orgIssued || [])?.map((item) => ({
                        label: item.name,
                        value: item.id.toString(),
                      })),
                    ]}
                    placeholder=""
                    type="single"
                    className="w-full"
                    contentClassName="w-[var(--radix-select-trigger-width)]"
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
                  setAdvancedSearch({
                    numberOrSign: "",
                    preview: "",
                    docTypeId: "",
                    bookId: "",
                    personEnter: "",
                    orgCreateName: "",
                    docFieldsId: "",
                  });
                  setHasSubmittedAdvancedSearch(false);
                  setIsBasicSearch(true);
                  setCurrentPage(1);
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
                Xuất Excel
              </Button>
            </div>
          </form>
        </div>
      )}

      <div className="p-3">
        <Table
          sortable={true}
          columns={columns}
          dataSource={rows}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          totalItems={totalItems}
          onPageChange={setCurrentPage}
          showPagination
          bgColor="bg-white"
          rowClassName={(item, index) =>
            index % 2 === 0 ? "bg-white" : "bg-[#0000000d]"
          }
          className="overflow-hidden"
          emptyText={<EmptyDocument />}
          onRowClick={handleRowClick}
          onItemsPerPageChange={(size) => {
            setItemsPerPage(size);
            setCurrentPage(1);
          }}
        />
      </div>

      <AttachmentDialog
        isOpen={openAttach}
        onOpenChange={setOpenAttach}
        attachments={selectedAttachments}
      />
    </div>
  );
}
