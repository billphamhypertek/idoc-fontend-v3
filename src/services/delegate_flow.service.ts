import { sendGet, sendPost } from "@/api";
import {
  AddDelegateFlow,
  DelegateFlowListResponse,
} from "@/definitions/types/delegate_flow.type";

export class DelegateFlowService {
  static async getDelegateFlowList(
    params: Record<string, any>
  ): Promise<DelegateFlowListResponse> {
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
      `/delegate_flow/list?${new URLSearchParams(filteredParams).toString()}`
    );
    return response.data as DelegateFlowListResponse;
  }

  static async addDelegateFlow(payload: AddDelegateFlow): Promise<void> {
    const formData = new FormData();
    formData.append("from", payload.from);
    formData.append("to", payload.to);
    const response = await sendPost(`/delegate_flow/add`, formData);
    return response.data;
  }

  static async deleteDelegateFlow(id: number): Promise<void> {
    const response = await sendPost(`/delegate_flow/delete/${id}`, null);
    return response as any;
  }
}
