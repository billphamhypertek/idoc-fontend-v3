import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  TableBase,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Constant } from "@/definitions/constants/constant";
import { BpmnResponse } from "@/definitions/types/bpmn.type";
import { TreeNode } from "@/definitions/types/document-out.type";
import { ToastUtils } from "@/utils/toast.utils";
import { cn } from "@/lib/utils";
import { deepCloneTree } from "@/utils/common.utils";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  ArrowRight,
  Building,
  ChevronDown,
  ChevronRight,
  Redo2,
  Trash,
  Undo2,
  Users,
  X,
} from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { CustomDatePicker } from "../ui/calendar";

// Constants (simulate from Angular config)
const ORG_MULTI_TRANSFER_BCY = Constant.ORG_MULTI_TRANSFER_BCY;
const LEADER_TRANSFER_CHECK_H05 = Constant.LEADER_TRANSFER_CHECK_H05;
const DEADLINE_CHECKBOX_TRANSFER_BCY = Constant.DEADLINE_CHECKBOX_TRANSFER_BCY;
const UPDATE_TRANSFER_BCY = Constant.UPDATE_TRANSFER_BCY;
const ENCRYPTION_TWD = Constant.ENCRYPTION_TWD;

// Custom DialogContent
const CustomDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-4xl translate-x-[-50%] translate-y-[-50%] gap-3 border bg-background p-4 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg overflow-y-auto max-h-[90vh]",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
));
CustomDialogContent.displayName = DialogPrimitive.Content.displayName;
export interface TransferDocumentOutDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  onSubmit: (data: {
    comment: string;
    cmtContent: string;
    main: any[];
    support: number[];
    show: number[];
    orgMain: number[];
    orgSupport: number[];
    orgShow: number[];
    direction: number[];
    deadlineDate: Date | null;
    requestReview: boolean;
    files: File[];
  }) => void;
  selectedRole: BpmnResponse | null;
  organizationData: TreeNode[];
  listIdDisableByOrgCheck: number[];
  listIdDisableByLeaderCheck: number[];
  listByOrgAndTypeIsOne: number[];
  listByOrgAndTypeIsTwo: number[];
  listByOrgAndTypeIsThree: number[];
  listByLeaderAndTypeIsOne: number[];
  listByLeaderAndTypeIsTwo: number[];
  listByLeaderAndTypeIsThree: number[];
}

