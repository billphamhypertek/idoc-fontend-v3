import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ToastUtils } from "@/utils/toast.utils";
import { DocumentService } from "@/services/document.service";
import { Bpmn2Service } from "@/services/bpmn2.service";
import { utilCheckParentInTransfer } from "@/utils/common.utils";
import { Constant } from "@/definitions/constants/constant";
import { getUserInfo } from "@/utils/token.utils";
import { useGetAllUsersAddProcess } from "@/hooks/data/user.data";
import { useGetOrganizations } from "@/hooks/data/organization.data";
import {
  Building,
  Users,
  ChevronDown,
  ChevronRight,
  Upload,
  X,
  Send,
} from "lucide-react";
import { CustomDatePicker } from "../ui/calendar";
import { formatDateYMD, parseDateStringYMD } from "@/utils/datetime.utils";

export type TreeNode = {
  data: any;
  expanded?: boolean;
  children: TreeNode[];
  level?: number;
  parent?: TreeNode;
};

interface SwitchAndAddUserDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  documentId: string;
  step?: number;
  isSwitchMainUser?: boolean;
  isOnlyKnow?: boolean;
  isCombine?: boolean;
  onSuccess?: () => void;
  allowMultiple?: boolean;
  currentSelectedNodeID?: number;
  allowMultipleProps?: boolean;
}

