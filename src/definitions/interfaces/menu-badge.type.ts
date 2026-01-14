// ---- Task
export interface TaskBadge {
  TASK_MAIN: number;
  TASK_SUPPORT: number;
  TASK_ASSIGN: number;
  WORD_EDITOR: number;
  ALL: number;
}

// ---- Văn bản đến
export interface DocumentInBadge {
  DOC_IN_MAIN: number;
  DOC_IN_SUPPORT: number;
  DOC_IN_KNOW: number;
  DOC_IN_OPINION: number;
  DOC_IN_DIRECTION: number;
  DOC_IN_WAIT_RECEIVE: number;
  DOC_IN_INTERNAL: number;
  ALL: number;
}

// ---- Văn bản đi
export interface DocumentOutBadge {
  DRAFT_LIST: number;
  DRAFT_HANDLE: number;
  DRAFT_ISSUED: number;
  DOCUMENT_IN_LIST: number;
  ALL: number;
}

// ---- Văn bản nội bộ
export interface DocInternalBadge {
  DOC_INTERNAL_REGISTER: number;
  DOC_INTERNAL_WAITING: number;
  DOC_INTERNAL_DOING: number;
  DOC_INTERNAL_RETURN: number;
  DOC_INTERNAL_PUBLISH: number;
  DOC_INTERNAL_PENDING: number;
  DOC_INTERNAL_APPROVE: number;
  ALL: number;
}

// ---- Ủy quyền
export interface DelegateBadge {
  DOC_OUT_DELEGATE: number;
  DOC_IN_DELEGATE: number;
  ALL: number;
}

// ---- Hồ sơ tài liệu
export interface RecordsBadge {
  HSTL_CONGVIEC: number;
  HSTL_CANHAN: number;
  HSTL_PHONGBAN: number;
  HSTL_COQUAN: number;
  ALL: number;
}

// ---- Quản lý xe
export interface VehicleBadge {
  VEHICLE_SLOT: number;
  VEHICLE_MAIN: number;
  ALL: number;
}

// ---- Snapshot tổng hợp cho UI
export interface MenuBadgeSnapshot {
  docIn: DocumentInBadge;
  docOut: DocumentOutBadge;
  internal: DocInternalBadge;
  task: TaskBadge;
  delegate: DelegateBadge;
  records: RecordsBadge;
  vehicle: VehicleBadge;
}

// ---- Tổng số ở cấp cha
export interface MenuBadgeParentTotals {
  DOCUMENT_IN: number;
  DOCUMENT_OUT: number;
  DOC_INTERNAL: number;
  TASK: number;
  DELEGATE: number;
  HSTL: number;
  VEHICLE: number;
  ALL: number;
}

// ---- Kết quả hook
export interface MenuBadgesResult {
  snapshot: MenuBadgeSnapshot;
  parent: MenuBadgeParentTotals;
}