export function TransferDocumentOutDialog({
  isOpen,
  onOpenChange,
  onClose,
  onSubmit,
  selectedRole,
  organizationData,
  listIdDisableByOrgCheck,
  listIdDisableByLeaderCheck,
  listByOrgAndTypeIsOne,
  listByOrgAndTypeIsTwo,
  listByOrgAndTypeIsThree,
  listByLeaderAndTypeIsOne,
  listByLeaderAndTypeIsTwo,
  listByLeaderAndTypeIsThree,
}: TransferDocumentOutDialogProps) {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [dataMainChecked, setDataMainChecked] = useState<any[]>([]);
  const [dataSubChecked, setDataSubChecked] = useState<any[]>([]);
  const [dataKnowChecked, setDataKnowChecked] = useState<any[]>([]);
  const [dataLeaderChecked, setDataLeaderChecked] = useState<any[]>([]);
  const [mainCheckedText, setMainCheckedText] = useState("");
  const [subCheckedText, setSubCheckedText] = useState("");
  const [knowCheckedText, setKnowCheckedText] = useState("");
  const [leaderCheckedText, setLeaderCheckedText] = useState("");
  const [transferComment, setTransferComment] = useState("");
  const [transferCommentError, setTransferCommentError] = useState<
    string | null
  >(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [validFiles, setValidFiles] = useState(true);
  const [isCheckedAllSupport, setIsCheckedAllSupport] = useState(false);
  const [isCheckedAllKnow, setIsCheckedAllKnow] = useState(false);
  const [isShowLeaderColumn, setIsShowLeaderColumn] = useState(false);
  const [isCreateTask, setIsCreateTask] = useState(false);
  const [isShowTaskInfo, setIsShowTaskInfo] = useState(false);
  const [task, setTask] = useState<{ taskName: string; endDate: Date | null }>({
    taskName: "",
    endDate: new Date(),
  });
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [deadlineDate, setDeadlineDate] = useState<Date | null>(null);
  const [requestReview, setRequestReview] = useState(false);
  const allowMultiple =
    ORG_MULTI_TRANSFER_BCY && (selectedRole?.allowMultiple || false);
  const isTransferOrganization = selectedRole?.allowMultiple || false;
  const resetState = () => {
    setExpandedItems(new Set());
    setDataMainChecked([]);
    setDataSubChecked([]);
    setDataKnowChecked([]);
    setDataLeaderChecked([]);
    setMainCheckedText("");
    setSubCheckedText("");
    setKnowCheckedText("");
    setLeaderCheckedText("");
    setTransferComment("");
    setSelectedFiles([]);
    setValidFiles(true);
    setIsCheckedAllSupport(false);
    setIsCheckedAllKnow(false);
    setIsShowLeaderColumn(false);
    setIsCreateTask(false);
    setIsShowTaskInfo(false);
    setTask({ taskName: "", endDate: new Date() });
    setDeadlineDate(null);
    setRequestReview(false);
  };

  useEffect(() => {
    if (!isOpen) {
      // When closing, clear all transient state so reopening starts fresh
      resetState();
      return;
    }

    // On open: reset selection state and rebuild tree from provided organizationData
    resetState();
    const clonedData = organizationData.map(deepCloneTree);
    const traverseAddFields = (item: TreeNode) => {
      item.data.isMainChecked = false;
      item.data.isSubChecked = false;
      item.data.isKnowChecked = false;
      item.data.isLeaderChecked = false;
      item.data.isMainChecked1 = false;
      item.data.isMainChecked2 = false;
      item.data.isMainChecked3 = false;
      item.data.isCheckAllColumnOrgMain = false;
      item.data.isCheckAllColumnOrgCombination = false;
      item.data.isCheckAllColumnOrgMainIdentified = false;
      if (item.children) item.children.forEach(traverseAddFields);
    };
    clonedData.forEach(traverseAddFields);
    setTreeData(clonedData);

    // Check for directionAuthority to show leader column
    let showLeader = false;
    const checkDirection = (item: TreeNode) => {
      if ("userName" in item.data && item.data.directionAuthority) {
        showLeader = true;
      }
      if (item.children) item.children.forEach(checkDirection);
    };
    clonedData.forEach(checkDirection);
    setIsShowLeaderColumn(showLeader);

    // Expand all
    const allIds: number[] = [];
    const collectIds = (item: TreeNode) => {
      allIds.push(item.data.id);
      if (item.children) item.children.forEach(collectIds);
    };
    clonedData.forEach(collectIds);
    setExpandedItems(new Set(allIds));
  }, [isOpen, organizationData]);

  const toggleExpanded = (id: number) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const removeObjInTree = (obj: any, tree: TreeNode[], type: number) => {
    tree.forEach((item) => {
      const match =
        (obj?.type === "User" &&
          ("userName" in item.data || "fullName" in item.data) &&
          obj.id === item.data.id) ||
        (obj.type === "User" &&
          !("userName" in item.data) &&
          obj.id === item.data.leaderId) ||
        (obj?.type === "Org" &&
          "userName" in item.data &&
          obj.leaderId === item.data.id) ||
        (obj.type === "Org" &&
          !("userName" in item.data) &&
          obj.leaderId === item.data.leaderId);
      if (match) {
        if (type === 0) item.data.isMainChecked = false;
        else if (type === 1) item.data.isSubChecked = false;
        else if (type === 2) item.data.isKnowChecked = false;
        else if (type === 3) item.data.isLeaderChecked = false;
      }
      if (item.children) removeObjInTree(obj, item.children, type);
    });
  };

  const removeMainObjInTree = (obj: any, tree: TreeNode[], type: number) => {
    tree.forEach((item) => {
      const match =
        (obj?.type === "User" &&
          ("userName" in item.data || "fullName" in item.data) &&
          obj.id === item.data.id) ||
        (obj?.type === "Org" &&
          !("userName" in item.data) &&
          obj.leaderId === item.data.leaderId);
      if (match) {
        if (type === 0) item.data.isMainChecked = false;
        else if (type === 1) item.data.isSubChecked = false;
        else if (type === 2) item.data.isKnowChecked = false;
        else if (type === 3) item.data.isLeaderChecked = false;
      }
      if (item.children) removeMainObjInTree(obj, item.children, type);
    });
  };

  const mainOnlyRemove = (obj: any) => {
    removeMainObjInTree(obj, treeData, 0);
    setDataMainChecked((prev) =>
      prev.filter(
        (item) =>
          !(
            (item?.type === obj?.type && item.id === obj.id) ||
            (item?.type !== obj?.type &&
              obj?.type === "User" &&
              obj?.id === item?.leaderId) ||
            (item?.type !== obj?.type &&
              obj?.type === "Org" &&
              obj?.leaderId === item?.id)
          )
      )
    );
  };

  const mainRemove = (obj: any) => {
    removeObjInTree(obj, treeData, 0);
    setDataMainChecked((prev) => {
      const newPrev = prev.filter(
        (item) =>
          !(
            (item.type === obj.type && item.id === obj.id) ||
            (item.type !== obj.type &&
              obj.type === "User" &&
              obj.id === item.leaderId) ||
            (item.type !== obj.type &&
              obj.type === "Org" &&
              obj.leaderId === item.id)
          )
      );
      setMainCheckedText(
        newPrev
          .map((x) =>
            x.type === "Org"
              ? `Đơn vị ${x.name}`
              : `${x.positionName} ${x.name}`
          )
          .join(", ")
      );
      return newPrev;
    });
  };

  const secondRemove = (obj: any) => {
    removeObjInTree(obj, treeData, 1);
    setDataSubChecked((prev) => {
      const newPrev = prev.filter(
        (item) =>
          !(
            (item.type === obj.type && item.id === obj.id) ||
            (item.type !== obj.type &&
              obj.type === "User" &&
              obj.id === item.leaderId) ||
            (item.type !== obj.type &&
              obj.type === "Org" &&
              obj.leaderId === item.id)
          )
      );
      setSubCheckedText(
        newPrev
          .map((x) =>
            x.type === "Org"
              ? `Đơn vị ${x.name}`
              : `${x.positionName} ${x.name}`
          )
          .join(", ")
      );
      return newPrev;
    });
  };

  const toKnowRemove = (obj: any) => {
    removeObjInTree(obj, treeData, 2);
    setDataKnowChecked((prev) => {
      const newPrev = prev.filter(
        (item) =>
          !(
            (item.type === obj.type && item.id === obj.id) ||
            (item.type !== obj.type &&
              obj.type === "User" &&
              obj.id === item.leaderId) ||
            (item.type !== obj.type &&
              obj.type === "Org" &&
              obj.leaderId === item.id)
          )
      );
      setKnowCheckedText(
        newPrev
          .map((x) =>
            x.type === "Org"
              ? `Đơn vị ${x.name}`
              : `${x.positionName} ${x.name}`
          )
          .join(", ")
      );
      return newPrev;
    });
  };

  const directionRemove = (obj: any) => {
    removeObjInTree(obj, treeData, 3);
    setDataLeaderChecked((prev) => {
      const newPrev = prev.filter(
        (item) =>
          !(
            (item.type === obj.type && item.id === obj.id) ||
            (item.type !== obj.type &&
              obj.type === "User" &&
              obj.id === item.leaderId) ||
            (item.type !== obj.type &&
              obj.type === "Org" &&
              obj.leaderId === item.id)
          )
      );
      setLeaderCheckedText(
        newPrev
          .map((x) =>
            x.type === "Org"
              ? `Đơn vị ${x.name}`
              : `${x.positionName} ${x.name}`
          )
          .join(", ")
      );
      return newPrev;
    });
  };

  const chooseMain = (
    isChecked: boolean,
    rowData: TreeNode,
    type: number = 1,
    checkTypeAll: boolean = false
  ) => {
    const obj =
      "userName" in rowData.data || "fullName" in rowData.data
        ? {
            type: "User",
            id: rowData.data.id,
            name: rowData.data.fullName,
            positionName: rowData.data.positionName,
            typeOrg: type,
          }
        : {
            type: "Org",
            id: rowData.data.id,
            name: rowData.data.name,
            leaderId: rowData.data.leaderId,
            typeOrg: type,
          };

    if (isChecked) {
      // Update checkbox state in tree
      if (allowMultiple && !checkTypeAll) {
        if (type === 1) {
          rowData.data.isMainChecked1 = true;
          rowData.data.isMainChecked2 = false;
          rowData.data.isMainChecked3 = false;
        } else if (type === 2) {
          rowData.data.isMainChecked1 = false;
          rowData.data.isMainChecked2 = true;
          rowData.data.isMainChecked3 = false;
        } else {
          rowData.data.isMainChecked1 = false;
          rowData.data.isMainChecked2 = false;
          rowData.data.isMainChecked3 = true;
        }
      }
      if (!allowMultiple) {
        rowData.data.isMainChecked = true;
      }

      // Calculate new main list
      let newMainList: any[];
      if (allowMultiple) {
        const existingIndex = dataMainChecked.findIndex(
          (x) => x.id === rowData.data.id
        );
        if (existingIndex !== -1) {
          newMainList = [...dataMainChecked];
          newMainList[existingIndex] = {
            ...newMainList[existingIndex],
            typeOrg: type,
          };
        } else {
          newMainList = [...dataMainChecked, obj];
        }
      } else {
        // Remove previous main if exists
        if (dataMainChecked.length > 0) {
          removeMainObjInTree(dataMainChecked[0], treeData, 0);
        }
        newMainList = [obj];
      }

      // Calculate filtered lists for other columns (remove this item from sub, direction, know)
      const filterFn = (item: any) =>
        !(
          (item.type === obj.type && item.id === obj.id) ||
          (item.type !== obj.type &&
            obj.type === "User" &&
            obj.id === item.leaderId) ||
          (item.type !== obj.type &&
            obj.type === "Org" &&
            obj.leaderId === item.id)
        );

      const newSubList = dataSubChecked.filter(filterFn);
      const newLeaderList = dataLeaderChecked.filter(filterFn);
      const newKnowList = dataKnowChecked.filter(filterFn);

      // Remove from tree
      removeObjInTree(obj, treeData, 1);
      removeObjInTree(obj, treeData, 3);
      removeObjInTree(obj, treeData, 2);

      // Update all states - no nesting
      setDataMainChecked(newMainList);

      if (allowMultiple) {
        // Set text by type for allowMultiple mode
        const listUser = newMainList.filter((item) => item.type === "User");
        const listOrg = newMainList.filter((item) => item.type !== "User");
        setMainCheckedText(
          setTextByType(
            listUser.filter((item) => item.typeOrg === 1),
            listOrg.filter((item) => item.typeOrg === 1)
          )
        );
        setSubCheckedText(
          setTextByType(
            listUser.filter((item) => item.typeOrg === 2),
            listOrg.filter((item) => item.typeOrg === 2)
          )
        );
        setKnowCheckedText(
          setTextByType(
            listUser.filter((item) => item.typeOrg === 3),
            listOrg.filter((item) => item.typeOrg === 3)
          )
        );

        // Update check all state
        if (!checkTypeAll) {
          const parent = treeData.find(
            (item) => item.data.id === rowData.data.parentId
          );
          if (parent) {
            const dataCheck =
              parent.children?.filter(
                (child) => !listIdDisableByOrgCheck.includes(child.data.id)
              ) || [];
            const checkedCount = newMainList.filter(
              (x) => x.typeOrg === type
            ).length;
            if (type === 1) {
              parent.data.isCheckAllColumnOrgMain =
                dataCheck.length === checkedCount;
            } else if (type === 2) {
              parent.data.isCheckAllColumnOrgCombination =
                dataCheck.length === checkedCount;
            } else if (type === 3) {
              parent.data.isCheckAllColumnOrgMainIdentified =
                dataCheck.length === checkedCount;
            }
          }
        }
      } else {
        setMainCheckedText(
          obj.type === "Org"
            ? `Đơn vị ${obj.name}`
            : `${obj.positionName} ${obj.name}`
        );
      }

      setDataSubChecked(newSubList);
      if (!allowMultiple) {
        setSubCheckedText(
          newSubList
            .map((x) =>
              x.type === "Org"
                ? `Đơn vị ${x.name}`
                : `${x.positionName} ${x.name}`
            )
            .join(", ")
        );
      }

      setDataLeaderChecked(newLeaderList);
      setLeaderCheckedText(
        newLeaderList
          .map((x) =>
            x.type === "Org"
              ? `Đơn vị ${x.name}`
              : `${x.positionName} ${x.name}`
          )
          .join(", ")
      );

      setDataKnowChecked(newKnowList);
      if (!allowMultiple) {
        setKnowCheckedText(
          newKnowList
            .map((x) =>
              x.type === "Org"
                ? `Đơn vị ${x.name}`
                : `${x.positionName} ${x.name}`
            )
            .join(", ")
        );
      }
    } else {
      // Unchecked
      if (allowMultiple) {
        if (type === 1) {
          rowData.data.isMainChecked1 = false;
        } else if (type === 2) {
          rowData.data.isMainChecked2 = false;
        } else if (type === 3) {
          rowData.data.isMainChecked3 = false;
        }
      } else {
        rowData.data.isMainChecked = false;
      }

      const newMainList = dataMainChecked.filter((x) => x.id !== obj.id);
      setDataMainChecked(newMainList);

      if (allowMultiple) {
        // Set text by type for allowMultiple mode
        const listUser = newMainList.filter((item) => item.type === "User");
        const listOrg = newMainList.filter((item) => item.type !== "User");
        setMainCheckedText(
          setTextByType(
            listUser.filter((item) => item.typeOrg === 1),
            listOrg.filter((item) => item.typeOrg === 1)
          )
        );
        setSubCheckedText(
          setTextByType(
            listUser.filter((item) => item.typeOrg === 2),
            listOrg.filter((item) => item.typeOrg === 2)
          )
        );
        setKnowCheckedText(
          setTextByType(
            listUser.filter((item) => item.typeOrg === 3),
            listOrg.filter((item) => item.typeOrg === 3)
          )
        );

        // Update check all state
        if (!checkTypeAll) {
          const parent = treeData.find(
            (item) => item.data.id === rowData.data.parentId
          );
          if (parent) {
            const dataCheck =
              parent.children?.filter(
                (child) => !listIdDisableByOrgCheck.includes(child.data.id)
              ) || [];
            const checkedCount = newMainList.filter(
              (x) => x.typeOrg === type
            ).length;
            if (type === 1) {
              parent.data.isCheckAllColumnOrgMain =
                dataCheck.length === checkedCount;
            } else if (type === 2) {
              parent.data.isCheckAllColumnOrgCombination =
                dataCheck.length === checkedCount;
            } else if (type === 3) {
              parent.data.isCheckAllColumnOrgMainIdentified =
                dataCheck.length === checkedCount;
            }
          }
        }
      } else {
        setMainCheckedText("");
      }
    }

    // Force tree re-render
    setTreeData((prev) => [...prev]);
  };

  const setListName = (list: any[]) => {
    const listUser = list.filter((item) => item.type === "User");
    const listOrg = list.filter((item) => item.type !== "User");
    setMainCheckedText(
      setTextByType(
        listUser.filter((item) => item.typeOrg === 1),
        listOrg.filter((item) => item.typeOrg === 1)
      )
    );
    setSubCheckedText(
      setTextByType(
        listUser.filter((item) => item.typeOrg === 2),
        listOrg.filter((item) => item.typeOrg === 2)
      )
    );
    setKnowCheckedText(
      setTextByType(
        listUser.filter((item) => item.typeOrg === 3),
        listOrg.filter((item) => item.typeOrg === 3)
      )
    );
  };

  const setTextByType = (listUser: any[], listOrg: any[]): string => {
    const orgText = listOrg.map((element) => element.name).join(", ");
    const userText = listUser
      .map((element) => `${element.positionName} - ${element.name}`)
      .join(", ");
    const org = orgText ? `Đơn vị: ${orgText}` : "";
    const user = userText ? `${orgText ? "; " : ""}Lãnh đạo: ${userText}` : "";
    return org + user;
  };

  const setvalueCheckAll = (
    listData: any[],
    orgParentId: number,
    type: number
  ) => {
    setTreeData((prevTree) => {
      const newTree = [...prevTree];
      const parent = newTree.find((item) => item.data.id === orgParentId);
      if (parent) {
        const dataCheck =
          parent.children?.filter(
            (child) => !listIdDisableByOrgCheck.includes(child.data.id)
          ) || [];
        if (type === 1) {
          parent.data.isCheckAllColumnOrgMain =
            dataCheck.length === listData.length;
        } else if (type === 2) {
          parent.data.isCheckAllColumnOrgCombination =
            dataCheck.length === listData.length;
        } else if (type === 3) {
          parent.data.isCheckAllColumnOrgMainIdentified =
            dataCheck.length === listData.length;
        }
      }
      return newTree;
    });
  };

  const checkAllColumnOrgMain = (
    type: number,
    rowData: TreeNode,
    checkBox: boolean
  ) => {
    if (checkBox) {
      checkedColumnOrgMain(treeData, type, rowData);
    } else {
      unCheckedColumnOrgMain(treeData, type, rowData);
    }
  };

  const checkedColumnOrgMain = (
    showTree: TreeNode[],
    type: number,
    rowData: TreeNode
  ) => {
    // Collect items to check
    const itemsToAdd: any[] = [];

    const collectItems = (nodes: TreeNode[]) => {
      nodes.forEach((x) => {
        const tmp = listIdDisableByOrgCheck.filter((id) => id === x.data.id);
        if (tmp.length === 0 && x.data.id !== rowData.data.id) {
          if (x.data.parentId === rowData.data.id) {
            // Update checkbox state directly
            if (type === 1) {
              x.data.isMainChecked1 = true;
              x.data.isMainChecked2 = false;
              x.data.isMainChecked3 = false;
            } else if (type === 2) {
              x.data.isMainChecked1 = false;
              x.data.isMainChecked2 = true;
              x.data.isMainChecked3 = false;
            } else if (type === 3) {
              x.data.isMainChecked1 = false;
              x.data.isMainChecked2 = false;
              x.data.isMainChecked3 = true;
            }

            // Create object
            const obj =
              "userName" in x.data || "fullName" in x.data
                ? {
                    type: "User",
                    id: x.data.id,
                    name: x.data.fullName,
                    positionName: x.data.positionName,
                    typeOrg: type,
                  }
                : {
                    type: "Org",
                    id: x.data.id,
                    name: x.data.name,
                    leaderId: x.data.leaderId,
                    typeOrg: type,
                  };
            itemsToAdd.push(obj);
          }
        }
        if (x.children && x.children.length > 0) {
          collectItems(x.children);
        }
      });
    };

    collectItems(showTree);

    // Update check all state
    if (type === 1) {
      rowData.data.isCheckAllColumnOrgMain = true;
      rowData.data.isCheckAllColumnOrgCombination = false;
      rowData.data.isCheckAllColumnOrgMainIdentified = false;
    } else if (type === 2) {
      rowData.data.isCheckAllColumnOrgMain = false;
      rowData.data.isCheckAllColumnOrgCombination = true;
      rowData.data.isCheckAllColumnOrgMainIdentified = false;
    } else if (type === 3) {
      rowData.data.isCheckAllColumnOrgMain = false;
      rowData.data.isCheckAllColumnOrgCombination = false;
      rowData.data.isCheckAllColumnOrgMainIdentified = true;
    }

    // Calculate new main list - update typeOrg for existing items or add new ones
    const newMainList = [...dataMainChecked];
    itemsToAdd.forEach((obj) => {
      const existingIndex = newMainList.findIndex((x) => x.id === obj.id);
      if (existingIndex !== -1) {
        newMainList[existingIndex] = {
          ...newMainList[existingIndex],
          typeOrg: type,
        };
      } else {
        newMainList.push(obj);
      }
    });

    // Update states
    setDataMainChecked(newMainList);

    // Set text by type
    const listUser = newMainList.filter((item) => item.type === "User");
    const listOrg = newMainList.filter((item) => item.type !== "User");
    setMainCheckedText(
      setTextByType(
        listUser.filter((item) => item.typeOrg === 1),
        listOrg.filter((item) => item.typeOrg === 1)
      )
    );
    setSubCheckedText(
      setTextByType(
        listUser.filter((item) => item.typeOrg === 2),
        listOrg.filter((item) => item.typeOrg === 2)
      )
    );
    setKnowCheckedText(
      setTextByType(
        listUser.filter((item) => item.typeOrg === 3),
        listOrg.filter((item) => item.typeOrg === 3)
      )
    );

    // Force tree re-render
    setTreeData((prev) => [...prev]);
  };

  const unCheckedColumnOrgMain = (
    showTree: TreeNode[],
    type: number,
    rowData: TreeNode
  ) => {
    // Collect ids to remove
    const idsToRemove: number[] = [];

    const collectIds = (nodes: TreeNode[]) => {
      nodes.forEach((x) => {
        if (x.data.parentId === rowData.data.id) {
          if (type === 1 && x.data.isMainChecked1) {
            x.data.isMainChecked1 = false;
            idsToRemove.push(x.data.id);
          } else if (type === 2 && x.data.isMainChecked2) {
            x.data.isMainChecked2 = false;
            idsToRemove.push(x.data.id);
          } else if (type === 3 && x.data.isMainChecked3) {
            x.data.isMainChecked3 = false;
            idsToRemove.push(x.data.id);
          }
        }
        if (x.children && x.children.length > 0) {
          collectIds(x.children);
        }
      });
    };

    collectIds(showTree);

    // Update check all state
    if (type === 1) {
      rowData.data.isCheckAllColumnOrgMain = false;
    } else if (type === 2) {
      rowData.data.isCheckAllColumnOrgCombination = false;
    } else if (type === 3) {
      rowData.data.isCheckAllColumnOrgMainIdentified = false;
    }

    // Calculate new main list - remove items with matching ids
    const newMainList = dataMainChecked.filter(
      (x) => !idsToRemove.includes(x.id)
    );

    // Update states
    setDataMainChecked(newMainList);

    // Set text by type
    const listUser = newMainList.filter((item) => item.type === "User");
    const listOrg = newMainList.filter((item) => item.type !== "User");
    setMainCheckedText(
      setTextByType(
        listUser.filter((item) => item.typeOrg === 1),
        listOrg.filter((item) => item.typeOrg === 1)
      )
    );
    setSubCheckedText(
      setTextByType(
        listUser.filter((item) => item.typeOrg === 2),
        listOrg.filter((item) => item.typeOrg === 2)
      )
    );
    setKnowCheckedText(
      setTextByType(
        listUser.filter((item) => item.typeOrg === 3),
        listOrg.filter((item) => item.typeOrg === 3)
      )
    );

    // Force tree re-render
    setTreeData((prev) => [...prev]);
  };

  const checkMainProcess = (isChecked: boolean, rowData: TreeNode) => {
    // Assume no delegateUsers for now
    chooseMain(isChecked, rowData);
  };

  const checkSubProcess = (isChecked: boolean, rowData: TreeNode) => {
    setIsCheckedAllSupport(false);
    chooseSub(isChecked, rowData);
  };

  const chooseSub = (isChecked: boolean, rowData: TreeNode) => {
    const obj =
      "userName" in rowData.data || "fullName" in rowData.data
        ? {
            type: "User",
            id: rowData.data.id,
            name: rowData.data.fullName,
            positionName: rowData.data.positionName,
          }
        : {
            type: "Org",
            id: rowData.data.id,
            name: rowData.data.name,
            leaderId: rowData.data.leaderId,
          };

    if (isChecked) {
      // Update checkbox state
      rowData.data.isSubChecked = true;

      // Calculate new sub list
      const exists = dataSubChecked.some(
        (x) => x.id === obj.id && x.type === obj.type
      );
      const newSubList = exists ? dataSubChecked : [...dataSubChecked, obj];

      // Calculate filtered lists for other columns
      const filterFn = (item: any) =>
        !(
          (item.type === obj.type && item.id === obj.id) ||
          (item.type !== obj.type &&
            obj.type === "User" &&
            obj.id === item.leaderId) ||
          (item.type !== obj.type &&
            obj.type === "Org" &&
            obj.leaderId === item.id)
        );

      const newMainList = dataMainChecked.filter(filterFn);
      const newLeaderList = dataLeaderChecked.filter(filterFn);
      const newKnowList = dataKnowChecked.filter(filterFn);

      // Remove from tree
      removeObjInTree(obj, treeData, 0);
      removeObjInTree(obj, treeData, 3);
      removeObjInTree(obj, treeData, 2);

      // Update all states - no nesting
      setDataSubChecked(newSubList);
      setSubCheckedText(
        newSubList
          .map((x) =>
            x.type === "Org"
              ? `Đơn vị ${x.name}`
              : `${x.positionName} ${x.name}`
          )
          .join(", ")
      );

      setDataMainChecked(newMainList);
      setMainCheckedText(
        newMainList
          .map((x) =>
            x.type === "Org"
              ? `Đơn vị ${x.name}`
              : `${x.positionName} ${x.name}`
          )
          .join(", ")
      );

      setDataLeaderChecked(newLeaderList);
      setLeaderCheckedText(
        newLeaderList
          .map((x) =>
            x.type === "Org"
              ? `Đơn vị ${x.name}`
              : `${x.positionName} ${x.name}`
          )
          .join(", ")
      );

      setDataKnowChecked(newKnowList);
      setKnowCheckedText(
        newKnowList
          .map((x) =>
            x.type === "Org"
              ? `Đơn vị ${x.name}`
              : `${x.positionName} ${x.name}`
          )
          .join(", ")
      );
    } else {
      // Unchecked
      rowData.data.isSubChecked = false;
      const newSubList = dataSubChecked.filter((x) => x.id !== obj.id);
      setDataSubChecked(newSubList);
      setSubCheckedText(
        newSubList
          .map((x) =>
            x.type === "Org"
              ? `Đơn vị ${x.name}`
              : `${x.positionName} ${x.name}`
          )
          .join(", ")
      );
    }

    // Force tree re-render
    setTreeData((prev) => [...prev]);
  };

  const checkKnowProcess = (isChecked: boolean, rowData: TreeNode) => {
    setIsCheckedAllKnow(false);
    chooseKnow(isChecked, rowData);
  };

  const chooseKnow = (isChecked: boolean, rowData: TreeNode) => {
    const obj =
      "userName" in rowData.data || "fullName" in rowData.data
        ? {
            type: "User",
            id: rowData.data.id,
            name: rowData.data.fullName,
            positionName: rowData.data.positionName,
          }
        : {
            type: "Org",
            id: rowData.data.id,
            name: rowData.data.name,
            leaderId: rowData.data.leaderId,
          };

    if (isChecked) {
      // Update checkbox state
      rowData.data.isKnowChecked = true;

      // Calculate new know list
      const exists = dataKnowChecked.some(
        (x) => x.id === obj.id && x.type === obj.type
      );
      const newKnowList = exists ? dataKnowChecked : [...dataKnowChecked, obj];

      // Calculate filtered lists for other columns
      const filterFn = (item: any) =>
        !(
          (item.type === obj.type && item.id === obj.id) ||
          (item.type !== obj.type &&
            obj.type === "User" &&
            obj.id === item.leaderId) ||
          (item.type !== obj.type &&
            obj.type === "Org" &&
            obj.leaderId === item.id)
        );

      const newMainList = dataMainChecked.filter(filterFn);
      const newLeaderList = dataLeaderChecked.filter(filterFn);
      const newSubList = dataSubChecked.filter(filterFn);

      // Remove from tree
      removeObjInTree(obj, treeData, 0);
      removeObjInTree(obj, treeData, 3);
      removeObjInTree(obj, treeData, 1);

      // Update all states - no nesting
      setDataKnowChecked(newKnowList);
      setKnowCheckedText(
        newKnowList
          .map((x) =>
            x.type === "Org"
              ? `Đơn vị ${x.name}`
              : `${x.positionName} ${x.name}`
          )
          .join(", ")
      );

      setDataMainChecked(newMainList);
      setMainCheckedText(
        newMainList
          .map((x) =>
            x.type === "Org"
              ? `Đơn vị ${x.name}`
              : `${x.positionName} ${x.name}`
          )
          .join(", ")
      );

      setDataLeaderChecked(newLeaderList);
      setLeaderCheckedText(
        newLeaderList
          .map((x) =>
            x.type === "Org"
              ? `Đơn vị ${x.name}`
              : `${x.positionName} ${x.name}`
          )
          .join(", ")
      );

      setDataSubChecked(newSubList);
      setSubCheckedText(
        newSubList
          .map((x) =>
            x.type === "Org"
              ? `Đơn vị ${x.name}`
              : `${x.positionName} ${x.name}`
          )
          .join(", ")
      );
    } else {
      // Unchecked
      rowData.data.isKnowChecked = false;
      const newKnowList = dataKnowChecked.filter((x) => x.id !== obj.id);
      setDataKnowChecked(newKnowList);
      setKnowCheckedText(
        newKnowList
          .map((x) =>
            x.type === "Org"
              ? `Đơn vị ${x.name}`
              : `${x.positionName} ${x.name}`
          )
          .join(", ")
      );
    }

    // Force tree re-render
    setTreeData((prev) => [...prev]);
  };

  const checkLeaderProcess = (isChecked: boolean, rowData: TreeNode) => {
    const obj = {
      type: "User",
      id: rowData.data.id,
      name: rowData.data.fullName,
      positionName: rowData.data.positionName,
    };

    if (isChecked) {
      // Uncheck previous leader if any
      if (dataLeaderChecked.length > 0) {
        removeMainObjInTree(dataLeaderChecked[0], treeData, 3);
      }

      // Update leader state
      rowData.data.isLeaderChecked = true;

      // Calculate filtered lists for other columns - leader is always User type
      const filterFn = (item: any) =>
        !(
          (item.type === "User" && item.id === obj.id) ||
          (item.type === "Org" && item.leaderId === obj.id)
        );

      const newMainList = dataMainChecked.filter(filterFn);
      const newKnowList = dataKnowChecked.filter(filterFn);
      const newSubList = dataSubChecked.filter(filterFn);

      // Remove from tree
      removeObjInTree(obj, treeData, 0);
      removeObjInTree(obj, treeData, 2);
      removeObjInTree(obj, treeData, 1);

      // Update all states - no nesting
      setDataLeaderChecked([obj]);
      setLeaderCheckedText(`${obj.positionName} ${obj.name}`);

      setDataMainChecked(newMainList);
      setMainCheckedText(
        newMainList
          .map((x) =>
            x.type === "Org"
              ? `Đơn vị ${x.name}`
              : `${x.positionName} ${x.name}`
          )
          .join(", ")
      );

      setDataKnowChecked(newKnowList);
      setKnowCheckedText(
        newKnowList
          .map((x) =>
            x.type === "Org"
              ? `Đơn vị ${x.name}`
              : `${x.positionName} ${x.name}`
          )
          .join(", ")
      );

      setDataSubChecked(newSubList);
      setSubCheckedText(
        newSubList
          .map((x) =>
            x.type === "Org"
              ? `Đơn vị ${x.name}`
              : `${x.positionName} ${x.name}`
          )
          .join(", ")
      );
    } else {
      rowData.data.isLeaderChecked = false;
      setDataLeaderChecked([]);
      setLeaderCheckedText("");
    }

    // Force tree re-render
    setTreeData((prev) => [...prev]);
  };

  const onChangeAllSub = () => {
    const newChecked = !isCheckedAllSupport;
    setIsCheckedAllSupport(newChecked);
    if (newChecked) {
      setDataSubChecked([]);
      checkedAllSub(treeData);
    } else {
      setSubCheckedText("");
      unCheckedAllSub(treeData);
    }
  };

  const checkedAllSub = (tree: TreeNode[]) => {
    // Collect items to check
    const itemsToCheck: any[] = [];

    const collectItems = (nodes: TreeNode[]) => {
      nodes.forEach((x) => {
        if (
          "userName" in x.data ||
          (!("userName" in x.data) && x.data.haveLeader)
        ) {
          if (!("userName" in x.data) && x.data.haveLeader) {
            const tmp = x.children?.find(
              (y) =>
                "userName" in y.data &&
                (y.data.isMainChecked || y.data.isKnowChecked)
            );
            if (!tmp && !x.data.isMainChecked && !x.data.isKnowChecked) {
              x.data.isSubChecked = true;
              const obj =
                "userName" in x.data || "fullName" in x.data
                  ? {
                      type: "User",
                      id: x.data.id,
                      name: x.data.fullName,
                      positionName: x.data.positionName,
                    }
                  : {
                      type: "Org",
                      id: x.data.id,
                      name: x.data.name,
                      leaderId: x.data.leaderId,
                    };
              itemsToCheck.push(obj);
            }
          } else if ("userName" in x.data) {
            if (x.data.lead) {
              if (x.parent && !x.parent.data.isMainChecked) {
                if (!x.data.isMainChecked && !x.data.isKnowChecked) {
                  x.data.isSubChecked = true;
                  const obj = {
                    type: "User",
                    id: x.data.id,
                    name: x.data.fullName,
                    positionName: x.data.positionName,
                  };
                  itemsToCheck.push(obj);
                }
              }
            } else if (!x.data.isMainChecked && !x.data.isKnowChecked) {
              x.data.isSubChecked = true;
              const obj = {
                type: "User",
                id: x.data.id,
                name: x.data.fullName,
                positionName: x.data.positionName,
              };
              itemsToCheck.push(obj);
            }
          } else if (!x.data.isMainChecked && !x.data.isKnowChecked) {
            x.data.isSubChecked = true;
            const obj =
              "userName" in x.data || "fullName" in x.data
                ? {
                    type: "User",
                    id: x.data.id,
                    name: x.data.fullName,
                    positionName: x.data.positionName,
                  }
                : {
                    type: "Org",
                    id: x.data.id,
                    name: x.data.name,
                    leaderId: x.data.leaderId,
                  };
            itemsToCheck.push(obj);
          }
        }
        if (x.children && x.children.length > 0) {
          collectItems(x.children);
        }
      });
    };

    collectItems(tree);

    // Update sub checked array
    setDataSubChecked(itemsToCheck);
    setSubCheckedText(
      itemsToCheck
        .map((x) =>
          x.type === "Org" ? `Đơn vị ${x.name}` : `${x.positionName} ${x.name}`
        )
        .join(", ")
    );

    // Force tree re-render
    setTreeData((prev) => [...prev]);
  };

  const unCheckedAllSub = (tree: TreeNode[]) => {
    setTreeData((prev) => {
      const newTree = [...prev];
      tree.forEach((x) => {
        if (x.data.isSubChecked) {
          x.data.isSubChecked = false;
        }
        if (x.children && x.children.length > 0) {
          unCheckedAllSub(x.children);
        }
      });
      return newTree;
    });
    setDataSubChecked([]);
  };

  const onChangeAllKnow = () => {
    const newChecked = !isCheckedAllKnow;
    setIsCheckedAllKnow(newChecked);
    if (newChecked) {
      setDataKnowChecked([]);
      checkedAllKnow(treeData);
    } else {
      setKnowCheckedText("");
      unCheckedAllKnow(treeData);
    }
  };

  const checkedAllKnow = (tree: TreeNode[]) => {
    // Collect items to check
    const itemsToCheck: any[] = [];

    const collectItems = (nodes: TreeNode[]) => {
      nodes.forEach((x) => {
        if (
          "userName" in x.data ||
          (!("userName" in x.data) && x.data.haveLeader)
        ) {
          if (!("userName" in x.data) && x.data.haveLeader) {
            const tmp = x.children?.find(
              (y) =>
                "userName" in y.data &&
                (y.data.isMainChecked || y.data.isSubChecked)
            );
            if (!tmp && !x.data.isMainChecked && !x.data.isSubChecked) {
              x.data.isKnowChecked = true;
              const obj =
                "userName" in x.data || "fullName" in x.data
                  ? {
                      type: "User",
                      id: x.data.id,
                      name: x.data.fullName,
                      positionName: x.data.positionName,
                    }
                  : {
                      type: "Org",
                      id: x.data.id,
                      name: x.data.name,
                      leaderId: x.data.leaderId,
                    };
              itemsToCheck.push(obj);
            }
          } else if ("userName" in x.data) {
            if (x.data.lead) {
              if (x.parent && !x.parent.data.isMainChecked) {
                if (!x.data.isMainChecked && !x.data.isSubChecked) {
                  x.data.isKnowChecked = true;
                  const obj = {
                    type: "User",
                    id: x.data.id,
                    name: x.data.fullName,
                    positionName: x.data.positionName,
                  };
                  itemsToCheck.push(obj);
                }
              }
            } else if (!x.data.isMainChecked && !x.data.isSubChecked) {
              x.data.isKnowChecked = true;
              const obj = {
                type: "User",
                id: x.data.id,
                name: x.data.fullName,
                positionName: x.data.positionName,
              };
              itemsToCheck.push(obj);
            }
          } else if (!x.data.isMainChecked && !x.data.isSubChecked) {
            x.data.isKnowChecked = true;
            const obj =
              "userName" in x.data || "fullName" in x.data
                ? {
                    type: "User",
                    id: x.data.id,
                    name: x.data.fullName,
                    positionName: x.data.positionName,
                  }
                : {
                    type: "Org",
                    id: x.data.id,
                    name: x.data.name,
                    leaderId: x.data.leaderId,
                  };
            itemsToCheck.push(obj);
          }
        }
        if (x.children && x.children.length > 0) {
          collectItems(x.children);
        }
      });
    };

    collectItems(tree);

    // Update know checked array
    setDataKnowChecked(itemsToCheck);
    setKnowCheckedText(
      itemsToCheck
        .map((x) =>
          x.type === "Org" ? `Đơn vị ${x.name}` : `${x.positionName} ${x.name}`
        )
        .join(", ")
    );

    // Force tree re-render
    setTreeData((prev) => [...prev]);
  };

  const unCheckedAllKnow = (tree: TreeNode[]) => {
    setTreeData((prev) => {
      const newTree = [...prev];
      tree.forEach((x) => {
        if (x.data.isKnowChecked) {
          x.data.isKnowChecked = false;
        }
        if (x.children && x.children.length > 0) {
          unCheckedAllKnow(x.children);
        }
      });
      return newTree;
    });
    setDataKnowChecked([]);
  };

  const handleSelectFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // Validate size (assume 10MB limit as example)
    if (files.some((f) => f.size > 10 * 1024 * 1024)) {
      setValidFiles(false);
      return;
    }
    setValidFiles(true);
    setSelectedFiles((prev) => [
      ...prev,
      ...files.filter((f) => !prev.some((p) => p.name === f.name)),
    ]);
    // Reset the input so selecting the same file again still triggers onChange
    if (e.target) e.target.value = "";
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleToggleEncrypt = (index: number) => {
    setSelectedFiles((prev) => {
      const newFiles = [...prev];
      (newFiles[index] as any).encrypt = !(newFiles[index] as any).encrypt;
      return newFiles;
    });
  };

  const onClickCreateTask = () => {
    setIsCreateTask(!isCreateTask);
    if (!isCreateTask) {
      setIsTaskModalOpen(true);
    } else {
      setIsShowTaskInfo(false);
    }
  };

  const handleSaveTask = () => {
    if (task.taskName.trim().length <= 0) {
      return;
    }
    setIsShowTaskInfo(true);
    setIsTaskModalOpen(false);
  };

  const handleSubmit = () => {
    const orgMain: number[] = [];
    const orgSupport: number[] = [];
    const orgShow: number[] = [];
    const main: any[] = [];
    const support: number[] = [];
    const show: number[] = [];
    const direction: number[] = dataLeaderChecked.map((x) => x.id);

    if (allowMultiple) {
      dataMainChecked.forEach((x) => {
        const listOrgPush = [x.id, x.typeOrg, x.type === "User" ? 1 : 0];
        main.push(listOrgPush);
      });
    } else {
      dataMainChecked.forEach((x) => {
        if (x.type === "User") {
          const id = x.delegatedId ? `${x.id}-${x.delegatedId}` : x.id;
          main.push(id);
        } else if (x.type === "Org" && x.leaderId) {
          orgMain.push(x.id);
        } else if (x.type === "Org" && !x.leaderId) {
          ToastUtils.donViChuaCoTruongPhong(x.name);
          return;
        }
      });
      dataSubChecked.forEach((x) => {
        if (x.type === "User") {
          const id = x.delegatedId ? `${x.id}-${x.delegatedId}` : x.id;
          support.push(id);
        } else if (x.type === "Org" && x.leaderId) {
          orgSupport.push(x.id);
        } else if (x.type === "Org" && !x.leaderId) {
          ToastUtils.donViChuaCoTruongPhong(x.name);
          return;
        }
      });
      dataKnowChecked.forEach((x) => {
        if (x.type === "User") {
          show.push(x.id);
        } else if (x.type === "Org" && x.leaderId) {
          orgShow.push(x.id);
        } else if (x.type === "Org" && !x.leaderId) {
          ToastUtils.donViChuaCoTruongPhong(x.name);
          return;
        }
      });
    }

    let cmtContent = `\n- Xử lý chính : ${mainCheckedText}\n`;
    if (support.length > 0 || orgSupport.length > 0) {
      cmtContent += `- Phối hợp : ${subCheckedText}\n`;
    }
    if (show.length > 0 || orgShow.length > 0) {
      cmtContent += `- Nhận để biết : ${knowCheckedText}\n`;
    }
    const comment = transferComment ? `- ${transferComment.trim()}` : "";

    onSubmit({
      comment,
      cmtContent,
      main,
      support,
      show,
      orgMain,
      orgSupport,
      orgShow,
      direction,
      deadlineDate,
      requestReview,
      files: selectedFiles,
    });
    onClose();
  };

  const renderTreeRow = (item: TreeNode, level: number) => {
    const rowData = item;
    const isExpanded = expandedItems.has(rowData.data.id);
    const hasName = "name" in rowData.data;
    const hasUserName = "userName" in rowData.data;
    const hasFullName = "fullName" in rowData.data;
    const isOrg = hasName;
    const isUser = hasUserName || hasFullName;
    const isLeader = isUser && rowData.data.directionAuthority;
    const isTransfered = rowData.data.isTransfered || false; // Assume false if not present
    const userId = 0; // Assume current userId, replace with actual
    const disabledByOrg = listIdDisableByOrgCheck.includes(rowData.data.id);

    return (
      <React.Fragment key={rowData.data.id}>
        <TableRow>
          <TableCell>
            <div
              className="flex items-center"
              style={{ paddingLeft: `${level * 20}px` }}
            >
              {rowData.children && rowData.children.length > 0 && (
                <button onClick={() => toggleExpanded(rowData.data.id)}>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              )}
              {isOrg ? (
                <Building className="h-4 w-4 ml-2" />
              ) : (
                <Users className="h-4 w-4 ml-2" />
              )}
              <span className="ml-2">
                {rowData.data.name || rowData.data.fullName}
              </span>
            </div>
          </TableCell>

          {LEADER_TRANSFER_CHECK_H05 && isShowLeaderColumn && (
            <TableCell className="text-center bg-red-100/50">
              {isUser && isLeader && (
                <Checkbox
                  checked={rowData.data.isLeaderChecked}
                  onCheckedChange={(checked) =>
                    checkLeaderProcess(!!checked, rowData)
                  }
                />
              )}
            </TableCell>
          )}

          <TableCell className="text-center bg-red-100/50">
            {isOrg && allowMultiple ? (
              rowData.data.parentId == null ? (
                <Checkbox
                  checked={rowData.data.isCheckAllColumnOrgMain}
                  onCheckedChange={(checked) =>
                    checkAllColumnOrgMain(1, rowData, !!checked)
                  }
                />
              ) : (
                <Checkbox
                  disabled={disabledByOrg}
                  checked={
                    listByOrgAndTypeIsOne.includes(rowData.data.id)
                      ? true
                      : rowData.data.isMainChecked1
                  }
                  onCheckedChange={(checked) =>
                    chooseMain(!!checked, rowData, 1, false)
                  }
                />
              )
            ) : isOrg && !allowMultiple ? (
              <Checkbox
                checked={rowData.data.isMainChecked}
                onCheckedChange={(checked) =>
                  checkMainProcess(!!checked, rowData)
                }
                disabled={!rowData.data.haveLeader}
              />
            ) : hasUserName ? (
              <Checkbox
                checked={rowData.data.isMainChecked}
                onCheckedChange={(checked) =>
                  checkMainProcess(!!checked, rowData)
                }
                disabled={isTransfered || userId === rowData.data.id}
              />
            ) : hasFullName ? (
              <Checkbox
                checked={
                  listByLeaderAndTypeIsOne.includes(rowData.data.id)
                    ? true
                    : rowData.data.isMainChecked1
                }
                onCheckedChange={(checked) =>
                  chooseMain(!!checked, rowData, 1, false)
                }
                disabled={disabledByOrg}
              />
            ) : null}
          </TableCell>

          {allowMultiple ? (
            <TableCell className="text-center bg-blue-100/50">
              {isOrg ? (
                rowData.data.parentId == null ? (
                  <Checkbox
                    checked={rowData.data.isCheckAllColumnOrgCombination}
                    onCheckedChange={(checked) =>
                      checkAllColumnOrgMain(2, rowData, !!checked)
                    }
                  />
                ) : (
                  <Checkbox
                    disabled={!(disabledByOrg ? false : true)}
                    checked={
                      listByOrgAndTypeIsTwo.includes(rowData.data.id)
                        ? true
                        : rowData.data.isMainChecked2
                    }
                    onCheckedChange={(checked) =>
                      chooseMain(!!checked, rowData, 2, false)
                    }
                  />
                )
              ) : isUser ? (
                <Checkbox
                  checked={rowData.data.isMainChecked2}
                  onCheckedChange={(checked) =>
                    chooseMain(!!checked, rowData, 2, false)
                  }
                  disabled={disabledByOrg}
                />
              ) : null}
            </TableCell>
          ) : (
            <TableCell className="text-center bg-blue-100/50">
              {isOrg ? (
                <Checkbox
                  checked={rowData.data.isSubChecked}
                  onCheckedChange={(checked) =>
                    checkSubProcess(!!checked, rowData)
                  }
                  disabled={!rowData.data.haveLeader}
                />
              ) : isUser ? (
                <Checkbox
                  checked={
                    listByLeaderAndTypeIsThree.includes(rowData.data.id)
                      ? true
                      : rowData.data.isSubChecked
                  }
                  onCheckedChange={(checked) =>
                    checkSubProcess(!!checked, rowData)
                  }
                  disabled={isTransfered || userId === rowData.data.id}
                />
              ) : null}
            </TableCell>
          )}

          {allowMultiple ? (
            <TableCell className="text-center bg-green-100/50">
              {isOrg ? (
                rowData.data.parentId == null ? (
                  <Checkbox
                    checked={rowData.data.isCheckAllColumnOrgMainIdentified}
                    onCheckedChange={(checked) =>
                      checkAllColumnOrgMain(3, rowData, !!checked)
                    }
                  />
                ) : (
                  <Checkbox
                    disabled={disabledByOrg}
                    checked={
                      listByOrgAndTypeIsThree.includes(rowData.data.id)
                        ? true
                        : rowData.data.isMainChecked3
                    }
                    onCheckedChange={(checked) => {
                      chooseMain(!!checked, rowData, 3, false);
                    }}
                  />
                )
              ) : isUser ? (
                <Checkbox
                  checked={
                    listByLeaderAndTypeIsTwo.includes(rowData.data.id)
                      ? true
                      : rowData.data.isMainChecked3
                  }
                  onCheckedChange={(checked) =>
                    chooseMain(!!checked, rowData, 3, false)
                  }
                  disabled={disabledByOrg}
                />
              ) : null}
            </TableCell>
          ) : (
            <TableCell className="text-center bg-green-100/50">
              {isOrg ? (
                <Checkbox
                  checked={rowData.data.isKnowChecked}
                  onCheckedChange={(checked) =>
                    checkKnowProcess(!!checked, rowData)
                  }
                  disabled={!rowData.data.haveLeader}
                />
              ) : isUser ? (
                <Checkbox
                  checked={rowData.data.isKnowChecked}
                  onCheckedChange={(checked) =>
                    checkKnowProcess(!!checked, rowData)
                  }
                  disabled={isTransfered || userId === rowData.data.id}
                />
              ) : null}
            </TableCell>
          )}
        </TableRow>
        {isExpanded &&
          rowData.children?.map((child) => renderTreeRow(child, level + 1))}
      </React.Fragment>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <CustomDialogContent onInteractOutside={(e) => e.preventDefault()}>
        <DialogHeader className="relative">
          <div className="flex items-center justify-between">
            <DialogTitle>
              Chuyển {isTransferOrganization ? "đơn vị" : "xử lý"}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-9 w-8 p-0"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>
        <div className="p-2 max-h-[calc(100vh-200px)] overflow-auto ">
          <div className={cn("mb-3")}>
            <div
              className={cn(
                "relative overflow-y-auto max-h-[420px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              )}
            >
              <table className="w-full caption-bottom text-sm border-collapse">
                <TableHeader className="sticky top-0 z-20 shadow-sm">
                  <TableRow>
                    <TableHead>Tên đơn vị, cá nhân</TableHead>
                    {LEADER_TRANSFER_CHECK_H05 && isShowLeaderColumn && (
                      <TableHead className="text-center w-[15%]">
                        Chỉ đạo
                      </TableHead>
                    )}
                    <TableHead className="text-center w-[15%]">
                      Xử lý chính
                    </TableHead>
                    <TableHead className="text-center w-[15%]">
                      Phối hợp xử lý
                    </TableHead>
                    <TableHead className="text-center w-[15%]">
                      Nhận để biết
                    </TableHead>
                  </TableRow>
                  {!allowMultiple && (
                    <TableRow>
                      {LEADER_TRANSFER_CHECK_H05 && isShowLeaderColumn && (
                        <TableHead className="!rounded-tl-none border-none border-r-none" />
                      )}
                      <TableHead className="!rounded-tl-none rounded-none border-none border-r-none" />
                      <TableHead className="rounded-none border-none" />
                      <TableHead className="rounded-none border-none">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={isCheckedAllSupport}
                            onCheckedChange={onChangeAllSub}
                          />
                          <span>Chọn tất cả</span>
                        </div>
                      </TableHead>
                      <TableHead className="align-middle !rounded-tr-none">
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={isCheckedAllKnow}
                            onCheckedChange={onChangeAllKnow}
                          />
                          <span>Chọn tất cả</span>
                        </div>
                      </TableHead>
                    </TableRow>
                  )}
                </TableHeader>
                <TableBody>
                  {treeData.map((item) => renderTreeRow(item, 0))}
                </TableBody>
              </table>
            </div>
          </div>
          {/* Rest of the component remains similar */}
          {dataLeaderChecked.length > 0 && (
            <div className="flex items-start gap-2 text-sm">
              <div className="w-1/6 font-bold text-blue-500 pr-2 whitespace-nowrap">
                Chỉ đạo :
              </div>
              <div className="w-5/6 leading-tight break-words">
                {leaderCheckedText}
              </div>
            </div>
          )}
          {dataMainChecked.length > 0 && (
            <div className="flex items-start gap-2 text-sm">
              <div className="w-1/6 font-bold text-red-500 pr-2 whitespace-nowrap">
                Xử lý chính :{" "}
              </div>
              <div className="w-5/6 leading-tight break-words">
                {mainCheckedText}
              </div>
            </div>
          )}
          {(dataSubChecked.length > 0 || dataMainChecked.length > 0) && (
            <div className="flex items-start gap-2 text-sm">
              <div className="w-1/6 font-bold text-blue-500 pr-2 whitespace-nowrap">
                Phối hợp :
              </div>
              <div className="w-5/6 leading-tight break-words">
                {subCheckedText}
              </div>
            </div>
          )}
          {(dataKnowChecked.length > 0 || dataMainChecked.length > 0) && (
            <div className="flex items-start gap-2 text-sm">
              <div className="w-1/6 font-bold text-green-500 pr-2 whitespace-nowrap">
                Nhận để biết :
              </div>
              <div className="w-5/6 leading-tight break-words">
                {knowCheckedText}
              </div>
            </div>
          )}
          <div className="mt-1">
            <Label className="font-bold">Nội dung xử lý</Label>
            <Textarea
              value={transferComment}
              onChange={(e) => {
                const val = e.target.value;
                if (val.length > 2000) {
                  setTransferComment(val.slice(0, 2000));
                  setTransferCommentError(
                    "Nội dung xử lý không được dài quá 2000 ký tự"
                  );
                } else {
                  setTransferComment(val);
                  setTransferCommentError(null);
                }
              }}
              className="min-h-[64px] text-sm p-2"
            />
            {transferCommentError && (
              <p className="text-sm text-red-500 mt-1">
                {transferCommentError}
              </p>
            )}
          </div>
          {UPDATE_TRANSFER_BCY && (
            <div className="">
              <div className="flex items-center gap-3">
                <Button
                  className="mb-2 bg-[rgb(71,152,232)] text-white hover:bg-[rgb(61,132,202)] mt-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Chọn tệp
                </Button>
                {!validFiles && (
                  <p className="text-sm text-red-500">
                    Kích thước tệp không hợp lệ
                  </p>
                )}
              </div>
              {/* Hidden file input to trigger system file picker */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleSelectFiles}
              />
              {selectedFiles.length > 0 && (
                <div className="mt-3 border rounded-lg divide-y">
                  {selectedFiles.map((file, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between gap-2 p-1.5"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        {ENCRYPTION_TWD && (
                          <label className="flex items-center gap-1.5 text-xs text-gray-700 font-bold">
                            <Checkbox
                              checked={(file as any).encrypt || false}
                              onCheckedChange={() => handleToggleEncrypt(i)}
                            />
                            <span>Mã hóa</span>
                          </label>
                        )}
                        <div className="min-w-0">
                          <div className="text-xs font-medium truncate max-w-[360px]">
                            {file.name}
                          </div>
                          {typeof (file as File).size === "number" && (
                            <div className="text-[11px] text-gray-500">
                              {Math.round(((file as File).size || 0) / 1024)} KB
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        className="h-9 w-8 p-0 text-red-600 hover:text-red-700"
                        onClick={() => handleRemoveFile(i)}
                        title="Xóa tệp"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {!UPDATE_TRANSFER_BCY && (
            <div className="mt-4">
              <Checkbox
                checked={isCreateTask}
                onCheckedChange={onClickCreateTask}
              />{" "}
              Tạo kèm hồ sơ công việc
            </div>
          )}
          {isCreateTask && isShowTaskInfo && (
            <div className="mt-4">
              <Label className="font-bold">Tên công việc</Label>
              <Input value={task.taskName} readOnly />
              <Label className="font-bold">Ngày hết hạn</Label>
              <CustomDatePicker
                selected={task.endDate}
                placeholder="dd/mm/yyyy"
                onChange={() => {}}
                readOnly
              />
            </div>
          )}
          {DEADLINE_CHECKBOX_TRANSFER_BCY && !allowMultiple && (
            <div className="mt-4">
              <Label className="font-bold">Thiết lập hạn xử lý</Label>

              <CustomDatePicker
                selected={deadlineDate}
                placeholder="dd/mm/yyyy"
                onChange={(e) => setDeadlineDate(e)}
              />
            </div>
          )}
          <div className="mt-4 flex justify-end">
            <Button
              disabled={
                dataMainChecked.length === 0 &&
                dataLeaderChecked.length === 0 &&
                dataSubChecked.length === 0 &&
                dataKnowChecked.length === 0
              }
              onClick={handleSubmit}
              className="text-white border-0 h-9 px-3 gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:text-white bg-blue-600 hover:bg-blue-700"
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = "#3a7bc8")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = "#4798e8")
              }
            >
              <Redo2 className="w-4 h-4" />
              Gửi xử lý
            </Button>
          </div>
        </div>
      </CustomDialogContent>

      {/* Task Modal */}
      <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
        <CustomDialogContent className="max-w-md">
          <DialogTitle>Giao công việc</DialogTitle>
          <div className="mt-4">
            <Label className="font-bold">Tên công việc</Label>
            <Input
              value={task.taskName}
              onChange={(e) => setTask({ ...task, taskName: e.target.value })}
            />
          </div>
          <div className="mt-4">
            <Label className="font-bold">Ngày đến hạn xử lý</Label>
            <CustomDatePicker
              selected={task.endDate}
              placeholder="dd/mm/yyyy"
              onChange={(e) => setTask({ ...task, endDate: e || null })}
            />
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={handleSaveTask}>Lưu</Button>
          </div>
        </CustomDialogContent>
      </Dialog>
    </Dialog>
  );
}
