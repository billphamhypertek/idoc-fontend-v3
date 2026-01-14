"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Undo2,
  Eye,
  Send,
  Trash2,
  RotateCcw,
  ArrowRight,
  UserPlus,
  CheckSquare,
  Briefcase,
  Edit3,
  Zap,
} from "lucide-react";
import { Constant } from "@/definitions/constants/constant";
import { Draft } from "@/definitions/types/document.type";
import useAuthStore from "@/stores/auth.store";
import { useRouter } from "next/navigation";
import { ConsultHandler } from "@/components/document-in/consultHandler";
import { TransferDocumentIn } from "@/components/document-in/TranferDocumentIn";
import ForwardReceivePlace from "@/components/document-in/ForwardReceivePlace";
import { RetakeHandler } from "@/components/document-in/retakeHandler";
import { ToastUtils } from "@/utils/toast.utils";
import { ReturnHandler } from "@/components/document-in/returnHandler";
import { ToBookHandler } from "@/components/document-in/ToBookHandler";
import { DoneHandler } from "@/components/document-in/doneHandler";
import { RetakeDoneHandler } from "@/components/document-in/retakeDoneHandler";
import { SharedService } from "@/services/shared.service";
import WorkAssignDialog from "@/components/work-assign/createDialog";

export interface ActionButtonsProps {
  draft: Draft;
  isCanHandleDoc: boolean;
  encryptShowing: boolean;
  buttonStatus: {
    hideAll: boolean;
    rejectButton: boolean;
    doneButton: boolean;
    transferButton: boolean;
    consultButton: boolean;
    toKnowButton: boolean;
    issuedButton: boolean;
    retakeButton: boolean;
    editButton: boolean;
    bookButton: boolean;
    retakeByStepButton: boolean;
    createTaskButton: boolean;
    canRETAKE: boolean;
  };
  listNextNode: any[];
  selectedDocId: number;
  isFastTransfer: boolean;
  textFastTransfer: string;

