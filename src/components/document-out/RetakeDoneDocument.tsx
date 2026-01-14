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
import { SharedFileData } from "@/definitions/types/document-out.type";
import { DocumentService } from "@/services/document.service";
import { uploadFileService } from "@/services/file.service";
import { notificationService } from "@/services/notification.service";
import { b64DecodeUnicode } from "@/services/shared.service";
import { getTokenInfo } from "@/services/signature.service";
import { handleError } from "@/utils/common.utils";
import { getUserInfo } from "@/utils/token.utils";
import { KeyRound, RotateCcw, Upload, X } from "lucide-react";
import * as React from "react";
import { ToastUtils } from "@/utils/toast.utils";

interface RetakeDoneDocumentProps {
  docId: string;
  onClose: () => void;
  onSuccess?: () => void | Promise<void>;
  type?: boolean; // true: có file; false: route khác không file
  showRetakeDoneModal: boolean;
  setShowRetakeDoneModal: (show: boolean) => void;
  onSubmit?: (data: { processingContent: string; files: File[] }) => void;
}

export default function RetakeDoneDocument({
  docId,
  onClose,
  onSuccess,
  type = true,
  showRetakeDoneModal,
  setShowRetakeDoneModal,
  onSubmit: propOnSubmit,
}: RetakeDoneDocumentProps) {
  const [doneComment, setDoneComment] = React.useState<string>("");
  const [selectedFiles, setSelectedFiles] = React.useState<
    { file: File; encrypt: boolean }[]
  >([]);
  const [validFiles, setValidFiles] = React.useState<boolean>(true);
  const [inSubmit, setInSubmit] = React.useState<boolean>(false);
  const ENCRYPTION_TWD = Constant.ENCRYPTION_TWD;

  const getFileSizeString = (size: number): string => {
    const KB = size / 1024;
    const MB = KB / 1024;
    if (MB >= 0.1) return `${MB.toFixed(2)} MB`;
    if (KB > 0) return `${KB.toFixed(2)} KB`;
    return "";
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

  const doSelectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const setSharedFileData = (
    documentId: string,
    selectedFiles: any[],
    doneComment: string
  ): SharedFileData => {
    const data: any = {};
    data.objId = documentId;
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
  const doDoneDocumentTaskCheckToken = async (serialNumber: string) => {
    if (Constant.BCY_VERIFY_TOKEN) {
      const userInfo = JSON.parse(getUserInfo() || "{}");
      if (userInfo.serialToken !== serialNumber) {
        ToastUtils.error("Bạn dùng không đúng chứng thư số");
        return;
      }
    }
    setInSubmit(true);
    const data = setSharedFileData(docId, selectedFiles, doneComment);
    const rs = await uploadFileService.doSharePermissionDocFile(data);
    if (rs === false) {
      setInSubmit(false);
      return rs;
    }
    try {
      await DocumentService.doRetakeDoneDocument(
        Number(docId),
        data.comment,
        data.files
      );
      ToastUtils.success("Thu hồi thành công");
      if (onSuccess) {
        await onSuccess();
      }
      onClose();
      notificationService.countUnreadNotification();
    } catch (err) {
      uploadFileService.rollback(
        data.allFileNames,
        data.userIdShared,
        data.cmtType || ""
      );
      handleError(err);
    } finally {
      setInSubmit(false);
    }
  };

  const doDoneDocumentTask = async () => {
    // Nếu có callback từ document-in, sử dụng callback
    if (propOnSubmit) {
      propOnSubmit({
        processingContent: doneComment,
        files: selectedFiles.map((item) => item.file),
      });
      return;
    }

    // Logic cũ cho document-out
    if (type) {
      let serialNumber = "";
      if (Constant.BCY_VERIFY_TOKEN) {
        getTokenInfo((data) => {
          if (data === "") {
            ToastUtils.error("Lỗi khi lấy thông tin chứng thư số");
          } else if (data === "-100") {
            ToastUtils.error("Không kết nối được chứng thư số");
          } else {
            const tokenInfo = JSON.parse(b64DecodeUnicode(data));
            serialNumber = tokenInfo.SerialNumber;
            doDoneDocumentTaskCheckToken(serialNumber);
          }
        });
      } else {
        await doDoneDocumentTaskCheckToken(serialNumber);
      }
    } else {
      try {
        await DocumentService.doRetakeDoneDocument(
          Number(docId),
          doneComment,
          [],
          type
        );
        ToastUtils.success("Thu hồi thành công");
        onClose();
      } catch (err) {
        ToastUtils.error("Lỗi khi thu hồi văn bản");
      }
    }
  };

  return (
    <Dialog open={showRetakeDoneModal} onOpenChange={setShowRetakeDoneModal}>
      <DialogContent
        className="max-w-4xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Thu hồi hoàn thành</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!inSubmit) doDoneDocumentTask();
          }}
          className="space-y-4"
        >
          <div className="space-y-2">
            <label className="font-medium">Ý kiến xử lý</label>
            <Textarea
              name="comment"
              placeholder="Nhập lý do thu hồi hoàn thành..."
              value={doneComment}
              onChange={(e) => setDoneComment(e.target.value)}
              rows={4}
              className="px-3 py-2"
            />
          </div>

          {type && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
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
          )}

          <div className="flex justify-end gap-2">
            <Button
              type="submit"
              disabled={inSubmit}
              className="h-9 px-3 text-white border-0 bg-blue-600 hover:bg-blue-700 hover:text-white"
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
