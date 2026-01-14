import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Users,
  X,
  ChevronDown,
  ChevronRight,
  Plus,
  User,
  Paperclip,
  File as FileIcon,
  Eye,
  KeyRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  TableBase,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  CustomDialogContent,
  Dialog,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { CustomDatePicker } from "@/components/ui/calendar";
import { useGetCategoriesByCode } from "@/hooks/data/category.data";
import { Constant } from "@/definitions/constants/constant";
import {
  useAttachTaskAssign,
  useDoAddTransfer,
  useGetJobAssignerList,
  useSaveTaskAssign,
} from "@/hooks/data/task.data";
import FollowerDialog from "../dialogs/FollowerDialog";
import {
  OrgNode,
  Node,
  TaskExecute,
  TaskExecuteResponse,
  TaskAssignCreate,
  UserFollower,
  TaskDocument,
  FileLike,
} from "@/definitions/types/task-assign.type";
import SelectCustom from "../common/SelectCustom";
import { Bpmn2Service } from "@/services/bpmn2.service";
import TaskTransferModal from "../task/TaskTransferModal";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RelatedWorkDialog } from "./RelatedWorkDialog";
import { AttachedDocumentDialog } from "./AttachedDocumentDialog";
import { AttachedDocument } from "@/definitions/types/document-out.type";
import { ToastUtils } from "@/utils/toast.utils";
import { notificationService } from "@/services/notification.service";
import { uploadFileService } from "@/services/file.service";
import { ATTACHMENT_DOWNLOAD_TYPE } from "@/definitions/constants/common.constant";
import {
  canViewNoStatus,
  handleError,
  isExistFile,
  validFileSSize,
} from "@/utils/common.utils";
import TemplateDialog from "@/components/work-assign/TemplateDialog";
import ChangeFilenameDialog from "@/components/work-assign/ChangeFilenameDialog";
import { formatDateYMD, parseDateStringYMD } from "@/utils/datetime.utils";
import { useGetAllUserByLead2 } from "@/hooks/data/user.data";
// --- Types ---
export type WorkAssignDialogProps = {
  open?: boolean;
  onClose?: () => void;
  onAssign: (data: TaskExecuteResponse) => void;
  isAddChildTask?: boolean;
  parentTaskFromDetail?: any;
  title?: string;
  type?: string;
  isV2?: boolean;
};

type ValidFileAttr = {
  validFiles: boolean;
  isValidFileSize: boolean;
  isValidExtension: boolean;
  isValidNumberOfFiles: boolean;
  currentNumberOfFiles: number;
};

// File constants
const ALLOWED_FILE_EXTENSION = Constant.ALLOWED_FILE_EXTENSION;
const MAX_FILES_UPLOAD = Constant.MAX_FILES_UPLOAD;
const ENCRYPTION_TWD = Constant.ENCRYPTION_TWD;

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

const defaultAssignForm: TaskAssignCreate = {
  taskName: "",
  description: "",
  priorityId: 0,
  userAssign: null,
  approveStatus: 0,
  status: 0,
  progress: 0,
  taskFieldId: 165, //hardcoded like angular, backend ignored this field
  parentId: null,
  subTasks: [],
  taskRelateds: [],
  taskDocument: [],
  userFollows: [],
  jobAssignerId: [],
  startDateNgb: {
    year: null,
    month: null,
    day: null,
  },
  endDateNgb: {
    year: null,
    month: null,
    day: null,
  },
  userExcute: {
    birthdayTmp: {
      year: null,
      month: null,
      day: null,
    },
    positionModel: null,
  },
  priority: null,
  orgId: null,
  field: null,
  taskExecute: [],
  docAtt: [],
  attachments: [],
  listDocOutReply: [],
  weListId: [],
  parent: [],
  complexityId: null,
  startDate: getTodayDate(),
  endDate: getTodayDate(),
  userAssignId: 0,
};

