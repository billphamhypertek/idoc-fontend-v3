"use client";

import { Bell, ChevronLeft, ChevronRight } from "lucide-react";
import { usePathname } from "next/navigation";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useSidebarStore } from "~/stores/sideBar.store";

import { Button } from "~/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import { cn } from "~/lib/utils";
import { ModuleNode } from "@/definitions";
import { getModules } from "@/utils/authentication.utils";
import Link from "next/link";
import { MenuItems } from "@/components/dashboard/MenuItems";
import { MenuItem } from "@/definitions/types/menu.type";
import { UserProfileSection } from "@/components/dashboard/UserProfileSection";
import { STORAGE_KEYS } from "@/definitions/constants/storageKey.constant";
import { useMenuBadges } from "@/hooks/data/useMenuBadges";
import { useEncryptStore } from "@/stores/encrypt.store";
import { TextUtils } from "@/utils/text-utils";

const menuItems = (isEncrypt: boolean): MenuItem[] => {
  const mapOne = (n: ModuleNode): MenuItem => {
    const children = (n.subModule ?? []).filter((c) => c.active).map(mapOne);
    const moduleName = TextUtils.getNameMenu(n.code, n.name, isEncrypt);
    const href =
      children.length === 0
        ? n.routerPath
          ? n.routerPath.startsWith("/")
            ? n.routerPath
            : `/${n.routerPath}`
          : ""
        : "";

    return {
      id: String(n.id),
      code: n.code,
      name: moduleName,
      href: href || "", // Ensure leaf node has a `href`
      svg: n.faIcon || "", // SVG icon (or default if missing)
      children: children.length ? children : [], // Recursively map children
    };
  };

  const data = (getModules() ?? []) as ModuleNode[];
  return data.filter((r) => r.active).map(mapOne);
};

// Memoized menu items to prevent unnecessary recalculations
const MemoizedMenuItems = React.memo(MenuItems);

