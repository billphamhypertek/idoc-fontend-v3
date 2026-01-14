import { sendGet, sendGetMultiple, sendPost } from "@/api";
import { UserInfo } from "@/definitions/types/auth.type";
import { RequestCerOrgAndGroup, User } from "@/definitions/types/user.type";

export class UserService {
  static async getAllUsers(params: Record<string, any> = {}): Promise<User[]> {
    const response = await sendGet("/users/getAllSort/ASC/id", params);
    return response.data as User[];
  }

  static async addUser(user: User) {
    // Call with encrypt=true first (for logging/audit)
    try {
      await sendPost("/users/addUser?encrypt=true", user);
    } catch (encryptError) {
      console.log(
        "Encrypt API failed, continuing with non-encrypt API:",
        encryptError
      );
    }
    // Then call without encrypt for actual add
    const response = await sendPost("/users/addUser", user);
    return response.data;
  }

  static async activeDeactiveUser(user: User) {
    const url = user.active
      ? `/users/deactive/${user.id}`
      : `/users/active/${user.id}`;
    const response = await sendGet(url);
    return response.data;
  }

  static async updateUser(user: User) {
    // Call with encrypt=true first (for logging/audit)
    try {
      await sendPost(`/users/update/${user.id}?encrypt=true`, user);
    } catch (encryptError) {
      console.log(
        "Encrypt API failed, continuing with non-encrypt API:",
        encryptError
      );
    }
    // Then call without encrypt for actual update
    const response = await sendPost(`/users/update/${user.id}`, user);
    return response.data;
  }

  static async getUserByCert(user: User) {
    const response = await sendPost(`/users/checkCert/${user.id}`, user);
    return response.data;
  }

  static async getUserByToken(user: User) {
    // Call with encrypt=true first (for logging/audit)
    try {
      await sendPost(`/users/checkToken/${user.id}?encrypt=true`, user);
    } catch (encryptError) {
      console.log(
        "Encrypt API failed, continuing with non-encrypt API:",
        encryptError
      );
    }
    // Then call without encrypt for actual check
    const response = await sendPost(`/users/checkToken/${user.id}`, user);
    return response.data;
  }

  static async getUsersActive(): Promise<User[]> {
    const response = await sendGet("/users/getActive");
    return response.data as User[];
  }

  static async getUsersInformationActive(): Promise<UserInfo[]> {
    const response = await sendGet("/users/getActive");
    return response.data as UserInfo[];
  }

  static async searchUserActiveByTextSearch(
    textSearch: string
  ): Promise<UserInfo[]> {
    const formData = new FormData();
    formData.append("textSearch", textSearch ?? "");
    const response = await sendPost("/users/all-user-in-org", formData);
    return response.data as UserInfo[];
  }

  static async searchUser(params: Record<string, any>) {
    const response = await sendPost("/users/findUser", params);
    return response.data;
  }

  static async searchUserActive(textSearch: string) {
    const response = await sendPost("/users/all-user-in-org", {
      textSearch: textSearch ?? "",
    });
    return response.data;
  }

  static async searchUserActive1(textSearch: string) {
    const formData = new FormData();
    formData.append("textSearch", textSearch ?? "");
    const response = await sendPost("/users/search1", formData);
    return response.data;
  }

  static async searchUserSignOrg(textSearch: string) {
    const response = await sendPost("/users/search-sign-org", {
      textSearch: textSearch ?? "",
    });
    return response.data;
  }

  static async searchUserSpace(textSearch: string) {
    const response = await sendPost("/document_out/suggest/user", {
      textSearch,
    });
    return response.data;
  }

  static async getAllUserByLead() {
    const response = await sendGet("/users/getAllUserByLead");
    return response.data;
  }

  static async findByUserName(formData: FormData) {
    return await sendPost("/users/findByUserName", formData);
  }

  static async findByUserIdFormData(userId: string) {
    const formData = new FormData();
    formData.append("userId", userId);
    const response = await sendPost("/users/findByUserId", formData);
    return response.data;
  }

  static async findByUserId(userId: string) {
    const response = await sendPost("/users/findByUserId", { userId });
    return response.data;
  }

  static async getProfile() {
    const response = await sendPost("/users/getProfile", {});
    return response.data;
  }

  static async getAllUsersOrderPosition(): Promise<User[]> {
    const response = await sendGet("/users/getAllOrder");
    return response.data as User[];
  }

