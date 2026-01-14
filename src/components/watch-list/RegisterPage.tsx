"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Eye, CalendarPlus, Pencil, StickyNote } from "lucide-react";
import SelectWatchItemModal from "../../app/manage-watch-list/watch-list/modal/SelectWatchItemModal";
import WatchItemModal from "../../app/manage-watch-list/watch-list/modal/WatchItemModal";
import { UserAction } from "@/definitions/types/watch-list.type";
import { toast } from "@/hooks/use-toast";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import {
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ToastUtils } from "@/utils/toast.utils";
import LoadingFull from "../common/LoadingFull";

interface RegisterPageProps {
  userAction: UserAction;
  orgPermissionLocal: string[];
  watchListData: any[];
  isLoading: boolean;
  statusAdd: boolean;
  orgSelected: {
    id: number | null;
    name: string | null;
    parentId: number | null;
  };
  onOpenModalChangeHistory?: (item: any) => void;
  isAllValuesNull?: (obj: any) => boolean;
  isCreateTrucChiHuy?: boolean;
  listCVV?: any[];
}

export default function RegisterPage({
  userAction,
  orgPermissionLocal,
  watchListData,
  isLoading,
  statusAdd,
  orgSelected,
  onOpenModalChangeHistory,
  isAllValuesNull,
  isCreateTrucChiHuy,
  listCVV,
}: RegisterPageProps) {
  const [isFinishWatchItem, setIsFinishWatchItem] = useState<boolean>(false);
  const [isDeleteWatchItem, setIsDeleteWatchItem] = useState<boolean>(false);
  const [isAddWatchItem, setIsAddWatchItem] = useState<boolean>(false);
  const [watchUpdateList, setWatchUpdateList] = useState<any[]>([]);
  const [isSelectWatchItemModalOpen, setIsSelectWatchItemModalOpen] =
    useState<boolean>(false);
  const [isWatchItemModalOpen, setIsWatchItemModalOpen] =
    useState<boolean>(false);
  const [watchDateStr, setWatchDateStr] = useState<string>("");
  const [editWatchItemData, setEditWatchItemData] = useState<any>(null);

  const isCanAdd = (time: string, actionType: "add" | "update"): boolean => {
    const findDay = watchListData.find((item) => item.date === time);

    if (!findDay) return false;

    const filteredData = findDay?.workSchedules?.filter((item: any) =>
      orgPermissionLocal.includes(`${item.departmentId}`)
    );

    if (filteredData.length === 0) return false;

    if (actionType == "add") {
      if (orgSelected?.id != 2 && orgPermissionLocal.length > 1) {
        const orgPermissionInUnit = orgPermissionLocal.filter(
          (num) => num !== "2"
        );
        if (
          filteredData &&
          filteredData.length > 0 &&
          orgPermissionInUnit &&
          orgPermissionInUnit.length > 0 &&
          orgPermissionInUnit.length == filteredData.length
        ) {
          return true;
        } else {
          return false;
        }
      }

      if (filteredData && filteredData.length > 0) {
        return true;
      }

      return false;
    } else {
      if (filteredData && filteredData.length > 0) {
        return true;
      }

      return false;
    }
  };

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
    switch (action) {
      case "add":
        setEditWatchItemData(null);
        setWatchDateStr(time);
        setIsWatchItemModalOpen(true);
        return;

      case "edit":
        setIsFinishWatchItem(false);
        setIsDeleteWatchItem(false);
        setIsAddWatchItem(false);
        break;

      case "delete":
        setIsFinishWatchItem(false);
        setIsDeleteWatchItem(true);
        setIsAddWatchItem(false);
        break;

      case "note":
        setIsFinishWatchItem(true);
        setIsDeleteWatchItem(false);
        setIsAddWatchItem(false);
        break;

      default:
        break;
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
    } else {
      ToastUtils.error("Ca trực trống không thể tạo ghi chú");
    }
  };

  const handleEditWatchItem = (item: any) => {
    setEditWatchItemData(item);
    setIsSelectWatchItemModalOpen(false);
    setWatchDateStr(item.date);
    setIsWatchItemModalOpen(true);
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
              <TableHead className="text-white text-base font-bold text-center p-3 w-[15%] border-r bg-blue-600">
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
                            <div className="mt-2 text-center">
                              <span className={`font-bold text-blue-600`}>
                                {!statusAdd
                                  ? "LỊCH CHƯA DUYỆT"
                                  : "LỊCH ĐÃ DUYỆT"}
                              </span>
                            </div>
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
                              {!statusAdd && (
                                <div className="mt-2 flex justify-center space-x-1">
                                  {!isCanAdd(element.date, "add") && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        doUpdateWatchList(element.date, "add")
                                      }
                                      className="action-table text-success"
                                      title="Thêm mới"
                                    >
                                      <CalendarPlus className="h-4 w-4 text-green-500" />
                                    </Button>
                                  )}
                                  {isCanAdd(element.date, "update") && (
                                    <>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          doUpdateWatchList(
                                            element.date,
                                            "edit"
                                          )
                                        }
                                        className="action-table text-info"
                                        title="Chỉnh sửa"
                                      >
                                        <Pencil className="h-4 w-4 text-blue-500" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          doUpdateWatchList(
                                            element.date,
                                            "delete"
                                          )
                                        }
                                        className="action-table text-danger"
                                        title="Xóa"
                                      >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </>
                                  )}
                                  {isCanNoteWatchItem(element) && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        doUpdateWatchList(element.date, "note")
                                      }
                                      className="action-table text-success"
                                      title="Ghi chú ca trực"
                                    >
                                      <StickyNote className="h-4 w-4 text-green-500" />
                                    </Button>
                                  )}
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
        onEditWatchItem={handleEditWatchItem}
      />

      <WatchItemModal
        open={isWatchItemModalOpen}
        onOpenChange={(open) => {
          setIsWatchItemModalOpen(open);
          if (!open) {
            setEditWatchItemData(null);
          }
        }}
        watchDateStr={watchDateStr}
        isUpdateForm={!!editWatchItemData}
        userAction={userAction}
        orgSelected={orgSelected || undefined}
        isCreateTrucChiHuy={isCreateTrucChiHuy || false}
        editData={editWatchItemData}
        listCVV={listCVV}
      />

      <LoadingFull isLoading={isLoading} />
    </div>
  );
}
