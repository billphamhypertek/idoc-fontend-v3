"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Pencil, Plus, Search, Lock, Unlock, RefreshCcw } from "lucide-react";
import SelectCustom from "../common/SelectCustom";
import { Button } from "../ui/button";
import { Card, CardContent } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Table } from "../ui/table";
import { useGetCategoryWithCode } from "@/hooks/data/document-out.data";
import { Constant } from "@/definitions/constants/constant";
import { useSearchOrganizations } from "@/hooks/data/organization.data";
import { OrganizationService } from "@/services/organization.service";
import OrganizationModal from "./OrganizationModal";
import ConfirmDeleteDialog from "../common/ConfirmDeleteDialog";
import { handleError } from "@/utils/common.utils";
import { getDefaultOrganizationSearchValues } from "@/utils/formValue.utils";
import { ToastUtils } from "@/utils/toast.utils";

interface OrganizationTableProps {
  treeData: any;
  onRefresh?: () => void;
  selectedOrg?: any;
  onClearSelection?: () => void;
}

export default function OrganizationTable({
  treeData,
  onRefresh,
  selectedOrg,
  onClearSelection,
}: OrganizationTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchParams, setSearchParams] = useState(
    getDefaultOrganizationSearchValues()
  );
  const [searchList, setSearchList] = useState<any>(null);
  const selectedOrgIdRef = useRef<any>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [openOrgEditModal, setOpenOrgEditModal] = useState(false);
  const [openOrgCreateModal, setOpenOrgCreateModal] = useState(false);
  const [confirmLockModal, setConfirmLockModal] = useState(false);
  const [lockAction, setLockAction] = useState<"lock" | "unlock" | null>(null);
  const [selectedOrgForAction, setSelectedOrgForAction] = useState<any>(null);

  const { data: organizationType } = useGetCategoryWithCode(
    Constant.CATEGORYTYPE_CODE.ORG_TYPE
  );

  const { mutate: searchOrganizations, isPending: isLoading } =
    useSearchOrganizations();

  const performSearch = useCallback(
    (page: number, params: typeof searchParams) => {
      const apiParams = {
        ...params,
        active:
          params.active === "true"
            ? true
            : params.active === "false"
              ? false
              : undefined,
        orgType:
          params.orgType && params.orgType !== "0"
            ? Number(params.orgType)
            : undefined,
      };
      searchOrganizations(
        { page, data: apiParams },
        {
          onSuccess: (data) => {
            setSearchList(data);
          },
          onError: (error) => {
            handleError(error);
          },
        }
      );
    },
    [searchOrganizations]
  );

  useEffect(() => {
    performSearch(1, searchParams);
  }, []);

  useEffect(() => {
    const currentOrgId = selectedOrg?.id;
    if (selectedOrgIdRef.current !== currentOrgId) {
      selectedOrgIdRef.current = currentOrgId;

      if (selectedOrg) {
        const newParams = {
          ...getDefaultOrganizationSearchValues(),
          parentId: selectedOrg.id,
        };
        setSearchParams(newParams);
        setCurrentPage(1);
        performSearch(1, newParams);
      } else {
        const newParams = getDefaultOrganizationSearchValues();
        setSearchParams(newParams);
        setCurrentPage(1);
        performSearch(1, newParams);
      }
    }
  }, [selectedOrg, performSearch]);

  const columns = [
    {
      header: "STT",
      accessor: (item: any, index: number) => (
        <div>
          {Number(currentPage - 1) * Number(searchList?.size) + index + 1}
        </div>
      ),
      className: "text-center w-4 border-r",
    },
    {
      header: "Tên đơn vị",
      accessor: (item: any) => <div>{item.name}</div>,
      className: "text-left w-44 border-r",
    },
    {
      header: "Số điện thoại",
      accessor: (item: any) => <div>{item.phone}</div>,
      className: "text-center w-44 border-r",
    },
    {
      header: "Đơn vị cấp trên",
      accessor: (item: any) => (
        <div>{item.name !== "" ? "" : getParentName(item.parentId)}</div>
      ),
      className: "text-left w-44 border-r",
    },
    {
      header: "Thứ tự ưu tiên",
      accessor: (item: any) => <div>{item.order || "-"}</div>,
      className: "text-center w-4 border-r",
    },
    {
      header: "Thao tác",
      accessor: (item: any) => {
        return (
          <div className="flex items-center justify-center gap-2">
            {!item.isLdap && (
              <Button
                size="sm"
                variant="outline"
                className="p-1 h-9 w-8 bg-transparent hover:bg-transparent border-none shadow-none"
                title="Chỉnh sửa"
                onClick={() => {
                  setSelectedOrgForAction(item);
                  setIsEditMode(true);
                  setOpenOrgEditModal(true);
                }}
              >
                <Pencil className="w-4 h-4" />
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              className="p-1 h-9 w-8 bg-transparent hover:bg-transparent border-none shadow-none"
              title={item.active ? "Khóa" : "Mở khóa"}
              onClick={() => {
                setSelectedOrgForAction(item);
                setLockAction(item.active ? "lock" : "unlock");
                setConfirmLockModal(true);
              }}
            >
              {!item.active ? (
                <Lock className="w-4 h-4 text-red-500" />
              ) : (
                <Unlock className="w-4 h-4 text-green-500" />
              )}
            </Button>
          </div>
        );
      },
      className: "text-center w-4",
    },
  ];

  const getParentName = (parentId: number) => {
    const parent = treeData?.find((org: any) => org.id == parentId);
    return parent?.name || "";
  };

  const handleSearch = () => {
    setCurrentPage(1);
    performSearch(1, searchParams);
  };

  const handleReset = () => {
    const defaultParams = getDefaultOrganizationSearchValues();
    setSearchParams(defaultParams);
    setCurrentPage(1);
    performSearch(1, defaultParams);
    if (onClearSelection) {
      onClearSelection();
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    performSearch(page, searchParams);
  };

  const handleLockUnlock = async () => {
    if (!selectedOrgForAction || !lockAction) return;

    try {
      if (lockAction === "lock") {
        await OrganizationService.deactiveOrganization(selectedOrgForAction.id);
      } else {
        await OrganizationService.activeOrganization(selectedOrgForAction.id);
      }

      setConfirmLockModal(false);
      setSelectedOrgForAction(null);
      setLockAction(null);

      ToastUtils.success(
        lockAction === "lock"
          ? "Khóa đơn vị thành công!"
          : "Mở khóa đơn vị thành công!"
      );

      performSearch(currentPage, searchParams);
      onRefresh?.();
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col">
        <h2 className="text-lg font-bold">Đơn vị cấp dưới</h2>
        <p className="text-sm text-gray-500">Thông tin đơn vị cấp dưới </p>
      </div>
      <Card className="rounded-none shadow-sm">
        <CardContent className="py-6 px-3 space-y-6">
          <div className="space-y-6">
            {/* First Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <Label className="text-sm font-bold text-gray-700 w-24 flex-shrink-0 text-end">
                  Tên đơn vị
                </Label>
                <Input
                  type="text"
                  className="h-9 text-sm flex-1"
                  placeholder="Nhập tên đơn vị..."
                  value={searchParams.name}
                  onChange={(e) =>
                    setSearchParams((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex items-center gap-4">
                <Label className="text-sm font-bold text-gray-700 w-24 flex-shrink-0 text-end">
                  Loại đơn vị
                </Label>
                <div className="flex-1">
                  <SelectCustom
                    options={[
                      { label: "----Chọn----", value: "0" },
                      ...(organizationType?.map((item: any) => ({
                        label: item.name,
                        value: item.id,
                      })) || []),
                    ]}
                    value={searchParams.orgType}
                    onChange={(value) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        orgType: value as string,
                      }))
                    }
                    placeholder="--Chọn--"
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Second Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <Label className="text-sm font-bold text-gray-700 w-24 flex-shrink-0 text-end">
                  Email
                </Label>
                <Input
                  type="email"
                  className="h-9 text-sm flex-1"
                  placeholder="Nhập email..."
                  value={searchParams.email}
                  onChange={(e) =>
                    setSearchParams((prev) => ({
                      ...prev,
                      email: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex items-center gap-4">
                <Label className="text-sm font-bold text-gray-700 w-24 flex-shrink-0 text-end">
                  Địa chỉ
                </Label>
                <Input
                  type="text"
                  className="h-9 text-sm flex-1"
                  placeholder="Nhập địa chỉ..."
                  value={searchParams.address}
                  onChange={(e) =>
                    setSearchParams((prev) => ({
                      ...prev,
                      address: e.target.value,
                    }))
                  }
                />
              </div>
            </div>

            {/* Third Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center gap-4">
                <Label className="text-sm font-bold text-gray-700 w-24 flex-shrink-0 text-end">
                  Số điện thoại
                </Label>
                <Input
                  type="tel"
                  className="h-9 text-sm flex-1"
                  placeholder="Nhập số điện thoại..."
                  value={searchParams.phone}
                  onChange={(e) =>
                    setSearchParams((prev) => ({
                      ...prev,
                      phone: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="flex items-center gap-4">
                <Label className="text-sm font-bold text-gray-700 w-24 flex-shrink-0 text-end">
                  Trạng thái
                </Label>
                <div className="flex-1">
                  <SelectCustom
                    options={[
                      { label: "--Tất cả--", value: "0" },
                      { label: "Hoạt động", value: "true" },
                      { label: "Không hoạt động", value: "false" },
                    ]}
                    value={searchParams.active}
                    onChange={(value) =>
                      setSearchParams((prev) => ({
                        ...prev,
                        active: value as string,
                      }))
                    }
                    placeholder="--Chọn--"
                    className="w-full"
                    type="single"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200 justify-center items-center">
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => {
                  setIsEditMode(false);
                  setOpenOrgCreateModal(true);
                }}
              >
                <Plus className="w-4 h-4" />
                Thêm mới
              </Button>
              <Button
                className="bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleSearch}
              >
                <Search className="w-4 h-4" />
                Tìm kiếm
              </Button>
              <Button
                className="bg-white hover:bg-gray-100 text-black border border-gray-300"
                onClick={handleReset}
              >
                <RefreshCcw className="w-4 h-4" />
                Đặt lại
              </Button>
            </div>
          </div>
          <Table
            columns={columns}
            dataSource={searchList?.content || []}
            showPagination={true}
            currentPage={searchList?.number + 1}
            totalItems={searchList?.totalElements}
            onPageChange={handlePageChange}
            loading={false}
            itemsPerPage={searchList?.size}
            showPageSize={false}
          />
        </CardContent>
      </Card>

      {openOrgEditModal && (
        <OrganizationModal
          editMode={isEditMode}
          isOpen={openOrgEditModal}
          onOpenChange={setOpenOrgEditModal}
          organizationData={selectedOrgForAction}
          onSuccess={() => {
            handleReset();
            if (onRefresh) onRefresh();
          }}
          isAddRootOrg={false}
        />
      )}
      {openOrgCreateModal && (
        <OrganizationModal
          editMode={isEditMode}
          isOpen={openOrgCreateModal}
          onOpenChange={setOpenOrgCreateModal}
          organizationData={selectedOrg}
          onSuccess={() => {
            handleReset();
            if (onRefresh) onRefresh();
          }}
          isAddRootOrg={false}
        />
      )}
      {confirmLockModal && (
        <ConfirmDeleteDialog
          isOpen={confirmLockModal}
          onOpenChange={setConfirmLockModal}
          onConfirm={handleLockUnlock}
          title="Hãy xác nhận"
          description={
            lockAction === "lock"
              ? `Bạn có chắc chắn muốn khóa ?`
              : `Bạn có chắc chắn muốn mở khóa ?`
          }
          confirmText="Đồng ý"
          cancelText="Đóng"
          positionButton={true}
        />
      )}
    </div>
  );
}
