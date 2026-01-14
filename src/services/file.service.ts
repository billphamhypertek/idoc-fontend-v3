import { sendGet, sendPost } from "@/api";
import { Constant } from "@/definitions/constants/constant";
import { CERT_OBJ_TYPE, OBJ_TYPE } from "@/definitions/enums/document.enum";
import { ToastUtils } from "@/utils/toast.utils";
import { AttachmentService } from "./attachment.service";
import { CalendarService } from "./calendar.service";
import { DecryptionService } from "./decryption.service";
import { DocumentInService } from "./document-in.service";
import { SignatureService } from "./signature.service";
import { TaskService } from "./task.service";
import { CommonService } from "./common";
import { EncryptionService } from "./encryption.service";
import { getExtension, handleError } from "@/utils/common.utils";
import { getDateCalendar } from "@/utils/time.util";
import { convertStringDateToNgbDate } from "@/utils/datetime.utils";
import { TokenValidationService } from "@/services/token-validation.service";

export class FileService {
  static async getFile(name: string, type: string): Promise<any> {
    const response = await sendGet(`${type}${name}`, null, {
      responseType: "blob",
    });
    return response;
  }
  static getDownloadFileUrl(fileType: string): string {
    switch (fileType) {
      case Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_IN:
        return "/doc_out_attach/download/";
      case Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_OUT:
        return "/attachment/download/";
      case Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_OUT_COMMENT:
        return "/attachment_comment/download/";
      case Constant.ATTACHMENT_DOWNLOAD_TYPE.DELEGATE:
        return "/delegate/download/";
      case Constant.ATTACHMENT_DOWNLOAD_TYPE.WORD_EDITOR:
      case Constant.ATTACHMENT_DOWNLOAD_TYPE.TASK:
        return "/taskAtt/download/";
      case Constant.ATTACHMENT_DOWNLOAD_TYPE.TEMPLATE:
        return "/template/download/";
      case Constant.ATTACHMENT_DOWNLOAD_TYPE.CALENDAR:
        return "/attachment_calendar/download/";
      case Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_INTERNAL:
        return "/doc_internal/download/";
      case Constant.ATTACHMENT_DOWNLOAD_TYPE.REPORT:
        return "/report/download/";
      case Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_VEHICLE:
        return "/vehicle-usage-plan/attachment/download/";
      case Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_VEHICLE_COMMENT:
        return "/vehicle-attach-comment/download/";
      case Constant.ATTACHMENT_DOWNLOAD_TYPE.DYNAMIC_FORM:
        return "/attachment-dynamic/download/";
      default:
        return "/files/";
    }
  }
  static async getFileToView(url: string, idOrName: string): Promise<Blob> {
    try {
      const res = await sendGet(`${url}${encodeURIComponent(idOrName)}`, null, {
        responseType: "blob",
        // Tải file nặng có thể vượt 60s, bỏ timeout cho request này
        timeout: 0,
      });
      return res as Blob;
    } catch (error: any) {
      // Check if it's a 404 error
      if (error.response?.status === 404) {
        throw new Error("Lỗi không tìm thấy tệp phù hợp");
      }
      // All other errors
      throw new Error("SYSTEM_ERROR");
    }
  }

  static async getValidatedFile(
    url: string,
    fileName: string,
    attachId?: string | null
  ): Promise<Blob> {
    const res = await sendGet(
      `${url}&file=${fileName}&attachId=${attachId || ""}`,
      null,
      { responseType: "blob" }
    );
    return res as Blob;
  }
}

// Lightweight browser helper
function saveBlobToFile(fileName: string, data: Blob) {
  if (fileName) {
    fileName = fileName.replace(/__\d+$/, "");
  }
  const blob = new Blob([data], {
    type: data.type || "application/octet-stream",
  });
  const navAny =
    typeof window !== "undefined" ? (window.navigator as any) : undefined;
  if (navAny?.msSaveOrOpenBlob) {
    navAny.msSaveOrOpenBlob(blob, fileName);
  } else {
    const objectUrl = URL.createObjectURL(blob);
    const downloadLink = document.createElement("a");
    downloadLink.href = objectUrl;
    downloadLink.download = fileName;
    downloadLink.click();
    URL.revokeObjectURL(objectUrl);
  }
}

