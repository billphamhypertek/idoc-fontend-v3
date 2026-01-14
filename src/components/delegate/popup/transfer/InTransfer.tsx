"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  CustomDialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import {
  Upload,
  X,
  Send,
  Building2,
  User,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import {
  handleError,
  isExistFile,
  getSubCheckedText,
  checkIdIsExistInList,
} from "@/utils/common.utils";
import { getFileSizeString } from "@/utils/file.utils";
import { toast } from "@/hooks/use-toast";
import { Bpmn2Service } from "@/services/bpmn2.service";
import { OrganizationService } from "@/services/organization.service";
import { DelegateService } from "@/services/delegate.service";
import { TaskService } from "@/services/task.service";
import { Constant } from "@/definitions/constants/constant";
import { THREAD_TYPE } from "@/definitions/constants/common.constant";
import DelegatedList from "../delegatedList";
import { ToastUtils } from "@/utils/toast.utils";

interface TreeNode {
  data: any;
  expanded?: boolean;
  children?: TreeNode[];
  parent?: TreeNode;
}

interface SelectedItem {
  type: "User" | "Org";
  id: string;
  name: string;
  positionName?: string;
  leaderId?: string;
  delegatedId?: string;
  delegatedName?: string;
  delegatePosition?: string;
}

interface InTransferProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string | string[];
  allowMultiple?: boolean;
  special?: boolean;
  isMain?: boolean;
  onSuccess?: () => void;
}

