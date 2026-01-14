"use client";
import { TransferDialog } from "@/components/dialogs/TransferDialog";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Organization, OrganizationItem, User } from "@/definitions";
import {
  useGetNextNode,
  useGetStartNode,
  useTransferNode,
} from "@/hooks/data/workflow.data";
import { VehicleService } from "@/services/vehicle.service";
import workflowService from "@/services/workflow.service";
import { ArrowRight, ChevronDown } from "lucide-react";
import { useState } from "react";
interface TransferHandlerProps {
  selectedItemId?: number | null;
  selectedItemIds?: number[];
  currentNode: number | null;
  disabled?: boolean;
  onSuccess?: () => void;
  className?: string;
  formType: string; // e.g., "HOTEL" or room form type
  formId?: string;
}
interface BpmnResponse {
  id: number;
  name: string;
}
// Build filtered organization tree
function buildFilteredOrganizationTree(
  orgs: Organization[],
  users: User[]
): OrganizationItem[] {
  const isOrgLevel = users.length === 0;
  // Collect unique target org IDs from users (orgs that have relevant users for the node)
  let targetOrgIds: Set<number>;
  if (isOrgLevel) {
    // Nếu users = [], hiển thị toàn bộ cây tổ chức (all orgs), giả sử đây là trường hợp chọn tổ chức thay vì user
    targetOrgIds = new Set(orgs.map((o) => o.id));
  } else {
    targetOrgIds = new Set(
      users
        ?.map((u) => u.org)
        .filter((id): id is number => id !== undefined && id !== null)
    );
  }
  if (targetOrgIds.size === 0 && !isOrgLevel) {
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
  // Add users as children to their orgs (only relevant users) - chỉ nếu không phải isOrgLevel
  if (!isOrgLevel) {
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
  }
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
  // Nhưng nếu isOrgLevel = true, giữ lại các org ngay cả khi không có children (vì chọn org)
  const pruneEmptyOrgs = (tree: OrganizationItem[]) => {
    const pruneNode = (node: OrganizationItem): boolean => {
      if (node.type === "person") return true;
      if (node.children) {
        node.children = node.children.filter((child) => {
          const keep = pruneNode(child);
          return keep;
        });
      }
      // Keep org only if it has children left OR if isOrgLevel
      if (node.type === "organization") {
        const hasChild = !!(node.children && node.children.length > 0);
        node.hasChildren = hasChild;
        return isOrgLevel || hasChild;
      }
      return true;
    };
    // Prune and filter top-level
    for (let i = tree.length - 1; i >= 0; i--) {
      pruneNode(tree[i]);
      if (
        tree[i].type === "organization" &&
        (!tree[i].children || tree[i].children!.length === 0) &&
        !isOrgLevel
      ) {
        tree.splice(i, 1);
      }
    }
  };
  pruneEmptyOrgs(showTree);
  return showTree;
}
export function TransferHandler({
  selectedItemId,
  selectedItemIds,
  currentNode,
  disabled = false,
  onSuccess,
  className = "",
  formType,
  formId,
}: TransferHandlerProps) {
  const [isTransferDropdownOpen, setIsTransferDropdownOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<{
    id: number;
    name: string;
  } | null>(null);
  const [orgData, setOrgData] = useState<OrganizationItem[]>([]);

  const { mutate: transferNode } = useTransferNode();
  const itemsToProcess =
    selectedItemIds && selectedItemIds.length > 0
      ? selectedItemIds
      : selectedItemId
        ? [selectedItemId]
        : [];
  const hasItems = itemsToProcess.length > 0;
  // Fetch start nodes when currentNode is null
  const { data: startNodesData } = useGetStartNode(
    hasItems && !currentNode ? formType : "",
    formId
  );
  // Fetch next nodes based on currentNode
  const { data: nextNodesData } = useGetNextNode(Number(currentNode));
  // Combine data - prioritize nextNodesData if available
  const transferRolesData =
    (currentNode ? nextNodesData : startNodesData)?.data || [];
  const handleRoleClick = async (role: BpmnResponse) => {
    setSelectedRole(role);
    setIsTransferDropdownOpen(false);
    try {
      const orgs = await VehicleService.getAllOrganizations();
      let users = await workflowService.getNodeUser(role.id);
      if (users && users.length > 0 && "positionOrder" in users[0]) {
        users = users.sort(
          (a: any, b: any) =>
            (a.positionOrder || 999) - (b.positionOrder || 999)
        );
      }
      const tree = buildFilteredOrganizationTree(orgs, users.data);
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
    if (itemsToProcess.length === 0 || !selectedRole) {
      console.error("No items or role selected");
      return;
    }
    // TODO: Implement transfer API call
    // For now, just close dialog and call onSuccess
    const payload = {
      valueId: selectedItemId,
      nodeId: selectedRole?.id,
      userHandleList: submitData.mainProcessors.map((userId) => ({
        userId,
        handleType: "XU_LY_CHINH",
      })),
    };
    await transferNode(payload);
    setIsTransferDialogOpen(false);
    if (onSuccess) onSuccess();
  };
  return (
    <>
      <DropdownMenu
        open={isTransferDropdownOpen}
        onOpenChange={setIsTransferDropdownOpen}
      >
        <DropdownMenuTrigger asChild>
          <Button
            disabled={disabled || !hasItems}
            className={`h-9 px-3 text-white border-0 bg-blue-600 hover:bg-blue-700 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
          >
            <ArrowRight className="w-4 h-4 mr-1" />
            Chuyển xử lý
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48">
          {Array.isArray(transferRolesData) && transferRolesData.length > 0 ? (
            transferRolesData.map((role: BpmnResponse, index: number) => (
              <DropdownMenuItem
                key={index}
                className="cursor-pointer"
                onClick={() => handleRoleClick(role)}
              >
                {role.name}
              </DropdownMenuItem>
            ))
          ) : (
            <DropdownMenuItem disabled>Không có dữ liệu</DropdownMenuItem>
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
        defaultExpanded={false}
      />
    </>
  );
}
