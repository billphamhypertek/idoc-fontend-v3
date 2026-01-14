"use client";

import { Download, Plus, X } from "lucide-react";
import { Button } from "../ui/button";
import BreadcrumbNavigation from "../common/BreadcrumbNavigation";
import { useEffect, useRef, useState } from "react";
import OrgTreeSelect from "../dashboard/OrgTreeSelect";
import { OrgTreeNode } from "@/definitions/types/orgunit.type";
import { Label } from "../ui/label";
import {
  formatDateVN,
  parseDateStringYMD,
  formatDateYMD,
} from "@/utils/datetime.utils";
import { CustomDatePicker } from "../ui/calendar";
import { Input } from "../ui/input";
import SelectCustom from "../common/SelectCustom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Table } from "../ui/table";
import { usePathname } from "next/navigation";
import { SearchDailyReport } from "@/definitions/types/report.type";
import dayjs from "dayjs";

interface DailyReportProps {
  tabs: any[];
  columns: any[];
  data: any[];
  totalItems?: number;
  currentPage?: number;
  isLoading?: boolean;
  onRowClick?: (row: any) => void;
  // Handlers
  onSearchChange?: (search: Partial<SearchDailyReport>) => void;
  onPageChange?: (page: number) => void;
  onTabChange?: (tabId: string) => void;
  onExportAll?: () => void;
  onInsertReport?: () => void;
  showPagination?: boolean;
}
export default function DailyReport({
  tabs,
  columns,
  data,
  totalItems = 0,
  currentPage = 1,
  isLoading = false,
  onRowClick: onRowClickProp,
  onSearchChange,
  onPageChange: onPageChangeProp,
  onTabChange: onTabChangeProp,
  onExportAll: onExportAllProp,
  showPagination: showPaginationProp = true,
  onInsertReport: onInsertReportProp,
}: DailyReportProps) {
  const BAN_CO_YEU_CHINH_PHU_ID = "2";
  const pathname = usePathname();

  const [selectedOrgId, setSelectedOrgId] = useState<string>(
    BAN_CO_YEU_CHINH_PHU_ID
  );
  const [orgSelectKey, setOrgSelectKey] = useState(0);
  const orgSelectRef = useRef<HTMLDivElement | null>(null);

  const [startReportDate, setStartReportDate] = useState<Date>();
  const [endReportDate, setEndReportDate] = useState<Date>();
  const [selectedReportType, setSelectedReportType] = useState<
    string | undefined
  >(undefined);

  const isGovReport = pathname?.includes("/gov") || false;
  const reportTitle = isGovReport ? "Chính quyền" : "Đảng";
  const reportTypeValue = isGovReport ? "Báo cáo chính quyền" : "Báo cáo đảng";

  const listType = [
    { id: "WEEK", name: "Tuần" },
    { id: "MONTH", name: "Tháng" },
    { id: "QUARTER", name: "Quý" },
    { id: "FIRST_6_MONTH", name: "6 tháng đầu năm" },
    { id: "YEAR", name: "Báo cáo năm" },
    { id: "LAST_6_MONTH", name: "6 tháng cuối năm" },
  ];

  useEffect(() => {
    if (!selectedReportType) {
      setSelectedReportType(listType[0].id);
    }
  }, [selectedReportType]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!orgSelectRef.current) return;

      const target = e.target as Element;
      const isCalendarClick =
        target.closest('[data-slot="calendar"]') ||
        target.closest("[data-radix-popper-content-wrapper]") ||
        target.closest(".rdp") ||
        target.closest('[role="dialog"]');

      if (isCalendarClick) return;

      if (!orgSelectRef.current.contains(target)) {
        setOrgSelectKey((k) => k + 1);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleTabChange = (value: string) => {
    onTabChangeProp?.(value);
  };

  const onRowClick = (row: any) => {
    onRowClickProp?.(row);
  };

  const onPageChange = (page: number) => {
    onPageChangeProp?.(page);
  };

  const onChangeOrgs = (node: OrgTreeNode) => {
    setSelectedOrgId(node.id);
    onSearchChange?.({ organization: node.id });
  };

  const onChangeStartDate = (date: Date | undefined) => {
    setStartReportDate(date);
    onSearchChange?.({
      startDate: date ? dayjs(date).format("YYYY-MM-DD") : undefined,
    });
  };

  const onChangeEndDate = (date: Date | undefined) => {
    setEndReportDate(date);
    onSearchChange?.({
      endDate: date ? dayjs(date).format("YYYY-MM-DD") : undefined,
    });
  };

  const onChangeType = (type: string) => {
    setSelectedReportType(type);
    onSearchChange?.({ type });
  };

  const handleExportAll = () => {
    onExportAllProp?.();
  };

  // New handlers for missing features
  const handleClearOrg = () => {
    setSelectedOrgId("");
    onSearchChange?.({ organization: "" });
  };

  return (
    <div className="space-y-4 p-4">
      <BreadcrumbNavigation
        currentPage={`Báo cáo ${reportTitle}`}
        showHome={false}
        items={[
          {
            href: "/daily-report",
            label: "Báo cáo",
          },
        ]}
      />
      {/* Header */}
      <div className="flex justify-between items-center p-4 border rounded-lg bg-white">
        <div className="flex flex-col">
          <h2 className="text-xl font-bold text-black">
            Báo cáo {reportTitle}
          </h2>
          <p className="text-sm text-gray-500">
            Danh sách báo cáo {reportTitle}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={handleExportAll}
          >
            <Download className="w-4 h-4" />
            Xuất báo cáo
          </Button>
          <Button
            variant="outline"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={onInsertReportProp}
          >
            <Plus className="w-4 h-4" />
            Thêm mới
          </Button>
        </div>
      </div>

      {/* Filter */}
      <div className="p-4 grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="flex flex-col gap-2" ref={orgSelectRef}>
          <Label className="font-bold">Chọn đơn vị</Label>
          <OrgTreeSelect
            key={orgSelectKey}
            value={selectedOrgId}
            onChange={onChangeOrgs}
            placeholder={
              selectedOrgId === "" ? "Tổng toàn ban" : "Tất cả đơn vị"
            }
            className=" !border-gray-100 focus:border-gray-100 focus:ring-0 h-9 text-sm [&_span]:text-black [&_span]:font-normal [&_svg]:text-black"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="font-bold">Ngày bắt đầu</Label>
          <CustomDatePicker
            selected={startReportDate || null}
            onChange={(date) => onChangeStartDate(date || undefined)}
            placeholder="dd/mm/yyyy"
            className="h-9 [&_*]:font-normal"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="font-bold">Ngày kết thúc</Label>
          <CustomDatePicker
            selected={endReportDate || null}
            onChange={(date) => onChangeEndDate(date || undefined)}
            placeholder="dd/mm/yyyy"
            className="h-9 [&_*]:font-normal"
            min={startReportDate ? formatDateYMD(startReportDate) : undefined}
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="font-bold">Loại</Label>
          <Input
            type="text"
            value={reportTypeValue}
            disabled
            className="bg-white h-9"
          />
        </div>
        <div className="flex flex-col gap-2">
          <Label className="font-bold">Chọn loại báo cáo</Label>
          <div className="flex-1 min-w-0">
            <SelectCustom
              options={listType.map((type) => ({
                label: type.name,
                value: type.id,
              }))}
              value={selectedReportType}
              onChange={(value) => onChangeType(value as string)}
              className="bg-white h-9 [&_*]:font-normal"
            />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs
        defaultValue={tabs[0]?.id}
        className="w-full p-2"
        onValueChange={handleTabChange}
      >
        <TabsList className="flex w-fit bg-transparent justify-start gap-2 bg-gray-100 rounded-lg p-1">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              disabled={tab.disabled}
              className="whitespace-nowrap data-[state=active]:bg-blue-600 data-[state=active]:text-white px-3 py-1 text-xs rounded-md transition-colors"
            >
              {tab.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="py-4 px-2">
            <Table
              columns={columns}
              dataSource={data}
              onRowClick={onRowClick}
              showPagination={showPaginationProp}
              emptyText="Không tồn tại văn bản "
              currentPage={currentPage}
              totalItems={totalItems}
              onPageChange={onPageChange}
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
