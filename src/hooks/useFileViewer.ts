"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "@/hooks/use-toast";
import { FileService } from "@/services/file.service";
import { handleError } from "@/utils/common.utils";
import { ToastUtils } from "@/utils/toast.utils";

const Constant = {
  ATTACHMENT_DOWNLOAD_TYPE: {
    DOCUMENT_INTERNAL: "DOCUMENT_INTERNAL",
    DOCUMENT_VEHICLE: "DOCUMENT_VEHICLE",
  },
  PDF_OPEN_IN_NEW_TAB: true,
};

export function useFileViewer() {
  const [pdfData, setPdfData] = useState<Blob | null>(null);

  type ViewParams = {
    typeDownload: string;
    idOrName: string;
    isViewPopup: boolean;
  } | null;

  type DownloadParams = {
    fileName: string;
    fileType: string;
    attachId: string | null;
    typeDownload: string;
  } | null;

  const [viewParams, setViewParams] = useState<ViewParams>(null);
  const [downloadParams, setDownloadParams] = useState<DownloadParams>(null);

  const getExtension = (fileName: string) =>
    fileName ? fileName.split(".").pop()?.toLowerCase() : "";

  const saveFile = (fileName: string, data: Blob) => {
    if (fileName) {
      fileName = fileName.replace(/__\d+$/, "");
    }

    const blob = new Blob([data], {
      type: data.type || "application/octet-stream",
    });

    if ((window.navigator as any).msSaveOrOpenBlob) {
      (window.navigator as any).msSaveOrOpenBlob(blob, fileName);
    } else {
      const objectUrl = URL.createObjectURL(blob);
      const downloadLink = document.createElement("a");
      downloadLink.href = objectUrl;
      downloadLink.download = fileName;
      downloadLink.click();
      URL.revokeObjectURL(objectUrl);
    }
  };

  const openPdf = (fileData: Blob, isViewPopup: boolean = true) => {
    if (Constant.PDF_OPEN_IN_NEW_TAB) {
      const fileURL = URL.createObjectURL(fileData);
      window.open(fileURL, "_blank");
    } else {
      setPdfData(fileData);
      if (!isViewPopup) {
        setPdfData(null);
      }
    }
  };

  const viewQuery = useQuery<Blob>({
    queryKey: ["file-view", viewParams],
    queryFn: async () => {
      const res = await FileService.getFileToView(
        viewParams!.typeDownload,
        viewParams!.idOrName
      );
      return res;
    },
    enabled: !!viewParams,
    retry: 0,
  });

  useEffect(() => {
    if (viewQuery.data && viewParams) {
      openPdf(viewQuery.data, viewParams.isViewPopup);
      setViewParams(null);
    }
  }, [viewQuery.data]);

  useEffect(() => {
    if (viewQuery.error && viewParams) {
      const err: any = viewQuery.error as any;
      handleError(err);
      setViewParams(null);
    }
  }, [viewQuery.error]);

  const downloadQuery = useQuery<any>({
    queryKey: ["file-download", downloadParams],
    queryFn: async () => {
      const p = downloadParams!;
      const url = `${p.typeDownload}${p.fileName}`;
      if (p.fileType) {
        return await FileService.getValidatedFile(url, p.fileName, p.attachId);
      }
      return await FileService.getFile(p.fileName, p.typeDownload);
    },
    enabled: !!downloadParams,
    retry: 0,
  });

  useEffect(() => {
    if (downloadQuery.data && downloadParams) {
      const p = downloadParams;
      try {
        const data = downloadQuery.data as any;
        const blobCandidate = data && data.data ? data.data : data;
        saveFile(p.fileName, blobCandidate);
      } finally {
        setDownloadParams(null);
      }
    }
  }, [downloadQuery.data]);

  useEffect(() => {
    if (downloadQuery.error && downloadParams) {
      const err: any = downloadQuery.error as any;
      handleError(err);
      setDownloadParams(null);
    }
  }, [downloadQuery.error]);

  const openDoc = (
    file: any,
    type: string,
    fileData: any,
    typeDownload: string = ""
  ) => {
    downloadFile(file.name, type, file.encrypt, null, null, typeDownload);
  };

  const downloadFile = async (
    fileName: string,
    fileType: string = "",
    decrypt: boolean = false,
    attachId: string | null = null,
    cert: any = null,
    typeDownload: string = ""
  ) => {
    const url = `${typeDownload}${fileName}`;

    if (decrypt) {
      try {
        await doDecrypt(fileName, url, false, attachId, cert, true);
      } catch (err: any) {
        handleError(err);
      }
    } else {
      setDownloadParams({
        fileName,
        fileType,
        attachId,
        typeDownload,
      });
    }
  };

  const viewFile = async (
    file: any,
    type: string,
    isViewPopup: boolean = true,
    typeDownload: string = ""
  ) => {
    const extension = getExtension(file.name);
    if (extension === "pdf") {
      await viewPdfFile(file, type, isViewPopup, typeDownload);
    } else {
      viewDocFile(file, type, typeDownload);
    }
  };

  const viewPdfFile = async (
    file: any,
    type: string,
    isViewPopup: boolean = true,
    typeDownload: string = ""
  ) => {
    if (file && !file.id && !file.encrypt) {
      const reader = new FileReader();
      reader.onloadend = (e: any) => {
        const buffer = e.target.result as ArrayBuffer;
        const blob = new Blob([buffer], { type: "application/pdf" });
        openPdf(blob, isViewPopup);
      };
      reader.readAsArrayBuffer(file);
    } else if (
      (type === Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_INTERNAL ||
        type === Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_VEHICLE) &&
      !file.encrypt
    ) {
      setViewParams({
        typeDownload,
        idOrName: file.id,
        isViewPopup,
      });
    } else if (file.encrypt) {
      const url = `${typeDownload}${file.name}`;
      try {
        await doDecrypt(
          type !== Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_INTERNAL
            ? file.name
            : file.id,
          url,
          true,
          null
        );
      } catch (err: any) {
        ToastUtils.error("Giải mã tệp thất bại");
      }
    } else {
      setViewParams({
        typeDownload,
        idOrName: file.name,
        isViewPopup,
      });
    }
  };

  const viewDocFile = (file: any, type: string, typeDownload: string = "") => {
    const extension = getExtension(file.name);
    if (!extension) return;

    if (file && !file.id && !file.encrypt) {
      const reader = new FileReader();
      reader.onload = (event: any) => {
        const fileData = event.target.result;
        openDoc(file, type, fileData, typeDownload);
      };
      reader.readAsDataURL(file as Blob);
    } else if (file.encrypt) {
      const url = `${typeDownload}${file.name}`;
      doDecrypt(
        type !== Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_INTERNAL
          ? file.name
          : file.id,
        url,
        true,
        null
      ).catch((err: any) => {
        ToastUtils.error("Giải mã tệp thất bại");
      });
    } else {
      openDoc(file, type, null, typeDownload);
    }
  };

  const doDecrypt = async (
    fileName: string,
    url: string,
    view: boolean,
    attachId?: string | null,
    cert?: any,
    download?: boolean
  ) => {
    console.log("decrypt placeholder", {
      fileName,
      url,
      view,
      attachId,
      cert,
      download,
    });
    // TODO: implement decrypt logic
  };

  return {
    viewFile,
    viewPdfFile,
    viewDocFile,
    openPdf,
    openDoc,
    downloadFile,
    saveFile,
    isViewing: viewQuery.isFetching,
    isDownloading: downloadQuery.isFetching,
    pdfData,
    setPdfData,
  };
}
