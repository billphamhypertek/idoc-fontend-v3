import { sendGet } from "@/api";
import { MapCategory } from "@/definitions/types/category.type";
import { LogBusinessListResponse } from "@/definitions/types/log-business.type";

export class LogBusinessService {
  static async getLogBusiness(formData: any) {
    const res = await sendGet(
      `/log/search?${new URLSearchParams(formData).toString()}`
    );
    return res.data as LogBusinessListResponse;
  }

  static async getLogBusinessExcel(formData: any) {
    const res = await sendGet(
      `/log/export?${new URLSearchParams(formData).toString()}`
    );
    return res.data as LogBusinessListResponse;
  }

  static async getMapCategory() {
    const res = await sendGet(`/map_category/getAll/`);
    return res.data as MapCategory[];
  }
}
