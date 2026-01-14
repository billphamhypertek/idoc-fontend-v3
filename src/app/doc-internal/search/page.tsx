"use client";

import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import SelectCustom from "@/components/common/SelectCustom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table } from "@/components/ui/table";
import { Constant } from "@/definitions/constants/constant";
import { useGetAllDocInternal } from "@/hooks/data/doc-internal.data";
import { cn } from "@/lib/utils";
import { SharedService } from "@/services/shared.service";
import { getUserInfo } from "@/utils/token.utils";
import { ChevronDown, ChevronUp, RotateCcw, Search } from "lucide-react";
import { CustomDatePicker } from "@/components/ui/calendar";
import { formatDateYMD, parseDateStringYMD } from "@/utils/datetime.utils";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

enum SearchTitles {
  PREVIEW = "PREVIEW",
  NUMBER_OR_SIGN = "NUMBERSIGN",
  DATE_APPROVE = "DATE_APPROVE",
  DATE_CREATE = "CREATEDATE",
  USER_ENTER = "USER_ENTER",
}

interface SearchField {
  currentTab: string;
  numberOrSign: string;
  preview: string;
  createDateFrom: string;
  createDateTo: string;
  approveDateFrom: string;
  approveDateTo: string;
  docStatus: string;
  page: number;
  sortBy: string;
  direction: string;
  pageSize: number;
}

const docInStatusList = [
  { name: "Dự thảo", value: "NB_DU_THAO" },
  { name: "Thu Hồi", value: "NB_THU_HOI" },
  { name: "Đang cho ý kiến", value: "NB_CHO_DUYET" },
  { name: "Đã cho ý kiến", value: "NB_BAN_HANH" },
  { name: "Chờ xử lí", value: "NB_LANH_DAO_KY" },
  { name: "Hoàn thành văn bản", value: "NB_HOAN_THANH" },
];

