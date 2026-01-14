"use client";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import StatusBadge from "@/components/common/StatusBadge";
import VehicleCommandDialog from "@/components/dialogs/VehicleCommanDialog";
import { VehicleRequestDialog } from "@/components/dialogs/VehicleRequestDialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { TransferHandler } from "@/components/vehicles/transferHandler";
import { VehicleRequest } from "@/definitions/interfaces/vehicle.interface";
import { Column } from "@/definitions/types/table.type";
import {
  useAcceptDraft,
  useCompleteDraft,
  useGetListLeaderById,
  useGetListSuggestVehicleDriver,
  useGetListVehicle,
  useGetVehicleDetail,
  useRejectDraft,
  useRetakeDraft,
  useUpdateDraft,
  useGetAllOrganizations,
} from "@/hooks/data/vehicle.data";
import useAuthStore from "@/stores/auth.store";
import {
  Edit,
  ChevronLeft,
  CheckSquare2,
  CheckSquare2Icon,
  CircleCheck,
  SquareArrowRight,
  Undo2,
  Search,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  formatDateVN,
  formatDateYMD,
  parseDateStringYMD,
} from "@/utils/datetime.utils";
import { CustomDatePicker } from "@/components/ui/calendar";
import { ToastUtils } from "@/utils/toast.utils";

const defaultFilters = {
  reason: "",
  departurePoint: "",
  destination: "",
  departureDateFrom: "",
  departureDateTo: "",
  organization: "",
  arrivalDateFrom: "",
  arrivalDateTo: "",
};

