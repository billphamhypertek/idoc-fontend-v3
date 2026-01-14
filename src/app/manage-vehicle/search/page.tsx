"use client";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import StatusBadge from "@/components/common/StatusBadge";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";
import AdvancedSearch, {
  Filters,
} from "@/components/vehicles/searchs/advancedSearch";
import { VehicleRequest } from "@/definitions";
import {
  useFindByOrgCVV,
  useGetListSuggestVehicleDriver,
  // CHỖ SỬA: dùng hook find-all thay vì list-all
  useGetListVehicleFindAll,
} from "@/hooks/data/vehicle.data";
import useAuthStore from "@/stores/auth.store";
import { Plus } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

const defaultFilters = {
  licensePlate: "",
  driverName: "",
  driverPhone: "",
  type: "",
  reason: "",
  startLocation: "",
  pickUpLocation: "",
  destination: "",
  startDate: "",
  endDate: "",
  orgId: "",
};

export default function VehicleSearchPage() {
  const pathname = usePathname();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(true);
  const [appliedFilters, setAppliedFilters] = useState(defaultFilters);
  const [isOpenSearchByOrgId, setIsOpenSearchByOrgId] = useState(false);
  const [pageTitle, setPageTitle] = useState("Tìm kiếm tra cứu xe");
  const [isCheckExport, setIsCheckExport] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const itemsPerPageRef = useRef(itemsPerPage);
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
  }, [pageParam, sizeParam]);

  useEffect(() => {
    itemsPerPageRef.current = itemsPerPage;
  }, [itemsPerPage]);
  const { user } = useAuthStore();
  const { data: listOrgCVV } = useFindByOrgCVV();
  const { data: listDriver } = useGetListSuggestVehicleDriver(user?.org || 0);

  const userOrgId = user?.org || null;

  useEffect(() => {
    if (userOrgId === 260) setIsOpenSearchByOrgId(true);
    if (pathname?.includes("report")) {
      setPageTitle("Báo cáo tổng hợp đăng ký mượn xe");
      setIsCheckExport(true);
    } else {
      setPageTitle("Tìm kiếm tra cứu xe");
      setIsCheckExport(false);
    }
  }, [pathname, userOrgId]);

  // CHỖ SỬA: tham số cho FIND-ALL (gọn, đúng key)
  const baseParams = useMemo(
    () => ({
      active: true,
      startDate: appliedFilters.startDate,
      endDate: appliedFilters.endDate,
      pickUpLocation: appliedFilters.pickUpLocation,
      startLocation: appliedFilters.startLocation,
      destination: appliedFilters.destination,
      reason: appliedFilters.reason,
      orgId: appliedFilters.orgId,
      page: currentPage,
      size: itemsPerPage, // không cần *2 nữa
      direction: "DESC",
      status: isCheckExport
        ? "HOAN_THANH,DA_DUYET"
        : "TAO_MOI,THU_HOI,HOAN_THANH,TRA_LAI,CHO_XU_LY,TU_CHOI,DA_DUYET",
      licensePlate: appliedFilters.licensePlate,
      driverName: appliedFilters.driverName,
      driverPhone: appliedFilters.driverPhone,
      type: appliedFilters.type,
    }),
    [appliedFilters, currentPage, itemsPerPage, isCheckExport]
  );

  // CHỖ SỬA: gọi FIND-ALL
  const { data: vehicleData, isLoading } = useGetListVehicleFindAll(baseParams);

  const vehicleRequestsData = vehicleData?.content || [];
  const totalItems = vehicleData?.totalElements || 0;

  const columns = [
    {
      header: "STT",
      accessor: (_: VehicleRequest, index: number) => (
        <span className="text-xs font-medium">
          {(currentPage - 1) * itemsPerPage + index + 1}
        </span>
      ),
      className: "text-center py-2 w-16",
    },
    {
      header: "Lý do sử dụng",
      accessor: (item: VehicleRequest) => (
        <div className="text-sm font-medium text-gray-900">{item.reason}</div>
      ),
      className: "py-2",
    },
    {
      header: "Nơi đi",
      accessor: (item: VehicleRequest) => (
        <div className="text-sm text-gray-900 break-words leading-relaxed">
          {item.startLocation || "--"}
        </div>
      ),
      className: "py-2",
      style: { width: "256px", minWidth: "256px", maxWidth: "256px" },
    },
    {
      header: "Nơi đến",
      accessor: (item: VehicleRequest) => (
        <div className="text-sm text-gray-900 break-words leading-relaxed">
          {item.destination}
        </div>
      ),
      className: "py-2",
      style: { width: "256px", minWidth: "256px", maxWidth: "256px" },
    },
    {
      header: "Thời gian đi",
      accessor: (item: VehicleRequest) => (
        <div className="text-sm text-gray-900">
          {item.expectedStartDate
            ? new Date(item.expectedStartDate).toLocaleDateString("vi-VN")
            : "--"}
        </div>
      ),
      className: "py-2",
    },
    {
      header: "Thời gian đến",
      accessor: (item: VehicleRequest) => (
        <div className="text-sm text-gray-900">
          {item.expectedEndDate
            ? new Date(item.expectedEndDate).toLocaleDateString("vi-VN")
            : "--"}
        </div>
      ),
      className: "py-2",
    },
    {
      header: "Tên cơ quan",
      accessor: (item: VehicleRequest) => (
        <div className="text-sm text-gray-900">{item.orgName || "--"}</div>
      ),
      className: "py-2",
    },
    {
      header: "Loại xe",
      accessor: (item: VehicleRequest) => (
        <div className="text-sm text-gray-900">{item.type || "--"}</div>
      ),
      className: "py-2",
    },
    {
      header: "Biển kiểm soát",
      accessor: (item: VehicleRequest) => (
        <div className="text-sm text-gray-900 font-mono">
          {item.licensePlate || "--"}
        </div>
      ),
      className: "py-2",
      style: { width: "128px", minWidth: "128px", maxWidth: "128px" },
    },
    {
      header: "Trạng thái",
      accessor: (item: VehicleRequest) => (
        <StatusBadge status={item.statusName} />
      ),
      className: "py-2",
    },
  ];

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const params = new URLSearchParams("");
    params.set("page", String(page));
    params.set("size", String(itemsPerPageRef.current));
    router.replace(`${pathname}?${params.toString()}`);
  };
  const handleApply = (filters: Filters) => {
    setAppliedFilters(filters);
    setCurrentPage(1);
    const params = new URLSearchParams("");
    params.set("page", "1");
    params.set("size", String(itemsPerPageRef.current));
    router.replace(`${pathname}?${params.toString()}`);
  };

  const changePageSize = (size: number) => {
    itemsPerPageRef.current = size;
    setItemsPerPage(size);
    setCurrentPage(1);
    const params = new URLSearchParams("");
    params.set("page", "1");
    params.set("size", String(size));
    router.replace(`${pathname}?${params.toString()}`);
  };
  const handleReset = () => {
    setAppliedFilters(defaultFilters);
    setCurrentPage(1);
    const params = new URLSearchParams("");
    params.set("page", "1");
    params.set("size", String(itemsPerPageRef.current));
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-4 p-4">
      <BreadcrumbNavigation
        items={[{ href: "/manage-vehicle/register", label: "Quản lý xe" }]}
        currentPage={pageTitle}
        showHome={false}
      />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">{pageTitle}</h2>
        <Button
          onClick={() => setIsAdvancedSearchOpen(!isAdvancedSearchOpen)}
          variant="outline"
          className="h-9 px-4 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white hover:text-white"
        >
          <Plus
            className={`w-4 h-4 mr-2 transition-transform ${isAdvancedSearchOpen ? "rotate-45" : ""}`}
          />
          {isAdvancedSearchOpen ? "Thu gọn tìm kiếm" : "Tìm kiếm nâng cao"}
        </Button>
      </div>

      {isAdvancedSearchOpen && (
        <AdvancedSearch
          initialFilters={appliedFilters}
          appliedFilters={appliedFilters}
          listDriver={listDriver || []}
          listOrgCVV={listOrgCVV || []}
          isOpenSearchByOrgId={isOpenSearchByOrgId}
          isCheckExport={isCheckExport}
          onApply={handleApply}
          onReset={handleReset}
        />
      )}
      <Table<VehicleRequest>
        sortable={true}
        columns={columns}
        dataSource={vehicleRequestsData}
        showPagination
        totalItems={totalItems}
        onPageChange={handlePageChange}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        showPageSize
        pageSizeOptions={[5, 10, 25, 50]}
        onItemsPerPageChange={changePageSize}
        className="w-full"
        bgColor="bg-white"
        onRowClick={(item) =>
          router.push(`/manage-vehicle/register/detail/${item.id}`)
        }
        loading={isLoading}
        onSort={(sortConfig) => {
          console.log("Sort changed:", sortConfig);
        }}
      />
    </div>
  );
}
