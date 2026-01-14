/**
 * Toast utility functions for consistent notification handling
 * Uses centralized message constants for better maintainability
 */

import { toast } from "@/hooks/use-toast";
import {
  Messages,
  ToastConfig,
} from "@/definitions/constants/messages.constants";

export class ToastUtils {
  /**
   * Show success toast with predefined styling
   */
  static success(
    message: string,
    title: string = Messages.SUCCESS.OPERATION_SUCCESS
  ) {
    toast({
      title,
      description: message,
      ...ToastConfig.SUCCESS,
    });
  }

  /**
   * Show error toast with predefined styling
   */
  static error(
    message: string,
    title: string = Messages.ERROR.OPERATION_FAILED
  ) {
    toast({
      title,
      description: message,
      ...ToastConfig.ERROR,
    });
  }

  /**
   * Show info toast with predefined styling
   */
  static info(message: string, title: string = Messages.INFO.LOADING) {
    toast({
      title,
      description: message,
      ...ToastConfig.INFO,
    });
  }

  /**
   * Show warning toast with predefined styling
   */
  static warning(
    message: string,
    title: string = Messages.WARNING.CONFIRM_DELETE
  ) {
    toast({
      title,
      description: message,
      ...ToastConfig.WARNING,
    });
  }

  // ===== DOCUMENT RELATED =====
  static documentCreateSuccess() {
    this.success(Messages.SUCCESS.DOCUMENT_CREATE_SUCCESS);
  }

  static documentCreateError() {
    this.error(Messages.ERROR.DOCUMENT_CREATE_FAILED);
  }

  static documentUpdateSuccess() {
    this.success(Messages.SUCCESS.DOCUMENT_UPDATE_SUCCESS);
  }

  static documentUpdateError() {
    this.error(Messages.ERROR.DOCUMENT_UPDATE_FAILED);
  }

  static documentDeleteSuccess() {
    this.success(Messages.SUCCESS.DOCUMENT_DELETE_SUCCESS);
  }

  static documentDeleteError() {
    this.error(Messages.ERROR.DOCUMENT_DELETE_FAILED);
  }

  static documentSignSuccess() {
    this.success(Messages.SUCCESS.DOCUMENT_SIGN_SUCCESS);
  }

  static documentSignError() {
    this.error(Messages.ERROR.DOCUMENT_SIGN_FAILED);
  }

  static documentSendSuccess() {
    this.success(Messages.SUCCESS.DOCUMENT_SEND_SUCCESS);
  }

  static documentSendError() {
    this.error(Messages.ERROR.DOCUMENT_SEND_FAILED);
  }

  static documentAcceptSuccess() {
    this.success(Messages.SUCCESS.DOCUMENT_ACCEPT_SUCCESS);
  }

  static documentAcceptError() {
    this.error(Messages.ERROR.DOCUMENT_ACCEPT_FAILED);
  }

  static documentRejectSuccess() {
    this.success(Messages.SUCCESS.DOCUMENT_REJECT_SUCCESS);
  }

  static documentRejectError() {
    this.error(Messages.ERROR.DOCUMENT_REJECT_FAILED);
  }

  static documentReturnSuccess() {
    this.success(Messages.SUCCESS.DOCUMENT_RETURN_SUCCESS);
  }

  static documentReturnError() {
    this.error(Messages.ERROR.DOCUMENT_RETURN_FAILED);
  }

  static documentRetakeSuccess() {
    this.success(Messages.SUCCESS.DOCUMENT_RETAKE_SUCCESS);
  }

  static documentRetakeError() {
    this.error(Messages.ERROR.DOCUMENT_RETAKE_FAILED);
  }

  static documentCompleteSuccess() {
    this.success(Messages.SUCCESS.DOCUMENT_COMPLETE_SUCCESS);
  }

  static documentCompleteError() {
    this.error(Messages.ERROR.DOCUMENT_COMPLETE_FAILED);
  }

  // ===== VEHICLE RELATED =====
  static vehicleRequestCreateSuccess() {
    this.success(Messages.SUCCESS.VEHICLE_REQUEST_CREATE_SUCCESS);
  }

  static vehicleRequestCreateError() {
    this.error(Messages.ERROR.VEHICLE_REQUEST_CREATE_FAILED);
  }

