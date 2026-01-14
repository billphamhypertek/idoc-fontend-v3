"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useForm } from "react-hook-form";
import { getFormDefaultValues } from "@/utils/formValue.utils";
import { uploadFileService } from "@/services/file.service";
import { EncryptionService } from "@/services/encryption.service";
import { DocumentInService } from "@/services/document-in.service";
import { Constant } from "@/definitions/constants/constant";
import { OBJ_TYPE } from "@/definitions/enums/document.enum";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Form } from "@/components/ui/form";
import { Table } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Plus,
  CheckCircle,
  RotateCcw,
  ArrowLeft,
  Save,
  Trash,
  Check,
  X,
  RefreshCw,
  ChevronDown,
  Redo2,
  LogIn,
  Share,
  User,
  Building,
} from "lucide-react";
import TaskBasicInfoSection from "./TaskBasicInfoSection";
import TaskFollowSection from "./TaskFollowSection";
import TaskTagsSection from "./TaskTagsSection";
import TaskAttachmentsSection from "./TaskAttachmentsSection";
import TaskRelationsSection from "./TaskRelationsSection";
import TaskDocumentsSection from "./TaskDocumentsSection";
import { useParams, usePathname, useRouter } from "next/navigation";
import { useGetAction } from "@/hooks/data/task.data";
import {
  useUpdateTask,
  useSaveTaskAttachment,
} from "@/hooks/data/task-action.data";
import RecipientInformation from "./RecipientInformation";
import { handleError } from "@/utils/common.utils";
import {
  transformTaskDocument,
  transformTaskRelateds,
} from "@/utils/transform.utils";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import { useGetNextNodes, useGetStartNode } from "@/hooks/data/bpmn2.data";
import { Bpmn2Service } from "@/services/bpmn2.service";
import TaskTransferModal from "../TaskTransferModal";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/definitions";
import { useUpdateStatusKanban } from "@/hooks/data/task-dashboard.data";
import { ToastUtils } from "@/utils/toast.utils";
import { OrganizationService } from "@/services/organization.service";
import { UserService } from "@/services/user.service";
import { useGetInfoUsers } from "@/hooks/data/user.data";
import { useGetOrgInformation } from "@/hooks/data/organization.data";
import { useGetActionV2 } from "@/hooks/data/taskv2.data";

interface DetailLayoutLeftProps {
  data: any;
  isEdit?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onSave?: (formData?: any) => void;
  onTransfer?: () => void;
  onAddTransfer?: () => void;
  onClose?: (id: number, status: number) => void;
  onReject?: (id: number, status: number) => void;
  onComplete?: (id: number, status: number) => void;
  onRevoke?: (id: number, status: number) => void;
  onRestore?: (id: number, status: number) => void;
  onRejectApprove?: (id: number, status: number) => void;
  onNewDraft?: () => void;
  onGoBack?: () => void;
  onFileUpload?: (files: FileList) => void;
  onSelectUser?: () => void;
  onSelectTemplate?: () => void;
  onTodo?: (id: number, status: number) => void;
  onAddTag?: (tagName: string) => void;
  onRevokeFinish?: (id: number, status: number) => void;
  onGiaoViec?: () => void;
  UserInfo?: any;
  isCheckUserEdit?: boolean;
  handlerId?: number;
  type?: number;
  status?: number;
  listOrgId?: string;
  isV2?: boolean;
}

// Columns cho Danh sách văn bản đi trả lời
const docOutReplyColumns = [
  {
    header: "STT",
    accessor: "no",
    className: "w-16 text-center border-r",
  },
  {
    header: "Trích yếu",
    accessor: "preview",
    className: "w-96 text-center border-r",
  },
  {
    header: "Trạng thái văn bản",
    accessor: "status",
    className: "w-32 text-center border-r",
  },
];

