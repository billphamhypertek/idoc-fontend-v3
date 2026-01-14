"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Undo2,
  Eye,
  RotateCcw,
  RefreshCcw,
  Repeat2,
  Star,
  CheckCircle2,
  MessageSquare,
  UserPlus,
  FilePlus2,
  FileCheck,
  Send,
  ThumbsUp,
  Clock,
  ClipboardList,
} from "lucide-react";
import { Constant } from "@/definitions/constants/constant";
import { TransferDocumentOut } from "@/components/document-out/TransferDocumentOut";
import { queryKeys } from "@/definitions";
import { useQueryClient } from "@tanstack/react-query";

export interface ActionButtonsProps {
  isCanHandleDoc: boolean;
  isTruongBan: boolean;
  encryptShowing: boolean;
  buttonStatus: {
    canAsk: boolean;
    canDone: boolean;
    canReply: boolean;
    canReview: boolean;
    canRequestReview: boolean;
    canReturn: boolean;
    canTransfer: boolean;
    canRetake: boolean;
    canRetakeDone: boolean;
    canSwitchOrAdd: boolean;
    canOrgTransfer: boolean;
    createTaskButton: boolean;
    canFinish: boolean;
    canRead: boolean;
    canMoreTime: boolean;
  };
  showBtnNewDraft: boolean;
  isSwitchDone: boolean;
  isCanFinishReceive: boolean;
  listNextNode: any[];
  listNextNodeOrg: any[];
  selectedDocId: number;
  textShowNhatTri: string;
  isShowNhatTri: boolean;
  isShowNextVanThuPhong: boolean;
  textShowChuyenVanThu: string;
  docCurrentNode: any;
  canDoneInternal: boolean;
  // Callbacks
  onBack: () => void;
  onShowTracking: () => void;
  onOpenReject: () => void;
  onOpenRetakeByStep: () => void;
  onOpenStepRetake: () => void;
  onOpenEvaluate: (isEvaluate: boolean) => void;
  onOpenAskIdea: () => void;
  onOpenSwitchUser: () => void;
  onOpenRetakeDone: () => void;
  onOpenProcessDone: (isFinishReceive: boolean) => void;
  onNewDraft: () => void;
  onCreateTask: () => void;
  onGuiVanThuPhongHC: () => void;
  onNhatTri: () => void;
  onOpenDeadline: () => void;
  onGiaoViec?: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  isCanHandleDoc,
  isTruongBan,
  encryptShowing,
  buttonStatus,
  showBtnNewDraft,
  isSwitchDone,
  isCanFinishReceive,
  listNextNode,
  listNextNodeOrg,
  selectedDocId,
  textShowNhatTri,
  isShowNhatTri,
  isShowNextVanThuPhong,
  textShowChuyenVanThu,
  docCurrentNode,
  canDoneInternal,
  onBack,
  onShowTracking,
  onOpenReject,
  onOpenRetakeByStep,
  onOpenStepRetake,
  onOpenEvaluate,
  onOpenAskIdea,
  onOpenSwitchUser,
  onOpenRetakeDone,
  onOpenProcessDone,
  onNewDraft,
  onCreateTask,
  onGuiVanThuPhongHC,
  onNhatTri,
  onOpenDeadline,
  onGiaoViec,
}) => {
  const qc = useQueryClient();
  return (
    <div className="my-6 flex flex-wrap gap-2 justify-end">
      <Button
        onClick={onBack}
        variant="outline"
        className="flex items-center gap-2 h-9"
      >
        <Undo2 className="h-4 w-4" />
      </Button>

      {!isTruongBan && isCanHandleDoc && (
        <Button
          onClick={onShowTracking}
          className="bg-blue-600 hover:bg-blue-700 hover:text-white text-white border-0 h-9 px-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Eye className="h-4 w-4" />
          Theo dõi
        </Button>
      )}

      {buttonStatus.canReturn && !isTruongBan && isCanHandleDoc && (
        <Button
          variant="destructive"
          onClick={onOpenReject}
          disabled={!isCanHandleDoc}
          className="bg-blue-600 hover:bg-blue-700 hover:text-white text-white border-0 h-9 px-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RotateCcw className="h-4 w-4" />
          Trả lại
        </Button>
      )}

      {Constant.RETAKE_BY_STEP_BCY &&
        buttonStatus.canRetake &&
        isCanHandleDoc &&
        !isTruongBan && (
          <Button
            onClick={onOpenRetakeByStep}
            disabled={!isCanHandleDoc}
            className="bg-blue-600 hover:bg-blue-700 hover:text-white text-white border-0 h-9 px-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RefreshCcw className="h-4 w-4" />
            Thu hồi
          </Button>
        )}

      {Constant.RETAKE_BY_STEP_BCY && isCanHandleDoc && (
        <Button
          onClick={onOpenStepRetake}
          disabled={!isCanHandleDoc}
          className="bg-blue-600 hover:bg-blue-700 hover:text-white text-white border-0 h-9 px-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Repeat2 className="h-4 w-4" />
          Thu hồi chuyển xử lý
        </Button>
      )}

      {Constant.EVALUTE_BCY &&
        buttonStatus.canRequestReview &&
        isCanHandleDoc &&
        !isTruongBan &&
        !encryptShowing && (
          <Button
            onClick={() => onOpenEvaluate(false)}
            disabled={!isCanHandleDoc}
            className="bg-blue-600 hover:bg-blue-700 hover:text-white text-white border-0 h-9 px-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Star className="h-4 w-4" />
            Xin đánh giá
          </Button>
        )}

      {Constant.EVALUTE_BCY &&
        buttonStatus.canReview &&
        isCanHandleDoc &&
        !isTruongBan &&
        !encryptShowing && (
          <Button
            onClick={() => onOpenEvaluate(true)}
            disabled={!isCanHandleDoc}
            className="bg-blue-600 hover:bg-blue-700 hover:text-white text-white border-0 h-9 px-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="h-4 w-4" />
            Đánh giá
          </Button>
        )}

      {Constant.ASK_IDEA_H05 &&
        buttonStatus.canReply &&
        isCanHandleDoc &&
        !isTruongBan &&
        !encryptShowing && (
          <Button
            onClick={onOpenAskIdea}
            disabled={!isCanHandleDoc}
            className="bg-blue-600 hover:bg-blue-700 hover:text-white text-white border-0 h-9 px-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <MessageSquare className="h-4 w-4" />
            Cho ý kiến
          </Button>
        )}

      {Constant.SWITCH_AND_ADD_USER_BCY &&
        buttonStatus.canSwitchOrAdd &&
        isCanHandleDoc &&
        !isSwitchDone &&
        !isTruongBan && (
          <Button
            onClick={onOpenSwitchUser}
            disabled={!isCanHandleDoc}
            className="bg-blue-600 hover:bg-blue-700 hover:text-white text-white border-0 h-9 px-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <UserPlus className="h-4 w-4" />
            Thêm xử lý
          </Button>
        )}

      {Constant.RETAKE_DONE_DOCUMENT_BCY &&
        buttonStatus.canRetakeDone &&
        isCanHandleDoc &&
        !isTruongBan && (
          <Button
            onClick={onOpenRetakeDone}
            disabled={!isCanHandleDoc}
            className="text-white border-0 h-9 px-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700"
          >
            <RotateCcw className="h-4 w-4" />
            Thu hồi hoàn thành
          </Button>
        )}

      {buttonStatus.canTransfer &&
        listNextNode &&
        listNextNode.length > 0 &&
        !isCanFinishReceive &&
        isCanHandleDoc && (
          <TransferDocumentOut
            selectedItemId={selectedDocId}
            disabled={false}
            onSuccess={() => {
              qc.invalidateQueries({
                queryKey: [
                  queryKeys.documentOut.root,
                  queryKeys.documentOut.comments,
                  selectedDocId,
                ],
              });
            }}
            listNextNode={listNextNode}
          />
        )}

      {Constant.ORG_MULTI_TRANSFER_BCY &&
        listNextNodeOrg &&
        listNextNodeOrg.length > 0 &&
        buttonStatus.canOrgTransfer &&
        isCanHandleDoc && (
          <TransferDocumentOut
            selectedItemId={selectedDocId}
            disabled={false}
            onSuccess={() => {
              qc.invalidateQueries({
                queryKey: [
                  queryKeys.documentOut.root,
                  queryKeys.documentOut.comments,
                  selectedDocId,
                ],
              });
            }}
            listNextNode={listNextNodeOrg}
            unit
          />
        )}

      {showBtnNewDraft && !isTruongBan && (
        <Button
          onClick={onNewDraft}
          className="text-white border-0 h-9 px-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 hover:text-white flex items-center justify-center gap-2"
        >
          <FilePlus2 className="h-4 w-4" />
          Thêm mới dự thảo
        </Button>
      )}

      {buttonStatus.canDone && isCanHandleDoc && (
        <Button
          onClick={() => onOpenProcessDone(false)}
          disabled={!isCanHandleDoc}
          className="text-white border-0 h-9 px-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 hover:text-white flex items-center justify-center gap-2"
        >
          <CheckCircle2 className="h-4 w-4" />
          Hoàn thành xử lý
        </Button>
      )}

      {(buttonStatus.canFinish || canDoneInternal) &&
        !isTruongBan &&
        isCanHandleDoc && (
          <Button
            onClick={() => onOpenProcessDone(true)}
            disabled={!isCanHandleDoc}
            className="text-white border-0 h-9 px-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 hover:text-white flex items-center justify-center gap-2"
          >
            <FileCheck className="h-4 w-4" />
            Hoàn thành văn bản
          </Button>
        )}

      {isShowNextVanThuPhong && isCanHandleDoc && (
        <Button
          onClick={onGuiVanThuPhongHC}
          disabled={!isCanHandleDoc}
          className="text-white border-0 h-9 px-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 hover:text-white flex items-center justify-center gap-2"
        >
          <Send className="h-4 w-4" />
          {textShowChuyenVanThu}
        </Button>
      )}

      {isShowNhatTri &&
        buttonStatus.canTransfer &&
        listNextNode &&
        listNextNode.length > 0 &&
        !isCanFinishReceive &&
        isCanHandleDoc && (
          <Button
            onClick={onNhatTri}
            disabled={!isCanHandleDoc}
            className="text-white border-0 h-9 px-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 hover:text-white flex items-center justify-center gap-2"
          >
            <ThumbsUp className="h-4 w-4" />
            {textShowNhatTri}
          </Button>
        )}

      {Constant.FIX_LAYOUT_AND_ADD_ATTACH_BUTTON_H05 &&
        docCurrentNode?.allowConfig &&
        buttonStatus.canMoreTime &&
        !encryptShowing &&
        isCanHandleDoc && (
          <Button
            onClick={onOpenDeadline}
            disabled={!isCanHandleDoc}
            className="text-white border-0 h-9 px-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 hover:text-white flex items-center justify-center gap-2"
          >
            <Clock className="h-4 w-4" />
            Gia hạn xử lý
          </Button>
        )}

      {buttonStatus.createTaskButton &&
        !encryptShowing &&
        !isTruongBan &&
        isCanHandleDoc && (
          <Button
            onClick={onGiaoViec}
            disabled={!isCanHandleDoc}
            className="text-white border-0 h-9 px-2 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 hover:text-white flex items-center justify-center gap-2"
          >
            <ClipboardList className="h-4 w-4" />
            Giao việc
          </Button>
        )}
    </div>
  );
};

export default ActionButtons;
