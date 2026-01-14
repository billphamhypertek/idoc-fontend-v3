import { sendGet, sendPost } from "@/api";
import { Constant } from "@/definitions/constants/constant";
import {
  AttachedDocumentResponse,
  AttachedDocumentSearch,
  SearchTaskDocument,
} from "@/definitions/types/document-out.type";
import {
  FollowerTask,
  TaskAssignListResponse,
  TaskExecuteListResponse,
} from "@/definitions/types/task-assign.type";
import { getUserInfo } from "@/utils/token.utils";
import { searchTaskParams } from "@/definitions/types/task.type";
import { LeadInformation } from "@/definitions";

export class TaskV2Service {
  static async findBasic(
    type: number,
    status: string,
    page: number,
    size: number
  ) {
    const res = await sendGet(`/declared_task/findBasic/${type}`, {
      page: page.toString(),
      status: status,
      size: size.toString(),
    });
    return res.data;
  }

  static async doGetListListTaskAssigner() {
    const res = await sendGet(`/users/getListUserAssignTask`);
    return res.data;
  }

  static async create(data: any) {
    const res = await sendPost(`/declared_task/create`, data);
    return res.data;
  }

  static async update(id: number, data: any) {
    const res = await sendPost(`/declared_task/update/${id}`, data);
    return res.data;
  }

  static async delete(id: number) {
    const res = await sendPost(`/declared_task/delete/${id}`);
    return res.data;
  }

  static async findAdvance(
    type: number,
    status: string,
    taskName?: string,
    startDate?: string,
    endDate?: string,
    page: number = 0,
    size: number = 10
  ) {
    const params: Record<string, any> = {
      page: page.toString(),
      status: status,
      size: size.toString(),
    };

    if (taskName) {
      params.taskName = taskName;
    }
    if (startDate) {
      params.startDate = startDate;
    }
    if (endDate) {
      params.endDate = endDate;
    }

    const res = await sendGet(`/declared_task/findAdvance/${type}`, params);
    return res.data;
  }

  static async getDetail(id: number) {
    const res = await sendGet(`/declared_task/getDetail/${id}`);
    return res.data;
  }

  static async createDepartmentTask(data: any) {
    const res = await sendPost(`/department_task/create`, data);
    return res.data;
  }

  static async updateDepartmentTask(data: any) {
    const res = await sendPost(`/department_task/update`, data);
    return res.data;
  }

  static async exportDepartmentTask() {
    const res = await sendGet(`/department_task/export`, undefined, {
      responseType: "blob",
    });
    return res;
  }

  static async countDepartmentTask() {
    const res = await sendGet(`/department_task/count`);
    return res.data;
  }

  static async detailDepartmentTask(id: number) {
    const res = await sendGet(`department_task/detail/${id}`);
    return res.data;
  }

  static async deleteDepartmentTask(id: number) {
    const res = await sendPost(`/department_task/delete/${id}`);
    return res.data;
  }

  static async approveOrRejectDepartmentTask(id: number, approved: boolean) {
    const res = await sendPost(
      `/department_task/approve?taskId=${id}&approved=${approved}`
    );
    return res.data;
  }

  static async listDepartmentTask(
    status: string,
    page: number,
    size: number,
    orgId: string
  ) {
    const res = await sendGet(
      `/department_task/list?status=${status}&page=${page}&size=${size}&orgId=${orgId}`
    );
    return res.data;
  }

  static async getAllTracking(id: number) {
    const res = await sendGet(`${Constant.TASK_NEW_V2.GET_ALL_TRACKING + id}`);
    return res.data;
  }

  static async doInactiveTransfer(nodeId: number, taskId: number) {
    const res = await sendGet(`/task2/users/${nodeId}/${taskId}`);
    return res.data;
  }

  static async addTaskAssignTo(taskAdd: any) {
    const res = await sendPost(Constant.TASK_NEW_V2.ADD_TASK_ASSIGN, taskAdd);
    return res.data;
  }

  static async doSaveTaskAttachment(taskId: number | string, files: any[]) {
    const formData = new FormData();
    formData.append("type", "1");
    files.forEach((file) => {
      formData.append("files", file);
    });
    const res = await sendPost(
      Constant.TASK_NEW_V2.ADD_ATTACHMENT + taskId,
      formData
    );
    return res.data;
  }

  static async deleteTask(taskId: number | string) {
    const res = await sendGet(`/task2/delete/${taskId}`);
    return res.data;
  }

  static async doAddTransfer(taskId: number | string, data: any) {
    const res = await sendPost(`/task2/add-transfer/${taskId}`, data);
    return res.data;
  }

  static async doTransfer(taskId: number | string, data: any) {
    const res = await sendPost(`/task2/transfer/${taskId}`, data);
    return res.data;
  }

  static async getTaskAssign(formData: any) {
    const res = await sendPost(
      `${Constant.TASK_NEW_V2.GET_BY_USER_ASSIGN}`,
      formData
    );
    return res.data as TaskAssignListResponse;
  }

