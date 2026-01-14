import { sendGet, sendPost } from "@/api";
import { Constant } from "@/definitions/constants/constant";
import type {
  DocAttachment,
  Draft,
  DraftResponse,
  DocSignRepsonse,
} from "@/definitions/types/document.type";

export class OutsideSystemService {
  static async getOutTrackingSystem(docId: string, page: number): Promise<any> {
    const res = await sendGet(
      `/document_out/lgspTracking/${docId}?page=${page}`
    );
    return res as any;
  }
}
export default OutsideSystemService;
