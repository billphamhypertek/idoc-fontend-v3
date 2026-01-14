"use client";

import { useState } from "react";
import { format, addDays, startOfWeek } from "date-fns";
import { vi } from "date-fns/locale";
import dynamic from "next/dynamic";
import {
  Eye,
  Trash2,
  Pencil,
  CircleCheck,
  CircleArrowLeft,
  X,
  Download,
  Share2,
  CalendarPlus2,
  Clock,
} from "lucide-react";

const QuillViewer = dynamic(() => import("@/components/common/QuillViewer"), {
  ssr: false,
});
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  getAssetIcon,
  getStatusColor,
  sanitizeVietnameseText,
} from "@/utils/common.utils";
import { CalendarService } from "@/services/calendar.service";
import { ToastUtils } from "@/utils/toast.utils";
import { doOpenShare, downloadFile, viewFile } from "@/utils/file.utils";
import { isCheckDate } from "@/utils/datetime.utils";
import { Constant } from "@/definitions/constants/constant";
import CalendarDetailModal from "./calendar-content-detail";
import { useSearchParams } from "next/navigation";
import { ATTACHMENT_DOWNLOAD_TYPE } from "@/definitions/constants/common.constant";

interface CalendarEvent {
  id: number;
  title: string;
  address: string | null;
  status: string;
  participants: string;
  participantsGuest: string;
  participantsOrg: any[];
  participantsGroup: any[];
  time: string;
  description: string;
  createUserName: string;
  note: string | null;
  showApproveBt: boolean;
  showRejectBt: boolean;
  showEditBt: boolean;
  showCancelBt: boolean;
  showDelBt: boolean;
  scheduleFileName: string | null;
  isScheduleAFile: boolean | null;
  attachments: any | null;
  createBy: number;
  roomId: number | null;
  roomName: string | null;
  showAttachments: boolean;
  cabinet: boolean;
}

interface CalendarDayData {
  dateStr: string;
  date: number;
  amList: CalendarEvent[];
  pmList: CalendarEvent[];
}

interface CalendarContentProps {
  selectedDate: Date;
  orgType: number; // 1 = lịch ban, 2 = lịch đơn vị
  calendarData?: any[];
  isLoading?: boolean;
  onAddEvent?: (orgType: number, selectedDate?: Date) => void;
  onEditEvent?: (eventId: number, orgType: number) => void;
  onRefreshData?: () => void;
}

