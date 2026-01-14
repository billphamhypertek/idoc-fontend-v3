"use client";

import { ChevronDown, Redo2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BpmnResponse } from "@/definitions/types/bpmn.type";
import { buildFilteredOrganizationTree } from "@/utils/common.utils";
import { TreeNode } from "@/definitions/types/document-out.type";
import {
  useListAttachmentDone,
  useRequestSignDocumentIn,
  useTransferDocumentIn,
} from "@/hooks/data/document-in.data";
import { TransferDocumentInDialog } from "@/components/dialogs/TransferDocumentInDialog";
import { ToastUtils } from "@/utils/toast.utils";
import { CERT_OBJ_TYPE } from "@/definitions/enums/document.enum";
import { toast } from "@/hooks/use-toast";
import { Constant } from "@/definitions/constants/constant";
import { useEncryptStore } from "@/stores/encrypt.store";

// Định nghĩa interface cho props của component
interface TransferDocumentInProps {
  selectedItemId: number | number[] | null; // usagePlanId (id phiếu) cần chuyển xử lý
  disabled?: boolean; // Disable button nếu cần
  onSuccess?: () => void; // Callback sau khi transfer thành công (ví dụ: refetch, clear selection)
  className?: string; // Class tùy chỉnh cho button
  listNextNode: BpmnResponse[];
  isTransferDraft?: boolean;
  isTransferFromEditOrNew?: boolean;
  signCa?: boolean;
  // Callback để đảm bảo có ID trước khi mở (ví dụ: tự động lưu nếu chưa có id)
  onEnsureId?: () => Promise<number | null>;
  // Validate trước khi mở (ví dụ: check preview & file). Trả false để chặn.
  beforeOpenValidate?: () => boolean;
}
const MULTI_TRANSFER_H05 = Constant.MULTI_TRANSFER_H05;
// Component TransferHandler riêng biệt
export function TransferDocumentIn({
  selectedItemId,
  disabled = false,
  onSuccess,
  className = "",
  listNextNode,
  isTransferDraft = false,
  isTransferFromEditOrNew,
  signCa = false,
  onEnsureId,
  beforeOpenValidate,
}: TransferDocumentInProps) {
  const [internalId, setInternalId] = useState<number | null>(
    Array.isArray(selectedItemId)
      ? (selectedItemId?.[0] ?? null)
      : (selectedItemId ?? null)
  );

  useEffect(() => {
    setInternalId(
      Array.isArray(selectedItemId)
        ? (selectedItemId?.[0] ?? null)
        : (selectedItemId ?? null)
    );
  }, [selectedItemId]);
  const selectedItemIdArray = Array.isArray(selectedItemId)
    ? selectedItemId
    : [internalId];
  const router = useRouter();
  const [isTransferDropdownOpen, setIsTransferDropdownOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<BpmnResponse | null>(null);
  const [orgData, setOrgData] = useState<TreeNode[]>([]);
  const transferMutation = useTransferDocumentIn();

  const [listIdDisableByOrgCheck, setListIdDisableByOrgCheck] = useState<
    number[]
  >([]);
  const [listByOrgAndTypeIsOne, setListByOrgAndTypeIsOne] = useState<number[]>(
    []
  );
  const [listByLeaderAndTypeIsOne, setListByLeaderAndTypeIsOne] = useState<
    number[]
  >([]);

  const { refetch } = useListAttachmentDone(
    selectedItemIdArray[0]?.toString() ?? ""
  );
  const requestSignMutation = useRequestSignDocumentIn();

  const handleRoleClick = async (role: BpmnResponse) => {
    setSelectedRole(role);
    setIsTransferDropdownOpen(false);
    try {
      if (beforeOpenValidate && beforeOpenValidate() === false) {
        return;
      }
      // Đảm bảo có ID trước khi mở dữ liệu tổ chức
      let idForAction = internalId;
      if (!idForAction && onEnsureId) {
        idForAction = await onEnsureId();
        if (idForAction) setInternalId(idForAction);
      }
      if (!idForAction) {
        ToastUtils.error("Vui lòng lưu dự thảo trước khi chuyển xử lý.");
        return;
      }
      const data = await buildFilteredOrganizationTree(
        role.id,
        idForAction,
        false,
        false,
        true
      );
      setOrgData(data.tree);
      setListIdDisableByOrgCheck(data.listIdDisableByOrgCheck);
      setListByOrgAndTypeIsOne(data.listByOrgAndTypeIsOne);
      setListByLeaderAndTypeIsOne(data.listByLeaderAndTypeIsOne);
      setIsTransferDialogOpen(true);
    } catch (err) {
      console.error("Error fetching data for transfer dialog:", err);
    }
  };
  const handleTransferDialogSubmit = async (submitData: {
    comment: string;
    main: any[]; // Adjust to any[] for multi
    userIdSelected: number[];
    direction: number[];
  }) => {
    const idForAction = Array.isArray(selectedItemId)
      ? selectedItemId?.[0]
      : internalId;
    if (!idForAction || !selectedRole) {
      console.error("No item, role, or currentNode selected");
      return;
    }
    if (!isTransferDraft) {
      if (!isTransferFromEditOrNew && signCa) {
        const { data: attachments } = await refetch();
        const attachs = [];
        for (const attach of attachments ?? []) {
          if (attach.attachmentType == "DRAFT") {
            const attachObj = {
              fileName: attach.name,
              attachId: attach.id,
            };
            attachs.push(attachObj);
          }
          if (attachs.length > 0) {
            //todo add sign
            // this.showPopupWaiting('Đang xử lý ký số. Vui lòng chờ.');
            // this.signRecursive(this.documentId, attachs, 0, main, userIdSelected);
          } else {
            doRequestSign(
              idForAction,
              submitData.main,
              submitData.userIdSelected,
              submitData.comment
            );
          }
        }
      } else if (MULTI_TRANSFER_H05) {
        for (const docId of selectedItemIdArray) {
          doRequestSign(
            docId,
            submitData.main,
            submitData.userIdSelected,
            submitData.comment,
            true
          );
        }
      }
    } else {
      doTransferOne(submitData);
    }
  };
  const doTransferOne = (submitData: { main: any[]; comment: any }) => {
    const idForAction = Array.isArray(selectedItemId)
      ? selectedItemId?.[0]
      : internalId;
    if (!idForAction || !selectedRole) {
      console.error("No item, role, or currentNode selected");
      return;
    }
    const params = {
      toUserId: submitData.main?.[0],
      delegateId: submitData.main?.[1], // keep empty string to mimic Angular
      nodeId: selectedRole.id,
    };
    transferMutation.mutate(
      {
        docId: idForAction,
        params: params,
        comment: submitData.comment ?? "",
      },
      {
        onSuccess: () => {
          ToastUtils.transferSuccess();
          router.refresh();
          setIsTransferDialogOpen(false);
          onSuccess?.();
        },
      }
    );
  };
  const doRequestSign = (
    docId: number | null,
    main: any[],
    userIdSelected: any[],
    comment: any,
    isMultiple = false
  ) => {
    // const data = setSharedFileData(docId, userIdSelected, comment);
    //todo add share permission
    // const rs = await this.uploadFileService.doSharePermissionDocOutFile(data);
    // if (rs == false) {
    //     this.inSubmit = false;
    //     return rs;
    // }
    const params = {
      toUserId: main[0],
      delegateId: main[1] || "",
      nodeId: selectedRole?.id,
    };
    requestSignMutation.mutate(
      {
        docId: docId,
        params: params,
        comment: comment,
      },
      {
        onSuccess: () => {
          ToastUtils.success("Trình ký dự thảo thành công");
          if (isTransferFromEditOrNew) router.push("/document-in/draft-list");
          onSuccess?.();
        },
      }
    );
  };
  const setSharedFileData = (documentId: any, main: any, comment: any) => {
    return {
      objId: documentId,
      comment: comment,
      userIds: main,
      userIdShared: [],
      allFileNames: [],
      attType: CERT_OBJ_TYPE.doc_out_add,
      cmtType: "VAN_BAN_DI_BINH_LUAN",
    };
  };

  return (
    <>
      <DropdownMenu
        open={isTransferDropdownOpen}
        onOpenChange={setIsTransferDropdownOpen}
      >
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            disabled={disabled}
            className={`text-white hover:text-white bg-blue-600 hover:bg-blue-700 h-9 px-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
          >
            <Redo2 className="w-4 h-4 mr-1" />
            Chuyển xử lý
            <ChevronDown className="w-4 h-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-48" align="start">
          {listNextNode
            ?.filter((item) => !!item.name)
            .map((role, index) => (
              <DropdownMenuItem
                key={index}
                className="cursor-pointer"
                onClick={() => handleRoleClick(role)}
              >
                {role.name ? role.name : "Chưa đặt tên"}
              </DropdownMenuItem>
            ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <TransferDocumentInDialog
        isOpen={isTransferDialogOpen}
        onOpenChange={(open) => {
          if (!open) {
            // ensure fully reset when closing by overlay/ESC
            setIsTransferDialogOpen(false);
          } else {
            setIsTransferDialogOpen(true);
          }
        }}
        onClose={() => setIsTransferDialogOpen(false)}
        onSubmit={handleTransferDialogSubmit}
        selectedRole={selectedRole}
        organizationData={orgData}
        listIdDisableByOrgCheck={listIdDisableByOrgCheck}
        listByOrgAndTypeIsOne={listByOrgAndTypeIsOne}
        listByLeaderAndTypeIsOne={listByLeaderAndTypeIsOne}
        isTransferDraft={isTransferDraft}
      />
    </>
  );
}