function getDownloadFileUrl(fileType: string): string {
  switch (fileType) {
    case Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_IN:
      return "/doc_out_attach/download/";
    case Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_OUT:
      return "/attachment/download/";
    case Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_OUT_COMMENT:
      return "/attachment_comment/download/";
    case Constant.ATTACHMENT_DOWNLOAD_TYPE.DELEGATE:
      return "/delegate/download/";
    case Constant.ATTACHMENT_DOWNLOAD_TYPE.WORD_EDITOR:
      return "/taskAtt/download/";
    case Constant.ATTACHMENT_DOWNLOAD_TYPE.TEMPLATE:
      return "/template/download/";
    case Constant.ATTACHMENT_DOWNLOAD_TYPE.CALENDAR:
      return "/attachment_calendar/download/";
    case Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_INTERNAL:
      return "/doc_internal/download/";
    case Constant.ATTACHMENT_DOWNLOAD_TYPE.REPORT:
      return "/report/download/";
    case Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_VEHICLE:
      return "/vehicle-usage-plan/attachment/download/";
    case Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_VEHICLE_COMMENT:
      return "/vehicle-attach-comment/download/";
    case Constant.ATTACHMENT_DOWNLOAD_TYPE.DYNAMIC_FORM:
      return "/attachment-dynamic/download/";
    default:
      return "/files/";
  }
}

async function uploadFile(file: File): Promise<any> {
  const fd = new FormData();
  fd.append("file", file);
  return sendPost(`/files/upload`, fd);
}

async function deleteDocumentOutAttachment(attachmentId: number): Promise<any> {
  return sendPost(`${Constant.ATTACHMENT.DELETE}${attachmentId}`);
}

async function getFile(name: string): Promise<Blob> {
  const res = await sendGet(
    `/taskAtt/download/${encodeURIComponent(name)}`,
    null,
    { responseType: "blob" }
  );
  return res as Blob;
}

async function getFileBatch(name: string, url: string): Promise<Blob> {
  const res = await sendGet(`${url}${encodeURIComponent(name)}`, null, {
    responseType: "blob",
  });
  return res as Blob;
}

async function getFileToViewCompat(
  idOrName: string,
  type: string
): Promise<Blob> {
  const url = getDownloadFileUrl(type);
  return FileService.getFileToView(url, idOrName);
}

async function getValidatedFileCompat(
  name: string,
  url: string = "",
  attachId: string | null = null
): Promise<Blob> {
  if (attachId != null) {
    const res = await sendGet(url + attachId, null, { responseType: "blob" });
    return res as Blob;
  }
  const res = await sendGet(url + encodeURIComponent(name), null, {
    responseType: "blob",
  });
  return res as Blob;
}

async function getValidatedFileFullUrl(url: string): Promise<Blob> {
  const res = await sendGet(url, null, { responseType: "blob" });
  return res as Blob;
}

function downloadFileFullUrl(fileName: string, url: string) {
  getValidatedFileFullUrl(url).then((blob) => saveBlobToFile(fileName, blob));
}

async function downloadFileCompat(
  fileName: string,
  fileType: string = "",
  decrypt: boolean = false,
  attachId: string | null = null,
  cert: any = null,
  draftId?: string,
  typeDoc?: string
) {
  const url = getDownloadFileUrl(fileType);
  if (decrypt) {
    await doDecryptCompat(
      fileName,
      url,
      false,
      attachId,
      cert,
      true,
      1,
      draftId,
      typeDoc
    );
    return;
  }
  if (fileType) {
    const blob = await getValidatedFileCompat(
      attachId ? attachId : fileName,
      url,
      attachId
    );
    saveBlobToFile(fileName, blob);
  } else {
    const blob = await getFile(fileName);
    saveBlobToFile(fileName, blob);
  }
}

async function downloadNormalFileToBlob(idOrName: string, urlType: string) {
  const blob = await getFileBatch(idOrName, getDownloadFileUrl(urlType));
  return blob;
}

function doCheckFileExtension(files: FileList): boolean {
  for (const file of Array.from(files)) {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (
      !ext ||
      !Constant.ALLOWED_FILE_EXTENSION.toLowerCase().includes(`.${ext}`)
    ) {
      return false;
    }
  }
  return true;
}

