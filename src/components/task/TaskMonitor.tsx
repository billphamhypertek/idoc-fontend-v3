"use client";
import { useMemo, useState, useEffect } from "react";
import BreadcrumbNavigation from "../common/BreadcrumbNavigation";
import { searchTaskParams } from "@/definitions/types/task.type";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Table } from "../ui/table";
import { SearchIcon, FileIcon, DownloadIcon, ChevronDown } from "lucide-react";
import { CustomDatePicker } from "../ui/calendar";
import SelectCustom from "../common/SelectCustom";
import {
  useFindByOrgCVV,
  useGetUserAssignTasks,
} from "@/hooks/data/vehicle.data";
import {
  useGetCategoryWithCode,
  useGetFindOrgAll,
} from "@/hooks/data/task.data";
import { Constant } from "@/definitions/constants/constant";
import dayjs from "dayjs";
import {
  DEADLINE_WARNINGS,
  addDeadlineWarningToTasks,
  getDeadlineWarningClasses,
  getDeadlineBadgeStyleByColor,
} from "@/utils/deadline.utils";
import { ToastUtils } from "@/utils/toast.utils";
import { useGetListLeaderById } from "@/hooks/data/taskv2.data";

interface TaskMonitorProps {
  data: any[];
  searchParams?: searchTaskParams;
  onSearch?: (params: any) => void;
  isExportExcel?: boolean;
  onExportExcel?: () => void;
  isCreatePdf?: boolean;
  onCreatePdf?: () => void;
  columns: any[];
  tabs: any[];
  onRowClick: (row: any) => void;
  headerTitle: string;
  headerSubtitle: string;
  breadcrumbItems: any[];
  currentPage: string;
  handleTabChange: (tab: string) => void;
  // Pagination props
  currentPageNumber?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  isDefaultFilter?: boolean;
  // Organization data for PDF title
  onOrgNameChange?: (orgName: string) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  isV2?: boolean;
}

