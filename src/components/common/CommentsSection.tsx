import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { ToastUtils } from "@/utils/toast.utils";
import {
  Loader2,
  Paperclip,
  Send,
  UserRound,
  Key,
  Share,
  Edit,
  Trash2,
  Check,
  X,
  KeyRound,
} from "lucide-react";
import { useMemo, useRef, useState } from "react";

export type Attachment = {
  name?: string;
  displayName?: string;
  type?: string;
  encrypt?: boolean;
  [key: string]: any;
};

export type CommentItem = {
  id: number | string;
  userFullName?: string;
  userPosition?: string;
  comment: string;
  createDate: Date | string | number;
  attachments?: Attachment[];
  isToken?: boolean;
  hashComment?: string;
  editable?: boolean;
  editcomment?: boolean;
  transfer?: boolean;
  typeName?: string;
  cmtContent?: string;
};

export type NewComment = {
  comment: string;
  attachments: File[];
  isToken: boolean;
  endDate: Date | null;
};

export type CommentsSectionProps = {
  comments: CommentItem[];
  submitting?: boolean;
  loading?: boolean;
  allowAttachments?: boolean;
  onSend: (content: string, files: File[]) => Promise<void> | void;
  onDownloadAttachment: (
    file: Attachment
  ) => Promise<Blob | ArrayBuffer | Response | undefined>;
  acceptExtensions?: string[];
  maxLen?: number;
  maxFiles?: number;
  maxSizeBytes?: number;
  allowComment?: boolean;
  // Enhanced props for Angular-like functionality
  encryptShowing?: boolean;
  encrypt?: boolean;
  onEncryptChange?: () => void;
  onEditComment?: (comment: CommentItem) => void;
  onCloseEditComment?: () => void;
  onSaveCommentContent?: (
    commentId: number,
    content: string,
    hashComment: string
  ) => void;
  onDeleteComment?: (comment: CommentItem) => void;
  onOpenShare?: (file: Attachment) => void;
  editingCommentId?: number | null;
  editComment?: string;
  onEditCommentChange?: (content: string) => void;
  getPassTime?: (date: Date | string | number) => string;
  checkIconVerify?: (comment: CommentItem) => boolean;
  // New comment state props
  newComment?: NewComment;
  onNewCommentChange?: (comment: string) => void;
  onFileChange?: (files: File[]) => void;
  isVgcaInstalled?: boolean;
};

const formatRelativeTime = (timestamp: Date | string | number) => {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "ngay bây giờ";
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} phút trước`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} tiếng trước`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} ngày trước`;
  }
};

const formatDateTime = (timestamp: Date | string | number) => {
  const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
  const dateStr = date.toLocaleDateString("vi-VN");
  const timeStr = date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${timeStr} - ${dateStr}`;
};

