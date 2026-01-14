"use client";

import { formatDateVN } from "@/utils/datetime.utils";
import { Button } from "../ui/button";
import { Table } from "../ui/table";
import { Column } from "@/definitions/types/table.type";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { useState } from "react";
import { Reply, RotateCcw, Trash2, ChevronUp, ChevronDown } from "lucide-react";

interface RetakeTableProps {
  documents?: any[];
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
}

export default function RetakeTable({
  documents = [],
  loading = false,
  paging = { totalRecord: 0, currentPage: 1, itemsPerPage: 10 },
  onPageChange,
  onPageSizeChange,
  onViewDocument,
  onSort,
  sortBy,
  sortDirection = "DESC",
  currentTab = "canRetake",
  onTabChange,
  tabs,
  selectedDocuments = [],
  onSelectionChange,
  columns = [],
}: RetakeTableProps) {
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
                className="whitespace-nowrap data-[state=active]:bg-blue-600 data-[state=active]:text-white px-3 py-1 text-xs rounded-md transition"
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
                dataSource={documents}
                loading={loading}
                emptyText="Không tồn tại văn bản"
                showPagination={documents.length > 0}
                currentPage={paging.currentPage}
                totalItems={paging.totalRecord}
                onPageChange={onPageChange}
                itemsPerPage={paging.itemsPerPage}
                onItemsPerPageChange={onPageSizeChange}
                showPageSize={true}
                pageSizeOptions={[10, 20, 50, 100]}
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
                rowClassName={() => "group"}
              />
            </TabsContent>
          ))}
      </Tabs>
    </div>
  );
}
