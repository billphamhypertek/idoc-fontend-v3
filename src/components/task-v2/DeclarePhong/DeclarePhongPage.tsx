"use client";

import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import DeclarePhongHeader from "./DeclarePhongHeader";
import { useEffect, useMemo, useState, useCallback } from "react";
import DeclarePhongTabContent from "./DeclarePhongTabContent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DeclarePhongModal from "./DeclarePhongModal";
import { getUserInfo } from "@/utils/token.utils";
import {
  useApproveOrRejectDepartmentTask,
  useDeleteDepartmentTask,
  useExportDepartmentTask,
  useCountDepartmentTask,
  useListDepartmentTask,
} from "@/hooks/data/taskv2.data";
import { ToastUtils } from "@/utils/toast.utils";
import { handleError } from "@/utils/common.utils";
import saveAs from "file-saver";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";

export default function DeclarePhongPage() {
  const [activeTab, setActiveTab] = useState("NEW");
  const [openModal, setOpenModal] = useState(false);
  const [isPermission, setIsPermission] = useState(false);
  const [message, setMessage] = useState({ title: "", success: "" });
  const [paging, setPaging] = useState({
    currentPage: 1,
    pageSize: 10,
  });
  const [editData, setEditData] = useState<any>(null);
  const [openedFromRowClick, setOpenedFromRowClick] = useState(false);
  const [tabCounts, setTabCounts] = useState<Record<string, number>>({
    NEW: 0,
    ACCEPTED: 0,
    REJECTED: 0,
  });
  const [confirmValidateOpen, setConfirmValidateOpen] = useState(false);
  const [validateTarget, setValidateTarget] = useState<{
    id: number | null;
    approved: boolean;
  } | null>(null);

  const userAuthority = JSON.parse(getUserInfo() || "{}").authoritys;
  const isPermissionCheck = useMemo(() => {
    return userAuthority.some(
      (authority: any) => authority.authority === "APPROVE_DEPARTMENT_TASK"
    );
  }, [userAuthority]);

  useEffect(() => {
    setIsPermission(isPermissionCheck);
  }, [isPermissionCheck]);

  const exportDepartmentTaskMutation = useExportDepartmentTask();
  const deleteDepartmentTaskMutation = useDeleteDepartmentTask();
  const approveOrRejectDepartmentTaskMutation =
    useApproveOrRejectDepartmentTask();
  const { data: countData } = useCountDepartmentTask();
  const orgId = "";

  const { data: listData, isLoading: listLoading } = useListDepartmentTask(
    activeTab,
    paging.currentPage,
    paging.pageSize,
    orgId
  );

  const dataSource = useMemo(
    () => listData?.content || listData || [],
    [listData]
  );

  const totalItems = useMemo(
    () =>
      listData?.totalElements !== undefined
        ? listData.totalElements
        : dataSource.length,
    [dataSource.length, listData?.totalElements]
  );

  useEffect(() => {
    if (countData) {
      setTabCounts({
        NEW: countData.NEW || 0,
        ACCEPTED: countData.ACCEPTED || 0,
        REJECTED: countData.REJECTED || 0,
      });
    }
  }, [countData]);

  const exportExcel = async () => {
    try {
      const response = await exportDepartmentTaskMutation.mutateAsync();
      const blob = response.data;
      const fileName = `danh_sach_cong_viec_phong.xlsx`;
      saveAs(blob, fileName);
      ToastUtils.success("Xuất Excel thành công");
    } catch (error) {
      ToastUtils.error("Có lỗi xảy ra  khi xuất Excel");
      handleError(error);
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await deleteDepartmentTaskMutation.mutateAsync(id);
      ToastUtils.success("Xóa công việc thành công");
      setPaging((prev) => ({ ...prev }));
    } catch (error) {
      ToastUtils.error("Có lỗi xảy ra khi xóa công việc");
      handleError(error);
    }
  };

  const openValidateConfirm = useCallback((task: any, approved: boolean) => {
    setValidateTarget({ id: task?.id ?? null, approved });
    setMessage(
      approved
        ? {
            title: "Bạn có chắc chắn muốn duyệt công việc này không?",
            success: "Duyệt công việc thành công",
          }
        : {
            title: "Bạn có chắc chắn muốn từ chối công việc này không?",
            success: "Từ chối công việc thành công",
          }
    );
    setConfirmValidateOpen(true);
  }, []);

  const validateTask = useCallback(async () => {
    if (!validateTarget?.id) return;
    try {
      await approveOrRejectDepartmentTaskMutation.mutateAsync({
        id: validateTarget.id,
        approved: validateTarget.approved,
      });
      ToastUtils.success(message.success);
      setPaging((prev) => ({ ...prev }));
    } catch (error) {
      ToastUtils.error("Có lỗi xảy ra khi duyệt công việc");
      handleError(error);
    } finally {
      setConfirmValidateOpen(false);
      setValidateTarget(null);
    }
  }, [approveOrRejectDepartmentTaskMutation, message.success, validateTarget]);

  const handlePageChange = (page: number) => {
    setPaging((prev) => ({ ...prev, currentPage: page }));
  };

  const handleEditTask = (task: any) => {
    setEditData(task);
    setOpenedFromRowClick(false);
    setOpenModal(true);
  };

  const handleRowClick = (row: any) => {
    setEditData(row);
    setOpenedFromRowClick(true);
    setOpenModal(true);
  };

  const tabs = useMemo(
    () => [
      {
        id: "NEW",
        label: "Mới tạo",
        content: (
          <DeclarePhongTabContent
            tabKey="NEW"
            data={dataSource}
            isPermission={isPermission}
            onValidateTask={openValidateConfirm}
            onDeleteTask={deleteTask}
            onEditTask={handleEditTask}
            isLoading={listLoading}
            currentPage={paging.currentPage}
            itemsPerPage={paging.pageSize}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onRowClick={handleRowClick}
          />
        ),
        count: tabCounts.NEW,
      },
      {
        id: "ACCEPTED",
        label: "Đã duyệt",
        content: (
          <DeclarePhongTabContent
            tabKey="ACCEPTED"
            data={dataSource}
            isPermission={isPermission}
            onDeleteTask={deleteTask}
            onEditTask={handleEditTask}
            isLoading={listLoading}
            currentPage={paging.currentPage}
            itemsPerPage={paging.pageSize}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onRowClick={handleRowClick}
          />
        ),
        count: tabCounts.ACCEPTED,
      },
      {
        id: "REJECTED",
        label: "Từ chối",
        content: (
          <DeclarePhongTabContent
            tabKey="REJECTED"
            data={dataSource}
            isPermission={isPermission}
            onDeleteTask={deleteTask}
            onEditTask={handleEditTask}
            isLoading={listLoading}
            currentPage={paging.currentPage}
            itemsPerPage={paging.pageSize}
            totalItems={totalItems}
            onPageChange={handlePageChange}
            onRowClick={handleRowClick}
          />
        ),
        count: tabCounts.REJECTED,
      },
    ],
    [
      activeTab,
      dataSource,
      deleteTask,
      handlePageChange,
      isPermission,
      listLoading,
      openValidateConfirm,
      paging.currentPage,
      paging.pageSize,
      tabCounts.ACCEPTED,
      tabCounts.NEW,
      tabCounts.REJECTED,
      totalItems,
    ]
  );

  return (
    <div className="py-0 px-4 flex flex-col gap-4">
      <BreadcrumbNavigation
        items={[{ label: "Quản lý công việc", href: "/task-v2/declare-phong" }]}
        currentPage="Khai báo công việc phòng"
        showHome={false}
      />

      <DeclarePhongHeader
        currentTab={activeTab}
        onOpenModal={(open) => {
          if (open) {
            setEditData(null);
            setOpenedFromRowClick(false);
          }
          setOpenModal(open);
        }}
        onExportExcel={exportExcel}
      />

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="flex w-fit bg-transparent justify-start gap-2 bg-gray-100 rounded-lg p-1">
          {tabs.map((item) => (
            <TabsTrigger
              key={item.id}
              value={item.id}
              className={`whitespace-nowrap data-[state=active]:text-blue-600 px-3 py-1 text-xs rounded-md transition ${activeTab === item.id ? "font-bold" : "font-medium"}`}
            >
              {item.label} ({item.count})
            </TabsTrigger>
          ))}
        </TabsList>
        {tabs.map((item) => (
          <TabsContent key={item.id} value={item.id} className="mt-4">
            {item.content}
          </TabsContent>
        ))}
      </Tabs>

      <DeclarePhongModal
        open={openModal}
        onOpenChange={(open) => {
          setOpenModal(open);
          if (!open) {
            setEditData(null);
            setOpenedFromRowClick(false);
          }
        }}
        isPermission={isPermission}
        editData={editData}
        activeTab={activeTab}
        openedFromRowClick={openedFromRowClick}
      />

      <ConfirmDeleteDialog
        isOpen={confirmValidateOpen}
        onOpenChange={setConfirmValidateOpen}
        onConfirm={validateTask}
        title={"Xác nhận"}
        description={message.title}
        confirmText="Đồng ý"
        cancelText="Hủy"
        positionButton={true}
      />
    </div>
  );
}
