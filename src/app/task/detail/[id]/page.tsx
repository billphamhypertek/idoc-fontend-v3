"use client";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import LoadingFull from "@/components/common/LoadingFull";
import DetailLayoutLeft from "@/components/task/DetailLayoutLeft/DetailLayoutLeft";
import DetailLayoutRight from "@/components/task/DetailLayoutRight/DetailLayoutRight";
import DoneTask from "@/components/task/popup/DoneTask";
import RefuseTask from "@/components/task/popup/RefuseTask";
import WorkAssignDialog from "@/components/work-assign/createDialog";
import { queryKeys } from "@/definitions/constants/queryKey.constants";
import { useGetFindByIdTask } from "@/hooks/data/task.data";
import { notificationService } from "@/services/notification.service";
import { TaskService } from "@/services/task.service";
import { UserService } from "@/services/user.service";
import { handleError } from "@/utils/common.utils";
import { ToastUtils } from "@/utils/toast.utils";
import { getUserInfo } from "@/utils/token.utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  useParams,
  useRouter,
  usePathname,
  useSearchParams,
} from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  useDeleteTaskAction,
  useUpdateAcceptTask,
} from "@/hooks/data/task-action.data";
import { useSidebarStore } from "@/stores/sideBar.store";
import { STORAGE_KEYS } from "@/definitions/constants/storageKey.constant";
import { useGetFindByIdTaskV2 } from "@/hooks/data/taskv2.data";
import { TaskV2Service } from "@/services/taskv2.service";

type PageType =
  | "assign"
  | "listTaskOrg"
  | "search"
  | "work"
  | "combination"
  | "follow"
  | "assignV2"
  | "workV2"
  | "combinationV2"
  | "listTaskOrgV2"
  | "followV2"
  | "searchV2";

interface PageConfig {
  breadcrumbLabel: string;
  breadcrumbHref: string;
  onGoBack: (router: ReturnType<typeof useRouter>) => void;
  enableEdit: boolean;
  enableDelete: boolean;
  enableApprove: boolean;
  enableDone: boolean;
  enableRefuse: boolean;
  enableGiaoViec: boolean;
  enableClose: boolean;
  enableRestore: boolean;
  enableRejectApprove: boolean;
  deleteRedirectPath: string;
  useToastForDelete: boolean;
  enableRevoke: boolean;
}

const handleGoBack = (router: ReturnType<typeof useRouter>) => {
  const { restorePreviousMenuSideBar } = useSidebarStore.getState();
  const previousMenuSideBar = useSidebarStore.getState().previousMenuSideBar;

  if (previousMenuSideBar) {
    localStorage.setItem(STORAGE_KEYS.MENU_SIDEBAR, previousMenuSideBar);
    restorePreviousMenuSideBar();
  } else {
    localStorage.removeItem(STORAGE_KEYS.MENU_SIDEBAR);
  }
  router.back();
};

