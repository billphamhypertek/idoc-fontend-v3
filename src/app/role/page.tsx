"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Edit,
  Save,
  X,
  Lock,
  Unlock,
  Trash2,
  Search,
  Users,
} from "lucide-react";
import { Role, PositionModel, ModuleNode } from "@/definitions/types/auth.type";
import { User } from "@/definitions/types/user.type";
import { UserInfo } from "@/definitions/types/auth.type";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import {
  useActiveRole,
  useDeactiveRole,
  useAddNewRole,
  useGetAllRolesQuery,
  useGetPositionActiveByRoleQuery,
  useGetUserActiveByRoleQuery,
  useUpdateRole,
  useConfigurationRole,
  useConfigurationUserRole,
  useConfigurationPositionRole,
} from "@/hooks/data/role.data";
import { useGetUsersInformationActiveQuery } from "@/hooks/data/user.data";
import { useGetCategoriesByCode } from "@/hooks/data/category.data";
import { Constant } from "@/definitions/constants/constant";
import {
  NewRole,
  RoleFunction,
  RoleManagement,
} from "@/definitions/types/role.type";
import { Column, queryKeys } from "@/definitions";
import { Table } from "@/components/ui/table";
import { getModuleAll } from "@/utils/authentication.utils";
import ModuleTreeItem from "@/components/common/ModuleTreeItem";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useQueryClient } from "@tanstack/react-query";
import { ToastUtils } from "@/utils/toast.utils";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import UserRoleAssignmentDialog from "@/components/dialogs/UserRoleAssignmentDialog";
import PositionRoleAssignmentDialog from "@/components/dialogs/PositionRoleAssignmentDialog";

