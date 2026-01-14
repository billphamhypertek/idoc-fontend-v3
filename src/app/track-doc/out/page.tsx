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
import { generateExcelDocumentOut } from "@/services/export.service";
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
}

interface SearchFields {
  doctype: string;
  docTypeId: string;
  docFieldsId: string;
  status: string | null;
  bookId: string;
  urgentId: string;
  securityId: string;
  numberOrSign: string;
  createToNgb: { year: number; month: number; day: number } | null;
  createTo: string;
  createFromNgb: { year: number; month: number; day: number } | null;
  createFrom: string;
  orgIssuedId: string;
  preview: string;
  page: number;
  sortBy: string;
  isAdvanceSearch: boolean;
  direction: string;
  pageSize: number;
}

interface DocumentOutItem {
  id: number;
  numberOrSign: string | null; // Số/Ký hiệu
  dateIssuedTo: string | null; // Ngày văn bản
  preview: string | null; // Trích yếu
  orgName: string | null; // Đơn vị ban hành
  signerName: string | null; // Người ký
  listReceive: Array<{
    type: string;
    orgName: string;
    orgId?: number;
    parentOrgId?: number;
    numberOfSubOrgOfParentOrg?: number;
  }> | null; // Nơi nhận
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

interface OrgItem {
  id: number;
  name: string;
}

const defaultSearchFields: SearchFields = {
  doctype: "",
  docTypeId: "",
  docFieldsId: "",
  status: null,
  bookId: "",
  urgentId: "",
  securityId: "",
  numberOrSign: "",
  createToNgb: null,
  createTo: "",
  createFromNgb: null,
  createFrom: "",
  orgIssuedId: "",
  preview: "",
  page: 1,
  sortBy: "",
  isAdvanceSearch: false,
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

export default function TrackDocOutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State
  const [searchFields, setSearchFields] =
    useState<SearchFields>(defaultSearchFields);
  const [documentList, setDocumentList] = useState<DocumentOutItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(
    Constant.PAGING.SIZE
  );
  const [totalItems, setTotalItems] = useState<number>(0);
  const [resetKey, setResetKey] = useState<number>(0); // Key to force re-render on reset

  // Categories
  const [urgentCategory, setUrgentCategory] = useState<Category[]>([]);
  const [securityCategory, setSecurityCategory] = useState<Category[]>([]);
  const [docFieldCategory, setDocFieldCategory] = useState<Category[]>([]);
  const [docTypeCategory, setDocTypeCategory] = useState<Category[]>([]);
  const [bookCategory, setBookCategory] = useState<DocumentBook[]>([]);
  const [docStatusCategory, setDocStatusCategory] = useState<any[]>([]);
  const [orgList, setOrgList] = useState<OrgItem[]>([]);

  // Load categories on mount
  useEffect(() => {
    loadUrgentCategory();
    loadSecurityCategory();
    loadDocFieldCategory();
    loadDocTypeCategory();
    loadDocumentBook();
    loadDocStatusCategory();
    loadListOrgEnter();
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
        doLoadDocumentOut(1);
      }
    } else {
      doLoadDocumentOut(1);
    }
  }, []);

  // Load document list
  const doLoadDocumentOut = async (page: number) => {
    setLoading(true);
    try {
      const params = {
        ...searchFields,
        page: page,
        pageSize: itemsPerPage,
      };
      const data = await TrackDocService.trackDocumentOutList(
        page.toString(),
        params
      );
      const documents = data?.content || [];
      checkListReceive(documents);
      setDocumentList(documents);
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
      createFrom: getDateCalendar(searchFields.createFromNgb),
      createTo: getDateCalendar(searchFields.createToNgb),
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
      if (fieldsToSave.createFromNgb) {
        params.createFrom = getDateCalendar(fieldsToSave.createFromNgb);
      }
      if (fieldsToSave.createToNgb) {
        params.createTo = getDateCalendar(fieldsToSave.createToNgb);
      }

      // Handle null status
      if (params.status === "null") {
        params.status = null;
      }

      const data = await TrackDocService.trackDocumentOutList(
        pageNumber.toString(),
        params
      );
      const documents = data?.content || [];
      checkListReceive(documents);
      setDocumentList(documents);
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

  const loadDocFieldCategory = async () => {
    try {
      const data = await DocumentOutService.getCategoryWithCode(
        Constant.CATEGORYTYPE_CODE.DOC_FIELDS
      );
      setDocFieldCategory(data || []);
    } catch (error) {
      console.error("Error loading doc field category:", error);
    }
  };

  const loadDocTypeCategory = async () => {
    try {
      const data = await DocumentOutService.getCategoryWithCode(
        Constant.CATEGORYTYPE_CODE.DOC_TYPE
      );
      setDocTypeCategory(data || []);
    } catch (error) {
      console.error("Error loading doc type category:", error);
    }
  };

  const loadDocumentBook = async () => {
    try {
      // Use getDocumentBookByTypeFlowing like v1 - code 1 for văn bản đi
      const data = await DocumentBookService.getDocumentBookByTypeFlowing(1);
      setBookCategory(data || []);
    } catch (error) {
      console.error("Error loading document book:", error);
      setBookCategory([]);
    }
  };

  const loadDocStatusCategory = () => {
    const docType = Constant.DOCUMENT_TYPE.find((doc) => doc.code === 1);
    if (docType) {
      setDocStatusCategory(docType.documentStatus || []);
    }
  };

  const loadListOrgEnter = async () => {
    try {
      const data = await DocumentOutService.getListOrgEnter();
      setOrgList(data || []);
    } catch (error) {
      console.error("Error loading org list:", error);
    }
  };

  // Check list receive - logic from v1
  const checkListReceive = (documents: any[]) => {
    if (!documents) {
      return;
    }
    documents.forEach((document) => {
      // Count number of sub-org of 'Ban cơ yếu Chính phủ' that has id is 2,
      // NOTE: Ignore 'Cơ quan và đơn vị ngoài Ban Cơ yếu Chính phủ' that has id is 451
      const numberOfSubOrg = (document["listReceive"] || []).filter(
        (item: any) =>
          item.type === "ORG" && item.parentOrgId === 2 && item.orgId !== 451
      ).length;
      const filteredListReceive: any[] = [];
      let isAddedShortName = false;
      (document["listReceive"] || []).forEach((item: any) => {
        if (
          item["parentOrgId"] === 2 &&
          item["numberOfSubOrgOfParentOrg"] - 1 === numberOfSubOrg &&
          item["orgId"] !== 451
        ) {
          if (!isAddedShortName) {
            isAddedShortName = true;
            filteredListReceive.push({
              type: "ORG",
              orgName: "Các cơ quan, đơn vị thuộc Ban",
            });
          }
        } else {
          filteredListReceive.push(item);
        }
      });
      document["listReceive"] = filteredListReceive;
    });
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
      // Get số đi - lấy phần đầu của numberOrSign.split('/')
      const numberOrSign = element.numberOrSign || "";
      const numberDi = numberOrSign ? numberOrSign.split("/")?.[0] || "" : "";

      excelJson.push([
        index + 1,
        numberDi,
        numberOrSign,
        formatDateForExcel(element.dateIssuedTo),
        element.preview || "",
        element.orgName || "",
        element.signerName || "",
        element.listReceive ? getListNameReceive(element.listReceive) : "",
      ]);
    });

    return excelJson;
  };

  // Get start date for Excel filename
  const getStartDateExcel = (): string | null => {
    if (searchFields.createFromNgb) {
      return getDateCalendar(searchFields.createFromNgb);
    }
    return null;
  };

  // Get end date for Excel filename
  const getEndDateExcel = (): string | null => {
    if (searchFields.createFromNgb && searchFields.createToNgb) {
      return getDateCalendar(searchFields.createToNgb);
    }
    return null;
  };

  // Export Excel
  const exportExcel = async () => {
    try {
      const params: any = {};

      if (searchFields.isAdvanceSearch) {
        // Build params for advance search
        params.createFrom = searchFields.createFromNgb
          ? getDateCalendar(searchFields.createFromNgb)
          : "";
        params.createTo = searchFields.createToNgb
          ? getDateCalendar(searchFields.createToNgb)
          : "";
        params.numberOrSign = searchFields.numberOrSign || "";
        params.preview = searchFields.preview || "";
        params.docTypeId = searchFields.docTypeId || "";
        params.docFieldsId = searchFields.docFieldsId || "";
        params.orgIssuedId = searchFields.orgIssuedId || "";
        params.status = searchFields.status || "";
        params.bookId = searchFields.bookId || "";
        params.urgentId = searchFields.urgentId || "";
        params.securityId = searchFields.securityId || "";
        params.sortBy = searchFields.sortBy;
      } else {
        params.sortBy = searchFields.sortBy;
        params.direction = searchFields.direction;
      }

      const queryString = new URLSearchParams(
        Object.entries(params).reduce(
          (acc, [key, value]) => {
            if (value !== "" && value !== null && value !== undefined) {
              acc[key] = String(value);
            }
            return acc;
          },
          {} as Record<string, string>
        )
      ).toString();

      // Get JSON data from API (not Blob)
      const data =
        await DocumentOutService.exportExcelOutDocumentFlowing(queryString);

      // Format data for Excel
      const excelJson = formatDataForExcel(data || []);

      // Generate Excel file client-side
      const header = [
        "STT",
        "Số đi",
        "Số/Ký hiệu",
        "Ngày văn bản",
        "Trích yếu",
        "Đơn vị ban hành",
        "Người ký",
        "Nơi nhận",
      ];

      const startDate = getStartDateExcel();
      const endDate = getEndDateExcel();

      await generateExcelDocumentOut(
        "SỔ IN BÁO CÁO VĂN BẢN ĐI",
        header,
        excelJson,
        "THONG_KE_VB_DI",
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
    router.push(`/track-doc/out/detail/${id}?isTrackDocumentList=true`);
  };

  // Handle search submit
  const handleSearchSubmit = () => {
    doAdvanceSearch(1);
  };

  // Handle search reset
  const handleSearchReset = async () => {
    // Create a new object from defaultSearchFields to ensure React re-renders
    const resetFields: SearchFields = {
      doctype: "",
      docTypeId: "",
      docFieldsId: "",
      status: null,
      bookId: "",
      urgentId: "",
      securityId: "",
      numberOrSign: "",
      createToNgb: null,
      createTo: "",
      createFromNgb: null,
      createFrom: "",
      orgIssuedId: "",
      preview: "",
      page: 1,
      sortBy: "",
      isAdvanceSearch: false,
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
      const data = await TrackDocService.trackDocumentOutList("1", params);
      const documents = data?.content || [];
      checkListReceive(documents);
      setDocumentList(documents);
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
  const columns: Column<DocumentOutItem>[] = useMemo(
    () => [
      {
        header: "STT",
        accessor: (_item, index) => index + 1,
        className: "w-12 text-center",
      },
      {
        header: "Số đi",
        accessor: (item) => {
          const numberOrSign = item.numberOrSign || "";
          const parts = numberOrSign.split("/");
          return <div className="text-center">{parts[0] || ""}</div>;
        },
        className: "text-center",
      },
      {
        header: "Số/Ký hiệu",
        accessor: (item) => (
          <div className="text-center">{item.numberOrSign || ""}</div>
        ),
        className: "text-center",
        sortKey: SearchTitles.NUMBERSIGN,
      },
      {
        header: "Ngày văn bản",
        accessor: (item) => (
          <div className="text-center">
            {item.dateIssuedTo ? formatDateVN(new Date(item.dateIssuedTo)) : ""}
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
        header: "Đơn vị ban hành",
        accessor: (item) => (
          <div className="text-center">{item.orgName || ""}</div>
        ),
        className: "text-center",
        sortKey: SearchTitles.ORG,
      },
      {
        header: "Người ký",
        accessor: (item) => (
          <div className="text-center">{item.signerName || ""}</div>
        ),
        className: "text-center",
      },
      {
        header: "Nơi nhận",
        accessor: (item) => {
          const listReceive = item.listReceive || [];
          return (
            <div className="text-center">
              {listReceive.map((receive, idx) => (
                <span key={idx} className="d-inline-block my-1">
                  <span className="inline-flex items-center gap-1">
                    <span className="text-red-500">
                      <i className="fas fa-university mr-2"></i>
                    </span>
                    {receive.orgName}
                    {receive.type === "ORG" ? (
                      <i className="fas fa-building ml-1"></i>
                    ) : (
                      <i className="fa fa-users ml-1"></i>
                    )}
                  </span>
                </span>
              ))}
            </div>
          );
        },
        className: "text-center",
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
        currentPage="Theo dõi văn bản đi"
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

            {/* Loại văn bản */}
            <div className="form-group">
              <label className="block text-sm font-bold mb-2">
                Loại văn bản
              </label>
              <SelectCustom
                key={`docType-${resetKey}`}
                options={docTypeCategory.map((item) => ({
                  label: item.name,
                  value: String(item.id),
                }))}
                value={searchFields.docTypeId || undefined}
                onChange={(value) =>
                  setSearchFields((prev) => ({
                    ...prev,
                    docTypeId: String(value),
                  }))
                }
                placeholder="--- Chọn ---"
                className="w-full"
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

            {/* Trạng thái */}
            <div className="form-group">
              <label className="block text-sm font-bold mb-2">Trạng thái</label>
              <SelectCustom
                key={`status-${resetKey}`}
                options={docStatusCategory.map((item) => ({
                  label: item.value,
                  value: item.key,
                }))}
                value={searchFields.status || undefined}
                onChange={(value) =>
                  setSearchFields((prev) => ({
                    ...prev,
                    status: value ? String(value) : null,
                  }))
                }
                placeholder="--- Chọn ---"
                className="w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Đơn vị ban hành */}
            <div className="form-group">
              <label className="block text-sm font-bold mb-2">
                Đơn vị ban hành
              </label>
              <SelectCustom
                key={`org-${resetKey}`}
                options={orgList.map((item) => ({
                  label: item.name,
                  value: String(item.id),
                }))}
                value={searchFields.orgIssuedId || undefined}
                onChange={(value) =>
                  setSearchFields((prev) => ({
                    ...prev,
                    orgIssuedId: String(value),
                  }))
                }
                placeholder="--- Chọn ---"
                className="w-full"
              />
            </div>

            {/* Ngày tạo, từ ngày */}
            <div className="form-group">
              <label className="block text-sm font-bold mb-2">
                Ngày tạo, từ ngày
              </label>
              <CustomDatePicker
                key={`createFrom-${resetKey}`}
                selected={ngbDateToDate(searchFields.createFromNgb)}
                onChange={(date) =>
                  setSearchFields((prev) => ({
                    ...prev,
                    createFromNgb: dateToNgbDate(date),
                  }))
                }
                placeholder="dd/mm/yyyy"
                disabledFuture={true}
              />
            </div>

            {/* Ngày tạo, đến ngày */}
            <div className="form-group">
              <label className="block text-sm font-bold mb-2">đến ngày</label>
              <CustomDatePicker
                key={`createTo-${resetKey}`}
                selected={ngbDateToDate(searchFields.createToNgb)}
                onChange={(date) =>
                  setSearchFields((prev) => ({
                    ...prev,
                    createToNgb: dateToNgbDate(date),
                  }))
                }
                placeholder="dd/mm/yyyy"
                disabledFuture={true}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
