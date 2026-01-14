import React, { useEffect, useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Organization, OrganizationItem } from "@/definitions";
import { Building, Users, X } from "lucide-react";
import { useGetAllOrganizations } from "@/hooks/data/vehicle.data";
import { useUserByAuthority } from "@/hooks/data/common.data";
import { InteralReceivePlaceDialog } from "@/components/document-in/InternalReceivePlaceDialog";
import { ReceiveToKnow, UserFromOrg } from "@/definitions/types/document.type";

interface Props {
  data: ReceiveToKnow[];
  onSubmit: (items: ReceiveToKnow[]) => void;
}

function buildFilteredOrganizationTree(
  orgs: Organization[],
  users: UserFromOrg[]
): OrganizationItem[] {
  // Build orgMap with all organizations (like Angular)
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

  // Add users as children to their orgs
  users.forEach((user) => {
    const orgId = user.orgId;
    if (orgId !== undefined && orgId !== null) {
      const org = orgMap.get(orgId);
      if (org) {
        // Add user at the beginning like Angular's unshift
        org.children!.unshift({
          id: user.id,
          name: user.fullName,
          type: "person",
          hasChildren: false,
          level: 0, // Will be set later
          parentId: orgId,
          lead: user.lead,
          positionName: user.positionName,
        });
        org.hasChildren = true;
      }
    }
  });

  // Build hierarchy - find root orgs and attach children
  const rootOrgs: OrganizationItem[] = [];
  orgMap.forEach((org) => {
    if (org.parentId === undefined || org.parentId === null) {
      // This is a root organization
      rootOrgs.push(org);
    } else {
      // This is a child organization, add to parent
      const parent = orgMap.get(org.parentId);
      if (parent) {
        parent.children!.push(org);
        parent.hasChildren = true;
      }
    }
  });

  // Set levels
  const setLevels = (item: OrganizationItem, level: number) => {
    item.level = level;
    if (item.children) {
      item.children.forEach((child) => setLevels(child, level + 1));
    }
  };
  rootOrgs.forEach((root) => setLevels(root, 0));

  // Set leaders for orgs (find direct child user with lead === true)
  const setLeaders = (items: OrganizationItem[]) => {
    items.forEach((item) => {
      if (item.type === "organization" && item.children) {
        const leaderChild = item.children.find(
          (child) => child.type === "person" && child.lead === true
        );
        if (leaderChild) {
          item.leaderId = leaderChild.id;
          item.leaderName = leaderChild.name;
          item.positionName = leaderChild.positionName;
        }
        setLeaders(item.children);
      }
    });
  };
  setLeaders(rootOrgs);

  return rootOrgs;
}

