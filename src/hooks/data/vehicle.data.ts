import {
  CalendarData,
  Organization,
  PermissionData,
  queryKeys,
  StartNode,
  User,
  VehicleDetail,
  VehicleDetailSlot,
  VehicleDriver,
  VehicleListResponse,
  WeekData,
} from "@/definitions";
import { VehicleService } from "@/services/vehicle.service";
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

export const useGetListVehicle = (params: Record<string, any>) => {
  return useQuery<VehicleListResponse>({
    queryKey: [queryKeys.vehicle.list, params],
    queryFn: () => VehicleService.getListVehicle(params),
    placeholderData: keepPreviousData,
  });
};

export const useGetListVehicleFindAll = (params: Record<string, any>) => {
  return useQuery<VehicleListResponse>({
    queryKey: [queryKeys.vehicle.list, "find-all", params],
    queryFn: () => VehicleService.getListVehicleFindAll(params),
    placeholderData: keepPreviousData,
  });
};
export const useGetUsersForNode = (nodeId: number) => {
  return useQuery<User[]>({
    queryKey: [queryKeys.vehicle.nodeUsers, nodeId],
    queryFn: () => VehicleService.getUsersForNode(nodeId),
    enabled: !!nodeId,
  });
};

export const useGetAllOrganizations = () => {
  return useQuery<Organization[]>({
    queryKey: [queryKeys.organizations.all],
    queryFn: () => VehicleService.getAllOrganizations(),
  });
};

export const useGetStartNodes = () => {
  return useQuery<StartNode[]>({
    queryKey: [queryKeys.bpmn.startNodes],
    queryFn: () => VehicleService.getStartNodes(),
  });
};

export const useGetUserAssignTasks = (
  orgId: number,
  enabled: boolean = true
) => {
  return useQuery<User[]>({
    queryKey: [queryKeys.users.assignTasks, orgId],
    queryFn: () => VehicleService.getUserAssignTasks(orgId),
    enabled: !!orgId && enabled,
  });
};

export const useGetVehicleDetail = (id: number, enable: boolean) => {
  return useQuery<VehicleDetail>({
    queryKey: [queryKeys.vehicle.detail, id],
    queryFn: () => VehicleService.getDetailToShow(id),
    enabled: !!id && enable,
  });
};

export function useGetVehicleUsagePlanComments(id: number, enabled = true) {
  return useQuery({
    queryKey: [queryKeys.comments.vehicleUsagePlan, id],
    queryFn: () => VehicleService.getVehicleUsagePlanComments(id),
    enabled: !!id && enabled,
  });
}

export function useCreateCommentVehicleUsagePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (commentData: { type: string; comment: string; id: number }) =>
      VehicleService.createCommentVehicleUsagePlan(commentData),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: [queryKeys.comments.vehicleUsagePlan, variables.id],
      });
    },
  });
}

export const useTransferHandleList = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (transferData: {
      usagePlanId: number;
      comment: string;
      handler: number[];
      currentNode: number;
      nextNode: number;
    }) => VehicleService.transferHandleList(transferData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.vehicle.list] });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.vehicle.listAll],
      });
    },
    onError: (error) => {
      console.error("Lỗi chuyển xử lý:", error);
    },
  });
};

export const useDeleteVehicleUsagePlan = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => VehicleService.deleteVehicleUsagePlan(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [queryKeys.vehicle.list] });
      queryClient.invalidateQueries({
        queryKey: [queryKeys.vehicle.listAll],
      });
    },
    onError: (error) => {
      console.error("Lỗi xóa kế hoạch sử dụng xe:", error);
    },
  });
};

export const useGetListLeaderById = (id: number, enable: boolean = false) => {
  return useQuery({
    queryKey: [queryKeys.lead.info, id],
    queryFn: () => VehicleService.getListLeadById(id),
    enabled: !!id && enable,
  });
};

export const useCreateVehicleUsagePlan = () => {
  return useMutation({
    mutationFn: (data: any) => VehicleService.createVehicleUsagePlan(data),
  });
};

export const useUpdateVehicleUsagePlan = () => {
  return useMutation({
    mutationFn: (data: any) => VehicleService.updateVehicleUsagePlan(data),
  });
};

export const useGetListTracking = (
  id: number,
  page: number,
  enable: boolean = true
) => {
  return useQuery({
    queryKey: [queryKeys.vehicle.tracking, id, page],
    queryFn: () => VehicleService.getListTracking(id, page),
    enabled: !!id && enable,
    placeholderData: keepPreviousData,
  });
};

export const useCheckPermissionBan = () => {
  return useQuery<PermissionData>({
    queryKey: [queryKeys.calendar?.permissionBan ?? "calendar/permission-ban"],
    queryFn: () => VehicleService.checkPermissionBan(),
  });
};

export const useGetCalendarsByMonth = (
  orgType: number,
  month: number,
  year: number
) => {
  return useQuery<CalendarData[]>({
    queryKey: [
      queryKeys.calendar?.byMonth ?? "calendar/by-month",
      orgType,
      month,
      year,
    ],
    queryFn: () => VehicleService.getCalendarsByMonth(orgType, { month, year }),
  });
};

export const useGetVehicleCalendarByWeek = (
  orgType: "DEPARTMENT" | "ORG",
  week: number,
  year: number
) => {
  return useQuery<WeekData>({
    queryKey: [
      queryKeys.calendar?.byWeek ?? "calendar/by-week",
      orgType,
      week,
      year,
    ],
    queryFn: () =>
      VehicleService.getVehicleCalendarByWeek(orgType, { week, year }),
  });
};

export const useGetVehicleDetailSlot = (id?: number) => {
  return useQuery<VehicleDetailSlot>({
    queryKey: [queryKeys.vehicle.detailSlot ?? "vehicle/detail-slot", id],
    queryFn: () => VehicleService.getDetailToEdit(id),
    enabled: !!id,
  });
};

export const useGetListSuggestVehicleDriver = (id: number) => {
  return useQuery<VehicleDriver[]>({
    queryKey: [queryKeys.vehicle.suggestDriver ?? "vehicle/suggest-driver", id],
    queryFn: () => VehicleService.getListSuggestVehicleDriver(id),
    enabled: !!id,
  });
};

export const useFindByOrgCVV = (enabled: boolean = true) => {
  return useQuery<Organization[]>({
    queryKey: [queryKeys.organizations.orgCVV ?? "organizations/org-cvv"],
    queryFn: () => VehicleService.findByOrgCVV(),
    enabled: enabled,
  });
};

export const useRetakeDraft = () => {
  return useMutation({
    mutationFn: (id: number) => VehicleService.retakeDraft(id),
  });
};

export const useAcceptDraft = () => {
  return useMutation({
    mutationFn: (id: number) => VehicleService.acceptDraft(id),
  });
};

export const useUpdateDraft = () => {
  return useMutation({
    mutationFn: (data: any) => VehicleService.updateDraft(data),
  });
};

export const useCompleteDraft = () => {
  return useMutation({
    mutationFn: (listIds: number[]) => VehicleService.completeDraft(listIds),
  });
};

export const useRejectDraft = () => {
  return useMutation({
    mutationFn: ({ id, comment }: { id: number; comment: string }) =>
      VehicleService.rejectDraft(id, comment),
  });
};

export const useMenuBadge = () => {
  return useQuery({
    queryKey: [queryKeys.vehicle.menuBadge],
    queryFn: () => VehicleService.getMenuBadge(),
  });
};
