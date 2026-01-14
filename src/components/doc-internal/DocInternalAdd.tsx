"use client";

import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import { SelectOrgApproveDialog } from "@/components/doc-internal/SelectOrgApproveDialog";
import { SelectReceiverDialog } from "@/components/doc-internal/SelectReceiverDialog";
import { SelectTemplateDialog } from "@/components/common/SelectTemplateDialog";
import { SelectUserApproveDialog } from "@/components/doc-internal/SelectUserApproveDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Constant } from "@/definitions/constants/constant";
import {
  useAddDocInternal,
  useAddFiles,
  useGetDocInternalDetail,
  useGetNumberOrSign,
  useGetUserSign,
  useUpdateDocInternal,
  useUpdateFiles,
} from "@/hooks/data/doc-internal.data";
import { cn } from "@/lib/utils";
import { uploadFileService } from "@/services/file.service";
import { isVerifierPDF } from "@/utils/common.utils";
import { FileObject, viewFile } from "@/utils/file.utils";
import { ToastUtils } from "@/utils/toast.utils";
import {
  Download,
  Eye,
  Paperclip,
  Key,
  KeyRound,
  Plus,
  Trash2,
  UserPlus,
  Save,
  ArrowLeft,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

enum HandleStatus {
  EXECUTE = "EXECUTE",
  VIEW = "VIEW",
}

enum ApproveType {
  SIGNER = "SIGNER",
  USER = "USER",
  ORG = "ORG",
  COMMENTER = "COMMENTER",
}

enum DocStatus {
  NB_DU_THAO = "NB_DU_THAO",
  NB_CHO_DUYET = "NB_CHO_DUYET",
  NB_TRA_LAI = "NB_TRA_LAI",
  NB_LANH_DAO_KY = "NB_LANH_DAO_KY",
  NB_BAN_HANH = "NB_BAN_HANH",
}

const FILE_TYPE = Constant.DOCUMENT_INTERNAL_FILE_TYPE;

interface DocInternal {
  docId?: number;
  numberOrSign: string;
  preview: string;
  signerId?: number;
  listUserApprove: any[];
  listOrgApprove: any[];
  listCommenterApprove: any[];
  listReceiver: any[];
  orgCreateName?: string;
  status?: string;
  docStatus?: string;
}

interface FileItem {
  id?: number;
  name: string;
  size: number;
  file?: File;
  attachType?: string;
  encrypt?: boolean;
  oEncrypt?: boolean;
  template?: boolean;
}

export default function DocInternalAdd() {
  const router = useRouter();
  const params = useParams();
  const docId = params?.id ? Number(params.id) : null;
  const isEdit = !!docId;

  const [docInternal, setDocInternal] = useState<DocInternal>({
    numberOrSign: "",
    preview: "",
    listUserApprove: [],
    listOrgApprove: [],
    listCommenterApprove: [],
    listReceiver: [],
  });

  const [usersSign, setUsersSign] = useState<any[]>([]);
  const [usersApprove, setUsersApprove] = useState<any[]>([]);
  const [orgApprove, setOrgApprove] = useState<any[]>([]);
  const [mainChecked, setMainChecked] = useState<any[]>([]);
  const [toKnowCheck, setToKnowCheck] = useState<any[]>([]);

  const [docFiles, setDocFiles] = useState<FileItem[]>([]);
  const [addendumFiles, setAddendumFiles] = useState<FileItem[]>([]);
  const [deleteIds, setDeleteIds] = useState<number[]>([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Dialog states
  const [isUserApproveDialogOpen, setIsUserApproveDialogOpen] = useState(false);
  const [isOrgApproveDialogOpen, setIsOrgApproveDialogOpen] = useState(false);
  const [isReceiverDialogOpen, setIsReceiverDialogOpen] = useState(false);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);

  // Hooks
  const { data: detailData, isLoading: detailLoading } =
    useGetDocInternalDetail(docId, !!docId);
  const { data: numberOrSign } = useGetNumberOrSign();
  const { data: userSignData } = useGetUserSign();
  const { mutateAsync: addDoc } = useAddDocInternal();
  const { mutateAsync: updateDoc } = useUpdateDocInternal();
  const { mutateAsync: addFilesApi } = useAddFiles();
  const { mutateAsync: updateFilesApi } = useUpdateFiles();

  useEffect(() => {
    if (userSignData) {
      setUsersSign(userSignData);
    }
  }, [userSignData]);

  useEffect(() => {
    if (numberOrSign && !isEdit) {
      setDocInternal((prev) => ({
        ...prev,
        numberOrSign: typeof numberOrSign === "string" ? numberOrSign : "",
      }));
    }
  }, [numberOrSign, isEdit]);

  useEffect(() => {
    if (detailData && isEdit) {
      convertToDocInternal(detailData);
      mappingData(detailData);
    }
  }, [detailData, isEdit]);

  const convertToDocInternal = (data: any) => {
    const user = data.listApprover?.find(
      (item: any) => item.type === ApproveType.SIGNER
    );

    setDocInternal({
      docId: data.docId,
      numberOrSign: data.numberOrSign || "",
      preview: data.preview || "",
      orgCreateName: data.orgCreateName,
      signerId: user?.userId,
      listUserApprove:
        data.listApprover
          ?.filter((item: any) => item.type === ApproveType.USER)
          .map((item: any) => item.id) || [],
      listOrgApprove:
        data.listApprover
          ?.filter(
            (item: any) =>
              item.type === ApproveType.ORG ||
              item.type === ApproveType.COMMENTER
          )
          .map((item: any) => item.id) || [],
      listCommenterApprove: [],
      listReceiver: data.listReceiver || [],
      docStatus: data.docStatus,
    });
  };

  const mappingData = (data: any) => {
    const users =
      data.listApprover
        ?.filter((item: any) => item.type === ApproveType.USER)
        .map((item: any) => ({
          id: item.userId,
          fullName: item.userFullName,
          orgName: item.orgName,
          positionName: item.positionName,
        })) || [];
    setUsersApprove(users);

    const orgs =
      data.listApprover
        ?.filter(
          (item: any) =>
            item.type === ApproveType.ORG || item.type === ApproveType.COMMENTER
        )
        .map((item: any) => ({
          parent: null,
          child: item.type === ApproveType.ORG ? item.orgId : item.userId,
          name:
            item.type === ApproveType.ORG ? item.orgName : item.userFullName,
          type: item.type === ApproveType.ORG ? 0 : 1,
        })) || [];
    setOrgApprove(orgs);

    const mainUsers =
      data.listReceiver
        ?.filter((item: any) => item.handleStatus === HandleStatus.EXECUTE)
        .map((item: any) => ({
          parent: null,
          child: item.orgId || item.userId,
          name: item.orgName || item.userName,
          type: item.type || (item.orgId ? "ORG" : "USER"),
        })) || [];
    setMainChecked(mainUsers);

    const toKnowUsers =
      data.listReceiver
        ?.filter((item: any) => item.handleStatus === HandleStatus.VIEW)
        .map((item: any) => ({
          parent: null,
          child: item.orgId || item.userId,
          name: item.orgName || item.userName,
          type: item.type || (item.orgId ? "ORG" : "USER"),
        })) || [];
    setToKnowCheck(toKnowUsers);

    const docs =
      data.listAttachment
        ?.filter((item: any) => item.attachType === FILE_TYPE.DOC_FILE)
        .map((item: any) => ({
          id: item.id,
          name: item.name,
          size: item.size,
          attachType: item.attachType,
          encrypt: item.encrypt,
          oEncrypt: item.encrypt,
          template: false,
        })) || [];
    setDocFiles(docs);

    const addendums =
      data.listAttachment
        ?.filter((item: any) => item.attachType === FILE_TYPE.ADDENDUM_FILE)
        .map((item: any) => ({
          id: item.id,
          name: item.name,
          size: item.size,
          attachType: item.attachType,
          encrypt: item.encrypt,
          oEncrypt: item.encrypt,
          template: false,
        })) || [];
    setAddendumFiles(addendums);
  };

  const handleFileSelect = (
    event: React.ChangeEvent<HTMLInputElement>,
    type: string
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    // Validate file extensions
    const allowedExtensions =
      type === FILE_TYPE.DOC_FILE
        ? Constant.ALLOWED_DRAFT_FILE_EXTENSION
        : Constant.ALLOWED_FILE_EXTENSION;

    const invalidFiles: string[] = [];
    Array.from(files).forEach((file) => {
      const extension = `.${file.name.split(".").pop()?.toLowerCase()}`;
      if (!allowedExtensions.toLowerCase().includes(extension)) {
        invalidFiles.push(file.name);
      }
    });

    if (invalidFiles.length > 0) {
      ToastUtils.error(`Lỗi không đúng định dạng tệp. (${allowedExtensions})`);
      event.target.value = "";
      return;
    }

    // Validate file size (300MB max)
    const MAX_SIZE = 314572800; // 300MB
    const oversizedFiles: string[] = [];
    Array.from(files).forEach((file) => {
      if (file.size > MAX_SIZE) {
        oversizedFiles.push(file.name);
      }
    });

    if (oversizedFiles.length > 0) {
      ToastUtils.error("Lỗi kích thước tệp quá lớn (phải < 300MB).");
      event.target.value = "";
      return;
    }

    const newFiles: FileItem[] = Array.from(files).map((file) => ({
      name: file.name,
      size: file.size,
      file: file,
      attachType: type,
      encrypt: false,
    }));

    if (type === FILE_TYPE.DOC_FILE) {
      setDocFiles((prev) => [...prev, ...newFiles]);
    } else {
      setAddendumFiles((prev) => [...prev, ...newFiles]);
    }

    event.target.value = "";
  };

  const handleViewFile = async (file: any) => {
    try {
      await viewFile(
        file?.file || (file as FileObject),
        Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_INTERNAL
      );
    } catch (e) {
      console.error("Error viewing file:", e);
      ToastUtils.khongTheMoTepTin();
    }
  };

  const handleDownloadFile = async (file: FileItem) => {
    try {
      if (file.encrypt) {
        const url = `/doc_internal/download/${file.id}`;
        await uploadFileService.doDecrypt(file.name, url, true, null);
      } else {
        await uploadFileService.downloadFile(
          file.name,
          Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_INTERNAL,
          file.encrypt,
          file.id?.toString()
        );
      }
    } catch (e) {
      console.error("Error downloading file:", e);
      ToastUtils.error("Không thể tải xuống tệp tin");
    }
  };
  const changeEncrypt = (file: FileItem) => {
    if (!(file.id && file.oEncrypt)) {
      file.encrypt = !file.encrypt;
    }
  };
  const handleRemoveFile = (file: FileItem, type: string) => {
    if (file.id) {
      setDeleteIds((prev) => [...prev, file.id!]);
    }

    if (type === FILE_TYPE.DOC_FILE) {
      setDocFiles((prev) => prev.filter((f) => f !== file));
    } else {
      setAddendumFiles((prev) => prev.filter((f) => f !== file));
    }
  };

  const getExtension = (fileName: string) => fileName.split(".").pop();
  const getOriginalName = (fileName: string) => fileName.split("__")[0];
  const getFileIcon = (fileName: string) => {
    const ext = getOriginalName(getExtension(fileName)?.toLowerCase() || "");
    const iconMap: Record<string, string> = {
      pdf: "/v2/assets/images/files/PDF.png",
      doc: "/v2/assets/images/files/DOC.png",
      docx: "/v2/assets/images/files/DOC.png",
      xls: "/v2/assets/images/files/Excel.png",
      xlsx: "/v2/assets/images/files/Excel.png",
      png: "/v2/assets/images/files/unknow.gif",
      jpg: "/v2/assets/images/files/unknow.gif",
      jpeg: "/v2/assets/images/files/unknow.gif",
    };
    return iconMap[ext] || "/v2/assets/images/files/unknow.gif";
  };
  const getFileSizeString = (size: number) => {
    const KB = size / 1024;
    const MB = KB / 1024;
    if (MB >= 0.1) return `${MB.toFixed(2)} MB`;
    if (KB > 0) return `${KB.toFixed(2)} KB`;
    return `${size} B`;
  };

  const getTextList = (list: any[], type: string = "org") => {
    if (!list || list.length === 0) return "";

    if (type === "user") {
      return list
        .map((user) => `${user.fullName} - ${user.positionName}`)
        .join(", ");
    }

    return list.map((item) => item.name).join(", ");
  };

  const validateForm = (isSaveAndRegister: boolean = false) => {
    const newErrors: Record<string, string> = {};

    // Validate trích yếu
    if (!docInternal.preview?.trim()) {
      newErrors.preview = "Vui lòng nhập trích yếu";
    } else if (docInternal.preview.length > 500) {
      // newErrors.preview = "Trích yếu không được quá 500 ký tự";
    }

    // Validate file văn bản
    if (docFiles.length === 0) {
      newErrors.docFiles = "Vui lòng chọn file văn bản";
    }

    // if (isSaveAndRegister) {
    //   if (
    //     orgApprove.length === 0 &&
    //     docInternal.listCommenterApprove.length === 0
    //   ) {
    //     newErrors.orgApprove = "Vui lòng chọn người cho ý kiến";
    //   }

    //   if (
    //     !docInternal.listReceiver ||
    //     docInternal.listReceiver.filter(
    //       (item) => item.handleStatus === HandleStatus.EXECUTE,
    //     ).length === 0
    //   ) {
    //     newErrors.mainChecked = "Vui lòng chọn người thực hiện";
    //   }
    // }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mappingDataToSave = () => {
    const listOrgApprove: any[] = [];
    const listCommenterApprove: any[] = [];

    orgApprove.forEach((item) => {
      const typeNum =
        typeof item.type === "string"
          ? item.type === "ORG"
            ? 0
            : 1
          : item.type;

      if (typeNum === 0) {
        listOrgApprove.push(item.child);
      } else {
        listCommenterApprove.push(item.child);
      }
    });

    return {
      ...docInternal,
      listUserApprove: usersApprove.map((user) => user.id),
      listOrgApprove,
      listCommenterApprove,
      listReceiver: [
        ...mainChecked.map((item) => {
          const typeNum =
            typeof item.type === "string"
              ? item.type === "ORG"
                ? 0
                : 1
              : item.type;
          if (typeNum === 0) {
            return {
              orgId: item.child,
              handleStatus: HandleStatus.EXECUTE,
              type: "ORG",
            };
          }
          return {
            userId: item.child,
            handleStatus: HandleStatus.EXECUTE,
            type: "USER",
          };
        }),
        ...toKnowCheck.map((item) => {
          const typeNum =
            typeof item.type === "string"
              ? item.type === "ORG"
                ? 0
                : 1
              : item.type;
          if (typeNum === 0) {
            return {
              orgId: item.child,
              handleStatus: HandleStatus.VIEW,
              type: "ORG",
            };
          }
          return {
            userId: item.child,
            handleStatus: HandleStatus.VIEW,
            type: "USER",
          };
        }),
      ],
    };
  };

  const handleSave = async (isSaveAndRegister: boolean = false) => {
    if (isSubmitting) return;

    const status = isSaveAndRegister
      ? DocStatus.NB_CHO_DUYET
      : DocStatus.NB_DU_THAO;

    // Validate form BEFORE doing anything
    if (!validateForm(isSaveAndRegister)) {
      // Show validation errors
      if (errors.preview) {
        ToastUtils.error(errors.preview);
      } else if (errors.docFiles) {
        ToastUtils.error(errors.docFiles);
      } else if (errors.orgApprove) {
        ToastUtils.error(errors.orgApprove);
      } else if (errors.mainChecked) {
        ToastUtils.error(errors.mainChecked);
      }
      return;
    }

    setIsSubmitting(true);

    try {
      const dataToSave = mappingDataToSave();
      dataToSave.status = status;

      let savedDocId: number;

      if (isEdit && docId) {
        // Update
        await updateDoc({ docId, body: dataToSave });
        savedDocId = docId;

        // Update files
        const newDocFiles = docFiles.filter((f) => !f.id && f.file);
        const newAddendumFiles = addendumFiles.filter((f) => !f.id && f.file);

        if (
          deleteIds.length > 0 ||
          newDocFiles.length > 0 ||
          newAddendumFiles.length > 0
        ) {
          await updateFilesApi({
            docId: savedDocId,
            deleteIds: deleteIds.join(","),
            docFiles: newDocFiles.map((f) => f.file!),
            addendumFiles: newAddendumFiles.map((f) => f.file!),
          });
        }

        ToastUtils.success("Cập nhật văn bản thành công");
      } else {
        const result = await addDoc(dataToSave);
        savedDocId = result;

        const newDocFiles = docFiles.filter((f) => f.file);
        const newAddendumFiles = addendumFiles.filter((f) => f.file);
        if (newDocFiles.length > 0 || newAddendumFiles.length > 0) {
          await addFilesApi({
            docId: savedDocId,
            docFiles: newDocFiles.map((f) => f.file!),
            addendumFiles: newAddendumFiles.map((f) => f.file!),
          });
        }

        ToastUtils.success("Thêm văn bản thành công");
      }

      if (isSaveAndRegister) {
        router.push("/doc-internal/register");
      } else {
        router.push("/doc-internal/register");
      }
    } catch (error: any) {
      if (error.response && error.response.status === 404) {
        ToastUtils.error(error.response.data.message || "Có lỗi xảy ra");
      } else {
        ToastUtils.error(error?.message || "Có lỗi xảy ra");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    router.back();
  };

  const handleSelectUserApprove = (users: any[]) => {
    setUsersApprove(users);
    setDocInternal((prev) => ({
      ...prev,
      listUserApprove: users.map((u) => u.id),
    }));
  };

  const handleSelectOrgApprove = (orgs: any[]) => {
    setOrgApprove(orgs);
  };

  const handleSelectReceiver = (main: any[], toKnow: any[]) => {
    setMainChecked(main);
    setToKnowCheck(toKnow);
  };

  const handleSelectTemplate = (template: any) => {
    setDocFiles((prev) => [...prev, ...template]);
    ToastUtils.success("Đã thêm văn bản mẫu");
  };

  if (detailLoading && isEdit) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="pl-4 pr-4 space-y-4">
      <div className="flex items-center justify-between gap-4 mb-4">
        <BreadcrumbNavigation
          items={[
            {
              label: "Văn bản nội bộ",
            },
          ]}
          currentPage={isEdit ? "Cập nhật" : "Đăng ký phát hành"}
          showHome={false}
        />
      </div>
      <div className="bg-white">
        <div className="flex justify-between items-center mb-6 border rounded-lg p-4 bg-[rgb(232,233,235)]">
          <div>
            <h1 className="text-lg text-black font-bold">
              {isEdit ? "Cập nhật" : "Đăng ký phát hành"}
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {isEdit
                ? "Thực hiện cập nhật văn bản nội bộ"
                : "Thực hiện đăng ký văn bản nội bộ"}
            </p>
          </div>
          <div className="flex gap-2 items-center">
            {isEdit ? (
              <>
                <Button
                  onClick={() => handleSave(false)}
                  disabled={isSubmitting}
                  className="text-white border-0 h-9 px-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 hover:text-white flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    "Đang lưu..."
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      {`Lưu và ${docInternal.docStatus === "NB_DU_THAO" ? "đóng" : "đăng ký"}`}
                    </>
                  )}
                </Button>
                {docInternal.docStatus === "NB_DU_THAO" && (
                  <Button
                    onClick={() => handleSave(true)}
                    disabled={isSubmitting}
                    className="text-white border-0 h-9 px-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 hover:text-white flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      "Đang lưu..."
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Lưu và đăng ký
                      </>
                    )}
                  </Button>
                )}
              </>
            ) : (
              <>
                <Button
                  onClick={() => handleSave(false)}
                  disabled={isSubmitting}
                  className="text-white border-0 h-9 px-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 hover:text-white flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    "Đang lưu..."
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Lưu và đóng
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => handleSave(true)}
                  disabled={isSubmitting}
                  className="text-white border-0 h-9 px-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 hover:text-white flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    "Đang lưu..."
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Lưu và đăng ký
                    </>
                  )}
                </Button>
              </>
            )}
            <Button
              variant="outline"
              onClick={handleBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Quay lại
            </Button>
          </div>
        </div>

        <div className="space-y-4">
          {/* Người ký - giống Angular label.person-Sign */}
          <div className="grid grid-cols-12 gap-4 items-start">
            <label className="col-span-2 text-sm font-bold text-right pt-2">
              Số văn bản:
            </label>
            <div className="col-span-4">
              <Input
                value={docInternal.numberOrSign}
                onChange={(e) =>
                  setDocInternal((prev) => ({
                    ...prev,
                    numberOrSign: e.target.value,
                  }))
                }
                placeholder="Số văn bản:"
                maxLength={50}
              />
            </div>
          </div>

          {/* Trích yếu */}
          <div className="grid grid-cols-12 gap-4 items-start">
            <label className="col-span-2 text-sm font-bold text-right pt-2">
              Trích yếu:<span className="text-red-500">*</span>
            </label>
            <div className="col-span-8">
              <Textarea
                value={docInternal.preview}
                onChange={(e) =>
                  setDocInternal((prev) => ({
                    ...prev,
                    preview: e.target.value,
                  }))
                }
                placeholder="Trích yếu"
                rows={3}
                className={cn(errors.preview && "border-red-500")}
              />
              {errors.preview && (
                <p className="text-red-500 text-sm mt-1">{errors.preview}</p>
              )}
            </div>
          </div>

          {/* File văn bản */}
          <div className="grid grid-cols-12 gap-4 items-start">
            <label className="col-span-2 text-sm font-bold text-right pt-2">
              Tệp văn bản:<span className="text-red-500">*</span>
            </label>
            <div className="col-span-10">
              <div className="flex gap-2">
                <label htmlFor="doc-file" className="cursor-pointer">
                  <Button type="button" variant="outline" asChild>
                    <span>
                      <Paperclip className="text-blue-600" />
                      Chọn tệp văn bản
                    </span>
                  </Button>
                </label>
                <input
                  id="doc-file"
                  type="file"
                  multiple
                  hidden
                  accept={Constant.ALLOWED_DRAFT_FILE_EXTENSION}
                  onChange={(e) => handleFileSelect(e, FILE_TYPE.DOC_FILE)}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsTemplateDialogOpen(true)}
                >
                  <Plus />
                  Chọn văn bản mẫu
                </Button>
              </div>
              {errors.docFiles && (
                <p className="text-red-500 text-sm mt-1">{errors.docFiles}</p>
              )}

              {docFiles.length > 0 && (
                <div className="mt-4 border rounded-lg overflow-hidden w-[80%]">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-bold">
                          Tên tệp tin
                        </th>
                        <th className="px-4 py-2 text-center text-sm font-bold w-32">
                          Kích thước
                        </th>
                        <th className="px-4 py-2 text-center text-sm font-bold w-32">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {docFiles.map((file: FileItem, index: number) => (
                        <tr key={index} className="border-t">
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              <img
                                src={getFileIcon(file.name)}
                                className="w-4 h-4"
                                alt="file icon"
                              />
                              <span className="text-sm">
                                {getOriginalName(file.name)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-2 text-center text-sm">
                            {getFileSizeString(file.size)}
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex justify-center gap-2">
                              {isVerifierPDF(file) ? (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleViewFile(file)}
                                  className="text-black"
                                >
                                  <Eye className="w-4 h-4  text-black" />
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDownloadFile(file)}
                                >
                                  <Download className="w-4 h-4 text-black" />
                                </Button>
                              )}
                              {Constant.ENCRYPTION_TWD && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => changeEncrypt(file)}
                                    title="Mã hóa tệp tin"
                                  >
                                    <KeyRound
                                      className={
                                        file.encrypt
                                          ? "w-4 h-4 text-danger "
                                          : "w-4 h-4 "
                                      }
                                    />
                                  </Button>
                                  <input
                                    type="checkbox"
                                    checked={file.encrypt}
                                    onChange={() => changeEncrypt(file)}
                                    hidden
                                    disabled={!!(file.id && file.oEncrypt)}
                                  />
                                </>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  handleRemoveFile(file, FILE_TYPE.DOC_FILE)
                                }
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* File phụ lục */}
          <div className="grid grid-cols-12 gap-4 items-start">
            <label className="col-span-2 text-sm font-bold text-right pt-2">
              Tệp phụ lục:
            </label>
            <div className="col-span-10">
              <label htmlFor="addendum-file" className="cursor-pointer">
                <Button type="button" variant="outline" asChild>
                  <span>
                    <Paperclip className="text-blue-600" />
                    Chọn file phụ lục
                  </span>
                </Button>
              </label>
              <input
                id="addendum-file"
                type="file"
                multiple
                hidden
                accept={Constant.ALLOWED_FILE_EXTENSION}
                onChange={(e) => handleFileSelect(e, FILE_TYPE.ADDENDUM_FILE)}
              />

              {addendumFiles.length > 0 && (
                <div className="mt-4 border rounded-lg overflow-hidden w-[80%]">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-bold">
                          Tên tệp tin
                        </th>
                        <th className="px-4 py-2 text-center text-sm font-bold w-32">
                          Kích thước
                        </th>
                        <th className="px-4 py-2 text-center text-sm font-bold w-32">
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {addendumFiles.map((file, index) => (
                        <tr key={index} className="border-t">
                          <td className="px-4 py-2">
                            <div className="flex items-center gap-2">
                              <img
                                src={getFileIcon(file.name)}
                                className="w-4 h-4"
                                alt="file icon"
                              />
                              <span className="text-sm">
                                {getOriginalName(file.name)}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 py-2 text-center text-sm">
                            {getFileSizeString(file.size)}
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex justify-center gap-2">
                              {isVerifierPDF(file) ? (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleViewFile(file)}
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleDownloadFile(file)}
                                >
                                  <Download className="w-4 h-4" />
                                </Button>
                              )}
                              {Constant.ENCRYPTION_TWD && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => changeEncrypt(file)}
                                    title="Mã hóa tệp tin"
                                  >
                                    <KeyRound
                                      className={
                                        file.encrypt
                                          ? "w-4 h-4 text-danger"
                                          : "w-4 h-4 "
                                      }
                                    />
                                  </Button>
                                  <input
                                    type="checkbox"
                                    checked={file.encrypt}
                                    onChange={() => changeEncrypt(file)}
                                    hidden
                                    disabled={!!(file.id && file.oEncrypt)}
                                  />
                                </>
                              )}
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() =>
                                  handleRemoveFile(
                                    file,
                                    FILE_TYPE.ADDENDUM_FILE
                                  )
                                }
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Người duyệt */}
          <div className="grid grid-cols-12 gap-4 items-start">
            <label className="col-span-2 text-sm font-bold text-right pt-2">
              Người duyệt:
            </label>
            <div className="col-span-8">
              <Textarea
                value={getTextList(usersApprove, "user")}
                readOnly
                placeholder="Chọn người duyệt"
                rows={2}
                className=" cursor-pointer"
                onClick={() => setIsUserApproveDialogOpen(true)}
              />
            </div>
            <div className="col-span-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsUserApproveDialogOpen(true)}
              >
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Phòng ban/Người cho ý kiến */}
          <div className="grid grid-cols-12 gap-4 items-start">
            <label className="col-span-2 text-sm font-bold text-right pt-2">
              Người cho ý kiến:
            </label>
            <div className="col-span-8">
              <Textarea
                value={getTextList(orgApprove)}
                readOnly
                placeholder="Chọn người cho ý kiến"
                rows={2}
                className={cn(
                  "cursor-pointer",
                  errors.orgApprove && "border-red-500"
                )}
                onClick={() => setIsOrgApproveDialogOpen(true)}
              />
              {errors.orgApprove && (
                <p className="text-red-500 text-sm mt-1">{errors.orgApprove}</p>
              )}
            </div>
            <div className="col-span-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOrgApproveDialogOpen(true)}
              >
                <UserPlus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Người thực hiện */}
          <div className="grid grid-cols-12 gap-4 items-start">
            <label className="col-span-2 text-sm font-bold text-right pt-2">
              Thực hiện:
            </label>
            <div className="col-span-8">
              <Textarea
                value={getTextList(mainChecked)}
                readOnly
                placeholder="Chọn người thực hiện"
                rows={2}
                className={cn(
                  "cursor-pointer",
                  errors.mainChecked && "border-red-500"
                )}
                onClick={() => setIsReceiverDialogOpen(true)}
              />
              {errors.mainChecked && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.mainChecked}
                </p>
              )}
            </div>
            <div className="col-span-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsReceiverDialogOpen(true)}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Người nhận
              </Button>
            </div>
          </div>

          {/* Người biết */}
          <div className="grid grid-cols-12 gap-4 items-start">
            <label className="col-span-2 text-sm font-bold text-right pt-2">
              Xem để biết:
            </label>
            <div className="col-span-8">
              <Textarea
                value={getTextList(toKnowCheck)}
                readOnly
                placeholder="Chọn nơi nhận"
                rows={2}
                className="cursor-pointer"
                onClick={() => setIsReceiverDialogOpen(true)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      <SelectUserApproveDialog
        isOpen={isUserApproveDialogOpen}
        onOpenChange={setIsUserApproveDialogOpen}
        selectedUsers={usersApprove}
        onConfirm={handleSelectUserApprove}
      />

      <SelectOrgApproveDialog
        isOpen={isOrgApproveDialogOpen}
        onOpenChange={setIsOrgApproveDialogOpen}
        selectedOrgs={orgApprove}
        onConfirm={handleSelectOrgApprove}
      />

      <SelectReceiverDialog
        isOpen={isReceiverDialogOpen}
        onOpenChange={setIsReceiverDialogOpen}
        mainReceivers={mainChecked}
        toKnowReceivers={toKnowCheck}
        onConfirm={handleSelectReceiver}
      />

      <SelectTemplateDialog
        isOpen={isTemplateDialogOpen}
        onOpenChange={setIsTemplateDialogOpen}
        type={Constant.TYPE_TEMPLATE.VAN_BAN_NOI_BO}
        setData={handleSelectTemplate}
        onClose={() => {
          setIsTemplateDialogOpen(false);
        }}
      />
    </div>
  );
}
