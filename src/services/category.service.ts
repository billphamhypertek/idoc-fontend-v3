import { sendGet, sendPost, sendPut, sendDelete } from "@/api";
import { Constant } from "@/definitions/constants/constant";
import {
  Category,
  CategorySearchResponse,
  CategoryCreateUpdateRequest,
  CategorySearchParams,
} from "@/definitions/types/category.type";

export class CategoryService {
  static async searchCategories(
    params: CategorySearchParams
  ): Promise<CategorySearchResponse> {
    const searchParams = new URLSearchParams();
    if (params.name) searchParams.append("name", params.name);
    if (params.id) searchParams.append("id", params.id);
    if (params.active !== undefined)
      searchParams.append("active", params.active.toString());
    if (params.categoryTypeId)
      searchParams.append("categoryTypeId", params.categoryTypeId.toString());
    if (params.page) searchParams.append("page", params.page.toString());
    if (params.sortBy) searchParams.append("sortBy", params.sortBy);
    if (params.direction) searchParams.append("direction", params.direction);
    if (params.size) searchParams.append("size", params.size.toString());

    const response = await sendGet(
      `/categories/getAllByCategoryTypeIdPaging/${params.categoryTypeId}?${searchParams.toString()}`
    );
    return response.data;
  }

  static async getCategoriesByType(
    categoryTypeId: number
  ): Promise<Category[]> {
    const response = await sendGet(
      `/categories/getAllByCategoryTypeId/${categoryTypeId}`
    );
    return response.data;
  }

  static async createCategory(
    data: CategoryCreateUpdateRequest
  ): Promise<Category> {
    // Call with encrypt=true first (like v1) - ignore errors
    try {
      await sendPost(`/categories/add?encrypt=true`, data);
    } catch (error) {
      // Ignore encrypt call errors, continue with non-encrypt call
      console.log(
        "Encrypt call failed, continuing with non-encrypt call:",
        error
      );
    }

    // Then call without encrypt
    const response = await sendPost(`/categories/add`, data);
    return response.data;
  }

  static async updateCategory(
    id: number,
    data: CategoryCreateUpdateRequest
  ): Promise<Category> {
    // Call with encrypt=true first (like v1) - ignore errors
    try {
      await sendPost(`/categories/update/${id}?encrypt=true`, data);
    } catch (error) {
      // Ignore encrypt call errors, continue with non-encrypt call
      console.log(
        "Encrypt call failed, continuing with non-encrypt call:",
        error
      );
    }

    // Then call without encrypt
    const response = await sendPost(`/categories/update/${id}`, data);
    return response.data;
  }

  static async activeCategory(id: number): Promise<Category> {
    // Call with encrypt=true first (like v1) - ignore errors
    try {
      await sendGet(`/categories/active/${id}?encrypt=true`);
    } catch (error) {
      // Ignore encrypt call errors, continue with non-encrypt call
      console.log(
        "Encrypt call failed, continuing with non-encrypt call:",
        error
      );
    }

    // Then call without encrypt
    const response = await sendGet(`/categories/active/${id}`);
    return response.data;
  }

  static async deactiveCategory(id: number): Promise<Category> {
    // Call with encrypt=true first (like v1) - ignore errors
    try {
      await sendGet(`/categories/deactive/${id}?encrypt=true`);
    } catch (error) {
      // Ignore encrypt call errors, continue with non-encrypt call
      console.log(
        "Encrypt call failed, continuing with non-encrypt call:",
        error
      );
    }

    // Then call without encrypt
    const response = await sendGet(`/categories/deactive/${id}`);
    return response.data;
  }

  static async deleteCategory(id: number): Promise<void> {
    // Call with encrypt=true first (like v1) - ignore errors
    try {
      await sendPost(`/categories/delete/${id}?encrypt=true`, null);
    } catch (error) {
      // Ignore encrypt call errors, continue with non-encrypt call
      console.log(
        "Encrypt call failed, continuing with non-encrypt call:",
        error
      );
    }

    // Then call without encrypt
    await sendPost(`/categories/delete/${id}`, null);
  }
}
