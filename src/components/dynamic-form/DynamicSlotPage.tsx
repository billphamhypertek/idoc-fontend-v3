"use client";

import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import { Button } from "@/components/ui/button";
import { CustomDatePicker } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table } from "@/components/ui/table";
import { WeekDaySchedule } from "@/definitions";
import { DATE_FORMAT } from "@/definitions/constants/common.constant";
import { STORAGE_KEYS } from "@/definitions/constants/storageKey.constant";
import { useGetDynamicFormQuery } from "@/hooks/data/form-dynamic.data";
import {
  useGetValueDynamicCalendar,
  useGetValueDynamicDetail,
} from "@/hooks/data/value-dynamic.data";
import {
  formatDateYMD,
  getWeekOfYear,
  getWeekYear,
  isToday,
} from "@/utils/datetime.utils";
import { findIdByRouterPathSafe } from "@/utils/common.utils";
import { format } from "date-fns";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react";
import { useParams, usePathname } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

export default function DynamicSlotPage() {
  const params = useParams();
  const workflowId = params?.typeId as string;
  const pathname = usePathname();
  const [selectedSlotId, setSelectedSlotId] = useState<number | undefined>(
    undefined
  );
  const [selectedFormIdForList, setSelectedFormIdForList] = useState<
    number | null
  >(null);

  // Get parent module name based on moduleId
  const modules = useMemo(() => {
    if (typeof window === "undefined") return [];
    const allModules = localStorage.getItem(STORAGE_KEYS.MODULES);
    return allModules ? JSON.parse(allModules) : [];
  }, []);

  const moduleId = useMemo(() => {
    if (typeof window === "undefined") return null;
    return findIdByRouterPathSafe(modules, pathname || "");
  }, [modules, pathname]);
  const breadcrumbLabel = useMemo(() => {
    const findModuleById = (moduleList: any[], id: number): any => {
      for (const m of moduleList) {
        if (m.id === id) return m;
        if (m.subModule && m.subModule.length > 0) {
          const found = findModuleById(m.subModule, id);
          if (found) return found;
        }
      }
      return null;
    };

    if (!moduleId) return "Quản lý workflow";
    const currentModule = findModuleById(modules, moduleId);
    if (currentModule?.parentId) {
      const parentModule = findModuleById(modules, currentModule.parentId);
      return parentModule?.name?.trim() || "Quản lý workflow";
    }
    return currentModule?.name?.trim() || "Quản lý workflow";
  }, [modules, moduleId]);

  // Get dynamic form data
  const { data: dynamicForm, isLoading: isLoadingForm } =
    useGetDynamicFormQuery(Number(workflowId));
  const formId = dynamicForm?.data?.id;

  // Get forms list
  const forms = useMemo(() => {
    return dynamicForm?.data || [];
  }, [dynamicForm?.data]);

  // Auto-select first form if none selected
  useEffect(() => {
    if (forms.length > 0 && selectedFormIdForList === null) {
      setSelectedFormIdForList(forms[0].id);
    }
  }, [forms, selectedFormIdForList]);

  // Current formId for API calls
  const currentFormId = selectedFormIdForList || formId;

  const { data: selectedSlot } = useGetValueDynamicDetail(selectedSlotId || 0);
  console.log(selectedSlot);
  const [expandedSlots, setExpandedSlots] = useState<{
    [key: string]: boolean;
  }>({});
  const toggleSlotExpansion = (slotKey: string) => {
    setExpandedSlots((prev) => ({
      ...prev,
      [slotKey]: !prev[slotKey],
    }));
  };
  const today = new Date();
  // selectedDate: dd/MM/yyyy (kept as string to match existing formatting & input binding)
  const [selectedDate, setSelectedDate] = useState(format(today, DATE_FORMAT));
  const [currentWeek, setCurrentWeek] = useState(getWeekOfYear(today));
  const [currentYear, setCurrentYear] = useState(getWeekYear(today));
  const [attCalWeek, setAttCalWeek] = useState<any>(null);
  const [fields, setFields] = useState<any[]>([]);

  const { data: weekData, isLoading } = useGetValueDynamicCalendar(
    currentFormId || 0,
    currentWeek,
    currentYear,
    !!currentFormId && !isLoadingForm
  );

  // Helpers to parse/format dd/MM/yyyy
  const parseDate = (value: string) => {
    const [d, m, y] = value.split("/").map(Number);
    return new Date(y, m - 1, d);
  };
  const formatDate = (date: Date) => format(date, DATE_FORMAT);

  // Compute range Monday -> Sunday for a given date (similar to Angular week focus)
  const getWeekRangeFromDate = (date: Date) => {
    const day = date.getDay(); // 0 (Sun) .. 6 (Sat)
    const mondayOffset = day === 0 ? -6 : 1 - day; // shift to Monday
    const monday = new Date(date);
    monday.setDate(monday.getDate() + mondayOffset);
    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    return { monday, sunday };
  };

  // Navigation: move selected date by +/- 7 days then recompute week/year
  const shiftWeek = (deltaWeeks: number) => {
    const base = parseDate(selectedDate);
    base.setDate(base.getDate() + deltaWeeks * 7);
    setSelectedDate(formatDate(base));
    setCurrentWeek(getWeekOfYear(base));
    setCurrentYear(getWeekYear(base));
  };

  const handlePreviousWeek = () => shiftWeek(-1);
  const handleNextWeek = () => shiftWeek(1);

  const handleDateChange = (value: string) => {
    if (!value) return;
    const [y, m, d] = value.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    setSelectedDate(format(date, DATE_FORMAT));
    setCurrentWeek(getWeekOfYear(date));
    setCurrentYear(getWeekYear(date));
  };

  useEffect(() => {
    if (weekData?.data) {
      setAttCalWeek(weekData.attCalWeek);
      setFields(weekData.data.fields || []);
    }
  }, [weekData]);
  const weekDays: WeekDaySchedule[] =
    weekData?.data?.calendar?.map((day: any) => {
      const formattedDate = format(day.date, "dd/MM/yyyy");
      return {
        day: day.dayName,
        date: formattedDate,
        isToday: isToday(formattedDate),
        morning: day.morning || [],
        afternoon: day.afternoon || [],
      };
    }) || [];

  // Derive display info from current selectedDate (focus of week)
  const { weekRangeText, displayWeekNumber, displayCurrentDate } =
    useMemo(() => {
      const dateObj = parseDate(selectedDate);
      const { monday, sunday } = getWeekRangeFromDate(dateObj);
      const formatRange = (d: Date) => format(d, "dd/MM/yyyy");
      const months = [
        "Tháng 1",
        "Tháng 2",
        "Tháng 3",
        "Tháng 4",
        "Tháng 5",
        "Tháng 6",
        "Tháng 7",
        "Tháng 8",
        "Tháng 9",
        "Tháng 10",
        "Tháng 11",
        "Tháng 12",
      ];
      const displayCurrentDate = `${dateObj.getDate()} ${months[dateObj.getMonth()]}, ${dateObj.getFullYear()}`;
      // Angular template displays selectedWeek - 1, so mirror that here
      const uiWeekNumber = currentWeek > 0 ? currentWeek - 1 : currentWeek;
      return {
        weekRangeText: `Xem từ ngày: ${formatRange(monday)} - ${formatRange(sunday)}`,
        displayWeekNumber: uiWeekNumber,
        displayCurrentDate,
      };
    }, [selectedDate, currentWeek]);

  const renderSingleSlot = (slot: any, isCompact: boolean = false) => {
    const isPlanned = slot?.status.toLowerCase() === "dự kiến";
    return (
      <div
        key={slot.id || Math.random()}
        className={`
        rounded-lg border p-3 cursor-pointer transition-all
        ${
          isPlanned
            ? "bg-purple-50 border-purple-300 hover:shadow-purple-200"
            : "bg-blue-50 border-blue-200 hover:shadow-md"
        }
      `}
        onClick={() => slot.id && setSelectedSlotId(slot.id)}
      >
        <>
          {fields.map((field) => {
            const value = slot[field.name];
            if (value !== undefined && value !== null && value !== "") {
              return (
                <div key={field.name} className="text-xs text-gray-700 mb-1">
                  <span className="font-bold">{field.label}:</span> {value}
                </div>
              );
            }
            return null;
          })}
          {slot?.status && (
            <span className="ml-0 text-xs font-bold text-gray-700">
              Trạng thái: {slot.status}
            </span>
          )}
        </>
        {fields.length === 0 && (
          <div className="text-xs text-gray-500">Không có thông tin</div>
        )}
      </div>
    );
  };

  const renderScheduleSlot = (slots: any[]) => {
    if (!slots || slots.length === 0)
      return <div className="text-center text-gray-500 py-4">Chưa có lịch</div>;

    const slotKey = slots.map((s, idx) => s.id || idx).join("-");
    const isExpanded = expandedSlots[slotKey] || false;
    const visibleSlots = isExpanded ? slots : slots.slice(0, 2);
    const hasMore = slots.length > 2;

    return (
      <div className="space-y-2 p-2">
        {visibleSlots.map((slot, idx) => renderSingleSlot(slot))}
        {hasMore && (
          <Button variant="link" onClick={() => toggleSlotExpansion(slotKey)}>
            {isExpanded ? "Thu gọn" : `Xem thêm ${slots.length - 2}`}
            {isExpanded ? <ChevronUp /> : <ChevronDown />}
          </Button>
        )}
      </div>
    );
  };

  const columns = [
    {
      header: "THỨ/NGÀY",
      accessor: (day: WeekDaySchedule) => (
        <div className="text-center">
          <div className="font-bold">{day.day}</div>
          <div>{day.date}</div>
          {day.isToday && <div className="text-red-600">(Hôm nay)</div>}
        </div>
      ),
      className: "w-1/6 border-r",
    },
    {
      header: "SÁNG",
      accessor: (day: WeekDaySchedule) => renderScheduleSlot(day.morning),
      className: "w-5/12 border-r",
    },
    {
      header: "CHIỀU",
      accessor: (day: WeekDaySchedule) => renderScheduleSlot(day.afternoon),
      className: "w-5/12",
    },
  ];

  return (
    <div className="p-4">
      <BreadcrumbNavigation
        items={[
          {
            label: breadcrumbLabel,
          },
        ]}
        currentPage="Lịch đăng ký"
        showHome={false}
      />

      <div className="flex justify-between items-center my-4">
        <div className="flex items-center gap-3">
          <div className="whitespace-pre-line">
            <div className="text-lg font-bold text-gray-500 mt-1">
              {weekRangeText}
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handlePreviousWeek}
                className="h-4 w-4 p-0 bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="text-sm font-bold text-gray-900">
                Tuần {displayWeekNumber} - {displayCurrentDate}
              </div>
              <Button
                onClick={handleNextWeek}
                className="h-4 w-4 p-0 bg-blue-600 hover:bg-blue-700 text-white border-blue-600"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="flex gap-2 items-center">
          {forms.length > 1 && (
            <select
              value={selectedFormIdForList || ""}
              onChange={(e) => {
                setSelectedFormIdForList(Number(e.target.value));
              }}
              className="h-9 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {forms.map((form: any) => (
                <option key={form.id} value={form.id}>
                  {form.name || `Form ${form.id}`}
                </option>
              ))}
            </select>
          )}
          <CustomDatePicker
            selected={parseDate(selectedDate)}
            onChange={(date) => handleDateChange(formatDateYMD(date))}
            placeholder="Chọn ngày"
          />
        </div>
      </div>

      <Table
        sortable={true}
        columns={columns}
        loading={isLoading}
        dataSource={weekDays}
        showPagination={false}
        className="compact-table"
      />

      <Dialog
        open={!!selectedSlotId}
        onOpenChange={() => setSelectedSlotId(undefined)}
      >
        <DialogContent className="w-[50%] max-w-[65%] max-h-[85vh] overflow-y-auto">
          <DialogHeader className="pb-4 border-b border-gray-100">
            <DialogTitle className="text-lg font-bold text-gray-900">
              Thông tin chi tiết
            </DialogTitle>
          </DialogHeader>
          {selectedSlot && (
            <div className="space-y-2">
              <div className="bg-gray-50 rounded-lg p-3">
                <h3 className="text-sm font-semibold text-gray-800 mb-3 flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                  Chi tiết thông tin
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {fields.map((field) => {
                    const value = selectedSlot.data?.data?.[field.name];
                    if (value !== undefined && value !== null && value !== "") {
                      return (
                        <div
                          key={field.name}
                          className="flex justify-between items-start"
                        >
                          <span className="text-xs font-medium text-gray-600 w-40">
                            {field.label}:
                          </span>
                          <span className="text-xs text-gray-900 flex-1 text-right">
                            {value}
                          </span>
                        </div>
                      );
                    }
                    return null;
                  })}
                  {selectedSlot.data?.data?.status && (
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-medium text-gray-600 w-40">
                        Trạng thái:
                      </span>
                      <span className="text-xs text-gray-900 flex-1 text-right">
                        {selectedSlot.data?.data?.status}
                      </span>
                    </div>
                  )}
                  {fields.length === 0 && (
                    <div className="text-xs text-gray-500">
                      Không có thông tin
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => setSelectedSlotId(undefined)}
            >
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