  static vehicleRequestUpdateSuccess() {
    this.success(Messages.SUCCESS.VEHICLE_REQUEST_UPDATE_SUCCESS);
  }

  static vehicleRequestUpdateError() {
    this.error(Messages.ERROR.VEHICLE_REQUEST_UPDATE_FAILED);
  }

  static vehicleRequestDeleteSuccess() {
    this.success(Messages.SUCCESS.VEHICLE_REQUEST_DELETE_SUCCESS);
  }

  static vehicleRequestDeleteError() {
    this.error(Messages.ERROR.VEHICLE_REQUEST_DELETE_FAILED);
  }

  static vehicleRequestAcceptSuccess() {
    this.success(Messages.SUCCESS.VEHICLE_REQUEST_ACCEPT_SUCCESS);
  }

  static vehicleRequestAcceptError() {
    this.error(Messages.ERROR.VEHICLE_REQUEST_ACCEPT_FAILED);
  }

  static vehicleRequestRejectSuccess() {
    this.success(Messages.SUCCESS.VEHICLE_REQUEST_REJECT_SUCCESS);
  }

  static vehicleRequestRejectError() {
    this.error(Messages.ERROR.VEHICLE_REQUEST_REJECT_FAILED);
  }

  static vehicleRequestCompleteSuccess() {
    this.success(Messages.SUCCESS.VEHICLE_REQUEST_COMPLETE_SUCCESS);
  }

  static vehicleRequestCompleteError() {
    this.error(Messages.ERROR.VEHICLE_REQUEST_COMPLETE_FAILED);
  }

  // ===== TEMPLATE RELATED =====
  static templateDeleteSuccess() {
    this.success(Messages.SUCCESS.TEMPLATE_DELETE_SUCCESS);
  }

  static templateDeleteError() {
    this.error(Messages.ERROR.TEMPLATE_DELETE_FAILED);
  }

  static templateRenameSuccess() {
    this.success(Messages.SUCCESS.TEMPLATE_RENAME_SUCCESS);
  }

  static templateRenameError() {
    this.error(Messages.ERROR.TEMPLATE_RENAME_FAILED);
  }

  static templateUploadSuccess() {
    this.success(Messages.SUCCESS.TEMPLATE_UPLOAD_SUCCESS);
  }

  static templateUploadError() {
    this.error(Messages.ERROR.TEMPLATE_UPLOAD_FAILED);
  }

  static templateApplySuccess() {
    this.success(Messages.SUCCESS.TEMPLATE_APPLY_SUCCESS);
  }

  static templateApplyError() {
    this.error(Messages.ERROR.TEMPLATE_APPLY_FAILED);
  }

  // ===== FILE RELATED =====
  static fileDeleteSuccess() {
    this.success(Messages.SUCCESS.FILE_DELETE_SUCCESS);
  }

  static fileDeleteError() {
    this.error(Messages.ERROR.FILE_DELETE_FAILED);
  }

  static fileUploadSuccess() {
    this.success(Messages.SUCCESS.FILE_UPLOAD_SUCCESS);
  }

  static fileUploadError() {
    this.error(Messages.ERROR.FILE_UPLOAD_FAILED);
  }

  static fileDownloadSuccess() {
    this.success(Messages.SUCCESS.FILE_DOWNLOAD_SUCCESS);
  }

  static fileRenameSuccess() {
    this.success(Messages.SUCCESS.FILE_RENAME_SUCCESS);
  }

  static fileRenameError() {
    this.error(Messages.ERROR.FILE_RENAME_FAILED);
  }

  static fileNotFound() {
    this.error(Messages.ERROR.FILE_NOT_FOUND);
  }

  static fileSizeTooLarge() {
    this.error(Messages.ERROR.FILE_SIZE_TOO_LARGE);
  }

  static fileTypeNotSupported() {
    this.error(Messages.ERROR.FILE_TYPE_NOT_SUPPORTED);
  }

  // ===== LABEL RELATED =====
  static labelCreateSuccess() {
    this.success(Messages.SUCCESS.LABEL_CREATE_SUCCESS);
  }

  static labelCreateError() {
    this.error(Messages.ERROR.LABEL_CREATE_FAILED);
  }

  static labelUpdateSuccess() {
    this.success(Messages.SUCCESS.LABEL_UPDATE_SUCCESS);
  }

  static labelUpdateError() {
    this.error(Messages.ERROR.LABEL_UPDATE_FAILED);
  }

