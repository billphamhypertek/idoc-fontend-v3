import { sendGet, sendPatch, sendPost, sendPostFormUrlEncoded } from "@/api";
import {
  AssignedTasksResponse,
  CalendarEvent,
  DocumentDashboardResponse,
  DocumentStats,
  TaskToProcess,
} from "@/definitions/types/personalStatus.type";

export class PersonalStatusService {
  // 1. Lịch công tác - /api/calendar2/getByDate/{orgType}
  static async getSchedule(
    date: string,
    orgType: number = 1
  ): Promise<CalendarEvent[]> {
    try {
      const response = await sendGet(`/calendar2/getByDate/${orgType}`, {
        date,
      });
      return response.data as CalendarEvent[];
    } catch (error) {
      console.error("Error fetching schedule:", error);
      return [] as CalendarEvent[];
    }
  }

  // 2. Văn bản đến cần xử lý - /api/document/dashBoard/{type}/{status}
  static async getIncomingDocuments(
    type: number = 0,
    status: number = 1,
    page: number = 1,
    size: number = 10
  ): Promise<DocumentDashboardResponse> {
    try {
      const response = await sendGet(`/document/dashBoard/${type}/${status}`, {
        page,
        size,
      });
      return response.data as DocumentDashboardResponse;
    } catch (error) {
      console.error("Error fetching incoming documents:", error);
      return { documentIn: [], documentOut: [] };
    }
  }

  // 3. Văn bản đi cần xử lý - /api/document /dashBoard/{type}/{status} (Đã sửa URL)
  static async getOutgoingDocuments(
    type: number = 0,
    status: number = 1,
    page: number = 1,
    size: number = 10
  ): Promise<DocumentDashboardResponse> {
    try {
      // Sửa URL từ /document/dashBoard thành /document_out/dashBoard
      const response = await sendGet(`/document/dashBoard/${type}/${status}`, {
        page,
        size,
      });
      return response.data as DocumentDashboardResponse;
    } catch (error) {
      console.error("Error fetching outgoing documents:", error);
      return { documentIn: [], documentOut: [] };
    }
  }

  // 4. Việc đã giao - /api/task/findByUserAssign
  static async getAssignedTasks(
    page: number = 1,
    size: number = 10,
    status: boolean = false
  ): Promise<AssignedTasksResponse> {
    try {
      const response = await sendPost(
        "/task/findByUserAssign",
        {},
        { page, size, status }
      );
      return response.data as AssignedTasksResponse;
    } catch (error) {
      console.error("Error fetching assigned tasks:", error);
      return {
        totalPage: 0,
        totalRecord: 0,
        objList: [],
      };
    }
  }

  // 5. Công việc cần xử lý - /api/task/list/main/notyet
  static async getTasksToProcess(
    page: number = 1,
    size: number = 10
  ): Promise<TaskToProcess> {
    try {
      const response = await sendPostFormUrlEncoded("/task/list/main/notyet", {
        page,
        size,
      });
      return response.data as TaskToProcess;
    } catch (error) {
      console.error("Error fetching tasks to process:", error);
      return {
        content: [],
        pageable: {},
        totalPages: 0,
        totalElements: 0,
        last: true,
        number: 0,
        sort: {},
        size: 10,
        first: true,
        numberOfElements: 0,
        empty: true,
      };
    }
  }

  // 6. Thống kê 3 card
  static async getDocumentStats(): Promise<DocumentStats> {
    try {
      const response = await sendGet("/document/report_doc_by_type");
      return response.data as DocumentStats;
    } catch (error) {
      console.error("Error fetching document stats:", error);
      return {} as DocumentStats;
    }
  }

  static async getOutgoingDocumentStats(): Promise<DocumentStats> {
    try {
      const response = await sendGet("/document_out/report_doc_by_type");
      return response.data as DocumentStats;
    } catch (error) {
      console.error("Error fetching outgoing document stats:", error);
      return {} as DocumentStats;
    }
  }

  static async getTaskStats(): Promise<DocumentStats> {
    try {
      const response = await sendGet("/task/report_doc_by_type");
      return response.data as DocumentStats;
    } catch (error) {
      console.error("Error fetching task stats:", error);
      return {} as DocumentStats;
    }
  }

  static async updateDocument(id: string, status: string): Promise<any> {
    try {
      const response = await sendPost(`/document/update/${id}`, { status });
      return response;
    } catch (error) {
      console.error("Error updating document:", error);
      throw error;
    }
  }

  static async completeTask(id: string, status: string): Promise<any> {
    try {
      const response = await sendPatch(`/tasks/${id}/complete`, { status });
      return response;
    } catch (error) {
      console.error("Error completing task:", error);
      throw error;
    }
  }

  static async assignTask(
    documentId: string,
    assignees: string[]
  ): Promise<any> {
    try {
      const response = await sendPost("/tasks/assign", {
        documentId,
        assignees,
      });
      return response;
    } catch (error) {
      console.error("Error assigning task:", error);
      throw error;
    }
  }
}
