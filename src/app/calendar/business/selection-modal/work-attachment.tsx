import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchTask } from "@/definitions/types/calendar.type";
import { CalendarService } from "@/services/calendar.service";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface WorkAttachmentProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  selectedTasks: any[];
  onTaskSelect: (task: any) => void;
  onTaskDeselect: (task: any) => void;
}

export default function WorkAttachment({
  open,
  onOpenChange,
  selectedTasks = [],
  onTaskSelect,
  onTaskDeselect,
}: WorkAttachmentProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [searchParams, setSearchParams] = useState<SearchTask>({
    taskName: "",
    taskType: null,
  });

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks", currentPage, searchParams],
    queryFn: () => CalendarService.getSearchTask(searchParams, currentPage),
  });

  const isTaskSelected = (task: any) => {
    return selectedTasks.some(
      (selected) =>
        selected.taskId === task.id ||
        selected.id === task.id ||
        selected.taskId === task.taskId ||
        selected.id === task.taskId
    );
  };

  const handleTaskSelect = (task: any) => {
    const taskToAdd = {
      ...task,
      taskId: task.id,
      isNew: true,
    };
    onTaskSelect(taskToAdd);
  };

  const handleTaskDeselect = (task: any) => {
    onTaskDeselect(task);
  };

  const columns = [
    {
      header: "STT",
      className: "w-16 text-center",
      accessor: (item: any, index: number) => (
        <span className="text-sm">
          {(currentPage - 1) * itemsPerPage + index + 1}
        </span>
      ),
    },
    {
      header: "Tên công việc",
      className: "text-left",
      accessor: (item: any) => (
        <span className="text-sm font-medium">{item?.taskName}</span>
      ),
    },
    {
      header: "Người giao việc",
      className: "text-left",
      accessor: (item: any) => (
        <span className="text-sm">{item?.userAssignName}</span>
      ),
    },
    {
      header: "",
      className: "w-24 text-center",
      accessor: (item: any) => (
        <Button
          variant="link"
          size="sm"
          className="text-blue-600 hover:text-blue-800 p-0 h-auto"
          onClick={() =>
            isTaskSelected(item)
              ? handleTaskDeselect(item)
              : handleTaskSelect(item)
          }
        >
          {isTaskSelected(item) ? "Bỏ chọn" : "Chọn"}
        </Button>
      ),
    },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-full max-h-[80vh] overflow-hidden [&>button]:hidden">
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-lg font-semibold">
            Danh sách công việc
          </DialogTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="h-9 w-8 p-0 rounded-none"
          >
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-4 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="taskName" className="text-sm font-medium">
                Tên công việc
              </Label>
              <Input
                id="taskName"
                placeholder="Tìm theo tên công việc"
                value={searchParams.taskName}
                onChange={(e) =>
                  setSearchParams((prev) => ({
                    ...prev,
                    taskName: e.target.value,
                  }))
                }
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="taskType" className="text-sm font-medium">
                Loại công việc
              </Label>
              <Select
                value={
                  searchParams.taskType === "false"
                    ? "assigned"
                    : searchParams.taskType === "true"
                      ? "pending"
                      : ""
                }
                onValueChange={(value) => {
                  const taskTypeValue =
                    value === "assigned"
                      ? "false"
                      : value === "pending"
                        ? "true"
                        : null;
                  setSearchParams((prev) => ({
                    ...prev,
                    taskType: taskTypeValue,
                  }));
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn loại công việc" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="assigned">Việc đã giao</SelectItem>
                  <SelectItem value="pending">Việc được giao</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-hidden">
          <div className="border rounded-lg overflow-hidden">
            <table className="w-full">
              <thead className="bg-blue-600">
                <tr>
                  {columns.map((column, index) => (
                    <th
                      key={index}
                      className={`px-4 py-3 text-left text-sm font-medium text-white border-r ${column.className || ""}`}
                    >
                      {column.header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Đang tải...
                    </td>
                  </tr>
                ) : tasks?.objList?.length === 0 ? (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="px-4 py-8 text-center text-gray-500"
                    >
                      Không có dữ liệu
                    </td>
                  </tr>
                ) : (
                  tasks?.objList?.map((item: any, index: number) => (
                    <tr key={item.id || index} className="hover:bg-gray-50">
                      {columns.map((column, colIndex) => (
                        <td
                          key={colIndex}
                          className={`px-4 py-3 ${column.className || ""}`}
                        >
                          {typeof column.accessor === "function"
                            ? column.accessor(item, index)
                            : item[column.accessor]}
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="text-gray-500 hover:text-gray-700"
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Trang trước
            </Button>
            <Button
              variant="default"
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {currentPage}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCurrentPage((prev) => prev + 1)}
              disabled={!tasks?.hasNextPage}
              className="text-gray-500 hover:text-gray-700"
            >
              Trang sau
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
