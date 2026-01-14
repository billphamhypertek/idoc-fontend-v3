import { Loader2 } from "lucide-react";

interface LoadingDownloadVbProps {
  nameFile: string;
  isdownloadFile: boolean;
  isShowLoadingEncrypt: boolean;
}

export default function LoadingDownloadVb({
  nameFile,
  isdownloadFile,
  isShowLoadingEncrypt,
}: LoadingDownloadVbProps) {
  if (!isdownloadFile) return null;

  return (
    <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
      <Loader2 className="w-6 h-6 animate-spin text-blue-500 mr-2" />
      {/* <span className="text-blue-700">
        {isShowLoadingEncrypt
          ? "Đang giải mã file..."
          : `Đang tải ${nameFile}...`}
      </span> */}
    </div>
  );
}
