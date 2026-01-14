import { sendGet, sendPost, sendPostBlob, sendPut } from "@/api";
import { protectedAxiosInstance } from "@/api/axiosInstances";
import { Constant } from "@/definitions/constants/constant";
import {
  AddAttachmentParams,
  SearchTask,
  SearchTaskDocument,
  MeetingCalendarDto,
} from "@/definitions/types/calendar.type";

export class CalendarService {
  static async doDeleteAttachment(attachmentId: number) {
    const response = await sendPost(
      `/attachment_calendar/deleteById/` + attachmentId,
      {}
    );
    return response.data;
  }

  static async doDeleteAttachmentMeeting(calId: number, meetingId: number) {
    const response = await sendPost(
      `${Constant.CALENDAR.MEETING_DELETE + calId}/${meetingId}`,
      {}
    );
    return response.data;
  }

  static async getSearchTask(task: SearchTask, page: number) {
    const response = await sendPost(`/task/list/all/${page}`, task);
    return response.data;
  }

  static async getSearchDocIn(docIn: SearchTaskDocument, page: number) {
    const response = await sendPost(
      `${Constant.TASK_NEW.SEARCH_DOC_IN}` + page,
      docIn
    );
    return response.data;
  }

  static async getSearchDocOut(docOut: SearchTaskDocument, page: number) {
    const response = await sendPost(
      `${Constant.TASK_NEW.SEARCH_DOC_OUT}` + page,
      docOut
    );
    return response.data;
  }

  static async getPlaceSendCategory(categoryCode: string) {
    const response = await sendGet(
      `${Constant.CATEGORY.GET_BY_CATEGORY_TYPE_CODE}` + categoryCode
    );
    return response.data;
  }

  static async searchFullName(fullName: string) {
    const response = await sendGet(`/users/search-name?q=${fullName}`);
    return response.data;
  }

  static async searchOrgByName(orgName: string) {
    const response = await sendGet(`/org/search-org?q=${orgName}`);
    return response.data;
  }

  static async searchGroupByName(groupName: string) {
    const response = await sendGet(`group/search-group?q=${groupName}`);
    return response.data;
  }

  static async createCalendar(orgType: number, calendarData: any) {
    const response = await sendPost(
      `${Constant.CALENDAR.ADD_BUSINESS}` + orgType,
      calendarData
    );
    return response.data;
  }

  static async getCalendarBusiness(
    orgType: number,
    month: number,
    year: number
  ) {
    const response = await sendGet(
      `${Constant.CALENDAR.GET_CALENDAR_BUSINESS}` +
        orgType +
        "?month=" +
        month +
        "&year=" +
        year
    );
    return response.data;
  }

  static async getCalendarBusinessByWeek(
    orgType: number,
    week: number,
    year: number
  ) {
    const response = await sendGet(
      `${Constant.CALENDAR.GET_CALENDAR_BY_WEEK}` +
        orgType +
        "?week=" +
        week +
        "&year=" +
        year
    );
    return response.data;
  }

  static async getCalendarBusinessById(id: number) {
    const response = await sendGet(
      `${Constant.CALENDAR.GET_CALENDAR_BY_ID}` + id
    );
    return response.data;
  }

  static async updateCalendar(id: number, calendarData: any) {
    const response = await sendPost(
      `${Constant.CALENDAR.UPDATE_CALENDAR + id}`,
      calendarData
    );
    return response.data;
  }

  static async updateCalendarStatus(calId: number, body: any) {
    const response = await sendPost(
      `${Constant.CALENDAR.UPDATE_STATUS}/${calId}`,
      body
    );
    return response.data;
  }

  static async deleteCalendarMeeting(id: number) {
    const response = await sendPost(
      `${Constant.CALENDAR.MEETING_REMOVE}` + id,
      {}
    );
    return response.data;
  }

  static async deleteCalendar(id: number) {
    const response = await sendPost(
      `${Constant.CALENDAR.DELETE_CALENDAR}` + id,
      {}
    );
    return response.data;
  }

  static async addAttachment(params: AddAttachmentParams) {
    const formData = new FormData();

    params.files.forEach((file) => {
      formData.append("files", file);
    });

    formData.append("week", params.week.toString());
    formData.append("year", params.year.toString());

    const response = await sendPost(
      `/attachment_calendar/addAttachment/${params.id}/${params.type}`,
      formData
    );
    return response.data;
  }

