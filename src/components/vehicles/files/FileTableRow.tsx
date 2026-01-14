import { TableCell, TableRow } from "@/components/ui/table";
import { FileActionButtons } from "./FileActionButtons";

interface FileTableRowProps {
  file: any;
  selectedFileId: number | null;
  signingFiles: Set<number>;
  selectedSignatureTypes: Record<number, string>;
  setSelectedSignatureTypes: (types: Record<number, string>) => void;
  handleViewFile: (fileId: number) => void;
  handleDownloadFile: (fileId: number) => void;
  handleDigitalSign: (fileId: number, signatureType: string) => void;
}

export function FileTableRow({
  file,
  selectedFileId,
  signingFiles,
  selectedSignatureTypes,
  setSelectedSignatureTypes,
  handleViewFile,
  handleDownloadFile,
  handleDigitalSign,
}: FileTableRowProps) {
  return (
    <TableRow key={file.id} className="hover:bg-gray-50">
      <TableCell className="text-center">{file.stt}</TableCell>
      <TableCell>
        <span
          className={`text-blue-600 font-medium cursor-pointer ${selectedFileId === file.id ? "underline" : ""}`}
          onClick={() => handleViewFile(file.id)}
        >
          {file.displayName}
        </span>
        {file.encrypt && <span className="text-red-500 ml-2">(Đã mã hóa)</span>}
      </TableCell>
      <TableCell>
        <FileActionButtons
          file={file}
          signingFiles={signingFiles}
          selectedSignatureTypes={selectedSignatureTypes}
          setSelectedSignatureTypes={setSelectedSignatureTypes}
          handleViewFile={handleViewFile}
          handleDownloadFile={handleDownloadFile}
          handleDigitalSign={handleDigitalSign}
        />
      </TableCell>
    </TableRow>
  );
}
