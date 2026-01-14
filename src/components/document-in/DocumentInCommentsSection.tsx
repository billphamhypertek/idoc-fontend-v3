import { sendPost } from "@/api";
import { UserIcon, VerifyIcon } from "@/components/common/icon";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { queryKeys } from "@/definitions";
import { useGetDocumentInComments } from "@/hooks/data/document-in.data";
import { useToast } from "@/hooks/use-toast";
import { useVgcaStatus } from "@/hooks/useVgcaSign";
import { EncryptionService } from "@/services/encryption.service";
import { FileService, uploadFileService } from "@/services/file.service";
import { ToastUtils } from "@/utils/toast.utils";
import { useQueryClient } from "@tanstack/react-query";
import {
  Check,
  Download,
  Loader2,
  Paperclip,
  Pencil,
  Send,
  Share2,
  Trash2,
  X,
} from "lucide-react";
import { useParams } from "next/navigation";
import { forwardRef, useEffect, useMemo, useRef, useState } from "react";
import ConfirmDeleteDialog from "../common/ConfirmDeleteDialog";

type DocumentInCommentAttachment = {
  name?: string;
  displayName?: string;
  type?: string;
  encrypt?: boolean;
  id?: any;
  [key: string]: any;
};

type DocumentInCommentItem = {
  id: number | string;
  userFullName?: string;
  userPosition?: string;
  comment: string;
  createDate: Date | string | number;
  attachments?: DocumentInCommentAttachment[];
  isToken?: boolean;
  hashComment?: string;
  editable?: boolean;
  editcomment?: boolean;
  transfer?: boolean;
  typeName?: string;
  cmtContent?: string;
};

type DocumentInCommentsSectionProps = {
  id: number;
  allowAttachments?: boolean;
  allowedComment?: boolean;
  documentDetail?: any;
  onSuccess?: () => void;
  onError?: (error: any) => void;
  onCommentSaved?: () => void;
  onSuccessSignEvent?: (event: any) => void;
  setNewComment: (comment: any) => void;
  newComment: {
    comment: string;
    attachments: any;
    isToken: boolean;
    endDate: Date | null;
  };
};

// Configuration from Angular component
const config = {
  BCY_VERIFY_TOKEN: process.env.NEXT_PUBLIC_BCY_VERIFY_TOKEN === "true",
  ENCRYPTION_TWD: process.env.NEXT_PUBLIC_ENCRYPTION_TWD === "true",
  BCY_COMMENT_WITH_TOKEN:
    process.env.NEXT_PUBLIC_BCY_COMMENT_WITH_TOKEN === "true",
};

export type DocumentInCommentsSectionRef = {
  saveNewDraftComment: (withToken?: boolean) => Promise<void>;
};

const DocumentInCommentsSection = forwardRef<
  DocumentInCommentsSectionRef,
  DocumentInCommentsSectionProps
