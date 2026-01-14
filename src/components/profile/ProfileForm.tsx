"use client";
import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { Check, Loader2, Lock, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AvatarUpload } from "./AvatarUpload";
import { CertificateInfo } from "./CertificateInfo";
import {
  ProfileResponse,
  ProfileService,
  ProfileUpdateRequest,
} from "@/services/profile.service";
import { useChangePassword, useUpdateProfile } from "@/hooks/data/profile.data";
import { handleError } from "@/utils/common.utils";
import { ToastUtils } from "@/utils/toast.utils";
import { sendPost } from "@/api/base-axios-protected-request";
import { EncryptionService } from "@/services/encryption.service";
import { Textarea } from "../ui/textarea";
import { Input } from "../ui/input";
import { CustomDatePicker } from "../ui/calendar";
import { formatDateYMD } from "@/utils/datetime.utils";
import { Constant } from "@/definitions/constants/constant";
import { Label } from "@/components/ui/label";

// Password Change Modal Component
const PasswordChangeModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onChangePassword: (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ) => void;
}> = ({ isOpen, onClose, onChangePassword }) => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const validateForm = () => {
    const newErrors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    if (!currentPassword.trim()) {
      newErrors.currentPassword = "Mật khẩu hiện tại không được để trống";
    }
    if (!newPassword.trim()) {
      newErrors.newPassword = "Mật khẩu mới không được để trống";
    }
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Xác nhận mật khẩu mới không được để trống";
    }

    if (newPassword.trim() && newPassword.length < 1) {
      newErrors.newPassword = "Mật khẩu mới phải có ít nhất 1 ký tự";
    }

    if (
      currentPassword.trim() &&
      newPassword.trim() &&
      currentPassword === newPassword
    ) {
      newErrors.newPassword =
        "Mật khẩu mới không được trùng với mật khẩu hiện tại";
    }

    if (
      newPassword.trim() &&
      confirmPassword.trim() &&
      newPassword !== confirmPassword
    ) {
      newErrors.confirmPassword = "Xác nhận mật khẩu mới không khớp";
    }

    setErrors(newErrors);

    return !Object.values(newErrors).some((error) => error !== "");
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const result: any = await onChangePassword(
        currentPassword,
        newPassword,
        confirmPassword
      );
      if (!!result) {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setErrors({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        onClose();
      }
    } catch (error) {
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setErrors({ currentPassword: "", newPassword: "", confirmPassword: "" });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white shadow-xl w-full max-w-6xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-black">Đổi mật khẩu</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {/* Body */}
        <div className="p-6">
          <div className="">
            <div className="flex items-center gap-2">
              <label className="text-sm font-bold text-black whitespace-nowrap w-48">
                Mật khẩu hiện tại <span className="text-red-500">*</span>
              </label>
              <div className="flex-1">
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => {
                    setCurrentPassword(e.target.value);
                    if (errors.currentPassword) {
                      setErrors((prev) => ({ ...prev, currentPassword: "" }));
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                    errors.currentPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
              </div>
            </div>
            {errors.currentPassword && (
              <p className="text-red-500 text-xs mt-1 ml-[200px]">
                {errors.currentPassword}
              </p>
            )}
            <div className="flex items-center gap-2 mt-4">
              <label className="text-sm font-bold text-black whitespace-nowrap w-48">
                Mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <div className="flex-1">
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    if (errors.newPassword) {
                      setErrors((prev) => ({ ...prev, newPassword: "" }));
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                    errors.newPassword ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
            </div>
            {errors.newPassword && (
              <p className="text-red-500 text-xs mt-1 ml-[200px]">
                {errors.newPassword}
              </p>
            )}
            <div className="flex items-center gap-2 mt-4">
              <label className="text-sm font-bold text-black whitespace-nowrap w-48">
                Xác nhận mật khẩu mới <span className="text-red-500">*</span>
              </label>
              <div className="flex-1">
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    if (errors.confirmPassword) {
                      setErrors((prev) => ({ ...prev, confirmPassword: "" }));
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
                    errors.confirmPassword
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                />
              </div>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1 ml-[200px]">
                {errors.confirmPassword}
              </p>
            )}
          </div>
        </div>
        {/* Footer */}
        <div className="flex justify-end items-center px-6 py-4 gap-2">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white text-sm hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check className="w-4 h-4" />
            {isSubmitting ? "Đang xử lý..." : "Lưu lại"}
          </Button>
          <Button
            onClick={handleClose}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-4 h-4" />
            Đóng
          </Button>
        </div>
      </div>
    </div>
  );
};

interface ProfileFormProps {
  profileData: ProfileResponse;
  onUpdateSuccess?: () => void;
  onSave?: () => void;
  triggerSave?: boolean;
  showPasswordModal?: boolean;
  setShowPasswordModal?: (show: boolean) => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({
  profileData,
  onUpdateSuccess,
  onSave,
  triggerSave,
  showPasswordModal = false,
  setShowPasswordModal,
}) => {
  const [saving, setSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(
    profileData.photo || null
  );
  const [selectedAvatarFile, setSelectedAvatarFile] = useState<File | null>(
    null
  );
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [selectedSignatureFile, setSelectedSignatureFile] =
    useState<File | null>(null);
  const [uploadingSignature, setUploadingSignature] = useState(false);
  const [signatureFile, setSignatureFile] = useState<string | null>(
    profileData.signature || null
  );
  const [registrySign, setRegistrySign] = useState(!!profileData.serialToken);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [currentCert, setCurrentCert] = useState<string>(
    profileData.cert || ""
  );
  const [isUpdatingCert, setIsUpdatingCert] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const formatBirthday = (birthday: string | number | undefined): string => {
    if (!birthday) return "";
    if (typeof birthday === "string" && birthday.includes("/")) return birthday;
    if (
      typeof birthday === "number" ||
      (typeof birthday === "string" && !isNaN(Number(birthday)))
    ) {
      const date = new Date(Number(birthday));
      return date.toLocaleDateString("sv-SE");
    }
    return birthday;
  };

  const [formData, setFormData] = useState({
    fullName: profileData.fullName || "",
    birthday: formatBirthday(profileData.birthday),
    gender: profileData.gender || 0,
    indentity: profileData.indentity || "",
    phone: profileData.phone || "",
    email: profileData.email || "",
    phoneCA: profileData.phoneCA || "",
    phoneCAProvider: profileData.phoneCAProvider || "",
    address: profileData.address || "",
    photo: profileData.photo || "",
    signature: profileData.signature || "",
  });
  const updateProfileMutation = useUpdateProfile();
  const changePasswordMutation = useChangePassword();
  const signatureInputRef = useRef<HTMLInputElement>(null);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (triggerSave) {
      handleSave();
    }
  }, [triggerSave]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvatarSelect = (file: File) => {
    // Validate file type - only allow images
    if (!file.type.match(/image\/.*/)) {
      ToastUtils.error(
        "Định dạng ảnh không hợp lệ. Vui lòng chọn file ảnh (.jpg, .png, .jpeg)"
      );
      return;
    }

    // Validate file size (300MB)
    const MAX_SIZE = 314572800; // 300MB
    if (file.size > MAX_SIZE) {
      ToastUtils.error(
        "Dung lượng ảnh không hợp lệ. Kích thước file phải nhỏ hơn 300MB"
      );
      return;
    }

    setSelectedAvatarFile(file);
  };

  const handleAvatarUpload = async () => {
    if (!selectedAvatarFile) return;

    setUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append("file", selectedAvatarFile);
      const uploadResponse = await sendPost("/files/upload", fd);
      const uploadedFileName = uploadResponse.data?.message;

      if (!uploadedFileName) {
        ToastUtils.error("Upload thất bại: Không nhận được tên file từ server");
        return;
      }

      setFormData((prev) => ({ ...prev, photo: uploadedFileName }));

      setAvatarPreview(uploadedFileName);

      setSelectedAvatarFile(null);

      ToastUtils.success("Tải ảnh đại diện thành công!");
    } catch (error) {
      handleError(error);
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSignatureSelect = (file: File) => {
    if (!file.type.match(/image\/.*/)) {
      ToastUtils.error(
        "Định dạng ảnh không hợp lệ. Vui lòng chọn file ảnh (.jpg, .png, .jpeg)"
      );
      return;
    }

    const MAX_SIZE = 314572800; // 300MB
    if (file.size > MAX_SIZE) {
      ToastUtils.error(
        "Dung lượng ảnh không hợp lệ. Kích thước file phải nhỏ hơn 300MB"
      );
      return;
    }

    setSelectedSignatureFile(file);
  };

  const handleSignatureUpload = async () => {
    if (!selectedSignatureFile) return;

    setUploadingSignature(true);
    try {
      const fd = new FormData();
      fd.append("file", selectedSignatureFile);
      const uploadResponse = await sendPost("/files/upload", fd);
      const uploadedFileName = uploadResponse.data?.message;

      if (!uploadedFileName) {
        ToastUtils.error("Upload thất bại: Không nhận được tên file từ server");
        return;
      }

      // Cập nhật form data với filename đã upload
      setFormData((prev) => ({ ...prev, signature: uploadedFileName }));

      // Hiển thị tên file sau khi upload thành công
      setSignatureFile(selectedSignatureFile.name);

      // Reset selectedFile
      setSelectedSignatureFile(null);

      ToastUtils.success("Tải chữ ký thành công!");
    } catch (error) {
      handleError(error);
    } finally {
      setUploadingSignature(false);
    }
  };

  const handleBrowseSignature = () => {
    signatureInputRef.current?.click();
  };

  const handleCalendarClick = () => {
    dateInputRef.current?.click();
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    if (dateValue) {
      const date = new Date(dateValue);
      const formattedDate = date.toLocaleDateString("en-GB");
      setFormData((prev) => ({
        ...prev,
        birthday: formattedDate,
      }));
    }
    setShowDatePicker(false);
  };

  const convertDateToISO = (
    dateStr: string | undefined
  ): string | undefined => {
    if (!dateStr || typeof dateStr !== "string") return undefined;

    // Trim whitespace
    const trimmedDate = dateStr.trim();
    if (!trimmedDate) return undefined;

    // Nếu đã là định dạng yyyy-MM-dd thì return luôn
    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedDate)) {
      return trimmedDate;
    }

    // Convert từ dd/MM/yyyy sang yyyy-MM-dd
    const parts = trimmedDate.split("/");
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
    }

    return undefined;
  };
  const doCheckUserByToken = () => {};
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form using HTML5 validation
    const form = formRef.current;
    if (!form || !form.checkValidity()) {
      ToastUtils.error("Vui lòng kiểm tra lại thông tin!");
      form?.reportValidity(); // Show browser validation messages
      return;
    }

    setSaving(true);
    try {
      // Step 1: Check token with encrypt=true
      await ProfileService.checkToken(profileData.id, true);

      // Step 2: Check token without encrypt
      await ProfileService.checkToken(profileData.id, false);

      // Step 3: Check certificate
      await ProfileService.checkCert(profileData.id);

      // Step 4: Update profile with encrypt=true
      const submitData: ProfileUpdateRequest = {
        id: profileData.id,
        fullName: formData.fullName,
        userName: profileData.userName,
        birthday: convertDateToISO(formData.birthday) || undefined,
        gender: Number(formData.gender),
        indentity: formData.indentity || undefined,
        phone: formData.phone,
        email: formData.email,
        phoneCA: formData.phoneCA || undefined,
        phoneCAProvider: formData.phoneCAProvider || undefined,
        address: formData.address || undefined,
        photo: formData.photo || undefined,
        signature: formData.signature || undefined,
        org: profileData.org,
        position: profileData.position,
      };

      // Invalidate and refetch profile data to update the UI
      await updateProfileMutation.mutateAsync(submitData);

      // Step 5: Check map IAM
      await ProfileService.checkMapIam();

      ToastUtils.success("Cập nhật thông tin thành công!");
      onUpdateSuccess?.();
      onSave?.();
    } catch (error) {
      handleError(error);
    } finally {
      setSaving(false);
    }
  };

  const handleSave = () => {
    if (formRef.current) {
      formRef.current.requestSubmit();
    }
  };

  const handleChangePassword = async () => {
    setShowPasswordModal?.(true);
  };

  const handlePasswordChange = async (
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ) => {
    // Validate form trước khi submit
    const newErrors = {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    };

    // Kiểm tra bắt buộc nhập
    if (!currentPassword.trim()) {
      newErrors.currentPassword = "Mật khẩu hiện tại không được để trống";
    }
    if (!newPassword.trim()) {
      newErrors.newPassword = "Mật khẩu mới không được để trống";
    }
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Xác nhận mật khẩu mới không được để trống";
    }

    // Kiểm tra độ dài (ít nhất 1 ký tự)
    if (newPassword.trim() && newPassword.length < 1) {
      newErrors.newPassword = "Mật khẩu mới phải có ít nhất 1 ký tự";
    }

    // Kiểm tra trùng mật khẩu hiện tại
    if (
      currentPassword.trim() &&
      newPassword.trim() &&
      currentPassword === newPassword
    ) {
      newErrors.newPassword =
        "Mật khẩu mới không được trùng với mật khẩu hiện tại";
    }

    // Kiểm tra xác nhận mật khẩu
    if (
      newPassword.trim() &&
      confirmPassword.trim() &&
      newPassword !== confirmPassword
    ) {
      newErrors.confirmPassword = "Xác nhận mật khẩu mới không khớp";
    }

    if (Object.values(newErrors).some((error) => error !== "")) {
      ToastUtils.error("Vui lòng kiểm tra lại thông tin!");
      return;
    }

    try {
      const result: any = await changePasswordMutation.mutateAsync({
        currentPassword,
        newPassword,
      });
      ToastUtils.success("Đổi mật khẩu thành công!");
      return result;
    } catch (error) {
      handleError(error);
      return false;
    }
  };
  const handleChangeRegistrySign = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (registrySign) {
    } else {
      setFormData((prev) => ({
        ...prev,
        nameToken: "",
        serialToken: "",
        startTimeToken: "",
        expiredTimeToken: "",
        orgToken: "",
      }));
    }
    setRegistrySign(e.target.checked);
  };
  const handleUpdateCertificate = async () => {
    setIsUpdatingCert(true);
    try {
      const certFromUsb = await EncryptionService.getUSBToken();
      if (certFromUsb === currentCert) {
        ToastUtils.info("Chứng thực số trùng khớp, không cần thay đổi.");
      } else {
        setShowConfirmModal(true);
      }
    } catch (error: any) {
      console.error("Error getting USB token:", error);
      ToastUtils.error(
        error.message || "Lỗi khi lấy thông tin chứng thực số từ USB Token"
      );
    } finally {
      setIsUpdatingCert(false);
    }
  };

  const handleConfirmUpdateCert = async () => {
    setShowConfirmModal(false);
    setIsUpdatingCert(true);
    try {
      const certFromUsb = await EncryptionService.getUSBToken();
      const submitData: ProfileUpdateRequest = {
        id: profileData.id,
        fullName: formData.fullName,
        userName: profileData.userName,
        birthday: convertDateToISO(formData.birthday) || undefined,
        gender: Number(formData.gender),
        indentity: formData.indentity || undefined,
        phone: formData.phone,
        email: formData.email,
        phoneCA: formData.phoneCA || undefined,
        phoneCAProvider: formData.phoneCAProvider || undefined,
        address: formData.address || undefined,
        photo: formData.photo || undefined,
        signature: formData.signature || undefined,
        org: profileData.org,
        position: profileData.position,
        cert: certFromUsb,
      };

      setCurrentCert(certFromUsb);
      ToastUtils.success("Cập nhật chứng thực số thành công!");
      onUpdateSuccess?.();
      // Invalidate and refetch profile data to update the UI
      updateProfileMutation.mutate(submitData);
    } catch (error: any) {
      console.error("Error updating certificate:", error);
      ToastUtils.error(error.message || "Lỗi khi cập nhật chứng thực số");
    } finally {
      setIsUpdatingCert(false);
    }
  };

  const handleCancelUpdateCert = () => {
    setShowConfirmModal(false);
  };

  useEffect(() => {
    const handleOpenPasswordModal = () => {
      setShowPasswordModal?.(true);
    };

    const formElement = formRef.current;
    if (formElement) {
      formElement.addEventListener(
        "openPasswordModal",
        handleOpenPasswordModal
      );
      return () => {
        formElement.removeEventListener(
          "openPasswordModal",
          handleOpenPasswordModal
        );
      };
    }
  }, [setShowPasswordModal]);

  return (
    <form
      ref={formRef}
      data-profile-form
      onSubmit={handleSubmit}
      className="max-w-7xl mx-auto"
    >
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Column - Avatar */}
        <div className="lg:w-1/4">
          <AvatarUpload
            avatarPreview={avatarPreview}
            selectedFile={selectedAvatarFile}
            onFileSelect={handleAvatarSelect}
            onUpload={handleAvatarUpload}
            uploading={uploadingAvatar}
          />
        </div>

        {/* Right Column - Form Fields */}
        <div className="lg:w-3/4">
          <div className="space-y-4">
            {/* Row 1: Họ tên & Tên đăng nhập */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="mb-4">
                <label className="block text-[13px] font-bold text-gray-700 mb-2">
                  Họ và tên<span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  required
                  placeholder="Họ và tên"
                  className="w-full h-9 px-3 bg-white border text-sm"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Tên đăng nhập<span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={profileData.userName}
                  disabled
                  placeholder="Tên đăng nhập"
                  className="w-full h-9 px-3 border border-gray-300 text-sm text-gray-600 rounded cursor-not-allowed"
                />
              </div>
            </div>

            {/* Row 2: Chức danh & Đơn vị */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2">
                  Chức danh<span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={profileData.positionModel?.name || ""}
                  disabled
                  className="w-full h-9 px-3 bg-gray-200 border border-gray-300 text-sm text-gray-600"
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2">
                  Đơn vị<span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={profileData.orgModel?.name || ""}
                  disabled
                  className="w-full h-9 px-3 bg-gray-200 border border-gray-300 text-sm text-gray-600"
                />
              </div>
            </div>

            {/* Row 3: Giới tính, Ngày sinh, CMTND */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2">
                  Giới tính
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full h-9 px-3 pr-8 border border-gray-300 text-sm focus:outline-none rounded-md appearance-none bg-white cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 8px center",
                    backgroundSize: "12px",
                  }}
                >
                  <option value={0}>Nam</option>
                  <option value={1}>Nữ</option>
                  <option value={2}>Khác</option>
                </select>
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2">
                  Ngày sinh
                </label>
                <CustomDatePicker
                  selected={
                    formData.birthday ? new Date(formData.birthday) : null
                  }
                  onChange={(date) => {
                    setFormData({
                      ...formData,
                      birthday: date ? formatDateYMD(date) : "",
                    });
                  }}
                  disabledFuture={true}
                  placeholder="Chọn ngày sinh"
                  showClearButton={false}
                  className="h-9"
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2">
                  Số CMTND
                </label>
                <Input
                  type="text"
                  name="indentity"
                  value={formData.indentity}
                  onChange={handleInputChange}
                  placeholder="Số CMTND"
                  maxLength={20}
                  className="w-full h-9 px-3 border border-gray-300 text-sm focus:outline-none rounded-md"
                />
              </div>
            </div>

            {/* Row 4: Điện thoại, Email, Số sim CA */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2">
                  Điện thoại
                </label>
                <Input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  maxLength={20}
                  className="w-full h-9 px-3 border border-gray-300 text-sm focus:outline-none rounded-md"
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2">
                  Thư điện tử
                </label>
                <Input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  maxLength={100}
                  className="w-full h-9 px-3 border border-gray-300 text-sm focus:outline-none rounded-md"
                />
              </div>
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2">
                  Số sim CA
                </label>
                <Input
                  type="text"
                  name="phoneCA"
                  value={formData.phoneCA}
                  onChange={handleInputChange}
                  placeholder="84*********"
                  maxLength={20}
                  className="w-full h-9 px-3 border border-gray-300 text-sm focus:outline-none rounded-md"
                />
              </div>
            </div>

            {/* Row 5: Nhà mạng & Chữ ký */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-[13px] font-bold text-gray-700 mb-2">
                  Nhà mạng sim CA
                </label>
                <select
                  name="phoneCAProvider"
                  value={formData.phoneCAProvider}
                  onChange={handleInputChange}
                  className="w-full h-9 px-3 pr-8 border border-gray-300 text-sm focus:outline-none rounded-md appearance-none bg-white cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23333' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 8px center",
                    backgroundSize: "12px",
                  }}
                >
                  <option value="">--Chọn nhà mạng--</option>
                  <option value="vt">Viettel</option>
                  <option value="vn">Vinaphone</option>
                </select>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-[13px] font-bold text-gray-700 mb-2">
                  Chữ ký
                </label>
                {/* ✅ CỐ ĐỊNH WIDTH cho phần upload chữ ký */}
                <div className="flex w-100">
                  {selectedSignatureFile ? (
                    <>
                      {/* Nút Tải ảnh - width cố định */}
                      <Button
                        type="button"
                        onClick={handleSignatureUpload}
                        disabled={uploadingSignature}
                        className="h-9 w-20 px-3 bg-blue-600 text-white text-sm hover:bg-blue-600 disabled:bg-gray-400 flex items-center justify-center gap-1 whitespace-nowrap shrink-0"
                      >
                        {uploadingSignature && (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        )}
                        Tải ảnh
                      </Button>

                      {/* Tên file - chiếm phần còn lại */}
                      <label className="h-9 flex-1 px-2 border border-gray-300 text-sm text-gray-500 bg-gray-50 truncate cursor-pointer overflow-hidden min-w-0 flex items-center">
                        {selectedSignatureFile.name}
                        <input
                          ref={signatureInputRef}
                          type="file"
                          accept=".jpg,.png,.jpeg"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleSignatureSelect(file);
                            }
                            e.target.value = ""; // Reset input
                          }}
                        />
                      </label>

                      {/* Nút Browse - width cố định */}
                      <Button
                        type="button"
                        onClick={handleBrowseSignature}
                        className="h-9 w-20 mr-2 px-3 bg-blue-600 text-white text-sm hover:bg-blue-600 flex items-center justify-center"
                      >
                        Browse
                      </Button>
                    </>
                  ) : (
                    <>
                      {/* Label "Chọn chữ ký" - chiếm phần lớn */}
                      <label className="flex-1 h-9 px-3 border rounded-md border-gray-300 text-sm text-gray-500 cursor-pointer truncate min-w-0 flex items-center">
                        {signatureFile || "Chọn chữ ký"}
                        <input
                          ref={signatureInputRef}
                          type="file"
                          accept=".jpg,.png,.jpeg"
                          className="hidden"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              handleSignatureSelect(file);
                            }
                            e.target.value = ""; // Reset input
                          }}
                        />
                      </label>

                      {/* Nút Browse - width cố định */}
                      <Button
                        type="button"
                        onClick={handleBrowseSignature}
                        className="h-9 w-20 ml-2 px-3 bg-blue-600 text-white text-sm hover:bg-blue-600 flex items-center justify-center"
                      >
                        Browse
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
            {/* Row 6: Địa chỉ */}
            <div>
              <label className="block text-[13px] font-bold text-gray-700 mb-2">
                Địa chỉ nhà riêng
              </label>
              <Textarea
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Địa chỉ nhà riêng"
                rows={3}
                className="w-full px-3 py-2 bg-white-100 border border-white-300 text-sm focus:outline-none"
              />
            </div>

            {/* Row 7: Checkbox */}
            {Constant.BCY_ADD_TOKEN_INFO && (
              <>
                <div className="flex items-center">
                  <Input
                    type="checkbox"
                    id="registrySign"
                    checked={registrySign}
                    onChange={handleChangeRegistrySign}
                    className="w-4 h-4 text-blue-600 border-gray-300"
                  />
                  <Label
                    htmlFor="registrySign"
                    className="ml-2 text-sm font-bold text-gray-800 "
                  >
                    Đăng ký chứng thư số
                  </Label>
                </div>
                {registrySign && (
                  <CertificateInfo
                    nameToken={profileData.nameToken}
                    orgToken={profileData.orgToken}
                    startTimeToken={profileData.startTimeToken}
                    expiredTimeToken={profileData.expiredTimeToken}
                  />
                )}
              </>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1">
                Chứng thực số
              </label>
              <div className="flex flex-col items-start gap-2 border border-gray-300 rounded-md p-2">
                <Button
                  type="button"
                  onClick={handleUpdateCertificate}
                  className="px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm hover:bg-gray-50"
                >
                  {currentCert ? "Cập nhật" : "Đăng ký"}
                </Button>
                <Textarea
                  value={currentCert ? currentCert.substring(0, 90) : ""}
                  disabled
                  rows={3}
                  className="w-2/3 px-2 py-1 bg-gray-200 border border-gray-300 text-xs text-gray-600 font-mono break-all resize-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Password Change Modal */}
      <PasswordChangeModal
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal?.(false)}
        onChangePassword={handlePasswordChange}
      />

      {/* Certificate Update Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-normal text-black">
                Xác nhận cập nhật chứng thực số
              </h2>
              <Button
                onClick={handleCancelUpdateCert}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            {/* Body */}
            <div className="p-6">
              <div className="space-y-4">
                <p className="text-sm text-gray-700">
                  Chứng thực số mới khác với chứng thực hiện tại. Bạn có muốn
                  thay thế không?
                </p>
              </div>
            </div>
            {/* Footer */}
            <div className="flex justify-end items-center px-6 py-4 gap-2">
              <Button
                onClick={handleConfirmUpdateCert}
                disabled={isUpdatingCert}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isUpdatingCert && <Loader2 className="w-4 h-4 animate-spin" />}
                {isUpdatingCert ? "Đang cập nhật..." : "Có"}
              </Button>
              <Button
                onClick={handleCancelUpdateCert}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-gray-100 text-gray-700 rounded text-sm hover:bg-gray-200 transition-colors"
                disabled={isUpdatingCert}
              >
                Không
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Action Buttons */}
      <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200">
        <Button
          type="button"
          onClick={handleChangePassword}
          className="px-5 py-1 bg-blue-600 text-white text-sm hover:bg-blue-600"
        >
          <Lock className="w-4 h-4 inline mr-1" />
          Đổi mật khẩu
        </Button>
        <Button
          type="submit"
          disabled={saving}
          className="px-6 py-2 bg-blue-600 text-white text-sm hover:bg-blue-600 disabled:bg-gray-400 flex items-center gap-2"
        >
          {saving && <Loader2 className="w-4 h-4 animate-spin" />}
          <Save className="w-4 h-4 inline mr-1" />
          Lưu lại
        </Button>
      </div>
    </form>
  );
};
