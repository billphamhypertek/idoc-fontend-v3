import { useQuery } from "@tanstack/react-query";
import OutsideSystemService from "@/services/outside-system.service";
import { queryKeys } from "@/definitions";

export const useGetOutTrackingSystem = (
  docId: string,
  page: number,
  enable: boolean = true
) => {
  return useQuery({
    queryKey: [queryKeys.outsideSystem.lgspTracking, docId, page],
    queryFn: () => OutsideSystemService.getOutTrackingSystem(docId, page),
    enabled: enable,
  });
};