function validateNumberOfFileUpload(
  selected: any[],
  newFiles: FileList,
  isRemove: boolean
): boolean {
  const selectedCount = Array.isArray(selected) ? selected.length : 0;
  if (!isRemove) {
    return selectedCount + newFiles.length <= Constant.MAX_FILES_UPLOAD;
  }
  return true;
}
async function viewFile(file: any, type: string, isViewPopup: boolean = true) {
  let extension = getExtension(file.name);
  if (extension) {
    extension = extension.toLowerCase();
  }
  if ("pdf" === extension) {
    await viewPdfFile(file, type, isViewPopup);
  } else {
    viewDocFile(file, type);
  }
}

async function viewPdfFile(
  file: any,
  type: string,
  isViewPopup: boolean = true,
  draftId?: string,
  typeDoc?: string
) {
  if (file && !file.id && !file.encrypt) {
    const reader = new FileReader();
    reader.onloadend = (e: any) => {
      const buffer = e.target.result as ArrayBuffer;
      const blob = new Blob([buffer], { type: "application/pdf" });
      openPdf(blob, isViewPopup);
    };
    reader.readAsArrayBuffer(file);
    return;
  }

  if (
    (type === Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_INTERNAL ||
      type === Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_VEHICLE ||
      type === Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_IN) &&
    !file.encrypt
  ) {
    try {
      const idOrName =
        type !== Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_IN
          ? String(file.id)
          : String(file.name);
      const fileGeted = await getFileToViewCompat(idOrName, type);
      const reader = new FileReader();
      reader.onloadend = (e: any) => {
        const buffer = e.target.result as ArrayBuffer;
        const blob = new Blob([buffer], { type: "application/pdf" });
        openPdf(blob, isViewPopup);
      };
      reader.readAsArrayBuffer(fileGeted);
    } catch (e: any) {
      console.log("Error view pdf file:", e);
      if (e.message === "NOT_FOUND") {
        ToastUtils.error("Không tìm thấy tệp");
      } else {
        ToastUtils.error("Lỗi hệ thống");
      }

      return;
    }
    return;
  }

  if (file.encrypt) {
    const url = getDownloadFileUrl(type);
    await doDecryptCompat(
      type !== Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_INTERNAL
        ? file.name
        : String(file.id),
      url,
      true,
      null,
      null,
      false,
      1,
      draftId,
      typeDoc
    );
    return;
  }

  const blob = await getFileToViewCompat(String(file.name), type);
  openPdf(blob, isViewPopup);
}

function openPdf(fileData: Blob, isViewPopup: boolean = true) {
  if (Constant.PDF_OPEN_IN_NEW_TAB) {
    const fileURL = URL.createObjectURL(fileData);
    window.open(fileURL, "_blank");
  } else {
    const fileURL = URL.createObjectURL(fileData);
    window.open(fileURL, "_blank");
    if (!isViewPopup) {
      // noop
    }
  }
}

function viewDocFile(file: any, type: string) {
  const ext = String(file?.name || "")
    .split(".")
    .pop()
    ?.toLowerCase();
  if (!ext) return;

  if (file && !file.id && !file.encrypt) {
    const reader = new FileReader();
    reader.onload = (event: any) => {
      const fileData = event.target.result;
      openDoc(file, type, fileData);
    };
    reader.readAsDataURL(file as Blob);
  } else if (file.encrypt) {
    const url = getDownloadFileUrl(type);
    doDecryptCompat(
      type !== Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_INTERNAL
        ? file.name
        : String(file.id),
      url,
      true,
      null
    );
  } else {
    openDoc(file, type, null);
  }
}

