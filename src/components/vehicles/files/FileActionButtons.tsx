import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Download, Eye, Loader2, PenTool } from "lucide-react";

interface FileActionButtonsProps {
  file: any;
  signingFiles: Set<number>;
  selectedSignatureTypes: Record<number, string>;
  setSelectedSignatureTypes: (types: Record<number, string>) => void;
  handleViewFile: (fileId: number) => void;
  handleDownloadFile: (fileId: number) => void;
  handleDigitalSign: (fileId: number, signatureType: string) => void;
}

export function FileActionButtons({
  file,
  signingFiles,
  selectedSignatureTypes,
  setSelectedSignatureTypes,
  handleViewFile,
  handleDownloadFile,
  handleDigitalSign,
}: FileActionButtonsProps) {
  return (
    <div className="flex items-center justify-center gap-2">
      {file.thaoTac.download && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-8 p-0 hover:bg-gray-100"
                onClick={() => handleDownloadFile(file.id)}
              >
                <Download className="w-4 h-4 text-gray-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Tải tệp đính kèm</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {file.thaoTac.view && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-9 w-8 p-0 hover:bg-gray-100"
                onClick={() => handleViewFile(file.id)}
              >
                <Eye className="w-4 h-4 text-gray-600" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Xem tệp đính kèm</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}

      {!file.encrypt && (
        <div className="flex items-center gap-1">
          <select
            defaultValue={file.thaoTac.signature}
            onChange={(e) => {
              setSelectedSignatureTypes({
                ...selectedSignatureTypes,
                [file.id]: e.target.value,
              });
            }}
            className="w-28 h-9 text-xs border border-gray-300 rounded px-2 py-1"
          >
            <option value="Ký CA">Ký CA</option>
            <option value="Ký comment">Ký comment</option>
            <option value="Ký bản sao">Ký bản sao</option>
            <option value="Ký ban hành">Ký ban hành</option>
          </select>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  size="sm"
                  className="h-9 px-2 text-xs bg-blue-600 hover:bg-blue-700 flex items-center gap-1 disabled:opacity-50"
                  disabled={signingFiles.has(file.id)}
                  onClick={() =>
                    handleDigitalSign(
                      file.id,
                      selectedSignatureTypes[file.id] || file.thaoTac.signature
                    )
                  }
                >
                  {signingFiles.has(file.id) ? (
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
      )}
    </div>
  );
}
