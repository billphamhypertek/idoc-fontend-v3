import { sendDelete, sendGet, sendPost } from "@/api";
import { Constant } from "@/definitions/constants/constant";
import {
  WatchListParams,
  WatchListResponse,
} from "@/definitions/types/watch-list.type";

export class WatchListService {
  static async getWatchListByOrg(
    params: WatchListParams
  ): Promise<WatchListResponse[]> {
    const { orgId, fromDate, toDate, statuses, leader } = params;
    if (!orgId) {
      const response = await sendGet(
        `${Constant.WATCH_LIST.GET_ALL}?fromDate=${fromDate}&toDate=${toDate}&statuses=${statuses}&leader=${leader}`
      );
      return response.data;
    } else {
      const response = await sendGet(
        `${Constant.WATCH_LIST.GET_ALL}/${orgId}?fromDate=${fromDate}&toDate=${toDate}&statuses=${statuses}&leader=${leader}`
      );
      return response.data;
    }
  }

  static async getTaskLeadByOrgId(orgId: number) {
    const response = await sendGet(`/task/lead/${orgId}`);
    return response.data;
  }

  static async getListOrgWaitFinish(fromDate: string, toDate: string) {
    const response = await sendGet(
      `${Constant.WATCH_LIST.LIST_WAIT_FINISH}?fromDate=${fromDate}&toDate=${toDate}`
    );
    return response.data;
  }

  static async checkStatusWatchList(
    orgId: number,
    fromDate: string,
    toDate: string,
    statuses: string,
    exist: boolean
  ) {
    const response = await sendGet(
      `${Constant.WATCH_LIST.STATUS}?orgId=${orgId}&fromDate=${fromDate}&toDate=${toDate}&statuses=${statuses}&exist=${exist}`
    );
    return response.data;
  }

  static async getOrgParentByOrgId(childId: number) {
    const response = await sendGet(`/org/findParentByOrgId/${childId}`);
    return response.data;
  }

  static async updateWatchList(watchList: any) {
    const response = await sendPost(`${Constant.WATCH_LIST.UPDATE}`, watchList);
    return response.data;
  }

  static async deleteWatchList(watchList: any) {
    const response = await sendPost(`${Constant.WATCH_LIST.DELETE}`, watchList);
    return response.data;
  }

  static async sendNoteWatchList(watchList: any) {
    const response = await sendPost(
      `${Constant.WATCH_LIST.SEND_NOTE}`,
      watchList
    );
    return response.data;
  }

  static async approveWatchList(watchList: any) {
    const response = await sendPost(`${Constant.WATCH_LIST.ACCEPT}`, watchList);
    return response.data;
  }

  static async exportPdf(
    orgId: string,
    fromDate: string,
    toDate: string,
    leader: boolean
  ) {
    const response = await sendGet(
      `${Constant.WATCH_LIST.EXPORT}?orgId=${orgId}&fromDate=${fromDate}&toDate=${toDate}&leader=${leader}`,
      null,
      {
        responseType: "blob",
      }
    );
    return response;
  }

  static async exportExcel(
    orgId: string,
    fromDate: string,
    toDate: string,
    leader: boolean
  ) {
    const response = await sendGet(
      `${Constant.WATCH_LIST.EXPORT_EXCEL}?orgId=${orgId}&fromDate=${fromDate}&toDate=${toDate}&leader=${leader}`,
      null,
      {
        responseType: "blob",
      }
    );
    return response;
  }

  static async finishWatchList(watchList: any) {
    const response = await sendPost(`${Constant.WATCH_LIST.FINISH}`, watchList);
    return response.data;
  }

  static async rejectWatchList(watchList: any) {
    const response = await sendPost(`${Constant.WATCH_LIST.REJECT}`, watchList);
    return response.data;
  }

  static async rejectWatchListFromFinish(watchList: any) {
    const response = await sendPost(`${Constant.WATCH_LIST.RETURN}`, watchList);
    return response.data;
  }
}