  static labelDeleteSuccess() {
    this.success(Messages.SUCCESS.LABEL_DELETE_SUCCESS);
  }

  static labelDeleteError() {
    this.error(Messages.ERROR.LABEL_DELETE_FAILED);
  }

  static labelNameExists() {
    this.error(Messages.ERROR.LABEL_NAME_EXISTS);
  }

  // ===== VALIDATION RELATED =====
  static requiredField() {
    this.error(Messages.ERROR.REQUIRED_FIELD);
  }

  static invalidEmail() {
    this.error(Messages.ERROR.INVALID_EMAIL);
  }

  static invalidPhone() {
    this.error(Messages.ERROR.INVALID_PHONE);
  }

  static invalidDate() {
    this.error(Messages.ERROR.INVALID_DATE);
  }

  static invalidTime() {
    this.error(Messages.ERROR.INVALID_TIME);
  }

  static passwordTooShort() {
    this.error(Messages.ERROR.PASSWORD_TOO_SHORT);
  }

  static passwordMismatch() {
    this.error(Messages.ERROR.PASSWORD_MISMATCH);
  }

  static fileRequired() {
    this.error(Messages.ERROR.FILE_REQUIRED);
  }

  static contentRequired() {
    this.error(Messages.ERROR.CONTENT_REQUIRED);
  }

  static abstractRequired() {
    this.error(Messages.ERROR.ABSTRACT_REQUIRED);
  }

  // ===== GENERAL OPERATIONS =====
  static saveSuccess() {
    this.success(Messages.SUCCESS.SAVE_SUCCESS);
  }

  static saveError() {
    this.error(Messages.ERROR.SAVE_FAILED);
  }

  static updateSuccess() {
    this.success(Messages.SUCCESS.UPDATE_SUCCESS);
  }

  static updateError() {
    this.error(Messages.ERROR.UPDATE_FAILED);
  }

  static deleteSuccess() {
    this.success(Messages.SUCCESS.DELETE_SUCCESS);
  }

  static deleteError() {
    this.error(Messages.ERROR.DELETE_FAILED);
  }

  static createSuccess() {
    this.success(Messages.SUCCESS.CREATE_SUCCESS);
  }

  static createError() {
    this.error(Messages.ERROR.CREATE_FAILED);
  }

  static uploadSuccess() {
    this.success(Messages.SUCCESS.UPLOAD_SUCCESS);
  }

  static uploadError() {
    this.error(Messages.ERROR.UPLOAD_FAILED);
  }

  static downloadSuccess() {
    this.success(Messages.SUCCESS.DOWNLOAD_SUCCESS);
  }

  static downloadError() {
    this.error(Messages.ERROR.DOWNLOAD_FAILED);
  }

  static networkError() {
    this.error(Messages.ERROR.NETWORK_ERROR);
  }

  static serverError() {
    this.error(Messages.ERROR.SERVER_ERROR);
  }

  static unknownError() {
    this.error(Messages.ERROR.UNKNOWN_ERROR);
  }

  static validationError() {
    this.error(Messages.ERROR.VALIDATION_ERROR);
  }

  static permissionError() {
    this.error(Messages.ERROR.PERMISSION_ERROR);
  }

  // ===== TRANSFER RELATED =====
  static transferSuccess() {
    this.success(Messages.SUCCESS.TRANSFER_SUCCESS);
  }

  static transferError() {
    this.error(Messages.ERROR.TRANSFER_FAILED);
  }

  // ===== COMMENT RELATED =====
  static commentCreateSuccess() {
    this.success(Messages.SUCCESS.COMMENT_CREATE_SUCCESS);
  }

  static commentCreateError() {
    this.error(Messages.ERROR.COMMENT_CREATE_FAILED);
  }

  static commentUpdateSuccess() {
    this.success(Messages.SUCCESS.COMMENT_UPDATE_SUCCESS);
  }

  static commentUpdateError() {
    this.error(Messages.ERROR.COMMENT_UPDATE_FAILED);
  }

  static commentDeleteSuccess() {
    this.success(Messages.SUCCESS.COMMENT_DELETE_SUCCESS);
  }

  static commentDeleteError() {
    this.error(Messages.ERROR.COMMENT_DELETE_FAILED);
  }

  // ===== ADDITIONAL METHODS =====
  static ganNhanThanhCong() {
    this.success(Messages.SUCCESS.GAN_NHAN_THANH_CONG);
  }

