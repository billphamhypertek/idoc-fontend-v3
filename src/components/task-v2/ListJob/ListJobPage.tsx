"use client";

import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import { useState, useMemo, useEffect, useCallback } from "react";
import ListJobTabContent from "./ListJobTabContent";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useFindBasic, useAcceptDeclareTask } from "@/hooks/data/taskv2.data";
import ListJobModal from "./ListJobModal";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/definitions/constants/queryKey.constants";
import { ToastUtils } from "@/utils/toast.utils";
import { handleError } from "@/utils/common.utils";
import { useRouter, useSearchParams } from "next/navigation";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import ListJobRegularTab from "./ListJobRegularTab";

export default function ListJobPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("NEW");
  const [activeView, setActiveView] = useState<"OTHER" | "REGULAR">("OTHER");
  const searchParams = useSearchParams();
  const tabFromUrl = searchParams?.get("tab");
  const [paging, setPaging] = useState({
    currentPage: 1,
    pageSize: 10,
  });

  const [tabCounts, setTabCounts] = useState<Record<string, number>>({
    NEW: 0,
    ACCEPTED: 0,
  });

  const [openModal, setOpenModal] = useState(false);
  const [editData, setEditData] = useState<any>(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [confirmAcceptOpen, setConfirmAcceptOpen] = useState(false);
  const [confirmRejectOpen, setConfirmRejectOpen] = useState(false);
  const [actionTarget, setActionTarget] = useState<any>(null);

  const acceptMutation = useAcceptDeclareTask();

  const type = 2; // Type 2 cho ListJob

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

  const { data: newCountData } = useFindBasic(type, "NEW", 1, 1, true);
  const { data: acceptedCountData } = useFindBasic(
    type,
    "ACCEPTED",
    1,
    1,
    true
  );

  const basicDataMap: Record<string, any> = useMemo(
    () => ({
      NEW: newData,
      ACCEPTED: acceptedData,
    }),
    [acceptedData, newData]
  );

  const loadingMap: Record<string, boolean> = useMemo(
    () => ({
      NEW: newLoading,
      ACCEPTED: acceptedLoading,
    }),
    [acceptedLoading, newLoading]
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
    setPaging((prev) => ({ ...prev, currentPage: 1 }));
  }, [activeTab]);

  const handleEdit = (row: any) => {
    setEditData(row);
    setIsViewMode(false);
    setOpenModal(true);
  };

  const handleView = (row: any) => {
    setEditData(row);
    setIsViewMode(true);
    setOpenModal(true);
  };

  const handleAccept = (row: any) => {
    setActionTarget(row);
    setConfirmAcceptOpen(true);
  };

  const handleReject = (row: any) => {
    setActionTarget(row);
    setConfirmRejectOpen(true);
  };

  const handleConfirmAccept = async () => {
    if (!actionTarget?.id) return;
    try {
      await acceptMutation.mutateAsync({
        id: actionTarget.id,
        accept: true,
      });
      ToastUtils.success("Duyệt công việc thành công.");
      queryClient.invalidateQueries({
        queryKey: [queryKeys.taskv2.findBasic],
      });
      //router.push("/task-v2/declare?tab=ACCEPTED");
    } catch (error) {
      ToastUtils.error("Có lỗi xảy ra khi duyệt công việc.");
      handleError(error);
    } finally {
      setConfirmAcceptOpen(false);
      setActionTarget(null);
    }
  };

  const handleConfirmReject = async () => {
    if (!actionTarget?.id) return;
    try {
      await acceptMutation.mutateAsync({
        id: actionTarget.id,
        accept: false,
      });
      ToastUtils.success("Từ chối công việc thành công.");
      queryClient.invalidateQueries({
        queryKey: [queryKeys.taskv2.findBasic],
      });
      //router.push("/task-v2/declare?tab=REJECTED");
    } catch (error) {
      ToastUtils.error("Có lỗi xảy ra khi từ chối công việc.");
      handleError(error);
    } finally {
      setConfirmRejectOpen(false);
      setActionTarget(null);
    }
  };

  const handleModalSuccess = () => {
    queryClient.invalidateQueries({
      queryKey: [queryKeys.taskv2.findBasic],
    });
  };

  const handleModalClose = () => {
    setOpenModal(false);
    setEditData(null);
    setIsViewMode(false);
  };

  const baseContent = getContent(basicDataMap[activeTab]);
  const displayData = baseContent;
  const displayLoading = loadingMap[activeTab];

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
        label: "Chờ Duyệt",
        content: (
          <ListJobTabContent
            tabKey="NEW"
            data={activeTab === "NEW" ? displayData : []}
            isLoading={activeTab === "NEW" ? displayLoading : false}
            onEdit={handleEdit}
            onAccept={handleAccept}
            onReject={handleReject}
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
        label: "Đã Duyệt",
        content: (
          <ListJobTabContent
            tabKey="ACCEPTED"
            data={activeTab === "ACCEPTED" ? displayData : []}
            isLoading={activeTab === "ACCEPTED" ? displayLoading : false}
            onRowClick={handleView}
            onPageChange={handlePageChange}
            onItemsPerPageChange={handlePageSizeChange}
            currentPage={paging.currentPage}
            itemsPerPage={paging.pageSize}
            totalItems={tabCounts.ACCEPTED}
          />
        ),
        count: tabCounts.ACCEPTED,
      },
    ],
    [
      activeTab,
      tabCounts,
      displayData,
      displayLoading,
      handleEdit,
      handleAccept,
      handleReject,
      paging.currentPage,
      paging.pageSize,
    ]
  );

  return (
    <div className="py-0 px-4 flex flex-col gap-4">
      <BreadcrumbNavigation
        items={[{ label: "Quản lý công việc", href: "/task-v2/listjob" }]}
        currentPage="Danh sách công việc"
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
          <ListJobRegularTab />
        </TabsContent>
      </Tabs>
      <ListJobModal
        open={openModal}
        onOpenChange={handleModalClose}
        editData={editData}
        onSuccess={handleModalSuccess}
        isViewMode={isViewMode}
      />
      <ConfirmDeleteDialog
        isOpen={confirmAcceptOpen}
        onOpenChange={(open) => {
          setConfirmAcceptOpen(open);
          if (!open) setActionTarget(null);
        }}
        onConfirm={handleConfirmAccept}
        title="Duyệt công việc"
        description="Bạn có chắc chắn muốn duyệt công việc này?"
        confirmText="Đồng ý"
        cancelText="Hủy"
        isLoading={acceptMutation.isPending}
      />
      <ConfirmDeleteDialog
        isOpen={confirmRejectOpen}
        onOpenChange={(open) => {
          setConfirmRejectOpen(open);
          if (!open) setActionTarget(null);
        }}
        onConfirm={handleConfirmReject}
        title="Từ chối công việc"
        description="Bạn có chắc chắn muốn từ chối công việc này?"
        confirmText="Đồng ý"
        cancelText="Hủy"
        isLoading={acceptMutation.isPending}
      />
    </div>
  );
}
