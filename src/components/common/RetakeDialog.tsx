"use client";

import React, { useState, useRef } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  CustomDialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload, X, Key, Share } from "lucide-react";
import { handleError, isExistFile } from "@/utils/common.utils";
import { getFileSizeString } from "@/utils/file.utils";
import { toast } from "@/hooks/use-toast";
import { Constant } from "@/definitions/constants/constant";
import { doSharePermissionDocFile } from "@/services/file.service";
import { ToastUtils } from "@/utils/toast.utils";

interface FileWithEncrypt extends File {
  encrypt?: boolean;
  displayName?: string;
}

interface RetakeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  docId: string;
  isEvaluate?: boolean;
  onRetake?: (
    docId: string,
    comment: { comment: string; attachments: FileWithEncrypt[] }
  ) => void;
}

export default function RetakeDialog({
  isOpen,
  onOpenChange,
  docId,
  isEvaluate = false,
  onRetake,
}: RetakeDialogProps) {
  const [comment, setComment] = useState<string>("");
  const [attachments, setAttachments] = useState<FileWithEncrypt[]>([]);
  const [validFiles, setValidFiles] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      setComment("");
      setAttachments([]);
      setValidFiles(true);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  const handleSelectFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const maxSize = 300 * 1024 * 1024; // 300MB
    const oversizedFiles = Array.from(files).filter(
      (file) => file.size > maxSize
    );

    if (oversizedFiles.length > 0) {
      setValidFiles(false);
      ToastUtils.fileSizeMustBeLessThan300MB();
      event.target.value = "";
      return;
    }

    setValidFiles(true);

    const newFiles: FileWithEncrypt[] = [];
    for (const file of Array.from(files)) {
      if (!isExistFile(file.name, attachments)) {
        const fileWithEncrypt: FileWithEncrypt = file;
        fileWithEncrypt.encrypt = false;
        fileWithEncrypt.displayName = file.name;
        newFiles.push(fileWithEncrypt);
      }
    }
    setAttachments((prev) => [...prev, ...newFiles]);
    event.target.value = "";
  };

  const handleRemoveFile = (index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const changeEncrypt = (index: number) => {
    setAttachments((prev) =>
      prev.map((file, i) =>
        i === index ? { ...file, encrypt: !file.encrypt } : file
      )
    );
  };

  const handleRetakeDocument = async () => {
    if (!comment && attachments.length > 0) {
      ToastUtils.documentRetakeError();
      return;
    }

    setIsSubmitting(true);

    try {
      const data = {
        objId: docId,
        files: attachments,
        comment: comment,
        userIdShared: [],
        allFileNames: [],
        attType: "doc_in_add",
        cmtType: "VAN_BAN_DEN_CMT",
        objType: "doc_in_done",
        userOrobj: "org",
        checkObjEnc: false,
      };

      const rs = await doSharePermissionDocFile(data);
      if (rs === false) {
        setIsSubmitting(false);
        return;
      }

      onRetake?.(docId, {
        comment: comment,
        attachments: attachments,
      });

      onOpenChange(false);
    } catch (error) {
      handleError(error);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  const isSubmitDisabled = (!comment && attachments.length > 0) || isSubmitting;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <CustomDialogContent className="sm:max-w-2xl">
        <DialogHeader className="bg-red-600 text-white -m-6 mb-0 p-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-white">Thu hồi</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-white hover:bg-red-700 p-1 h-auto"
              disabled={isSubmitting}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label
              htmlFor="retakeComment"
              className="text-sm font-bold text-gray-900 mb-3 block"
            >
              Lý do thu hồi
            </Label>
            <Textarea
              id="retakeComment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Nhập lý do thu hồi..."
              required
            />
            {!comment && attachments.length > 0 && (
              <p className="text-red-500 text-sm">
                Phải nhập lý do thu hồi khi có tệp đính kèm.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="retakeFileUpload" className="cursor-pointer">
              <Upload className="inline-block w-4 h-4 mr-2" /> Chọn tệp
            </Label>
            <input
              id="retakeFileUpload"
              ref={fileInputRef}
              hidden
              type="file"
              multiple
              onChange={handleSelectFiles}
              disabled={isSubmitting}
            />
            {!validFiles && (
              <p className="text-red-500 text-sm">
                Kích thước tệp không hợp lệ hoặc định dạng không được hỗ trợ.
              </p>
            )}

            {attachments.length > 0 && (
              <div className="space-y-2">
                {attachments.map((file, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between p-2 border rounded"
                  >
                    <div className="flex items-center space-x-2">
                      {Constant.ENCRYPTION_TWD && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => changeEncrypt(i)}
                          className="p-1 h-auto"
                          title="Mã hóa tệp tin"
                        >
                          <Key
                            className={`w-4 h-4 ${file.encrypt ? "text-red-500" : "text-gray-400"}`}
                          />
                        </Button>
                      )}
                      <span className="text-sm">
                        {file.displayName || file.name} (
                        {getFileSizeString(file.size)})
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoveFile(i)}
                      className="p-1 h-auto text-red-500 hover:bg-red-50"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="flex justify-end gap-2 pt-4 border-t">
          <Button
            type="button"
            onClick={handleRetakeDocument}
            disabled={isSubmitDisabled}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Share className="w-4 h-4 mr-2" /> Thu hồi
          </Button>
        </DialogFooter>
      </CustomDialogContent>
    </Dialog>
  );
}
