"use client";

import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Table } from "@/components/ui/table";
import { Column } from "@/definitions/types/table.type";
import { formatDate } from "@/utils/datetime.utils";
import { Input } from "@/components/ui/input";
import { useMemo, useCallback, useRef, useEffect } from "react";
import { EVALUATION_LEVELS } from "@/definitions/enums/task.enum";

interface EditRegularDayData {
  label: string;
  date: Date;
  dateStr: string;
  result: string | null;
  reason: string;
  id: number | null;
  approved: boolean;
}

interface EditRegularModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userName?: string;
  editData: EditRegularDayData[];
  onDataChange: (data: EditRegularDayData[]) => void;
  onSave: () => void;
}

export default function EditRegularModal({
  open,
  onOpenChange,
  userName,
  editData,
  onDataChange,
  onSave,
}: EditRegularModalProps) {
  // Use ref to store latest editData to avoid dependency issues
  const editDataRef = useRef(editData);

  useEffect(() => {
    editDataRef.current = editData;
  }, [editData]);

  const handleResultChange = useCallback(
    (dateStr: string, value: string) => {
      const updated = editDataRef.current.map((item) =>
        item.dateStr === dateStr ? { ...item, result: value } : item
      );
      onDataChange(updated);
    },
    [onDataChange]
  );

  const handleReasonChange = useCallback(
    (dateStr: string, value: string) => {
      const updated = editDataRef.current.map((item) =>
        item.dateStr === dateStr ? { ...item, reason: value } : item
      );
      onDataChange(updated);
    },
    [onDataChange]
  );

  const columns: Column<EditRegularDayData>[] = useMemo(
    () => [
      {
        header: "THỨ",
        accessor: (row) => row.label,
        className: "text-center font-semibold w-20",
      },
      {
        header: "NGÀY",
        accessor: (row) => formatDate(row.date, "DD/MM/YYYY"),
        className: "text-center w-32",
      },
      ...EVALUATION_LEVELS.map((level) => ({
        header: level.label.toUpperCase(),
        accessor: (row: EditRegularDayData) => {
          return (
            <div className="flex flex-col items-center gap-2 py-2">
              <RadioGroup
                value={row.result || ""}
                onValueChange={(value) =>
                  handleResultChange(row.dateStr, value)
                }
                disabled={row.approved}
              >
                <RadioGroupItem
                  value={level.value}
                  id={`${row.dateStr}_${level.value}`}
                  className="h-6 w-6 rounded-full border-2 border-gray-300 bg-white [&[data-state=checked]]:!border-green-600 [&[data-state=checked]]:!bg-green-500 [&[data-state=checked]]:!text-green-500 [&>span]:hidden relative
                            [&[data-state=checked]]:before:content-[''] [&[data-state=checked]]:before:absolute [&[data-state=checked]]:before:inset-[5px] [&[data-state=checked]]:before:rounded-full [&[data-state=checked]]:before:bg-white"
                />
              </RadioGroup>
              {row.result === level.value && (
                <Input
                  className="w-full text-xs min-w-[200px]"
                  value={row.reason || ""}
                  onChange={(e) =>
                    handleReasonChange(row.dateStr, e.target.value)
                  }
                  placeholder="Nhập lý do (nếu có)..."
                  disabled={row.approved}
                />
              )}
            </div>
          );
        },
        className: "text-center",
      })),
    ],
    [handleResultChange, handleReasonChange]
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-hidden flex flex-col border-0">
        <DialogHeader className="bg-blue-600 text-white -mx-6 -mt-6 px-6 py-4 rounded-t-lg">
          <DialogTitle>CHỈNH SỬA ĐÁNH GIÁ CÔNG VIỆC THƯỜNG XUYÊN</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto py-4">
          <p className="mb-4">
            Người thực hiện: <strong>{userName}</strong>
          </p>
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              dataSource={editData}
              showPagination={false}
              emptyText="Không có dữ liệu"
              rowClassName={(row) => (row.approved ? "bg-gray-100" : "")}
            />
          </div>
        </div>
        <DialogFooter className="border-t pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Hủy
          </Button>
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={onSave}
          >
            <Save className="w-4 h-4 mr-1" />
            Lưu thay đổi
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