export function SwitchAndAddUser({
  isOpen,
  onOpenChange,
  onClose,
  documentId,
  step = 0,
  isSwitchMainUser = false,
  isOnlyKnow = false,
  isCombine = false,
  onSuccess,
  allowMultipleProps = false,
  currentSelectedNodeID,
}: SwitchAndAddUserDialogProps) {
  const [loading, setLoading] = useState<boolean>(false);
  const [nodeId, setNodeId] = useState<string>("");
  const [users, setUsers] = useState<any[]>([]);
  const [userList, setUserList] = useState<any[]>([]); // Angular userList
  const [showTree, setShowTree] = useState<TreeNode[]>([]);
  const [dataMainChecked, setDataMainChecked] = useState<any[]>([]);
  const [dataSubChecked, setDataSubChecked] = useState<any[]>([]);
  const [dataKnowChecked, setDataKnowChecked] = useState<any[]>([]);
  const [mainCheckedText, setMainCheckedText] = useState("");
  const [subCheckedText, setSubCheckedText] = useState("");
  const [knowCheckedText, setKnowCheckedText] = useState("");
  const [transferComment, setTransferComment] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [validFiles, setValidFiles] = useState(true);
  const [deadlineDate, setDeadlineDate] = useState<string>("");
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [submitting, setSubmitting] = useState(false);

  // Get orgId from getUserInfo like Angular, but only when isCombine is true
  const orgId = isCombine ? JSON.parse(getUserInfo() || "{}").org || "" : "";

  // Use getAllUsersAddProcess hook only when isCombine like Angular
  const { data: allUsersAddProcess } = useGetAllUsersAddProcess(orgId);

  // Use hook to load organizations
  const { data: organizations } = useGetOrganizations(
    { active: true },
    isOpen && !!documentId
  );

  // Constants from Angular - allowMultiple needs isCombine check
  const allowMultiple = allowMultipleProps && Constant.ORG_MULTI_TRANSFER_BCY;
  const UPDATE_TRANSFER_BCY = Constant.UPDATE_TRANSFER_BCY;
  const ENCRYPTION_TWD = Constant.ENCRYPTION_TWD;
  const DEADLINE_CHECKBOX_TRANSFER_BCY =
    Constant.DEADLINE_CHECKBOX_TRANSFER_BCY;

  // Load userList from getAllUsersAddProcess when isCombine like Angular
  useEffect(() => {
    if (isCombine && allUsersAddProcess) {
      const mappedUserList = allUsersAddProcess.map((item: any) => ({
        directionAuthority: false,
        fullName: item.fullName,
        id: item.id,
        lead: item.positionModel.isDefault,
        org: item.org,
        position: item.position,
        positionName: item.positionModel.name,
        positionOrder: item.positionModel.order,
        siblings: item.positionModel.isSiblings,
        userName: item.userName,
      }));
      setUserList(mappedUserList);
      doLoadUserByNode();
    } else if (!isCombine && isOpen && documentId) {
      doLoadUserByNode();
    }
  }, [allUsersAddProcess, isCombine, isOpen, documentId]);

  // doLoadUserByNode function matching Angular exactly
  const doLoadUserByNode = async () => {
    try {
      // Use currentSelectedNodeID from Bpmn2Service like Angular
      const usersByNode = await Bpmn2Service.getUsersByNode(
        currentSelectedNodeID || 0
      );

      let finalUserList: any[];
      if (userList && userList.length > 0) {
        // If userList exists (from getAllUsersAddProcess), concat like Angular
        finalUserList = userList.concat(usersByNode);
      } else {
        // If no userList, use usersByNode directly
        finalUserList = usersByNode;
      }

      // Sort by positionOrder descending like Angular
      finalUserList.sort(
        (a, b) => (b.positionOrder || 0) - (a.positionOrder || 0)
      );

      // Get existing users to mark as transferred like Angular
      try {
        const existing = await DocumentService.getUserExistByNode(
          currentSelectedNodeID || 0,
          step,
          Number(documentId)
        );

        // Mark transferred users like Angular
        finalUserList.forEach((element: any) => {
          existing.forEach((user: any) => {
            if (element.id === user.id) {
              element.isTransfered = true;
            }
          });
        });
      } catch (error) {
        console.error("Error getting existing users:", error);
      }

      setUsers(finalUserList);
    } catch (error) {
      console.error("Error loading users by node:", error);
      setUsers([]);
    }
  };

  // Build tree when orgs are loaded like Angular
  useEffect(() => {
    if (organizations && organizations.length > 0) {
      buildTree();
    }
  }, [organizations, users]);

  // Build tree function based on Angular creatDataTree logic
  const buildTree = () => {
    if (!organizations) return;

    const processTreeData: TreeNode[] = [];
    const orgChildren: any[] = [];

    organizations.forEach((org: any) => {
      if (!org.parentId) {
        const dataTree: TreeNode = {
          data: { ...org, isCanCheck: false, haveLeader: false },
          expanded: true,
          children: [],
        };
        processTreeData.push(dataTree);
      } else {
        orgChildren.push(org);
      }
    });

    utilCheckParentInTransfer(processTreeData, orgChildren);

    const arrAddOrg: any[] = [];
    users.forEach((user: any) => {
      if (
        user.org !== undefined &&
        user.org !== null &&
        !arrAddOrg.some((a) => a.org === user.org)
      ) {
        arrAddOrg.push({ org: user.org, pos: null });
      }
    });

    let newShowTree: TreeNode[] = [];
    if (arrAddOrg.length > 0) {
      creatTreeForNode(arrAddOrg, processTreeData, newShowTree);
    } else {
      newShowTree = processTreeData.map(deepCloneTree);
    }

    for (let i = 0; i < arrAddOrg.length; i++) {
      addUserToOrgTree(users, newShowTree);
    }

    prettyOrgTree(newShowTree);
    if (allowMultiple) {
      removeUserFinalTree(newShowTree);
    }
    checkLeadExistInOrg(newShowTree);
    setShowTree(newShowTree);

    const allIds: number[] = [];
    const collectIds = (nodes: TreeNode[]) => {
      nodes.forEach((node) => {
        allIds.push(node.data.id);
        if (node.children) collectIds(node.children);
      });
    };
    collectIds(newShowTree);
    setExpandedItems(new Set(allIds));
  };

  // Deep clone tree function (from common.utils)
  const deepCloneTree = (node: TreeNode): TreeNode => {
    const clone: TreeNode = {
      data: { ...node.data },
      expanded: node.expanded,
      children: [],
    };
    if (node.children) {
      clone.children = node.children.map(deepCloneTree);
    }
    return clone;
  };

  // Helper: search tree by id
  const searchTreeByID = (id: number, node: TreeNode): boolean => {
    if (id === node.data.id) return true;
    if (node.children) {
      return node.children.some((child) => searchTreeByID(id, child));
    }
    return false;
  };

  // Helper: get branch containing org id
  const getTreeByOrgID = (
    orgId: number,
    mainTree: TreeNode[]
  ): TreeNode | undefined => {
    for (const root of mainTree) {
      if (searchTreeByID(orgId, root)) return root;
    }
    return undefined;
  };

  const findOrgInChildren = (id: number, tree: TreeNode[]): boolean => {
    for (const n of tree) {
      if (id === n.data.id && !n.data.userName) return true;
      if (n.children && findOrgInChildren(id, n.children)) return true;
    }
    return false;
  };

  // Rebuild subset tree for specific org nodes (like Angular creatTreeForNode)
  const creatTreeForNode = (
    arrOrgNode: any[],
    processTreeData: TreeNode[],
    showTree: TreeNode[]
  ) => {
    arrOrgNode.forEach((element) => {
      if (showTree.length === 0) {
        const branch = getTreeByOrgID(element.org, processTreeData);
        if (branch) showTree.push(deepCloneTree(branch));
      } else if (!findOrgInChildren(element.org, showTree)) {
        const branch = getTreeByOrgID(element.org, processTreeData);
        if (branch) showTree.push(deepCloneTree(branch));
      }
    });
  };

  // creatTreeForNode function like Angular
  // Submit logic aligned with Angular implementation
  const handleSubmit = async () => {
    if (!canSubmit) {
      ToastUtils.chuaChonNguoiXuLy();
      return;
    }
    setSubmitting(true);
    try {
      const main: any[] = [];
      const orgMain: any[] = [];
      if (!allowMultiple) {
        dataMainChecked.forEach((x) => {
          if (x.type === "User") {
            const id = x.delegatedId ? `${x.id}-${x.delegatedId}` : x.id;
            if (!main.includes(id)) main.push(id);
          } else if (x.type === "Org" && x.leaderId) {
            if (!orgMain.includes(x.id)) orgMain.push(x.id);
          } else if (x.type === "Org" && !x.leaderId) {
            ToastUtils.donViChuaCoTruongPhong(x.name);
          }
        });
      } else {
        dataMainChecked.forEach((x) => {
          const id = x.delegatedId ? `${x.id}-${x.delegatedId}` : x.id;
          if (!main.includes(id)) main.push(id);
        });
      }

      const supports: any[] = [];
      const orgSupport: any[] = [];
      dataSubChecked.forEach((x) => {
        if (x.type === "User") {
          const id = x.delegatedId ? `${x.id}-${x.delegatedId}` : x.id;
          if (!supports.includes(id)) supports.push(id);
        } else if (x.type === "Org" && x.leaderId) {
          if (!orgSupport.includes(x.id)) orgSupport.push(x.id);
        } else if (x.type === "Org" && !x.leaderId) {
          ToastUtils.donViChuaCoTruongPhong(x.name);
        }
      });

      const shows: any[] = [];
      const orgShow: any[] = [];
      dataKnowChecked.forEach((x) => {
        if (x.type === "User") {
          if (!shows.includes(x.id)) shows.push(x.id);
        } else if (x.type === "Org" && x.leaderId) {
          if (!orgShow.includes(x.id)) orgShow.push(x.id);
        } else if (x.type === "Org" && !x.leaderId) {
          ToastUtils.donViChuaCoTruongPhong(x.name);
        }
      });

      const isSwitch = isOnlyKnow ? false : isSwitchMainUser;
      let cmtContent = `\n- Xử lý chính : ${mainCheckedText}\n`;
      if (!isSwitchMainUser) cmtContent = "";
      if (supports.length > 0) cmtContent += `- Phối hợp : ${subCheckedText}\n`;
      if (shows.length > 0)
        cmtContent += `- Nhận để biết : ${knowCheckedText}\n`;
      const transferCommentPayload = transferComment?.trim()
        ? `- ${transferComment.trim()}`
        : "";

      await DocumentService.doSwitchMainOrAddSupportUser(
        Number(documentId),
        transferCommentPayload,
        main,
        supports,
        shows,
        orgMain,
        orgSupport,
        orgShow,
        currentSelectedNodeID?.toString() || "0",
        selectedFiles,
        deadlineDate,
        isSwitch,
        cmtContent
      );

      ToastUtils.daThemNguoiXuLy();
      onSuccess?.();
      onClose();
    } catch (e: any) {
      ToastUtils.loiThemXuLy();
    } finally {
      setSubmitting(false);
    }
  };
  // Add users to org tree (mimic Angular logic)
  const addUserToOrgTree = (userArray: any[], orgTree: TreeNode[]) => {
    const reversed = [...userArray].reverse();
    reversed.forEach((u) => checkUserInOrgTree(u, orgTree));
  };

  const checkUserInOrgTree = (user: any, orgTree: TreeNode[]) => {
    orgTree.forEach((node) => {
      if (!node) return;
      const isOrgNode = !node.data.userName;
      if (isOrgNode && user.org === node.data.id) {
        // If already exists skip
        const exists = node.children?.some(
          (c) => c.data.userName && c.data.id === user.id
        );
        if (exists) return;
        const userNode: TreeNode = {
          data: {
            ...user,
            isMainChecked: false,
            isSubChecked: false,
            isKnowChecked: false,
          },
          children: [],
        };
        if (!node.children) node.children = [];
        // Push on top like Angular unshift
        node.children.unshift(userNode);
      } else if (node.children && node.children.length > 0) {
        checkUserInOrgTree(user, node.children);
      }
    });
  };

  // Check if user exists in tree like Angular
  const checkUserIsExistInTree = (
    userID: number,
    tree: TreeNode[]
  ): boolean => {
    return tree.some(
      (element) =>
        element.data.hasOwnProperty("userName") && element.data.id === userID
    );
  };

  const prettyOrgTree = (tree: TreeNode[]) => {
    for (let i = tree.length - 1; i >= 0; i--) {
      if (tree[i]) {
        if (
          !tree[i].children?.length &&
          !tree[i].data.hasOwnProperty("userName")
        ) {
          tree.splice(i, 1);
          prettyOrgTree(tree);
        } else if (tree[i].children) {
          prettyOrgTree(tree[i].children!);
        }
      } else {
        tree.splice(i, 1);
      }
    }
  };

  const removeUserFinalTree = (tree: TreeNode[]) => {
    for (let i = tree.length - 1; i >= 0; i--) {
      if (tree[i]) {
        if (tree[i].data.hasOwnProperty("userName")) {
          tree.splice(i, 1);
          // Recursively call like Angular
          removeUserFinalTree(tree);
        } else {
          if (
            !tree[i].data.isCanCheck &&
            tree[i].children?.find((x) => x.data.hasOwnProperty("userName"))
          ) {
            tree[i].data.isCanCheck = true;
          }
          if (tree[i].children) {
            removeUserFinalTree(tree[i].children);
          }
        }
      } else {
        tree.splice(i, 1);
      }
    }
  };

  const checkLeadExistInOrg = (tree: TreeNode[]) => {
    tree.forEach((node) => {
      if (!node.data.userName) {
        // This is an org node
        if (node.children?.length) {
          const leaderChild = node.children.find(
            (child) => child.data.userName && child.data.lead
          );
          node.data.haveLeader = !!leaderChild;
          if (leaderChild) {
            node.data.leaderId = leaderChild.data.id;
            node.data.leaderFullname = leaderChild.data.fullName;
            node.data.leaderPositionName = leaderChild.data.positionName;
          }
          checkLeadExistInOrg(node.children);
        } else {
          node.data.haveLeader = false;
        }
      }
    });
  };

  // Selection helpers based on Angular removeObjInTree logic
  const removeObjInTree = (obj: any, tree: TreeNode[], type: number) => {
    const updateNode = (nodes: TreeNode[]) => {
      nodes.forEach((node) => {
        const data = node.data;
        const matchUser =
          obj.type === "User" && data.userName && obj.id === data.id;
        const matchOrgLeader =
          obj.type === "User" && !data.userName && obj.id === data.leaderId;
        const matchOrgUser =
          obj.type === "Org" && data.userName && obj.leaderId === data.id;
        const matchOrg =
          obj.type === "Org" && !data.userName && obj.id === data.id;

        if (matchUser || matchOrgLeader || matchOrgUser || matchOrg) {
          if (type === 0) data.isMainChecked = false;
          else if (type === 1) data.isSubChecked = false;
          else if (type === 2) data.isKnowChecked = false;
        }
        if (node.children) updateNode(node.children);
      });
    };
    updateNode(tree);
  };

  const mainRemove = (obj: any) => {
    removeObjInTree(obj, showTree, 0);
    setDataMainChecked((prev) =>
      prev.filter((item) => {
        const sameTypeId = item.type === obj.type && item.id === obj.id;
        const diffTypeUser =
          item.type !== obj.type &&
          obj.type === "User" &&
          obj.id === item.leaderId;
        const diffTypeOrg =
          item.type !== obj.type &&
          obj.type === "Org" &&
          obj.leaderId === item.id;
        return !(sameTypeId || diffTypeUser || diffTypeOrg);
      })
    );
  };

  const secondRemove = (obj: any) => {
    removeObjInTree(obj, showTree, 1);
    setDataSubChecked((prev) =>
      prev.filter((item) => {
        const sameTypeId = item.type === obj.type && item.id === obj.id;
        const diffTypeUser =
          item.type !== obj.type &&
          obj.type === "User" &&
          obj.id === item.leaderId;
        const diffTypeOrg =
          item.type !== obj.type &&
          obj.type === "Org" &&
          obj.leaderId === item.id;
        return !(sameTypeId || diffTypeUser || diffTypeOrg);
      })
    );
  };

  const toKnowRemove = (obj: any) => {
    removeObjInTree(obj, showTree, 2);
    setDataKnowChecked((prev) =>
      prev.filter((item) => {
        const sameTypeId = item.type === obj.type && item.id === obj.id;
        const diffTypeUser =
          item.type !== obj.type &&
          obj.type === "User" &&
          obj.id === item.leaderId;
        const diffTypeOrg =
          item.type !== obj.type &&
          obj.type === "Org" &&
          obj.leaderId === item.id;
        return !(sameTypeId || diffTypeUser || diffTypeOrg);
      })
    );
  };

  // Update checked texts based on current selections
  const updateCheckedTexts = () => {
    setMainCheckedText(
      dataMainChecked
        .map((x) =>
          x.type === "Org" ? `Đơn vị ${x.name}` : `${x.positionName} ${x.name}`
        )
        .join(", ")
    );
    setSubCheckedText(
      dataSubChecked
        .map((x) =>
          x.type === "Org" ? `Đơn vị ${x.name}` : getSubCheckedText(x)
        )
        .join(", ")
    );
    setKnowCheckedText(
      dataKnowChecked
        .map((x) =>
          x.type === "Org" ? `Đơn vị ${x.name}` : `${x.positionName} ${x.name}`
        )
        .join(", ")
    );
  };

  // Update texts when selections change
  useEffect(() => {
    updateCheckedTexts();
  }, [dataMainChecked, dataSubChecked, dataKnowChecked]);

  const getSubCheckedText = (x: any) => {
    if (!x.delegatedId) return `${x.positionName} ${x.name}`;
    return `${x.delegatePosition} ${x.delegatedName}(ủy quyền bởi ${x.positionName} ${x.name})`;
  };

  // Choose functions - based on Angular chooseMain, chooseSub, checkKnowProcess
  const chooseMain = (isChecked: boolean, rowData: any) => {
    const obj = rowData.userName
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
      // If not allowMultiple, remove previous main selection
      if (dataMainChecked.length > 0 && !allowMultiple) {
        const prevMain = dataMainChecked[0];
        mainRemove(prevMain);
      }
      setDataMainChecked((prev) => [...prev, obj]);
      // Update tree state
      updateTreeNodeState(rowData, "isMainChecked", true);
      // Remove from other categories
      secondRemove(obj);
      toKnowRemove(obj);
    } else {
      mainRemove(obj);
      updateTreeNodeState(rowData, "isMainChecked", false);
    }
  };

  const chooseSub = (isChecked: boolean, rowData: any) => {
    const obj = rowData.userName
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
      setDataSubChecked((prev) => [...prev, obj]);
      updateTreeNodeState(rowData, "isSubChecked", true);
      mainRemove(obj);
      toKnowRemove(obj);
    } else {
      secondRemove(obj);
      updateTreeNodeState(rowData, "isSubChecked", false);
    }
  };

  const chooseKnow = (isChecked: boolean, rowData: any) => {
    const obj = rowData.userName
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
      setDataKnowChecked((prev) => [...prev, obj]);
      updateTreeNodeState(rowData, "isKnowChecked", true);
      mainRemove(obj);
      secondRemove(obj);
    } else {
      toKnowRemove(obj);
      updateTreeNodeState(rowData, "isKnowChecked", false);
    }
  };

  // Helper to update tree node state
  const updateTreeNodeState = (rowData: any, field: string, value: boolean) => {
    const updateNodes = (nodes: TreeNode[]) => {
      nodes.forEach((node) => {
        if (
          node.data.id === rowData.id &&
          Boolean(node.data.userName) === Boolean(rowData.userName)
        ) {
          node.data[field] = value;
        }
        if (node.children) updateNodes(node.children);
      });
    };
    updateNodes(showTree);
  };

  // File handling
  const doSelectFiles = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []) as File[];
    setSelectedFiles((prev) => [
      ...prev,
      ...files.filter((f) => !prev.some((p) => p.name === f.name)),
    ]);
  };

  const doRemoveFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // Toggle expand
  const toggleExpanded = (id: number) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  // Can submit
  const canSubmit = useMemo(() => {
    return (
      dataMainChecked.length > 0 ||
      dataSubChecked.length > 0 ||
      dataKnowChecked.length > 0
    );
  }, [dataMainChecked, dataSubChecked, dataKnowChecked]);

  // Recursive tree render component
  const TreeTableRow = ({
    node,
    level = 0,
  }: {
    node: TreeNode;
    level: number;
  }) => {
    const data = node.data;
    const isOrg = !data.userName;
    const haveLeader = isOrg ? data.haveLeader : true;
    const isDisabled = !haveLeader || data.isTransfered;
    const isExpanded = expandedItems.has(data.id);

    return (
      <>
        <tr className="border-b hover:bg-gray-50">
          <td style={{ paddingLeft: `${level * 20 + 8}px` }} className="py-2">
            {node.children?.length ? (
              <span
                onClick={() => toggleExpanded(data.id)}
                className="cursor-pointer inline-block w-4 text-gray-600 mr-2"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </span>
            ) : (
              <span className="inline-block w-4 mr-2"></span>
            )}

            {isOrg ? (
              <span className="inline-flex items-center gap-1">
                <Building className="w-4 h-4 text-red-500" />
                {data.name}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1">
                <Users className="w-4 h-4 text-blue-500" />
                {data.fullName}
              </span>
            )}

            {data.isTransfered && (
              <span className="ml-2 text-xs text-gray-500 bg-gray-100 px-1 rounded">
                (đã chuyển)
              </span>
            )}
          </td>

          {!isOnlyKnow && (
            <>
              {isSwitchMainUser && (
                <td className="text-center py-2 bg-red-25">
                  <input
                    type="checkbox"
                    checked={data.isMainChecked || false}
                    onChange={(e) => chooseMain(e.target.checked, data)}
                    disabled={isOrg ? !haveLeader : data.isTransfered}
                    className="cursor-pointer"
                  />
                </td>
              )}
              {!allowMultiple && (
                <td className="text-center py-2 bg-blue-25">
                  <input
                    type="checkbox"
                    checked={data.isSubChecked || false}
                    onChange={(e) => chooseSub(e.target.checked, data)}
                    disabled={isOrg ? !haveLeader : data.isTransfered}
                    className="cursor-pointer"
                  />
                </td>
              )}
            </>
          )}

          {!allowMultiple && (
            <td className="text-center py-2 bg-green-25">
              <input
                type="checkbox"
                checked={data.isKnowChecked || false}
                onChange={(e) => chooseKnow(e.target.checked, data)}
                disabled={isOrg ? !haveLeader : data.isTransfered}
                className="cursor-pointer"
              />
            </td>
          )}
        </tr>
        {isExpanded &&
          node.children?.map((child) => (
            <TreeTableRow key={child.data.id} node={child} level={level + 1} />
          ))}
      </>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Thêm xử lý</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-8">
              <div className="text-sm text-gray-600">
                Đang tải danh sách người dùng...
              </div>
            </div>
          ) : (
            <>
              {/* Tree Table */}
              <div className="max-h-80 overflow-auto border rounded">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50">
                      <th className="text-left p-2">Tên đơn vị, cá nhân</th>
                      {!isOnlyKnow && (
                        <>
                          {isSwitchMainUser && (
                            <th className="text-center p-2 w-24 bg-red-50">
                              Xử lý chính
                            </th>
                          )}
                          {!allowMultiple && (
                            <th className="text-center p-2 w-28 bg-blue-50">
                              Phối hợp xử lý
                            </th>
                          )}
                        </>
                      )}
                      {!allowMultiple && (
                        <th className="text-center p-2 w-28 bg-green-50">
                          Nhận để biết
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {showTree.map((node) => (
                      <TreeTableRow key={node.data.id} node={node} level={0} />
                    ))}
                    {showTree.length === 0 && (
                      <tr>
                        <td className="p-2 text-gray-500" colSpan={4}>
                          Không có dữ liệu
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Selected Users Display */}
              {dataMainChecked.length > 0 && (
                <div className="flex items-start gap-2">
                  <div className="text-red-600 font-bold min-w-0 w-24 text-sm">
                    Xử lý chính:
                  </div>
                  <div className="flex-1 text-sm">{mainCheckedText}</div>
                </div>
              )}

              {dataSubChecked.length > 0 && (
                <div className="flex items-start gap-2">
                  <div className="text-blue-600 font-bold min-w-0 w-24 text-sm">
                    Phối hợp:
                  </div>
                  <div className="flex-1 text-sm">{subCheckedText}</div>
                </div>
              )}

              {dataKnowChecked.length > 0 && (
                <div className="flex items-start gap-2">
                  <div className="text-green-600 font-bold min-w-0 w-24 text-sm">
                    Nhận để biết:
                  </div>
                  <div className="flex-1 text-sm">{knowCheckedText}</div>
                </div>
              )}

              {/* Comment Section */}
              <div className="border rounded p-3">
                <div className="font-bold mb-2 text-sm">Nội dung xử lý</div>
                <Textarea
                  placeholder="Nhập ý kiến thêm xử lý..."
                  value={transferComment}
                  onChange={(e) => setTransferComment(e.target.value)}
                  rows={3}
                  maxLength={2000}
                />
                {transferComment.length > 2000 && (
                  <div className="text-red-500 text-xs mt-1">
                    Nội dung xử lý không được dài quá 2000 ký tự
                  </div>
                )}

                {/* File Upload */}
                {UPDATE_TRANSFER_BCY && (
                  <div className="mt-3">
                    <label className="btn btn-success cursor-pointer inline-flex items-center gap-2 px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                      <Upload className="w-4 h-4" />
                      Chọn tệp
                      <input
                        type="file"
                        multiple
                        onChange={doSelectFiles}
                        className="hidden"
                      />
                    </label>

                    {selectedFiles.map((file, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 mt-2 text-sm"
                      >
                        <button
                          onClick={() => doRemoveFile(i)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <span>
                          {file.name} ({(file.size / 1024).toFixed(1)}KB)
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Deadline - only show for main user switch and not multiple */}
              {DEADLINE_CHECKBOX_TRANSFER_BCY &&
                isSwitchMainUser &&
                !allowMultiple && (
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium">
                      Thiết lập hạn xử lý:
                    </label>
                    <CustomDatePicker
                      selected={parseDateStringYMD(deadlineDate)}
                      onChange={(e) => setDeadlineDate(formatDateYMD(e))}
                      placeholder="Chọn ngày"
                    />
                  </div>
                )}
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={
              submitting ||
              !canSubmit ||
              transferComment.length > 2000 ||
              loading
            }
            className="bg-blue-600 hover:bg-blue-700"
          >
            {submitting ? (
              "Đang gửi..."
            ) : (
              <>
                <Send className="w-4 h-4 mr-1" />
                Gửi xử lý
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
