import { useState } from "react";

export type PdfSource = {
  displayName: string;
  encrypt: boolean;
  index: number;
  isPdf: boolean;
  name: string;
  id: number | string;
  pdfSrc?: Blob;
};

export function usePdfViewer(onOpenFile?: (pdfSource: PdfSource) => void) {
  const [pdfSources, setPdfSources] = useState<PdfSource[]>([]);
  const [selectedPdfIndex, setSelectedPdfIndex] = useState<number | null>(null);
  const [firstPdfIndex, setFirstPdfIndex] = useState<number | null>(null);

  const openFilePdfEncrypt = (
    file: Blob,
    fileIndex = -1,
    listFiles: any[] = []
  ) => {
    if (!file || fileIndex === -1 || listFiles.length === 0) return;

    const newPdfSources: PdfSource[] = listFiles.map((f, i) => ({
      displayName: f.displayName,
      encrypt: f.encrypt,
      index: i,
      isPdf: f.encrypt && f.name?.toLowerCase().includes("pdf"),
      name: f.name,
      id: f.id,
    }));

    // convert blob thành file pdf
    const fileConvert = new Blob([file], { type: "application/pdf" });
    newPdfSources[fileIndex].pdfSrc = fileConvert;

    setPdfSources(newPdfSources);

    // gọi callback (thay cho this.openFileEvent.emit)
    const pdfSource = newPdfSources[fileIndex];
    if (onOpenFile) onOpenFile(pdfSource);

    // set state hiển thị file
    setSelectedPdfIndex(fileIndex);
    setFirstPdfIndex(fileIndex);
  };

  return {
    pdfSources,
    selectedPdfIndex,
    firstPdfIndex,
    openFilePdfEncrypt,
    setSelectedPdfIndex,
  };
}