  static huyGanNhanThanhCong() {
    this.success(Messages.SUCCESS.HUY_GAN_NHAN_THANH_CONG);
  }

  static xemFile(fileName: string) {
    this.info(`${Messages.SUCCESS.XEM_FILE} ${fileName}`);
  }

  static thuHoiVanBan(docId: string) {
    this.info(`${Messages.INFO.THU_HOI_VAN_BAN_INFO} ${docId}`);
  }

  static chuyenXuLyVanBan(userName: string) {
    this.success(`${Messages.SUCCESS.CHUYEN_XU_LY_VAN_BAN} tới ${userName}`);
  }

  static khongTimThayLuongPhuHop() {
    this.error(Messages.ERROR.KHONG_TIM_THAY_LUONG_PHU_HOP);
  }

  static khongTheChuyenXuLy(orgName: string) {
    this.error(
      `${Messages.ERROR.KHONG_THE_CHUYEN_XU_LY} cho ${orgName} do không có cấu hình`
    );
  }

  static khongTheXemFile() {
    this.error(`${Messages.ERROR.KHONG_THE_XEM_FILE}`);
  }

  static chuaHoTroChuyenNhieuNguoi() {
    this.error(
      Messages.ERROR.CHUA_HO_TRO_CHUYEN_NHIEU_NGUOI,
      Messages.ERROR.VUI_LONG_CHON_1_NGUOI_XU_LY_CHINH
    );
  }

  static donViChuaChonLanhDao(orgName: string) {
    this.error(`Đơn vị ${orgName} chưa chọn lãnh đạo`);
  }

  static donViChuaCoTruongPhong(orgName: string) {
    this.error(`Đơn vị ${orgName} chưa có trưởng phòng`);
  }

  // ===== LABEL METHODS =====
  static tenNhanVuotQuaKyTu(maxLength: number) {
    this.error(`${Messages.ERROR.TEN_NHAN_VUOT_QUA_KY_TU} ${maxLength} ký tự`);
  }

  static daThemNhanMoiThanhCong() {
    this.success(Messages.SUCCESS.DA_THEM_NHAN_MOI_THANH_CONG);
  }

  static tenNhanDaTonTai() {
    this.error(
      Messages.ERROR.TEN_NHAN_DA_TON_TAI,
      Messages.ERROR.VUI_LONG_NHAP_TEN_NHAN_KHAC
    );
  }

  // ===== VALIDATION METHODS =====
  static banChuaChonNguoiTraLai() {
    this.error(Messages.ERROR.BAN_CHUA_CHON_NGUOI_TRA_LAI);
  }

  static phaiNhapLyDoTraLaiKhiCoTepDinhKem() {
    this.error(Messages.ERROR.PHAI_NHAP_LY_DO_TRA_LAI_KHI_CO_TEP_DINH_KEM);
  }

  // ===== DOCUMENT OUT VALIDATION METHODS =====
  static vanBanCoDoMatHayChonSoPhuHop(securityName: string) {
    this.warning(
      `${Messages.ERROR.VAN_BAN_CO_DO_MAT_HAY_CHON_SO_PHU_HOP} ${securityName}, ${Messages.ERROR.HAY_CHON_SO_CO_DO_MAT_PHU_HOP}`
    );
  }

  static donViChuaCoLuongVanBanDen() {
    this.error(Messages.ERROR.DON_VI_CHUA_CO_LUONG_VAN_BAN_DEN);
  }

  static soVanBanChuaDuocNhap() {
    this.error(Messages.ERROR.SO_VAN_BAN_CHUA_DUOC_NHAP);
  }

  static noiGuiPhaiDuocNhap() {
    this.error(Messages.ERROR.NOI_GUI_PHAI_DUOC_NHAP);
  }

  // ===== FILE ERROR METHODS =====
  static khongTheMoTepTin() {
    this.error(Messages.ERROR.KHONG_THE_MO_TEP_TIN);
  }

  // ===== BOOK WARNING METHODS =====
  static soVanBanSapHetHan() {
    this.warning(Messages.ERROR.SO_VAN_BAN_SAP_HET_HAN);
  }

  // ===== CERTIFICATE ERROR METHODS =====
  static loiKhiLayThongTinChungThuSo() {
    this.error(Messages.ERROR.LOI_KHI_LAY_THONG_TIN_CHUNG_THU_SO);
  }

