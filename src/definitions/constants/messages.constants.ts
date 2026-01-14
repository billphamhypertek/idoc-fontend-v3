/**
 * Constants for success and error messages used throughout the application
 * This file centralizes all toast notification messages for consistency
 */

export class Messages {
  // ===== SUCCESS MESSAGES =====
  public static SUCCESS = {
    // General success messages
    OPERATION_SUCCESS: "Thành công",
    SAVE_SUCCESS: "Lưu thành công",
    UPDATE_SUCCESS: "Cập nhật thành công",
    DELETE_SUCCESS: "Xóa thành công",
    CREATE_SUCCESS: "Tạo mới thành công",
    UPLOAD_SUCCESS: "Tải lên thành công",
    DOWNLOAD_SUCCESS: "Tải xuống thành công",

    // Document related
    DOCUMENT_CREATE_SUCCESS: "Tạo văn bản thành công",
    DOCUMENT_UPDATE_SUCCESS: "Cập nhật văn bản thành công",
    DOCUMENT_DELETE_SUCCESS: "Xóa văn bản thành công",
    DOCUMENT_SIGN_SUCCESS: "Ký văn bản thành công",
    DOCUMENT_SEND_SUCCESS: "Gửi văn bản thành công",
    DOCUMENT_ACCEPT_SUCCESS: "Chấp nhận văn bản thành công",
    DOCUMENT_REJECT_SUCCESS: "Từ chối văn bản thành công",
    DOCUMENT_RETURN_SUCCESS: "Trả lại văn bản thành công",
    DOCUMENT_RETAKE_SUCCESS: "Thu hồi văn bản thành công",
    DOCUMENT_COMPLETE_SUCCESS: "Hoàn thành văn bản thành công",

    // Vehicle related
    VEHICLE_REQUEST_CREATE_SUCCESS: "Tạo phiếu xin xe thành công",
    VEHICLE_REQUEST_UPDATE_SUCCESS: "Cập nhật phiếu xin xe thành công",
    VEHICLE_REQUEST_DELETE_SUCCESS: "Xóa phiếu xin xe thành công",
    VEHICLE_REQUEST_ACCEPT_SUCCESS: "Chấp nhận phiếu xin xe thành công",
    VEHICLE_REQUEST_REJECT_SUCCESS: "Từ chối phiếu xin xe thành công",
    VEHICLE_REQUEST_COMPLETE_SUCCESS: "Hoàn thành phiếu xin xe thành công",

    // Template related
    TEMPLATE_DELETE_SUCCESS: "Xóa mẫu văn bản thành công",
    TEMPLATE_RENAME_SUCCESS: "Đổi tên mẫu văn bản thành công",
    TEMPLATE_UPLOAD_SUCCESS: "Tải lên mẫu văn bản thành công",
    TEMPLATE_APPLY_SUCCESS: "Áp dụng mẫu văn bản thành công",

    // File related
    FILE_DELETE_SUCCESS: "Xóa tệp thành công",
    FILE_UPLOAD_SUCCESS: "Tải lên tệp thành công",
    FILE_DOWNLOAD_SUCCESS: "Tải xuống tệp thành công",
    FILE_RENAME_SUCCESS: "Đổi tên tệp thành công",

    // Label related
    LABEL_CREATE_SUCCESS: "Tạo nhãn thành công",
    LABEL_UPDATE_SUCCESS: "Cập nhật nhãn thành công",
    LABEL_DELETE_SUCCESS: "Xóa nhãn thành công",

    // Additional label messages
    DA_THEM_NHAN_MOI_THANH_CONG: "Đã thêm nhãn mới thành công",

    // User related
    USER_CREATE_SUCCESS: "Tạo người dùng thành công",
    USER_UPDATE_SUCCESS: "Cập nhật người dùng thành công",
    USER_DELETE_SUCCESS: "Xóa người dùng thành công",

    // Organization related
    ORG_CREATE_SUCCESS: "Tạo đơn vị thành công",
    ORG_UPDATE_SUCCESS: "Cập nhật đơn vị thành công",
    ORG_DELETE_SUCCESS: "Xóa đơn vị thành công",

    // Calendar related
    CALENDAR_CREATE_SUCCESS: "Tạo lịch thành công",
    CALENDAR_UPDATE_SUCCESS: "Cập nhật lịch thành công",
    CALENDAR_DELETE_SUCCESS: "Xóa lịch thành công",

    // Transfer related
    TRANSFER_SUCCESS: "Chuyển tiếp thành công",

    // Comment related
    COMMENT_CREATE_SUCCESS: "Thêm bình luận thành công",
    COMMENT_UPDATE_SUCCESS: "Cập nhật bình luận thành công",
    COMMENT_DELETE_SUCCESS: "Xóa bình luận thành công",

    // Additional success messages
    GAN_NHAN_THANH_CONG: "Gán nhãn thành công",
    HUY_GAN_NHAN_THANH_CONG: "Hủy gán nhãn thành công",
    XEM_FILE: "Xem file",
    THU_HOI_VAN_BAN: "Thu hồi văn bản",
    CHUYEN_XU_LY_VAN_BAN: "Chuyển xử lý văn bản",

    // Task success messages
    TASK_REJECT_SUCCESS: "Từ chối công việc thành công.",
    TASK_CLOSE_SUCCESS: "Đóng công việc thành công.",
    TASK_REVOKE_SUCCESS: "Thu hồi công việc thành công.",
    TASK_COMPLETE_SUCCESS: "Công việc đã hoàn thành.",
    TASK_RESTORE_SUCCESS: "Công việc đã khôi phục thành công.",
    TASK_ACCEPT_SUCCESS: "Tiếp nhận công việc thành công.",
    TASK_DELETE_SUCCESS: "Xóa công việc thành công.",
    TASK_FOLLOWER_SUCCESS: "Chọn người theo dõi công việc thành công.",
    SAVE_TASK_ASSIGN_SUCCESS: "Lưu công việc thành công.",

    // Role related
    ADD_NEW_ROLE_SUCCESS: "Thêm vai trò thành công.",
    UPDATE_ROLE_SUCCESS: "Cập nhật vai trò thành công.",
    DEACTIVE_ROLE_SUCCESS: "Vô hiệu hóa vai trò thành công.",
    ACTIVE_ROLE_SUCCESS: "Kích hoạt vai trò thành công.",
    CONFIGURATION_ROLE_SUCCESS: "Cập nhật chức năng vai trò thành công.",
    SAVE_MODULES_TO_ROLE_SUCCESS: "Lưu chức năng vai trò thành công.",
    SAVE_USERS_TO_ROLE_SUCCESS: "Lưu người dùng vai trò thành công.",
    SAVE_POSITIONS_TO_ROLE_SUCCESS: "Lưu chức danh vai trò thành công.",

    // Module success messages
    UPDATE_MODULE_SUCCESS: "Lưu thông tin module thành công.",
    DELETE_MODULE_SUCCESS: "Xóa module thành công.",
  };

