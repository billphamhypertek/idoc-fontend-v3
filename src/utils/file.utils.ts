// utils/fileUtils.ts
import { ATTACHMENT_DOWNLOAD_TYPE } from "@/definitions/constants/common.constant";
import { Constant } from "@/definitions/constants/constant";
import { uploadFileService } from "@/services/file.service";
import { getExtension, handleError, saveFile } from "@/utils/common.utils";

// Types
export interface FileObject {
  name: string;
  id?: string;
  encrypt?: boolean;
  docId?: string;
}

// Main viewFile function
export const viewFile = async (
  file: FileObject,
  type: string
): Promise<void> => {
  const extension = getExtension(file.name)?.toLowerCase();

  if (extension?.includes("pdf")) {
    await viewPdfFile(file, type);
  } else {
    await viewDocFile(file, type);
  }
};

// View PDF file
export const viewPdfFile = async (
  file: FileObject,
  type: string
): Promise<void> => {
  try {
    let fileData: Blob | ArrayBuffer;
    const url = getUrl(type);
    // Case 1: Local file (no id, not encrypted)
    if (file && !file.id && !file.encrypt) {
      fileData = await readFileAsArrayBuffer(file as File);
      openPdf(fileData);
      return;
    }

    // Case 2: Encrypted file
    if (file.encrypt) {
      const fileNameOrId =
        type !== Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_INTERNAL
          ? file.name
          : file.id;
      if (!fileNameOrId) {
        throw new Error("File name or ID is required for decryption.");
      }
      await uploadFileService.doDecrypt(fileNameOrId, url, true, null);
      return;
    }

    // Case 3: Server file
    fileData = await getFileFromServer(file, type);
    openPdf(fileData);
  } catch (error) {
    throw error;
  }
};

// View DOC file (download)
export const viewDocFile = async (
  file: FileObject,
  type: string
): Promise<void> => {
  try {
    if (file && !file.id && !file.encrypt) {
      // Local file - download directly
      downloadLocalFile(file as File);
    } else if (file.encrypt) {
      // Encrypted file - handle decryption
      const fileNameOrId =
        type !== Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_INTERNAL
          ? file.name
          : file.id;
      if (!fileNameOrId) {
        throw new Error("File name or ID is required for decryption.");
      }
      await uploadFileService.doDecrypt(fileNameOrId, getUrl(type), true, null);
    } else {
      // Server file - download from server
      await downloadFileFromServer(file, type);
    }
  } catch (error) {
    console.error("Error viewing DOC:", error);
    handleError(error);
  }
};

export const downloadFile = async (
  fileName: any,
  fileType: string = "",
  decrypt: boolean = false,
  cert: any = null,
  attachId: string | null = null,
  newVersion: boolean = false
): Promise<void> => {
  try {
    const url = getUrl(fileType);
    if (decrypt) {
      await uploadFileService.doDecrypt(
        fileName,
        url,
        false,
        attachId,
        cert,
        true
      );
    } else if (fileType) {
      await downloadValidatedFile(fileName, fileType, attachId, newVersion);
    } else {
      await downloadNormalFile(fileName, newVersion);
    }
  } catch (error) {
    throw error;
  }
};

// Download validated file (with fileType)
const downloadValidatedFile = async (
  fileName: string,
  fileType: string,
  attachId: string | null = null,
  newVersion: boolean = false
): Promise<void> => {
  try {
    const url = newVersion
      ? `/taskAtt2/download/`
      : getDownloadFileUrl(fileType);
    const downloadUrl = attachId
      ? `${url}${attachId}`
      : `${url}${encodeURIComponent(fileName)}`;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_HOST}${downloadUrl}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Lỗi không tìm thấy tệp phù hợp`);
    }

    const blob = await response.blob();
    saveFile(fileName, blob);
  } catch (error) {
    console.error("Error downloading validated file:", error);
    throw error;
  }
};

// Download normal file (without fileType)
const downloadNormalFile = async (
  fileName: string,
  newVersion: boolean = false
): Promise<void> => {
  try {
    const url = newVersion
      ? `${process.env.NEXT_PUBLIC_API_HOST}/taskAtt2/download/${encodeURIComponent(fileName)}`
      : `${process.env.NEXT_PUBLIC_API_HOST}/taskAtt/download/${encodeURIComponent(fileName)}`;
    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Lỗi không tìm thấy tệp phù hợp`);
    }

    const blob = await response.blob();
    saveFile(fileName, blob);
  } catch (error) {
    console.error("Error downloading normal file:", error);
    throw error;
  }
};

