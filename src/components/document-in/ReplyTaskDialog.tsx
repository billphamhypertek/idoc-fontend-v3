import React, { Dispatch, SetStateAction, useMemo, useState } from "react";
import {
  CustomDialogContent,
  Dialog,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ArrowRight, ChevronLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { Column } from "@/definitions";
import { Table } from "@/components/ui/table";
import { useTaskAssignment } from "@/hooks/data/document-in.data";
import { TaskAssignment } from "@/definitions/types/document.type";

interface Props {
  data: TaskAssignment[];
  setData: Dispatch<SetStateAction<TaskAssignment[]>>;
  isOpen: boolean;
  onOpenChange: (v: boolean) => void;
  onClose: () => void;
  onSubmit: (v: string) => void;
}

const replyDocInit = {
  page: 1,
};

export function ReplyTaskDialog({
  data,
  setData,
  isOpen,
  onOpenChange,
  onClose,
  onSubmit,
}: Props) {
  const [search, setSearch] = useState(replyDocInit);
  const [localSelect, setLocalSelect] = useState(data);
  const { data: taskData, isLoading, error } = useTaskAssignment(search);
  const itemsPerPage = 10;
  const handleToggle = (value: TaskAssignment, checked: boolean) => {
    if (checked) {
      setLocalSelect((prev) => [...prev, value]); // add
    } else {
      setLocalSelect((prev) => prev.filter((item) => item !== value)); // remove
    }
  };
  const handleCancel = () => {
    setLocalSelect(data ?? []);
    onClose();
  };

  const handleSubmit = () => {
    setData(localSelect);
    onSubmit(localSelect.map((t) => t.id).join(","));
    onClose();
  };
  const handlePageChange = (p: number) => {
    setSearch((prev) => ({
      ...prev,
      page: p,
    }));
  };

  const columns: Column<TaskAssignment>[] = [
    {
      header: "STT",
      className: "text-center py-1 w-8",
      accessor: (item: TaskAssignment, index: number) => (
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs font-medium">
            {(search.page - 1) * itemsPerPage + index + 1}
          </span>
        </div>
      ),
    },
    {
      header: "Tên công việc",
      className: "text-center py-1 w-8",
      accessor: (item: TaskAssignment) => (
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs font-medium">{item.taskName}</span>
        </div>
      ),
    },
    {
      header: "Người giao việc",
      className: "text-center py-1 w-6",
      accessor: (item: TaskAssignment) => (
        <div className="flex items-center justify-center gap-2">
          <span className="text-xs font-medium">{item.userAssignName}</span>
        </div>
      ),
    },
    {
      header: "",
      className: "text-center py-1 w-8",
      accessor: (item: TaskAssignment) => (
        <div className="flex items-center justify-center gap-2">
          <Input
            type="checkbox"
            className="w-4 h-4"
            checked={localSelect.includes(item)}
            onChange={(e) => handleToggle(item, e.target.checked)}
          />
        </div>
      ),
    },
  ];
  const tableData = taskData?.content ?? [];
  const totalElement = taskData?.totalElements ?? 0;
  const totalPage = taskData?.totalPage ?? 0;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <CustomDialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center">
                Danh sách công việc
              </DialogTitle>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="h-9 px-4 text-sm font-medium border-gray-300 hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Hủy
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 text-sm font-medium"
              >
                <Save className="w-4 h-4 mr-1" />
                Lưu
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nội dung xử lý */}
          <Table
            sortable={true}
            columns={columns}
            dataSource={tableData}
            loading={isLoading}
            showPagination={true}
            currentPage={search.page}
            itemsPerPage={itemsPerPage}
            totalItems={totalElement}
            showPageSize={false}
            bgColor={"bg-white"}
            onPageChange={(p) => handlePageChange(p)}
            emptyText={
              isLoading
                ? "Đang tải dữ liệu..."
                : error
                  ? `Lỗi: ${error.message}`
                  : "Không có dữ liệu"
            }
          />
        </div>
      </CustomDialogContent>
    </Dialog>
  );
}
