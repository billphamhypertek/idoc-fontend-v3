import { sendGet, sendPost } from "@/api";
import {
  CalendarData,
  LeadInformation,
  Organization,
  PermissionData,
  StartNode,
  TrackingResponse,
  User,
  VehicleDetail,
  VehicleDetailSlot,
  VehicleDriver,
  VehicleListResponse,
  WeekData,
} from "@/definitions";

export class VehicleService {
  static async getListVehicle(
    params: Record<string, any>
  ): Promise<VehicleListResponse> {
    const response = await sendGet("/vehicle-usage-plan/list-all", params);
    return response.data as VehicleListResponse;
  }

  static async getListVehicleFindAll(
    params: Record<string, any>
  ): Promise<VehicleListResponse> {
    const response = await sendGet("/vehicle-usage-plan/find-all", params);
    return response.data as VehicleListResponse;
  }

  static async getUsersForNode(nodeId: number): Promise<User[]> {
    const response = await sendGet(`/bpmn2/node/${nodeId}/users`);
    return response.data;
  }

  static async getAllOrganizations(): Promise<Organization[]> {
    const response = await sendGet("/org/getAllSort/ASC/order", {
      active: true,
    });
    return response.data;
  }

  static async getStartNodes(): Promise<StartNode[]> {
    const response = await sendGet("/bpmn2/get-start-node/EXAM_FOR_OTHERS");
    return response.data;
  }

  static async getUserAssignTasks(orgId: number): Promise<User[]> {
    const response = await sendGet(
      `/users/getListUserAssignTask?orgId=${orgId}`
    );
    return response.data;
  }

  static async getDetailToShow(id: number): Promise<VehicleDetail> {
    const response = await sendGet(`/vehicle-usage-plan/getDetailToShow/${id}`);
    return response.data;
  }

  static async createCommentVehicleUsagePlan(commentData: {
    type: string;
    comment: string;
    id: number;
  }): Promise<any> {
    const response = await sendPost(
      `/common/comment/add/${commentData.id}`,
      commentData
    );
    return response.data;
  }

  static async getVehicleUsagePlanComments(id: number): Promise<any[]> {
    const response = await sendGet(
      `/vehicle-usage-plan/vehicle-comment/${id}`,
      {}
    );
    return response.data;
  }

  static async transferHandleList(transferData: {
    usagePlanId: number;
    comment: string;
    handler: number[];
    currentNode: number;
    nextNode: number;
  }): Promise<any> {
    const response = await sendPost(
      "/vehicle-usage-plan/transferHandleList",
      transferData
    );
    return response.data;
  }

  static async deleteVehicleUsagePlan(id: number): Promise<any> {
    const response = await sendPost(`/vehicle-usage-plan/delete/${id}`, {});
    return response.data;
  }

  static async getDocumentFile(id: number): Promise<any> {
    const response = await sendGet(
      `/vehicle-usage-plan/attachment/download/${id}`,
      null,
      {
        responseType: "blob",
      }
    );
    return response;
  }

  static async getCommentAttachmentFile(
    fileNameOrId: string | number
  ): Promise<any> {
    const response = await sendGet(
      `/vehicle-attach-comment/download/${fileNameOrId}`,
      null,
      {
        responseType: "blob",
      }
    );
    return response;
  }

  static async uploadCommentWithAttachments(payload: {
    id: number;
    comment: string;
    files: File[];
  }): Promise<any> {
    const fd = new FormData();
    fd.append("objId", String(payload.id));
    fd.append("comment", payload.comment);
    fd.append("attType", "VAN_BAN_XIN_XE_COMMENT");
    fd.append("cmtType", "DU_TRU_XE_BINH_LUAN");
    payload.files.forEach((file) => fd.append("files", file));
    const response = await sendPost(
      `/attachment_comment/addAttachmentComment/`,
      fd
    );
    return response.data ?? response;
  }