  // ===== ERROR MESSAGES =====
  public static ERROR = {
    // General error messages
    OPERATION_FAILED: "Thao tác thất bại",
    SAVE_FAILED: "Lưu thất bại",
    UPDATE_FAILED: "Cập nhật thất bại",
    DELETE_FAILED: "Xóa thất bại",
    CREATE_FAILED: "Tạo mới thất bại",
    UPLOAD_FAILED: "Tải lên thất bại",
    DOWNLOAD_FAILED: "Tải xuống thất bại",
    NETWORK_ERROR: "Lỗi kết nối mạng",
    SERVER_ERROR: "Lỗi máy chủ",
    UNKNOWN_ERROR: "Có lỗi xảy ra",
    VALIDATION_ERROR: "Lỗi xác thực dữ liệu",
    PERMISSION_ERROR: "Không có quyền thực hiện thao tác này",
    KHONG_THE_XEM_FILE: "Không thể xem file",

    // Document related
    DOCUMENT_CREATE_FAILED: "Không thể tạo văn bản. Vui lòng thử lại.",
    DOCUMENT_UPDATE_FAILED: "Không thể cập nhật văn bản. Vui lòng thử lại.",
    DOCUMENT_DELETE_FAILED: "Không thể xóa văn bản. Vui lòng thử lại.",
    DOCUMENT_SIGN_FAILED: "Không thể ký văn bản. Vui lòng thử lại.",
    DOCUMENT_SEND_FAILED: "Không thể gửi văn bản. Vui lòng thử lại.",
    DOCUMENT_ACCEPT_FAILED: "Không thể chấp nhận văn bản. Vui lòng thử lại.",
    DOCUMENT_REJECT_FAILED: "Không thể từ chối văn bản. Vui lòng thử lại.",
    DOCUMENT_RETURN_FAILED: "Không thể trả lại văn bản. Vui lòng thử lại.",
    DOCUMENT_RETAKE_FAILED: "Không thể thu hồi văn bản. Vui lòng thử lại.",
    DOCUMENT_COMPLETE_FAILED: "Không thể hoàn thành văn bản. Vui lòng thử lại.",

    // Vehicle related
    VEHICLE_REQUEST_CREATE_FAILED:
      "Không thể tạo phiếu xin xe. Vui lòng thử lại.",
    VEHICLE_REQUEST_UPDATE_FAILED:
      "Không thể cập nhật phiếu xin xe. Vui lòng thử lại.",
    VEHICLE_REQUEST_DELETE_FAILED:
      "Không thể xóa phiếu xin xe. Vui lòng thử lại.",
    VEHICLE_REQUEST_ACCEPT_FAILED:
      "Không thể chấp nhận phiếu xin xe. Vui lòng thử lại.",
    VEHICLE_REQUEST_REJECT_FAILED:
      "Không thể từ chối phiếu xin xe. Vui lòng thử lại.",
    VEHICLE_REQUEST_COMPLETE_FAILED:
      "Không thể hoàn thành phiếu xin xe. Vui lòng thử lại.",

    // Template related
    TEMPLATE_DELETE_FAILED: "Không thể xóa mẫu văn bản. Vui lòng thử lại.",
    TEMPLATE_RENAME_FAILED: "Không thể đổi tên mẫu văn bản. Vui lòng thử lại.",
    TEMPLATE_UPLOAD_FAILED: "Không thể tải lên mẫu văn bản. Vui lòng thử lại.",
    TEMPLATE_APPLY_FAILED: "Không thể áp dụng mẫu văn bản. Vui lòng thử lại.",

    // File related
    FILE_DELETE_FAILED: "Không thể xóa tệp. Vui lòng thử lại.",
    FILE_UPLOAD_FAILED: "Không thể tải lên tệp. Vui lòng thử lại.",
    FILE_DOWNLOAD_FAILED: "Không thể tải xuống tệp. Vui lòng thử lại.",
    FILE_RENAME_FAILED: "Không thể đổi tên tệp. Vui lòng thử lại.",
    FILE_NOT_FOUND: "Không tìm thấy tệp",
    FILE_SIZE_TOO_LARGE: "Kích thước tệp quá lớn",
    FILE_TYPE_NOT_SUPPORTED: "Loại tệp không được hỗ trợ",

    // Label related
    LABEL_CREATE_FAILED: "Không thể tạo nhãn. Vui lòng thử lại.",
    LABEL_UPDATE_FAILED: "Không thể cập nhật nhãn. Vui lòng thử lại.",
    LABEL_DELETE_FAILED: "Không thể xóa nhãn. Vui lòng thử lại.",
    LABEL_NAME_EXISTS: "Tên nhãn đã tồn tại. Vui lòng chọn tên khác.",

    // Additional label error messages
    TEN_NHAN_VUOT_QUA_KY_TU: "Tên nhãn không được vượt quá",
    TEN_NHAN_DA_TON_TAI: "Tên nhãn đã tồn tại",
    VUI_LONG_NHAP_TEN_NHAN_KHAC: "Vui lòng nhập tên nhãn khác",

    // User related
    USER_CREATE_FAILED: "Không thể tạo người dùng. Vui lòng thử lại.",
    USER_UPDATE_FAILED: "Không thể cập nhật người dùng. Vui lòng thử lại.",
    USER_DELETE_FAILED: "Không thể xóa người dùng. Vui lòng thử lại.",

    // Organization related
    ORG_CREATE_FAILED: "Không thể tạo đơn vị. Vui lòng thử lại.",
    ORG_UPDATE_FAILED: "Không thể cập nhật đơn vị. Vui lòng thử lại.",
    ORG_DELETE_FAILED: "Không thể xóa đơn vị. Vui lòng thử lại.",

    // Calendar related
    CALENDAR_CREATE_FAILED: "Không thể tạo lịch. Vui lòng thử lại.",
    CALENDAR_UPDATE_FAILED: "Không thể cập nhật lịch. Vui lòng thử lại.",
    CALENDAR_DELETE_FAILED: "Không thể xóa lịch. Vui lòng thử lại.",

    // Transfer related
    TRANSFER_FAILED: "Không thể chuyển tiếp. Vui lòng thử lại.",

    // Comment related
    COMMENT_CREATE_FAILED: "Không thể thêm bình luận. Vui lòng thử lại.",
    COMMENT_UPDATE_FAILED: "Không thể cập nhật bình luận. Vui lòng thử lại.",
    COMMENT_DELETE_FAILED: "Không thể xóa bình luận. Vui lòng thử lại.",

    // Validation errors
    REQUIRED_FIELD: "Trường này là bắt buộc",
    INVALID_EMAIL: "Email không hợp lệ",
    INVALID_PHONE: "Số điện thoại không hợp lệ",
    INVALID_DATE: "Ngày không hợp lệ",
    INVALID_TIME: "Giờ không hợp lệ",
    PASSWORD_TOO_SHORT: "Mật khẩu quá ngắn",
    PASSWORD_MISMATCH: "Mật khẩu không khớp",
    FILE_REQUIRED: "Yêu cầu phải nhập tệp đính kèm",
    CONTENT_REQUIRED: "Nội dung phải chứa ít nhất 1 ký tự",
    ABSTRACT_REQUIRED: "Trích yếu phải chứa ít nhất 1 ký tự",

    // Additional validation messages
    BAN_CHUA_CHON_NGUOI_TRA_LAI: "Bạn chưa chọn người trả lại!",
    PHAI_NHAP_LY_DO_TRA_LAI_KHI_CO_TEP_DINH_KEM:
      "Phải nhập lý do trả lại khi có tệp đính kèm!",

    // Document out validation messages
    VAN_BAN_CO_DO_MAT_HAY_CHON_SO_PHU_HOP: "Văn bản có độ mật là",
    HAY_CHON_SO_CO_DO_MAT_PHU_HOP: "Hãy chọn sổ có độ mật phù hợp!",
    DON_VI_CHUA_CO_LUONG_VAN_BAN_DEN:
      "Đơn vị của bạn chưa có luồng văn bản đến",
    SO_VAN_BAN_CHUA_DUOC_NHAP: "Sổ văn bản chưa được nhập",
    NOI_GUI_PHAI_DUOC_NHAP: "Nơi gửi phải được nhập",

    // Additional error messages
    KHONG_TIM_THAY_LUONG_PHU_HOP: "Không tìm thấy luồng phù hợp",
    KHONG_THE_CHUYEN_XU_LY: "Không thể chuyển xử lý",
    CHUA_HO_TRO_CHUYEN_NHIEU_NGUOI: "Chưa hỗ trợ chuyển nhiều người",
    VUI_LONG_CHON_1_NGUOI_XU_LY_CHINH: "Vui lòng chọn 1 người xử lý chính",
    DON_VI_CHUA_CHON_LANH_DAO: "Đơn vị chưa chọn lãnh đạo",
    DON_VI_CHUA_CO_TRUONG_PHONG: "Đơn vị chưa có trưởng phòng",

    // File error messages
    KHONG_THE_MO_TEP_TIN: "Không thể mở tệp tin. Vui lòng thử lại.",

    // Book warning messages
    SO_VAN_BAN_SAP_HET_HAN: "Sổ văn bản sắp hết hạn !",

    // Certificate error messages
    LOI_KHI_LAY_THONG_TIN_CHUNG_THU_SO: "Lỗi khi lấy thông tin chứng thư số",
    KHONG_KET_NOI_DUOC_CHUNG_THU_SO: "Không kết nối được chứng thư số",
    BAN_DUNG_KHONG_DUNG_CHUNG_THU_SO: "Bạn dùng không đúng chứng thư số",

    // Process done validation messages
    Y_KIEN_XU_LY_BAT_BUOC_NHAP: "Ý kiến xử lý bắt buộc nhập.",
    Y_KIEN_XU_LY_KHONG_DUOC_DAI_QUA_2000_KY_TU:
      "Ý kiến xử lý không được dài quá 2000 ký tự",

    // File service messages
    FILE_DANG_DUOC_MO_HOAC_CHINH_SUA:
      "File đang được mở hoặc chỉnh sửa, vui lòng thử lại.",

    // Switch user validation messages
    CHUA_CHON_NGUOI_XU_LY: "Chưa chọn người xử lý",
    DA_THEM_NGUOI_XU_LY: "Đã thêm người xử lý",
    LOI_THEM_XU_LY: "Lỗi thêm xử lý",

    // File service error messages
    FILE_DOWNLOAD_ERROR: "Lỗi tải xuống tệp",
    FILE_OPEN_WORD_ERROR: "Lỗi mở tệp Word",
    SIGNATURE_SIGN_NO_CONNECT: "Không kết nối được chứng thư số",
    SIGNATURE_SIGN_NO_CONNECT_VGCA: "Không kết nối được chứng thư số VGCA",

    // Signature messages
    KY_THANH_CONG: "Ký thành công",
    CO_LOI_XAY_RA: "Có lỗi xảy ra",
    ROLLBACK_THAT_BAI: "Rollback thất bại",

    // File sharing validation messages
    CHUA_DUOC_XAC_THUC_DE_CHIA_SE_TEP_MA_HOA:
      "chưa được xác thực để chia sẻ tệp mã hóa",

    // Calendar approval messages
    DA_DUYET_LICH_THANH_CONG: "Đã duyệt lịch thành công",
    TRA_LAI_LICH_THANH_CONG: "Trả lại lịch thành công",
    HUY_DUYET_LICH_THANH_CONG: "Hủy duyệt lịch thành công",

    // Calendar status messages
    CO_LOI_XAY_RA_KHI_CAP_NHAT_TRANG_THAI_LICH:
      "Có lỗi xảy ra khi cập nhật trạng thái lịch",
    XOA_LICH_THANH_CONG: "Xóa lịch thành công",
    CO_LOI_XAY_RA_KHI_XOA_LICH: "Có lỗi xảy ra khi xóa lịch",

    // Calendar attachment messages
    CO_LOI_XAY_RA_KHI_THEM_TEP_LICH_TUAN:
      "Có lỗi xảy ra khi thêm tệp lịch tuần",
    XOA_TEP_LICH_TUAN_THANH_CONG: "Xóa tệp lịch tuần thành công",
    CO_LOI_XAY_RA_KHI_XOA_TEP_LICH_TUAN: "Có lỗi xảy ra khi xóa tệp lịch tuần",

    // Calendar file messages
    CAP_NHAT_TEP_THANH_CONG: "Cập nhật tệp thành công",
    THEM_MOI_TEP_THANH_CONG: "Thêm mới tệp thành công",

    // Export error messages
    CO_LOI_XAY_RA_KHI_EXPORT_EXCEL: "Có lỗi xảy ra khi export Excel",
    CO_LOI_XAY_RA_KHI_EXPORT_WORD: "Có lỗi xảy ra khi export Word",

    // Book validation messages
    BAN_CHUA_CHON_SO_VAN_BAN: "Bạn chưa chọn sổ văn bản.",
    BAN_CHUA_CHON_SO_KY_HIEU: "Bạn chưa chọn Số/Ký hiệu.",

    // Calendar update messages
    KHONG_THE_TAI_DU_LIEU_LICH: "Không thể tải dữ liệu lịch",
    LICH_DA_DUOC_CAP_NHAT_NHUNG_CO_LOI_KHI_XU_LY_TEP_DINH_KEM:
      "Lịch đã được cập nhật nhưng có lỗi khi xử lý tệp đính kèm",
    LICH_DA_DUOC_TAO_NHUNG_CO_LOI_KHI_XU_LY_TEP_DINH_KEM:
      "Lịch đã được tạo nhưng có lỗi khi xử lý tệp đính kèm",
    TAO_LICH_THANH_CONG: "Tạo lịch thành công",
    TAO_LICH_THAT_BAI: "Tạo lịch thất bại",
    CAP_NHAT_CUOC_HOP_THANH_CONG: "Cập nhật cuộc họp thành công",
    CAP_NHAT_LICH_THANH_CONG: "Cập nhật lịch thành công",
    CAP_NHAT_CUOC_HOP_THAT_BAI: "Cập nhật cuộc họp thất bại",
    CAP_NHAT_LICH_THAT_BAI: "Cập nhật lịch thất bại",
    FILE_SIZE_MUST_BE_LESS_THAN_300MB: "File size must be less than 300MB",
    XOA_TEP_THANH_CONG: "Xóa tệp thành công",
    LICH_KHONG_CO_THANH_VIEN_THAM_GIA_TRONG_HE_THONG:
      "Lịch không có thành viên tham gia trong hệ thống, không chia sẻ tệp đính kèm",
    XOA_VAN_BAN_THAT_BAI: "Trạng thái văn bản không cho phép xóa.",
    XOA_VAN_BAN_THANH_CONG: "Xóa văn bản thành công..",

    // Task failed messages
    TASK_REJECT_FAILED: "Không thể từ chối công việc. Vui lòng thử lại.",
    TASK_CLOSE_FAILED: "Không thể đóng công việc. Vui lòng thử lại.",
    TASK_REVOKE_FAILED: "Không thể thu hồi công việc. Vui lòng thử lại.",
    TASK_COMPLETE_FAILED: "Không thể hoàn thành công việc. Vui lòng thử lại.",
    TASK_RESTORE_FAILED: "Không thể công việc đã khôi phục. Vui lòng thử lại.",
    TASK_ACCEPT_FAILED: "Không thể tiếp nhận công việc. Vui lòng thử lại.",
    TASK_DELETE_FAILED: "Không thể xóa công việc. Vui lòng thử lại.",
    TASK_FOLLOWER_FAILED:
      "Không thể chọn người theo dõi công việc. Vui lòng thử lại.",
    SAVE_TASK_ASSIGN_FAILED: "Không thể lưu công việc. Vui lòng thử lại.",

    // Role related
    ADD_NEW_ROLE_FAILED: "Không thể thêm vai trò. Vui lòng thử lại.",
    UPDATE_ROLE_FAILED: "Không thể cập nhật vai trò. Vui lòng thử lại.",
    DEACTIVE_ROLE_FAILED: "Không thể vô hiệu hóa vai trò. Vui lòng thử lại.",
    ACTIVE_ROLE_FAILED: "Không thể kích hoạt vai trò. Vui lòng thử lại.",
    CONFIGURATION_ROLE_FAILED:
      "Không thể cập nhật chức năng vai trò. Vui lòng thử lại.",
    SAVE_MODULES_TO_ROLE_FAILED:
      "Không thể lưu chức năng vai trò. Vui lòng thử lại.",
    SAVE_USERS_TO_ROLE_FAILED:
      "Không thể lưu người dùng vai trò. Vui lòng thử lại.",
    SAVE_POSITIONS_TO_ROLE_FAILED:
      "Không thể lưu chức danh vai trò. Vui lòng thử lại.",

    // Module failed messages
    UPDATE_MODULE_FAILED: "Không thể lưu module. Vui lòng thử lại.",
    DELETE_MODULE_FAILED: "Không thể xóa module. Vui lòng thử lại.",
  };

