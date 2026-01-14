import { cn } from "@/lib/utils";
import Link from "next/link";
import CustomIcon from "@/components/dashboard/CustomIcon";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React, { useCallback } from "react";
import { MenuItem } from "@/definitions/types/menu.type";
import { useSidebarStore } from "@/stores/sideBar.store";
import { useRouter } from "next/navigation";
import { STORAGE_KEYS } from "@/definitions/constants/storageKey.constant";
import { shouldRedirectToV1, redirectToV1 } from "@/utils/sso.utils";

interface SingleItemProps {
  item: MenuItem;
  isActive: boolean;
  depth: number;
  getBadge?: (code?: string, nameHint?: string, hrefHint?: string) => number; // <-- thêm
}

export const SingleItem = React.memo(
  ({ item, isActive, depth, getBadge }: SingleItemProps) => {
    const { isCollapsed } = useSidebarStore();
    const router = useRouter();

    const handleClick = useCallback(
      (e: React.MouseEvent) => {
        e.preventDefault();

        // Check if this path belongs to other web (SSO)
        if (item.href && shouldRedirectToV1(item.href)) {
          redirectToV1(item.href);
          return;
        }

        // Normal navigation within same web
        router.push(item.href || "#", { scroll: false });
        localStorage.setItem(STORAGE_KEYS.MENU_SIDEBAR, item.href);
        // Removed localStorage set - let pathname tracking handle active state
      },
      [router, item.href]
    );

    const singleItemClass = (depth: number, isActive: boolean) => {
      // leaf node standalone (depth 0)
      const leafNode = cn(
        "flex items-center w-full h-10 rounded-[10px] font-semibold transition-all duration-200 ease-out relative group",
        isCollapsed ? "justify-center px-0.5" : "gap-1 px-3"
      );
      const leafNodeActive =
        "text-white shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_8px_10px_-6px_rgba(0,0,0,0.1)] bg-[#1d71c9]";
      const leafNodeInactive =
        "text-gray-700 hover:bg-[#f3f4f6] hover:rounded-[10px] hover:text-gray-900";

      //leaf node in expanded parent node (depth > 0)
      const nestedNode =
        "flex items-center w-full space-x-2 p-1.5 rounded-[10px] transition-all duration-200 ease-out";
      const nestedActive =
        "font-semibold border shadow-sm bg-[#E3F2FD] text-[#1976D2] border-[#1976D2]";
      const nestedInactive =
        "text-gray-500 hover:bg-[#E3F2FD]/50 hover:text-gray-700";

      const isRoot = depth === 0;
      return cn(
        isRoot ? leafNode : nestedNode,
        isRoot
          ? isActive
            ? leafNodeActive
            : leafNodeInactive
          : isActive
            ? nestedActive
            : nestedInactive
      );
    };

    // số badge cho mục con
    const badge = getBadge?.(item.code, item.name, item.href) ?? 0;

    const link = (
      <button
        onClick={handleClick}
        className={singleItemClass(depth, isActive)}
      >
        {depth === 0 ? (
          // Icon cho menu cấp 0
          <div
            className={cn(
              "flex items-center justify-center rounded-[10px] transition-all duration-200 ease-out relative flex-shrink-0",
              isCollapsed ? "w-[34px] h-[34px]" : "w-[39px] h-[38px]",
              isActive
                ? "bg-white/20 text-white"
                : "text-gray-500 hover:text-gray-700 hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-2px_rgba(0,0,0,0.1)]"
            )}
          >
            <CustomIcon
              spec={item.svg}
              size={isCollapsed ? 18 : 20}
              className={cn(
                "flex-shrink-0 transition-all duration-200 ease-out",
                isActive
                  ? "text-white"
                  : "text-gray-500 group-hover:text-gray-700"
              )}
            />
          </div>
        ) : (
          // Dot cho menu con
          <span
            className={cn(
              "inline-block w-2 h-2 rounded-full transition-all duration-200 ease-out my-2 flex-shrink-0",
              isActive ? "bg-[#1976D2]" : "bg-gray-300 group-hover:bg-gray-400"
            )}
          />
        )}
        {!isCollapsed && (
          <div className="flex items-center flex-1 min-w-0 gap-2">
            <span
              className="truncate text-[15px] text-left flex-1 min-w-0"
              title={item.name}
            >
              {item.name}
            </span>

            {badge > 0 && (
              <span className="flex-shrink-0 h-5 min-w-5 w-fit px-1 rounded-full text-xs font-bold text-white bg-amber-500 flex items-center justify-center shadow-[0_2px_4px_rgba(0,0,0,0.2)]">
                {badge > 999 ? "999+" : badge}
              </span>
            )}
          </div>
        )}
        {depth === 0 && isActive && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-9 bg-white rounded-r-full shadow-lg" />
        )}
      </button>
    );

    if (isCollapsed) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
            <TooltipContent
              side="right"
              className="bg-gray-900 text-white border-none shadow-xl ml-2"
              align="start"
            >
              <div className="font-semibold">{item.name}</div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    // Không có tooltip khi sidebar mở
    return link;
  }
);
SingleItem.displayName = "SingleItem";
export default SingleItem;
