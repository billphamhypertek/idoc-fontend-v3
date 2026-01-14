"use client";

import { useState, useMemo, useRef, useEffect } from "react";
import { ChevronRight, ChevronDown, Building2, User } from "lucide-react";
import { useOrgTree } from "@/hooks/data/dashboard.data";
import { OrgTreeNode, OrgUserTreeNode } from "@/definitions/types/orgunit.type";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Checkbox } from "../ui/checkbox";
import { UserInformationProcess } from "@/definitions/types/process.type";

interface OrganizationTreeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (item: OrgUserTreeNode) => void;
  selectedItems?: OrgUserTreeNode[];
  users?: UserInformationProcess[];
}

export default function OrganizationTreeDialog({
  isOpen,
  onClose,
  onSelect,
  selectedItems = [],
  users,
}: OrganizationTreeDialogProps) {
  const { tree } = useOrgTree();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  // Group users by orgId
  const usersByOrgId = useMemo(() => {
    if (!users) return {};
    return users.reduce(
      (acc, user) => {
        if (user.orgId) {
          const orgId = user.orgId.toString();
          if (!acc[orgId]) {
            acc[orgId] = [];
          }
          acc[orgId].push(user);
        }
        return acc;
      },
      {} as Record<string, UserInformationProcess[]>
    );
  }, [users]);

  const toggleExpand = (orgId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orgId)) {
        newSet.delete(orgId);
      } else {
        newSet.add(orgId);
      }
      return newSet;
    });
  };

  // Helper function to create OrgUserTreeNode for organization
  const createOrgNode = (org: OrgTreeNode): OrgUserTreeNode => ({
    orgId: org.id,
    orgName: org.name,
    userId: null,
    userName: null,
    fullName: null,
    positionId: null,
    positionName: null,
    type: "org",
  });

  // Helper function to create OrgUserTreeNode for user
  const createUserNode = (
    user: UserInformationProcess,
    org: OrgTreeNode
  ): OrgUserTreeNode => ({
    orgId: org.id,
    orgName: org.name,
    userId: user.id,
    userName: user.userName,
    fullName: user.fullName,
    positionId: user.positionId,
    positionName: user.positionName,
    lead: user.lead,
    directionAuthority: user.directionAuthority,
    positionOrder: user.positionOrder,
    type: "user",
  });

  // Helper function to check if an item is selected
  const isItemSelected = (item: OrgUserTreeNode): boolean => {
    return selectedItems.some(
      (selected) =>
        selected.type === item.type &&
        selected.orgId === item.orgId &&
        (item.type === "org" || selected.userId === item.userId)
    );
  };

  // Function to handle selection with scroll preservation
  const handleSelectWithScrollPreservation = (item: OrgUserTreeNode) => {
    // Store current scroll position
    const scrollContainer = scrollContainerRef.current;
    const currentScrollTop = scrollContainer?.scrollTop || 0;

    // Call the original onSelect
    onSelect(item);

    // Restore scroll position after a brief delay to allow re-render
    setTimeout(() => {
      if (scrollContainer) {
        scrollContainer.scrollTop = currentScrollTop;
      }
    }, 0);
  };

  const TreeNode = ({
    node,
    level = 0,
  }: {
    node: OrgTreeNode;
    level?: number;
  }) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const orgUsers = usersByOrgId[node.id] || [];
    const hasUsers = orgUsers.length > 0;

    // Create org node for selection
    const orgNode = createOrgNode(node);
    const isOrgSelected = isItemSelected(orgNode);

    return (
      <div className="w-full">
        <div
          className={`flex items-center gap-2 py-2 px-2 cursor-pointer border-b`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
        >
          {(hasChildren || hasUsers) && (
            <Button
              className="p-0 h-4 w-4 flex items-center justify-center hover:bg-transparent hover:text-black bg-transparent border-none outline-none shadow-none text-black"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          )}
          {!hasChildren && !hasUsers && <span className="w-4" />}
          <Checkbox
            checked={isOrgSelected}
            onCheckedChange={() => handleSelectWithScrollPreservation(orgNode)}
          />
          <Building2 className="w-4 h-4 text-blue-600" />
          <span
            className={`text-sm break-all ${
              isOrgSelected ? "font-semibold text-blue-700" : ""
            }`}
          >
            {node.name}
          </span>
        </div>
        {(hasChildren || hasUsers) && isExpanded && (
          <div>
            {/* Render users first */}
            {orgUsers.map((user) => {
              const userNode = createUserNode(user, node);
              const isUserSelected = isItemSelected(userNode);
              return (
                <div
                  key={`user-${user.id}`}
                  className={`flex items-center gap-2 py-2 px-2 cursor-pointer border-b hover:bg-gray-50`}
                  style={{ paddingLeft: `${(level + 1) * 20 + 8}px` }}
                >
                  <span className="w-4" />
                  <Checkbox
                    checked={isUserSelected}
                    onCheckedChange={() =>
                      handleSelectWithScrollPreservation(userNode)
                    }
                  />
                  <User className="w-4 h-4 text-green-600" />
                  <span
                    className={`text-sm break-all ${
                      isUserSelected ? "font-semibold text-green-700" : ""
                    }`}
                  >
                    {user.fullName}
                    {user.positionName && (
                      <span className="text-gray-500 ml-1">
                        ({user.positionName})
                      </span>
                    )}
                  </span>
                </div>
              );
            })}
            {/* Then render child organizations */}
            {node.children?.map((child) => (
              <TreeNode key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{"Chọn đơn vị, cá nhân"}</DialogTitle>
        </DialogHeader>
        <div
          ref={scrollContainerRef}
          className="py-4 max-h-[60vh] overflow-y-auto"
        >
          <div className="border rounded-lg">
            {tree && tree.length > 0 ? (
              tree.map((org) => <TreeNode key={org.id} node={org} />)
            ) : (
              <p className="text-center text-gray-500 text-sm py-4 b">
                Không có dữ liệu đơn vị
              </p>
            )}
          </div>
        </div>
        <DialogFooter className="justify-end gap-2">
          <Button
            onClick={onClose}
            size="sm"
            className="h-9 px-3 text-sm bg-blue-600 hover:bg-blue-700"
          >
            Xong
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
