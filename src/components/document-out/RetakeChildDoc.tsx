import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Constant } from "@/definitions/constants/constant";
import { DocumentService } from "@/services/document.service";
import { ToastUtils } from "@/utils/toast.utils";
import * as React from "react";

interface RetakeDoneDocumentProps {
  docId: string;
  onClose: () => void;
  isRetakeDelegateDoc?: boolean;
  showRetakeChildDocModal: boolean;
  setShowRetakeChildDocModal: (show: boolean) => void;
}

export default function RetakeChildDocument({
  docId,
  onClose,
  isRetakeDelegateDoc = false,
  showRetakeChildDocModal,
  setShowRetakeChildDocModal,
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
    // Encryption toggle is not used in Angular flow; keep UI no-op if disabled
    setSelectedFiles((prev) => {
      const next = [...prev];
      if (next[index])
        next[index] = { ...next[index], encrypt: !next[index].encrypt };
      return next;
    });
  };

  const doRetakeDocumentTask = async () => {
    try {
      setInSubmit(true);
      const files = selectedFiles.map((f) => f.file);
      const commentPayload: any = { comment: doneComment, attachments: files };
      await DocumentService.doRetakeChildrenDocument(
        Number(docId),
        commentPayload,
        files,
        isRetakeDelegateDoc
      );
      ToastUtils.success("Thu hồi thành công");
      onClose();
    } catch (err) {
      ToastUtils.error("Lỗi khi thu hồi văn bản");
    } finally {
      setInSubmit(false);
    }
  };

  return (
    <Dialog
      open={showRetakeChildDocModal}
      onOpenChange={setShowRetakeChildDocModal}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thu hồi</DialogTitle>
        </DialogHeader>{" "}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!inSubmit) doRetakeDocumentTask();
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
            />
          </div>

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
                    {item.file.name} ({getFileSizeString(item.file.size)})
                  </span>
                  <i
                    onClick={() => doRemoveFile(i)}
                    className="fas fa-window-close text-red-500 ml-1 cursor-pointer"
                  ></i>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Đóng
            </Button>
            <Button type="submit" variant="destructive" disabled={inSubmit}>
              Thu hồi
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
