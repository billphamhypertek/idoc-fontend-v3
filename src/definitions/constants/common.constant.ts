// DayLeft filter constants
export const DAY_LEFT = {
  ALL: "" as const, // Tất cả
  OVERDUE: "0" as const, // Quá hạn
  WITHIN_3: "3" as const, // Hạn xử lý không quá 3 ngày
  AFTER_3: "4" as const, // Hạn xử lý hơn 3 ngày
};
export type DayLeft = (typeof DAY_LEFT)[keyof typeof DAY_LEFT];

export const ROLES = {
  CLERICAL: "Văn thư",
};

export const ATTACHMENT_DOWNLOAD_TYPE = {
  DOCUMENT_IN: "VAN_BAN_DI",
  DOCUMENT_OUT_COMMENT: "document_out_comment",
  DOCUMENT_OUT: "document_out",
  DELEGATE: "delegate",
  WORD_EDITOR: "VAN_BAN_SOAN_THAO",
  DOCUMENT_RECORD: "document_record",
  TEMPLATE: "template",
  CALENDAR: "calendar",
  TASK: "GIAO_VIEC",
  DOCUMENT_INTERNAL: "VAN_BAN_NOI_BO",
  REPORT: "BAO_CAO",
  DOCUMENT_VEHICLE: "VAN_BAN_XIN_XE",
  DOCUMENT_VEHICLE_COMMENT: "VAN_BAN_XIN_XE_COMMENT",
};

export const ALLOWED_CONVERT_EXTENSION = ".doc, .docx, .odt";

export const TAB = {
  DEPARTMENT: "DEPARTMENT",
  ORG: "ORG",
} as const;

export const DATE_FORMAT = "dd/MM/yyyy";

export const THREAD_TYPE = {
  INCOMING: "INCOMING",
  OUTCOMING: "OUTCOMING",
  ASSIGN: "ASSIGN",
  EXAM_FOR_OTHERS: "EXAM_FOR_OTHERS",
  WORD_EDITOR: "WORD_EDITOR",
  CONSULT: "CONSULT",
};
