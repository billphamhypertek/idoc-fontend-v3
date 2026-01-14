import { sendGet, sendPost } from "@/api/base-axios-protected-request";

export interface FieldShowListDto {
  name: string;
  label: string;
}

export interface ValueDynamicListValue {
  totalPage: number;
  totalRecord: number;
  objList: any[];
}

export interface ValueDynamicSearchResponse {
  resultCode: string;
  message: string;
  responseTime: number;
  data: {
    fieldShowListDtoList: FieldShowListDto[];
    listValue: ValueDynamicListValue;
  };
}

export interface ValueDynamicSearchParams {
  page: number;
  size: number;
  formId: number;
  handleType?: string;
  handleStatus?: string;
  search?: string;
  moduleId?: number;
}

export interface ValueDynamicDetailResponse {
  resultCode: string;
  message: string;
  responseTime: number;
  data: any;
}

export interface DeleteByIdResponse {
  resultCode: string;
  message: string;
  responseTime: number;
  data: any;
}

export interface ValueDynamicTransferParams {
  // Define specific fields if known; using any for generality
  [key: string]: any;
}

export interface TrackingItem {
  userName: string;
  action: string;
  date: number;
  note?: string;
}

export interface TrackingResponse {
  resultCode: string;
  message: string;
  responseTime: number;
  data: {
    content: TrackingItem[];
    totalElements: number;
    totalPages: number;
    pageable: {
      pageNumber: number;
      pageSize: number;
    };
    number: number;
    size: number;
    first: boolean;
    last: boolean;
    numberOfElements: number;
    empty: boolean;
  };
}

class ValueDynamicService {
  /**
   * Search value-dynamic data
   */
  searchValueDynamic(params: ValueDynamicSearchParams) {
    return sendGet("/value-dynamic/search", params);
  }

  /**
   * Search value-dynamic data (full version for search page)
   */
  searchValueDynamicFull(params: ValueDynamicSearchParams, body: any = {}) {
    return sendPost("/value-dynamic/search-full", body, params);
  }

  /**
   * Delete value-dynamic by IDs
   */
  deleteValueDynamicByIds(ids: number[]) {
    return sendPost("/value-dynamic/deleteById", ids);
  }

  /**
   * Get value-dynamic detail by ID
   */
  getValueDynamicDetail(id: number) {
    return sendGet(`/value-dynamic/detail/${id}`);
  }

  /**
   * Done value-dynamic by valueId
   */
  doneValueDynamic(valueId: number) {
    return sendPost(`/value-dynamic/done/${valueId}`, {});
  }

  /**
   * Recall value-dynamic by valueId
   */
  recallValueDynamic(valueId: number) {
    return sendPost(`/value-dynamic/recall/${valueId}`, {});
  }

  /**
   * Reject value-dynamic by valueId with reason
   */
  rejectValueDynamic(valueId: number, reason?: string) {
    return sendPost(`/value-dynamic/reject/${valueId}`, { reason });
  }

  /**
   * Calendar review value-dynamic by valueId
   */
  calendarReviewValueDynamic(valueId: number) {
    return sendGet(`/value-dynamic/calendar-review/${valueId}`);
  }

  /**
   * Transfer value-dynamic
   */
  transferValueDynamic(params: ValueDynamicTransferParams) {
    return sendPost("/value-dynamic/transfer", params);
  }
  createValueDynamic(formId: number, formData: FormData) {
    return sendPost(`/value-dynamic/create/${formId}`, formData);
  }
  updateValueDynamic(id: number, formId: number, data: Record<string, any>) {
    return sendPost(`/value-dynamic/update/${id}/${formId}`, data);
  }

  /**
   * Get tracking for value-dynamic by ID
   */
  getTracking(id: number, page: number, size: number) {
    return sendGet(`/value-dynamic/tracking/${id}`, { page, size });
  }
  getListCalendar(formId: number, week: number, year: number) {
    return sendGet(`/value-dynamic/getCalendar/${formId}/${week}/${year}`);
  }
}
const valueDynamicService = new ValueDynamicService();
export default valueDynamicService;
