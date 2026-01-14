"use client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { queryKeys } from "@/definitions";
import { Constant } from "@/definitions/constants/constant";
import { CERT_OBJ_TYPE } from "@/definitions/enums/document.enum";
import { SharedFileData } from "@/definitions/types/document-out.type";
import type { ReturnDocumentInUser } from "@/definitions/types/document.type";
import { useReturnDocument, useGetListSend } from "@/hooks/data/document.data";
import { uploadFileService } from "@/services/file.service";
import { notificationService } from "@/services/notification.service";
import { handleError } from "@/utils/common.utils";
import { ToastUtils } from "@/utils/toast.utils";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2, Upload, Send } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

interface DocumentRejectProps {
  docId: string;
  onClose: () => void;
  showRejectModal: boolean;
  setShowRejectModal: (show: boolean) => void;
  onSuccess?: () => void;
  listReceiveAndSend?: ReturnDocumentInUser[];
  showUserSelection?: boolean;
  onSubmit?: (data: {
    processingContent: string;
    userId?: string;
    files: File[];
  }) => void;
}

export default function DocumentReject({
  docId,
  onClose,
  showRejectModal,
  setShowRejectModal,
  onSuccess,
  listReceiveAndSend: propListReceiveAndSend,
  showUserSelection = true,
  onSubmit: propOnSubmit,
}: DocumentRejectProps) {
  const [comment, setComment] = useState<string>("");
  const [listReceiveAndSend, setListReceiveAndSend] = useState<
    ReturnDocumentInUser[]
  >([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const queryClient = useQueryClient();
  const [selectedFiles, setSelectedFiles] = useState<
    { file: File; encrypt: boolean }[]
  >([]);
  const [validFiles, setValidFiles] = useState<boolean>(true);
  const [pid, setPid] = useState<number | null>(null);
  const [error, setError] = useState<string>("");
  const [inSubmit, setInSubmit] = useState<boolean>(false);
  const ENCRYPTION_TWD = Constant.ENCRYPTION_TWD;
  const rejectMutation = useReturnDocument();

  // Fetch list of users to send/return document to (chỉ khi showUserSelection = true)
  const { data: listSendData } = useGetListSend(
    docId ? Number(docId) : undefined,
    showUserSelection && !propListReceiveAndSend && showRejectModal
  );
  useEffect(() => {
    if (!showUserSelection) {
      setListReceiveAndSend([]);
      return;
    }
    if (propListReceiveAndSend) {
      setListReceiveAndSend(propListReceiveAndSend);
    } else if (listSendData) {
      setListReceiveAndSend(listSendData || []);
    }
  }, [propListReceiveAndSend, listSendData, showUserSelection]);

  const updateSubmitState = useCallback(
    (nextComment: string, nextPid: number | null, nextUserId: string = "") => {
      if (!showUserSelection) {
        setInSubmit(true);
        return;
      }
      // Nếu có danh sách người nhận từ props (document-in), cần comment và userId
      // Nếu không có danh sách (document-out), cần cả comment và pid
      const hasUserList =
        propListReceiveAndSend && propListReceiveAndSend.length > 0;
      const canSubmit = hasUserList
        ? Boolean(
            nextUserId &&
              (nextComment ? nextComment.trim().length <= 2000 : true)
          )
        : Boolean(
            nextPid && (nextComment ? nextComment.trim().length <= 2000 : true)
          );
      setInSubmit(canSubmit);
    },
    [propListReceiveAndSend, showUserSelection]
  );

  const onChangeComment = (value: string) => {
    setComment(value);
    if (value.length <= 2000) {
      setError("");
    } else {
      setError("Lý do trả lại không được dài quá 2000 ký tự");
    }
    updateSubmitState(value, pid, selectedUserId);
  };

  const onClickRadio = (nextPid: number) => {
    setPid(nextPid);
    updateSubmitState(comment, nextPid, selectedUserId);
  };

  const onSelectUser = (userId: string) => {
    setSelectedUserId(userId);
    updateSubmitState(comment, pid, userId);
  };

  const validFileSize = (files: FileList | File[]): boolean => {
    const MAX_SINGLE = 100 * 1024 * 1024;
    const MAX_TOTAL = 300 * 1024 * 1024;
    let total = 0;
    const arr: File[] = Array.isArray(files) ? files : Array.from(files);
    for (const f of arr) {
      if (f.size > MAX_SINGLE) return false;
      total += f.size;
      if (total > MAX_TOTAL) return false;
    }
    return true;
  };

  const onSelectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (!validFileSize(files)) {
      setValidFiles(false);
      e.target.value = "";
      return;
    }
    setValidFiles(true);
    const current = [...selectedFiles];
    for (const f of Array.from(files)) {
      const exists = current.some(
        (x) =>
          (x.file.name || (x.file as any).webkitRelativePath) ===
          (f.name || (f as any).webkitRelativePath)
      );
      if (!exists) current.push({ file: f, encrypt: false });
    }
    setSelectedFiles(current);
    e.target.value = "";
  };

  const onRemoveFile = (index: number) => {
    const next = [...selectedFiles];
    next.splice(index, 1);
    setSelectedFiles(next);
  };

  const onToggleEncrypt = (index: number) => {
    setSelectedFiles((prev) => {
      const next = [...prev];
      if (next[index]) {
        next[index] = { ...next[index], encrypt: !next[index].encrypt };
      }
      return next;
    });
  };

  const setSharedFileData = (): SharedFileData => {
    return {
      objId: Number(docId),
      files: selectedFiles.map((item) => item.file),
      comment: comment,
      userIdShared: [],
      allFileNames: [],
      attType: CERT_OBJ_TYPE.doc_in_add,
      cmtType: "VAN_BAN_DEN_CMT",
      objType: CERT_OBJ_TYPE.doc_in_return,
      userOrobj: CERT_OBJ_TYPE.org,
      checkObjEnc: false,
    };
  };

  const handleSubmit = async () => {
    // Validate độ dài luôn áp dụng
    if (comment.length > 2000) {
      setError("Lý do trả lại không được dài quá 2000 ký tự");
      return;
    }

    // Nếu có callback onSubmit (cho InReject hoặc OutReject với custom logic)
    if (propOnSubmit) {
      // Nếu không cần user selection, không cần kiểm tra user
      if (!showUserSelection) {
        propOnSubmit({
          processingContent: comment,
          files: selectedFiles.map((item) => item.file),
        });
        return;
      }

      // Nếu cần user selection, kiểm tra user
      const hasUserList =
        propListReceiveAndSend && propListReceiveAndSend.length > 0;
      if (hasUserList) {
        if (!selectedUserId) {
          ToastUtils.error("Bạn cần chọn người nhận trả");
          return;
        }
        propOnSubmit({
          processingContent: comment,
          userId: selectedUserId,
          files: selectedFiles.map((item) => item.file),
        });
        return;
      }

      // Trường hợp có user list nhưng không từ props
      if (!pid) {
        ToastUtils.error("Bạn cần chọn người nhận trả");
        return;
      }
      propOnSubmit({
        processingContent: comment,
        userId: String(pid),
        files: selectedFiles.map((item) => item.file),
      });
      return;
    }

    // Logic mặc định cho document-out (không có callback)
    if (showUserSelection && !pid) {
      ToastUtils.error("Bạn cần chọn người nhận trả");
      return;
    }

    setInSubmit(true);
    const data = setSharedFileData();

    const rs = await uploadFileService.doSharePermissionDocFile(data);
    if (rs === false) {
      setInSubmit(false);
      return;
    }

    try {
      await rejectMutation.mutateAsync({
        selectedFiles: selectedFiles.map((item) => item.file),
        pid: String(pid),
        documentId: Number(docId),
        rejectComment: comment,
      });
      ToastUtils.success("Trả văn bản thành công");
      onClose();
      if (onSuccess) onSuccess();
      queryClient.invalidateQueries({
        queryKey: [queryKeys.documentOut.detail, Number(docId)],
      });
      notificationService.countUnreadNotification();
    } catch (err) {
      await uploadFileService.rollback(
        data.allFileNames,
        data.userIdShared,
        data.cmtType || ""
      );
      ToastUtils.error("Trả văn bản thất bại");
      handleError(err);
    } finally {
      setInSubmit(false);
    }
  };

  return (
    <Dialog open={showRejectModal} onOpenChange={setShowRejectModal}>
      <DialogContent
        className="max-w-4xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Trả lại văn bản</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label className="font-bold">Lý do trả lại</label>
            <Textarea
              placeholder="Nhập lý do trả lại..."
              value={comment}
              onChange={(e) => onChangeComment(e.target.value)}
              rows={4}
            />
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <Button
                type="button"
                className="h-9 px-3 text-white border-0 bg-blue-600 hover:bg-blue-700 hover:text-white"
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#3a7bc8")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#4798e8")
                }
                onClick={() =>
                  document.getElementById("rejectFileUpload")?.click()
                }
              >
                <Upload className="w-4 h-4 mr-1" />
                Chọn tệp
              </Button>
              <input
                id="rejectFileUpload"
                type="file"
                multiple
                hidden
                onChange={onSelectFiles}
              />
              {!validFiles && (
                <p className="text-red-500 text-sm">
                  Kích thước tệp không hợp lệ
                </p>
              )}
            </div>
            <div className="space-y-1">
              {selectedFiles.map((item, i) => (
                <div
                  key={`${item.file.name}-${i}`}
                  className="flex items-center gap-2 text-sm"
                >
                  {ENCRYPTION_TWD && (
                    <button
                      type="button"
                      className="mx-1"
                      title="Mã hóa tệp tin"
                      onClick={() => onToggleEncrypt(i)}
                    >
                      <i
                        className={
                          item.encrypt
                            ? "fa fa-key text-red-500"
                            : "fa fa-key text-secondary"
                        }
                        aria-hidden="true"
                      ></i>
                    </button>
                  )}
                  <span>
                    {item.file.name} (
                    {(item.file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                  <Trash2
                    onClick={() => onRemoveFile(i)}
                    className="fas fa-window-close text-red-500 ml-1 cursor-pointer h-3"
                  />
                </div>
              ))}
            </div>
          </div>

          {showUserSelection && (
            <div className="space-y-2">
              <label className="font-medium">Chọn người nhận trả</label>
              <div className="border rounded overflow-hidden">
                <table className="w-full bg-white table-fixed">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 py-2 w-12 text-left">STT</th>
                      <th className="px-2 py-2 text-left">Họ tên</th>
                      <th className="px-2 py-2 text-left">Chức danh</th>
                      <th className="px-2 py-2 text-left">Đơn vị</th>
                      <th className="px-2 py-2 w-16 text-center">Chọn</th>
                    </tr>
                  </thead>
                  <tbody>
                    {listReceiveAndSend.map((item, index) => (
                      <tr key={`${item.userId}-${index}`} className="border-t">
                        <td className="px-2 py-2">{index + 1}</td>
                        <td className="px-2 py-2">{item.fullName}</td>
                        <td className="px-2 py-2">{item.positionName}</td>
                        <td className="px-2 py-2">{item.orgName}</td>
                        <td className="px-2 py-2 text-center">
                          <input
                            type="radio"
                            name="reject_pid"
                            checked={
                              propListReceiveAndSend &&
                              propListReceiveAndSend.length > 0
                                ? selectedUserId === String(item.userId)
                                : pid === item.pId
                            }
                            onChange={() => {
                              if (
                                propListReceiveAndSend &&
                                propListReceiveAndSend.length > 0
                              ) {
                                onSelectUser(String(item.userId));
                              } else {
                                onClickRadio(item.pId as number);
                              }
                            }}
                            className="cursor-pointer"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button
              type="submit"
              className="flex items-center gap-1 h-9 px-2 text-xs text-white hover:bg-blue-700 hover:text-white border-none bg-blue-600"
            >
              <Send className="w-4 h-4" />
              Gửi trả lại
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
