"use client";

import DeclareFilter from "./DeclareFilter";
import DeclareTable from "./DeclareTable";

interface FilterState {
  taskName: string;
  startDate: Date | null;
  endDate: Date | null;
}

interface DeclareTabContentProps {
  tabKey?: string;
  data?: any[];
  isLoading?: boolean;
  onEdit?: (row: any) => void;
  onDelete?: (row: any) => void;
  onRowClick?: (row: any) => void;
  filter?: FilterState;
  onFilterChange?: (filter: FilterState) => void;
  onSearch?: () => void;
  onReset?: () => void;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (size: number) => void;
  currentPage?: number;
  itemsPerPage?: number;
  totalItems?: number;
}

export default function DeclareTabContent({
  tabKey,
  data = [],
  isLoading = false,
  onEdit,
  onDelete,
  onRowClick,
  filter = { taskName: "", startDate: null, endDate: null },
  onFilterChange,
  onSearch,
  onReset,
  onPageChange,
  onItemsPerPageChange,
  currentPage,
  itemsPerPage,
  totalItems,
}: DeclareTabContentProps) {
  return (
    <div className="space-y-4">
      <div className="border border-gray-200 rounded-lg p-8">
        <DeclareFilter
          filter={filter}
          onFilterChange={onFilterChange}
          onSearch={onSearch}
          onReset={onReset}
        />
      </div>

      <DeclareTable
        tabKey={tabKey}
        data={data}
        isLoading={isLoading}
        onEdit={onEdit}
        onDelete={onDelete}
        onRowClick={onRowClick}
        onPageChange={onPageChange}
        onItemsPerPageChange={onItemsPerPageChange}
        currentPage={currentPage}
        itemsPerPage={itemsPerPage}
        totalItems={totalItems}
      />
    </div>
  );
}
