import { cn } from "@/lib/utils";
import Link from "next/link";
import CustomIcon from "@/components/dashboard/CustomIcon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useRouter } from "next/navigation";
import React, { useCallback } from "react";
import { MenuItem } from "@/definitions/types/menu.type";
import { ChevronRight } from "lucide-react";
import { MenuItems } from "@/components/dashboard/MenuItems";
import { useSidebarStore } from "@/stores/sideBar.store";
import { STORAGE_KEYS } from "@/definitions/constants/storageKey.constant";
import { shouldRedirectToV1, redirectToV1 } from "@/utils/sso.utils";

interface ParentItemProps {
  item: MenuItem;
  isActive: boolean;
  depth: number;
  itemExpanded: boolean;
  toggleExpand: (name: string) => void;
  expandedItems: string[];
  getBadge?: (code?: string, nameHint?: string, hrefHint?: string) => number;
}

const ParentItem = React.memo(
  ({
    item,
    itemExpanded,
    isActive,
    depth,
    toggleExpand,
    expandedItems,
    getBadge,
  }: ParentItemProps) => {
    const router = useRouter();
    const { isCollapsed } = useSidebarStore();
    const isRoot = depth === 0;
    const firstChildHref = item.children?.[0]?.href;

    // Calculate parent badge: ưu tiên tổng các con; nếu chưa có dữ liệu con mới dùng tổng từ API
    const childrenSum =
      item.children?.reduce(
        (acc, c) => acc + (getBadge?.(c.code, c.name, c.href) ?? 0),
        0
      ) ?? 0;
    const apiTotal = getBadge?.(item.code, item.name, item.href) ?? 0;
    const parentBadge = isRoot ? (childrenSum > 0 ? childrenSum : apiTotal) : 0;

    const handleClick = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();
        if (!firstChildHref) return;

        // Check if this path belongs to other web (SSO)
        if (shouldRedirectToV1(firstChildHref)) {
          redirectToV1(firstChildHref);
          return;
        }

        // Normal navigation within same web
        if (isCollapsed) {
          router.push(firstChildHref, { scroll: false });
          localStorage.setItem(STORAGE_KEYS.MENU_SIDEBAR, firstChildHref);
        } else {
          toggleExpand(item.name);
          setTimeout(() => {
            router.push(firstChildHref, { scroll: false });
            localStorage.setItem(STORAGE_KEYS.MENU_SIDEBAR, firstChildHref);
          }, 150);
        }
      },
      [router, firstChildHref, isCollapsed, toggleExpand, item.name]
    );

    const handleToggleExpand = useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        toggleExpand(item.name);
      },
      [toggleExpand, item.name]
    );

    // Base styles
    const containerBaseStyles = cn(
      "flex items-center w-full h-12 rounded-[10px] font-semibold transition relative group",
      isRoot ? (isCollapsed ? "px-1" : "px-2") : "px-1"
    );

    const containerStateStyles = isRoot
      ? isActive
        ? "text-white shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] bg-[#1d71c9]"
        : "text-gray-700 hover:bg-[#f3f4f6] hover:rounded-[10px] hover:text-gray-900"
      : isActive
        ? "font-semibold border shadow-sm bg-[#E3F2FD] text-[#1976D2] border-[#1976D2]"
        : "text-gray-500 hover:bg-[#E3F2FD]/50 hover:text-gray-700";

    const iconContainerStyles = cn(
      "flex items-center justify-center rounded-[10px] transition relative flex-shrink-0",
      isRoot ? (isCollapsed ? "w-[34px] h-[34px]" : "w-[39px] h-[38px]") : "",
      isRoot && isActive
        ? "bg-white/20 text-white"
        : "text-gray-500 hover:text-gray-700 hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]"
    );

    const dotStyles = cn(
      "inline-block w-2 h-2 rounded-full transition-all duration-200 ease-out my-2 mx-2 flex-shrink-0",
      isActive ? "bg-[#1976D2]" : "bg-gray-300 group-hover:bg-gray-400"
    );

    const renderIcon = () => {
      if (isRoot) {
        return (
          <div className={iconContainerStyles}>
            <CustomIcon
              spec={item.svg}
              className="w-4 h-4"
              size={isCollapsed ? 18 : 20}
            />
          </div>
        );
      }
      return <span className={dotStyles} />;
    };

    const renderCollapsedView = () => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={handleClick}
              className={cn(
                containerBaseStyles,
                isRoot ? "justify-center px-0.5" : "gap-2 px-2",
                containerStateStyles
              )}
            >
              {renderIcon()}
              {isActive && isRoot && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-9 bg-white rounded-r-full shadow-lg" />
              )}
            </button>
          </TooltipTrigger>
          <TooltipContent
            side="right"
            className="bg-gray-900 text-white border-none shadow-xl ml-2"
            align="start"
          >
            <div className="flex items-center gap-2 font-semibold mb-2">
              <span className="whitespace-nowrap">{item.name}</span>
            </div>
            <div className="space-y-1">
              {item.children?.map((child: MenuItem) => (
                <div key={child.id} className="text-gray-300 whitespace-nowrap">
                  {child.name}
                </div>
              ))}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );

    const renderExpandedView = () => (
      <>
        <div
          className={cn(containerBaseStyles, containerStateStyles, "gap-1")}
          aria-expanded={itemExpanded}
        >
          <button
            onClick={handleClick}
            className="flex items-center gap-1 flex-1 text-left hover:bg-white/10 rounded transition-colors overflow-hidden"
          >
            {renderIcon()}
            {!isCollapsed && (
              <span
                className="truncate text-[16px] text-left flex-1 min-w-0"
                title={item.name}
              >
                {item.name}
              </span>
            )}
          </button>

          {!isCollapsed && isRoot && parentBadge > 0 && (
            <span className="h-5 min-w-5 w-fit px-1 rounded-full text-xs font-bold text-white bg-amber-500 flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.2)] flex-shrink-0">
              {parentBadge > 999 ? "999+" : parentBadge}
            </span>
          )}

          {!isCollapsed && (
            <button
              onClick={handleToggleExpand}
              className="p-1 hover:bg-white/20 rounded transition-colors flex-shrink-0"
            >
              <ChevronRight
                className={cn(
                  "w-4 h-4 transition-all duration-200 ease-out",
                  itemExpanded
                    ? "rotate-90 text-white"
                    : "text-gray-400 group-hover:text-gray-600"
                )}
              />
            </button>
          )}

          {isActive && isRoot && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-9 bg-white rounded-r-full shadow-lg" />
          )}

          {isCollapsed && item?.children?.length > 0 && (
            <Link
              href={item?.children[0].href}
              className="block ml-6 mt-1 text-gray-500 hover:bg-gray-200 rounded-md"
            />
          )}
        </div>

        <div
          className={cn(
            "overflow-hidden transition-all duration-200 ease-out",
            itemExpanded ? "opacity-100" : "max-h-0 opacity-0"
          )}
        >
          {!isCollapsed && (
            <div className="mt-3 ml-4 space-y-2 border-l-2 border-[#E8F1FC] pl-3">
              {item.children!.map((child: MenuItem) => (
                <MenuItems
                  key={String(child.id)}
                  item={child}
                  depth={depth + 1}
                  expandedItems={expandedItems}
                  toggleExpand={toggleExpand}
                  getBadge={getBadge}
                />
              ))}
            </div>
          )}
        </div>
      </>
    );

    return isCollapsed ? renderCollapsedView() : renderExpandedView();
  }
);

ParentItem.displayName = "ParentItem";
export default ParentItem;