  static khongKetNoiDuocChungThuSo() {
    this.error(Messages.ERROR.KHONG_KET_NOI_DUOC_CHUNG_THU_SO);
  }

  static banDungKhongDungChungThuSo() {
    this.error(Messages.ERROR.BAN_DUNG_KHONG_DUNG_CHUNG_THU_SO);
  }

  // ===== PROCESS DONE VALIDATION METHODS =====
  static yKienXuLyBatBuocNhap() {
    this.error(Messages.ERROR.Y_KIEN_XU_LY_BAT_BUOC_NHAP);
  }

  static yKienXuLyKhongDuocDaiQua2000KyTu() {
    this.error(Messages.ERROR.Y_KIEN_XU_LY_KHONG_DUOC_DAI_QUA_2000_KY_TU);
  }

  // ===== FILE SERVICE METHODS =====
  static fileDangDuocMoHoacChinhSua() {
    this.error(Messages.ERROR.FILE_DANG_DUOC_MO_HOAC_CHINH_SUA);
  }

  // ===== SWITCH USER METHODS =====
  static chuaChonNguoiXuLy() {
    this.error(Messages.ERROR.CHUA_CHON_NGUOI_XU_LY);
  }

  static daThemNguoiXuLy() {
    this.success(Messages.ERROR.DA_THEM_NGUOI_XU_LY);
  }

  static loiThemXuLy() {
    this.error(Messages.ERROR.LOI_THEM_XU_LY);
  }

  // ===== FILE SERVICE ERROR METHODS =====
  static fileDownloadError() {
    this.error(Messages.ERROR.FILE_DOWNLOAD_ERROR);
  }

  static fileOpenWordError() {
    this.error(Messages.ERROR.FILE_OPEN_WORD_ERROR);
  }

  static signatureSignNoConnect() {
    this.error(Messages.ERROR.SIGNATURE_SIGN_NO_CONNECT);
  }

  static signatureSignNoConnectVgca() {
    this.error(Messages.ERROR.SIGNATURE_SIGN_NO_CONNECT_VGCA);
  }

  // ===== SIGNATURE METHODS =====
  static kyThanhCong() {
    this.success(Messages.ERROR.KY_THANH_CONG);
  }

  static coLoiXayRa(message?: string) {
    this.error(message || Messages.ERROR.CO_LOI_XAY_RA);
  }

  static rollbackThatBai() {
    this.error(Messages.ERROR.ROLLBACK_THAT_BAI);
  }

  // ===== FILE SHARING VALIDATION METHODS =====
  static chuaDuocXacThucDeChiaSeTepMaHoa(error: string) {
    this.error(
      `${error} ${Messages.ERROR.CHUA_DUOC_XAC_THUC_DE_CHIA_SE_TEP_MA_HOA}`
    );
  }

  // ===== CALENDAR APPROVAL METHODS =====
  static daDuyetLichThanhCong() {
    this.success(Messages.ERROR.DA_DUYET_LICH_THANH_CONG);
  }

  static traLaiLichThanhCong() {
    this.success(Messages.ERROR.TRA_LAI_LICH_THANH_CONG);
  }

  static huyDuyetLichThanhCong() {
    this.success(Messages.ERROR.HUY_DUYET_LICH_THANH_CONG);
  }

  // ===== CALENDAR STATUS METHODS =====
  static coLoiXayRaKhiCapNhatTrangThaiLich() {
    this.error(Messages.ERROR.CO_LOI_XAY_RA_KHI_CAP_NHAT_TRANG_THAI_LICH);
  }

  static xoaLichThanhCong() {
    this.success(Messages.ERROR.XOA_LICH_THANH_CONG);
  }

  static coLoiXayRaKhiXoaLich() {
    this.error(Messages.ERROR.CO_LOI_XAY_RA_KHI_XOA_LICH);
  }

  // ===== CALENDAR ATTACHMENT METHODS =====
  static coLoiXayRaKhiThemTepLichTuan() {
    this.error(Messages.ERROR.CO_LOI_XAY_RA_KHI_THEM_TEP_LICH_TUAN);
  }

  static xoaTepLichTuanThanhCong() {
    this.success(Messages.ERROR.XOA_TEP_LICH_TUAN_THANH_CONG);
  }

