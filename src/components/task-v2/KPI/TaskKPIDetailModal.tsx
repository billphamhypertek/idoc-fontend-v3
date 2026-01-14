"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table } from "@/components/ui/table";
import { Column } from "@/definitions/types/table.type";
import { useGetDetailKpi, useGetDetailKpiTask } from "@/hooks/data/task.data";
import { useState, useMemo, useEffect, useRef } from "react";
import { Constant } from "@/definitions/constants/constant";
import { X } from "lucide-react";
import dayjs from "dayjs";

interface TaskKPIDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: number | string;
  userName: string;
  startDate: string;
  endDate: string;
}

export default function TaskKPIDetailModal({
  open,
  onOpenChange,
  userId,
  userName,
  startDate,
  endDate,
}: TaskKPIDetailModalProps) {
  const [paging, setPaging] = useState({
    itemsPerPage: Constant.ITEMS_PER_PAGE,
    currentPage: 1,
    totalRecord: -1,
  });

  const [selectedTask, setSelectedTask] = useState<{
    taskId: number | string;
    taskName: string;
  } | null>(null);

  const { data: taskListData, isLoading: isLoadingTasks } = useGetDetailKpi(
    startDate,
    endDate,
    userId,
    paging.currentPage,
    paging.itemsPerPage,
    open
  );

  const { data: taskHistoryData, isLoading: isLoadingHistory } =
    useGetDetailKpiTask(selectedTask?.taskId || 0, !!selectedTask?.taskId);

  const taskTableRef = useRef<HTMLDivElement>(null);
  const historyTableRef = useRef<HTMLDivElement>(null);
  const [taskMaxHeight, setTaskMaxHeight] = useState<string | undefined>();
  const [historyMaxHeight, setHistoryMaxHeight] = useState<
    string | undefined
  >();

  useEffect(() => {
    if (taskListData) {
      setPaging((prev) => ({
        ...prev,
        totalRecord: taskListData.totalElements || 0,
      }));
    }
  }, [taskListData]);

  useEffect(() => {
    if (!open) {
      setSelectedTask(null);
      setPaging({
        itemsPerPage: Constant.ITEMS_PER_PAGE,
        currentPage: 1,
        totalRecord: -1,
      });
    }
  }, [open]);

  // Compute scroll height when rows > 5
  useEffect(() => {
    const computeHeight = (
      ref: React.RefObject<HTMLDivElement>,
      rows: number | undefined,
      setHeight: (v: string | undefined) => void
    ) => {
      if (!ref.current || !rows || rows <= 5) {
        setHeight(undefined);
        return;
      }
      const firstRow = ref.current.querySelector("tbody tr");
      const rowHeight = firstRow ? firstRow.getBoundingClientRect().height : 52; // fallback
      setHeight(`${rowHeight * 5}px`);
    };

    computeHeight(
      taskTableRef,
      taskListData?.content?.length,
      setTaskMaxHeight
    );
    computeHeight(
      historyTableRef,
      taskHistoryData?.length,
      setHistoryMaxHeight
    );
  }, [taskListData?.content?.length, taskHistoryData?.length]);

  const handlePageChange = (page: number) => {
    setPaging((prev) => ({ ...prev, currentPage: page }));
  };

  const handlePageSizeChange = (size: number) => {
    setPaging({
      itemsPerPage: size,
      currentPage: 1,
      totalRecord: paging.totalRecord,
    });
  };

  const handleRowClick = (task: any) => {
    setSelectedTask({
      taskId: task.taskId,
      taskName: task.taskName,
    });
  };

  const taskColumns: Column<any>[] = useMemo(
    () => [
      {
        header: "STT",
        accessor: (row, index) =>
          (paging.currentPage - 1) * paging.itemsPerPage + index + 1,
        className: "w-16 text-center",
      },
      {
        header: "Tên công việc",
        accessor: "taskName",
        className: "text-center",
      },
      {
        header: "Mức độ phức tạp công việc",
        accessor: "complexityName",
        className: "text-center",
      },
      {
        header: "Điểm số",
        accessor: (row) => (row.score === null ? 0 : row.score),
        className: "text-center",
      },
      {
        header: "Ngày bắt đầu công việc",
        accessor: (row) => dayjs(row.startDate).format("DD/MM/YYYY"),
        className: "text-center",
      },
      {
        header: "Ngày kết thúc công việc",
        accessor: (row) => dayjs(row.endDate).format("DD/MM/YYYY"),
        className: "text-center",
      },
      {
        header: "Ngày nhận công việc",
        accessor: (row) => dayjs(row.receiveDate).format("DD/MM/YYYY HH:mm:ss"),
        className: "text-center",
      },
      {
        header: "Ngày hoàn thành công việc",
        accessor: (row) =>
          dayjs(row.completeDate).format("DD/MM/YYYY HH:mm:ss"),
        className: "text-center",
      },
    ],
    [paging.currentPage, paging.itemsPerPage]
  );

  const historyColumns: Column<any>[] = useMemo(
    () => [
      {
        header: "Họ tên",
        accessor: "userName",
        className: "text-center",
      },
      {
        header: "Hành động",
        accessor: "action",
        className: "text-center",
      },
      {
        header: "Thời gian",
        accessor: (row) => dayjs(row.date).format("DD/MM/YYYY HH:mm:ss"),
        className: "text-center",
      },
    ],
    []
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-[90vw] max-h-[90vh] overflow-y-auto [&>button]:hidden"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <DialogTitle className="text-lg font-semibold">
            Chi tiết KPI công việc của {userName}
          </DialogTitle>
          <X
            className="w-4 h-4 cursor-pointer"
            onClick={() => onOpenChange(false)}
          />
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-white rounded-lg">
            <Table
              ref={taskTableRef}
              columns={taskColumns}
              dataSource={taskListData?.content || []}
              itemsPerPage={paging.itemsPerPage}
              currentPage={paging.currentPage}
              onPageChange={handlePageChange}
              totalItems={paging.totalRecord}
              onItemsPerPageChange={handlePageSizeChange}
              showPagination={true}
              loading={isLoadingTasks}
              emptyText="Không tồn tại công việc"
              showPageSize={false}
              onRowClick={handleRowClick}
              fixedHeader={!!taskMaxHeight}
              maxHeight={taskMaxHeight}
            />
          </div>

          {selectedTask && (
            <div className="bg-white rounded-lg p-4">
              <h3 className="text-md font-bold mb-4">
                Danh sách hành động công việc: {selectedTask.taskName}
              </h3>
              <Table
                ref={historyTableRef}
                columns={historyColumns}
                dataSource={taskHistoryData || []}
                showPagination={false}
                loading={isLoadingHistory}
                emptyText="Không tồn tại hành động"
                fixedHeader={!!historyMaxHeight}
                maxHeight={historyMaxHeight}
              />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
