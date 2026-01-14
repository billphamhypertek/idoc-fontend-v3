import { queryKeys } from "@/definitions/constants/queryKey.constants";
import { ClericalOrgService } from "@/services/clerical-org.service";
import { useMutation, useQuery } from "@tanstack/react-query";

export const useGetClericalOrgListQuery = (params: Record<string, any>) => {
  return useQuery({
    queryKey: [queryKeys.clericalOrg.getList, params],
    queryFn: () => ClericalOrgService.getClericalOrgList(params),
    enabled: typeof window !== "undefined",
  });
};

export const useGetAllOrganizationsQuery = () => {
  return useQuery({
    queryKey: [queryKeys.organizations.all],
    queryFn: () => ClericalOrgService.getAllOrganizations(),
    enabled: typeof window !== "undefined",
  });
};

export const useEditClericalOrg = () => {
  return useMutation({
    mutationFn: ({ payload, userId }: { payload: number[]; userId: number }) =>
      ClericalOrgService.updateClericalOrg(payload, userId),
  });
};
