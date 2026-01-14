import { sendGet, sendPost } from "@/api";
import { Constant } from "@/definitions/constants/constant";
import {
  FollowerTask,
  TaskAssignCreate,
  TaskAssignListResponse,
  TaskExecuteListResponse,
} from "@/definitions/types/task-assign.type";
import { searchTaskParams } from "@/definitions/types/task.type";
import { getUserInfo } from "@/utils/token.utils";

export class TaskService {
  static async doDeleteTaskAtt(id: number) {
    const res = await sendPost(Constant.TASK_NEW.DELETE_TASK_ATT + id, null);
    return res.data;
  }

  static async getListMainTasks(tab: string, params: any) {
    const res = await sendPost(Constant.TASK_NEW.GET_LIST_MAIN + tab, params);
    return res.data;
  }
  static async getListCombinationTasks(tab: string, params: any) {
    const res = await sendPost(
      Constant.TASK_NEW.GET_LIST_COMBINATION + tab,
      params
    );
    return res.data;
  }

  static async updateProgress(taskId: number | string, params: FormData) {
    const res = await sendPost(
      Constant.TASK_NEW.UPDATE_PROGRESS + taskId,
      params
    );
    return res.data;
  }

  static async updateImportantTaskExecute(params: FormData) {
    const res = await sendPost(
      Constant.TASK_NEW.UPDATE_TASK_EXECUTE_IMPORTANT,
      params
    );
    return res.data;
  }
  static async setImportant(id: number) {
    const formData = new FormData();
    formData.append("taskId", id.toString());
    const res = await sendPost(
      Constant.TASK_NEW.UPDATE_IMPORTANT_TASK,
      formData
    );
    return res.data;
  }
  static async getTaskAssign(formData: any) {
    const res = await sendPost(`/task/findByUserAssign`, formData);
    return res.data as TaskAssignListResponse;
  }
  static async updateStatus(
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

    const res = await sendPost(
      Constant.TASK_NEW.UPDATE_STATUS + taskId,
      formData
    );
    return res.data;
  }
  static async findById(taskId: string | number) {
    const res = await sendGet(Constant.TASK_NEW.FIND_BY_ID + taskId);
    return res.data;
  }
  static async doDeleteTask(id: number | string) {
    const res = await sendGet(Constant.TASK_NEW.DELETE_TASK_ACTIVE + id);
    return res.data;
  }
  static async updateFollowerTask(
    id: number | string,
    payload: FollowerTask[]
  ) {
    const res = await sendPost(Constant.TASK_NEW.UPDATE_FOLLOWER + id, payload);
    return res.data;
  }
  static async addTaskAssignTo(taskAdd: any) {
    const res = await sendPost(Constant.TASK_NEW.ADD_TASK_ASSIGN, taskAdd);
    return res.data;
  }

  static async addTaskDoc(taskInfo: any) {
    const userLogin = JSON.parse(getUserInfo() || "{}");
    if (taskInfo.userAssignId == null) {
      taskInfo.userAssignId = userLogin?.id;
    }
    const res = await sendPost(Constant.TASK_NEW.ADD_TASK_DOC, taskInfo);
    return res.data;
  }
  static async doTransfer(taskId: number | string, data: any) {
    const res = await sendPost(Constant.TASK_NEW.TRANSFER + taskId, data);
    return res.data;
  }
  static async doAddTransfer(taskId: number | string, data: any) {
    const res = await sendPost(Constant.TASK_NEW.ADD_TRANSFER + taskId, data);
    return res.data;
  }
  static async deleteTaskPost(taskId: number | string) {
    const res = await sendPost(
      Constant.TASK_NEW.DELETE_TASK_ACTIVE + taskId,
      null
    );
    return res.data;
  }
  static async doSaveTaskAttachment(taskId: number | string, files: any[]) {
    const formData = new FormData();
    formData.append("type", "1");
    files.forEach((file) => {
      formData.append("files", file);
    });
    const res = await sendPost(
      Constant.TASK_NEW.ADD_ATTACHMENT + taskId,
      formData
    );
    return res.data;
  }
  static async doInactiveTransfer(nodeId: number, taskId: number) {
    const res = await sendGet(
      Constant.TASK_NEW.TASK_INACTIVE_TRANSFER + `${nodeId}/${taskId}`
    );
    return res.data;
  }

  static async getFindOrgAll() {
    const res = await sendGet("/org/find_all_org_sub");
    return res.data;
  }

