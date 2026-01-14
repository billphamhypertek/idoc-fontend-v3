import { sendGet, sendPost } from "@/api";
import { Constant } from "@/definitions/constants/constant";

export interface ApiFieldResponse {
  id: number;
  active: boolean;
  createDate: number;
  createBy: number;
  clientId: number;
  formDynamicId: number;
  name: string; // field name (backend key)
  title: string; // label hiển thị
  dataType: string; // TEXT, NUMBER, DATE, DATETIME, SELECT, CHECKBOX, RADIO, FILE, TABLE, EDITOR, TEXTAREA, LINK
  required: boolean;
  isSearch: boolean;
  showOnList: boolean;
  hidden: boolean;
  placeholder?: string;
  minLength?: number;
  maxLength?: number;
  inputWidth: string | number; // width percentage
  orderNumber: number;
  allowMultiple?: boolean;
  apiId?: number | string;
  fieldConfig?: string | object;
  css?: string;
  unique?: boolean;
  min?: string;
  max?: string;
  options?: string;
  dateFormat?: string;
  disableDates?: string;
  acceptedTypes?: string;
  maxSize?: number;
  linkText?: string;
  linkUrl?: string;
  linkTarget?: "_blank" | "_self";
  description?: string;
  size?: "full" | "half" | "third" | "quarter";
  allowOther?: boolean;
}

export interface FormConfigResponse {
  id: number;
  name: string;
  description?: string;
  categoryId: number;
  status?: "active" | "locked";
  isUse?: boolean;
  createdAt?: string;
  updatedAt?: string;
  fields?: ApiFieldResponse[];
  lock?: boolean;
  active?: boolean;
  isCategory?: boolean;
  parentId?: number | null;
}

export interface FormConfigListResponse {
  content: FormConfigResponse[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

export interface FormConfigRequest {
  name: string;
  description?: string;
  categoryId: number;
  active?: boolean;
  fields?: any[];
  isCategory?: boolean;
  parentId?: number | null;
}

export interface FormConfigTypeResponse {
  id: number;
  name: string;
}

export interface ApiEndpointItem {
  id: number;
  active: boolean;
  createDate: number;
  createBy: number;
  clientId: number;
  name: string;
  api: string;
  method: string;
  lock?: boolean;
}

export interface ApiEndpointListResponse {
  totalPage: number;
  totalRecord: number;
  objList: ApiEndpointItem[];
}

export class FormConfigService {
  static async getFormConfigList(param: any): Promise<FormConfigListResponse> {
    const response = await sendGet(`/formDynamic/paged`, param);
    // Unwrap data from response wrapper: { resultCode, message, data: {...} }
    return response.data as FormConfigListResponse;
  }

  /**
   * Add new form config
   * @param payload - Form config data
   */
  static async addFormConfig(
    payload: FormConfigRequest
  ): Promise<FormConfigResponse> {
    const response = await sendPost(`/formDynamic/create`, payload);
    return response.data?.data as FormConfigResponse;
  }

  /**
   * Update existing form config
   * @param id - Form config ID
   * @param payload - Updated form config data
   */
  static async updateFormConfig(
    id: number,
    payload: FormConfigRequest
  ): Promise<FormConfigResponse> {
    const response = await sendPost(`/formDynamic/${id}`, payload);
    return response.data?.data as FormConfigResponse;
  }

  /**
   * Get form config detail by ID
   * @param id - Form config ID
   */
  static async getFormConfigDetail(id: number): Promise<FormConfigResponse> {
    const response = await sendGet(`/formDynamic/${id}`);
    return response?.data as FormConfigResponse;
  }

  /**
   * Get list of form configs (non-paginated)
   * @param typeWorkflow - Workflow type filter
   * @param searchKey - Search keyword
   */
  static async getFormConfigSimpleList(
    typeWorkflow: string = "",
    searchKey: string = ""
  ): Promise<FormConfigResponse[]> {
    const response = await sendGet(
      `/formDynamic/list?formType=${typeWorkflow}&text=${searchKey}`
    );
    return response.data as FormConfigResponse[];
  }

  /**
   * Delete form config
   * @param id - Form config ID
   */
  static async deleteFormConfig(id: number): Promise<void> {
    const response = await sendPost(`/formDynamic/delete-form/${id}`, null);
    return response.data?.data as void;
  }

  /**
   * Activate/deactivate form config
   * @param id - Form config ID
   */
  static async toggleActiveFormConfig(id: number): Promise<void> {
    const response = await sendPost(`/formDynamic/active/${id}`, null);
    return response.data?.data as void;
  }

  /**
   * Get list of API endpoints for form
   * @param formId - Form dynamic ID
   * @param searchKey - Search keyword
   */
  static async getApiEndpointList(
    searchKey: string = ""
  ): Promise<ApiEndpointListResponse> {
    const response = await sendGet(
      `/api/search/1?searchKey=${searchKey}&active=true`
    );
    return response.data as ApiEndpointListResponse;
  }

  /**
   * Get preview data from API endpoint
   * @param apiUrl - API URL to call
   */
  static async getApiPreviewData(apiUrl: string): Promise<any[]> {
    try {
      const normalizedApiUrl = apiUrl
        .trim()
        .replace(/^\/?api\//, "") // Remove /api/ or api/ prefix
        .replace(/^\/+|\/+$/g, ""); // Remove leading/trailing slashes
      const response = await sendGet(`/${normalizedApiUrl}`);
      // Return first 5 items
      return response.data;
    } catch (error) {
      console.error("Error fetching API preview data:", error);
      return [];
    }
  }

  static async getFormConfigTypeList(): Promise<FormConfigTypeResponse[]> {
    const response = await sendGet(
      `/categories/getAllByCategoryTypeCode/${Constant.CATEGORYTYPE_CODE.QLSH}`
    );
    return response.data as FormConfigTypeResponse[];
  }
}
