"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { X, Eye, Download, Share } from "lucide-react";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";

const QuillViewer = dynamic(() => import("@/components/common/QuillViewer"), {
  ssr: false,
});
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table } from "@/components/ui/table";
import {
  getAssetIcon,
  orginName,
  sanitizeVietnameseText,
} from "@/utils/common.utils";
import { viewFile } from "@/utils/file.utils";
import { Constant } from "@/definitions/constants/constant";
import {
  useGetCalendarDetail,
  useGetCalendarHistory,
} from "@/hooks/data/calendar.data";
import { useRouter } from "next/navigation";

const documentColumns = [
  {
    header: "STT",
    className: "w-1/12 text-center text-xs border-r",
    accessor: (item: any, index: number) => (
      <span className="text-xs">{index + 1}</span>
    ),
  },
  {
    header: "Trích yếu",
    className: "w-5/12 text-xs border-r text-center",
    accessor: (item: any) => (
      <span className="text-xs">
        {item.type === "VAN_BAN_DEN" ? item.docInName : item.docOutName}
      </span>
    ),
  },
  {
    header: "Loại văn bản",
    className: "w-4/12 text-xs text-center",
    accessor: (item: any) => (
      <span className="text-xs">
        {item.type === "VAN_BAN_DEN" ? "Văn bản đến" : "Văn bản đi"}
      </span>
    ),
  },
];

const taskColumns = [
  {
    header: "STT",
    className: "w-1/12 text-center text-xs border-r",
    accessor: (item: any, index: number) => (
      <span className="text-xs">{index + 1}</span>
    ),
  },
  {
    header: "Tên công việc",
    className: "w-5/12 text-xs border-r text-center",
    accessor: (item: any) => <span className="text-xs">{item.taskName}</span>,
  },
  {
    header: "Mô tả",
    className: "w-4/12 text-xs text-center",
    accessor: (item: any) => (
      <span className="text-xs">{item.taskDescription}</span>
    ),
  },
];

interface CalendarDetailProps {
  isOpen: boolean;
  onClose: () => void;
  calendar: {
    id: number;
    cabinet?: boolean;
  };
  onDownloadAttachment?: (file: any) => void;
  onOpenShare?: (file: any) => void;
  onClickFile?: (file: any) => void;
}

interface HistoryDetailProps {
  isOpen: boolean;
  onClose: () => void;
  history: any;
  calendar: any;
  historyIndex: number;
}

const StatusBadge = ({
  status,
  statusName,
  comment,
}: {
  status: string;
  statusName: string;
  comment: string;
}) => {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "CREATE":
        return "bg-yellow-100 text-yellow-800 border-yellow-200 hover:bg-yellow-200";
      case "RETURN":
        return "bg-red-100 text-red-800 border-red-200 hover:bg-red-200";
      case "APPROVE":
        return "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200";
      case "PUBLISH":
        return "bg-green-100 text-green-800 border-green-200 hover:bg-green-200";
      case "PRE_APPROVE":
        return "bg-[#01c0c8] text-white border-[#01c0c8] hover:bg-[#01c0c8]";
      case "CANCEL":
        return "bg-red-100 text-red-800 border-red-200 hover:bg-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200";
    }
  };

  return (
    <Badge className={`${getStatusStyle(status)} border`} title={comment}>
      {statusName}
    </Badge>
  );
};

