import { useQuery } from "@tanstack/react-query";
import { WatchListService } from "@/services/watch-list.service";
import {
  WatchListParams,
  WatchListResponse,
} from "@/definitions/types/watch-list.type";
import { UserService } from "@/services/user.service";
import { useSearchParams } from "next/navigation";
import { queryKeys } from "@/definitions";

export const useGetWatchListByOrg = (params: WatchListParams) => {
  return useQuery<WatchListResponse[]>({
    queryKey: [queryKeys.manageWatchList.list, params],
    queryFn: async () => {
      return await WatchListService.getWatchListByOrg(params);
    },
  });
};

export const useGetTaskLeadByOrgId = (orgId: number) => {
  return useQuery({
    queryKey: [queryKeys.lead.info, orgId],
    queryFn: async () => {
      if (!orgId) return null;
      return await WatchListService.getTaskLeadByOrgId(orgId);
    },
    enabled: !!orgId,
  });
};

export const useGetListOrgWaitFinish = (fromDate: string, toDate: string) => {
  const getCurrentTab = useSearchParams();
  const currentTab = getCurrentTab?.get("tab");
  return useQuery({
    queryKey: [queryKeys.manageWatchList.listOrgWaitFinish, fromDate, toDate],
    queryFn: async () => {
      return await WatchListService.getListOrgWaitFinish(fromDate, toDate);
    },
    enabled: currentTab === "waitApprove",
  });
};

export const useGetOrgParentByOrgId = (childId: number) => {
  return useQuery({
    queryKey: [queryKeys.manageWatchList.orgParent, childId],
    queryFn: async () => {
      return await WatchListService.getOrgParentByOrgId(childId);
    },
    enabled: !!childId,
  });
};

export const useGetUserByOrgId = (orgId: number) => {
  return useQuery({
    queryKey: [queryKeys.users.listUserByOrg, orgId],
    queryFn: async () => {
      return await UserService.doLoadUserByOrgId(orgId.toString());
    },
    enabled: !!orgId,
  });
};

export const useCheckStatusWatchList = (
  orgId: number,
  fromDate: string,
  toDate: string,
  statuses: string,
  exist: boolean,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [
      queryKeys.manageWatchList.checkStatusWatchList,
      orgId,
      fromDate,
      toDate,
      statuses,
      exist,
    ],
    queryFn: async () => {
      return await WatchListService.checkStatusWatchList(
        orgId,
        fromDate,
        toDate,
        statuses,
        exist
      );
    },
    enabled: enabled && !!orgId,
  });
};
