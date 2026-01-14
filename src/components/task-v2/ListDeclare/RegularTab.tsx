"use client";

import { Calendar, Save, Edit, X } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { formatDate } from "@/utils/datetime.utils";
import {
  useGetRegularWeek,
  useUpdateRegularWeek,
} from "@/hooks/data/taskv2.data";
import { getUserInfo } from "@/utils/authentication.utils";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ToastUtils } from "@/utils/toast.utils";
import { Table } from "@/components/ui/table";
import { Column } from "@/definitions/types/table.type";
import { EVALUATION_LEVELS } from "@/definitions/enums/task.enum";
import { getCycleDays } from "@/utils/common.utils";
import { RegularDay } from "@/definitions/interfaces/task.interface";

interface RegularEvaluation {
  result: string;
  approved: boolean | null;
  isEdit: boolean;
  reason?: string;
  resultStr?: string;
}

interface RegularDayData extends RegularDay {
  evaluation: RegularEvaluation;
}

export default function RegularTab() {
  const { data: regularWeek, isLoading: isLoadingRegularWeek } =
    useGetRegularWeek(false);
  const updateRegularWeekMutation = useUpdateRegularWeek();
  const [regularEvaluations, setRegularEvaluations] = useState<
    Record<string, RegularEvaluation>
  >({});
  const [showReasonModal, setShowReasonModal] = useState(false);
  const [tempReason, setTempReason] = useState("");
  const [selectedDayForReason, setSelectedDayForReason] =
    useState<RegularDay | null>(null);
  const currentUser = getUserInfo();

  const regularDays = useMemo(() => getCycleDays(), []);

  useEffect(() => {
    if (regularDays.length === 0) return;

    const initialEvaluations: Record<string, RegularEvaluation> = {};
    regularDays.forEach((day) => {
      initialEvaluations[day.dateStr] = {
        result: "",
        approved: null,
        isEdit: false,
        reason: "",
      };
    });

    if (regularWeek) {
      const dataList = Array.isArray(regularWeek)
        ? regularWeek
        : regularWeek?.dates || [];

      if (dataList && dataList.length > 0) {
        dataList.forEach((item: any) => {
          if (Array.isArray(item.date)) {
            const year = item.date[0];
            const month = String(item.date[1]).padStart(2, "0");
            const day = String(item.date[2]).padStart(2, "0");
            const dateStr = `${year}-${month}-${day}`;

            if (initialEvaluations[dateStr]) {
              let matchedResult = item.result;
              if (!matchedResult && item.resultStr) {
                const level = EVALUATION_LEVELS.find(
                  (l) => l.label === item.resultStr
                );
                if (level) matchedResult = level.value;
              }

              initialEvaluations[dateStr] = {
                ...item,
                date: dateStr,
                result: matchedResult || "",
                isEdit: !!(matchedResult || item.resultStr),
                reason: item.reason || "",
              };
            }
          }
        });
      }
    }

    setRegularEvaluations(initialEvaluations);
  }, [regularWeek, regularDays]);

  const saveRegularEvaluation = (day: RegularDay) => {
    const evalData = regularEvaluations[day.dateStr];

    if (!evalData.result) {
      ToastUtils.warning("Vui lòng chọn mức độ hoàn thành", "Thông báo");
      return;
    }

    if (evalData.result !== "HOAN_THANH_TOT" && !evalData.reason) {
      setSelectedDayForReason(day);
      setTempReason("");
      setShowReasonModal(true);
      return;
    }

    executeSaveRegularEvaluation(day);
  };

  const executeSaveRegularEvaluation = async (
    day: RegularDay,
    reasonOverride?: string
  ) => {
    const evalData = regularEvaluations[day.dateStr];

    const payload = {
      userId: currentUser?.id,
      date: day.dateStr,
      result: evalData.result,
      approved: null,
      reason:
        reasonOverride !== undefined ? reasonOverride : evalData.reason || "",
    };

    try {
      await updateRegularWeekMutation.mutateAsync(payload);
      ToastUtils.success("Lưu đánh giá thành công", "Thành công");

      setRegularEvaluations((prev) => ({
        ...prev,
        [day.dateStr]: {
          ...prev[day.dateStr],
          isEdit: true,
        },
      }));
    } catch (error) {
      ToastUtils.error("Có lỗi xảy ra khi lưu đánh giá", "Lỗi");
    }
  };

  const confirmReason = () => {
    if (!tempReason.trim()) {
      ToastUtils.warning("Vui lòng nhập lý do", "Thông báo");
      return;
    }

    if (selectedDayForReason) {
      setShowReasonModal(false);

      setRegularEvaluations((prev) => ({
        ...prev,
        [selectedDayForReason.dateStr]: {
          ...prev[selectedDayForReason.dateStr],
          reason: tempReason,
        },
      }));

      executeSaveRegularEvaluation(selectedDayForReason, tempReason);
    }
  };

  const enableEdit = (day: RegularDay) => {
    setRegularEvaluations((prev) => ({
      ...prev,
      [day.dateStr]: {
        ...prev[day.dateStr],
        isEdit: false,
      },
    }));
  };

  const onEvaluationChange = (day: RegularDay, value: string) => {
    setRegularEvaluations((prev) => {
      const updated = {
        ...prev,
        [day.dateStr]: {
          ...prev[day.dateStr],
          result: value,
          reason: value === "HOAN_THANH_TOT" ? "" : prev[day.dateStr].reason,
        },
      };
      return updated;
    });
  };

  const getStatusLabel = (item: RegularEvaluation): string => {
    if (!item || (!item.result && !item.resultStr)) return "Chưa đánh giá";
    const approved = item.approved;
    if (approved === true) return "Đã duyệt";
    if (approved === false) return "Chờ duyệt";
    return "Chờ duyệt";
  };

  const getStatusClass = (item: RegularEvaluation): string => {
    if (!item || (!item.result && !item.resultStr)) return "bg-gray-500";
    const approved = item.approved;
    if (approved === true) return "bg-green-500";
    if (approved === false) return "bg-yellow-500";
    return "bg-yellow-500";
  };

  const dataSource: RegularDayData[] = regularDays.map((day) => ({
    ...day,
    evaluation: regularEvaluations[day.dateStr] || {
      result: "",
      approved: null,
      isEdit: false,
      reason: "",
    },
  }));

  const columns: Column<RegularDayData>[] = [
    {
      header: "Thứ",
      accessor: (row: RegularDayData) => row.label,
      className: "w-[5%] text-center font-semibold",
    },
    {
      header: "Ngày",
      accessor: (row: RegularDayData) => formatDate(row.date, "DD/MM/YYYY"),
      className: "w-[10%] text-center text-gray-600",
    },
    ...EVALUATION_LEVELS.map((level) => ({
      header: level.label,
      accessor: (row: RegularDayData) => {
        const evalData = row.evaluation;
        return (
          <div className="flex flex-col items-center gap-1">
            <RadioGroup
              value={evalData.result}
              onValueChange={(value) => onEvaluationChange(row, value)}
              disabled={evalData.isEdit}
              className="flex justify-center"
            >
              <RadioGroupItem
                value={level.value}
                id={`${row.dateStr}_${level.value}`}
                className="h-6 w-6 rounded-full border-2 border-gray-300 bg-white [&[data-state=checked]]:!border-green-600 [&[data-state=checked]]:!bg-green-500 [&[data-state=checked]]:!text-green-500 [&>span]:hidden relative
                            [&[data-state=checked]]:before:content-[''] [&[data-state=checked]]:before:absolute [&[data-state=checked]]:before:inset-[5px] [&[data-state=checked]]:before:rounded-full [&[data-state=checked]]:before:bg-white"
              />
            </RadioGroup>
            {evalData.result === level.value && evalData.reason && (
              <div className="text-xs text-gray-500 italic mt-1 max-w-[150px]">
                Lý do: {evalData.reason}
              </div>
            )}
          </div>
        );
      },
      className: "w-[15%] text-center",
    })),
    {
      header: "Trạng thái",
      accessor: (row: RegularDayData) => {
        const evalData = row.evaluation;
        return (
          <span
            className={`inline-block px-2 py-1 rounded text-white text-xs ${getStatusClass(evalData)}`}
          >
            {getStatusLabel(evalData)}
          </span>
        );
      },
      className: "w-[10%] text-center",
    },
    {
      header: "Thao tác",
      type: "actions",
      accessor: () => null,
      className: "w-[10%] text-center",
      renderActions: (row: RegularDayData) => {
        const evalData = row.evaluation;
        return !evalData.isEdit ? (
          <Button
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={evalData.approved === true}
            onClick={(e) => {
              e.stopPropagation();
              saveRegularEvaluation(row);
            }}
          >
            <Save className="w-4 h-4 mr-1" />
            Lưu
          </Button>
        ) : (
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={evalData.approved === true}
            onClick={(e) => {
              e.stopPropagation();
              enableEdit(row);
            }}
          >
            <Edit className="w-4 h-4 mr-1" />
            Sửa
          </Button>
        );
      },
    },
  ];

  return (
    <>
      <div className="space-y-4 border border-gray-200 rounded-lg px-4 py-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-gray-500" />
            <h2 className="text-base font-semibold text-gray-900">
              TỰ ĐÁNH GIÁ CÔNG VIỆC THƯỜNG XUYÊN
            </h2>
          </div>

          {regularDays.length > 0 && (
            <span className="text-sm text-gray-500 bg-blue-100 px-3 py-1 rounded">
              Chu kỳ: {formatDate(regularDays[0].date, "DD/MM")} -{" "}
              {formatDate(regularDays[4].date, "DD/MM/YYYY")}
            </span>
          )}
        </div>

        <Table
          columns={columns}
          dataSource={dataSource}
          showPagination={false}
          emptyText="Không có dữ liệu"
          loading={isLoadingRegularWeek}
        />
      </div>

      <Dialog open={showReasonModal} onOpenChange={setShowReasonModal}>
        <DialogContent className="max-w-lg [&>button]:hidden p-0 border-t-0 border-l-0 border-r-0 sm:rounded-t-2xl">
          <DialogHeader className="flex justify-between items-center flex-row space-y-0 p-5 bg-blue-600 text-white rounded-t-xl">
            <DialogTitle>NHẬP LÝ DO ĐÁNH GIÁ</DialogTitle>
            <X
              className="w-4 h-4 cursor-pointer"
              onClick={() => setShowReasonModal(false)}
            />
          </DialogHeader>
          <div className="px-4 py-4">
            <Label className="font-semibold">
              Lý do (Bắt buộc) <span className="text-red-500">*</span>
            </Label>
            <Textarea
              className="mt-2"
              rows={4}
              value={tempReason}
              onChange={(e) => setTempReason(e.target.value)}
              placeholder="Vui lòng nhập lý do cho mức độ đánh giá này..."
            />
          </div>
          <DialogFooter className="px-4 pb-4">
            <Button variant="outline" onClick={() => setShowReasonModal(false)}>
              Hủy
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white"
              onClick={confirmReason}
            >
              Xác nhận & Lưu
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
