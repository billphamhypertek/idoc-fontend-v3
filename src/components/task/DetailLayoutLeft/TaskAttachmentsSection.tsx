"use client";

import React, { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Paperclip,
  Download,
  Eye,
  Key,
  Trash2,
  Share,
  Plus,
  X,
  KeyRound,
} from "lucide-react";
import { canViewNoStatus, getAssetIcon, orginName } from "@/utils/common.utils";
import { useFileViewer } from "@/hooks/useFileViewer";
import {
  getFileSizeString,
  isViewableFile,
  validFileSize,
  isExistFile,
  viewFile,
} from "@/utils/file.utils";
import { downloadFile, doOpenShare } from "@/utils/file.utils";
import { TaskService } from "@/services/task.service";
import { handleError } from "@/utils/common.utils";
import { Constant } from "@/definitions/constants/constant";
import { toast } from "@/hooks/use-toast";
import { SelectTemplateDialog } from "@/components/common/SelectTemplateDialog";
import { queryKeys } from "@/definitions/constants/queryKey.constants";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SharedUser from "@/components/document-out/SharedUser";
import { CERT_OBJ_TYPE } from "@/definitions/enums/document.enum";
import { ToastUtils } from "@/utils/toast.utils";
import { TaskV2Service } from "@/services/taskv2.service";

interface TaskAttachmentsSectionProps {
  data: any;
  isEditing: boolean;
  checkUserAssign: () => boolean;
  form: UseFormReturn<any>;
  isV2?: boolean;
}