// Download file from server
const downloadFileFromServer = async (
  file: FileObject,
  type: string
): Promise<void> => {
  const blob = await getFileFromServer(file, type);
  saveFile(file.name, blob);
};

// Download local file
const downloadLocalFile = (file: File): void => {
  const url = URL.createObjectURL(file);
  const link = document.createElement("a");
  link.href = url;
  link.download = file.name;
  link.click();
  URL.revokeObjectURL(url);
};

// Helper functions
const readFileAsArrayBuffer = (file: File): Promise<ArrayBuffer> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = (e) => resolve(e.target?.result as ArrayBuffer);
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

const openPdf = (fileData: Blob | ArrayBuffer): void => {
  const file = new Blob([fileData], { type: "application/pdf" });
  const fileURL = URL.createObjectURL(file);
  window.open(fileURL, "_blank");
  // Không revoke ngay để tránh ngắt tải với file lớn; để trình duyệt thu gom khi tab đóng
};

const getFileFromServer = async (
  file: FileObject,
  type: string
): Promise<Blob> => {
  // Dùng axios thông qua uploadFileService để đảm bảo responseType blob và header token chuẩn
  const idOrName =
    type === ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_INTERNAL ||
    type === ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_VEHICLE
      ? String(file.id)
      : file.name;
  if (!idOrName) throw new Error("Missing file identifier");
  const blob = await uploadFileService.getFileToView(idOrName, type);
  return blob;
};

const getDownloadUrl = (file: FileObject, type: string): string => {
  const baseUrl = process.env.NEXT_PUBLIC_API_HOST || "";

  if (
    type === ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_INTERNAL ||
    type === ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_VEHICLE
  ) {
    return `${baseUrl}${getDownloadFileUrl(type)}${file.id}`;
  } else {
    return `${baseUrl}${getDownloadFileUrl(type)}${file.name}`;
  }
};

const getDownloadFileUrl = (type: string): string => {
  const urlMap: Record<string, string> = {
    [ATTACHMENT_DOWNLOAD_TYPE.CALENDAR]: "/attachment_calendar/download/",
    [ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_IN]: "/document_in/download/",
    [ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_OUT]: "/document_out/download/",
    [ATTACHMENT_DOWNLOAD_TYPE.TASK]: "/taskAtt/download/",
    [ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_INTERNAL]: "/doc_internal/download/",
    [ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_VEHICLE]:
      "/vehicle-usage-plan/attachment/update-sign-file/",
    [ATTACHMENT_DOWNLOAD_TYPE.DELEGATE]: "/delegate/download/",
    [ATTACHMENT_DOWNLOAD_TYPE.TEMPLATE]: "/template/download/",
  };

  return urlMap[type] || "/files/";
};

const getUrl = (fileType: string): string => {
  if (fileType) {
    return getDownloadFileUrl(fileType);
  }
  return "/taskAtt/download/";
};

// Get authentication token
const getToken = (): string => {
  // Get token from localStorage or your auth context
  return localStorage.getItem("token") || "";
};

// Check if file can be viewed
export const isViewFile = (fileName: string): boolean => {
  const extension = getExtension(fileName)?.toLowerCase();
  return extension === "pdf" || extension === "docx" || extension === "doc";
};

export const isView = (file: FileObject): boolean => {
  return isViewFile(file.name) && !file.encrypt;
};

export const doOpenShare = (file: any) => {
  // This would open the share modal
  console.log("Open share for file:", file);
};

