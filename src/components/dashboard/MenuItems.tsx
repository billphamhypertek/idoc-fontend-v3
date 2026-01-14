import { usePathname } from "next/navigation";
import React from "react";
import { MenuItem } from "@/definitions/types/menu.type";
import ParentItem from "@/components/dashboard/ParentItem";
import SingleItem from "@/components/dashboard/SingleItem";
import { useSidebarStore } from "@/stores/sideBar.store";
interface RenderNodeProps {
  item: MenuItem;
  depth: number;
  expandedItems: string[];
  toggleExpand: (name: string) => void;
  getBadge?: (code?: string, nameHint?: string, hrefHint?: string) => number;
}

const hasChildren = (n: MenuItem) => (n.children?.length ?? 0) > 0;

const matchNode = (node: MenuItem, pathname: string, depth: number) => {
  const href = node.href;
  if (!href) return false;
  if (href === "/") return depth === 0 && pathname === "/";

  // Normalize href to ensure it starts with '/' for proper matching
  const normalizedHref = href.startsWith("/") ? href : `/${href}`;

  const norm = (s: string) => (s === "/" ? "/" : s.replace(/\/+$/, ""));
  const h = norm(normalizedHref);
  const p = norm(pathname);
  return p === h || p.startsWith(`${h}/`);
};

const itemHaveActiveChild = (
  node: MenuItem,
  pathname: string,
  depth: number
): boolean => {
  if (matchNode(node, pathname, depth)) return true;
  return (
    node.children?.some((c) => itemHaveActiveChild(c, pathname, depth + 1)) ??
    false
  );
};

const MenuItemsComp: React.FC<RenderNodeProps> = ({
  item,
  depth,
  expandedItems,
  toggleExpand,
  getBadge,
}) => {
  const pathname = usePathname();
  const key = String(item.id ?? item.code ?? item.href);
  const { isCollapsed } = useSidebarStore();
  const isParent = hasChildren(item);
  const itemExpanded = expandedItems.includes(item.name);

  // Use pathname for active state checking
  const isActive = itemHaveActiveChild(item, pathname || "", depth);

  return (
    <div className="relative w-full">
      {!isParent ? (
        <SingleItem
          key={key}
          item={item}
          isActive={isActive}
          depth={depth}
          getBadge={getBadge}
        />
      ) : (
        <ParentItem
          key={key}
          item={item}
          isActive={isActive}
          itemExpanded={itemExpanded}
          depth={depth}
          toggleExpand={toggleExpand}
          expandedItems={expandedItems}
          getBadge={getBadge}
        />
      )}
    </div>
  );
};

export const MenuItems = React.memo(MenuItemsComp);
MenuItems.displayName = "MenuItems";
export default MenuItems;