export default function TaskMonitor({
  data,
  searchParams,
  onSearch,
  isExportExcel,
  onExportExcel,
  isCreatePdf,
  onCreatePdf,
  columns,
  tabs,
  onRowClick,
  headerTitle,
  headerSubtitle,
  breadcrumbItems,
  currentPage,
  handleTabChange,
  currentPageNumber,
  totalItems,
  onPageChange,
  isDefaultFilter = true,
  onOrgNameChange,
  onItemsPerPageChange,
  isV2 = false,
}: TaskMonitorProps) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [startReportDate, setStartReportDate] = useState<Date | null>(null);
  const [endReportDate, setEndReportDate] = useState<Date | null>(null);
  const [selectedOrg, setSelectedOrg] = useState<string>("");
  const [selectedWorkType, setSelectedWorkType] = useState<string>("");
  const [selectedPriority, setSelectedPriority] = useState<string[]>([]);
  const [selectedAssigner, setSelectedAssigner] = useState<string>("");
  const [selectedOrgAssign, setSelectedOrgAssign] = useState<string>("");
  const [selectedNameLead, setSelectedNameLead] = useState<string>("");
  const [maxResults, setMaxResults] = useState<string>("");
  const [showFilter, setShowFilter] = useState<boolean>(true);

  // Function to get row className based on deadline warning
  const getRowClassName = (record: any, index: number): string => {
    if (record.deadlineWarning) {
      const style = getDeadlineBadgeStyleByColor(record.deadlineWarning.color);
      // Return light background for rows
      switch (record.deadlineWarning.color) {
        case "red":
          return "bg-red-50";
        case "blue":
          return "bg-blue-50";
        case "black":
          return "bg-gray-50";
        default:
          return "";
      }
    }
    return "";
  };

  // Function to get text color based on deadline warning
  const getRowTextColor = (record: any, index: number): string => {
    if (record.deadlineWarning) {
      return getDeadlineWarningClasses(record.deadlineWarning.color);
    }
    return "";
  };

  const UserInfo = useMemo(() => {
    if (typeof window === "undefined") return {};
    return JSON.parse(localStorage.getItem("userInfo") || "{}");
  }, []);

  const { data: listCVV } = useFindByOrgCVV(isDefaultFilter);

  const { data: listOrgAll } = useGetFindOrgAll(
    !(
      UserInfo?.orgModal?.id === 2 || UserInfo?.orgModal?.isPermissionViewAll
    ) && isDefaultFilter
  );

  const { data: listCategoryWithCode } = useGetCategoryWithCode(
    Constant.CATEGORYTYPE_CODE.PRIORITY,
    isDefaultFilter
  );

  const conditionListAssigner =
    UserInfo?.currentRole === 58 || UserInfo?.currentRole === 59;
  const orgIdForAssigner = conditionListAssigner
    ? UserInfo?.org
    : UserInfo?.orgModel?.parentId;

  const { data: listAssigner } = useGetUserAssignTasks(
    orgIdForAssigner,
    isDefaultFilter
  );

  const { data: listNameLead } = useGetListLeaderById(
    selectedOrg ? parseInt(selectedOrg) : 0,
    selectedOrg ? true : false && isDefaultFilter,
    isV2
  );

  const workTypes = [
    { id: "all", name: "--Chọn--" },
    { id: "2", name: "Ban cơ yếu" },
    { id: UserInfo?.orgModal?.id?.toString() || "unit", name: "Đơn vị" },
  ];

  const nameLeadOptions = [
    ...(listNameLead?.map((item: any) => ({
      id: item.fullName,
      name: item.fullName,
    })) || []),
  ];

  const resultOptions = ["--Chọn--", "4", "3", "2", "1"];

  const filterListCVV =
    listCVV?.filter(
      (item) =>
        item.name.toLocaleLowerCase() !==
        "cơ quan và đơn vị ngoài ban cơ yếu chính phủ"
    ) || [];

  const filterListCVVOptions = [
    { id: "all", name: "--Chọn--" },
    ...(filterListCVV?.map((item) => ({
      id: item.id.toString(),
      name: item.name,
    })) || []),
  ];

  const filterListOrgAllOptions = [
    { id: "all", name: "--Chọn--" },
    ...(listOrgAll?.map((item: any) => ({
      id: item.id.toString(),
      name: item.name,
    })) || []),
  ];

  const filterListAssignerOptions = [
    { id: "all", name: "--Chọn--" },
    ...(listAssigner?.map((item: any) => ({
      id: item.id.toString(),
      name: `${item.fullName}  ---  ${item.positionName}`,
    })) || []),
  ];

  const conditionSelectOrg =
    UserInfo?.orgModal?.id === 2 || UserInfo?.orgModal?.isPermissionViewAll
      ? filterListCVVOptions
      : filterListOrgAllOptions;

  useEffect(() => {
    if (listNameLead && listNameLead.length > 0 && !selectedNameLead) {
      setSelectedNameLead(listNameLead[0].fullName);
    }
  }, [listNameLead, selectedNameLead]);

  const handleChangeOrg = (value: string | string[]) => {
    const selectedValue = Array.isArray(value) ? value[0] : value;
    setSelectedOrg(selectedValue);
    setSelectedAssigner("");
    setSelectedNameLead("");

    if (selectedValue && selectedValue !== "all") {
      const orgName =
        conditionSelectOrg.find((org) => org.id === selectedValue)?.name || "";
      onOrgNameChange?.(orgName);
    } else {
      onOrgNameChange?.("");
    }
  };

  useEffect(() => {
    if (
      listCategoryWithCode &&
      listCategoryWithCode.length > 0 &&
      selectedPriority.length === 0
    ) {
      const firstFourPriorities = listCategoryWithCode
        .slice(0, 4)
        .map((item: any) => item.id.toString());
      setSelectedPriority(firstFourPriorities);

      const params = {
        taskFieldId: null,
        priorityId: firstFourPriorities.map((id: string) => parseInt(id)),
        taskType: null,
        taskStatus: false,
        codeTask: null,
        startDate: "",
        endDate: "",
        dayLeft: "",
        orgId: null,
        userStatus: null,
        orgAssignOfTask: null,
        startReportDate: null,
        endReportDate: null,
        nameLeadSign: "",
        userAssignId: null,
      };
      onSearch?.(params);
    }
  }, [listCategoryWithCode, selectedPriority.length]);

  const handleSearch = () => {
    const params = {
      taskFieldId: null,
      priorityId:
        selectedPriority.length > 0
          ? selectedPriority.map((id) => parseInt(id))
          : [],
      taskType:
        selectedWorkType && selectedWorkType !== "all"
          ? selectedWorkType === "true"
          : null,
      taskStatus: searchParams?.taskStatus,
      codeTask: null,
      startDate: startDate ? dayjs(startDate).format("YYYY-MM-DD") : "",
      endDate: endDate ? dayjs(endDate).format("YYYY-MM-DD") : "",
      dayLeft: "",
      orgId: selectedOrg && selectedOrg !== "all" ? selectedOrg : "",
      userStatus: null,
      orgAssignOfTask:
        selectedOrgAssign && selectedOrgAssign !== "all"
          ? parseInt(selectedOrgAssign)
          : null,
      startReportDate: startReportDate
        ? dayjs(startReportDate).format("YYYY-MM-DD")
        : null,
      endReportDate: endReportDate
        ? dayjs(endReportDate).format("YYYY-MM-DD")
        : null,
      nameLeadSign:
        selectedNameLead && selectedNameLead !== "all" ? selectedNameLead : "",
      userAssignId:
        selectedAssigner && selectedAssigner !== "all"
          ? selectedAssigner
          : null,
    };
    onSearch?.(params);
  };

  const handlePriorityChange = (value: string | string[]) => {
    const newPriority = Array.isArray(value) ? value : [value];
    if (newPriority.length > 0) {
      setSelectedPriority(newPriority);
    } else {
      ToastUtils.error("Bạn không thể bỏ chọn tất cả");
    }
  };

  return (
    <div className="space-y-4 p-4">
      <BreadcrumbNavigation
        items={breadcrumbItems}
        currentPage={currentPage}
        showHome={false}
      />

      <div className="flex p-4 flex-col rounded-lg bg-gray-200">
        <h2 className="text-xl font-bold">{headerTitle}</h2>
        <p className="text-sm text-muted-foreground mt-1">{headerSubtitle}</p>
      </div>

      {isDefaultFilter && (
        <div className="rounded-lg border">
          <div className="flex justify-between items-center border-b p-2">
            <h3 className="text-lg font-bold flex items-center">
              Bộ lọc tìm kiếm
            </h3>
            <ChevronDown
              className="h-4 w-4 cursor-pointer flex items-center"
              onClick={() => setShowFilter(!showFilter)}
            />
          </div>
          {showFilter && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSearch();
              }}
            >
              <div className="space-y-4 p-4">
                <div className="grid grid-cols-4 gap-4">
                  {/* Ngày bắt đầu công việc */}
                  <div className="space-y-2">
                    <Label className="font-bold">Ngày bắt đầu công việc</Label>
                    <CustomDatePicker
                      selected={startDate}
                      onChange={setStartDate}
                      placeholder="dd/mm/yyyy"
                    />
                  </div>

                  {/* Ngày kết thúc công việc */}
                  <div className="space-y-2">
                    <Label className="font-bold">Ngày kết thúc công việc</Label>
                    <CustomDatePicker
                      selected={endDate}
                      onChange={setEndDate}
                      placeholder="dd/mm/yyyy"
                      min={
                        startDate
                          ? dayjs(startDate).format("YYYY-MM-DD")
                          : undefined
                      }
                    />
                  </div>

                  {/* Thời gian báo cáo từ */}
                  <div className="space-y-2">
                    <Label className="font-bold">Thời gian báo cáo từ</Label>
                    <CustomDatePicker
                      selected={startReportDate}
                      onChange={setStartReportDate}
                      placeholder="dd/mm/yyyy"
                    />
                  </div>

                  {/* Đến thời gian báo cáo */}
                  <div className="space-y-2">
                    <Label className="font-bold">Đến thời gian báo cáo</Label>
                    <CustomDatePicker
                      selected={endReportDate}
                      onChange={setEndReportDate}
                      placeholder="dd/mm/yyyy"
                      min={
                        startReportDate
                          ? dayjs(startReportDate).format("YYYY-MM-DD")
                          : undefined
                      }
                    />
                  </div>

                  {/* Công việc thuộc */}
                  <div className="space-y-2">
                    <Label className="font-bold">Công việc thuộc</Label>
                    <SelectCustom
                      options={workTypes}
                      value={selectedOrgAssign}
                      onChange={(value) =>
                        setSelectedOrgAssign(
                          Array.isArray(value) ? value[0] : value
                        )
                      }
                      placeholder="-- Chọn --"
                      className="bg-white [&>button]:!text-black"
                    />
                  </div>

                  {/* Đơn vị xử lý */}
                  <div className="space-y-2">
                    <Label className="font-bold">
                      Đơn vị xử lý <span className="text-red-500">*</span>
                    </Label>
                    <SelectCustom
                      options={conditionSelectOrg}
                      value={selectedOrg}
                      onChange={handleChangeOrg}
                      placeholder="-- Chọn --"
                      className="bg-white [&>button]:!text-black"
                    />
                  </div>

                  {selectedOrg && selectedOrg !== "all" && (
                    <div className="space-y-2">
                      <Label className="font-bold">
                        Người ký báo cáo tổng hợp{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <SelectCustom
                        options={nameLeadOptions}
                        value={selectedNameLead}
                        onChange={(value) =>
                          setSelectedNameLead(
                            Array.isArray(value) ? value[0] : value
                          )
                        }
                        placeholder="-- Chọn --"
                        className="bg-white [&>button]:!text-black"
                      />
                    </div>
                  )}

                  {/* Nhóm các công việc */}
                  <div className="space-y-2">
                    <Label className="font-bold">
                      Nhóm các công việc <span className="text-red-500">*</span>
                    </Label>
                    <SelectCustom
                      type="multi"
                      showCheckbox
                      options={
                        listCategoryWithCode?.map((item: any) => ({
                          id: item.id.toString(),
                          name: item.name,
                        })) || []
                      }
                      value={selectedPriority}
                      onChange={handlePriorityChange}
                      placeholder="-- Chọn --"
                      className="bg-white [&>button]:!text-black"
                    />
                  </div>

                  {/* Số lượng kết quả báo cáo */}
                  <div className="space-y-2">
                    <Label className="font-bold">
                      Số lượng kết quả báo cáo
                    </Label>
                    <SelectCustom
                      options={resultOptions.map((option) => ({
                        id: option,
                        name: option,
                      }))}
                      value={maxResults}
                      onChange={(value) =>
                        setMaxResults(Array.isArray(value) ? value[0] : value)
                      }
                      placeholder="-- Chọn --"
                      className="bg-white [&>button]:!text-black"
                    />
                  </div>

                  {/* Người giao việc */}
                  <div className="space-y-2">
                    <Label className="font-bold">Người giao việc</Label>
                    <SelectCustom
                      options={filterListAssignerOptions}
                      value={selectedAssigner}
                      onChange={(value) =>
                        setSelectedAssigner(
                          Array.isArray(value) ? value[0] : value
                        )
                      }
                      placeholder="-- Chọn --"
                      className="bg-white [&>button]:!text-black"
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end gap-2 pt-6">
                  <Button
                    type="submit"
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <SearchIcon className="h-4 w-4" />
                    Tìm kiếm
                  </Button>
                  <Button
                    type="button"
                    onClick={onExportExcel}
                    disabled={isExportExcel}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <FileIcon className="h-4 w-4" />
                    Xuất báo cáo Excel
                  </Button>
                  <Button
                    type="button"
                    onClick={onCreatePdf}
                    disabled={isCreatePdf}
                    className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white"
                  >
                    <DownloadIcon className="h-4 w-4" />
                    Tạo báo cáo PDF
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      )}

      {/* Tabs and Table */}
      <Tabs
        defaultValue={tabs[0]?.id}
        className="w-full"
        onValueChange={handleTabChange}
      >
        <TabsList className="flex w-fit bg-transparent justify-start gap-2 bg-gray-100 rounded-lg p-1">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              disabled={tab.disabled}
              className="whitespace-nowrap data-[state=active]:text-blue-600 px-3 py-1 text-xs rounded-md transition-colors"
            >
              {tab.title}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="py-4 px-2">
            <Table
              columns={columns}
              dataSource={
                tab.showDeadlineWarning ? addDeadlineWarningToTasks(data) : data
              }
              onRowClick={onRowClick}
              showPagination={true}
              emptyText="Không tồn tại công việc"
              currentPage={currentPageNumber}
              totalItems={totalItems}
              onPageChange={onPageChange}
              rowClassName={getRowClassName}
              rowTextColor={getRowTextColor}
              onItemsPerPageChange={onItemsPerPageChange}
              showPageSize={false}
            />
          </TabsContent>
        ))}
      </Tabs>

      <div className="flex justify-center gap-4 mt-4">
        {DEADLINE_WARNINGS.slice(2, 5).map((warning) => (
          <div
            key={warning.id}
            className={`inline-flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition-colors`}
            onClick={() => {
              const params = {
                ...searchParams,
                dayLeft: warning.dayLeft.toString(),
              };
              onSearch?.(params);
            }}
          >
            <div
              className="w-4 h-4 rounded-sm"
              style={{
                backgroundColor: warning.color,
              }}
            />
            <span className="text-sm font-medium">{warning.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
