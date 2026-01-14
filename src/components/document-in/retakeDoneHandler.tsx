import { Button } from "@/components/ui/button";
import React, { useState } from "react";
import { useRetakeDoneDoc } from "@/hooks/data/document-in.data";
import useAuthStore from "@/stores/auth.store";
import { toast } from "@/hooks/use-toast";
import RetakeDoneDocument from "@/components/document-out/RetakeDoneDocument";
import { Constant } from "@/definitions/constants/constant";
import { getTokenInfo } from "@/services/signature.service";
import { TokenInfo } from "@/definitions";
import { b64DecodeUnicode } from "@/services/shared.service";
import { uploadFileService } from "@/services/file.service";
import { handleError } from "@/utils/common.utils";
import { RotateCcw } from "lucide-react";
import { ToastUtils } from "@/utils/toast.utils";

interface DoneHandlerProps {
  type: boolean;
  selectedItemId: number | null; // ID của item được chọn (chỉ hỗ trợ 1 item)
  onSuccess: () => void; // Callback sau khi consult thành công (ví dụ: refetch, clear selection)
  className?: string; // Class tùy chỉnh cho button
}

const BYC_VERIFY_TOKEN = Constant.BCY_VERIFY_TOKEN;

export function RetakeDoneHandler({
  selectedItemId,
  onSuccess,
  type,
}: DoneHandlerProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuthStore();
  const doneMutation = useRetakeDoneDoc();

  const setSharedFileData = (submitData: {
    processingContent: string;
    files: File[];
  }) => {
    return {
      objId: selectedItemId,
      files: submitData?.files,
      comment: submitData?.processingContent,
      userIdShared: [],
      allFileNames: [],
      attType: "doc_in_comment", // CERT_OBJ_TYPE.doc_in_comment
      cmtType: "VAN_BAN_DEN_CMT",
      objType: "doc_in_comment", // CERT_OBJ_TYPE.doc_in_comment
      userOrobj: "doc_in_comment", // CERT_OBJ_TYPE.doc_in_comment
      checkObjEnc: false,
    };
  };

  const doDoneDocumentTaskCheckToken = async (
    serialToken: string,
    submitData: {
      processingContent: string;
      files: File[];
    }
  ) => {
    if (BYC_VERIFY_TOKEN && user?.serialToken !== serialToken) {
      ToastUtils.error("Bạn dùng không đúng chứng thư số");
      return;
    }
    const data = setSharedFileData(submitData);
    const rs = await uploadFileService.doSharePermissionDocFile(data);
    if (!rs) return rs;
    try {
      await doRetakeDoneDocument(
        Number(selectedItemId),
        data.comment,
        data.files,
        type
      );
    } catch (err) {
      handleError(err);
      await uploadFileService.rollback(
        data.allFileNames,
        data.userIdShared,
        data.cmtType
      );
    }
  };
  const doRetakeDoneDocument = async (
    docId: number,
    doneComment: string,
    files: File[],
    type: boolean = true
  ) => {
    doneMutation.mutate(
      {
        docId: String(docId),
        doneComment: doneComment,
        files: files,
        type: type,
      },
      {
        onSuccess: () => {
          ToastUtils.success("Thu hồi thành công");
          setIsDialogOpen(false);
          if (onSuccess) onSuccess();
        },
        onError: (err) => {
          handleError(err);
          ToastUtils.error("Thu hồi thất bại");
        },
      }
    );
  };

  const handleReturnDialogSubmit = async (submitData: {
    processingContent: string;
    files: File[];
  }) => {
    if (type) {
      let serialNumber = "";
      if (Constant.BCY_VERIFY_TOKEN) {
        getTokenInfo(async (data: string) => {
          if (data === "") {
            ToastUtils.error("Lỗi khi lấy thông tin chứng thư số");
          } else if (data === "-100") {
            ToastUtils.error("Không kết nối được chứng thư số");
          } else {
            const tokenInfo: TokenInfo = JSON.parse(
              b64DecodeUnicode(data) || "{}"
            );
            serialNumber = tokenInfo.SerialNumber || "";
            await doDoneDocumentTaskCheckToken(serialNumber, submitData);
          }
        });
      } else {
        await doDoneDocumentTaskCheckToken(serialNumber, submitData);
      }
    } else {
      await doRetakeDoneDocument(
        Number(selectedItemId),
        submitData.processingContent,
        [],
        type
      );
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="text-white border-0 h-9 px-3 text-xs disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700"
        onClick={() => setIsDialogOpen(true)}
      >
        <RotateCcw className="w-4 h-4 mr-1" />
        Thu hồi hoàn thành
      </Button>
      <RetakeDoneDocument
        docId={String(selectedItemId)}
        onClose={() => setIsDialogOpen(false)}
        showRetakeDoneModal={isDialogOpen}
        setShowRetakeDoneModal={setIsDialogOpen}
        type={type}
        onSubmit={handleReturnDialogSubmit}
      />
    </>
  );
}
