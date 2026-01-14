// src/services/dashboard.service.ts
import { sendGet } from "~/api/base-axios-protected-request";
import type { RawOrg } from "@/definitions/types/orgunit.type";

export const DashboardService = {
  // ===== CŨ =====
  searchKeywordAll: async (text: string) => {
    return sendGet(`/common/quick-search`, { text });
  },

  getTracking: async (params: {
    orgId: string;
    fromDate?: string;
    toDate?: string;
  }) => {
    const { orgId, fromDate, toDate } = params;
    return sendGet(`/dashboard/tracking`, { orgId, fromDate, toDate });
  },

  getTaskStatistic: async (params: {
    orgId: string;
    startDate?: string;
    endDate?: string;
  }) => {
    const { orgId, startDate, endDate } = params;
    return sendGet(`/task/statistic`, { orgId, startDate, endDate });
  },

  searchSuggestion: async (key: string) => {
    return sendGet(`/common/quick-search/key`, { key });
  },

  searchKeyword: async (text: string) => {
    const res = await sendGet(`/common/quick-search`, { text });
    return Array.isArray(res?.data) ? res.data : (res?.data?.objList ?? []);
  },

  searchKeywordPaged: async (text: string, page: number = 1) => {
    return sendGet(`/common/quick-search/${page}`, { text });
  },

  // ====== MỚI: lấy toàn bộ đơn vị active (dropdown tree) ======
  getOrgAllActiveSorted: async (): Promise<RawOrg[]> => {
    const res = await sendGet(`/org/getAllSort/ASC/order`, { active: true });
    return (res?.data ?? []) as RawOrg[];
  },

  // ====== MỚI (alias rõ nghĩa, dùng cho phòng/ban/LD) ======
  getTrackingByOrgId: async (
    orgId: string,
    fromDate?: string,
    toDate?: string
  ) => {
    return DashboardService.getTracking({ orgId, fromDate, toDate });
  },

  getTaskStatisticByOrgId: async (
    orgId: string,
    startDate?: string,
    endDate?: string
  ) => {
    return DashboardService.getTaskStatistic({ orgId, startDate, endDate });
  },
};
