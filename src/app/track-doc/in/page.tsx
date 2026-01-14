"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, FileSpreadsheet, RotateCcw } from "lucide-react";
import { TrackDocService } from "@/services/trackdoc.service";
import { DocumentBookService } from "@/services/document-book.service";
import { DocumentOutService } from "@/services/document-out.service";
import { Constant } from "@/definitions/constants/constant";
import { formatDateVN } from "@/utils/datetime.utils";
import { getDateCalendar } from "@/utils/time.util";
import { getErrorMessage } from "@/utils/common.utils";
import { ToastUtils } from "@/utils/toast.utils";
import { generateExcelDocumentIn } from "@/services/export.service";
import { Table } from "@/components/ui/table";
import { Column } from "@/definitions/types/table.type";
import { CustomDatePicker } from "@/components/ui/calendar";
import SelectCustom from "@/components/common/SelectCustom";
import { cn } from "@/lib/utils";
import BreadcrumbNavigation, {
  type BreadcrumbItem,
} from "@/components/common/BreadcrumbNavigation";

enum SearchTitles {
  NUMBERSIGN = "NUMBERSIGN",
  PREVIEW = "PREVIEW",
  STATUS = "STATUS",
  ORG = "ORG",
  DEADLINE = "DEADLINE",
}

interface SearchFields {
  docFieldsId: string;
  startArrival: { year: number; month: number; day: number } | null;
  endArrival: { year: number; month: number; day: number } | null;
  startIssued: { year: number; month: number; day: number } | null;
  endIssued: { year: number; month: number; day: number } | null;
  startReceived: { year: number; month: number; day: number } | null;
  endReceived: { year: number; month: number; day: number } | null;
  numberArrival: string;
  docStatusId: string | null;
  urgentId: string;
  securityId: string;
  numberOrSign: string;
  orgIssuedName: string;
  bookId: string;
  preview: string;
  expired: string;
  isAdvanceSearch: boolean;
  page: number;
  sortBy: string;
  direction: string;
  pageSize: number;
}

interface DocumentInItem {
  id: number;
  dateIssuedTo: string | null; // Ngày đến
  numberArrival: string | null; // Số đến
  placeSend: string | null; // Cơ quan ban hành/Nơi gửi
  numberArrivalStr: string | null; // Số ký hiệu
  dateArrivalTo: string | null; // Ngày văn bản
  preview: string | null; // Trích yếu
  mainList: string | null; // Xử lý chính
  supportList: string | null; // Phối hợp
  orgName: string | null; // Đơn vị nhận bản lưu
  currentDeadline: string | null; // Hạn xử lý
  docStatusName: string | null; // Trạng thái
  isChecked?: boolean;
}

interface Category {
  id: number;
  name: string;
}

interface DocumentBook {
  id: number;
  name: string;
}

const defaultSearchFields: SearchFields = {
  docFieldsId: "",
  startArrival: null,
  endArrival: null,
  startIssued: null,
  endIssued: null,
  startReceived: null,
  endReceived: null,
  numberArrival: "",
  docStatusId: null,
  urgentId: "",
  securityId: "",
  numberOrSign: "",
  orgIssuedName: "",
  bookId: "",
  preview: "",
  expired: "",
  isAdvanceSearch: false,
  page: 1,
  sortBy: "",
  direction: Constant.SORT_TYPE.DECREASE,
  pageSize: Constant.PAGING.SIZE,
};

// Convert Date to NgbDate format
const dateToNgbDate = (
  date: Date | null
): { year: number; month: number; day: number } | null => {
  if (!date) return null;
  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
};

// Convert NgbDate to Date
const ngbDateToDate = (
  ngbDate: { year: number; month: number; day: number } | null
): Date | null => {
  if (!ngbDate) return null;
  return new Date(ngbDate.year, ngbDate.month - 1, ngbDate.day);
};

