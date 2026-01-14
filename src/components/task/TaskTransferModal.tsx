"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBase,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Search,
  User as UserIcon,
  Building,
  Trash2,
  ChevronDown,
  ChevronRightIcon,
  FileCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Column } from "@/definitions/types/table.type";
import { getUserInfo } from "@/utils/token.utils";
import { Constant } from "@/definitions/constants/constant";
import { handleError } from "@/utils/common.utils";
import { uploadFileService } from "@/services/file.service";
import { UploadFileService } from "@/services/upload-file.service";
import { CERT_OBJ_TYPE, OBJ_TYPE } from "@/definitions/enums/document.enum";
import { TaskService } from "@/services/task.service";
import { UserService } from "@/services/user.service";
import { OrganizationService } from "@/services/organization.service";
import { EncryptionService } from "@/services/encryption.service";
import { DocumentInService } from "@/services/document-in.service";
import { useGetOrgTreeById } from "@/hooks/data/task.data";
import { useDeleteTaskAction } from "@/hooks/data/task-action.data";
import { GroupService } from "@/services/group.service";
import { ToastUtils } from "@/utils/toast.utils";
import { TaskV2Service } from "@/services/taskv2.service";
import { useWorkAssignStore } from "@/stores/work-assign.store";

// Types
interface User {
  id: number;
  fullName: string;
  positionName: string;
  orgName: string;
  orgId?: number;
  disabled?: boolean;
}

interface Organization {
  id: number | string;
  name: string;
  parentId?: number | null;
  type: "ORG" | "USER";
  isChecked?: boolean;
  isExcute?: boolean;
  isCombination?: boolean;
  disabled?: boolean;
  childNum?: number;
  children?: Organization[];
  positionName?: string;
  description?: string;
  lead?: boolean;
  orgName?: string;
}

interface TaskExecute {
  id?: number;
  userId?: number;
  orgId?: number;
  user?: User;
  org?: Organization;
  group?: any;
  groupId?: number;
  type: number; // 0: user, 1: group, 2: org
  isExcute: boolean;
  isCombination: boolean;
  status: number;
  description?: string;
  isEdit?: boolean;
}

interface TaskTransferModalProps {
  visible: boolean;
  onClose: () => void;
  taskId?: number;
  nodeId: number;
  taskAdd?: any;
  selectedFiles?: any[];
  showCanAddTransfer?: boolean;
  isCreate?: boolean;
  callback?: (taskExecute?: TaskExecute[]) => void;
  isV2?: boolean;
}

