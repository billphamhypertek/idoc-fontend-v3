import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Constant } from "@/definitions/constants/constant";
import { CERT_OBJ_TYPE } from "@/definitions/enums/document.enum";
import { TokenInfo } from "@/definitions/types/auth.type";
import { ToastUtils } from "@/utils/toast.utils";
import { uploadFileService } from "@/services/file.service";
import { notificationService } from "@/services/notification.service";
import { b64DecodeUnicode } from "@/services/shared.service";
import { getTokenInfo } from "@/services/signature.service";
import { handleError } from "@/utils/common.utils";
import { getUserInfo } from "@/utils/token.utils";
import { KeyIcon, Trash2 } from "lucide-react";
import * as React from "react";
import { useReplyComment } from "@/hooks/data/document-out.data";
import { useRouter } from "next/navigation";

interface DocumentOutCommentProps {
  docId: string;
  isFinishReceive: boolean;
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
  showAskIdeaModal: boolean;
  setShowAskIdeaModal: (show: boolean) => void;
}

export default function DocumentOutComment({
  docId,
  isFinishReceive,
  onClose,
  onSuccess,
  showAskIdeaModal,
  setShowAskIdeaModal,
}: DocumentOutCommentProps) {
  const [comment, setComment] = React.useState<string>("");
  const [selectedFiles, setSelectedFiles] = React.useState<
    { file: File; encrypt: boolean }[]
  >([]);
  const [validFiles, setValidFiles] = React.useState<boolean>(true);
  const [inSubmit, setInSubmit] = React.useState<boolean>(false);
  const ENCRYPTION_TWD = Constant.ENCRYPTION_TWD;
  const router = useRouter();

  const replyCommentMutation = useReplyComment();

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
      if (next[index])
        next[index] = { ...next[index], encrypt: !next[index].encrypt };
      return next;
    });
  };

  const handleSubmit = async () => {
    let serialNumber = "";
    if (Constant.BCY_VERIFY_TOKEN) {
      getTokenInfo(async (data: string) => {
        if (data === "") {
          ToastUtils.loiKhiLayThongTinChungThuSo();
        } else if (data === "-100") {
          ToastUtils.khongKetNoiDuocChungThuSo();
        } else {
          const tokenInfo: TokenInfo = JSON.parse(
            b64DecodeUnicode(data) || "{}"
          );
          serialNumber = tokenInfo.SerialNumber || "";
          await doDoneDocumentTaskCheckToken(serialNumber);
          router.refresh();
        }
      });
    } else {
      await doDoneDocumentTaskCheckToken(serialNumber);
      router.refresh();
    }
  };

  const setSharedFileData = () => {
    const data: any = {};
    data.objId = docId;
    data.files = selectedFiles.map((item) => item.file); // Extract only the File objects
    data.comment = comment;
    data.userIdShared = [];
    data.allFileNames = [];
    data.attType = CERT_OBJ_TYPE.doc_in_add;
    data.cmtType = "VAN_BAN_DEN_CMT";
    data.objType = CERT_OBJ_TYPE.doc_in_comment;
    data.userOrobj = CERT_OBJ_TYPE.org;
    data.checkObjEnc = false;
    return data;
  };
  const doDoneDocumentTaskCheckToken = async (serialNumber: string) => {
    if (Constant.BCY_VERIFY_TOKEN) {
      const userInfo = JSON.parse(getUserInfo() || "{}");
      if (userInfo.serialToken !== serialNumber) {
        ToastUtils.banDungKhongDungChungThuSo();
        return;
      }
    }
    setInSubmit(true);
    const data = setSharedFileData();
    const rs = await uploadFileService.doSharePermissionDocFile(data);
    if (rs === false) {
      setInSubmit(false);
      return rs;
    }
    try {
      // Create FormData like Angular
      const formData = new FormData();
      if (data.files && data.files.length > 0) {
        for (const file of data.files) {
          formData.append("files", file);
        }
      }
      formData.append("comment", data.comment);

      await replyCommentMutation.mutateAsync({
        docId: Number(docId),
        formData,
      });

      ToastUtils.commentCreateSuccess();
      setShowAskIdeaModal(false); // Close modal first
      if (onSuccess) {
        await onSuccess();
      }
      onClose(); // Then call onClose callback
      notificationService.countUnreadNotification();
      setInSubmit(false);
    } catch (err) {
      setInSubmit(false);
      handleError(err);
      await uploadFileService.rollback(
        data.allFileNames,
        data.userIdShared,
        data.cmtType
      );
    }
  };

  return (
    <Dialog open={showAskIdeaModal} onOpenChange={setShowAskIdeaModal}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{"Cho ý kiến"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Textarea
            placeholder={"Nhập ý kiến..."}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={4}
            maxLength={2000}
            className="px-3 py-2"
          />

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <label
                htmlFor="doneFileUpload"
                className="btn btn-success m-0 cursor-pointer px-3 py-1.5 border rounded bg-blue-600 text-white hover:bg-blue-700"
              >
                Chọn tệp
              </label>
              <input
                id="doneFileUpload"
                hidden
                type="file"
                multiple
                onChange={onSelectFiles}
              />
            </div>
            {!validFiles && (
              <p className="text-red-500 text-sm">
                Kích thước tệp không hợp lệ
              </p>
            )}
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
                      {item.encrypt ? (
                        <KeyIcon
                          className=" text-red-500"
                          aria-hidden="true"
                        ></KeyIcon>
                      ) : (
                        <KeyIcon
                          className=" text-secondary"
                          aria-hidden="true"
                        ></KeyIcon>
                      )}
                    </button>
                  )}
                  <span>
                    {item.file.name} (
                    {(item.file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                  <Trash2
                    onClick={() => onRemoveFile(i)}
                    className=" text-red-500 ml-1 cursor-pointer"
                  ></Trash2>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Đóng
            </Button>
            <Button onClick={handleSubmit} disabled={inSubmit}>
              Gửi
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