export default function TrackDocInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [searchFields, setSearchFields] =
    useState<SearchFields>(defaultSearchFields);
  const [documentList, setDocumentList] = useState<DocumentInItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(
    Constant.PAGING.SIZE
  );
  const [totalItems, setTotalItems] = useState<number>(0);
  const [currentDocument, setCurrentDocument] = useState<DocumentInItem | null>(
    null
  );
  const [resetKey, setResetKey] = useState<number>(0); // Key to force re-render on reset

  // Categories
  const [urgentCategory, setUrgentCategory] = useState<Category[]>([]);
  const [securityCategory, setSecurityCategory] = useState<Category[]>([]);
  const [placeSendCategory, setPlaceSendCategory] = useState<Category[]>([]);
  const [placeSendFilterOptions, setPlaceSendFilterOptions] = useState<
    string[]
  >([]);
  const [bookCategory, setBookCategory] = useState<DocumentBook[]>([]);
  const [docStatusCategory, setDocStatusCategory] = useState<any[]>([]);

  // Load categories on mount
  useEffect(() => {
    loadUrgentCategory();
    loadSecurityCategory();
    loadPlaceSendCategory();
    loadDocumentBook();
    loadDocStatusCategory();
  }, []);

  // Load data from URL params
  useEffect(() => {
    if (!searchParams) return;
    const page = searchParams.get("page");
    const pageSize = searchParams.get("pageSize");
    if (page) {
      const pageNum = parseInt(page, 10);
      if (!isNaN(pageNum)) {
        setCurrentPage(pageNum);
        setSearchFields((prev) => ({ ...prev, page: pageNum }));
      }
    }
    if (pageSize) {
      const pageSizeNum = parseInt(pageSize, 10);
      if (!isNaN(pageSizeNum)) {
        setItemsPerPage(pageSizeNum);
        setSearchFields((prev) => ({ ...prev, pageSize: pageSizeNum }));
      }
    }

    // Try to load from localStorage
    const currentPageUrl = window.location.pathname;
    const previousSearchField = localStorage.getItem(
      `searchField${currentPageUrl}`
    );
    const savedPage = localStorage.getItem(`page${currentPageUrl}`);

    if (previousSearchField && savedPage) {
      try {
        const savedFields = JSON.parse(previousSearchField);
        setSearchFields(savedFields);
        const savedPageNum = parseInt(savedPage, 10);
        if (!isNaN(savedPageNum)) {
          setCurrentPage(savedPageNum);
          doAdvanceSearch(savedPageNum);
        }
      } catch (e) {
        console.error("Error parsing saved search fields:", e);
        doLoadDocumentIn(1);
      }
    } else {
      doLoadDocumentIn(1);
    }
  }, []);

  // Load document list
  const doLoadDocumentIn = async (page: number) => {
    setLoading(true);
    try {
      const params = {
        ...searchFields,
        page: page,
        pageSize: itemsPerPage,
      };
      const data = await TrackDocService.trackDocumentInList(
        page.toString(),
        params
      );
      setDocumentList(data?.content || []);
      setTotalItems(data?.totalElements || 0);
    } catch (error) {
      console.error("Error loading document list:", error);
      setDocumentList([]);
      setTotalItems(0);
      await handleError(error);
    } finally {
      setLoading(false);
    }
  };

  // Advance search
  const doAdvanceSearch = async (pageNumber: number) => {
    const currentPageUrl = window.location.pathname;
    localStorage.setItem(`page${currentPageUrl}`, pageNumber.toString());

    setSearchFields((prev) => ({
      ...prev,
      isAdvanceSearch: true,
      page: pageNumber,
      pageSize: itemsPerPage,
    }));
    setCurrentPage(pageNumber);

    // Update URL params
    const params = new URLSearchParams();
    params.set("page", pageNumber.toString());
    params.set("pageSize", itemsPerPage.toString());
    router.push(`${window.location.pathname}?${params.toString()}`);

    // Save search fields
    const fieldsToSave = {
      ...searchFields,
      isAdvanceSearch: true,
      page: pageNumber,
      pageSize: itemsPerPage,
    };
    localStorage.setItem(
      `searchField${currentPageUrl}`,
      JSON.stringify(fieldsToSave)
    );

    setLoading(true);
    try {
      const params: any = {
        ...fieldsToSave,
        page: pageNumber,
        pageSize: itemsPerPage,
      };

      // Convert dates
      if (fieldsToSave.startArrival) {
        params.startArrival = getDateCalendar(fieldsToSave.startArrival);
      }
      if (fieldsToSave.endArrival) {
        params.endArrival = getDateCalendar(fieldsToSave.endArrival);
      }
      if (fieldsToSave.startIssued) {
        params.startIssued = getDateCalendar(fieldsToSave.startIssued);
      }
      if (fieldsToSave.endIssued) {
        params.endIssued = getDateCalendar(fieldsToSave.endIssued);
      }
      if (fieldsToSave.startReceived) {
        params.startReceived = getDateCalendar(fieldsToSave.startReceived);
      }
      if (fieldsToSave.endReceived) {
        params.endReceived = getDateCalendar(fieldsToSave.endReceived);
      }

      // Handle null docStatusId
      if (params.docStatusId === "null") {
        params.docStatusId = null;
      }

      const data = await TrackDocService.trackDocumentInList(
        pageNumber.toString(),
        params
      );
      setDocumentList(data?.content || []);
      setTotalItems(data?.totalElements || 0);
    } catch (error) {
      console.error("Error in advance search:", error);
      setDocumentList([]);
      setTotalItems(0);
      await handleError(error);
    } finally {
      setLoading(false);
    }
  };

  // Load categories
  const loadUrgentCategory = async () => {
    try {
      const data = await DocumentOutService.getCategoryWithCode(
        Constant.CATEGORYTYPE_CODE.URGENT
      );
      setUrgentCategory(data || []);
    } catch (error) {
      console.error("Error loading urgent category:", error);
    }
  };

  const loadSecurityCategory = async () => {
    try {
      const data = await DocumentOutService.getCategoryWithCode(
        Constant.CATEGORYTYPE_CODE.SECURITY
      );
      setSecurityCategory(data || []);
    } catch (error) {
      console.error("Error loading security category:", error);
    }
  };

  const loadPlaceSendCategory = async () => {
    try {
      const data = await DocumentOutService.getCategoryWithCode(
        Constant.CATEGORYTYPE_CODE.ORG_SEND
      );
      setPlaceSendCategory(data || []);
      // Set filter options for autocomplete
      setPlaceSendFilterOptions(data?.map((item: Category) => item.name) || []);
    } catch (error) {
      console.error("Error loading place send category:", error);
    }
  };

  const loadDocumentBook = async () => {
    try {
      // Use getDocumentBookByTypeFlowing like v1
      const data = await DocumentBookService.getDocumentBookByTypeFlowing(0); // 0 = văn bản đến
      setBookCategory(data || []);
    } catch (error) {
      console.error("Error loading document book:", error);
      setBookCategory([]);
    }
  };

  const loadDocStatusCategory = () => {
    const docType = Constant.DOCUMENT_TYPE.find((doc) => doc.code === 0);
    if (docType) {
      setDocStatusCategory(docType.documentStatus || []);
    }
  };

  // Filter place send options
  const filterPlaceSendOptions = (value: string): string[] => {
    if (!value) return placeSendFilterOptions;
    const filterValue = value.toLowerCase();
    return placeSendFilterOptions.filter((option) =>
      option.toLowerCase().includes(filterValue)
    );
  };

  // Sort by field
  const sortByField = (fieldName: string) => {
    const newDirection =
      searchFields.direction === Constant.SORT_TYPE.DECREASE
        ? Constant.SORT_TYPE.INCREASE
        : Constant.SORT_TYPE.DECREASE;

    setSearchFields((prev) => ({
      ...prev,
      sortBy: fieldName,
      direction: newDirection,
    }));

    doAdvanceSearch(1);
  };

  // Handle page change
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    doAdvanceSearch(page);
  };

  // Handle items per page change
  const handleItemsPerPageChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
    doAdvanceSearch(1);
  };

  // Format date for Excel (dd-MM-yyyy)
  const formatDateForExcel = (dateString: string | null): string => {
    if (!dateString) return "";
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    } catch {
      return "";
    }
  };

  // Format data for Excel (similar to prettyJSON in v1)
  const formatDataForExcel = (objList: any[]): any[] => {
    const excelJson: any[] = [];
    if (!objList || objList.length === 0) {
      return excelJson;
    }

    objList.forEach((element, index) => {
      excelJson.push([
        index + 1,
        formatDateForExcel(element.dateIssuedTo),
        element.numberArrival || "",
        element.placeSend || "",
        element.numberArrivalStr || "",
        formatDateForExcel(element.dateArrivalTo),
        element.preview || "",
        element.mainList || "",
        element.supportList || "",
        element.orgName || "",
        element.currentDeadline
          ? formatDateForExcel(element.currentDeadline)
          : "Vô thời hạn",
      ]);
    });

    return excelJson;
  };

  // Get start date for Excel filename
  const getStartDateExcel = (): string | null => {
    if (searchFields.startArrival) {
      return getDateCalendar(searchFields.startArrival);
    }
    return null;
  };

  // Get end date for Excel filename
  const getEndDateExcel = (): string | null => {
    if (searchFields.endArrival && searchFields.startArrival) {
      return getDateCalendar(searchFields.endArrival);
    }
    return null;
  };

  // Export Excel
  const exportExcel = async () => {
    try {
      const params: any = {};

      if (searchFields.isAdvanceSearch) {
        // Build params for advance search
        params.startArrival = searchFields.startArrival
          ? getDateCalendar(searchFields.startArrival)
          : "";
        params.endArrival = searchFields.endArrival
          ? getDateCalendar(searchFields.endArrival)
          : "";
        params.startIssued = searchFields.startIssued
          ? getDateCalendar(searchFields.startIssued)
          : "";
        params.endIssued = searchFields.endIssued
          ? getDateCalendar(searchFields.endIssued)
          : "";
        params.startReceived = searchFields.startReceived
          ? getDateCalendar(searchFields.startReceived)
          : "";
        params.endReceived = searchFields.endReceived
          ? getDateCalendar(searchFields.endReceived)
          : "";
        params.numberOrSign = searchFields.numberOrSign || "";
        params.numberArrival = searchFields.numberArrival || "";
        params.preview = searchFields.preview || "";
        params.orgIssuedName = searchFields.orgIssuedName || "";
        params.securityId = searchFields.securityId || "";
        params.expired = searchFields.expired || "";
        params.urgentId = searchFields.urgentId || "";
        params.docFieldsId = searchFields.docFieldsId || "";
        params.bookId = searchFields.bookId || "";
      } else {
        params.sortBy = searchFields.sortBy;
        params.direction = searchFields.direction;
      }

      const queryString = new URLSearchParams(
        Object.entries(params).reduce(
          (acc, [key, value]) => {
            if (value !== "" && value !== null) {
              acc[key] = String(value);
            }
            return acc;
          },
          {} as Record<string, string>
        )
      ).toString();

      // Get JSON data from API (not Blob)
      const data =
        await DocumentOutService.exportExcelDocumentFlowingIn(queryString);

      // Format data for Excel
      const excelJson = formatDataForExcel(data || []);

      // Generate Excel file client-side
      const header = [
        "STT",
        "Ngày đến",
        "Số đến",
        "Cơ quan ban hành",
        "Số ký hiệu",
        "Ngày văn bản",
        "Trích yếu",
        "Xử lý chính",
        "Phối hợp",
        "Đơn vị nhận bản lưu",
        "Hạn xử lý",
      ];

      const startDate = getStartDateExcel();
      const endDate = getEndDateExcel();

      await generateExcelDocumentIn(
        "SỔ IN BÁO CÁO VĂN BẢN ĐẾN",
        header,
        excelJson,
        "THONG_KE_VB_DEN",
        data?.length || 0,
        startDate,
        endDate
      );
    } catch (error) {
      console.error("Error exporting Excel:", error);
      const errorMessage = await getErrorMessage(error);
      ToastUtils.error(
        errorMessage || "Lỗi khi tải file Excel. Vui lòng thử lại!"
      );
    }
  };

  // Handle error
  const handleError = async (error: any) => {
    const errorMessage = await getErrorMessage(error);
    ToastUtils.error(errorMessage);
  };

  // Transform text
  const transformText = (value: string | null, limit: number): string => {
    if (!value) return "";
    return value.length > limit ? `${value.slice(0, limit)}...` : value;
  };

  // Get list name receive
  const getListNameReceive = (listReceive: any[]): string => {
    if (!Array.isArray(listReceive)) return "";
    return listReceive.map((item) => item.orgName).join(", ");
  };

  // Go to detail page
  const goToDetailPage = (id: number) => {
    router.push(`/track-doc/in/detail/${id}?isTrackDocumentList=true`);
  };

  // Handle search submit
  const handleSearchSubmit = () => {
    doAdvanceSearch(1);
  };

  // Handle search reset
  const handleSearchReset = async () => {
    // Create a new object from defaultSearchFields to ensure React re-renders
    const resetFields: SearchFields = {
      docFieldsId: "",
      startArrival: null,
      endArrival: null,
      startIssued: null,
      endIssued: null,
      startReceived: null,
      endReceived: null,
      numberArrival: "",
      docStatusId: null,
      urgentId: "",
      securityId: "",
      numberOrSign: "",
      orgIssuedName: "",
      bookId: "",
      preview: "",
      expired: "",
      isAdvanceSearch: false,
      page: 1,
      sortBy: "",
      direction: Constant.SORT_TYPE.DECREASE,
      pageSize: Constant.PAGING.SIZE,
    };

    setSearchFields(resetFields);
    setCurrentPage(1);
    setItemsPerPage(Constant.PAGING.SIZE);
    // Force re-render of components
    setResetKey((prev) => prev + 1);
    // Clear localStorage
    const currentPageUrl = window.location.pathname;
    localStorage.removeItem(`searchField${currentPageUrl}`);
    localStorage.removeItem(`page${currentPageUrl}`);
    // Clear URL params
    router.push(window.location.pathname);

    // Load initial data with reset fields directly
    setLoading(true);
    try {
      const params = {
        ...resetFields,
        page: 1,
        pageSize: Constant.PAGING.SIZE,
      };
      const data = await TrackDocService.trackDocumentInList("1", params);
      setDocumentList(data?.content || []);
      setTotalItems(data?.totalElements || 0);
    } catch (error) {
      console.error("Error loading document list after reset:", error);
      setDocumentList([]);
      setTotalItems(0);
      await handleError(error);
    } finally {
      setLoading(false);
    }
  };

  // Handle sort from table
  const handleSort = (
    sortConfig: { key: string; direction: "asc" | "desc" | null } | null
  ) => {
    if (!sortConfig || sortConfig.direction === null) {
      // Clear sort
      setSearchFields((prev) => ({
        ...prev,
        sortBy: "",
        direction: Constant.SORT_TYPE.DECREASE,
      }));
      doAdvanceSearch(currentPage);
      return;
    }

    // Map table sort direction to API direction
    const apiDirection =
      sortConfig.direction === "asc"
        ? Constant.SORT_TYPE.INCREASE
        : Constant.SORT_TYPE.DECREASE;

    setSearchFields((prev) => ({
      ...prev,
      sortBy: sortConfig.key,
      direction: apiDirection,
    }));

    doAdvanceSearch(currentPage);
  };

  // Handle Enter key in search inputs
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearchSubmit();
    }
  };

  // Table columns
  const columns: Column<DocumentInItem>[] = useMemo(
    () => [
      {
        header: "STT",
        accessor: (_item, index) => index + 1,
        className: "w-12 text-center",
      },
      {
        header: "Ngày đến",
        accessor: (item) => (
          <div className="text-center">
            {item.dateIssuedTo ? formatDateVN(new Date(item.dateIssuedTo)) : ""}
          </div>
        ),
        className: "text-center",
      },
      {
        header: "Số đến",
        accessor: (item) => (
          <div className="text-center">{item.numberArrival || ""}</div>
        ),
        className: "text-center",
      },
      {
        header: "Cơ quan ban hành",
        accessor: (item) => (
          <div className="text-center">{item.placeSend || ""}</div>
        ),
        className: "text-center",
      },
      {
        header: "Số ký hiệu",
        accessor: (item) => (
          <div className="text-center">{item.numberArrivalStr || ""}</div>
        ),
        className: "text-center",
        sortKey: SearchTitles.NUMBERSIGN,
      },
      {
        header: "Ngày văn bản",
        accessor: (item) => (
          <div className="text-center">
            {item.dateArrivalTo
              ? formatDateVN(new Date(item.dateArrivalTo))
              : ""}
          </div>
        ),
        className: "text-center",
      },
      {
        header: "Trích yếu",
        accessor: (item) => (
          <div className="text-left min-w-[250px]" title={item.preview || ""}>
            {transformText(item.preview, 120)}
          </div>
        ),
        className: "text-left w-[30%]",
        sortKey: SearchTitles.PREVIEW,
      },
      {
        header: "Xử lý chính",
        accessor: (item) => (
          <div className="text-center">{item.mainList || ""}</div>
        ),
        className: "text-center",
      },
      {
        header: "Phối hợp",
        accessor: (item) => {
          const supportList = item.supportList || "";
          const displayText =
            supportList.split(",").length >= 17
              ? "Lãnh đạo Ban và Các cơ quan, đơn vị thuộc Ban"
              : supportList;
          return <div className="text-center">{displayText}</div>;
        },
        className: "text-center",
      },
      {
        header: "Đơn vị nhận bản lưu",
        accessor: (item) => (
          <div className="text-center">{item.orgName || ""}</div>
        ),
        className: "text-center",
        sortKey: SearchTitles.ORG,
      },
      {
        header: "Hạn xử lý",
        accessor: (item) => (
          <div className="text-center">
            {item.currentDeadline
              ? formatDateVN(new Date(item.currentDeadline))
              : "Vô thời hạn"}
          </div>
        ),
        className: "text-center w-[10%]",
        sortKey: SearchTitles.DEADLINE,
      },
      {
        header: "Trạng thái",
        accessor: (item) => (
          <div className="text-center">{item.docStatusName || ""}</div>
        ),
        className: "text-center",
        sortKey: SearchTitles.STATUS,
      },
    ],
    []
  );

  return (
    <div className="space-y-4 p-3">
      <BreadcrumbNavigation
        items={[]}
        currentPage="Theo dõi văn bản đến"
        showHome={false}
      />

      {/* Search Form */}
      <div className="card border rounded-lg shadow-sm">
        <div className="card-header p-4 border-b">
          <span className="font-weight-bold text-info m-0">
            Tìm kiếm văn bản
          </span>
        </div>
        <div className="card-body p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Số/Ký hiệu */}
            <div className="form-group">
              <label className="block text-sm font-bold mb-2">Số/Ký hiệu</label>
              <Input
                type="text"
                value={searchFields.numberOrSign}
                onChange={(e) =>
                  setSearchFields((prev) => ({
                    ...prev,
                    numberOrSign: e.target.value,
                  }))
                }
                onKeyPress={handleKeyPress}
                className="w-full"
              />
            </div>

            {/* Trích yếu */}
            <div className="form-group">
              <label className="block text-sm font-bold mb-2">Trích yếu</label>
              <Input
                type="text"
                value={searchFields.preview}
                onChange={(e) =>
                  setSearchFields((prev) => ({
                    ...prev,
                    preview: e.target.value,
                  }))
                }
                onKeyPress={handleKeyPress}
                className="w-full"
              />
            </div>

            {/* Nơi gửi */}
            <div className="form-group">
              <label className="block text-sm font-bold mb-2">Nơi gửi</label>
              <Input
                type="text"
                value={searchFields.orgIssuedName}
                onChange={(e) => {
                  setSearchFields((prev) => ({
                    ...prev,
                    orgIssuedName: e.target.value,
                  }));
                }}
                onKeyPress={handleKeyPress}
                className="w-full"
                list="placeSendOptions"
              />
              <datalist id="placeSendOptions">
                {filterPlaceSendOptions(searchFields.orgIssuedName).map(
                  (option, idx) => (
                    <option key={idx} value={option} />
                  )
                )}
              </datalist>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Độ mật */}
            <div className="form-group">
              <label className="block text-sm font-bold mb-2">Độ mật</label>
              <SelectCustom
                key={`security-${resetKey}`}
                options={securityCategory.map((item) => ({
                  label: item.name,
                  value: String(item.id),
                }))}
                value={searchFields.securityId || undefined}
                onChange={(value) =>
                  setSearchFields((prev) => ({
                    ...prev,
                    securityId: String(value),
                  }))
                }
                placeholder="--- Chọn ---"
                className="w-full"
              />
            </div>

            {/* Ngày văn bản, từ ngày */}
            <div className="form-group">
              <label className="block text-sm font-bold mb-2">
                Ngày văn bản, từ ngày
              </label>
              <CustomDatePicker
                key={`startArrival-${resetKey}`}
                selected={ngbDateToDate(searchFields.startArrival)}
                onChange={(date) =>
                  setSearchFields((prev) => ({
                    ...prev,
                    startArrival: dateToNgbDate(date),
                  }))
                }
                placeholder="dd/mm/yyyy"
                disabledFuture={true}
              />
            </div>

            {/* Ngày văn bản, đến ngày */}
            <div className="form-group">
              <label className="block text-sm font-bold mb-2">đến ngày</label>
              <CustomDatePicker
                key={`endArrival-${resetKey}`}
                selected={ngbDateToDate(searchFields.endArrival)}
                onChange={(date) =>
                  setSearchFields((prev) => ({
                    ...prev,
                    endArrival: dateToNgbDate(date),
                  }))
                }
                placeholder="dd/mm/yyyy"
                disabledFuture={true}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Trạng thái */}
            <div className="form-group">
              <label className="block text-sm font-bold mb-2">Trạng thái</label>
              <SelectCustom
                key={`status-${resetKey}`}
                options={docStatusCategory.map((item) => ({
                  label: item.value,
                  value: item.key,
                }))}
                value={searchFields.docStatusId || undefined}
                onChange={(value) =>
                  setSearchFields((prev) => ({
                    ...prev,
                    docStatusId: value ? String(value) : null,
                  }))
                }
                placeholder="--- Chọn ---"
                className="w-full"
              />
            </div>

            {/* Ngày vào sổ, từ ngày */}
            <div className="form-group">
              <label className="block text-sm font-bold mb-2">
                Ngày vào sổ, từ ngày
              </label>
              <CustomDatePicker
                key={`startIssued-${resetKey}`}
                selected={ngbDateToDate(searchFields.startIssued)}
                onChange={(date) =>
                  setSearchFields((prev) => ({
                    ...prev,
                    startIssued: dateToNgbDate(date),
                  }))
                }
                placeholder="dd/mm/yyyy"
                disabledFuture={true}
              />
            </div>

            {/* Ngày vào sổ, đến ngày */}
            <div className="form-group">
              <label className="block text-sm font-bold mb-2">đến ngày</label>
              <CustomDatePicker
                key={`endIssued-${resetKey}`}
                selected={ngbDateToDate(searchFields.endIssued)}
                onChange={(date) =>
                  setSearchFields((prev) => ({
                    ...prev,
                    endIssued: dateToNgbDate(date),
                  }))
                }
                placeholder="dd/mm/yyyy"
                disabledFuture={true}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Số đến */}
            <div className="form-group">
              <label className="block text-sm font-bold mb-2">Số đến</label>
              <Input
                type="text"
                value={searchFields.numberArrival}
                onChange={(e) =>
                  setSearchFields((prev) => ({
                    ...prev,
                    numberArrival: e.target.value,
                  }))
                }
                onKeyPress={handleKeyPress}
                className="w-full"
              />
            </div>

            {/* Ngày nhận văn bản, từ ngày */}
            <div className="form-group">
              <label className="block text-sm font-bold mb-2">
                Ngày nhận văn bản, từ ngày
              </label>
              <CustomDatePicker
                key={`startReceived-${resetKey}`}
                selected={ngbDateToDate(searchFields.startReceived)}
                onChange={(date) =>
                  setSearchFields((prev) => ({
                    ...prev,
                    startReceived: dateToNgbDate(date),
                  }))
                }
                placeholder="dd/mm/yyyy"
                disabledFuture={true}
              />
            </div>

            {/* Ngày nhận văn bản, đến ngày */}
            <div className="form-group">
              <label className="block text-sm font-bold mb-2">đến ngày</label>
              <CustomDatePicker
                key={`endReceived-${resetKey}`}
                selected={ngbDateToDate(searchFields.endReceived)}
                onChange={(date) =>
                  setSearchFields((prev) => ({
                    ...prev,
                    endReceived: dateToNgbDate(date),
                  }))
                }
                placeholder="dd/mm/yyyy"
                disabledFuture={true}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Độ khẩn */}
            <div className="form-group">
              <label className="block text-sm font-bold mb-2">Độ khẩn</label>
              <SelectCustom
                key={`urgent-${resetKey}`}
                options={urgentCategory.map((item) => ({
                  label: item.name,
                  value: String(item.id),
                }))}
                value={searchFields.urgentId || undefined}
                onChange={(value) =>
                  setSearchFields((prev) => ({
                    ...prev,
                    urgentId: String(value),
                  }))
                }
                placeholder="--- Chọn ---"
                className="w-full"
              />
            </div>

            {/* Sổ văn bản */}
            <div className="form-group">
              <label className="block text-sm font-bold mb-2">Sổ văn bản</label>
              <SelectCustom
                key={`book-${resetKey}`}
                options={bookCategory.map((item) => ({
                  label: item.name,
                  value: String(item.id),
                }))}
                value={searchFields.bookId || undefined}
                onChange={(value) =>
                  setSearchFields((prev) => ({
                    ...prev,
                    bookId: String(value),
                  }))
                }
                placeholder="--- Chọn ---"
                className="w-full"
              />
            </div>

            {/* Hạn văn bản */}
            <div className="form-group">
              <label className="block text-sm font-bold mb-2">
                Hạn văn bản
              </label>
              <SelectCustom
                key={`expired-${resetKey}`}
                options={[
                  { label: "Văn bản còn hạn", value: "false" },
                  { label: "Văn bản hết hạn", value: "true" },
                ]}
                value={searchFields.expired || undefined}
                onChange={(value) =>
                  setSearchFields((prev) => ({
                    ...prev,
                    expired: String(value),
                  }))
                }
                placeholder="-- Chọn --"
                className="w-full"
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-center gap-2 mt-4">
            <Button
              size="sm"
              onClick={handleSearchSubmit}
              className="h-9 px-3 text-xs bg-blue-600 hover:bg-blue-700 inline-flex items-center justify-center"
            >
              <Search className="w-3 h-3 mr-1" />
              <span className="leading-none">Tìm kiếm</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSearchReset}
              className="h-9 px-3 text-xs inline-flex items-center justify-center"
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              <span className="leading-none">Đặt lại</span>
            </Button>
            <Button
              size="sm"
              onClick={exportExcel}
              variant="outline"
              className="h-9 px-3 text-xs inline-flex items-center justify-center"
            >
              <FileSpreadsheet className="w-3 h-3 mr-1" />
              <span className="leading-none">Xuất file Excel</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="mt-1">
        <Table
          columns={columns}
          dataSource={documentList}
          loading={loading}
          currentPage={currentPage}
          onPageChange={handlePageChange}
          totalItems={totalItems}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={handleItemsPerPageChange}
          showPagination={true}
          showPageSize={true}
          pageSizeOptions={Constant.PAGE_SIZE_OPTION.map((opt) => opt.value)}
          emptyText="Không tồn tại văn bản"
          onRowClick={(item) => goToDetailPage(item.id)}
          sortable={true}
          onSort={handleSort}
        />
      </div>
    </div>
  );
}