export default function DetailLayoutLeft({
  data,
  isEdit: propIsEdit,
  onEdit,
  onDelete,
  onSave,
  onTransfer,
  onAddTransfer,
  onClose,
  onReject,
  onComplete,
  onRevoke,
  onRestore,
  onRejectApprove,
  onNewDraft,
  onGoBack,
  onFileUpload,
  onSelectUser,
  onSelectTemplate,
  onAddTag,
  UserInfo,
  onTodo,
  isCheckUserEdit,
  onRevokeFinish,
  onGiaoViec,
  handlerId,
  type,
  status,
  listOrgId,
  isV2 = false,
}: DetailLayoutLeftProps) {
  const [isEditing, setIsEditing] = useState(propIsEdit || false);
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [isOpenConfirmDeleteDialog, setIsOpenConfirmDeleteDialog] =
    useState(false);
  const [nodeStart, setNodeStart] = useState<any>(null);
  const [listNextNode, setListNextNode] = useState<any>(null);
  const [openTransferDialog, setOpenTransferDialog] = useState(false);
  const [selectedNodeId, setSelectedNodeId] = useState<number | null>(null);
  const [assigner, setAssigner] = useState<any>(false);
  const [isAddTransfer, setIsAddTransfer] = useState(false);
  const [addWork, setAddWork] = useState(false);
  const [listOrgChild, setListOrgChild] = useState<any>([]);
  const queryClient = useQueryClient();
  const pathname = usePathname();

  const { data: startNodeData } = useGetStartNode(Constant.THREAD_TYPE.ASSIGN);
  const { data: nextNodeData } = useGetNextNodes(data?.nodeId, !!data?.nodeId);

  const [buttonStatus, setButtonStatus] = useState({
    canTransfer: false,
    canDone: false,
    canClose: false,
    canDelete: false,
    canEdit: false,
    canRevoke: false,
    canTodo: false,
    canReject: false,
    canRejectApprove: false,
    canRevokeFinish: false,
    canRestore: false,
    canAddTransfer: false,
  });
  const [isExecute, setIsExecute] = useState(false);

  const form = useForm({
    defaultValues: getFormDefaultValues(data),
  });

  useEffect(() => {
    form.reset(getFormDefaultValues(data));
  }, [data, form]);

  useEffect(() => {
    setIsEditing(propIsEdit || false);
  }, [propIsEdit]);

  useEffect(() => {
    if (
      pathname?.includes("/task/assign") ||
      pathname?.includes("/task/search") ||
      pathname?.includes("/task-v2/assign") ||
      pathname?.includes("/task-v2/search")
    ) {
      setAssigner(true);
    } else if (
      pathname?.includes("/task/work") ||
      pathname?.includes("/task/follow") ||
      pathname?.includes("/task/combination") ||
      pathname?.includes("/task-v2/work") ||
      pathname?.includes("/task-v2/combination") ||
      pathname?.includes("/task-v2/follow")
    ) {
      setAssigner(false);
    }
  });

  useEffect(() => {
    getListChildByOrgId();
  }, [listOrgId]);

  const orgId = useMemo(() => {
    if (!UserInfo || !data) return 0;

    const userAssign = UserInfo;
    const currentRole = userAssign.currentRole;

    // LĐ Ban (role 58) hoặc Lãnh đạo ĐV (role 59)
    if (currentRole === 58 || currentRole === 59) {
      return userAssign.org;
    }

    return userAssign.orgModel?.parentId || 0;
  }, [UserInfo, data]);

  const checkUserAssign = () => {
    const userLogin = UserInfo;
    return (
      userLogin &&
      (userLogin.id == data?.userAssignId ||
        userLogin.orgModel?.isPermissionViewAll ||
        userLogin.lead)
    );
  };

  const taskId = id ? parseInt(id as string) : 0;

  const updateTaskMutation = useUpdateTask(isV2 ?? false);
  const saveTaskAttachmentMutation = useSaveTaskAttachment(isV2 ?? false);
  const transferUnitMutation = useUpdateStatusKanban(isV2 ?? false);
  const getOrgInformationMutation = useGetOrgInformation();
  const getInfoUsersMutation = useGetInfoUsers();

  const { data: actionData, isLoading: actionLoading } = useGetAction(
    taskId,
    assigner,
    !isV2
  );

  const { data: actionDataV2, isLoading: actionLoadingV2 } = useGetActionV2(
    taskId,
    assigner,
    isV2
  );

  const actionDataMerged = isV2 ? actionDataV2 : actionData;
  const actionLoadingMerged = isV2 ? actionLoadingV2 : actionLoading;

  useEffect(() => {
    if (!data) return;
    const hasNodeId = !!data.nodeId;
    const shouldUseStartNode = !hasNodeId;

    setListNextNode(shouldUseStartNode ? startNodeData : nextNodeData);
  }, [data, startNodeData, nextNodeData]);

  useEffect(() => {
    if (actionDataMerged && data && UserInfo) {
      setButtonStatus({
        canTransfer: actionDataMerged.canTransfer === "ENABLE",
        canDone: actionDataMerged.canDone === "ENABLE",
        canClose: actionDataMerged.canClose === "ENABLE",
        canDelete: actionDataMerged.canDelete === "ENABLE",
        canEdit: actionDataMerged.canEdit === "ENABLE" || checkUserAssign(),
        canRevoke: actionDataMerged.canRevoke === "ENABLE",
        canTodo: actionDataMerged.canTodo === "ENABLE",
        canReject: actionDataMerged.canReject === "ENABLE",
        canRejectApprove: actionDataMerged.canRejectApprove === "ENABLE",
        canRevokeFinish: actionDataMerged.canRevokeFinish === "ENABLE",
        canRestore: actionDataMerged.canRestore === "ENABLE",
        canAddTransfer: actionDataMerged.canAddTransfer === "ENABLE",
      });

      setIsExecute(actionDataMerged.isExecute);
    }
  }, [actionDataMerged, data, UserInfo]);

  const handleEditClick = () => {
    if (isEditing) {
      setIsEditing(false);
    } else {
      setIsEditing(true);
      onEdit?.();
    }
  };

  const handleTransferClick = (node: any, type: boolean) => {
    Bpmn2Service.currentSelectedNodeID = node.id;
    Bpmn2Service.currentNodeOrg = [];
    Bpmn2Service.currentNodeUser = [];
    if (node.conditions) {
      node.conditions.forEach((condition: any) => {
        if (condition.orgId !== null && condition.userId === null) {
          Bpmn2Service.currentNodeOrg.push({
            org: condition.orgId,
            pos: condition.positionId,
          });
        }
        if (condition.userId !== null) {
          Bpmn2Service.currentNodeUser.push(condition.userId);
        }
      });
    }
    setSelectedNodeId(node.id);
    setIsAddTransfer(type);
    setOpenTransferDialog(true);
  };

  const handleSubmit = async () => {
    const formData = form.getValues();

    const submitPayload = {
      id: formData.id || data?.id || 0,
      createDate: data?.createDate || Date.now(),
      taskName: formData.taskName || "",
      status: formData.status ?? data?.status ?? 1,
      startDate: formData.startDate
        ? new Date(formData.startDate).getTime()
        : data?.startDate || Date.now(),
      endDate: formData.endDate
        ? new Date(formData.endDate).getTime()
        : data?.endDate || Date.now(),
      progress: formData.progress || data?.progress || 0,
      important: formData.important || data?.important || false,
      description: formData.description || "",
      taskFieldId: formData.taskFieldId || data?.taskFieldId || 0,
      priorityId: formData.priorityId || data?.priorityId || 0,
      codeTask: formData.codeTask || data?.codeTask || "",
      approveStatus: formData.approveStatus || data?.approveStatus || 1,
      userAssignId: formData.userAssignId || data?.userAssignId || 0,
      orgId: formData.orgId || data?.orgId || 0,
      taskCombination: data?.taskCombination || null,
      userExcutePrimaryId:
        formData.userExcutePrimaryId || data?.userExcutePrimaryId || 0,
      taskExecute: data?.taskExecute || null,
      taskDocument: transformTaskDocument(
        formData.taskDocument || data?.taskDocument || []
      ),
      userFollows:
        formData.userFollows !== undefined && formData.userFollows !== null
          ? formData.userFollows
          : data?.userFollows || [],
      parentId: formData.parentId || data?.parentId || null,
      taskCombinationStatus:
        formData.taskCombinationStatus || data?.taskCombinationStatus || 0,
      attachments: formData.attachments || data?.attachments || [],
      taskRelateds: transformTaskRelateds(
        formData.taskRelateds || data?.taskRelateds || []
      ),
      listDocOutReply: data?.listDocOutReply || [],
      weList: data?.weList || [],
      subTasks: formData.subTasks || data?.subTasks || [],
      weListId: formData.weListId || data?.weListId || [],
      jobAssignerId:
        formData.jobAssignerId &&
        !Array.isArray(formData.jobAssignerId) &&
        formData.jobAssignerId !== 0 &&
        formData.jobAssignerId !== null
          ? [formData.jobAssignerId.toString()]
          : ["0"],
      subTask: data?.subTask || null,
      taskHistorys: data?.taskHistorys || [],
      nextNode: data?.nextNode || null,
      complexityId: formData.complexityId || data?.complexityId || null,
      nodeId: formData.nodeId || data?.nodeId || null,
      fieldName: formData.fieldName || data?.fieldName || "",
      userAssignName: formData.userAssignName || data?.userAssignName || "",
      priorityName: formData.priorityName || data?.priorityName || "",
      complexityName: formData.complexityName || data?.complexityName || "",
      parentName: data?.parentName || "",
      ...(data?.parent ? { parent: data.parent } : {}),
    };

    console.log(submitPayload);

    try {
      const selectedTaskFiles = formData.attachments || [];
      let processedFiles = false;

      if (selectedTaskFiles.length > 0) {
        const encryptArr = await uploadFileService.filterFile(
          selectedTaskFiles,
          "encrypt",
          OBJ_TYPE.GIAO_VIEC
        );

        const nonEncryptArr = await uploadFileService.filterFile(
          selectedTaskFiles,
          "",
          OBJ_TYPE.GIAO_VIEC
        );

        if (encryptArr.length > 0) {
          const connect = await EncryptionService.checkConnect();
          if (connect === false) {
            console.error("Không thể kết nối đến service mã hóa");
            return;
          }

          const encryptResult = await EncryptionService.doEncryptExecute(
            encryptArr as File[],
            submitPayload.id,
            "GIAO_VIEC"
          );

          if (encryptResult === false) {
            console.error("Mã hóa file thất bại");
            return;
          }
        }

        if (nonEncryptArr.length > 0) {
          await saveTaskAttachmentMutation.mutateAsync({
            taskId: submitPayload.id,
            files: nonEncryptArr as File[],
          });

          nonEncryptArr.forEach((item: any, i: number) => {
            if (item.id && !item.docId && item.template) {
              DocumentInService.updateTemplateToDoc(
                Constant.TYPE_TEMPLATE.GIAO_VIEC,
                item.id,
                submitPayload.id.toString()
              );
            }
          });
        }
        processedFiles = true;
      }

      await updateTaskMutation.mutateAsync(submitPayload);

      setIsEditing(false);
      onSave?.(submitPayload);
    } catch (error) {
      handleError(error);
    }
  };

  const newDraftDocument = () => {
    router.push(`/document-in/draft-list/draft-insert?taskId=${data?.id}`);
  };

  const getListChildByOrgId = async () => {
    try {
      if (listOrgId) {
        const data =
          type == 1
            ? await getOrgInformationMutation.mutateAsync({ orgId: listOrgId })
            : await getInfoUsersMutation.mutateAsync({ listUserId: listOrgId });
        setListOrgChild(data.filter((item: any) => item.id !== handlerId));
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleTransferUnit = async (orgId: any) => {
    try {
      const result = await transferUnitMutation.mutateAsync({
        taskId: data?.id,
        fromStatus: data?.status,
        toStatus: 0,
        frUserId: handlerId || 0,
        toUserId: orgId,
        type: type || 0,
      });
      if (result) {
        ToastUtils.success("Chuyển đơn vị thành công");
        onGoBack?.();
      }
    } catch (error) {
      handleError(error);
    }
  };

  return (
    <div className="w-full lg:w-2/3 mt-4">
      <Card className="border-none rounded-none">
        <CardHeader className="p-0">
          <div className="flex justify-between items-center bg-gray-100 p-4 rounded-none">
            <CardTitle className="text-lg font-semibold text-blue-600">
              Thông tin chi tiết
            </CardTitle>
            <div className="flex gap-2 flex-wrap">
              {UserInfo?.lead && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={onGiaoViec}
                  className="bg-blue-500 text-white hover:bg-blue-600 hover:text-white"
                >
                  <Plus className="w-4 h-4" />
                  Giao việc
                </Button>
              )}

              {listOrgChild && listOrgChild.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-blue-500 text-white hover:bg-blue-600 hover:text-white"
                    >
                      <Redo2 className="w-4 h-4" />
                      {type === 1 ? "Chuyển đơn vị" : "Chuyển người dùng"}
                      <ChevronDown className="w-4 h-4 ml-1" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    {listOrgChild.map((item: any, index: number) => (
                      <DropdownMenuItem
                        key={index}
                        onClick={() => handleTransferUnit(item.id)}
                      >
                        {type === 1 ? (
                          <Building className="w-4 h-4" />
                        ) : (
                          <User className="w-4 h-4" />
                        )}
                        {item.name}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSubmit}
                  className="bg-blue-500 text-white hover:bg-blue-600 hover:text-white"
                >
                  <Save className="w-4 h-4" />
                  Lưu
                </Button>
              ) : (
                buttonStatus.canEdit &&
                isCheckUserEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleEditClick}
                    className="bg-blue-500 text-white hover:bg-blue-600 hover:text-white"
                  >
                    <Save className="w-4 h-4" />
                    Sửa
                  </Button>
                )
              )}

              {!isEditing && buttonStatus.canDelete && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsOpenConfirmDeleteDialog(true)}
                  className="bg-red-500 text-white hover:bg-red-600 hover:text-white"
                >
                  <Trash className="w-4 h-4" />
                  Xóa
                </Button>
              )}

              {/* Transfer Button */}
              {buttonStatus.canTransfer && (
                <div className="inline-block">
                  {nodeStart && nodeStart.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          className="bg-blue-500 text-white hover:bg-blue-600 mr-1"
                        >
                          <Redo2 className="w-4 h-4" />
                          Chuyển xử lý
                          <ChevronDown className="w-4 h-4 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {nodeStart.map((node: any, index: number) => (
                          <DropdownMenuItem
                            key={index}
                            onClick={() =>
                              handleTransferClick(node, !isExecute)
                            }
                          >
                            {node.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  {listNextNode && listNextNode.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          className="bg-blue-500 text-white hover:bg-blue-600 mr-1"
                        >
                          <Redo2 className="w-4 h-4" />
                          Chuyển xử lý
                          <ChevronDown className="w-4 h-4 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {listNextNode.map((node: any, index: number) => (
                          <DropdownMenuItem
                            key={index}
                            onClick={() =>
                              handleTransferClick(node, !isExecute)
                            }
                          >
                            {node.name || "Chưa đặt tên"}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              )}

              {/* Add Transfer Button */}
              {buttonStatus.canAddTransfer && (
                <div className="inline-block">
                  {nodeStart && nodeStart.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          className="bg-blue-600 text-white hover:bg-blue-700 hover:text-white mr-1"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Bổ sung xử lý
                          <ChevronDown className="w-4 h-4 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {nodeStart.map((node: any, index: number) => (
                          <DropdownMenuItem
                            key={index}
                            onClick={() => handleTransferClick(node, true)}
                          >
                            {node.name}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  {listNextNode && listNextNode.length > 0 && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          className="bg-blue-500 text-white hover:bg-blue-600 mr-1"
                        >
                          <RefreshCw className="w-4 h-4" />
                          Bổ sung xử lý
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {listNextNode.map((node: any, index: number) => (
                          <DropdownMenuItem
                            key={index}
                            onClick={() => handleTransferClick(node, true)}
                          >
                            {node.name || "Chưa đặt tên"}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              )}

              {buttonStatus.canTodo && (
                <Button
                  size="sm"
                  onClick={() => onTodo?.(data?.id, 1)}
                  className="bg-blue-500 text-white hover:bg-blue-600 hover:text-white"
                >
                  <Check className="w-4 h-4" />
                  Tiếp nhận
                </Button>
              )}

              {buttonStatus.canClose && (
                <Button
                  size="sm"
                  onClick={() => onClose?.(data?.id, 4)}
                  className="bg-blue-500 text-white hover:bg-blue-600 hover:text-white"
                >
                  <Check className="w-4 h-4" />
                  Đóng việc
                </Button>
              )}

              {buttonStatus.canReject && (
                <Button
                  size="sm"
                  onClick={() => onReject?.(data?.id, 2)}
                  className="bg-red-500 text-white hover:bg-red-600 hover:text-white"
                >
                  <X className="w-4 h-4" />
                  Từ chối
                </Button>
              )}

              {buttonStatus.canDone && (
                <Button
                  size="sm"
                  onClick={() => onComplete?.(data?.id, 3)}
                  className="bg-green-500 text-white hover:bg-green-600 hover:text-white"
                >
                  <CheckCircle className="w-4 h-4" />
                  Hoàn thành
                </Button>
              )}

              {buttonStatus.canRevokeFinish && (
                <Button
                  size="sm"
                  onClick={() => onRevokeFinish?.(data?.id, 1)}
                  className="bg-yellow-500 text-white hover:bg-yellow-600 hover:text-white"
                >
                  <LogIn className="w-4 h-4" />
                  Thu hồi hoàn thành
                </Button>
              )}

              {buttonStatus.canRevoke && (
                <Button
                  size="sm"
                  onClick={() => onRevoke?.(data?.id, 5)}
                  className="bg-yellow-500 text-white hover:bg-yellow-600 hover:text-white"
                >
                  <LogIn className="w-4 h-4" />
                  Thu hồi
                </Button>
              )}

              {buttonStatus.canRestore && (
                <Button
                  size="sm"
                  onClick={() => onRestore?.(data?.id, 0)}
                  className="bg-yellow-500 text-white hover:bg-yellow-600 hover:text-white"
                >
                  <RotateCcw className="w-4 h-4" />
                  Khôi phục
                </Button>
              )}

              {buttonStatus.canRejectApprove && (
                <Button
                  size="sm"
                  onClick={() => onRejectApprove?.(data?.id, 6)}
                  className="bg-red-500 text-white hover:bg-red-600 hover:text-white"
                >
                  <X className="w-4 h-4" />
                  Từ chối duyệt
                </Button>
              )}

              {Constant.BTN_NEW_DRAFT_FROM_DOC_IN_DETAIL_H05 && isEditing && (
                <Button
                  size="sm"
                  onClick={newDraftDocument}
                  className="bg-blue-500 text-white hover:bg-blue-600 hover:text-white"
                >
                  <Plus className="w-4 h-4" />
                  Thêm mới dự thảo
                </Button>
              )}

              <Button
                variant="secondary"
                size="sm"
                onClick={onGoBack}
                className="bg-gray-500 text-white hover:bg-gray-600"
              >
                <ArrowLeft className="w-4 h-4" />
                Quay lại
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <TaskBasicInfoSection
              data={data}
              isEditing={isEditing}
              checkUserAssign={checkUserAssign}
              onSelectUser={onSelectUser}
              form={form}
              isV2={isV2}
            />
            <div className="space-y-4 mt-4">
              <TaskFollowSection
                data={data}
                isEditing={isEditing}
                checkUserAssign={checkUserAssign}
                form={form}
                taskId={taskId}
                isV2={isV2}
              />

              <TaskTagsSection
                data={data}
                isEditing={isEditing}
                checkUserAssign={checkUserAssign}
                form={form}
              />

              <TaskAttachmentsSection
                data={data}
                isEditing={isEditing}
                checkUserAssign={checkUserAssign}
                form={form}
                isV2={isV2}
              />

              {!isV2 && (
                <TaskRelationsSection
                  data={data}
                  isEditing={isEditing}
                  checkUserAssign={checkUserAssign}
                  form={form}
                  UserInfo={UserInfo}
                  isV2={isV2}
                />
              )}

              {!isV2 && (
                <TaskDocumentsSection
                  data={data}
                  isEditing={isEditing}
                  checkUserAssign={checkUserAssign}
                  form={form}
                />
              )}

              {data?.listDocOutReply?.length > 0 && (
                <div className="col-span-full">
                  <div className="space-y-2">
                    <Label className="text-md font-medium">
                      Danh sách văn bản đi trả lời
                    </Label>
                    <Table
                      columns={docOutReplyColumns}
                      dataSource={data.listDocOutReply.map(
                        (doc: any, index: number) => ({
                          no: index + 1,
                          preview: (
                            <a
                              href={`/document-in/search/draft-detail/${doc.id}`}
                              className="text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {doc.preview}
                            </a>
                          ),
                          status: (
                            <Badge variant="outline">{doc.statusName}</Badge>
                          ),
                        })
                      )}
                      showPagination={false}
                      emptyText="Không có văn bản đi trả lời"
                      className="task-monitor-table"
                    />
                  </div>
                </div>
              )}
            </div>
          </Form>
        </CardContent>
      </Card>

      <RecipientInformation taskId={taskId} isV2={isV2} />

      <TaskTransferModal
        visible={openTransferDialog}
        onClose={() => setOpenTransferDialog(false)}
        taskId={taskId}
        nodeId={selectedNodeId || 0}
        taskAdd={data}
        showCanAddTransfer={isAddTransfer}
        callback={() => {
          if (isV2) {
            queryClient.invalidateQueries({
              queryKey: [queryKeys.taskv2.getFindByIdTask, taskId],
            });
          } else {
            queryClient.invalidateQueries({
              queryKey: [queryKeys.task.getFindByIdTask, taskId],
            });
          }
        }}
        isV2={isV2}
      />

      <ConfirmDeleteDialog
        isOpen={isOpenConfirmDeleteDialog}
        onOpenChange={setIsOpenConfirmDeleteDialog}
        onConfirm={onDelete || (() => {})}
        description="Bạn chắc chắn muốn xóa công việc này?"
        confirmText="Đồng ý"
        cancelText="Đóng"
      />
    </div>
  );
}
