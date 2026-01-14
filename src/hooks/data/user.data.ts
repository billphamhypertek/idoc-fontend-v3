import { queryKeys } from "@/definitions";
import { UserService } from "@/services/user.service";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";

const COMMON_QUERY_OPTS = {
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchOnMount: false as const,
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
  placeholderData: keepPreviousData,
};
export const useGetAllUsersAddProcess = (orgId: string) => {
  return useQuery({
    queryKey: [queryKeys.users.allUserAndProcess, orgId],
    queryFn: () => UserService.getAllUsersAddProcess(orgId),
    enabled: !!orgId,
  });
};

export const useGetAllUserByLead = () => {
  return useMutation({
    mutationFn: () => UserService.getAllUserByLead(),
  });
};

export const useGetAllUserByLead2 = () => {
  return useQuery({
    queryKey: [queryKeys.users.getAllUserByLead],
    queryFn: () => UserService.getAllUserByLead(),
  });
};
export const useGetUserOrgAndSubOrgWithAuthority = () => {
  return useMutation({
    mutationFn: (payload: any) =>
      UserService.getUserOrgAndSubOrgWithAuthority(
        payload.orgId,
        payload.authority
      ),
  });
};
export const useIsClerical = (docType: string, enabled: boolean = true) => {
  return useQuery<boolean>({
    queryKey: [queryKeys.users, "isClerical", docType],
    queryFn: () => UserService.isClerical(docType),
    enabled,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    staleTime: 5 * 60 * 1000,
  });
};
/** ========== User and Organization queries ========== */
export const useGetUserSharedFile = (fileNames: string) => {
  return useQuery<number[]>({
    queryKey: [queryKeys.documentOut.root, "userSharedFile", fileNames],
    queryFn: () => UserService.getUserSharedFile(fileNames),
    ...COMMON_QUERY_OPTS,
    enabled: !!fileNames,
  });
};

export const useGetUserLeadOrgBanTransfer = () => {
  return useQuery<any>({
    queryKey: [queryKeys.documentOut.root, "userLeadOrgBanTransfer"],
    queryFn: () => UserService.getUserLeadOrgBanTransfer(),
    ...COMMON_QUERY_OPTS,
  });
};

export const useSearchUserOrgAll = () => {
  return useQuery<any[]>({
    queryKey: [queryKeys.documentOut.root, "searchUserOrgAll"],
    queryFn: () => UserService.searchUserOrgAll(),
    ...COMMON_QUERY_OPTS,
  });
};

export const useGetTreeUsers = () => {
  return useQuery<any[]>({
    queryKey: [queryKeys.documentOut.root, "treeUsers"],
    queryFn: () => UserService.getTreeUsers(),
    ...COMMON_QUERY_OPTS,
  });
};

export const useGetUserById = (userId: string | null) => {
  return useQuery<any>({
    queryKey: [queryKeys.documentOut.root, "userById", userId],
    queryFn: () => UserService.findByUserId(userId!),
    ...COMMON_QUERY_OPTS,
    enabled: !!userId,
  });
};

export const useSearchUsers = (searchParams: any, enabled: boolean = true) => {
  return useQuery({
    queryKey: [queryKeys.users.search, searchParams],
    queryFn: async () => {
      // Convert object to FormData inside the query function
      const formData = new FormData();
      Object.entries(searchParams).forEach(([key, value]) => {
        formData.append(key, String(value || ""));
      });
      return UserService.searchUser(formData);
    },
    enabled: enabled && !!searchParams,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useActiveDeactivateUser = () => {
  return useMutation({
    mutationFn: (user: any) => UserService.activeDeactiveUser(user),
  });
};

export const useResetPassword = () => {
  return useMutation({
    mutationFn: (ids: string) => UserService.resetPassword(ids),
  });
};

export const useGetUsersInformationActiveQuery = () => {
  return useQuery({
    queryKey: [queryKeys.users.getUsersInformationActive],
    queryFn: () => UserService.getUsersInformationActive(),
    enabled: typeof window !== "undefined",
  });
};

export const useGetAllUsersByOrgList = () => {
  return useMutation({
    mutationFn: async (params: { orgId: any }) => {
      return await UserService.getAllUsersByOrgList(params.orgId);
    },
  });
};
export const useCheckUserLinkIAM = () => {
  return useQuery({
    queryKey: [queryKeys.users.checkIam],
    queryFn: async () => {
      return UserService.getCheckUserLinkIAM();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useGetInfoUsers = () => {
  return useMutation({
    mutationFn: async (params: { listUserId: string }) => {
      return await UserService.getInfoUsers(params.listUserId);
    },
  });
};
