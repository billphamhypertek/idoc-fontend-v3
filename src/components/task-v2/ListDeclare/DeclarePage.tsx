"use client";

import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import { useState, useMemo, useEffect, useCallback } from "react";
import DeclareTabContent from "./DeclareTabContent";
import RegularTab from "./RegularTab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  useFindBasic,
  useDeleteDeclareTask,
  useFindAdvance,
} from "@/hooks/data/taskv2.data";
import SelfDeclareModal from "./SelfDeclareModal";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/definitions/constants/queryKey.constants";
import { ToastUtils } from "@/utils/toast.utils";
import { handleError } from "@/utils/common.utils";
import { useRouter, useSearchParams } from "next/navigation";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";

export default function DeclarePage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeView, setActiveView] = useState<"OTHER" | "REGULAR">("OTHER");
  const [activeTab, setActiveTab] = useState("NEW");
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams?.get("tab");
  const [paging, setPaging] = useState({
    currentPage: 1,
    pageSize: 10,
  });

  const [tabCounts, setTabCounts] = useState<Record<string, number>>({
    NEW: 0,
    ACCEPTED: 0,
    REJECTED: 0,
  });

  const [openModal, setOpenModal] = useState(false);
  const [editData, setEditData] = useState<any>(null);

  const [filter, setFilter] = useState({
    taskName: "",
    startDate: null as Date | null,
    endDate: null as Date | null,
  });
  const [isSearchingMap, setIsSearchingMap] = useState<Record<string, boolean>>(
    {
      NEW: false,
      ACCEPTED: false,
      REJECTED: false,
    }
  );
  const [searchDataMap, setSearchDataMap] = useState<Record<string, any[]>>({
    NEW: [],
    ACCEPTED: [],
    REJECTED: [],
  });
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<any>(null);

  const deleteMutation = useDeleteDeclareTask();
  const findAdvanceMutation = useFindAdvance();

  const type = 1;

  const getContent = useCallback(
    (payload: any) => (payload?.content ? payload.content : []),
    []
  );

  const getTotal = useCallback(
    (payload: any) =>
      payload?.totalElements !== undefined ? payload.totalElements : 0,
    []
  );

  const isTabNew = activeTab === "NEW";
  const isTabAccepted = activeTab === "ACCEPTED";
  const isTabRejected = activeTab === "REJECTED";

  // Data for current tab only
  const { data: newData, isLoading: newLoading } = useFindBasic(
    type,
    "NEW",
    paging.currentPage,
    paging.pageSize,
    isTabNew
  );
  const { data: acceptedData, isLoading: acceptedLoading } = useFindBasic(
    type,
    "ACCEPTED",
    paging.currentPage,
    paging.pageSize,
    isTabAccepted
  );
  const { data: rejectedData, isLoading: rejectedLoading } = useFindBasic(
    type,
    "REJECTED",
    paging.currentPage,
    paging.pageSize,
    isTabRejected
  );

  const { data: newCountData } = useFindBasic(type, "NEW", 1, 1, true);
  const { data: acceptedCountData } = useFindBasic(
    type,
    "ACCEPTED",
    1,
    1,
    true
  );
  const { data: rejectedCountData } = useFindBasic(
    type,
    "REJECTED",
    1,
    1,
    true
  );

  const basicDataMap: Record<string, any> = useMemo(
    () => ({
      NEW: newData,
      ACCEPTED: acceptedData,
      REJECTED: rejectedData,
    }),
    [acceptedData, newData, rejectedData]
  );

  const loadingMap: Record<string, boolean> = useMemo(
    () => ({
      NEW: newLoading,
      ACCEPTED: acceptedLoading,
      REJECTED: rejectedLoading,
    }),
    [acceptedLoading, newLoading, rejectedLoading]
  );

  useEffect(() => {
    if (tabFromUrl !== null && tabFromUrl !== undefined) {
      setActiveTab(tabFromUrl);
    } else {
      setActiveTab("NEW");
    }
  }, [tabFromUrl]);

  useEffect(() => {
    const count = getTotal(newCountData);
    setTabCounts((prev) => ({ ...prev, NEW: count }));
  }, [getTotal, newCountData]);

  useEffect(() => {
    const count = getTotal(acceptedCountData);
    setTabCounts((prev) => ({
      ...prev,
      ACCEPTED: count,
    }));
  }, [acceptedCountData, getTotal]);

  useEffect(() => {
    const count = getTotal(rejectedCountData);
    setTabCounts((prev) => ({
      ...prev,
      REJECTED: count,
    }));
  }, [getTotal, rejectedCountData]);

  useEffect(() => {
    setPaging((prev) => ({ ...prev, currentPage: 1 }));
    setFilter({
      taskName: "",
      startDate: null,
      endDate: null,
    });
    setIsSearchingMap((prev) => ({ ...prev, [activeTab]: false }));
    setSearchDataMap((prev) => ({
      ...prev,
      [activeTab]: getContent(basicDataMap[activeTab]),
    }));
  }, [activeTab]);

  useEffect(() => {
    if (!isSearchingMap[activeTab]) {
      setSearchDataMap((prev) => ({
        ...prev,
        [activeTab]: getContent(basicDataMap[activeTab]),
      }));
    }
  }, [activeTab, basicDataMap, getContent, isSearchingMap]);

  const handleEdit = (row: any) => {
    setEditData(row);
    setOpenModal(true);
  };

  const handleDelete = (row: any) => {
    setDeleteTarget(row);
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      ToastUtils.success("Xóa công việc thành công.");
      queryClient.invalidateQueries({
        queryKey: [queryKeys.taskv2.findBasic],
      });
    } catch (error) {
      ToastUtils.error("Có lỗi xảy ra khi xóa công việc.");
      handleError(error);
    } finally {
      setConfirmDeleteOpen(false);
      setDeleteTarget(null);
    }
  };

  const handleRowClick = (row: any) => {
    router.push(`/task-v2/declare/detail/${row.id}?tab=${activeTab}`);
  };

  const handleModalSuccess = () => {
    queryClient.invalidateQueries({
      queryKey: [queryKeys.taskv2.findBasic],
    });
  };

  const handleModalClose = () => {
    setOpenModal(false);
    setEditData(null);
  };

  const handleSearch = async () => {
    try {
      setIsSearchingMap((prev) => ({ ...prev, [activeTab]: true }));
      const startDateStr = filter.startDate
        ? filter.startDate.toISOString().split("T")[0]
        : undefined;
      const endDateStr = filter.endDate
        ? filter.endDate.toISOString().split("T")[0]
        : undefined;

      const response = await findAdvanceMutation.mutateAsync({
        type,
        status: activeTab,
        taskName: filter.taskName || undefined,
        startDate: startDateStr,
        endDate: endDateStr,
        page: paging.currentPage,
        size: paging.pageSize,
      });

      const resultData = getContent(response);
      setSearchDataMap((prev) => ({ ...prev, [activeTab]: resultData }));
    } catch (error) {
      ToastUtils.error("Có lỗi xảy ra khi tìm kiếm.");
      handleError(error);
    } finally {
    }
  };

  const handleReset = () => {
    setFilter({
      taskName: "",
      startDate: null,
      endDate: null,
    });
    setIsSearchingMap((prev) => ({ ...prev, [activeTab]: false }));
    setSearchDataMap((prev) => ({ ...prev, [activeTab]: [] }));
    queryClient.invalidateQueries({
      queryKey: [queryKeys.taskv2.findBasic],
    });
  };

  const baseContent = getContent(basicDataMap[activeTab]);
  const displayData = isSearchingMap[activeTab]
    ? searchDataMap[activeTab] || []
    : baseContent;

  const displayLoading = isSearchingMap[activeTab]
    ? findAdvanceMutation.isPending
    : loadingMap[activeTab];

  const handlePageChange = (page: number) => {
    setPaging((prev) => ({ ...prev, currentPage: page }));
  };

  const handlePageSizeChange = (size: number) => {
    setPaging((prev) => ({
      ...prev,
      pageSize: size,
      currentPage: 1,
    }));
  };

  const tab = useMemo(
    () => [
      {
        id: "NEW",
        label: "Mới tạo",
        content: (
          <DeclareTabContent
            tabKey="NEW"
            data={activeTab === "NEW" ? displayData : []}
            isLoading={activeTab === "NEW" ? displayLoading : false}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onRowClick={handleRowClick}
            filter={filter}
            onFilterChange={setFilter}
            onSearch={handleSearch}
            onReset={handleReset}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handlePageSizeChange}
            currentPage={paging.currentPage}
            itemsPerPage={paging.pageSize}
            totalItems={tabCounts.NEW}
          />
        ),
        count: tabCounts.NEW,
      },
      {
        id: "ACCEPTED",
        label: "Đã duyệt",
        content: (
          <DeclareTabContent
            tabKey="ACCEPTED"
            data={activeTab === "ACCEPTED" ? displayData : []}
            isLoading={activeTab === "ACCEPTED" ? displayLoading : false}
            onRowClick={handleRowClick}
            filter={filter}
            onFilterChange={setFilter}
            onSearch={handleSearch}
            onReset={handleReset}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handlePageSizeChange}
            currentPage={paging.currentPage}
            itemsPerPage={paging.pageSize}
            totalItems={tabCounts.ACCEPTED}
          />
        ),
        count: tabCounts.ACCEPTED,
      },
      {
        id: "REJECTED",
        label: "Từ chối",
        content: (
          <DeclareTabContent
            tabKey="REJECTED"
            data={activeTab === "REJECTED" ? displayData : []}
            isLoading={activeTab === "REJECTED" ? displayLoading : false}
            onRowClick={handleRowClick}
            filter={filter}
            onFilterChange={setFilter}
            onSearch={handleSearch}
            onReset={handleReset}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handlePageSizeChange}
            currentPage={paging.currentPage}
            itemsPerPage={paging.pageSize}
            totalItems={tabCounts.REJECTED}
          />
        ),
        count: tabCounts.REJECTED,
      },
    ],
    [
      activeTab,
      tabCounts,
      displayData,
      displayLoading,
      filter,
      handleEdit,
      handleDelete,
      handleRowClick,
      handleSearch,
      handleReset,
    ]
  );

  return (
    <div className="py-0 px-4 flex flex-col gap-4">
      <BreadcrumbNavigation
        items={[{ label: "Quản lý công việc", href: "/task-v2/declare" }]}
        currentPage="Khai báo công việc"
        showHome={false}
      />

      <Tabs
        value={activeView}
        onValueChange={(value) => setActiveView(value as "OTHER" | "REGULAR")}
        className="w-full"
      >
        <div className="flex items-center justify-between mb-4">
          <TabsList className="flex w-fit bg-transparent justify-start gap-2 bg-gray-100 rounded-lg p-1 h-10">
            <TabsTrigger
              value="OTHER"
              className={`h-full whitespace-nowrap data-[state=active]:text-white data-[state=active]:bg-blue-600 px-3 py-1 text-xs rounded-md transition ${activeView === "OTHER" ? "font-bold" : "font-medium"}`}
            >
              Công việc khác
            </TabsTrigger>
            <TabsTrigger
              value="REGULAR"
              className={`h-full whitespace-nowrap data-[state=active]:text-white data-[state=active]:bg-blue-600 px-3 py-1 text-xs rounded-md transition ${activeView === "REGULAR" ? "font-bold" : "font-medium"}`}
            >
              Công việc thường xuyên
            </TabsTrigger>
          </TabsList>

          {activeView === "OTHER" && (
            <Button
              className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 text-sm font-medium"
              onClick={() => setOpenModal(true)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Tự Khai Công Việc
            </Button>
          )}
        </div>

        <TabsContent value="OTHER" className="mt-4">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="flex w-fit bg-transparent justify-start gap-2 bg-gray-100 rounded-lg p-1">
              {tab.map((item) => (
                <TabsTrigger
                  key={item.id}
                  value={item.id}
                  className={`whitespace-nowrap data-[state=active]:text-blue-600 px-3 py-1 text-xs rounded-md transition ${activeTab === item.id ? "font-bold" : "font-medium"}`}
                >
                  {item.label} ({item.count})
                </TabsTrigger>
              ))}
            </TabsList>
            {tab.map((item) => (
              <TabsContent key={item.id} value={item.id} className="mt-4">
                {item.content}
              </TabsContent>
            ))}
          </Tabs>
        </TabsContent>

        <TabsContent value="REGULAR" className="mt-4">
          <RegularTab />
        </TabsContent>
      </Tabs>
      <SelfDeclareModal
        open={openModal}
        onOpenChange={handleModalClose}
        editData={editData}
        onSuccess={handleModalSuccess}
      />
      <ConfirmDeleteDialog
        isOpen={confirmDeleteOpen}
        onOpenChange={(open) => {
          setConfirmDeleteOpen(open);
          if (!open) setDeleteTarget(null);
        }}
        onConfirm={handleConfirmDelete}
        title="Xóa công việc"
        description="Bạn có chắc chắn muốn xóa công việc này?"
        confirmText="Đồng ý"
        cancelText="Hủy"
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