function openDoc(file: any, type: string, _fileData: any) {
  try {
    const ext = getExtension(file.name)?.toLowerCase();

    // Handle Word documents: view via in-app DOCX viewer (new tab), fallback to download
    if (ext === "docx" || ext === "doc") {
      // If encrypted -> decrypt flow (view), else route to viewer
      if (file.encrypt) {
        const url = getDownloadFileUrl(type);
        // View after decrypt (not download)
        void doDecryptCompat(
          type !== Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_INTERNAL
            ? file.name
            : String(file.id),
          url,
          true,
          null,
          null,
          false
        );
        return;
      }

      // If we already have local file data (e.g., uploaded File -> DataURL), pass blob URL to viewer
      const openWithBlobUrl = async (dataUrl: string) => {
        try {
          const blob = await (await fetch(dataUrl)).blob();
          const objectUrl = URL.createObjectURL(blob);
          window.open(
            `/viewer/docx?src=${encodeURIComponent(objectUrl)}&name=${encodeURIComponent(
              file.name
            )}`,
            "_blank"
          );
        } catch {
          // Fallback: download if any error happens
          downloadFileCompat(file.name, type, false);
        }
      };

      if (_fileData) {
        void openWithBlobUrl(_fileData);
        return;
      }

      // Remote file: open viewer page with params; that page will fetch blob (supports large files)
      const idOrName =
        type === Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_INTERNAL
          ? String(file.id)
          : String(file.name);
      const dlBase = getDownloadFileUrl(type);
      const viewerUrl = `/viewer/docx?name=${encodeURIComponent(
        idOrName
      )}&type=${encodeURIComponent(dlBase)}&downloadType=${encodeURIComponent(
        type
      )}&displayName=${encodeURIComponent(file.displayName || file.name)}`;
      window.open(viewerUrl, "_blank");
      return;
    }

    // Default behavior: download
    downloadFileCompat(file.name, type, file.encrypt);
  } catch (error) {
    handleError(error);
  }
}

async function doDecryptCompat(
  name: string,
  url: string,
  type: boolean = false,
  attachId: string | null = null,
  cert: any = null,
  isDownLoad: boolean = false,
  size: number = 1,
  draftId?: string,
  typeDoc?: string
) {
  try {
    await DecryptionService.doDecrypt(
      name,
      url,
      type, // true nếu muốn xem, false nếu chỉ tải
      attachId,
      cert,
      isDownLoad,
      size, // size hoặc giá trị khác nếu cần
      draftId,
      typeDoc
    );
  } catch (error) {
    console.error("Lỗi khi giải mã:", error);
    throw error;
  }
}

async function ocrFile(file: File): Promise<{ value: any } | null> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await sendPost(`/file/ocr`, fd);
  return (res?.data as any) ?? null;
}
export interface FileItem {
  id?: string | number;
  encrypt?: boolean;
  oEncrypt?: boolean;
  template?: boolean;
  [key: string]: any;
}

function getUrlByObjType(objType: OBJ_TYPE) {
  switch (objType) {
    case OBJ_TYPE.VAN_BAN_DEN:
      return Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_OUT;
    case OBJ_TYPE.VAN_BAN_DI:
      return Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_IN;
    case OBJ_TYPE.GIAO_VIEC:
      return Constant.ATTACHMENT_DOWNLOAD_TYPE.TASK;
    case OBJ_TYPE.VAN_BAN_NOI_BO:
      return Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_INTERNAL;
    case OBJ_TYPE.LICH:
      return Constant.ATTACHMENT_DOWNLOAD_TYPE.CALENDAR;
    case OBJ_TYPE.VAN_BAN_XIN_XE:
      return Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_VEHICLE;
    default:
      break;
  }
}
async function removeFileInDBBatch(file: FileItem, type: OBJ_TYPE) {
  if (OBJ_TYPE.VAN_BAN_DEN == type) {
    await deleteDocumentOutAttachment(file.id as number);
  } else if (OBJ_TYPE.VAN_BAN_DI == type) {
    await AttachmentService.doDeleteAttachment(file.id as number, true);
  } else if (OBJ_TYPE.GIAO_VIEC == type) {
    await TaskService.doDeleteTaskAtt(file.id as number);
  } else if (OBJ_TYPE.VAN_BAN_NOI_BO == type) {
    await DocumentInService.deleteAttachment(file.id as number);
  } else if (OBJ_TYPE.LICH == type) {
    await CalendarService.doDeleteAttachment(file.id as number);
  }
}

