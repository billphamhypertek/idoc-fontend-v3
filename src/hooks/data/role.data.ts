import { useMutation, useQuery } from "@tanstack/react-query";
import { ModuleNode, PositionModel, queryKeys, UserInfo } from "@/definitions";
import { RoleService } from "@/services/role.service";
import { NewRole, RoleManagement } from "@/definitions/types/role.type";
import { UserService } from "@/services/user.service";

export const useGetAllRolesQuery = () => {
  return useQuery({
    queryKey: [queryKeys.role.getAll],
    queryFn: () => RoleService.getAllRoles(),
    enabled: typeof window !== "undefined",
  });
};

export const useGetUserActiveByRoleQuery = (roleId: number) => {
  return useQuery({
    queryKey: [queryKeys.role.getUserActiveByRole, roleId],
    queryFn: () => RoleService.getUserActiveByRole(roleId),
    enabled: typeof window !== "undefined" && roleId > 0,
  });
};

export const useGetPositionActiveByRoleQuery = (roleId: number) => {
  return useQuery({
    queryKey: [queryKeys.role.getPositionActiveByRole, roleId],
    queryFn: () => RoleService.getPositionActiveByRole(roleId),
    enabled: typeof window !== "undefined" && roleId > 0,
  });
};

export const useAddNewRole = () => {
  return useMutation({
    mutationFn: ({ payload }: { payload: NewRole }) =>
      RoleService.addNewRole(payload),
  });
};

export const useUpdateRole = () => {
  return useMutation({
    mutationFn: ({ payload }: { payload: RoleManagement }) =>
      RoleService.updateRole(payload),
  });
};

export const useDeactiveRole = () => {
  return useMutation({
    mutationFn: ({ id }: { id: number }) => RoleService.deactiveRole(id),
  });
};

export const useActiveRole = () => {
  return useMutation({
    mutationFn: ({ id }: { id: number }) => RoleService.activeRole(id),
  });
};

export const useConfigurationRole = () => {
  return useMutation({
    mutationFn: ({
      payload,
      roleId,
    }: {
      payload: ModuleNode[];
      roleId: number;
    }) => RoleService.configurationRole(payload, roleId),
  });
};

export const useSearchUserActiveByTextSearch = () => {
  return useMutation({
    mutationFn: ({ textSearch }: { textSearch: string }) =>
      UserService.searchUserActiveByTextSearch(textSearch),
  });
};

export const useConfigurationUserRole = () => {
  return useMutation({
    mutationFn: ({
      payload,
      roleId,
    }: {
      payload: UserInfo[];
      roleId: number;
    }) => RoleService.configurationUserRole(payload, roleId),
  });
};

export const useConfigurationPositionRole = () => {
  return useMutation({
    mutationFn: ({
      payload,
      roleId,
    }: {
      payload: PositionModel[];
      roleId: number;
    }) => RoleService.configurationPositionRole(payload, roleId),
  });
};
