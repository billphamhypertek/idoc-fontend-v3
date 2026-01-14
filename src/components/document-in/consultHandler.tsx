"use client";

import { ConsultDialog } from "@/components/dialogs/ConsultDialog";
import { Organization, OrganizationItem, User } from "@/definitions";
import { VehicleService } from "@/services/vehicle.service";
import { ChevronDown, MessageSquare } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BpmnResponse } from "@/definitions/types/bpmn.type";
import { useConsultHandleList } from "@/hooks/data/document-in.data";
import { ToastUtils } from "@/utils/toast.utils";
import { useRouter } from "next/navigation";
import { handleError } from "@/utils/common.utils";

// Định nghĩa interface cho props của component
interface ConsuleHandlerProps {
  selectedItemId: number | null; // ID của item được chọn (chỉ hỗ trợ 1 item)
  currentNode: number | null; // currentNode của item
  consultNodeData: BpmnResponse[];
  disabled?: boolean; // Disable button nếu cần
  onSuccess?: () => void; // Callback sau khi consult thành công (ví dụ: refetch, clear selection)
  className?: string; // Class tùy chỉnh cho button
  // Callback để đảm bảo có ID trước khi mở (tự động lưu nếu chưa có id)
  onEnsureId?: () => Promise<number | null>;
}

// Hàm buildFilteredOrganizationTree (giữ nguyên từ mã gốc)
function buildFilteredOrganizationTree(
  orgs: Organization[],
  users: User[]
): OrganizationItem[] {
  // Collect unique target org IDs from users (orgs that have relevant users for the node)
  const targetOrgIds = new Set(
    users
      .map((u) => u.org)
      .filter((id): id is number => id !== undefined && id !== null)
  );

  if (targetOrgIds.size === 0) {
    return [];
  }

  // Build orgMap
  const orgMap = new Map<number, OrganizationItem>();

  orgs.forEach((org) => {
    orgMap.set(org.id, {
      id: org.id,
      name: org.name,
      type: "organization",
      hasChildren: false,
      level: 0, // Will be set later
      parentId: org.parentId ? org.parentId : undefined,
      children: [],
    });
  });

  // Add users as children to their orgs (only relevant users)
  users.forEach((user) => {
    const orgId = user.org;
    if (orgId !== undefined && orgId !== null) {
      const org = orgMap.get(orgId);
      if (org) {
        org.children!.push({
          id: user.id,
          name: user.fullName,
          type: "person",
          hasChildren: false,
          level: 0, // Will be set later
          parentId: orgId,
          // Assume User has additional fields like lead: boolean, positionName: string
          // We can extend User interface if needed: interface User { ..., lead?: boolean; positionName?: string; }
        });
        org.hasChildren = true;
      }
    }
  });

  // Build hierarchy (attach children to parents)
  orgMap.forEach((org) => {
    if (org.parentId) {
      const parent = orgMap.get(org.parentId);
      if (parent) {
        parent.children!.push(org);
        parent.hasChildren = true;
      }
    }
  });

  // Helper to find root for a target org ID
  const findRoot = (orgId: number): OrganizationItem | null => {
    let currentId: number | undefined = orgId;
    while (currentId !== undefined) {
      const org = orgMap.get(currentId);
      if (!org || org.parentId === undefined) {
        return org || null;
      }
      currentId = org.parentId;
    }
    return null;
  };

  // Build showTree: add unique roots containing target orgs
  const showTree: OrganizationItem[] = [];
  const addedRoots = new Set<number>();
  targetOrgIds.forEach((targetId) => {
    const root = findRoot(targetId);
    if (root && !addedRoots.has(root.id)) {
      showTree.push(root);
      addedRoots.add(root.id);
    }
  });

  // Set levels
  const setLevels = (item: OrganizationItem, level: number) => {
    item.level = level;
    if (item.children) {
      item.children.forEach((child) => setLevels(child, level + 1));
    }
  };
  showTree.forEach((root) => setLevels(root, 0));

  // Set leaders for orgs (find direct child user with lead === true)
  const setLeaders = (items: OrganizationItem[]) => {
    items.forEach((item) => {
      if (item.type === "organization" && item.children) {
        const leaderChild = item.children.find(
          (child) => child.type === "person" && child.lead // Assume User has lead field
        );
        if (leaderChild) {
          item.leaderId = leaderChild.id;
          item.leaderName = leaderChild.name;
          // item.leaderPositionName = (leaderChild as any).positionName; // If needed
        }
        setLeaders(item.children);
      }
    });
  };
  setLeaders(showTree);

  // Prune empty org branches (remove org nodes with no children after adding users)
  const pruneEmptyOrgs = (tree: OrganizationItem[]) => {
    const pruneNode = (node: OrganizationItem): boolean => {
      if (node.type === "person") return true;

      if (node.children) {
        node.children = node.children.filter((child) => {
          return pruneNode(child);
        });
      }

      // Keep org only if it has children left
      if (node.type === "organization") {
        return !!(node.children && node.children.length > 0);
      }

      return true;
    };

    // Prune and filter top-level
    for (let i = tree.length - 1; i >= 0; i--) {
      pruneNode(tree[i]);
      if (
        tree[i].type === "organization" &&
        (!tree[i].children || tree[i].children!.length === 0)
      ) {
        tree.splice(i, 1);
      }
    }
  };
  pruneEmptyOrgs(showTree);

  return showTree;
}

