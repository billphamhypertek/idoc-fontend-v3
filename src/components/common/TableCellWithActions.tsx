"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TableCellWithActionsProps {
  onAdd?: () => void;
  onDelete?: () => void;
  className?: string;
  children: React.ReactNode;
}

const TableCellWithActions: React.FC<TableCellWithActionsProps> = ({
  onAdd,
  onDelete,
  className,
  children,
}) => {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="flex-1">{children}</div>
      <div className="flex items-center gap-1">
        {onAdd && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAdd();
            }}
            className="p-1 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
            title="Thêm"
          >
            <Plus className="w-4 h-4" />
          </button>
        )}
        {onDelete && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
            title="Xóa"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default TableCellWithActions;
