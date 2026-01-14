import { sendGet, sendPost } from "@/api";
import { Module, ModuleDetail } from "@/definitions/types/module.type";

export class ModuleService {
  static async getAllModules(): Promise<Module[]> {
    const response = await sendGet("/module/getAllModules");
    return response.data as Module[];
  }

  static async updateShowHideModule(payload: Module[]): Promise<Module[]> {
    const response = await sendPost("/module/updateOrderNumber", payload);
    return response.data as Module[];
  }

  static async getDetailModule(moduleId: number): Promise<ModuleDetail> {
    const response = await sendGet(`/module/getScreen/${moduleId}`);
    return response.data as ModuleDetail;
  }

  static async updateModule(payload: ModuleDetail): Promise<ModuleDetail> {
    const response = await sendPost("/module/add", payload);
    return response.data as ModuleDetail;
  }

  static async deleteModule(id: number): Promise<any> {
    const response = await sendGet(`/module/delete/${id}`);
    return response.data;
  }
}
