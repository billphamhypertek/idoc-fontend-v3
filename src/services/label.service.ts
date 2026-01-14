import { sendGet, sendPost } from "@/api";
export interface Label {
  id: string;
  name: string;
  active?: boolean;
  clientId?: number;
  createBy?: number;
  createDate?: number;
  showUpdate?: boolean;
}
export class LabelService {
  static async GetListTag(detailPageSize: number, page: number) {
    const response = await sendGet(
      `/tag/list?detailPageSize=${detailPageSize}&page=${page}`
    );
    return response.data;
  }

  static async listTagUnpage() {
    const response = await sendPost("/tag/list/unpage", {});
    return response.data;
  }

  static async addTag(value: string) {
    const response = await sendPost("/tag/add", { name: value });
    return response.data;
  }

  static async updateTag(tag: Label) {
    const response = await sendPost(
      `/tag/update/${tag.id}?name=${tag.name}`,
      tag
    );
    return response.data;
  }

  static async deleteTag(id: string) {
    const response = await sendPost(`/tag/delete/${id}`, {});
    return response.data;
  }

  static async searchTag(text: string) {
    const response = await sendGet(`/tag/search/?text=${text}`);
    return response.data;
  }

  static async removeObject(tagId: string, objId: string, type: string) {
    const response = await sendPost(
      `/tag/remove?tagId=${tagId}&objId=${objId}&type=${type}`,
      {}
    );
    return response.data;
  }

  static async listObject(
    tagId: string,
    page: number,
    keyWord?: string,
    pageSize?: number,
    type?: string
  ) {
    const response = await sendGet(
      `/tag/object/${tagId}?page=${page}&pageSize=${pageSize || ""}&keyWord=${keyWord || ""}&type=${type || ""}`
    );
    return response.data;
  }

  static async assignTag(tag: any) {
    const response = await sendPost(
      `/tag/assign?tagId=${tag.tagId}&objId=${tag.objId}&type=${tag.type}`,
      tag
    );
    return response.data;
  }

  static async listObjectTag(objId: string, type: string) {
    const response = await sendGet(
      `/tag/object_tag?objId=${objId}&type=${type}`,
      {}
    );
    return response.data;
  }
}
