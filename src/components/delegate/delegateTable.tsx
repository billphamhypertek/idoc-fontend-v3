"use client";

import {
  DEADLINE_WARNINGS,
  getDeadlineWarningClasses,
} from "@/utils/deadline.utils";
import { Table } from "../ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface DelegateTableProps {
  data?: any[];
  loading?: boolean;
  paging?: {
    totalRecord: number;
    currentPage: number;
    itemsPerPage: number;
  };
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onViewDocument?: (document: any) => void;
  onSort?: (field: string) => void;
  sortBy?: string;
  sortDirection?: "ASC" | "DESC";
  currentTab?: string;
  onTabChange?: (tab: string) => void;
  tabs?: any[];
  selectedDocuments?: React.Key[];
  onSelectionChange?: (selectedKeys: React.Key[], selectedRows: any[]) => void;
  columns?: any[];
  showDeadlineWarnings?: boolean;
}
export default function DelegateTable({
  data = [],
  loading = false,
  paging = { totalRecord: 0, currentPage: 1, itemsPerPage: 10 },
  onPageChange,
  onPageSizeChange,
  onViewDocument,
  onSort,
  sortBy,
  sortDirection = "DESC",
  currentTab,
  onTabChange,
  tabs,
  selectedDocuments = [],
  onSelectionChange,
  columns = [],
  showDeadlineWarnings = false,
}: DelegateTableProps) {
  const handleSort = (sortConfig: any) => {
    if (sortConfig && sortConfig.key) {
      onSort?.(sortConfig.key);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs value={currentTab} onValueChange={onTabChange} className="w-full">
        <TabsList className="flex w-fit bg-transparent justify-start gap-2 bg-gray-100 rounded-lg p-1">
          {tabs &&
            tabs.map((tab) => (
              <TabsTrigger
                key={tab.name}
                value={tab.name}
                className="whitespace-nowrap data-[state=active]:text-blue-600 px-3 py-1 text-xs rounded-md transition"
              >
                {tab.title}
              </TabsTrigger>
            ))}
        </TabsList>
        {tabs &&
          tabs.map((tab) => (
            <TabsContent key={tab.name} value={tab.name} className="mt-4">
              <Table
                columns={columns}
                dataSource={data}
                loading={loading}
                emptyText="Không tồn tại văn bản"
                showPagination={data.length > 0}
                currentPage={paging.currentPage}
                totalItems={paging.totalRecord}
                onPageChange={onPageChange}
                itemsPerPage={paging.itemsPerPage}
                onItemsPerPageChange={onPageSizeChange}
                rowSelection={
                  onSelectionChange
                    ? {
                        selectedRowKeys: selectedDocuments,
                        onChange: onSelectionChange,
                        rowKey: "id" as keyof any,
                      }
                    : undefined
                }
                hasAllChange={true}
                sortable={true}
                onSort={handleSort}
                onRowClick={
                  onViewDocument
                    ? (record) => onViewDocument(record)
                    : undefined
                }
              />
            </TabsContent>
          ))}
      </Tabs>
      {showDeadlineWarnings && (
        <div className="flex justify-center gap-4 mt-4">
          {DEADLINE_WARNINGS.map((warning) => (
            <div
              key={warning.id}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded cursor-pointer transition-colors ${getDeadlineWarningClasses(warning.color, "badge")}`}
            >
              <div
                className={`w-4 h-4 rounded-sm ${getDeadlineWarningClasses(warning.color, "icon")}`}
              />
              <span className="text-sm font-medium">{warning.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
