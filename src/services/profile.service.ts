import { sendGet, sendPost } from "@/api";

export interface ProfileUpdateRequest {
  id: number;
  fullName: string;
  userName: string;
  birthday?: string;
  gender: number;
  indentity?: string;
  phone: string;
  email: string;
  phoneCA?: string;
  phoneCAProvider?: string;
  address?: string;
  photo?: string;
  signature?: string;
  org: number;
  position: number;
  cert?: string;
}

export interface ProfileResponse {
  id: number;
  active: boolean;
  clientId: number;
  fullName: string;
  userName: string;
  birthday?: string;
  email: string;
  phone: string;
  gender: number;
  indentity?: string;
  title?: string;
  photo?: string;
  signature: string;
  phoneCA?: string;
  phoneCAProvider: string;
  serialToken: string;
  startTimeToken: string;
  expiredTimeToken: string;
  nameToken: string;
  orgToken: string;
  employeeId?: string;
  employeeCode?: string;
  expiryPass?: string;
  roles?: any[];
  authorize?: any[];
  org: number;
  position: number;
  additionalPositions?: any[];
  orgModel: any;
  positionModel: any;
  lead: boolean;
  defaultRole: number;
  currentRole: number;
  address?: string;
  authoritys: any[];
  cecretarys: any[];
  orgParent?: any;
  cert: string;
  rememberPassword: boolean;
  forgetPassword?: any;
  global?: boolean;
  ldap: boolean;
}

export class ProfileService {
  /** ========== Kiểm tra token ========== */
  static async checkToken(
    userId: number,
    encrypt: boolean = false
  ): Promise<any> {
    const url = encrypt
      ? `/users/checkToken/${userId}?encrypt=true`
      : `/users/checkToken/${userId}`;
    const res = await sendPost(url, {});
    return res.data;
  }

  /** ========== Kiểm tra chứng thư số ========== */
  static async checkCert(userId: number): Promise<any> {
    const res = await sendPost(`/users/checkCert/${userId}`, {});
    return res.data;
  }

  /** ========== Cập nhật thông tin user ========== */
  static async updateUser(
    userId: number,
    profileData: ProfileUpdateRequest,
    encrypt: boolean = false
  ): Promise<ProfileResponse> {
    const url = encrypt
      ? `/users/update/${userId}?encrypt=true`
      : `/users/update/${userId}`;
    const res = await sendPost(url, profileData);
    return res.data as ProfileResponse;
  }

  /** ========== Kiểm tra map IAM ========== */
  static async checkMapIam(): Promise<any> {
    const res = await sendGet("/users/check-map-iam");
    return res.data;
  }
}
