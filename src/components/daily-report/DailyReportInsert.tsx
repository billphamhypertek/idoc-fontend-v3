"use client";
import {
  REPORT_TYPE,
  DailyReportDataInit,
} from "@/definitions/types/report.type";
import BreadcrumbNavigation from "../common/BreadcrumbNavigation";
import { ArrowLeft, Save, Upload, Eye, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Card, CardContent } from "../ui/card";
import TextEditor from "../common/TextEditor";
import { useEffect, useMemo, useRef, useState } from "react";
import SelectCustom from "../common/SelectCustom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import {
  formatDateVN,
  getCurrentWeekNumber,
  getWeeksListForYear,
  getYearsList,
} from "@/utils/datetime.utils";
import {
  DailyReportFormData,
  dailyReportFormSchema,
} from "@/schemas/daily-report.schema";
import { getDefaultFormValuesDailyReport } from "@/utils/formValue.utils";
import dayjs from "dayjs";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isoWeek from "dayjs/plugin/isoWeek";
import localeData from "dayjs/plugin/localeData";
import {
  useGetSignerReport,
  useGetReport,
  useAddReport,
  useUpdateReport,
} from "@/hooks/data/report-action.data";
import { useGetCategoryWithCode } from "@/hooks/data/task.data";
import { Constant } from "@/definitions/constants/constant";
import {
  getFileSizeString,
  isExistFile,
  validFileSize,
  viewFile,
} from "@/utils/file.utils";
import {
  canViewNoStatus,
  getAssetIcon,
  getExtension,
  handleError,
} from "@/utils/common.utils";
import { ReportService } from "@/services/report.service";
import { toast } from "@/hooks/use-toast";
import ConfirmDeleteDialog from "../common/ConfirmDeleteDialog";
import { useRouter } from "next/navigation";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { ToastUtils } from "@/utils/toast.utils";

dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);
dayjs.extend(localeData);
dayjs.extend(customParseFormat);

dayjs.locale("en", {
  weekStart: 1,
});

interface DailyReportInsertProps {
  reportType: REPORT_TYPE;
  id?: string;
}

