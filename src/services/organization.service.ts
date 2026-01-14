import { sendGet, sendPost } from "@/api";
import { Constant } from "@/definitions/constants/constant";
import type { RawOrg } from "@/definitions/types/orgunit.type";

export class OrganizationService {
  static async getOrganizations(
    params: Record<string, any> = {}
  ): Promise<any[]> {
    const response = await sendGet(
      `${Constant.ORGANIZATION.GET_ALL}${Constant.DIRECTION.ASC}/order`,
      params
    );
    return response.data as any[];
  }

  static async getOrganizationsByVanThu(): Promise<any[]> {
    const response = await sendGet(Constant.ORGANIZATION.GET_ALL_VANTHU);
    return response.data;
  }

  static async getOrgCVV(): Promise<any[]> {
    const response = await sendGet(Constant.ORGANIZATION.ORG_CVV);
    return response.data as any[];
  }

  static async searchRootOrganizations(
    params: Record<string, any> = {}
  ): Promise<any[]> {
    const response = await sendGet(Constant.ORGANIZATION.GET_LIST_ROOT, params);
    return response.data as any[];
  }

  static async getRootOrganizations(): Promise<any[]> {
    const response = await sendGet(
      `${Constant.ORGANIZATION.GET_ALL}${Constant.DIRECTION.ASC}/id`
    );
    return response.data as any[];
  }

  static async doSaveOrganization(
    organizationId: string | number,
    formData: FormData
  ): Promise<any> {
    try {
      try {
        await sendPost(
          Constant.ORGANIZATION.UPDATE + organizationId + "?encrypt=true",
          formData
        );
      } catch (encryptError) {
        //console.warn('Encrypt request failed, continuing with normal request:', encryptError);
      }

      const normalResponse = await sendPost(
        Constant.ORGANIZATION.UPDATE + organizationId,
        formData
      );
      return normalResponse.data;
    } catch (error) {
      throw error;
    }
  }

  static async doSaveNewOrganization(organization: any): Promise<any> {
    try {
      try {
        await sendPost(
          Constant.ORGANIZATION.ADD + "?encrypt=true",
          organization
        );
      } catch (encryptError) {
        //console.warn('Encrypt request failed, continuing with normal request:', encryptError);
      }

      const normalResponse = await sendPost(
        Constant.ORGANIZATION.ADD,
        organization
      );
      return normalResponse.data;
    } catch (error) {
      throw error;
    }
  }

  static async activeOrganization(
    organizationId: string | number
  ): Promise<any> {
    try {
      try {
        await sendGet(
          Constant.ORGANIZATION.ACTIVE + organizationId + "?encrypt=true"
        );
      } catch (encryptError) {
        //console.warn('Encrypt request failed, continuing with normal request:', encryptError);
      }

      const normalResponse = await sendGet(
        Constant.ORGANIZATION.ACTIVE + organizationId
      );
      return normalResponse.data;
    } catch (error) {
      throw error;
    }
  }

  static async deactiveOrganization(
    organizationId: string | number
  ): Promise<any> {
    try {
      try {
        await sendGet(
          Constant.ORGANIZATION.DEACTIVE + organizationId + "?encrypt=true"
        );
      } catch (encryptError) {
        //console.warn('Encrypt request failed, continuing with normal request:', encryptError);
      }

      const normalResponse = await sendGet(
        Constant.ORGANIZATION.DEACTIVE + organizationId
      );
      return normalResponse.data;
    } catch (error) {
      throw error;
    }
  }

  static async searchOrganization(
    page: number,
    data: Record<string, any>
  ): Promise<any> {
    const response = await sendPost(Constant.ORGANIZATION.SEARCH + page, data);
    return response.data;
  }

  static async getOrgTreeById(id: string | number): Promise<any> {
    const response = await sendGet(`/org/getOrgTreeById?id=${id}`);
    return response.data;
  }

  static async getOrgById(id: string | number): Promise<any> {
    const response = await sendGet(`/org/get/${id}`);
    return response.data;
  }

  static async searchOrgByName(name: string): Promise<any> {
    const response = await sendGet(
      `${Constant.ORGANIZATION.SEARCH_NAME}?q=${name}`
    );
    return response.data;
  }

  static async getAllUserByParentIdOrg(type: number): Promise<any> {
    const response = await sendGet(
      `${Constant.ORGANIZATION.USER_IN_ORG}?type=${type}`
    );
    return response.data;
  }

  static async getOrgParentByOrgId(childId: string | number): Promise<any> {
    const response = await sendGet(`/org/findParentByOrgId/${childId}`);
    return response.data;
  }

  static async getOrgAllSorted(): Promise<any> {
    const res = await sendGet(`/org/getAllSort/ASC/order`, {});
    return (res?.data ?? []) as RawOrg[];
  }

  static async getOrgChildrenList(orgId: any): Promise<any> {
    const res = await sendPost(`/org/get-children-v2?ids=${orgId}`, null);
    return res.data;
  }

  static async getOrgInformation(orgId: string): Promise<any> {
    const res = await sendGet(`/org/get-info?ids=${orgId}`);
    return res.data;
  }
}