export const viewFileCheck = async (
  file: any,
  type: string,
  documentId: string,
  successCallback?: (file: any) => void,
  failCallback?: (file: any) => void
): Promise<boolean> => {
  return new Promise(async (resolve, reject) => {
    let extension = getExtension(file.name);

    if (!extension) {
      console.error("Không xác định được định dạng file");
      reject(new Error("Không xác định được định dạng file"));
      return;
    }

    extension = extension.toLowerCase();

    try {
      // 🔹 Trường hợp 1: File không mã hóa và không có ID (file local)
      if (file && !file.id && !file.encrypt) {
        const reader = new FileReader();

        reader.onload = (event: any) => {
          try {
            const fileData = event.target.result;
            uploadFileService.openDoc(file, type, fileData);
            successCallback?.(file);
            resolve(true);
          } catch (error) {
            console.error("Lỗi khi mở file:", error);
            failCallback?.(file);
            reject(error);
          }
        };

        reader.onerror = (error) => {
          console.error("Lỗi khi đọc file:", error);
          reject(error);
        };

        reader.readAsDataURL(file as any);
      }

      // 🔹 Trường hợp 2: File mã hóa
      else if (file.encrypt) {
        const url = uploadFileService.getUrl(type);

        try {
          await uploadFileService.doDecrypt(
            type !== Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_INTERNAL
              ? file.name
              : (file.id?.toString() ?? ""),
            url,
            true,
            null,
            null,
            false,
            1,
            documentId,
            Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_OUT
          );
          successCallback?.(file);
          resolve(true);
        } catch (error) {
          console.error("Lỗi khi tải/giải mã file:", error);
          failCallback?.(file);
          reject(error);
        }
      }

      // 🔹 Trường hợp 3: File có ID, không mã hóa
      else {
        try {
          uploadFileService.openDoc(file, type, null);
          successCallback?.(file);
          resolve(true);
        } catch (error) {
          console.error("Lỗi khi mở file:", error);
          failCallback?.(file);
          reject(error);
        }
      }
    } catch (error) {
      console.error("Lỗi xử lý file:", error);
      failCallback?.(file);
      reject(error);
    }
  });
};

// Service class for better organization
export class FileService {
  static async viewFile(file: FileObject, type: string): Promise<void> {
    return viewFile(file, type);
  }

  static async downloadFile(
    fileName: string,
    fileType: string = "",
    decrypt: boolean = false,
    cert: any = null,
    attachId: string | null = null
  ): Promise<void> {
    return downloadFile(fileName, fileType, decrypt, cert, attachId);
  }

  static async downloadFileFromServer(
    file: FileObject,
    type: string
  ): Promise<void> {
    return downloadFileFromServer(file, type);
  }

  static isViewFile(fileName: string): boolean {
    return isViewFile(fileName);
  }

  static isView(file: FileObject): boolean {
    return isView(file);
  }
}

export const getFileSizeString = (size: number): string => {
  const KB = size / 1024;
  const MB = KB / 1024;
  if (MB >= 0.1) {
    return `${MB.toFixed(2)} MB`;
  }
  if (KB > 0) {
    return `${KB.toFixed(2)} KB`;
  }
  return "";
};

export const isViewableFile = (file: any): boolean => {
  const extension = file.name.split(".").pop()?.toLowerCase();
  const viewableExtensions = ["pdf", "txt", "jpg", "jpeg", "png", "gif"];
  return viewableExtensions.includes(extension || "") && !file.oEncrypt;
};

export const validFileSize = (
  files: FileList,
  maxSizeMB: number = 300
): boolean => {
  const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
  for (let i = 0; i < files.length; i++) {
    if (files[i].size > maxSize) {
      return false;
    }
  }
  return true;
};

export const isExistFile = (fileName: string, fileList: any[]): boolean => {
  return fileList.some((file) => file.name === fileName);
};

// Re-export from common.utils
export { validFileSSize } from "./common.utils";