  static coLoiXayRaKhiXoaTepLichTuan() {
    this.error(Messages.ERROR.CO_LOI_XAY_RA_KHI_XOA_TEP_LICH_TUAN);
  }

  // ===== CALENDAR FILE METHODS =====
  static capNhatTepThanhCong() {
    this.success(Messages.ERROR.CAP_NHAT_TEP_THANH_CONG);
  }

  static themMoiTepThanhCong() {
    this.success(Messages.ERROR.THEM_MOI_TEP_THANH_CONG);
  }

  // ===== EXPORT ERROR METHODS =====
  static coLoiXayRaKhiExportExcel() {
    this.error(Messages.ERROR.CO_LOI_XAY_RA_KHI_EXPORT_EXCEL);
  }

  static coLoiXayRaKhiExportWord() {
    this.error(Messages.ERROR.CO_LOI_XAY_RA_KHI_EXPORT_WORD);
  }

  // ===== BOOK VALIDATION METHODS =====
  static banChuaChonSoVanBan() {
    this.error(Messages.ERROR.BAN_CHUA_CHON_SO_VAN_BAN);
  }

  static banChuaChonSoKyHieu() {
    this.error(Messages.ERROR.BAN_CHUA_CHON_SO_KY_HIEU);
  }

  // ===== CALENDAR UPDATE METHODS =====
  static khongTheTaiDuLieuLich() {
    this.error(Messages.ERROR.KHONG_THE_TAI_DU_LIEU_LICH);
  }

  static lichDaDuocCapNhatNhungCoLoiKhiXuLyTepDinhKem() {
    this.warning(
      Messages.ERROR.LICH_DA_DUOC_CAP_NHAT_NHUNG_CO_LOI_KHI_XU_LY_TEP_DINH_KEM
    );
  }

  static lichDaDuocTaoNhungCoLoiKhiXuLyTepDinhKem() {
    this.warning(
      Messages.ERROR.LICH_DA_DUOC_TAO_NHUNG_CO_LOI_KHI_XU_LY_TEP_DINH_KEM
    );
  }

  static taoLichThanhCong() {
    this.success(Messages.ERROR.TAO_LICH_THANH_CONG);
  }

  static taoLichThatBai() {
    this.error(Messages.ERROR.TAO_LICH_THAT_BAI);
  }

  static capNhatCuocHopThanhCong() {
    this.success(Messages.ERROR.CAP_NHAT_CUOC_HOP_THANH_CONG);
  }

  static capNhatLichThanhCong() {
    this.success(Messages.ERROR.CAP_NHAT_LICH_THANH_CONG);
  }

  static capNhatCuocHopThatBai() {
    this.error(Messages.ERROR.CAP_NHAT_CUOC_HOP_THAT_BAI);
  }

  static capNhatLichThatBai() {
    this.error(Messages.ERROR.CAP_NHAT_LICH_THAT_BAI);
  }

  static fileSizeMustBeLessThan300MB() {
    this.error(Messages.ERROR.FILE_SIZE_MUST_BE_LESS_THAN_300MB);
  }

  static xoaTepThanhCong() {
    this.success(Messages.ERROR.XOA_TEP_THANH_CONG);
  }

  static lichKhongCoThanhVienThamGiaTrongHeThong() {
    this.warning(
      Messages.ERROR.LICH_KHONG_CO_THANH_VIEN_THAM_GIA_TRONG_HE_THONG
    );
  }

  static xoaVanBanFail() {
    this.error(Messages.ERROR.XOA_VAN_BAN_THAT_BAI);
  }
  static xoaVanBanSuccess() {
    this.error(Messages.ERROR.XOA_VAN_BAN_THAT_BAI);
  }

