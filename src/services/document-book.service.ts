import { sendGet, sendPost, sendPut } from "@/api";
import { Constant } from "@/definitions/constants/constant";
import {
  DocumentBook,
  DocumentBookSearch,
  DocumentBookSearchResponse,
  DocumentBookCreateUpdateRequest,
} from "@/definitions/types/document-book.type";

export class DocumentBookService {
  static async getDocumentBookByType(id: number) {
    const response = await sendGet(
      `${Constant.GET_DOCUMENT_BOOK_BY_TYPE}${id}`
    );
    return response.data;
  }

  static async getDocumentBookByTypeFlowing(id: number) {
    const response = await sendGet(
      `${Constant.GET_DOCUMENT_BOOK_BY_TYPE_FLOWING}${id}`
    );
    return response.data;
  }

  static async searchDocumentBook(
    name?: string,
    type?: number,
    status?: boolean,
    year?: number,
    page: number = 1,
    direction: string = Constant.SORT_TYPE.DECREASE,
    sortBy?: string,
    size: number = Constant.PAGING.SIZE,
    encryptShowing: string = "false"
  ): Promise<DocumentBookSearchResponse> {
    const params = new URLSearchParams();
    if (name) params.append("name", name);
    if (type !== undefined && type !== -1)
      params.append("type", type.toString());
    if (status !== undefined) params.append("status", status.toString());
    if (year) params.append("year", year.toString());
    params.append("page", page.toString());
    params.append("direction", direction);
    if (sortBy) params.append("sortBy", sortBy);
    params.append("size", size.toString());
    params.append("encryptShowing", encryptShowing);

    const response = await sendPost(
      `${Constant.SEARCH_DOCUMENT_BOOK}?${params.toString()}`
    );
    return response.data;
  }

  static async getDocumentBookById(id: number): Promise<DocumentBook> {
    const response = await sendGet(`${Constant.GET_DOCUMENT_BOOK}${id}`);
    return response.data;
  }

  static async createDocumentBook(
    data: DocumentBookCreateUpdateRequest
  ): Promise<DocumentBook> {
    const response = await sendPost(Constant.ADD_DOCUMENT_BOOK, data);
    return response.data;
  }

  static async updateDocumentBook(
    id: number,
    data: DocumentBookCreateUpdateRequest
  ): Promise<DocumentBook> {
    const response = await sendPut(
      `${Constant.UPDATE_DOCUMENT_BOOK}${id}`,
      data
    );
    return response.data;
  }

  static async activeDocumentBook(id: number): Promise<DocumentBook> {
    const response = await sendPut(`${Constant.ACTIVE_DOCUMENT_BOOK}${id}`);
    return response.data;
  }

  static async deactiveDocumentBook(id: number): Promise<DocumentBook> {
    const response = await sendPut(`${Constant.DEACTIVE_DOCUMENT_BOOK}${id}`);
    return response.data;
  }
}
