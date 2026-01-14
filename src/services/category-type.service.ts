import { sendGet, sendPost, sendPut, sendDelete } from "@/api";
import { Constant } from "@/definitions/constants/constant";
import {
  CategoryType,
  CategoryTypeSearchResponse,
  CategoryTypeCreateUpdateRequest,
} from "@/definitions/types/category-type.type";

export class CategoryTypeService {
  static async getAllCategoryTypesWithPaging(params: {
    page: number;
    size: number;
  }): Promise<CategoryTypeSearchResponse> {
    const response = await sendGet(
      `/category-type/getAllSortAndPage/ASC/id?page=${params.page}&size=${params.size}`
    );
    return response.data;
  }

  static async createCategoryType(
    data: CategoryTypeCreateUpdateRequest
  ): Promise<CategoryType> {
    const response = await sendPost(`/category-type/add`, data);
    return response.data;
  }

  static async updateCategoryType(
    id: number,
    data: CategoryTypeCreateUpdateRequest
  ): Promise<CategoryType> {
    const response = await sendPost(`/category-type/update/${id}`, data);
    return response.data;
  }

  static async activeCategoryType(id: number): Promise<CategoryType> {
    const response = await sendGet(`/category-type/active/${id}`);
    return response.data;
  }

  static async deactiveCategoryType(id: number): Promise<CategoryType> {
    const response = await sendGet(`/category-type/deactive/${id}`);
    return response.data;
  }

  static async deleteCategoryType(id: number): Promise<void> {
    await sendPost(`/category-type/delete/${id}`, null);
  }
}
