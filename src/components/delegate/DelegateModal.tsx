"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import SelectCustom from "@/components/common/SelectCustom";
import { CustomDatePicker } from "@/components/ui/calendar";
import { DelegateService } from "@/services/delegate.service";
import {
  Delegate,
  DelegateUser,
  DelegateAttachment,
} from "@/definitions/types/delegate.type";
import { ToastUtils } from "@/utils/toast.utils";
import { Constant } from "@/definitions/constants/constant";
import { Upload, X, Save } from "lucide-react";
import useAuthStore from "@/stores/auth.store";

interface DelegateModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  delegate?: Delegate | null;
  isEdit?: boolean;
  onSuccess?: () => void;
}

function DelegateModalInner({
  isOpen,
  onOpenChange,
  delegate,
  isEdit = false,
  onSuccess,
}: DelegateModalProps) {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [userList, setUserList] = useState<DelegateUser[]>([]);
  const [delegateToUserList, setDelegateToUserList] = useState<DelegateUser[]>(
    []
  );
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [existingAttachments, setExistingAttachments] = useState<
    DelegateAttachment[]
  >([]);
  const [isChangeAttachment, setIsChangeAttachment] = useState(false);
  const [isVanThuBan, setIsVanThuBan] = useState(false);

  const [formData, setFormData] = useState<Partial<Delegate>>({
    numberOrSign: "",
    fromUserId: -1,
    toUserId: -1,
    startDate: null,
    endDate: null,
  });

  const [validation, setValidation] = useState({
    numberOrSign: true,
    fromUserId: true,
    toUserId: true,
    files: true,
  });

  const [dateStates, setDateStates] = useState({
    startDate: null as Date | null,
    endDate: null as Date | null,
  });

  // Check if delegate is expired or processing
  const [isDelegateProcessing, setIsDelegateProcessing] = useState(false);
  const [isDelegateEnding, setIsDelegateEnding] = useState(false);

  // Load user lists
  useEffect(() => {
    if (!isOpen) return;
    loadUserLists();
    if (isEdit && delegate) {
      loadDelegateData();
    } else {
      initNewDelegate();
    }
  }, [isOpen, isEdit, delegate]);

  const loadUserLists = useCallback(async () => {
    try {
      if (Constant.USE_DELEGATE_FROM_USER_LIST) {
        const users = await DelegateService.getDelegateFromUserList();
        setUserList(users);
      }

      // Check if user is Van Thu Ban
      if (
        user?.positionModel?.name?.toLowerCase() === "văn thư ban" ||
        user?.positionModel?.name?.toLowerCase() === "van thu ban"
      ) {
        setIsVanThuBan(true);
        const users = await DelegateService.getListNguoiUyQuyenVanThuBan();
        setUserList(users);
      } else if (!Constant.USE_DELEGATE_FROM_USER_LIST && user) {
        setFormData((prev) => ({
          ...prev,
          fromUserId: user.id || -1,
        }));
      }

      // Load to user list if fromUserId is set
      const fromUserId =
        formData.fromUserId || delegate?.fromUserId || user?.id;
      if (fromUserId && fromUserId !== -1) {
        const toUsers = await DelegateService.getDelegateToUserList(fromUserId);
        setDelegateToUserList(toUsers);
      }
    } catch (error: any) {
      ToastUtils.error("Không thể tải danh sách người dùng");
    }
  }, [delegate?.fromUserId, formData.fromUserId, user]);

  const loadDelegateData = useCallback(() => {
    if (!delegate) return;

    setFormData({
      id: delegate.id,
      numberOrSign: delegate.numberOrSign || "",
      fromUserId: delegate.fromUserId || -1,
      toUserId: delegate.toUserId || -1,
      startDate: delegate.startDate,
      endDate: delegate.endDate,
    });

    // Set dates
    const startDate = delegate.startDate
      ? new Date(delegate.startDate)
      : new Date();
    const endDate = delegate.endDate ? new Date(delegate.endDate) : new Date();
    setDateStates({
      startDate,
      endDate,
    });

    // Set existing attachments
    setExistingAttachments(delegate.attachments || []);

    // Check delegate status
    const currentTime = new Date().getTime();
    const startTime = new Date(delegate.startDate || "").getTime();
    const endTime = new Date(delegate.endDate || "").getTime();

    if (startTime > currentTime) {
      setIsDelegateProcessing(false);
      setIsDelegateEnding(false);
    } else {
      setIsDelegateProcessing(true);
      setIsDelegateEnding(false);
    }
    if (currentTime > endTime) {
      setIsDelegateEnding(true);
      setIsDelegateProcessing(false);
    }

    // Load to user list
    if (delegate.fromUserId) {
      DelegateService.getDelegateToUserList(delegate.fromUserId).then(
        (users) => {
          setDelegateToUserList(users);
        }
      );
    }
  }, [delegate]);

  const initNewDelegate = useCallback(() => {
    setFormData({
      numberOrSign: "",
      fromUserId: user?.id || -1,
      toUserId: -1,
      startDate: null,
      endDate: null,
    });
    setDateStates({
      startDate: new Date(),
      endDate: new Date(),
    });
    setSelectedFiles([]);
    setExistingAttachments([]);
    setIsChangeAttachment(false);
    setIsDelegateProcessing(false);
    setIsDelegateEnding(false);
    setValidation({
      numberOrSign: true,
      fromUserId: true,
      toUserId: true,
      files: true,
    });

    // Load to user list for current user
    if (user?.id) {
      DelegateService.getDelegateToUserList(user.id).then((users) => {
        setDelegateToUserList(users);
      });
    }
  }, [user]);

  const handleFromUserChange = useCallback(async (value: string | string[]) => {
    const userId = Array.isArray(value) ? Number(value[0]) : Number(value);
    setFormData((prev) => ({ ...prev, fromUserId: userId, toUserId: -1 }));
    if (userId && userId !== -1) {
      try {
        const users = await DelegateService.getDelegateToUserList(userId);
        setDelegateToUserList(users);
      } catch (error: any) {
        ToastUtils.error("Không thể tải danh sách người được ủy quyền");
      }
    }
  }, []);

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      // Validate file size
      const maxSize = Constant.MAX_SIZE_FILE_UPLOAD || 3000 * 1024 * 1024;
      const invalidFiles = Array.from(files).filter(
        (file) => file.size > maxSize
      );
      if (invalidFiles.length > 0) {
        ToastUtils.error("Kích thước file vượt quá giới hạn cho phép");
        e.target.value = "";
        return;
      }

      if (isEdit) {
        setIsChangeAttachment(true);
      }

      const newFiles = Array.from(files);
      setSelectedFiles((prev) => {
        const combined = [...prev];
        newFiles.forEach((newFile) => {
          const exists = combined.some(
            (f) => f.name === newFile.name && f.size === newFile.size
          );
          if (!exists) {
            combined.push(newFile);
          }
        });
        return combined;
      });

      e.target.value = "";
    },
    [isEdit]
  );

  const handleRemoveFile = useCallback(
    (index: number) => {
      if (isEdit) {
        setIsChangeAttachment(true);
      }
      setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    },
    [isEdit]
  );

  const validateForm = useCallback((): boolean => {
    const valid = {
      numberOrSign: (formData.numberOrSign || "").trim().length > 0,
      fromUserId:
        formData.fromUserId !== undefined && formData.fromUserId !== -1,
      toUserId: formData.toUserId !== undefined && formData.toUserId !== -1,
      files: true,
    };

    setValidation(valid);
    return Object.values(valid).every((v) => v);
  }, [formData.numberOrSign, formData.fromUserId, formData.toUserId]);

  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      ToastUtils.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    setLoading(true);
    try {
      const formDataToSend = new FormData();

      if (isEdit && delegate?.id) {
        // Update mode
        if (isDelegateProcessing && !isDelegateEnding) {
          // Can only update end date and attachments for active delegate
          formDataToSend.append("delegateId", delegate.id.toString());
          formDataToSend.append(
            "numberOrSign",
            formData.numberOrSign?.toString() || ""
          );
          if (dateStates.endDate) {
            formDataToSend.append(
              "endDate",
              dateStates.endDate.toISOString().split("T")[0]
            );
          }
          if (isChangeAttachment && selectedFiles.length > 0) {
            selectedFiles.forEach((file) => {
              formDataToSend.append("files", file);
            });
          }
        } else {
          // Can update all fields
          formDataToSend.append("delegateId", delegate.id.toString());
          formDataToSend.append(
            "numberOrSign",
            formData.numberOrSign?.toString() || ""
          );
          formDataToSend.append(
            "fromUserId",
            formData.fromUserId?.toString() || ""
          );
          formDataToSend.append(
            "toUserId",
            formData.toUserId?.toString() || ""
          );
          if (dateStates.startDate) {
            formDataToSend.append(
              "startDate",
              dateStates.startDate.toISOString().split("T")[0]
            );
          }
          if (dateStates.endDate) {
            formDataToSend.append(
              "endDate",
              dateStates.endDate.toISOString().split("T")[0]
            );
          }
          if (isChangeAttachment && selectedFiles.length > 0) {
            selectedFiles.forEach((file) => {
              formDataToSend.append("files", file);
            });
          }
        }
        await DelegateService.updateDelegate(formDataToSend);
        ToastUtils.success("Cập nhật ủy quyền thành công!");
      } else {
        // Add mode
        formDataToSend.append(
          "numberOrSign",
          formData.numberOrSign?.toString() || ""
        );
        formDataToSend.append(
          "fromUserId",
          formData.fromUserId?.toString() || ""
        );
        formDataToSend.append("toUserId", formData.toUserId?.toString() || "");
        if (dateStates.startDate) {
          formDataToSend.append(
            "startDate",
            dateStates.startDate.toISOString().split("T")[0]
          );
        }
        if (dateStates.endDate) {
          formDataToSend.append(
            "endDate",
            dateStates.endDate.toISOString().split("T")[0]
          );
        }
        if (selectedFiles.length > 0) {
          selectedFiles.forEach((file) => {
            formDataToSend.append("files", file);
          });
        }
        await DelegateService.addDelegate(formDataToSend);
        ToastUtils.success("Thêm mới ủy quyền thành công!");
      }

      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      ToastUtils.error(error?.message || "Không thể lưu ủy quyền");
    } finally {
      setLoading(false);
    }
  }, [
    validateForm,
    isEdit,
    delegate?.id,
    isDelegateProcessing,
    isDelegateEnding,
    formData.numberOrSign,
    formData.fromUserId,
    formData.toUserId,
    dateStates.startDate,
    dateStates.endDate,
    isChangeAttachment,
    selectedFiles,
    onSuccess,
    onOpenChange,
  ]);

  // Avoid rendering heavy dialog tree when closed
  if (!isOpen) return null;

  const getFileSizeString = (size: number): string => {
    const KB = size / 1024;
    const MB = KB / 1024;
    if (MB >= 0.1) {
      return `${MB.toFixed(2)} MB`;
    }
    if (KB > 0) {
      return `${KB.toFixed(2)} KB`;
    }
    return "";
  };

  const isDisabled = isEdit && isDelegateEnding;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Cập nhật ủy quyền" : "Thêm mới ủy quyền"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Number or Sign */}
          <div>
            <Label className="font-bold">
              Số văn bản ủy quyền <span className="text-red-500">*</span>
            </Label>
            <Input
              value={formData.numberOrSign || ""}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  numberOrSign: e.target.value,
                }))
              }
              placeholder="Số văn bản ủy quyền"
              disabled={isDisabled}
              maxLength={100}
            />
            {!validation.numberOrSign && (
              <p className="text-sm text-red-500 mt-1">
                Số văn bản ủy quyền không được để trống.
              </p>
            )}
          </div>

          {/* From User */}
          <div>
            {Constant.USE_DELEGATE_FROM_USER_LIST || isVanThuBan ? (
              <>
                <Label className="font-bold">
                  Người ủy quyền <span className="text-red-500">*</span>
                </Label>
                <div className="flex-1 min-w-0">
                  <SelectCustom
                    options={userList.map((u) => ({
                      id: String(u.id),
                      name: u.fullName,
                    }))}
                    value={String(formData.fromUserId || -1)}
                    onChange={handleFromUserChange}
                    disabled={
                      isDisabled ||
                      (isEdit && (isDelegateEnding || isDelegateProcessing))
                    }
                    className=""
                    valueClassName="font-bold text-black"
                    placeholder="Chọn người ủy quyền"
                  />
                </div>
                {!validation.fromUserId && (
                  <p className="text-sm text-red-500 mt-1">
                    Người ủy quyền không được để trống.
                  </p>
                )}
              </>
            ) : (
              <>
                <Label className="font-bold">Người ủy quyền</Label>
                <Input value={user?.fullName || ""} disabled />
              </>
            )}
          </div>

          {/* To User */}
          <div>
            <Label className="font-bold">
              Người được ủy quyền <span className="text-red-500">*</span>
            </Label>
            <SelectCustom
              options={delegateToUserList.map((u) => ({
                id: String(u.id),
                name: u.fullName,
              }))}
              value={String(formData.toUserId || -1)}
              onChange={(value) => {
                const userId = Array.isArray(value)
                  ? Number(value[0])
                  : Number(value);
                setFormData((prev) => ({ ...prev, toUserId: userId }));
              }}
              disabled={
                isDisabled ||
                (isEdit && (isDelegateEnding || isDelegateProcessing)) ||
                !formData.fromUserId ||
                formData.fromUserId === -1
              }
              placeholder="Chọn người được ủy quyền"
            />
            {!validation.toUserId && (
              <p className="text-sm text-red-500 mt-1">
                Người được ủy quyền không được để trống.
              </p>
            )}
          </div>

          {/* Start Date */}
          <div>
            <Label className="font-bold">Ngày bắt đầu</Label>
            <CustomDatePicker
              selected={dateStates.startDate}
              onChange={(date) => {
                setDateStates((prev) => ({ ...prev, startDate: date }));
                if (date && dateStates.endDate && date > dateStates.endDate) {
                  setDateStates((prev) => ({ ...prev, endDate: date }));
                }
              }}
              placeholder="Chọn ngày bắt đầu"
              disabledFuture={false}
              showClearButton={false}
              min={new Date().toISOString().split("T")[0]}
            />
          </div>

          {/* End Date */}
          <div>
            <Label className="font-bold">Ngày kết thúc</Label>
            <CustomDatePicker
              selected={dateStates.endDate}
              onChange={(date) => {
                if (
                  date &&
                  dateStates.startDate &&
                  date < dateStates.startDate
                ) {
                  ToastUtils.warning(
                    "Ngày kết thúc phải lớn hơn hoặc bằng ngày bắt đầu"
                  );
                  return;
                }
                setDateStates((prev) => ({ ...prev, endDate: date }));
              }}
              placeholder="Chọn ngày kết thúc"
              disabledFuture={false}
              showClearButton={false}
              min={
                (dateStates.startDate || new Date()).toISOString().split("T")[0]
              }
            />
          </div>

          {/* File Upload */}
          <div>
            <Label className="font-bold">Văn bản đính kèm</Label>
            <div className="mt-2">
              <input
                type="file"
                id="file-upload"
                multiple
                onChange={handleFileSelect}
                disabled={isDisabled}
                className="hidden"
              />
              <label
                htmlFor="file-upload"
                className={`inline-flex items-center px-4 py-2 rounded-md bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium cursor-pointer ${
                  isDisabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                <Upload className="w-4 h-4 mr-2" />
                Chọn file
              </label>
            </div>

            {/* Existing attachments */}
            {existingAttachments.length > 0 && (
              <div className="mt-2 space-y-1">
                {existingAttachments.map((attachment, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <span className="text-sm">
                      {attachment.displayName || attachment.name} (
                      {attachment.size
                        ? getFileSizeString(attachment.size)
                        : ""}
                      )
                    </span>
                    {isDisabled ? (
                      <X className="w-4 h-4 text-gray-400" />
                    ) : (
                      <button
                        onClick={() => {
                          setExistingAttachments((prev) =>
                            prev.filter((_, i) => i !== idx)
                          );
                          if (isEdit) setIsChangeAttachment(true);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Selected files */}
            {selectedFiles.length > 0 && (
              <div className="mt-2 space-y-1">
                {selectedFiles.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2 bg-gray-50 rounded"
                  >
                    <span className="text-sm">
                      {file.name} ({getFileSizeString(file.size)})
                    </span>
                    {isDisabled ? (
                      <X className="w-4 h-4 text-gray-400" />
                    ) : (
                      <button
                        onClick={() => handleRemoveFile(idx)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleSave}
            disabled={loading || isDisabled}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {!loading && <Save className="w-4 h-4 mr-2" />}
            {loading ? "Đang lưu..." : "Lưu"}
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            <X className="w-4 h-4 mr-2" />
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export const DelegateModal = React.memo(DelegateModalInner);
