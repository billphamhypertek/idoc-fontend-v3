export type DocInCounts = {
  DOC_IN_MAIN: number;
  DOC_IN_SUPPORT: number;
  DOC_IN_KNOW: number;
  DOC_IN_OPINION: number;
  DOC_IN_DIRECTION: number;
  DOC_IN_WAIT_RECEIVE: number;
  DOC_IN_INTERNAL: number;
  ALL: number;
};

export type DocOutCounts = {
  DRAFT_LIST: number;
  DRAFT_HANDLE: number;
  DRAFT_ISSUED: number;
  DOCUMENT_IN_LIST: number;
  ALL: number;
};

export type DocInternalCounts = {
  DOC_INTERNAL_REGISTER: number;
  DOC_INTERNAL_WAITING: number;
  DOC_INTERNAL_DOING: number;
  DOC_INTERNAL_RETURN: number;
  DOC_INTERNAL_PUBLISH: number;
  DOC_INTERNAL_PENDING: number;
  DOC_INTERNAL_APPROVE: number;
  ALL: number;
};

export type DelegateCounts = {
  DOC_OUT_DELEGATE: number;
  DOC_IN_DELEGATE: number;
  ALL: number;
};

export type RecordsCounts = {
  HSTL_CONGVIEC: number;
  HSTL_CANHAN: number;
  HSTL_PHONGBAN: number;
  HSTL_COQUAN: number;
  ALL: number;
};

export type VehicleCounts = {
  // = VEHICLE_USAGE_PLAN_TICKET
  VEHICLE_SLOT: number;
  // = VEHICLE_USAGE_PLAN_HANDLE
  VEHICLE_MAIN: number;
  ALL: number;
};

export type MenuBadgeSnapshot = {
  docIn: DocInCounts;
  docOut: DocOutCounts;
  internal: DocInternalCounts;
  task: {
    TASK_MAIN: number;
    TASK_SUPPORT: number;
    TASK_ASSIGN: number;
    WORD_EDITOR: number;
    ALL: number;
  };
  taskV2: {
    TASK_MAIN_2: number;
    TASK_SUPPORT_2: number;
    TASK_ASSIGN_2: number;
    WORD_EDITOR_2: number;
    ALL: number;
  };
  delegate: DelegateCounts;
  records: RecordsCounts;
  vehicle: VehicleCounts;
};

export type MenuBadgesPayload = {
  snapshot: MenuBadgeSnapshot;
  notifications: number;
};