  static async getTreeUsers() {
    const response = await sendGet("/users/tree");
    return response.data;
  }

  static async getByAuthority(): Promise<User[]> {
    const response = await sendGet("/users/getByAuthority");
    return response.data as User[];
  }

  static async getAllUsersByOrg(orgId: string) {
    const response = await sendGet(`/users/findListUserByOrg/${orgId}`);
    return response.data;
  }

  static async getAllUsersByOrgs(orgId: string, textSearch: string) {
    const response = await sendGet(
      `/users/findListUserByOrgs/${orgId}?textSearch=${textSearch}`
    );
    return response.data;
  }

  static async getAllUsersAddProcess(orgId: string) {
    const response = await sendGet(`/users/findListUserAddProces/${orgId}`);
    return response.data;
  }

  static async changePassword(currentPassword: string, newPassword: string) {
    const response = await sendPost(
      `/users/oauth/password?oPassword=${currentPassword}&nPassword=${newPassword}`,
      {}
    );
    return response.data;
  }

  static async searchUserCalendar(textSearch: string) {
    const response = await sendPost("/users/all-user-in-org-type", {
      textSearch,
    });
    return response.data;
  }

  static async searchUserCalendarPaging(textSearch: string, page: number) {
    const response = await sendPost("/users/all-user-in-org-type-paging", {
      textSearch,
      page,
    });
    return response.data;
  }

  static async resetPassword(ids: string) {
    // Call with encrypt=true first (for logging/audit)
    await sendPost("/users/reset?encrypt=true&ids=" + ids);
    // Then call without encrypt for actual reset
    const response = await sendPost("/users/reset?ids=" + ids);
    return response.data;
  }

  static async getListClerical(
    docType: string,
    name: string,
    orgId: string,
    page: number,
    direction: string,
    sortBy: string,
    size: number
  ) {
    const params = { docType, name, orgId, page, direction, sortBy, size };
    const response = await sendGet("/clerical/getClerical", params);
    return response.data;
  }

  static async getClericalOrg(userId: string) {
    const response = await sendGet(`/clerical/getClericalOrg?userId=${userId}`);
    return response.data;
  }

  static async setClericalPermisson(userId: string, orgIds: string[]) {
    const response = await sendPost(
      `/clerical/addOrg?userId=${userId}`,
      orgIds
    );
    return response.data;
  }

  static async isClerical(docType: string) {
    const response = await sendGet(`/users/isClerical?docType=${docType}`);
    return response.data;
  }

  static async searchByFullnamePosOrg(params: string) {
    const response = await sendGet(
      `/users/findUserByOrgAndPositionAndFullName?${params}`
    );
    return response.data;
  }

  static async searchUserOrgPaging(
    textSearch: string,
    page: number,
    active = false
  ) {
    const response = await sendGet(
      `/users/all-user-in-org-paging?textSearch=${textSearch}&page=${page}&active=${
        active ? "true" : ""
      }`
    );
    return response.data;
  }

  static async searchUserOrgPagingWithNode(
    textSearch: string,
    page: number,
    nodeId: string,
    active = false
  ) {
    const response = await sendGet(
      `/bpmn2/node/${nodeId}/users/page?textSeach=${textSearch}&page=${page}&active=${
        active ? "true" : ""
      }`
    );
    return response.data;
  }

  static async searchUserOrgAll() {
    const response = await sendPost("/users/all-user-in-org?textSearch=", null);
    return response.data;
  }

  static async searchUserNodeAll(nodeId: string) {
    const response = await sendGet(`/bpmn2/node/${nodeId}/users`);
    return response.data;
  }

  static async getAllUsersByOrgWithAuthority(orgId: string, authority: string) {
    const response = await sendGet("/users/findUserByOrgWithAuthority", {
      orgId,
      authority,
    });
    return response.data;
  }

  static async getUserOrgAndSubOrgWithAuthority(
    orgId: string,
    authority: string
  ) {
    const response = await sendGet(
      `/users/findUserByOrgAndChildWithAuthority?orgId=${orgId}&authority=${authority}`
    );
    return response.data;
  }

  static async getUserOrgAndSubOrgWithNode(nodeId: string) {
    const response = await sendGet(`/bpmn2/node/${nodeId}/users`);
    return response.data;
  }

