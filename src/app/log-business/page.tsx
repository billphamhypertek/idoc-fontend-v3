"use client";
import React, { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import useAuthStore from "@/stores/auth.store";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetMapCategory,
  useLogBusinessExcelQuery,
  useLogBusinessQuery,
} from "@/hooks/data/log-business.data";
import { LogBusiness } from "@/definitions/types/log-business.type";
import { Column } from "@/definitions";
import { formatDateTime, formatDateTimeVN } from "@/utils/datetime.utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Printer, RotateCcw, Search, CalendarIcon } from "lucide-react";
import SelectCustom from "@/components/common/SelectCustom";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import { Table } from "@/components/ui/table";
import { Workbook } from "exceljs";
import * as fs from "file-saver";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

const defaultSearchState = {
  idCat: "ALL",
  username: "",
  startDate: "",
  endDate: "",
  page: 1,
  sortBy: "",
  direction: "DESC",
  size: 10,
};

type SearchState = typeof defaultSearchState;

export default function LogBusinessPage() {
  const [searchParams, setSearchParams] =
    useState<SearchState>(defaultSearchState);
  const [tempSearchParams, setTempSearchParams] =
    useState<SearchState>(defaultSearchState);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [enableExcelQuery, setEnableExcelQuery] = useState(false);

  const advanceParams = useMemo(
    () => ({
      page: currentPage,
      size: itemsPerPage,
      direction: searchParams.direction,
      sortBy: searchParams.sortBy,
      idCat: searchParams.idCat === "ALL" ? "" : searchParams.idCat,
      username: searchParams.username,
      startDate: searchParams.startDate,
      endDate: searchParams.endDate,
    }),
    [searchParams, currentPage, itemsPerPage]
  );

  const {
    data: currentData,
    isLoading,
    error,
  } = useLogBusinessQuery(advanceParams);

  const { data: currentDataExcel, isLoading: isLoadingExcel } =
    useLogBusinessExcelQuery(advanceParams, enableExcelQuery);

  const { data: mapCategory } = useGetMapCategory();

  const totalItems: number = currentData?.totalRecord || 0;
  const totalPages: number = currentData?.totalPage || 0;
  const logBusinessList: LogBusiness[] = currentData?.objList || [];
  const exportLog: LogBusiness[] = currentDataExcel?.objList || [];

  const handleSearchSubmit = () => {
    setCurrentPage(1);
    setSearchParams((prev) => ({
      ...prev,
      ...tempSearchParams,
    }));
  };

  const handleSearchReset = () => {
    setSearchParams(defaultSearchState);
    setTempSearchParams(defaultSearchState);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const prettyJSON = (objlist: LogBusiness[]) => {
    const excelJson: any[] = [];
    if (objlist.length > 0) {
      objlist.forEach((element, i) => {
        excelJson.push([
          i + 1,
          element.userName ? element.userName : "",
          element.ipDevice ? element.ipDevice : "",
          element.action ? element.action : "",
          element.category ? element.category : "",
          element.content ? element.content : "",
          element.createDate ? element.createDate : "",
        ]);
      });
    }
    return excelJson;
  };

  const generateExcelBusinessLog = (
    title: string,
    header: string[],
    data: any[],
    fileName: string
  ) => {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Thống kê");
    // Add Row and formatting
    const titleRow = worksheet.addRow([title]);
    titleRow.font = { name: "Times New Roman", size: 18, bold: true };
    titleRow.alignment = { vertical: "middle" };
    worksheet.addRow([]);
    worksheet.mergeCells("A1:G2");
    worksheet.mergeCells("A3:G3");
    // Blank Row
    worksheet.addRow([]);
    // Add Header Row
    const headerRow = worksheet.addRow(header);

    // Cell Style : Fill and Border
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "e9f9f7" },
        bgColor: { argb: "e9f9f7" },
      };
      cell.font = { name: "Times New Roman", bold: true };
      cell.border = {
        top: { style: "thin" },
        left: { style: "thin" },
        bottom: { style: "thin" },
        right: { style: "thin" },
      };
    });
    // Add Data and Conditional Formatting
    data.forEach((d) => {
      const row = worksheet.addRow(d);
      row.font = { name: "Times New Roman", size: 14 };
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        // cell.alignment = {wrapText: true};
      });
    });
    worksheet.getColumn(1).width = 8; // STT
    worksheet.getColumn(1).alignment = {
      wrapText: true,
      vertical: "middle",
      horizontal: "center",
    };

    worksheet.getColumn(2).width = 25; // Tên đăng nhập
    worksheet.getColumn(2).alignment = {
      wrapText: true,
      vertical: "middle",
      horizontal: "center",
    };

    worksheet.getColumn(3).width = 25; // IP Thiết bị
    worksheet.getColumn(3).alignment = {
      wrapText: true,
      vertical: "middle",
      horizontal: "center",
    };

    worksheet.getColumn(4).width = 20; // Hành động
    worksheet.getColumn(4).alignment = {
      wrapText: true,
      vertical: "middle",
      horizontal: "center",
    };

    worksheet.getColumn(5).width = 20; // Loại Đối Tượng
    worksheet.getColumn(5).alignment = {
      wrapText: true,
      vertical: "middle",
      horizontal: "center",
    };

    worksheet.getColumn(6).width = 40; // Nội Dung
    worksheet.getColumn(6).alignment = {
      wrapText: true,
      vertical: "middle",
      horizontal: "left",
    };

    worksheet.getColumn(7).width = 20; // Thời Gian
    worksheet.getColumn(7).alignment = {
      wrapText: true,
      vertical: "middle",
      horizontal: "center",
    };

    worksheet.addRow([]);
    workbook.xlsx.writeBuffer().then((dt) => {
      const blob = new Blob([dt], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      fs.saveAs(blob, `${fileName}_${new Date().getTime()}.xlsx`);
    });
  };

  const handleExportExcel = () => {
    setEnableExcelQuery(true);
  };

  // Effect để xử lý export khi data đã load xong
  useEffect(() => {
    if (enableExcelQuery && !isLoadingExcel && exportLog.length > 0) {
      const header = [
        "STT",
        "Tên đăng nhập",
        "IP Thiết bị",
        "Hành động",
        "Loại Đối Tượng",
        "Nội Dung",
        "Thời Gian",
      ];
      const exportJson = prettyJSON(exportLog);
      generateExcelBusinessLog(
        "THỐNG KÊ NGHIỆP VỤ",
        header,
        exportJson,
        "THONG_KE_NGHIEP_VU"
      );
      setEnableExcelQuery(false); // Reset lại sau khi export xong
    }
  }, [enableExcelQuery, isLoadingExcel, exportLog]);

  const SearchSection = useMemo(
    () => (
      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-8">
          <div className="space-y-2 flex-1 w-full">
            <div className="font-bold text-sm">Tên đăng nhập</div>
            <div>
              <Input
                className="h-9 text-sm"
                placeholder="Nhập từ khóa…"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setTempSearchParams((prev) => ({
                    ...prev,
                    username: e.target.value,
                  }))
                }
                value={tempSearchParams.username}
              />
            </div>
          </div>
          <div className="space-y-2 flex-1 w-full">
            <div className="font-bold text-sm">Loại đối tượng</div>
            <div className="flex-1 min-w-0">
              <SelectCustom
                value={tempSearchParams.idCat}
                onChange={(value: string | string[]) =>
                  setTempSearchParams((prev) => ({
                    ...prev,
                    idCat: Array.isArray(value) ? value[0] : value,
                  }))
                }
                options={[
                  { label: "Tất cả", value: "ALL" },
                  ...(mapCategory?.map((item) => ({
                    label: item.name,
                    value: String(item.catId),
                  })) ?? []),
                ]}
                placeholder="-- Chọn --"
              />
            </div>
          </div>
          <div className="space-y-2 flex-1 w-full">
            <div className="font-bold text-sm">Từ ngày</div>
            <div className="relative">
              <Input
                type="text"
                className="h-9 text-sm bg-background pr-9"
                value={
                  tempSearchParams.startDate
                    ? format(new Date(tempSearchParams.startDate), "dd/MM/yyyy")
                    : ""
                }
                placeholder="dd/mm/yyyy"
                readOnly
              />
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                  >
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      tempSearchParams.startDate
                        ? new Date(tempSearchParams.startDate)
                        : undefined
                    }
                    onSelect={(date) => {
                      if (date) {
                        setTempSearchParams((prev) => ({
                          ...prev,
                          startDate: format(date, "yyyy-MM-dd"),
                        }));
                      }
                    }}
                    captionLayout="dropdown"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="space-y-2 flex-1 w-full">
            <div className="font-bold text-sm">Đến ngày</div>
            <div className="relative">
              <Input
                type="text"
                className="h-9 text-sm bg-background pr-9"
                value={
                  tempSearchParams.endDate
                    ? format(new Date(tempSearchParams.endDate), "dd/MM/yyyy")
                    : ""
                }
                placeholder="dd/mm/yyyy"
                readOnly
              />
              <Popover>
                <PopoverTrigger asChild>
                  <button
                    type="button"
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
                  >
                    <CalendarIcon className="h-4 w-4 text-gray-500" />
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={
                      tempSearchParams.endDate
                        ? new Date(tempSearchParams.endDate)
                        : undefined
                    }
                    onSelect={(date) => {
                      if (date) {
                        setTempSearchParams((prev) => ({
                          ...prev,
                          endDate: format(date, "yyyy-MM-dd"),
                        }));
                      }
                    }}
                    captionLayout="dropdown"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </div>
        <div className="flex justify-center gap-2">
          <Button
            size="sm"
            onClick={handleSearchSubmit}
            className="h-9 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Search className="w-3 h-3 mr-1" />
            Tìm kiếm
          </Button>
          <Button
            variant="outline"
            onClick={handleExportExcel}
            disabled={isLoadingExcel}
            className="flex items-center gap-2 text-white border-0 bg-blue-600 hover:bg-blue-700"
            onMouseEnter={(e) =>
              (e.currentTarget.style.backgroundColor = "#5a4acf")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.backgroundColor = "#7460ee")
            }
          >
            <Printer className="w-3 h-3 mr-1" />
            {isLoadingExcel ? "Đang xuất..." : "Xuất Excel"}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSearchReset}
            className="h-9 px-3 text-xs"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Đặt lại
          </Button>
        </div>
      </div>
    ),
    [
      tempSearchParams.username,
      tempSearchParams.idCat,
      tempSearchParams.startDate,
      tempSearchParams.endDate,
      mapCategory,
      handleSearchSubmit,
      handleExportExcel,
    ]
  );

  const logBusinessColumns: Column<LogBusiness>[] = [
    {
      header: "STT",
      accessor: (item: LogBusiness) => item.no,
      className: "w-3 text-center border-r",
    },
    {
      header: "Tên Đăng Nhập",
      accessor: (item: LogBusiness) => item.userName,
      className: "w-10 text-center border-r",
    },
    {
      header: "IP Thiết Bị",
      accessor: (item: LogBusiness) => item.ipDevice,
      className: "w-10 text-center border-r",
    },
    {
      header: "Hành Động",
      accessor: (item: LogBusiness) => item.action,
      className: "w-10 text-center border-r",
    },
    {
      header: "Loại Đối Tượng",
      accessor: (item: LogBusiness) => item.category,
      className: "w-10 text-center border-r",
    },
    {
      header: "Nội Dung",
      accessor: (item: LogBusiness) => item.content,
      className: "w-10 text-center border-r",
    },
    {
      header: "Thời Gian",
      accessor: (item: LogBusiness) => item.createDate,
      className: "w-10 text-center border-r",
    },
  ];

  return (
    <div className="space-y-4 px-4">
      <div className="flex items-center justify-between">
        <BreadcrumbNavigation
          items={[{ label: "Quản trị hệ thống", href: "/" }]}
          currentPage="Log nghiệp vụ"
          showHome={false}
        />
      </div>
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-gray-900">
          Quản Lý Log Nghiệp Vụ
        </h2>
      </div>
      {SearchSection}
      <Table
        sortable
        columns={logBusinessColumns}
        dataSource={logBusinessList}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        showPagination
        bgColor="bg-white"
        rowClassName={(_item: LogBusiness, index: number) =>
          index % 2 === 0 ? "bg-white" : "bg-[#0000000d]"
        }
        emptyText={
          isLoading
            ? "Đang tải dữ liệu..."
            : error
              ? `Lỗi: ${error && typeof error === "object" && "message" in error ? ((error as { message?: string }).message ?? "Không xác định") : "Không xác định"}`
              : "Không tồn tại log"
        }
        onItemsPerPageChange={(size: number) => {
          setItemsPerPage(size);
          setCurrentPage(1);
        }}
        loading={isLoading}
      />
    </div>
  );
}
