export enum PdfSignType {
  /**
   * Ký CA
   */
  CA,

  /**
   * Ký comment
   */
  COMMENT,

  /**
   * Ký bản sao
   */
  COPY,

  /**
   * Ký ban hành
   */
  ISSUED,
  /**
   * Ký ban hành MẬT
   */
  ISSUED_ENCRYPT,
  /**
   * Ký phụ lục
   */
  APPENDIX,
}

export enum TYPE_WORKFLOW {
  CABINET_DRAFT = "CABINET_DRAFT",
  HOTEL = "HOTEL",
  VEHICLE = "VEHICLE",
  MAINTENANCE = "MAINTENANCE",
}

export enum FORMHANLDETYPE {
  XU_LY_CHINH = "XU_LY_CHINH",
  PHOI_HOP = "PHOI_HOP",
  NHAN_DE_BIET = "NHAN_DE_BIET",
}

export enum FORMHANLDESTATUS {
  NEW = "NEW", // mới tạo
  WAIT_HANDLE = "WAIT_HANDLE", // chờ xử lý
  HANDLED = "HANDLED", // đã xử lý
  DONE = "DONE", // hoàn thành
  RETURNED = "RETURNED", // trả lại
  REJECT = "REJECT", // từ chối
  RECALL = "RECALL", // thu hồi
  RECALLED = "RECALLED", // bị thu hồi
}
