import { queryKeys } from "@/definitions";
import { OrganizationService } from "@/services/organization.service";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";

const COMMON_QUERY_OPTS = {
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchOnMount: false as const,
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
  placeholderData: keepPreviousData,
};

export const useGetOrganizations = (
  params: Record<string, any> = {},
  enabled = true
) => {
  return useQuery({
    queryKey: [queryKeys.organizations.all, "list", params],
    queryFn: () => OrganizationService.getOrganizations(params),
    enabled,
    ...COMMON_QUERY_OPTS,
    staleTime: 0,
  });
};

export const useGetOrganizationsByVanThu = () => {
  return useQuery({
    queryKey: [queryKeys.organizations.all, "vanThu"],
    queryFn: () => OrganizationService.getOrganizationsByVanThu(),
    ...COMMON_QUERY_OPTS,
  });
};

export const useGetOrgCVV = () => {
  return useQuery({
    queryKey: [queryKeys.organizations.orgCVV],
    queryFn: () => OrganizationService.getOrgCVV(),
    ...COMMON_QUERY_OPTS,
  });
};

export const useSearchRootOrganizations = (
  params: Record<string, any> = {}
) => {
  return useQuery({
    queryKey: [queryKeys.organizations.all, "searchRoot", params],
    queryFn: () => OrganizationService.searchRootOrganizations(params),
    ...COMMON_QUERY_OPTS,
  });
};

export const useGetRootOrganizations = () => {
  return useQuery({
    queryKey: [queryKeys.organizations.all, "roots"],
    queryFn: () => OrganizationService.getRootOrganizations(),
    ...COMMON_QUERY_OPTS,
  });
};

export const useGetOrgTreeById = (id: string | number | undefined) => {
  return useQuery({
    queryKey: [queryKeys.organizations.all, "tree", id],
    queryFn: () => OrganizationService.getOrgTreeById(id!),
    enabled: !!id,
    ...COMMON_QUERY_OPTS,
  });
};

export const useGetOrgById = (id: string | number | undefined) => {
  return useQuery({
    queryKey: [queryKeys.organizations.all, "detail", id],
    queryFn: () => OrganizationService.getOrgById(id!),
    enabled: !!id,
    ...COMMON_QUERY_OPTS,
  });
};

export const useSearchOrgByName = (name: string) => {
  return useQuery({
    queryKey: [queryKeys.organizations.all, "searchByName", name],
    queryFn: () => OrganizationService.searchOrgByName(name),
    enabled: !!name && name.length > 0,
    ...COMMON_QUERY_OPTS,
  });
};

export const useGetAllUserByParentIdOrg = (type: number) => {
  return useQuery({
    queryKey: [queryKeys.organizations.all, "usersByParent", type],
    queryFn: () => OrganizationService.getAllUserByParentIdOrg(type),
    ...COMMON_QUERY_OPTS,
  });
};

export const useGetOrgParentByOrgId = (
  childId: string | number | undefined
) => {
  return useQuery({
    queryKey: [queryKeys.organizations.all, "parent", childId],
    queryFn: () => OrganizationService.getOrgParentByOrgId(childId!),
    enabled: !!childId,
    ...COMMON_QUERY_OPTS,
  });
};

export const useGetOrgAllSorted = () => {
  return useQuery({
    queryKey: [queryKeys.organizations.all, "allSorted"],
    queryFn: () => OrganizationService.getOrgAllSorted(),
    ...COMMON_QUERY_OPTS,
  });
};

export const useSearchOrganizations = () => {
  return useMutation({
    mutationFn: async (params: { page: number; data: Record<string, any> }) => {
      return await OrganizationService.searchOrganization(
        params.page,
        params.data
      );
    },
  });
};

export const useGetOrgChildrenList = () => {
  return useMutation({
    mutationFn: async (params: { orgId: number }) => {
      return await OrganizationService.getOrgChildrenList(params.orgId);
    },
  });
};

export const useGetOrgInformation = () => {
  return useMutation({
    mutationFn: async (params: { orgId: string }) => {
      return await OrganizationService.getOrgInformation(params.orgId);
    },
  });
};

export const useGetOrgChildrenListV2 = (
  orgId: number,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [queryKeys.organizations.all, "childrenListV2", orgId],
    queryFn: () => OrganizationService.getOrgChildrenList(orgId),
    ...COMMON_QUERY_OPTS,
    enabled: enabled,
  });
};