export default function DailyReportInsert({
  reportType,
  id,
}: DailyReportInsertProps) {
  const router = useRouter();
  const isGov = reportType === REPORT_TYPE.REPORT_GOV;
  const typeUrl = isGov ? "gov" : "par";
  const typeName = isGov ? "Chính quyền" : "Đảng";
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [validFileAttr, setValidFileAttr] = useState({
    validFiles: true,
    isValidFileSize: true,
    isValidExtension: true,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isShowRemoveFileDialog, setIsShowRemoveFileDialog] = useState(false);
  const [fileToDelete, setFileToDelete] = useState<any>(null);

  const UserInfo = useMemo(() => {
    if (typeof window === "undefined") return {};
    return JSON.parse(localStorage.getItem("userInfo") || "{}");
  }, []);

  const { data: listCategory } = useGetCategoryWithCode(
    Constant.CATEGORYTYPE_CODE.USER_POSITION
  );

  // Get report data if editing
  const { data: reportData, isLoading: isLoadingReport } = useGetReport(
    id ? Number(id) : 0,
    !!id
  );

  // Mutation hooks
  const addReportMutation = useAddReport();
  const updateReportMutation = useUpdateReport();

  const getUserCurrentPosition = () => {
    return (
      listCategory?.find(
        (category: any) => Number(category.id) === UserInfo?.position
      )?.name || ""
    );
  };

  const form = useForm<DailyReportFormData>({
    resolver: zodResolver(dailyReportFormSchema),
    defaultValues: {
      ...getDefaultFormValuesDailyReport(),
      organization: "",
      position: "",
    },
  });

  // Helper functions
  const getDateRangeByType = (type: string, week: string, year: string) => {
    const yearNum = parseInt(year);
    const weekNum = parseInt(week);

    switch (type) {
      case "WEEK":
        return getWeekDateRange(weekNum, yearNum);
      case "MONTH":
        return getMonthDateRange(weekNum, yearNum);
      case "QUARTER":
        return getQuarterDateRange(weekNum, yearNum);
      case "FIRST_6_MONTH":
        return getFirstSixMonthRange(yearNum);
      case "LAST_6_MONTH":
        return getLastSixMonthRange(yearNum);
      case "YEAR":
        return getYearDateRange(yearNum);
      default:
        return { startDate: "", endDate: "" };
    }
  };

  const getWeekDateRange = (week: number, year: number) => {
    const weekStart = dayjs().year(year).week(week).startOf("week");
    const weekEnd = dayjs().year(year).week(week).endOf("week");

    return {
      startDate: formatDateVN(weekStart.toDate()),
      endDate: formatDateVN(weekEnd.toDate()),
    };
  };

  const getMonthDateRange = (month: number, year: number) => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0);

    return {
      startDate: formatDateVN(startDate),
      endDate: formatDateVN(endDate),
    };
  };

  const getQuarterDateRange = (quarter: number, year: number) => {
    const startMonth = (quarter - 1) * 3;
    const startDate = new Date(year, startMonth, 1);
    const endDate = new Date(year, startMonth + 3, 0);

    return {
      startDate: formatDateVN(startDate),
      endDate: formatDateVN(endDate),
    };
  };

  const getFirstSixMonthRange = (year: number) => {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 5, 30);

    return {
      startDate: formatDateVN(startDate),
      endDate: formatDateVN(endDate),
    };
  };

  const getLastSixMonthRange = (year: number) => {
    const startDate = new Date(year, 6, 1);
    const endDate = new Date(year, 11, 31);

    return {
      startDate: formatDateVN(startDate),
      endDate: formatDateVN(endDate),
    };
  };

  const getYearDateRange = (year: number) => {
    const startDate = new Date(year, 0, 1);
    const endDate = new Date(year, 11, 31);

    return {
      startDate: formatDateVN(startDate),
      endDate: formatDateVN(endDate),
    };
  };

  const getPeriodsList = (type: string, year: string) => {
    const yearNum = parseInt(year);

    switch (type) {
      case "WEEK":
        return getWeeksListForYear(yearNum);
      case "MONTH":
        return getMonthsList();
      case "QUARTER":
        return getQuartersList();
      case "FIRST_6_MONTH":
      case "LAST_6_MONTH":
        return getSixMonthsList();
      case "YEAR":
        return [{ value: year, label: year }];
      default:
        return [];
    }
  };

  const getMonthsList = () => {
    const months = [];
    for (let i = 1; i <= 12; i++) {
      months.push({ value: i.toString(), label: ` ${i}` });
    }
    return months;
  };

  const getQuartersList = () => {
    const quarters = [];
    for (let i = 1; i <= 4; i++) {
      quarters.push({ value: i.toString(), label: ` ${i}` });
    }
    return quarters;
  };

  const getSixMonthsList = () => {
    return [
      { value: "1", label: "1" },
      { value: "7", label: "7" },
    ];
  };

  const getTitleTypeReport = (type: string) => {
    if (type === "WEEK") {
      return "Tuần";
    } else if (type === "MONTH") {
      return "Tháng";
    } else if (type === "QUARTER") {
      return "Quý";
    } else if (type === "YEAR") {
      return "Năm";
    } else if (type === "FIRST_6_MONTH" || type === "LAST_6_MONTH") {
      return "Bắt đầu từ tháng";
    } else {
      return "Tuần";
    }
  };

  const watchedType = form.watch("type");
  const watchedYear = form.watch("year");
  const watchedWeek = form.watch("week");
  const watchedPositionTitleId = form.watch("position");

  const { data: listSigner } = useGetSignerReport(
    watchedPositionTitleId || "",
    1,
    1000000,
    watchedPositionTitleId ? true : false
  );

  const yearsList = useMemo(() => getYearsList(), []);

  const periodsList = useMemo(() => {
    if (!watchedType || !watchedYear) {
      // Default periods for initial load
      const defaultType = "WEEK";
      const defaultYear = new Date().getFullYear().toString();
      return getPeriodsList(defaultType, defaultYear);
    }
    return getPeriodsList(watchedType, watchedYear);
  }, [watchedType, watchedYear]);

  const dateRange = useMemo(() => {
    if (watchedType && watchedWeek && watchedYear) {
      return getDateRangeByType(watchedType, watchedWeek, watchedYear);
    }
    return { startDate: "", endDate: "" };
  }, [watchedType, watchedWeek, watchedYear]);

  useEffect(() => {
    if (id && reportData) {
      form.setValue("title", reportData.title || "");
      form.setValue("type", reportData.type || "");
      form.setValue("year", reportData.year?.toString() || "");
      form.setValue("week", reportData.week?.toString() || "");
      form.setValue(
        "startDate",
        dayjs(reportData.startDate).format("DD/MM/YYYY") || ""
      );
      form.setValue(
        "endDate",
        dayjs(reportData.endDate).format("DD/MM/YYYY") || ""
      );
      form.setValue("organization", reportData.organization || "");
      form.setValue("position", reportData.positionTitleId?.toString() || "");
      form.setValue("signer", reportData.signer?.id?.toString() || "");
      form.setValue("recipients", reportData.placeReceive?.toString() || "");
      form.setValue(
        "confirmNumber",
        reportData.confirmNumber?.toString() || ""
      );
      form.setValue("workDone", reportData.workDone || "");
      form.setValue("expected", reportData.expected || "");
      form.setValue("requestAttach", reportData.requestAttach || "");

      if (reportData.attachments) {
        setSelectedFiles(reportData.attachments);
      }
    }
  }, [id, reportData, form]);

  useEffect(() => {
    if (!id) {
      if (UserInfo?.orgModel?.name) {
        form.setValue("organization", UserInfo.orgModel.name);
      }
      if (UserInfo?.position) {
        form.setValue("position", String(UserInfo.position));
      }

      if (listCategory && UserInfo?.position) {
        const currentPosition = getUserCurrentPosition();
        if (currentPosition) {
          form.setValue("position", String(UserInfo.position));
        }
      }
    }
  }, [UserInfo, listCategory, form, id]);

  useEffect(() => {
    if (!id && periodsList.length > 0) {
      let defaultWeek = periodsList[0].value;
      if (watchedType === "LAST_6_MONTH") {
        defaultWeek = "7";
      } else if (watchedType === "WEEK") {
        const currentWeekNum = getCurrentWeekNumber();
        const currentWeekStr = currentWeekNum.toString();
        if (periodsList.find((p) => p.value === currentWeekStr)) {
          defaultWeek = currentWeekStr;
        }
      }
      form.setValue("week", defaultWeek);
    }
  }, [periodsList, watchedType, form, id]);

  useEffect(() => {
    if (!id && dateRange.startDate && dateRange.endDate) {
      form.setValue("startDate", dateRange.startDate);
      form.setValue("endDate", dateRange.endDate);
    }
  }, [dateRange, form, id]);

  const onSubmit = async (data: DailyReportFormData) => {
    try {
      const formattedData: DailyReportDataInit = {
        reportType: reportType,
        type: data.type || "",
        year: Number(data.year),
        week: Number(data.week),
        confirmNumber: Number(data.confirmNumber) || 0,
        title: data.title || "",
        organization: UserInfo?.orgModel?.id || 0,
        positionTitleId: Number(data.position),
        signerId: Number(data.signer),
        placeReceive: Number(data.recipients),
        startDate: dayjs(data.startDate, "DD/MM/YYYY").format("YYYY-MM-DD"),
        endDate: dayjs(data.endDate, "DD/MM/YYYY").format("YYYY-MM-DD"),
        workDone: data.workDone || "",
        expected: data.expected || "",
        requestAttach: data.requestAttach || "",
      };

      if (isEditMode && id) {
        const result = await updateReportMutation.mutateAsync({
          report: formattedData,
          id: Number(id),
        });

        if (selectedFiles.length > 0) {
          const attachmentResult = await handleAddAttachment(result.id);
          if (!attachmentResult) {
            ToastUtils.error(
              "Báo cáo đã được cập nhật nhưng có lỗi khi upload file đính kèm"
            );
            return;
          }
        }
        router.push(`/daily-report/${typeUrl}`);
      } else {
        const result = await addReportMutation.mutateAsync(formattedData);

        if (selectedFiles.length > 0) {
          const attachmentResult = await handleAddAttachment(result.id);
          if (!attachmentResult) {
            ToastUtils.error(
              "Báo cáo đã được tạo nhưng có lỗi khi upload file đính kèm"
            );
            return;
          }
        }
        router.push(`/daily-report/${typeUrl}`);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const isEditMode = !!id;
  const pageTitle = isEditMode
    ? `Chỉnh sửa báo cáo ${typeName}`
    : `Thêm mới báo cáo ${typeName}`;

  const breadcrumbItems = [
    { label: "Báo cáo", href: "/daily-report" },
    { label: `Báo cáo ${typeName}`, href: `/daily-report/${typeUrl}` },
  ];

  const listType = [
    { id: "WEEK", name: "Tuần" },
    { id: "MONTH", name: "Tháng" },
    { id: "QUARTER", name: "Quý" },
    { id: "FIRST_6_MONTH", name: "6 tháng đầu năm" },
    { id: "YEAR", name: "Báo cáo năm" },
    { id: "LAST_6_MONTH", name: "6 tháng cuối năm" },
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    if (!validFileSize(files)) {
      setValidFileAttr((prev) => ({
        ...prev,
        validFiles: false,
        isValidFileSize: false,
      }));
      return;
    }

    const newFiles = Array.from(files).filter(
      (file) => !isExistFile(file.name, selectedFiles)
    );

    setSelectedFiles((prev) => [...prev, ...newFiles]);
    setValidFileAttr((prev) => ({
      ...prev,
      validFiles: true,
      isValidFileSize: true,
    }));

    event.target.value = "";
  };

  const removeFileToDB = async () => {
    if (!fileToDelete) return;

    try {
      const response = await ReportService.deleteFileReport(fileToDelete.id);

      if (response) {
        ToastUtils.success("Xóa tệp thành công");
        setSelectedFiles((prev) =>
          prev.filter((file) => file.name !== fileToDelete.name)
        );
        setFileToDelete(null);
        setIsShowRemoveFileDialog(false);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleRemoveFile = (index: number, file: any) => {
    if (file.id && file.reportId) {
      setFileToDelete(file);
      setIsShowRemoveFileDialog(true);
    } else {
      setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    }
  };

  const isView = (file: any) => {
    return canViewNoStatus(file.name) && !file.oEncrypt;
  };

  const handleViewFile = async (file: any) => {
    try {
      await viewFile(file, Constant.ATTACHMENT_DOWNLOAD_TYPE.REPORT);
    } catch (error) {
      handleError(error);
    }
  };

  const keyPressNumbers = (event: any) => {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode < 48 || charCode > 57) {
      event.preventDefault();
      return false;
    } else {
      return true;
    }
  };

  const handleAddAttachment = async (id: number) => {
    try {
      const response = await ReportService.addAttachment(selectedFiles, id);
      return !!response;
    } catch (error) {
      handleError(error);
      return false;
    }
  };

  return (
    <div className="space-y-4 px-4 py-0">
      <BreadcrumbNavigation
        items={breadcrumbItems}
        currentPage={pageTitle}
        showHome={false}
      />

      {/*Header*/}
      <div className="flex justify-between items-center p-4 border rounded-lg bg-white">
        <div className="flex flex-col">
          <h2 className="text-2xl font-bold">Báo cáo</h2>
          <p className="text-sm text-gray-500">Báo cáo {typeName}</p>
        </div>
        <div className="flex gap-2">
          <Button
            type="submit"
            variant="outline"
            className="bg-blue-600 hover:bg-blue-600 text-white hover:text-white"
            onClick={form.handleSubmit(onSubmit)}
            disabled={
              addReportMutation.isPending || updateReportMutation.isPending
            }
          >
            <Save className="w-4 h-4" />
            {addReportMutation.isPending || updateReportMutation.isPending
              ? "Đang lưu..."
              : "Lưu lại"}
          </Button>
          <Button
            variant="outline"
            className="bg-gray-500 hover:bg-gray-600 text-white hover:text-white"
            onClick={() => router.push(`/daily-report/${typeUrl}`)}
          >
            <ArrowLeft className="w-4 h-4" />
            Quay lại
          </Button>
        </div>
      </div>

      {/*Content*/}
      <Card className="my-1">
        <CardContent className="p-6">
          {isLoadingReport ? (
            <div className="flex justify-center items-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-9 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
              </div>
            </div>
          ) : (
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                {/* Row 1: Tiêu đề, Loại, Năm */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-4">
                        <FormLabel className="font-bold text-right min-w-[100px]">
                          Tiêu đề <span className="text-red-500">*</span>
                        </FormLabel>
                        <div className="flex-1">
                          <FormControl>
                            <Input
                              placeholder="Nhập tiêu đề báo cáo"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-4">
                        <FormLabel className="font-bold text-right min-w-[100px]">
                          Loại <span className="text-red-500">*</span>
                        </FormLabel>
                        <div className="flex-1">
                          <FormControl>
                            <SelectCustom
                              options={listType.map((type) => ({
                                label: type.name,
                                value: type.id,
                              }))}
                              value={field.value}
                              onChange={(value) => {
                                field.onChange(value);
                              }}
                              placeholder="Chọn loại báo cáo"
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="year"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-4">
                        <FormLabel className="font-bold text-right min-w-[100px]">
                          Năm <span className="text-red-500">*</span>
                        </FormLabel>
                        <div className="flex-1">
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Chọn năm" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {yearsList.map((year) => (
                                <SelectItem key={year.value} value={year.value}>
                                  {year.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row 2: Tuần, Từ ngày, Đến ngày */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="week"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-4">
                        <FormLabel className="font-bold text-right min-w-[100px]">
                          {getTitleTypeReport(watchedType)}{" "}
                          <span className="text-red-500">*</span>
                        </FormLabel>
                        <div className="flex-1">
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                            key={`${watchedType}-${watchedWeek}`}
                            disabled={
                              watchedType === "FIRST_6_MONTH" ||
                              watchedType === "LAST_6_MONTH" ||
                              watchedType === "YEAR"
                            }
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue
                                  placeholder={`Chọn ${getTitleTypeReport(watchedType).toLowerCase()}`}
                                />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {periodsList.map((period) => (
                                <SelectItem
                                  key={period.value}
                                  value={period.value}
                                >
                                  {period.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="startDate"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-4">
                        <FormLabel className="font-bold text-right min-w-[100px]">
                          Từ ngày
                        </FormLabel>
                        <div className="flex-1">
                          <FormControl>
                            <Input
                              type="text"
                              disabled
                              placeholder="Tự động tính"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="endDate"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-4">
                        <FormLabel className="font-bold text-right min-w-[100px]">
                          Đến ngày
                        </FormLabel>
                        <div className="flex-1">
                          <FormControl>
                            <Input
                              type="text"
                              disabled
                              placeholder="Tự động tính"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row 3: Đơn vị, Chức danh, Người ký */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="organization"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-4">
                        <FormLabel className="font-bold text-right min-w-[100px]">
                          Đơn vị
                        </FormLabel>
                        <div className="flex-1">
                          <FormControl>
                            <Input
                              type="text"
                              disabled
                              placeholder="Đơn vị hiện tại"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="position"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-4">
                        <FormLabel className="font-bold text-right min-w-[100px]">
                          Chức danh
                        </FormLabel>
                        <div className="flex-1">
                          <FormControl>
                            <SelectCustom
                              options={
                                listCategory
                                  ? listCategory.map((item: any) => ({
                                      label: item.name,
                                      value: String(item.id),
                                    }))
                                  : []
                              }
                              value={field.value ? String(field.value) : ""}
                              onChange={(value) => {
                                field.onChange(value);
                              }}
                              placeholder="Chọn chức danh"
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="signer"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-4">
                        <FormLabel className="font-bold text-right min-w-[100px]">
                          Người ký <span className="text-red-500">*</span>
                        </FormLabel>
                        <div className="flex-1">
                          <FormControl>
                            <SelectCustom
                              options={
                                listSigner?.objList
                                  ? listSigner.objList.map((item: any) => ({
                                      label: item.fullName,
                                      value: String(item.id),
                                    }))
                                  : []
                              }
                              value={field.value ? String(field.value) : ""}
                              onChange={(value) => {
                                field.onChange(value);
                              }}
                              placeholder="Chọn người ký"
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row 4: Nơi nhận, Số xác nhận */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="recipients"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-4">
                        <FormLabel className="font-bold text-right min-w-[100px]">
                          Nơi nhận
                        </FormLabel>
                        <div className="flex-1">
                          <FormControl>
                            <SelectCustom
                              options={[
                                { label: "Không", value: "0" },
                                { label: "Mặc định", value: "1" },
                              ]}
                              value={field.value}
                              onChange={field.onChange}
                              placeholder="Chọn nơi nhận"
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="confirmNumber"
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-4">
                        <FormLabel className="font-bold text-right min-w-[100px]">
                          Số xác nhận
                        </FormLabel>
                        <div className="flex-1">
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              placeholder="Nhập số xác nhận"
                              onKeyPress={keyPressNumbers}
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </div>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row 5: Các textarea cho nội dung */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="workDone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">
                          Những việc đã thực hiện được
                        </FormLabel>
                        <FormControl>
                          <TextEditor
                            value={field.value || ""}
                            onChange={field.onChange}
                            placeholder="Nhập những việc đã thực hiện được..."
                            height="200px"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="expected"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">
                          Dự kiến kế hoạch sắp tới
                        </FormLabel>
                        <FormControl>
                          <TextEditor
                            value={field.value || ""}
                            onChange={field.onChange}
                            placeholder="Nhập dự kiến kế hoạch sắp tới..."
                            height="200px"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="requestAttach"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">
                          Kiến nghị kèm theo
                        </FormLabel>
                        <FormControl>
                          <TextEditor
                            value={field.value || ""}
                            onChange={field.onChange}
                            placeholder="Nhập kiến nghị kèm theo..."
                            height="200px"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Row 6: File upload */}
                <div className="space-y-4 !mt-14">
                  <Label className="text-right font-bold">
                    Danh sách tệp đính kèm
                  </Label>

                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        className="bg-blue-600 hover:bg-blue-700 hover:text-white text-white"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        Chọn tệp
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept="*"
                        className="hidden"
                        onChange={handleFileUpload}
                      />
                    </div>

                    {/* File list */}
                    {selectedFiles.length > 0 && (
                      <div className="space-y-2 mt-4">
                        {selectedFiles.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-3 border rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <span className=" flex items-center gap-2 text-sm">
                                <img
                                  src={getAssetIcon(file.name)}
                                  alt="file icon"
                                  className="w-4 h-4"
                                />{" "}
                                {file.name} ({getFileSizeString(file.size)})
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              {isView(file) && (
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleViewFile(file)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              )}
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="text-red-500"
                                onClick={() => handleRemoveFile(index, file)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </Form>
          )}
        </CardContent>
      </Card>
      <ConfirmDeleteDialog
        isOpen={isShowRemoveFileDialog}
        onOpenChange={setIsShowRemoveFileDialog}
        onConfirm={removeFileToDB}
        title="Xóa tệp đính kèm"
        description="Bạn có muốn xóa tệp đính kèm này không"
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  );
}
