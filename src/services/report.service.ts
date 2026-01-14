import { sendGet, sendPost, sendPostBlob } from "@/api";
import { Constant } from "@/definitions/constants/constant";
import { DailyReportDataInit } from "@/definitions/types/report.type";

export class ReportService {
  static async searchUnconfirmedReport(body: any, page: number) {
    const response = await sendPost(
      `${Constant.DAILY_REPORT.UNCONFIRMED_REPORT + "/" + page}`,
      body
    );
    return response.data;
  }

  static async searchVerifiedReport(body: any, page: number) {
    const response = await sendPost(
      `${Constant.DAILY_REPORT.VERIFIED_REPORT + "/" + page}`,
      body
    );
    return response.data;
  }

  static async searchTitleList() {
    const response = await sendGet(Constant.DAILY_REPORT.TITLE_LIST);
    return response.data;
  }

  static async searchSignerList(params: any) {
    const response = await sendGet(
      Constant.DAILY_REPORT.LIST_OF_SIGNER,
      params
    );
    return response.data;
  }

  static async searchReport(
    reportType: any,
    organization: any,
    year: any,
    type: any
  ) {
    const response = await sendGet(Constant.DAILY_REPORT.ADD_REPORT, {
      reportType,
      organization,
      year,
      type,
    });
    return response.data;
  }

  static async addReport(report: DailyReportDataInit) {
    const response = await sendPost(
      `${Constant.DAILY_REPORT.ADD_REPORT}`,
      report
    );
    return response.data;
  }

  static async updateReport(report: DailyReportDataInit, id: number) {
    const response = await sendPost(
      `${Constant.DAILY_REPORT.UPDATE_REPORT + "/" + id}`,
      report
    );
    return response.data;
  }

  static async addAttachment(files: File[], id: number) {
    const formData = new FormData();
    if (files.length > 0) {
      files.forEach((file) => {
        formData.append("files", file);
      });
    }
    const response = await sendPost(
      `${Constant.DAILY_REPORT.ADD_ATTACHMENT_REPORT + "/" + id}`,
      formData
    );
    return response.data;
  }

  static async getReport(id: number) {
    const response = await sendGet(
      `${Constant.DAILY_REPORT.GET_REPORT + "/" + id}`
    );
    return response.data;
  }

  static async approveReport(id: number) {
    const response = await sendGet(
      `${Constant.DAILY_REPORT.APPROVE_REPORT + "/" + id + "/2"}`
    );
    return response.data;
  }

  static async deleteReport(id: number) {
    const response = await sendGet(
      `${Constant.DAILY_REPORT.DELETE_REPORT + "/" + id}`
    );
    return response.data;
  }

  static async rejectReport(id: number) {
    const response = await sendGet(
      `${Constant.DAILY_REPORT.APPROVE_REPORT + "/" + id + "/1"}`
    );
    return response.data;
  }

  static async deleteFileReport(fileName: string) {
    const response = await sendGet(
      `${Constant.DAILY_REPORT.DELETE_FILE_REPORT + "/" + fileName}`
    );
    return response.data;
  }

  static async exportFileReport(id: number) {
    const response = await sendPostBlob(
      Constant.DAILY_REPORT.EXPORT_FILE_REPORT + "?id=" + id,
      {}
    );
    return response;
  }

  static async exportFileReportAll(body: any) {
    const response = await sendPostBlob(
      Constant.DAILY_REPORT.EXPORT_FILE_REPORT_ALL,
      body
    );
    return response;
  }
}
