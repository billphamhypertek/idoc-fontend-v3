export class RequestCerOrgAndGroup {
  participantsGroup = [];

  participantsOrg = [];

  userIds = [];
}
export interface NgbDate {
  year: number | null;
  month: number | null;
  day: number | null;
}
export interface User {
  id: number;
  photo: string;
  clientId: number;
  userName: string;
  fullName: string;
  indentity: number;
  birthday: string;
  birthdayTmp?: NgbDate | null;
  phone: number;
  email: string;
  sex: boolean;
  gender: number;
  active: boolean;
  org: number;
  position: number;
  lead: boolean;
  phoneCA: string;
  phoneCAProvider: string;
  signature: string;
  positionModel?: any;
  address: string;
  serialToken: string;
  startTimeToken: string;
  expiredTimeToken: string;
  nameToken: string;
  orgToken: string;
  ldap: boolean;
  authoritys: any[];
  cert: string;
  cecretarys: any[];
  additionalPositions?: any[];
  orgParent: string;
}
