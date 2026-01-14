"use client";

import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import TaskKPIFilter from "./TaskKPIFilter";
import TaskKPITable from "./TaskKPITable";
import TaskKPIDetailModal from "./TaskKPIDetailModal";
import { useState, useEffect, useMemo } from "react";
import { Constant } from "@/definitions/constants/constant";
import { defaultKPISearchField } from "@/utils/formValue.utils";
import { useGetTaskKpi } from "@/hooks/data/task.data";
import { getUserInfo } from "@/utils/token.utils";
import dayjs from "dayjs";
import { TaskService } from "@/services/task.service";
import { handleError } from "@/utils/common.utils";
import saveAs from "file-saver";
import { ToastUtils } from "@/utils/toast.utils";

export default function TaskKPIPage() {
  const [paging, setPaging] = useState({
    itemsPerPage: Constant.ITEMS_PER_PAGE,
    currentPage: 1,
    totalRecord: -1,
  });

  const [searchField, setSearchField] = useState(defaultKPISearchField());

  const [appliedSearchParams, setAppliedSearchParams] = useState(
    defaultKPISearchField()
  );

  const [modalState, setModalState] = useState<{
    open: boolean;
    userId: number | string;
    userName: string;
  }>({
    open: false,
    userId: 0,
    userName: "",
  });

  const UserInfo = useMemo(() => {
    return JSON.parse(getUserInfo() || "{}");
  }, []);
  const orgId = UserInfo?.org || 0;

  useEffect(() => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const defaultField = {
      ...defaultKPISearchField(),
      startDateNgb: firstDayOfMonth,
      endDateNgb: today,
    };

    setSearchField(defaultField);

    setAppliedSearchParams({
      ...defaultField,
      orgId: orgId.toString(),
    });
  }, [orgId]);

  const {
    data: kpiData,
    isLoading,
    refetch,
  } = useGetTaskKpi(
    appliedSearchParams.startDateNgb
      ? dayjs(appliedSearchParams.startDateNgb).format("DD/MM/YYYY")
      : "",
    appliedSearchParams.endDateNgb
      ? dayjs(appliedSearchParams.endDateNgb).format("DD/MM/YYYY")
      : "",
    appliedSearchParams.orgId && appliedSearchParams.orgId !== "all"
      ? Number(appliedSearchParams.orgId)
      : orgId,
    appliedSearchParams.userId === "all" ? "" : appliedSearchParams.userId,
    paging.currentPage,
    paging.itemsPerPage,
    !!appliedSearchParams.startDateNgb && !!appliedSearchParams.endDateNgb
  );

  useEffect(() => {
    if (kpiData) {
      setPaging((prev) => ({
        ...prev,
        totalRecord: kpiData.totalElements || 0,
      }));
    }
  }, [kpiData]);

  const handleSearch = () => {
    setAppliedSearchParams({ ...searchField });
    setPaging((prev) => ({ ...prev, currentPage: 1 }));
  };

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

  const handleReset = () => {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const resetField = {
      ...defaultKPISearchField(),
      startDateNgb: firstDayOfMonth,
      endDateNgb: today,
    };

    setSearchField(resetField);

    setAppliedSearchParams({
      ...resetField,
      orgId: orgId.toString(),
    });

    setPaging((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleExport = async () => {
    const userId = searchField.userId === "all" ? "" : searchField.userId;
    const fromDate = searchField.startDateNgb
      ? dayjs(searchField.startDateNgb).format("DD/MM/YYYY")
      : "";
    const toDate = searchField.endDateNgb
      ? dayjs(searchField.endDateNgb).format("DD/MM/YYYY")
      : "";

    try {
      const response = await TaskService.exportTaskKpi(
        orgId.toString(),
        userId,
        fromDate,
        toDate
      );
      if (response) {
        const blob = new Blob([response], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        saveAs(blob, `Danh_sach_KPI_${new Date().getTime()}.xlsx`);
        ToastUtils.success("Xuất file Excel thành công!");
      }
    } catch (error) {
      ToastUtils.error("Xuất file Excel thất bại!");
      handleError(error);
    }
  };

  const handleRowClick = (row: any) => {
    setModalState({
      open: true,
      userId: row.userId,
      userName: row.userName,
    });
  };

  return (
    <div className="py-0 px-4 flex flex-col gap-4">
      <BreadcrumbNavigation
        items={[{ label: "Quản lý công việc", href: "/task-v2/kpi" }]}
        currentPage="Danh sách tính điểm kpi"
        showHome={false}
      />
      <div className="flex p-4 flex-col rounded-lg bg-gray-200">
        <h2 className="text-xl font-bold">Danh sách tính điểm kpi</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Danh sách tính điểm kpi theo đơn vị
        </p>
      </div>
      <TaskKPIFilter
        searchField={searchField}
        setSearchField={setSearchField}
        onSearch={handleSearch}
        onReset={handleReset}
        onExport={handleExport}
      />
      <TaskKPITable
        data={kpiData?.content || []}
        isLoading={isLoading}
        paging={paging}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onRowClick={handleRowClick}
      />

      <TaskKPIDetailModal
        open={modalState.open}
        onOpenChange={(open) => setModalState((prev) => ({ ...prev, open }))}
        userId={modalState.userId}
        userName={modalState.userName}
        startDate={
          searchField.startDateNgb
            ? dayjs(searchField.startDateNgb).format("DD/MM/YYYY")
            : ""
        }
        endDate={
          searchField.endDateNgb
            ? dayjs(searchField.endDateNgb).format("DD/MM/YYYY")
            : ""
        }
      />
    </div>
  );
}
