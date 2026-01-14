export interface OutsideAgency {
  id: number;
  code: string;
  name: string;
}
export interface OutsideAgencyResponse {
  content: OutsideAgency[];
  totalElements: number;
  totalPages: number;
}