  static async doSearchTaskFollow(body: searchTaskParams, page: number) {
    const res = await sendPost(`/task/list/following/${page}`, body);
    return res.data;
  }

  static async getAction(id: number, assigner: boolean = false) {
    const res = await sendGet(
      `${Constant.TASK_NEW.GET_ACTION + id}?assigner=${assigner}`
    );
    return res.data;
  }

  static async getUserFlow(taskId: number) {
    const res = await sendGet(`${Constant.TASK_NEW.GET_USER_FLOW + taskId}`);
    return res.data;
  }

  static async getRealTime(taskId: number, userId: number) {
    const res = await sendGet(
      `${Constant.TASK_NEW.REAL_TIME}?taskId=${taskId}&userId=${userId}`
    );
    return res.data || null;
  }

  static async saveRealTime(
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
    const res = await sendPost(`${Constant.TASK_NEW.REAL_TIME}`, formData);
    return res.data;
  }

  static async getByUserExecute(params: any) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      queryParams.append(key, String(value));
    });

    const res = await sendPost(
      `${Constant.TASK_NEW.GET_BY_USER_EXECUTE}?${queryParams.toString()}`,
      null
    );
    return res.data;
  }

  static async getTracking(id: number) {
    const res = await sendGet(`${Constant.TASK_NEW.GET_TRACKING + id}`);
    return res.data;
  }

  static async getAllTracking(id: number) {
    const res = await sendGet(`${Constant.TASK_NEW.GET_ALL_TRACKING + id}`);
    return res.data;
  }

  static async getFindByIdTask(id: number) {
    const res = await sendGet(`${Constant.TASK_NEW.FIND_BY_ID + id}`);
    return res.data || null;
  }

  static async updateTask(taskInfo: any) {
    const res = await sendPost(`/task/update/${taskInfo.id}`, taskInfo);
    return res.data;
  }

  static async getComments(taskId: number) {
    const res = await sendGet(`${Constant.TASK_NEW.GET_COMMENT + taskId}`);
    return res.data;
  }

  static async getResults(taskId: number) {
    const res = await sendGet(`/task-result/task/${taskId}`);
    return res.data;
  }

  static async updateCommentByType(
    type: string,
    comment: string,
    commentIdSaved: number
  ) {
    if (!type || !comment || comment.length === 0 || !commentIdSaved) {
      return;
    }
    const formData = new FormData();
    formData.append("type", type);
    formData.append("comment", comment);

    const res = await sendPost(
      `/common/comment/update/${commentIdSaved}`,
      formData
    );
    return res.data;
  }

  static async updateAcceptTask(
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

    const res = await sendPost(`/task/update/status/${taskId}`, formData);
    return res.data;
  }

  static async updateFollowTask(taskId: number, data: any) {
    const res = await sendPost(`/task/update-follow/${taskId}`, data);
    return res.data;
  }

  static async deleteTask(taskId: number | string) {
    const res = await sendGet(`/task/delete/${taskId}`);
    return res.data;
  }

  static async doLoadTaskExportFollowing(task: any) {
    const res = await sendPost(`/task/export-following-task`, task);
    return res.data;
  }

  static async doSearchTask(body: searchTaskParams, page: number) {
    const res = await sendPost(`/task/list/all/${page}`, body);
    return res.data;
  }

  static async doLoadTaskExport(task: any) {
    const res = await sendPost(`/task/export`, task);
    return res.data;
  }

  static async getTaskOrgUserLead(
    status: boolean,
    page: number,
    dayLeft: string,
    userOrgId: number
  ) {
    const params = new FormData();
    params.append("status", status.toString());
    params.append("page", page.toString());
    params.append("dayLeft", dayLeft);
    params.append("orgId", userOrgId.toString());
    const res = await sendPost(
      `${Constant.TASK_NEW.GET_ALL_TASK_USER_LEAD}`,
      params
    );
    return res.data;
  }
  static async doSaveATaskReport(files: any[]) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append("files", file);
    });
    const res = await sendPost(`/doc_out_attach/addFileReport/draft`, formData);
    return res.data;
  }

  static async getTaskExecute(formData: any) {
    const res = await sendPost(`/task/findByUserExecute`, formData);
    return res.data as TaskExecuteListResponse;
  }

  static async getAllTaskStatistic(
    startDate: string = "",
    orgId: string = "",
    endDate: string = ""
  ) {
    const res = await sendGet(
      `/task/statistic?startDate=${startDate}&endDate=${endDate}&orgId=${orgId}`
    );
    return res.data;
  }

  static async saveTaskAssign(payload: TaskAssignCreate) {
    const res = await sendPost(Constant.TASK_NEW.ADD_TASK_ASSIGN, payload);
    return res.data;
  }

  static async attachTask(formData: any, id: number | string) {
    const res = await sendPost(
      `${Constant.TASK_NEW.ADD_ATTACHMENT}${id}`,
      formData
    );
    return res.data;
  }

  static async getAllUsersByOrgAndSub(orgId: number) {
    const res = await sendGet(`/users/get-user-org-and-sub/${orgId}`);
    return res.data;
  }

  static async doGetTaskKpi(
    from: string,
    to: string,
    orgId: number | string,
    userId: string | number,
    page: number,
    size: number
  ) {
    const url = `/kpi2/getKPI?from=${from}&to=${to}&orgId=${orgId}&userId=${userId}&page=${page}&size=${size}`;
    const res = await sendGet(url);
    return res.data;
  }

  static async doGetDetailKpi(
    from: string,
    to: string,
    userId: string | number,
    page: number,
    size: number
  ) {
    const url = `/kpi2/getKPIDetail?from=${from}&to=${to}&userId=${userId}&page=${page}&size=${size}`;
    const res = await sendGet(url);
    return res.data;
  }

  static async doGetDetailKpiTask(taskId: number | string) {
    const url = `/task-tracking/${taskId}`;
    const res = await sendGet(url);
    return res.data;
  }

  static async getTaskDashboardByDepartment(
    orgId: string,
    weekCheck: boolean = false,
    monthCheck: boolean = false,
    yearCheck: boolean = false,
    fromDate: string = "",
    toDate: string = ""
  ) {
    const res = await sendGet(
      `/taskDashboard/getTaskDashboard?orgId=${orgId}&weekCheck=${weekCheck}&monthCheck=${monthCheck}&yearCheck=${yearCheck}&fromDate=${fromDate}&toDate=${toDate}`
    );
    return res.data;
  }

  static async getTaskDashboardData(
    orgId: string,
    userId: string,
    weekCheck: boolean = false,
    monthCheck: boolean = false,
    yearCheck: boolean = false,
    fromDate: string = "",
    toDate: string = ""
  ) {
    const res = await sendGet(
      `/taskDashboard/getTaskDashboardData?orgId=${orgId}&userId=${userId}&weekCheck=${weekCheck}&monthCheck=${monthCheck}&yearCheck=${yearCheck}&fromDate=${fromDate}&toDate=${toDate}`
    );
    return res.data;
  }

  static async getTaskDashboardListOrg(orgIds: number[], text: any) {
    const res = await sendGet(
      `/taskDashboard/listOrg?orgId=${orgIds.join(",")}&text=${text}`
    );
    return res.data;
  }

  static async getTaskDashboardList(userIds: any, text: any) {
    const res = await sendGet(
      `/taskDashboard/list?userIds=${userIds}&text=${text}`
    );
    return res.data;
  }

  static async listTasksbyUser(
    userId: number,
    weekCheck: boolean = false,
    monthCheck: boolean = false,
    yearCheck: boolean = false,
    fromDate: string = "",
    toDate: string = ""
  ) {
    const queryString = `weekCheck=${weekCheck}&monthCheck=${monthCheck}&yearCheck=${yearCheck}&fromDate=${fromDate}&toDate=${toDate}`;
    const res = await sendGet(
      `/taskDashboard/listUser/${userId}?${queryString}`
    );
    return res.data;
  }

  static async taskDashboardKanbanList(
    orgId: any,
    text: any,
    isOrg: boolean = false,
    isExecute?: boolean | null
  ) {
    const formData = new FormData();
    formData.append("text", text);
    formData.append("isOrg", isOrg.toString());
    formData.append("orgId", orgId);
    formData.append("isExecute", isExecute == null ? "" : isExecute.toString());

    const res = await sendPost(`/taskDashboard/kanban-v2`, formData);
    return res.data;
  }

  static async updateStatusKanban(
    taskId: number,
    fromStatus: number,
    toStatus: number,
    frUserId: number,
    toUserId: number,
    type: number
  ) {
    const queryString = `fromStatus=${fromStatus}&toStatus=${toStatus}&frUserId=${frUserId}&toUserId=${toUserId}&type=${type}`;

    const res = await sendPost(
      `/task/updateStatus/${taskId}?${queryString}`,
      null
    );
    return res.data;
  }

  static async setImportantKanban(objId: number, type: string) {
    const queryString = `objId=${objId}&type=${type}`;

    const res = await sendPost(
      `/taskDashboard/setImportant?${queryString}`,
      null
    );
    return res.data;
  }

  static async updateUserHandle(
    taskId: number,
    newUserId: number,
    userId: number
  ) {
    const queryString = `taskId=${taskId}&newUserId=${newUserId}&userId=${userId}`;

    const res = await sendGet(`/taskDashboard/updateUserHandle?${queryString}`);
    return res.data;
  }

  static async listDashboard(taskId: number) {
    const res = await sendGet(`/taskDashboard/node/${taskId}`);
    return res.data;
  }

  static async doPageRegular(
    page: number,
    size: number,
    text?: string,
    orgId?: number,
    complexityId?: number
  ) {
    const params = new URLSearchParams({
      page: String(page),
      size: String(size),
    });

    if (text) params.append("text", text);
    if (orgId) params.append("orgId", String(orgId));
    if (complexityId) params.append("complexityId", String(complexityId));

    const res = await sendGet(`/regular_task/getAllPage?${params.toString()}`);
    return res.data;
  }

  static async createRegular(data: any) {
    const res = await sendPost(`/regular_task/create`, data);
    return res.data;
  }

  static async updateRegular(data: any) {
    const res = await sendPost(`/regular_task/update`, data);
    return res.data;
  }

  static async deleteRegular(id: number) {
    const res = await sendPost(`/regular_task/delete/${id}`, null);
    return res.data;
  }

  static async getTaskStatisticDetail(
    orgId: number,
    startDate: string,
    endDate: string
  ) {
    const res = await sendGet(
      `/task/statistic/${orgId}?startDate=${startDate}&endDate=${endDate}`
    );
    return res.data;
  }

  static async exportTaskKpi(
    orgId: string,
    userId: string,
    fromDate?: string,
    toDate?: string
  ) {
    const params: Record<string, any> = {
      orgId: orgId,
      userId: userId,
    };

    if (fromDate) {
      params.from = fromDate;
    }
    if (toDate) {
      params.to = toDate;
    }

    const res = await sendGet("/kpi2/exportKPI", params, {
      responseType: "blob",
    });
    return res;
  }

  // Declared Task APIs
  static async createDeclaredTask(createDto: any) {
    const res = await sendPost("/declared_task/create", createDto);
    return res.data;
  }

  static async findBasicDeclaredTask(
    type: number,
    status: string,
    page: number = 0,
    size: number = 10
  ) {
    const params = {
      page: page.toString(),
      status: status,
      size: size.toString(),
    };
    const res = await sendGet(`/declared_task/findBasic/${type}`, params);
    return res.data;
  }

  static async updateDeclaredTask(id: number, updateDto: any) {
    const res = await sendPost(`/declared_task/update/${id}`, updateDto);
    return res.data;
  }

  static async deleteDeclaredTask(id: number) {
    const res = await sendPost(`/declared_task/delete/${id}`, {});
    return res.data;
  }

  static async findAdvanceDeclaredTask(
    type: number,
    status?: string,
    taskName?: string,
    startDate?: string,
    endDate?: string,
    page: number = 0,
    size: number = 10
  ) {
    const params: Record<string, string> = {
      page: page.toString(),
      size: size.toString(),
    };

    if (status) params.status = status;
    if (taskName) params.taskName = taskName;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const res = await sendGet(`/declared_task/findAdvance/${type}`, params);
    return res.data;
  }

  static async getTaskOrgUserLeadV2(
    status: boolean,
    page: number,
    dayLeft: string,
    userOrgId: number
  ) {
    const params = new FormData();
    params.append("status", status.toString());
    params.append("page", page.toString());
    params.append("dayLeft", dayLeft);
    params.append("orgId", userOrgId.toString());
    const res = await sendPost(
      `${Constant.TASK_NEW_V2.GET_ALL_TASK_USER_LEAD}`,
      params
    );
    return res.data;
  }

  static async getListViewFollow(taskId: number) {
    const res = await sendGet(`/task/listViewFollow?taskId=${taskId}`);
    return res.data;
  }
}
