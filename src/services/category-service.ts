import { sendGet, sendPost } from "@/api";
import { CategoryCode } from "@/definitions/types/category.type";

export class CategoryService {
  static async getCategoriesByCode(code: string): Promise<CategoryCode[]> {
    const response = await sendGet(
      `/categories/getAllByCategoryTypeCode/${code}`
    );
    return response.data as CategoryCode[];
  }

  static async addAdditionalPosition(
    userId: string,
    body: { positions: number[] }
  ) {
    // Call with encrypt=true first (for logging/audit)
    await sendPost(
      `/users/additionalPosition/add/${userId}?encrypt=true`,
      body
    );
    // Then call without encrypt for actual operation
    const response = await sendPost(
      `/users/additionalPosition/add/${userId}`,
      body
    );
    return response.data;
  }

  static async removeAdditionalPosition(
    userId: string,
    body: { positions: number[] }
  ) {
    // Call with encrypt=true first (for logging/audit)
    await sendPost(
      `/users/additionalPosition/remove/${userId}?encrypt=true`,
      body
    );
    // Then call without encrypt for actual operation
    const response = await sendPost(
      `/users/additionalPosition/remove/${userId}`,
      body
    );
    return response.data;
  }
}