async function cleanFileArr(
  tmpFiles: FileItem[] | undefined,
  objType: OBJ_TYPE
): Promise<Blob[] | undefined> {
  const arrDes: Blob[] = [];

  if (!tmpFiles || tmpFiles.length === 0) {
    return;
  }

  for (const i of tmpFiles) {
    let param: any = i.name;
    if (
      objType === OBJ_TYPE.VAN_BAN_NOI_BO ||
      objType === OBJ_TYPE.VAN_BAN_XIN_XE
    ) {
      param = i.id;
    }

    // eslint-disable-next-line no-await-in-loop
    const blob = await downloadNormalFileToBlob(
      param,
      getUrlByObjType(objType) as string
    );
    if (blob) {
      arrDes.push(blob);
    } else {
      console.log("failing");
    }
  }

  tmpFiles.filter((i) => !i.id).forEach((i) => removeFileInDBBatch(i, objType));

  return arrDes;
}

async function filterFile(
  files: FileItem[] | undefined,
  type: string,
  objType: OBJ_TYPE
): Promise<FileItem[]> {
  if (!files || files.length === 0) {
    return [];
  }

  if (type === "encrypt") {
    const newToEncrypt = files.filter((i) => i.encrypt && !i.id);

    let oldToEncrypt = files.filter(
      (i) => (i.encrypt && i.id && !i.oEncrypt) || (i.template && i.encrypt)
    );

    oldToEncrypt = (await cleanFileArr(oldToEncrypt, objType)) ?? [];

    return oldToEncrypt.concat(newToEncrypt);
  }

  const nonEncrypt = files.filter(
    (i) => (!i.encrypt && !i.id) || (!i.encrypt && i.template)
  );

  return nonEncrypt;
}

const getUrl = (fileType: string) => {
  if (fileType) {
    return getDownloadFileUrl(fileType);
  }
  return "/taskAtt/download/";
};

type WhatPrms = {
  fileName: string;
  apiDownload: string;
  apiUpload: string;
  fileData: string;
  token: string;
};

export const verifierPDF = (
  fileName: string,
  fileData?: string,
  type?: string
) => {
  const prms: WhatPrms = {
    fileName,
    apiDownload:
      Constant.API_ENDPOINT + getDownloadFileUrl(type || "") + fileName,
    apiUpload: "",
    fileData: fileData || "",
    token: localStorage.getItem("token") as string,
  };

  SignatureService.VerifierPDF(prms, (data) => {
    if (data === "-1") {
      ToastUtils.fileDownloadError();
    } else if (data === "-2") {
      ToastUtils.fileOpenWordError();
      ToastUtils.fileOpenWordError();
      ToastUtils.fileOpenWordError();
    } else if (data === "-100") {
      ToastUtils.signatureSignNoConnect();
    } else if (data === "1006") {
      ToastUtils.signatureSignNoConnectVgca();
    }
  });
};

type ReceivedMsg = {
  Status: number;
  Message: string;
};

export const signNotification = (data: string, closePopup: () => void) => {
  const receivedMsg: ReceivedMsg = JSON.parse(data);

  closePopup();

  if (receivedMsg.Status === 0) {
    ToastUtils.kyThanhCong();
  } else {
    ToastUtils.coLoiXayRa(receivedMsg.Message);
  }
};

export const uploadFileEncryptToSign = async (
  fileName: string,
  fileType = "",
  encrypt = false,
  attachId: number | null = null,
  cert = null,
  fileId: string,
  typeDoc: string
) => {
  const url = getUrl(fileType);

  if (encrypt) {
    await DecryptionService.doDecryptToSignFilePdf(
      fileName,
      url,
      false,
      attachId,
      cert,
      fileId,
      typeDoc,
      fileType,
      attachId
    );
  }
};
export const uploadFileEncryptToSignIssued = async (
  fileName: string,
  fileType = "",
  encrypt = false,
  attachId: number | null = null,
  cert = null,
  fileId: string,
  typeDoc: string,
  draft: any
) => {
  const url = getUrl(fileType);

  if (encrypt) {
    const ngayCongVan = getDateCalendar(
      convertStringDateToNgbDate(draft.dateIssued, true)
    );
    const soVb =
      (draft.numberInBook != null ? draft.numberInBook : "") +
      (draft.numberOrSign != null ? draft.numberOrSign : "");

    await DecryptionService.doDecryptToSignIssuedFilePdf(
      fileName,
      url,
      false,
      attachId,
      cert,
      fileId,
      typeDoc,
      soVb,
      ngayCongVan,
      fileType,
      attachId
    );
  }
};

