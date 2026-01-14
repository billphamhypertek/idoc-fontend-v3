import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DigitalSign from "@/components/common/DigitalSign";
import { Table } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChevronUp, Download, Eye, Loader2, PenTool } from "lucide-react";
import { Constant } from "@/definitions/constants/constant";
interface VehicleRequestFile {
  thaoTac: {
    download: boolean;
    view: boolean;
    signature: string;
  };
  active: boolean;
  attachmentType: string | null;
  clientId: number;
  cmtId: number | null;
  createBy: number;
  createDate: number;
  displayName: string;
  encrypt: boolean;
  id: number;
  isChanged: boolean | null;
  name: string;
  size: number;
  type: string;
  usagePlanId: number;
  userId: number | null;
}

export default function AttachedFiles({
  vehicleRequestFiles,
  selectedSignatureTypes,
  setSelectedSignatureTypes,
  handleViewFile,
  handleDownloadFile,
  selectedFileId,
  setSelectedFileId,
  docNumber,
}: {
  vehicleRequestFiles: any[];
  selectedSignatureTypes: Record<number, string>;
  setSelectedSignatureTypes: (types: Record<number, string>) => void;
  handleViewFile: (file: VehicleRequestFile) => void;
  handleDownloadFile: (fileId: number) => void;
  selectedFileId: number | null;
  setSelectedFileId: (fileId: number | null) => void;
  docNumber: string;
}) {
  const fileColumns = [
    {
      header: "STT",
      accessor: (_: VehicleRequestFile, index: number) => index + 1,
      className: "text-center w-16",
    },
    {
      header: "Tên file",
      accessor: (file: VehicleRequestFile) => (
        <span
          className={`text-blue-600 font-medium cursor-pointer ${
            selectedFileId === file.id ? "underline" : ""
          }`}
          onClick={() => setSelectedFileId(file?.id)}
        >
          {file.displayName}
          {file.encrypt && (
            <span className="text-red-500 ml-2">(Đã mã hóa)</span>
          )}
        </span>
      ),
    },
    {
      header: "Thao tác",
      accessor: (file: VehicleRequestFile) => (
        <div className="flex items-center justify-center gap-1.5">
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
                    <Download className="w-3.5 h-3.5 text-gray-600" />
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
                    onClick={() => handleViewFile(file)}
                  >
                    <Eye className="w-3.5 h-3.5 text-gray-600" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Xem tệp đính kèm</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {!file.encrypt && (
            <DigitalSign
              fileId={file.id}
              fileName={file.displayName}
              docNumber={docNumber}
              attachmentType={
                Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_VEHICLE
              }
            />
          )}
        </div>
      ),
      className: "text-center w-40",
    },
  ];
  return (
    <Card className="shadow-sm border-gray-200">
      <CardHeader className="p-3 pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base text-blue-600 flex items-center gap-2">
            <ChevronUp className="w-4 h-4" />
            Phiếu xin xe
          </CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-hidden">
          <Table
            sortable={true}
            columns={fileColumns}
            dataSource={vehicleRequestFiles ?? []}
            showPagination={false}
            onRowClick={(item: any) => setSelectedFileId(item.id)}
          />
        </div>
      </CardContent>
    </Card>
  );
}
