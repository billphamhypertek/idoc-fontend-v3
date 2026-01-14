"use client";
import { TransferDialog } from "@/components/dialogs/TransferDialog";
import { VehicleRequestDialog } from "@/components/dialogs/VehicleRequestDialog";

import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import StatusBadge from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TransferHandler } from "@/components/vehicles/transferHandler";
import { OrganizationItem, VehicleRequest } from "@/definitions";
import { Column } from "@/definitions/types/table.type";
import {
  useDeleteVehicleUsagePlan,
  useGetListVehicle,
  useTransferHandleList,
} from "@/hooks/data/vehicle.data";
import { ToastUtils } from "@/utils/toast.utils";
import { Edit, Plus, Trash2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { formatDateVN } from "@/utils/datetime.utils";

export default function VehicleRequestPage() {
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [actionDialog, setActionDialog] = useState<{
    action: "add" | "update";
    id: number | null;
  }>({
    action: "add",
    id: null,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const transferMutation = useTransferHandleList();
  const [orgData, setOrgData] = useState<OrganizationItem[]>([]);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const itemsPerPageRef = useRef(itemsPerPage);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const deleteVehicleMutation = useDeleteVehicleUsagePlan();

  const searchParams = useSearchParams();
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pageParam, sizeParam]);

  useEffect(() => {
    itemsPerPageRef.current = itemsPerPage;
  }, [itemsPerPage]);
  const params = {
    active: true,
    startDate: "",
    endDate: "",
    pickUpLocation: "",
    destination: "",
    reason: "",
    orgId: "",
    page: currentPage,
    size: itemsPerPage,
    direction: "DESC",
    status: "TAO_MOI,THU_HOI",
    handleStatus: "DU_THAO",
    sortBy: "creationTime",
  };

  const { data, isLoading, error, refetch } = useGetListVehicle(params);
  const columns: Column<VehicleRequest>[] = [
    {
      header: "STT",
      type: "checkbox",
      className: "w-16 text-center py-1",
    },
    {
      header: "Lý do sử dụng",
      accessor: (item: VehicleRequest) => (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="py-1 cursor-pointer">
                <div className="line-clamp-3 text-sm leading-relaxed">
                  {item.reason || "Không có"}
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContent side="top" className="max-w-md">
              <p className="text-sm whitespace-pre-wrap">
                {item.reason || "Không có"}
              </p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      ),
      className: "py-1 max-w-xs",
    },
    {
      header: "Nơi đi",
      accessor: "startLocation",
      className: "py-1",
    },
    {
      header: "Nơi đến",
      accessor: "destination",
      className: "py-1",
    },
    {
      header: "Thời gian đi",
      accessor: (item: VehicleRequest) =>
        item.expectedStartDate ? formatDateVN(item.expectedStartDate) : "--",
      className: "py-1",
    },
    {
      header: "Thời gian đến",
      accessor: (item: VehicleRequest) =>
        item.expectedEndDate ? formatDateVN(item.expectedEndDate) : "--",
      className: "py-1",
    },
    {
      header: "Tên cơ quan",
      accessor: (item: VehicleRequest) => item.orgName || "--",
      className: "py-1",
    },
    {
      header: "Số người đi",
      accessor: "passengerQuantity",
      className: "py-1",
    },
    {
      header: "Trạng thái",
      accessor: (item: VehicleRequest) => (
        <StatusBadge status={item.statusName || item.handleStatusName} />
      ),
      className: "py-1 status-column",
    },
  ];

  const vehicleRequestsData = data?.content || [];
  const totalItems = data?.totalElements || 0;

  const handleClickDelete = () => {
    if (selectedItems.length === 0) return;

    // For now, delete the first selected item
    // TODO: Implement batch delete if API supports it
    const itemIdToDelete = Number(selectedItems[0]);
    deleteVehicleMutation.mutate(itemIdToDelete, {
      onSuccess: () => {
        ToastUtils.vehicleRequestDeleteSuccess();
        setSelectedItems([]);
        setIsDeleteConfirmOpen(false);
        refetch();
      },
      onError: (error) => {
        console.error("Lỗi khi xóa phiếu:", error);
        ToastUtils.vehicleRequestDeleteError();
        setIsDeleteConfirmOpen(false);
      },
    });
  };

  const handleSelectItem = (keys: React.Key[]) => {
    setSelectedItems(keys.map((key) => String(key)));
  };
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedItems([]); // Clear selection when changing
    const params = new URLSearchParams(searchParams?.toString());
    params.set("page", String(page));
    // Dùng ref để tránh ăn size của lần click trước đó
    params.set("size", String(itemsPerPageRef.current));
    router.push(`/manage-vehicle/register?${params.toString()}`);
  };

  const changePageSize = (size: number) => {
    // Cập nhật ref ngay lập tức để các handler khác lấy đúng giá trị mới
    itemsPerPageRef.current = size;
    setItemsPerPage(size);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams?.toString());
    params.set("page", "1");
    params.set("size", String(size));
    router.push(`/manage-vehicle/register?${params.toString()}`);
  };

  const handleTransferDialogSubmit = (submitData: {
    processingContent: string;
    mainProcessors: number[];
    selectedRoleId: number;
  }) => {
    if (selectedItems.length === 0 || !selectedRole) {
      console.error("No item or role selected");
      return;
    }

    const usagePlanId = Number(selectedItems[0]);
    const currentNodeItem = vehicleRequestsData.find(
      (item) => item.id === Number(usagePlanId)
    );
    const currentNode = currentNodeItem?.currentNode || 0;
    const nextNode = submitData.selectedRoleId;

    const transferBody = {
      usagePlanId,
      comment: submitData.processingContent,
      handler: submitData.mainProcessors, // Should be array of user IDs
      currentNode,
      nextNode,
    };

    transferMutation.mutate(transferBody, {
      onSuccess: () => {
        ToastUtils.transferSuccess();
        setIsTransferDialogOpen(false);
        setSelectedItems([]); // Clear selection
        refetch();
        // Optionally navigate: useRouter().push('/manage-vehicle/main');
      },
      onError: (err) => {
        console.error("Lỗi chuyển xử lý phiếu:", err);
        ToastUtils.transferError();
      },
    });
  };

  return (
    <div className="space-y-4 p-4">
      {/* Breadcrumb */}
      <BreadcrumbNavigation
        items={[
          {
            href: "/manage-vehicle/register",
            label: "Quản lý xe",
          },
        ]}
        currentPage="Phiếu xin xe"
        showHome={false}
      />

      {/* Action buttons */}
      <div className="flex items-center gap-1.5">
        {/* Thêm mới - luôn hiển thị */}
        <Button
          onClick={() => {
            setActionDialog({ action: "add", id: null });
            setIsAddDialogOpen(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-2 text-sm font-medium"
        >
          <Plus className="w-4 h-4 mr-1" />
          Thêm mới phiếu xin xe
        </Button>

        {/* Sửa phiếu - chỉ hiển thị khi chọn đúng 1 item */}
        {selectedItems.length === 1 && (
          <Button
            variant="outline"
            onClick={() => {
              setActionDialog({
                action: "update",
                id: Number(selectedItems[0]) || null,
              });
              setIsAddDialogOpen(true);
            }}
            className="border-blue-600 text-blue-600 hover:bg-blue-50 h-9 px-2 text-sm"
          >
            <Edit className="w-4 h-4 mr-1" />
            Sửa phiếu
          </Button>
        )}

        {/* Chuyển xử lý - hiển thị khi chọn ít nhất 1 item */}
        {selectedItems.length > 0 && (
          <TransferHandler
            selectedItemId={Number(selectedItems[0]) || null}
            currentNode={
              vehicleRequestsData.find(
                (item) => item.id === Number(selectedItems[0])
              )?.currentNode || null
            }
            disabled={selectedItems.length === 0}
            onSuccess={() => {
              setSelectedItems([]);
              refetch();
            }}
          />
        )}

        {/* Xóa phiếu - hiển thị khi chọn ít nhất 1 item */}
        {selectedItems.length > 0 && (
          <Button
            variant="outline"
            onClick={() => setIsDeleteConfirmOpen(true)}
            className="border-red-600 text-red-600 hover:bg-red-50 h-9 px-2 text-sm"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Xóa phiếu
          </Button>
        )}
      </div>

      <Table
        sortable={true}
        columns={columns}
        dataSource={vehicleRequestsData}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        onItemsPerPageChange={changePageSize}
        onRowClick={(item) => {
          router.push(`/manage-vehicle/register/detail/${item.id}`);
        }}
        showPagination
        emptyText={
          isLoading
            ? "Đang tải dữ liệu..."
            : error
              ? `Lỗi: ${error.message}`
              : "Không tồn tại văn bản"
        }
        loading={isLoading}
        rowSelection={{
          selectedRowKeys: selectedItems,
          onChange: (keys) => handleSelectItem(keys),
          rowKey: "id",
        }}
        totalItems={totalItems}
        onSort={(sortConfig) => {
          console.log("Sort changed:", sortConfig);
          // Sort sẽ được handle bởi component Table internally
        }}
      />

      <ConfirmDeleteDialog
        isOpen={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        onConfirm={handleClickDelete}
        title="Bạn có chắc chắn muốn xóa?"
        description={
          selectedItems.length === 1
            ? "Thao tác này sẽ xóa phiếu xin xe đã chọn. Hành động không thể hoàn tác."
            : `Thao tác này sẽ xóa ${selectedItems.length} phiếu xin xe đã chọn. Hành động không thể hoàn tác.`
        }
        confirmText="Xóa"
        cancelText="Hủy"
      />

      {/* Dialogs */}
      <VehicleRequestDialog
        isOpen={isAddDialogOpen}
        onOpenChange={setIsAddDialogOpen}
        onClose={() => setIsAddDialogOpen(false)}
        action={actionDialog.action}
        onSubmit={async () => {
          await refetch();
        }}
        parsedId={actionDialog.id || undefined}
      />

      <TransferDialog
        isOpen={isTransferDialogOpen}
        onOpenChange={setIsTransferDialogOpen}
        onClose={() => setIsTransferDialogOpen(false)}
        onSubmit={handleTransferDialogSubmit}
        selectedRole={selectedRole}
        organizationData={orgData}
      />
    </div>
  );
}
