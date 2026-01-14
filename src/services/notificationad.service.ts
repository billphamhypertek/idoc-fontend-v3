import { sendGet, sendPost } from "@/api";

export type DocType =
  | "Văn bản đến"
  | "Văn bản đi"
  | "Lịch"
  | "Đăng ký dự trù xe"
  | "Giao việc";

export interface NotificationItem {
  id: number;
  read: boolean;
  docType: DocType | string;
  docStatus: string;
  docStatusName?: string;
  description?: string;
  date: string | number | Date;
  docId?: number | string;
  moduleCode?: string | null;
  icon?: string;
  color?: string;
}

export interface NotificationListResponse {
  objList: NotificationItem[];
  totalUnread: number;
}

export class NotificationService {
  static async getAllNotification(
    page: number,
    pageSize: number,
    signal?: AbortSignal,
    docType?: string
  ): Promise<NotificationListResponse> {
    const params = docType ? { doctype: docType } : undefined;
    const response = await sendGet(
      `/notification/get/${page}/${pageSize}`,
      params,
      { signal }
    );
    return response.data as NotificationListResponse;
  }

  static async getAllListNotification(
    page: number,
    pageSize: number,
    signal?: AbortSignal
  ): Promise<NotificationListResponse> {
    const response = await sendGet(
      `/notification/getAll`,
      { page, size: pageSize },
      { signal }
    );
    return response.data as NotificationListResponse;
  }

  static async getAllNotificationToken(
    page: number,
    pageSize: number,
    signal?: AbortSignal
  ): Promise<NotificationListResponse> {
    const response = await sendGet(
      `/notification/get/${page}/${pageSize}`,
      { encrypt: true },
      { signal }
    );
    return response.data as NotificationListResponse;
  }

  static async getAllTotal(signal?: AbortSignal): Promise<number> {
    const response = await sendGet(`/notification/getTotal`, undefined, {
      signal,
    });
    return response.data as number;
  }

  static async deleteNotById(
    idObj: Pick<NotificationItem, "id">
  ): Promise<any> {
    const response = await sendPost(`/notification/delete/${idObj.id}`, {});
    return response.data;
  }

  static async updateStatus(idObj: Pick<NotificationItem, "id">): Promise<any> {
    const response = await sendPost(`/notification/setRead/${idObj.id}`, {});
    return response.data;
  }

  static async deleteAll(): Promise<any> {
    const response = await sendPost(`/notification/deleteAll`, {});
    return response.data;
  }

  static async checkRoleInNotification(
    notiId: number | string
  ): Promise<{ listModule: any[] | null; roleId?: number }> {
    const response = await sendPost(`/notification/checkModule/${notiId}`, {});
    return response.data;
  }

  static async countUnread(signal?: AbortSignal): Promise<number> {
    const response = await sendGet(`/notification/countUnread`, undefined, {
      signal,
    });
    return response.data as number;
  }
}
