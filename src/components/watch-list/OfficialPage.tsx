"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Eye, LogIn, SignalIcon, StickyNote } from "lucide-react";
import { UserAction } from "@/definitions/types/watch-list.type";
import SelectWatchItemModal from "../../app/manage-watch-list/watch-list/modal/SelectWatchItemModal";
import LoadingFull from "../common/LoadingFull";
import {
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";

interface OfficialPageProps {
  userAction: UserAction;
  orgPermissionLocal: string[];
  watchListData: any[];
  isLoading: boolean;
  onOpenModalChangeHistory?: (item: any) => void;
  onOpenRejectWatchList?: (orgId: string, tab: string) => void;
  isAllValuesNull?: (obj: any) => boolean;
  isCanRejectFromComplete?: (id: number) => boolean;
}

export default function OfficialPage({
  userAction,
  orgPermissionLocal,
  watchListData,
  isLoading,
  onOpenModalChangeHistory,
  onOpenRejectWatchList,
  isAllValuesNull,
  isCanRejectFromComplete,
}: OfficialPageProps) {
  const [isFinishWatchItem, setIsFinishWatchItem] = useState<boolean>(false);
  const [isDeleteWatchItem, setIsDeleteWatchItem] = useState<boolean>(false);
  const [isAddWatchItem, setIsAddWatchItem] = useState<boolean>(false);
  const [watchUpdateList, setWatchUpdateList] = useState<any[]>([]);
  const [isSelectWatchItemModalOpen, setIsSelectWatchItemModalOpen] =
    useState<boolean>(false);

  const isCanNoteWatchItem = (element: any): boolean => {
    if (!element.workSchedules || element.workSchedules.length === 0)
      return false;

    const filteredData = element?.workSchedules?.filter(
      (item: any) =>
        item.departmentId && orgPermissionLocal.includes(`${item.departmentId}`)
    );

    if (filteredData && filteredData.length > 0) {
      return true;
    }

    return false;
  };

  const doUpdateWatchList = (time: string, action: string) => {
    if (action === "note") {
      setIsFinishWatchItem(true);
      setIsDeleteWatchItem(false);
      setIsAddWatchItem(false);
    }

    const findDay = watchListData?.find((item) => item.date === time);
    if (!findDay) return;

    const filteredData =
      findDay?.workSchedules?.filter((item: any) =>
        orgPermissionLocal.includes(`${item.departmentId}`)
      ) || [];

    if (filteredData && filteredData.length > 0) {
      setWatchUpdateList([...filteredData]);
      setIsSelectWatchItemModalOpen(true);
    }
  };

  const groupedData = watchListData.reduce(
    (acc: Record<number, any[]>, item) => {
      if (!acc[item.orgId]) {
        acc[item.orgId] = [];
      }
      acc[item.orgId].push(item);
      return acc;
    },
    {} as Record<number, any[]>
  );

  return (
    <div className="overflow-hidden mt-4">
      <div className="overflow-x-auto max-h-[60vh] 2xl:max-h-[70vh] overflow-y-auto">
        <table className="w-full min-w-[1200px]">
          <TableHeader className="bg-transparent">
            <TableRow className="bg-blue-600 text-white">
              <TableHead className="text-white text-basefont-bold text-center p-3 w-[15%] border-r bg-blue-600">
                CƠ QUAN
              </TableHead>
              <TableHead className="text-white text-base font-bold text-center p-3 w-[5%] border-r bg-blue-600">
                THỨ/NGÀY
              </TableHead>
              <TableHead className="text-white text-base font-bold text-center p-3 w-[15%] border-r bg-blue-600">
                HỌ VÀ TÊN
              </TableHead>
              <TableHead className="text-white text-base font-bold text-center p-3 w-[20%] border-r bg-blue-600">
                ĐƠN VỊ
              </TableHead>
              <TableHead className="text-white text-base font-bold text-center p-3 w-[15%] border-r bg-blue-600">
                CHỨC VỤ
              </TableHead>
              <TableHead className="text-white text-base font-bold text-center p-3 w-[10%] border-r bg-blue-600">
                VAI TRÒ
              </TableHead>
              <TableHead className="text-white text-base font-bold text-center p-3 w-[7%] border-r bg-blue-600">
                SỐ ĐIỆN THOẠI
              </TableHead>
              <TableHead className="text-white text-base font-bold text-center p-3 w-[7%] border-r bg-blue-600">
                GHI CHÚ
              </TableHead>
              <TableHead className="text-white text-base font-bold text-center p-3 w-[6%] border-r bg-blue-600">
                THEO DÕI
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="border-l border-b">
            {Object.entries(groupedData).map(([agency, items]) => {
              let isFirstOrgRow = true;

              return items
                ?.map((element: any, elementIndex: number) =>
                  element.workSchedules?.map((item: any, j: number) => {
                    const isFirstRowOfOrg =
                      isFirstOrgRow && elementIndex === 0 && j === 0;
                    const isFirstRowOfDate = j === 0;

                    if (isFirstRowOfOrg) {
                      isFirstOrgRow = false;
                    }

                    return (
                      <TableRow
                        key={`${element.orgId}-${element.date}-${j}`}
                        className="hover:bg-gray-50 border-b text-base"
                      >
                        {isFirstRowOfOrg && (
                          <TableCell
                            rowSpan={items.reduce(
                              (total, el) =>
                                total + (el.workSchedules?.length || 1),
                              0
                            )}
                            className="font-bold text-black border-r-2 p-3 text-center align-top bg-white"
                          >
                            {element.orgName}
                            {userAction.approveInBan &&
                              isCanRejectFromComplete?.(element.orgId) && (
                                <div className="mt-2 btn-center">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="action-table text-danger"
                                    title="Trả lại lịch chính thức"
                                    onClick={() =>
                                      onOpenRejectWatchList?.(
                                        element.orgId.toString(),
                                        "official"
                                      )
                                    }
                                  >
                                    <LogIn className="h-4 w-4 text-red-500" />
                                  </Button>
                                </div>
                              )}
                          </TableCell>
                        )}

                        {isFirstRowOfDate && (
                          <TableCell
                            rowSpan={element?.workSchedules?.length}
                            className="text-center p-3 border bg-white"
                          >
                            <div>
                              <div className="font-bold text-black">
                                {element.date}
                              </div>
                              {isCanNoteWatchItem(element) && (
                                <div className="mt-2 flex justify-center">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="action-table text-success"
                                    title="Ghi chú ca trực"
                                    onClick={() =>
                                      doUpdateWatchList(element.date, "note")
                                    }
                                  >
                                    <StickyNote className="h-4 w-4 text-green-500" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        )}

                        <TableCell className="text-center p-3 border bg-white">
                          {item.handler}
                        </TableCell>
                        <TableCell className="text-center p-3 border bg-white">
                          {item.departmentName}
                        </TableCell>
                        <TableCell className="text-center p-3 border bg-white">
                          {item.handlerPosition}
                        </TableCell>
                        <TableCell className="text-center p-3 border bg-white">
                          <span
                            className={`font-bold ${
                              item.schedulePosition === "Trực nghiệp vụ"
                                ? "text-blue-600"
                                : item.schedulePosition === "Trực chỉ huy"
                                  ? "text-red-600"
                                  : ""
                            }`}
                          >
                            {item.schedulePosition}
                          </span>
                        </TableCell>
                        <TableCell className="text-center p-3 border bg-white">
                          {item.handlerPhone}
                        </TableCell>
                        <TableCell className="p-3 border bg-white text-justify">
                          {item.note}
                        </TableCell>
                        <TableCell className="text-center p-3 border bg-white">
                          <div className="flex justify-center space-x-1">
                            {isAllValuesNull?.(item) === false && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-8 p-0"
                                onClick={() => onOpenModalChangeHistory?.(item)}
                                title="Xem lịch sử chỉnh sửa"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )
                .flat();
            })}
          </TableBody>
        </table>
      </div>

      <SelectWatchItemModal
        open={isSelectWatchItemModalOpen}
        onOpenChange={(open) => {
          setIsSelectWatchItemModalOpen(open);
          if (!open) {
            setIsFinishWatchItem(false);
            setIsDeleteWatchItem(false);
            setIsAddWatchItem(false);
          }
        }}
        watchUpdateList={watchUpdateList}
        isFinishWatchItem={isFinishWatchItem}
        isDeleteWatchItem={isDeleteWatchItem}
        isAddWatchItem={isAddWatchItem}
      />

      <LoadingFull isLoading={isLoading} />
    </div>
  );
}