export async function rollback(
  allFileNames: string[] = [],
  userIdShared: string[] = [],
  cmtType: string,
  cmtIdSaved: string | null = null
) {
  try {
    if (Constant.ENCRYPTION_TWD) {
      await delCommentByType(allFileNames, userIdShared, cmtType, cmtIdSaved);
    }
  } catch (e) {
    ToastUtils.rollbackThatBai();
  }
}
export async function delCommentByType(
  fileNames: string[] = [],
  userIds: string[] = [],
  type: string,
  cmtIdSaved: string | null = null
) {
  if (
    (!fileNames || fileNames.length === 0) &&
    !cmtIdSaved &&
    (!userIds || userIds.length === 0)
  ) {
    return;
  }
  const formData = new FormData();
  formData.append("type", type);
  if (fileNames && fileNames.length > 0) {
    for (const f of fileNames) {
      formData.append("fileNames", f);
    }
  }
  if (userIds && userIds.length > 0) {
    for (const userId of userIds) {
      formData.append("userIds", userId);
    }
  }
  if (cmtIdSaved != null) {
    formData.append("cmtIdSaved", cmtIdSaved);
  }
  return sendPost("/common/comment/del", formData);
}
async function processFile(files: FileItem[], type: string) {
  const nonEncrypt = files ? files.filter((i) => !i.encrypt) : [];
  if (type == "nonEnc") {
    return nonEncrypt;
  }
  const encrypt = files ? files.filter((i) => i.encrypt) : [];
  return EncryptionService.sendListFile(encrypt as File[]);
}

function filterByMap(map: Map<number, any>, type: string) {
  if (!map) {
    return [];
  }
  const keys = [];
  const files = [];
  for (let index = 0; index < map.size; index++) {
    const element = map.get(index);
    const file = element[0];
    const key = element[1];
    if (!element || !file || !key) {
      // eslint-disable-next-line no-continue
      continue;
    }
    keys.push(key);
    files.push(file);
  }

  if (type == "key") {
    return keys;
  }
  if (type == "file") {
    return files;
  }
  return [];
}

