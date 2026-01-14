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
import { Input } from "@/components/ui/input";
import { Table } from "@/components/ui/table";
import {
  Attachment,
  ScheduleSlot,
  WeekDay,
  WeekDaySchedule,
} from "@/definitions";
import { DATE_FORMAT, TAB } from "@/definitions/constants/common.constant";
import {
  useGetVehicleCalendarByWeek,
  useGetVehicleDetailSlot,
} from "@/hooks/data/vehicle.data";
import {
  formatDateYMD,
  getWeekOfYear,
  isToday,
  parseDateStringYMD,
} from "@/utils/datetime.utils";
import { format } from "date-fns";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Download,
  Eye,
} from "lucide-react";
import React, { useEffect, useMemo, useState } from "react";

type TabType = (typeof TAB)[keyof typeof TAB];

export default function VehicleSchedulePage() {
  const [activeTab, setActiveTab] = useState<TabType>(TAB.DEPARTMENT);

  const [selectedSlotId, setSelectedSlotId] = useState<number | undefined>(
    undefined
  );
  const { data: selectedSlot } = useGetVehicleDetailSlot(selectedSlotId);
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
  const [currentYear, setCurrentYear] = useState(today.getFullYear());
  const [attCalWeek, setAttCalWeek] = useState<any>(null);

  const { data: weekData, isLoading } = useGetVehicleCalendarByWeek(
    activeTab,
    currentWeek,
    currentYear
  );

  const tabs = [
    { id: "DEPARTMENT", label: "Xe của bạn" },
    { id: "ORG", label: "Xe của đơn vị" },
  ] as const;

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
    setCurrentYear(base.getFullYear());
  };

  const handlePreviousWeek = () => shiftWeek(-1);
  const handleNextWeek = () => shiftWeek(1);

  const handleDateChange = (value: string) => {
    if (!value) return;
    const [y, m, d] = value.split("-").map(Number);
    const date = new Date(y, m - 1, d);
    setSelectedDate(format(date, DATE_FORMAT));
    setCurrentWeek(getWeekOfYear(date));
    setCurrentYear(date.getFullYear());
  };

  useEffect(() => {
    if (weekData) {
      setAttCalWeek(weekData.attCalWeek);
    }
  }, [weekData]);

  const weekDays: WeekDaySchedule[] =
    weekData?.objList.map((day: WeekDay) => ({
      day: day.dateStr,
      date: format(new Date(day.date), "dd/MM/yyyy"),
      isToday: isToday(format(new Date(day.date), "dd/MM/yyyy")),
      morning: day.amList || [],
      afternoon: day.pmList || [],
    })) || [];

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

  const renderSingleSlot = (slot: ScheduleSlot, isCompact: boolean = false) => {
    const statusColor =
      slot.status === "HOAN_THANH"
        ? "bg-green-100 text-green-800"
        : "bg-yellow-100 text-yellow-800";

    return (
      <div
        key={slot.id}
        className={`rounded-lg border p-3 cursor-pointer hover:shadow-md transition-all ${statusColor}`}
        onClick={() => setSelectedSlotId(slot.id)}
      >
        <div className="text-sm font-medium">{slot.orgName || "Không có"}</div>
        <div className="text-xs text-gray-700">
          <span className="font-bold">Lý do:</span> {slot.reason || "Không có"}
        </div>
        <div className="text-xs text-gray-700">
          <span className="font-bold">Nơi đi:</span>{" "}
          {slot.pickUpLocation || "Không có"}
        </div>
        <div className="text-xs text-gray-700">
          <span className="font-bold">Nơi đến:</span>{" "}
          {slot.dropOffLocation || "Không có"}
        </div>
        <div className="text-xs font-bold text-red-600">
          {slot.startTime} - {slot.endTime} (
          {format(new Date(slot.startDate), "dd/MM/yyyy")} -{" "}
          {format(new Date(slot.endDate), "dd/MM/yyyy")})
        </div>
        <div className="text-xs font-bold text-blue-600">
          {slot.statusName || "Không có"}
        </div>
        <div className="text-xs">
          <span className="font-bold">Người phụ trách:</span>{" "}
          {slot.personEnter || "Không có"}
        </div>
        <div className="text-xs">
          <span className="font-bold">Tài xế:</span>{" "}
          {slot.driverName || "Không có"}
        </div>
        <div className="text-xs">
          <span className="font-bold">Số liên hệ tài xế:</span>{" "}
          {slot.driverPhone || "Không có"}
        </div>
        <div className="text-xs">
          <span className="font-bold">Biển số:</span>{" "}
          {slot.licensePlate || "Không có"}
        </div>
        <div className="text-xs">
          <span className="font-bold">Ghi chú:</span> {slot.note || "Không có"}
        </div>
        {slot.attachments && slot.attachments.length > 0 && (
          <div className="mt-2">
            <span className="text-xs font-bold">Tệp đính kèm:</span>
            <ul className="list-disc ml-4">
              {slot.attachments.map((file: Attachment, idx: number) => (
                <li key={idx} className="text-xs">
                  <span>{file.name}</span>
                  <Eye className="w-4 h-4 inline mx-1" /> {/* View */}
                  <Download className="w-4 h-4 inline" /> {/* Download */}
                </li>
              ))}
            </ul>
          </div>
        )}
        {attCalWeek && (
          <div className="mt-2 text-xs">
            <span className="font-bold">Tệp lịch tuần:</span>{" "}
            {attCalWeek.displayName}
            <Eye className="w-4 h-4 inline mx-1" />
          </div>
        )}
      </div>
    );
  };

  const renderScheduleSlot = (slots: ScheduleSlot[]) => {
    if (slots.length === 0)
      return <div className="text-center text-gray-500 py-4">Chưa có lịch</div>;

    const slotKey = slots.map((s) => s.id).join("-");
    const isExpanded = expandedSlots[slotKey] || false;
    const visibleSlots = isExpanded ? slots : slots.slice(0, 2);
    const hasMore = slots.length > 2;

    return (
      <div className="space-y-2 p-2">
        {visibleSlots.map((slot) => renderSingleSlot(slot))}
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
            href: "/manage-vehicle/register",
            label: "Quản lý xe",
          },
        ]}
        currentPage="Đăng ký xe"
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
          <CustomDatePicker
            selected={parseDate(selectedDate)}
            onChange={(date) => handleDateChange(formatDateYMD(date))}
            placeholder="Chọn ngày"
          />
        </div>
      </div>

      <nav className="flex gap-6 mb-4">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as "DEPARTMENT" | "ORG")}
            className={`relative pb-1.5 px-2 text-sm font-medium transition-all duration-200 ${
              activeTab === tab.id
                ? "text-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 rounded-full"></div>
            )}
          </button>
        ))}
      </nav>

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
              Thông tin nội dung xin xe
            </DialogTitle>
          </DialogHeader>
          {selectedSlot && (
            <div className="space-y-2">
              {/* Thông tin cơ bản */}
              <div className="bg-gray-50 rounded-lg p-2">
                <h3 className="text-xs font-semibold text-gray-800 mb-2 flex items-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                  Thông tin cơ bản
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-medium text-gray-600 w-32">
                      Tên cơ quan đơn vị:
                    </span>
                    <span className="text-xs text-gray-900 flex-1 text-right">
                      {selectedSlot.orgName || "Không có"}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-medium text-gray-600 w-32">
                      Lý do sử dụng xe:
                    </span>
                    <span className="text-xs text-gray-900 flex-1 text-right">
                      {selectedSlot.reason || "Không có"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-600 w-32">
                      Loại xe:
                    </span>
                    <span className="text-xs text-gray-900">
                      {selectedSlot.type || "Không có"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-600 w-32">
                      Số người đi:
                    </span>
                    <span className="text-xs text-gray-900">
                      {selectedSlot.passengerQuantity || "Không có"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Thông tin thời gian */}
              <div className="bg-blue-50 rounded-lg p-3">
                <h3 className="text-xs font-semibold text-gray-800 mb-2 flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  Thời gian và địa điểm
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-600 w-32">
                      Thời gian:
                    </span>
                    <span className="text-xs text-gray-900">
                      {format(new Date(selectedSlot.startDate), "dd/MM/yyyy")} -{" "}
                      {format(new Date(selectedSlot.endDate), "dd/MM/yyyy")}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-medium text-gray-600 w-32">
                      Địa điểm xe đón:
                    </span>
                    <span className="text-xs text-gray-900 flex-1 text-right">
                      {selectedSlot.pickUpLocation || "Không có"}
                    </span>
                  </div>
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-medium text-gray-600 w-32">
                      Địa điểm xe đến:
                    </span>
                    <span className="text-xs text-gray-900 flex-1 text-right">
                      {selectedSlot.destination || "Không có"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Thông tin liên hệ */}
              <div className="bg-orange-50 rounded-lg p-3">
                <h3 className="text-xs font-semibold text-gray-800 mb-2 flex items-center">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
                  Thông tin liên hệ
                </h3>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-medium text-gray-600 w-32">
                      Người phụ trách chuyến công tác:
                    </span>
                    <span className="text-xs text-gray-900 flex-1 text-right">
                      {selectedSlot.personEnter || "Không có"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-600 w-32">
                      Tài xế:
                    </span>
                    <span className="text-xs text-gray-900">
                      {selectedSlot.driverName || "Không có"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-600 w-32">
                      Số liên hệ tài xế:
                    </span>
                    <span className="text-xs text-gray-900">
                      {selectedSlot.driverPhone || "Không có"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-600 w-32">
                      Biển kiểm soát xe:
                    </span>
                    <span className="text-xs text-gray-900 font-mono bg-gray-100 px-2 py-1 rounded">
                      {selectedSlot.licensePlate || "Không có"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-medium text-gray-600 w-32">
                      Số điện thoại:
                    </span>
                    <span className="text-xs text-gray-900">
                      {selectedSlot.phone || "Không có"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Ghi chú */}
              {selectedSlot.note && (
                <div className="bg-yellow-50 rounded-lg p-3">
                  <h3 className="text-xs font-semibold text-gray-800 mb-2 flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                    Ghi chú
                  </h3>
                  <p className="text-xs text-gray-700 leading-relaxed">
                    {selectedSlot.note}
                  </p>
                </div>
              )}
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
