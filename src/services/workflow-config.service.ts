import {
  PositionWorkflowConfigResponse,
  WorkflowConfig,
  WorkflowConfigListResponse,
  WorkflowConfigRequest,
  UserInformationWorkflowConfig,
} from "@/definitions/types/workflow-config.type";
import { sendGet, sendPost } from "@/api";

export class WorkflowConfigService {
  static async getWorkflowConfigList(
    params: Record<string, any>
  ): Promise<WorkflowConfigListResponse> {
    const filteredParams = Object.entries(params)
      .filter(
        ([_, value]) => value !== null && value !== undefined && value !== ""
      )
      .reduce(
        (acc, [key, value]) => {
          acc[key] = value;
          return acc;
        },
        {} as Record<string, any>
      );

    const response = await sendGet(
      `/workflow/search?${new URLSearchParams(filteredParams).toString()}`
    );
    return response.data as WorkflowConfigListResponse;
  }
  static async updateWorkflowConfig(
    payload: WorkflowConfig
  ): Promise<WorkflowConfig> {
    const response = await sendPost(`/workflow/update/${payload.id}`, payload);
    return response.data as WorkflowConfig;
  }
  static async deleteWorkflowConfig(id: number): Promise<void> {
    const response = await sendPost(`/workflow/delete/${id}`, null);
    return response.data as void;
  }
  static async updateWorkflowConfigDetail(
    payload: WorkflowConfigRequest
  ): Promise<WorkflowConfigRequest> {
    const response = await sendPost(`/workflow/update/${payload.id}`, payload);
    return response.data as WorkflowConfigRequest;
  }
  static async addWorkflowConfig(
    payload: WorkflowConfigRequest
  ): Promise<WorkflowConfigRequest> {
    const response = await sendPost(`/workflow/add`, payload);
    return response.data as WorkflowConfigRequest;
  }
  static async getWorkflowConfigDetail(
    id: number
  ): Promise<WorkflowConfigRequest> {
    const response = await sendGet(`/workflow/getById/${id}`);
    return response.data as WorkflowConfigRequest;
  }
  static async getAllUsersOrderPosition(): Promise<
    UserInformationWorkflowConfig[]
  > {
    const response = await sendGet("/users/getAllOrder");
    return response.data as UserInformationWorkflowConfig[];
  }
  static async getPositionsByOrgId(
    orgId: number,
    page: number = 1
  ): Promise<PositionWorkflowConfigResponse> {
    const response = await sendGet(
      `/categories/findPosition/${orgId}?page=${page}`
    );
    return response.data as PositionWorkflowConfigResponse;
  }
}
