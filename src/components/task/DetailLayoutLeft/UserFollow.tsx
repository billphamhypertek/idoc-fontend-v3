"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import * as React from "react";
import { UserService } from "@/services/user.service";
import { handleError } from "@/utils/common.utils";
import {
  User,
  Building,
  ChevronDown,
  ChevronRight,
  FileCheck,
} from "lucide-react";
import { useOrganizations } from "@/hooks/data/task.data";
import { useGetAllUserByLead } from "@/hooks/data/user.data";

interface UserFollowProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  taskId: number;
  currentFollowers: any[];
  onSelectFollowers: (followers: any[]) => void;
  onUpdateFollow?: () => void;
}

interface User {
  id: number;
  fullName: string;
  orgName: string;
  email: string;
  phone: string;
  orgId?: number;
  type?: "USER" | "ORG";
  isChecked?: boolean;
  childNum?: number;
  parentId?: number;
  positionName?: string;
}

interface TreeDataItem {
  id: string;
  name: string;
  icon?: any;
  selectedIcon?: any;
  openIcon?: any;
  children?: TreeDataItem[];
  actions?: React.ReactNode;
  onClick?: () => void;
  draggable?: boolean;
  droppable?: boolean;
  disabled?: boolean;
  isChecked?: boolean;
  childNum?: number;
  type?: "USER" | "ORG";
  parentId?: string | null;
  orgName?: string;
  positionName?: string;
}