  // ===== INFO MESSAGES =====
  public static INFO = {
    LOADING: "Đang tải...",
    PROCESSING: "Đang xử lý...",
    SAVING: "Đang lưu...",
    UPLOADING: "Đang tải lên...",
    DOWNLOADING: "Đang tải xuống...",
    DELETING: "Đang xóa...",
    CREATING: "Đang tạo...",
    UPDATING: "Đang cập nhật...",
    SIGNING: "Đang ký...",
    SENDING: "Đang gửi...",
    ACCEPTING: "Đang chấp nhận...",
    REJECTING: "Đang từ chối...",
    RETURNING: "Đang trả lại...",
    RETAKING: "Đang thu hồi...",
    COMPLETING: "Đang hoàn thành...",

    // Additional info messages
    THU_HOI_VAN_BAN_INFO: "Thu hồi văn bản",
    XEM_FILE_INFO: "Xem file",
  };

  // ===== WARNING MESSAGES =====
  public static WARNING = {
    CONFIRM_DELETE: "Bạn có chắc chắn muốn xóa?",
    CONFIRM_UPDATE: "Bạn có chắc chắn muốn cập nhật?",
    CONFIRM_CANCEL: "Bạn có chắc chắn muốn hủy?",
    CONFIRM_REJECT: "Bạn có chắc chắn muốn từ chối?",
    CONFIRM_RETURN: "Bạn có chắc chắn muốn trả lại?",
    CONFIRM_RETAKE: "Bạn có chắc chắn muốn thu hồi?",
    UNSAVED_CHANGES:
      "Bạn có thay đổi chưa được lưu. Bạn có chắc chắn muốn rời khỏi trang?",
    DATA_LOSS: "Dữ liệu có thể bị mất. Bạn có chắc chắn muốn tiếp tục?",
  };
}

// ===== TOAST CONFIGURATIONS =====
export const ToastConfig = {
  SUCCESS: {
    variant: "default" as const,
    className: "bg-green-500 text-white border-green-500",
    duration: 3000,
  },
  ERROR: {
    variant: "destructive" as const,
    duration: 5000,
  },
  INFO: {
    variant: "default" as const,
    className: "bg-blue-600 text-white border-blue-500",
    duration: 3000,
  },
  WARNING: {
    variant: "default" as const,
    className: "bg-yellow-500 text-white border-yellow-500",
    duration: 4000,
  },
} as const;
