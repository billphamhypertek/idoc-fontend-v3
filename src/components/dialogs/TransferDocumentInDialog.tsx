import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
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
import { cn } from "@/lib/utils";
import { deepCloneTree } from "@/utils/common.utils";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Building,
  ChevronDown,
  ChevronRight,
  Redo2,
  Users,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";

// Constants (simulate from Angular config)
const ORG_MULTI_TRANSFER_BCY = Constant.ORG_MULTI_TRANSFER_BCY;
const LEADER_TRANSFER_CHECK_H05 = Constant.LEADER_TRANSFER_CHECK_H05;

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
export interface TransferDocumentInDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onClose: () => void;
  onSubmit: (data: {
    comment: string;
    main: any[];
    userIdSelected: number[];
    direction: number[];
  }) => void;
  selectedRole: BpmnResponse | null;
  organizationData: TreeNode[];
  listIdDisableByOrgCheck: number[];
  listByOrgAndTypeIsOne: number[];
  listByLeaderAndTypeIsOne: number[];
  isTransferDraft: boolean;
}

export function TransferDocumentInDialog({
  isOpen,
  onOpenChange,
  onClose,
  onSubmit,
  selectedRole,
  organizationData,
  listIdDisableByOrgCheck,
  listByOrgAndTypeIsOne,
  listByLeaderAndTypeIsOne,
  isTransferDraft,
}: TransferDocumentInDialogProps) {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [dataMainChecked, setDataMainChecked] = useState<any[]>([]);
  const [dataLeaderChecked, setDataLeaderChecked] = useState<any[]>([]);
  const [mainCheckedText, setMainCheckedText] = useState("");
  const [leaderCheckedText, setLeaderCheckedText] = useState("");
  const [transferComment, setTransferComment] = useState("");
  const [transferCommentError, setTransferCommentError] = useState<
    string | null
  >(null);
  const MAX_TRANSFER_COMMENT = 2000;
  const [isShowLeaderColumn, setIsShowLeaderColumn] = useState(false);
  const allowMultiple =
    ORG_MULTI_TRANSFER_BCY && (selectedRole?.allowMultiple || false);
  const resetState = () => {
    setExpandedItems(new Set());
    setDataMainChecked([]);
    setDataLeaderChecked([]);
    setMainCheckedText("");
    setLeaderCheckedText("");
    setTransferComment("");
    setTransferCommentError(null);
    setIsShowLeaderColumn(false);
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
    setTreeData((prevTree) => {
      const newTree = [...prevTree];
      if (isChecked) {
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
        setDataMainChecked((prev) => {
          let newPrev = [...prev];
          if (dataMainChecked.length > 0 && !allowMultiple) {
            mainOnlyRemove(newPrev[0]);
          }
          if (allowMultiple) {
            const existingIndex = newPrev.findIndex(
              (x) => x.id === rowData.data.id
            );
            if (existingIndex !== -1) {
              newPrev[existingIndex].typeOrg = type;
            } else {
              newPrev.push(obj);
            }
          } else {
            newPrev = [obj];
          }
          if (allowMultiple) {
            setListName(newPrev);
            if (!checkTypeAll) {
              setvalueCheckAll(newPrev, rowData.data.parentId, type);
            }
          } else {
            setMainCheckedText(
              obj.type === "Org"
                ? `Đơn vị ${obj.name}`
                : `${obj.positionName} ${obj.name}`
            );
          }
          directionRemove(obj);
          return newPrev;
        });
      } else {
        setDataMainChecked((prev) => {
          const newPrev = prev.filter((x) => x.id !== obj.id);
          if (allowMultiple) {
            setListName(newPrev);
            if (!checkTypeAll) {
              setvalueCheckAll(newPrev, rowData.data.parentId, type);
            }
          } else {
            setMainCheckedText("");
          }
          return newPrev;
        });
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
      }
      return newTree;
    });
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
      setMainCheckedText("");
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
    setTreeData((prev) => {
      const newTree = [...prev];
      showTree.forEach((x) => {
        const tmp = listIdDisableByOrgCheck.filter((id) => id === x.data.id);
        if (tmp.length === 0 && x.data.id !== rowData.data.id) {
          if (x.data.parentId === rowData.data.id) {
            if (type === 1) {
              x.data.isMainChecked1 = true;
              x.data.isMainChecked2 = false;
              x.data.isMainChecked3 = false;
              chooseMain(true, x, 1, true);
            } else if (type === 2) {
              x.data.isMainChecked1 = false;
              x.data.isMainChecked2 = true;
              x.data.isMainChecked3 = false;
              chooseMain(true, x, 2, true);
            } else if (type === 3) {
              x.data.isMainChecked1 = false;
              x.data.isMainChecked2 = false;
              x.data.isMainChecked3 = true;
              chooseMain(true, x, 3, true);
            }
          }
        }
        if (x.children && x.children.length > 0) {
          checkedColumnOrgMain(x.children, type, rowData);
        }
      });
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
      return newTree;
    });
  };

  const unCheckedColumnOrgMain = (
    showTree: TreeNode[],
    type: number,
    rowData: TreeNode
  ) => {
    setTreeData((prev) => {
      const newTree = [...prev];
      showTree.forEach((x) => {
        if (x.data.parentId === rowData.data.id) {
          if (type === 1 && x.data.isMainChecked1) {
            x.data.isMainChecked1 = false;
            chooseMain(false, x, 1, true);
          } else if (type === 2 && x.data.isMainChecked2) {
            x.data.isMainChecked2 = false;
            chooseMain(false, x, 2, true);
          } else if (type === 3 && x.data.isMainChecked3) {
            x.data.isMainChecked3 = false;
            chooseMain(false, x, 3, true);
          }
        }
        if (x.children && x.children.length > 0) {
          unCheckedColumnOrgMain(x.children, type, rowData);
        }
      });
      if (type === 1) {
        rowData.data.isCheckAllColumnOrgMain = false;
      } else if (type === 2) {
        rowData.data.isCheckAllColumnOrgCombination = false;
      } else if (type === 3) {
        rowData.data.isCheckAllColumnOrgMainIdentified = false;
      }
      return newTree;
    });
  };

  const checkMainProcess = (isChecked: boolean, rowData: TreeNode) => {
    // Assume no delegateUsers for now
    chooseMain(isChecked, rowData);
  };

  const handleSubmit = () => {
    if (transferCommentError) return;
    const userIdSelected: number[] = [];
    const main: any[] = [];
    const direction: number[] = dataLeaderChecked.map((x) => x.id);

    dataMainChecked.forEach((x) => {
      if (x.type === "User") {
        main.push(x.id);
        userIdSelected.push(x.id);
        if (x.delegatedId) {
          main.push(x.delegatedId);
          userIdSelected.push(x.delegatedUserId);
          main.push(x.delegatedUserId);
        }
      } else {
        userIdSelected.push(x.leaderId);
      }
    });
    const comment = transferComment ? `- ${transferComment.trim()}` : "";

    onSubmit({
      comment,
      main,
      userIdSelected,
      direction,
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
                <Building className="h-4 w-4 ml-2 text-red-800" />
              ) : (
                <Users className="h-4 w-4 ml-2 text-blue-800" />
              )}
              <span className="ml-2">
                {rowData.data.name || rowData.data.fullName}
              </span>
            </div>
          </TableCell>
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
              {isTransferDraft ? "Chuyển xử lý" : "Trình lãnh đạo"}
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
        <DialogDescription />
        <div className={cn("overflow-auto max-h-[420px]")}>
          <TableBase>
            <TableHeader>
              <TableRow>
                <TableHead>Tên đơn vị, cá nhân</TableHead>
                {LEADER_TRANSFER_CHECK_H05 && isShowLeaderColumn && (
                  <TableHead className="text-center w-[15%]">Chỉ đạo</TableHead>
                )}
                <TableHead className="text-center w-[15%]">
                  Xử lý chính
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {treeData.map((item) => renderTreeRow(item, 0))}
            </TableBody>
          </TableBase>
        </div>
        {/* Rest of the component remains similar */}
        {dataLeaderChecked.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <div className="w-1/6 font-bold text-blue-500 pr-2 whitespace-nowrap">
              Chỉ đạo :
            </div>
            <div className="w-5/6 leading-tight break-words font-bold">
              {leaderCheckedText}
            </div>
          </div>
        )}
        {dataMainChecked.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <div className="w-1/6 font-bold text-red-500 pr-2 whitespace-nowrap">
              Xử lý chính :{" "}
            </div>
            <div className="w-5/6 leading-tight break-words font-bold">
              {mainCheckedText}
            </div>
          </div>
        )}
        <div className="">
          <Label className="text-blue-500 font-bold">Nội dung xử lý:</Label>
          <Textarea
            value={transferComment}
            onChange={(e) => {
              const v = e.target.value;
              if (v.length > MAX_TRANSFER_COMMENT) {
                setTransferComment(v.slice(0, MAX_TRANSFER_COMMENT));
                setTransferCommentError(
                  "Nội dung xử lý không được dài quá 2000 ký tự"
                );
              } else {
                setTransferComment(v);
                setTransferCommentError(null);
              }
            }}
            className="min-h-[64px] text-sm p-2"
          />
          {transferCommentError && (
            <p className="text-xs text-red-600 mt-1">{transferCommentError}</p>
          )}
        </div>
        <div className="mt-4 flex justify-end">
          <Button
            disabled={
              (dataMainChecked.length === 0 &&
                dataLeaderChecked.length === 0) ||
              !!transferCommentError
            }
            onClick={handleSubmit}
            className="text-white border-0 h-9 px-3 gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:text-white bg-[#4798e8] hover:bg-[#3a7bc8]"
          >
            <Redo2 className="w-4 h-4" />
            Gửi xử lý
          </Button>
        </div>
      </CustomDialogContent>
    </Dialog>
  );
}
