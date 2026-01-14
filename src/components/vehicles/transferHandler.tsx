"use client";

import { TransferDialog } from "@/components/dialogs/TransferDialog";
import { Organization, OrganizationItem, User } from "@/definitions";
import { useTransferHandleList } from "@/hooks/data/vehicle.data";
import { VehicleService } from "@/services/vehicle.service";
import { ArrowRight, ChevronDown, Redo2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BpmnResponse } from "@/definitions/types/bpmn.type";
import { useGetNextNodes, useGetStartNodes } from "@/hooks/data/bpmn.data";
import { Constant } from "@/definitions/constants/constant";

// Định nghĩa interface cho props của component
interface TransferHandlerProps {
  selectedItemId?: number | null; // usagePlanId (id phiếu) cần chuyển xử lý - single selection
  selectedItemIds?: number[]; // Danh sách ids cho multi-selection
  currentNode: number | null; // node hiện tại trong quy trình (nodeId)
  disabled?: boolean; // Disable button nếu cần
  onSuccess?: () => void; // Callback sau khi transfer thành công (ví dụ: refetch, clear selection)
  className?: string; // Class tùy chỉnh cho button
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

  // Set leaders for orgs (Angular parity: haveLeader, leaderId, leaderFullname, leaderPositionName)
  const setLeaders = (items: OrganizationItem[]) => {
    items.forEach((item) => {
      if (item.type === "organization" && item.children) {
        const leaderChild = item.children.find(
          (child) => child.type === "person" && (child as any).lead === true
        );
        if (leaderChild) {
          (item as any).haveLeader = true;
          item.leaderId = leaderChild.id;
          (item as any).leaderFullname = leaderChild.name;
          (item as any).leaderPositionName = (leaderChild as any).positionName;
        } else {
          (item as any).haveLeader = false;
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
          const keep = pruneNode(child);
          return keep;
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

// Component TransferHandler riêng biệt
export function TransferHandler({
  selectedItemId,
  selectedItemIds,
  currentNode,
  disabled = false,
  onSuccess,
  className = "",
}: TransferHandlerProps) {
  const router = useRouter();
  const [isTransferDropdownOpen, setIsTransferDropdownOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [orgData, setOrgData] = useState<OrganizationItem[]>([]);
  const transferMutation = useTransferHandleList();

  // Xác định danh sách items cần xử lý (hỗ trợ cả single và multi-selection)
  const itemsToProcess =
    selectedItemIds && selectedItemIds.length > 0
      ? selectedItemIds
      : selectedItemId
        ? [selectedItemId]
        : [];
  const hasItems = itemsToProcess.length > 0;

  // Fetch start nodes khi currentNode là null (như Angular getStartNode)
  const { data: startNodesData } = useGetStartNodes(
    Constant.THREAD_TYPE.OUTCOMING, // THREAD_TYPE.OUTCOMING từ Angular
    false,
    hasItems && !currentNode // Chỉ fetch khi có items nhưng không có currentNode
  );

  // Fetch next nodes (roles) dựa trên currentNode (như Angular getNextNode)
  const { data: nextNodesData } = useGetNextNodes(
    currentNode // Chỉ fetch nếu có currentNode
  );

  // Combine data - ưu tiên nextNodesData nếu có, không thì dùng startNodesData
  const TransferRolesData = nextNodesData || startNodesData;

  const handleRoleClick = async (role: BpmnResponse) => {
    setSelectedRole(role);
    setIsTransferDropdownOpen(false);
    try {
      const orgs = await VehicleService.getAllOrganizations();
      let users = await VehicleService.getUsersForNode(role.id);
      // Sort users by positionOrder if available (matching Angular)
      if (users && users.length > 0 && "positionOrder" in users[0]) {
        users = users.sort(
          (a: any, b: any) => (a.positionOrder || 0) - (b.positionOrder || 0)
        );
      }
      const tree = buildFilteredOrganizationTree(orgs, users);
      setOrgData(tree);
      setIsTransferDialogOpen(true);
    } catch (err) {
      console.error("Error fetching data for transfer dialog:", err);
    }
  };

  const handleTransferDialogSubmit = async (submitData: {
    processingContent: string;
    mainProcessors: number[];
    selectedRoleId: number;
  }) => {
    if (itemsToProcess.length === 0 || !selectedRole || !currentNode) {
      console.error("No items, role, or currentNode selected");
      return;
    }

    // Xử lý single hoặc multi-selection
    if (Constant.MULTI_TRANSFER_H05 && itemsToProcess.length > 1) {
      // Multi-transfer: gửi từng item một
      for (const itemId of itemsToProcess) {
        const transferBody = {
          usagePlanId: itemId,
          comment: submitData.processingContent,
          handler: submitData.mainProcessors,
          currentNode,
          nextNode: submitData.selectedRoleId,
        };

        try {
          await transferMutation.mutateAsync(transferBody);
        } catch (error) {
          console.error(`Lỗi chuyển xử lý phiếu ${itemId}:`, error);
          return; // Dừng lại nếu có lỗi
        }
      }

      setIsTransferDialogOpen(false);
      if (onSuccess) onSuccess();
    } else {
      // Single transfer
      const transferBody = {
        usagePlanId: itemsToProcess[0]!,
        comment: submitData.processingContent,
        handler: submitData.mainProcessors,
        currentNode,
        nextNode: submitData.selectedRoleId,
      };

      transferMutation.mutate(transferBody, {
        onSuccess: () => {
          setIsTransferDialogOpen(false);
          if (onSuccess) onSuccess();
        },
        onError: (err) => {
          console.error("Lỗi chuyển xử lý phiếu:", err);
        },
      });
    }
  };
  return (
    <>
      <DropdownMenu
        open={isTransferDropdownOpen}
        onOpenChange={setIsTransferDropdownOpen}
      >
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            disabled={
              disabled ||
              !hasItems ||
              !TransferRolesData ||
              TransferRolesData.length === 0
            }
            className={`text-white hover:text-white bg-blue-600 hover:bg-blue-700 h-9 px-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
          >
            <Redo2 className="w-4 h-4 mr-1" />
            Chuyển xử lý
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48">
          {TransferRolesData && TransferRolesData.length > 0 ? (
            TransferRolesData.map((role, index) => (
              <DropdownMenuItem
                key={index}
                className="cursor-pointer"
                onClick={() => handleRoleClick(role)}
              >
                {role.name}
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled>
              Không có bước tiếp theo
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <TransferDialog
        isOpen={isTransferDialogOpen}
        onOpenChange={setIsTransferDialogOpen}
        onClose={() => setIsTransferDialogOpen(false)}
        onSubmit={handleTransferDialogSubmit}
        selectedRole={selectedRole}
        organizationData={orgData}
      />
    </>
  );
}