  static async fileMeetingDownload(name: string) {
    const response = await sendGet(
      `${Constant.CALENDAR.MEETING_DOWNLOAD}` + encodeURIComponent(name),
      { responseType: "blob" }
    );
    return response.data;
  }

  static async getMeetingById(id: number) {
    const response = await sendGet(`${Constant.CALENDAR.MEETING_DETAIL}` + id);
    return response.data;
  }

  static async getCalendarHistory(id: number) {
    const response = await sendGet(`/calendar_history/getByCalendarId/${id}`);
    return response.data;
  }

  static async exportCalendar(body: any) {
    const response = await sendPostBlob(
      `${Constant.CALENDAR.EXPORT_CALENDAR}`,
      body
    );
    return response;
  }

  static async exportCalendarExcel(body: any) {
    const response = await sendPostBlob(
      `${Constant.CALENDAR.EXPORT_EXCEL_CALENDAR}`,
      body
    );
    return response;
  }

  static async addAttachmentMeeting(id: number, files: File[]) {
    const formData: FormData = new FormData();
    files = files || [];
    for (const file of files) {
      formData.append("files", file);
    }
    const response = await sendPost(
      `${Constant.CALENDAR.MEETING_UPLOAD}${id}`,
      formData
    );
    return response.data;
  }

  static async updateMeeting(calendar: any) {
    const meetingCalendarDto: MeetingCalendarDto = {
      id: calendar.id,
      title: calendar.title,
      description: calendar.description,
      isScheduleAFile: calendar.isScheduleAFile,
      note: calendar.note,
      startTime: calendar.startTime,
      endTime: calendar.endTime,
      dInList: calendar.dInList,
      dOutList: calendar.dOutList,
      isCabinet: calendar.isCabinet,
      participants: calendar.participants,
      participantsOrg: calendar.participantsOrg,
      participantsGroup: calendar.participantsGroup,
      attachments: calendar.attachments,
    };

    const response = await sendPost(
      `${Constant.CALENDAR.MEETING_UPDATE}${meetingCalendarDto.id}`,
      meetingCalendarDto
    );
    return response.data;
  }

  static async addRoom(body: any) {
    const res = await sendPost(`/meeting-room/addRoom`, body);
    return res.data;
  }

  static async listOrgRoom(param: any) {
    const res = await sendGet(`/meetingRoomAddress/getList?${param}`);
    return res.data;
  }

  static async exportRoomFile(type: "excel" | "csv") {
    const res = await sendGet(
      `${Constant.CALENDAR.EXPORT_ROOM}?type=${type}`,
      undefined,
      { responseType: "blob" as "json" }
    );
    return res;
  }

  static async importRoomFile(formData: FormData) {
    const res = await sendPost(`${Constant.CALENDAR.MEETING_ROOM}`, formData);
    return res.data;
  }

  static async getRoomListMeetingCalendar(param: any) {
    const res = await sendGet(`/meeting-room/getRoomPage?${param}`);
    return res.data;
  }

  static async delRoom(id: number) {
    const res = await sendPost(`/meeting-room/delRoom/${id}`, {});
    return res.data;
  }

  static async importOrgFile(formData: FormData) {
    const res = await sendPost(`${Constant.CALENDAR.MEETING_ROOM}`, formData);
    return res.data;
  }

  static async exportOrgFile(type: "excel" | "csv") {
    const res = await sendGet(
      `${Constant.CALENDAR.EXPORT_ORG}?type=${type}`,
      undefined,
      { responseType: "blob" as "json" }
    );
    return res;
  }

  static async addOrg(body: any) {
    const res = await sendPost(`/meetingRoomAddress/addAddress`, body);
    return res.data;
  }

  static async updateOrg(id: number, body: any) {
    const res = await sendPost(`/meetingRoomAddress/updateAddress/${id}`, body);
    return res.data;
  }

  static async delOrg(id: number) {
    const res = await sendGet(`/meetingRoomAddress/delAddress/${id}`);
    return res.data;
  }

  static async getOrgListCalendar(param: any) {
    const res = await sendGet(`/meetingRoomAddress/getPage?${param}`);
    return res.data;
  }
}