export async function doSharePermissionDocFile(
  data: any,
  isRollback = true,
  isCheckClerial = false
) {
  const ENCRYPTION_TWD = true;
  const encDocFileNames = data.onlyShareFileObject
    ? []
    : await CommonService.getAttachsByTypeAndObjId(data.attType, data.objId);
  const encryptFile = data.files
    ? data.files.filter((i: any) => i.encrypt)
    : [];
  if (
    ENCRYPTION_TWD &&
    ((data.checkObjEnc && encDocFileNames && encDocFileNames.length > 0) ||
      (encryptFile && encryptFile.length > 0) ||
      data.onlyShareFileObject)
  ) {
    const userCerts =
      data.userOrobj === CERT_OBJ_TYPE.user
        ? await CommonService.certByUserId(
            data.userIds,
            data.orgIds,
            data.objType
          )
        : isCheckClerial
          ? await CommonService.getCertClerialByObjId(data.objId, data.objType)
          : await CommonService.getCertByObjId(data.objId, data.objType);
    let error = await CommonService.checkCert(userCerts);
    if (error == null || error !== "") {
      error = error == null ? "Cá nhân, tổ chức được chọn" : error;
      ToastUtils.chuaDuocXacThucDeChiaSeTepMaHoa(error);
      return false;
    }
    data.userIdShared = userCerts.map((i: any) => i.id);
    const nonEncFiles = await processFile(data.files, "nonEnc");
    const rsMap = await processFile(data.files, "enc");
    if (rsMap === false) {
      return false;
    }
    const encFiles = filterByMap(rsMap as Map<number, any>, "file");
    const keys = filterByMap(rsMap as Map<number, any>, "key");
    if (!encFiles || !nonEncFiles || !keys) {
      return false;
    }
    const rsObj = await CommonService.saveCommentByType(
      data.objId,
      data.hash,
      data.comment,
      data.endDate,
      nonEncFiles as any[],
      encFiles,
      data.cmtType,
      keys,
      data.cmtContent
    );
    let fileNameShared: string[] = [];
    if (rsObj && rsObj["data"]) {
      const { encFileNames, nonEncFileNames, cmtId } = rsObj["data"];
      if (encFileNames) {
        data.allFileNames = data.allFileNames.concat(encFileNames);
        fileNameShared = fileNameShared.concat(encFileNames);
      }
      if (nonEncFileNames) {
        data.allFileNames = data.allFileNames.concat(nonEncFileNames);
      }
      if (encDocFileNames && data.onlyShareFileObject === false) {
        fileNameShared = fileNameShared.concat(encDocFileNames);
      }
      data.cmtIdSaved = cmtId;
      const rs = await EncryptionService.doTransferExecute(
        fileNameShared as [],
        data.userIdShared as []
      );
      if (rs === undefined) {
        if (isRollback) {
          await rollback(
            data.allFileNames,
            data.userIdShared,
            data.cmtType,
            data.cmtIdSaved
          );
        }
        return true;
      }
      if (rs === false) {
        await rollback(
          data.allFileNames,
          data.userIdShared,
          data.cmtType,
          data.cmtIdSaved
        );
        return false;
      }
    } else {
      await rollback(
        data.allFileNames,
        data.userIdShared,
        data.cmtType,
        data.cmtIdSaved
      );
      return false;
    }
    data.comment = "";
    data.cmtContent = "";
    data.files = [];
  }
}
export async function getCert(
  userIds: never[],
  orgIds = [],
  type = CERT_OBJ_TYPE.doc_in_transfer,
  isCheckLead = false
) {
  if (!(await getUSBToken())) {
    return false;
  }
  // console.log(tokenCheck)
  // if(tokenCheck == undefined){
  //   return false;
  // }
  const userCerts = await CommonService.certByUserId(
    userIds,
    orgIds,
    type,
    isCheckLead
  );
  let error = await CommonService.checkCert(userCerts);
  if (error != "") {
    error = error == null ? "Cá nhân/ tổ chức được chọn" : error;
    ToastUtils.error(`${error} chưa được xác thực để chia sẻ tệp mã hóa`);
    return false;
  }
  return true;
}
export async function getUSBToken() {
  const cert = await EncryptionService.getUSBToken();
  if (typeof cert === "string") {
    const res = await TokenValidationService.checkTokenOfUser(cert.toString());
    if (res.data == true) {
      return true;
    } else {
      ToastUtils.error("Token hiện tại không hợp lệ");
      return false;
    }
  } else {
    ToastUtils.error("Không thể lấy token");
    return false;
  }
}
export async function saveCmtAndAtmByNonEnc(data: any) {
  await CommonService.saveCommentByType(
    data.objId,
    data.hash,
    data.comment,
    data.endDate,
    data.files,
    [],
    data.cmtType,
    [],
    data.cmtContent
  );
}

export const downloadFileTable = async (
  fileName: string,
  displayName: string
): Promise<void> => {
  try {
    const blob = await FileService.getFile(
      fileName,
      Constant.ATTACHMENT.DOWNLOAD
    );
    const url = URL.createObjectURL(blob);
    const displayNameFile = displayName ? displayName : "document.pdf";
    const a = document.createElement("a");
    a.href = url;
    a.download = displayNameFile;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Download error:", error);
  }
};

export const uploadFileService = {
  uploadFile,
  deleteDocumentOutAttachment,
  getFile,
  getFileBatch,
  getFileToView: getFileToViewCompat,
  getValidatedFile: getValidatedFileCompat,
  getValidatedFileFullUrl,
  downloadFileFullUrl,
  downloadFile: downloadFileCompat,
  downloadFileTable,
  downloadNormalFileToBlob,
  doCheckFileExtension,
  validateNumberOfFileUpload,
  viewPdfFile,
  openPdf,
  viewDocFile,
  openDoc,
  doDecrypt: doDecryptCompat,
  ocrFile,
  filterFile,
  getUrl,
  verifierPDF,
  signNotification,
  uploadFileEncryptToSign,
  uploadFileEncryptToSignIssued,
  rollback,
  delCommentByType,
  doSharePermissionDocFile,
  saveCmtAndAtmByNonEnc,
  viewFile,
  getCert,
};
