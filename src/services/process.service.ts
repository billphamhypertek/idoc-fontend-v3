import {
  PositionProcessResponse,
  Process,
  ProcessListResponse,
  ProcessRequest,
  UserInformationProcess,
} from "@/definitions/types/process.type";
import { sendGet, sendPost } from "@/api";

export class ProcessService {
  static async getProcessList(
    params: Record<string, any>
  ): Promise<ProcessListResponse> {
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
      `/bpmn2/search?${new URLSearchParams(filteredParams).toString()}`
    );
    return response.data as ProcessListResponse;
  }
  static async updateProcess(payload: Process): Promise<Process> {
    const response = await sendPost(`/bpmn2/update/${payload.id}`, payload);
    return response.data as Process;
  }
  static async deleteProcess(id: number): Promise<void> {
    const response = await sendPost(`/bpmn2/delete/${id}`, null);
    return response.data as void;
  }
  static async updateProcessDetail(
    payload: ProcessRequest
  ): Promise<ProcessRequest> {
    const response = await sendPost(`/bpmn2/update/${payload.id}`, payload);
    return response.data as ProcessRequest;
  }
  static async addProcess(payload: ProcessRequest): Promise<ProcessRequest> {
    const response = await sendPost(`/bpmn2/add`, payload);
    return response.data as ProcessRequest;
  }
  static async getProcessDetail(id: number): Promise<ProcessRequest> {
    const response = await sendGet(`/bpmn2/getById/${id}`);
    return response.data as ProcessRequest;
  }
  static async getAllUsersOrderPosition(): Promise<UserInformationProcess[]> {
    const response = await sendGet("/users/getAllOrder");
    return response.data as UserInformationProcess[];
  }
  static async getPositionsByOrgId(
    orgId: number,
    page: number = 1
  ): Promise<PositionProcessResponse> {
    const response = await sendGet(
      `/categories/findPosition/${orgId}?page=${page}`
    );
    return response.data as PositionProcessResponse;
  }
}
