"use client";

import { useMemo, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Bell,
  Inbox,
  Upload,
  CalendarDays,
  CarFront,
  ClipboardList,
  BookOpen,
  Eye,
  Trash2,
  Clock,
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

import {
  useNotifications,
  useDeleteNotification,
  useMarkNotificationRead,
  useCheckRoleInNotification,
  useUnreadCount,
} from "@/hooks/data/notification.data";
import type { NotificationItem } from "@/services/notificationad.service";
import { toast } from "@/hooks/use-toast";
import { ToastUtils } from "@/utils/toast.utils";

/* ====== constants ====== */
const KNOWN_TYPES = [
  "Văn bản đến",
  "Văn bản đi",
  "Lịch",
  "Đăng ký dự trù xe",
  "Giao việc",
] as const;

const TABS: Array<{
  key: string;
  label: string;
  icon: React.ComponentType<any>;
}> = [
  { key: "ALL", label: "Tất cả", icon: Inbox },
  { key: "Văn bản đến", label: "Văn bản đến", icon: Inbox },
  { key: "Văn bản đi", label: "Văn bản đi", icon: Upload },
  { key: "Lịch", label: "Lịch", icon: CalendarDays },
  { key: "Đăng ký dự trù xe", label: "Dự trù xe", icon: CarFront },
  { key: "Giao việc", label: "Giao việc", icon: ClipboardList },
  { key: "Khác", label: "Khác", icon: BookOpen },
];

const accentOf = (t?: string) => {
  const k = (t || "").trim();
  if (k === "Văn bản đến") return "#2F76E6";
  if (k === "Văn bản đi") return "#F59BC0";
  if (k === "Lịch") return "#8B86FF";
  if (k === "Đăng ký dự trù xe") return "#FFA345";
  if (k === "Giao việc") return "#34D399";
  return "#22c6ab";
};

const TypeIcon = ({ type }: { type?: string }) => {
  const color = accentOf(type);
  const Icon =
    type === "Văn bản đến"
      ? Inbox
      : type === "Văn bản đi"
        ? Upload
        : type === "Lịch"
          ? CalendarDays
          : type === "Đăng ký dự trù xe"
            ? CarFront
            : type === "Giao việc"
              ? ClipboardList
              : BookOpen;

  return (
    <div
      className="mt-0.5 grid h-11 w-11 place-items-center rounded-xl"
      style={{ backgroundColor: `${color}26` }}
    >
      <Icon className="h-4 w-4" style={{ color }} />
    </div>
  );
};

function formatDateTimeVNFull(input: Date | string | number) {
  const d = new Date(input);
  const time = format(d, "p", { locale: vi });
  const weekday = format(d, "EEEE", { locale: vi });
  const day = format(d, "d", { locale: vi });
  const month = format(d, "M", { locale: vi });
  const year = format(d, "yyyy", { locale: vi });
  return `${time} ${weekday}, ${day} tháng ${month}, ${year}`;
}

export default function NotificationPage() {
  const router = useRouter();
  const [page] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [activeTab, setActiveTab] = useState<string>("ALL");

  const resolvedDocType = activeTab === "ALL" ? undefined : activeTab;
  const { data, isLoading, isError } = useNotifications(
    page,
    pageSize,
    resolvedDocType
  );
  const { data: unreadCount } = useUnreadCount();
  const deleteNotificationMutation = useDeleteNotification();
  const markReadMutation = useMarkNotificationRead();
  const checkRoleMutation = useCheckRoleInNotification();

  const notifications: NotificationItem[] = useMemo(
    () => data?.objList ?? [],
    [data]
  );
  const totalUnread = data?.totalUnread ?? 0;
  const totalRecords = data?.objList?.length ?? 0;

  const hasMoreNotifications = (notifications?.length ?? 0) < totalUnread;

  /** ===== Điều hướng kiểu mentor (trong component) ===== */
  const makeUrl = useCallback((path: string, q?: Record<string, any>) => {
    if (!q) return path;
    const qs = new URLSearchParams(
      Object.entries(q).reduce<Record<string, string>>((acc, [k, v]) => {
        if (v !== undefined && v !== null) acc[k] = String(v);
        return acc;
      }, {})
    ).toString();
    return qs ? `${path}?${qs}` : path;
  }, []);

  const navigateByNotification = useCallback(
    (notification: NotificationItem) => {
      const type = (notification.docType || "").trim();
      const status = (notification.docStatus || "").trim();
      const moduleCode = (notification.moduleCode || "").trim();
      const docId = notification.docId;

      if (type === "Lịch") {
        router.push("/calendar/business");
        return;
      }

      // === Đăng ký dự trù xe
      if (type === "Đăng ký dự trù xe") {
        router.push("/vehicle-usage-plan");
        return;
      }

      // === Giao việc
      if (type === "Giao việc") {
        switch (status) {
          case "CV_XU_LY_CHINH":
          case "CV_DA_DONG_XU_LY_CHINH":
          case "CV_XLC_TU_CHOI":
            router.push("/task/work");
            return;
          case "CV_PHOI_HOP":
          case "CV_DA_DONG_PHOI_HOP":
          case "CV_PH_TU_CHOI":
            router.push("/task/combination");
            return;
          default:
            router.push("/task/assign");
            return;
        }
      }

      // === Văn bản đi
      if (type === "Văn bản đi") {
        switch (status) {
          case "CHO_XU_LY":
          case "CHO_Y_KIEN":
          case "BI_TRA_LAI":
          case "CHO_XU_LY_UQ":
          case "BI_TRA_LAI_UQ":
          case "XU_LY_CHINH":
          case "PHOI_HOP":
          case "NHAN_DE_BIET":
            router.push(`/document-in/draft-handle/draft-detail/${docId}`);
            return;
          case "CHO_BAN_HANH":
            router.push(`/document-in/draft-issued/issued-detail/${docId}`);
            return;
          case "DA_BAN_HANH":
            router.push(`/document-in/list/draft-detail/${docId}`);
            return;
          case "TU_CHOI_TIEP_NHAN":
            if (moduleCode === "DRAFT_ISSUED") {
              router.push(
                makeUrl(`/document-in/draft-issued/issued-detail/${docId}`, {
                  currentTab: "issued",
                })
              );
              return;
            }
            router.push(`/document-in/draft-handle/draft-detail/${docId}`);
            return;
          default:
            router.push(`/document-in/draft-handle/draft-detail/${docId}`);
            return;
        }
      }

      // === Văn bản đến
      if (type === "Văn bản đến") {
        switch (status) {
          case "CHO_TIEP_NHAN":
            router.push(
              makeUrl(`/document-out/list/update/${docId}`, {
                currentTab: "waitTab",
              })
            );
            return;
          case "XU_LY_CHINH":
          case "PHOI_HOP":
          case "NHAN_DE_BIET":
          case "XIN_Y_KIEN":
          case "DA_Y_KIEN":
          case "DV_HOAN_THANH":
          case "DG_CHAP_NHAN":
          case "DG_TU_CHOI":
          case "XIN_DG":
          case "XIN_DG_UQ":
          case "CHI_DAO":
          case "MOI_DEN":
            router.push(`/document-out/main/detail/${docId}`);
            return;
          case "XU_LY_CHINH_UQ":
          case "PHOI_HOP_UQ":
          case "BI_TRA_LAI_UQ":
            router.push(`/delegate/in/detail/${docId}/true`);
            return;
          default:
            router.push(`/document-out/main/detail/${docId}`);
            return;
        }
      }

      // Fallback
      router.push("/");
    },
    [router, makeUrl]
  );

  /** ===== Actions ===== */
  const removeNotification = (notification: NotificationItem) =>
    deleteNotificationMutation.mutate(
      { id: notification.id },
      {
        onSuccess: () => {
          ToastUtils.success("Xóa thông báo thành công");
          setPageSize((prev) => prev + 1);
        },
        onError: () => ToastUtils.error("Xóa thông báo thất bại"),
      }
    );

  const openNotification = (notification: NotificationItem) => {
    if (
      notification.docStatus === "DA_THU_HOI" ||
      notification.docStatus === "DA_THU_HOI_BH"
    ) {
      markReadMutation.mutate({ id: notification.id });
      return;
    }
    checkRoleMutation.mutate(notification.id, {
      onSuccess: () => navigateByNotification(notification),
      onError: () => navigateByNotification(notification),
    });
  };

  return (
    <div className="px-4 pb-10">
      {/* header */}
      <header className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-blue-50 text-blue-600">
            <Bell className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Thông báo</h1>
            <p className="text-sm text-slate-500">
              Quản lý và theo dõi tất cả thông báo hệ thống quản lý văn bản
            </p>
          </div>
        </div>
        <span className="rounded-full bg-rose-100 px-3 py-1 text-sm font-medium text-rose-600">
          {(unreadCount ?? totalUnread) || 0} chưa đọc
        </span>
      </header>

      {/* tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-5">
        <TabsList className="h-auto w-full flex flex-wrap gap-2 bg-blue-50 p-2 rounded-xl">
          {TABS.map(({ key, label, icon: Icon }) => (
            <TabsTrigger
              key={key}
              value={key}
              className="data-[state=active]:bg-white data-[state=active]:text-slate-900 data-[state=active]:shadow-sm data-[state=active]:border data-[state=active]:border-blue-200
                         px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-white/60 inline-flex items-center gap-2"
            >
              <Icon className="h-4 w-4" />
              {label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* list */}
      {isError && (
        <p className="text-center text-red-600">Không tải được dữ liệu.</p>
      )}

      {isLoading && <p className="text-center text-slate-500">Đang tải...</p>}

      {!isLoading && notifications.length > 0 && (
        <ul className="space-y-3">
          {notifications.map((notification) => (
            <li
              key={notification.id}
              className="group flex items-start justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:shadow-md border-l-4 pl-3"
              style={{ borderLeftColor: "#86B6FF" }}
            >
              <button
                className="flex flex-1 items-start gap-3 text-left min-w-0"
                onClick={() => openNotification(notification)}
              >
                <TypeIcon type={notification.docType} />
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex items-center gap-2 flex-wrap">
                    <span className="truncate text-base font-semibold text-slate-800">
                      {notification.docType}
                    </span>
                    {!!notification.docStatusName && (
                      <Badge
                        variant="secondary"
                        className="bg-blue-100 text-blue-600 hover:bg-blue-100"
                      >
                        {notification.docStatusName}
                      </Badge>
                    )}
                  </div>
                  {notification.description && (
                    <p
                      className="prose prose-sm max-w-none text-slate-600 line-clamp-2 m-0"
                      dangerouslySetInnerHTML={{
                        __html: notification.description,
                      }}
                    />
                  )}
                  <time className="mt-1 flex items-center gap-1 text-xs text-slate-500">
                    <Clock className="h-3.5 w-3.5" />
                    <span>lúc {formatDateTimeVNFull(notification.date)}</span>
                  </time>
                </div>
              </button>

              <div className="ml-2 flex items-center gap-2 flex-shrink-0">
                {notification.read === false && (
                  <button
                    title="Mở / đánh dấu đã xem"
                    onClick={() => openNotification(notification)}
                    className="grid h-9 w-8 place-items-center rounded-full text-blue-600 hover:bg-blue-50"
                    aria-label="Đánh dấu đã đọc"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                )}
                <button
                  title="Xóa thông báo"
                  onClick={() => removeNotification(notification)}
                  className="grid h-9 w-8 place-items-center rounded-full text-red-600 hover:bg-red-50"
                  aria-label="Xóa thông báo"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {!isLoading && notifications.length === 0 && (
        <p className="py-8 text-center text-sm text-slate-500">
          Không có dữ liệu được tìm thấy
        </p>
      )}

      {/* load more */}
      {hasMoreNotifications && notifications.length > 0 && (
        <button
          onClick={() => setPageSize((prev) => prev + 10)}
          className="mt-6 mx-auto flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14"></path>
            <path d="M19 12l-7 7-7-7"></path>
          </svg>
          Tải thêm
        </button>
      )}

      {!hasMoreNotifications && notifications.length > 0 && (
        <p className="mt-6 text-center text-sm text-slate-500">
          Đã hiển thị toàn bộ thông báo.
        </p>
      )}
    </div>
  );
}
