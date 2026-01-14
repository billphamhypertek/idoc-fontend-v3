import { sendGet, sendPost } from "@/api";
import type {
  ApiAddRequest,
  ApiBackendResponse,
  ApiRecord,
  ApiSearchParams,
} from "@/definitions/types/api.type";

export class ApiService {
  static async getApiList(
    page: number = 1,
    params?: ApiSearchParams
  ): Promise<ApiBackendResponse> {
    const queryParams: Record<string, any> = {
      searchKey: params?.searchKey || "",
      size: params?.size || 10,
    };

    // Backend yêu cầu bắt buộc phải có active
    // Nếu không có (tức lấy tất cả), gửi active=""
    if (params?.active !== undefined) {
      queryParams.active = params.active;
    } else {
      queryParams.active = ""; // Hoặc thử xóa dòng này nếu backend không chấp nhận
    }

    const response = await sendGet(`/api/search/${page}`, queryParams);
    return response.data as ApiBackendResponse;
  }

  static async addApi(apiData: ApiAddRequest): Promise<ApiRecord> {
    const response = await sendPost("/api/add", apiData);
    return response.data as ApiRecord;
  }

  static async updateApi(
    id: number,
    apiData: ApiAddRequest
  ): Promise<ApiRecord> {
    const response = await sendPost(`/api/update/${id}`, apiData);
    return response.data as ApiRecord;
  }

  static async toggleApiActive(id: number): Promise<ApiRecord> {
    const response = await sendGet(`/api/active/${id}`);
    return response.data as ApiRecord;
  }

  static async deleteApi(id: number): Promise<void> {
    const response = await sendGet(`/api/delete/${id}`);
    return response.data;
  }
}