  static async saveCommentByType(payload: {
    objId: number;
    comment: string;
    files?: File[];
    encFiles?: File[];
    keys?: string[];
    type?: string;
    hash?: string;
    endDate?: string;
    cmtContent?: string | null;
  }): Promise<any> {
    const fd = new FormData();
    fd.append("cmtContent", payload.cmtContent ?? "");
    fd.append("hash", payload.hash ?? "");
    fd.append("comment", payload.comment);
    fd.append("endDate", payload.endDate ?? "");
    fd.append("type", payload.type ?? "DU_TRU_XE_BINH_LUAN");
    (payload.files ?? []).forEach((f) => fd.append("nonEncfiles", f));
    (payload.encFiles ?? []).forEach((f) => fd.append("encFiles", f));
    (payload.keys ?? []).forEach((k) => fd.append("keys", k));
    const response = await sendPost(
      `/common/comment/add/${payload.objId}` as string,
      fd
    );
    return response.data ?? response;
  }

  static async updateComment(
    commentId: number,
    payload: { comment: string }
  ): Promise<any> {
    const response = await sendPost(
      `/common/comment/update/${commentId}`,
      payload
    );
    return response.data ?? response;
  }

  static async deleteComment(commentId: number): Promise<any> {
    const response = await sendPost(`/common/comment/delete/${commentId}`, {});
    return response.data;
  }

  static async getListLeadById(id: number): Promise<LeadInformation[]> {
    const response = await sendGet(`/task/lead/${id}`);
    return response.data;
  }

  static async createVehicleUsagePlan(data: any): Promise<any> {
    const response = await sendPost("/vehicle-usage-plan/create", data);
    return response.data;
  }

  static async updateVehicleUsagePlan(data: any): Promise<any> {
    const response = await sendPost("/vehicle-usage-plan/update", data);
    return response.data;
  }

  static async getListTracking(
    id: number,
    page: number
  ): Promise<TrackingResponse> {
    const response = await sendGet(
      `/vehicle-tracking/follow/${id}?page=${page}`
    );
    return response.data;
  }

  static async checkPermissionBan(): Promise<PermissionData> {
    const response = await sendGet("/calendar2/ban/create");
    return response.data;
  }

  static async getCalendarsByMonth(
    orgType: number,
    params: { month: number; year: number }
  ): Promise<CalendarData[]> {
    const response = await sendGet(`/calendar2/getByMonth/${orgType}`, params);
    return response.data;
  }

  static async getVehicleCalendarByWeek(
    orgType: "DEPARTMENT" | "ORG",
    params: { week: number; year: number }
  ): Promise<WeekData> {
    const response = await sendGet(
      `/vehicle-usage-plan/getByWeek/${orgType}`,
      params
    );
    return response.data;
  }

  static async getDetailToEdit(id?: number): Promise<VehicleDetailSlot> {
    const response = await sendGet(`/vehicle-usage-plan/getDetailToEdit/${id}`);
    return response.data;
  }

  static async exportVehicle(params: Record<string, any>): Promise<Blob> {
    const response = await sendGet("/vehicle-usage-plan/export", params, {
      responseType: "blob",
    });
    return response;
  }

  static async getListSuggestVehicleDriver(
    id: number
  ): Promise<VehicleDriver[]> {
    const response = await sendGet(
      `/vehicle-usage-plan/get-list-vehicle?orgId=${id}`
    );
    return response.data;
  }

  static async findByOrgCVV(): Promise<Organization[]> {
    const response = await sendGet(`/org/findByOrgCVV`);
    return response.data;
  }

  static async retakeDraft(id: number): Promise<any> {
    const response = await sendPost(`/vehicle-usage-plan/retake/${id}`, {});
    return response.data;
  }

  static async acceptDraft(id: number): Promise<any> {
    const response = await sendPost(`/vehicle-usage-plan/accept/${id}`, {});
    return response.data;
  }

  static async updateDraft(data: any): Promise<any> {
    const response = await sendPost("/vehicle-usage-plan/update", data);
    return response.data;
  }

  static async completeDraft(listIds: number[]): Promise<any> {
    // Match Angular behavior: send as FormData with one or multiple listUsagePlanIds entries
    const fd = new FormData();
    (listIds ?? []).forEach((id) => fd.append("listUsagePlanIds", String(id)));
    const response = await sendPost("/vehicle-usage-plan/finish", fd);
    return response.data;
  }

  static async getMenuBadge(): Promise<any> {
    const response = await sendGet("/vehicle-usage-plan/report_doc_by_type");
    return response.data;
  }

  static async rejectDraft(id: number, comment: string): Promise<any> {
    const response = await sendPost(`/vehicle-usage-plan/reject/${id}`, {
      comment,
    });
    return response.data;
  }
}
