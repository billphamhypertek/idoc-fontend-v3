import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ToastUtils } from "@/utils/toast.utils";
import { Constant } from "@/definitions/constants/constant";
import { DocumentService } from "@/services/document.service";
import { uploadFileService } from "@/services/file.service";
import { getUserInfo } from "@/utils/token.utils";
import { b64DecodeUnicode } from "@/services/shared.service";
import { getTokenInfo } from "@/services/signature.service";
import { notificationService } from "@/services/notification.service";
import { handleError, isExistFile, validFileSSize } from "@/utils/common.utils";
import { CERT_OBJ_TYPE } from "@/definitions/enums/document.enum";
import { SharedFileData } from "@/definitions/types/document-out.type";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/definitions";
import { Upload, Key, X, CheckSquare, KeyRound } from "lucide-react";

interface DocumentProcessDoneProps {
  docId: string | string[];
  isFinishReceive?: boolean;
  opinionRequired?: boolean;
  isDelegate?: boolean;
  onClose: () => void;
  showProcessDoneModal: boolean;
  setShowProcessDoneModal: (value: boolean) => void;
  onSubmit?: (data: { processingContent: string; files: File[] }) => void;
}

export default function DocumentProcessDone({
  docId,
  isFinishReceive,
  opinionRequired = false,
  onClose,
  showProcessDoneModal,
  setShowProcessDoneModal,
  onSubmit: propOnSubmit,
}: DocumentProcessDoneProps) {
  const [doneComment, setDoneComment] = useState("");
  const queryClient = useQueryClient();
  const [selectedFiles, setSelectedFiles] = useState<
    { file: File; encrypt: boolean }[]
  >([]);
  const [validFiles, setValidFiles] = useState(true);
  const [inSubmit, setInSubmit] = useState(false);
  const ENCRYPTION_TWD = Constant.ENCRYPTION_TWD;

  const getFileSizeString = (size: number): string => {
    const KB = size / 1024;
    const MB = KB / 1024;
    if (MB >= 0.1) return `${MB.toFixed(2)} MB`;
    if (KB > 0) return `${KB.toFixed(2)} KB`;
    return "";
  };

  const doSelectFiles: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (!validFileSSize(files)) {
      setValidFiles(false);
      e.target.value = "";
      return;
    }
    setValidFiles(true);
    const current = [...selectedFiles];
    for (const f of Array.from(files)) {
      const exists = isExistFile(
        f.name || (f as any).webkitRelativePath,
        current.map((x) => ({ name: x.file.name }) as any)
      );
      if (!exists) current.push({ file: f, encrypt: false });
    }
    setSelectedFiles(current);
    e.target.value = "";
  };

  const doRemoveFile = (index: number) => {
    const next = [...selectedFiles];
    next.splice(index, 1);
    setSelectedFiles(next);
  };

  const changeEncrypt = (index: number) => {
    setSelectedFiles((prev) => {
      const next = [...prev];
      if (next[index])
        next[index] = { ...next[index], encrypt: !next[index].encrypt };
      return next;
    });
  };

  const setSharedFileData = (id: string): SharedFileData => {
    const data: any = {} as SharedFileData;
    data.objId = id;
    data.files = selectedFiles;
    data.comment = doneComment;
    data.userIdShared = [];
    data.allFileNames = [];
    data.attType = CERT_OBJ_TYPE.doc_in_add;
    data.cmtType = "VAN_BAN_DEN_CMT";
    data.objType = CERT_OBJ_TYPE.doc_in_done;
    data.userOrobj = CERT_OBJ_TYPE.org;
    data.checkObjEnc = false;
    return data;
  };

  const doneOneElement = async (id: string) => {
    const data = setSharedFileData(id);
    const rs = await uploadFileService.doSharePermissionDocFile(data);
    if (rs === false) {
      return rs;
    }
    try {
      await DocumentService.doDoneDocumentTask(
        Number(id),
        data.comment,
        (data.files as any[]).map((x: any) => x.file ?? x) as File[],
        !!isFinishReceive
      );
      ToastUtils.documentCompleteSuccess();
      notificationService.countUnreadNotification();
      onClose();
    } catch (err) {
      await uploadFileService.rollback(
        data.allFileNames ?? [],
        data.userIdShared ?? [],
        data.cmtType ?? "",
        data.cmtIdSaved != null ? String(data.cmtIdSaved) : null
      );
      handleError(err);
    }
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

    // Handle multi or single id
    const ids = Array.isArray(docId) ? docId : [docId];
    for (const id of ids) {
      // eslint-disable-next-line no-await-in-loop
      await doneOneElement(id);
    }
    setInSubmit(false);
  };

  const onSubmit = async () => {
    if (opinionRequired && !doneComment.trim()) {
      ToastUtils.yKienXuLyBatBuocNhap();
      return;
    }
    if (doneComment.length > 2000) {
      ToastUtils.yKienXuLyKhongDuocDaiQua2000KyTu();
      return;
    }

    // Nếu có callback từ document-in, sử dụng callback
    if (propOnSubmit) {
      propOnSubmit({
        processingContent: doneComment,
        files: selectedFiles.map((item) => item.file),
      });
      return;
    }

    // Logic cũ cho document-out
    let serialNumber = "";
    if (Constant.BCY_VERIFY_TOKEN) {
      getTokenInfo((data) => {
        if (data === "") {
          ToastUtils.loiKhiLayThongTinChungThuSo();
        } else if (data === "-100") {
          ToastUtils.khongKetNoiDuocChungThuSo();
        } else {
          const tokenInfo = JSON.parse(b64DecodeUnicode(data));
          serialNumber = tokenInfo.SerialNumber;
          doDoneDocumentTaskCheckToken(serialNumber);
        }
      });
    } else {
      await doDoneDocumentTaskCheckToken(serialNumber);
    }
    queryClient.invalidateQueries({
      queryKey: [queryKeys.documentOut.list],
    });
  };

  return (
    <Dialog open={showProcessDoneModal} onOpenChange={setShowProcessDoneModal}>
      <DialogContent
        className="max-w-4xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Hoàn thành</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!inSubmit) onSubmit();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label className="font-medium">
              Ý kiến xử lý
              {opinionRequired && <span className="text-red-500">*</span>}
            </label>
            <Textarea
              name="comment"
              placeholder="Nhập ý kiến hoàn thành..."
              value={doneComment}
              onChange={(e) => setDoneComment(e.target.value)}
              rows={4}
              maxLength={2000}
              className="px-3 py-2"
            />
            <div className="text-red-500 text-sm">
              {doneComment.length > 2000 &&
                "Ý kiến xử lý không được dài quá 2000 ký tự"}
              {opinionRequired &&
                !doneComment.trim() &&
                " Ý kiến xử lý bắt buộc nhập."}
            </div>
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
                  document.getElementById("doneFileUpload")?.click()
                }
              >
                <Upload className="w-4 h-4 mr-1" />
                Chọn tệp
              </Button>
              <input
                id="doneFileUpload"
                hidden
                type="file"
                name="attachment"
                multiple
                onChange={doSelectFiles}
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
                      onClick={() => changeEncrypt(i)}
                    >
                      <KeyRound
                        className={
                          item.encrypt
                            ? "w-4 h-4 text-red-500"
                            : "w-4 h-4 text-gray-500"
                        }
                      />
                    </button>
                  )}
                  <span>
                    {item.file.name} ({getFileSizeString(item.file.size)})
                  </span>
                  <X
                    onClick={() => doRemoveFile(i)}
                    className="w-4 h-4 text-red-500 ml-1 cursor-pointer"
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="submit"
              disabled={inSubmit}
              className="h-9 px-3 text-white border-0 hover:text-white bg-blue-600 hover:bg-blue-700"
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#3a7bc8")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#4798e8")
              }
            >
              <CheckSquare className="w-4 h-4 mr-1" />
              Hoàn thành
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="h-9 px-3"
            >
              Đóng
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
