"use client";

import React, { useState } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ModuleNode } from "@/definitions/types/auth.type";
import { ChevronDown, ChevronRightIcon } from "lucide-react";

interface ModuleTreeItemProps {
  module: ModuleNode;
  selectedModuleIds: number[];
  onToggle: (id: number) => void;
  onToggleParent: (module: ModuleNode, checked: boolean) => void;
  level?: number;
  defaultExpanded?: boolean;
}

export default function ModuleTreeItem({
  module,
  selectedModuleIds,
  onToggle,
  onToggleParent,
  level = 0,
  defaultExpanded = false,
}: ModuleTreeItemProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const hasChildren =
    Array.isArray(module.subModule) && module.subModule.length > 0;

  const handleToggle = () => {
    const isChecked = selectedModuleIds.includes(module.id);
    if (hasChildren) {
      // Nếu là module cha, gọi onToggleParent để xử lý tất cả con
      onToggleParent(module, !isChecked);
    } else {
      // Nếu là module con, chỉ toggle module này
      onToggle(module.id);
    }
  };

  const handleExpandToggle = () => {
    setExpanded(!expanded);
  };

  return (
    <div>
      <div
        className="flex items-center py-1"
        style={{
          paddingLeft: level * 20,
          minHeight: 36, // đảm bảo các hàng cha bằng nhau chiều cao
        }}
      >
        <div
          className="flex items-center"
          style={{ minWidth: 32, justifyContent: "center" }}
        >
          {hasChildren ? (
            <button
              type="button"
              className="focus:outline-none hover:bg-gray-100 rounded p-1"
              onClick={handleExpandToggle}
              aria-label={expanded ? "Thu gọn" : "Mở rộng"}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {expanded ? (
                <ChevronDown className="inline-block w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRightIcon className="inline-block w-4 h-4 text-gray-500" />
              )}
            </button>
          ) : (
            <span className="inline-block w-4" />
          )}
        </div>
        <div className="flex items-center space-x-2 flex-1">
          <Checkbox
            id={`module-${module.id}`}
            checked={selectedModuleIds.includes(module.id)}
            onCheckedChange={handleToggle}
          />
          <label
            htmlFor={`module-${module.id}`}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
          >
            {module.name}
          </label>
        </div>
      </div>
      {hasChildren && expanded && (
        <div className="space-y-1">
          {module.subModule.map((sub: ModuleNode) => (
            <ModuleTreeItem
              key={sub.id}
              module={sub}
              selectedModuleIds={selectedModuleIds}
              onToggle={onToggle}
              onToggleParent={onToggleParent}
              level={level + 1}
              defaultExpanded={defaultExpanded}
            />
          ))}
        </div>
      )}
    </div>
  );
}
