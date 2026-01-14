import { sendGet, sendPost } from "@/api";
import { Constant } from "@/definitions/constants/constant";

export interface ContactGroup {
  id?: number;
  name: string;
  description?: string;
  active: boolean;
  listUser?: number[];
}

export const GroupService = {
  doSearchContactGroupActive: async (params: any) => {
    const res = await sendGet(Constant.GROUP.GET_ALL, params);
    return res.data;
  },

  searchContactGroup: async (params: {
    groupName?: string;
    description?: string;
    active?: string;
    page?: number;
    sortBy?: string;
    direction?: string;
    size?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (params.groupName) queryParams.append("groupName", params.groupName);
    if (params.description)
      queryParams.append("description", params.description);
    if (params.active !== undefined && params.active !== "")
      queryParams.append("active", params.active);
    if (params.page) queryParams.append("page", params.page.toString());
    if (params.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params.direction) queryParams.append("direction", params.direction);
    if (params.size) queryParams.append("size", params.size.toString());

    const res = await sendGet(
      `${Constant.GROUP.GET_ALL}?${queryParams.toString()}`
    );
    return res.data;
  },

  addGroup: async (group: ContactGroup) => {
    const res = await sendPost("/group/add", group);
    return res.data;
  },

  updateGroup: async (group: ContactGroup) => {
    const res = await sendPost("/group/update", group);
    return res.data;
  },

  deleteGroup: async (groupId: number) => {
    const res = await sendPost(`/group/delete?groupId=${groupId}`, {});
    return res.data;
  },

  updateStatus: async (groupId: number, active: boolean) => {
    const url = active
      ? `/group/active?groupId=${groupId}`
      : `/group/deactive?groupId=${groupId}`;
    const res = await sendPost(url, {});
    return res.data;
  },
};
