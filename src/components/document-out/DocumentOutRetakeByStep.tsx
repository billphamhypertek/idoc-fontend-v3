import * as React from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { Constant } from "@/definitions/constants/constant";
import { CERT_OBJ_TYPE } from "@/definitions/enums/document.enum";
import { SharedFileData } from "@/definitions/types/document-out.type";
import { uploadFileService } from "@/services/file.service";
import { RetakeService } from "@/services/retake.service";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getErrorMessage } from "@/utils/common.utils";
import { Upload, Key, X, RotateCcw, KeyRound } from "lucide-react";
import { ToastUtils } from "@/utils/toast.utils";
interface DocumentOutRetakeByStepProps {
  docId: string;
  isDelegate: boolean;
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
  nodeHandleByUser?: any;
  type: string;
  title: string;
  showRetakeByStepModal: boolean;
  setShowRetakeByStepModal: (value: boolean) => void;
}

export default function DocumentOutRetakeByStep({
  docId,
  isDelegate,
  onClose,
  onSuccess,
  nodeHandleByUser,
  type,
  title,
  showRetakeByStepModal,
  setShowRetakeByStepModal,
}: DocumentOutRetakeByStepProps) {
  const [comment, setComment] = React.useState<string>("");
  const [errMessage, setErrMessage] = React.useState<string>("");
  const [attachments, setAttachments] = React.useState<
    { file: File; encrypt: boolean }[]
  >([]);
  const [validFiles, setValidFiles] = React.useState<boolean>(true);
  const [inSubmit, setInSubmit] = React.useState<boolean>(false);

  const ENCRYPTION_TWD = Constant.ENCRYPTION_TWD;

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
    const current = [...attachments];
    for (const f of Array.from(files)) {
      const exists = current.some(
        (x) =>
          (x.file.name || (x.file as any).webkitRelativePath) ===
          (f.name || (f as any).webkitRelativePath)
      );
      if (!exists) current.push({ file: f, encrypt: false });
    }
    setAttachments(current);
    e.target.value = "";
  };

  const onRemoveFile = (index: number) => {
    const next = [...attachments];
    next.splice(index, 1);
    setAttachments(next);
  };

  const onToggleEncrypt = (index: number) => {
    setAttachments((prev) => {
      const next = [...prev];
      if (next[index])
        next[index] = { ...next[index], encrypt: !next[index].encrypt };
      return next;
    });
  };

  const setSharedFileData = (): SharedFileData => {
    return {
      objId: Number(docId),
      files: attachments.map((i) => i.file),
      comment: comment,
      userIdShared: [],
      allFileNames: [],
      attType: CERT_OBJ_TYPE.doc_in_add,
      cmtType: "VAN_BAN_DEN_CMT",
      objType: CERT_OBJ_TYPE.doc_in_done,
      userOrobj: CERT_OBJ_TYPE.org,
      checkObjEnc: false,
    };
  };

  const handleSubmit = async () => {
    if (!comment && attachments.length > 0) {
      ToastUtils.error("Phải nhập lý do thu hồi khi có tệp đính kèm.");
      return;
    }
    if (comment && comment.length > 200) {
      setErrMessage("Ý kiến xử lý chỉ tối đa 2000 kí tự.");
      return;
    } else {
      setErrMessage("");
    }

    setInSubmit(true);
    const data = setSharedFileData();
    const rs = await uploadFileService.doSharePermissionDocFile(data);
    if (rs === false) {
      setInSubmit(false);
      return;
    }

    // reset theo Angular: comment và attachments lấy từ data đã xử lý
    try {
      const res =
        type == "step-retake"
          ? await RetakeService.doStepRetakeDocOut(
              docId,
              { comment: data.comment, attachments: data.files },
              false,
              nodeHandleByUser
            )
          : await RetakeService.doRetakeDocOut(
              docId,
              { comment: data.comment, attachments: data.files },
              isDelegate
            );
      if (res) {
        ToastUtils.success("Thu hồi văn bản thành công");
        if (onSuccess) {
          await onSuccess();
        }
        onClose();
      }
    } catch (err) {
      ToastUtils.error("Thu hồi văn bản không thành công");
    } finally {
      setInSubmit(false);
    }
  };
  return (
    <Dialog
      open={showRetakeByStepModal}
      onOpenChange={setShowRetakeByStepModal}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thu hồi văn bản</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-900 mb-3 block">
              Lý do thu hồi
            </label>
            <Textarea
              placeholder="Nhập lý do thu hồi..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
            />
            {!comment && attachments.length > 0 && (
              <div className="text-red-500 text-sm mt-1">
                Phải nhập lý do thu hồi khi có tệp đính kèm.
              </div>
            )}
            {errMessage && (
              <div className="text-red-500 text-sm mt-1">{errMessage}</div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Button
                type="button"
                className="h-9 px-3 text-white border-0 hover:text-white bg-blue-600 hover:bg-blue-700"
                onMouseEnter={(e) =>
                  (e.currentTarget.style.backgroundColor = "#3a7bc8")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.backgroundColor = "#4798e8")
                }
                onClick={() =>
                  document.getElementById("retakeFileUpload")?.click()
                }
              >
                <Upload className="w-4 h-4 mr-1" />
                Chọn tệp
              </Button>
              <input
                id="retakeFileUpload"
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
              {attachments.map((item, i) => (
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
                      <KeyRound
                        className={`w-4 h-4 ${
                          item.encrypt ? "text-red-500" : "text-gray-400"
                        }`}
                      />
                    </button>
                  )}
                  <span>
                    {item.file.name} (
                    {(item.file.size / 1024 / 1024).toFixed(2)} MB)
                  </span>
                  <button
                    type="button"
                    onClick={() => onRemoveFile(i)}
                    className="text-red-500 hover:text-red-700 cursor-pointer"
                    title="Xóa tệp"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Hủy
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={(!comment && attachments.length > 0) || inSubmit}
              className="h-9 px-3 text-white border-0 hover:text-white bg-blue-600 hover:bg-blue-700"
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#3a7bc8")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#4798e8")
              }
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Thu hồi
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
