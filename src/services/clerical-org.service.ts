import { sendGet, sendPost } from "@/api";
import { ClericalOrgListResponse } from "@/definitions/types/clerical-org.type";
import { Organization } from "@/definitions/types/task-assign.type";

export class ClericalOrgService {
  static async getClericalOrgList(
    params: Record<string, any>
  ): Promise<ClericalOrgListResponse> {
    // Filter out null/undefined values and convert to URLSearchParams
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
      `/clerical/getClerical?${new URLSearchParams(filteredParams).toString()}`
    );
    return response.data as ClericalOrgListResponse;
  }

  static async getAllOrganizations(): Promise<Organization[]> {
    const response = await sendGet("/org/getAllSort/ASC/order", {
      active: true,
    });
    return response.data;
  }

  static async updateClericalOrg(
    payload: number[],
    userId: number
  ): Promise<void> {
    const response = await sendPost(
      `/clerical/addOrg?userId=${userId}`,
      payload
    );
    return response.data;
  }
}
