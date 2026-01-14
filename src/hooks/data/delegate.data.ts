import { queryKeys } from "@/definitions/constants/queryKey.constants";
import { DelegateService } from "@/services/delegate.service";
import { useQuery } from "@tanstack/react-query";

export const useGetDocumentByHandleTypeAndStatusQuery = (
  handleType: number,
  status: number,
  params = {}
) => {
  return useQuery({
    queryKey: [
      queryKeys.delegate.getListByHandleTypeAndStatus,
      handleType,
      status,
      params,
    ],
    queryFn: () =>
      DelegateService.getDocumentByHandleTypeAndStatus(
        handleType,
        status,
        params
      ),
  });
};
