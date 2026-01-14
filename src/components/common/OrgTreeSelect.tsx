"use client";
import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronRight, Check } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

export interface TreeNode {
  id: number;
  name: string;
  parentId?: number | null;
  children?: TreeNode[];
  expanded?: boolean;
  hasChildren?: boolean;
}

interface DropdownTreeProps {
  value?: number | number[] | null;
  onChange?: (value: number | number[] | null) => void;
  dataSource: TreeNode[];
  placeholder?: string;
  multiple?: boolean;
  className?: string;
  disabled?: boolean;
}

export default function DropdownTree({
  value,
  onChange,
  dataSource,
  placeholder = "Chọn đơn vị...",
  multiple = false,
  className,
  disabled = false,
}: DropdownTreeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Find all parent nodes of a given node
  const findParentNodes = (
    nodeId: number,
    nodes: TreeNode[],
    parentIds: number[] = []
  ): number[] => {
    for (const node of nodes) {
      if (Number(node.id) === Number(nodeId)) {
        return parentIds;
      }
      if (node.children && node.children.length > 0) {
        const found = findParentNodes(nodeId, node.children, [
          ...parentIds,
          node.id,
        ]);
        if (found.length > 0) {
          return found;
        }
        // Check if any child matches
        if (
          node.children.some((child) => Number(child.id) === Number(nodeId))
        ) {
          return [...parentIds, node.id];
        }
      }
    }
    return [];
  };

  // Auto-expand parent nodes of selected items when dropdown opens
  useEffect(() => {
    if (isOpen && multiple && Array.isArray(value) && value.length > 0) {
      const allParentIds = new Set<number>();
      value.forEach((selectedId) => {
        const parentIds = findParentNodes(Number(selectedId), dataSource);
        parentIds.forEach((parentId) => allParentIds.add(parentId));
      });
      if (allParentIds.size > 0) {
        setExpandedNodes((prev) => {
          const newSet = new Set(prev);
          allParentIds.forEach((id) => newSet.add(id));
          return newSet;
        });
      }
    }
  }, [isOpen, value, multiple, dataSource]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Flatten tree for search
  const flattenTree = (nodes: TreeNode[]): TreeNode[] => {
    let result: TreeNode[] = [];
    nodes.forEach((node) => {
      result.push(node);
      if (node.children && node.children.length > 0) {
        result = result.concat(flattenTree(node.children));
      }
    });
    return result;
  };

  // Filter nodes based on search term
  // When searching, we need to show matching nodes with their parent path
  // When not searching, show the full tree structure
  const filteredNodes = searchTerm
    ? flattenTree(dataSource).filter((node) =>
        node.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : dataSource;

  // Get selected node names
  const getSelectedNames = () => {
    if (!value || (multiple && Array.isArray(value) && value.length === 0))
      return placeholder;

    const allNodes = flattenTree(dataSource);
    if (multiple && Array.isArray(value)) {
      const selectedNodes = allNodes.filter((node) =>
        value.some((v) => Number(v) === Number(node.id))
      );
      return selectedNodes.length > 0
        ? selectedNodes.map((node) => node.name).join(", ")
        : placeholder;
    } else if (!multiple && typeof value === "number") {
      const selectedNode = allNodes.find(
        (node) => Number(node.id) === Number(value)
      );
      return selectedNode ? selectedNode.name : placeholder;
    }

    return placeholder;
  };

  // Handle node selection
  const handleNodeSelect = (node: TreeNode) => {
    if (multiple) {
      const currentValue = Array.isArray(value) ? value : [];
      const isSelected = currentValue.some(
        (v) => Number(v) === Number(node.id)
      );
      const newValue = isSelected
        ? currentValue.filter((id) => Number(id) !== Number(node.id))
        : [...currentValue, node.id];
      onChange?.(newValue);
    } else {
      onChange?.(node.id);
      setIsOpen(false);
    }
  };

  // Handle expand/collapse
  const handleToggleExpand = (nodeId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  // Check if node is selected
  const isNodeSelected = (nodeId: number) => {
    if (multiple && Array.isArray(value)) {
      // Ensure both values are compared as numbers
      return value.some((v) => Number(v) === Number(nodeId));
    } else if (!multiple && typeof value === "number") {
      return Number(value) === Number(nodeId);
    }
    return false;
  };

  // Render tree node
  const renderTreeNode = (node: TreeNode, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = isNodeSelected(node.id);

    return (
      <div key={node.id}>
        <div
          className={cn(
            "flex items-center py-2 px-3 hover:bg-gray-100 cursor-pointer",
            isSelected && "bg-blue-50 text-blue-700",
            level > 0 && "pl-6"
          )}
          style={{ paddingLeft: `${level * 20 + 12}px` }}
          onClick={() => handleNodeSelect(node)}
        >
          {/* Expand/Collapse Icon */}
          {hasChildren ? (
            <button
              className="mr-2 p-1 hover:bg-gray-200 rounded"
              onClick={(e) => handleToggleExpand(node.id, e)}
              tabIndex={-1}
              type="button"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          ) : (
            <div className="w-6 mr-2" />
          )}

          {/* Checkbox for multiple selection */}
          {multiple && (
            <div className="mr-2" onClick={(e) => e.stopPropagation()}>
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => handleNodeSelect(node)}
                className="w-4 h-4"
              />
            </div>
          )}

          {/* Node Name */}
          <span className="text-sm flex-1">{node.name}</span>

          {/* Single selection checkmark */}
          {!multiple && isSelected && (
            <Check className="w-4 h-4 text-blue-600" />
          )}
        </div>

        {/* Render children if expanded */}
        {hasChildren && isExpanded && (
          <div>
            {node.children!.map((child) => renderTreeNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div ref={dropdownRef} className={cn("relative z-10", className)}>
      {/* Input Display */}
      <div
        className={cn(
          "flex items-center justify-between w-full px-3 py-1 border border-gray-300 rounded-md bg-white",
          "hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
          disabled && "bg-gray-100 cursor-not-allowed opacity-50",
          isOpen && "ring-2 ring-blue-500 border-blue-500"
        )}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span
          className={cn(
            "text-sm truncate",
            !value || (Array.isArray(value) && value.length === 0)
              ? "text-gray-500"
              : "text-gray-900"
          )}
          title={getSelectedNames()}
        >
          {getSelectedNames()}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-gray-400 transition-transform",
            isOpen && "rotate-180"
          )}
        />
      </div>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="z-[9999] absolute w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
          {/* Search Input */}
          <div className="p-2 border-b border-gray-200">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Tree Content */}
          <div className="max-h-40 overflow-y-auto">
            {filteredNodes.length > 0 ? (
              filteredNodes.map((node) => renderTreeNode(node))
            ) : (
              <div className="p-3 text-sm text-gray-500 text-center">
                Không tìm thấy kết quả
              </div>
            )}
          </div>

          <div className="p-2 border-t border-gray-200 bg-white sticky bottom-0">
            <button
              onClick={() => onChange?.(multiple ? [] : null)}
              className="w-full text-sm text-gray-600 hover:text-gray-800 py-1"
            >
              Xóa lựa chọn
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
