"use client";

import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import { Calendar, ChevronDown, MapPin, Users, X, Edit } from "lucide-react";
import {
  useGetCalendarBusinessById,
  useGetCalendarHistory,
} from "@/hooks/data/calendar.data";
import { Spinner } from "@/components/ui/shadcn-io/spinner";
import { CustomDatePicker } from "@/components/ui/calendar";

interface ScheduleItem {
  id: number;
  time: string;
  title: string;
  location: string;
  participants: string;
  startTimeStr?: string;
  endTimeStr?: string;
  description?: string;
  meetingCalendar?: boolean;
  unitCalendar?: boolean;
}

interface ScheduleCardProps {
  selectedDateLabel: string;
  scheduleTab: "board" | "unit";
  onChangeTab: (tab: "board" | "unit") => void;
  onNavigateDate: (dir: "prev" | "next") => void;
  onToggleDatePicker: () => void;
  showDatePicker: boolean;
  isClient: boolean;
  selectedDate: Date | null;
  onChangeDate: (d: Date) => void;
  onCloseDatePicker: () => void;
  scheduleItems: ScheduleItem[];
  morningSchedules: ScheduleItem[];
  afternoonSchedules: ScheduleItem[];
}

const ScheduleCard: React.FC<ScheduleCardProps> = ({
  selectedDateLabel,
  scheduleTab,
  onChangeTab,
  onNavigateDate,
  onToggleDatePicker,
  showDatePicker,
  isClient,
  selectedDate,
  onChangeDate,
  onCloseDatePicker,
  scheduleItems,
  morningSchedules,
  afternoonSchedules,
}) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState<number | null>(null);

  // Fetch chi tiết lịch và lịch sử khi modal mở
  const { data: calendarDetail, isLoading: isLoadingDetail } =
    useGetCalendarBusinessById(selectedItemId ?? 0);

  const { data: calendarHistory = [], isLoading: isLoadingHistory } =
    useGetCalendarHistory(selectedItemId ?? 0, !!selectedItemId);

  const handleItemClick = useCallback((item: ScheduleItem) => {
    setSelectedItemId(item.id);
    setShowModal(true);
  }, []);

  const closeModal = useCallback(() => {
    setShowModal(false);
    setSelectedItemId(null);
  }, []);

  const truncateTitle = useCallback((title: string, maxLength: number = 80) => {
    if (title.length <= maxLength) return title;
    return title.substring(0, maxLength) + "...";
  }, []);

  const decodeHtmlEntities = useCallback((text: string) => {
    if (!text) return "";
    const parser = new DOMParser();
    const doc = parser.parseFromString(text, "text/html");
    return doc.body.textContent || "";
  }, []);

  const formatDateTime = useCallback((timestamp: number) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }, []);

  const formatHistoryDate = useCallback((timestamp: number) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  }, []);

  const morningScheduleItems = useMemo(
    () =>
      morningSchedules.map((item) => (
        <div
          key={item.id}
          className="p-4 rounded-lg border bg-white/90 backdrop-blur-sm border-gray-200 hover:shadow-sm cursor-pointer transition-all"
          onClick={() => handleItemClick(item)}
        >
          <div className="flex justify-between">
            <div className="flex items-start gap-3 flex-1">
              <h3 className="text-sm font-bold leading-tight break-words mr-2 text-gray-800">
                {truncateTitle(decodeHtmlEntities(item.title))}
              </h3>
            </div>
            <div className="text-sm font-semibold whitespace-nowrap mt-1 flex-shrink-0 text-blue-600">
              {item.startTimeStr && item.endTimeStr
                ? `${item.startTimeStr.split(" ")[1] || item.startTimeStr} - ${
                    item.endTimeStr.split(" ")[1] || item.endTimeStr
                  }`
                : item.time}
            </div>
          </div>

          {item.location && (
            <div className="mt-2 flex gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="break-words">{item.location}</span>
            </div>
          )}
          {item.participants && (
            <div className="mt-2 flex gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4 flex-shrink-0" />
              <span className="break-words">{item.participants}</span>
            </div>
          )}
        </div>
      )),
    [morningSchedules, handleItemClick, truncateTitle, decodeHtmlEntities]
  );

  const afternoonScheduleItems = useMemo(
    () =>
      afternoonSchedules.map((item) => (
        <div
          key={item.id}
          className="p-4 rounded-lg border bg-white/90 backdrop-blur-sm border-gray-200 hover:shadow-sm cursor-pointer transition-all"
          onClick={() => handleItemClick(item)}
        >
          <div className="flex justify-between">
            <div className="flex items-start gap-3 flex-1">
              <h3 className="text-sm font-bold leading-tight break-words mr-2 text-gray-800">
                {truncateTitle(decodeHtmlEntities(item.title))}
              </h3>
            </div>
            <div className="text-sm font-semibold whitespace-nowrap mt-1 flex-shrink-0 text-blue-600">
              {item.startTimeStr && item.endTimeStr
                ? `${item.startTimeStr.split(" ")[1] || item.startTimeStr} - ${
                    item.endTimeStr.split(" ")[1] || item.endTimeStr
                  }`
                : item.time}
            </div>
          </div>

          {item.location && (
            <div className="mt-2 flex gap-2 text-sm text-gray-600">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span className="break-words">{item.location}</span>
            </div>
          )}
          {item.participants && (
            <div className="mt-2 flex gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4 flex-shrink-0" />
              <span className="break-words">{item.participants}</span>
            </div>
          )}
        </div>
      )),
    [afternoonSchedules, handleItemClick, truncateTitle, decodeHtmlEntities]
  );

  return (
    <div className="w-full max-w-none space-y-4">
      <div className="border-0 shadow-lg flex flex-col overflow-hidden rounded-xl bg-blue-50">
        {/* Header */}
        <div className="py-3 px-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl leading-none flex items-center gap-2 text-gray-900 mb-1 font-bold">
                <Calendar className="w-6 h-6 text-blue-600" />
                Lịch công tác
              </h2>
              <p className="text-base text-gray-600">{selectedDateLabel}</p>
            </div>

            <div className="flex items-center gap-2">
              {/* Tabs */}
              <div className="flex rounded-lg border border-gray-300 bg-white shadow-sm overflow-hidden">
                <button
                  className={`px-4 py-2 text-base font-medium transition-colors ${
                    scheduleTab === "board"
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => onChangeTab("board")}
                >
                  Lịch ban
                </button>
                <button
                  className={`px-4 py-2 text-base font-medium transition-colors ${
                    scheduleTab === "unit"
                      ? "bg-blue-600 text-white"
                      : "text-gray-700 hover:bg-gray-100"
                  }`}
                  onClick={() => onChangeTab("unit")}
                >
                  Lịch đơn vị
                </button>
              </div>

              {/* Navigation */}
              <button
                className="h-10 w-10 border border-gray-300 bg-white text-gray-600 rounded hover:bg-gray-50 flex items-center justify-center"
                onClick={() => onNavigateDate("prev")}
              >
                <ChevronDown className="w-4 h-4 rotate-90" />
              </button>

              <CustomDatePicker
                selected={selectedDate}
                onChange={(date) => {
                  if (date) onChangeDate(date);
                }}
                className="h-10 px-3 text-sm border border-gray-300 bg-white text-gray-600 rounded flex items-center hover:bg-gray-50"
                placeholder="Chọn"
                showClearButton={false}
              />

              <button
                className="h-10 w-10 border border-gray-300 bg-white text-gray-600 rounded flex items-center justify-center hover:bg-gray-50"
                onClick={() => onNavigateDate("next")}
              >
                <ChevronDown className="w-4 h-4 -rotate-90" />
              </button>
            </div>
          </div>
        </div>

        {/* BODY: Schedule items */}
        <div className="pt-0 flex-1 mb-4 px-4">
          {scheduleItems.length === 0 ? (
            <div className="flex items-center justify-center h-12">
              <p className="text-base text-gray-600 text-center">
                Không có lịch công tác
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Morning Schedule */}
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                {morningSchedules.length > 0 ? (
                  morningScheduleItems
                ) : (
                  <div className="flex items-center justify-center h-20">
                    <p className="text-sm text-gray-600 text-center">
                      Không có lịch buổi sáng
                    </p>
                  </div>
                )}
              </div>

              {/* Afternoon Schedule */}
              <div className="space-y-3 max-h-[420px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
                {afternoonSchedules.length > 0 ? (
                  afternoonScheduleItems
                ) : (
                  <div className="flex items-center justify-center h-20">
                    <p className="text-sm text-gray-600 text-center">
                      Không có lịch buổi chiều
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal chi tiết */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center px-6 py-4 border-b bg-gray-50">
              <h2 className="text-lg text-gray-800">Thông tin lịch làm việc</h2>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {isLoadingDetail ? (
              <div className="flex items-center justify-center py-12">
                <Spinner variant="ring" size={48} className="text-blue-600" />
              </div>
            ) : calendarDetail ? (
              <div className="grid grid-cols-3 gap-6 p-6">
                <div className="col-span-2 space-y-2">
                  <div className="flex text-sm items-start p-3 bg-gray-50 rounded-lg">
                    <div className="font-bold text-gray-800 w-36 text-right pr-2">
                      Người soạn :
                    </div>
                    <div className="text-gray-700 flex-1">
                      {calendarDetail.createUserName || "N/A"}
                    </div>
                  </div>

                  <div className="flex text-sm items-start p-3 bg-gray-50 rounded-lg">
                    <div className="font-bold text-gray-800 w-36 text-right pr-2">
                      Đơn vị :
                    </div>
                    <div className="text-gray-700 flex-1">
                      {calendarDetail.orgModel?.name &&
                      calendarDetail.parentOrgName
                        ? `${calendarDetail.orgModel.name} - ${calendarDetail.parentOrgName}`
                        : calendarDetail.orgModel?.name ||
                          calendarDetail.parentOrgName ||
                          "N/A"}
                    </div>
                  </div>

                  <div className="flex text-sm items-start p-3 bg-gray-50 rounded-lg">
                    <div className="font-bold text-gray-800 w-36 text-right pr-2">
                      Nội dung :
                    </div>
                    <div className="text-gray-700 flex-1 whitespace-pre-wrap">
                      {decodeHtmlEntities(calendarDetail.description || "")}
                    </div>
                  </div>

                  <div className="flex text-sm items-start p-3 bg-gray-50 rounded-lg">
                    <div className="font-bold text-gray-800 w-36 text-right pr-2">
                      Cá nhân nhận tệp :
                    </div>
                    <div className="text-gray-700 flex-1">
                      {calendarDetail.participants || ""}
                    </div>
                  </div>

                  <div className="flex text-sm items-start p-3 bg-gray-50 rounded-lg">
                    <div className="font-bold text-gray-800 w-36 text-right pr-2">
                      Đơn vị nhận tệp :
                    </div>
                    <div className="text-gray-700 flex-1">
                      {Array.isArray(calendarDetail.participantsOrg) &&
                      calendarDetail.participantsOrg.length > 0
                        ? calendarDetail.participantsOrg
                            .map((org: any) => org.name || org)
                            .join(", ")
                        : ""}
                    </div>
                  </div>

                  <div className="flex text-sm items-start p-3 bg-gray-50 rounded-lg">
                    <div className="font-bold text-gray-800 w-36 text-right pr-2">
                      Thành phần :
                    </div>
                    <div className="text-gray-700 flex-1">
                      {calendarDetail.participantsGuest || ""}
                    </div>
                  </div>

                  <div className="flex text-sm items-start p-3 bg-gray-50 rounded-lg">
                    <div className="font-bold text-gray-800 w-36 text-right pr-2">
                      Nhóm nhận tệp :
                    </div>
                    <div className="text-gray-700 flex-1">
                      {Array.isArray(calendarDetail.participantsGroup) &&
                      calendarDetail.participantsGroup.length > 0
                        ? calendarDetail.participantsGroup
                            .map((group: any) => group.name || group)
                            .join(", ")
                        : ""}
                    </div>
                  </div>

                  <div className="flex text-sm items-start p-3 bg-gray-50 rounded-lg">
                    <div className="font-bold text-gray-800 w-36 text-right pr-2">
                      Địa điểm :
                    </div>
                    <div className="text-gray-700 flex-1">
                      {calendarDetail.address || "N/A"}
                    </div>
                  </div>

                  <div className="flex text-sm items-start p-3 bg-gray-50 rounded-lg">
                    <div className="font-bold text-gray-800 w-36 text-right pr-2">
                      Bắt đầu :
                    </div>
                    <div className="text-gray-700 flex-1">
                      {calendarDetail.startTimeStr || "N/A"}
                    </div>
                  </div>

                  <div className="flex text-sm items-start p-3 bg-gray-50 rounded-lg">
                    <div className="font-bold text-gray-800 w-36 text-right pr-2">
                      Kết thúc :
                    </div>
                    <div className="text-gray-700 flex-1">
                      {calendarDetail.endTimeStr || "N/A"}
                    </div>
                  </div>

                  <div className="flex text-sm items-start p-3 bg-gray-50 rounded-lg">
                    <div className="font-bold text-gray-800 w-36 text-right pr-2">
                      Trạng thái :
                    </div>
                    <div className="flex-1">
                      <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-green-100 text-green-800">
                        {calendarDetail.statusName || "Chờ duyệt"}
                      </span>
                    </div>
                  </div>

                  <div className="flex text-sm items-start p-3 bg-gray-50 rounded-lg">
                    <div className="font-bold text-gray-800 w-36 text-right pr-2">
                      Tệp lịch tuần :
                    </div>
                    <div className="text-gray-700 flex-1">
                      {calendarDetail.scheduleFileName ||
                        calendarDetail.attCalWeek ||
                        ""}
                    </div>
                  </div>

                  <div className="flex text-sm items-start p-3 bg-gray-50 rounded-lg">
                    <div className="font-bold text-gray-800 w-36 text-right pr-2">
                      Ghi chú :
                    </div>
                    <div className="text-gray-700 flex-1 whitespace-pre-wrap">
                      {decodeHtmlEntities(calendarDetail.note || "")}
                    </div>
                  </div>
                </div>

                {/* Edit History */}
                <div className="col-span-1">
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-sm font-bold text-gray-800 mb-3">
                      Lịch sử chỉnh sửa
                    </h3>
                    {isLoadingHistory ? (
                      <div className="flex justify-center py-4">
                        <Spinner
                          variant="ring"
                          size={24}
                          className="text-blue-600"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {Array.isArray(calendarHistory) &&
                        calendarHistory.length > 0 ? (
                          calendarHistory.map((history: any, index: number) => (
                            <div
                              key={index}
                              className="flex items-start gap-2 text-sm text-gray-600 border-b border-gray-200 pb-2 last:border-b-0"
                            >
                              <div className="flex-1">
                                <div className="font-medium text-gray-700">
                                  {history.userName || "N/A"}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatHistoryDate(history.dateCreate)}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="text-sm text-gray-500 text-center py-4">
                            Không có lịch sử chỉnh sửa
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center py-12 text-gray-500">
                Không tìm thấy thông tin lịch
              </div>
            )}

            <div className="flex justify-end px-6 py-4 bg-gray-50">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors text-sm font-medium"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduleCard;
