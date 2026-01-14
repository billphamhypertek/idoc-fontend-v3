"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Paperclip,
  Key,
  UserCircle,
  Download,
  Share,
  Edit,
  Trash2,
  KeyRound,
} from "lucide-react";
import { TaskService } from "@/services/task.service";
import { Constant } from "@/definitions/constants/constant";
import { toast } from "@/hooks/use-toast";
import { EncryptionService } from "@/services/encryption.service";
import { CERT_OBJ_TYPE } from "@/definitions/enums/document.enum";
import {
  delCommentByType,
  FileService,
  uploadFileService,
} from "@/services/file.service";
import { getTokenInfo } from "@/services/signature.service";
import { b64DecodeUnicode } from "@/services/shared.service";
import { downloadFile } from "@/utils/file.utils";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import { getPassTime } from "@/utils/datetime.utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SharedUser from "@/components/document-out/SharedUser";
import { ToastUtils } from "@/utils/toast.utils";

interface CommentSectionProps {
  taskId: number;
  commentList: any[];
  currentUserId: number;
  onCommentAdded?: () => void;
  userInfo: any;
  refetchCommentList?: () => void;
  isV2?: boolean;
}

export default function CommentSection({
  taskId,
  commentList,
  currentUserId,
  onCommentAdded,
  userInfo,
  refetchCommentList,
  isV2 = false,
}: CommentSectionProps) {
  const [newComment, setNewComment] = useState({
    comment: "",
    attachments: [] as File[],
    isToken: false,
  });
  const [encrypt, setEncrypt] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [isUpdateResult, setIsUpdateResult] = useState(false);
  const [currentCommentEdit, setCurrentCommentEdit] = useState<number | null>(
    null
  );
  const [validFileAttr, setValidFileAttr] = useState({
    validFiles: true,
    isValidFileSize: true,
    isValidExtension: true,
  });
  const [isDelete, setIsDelete] = useState(false);
  const [deleteCommentId, setDeleteCommentId] = useState<number | null>(null);
  const [showSharedUserModal, setShowSharedUserModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [commentError, setCommentError] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const ENCRYPTION_TWD = Constant.ENCRYPTION_TWD;

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const fileArray = Array.from(files);
    const maxSize = 300 * 1024 * 1024; // 300MB
    const allowedTypes = [
      "application/zip",
      "application/octet-stream",
      "application/x-zip",
      "application/x-zip-compressed",
      "application/msword",
      "application/vnd.ms-excel",
      "application/vnd.ms-powerpoint",
      "application/pdf",
    ];

    // Validate file size
    const invalidSize = fileArray.some((file) => file.size > maxSize);
    if (invalidSize) {
      setValidFileAttr((prev) => ({
        ...prev,
        validFiles: false,
        isValidFileSize: false,
      }));
      return;
    }

    // Validate file type
    const invalidType = fileArray.some(
      (file) => !allowedTypes.includes(file.type)
    );
    if (invalidType) {
      setValidFileAttr((prev) => ({
        ...prev,
        validFiles: false,
        isValidExtension: false,
      }));
      return;
    }

    setValidFileAttr({
      validFiles: true,
      isValidFileSize: true,
      isValidExtension: true,
    });

    setNewComment((prev) => ({
      ...prev,
      attachments: [...prev.attachments, ...fileArray],
    }));

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveFile = (
    index: number,
    selectedFiles: any,
    type: string,
    file: any
  ) => {
    const newAttachments = selectedFiles.filter(
      (_: any, i: number) => i !== index
    );
    if (type === "comment") {
      setNewComment((prev) => ({ ...prev, attachments: newAttachments }));
    }
  };

  const setEncAttachment = () => {
    if (
      encrypt &&
      newComment.attachments &&
      newComment.attachments.length > 0
    ) {
      newComment.attachments.forEach((file: any) => {
        file.encrypt = true;
      });
    }
  };

  const setSharedFileData = (docId: number) => {
    const data = {
      objId: docId,
      files: newComment?.attachments,
      comment: newComment?.comment,
      cmtContent: null,
      userIds: [],
      attType: CERT_OBJ_TYPE.task_comment,
      cmtType: "GIAO_VIEC_BINH_LUAN",
      objType: CERT_OBJ_TYPE.task_comment,
      userOrobj: CERT_OBJ_TYPE.user,
      onlyShareFileObject: true,
    };
    return data;
  };

  const doSaveNewCommentCToken = async (
    serialNumber: any,
    withToken: boolean
  ) => {
    if (withToken) {
      setNewComment((prev) => ({ ...prev, isToken: true }));
      if (userInfo.serialToken !== serialNumber) {
        ToastUtils.error("Bạn dùng không đúng chứng thư số");
        setClicked(false);
        return;
      }
    } else {
      setNewComment((prev) => ({ ...prev, isToken: false }));
    }

    if (encrypt) {
      const connect = await EncryptionService.checkConnect();
      if (connect === false) {
        setClicked(false);
        return;
      }
    }

    const comment = JSON.parse(JSON.stringify(newComment));
    comment.comment = `- ${comment.comment?.trim() || ""}`;
    setClicked(true);

    setEncAttachment();

    const data = setSharedFileData(Number(taskId));

    if (encrypt) {
      const rs = await uploadFileService.doSharePermissionDocFile(data);
      setClicked(false);
      if (rs === false) {
        setEncrypt(false);
        return;
      }
    } else {
      await uploadFileService.saveCmtAndAtmByNonEnc(data);
      if (refetchCommentList) {
        refetchCommentList();
      }
    }

    // Clear form and reset state after successful save
    setNewComment({ comment: "", attachments: [], isToken: false });
    setEncrypt(false);
    setClicked(false);
    setCommentError("");
  };

  const doSaveNewComment = async (withToken: boolean) => {
    if (!newComment.comment.trim() || newComment.comment.trim().length === 0) {
      setCommentError("Nội dung ý kiến phải chứa ít nhất 1 ký tự");
      return;
    }
    setCommentError("");

    let serialNumber = "";
    if (withToken) {
      await getTokenInfo(async (data: string) => {
        if (data === "") {
          ToastUtils.error("Lỗi khi lấy thông tin chứng thư số");
        } else if (data === "-100") {
          ToastUtils.error("Không kết nối được chứng thư số");
        } else {
          const tokenInfo = JSON.parse(b64DecodeUnicode(data));
          serialNumber = tokenInfo.SerialNumber;
          await doSaveNewCommentCToken(serialNumber, withToken);
        }
      });
    } else {
      await doSaveNewCommentCToken(serialNumber, withToken);
    }
  };

  const doUpdateResult = async (type: string) => {
    setClicked(false);
    if (!newComment.comment || newComment.comment.trim().length === 0) {
      setCommentError("Nội dung ý kiến phải chứa ít nhất 1 ký tự");
      return;
    }
    setCommentError("");

    const result = await TaskService.updateCommentByType(
      type,
      newComment.comment.trim(),
      Number(currentCommentEdit)
    );
    if (result) {
      ToastUtils.success("Cập nhật ý kiến thành công");
      setIsUpdateResult(false);
      setNewComment({ comment: "", attachments: [], isToken: false });
      setCurrentCommentEdit(null);
      if (refetchCommentList) {
        refetchCommentList();
      }
      setClicked(false);
      setEncrypt(false);
      setCommentError("");
    } else {
      ToastUtils.error("Cập nhật ý kiến thất bại");
      setIsUpdateResult(false);
      setNewComment({ comment: "", attachments: [], isToken: false });
      setCurrentCommentEdit(null);
      setClicked(false);
      setEncrypt(false);
      setCommentError("");
      if (refetchCommentList) {
        refetchCommentList();
      }
    }
  };

  const checkAttachment = (comment: any) => {
    return comment.attachments && comment.attachments.length > 0;
  };

  const doUpdateTaskStatus = async (result: any, type: string) => {
    setIsUpdateResult(true);
    setCurrentCommentEdit(result.id);
    if (type === "GIAO_VIEC_BINH_LUAN_2" || type === "GIAO_VIEC_BINH_LUAN") {
      setNewComment({
        comment: result.comment || "",
        attachments: [],
        isToken: result.isToken || false,
      });
    }
    setCommentError("");
  };

  const doDelete = async (resultId: any, type: any) => {
    const result = await delCommentByType([], [], type, resultId);

    if (result) {
      ToastUtils.success("Xóa ý kiến thành công");
      if (refetchCommentList) {
        refetchCommentList();
      }
    } else {
      ToastUtils.error("Xóa ý kiến thất bại");
      if (refetchCommentList) {
        refetchCommentList();
      }
    }
  };

  return (
    <>
      {/* Ý kiến xử lý */}
      <Card className="mt-4 border-none rounded-none">
        <CardHeader className="p-0">
          <span className="font-weight-bold text-info m-0 p-4 bg-gray-100 rounded-none text-blue-600">
            Ý kiến xử lý
          </span>
        </CardHeader>
        <CardContent className="mt-4">
          <div className="space-y-4">
            <div>
              <Textarea
                id="comment-content"
                name="comment"
                className={`w-full focus:ring-0 ${commentError ? "border-red-500" : ""}`}
                placeholder="Nhập nội dung ý kiến"
                maxLength={10000}
                value={newComment.comment}
                onChange={(e) => {
                  setNewComment((prev) => ({
                    ...prev,
                    comment: e.target.value,
                  }));
                  if (commentError && e.target.value.trim().length > 0) {
                    setCommentError("");
                  }
                }}
                rows={3}
              />
              {commentError && (
                <p className="text-red-500 text-xs mt-1">{commentError}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              {ENCRYPTION_TWD && !isUpdateResult && (
                <div className="flex items-center gap-2">
                  <Label className="text-sm">Mã hóa tệp tin</Label>
                  <Button
                    type="button"
                    className="clickable bg-white border-none shadow-none hover:bg-white px-0"
                    onClick={() => setEncrypt(!encrypt)}
                    title="Mã hóa tệp tin"
                    disabled={
                      !newComment.attachments ||
                      newComment.attachments.length === 0
                    }
                  >
                    <KeyRound
                      className={`w-4 h-4 ${encrypt ? "text-red-500" : "text-gray-400"}`}
                    />
                  </Button>
                </div>
              )}

              <div className="flex items-center gap-2">
                {!isUpdateResult && (
                  <Label htmlFor="upload-photo1" className="cursor-pointer">
                    <Paperclip className="w-4 h-4 text-blue-600" />
                  </Label>
                )}
                <Input
                  ref={fileInputRef}
                  id="upload-photo1"
                  type="file"
                  name="attachment"
                  multiple
                  accept="zip,application/octet-stream,application/zip,application/x-zip,application/x-zip-compressed,application/msword,application/vnd.ms-excel,application/vnd.ms-powerpoint,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {isUpdateResult ? (
                  <div className="flex gap-2">
                    <Button
                      className="btn btn-sm btn-success bg-blue-600 text-white hover:bg-blue-600"
                      disabled={clicked}
                      onClick={() =>
                        doUpdateResult(
                          isV2 ? "GIAO_VIEC_BINH_LUAN_2" : "GIAO_VIEC_BINH_LUAN"
                        )
                      }
                    >
                      <Edit className="w-4 h-4 mr-1" />
                      Cập nhật ý kiến
                    </Button>
                    <Button
                      variant="outline"
                      className="btn btn-sm"
                      onClick={() => {
                        setIsUpdateResult(false);
                        setCurrentCommentEdit(null);
                        setNewComment({
                          comment: "",
                          attachments: [],
                          isToken: false,
                        });
                        setCommentError("");
                      }}
                    >
                      Hủy
                    </Button>
                  </div>
                ) : (
                  <Button
                    className="btn btn-sm btn-info bg-blue-600 text-white hover:bg-blue-600"
                    disabled={clicked}
                    onClick={() => doSaveNewComment(false)}
                  >
                    <Share className="w-4 h-4 mr-1" />
                    Gửi ý kiến
                  </Button>
                )}
              </div>
            </div>

            {!validFileAttr.validFiles && (
              <div className="space-y-1">
                {!validFileAttr.isValidFileSize && (
                  <p className="text-red-500 text-xs">
                    Dung lượng file phải nhỏ hơn 300MB.
                  </p>
                )}
                {!validFileAttr.isValidExtension && (
                  <p className="text-red-500 text-xs">
                    File không đúng định dạng.
                  </p>
                )}
              </div>
            )}

            {newComment.attachments.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded"
              >
                <span className="text-sm">{file.name}</span>
                <Button
                  onClick={() =>
                    handleRemoveFile(
                      index,
                      [...newComment.attachments],
                      "comment",
                      file
                    )
                  }
                  className="text-red-500 hover:text-red-700 bg-transparent border-none shadow-none hover:bg-transparent"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Lịch sử ý kiến */}
      <Card className="mt-4 border-none rounded-none">
        <CardHeader className="p-0">
          <span className="font-weight-bold text-info m-0 p-4 bg-gray-100 rounded-none text-blue-600">
            Lịch sử ý kiến
          </span>
        </CardHeader>
        <CardContent className="p-4">
          {commentList &&
            commentList.length > 0 &&
            commentList.map((comment, index) => (
              <div key={index} className="mb-4 last:mb-0">
                <div className="flex items-start space-x-3">
                  {/* User Icon */}
                  <div className="flex-shrink-0 relative">
                    <div className="w-8 h-9 bg-gray-300 rounded-full flex items-center justify-center">
                      <UserCircle className="w-4 h-4 text-gray-600" />
                    </div>
                    {comment.isToken && (
                      <img
                        src="/v3/assets/images/usb-token.png"
                        alt="Token"
                        className="absolute -top-1 -right-1 w-4 h-4"
                      />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header with name and time */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-sm text-gray-900">
                          {comment.userFullName}
                        </span>
                        {comment.userFullName?.length > 0 &&
                          comment.userPosition && (
                            <span className="text-sm text-gray-500">
                              ({comment.userPosition})
                            </span>
                          )}
                      </div>
                    </div>

                    {/* Comment content */}
                    <div className="mb-2">
                      <span
                        className="text-sm text-gray-700"
                        style={{ whiteSpace: "pre-wrap" }}
                      >
                        {comment.comment}
                      </span>
                    </div>

                    <div className="mb-2">
                      <span className="text-xs text-gray-400">
                        Vào lúc: {getPassTime(comment.createDate)}
                      </span>
                    </div>

                    {/* Attachments */}
                    {checkAttachment(comment) && (
                      <div className="mb-2">
                        <span className="text-xs text-gray-500 font-medium">
                          Đính kèm:
                        </span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {comment.attachments.map(
                            (file: any, fileIndex: number) => (
                              <div
                                key={fileIndex}
                                className="flex items-center space-x-1"
                              >
                                <span
                                  className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer flex items-center space-x-1"
                                  onClick={() =>
                                    downloadFile(
                                      file.name,
                                      Constant.ATTACHMENT_DOWNLOAD_TYPE.TASK,
                                      file.encrypt
                                    )
                                  }
                                >
                                  <span>{file.displayName || file.name}</span>
                                  <Download className="w-3 h-3" />
                                </span>
                                {file.encrypt && (
                                  <Button
                                    onClick={() => {
                                      setSelectedFile(file);
                                      setShowSharedUserModal(true);
                                    }}
                                    className="text-xs text-green-600 hover:text-green-800 bg-white border-none shadow-none hover:bg-white px-0"
                                  >
                                    <Share className="w-3 h-3" />
                                  </Button>
                                )}
                              </div>
                            )
                          )}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    {currentUserId === comment.userId && (
                      <div className="flex items-center space-x-2 mt-2">
                        <Button
                          size="sm"
                          className="text-xs bg-green-500 text-white hover:bg-green-500"
                          onClick={() =>
                            doUpdateTaskStatus(
                              comment,
                              isV2
                                ? "GIAO_VIEC_BINH_LUAN_2"
                                : "GIAO_VIEC_BINH_LUAN"
                            )
                          }
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Chỉnh sửa
                        </Button>
                        <Button
                          size="sm"
                          className="text-xs bg-red-500 text-white hover:bg-red-500"
                          onClick={() => {
                            setDeleteCommentId(comment.id);
                            setIsDelete(true);
                          }}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Xóa
                        </Button>
                      </div>
                    )}
                  </div>
                </div>

                {index < commentList.length - 1 && (
                  <div className="border-b border-gray-100 mt-4" />
                )}
              </div>
            ))}
        </CardContent>
      </Card>

      <ConfirmDeleteDialog
        isOpen={isDelete}
        onOpenChange={(open) => {
          setIsDelete(open);
          if (!open) {
            setDeleteCommentId(null);
          }
        }}
        onConfirm={() => {
          if (deleteCommentId) {
            doDelete(
              deleteCommentId,
              isV2 ? "GIAO_VIEC_BINH_LUAN_2" : "GIAO_VIEC_BINH_LUAN"
            );
          }
        }}
        title="Hãy xác nhận"
        description="Bạn có chắc chắn muốn xóa ý kiến này?"
        confirmText="Đồng ý"
        cancelText="Đóng"
        isLoading={false}
      />

      <Dialog open={showSharedUserModal} onOpenChange={setShowSharedUserModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Chia sẻ người dùng</DialogTitle>
          </DialogHeader>
          <SharedUser
            fileNames={selectedFile?.name || ""}
            docId={taskId!}
            type={CERT_OBJ_TYPE.task}
            onClose={() => setShowSharedUserModal(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
