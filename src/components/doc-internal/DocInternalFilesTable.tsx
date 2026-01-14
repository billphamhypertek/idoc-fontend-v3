"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getExtension } from "@/utils/common.utils";
import { Eye, Download, Share2 } from "lucide-react";
import DigitalSign from "@/components/common/DigitalSign";
import { PdfSignType } from "@/definitions/enums/common.enum";
import { Constant } from "@/definitions/constants/constant";

interface DocInternalFilesTableProps {
  title: string;
  files: any[];
  canViewFile: (file: any) => boolean | undefined | void;
  onDownloadFile: (file: any) => void; // explicit download
  onOpenShare: (file: any) => void;
  onViewFile: (file: any) => void; // explicit view
  // Optional digital sign controls (render only if provided)
  showDigitalSign?: boolean;
  signingFiles?: Set<number>;
  selectedSignatureTypes?: Record<number, string>;
  setSelectedSignatureTypes?: (types: Record<number, string>) => void;
  digitalSignSkips?: PdfSignType[];
  docNumber?: string;
  onClickFile: (file: any, showPopup: boolean) => void;
}

export default function DocInternalFilesTable({
  title,
  files = [],
  canViewFile,
  onDownloadFile,
  onOpenShare,
  onViewFile,
  showDigitalSign = false,
  selectedSignatureTypes,
  setSelectedSignatureTypes,
  digitalSignSkips,
  docNumber,
  onClickFile,
}: DocInternalFilesTableProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-semibold text-blue-600">
            {title}
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead style={{ backgroundColor: "#E6F1FC" }}>
              <tr>
                <th className="border px-3 py-2 text-center w-16">STT</th>
                <th className="border px-3 py-2 text-center">Tên file</th>
                <th className="border px-3 py-2 text-center w-40">Hành động</th>
              </tr>
            </thead>
            <tbody>
              {files.map((file: any, idx: number) => {
                // Normalize encrypt flag (API can return encrypt or oEncrypt)
                const encrypted = Boolean(file?.encrypt || file?.oEncrypt);
                const normalizedFile = { ...file, encrypt: encrypted };
                const ext = getExtension(normalizedFile?.name)?.toLowerCase();
                const iconName =
                  ext === "pdf"
                    ? "PDF"
                    : ext === "doc" || ext === "docx"
                      ? "DOC"
                      : ext === "xls" || ext === "xlsx"
                        ? "Excel"
                        : "Image";
                const displayName =
                  normalizedFile?.displayName || normalizedFile?.name;
                const viewable = canViewFile(normalizedFile);

                return (
                  <tr
                    key={normalizedFile?.id ?? idx}
                    className="hover:bg-gray-50"
                  >
                    <td className="border px-3 py-2 text-center">{idx + 1}</td>
                    <td className="border px-3 py-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={`/assets/images/files/${iconName}.png`}
                          width={16}
                          height={16}
                          alt="file"
                          className="flex-shrink-0"
                        />
                        <span
                          className="text-blue-600 hover:underline cursor-pointer"
                          onClick={() =>
                            viewable
                              ? onClickFile(normalizedFile, false)
                              : onDownloadFile(normalizedFile)
                          }
                          title={displayName}
                        >
                          {displayName}
                        </span>
                      </div>
                    </td>
                    <td className="border px-3 py-2 text-center">
                      <div className="flex justify-center gap-2">
                        {normalizedFile?.encrypt && (
                          <button
                            onClick={() => onOpenShare(normalizedFile)}
                            className="text-blue-500 hover:text-blue-700"
                            title="Chia sẻ"
                            aria-label="Chia sẻ"
                          >
                            <Share2 className="w-4 h-4" />
                          </button>
                        )}

                        <button
                          onClick={() => onDownloadFile(normalizedFile)}
                          className="text-gray-600 hover:text-blue-600"
                          title="Tải xuống"
                          aria-label="Tải xuống"
                        >
                          <Download className="w-4 h-4" />
                        </button>

                        {viewable && (
                          <button
                            onClick={() => onViewFile(normalizedFile)}
                            className="text-gray-600 hover:text-blue-600"
                            title="Xem"
                            aria-label="Xem"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        )}

                        {/* Digital sign (optional) */}
                        {!encrypted && showDigitalSign && (
                          <DigitalSign
                            fileId={normalizedFile.id}
                            fileName={normalizedFile.name}
                            skips={digitalSignSkips}
                            docNumber={docNumber}
                            attachmentType={
                              Constant.ATTACHMENT_DOWNLOAD_TYPE
                                .DOCUMENT_INTERNAL
                            }
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