export default function CommentsSection({
  comments,
  submitting = false,
  loading = false,
  allowAttachments = true,
  onSend,
  onDownloadAttachment,
  acceptExtensions,
  maxLen = 2000,
  maxFiles = 10,
  maxSizeBytes = 300 * 1024 * 1024,
  allowComment = true,
  encryptShowing = false,
  encrypt = false,
  onEncryptChange,
  onEditComment,
  onCloseEditComment,
  onSaveCommentContent,
  onDeleteComment,
  onOpenShare,
  editingCommentId,
  editComment = "",
  onEditCommentChange,
  getPassTime,
  checkIconVerify,
  newComment,
  onNewCommentChange,
  onFileChange,
  isVgcaInstalled,
}: CommentsSectionProps) {
  const [comment, setComment] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [validation, setValidation] = useState({
    minChar: true,
    maxLength: true,
    validFiles: true,
    isValidFileSize: true,
    isValidExtension: true,
    isValidNumberOfFiles: true,
  });

  const ACCEPT_EXT = useMemo(
    () =>
      acceptExtensions && acceptExtensions.length > 0
        ? acceptExtensions
        : [
            ".zip",
            ".rar",
            ".doc",
            ".docx",
            ".odt",
            ".xls",
            ".xlsx",
            ".ods",
            ".ppt",
            ".pptx",
            ".pdf",
          ],
    [acceptExtensions]
  );

  const resetValidation = () =>
    setValidation({
      minChar: true,
      maxLength: true,
      validFiles: true,
      isValidFileSize: true,
      isValidExtension: true,
      isValidNumberOfFiles: true,
    });

  const handleSendComment = async () => {
    if (!isVgcaInstalled) {
      ToastUtils.error("Vui lòng cài đặt VGCA plugin để gửi ý kiến");
      return;
    }
    const content: string | undefined = onNewCommentChange
      ? newComment?.comment?.trim()
      : comment.trim();

    // If content is empty, only check minChar, not maxLength
    if (!content || content.length === 0) {
      setValidation((v) => ({
        ...v,
        minChar: false,
        maxLength: true, // Don't show maxLength error when content is empty
      }));
      return;
    }

    const minChar = content.length >= 1;
    const maxLength = content.length <= maxLen;

    // Set validation state to show error messages
    setValidation((v) => ({
      ...v,
      minChar,
      maxLength,
    }));

    if (!minChar || !maxLength) return;

    try {
      await onSend(content, allowAttachments ? files : []);
    } catch (error) {
      ToastUtils.commentCreateError();
    } finally {
      setComment("");
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      resetValidation();
    }
  };

  const getFileExtension = (name: string) =>
    `.${name.split(".").pop()?.toLowerCase()}`;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    let isValidExt = true;
    let isValidSize = true;

    for (const f of selected) {
      const ext = getFileExtension(f.name);
      if (!ACCEPT_EXT.includes(ext)) isValidExt = false;
      if (f.size > maxSizeBytes) isValidSize = false;
    }

    const unique = [...files];
    for (const f of selected) {
      if (!unique.find((u) => u.name === f.name && u.size === f.size)) {
        unique.push(f);
      }
    }

    const isValidNum = unique.length <= maxFiles;
    setValidation((v) => ({
      ...v,
      validFiles: isValidExt && isValidSize && isValidNum,
      isValidExtension: isValidExt,
      isValidFileSize: isValidSize,
      isValidNumberOfFiles: isValidNum,
    }));
    if (!isValidExt || !isValidSize || !isValidNum) return;

    setFiles(unique);
    onFileChange?.([...(newComment?.attachments || []), ...unique]);
    e.target.value = "";
  };

  const handleRemoveFile = (index: number) => {
    const next = files.slice();
    next.splice(index, 1);
    setFiles(next);
    onFileChange?.(next);
    setValidation((v) => ({
      ...v,
      isValidNumberOfFiles: next.length <= maxFiles,
      validFiles: true,
    }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const isViewableFile = (file: Attachment): boolean => {
    if (!file || (file as any).encrypt) return false;
    const fileName = (file.displayName || file.name || "").toLowerCase();
    return (
      fileName.endsWith(".pdf") || (file as any).type === "application/pdf"
    );
  };

  const getMimeType = (fileName: string): string => {
    const ext = fileName.split(".").pop()?.toLowerCase();
    switch (ext) {
      case "pdf":
        return "application/pdf";
      case "doc":
      case "docx":
        return "application/msword";
      case "xls":
      case "xlsx":
        return "application/vnd.ms-excel";
      case "ppt":
      case "pptx":
        return "application/vnd.ms-powerpoint";
      default:
        return "application/octet-stream";
    }
  };

  const handleFileClick = async (file: Attachment) => {
    try {
      const res = await onDownloadAttachment(file);
      const fileName = file?.displayName || file?.name || "attachment";
      const mimeType = getMimeType(fileName);

      if (!res) {
        throw new Error("No file response");
      }

      let arrayBuffer: ArrayBuffer;
      if (res instanceof Blob) {
        arrayBuffer = await res.arrayBuffer();
      } else if (res instanceof ArrayBuffer) {
        arrayBuffer = res;
      } else if (typeof (res as any).arrayBuffer === "function") {
        arrayBuffer = await (res as Response).arrayBuffer();
      } else {
        throw new Error("Unsupported response type");
      }

      const blob = new Blob([arrayBuffer], { type: mimeType });
      const url = URL.createObjectURL(blob);
      if (isViewableFile(file)) {
        const newWindow = window.open("", "_blank");
        if (newWindow) {
          newWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head><title>${fileName}</title></head>
              <body style="margin:0;">
                <embed src="${url}" type="${mimeType}" width="100%" height="100%" />
              </body>
            </html>
          `);
          newWindow.document.close();
        } else {
          const iframe = document.createElement("iframe");
          iframe.src = url;
          iframe.style.display = "none";
          document.body.appendChild(iframe);
          setTimeout(() => document.body.removeChild(iframe), 1000);

          const a = document.createElement("a");
          a.href = url;
          a.target = "_blank";
          a.rel = "noopener noreferrer";
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        }
      } else {
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        a.rel = "noopener noreferrer";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }

      setTimeout(() => URL.revokeObjectURL(url), 5000);
    } catch (err) {
      console.error("Error handling file click", err);
      ToastUtils.fileDownloadError();
    }
  };

  const handleSaveEditComment = (comment: CommentItem) => {
    if (onSaveCommentContent && editComment) {
      onSaveCommentContent(
        comment.id as number,
        editComment,
        comment.hashComment || ""
      );
    }
  };

  // Use newComment state if provided, otherwise use local state
  const currentComment = newComment?.comment || comment;
  const currentFiles = newComment?.attachments || files;
  return (
    <>
      {allowComment && (
        <>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Ý kiến xử lý
            </h3>
            <div className="space-y-3">
              <Textarea
                placeholder="Nhập nội dung ý kiến"
                value={currentComment}
                onChange={(e) => {
                  const value = e.target.value;
                  if (onNewCommentChange) {
                    onNewCommentChange(value);
                  } else {
                    setComment(value);
                  }
                  // Reset validation when user starts typing
                  if (!validation.minChar || !validation.maxLength) {
                    const content = value.trim();
                    const minChar = content.length >= 1;
                    const maxLength = content.length <= maxLen;
                    setValidation((v) => ({ ...v, minChar, maxLength }));
                  }
                }}
                className="min-h-[100px] text-sm"
              />
              {/* Validation Error Messages */}
              {(!validation.minChar || !validation.maxLength) && (
                <div className="text-red-600 text-xs mt-2 space-y-0.5">
                  {!validation.minChar && (
                    <p>Nội dung ý kiến phải chứa ít nhất 1 ký tự</p>
                  )}
                  {!validation.maxLength && (
                    <p>Nội dung ý kiến không được vượt quá {maxLen} ký tự</p>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2 w-full">
                {allowAttachments && (
                  <>
                    <label
                      htmlFor="comment-attachments"
                      className="inline-flex items-center justify-center gap-1 text-xs h-9 px-2 border border-gray-300 rounded cursor-pointer hover:bg-gray-50 bg-white flex-1"
                    >
                      <Paperclip className="w-4 h-4 text-blue-600" /> Đính kèm
                    </label>
                    <input
                      id="comment-attachments"
                      ref={fileInputRef}
                      type="file"
                      multiple
                      className="hidden"
                      accept={ACCEPT_EXT.join(",")}
                      onChange={handleFileChange}
                    />
                  </>
                )}
                {encryptShowing && onEncryptChange && (
                  <button
                    type="button"
                    onClick={onEncryptChange}
                    className="inline-flex items-center justify-center gap-1 text-xs h-9 px-2 border border-gray-300 rounded hover:bg-gray-50 bg-white flex-1"
                    title="Mã hóa tệp tin"
                  >
                    <KeyRound
                      className={`w-4 h-4 ${encrypt ? "text-red-500" : "text-gray-400"}`}
                    />
                  </button>
                )}
                <Button
                  onClick={handleSendComment}
                  size="sm"
                  disabled={!isVgcaInstalled || submitting}
                  className={`bg-blue-600 hover:bg-blue-700 hover:text-white text-white border-blue-600 h-9 px-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed flex-1`}
                  title="Gửi ý kiến xử lý"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                  Gửi ý kiến
                </Button>
              </div>
              {allowAttachments && currentFiles.length > 0 && (
                <div className="mt-2 space-y-2">
                  {currentFiles.map((file, idx) => (
                    <div
                      key={`${file.name}-${idx}`}
                      className="flex items-center justify-between gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-md text-xs"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Paperclip className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                        <span className="truncate text-gray-700">
                          {file.name}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 p-1 rounded flex-shrink-0 transition-colors"
                        onClick={() => handleRemoveFile(idx)}
                        title="Xóa tệp đính kèm"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              {!validation.validFiles && (
                <div className="text-red-600 text-xs mt-2 space-y-0.5">
                  {!validation.isValidFileSize && (
                    <p>Dung lượng tệp phải nhỏ hơn 300MB.</p>
                  )}
                  {!validation.isValidExtension && (
                    <p>Định dạng tệp không hợp lệ.</p>
                  )}
                  {!validation.isValidNumberOfFiles && (
                    <p>Vượt quá số lượng tệp cho phép.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          <Separator />
        </>
      )}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Lịch sử ý kiến</h3>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
          </div>
        ) : comments.length > 0 ? (
          <div className="space-y-3">
            {comments.map((commentItem) => (
              <div key={commentItem.id} className="p-1">
                <div className="flex items-start gap-2">
                  <div className="w-8 h-9 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 relative">
                    <UserRound className="w-4 h-4 text-blue-600" />
                    {commentItem.isToken && (
                      <img
                        src="/v3/assets/images/usb-token.png"
                        className="absolute -top-1 -right-1 w-4 h-4"
                        alt="Token"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="mb-0.5">
                      <span className="text-sm font-bold text-gray-900">
                        {commentItem.userFullName || "Không xác định"}
                        {commentItem.userPosition && (
                          <span className="text-xs text-gray-900 ml-1  font-bold ">
                            • {commentItem.userPosition}
                          </span>
                        )}
                      </span>
                      {checkIconVerify && checkIconVerify(commentItem) && (
                        <div
                          className="w-4 h-4 text-green-500"
                          title="Đã ký số"
                        >
                          <svg
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path
                              fillRule="evenodd"
                              clipRule="evenodd"
                              d="M9.5924 3.20027C9.34888 3.4078 9.22711 3.51158 9.09706 3.59874C8.79896 3.79854 8.46417 3.93721 8.1121 4.00672C7.95851 4.03705 7.79903 4.04977 7.48008 4.07522C6.6787 4.13918 6.278 4.17115 5.94371 4.28923C5.17051 4.56233 4.56233 5.17051 4.28923 5.94371C4.17115 6.278 4.13918 6.6787 4.07522 7.48008C4.04977 7.79903 4.03705 7.95851 4.00672 8.1121C3.93721 8.46417 3.79854 8.79896 3.59874 9.09706C3.51158 9.22711 3.40781 9.34887 3.20027 9.5924C2.67883 10.2043 2.4181 10.5102 2.26522 10.8301C1.91159 11.57 1.91159 12.43 2.26522 13.1699C2.41811 13.4898 2.67883 13.7957 3.20027 14.4076C3.40778 14.6511 3.51158 14.7729 3.59874 14.9029C3.79854 15.201 3.93721 15.5358 4.00672 15.8879C4.03705 16.0415 4.04977 16.201 4.07522 16.5199C4.13918 17.3213 4.17115 17.722 4.28923 18.0563C4.56233 18.8295 5.17051 19.4377 5.94371 19.7108C6.278 19.8288 6.6787 19.8608 7.48008 19.9248C7.79903 19.9502 7.95851 19.963 8.1121 19.9933C8.46417 20.0628 8.79896 20.2015 9.09706 20.4013C9.22711 20.4884 9.34887 20.5922 9.5924 20.7997C10.2043 21.3212 10.5102 21.5819 10.8301 21.7348C11.57 22.0884 12.43 22.0884 13.1699 21.7348C13.4898 21.5819 13.7957 21.3212 14.4076 20.7997C14.6511 20.5922 14.7729 20.4884 14.9029 20.4013C15.201 20.2015 15.5358 20.0628 15.8879 19.9933C16.0415 19.963 16.201 19.9502 16.5199 19.9248C17.3213 19.8608 17.722 19.8288 18.0563 19.7108C18.8295 19.4377 19.4377 18.8295 19.7108 18.0563C19.8288 17.722 19.8608 17.3213 19.9248 16.5199C19.9502 16.201 19.963 16.0415 19.9933 15.8879C20.0628 15.5358 20.2015 15.201 20.4013 14.9029C20.4884 14.7729 20.5922 14.6511 20.7997 14.4076C21.3212 13.7957 21.5819 13.4898 21.7348 13.1699C22.0884 12.43 22.0884 11.57 21.7348 10.8301C21.5819 10.5102 21.3212 10.2043 20.7997 9.5924C20.5922 9.34887 20.4884 9.22711 20.4013 9.09706C20.2015 8.79896 20.0628 8.46417 19.9933 8.1121C19.963 7.95851 19.9502 7.79903 19.9248 7.48008C19.8608 6.6787 19.8288 6.278 19.7108 5.94371C19.4377 5.17051 18.8295 4.56233 18.0563 4.28923C17.722 4.17115 17.3213 4.13918 16.5199 4.07522C16.201 4.04977 16.0415 4.03705 15.8879 4.00672C15.5358 3.93721 15.201 3.79854 14.9029 3.59874C14.7729 3.51158 14.6511 3.40781 14.4076 3.20027C13.7957 2.67883 13.4898 2.41811 13.1699 2.26522C12.43 1.91159 11.57 1.91159 10.8301 2.26522C10.5102 2.4181 10.2043 2.67883 9.5924 3.20027ZM16.3735 9.86314C16.6913 9.5453 16.6913 9.03 16.3735 8.71216C16.0557 8.39433 15.5403 8.39433 15.2225 8.71216L10.3723 13.5624L8.77746 11.9676C8.45963 11.6498 7.94432 11.6498 7.62649 11.9676C7.30866 12.2854 7.30866 12.8007 7.62649 13.1186L9.79678 15.2889C10.1146 15.6067 10.6299 15.6067 10.9478 15.2889L16.3735 9.86314Z"
                              fill="#27ce67"
                            ></path>
                          </svg>
                        </div>
                      )}
                    </div>
                    <div></div>
                    {editingCommentId === commentItem.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editComment}
                          onChange={(e) =>
                            onEditCommentChange?.(e.target.value)
                          }
                          className="min-h-[100px]"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={onCloseEditComment}
                            title="Hủy bỏ chỉnh sửa"
                          >
                            <X className="w-4 h-4 mr-1" />
                            Hủy bỏ
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleSaveEditComment(commentItem)}
                            title="Lưu thay đổi"
                          >
                            <Check className="w-4 h-4 mr-1" />
                            Lưu lại
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div>
                        {commentItem.comment && (
                          <>
                            <span className="text-sm font-bold italic text-gray-700">
                              Ý kiến{" "}
                              {commentItem.transfer ? "chỉ đạo" : "xử lý"}
                              {commentItem.typeName &&
                                ` (${commentItem.typeName})`}
                              :
                            </span>
                            <br />
                            <p className="text-sm text-gray-700 mb-3 whitespace-pre-wrap break-words">
                              {commentItem.comment}
                            </p>
                          </>
                        )}
                      </div>
                    )}

                    {/* Attachments */}
                    {Array.isArray(commentItem.attachments) &&
                      commentItem.attachments.length > 0 && (
                        <div className="mb-3">
                          <div className="text-xs text-gray-500 mb-1">
                            Đính kèm:
                          </div>
                          <div className="space-y-2">
                            {commentItem.attachments.map((file, i) => (
                              <div key={i} className="flex items-center gap-2">
                                <button
                                  type="button"
                                  className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 flex-1 min-w-0"
                                  onClick={() => handleFileClick(file)}
                                  title={`${file.displayName || file.name || `Tệp ${i + 1}`} - ${
                                    isViewableFile(file)
                                      ? "Xem file trong tab mới"
                                      : "Tải file về máy"
                                  }`}
                                >
                                  <Paperclip className="w-4 h-4 flex-shrink-0 text-blue-600" />
                                  <span className="truncate">
                                    {file.displayName ||
                                      file.name ||
                                      `Tệp ${i + 1}`}
                                  </span>
                                </button>
                                {file.encrypt && onOpenShare && (
                                  <button
                                    type="button"
                                    onClick={() => onOpenShare(file)}
                                    className="text-blue-600 hover:text-blue-800 flex-shrink-0 p-1 rounded hover:bg-blue-50"
                                    title="Chia sẻ tệp đính kèm"
                                  >
                                    <Share className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  type="button"
                                  className="text-gray-600 hover:text-gray-800 flex-shrink-0 p-1 rounded hover:bg-gray-100"
                                  title={
                                    file.encrypt
                                      ? "Tệp đã được mã hóa"
                                      : "Tệp chưa được mã hóa"
                                  }
                                >
                                  <KeyRound
                                    className={`w-4 h-4 ${file.encrypt ? "text-red-500" : "text-gray-400"}`}
                                  />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                    {/* Actions */}
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-gray-400">
                        Vào lúc:{" "}
                        {getPassTime
                          ? getPassTime(commentItem.createDate)
                          : formatDateTime(commentItem.createDate)}
                      </div>
                      <div className="flex items-center gap-2">
                        {commentItem.editable &&
                          editingCommentId !== commentItem.id &&
                          commentItem.comment !== "" && (
                            <button
                              type="button"
                              onClick={() => onEditComment?.(commentItem)}
                              className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50"
                              title="Chỉnh sửa ý kiến xử lý"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}
                        {onDeleteComment &&
                          commentItem.editable &&
                          commentItem.comment !== "" && (
                            <button
                              type="button"
                              onClick={() => onDeleteComment(commentItem)}
                              className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50"
                              title="Xóa bình luận"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Send className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">Không có ý kiến !</p>
          </div>
        )}
      </div>
    </>
  );
}