export default function InternalReceivePlace({ data, onSubmit }: Props) {
  const [isInternalReceiveDialogOpen, setInternalReceiveDialogOpen] =
    useState(false);
  const [internalReceive, setInternalReceive] = useState<OrganizationItem[]>(
    []
  );
  const [orgData, setOrgData] = useState<OrganizationItem[]>([]);
  const { data: organizations } = useGetAllOrganizations();
  const { data: users } = useUserByAuthority();

  // Memoized computed values
  const orderedUsers = useMemo(() => {
    if (!users || users.length === 0) return [];
    if ("positionOrder" in users[0]) {
      return users.sort(
        (a: UserFromOrg, b: UserFromOrg) =>
          (a.positionOrder || 0) - (b.positionOrder || 0)
      );
    }
    return users;
  }, [users]);

  const userById = useMemo(
    () => new Map(users?.map((u) => [u.id, u])),
    [users]
  );

  const orgById = useMemo(
    () => new Map(organizations?.map((org) => [org.id, org])),
    [organizations]
  );

  // Memoized functions
  const flattenData = useCallback(
    (items: OrganizationItem[]): (OrganizationItem & { level: number })[] => {
      return items.flatMap((item) => {
        const row = item;
        const children = item.children ? flattenData(item.children) : [];
        return [row, ...children];
      });
    },
    []
  );

  const buildUser = useCallback(
    (internalReceive: OrganizationItem[]) => {
      return internalReceive
        .filter((item) => item.type === "person")
        .map((item) => {
          const user = userById.get(item.id);
          if (!user) return null;
          return {
            type: "USER",
            receiveId: item.id,
            fullName: user.fullName,
            orgId: user.orgId,
            positionName: user.positionName,
            id: item.id,
            userId: user.id,
            orgName: "",
          } satisfies ReceiveToKnow;
        })
        .filter((x): x is ReceiveToKnow => x !== null);
    },
    [userById]
  );

  const buildOrg = useCallback(
    (internalReceive: OrganizationItem[]) => {
      return internalReceive
        .filter((item) => item.type === "organization")
        .map((item) => {
          const org = orgById.get(item.id);
          if (!org) return null;
          return {
            type: "ORG",
            receiveId: item.id,
            fullName: org.name,
            orgId: org.id,
            positionName: org.name,
            id: item.id,
            userId: org.id,
            orgName: "",
          } satisfies ReceiveToKnow;
        })
        .filter((x): x is ReceiveToKnow => x !== null);
    },
    [orgById]
  );

  const buildItemFromSelected = useCallback(
    (internalReceive: OrganizationItem[]): ReceiveToKnow[] => {
      return [...buildUser(internalReceive), ...buildOrg(internalReceive)];
    },
    [buildUser, buildOrg]
  );

  const handleAdd = useCallback(
    (items: OrganizationItem[]) => {
      setInternalReceive(items);
      const item = buildItemFromSelected(items);
      console.log(item);
      onSubmit(item);
    },
    [buildItemFromSelected, onSubmit]
  );

  const handleRemove = useCallback((item: OrganizationItem) => {
    setInternalReceive((prev) => prev.filter((i) => i.id !== item.id));
  }, []);

  const handleOpenDialog = useCallback(() => {
    setInternalReceiveDialogOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setInternalReceiveDialogOpen(false);
  }, []);

  useEffect(() => {
    const tree = buildFilteredOrganizationTree(
      organizations ?? [],
      orderedUsers ?? []
    );
    setOrgData(tree);
  }, [organizations, orderedUsers]);

  useEffect(() => {
    if (data) {
      const ids = data.map((item) => item.receiveId);
      const inputData = flattenData(orgData).filter((item) =>
        ids.includes(item.id)
      );
      setInternalReceive(inputData);
    }
  }, [data, orgData, flattenData]);

  return (
    <div className="flex flex-col space-y-3">
      <div className="flex items-center gap-3">
        <Button
          variant={"outline"}
          onClick={handleOpenDialog}
          className="flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 hover:text-white border-none w-[220px]"
        >
          <Building className="w-4 h-4 mr-2 text-white" />
          Thêm nơi nhận nội bộ
        </Button>
        <span className="text-sm font-medium text-gray-600 flex items-center">
          {internalReceive.length} nơi nhận
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {internalReceive.map((item) => {
          const isOrg = item.type === "organization";
          const colorClass = isOrg ? "text-blue-600" : "text-red-600";

          return (
            <span
              key={item.id}
              className="inline-flex items-center px-3 py-2 rounded-md bg-gray-100 text-sm border"
            >
              {isOrg ? (
                <Building className={`mr-2 w-4 h-4 ${colorClass}`} />
              ) : (
                <Users className={`mr-2 w-4 h-4 ${colorClass}`} />
              )}
              <span className={`truncate max-w-xs ${colorClass} font-medium`}>
                {item.name}
              </span>
              <X
                className="ml-2 w-4 h-4 cursor-pointer text-gray-500 hover:text-red-600 transition-colors"
                onClick={() => handleRemove(item)}
              />
            </span>
          );
        })}
      </div>

      <InteralReceivePlaceDialog
        data={internalReceive}
        setData={handleAdd}
        isOpen={isInternalReceiveDialogOpen}
        onOpenChange={setInternalReceiveDialogOpen}
        onClose={handleCloseDialog}
        orgData={orgData}
      />
    </div>
  );
}
