import { CommonService } from "@/services/common";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/definitions";

export const useUserLeadOrgBanTransferQuery = (tagId: string | null) => {
  return useQuery({
    queryKey: [queryKeys.users.userLeadOrgBanTransfer, tagId],
    queryFn: () => {
      if (!tagId) throw new Error("Tag ID is required");
      return CommonService.getUserLeadOrgBanTransfer();
    },
    enabled: !!tagId,
  });
};
export const useUserFromOrg = (orgId: string | null, params: any) => {
  return useQuery({
    queryKey: [queryKeys.users.getByOrgs, orgId, params],
    queryFn: () => {
      if (!orgId) throw new Error("Tag ID is required");
      return CommonService.getUserFromOrg(orgId, params);
    },
    enabled: !!orgId,
  });
};
export const useUserByAuthority = () => {
  return useQuery({
    queryKey: [queryKeys.users.getByAuthority],
    queryFn: () => {
      return CommonService.getUserByAuthority();
    },
  });
};
export const useOutsideAgency = (
  name: string | null,
  page: number,
  enabled: boolean
) => {
  return useQuery({
    queryKey: [queryKeys.users.getByOutsideAgency, name, page],
    queryFn: () => {
      return CommonService.getOutsideAgency(name, page);
    },
    enabled: enabled,
  });
};
export const useDocumentTemplate = (params: Record<string, any>) => {
  return useQuery({
    queryKey: [queryKeys.users.getDocumentTemplate, params],
    queryFn: () => {
      return CommonService.getDocumentTemplate(params);
    },
  });
};
export const useDraftDocumentTemplate = (
  params: Record<string, any>,
  enable: boolean
) => {
  return useQuery({
    queryKey: [queryKeys.users.getDraftDocumentInTemplate, params],
    queryFn: () => {
      return CommonService.getDraftDocumentTemplate(params);
    },
    enabled: enable,
  });
};
