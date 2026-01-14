/* eslint-disable @typescript-eslint/no-explicit-any */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getToken } from "~/utils/authentication.utils";
import { Constant } from "@/definitions/constants/constant";

export type AttachType =
  | "DOCUMENT_IN"
  | "DOCUMENT_OUT"
  | "DOCUMENT_OUT_COMMENT"
  | "DELEGATE"
  | "WORD_EDITOR"
  | "TASK"
  | "TEMPLATE"
  | "CALENDAR"
  | "DOCUMENT_INTERNAL"
  | "REPORT"
  | "DOCUMENT_VEHICLE"
  | "DOCUMENT_VEHICLE_COMMENT";

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
    case Constant.ATTACHMENT_DOWNLOAD_TYPE.TASK:
      return "/taskAtt/download/";
    case Constant.ATTACHMENT_DOWNLOAD_TYPE.TASK_2:
      return "/taskAtt2/download/";
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

function getUploadEditFileUrl(fileType: string): string {
  switch (fileType) {
    case Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_IN:
      return "/doc_out_attach/update-sign-file/pdf/";
    case Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_OUT:
      return "/attachment/updateFile/";
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
    // case Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_INTERNAL:
    //   return '/doc_internal/download/';
    case Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_INTERNAL:
      return "/doc_internal/update-sign-file/";
    case Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_VEHICLE:
      return "/vehicle-usage-plan/attachment/update-sign-file/";
    case Constant.ATTACHMENT_DOWNLOAD_TYPE.DYNAMIC_FORM:
      return "/attachment-dynamic/updateAttachment/";
    default:
      return "/files/";
  }
}

type SignCallbacks = {
  onSuccess?: (payload?: any) => void;
  onError?: (error?: any) => void;
  onFinally?: () => void;
};

declare global {
  // vgcaplugin declares global functions
  interface Window {
    vgca_comment?: (jsonParams: string, cb: (data: string) => void) => void;
    vgca_sign_approved?: (
      jsonParams: string,
      cb: (data: string) => void
    ) => void;
    vgca_sign_copy?: (jsonParams: string, cb: (data: string) => void) => void;
    vgca_sign_issued?: (jsonParams: string, cb: (data: string) => void) => void;
    vgca_sign_appendix?: (
      jsonParams: string,
      cb: (data: string) => void
    ) => void;
    vgca_sign_json?: (
      sender: any,
      jsonParams: string,
      onMessage: (ev: any, data: string) => void,
      onError: (err: any) => void
    ) => void;
  }
}

