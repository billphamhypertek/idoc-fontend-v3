import { Button } from "@/components/ui/button";
import { CheckSquare } from "lucide-react";
import React, { useState } from "react";
import {
  useAddAttachmentToDoneDoc,
  useDoneDoc,
  useDoneMultiple,
} from "@/hooks/data/document-in.data";
import DocumentProcessDone from "@/components/document-out/DocumentProcessDone";
import useAuthStore from "@/stores/auth.store";
import { ToastUtils } from "@/utils/toast.utils";
import { useRouter } from "next/navigation";
import { DraftService } from "@/services/draft.service";
import { Constant } from "@/definitions/constants/constant";

interface DoneHandlerProps {
  selectedItem: number[]; // ID của item được chọn (nhiêu item)
  onSuccess: () => void; // Callback sau khi consult thành công (ví dụ: refetch, clear selection)
  className?: string; // Class tùy chỉnh cho button
  allowMulti?: boolean;
  isDoneFromEditOrNew?: boolean;
  type?: boolean;
  signCa?: boolean;
  onEnsureId?: () => Promise<number | null>; // Đảm bảo có ID trước khi mở
  beforeOpenValidate?: () => boolean; // Validate trước khi mở (preview, file,...)
  disabled?: boolean; // Disable nút nếu chưa vào sổ
}
const config_BYC_VERIFY_TOKEN = Constant.BCY_VERIFY_TOKEN;
export function DoneHandler({
  selectedItem,
  onSuccess,
  allowMulti = false,
  isDoneFromEditOrNew = false,
  type = true,
  signCa = false,
  onEnsureId,
  beforeOpenValidate,
  disabled = false,
}: DoneHandlerProps) {
  const [internalId, setInternalId] = useState<number | null>(
    selectedItem?.[0] ?? null
  );
  const selectedItemId = internalId ?? selectedItem?.[0];
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();
  const { user } = useAuthStore();
  const doneMutation = useDoneDoc();
  const doneMultipleMutation = useDoneMultiple();
  const attachmentMutation = useAddAttachmentToDoneDoc();
  // const { refetch: fetchAttachment } = useListAttachmentDone(
  //   String(selectedItemId),
  // );
  const doDoneDraftTaskCheckToken = async (
    serialToken: string,
    submitData: {
      processingContent: string;
      files: File[];
    }
  ) => {
    if (config_BYC_VERIFY_TOKEN && user?.serialToken !== serialToken) {
      ToastUtils.banDungKhongDungChungThuSo();
      return;
    }
    // const { data: attachments } = await fetchAttachment();
    if (isDoneFromEditOrNew && signCa) {
      //todo add logic sign
      // const attachs = attachments.filter((attach) => attach.attachmentType == 'DRAFT'
      //     && !attach.encrypt).map((attach) => ({
      //     fileName: attach.name,
      //     attachId: attach.id,
      // }));
      // if (attachs.length > 0) {
      //     this.showPopupWaiting('Đang xử lý ký số. Vui lòng chờ.');
      //     this.signRecursive(attachs, 0);
      // } else {
      //     this.doDoneTask();
      // }
    } else {
      // const attachs = attachments
      //   ?.filter((attach) => {
      //     const extension = getExtension(attach.name);
      //     return (
      //       extension &&
      //       attach.attachmentType == "DRAFT" &&
      //       ALLOWED_CONVERT_EXTENSION.includes(extension) &&
      //       !attach.encrypt
      //     );
      //   })
      //   .map((attach) => ({
      //     fileName: attach.name,
      //     attachId: attach.id,
      //   }));
      await doDoneTask(submitData);
    }
  };

  const doDoneTask = async (submitData: {
    processingContent: string;
    files: File[];
  }) => {
    const docId = String(selectedItemId);
    const comment = submitData.processingContent ?? "";

    try {
      // Call API /document_out/forward/finish với type = false
      const result = await DraftService.finish(docId, comment, type);

      // Hiển thị thông báo thành công
      ToastUtils.documentCompleteSuccess();

      setIsDialogOpen(false);
      if (onSuccess) onSuccess();

      if (isDoneFromEditOrNew) {
        router.push("/document-in/draft-list");
      }
    } catch (err) {
      console.error("Lỗi hoàn thành:", err);
      // Hiển thị thông báo lỗi
      ToastUtils.error("Có lỗi xảy ra khi hoàn thành văn bản");
    }
  };

  const handleReturnDialogSubmit = async (submitData: {
    processingContent: string;
    files: File[];
  }) => {
    if (!selectedItemId) {
      console.error("No item, role, or currentNode selected");
      return;
    }

    // Gọi doDoneTask trực tiếp cho document-in
    await doDoneTask(submitData);
  };

  const handleClickButton = async () => {
    if (!allowMulti) {
      if (beforeOpenValidate && beforeOpenValidate() === false) {
        return;
      }
      if (!internalId && onEnsureId) {
        const newId = await onEnsureId();
        if (newId) setInternalId(newId);
      }
      setIsDialogOpen(true);
    } else {
      const ids = selectedItem.map((item) => String(item));
      doneMultipleMutation.mutate(
        { listId: ids },
        {
          onSuccess: () => {},
        }
      );
    }
  };

  return (
    <>
      <Button
        variant="outline"
        className="text-white border-0 h-9 px-3 text-xs disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 hover:text-white"
        onClick={() => handleClickButton()}
        disabled={disabled}
      >
        <CheckSquare className="w-4 h-4 mr-1" />
        Hoàn thành xử lý
      </Button>
      <DocumentProcessDone
        docId={String(selectedItemId)}
        onClose={() => setIsDialogOpen(false)}
        showProcessDoneModal={isDialogOpen}
        setShowProcessDoneModal={setIsDialogOpen}
        onSubmit={handleReturnDialogSubmit}
      />
    </>
  );
}