export default function UserFollow({
  isOpen,
  onOpenChange,
  onClose,
  taskId,
  currentFollowers,
  onSelectFollowers,
  onUpdateFollow,
}: UserFollowProps) {
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [treeData, setTreeData] = useState<TreeDataItem[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [listUserTmp, setListUserTmp] = useState<any[]>([]);
  const [listUserFollowingTask, setListUserFollowingTask] = useState<any[]>([]);
  const [orgList, setOrgList] = useState<any[]>([]);
  const [userList, setUserList] = useState<any[]>([]);

  const { mutateAsync: getOrganizations } = useOrganizations();
  const { mutateAsync: getAllUserByLead } = useGetAllUserByLead();

  // Tương tự logic v1: findUserFollowInListUser
  const findUserFollowInListUser = (id: number) => {
    let isChecked: boolean = false;
    let user: any = {};

    // Nếu currentFollowers rỗng, dùng listUserFollowingTask từ API
    if (!currentFollowers || currentFollowers.length === 0) {
      user = listUserFollowingTask.find((item) => item.userId === id);
    } else {
      // Format v1: currentFollowers có user object bên trong với userId
      user = currentFollowers.find((item) => {
        // Check cả item.userId và item.user?.id để tương thích với cả 2 format
        return item.userId === id || item.user?.id === id;
      });
    }

    if (user) {
      isChecked = true;
      return isChecked;
    }
    return isChecked;
  };

  const toggleExpanded = (nodeId: string) => {
    setExpanded((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const renderTreeNode = (
    node: TreeDataItem,
    depth: number = 0
  ): React.ReactNode => {
    const hasChildren = (node.children?.length ?? 0) > 0;
    const isOpen = expanded.has(node.id);
    const isUserNode = node.type === "USER";
    const isOrgNode = node.type === "ORG";

    // Filter: Chỉ hiển thị ORG nodes nếu có children (giống v1 và FollowerDialog)
    if (isOrgNode && !hasChildren) {
      return null;
    }

    return (
      <React.Fragment key={node.id}>
        <tr className="hover:bg-gray-50 border-b border-gray-200">
          <td className="w-4/5 py-2 px-3 border-r-2 border-gray-300">
            <div
              className="flex items-center gap-2"
              style={{ paddingLeft: `${depth * 24}px` }}
            >
              {hasChildren && (
                <Button
                  type="button"
                  aria-label={isOpen ? "Thu gọn" : "Mở rộng"}
                  className="w-4 h-4 rounded hover:bg-gray-100 text-gray-500 inline-flex items-center justify-center bg-transparent border-none outline-none shadow-none"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleExpanded(node.id);
                  }}
                >
                  {isOpen ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
              )}

              {!hasChildren && <div className="w-6" />}

              <div className="flex-shrink-0">{node.icon()}</div>

              <span className={`text-sm ${isUserNode ? "" : "font-medium"}`}>
                {node.name}
              </span>
            </div>
          </td>

          <td className="w-1/5 py-2 px-3 text-center">
            {isUserNode && (
              <Checkbox
                checked={node.isChecked || false}
                onCheckedChange={() => {
                  const userId = parseInt(node.id);
                  const user = allUsers.find((u) => u.id === userId);
                  if (user) {
                    const userObj = {
                      id: user.id,
                      fullName: user.fullName,
                      orgName: user.orgName,
                      orgId: user.orgId,
                      email: user.email,
                      phone: user.phone,
                      positionName: user.positionName,
                    };
                    handleUserSelect(userObj);
                  }
                }}
              />
            )}
          </td>
        </tr>

        {hasChildren && isOpen && (
          <>{node.children?.map((child) => renderTreeNode(child, depth + 1))}</>
        )}
      </React.Fragment>
    );
  };

  useEffect(() => {
    if (isOpen) {
      loadUsers();
      // Reset selected users when dialog opens
      if (currentFollowers && currentFollowers.length > 0) {
        setSelectedUsers(currentFollowers);
      } else {
        setSelectedUsers([]);
      }
    }
  }, [isOpen, currentFollowers]);

  useEffect(() => {
    if (currentFollowers && currentFollowers.length > 0) {
      setSelectedUsers(currentFollowers);
    } else {
      setSelectedUsers([]);
    }
  }, [currentFollowers]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);

      // Lấy userInfo để có orgId
      const userInfoRaw = localStorage.getItem("userInfo") || "{}";
      const userInfo: { org?: string } = JSON.parse(userInfoRaw);
      const currentOrgId: string | null = userInfo?.org ?? null;

      // Load danh sách user đang follow task (nếu có taskId)
      if (taskId) {
        const followingTask = await UserService.doTaskGetListUserFollowingTask(
          taskId.toString()
        );
        setListUserFollowingTask(followingTask || []);
      }

      // Load organizations (giống FollowerDialog)
      const orgsRes = await getOrganizations();
      const orgsArr = (orgsRes as any)?.data ?? orgsRes ?? [];
      const orgsMapped = (orgsArr || []).map((item: any) => ({
        id: `${item.id}`,
        name: item.name,
        parentId: item.id === currentOrgId ? null : (item.parentId ?? null),
        type: "ORG",
      }));
      setOrgList(orgsMapped);

      // Load tất cả users (giống FollowerDialog)
      const usersRes = await getAllUserByLead();
      const usersArr = (usersRes as any)?.data ?? usersRes ?? [];
      setAllUsers(usersArr || []);

      // Map users với check status
      const userListMapped = (usersArr || []).map((item: any) => {
        const userFromFollowers = (listUserFollowingTask || []).find(
          (ele: any) => ele.userId === item.id
        );
        const userFromCurrent = currentFollowers.find(
          (ele: any) => ele.userId === item.id || ele.user?.id === item.id
        );
        const isChecked = !!(userFromFollowers || userFromCurrent);

        return {
          id: `${item.id}`,
          name: item.fullName,
          parentId: item.orgId != null ? String(item.orgId) : null,
          positionName: item.positionName,
          description: null,
          orgName: item.orgName,
          type: "USER",
          lead: !!item.lead,
          isChecked,
          isExcute: false,
          isCombination: false,
          disabled: false,
        };
      });

      setUserList(userListMapped);

      const checkedUsers = userListMapped.filter((u: any) => u.isChecked);
      setListUserTmp(checkedUsers);
      setSelectedUsers(currentFollowers || []);

      // Tạo tree structure (giống FollowerDialog)
      const merged = [...userListMapped, ...orgsMapped];
      const tree = createDataTree(merged);
      setTreeData(tree);

      // Auto-expand all organization nodes
      const orgIds = new Set<string>();
      tree.forEach((item) => {
        if (item.type === "ORG" && item.children && item.children.length > 0) {
          orgIds.add(item.id);
        }
      });
      setExpanded(orgIds);
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function để tạo tree structure (giống FollowerDialog)
  const createDataTree = (flatList: any[]): TreeDataItem[] => {
    const map = new Map<string, TreeDataItem & { children: TreeDataItem[] }>();
    const roots: (TreeDataItem & { children: TreeDataItem[] })[] = [];

    flatList.forEach((item) => {
      const clone: TreeDataItem & { children: TreeDataItem[] } = {
        id: item.id,
        name: item.name,
        isChecked: item.isChecked,
        icon: () =>
          item.type === "USER" ? (
            <User className="w-4 h-4 text-blue-500" />
          ) : (
            <Building className="w-4 h-4 text-gray-600" />
          ),
        children: [],
        type: item.type,
        parentId: item.parentId,
        orgName: item.orgName,
        positionName: item.positionName,
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

  const handleUserSelect = (user: User) => {
    // Format v1: check cả userId và user.id
    const userInList = selectedUsers.find(
      (u) => u.userId === user.id || u.user?.id === user.id
    );
    const isCurrentlySelected = !!userInList;

    let updatedSelectedUsers;
    if (isCurrentlySelected) {
      // Format v1: filter theo userId hoặc user.id
      updatedSelectedUsers = selectedUsers.filter(
        (u) => u.userId !== user.id && u.user?.id !== user.id
      );
    } else {
      // Format v1: tạo object với user object bên trong
      const newFollower = {
        user: {
          id: user.id,
          fullName: user.fullName,
          parentId: user.parentId,
          positionName: user.positionName,
          orgName: user.orgName,
        },
        type: 0,
        isExcute: false,
        isCombination: false,
        status: 0,
        userId: user.id,
        id: null,
        taskId: taskId,
        description: null,
      };
      updatedSelectedUsers = [...selectedUsers, newFollower];
    }

    setSelectedUsers(updatedSelectedUsers);

    // Update listUserTmp (format id là string của userId)
    const userIdStr = `${user.id}`;
    const userInTmp = listUserTmp.find((u: any) => u.id === userIdStr);
    if (isCurrentlySelected) {
      // Remove from listUserTmp
      setListUserTmp(listUserTmp.filter((u: any) => u.id !== userIdStr));
    } else {
      // Add to listUserTmp
      const newUserTmp = {
        id: userIdStr,
        name: user.fullName,
        parentId: user.orgId != null ? String(user.orgId) : null,
        orgName: user.orgName,
        type: "USER",
        lead: false,
        isChecked: true,
        isExcute: false,
        isCombination: false,
        disabled: false,
        positionName: user.positionName,
      };
      setListUserTmp([...listUserTmp, newUserTmp]);
    }

    onSelectFollowers(updatedSelectedUsers);

    // Update tree với selected users mới
    const updatedUserList = userList.map((item: any) => {
      const isChecked = updatedSelectedUsers.some(
        (u) =>
          u.userId === parseInt(item.id) || u.user?.id === parseInt(item.id)
      );
      return {
        ...item,
        isChecked,
      };
    });

    setUserList(updatedUserList);

    // Rebuild tree
    const merged = [...updatedUserList, ...orgList];
    const tree = createDataTree(merged);
    setTreeData(tree);

    // Update expanded state
    const orgIds = new Set<string>();
    tree.forEach((item) => {
      if (item.type === "ORG" && item.children && item.children.length > 0) {
        orgIds.add(item.id);
      }
    });
    setExpanded(orgIds);
  };

  const handleConfirm = () => {
    let list: any[] = [];
    const userExcute = listUserTmp.find((item) => item.isExcute);

    list = listUserTmp.map((item, i) => {
      const user: any = {
        user: null,
        type: 0,
        isExcute: false,
        isCombination: false,
        status: 0,
        userId: 0,
        id: null,
        taskId: null,
        description: null,
      };

      if (item.type === "USER") {
        const userId =
          typeof item.id === "number"
            ? item.id
            : Number(item.id.replace("_", ""));

        user.user = {
          id: userId,
          fullName: item.name,
          parentId: item.orgId,
          positionName: item.positionName,
          orgName: item.orgName,
        };
        user.isExcute =
          i === 0 && !userExcute
            ? true
            : !!(userExcute && userExcute.id === item.id);
        user.isCombination =
          userExcute && userExcute.id === item.id
            ? false
            : !(i === 0 && !userExcute);
        user.userId = userId;
        user.description = item.description;

        // Format v1: giữ lại id và taskId từ currentFollowers nếu có
        const existingUser = selectedUsers.find(
          (u) => u.userId === userId || u.user?.id === userId
        );
        if (existingUser) {
          if (existingUser.id) {
            user.id = existingUser.id;
          }
          if (existingUser.taskId) {
            user.taskId = existingUser.taskId;
          }
        }
      }

      return user;
    });

    onSelectFollowers(list.filter((item) => item != null));

    if (onUpdateFollow) {
      onUpdateFollow();
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[95vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Chọn người theo dõi
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="border rounded-lg flex-1 max-h-[70vh] overflow-y-auto">
            {/* Header */}
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="w-4/5 text-left py-3 px-3 font-medium text-sm text-gray-700 border-r-2 border-gray-300">
                    Tên đơn vị, cá nhân
                  </th>
                  <th className="w-1/5 text-center py-3 px-3 font-medium text-sm text-gray-700">
                    Chọn
                  </th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={2} className="text-center py-8">
                      <div className="text-gray-500">Đang tải...</div>
                    </td>
                  </tr>
                ) : treeData.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="text-center py-8">
                      <div className="text-gray-500">Không có dữ liệu</div>
                    </td>
                  </tr>
                ) : (
                  treeData.map((node) => renderTreeNode(node, 0))
                )}
              </tbody>
            </table>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              onClick={handleConfirm}
              disabled={selectedUsers.length === 0}
              className="bg-blue-600 hover:bg-blue-700 px-4 h-9 text-sm"
            >
              <FileCheck className="w-4 h-4 mr-2" />
              Đồng ý
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