export const CalendarDetailModal: React.FC<CalendarDetailProps> = ({
  isOpen,
  onClose,
  calendar,
  onDownloadAttachment,
  onOpenShare,
  onClickFile,
}) => {
  const [showHistoryDetail, setShowHistoryDetail] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<any>(null);
  const [historyIndex, setHistoryIndex] = useState(0);
  const router = useRouter();
  const { data: calendarData, isLoading: calendarLoading } =
    useGetCalendarDetail(calendar, isOpen);
  const { data: historyData, isLoading: historyLoading } =
    useGetCalendarHistory(calendar.id, isOpen);

  const displayCalendar = React.useMemo(() => {
    if (calendarData) {
      return {
        ...calendarData,
        histories: historyData || [],
      };
    }

    if (historyData && historyData.length > 0) {
      return {
        histories: historyData,
        createUserName: "",
        description: "",
        participants: "",
        participantsGuest: "",
        participantsOrg: [],
        participantsGroup: [],
        address: "",
        startTimeStr: "",
        endTimeStr: "",
        status: "",
        statusName: "",
        comment: "",
        note: "",
        isShowAttachments: false,
        attachments: [],
        attCalWeek: null,
      };
    }

    return null;
  }, [calendarData, historyData]);

  const displayDocumentList = React.useMemo(() => {
    return [
      ...((calendarData as any)?.dInList || []),
      ...((calendarData as any)?.dOutList || []),
    ];
  }, [calendarData]);

  const displayTaskList = React.useMemo(() => {
    return (calendarData as any)?.taskList || [];
  }, [calendarData]);

  const loading = calendarLoading || historyLoading;

  const handleOpenHistory = (history: any, index: number) => {
    setSelectedHistory(history);
    setHistoryIndex(index);
    setShowHistoryDetail(true);
  };

  const handleCloseHistory = () => {
    setShowHistoryDetail(false);
    setSelectedHistory(null);
  };

  const handleViewFile = (file: any) => {
    viewFile(file, Constant.ATTACHMENT_DOWNLOAD_TYPE.CALENDAR);
  };

  const handleClickFile = (file: any) => {
    if (onClickFile) {
      onClickFile(file);
    }
  };

  if (!calendar) return null;

  const handleClickTask = (task: any) => {
    const url = `/task/search/detail/${task.taskId}`;
    router.push(url);
  };

  const handleClickDocument = (document: any) => {
    let url = "";
    url =
      document.type === "VAN_BAN_DEN"
        ? `/document-out/search/detail/${document.docInId}`
        : `/document-in/search/draft-detail/${document.docOutId}`;
    router.push(url);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto [&>button]:hidden">
          <DialogHeader className="">
            <DialogTitle className="text-lg font-semibold">
              Thông tin lịch làm việc
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-4 top-4"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-1 text-xs text-gray-600">
                  Đang tải dữ liệu...
                </p>
              </div>
            </div>
          ) : (
            <div className="p-1">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
                <div className="lg:col-span-2">
                  <div className="bg-white border rounded-lg p-2">
                    <div className="space-y-2">
                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-2 text-right text-xs font-semibold py-0.5">
                          Người soạn:
                        </div>
                        <div className="col-span-10 text-xs py-0.5">
                          <span
                            className="break-all"
                            dangerouslySetInnerHTML={{
                              __html: sanitizeVietnameseText(
                                displayCalendar?.createUserName || ""
                              ),
                            }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-2 text-right text-xs font-semibold py-0.5">
                          Đơn vị:
                        </div>
                        <div className="col-span-10 text-xs py-0.5 break-all">
                          <span>
                            {displayCalendar?.orgModel
                              ? displayCalendar?.orgModel.name
                              : ""}
                            {displayCalendar?.parentOrgName
                              ? " - " + displayCalendar?.parentOrgName
                              : ""}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-2 text-right text-xs font-semibold py-0.5">
                          Nội dung:
                        </div>
                        <div className="col-span-10 text-xs py-0.5">
                          <QuillViewer
                            content={displayCalendar?.description || ""}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-2 text-right text-xs font-semibold py-0.5">
                          Cá nhân nhận tệp:
                        </div>
                        <div className="col-span-10 text-xs py-0.5 whitespace-pre-wrap break-all">
                          {Array.isArray(displayCalendar?.participantsGuest)
                            ? displayCalendar.participantsGuest
                                .map(
                                  (guest: any) =>
                                    guest.fullName || guest.name || guest
                                )
                                .join(", ")
                            : displayCalendar?.participantsGuest || "-"}
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-2 text-right text-xs font-semibold py-0.5">
                          Đơn vị nhận tệp:
                        </div>
                        <div className="col-span-10 text-xs py-0.5 whitespace-pre-wrap break-all">
                          {displayCalendar?.participantsOrg &&
                          displayCalendar?.participantsOrg.length > 0
                            ? displayCalendar?.participantsOrg
                                .map((org: any) => org.fullName)
                                .join(", ")
                            : ""}
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-2 text-right text-xs font-semibold py-0.5">
                          Thành phần:
                        </div>
                        <div className="col-span-10 text-xs py-0.5 break-all">
                          {displayCalendar?.participants}
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-2 text-right text-xs font-semibold py-0.5">
                          Nhóm nhận tệp:
                        </div>
                        <div className="col-span-10 text-xs py-0.5 whitespace-pre-wrap break-all">
                          {displayCalendar?.participantsGroup &&
                          displayCalendar?.participantsGroup.length > 0
                            ? displayCalendar?.participantsGroup
                                .map((group: any) => group.fullName)
                                .join(", ")
                            : ""}
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-2 text-right text-xs font-semibold py-0.5">
                          Địa điểm:
                        </div>
                        <div className="col-span-10 text-xs py-0.5 break-all">
                          {displayCalendar?.address}
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-2 text-right text-xs font-semibold py-0.5">
                          Bắt đầu:
                        </div>
                        <div className="col-span-10 text-xs py-0.5">
                          {displayCalendar?.startTimeStr}
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-2 text-right text-xs font-semibold py-0.5">
                          Kết thúc:
                        </div>
                        <div className="col-span-10 text-xs py-0.5">
                          {displayCalendar?.endTimeStr}
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-2 text-right text-xs font-semibold py-0.5">
                          Trạng thái:
                        </div>
                        <div className="col-span-10 text-xs py-0.5">
                          <StatusBadge
                            status={displayCalendar?.status}
                            statusName={displayCalendar?.statusName}
                            comment={displayCalendar?.comment}
                          />
                        </div>
                      </div>

                      {displayDocumentList &&
                        displayDocumentList.length > 0 && (
                          <div className="grid grid-cols-12 gap-2">
                            <div className="col-span-12">
                              <div className="text-xs font-semibold py-0.5">
                                Văn bản đính kèm:
                              </div>
                              <div className="overflow-x-auto">
                                <Table
                                  dataSource={displayDocumentList}
                                  columns={documentColumns}
                                  className="task-monitor-table"
                                  rowClassName={() =>
                                    "hover:bg-gray-50 cursor-pointer"
                                  }
                                  showPagination={false}
                                  onRowClick={(row: any) =>
                                    handleClickDocument(row)
                                  }
                                />
                              </div>
                            </div>
                          </div>
                        )}

                      {displayTaskList && displayTaskList.length > 0 && (
                        <div className="grid grid-cols-12 gap-2">
                          <div className="col-span-12">
                            <div className="text-xs font-semibold py-0.5">
                              Công việc đính kèm:
                            </div>
                            <div className="overflow-x-auto">
                              <Table
                                dataSource={displayTaskList}
                                columns={taskColumns}
                                className="task-monitor-table"
                                rowClassName={() =>
                                  "hover:bg-gray-50 cursor-pointer"
                                }
                                showPagination={false}
                                onRowClick={(row: any) => handleClickTask(row)}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-2 text-right text-xs font-semibold py-0.5 flex items-center justify-end">
                          Tệp lịch:
                        </div>
                        <div className="col-span-10 text-xs py-0.5">
                          {displayCalendar?.isShowAttachments &&
                            displayCalendar?.attachments && (
                              <div className="space-y-2">
                                {displayCalendar?.attachments.map(
                                  (file: any, index: number) => (
                                    <div
                                      key={index}
                                      className="flex items-center gap-2"
                                    >
                                      <img
                                        src={getAssetIcon(file.name)}
                                        alt={file.name}
                                        className="w-4 h-4"
                                      />
                                      <span
                                        className="text-blue-600 hover:underline cursor-pointer"
                                        onClick={() => handleViewFile(file)}
                                      >
                                        {orginName(file.name)}
                                      </span>
                                      <Button
                                        className="ml-1 text-gray-500 hover:text-gray-700 bg-white border-none shadow-none hover:bg-white px-0"
                                        onClick={() =>
                                          onDownloadAttachment?.(file)
                                        }
                                        title="Tải tệp đính kèm"
                                      >
                                        <Download className="w-4 h-4" />
                                      </Button>
                                      {file.encrypt && (
                                        <Button
                                          className="ml-1 text-gray-500 hover:text-gray-700"
                                          onClick={() => onOpenShare?.(file)}
                                          title="Chia sẻ tệp đính kèm"
                                        >
                                          <Share className="w-4 h-4" />
                                        </Button>
                                      )}
                                      <Button
                                        className="ml-1 text-gray-500 hover:text-gray-700 bg-white border-none shadow-none hover:bg-white px-0"
                                        onClick={() => handleViewFile(file)}
                                        title="Xem tệp đính kèm"
                                      >
                                        <Eye className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  )
                                )}
                              </div>
                            )}
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-2 text-right text-xs font-semibold py-0.5">
                          Tệp lịch tuần:
                        </div>
                        <div className="col-span-10 text-xs py-0.5">
                          {displayCalendar?.attCalWeek && (
                            <div className="flex items-center gap-2">
                              <img
                                src={getAssetIcon(
                                  displayCalendar?.attCalWeek?.name
                                )}
                                alt={displayCalendar?.attCalWeek?.name}
                                className="w-4 h-4"
                              />
                              <span
                                className="text-blue-600 hover:underline cursor-pointer"
                                onClick={() =>
                                  handleClickFile(displayCalendar?.attCalWeek)
                                }
                              >
                                {orginName(displayCalendar?.attCalWeek?.name)}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-2 text-right text-xs font-semibold py-0.5">
                          Ghi chú:
                        </div>
                        <div className="col-span-10 text-xs py-0.5 whitespace-pre-wrap break-all">
                          {displayCalendar?.note}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-1">
                  <div className="bg-white border rounded-lg">
                    <div className="p-2 border-b bg-gray-200">
                      <h3 className="text-xs font-semibold">
                        Lịch sử chỉnh sửa
                      </h3>
                    </div>
                    <div className="p-1 max-h-80 overflow-y-auto">
                      {displayCalendar?.histories?.map(
                        (history: any, index: number) => (
                          <div key={index} className="mb-0.5">
                            <span
                              className="text-xs text-blue-600 hover:underline cursor-pointer"
                              onClick={() => handleOpenHistory(history, index)}
                            >
                              {history.userName} -{" "}
                              {format(
                                new Date(history.dateCreate),
                                "dd/MM/yyyy HH:mm"
                              )}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="p-2 border-t">
            <Button variant="outline" onClick={onClose} className="h-9">
              <X className="w-4 h-4 mr-1" />
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showHistoryDetail && selectedHistory && (
        <HistoryDetailModal
          isOpen={showHistoryDetail}
          onClose={handleCloseHistory}
          history={selectedHistory}
          calendar={displayCalendar.histories}
          historyIndex={historyIndex}
        />
      )}
    </>
  );
};

const HistoryDetailModal: React.FC<HistoryDetailProps> = ({
  isOpen,
  onClose,
  history,
  calendar,
  historyIndex,
}) => {
  if (!history) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <style jsx>{`
        [data-radix-dialog-overlay] {
          background-color: transparent !important;
        }
      `}</style>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto [&>button]:hidden"
        style={{ zIndex: 60 }}
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className="p-1">
          <DialogTitle className="text-lg font-semibold">
            Chi tiết chỉnh sửa
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-4 top-4"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="p-2 border-t">
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-xs font-semibold py-0.5">Nội dung:</div>
              <div className="text-xs py-0.5">
                <QuillViewer content={history?.description || ""} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="text-xs font-semibold py-0.5">
                Cá nhân nhận tệp:
              </div>
              <div className="text-xs py-0.5 break-all">
                {Array.isArray(history?.participantsGuest)
                  ? history.participantsGuest
                      .map(
                        (guest: any) => guest.fullName || guest.name || guest
                      )
                      .join(", ")
                  : history?.participantsGuest || "-"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="text-xs font-semibold py-0.5">
                Đơn vị nhận tệp:
              </div>
              <div className="text-xs py-0.5 break-all">
                {Array.isArray(history?.participantsOrg)
                  ? history.participantsOrg
                      .map((org: any) => org.fullName || org.name || org)
                      .join(", ")
                  : history?.participantsOrg || "-"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="text-xs font-semibold py-0.5">Thành phần:</div>
              <div className="text-xs py-0.5 break-all">
                {history?.participants}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="text-xs font-semibold py-0.5">Nhóm nhận tệp:</div>
              <div className="text-xs py-0.5 break-all">
                {Array.isArray(history?.participantsGroup)
                  ? history.participantsGroup
                      .map(
                        (group: any) => group.fullName || group.name || group
                      )
                      .join(", ")
                  : history?.participantsGroup || "-"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="text-xs font-semibold py-0.5">Địa điểm:</div>
              <div className="text-xs py-0.5 break-all">{history?.address}</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="text-xs font-semibold py-0.5">Ghi chú:</div>
              <div className="text-xs py-0.5 break-all">{history?.note}</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="text-xs font-semibold py-0.5">Bắt đầu:</div>
              <div className="text-xs py-0.5">{history?.startTimeStr}</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="text-xs font-semibold py-0.5">Kết thúc:</div>
              <div className="text-xs py-0.5">{history?.endTimeStr}</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="text-xs font-semibold py-0.5">Đăng ký ban:</div>
              <div className="text-xs py-0.5">
                {history?.registerBan ? "Đã đăng ký" : "Chưa đăng ký"}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="text-xs font-semibold py-0.5">Hành động:</div>
              <div className="text-xs py-0.5">{history?.actionStr}</div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="text-xs font-semibold py-0.5">Trạng thái:</div>
              <div className="text-xs py-0.5">
                <StatusBadge
                  status={history?.status}
                  statusName={history?.statusStr}
                  comment={history?.comment}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="text-xs font-semibold py-0.5">
                Công việc đính kèm:
              </div>
              <div className="text-xs py-0.5">
                {history?.taskList && history?.taskList.length > 0 ? (
                  <div className="space-y-0.5">
                    {history.taskList.map((task: any, index: number) => (
                      <div key={index} className="text-xs">
                        <span className="font-medium">{task.taskName}</span>
                        {task.taskDescription && (
                          <span className="text-gray-600 ml-1">
                            - {task.taskDescription}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <span className="text-gray-500 text-xs">Không có</span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="p-1 border-t bg-gray-50">
          <div className="text-center">
            <div className="mb-0 text-xs">
              Phiên bản:{" "}
              {(((calendar?.length || 0) - historyIndex - 1 + 10) / 10).toFixed(
                1
              )}
            </div>
            <div className="mb-0 text-xs">
              Đã tạo vào thời điểm{" "}
              {format(
                new Date(calendar?.[calendar.length - 1]?.dateCreate),
                "dd/MM/yyyy HH:mm"
              )}{" "}
              bởi{" "}
              <span className="text-blue-600">
                {calendar?.[calendar.length - 1]?.userName}
              </span>
            </div>
            {historyIndex < calendar.length - 1 && (
              <div className="mb-0 text-xs">
                Được sửa lúc{" "}
                {format(new Date(history?.dateCreate), "dd/MM/yyyy HH:mm")} bởi{" "}
                <span className="text-blue-600">{history?.userName}</span>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="p-2 border-t">
          <Button variant="outline" onClick={onClose} className="h-9">
            <X className="w-4 h-4 mr-1" />
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CalendarDetailModal;
