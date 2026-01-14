import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { PdfSignType } from "@/definitions/enums/common.enum";
import { Loader2, PenTool, Save } from "lucide-react";
import { useState } from "react";
import {
  useSignAppendix,
  useSignCA,
  useSignComment,
  useSignCopy,
  useSignIssued,
} from "@/hooks/data/sign.data";

type DigitalSignProps = {
  fileId: number;
  fileName: string;
  skips?: PdfSignType[];
  docNumber?: string;
  attachmentType: string;
  callback?: (event: any) => void;
  onSignComplete?: () => void;
};

const signatureOptionDf = [
  { value: PdfSignType.CA, label: "Ký CA" },
  { value: PdfSignType.COMMENT, label: "Ký comment" },
  { value: PdfSignType.COPY, label: "Ký bản sao" },
  { value: PdfSignType.ISSUED, label: "Ký ban hành" },
  { value: PdfSignType.APPENDIX, label: "Ký phụ lục" },
];

export default function DigitalSign({
  fileId,
  fileName,
  skips = [],
  docNumber,
  attachmentType,
  callback,
}: DigitalSignProps) {
  const [signType, setSignType] = useState<string>(PdfSignType.CA.toString());
  const signatureOptions = signatureOptionDf.filter(
    (opt) => !skips.includes(opt.value)
  );
  const [signingFiles, setSigningFiles] = useState<Set<number>>(new Set());
  const [showSignConfirm, setShowSignConfirm] = useState(false);
  const { mutate: signCA } = useSignCA();
  const { mutate: signComment } = useSignComment();
  const { mutate: signCopy } = useSignCopy();
  const { mutate: signIssued } = useSignIssued();
  const { mutate: signAppendix } = useSignAppendix();

  const handleSign = async (
    file: { id: number; name: string },
    signatureType: string
  ) => {
    setSigningFiles((prev) => new Set(prev).add(file.id));

    const commonParams = {
      fileNameOrId: file.name,
      attachId: file.id,
      attachType: attachmentType,
    };

    const onSuccess = () => {
      setShowSignConfirm(true);
      setSigningFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(file.id);
        return newSet;
      });
      console.log("calling callback");
      callback?.(file);
    };

    const onError = (error: any) => {
      console.error("Error signing document:", error);
      setSigningFiles((prev) => {
        const newSet = new Set(prev);
        newSet.delete(file.id);
        return newSet;
      });
    };

    try {
      if (signatureType === PdfSignType.CA.toString()) {
        signCA(commonParams, { onSuccess, onError });
      } else if (signatureType === PdfSignType.COMMENT.toString()) {
        signComment(commonParams, { onSuccess, onError });
      } else if (signatureType === PdfSignType.COPY.toString()) {
        signCopy(commonParams, { onSuccess, onError });
      } else if (signatureType === PdfSignType.ISSUED.toString()) {
        signIssued({ ...commonParams, docNumber }, { onSuccess, onError });
      } else if (signatureType === PdfSignType.APPENDIX.toString()) {
        signAppendix({ ...commonParams, docNumber }, { onSuccess, onError });
      }
    } catch (error) {
      console.error("Error signing document:", error);
      onError(error);
    }
  };

  return (
    <>
      <div className="flex items-center gap-1">
        <Select value={signType.toString()} onValueChange={setSignType}>
          <SelectTrigger className="w-24 h-6 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {signatureOptions?.map(
              (opt: { value: PdfSignType; label: string }) => (
                <SelectItem key={opt.value} value={opt.value.toString()}>
                  {opt.label}
                </SelectItem>
              )
            )}
          </SelectContent>
        </Select>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="sm"
                className="h-6 px-1.5 text-xs bg-blue-600 hover:bg-blue-700 flex items-center gap-1 disabled:opacity-50"
                disabled={signingFiles.has(fileId)}
                onClick={() =>
                  handleSign({ id: fileId, name: fileName }, signType)
                }
              >
                {signingFiles.has(fileId) ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <PenTool className="w-4 h-4" />
                    Ký số
                  </>
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ký số điện tử</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* popup ký số */}
      <Dialog open={showSignConfirm} onOpenChange={setShowSignConfirm}>
        <DialogContent className="max-w-md p-0">
          <DialogHeader className="p-4 border-b border-gray-200">
            <DialogTitle className="text-lg font-semibold text-gray-900">
              Hãy xác nhận
            </DialogTitle>
          </DialogHeader>

          <div className="p-4"></div>

          <DialogFooter className="p-4 border-t border-gray-200">
            <button
              onClick={() => {
                setShowSignConfirm(false);
              }}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black transition-colors flex items-center gap-2"
            >
              <Save size={16} className="text-black" />
              Đồng ý
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
