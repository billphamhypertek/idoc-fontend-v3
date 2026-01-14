import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/definitions";
import { LogBusinessService } from "@/services/log-business.service";

export const useLogBusinessQuery = (params: Record<string, any>) => {
  const formData = new FormData();
  Object.entries(params).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return useQuery({
    queryKey: [queryKeys.logBusiness.root, params],
    queryFn: () => LogBusinessService.getLogBusiness(formData),
    enabled: typeof window !== "undefined",
    staleTime: 5 * 60 * 1000, // 5 phút - dữ liệu được coi là fresh trong 5 phút
    gcTime: 10 * 60 * 1000, // 10 phút - cache sẽ bị xóa sau 10 phút
    refetchOnWindowFocus: false, // Không tự động refetch khi quay lại tab
    refetchOnMount: false, // Không tự động refetch khi component mount lại
    retry: 1, // Chỉ retry 1 lần nếu fail
  });
};

export const useLogBusinessExcelQuery = (
  params: Record<string, any>,
  enabled: boolean = false
) => {
  const formData = new FormData();
  Object.entries(params).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return useQuery({
    queryKey: [queryKeys.logBusiness.excel, params],
    queryFn: () => LogBusinessService.getLogBusinessExcel(formData),
    enabled: enabled && typeof window !== "undefined",
    staleTime: 5 * 60 * 1000, // 5 phút
    gcTime: 10 * 60 * 1000, // 10 phút
    refetchOnWindowFocus: false, // Không tự động refetch khi quay lại tab
    refetchOnMount: false, // Không tự động refetch khi component mount lại
    retry: 1, // Chỉ retry 1 lần nếu fail
  });
};

export const useGetMapCategory = () => {
  return useQuery({
    queryKey: [queryKeys.logBusiness.mapCategory],
    queryFn: () => LogBusinessService.getMapCategory(),
    enabled: typeof window !== "undefined",
  });
};