  static async searFullName(fullName: string) {
    const response = await sendGet(`/users/search-name?q=${fullName}`);
    return response.data;
  }

  static async getUserIdByFullNames(fullNames: string[]) {
    if (!fullNames || fullNames.length === 0) return;
    const response = await sendGetMultiple("/users/getUserIdByFullNames", {
      fullNames: fullNames.map((n) => n.trim()),
    });
    return response.data;
  }

  static async getUserIdCerByOrgAndGroup(request: RequestCerOrgAndGroup) {
    const response = await sendPost(
      "/users/getListUserCerByGroupAndOrg",
      request
    );
    return response.data;
  }

  static async getSecretarys() {
    const response = await sendGet("/role/users/secretary/list");
    return response.data;
  }

  static async forgetPassword(email: string) {
    const response = await sendGet(`/users/forget-password?email=${email}`);
    return response.data;
  }

  static async refreshToken(rememberPassword: boolean = true) {
    const response = await sendGet(
      `/users/refresh-token?rememberPassword=${rememberPassword}`
    );
    return response.data;
  }

  static async getSignerReport(position: string, page: number, size: number) {
    const response = await sendPost(
      `/report/findUser?position=${position}&page=${page}&size=${size}`,
      {}
    );
    return response.data;
  }

  static async searchByFullnamePosOrgUsingGroupUser(
    params: string,
    listOrg: any[]
  ) {
    const response = await sendPost(
      `/users/findUserByOrgAndPositionUsingGroupUser?${params}`,
      { listUser: listOrg }
    );
    return response.data;
  }

  static async getCheckUserLinkIAM() {
    const response = await sendGet("/users/check-map-iam");
    return response.data;
  }

  static async mapUserIAM(userName: string, clientIAM: string, userId: string) {
    const response = await sendPost("/users/mapUserIAM", {
      userName,
      clientIAM,
      userId,
    });
    return response.data;
  }

  static async getLeadershipByOrgId(orgId: string) {
    const response = await sendGet(`/users/findLeadership?orgId=${orgId}`);
    return response.data;
  }

  static async getClericalByOrgId(orgId: string) {
    const response = await sendGet(
      `/clerical/getClericalByOrgId?orgId=${orgId}`
    );
    return response.data;
  }

  static async doTaskGetListJobAssigner() {
    const response = await sendGet("/watcher-management/active-watchers/true");
    return response.data;
  }

  static async doGetListListTaskAssignerByOrgId(orgId: string) {
    const response = await sendGet(
      `/users/getListUserAssignTask?orgId=${orgId}`
    );
    return response.data;
  }

  static async doTaskGetListUserFollow() {
    const response = await sendGet("/watcher-management/active-watchers/false");
    return response.data;
  }

  static async doTaskGetListUserFollowingTask(taskId: string) {
    const response = await sendGet(`/task/findUserFollower/${taskId}`);
    return response.data;
  }

  static async doTaskGetListLeaderAssigningTask(taskId: string) {
    const response = await sendGet(`/task/findUserAssigner/${taskId}`);
    return response.data;
  }

  static async doLoadUserByOrgId(orgId: string) {
    const response = await sendGet(`/users/get-list-user/${orgId}`);
    return response.data;
  }
  static async getUserSharedFile(fileNames: string): Promise<number[]> {
    const param = `fileNames=${encodeURIComponent(fileNames)}`;
    const res = await sendGet(`/common/user/shared-file?${param}`);
    return (res?.data ?? []) as number[];
  }

  static async getUserLeadOrgBanTransfer(): Promise<any> {
    const res = await sendGet(`/common/user/lead`);
    return res.data;
  }

  static async getAllUsersByOrgList(orgId: any) {
    const response = await sendPost(
      `/users/findListUserByOrg-v2?ids=${orgId}`,
      null
    );
    return response.data;
  }

  static async getInfoUsers(listUserId: string): Promise<any> {
    const response = await sendGet(`/users/get-info?ids=${listUserId}`);
    return response.data;
  }

  static async doTaskGetListUserFollowingTaskV2(taskId: string) {
    const response = await sendGet(`/task2/findUserFollower/${taskId}`);
    return response.data;
  }

  static async doTaskGetListLeaderAssigningTaskV2(taskId: string) {
    const response = await sendGet(`/task2/findUserAssigner/${taskId}`);
    return response.data;
  }
}