const TaskTransferModal: React.FC<TaskTransferModalProps> = ({
  visible,
  onClose,
  taskId,
  nodeId,
  taskAdd,
  selectedFiles,
  showCanAddTransfer,
  isCreate = false,
  callback,
  isV2 = false,
}) => {
  // State management
  const [currentTab, setCurrentTab] = useState<"selectUser" | "selectGroup">(
    "selectUser"
  );
  const [textSearch, setTextSearch] = useState("");
  const [userSearch, setUserSearch] = useState<User[]>([]);
  const [userSearchAll, setUserSearchAll] = useState<User[]>([]);
  const [groupSearch, setGroupSearch] = useState<any[]>([]);
  const [isCheckAllUser, setIsCheckAllUser] = useState(false);
  const [isConfirm, setIsConfirm] = useState(false);

  // Tree data for LBC mode
  const [orgList, setOrgList] = useState<Organization[]>([]);
  const [mainTree, setMainTree] = useState<Organization[]>([]);
  const [listOrgUserTmp, setListOrgUserTmp] = useState<Organization[]>([]);
  const [expandedUnits, setExpandedUnits] = useState<string[]>([]);
  const [listTracking, setListTracking] = useState<any[]>([]);
  const [listOrgUser, setListOrgUser] = useState<TaskExecute[]>([]);
  const [checksubmit, setChecksubmit] = useState(true);
  const [isLoadingTree, setIsLoadingTree] = useState(false);
  const [taskName, setTaskName] = useState<string>("");
  const [taskDescription, setTaskDescription] = useState<string>("");
  // Task execution
  const [task, setTask] = useState<{
    id?: number | string;
    taskExecute: TaskExecute[];
    userExcutePrimaryId?: number;
  }>({
    id: taskId,
    taskExecute: [],
  });

  // Additional Angular equivalent variables
  const [groupSelected, setGroupSelected] = useState<any>(null);
  const [dataTree, setDataTree] = useState<any>({});
  const [processTreeData, setProcessTreeData] = useState<any[]>([]);

  const { mutateAsync: getOrgTreeById } = useGetOrgTreeById();
  const { mutateAsync: deleteTask } = useDeleteTaskAction(isV2 ?? false);

  // Zustand store for persisting last selected assignee
  const {
    lastSelectedNodeId,
    lastAssignee,
    setLastAssignee,
    setLastSelectedNodeId,
  } = useWorkAssignStore();

  // Pagination
  const [pagingAddUser, setPagingAddUser] = useState({
    currentPage: 1,
    size: 10,
    totalItems: 0,
  });

  const [pagingAddGroup, setPagingAddGroup] = useState({
    currentPage: 1,
    size: 10,
    totalItems: 0,
  });

  const UserInfo = useMemo(() => {
    if (typeof window === "undefined") return {};
    return JSON.parse(localStorage.getItem("userInfo") || "{}");
  }, []);

  const defaultOrgId = useMemo(() => {
    if (!UserInfo) return 0;

    const userAssign = UserInfo;
    const currentRole = userAssign.currentRole;

    // LĐ Ban (role 58) hoặc Lãnh đạo ĐV (role 59)
    if (currentRole === 58 || currentRole === 59) {
      return userAssign.org;
    }

    return userAssign.orgModel?.parentId || 0;
  }, [UserInfo]);

  // For LBC mode, orgId should be UserInfo.org (like Angular)
  const [orgId, setOrgId] = useState<number>(0);

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

  // Initialize component
  useEffect(() => {
    if (visible) {
      ngOnInit();
    }
  }, [visible]);

  const resetState = () => {
    // Reset all state variables
    setCurrentTab("selectUser");
    setTextSearch("");
    setUserSearch([]);
    setUserSearchAll([]);
    setGroupSearch([]);
    setIsCheckAllUser(false);
    setIsConfirm(false);
    setOrgList([]);
    setMainTree([]);
    setListOrgUserTmp([]);
    setListTracking([]);
    setListOrgUser([]);
    setOrgId(defaultOrgId);
    setIsLoadingTree(false);
    setTask({
      id: taskId,
      taskExecute: [],
    });
    setGroupSelected(null);
    setDataTree({});
    setProcessTreeData([]);
    setPagingAddUser({
      currentPage: 1,
      size: 10,
      totalItems: 0,
    });
    setPagingAddGroup({
      currentPage: 1,
      size: 10,
      totalItems: 0,
    });
  };

  const getTrackingAll = async () => {
    if (taskId) {
      try {
        const res = isV2
          ? await TaskV2Service.getAllTracking(taskId)
          : await TaskService.getAllTracking(taskId);
        if (res) {
          setListTracking(res);
        }
      } catch (error) {
        handleError(error);
      }
    }
  };

  const ngOnInit = async () => {
    resetState();

    // Load last selected assignee from store if nodeId matches
    if (
      isCreate &&
      lastSelectedNodeId &&
      lastSelectedNodeId === nodeId &&
      lastAssignee &&
      lastAssignee.length > 0
    ) {
      setTask((prev) => ({
        ...prev,
        taskExecute: [...lastAssignee],
      }));

      // For LBC mode, rebuild listOrgUserTmp from lastAssignee
      if (isLBC) {
        const tmpList: Organization[] = [];
        lastAssignee.forEach((item) => {
          if (item.type === 0 && item.user) {
            // User
            tmpList.push({
              id: `_${item.userId}`,
              name: item.user.fullName,
              parentId: item.user.orgId,
              positionName: item.user.positionName,
              description: item.description,
              type: "USER",
              lead: false,
              isChecked: true,
              isExcute: item.isExcute,
              isCombination: item.isCombination,
              disabled: !item.isEdit,
              orgName: item.user.orgName,
            });
          } else if (item.type === 2 && item.org) {
            // Organization
            tmpList.push({
              id: item.orgId!,
              name: item.org.name,
              parentId: item.org.parentId,
              type: "ORG",
              isChecked: true,
              isExcute: item.isExcute,
              isCombination: item.isCombination,
              disabled: !item.isEdit,
            });
          }
        });
        setListOrgUserTmp(tmpList);
        setListOrgUser(lastAssignee);
      }
    }

    if (isLBC) {
      // Set orgId from UserInfo.org (like Angular)
      const initOrgId =
        UserInfo && (UserInfo as any).org
          ? (UserInfo as any).org
          : defaultOrgId;
      setOrgId(initOrgId);
      if (taskId) {
        await getTrackingAll();
      }
      // Quan trọng: truyền trực tiếp orgId để tránh dùng state chưa kịp cập nhật
      await getOrgList(initOrgId);
    } else {
      await doSearch();
      await doSearchAllUser();
    }
  };

  const isOrgSelected = (orgId: number | string): boolean => {
    // Check if org is in listTracking (similar to Angular version)
    // This can be used to mark orgs that are already selected
    return false;
  };

  const getOrgList = async (orgIdParam?: number) => {
    try {
      setIsLoadingTree(true);
      const currentOrgId = orgIdParam ?? orgId;
      const res: Array<{ child: string; name: string; parent: string }> =
        await getOrgTreeById(String(currentOrgId));
      const orgListData = res.map((item: any) => {
        const org = listOrgUser.find(
          (ele) => ele.org && ele.org.id === item.child
        );
        const existingInTmp = listOrgUserTmp.find(
          (ele) => ele.type === "ORG" && ele.id === item.child
        );
        const isChecked = isOrgSelected(item.child) || !!org || !!existingInTmp;
        return {
          id: item.child,
          name: item.name,
          parentId:
            String(item.child) === String(currentOrgId) ? null : item.parent,
          type: "ORG" as const,
          isChecked,
          isExcute: existingInTmp?.isExcute || (org ? org.isExcute : false),
          isCombination:
            existingInTmp?.isCombination || (org ? org.isCombination : false),
          disabled: existingInTmp?.disabled || false,
        };
      }) as Organization[];

      // Add checked orgs to listOrgUserTmp
      orgListData.forEach((item) => {
        if (item.isChecked) {
          // Kiểm tra xem đã có trong listOrgUserTmp chưa
          const exists = listOrgUserTmp.some(
            (tmpItem) => tmpItem.id === item.id
          );
          if (!exists) {
            setListOrgUserTmp((prev) => [...prev, item]);
          }
        }
      });

      setOrgList(orgListData);
      await getUserOrgAndSubOrgWithAuthority(orgListData, currentOrgId);
    } catch (error) {
      console.error("Error getting org list:", error);
      setIsLoadingTree(false);
    }
  };

  const getUserOrgAndSubOrgWithAuthority = async (
    orgListData: Organization[],
    currentOrgId?: number
  ) => {
    try {
      const res = await UserService.getUserOrgAndSubOrgWithNode(String(nodeId));
      let userListData = [] as Organization[];
      if (res && res.length > 0) {
        userListData = res.map((item: any) => {
          const user = listOrgUser.find(
            (ele) => ele.user && ele.user.id === item.id
          );
          // Check if user exists in listOrgUserTmp (đã chọn trước đó)
          const existingInTmp = listOrgUserTmp.find(
            (ele) => ele.type === "USER" && ele.id === `_${item.id}`
          );

          return {
            id: `_${item.id}`,
            name: item.fullName,
            parentId: item.org,
            positionName: item.positionName,
            description:
              existingInTmp?.description ||
              (user ? user.description : undefined),
            type: "USER" as const,
            lead: item.lead,
            isChecked: !!user || !!existingInTmp,
            isExcute: existingInTmp?.isExcute || (user ? user.isExcute : false),
            isCombination:
              existingInTmp?.isCombination ||
              (user ? user.isCombination : false),
            disabled: !!user || existingInTmp?.disabled || false,
            orgName: item.orgModel?.name,
          };
        }) as Organization[];
      }

      // Add checked users to listOrgUserTmp
      userListData.forEach((item) => {
        if (item.isChecked) {
          // Kiểm tra xem đã có trong listOrgUserTmp chưa
          const exists = listOrgUserTmp.some(
            (tmpItem) => tmpItem.id === item.id
          );
          if (!exists) {
            setListOrgUserTmp((prev) => [...prev, item]);
          }
        }
      });

      const combinedList = [...userListData, ...orgListData] as Organization[];
      setOrgList(combinedList);

      if (showCanAddTransfer) {
        await inactiveTransfer();
      }

      // Xây cây dựa trên org gốc hiện tại
      creatDataTree(combinedList);
      setIsLoadingTree(false);
    } catch (error) {
      console.error("Error getting user org:", error);
      setIsLoadingTree(false);
    }
  };

  const inactiveTransfer = async () => {
    let res: any[] = [];
    if (taskId) {
      try {
        res = isV2
          ? await TaskV2Service.doInactiveTransfer(nodeId, taskId)
          : await TaskService.doInactiveTransfer(nodeId, taskId);
      } catch (error) {
        handleError(error);
        return;
      }
    }
    if (res.length > 0) {
      res.forEach((element: any) => {
        for (let i = 0; i < orgList.length; i++) {
          const item = orgList[i];
          // Match logic like Angular: element.type == 0 ? element.userId == item.id.slice(1) && item.type == 'USER' : (element.type == 2 ? element.orgId == item.id && item.type == 'ORG' : null)
          let matched = false;
          if (element.type == 0) {
            const targetId =
              typeof item.id === "string" ? item.id.slice(1) : item.id;
            matched = element.userId == targetId && item.type == "USER";
          } else if (element.type == 2) {
            matched = element.orgId == item.id && item.type == "ORG";
          }

          if (matched) {
            item.disabled = true;
            item.isChecked = true;
            return;
          }
        }
      });

      // Update orgList state
      setOrgList([...orgList]);
    }
  };

  const inactiveTransferTable = async (data: any[]) => {
    let res: any[] = [];
    if (taskId) {
      try {
        res = isV2
          ? await TaskV2Service.doInactiveTransfer(nodeId, taskId)
          : await TaskService.doInactiveTransfer(nodeId, taskId);
        if (res.length > 0) {
          res.forEach((element: any) => {
            for (const item of data) {
              if (element.userId == item.id) {
                item.disabled = true;
                return;
              }
            }
          });
        }
      } catch (error) {
        handleError(error);
        return;
      }
    }
  };

  const creatDataTree = (orgListData: Organization[]) => {
    const processTreeData: Organization[] = [];
    const orgChildren: Organization[] = [];

    orgListData.forEach((item) => {
      if (item.parentId == null) {
        processTreeData.push({
          ...item,
          children: [] as Organization[],
        });
      } else {
        orgChildren.push(item);
      }
    });

    checkParent(processTreeData, orgChildren);
    setMainTree(processTreeData);
  };

  const checkParent = (
    listParent: Organization[],
    listChildren: Organization[]
  ) => {
    const allParent = listChildren.map((child) => ({
      ...child,
      children: [] as Organization[],
    }));

    allParent.unshift(
      ...listParent.map((parent) => ({
        ...parent,
        children: parent.children || [],
      }))
    );
    const mapId: { [key: number | string]: Organization } = {};

    allParent.forEach((parent) => {
      mapId[parent.id] = parent;
    });

    allParent.forEach((child) => {
      const parent = mapId[child.parentId!];
      if (!parent) return;

      parent.children = parent.children || [];
      if (child.type === "USER") {
        (child as any).orgName = parent.name;
      }
      parent.children.push(child);
      parent.childNum = parent.children.length;
    });
  };

  const doSearch = async (page: number | null = null) => {
    if (Constant.CONTACT_GROUP_TASK_BCY) {
      if (currentTab === "selectUser") {
        const data = await UserService.searchUserOrgPagingWithNode(
          textSearch,
          page ?? pagingAddUser.currentPage,
          String(nodeId),
          true
        );

        if (data) {
          // Reset disabled state for all items
          data.content.forEach((element: any) => {
            element.disabled = false;
          });

          // Apply inactive transfer logic
          await inactiveTransferTable(data.content);

          setUserSearch(data.content);
          setPagingAddUser((prev) => ({
            ...prev,
            totalItems: data.totalElements,
          }));

          // Remove current user from list if exists
          const userInfo = JSON.parse(getUserInfo() || "{}");
          const userId = userInfo.id;
          const index = data.content.findIndex(
            (item: any) => item.id === userId
          );
          if (index >= 0) {
            data.content.splice(index, 1);
            setUserSearch(data.content);
            setPagingAddUser((prev) => ({
              ...prev,
              totalItems: prev.totalItems - 1,
            }));
          }

          isCheckingAllUser();
        }
      } else {
        const data = await GroupService.doSearchContactGroupActive({
          groupName: textSearch,
          page: page ?? pagingAddGroup.currentPage,
          active: true,
        });
        if (data) {
          setGroupSearch(data.content);
          setPagingAddGroup((prev) => ({
            ...prev,
            totalItems: data.totalElements,
          }));
        }
      }
    } else {
      const data = await UserService.searchUserOrgPagingWithNode(
        textSearch,
        page ?? pagingAddUser.currentPage,
        String(nodeId)
      );
      if (data) {
        setUserSearch(data.content);
        setPagingAddUser((prev) => ({
          ...prev,
          totalItems: data.totalElements,
        }));
        isCheckingAllUser();
      }
    }
  };

  const doSearchAllUser = async () => {
    if (Constant.CONTACT_GROUP_TASK_BCY) {
      if (currentTab === "selectUser") {
        try {
          const data = await UserService.searchUserNodeAll(String(nodeId));
          if (data) {
            setUserSearchAll(data);
          }
        } catch (error) {
          console.error("Error searching all users:", error);
        }
      }
    } else {
      try {
        const data = await UserService.searchUserNodeAll(String(nodeId));
        if (data) {
          setUserSearchAll(data);
        }
      } catch (error) {
        console.error("Error searching all users:", error);
      }
    }
  };

  const checkExistJoin = (id: number): boolean => {
    return task.taskExecute.some((x) => x.userId === id);
  };

  const checkExistJoinByType = (id: number, type: number): boolean => {
    if (type === 0) {
      return task.taskExecute.some(
        (x) => x.user && x.user.id === id && x.type === type
      );
    } else {
      return task.taskExecute.some((x) => x.groupId === id);
    }
  };

  const createTaskExecute = (user: User, groupId?: number): TaskExecute => {
    const userCopy = JSON.parse(JSON.stringify(user));
    // Handle positionModel and orgModel like Angular
    if (userCopy.positionModel) {
      userCopy.positionName = userCopy.positionModel.name;
    }
    if (userCopy.orgModel) {
      userCopy.orgName = userCopy.orgModel.name;
    }
    return {
      status: 0,
      user: userCopy,
      userId: userCopy.id,
      groupId,
      type: 0,
      isExcute: false,
      isCombination: true,
    };
  };

  const addTaskExecutes = (newTaskExecutes: TaskExecute[]) => {
    if (newTaskExecutes.length === 0) return;

    setTask((prev) => {
      const hasPrimaryExecutor = prev.taskExecute?.some(
        (item) => item.isExcute === true
      );

      if (!isLBC && !showCanAddTransfer && !hasPrimaryExecutor) {
        newTaskExecutes[0].isExcute = true;
        newTaskExecutes[0].isCombination = false;
      }

      return {
        ...prev,
        taskExecute: [...prev.taskExecute, ...newTaskExecutes],
      };
    });
  };

  const doSelectUserApprove = (index: number) => {
    const user = userSearch[index];
    const newTaskExecute = createTaskExecute(user);
    addTaskExecutes([newTaskExecute]);
    isCheckingAllUser();
  };

  const doSelectGroupApprove = (index: number) => {
    const group = groupSearch[index];
    const newTaskExecutes = group.listUser.map((user: User) =>
      createTaskExecute(user, group.id)
    );
    addTaskExecutes(newTaskExecutes);
  };

  const doRemoveUserApprove = (userId: number) => {
    if (task.taskExecute) {
      let index = -1;
      if (!Constant.CONTACT_GROUP_TASK_BCY) {
        task.taskExecute.forEach((item, i) => {
          if (item.user && item.user.id == userId) {
            index = i;
          }
        });
      } else {
        task.taskExecute.forEach((item, i) => {
          if (item.user && item.user.id == userId && item.type === 0) {
            index = i;
          }
        });
      }

      if (index > -1) {
        const newTaskExecute = [...task.taskExecute];
        newTaskExecute.splice(index, 1);
        setTask((prev) => ({
          ...prev,
          taskExecute: newTaskExecute,
        }));
        isCheckingAllUser();
      }
    }
  };

  const doRemoveOrgApprove = (orgId: number | string) => {
    if (task.taskExecute) {
      let index = -1;
      if (Constant.CONTACT_GROUP_TASK_BCY) {
        task.taskExecute.forEach((item, i) => {
          if (item.org && item.org.id == orgId) {
            index = i;
          }
        });
      } else {
        task.taskExecute.forEach((item, i) => {
          if (item.org && item.org.id == orgId && item.type === 2) {
            index = i;
          }
        });
      }

      if (index > -1) {
        const newTaskExecute = [...task.taskExecute];
        newTaskExecute.splice(index, 1);
        setTask((prev) => ({
          ...prev,
          taskExecute: newTaskExecute,
        }));
      }
    }
  };

  const doRemoveGroupApprove = (groupId: number) => {
    setTask((prev) => ({
      ...prev,
      taskExecute: prev.taskExecute.filter((item) => item.groupId !== groupId),
    }));
  };

  const onFilterExcute = (checked: boolean, index: number) => {
    if (checked) {
      const newTaskExecute = task.taskExecute.map((item, i) => ({
        ...item,
        isExcute: i === index,
        isCombination: i !== index,
      }));
      setTask((prev) => {
        const userExcutePrimaryId = prev.taskExecute[index].user?.id;
        return {
          ...prev,
          taskExecute: newTaskExecute,
          userExcutePrimaryId,
        };
      });
    } else {
      const newTaskExecute = [...task.taskExecute];
      newTaskExecute[index].isExcute = false;
      newTaskExecute[index].isCombination = true;
      setTask((prev) => ({ ...prev, taskExecute: newTaskExecute }));
    }
  };

  const doCheckedAll = (checked: boolean) => {
    setIsCheckAllUser(checked);

    if (checked) {
      if (Constant.CONTACT_GROUP_TASK_BCY) {
        const newUsers = userSearchAll.filter(
          (user) => !checkExistJoinByType(user.id, 0)
        );
        const newTaskExecutes = newUsers.map((user) => createTaskExecute(user));
        addTaskExecutes(newTaskExecutes);
      } else {
        const newUsers = userSearchAll.filter(
          (user) => !checkExistJoinByType(user.id, 0)
        );
        const newTaskExecutes = newUsers.map((user) => createTaskExecute(user));
        addTaskExecutes(newTaskExecutes);
      }
    } else {
      if (Constant.CONTACT_GROUP_TASK_BCY) {
        setTask((prev) => ({
          ...prev,
          taskExecute: prev.taskExecute.filter(
            (item) =>
              !userSearchAll.some(
                (user) => user.id === item.userId && item.type === 0
              )
          ),
        }));
      } else {
        setTask((prev) => ({
          ...prev,
          taskExecute: prev.taskExecute.filter(
            (item) => !userSearchAll.some((user) => user.id === item.userId)
          ),
        }));
      }
    }
  };

  const isCheckingAllUser = (): boolean => {
    if (!userSearchAll.length) return false;

    if (Constant.CONTACT_GROUP_TASK_BCY) {
      const count = userSearchAll.filter((user) =>
        checkExistJoinByType(user.id, 0)
      ).length;
      const allChecked = count >= userSearchAll.length;
      setIsCheckAllUser(allChecked);
      return allChecked;
    } else {
      const count = userSearchAll.filter((user) =>
        checkExistJoin(user.id)
      ).length;
      const allChecked = count >= userSearchAll.length;
      setIsCheckAllUser(allChecked);
      return allChecked;
    }
  };

  const checkKnowProcess = (rowData: Organization) => {
    if (rowData.isChecked) {
      setChecksubmit(false);
      setListOrgUserTmp((prev) => {
        const newList = [...prev, rowData];
        if (newList.length === 0) {
          setChecksubmit(true);
        }
        return newList;
      });
    } else {
      setListOrgUserTmp((prev) => {
        const newList = prev.filter((item) => item.id !== rowData.id);
        if (newList.length === 0) {
          setChecksubmit(true);
        }
        return newList;
      });
    }
  };

  const selectOrgUserFromTree = (): TaskExecute[] => {
    return listOrgUserTmp.map((item, i) => {
      if (item.type === "USER") {
        const userId =
          typeof item.id === "number"
            ? item.id
            : Number(String(item.id).replace("_", ""));
        return {
          user: {
            id: userId,
            fullName: item.name,
            positionName: item.positionName || "",
            orgName: (item as any).orgName || "",
          },
          type: 0,
          isExcute: !showCanAddTransfer && i === 0,
          isCombination: !(!showCanAddTransfer && i === 0),
          status: 0,
          userId: userId,
          description: item.description,
          isEdit: !item.disabled,
        } as TaskExecute;
      } else {
        return {
          org: {
            id: typeof item.id === "number" ? item.id : Number(String(item.id)),
            name: item.name,
            parentId: item.parentId,
          },
          type: 2,
          isExcute: i === 0 && !showCanAddTransfer,
          isCombination: !(i === 0 && !showCanAddTransfer),
          status: 0,
          orgId:
            typeof item.id === "number" ? item.id : Number(String(item.id)),
          description: item.description,
          isEdit: !item.disabled,
        } as TaskExecute;
      }
    });
  };

  const doTransfer = async () => {
    if (!isConfirm) {
      if (isLBC) {
        const taskExecute = selectOrgUserFromTree();
        if (taskExecute.length === 0) {
          ToastUtils.error("Lựa chọn người xử lý");
          return;
        }
        setTask((prev) => ({ ...prev, taskExecute }));
      }
      setIsConfirm(true);
      return;
    }

    const data: any = {
      nodeId,
      taskExecutes: task.taskExecute,
      taskHistory: null,
    };

    if (taskName || taskDescription) {
      data.taskHistory = {
        taskName,
        description: taskDescription,
      };
    }

    try {
      if (showCanAddTransfer) {
        if (isV2) {
          await TaskV2Service.doAddTransfer(Number(task.id), data);
        } else {
          await TaskService.doAddTransfer(Number(task.id), data);
        }
        ToastUtils.success("Bổ sung xử lý thành công");
      } else {
        const uIds = task.taskExecute
          ? task.taskExecute
              .filter((item) => item.type == 0 || item.type == 1)
              .map((i) => i.userId)
          : [];
        const orgIds = task.taskExecute
          ? task.taskExecute
              .filter((item) => item.type == 2)
              .map((i) => i.orgId)
          : [];
        const dataFile = setSharedFileData(
          taskId ? taskId : Number(task.id),
          uIds as number[],
          orgIds as number[]
        );
        const response =
          await UploadFileService.doSharePermissionDocOutFile(dataFile);
        if (response === false) {
          return response;
        }

        if (isV2) {
          await TaskV2Service.doTransfer(Number(task.id), data);
        } else {
          await TaskService.doTransfer(Number(task.id), data);
        }
        ToastUtils.success("Chuyển xử lý thành công");
      }

      if (callback) callback();
      onClose();
    } catch (error) {
      await handleError(error);
    }
  };

  const setSharedFileData = (
    taskId: number | string,
    userIds: number[] | string[],
    orgIds: number[] | string[]
  ) => {
    return {
      objId: Number(taskId),
      comment: "",
      userIds: userIds.map((id) => Number(id)),
      orgIds: orgIds.map((id) => Number(id)),
      userIdShared: [],
      allFileNames: [],
      files: [],
      attType: CERT_OBJ_TYPE.task,
      cmtType: "GIAO_VIEC",
    };
  };

  const findUserAlreadyFollowTask = (id: number): boolean => {
    if (!taskAdd?.userFollows) return true;
    return !taskAdd.userFollows.some((user: any) => user.userId === id);
  };

  const rollBack = async (taskId: number | string) => {
    if (!taskId) return;
    try {
      await deleteTask(Number(taskId));
    } catch (error) {
      handleError(error);
    }
  };

  const addTask = async () => {
    const hasPrimaryExecutor = task.taskExecute?.some(
      (item) => item.isExcute === true
    );

    if (!hasPrimaryExecutor && !showCanAddTransfer) {
      ToastUtils.error("Chưa chọn người xử lý chính");
      return;
    }
    if (taskId) {
      await doTransfer();
    } else {
      try {
        const taskExecuteCopy = [...task.taskExecute];
        const taskFollowNonDuplicate: TaskExecute[] = [];

        taskExecuteCopy.forEach((item) => {
          if (item.type !== 2 && findUserAlreadyFollowTask(item.userId!)) {
            taskFollowNonDuplicate.push(item);
          }
        });

        const userFollowArr = taskFollowNonDuplicate.map((item) => {
          return {
            user: {
              id: item.userId!,
              fullName: item.user?.fullName || "",
              parentId: item.user?.orgId,
              positionName: item.user?.positionName || "",
              orgName: item.user?.orgName || "",
            },
            type: 0,
            isExcute: false,
            isCombination: true,
            status: 0,
            userId: item.userId!,
            id: item.userId!,
            taskId: null,
            description: null,
          };
        });

        // Update taskAdd with userFollows
        const updatedTaskAdd = {
          ...taskAdd,
          userFollows: [...(taskAdd?.userFollows || []), ...userFollowArr],
        };

        const data = isV2
          ? await TaskV2Service.addTaskAssignTo(updatedTaskAdd)
          : await TaskService.addTaskAssignTo(updatedTaskAdd);
        setTask((prev) => ({ ...prev, id: data.id }));

        // Handle file uploads if selectedFiles exist
        if (selectedFiles && selectedFiles.length > 0) {
          // Filter encrypted and non-encrypted files
          const encryptArr = await uploadFileService.filterFile(
            selectedFiles,
            "encrypt",
            OBJ_TYPE.GIAO_VIEC
          );
          const nonEncryptArr = await uploadFileService.filterFile(
            selectedFiles,
            "",
            OBJ_TYPE.GIAO_VIEC
          );

          // Handle encrypted files
          if (encryptArr.length > 0) {
            const rs = await EncryptionService.doEncryptExecute(
              encryptArr as File[],
              data.id,
              "GIAO_VIEC"
            );
            if (!rs) {
              await rollBack(data.id);
              return false;
            }
          }

          // Handle non-encrypted files
          if (nonEncryptArr.length > 0) {
            if (isV2) {
              await TaskV2Service.doSaveTaskAttachment(data.id, nonEncryptArr);
            } else {
              await TaskService.doSaveTaskAttachment(data.id, nonEncryptArr);
            }

            nonEncryptArr.forEach((item) => {
              if (item.id && !item.docId && item.template) {
                DocumentInService.updateTemplateToDoc(
                  Constant.TYPE_TEMPLATE.GIAO_VIEC,
                  String(item.id),
                  data.id
                );
              }
            });
          }
        }
        await doTransfer();
      } catch (error) {
        ToastUtils.error("Lưu công việc không thành công");
      }
    }
  };

  const addAssignee = async () => {
    const hasPrimaryExecutor = task.taskExecute?.some(
      (item) => item.isExcute === true
    );

    console.log("hasPrimaryExecutor", hasPrimaryExecutor);
    console.log("showCanAddTransfer", showCanAddTransfer);
    if (!hasPrimaryExecutor && !showCanAddTransfer) {
      ToastUtils.error("Chưa chọn người xử lý chính");
      return;
    }
    const taskExecute = selectOrgUserFromTree();

    // Save to store for next time (only assignee data, not name)
    if (isCreate && nodeId) {
      setLastSelectedNodeId(nodeId);
      setLastAssignee(task.taskExecute, "");
    }

    callback?.(task.taskExecute);
    onClose();
  };

  const doSelect = () => {
    if (isLBC) {
      // Lưu lại các item đã chọn
      setListOrgUser(task.taskExecute);

      // Rebuild listOrgUserTmp từ task.taskExecute
      const tmpList: Organization[] = [];
      task.taskExecute.forEach((item) => {
        if (item.type === 0 && item.user) {
          // User
          tmpList.push({
            id: `_${item.userId}`,
            name: item.user.fullName,
            parentId: item.user.orgId,
            positionName: item.user.positionName,
            description: item.description,
            type: "USER",
            lead: false,
            isChecked: true,
            isExcute: item.isExcute,
            isCombination: item.isCombination,
            disabled: !item.isEdit,
            orgName: item.user.orgName,
          });
        } else if (item.type === 2 && item.org) {
          // Organization
          tmpList.push({
            id: item.orgId!,
            name: item.org.name,
            parentId: item.org.parentId,
            type: "ORG",
            isChecked: true,
            isExcute: item.isExcute,
            isCombination: item.isCombination,
            disabled: !item.isEdit,
          });
        }
      });

      setListOrgUserTmp(tmpList);
      setOrgList([]);
      setMainTree([]);
      setProcessTreeData([]);
      getOrgList();
    }
    setIsConfirm(false);
  };

  // Render tree table for LBC mode
  const renderTreeTable = () => {
    const columns: Column<Organization>[] = [
      {
        header: "Tên đơn vị, cá nhân",
        accessor: (item: Organization) => (
          <div className="flex items-center">
            <span className="mr-2">
              {item.type === "ORG" ? (
                <Building className="w-4 h-4 text-red-500" />
              ) : (
                <UserIcon className="w-4 h-4 text-blue-500" />
              )}
            </span>
            <span className="font-medium">{item.name}</span>
          </div>
        ),
        className: "py-2",
      },
      {
        header: "Chọn",
        accessor: (item: Organization) => (
          <div className="flex justify-center">
            <Checkbox
              checked={item.isChecked}
              disabled={item.disabled}
              onCheckedChange={(checked: boolean) => {
                const newOrgList = orgList.map((orgItem) =>
                  orgItem.id === item.id
                    ? { ...orgItem, isChecked: checked }
                    : orgItem
                );
                setOrgList(newOrgList);
                checkKnowProcess({ ...item, isChecked: checked });
              }}
            />
          </div>
        ),
        className: "text-center py-2 w-20",
      },
    ];

    return (
      <div className="max-h-[420px] overflow-auto border rounded-lg">
        <Table
          columns={columns}
          dataSource={mainTree}
          showPagination={false}
          className="w-full"
        />
      </div>
    );
  };

  // Render user table
  const renderUserTable = () => {
    const columns: Column<User>[] = [
      {
        header: "STT",
        accessor: (item: User, index: number) => (
          <span className="text-sm text-gray-600">
            {(pagingAddUser.currentPage - 1) * 10 + index + 1}
          </span>
        ),
        className: "w-16 text-center",
      },
      {
        header: "Họ và tên",
        accessor: (item: User) => (
          <span className="text-sm">{item.fullName?.slice(0, 60)}</span>
        ),
        className: "py-2",
      },
      {
        header: "Chức danh",
        accessor: (item: User) => (
          <span className="text-sm text-center">{item.positionName}</span>
        ),
        className: "text-center py-2",
      },
      {
        header: "Đơn vị",
        accessor: (item: User) => (
          <span className="text-sm text-center">{item.orgName}</span>
        ),
        className: "text-center py-2",
      },
      {
        header: (
          <div className="flex items-center justify-center">
            <Checkbox
              checked={isCheckAllUser}
              onCheckedChange={(checked: boolean) => doCheckedAll(checked)}
            />
          </div>
        ),
        accessor: (item: User) => {
          const exists = checkExistJoinByType(item.id, 0);
          return (
            <div className="flex justify-center">
              <Button
                variant="link"
                size="sm"
                onClick={() =>
                  exists
                    ? doRemoveUserApprove(item.id)
                    : doSelectUserApprove(userSearch.indexOf(item))
                }
                disabled={item.disabled}
                className={cn(
                  "h-6 px-2 text-xs",
                  exists
                    ? "text-red-600 hover:text-red-700"
                    : "text-blue-600 hover:text-blue-700"
                )}
              >
                {exists ? "Xóa" : "Chọn"}
              </Button>
            </div>
          );
        },
        className: "text-center py-2 w-20",
      },
    ];

    return (
      <div className="space-y-4">
        <Table
          columns={columns}
          dataSource={userSearch}
          showPagination={false}
          className="w-full"
          emptyText="Không có dữ liệu"
        />
        {userSearch.length > 0 && (
          <div className="flex justify-center">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (pagingAddUser.currentPage > 1) {
                    const previous = pagingAddUser.currentPage - 1;
                    setPagingAddUser((prev) => ({
                      ...prev,
                      currentPage: previous,
                    }));
                    doSearch(Number(previous));
                  }
                }}
                disabled={pagingAddUser.currentPage === 1}
              >
                Trước
              </Button>
              <span className="text-sm text-gray-600">
                Trang {pagingAddUser.currentPage} /{" "}
                {Math.ceil(pagingAddUser.totalItems / pagingAddUser.size)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (
                    pagingAddUser.currentPage <
                    Math.ceil(pagingAddUser.totalItems / pagingAddUser.size)
                  ) {
                    const next = pagingAddUser.currentPage + 1;
                    setPagingAddUser((prev) => ({
                      ...prev,
                      currentPage: next,
                    }));
                    doSearch(Number(next));
                  }
                }}
                disabled={
                  pagingAddUser.currentPage >=
                  Math.ceil(pagingAddUser.totalItems / pagingAddUser.size)
                }
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render group table
  const renderGroupTable = () => {
    const columns: Column<any>[] = [
      {
        header: "STT",
        accessor: (item: any, index: number) => (
          <span className="text-sm text-gray-600">
            {(pagingAddGroup.currentPage - 1) * 10 + index + 1}
          </span>
        ),
        className: "w-16 text-center",
      },
      {
        header: "Tên nhóm",
        accessor: (item: any) => <span className="text-sm">{item.name}</span>,
        className: "py-2",
      },
      {
        header: "Số lượng",
        accessor: (item: any) => (
          <span className="text-sm text-center">
            {item.listUser?.length || 0}
          </span>
        ),
        className: "text-center py-2",
      },
      {
        header: "Mô tả",
        accessor: (item: any) => (
          <span className="text-sm">{item.description}</span>
        ),
        className: "py-2",
      },
      {
        header: "Thao tác",
        accessor: (item: any) => {
          const exists = checkExistJoinByType(item.id, 1);
          return (
            <div className="flex justify-center">
              <Button
                variant="link"
                size="sm"
                onClick={() =>
                  exists
                    ? doRemoveGroupApprove(item.id)
                    : doSelectGroupApprove(groupSearch.indexOf(item))
                }
                className={cn(
                  "h-6 px-2 text-xs",
                  exists
                    ? "text-red-600 hover:text-red-700"
                    : "text-blue-600 hover:text-blue-700"
                )}
              >
                {exists ? "Xóa" : "Chọn"}
              </Button>
            </div>
          );
        },
        className: "text-center py-2 w-20",
      },
    ];

    return (
      <div className="space-y-4">
        <Table
          columns={columns}
          dataSource={groupSearch}
          showPagination={false}
          className="w-full"
          emptyText="Không có dữ liệu"
        />
        {groupSearch.length > 0 && (
          <div className="flex justify-center">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const previous = pagingAddGroup.currentPage - 1;
                  if (pagingAddGroup.currentPage > 1) {
                    setPagingAddGroup((prev) => ({
                      ...prev,
                      currentPage: previous,
                    }));
                    doSearch(Number(previous));
                  }
                }}
                disabled={pagingAddGroup.currentPage === 1}
              >
                Trước
              </Button>
              <span className="text-sm text-gray-600">
                Trang {pagingAddGroup.currentPage} /{" "}
                {Math.ceil(pagingAddGroup.totalItems / pagingAddGroup.size)}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (
                    pagingAddGroup.currentPage <
                    Math.ceil(pagingAddGroup.totalItems / pagingAddGroup.size)
                  ) {
                    const next = pagingAddGroup.currentPage + 1;
                    setPagingAddGroup((prev) => ({
                      ...prev,
                      currentPage: next,
                    }));
                    doSearch(Number(next));
                  }
                }}
                disabled={
                  pagingAddGroup.currentPage >=
                  Math.ceil(pagingAddGroup.totalItems / pagingAddGroup.size)
                }
              >
                Sau
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // Render task execution table
  const renderTaskExecutionTable = () => {
    const columns: Column<TaskExecute>[] = [
      {
        header: "STT",
        accessor: (item: TaskExecute, index: number) => (
          <span className="text-sm text-gray-600">{index + 1}</span>
        ),
        className: "w-16 text-center",
      },
      {
        header: "Họ và tên",
        accessor: (item: TaskExecute) => (
          <span className="text-sm">
            {item.type === 0 ? item.user?.fullName : ""}
          </span>
        ),
        className: "py-2",
      },
      {
        header: "Chức danh",
        accessor: (item: TaskExecute) => (
          <span className="text-sm text-center">
            {item.type === 0 ? item.user?.positionName : "Đơn vị"}
          </span>
        ),
        className: "text-center py-2",
      },
      {
        header: "Đơn vị",
        accessor: (item: TaskExecute) => (
          <span className="text-sm text-center">
            {item.type === 0
              ? item.user?.orgName
              : item.type === 2
                ? item.org?.name
                : ""}
          </span>
        ),
        className: "text-center py-2",
      },
      {
        header: "Xử lý chính",
        accessor: (item: TaskExecute, index: number) => (
          <div className="flex justify-center">
            <Checkbox
              checked={item.isExcute}
              disabled={item.type === 1 || showCanAddTransfer || item.isExcute}
              onCheckedChange={(checked: boolean) =>
                onFilterExcute(checked, index)
              }
            />
          </div>
        ),
        className: "text-center py-2 w-20",
      },
      {
        header: "Phối hợp",
        accessor: (item: TaskExecute) => (
          <div className="flex justify-center">
            <Checkbox checked={item.isCombination} disabled />
          </div>
        ),
        className: "text-center py-2 w-20",
      },
      {
        header: "Xóa",
        accessor: (item: TaskExecute) => (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (item.type === 2 && item.org?.id) {
                  doRemoveOrgApprove(item.org?.id);
                } else if (item.type === 0 && item.userId) {
                  doRemoveUserApprove(item.userId);
                } else if (item.groupId) {
                  doRemoveGroupApprove(item.groupId);
                }
              }}
              className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ),
        className: "text-center py-2 w-16",
      },
    ];

    return (
      <Table
        columns={columns}
        dataSource={task.taskExecute}
        showPagination={false}
        className="w-full"
      />
    );
  };

  const renderOrgExecutionTable = () => {
    const columns: Column<TaskExecute>[] = [
      {
        header: "STT",
        accessor: (item: TaskExecute, index: number) => (
          <span className="text-sm text-gray-600">{index + 1}</span>
        ),
        className: "w-16 text-center",
      },
      {
        header: "Họ và tên",
        accessor: (item: TaskExecute) => (
          <span className="text-sm">
            {item.type === 0 ? item.user?.fullName : ""}
          </span>
        ),
        className: "py-2",
      },
      {
        header: "Chức danh",
        accessor: (item: TaskExecute) => (
          <span className="text-sm text-center">
            {item.type === 0 ? item.user?.positionName : "Đơn vị"}
          </span>
        ),
        className: "text-center py-2",
      },
      {
        header: "Đơn vị",
        accessor: (item: TaskExecute) => (
          <span className="text-sm text-center">
            {item.type === 0
              ? item.user?.orgName
              : item.type === 2
                ? item.org?.name
                : ""}
          </span>
        ),
        className: "text-center py-2",
      },
      {
        header: "Xử lý chính",
        accessor: (item: TaskExecute, index: number) => (
          <div className="flex justify-center">
            <Checkbox
              checked={item.isExcute}
              disabled={item.type === 1 || showCanAddTransfer || item.isExcute}
              onCheckedChange={(checked: boolean) =>
                onFilterExcute(checked, index)
              }
            />
          </div>
        ),
        className: "text-center py-2 w-20",
      },
      {
        header: "Phối hợp",
        accessor: (item: TaskExecute) => (
          <div className="flex justify-center">
            <Checkbox checked={item.isCombination} disabled />
          </div>
        ),
        className: "text-center py-2 w-20",
      },
      {
        header: "Xóa",
        accessor: (item: TaskExecute) => (
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (item.type === 2 && item.org?.id) {
                  doRemoveOrgApprove(item.org?.id);
                } else if (item.type === 0 && item.userId) {
                  doRemoveUserApprove(item.userId);
                } else if (item.groupId) {
                  doRemoveGroupApprove(item.groupId);
                }
              }}
              className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ),
        className: "text-center py-2 w-16",
      },
    ];

    return (
      <Table
        columns={columns}
        dataSource={task.taskExecute}
        showPagination={false}
        className="w-full"
      />
    );
  };

  const toggleUnitExpansion = (unitId: string) => {
    setExpandedUnits((prev) =>
      prev.includes(unitId)
        ? prev.filter((id) => id !== unitId)
        : [...prev, unitId]
    );
  };

  const handleOrgToggle = (item: Organization) => {
    const exists = listOrgUserTmp.some((org) => org.id === item.id);

    if (exists) {
      // Remove from list
      setListOrgUserTmp((prev) => prev.filter((org) => org.id !== item.id));
    } else {
      // Add to list
      setListOrgUserTmp((prev) => [...prev, item]);
    }

    // Update orgList to reflect the change
    setOrgList((prev) =>
      prev.map((org) =>
        org.id === item.id ? { ...org, isChecked: !exists } : org
      )
    );

    // Update checksubmit
    const newLength = exists
      ? listOrgUserTmp.length - 1
      : listOrgUserTmp.length + 1;
    setChecksubmit(newLength === 0);
  };

  const renderOrgTree = (
    items: Organization[],
    level: number = 0
  ): React.ReactNode => {
    return items
      .filter(
        (item) =>
          (item.type === "ORG" &&
            ((item.childNum && item.childNum > 0) ||
              (item.children && item.children.length > 0))) ||
          item.type === "USER"
      )
      .map((item) => (
        <React.Fragment key={item.id}>
          <TableRow className={item.type === "ORG" ? "bg-gray-50" : ""}>
            <TableCell
              className="py-2"
              style={{ paddingLeft: `${level * 32 + 8}px` }}
            >
              <div className="flex items-center space-x-2">
                {item.children && item.children.length > 0 && (
                  <button
                    onClick={() => toggleUnitExpansion(item.id.toString())}
                    className="p-1 hover:bg-gray-200 rounded"
                  >
                    {expandedUnits.includes(item.id.toString()) ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRightIcon className="w-4 h-4" />
                    )}
                  </button>
                )}
                {!item.children && <div className="w-6" />}
                {item.type === "USER" ? (
                  <UserIcon className="w-4 h-4 text-blue-600" />
                ) : (
                  <Building className="w-4 h-4 text-red-500" />
                )}
                <span className={item.type === "USER" ? "" : "font-medium"}>
                  {item.name}
                </span>
              </div>
            </TableCell>
            <TableCell className="py-2 text-center">
              <Checkbox
                checked={listOrgUserTmp.some((org) => org.id === item.id)}
                disabled={item.disabled}
                onCheckedChange={() => handleOrgToggle(item)}
              />
            </TableCell>
          </TableRow>

          {item.children &&
            expandedUnits.includes(item.id.toString()) &&
            renderOrgTree(item.children, level + 1)}
        </React.Fragment>
      ));
  };

  return (
    <Dialog open={visible} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Chọn người thực hiện
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!isConfirm && isLBC && (
            // <div className="space-y-4">{renderTreeTable()}</div>
            <div className="space-y-4">
              <div className="border rounded-lg">
                <TableBase>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-3/4">
                        Tên đơn vị, cá nhân
                      </TableHead>
                      <TableHead className="w-1/4 text-center">Chọn</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoadingTree ? (
                      <TableRow>
                        <TableCell
                          colSpan={2}
                          className="text-center py-4 text-gray-500"
                        >
                          Đang tải dữ liệu...
                        </TableCell>
                      </TableRow>
                    ) : mainTree && mainTree.length > 0 ? (
                      renderOrgTree(mainTree)
                    ) : (
                      <TableRow>
                        <TableCell
                          colSpan={2}
                          className="text-center py-4 text-gray-500"
                        >
                          Không có dữ liệu
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </TableBase>
              </div>
            </div>
          )}

          {!isConfirm && !isLBC && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="search" className="text-sm font-medium">
                  Họ và tên <span className="text-red-500">*</span>
                </Label>
                <div className="flex gap-2">
                  <Input
                    id="search"
                    placeholder="Tìm kiếm họ và tên | Email | Tên đăng nhập"
                    value={textSearch}
                    onChange={(e) => setTextSearch(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && doSearch()}
                    maxLength={100}
                    className="flex-1"
                  />
                  <Button
                    onClick={() => doSearch()}
                    className="px-4 bg-blue-600 hover:bg-blue-700"
                  >
                    <Search className="w-4 h-4 mr-2" />
                    Tìm kiếm
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {Constant.CONTACT_GROUP_TASK_BCY ? (
                  <Tabs
                    value={currentTab}
                    onValueChange={(value) => {
                      setCurrentTab(value as "selectUser" | "selectGroup");
                      setTextSearch("");
                      if (value === "selectUser") {
                        setPagingAddUser((prev) => ({
                          ...prev,
                          currentPage: 1,
                        }));
                      } else {
                        setPagingAddGroup((prev) => ({
                          ...prev,
                          currentPage: 1,
                        }));
                      }
                      doSearch(1);
                    }}
                  >
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger
                        value="selectUser"
                        className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                      >
                        Chọn người thực hiện
                      </TabsTrigger>
                      <TabsTrigger
                        value="selectGroup"
                        className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
                      >
                        Chọn nhóm thực hiện
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="selectUser" className="space-y-4">
                      {renderUserTable()}
                    </TabsContent>
                    <TabsContent value="selectGroup" className="space-y-4">
                      {renderGroupTable()}
                    </TabsContent>
                  </Tabs>
                ) : (
                  renderUserTable()
                )}
              </div>
            </div>
          )}

          {isConfirm && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="link"
                  onClick={doSelect}
                  className="p-0 h-auto text-blue-600 hover:text-blue-700"
                >
                  Lựa chọn người thực hiện
                </Button>
                <span className="text-red-500">*</span>
              </div>
              {!isLBC ? renderTaskExecutionTable() : renderOrgExecutionTable()}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            onClick={!isConfirm ? doTransfer : isCreate ? addAssignee : addTask}
            disabled={
              (listOrgUserTmp.length === 0 && isLBC) ||
              (task.taskExecute.length === 0 && !isLBC) ||
              (task.taskExecute.length === 0 && isLBC && isConfirm)
            }
            className="bg-blue-600 hover:bg-blue-700"
          >
            <FileCheck className="w-4 h-4 mr-2" />
            {isConfirm ? "Xác nhận" : "Đồng ý"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskTransferModal;
