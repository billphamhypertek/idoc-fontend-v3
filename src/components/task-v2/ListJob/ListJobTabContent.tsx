"use client";

import ListJobTable from "./ListJobTable";

interface ListJobTabContentProps {
  tabKey?: string;
  data?: any[];
  isLoading?: boolean;
  onEdit?: (row: any) => void;
  onAccept?: (row: any) => void;
  onReject?: (row: any) => void;
  onRowClick?: (row: any) => void;
  onPageChange?: (page: number) => void;
  onItemsPerPageChange?: (size: number) => void;
  currentPage?: number;
  itemsPerPage?: number;
  totalItems?: number;
}

export default function ListJobTabContent({
  tabKey,
  data = [],
  isLoading = false,
  onEdit,
  onAccept,
  onReject,
  onRowClick,
  onPageChange,
  onItemsPerPageChange,
  currentPage,
  itemsPerPage,
  totalItems,
}: ListJobTabContentProps) {
  return (
    <div className="space-y-4">
      <ListJobTable
        tabKey={tabKey}
        data={data}
        isLoading={isLoading}
        onEdit={onEdit}
        onAccept={onAccept}
        onReject={onReject}
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
