import { queryKeys } from "@/definitions";
import { GroupService, ContactGroup } from "@/services/group.service";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";

const COMMON_QUERY_OPTS = {
  refetchOnWindowFocus: false,
  refetchOnReconnect: false,
  refetchOnMount: false as const,
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000,
  placeholderData: keepPreviousData,
};

export const useSearchContactGroups = (
  searchParams: {
    groupName?: string;
    description?: string;
    active?: string;
    page?: number;
    sortBy?: string;
    direction?: string;
    size?: number;
  },
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [queryKeys.group.search, searchParams],
    queryFn: () => GroupService.searchContactGroup(searchParams),
    enabled: enabled && !!searchParams,
    ...COMMON_QUERY_OPTS,
  });
};

export const useAddContactGroup = () => {
  return useMutation({
    mutationFn: (group: ContactGroup) => GroupService.addGroup(group),
  });
};

export const useUpdateContactGroup = () => {
  return useMutation({
    mutationFn: (group: ContactGroup) => GroupService.updateGroup(group),
  });
};

export const useDeleteContactGroup = () => {
  return useMutation({
    mutationFn: (groupId: number) => GroupService.deleteGroup(groupId),
  });
};

export const useUpdateContactGroupStatus = () => {
  return useMutation({
    mutationFn: ({ groupId, active }: { groupId: number; active: boolean }) =>
      GroupService.updateStatus(groupId, active),
  });
};
