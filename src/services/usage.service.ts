import { sendGet, sendPost } from "@/api";
import {
  Usage,
  UsageSearchResponse,
  UsageCreateRequest,
  UsageUpdateRequest,
  UsageFileRequest,
  UsageDeleteRequest,
} from "@/definitions/types/usage.type";

export class UsageService {
  static async getCategoryTypeUsage(): Promise<{ data: { id: number } }> {
    const response = await sendGet("/category-type/USER_MANUAL");
    return response.data;
  }

  static async getUsageList(): Promise<UsageSearchResponse> {
    const response = await sendGet("/common/usage");
    return response.data;
  }

  static async saveUsage(data: UsageUpdateRequest): Promise<Usage> {
    // Create FormData like v1
    const formData = new FormData();
    if (data.file) {
      formData.append("file", data.file);
    }
    formData.append("name", data.value);

    // Call with encrypt=true first (like v1) - ignore errors
    try {
      await sendPost(`/common/usage/edit/${data.id}?encrypt=true`, formData);
    } catch (error) {
      // Ignore encrypt call errors, continue with non-encrypt call
      console.log(
        "Encrypt call failed, continuing with non-encrypt call:",
        error
      );
    }

    // Then call without encrypt
    const response = await sendPost(`/common/usage/edit/${data.id}`, formData);
    return response.data;
  }

  static async saveNewUsage(data: UsageCreateRequest): Promise<{ id: number }> {
    // Call with encrypt=true first (like v1) - ignore errors
    try {
      await sendPost(`/module/add/usage?encrypt=true`, data);
    } catch (error) {
      // Ignore encrypt call errors, continue with non-encrypt call
      console.log(
        "Encrypt call failed, continuing with non-encrypt call:",
        error
      );
    }

    // Then call without encrypt
    const response = await sendPost(`/module/add/usage`, data);
    return response.data;
  }

  static async saveFileUsage(data: UsageFileRequest): Promise<void> {
    // Create FormData like v1
    const formData = new FormData();
    formData.append("week", data.week.toString());
    formData.append("year", data.year.toString());
    formData.append("files", data.files);

    // Call with encrypt=true first (like v1) - ignore errors
    try {
      await sendPost(
        `/attachment_calendar/addAttachment/${data.catId}/5?encrypt=true`,
        formData
      );
    } catch (error) {
      // Ignore encrypt call errors, continue with non-encrypt call
      console.log(
        "Encrypt call failed, continuing with non-encrypt call:",
        error
      );
    }

    // Then call without encrypt
    await sendPost(
      `/attachment_calendar/addAttachment/${data.catId}/5`,
      formData
    );
  }

  static async deleteUsage(data: UsageDeleteRequest): Promise<void> {
    // Call with encrypt=true first (like v1) - ignore errors
    try {
      await sendPost(`/common/usage/del/${data.id}?encrypt=true`, data);
    } catch (error) {
      // Ignore encrypt call errors, continue with non-encrypt call
      console.log(
        "Encrypt call failed, continuing with non-encrypt call:",
        error
      );
    }

    // Then call without encrypt
    await sendPost(`/common/usage/del/${data.id}`, data);
  }
}
