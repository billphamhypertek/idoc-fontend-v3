// import { CommonService } from "@/services/common";
// import { EncryptionService } from "@/services/encryption";
// import { ToastrService } from "@/services/toastr";
//
// interface SharedFileData {
//   objId: string;
//   files?: any[];
//   onlyShareFileObject?: boolean;
//   attType: string;
//   userOrobj: string;
//   userIds: string[];
//   orgIds?: string[];
//   objType: string;
//   hash?: string;
//   comment: string;
//   endDate?: string;
//   cmtType: string;
//   cmtContent: string;
//   allFileNames: string[];
//   userIdShared?: string[];
//   cmtIdSaved?: string;
//   checkObjEnc?: boolean;
// }
//
// const CERT_OBJ_TYPE = {
//   user: "user",
//   // Add other types if needed
// };
//
// export const useSharePermissionDocFile = (
//   commonService: CommonService,
//   encryptionService: EncryptionService,
//   toastr: ToastrService,
//   ENCRYPTION_TWD: string,
// ) => {
//   const doSharePermissionDocFile = async (
//     data: SharedFileData,
//     isRollback: boolean = true,
//     isCheckClerial: boolean = false,
//   ): Promise<boolean> => {
//     // Step 1: Get encrypted document file names
//     const encDocFileNames = data.onlyShareFileObject
//       ? []
//       : await commonService.getAttachsByTypeAndObjId(data.attType, data.objId);
//     const encryptFile = data.files ? data.files.filter((i) => i.encrypt) : [];
//
//     if (
//       ENCRYPTION_TWD &&
//       ((data.checkObjEnc && encDocFileNames && encDocFileNames.length > 0) ||
//         (encryptFile && encryptFile.length > 0) ||
//         data.onlyShareFileObject)
//     ) {
//       // Step 1: Get certification of chosen user list
//       let userCerts;
//       if (data.userOrobj === CERT_OBJ_TYPE.user) {
//         userCerts = await commonService.certByUserId(
//           data.userIds,
//           data.orgIds,
//           data.objType,
//         );
//       } else if (isCheckClerial) {
//         userCerts = await commonService.getCertClerialByObjId(
//           data.objId,
//           data.objType,
//         );
//       } else {
//         userCerts = await commonService.getCertByObjId(
//           data.objId,
//           data.objType,
//         );
//       }
//
//       const error = commonService.checkCert(userCerts);
//       if (error) {
//         toastr.error(
//           `${error === null ? "Cá nhân, tổ chức được chọn" : error} chưa được xác thực để chia sẻ tệp mã hóa`,
//         );
//         return false;
//       }
//       data.userIdShared = userCerts.map((i: any) => i.id);
//
//       // Step 2: Process files
//       const nonEncFiles = await processFile(data.files || [], "nonEnc");
//       const rsMap = await processFile(data.files || [], "enc");
//       if (rsMap === false) {
//         return false;
//       }
//
//       const encFiles = filterByMap(rsMap, "file");
//       const keys = filterByMap(rsMap, "key");
//       if (!encFiles || !nonEncFiles || !keys) {
//         return false;
//       }
//
//       // Step 3: Save object data and all files
//       const rsObj = await commonService.saveCommentByType(
//         data.objId,
//         data.hash,
//         data.comment,
//         data.endDate,
//         nonEncFiles,
//         encFiles,
//         data.cmtType,
//         keys,
//         data.cmtContent,
//       );
//
//       let fileNameShared: string[] = [];
//       if (rsObj && rsObj["data"]) {
//         const { encFileNames, nonEncFileNames, cmtId } = rsObj["data"];
//         if (encFileNames) {
//           data.allFileNames = data.allFileNames.concat(encFileNames);
//           fileNameShared = fileNameShared.concat(encFileNames);
//         }
//         if (nonEncFileNames) {
//           data.allFileNames = data.allFileNames.concat(nonEncFileNames);
//         }
//         if (encDocFileNames && !data.onlyShareFileObject) {
//           fileNameShared = fileNameShared.concat(encDocFileNames);
//         }
//
//         data.cmtIdSaved = cmtId;
//
//         // Step 4: Transfer data
//         const rs = await encryptionService.doTransferExecute(
//           fileNameShared,
//           data.userIdShared || [],
//         );
//         if (rs === undefined) {
//           if (isRollback) {
//             await rollback(
//               data.allFileNames,
//               data.userIdShared || [],
//               data.cmtType,
//               data.cmtIdSaved,
//             );
//           }
//           return true;
//         }
//         if (rs === false) {
//           await rollback(
//             data.allFileNames,
//             data.userIdShared || [],
//             data.cmtType,
//             data.cmtIdSaved,
//           );
//           return false;
//         }
//       } else {
//         await rollback(
//           data.allFileNames,
//           data.userIdShared || [],
//           data.cmtType,
//           data.cmtIdSaved,
//         );
//         return false;
//       }
//
//       // Clean data to avoid saving together with transfer
//       data.comment = "";
//       data.cmtContent = "";
//       data.files = [];
//     }
//
//     return true;
//   };
//
//   // Placeholder for processFile (implement based on actual logic)
//   const processFile = async (
//     files: any[],
//     type: "enc" | "nonEnc",
//   ): Promise<any> => {
//     // Implement file processing logic here
//     // Return false on error or processed files/keys
//     return type === "enc" ? {} : files; // Placeholder
//   };
//
//   // Placeholder for filterByMap (implement based on actual logic)
//   const filterByMap = (map: any, key: "file" | "key"): any[] | null => {
//     // Implement filtering logic here
//     return null; // Placeholder
//   };
//
//   // Placeholder for rollback (implement based on actual logic)
//   const rollback = async (
//     allFileNames: string[],
//     userIdShared: string[],
//     cmtType: string,
//     cmtIdSaved?: string,
//   ): Promise<void> => {
//     // Implement rollback logic here
//     console.log(
//       "Rolling back:",
//       allFileNames,
//       userIdShared,
//       cmtType,
//       cmtIdSaved,
//     );
//   };
//
//   return { doSharePermissionDocFile };
// };