// Component ConsultHandler riêng biệt
export function ConsultHandler({
  selectedItemId,
  currentNode,
  consultNodeData,
  disabled = false,
  onSuccess,
  className = "",
  onEnsureId,
}: ConsuleHandlerProps) {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [orgData, setOrgData] = useState<OrganizationItem[]>([]);
  const consultMutation = useConsultHandleList();

  const handleRoleClick = async (role: BpmnResponse) => {
    setSelectedRole(role);
    setIsDropdownOpen(false);
    try {
      const orgs = await VehicleService.getAllOrganizations();
      let users = await VehicleService.getUsersForNode(role.id);
      // Sort users by positionOrder if available (matching Angular)
      if (users && users.length > 0 && "positionOrder" in users[0]) {
        users = users.sort(
          (a: User, b: User) => (a.positionOrder || 0) - (b.positionOrder || 0)
        );
      }
      const tree = buildFilteredOrganizationTree(orgs, users);
      setOrgData(tree);
      setIsDialogOpen(true);
    } catch (err) {
      console.error("Error fetching data for consule dialog:", err);
    }
  };

  const handleConsultDialogSubmit = async (submitData: {
    processingContent: string;
    mainProcessors: number[];
    selectedRoleId: number;
  }) => {
    if (!selectedRole) {
      console.error("No item, role, or currentNode selected");
      return;
    }
    let idForAction = selectedItemId;
    if (!idForAction && onEnsureId) {
      idForAction = await onEnsureId();
    }
    if (!idForAction) {
      // Không thể thực hiện nếu không có id sau khi cố gắng lưu
      return;
    }
    const str = submitData.mainProcessors.join(",") + ",";
    const fd = new FormData();
    fd.append("docId", String(idForAction) ?? "");
    fd.append("comment", submitData.processingContent ?? "");
    fd.append("listToUserId", str ?? "");
    fd.append("nodeId", String(submitData.selectedRoleId) ?? "");

    consultMutation.mutate(fd, {
      onSuccess: () => {
        ToastUtils.success("Xin ý kiến thành công!");
        setIsDialogOpen(false);
        router.push("/document-in/draft-list");
        if (onSuccess) onSuccess();
      },
      onError: (err) => {
        handleError(err);
      },
    });
  };

  return (
    <>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={`text-white border-0 h-9 px-2 text-xs disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 hover:text-white ${className}`}
          >
            <MessageSquare className="w-4 h-4 mr-1" />
            Luồng xin ý kiến
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="min-w-48" align="start">
          {consultNodeData?.map((role, index) => (
            <DropdownMenuItem
              key={index}
              className="cursor-pointer"
              onClick={() => handleRoleClick(role)}
            >
              {role.name ? role.name : "Chưa đặt tên"}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <ConsultDialog
        isOpen={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        onSubmit={handleConsultDialogSubmit}
        selectedRole={selectedRole}
        organizationData={orgData}
      />
    </>
  );
}
