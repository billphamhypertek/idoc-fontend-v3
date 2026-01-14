// src/services/trackdoc.service.ts
import { sendGet, sendPost } from "~/api/base-axios-protected-request";

export const TrackDocService = {
  // Lấy dữ liệu thống kê văn bản theo ngày
  getAllDataDocReports: async (
    fromDate: string,
    toDate: string,
    orgId: string = ""
  ) => {
    const res = await sendGet(`/dashboard/tracking`, {
      fromDate,
      toDate,
      orgId,
    });
    return res?.data ?? res;
  },

  downloadReporDocExcel: async (fromDate: string, toDate: string) => {
    const { protectedAxiosInstance } = await import("~/api/axiosInstances");
    return protectedAxiosInstance
      .get(`/dashboard/export`, {
        params: { fromDate, toDate },
        responseType: "blob",
      })
      .then((res) => res.data);
  },

  // Lấy danh sách văn bản đến để theo dõi
  trackDocumentInList: async (page: string, params: any) => {
    const res = await sendPost(`/document/find_all_doc/${page}`, params);
    return res?.data ?? res;
  },

  // Lấy danh sách văn bản đi để theo dõi
  trackDocumentOutList: async (page: string, params: any) => {
    const res = await sendPost(`/document_out/find_all_doc/${page}`, params);
    return res?.data ?? res;
  },
};
