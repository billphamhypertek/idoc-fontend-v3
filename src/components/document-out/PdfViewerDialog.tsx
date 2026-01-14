import React, { useEffect, useRef, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import dynamic from "next/dynamic";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

type Props = {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  name?: string;
  blob?: Blob;
};
const PDFViewerClient = dynamic(
  async () => {
    const { Worker, Viewer } = await import("@react-pdf-viewer/core");
    const { defaultLayoutPlugin } = await import(
      "@react-pdf-viewer/default-layout"
    );

    const PDFViewerClient = ({ fileUrl }: { fileUrl: string }) => {
      const pluginInstance = defaultLayoutPlugin();
      return (
        <Worker workerUrl={"/v3/pdf.worker.min.js"}>
          <Viewer fileUrl={fileUrl} plugins={[pluginInstance]} />
        </Worker>
      );
    };

    return PDFViewerClient;
  },
  { ssr: false }
);

const PdfViewerDialog: React.FC<Props> = ({
  isOpen,
  onOpenChange,
  name,
  blob,
}) => {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfLoading, setPdfLoading] = useState(true);
  const objectUrlRef = useRef<string | null>(null);

  useEffect(() => {
    fetchPdfData(blob);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [blob]);
  const fetchPdfData = async (file: any) => {
    if (!file) {
      setPdfLoading(false);
      return;
    }

    setPdfLoading(true);

    try {
      const blob = new Blob([file], { type: "application/pdf" });
      const nextUrl = URL.createObjectURL(blob);
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = nextUrl;
      setPdfUrl(nextUrl);
    } catch (err) {
      console.error("Error fetching PDF:", err);
    } finally {
      setPdfLoading(false);
    }
  };
  const loading = (
    <>
      <Spinner variant="ring" size={48} className="text-blue-600" />
      <p className="text-gray-600 text-sm">Đang tải PDF...</p>
    </>
  );
  const viewer = pdfUrl ? (
    <div style={{ height: "70vh" }}>
      <PDFViewerClient fileUrl={pdfUrl} />
    </div>
  ) : (
    <div style={{ height: "70vh" }}>
      <p className="text-gray-500 text-sm">Không có PDF để hiển thị</p>
    </div>
  );
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-base font-bold text-gray-900">
            Nội dung chi tiết file văn bản mật
          </DialogTitle>
        </DialogHeader>
        <DialogDescription className="text-base text-gray-700 py-1">
          Chi tiết tệp văn bản: {name}
        </DialogDescription>
        {pdfLoading ? loading : viewer}
        <DialogFooter className="flex gap-1 pt-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="px-4 h-9 text-sm inline-flex items-center justify-center"
          >
            <X className="w-4 h-4 mr-2" />
            Đóng
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PdfViewerDialog;