export default function RoleManagementPage() {
  const queryClient = useQueryClient();
  // State for roles
  const [roles, setRoles] = useState<RoleManagement[]>([]);
  const [selectedRoleIndex, setSelectedRoleIndex] = useState<number>(-1);
  const [selectedRole, setSelectedRole] = useState<RoleManagement>(
    {} as RoleManagement
  );
  const [editingRoleIndex, setEditingRoleIndex] = useState<number>(-1);
  const [isNewRole, setIsNewRole] = useState(false);
  const [newRole, setNewRole] = useState({ name: "" });
  const [editingRole, setEditingRole] = useState<RoleManagement>(
    {} as RoleManagement
  );
  const [confirmDeactiveRole, setConfirmDeactiveRole] = useState(false);
  const [confirmActiveRole, setConfirmActiveRole] = useState(false);
  // State for users and positions
  const [usersOfRole, setUsersOfRole] = useState<UserInfo[]>([]);
  const [positionsOfRole, setPositionsOfRole] = useState<PositionModel[]>([]);
  const [selectedModuleIds, setSelectedModuleIds] = useState<number[]>([]);
  const [confirmRemoveUserFromRole, setConfirmRemoveUserFromRole] =
    useState(false);
  const [userIdToRemove, setUserIdToRemove] = useState<number>();
  const [confirmRemovePositionFromRole, setConfirmRemovePositionFromRole] =
    useState(false);
  const [positionIdToRemove, setPositionIdToRemove] = useState<number>();
  // State for modals
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isPositionModalOpen, setIsPositionModalOpen] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<UserInfo[]>([]);
  const [selectedPositions, setSelectedPositions] = useState<PositionModel[]>(
    []
  );

  const { data: rolesData, isLoading, error } = useGetAllRolesQuery();
  const {
    data: userActiveByRoleData,
    isLoading: isLoadingUserActiveByRole,
    error: errorUserActiveByRole,
  } = useGetUserActiveByRoleQuery(selectedRole.id);
  const {
    data: positionActiveByRoleData,
    isLoading: isLoadingPositionActiveByRole,
    error: errorPositionActiveByRole,
  } = useGetPositionActiveByRoleQuery(selectedRole.id);
  const { data: positionsData, isLoading: isLoadingPositions } =
    useGetCategoriesByCode(Constant.CATEGORYTYPE_CODE.USER_POSITION);
  const { mutate: doAddNewRole } = useAddNewRole();
  const { mutate: doUpdateRole } = useUpdateRole();
  const { mutate: doDeactiveRole } = useDeactiveRole();
  const { mutate: doActiveRole } = useActiveRole();
  const { mutate: doConfigurationRole } = useConfigurationRole();
  const { mutate: doConfigurationUserRole } = useConfigurationUserRole();
  const { mutate: doConfigurationPositionRole } =
    useConfigurationPositionRole();
  const moduleList: ModuleNode[] = getModuleAll() || [];

  // State để quản lý moduleList với trạng thái isChecked
  const [moduleListWithCheck, setModuleListWithCheck] = useState<ModuleNode[]>(
    () => {
      return moduleList.map((module) => ({
        ...module,
        isChecked: false,
      }));
    }
  );

  const tableDataSource = useMemo(() => {
    const baseData = rolesData || [];
    if (isNewRole) {
      const newRoleRow: RoleManagement = {
        id: -1,
        active: true,
        createDate: Date.now(),
        createBy: 1,
        clientId: 1,
        name: newRole.name,
        isDefault: false,
        modules: [],
        cabinet: null,
      };
      return [newRoleRow, ...baseData];
    }
    return baseData;
  }, [rolesData, isNewRole, newRole.name]);

  // Default select the first role when data loads
  useEffect(() => {
    if (
      rolesData &&
      rolesData.length > 0 &&
      selectedRoleIndex === -1 &&
      !isNewRole &&
      editingRoleIndex === -1
    ) {
      setSelectedRoleIndex(0);
      setSelectedRole(rolesData[0]);
    }
  }, [rolesData, selectedRoleIndex, isNewRole, editingRoleIndex]);

  useEffect(() => {
    if (selectedRole.id) {
      const roleModuleIds = selectedRole.modules.map(
        (module: RoleFunction) => module.id
      );
      setSelectedModuleIds(roleModuleIds);

      // Cập nhật trạng thái isChecked trong moduleListWithCheck
      setModuleListWithCheck((prev) => {
        // Reset tất cả về false trước
        const resetModules = prev.map((module) => ({
          ...module,
          isChecked: false,
        }));
        // Sau đó cập nhật dựa trên selectedIds
        return updateParentModuleState(resetModules, roleModuleIds);
      });
    }
  }, [selectedRole]);

  useEffect(() => {
    if (userActiveByRoleData) {
      setSelectedUsers(userActiveByRoleData);
    }
  }, [userActiveByRoleData]);

  useEffect(() => {
    if (positionActiveByRoleData) {
      setSelectedPositions(positionActiveByRoleData);
    }
  }, [positionActiveByRoleData]);

  // Role management functions
  const handleNewRole = () => {
    setIsNewRole(true);
    setNewRole({ name: "" });
  };

  const handleSaveNewRole = () => {
    if (newRole.name.trim()) {
      doAddNewRole(
        { payload: { name: newRole.name, active: true } as NewRole },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: [queryKeys.role.getAll],
            });
            setIsNewRole(false);
            setNewRole({ name: "" });
            ToastUtils.addNewRoleSuccess();
          },
          onError: () => {
            ToastUtils.addNewRoleError();
          },
        }
      );
    }
  };

  const handleCancelNewRole = () => {
    setIsNewRole(false);
    setNewRole({ name: "" });
  };

  const handleSelectRole = (role: RoleManagement, index: number) => {
    setSelectedRole(role);
  };

  const handleEditRole = (role: RoleManagement, index: number) => {
    setEditingRoleIndex(index);
    setEditingRole({ ...role });
  };

  const handleSaveRole = () => {
    if (editingRole.name?.trim()) {
      doUpdateRole(
        { payload: editingRole },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({
              queryKey: [queryKeys.role.getAll],
            });
            setEditingRoleIndex(-1);
            ToastUtils.updateRoleSuccess();
          },
          onError: () => {
            ToastUtils.updateRoleError();
          },
        }
      );
    }
  };

  const handleCancelEditRole = () => {
    setEditingRoleIndex(-1);
    setEditingRole({} as RoleManagement);
  };

  const handleDeactiveRole = () => {
    doDeactiveRole(
      { id: selectedRole.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [queryKeys.role.getAll] });
          setConfirmDeactiveRole(false);
          ToastUtils.deactiveRoleSuccess();
        },
        onError: () => {
          ToastUtils.deactiveRoleError();
        },
      }
    );
  };

  const handleActiveRole = () => {
    doActiveRole(
      { id: selectedRole.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: [queryKeys.role.getAll] });
          setConfirmActiveRole(false);
          ToastUtils.activeRoleSuccess();
        },
        onError: () => {
          ToastUtils.activeRoleError();
        },
      }
    );
  };

  const handleToggleRoleStatus = (role: RoleManagement) => {
    setSelectedRole(role);
    if (role.active) {
      setConfirmDeactiveRole(true);
    } else {
      setConfirmActiveRole(true);
    }
  };

  // User management functions

  const handleAddUserToRole = (user: UserInfo) => {
    setSelectedUsers([...selectedUsers, user]);
  };

  const handleConfirmRemoveUserFromRole = () => {
    const tempSelectedUsers = [...selectedUsers];
    const newSelectedUsers = tempSelectedUsers.filter(
      (u) => u.id !== userIdToRemove
    );
    doConfigurationUserRole(
      { payload: newSelectedUsers as UserInfo[], roleId: selectedRole.id },
      {
        onSuccess: () => {
          ToastUtils.saveUsersToRoleSuccess();
          queryClient.invalidateQueries({ queryKey: [queryKeys.role.getAll] });
          setConfirmRemoveUserFromRole(false);
          setUserIdToRemove(0);
          setSelectedUsers(newSelectedUsers);
        },
        onError: () => {
          ToastUtils.saveUsersToRoleError();
          setConfirmRemoveUserFromRole(false);
          setUserIdToRemove(0);
          setSelectedUsers(tempSelectedUsers);
        },
      }
    );
  };

  const handleRemoveUserFromRole = (userId: number) => {
    setSelectedUsers(selectedUsers.filter((u) => u.id !== userId));
  };

  const handleSaveUsersToRole = () => {
    doConfigurationUserRole(
      { payload: selectedUsers as UserInfo[], roleId: selectedRole.id },
      {
        onSuccess: () => {
          ToastUtils.saveUsersToRoleSuccess();
          queryClient.invalidateQueries({ queryKey: [queryKeys.role.getAll] });
        },
        onError: () => {
          ToastUtils.saveUsersToRoleError();
        },
      }
    );
    setIsUserModalOpen(false);
  };

  // Position management functions
  const handleAddPositionToRole = (position: PositionModel) => {
    setSelectedPositions([...selectedPositions, position]);
  };

  const handleConfirmRemovePositionFromRole = () => {
    const tempSelectedPositions = [...selectedPositions];
    const newSelectedPositions = tempSelectedPositions.filter(
      (p) => p.id !== positionIdToRemove
    );
    doConfigurationPositionRole(
      {
        payload: newSelectedPositions as PositionModel[],
        roleId: selectedRole.id,
      },
      {
        onSuccess: () => {
          ToastUtils.savePositionsToRoleSuccess();
          queryClient.invalidateQueries({ queryKey: [queryKeys.role.getAll] });
          setConfirmRemovePositionFromRole(false);
          setPositionIdToRemove(0);
          setSelectedPositions(newSelectedPositions);
        },
        onError: () => {
          ToastUtils.savePositionsToRoleError();
          setConfirmRemovePositionFromRole(false);
          setPositionIdToRemove(0);
          setSelectedPositions(tempSelectedPositions);
        },
      }
    );
  };

  const handleRemovePositionFromRole = (positionId: number) => {
    setSelectedPositions(selectedPositions.filter((p) => p.id !== positionId));
  };

  const handleSavePositionsToRole = () => {
    doConfigurationPositionRole(
      {
        payload: selectedPositions as PositionModel[],
        roleId: selectedRole.id,
      },
      {
        onSuccess: () => {
          ToastUtils.savePositionsToRoleSuccess();
          queryClient.invalidateQueries({ queryKey: [queryKeys.role.getAll] });
          setIsPositionModalOpen(false);
        },
        onError: () => {
          ToastUtils.savePositionsToRoleError();
          setIsPositionModalOpen(false);
        },
      }
    );
  };

  // Hàm để tìm module cha của một module
  const findParentModule = (
    modules: ModuleNode[],
    targetId: number
  ): ModuleNode | null => {
    for (const moduleItem of modules) {
      if (moduleItem.subModule && moduleItem.subModule.length > 0) {
        // Kiểm tra xem targetId có phải là con của moduleItem này không
        const isChild = moduleItem.subModule.some(
          (child) =>
            child.id === targetId ||
            findParentModule([child], targetId) !== null
        );
        if (isChild) {
          return moduleItem;
        }
      }
    }
    return null;
  };

  // Hàm để kiểm tra xem tất cả module con có được chọn không
  const areAllChildrenSelected = (
    moduleItem: ModuleNode,
    selectedIds: number[]
  ): boolean => {
    if (!moduleItem.subModule || moduleItem.subModule.length === 0) {
      return true;
    }

    return moduleItem.subModule.every((child) => {
      if (selectedIds.includes(child.id)) {
        return areAllChildrenSelected(child, selectedIds);
      }
      return false;
    });
  };

  // Module management functions
  const handleModuleToggle = (moduleId: number) => {
    const isCurrentlySelected = selectedModuleIds.includes(moduleId);

    setSelectedModuleIds((prev) => {
      const newIds = isCurrentlySelected
        ? prev.filter((id) => id !== moduleId)
        : [...prev, moduleId];

      return newIds;
    });

    // Cập nhật trạng thái isChecked trong moduleListWithCheck
    setModuleListWithCheck((prev) => {
      // Cập nhật trạng thái module được chọn
      let updatedModules = updateModuleChecked(
        prev,
        moduleId,
        !isCurrentlySelected
      );

      // Cập nhật trạng thái tất cả module cha dựa trên trạng thái module con
      const newSelectedIds = isCurrentlySelected
        ? selectedModuleIds.filter((id) => id !== moduleId)
        : [...selectedModuleIds, moduleId];

      updatedModules = updateParentModuleState(updatedModules, newSelectedIds);

      return updatedModules;
    });
  };

  // Hàm để lấy tất cả module con từ một module cha
  const getAllChildModules = (moduleItem: ModuleNode): number[] => {
    const childIds: number[] = [];

    const traverse = (node: ModuleNode) => {
      if (node.subModule && node.subModule.length > 0) {
        node.subModule.forEach((child) => {
          childIds.push(child.id);
          traverse(child);
        });
      }
    };

    traverse(moduleItem);
    return childIds;
  };

  // Hàm đệ quy để cập nhật trạng thái isChecked cho module và tất cả con
  const updateModuleChecked = (
    modules: ModuleNode[],
    targetId: number,
    checked: boolean
  ): ModuleNode[] => {
    return modules.map((moduleItem) => {
      if (moduleItem.id === targetId) {
        return { ...moduleItem, isChecked: checked };
      }
      if (moduleItem.subModule && moduleItem.subModule.length > 0) {
        return {
          ...moduleItem,
          subModule: updateModuleChecked(
            moduleItem.subModule,
            targetId,
            checked
          ),
        };
      }
      return moduleItem;
    });
  };

  // Hàm xử lý khi chọn module cha
  const handleToggleParent = (moduleItem: ModuleNode, checked: boolean) => {
    const childIds = getAllChildModules(moduleItem);
    const allIds = [moduleItem.id, ...childIds];

    setSelectedModuleIds((prev) => {
      if (checked) {
        // Thêm tất cả module cha và con vào selectedModuleIds
        const newIds = [...prev];
        allIds.forEach((id) => {
          if (!newIds.includes(id)) {
            newIds.push(id);
          }
        });
        return newIds;
      } else {
        // Xóa tất cả module cha và con khỏi selectedModuleIds
        return prev.filter((id) => !allIds.includes(id));
      }
    });

    // Cập nhật trạng thái isChecked trong moduleListWithCheck
    setModuleListWithCheck((prev) => {
      const newSelectedIds = checked
        ? [
            ...selectedModuleIds,
            ...allIds.filter((id) => !selectedModuleIds.includes(id)),
          ]
        : selectedModuleIds.filter((id) => !allIds.includes(id));

      return updateParentModuleState(prev, newSelectedIds);
    });
  };

  // Hàm để cập nhật trạng thái module cha khi module con thay đổi
  const updateParentModuleState = (
    modules: ModuleNode[],
    selectedIds: number[]
  ): ModuleNode[] => {
    return modules.map((moduleItem) => {
      if (moduleItem.subModule && moduleItem.subModule.length > 0) {
        const updatedSubModules = updateParentModuleState(
          moduleItem.subModule,
          selectedIds
        );
        const hasSelectedChildren = updatedSubModules.some((child) =>
          selectedIds.includes(child.id)
        );

        return {
          ...moduleItem,
          isChecked: hasSelectedChildren,
          subModule: updatedSubModules,
        };
      }
      return {
        ...moduleItem,
        isChecked: selectedIds.includes(moduleItem.id),
      };
    });
  };

  const handleSaveModulesToRole = () => {
    doConfigurationRole(
      { payload: moduleListWithCheck as ModuleNode[], roleId: selectedRole.id },
      {
        onSuccess: () => {
          ToastUtils.saveModulesToRoleSuccess();
          queryClient.invalidateQueries({ queryKey: [queryKeys.role.getAll] });
        },
        onError: () => {
          ToastUtils.saveModulesToRoleError();
        },
      }
    );
  };

  const checkUserExists = (userId: number) => {
    return usersOfRole.some((u) => u.id === userId);
  };

  const checkPositionExists = (positionId: number) => {
    return positionsOfRole.some((p) => p.id === positionId);
  };

  const roleColumns: Column<RoleManagement>[] = [
    {
      header: (
        <div className="flex justify-center items-center py-1">
          <span className="text-xs font-medium">STT</span>
        </div>
      ),
      className: "text-center py-1 w-12 min-w-12 max-w-12",
      accessor: (_item: RoleManagement, index: number) => (
        <div className="flex justify-center items-center py-1">
          <span className="text-xs font-medium">{index + 1}</span>
        </div>
      ),
    },
    {
      header: "Tên vai trò",
      className: "py-2 w-24 min-w-24 max-w-24",
      accessor: (item: RoleManagement) => {
        // Kiểm tra nếu đây là dòng mới (có id tạm thời)
        if (item.id === -1) {
          return (
            <div className="w-full">
              <Input
                value={newRole.name}
                onChange={(e) => setNewRole({ name: e.target.value })}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSaveNewRole();
                  } else if (e.key === "Escape") {
                    handleCancelNewRole();
                  }
                }}
                placeholder="Nhập tên vai trò mới"
                className="h-9 text-sm w-full"
                autoFocus
              />
            </div>
          );
        }
        // Kiểm tra nếu đang edit
        if (
          editingRoleIndex !== -1 &&
          rolesData &&
          rolesData[editingRoleIndex]?.id === item.id
        ) {
          return (
            <div className="w-full">
              <Input
                value={editingRole.name || ""}
                onChange={(e) =>
                  setEditingRole({ ...editingRole, name: e.target.value })
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSaveRole();
                  } else if (e.key === "Escape") {
                    handleCancelEditRole();
                  }
                }}
                className="h-9 text-sm w-full"
                autoFocus
              />
            </div>
          );
        }
        return (
          <div className="w-full max-w-full min-w-0">
            <button
              onClick={() =>
                handleSelectRole(
                  item,
                  rolesData?.findIndex((r) => r.id === item.id) || 0
                )
              }
              className="text-blue-600 hover:text-blue-800 font-medium text-left w-full overflow-hidden break-words"
              title={item.name}
              style={{
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                wordBreak: "break-word",
                textOverflow: "ellipsis",
              }}
            >
              {item.name}
            </button>
          </div>
        );
      },
    },
    {
      header: "Thao tác",
      type: "actions",
      className: "text-center py-2 w-16 min-w-16 max-w-16",
      renderActions: (item: RoleManagement, index: number) => {
        // Nếu đây là dòng mới
        if (item.id === -1) {
          return (
            <div className="flex gap-1 justify-center">
              <Button
                onClick={handleSaveNewRole}
                size="sm"
                variant="outline"
                className="h-9 w-8 p-0 hover:bg-green-50"
              >
                <Save className="h-4 w-4 text-green-600" />
              </Button>
              <Button
                onClick={handleCancelNewRole}
                size="sm"
                variant="outline"
                className="h-9 w-8 p-0 hover:bg-red-50"
              >
                <X className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          );
        }
        // Nếu đang edit
        if (
          editingRoleIndex !== -1 &&
          rolesData &&
          rolesData[editingRoleIndex]?.id === item.id
        ) {
          return (
            <div className="flex gap-1 justify-center">
              <Button
                onClick={handleSaveRole}
                size="sm"
                variant="outline"
                className="h-9 w-8 p-0 hover:bg-green-50"
              >
                <Save className="h-4 w-4 text-green-600" />
              </Button>
              <Button
                onClick={handleCancelEditRole}
                size="sm"
                variant="outline"
                className="h-9 w-8 p-0 hover:bg-red-50"
              >
                <X className="h-4 w-4 text-red-600" />
              </Button>
            </div>
          );
        }
        // Dòng bình thường
        return (
          <div className="flex gap-1 justify-center">
            <Button
              onClick={() => handleEditRole(item, index)}
              size="sm"
              variant="ghost"
              className="h-9 w-8 p-0 hover:bg-blue-50"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              onClick={() => handleToggleRoleStatus(item)}
              size="sm"
              variant="ghost"
              className="h-9 w-8 p-0 hover:bg-gray-50"
            >
              {item.active ? (
                <Unlock className="h-4 w-4 text-green-600" />
              ) : (
                <Lock className="h-4 w-4 text-red-600" />
              )}
            </Button>
          </div>
        );
      },
    },
  ];

  const userColumns: Column<UserInfo>[] = [
    {
      header: "STT",
      className: "text-center py-1 w-4",
      accessor: (_item: UserInfo, index: number) => (
        <div className="flex justify-center items-center py-1">
          <span className="text-xs font-medium">{index + 1}</span>
        </div>
      ),
    },
    {
      header: "Ảnh đại diện",
      className: "py-2 w-44 text-center",
      accessor: (item: UserInfo) => {
        return (
          <div className="flex justify-center items-center py-1">
            <Avatar>
              <AvatarImage src={item.photo || ""} />
            </Avatar>
          </div>
        );
      },
    },
    {
      header: "Họ và tên",
      className: "py-2 w-44",
      accessor: (item: UserInfo) => {
        return <div className="text-center">{item.fullName}</div>;
      },
    },
    {
      header: "Chức danh",
      className: "py-2 w-44",
      accessor: (item: UserInfo) => {
        return (
          <div className="text-center">{item.positionModel?.name || ""}</div>
        );
      },
    },
    {
      header: "Điện thoại",
      className: "py-2 w-44",
      accessor: (item: UserInfo) => {
        return <div className="text-center">{item.phone || ""}</div>;
      },
    },
    {
      header: "Thao tác",
      type: "actions",
      className: "text-center py-2 w-24",
      renderActions: (item: UserInfo, index: number) => (
        <div className="flex items-center justify-center">
          <Button
            onClick={() => {
              if (item.id) {
                setConfirmRemoveUserFromRole(true);
                setUserIdToRemove(item.id);
              }
            }}
            size="sm"
            variant="ghost"
            className="h-9 w-8 p-0 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  const positionColumns: Column<PositionModel>[] = [
    {
      header: "STT",
      className: "text-center py-1 w-4",
      accessor: (_item: PositionModel, index: number) => (
        <div className="flex justify-center items-center py-1">
          <span className="text-xs font-medium">{index + 1}</span>
        </div>
      ),
    },
    {
      header: "Chức danh",
      className: "py-2 w-44",
      accessor: (item: PositionModel) => {
        return <div className="text-center">{item.name}</div>;
      },
    },
    {
      header: "Thao tác",
      type: "actions",
      className: "text-center py-2 w-24",
      renderActions: (item: PositionModel, index: number) => (
        <div className="flex items-center justify-center">
          <Button
            onClick={() => {
              if (item.id) {
                setConfirmRemovePositionFromRole(true);
                setPositionIdToRemove(item.id);
              }
            }}
            size="sm"
            variant="ghost"
            className="h-9 w-8 p-0 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="container mx-auto px-4">
      <BreadcrumbNavigation
        items={[
          {
            href: "/",
            label: "Quản trị hệ thống",
          },
        ]}
        currentPage="Quản lý vai trò"
        showHome={false}
      />
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-4">
        {/* Left Column - Role List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h4 className="text-lg font-semibold mb-1">
                  Danh sách vai trò
                </h4>
                <p className="text-sm text-gray-600">
                  Thông tin vai trò thực hiện trong hệ thống
                </p>
              </div>
              <Button
                onClick={handleNewRole}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
                disabled={isNewRole || editingRoleIndex !== -1}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>

            <div className="overflow-x-hidden">
              <Table
                dataSource={tableDataSource}
                columns={roleColumns}
                showPagination={false}
                sortable={true}
                onRowClick={(item: RoleManagement, index: number) => {
                  // Không cho phép click vào dòng mới
                  if (item.id !== -1) {
                    handleSelectRole(item, index);
                  }
                }}
                rowClassName={(item: RoleManagement) => {
                  if (item.id === -1) {
                    return "bg-blue-50 border-l-4 border-l-blue-500";
                  }
                  if (
                    editingRoleIndex !== -1 &&
                    rolesData &&
                    rolesData[editingRoleIndex]?.id === item.id
                  ) {
                    return "bg-yellow-50 border-l-4 border-l-yellow-500";
                  }
                  if (selectedRole.id === item.id) {
                    return "bg-green-50 border-l-4 border-l-green-500";
                  }
                  return "bg-white";
                }}
                loading={isLoading}
                bgColor="bg-white"
                emptyText={
                  isLoading
                    ? "Đang tải dữ liệu..."
                    : error
                      ? `Lỗi: ${error && typeof error === "object" && "message" in error ? ((error as { message?: string }).message ?? "Không xác định") : "Không xác định"}`
                      : "Không tồn tại vai trò"
                }
              />
            </div>
          </div>
        </div>

        {/* Right Column - Function & User Configuration */}
        <div className="lg:col-span-3 min-w-0">
          <div className="bg-white rounded-lg shadow-sm border p-4 md:p-6">
            <div className="mb-4">
              <h4 className="text-lg font-semibold mb-1">
                Chức năng & Người dùng
              </h4>
              <p className="text-sm text-gray-600">
                Vai trò được tùy chỉnh theo chức năng và người dùng của hệ thống
              </p>
            </div>

            <Tabs defaultValue="functions" className="w-full">
              <TabsList className="inline-flex h-10 items-center justify-center rounded-lg bg-gray-100 p-1 text-gray-600 w-full min-w-0 overflow-hidden">
                <TabsTrigger
                  value="functions"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-xs sm:text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm hover:bg-gray-50 hover:text-gray-900 flex-1 min-w-0 truncate"
                >
                  Cấu hình chức năng
                </TabsTrigger>
                <TabsTrigger
                  value="users"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-xs sm:text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm hover:bg-gray-50 hover:text-gray-900 flex-1 min-w-0 truncate"
                >
                  Người dùng thuộc vai trò
                </TabsTrigger>
                <TabsTrigger
                  value="positions"
                  className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-xs sm:text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm hover:bg-gray-50 hover:text-gray-900 flex-1 min-w-0 truncate"
                >
                  Chức danh thuộc vai trò
                </TabsTrigger>
              </TabsList>

              {/* Function Configuration Tab */}
              <TabsContent value="functions" className="mt-4">
                <div className="space-y-4">
                  <div className="border rounded-lg p-4 overflow-hidden">
                    <h5 className="font-medium mb-3">Chọn chức năng</h5>
                    {/* Tree Module Selector with Expand/Collapse */}
                    <div className="space-y-2 max-h-96 overflow-y-auto overflow-x-hidden">
                      {moduleListWithCheck.map((moduleItem: ModuleNode) => (
                        <ModuleTreeItem
                          key={moduleItem.id}
                          module={moduleItem}
                          selectedModuleIds={selectedModuleIds}
                          onToggle={handleModuleToggle}
                          onToggleParent={handleToggleParent}
                          defaultExpanded={true}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSaveModulesToRole}
                      className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 text-sm font-medium"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Lưu
                    </Button>
                  </div>
                </div>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users" className="mt-4">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <h5 className="font-medium">Người dùng thuộc vai trò</h5>
                    <Button
                      onClick={() => setIsUserModalOpen(true)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm mới
                    </Button>
                  </div>

                  <div className="w-full overflow-x-auto -mx-4 md:mx-0">
                    <div className="min-w-full px-4 md:px-0">
                      <Table
                        dataSource={selectedUsers || []}
                        columns={userColumns}
                        showPagination={false}
                        sortable={false}
                        loading={isLoadingUserActiveByRole}
                        bgColor="bg-white"
                        emptyText={
                          isLoadingUserActiveByRole
                            ? "Đang tải dữ liệu..."
                            : errorUserActiveByRole
                              ? `Lỗi: ${errorUserActiveByRole && typeof errorUserActiveByRole === "object" && "message" in errorUserActiveByRole ? ((errorUserActiveByRole as { message?: string }).message ?? "Không xác định") : "Không xác định"}`
                              : "Không tồn tại người dùng"
                        }
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Positions Tab */}
              <TabsContent value="positions" className="mt-4">
                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                    <h5 className="font-medium">Chức danh thuộc vai trò</h5>
                    <Button
                      onClick={() => setIsPositionModalOpen(true)}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Thêm mới
                    </Button>
                  </div>

                  <div className="w-full overflow-x-auto -mx-4 md:mx-0">
                    <div className="min-w-full px-4 md:px-0">
                      <Table
                        dataSource={selectedPositions || []}
                        columns={positionColumns}
                        showPagination={false}
                        sortable={false}
                        loading={isLoadingPositionActiveByRole}
                        bgColor="bg-white"
                        emptyText={
                          isLoadingPositionActiveByRole
                            ? "Đang tải dữ liệu..."
                            : errorPositionActiveByRole
                              ? `Lỗi: ${errorPositionActiveByRole && typeof errorPositionActiveByRole === "object" && "message" in errorPositionActiveByRole ? ((errorPositionActiveByRole as { message?: string }).message ?? "Không xác định") : "Không xác định"}`
                              : "Không tồn tại vị trí"
                        }
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>

      {/* User Assignment Modal */}
      <UserRoleAssignmentDialog
        isOpen={isUserModalOpen}
        onOpenChange={setIsUserModalOpen}
        usersInformationData={selectedUsers}
        onAddUser={handleAddUserToRole}
        onRemoveUser={handleRemoveUserFromRole}
        onSave={handleSaveUsersToRole}
      />

      {/* Position Assignment Modal */}
      <PositionRoleAssignmentDialog
        isOpen={isPositionModalOpen}
        onOpenChange={setIsPositionModalOpen}
        positionsData={positionsData as PositionModel[]}
        isLoading={isLoadingPositions}
        positionsInformationData={selectedPositions}
        onAddPosition={handleAddPositionToRole}
        onRemovePosition={handleRemovePositionFromRole}
        onSave={handleSavePositionsToRole}
      />

      <ConfirmDeleteDialog
        isOpen={confirmDeactiveRole}
        onOpenChange={setConfirmDeactiveRole}
        onConfirm={handleDeactiveRole}
        title="Hãy xác nhận"
        description="Bạn có muốn ngừng kích hoạt vai trò?"
        confirmText="Đồng ý"
        cancelText="Đóng"
      />
      <ConfirmDeleteDialog
        isOpen={confirmActiveRole}
        onOpenChange={setConfirmActiveRole}
        onConfirm={handleActiveRole}
        title="Hãy xác nhận"
        description="Bạn có muốn kích hoạt vai trò?"
        confirmText="Đồng ý"
        cancelText="Đóng"
      />
      <ConfirmDeleteDialog
        isOpen={confirmRemoveUserFromRole}
        onOpenChange={setConfirmRemoveUserFromRole}
        onConfirm={handleConfirmRemoveUserFromRole}
        title="Hãy xác nhận"
        description="Bạn có muốn xóa người dùng khỏi vai trò?"
        confirmText="Đồng ý"
        cancelText="Đóng"
      />
      <ConfirmDeleteDialog
        isOpen={confirmRemovePositionFromRole}
        onOpenChange={setConfirmRemovePositionFromRole}
        onConfirm={handleConfirmRemovePositionFromRole}
        title="Hãy xác nhận"
        description="Bạn có muốn xóa chức danh khỏi vai trò?"
        confirmText="Đồng ý"
        cancelText="Đóng"
      />
    </div>
  );
}
