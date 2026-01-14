"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ChevronDown, ChevronRight, Paperclip } from "lucide-react";
import { Table } from "@/components/ui/table";

export interface DataTableCardProps<T = any> {
  title: string;
  columns: any[];
  data: T[];
  sortable?: boolean;
  showPagination?: boolean;
  onRowClick?: (record: T) => void;
}

const DataTableCard = <T,>({
  title,
  columns,
  data,
  sortable = false,
  showPagination = false,
  onRowClick,
}: DataTableCardProps<T>) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <Card className="shadow-sm">
      <CardHeader
        className="p-4 cursor-pointer"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <Paperclip className="w-4 h-4 text-white" />
            </div>
            {title}
          </CardTitle>
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </div>
      </CardHeader>
      {!isCollapsed && (
        <CardContent>
          <Table
            columns={columns}
            dataSource={data}
            sortable={sortable}
            showPagination={showPagination}
            onRowClick={onRowClick as any}
          />
        </CardContent>
      )}
    </Card>
  );
};

export default DataTableCard;
