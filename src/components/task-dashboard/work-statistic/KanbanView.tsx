"use client";

import React, { useState, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
  DragOverlay as Overlay,
} from "@dnd-kit/core";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  useSetImportantKanban,
  useListDashboard,
  useUpdateUserHandle,
  useUpdateStatusKanban,
} from "@/hooks/data/task-dashboard.data";
import {
  formatTaskDate,
  getDaysUntilDue as getDaysUntilDueUtil,
  getColorComplexity as getColorComplexityUtil,
  TaskStatusLabel,
} from "@/utils/dashboard.utils";
import { TaskStatusColor } from "@/utils/color.utils";
import {
  Calendar,
  Clock,
  Star,
  ChevronDown,
  ChevronUp,
  Plus,
  University,
} from "lucide-react";
import { KanbanCard } from "./KanbanCard";
import WorkAssignDialog from "@/components/work-assign/createDialog";
import LoadingFull from "@/components/common/LoadingFull";
import "@/styles/KanbanView.css";
import { ToastUtils } from "@/utils/toast.utils";
import { STORAGE_KEYS } from "@/definitions/constants/storageKey.constant";
import { useSidebarStore } from "@/stores/sideBar.store";
import StatisticPopup from "./StatisticPopup";
import GanttModal from "../statistic/GanttModal";

interface KanbanViewProps {
  listData?: any[];
  checkReloadDataKanban?: (event: string) => void;
  isDashboard?: boolean;
  listPhong?: any[];
  callPhong?: (isDonvi: boolean, id: any) => void;
  callDonvi?: (isDonvi: boolean, id: any) => void;
  loading?: boolean;
  listUser?: any[];
  //idDonvi?: number;
}

