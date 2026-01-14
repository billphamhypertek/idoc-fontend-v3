import { queryKeys } from "@/definitions";
import { ReportService } from "@/services/report.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { DailyReportDataInit } from "@/definitions/types/report.type";
import { toast } from "@/hooks/use-toast";
import { UserService } from "@/services/user.service";
import { saveFile } from "@/utils/common.utils";
import { OrganizationService } from "@/services/organization.service";
import { ToastUtils } from "@/utils/toast.utils";

export const useSearchUnconfirmedReport = (
  body: any,
  page: number,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [queryKeys.report.unconfirmedReport, body, page],
    queryFn: async () =>
      await ReportService.searchUnconfirmedReport(body, page),
    enabled: enabled,
  });
};

export const useSearchVerifiedReport = (
  body: any,
  page: number,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [queryKeys.report.verifiedReport, body, page],
    queryFn: async () => await ReportService.searchVerifiedReport(body, page),
    enabled: enabled,
  });
};

export const useSearchTitleList = (enabled: boolean = true) => {
  return useQuery({
    queryKey: [queryKeys.report.titleList],
    queryFn: async () => await ReportService.searchTitleList(),
    enabled: enabled,
  });
};

export const useSearchSignerList = (params: any, enabled: boolean = true) => {
  return useQuery({
    queryKey: [queryKeys.report.signerList],
    queryFn: async () => await ReportService.searchSignerList(params),
    enabled: enabled,
  });
};

export const useGetSignerReport = (
  position: string,
  page: number,
  size: number,
  enabled: boolean = true
) => {
  return useQuery({
    queryKey: [queryKeys.report.signerList, position],
    queryFn: async () =>
      await UserService.getSignerReport(position, page, size),
    enabled: enabled,
  });
};

export const useAddReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (report: DailyReportDataInit) =>
      await ReportService.addReport(report),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.report.unconfirmedReport],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.report.verifiedReport],
      });
      ToastUtils.success("Thêm báo cáo thành công");
    },
    onError: (error: any) => {
      ToastUtils.error(error.message || "Có lỗi xảy ra khi thêm báo cáo");
    },
  });
};

export const useUpdateReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      report,
      id,
    }: {
      report: DailyReportDataInit;
      id: number;
    }) => await ReportService.updateReport(report, id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.report.unconfirmedReport],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.report.verifiedReport],
      });
      ToastUtils.success("Cập nhật báo cáo thành công");
    },
    onError: (error: any) => {
      ToastUtils.error(error.message || "Có lỗi xảy ra khi cập nhật báo cáo");
    },
  });
};

export const useApproveReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => await ReportService.approveReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.report.unconfirmedReport],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.report.verifiedReport],
      });
      ToastUtils.success("Duyệt báo cáo thành công");
    },
    onError: (error: any) => {
      ToastUtils.error(error.message || "Có lỗi xảy ra khi duyệt báo cáo");
    },
  });
};

export const useRejectReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => await ReportService.rejectReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.report.unconfirmedReport],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.report.verifiedReport],
      });
      ToastUtils.success("Hủy duyệt báo cáo thành công");
    },
    onError: (error: any) => {
      ToastUtils.error(error.message || "Có lỗi xảy ra khi hủy duyệt báo cáo");
    },
  });
};

export const useDeleteReport = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => await ReportService.deleteReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.report.unconfirmedReport],
      });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.report.verifiedReport],
      });
      ToastUtils.success("Xóa báo cáo thành công");
    },
    onError: (error: any) => {
      ToastUtils.error(error.message || "Có lỗi xảy ra khi xóa báo cáo");
    },
  });
};

export const useExportReport = () => {
  return useMutation({
    mutationFn: async (id: number) => await ReportService.exportFileReport(id),
  });
};

export const useExportAllReports = () => {
  return useMutation({
    mutationFn: async (body: any) =>
      await ReportService.exportFileReportAll(body),
  });
};

export const useGetOrganization = (enabled: boolean = true) => {
  return useQuery({
    queryKey: [queryKeys.report.organization],
    queryFn: async () => await OrganizationService.getOrganizations(),
    enabled: enabled,
  });
};

export const useGetReport = (id: number, enabled: boolean = true) => {
  return useQuery({
    queryKey: [queryKeys.report.reportList],
    queryFn: async () => await ReportService.getReport(id),
    enabled: enabled,
  });
};