export default function SideBar() {
  const { isEncrypt } = useEncryptStore();
  const [modules, setModules] = React.useState<MenuItem[]>([]);

  const { isCollapsed, toggleCollapse } = useSidebarStore();
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const [isClient, setClient] = useState(false);
  useEffect(() => {
    setClient(true);
  }, []);

  const handleToggleCollapse = useCallback(() => {
    toggleCollapse();
  }, [toggleCollapse]);

  // Toggle expand - Memoized to prevent unnecessary re-renders
  const toggleExpand = useCallback(
    (name: string) => {
      setExpandedItems((prev) => {
        const isExpanding = !prev.includes(name);
        if (isExpanding) {
          // Find siblings to close
          const findSiblings = (items: MenuItem[]): string[] => {
            for (const item of items) {
              if (item.name === name) {
                return items.map((i) => i.name).filter((n) => n !== name);
              }
              if (item.children && item.children.length > 0) {
                const res = findSiblings(item.children);
                if (res.length > 0) return res;
              }
            }
            return [];
          };
          const siblings = findSiblings(modules);
          // Remove siblings from expanded items, then add the new one
          const newExpanded = prev.filter((p) => !siblings.includes(p));
          return [...newExpanded, name];
        } else {
          // Collapsing
          return prev.filter((t) => t !== name);
        }
      });
    },
    [modules]
  );
  //reload menu when set new item in local storage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const load = () => setModules(menuItems(isEncrypt));
    load();

    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEYS.MODULES) load();
    };
    window.addEventListener("storage", onStorage);
    const onLocal = () => load();
    window.addEventListener("modules:update", onLocal as EventListener);

    return () => {
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("modules:update", onLocal as EventListener);
    };
  }, [isEncrypt]);

  // Auto-expand parents if child active - Memoized to prevent unnecessary recalculations
  const activeParents = useMemo(() => {
    if (!isClient || !modules.length || !pathname) return [];
    const parents: string[] = [];
    modules.forEach((item) => {
      const hasActiveChild = item.children?.some((child) => {
        // Bỏ qua child có href trống hoặc "/" để không expand sai khi đang ở "/"
        if (!child.href || child.href === "/") return false; // IGNORE child.href === "/"

        // Normalize href to ensure it starts with '/' for proper matching
        const normalizedHref = child.href.startsWith("/")
          ? child.href
          : `/${child.href}`;

        // Use pathname to determine active state
        return (
          pathname === normalizedHref ||
          pathname.startsWith(`${normalizedHref}/`)
        );
      });
      if (hasActiveChild) parents.push(item.name);
    });

    return Array.from(new Set(parents));
  }, [pathname, isClient, modules]);

  useEffect(() => {
    if (activeParents.length > 0) {
      setExpandedItems(activeParents);
    }
  }, [activeParents]);

  // Prevent unnecessary re-renders during navigation
  const memoizedModules = useMemo(() => modules, [modules]);

  useEffect(() => {
    if (!isCollapsed) setExpandedItems([]);
  }, [isCollapsed]);

  // ===== BADGES + NOTIFICATION =====
  const { data: badgePack } = useMenuBadges();
  const getBadge = useCallback(
    (code?: string, nameHint?: string, hrefHint?: string) => {
      const badge = badgePack?.byCode(code, nameHint, hrefHint) ?? 0;
      return badge;
    },
    [badgePack, isEncrypt]
  );

  if (!isClient) return null;

  return (
    <div
      className={cn(
        "fixed left-0 bottom-0 z-50 bg-white border-r border-gray-200 transition-all duration-200 ease-out shadow-2xl flex flex-col h-full min-h-0 top-[104px] group will-change-transform",
        isCollapsed ? "w-16" : "w-64"
      )}
      style={{
        transform: "translateZ(0)", // Force hardware acceleration
        backfaceVisibility: "hidden", // Prevent flicker
      }}
    >
      {/* Toggle Button (adapted from React) */}
      <Button
        onClick={handleToggleCollapse}
        className={cn(
          "absolute -right-3 top-[45%] py-[23px]  -translate-y-1/2 w-2 h-14 border rounded-full shadow-md flex items-center justify-center transition-all duration-200 ease-out hover:shadow-lg hover:scale-105 z-10 opacity-70 group-hover:opacity-100",
          "hover:bg-[#d1d1d1] hover:opacity-100",
          "border-[#e5e7eb]",
          "bg-[#d1d1d1]"
        )}
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        )}
      </Button>

      <div className="flex flex-col h-[calc(100%-96px)]">
        {/* Nav */}
        <nav
          className={cn(
            "flex-1 min-h-0 overflow-y-auto overflow-x-hidden custom-scrollbar bg-white",
            isCollapsed ? "px-2 py-3" : "px-2 py-6"
          )}
        >
          <ul className={cn(isCollapsed ? "space-y-2" : "space-y-2")}>
            {memoizedModules.map((item) => (
              <MemoizedMenuItems
                key={String(item.id)}
                item={item}
                depth={0}
                expandedItems={expandedItems}
                toggleExpand={toggleExpand}
                getBadge={getBadge}
              />
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className="border-t border-gray-200 pb-4">
          {!isCollapsed && (
            <Link
              href="/notifications"
              className="flex items-center gap-2 px-3 py-3 text-sm hover:bg-gray-100 transition border-b border-gray-200"
            >
              <Bell className="w-4 h-4 text-gray-600" />
              <span className="text-black">Thông báo</span>
              {typeof badgePack?.notifications === "number" && (
                <span className="ml-auto mr-1 min-w-[28px] h-6 px-2 rounded-full text-xs font-bold text-white bg-amber-500 flex items-center justify-center">
                  {badgePack.notifications > 999
                    ? "999+"
                    : badgePack.notifications}
                </span>
              )}
            </Link>
          )}
          {isCollapsed && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    href="/notifications"
                    className="flex items-center justify-center py-3 hover:bg-gray-100 transition border-b border-gray-200 relative"
                  >
                    <Bell className="w-4 h-4 text-gray-600" />
                    {typeof badgePack?.notifications === "number" &&
                      badgePack.notifications > 0 && (
                        <span className="absolute top-1.5 right-3 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold text-white bg-amber-500 flex items-center justify-center">
                          {badgePack.notifications > 99
                            ? "99+"
                            : badgePack.notifications}
                        </span>
                      )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent
                  side="right"
                  className="bg-gray-900 text-white border-none shadow-xl ml-2"
                >
                  <div className="font-semibold">Thông báo</div>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          <div className=" border-gray-200">
            <UserProfileSection />
          </div>
          <div className="text-center">
            {!isCollapsed && (
              <p className="text-[12px] text-[#9ca3af] mt-1">
                © 2025 Ban Cơ yếu Chính phủ
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