export default function SearchPage() {
  const router = useRouter();
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const [searchField, setSearchField] = useState<SearchField>({
    currentTab: String(Constant.DOC_INTERNAL_TAB_INDEX.SEARCH),
    numberOrSign: "",
    preview: "",
    createDateFrom: "",
    createDateTo: "",
    approveDateFrom: "",
    approveDateTo: "",
    docStatus: "",
    page: 1,
    sortBy: "",
    direction: Constant.SORT_TYPE.DECREASE,
    pageSize: Constant.PAGING.SIZE,
  });

  const [tempSearchParams, setTempSearchParams] = useState({
    numberOrSign: "",
    preview: "",
    createDateFrom: "",
    createDateTo: "",
    approveDateFrom: "",
    approveDateTo: "",
    docStatus: "",
  });

  const hasInitialized = useRef(false);

  const { data, isLoading } = useGetAllDocInternal({
    tab: searchField.currentTab,
    text: "",
    numberOrSign: searchField.numberOrSign,
    preview: searchField.preview,
    createFrom: searchField.createDateFrom,
    createTo: searchField.createDateTo,
    approveFrom: searchField.approveDateFrom,
    approveTo: searchField.approveDateTo,
    status: searchField.docStatus,
    page: searchField.page,
    sortBy: searchField.sortBy,
    direction: searchField.direction,
    size: searchField.pageSize,
  });
  useEffect(() => {
    SharedService.setCurrentMenuDocInternal("");
  }, []);

  useEffect(() => {
    const userInfo = getUserInfo();
    if (userInfo) {
      const parsed = JSON.parse(userInfo);
      setCurrentUserId(parsed.id);
    }
  }, []);

  // Sync tempSearchParams with searchField on mount
  useEffect(() => {
    if (!hasInitialized.current) {
      setTempSearchParams({
        numberOrSign: searchField.numberOrSign,
        preview: searchField.preview,
        createDateFrom: searchField.createDateFrom,
        createDateTo: searchField.createDateTo,
        approveDateFrom: searchField.approveDateFrom,
        approveDateTo: searchField.approveDateTo,
        docStatus: searchField.docStatus,
      });
      hasInitialized.current = true;
    }
  }, [
    searchField.numberOrSign,
    searchField.preview,
    searchField.createDateFrom,
    searchField.createDateTo,
    searchField.approveDateFrom,
    searchField.approveDateTo,
    searchField.docStatus,
  ]);

  const doSearch = (page: number, sortField = "") => {
    const newPage = page || searchField.page;

    if (sortField) {
      setSearchField((prev) => ({
        ...prev,
        page: newPage,
        sortBy: sortField,
        direction:
          prev.sortBy === sortField &&
          prev.direction === Constant.SORT_TYPE.DECREASE
            ? Constant.SORT_TYPE.INCREASE
            : Constant.SORT_TYPE.DECREASE,
      }));
    } else {
      setSearchField((prev) => ({
        ...prev,
        page: newPage,
      }));
    }
  };

  const sortByField = (fieldName: string) => {
    doSearch(searchField.page, fieldName);
  };

  const handleSearchSubmit = () => {
    setSearchField((prev) => ({
      ...prev,
      numberOrSign: tempSearchParams.numberOrSign,
      preview: tempSearchParams.preview,
      createDateFrom: tempSearchParams.createDateFrom,
      createDateTo: tempSearchParams.createDateTo,
      approveDateFrom: tempSearchParams.approveDateFrom,
      approveDateTo: tempSearchParams.approveDateTo,
      docStatus: tempSearchParams.docStatus,
      page: 1,
    }));
  };

  const handleSearchReset = () => {
    setTempSearchParams({
      numberOrSign: "",
      preview: "",
      createDateFrom: "",
      createDateTo: "",
      approveDateFrom: "",
      approveDateTo: "",
      docStatus: "",
    });
    setSearchField((prev) => ({
      ...prev,
      numberOrSign: "",
      preview: "",
      createDateFrom: "",
      createDateTo: "",
      approveDateFrom: "",
      approveDateTo: "",
      docStatus: "",
      page: 1,
    }));
  };

  const gotoDetailPage = (doc: any) => {
    SharedService.setCurrentMenuDocInternal(searchField.currentTab);
    router.push(`/doc-internal/search/detail/${doc.id}`);
  };

  const getLabelStatus = (status: string) => {
    switch (status) {
      case "NB_DU_THAO":
        return "bg-blue-600 text-white";
      case "NB_CHO_DUYET":
        return "bg-yellow-500 text-white";
      case "NB_TRA_LAI":
        return "bg-red-500 text-white";
      case "NB_LANH_DAO_KY":
        return "bg-yellow-500 text-white";
      case "NB_BAN_HANH":
        return "bg-green-500 text-white";
      case "NB_THU_HOI":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const SortHeader = (label: string, sortKey?: string) => (
    <div
      className="flex items-center justify-center gap-1 cursor-pointer"
      onClick={() => sortKey && sortByField(sortKey)}
    >
      {label}
      {sortKey &&
        searchField.sortBy === sortKey &&
        (searchField.direction === Constant.SORT_TYPE.INCREASE ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        ))}
    </div>
  );

  const columns = [
    {
      header: "STT",
      accessor: (_: any, index: number) => (
        <span>
          {(searchField.page - 1) * searchField.pageSize + (index + 1)}
        </span>
      ),
      className: "text-center w-20",
    },
    {
      header: SortHeader("Trích yếu", SearchTitles.PREVIEW),
      accessor: (record: any) => (
        <a
          className="cursor-pointer hover:text-blue-600 hover:underline transition-all"
          onClick={() => gotoDetailPage(record)}
        >
          {record.preview}
        </a>
      ),
      className: "text-left w-80",
    },
    {
      header: SortHeader("Người tạo", SearchTitles.USER_ENTER),
      accessor: (record: any) => (
        <a
          className="cursor-pointer hover:text-blue-600 hover:underline transition-all"
          onClick={() => gotoDetailPage(record)}
        >
          {record.userCreateName}
        </a>
      ),
      className: "text-left w-40",
    },
    {
      header: SortHeader("Ngày văn bản", SearchTitles.DATE_CREATE),
      accessor: (record: any) => (
        <a
          className="cursor-pointer hover:text-blue-600 hover:underline transition-all"
          onClick={() => gotoDetailPage(record)}
        >
          {record.createDate
            ? new Date(record.createDate).toLocaleDateString("vi-VN")
            : ""}
        </a>
      ),
      className: "text-center w-32",
    },
    {
      header: SortHeader("Ngày cho ý kiến", SearchTitles.DATE_APPROVE),
      accessor: (record: any) => (
        <a
          className="cursor-pointer hover:text-blue-600 hover:underline transition-all"
          onClick={() => gotoDetailPage(record)}
        >
          {record.approveDate
            ? new Date(record.approveDate).toLocaleDateString("vi-VN")
            : ""}
        </a>
      ),
      className: "text-center w-32",
    },
    {
      header: SortHeader("Số văn bản", SearchTitles.NUMBER_OR_SIGN),
      accessor: (record: any) => (
        <a
          className="cursor-pointer hover:text-blue-600 hover:underline transition-all"
          onClick={() => gotoDetailPage(record)}
        >
          {record.numberOrSign || ""}
        </a>
      ),
      className: "text-center w-32",
    },
    {
      header: "Trạng thái",
      accessor: (record: any) => (
        <div className="flex justify-center">
          <span
            className={cn(
              "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer hover:opacity-80 transition-opacity",
              getLabelStatus(record.docStatus)
            )}
            onClick={() => gotoDetailPage(record)}
          >
            {record.docStatusName}
          </span>
        </div>
      ),
      className: "text-center w-32",
      noRowClick: true,
    },
  ];

  return (
    <div className="px-4 space-y-4">
      <div className="flex items-center justify-between gap-4 mb-4">
        <BreadcrumbNavigation
          items={[
            {
              label: "Văn bản nội bộ",
            },
          ]}
          currentPage="Tra cứu văn bản nội bộ"
          showHome={false}
        />
      </div>

      {/* Title Section */}
      <div
        className="border rounded-lg p-4 mb-4"
        style={{ backgroundColor: "#E8E9EB" }}
      >
        <h2 className="text-lg font-semibold">Tra cứu văn bản nội bộ</h2>
      </div>

      {/* Advanced Search Form */}
      <div className="bg-white rounded-lg shadow-sm border p-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearchSubmit();
          }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Số văn bản */}
            <div className="flex flex-row items-center gap-2">
              <label className="text-sm font-bold whitespace-nowrap text-right w-[140px] flex-shrink-0">
                Số văn bản:
              </label>
              <Input
                type="text"
                placeholder="Số văn bản"
                className="flex-1 focus:outline-none focus-visible:ring-gray-300 focus-visible:ring-opacity-50"
                maxLength={50}
                value={tempSearchParams.numberOrSign}
                onChange={(e) =>
                  setTempSearchParams((prev) => ({
                    ...prev,
                    numberOrSign: e.target.value,
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearchSubmit();
                  }
                }}
              />
            </div>

            {/* Ngày tạo từ */}
            <div className="flex flex-row items-center gap-2">
              <label className="text-sm font-bold text-right w-[140px] flex-shrink-0">
                Ngày tạo,
                <br />
                từ ngày:
              </label>
              <div className="flex-1 min-w-0">
                <CustomDatePicker
                  selected={parseDateStringYMD(tempSearchParams.createDateFrom)}
                  onChange={(date) =>
                    setTempSearchParams((prev) => ({
                      ...prev,
                      createDateFrom: formatDateYMD(date),
                    }))
                  }
                  placeholder="dd/mm/yyyy"
                  className="w-full"
                />
              </div>
            </div>

            {/* Ngày tạo đến */}
            <div className="flex flex-row items-center gap-2">
              <label className="text-sm font-bold whitespace-nowrap text-right w-[140px] flex-shrink-0">
                Đến ngày:
              </label>
              <div className="flex-1 min-w-0">
                <CustomDatePicker
                  selected={parseDateStringYMD(tempSearchParams.createDateTo)}
                  onChange={(date) =>
                    setTempSearchParams((prev) => ({
                      ...prev,
                      createDateTo: formatDateYMD(date),
                    }))
                  }
                  placeholder="dd/mm/yyyy"
                  className="w-full"
                />
              </div>
            </div>

            {/* Trích yếu */}
            <div className="flex flex-row items-center gap-2">
              <label className="text-sm font-bold whitespace-nowrap text-right w-[140px] flex-shrink-0">
                Trích yếu:
              </label>
              <Input
                type="text"
                placeholder="Trích yếu"
                maxLength={50}
                className="flex-1 focus:outline-none focus-visible:ring-gray-300 focus-visible:ring-opacity-50"
                value={tempSearchParams.preview}
                onChange={(e) =>
                  setTempSearchParams((prev) => ({
                    ...prev,
                    preview: e.target.value,
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearchSubmit();
                  }
                }}
              />
            </div>

            {/* Ngày cho ý kiến từ */}
            <div className="flex flex-row items-center gap-2">
              <label className="text-sm font-bold text-right w-[140px] flex-shrink-0">
                Ngày cho ý kiến,
                <br />
                từ ngày:
              </label>
              <div className="flex-1 min-w-0">
                <CustomDatePicker
                  selected={parseDateStringYMD(
                    tempSearchParams.approveDateFrom
                  )}
                  onChange={(date) =>
                    setTempSearchParams((prev) => ({
                      ...prev,
                      approveDateFrom: formatDateYMD(date),
                    }))
                  }
                  placeholder="dd/mm/yyyy"
                  className="w-full"
                />
              </div>
            </div>

            {/* Ngày cho ý kiến đến */}
            <div className="flex flex-row items-center gap-2">
              <label className="text-sm font-bold whitespace-nowrap text-right w-[140px] flex-shrink-0">
                Đến ngày:
              </label>
              <div className="flex-1 min-w-0">
                <CustomDatePicker
                  selected={parseDateStringYMD(tempSearchParams.approveDateTo)}
                  onChange={(date) =>
                    setTempSearchParams((prev) => ({
                      ...prev,
                      approveDateTo: formatDateYMD(date),
                    }))
                  }
                  placeholder="dd/mm/yyyy"
                  className="w-full"
                />
              </div>
            </div>

            {/* Trạng thái */}
            <div className="flex flex-row items-center gap-2">
              <label className="text-sm font-bold whitespace-nowrap text-right w-[140px] flex-shrink-0">
                Trạng thái:
              </label>
              <div className="flex-1 min-w-0">
                <SelectCustom
                  className="w-full h-[32px]"
                  value={tempSearchParams.docStatus || "all"}
                  onChange={(value) => {
                    const strValue = Array.isArray(value) ? value[0] : value;
                    setTempSearchParams((prev) => ({
                      ...prev,
                      docStatus: strValue === "all" ? "" : strValue || "",
                    }));
                  }}
                  options={[
                    { label: "--- Tất Cả ---", value: "all" },
                    ...docInStatusList.map((item) => ({
                      label: item.name,
                      value: item.value,
                    })),
                  ]}
                  placeholder="--- Tất Cả ---"
                />
              </div>
            </div>
          </div>

          {/* Search Button */}
          <div className="flex justify-center gap-2 my-3">
            <Button
              type="submit"
              className="h-9 px-4 text-sm font-medium bg-blue-600 hover:bg-blue-700 focus:outline-none focus-visible:ring-gray-300 focus-visible:ring-opacity-50 inline-flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Tìm kiếm
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleSearchReset}
              className="h-9 px-4 text-sm font-medium inline-flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Đặt lại
            </Button>
          </div>
        </form>
      </div>

      {/* Table */}
      <div className="bg-white">
        <Table
          columns={columns}
          dataSource={data?.content || []}
          loading={isLoading}
          currentPage={searchField.page}
          totalItems={data?.totalElements || 0}
          itemsPerPage={searchField.pageSize}
          onPageChange={(page) => doSearch(page)}
          onItemsPerPageChange={(size) => {
            setSearchField((prev) => ({
              ...prev,
              pageSize: size,
              page: 1,
            }));
          }}
          emptyText={
            <span className="text-gray-500 italic">Không tồn tại văn bản</span>
          }
          showPagination={true}
          showPageSize={true}
          pageSizeOptions={[10, 20, 50, 100]}
        />
      </div>
    </div>
  );
}
