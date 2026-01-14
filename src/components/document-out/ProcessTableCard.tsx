"use client";
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, ChevronDown, ChevronRight, Paperclip } from "lucide-react";
import { Table } from "@/components/ui/table";

export interface ProcessTableCardProps<T = any> {
  title?: string;
  collapse: boolean;
  onToggle: () => void;
  columns: any[];
  data: T[];
}

const ProcessTableCard = <T,>({
  title = "Thông tin gửi nhận",
  collapse,
  onToggle,
  columns,
  data,
}: ProcessTableCardProps<T>) => {
  return (
    <Card className="shadow-sm">
      <CardHeader className="p-4 cursor-pointer" onClick={onToggle}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-gray-800 flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
              <Paperclip className="w-4 h-4 text-white" />
            </div>
            {title}
          </CardTitle>
          {collapse ? (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronRight className="w-4 h-4 text-gray-500" />
          )}
        </div>
      </CardHeader>
      {collapse && (
        <CardContent>
          <Table
            columns={columns}
            dataSource={data}
            sortable={true}
            showPagination={false}
          />
        </CardContent>
      )}
    </Card>
  );
};

export default ProcessTableCard;
