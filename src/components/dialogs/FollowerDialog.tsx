"use client";
import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableBase,
} from "@/components/ui/table";
import { Button } from "../ui/button";
import {
  Building,
  ChevronDown,
  ChevronRightIcon,
  User,
  FileCheck,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  useFindFollower,
  useGetOrgTreeById,
  useOrganizations,
} from "@/hooks/data/task.data";
import {
  useGetAllUserByLead,
  useGetUserOrgAndSubOrgWithAuthority,
} from "@/hooks/data/user.data";
import { OrgNode, UserFollower } from "@/definitions/types/task-assign.type";
import { handleError } from "@/utils/common.utils";

interface FollowerDialogProps {
  isOpen: boolean;
  isFollow: boolean;
  onClose: () => void;
  taskId?: string | number;
  selectedWorkItem?: {
    workName?: string;
    id?: string | number;
  };
  initialFollowers?: UserFollower[];
  onConfirm?: (selectedFollowers: OrgNode[]) => void;
  title?: string | null;
  isV2?: boolean;
}

export default function FollowerDialog({
  isOpen,
  isFollow,
  onClose,
  taskId,
  selectedWorkItem,
  initialFollowers = [],
  onConfirm,
  title = "Chọn người theo dõi",
  isV2 = false,
}: FollowerDialogProps) {
  const [expandedUnits, setExpandedUnits] = useState<string[]>([]);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [orgList, setOrgList] = useState<OrgNode[]>([]);
  const [userList, setUserList] = useState<OrgNode[]>([]);
  const [listUserTmp, setListUserTmp] = useState<OrgNode[]>([]);
  const [listUserFollowingTask, setListUserFollowingTask] = useState<
    UserFollower[]
  >([]);
  const [organizationalData, setOrganizationalData] = useState<OrgNode[]>([]);
  const [selectedFollowers, setSelectedFollowers] = useState<string[]>([]);

  const { mutateAsync: findFollower } = useFindFollower(isV2 ?? false);
  const { mutateAsync: getAllUserByLead } = useGetAllUserByLead();
  const { mutateAsync: getOrgTreeById } = useGetOrgTreeById();
  const { mutateAsync: getOrganizations } = useOrganizations();
  const { mutateAsync: getUserOrgWithAuthority } =
    useGetUserOrgAndSubOrgWithAuthority();

  useEffect(() => {
    if (!isOpen) {
      setSelectedFollowers([]);
      setListUserTmp([]);
      return;
    }

    const init = async () => {
      try {
        const userInfoRaw = localStorage.getItem("userInfo") || "{}";
        const userInfo: { org?: string } = JSON.parse(userInfoRaw);
        const currentOrgId: string | null = userInfo?.org ?? null;
        setOrgId(currentOrgId);

        if (isFollow) {
          await getOrgFollowList(currentOrgId);
        } else {
          await getOrgList(currentOrgId);
        }
      } catch (err) {
        console.error("Init lỗi:", err);
      }
    };

    init();
  }, [isFollow, isOpen, initialFollowers]);

  const getOrgList = async (orgIdParam: string | null) => {
    if (!orgIdParam) return;
    try {
      const res: Array<{ child: string; name: string; parent: string }> =
        await getOrgTreeById(orgIdParam);
      const mapped: OrgNode[] = (res || []).map((item) => ({
        id: `${item.child}`,
        name: item.name,
        parentId: item.child === orgIdParam ? null : item.parent,
        type: "ORG",
      }));
      setOrgList(mapped);
      await getUserOrgAndSubOrgWithAuthority(orgIdParam);
    } catch (err) {
      console.error("Lỗi getOrgList:", err);
    }
  };

  const getOrgFollowList = async (currentOrgId: string | null) => {
    try {
      const res = await getOrganizations();
      const arr = res?.data ?? res ?? [];
      const mapped = (arr || []).map((item: any) => ({
        id: `${item.id}`,
        name: item.name,
        parentId: item.id === currentOrgId ? null : (item.parentId ?? null),
        type: "ORG",
      }));

      setOrgList(mapped);

      await loadFollowerData(selectedWorkItem?.id?.toString(), mapped);
    } catch (error) {
      console.error("Lỗi khi lấy danh sách tổ chức theo dõi:", error);
    }
  };

  const getUserOrgAndSubOrgWithAuthority = async (orgIdParam: string) => {
    try {
      const res: { data?: Array<any> } | Array<any> =
        await getUserOrgWithAuthority({
          orgId: orgIdParam,
          authority: "LEADERSHIP_UNIT",
        });
      const arr: Array<any> = (res as any)?.data ?? res ?? [];

      const mapped: OrgNode[] = (arr || []).map((item: any) => {
        const matched = initialFollowers.find(
          (ele) =>
            ele.user?.id === item.id || String(ele.user?.id) === String(item.id)
        );
        return {
          id: `${item.id}`,
          name: item.fullName,
          parentId: item.orgId != null ? String(item.orgId) : null,
          positionName: item.positionName,
          description: matched
            ? (matched.user?.description ?? matched.description)
            : null,
          orgName: item.orgName,
          type: "USER",
          lead: !!item.lead,
          isChecked: !!matched,
          isExcute: !!(matched
            ? (matched.user?.isExcute ?? matched.isExcute)
            : false),
          isCombination: !!(matched
            ? (matched.user?.isCombination ?? matched.isCombination)
            : false),
          disabled: !!matched,
        };
      });

      setUserList(mapped);

      const checkedUsers = mapped.filter((i) => i.isChecked);
      setListUserTmp(checkedUsers);

      // Set selectedFollowers from checked users
      const selectedIds = checkedUsers.map((u) => u.id);
      setSelectedFollowers(selectedIds);

      setOrgList((prev) => [...mapped, ...prev]);

      const tree = createDataTree([...mapped, ...orgList]);
      setOrganizationalData(tree);

      // Auto-expand all organization nodes
      const orgIds = tree
        .filter(
          (item) =>
            item.type === "ORG" && item.children && item.children.length > 0
        )
        .map((item) => item.id);

      // Collect parent IDs of checked items to auto-expand
      const checkedIds = new Set<string>();
      const parentIds = new Set<string>();
      collectParentIds(tree, checkedIds, parentIds, tree);

      // Combine org IDs with parent IDs of checked items
      const allExpandedIds = Array.from(
        new Set([...orgIds, ...Array.from(parentIds)])
      );
      setExpandedUnits(allExpandedIds);
    } catch (err) {
      handleError(err);
    }
  };

  const loadFollowerData = async (
    taskIdStr?: string,
    organizations?: OrgNode[]
  ) => {
    try {
      const followersResp: { data?: UserFollower[] } | UserFollower[] | null =
        taskIdStr ? await findFollower(taskIdStr) : null;
      const followers: UserFollower[] =
        (followersResp as any)?.data ?? followersResp ?? [];
      setListUserFollowingTask(followers);

      const allUsersResp: { data?: any[] } | any[] = await getAllUserByLead();
      const allUsers: any[] = (allUsersResp as any)?.data ?? allUsersResp ?? [];

      const userListMapped: OrgNode[] = allUsers.map((item: any) => {
        const userFromFollowers = (followers || []).find(
          (ele: UserFollower) => ele.userId === item.id
        );
        const userFromInitial = initialFollowers.find(
          (ele) =>
            ele.user?.id === item.id || String(ele.user?.id) === String(item.id)
        );
        const isChecked = !!(userFromFollowers || userFromInitial);

        return {
          id: `${item.id}`,
          name: item.fullName,
          parentId: item.orgId != null ? String(item.orgId) : null,
          positionName: item.positionName,
          description:
            (userFromFollowers?.description as string | null | undefined) ??
            (userFromInitial?.user?.description as string | null | undefined) ??
            null,
          orgName: item.orgName,
          type: "USER",
          lead: !!item.lead,
          isChecked,
          isExcute: !!(
            userFromFollowers?.isExcute ??
            userFromInitial?.user?.isExcute ??
            false
          ),
          isCombination: !!(
            userFromFollowers?.isCombination ??
            userFromInitial?.user?.isCombination ??
            false
          ),
          disabled: !!(userFromInitial || userFromFollowers),
        };
      });

      setUserList(userListMapped);

      const checkedUsers = userListMapped.filter((u) => u.isChecked);
      setListUserTmp(checkedUsers);

      if (!organizations) {
        organizations = [];
      }
      const merged = [...userListMapped, ...organizations];
      const tree = createDataTree(merged);
      setOrganizationalData(tree);

      const selectedIds = checkedUsers.map((u) => u.id);
      setSelectedFollowersFromIds(selectedIds);

      // Auto-expand all organization nodes
      const orgIds = tree
        .filter(
          (item) =>
            item.type === "ORG" && item.children && item.children.length > 0
        )
        .map((item) => item.id);

      // Collect parent IDs of checked items to auto-expand
      const checkedIds = new Set<string>();
      const parentIds = new Set<string>();
      collectParentIds(tree, checkedIds, parentIds, tree);

      // Combine org IDs with parent IDs of checked items
      const allExpandedIds = Array.from(
        new Set([...orgIds, ...Array.from(parentIds)])
      );
      setExpandedUnits(allExpandedIds);
    } catch (error) {
      console.error("Lỗi khi loadFollowerData:", error);
    }
  };

  /* ---------- create tree helper ---------- */
  const createDataTree = (flatList: OrgNode[]): OrgNode[] => {
    const map = new Map<string, OrgNode & { children: OrgNode[] }>();
    const roots: (OrgNode & { children: OrgNode[] })[] = [];

    flatList.forEach((item) => {
      const clone: OrgNode & { children: OrgNode[] } = {
        ...item,
        children: [],
      };
      map.set(item.id, clone);
    });

    map.forEach((node) => {
      const parentId = node.parentId == null ? null : String(node.parentId);
      if (parentId && map.has(parentId)) {
        const parent = map.get(parentId)!;
        parent.children = parent.children || [];
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  };

  // Helper function to check if a node has any checked items
  const hasCheckedItem = (node: OrgNode): boolean => {
    if (node.type === "USER" && node.isChecked) {
      return true;
    }
    if (node.children && node.children.length > 0) {
      return node.children.some((child) => hasCheckedItem(child));
    }
    return false;
  };

  // Helper function to collect all parent IDs of checked items
  const collectParentIds = (
    nodes: OrgNode[],
    checkedIds: Set<string>,
    parentIds: Set<string>,
    tree: OrgNode[]
  ): void => {
    nodes.forEach((node) => {
      if (node.type === "USER" && node.isChecked) {
        checkedIds.add(node.id);
        // Add all parent IDs up to root
        let currentParentId = node.parentId;
        while (currentParentId) {
          parentIds.add(String(currentParentId));
          // Find parent node to get its parentId
          const findParent = (nodes: OrgNode[]): string | null => {
            for (const n of nodes) {
              if (n.id === String(currentParentId)) {
                return n.parentId ? String(n.parentId) : null;
              }
              if (n.children) {
                const found = findParent(n.children);
                if (found !== null) return found;
              }
            }
            return null;
          };
          currentParentId = findParent(tree);
        }
      }
      if (node.children && node.children.length > 0) {
        collectParentIds(node.children, checkedIds, parentIds, tree);
        // If any child is checked, expand this node
        if (
          node.type === "ORG" &&
          node.children.some((child) => hasCheckedItem(child))
        ) {
          parentIds.add(node.id);
        }
      }
    });
  };

  const setSelectedFollowersFromIds = (ids: string[]) => {
    setSelectedFollowers(ids);
  };

  const toggleUnitExpansion = (unitId: string) => {
    setExpandedUnits((prev) =>
      prev.includes(unitId)
        ? prev.filter((id) => id !== unitId)
        : [...prev, unitId]
    );
  };

  const handleFollowerToggle = (followerId: string) => {
    setSelectedFollowers((prev) =>
      prev.includes(followerId)
        ? prev.filter((id) => id !== followerId)
        : [...prev, followerId]
    );

    const found = [...userList, ...orgList].find((u) => u.id === followerId);
    if (!found) return;
    setListUserTmp((prev) => {
      if (prev.find((p) => p.id === followerId)) {
        return prev.filter((p) => p.id !== followerId);
      } else {
        return [...prev, found];
      }
    });
  };

  const handleConfirmFollowers = async () => {
    try {
      if (onConfirm) {
        const userExcute = listUserTmp.find((item) => item.isExcute);
        const normalized = listUserTmp.map((item, index) => {
          const isMain = userExcute ? userExcute.id === item.id : index === 0;

          return {
            ...item,
            isExcute: isMain,
            isCombination: !isMain,
          };
        });

        onConfirm(normalized);
      }

      onClose();
    } catch (error) {
      console.error("Lỗi khi lưu người theo dõi:", error);
    }
  };

  // Strictly type the tree rendering
  const renderOrgTree = (
    items: OrgNode[],
    level: number = 0
  ): React.ReactNode => {
    return items
      .filter(
        (item) =>
          !(
            item.type === "ORG" &&
            (!item.children || item.children.length === 0)
          )
      )
      .map((item) => (
        <React.Fragment key={item.id}>
          <TableRow className={item.type === "ORG" ? "bg-gray-50" : ""}>
            <TableCell
              className="py-2"
              style={{ paddingLeft: `${level * 32 + 8}px` }}
            >
              <div className="flex items-center space-x-2">
                {item.children && item.children.length > 0 && (
                  <button
                    onClick={() => toggleUnitExpansion(item.id)}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    {expandedUnits.includes(item.id) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRightIcon className="w-4 h-4" />
                    )}
                  </button>
                )}
                {!item.children && <div className="w-6" />}
                {item.type === "USER" ? (
                  <User className="w-4 h-4 text-gray-600" />
                ) : (
                  <Building className="w-4 h-4 text-gray-600" />
                )}
                <span className={item.type === "USER" ? "" : "font-medium"}>
                  {item.name}
                </span>
              </div>
            </TableCell>
            <TableCell className="py-2 text-center">
              {item.type === "USER" && (
                <Checkbox
                  checked={selectedFollowers.includes(item.id)}
                  onCheckedChange={() => handleFollowerToggle(item.id)}
                />
              )}
            </TableCell>
          </TableRow>

          {item.children &&
            expandedUnits.includes(item.id) &&
            renderOrgTree(item.children, level + 1)}
        </React.Fragment>
      ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{title ?? "Chọn người theo dõi"}</DialogTitle>
        </DialogHeader>

        <div className="py-4 max-h-[60vh] overflow-y-auto">
          <div className="border rounded-lg">
            <TableBase>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-3/4 font-bold">
                    Tên đơn vị, cá nhân
                  </TableHead>
                  <TableHead className="w-1/4 text-center font-bold">
                    Chọn
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizationalData && organizationalData.length > 0 ? (
                  renderOrgTree(organizationalData)
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={2}
                      className="text-center py-4 text-gray-500"
                    >
                      Đang tải dữ liệu...
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </TableBase>
          </div>
        </div>

        <DialogFooter className="justify-end gap-2">
          <Button
            onClick={handleConfirmFollowers}
            size="sm"
            className="h-9 px-3 text-sm bg-blue-600 hover:bg-blue-700"
          >
            <FileCheck className="w-4 h-4" />
            Đồng ý
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
