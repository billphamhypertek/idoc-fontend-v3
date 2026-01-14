"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import TaskMonitor from "@/components/task/TaskMonitor";
import { searchTaskParams } from "@/definitions/types/task.type";
import { Button } from "@/components/ui/button";
import {
  ArchiveRestore,
  CheckCircle,
  ChevronDown,
  CircleCheck,
  CircleX,
  FileCheck,
  FileIcon,
  Network,
  Pencil,
  Trash,
  Undo2,
  User,
  X,
} from "lucide-react";
import { notificationService } from "@/services/notification.service";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import RefuseTask from "@/components/task/popup/RefuseTask";
import DoneTask from "@/components/task/popup/DoneTask";
import {
  handleError,
  prettyJSON,
  prettyJSONtoPDF,
  generateExcelTask,
  generatePDFTask,
  getAssetIcon,
} from "@/utils/common.utils";
import FollowerDialog from "@/components/dialogs/FollowerDialog";
import { OrgNode, UserFollower } from "@/definitions/types/task-assign.type";
import WorkflowDialog from "@/components/dialogs/WorkflowDialog";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { WorkflowEdge, WorkflowNode } from "@/definitions/types/workflow.type";
import { buildWorkflowTree, TrackingItem } from "@/utils/workflow.utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { defaultSearchTaskParams } from "@/utils/formValue.utils";
import { Badge } from "@/components/ui/badge";
import { ToastUtils } from "@/utils/toast.utils";
import { getUserInfo } from "@/utils/token.utils";
import { TaskV2Service } from "@/services/taskv2.service";
import { useDoSearchTaskFollow } from "@/hooks/data/task.data";
import { TaskService } from "@/services/task.service";
import {
  useDeleteTaskAction,
  useUpdateAcceptTask,
} from "@/hooks/data/task-action.data";

enum PdfAction {
  VIEWPDF = "viewPDF",
  SUBMITPDF = "submitPDF",
  DOWNLOADPDF = "downloadPDF",
}
type Props = {
  isV2?: boolean;
};

