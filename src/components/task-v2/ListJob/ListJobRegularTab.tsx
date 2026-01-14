"use client";

import { Edit, Check, FileDown } from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { formatDate } from "@/utils/datetime.utils";
import {
  useGetRegularWeek,
  useUpdateRegularWeek,
  useExportRegularWeek,
} from "@/hooks/data/taskv2.data";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ToastUtils } from "@/utils/toast.utils";
import { Table } from "@/components/ui/table";
import { Column } from "@/definitions/types/table.type";
import saveAs from "file-saver";
import EditRegularModal from "./EditRegularModal";
import { handleError, getCycleDays } from "@/utils/common.utils";
import { RegularDay } from "@/definitions/interfaces/task.interface";
import { EVALUATION_LEVELS } from "@/definitions/enums/task.enum";

interface RegularEvaluation {
  userId?: number;
  userName?: string;
  orgName?: string;
  result: string;
  approved: boolean | null;
  reason?: string;
  resultStr?: string;
  date?: any;
}

interface UserEvaluationData {
  userId: number;
  userName: string;
  orgName?: string;
  evaluationMap: Record<string, RegularEvaluation>;
}

interface EditRegularDayData extends RegularDay {
  result: string | null;
  reason: string;
  id: number | null;
  approved: boolean;
}

