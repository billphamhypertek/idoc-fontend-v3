import { sendGet, sendPost } from "@/api/base-axios-protected-request";

export interface FormNodeStartResponse {
  resultCode: string;
  message: string;
  responseTime: number;
  data: any;
}

export interface NextStartNodeResponse {
  resultCode: string;
  message: string;
  responseTime: number;
  data: any;
}
class WorkflowService {
  /**
   * Get form node start by form type
   */
  getFormNodeStart(formType: string) {
    return sendGet(`/workflow/getFormNodeStart/${formType}`);
  }

  /**
   * Get next start node by form type
   */
  getStartNode(formType: string, formId?: string) {
    //nodeId = null
    return sendGet(`/workflow/start-node/${formType}/${formId}`);
  }
  getNextNode(nodeId: number) {
    return sendGet(`/workflow/next-node/${nodeId}`);
  }

  /**
   * Get node user by nodeId
   */
  getNodeUser(nodeId: number) {
    return sendGet(`/workflow/node/${nodeId}/users`);
  }
  transferNode(payload: any) {
    return sendPost(`/value-dynamic/transfer`, payload);
  }
}
const workflowService = new WorkflowService();
export default workflowService;