export default function CalendarContent({
  selectedDate,
  orgType,
  calendarData = [],
  isLoading = false,
  onAddEvent,
  onEditEvent,
  onRefreshData,
}: CalendarContentProps) {
  const calendarDataToUse: any = calendarData || [];

  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Dialog state
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    "approve" | "reject" | "cancel" | null
  >(null);
  const [confirmComment, setConfirmComment] = useState("");
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);

  // Calendar detail modal state
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );

  const searchParams = useSearchParams();
  const isCabinet = searchParams?.get("isCabinet") === "true";

  const getListParticipant = (object: any[]): string => {
    if (!object || object.length === 0) return "";
    return object.map((el) => el.fullName).join(", ");
  };
  const handleApprove = (eventId: number) => {
    setSelectedEventId(eventId);
    setConfirmAction("approve");
    setShowConfirmDialog(true);
  };

  const handleReject = (eventId: number) => {
    setSelectedEventId(eventId);
    setConfirmAction("reject");
    setShowConfirmDialog(true);
  };

  const handleCancel = (eventId: number) => {
    setSelectedEventId(eventId);
    setConfirmAction("cancel");
    setShowConfirmDialog(true);
  };

  const handleDelete = (eventId: number) => {
    setSelectedEventId(eventId);
    setShowDeleteConfirm(true);
  };

  const handleConfirmAction = async () => {
    if (!selectedEventId || !confirmAction) return;

    try {
      let status = "";
      if (confirmAction === "approve") {
        status = "APPROVE";
      } else if (confirmAction === "reject") {
        status = "RETURN";
      } else if (confirmAction === "cancel") {
        status = "CANCEL";
      }

      const formData = new FormData();
      formData.append("status", status);
      formData.append("comment", confirmComment);

      const response = await CalendarService.updateCalendarStatus(
        selectedEventId,
        formData
      );

      if (response) {
        if (status === "APPROVE") {
          ToastUtils.daDuyetLichThanhCong();
        } else if (status === "RETURN") {
          ToastUtils.traLaiLichThanhCong();
        } else if (status === "CANCEL") {
          ToastUtils.huyDuyetLichThanhCong();
        }

        setShowConfirmDialog(false);
        setConfirmAction(null);
        setConfirmComment("");
        setSelectedEventId(null);

        if (onRefreshData) {
          onRefreshData();
        }
      }
    } catch (error) {
      console.error("Error updating calendar status:", error);
      ToastUtils.coLoiXayRaKhiCapNhatTrangThaiLich();
    }
  };

  // Handle event click to show detail modal
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent({
      id: event.id,
      cabinet: event.cabinet || false,
    } as any);
    setShowDetailModal(true);
  };

  // Handle modal close
  const handleCloseDetailModal = () => {
    setShowDetailModal(false);
    setSelectedEvent(null);
  };

  const handleConfirmDelete = async () => {
    if (!selectedEventId) return;

    try {
      const response = await CalendarService.deleteCalendar(selectedEventId);

      if (response) {
        ToastUtils.xoaLichThanhCong();

        setShowDeleteConfirm(false);
        setSelectedEventId(null);

        if (onRefreshData) {
          onRefreshData();
        }
      }
    } catch (error) {
      console.error("Error deleting calendar:", error);
      ToastUtils.coLoiXayRaKhiXoaLich();
    }
  };

  const getEventsForDay = (date: Date, type: "morning" | "afternoon") => {
    const dayData = calendarDataToUse?.objList?.find(
      (data: any) =>
        format(new Date(data.date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
    );

    if (!dayData) {
      return { events: [], dayData: null };
    }

    return {
      events: type === "morning" ? dayData.amList : dayData.pmList,
      dayData: dayData,
    };
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-9 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Đang tải dữ liệu lịch...</p>
        </div>
      </div>
    );
  }

  const downloadAttachment = async (file: any) => {
    if (isCabinet) {
      await CalendarService.fileMeetingDownload(file.name);
    } else {
      await downloadFile(
        file.name,
        ATTACHMENT_DOWNLOAD_TYPE.CALENDAR,
        file.encrypt,
        null,
        null
      );
    }
  };

  return (
    <div className="bg-white rounded-lg border overflow-hidden">
      <div
        className="grid grid-cols-[200px_1fr_1fr] border-b"
        style={{ backgroundColor: "#6fa4da" }}
      >
        <div className="p-2 font-semibold text-white border-r border-white">
          THỨ/NGÀY
        </div>
        <div className="p-2 font-semibold text-white border-r border-white">
          SÁNG
        </div>
        <div className="p-2 font-semibold text-white border-white border-r">
          CHIỀU
        </div>
      </div>

      <div className="divide-y">
        {weekDays.map((day, dayIndex) => {
          const isToday =
            format(day, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
          const morningData = getEventsForDay(day, "morning");
          const afternoonData = getEventsForDay(day, "afternoon");
          const morningEvents = morningData.events;
          const afternoonEvents = afternoonData.events;
          const dayData = morningData.dayData || afternoonData.dayData;

          return (
            <div
              key={dayIndex}
              className={`grid grid-cols-[200px_1fr_1fr] min-h-[120px] ${isToday ? "bg-[#eacbad]" : "bg-gray-50"}`}
            >
              <div className={`p-4 border-r`}>
                <div className="flex flex-col items-center">
                  <div className="text-center">
                    <div
                      className={`text-sm font-semibold text-gray-900 ${isToday ? "text-red-500" : "text-gray-900"}`}
                    >
                      {isToday
                        ? "Hôm nay"
                        : format(day, "EEEE", { locale: vi })}
                    </div>
                    <div
                      className={`text-xs text-gray-600 ${isToday ? "text-red-500" : "text-gray-600"}`}
                    >
                      {format(day, "dd/MM/yyyy")}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    className={`p-1 h-6 w-6 mt-2 ${isToday ? "text-red-500" : "text-gray-600"}`}
                    onClick={() => onAddEvent?.(orgType, day)}
                    title="Thêm sự kiện"
                  >
                    <CalendarPlus2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="p-2 border-r space-y-2">
                {morningEvents.length > 0 &&
                  morningEvents.map((event: CalendarEvent) => (
                    <Card
                      key={event.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleEventClick(event)}
                    >
                      <CardHeader className="pb-2 p-2">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
                          <span className="text-base font-medium text-blue-600">
                            {event.time}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 p-2">
                        <div className="space-y-2">
                          <div className="text-sm text-gray-900">
                            <strong>Nội dung:</strong>{" "}
                            <QuillViewer content={event.description} />
                          </div>

                          {event.participants && (
                            <p className="text-xs text-gray-600 break-words">
                              <strong>Cá nhân nhận file:</strong>{" "}
                              {event.participants}
                            </p>
                          )}

                          {event.participantsOrg &&
                            event.participantsOrg.length > 0 && (
                              <p className="text-xs text-gray-600 break-words">
                                <strong>Đơn vị nhận file:</strong>{" "}
                                {getListParticipant(event.participantsOrg)}
                              </p>
                            )}

                          {event.participantsGuest && (
                            <p className="text-xs text-gray-600 break-words">
                              <strong>Thành phần:</strong>{" "}
                              {event.participantsGuest}
                            </p>
                          )}

                          {event.participantsGroup &&
                            event.participantsGroup.length > 0 && (
                              <p className="text-xs text-gray-600 break-words">
                                <strong>Nhóm nhận file:</strong>{" "}
                                {getListParticipant(event.participantsGroup)}
                              </p>
                            )}

                          {event.address && (
                            <p className="text-xs text-gray-600 break-words">
                              <strong className="mr-1">Địa điểm:</strong>
                              {event.address}
                            </p>
                          )}

                          <p className="text-sm text-gray-600">
                            <strong className="mr-1">Tình trạng:</strong>{" "}
                            <span className={`${getStatusColor(event.status)}`}>
                              {event.status}
                            </span>
                          </p>

                          {event.note && (
                            <p className="text-xs text-gray-600 break-words">
                              <strong className="mr-1">Ghi chú:</strong>
                              {event.note}
                            </p>
                          )}

                          {dayData &&
                            isCheckDate(dayData.date) &&
                            event.attachments &&
                            event.attachments.length > 0 && (
                              <div className="text-sm text-gray-600">
                                <strong className="mr-1">Tệp đính kèm:</strong>
                                {event.showAttachments && (
                                  <div className="ml-4">
                                    {event.attachments.map(
                                      (attachment: any) => (
                                        <div
                                          key={attachment.id}
                                          className="flex items-center gap-2 my-1"
                                        >
                                          <img
                                            src={getAssetIcon(
                                              attachment.displayName ||
                                                attachment.name
                                            )}
                                            alt={
                                              attachment.displayName ||
                                              attachment.name
                                            }
                                            className="w-4 h-4"
                                          />
                                          <span
                                            className="text-blue-600 hover:underline cursor-pointer"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              viewFile(
                                                attachment,
                                                Constant
                                                  .ATTACHMENT_DOWNLOAD_TYPE
                                                  .CALENDAR
                                              );
                                            }}
                                          >
                                            {attachment.displayName ||
                                              attachment.name}
                                          </span>
                                          <Button
                                            className="ml-1 text-gray-500 bg-white hover:bg-white border-none shadow-none p-1"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              viewFile(
                                                attachment,
                                                Constant
                                                  .ATTACHMENT_DOWNLOAD_TYPE
                                                  .CALENDAR
                                              );
                                            }}
                                            title="Tải tệp đính kèm"
                                          >
                                            <Download className="w-4 h-4" />
                                          </Button>
                                          {attachment?.encrypt && (
                                            <Button
                                              className="ml-1 bg-white text-gray-500 hover:bg-white border-none shadow-none p-1"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                doOpenShare(attachment);
                                              }}
                                              title="Chia sẻ tệp đính kèm"
                                            >
                                              <Share2 className="w-4 h-4" />
                                            </Button>
                                          )}
                                          <Button
                                            className="ml-1 bg-white text-gray-500 hover:bg-white border-none shadow-none p-1"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              viewFile(
                                                attachment,
                                                Constant
                                                  .ATTACHMENT_DOWNLOAD_TYPE
                                                  .CALENDAR
                                              );
                                            }}
                                          >
                                            <Eye className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <strong>Thao tác: </strong>
                            <TooltipProvider>
                              <div className="flex space-x-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="p-1 h-6 w-6 text-blue-600 disabled:text-gray-500"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onEditEvent?.(event.id, orgType);
                                      }}
                                      disabled={!event.showEditBt}
                                    >
                                      <Pencil className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Chỉnh sửa</p>
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="p-1 h-6 w-6 text-green-600 disabled:text-gray-500"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleApprove(event.id);
                                      }}
                                      disabled={!event.showApproveBt}
                                    >
                                      <CircleCheck className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Duyệt</p>
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="p-1 h-6 w-6 text-red-600 disabled:text-gray-500"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleReject(event.id);
                                      }}
                                      disabled={!event.showRejectBt}
                                    >
                                      <CircleArrowLeft className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Từ chối</p>
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="p-1 h-6 w-6 text-red-600 disabled:text-gray-500"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCancel(event.id);
                                      }}
                                      disabled={!event.showCancelBt}
                                    >
                                      <X className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Hủy duyệt</p>
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="p-1 h-6 w-6 disabled:text-gray-500"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(event.id);
                                      }}
                                      disabled={!event.showDelBt}
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Xóa</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </TooltipProvider>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>

              <div className="p-2 space-y-2">
                {afternoonEvents.length > 0 &&
                  afternoonEvents.map((event: CalendarEvent) => (
                    <Card
                      key={event.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleEventClick(event)}
                    >
                      <CardHeader className="pb-2 p-2">
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4 text-blue-600 mt-0.5" />
                          <span className="text-base font-medium text-blue-600">
                            {event.time}
                          </span>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0 p-2">
                        <div className="space-y-2">
                          <div className="text-sm text-gray-900">
                            <strong>Nội dung:</strong>{" "}
                            <QuillViewer content={event.description} />
                          </div>

                          {event.participants && (
                            <p className="text-xs text-gray-600 break-words">
                              <strong>Cá nhân nhận file:</strong>{" "}
                              {event.participants}
                            </p>
                          )}

                          {event.participantsOrg &&
                            event.participantsOrg.length > 0 && (
                              <p className="text-xs text-gray-600 break-words">
                                <strong>Đơn vị nhận file:</strong>{" "}
                                {getListParticipant(event.participantsOrg)}
                              </p>
                            )}

                          {event.participantsGuest && (
                            <p className="text-xs text-gray-600 break-words">
                              <strong>Thành phần:</strong>{" "}
                              {event.participantsGuest}
                            </p>
                          )}

                          {event.participantsGroup &&
                            event.participantsGroup.length > 0 && (
                              <p className="text-xs text-gray-600 break-words">
                                <strong>Nhóm nhận file:</strong>{" "}
                                {getListParticipant(event.participantsGroup)}
                              </p>
                            )}

                          {event.address && (
                            <p className="text-xs text-gray-600 break-words">
                              <strong className="mr-1">Địa điểm:</strong>
                              {event.address}
                            </p>
                          )}

                          <p className="text-sm text-gray-600">
                            <strong className="mr-1">Tình trạng:</strong>{" "}
                            <span className={`${getStatusColor(event.status)}`}>
                              {event.status}
                            </span>
                          </p>

                          {event.note && (
                            <p className="text-xs text-gray-600 break-words">
                              <strong className="mr-1">Ghi chú:</strong>
                              {event.note}
                            </p>
                          )}

                          {dayData &&
                            isCheckDate(dayData.date) &&
                            event.attachments &&
                            event.attachments.length > 0 && (
                              <div className="text-sm text-gray-600">
                                <strong className="mr-1">Tệp đính kèm:</strong>
                                {event.showAttachments && (
                                  <div className="ml-4">
                                    {event.attachments.map(
                                      (attachment: any) => (
                                        <div
                                          key={attachment.id}
                                          className="flex items-center gap-2 my-1"
                                        >
                                          <img
                                            src={getAssetIcon(
                                              attachment.displayName ||
                                                attachment.name
                                            )}
                                            alt={
                                              attachment.displayName ||
                                              attachment.name
                                            }
                                            className="w-4 h-4"
                                          />
                                          <span
                                            className="text-blue-600 hover:underline cursor-pointer"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              viewFile(
                                                attachment,
                                                Constant
                                                  .ATTACHMENT_DOWNLOAD_TYPE
                                                  .CALENDAR
                                              );
                                            }}
                                          >
                                            {attachment.displayName ||
                                              attachment.name}
                                          </span>
                                          <Button
                                            className="ml-1 text-gray-500 bg-white hover:bg-white border-none shadow-none p-1"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              // Handle download attachment
                                              downloadAttachment(attachment);
                                            }}
                                            title="Tải tệp đính kèm"
                                          >
                                            <Download className="w-4 h-4" />
                                          </Button>
                                          {attachment?.encrypt && (
                                            <Button
                                              className="ml-1 bg-white text-gray-500 hover:bg-white border-none shadow-none p-1"
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                // Handle download attachment
                                                doOpenShare(attachment);
                                              }}
                                              title="Chia sẻ tệp đính kèm"
                                            >
                                              <Share2 className="w-4 h-4" />
                                            </Button>
                                          )}
                                          <Button
                                            className="ml-1 text-gray-500 bg-white hover:bg-white border-none shadow-none p-1"
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              viewFile(
                                                attachment,
                                                Constant
                                                  .ATTACHMENT_DOWNLOAD_TYPE
                                                  .CALENDAR
                                              );
                                            }}
                                          >
                                            <Eye className="w-4 h-4" />
                                          </Button>
                                        </div>
                                      )
                                    )}
                                  </div>
                                )}
                              </div>
                            )}

                          {calendarDataToUse.attCaWeek && (
                            <div className="text-sm text-gray-600">
                              <strong className="mr-1">Tệp lịch tuần:</strong>
                              <ul className="list-disc ml-4">
                                {calendarDataToUse.attCaWeek.map(
                                  (attachment: any) => (
                                    <li key={attachment.id}>
                                      {attachment.displayName}
                                    </li>
                                  )
                                )}
                              </ul>
                            </div>
                          )}

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <strong>Thao tác: </strong>
                            <div className="flex space-x-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                className="p-1 h-6 w-6 text-blue-600 disabled:text-gray-500"
                                title="Chỉnh sửa"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onEditEvent?.(event.id, orgType);
                                }}
                                disabled={!event.showEditBt}
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="p-1 h-6 w-6 text-green-600 disabled:text-gray-500"
                                title="Duyệt"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleApprove(event.id);
                                }}
                                disabled={!event.showApproveBt}
                              >
                                <CircleCheck className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="p-1 h-6 w-6 text-red-600 disabled:text-gray-500"
                                title="Từ chối"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleReject(event.id);
                                }}
                                disabled={!event.showRejectBt}
                              >
                                <CircleArrowLeft className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="p-1 h-6 w-6 text-red-600 disabled:text-gray-500"
                                title="Hủy duyệt"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleCancel(event.id);
                                }}
                                disabled={!event.showCancelBt}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="p-1 h-6 w-6 text-black disabled:text-gray-500"
                                title="Xóa"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete(event.id);
                                }}
                                disabled={!event.showDelBt}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            </div>
          );
        })}
      </div>

      <ConfirmDeleteDialog
        isOpen={showConfirmDialog}
        onOpenChange={(open) => {
          setShowConfirmDialog(open);
          if (!open) {
            setConfirmAction(null);
            setConfirmComment("");
            setSelectedEventId(null);
          }
        }}
        onConfirm={handleConfirmAction}
        title="Hãy xác nhận"
        description=""
        confirmText="Xác nhận"
        cancelText="Đóng"
        haveNote={true}
        note={confirmComment}
        setNote={setConfirmComment}
        positionButton={true}
      />

      <ConfirmDeleteDialog
        isOpen={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleConfirmDelete}
        title="Hãy xác nhận"
        description="Bạn có chắc chắn muốn xóa lịch?"
        confirmText="Xác nhận"
        cancelText="Đóng"
        positionButton={true}
      />

      {/* Calendar Detail Modal */}
      {selectedEvent && (
        <CalendarDetailModal
          isOpen={showDetailModal}
          onClose={handleCloseDetailModal}
          calendar={selectedEvent}
          onDownloadAttachment={downloadAttachment}
          onOpenShare={doOpenShare}
          onClickFile={downloadAttachment}
        />
      )}
    </div>
  );
}