export default function ListJobRegularTab() {
  const { data: apiData, isLoading: apiLoading } = useGetRegularWeek(true);

  const regularWeek = useMemo(() => {
    return apiData;
  }, [apiData]);

  const isLoadingRegularWeek = apiLoading;
  const updateRegularWeekMutation = useUpdateRegularWeek();
  const exportExcelMutation = useExportRegularWeek();

  const [regularEvaluationList, setRegularEvaluationList] = useState<
    UserEvaluationData[]
  >([]);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserEvaluationData | null>(
    null
  );
  const [editRegularData, setEditRegularData] = useState<EditRegularDayData[]>(
    []
  );

  const regularDays = useMemo(() => getCycleDays(), []);

  useEffect(() => {
    if (!regularWeek || !Array.isArray(regularWeek)) {
      setRegularEvaluationList((prev) => {
        if (prev.length === 0) return prev;
        return [];
      });
      return;
    }

    const userMap = new Map<number, UserEvaluationData>();

    regularWeek.forEach((item: any) => {
      // Kiểm tra userId có tồn tại
      if (!item.userId) return;

      const userId = item.userId;
      if (!userMap.has(userId)) {
        userMap.set(userId, {
          userId: item.userId,
          userName: item.userName || "",
          orgName: item.orgName || "",
          evaluationMap: {},
        });
      }

      const user = userMap.get(userId)!;

      if (!Array.isArray(item.date) || item.date.length < 3) return;

      const [year, month, day] = item.date;

      if (year == null || month == null || day == null) return;

      const dStr = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

      let matchedResult = item.result;
      if (!matchedResult && item.resultStr) {
        const level = EVALUATION_LEVELS.find((l) => l.label === item.resultStr);
        if (level) matchedResult = level.value;
      }

      user.evaluationMap[dStr] = { ...item, result: matchedResult };
    });

    const newList = Array.from(userMap.values());

    // Only update if data actually changed
    setRegularEvaluationList((prev) => {
      // Simple comparison: check if length and first item changed
      if (
        prev.length === newList.length &&
        prev.length > 0 &&
        prev[0]?.userId === newList[0]?.userId &&
        JSON.stringify(prev[0]?.evaluationMap) ===
          JSON.stringify(newList[0]?.evaluationMap)
      ) {
        return prev; // No change, return previous state
      }
      return newList;
    });
  }, [regularWeek]);

  const handleApprove = useCallback((user: UserEvaluationData) => {
    setSelectedUser(user);
    setShowApproveModal(true);
  }, []);

  const confirmApprove = async () => {
    if (!selectedUser) return;

    const evaluations = Object.values(selectedUser.evaluationMap);
    if (evaluations.length === 0) {
      ToastUtils.warning("Người này chưa có đánh giá nào để duyệt");
      return;
    }

    const toApprove = evaluations.filter(
      (e: any) => e.result && e.approved === false
    );

    if (toApprove.length === 0) {
      ToastUtils.info("Không có đánh giá mới nào cần duyệt");
      setShowApproveModal(false);
      return;
    }

    try {
      for (const evalItem of toApprove) {
        const payload = {
          userId: selectedUser.userId,
          date: `${evalItem.date[0]}-${String(evalItem.date[1]).padStart(2, "0")}-${String(evalItem.date[2]).padStart(2, "0")}`,
          result: evalItem.result,
          approved: true,
          reason: evalItem.reason || "",
        };

        await updateRegularWeekMutation.mutateAsync(payload);
      }

      ToastUtils.success("Duyệt đánh giá thành công");
      setShowApproveModal(false);
    } catch (error) {
      ToastUtils.error("Có lỗi khi duyệt đánh giá");
    }
  };

  const handleEdit = useCallback(
    (user: UserEvaluationData) => {
      setSelectedUser(user);
      const initialData: EditRegularDayData[] = regularDays.map((day) => ({
        ...day,
        result: null,
        reason: "",
        id: null,
        approved: false,
      }));

      // Populate with existing data
      regularDays.forEach((day) => {
        const evalData = user.evaluationMap[day.dateStr];
        if (evalData) {
          const editItem = initialData.find((d) => d.dateStr === day.dateStr);
          if (editItem) {
            editItem.result = evalData.result || "";
            editItem.reason = evalData.reason || "";
            editItem.approved = evalData.approved === true;
          }
        }
      });

      setEditRegularData(initialData);
      setShowEditModal(true);
    },
    [regularDays]
  );

  const saveRegularEdit = async () => {
    if (!selectedUser) return;

    const toUpdate = editRegularData.filter((d) => d.result && !d.approved);

    if (toUpdate.length === 0) {
      ToastUtils.info(
        "Không có thay đổi nào cần lưu (các mục đã duyệt không thể sửa)"
      );
      return;
    }

    try {
      for (const item of toUpdate) {
        const payload = {
          userId: selectedUser.userId,
          date: item.dateStr,
          result: item.result,
          approved: true,
          reason: item.reason || "",
        };

        await updateRegularWeekMutation.mutateAsync(payload);
      }

      ToastUtils.success("Cập nhật đánh giá thành công");
      setShowEditModal(false);
      setSelectedUser(null);
      setEditRegularData([]);
    } catch (error) {
      ToastUtils.error("Có lỗi khi cập nhật đánh giá");
    }
  };

  const handleExportRegular = async () => {
    try {
      const fileName = "Danh_sach_cong_viec_thuong_xuyen.xlsx";
      const response = await exportExcelMutation.mutateAsync();
      if (response) {
        const blob = new Blob([response.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(blob, fileName);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const getRowStatus = (user: UserEvaluationData): string => {
    const evaluations = Object.values(user.evaluationMap);
    if (evaluations.length === 0) return "Chưa đánh giá";

    const hasFalse = evaluations.some((e: any) => e.approved === false);
    if (hasFalse) return "Chờ duyệt";

    const hasNull = evaluations.some((e: any) => e.approved === null);
    if (hasNull) return "Chưa xác nhận";

    const allTrue = evaluations.every((e: any) => e.approved === true);
    if (allTrue) return "Đã duyệt";

    return "Chưa xác nhận";
  };

  const getStatusClass = (status: string): string => {
    switch (status) {
      case "Đã duyệt":
        return "bg-green-500";
      case "Chờ duyệt":
        return "bg-yellow-500";
      case "Chưa xác nhận":
      case "Chưa đánh giá":
        return "bg-gray-500";
      default:
        return "bg-gray-300";
    }
  };

  const getEvaluationBadgeClass = (resultLabel: string): string => {
    switch (resultLabel) {
      case "Hoàn thành xuất sắc":
        return "bg-green-500 text-white";
      case "Hoàn thành tốt":
        return "bg-blue-500 text-white";
      case "Hoàn thành":
        return "bg-blue-300 text-white";
      case "Không hoàn thành":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  const columns: Column<UserEvaluationData>[] = useMemo(
    () => [
      {
        header: "STT",
        accessor: (_row, index) => index + 1,
        className: "text-center w-16",
      },
      {
        header: "Họ và tên",
        accessor: (row) => row.userName,
        className: "text-left font-semibold",
      },
      ...regularDays.map((day) => ({
        header: (
          <div className="text-center">
            {day.label}
            <br />
            <small className="font-normal text-xs">
              ({formatDate(day.date, "DD/MM")})
            </small>
          </div>
        ),
        accessor: (row: UserEvaluationData) => {
          const evalData = row.evaluationMap[day.dateStr];
          if (!evalData) {
            return <span className="text-gray-400 text-sm">-</span>;
          }

          const resultLabel =
            EVALUATION_LEVELS.find((l) => l.value === evalData.result)?.label ||
            evalData.resultStr ||
            "Chưa đánh giá";

          const badgeClass = getEvaluationBadgeClass(resultLabel);

          return (
            <div className="flex flex-col items-center gap-1">
              <span
                className={`inline-block px-2 py-1 rounded text-xs ${badgeClass}`}
              >
                {resultLabel}
              </span>
              {evalData.reason && (
                <div className="text-xs text-gray-500 italic mt-1">
                  Lý do: {evalData.reason}
                </div>
              )}
            </div>
          );
        },
        className: "text-center",
      })),
      {
        header: "Trạng thái",
        accessor: (row) => {
          const status = getRowStatus(row);
          return (
            <span
              className={`inline-block px-2 py-1 rounded text-white text-xs ${getStatusClass(status)}`}
            >
              {status}
            </span>
          );
        },
        className: "text-center",
      },
      {
        header: "Thao tác",
        type: "actions",
        accessor: () => null,
        className: "text-center w-32",
        renderActions: (row: UserEvaluationData) => (
          <div className="flex items-center justify-center gap-1.5">
            <Button
              variant="ghost"
              size="sm"
              className="p-1 hover:bg-blue-100 rounded transition-colors"
              title="Sửa"
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(row);
              }}
            >
              <Edit className="w-4 h-4 text-blue-600" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="p-1 hover:bg-green-100 rounded transition-colors"
              title="Duyệt"
              onClick={(e) => {
                e.stopPropagation();
                handleApprove(row);
              }}
            >
              <Check className="w-4 h-4 text-green-600" />
            </Button>
          </div>
        ),
      },
    ],
    [regularDays, handleEdit, handleApprove]
  );

  return (
    <>
      <div className="space-y-4 border border-gray-200 rounded-lg px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-gray-900">
            QUẢN LÝ ĐÁNH GIÁ CÔNG VIỆC THƯỜNG XUYÊN
          </h2>

          <div className="flex items-center gap-2">
            <Button
              className="bg-green-500 text-white hover:bg-green-600 h-7"
              onClick={handleExportRegular}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Xuất file excel
            </Button>
            {regularDays.length > 0 && (
              <span className="text-sm text-gray-500 bg-blue-100 px-3 py-1 rounded h-7 flex items-center">
                Chu kỳ: {formatDate(regularDays[0].date, "DD/MM")} -{" "}
                {formatDate(regularDays[4].date, "DD/MM/YYYY")}
              </span>
            )}
          </div>
        </div>

        <Table
          columns={columns}
          dataSource={regularEvaluationList}
          showPagination={false}
          emptyText="Không có dữ liệu đánh giá trong tuần này"
          loading={isLoadingRegularWeek}
        />
      </div>

      <Dialog open={showApproveModal} onOpenChange={setShowApproveModal}>
        <DialogContent className="max-w-md">
          <DialogHeader className="bg-green-600 text-white -mx-6 -mt-6 px-6 py-4 rounded-t-lg">
            <DialogTitle>DUYỆT ĐÁNH GIÁ CÔNG VIỆC</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="mb-0">
              Duyệt tất cả đánh giá trong tuần của:{" "}
              <strong>{selectedUser?.userName}</strong>
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowApproveModal(false)}
            >
              Hủy
            </Button>
            <Button
              className="bg-green-600 hover:bg-green-700 text-white"
              onClick={confirmApprove}
            >
              Xác nhận Duyệt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal Chỉnh sửa */}
      <EditRegularModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        userName={selectedUser?.userName}
        editData={editRegularData}
        onDataChange={setEditRegularData}
        onSave={saveRegularEdit}
      />
    </>
  );
}
