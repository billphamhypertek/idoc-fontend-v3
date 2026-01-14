"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronsDownUp,
  ChevronRight,
  ChevronDown,
  Check,
  Building2,
  LucideChevronsUpDown,
  ChevronsUpDown,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useOrgTree } from "@/hooks/data/dashboard.data";
import type {
  OrgNodeType,
  OrgTreeNode,
} from "@/definitions/types/orgunit.type";

type Props = {
  value?: string | string[] | null;
  onChange: ((node: OrgTreeNode) => void) | ((nodes: OrgTreeNode[]) => void);
  placeholder?: string;
  className?: string;
  allowSelectTypes?: OrgNodeType[];
  collapsedByDefault?: boolean;
  disabled?: boolean;
  showCheckbox?: boolean;
  height?: string;
};

const ROW_HEIGHT = 40;
const AGG_NODE = { id: "", name: "Tổng toàn ban", type: "org" as const };

export default function OrgTreeSelect({
  value,
  onChange,
  placeholder,
  className,
  allowSelectTypes = ["org", "room", "leadership"],
  collapsedByDefault = false,
  disabled = false,
  showCheckbox = false,
  height = "56vh",
}: Props) {
  const { tree, isLoading } = useOrgTree();
  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(
    () => new Set(collapsedByDefault ? [] : tree.map((t) => t.id))
  );

  React.useEffect(() => {
    if (!collapsedByDefault) {
      setExpanded(new Set(tree.map((t) => t.id)));
    }
  }, [tree, collapsedByDefault]);

  const selectedNode: OrgTreeNode | undefined = useMemo(() => {
    if (!value || showCheckbox) return undefined;
    const val = Array.isArray(value) ? value[0] : value;
    if (!val) return undefined;
    const stack = [...tree];
    while (stack.length) {
      const n = stack.pop()!;
      if (n.id === String(val)) return n;
      if (n.children?.length) stack.push(...n.children);
    }
    return undefined;
  }, [tree, value, showCheckbox]);

  const selectedNodes: OrgTreeNode[] = useMemo(() => {
    if (!showCheckbox || !value) return [];
    const valueArray = Array.isArray(value) ? value : [value];
    const result: OrgTreeNode[] = [];

    // Check AGG_NODE
    if (valueArray.includes(AGG_NODE.id)) {
      result.push(AGG_NODE as OrgTreeNode);
    }

    // Check tree nodes
    const stack = [...tree];
    while (stack.length) {
      const n = stack.pop()!;
      if (valueArray.includes(n.id)) result.push(n);
      if (n.children?.length) stack.push(...n.children);
    }
    return result;
  }, [tree, value, showCheckbox]);

  const selectedIds = useMemo(() => {
    if (!value) return new Set<string>();
    const valueArray = Array.isArray(value) ? value : [value];
    return new Set(valueArray.map((v) => String(v)));
  }, [value]);

  const toggle = (id: string) =>
    setExpanded((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const canSelect = (n: OrgTreeNode) => allowSelectTypes.includes(n.type);

  const handleNodeToggle = (n: OrgTreeNode) => {
    if (!canSelect(n)) return;

    if (showCheckbox) {
      const isSelected = selectedIds.has(n.id);
      const currentIds = Array.from(selectedIds);

      let newIds: string[];
      if (isSelected) {
        newIds = currentIds.filter((id) => id !== n.id);
      } else {
        newIds = [...currentIds, n.id];
      }

      // Find nodes by ids (including AGG_NODE)
      const newNodes: OrgTreeNode[] = [];
      if (newIds.includes(AGG_NODE.id)) {
        newNodes.push(AGG_NODE as OrgTreeNode);
      }

      const stack = [...tree];
      while (stack.length) {
        const node = stack.pop()!;
        if (newIds.includes(node.id)) newNodes.push(node);
        if (node.children?.length) stack.push(...node.children);
      }

      (onChange as (nodes: OrgTreeNode[]) => void)(newNodes);
    } else {
      (onChange as (node: OrgTreeNode) => void)(n);
      setOpen(false);
    }
  };

  const renderRow = (n: OrgTreeNode, depth = 0): React.ReactNode => {
    const hasChildren = (n.children?.length ?? 0) > 0;
    const isOpen = expanded.has(n.id);
    const isSelected = showCheckbox
      ? selectedIds.has(n.id)
      : String(value ?? "") === n.id;

    return (
      <div key={n.id}>
        <div
          className={cn(
            "flex items-center px-3",
            "hover:bg-gray-50 focus:bg-gray-50",
            isSelected && "bg-blue-50"
          )}
          style={{ height: ROW_HEIGHT }}
        >
          {/* caret */}
          <div className="flex-none w-6 flex items-center justify-center mr-1">
            <button
              type="button"
              aria-label={isOpen ? "Thu gọn" : "Mở rộng"}
              className={cn(
                "w-4 h-4 rounded hover:bg-gray-100 text-gray-500 inline-flex items-center justify-center",
                !hasChildren && "opacity-0 pointer-events-none"
              )}
              onClick={(e) => {
                e.stopPropagation();
                toggle(n.id);
              }}
            >
              {isOpen ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </button>
          </div>

          {/* indent */}
          {/* <div style={{ width: depth * 16 }} /> */}

          {/* checkbox (nếu showCheckbox) */}
          {showCheckbox && (
            <div className="flex-none w-5 flex items-center justify-center mr-2">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleNodeToggle(n)}
                disabled={!canSelect(n)}
                className={cn(
                  "w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500",
                  !canSelect(n) && "opacity-50 cursor-not-allowed"
                )}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          )}

          {/* icon + label (chọn) */}
          <button
            type="button"
            className={cn(
              "flex-1 flex items-center gap-2 py-1 text-left min-w-0",
              canSelect(n) ? "cursor-pointer" : "cursor-default opacity-60"
            )}
            onClick={() => {
              if (showCheckbox) {
                handleNodeToggle(n);
              } else {
                if (!canSelect(n)) return;
                (onChange as (node: OrgTreeNode) => void)(n);
                setOpen(false);
              }
            }}
            title={n.name}
          >
            <Building2 className="w-4 h-4 text-gray-600 flex-none" />
            <span className="whitespace-nowrap !text-black">{n.name}</span>
          </button>

          {!showCheckbox && isSelected && (
            <Check className="w-4 h-4 text-blue-600 ml-2" />
          )}
        </div>

        {/* children */}
        {hasChildren && isOpen && (
          <div className="ml-6 pl-3 border-l border-gray-200">
            {n.children!.map((c) => renderRow(c, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const rafId = useRef<number | null>(null);
  const pendingScrollLeft = useRef<number | null>(null);

  const flushScroll = () => {
    if (!scrollRef.current) return;
    if (pendingScrollLeft.current === null) return;
    scrollRef.current.scrollLeft = pendingScrollLeft.current;
    pendingScrollLeft.current = null;
    rafId.current = null;
  };
  const scheduleScroll = () => {
    if (rafId.current !== null) return;
    rafId.current = requestAnimationFrame(flushScroll);
  };
  const onMouseDown = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    isDownRef.current = true;
    startXRef.current = e.pageX - el.getBoundingClientRect().left;
    scrollLeftRef.current = el.scrollLeft;
    el.classList.add("cursor-grabbing");
  };
  const onMouseLeave = () => {
    isDownRef.current = false;
    scrollRef.current?.classList.remove("cursor-grabbing");
  };
  const onMouseUp = () => {
    isDownRef.current = false;
    scrollRef.current?.classList.remove("cursor-grabbing");
  };
  const onMouseMove = (e: React.MouseEvent) => {
    const el = scrollRef.current;
    if (!el || !isDownRef.current) return;
    e.preventDefault();
    const x = e.pageX - el.getBoundingClientRect().left;
    const walk = (x - startXRef.current) * 1;
    pendingScrollLeft.current = scrollLeftRef.current - walk;
    scheduleScroll();
  };
  const onWheel = (e: React.WheelEvent) => {
    const el = scrollRef.current;
    if (!el) return;
    pendingScrollLeft.current =
      el.scrollLeft +
      (Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY * 0.5);
    scheduleScroll();
  };

  React.useEffect(() => {
    return () => {
      if (rafId.current != null) cancelAnimationFrame(rafId.current);
    };
  }, []);

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const handleRemoveTag = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!showCheckbox) return;

    const isSelected = selectedIds.has(nodeId);
    const currentIds = Array.from(selectedIds);

    if (isSelected) {
      const newIds = currentIds.filter((id) => id !== nodeId);

      // Find nodes by ids
      const newNodes: OrgTreeNode[] = [];
      if (newIds.includes(AGG_NODE.id)) {
        newNodes.push(AGG_NODE as OrgTreeNode);
      }

      const stack = [...tree];
      while (stack.length) {
        const node = stack.pop()!;
        if (newIds.includes(node.id)) newNodes.push(node);
        if (node.children?.length) stack.push(...node.children);
      }

      (onChange as (nodes: OrgTreeNode[]) => void)(newNodes);
    }
  };

  const [visibleTags, setVisibleTags] = useState(3);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const calculateVisibleTags = () => {
    if (!triggerRef.current || selectedNodes.length === 0) return;

    const triggerWidth = triggerRef.current.offsetWidth;
    // Reserve space for chevron icon and padding
    const availableWidth = triggerWidth - 40;

    let totalWidth = 0;
    let count = 0;
    const tagGap = 8; // gap-2 = 8px
    const plusBadgeWidth = 50; // +N badge width estimate

    for (const node of selectedNodes) {
      // Calculate tag width: padding(8px*2) + text + close button(16px) + gap
      const textWidth = Math.min(node.name.length * 7, 150); // max 150px
      const tagWidth = 16 + textWidth + 16 + tagGap;

      if (
        totalWidth +
          tagWidth +
          (count < selectedNodes.length - 1 ? plusBadgeWidth : 0) >
        availableWidth
      ) {
        break;
      }

      totalWidth += tagWidth;
      count++;
    }

    setVisibleTags(Math.max(1, count));
  };

  useEffect(() => {
    if (!showCheckbox) return;

    calculateVisibleTags();
    const timer = setTimeout(calculateVisibleTags, 100); // Recalculate after render
    window.addEventListener("resize", calculateVisibleTags);
    return () => {
      clearTimeout(timer);
      window.removeEventListener("resize", calculateVisibleTags);
    };
  }, [showCheckbox, selectedNodes]);

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => !disabled && setOpen((v) => !v)}
        disabled={disabled}
        className={cn(
          "w-full h-10 px-4 rounded-lg border border-blue-300 bg-white text-blue-700 font-medium focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-400 transition-all duration-200 hover:border-blue-400 shadow-sm flex items-center",
          disabled && "cursor-not-allowed bg-gray-200",
          showCheckbox && "py-2 min-h-[40px] h-auto",
          className
        )}
        title={
          showCheckbox
            ? selectedNodes.map((n) => n.name).join(", ") || undefined
            : selectedNode?.name
        }
      >
        {showCheckbox ? (
          <div className="flex-1 flex items-center gap-2 overflow-hidden">
            {selectedNodes.length === 0 ? (
              <span className="text-blue-500 font-normal text-sm">
                {placeholder || "Chọn đơn vị"}
              </span>
            ) : (
              <>
                {selectedNodes.slice(0, visibleTags).map((node) => (
                  <span
                    key={node.id}
                    className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-100 text-blue-800 border border-blue-200 rounded-md whitespace-nowrap flex-shrink-0"
                    title={node.name}
                  >
                    <span className="truncate max-w-[100px] !text-black">
                      {node.name}
                    </span>
                    <button
                      onClick={(e) => handleRemoveTag(node.id, e)}
                      className="hover:bg-blue-200 rounded-full w-4 h-4 flex items-center justify-center text-blue-600 hover:text-blue-800 transition-colors flex-shrink-0"
                      type="button"
                      title="Xóa"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {selectedNodes.length > visibleTags && (
                  <span className="inline-flex items-center px-2 py-1 text-xs bg-gray-200 text-blue-900 rounded-md font-semibold whitespace-nowrap flex-shrink-0">
                    +{selectedNodes.length - visibleTags}
                  </span>
                )}
              </>
            )}
          </div>
        ) : (
          <span
            className={cn(
              "flex-1 truncate text-left",
              selectedNode
                ? "text-blue-700 font-normal"
                : "text-blue-500 font-normal"
            )}
            title={selectedNode?.name || placeholder || "Chọn đơn vị"}
          >
            {selectedNode?.name || placeholder || "Chọn đơn vị"}
          </span>
        )}
        {!disabled && (
          <ChevronDown className="w-4 h-4 text-blue-500 flex-shrink-0 ml-2" />
        )}
      </button>

      <div
        className={cn(
          "absolute z-30 mt-2 w-full rounded-xl bg-white shadow-lg overflow-hidden transition-opacity duration-150",
          open
            ? "opacity-100 visible pointer-events-auto"
            : "opacity-0 invisible pointer-events-none"
        )}
        style={{ maxHeight: height }}
      >
        {isLoading ? (
          <div className="p-6 text-center text-gray-500">Đang tải…</div>
        ) : tree.length === 0 ? (
          <div className="p-6 text-center text-gray-400">Không có dữ liệu</div>
        ) : (
          <div className="overflow-y-auto max-h-full">
            <div
              className={cn(
                "overflow-x-auto",
                "scrollbar-thin scrollbar-thumb-indigo-300 scrollbar-track-slate-100"
              )}
              style={{ maxHeight: height }}
            >
              <div className="min-w-max py-2 pr-4">
                {(showCheckbox ? tree : [AGG_NODE, ...tree]).map((n) =>
                  renderRow(n as OrgTreeNode, 0)
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
