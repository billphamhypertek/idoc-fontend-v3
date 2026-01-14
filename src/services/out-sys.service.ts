import { sendGet, sendPost } from "@/api";
import {
  OutSys,
  OutSysHistoryListResponse,
  OutSysListResponse,
} from "@/definitions/types/out-sys.type";

export class OutSysService {
  static async getOutSystemList(
    params: Record<string, any>
  ): Promise<OutSysListResponse> {
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
      `/out-sys/all?${new URLSearchParams(filteredParams).toString()}`
    );
    return response.data as OutSysListResponse;
  }

  static async addNewOutSys(payload: OutSys): Promise<OutSys> {
    const response = await sendPost("/out-sys/add", {
      name: payload.name,
      domain: payload.domain,
      key: payload.key,
    });
    return response.data as OutSys;
  }
  static async updateOutSys(payload: OutSys): Promise<OutSys> {
    const response = await sendPost(`/out-sys/update/${payload.id}`, payload);
    return response.data as OutSys;
  }
  static async deactiveOutSys(id: number): Promise<OutSys> {
    const response = await sendPost(`/out-sys/control/${id}?active=false`);
    return response.data as OutSys;
  }
  static async activeOutSys(id: number): Promise<OutSys> {
    const response = await sendPost(`/out-sys/control/${id}?active=true`);
    return response.data as OutSys;
  }

  static async deleteOutSys(id: number): Promise<void> {
    const response = await sendPost(`/out-sys/delete/${id}`, null);
    return response as any;
  }

  static async createLinkOutSys(payload: OutSys): Promise<OutSys> {
    const response = await sendPost("/integrate/rq-connect", payload);
    return response.data as OutSys;
  }

  static async getOutSystemHistoryList(
    params: Record<string, any>
  ): Promise<OutSysHistoryListResponse> {
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
      `/integrate/track/sys?${new URLSearchParams(filteredParams).toString()}`
    );
    return response.data as OutSysHistoryListResponse;
  }
}