export default function KanbanView({
  listData = [],
  checkReloadDataKanban,
  isDashboard,
  listPhong = [],
  callPhong,
  callDonvi,
  loading = false,
  listUser = [],
  // idDonvi,
}: KanbanViewProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { setPreviousMenuSideBar } = useSidebarStore();
  const [data, setData] = useState(listData);
  const [internalLoading, setInternalLoading] = useState(false);
  const [activeTask, setActiveTask] = useState<any>(null);
  const [editingProcessor, setEditingProcessor] = useState<{
    taskId: number;
    userId: number;
    status: number;
    taskIndex: number;
    listUser: any[];
  } | null>(null);
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState(false);
  const [addTaskContext, setAddTaskContext] = useState<{
    type: number;
    handlerId: number;
  } | null>(null);
  const [selectOrgForPopup, setSelectOrgForPopup] = useState<any>(null);
  const [selectedUserForPopup, setSelectedUserForPopup] = useState<{
    orgId: string;
    orgName: string;
  } | null>(null);
  const [showStatisticPopup, setShowStatisticPopup] = useState(false);
  const [showUserPopup, setShowUserPopup] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleStatisticPopupClick = (
    event: React.MouseEvent<HTMLSpanElement>,
    item: any
  ) => {
    event.stopPropagation();
    if (item.type === 1) {
      setSelectOrgForPopup(item);
      setShowStatisticPopup(true);
    } else {
      setSelectedUserForPopup({
        orgId: item.handlerId,
        orgName: item.handlerName,
      });
      setShowUserPopup(true);
    }
  };

  useEffect(() => {
    if (!listData || listData.length === 0) {
      setData(listData || []);
      return;
    }

    const startTime = Date.now();
    setInternalLoading(true);

    setData((prevData) => {
      if (!prevData || !Array.isArray(prevData) || prevData.length === 0) {
        return listData.map((user: any) => ({
          ...user,
          isOpen: false,
        }));
      }

      const isOpenMap = new Map<number, boolean>();
      prevData.forEach((user: any) => {
        if (user.handlerId && user.isOpen !== undefined) {
          isOpenMap.set(user.handlerId, user.isOpen);
        }
      });

      const newData = listData.map((user: any) => {
        return {
          ...user,
          isOpen: isOpenMap.has(user.handlerId)
            ? isOpenMap.get(user.handlerId)
            : (user.isOpen ?? false),
        };
      });

      return newData;
    });

    const elapsedTime = Date.now() - startTime;
    const minLoadingTime = 1000;
    const remainingTime = Math.max(0, minLoadingTime - elapsedTime);

    if (remainingTime > 0) {
      setTimeout(() => {
        setInternalLoading(false);
      }, remainingTime);
    } else {
      setInternalLoading(false);
    }
  }, [listData]);

  const setImportantKanbanMutation = useSetImportantKanban();
  const listDashboardMutation = useListDashboard();
  const updateUserHandleMutation = useUpdateUserHandle();
  const updateStatusKanbanMutation = useUpdateStatusKanban();

  const getDaysUntilDue = (endDate: number | string): number => {
    return getDaysUntilDueUtil(endDate);
  };

  const openBoard = (item: any) => {
    setData((prevData) =>
      prevData.map((user) =>
        user.handlerId === item.handlerId
          ? { ...user, isOpen: user.isOpen == null ? true : !user.isOpen }
          : user
      )
    );
  };

  const onHeaderDoubleClick = (item: any) => {
    if (item.type === 1) {
      if (listPhong.length > 0) {
        callPhong?.(false, item.handlerId);
      } else {
        callDonvi?.(true, item.handlerId);
      }
    }
  };

  const getStatistics = (item: any) => {
    const stats = {
      total: 0,
      new: 0,
      inProgress: 0,
      waitingReview: 0,
    };

    if (item.columns && Array.isArray(item.columns)) {
      item.columns.forEach((column: any) => {
        const taskCount = column.tasks ? column.tasks.length : 0;
        stats.total += taskCount;
        if (column.status === 0) {
          stats.new += taskCount;
        } else if (column.status === 1) {
          stats.inProgress += taskCount;
        } else if (column.status === 3) {
          stats.waitingReview += taskCount;
        }
      });
    }

    return stats;
  };

  const updateImportant = async (
    task: any,
    userId: number,
    status: number,
    taskIndex: number
  ) => {
    const newImportantState = !task.important;

    setData((prevData) =>
      prevData.map((user) => {
        if (user.handlerId === userId) {
          return {
            ...user,
            columns: user.columns?.map((col: any) => {
              if (col.status === status) {
                return {
                  ...col,
                  tasks: col.tasks.map((t: any, idx: number) =>
                    idx === taskIndex
                      ? { ...t, important: newImportantState }
                      : t
                  ),
                };
              }
              return col;
            }),
          };
        }
        return user;
      })
    );

    try {
      await setImportantKanbanMutation.mutateAsync({
        taskId: task.taskId,
        type: "GIAO_VIEC",
      });
    } catch (error) {
      setData((prevData) =>
        prevData.map((user) => {
          if (user.handlerId === userId) {
            return {
              ...user,
              columns: user.columns?.map((col: any) => {
                if (col.status === status) {
                  return {
                    ...col,
                    tasks: col.tasks.map((t: any, idx: number) =>
                      idx === taskIndex
                        ? { ...t, important: !newImportantState }
                        : t
                    ),
                  };
                }
                return col;
              }),
            };
          }
          return user;
        })
      );
      ToastUtils.error("Không thể cập nhật trạng thái quan trọng");
    }
  };

  const loadUserXlc = async (
    task: any,
    userId: number,
    status: number,
    taskIndex: number
  ) => {
    try {
      const users = await listDashboardMutation.mutateAsync({
        taskId: task.taskId,
      });
      if (!users || users.length === 0) {
        ToastUtils.error(
          "Không có người phù hợp để thay đổi người xử lý chính"
        );
      } else {
        setEditingProcessor({
          taskId: task.taskId,
          userId,
          status,
          taskIndex,
          listUser: users,
        });
      }
    } catch (error: any) {
      ToastUtils.error("Không thể tải danh sách người xử lý");
    }
  };

  const updateProcessor = async (
    task: any,
    newUserId: number,
    userId: number,
    status: number,
    taskIndex: number
  ) => {
    try {
      const result = await updateUserHandleMutation.mutateAsync({
        taskId: task.taskId,
        newUserId,
        userId: task.executeId,
      });

      if (result) {
        const selectedUser = editingProcessor?.listUser.find(
          (u) => u.id === newUserId
        );

        setData((prevData) =>
          prevData.map((user) => {
            if (user.handlerId === userId) {
              return {
                ...user,
                columns: user.columns?.map((col: any) => {
                  if (col.status === status) {
                    return {
                      ...col,
                      tasks: col.tasks.map((t: any, idx: number) =>
                        idx === taskIndex
                          ? {
                              ...t,
                              execute: selectedUser?.fullName || t.execute,
                              executeId: newUserId,
                            }
                          : t
                      ),
                    };
                  }
                  return col;
                }),
              };
            }
            return user;
          })
        );

        checkReloadDataKanban?.("reload");

        ToastUtils.success("Đổi người xử lý chính thành công");
      }
    } catch (error) {
      ToastUtils.error("Không thể cập nhật người xử lý");
    } finally {
      setEditingProcessor(null);
    }
  };

  const viewTaskDetail = (taskId: number, task: any, item: any) => {
    const currentMenuSidebar = localStorage.getItem(STORAGE_KEYS.MENU_SIDEBAR);
    if (currentMenuSidebar) {
      setPreviousMenuSideBar(currentMenuSidebar);
    }
    localStorage.setItem(STORAGE_KEYS.MENU_SIDEBAR, "/task/search");
    const listOrgId = listData.map((user: any) => user.handlerId).join(",");
    const status = task.status;
    const type = item.type;
    const handlerId = item.handlerId;
    router.push(
      `/task/search/detail/${taskId}?handlerId=${handlerId}&type=${type}&status=${status}&listOrgId=${listOrgId}`
    );
  };

  // const addTask = (item: any) => {
  //   const type = item.type == 2 ? 0 : 2;
  //   setAddTaskContext({
  //     type: type,
  //     handlerId: item.handlerId,
  //   });
  //   setIsAddTaskModalOpen(true);
  // };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const taskData = active.data.current;
    if (taskData && taskData.task) {
      setActiveTask(taskData.task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {};

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveTask(null);

    if (!over) {
      return;
    }

    const activeData = active.data.current;
    if (!activeData || !activeData.task) {
      return;
    }

    const srcUserId = activeData.userId;
    const srcStatus = activeData.status;
    const taskId = activeData.task.taskId;
    const dataType = activeData.type;
    const srcTaskIndex = activeData.taskIndex;
    const uniqueId = activeData.uniqueId;

    let tgtUserId: number;
    let tgtStatus: number;

    const overId = String(over.id);

    if (overId.startsWith("column-")) {
      const parts = overId.split("-");
      if (parts.length >= 3) {
        tgtUserId = parseInt(parts[1], 10);
        tgtStatus = parseInt(parts[2], 10);
      } else {
        return;
      }
    } else if (overId.startsWith("task-")) {
      const overData = over.data.current;
      if (
        !overData ||
        overData.status === undefined ||
        overData.userId === undefined
      ) {
        return;
      }
      tgtUserId = overData.userId;
      tgtStatus = overData.status;
    } else {
      return;
    }

    if (srcUserId !== tgtUserId && tgtStatus !== 0) {
      ToastUtils.error(
        "Chỉ có thể chuyển công việc sang cột 'Mới giao' của người khác"
      );
      return;
    }

    if (srcStatus === tgtStatus && srcUserId === tgtUserId) {
      return;
    }

    let srcColumn: any = null;
    let tgtColumn: any = null;
    let taskToMove: any = null;

    const previousData = data;

    const newData = data.map((user) => {
      const newUser = { ...user };

      if (user.handlerId === srcUserId) {
        newUser.columns = user.columns?.map((col: any) => {
          if (col.status === srcStatus) {
            srcColumn = col;
            if (
              srcTaskIndex !== undefined &&
              srcTaskIndex >= 0 &&
              srcTaskIndex < col.tasks.length
            ) {
              const taskAtIndex = col.tasks[srcTaskIndex];
              if (taskAtIndex && taskAtIndex.taskId === taskId) {
                taskToMove = { ...taskAtIndex };
                return {
                  ...col,
                  tasks: col.tasks.filter(
                    (_: any, idx: number) => idx !== srcTaskIndex
                  ),
                };
              }
            }
          }
          return col;
        });
      }

      if (user.handlerId === tgtUserId) {
        newUser.columns = user.columns?.map((col: any) => {
          if (col.status === tgtStatus) {
            tgtColumn = col;
            if (taskToMove) {
              return {
                ...col,
                tasks: [taskToMove, ...col.tasks],
              };
            }
          }
          return col;
        });
      }

      return newUser;
    });

    if (!taskToMove) {
      return;
    }

    setData(newData);

    try {
      await updateStatusKanbanMutation.mutateAsync({
        taskId,
        fromStatus: srcStatus,
        toStatus: tgtStatus,
        frUserId: srcUserId,
        toUserId: tgtUserId,
        type: dataType,
      });

      if (checkReloadDataKanban) {
        checkReloadDataKanban("reload");
      }
    } catch (error) {
      setData(previousData);

      ToastUtils.error(
        "Trạng thái công việc không cho phép bạn thực hiện thao tác này"
      );
    }
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      collisionDetection={closestCenter}
    >
      <div className="kanban-container">
        {data.map((item) => (
          <div key={item.handlerId} className="list-kanban">
            <div
              className="kanban-header"
              onClick={() => openBoard(item)}
              onDoubleClick={() => onHeaderDoubleClick(item)}
            >
              <div className="user-info">
                {item.type === 1 ? (
                  <>
                    <University className="w-5 h-5 text-[#00a7ff] mx-1" />
                    <div className="user-details">
                      <h3>{item.handlerName}</h3>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="user-avatar">{item.handlerNameSub}</div>
                    <div className="user-details">
                      <h3>{item.handlerName}</h3>
                      <p>{item.orgName}</p>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center gap-8">
                <div
                  className="stats-info"
                  onClick={(event) => handleStatisticPopupClick(event, item)}
                >
                  <div className="stat-item">
                    <span className="stat-label">Số việc:</span>
                    <span className="stat-value cursor-pointer hover:text-blue-600">
                      {item.count}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Mới giao:</span>
                    <span className="stat-value">
                      {getStatistics(item).new}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Đang thực hiện:</span>
                    <span className="stat-value">
                      {getStatistics(item).inProgress}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Chờ đánh giá:</span>
                    <span className="stat-value">
                      {getStatistics(item).waitingReview}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Tiến độ:</span>
                    <span className="stat-value completion-rate cursor-pointer hover:text-blue-600">
                      <Clock className="w-4 h-4" />
                      {item.progress} %
                    </span>
                  </div>
                </div>
                <div className="stat-item">
                  <span className="stat-value completion-rate">
                    {item.isOpen ? (
                      <ChevronDown className="w-6 h-6" />
                    ) : (
                      <ChevronUp className="w-6 h-6" />
                    )}
                  </span>
                </div>
              </div>
            </div>

            {item.isOpen && (
              <div className="kanban-board">
                {item.columns?.map((column: any) => {
                  const columnId = `column-${item.handlerId}-${column.status}`;

                  return (
                    <div key={columnId} className="kanban-column">
                      <div
                        className="column-header"
                        style={{
                          borderLeftColor: TaskStatusColor[column.status],
                        }}
                      >
                        <div className="column-title">
                          <span
                            className="column-indicator"
                            style={{ backgroundColor: column.color }}
                          ></span>
                          <span>{TaskStatusLabel[column.status]}</span>
                        </div>
                        <div className="column-actions">
                          <span className="column-count">
                            {column.tasks?.length || 0}
                          </span>
                          {/* {column.status === 0 && (
                            <button
                              className="btn-add"
                              onClick={() => addTask(item)}
                            >
                              +
                            </button>
                          )} */}
                        </div>
                      </div>

                      <div
                        className="tasks-list-droppable"
                        data-column-id={columnId}
                      >
                        <KanbanCard
                          columnId={columnId}
                          tasks={column.tasks || []}
                          userId={item.handlerId}
                          status={column.status}
                          type={item.type}
                          editingProcessor={editingProcessor}
                          onUpdateImportant={updateImportant}
                          onViewDetail={(taskId, task) => {
                            viewTaskDetail(taskId, task, item);
                          }}
                          onLoadUserXlc={loadUserXlc}
                          onUpdateProcessor={updateProcessor}
                          onCancelEdit={() => setEditingProcessor(null)}
                          getDaysUntilDue={getDaysUntilDue}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTask ? (
          <div
            className="task-card task-card-dragging"
            style={{ width: "280px", opacity: 0.9 }}
          >
            <div className="task-header">
              {activeTask.important ? (
                <Star className="star-icon fill-yellow-400 text-yellow-400" />
              ) : (
                <Star className="star-icon-outline text-gray-400" />
              )}
              <h4
                className="task-title limit-2-lines"
                title={activeTask.taskName}
              >
                {activeTask.taskName}
              </h4>
            </div>

            {activeTask.overdue && (
              <div className="task-badge">
                <Clock className="w-4 h-4" />
                <span>Quá hạn</span>
              </div>
            )}

            {!activeTask.overdue &&
              getDaysUntilDueUtil(activeTask.endDate) > 0 && (
                <div className="task-untilDue">
                  <Clock className="w-4 h-4" style={{ fontSize: "15px" }} />
                  <span className="untilTitle">Hạn: </span>
                  {getDaysUntilDueUtil(activeTask.endDate)} ngày
                </div>
              )}

            {activeTask.execute && (
              <div className="task-info-row">
                <span className="info-label">Xử lý chính:</span>
                <div className="processor-info">
                  <span className="processor-name">{activeTask.execute}</span>
                </div>
              </div>
            )}

            {activeTask.combination && (
              <div className="task-info-row">
                <span className="info-label">Phối hợp:</span>
                <div className="processor-info limit-2-lines">
                  <span
                    className="processor-name"
                    title={activeTask.combination}
                  >
                    {activeTask.combination}
                  </span>
                </div>
              </div>
            )}

            {activeTask.assignerName && (
              <div className="task-info-row">
                <span className="info-label">Giao bởi:</span>
                <span className="assignor-name">{activeTask.assignerName}</span>
              </div>
            )}

            {activeTask.startDate && activeTask.endDate && (
              <div className="task-info-row date-range">
                <Calendar className="w-4 h-4" />
                <span>
                  {formatTaskDate(activeTask.startDate)} -{" "}
                  {formatTaskDate(activeTask.endDate)}
                </span>
              </div>
            )}

            {activeTask.progress != null && activeTask.progress > 0 && (
              <div className="progress-section">
                <div className="progress-label">
                  <span>Tiến độ</span>
                  <span>{activeTask.progress}%</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-fill"
                    style={{ width: `${activeTask.progress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {activeTask.complexityName && (
              <div className="task-date text-right">
                <span
                  className="mucdopt"
                  style={{
                    backgroundColor: getColorComplexityUtil(
                      activeTask.complexityName
                    ),
                  }}
                >
                  {activeTask.complexityName}
                </span>
              </div>
            )}
          </div>
        ) : null}
      </DragOverlay>

      {/* {addTaskContext && (
        <WorkAssignDialog
          open={isAddTaskModalOpen}
          onClose={() => {
            setIsAddTaskModalOpen(false);
            setAddTaskContext(null);
          }}
          onAssign={() => {
            checkReloadDataKanban?.("reload");
            setIsAddTaskModalOpen(false);
            setAddTaskContext(null);
          }}
        />
      )} */}

      {showStatisticPopup && (
        <StatisticPopup
          open={showStatisticPopup}
          onOpenChange={setShowStatisticPopup}
          orgIdSelected={
            selectOrgForPopup?.orgId || selectOrgForPopup?.handlerId
          }
          listUser={listUser}
          listPhong={listPhong}
          // idDonvi={idDonvi}
          // orgsList={[]}
        />
      )}

      {showUserPopup && (
        <GanttModal
          show={showUserPopup}
          selectedUsers={selectedUserForPopup}
          onClose={() => setShowUserPopup(false)}
          filterParams={{
            weekCheck: false,
            monthCheck: false,
            yearCheck: false,
            fromDate: "",
            toDate: "",
          }}
          selectedOrgId={selectedUserForPopup?.orgId}
        />
      )}
      <LoadingFull isLoading={loading || internalLoading} />
    </DndContext>
  );
}
