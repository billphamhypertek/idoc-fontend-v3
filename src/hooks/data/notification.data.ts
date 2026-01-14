import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import {
  NotificationItem,
  NotificationListResponse,
  NotificationService,
} from "@/services/notificationad.service";

export function decorateNotification(n: NotificationItem): NotificationItem {
  const t = (n.docType || "").trim();
  if (t === "Văn bản đến")
    return { ...n, icon: "ti-archive", color: "#2F76E6" };
  if (t === "Văn bản đi") return { ...n, icon: "ti-share", color: "#F59BC0" };
  if (t === "Lịch") return { ...n, icon: "ti-calendar", color: "#8B86FF" };
  if (t === "Đăng ký dự trù xe")
    return { ...n, icon: "ti-car", color: "#FFA345" };
  if (t === "Giao việc") return { ...n, icon: "ti-stamp", color: "#34D399" };
  return { ...n, icon: "ti-book", color: "#22c6ab" };
}

const QK = {
  list: "notifications/list",
  unreadCount: "notifications/unread-count",
} as const;

export function useNotifications(page: number, size: number, docType?: string) {
  return useQuery({
    queryKey: [QK.list, page, size, docType ?? "ALL"],
    queryFn: ({ signal }) =>
      NotificationService.getAllNotification(page, size, signal, docType),
    select: (res: NotificationListResponse): NotificationListResponse => ({
      ...res,
      objList: (res.objList || []).map(decorateNotification),
    }),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });
}

export function useDeleteNotification() {
  const qc = useQueryClient();
  return useMutation<any, unknown, Pick<NotificationItem, "id">>({
    mutationFn: (payload) => NotificationService.deleteNotById(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK.list] });
      qc.invalidateQueries({ queryKey: [QK.unreadCount] });
    },
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation<any, unknown, Pick<NotificationItem, "id">>({
    mutationFn: (payload) => NotificationService.updateStatus(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK.list] });
      qc.invalidateQueries({ queryKey: [QK.unreadCount] });
    },
  });
}

export function useCheckRoleInNotification() {
  return useMutation({
    mutationFn: (id: number | string) =>
      NotificationService.checkRoleInNotification(id),
  });
}

export function useUnreadCount() {
  return useQuery({
    queryKey: [QK.unreadCount],
    queryFn: ({ signal }) => NotificationService.countUnread(signal),
    refetchInterval: 60_000,
    staleTime: 30_000,
  });
}
