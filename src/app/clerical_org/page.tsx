"use client";
import React, { useMemo, useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  useGetClericalOrgListQuery,
  useGetAllOrganizationsQuery,
  useEditClericalOrg,
} from "@/hooks/data/clerical-org.data";
import { Column, queryKeys } from "@/definitions";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Pencil, RotateCcw, Search } from "lucide-react";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import { Table } from "@/components/ui/table";
import { ClericalOrg } from "@/definitions/types/clerical-org.type";
import DropdownTree, { TreeNode } from "@/components/common/OrgTreeSelect";
import ClericalOrgUpdateModal from "@/components/dialogs/ClericalOrgUpdateModal";
import { ToastUtils } from "@/utils/toast.utils";

const defaultSearchState = {
  docType: "",
  name: "",
  orgId: "",
  page: 1,
  sortBy: "",
  direction: "DESC",
  size: 10,
};

type SearchState = typeof defaultSearchState;

export default function ClericalOrgPage() {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] =
    useState<SearchState>(defaultSearchState);
  const [tempSearchParams, setTempSearchParams] =
    useState<SearchState>(defaultSearchState);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // State for modal
  const [modalData, setModalData] = useState<ClericalOrg | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const advanceParams = useMemo(
    () => ({
      page: currentPage,
      size: itemsPerPage,
      direction: searchParams.direction,
      sortBy: searchParams.sortBy,
      docType: searchParams.docType ?? null,
      name: searchParams.name ?? null,
      orgId: searchParams.orgId ?? null,
    }),
    [searchParams, currentPage, itemsPerPage]
  );

  const { data: organizations } = useGetAllOrganizationsQuery();
  const { mutate: editClericalOrg } = useEditClericalOrg();

  const {
    data: currentData,
    isLoading,
    error,
  } = useGetClericalOrgListQuery(advanceParams);

  const totalItems: number = currentData?.totalElements || 0;
  const totalPages: number = currentData?.totalPages || 0;
  const clericalOrgList: ClericalOrg[] = currentData?.content || [];

  const handleSearchSubmit = () => {
    setCurrentPage(1);
    setSearchParams((prev) => ({
      ...prev,
      ...tempSearchParams,
    }));
  };

  const handleSearchReset = () => {
    setSearchParams(defaultSearchState);
    setTempSearchParams(defaultSearchState);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const getOrganizationName = useCallback(
    (orgIds: number[] | null) => {
      if (!orgIds) return "";
      return orgIds
        .map((orgId) => organizations?.find((org) => org.id === orgId)?.name)
        .join(", ");
    },
    [organizations]
  );

  const convertToTree = (orgs: any[]): TreeNode[] => {
    if (!orgs) return [];

    const orgMap = new Map();
    const rootNodes: TreeNode[] = [];

    // Create map of all organizations
    orgs.forEach((org) => {
      orgMap.set(org.id, {
        id: org.id,
        name: org.name,
        parentId: org.parentId,
        children: [],
      });
    });

    // Build tree structure
    orgs.forEach((org) => {
      const node = orgMap.get(org.id);
      if (org.parentId && orgMap.has(org.parentId)) {
        const parent = orgMap.get(org.parentId);
        parent.children.push(node);
      } else {
        rootNodes.push(node);
      }
    });

    return rootNodes;
  };

  const SearchSection = useMemo(
    () => (
      <div className="border rounded-lg p-4 space-y-4">
        <div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-8">
          <div className="space-y-2 flex-1 w-full">
            <div className="font-bold text-sm">Họ và tên</div>
            <div>
              <Input
                className="h-10 text-sm"
                placeholder="Nhập họ tên"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setTempSearchParams((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                value={tempSearchParams.name}
              />
            </div>
          </div>
          <div className="space-y-2 flex-1 w-full">
            <div className="font-bold text-sm">Đơn vị</div>
            <DropdownTree
              value={
                tempSearchParams.orgId ? parseInt(tempSearchParams.orgId) : null
              }
              onChange={(value: number | number[] | null) => {
                setTempSearchParams(
                  (prev) =>
                    ({
                      ...prev,
                      orgId:
                        value === null
                          ? ""
                          : Array.isArray(value)
                            ? String(value[0])
                            : String(value),
                    }) as SearchState
                );
              }}
              dataSource={convertToTree(organizations || [])}
              placeholder="-- Chọn đơn vị --"
              multiple={false}
              className="h-10"
            />
          </div>
        </div>
        <div className="flex justify-center gap-2">
          <Button
            size="sm"
            onClick={handleSearchSubmit}
            className="h-9 px-3 text-xs bg-blue-600 hover:bg-blue-700"
          >
            <Search className="w-3 h-3 mr-1" />
            Tìm kiếm
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSearchReset}
            className="h-9 px-3 text-xs"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Đặt lại
          </Button>
        </div>
      </div>
    ),
    [tempSearchParams, handleSearchSubmit, handleSearchReset]
  );

  const clericalOrgColumns: Column<ClericalOrg>[] = useMemo(
    () => [
      {
        header: "STT",
        accessor: (item: ClericalOrg, index: number) =>
          (currentPage - 1) * itemsPerPage + index + 1,
        className: "w-3 text-center border-r",
      },
      {
        header: "Họ và tên",
        accessor: (item: ClericalOrg) => item.userInfo.fullName,
        className: "w-10 text-center border-r",
      },
      {
        header: "Chức vụ",
        accessor: (item: ClericalOrg) => item.userInfo.positionName,
        className: "w-10 text-center border-r",
      },
      {
        header: "Đơn vị",
        accessor: (item: ClericalOrg) => item.userInfo.orgName,
        className: "w-10 text-center border-r",
      },
      {
        header: "Đơn vị được phân quyền",
        accessor: (item: ClericalOrg) => getOrganizationName(item.orgIds),
        className: "w-10 text-center border-r",
      },
      {
        header: "Thao tác",
        type: "actions" as const,
        className: "text-center py-2 w-16",
        renderActions: (item: ClericalOrg) => (
          <div className="flex items-center justify-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-7 p-0 hover:bg-blue-50"
              onClick={() => {
                setModalData(item);
                setIsEditModalOpen(true);
              }}
            >
              <Pencil className="h-4 w-4 text-blue-600" />
            </Button>
          </div>
        ),
      },
    ],
    [currentPage, itemsPerPage, getOrganizationName]
  );

  // Callback to close the modal and reset modalData
  const handleModalClose = useCallback(() => {
    setIsEditModalOpen(false);
    setModalData(null);
  }, []);

  // Callback for saving, if you want to reload data after save, you can do so here
  const handleModalSave = useCallback(
    (updatedItem: ClericalOrg) => {
      editClericalOrg(
        {
          payload: updatedItem.orgIds,
          userId: updatedItem.userInfo.id,
        },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: [queryKeys.clericalOrg.getList, advanceParams],
            });
            ToastUtils.success("Cập nhật văn thư đơn vị thành công");
            handleModalClose();
          },
          onError: () => {
            ToastUtils.error(
              "Cập nhật văn thư đơn vị thất bại. Vui lòng kiểm tra lại."
            );
          },
        }
      );
    },
    [handleModalClose, editClericalOrg, advanceParams]
  );

  return (
    <div className="space-y-4 px-4">
      <div className="flex items-center justify-between">
        <BreadcrumbNavigation
          items={[
            {
              href: "/",
              label: "Quản trị hệ thống",
            },
          ]}
          currentPage="Văn thư đơn vị"
          showHome={false}
        />
      </div>
      <div
        className="space-y-2 border rounded-lg p-4 mt-4"
        style={{ backgroundColor: "#E8E9EB" }}
      >
        <h1 className="text-lg font-semibold text-gray-900">
          Quản lý văn thư đơn vị
        </h1>
        <p className="text-sm text-gray-600">
          Hiển thị thông tin danh sách văn thư của đơn vị
        </p>
      </div>
      {SearchSection}
      <Table
        sortable
        columns={clericalOrgColumns}
        dataSource={clericalOrgList}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        showPagination
        bgColor="bg-white"
        rowClassName={(_item: ClericalOrg, index: number) =>
          index % 2 === 0 ? "bg-white" : "bg-[#0000000d]"
        }
        emptyText={
          isLoading
            ? "Đang tải dữ liệu..."
            : error
              ? `Lỗi: ${error && typeof error === "object" && "message" in error ? ((error as { message?: string }).message ?? "Không xác định") : "Không xác định"}`
              : "Không tồn tại văn thư đơn vị"
        }
        onItemsPerPageChange={(size: number) => {
          setItemsPerPage(size);
          setCurrentPage(1);
        }}
        loading={isLoading}
      />

      {/* Modal for update/edit */}
      {modalData && (
        <ClericalOrgUpdateModal
          isOpen={isEditModalOpen}
          onOpenChange={(open: boolean) => {
            if (!open) {
              handleModalClose();
            }
          }}
          onSave={handleModalSave}
          clericalOrgData={modalData}
          isEdit={true}
          loading={false}
          organizations={organizations || []}
        />
      )}
    </div>
  );
}
