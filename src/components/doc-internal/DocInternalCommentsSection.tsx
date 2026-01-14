"use client";
import { UserIcon } from "@/components/common/icon";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Constant } from "@/definitions/constants/constant";
import { uploadFileService } from "@/services/file.service";
import { timeFrom } from "@/utils/common.utils";
import { isView as canViewFile } from "@/utils/file.utils";
import { ToastUtils } from "@/utils/toast.utils";
import { KeyRound, Paperclip, Send, Share, X } from "lucide-react";
import React, {
  forwardRef,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

type CommentItem = {
  id?: number;
  userFullName?: string;
  userPosition?: string;
  createDate?: string;
  comment?: string;
  isToken?: boolean;
  internalAttachments?: Array<{
    id: number;
    name: string;
    displayName: string;
    encrypt?: boolean;
    oEncrypt?: boolean;
  }>;
};

type DocInternalCommentsSectionProps = {
  docId?: number;
  comments?: CommentItem[];
  allowedComment?: boolean;
  onSubmitComment?: (comment: string, files: File[], encrypt: boolean) => void;
  isSubmitting?: boolean;
  onOpenShare?: (file: any) => void;
};

export type DocInternalCommentsSectionRef = {
  clearCommentForm: () => void;
};

const DocInternalCommentsSection = forwardRef<
  DocInternalCommentsSectionRef,
  DocInternalCommentsSectionProps
>(
  (
    {
      docId,
      comments = [],
      allowedComment = false,
      onSubmitComment,
      isSubmitting = false,
      onOpenShare,
    },
    ref
  ) => {
    const [commentText, setCommentText] = useState("");
    const [commentFiles, setCommentFiles] = useState<File[]>([]);
    const [encrypt, setEncrypt] = useState(false);
    const [validFileAttr, setValidFileAttr] = useState({
      validFiles: true,
      isValidFileSize: true,
      isValidExtension: true,
      isValidNumberOfFiles: true,
    });
    const fileInputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => ({
      clearCommentForm: () => {
        setCommentText("");
        setCommentFiles([]);
        setEncrypt(false);
        setValidFileAttr({
          validFiles: true,
          isValidFileSize: true,
          isValidExtension: true,
          isValidNumberOfFiles: true,
        });
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      },
    }));

    const handleSubmit = () => {
      // Validate: comment must have at least one character (trim whitespace)
      const trimmed = commentText.trim();
      if (!trimmed || trimmed.length === 0) {
        ToastUtils.error("Nội dung ý kiến phải chứa ít nhất 1 ký tự");
        return;
      }
      if (trimmed.length > 2000) {
        ToastUtils.error("Nội dung không được dài quá 2000 ký tự");
        return;
      }
      if (!validFileAttr.validFiles) {
        return;
      }
      onSubmitComment?.(trimmed, commentFiles, encrypt);
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = Array.from(event.target.files || []);
      if (selectedFiles.length === 0) return;

      // Get allowed extensions array
      const allowedExtensions = Constant.ALLOWED_FILE_EXTENSION.toLowerCase()
        .split(",")
        .map((ext) => ext.trim());

      // Validate file extensions
      const invalidFiles = selectedFiles.filter((file) => {
        const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
        return !allowedExtensions.includes(extension);
      });
      if (invalidFiles.length > 0) {
        setValidFileAttr({
          ...validFileAttr,
          isValidExtension: false,
          validFiles: false,
        });
        ToastUtils.error("File không đúng định dạng");
        event.target.value = "";
        return;
      }

      // Validate file sizes (max 300MB per file)
      const oversizedFiles = selectedFiles.filter(
        (file) => file.size > 300 * 1024 * 1024
      );
      if (oversizedFiles.length > 0) {
        setValidFileAttr({
          ...validFileAttr,
          isValidFileSize: false,
          validFiles: false,
        });
        ToastUtils.error("Dung lượng file phải nhỏ hơn 300MB");
        event.target.value = "";
        return;
      }

      // Validate total number of files
      const totalFiles = commentFiles.length + selectedFiles.length;
      if (totalFiles > Constant.MAX_FILES_UPLOAD) {
        setValidFileAttr({
          ...validFileAttr,
          isValidNumberOfFiles: false,
          validFiles: false,
        });
        ToastUtils.error(
          `Không được tải lên quá ${Constant.MAX_FILES_UPLOAD} tệp`
        );
        event.target.value = "";
        return;
      }

      // Add files (avoid duplicates by name)
      const existingNames = new Set(commentFiles.map((f) => f.name));
      const newFiles = selectedFiles.filter((f) => !existingNames.has(f.name));
      setCommentFiles([...commentFiles, ...newFiles]);
      setValidFileAttr({
        validFiles: true,
        isValidFileSize: true,
        isValidExtension: true,
        isValidNumberOfFiles: true,
      });
      event.target.value = "";
    };

    const handleRemoveFile = (index: number) => {
      const updated = [...commentFiles];
      updated.splice(index, 1);
      setCommentFiles(updated);
      // Reset encrypt if no files
      if (updated.length === 0) {
        setEncrypt(false);
      }
    };

    const handleChangeEncrypt = () => {
      if (commentFiles.length === 0) {
        ToastUtils.warning("Vui lòng chọn tệp tin trước khi bật mã hóa");
        return;
      }
      setEncrypt(!encrypt);
    };

    const onClickFile = async (file: any) => {
      try {
        // Normalize encryption flag
        const encrypted = Boolean(file?.encrypt || file?.oEncrypt);
        const normalizedFile = { ...file, encrypt: encrypted };
        if (encrypted || !canViewFile(normalizedFile)) {
          // Download encrypted or non-viewable files
          await uploadFileService.downloadFile(
            String(normalizedFile.id),
            Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_INTERNAL,
            encrypted,
            String(normalizedFile.id),
            null
          );
        } else {
          // View non-encrypted viewable files
          await uploadFileService.viewFile(
            normalizedFile,
            Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_INTERNAL
          );
        }
      } catch (e) {
        console.error("Error with file:", e);
        ToastUtils.khongTheMoTepTin();
      }
    };

    const formatPassTime = (date: string) => {
      if (!date) return "";
      try {
        const formatted = timeFrom(new Date(date));
        // Convert English relative time to Vietnamese
        return formatted
          .replace(/a few seconds ago/gi, "vài giây trước")
          .replace(/(\d+) seconds? ago/gi, "$1 giây trước")
          .replace(/a minute ago/gi, "1 phút trước")
          .replace(/(\d+) minutes? ago/gi, "$1 phút trước")
          .replace(/an hour ago/gi, "1 giờ trước")
          .replace(/(\d+) hours? ago/gi, "$1 giờ trước")
          .replace(/a day ago/gi, "1 ngày trước")
          .replace(/(\d+) days? ago/gi, "$1 ngày trước")
          .replace(/a month ago/gi, "1 tháng trước")
          .replace(/(\d+) months? ago/gi, "$1 tháng trước")
          .replace(/a year ago/gi, "1 năm trước")
          .replace(/(\d+) years? ago/gi, "$1 năm trước");
      } catch {
        return new Date(date).toLocaleString("vi-VN", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      }
    };

    const ENCRYPTION_TWD = Constant.ENCRYPTION_TWD || false;

    return (
      <>
        {allowedComment && (
          <>
            <div className="bg-white border border-gray-200 rounded-md shadow-sm">
              <div className="border-b border-gray-200 px-4 py-3 bg-gray-50">
                <h3 className="text-base font-semibold text-blue-600 m-0">
                  Ý kiến xử lý
                </h3>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="w-full">
                    <Textarea
                      id="comment-content"
                      name="comment"
                      placeholder="Nhập nội dung ý kiến"
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      rows={3}
                      className="min-h-[60px] text-sm resize-none overflow-hidden"
                      style={{ height: "25px", padding: "16px" }}
                    />
                    {!validFileAttr.validFiles && (
                      <div className="text-red-600 text-xs mt-1 space-y-0.5">
                        {!validFileAttr.isValidFileSize && (
                          <p>Dung lượng file phải nhỏ hơn 300MB.</p>
                        )}
                        {!validFileAttr.isValidExtension && (
                          <p>File không đúng định dạng.</p>
                        )}
                        {!validFileAttr.isValidNumberOfFiles && (
                          <p>
                            Không được tải lên quá {Constant.MAX_FILES_UPLOAD}{" "}
                            tệp.
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    {ENCRYPTION_TWD && (
                      <div className="flex items-center gap-2 mr-auto">
                        <label className="text-xs text-gray-600 font-bold">
                          Mã hóa tệp tin
                        </label>
                        <button
                          type="button"
                          onClick={handleChangeEncrypt}
                          className={`cursor-pointer transition-all ${
                            commentFiles.length === 0
                              ? "opacity-50 cursor-not-allowed"
                              : "hover:scale-110"
                          }`}
                          title={
                            commentFiles.length === 0
                              ? "Vui lòng chọn tệp tin trước"
                              : "Mã hóa tệp tin"
                          }
                          disabled={commentFiles.length === 0}
                        >
                          <KeyRound
                            className={`w-4 h-4 ${
                              encrypt ? "text-red-600" : "text-gray-400"
                            }`}
                          />
                        </button>
                      </div>
                    )}
                    <label
                      htmlFor="upload-photo"
                      className="cursor-pointer text-blue-600 hover:text-blue-700 p-1"
                      title="Đính kèm tệp"
                    >
                      <Paperclip className="w-5 h-5" />
                    </label>
                    <input
                      id="upload-photo"
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      accept={Constant.ALLOWED_FILE_EXTENSION}
                      onChange={handleFileSelect}
                    />
                    <Button
                      onClick={handleSubmit}
                      size="sm"
                      disabled={
                        isSubmitting ||
                        !commentText.trim() ||
                        !validFileAttr.validFiles
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Send className="w-4 h-4 mr-1" />
                      {isSubmitting ? "Đang gửi..." : "Gửi ý kiến"}
                    </Button>
                  </div>

                  {commentFiles.length > 0 && (
                    <div className="space-y-2">
                      {commentFiles.map((file, idx) => (
                        <div key={`${file.name}-${idx}`} className="w-full">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-700 flex-1">
                              {file.name}
                            </span>
                            <button
                              type="button"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleRemoveFile(idx)}
                              title="Xóa tệp"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="my-4"></div>
          </>
        )}

        <div className="bg-white border border-gray-200 rounded-md shadow-sm">
          <div className="border-b border-gray-200 px-4 py-3 bg-gray-50">
            <h3 className="text-base font-semibold text-blue-600 m-0">
              Lịch sử ý kiến
            </h3>
          </div>
          <div className="body-history">
            {comments && comments.length > 0 ? (
              <>
                {comments.map((cmt, idx) => (
                  <div key={idx} className="p-1">
                    <div className="flex gap-3 my-2">
                      <div className="w-12 flex flex-col items-center pt-1 relative">
                        <UserIcon />
                        {cmt.isToken && (
                          <img
                            src="/v3/assets/images/usb-token.png"
                            className="absolute top-0 right-0 w-5 h-5"
                            alt="Token"
                          />
                        )}
                      </div>
                      <div className="flex-1 min-w-0 self-center">
                        <div>
                          <span className="font-bold text-gray-900">
                            {cmt.userFullName}
                          </span>
                          {cmt.userFullName && cmt.userFullName.length > 0 && (
                            <span className="font-bold text-gray-900">
                              {" "}
                              ({cmt.userPosition || ""}):
                            </span>
                          )}
                          <br />
                          <span className="whitespace-pre-wrap break-words">
                            {cmt.comment}
                          </span>
                        </div>

                        {Array.isArray(cmt.internalAttachments) &&
                          cmt.internalAttachments.length > 0 && (
                            <div className="mt-2">
                              <div className="flex">
                                <div className="text-gray-500 pr-0 text-sm">
                                  Đính kèm:
                                </div>
                              </div>
                              {cmt.internalAttachments.map((f) => {
                                const encrypted = Boolean(
                                  f?.encrypt || f?.oEncrypt
                                );
                                return (
                                  <div key={f.id} className="flex">
                                    <div className="flex-1">
                                      <span
                                        className="cursor-pointer hover:text-blue-600"
                                        onClick={() => onClickFile(f)}
                                        title={
                                          encrypted
                                            ? "Đã mã hóa"
                                            : "Chưa mã hóa"
                                        }
                                      >
                                        <KeyRound
                                          className={`inline w-4 h-4 ${
                                            encrypted
                                              ? "text-red-600"
                                              : "text-gray-400"
                                          }`}
                                        />
                                        {f.displayName}
                                        <Paperclip className="inline w-4 h-4 ml-1" />
                                      </span>
                                      {encrypted && onOpenShare && (
                                        <button
                                          type="button"
                                          onClick={() => onOpenShare(f)}
                                          className="ml-2 text-blue-600 hover:text-blue-700"
                                          title="Chia sẻ tệp đính kèm"
                                        >
                                          <Share className="inline w-4 h-4" />
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          )}

                        <div className="mt-2">
                          <div className="flex items-center gap-1">
                            <span className="text-gray-500 text-sm">
                              Vào lúc:
                            </span>
                            <span className="text-gray-500 text-sm">
                              {formatPassTime(cmt.createDate || "")}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <div className="text-center py-2">
                <span className="text-gray-500 italic">Không có ý kiến !</span>
              </div>
            )}
          </div>
        </div>
      </>
    );
  }
);

DocInternalCommentsSection.displayName = "DocInternalCommentsSection";
export default DocInternalCommentsSection;
