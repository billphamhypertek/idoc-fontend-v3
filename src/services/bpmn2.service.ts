import { sendGet } from "@/api";
import { User } from "@/definitions/interfaces/vehicle.interface";
import { BpmnResponse } from "@/definitions/types/bpmn.type";

export class Bpmn2Service {
  // Thêm 3 biến static vào đây
  static currentSelectedNodeID: any = null;
  static currentNodeOrg: any[] = [];
  static currentNodeUser: any[] = [];

  static async getStartNode(
    type: any,
    single: boolean = false
  ): Promise<BpmnResponse[]> {
    const response = await sendGet(
      `/bpmn2/start-node/${type}?single=${single}`
    );
    return response.data;
  }

  static async getNextNodes(currentNode: number): Promise<BpmnResponse[]> {
    const response = await sendGet(`/bpmn2/next-node/${currentNode}`);
    return response.data;
  }

  static async getUsersByNode(nodeId: number): Promise<User[]> {
    const response = await sendGet(`/bpmn2/node/${nodeId}/users`);
    return response.data;
  }

  static async getNextConsultNodes(): Promise<BpmnResponse[]> {
    const response = await sendGet(`/bpmn2/getNextNodeConsult`);
    return response.data;
  }
}