export default function TaskFollow({ isV2 = false }: Props) {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState<searchTaskParams | null>({
    taskFieldId: null,
    priorityId: [],
    taskType: null,
    taskStatus: null,
    codeTask: null,
    startDate: "",
    endDate: "",
    dayLeft: "",
    orgId: "",
    userStatus: null,
    orgAssignOfTask: null,
    startReportDate: null,
    endReportDate: null,
    nameLeadSign: "",
    userAssignId: null,
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [currentTab, setCurrentTab] = useState("inprogress");
  const [isOpenConfirmDialog, setIsOpenConfirmDialog] = useState(false);
  const [isOpenRefuseDialog, setIsOpenRefuseDialog] = useState(false);
  const [isOpenDoneDialog, setIsOpenDoneDialog] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
  const [selectedTaskData, setSelectedTaskData] = useState<any>(null);
  const [selectedFollowers, setSelectedFollowers] = useState<UserFollower[]>(
    []
  );
  const [isUserFollowOpen, setIsUserFollowOpen] = useState(false);
  const [isOpenConfirmDeleteDialog, setIsOpenConfirmDeleteDialog] =
    useState(false);
  const [workflowDialog, setWorkflowDialog] = useState<boolean>(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<any | null>(null);
  const [workflowItem, setWorkflowItem] = useState<{ workName: string }>({
    workName: "",
  });

  // Export states
  const [isExportingExcel, setIsExportingExcel] = useState<boolean>(false);
  const [isCreatingPdf, setIsCreatingPdf] = useState<boolean>(false);
  const [openCreatePdf, setOpenCreatePdf] = useState<boolean>(false);
  const [titlefilePDF, setTitlefilePDF] = useState<string>("");
  const [resultCopy, setResultCopy] = useState<any[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [maxResults, setMaxResults] = useState<number | null>(null);
  const [sortGroupTask] = useState<string[]>([
    "Nhiệm vụ cấp bách",
    "Nhiệm vụ quan trọng",
    "Nhiệm vụ thường xuyên",
    "Nhiệm vụ của đơn vị",
    "Kế hoạch và dự toán ngân sách",
  ]);
  const [selectedOrgName, setSelectedOrgName] = useState<string>("");
  const { mutateAsync: deleteTask } = useDeleteTaskAction(isV2);

  const UserInfo = useMemo(() => {
    return JSON.parse(getUserInfo() || "{}");
  }, []);

  // Search task follow với pagination
  const {
    data: taskResult,
    isLoading,
    error,
    refetch: originalRefetch,
  } = useDoSearchTaskFollow(
    searchParams || defaultSearchTaskParams,
    currentPage,
    isV2
  );

  const onSearch = (params: searchTaskParams) => {
    setSearchParams(params);
    setCurrentPage(1);
  };

  const handleOrgNameChange = (orgName: string) => {
    setSelectedOrgName(orgName);
  };

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    if (searchParams) {
      const newParams = { ...searchParams };
      switch (tab) {
        case "inprogress":
          newParams.taskStatus = false;
          break;
        case "finished":
          newParams.taskStatus = true;
          break;
        case "return":
          newParams.taskStatus = null;
          break;
      }
      setSearchParams(newParams);
      setCurrentPage(1);
    }
  };

  const onRowClick = (row: any) => {
    if (isV2) {
      router.push(`/task-v2/follow/detail/${row.id}`);
    } else {
      router.push(`/task/follow/detail/${row.id}`);
    }
  };

  const onEditTask = (row: any) => {
    if (isV2) {
      router.push(`/task-v2/assign/detail/${row.id}?edit=true`);
    } else {
      router.push(`/task/assign/detail/${row.id}?edit=true`);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const { mutateAsync: updateAcceptTask } = useUpdateAcceptTask(isV2);

  const updateAccept = async (
    taskId: number,
    status: number,
    isExcute: boolean,
    userId?: number,
    comment?: string,
    files?: any
  ) => {
    try {
      await updateAcceptTask({
        taskId,
        status,
        isExcute,
        comment,
        files,
        userId,
      });
      originalRefetch();
      await notificationService.countUnreadNotification();
    } catch (error) {
      handleError(error);
    }
  };

  const handleConfirmApprove = async () => {
    if (selectedTaskId && selectedStatus !== null) {
      await updateAccept(selectedTaskId, selectedStatus, true, UserInfo.id);
      setIsOpenConfirmDialog(false);
      setSelectedTaskId(null);
      setSelectedStatus(null);
      originalRefetch();
    }
  };

  const getConfirmMessage = (status: number) => {
    switch (status) {
      case 4:
        return "Bạn muốn đóng công việc này?";
      case 1:
        return "Bạn có muốn tiếp nhận công việc này?";
      case 5:
        return "Bạn có muốn thu hồi công việc này?";
      case 0:
        return "Bạn muốn khôi phục công việc này?";
      default:
        return "Bạn có chắc chắn muốn xác nhận công việc này không?";
    }
  };

  const confirmApprove = async (taskId: number, status: number) => {
    setSelectedTaskId(taskId);
    setSelectedStatus(status);

    switch (status) {
      case 4:
        setIsOpenConfirmDialog(true);
        break;
      case 2:
        setIsOpenRefuseDialog(true);
        break;
      case 6:
        setIsOpenConfirmDialog(true);
        break;
      case 1:
        setIsOpenConfirmDialog(true);
        break;
      case 3:
        setIsOpenDoneDialog(true);
        break;
      case 5:
        setIsOpenConfirmDialog(true);
        break;
      case 0:
        setIsOpenConfirmDialog(true);
        break;
    }
  };

  const handleRefuseTask = async () => {
    setIsOpenRefuseDialog(false);
    setSelectedTaskId(null);
    setSelectedStatus(null);
  };

  const handleDoneTask = async () => {
    setIsOpenDoneDialog(false);
    setSelectedTaskId(null);
    setSelectedStatus(null);
  };

  const handleOpenUserFollow = (taskData: any) => {
    setSelectedTaskData(taskData);
    setIsUserFollowOpen(true);
  };

  const handleCloseUserFollow = () => {
    setIsUserFollowOpen(false);
    setSelectedTaskData(null);
    setSelectedFollowers([]);
  };

  const handleConfirmDeleteTask = async () => {
    if (!selectedTaskData) return;

    try {
      await deleteTask(selectedTaskData.id);
      ToastUtils.success("Xóa công việc thành công");
      setIsOpenConfirmDeleteDialog(false);
      setSelectedTaskData(null);
      originalRefetch();
    } catch (error) {
      handleError(error);
    }
  };

  const transformFollowers = (followers: OrgNode[]): UserFollower[] => {
    if (!Array.isArray(followers)) {
      return [];
    }

    return followers
      .filter((follower) => follower.type === "USER")
      .map((follower) => {
        const numericId = Number(follower.id);
        const normalizedId = Number.isNaN(numericId) ? follower.id : numericId;
        const followerName = follower.name ?? follower.userName ?? "";

        return {
          user: {
            id: normalizedId,
            fullName: followerName,
            positionName: follower.positionName ?? null,
            orgName: follower.orgName ?? null,
          },
          type: 0,
          isExcute: follower.isExcute ?? false,
          isCombination: follower.isCombination ?? false,
          status: 0,
          userId: normalizedId,
          id: normalizedId,
          taskId: selectedTaskData?.id || null,
          description: follower.description ?? null,
        } as UserFollower;
      });
  };

  const handleUpdateFollowTask = async (followers: OrgNode[]) => {
    if (!selectedTaskData) return;

    try {
      const normalizedFollowers = transformFollowers(followers);
      const formattedFollowers = normalizedFollowers.map((follower) => ({
        id: follower.id || follower.userId,
        fullName: follower.user?.fullName || follower.fullName || "",
        positionName:
          follower.user?.positionName || follower.positionName || "",
        orgName: follower.user?.orgName || follower.orgName || "",
      }));

      await (isV2
        ? TaskV2Service.updateFollowTask(
            selectedTaskData.id,
            formattedFollowers
          )
        : TaskService.updateFollowTask(
            selectedTaskData.id,
            formattedFollowers
          ));
      ToastUtils.success("Cập nhật người theo dõi thành công");

      handleCloseUserFollow();
      originalRefetch();
    } catch (error) {
      handleError(error);
    }
  };

  const openFamilyTreeModal = (treeData: any, selectedTitleTask: string) => {
    const tracking = (treeData || []) as TrackingItem[];

    if (!tracking || tracking.length === 0) {
      return;
    }

    // Handle multiple root nodes by merging them into one root
    const parentRoots = tracking.filter((t: any) => t.parent === t.key);

    if (parentRoots.length > 1) {
      parentRoots.sort((a: any, b: any) => a.key - b.key);
      const trueRoot = parentRoots[0];

      // Update other roots to be children of the first root
      for (let i = 1; i < parentRoots.length; i++) {
        const nodeToUpdate = parentRoots[i];
        const index = tracking.findIndex(
          (t: any) => t.key === nodeToUpdate.key
        );

        if (index !== -1) {
          tracking[index] = {
            ...tracking[index],
            parent: trueRoot.key,
          };
        }
      }
    }

    // Add result field to tracking items if available
    const trackingWithResult = tracking.map((item: any) => ({
      ...item,
      result: item.result,
    })) as TrackingItem[];

    const workflowData = buildWorkflowTree(trackingWithResult);

    if (!workflowData) {
      return;
    }

    // Add result field to node data if available
    const nodesWithResult = workflowData.nodes.map((node) => {
      const originalItem = tracking.find((t: any) => String(t.key) === node.id);
      return {
        ...node,
        data: {
          ...node.data,
          result: originalItem?.result,
        },
      };
    });

    setSelectedWorkflow({ nodes: nodesWithResult, edges: workflowData.edges });
    setWorkflowItem({
      workName: selectedTitleTask ?? "",
    });
    setWorkflowDialog(true);
  };

  const filterResult = (objList: any[]) => {
    let filteredData: any[];
    if (selectedOption === "true") {
      filteredData = objList.filter(
        (item) => Array.isArray(item.assigners) && item.assigners[0].orgId === 2
      );
    } else if (selectedOption === "false") {
      filteredData = objList.filter(
        (item) => Array.isArray(item.assigners) && item.assigners[0].orgId !== 2
      );
    } else {
      filteredData = [...objList];
    }
    setResultCopy(filteredData);
    return filteredData;
  };

  const handleExportExcel = async () => {
    try {
      setIsExportingExcel(true);
      const date = new Date();
      const formatted = format(date, "dd/MM/yyyy", { locale: vi });

      const header = [
        "TT",
        "Nhiệm vụ",
        "Thời hạn hoàn thành",
        "Thời gian báo cáo",
        "Kết quả thực hiện",
        "Lãnh đạo chỉ đạo/căn cứ giao nhiệm vụ",
      ];

      const response = await (isV2
        ? TaskV2Service.doLoadTaskExportFollowing(searchParams)
        : TaskService.doLoadTaskExportFollowing(searchParams));
      const result = response || [];

      if (!result || !Array.isArray(result) || result.length === 0) {
        ToastUtils.error("Không tìm thấy dữ liệu công việc!");
        return;
      }

      const filteredResult = filterResult(result);
      const formattedData = prettyJSON(filteredResult, undefined);
      generateExcelTask(
        `Tổng hợp nhiệm vụ lãnh đạo Ban giao`,
        header,
        formattedData,
        "Tổng hợp nhiệm vụ"
      );
      ToastUtils.success("Xuất báo cáo Excel thành công");
    } catch (error) {
      handleError(error);
    } finally {
      setIsExportingExcel(false);
    }
  };

  // Export PDF
  const handleExportPdf = async (action: PdfAction) => {
    try {
      setIsCreatingPdf(true);
      const date = new Date();
      const formatted = format(date, "dd_MM_yyyy", { locale: vi });

      const response = await (isV2
        ? TaskV2Service.doLoadTaskExportFollowing(searchParams)
        : TaskService.doLoadTaskExportFollowing(searchParams));
      const result = response || [];

      if (!result || !Array.isArray(result) || result.length === 0) {
        ToastUtils.error("Không tìm thấy dữ liệu công việc!");
        return;
      }

      const filteredResult = filterResult(result);
      const formattedData = prettyJSONtoPDF(
        filteredResult,
        maxResults || undefined
      );

      // Determine organization export name
      let orgExport = null;
      if (
        searchParams?.orgId &&
        searchParams.orgId !== "all" &&
        selectedOrgName
      ) {
        orgExport = { id: searchParams.orgId, name: selectedOrgName };
      }

      const title = orgExport
        ? `Tổng hợp nhiệm vụ lãnh đạo Ban giao \n ${orgExport.name}`
        : `Tổng hợp nhiệm vụ lãnh đạo Ban giao`;

      const namedv = orgExport ? orgExport.name : "";
      const nameSign = searchParams?.nameLeadSign || "";

      generatePDFTask(title, formattedData, action, namedv, nameSign, (url) =>
        router.push(url)
      );

      const fileName = orgExport
        ? `Tổng hợp nhiệm vụ lãnh đạo Ban giao_${orgExport.name}_${formatted}.pdf`
        : `Tổng hợp nhiệm vụ_${formatted}.pdf`;
      setTitlefilePDF(fileName);
      setOpenCreatePdf(true);
    } catch (error) {
      handleError(error);
    } finally {
      setIsCreatingPdf(false);
    }
  };

  // View PDF
  const viewPdf = () => {
    const pdfBase64 = sessionStorage.getItem("pdfDocument");
    if (pdfBase64) {
      const pdfWindow = window.open("");
      pdfWindow?.document.write(`
        <style>
          html, body {
            margin: 0;
            padding: 0;
            background-color: black;
            overflow: hidden;
          }
          iframe {
            width: 100vw;
            height: 100vh;
            border: none;
            display: block;
          }
        </style>
        <iframe src="data:application/pdf;base64,${encodeURI(pdfBase64)}"></iframe>
      `);
      pdfWindow?.document.close();
    } else {
      ToastUtils.error("Không tìm thấy PDF trong Session Storage");
    }
  };

  // Create draft
  const doCreateDraft = () => {
    handleExportPdf(PdfAction.SUBMITPDF);
  };

  // Download PDF
  const downloadPdf = () => {
    handleExportPdf(PdfAction.DOWNLOADPDF);
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

  const columns = [
    {
      header: "STT",
      accessor: "no",
      className: "w-3 text-center border-r",
    },
    {
      header: "Tên công việc",
      accessor: "taskName",
      className: "w-20 border-r",
    },
    {
      header: "Thời gian",
      accessor: "timeRange",
      className: "w-10 text-center border-r",
    },
    {
      header: "Người giao việc",
      accessor: "assigners",
      className: "w-10 text-center border-r",
    },
    {
      header: "Người thực hiện",
      accessor: "userExcutePrimaryName",
      className: "w-10 text-center border-r",
    },
    {
      header: "Đơn vị xử lý",
      accessor: "orgName",
      className: "w-8 text-center border-r",
    },
    {
      header: "Kết quả xử lý",
      accessor: "result",
      className: "w-10 border-r",
    },
    {
      header: "Trạng thái",
      accessor: (item: any) => getStatusBadge(item.statusName as string),
      className: "w-10 text-center border-r",
    },
    {
      header: "Nhóm công việc",
      accessor: "priorityName",
      className: "w-10 text-center border-r",
    },
    {
      header: "Thao tác",
      type: "actions",
      className: "w-20 text-center border-r",
      renderActions: (item: any) => {
        return (
          <div className="grid grid-cols-3 gap-1">
            {item.button?.canClose === "ENABLE" && (
              <Button
                variant="ghost"
                size="sm"
                className="text-green-600 hover:text-green-800 p-1 h-9 w-8 hover:bg-transparent"
                title="Đóng việc"
                onClick={(e) => {
                  e.stopPropagation();
                  confirmApprove(item.id, 4);
                }}
              >
                <FileCheck className="w-4 h-4" />
              </Button>
            )}
            {item.button?.canRejectApprove === "ENABLE" && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-800 p-1 h-9 w-8 hover:bg-transparent"
                title="Từ chối"
                onClick={(e) => {
                  e.stopPropagation();
                  confirmApprove(item.id, 2);
                }}
              >
                <CircleX className="w-4 h-4" />
              </Button>
            )}
            {item.button?.canRevoke === "ENABLE" && (
              <Button
                variant="ghost"
                size="sm"
                className="text-yellow-600 hover:text-yellow-800 p-1 h-9 w-8 hover:bg-transparent"
                title="Thu hồi"
                onClick={(e) => {
                  e.stopPropagation();
                  confirmApprove(item.id, 5);
                }}
              >
                <Undo2 className="w-4 h-4" />
              </Button>
            )}
            {item.button?.canDone === "ENABLE" && (
              <Button
                variant="ghost"
                size="sm"
                className="text-green-600 hover:text-green-800 p-1 h-9 w-8 hover:bg-transparent"
                title="Hoàn thành"
                onClick={(e) => {
                  e.stopPropagation();
                  confirmApprove(item.id, 3);
                }}
              >
                <CircleCheck className="w-4 h-4" />
              </Button>
            )}
            {item.button?.canEdit === "ENABLE" && (
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-800 p-1 h-9 w-8 hover:bg-transparent"
                title="Sửa"
                onClick={(e) => {
                  e.stopPropagation();
                  onEditTask(item);
                }}
              >
                <Pencil className="w-4 h-4" />
              </Button>
            )}
            {item.button?.canDelete === "ENABLE" && (
              <Button
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-800 p-1 h-9 w-8 hover:bg-transparent"
                title="Xóa"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedTaskData(item);
                  setIsOpenConfirmDeleteDialog(true);
                }}
              >
                <Trash className="w-4 h-4" />
              </Button>
            )}
            {item.button?.canRestore === "ENABLE" && (
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-800 p-1 h-9 w-8 hover:bg-transparent"
                title="Khôi phục"
                onClick={(e) => {
                  e.stopPropagation();
                  confirmApprove(item.id, 0);
                }}
              >
                <ArchiveRestore className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-800 p-1 h-9 w-8 hover:bg-transparent"
              title="Người theo dõi"
              onClick={(e) => {
                e.stopPropagation();
                handleOpenUserFollow(item);
              }}
            >
              <User className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-800 p-1 h-9 w-8 hover:bg-transparent"
              title="Sơ đồ giao việc"
              onClick={(e) => {
                e.stopPropagation();
                openFamilyTreeModal(item.tracking, item.taskName);
              }}
            >
              <Network className="w-4 h-4" />
            </Button>
            {item.subTasks && item.subTasks.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="text-blue-600 hover:text-blue-800 p-1 h-9 w-8 hover:bg-transparent"
                title="Xem công việc con"
                onClick={(e) => {
                  e.stopPropagation();
                  confirmApprove(item.id, 3);
                }}
              >
                <ChevronDown className="w-4 h-4" />
              </Button>
            )}
          </div>
        );
      },
    },
  ];

  const tabs = [
    {
      id: "inprogress",
      title: "Đang thực hiện",
      disabled: false,
      showDeadlineWarning: true,
    },
    {
      id: "finished",
      title: "Hoàn thành",
      disabled: false,
      showDeadlineWarning: false,
    },
    {
      id: "return",
      title: "Thu hồi",
      disabled: false,
      showDeadlineWarning: false,
    },
  ];

  const breadcrumbItems = [
    {
      label: "Quản lý công việc",
      href: "/task/follow",
    },
  ];

  const formattedData = (taskResult?.objList || []).map(
    (item: any, index: number) => ({
      ...item,
      no: (currentPage - 1) * 10 + (index + 1),
      timeRange: `${item.startDate ? new Date(item.startDate).toLocaleDateString("vi-VN") : ""}-${item.endDate ? new Date(item.endDate).toLocaleDateString("vi-VN") : ""}`,
      assigners:
        item.assigners && item.assigners.length > 0
          ? item.assigners?.map((assigner: any) => assigner.fullName).join(", ")
          : item.userAssignName || "",
      result: item.result || "",
      actions: null,
    })
  );

  return (
    <>
      <TaskMonitor
        data={formattedData}
        searchParams={searchParams || defaultSearchTaskParams}
        onSearch={onSearch}
        isExportExcel={isExportingExcel}
        onExportExcel={handleExportExcel}
        isCreatePdf={isCreatingPdf}
        onCreatePdf={() => handleExportPdf(PdfAction.VIEWPDF)}
        columns={columns}
        tabs={tabs}
        onRowClick={onRowClick}
        headerTitle="Theo dõi danh sách các công việc"
        headerSubtitle="Theo dõi giao công việc cho cá nhân"
        breadcrumbItems={breadcrumbItems}
        currentPage="Tra cứu theo dõi"
        handleTabChange={handleTabChange}
        currentPageNumber={currentPage}
        totalItems={taskResult?.totalRecord}
        onPageChange={handlePageChange}
        onOrgNameChange={handleOrgNameChange}
      />

      <ConfirmDeleteDialog
        isOpen={isOpenConfirmDialog}
        onOpenChange={setIsOpenConfirmDialog}
        onConfirm={handleConfirmApprove}
        title="Xác nhận"
        description={getConfirmMessage(selectedStatus || 0)}
      />

      <RefuseTask
        isOpen={isOpenRefuseDialog}
        onOpenChange={setIsOpenRefuseDialog}
        onClose={handleRefuseTask}
        isExecute={false}
        taskId={selectedTaskId || 0}
        refetch={originalRefetch}
        UserInfo={UserInfo}
        isV2={isV2}
      />

      <DoneTask
        isOpen={isOpenDoneDialog}
        onOpenChange={setIsOpenDoneDialog}
        onClose={handleDoneTask}
        isExecute={false}
        taskId={selectedTaskId || 0}
        refetch={originalRefetch}
        UserInfo={UserInfo}
        isV2={isV2}
      />

      {/* FollowerDialog Component */}
      <FollowerDialog
        isOpen={isUserFollowOpen}
        onClose={handleCloseUserFollow}
        isFollow={true}
        taskId={selectedTaskData?.id?.toString()}
        selectedWorkItem={{
          id: selectedTaskData?.id,
          workName: selectedTaskData?.taskName,
        }}
        initialFollowers={selectedFollowers}
        onConfirm={handleUpdateFollowTask}
        title="Chọn người theo dõi"
        isV2={isV2}
      />

      <ConfirmDeleteDialog
        isOpen={isOpenConfirmDeleteDialog}
        onOpenChange={setIsOpenConfirmDeleteDialog}
        onConfirm={handleConfirmDeleteTask}
        description="Bạn chắc chắn muốn xóa công việc này?"
        confirmText="Đồng ý"
        cancelText="Đóng"
      />

      <WorkflowDialog
        isOpen={workflowDialog}
        onClose={() => setWorkflowDialog(false)}
        workItem={workflowItem}
        workflowData={selectedWorkflow || undefined}
      />

      {/* PDF Preview Dialog */}
      {openCreatePdf && (
        <Dialog open={openCreatePdf} onOpenChange={setOpenCreatePdf}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Tạo báo cáo công việc</DialogTitle>
              <DialogDescription></DialogDescription>
            </DialogHeader>
            <div className="flex items-center space-x-2">
              <img
                src={getAssetIcon(titlefilePDF)}
                alt="PDF"
                className="w-4 h-4"
              />
              <span>{titlefilePDF}</span>
            </div>
            <DialogFooter>
              <div className="flex justify-end gap-2">
                <Button
                  onClick={viewPdf}
                  variant="outline"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <FileIcon className="mr-2 w-4 h-4" />
                  Xem báo cáo
                </Button>
                <Button
                  onClick={downloadPdf}
                  variant="default"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <FileIcon className="mr-2 w-4 h-4" />
                  Tải báo cáo
                </Button>
                <Button
                  onClick={doCreateDraft}
                  variant="default"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  <CheckCircle className="mr-2 w-4 h-4" />
                  Nộp báo cáo
                </Button>
                <Button
                  onClick={() => setOpenCreatePdf(false)}
                  variant="outline"
                >
                  <X className="mr-2 w-4 h-4" />
                  Đóng
                </Button>
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
