"use client";
import React, { useState, useMemo } from "react";
import { Category } from "@/definitions/types/category.type";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table } from "@/components/ui/table";
import { Column } from "@/definitions";
import { Plus, Edit, Lock, Unlock, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import SelectCustom from "@/components/common/SelectCustom";
import {
  useSearchCategories,
  useActiveCategory,
  useDeactiveCategory,
} from "@/hooks/data/category.data";
import { Constant } from "@/definitions/constants/constant";
import { ToastUtils } from "@/utils/toast.utils";
import { handleError } from "@/utils/common.utils";
import CategoryModal from "@/components/categories/CategoryModal";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/definitions";

interface CategoryListProps {
  categoryTypeId: number | null;
}

interface SearchFields {
  name: string;
  id: string;
  status: boolean | null;
  page: number;
  sortBy: string;
  direction: string;
  size: number;
}

const defaultSearchFields: SearchFields = {
  name: "",
  id: "",
  status: null,
  page: 1,
  sortBy: "ORDER",
  direction: Constant.SORT_TYPE.INCREASE,
  size: Constant.PAGING.SIZE,
};

export default function CategoryList({ categoryTypeId }: CategoryListProps) {
  const queryClient = useQueryClient();
  const [searchFields, setSearchFields] =
    useState<SearchFields>(defaultSearchFields);
  const [tempSearchFields, setTempSearchFields] =
    useState<SearchFields>(defaultSearchFields);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [showCategoryModal, setShowCategoryModal] = useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);
  const [confirmActiveDeactivate, setConfirmActiveDeactivate] =
    useState<boolean>(false);

  // Mutations
  const { mutate: activeCategory } = useActiveCategory();
  const { mutate: deactiveCategory } = useDeactiveCategory();

  // Computed values
  const statusOptions = Constant.STATUS;

  // Prepare search params for useQuery
  const searchParams = useMemo(() => {
    return {
      name: searchFields.name,
      id: searchFields.id,
      active: searchFields.status ?? undefined,
      categoryTypeId: categoryTypeId ?? undefined,
      page: currentPage,
      sortBy: searchFields.sortBy,
      direction: searchFields.direction,
      size: itemsPerPage,
    };
  }, [searchFields, currentPage, itemsPerPage, categoryTypeId]);

  // Use useQuery for search
  const {
    data: searchResult,
    isLoading,
    error,
  } = useSearchCategories(searchParams, !!categoryTypeId);

  // Extract data from search result
  const categories = searchResult?.objList || [];
  const totalItems = searchResult?.totalRecord || 0;
  const nextOrder = (searchResult?.nextOrder ?? 0) + 1;

  // Handlers
  const handleSearchSubmit = () => {
    setSearchFields({ ...tempSearchFields, page: 1 });
    setCurrentPage(1);
  };

  const handleSearchReset = () => {
    setSearchFields(defaultSearchFields);
    setTempSearchFields(defaultSearchFields);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  const handleSort = (fieldName: string) => {
    const newDirection =
      searchFields.direction === Constant.SORT_TYPE.DECREASE
        ? Constant.SORT_TYPE.INCREASE
        : Constant.SORT_TYPE.DECREASE;

    setSearchFields((prev) => ({
      ...prev,
      sortBy: fieldName,
      direction: newDirection,
    }));
  };

  const handleAddCategory = () => {
    setSelectedCategory(null);
    setIsViewMode(false);
    setShowCategoryModal(true);
  };

  const handleEditCategory = (category: Category) => {
    setSelectedCategory(category);
    setIsViewMode(false);
    setShowCategoryModal(true);
  };

  const handleActiveDeactivateCategory = (category: Category) => {
    setSelectedCategory(category);
    setConfirmActiveDeactivate(true);
  };

  const doActiveDeactivateCategory = () => {
    if (!selectedCategory) return;

    const mutation = selectedCategory.active
      ? deactiveCategory
      : activeCategory;
    const action = selectedCategory.active ? "ngừng kích hoạt" : "kích hoạt";

    mutation(selectedCategory.id, {
      onSuccess: () => {
        ToastUtils.success(
          `${action.charAt(0).toUpperCase() + action.slice(1)} danh mục thành công`
        );
        queryClient.invalidateQueries({
          queryKey: [queryKeys.categories.search],
        });
        setConfirmActiveDeactivate(false);
        setSelectedCategory(null);
      },
      onError: (error) => {
        handleError(error);
        setConfirmActiveDeactivate(false);
        setSelectedCategory(null);
      },
    });
  };

  // Table columns
  const categoryColumns: Column<Category>[] = [
    {
      header: (
        <div className="flex justify-center items-center py-1">
          <span className="text-xs font-medium">STT</span>
        </div>
      ),
      className: "text-center py-1 w-16",
      accessor: (_item: Category, index: number) => (
        <div className="flex justify-center items-center py-1">
          <span className="text-xs font-medium">
            {(currentPage - 1) * itemsPerPage + index + 1}
          </span>
        </div>
      ),
    },
    {
      header: (
        <div
          className="flex justify-center items-center py-1 cursor-pointer hover:text-blue-700"
          onClick={() => handleSort("NAME")}
        >
          <span className="text-xs font-medium">Tên danh mục</span>
        </div>
      ),
      className: "py-2",
      accessor: (category: Category) => (
        <div className="flex items-center gap-2">
          <span className="text-sm">{category.name}</span>
        </div>
      ),
    },
    {
      header: (
        <div
          className="flex justify-center items-center py-1 cursor-pointer hover:text-blue-700"
          onClick={() => handleSort("CODE")}
        >
          <span className="text-xs font-medium">Mã danh mục</span>
        </div>
      ),
      className: "py-2 w-24",
      accessor: (category: Category) => (
        <div className="flex items-center gap-2">
          <span className="text-sm">{category.id}</span>
        </div>
      ),
    },
    {
      header: (
        <div
          className="flex justify-center items-center py-1 cursor-pointer hover:text-blue-700"
          onClick={() => handleSort("ORDER")}
        >
          <span className="text-xs font-medium">Thứ tự</span>
        </div>
      ),
      className: "text-center py-2 w-20",
      accessor: (category: Category) => (
        <div className="flex items-center justify-center">
          <span className="text-sm">{category.order}</span>
        </div>
      ),
    },
    {
      header: (
        <div
          className="flex justify-center items-center py-1 cursor-pointer hover:text-blue-700"
          onClick={() => handleSort("ACTIVE")}
        >
          <span className="text-xs font-medium">Trạng thái</span>
        </div>
      ),
      className: "text-center py-2 w-40",
      accessor: (category: Category) => (
        <Badge
          variant={category.active ? "default" : "destructive"}
          className={cn(
            "text-xs",
            category.active
              ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
              : "bg-red-100 text-red-800 border-red-200 hover:bg-red-200"
          )}
        >
          {category.active ? "Hoạt động" : "Không hoạt động"}
        </Badge>
      ),
    },
    {
      header: (
        <div className="flex justify-center items-center py-1">
          <span className="text-xs font-medium">Thao tác</span>
        </div>
      ),
      type: "actions",
      className: "text-center py-2 w-24",
      renderActions: (category: Category) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="p-1 hover:bg-blue-100 rounded transition-colors"
            onClick={() => handleEditCategory(category)}
            title="Sửa"
          >
            <Edit className="w-4 h-4 text-blue-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              "p-1 rounded transition-colors",
              category.active ? "hover:bg-green-100" : "hover:bg-red-100"
            )}
            onClick={() => handleActiveDeactivateCategory(category)}
            title={category.active ? "Ngừng kích hoạt" : "Kích hoạt"}
          >
            {category.active ? (
              <Unlock className="w-4 h-4 text-green-600" />
            ) : (
              <Lock className="w-4 h-4 text-red-600" />
            )}
          </Button>
        </div>
      ),
    },
  ];

  if (!categoryTypeId) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="font-medium text-gray-900 text-base">
              Danh sách danh mục
            </div>
            <div className="text-gray-500 text-xs">
              Vui lòng chọn loại danh mục để xem danh sách
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
          <div className="text-center">
            <div className="text-gray-500 text-sm">
              Chọn loại danh mục để hiển thị danh sách
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-bold text-gray-900 text-xl">
            Danh sách danh mục
          </div>
          <div className="text-gray-500 text-xs">
            Thông tin danh mục hệ thống
          </div>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-3 text-sm font-medium"
          onClick={handleAddCategory}
        >
          <Plus className="w-4 h-4 mr-1" />
          Thêm mới
        </Button>
      </div>

      {/* Search Form */}
      <div className="border rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Tên danh mục</label>
            <Input
              className="h-9 text-sm"
              value={tempSearchFields.name}
              onChange={(e) =>
                setTempSearchFields((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Mã danh mục</label>
            <Input
              className="h-9 text-sm"
              value={tempSearchFields.id}
              onChange={(e) =>
                setTempSearchFields((prev) => ({
                  ...prev,
                  id: e.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Trạng thái</label>
            <SelectCustom
              value={
                tempSearchFields.status === null
                  ? "all"
                  : tempSearchFields.status?.toString() || "all"
              }
              onChange={(value: string | string[]) => {
                const strValue = Array.isArray(value) ? value[0] : value;
                setTempSearchFields((prev) => ({
                  ...prev,
                  status: strValue === "all" ? null : strValue === "true",
                }));
              }}
              options={[
                { label: "Tất cả", value: "all" },
                ...statusOptions.map((item) => ({
                  label: item.name,
                  value: item.value.toString(),
                })),
              ]}
            />
          </div>
        </div>

        <div className="flex justify-center lg:justify-end gap-2">
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
            Đặt lại
          </Button>
        </div>
      </div>

      <Table
        sortable
        columns={categoryColumns}
        dataSource={categories}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        showPagination
        bgColor="bg-white"
        rowClassName={(_item: Category, index: number) =>
          index % 2 === 0 ? "bg-white" : "bg-[#0000000d]"
        }
        emptyText={
          isLoading
            ? "Đang tải dữ liệu..."
            : error
              ? `Lỗi: ${error.message}`
              : "Không có dữ liệu danh mục"
        }
        onItemsPerPageChange={handleItemsPerPageChange}
        loading={isLoading}
      />

      {/* Category Modal */}
      <CategoryModal
        isOpen={showCategoryModal}
        onOpenChange={setShowCategoryModal}
        category={selectedCategory}
        categoryTypeId={categoryTypeId}
        isView={isViewMode}
        nextOrder={nextOrder}
        onSuccess={() => {
          // Refresh data will be handled by query invalidation
        }}
      />

      {/* Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={confirmActiveDeactivate}
        onOpenChange={setConfirmActiveDeactivate}
        onConfirm={doActiveDeactivateCategory}
        title="Xác nhận"
        description={
          selectedCategory?.active
            ? "Bạn có chắc chắn muốn khóa?"
            : "Bạn có chắc chắn muốn mở khóa?"
        }
        confirmText="Đồng ý"
        cancelText="Hủy"
      />
    </div>
  );
}
