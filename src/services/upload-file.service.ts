import { sendPost } from "@/api";
import { CommonService } from "./common";
import { EncryptionService } from "./encryption.service";
import { SharedFileData } from "@/definitions/types/document-out.type";
import { OBJ_TYPE } from "@/definitions/enums/document.enum";
import { ToastUtils } from "@/utils/toast.utils";
import { Constant } from "@/definitions/constants/constant";

export class UploadFileService {
  static ENCRYPT = "encrypt";

  static async uploadFile(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const response = await sendPost("/files/upload", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data.message || response.data;
  }

  static validateFileExtension(
    files: FileList,
    allowedExtensions: string
  ): boolean {
    if (!files || files.length === 0) return false;

    const file = files[0];
    const fileExtension = "." + file.name.split(".").pop()?.toLowerCase();
    const allowedExts = allowedExtensions.split(", ");

    return allowedExts.includes(fileExtension);
  }

  static validateFileSize(file: File, maxSize: number): boolean {
    return file.size <= maxSize;
  }

  /**
   * Filter files by encryption type
   * @param files - Array of files to filter
   * @param type - "encrypt" for encrypted files, "" or null for non-encrypted files
   * @param objType - Object type (VAN_BAN_DI, etc.)
   * @returns Filtered array of files
   */
  static async filterFile(
    files: Array<File | Record<string, unknown>>,
    type: string,
    objType: OBJ_TYPE
  ): Promise<Array<File | Record<string, unknown>>> {
    if (!files || files.length === 0) {
      return [];
    }

    if (type === "encrypt") {
      // Return encrypted files: new files with encrypt, uploaded files with new encryption, or template files
      const encrypted = files.filter((i) => {
        const item = i as Record<string, unknown>;
        return (
          (item.encrypt && !item.id) || // New file with encryption
          (item.encrypt && item.id && !item.oEncrypt) || // Uploaded file, encrypt now, but not encrypted before
          (item.template && item.encrypt) // Template file with encryption
        );
      });
      return encrypted;
    }

    // Return non-encrypted files
    const nonEncrypt = files.filter((i) => {
      const item = i as Record<string, unknown>;
      return (!item.encrypt && !item.id) || (!item.encrypt && item.template);
    });
    return nonEncrypt;
  }

  /**
   * Process files - separate encrypt and non-encrypt files
   * @param files - Array of files
   * @param type - "nonEnc" for non-encrypted, "enc" for encrypted
   * @returns Array of processed files or Map for encrypted files
   */
  static async processFile(
    files: Array<File | Record<string, unknown>>,
    type: string
  ): Promise<
    Array<File | Record<string, unknown>> | Map<number, unknown> | boolean
  > {
    const nonEncrypt = files
      ? files.filter((i) => !(i as Record<string, unknown>).encrypt)
      : [];
    if (type === "nonEnc") {
      return nonEncrypt;
    }
    const encrypt = files
      ? files.filter((i) => (i as Record<string, unknown>).encrypt)
      : [];
    return EncryptionService.sendListFile(encrypt as File[]);
  }

  /**
   * Filter Map results by type (key or file)
   * @param map - Map object with encrypted file data
   * @param type - "key" for keys, "file" for files
   * @returns Array of keys or files
   */
  static filterByMap(
    map: Map<number, unknown> | boolean,
    type: string
  ): unknown[] {
    if (!map || typeof map === "boolean") {
      return [];
    }
    const keys: unknown[] = [];
    const files: unknown[] = [];

    if (map instanceof Map) {
      map.forEach((value: unknown) => {
        const valueArray = value as [unknown, unknown];
        keys.push(valueArray[1]); // Key is at index 1
        files.push(valueArray[0]); // File is at index 0
      });
    }

    if (type === "key") {
      return keys;
    }
    if (type === "file") {
      return files;
    }
    return [];
  }

  /**
   * Share permission for document out files (matching Angular doSharePermissionDocOutFile)
   * @param data - SharedFileData with all required information
   * @param isCheckManager - Flag to check manager permissions
   * @returns Promise<boolean> - Success or failure
   */
  static async doSharePermissionDocOutFile(
    data: SharedFileData,
    isCheckManager = false
  ): Promise<boolean> {
    const ENCRYPTION_TWD = Constant.ENCRYPTION_TWD; // Assuming encryption is enabled

    if (!ENCRYPTION_TWD) {
      return true;
    }

    // Get encrypted document files
    const encDocFileNames = await CommonService.getAttachsByTypeAndObjId(
      data.attType || "",
      data.objId
    );

    if (!encDocFileNames || encDocFileNames.length === 0) {
      return true;
    }

    // Get user certifications
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userCerts: any[] = await CommonService.certByUserId(
      (data.userIds as never[]) || [],
      (data.orgIds as never[]) || [],
      data.attType || "",
      isCheckManager
    );

    // Check if certifications are valid
    const error = await CommonService.checkCert(userCerts);
    if (error == null || error !== "") {
      const errorMsg = error == null ? "Cá nhân/ tổ chức được chọn" : error;
      ToastUtils.chuaDuocXacThucDeChiaSeTepMaHoa(errorMsg);
      return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userIdShared = userCerts.map((i: any) => i.id);

    // Transfer encrypted files to users
    if (encDocFileNames) {
      const rs = await EncryptionService.doTransferExecute(
        encDocFileNames as string[],
        userIdShared as number[]
      );
      if (rs === false) {
        ToastUtils.error("Chia sẻ tệp mã hóa thất bại");
        return false;
      }
    }

    return true;
  }

  /**
   * Share permission for document files (matching Angular doSharePermissionDocFile)
   * @param data - SharedFileData with all required information
   * @param isRollback - Flag to enable rollback on error
   * @param isCheckClerial - Flag to check clerical permissions
   * @returns Promise<boolean> - Success or failure
   */
  static async doSharePermissionDocFile(
    data: SharedFileData,
    isRollback = true,
    isCheckClerial = false
  ): Promise<boolean> {
    const ENCRYPTION_TWD = true; // Assuming encryption is enabled

    // Get encrypted document files (if not onlyShareFileObjec)
    const encDocFileNames = data.onlyShareFileObjec
      ? []
      : await CommonService.getAttachsByTypeAndObjId(
          data.attType || "",
          data.objId
        );

    const encryptFile = data.files
      ? data.files.filter(
          (i) => (i as unknown as Record<string, unknown>).encrypt
        )
      : [];

    if (
      !ENCRYPTION_TWD ||
      ((!data.checkObjEnc ||
        !encDocFileNames ||
        encDocFileNames.length === 0) &&
        (!encryptFile || encryptFile.length === 0) &&
        !data.onlyShareFileObjec)
    ) {
      return true;
    }

    // Step 1: Get certification of chosen user list
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userCerts: any[] =
      data.userOrobj === "user" || !data.userOrobj
        ? await CommonService.certByUserId(
            (data.userIds as never[]) || [],
            (data.orgIds as never[]) || [],
            data.objType || data.attType || ""
          )
        : isCheckClerial
          ? await CommonService.getCertClerialByObjId(
              data.objId,
              data.objType || data.attType || ""
            )
          : await CommonService.getCertByObjId(
              data.objId,
              data.objType || data.attType || ""
            );

    const error = await CommonService.checkCert(userCerts);
    if (error == null || error !== "") {
      const errorMsg = error == null ? "Cá nhân, tổ chức được chọn" : error;
      ToastUtils.chuaDuocXacThucDeChiaSeTepMaHoa(errorMsg);
      return false;
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data.userIdShared = userCerts.map((i: any) => i.id);

    // Step 2: Process files - encrypt and non-encrypt
    const nonEncFiles = await this.processFile(data.files || [], "nonEnc");
    const rsMap = await this.processFile(data.files || [], "enc");
    if (rsMap === false) {
      return false;
    }

    // Type guard to ensure rsMap is a Map
    if (!(rsMap instanceof Map)) {
      return false;
    }

    const encFiles = this.filterByMap(rsMap, "file");
    const keys = this.filterByMap(rsMap, "key");

    // Type guard to ensure nonEncFiles is an array
    if (!Array.isArray(nonEncFiles) || !encFiles || !keys) {
      return false;
    }

    // Step 3: Save comment with attachments
    const endDateStr =
      data.endDate instanceof Date
        ? data.endDate.toISOString()
        : data.endDate || "";

    const rsObj = await CommonService.saveCommentByType(
      data.objId,
      data.hash || "",
      data.comment || "",
      endDateStr,
      nonEncFiles as File[],
      encFiles as File[],
      data.cmtType || "",
      keys as string[],
      data.cmtContent || ""
    );

    let fileNameShared: string[] = [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (rsObj && (rsObj as any)["data"]) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { encFileNames, nonEncFileNames, cmtId } = (rsObj as any)["data"];

      if (encFileNames) {
        data.allFileNames = (data.allFileNames || []).concat(encFileNames);
        fileNameShared = fileNameShared.concat(encFileNames);
      }
      if (nonEncFileNames) {
        data.allFileNames = (data.allFileNames || []).concat(nonEncFileNames);
      }
      if (encDocFileNames && data.onlyShareFileObjec === false) {
        fileNameShared = fileNameShared.concat(encDocFileNames);
      }

      data.cmtIdSaved = cmtId;

      // Step 4: Transfer encrypted files
      const rs = await EncryptionService.doTransferExecute(
        fileNameShared as [],
        data.userIdShared as []
      );

      if (rs === undefined) {
        if (isRollback) {
          await this.rollback(
            data.allFileNames || [],
            data.userIdShared.map((id) => parseInt(id, 10)),
            data.cmtType || "",
            data.cmtIdSaved
          );
        }
        return true;
      }

      if (rs === false) {
        await this.rollback(
          data.allFileNames || [],
          data.userIdShared.map((id) => parseInt(id, 10)),
          data.cmtType || "",
          data.cmtIdSaved
        );
        return false;
      }
    } else {
      await this.rollback(
        data.allFileNames || [],
        data.userIdShared.map((id) => parseInt(id, 10)),
        data.cmtType || "",
        data.cmtIdSaved
      );
      return false;
    }

    // Clean data
    data.comment = "";
    data.cmtContent = "";
    data.files = [];

    return true;
  }

  /**
   * Rollback - delete comment and files on error
   * @param allFileNames - Array of file names to delete
   * @param userIdShared - Array of user IDs to delete
   * @param cmtType - Comment type
   * @param cmtIdSaved - Comment ID to delete
   */
  static async rollback(
    allFileNames: string[],
    userIdShared: number[],
    cmtType: string,
    cmtIdSaved: number | null = null
  ): Promise<void> {
    const ENCRYPTION_TWD = true; // Assuming encryption is enabled
    if (ENCRYPTION_TWD) {
      // Delete comment by type (will be implemented in common.service)
      // await CommonService.delCommentByType(allFileNames, userIdShared, cmtType, cmtIdSaved);
    }
  }
}