  onBack: () => void;
  onShowTracking: () => void;
  onCreateTask: () => void;
  onDeleteDocument: () => void;
  consultNodeData: any;
  isDelegate: boolean;
  onSuccess?: () => void | Promise<void>;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  draft,
  isCanHandleDoc,
  encryptShowing,
  buttonStatus,
  onBack,
  onShowTracking,
  onCreateTask,
  isFastTransfer,
  textFastTransfer,
  onDeleteDocument,
  consultNodeData,
  listNextNode,
  isDelegate,
  onSuccess,
}) => {
  const router = useRouter();
  const queryParams = new URLSearchParams(location.search);
  const [openWorkAssignDialog, setOpenWorkAssignDialog] = useState(false);
  const tab = queryParams.get("tab") ?? null;
  const { user } = useAuthStore();
  const doEditDraft = () => {
    if (user?.position == 218) {
      router.push(`/document-in/draft-issued/issued-update/${draft.id}`);
    } else {
      router.push(`/document-in/draft-list/draft-update/${draft.id}`);
    }
  };
  const doRedirectToIssued = () => {
    router.push(`/document-in/draft-issued/issued-update/${draft.id}`);
  };

  return (
    <div className="my-6 flex flex-wrap gap-2 justify-end items-center">
      {/*Quay lại*/}
      <Button
        onClick={onBack}
        variant="outline"
        className="flex items-center justify-center gap-2 h-9 bg-white-600 hover:bg-white-700"
        title="Quay lại"
      >
        <Undo2 className="h-4 w-4 text-blue-600" />
      </Button>
      {/*Theo dõi*/}
      {isCanHandleDoc && (
        <Button
          onClick={onShowTracking}
          className="h-9 px-2 text-sm font-medium text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 hover:text-white flex items-center justify-center gap-2"
          title="Theo dõi"
        >
          <Eye className="h-4 w-4" />
          Theo dõi
        </Button>
      )}
      {/*Ban hành*/}
      {!buttonStatus.hideAll && buttonStatus.issuedButton && (
        <Button
          onClick={doRedirectToIssued}
          disabled={!isCanHandleDoc}
          className="h-9 px-2 text-sm font-medium text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 hover:text-white flex items-center justify-center gap-2"
          title="Ban hành"
        >
          <Send className="h-4 w-4" />
          Ban hành
        </Button>
      )}
      {/*Xóa văn bản*/}
      {!buttonStatus.hideAll && buttonStatus.issuedButton && (
        <Button
          onClick={onDeleteDocument}
          disabled={!isCanHandleDoc}
          className="h-9 px-2 text-sm font-medium text-white border-0 disabled:opacity-50 disabled:cursor-not-allowed bg-red-600 hover:bg-red-700 hover:text-white flex items-center justify-center gap-2"
          title="Xóa văn bản"
        >
          <Trash2 className="h-4 w-4" />
          Xóa văn bản
        </Button>
      )}

      {/*Chuyển nơi nhận công văn*/}
      {draft.status === "DA_BAN_HANH" &&
        ((buttonStatus.toKnowButton && !buttonStatus.hideAll) || tab) && (
          <ForwardReceivePlace
            selectedItemId={draft.id}
            onSuccess={async () => {
              ToastUtils.success("Chuyển xử lý thành công");
              if (onSuccess) await onSuccess();
            }}
          />
        )}
      {/*Luồng xin ý kiến*/}
      {!buttonStatus.hideAll && buttonStatus.consultButton && (
        <ConsultHandler
          selectedItemId={draft.id}
          currentNode={draft.nodeId}
          consultNodeData={consultNodeData}
          onSuccess={onSuccess}
        />
      )}
      {/*Thu hồi*/}
      {!Constant.HIDE_BTN_RETAKE_H05 &&
        buttonStatus.retakeButton &&
        draft.status === "DANG_XU_LY" && (
          <RetakeHandler
            selectedItemId={draft?.id}
            onSuccess={async () => {
              ToastUtils.documentRetakeSuccess();
              if (onSuccess) await onSuccess();
            }}
          />
        )}
      {/*Trả lại*/}
      {!buttonStatus.hideAll && buttonStatus.rejectButton && (
        <ReturnHandler
          selectedItemId={draft.id}
          currentNode={draft.nodeId}
          onSuccess={async () => {
            ToastUtils.documentReturnSuccess();
            if (onSuccess) await onSuccess();
          }}
        />
      )}
      {/*Thu hồi*/}
      {buttonStatus.retakeByStepButton && (
        <RetakeHandler
          selectedItemId={draft?.id}
          onSuccess={async () => {
            ToastUtils.documentRetakeSuccess();
            if (onSuccess) await onSuccess();
          }}
        />
      )}
      {/*Vào sổ*/}
      {!buttonStatus.hideAll &&
        buttonStatus.bookButton &&
        Constant.IMPORT_DOC_BOOK_BCY && (
          <ToBookHandler
            selectedItemId={draft.id}
            onSuccess={async () => {
              ToastUtils.success("Vào sổ thành công!");
              if (onSuccess) await onSuccess();
            }}
          />
        )}
      {/*Chuyển tiếp*/}
      {draft.status === "DA_BAN_HANH" && draft.canForward && (
        <Button
          onClick={() => console.log("open transition true")}
          disabled={!isCanHandleDoc}
          className="text-white border-0 h-9 px-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 hover:text-white flex items-center justify-center gap-2"
          title="Chuyển tiếp"
        >
          <ArrowRight className="h-4 w-4" />
          Chuyển tiếp
        </Button>
      )}
      {/*Bổ sung xử lý*/}
      {draft.status === "DA_BAN_HANH" && draft.canAddUser && (
        <Button
          onClick={() => console.log("open transition false")}
          disabled={!isCanHandleDoc}
          className="text-white border-0 h-9 px-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 hover:text-white flex items-center justify-center gap-2"
          title="Bổ sung xử lý"
        >
          <UserPlus className="h-4 w-4" />
          Bổ sung xử lý
        </Button>
      )}
      {/*Hoàn thành xử lý*/}
      {tab === "CHO_XU_LY" && isCanHandleDoc && (
        <DoneHandler
          selectedItem={draft.id ? [draft.id] : []}
          onSuccess={async () => {
            ToastUtils.success("Hoàn thành văn bản thành công!");
            if (onSuccess) await onSuccess();
          }}
          isDoneFromEditOrNew={true}
          type={false}
          disabled={!draft.numberInBook}
        />
      )}
      {/*Thu hồi hoàn thành*/}
      {tab === "DA_XU_LY" && isCanHandleDoc && (
        <RetakeDoneHandler
          selectedItemId={draft.id}
          type={false}
          onSuccess={async () => {
            ToastUtils.success("Hoàn thành văn bản thành công!");
            if (onSuccess) await onSuccess();
          }}
        />
      )}
      {/*Chuyển xử lý*/}
      {!buttonStatus.hideAll &&
        buttonStatus.transferButton &&
        !buttonStatus.bookButton &&
        isCanHandleDoc && (
          <TransferDocumentIn
            selectedItemId={draft.id}
            listNextNode={listNextNode}
            onSuccess={async () => {
              router.push(`/document-in/draft-list`);
              if (onSuccess) await onSuccess();
            }}
            isTransferDraft={
              !(
                SharedService.currentMenuDocumentIn ==
                  Constant.DOCUMENT_IN_MENU.DRAFT && !isDelegate
              )
            }
          />
        )}
      {/*Hoàn thành xử lý*/}
      {!buttonStatus.hideAll &&
        buttonStatus.doneButton &&
        tab != "doneTab" &&
        isCanHandleDoc && (
          <DoneHandler
            selectedItem={draft.id ? [draft.id] : []}
            onSuccess={async () => {
              ToastUtils.success("Hoàn thành văn bản thành công!");
              if (onSuccess) await onSuccess();
            }}
            isDoneFromEditOrNew={true}
            type={true}
            disabled={!draft.numberInBook}
          />
        )}

      {/*Giao việc*/}
      {buttonStatus.createTaskButton &&
        !encryptShowing &&
        !buttonStatus.canRETAKE &&
        draft.status === "DA_BAN_HANH" && (
          <Button
            onClick={() => setOpenWorkAssignDialog(true)}
            disabled={!isCanHandleDoc}
            className="text-white border-0 h-9 px-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 hover:text-white flex items-center justify-center gap-2"
            title="Giao việc"
          >
            <Briefcase className="h-4 w-4" />
            Giao việc
          </Button>
        )}
      {/*Sửa*/}
      {draft.editable && draft.status !== "DA_BAN_HANH" && (
        <Button
          onClick={doEditDraft}
          disabled={!isCanHandleDoc}
          className="text-white border-0 h-9 px-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 hover:text-white flex items-center justify-center gap-2"
          title="Chỉnh sửa"
        >
          <Edit3 className="h-4 w-4" />
          Sửa
        </Button>
      )}
      {isFastTransfer && (
        <Button
          onClick={() => console.log("button disabled")}
          disabled={!isCanHandleDoc}
          className="text-white border-0 h-9 px-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 hover:text-white flex items-center justify-center gap-2"
          title="Chuyển nhanh"
        >
          <Zap className="h-4 w-4" />
          {textFastTransfer}
        </Button>
      )}
      {openWorkAssignDialog && (
        <WorkAssignDialog
          open={openWorkAssignDialog}
          onClose={() => {
            setOpenWorkAssignDialog(false);
          }}
          // isAddChildTask={true}
          // parentTaskFromDetail={selectedRowKeys?.[0]?.toString()}
          documentDetail={draft}
          documentType={Constant.HSTL_DOCUMENT_TYPE.VAN_BAN_DI}
        />
      )}
    </div>
  );
};

export default ActionButtons;