export default function TaskAttachmentsSection({
  data,
  isEditing,
  checkUserAssign,
  form,
  isV2 = false,
}: TaskAttachmentsSectionProps) {
  const ENCRYPTION_TWD = Constant.ENCRYPTION_TWD;
  const [selectedTaskFiles, setSelectedTaskFiles] = useState<any[]>([]);
  const [isSelectTemplateOpen, setIsSelectTemplateOpen] = useState(false);
  const [showSharedUserModal, setShowSharedUserModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [validFileAttr, setValidFileAttr] = useState({
    validFiles: true,
    isValidFileSize: true,
    isValidExtension: true,
    isValidNumberOfFiles: true,
    currentNumberOfFiles: 0,
  });

  // const { viewFile } = useFileViewer();
  const queryClient = useQueryClient();
  const canEdit = isEditing && checkUserAssign();

  // Sync selectedTaskFiles with form
  useEffect(() => {
    if (data?.attachments) {
      setSelectedTaskFiles(data.attachments);
    }
  }, [data?.attachments]);

  // File handling utilities

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    if (!validFileSize(files)) {
      setValidFileAttr((prev) => ({
        ...prev,
        validFiles: false,
        isValidFileSize: false,
      }));
      return;
    }

    const newFiles = Array.from(files).filter(
      (file) => !isExistFile(file.name, selectedTaskFiles)
    );

    const updatedFiles = [...selectedTaskFiles, ...newFiles];

    setSelectedTaskFiles(updatedFiles);
    setValidFileAttr((prev) => ({
      ...prev,
      validFiles: true,
      isValidFileSize: true,
    }));

    form.setValue("attachments", updatedFiles);

    // Reset input
    event.target.value = "";
  };

  const handleRemoveTaskFile = async (file: any) => {
    if (file.id) {
      try {
        if (isV2) {
          await TaskV2Service.doDeleteTaskAttV2(file.id);
        } else {
          await TaskService.doDeleteTaskAtt(file.id);
        }
        ToastUtils.success("Xóa tệp đính kèm thành công");
        if (isV2) {
          queryClient.invalidateQueries({
            queryKey: [queryKeys.taskv2.getFindByIdTask, data.id],
          });
        } else {
          queryClient.invalidateQueries({
            queryKey: [queryKeys.task.getFindByIdTask, data.id],
          });
        }
      } catch (error) {
        handleError(error);
      }
    } else {
      const updatedFiles = selectedTaskFiles.filter((f) => f !== file);
      setSelectedTaskFiles(updatedFiles);
      form.setValue("attachments", updatedFiles);
    }
  };

  const handleDownloadFile = async (file: any) => {
    try {
      await downloadFile(
        file.name,
        Constant.ATTACHMENT_DOWNLOAD_TYPE.TASK,
        file.encrypt,
        null,
        null,
        isV2
      );
    } catch (error) {
      handleError(error);
    }
  };

  const handleViewFile = async (file: any) => {
    try {
      await viewFile(file, Constant.ATTACHMENT_DOWNLOAD_TYPE.TASK_2);
    } catch (error) {
      handleError(error);
    }
  };

  const isViewFile = (file: any) => {
    return canViewNoStatus(file.name) && !file.oEncrypt;
  };

  const handleChangeFileEncrypt = (file: any) => {
    if (!(file.id && file.oEncrypt)) {
      file.encrypt = !file.encrypt;
      setSelectedTaskFiles((prev) => [...prev]);
    }
  };

  const handleSelectTemplate = (template: any) => {
    template.template = true;
    const updatedFiles = [...selectedTaskFiles, template];
    setSelectedTaskFiles(updatedFiles);
    form.setValue("attachments", updatedFiles);
  };

  return (
    <div className="col-span-full">
      <div className="space-y-2">
        <Label className="text-md font-bold">Danh sách tệp đính kèm</Label>

        {/* Edit Mode: có quyền chỉnh sửa */}
        {canEdit && (
          <div className="space-y-2">
            <div className="flex gap-2">
              <Button
                className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm bg-green-500 text-white hover:bg-green-600"
                onClick={() => document.getElementById("upload-photo")?.click()}
              >
                <Paperclip className="w-4 h-4 mr-1" />
                Chọn tệp
              </Button>
              <Button
                className="inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm bg-green-500 text-white hover:bg-green-600"
                onClick={() => setIsSelectTemplateOpen(true)}
              >
                <Plus className="w-4 h-4 mr-1" />
                Chọn mẫu
              </Button>
              <Input
                id="upload-photo"
                type="file"
                name="attachments"
                multiple
                accept="*/*"
                className="hidden"
                onChange={handleFileUpload}
              />
            </div>

            {/* Display files */}
            <div className="space-y-2 ml-2">
              {selectedTaskFiles.map((file: any, index: number) => (
                <div
                  key={index}
                  className="flex justify-between items-center rounded p-2 border"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={getAssetIcon(file.name)}
                      alt="file icon"
                      className="w-4 h-4"
                    />
                    <span className="text-sm">
                      {orginName(file.name)} ({getFileSizeString(file.size)})
                    </span>
                  </div>
                  <div className="flex gap-1">
                    {/* Download button - không hiển thị cho viewable files */}
                    {!isViewFile(file) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleDownloadFile(file)}
                        title="Tải xuống"
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    )}

                    {/* View button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleViewFile(file)}
                      title="Xem tệp đính kèm"
                    >
                      <Eye className="w-4 h-4" />
                    </Button>

                    {/* Encryption toggle */}
                    {ENCRYPTION_TWD && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleChangeFileEncrypt(file)}
                        disabled={file.id && file.oEncrypt}
                        title="Mã hóa tệp tin"
                      >
                        <KeyRound
                          className={`w-4 h-4 ${file.encrypt ? "text-red-500" : "text-gray-400"}`}
                        />
                      </Button>
                    )}

                    {/* Share button - chỉ hiển thị cho encrypted files đã save */}
                    {file.encrypt && file.id && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => {
                          setSelectedFile(file);
                          setShowSharedUserModal(true);
                        }}
                        title="Chia sẻ tệp đính kèm"
                      >
                        <Share className="w-4 h-4" />
                      </Button>
                    )}

                    {/* Remove button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleRemoveTaskFile(file)}
                      title="Xóa"
                    >
                      <X className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {/* File validation errors */}
            {!validFileAttr.validFiles && (
              <div className="text-red-500 text-sm">
                {!validFileAttr.isValidFileSize && (
                  <p>Dung lượng file phải nhỏ hơn 300MB.</p>
                )}
                {!validFileAttr.isValidExtension && (
                  <p>File không đúng định dạng.</p>
                )}
              </div>
            )}
          </div>
        )}

        {!canEdit && (
          <div className="space-y-2 ml-2">
            {data?.attachments && data.attachments.length > 0 ? (
              data.attachments.map((file: any, index: number) => (
                <div
                  key={index}
                  className="flex justify-between items-center rounded p-2 border"
                >
                  <div className="flex items-center gap-2">
                    <img
                      src={getAssetIcon(file.name)}
                      alt="file icon"
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{orginName(file.name)}</span>
                  </div>
                  <div className="flex gap-1">
                    {/* Download button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => handleDownloadFile(file)}
                      title="Tải xuống"
                    >
                      <Download className="w-4 h-4" />
                    </Button>

                    {/* View button - chỉ hiển thị cho viewable files */}
                    {isViewFile(file) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => handleViewFile(file)}
                        title="Xem tệp đính kèm"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    )}

                    {/* Encryption indicator (readonly) */}
                    {ENCRYPTION_TWD && (
                      <Button
                        title="Mã hóa tệp tin"
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                      >
                        <KeyRound
                          className={`w-4 h-4 ${file.encrypt ? "text-red-500" : "text-gray-400"}`}
                        />
                      </Button>
                    )}

                    {/* Share button - chỉ hiển thị cho encrypted files */}
                    {file.encrypt && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => {
                          setSelectedFile(file);
                          setShowSharedUserModal(true);
                        }}
                        title="Chia sẻ tệp đính kèm"
                      >
                        <Share className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-gray-500 -ml-2">
                Không có tệp đính kèm
              </p>
            )}
          </div>
        )}
      </div>

      {/* SelectTemplateDialog */}
      <SelectTemplateDialog
        isOpen={isSelectTemplateOpen}
        onOpenChange={setIsSelectTemplateOpen}
        onClose={() => setIsSelectTemplateOpen(false)}
        setData={handleSelectTemplate}
        type={Constant.TYPE_TEMPLATE.GIAO_VIEC}
      />

      <Dialog open={showSharedUserModal} onOpenChange={setShowSharedUserModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chia sẻ người dùng</DialogTitle>
          </DialogHeader>
          <SharedUser
            fileNames={selectedFile?.name || ""}
            docId={data?.id}
            type={CERT_OBJ_TYPE.task}
            onClose={() => setShowSharedUserModal(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}
