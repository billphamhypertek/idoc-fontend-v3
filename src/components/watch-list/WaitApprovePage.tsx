"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CheckCircle, ArrowLeft, Eye } from "lucide-react";
import { UserAction } from "@/definitions/types/watch-list.type";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import { useFinishWatchList } from "@/hooks/data/watch-list.action";
import { handleError } from "@/utils/common.utils";
import LoadingFull from "../common/LoadingFull";
import {
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { ToastUtils } from "@/utils/toast.utils";

interface WaitApprovePageProps {
  userAction: UserAction;
  orgPermissionLocal: string[];
  watchListData: any[];
  isLoading: boolean;
  onOpenModalChangeHistory?: (item: any) => void;
  isAllValuesNull?: (obj: any) => boolean;
  isCanFinishAndReject?: (id: number) => boolean;
  fromDate: string;
  toDate: string;
  onOpenRejectWatchList?: (orgId: string, tab: string) => void;
  statusAdd: boolean;
  setStatusAdd: (status: boolean) => void;
}

export default function WaitApprovePage({
  userAction,
  orgPermissionLocal,
  watchListData,
  isLoading,
  onOpenModalChangeHistory,
  isAllValuesNull,
  isCanFinishAndReject,
  fromDate,
  toDate,
  onOpenRejectWatchList,
  statusAdd,
  setStatusAdd,
}: WaitApprovePageProps) {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<number | null>(null);
  const [isFinishing, setIsFinishing] = useState(false);

  const { mutateAsync: finishWatchList } = useFinishWatchList();

  const doFinishWatchListUnit = (orgId: number) => {
    setSelectedOrgId(orgId);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmFinish = async () => {
    if (!selectedOrgId) return;

    try {
      setIsFinishing(true);

      const formData = new FormData();
      formData.append("fromDate", fromDate);
      formData.append("toDate", toDate);
      formData.append("orgIds", selectedOrgId.toString());

      const response = await finishWatchList(formData);

      if (response.success) {
        ToastUtils.success("Duyệt lịch trực của đơn vị thành công");
        setStatusAdd(false);
      } else {
        ToastUtils.error("Lỗi duyệt lịch đơn vị");
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsFinishing(false);
      setIsConfirmDialogOpen(false);
      setSelectedOrgId(null);
    }
  };

  // const isCanNoteWatchItem = (element: any): boolean => {
  //   if (!element.workSchedules || element.workSchedules.length === 0)
  //     return false;

  //   const filteredData = element?.workSchedules?.filter(
  //     (item: any) =>
  //       item.departmentId &&
  //       orgPermissionLocal.includes(`${item.departmentId}`),
  //   );

  //   if (filteredData && filteredData.length > 0) {
  //     return true;
  //   }

  //   return false;
  // };

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

                            {/* Wait Approve Actions */}
                            {userAction.approveInBan && (
                              <div className="mt-2 btn-center">
                                {isCanFinishAndReject?.(element.orgId) && (
                                  <>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        doFinishWatchListUnit(element.orgId)
                                      }
                                      className="action-table text-success mr-1"
                                      title="Duyệt lịch"
                                    >
                                      <CheckCircle className="h-4 w-4 text-green-500" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        onOpenRejectWatchList?.(
                                          element.orgId.toString(),
                                          "waitApprove"
                                        )
                                      }
                                      className="action-table text-danger"
                                      title="Trả lại"
                                    >
                                      <ArrowLeft className="h-4 w-4 text-red-500" />
                                    </Button>
                                  </>
                                )}
                              </div>
                            )}

                            <div className="mt-2 text-center">
                              {statusAdd ? (
                                <span className={`font-bold text-red-600`}>
                                  LỊCH ĐÃ DUYỆT
                                </span>
                              ) : (
                                <span className={`font-bold text-blue-600`}>
                                  LỊCH CHƯA DUYỆT
                                </span>
                              )}
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
                                <Eye className="h-4 w-4 text-green-500" />
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

      <ConfirmDeleteDialog
        isOpen={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onConfirm={handleConfirmFinish}
        title="Xác nhận duyệt lịch trực"
        description="Xác nhận duyệt lịch trực của đơn vị"
        confirmText="Đồng ý"
        cancelText="Hủy"
        isLoading={isFinishing}
        positionButton={true}
      />

      <LoadingFull isLoading={isLoading} />
    </div>
  );
}