export default function InTransfer({
  isOpen,
  onOpenChange,
  documentId,
  allowMultiple = false,
  special = false,
  isMain = false,
  onSuccess,
}: InTransferProps) {
  // State management
  const [userList, setUserList] = useState<any[]>([]);
  const [orgList, setOrgList] = useState<any[]>([]);
  const [showTree, setShowTree] = useState<TreeNode[]>([]);
  const [transferComment, setTransferComment] = useState<string>("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [validFiles, setValidFiles] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Selection states
  const [dataMainChecked, setDataMainChecked] = useState<SelectedItem[]>([]);
  const [dataSubChecked, setDataSubChecked] = useState<SelectedItem[]>([]);
  const [dataKnowChecked, setDataKnowChecked] = useState<SelectedItem[]>([]);
  const [mainCheckedText, setMainCheckedText] = useState<string>("");
  const [subCheckedText, setSubCheckedText] = useState<string>("");
  const [knowCheckedText, setKnowCheckedText] = useState<string>("");

  // Task creation states
  const [isCreateTask, setIsCreateTask] = useState<boolean>(false);
  const [isShowTaskInfo, setIsShowTaskInfo] = useState<boolean>(false);
  const [taskName, setTaskName] = useState<string>("");
  const [taskEndDate, setTaskEndDate] = useState<string>("");
  const [validTaskName, setValidTaskName] = useState<boolean>(true);

  // Deadline states
  const [deadlineDate, setDeadlineDate] = useState<string>("");

  // Delegated user selection states
  const [showDelegatedList, setShowDelegatedList] = useState<boolean>(false);
  const [currentRowData, setCurrentRowData] = useState<any>(null);
  const [currentPersonHandleType, setCurrentPersonHandleType] =
    useState<number>(0);

  const [isCheckedAllSupport, setIsCheckedAllSupport] = useState(false);
  const [isCheckedAllKnow, setIsCheckedAllKnow] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setTransferComment("");
      setSelectedFiles([]);
      setValidFiles(true);
      setIsSubmitting(false);
      setDataMainChecked([]);
      setDataSubChecked([]);
      setDataKnowChecked([]);
      setMainCheckedText("");
      setSubCheckedText("");
      setKnowCheckedText("");
      setIsCreateTask(false);
      setIsShowTaskInfo(false);
      setTaskName("");
      setTaskEndDate("");
      setValidTaskName(true);
      setDeadlineDate("");
      setShowDelegatedList(false);
      setCurrentRowData(null);
      setCurrentPersonHandleType(0);

      // Load initial data
      loadInitialData();
    }
  }, [isOpen]);

  const loadInitialData = async () => {
    try {
      // Load users by node
      const users = await Bpmn2Service.getUsersByNode(
        Bpmn2Service.currentSelectedNodeID
      );
      setUserList(users.sort((a, b) => a.positionOrder - b.positionOrder));

      // Load organizations
      const orgs = await OrganizationService.getOrganizations({ active: true });
      setOrgList(orgs);

      // Build tree
      buildTree(orgs, users);
    } catch (error) {
      handleError(error);
    }
  };

  const buildTree = (orgs: any[], users: any[]) => {
    const processTreeData: TreeNode[] = [];
    const orgChildren: any[] = [];

    // Build main tree structure
    for (let i = 0; i < orgs.length; i++) {
      if (orgs[i].parentId == null) {
        processTreeData.push({
          data: orgs[i],
          expanded: true,
          children: [],
        });
      } else {
        orgChildren.push(orgs[i]);
      }
    }

    // Add children to parents
    checkParent(processTreeData, orgChildren);

    // Create filtered tree for current node
    const filteredTree = createFilteredTree(processTreeData, users);
    setShowTree(filteredTree);
  };

  const checkParent = (listParent: TreeNode[], listChildren: any[]) => {
    listParent.forEach((parent) => {
      if (parent && parent.data) {
        const children = listChildren.filter(
          (child) => child.parentId === parent.data.id
        );
        if (children.length > 0) {
          parent.children = children.map((child) => ({
            data: child,
            expanded: true,
            children: [],
          }));
          checkParent(
            parent.children!,
            listChildren.filter((child) => child.parentId !== parent.data.id)
          );
        }
      }
    });
  };

  const createFilteredTree = (
    mainTree: TreeNode[],
    users: any[]
  ): TreeNode[] => {
    const filteredTree: TreeNode[] = [];
    const arrAddOrg: any[] = [];

    // Get organizations from users
    users.forEach((user) => {
      if (arrAddOrg.length > 0) {
        let isExist = false;
        for (const element of arrAddOrg) {
          if (element.org === user.org) {
            isExist = true;
          }
        }
        if (!isExist) {
          arrAddOrg.push({ org: user.org, pos: null });
        }
      } else {
        arrAddOrg.push({ org: user.org, pos: null });
      }
    });

    // Create tree for each organization
    arrAddOrg.forEach((orgNode) => {
      const treeNode = getTreeByOrgID(orgNode.org, mainTree);
      if (treeNode && !findOrgInChildren(orgNode.org, filteredTree)) {
        filteredTree.push(treeNode);
      }
    });

    // Add users to organizations
    users.reverse().forEach((user) => {
      checkUserInOrgTree(user, filteredTree);
    });

    // Clean up tree
    prettyOrgTree(filteredTree);

    if (allowMultiple) {
      removeUserFinalTree(filteredTree);
    }

    checkLeadExistInOrg(filteredTree);

    return filteredTree;
  };

  const getTreeByOrgID = (orgId: string, tree: TreeNode[]): TreeNode | null => {
    for (let i = 0; i < tree.length; i++) {
      const parentTree = tree[i];
      if (parentTree) {
        const found = searchTreeByID(orgId, parentTree);
        if (found) {
          return parentTree;
        }
      }
    }
    return null;
  };

  const searchTreeByID = (
    id: string,
    parentTree: TreeNode
  ): TreeNode | null => {
    if (id === parentTree.data.id) {
      return parentTree;
    }
    if (parentTree.children) {
      const found = findOrgInChildren(id, parentTree.children);
      if (found) {
        return parentTree;
      }
    }
    return null;
  };

  const findOrgInChildren = (id: string, childrenTree: TreeNode[]): boolean => {
    for (const element of childrenTree) {
      if (id === element.data.id && !element.data.hasOwnProperty("userName")) {
        return true;
      }
      if (element.children) {
        if (findOrgInChildren(id, element.children)) {
          return true;
        }
      }
    }
    return false;
  };

  const checkUserInOrgTree = (
    user: any,
    orgTree: TreeNode[],
    parent?: TreeNode
  ) => {
    for (const element of orgTree) {
      if (element) {
        element.parent = parent;
        if (
          user.org === element.data.id &&
          !element.data.hasOwnProperty("userName")
        ) {
          if (element.children) {
            if (!checkUserIsExistInTree(user.id, element.children)) {
              const userNode: TreeNode = {
                data: user,
                expanded: false,
                children: [],
                parent: element,
              };
              element.children.unshift(userNode);
            }
          } else {
            const userNode: TreeNode = {
              data: user,
              expanded: false,
              children: [],
              parent: element,
            };
            element.children = [userNode];
          }
        } else if (element.children && element.children.length > 0) {
          checkUserInOrgTree(user, element.children, element);
        }
      }
    }
  };

  const checkUserIsExistInTree = (
    userID: string,
    tree: TreeNode[]
  ): boolean => {
    for (const element of tree) {
      if (
        element.data.hasOwnProperty("userName") &&
        element.data.id === userID
      ) {
        return true;
      }
    }
    return false;
  };

  const prettyOrgTree = (tree: TreeNode[]) => {
    for (let i = 0; i < tree.length; i++) {
      const node = tree[i];
      if (node && node.data) {
        if (
          (!node.children || node.children.length <= 0) &&
          !node.data.hasOwnProperty("userName")
        ) {
          tree.splice(i, 1);
          i--;
          //prettyOrgTree(tree);
        } else if (node.children) {
          prettyOrgTree(node.children);
        }
      } else {
        tree.splice(i, 1);
      }
    }
  };

  const removeUserFinalTree = (tree: TreeNode[]) => {
    for (let i = 0; i < tree.length; i++) {
      if (tree[i]) {
        if (tree[i].data.hasOwnProperty("userName")) {
          tree.splice(i, 1);
          i--;
          //removeUserFinalTree(tree);
        } else {
          if (
            !tree[i].data.isCanCheck &&
            tree[i].children?.find((x) => x.data.hasOwnProperty("userName"))
          ) {
            tree[i].data.isCanCheck = true;
          }
          if (tree[i].children) {
            removeUserFinalTree(tree[i].children!);
          }
        }
      } else {
        tree.splice(i, 1);
      }
    }
  };

  const checkLeadExistInOrg = (tree: TreeNode[]) => {
    tree.forEach((x) => {
      if (!x.data.hasOwnProperty("userName")) {
        if (x.children && x.children.length > 0) {
          const child = x.children.find(
            (y) => y.data.hasOwnProperty("userName") && y.data.lead === true
          );
          x.data.haveLeader = !!child;
          if (x.data.haveLeader === true) {
            x.data.leaderId = child!.data.id;
            x.data.leaderFullname = child!.data.fullName;
            x.data.leaderPositionName = child!.data.positionName;
          }
          checkLeadExistInOrg(x.children!);
        }
      }
    });
  };

  // Selection handlers
  const handleMainProcess = (isChecked: boolean, rowData: any) => {
    if (
      rowData.delegateUsers &&
      rowData.delegateUsers.length > 0 &&
      isChecked
    ) {
      setCurrentRowData(rowData);
      setCurrentPersonHandleType(Constant.PERSON_HANDLE_TYPE.MAIN);
      setShowDelegatedList(true);
    } else {
      chooseMain(isChecked, rowData);
    }
  };

  const chooseMain = (isChecked: boolean, rowData: any) => {
    const obj: SelectedItem = rowData.hasOwnProperty("userName")
      ? {
          type: "User",
          id: rowData.id,
          name: rowData.fullName,
          positionName: rowData.positionName,
        }
      : {
          type: "Org",
          id: rowData.id,
          name: rowData.name,
          leaderId: rowData.leaderId,
        };

    if (isChecked) {
      if (dataMainChecked.length > 0 && !allowMultiple) {
        mainOnlyRemove(dataMainChecked[0]);
      }

      const newMainChecked = [...dataMainChecked, obj];
      setDataMainChecked(newMainChecked);

      if (obj.type === "Org") {
        const orgText = `Đơn vị ${obj.name}`;
        if (!allowMultiple) {
          setMainCheckedText(orgText);
        } else {
          setMainCheckedText(
            mainCheckedText !== "" ? `${mainCheckedText}, ${orgText}` : orgText
          );
        }
      } else {
        setMainCheckedText(`${obj.positionName} ${obj.name}`);
      }

      secondRemove(obj);
      toKnowRemove(obj);
    } else {
      for (let i = 0; i < dataMainChecked.length; i++) {
        if (
          dataMainChecked[i].type == obj.type &&
          dataMainChecked[i].id == obj.id
        ) {
          const newMainChecked = [...dataMainChecked];
          newMainChecked.splice(i, 1);
          setDataMainChecked(newMainChecked);
          break;
        }
      }
      setMainCheckedText("");
      if (allowMultiple) {
        setMainCheckedText(
          dataMainChecked.map((x) => `Đơn vị ${x.name}`).join(", ")
        );
      }
    }
  };

  const handleSubProcess = (isChecked: boolean, rowData: any) => {
    if (
      rowData.delegateUsers &&
      rowData.delegateUsers.length > 0 &&
      isChecked
    ) {
      setCurrentRowData(rowData);
      setCurrentPersonHandleType(Constant.PERSON_HANDLE_TYPE.COMBINE);
      setShowDelegatedList(true);
    } else {
      chooseSub(isChecked, rowData);
    }
  };

  const chooseSub = (isChecked: boolean, rowData: any) => {
    const obj: SelectedItem = rowData.hasOwnProperty("userName")
      ? {
          type: "User",
          id: rowData.id,
          name: rowData.fullName,
          positionName: rowData.positionName,
        }
      : {
          type: "Org",
          id: rowData.id,
          name: rowData.name,
          leaderId: rowData.leaderId,
        };

    if (isChecked) {
      const newSubChecked = [...dataSubChecked, obj];
      setDataSubChecked(newSubChecked);
      setSubCheckedText(
        newSubChecked
          .map((x) =>
            x.type === "Org" ? `Đơn vị ${x.name}` : getSubCheckedText(x)
          )
          .join(", ")
      );

      mainRemove(obj);
      toKnowRemove(obj);
    } else {
      for (let i = 0; i < dataSubChecked.length; i++) {
        if (
          dataSubChecked[i].type == obj.type &&
          dataSubChecked[i].id == obj.id
        ) {
          const newSubChecked = [...dataSubChecked];
          newSubChecked.splice(i, 1);
          setDataSubChecked(newSubChecked);
          setSubCheckedText(
            newSubChecked
              .map((x) =>
                x.type === "Org" ? `Đơn vị ${x.name}` : getSubCheckedText(x)
              )
              .join(", ")
          );
          break;
        }
      }
    }
  };

  const handleKnowProcess = (isChecked: boolean, rowData: any) => {
    const obj: SelectedItem = rowData.hasOwnProperty("userName")
      ? {
          type: "User",
          id: rowData.id,
          name: rowData.fullName,
          positionName: rowData.positionName,
        }
      : {
          type: "Org",
          id: rowData.id,
          name: rowData.name,
          leaderId: rowData.leaderId,
        };

    if (isChecked) {
      const newKnowChecked = [...dataKnowChecked, obj];
      setDataKnowChecked(newKnowChecked);
      setKnowCheckedText(
        newKnowChecked
          .map((x) =>
            x.type === "Org"
              ? `Đơn vị ${x.name}`
              : `${x.positionName} ${x.name}`
          )
          .join(", ")
      );

      mainRemove(obj);
      secondRemove(obj);
    } else {
      for (let i = 0; i < dataKnowChecked.length; i++) {
        if (
          dataKnowChecked[i].type == obj.type &&
          dataKnowChecked[i].id == obj.id
        ) {
          const newKnowChecked = [...dataKnowChecked];
          newKnowChecked.splice(i, 1);
          setDataKnowChecked(newKnowChecked);
          setKnowCheckedText(
            newKnowChecked
              .map((x) =>
                x.type === "Org"
                  ? `Đơn vị ${x.name}`
                  : `${x.positionName} ${x.name}`
              )
              .join(", ")
          );
          break;
        }
      }
    }
  };

  const removeFromOtherSelections = (
    obj: SelectedItem,
    currentType: string
  ) => {
    if (currentType !== "main") {
      setDataMainChecked((prev) =>
        prev.filter((item) => !(item.type === obj.type && item.id === obj.id))
      );
    }
    if (currentType !== "sub") {
      setDataSubChecked((prev) =>
        prev.filter((item) => !(item.type === obj.type && item.id === obj.id))
      );
    }
    if (currentType !== "know") {
      setDataKnowChecked((prev) =>
        prev.filter((item) => !(item.type === obj.type && item.id === obj.id))
      );
    }
  };

  const removeObjInTree = (
    obj: SelectedItem,
    tree: TreeNode[],
    type: number
  ) => {
    for (const element of tree) {
      const isUser = element.data.hasOwnProperty("userName");
      if (
        (obj.type == "User" && isUser && obj.id == element.data.id) ||
        (obj.type == "User" && !isUser && obj.id == element.data.leaderId) ||
        (obj.type == "Org" && isUser && obj.leaderId == element.data.id) ||
        (obj.type == "Org" && !isUser && obj.leaderId == element.data.leaderId)
      ) {
        if (type == 0) {
          element.data.isMainChecked = false;
        } else if (type == 1) {
          element.data.isSubChecked = false;
        } else if (type == 2) {
          element.data.isKnowChecked = false;
        }
        if (element.children) {
          removeObjInTree(obj, element.children, type);
        }
      } else if (element.children) {
        removeObjInTree(obj, element.children, type);
      }
    }
  };

  const removeMainObjInTree = (
    obj: SelectedItem,
    tree: TreeNode[],
    type: number
  ) => {
    for (const element of tree) {
      const isUser = element.data.hasOwnProperty("userName");
      if (
        (obj.type == "User" && isUser && obj.id == element.data.id) ||
        (obj.type == "Org" && !isUser && obj.leaderId == element.data.leaderId)
      ) {
        if (type == 0) {
          element.data.isMainChecked = false;
        } else if (type == 1) {
          element.data.isSubChecked = false;
        } else if (type == 2) {
          element.data.isKnowChecked = false;
        }
        if (element.children) {
          removeMainObjInTree(obj, element.children, type);
        }
      } else if (element.children) {
        removeMainObjInTree(obj, element.children, type);
      }
    }
  };

  const mainRemove = (obj: SelectedItem) => {
    removeObjInTree(obj, showTree, 0);
    const newMainChecked = dataMainChecked.filter(
      (item) =>
        !(
          (item.type == obj.type && item.id == obj.id) ||
          (item.type != obj.type &&
            obj.type == "User" &&
            obj.id == item.leaderId) ||
          (item.type != obj.type &&
            obj.type == "Org" &&
            obj.leaderId == item.id)
        )
    );
    setDataMainChecked(newMainChecked);

    if (!allowMultiple) {
      setMainCheckedText("");
    } else {
      setMainCheckedText(
        newMainChecked.map((x) => `Đơn vị ${x.name}`).join(", ")
      );
    }
    setShowTree([...showTree]); // Force re-render
  };

  const mainOnlyRemove = (obj: SelectedItem) => {
    removeMainObjInTree(obj, showTree, 0);
    const newMainChecked = dataMainChecked.filter(
      (item) =>
        !(
          (item.type == obj.type && item.id == obj.id) ||
          (item.type != obj.type &&
            obj.type == "User" &&
            obj.id == item.leaderId) ||
          (item.type != obj.type &&
            obj.type == "Org" &&
            obj.leaderId == item.id)
        )
    );
    setDataMainChecked(newMainChecked);

    if (!allowMultiple) {
      setMainCheckedText("");
    } else {
      setMainCheckedText(
        newMainChecked.map((x) => `Đơn vị ${x.name}`).join(", ")
      );
    }
    setShowTree([...showTree]); // Force re-render
  };

  const secondRemove = (obj: SelectedItem) => {
    removeObjInTree(obj, showTree, 1);
    const newSubChecked = dataSubChecked.filter(
      (item) =>
        !(
          (item.type == obj.type && item.id == obj.id) ||
          (item.type != obj.type &&
            obj.type == "User" &&
            obj.id == item.leaderId) ||
          (item.type != obj.type &&
            obj.type == "Org" &&
            obj.leaderId == item.id)
        )
    );
    setDataSubChecked(newSubChecked);
    setSubCheckedText(
      newSubChecked
        .map((x) =>
          x.type === "Org" ? `Đơn vị ${x.name}` : getSubCheckedText(x)
        )
        .join(", ")
    );
    setShowTree([...showTree]); // Force re-render
  };

  const toKnowRemove = (obj: SelectedItem) => {
    removeObjInTree(obj, showTree, 2);
    const newKnowChecked = dataKnowChecked.filter(
      (item) =>
        !(
          (item.type == obj.type && item.id == obj.id) ||
          (item.type != obj.type &&
            obj.type == "User" &&
            obj.id == item.leaderId) ||
          (item.type != obj.type &&
            obj.type == "Org" &&
            obj.leaderId == item.id)
        )
    );
    setDataKnowChecked(newKnowChecked);
    setKnowCheckedText(
      newKnowChecked
        .map((x) =>
          x.type === "Org" ? `Đơn vị ${x.name}` : `${x.positionName} ${x.name}`
        )
        .join(", ")
    );
    setShowTree([...showTree]); // Force re-render
  };

  const validateSelection = (isChecked: boolean, rowData: any) => {
    if (!rowData.hasOwnProperty("userName") && !rowData.haveLeader) {
      ToastUtils.error(`Đơn vị ${rowData.name} chưa chọn lãnh đạo`);
    }
  };

  // Delegated user selection handlers
  const handleDelegatedUserSelect = (result: {
    delegatedUser: any;
    personHandleType: number;
  }) => {
    const { delegatedUser, personHandleType } = result;

    if (delegatedUser) {
      if (personHandleType === Constant.PERSON_HANDLE_TYPE.MAIN) {
        chooseDelegatedMain(true, currentRowData, delegatedUser);
      } else if (personHandleType === Constant.PERSON_HANDLE_TYPE.COMBINE) {
        chooseDelegatedSub(true, currentRowData, delegatedUser);
      }
    }

    setShowDelegatedList(false);
    setCurrentRowData(null);
    setCurrentPersonHandleType(0);
  };

  const chooseDelegatedMain = (
    isChecked: boolean,
    rowData: any,
    delegatedUser: any
  ) => {
    const obj: SelectedItem = {
      type: "User",
      id: rowData.id,
      delegatedId: delegatedUser.id,
      delegatedName: delegatedUser.fullName,
      name: rowData.fullName,
      positionName: rowData.positionName,
    };

    if (dataMainChecked.length > 0) {
      mainOnlyRemove(dataMainChecked[0]);
    }

    setMainCheckedText(
      `${delegatedUser.positionName} ${delegatedUser.fullName}(ủy quyền bởi ${obj.positionName} ${obj.name})`
    );
    setDataMainChecked([obj]);

    secondRemove(obj);
    toKnowRemove(obj);
  };

  const chooseDelegatedSub = (
    isChecked: boolean,
    rowData: any,
    delegatedUser: any
  ) => {
    const obj: SelectedItem = {
      type: "User",
      id: rowData.id,
      delegatedId: delegatedUser.id,
      delegatedName: delegatedUser.fullName,
      delegatePosition: delegatedUser.positionName,
      name: rowData.fullName,
      positionName: rowData.positionName,
    };

    const newSubChecked = [...dataSubChecked, obj];
    setDataSubChecked(newSubChecked);
    setSubCheckedText(
      newSubChecked.map((x) => getSubCheckedText(x)).join(", ")
    );

    mainRemove(obj);
    toKnowRemove(obj);
  };

  // File handling
  const handleSelectFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const maxSize = 300 * 1024 * 1024; // 300MB
    const oversizedFiles = Array.from(files).filter(
      (file) => file.size > maxSize
    );

    if (oversizedFiles.length > 0) {
      setValidFiles(false);
      ToastUtils.error("Dung lượng file phải nhỏ hơn 300MB");
      event.target.value = "";
      return;
    }

    setValidFiles(true);

    const newFiles: File[] = [];
    for (const file of Array.from(files)) {
      if (!isExistFile(file.name, selectedFiles)) {
        newFiles.push(file);
      }
    }
    setSelectedFiles((prev) => [...prev, ...newFiles]);
    event.target.value = "";
  };

  const handleRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleTransferDocument = async () => {
    if (dataMainChecked.length === 0) {
      ToastUtils.error("Vui lòng chọn ít nhất một người xử lý chính");
      return;
    }

    if (lengthTransferComment() > 2000) {
      ToastUtils.error("Nội dung xử lý không được dài quá 2000 ký tự");
      return;
    }

    setIsSubmitting(true);

    try {
      const orgMain: string[] = [];
      const main: string[] = [];
      if (!allowMultiple) {
        dataMainChecked.forEach((x) => {
          if (x.type == "User") {
            if (
              !checkIdIsExistInList(
                parseInt(x.id),
                main.map((m) => parseInt(m))
              )
            ) {
              const id = x.delegatedId ? `${x.id}-${x.delegatedId}` : x.id;
              main.push(id.toString());
            }
          } else if (x.type == "Org" && x.leaderId) {
            if (
              !checkIdIsExistInList(
                parseInt(x.id),
                orgMain.map((m) => parseInt(m))
              )
            ) {
              orgMain.push(x.id.toString());
            }
          } else if (x.type == "Org" && !x.leaderId) {
            ToastUtils.error(`Đơn vị ${x.name} chưa có trưởng phòng`);
            setIsSubmitting(false);
            return;
          }
        });
      } else {
        dataMainChecked.forEach((x) => {
          if (
            !checkIdIsExistInList(
              parseInt(x.id),
              main.map((m) => parseInt(m))
            )
          ) {
            main.push(x.id.toString());
          }
        });
      }

      // Process support handlers
      const orgSupport: string[] = [];
      const support: string[] = [];
      dataSubChecked.forEach((x) => {
        if (x.type == "User") {
          if (
            !checkIdIsExistInList(
              parseInt(x.id),
              support.map((s) => parseInt(s))
            )
          ) {
            const id = x.delegatedId ? `${x.id}-${x.delegatedId}` : x.id;
            support.push(id.toString());
          }
        } else if (x.type == "Org" && x.leaderId) {
          if (
            !checkIdIsExistInList(
              parseInt(x.id),
              orgSupport.map((s) => parseInt(s))
            )
          ) {
            orgSupport.push(x.id.toString());
          }
        } else if (x.type == "Org" && !x.leaderId) {
          ToastUtils.error(`Đơn vị ${x.name} chưa có trưởng phòng`);
          setIsSubmitting(false);
          return;
        }
      });

      // Process know handlers
      const orgShow: string[] = [];
      const show: string[] = [];
      dataKnowChecked.forEach((x) => {
        if (x.type == "User") {
          if (
            !checkIdIsExistInList(
              parseInt(x.id),
              show.map((s) => parseInt(s))
            )
          ) {
            show.push(x.id.toString());
          }
        } else if (x.type == "Org" && x.leaderId) {
          if (
            !checkIdIsExistInList(
              parseInt(x.id),
              orgShow.map((s) => parseInt(s))
            )
          ) {
            orgShow.push(x.id.toString());
          }
        } else if (x.type == "Org" && !x.leaderId) {
          ToastUtils.error(`Đơn vị ${x.name} chưa có trưởng phòng`);
          setIsSubmitting(false);
          return;
        }
      });

      let comment = `\n- Xử lý chính : ${mainCheckedText}\n`;
      if (support.length > 0) {
        comment = `${comment}- Phối hợp : ${subCheckedText}\n`;
      }
      if (show.length > 0) {
        comment = `${comment}- Nhận để biết : ${knowCheckedText}\n`;
      }
      if (transferComment != null && transferComment != "") {
        comment += transferComment;
      }

      // Format deadline date if needed
      const formattedDeadline = deadlineDate ? deadlineDate : "";

      if (!allowMultiple) {
        let transferResult: any = null;
        if (isMain && Array.isArray(documentId)) {
          // Multiple documents
          const transferResults: any[] = [];
          for (const docId of documentId) {
            const result = await DelegateService.docInTransfer(
              docId,
              comment,
              main,
              support,
              show,
              orgMain,
              orgSupport,
              orgShow,
              Bpmn2Service.currentSelectedNodeID,
              selectedFiles,
              formattedDeadline
            );
            transferResults.push(result);
          }
          transferResult = { data: transferResults };
        } else {
          // Single document
          transferResult = await DelegateService.docInTransfer(
            documentId as string,
            comment,
            main,
            support,
            show,
            orgMain,
            orgSupport,
            orgShow,
            Bpmn2Service.currentSelectedNodeID,
            selectedFiles,
            formattedDeadline
          );
        }

        if (isCreateTask && transferResult?.data) {
          await doAddTask(
            Array.isArray(transferResult.data)
              ? transferResult.data
              : [transferResult.data]
          );
        }
      } else {
        // Organization transfer
        const docList = Array.isArray(documentId)
          ? documentId.join(",")
          : (documentId as string);
        const result = await DelegateService.docInTransferOrg(
          docList,
          comment,
          main,
          Bpmn2Service.currentSelectedNodeID,
          selectedFiles,
          formattedDeadline,
          true, // isDelegate
          special
        );

        // Create task if needed
        if (isCreateTask && result?.data) {
          await doAddTask(result.data);
        }
      }

      ToastUtils.transferSuccess();

      if (!isCreateTask) {
        setIsSubmitting(false);
      }

      onOpenChange(false);
      onSuccess?.();
    } catch (error) {
      handleError(error);
      setIsSubmitting(false);
    }
  };

  const lengthTransferComment = (): number => {
    const main: string[] = [];
    dataMainChecked.forEach((x) => {
      if (x.type == "User") {
        if (
          !checkIdIsExistInList(
            parseInt(x.id),
            main.map((m) => parseInt(m))
          )
        ) {
          const id = x.delegatedId ? `${x.id}-${x.delegatedId}` : x.id;
          main.push(id.toString());
        }
      } else if (x.type == "Org" && x.leaderId) {
        if (
          !checkIdIsExistInList(
            parseInt(x.leaderId),
            main.map((m) => parseInt(m))
          )
        ) {
          main.push(x.leaderId.toString());
        }
      }
    });

    const support: string[] = [];
    dataSubChecked.forEach((x) => {
      if (x.type == "User") {
        if (
          !checkIdIsExistInList(
            parseInt(x.id),
            support.map((s) => parseInt(s))
          )
        ) {
          const id = x.delegatedId ? `${x.id}-${x.delegatedId}` : x.id;
          support.push(id.toString());
        }
      } else if (x.type == "Org" && x.leaderId) {
        if (
          !checkIdIsExistInList(
            parseInt(x.leaderId),
            support.map((s) => parseInt(s))
          )
        ) {
          support.push(x.leaderId.toString());
        }
      }
    });

    const show: string[] = [];
    dataKnowChecked.forEach((x) => {
      if (x.type == "User") {
        if (
          !checkIdIsExistInList(
            parseInt(x.id),
            show.map((s) => parseInt(s))
          )
        ) {
          show.push(x.id.toString());
        }
      } else if (x.type == "Org" && x.leaderId) {
        if (
          !checkIdIsExistInList(
            parseInt(x.leaderId),
            show.map((s) => parseInt(s))
          )
        ) {
          show.push(x.leaderId.toString());
        }
      }
    });

    let comment = `\n- Xử lý chính : ${mainCheckedText}\n`;
    if (support.length > 0) {
      comment = `${comment}- Phối hợp : ${subCheckedText}\n`;
    }
    if (show.length > 0) {
      comment = `${comment}- Nhận để biết : ${knowCheckedText}\n`;
    }
    if (transferComment != null && transferComment != "") {
      comment += transferComment;
    }
    return comment.length;
  };

  const onChangeAllSub = () => {
    const wasChecked = isCheckedAllSupport;
    setIsCheckedAllSupport(!wasChecked);

    if (wasChecked) {
      unCheckedAllSub(showTree);
    } else {
      setDataSubChecked([]);
      checkedAllSub(showTree);
    }
  };

  const checkedAllSub = (tree: TreeNode[]) => {
    tree.forEach((x) => {
      if (
        x.data.hasOwnProperty("userName") ||
        (!x.data.hasOwnProperty("userName") && x.data.haveLeader)
      ) {
        if (!x.data.hasOwnProperty("userName") && x.data.haveLeader) {
          const tmp = x.children?.find(
            (y) =>
              y.data.hasOwnProperty("userName") &&
              (y.data.isMainChecked || y.data.isKnowChecked)
          );
          if (!tmp) {
            if (!x.data.isMainChecked && !x.data.isKnowChecked) {
              x.data.isSubChecked = true;
              chooseSub(true, x.data);
            }
          }
        } else if (x.data.hasOwnProperty("userName")) {
          if (x.data.lead === true) {
            if (x.parent && !x.parent.data.isMainChecked) {
              if (!x.data.isMainChecked && !x.data.isKnowChecked) {
                x.data.isSubChecked = true;
                chooseSub(true, x.data);
              }
            }
          } else if (!x.data.isMainChecked && !x.data.isKnowChecked) {
            x.data.isSubChecked = true;
            chooseSub(true, x.data);
          }
        }
      }
      if (x.children && x.children.length > 0) {
        checkedAllSub(x.children);
      }
    });
    setShowTree([...showTree]); // Force re-render
  };

  const unCheckedAllSub = (tree: TreeNode[]) => {
    setDataSubChecked([]);
    setSubCheckedText("");
    tree.forEach((x) => {
      if (x.data.isSubChecked) {
        x.data.isSubChecked = false;
      }
      if (x.children && x.children.length > 0) {
        unCheckedAllSub(x.children);
      }
    });
    setShowTree([...showTree]); // Force re-render
  };

  const onChangeAllKnow = () => {
    const wasChecked = isCheckedAllKnow;
    setIsCheckedAllKnow(!wasChecked);

    if (wasChecked) {
      unCheckedAllKnow(showTree);
    } else {
      setDataKnowChecked([]);
      checkedAllKnow(showTree);
    }
  };

  const checkedAllKnow = (tree: TreeNode[]) => {
    tree.forEach((x) => {
      if (
        x.data.hasOwnProperty("userName") ||
        (!x.data.hasOwnProperty("userName") && x.data.haveLeader)
      ) {
        if (!x.data.hasOwnProperty("userName") && x.data.haveLeader) {
          const tmp = x.children?.find(
            (y) =>
              y.data.hasOwnProperty("userName") &&
              (y.data.isMainChecked || y.data.isSubChecked)
          );
          if (!tmp) {
            if (!x.data.isMainChecked && !x.data.isSubChecked) {
              x.data.isKnowChecked = true;
              handleKnowProcess(true, x.data);
            }
          }
        } else if (x.data.hasOwnProperty("userName")) {
          if (x.data.lead === true) {
            if (x.parent && !x.parent.data.isMainChecked) {
              if (!x.data.isMainChecked && !x.data.isSubChecked) {
                x.data.isKnowChecked = true;
                handleKnowProcess(true, x.data);
              }
            }
          } else if (!x.data.isMainChecked && !x.data.isSubChecked) {
            x.data.isKnowChecked = true;
            handleKnowProcess(true, x.data);
          }
        }
      }
      if (x.children && x.children.length > 0) {
        checkedAllKnow(x.children);
      }
    });
    setShowTree([...showTree]); // Force re-render
  };

  const unCheckedAllKnow = (tree: TreeNode[]) => {
    setDataKnowChecked([]);
    setKnowCheckedText("");
    tree.forEach((x) => {
      if (x.data.isKnowChecked) {
        x.data.isKnowChecked = false;
      }
      if (x.children && x.children.length > 0) {
        unCheckedAllKnow(x.children);
      }
    });
    setShowTree([...showTree]); // Force re-render
  };

  // Tree rendering
  const renderTreeNode = (node: TreeNode, depth = 0) => {
    const isUser = node.data.hasOwnProperty("userName");
    const hasChildren = node.children && node.children.length > 0;

    return (
      <div key={node.data.id} className="flex items-center py-1">
        <div className="flex items-center flex-1">
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="p-0 h-4 w-4 mr-1"
              onClick={() => {
                // Toggle expansion
                const updateTree = (nodes: TreeNode[]): TreeNode[] => {
                  return nodes.map((n) => {
                    if (n.data.id === node.data.id) {
                      return { ...n, expanded: !n.expanded };
                    }
                    if (n.children) {
                      return { ...n, children: updateTree(n.children!) };
                    }
                    return n;
                  });
                };
                setShowTree(updateTree(showTree));
              }}
            >
              {node.expanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </Button>
          )}

          {isUser ? (
            <User className="w-4 h-4 mr-2 text-blue-500" />
          ) : (
            <Building2 className="w-4 h-4 mr-2 text-red-500" />
          )}

          <span className="text-sm">
            {isUser ? node.data.fullName : node.data.name}
          </span>
        </div>

        <div className="flex gap-4">
          {/* Main Process Checkbox */}
          <div className="flex items-center relative">
            {!isUser && !allowMultiple ? (
              <div className="relative">
                <Checkbox
                  checked={node.data.isMainChecked || false}
                  disabled={!node.data.haveLeader}
                  onCheckedChange={(checked) =>
                    handleMainProcess(checked as boolean, node.data)
                  }
                />
                {!node.data.haveLeader && (
                  <div
                    className="absolute inset-0 cursor-pointer"
                    onClick={() =>
                      validateSelection(node.data.isMainChecked, node.data)
                    }
                  />
                )}
              </div>
            ) : (
              <Checkbox
                checked={node.data.isMainChecked || false}
                disabled={
                  !isUser && allowMultiple ? !node.data.isCanCheck : false
                }
                onCheckedChange={(checked) =>
                  handleMainProcess(checked as boolean, node.data)
                }
              />
            )}
          </div>

          {/* Sub Process Checkbox */}
          {!allowMultiple && (
            <div className="flex items-center relative">
              {!isUser && (
                <div className="relative">
                  <Checkbox
                    checked={node.data.isSubChecked || false}
                    disabled={!node.data.haveLeader}
                    onCheckedChange={(checked) =>
                      handleSubProcess(checked as boolean, node.data)
                    }
                  />
                  {!node.data.haveLeader && (
                    <div
                      className="absolute inset-0 cursor-pointer"
                      onClick={() =>
                        validateSelection(node.data.isSubChecked, node.data)
                      }
                    />
                  )}
                </div>
              )}
              {isUser && (
                <Checkbox
                  checked={node.data.isSubChecked || false}
                  onCheckedChange={(checked) =>
                    handleSubProcess(checked as boolean, node.data)
                  }
                />
              )}
            </div>
          )}

          {/* Know Process Checkbox */}
          {!allowMultiple && (
            <div className="flex items-center relative">
              {!isUser && (
                <div className="relative">
                  <Checkbox
                    checked={node.data.isKnowChecked || false}
                    disabled={!node.data.haveLeader}
                    onCheckedChange={(checked) =>
                      handleKnowProcess(checked as boolean, node.data)
                    }
                  />
                  {!node.data.haveLeader && (
                    <div
                      className="absolute inset-0 cursor-pointer"
                      onClick={() =>
                        validateSelection(node.data.isKnowChecked, node.data)
                      }
                    />
                  )}
                </div>
              )}
              {isUser && (
                <Checkbox
                  checked={node.data.isKnowChecked || false}
                  onCheckedChange={(checked) =>
                    handleKnowProcess(checked as boolean, node.data)
                  }
                />
              )}
            </div>
          )}
        </div>

        {/* Render children if expanded */}
        {node.expanded && hasChildren && (
          <div className="ml-6 mt-2 space-y-1">
            {node.children!.map((child) => renderTreeNode(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  const doSaveTask = () => {
    if (taskName.trim().length <= 0) {
      setValidTaskName(false);
      return;
    }
    setValidTaskName(true);
    setIsShowTaskInfo(true);
  };

  const changeTaskName = () => {
    if (taskName.trim().length <= 0) {
      setValidTaskName(false);
    } else {
      setValidTaskName(true);
    }
  };

  const doAddTask = async (documentTransferList: any[]) => {
    try {
      const task = {
        taskName: taskName,
        startDate: new Date(),
        endDate: taskEndDate ? new Date(taskEndDate) : new Date(),
        userExcutePrimaryId:
          dataMainChecked[0].type == "User"
            ? dataMainChecked[0].id
            : dataMainChecked[0].leaderId,
        taskExecute: [
          {
            userId:
              dataMainChecked[0].type == "User"
                ? dataMainChecked[0].id
                : dataMainChecked[0].leaderId,
            isExcute: true,
            isCombination: false,
          },
          ...dataSubChecked.map((x) => ({
            userId: x.type == "User" ? x.id : x.leaderId,
            isExcute: false,
            isCombination: true,
          })),
        ],
        status: 0,
        progress: 0,
        approveStatus: 1,
        taskDocument: documentTransferList.map((element) => ({
          docId: element.id,
          typeDocument: true,
          documentIn: element,
        })),
      };

      await TaskService.addTaskDoc(task);
      ToastUtils.success("Giao công việc thành công");
      setIsSubmitting(false);
    } catch (error) {
      handleError(error);
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <CustomDialogContent className="sm:max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="bg-blue-600 text-white -m-6 mb-0 p-4 rounded-t-lg">
          <div className="flex justify-between items-center">
            <DialogTitle className="text-white">Chuyển xử lý</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-white hover:bg-blue-700 p-1 h-auto"
              disabled={isSubmitting}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Cây đơn vị</Label>
            <div className="border rounded-lg p-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-4 gap-4 mb-2 pb-2 border-b">
                <div className="font-medium">Tên đơn vị, cá nhân</div>
                <div className="font-medium text-center">Xử lý chính</div>
                {!allowMultiple && (
                  <div className="font-medium text-center">Phối hợp xử lý</div>
                )}
                {!allowMultiple && (
                  <div className="font-medium text-center">Nhận để biết</div>
                )}
              </div>
              {!allowMultiple && (
                <div className="grid grid-cols-4 gap-4 mb-2 pb-2 border-b text-sm">
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={isCheckedAllSupport}
                      onCheckedChange={onChangeAllSub}
                    />
                    <span className="ml-2">Chọn tất cả</span>
                  </div>
                  <div className="flex items-center justify-center">
                    <Checkbox
                      checked={isCheckedAllKnow}
                      onCheckedChange={onChangeAllKnow}
                    />
                    <span className="ml-2">Chọn tất cả</span>
                  </div>
                </div>
              )}
              <div className="space-y-1">
                {showTree.map((node) => renderTreeNode(node))}
              </div>
            </div>
          </div>

          {dataMainChecked.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-red-600 font-medium">Xử lý chính:</span>
              <span className="text-sm">{mainCheckedText}</span>
            </div>
          )}

          {dataSubChecked.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-blue-600 font-medium">Phối hợp:</span>
              <span className="text-sm">{subCheckedText}</span>
            </div>
          )}

          {dataKnowChecked.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-green-600 font-medium">Nhận để biết:</span>
              <span className="text-sm">{knowCheckedText}</span>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="transferComment">Nội dung xử lý</Label>
            <Textarea
              id="transferComment"
              value={transferComment}
              onChange={(e) => setTransferComment(e.target.value)}
              rows={3}
              placeholder="Nhập nội dung xử lý..."
              className={lengthTransferComment() > 2000 ? "border-red-500" : ""}
            />
            {lengthTransferComment() > 2000 && (
              <p className="text-red-500 text-sm">
                Nội dung xử lý không được dài quá 2000 ký tự (
                {lengthTransferComment()}/2000)
              </p>
            )}
          </div>

          {Constant.UPDATE_TRANSFER_BCY && (
            <div className="space-y-2">
              <Label htmlFor="transferFileUpload" className="cursor-pointer">
                <Upload className="inline-block w-4 h-4 mr-2" /> Chọn tệp
              </Label>
              <input
                id="transferFileUpload"
                hidden
                type="file"
                multiple
                onChange={handleSelectFiles}
                disabled={isSubmitting}
              />
              {!validFiles && (
                <p className="text-red-500 text-sm">
                  Kích thước tệp không hợp lệ hoặc định dạng không được hỗ trợ.
                </p>
              )}

              {selectedFiles.length > 0 && (
                <div className="space-y-1">
                  {selectedFiles.map((file, i) => (
                    <div key={i} className="flex items-center text-sm">
                      <span>
                        {file.name} ({getFileSizeString(file.size)})
                      </span>
                      <X
                        className="w-3 h-3 text-red-500 ml-1 cursor-pointer"
                        onClick={() => handleRemoveFile(i)}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {!Constant.UPDATE_TRANSFER_BCY && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="createTask"
                  checked={isCreateTask}
                  onCheckedChange={(checked) => {
                    setIsCreateTask(checked === true);
                    if (!checked) {
                      setIsShowTaskInfo(false);
                      setTaskName("");
                      setTaskEndDate("");
                      setValidTaskName(true);
                    }
                  }}
                />
                <Label htmlFor="createTask">Tạo kèm hồ sơ công việc</Label>
              </div>

              {isCreateTask && isShowTaskInfo && (
                <div className="border rounded-lg p-4 space-y-2 bg-blue-50">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Tên công việc:</Label>
                      <Input value={taskName} readOnly className="bg-white" />
                    </div>
                    <div>
                      <Label>Ngày hết hạn xử lý:</Label>
                      <Input
                        value={taskEndDate}
                        readOnly
                        className="bg-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {isCreateTask && !isShowTaskInfo && (
                <Dialog
                  open={isCreateTask && !isShowTaskInfo}
                  onOpenChange={(open) => {
                    if (!open) {
                      setIsCreateTask(false);
                      setIsShowTaskInfo(false);
                      setTaskName("");
                      setTaskEndDate("");
                      setValidTaskName(true);
                    }
                  }}
                >
                  <CustomDialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Giao công việc</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div>
                        <Label htmlFor="taskName">Tên công việc</Label>
                        <Input
                          id="taskName"
                          value={taskName}
                          onChange={(e) => {
                            setTaskName(e.target.value);
                            changeTaskName();
                          }}
                          maxLength={100}
                          placeholder="Tên công việc"
                          className={!validTaskName ? "border-red-500" : ""}
                        />
                        {!validTaskName && (
                          <p className="text-red-500 text-sm mt-1">
                            Tên công việc không được để trống
                          </p>
                        )}
                      </div>
                      <div>
                        <Label htmlFor="taskEndDate">Ngày đến hạn xử lý</Label>
                        <Input
                          id="taskEndDate"
                          type="date"
                          value={taskEndDate}
                          onChange={(e) => setTaskEndDate(e.target.value)}
                          min={new Date().toISOString().split("T")[0]}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button onClick={doSaveTask}>Lưu</Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsCreateTask(false);
                          setIsShowTaskInfo(false);
                          setTaskName("");
                          setTaskEndDate("");
                          setValidTaskName(true);
                        }}
                      >
                        Hủy
                      </Button>
                    </DialogFooter>
                  </CustomDialogContent>
                </Dialog>
              )}
            </div>
          )}

          {Constant.DEADLINE_CHECKBOX_TRANSFER_BCY && !allowMultiple && (
            <div className="space-y-2">
              <Label htmlFor="deadlineDate">Thiết lập hạn xử lý</Label>
              <Input
                id="deadlineDate"
                type="date"
                value={deadlineDate}
                onChange={(e) => setDeadlineDate(e.target.value)}
                disabled={isSubmitting}
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-end gap-2 pt-4 border-t">
          <Button
            type="button"
            onClick={handleTransferDocument}
            disabled={
              isSubmitting ||
              dataMainChecked.length === 0 ||
              lengthTransferComment() > 2000
            }
          >
            <Send className="w-4 h-4 mr-2" /> Gửi xử lý
          </Button>
        </DialogFooter>
      </CustomDialogContent>

      <DelegatedList
        isOpen={showDelegatedList}
        onOpenChange={setShowDelegatedList}
        delegatedUserList={currentRowData?.delegateUsers || []}
        personHandleType={currentPersonHandleType}
        onSelect={handleDelegatedUserSelect}
        delegateType="IN"
      />
    </Dialog>
  );
}