export function useVgcaSign() {
  const baseUrl = useMemo(() => process.env.NEXT_PUBLIC_API_HOST || "", []);
  const wsRef = useRef<WebSocket | null>(null);

  const makeMetaData = useCallback(() => {
    const token = getToken();
    return token ? [{ Key: "token", Value: token }] : [];
  }, []);

  const buildDownloadUrl = useCallback(
    (fileType: string, fileNameOrId: string | number, tokenParam = true) => {
      const token = getToken();
      const base = `${baseUrl}${getDownloadFileUrl(fileType)}${encodeURIComponent(
        String(fileNameOrId)
      )}`;
      return tokenParam && token
        ? `${base}?token=${token}&hasConvertToPdf=true`
        : base;
    },
    [baseUrl]
  );

  const buildUploadUrl = useCallback(
    (fileType: string, attachId: number | string) =>
      `${baseUrl}${getUploadEditFileUrl(fileType)}${attachId}`,
    [baseUrl]
  );

  const parseCallbackResult = (data: string) => {
    try {
      return JSON.parse(data);
    } catch {
      return data;
    }
  };

  const withLifecycle = async (
    runner: () => Promise<void>,
    callbacks?: SignCallbacks
  ) => {
    try {
      await runner();
      callbacks?.onSuccess?.();
    } catch (err) {
      callbacks?.onError?.(err);
      throw err;
    } finally {
      callbacks?.onFinally?.();
    }
  };

  const signApproved = useCallback(
    async (
      fileNameOrId: string | number,
      attachId: number | string,
      attachType: string,
      callbacks?: SignCallbacks
    ) => {
      await withLifecycle(async () => {
        if (typeof window.vgca_sign_approved !== "function") {
          throw new Error("VGCA plugin chưa sẵn sàng");
        }

        const prms: Record<string, any> = {};
        prms.FileUploadHandler = buildUploadUrl(attachType, attachId);
        prms.SessionId = "";
        prms.FileName = buildDownloadUrl(attachType, fileNameOrId);
        prms.MetaData = makeMetaData();
        const jsonPrms = JSON.stringify(prms);
        console.log(jsonPrms);
        await new Promise<void>((resolve, reject) => {
          window.vgca_sign_approved!(jsonPrms, (data: string) => {
            const res = parseCallbackResult(data);
            if (res?.Status === 0 || res === "0") resolve();
            else reject(res);
          });
        });
      }, callbacks);
    },
    [buildDownloadUrl, buildUploadUrl, makeMetaData]
  );

  const signCopy = useCallback(
    async (
      fileNameOrId: string | number,
      attachId: number | string,
      attachType: string,
      callbacks?: SignCallbacks
    ) => {
      await withLifecycle(async () => {
        if (typeof window.vgca_sign_copy !== "function") {
          throw new Error("VGCA plugin chưa sẵn sàng");
        }
        const prms: Record<string, any> = {};
        prms.FileUploadHandler = buildUploadUrl(attachType, attachId);
        prms.SessionId = "";
        prms.FileName = buildDownloadUrl(attachType, fileNameOrId);
        prms.MetaData = makeMetaData();
        const jsonPrms = JSON.stringify(prms);

        await new Promise<void>((resolve, reject) => {
          window.vgca_sign_copy!(jsonPrms, (data: string) => {
            const res = parseCallbackResult(data);
            if (res?.Status === 0 || res === "0") resolve();
            else reject(res);
          });
        });
      }, callbacks);
    },
    [buildDownloadUrl, buildUploadUrl, makeMetaData]
  );

  const signIssued = useCallback(
    async (
      fileNameOrId: string | number,
      attachId: number | string,
      attachType: string,
      docNumber?: string,
      callbacks?: SignCallbacks
    ) => {
      await withLifecycle(async () => {
        if (typeof window.vgca_sign_issued !== "function") {
          throw new Error("VGCA plugin chưa sẵn sàng");
        }
        const prms: Record<string, any> = {};
        prms.FileUploadHandler = buildUploadUrl(attachType, attachId);
        prms.SessionId = "";
        prms.FileName = buildDownloadUrl(attachType, fileNameOrId);
        prms.MetaData = makeMetaData();
        prms.IssuedDate = new Date();
        if (docNumber) prms.DocNumber = docNumber;
        const jsonPrms = JSON.stringify(prms);

        await new Promise<void>((resolve, reject) => {
          window.vgca_sign_issued!(jsonPrms, (data: string) => {
            const res = parseCallbackResult(data);
            if (res?.Status === 0 || res === "0") resolve();
            else reject(res);
          });
        });
      }, callbacks);
    },
    [buildDownloadUrl, buildUploadUrl, makeMetaData]
  );
  const signAppendix = useCallback(
    async (
      fileNameOrId: string | number,
      attachId: number | string,
      attachType: string,
      docNumber?: string,
      callbacks?: SignCallbacks
    ) => {
      await withLifecycle(async () => {
        if (typeof window.vgca_sign_appendix !== "function") {
          throw new Error("VGCA plugin chưa sẵn sàng");
        }
        const prms: Record<string, any> = {};
        prms.FileUploadHandler = buildUploadUrl(attachType, attachId);
        prms.SessionId = "";
        prms.FileName = buildDownloadUrl(attachType, fileNameOrId);
        prms.MetaData = makeMetaData();
        // prms.IssuedDate = new Date();
        prms.DocNumber = docNumber ?? " ";
        const jsonPrms = JSON.stringify(prms);

        await new Promise<void>((resolve, reject) => {
          window.vgca_sign_appendix!(jsonPrms, (data: string) => {
            const res = parseCallbackResult(data);
            if (res?.Status === 0 || res === "0") resolve();
            else reject(res);
          });
        });
      }, callbacks);
    },
    [buildDownloadUrl, buildUploadUrl, makeMetaData]
  );

  const signComment = useCallback(
    async (
      fileNameOrId: string | number,
      attachId: number | string,
      attachType: string,
      callbacks?: SignCallbacks
    ) => {
      await withLifecycle(async () => {
        if (typeof window.vgca_comment !== "function") {
          throw new Error("VGCA plugin chưa sẵn sàng");
        }
        const prms: Record<string, any> = {};
        prms.FileUploadHandler = buildUploadUrl(attachType, attachId);
        prms.SessionId = "";
        prms.FileName = buildDownloadUrl(attachType, fileNameOrId);
        prms.MetaData = makeMetaData();
        const jsonPrms = JSON.stringify(prms);

        await new Promise<void>((resolve, reject) => {
          window.vgca_comment!(jsonPrms, (data: string) => {
            const res = parseCallbackResult(data);
            if (res?.Status === 0 || res === "0") resolve();
            else reject(res);
          });
        });
      }, callbacks);
    },
    [buildDownloadUrl, buildUploadUrl, makeMetaData]
  );

  const signJson = useCallback(
    async (
      jsonMessage: any,
      callbacks?: {
        onSuccess?: (ev?: any, data?: any) => void;
        onError?: (err?: any) => void;
        onFinally?: () => void;
      }
    ) => {
      await withLifecycle(
        async () => {
          if (typeof window.vgca_sign_json !== "function") {
            throw new Error("VGCA plugin chưa sẵn sàng");
          }
          const prms = { JsonContent: jsonMessage } as any;
          const jsonPrms = JSON.stringify(prms);
          wsRef.current = new WebSocket("wss://127.0.0.1:8987/SignJson");
          wsRef.current.onerror = (err) => {
            wsRef.current = null;
            callbacks?.onError?.(err);
          };
          wsRef.current.onclose = () => {
            wsRef.current = null;
          };

          await new Promise<void>((resolve, reject) => {
            window.vgca_sign_json!(
              null,
              jsonPrms,
              (ev: any, data: any) => {
                callbacks?.onSuccess?.(ev, data);
                resolve();
              },
              (err: any) => {
                callbacks?.onError?.(err);
                reject(err);
              }
            );
          });
        },
        { onFinally: callbacks?.onFinally }
      );
    },
    []
  );

  const signPdfWithProfile = useCallback(
    async (
      digitalSign: {
        type?: string;
        userNameHSM?: string;
        passwordHSM?: string;
      },
      fileName: string,
      signType: string,
      attachId: number | string,
      attachType: string,
      position: string,
      callbacks?: SignCallbacks
    ) => {
      // Hook cung cấp building params giống Angular signPdf (nếu cần mở rộng)
      // Ở đây, phần ký PDF phức tạp qua native app không được public trong vgcaplugin.js
      // Ta có thể fallback sang signApproved như bước ký PDF chuẩn nếu phía server yêu cầu
      return signApproved(fileName, attachId, attachType, callbacks);
    },
    [signApproved]
  );

  return {
    signApproved,
    signCopy,
    signIssued,
    signComment,
    signJson,
    signPdfWithProfile,
    getDownloadFileUrl,
    getUploadEditFileUrl,
    signAppendix,
  };
}

export function useVgcaStatus() {
  const [isVgcaInstalled, setIsVgcaInstalled] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkVgca = () => {
      if (typeof window === "undefined") {
        setIsVgcaInstalled(false);
        return false;
      }

      const hasVgca =
        typeof (window as any).vgca_sign_json === "function" ||
        typeof (window as any).vgca_sign_approved === "function" ||
        typeof (window as any).vgca_comment === "function";

      setIsVgcaInstalled(hasVgca);
      return hasVgca;
    };

    const hasVgca = checkVgca();

    if (hasVgca) {
      setIsChecking(false);
      return;
    }

    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      const found = checkVgca();

      if (found || attempts >= 10) {
        clearInterval(interval);
        setIsChecking(false); //
      }
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return { isVgcaInstalled, isChecking };
}

export default useVgcaSign;