const WorkAssignDialog: React.FC<WorkAssignDialogProps> = ({
  open = false,
  onClose = () => {},
  onAssign = () => {},
  isAddChildTask = false,
  parentTaskFromDetail,
  title,
  type,
  isV2 = false,
}) => {
  // Form state
  const [assignForm, setAssignForm] =
    useState<TaskAssignCreate>(defaultAssignForm);

  const [assignee, setAssignee] = useState<TaskExecute[] | null>(null);
  const [assigneeName, setAssigneeName] = useState<string>("");

  const [isUpperLevelWorkCollapsed, setIsUpperLevelWorkCollapsed] =
    useState(false);
  const [isLowerLevelWorkCollapsed, setIsLowerLevelWorkCollapsed] =
    useState(false);
  const [isRelatedWorkCollapsed, setIsRelatedWorkCollapsed] = useState(false);
  const [isAttachedFilesCollapsed, setIsAttachedFilesCollapsed] =
    useState(false);
  const [isAttachedDocumentsCollapsed, setIsAttachedDocumentsCollapsed] =
    useState(false);

  // File attachment states
  const [attachedFiles, setAttachedFiles] = useState<FileLike[]>([]);
  const [currentSelectedFileType, setCurrentSelectedFileType] = useState<
    string | undefined
  >(undefined);
  const [validFileAttr, setValidFileAttr] = useState<ValidFileAttr>({
    validFiles: true,
    isValidFileSize: true,
    isValidExtension: true,
    isValidNumberOfFiles: true,
    currentNumberOfFiles: 0,
  });
  const [isOpenFollowerDialog, setIsOpenFollowerDialog] =
    useState<boolean>(false);
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [selectedFollower, setSelectedFollower] = useState<string>("");
  const [isTransferModalOpen, setIsTransferModalOpen] =
    useState<boolean>(false);
  const [nodes, setNodes] = useState<Node[]>([]);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [showCanAddTransfer, setShowCanAddTransfer] = useState(false);
  const [isNodesPopoverOpen, setIsNodesPopoverOpen] = useState(false);

  const [isOpenUpperLevelWorkDialog, setIsOpenUpperLevelWorkDialog] =
    useState<boolean>(false);
  const [isOpenLowerLevelWorkDialog, setIsOpenLowerLevelWorkDialog] =
    useState<boolean>(false);
  const [isOpenRelatedWorkDialog, setIsOpenRelatedWorkDialog] =
    useState<boolean>(false);
  const [upperLevelWorkData, setUpperLevelWorkData] = useState<
    TaskExecuteResponse[]
  >([]);
  const [lowerLevelWorkData, setLowerLevelWorkData] = useState<
    TaskExecuteResponse[]
  >([]);
  const [relatedWorkData, setRelatedWorkData] = useState<TaskExecuteResponse[]>(
    []
  );

  const [isOpenAttachedDocumentDialog, setIsOpenAttachedDocumentDialog] =
    useState<boolean>(false);
  const [attachedDocumentData, setAttachedDocumentData] = useState<
    AttachedDocument[]
  >([]);
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] =
    useState<boolean>(false);
  const [isChangeFilenameDialogOpen, setIsChangeFilenameDialogOpen] =
    useState<boolean>(false);
  const [selectedTemplateForRename, setSelectedTemplateForRename] =
    useState<FileLike | null>(null);

  // Encrypt logic
  const handleEncryptFile = useCallback((file: FileLike, index: number) => {
    if (!(file.id && file.oEncrypt)) {
      setAttachedFiles((prev) => {
        const updatedFiles = [...prev];
        updatedFiles[index] = {
          ...updatedFiles[index],
          encrypt: !updatedFiles[index].encrypt,
        };
        return updatedFiles;
      });
    }
  }, []);

  const UserInfo = useMemo(() => {
    if (typeof window === "undefined") return {};
    return JSON.parse(localStorage.getItem("userInfo") || "{}");
  }, []);

  const { data: allUserByLeadData } = useGetAllUserByLead2();

  // Tạo initialFollowers từ UserInfo
  const initialFollowers = useMemo(() => {
    if (!UserInfo || !UserInfo.id) return [];
    const initialFollowers = allUserByLeadData
      ?.filter((item: any) => item.orgId === 2 || item.isPermissionViewAll)
      .map((item: any) => {
        return {
          user: {
            id: item.id,
            fullName: item.fullName,
            parentId: item.parentId,
            positionName: item.positionName,
            orgName: item.orgName,
          },
          type: 0,
          isExcute: false,
          isCombination: false,
          status: 0,
          userId: item.id,
          id: item.id,
          taskId: item.taskId,
          description: null,
        };
      });
    setSelectedFollower(
      initialFollowers?.map((item: any) => item?.user?.fullName).join(", ") ??
        ""
    );
    setAssignForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        userFollows: initialFollowers,
      };
    });
    return initialFollowers;
  }, [allUserByLeadData]);

  const orgId = useMemo(() => {
    if (!UserInfo) return 0;

    const userAssign = UserInfo;
    const currentRole = userAssign.currentRole;

    // LĐ Ban (role 58) hoặc Lãnh đạo ĐV (role 59)
    if (currentRole === 58 || currentRole === 59) {
      return userAssign.org;
    }

    return userAssign.orgModel?.parentId || 0;
  }, [UserInfo]);

  const isLBC = useMemo(() => {
    if (!UserInfo) return false;

    const userAssign = UserInfo;

    if (
      !userAssign ||
      !userAssign.authoritys ||
      userAssign.authoritys.length === 0
    )
      return false;

    return !!userAssign.authoritys.find(
      (item: any) => item.authority === "LEADERSHIP"
    );
  }, [UserInfo]);

  // Use query
  const { data: complexityCategoryData } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.COMPLEXITY
  );
  const { data: priorityCategoryData } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.PRIORITY
  );
  const { data: taskFieldCategoryData } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.TASK_FIELD
  );
  const { data: jobAssignerListData } = useGetJobAssignerList(orgId);

  const { mutate: doSaveTaskAssign } = useSaveTaskAssign(isV2 ?? false);
  const { mutate: doAttachTaskAssign } = useAttachTaskAssign(isV2 ?? false);
  const { mutate: doAddTransfer } = useDoAddTransfer(isV2 ?? false);
  // File handling functions
  const doCheckFileExtension = useCallback((files: FileList) => {
    const exts = (s: string) =>
      s
        .split(",")
        .map((x) => x.trim().toLowerCase())
        .filter(Boolean);
    const docExts = exts(ALLOWED_FILE_EXTENSION);

    for (const file of Array.from(files)) {
      const dot = file.name.lastIndexOf(".");
      const ext = dot >= 0 ? file.name.slice(dot).toLowerCase() : "";
      if (!docExts.includes(ext)) return false;
    }
    return true;
  }, []);

  const validateNumberOfFileUpload = useCallback(
    (
      selectedFiles: FileLike[] | undefined,
      currentUploaded: FileList,
      isRemove: boolean
    ) => {
      const selectedSize = selectedFiles ? selectedFiles.length : 0;
      if (!isRemove) {
        if (selectedSize + currentUploaded.length > MAX_FILES_UPLOAD) {
          setValidFileAttr((v) => ({ ...v, isValidNumberOfFiles: false }));
          return false;
        }
      } else if ((selectedFiles?.length ?? 0) < MAX_FILES_UPLOAD) {
        setValidFileAttr((v) => ({ ...v, isValidNumberOfFiles: true }));
        return true;
      }
      return true;
    },
    []
  );

  const doSelectFiles = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.currentTarget.files;
      setCurrentSelectedFileType("attachment");
      setValidFileAttr((v) => ({
        ...v,
        currentNumberOfFiles: v.currentNumberOfFiles + (files?.length ?? 0),
      }));

      if (!files || files.length === 0) return;

      if (!doCheckFileExtension(files)) {
        setValidFileAttr((v) => ({
          ...v,
          isValidExtension: false,
          validFiles: false,
        }));
        e.currentTarget.value = "";
        return;
      }

      if (!validFileSSize(files)) {
        setValidFileAttr((v) => ({
          ...v,
          isValidFileSize: false,
          validFiles: false,
        }));
        e.currentTarget.value = "";
        return;
      }

      if (!validateNumberOfFileUpload(attachedFiles, files, false)) return;

      // Passed all validation
      setValidFileAttr({
        validFiles: true,
        isValidFileSize: true,
        isValidExtension: true,
        isValidNumberOfFiles: true,
        currentNumberOfFiles: (attachedFiles?.length ?? 0) + files.length,
      });

      // Merge files without duplicates
      const nextArr: FileLike[] = attachedFiles ? [...attachedFiles] : [];
      for (const f of Array.from(files)) {
        if (!isExistFile(f.name, nextArr)) {
          const fileLike: FileLike = {
            name: f.name,
            size: f.size,
            type: f.type,
            lastModified: f.lastModified,
            encrypt: false,
            oEncrypt: false,
            file: f,
          };
          nextArr.push(fileLike);
        }
      }

      e.currentTarget.value = "";
      setAttachedFiles(nextArr);
    },
    [attachedFiles, doCheckFileExtension, validateNumberOfFileUpload]
  );

  const removeFile = useCallback(
    (index: number) => {
      const next = attachedFiles.slice();
      if (index >= 0 && index < next.length) {
        next.splice(index, 1);
        setAttachedFiles(next);

        setValidFileAttr((v) => ({
          ...v,
          currentNumberOfFiles: Math.max(0, v.currentNumberOfFiles - 1),
        }));

        validateNumberOfFileUpload(next, new DataTransfer().files, true);
      }
    },
    [attachedFiles, validateNumberOfFileUpload]
  );

  const viewFile = useCallback((file: FileLike) => {
    try {
      const blobLike = new File([file as any], file.name, {
        type: file.type,
        lastModified: file.lastModified,
      });
      (blobLike as any).encrypt = false;
      uploadFileService.viewFile(blobLike, ATTACHMENT_DOWNLOAD_TYPE.TASK);
    } catch {
      uploadFileService.viewFile(file, ATTACHMENT_DOWNLOAD_TYPE.TASK);
    }
  }, []);

  const downloadFile = useCallback((name?: string, encrypt?: boolean) => {
    if (!name) return;
    uploadFileService.downloadFile(
      name,
      ATTACHMENT_DOWNLOAD_TYPE.TASK,
      encrypt
    );
  }, []);

  // Template selection function
  const selectTemplate = useCallback(() => {
    setIsTemplateDialogOpen(true);
  }, []);

  const handleSelectTemplate = useCallback(
    (template: FileLike) => {
      // Check for duplicate names only if file exists in current list
      const existingFile = attachedFiles.find((f) => f.name === template.name);
      if (existingFile) {
        // Show rename dialog
        setSelectedTemplateForRename(template);
        setIsChangeFilenameDialogOpen(true);
        setIsTemplateDialogOpen(false);
        return;
      }

      // Add template to attached files
      const templateWithFlag = { ...template, template: true };
      setAttachedFiles((prev) => [...prev, templateWithFlag]);
      setIsTemplateDialogOpen(false);
    },
    [attachedFiles]
  );

  const handleRenameConfirm = useCallback(
    (newFileName: string) => {
      if (selectedTemplateForRename) {
        const extension = selectedTemplateForRename.name.split(".").pop();
        const newName = `${newFileName}.${extension}`;
        const renamedTemplate = {
          ...selectedTemplateForRename,
          name: newName,
          displayName: newFileName,
          template: true,
        };
        setAttachedFiles((prev) => [...prev, renamedTemplate]);
      }
      setIsChangeFilenameDialogOpen(false);
      setSelectedTemplateForRename(null);
    },
    [selectedTemplateForRename]
  );

  const handleRenameCancel = useCallback(() => {
    if (selectedTemplateForRename) {
      const templateWithFlag = { ...selectedTemplateForRename, template: true };
      setAttachedFiles((prev) => [...prev, templateWithFlag]);
    }
    setIsChangeFilenameDialogOpen(false);
    setSelectedTemplateForRename(null);
  }, [selectedTemplateForRename]);

  const isView = useCallback(
    (file: FileLike) => !!file && canViewNoStatus(file.name) && !file.oEncrypt,
    []
  );

  // Reset dates to today when dialog opens
  useEffect(() => {
    if (open) {
      const today = getTodayDate();
      setAssignForm((prev) => ({
        ...prev,
        startDate: today,
        endDate: today,
      }));
    }
  }, [open]);

  useEffect(() => {
    setAssignForm((prev) => {
      if (!prev) return prev;
      if (upperLevelWorkData && upperLevelWorkData.length > 0) {
        return {
          ...prev,
          parentId: upperLevelWorkData[0].id,
        };
      } else {
        return {
          ...prev,
          parentId: null,
        };
      }
    });
  }, [upperLevelWorkData]);

  useEffect(() => {
    setAssignForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        subTasks:
          lowerLevelWorkData && lowerLevelWorkData.length > 0
            ? lowerLevelWorkData
            : [],
      };
    });
  }, [lowerLevelWorkData]);

  useEffect(() => {
    setAssignForm((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        taskRelateds:
          relatedWorkData && relatedWorkData.length > 0 ? relatedWorkData : [],
      };
    });
  }, [relatedWorkData]);

  useEffect(() => {
    if (attachedDocumentData && attachedDocumentData.length > 0) {
      const taskDocument: TaskDocument[] = [];
      const tmpDocument: AttachedDocument[] = [...attachedDocumentData];
      tmpDocument.forEach((document) => {
        taskDocument.push({
          docId: document.id,
          typeDocument: document.docTypeName === "Văn bản đến",
          documentIn: document,
        });
      });
      setAssignForm((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          taskDocument:
            taskDocument && taskDocument.length > 0 ? taskDocument : [],
        };
      });
    } else {
      setAssignForm((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          taskDocument: [],
        };
      });
    }
  }, [attachedDocumentData]);

  // Handle parent task when opening modal with parentTaskFromDetail
  useEffect(() => {
    if (open && parentTaskFromDetail) {
      setAssignForm((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          parent: [],
          parentId: parentTaskFromDetail?.id || null,
        };
      });
    } else if (open && !parentTaskFromDetail) {
      setAssignForm((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          parent: [],
          parentId: null,
        };
      });
    }
  }, [open, parentTaskFromDetail, isAddChildTask]);

  const handleSubmit = () => {
    const updatedAssignForm = {
      ...assignForm,
      approveStatus: 1,
      userAssignId: UserInfo.id,
      orgId: orgId,
      status: 0,
      progress: 0,
    };
    doSaveTaskAssign(
      {
        payload: updatedAssignForm as TaskAssignCreate,
      },
      {
        onSuccess: (res) => {
          // Convert res to TaskExecuteResponse
          const taskResponse = res as TaskExecuteResponse;
          const taskId = taskResponse.id;
          const files: File[] = [];
          attachedFiles.forEach((file) => {
            if (file.file) files.push(file.file);
          });
          const filesUpload = {
            files: files,
            type: 1,
          };
          doAttachTaskAssign({
            payload: filesUpload,
            id: taskId,
          });
          if (selectedNode?.id && assignee && assignee.length > 0) {
            doAddTransfer({
              taskId: taskId,
              payload: {
                nodeId: selectedNode?.id || 0,
                taskExecutes: assignee,
                taskHistory: null,
              },
            });
          }

          ToastUtils.saveTaskAssignSuccess();
          notificationService.countUnreadNotification();
          onAssign(taskResponse);
          setAttachedFiles([]);
          setSelectedFollower("");
          setAssignee(null);
          setAssigneeName("");
          setUpperLevelWorkData([]);
          setLowerLevelWorkData([]);
          setRelatedWorkData([]);
          setAttachedDocumentData([]);
          setAssignForm(defaultAssignForm);
          setSelectedNode(null);
          onClose();
        },
        onError: (error) => {
          handleError(error);
        },
      }
    );
  };

  const orgNodeToUserFollower = (node: OrgNode): UserFollower => {
    return {
      user: {
        id: node.id,
        fullName: node.name,
        orgName: node.orgName ?? null,
        parentId: node.parentId ? Number(node.parentId) : null,
        positionName: node.positionName ?? null,
      },
      taskId: null,
      userId: node.id,
      id: node.id,
      description: node.description ?? null,
      isCombination: node.isCombination ?? false,
      isExcute: node.isExcute ?? false,
      type: node.type === "USER" ? "0" : "1",
      status: 0,
    };
  };

  const doFollowerTask = (followers: OrgNode[]) => {
    if (!followers || followers.length === 0) {
      setSelectedFollower("");
      setAssignForm((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          userFollows: [],
        };
      });
    } else {
      let followerName = "";
      const followerList: UserFollower[] = [];
      followers.forEach((follower: OrgNode) => {
        followerName += follower.name + ", ";
        followerList.push(orgNodeToUserFollower(follower));
      });
      followerName = followerName.replace(/,\s*$/, "");
      setSelectedFollower(followerName);
      setAssignForm((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          userFollows: followerList,
        };
      });
    }
  };

  const doAssignee = (assignees: TaskExecute[]) => {
    setAssignee(assignees);
    let assigneeName = "";
    assignees.forEach((assignee) => {
      if (assignee.type === 2) {
        assigneeName += (assignee.org?.name ?? "") + ", ";
      } else if (assignee.type === 0) {
        assigneeName += (assignee.user?.fullName ?? "") + ", ";
      }
    });
    assigneeName = assigneeName.trimEnd().replace(/,\s*$/, "");
    setAssigneeName(assigneeName);
  };

  const loadNodes = async (type: boolean) => {
    setShowCanAddTransfer(type);
    await Bpmn2Service.getStartNode(Constant.THREAD_TYPE.ASSIGN).then(
      (data) => {
        setNodes(data as Node[]);
        setIsNodesPopoverOpen(true);
      }
    );
  };

  const openTransferModal = (node: Node) => {
    setSelectedNode(node);
    setIsTransferModalOpen(true);
    setIsNodesPopoverOpen(false);
  };

  const getStatusBadge = (status: string | null) => {
    if (!status) {
      return <div />;
    }
    const statusConfig = {
      "Đang thực hiện": {
        variant: "outline" as const,
        className: "text-orange-600 border-orange-200 bg-orange-50",
      },
      "Hoàn thành": {
        variant: "outline" as const,
        className: "text-green-600 border-green-200 bg-green-50",
      },
      "Hoàn thành (Chờ đánh giá)": {
        variant: "outline" as const,
        className: "text-green-600 border-green-200 bg-green-50",
      },
      "Chờ tiếp nhận": {
        variant: "outline" as const,
        className: "text-blue-600 border-blue-200 bg-blue-50",
      },
      "Mới tới": {
        variant: "outline" as const,
        className: "text-blue-600 border-blue-200 bg-blue-50",
      },
    } as const;

    const config = statusConfig[status as keyof typeof statusConfig];

    if (!config) {
      return (
        <Badge
          variant="outline"
          className="text-xs font-medium text-gray-600 border-gray-200 bg-gray-50"
        >
          {status}
        </Badge>
      );
    }

    return (
      <Badge
        variant={config.variant}
        className={`text-xs font-medium ${config.className}`}
      >
        {status}
      </Badge>
    );
  };

  // --- Render ---
  return (
    <>
      <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
        <CustomDialogContent
          className="sm:max-w-5xl max-h-[95vh] p-0 bg-gray-50"
          aria-modal="true"
          aria-label={title}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="px-4 py-3 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="p-1.5 bg-blue-100 rounded-lg">
                  <Users className="w-4 h-4 text-blue-600" aria-hidden="true" />
                </span>
                {title}
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex items-center gap-1 h-9 px-3 text-xs text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-md font-medium transition-colors"
                  aria-label="Hủy"
                >
                  <X className="w-3 h-3" aria-hidden="true" />
                  Hủy
                </Button>
                <Button
                  onClick={() => {
                    handleSubmit();
                  }}
                  className="flex items-center gap-1 h-9 px-3 text-xs bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition-colors shadow-sm hover:shadow-md"
                  aria-label="Giao việc"
                >
                  <Users className="w-3 h-3" aria-hidden="true" />
                  Giao việc
                </Button>
              </div>
            </div>
          </DialogHeader>
          <div className="p-4 space-y-4 relative max-h-[calc(95vh-56px-56px)] overflow-y-auto">
            {/* Thông tin chi tiết */}
            <Card className="p-2">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-200">
                <CardTitle className="text-lg font-bold text-gray-900">
                  Thông tin chi tiết
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-2 pt-3">
                <div>
                  <Label
                    className="text-sm font-semibold text-gray-800 mb-2 block"
                    htmlFor="taskName"
                  >
                    Tên công việc <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="taskName"
                    aria-label="Tên công việc"
                    value={assignForm?.taskName}
                    onChange={(e) =>
                      setAssignForm((prev) => ({
                        ...prev,
                        taskName: e.target.value,
                      }))
                    }
                    placeholder="Nhập tên công việc..."
                    className="min-h-[90px] resize-none bg-white border-gray-300 rounded-lg px-4 py-3 text-sm leading-relaxed focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <Label
                    className="text-sm font-semibold text-gray-800 mb-2 block"
                    htmlFor="description"
                  >
                    Mô tả <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    aria-label="Mô tả"
                    value={assignForm?.description}
                    onChange={(e) =>
                      setAssignForm((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Mô tả chi tiết về công việc..."
                    className="min-h-[90px] resize-none bg-white border-gray-300 rounded-lg px-4 py-3 text-sm leading-relaxed focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid grid-cols-1 gap-4">
                    {/* <div className="flex flex-col">
                      <Label className="text-sm font-semibold text-gray-800 mb-2">
                        Lĩnh vực công việc{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      <SelectCustom
                        options={[
                          { label: "--Chọn--", value: "0" },
                          ...(taskFieldCategoryData?.map((item) => ({
                            label: item.name,
                            value: String(item.id),
                          })) || []),
                        ]}
                        onChange={(value: string | string[]) => {
                          const valueNumber = Number(value);
                          setAssignForm((prev) => ({
                            ...prev,
                            taskFieldId: valueNumber,
                          }));
                        }}
                      />
                    </div> */}
                    <div className="flex flex-col">
                      <Label className="text-sm font-semibold text-gray-800 mb-2">
                        Nhóm công việc <span className="text-red-500">*</span>
                      </Label>
                      <SelectCustom
                        options={[
                          { label: "--Chọn--", value: "0" },
                          ...(priorityCategoryData?.map((item) => ({
                            label: item.name,
                            value: String(item.id),
                          })) || []),
                        ]}
                        onChange={(value: string | string[]) => {
                          const valueNumber = Number(value);
                          setAssignForm((prev) => ({
                            ...prev,
                            priorityId: valueNumber,
                          }));
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <Label
                      className="text-sm font-semibold text-gray-800 mb-2"
                      htmlFor="complexity"
                    >
                      Mức độ phức tạp
                    </Label>

                    <SelectCustom
                      options={[
                        { label: "--Chọn--", value: "0" },
                        ...(complexityCategoryData?.map((item) => ({
                          label: item.name,
                          value: String(item.id),
                        })) || []),
                      ]}
                      onChange={(value: string | string[]) => {
                        const valueNumber = Number(value);
                        setAssignForm((prev) => ({
                          ...prev,
                          complexityId: valueNumber,
                        }));
                      }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 [&>div]:w-full">
                  <div className="flex flex-col min-w-0">
                    <Label
                      className="text-sm font-semibold text-gray-800 mb-2"
                      htmlFor="startDate"
                    >
                      Ngày bắt đầu
                    </Label>
                    <div className="relative">
                      <CustomDatePicker
                        selected={
                          assignForm?.startDate
                            ? parseDateStringYMD(assignForm.startDate)
                            : null
                        }
                        onChange={(date) => {
                          setAssignForm((prev: any) => ({
                            ...prev,
                            startDate: formatDateYMD(date),
                          }));
                        }}
                        placeholder="dd/mm/yyyy"
                        className="h-9"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <Label
                      className="text-sm font-semibold text-gray-800 mb-2"
                      htmlFor="endDate"
                    >
                      Ngày kết thúc
                    </Label>
                    <div className="relative">
                      <CustomDatePicker
                        selected={
                          assignForm?.endDate
                            ? parseDateStringYMD(assignForm.endDate)
                            : null
                        }
                        onChange={(date) => {
                          setAssignForm((prev: any) => ({
                            ...prev,
                            endDate: formatDateYMD(date),
                          }));
                        }}
                        placeholder="dd/mm/yyyy"
                        className="h-9"
                        min={assignForm?.startDate || formatDateYMD(new Date())}
                      />
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <Label
                      className="text-sm font-semibold text-gray-800 mb-2"
                      htmlFor="assigner"
                    >
                      Người giao việc
                    </Label>
                    <div className="relative">
                      <Input
                        id="assigner"
                        aria-label="Người giao việc"
                        value={UserInfo.fullName}
                        className="h-9 bg-gray-50 border-gray-300 rounded-lg pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors w-full"
                        disabled
                        readOnly
                      />
                      <User
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col min-w-0">
                    <Label
                      className="text-sm font-semibold text-gray-800 mb-2"
                      htmlFor="directingLeader"
                    >
                      Lãnh đạo chỉ đạo
                    </Label>
                    <SelectCustom
                      options={[
                        { label: "--Chọn--", value: "0" },
                        ...(jobAssignerListData?.map((item: any) => ({
                          label: item.fullName + " --- " + item.positionName,
                          value: String(item.id),
                        })) || []),
                      ]}
                      onChange={(value: string | string[]) => {
                        setAssignForm((prev) => ({
                          ...prev,
                          jobAssignerId: [Number(value)],
                        }));
                      }}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <Label
                      className="text-sm font-semibold text-gray-800 mb-2"
                      htmlFor="follower"
                    >
                      Người theo dõi
                    </Label>
                    <div className="relative">
                      <Input
                        id="follower"
                        aria-label="Người theo dõi"
                        value={selectedFollower}
                        className="h-9 bg-gray-50 border-gray-300 rounded-lg pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors w-full"
                        readOnly
                        onClick={() => setIsOpenFollowerDialog(true)}
                        placeholder="Chọn người theo dõi"
                      />
                      <User
                        className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                        aria-hidden="true"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <Label
                      className="text-sm font-semibold text-gray-800 mb-2"
                      htmlFor="assignee"
                    >
                      Người xử lý việc
                    </Label>
                    <div className="relative">
                      <Popover
                        open={isNodesPopoverOpen}
                        onOpenChange={(open) => {
                          setIsNodesPopoverOpen(open);
                        }}
                      >
                        <PopoverTrigger asChild>
                          <div
                            className="relative w-full"
                            style={{ cursor: "pointer" }}
                            onClick={() => loadNodes(false)}
                          >
                            <Input
                              id="assignee"
                              aria-label="Người xử lý việc"
                              value={assigneeName}
                              type="text"
                              className="h-9 bg-gray-50 border-gray-300 rounded-lg pl-10 pr-8 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors w-full cursor-pointer"
                              placeholder="Tìm kiếm người xử lý việc..."
                              readOnly
                            />
                            <User
                              className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
                              aria-hidden="true"
                            />
                            {assigneeName !== "" && (
                              <Button
                                variant="ghost"
                                size="sm"
                                className="absolute right-10 top-1/2 -translate-y-1/2 h-9 w-8 p-0 text-gray-400 hover:text-red-500"
                                onClick={() => {
                                  setAssignee([]);
                                  setAssigneeName("");
                                }}
                                aria-label="Xóa người xử lý việc"
                              >
                                <X className="h-4 w-4" aria-hidden="true" />
                              </Button>
                            )}
                          </div>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-2" align="start">
                          <div className="space-y-1">
                            {(Array.isArray(nodes) ? nodes : []).map((node) => (
                              <button
                                key={node.id}
                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 rounded"
                                onClick={() => openTransferModal(node)}
                                type="button"
                              >
                                {node.name || "Chưa đặt tên"}
                              </button>
                            ))}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            {/* Công việc liên quan */}
            <Card className="p-2">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-200">
                <CardTitle className="text-lg font-bold text-gray-900">
                  Công việc liên quan
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 p-2 pt-3">
                {/* Công việc mức trên */}
                {type !== "lower" && (
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setIsUpperLevelWorkCollapsed(
                              !isUpperLevelWorkCollapsed
                            )
                          }
                          className="p-1 h-6 w-6 hover:bg-gray-100"
                          aria-label={
                            isUpperLevelWorkCollapsed
                              ? "Mở công việc mức trên"
                              : "Thu gọn công việc mức trên"
                          }
                        >
                          {isUpperLevelWorkCollapsed ? (
                            <ChevronRight
                              className="w-4 h-4 text-gray-600"
                              aria-hidden="true"
                            />
                          ) : (
                            <ChevronDown
                              className="w-4 h-4 text-gray-600"
                              aria-hidden="true"
                            />
                          )}
                        </Button>
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-2">
                            <Label className="text-sm font-semibold text-gray-800">
                              Công việc mức trên
                            </Label>
                            <Badge
                              variant="outline"
                              className="text-xs bg-blue-100 text-blue-700 border-blue-200"
                            >
                              {upperLevelWorkData.length}
                            </Badge>
                          </div>
                          <div className="mt-1">
                            <button
                              type="button"
                              className="text-xs text-blue-600 underline hover:text-blue-800 focus:outline-none"
                              onClick={() =>
                                setIsOpenUpperLevelWorkDialog(true)
                              }
                            >
                              Lựa chọn công việc mức trên
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                    {!isUpperLevelWorkCollapsed && (
                      <div
                        className="border border-gray-200 rounded-lg overflow-auto"
                        style={{ maxHeight: "280px" }}
                      >
                        <TableBase>
                          <TableHeader>
                            <TableRow className="bg-gray-50">
                              <TableHead className="w-[56px] min-w-[56px] max-w-[56px] text-center text-gray-700 font-medium break-words align-middle">
                                STT
                              </TableHead>
                              <TableHead className="w-[260px] min-w-[200px] max-w-[300px] text-gray-700 font-medium break-words align-middle">
                                Tên công việc
                              </TableHead>
                              <TableHead className="w-[128px] min-w-[96px] max-w-[140px] text-center text-gray-700 font-medium break-words align-middle">
                                Trạng thái
                              </TableHead>
                              <TableHead className="w-[96px] min-w-[80px] max-w-[120px] text-center text-gray-700 font-medium break-words align-middle">
                                Tiến độ
                              </TableHead>
                              <TableHead className="w-[160px] min-w-[120px] max-w-[200px] text-gray-700 font-medium break-words align-middle">
                                Người thực hiện
                              </TableHead>
                              <TableHead className="w-[96px] min-w-[80px] max-w-[120px] text-center text-gray-700 font-medium break-words align-middle">
                                Thao tác
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {upperLevelWorkData.length === 0 ? (
                              <TableRow>
                                <TableCell
                                  colSpan={6}
                                  className="text-center text-sm text-gray-500 py-8"
                                >
                                  Chưa có công việc mức trên nào được chọn
                                </TableCell>
                              </TableRow>
                            ) : (
                              upperLevelWorkData.map((work, index) => (
                                <TableRow
                                  key={work.id}
                                  className="hover:bg-gray-50"
                                >
                                  <TableCell className="text-center text-sm text-gray-600 break-words align-middle">
                                    {index + 1}
                                  </TableCell>
                                  <TableCell className="text-sm text-gray-900 font-medium break-words align-middle">
                                    {work.taskName}
                                  </TableCell>
                                  <TableCell className="text-center break-words align-middle">
                                    {/* {getStatusBadge(work.statusName)} */}
                                  </TableCell>
                                  <TableCell className="text-center text-sm text-gray-600 break-words align-middle">
                                    {work.progress}%
                                  </TableCell>
                                  <TableCell className="text-sm text-gray-600 break-words align-middle">
                                    {work.userAssignName}
                                  </TableCell>
                                  <TableCell className="text-center break-words align-middle">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-9 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                                      onClick={() => {
                                        setUpperLevelWorkData((prev) =>
                                          prev.filter(
                                            (item) => item.id !== work.id
                                          )
                                        );
                                      }}
                                      aria-label="Xóa công việc mức trên"
                                    >
                                      <X
                                        className="w-4 h-4"
                                        aria-hidden="true"
                                      />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))
                            )}
                          </TableBody>
                        </TableBase>
                      </div>
                    )}
                  </div>
                )}

                {/* Công việc mức dưới */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setIsLowerLevelWorkCollapsed(
                            !isLowerLevelWorkCollapsed
                          )
                        }
                        className="p-1 h-6 w-6 hover:bg-gray-100"
                        aria-label={
                          isLowerLevelWorkCollapsed
                            ? "Mở công việc mức dưới"
                            : "Thu gọn công việc mức dưới"
                        }
                      >
                        {isLowerLevelWorkCollapsed ? (
                          <ChevronRight
                            className="w-4 h-4 text-gray-600"
                            aria-hidden="true"
                          />
                        ) : (
                          <ChevronDown
                            className="w-4 h-4 text-gray-600"
                            aria-hidden="true"
                          />
                        )}
                      </Button>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-semibold text-gray-800">
                            Công việc mức dưới
                          </Label>
                          <Badge
                            variant="outline"
                            className="text-xs bg-green-100 text-green-700 border-green-200"
                          >
                            {lowerLevelWorkData.length}
                          </Badge>
                        </div>
                        <div className="mt-1">
                          <button
                            type="button"
                            className="text-xs text-blue-600 underline hover:text-blue-800 focus:outline-none"
                            onClick={() => setIsOpenLowerLevelWorkDialog(true)}
                          >
                            Lựa chọn công việc mức dưới
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  {!isLowerLevelWorkCollapsed && (
                    <div className="max-h-[280px] border border-gray-200 rounded-lg overflow-auto">
                      <TableBase>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="w-[56px] min-w-[56px] max-w-[56px] text-center text-gray-700 font-medium break-words align-middle">
                              STT
                            </TableHead>
                            <TableHead className="w-[260px] min-w-[200px] max-w-[300px] text-gray-700 font-medium break-words align-middle">
                              Tên công việc
                            </TableHead>
                            <TableHead className="w-[128px] min-w-[96px] max-w-[140px] text-center text-gray-700 font-medium break-words align-middle">
                              Trạng thái
                            </TableHead>
                            <TableHead className="w-[96px] min-w-[80px] max-w-[120px] text-center text-gray-700 font-medium break-words align-middle">
                              Tiến độ
                            </TableHead>
                            <TableHead className="w-[160px] min-w-[120px] max-w-[200px] text-gray-700 font-medium break-words align-middle">
                              Người thực hiện
                            </TableHead>
                            <TableHead className="w-[96px] min-w-[80px] max-w-[120px] text-center text-gray-700 font-medium break-words align-middle">
                              Thao tác
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {lowerLevelWorkData.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={6}
                                className="text-center text-sm text-gray-500 py-8"
                              >
                                Chưa có công việc mức dưới nào được chọn
                              </TableCell>
                            </TableRow>
                          ) : (
                            lowerLevelWorkData.map((work, index) => (
                              <TableRow
                                key={work.id}
                                className="hover:bg-gray-50"
                              >
                                <TableCell className="text-center text-sm text-gray-600 break-words align-middle">
                                  {index + 1}
                                </TableCell>
                                <TableCell className="text-sm text-gray-900 font-medium break-words align-middle">
                                  {work.taskName}
                                </TableCell>
                                <TableCell className="text-center break-words align-middle"></TableCell>
                                <TableCell className="text-center text-sm text-gray-600 break-words align-middle">
                                  {work.progress}%
                                </TableCell>
                                <TableCell className="text-sm text-gray-600 break-words align-middle">
                                  {work.userAssignName}
                                </TableCell>
                                <TableCell className="text-center break-words align-middle">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                                    onClick={() => {
                                      setLowerLevelWorkData((prev) =>
                                        prev.filter(
                                          (item) => item.id !== work.id
                                        )
                                      );
                                    }}
                                    aria-label="Xóa công việc mức dưới"
                                  >
                                    <X className="w-4 h-4" aria-hidden="true" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </TableBase>
                    </div>
                  )}
                </div>
                {/* Công việc liên quan */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setIsRelatedWorkCollapsed(!isRelatedWorkCollapsed)
                        }
                        className="p-1 h-6 w-6 hover:bg-gray-100"
                        aria-label={
                          isRelatedWorkCollapsed
                            ? "Mở công việc liên quan"
                            : "Thu gọn công việc liên quan"
                        }
                      >
                        {isRelatedWorkCollapsed ? (
                          <ChevronRight
                            className="w-4 h-4 text-gray-600"
                            aria-hidden="true"
                          />
                        ) : (
                          <ChevronDown
                            className="w-4 h-4 text-gray-600"
                            aria-hidden="true"
                          />
                        )}
                      </Button>
                      <div className="flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <Label className="text-sm font-semibold text-gray-800">
                            Công việc liên quan
                          </Label>
                          <Badge
                            variant="outline"
                            className="text-xs bg-purple-100 text-purple-700 border-purple-200"
                          >
                            {relatedWorkData.length}
                          </Badge>
                        </div>
                        <div className="mt-1">
                          <button
                            type="button"
                            className="text-xs text-blue-600 underline hover:text-blue-800 focus:outline-none"
                            onClick={() => setIsOpenRelatedWorkDialog(true)}
                          >
                            Lựa chọn công việc liên quan
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                  {!isRelatedWorkCollapsed && (
                    <div className="max-h-[280px] border border-gray-200 rounded-lg overflow-auto">
                      <TableBase>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="w-[64px] min-w-[56px] max-w-[80px] text-center text-gray-700 font-medium break-words align-middle">
                              STT
                            </TableHead>
                            <TableHead className="w-[280px] min-w-[180px] max-w-[350px] text-gray-700 font-medium break-words align-middle">
                              Tên công việc
                            </TableHead>
                            <TableHead className="w-[128px] min-w-[96px] max-w-[140px] text-center text-gray-700 font-medium break-words align-middle">
                              Trạng thái
                            </TableHead>
                            <TableHead className="w-[96px] min-w-[80px] max-w-[120px] text-center text-gray-700 font-medium break-words align-middle">
                              Tiến độ
                            </TableHead>
                            <TableHead className="w-[160px] min-w-[120px] max-w-[200px] text-gray-700 font-medium break-words align-middle">
                              Người thực hiện
                            </TableHead>
                            <TableHead className="w-[96px] min-w-[80px] max-w-[120px] text-center text-gray-700 font-medium break-words align-middle">
                              Thao tác
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {relatedWorkData.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={6}
                                className="text-center text-sm text-gray-500 py-8"
                              >
                                Chưa có công việc liên quan nào được chọn
                              </TableCell>
                            </TableRow>
                          ) : (
                            relatedWorkData.map((work, index) => (
                              <TableRow
                                key={work.id}
                                className="hover:bg-gray-50"
                              >
                                <TableCell className="text-center text-sm text-gray-600 break-words align-middle">
                                  {index + 1}
                                </TableCell>
                                <TableCell className="text-sm text-gray-900 font-medium break-words align-middle">
                                  {work.taskName}
                                </TableCell>
                                <TableCell className="text-center break-words align-middle"></TableCell>
                                <TableCell className="text-center text-sm text-gray-600 break-words align-middle">
                                  {work.progress}%
                                </TableCell>
                                <TableCell className="text-sm text-gray-600 break-words align-middle">
                                  {work.userAssignName}
                                </TableCell>
                                <TableCell className="text-center break-words align-middle">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                                    onClick={() => {
                                      setRelatedWorkData((prev) =>
                                        prev.filter(
                                          (item) => item.id !== work.id
                                        )
                                      );
                                    }}
                                    aria-label="Xóa công việc liên quan"
                                  >
                                    <X className="w-4 h-4" aria-hidden="true" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </TableBase>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            {/* Đính kèm */}
            <Card className="p-2">
              <CardHeader className="flex flex-row items-center justify-between pb-3 border-b border-gray-200">
                <CardTitle className="text-lg font-bold text-gray-900">
                  Đính kèm
                </CardTitle>
                <div className="flex gap-2">
                  <Label
                    htmlFor="upload-attachment"
                    className="flex cursor-pointer items-center gap-1 h-9 px-3 text-xs bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition-colors shadow-sm hover:shadow-md text-white"
                  >
                    <FileIcon className="w-3 h-3" aria-hidden="true" />
                    Chọn tệp
                  </Label>
                  <Button
                    className="flex items-center gap-1 h-9 px-3 text-xs bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition-colors shadow-sm hover:shadow-md"
                    onClick={selectTemplate}
                  >
                    <Plus className="w-3 h-3" aria-hidden="true" />
                    Chọn mẫu
                  </Button>
                  <Input
                    id="upload-attachment"
                    type="file"
                    name="attachment"
                    multiple
                    accept={ALLOWED_FILE_EXTENSION}
                    onChange={doSelectFiles}
                    className="hidden"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-2 pt-3">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setIsAttachedFilesCollapsed(!isAttachedFilesCollapsed)
                      }
                      className="p-1 h-6 w-6 hover:bg-gray-100"
                      aria-label={
                        isAttachedFilesCollapsed
                          ? "Mở danh sách tệp đính kèm"
                          : "Thu gọn danh sách tệp đính kèm"
                      }
                    >
                      {isAttachedFilesCollapsed ? (
                        <ChevronRight
                          className="w-4 h-4 text-gray-600"
                          aria-hidden="true"
                        />
                      ) : (
                        <ChevronDown
                          className="w-4 h-4 text-gray-600"
                          aria-hidden="true"
                        />
                      )}
                    </Button>
                    <div className="flex items-center gap-2">
                      <Label className="text-sm font-semibold text-gray-800">
                        Danh sách tệp đính kèm
                      </Label>
                      <Badge
                        variant="outline"
                        className="text-xs bg-orange-100 text-orange-700 border-orange-200"
                      >
                        {attachedFiles.length}
                      </Badge>
                    </div>
                  </div>

                  {/* Validation messages */}
                  {currentSelectedFileType === "attachment" && (
                    <>
                      {!validFileAttr.isValidFileSize && (
                        <p className="mt-2 text-xs text-red-600">
                          Kích thước tệp vượt quá giới hạn.
                        </p>
                      )}
                      {!validFileAttr.isValidExtension && (
                        <p className="mt-1 text-xs text-red-600">
                          File không đúng định dạng.
                        </p>
                      )}
                      {!validFileAttr.isValidNumberOfFiles && (
                        <p className="mt-1 text-xs text-red-600">
                          Số lượng file tối đa cho phép là {MAX_FILES_UPLOAD}.
                        </p>
                      )}
                    </>
                  )}

                  {!isAttachedFilesCollapsed && (
                    <div className="max-h-[220px] border border-gray-200 rounded-lg overflow-auto">
                      <TableBase>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="w-[64px] min-w-[48px] max-w-[72px] text-center text-gray-700 font-medium break-words align-middle">
                              STT
                            </TableHead>
                            <TableHead className="w-[180px] min-w-[140px] max-w-[220px] text-gray-700 font-medium break-words align-middle">
                              Tên tệp
                            </TableHead>
                            <TableHead className="w-[120px] min-w-[80px] max-w-[140px] text-gray-700 font-medium break-words align-middle">
                              Kích thước
                            </TableHead>
                            <TableHead className="w-[120px] min-w-[80px] max-w-[140px] text-gray-700 font-medium break-words align-middle">
                              Loại
                            </TableHead>
                            <TableHead className="w-[140px] min-w-[80px] max-w-[160px] text-gray-700 font-medium break-words align-middle">
                              Ngày tải lên
                            </TableHead>
                            <TableHead className="w-[74px] min-w-[64px] max-w-[96px] text-center text-gray-700 font-medium break-words align-middle">
                              Thao tác
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {attachedFiles.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={6}
                                className="text-center text-sm text-gray-500 py-8"
                              >
                                Chưa có tệp nào được chọn
                              </TableCell>
                            </TableRow>
                          ) : (
                            attachedFiles.map((file, index) => (
                              <TableRow key={`${file.name}-${index}`}>
                                <TableCell className="text-center text-sm break-words align-middle">
                                  {index + 1}
                                </TableCell>
                                <TableCell className="text-sm text-blue-600 font-medium break-words align-middle">
                                  {file.displayName || file.name}
                                </TableCell>
                                <TableCell className="text-sm text-gray-600 break-words align-middle">
                                  {file.size
                                    ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
                                    : "N/A"}
                                </TableCell>
                                <TableCell className="text-sm text-gray-600 break-words align-middle">
                                  <div className="flex items-center gap-2">
                                    <span>
                                      {file.type ||
                                        (file.name
                                          ? file.name
                                              .split(".")
                                              .pop()
                                              ?.toUpperCase()
                                          : null) ||
                                        "N/A"}
                                    </span>
                                    {file.template && (
                                      <Badge
                                        variant="outline"
                                        className="text-xs bg-green-100 text-green-700 border-green-200"
                                      >
                                        Mẫu
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell className="text-sm text-gray-600 break-words align-middle">
                                  {new Date().toLocaleDateString("vi-VN")}
                                </TableCell>
                                <TableCell className="text-center break-words align-middle">
                                  <div className="flex items-center justify-center gap-1">
                                    {isView(file) && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-9 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                                        onClick={() => viewFile(file)}
                                        aria-label="Xem tệp"
                                      >
                                        <Eye className="h-4 w-4" />
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className={`h-9 w-8 p-0 rounded-md transition-colors ${
                                        file.encrypt
                                          ? "text-red-600 hover:text-red-700 hover:bg-red-50"
                                          : "text-gray-600 hover:text-gray-700 hover:bg-gray-50"
                                      }`}
                                      onClick={() =>
                                        handleEncryptFile(file, index)
                                      }
                                      disabled={!!(file.id && file.oEncrypt)}
                                      aria-label="Mã hóa tệp"
                                    >
                                      <KeyRound className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      className="h-9 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                                      onClick={() => removeFile(index)}
                                      aria-label="Xóa tệp"
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </TableBase>
                    </div>
                  )}
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setIsAttachedDocumentsCollapsed(
                            !isAttachedDocumentsCollapsed
                          )
                        }
                        className="p-1 h-6 w-6 hover:bg-gray-100"
                        aria-label={
                          isAttachedDocumentsCollapsed
                            ? "Mở văn bản đính kèm"
                            : "Thu gọn văn bản đính kèm"
                        }
                      >
                        {isAttachedDocumentsCollapsed ? (
                          <ChevronRight
                            className="w-4 h-4 text-gray-600"
                            aria-hidden="true"
                          />
                        ) : (
                          <ChevronDown
                            className="w-4 h-4 text-gray-600"
                            aria-hidden="true"
                          />
                        )}
                      </Button>
                      <div className="flex items-center gap-2">
                        <Label className="text-sm font-semibold text-gray-800">
                          Văn bản đính kèm
                        </Label>
                        <Badge
                          variant="outline"
                          className="text-xs bg-indigo-100 text-indigo-700 border-indigo-200"
                        >
                          {attachedDocumentData.length}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      className="flex items-center gap-1 h-9 px-3 text-xs bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition-colors shadow-sm hover:shadow-md"
                      onClick={() => setIsOpenAttachedDocumentDialog(true)}
                    >
                      <Paperclip
                        className="w-3 h-3 text-blue-600"
                        aria-hidden="true"
                      />
                      Lựa chọn văn bản đính kèm
                    </Button>
                  </div>
                  {!isAttachedDocumentsCollapsed && (
                    <div className="max-h-[220px] border border-gray-200 rounded-lg overflow-auto">
                      <TableBase>
                        <TableHeader>
                          <TableRow className="bg-gray-50">
                            <TableHead className="w-[64px] min-w-[48px] max-w-[72px] text-center text-gray-700 font-medium break-words align-middle">
                              STT
                            </TableHead>
                            <TableHead className="w-[120px] min-w-[100px] max-w-[160px] text-gray-700 font-medium break-words align-middle">
                              Số ký hiệu
                            </TableHead>
                            <TableHead className="w-[180px] min-w-[120px] max-w-[280px] text-gray-700 font-medium break-words align-middle">
                              Trích yếu
                            </TableHead>
                            <TableHead className="w-[120px] min-w-[80px] max-w-[180px] text-gray-700 font-medium break-words align-middle">
                              Loại văn bản
                            </TableHead>
                            <TableHead className="w-[74px] min-w-[64px] max-w-[96px] text-center text-gray-700 font-medium break-words align-middle">
                              Thao tác
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {attachedDocumentData.length === 0 ? (
                            <TableRow>
                              <TableCell
                                colSpan={6}
                                className="text-center text-sm text-gray-500 py-8"
                              >
                                Chưa có văn bản đính kèm nào được chọn
                              </TableCell>
                            </TableRow>
                          ) : (
                            attachedDocumentData.map((doc) => (
                              <TableRow key={doc.id}>
                                <TableCell className="text-center text-sm break-words align-middle">
                                  {doc.id}
                                </TableCell>
                                <TableCell className="text-sm text-blue-600 font-medium break-words align-middle">
                                  {doc.numberOrSign}
                                </TableCell>
                                <TableCell className="text-sm text-gray-600 break-words align-middle">
                                  {doc.preview}
                                </TableCell>
                                <TableCell className="text-sm text-gray-600 break-words align-middle">
                                  {doc.docTypeName}
                                </TableCell>
                                <TableCell className="text-center break-words align-middle">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-9 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                                    onClick={() => {
                                      setAttachedDocumentData((prev) =>
                                        prev.filter(
                                          (item) => item.id !== doc.id
                                        )
                                      );
                                    }}
                                    aria-label="Xóa văn bản đính kèm"
                                  >
                                    <X className="w-4 h-4" aria-hidden="true" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))
                          )}
                        </TableBody>
                      </TableBase>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </CustomDialogContent>
      </Dialog>

      {/* Dialog Chọn người theo dõi */}
      <FollowerDialog
        isOpen={isOpenFollowerDialog}
        isFollow={true}
        onClose={() => setIsOpenFollowerDialog(false)}
        initialFollowers={initialFollowers}
        onConfirm={(followers) => {
          doFollowerTask(followers);
        }}
      />

      {/* Modal chuyển xử lý */}
      <TaskTransferModal
        isCreate={true}
        visible={isTransferModalOpen}
        onClose={() => {
          setIsTransferModalOpen(false);
        }}
        taskId={0}
        nodeId={selectedNode?.id || 0}
        showCanAddTransfer={false}
        callback={(taskExecute) => {
          setIsTransferModalOpen(false);
          doAssignee(taskExecute ?? []);
        }}
      />

      {/* Modal công việc liên quan */}
      <RelatedWorkDialog
        isOpen={
          isOpenRelatedWorkDialog ||
          isOpenUpperLevelWorkDialog ||
          isOpenLowerLevelWorkDialog
        }
        isSelectParentTask={isOpenUpperLevelWorkDialog}
        isSelectChildTask={isOpenLowerLevelWorkDialog}
        isSelectRelatedTask={isOpenRelatedWorkDialog}
        data={
          isOpenRelatedWorkDialog
            ? relatedWorkData
            : isOpenUpperLevelWorkDialog
              ? upperLevelWorkData
              : isOpenLowerLevelWorkDialog
                ? lowerLevelWorkData
                : []
        }
        setData={
          isOpenRelatedWorkDialog
            ? setRelatedWorkData
            : isOpenUpperLevelWorkDialog
              ? setUpperLevelWorkData
              : isOpenLowerLevelWorkDialog
                ? setLowerLevelWorkData
                : () => {}
        }
        onClose={() => {
          setIsOpenRelatedWorkDialog(false);
          setIsOpenUpperLevelWorkDialog(false);
          setIsOpenLowerLevelWorkDialog(false);
        }}
      />

      {/* Modal văn bản đính kèm */}
      <AttachedDocumentDialog
        isOpen={isOpenAttachedDocumentDialog}
        data={attachedDocumentData}
        setData={setAttachedDocumentData}
        onClose={() => {
          setIsOpenAttachedDocumentDialog(false);
        }}
        isV2={isV2}
      />

      <TemplateDialog
        open={isTemplateDialogOpen}
        onClose={() => setIsTemplateDialogOpen(false)}
        onSelectTemplate={handleSelectTemplate}
      />

      <ChangeFilenameDialog
        open={isChangeFilenameDialogOpen}
        onClose={() => setIsChangeFilenameDialogOpen(false)}
        onConfirm={handleRenameConfirm}
        onCancel={handleRenameCancel}
        originalFileName={
          selectedTemplateForRename?.displayName ||
          selectedTemplateForRename?.name ||
          ""
        }
      />
    </>
  );
};

export default WorkAssignDialog;
