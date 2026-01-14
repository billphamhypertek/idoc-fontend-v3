import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogContent,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CERT_OBJ_TYPE } from "@/definitions/enums/document.enum";
import { uploadFileService } from "@/services/file.service";
import {
  getFileSizeString,
  isExistFile,
  validFileSize,
} from "@/utils/file.utils";
import { File, Trash2, Upload, CheckCircle } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { ToastUtils } from "@/utils/toast.utils";
import { useUpdateAcceptTask } from "@/hooks/data/task-action.data";

interface DoneTaskProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  isExecute: boolean;
  taskId: number;
  refetch: () => void;
  UserInfo: any;
  isV2?: boolean;
}
export default function DoneTask({
  isOpen,
  onOpenChange,
  onClose,
  isExecute,
  taskId,
  refetch,
  UserInfo,
  isV2 = false,
}: DoneTaskProps) {
  const [doneComment, setDoneComment] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<
    (File & { encrypt?: boolean })[]
  >([]);
  const [inSubmit, setInSubmit] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [validFileAttr, setValidFileAttr] = useState({
    validFiles: true,
    isValidFileSize: true,
    isValidExtension: true,
  });
  const [commentError, setCommentError] = useState("");
  const { mutateAsync: updateAcceptTask } = useUpdateAcceptTask(isV2 ?? false);

  // Clear all information when dialog opens
  useEffect(() => {
    if (isOpen) {
      setDoneComment("");
      setSelectedFiles([]);
      setCommentError("");
      setValidFileAttr({
        validFiles: true,
        isValidFileSize: true,
        isValidExtension: true,
      });
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [isOpen]);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    if (!validFileSize(files)) {
      setValidFileAttr((prev) => ({
        ...prev,
        validFiles: false,
        isValidFileSize: false,
      }));
      return;
    }

    const newFiles = Array.from(files).filter(
      (file) => !isExistFile(file.name, selectedFiles)
    );

    setSelectedFiles((prev) => [...prev, ...newFiles]);
    setValidFileAttr((prev) => ({
      ...prev,
      validFiles: true,
      isValidFileSize: true,
    }));

    // Reset input
    event.target.value = "";
  };

  const setSharedFileData = (docId: number) => {
    const data = {
      objId: docId,
      files: selectedFiles,
      comment: doneComment,
      userIdShared: [],
      allFileNames: [],
      attType: CERT_OBJ_TYPE.task,
      cmtType: "GIAO_VIEC_BINH_LUAN",
      objType: CERT_OBJ_TYPE.task,
      userOrobj: CERT_OBJ_TYPE.org,
      checkObjEnc: false,
    };

    return data;
  };
  const setSharedFileDataV2 = (docId: number) => {
    const data = {
      objId: docId,
      files: selectedFiles,
      comment: doneComment,
      userIdShared: [],
      allFileNames: [],
      attType: CERT_OBJ_TYPE.task2,
      cmtType: "GIAO_VIEC_BINH_LUAN_2",
      objType: CERT_OBJ_TYPE.task2,
      userOrobj: CERT_OBJ_TYPE.org,
      checkObjEnc: false,
    };

    return data;
  };

  const handleSubmit = async () => {
    // Validate required comment
    if (!doneComment.trim()) {
      setCommentError("Vui lòng nhập ý kiến xử lý");
      ToastUtils.error("Vui lòng nhập ý kiến xử lý");
      return;
    }

    setCommentError("");
    setInSubmit(true);
    try {
      await updateAcceptTask({
        taskId,
        status: 3,
        isExcute: isExecute,
        userId: UserInfo?.id,
        comment: doneComment,
        files: selectedFiles,
      });
      ToastUtils.success("Công việc đã hoàn thành.");
      const data = isV2
        ? setSharedFileDataV2(taskId)
        : setSharedFileData(taskId);
      const encryptFile = data.files
        ? data.files.filter((i: any) => i.encrypt)
        : [];

      if (encryptFile === undefined || encryptFile.length === 0) {
        await uploadFileService.saveCmtAndAtmByNonEnc(data);
      }

      const rs = await uploadFileService.doSharePermissionDocFile(data);
      if (rs === false) {
        setInSubmit(false);
        return rs;
      }

      onClose();
      setInSubmit(false);
      setSelectedFiles([]);
      setDoneComment("");
      refetch();
    } catch (error) {
      setInSubmit(false);
    }
  };

  const handleRemoveFile = (index: number) => {
    const next = [...selectedFiles];
    next.splice(index, 1);
    setSelectedFiles(next);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Hoàn thành</DialogTitle>
        </DialogHeader>
        <DialogDescription>
          <div className="flex flex-col gap-4">
            {/* Comment */}
            <div className="space-y-2">
              <Label
                htmlFor="doneComment"
                className="text-sm font-bold text-gray-900 mb-3 block"
              >
                Ý kiến xử lý
              </Label>
              <Textarea
                id="doneComment"
                placeholder="Nhập ý kiến xử lý"
                value={doneComment}
                onChange={(e) => {
                  setDoneComment(e.target.value);
                  if (commentError && e.target.value.trim()) {
                    setCommentError("");
                  }
                }}
                rows={3}
                className={`resize-none ${commentError ? "border-red-500" : ""}`}
              />
              {commentError && (
                <p className="text-sm text-red-500">{commentError}</p>
              )}
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                Chọn tệp
              </Button>
              <Input
                ref={fileInputRef}
                id="doneFileUpload"
                type="file"
                name="attachments"
                multiple
                accept="*/*"
                className="hidden"
                onChange={handleFileUpload}
              />

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

              {/* File List */}
              {selectedFiles.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-bold text-gray-900">
                    Danh sách tệp đính kèm ({selectedFiles.length})
                  </Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedFiles.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 bg-white border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex-shrink-0">
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <File className="w-5 h-5 text-blue-600" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {file.name}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {getFileSizeString(file.size)}
                            {file.encrypt && (
                              <span className="ml-2 text-blue-500">
                                (Mã hóa)
                              </span>
                            )}
                          </p>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFile(index)}
                          className="flex-shrink-0 h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                          title="Xóa file"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </DialogDescription>
        <DialogFooter>
          <Button
            disabled={inSubmit || !doneComment.trim()}
            onClick={handleSubmit}
            className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
          >
            {inSubmit ? (
              "Đang xử lý..."
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Hoàn thành
              </>
            )}
          </Button>
          <Button variant="outline" onClick={onClose}>
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
