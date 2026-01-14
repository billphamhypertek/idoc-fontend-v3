"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Calendar, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  format,
  getWeek,
  startOfWeek,
  endOfWeek,
  addWeeks,
  subWeeks,
} from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import CalendarContent from "./calendar-content";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Upload } from "lucide-react";
import ExportCalendarModal from "./export-modal";
import { useCheckPermissionBan } from "@/hooks/data/vehicle.data";
import { CalendarService } from "@/services/calendar.service";
import { ToastUtils } from "@/utils/toast.utils";
import { useQuery } from "@tanstack/react-query";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { handleError } from "@/utils/common.utils";
import dayjs from "dayjs";

// Interface cho attachment
interface AttachmentWeek {
  id: string;
  displayName: string;
  name: string;
  encrypt?: boolean;
}

export default function CalendarBusinessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState<Date>(today);

  const tabFromUrl = searchParams?.get("tab");
  const [activeTab, setActiveTab] = useState<string>(tabFromUrl || "room");
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [confirmMessage, setConfirmMessage] = useState("");

  const getUserInfo = (): string => localStorage.getItem("userInfo") || "{}";
  const [isUnitPermissionForFile, setIsUnitPermissionForFile] = useState(false);
  const [isTopLevelPermissionForFile, setIsTopLevelPermissionForFile] =
    useState(false);
  const [isBanAccount, setIsBanAccount] = useState(false);
  const [isPermissionBan, setIsPermissionBan] = useState(false);
  const [attCalWeek, setAttCalWeek] = useState<AttachmentWeek | null>(null);
  const { data: permissionBan } = useCheckPermissionBan();

  useEffect(() => {
    if (tabFromUrl && (tabFromUrl === "room" || tabFromUrl === "org")) {
      setActiveTab(tabFromUrl);
    }
  }, [searchParams]);

  useEffect(() => {
    const userAuthority = JSON.parse(getUserInfo()).authoritys || [];
    const checkUnitPermissionForFile = !!userAuthority.find(
      (authority: any) => authority?.authority === "APPROVE_UNIT_LEVEL_CALENDAR"
    );
    const checkTopLevelPermissionForFile = !!userAuthority.find(
      (authority: any) => authority?.authority === "APPROVE_TOP_LEVEL_CALENDAR"
    );
    setIsUnitPermissionForFile(checkUnitPermissionForFile);
    setIsTopLevelPermissionForFile(checkTopLevelPermissionForFile);
  }, [getUserInfo]);

  useEffect(() => {
    const userOrgName = JSON.parse(getUserInfo()).orgModel.orgTypeModel.name;
    const checkBanAccount = userOrgName === "Ban";
    setIsBanAccount(checkBanAccount);
    setIsPermissionBan(permissionBan?.isPermission ?? false);
  }, [getUserInfo, permissionBan]);

  const getWeekOfYear = (date: Date) => {
    return getWeek(date, { weekStartsOn: 1, firstWeekContainsDate: 4 });
  };

  const [currentWeek, setCurrentWeek] = useState(getWeekOfYear(today));
  const [currentYear, setCurrentYear] = useState(today.getFullYear());

  // Use useQuery to fetch calendar data
  const {
    data: calendarData = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["calendar-business", activeTab, currentWeek, currentYear],
    queryFn: async () => {
      const orgType = activeTab === "room" ? 1 : 2;
      const response = await CalendarService.getCalendarBusinessByWeek(
        orgType,
        currentWeek,
        currentYear
      );
      return response || [];
    },
    enabled: true,
  });

  // Cập nhật attCalWeek từ calendarData
  useEffect(() => {
    if (calendarData?.attCalWeek) {
      setAttCalWeek(calendarData.attCalWeek);
    } else {
      setAttCalWeek(null);
    }
  }, [calendarData]);

  const getWeekDates = (week: number, year: Date) => {
    const startDate = startOfWeek(year, { weekStartsOn: 1 });
    const endDate = endOfWeek(year, { weekStartsOn: 1 });
    return { startDate, endDate };
  };

  const { startDate, endDate } = getWeekDates(currentWeek, selectedDate);

  const formatDate = (date: Date) => {
    return format(date, "dd/MM/yyyy", { locale: vi });
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
      const weekOfYear = getWeekOfYear(date);
      setCurrentWeek(weekOfYear);
      setCurrentYear(date.getFullYear());
    }
  };

  const handlePreviousWeek = () => {
    const newDate = subWeeks(selectedDate, 1);
    setSelectedDate(newDate);
    setCurrentWeek(getWeekOfYear(newDate));
    setCurrentYear(newDate.getFullYear());
  };

  const handleNextWeek = () => {
    const newDate = addWeeks(selectedDate, 1);
    setSelectedDate(newDate);
    setCurrentWeek(getWeekOfYear(newDate));
    setCurrentYear(newDate.getFullYear());
  };

  const handleExportCalendar = () => {};

  const handleRegisterCalendar = () => {
    const tabType = activeTab === "room" ? "room" : "org";
    router.push(`/calendar/business/add?tab=${tabType}`);
  };

  const handleAddEvent = (orgType: number, selectedDate?: Date) => {
    const tabType = orgType === 1 ? "room" : "org";
    const dateParam = selectedDate
      ? `&date=${dayjs(selectedDate).format("YYYY-MM-DD")}`
      : "";
    router.push(`/calendar/business/add?tab=${tabType}${dateParam}`);
  };

  const handleEditEvent = (eventId: number, orgType: number) => {
    const tabType = orgType === 1 ? "room" : "org";
    router.push(`/calendar/business/update/${eventId}?tab=${tabType}`);
  };

  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab);
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("tab", newTab);
    router.replace(`/calendar/business?${params.toString()}`, {
      scroll: false,
    });
  };

  const doAddAttCalWeek = async (file: File, callback?: () => void) => {
    try {
      const files = [file];
      const response = await CalendarService.addAttachment({
        id: 0,
        type: 3,
        files: files,
        week: currentWeek,
        year: currentYear,
      });

      // Lấy attachment đầu tiên từ response
      const [newAttachment] = response;
      setAttCalWeek(newAttachment);

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      callback?.();
    } catch (error) {
      ToastUtils.coLoiXayRaKhiThemTepLichTuan();
    }
  };

  const doDeleteAttachment = async (attachmentId: number) => {
    try {
      await CalendarService.doDeleteAttachment(attachmentId);
      setAttCalWeek(null);
      ToastUtils.xoaTepLichTuanThanhCong();
    } catch (error) {
      ToastUtils.coLoiXayRaKhiXoaTepLichTuan();
    }
  };

  // Logic chọn file - giống Angular doSelectFile
  const selectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (attCalWeek) {
      // Có tệp cũ - hiển thị confirm thay thế
      const message = `Bạn có chắc chắn muốn thay tệp ${attCalWeek.displayName} bằng tệp ${file.name}?`;
      setConfirmMessage(message);
      setPendingFile(file);
      setIsConfirmDialogOpen(true);
    } else {
      // Chưa có tệp - hiển thị confirm thêm mới
      const message = `Bạn muốn thêm mới tệp ${file.name}`;
      setConfirmMessage(message);
      setPendingFile(file);
      setIsConfirmDialogOpen(true);
    }
  };

  // Xử lý confirm dialog
  const handleConfirmDialog = async () => {
    if (!pendingFile) return;

    if (attCalWeek) {
      // Xóa tệp cũ trước khi thêm tệp mới
      try {
        await doDeleteAttachment(Number(attCalWeek.id));
        await doAddAttCalWeek(pendingFile, () => {
          ToastUtils.capNhatTepThanhCong();
        });
      } catch (error) {
        handleError(error);
      }
    } else {
      // Thêm tệp mới
      await doAddAttCalWeek(pendingFile, () => {
        ToastUtils.themMoiTepThanhCong();
      });
    }

    setIsConfirmDialogOpen(false);
    setPendingFile(null);
  };

  const handleUploadWeeklySchedule = () => {
    fileInputRef.current?.click();
  };

  const tabs = [
    {
      id: "room",
      title: "Lịch ban",
    },
    {
      id: "org",
      title: "Lịch đơn vị",
    },
  ];

  return (
    <div className="space-y-4 px-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        hidden
        onChange={selectFile}
        accept=".doc,.docx,.pdf,.xls,.xlsx,.ppt,.pptx"
      />

      <div className="flex justify-between items-center mb-4">
        <BreadcrumbNavigation
          items={[{ href: "/calendar", label: "Lịch" }]}
          currentPage="Lịch công tác"
          showHome={false}
        />

        <div className="flex gap-2">
          <Button
            onClick={() => setIsOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Xuất lịch
          </Button>
          {activeTab === "room" && isPermissionBan && (
            <Button
              onClick={handleRegisterCalendar}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm mới lịch ban
            </Button>
          )}
          {activeTab === "organization" && !isBanAccount && (
            <Button
              onClick={handleRegisterCalendar}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Đăng ký lịch đơn vị
            </Button>
          )}
          {((isTopLevelPermissionForFile &&
            activeTab === "room" &&
            isBanAccount) ||
            (isUnitPermissionForFile &&
              activeTab === "organization" &&
              !isBanAccount)) && (
            <Button
              onClick={handleUploadWeeklySchedule}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Upload className="w-4 h-4 mr-2" />
              {attCalWeek ? "Cập nhật tệp lịch tuần" : "Thêm tệp lịch tuần"}
            </Button>
          )}
        </div>
      </div>

      <div className="mb-2 space-y-2">
        <div className="flex items-center justify-between">
          <div className="text-base font-bold text-gray-600">
            Xem từ ngày {formatDate(startDate)} đến ngày {formatDate(endDate)}
          </div>
          <div className="flex items-center justify-center space-x-4">
            <span className="text-base font-bold text-gray-600">
              Thời điểm theo lịch:
            </span>

            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[200px] justify-between text-left font-normal",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  {selectedDate
                    ? format(selectedDate, "dd/MM/yyyy", { locale: vi })
                    : "dd/mm/yyyy"}
                  <Calendar className="mr-2 h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <CalendarComponent
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleDateSelect}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <div className="flex items-center justify-start space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousWeek}
            className="p-2 rounded-full"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>

          <div className="text-base font-bold text-gray-600">
            Tuần {currentWeek}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextWeek}
            className="p-2 rounded-full"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className="w-full"
      >
        <TabsList className="flex w-fit bg-transparent justify-start gap-2 bg-gray-100 rounded-lg p-1">
          {tabs.map((tab) => (
            <TabsTrigger
              key={tab.id}
              value={tab.id}
              className={`whitespace-nowrap data-[state=active]:text-blue-600 px-3 py-1 text-xs rounded-md transition ${activeTab === tab.id ? "font-bold" : "font-medium"}`}
            >
              {tab.title}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="room" className="mt-4">
          <CalendarContent
            selectedDate={selectedDate}
            orgType={1}
            calendarData={calendarData}
            isLoading={isLoading}
            onAddEvent={handleAddEvent}
            onEditEvent={handleEditEvent}
            onRefreshData={refetch}
          />
        </TabsContent>

        <TabsContent value="org" className="mt-4">
          <CalendarContent
            selectedDate={selectedDate}
            orgType={2}
            calendarData={calendarData}
            isLoading={isLoading}
            onAddEvent={handleAddEvent}
            onEditEvent={handleEditEvent}
            onRefreshData={refetch}
          />
        </TabsContent>
      </Tabs>

      <ExportCalendarModal
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        onClose={() => setIsOpen(false)}
        currentTab={activeTab}
        selectedDate={selectedDate}
      />

      {/* Confirm Dialog */}
      <AlertDialog
        open={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận</AlertDialogTitle>
            <AlertDialogDescription>{confirmMessage}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Hủy</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDialog}>
              Xác nhận
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