  // ===== TASK RELATED =====
  static taskRejectSuccess() {
    this.success(Messages.SUCCESS.TASK_REJECT_SUCCESS);
  }
  static taskRejectError() {
    this.error(Messages.ERROR.TASK_REJECT_FAILED);
  }
  static taskAcceptSuccess() {
    this.success(Messages.SUCCESS.TASK_ACCEPT_SUCCESS);
  }
  static taskAcceptError() {
    this.error(Messages.ERROR.TASK_ACCEPT_FAILED);
  }
  static taskCloseSuccess() {
    this.success(Messages.SUCCESS.TASK_CLOSE_SUCCESS);
  }
  static taskCloseError() {
    this.error(Messages.ERROR.TASK_CLOSE_FAILED);
  }
  static taskRevokeSuccess() {
    this.success(Messages.SUCCESS.TASK_REVOKE_SUCCESS);
  }
  static taskRevokeError() {
    this.error(Messages.ERROR.TASK_REVOKE_FAILED);
  }
  static taskCompleteSuccess() {
    this.success(Messages.SUCCESS.TASK_COMPLETE_SUCCESS);
  }
  static taskCompleteError() {
    this.error(Messages.ERROR.TASK_COMPLETE_FAILED);
  }
  static taskRestoreSuccess() {
    this.success(Messages.SUCCESS.TASK_RESTORE_SUCCESS);
  }
  static taskRestoreError() {
    this.error(Messages.ERROR.TASK_RESTORE_FAILED);
  }
  static taskDeleteSuccess() {
    this.success(Messages.SUCCESS.TASK_DELETE_SUCCESS);
  }
  static taskDeleteError() {
    this.error(Messages.ERROR.TASK_DELETE_FAILED);
  }
  static taskFollowerSuccess() {
    this.success(Messages.SUCCESS.TASK_FOLLOWER_SUCCESS);
  }
  static taskFollowerError() {
    this.error(Messages.ERROR.TASK_FOLLOWER_FAILED);
  }
  static saveTaskAssignSuccess() {
    this.success(Messages.SUCCESS.SAVE_TASK_ASSIGN_SUCCESS);
  }
  static saveTaskAssignError() {
    this.error(Messages.ERROR.SAVE_TASK_ASSIGN_FAILED);
  }

  // ===== ROLE RELATED =====
  static addNewRoleSuccess() {
    this.success(Messages.SUCCESS.ADD_NEW_ROLE_SUCCESS);
  }
  static addNewRoleError() {
    this.error(Messages.ERROR.ADD_NEW_ROLE_FAILED);
  }
  static updateRoleSuccess() {
    this.success(Messages.SUCCESS.UPDATE_ROLE_SUCCESS);
  }
  static updateRoleError() {
    this.error(Messages.ERROR.UPDATE_ROLE_FAILED);
  }
  static deactiveRoleSuccess() {
    this.success(Messages.SUCCESS.DEACTIVE_ROLE_SUCCESS);
  }
  static deactiveRoleError() {
    this.error(Messages.ERROR.DEACTIVE_ROLE_FAILED);
  }
  static activeRoleSuccess() {
    this.success(Messages.SUCCESS.ACTIVE_ROLE_SUCCESS);
  }
  static activeRoleError() {
    this.error(Messages.ERROR.ACTIVE_ROLE_FAILED);
  }
  static configurationRoleSuccess() {
    this.success(Messages.SUCCESS.CONFIGURATION_ROLE_SUCCESS);
  }
  static configurationRoleError() {
    this.error(Messages.ERROR.CONFIGURATION_ROLE_FAILED);
  }
  static saveModulesToRoleSuccess() {
    this.success(Messages.SUCCESS.SAVE_MODULES_TO_ROLE_SUCCESS);
  }
  static saveModulesToRoleError() {
    this.error(Messages.ERROR.SAVE_MODULES_TO_ROLE_FAILED);
  }
  static saveUsersToRoleSuccess() {
    this.success(Messages.SUCCESS.SAVE_USERS_TO_ROLE_SUCCESS);
  }
  static saveUsersToRoleError() {
    this.error(Messages.ERROR.SAVE_USERS_TO_ROLE_FAILED);
  }
  static savePositionsToRoleSuccess() {
    this.success(Messages.SUCCESS.SAVE_POSITIONS_TO_ROLE_SUCCESS);
  }
  static savePositionsToRoleError() {
    this.error(Messages.ERROR.SAVE_POSITIONS_TO_ROLE_FAILED);
  }
  static updateModuleSuccess() {
    this.success(Messages.SUCCESS.UPDATE_MODULE_SUCCESS);
  }
  static updateModuleError() {
    this.success(Messages.ERROR.UPDATE_MODULE_FAILED);
  }
  static deleteModuleSuccess() {
    this.success(Messages.SUCCESS.DELETE_MODULE_SUCCESS);
  }
  static deleteModuleError() {
    this.success(Messages.ERROR.DELETE_MODULE_FAILED);
  }
}