  static async updateStatusV2(
    taskId: number | string,
    isExcute: boolean,
    status: any,
    reason?: string,
    files?: any[]
  ) {
    const formData = new FormData();
    if (reason) {
      formData.append("comment", reason);
    }
    if (files && files.length) {
      files.forEach((file, index) => {
        formData.append("files", file);
      });
    }
    formData.append("taskId", String(taskId));
    formData.append("status", String(status));
    formData.append("isExcute", String(isExcute));
    const userInfo = JSON.parse(getUserInfo() || "{}");
    formData.append("userId", userInfo?.id);

    const res = await sendPost(`/task2/update/status/${taskId}`, formData);
    return res.data;
  }

  static async setImportant(id: number) {
    const formData = new FormData();
    formData.append("taskId", id.toString());
    const res = await sendPost(
      Constant.TASK_NEW_V2.UPDATE_IMPORTANT_TASK,
      formData
    );
    return res.data;
  }

  static async updateFollowerTaskV2(
    id: number | string,
    payload: FollowerTask[]
  ) {
    const res = await sendPost(`/task2/update-follow/${id}`, payload);
    return res.data;
  }

  static async findById(taskId: string | number) {
    const res = await sendGet(Constant.TASK_NEW_V2.FIND_BY_ID + taskId);
    return res.data;
  }

  static async getTaskExecute(formData: any) {
    const res = await sendPost(
      `${Constant.TASK_NEW_V2.GET_BY_USER_EXECUTE}`,
      formData
    );
    return res.data as TaskExecuteListResponse;
  }

  static async doSearchDocumentOut(
    searchDocumentFilter: SearchTaskDocument,
    page: number
  ) {
    const res = await sendPost(
      Constant.TASK_NEW_V2.SEARCH_DOC_OUT + page,
      searchDocumentFilter
    );
    return res.data;
  }

  static async doSearchAttachedDocument(
    searchDocumentFilter: AttachedDocumentSearch,
    page: number
  ) {
    const res = await sendPost(
      Constant.TASK_NEW_V2.SEARCH_DOC_IN + page,
      searchDocumentFilter
    );
    return res.data as AttachedDocumentResponse;
  }

  static async getListMainTasks(tab: string, params: any) {
    const res = await sendPost(
      Constant.TASK_NEW_V2.GET_LIST_MAIN + tab,
      params
    );
    return res.data;
  }

  static async updateImportantTaskExecuteV2(params: FormData) {
    const res = await sendPost(
      Constant.TASK_NEW_V2.UPDATE_TASK_EXECUTE_IMPORTANT,
      params
    );
    return res.data;
  }

  static async updateProgressV2(taskId: number | string, params: FormData) {
    const res = await sendPost(
      Constant.TASK_NEW_V2.UPDATE_PROGRESS + taskId,
      params
    );
    return res.data;
  }

  static async getListCombinationTasksV2(tab: string, params: any) {
    const res = await sendPost(
      Constant.TASK_NEW_V2.GET_LIST_COMBINATION + tab,
      params
    );
    return res.data;
  }

  static async getFindByIdTaskV2(id: number) {
    const res = await sendGet(`${Constant.TASK_NEW_V2.FIND_BY_ID + id}`);
    return res.data || null;
  }

  static async getActionV2(id: number, assigner: boolean = false) {
    const res = await sendGet(
      `${Constant.TASK_NEW_V2.GET_ACTION + id}?assigner=${assigner}`
    );
    return res.data;
  }

  static async updateAcceptTaskV2(
    taskId: number,
    status: number,
    isExcute: boolean,
    comment?: string,
    files?: any,
    userId?: number
  ) {
    const formData = new FormData();

    formData.append("taskId", taskId.toString());
    formData.append("status", status.toString());
    if (comment) {
      formData.append("comment", comment);
    }
    if (files && files.length > 0) {
      files.forEach((file: any) => {
        formData.append("files", file);
      });
    }
    if (isExcute) {
      formData.append("isExcute", isExcute.toString());
    }
    if (userId) {
      formData.append("userId", userId.toString());
    }

    const res = await sendPost(`/task2/update/status/${taskId}`, formData);
    return res.data;
  }

  static async getComments(taskId: number) {
    const res = await sendGet(`${Constant.TASK_NEW_V2.GET_COMMENT + taskId}`);
    return res.data;
  }

  static async getResults(taskId: number) {
    const res = await sendGet(`/task-result2/task/${taskId}`);
    return res.data;
  }

  static async updateTaskV2(taskInfo: any) {
    const res = await sendPost(`/task2/update/${taskInfo.id}`, taskInfo);
    return res.data;
  }

  static async updateStatusKanbanV2(
    taskId: number,
    fromStatus: number,
    toStatus: number,
    frUserId: number,
    toUserId: number,
    type: number
  ) {
    const queryString = `fromStatus=${fromStatus}&toStatus=${toStatus}&frUserId=${frUserId}&toUserId=${toUserId}&type=${type}`;

    const res = await sendPost(
      `/task2/updateStatus/${taskId}?${queryString}`,
      null
    );
    return res.data;
  }

  static async getTrackingV2(id: number) {
    const res = await sendGet(`${Constant.TASK_NEW_V2.GET_TRACKING + id}`);
    return res.data;
  }

