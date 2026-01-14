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
  Link,
  KeyRound,
} from "lucide-react";
import { TaskService } from "@/services/task.service";
import { Constant } from "@/definitions/constants/constant";
import { EncryptionService } from "@/services/encryption.service";
import { CERT_OBJ_TYPE } from "@/definitions/enums/document.enum";
import {
  delCommentByType,
  FileService,
  uploadFileService,
} from "@/services/file.service";
import { getTokenInfo } from "@/services/signature.service";
import { b64DecodeUnicode } from "@/services/shared.service";
import { getPassTime } from "@/utils/datetime.utils";
import { doOpenShare, downloadFile } from "@/utils/file.utils";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import SharedUser from "@/components/document-out/SharedUser";
import { ToastUtils } from "@/utils/toast.utils";

interface ResultSectionProps {
  taskId: number;
  resultList: any[];
  currentUserId: number;
  isReportResult: boolean;
  onResultAdded?: () => void;
  userInfo: any;
  refetchResultList?: () => void;
  isV2?: boolean;
}

export default function ResultSection({
  taskId,
  resultList,
  currentUserId,
  isReportResult,
  onResultAdded,
  userInfo,
  refetchResultList,
  isV2 = false,
}: ResultSectionProps) {
  const [newResult, setNewResult] = useState({
    comment: "",
    attachments: [] as File[],
    isToken: false,
  });
  const [encrypt, setEncrypt] = useState(false);
  const [clicked, setClicked] = useState(false);
  const [isUpdateResult, setIsUpdateResult] = useState(false);
  const [currentResultEdit, setCurrentResultEdit] = useState<number | null>(
    null
  );
  const [validFileAttr, setValidFileAttr] = useState({
    validFiles: true,
    isValidFileSize: true,
    isValidExtension: true,
  });
  const [isDelete, setIsDelete] = useState(false);
  const [deleteResultId, setDeleteResultId] = useState<number | null>(null);
  const [showSharedUserModal, setShowSharedUserModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [resultError, setResultError] = useState<string>("");
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

    setNewResult((prev) => ({
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
    if (type === "result") {
      setNewResult((prev) => ({ ...prev, attachments: newAttachments }));
    }
  };

  const doSaveNewResultCToken = async (
    serialNumber: string,
    withToken: boolean
  ) => {
    if (withToken) {
      newResult.isToken = true;
      if (userInfo.serialToken !== serialNumber) {
        ToastUtils.error("Bạn dùng không đúng chứng thư số");
        setClicked(false);
        return;
      }
    } else {
      newResult.isToken = false;
    }

    if (encrypt) {
      const connect = await EncryptionService.checkConnect();
      if (connect === false) {
        setClicked(false);
        return;
      }
    }

    const result = JSON.parse(JSON.stringify(newResult));
    result.comment = `- ${result.comment.trim()}`;
    setClicked(true);

    // Handle save file (encryption or not)
    setEncResultAttachment();
    const data = setSharedFileResultData(taskId);
    if (encrypt) {
      const rs = await uploadFileService.doSharePermissionDocFile(data, false);
      setClicked(false);
      if (rs === false) {
        setEncrypt(false);
        return;
      }
    } else {
      await uploadFileService.saveCmtAndAtmByNonEnc(data);
      if (refetchResultList) {
        refetchResultList();
      }
    }

    // Clear form and reset state after successful save
    setNewResult({ comment: "", attachments: [], isToken: false });
    setEncrypt(false);
    setClicked(false);
    setResultError("");
  };

  const doSaveNewResult = async (withToken: boolean) => {
    if (!newResult.comment.trim() || newResult.comment.trim().length === 0) {
      setResultError("Nội dung kết quả phải chứa ít nhất 1 ký tự");
      return;
    }
    setResultError("");

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
          await doSaveNewResultCToken(serialNumber, withToken);
        }
      });
    } else {
      await doSaveNewResultCToken(serialNumber, withToken);
    }
  };

  const doUpdateResult = async (type: string) => {
    if (!newResult.comment || newResult.comment.trim().length === 0) {
      setResultError("Nội dung kết quả phải chứa ít nhất 1 ký tự");
      return;
    }
    setResultError("");

    const result = await TaskService.updateCommentByType(
      type,
      newResult.comment.trim(),
      Number(currentResultEdit)
    );
    if (result) {
      ToastUtils.success("Cập nhật kết quả thành công");
      setIsUpdateResult(false);
      setNewResult({ comment: "", attachments: [], isToken: false });
      setCurrentResultEdit(null);
      if (refetchResultList) {
        refetchResultList();
      }
      setClicked(false);
      setEncrypt(false);
      setResultError("");
    } else {
      ToastUtils.error("Cập nhật kết quả thất bại");
      setIsUpdateResult(false);
      setNewResult({ comment: "", attachments: [], isToken: false });
      setCurrentResultEdit(null);
      setClicked(false);
      setEncrypt(false);
      setResultError("");
      if (refetchResultList) {
        refetchResultList();
      }
    }
  };

  const doUpdateTaskStatus = async (result: any, type: string) => {
    setIsUpdateResult(true);
    setCurrentResultEdit(result.id);
    if (type === "GIAO_VIEC_KET_QUA_2" || type === "GIAO_VIEC_KET_QUA") {
      setNewResult({
        comment: result.comment || "",
        attachments: [],
        isToken: result.isToken || false,
      });
    }
    setResultError("");
  };

  const doDelete = async (resultId: any, type: any) => {
    const result = await delCommentByType([], [], type, resultId);
    if (result) {
      ToastUtils.success("Xóa kết quả thành công");
      setIsDelete(false);
      if (refetchResultList) {
        refetchResultList();
      }
    } else {
      ToastUtils.error("Xóa kết quả thất bại");
      setIsDelete(false);
      if (refetchResultList) {
        refetchResultList();
      }
    }
  };

  const setEncResultAttachment = () => {
    if (encrypt && newResult.attachments && newResult.attachments.length > 0) {
      newResult.attachments.forEach((i: any) => {
        (i as any).encrypt = true;
      });
    }
  };

  const setSharedFileResultData = (docId: number) => {
    const data = {
      objId: docId,
      files: newResult.attachments,
      comment: newResult.comment,
      cmtContent: null,
      userIds: [],
      attType: CERT_OBJ_TYPE.task_result,
      cmtType: "GIAO_VIEC_KET_QUA",
      objType: CERT_OBJ_TYPE.task_result,
      userOrobj: CERT_OBJ_TYPE.task_result,
      onlyShareFileObject: true,
    };
    return data;
  };

  const handleDownloadAttachment = (
    fileName: string,
    isEncrypted: boolean,
    attachments: any[]
  ) => {
    downloadFile(fileName, CERT_OBJ_TYPE.task_result, isEncrypted);
  };

  const handleOpenShare = (file: any) => {
    doOpenShare(file);
  };

  const checkResultAttachment = (result: any) => {
    return result.attachments && result.attachments.length > 0;
  };

  const handleCreateDraft = (id: number) => {};

  return (
    <>
      {/* Kết quả thực hiện */}
      {isReportResult && (
        <Card className="mt-4 border-none rounded-none">
          <CardHeader className="p-0">
            <span className="font-weight-bold text-info m-0 p-4 bg-gray-100 rounded-none text-blue-600">
              Kết quả thực hiện
            </span>
          </CardHeader>
          <CardContent className="mt-4">
            <div className="space-y-4">
              <div>
                <Textarea
                  id="result-content"
                  name="result"
                  className={`w-full focus:ring-0 ${resultError ? "border-red-500" : ""}`}
                  placeholder="Nhập nội dung kết quả"
                  maxLength={10000}
                  value={newResult.comment}
                  onChange={(e) => {
                    setNewResult((prev) => ({
                      ...prev,
                      comment: e.target.value,
                    }));
                    if (resultError && e.target.value.trim().length > 0) {
                      setResultError("");
                    }
                  }}
                  rows={3}
                />
                {resultError && (
                  <p className="text-red-500 text-xs mt-1">{resultError}</p>
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
                        !newResult.attachments ||
                        newResult.attachments.length === 0
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
                    <Label htmlFor="upload-photo2" className="cursor-pointer">
                      <Paperclip className="w-4 h-4 text-blue-600" />
                    </Label>
                  )}
                  <Input
                    ref={fileInputRef}
                    id="upload-photo2"
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
                        className="btn btn-sm btn-success bg-blue-600 text-white"
                        disabled={clicked}
                        onClick={() =>
                          doUpdateResult(
                            isV2 ? "GIAO_VIEC_KET_QUA_2" : "GIAO_VIEC_KET_QUA"
                          )
                        }
                      >
                        <Edit className="w-4 h-4 mr-1" />
                        Cập nhật kết quả
                      </Button>
                      <Button
                        variant="outline"
                        className="btn btn-sm"
                        onClick={() => {
                          setIsUpdateResult(false);
                          setCurrentResultEdit(null);
                          setNewResult({
                            comment: "",
                            attachments: [],
                            isToken: false,
                          });
                          setResultError("");
                        }}
                      >
                        Hủy
                      </Button>
                    </div>
                  ) : (
                    <Button
                      className="btn btn-sm btn-info bg-blue-600 text-white hover:bg-blue-600"
                      disabled={clicked}
                      onClick={() => doSaveNewResult(false)}
                    >
                      <Share className="w-4 h-4 mr-1" />
                      Gửi kết quả
                    </Button>
                  )}
                </div>
              </div>

              {!validFileAttr.validFiles && (
                <div>
                  {!validFileAttr.isValidFileSize && (
                    <p className="text-red-500 my-1 text-xs">
                      Dung lượng file phải nhỏ hơn 300MB.
                    </p>
                  )}
                  {!validFileAttr.isValidExtension && (
                    <p className="text-red-500 my-1 text-xs">
                      File không đúng định dạng.
                    </p>
                  )}
                </div>
              )}

              {newResult.attachments.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded border"
                >
                  <span className="text-sm">{file.name}</span>
                  <Button
                    onClick={() =>
                      handleRemoveFile(
                        index,
                        [...newResult.attachments],
                        "result",
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
      )}

      {/* Lịch sử kết quả */}
      <Card className="mt-4 border-none rounded-none">
        <CardHeader className="p-0">
          <span className="font-weight-bold text-info m-0 p-4 bg-gray-100 rounded-none text-blue-600">
            Lịch sử kết quả
          </span>
        </CardHeader>
        <CardContent className="p-4">
          {resultList &&
            resultList?.map((result, index) => (
              <div key={index} className="mb-4 last:mb-0">
                <div className="flex items-start space-x-3">
                  {/* User Icon */}
                  <div className="flex-shrink-0 relative">
                    <div className="w-8 h-9 bg-gray-300 rounded-full flex items-center justify-center">
                      <UserCircle className="w-4 h-4 text-gray-600" />
                    </div>
                    {result.isToken && (
                      <img
                        src="/v2/assets/images/usb-token.png"
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
                          {result.userFullName}
                        </span>
                        {result.userFullName?.length > 0 && (
                          <span className="text-sm text-gray-500">
                            ({result.userPosition})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Result content */}
                    <div className="mb-2">
                      <span
                        className="text-sm text-gray-700"
                        style={{ whiteSpace: "pre-wrap" }}
                      >
                        {result.comment}
                      </span>
                    </div>

                    <span className="text-xs text-gray-400">
                      Vào lúc: {getPassTime(result.createDate)}
                    </span>

                    {/* Attachments */}
                    {checkResultAttachment(result) && (
                      <div className="mb-2">
                        <span className="text-xs text-gray-500 font-medium">
                          Đính kèm:
                        </span>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {result.attachments.map(
                            (file: any, fileIndex: number) => (
                              <div
                                key={fileIndex}
                                className="flex items-center space-x-1"
                              >
                                <span
                                  className="text-xs text-blue-600 hover:text-blue-800 cursor-pointer flex items-center space-x-1"
                                  onClick={() =>
                                    handleDownloadAttachment(
                                      file.name,
                                      file.encrypt,
                                      result.attachments
                                    )
                                  }
                                >
                                  <span>{file.displayName}</span>
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
                    {currentUserId === result.userId && (
                      <div className="flex items-center space-x-2">
                        <Button
                          size="sm"
                          className="text-xs bg-green-500 text-white hover:bg-green-500"
                          onClick={() =>
                            doUpdateTaskStatus(
                              result,
                              isV2 ? "GIAO_VIEC_KET_QUA_2" : "GIAO_VIEC_KET_QUA"
                            )
                          }
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Chỉnh sửa
                        </Button>
                        <Button
                          size="sm"
                          className="text-xs bg-red-500 text-white hover:text-red-800 hover:bg-red-500"
                          onClick={() => {
                            setDeleteResultId(result.id);
                            setIsDelete(true);
                          }}
                        >
                          <Trash2 className="w-3 h-3 mr-1" />
                          Xóa
                        </Button>
                        {checkResultAttachment(result) && (
                          <Button
                            size="sm"
                            className="text-xs text-blue-600 hover:text-blue-800"
                            onClick={() => handleCreateDraft(result.id)}
                          >
                            <Link className="w-3 h-3 mr-1" />
                            Liên kết Văn bản
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {index < resultList.length - 1 && (
                  <div className="border-b border-gray-100 mt-4" />
                )}
              </div>
            ))}
        </CardContent>
      </Card>

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteDialog
        isOpen={isDelete}
        onOpenChange={(open) => {
          setIsDelete(open);
          if (!open) {
            setDeleteResultId(null);
          }
        }}
        onConfirm={() => {
          if (deleteResultId) {
            doDelete(
              deleteResultId,
              isV2 ? "GIAO_VIEC_KET_QUA_2" : "GIAO_VIEC_KET_QUA"
            );
          }
        }}
        title="Xóa kết quả"
        description="Bạn có chắc chắn muốn xóa kết quả này?"
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