export default function VehicleProcessingPage() {
  const searchParams = useSearchParams();
  const { data: organizations, isLoading: orgLoading } =
    useGetAllOrganizations();
  const router = useRouter();
  const pathname = usePathname();
  const currentTabParam = searchParams?.get("currentTab") || "CHO_XU_LY";
  const activeTab =
    currentTabParam === "CHO_XU_LY"
      ? "pending"
      : currentTabParam === "DA_XU_LY"
        ? "processed"
        : currentTabParam === "DA_HOAN_THANH"
          ? "completed"
          : "pending";
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [tempFilters, setTempFilters] = useState(defaultFilters);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const itemsPerPageRef = useRef(itemsPerPage);
  const pageParam = searchParams?.get("page") || "1";
  const sizeParam = searchParams?.get("size") || "10";

  useEffect(() => {
    const parsedPage = Number(pageParam);
    const parsedSize = Number(sizeParam);
    if (
      !Number.isNaN(parsedPage) &&
      parsedPage > 0 &&
      parsedPage !== currentPage
    ) {
      setCurrentPage(parsedPage);
    }
    if (
      !Number.isNaN(parsedSize) &&
      parsedSize > 0 &&
      parsedSize !== itemsPerPage
    ) {
      setItemsPerPage(parsedSize);
    }
  }, [pageParam, sizeParam]);

  useEffect(() => {
    itemsPerPageRef.current = itemsPerPage;
  }, [itemsPerPage]);
  const [isCommandDialogOpen, setIsCommandDialogOpen] = useState(false);
  const [isEditCommandDialogOpen, setIsEditCommandDialogOpen] = useState(false);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [rejectComment, setRejectComment] = useState("");
  const [isEditRequestDialogOpen, setIsEditRequestDialogOpen] = useState(false);
  const { user } = useAuthStore();
  const selectedId = Number(selectedItems[0]) || 0;
  const { data: selectedDetail, isLoading: detailLoading } =
    useGetVehicleDetail(selectedId, selectedItems.length === 1);
  const { data: drivers } = useGetListSuggestVehicleDriver(user?.org ?? 0);
  const leaderId =
    selectedDetail?.handleType === "ORG"
      ? (user?.orgModel?.parentId ?? 0)
      : 237;
  const { data: listOrgCVV } = useGetListLeaderById(
    leaderId,
    !!selectedDetail && !!user
  );
  const { mutateAsync: acceptDraft } = useAcceptDraft();
  const { mutateAsync: updateDraft } = useUpdateDraft();
  const { mutateAsync: retakeDraft } = useRetakeDraft();
  const { mutateAsync: completeDraft } = useCompleteDraft();
  const { mutateAsync: rejectDraft } = useRejectDraft();

  const vehicleColumns: Column<VehicleRequest>[] = [
    {
      header: "STT",
      type: "checkbox",
      className: "text-center py-2 w-16",
    },
    { header: "Lý do sử dụng", accessor: (item: any) => item.reason },
    { header: "Nơi đi", accessor: (item: any) => item.pickUpLocation },
    { header: "Nơi đến", accessor: (item: any) => item.destination },
    {
      header: "Thời gian đi",
      accessor: (item: any) =>
        item.expectedStartDate ? formatDateVN(item.expectedStartDate) : "--",
    },
    {
      header: "Thời gian đến",
      accessor: (item: any) =>
        item.expectedEndDate ? formatDateVN(item.expectedEndDate) : "--",
    },
    {
      header: "Tên cơ quan",
      accessor: (item: any) => item.orgName || "--",
    },
    {
      header: "Số người đi",
      accessor: (item: any) => item.passengerQuantity,
    },
    {
      header: "Trạng thái",
      accessor: (item) => (
        <StatusBadge status={item.statusName || item.handleStatusName} />
      ),
    },
  ];

  const baseParams = useMemo(
    () => ({
      active: true,
      startLocation: appliedFilters.departurePoint,
      destination: appliedFilters.destination,
      reason: appliedFilters.reason,
      orgId: appliedFilters.organization,
      startDateFrom: appliedFilters.departureDateFrom,
      startDateTo: appliedFilters.departureDateTo,
      endDateFrom: appliedFilters.arrivalDateFrom,
      endDateTo: appliedFilters.arrivalDateTo,
      page: currentPage,
      size: itemsPerPage,
      direction: "DESC",
      sortBy: "",
    }),
    [appliedFilters, currentPage, itemsPerPage]
  );

  const pendingParams = useMemo(
    () => ({
      ...baseParams,
      status: "CHO_XU_LY,TRA_LAI,DA_DUYET",
      handleStatus: "CHO_XU_LY,BI_TRA_LAI",
      page: currentPage,
      size: itemsPerPage,
    }),
    [baseParams, currentPage, itemsPerPage]
  );
  const {
    data: pendingData,
    isLoading: isPendingLoading,
    refetch: refetchPendingData,
  } = useGetListVehicle(pendingParams);

  const processedParams = useMemo(
    () => ({
      ...baseParams,
      status: "CHO_XU_LY,TRA_LAI,DA_DUYET",
      handleStatus: "DA_XU_LY,DA_TRA_LAI",
      page: currentPage,
      size: itemsPerPage,
    }),
    [baseParams, currentPage, itemsPerPage]
  );
  const {
    data: processedData,
    isLoading: isProcessedLoading,
    refetch: refetchProcessedData,
  } = useGetListVehicle(processedParams);

  const completedParams = useMemo(
    () => ({
      ...baseParams,
      status: "HOAN_THANH",
      handleStatus: "DA_XU_LY",
      page: currentPage,
      size: itemsPerPage,
    }),
    [baseParams, currentPage, itemsPerPage]
  );
  const {
    data: completedData,
    isLoading: isCompletedLoading,
    refetch: refetchCompletedData,
  } = useGetListVehicle(completedParams);

  const pendingCount = pendingData?.totalElements || 0;
  const processedCount = processedData?.totalElements || 0;
  const completedCount = completedData?.totalElements || 0;

  const currentData =
    activeTab === "pending"
      ? pendingData
      : activeTab === "processed"
        ? processedData
        : completedData;
  const isCurrentLoading =
    activeTab === "pending"
      ? isPendingLoading
      : activeTab === "processed"
        ? isProcessedLoading
        : isCompletedLoading;
  const currentRefetch =
    activeTab === "pending"
      ? refetchPendingData
      : activeTab === "processed"
        ? refetchProcessedData
        : refetchCompletedData;

  useEffect(() => {
    setCurrentPage(1);
    setSelectedItems([]);
    setItemsPerPage(10);
  }, [currentTabParam]);

  const vehicleRequestsData = currentData?.content || [];
  const selectedItem = vehicleRequestsData.find(
    (item) => item.id === selectedId
  );
  const totalItems = currentData?.totalElements || 0;
  const totalPages =
    currentData?.totalPages || Math.ceil(totalItems / itemsPerPageRef.current);

  const commandInitialData = useMemo(() => {
    if (!selectedDetail) return {};
    return {
      licensePlate: selectedDetail.licensePlate || undefined,
      type: selectedDetail.type || undefined,
      driverName: selectedDetail.driverName || undefined,
      driverPhone: selectedDetail.driverPhone || "",
      distance: selectedDetail.distance ? String(selectedDetail.distance) : "",
      ...(selectedDetail.signer2 && listOrgCVV
        ? {
            commandSigner: listOrgCVV.find(
              (signer) => signer.fullName === selectedDetail.signer2
            ),
          }
        : {}),
      commandNumber: selectedDetail.ticketNumber,
      startDate: selectedDetail.startDate
        ? new Date(selectedDetail.startDate)
        : undefined,
      startTime: selectedDetail.startDate
        ? new Date(selectedDetail.startDate)
        : undefined,
      endDate: selectedDetail.endDate
        ? new Date(selectedDetail.endDate)
        : undefined,
      endTime: selectedDetail.endDate
        ? new Date(selectedDetail.endDate)
        : undefined,
      commandDate: selectedDetail.commandDate
        ? new Date(selectedDetail.commandDate)
        : undefined,
    };
  }, [selectedDetail, listOrgCVV]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedItems([]);

    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("page", String(page));
    params.set("size", String(itemsPerPageRef.current));
    params.set("currentTab", currentTabParam);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleSearchFilterChange = (field: string, value: string) => {
    setTempFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSearch = () => {
    setAppliedFilters(tempFilters);
    setCurrentPage(1);
    setSelectedItems([]);
  };

  const handleResetSearch = () => {
    setTempFilters(defaultFilters);
    setAppliedFilters(defaultFilters);
    setCurrentPage(1);
    setSelectedItems([]);
  };

  const handleAccept = async (data: any) => {
    try {
      await acceptDraft(selectedId);
      await updateDraft({ ...data, id: selectedId });
      setIsCommandDialogOpen(false);
      currentRefetch();
      setSelectedItems([]);
    } catch (error) {
      console.error("Accept error:", error);
    }
  };

  const handleEditCommand = async (data: any) => {
    try {
      await updateDraft({ ...data, id: selectedId });
      setIsEditCommandDialogOpen(false);
      currentRefetch();
      setSelectedItems([]);
    } catch (error) {
      console.error("Edit command error:", error);
    }
  };

  const handleRetake = async () => {
    try {
      await retakeDraft(selectedId);
      currentRefetch();
      setSelectedItems([]);
    } catch (error) {
      console.error("Retake error:", error);
    }
  };

  const handleReject = async () => {
    try {
      await rejectDraft({ id: selectedId, comment: rejectComment });
      setIsRejectDialogOpen(false);
      currentRefetch();
      setSelectedItems([]);
    } catch (error) {
      console.error("Reject error:", error);
    }
  };

  const handleComplete = async () => {
    try {
      await completeDraft([selectedId]);
      currentRefetch();
      setSelectedItems([]);
      ToastUtils.success("Hoàn thành phiếu thành công");
    } catch (error) {
      console.error("Complete error:", error);
      ToastUtils.error("Lỗi hoàn thành phiếu");
    }
  };

  const handleEditRequest = () => {
    setIsEditRequestDialogOpen(true);
  };

  const showTransferButton =
    activeTab === "pending" &&
    selectedItems.length === 1 &&
    selectedItem?.action?.canTransfer;
  const showCreateCommandButton =
    activeTab === "pending" &&
    selectedItems.length === 1 &&
    selectedItem?.action?.canAccept;
  const showEditCommandButton =
    activeTab === "pending" &&
    selectedItems.length === 1 &&
    selectedItem?.action?.canEditCommand;
  const showRetakeButton =
    activeTab === "processed" &&
    selectedItems.length === 1 &&
    selectedItem?.action?.canRetake;
  const showEditDraftButton =
    activeTab === "pending" &&
    selectedItems.length === 1 &&
    selectedItem?.action?.canEdit;
  const showRejectButton =
    activeTab === "pending" &&
    selectedItems.length === 1 &&
    selectedItem?.action?.canReject;
  const showCompleteButton =
    activeTab === "pending" &&
    selectedItems.length === 1 &&
    selectedItem?.action?.canFinish;

  return (
    <div className="space-y-4 p-4">
      <BreadcrumbNavigation
        items={[{ href: "/manage-vehicle/register", label: "Quản lý xe" }]}
        currentPage="Xử lý chính"
        showHome={false}
      />

      <div className="flex items-center gap-2 flex-wrap">
        {showTransferButton && (
          <TransferHandler
            selectedItemId={selectedId}
            currentNode={selectedItem?.currentNode || null}
            disabled={false}
            onSuccess={() => {
              setSelectedItems([]);
              currentRefetch();
            }}
          />
        )}

        {showCreateCommandButton && (
          <Button
            onClick={() => setIsCommandDialogOpen(true)}
            className="flex items-center gap-1 text-white h-9 px-2 text-xs font-medium"
            style={{ backgroundColor: "#22c6ab", borderColor: "#22c6ab" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#1ea896";
              e.currentTarget.style.borderColor = "#1ea896";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#22c6ab";
              e.currentTarget.style.borderColor = "#22c6ab";
            }}
          >
            <Edit className="w-3 h-3" />
            Tạo lệnh điều xe
          </Button>
        )}

        {showEditCommandButton && (
          <Button
            onClick={() => setIsEditCommandDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-2 text-xs font-medium"
          >
            <Edit className="w-3 h-3" />
            Sửa lệnh điều xe
          </Button>
        )}

        {showRetakeButton && (
          <Button
            onClick={handleRetake}
            className="bg-orange-600 hover:bg-orange-700 text-white h-9 px-2 text-xs font-medium"
          >
            <Undo2 className="w-3 h-3" />
            Thu hồi
          </Button>
        )}

        {showEditDraftButton && (
          <Button
            onClick={handleEditRequest}
            className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-2 text-xs font-medium"
          >
            <Edit className="w-3 h-3" />
            Sửa phiếu
          </Button>
        )}

        {showRejectButton && (
          <Button
            onClick={() => setIsRejectDialogOpen(true)}
            className="flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white h-9 px-2 text-xs font-medium border-red-600"
          >
            <SquareArrowRight className="w-3 h-3" />
            Trả lại
          </Button>
        )}

        {showCompleteButton && (
          <Button
            onClick={handleComplete}
            className="flex items-center gap-1 text-white h-9 px-2 text-xs font-medium"
            style={{ backgroundColor: "#22c6ab", borderColor: "#22c6ab" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#1ea896";
              e.currentTarget.style.borderColor = "#1ea896";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#22c6ab";
              e.currentTarget.style.borderColor = "#22c6ab";
            }}
          >
            <CircleCheck className="w-4 h-4" />
            Hoàn thành xử lý
          </Button>
        )}
      </div>

      {isAdvancedSearchOpen && (
        <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Lý do sử dụng
              </label>
              <input
                type="text"
                value={tempFilters.reason}
                onChange={(e) =>
                  handleSearchFilterChange("reason", e.target.value)
                }
                className="w-full h-9 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Nhập lý do sử dụng xe"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Nơi đi
              </label>
              <input
                type="text"
                value={tempFilters.departurePoint}
                onChange={(e) =>
                  handleSearchFilterChange("departurePoint", e.target.value)
                }
                className="w-full h-9 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Nhập nơi đi"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Nơi đến
              </label>
              <input
                type="text"
                value={tempFilters.destination}
                onChange={(e) =>
                  handleSearchFilterChange("destination", e.target.value)
                }
                className="w-full h-9 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                placeholder="Nhập nơi đến"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Thời gian đi từ ngày
              </label>
              <CustomDatePicker
                selected={parseDateStringYMD(tempFilters.departureDateFrom)}
                onChange={(date) =>
                  handleSearchFilterChange(
                    "departureDateFrom",
                    formatDateYMD(date)
                  )
                }
                placeholder="Chọn ngày"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Thời gian đi đến ngày
              </label>
              <CustomDatePicker
                selected={parseDateStringYMD(tempFilters.departureDateTo)}
                onChange={(date) =>
                  handleSearchFilterChange(
                    "departureDateTo",
                    formatDateYMD(date)
                  )
                }
                placeholder="Chọn ngày"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Cơ quan, đơn vị
              </label>
              <select
                value={tempFilters.organization}
                onChange={(e) =>
                  handleSearchFilterChange("organization", e.target.value)
                }
                disabled={orgLoading}
                className="w-full h-9 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              >
                <option value="">
                  {orgLoading ? "Đang tải..." : "--- Chọn ---"}
                </option>
                {(organizations ?? []).map((org: any) => {
                  const value = String(org.id ?? org.orgId ?? "");
                  const label =
                    org.name ?? org.orgName ?? org.fullName ?? "Không tên";
                  return (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Thời gian đến từ ngày
              </label>
              <CustomDatePicker
                selected={parseDateStringYMD(tempFilters.arrivalDateFrom)}
                onChange={(date) =>
                  handleSearchFilterChange(
                    "arrivalDateFrom",
                    formatDateYMD(date)
                  )
                }
                placeholder="Chọn ngày"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Thời gian đến đến ngày
              </label>
              <CustomDatePicker
                selected={parseDateStringYMD(tempFilters.arrivalDateTo)}
                onChange={(date) =>
                  handleSearchFilterChange("arrivalDateTo", formatDateYMD(date))
                }
                placeholder="Chọn ngày"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 mt-4">
            <Button
              onClick={handleSearch}
              className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 text-sm font-medium"
            >
              Tìm kiếm
            </Button>
            <Button
              onClick={handleResetSearch}
              variant="outline"
              className="h-9 px-4 text-sm font-medium border-gray-300 hover:bg-gray-50"
            >
              Đặt lại
            </Button>
          </div>
        </div>
      )}

      <div className="border-b border-gray-200">
        <div className="flex items-center justify-between">
          <nav className="-mb-px flex space-x-8">
            <a
              href={`?page=1&size=10&currentTab=CHO_XU_LY`}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "pending"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Chờ xử lý
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                {pendingCount}
              </span>
            </a>
            <a
              href={`?page=1&size=10&currentTab=DA_XU_LY`}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "processed"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Đã xử lý
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                {processedCount}
              </span>
            </a>
            <a
              href={`?page=1&size=10&currentTab=DA_HOAN_THANH`}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "completed"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Đã hoàn thành
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                {completedCount}
              </span>
            </a>
          </nav>

          {/* Button Tìm kiếm nâng cao ở góc phải */}
          <div className="pb-2">
            <Button
              onClick={() => setIsAdvancedSearchOpen(!isAdvancedSearchOpen)}
              className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-2 text-xs font-medium"
            >
              <Search className="w-4 h-4 mr-1" />
              Tìm kiếm nâng cao
            </Button>
          </div>
        </div>
      </div>

      <Table
        sortable={true}
        columns={vehicleColumns}
        dataSource={vehicleRequestsData}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        showPagination={true}
        bgColor="bg-white"
        onRowClick={(item) => {
          router.push(`/manage-vehicle/register/detail/${item.id}`);
        }}
        className="overflow-hidden"
        emptyText="Không tồn tại văn bản"
        pageSizeOptions={[5, 10, 25, 50]}
        rowSelection={{
          selectedRowKeys: selectedItems,
          onChange: (keys) => {
            if (keys.length === 0) {
              setSelectedItems([]);
            } else {
              setSelectedItems([String(keys[keys.length - 1])]);
            }
          },
          rowKey: "id",
        }}
        onItemsPerPageChange={(size) => {
          itemsPerPageRef.current = size;
          setCurrentPage(1);
          setItemsPerPage(size);

          const params = new URLSearchParams(searchParams?.toString() || "");
          params.set("page", "1");
          params.set("size", String(size));
          params.set("currentTab", currentTabParam);
          router.replace(`${pathname}?${params.toString()}`);
        }}
        loading={isCurrentLoading}
        onSort={(sortConfig) => {
          console.log("Sort changed:", sortConfig);
        }}
      />

      <VehicleCommandDialog
        isOpen={isCommandDialogOpen}
        onOpenChange={setIsCommandDialogOpen}
        isEditMode={false}
        onSubmit={handleAccept}
        drivers={drivers}
        signers={listOrgCVV}
      />

      <VehicleCommandDialog
        isOpen={isEditCommandDialogOpen}
        onOpenChange={setIsEditCommandDialogOpen}
        isEditMode={true}
        onSubmit={handleEditCommand}
        initialData={commandInitialData}
        drivers={drivers}
        signers={listOrgCVV}
      />

      <VehicleRequestDialog
        onClose={() => setIsEditRequestDialogOpen(false)}
        isOpen={isEditRequestDialogOpen}
        onOpenChange={setIsEditRequestDialogOpen}
        action="update"
        onSubmit={async () => {
          currentRefetch();
          setSelectedItems([]);
        }}
        parsedId={selectedId || undefined}
      />

      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Trả lại</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Label htmlFor="rejectComment">Nội dung trả lại</Label>
            <Textarea
              id="rejectComment"
              value={rejectComment}
              onChange={(e) => setRejectComment(e.target.value)}
            />
            <Button onClick={handleReject}>Xác nhận</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
