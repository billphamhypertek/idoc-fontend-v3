// src/hooks/data/dashboard.data.ts
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { DashboardService } from "@/services/dashboard.service";
import {
  buildOrgTree,
  type OrgTreeNode,
  type RawOrg,
} from "@/definitions/types/orgunit.type";

// ========= HOOKS CŨ =========

export const useSearchKeywordPaged = (text: string, page: number) => {
  return useQuery({
    queryKey: ["search-keyword-paged", text, page],
    queryFn: async () => {
      if (!text) return { totalPage: 0, totalRecord: 0, objList: [] };
      const res = await DashboardService.searchKeywordPaged(text, page);
      return res?.data ?? { totalPage: 0, totalRecord: 0, objList: [] };
    },
    enabled: !!text,
  });
};

export const useGetDashboardTracking = (
  orgId: string,
  fromDate?: Date,
  toDate?: Date
) => {
  const fmt = (d?: Date) =>
    d
      ? [
          d.getFullYear(),
          String(d.getMonth() + 1).padStart(2, "0"),
          String(d.getDate()).padStart(2, "0"),
        ].join("-")
      : undefined;

  return useQuery({
    queryKey: ["dashboard-tracking", orgId ?? "", fromDate, toDate],
    queryFn: async () => {
      return DashboardService.getTracking({
        orgId: orgId ?? "",
        fromDate: fromDate ? fmt(fromDate) : undefined,
        toDate: toDate ? fmt(toDate) : undefined,
      });
    },
    enabled: true, // luôn gọi, kể cả orgId=""
  });
};

export const useGetTaskStatistic = (
  orgId: string,
  startDate?: Date,
  endDate?: Date
) => {
  const fmt = (d?: Date) =>
    d
      ? [
          d.getFullYear(),
          String(d.getMonth() + 1).padStart(2, "0"),
          String(d.getDate()).padStart(2, "0"),
        ].join("-")
      : undefined;

  return useQuery({
    queryKey: ["task-statistic", orgId ?? "", startDate, endDate],
    queryFn: async () => {
      return DashboardService.getTaskStatistic({
        orgId: orgId ?? "",
        startDate: startDate ? fmt(startDate) : undefined,
        endDate: endDate ? fmt(endDate) : undefined,
      });
    },
    enabled: true,
  });
};

export const useSearchSuggestion = (key: string) => {
  return useQuery({
    queryKey: ["search-suggestion", key],
    queryFn: async () => {
      if (!key) return [];
      const res = await DashboardService.searchSuggestion(key);
      return res?.data ?? [];
    },
    enabled: !!key,
  });
};

export const useSearchKeyword = (text: string) => {
  return useQuery({
    queryKey: ["search-keyword", text],
    queryFn: async () => {
      if (!text) return [];
      return DashboardService.searchKeyword(text);
    },
    enabled: !!text,
  });
};

// ========= HOOK MỚI: TREE ĐƠN VỊ =========

export const useOrgTree = () => {
  const query = useQuery<RawOrg[]>({
    queryKey: ["org-tree", "all-active-sorted"],
    queryFn: () => DashboardService.getOrgAllActiveSorted(),
    staleTime: 5 * 60 * 1000,
  });

  const tree: OrgTreeNode[] = useMemo(
    () => (Array.isArray(query.data) ? buildOrgTree(query.data) : []),
    [query.data]
  );

  return { ...query, tree };
};

// ========= HOOKS MỚI: “học theo code cũ” cho phòng/ban/LD =========

/**
 * Bản alias rõ nghĩa: gọi tracking theo orgId (đơn vị/phòng/LD).
 * Vẫn format ngày giống hooks cũ để đồng bộ backend.
 */
export const useGetDashboardTrackingByOrgId = (
  orgId: string,
  fromDate?: Date,
  toDate?: Date
) => {
  const fmt = (d?: Date) =>
    d
      ? [
          d.getFullYear(),
          String(d.getMonth() + 1).padStart(2, "0"),
          String(d.getDate()).padStart(2, "0"),
        ].join("-")
      : undefined;

  return useQuery({
    queryKey: ["dashboard-tracking-by-org", orgId ?? "", fromDate, toDate],
    queryFn: async () => {
      return DashboardService.getTrackingByOrgId(
        orgId ?? "",
        fromDate ? fmt(fromDate) : undefined,
        toDate ? fmt(toDate) : undefined
      );
    },
    enabled: true,
  });
};

/**
 * Bản alias rõ nghĩa: gọi thống kê nhiệm vụ theo orgId (đơn vị/phòng/LD).
 */
export const useGetTaskStatisticByOrgId = (
  orgId: string,
  startDate?: Date,
  endDate?: Date
) => {
  const fmt = (d?: Date) =>
    d
      ? [
          d.getFullYear(),
          String(d.getMonth() + 1).padStart(2, "0"),
          String(d.getDate()).padStart(2, "0"),
        ].join("-")
      : undefined;

  return useQuery({
    queryKey: ["task-statistic-by-org", orgId ?? "", startDate, endDate],
    queryFn: async () => {
      return DashboardService.getTaskStatisticByOrgId(
        orgId ?? "",
        startDate ? fmt(startDate) : undefined,
        endDate ? fmt(endDate) : undefined
      );
    },
    enabled: true,
  });
};

/**
 * Tiện lợi: nhận trực tiếp OrgTreeNode (đơn vị/phòng/LD),
 * tự suy ra orgId cần gọi API. Mặc định lấy chính node id (“self”).
 * Nếu muốn luôn lấy theo cha khi chọn Phòng/LD, set useParentForRoomOrLeader=true.
 */
export const useDashboardByNode = (
  node: OrgTreeNode | undefined,
  fromDate?: Date,
  toDate?: Date,
  opts?: { useParentForRoomOrLeader?: boolean }
) => {
  const targetOrgId = useMemo(() => {
    if (!node) return "";
    if (opts?.useParentForRoomOrLeader && node.type !== "org") {
      return node.parentId ?? node.id;
    }
    return node.id;
  }, [node, opts?.useParentForRoomOrLeader]);

  const tracking = useGetDashboardTrackingByOrgId(
    targetOrgId,
    fromDate,
    toDate
  );
  const tasks = useGetTaskStatisticByOrgId(targetOrgId, fromDate, toDate);

  return { orgId: targetOrgId, tracking, tasks };
};