  static async getUserFlowV2(taskId: number) {
    const res = await sendGet(`${Constant.TASK_NEW_V2.GET_USER_FLOW + taskId}`);
    return res.data;
  }

  static async getRealTimeV2(taskId: number, userId: number) {
    const res = await sendGet(
      `${Constant.TASK_NEW_V2.REAL_TIME}?taskId=${taskId}&userId=${userId}`
    );
    return res.data || null;
  }

  static async saveRealTimeV2(
    taskId: number,
    userId: number,
    startDate: string,
    endDate: string
  ) {
    const formData = new FormData();
    formData.append("taskId", taskId.toString());
    formData.append("userId", userId.toString());
    formData.append("startDate", startDate);
    formData.append("endDate", endDate);
    const res = await sendPost(`${Constant.TASK_NEW_V2.REAL_TIME}`, formData);
    return res.data;
  }

  static async doDeleteTaskAttV2(id: number) {
    const res = await sendPost(Constant.TASK_NEW_V2.DELETE_TASK_ATT + id, null);
    return res.data;
  }

  static async getByUserExecuteV2(params: any) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, String(value));
    });

    const res = await sendPost(
      `${Constant.TASK_NEW_V2.GET_BY_USER_EXECUTE}?${queryParams.toString()}`,
      null
    );
    return res.data;
  }
  static async doSearchTaskFollowV2(body: searchTaskParams, page: number) {
    const res = await sendPost(`/task2/list/following/${page}`, body);
    return res.data;
  }

  static async doLoadTaskExportFollowing(task: any) {
    const res = await sendPost(`/task2/export-following-task`, task);
    return res.data;
  }
  static async updateFollowTask(taskId: number, data: any) {
    const res = await sendPost(`/task2/update-follow/${taskId}`, data);
    return res.data;
  }
  static async getListLeadById(id: number): Promise<LeadInformation[]> {
    const response = await sendGet(`/task2/lead/${id}`);
    return response.data;
  }
  static async doSearchTask(body: searchTaskParams, page: number) {
    const res = await sendPost(`/task2/list/all/${page}`, body);
    return res.data;
  }
  static async doLoadTaskExport(task: any) {
    const res = await sendPost(`/task2/export`, task);
    return res.data;
  }
  static async getAllTaskStatistic(
    startDate: string = "",
    orgId: string = "",
    endDate: string = ""
  ) {
    const res = await sendGet(
      `/task2/statistic?startDate=${startDate}&endDate=${endDate}&orgId=${orgId}`
    );
    return res.data;
  }

  static async acceptDeclaredTask(id: number, accept: boolean) {
    const res = await sendPost(`/declared_task/accept/${id}`, null, {
      accept: accept.toString(),
    });
    return res.data;
  }

  static async exportAnalysis() {
    const res = await sendGet(`/task2/export-analysis`, undefined, {
      responseType: "blob",
    });
    return res;
  }

  static async getTaskDashboardDataV2(
    orgId: string,
    userId: string,
    weekCheck: boolean = false,
    monthCheck: boolean = false,
    yearCheck: boolean = false,
    fromDate: string = "",
    toDate: string = ""
  ) {
    const res = await sendGet(
      `/taskDashboard2/getTaskDashboardData?orgId=${orgId}&userId=${userId}&weekCheck=${weekCheck}&monthCheck=${monthCheck}&yearCheck=${yearCheck}&fromDate=${fromDate}&toDate=${toDate}`
    );
    return res.data;
  }

  static async getTaskDashboardByDepartmentV2(
    orgId: string,
    weekCheck: boolean = false,
    monthCheck: boolean = false,
    yearCheck: boolean = false,
    fromDate: string = "",
    toDate: string = ""
  ) {
    const res = await sendGet(
      `/taskDashboard2/getTaskDashboard?orgId=${orgId}&weekCheck=${weekCheck}&monthCheck=${monthCheck}&yearCheck=${yearCheck}&fromDate=${fromDate}&toDate=${toDate}`
    );
    return res.data;
  }

  static async getTaskDashboardListV2(text: any) {
    const res = await sendGet(`/taskDashboard2/list?&text=${text}`);
    return res.data;
  }

  static async listTasksbyUserV2(userId: number) {
    const res = await sendGet(`/taskDashboard2/listUser/${userId}`);
    return res.data;
  }

  static async getTaskStatisticDetailV2(
    orgId: number,
    startDate: string,
    endDate: string
  ) {
    const res = await sendGet(
      `/task2/statistic/${orgId}?startDate=${startDate}&endDate=${endDate}`
    );
    return res.data;
  }

  static async getRegularWeek(approve: boolean = false, userId?: any) {
    const params = new URLSearchParams();
    if (userId) params.append("userId", userId);
    const res = await sendGet(
      `/regular_task/week-task?approve=${approve}&${params.toString()}`
    );
    return res.data;
  }

  static async updateRegularWeek(data: any) {
    const res = await sendPost(`/regular_task/update`, data);
    return res.data;
  }

  static async exportRegular() {
    const res = await sendGet(`/regular_task/export`, undefined, {
      responseType: "blob",
    });
    return res;
  }
}
