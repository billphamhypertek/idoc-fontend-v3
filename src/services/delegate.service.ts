import { sendGet, sendPost } from "@/api";
import { Constant } from "@/definitions/constants/constant";
import { TabNames } from "@/definitions/enums/delegate.enum";
import {
  Delegate,
  DelegateListResponse,
  DelegateSearchParams,
  DelegateUser,
} from "@/definitions/types/delegate.type";
import { arrayToFormData } from "@/utils/common.utils";

export class DelegateService {
  /**
   * Get delegate list with pagination
   */
  static async getDelegateList(
    params: DelegateSearchParams
  ): Promise<DelegateListResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });

    const response = await sendGet(`/delegate/list?${searchParams.toString()}`);
    return response.data as DelegateListResponse;
  }

  /**
   * Quick search delegate
   */
  static async searchBasicDelegate(
    params: DelegateSearchParams
  ): Promise<DelegateListResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });

    const response = await sendGet(
      `/delegate/quick-search?${searchParams.toString()}`
    );
    return response.data as DelegateListResponse;
  }

  /**
   * Advanced search delegate
   */
  static async searchAdvanceDelegate(
    params: DelegateSearchParams
  ): Promise<DelegateListResponse> {
    const searchParams = new URLSearchParams();
    Object.entries(params || {}).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });

    const response = await sendGet(
      `/delegate/search?${searchParams.toString()}`
    );
    return response.data as DelegateListResponse;
  }

  /**
   * Add new delegate
   */
  static async addDelegate(formData: FormData): Promise<Delegate> {
    const response = await sendPost("/delegate/add", formData);
    return response.data as Delegate;
  }

  /**
   * Update delegate
   */
  static async updateDelegate(formData: FormData): Promise<Delegate> {
    const response = await sendPost("/delegate/update", formData);
    return response.data as Delegate;
  }

  /**
   * Active/Deactive delegate
   */
  static async activeAndDeactive(id: number): Promise<Delegate> {
    const response = await sendGet(`/delegate/activeAndDeactive?id=${id}`);
    return response.data as Delegate;
  }

  /**
   * Get list of users who can delegate (from users)
   */
  static async getDelegateFromUserList(): Promise<DelegateUser[]> {
    const response = await sendGet("/users/getListNguoiUyQuyen");
    return response.data as DelegateUser[];
  }

  /**
   * Get list of users who can receive delegation (to users) based on fromUserId
   */
  static async getDelegateToUserList(
    fromUserId: number
  ): Promise<DelegateUser[]> {
    const response = await sendGet(`/users/findListDelegateUser/${fromUserId}`);
    return response.data as DelegateUser[];
  }

  /**
   * Get list of users for Van Thu Ban role
   */
  static async getListNguoiUyQuyenVanThuBan(): Promise<DelegateUser[]> {
    const response = await sendGet("/users/getListNguoiUyQuyenVanThuBan");
    return response.data as DelegateUser[];
  }

  static async getDocumentByHandleTypeAndStatus(
    handleType: number,
    status: number,
    params = {}
  ): Promise<any> {
    const response = await sendGet(
      `/document/getListDelegatedDocs/${handleType}/${status}`,
      params
    );
    return response;
  }

  static async docInReject(
    documentId: string,
    rejectComment: string,
    files?: File[]
  ): Promise<any> {
    const formData = new FormData();
    if (files && files.length > 0) {
      files.forEach((file) => {
        formData.append("files", file);
      });
    }

    formData.append("comment", rejectComment);

    const response = await sendPost(
      `${Constant.DELEGATE.IN_REJECT}${documentId}`,
      formData
    );
    return response;
  }

  static async docInTransfer(
    docList: string,
    transferComment: string,
    main: string[],
    supports: string[],
    shows: string[],
    orgMain: string[],
    orgSupport: string[],
    orgShow: string[],
    node: number,
    files?: File[],
    deadline?: string
  ): Promise<any> {
    const formData = new FormData();

    if (files && files.length > 0) {
      for (const file of files) {
        formData.append("files", file);
      }
    }

    formData.append("comment", transferComment);
    formData.append("node", node.toString());

    // Add main array
    main = main || [];
    for (const element of main) {
      formData.append("main", element);
    }

    // Add supports array
    supports = supports || [];
    for (const support of supports) {
      formData.append("support", support);
    }

    // Add shows array
    shows = shows || [];
    for (const show of shows) {
      formData.append("show", show);
    }

    // Add orgMain array
    orgMain = orgMain || [];
    for (const element of orgMain) {
      formData.append("org_main", element);
    }

    // Add orgSupport array
    orgSupport = orgSupport || [];
    for (const element of orgSupport) {
      formData.append("org_support", element);
    }

    // Add orgShow array
    orgShow = orgShow || [];
    for (const element of orgShow) {
      formData.append("org_show", element);
    }

    formData.append("deadline", deadline || "");

    const response = await sendPost(
      `${Constant.DELEGATE.IN_TRANSFER}${docList}`,
      formData
    );
    return response;
  }

  static async docInTransferOrg(
    docList: string,
    transferComment: string,
    main: string[],
    node: number,
    files?: File[],
    deadline?: string,
    isDelegate: boolean = false,
    special: boolean = false
  ): Promise<any> {
    let formData = new FormData();

    formData.append("docIds", docList);

    if (files && files.length > 0) {
      for (const file of files) {
        formData.append("files", file);
      }
    }

    formData.append("comment", transferComment);
    formData.append("node", node.toString());

    // Use arrayToFormData utility for main array
    formData = arrayToFormData(formData, "listOrg", main);

    formData.append("deadline", deadline || "");
    formData.append("isDelegate", isDelegate.toString());
    formData.append("special", special.toString());

    console.log("formdata", formData);

    const response = await sendPost(
      Constant.DELEGATE.IN_TRANSFER_ORG,
      formData
    );
    return response;
  }

  static async docInTransferDone(
    documentId: string,
    doneComment: string,
    files: File[],
    tab: string = "",
    isFinishReceive: boolean = false
  ): Promise<any> {
    const formData = new FormData();

    if (files && files.length > 0) {
      for (const file of files) {
        formData.append("files", file);
      }
    }

    formData.append("comment", doneComment);
    formData.append("special", isFinishReceive.toString());

    const url = tab
      ? `${Constant.DELEGATE.IN_TRANSFER_DONE + documentId}?tab=${tab}`
      : Constant.DELEGATE.IN_TRANSFER_DONE + documentId;
    const response = await sendPost(url, formData);
    return response;
  }

  static async getOutDraftList(tab: string): Promise<any> {
    let api = "";
    if (tab === TabNames.CHOXULY) {
      api = "/delegate/handling";
    } else if (tab === TabNames.DAXULY) {
      api = "/doc_out_process/handling/delegate-handled";
    }
    const res = await sendGet(api);
    return (res as any)?.data ?? res;
  }

  static async searchBasicOutDraft(
    tab: string,
    params: Record<string, any>
  ): Promise<any> {
    let api = "";
    if (tab === TabNames.CHOXULY) {
      api = "/delegate/handling/search";
    } else if (tab === TabNames.DAXULY) {
      api = "/doc_out_process/handling/delegate-handled/search";
    }
    const res = await sendGet(api, params);
    return (res as any)?.data ?? res;
  }

  static async searchAdvancedOutDraft(
    tab: string,
    params: Record<string, any>
  ): Promise<any> {
    let api = "";
    if (tab === TabNames.CHOXULY) {
      api = "/delegate/handling/search-advance";
    } else if (tab === TabNames.DAXULY) {
      api = "/doc_out_process/handling/delegate-handled/search-advance";
    }
    const res = await sendGet(api, params);
    return (res as any)?.data ?? res;
  }
}