const getPageConfig = (pageType: PageType): PageConfig => {
  const configs: Record<PageType, PageConfig> = {
    assign: {
      breadcrumbLabel: "Công việc đã giao",
      breadcrumbHref: "/task/assign",
      onGoBack: handleGoBack,
      enableEdit: true,
      enableDelete: true,
      enableApprove: true,
      enableDone: true,
      enableRefuse: true,
      enableGiaoViec: true,
      enableClose: true,
      enableRestore: true,
      enableRejectApprove: true,
      deleteRedirectPath: "/task/assign",
      useToastForDelete: true,
      enableRevoke: true,
    },
    listTaskOrg: {
      breadcrumbLabel: "Danh sách công việc cơ quan",
      breadcrumbHref: "/task/listTaskOrg",
      onGoBack: handleGoBack,
      enableEdit: false,
      enableDelete: false,
      enableApprove: false,
      enableDone: false,
      enableRefuse: false,
      enableGiaoViec: true,
      enableClose: true,
      enableRestore: true,
      enableRejectApprove: true,
      deleteRedirectPath: "/task/listTaskOrg",
      useToastForDelete: false,
      enableRevoke: true,
    },
    search: {
      breadcrumbLabel: "Công việc đã giao",
      breadcrumbHref: "/task/assign",
      onGoBack: handleGoBack,
      enableEdit: false,
      enableDelete: true,
      enableApprove: true,
      enableDone: true,
      enableRefuse: true,
      enableGiaoViec: true,
      enableClose: true,
      enableRestore: true,
      enableRejectApprove: true,
      deleteRedirectPath: "/task/assign",
      useToastForDelete: false,
      enableRevoke: true,
    },
    work: {
      breadcrumbLabel: "Việc xử lý chính",
      breadcrumbHref: "/task/work",
      onGoBack: handleGoBack,
      enableEdit: false,
      enableDelete: true,
      enableApprove: true,
      enableDone: true,
      enableRefuse: true,
      enableGiaoViec: true,
      enableClose: true,
      enableRestore: true,
      enableRejectApprove: true,
      deleteRedirectPath: "/task/assign",
      useToastForDelete: true,
      enableRevoke: true,
    },
    combination: {
      breadcrumbLabel: "Việc xử lý phối hợp",
      breadcrumbHref: "/task/combination",
      onGoBack: handleGoBack,
      enableEdit: true,
      enableDelete: true,
      enableApprove: true,
      enableDone: true,
      enableRefuse: true,
      enableGiaoViec: true,
      enableClose: true,
      enableRestore: true,
      enableRejectApprove: true,
      deleteRedirectPath: "/task/combination",
      useToastForDelete: true,
      enableRevoke: true,
    },
    follow: {
      breadcrumbLabel: "Tra cứu theo dõi",
      breadcrumbHref: "/task/follow",
      onGoBack: handleGoBack,
      enableEdit: false,
      enableDelete: true,
      enableApprove: true,
      enableDone: true,
      enableRefuse: true,
      enableGiaoViec: true,
      enableClose: true,
      enableRestore: true,
      enableRejectApprove: true,
      deleteRedirectPath: "/task/follow",
      useToastForDelete: true,
      enableRevoke: true,
    },
    assignV2: {
      breadcrumbLabel: "Công việc đã giao",
      breadcrumbHref: "/task-v2/assign",
      onGoBack: handleGoBack,
      enableEdit: true,
      enableDelete: true,
      enableApprove: true,
      enableDone: true,
      enableRefuse: true,
      enableGiaoViec: true,
      enableClose: true,
      enableRestore: true,
      enableRejectApprove: true,
      deleteRedirectPath: "/task-v2/assign",
      useToastForDelete: true,
      enableRevoke: true,
    },
    workV2: {
      breadcrumbLabel: "Việc xử lý chính",
      breadcrumbHref: "/task-v2/work",
      onGoBack: handleGoBack,
      enableEdit: true,
      enableDelete: true,
      enableApprove: true,
      enableDone: true,
      enableRefuse: true,
      enableGiaoViec: true,
      enableClose: true,
      enableRestore: true,
      enableRejectApprove: true,
      deleteRedirectPath: "/task-v2/work",
      useToastForDelete: true,
      enableRevoke: true,
    },
    combinationV2: {
      breadcrumbLabel: "Việc xử lý phối hợp",
      breadcrumbHref: "/task-v2/combination",
      onGoBack: handleGoBack,
      enableEdit: true,
      enableDelete: true,
      enableApprove: true,
      enableDone: true,
      enableRefuse: true,
      enableGiaoViec: true,
      enableClose: true,
      enableRestore: true,
      enableRejectApprove: true,
      deleteRedirectPath: "/task-v2/combination",
      useToastForDelete: true,
      enableRevoke: true,
    },
    listTaskOrgV2: {
      breadcrumbLabel: "Danh sách công việc cơ quan",
      breadcrumbHref: "/task-v2/listTaskOrg",
      onGoBack: handleGoBack,
      enableEdit: true,
      enableDelete: true,
      enableApprove: true,
      enableDone: true,
      enableRefuse: true,
      enableGiaoViec: true,
      enableClose: true,
      enableRestore: true,
      enableRejectApprove: true,
      deleteRedirectPath: "/task-v2/listTaskOrg",
      useToastForDelete: true,
      enableRevoke: true,
    },
    followV2: {
      breadcrumbLabel: "Tra cứu theo dõi",
      breadcrumbHref: "/task-v2/follow",
      onGoBack: handleGoBack,
      enableEdit: false,
      enableDelete: true,
      enableApprove: true,
      enableDone: true,
      enableRefuse: true,
      enableGiaoViec: true,
      enableClose: true,
      enableRestore: true,
      enableRejectApprove: true,
      deleteRedirectPath: "/task-v2/follow",
      useToastForDelete: true,
      enableRevoke: true,
    },
    searchV2: {
      breadcrumbLabel: "Công việc đã giao",
      breadcrumbHref: "/task-v2/search",
      onGoBack: handleGoBack,
      enableEdit: false,
      enableDelete: true,
      enableApprove: true,
      enableDone: true,
      enableRefuse: true,
      enableGiaoViec: true,
      enableClose: true,
      enableRestore: true,
      enableRejectApprove: true,
      deleteRedirectPath: "/task-v2/search",
      useToastForDelete: false,
      enableRevoke: true,
    },
  };
  return configs[pageType];
};

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const isV2 = useMemo(() => {
    return pathname?.includes("/task-v2");
  }, [pathname]);

  const { mutateAsync: updateAcceptTask } = useUpdateAcceptTask(isV2 ?? false);
  const { mutateAsync: deleteTask } = useDeleteTaskAction(isV2 ?? false);

  // Determine page type from pathname
  const pageType: PageType = useMemo(() => {
    if (pathname?.includes("/task/assign/detail")) return "assign";
    if (pathname?.includes("/task/listTaskOrg/detail")) return "listTaskOrg";
    if (pathname?.includes("/task/search/detail")) return "search";
    if (pathname?.includes("/task/work/detail")) return "work";
    if (pathname?.includes("/task/combination/detail")) return "combination";
    if (pathname?.includes("/task/follow/detail")) return "follow";
    if (pathname?.includes("/task-v2/assign/detail")) return "assignV2";
    if (pathname?.includes("/task-v2/work/detail")) return "workV2";
    if (pathname?.includes("/task-v2/combination/detail"))
      return "combinationV2";
    if (pathname?.includes("/task-v2/listTaskOrg/detail"))
      return "listTaskOrgV2";
    if (pathname?.includes("/task-v2/follow/detail")) return "followV2";
    if (pathname?.includes("/task-v2/search/detail")) return "searchV2";
    return "assign"; // default
  }, [pathname]);

  const config = getPageConfig(pageType);

  const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<number | null>(null);
  const [isCheckUserEdit, setIsCheckUserEdit] = useState(false);
  const [isOpenDoneDialog, setIsOpenDoneDialog] = useState(false);
  const [isOpenConfirmDialog, setIsOpenConfirmDialog] = useState(false);
  const [isOpenRefuseDialog, setIsOpenRefuseDialog] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isOpenGiaoViecDialog, setIsOpenGiaoViecDialog] = useState(false);
  const [UserInfo, setUserInfo] = useState<any>(null);
  const [assigner, setAssigner] = useState(false);
  const [handlerId, setHandlerId] = useState<number | null>(null);
  const [type, setType] = useState<number | null>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [listOrgId, setListOrgId] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const info = getUserInfo();
    setUserInfo(info ? JSON.parse(info) : {});
  }, []);

  useEffect(() => {
    setIsEdit(searchParams?.get("edit") === "true");
    setHandlerId(
      searchParams?.get("handlerId")
        ? Number(searchParams.get("handlerId"))
        : null
    );
    setType(
      searchParams?.get("type") ? Number(searchParams.get("type")) : null
    );
    setStatus(
      searchParams?.get("status") ? Number(searchParams.get("status")) : null
    );
    setListOrgId(
      searchParams?.get("listOrgId")
        ? (searchParams.get("listOrgId") as string)
        : null
    );
  }, [searchParams]);

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
  }, [pathname]);

  const taskId = params?.id ? parseInt(params.id as string) : 0;

  const {
    data: taskData,
    isLoading,
    error,
    refetch,
  } = useGetFindByIdTask(taskId, !isV2);

  const {
    data: taskDataV2,
    isLoading: isLoadingV2,
    error: errorV2,
    refetch: refetchV2,
  } = useGetFindByIdTaskV2(taskId, isV2);

  const taskDataMerged = isV2 ? taskDataV2 : taskData;
  const isLoadingMerged = isV2 ? isLoadingV2 : isLoading;
  const errorMerged = isV2 ? errorV2 : error;
  const refetchMerged = isV2 ? refetchV2 : refetch;

  const { data: commentList, refetch: refetchCommentList } = useQuery({
    queryKey: [queryKeys.task.commentList, taskId],
    queryFn: () => TaskService.getComments(taskId),
    enabled: !isV2,
  });

  const { data: resultList, refetch: refetchResultList } = useQuery({
    queryKey: [queryKeys.task.resultList, taskId],
    queryFn: () => TaskService.getResults(taskId),
    enabled: !isV2,
  });

  const { data: commentListV2, refetch: refetchCommentListV2 } = useQuery({
    queryKey: [queryKeys.taskv2.commentList, taskId],
    queryFn: () => TaskV2Service.getComments(taskId),
    enabled: isV2,
  });

  const { data: resultListV2, refetch: refetchResultListV2 } = useQuery({
    queryKey: [queryKeys.taskv2.resultList, taskId],
    queryFn: () => TaskV2Service.getResults(taskId),
    enabled: isV2,
  });

  const commentListMerged = isV2 ? commentListV2 : commentList;
  const resultListMerged = isV2 ? resultListV2 : resultList;
  const refetchCommentListMerged = isV2
    ? refetchCommentListV2
    : refetchCommentList;
  const refetchResultListMerged = isV2
    ? refetchResultListV2
    : refetchResultList;

  const checkSpecialUserEdit = (
    userInfo: any,
    taskData: any,
    specialUserList: any[]
  ) => {
    if (!userInfo || !taskData) return false;

    const userAssignName = taskData.userAssignName;
    const userFullName = userInfo.fullName;

    // If no special user list, use basic check
    if (!specialUserList?.length) {
      return userFullName === userAssignName;
    }

    const specialUserNames = new Set(
      specialUserList.map((user: any) => user.fullName)
    );

    if (userFullName === userAssignName) {
      return true;
    }

    if (userAssignName === "Thư ký lãnh đạo Ban") {
      return (
        specialUserNames.has(userFullName) ||
        userFullName === "Thư ký lãnh đạo Ban"
      );
    }

    if (specialUserNames.has(userAssignName)) {
      return (
        userFullName === userAssignName ||
        userFullName === "Thư ký lãnh đạo Ban"
      );
    }

    return false;
  };

  const isUserEditAllowed = useMemo(() => {
    if (!UserInfo || !taskDataMerged) return false;

    if (taskId === 2) {
      return checkSpecialUserEdit(
        UserInfo,
        taskDataMerged,
        taskDataMerged || []
      );
    } else {
      return false;
    }
  }, [UserInfo, taskDataMerged, taskId]);

  useEffect(() => {
    const checkUserEdit = async () => {
      if (taskId === 2) {
        setIsCheckUserEdit(isUserEditAllowed);
      } else {
        try {
          const data = await UserService.doGetListListTaskAssignerByOrgId("2");
          if (data) {
            const result = checkSpecialUserEdit(UserInfo, taskDataMerged, data);
            setIsCheckUserEdit(result);
          }
        } catch (error) {
          handleError(error);
          setIsCheckUserEdit(false);
        }
      }
    };

    if (taskDataMerged) {
      checkUserEdit();
    }
  }, [taskDataMerged, UserInfo, taskId, isUserEditAllowed]);

  const handleCloseDoneDialog = () => {
    setIsOpenDoneDialog(false);
  };

  const handleCloseRefuseDialog = () => {
    setIsOpenRefuseDialog(false);
  };

  const handleEdit = () => {
    setIsEdit(!isEdit);
  };

  const handleGiaoViec = () => {
    setIsOpenGiaoViecDialog(true);
  };

  const handleSave = (formData?: any) => {
    queryClient.invalidateQueries({
      queryKey: [
        isV2
          ? queryKeys.taskv2.getFindByIdTask
          : queryKeys.task.getFindByIdTask,
        taskId,
      ],
    });
    setIsEdit(false);
  };

  const handleConfirmDeleteTask = async () => {
    try {
      await deleteTask(taskId);
      if (config.useToastForDelete) {
        ToastUtils.success("Xóa công việc thành công");
      } else {
        ToastUtils.success("Xóa công việc thành công");
      }
      router.push(config.deleteRedirectPath);
    } catch (error) {
      if (config.useToastForDelete) {
        ToastUtils.error("Xóa công việc thất bại");
      } else {
        handleError(error);
      }
    }
  };

  const updateAccept = async (
    taskId: number,
    status: number,
    isExecute: boolean,
    userId: number,
    comment?: string,
    files?: any
  ) => {
    try {
      const res = await updateAcceptTask({
        taskId,
        status,
        isExcute: isExecute,
        userId,
        comment,
        files,
      });

      if (res) {
        ToastUtils.success(getMessageSuccess(status));
        await notificationService.countUnreadNotification();
        queryClient.invalidateQueries({
          queryKey: [
            isV2
              ? queryKeys.taskv2.getFindByIdTask
              : queryKeys.task.getFindByIdTask,
            taskId,
          ],
        });
        if (
          pageType === "assign" ||
          pageType === "search" ||
          pageType === "assignV2" ||
          pageType === "searchV2"
        ) {
          queryClient.invalidateQueries({
            queryKey: [
              isV2 ? queryKeys.taskv2.getAction : queryKeys.task.getAction,
              taskId,
              true,
            ],
          });
        } else if (
          pageType === "work" ||
          pageType === "combination" ||
          pageType === "follow" ||
          pageType === "workV2" ||
          pageType === "combinationV2" ||
          pageType === "followV2"
        ) {
          queryClient.invalidateQueries({
            queryKey: [
              isV2 ? queryKeys.taskv2.getAction : queryKeys.task.getAction,
              taskId,
              false,
            ],
          });
        }
        if (status !== 1) {
          router.refresh();
        }
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleConfirmApprove = async () => {
    if (selectedTaskId && selectedStatus !== null) {
      await updateAccept(
        selectedTaskId,
        selectedStatus,
        assigner,
        UserInfo?.id
      );
      setIsOpenConfirmDialog(false);
      setSelectedTaskId(null);
      setSelectedStatus(null);
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

  const getMessageSuccess = (status: number) => {
    switch (status) {
      case 4:
        return "Đóng công việc thành công.";
      case 1:
        return "Tiếp nhận công việc thành công.";
      case 5:
        return "Thu hồi công việc thành công.";
      case 0:
        return "Khôi phục công việc thành công.";
      case 3:
        return "Công việc đã hoàn thành.";
      default:
        return "Xác nhận công việc thành công.";
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
        if (isV2) {
          await updateAccept(taskId, 3, assigner, UserInfo?.id, "", []);
        } else {
          setIsOpenDoneDialog(true);
        }
        break;
      case 5:
        setIsOpenConfirmDialog(true);
        break;
      case 0:
        setIsOpenConfirmDialog(true);
        break;
    }
  };

  return (
    <div className="container mx-auto px-4">
      <BreadcrumbNavigation
        items={[
          {
            href: "/",
            label: "Quản lý công việc",
          },
          {
            href: config.breadcrumbHref,
            label: config.breadcrumbLabel,
          },
        ]}
        showHome={false}
        currentPage="Chi tiết công việc"
      />
      <div className="flex gap-6">
        <DetailLayoutLeft
          data={taskDataMerged}
          UserInfo={UserInfo}
          isCheckUserEdit={isCheckUserEdit}
          onGoBack={() => config.onGoBack(router)}
          onTodo={config.enableApprove ? confirmApprove : undefined}
          onReject={config.enableRefuse ? confirmApprove : undefined}
          onComplete={config.enableDone ? confirmApprove : undefined}
          onRevokeFinish={config.enableApprove ? confirmApprove : undefined}
          onDelete={config.enableDelete ? handleConfirmDeleteTask : undefined}
          onEdit={config.enableEdit ? handleEdit : undefined}
          isEdit={isEdit}
          onSave={config.enableEdit ? handleSave : undefined}
          onGiaoViec={config.enableGiaoViec ? handleGiaoViec : undefined}
          onClose={config.enableClose ? confirmApprove : undefined}
          onRestore={config.enableRestore ? confirmApprove : undefined}
          onRejectApprove={
            config.enableRejectApprove ? confirmApprove : undefined
          }
          onRevoke={config.enableRevoke ? confirmApprove : undefined}
          handlerId={handlerId || undefined}
          type={type || undefined}
          status={status || undefined}
          listOrgId={listOrgId || undefined}
          isV2={isV2}
        />
        <DetailLayoutRight
          data={taskDataMerged}
          taskId={taskId}
          task={taskDataMerged}
          commentList={commentListMerged}
          resultList={resultListMerged}
          refetchCommentList={refetchCommentListMerged}
          refetchResultList={refetchResultListMerged}
          isV2={isV2}
        />
      </div>

      {config.enableDone && (
        <DoneTask
          isOpen={isOpenDoneDialog}
          onOpenChange={setIsOpenDoneDialog}
          onClose={handleCloseDoneDialog}
          isExecute={assigner}
          taskId={taskId}
          refetch={() => {
            queryClient.invalidateQueries({
              queryKey: [
                isV2 ? queryKeys.taskv2.getAction : queryKeys.task.getAction,
                taskId,
                false,
              ],
            });
            refetchMerged();
            if (
              pageType === "search" ||
              pageType === "work" ||
              pageType === "workV2" ||
              pageType === "combination" ||
              pageType === "combinationV2"
            ) {
              refetchCommentListMerged();
            }
          }}
          UserInfo={UserInfo}
          isV2={isV2}
        />
      )}

      {config.enableRefuse && (
        <RefuseTask
          isOpen={isOpenRefuseDialog}
          onOpenChange={setIsOpenRefuseDialog}
          onClose={handleCloseRefuseDialog}
          isExecute={false}
          taskId={taskId}
          refetch={() => {
            queryClient.invalidateQueries({
              queryKey: [
                isV2 ? queryKeys.taskv2.getAction : queryKeys.task.getAction,
                taskId,
                false,
              ],
            });
            refetchMerged();
            if (
              pageType === "search" ||
              pageType === "work" ||
              pageType === "combination" ||
              pageType === "workV2" ||
              pageType === "combinationV2"
            ) {
              refetchCommentListMerged();
            }
          }}
          UserInfo={UserInfo}
          isV2={isV2}
        />
      )}

      {config.enableApprove && (
        <ConfirmDeleteDialog
          isOpen={isOpenConfirmDialog}
          onOpenChange={setIsOpenConfirmDialog}
          onConfirm={handleConfirmApprove}
          title="Xác nhận"
          description={getConfirmMessage(selectedStatus || 0)}
        />
      )}

      {config.enableGiaoViec && (
        <WorkAssignDialog
          open={isOpenGiaoViecDialog}
          onClose={() => {
            setIsOpenGiaoViecDialog(false);
            refetchMerged();
          }}
          isAddChildTask={true}
          parentTaskFromDetail={taskDataMerged}
          isV2={isV2}
        />
      )}

      <LoadingFull isLoading={isLoadingMerged} />
    </div>
  );
}
