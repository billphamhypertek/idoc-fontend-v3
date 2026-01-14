import { ForwardReceivePlaceDialog } from "@/components/document-in/ForwardReceivePlaceDialog";
import { Button } from "@/components/ui/button";
import { Organization, OrganizationItem } from "@/definitions";
import { UserFromOrg } from "@/definitions/types/document.type";
import { useUserByAuthority } from "@/hooks/data/common.data";
import { useReceivedDocument } from "@/hooks/data/document-in.data";
import { useGetOrganizations } from "@/hooks/data/organization.data";
import { ListCheck } from "lucide-react";
import { useEffect, useState } from "react";

interface Props {
  selectedItemId: number | null;
  onSuccess: () => void;
}

function buildFilteredOrganizationTree(
  orgs: Organization[],
  users: UserFromOrg[]
): OrganizationItem[] {
  // Collect unique target org IDs from users (orgs that have relevant users for the node)
  const targetOrgIds = new Set(
    users
      .map((u) => u.orgId)
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
    const orgId = user.orgId;
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

  // // Helper to find root for a target org ID
  // const findRoot = (orgId: number): OrganizationItem | null => {
  //   let currentId: number | undefined = orgId;
  //   while (currentId !== undefined) {
  //     const org = orgMap.get(currentId);
  //     if (!org || org.parentId === undefined) {
  //       return org || null;
  //     }
  //     currentId = org.parentId;
  //   }
  //   return null;
  // };

  // // Build showTree: add unique roots containing target orgs
  // const showTree: OrganizationItem[] = [];
  // const addedRoots = new Set<number>();
  // targetOrgIds.forEach((targetId) => {
  //   const root = findRoot(targetId);
  //   if (root && !addedRoots.has(root.id)) {
  //     showTree.push(root);
  //     addedRoots.add(root.id);
  //   }
  // });

  // Build showTree: get all root nodes (parentId == null) - similar to Angular's creatDataTree
  // In Angular: parents are orgs with parentId == null, they are displayed at the top level
  // When expanded, they show their children (orgs with parentId pointing to them)
  const showTree: OrganizationItem[] = [];
  orgMap.forEach((org) => {
    const isRoot =
      org.type === "organization" &&
      (org.parentId === undefined || org.parentId === null);
    if (isRoot) {
      showTree.push(org);
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
          (child) => child.type === "person" && (child as any).lead === true // Assume User has lead field
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

  // // Prune empty org branches (remove org nodes with no children after adding users)
  // const pruneEmptyOrgs = (tree: OrganizationItem[]) => {
  //   const pruneNode = (node: OrganizationItem): boolean => {
  //     if (node.type === "person") return true;

  //     if (node.children) {
  //       node.children = node.children.filter((child) => {
  //         return pruneNode(child);
  //       });
  //     }

  //     // Keep org only if it has children left
  //     if (node.type === "organization") {
  //       return !!(node?.children && node?.children?.length > 0);
  //     }

  //     return true;
  //   };

  //   // Prune and filter top-level
  //   for (let i = tree.length - 1; i >= 0; i--) {
  //     pruneNode(tree[i]);
  //     if (
  //       tree[i].type === "organization" &&
  //       (!tree[i].children || tree[i].children!.length === 0)
  //     ) {
  //       tree.splice(i, 1);
  //     }
  //   }
  // };
  // pruneEmptyOrgs(showTree);

  // Prune empty org branches (remove org nodes with no children after adding users)
  // BUT: Keep root nodes (level 0) even if they have no children - they should be displayed
  // AND: Keep all org nodes (including child orgs) - they should be displayed like in Angular
  // Only prune org leaf nodes that have no children and no users
  const pruneEmptyOrgs = (tree: OrganizationItem[]) => {
    const pruneNode = (node: OrganizationItem): boolean => {
      if (node.type === "person") return true;

      // Recursively prune children first
      if (node.children) {
        node.children = node.children.filter((child) => {
          return pruneNode(child);
        });
      }

      // For org nodes: Always keep them (like Angular behavior)
      // All orgs should be displayed, even if they have no children or users
      if (node.type === "organization") {
        return true; // Always keep org nodes
      }

      return true;
    };

    // Prune children of root nodes, but keep root nodes themselves
    for (let i = tree.length - 1; i >= 0; i--) {
      const rootNode = tree[i];
      // Prune children of root node (but this will keep all org nodes now)
      if (rootNode.children) {
        rootNode.children = rootNode.children.filter((child) => {
          return pruneNode(child);
        });
      }
      // Don't remove root nodes even if they have no children - they should be displayed
      // This matches Angular behavior where root orgs are shown at top level
    }
  };
  pruneEmptyOrgs(showTree);

  return showTree;
}

export default function ForwardReceivePlace({
  selectedItemId,
  onSuccess,
}: Props) {
  const [isDialogOpen, setDialogOpen] = useState(false);
  const [orgData, setOrgData] = useState<OrganizationItem[]>([]);
  const [orgSent, setOrgSent] = useState<OrganizationItem[]>([]);
  const { data: organizations } = useGetOrganizations({ active: "true" });
  const { data: users } = useUserByAuthority();
  const { data: receivedDocument } = useReceivedDocument(
    String(selectedItemId)
  );
  useEffect(() => {
    let orderedUser = users;
    if (users && users.length > 0 && "positionOrder" in users[0]) {
      orderedUser = users.sort(
        (a: UserFromOrg, b: UserFromOrg) =>
          (a.positionOrder || 0) - (b.positionOrder || 0)
      );
    }
    const tree = buildFilteredOrganizationTree(
      organizations ?? [],
      orderedUser ?? []
    );
    setOrgData(tree);
  }, [organizations, users]);

  useEffect(() => {
    if (receivedDocument && receivedDocument.length > 0 && orgData.length > 0) {
      const ids = receivedDocument.map(
        (item: { id: string; type: "ORG" | "USER" }) => item.id
      );

      const flattened = flattenData(orgData);

      // Create a Set for faster lookup - convert all to strings for consistent comparison
      const idsSet = new Set(ids.map((id) => String(id).trim()));

      const inputData = flattened.filter((item) => {
        const itemIdStr = String(item.id).trim();
        const found = idsSet.has(itemIdStr);
        return found;
      });

      setOrgSent(inputData);
    }
  }, [selectedItemId, receivedDocument, orgData]);

  const flattenData = (
    items: OrganizationItem[]
  ): (OrganizationItem & { level: number })[] => {
    return items.flatMap((item) => {
      const row = item;
      const children = item.children ? flattenData(item.children) : [];
      return [row, ...children];
    });
  };

  return (
    <>
      <Button
        variant="outline"
        className="text-white border-0 h-9 px-3 text-xs disabled:opacity-50 disabled:cursor-not-allowed hover:text-white bg-blue-600 hover:bg-blue-700"
        onClick={() => setDialogOpen(true)}
      >
        <ListCheck className="w-4 h-4 mr-1" />
        Chuyển nơi nhận công văn
      </Button>

      <ForwardReceivePlaceDialog
        docId={String(selectedItemId)}
        orgSent={orgSent}
        isOpen={isDialogOpen}
        onOpenChange={setDialogOpen}
        onClose={() => setDialogOpen(false)}
        orgData={orgData}
        onSuccess={onSuccess}
      />
    </>
  );
}
