import useAuthStore from "@/stores/auth.store";
import { useUserFromOrg } from "@/hooks/data/common.data";
import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  CustomDialogContent,
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { Column } from "@/definitions";
import { Table } from "@/components/ui/table";
import { TaskExecuteResponse } from "@/definitions/types/task-assign.type";
import { useTaskExecuteQuery } from "@/hooks/data/task.data";
import SelectCustom from "../common/SelectCustom";
import { Label } from "../ui/label";
import { FileCheck, X } from "lucide-react";
import { useTaskExecuteQueryV2 } from "@/hooks/data/taskv2.data";

interface Props {
  data: TaskExecuteResponse[];
  setData: Dispatch<SetStateAction<TaskExecuteResponse[]>>;
  isOpen: boolean;
  isSelectParentTask: boolean;
  isSelectChildTask: boolean;
  isSelectRelatedTask: boolean;
  onClose: () => void;
  isV2?: boolean;
}

const defaultSearchState = {
  assignedWork: true,
};
type SearchState = typeof defaultSearchState;

export function RelatedWorkDialog({
  isSelectParentTask,
  isSelectChildTask,
  isSelectRelatedTask,
  data,
  setData,
  isOpen,
  onClose,
  isV2 = false,
}: Props) {
  const { user } = useAuthStore();
  const [localSelect, setLocalSelect] = useState<TaskExecuteResponse[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [searchParams, setSearchParams] =
    useState<SearchState>(defaultSearchState);

  const UserInfo = useMemo(() => {
    if (typeof window === "undefined") return {};
    return JSON.parse(localStorage.getItem("userInfo") || "{}");
  }, []);

  const userId = useMemo(() => {
    if (!UserInfo) return 0;

    const userAssign = UserInfo;
    return userAssign.id;
  }, [UserInfo]);

  const advanceParams = useMemo(
    () => ({
      page: currentPage,
      size: itemsPerPage,
      direction: "DESC",
      sortBy: "",
      userId: userId,
      assignedWork: searchParams.assignedWork,
      checkParentId: isSelectParentTask || isSelectRelatedTask ? true : false,
      listId: 0,
      parentId: "",
    }),
    [
      searchParams,
      isSelectParentTask,
      isSelectChildTask,
      isSelectRelatedTask,
      user,
      currentPage,
      itemsPerPage,
    ]
  );

  const {
    data: currentData,
    isLoading,
    error,
  } = useTaskExecuteQuery(advanceParams, userId !== 0 && isOpen && !isV2);

  const {
    data: currentDataV2,
    isLoading: isLoadingV2,
    error: errorV2,
  } = useTaskExecuteQueryV2(advanceParams, userId !== 0 && isOpen && isV2);

  const handleSubmit = useCallback(() => {
    setData(localSelect);
    onClose();
  }, [localSelect, setData, onClose]);

  const handleToggle = useCallback(
    (value: TaskExecuteResponse, checked: boolean) => {
      if (checked) {
        setLocalSelect((prev) => [...prev, value]); // add
      } else {
        setLocalSelect((prev) => prev.filter((item) => item.id !== value.id)); // remove
      }
    },
    []
  );
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const columns: Column<TaskExecuteResponse>[] = useMemo(
    () => [
      {
        header: "STT",
        className: "text-center py-2 w-16",
        accessor: (_: TaskExecuteResponse, index: number) => (
          <div className="flex items-center justify-center">
            <span className="text-xs font-medium">{index + 1}</span>
          </div>
        ),
      },
      {
        header: "Tên công việc",
        className: "text-left py-2 px-3",
        accessor: (item: TaskExecuteResponse) => (
          <div className="flex items-center">
            <span className="text-xs font-medium">{item.taskName}</span>
          </div>
        ),
      },
      {
        header: "Người giao việc",
        className: "text-left py-2 px-3",
        accessor: (item: TaskExecuteResponse) => (
          <div className="flex items-center">
            <span className="text-xs font-medium">{item.userAssignName}</span>
          </div>
        ),
      },
      {
        header: "Chọn",
        className: "text-center py-2 w-20",
        accessor: (item: TaskExecuteResponse) => (
          <div className="flex items-center justify-center">
            <Input
              type="checkbox"
              className="w-4 h-4"
              checked={isItemSelected(item)}
              // Nếu isSelectParentTask thì chỉ chọn được 1, các trường hợp khác chọn nhiều
              onChange={(e) => {
                if (isSelectParentTask) {
                  if (e.target.checked) {
                    setLocalSelect([item]);
                  } else {
                    setLocalSelect([]);
                  }
                } else {
                  handleToggle(item, e.target.checked);
                }
              }}
              disabled={
                isSelectParentTask
                  ? !isItemSelected(item) && localSelect.length >= 1
                  : false
              }
            />
          </div>
        ),
      },
    ],
    [localSelect, handleToggle]
  );

  const tableData = useMemo(
    () =>
      isV2 ? (currentDataV2?.objList ?? []) : (currentData?.objList ?? []),
    [currentData, currentDataV2]
  );
  const totalItems = useMemo(
    () =>
      isV2
        ? (currentDataV2?.totalRecord ?? 0)
        : (currentData?.totalRecord ?? 0),
    [currentData, currentDataV2]
  );

  const isItemSelected = useCallback(
    (item: TaskExecuteResponse) => {
      return localSelect.some((selected) => selected.id === item.id);
    },
    [localSelect]
  );

  useEffect(() => {
    if (isOpen) {
      setLocalSelect(data ?? []);
    } else {
      setLocalSelect([]);
    }
  }, [isOpen, data]);

  const SearchSection = useMemo(
    () => (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <Label className="text-sm font-semibold text-gray-900 mb-3 block">
          Loại công việc
        </Label>
        <SelectCustom
          options={[
            {
              label: "Việc đã giao",
              value: "1",
            },
            {
              label: "Việc được giao",
              value: "0",
            },
          ]}
          value={searchParams.assignedWork ? "1" : "0"}
          onChange={(value: string | string[]) =>
            setSearchParams((prev) => ({
              ...prev,
              assignedWork: value === "1" ? true : false,
            }))
          }
          placeholder="-- Chọn --"
        />
      </div>
    ),
    [searchParams]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <CustomDialogContent
        className="sm:max-w-5xl max-h-[95vh] p-0 flex flex-col"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="p-4 border-b border-gray-200 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center">
                {isSelectParentTask
                  ? "Lựa chọn công việc mức trên"
                  : isSelectChildTask
                    ? "Lựa chọn công việc mức dưới"
                    : "Lựa chọn công việc liên quan"}
              </DialogTitle>
            </div>
            <Button
              variant="outline"
              onClick={onClose}
              className="flex items-center gap-1 h-9 px-3 text-xs text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-md font-medium transition-colors"
              aria-label="Đóng"
            >
              <X className="w-3 h-3" aria-hidden="true" />
            </Button>
          </div>
        </DialogHeader>
        <div className="flex-1 min-h-0 max-h-[calc(75vh-56px-56px)] px-0 py-4 overflow-y-auto">
          <div className="flex flex-col space-y-4">
            {/* Search Section */}
            {isSelectRelatedTask && SearchSection}

            {/* Table Section with auto height */}
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <Table
                sortable={true}
                columns={columns}
                dataSource={tableData as TaskExecuteResponse[]}
                totalItems={totalItems}
                loading={isLoading || isLoadingV2}
                showPagination={true}
                showPageSize={false}
                emptyText={
                  isLoading || isLoadingV2
                    ? "Đang tải dữ liệu..."
                    : error || errorV2
                      ? `Lỗi: ${error?.message || errorV2?.message}`
                      : "Không tồn tại công việc"
                }
                onPageChange={handlePageChange}
                itemsPerPage={itemsPerPage}
                currentPage={currentPage}
              />
            </div>
          </div>
        </div>
        <DialogFooter className="p-4 justify-end gap-2 shrink-0">
          <Button
            onClick={handleSubmit}
            size="sm"
            className="h-9 px-3 text-sm bg-blue-600 hover:bg-blue-700"
          >
            <FileCheck className="w-4 h-4 mr-2" />
            Đồng ý
          </Button>
        </DialogFooter>
      </CustomDialogContent>
    </Dialog>
  );
}
