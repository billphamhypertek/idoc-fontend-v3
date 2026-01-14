import { sendGet, sendPost, sendPut, sendDelete } from "@/api";
import {
  ModuleNode,
  PositionModel,
  UserInfo,
} from "@/definitions/types/auth.type";
import { NewRole, RoleManagement } from "@/definitions/types/role.type";
import { User } from "@/definitions/types/user.type";

export class RoleService {
  // Role management
  static async getAllRoles(): Promise<RoleManagement[]> {
    const response = await sendGet("/role/getAll");
    return response.data as RoleManagement[];
  }
  static async getUserActiveByRole(roleId: number): Promise<UserInfo[]> {
    const response = await sendGet(`/role/getUserActiveByRole/${roleId}`);
    return response.data as UserInfo[];
  }
  static async getPositionActiveByRole(
    roleId: number
  ): Promise<PositionModel[]> {
    const response = await sendGet(`/role/getPositionActiveByRole/${roleId}`);
    return response.data as PositionModel[];
  }

  static async addNewRole(payload: NewRole): Promise<RoleManagement> {
    const response = await sendPost("/role/add", payload);
    return response.data as RoleManagement;
  }
  static async updateRole(payload: RoleManagement): Promise<RoleManagement> {
    const response = await sendPost(`/role/update/${payload.id}`, payload);
    return response.data as RoleManagement;
  }
  static async deactiveRole(id: number): Promise<RoleManagement> {
    const response = await sendGet(`/role/deactive/${id}`);
    return response.data as RoleManagement;
  }
  static async activeRole(id: number): Promise<RoleManagement> {
    const response = await sendGet(`/role/active/${id}`);
    return response.data as RoleManagement;
  }
  static async configurationRole(
    payload: ModuleNode[],
    roleId: number
  ): Promise<ModuleNode[]> {
    const response = await sendPost(
      `/permission/updateAuthorizeModule/${roleId}`,
      payload
    );
    return response.data as ModuleNode[];
  }
  static async configurationUserRole(
    payload: UserInfo[],
    roleId: number
  ): Promise<UserInfo[]> {
    const response = await sendPost(
      `/permission/addAuthorizeUserList/${roleId}`,
      payload
    );
    return response.data as UserInfo[];
  }
  static async configurationPositionRole(
    payload: PositionModel[],
    roleId: number
  ): Promise<PositionModel[]> {
    const response = await sendPost(
      `/permission/addAuthorizePositionList/${roleId}`,
      payload
    );
    return response.data as PositionModel[];
  }
}
