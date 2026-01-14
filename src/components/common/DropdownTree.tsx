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
  const filteredNodes = searchTerm
    ? flattenTree(dataSource).filter((node) =>
        node.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : dataSource;

  // Get selected node names
  const getSelectedNames = () => {
    if (!value) return placeholder;

    const allNodes = flattenTree(dataSource);
    if (multiple && Array.isArray(value)) {
      const selectedNodes = allNodes.filter((node) => value.includes(node.id));
      return selectedNodes.length > 0
        ? selectedNodes.map((node) => node.name).join(", ")
        : placeholder;
    } else if (!multiple && typeof value === "number") {
      const selectedNode = allNodes.find((node) => node.id === value);
      return selectedNode ? selectedNode.name : placeholder;
    }

    return placeholder;
  };

  // Handle node selection
  const handleNodeSelect = (node: TreeNode) => {
    // Allow selecting any node, including parent nodes
    if (multiple) {
      const currentValue = Array.isArray(value) ? value : [];
      const newValue = currentValue.includes(node.id)
        ? currentValue.filter((id) => id !== node.id)
        : [...currentValue, node.id];
      onChange?.(newValue);
    } else {
      onChange?.(node.id);
      setIsOpen(false);
    }
  };

  // Toggle expand/collapse
  const toggleExpand = (nodeId: number) => {
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

  // Handle expand/collapse (with event for stopPropagation)
  const handleToggleExpand = (nodeId: number, event: React.MouseEvent) => {
    event.stopPropagation();
    toggleExpand(nodeId);
  };

  // Check if node is selected
  const isNodeSelected = (nodeId: number) => {
    if (multiple && Array.isArray(value)) {
      return value.includes(nodeId);
    } else if (!multiple && typeof value === "number") {
      return value === nodeId;
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
            isSelected && "bg-blue-50 text-blue-700"
          )}
          style={{ paddingLeft: level === 0 ? "12px" : `${level * 24 + 12}px` }}
        >
          {/* Expand/Collapse Icon */}
          {hasChildren && (
            <div
              className="mr-2 flex-shrink-0"
              onClick={(e) => handleToggleExpand(node.id, e)}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </div>
          )}

          {/* Checkbox for multiple selection */}
          {multiple && (
            <div className="mr-2 flex-shrink-0">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => handleNodeSelect(node)}
                className="w-4 h-4"
              />
            </div>
          )}

          {/* Node Name - clickable to select */}
          <span
            className="text-sm flex-1"
            onClick={() => handleNodeSelect(node)}
          >
            {node.name}
          </span>

          {/* Single selection checkmark */}
          {!multiple && isSelected && (
            <Check className="w-4 h-4 text-blue-600 flex-shrink-0" />
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
    <div ref={dropdownRef} className="relative">
      {/* Input Display */}
      <div
        className={cn(
          "flex items-center justify-between w-full px-3 border border-gray-300 rounded-md bg-white",
          "hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500",
          disabled && "bg-gray-100 cursor-not-allowed opacity-50",
          isOpen && "ring-2 ring-blue-500 border-blue-500",
          className || "py-2"
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
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-hidden">
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
          <div className="max-h-40 overflow-y-auto pb-4">
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
