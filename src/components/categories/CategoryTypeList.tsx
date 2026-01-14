"use client";
import React, { useState, useEffect } from "react";
import { CategoryType } from "@/definitions/types/category-type.type";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";
import { Column } from "@/definitions";
import { Plus, Edit, Lock, Unlock } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useGetCategoryTypes } from "@/hooks/data/category-type.data";
import {
  useCreateCategoryType,
  useUpdateCategoryType,
} from "@/hooks/data/category-type.data";
import { ToastUtils } from "@/utils/toast.utils";
import { handleError } from "@/utils/common.utils";
import CategoryTypeModal from "@/components/categories/CategoryTypeModal";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";

interface CategoryTypeListProps {
  onCategoryTypeSelect: (categoryTypeId: number) => void;
}

export default function CategoryTypeList({
  onCategoryTypeSelect,
}: CategoryTypeListProps) {
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [selectedCategoryType, setSelectedCategoryType] =
    useState<CategoryType | null>(null);
  const [showCategoryTypeModal, setShowCategoryTypeModal] =
    useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);

  // Data hooks
  const { data: categoryTypesData, isLoading } = useGetCategoryTypes({
    page: currentPage,
    size: itemsPerPage,
  });

  // Mutations
  const { mutate: createCategoryType } = useCreateCategoryType();
  const { mutate: updateCategoryType } = useUpdateCategoryType();

  const categoryTypes = categoryTypesData?.objList || [];
  const totalItems = categoryTypesData?.totalRecord || 0;

  // Auto-select first category type when data loads or page changes
  useEffect(() => {
    if (categoryTypes.length > 0 && !selectedCategoryType) {
      const firstCategoryType = categoryTypes[0];
      setSelectedCategoryType(firstCategoryType);
      onCategoryTypeSelect(firstCategoryType.id);
    }
  }, [categoryTypes, onCategoryTypeSelect]);

  // Handlers
  const handlePageChange = (page: number) => {
    setSelectedCategoryType(null);
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  const handleCategoryTypeClick = (
    categoryType: CategoryType,
    index: number
  ) => {
    setSelectedCategoryType(categoryType);
    onCategoryTypeSelect(categoryType.id);
  };

  const handleAddCategoryType = () => {
    setSelectedCategoryType(null);
    setIsViewMode(false);
    setShowCategoryTypeModal(true);
  };

  const handleEditCategoryType = (categoryType: CategoryType) => {
    setSelectedCategoryType(categoryType);
    setIsViewMode(false);
    setShowCategoryTypeModal(true);
  };

  // Table columns
  const categoryTypeColumns: Column<CategoryType>[] = [
    {
      header: (
        <div className="flex justify-center items-center py-1">
          <span className="text-xs font-medium">STT</span>
        </div>
      ),
      className: "text-center py-1 w-16",
      accessor: (_item: CategoryType, index: number) => (
        <div className="flex justify-center items-center py-1">
          <span className="text-xs font-medium">
            {(currentPage - 1) * itemsPerPage + index + 1}
          </span>
        </div>
      ),
    },
    {
      header: (
        <div className="flex justify-center items-center py-1">
          <span className="text-xs font-medium">Tên loại danh mục</span>
        </div>
      ),
      className: "py-2",
      accessor: (categoryType: CategoryType, index: number) => (
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-sm cursor-pointer hover:text-blue-700 font-medium",
              selectedCategoryType?.id === categoryType.id && "text-blue-700"
            )}
            onClick={() => handleCategoryTypeClick(categoryType, index)}
          >
            {categoryType.name}
          </span>
        </div>
      ),
    },
    {
      header: (
        <div className="flex justify-center items-center py-1">
          <span className="text-xs font-medium">Thao tác</span>
        </div>
      ),
      type: "actions",
      className: "text-center py-2 w-20",
      renderActions: (categoryType: CategoryType) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="p-1 hover:bg-blue-100 rounded transition-colors"
            onClick={() => handleEditCategoryType(categoryType)}
            title="Sửa"
          >
            <Edit className="w-4 h-4 text-blue-600" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="font-bold text-gray-900 text-xl">
            Danh sách loại danh mục
          </div>
          <div className="text-gray-500 text-xs">
            Thông tin loại danh mục hệ thống
          </div>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-3 text-sm font-medium"
          onClick={handleAddCategoryType}
        >
          <Plus className="w-4 h-4 mr-1" />
          Thêm mới
        </Button>
      </div>

      <Table
        columns={categoryTypeColumns}
        dataSource={categoryTypes}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        showPagination
        bgColor="bg-white"
        rowClassName={(item: CategoryType, index: number) =>
          cn(
            "cursor-pointer",
            selectedCategoryType?.id === item.id
              ? "bg-blue-50 border-l-4 border-blue-500"
              : index % 2 === 0
                ? "bg-white"
                : "bg-[#0000000d]"
          )
        }
        onRowClick={(item: CategoryType, index: number) => {
          handleCategoryTypeClick(item, index);
        }}
        emptyText={
          isLoading ? "Đang tải dữ liệu..." : "Không có dữ liệu loại danh mục"
        }
        onItemsPerPageChange={handleItemsPerPageChange}
        loading={isLoading}
      />

      {/* Category Type Modal */}
      <CategoryTypeModal
        isOpen={showCategoryTypeModal}
        onOpenChange={setShowCategoryTypeModal}
        categoryType={selectedCategoryType}
        isView={isViewMode}
        onSuccess={() => {
          // Refresh data will be handled by query invalidation
        }}
      />
    </div>
  );
}