>(function DocumentInCommentsSection(
  {
    id,
    allowAttachments = true,
    allowedComment = true,
    onCommentSaved,
    onSuccessSignEvent,
    setNewComment,
    newComment,
  }: DocumentInCommentsSectionProps,
  ref
) {
  const { data: commentsData, isLoading } = useGetDocumentInComments(id);
  const qc = useQueryClient();
  const { toast } = useToast();
  const params = useParams<{ id?: string }>() ?? {};
  const documentId = params.id ?? "";
  const { isVgcaInstalled, isChecking } = useVgcaStatus();

  // State matching Angular component exactly
  const [encrypt, setEncrypt] = useState(false);
  const [encryptShowing, setEncryptShowing] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [editComment, setEditComment] = useState("");
  const [disableComment, setDisableComment] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<number | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState({
    open: false,
    comment: null,
  });

  // State for comment input
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
    () => [
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
    []
  );

  const comments: DocumentInCommentItem[] = (commentsData || [])?.map(
    (c: any) => ({
      id: c.id ?? c.commentId ?? Math.random(),
      userFullName: c.userFullName || c.userName || c.fullName,
      userPosition: c.userPosition || c.positionName,
      comment: c.comment || c.text || "",
      createDate: c.createDate || c.createdAt || Date.now(),
      isToken: c.isToken || false,
      hashComment: c.hashComment,
      editable: c.editable || false,
      editcomment: c.editcomment || false,
      transfer: c.transfer || false,
      typeName: c.typeName,
      cmtContent: c.cmtContent,
      attachments: (c.attachments || c.attachmentComments || []).map(
        (a: any) =>
          ({
            name: a.name ?? a.fileName ?? a.id,
            displayName:
              a.displayName ?? a.originalName ?? a.fileName ?? a.name,
            type: a.type,
            encrypt: a.encrypt,
            id: a.id,
          }) as DocumentInCommentAttachment
      ),
    })
  );

  // Initialize encryption showing state (matching Angular ngOnInit)
  useEffect(() => {
    const dataEncrypt = getDataEncrypt();
    setEncryptShowing(dataEncrypt != null && dataEncrypt === "true");
  }, []);

  // Get data encrypt from localStorage (matching Angular component)
  const getDataEncrypt = (): string | null => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("dataEncrypt");
    }
    return null;
  };

  const checkIconVerify = (comment: any): boolean => {
    return !!(comment.isToken && comment.hashComment?.trim() !== "");
  };

  // Set encryption for attachments (matching Angular setEncAttachment)
  const setEncAttachment = () => {
    if (
      encrypt &&
      newComment?.attachments &&
      newComment.attachments.length > 0
    ) {
      newComment.attachments.forEach((file: any) => {
        file.encrypt = true;
      });
    }
  };

  // Set shared file data (matching Angular setSharedFileData exactly)
  const setSharedFileData = (docId: number) => {
    return {
      objId: docId,
      files: newComment?.attachments,
      comment: newComment?.comment,
      cmtContent: null,
      userIds: [],
      attType: "doc_out_comment", // CERT_OBJ_TYPE.doc_in_comment
      cmtType: "VAN_BAN_DI_BINH_LUAN",
      objType: "doc_out_comment", // CERT_OBJ_TYPE.doc_in_comment
      userOrobj: "doc_out_comment", // CERT_OBJ_TYPE.doc_in_comment
      onlyShareFileObject: true,
      hash: {},
    };
  };

  // Reload success (matching Angular reloadSuccess exactly)
  const reloadSuccess = async () => {
    await qc.invalidateQueries({
      queryKey: [queryKeys.document_in.comment, id], //todo
    });

    setNewComment?.({
      comment: "",
      attachments: [],
      isToken: false,
      endDate: null,
    });
    ToastUtils.success("Thêm ý kiến xử lý thành công.");

    setClicked(false);
    setEncrypt(false);
    onCommentSaved?.();
  };

  // Sign YKien function with timeout fallback
  const signYKien = (
    comment: string,
    successCallback: (ev: any, data: string) => void,
    failCallback: () => void
  ) => {
    if (typeof window !== "undefined" && (window as any).vgca_sign_json) {
      try {
        const prms: any = { JsonContent: comment };
        const json_prms = JSON.stringify(prms);

        let callbackCalled = false;

        // Set timeout 5s to prevent hanging
        const timeoutId = setTimeout(() => {
          if (!callbackCalled) {
            callbackCalled = true;
            failCallback();
          }
        }, 5000);

        (window as any).vgca_sign_json(
          null,
          json_prms,
          (ev: any, data: string) => {
            if (!callbackCalled) {
              callbackCalled = true;
              clearTimeout(timeoutId);
              successCallback(ev, data);
            }
          },
          () => {
            if (!callbackCalled) {
              callbackCalled = true;
              clearTimeout(timeoutId);
              failCallback();
            }
          }
        );
      } catch (error) {
        failCallback();
      }
    } else {
      failCallback();
    }
  };

  // Main function to handle comment saving (matching Angular doSaveNewDraftComment exactly)
  const doSaveNewDraftComment = async (
    content: string,
    files: File[],
    withToken = false
  ) => {
    if (!content?.trim() || content.length === 0) {
      return;
    }
    signYKien(
      content,
      (ev, data) => {
        try {
          onSuccessSignEvent?.(ev);
          const received_msg = JSON.parse(data);
          const signature = received_msg.Signature || "";
          doSaveNewDraftCommentCToken(signature, true, content, files);
        } catch (e) {
          console.error("Parse lỗi:", e);
          doSaveNewDraftCommentCToken("", false, content, files);
        }
      },
      () => {
        doSaveNewDraftCommentCToken("", false, content, files);
      }
    );
  };
  const doSaveNewDraftCommentCToken = async (
    signature: string,
    withToken: boolean,
    content: string,
    files: File[]
  ) => {
    if (encrypt) {
      const connect = await EncryptionService.checkConnect();
      if (connect === false) {
        console.error("❌ Encryption connection failed");
        ToastUtils.error("Không thể kết nối dịch vụ mã hóa");
        setClicked(false);
        return;
      }
    }

    // Chuẩn hóa nội dung comment và gắn trạng thái isToken
    const normalizedComment = `- ${content?.trim() || ""}`;
    setClicked(true);

    // Chuẩn bị danh sách file gửi đi (đặt cờ encrypt tại chỗ nếu cần)
    const filesToSend: File[] = [...files];
    if (encrypt && filesToSend.length > 0) {
      filesToSend.forEach((f) => ((f as any).encrypt = true));
    }

    // Dữ liệu gửi đi: lấy khung từ helper rồi ghi đè comment/files theo dữ liệu hiện tại
    const data = setSharedFileData(Number(documentId));
    data.comment = normalizedComment;
    data.files = filesToSend;

    try {
      if (encrypt) {
        const rs = await uploadFileService.doSharePermissionDocFile(
          data,
          false
        );
        setClicked(false);
        if (rs === false) {
          await reloadSuccess();
          return;
        }
      } else {
        if (signature) {
          data.hash = signature;
        }
        await uploadFileService.saveCmtAndAtmByNonEnc(data);
      }

      await reloadSuccess();
    } catch (error) {
      console.error("❌ Error in doSaveNewDraftCommentCToken:", error);
      ToastUtils.error("Không thể lưu ý kiến. Vui lòng thử lại.");
      setClicked(false);
    }
  };

  // Handle comment editing (matching Angular handleComment exactly)
  const handleComment = (comment: any) => {
    setEditComment(comment.comment);
    if (disableComment) {
      return;
    }
    setEditingCommentId(comment.id);
    setDisableComment(true);
  };

  // Close edit comment (matching Angular doCloseEditComment exactly)
  const doCloseEditComment = () => {
    setEditingCommentId(null);
    setDisableComment(false);
    setEditComment("");
  };

  // Save comment content (matching Angular saveCmtContent exactly)
  const saveCmtContent = async (
    commentId: number,
    content: string,
    hashComment: string
  ) => {
    try {
      await sendPost(`/comment_doc/edit/${commentId}?comment=${content}`, {
        hash: hashComment,
      });

      await qc.invalidateQueries({
        queryKey: ["document-out/comments", id],
      });

      doCloseEditComment();
    } catch (error) {
      console.error("Error saving comment content:", error);
      ToastUtils.error("Không thể lưu ý kiến. Vui lòng thử lại.");
    }
  };

  // Sign comment function (matching Angular component)
  const signComment = async (content: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (typeof window !== "undefined" && (window as any).vgca_sign_json) {
        try {
          (window as any).vgca_sign_json((data: string) => {
            try {
              const received_msg = JSON.parse(data);
              const signature = received_msg.Signature || "";
              resolve(signature);
            } catch (e) {
              console.error("Parse error:", e);
              reject(e);
            }
          });
        } catch (error) {
          reject(error);
        }
      } else {
        reject(new Error("Signature service not available"));
      }
    });
  };

  // Delete comment (matching Angular deleteComment exactly)
  const deleteComment = async (comment: any) => {
    try {
      await sendPost(`/comment_doc/delete/${comment.id}`, null);

      await qc.invalidateQueries({
        queryKey: [queryKeys.document_in.comment, id],
      });

      ToastUtils.success("Xóa bình luận thành công.");
    } catch (error) {
      console.error("Error deleting comment:", error);
      ToastUtils.error("Không thể xóa bình luận. Vui lòng thử lại.");
    }
  };

  // Show delete comment confirmation (matching Angular showDeleteComment exactly)
  const showDeleteComment = (comment: any) => {
    setShowConfirmDialog({ open: true, comment });
  };

  // Change encrypt (matching Angular changeEncrypt exactly)
  const changeEncrypt = () => {
    if (!(!newComment?.attachments || newComment.attachments.length === 0)) {
      setEncrypt(!encrypt);
    }
  };

  // Download file (matching Angular downloadFile exactly)
  const downloadFile = async (fileName: string, encrypt: boolean) => {
    if (encrypt) return;
    return FileService.getFileToView("/attachment_comment/download/", fileName);
  };

  // Open share for encrypted files (matching Angular doOpenShare)
  const doOpenShare = (file: any) => {
    // This would open the share modal
  };

  // Get pass time (matching Angular getPassTime exactly)
  const getPassTime = (date: Date | string | number): string => {
    if (!date) return "";
    const dateObj = date instanceof Date ? date : new Date(date);
    return dateObj.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Handle file selection (matching Angular doSelectFiles)
  const handleFileChange = (files: File[]) => {
    setNewComment?.((prev: any) => ({
      ...prev,
      attachments: [...files],
    }));
  };

  // Handle comment change (matching Angular newComment.comment binding)
  const handleCommentChange = (comment: string) => {
    setNewComment?.((prev: any) => ({
      ...prev,
      comment: comment,
    }));
  };

  // Reset validation
  const resetValidation = () =>
    setValidation({
      minChar: true,
      maxLength: true,
      validFiles: true,
      isValidFileSize: true,
      isValidExtension: true,
      isValidNumberOfFiles: true,
    });

  // Get file extension
  const getFileExtension = (name: string) =>
    `.${name.split(".").pop()?.toLowerCase()}`;

  // Handle file selection
  const handleFileSelectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    if (selected.length === 0) return;

    let isValidExt = true;
    let isValidSize = true;

    for (const f of selected) {
      const ext = getFileExtension(f.name);
      if (!ACCEPT_EXT.includes(ext)) isValidExt = false;
      if (f.size > 300 * 1024 * 1024) isValidSize = false;
    }

    const unique = [...files];
    for (const f of selected) {
      if (!unique.find((u) => u.name === f.name && u.size === f.size)) {
        unique.push(f);
      }
    }

    const isValidNum = unique.length <= 10;
    setValidation((v) => ({
      ...v,
      validFiles: isValidExt && isValidSize && isValidNum,
      isValidExtension: isValidExt,
      isValidFileSize: isValidSize,
      isValidNumberOfFiles: isValidNum,
    }));

    if (!isValidExt || !isValidSize || !isValidNum) return;

    setFiles(unique);
    handleFileChange(unique);
    e.target.value = "";
  };

  // Handle remove file
  const handleRemoveFile = (index: number) => {
    const next = files.slice();
    next.splice(index, 1);
    setFiles(next);
    handleFileChange(next);
    setValidation((v) => ({
      ...v,
      isValidNumberOfFiles: next.length <= 10,
      validFiles: true,
    }));
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Check if file is viewable
  const isViewableFile = (file: DocumentInCommentAttachment): boolean => {
    if (!file || file.encrypt) return false;
    const fileName = (file.displayName || file.name || "").toLowerCase();
    return fileName.endsWith(".pdf") || file.type === "application/pdf";
  };

  // Get mime type
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

  // Handle attachment click
  const handleAttachmentClick = async (file: DocumentInCommentAttachment) => {
    try {
      const res = await downloadFile(
        String(file.name ?? file.id ?? ""),
        file.encrypt || false
      );

      const fileName = file?.displayName || file?.name || "attachment";
      const mimeType = getMimeType(fileName);

      if (!res) {
        throw new Error("No file response");
      }

      let arrayBuffer: ArrayBuffer;
      if (res instanceof Blob) {
        arrayBuffer = await res.arrayBuffer();
      } else if (res && typeof res === "object" && "byteLength" in res) {
        arrayBuffer = res as ArrayBuffer;
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

  // Format date time
  const formatDateTime = (timestamp: Date | string | number) => {
    const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
    const dateStr = date.toLocaleDateString("vi-VN");
    const timeStr = date.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${timeStr} - ${dateStr}`;
  };

  // Handle send comment
  const handleSendComment = async () => {
    if (!isVgcaInstalled) {
      ToastUtils.error("Vui lòng cài đặt VGCA plugin để gửi ý kiến");
      return;
    }

    const content = newComment?.comment?.trim() || "";

    if (!content || content.length === 0) {
      setValidation((v) => ({
        ...v,
        minChar: false,
        maxLength: true,
      }));
      return;
    }

    const minChar = content.length >= 1;
    const maxLength = content.length <= 2000;

    setValidation((v) => ({
      ...v,
      minChar,
      maxLength,
    }));

    if (!minChar || !maxLength) return;

    try {
      await doSaveNewDraftComment(content, files, false);
      setComment("");
      setFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
      resetValidation();
    } catch (error) {
      ToastUtils.commentCreateError();
    }
  };

  // Handle save edit comment
  const handleSaveEditComment = (commentItem: DocumentInCommentItem) => {
    if (editComment) {
      saveCmtContent(
        commentItem.id as number,
        editComment,
        commentItem.hashComment || ""
      );
    }
  };

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
                    value={newComment?.comment || ""}
                    onChange={(e) => {
                      const value = e.target.value;
                      handleCommentChange(value);
                      if (!validation.minChar || !validation.maxLength) {
                        const content = value.trim();
                        const minChar = content.length >= 1;
                        const maxLength = content.length <= 2000;
                        setValidation((v) => ({ ...v, minChar, maxLength }));
                      }
                    }}
                    className="min-h-[60px] text-sm resize-none overflow-hidden"
                    style={{ height: "25px", padding: "16px" }}
                  />
                  {(!validation.minChar || !validation.maxLength) && (
                    <div className="text-red-600 text-xs mt-1 space-y-0.5">
                      {!validation.minChar && (
                        <p>Nội dung ý kiến phải chứa ít nhất 1 ký tự</p>
                      )}
                      {!validation.maxLength && (
                        <p>Nội dung không được dài quá 2000 ký tự</p>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-2">
                  {!encryptShowing && allowAttachments && (
                    <>
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
                        accept="zip,application/octet-stream,application/zip,application/x-zip,application/x-zip-compressed,application/msword,application/vnd.ms-excel,application/vnd.ms-powerpoint,application/pdf"
                        onChange={handleFileSelectChange}
                      />
                    </>
                  )}
                  <Button
                    onClick={handleSendComment}
                    size="sm"
                    disabled={clicked}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    <Send className="w-4 h-4 mr-1" />
                    Gửi ý kiến
                  </Button>
                </div>

                {!validation.validFiles && (
                  <div className="text-red-600 text-xs space-y-0.5">
                    {!validation.isValidFileSize && (
                      <p>Dung lượng file phải nhỏ hơn 300MB.</p>
                    )}
                    {!validation.isValidExtension && (
                      <p>File không đúng định dạng.</p>
                    )}
                  </div>
                )}

                {allowAttachments && files.length > 0 && (
                  <div className="space-y-2">
                    {files.map((file, idx) => (
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
        <div className="p-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : comments.length > 0 ? (
            <div className="space-y-3">
              {comments.map((commentItem) => (
                <div key={commentItem.id} className="p-1">
                  <div className="flex items-start gap-2 my-1">
                    <div
                      className="text-center flex items-center justify-center flex-shrink-0 relative"
                      style={{ fontSize: "30px", width: "50px" }}
                    >
                      <UserIcon />
                      {commentItem.isToken && (
                        <img
                          src="/v3/assets/images/usb-token.png"
                          className="absolute"
                          style={{ right: "5px", width: "20px" }}
                          alt="Token"
                        />
                      )}
                    </div>
                    <div className="flex-1 min-w-0 p-0">
                      <div>
                        <span className="font-bold">
                          {commentItem.userFullName || "Không xác định"}
                        </span>
                        {commentItem.userFullName &&
                          commentItem.userFullName.length > 0 &&
                          commentItem.userPosition && (
                            <span className="font-bold">
                              ({commentItem.userPosition}):{" "}
                            </span>
                          )}
                        <br />
                        <div className="flex items-center">
                          <span className="whitespace-pre-wrap break-words">
                            {commentItem.comment}
                          </span>
                          {checkIconVerify(commentItem) && (
                            <span
                              className="inline-block ml-1"
                              title="Đã ký số"
                            >
                              <VerifyIcon />
                            </span>
                          )}
                        </div>
                      </div>

                      {Array.isArray(commentItem.attachments) &&
                        commentItem.attachments.length > 0 && (
                          <div>
                            <div className="flex">
                              <div
                                className="text-gray-500"
                                style={{ paddingRight: "0px" }}
                              >
                                Đính kèm:
                              </div>
                            </div>
                            {commentItem.attachments.map((file, idx) => (
                              <div key={`${file.id || file.name}-${idx}`}>
                                <span
                                  className="cursor-pointer"
                                  onClick={() => handleAttachmentClick(file)}
                                >
                                  <i
                                    className={`fas fa-solid fa-key ${
                                      file.encrypt
                                        ? "text-danger"
                                        : "text-secondary"
                                    }`}
                                    title={
                                      file.encrypt ? "Đã mã hóa" : "Chưa mã hóa"
                                    }
                                  ></i>{" "}
                                  {file.displayName || file.name}
                                  <i className="fas fa-paperclip ml-2"></i>
                                </span>
                                {file.encrypt && (
                                  <a
                                    onClick={() => doOpenShare(file)}
                                    className="ml-2"
                                  >
                                    <i
                                      className="fas fa-share"
                                      title="Chia sẻ tệp đính kèm"
                                    ></i>
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      <div
                        className="text-gray-500"
                        style={{ paddingRight: "0px" }}
                      >
                        Vào lúc: {getPassTime(commentItem.createDate)}
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
      </div>

      <ConfirmDeleteDialog
        isOpen={showConfirmDialog.open}
        onOpenChange={(open) => setShowConfirmDialog({ open, comment: null })}
        onConfirm={() => deleteComment(showConfirmDialog.comment)}
        title="Hãy xác nhận"
        description="Bạn có chắc muốn xóa bình luận này"
        confirmText="Đồng ý"
        cancelText="Đóng"
      />
    </>
  );
});

export default DocumentInCommentsSection;
