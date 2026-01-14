"use client";

import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronDown, ChevronUp } from "lucide-react";
import CommentSection from "./CommentSection";
import ResultSection from "./ResultSection";
import { usePathname } from "next/navigation";
import ProgressDialog from "../ProgressDialog";
import { TaskService } from "@/services/task.service";
import { ToastUtils } from "@/utils/toast.utils";
import { handleError } from "@/utils/common.utils";
import { TaskV2Service } from "@/services/taskv2.service";

interface DetailLayoutRightProps {
  taskId: number;
  task: any;
  data: any;
  commentList: any[];
  resultList: any[];
  onCommentAdded?: () => void;
  onResultAdded?: () => void;
  refetchCommentList?: () => void;
  refetchResultList?: () => void;
  isV2?: boolean;
}

export default function DetailLayoutRight({
  taskId,
  task,
  data,
  commentList,
  resultList,
  onCommentAdded,
  onResultAdded,
  refetchCommentList,
  refetchResultList,
  isV2 = false,
}: DetailLayoutRightProps) {
  const [collapseHistoryState, setCollapseHistoryState] = useState(true);
  const [expandedHistoryItems, setExpandedHistoryItems] = useState<Set<number>>(
    new Set()
  );
  const [isReportResult, setIsReportResult] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isOpenProgress, setIsOpenProgress] = useState(false);
  const [collapseProgressState, setCollapseProgressState] = useState(true);

  const UserInfo = useMemo(() => {
    if (typeof window === "undefined") return {};
    return JSON.parse(localStorage.getItem("userInfo") || "{}");
  }, []);

  const pathname = usePathname();

  useEffect(() => {
    const userLogin = UserInfo;
    if (
      pathname?.includes("/task/work") ||
      pathname?.includes("/task/assign") ||
      pathname?.includes("/task-v2/work") ||
      pathname?.includes("/task-v2/assign") ||
      userLogin.org == 2
    ) {
      setIsReportResult(true);
    } else {
      setIsReportResult(false);
    }
    setCurrentUser(userLogin.id);
  }, [pathname, UserInfo]);

  const toggleHistoryItem = (index: number) => {
    const newExpanded = new Set(expandedHistoryItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedHistoryItems(newExpanded);
  };

  const toggleProgressDialog = (open: boolean) => {
    setIsOpenProgress(open);
  };

  const updateProgress = async ({
    progress,
    comment,
  }: {
    progress: number;
    comment: string;
  }) => {
    try {
      const data = new FormData();
      Object.entries({ progress, comment }).forEach(([key, value]) => {
        data.append(key, String(value));
      });
      const updater = isV2
        ? TaskV2Service.updateProgressV2
        : TaskService.updateProgress;
      await updater(task.id, data);
      ToastUtils.success("Thiết lập tiến độ thành công");
      task.progress = progress;
    } catch (error) {
      handleError(error);
    }
  };
  const progressPercentage = useMemo(() => {
    if (!task) return 0;
    let progressValue: number;
    if (typeof task.progress === "string") {
      progressValue = parseInt(task.progress.replace("%", ""), 10);
    } else if (typeof task.progress === "number") {
      progressValue = task.progress;
    } else {
      progressValue = 0;
    }
    const pct = Math.max(0, Math.min(progressValue, 100));
    return pct;
  }, [task?.progress]);

  const getProgressBarColor = (percentage: number) => {
    if (percentage === 100) return "bg-green-500";
    if (percentage >= 75) return "bg-blue-600";
    if (percentage >= 50) return "bg-yellow-500";
    if (percentage >= 25) return "bg-orange-500";
    return "bg-red-500";
  };

  const ProgressBar = ({ progress }: { progress: number }) => {
    const percentage = Math.min(Math.max(progress || 0, 0), 100);

    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-700">
            {percentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(percentage)}`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };
  return (
    <div className="w-full lg:w-1/3 mt-4 gap-4">
      <Card className="border-none rounded-none ">
        <CardHeader className="p-0">
          <div
            className="flex items-center justify-between cursor-pointer p-4 bg-gray-100 rounded-none"
            onClick={() => setCollapseHistoryState(!collapseHistoryState)}
          >
            <span className="font-weight-bold text-info m-0 text-blue-600">
              Lịch sử chỉnh sửa
            </span>
            <div className="text-warning">
              {collapseHistoryState ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </div>
          </div>
        </CardHeader>
        {collapseHistoryState && (
          <>
            {task?.taskHistorys && task.taskHistorys.length > 0 ? (
              <CardContent className="p-1">
                {task.taskHistorys.map((item: any, index: number) => {
                  const isExpanded = expandedHistoryItems.has(index);
                  return (
                    <div key={index} className="my-2">
                      <div
                        className="flex items-center justify-between cursor-pointer p-2 hover:bg-gray-50 rounded"
                        onClick={() => toggleHistoryItem(index)}
                      >
                        <div className="flex-1">
                          <span className="font-weight-bold text-sm">
                            {item.creator} -{" "}
                            {new Date(item.createDate).toLocaleDateString(
                              "vi-VN",
                              {
                                day: "2-digit",
                                month: "2-digit",
                                year: "numeric",
                              }
                            )}{" "}
                            {new Date(item.createDate).toLocaleTimeString(
                              "vi-VN",
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false,
                              }
                            )}
                          </span>
                        </div>
                        <div className="text-warning">
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="ml-4 p-2 bg-gray-50 rounded text-sm">
                          <div className="mb-2">
                            <span className="font-weight-bold">
                              Tên công việc:{" "}
                            </span>
                            <span>{item.taskName}</span>
                          </div>
                          <div>
                            <span className="font-weight-bold">Mô tả: </span>
                            <span>{item.description}</span>
                          </div>
                        </div>
                      )}

                      {index < task.taskHistorys.length - 1 && (
                        <div className="border-b border-gray-200 pt-2" />
                      )}
                    </div>
                  );
                })}
              </CardContent>
            ) : (
              <CardContent className="text-center p-1">
                <span className="text-muted font-italic">
                  Không có lịch sử chỉnh sửa !
                </span>
              </CardContent>
            )}
          </>
        )}
      </Card>
      {!isV2 && (
        <Card className="border-none rounded-none mt-4">
          <CardHeader className="p-0">
            <div
              className="flex items-center justify-between cursor-pointer p-4 bg-gray-100 rounded-none"
              onClick={() => setCollapseProgressState(!collapseProgressState)}
            >
              <span className="font-weight-bold text-info m-0 text-blue-600">
                Tiến độ
              </span>
              <div className="text-warning">
                {collapseProgressState ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
            </div>
          </CardHeader>
          {!collapseProgressState && (
            <CardContent className="p-4">
              <div
                className="relative w-full overflow-hidden cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpenProgress(true);
                }}
                title={`${progressPercentage}%`}
                role="progressbar"
                aria-valuenow={progressPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
              >
                <ProgressBar progress={progressPercentage} />
              </div>
            </CardContent>
          )}
        </Card>
      )}
      <div className="mt-4">
        <CommentSection
          taskId={taskId}
          commentList={commentList}
          currentUserId={currentUser}
          onCommentAdded={onCommentAdded}
          userInfo={UserInfo}
          refetchCommentList={refetchCommentList}
          isV2={isV2}
        />
      </div>

      <div className="mt-4">
        <ResultSection
          taskId={taskId}
          resultList={resultList}
          currentUserId={currentUser}
          isReportResult={isReportResult}
          onResultAdded={onResultAdded}
          userInfo={UserInfo}
          refetchResultList={refetchResultList}
          isV2={isV2}
        />
      </div>

      <ProgressDialog
        isOpen={isOpenProgress}
        onToggle={toggleProgressDialog}
        progress={typeof task?.progress === "number" ? task.progress : 0}
        onSubmit={async (data) => {
          await updateProgress(data);
        }}
      />
    </div>
  );
}
