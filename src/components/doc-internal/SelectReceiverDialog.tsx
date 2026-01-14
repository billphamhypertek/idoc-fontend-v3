"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  CustomDialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronRight, ChevronDown, Building2, User, X } from "lucide-react";
import { useGetAllUserByParentIdOrg } from "@/hooks/data/organization.data";
import {
  TableBase,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TreeNode {
  data: {
    parent: number | null;
    child: number;
    name: string;
    type: number; // 0: org, 1: user
    isMainChecked?: boolean;
    isToKnowChecked?: boolean;
    disabled?: boolean;
  };
  expanded?: boolean;
  children?: TreeNode[];
}

interface ReceiverItem {
  parent: null;
  child: number;
  name: string;
  type: "ORG" | "USER";
  positionName?: string;
}

interface SelectReceiverDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  mainReceivers: ReceiverItem[];
  toKnowReceivers: ReceiverItem[];
  onConfirm: (main: ReceiverItem[], toKnow: ReceiverItem[]) => void;
}

export function SelectReceiverDialog({
  isOpen,
  onOpenChange,
  mainReceivers,
  toKnowReceivers,
  onConfirm,
}: SelectReceiverDialogProps) {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [mainChecked, setMainChecked] = useState<any[]>([]);
  const [toKnowCheck, setToKnowCheck] = useState<any[]>([]);

  // Gọi API với type = 1 giống Angular select-org-process
  const { data: orgListData = [], isLoading } = useGetAllUserByParentIdOrg(1);

  useEffect(() => {
    if (isOpen && orgListData.length > 0) {
      // Map data với isMainChecked và isToKnowChecked
      const listTree = orgListData.map((item: any) => ({
        ...item,
        isMainChecked: mainReceivers.some((r) => r.child === item.child),
        isToKnowChecked: toKnowReceivers.some((r) => r.child === item.child),
      }));

      setMainChecked([...mainReceivers]);
      setToKnowCheck([...toKnowReceivers]);
      createDataTree(listTree);
    }
  }, [isOpen, orgListData, mainReceivers, toKnowReceivers]);

  const createDataTree = (listTree: any[]) => {
    const orgChildren: any[] = [];
    const processTreeData: TreeNode[] = [];

    // Tách parent và children
    for (let i = 0; i < listTree.length; i++) {
      if (listTree[i].parent == null) {
        const dataTree: TreeNode = {
          data: listTree[i],
          expanded: true,
          children: [],
        };
        processTreeData.push(dataTree);
      } else {
        orgChildren.push(listTree[i]);
      }
    }

    // Build tree structure
    const allParent: TreeNode[] = orgChildren.map((child) => ({
      data: child,
      expanded: true,
      children: [],
    }));

    allParent.unshift(...processTreeData);
    const mapId: Record<number, TreeNode> = {};

    allParent.forEach((parent) => {
      mapId[parent.data.child] = parent;
    });

    allParent.forEach((child) => {
      if (child.data.parent !== null) {
        const parent = mapId[child.data.parent];
        if (parent) {
          parent.children = parent.children || [];
          parent.children.push(child);
        }
      }
    });

    setTreeData(processTreeData);
  };

  const toggleExpand = (node: TreeNode) => {
    const updateNode = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map((n) => {
        if (n.data.child === node.data.child) {
          return { ...n, expanded: !n.expanded };
        }
        if (n.children) {
          return { ...n, children: updateNode(n.children) };
        }
        return n;
      });
    };
    setTreeData(updateNode(treeData));
  };

  const removeItem = (list: any[], item: any) => {
    return list.filter((i) => i.child !== item.child);
  };

  const handleCheckMainProcess = (node: TreeNode) => {
    const newIsMainChecked = !node.data.isMainChecked;

    // Update tree data
    const updateNode = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map((n) => {
        if (n.data.child === node.data.child) {
          return {
            ...n,
            data: {
              ...n.data,
              isMainChecked: newIsMainChecked,
              isToKnowChecked: false, // Uncheck toKnow khi check main
            },
          };
        }
        if (n.children) {
          return { ...n, children: updateNode(n.children) };
        }
        return n;
      });
    };
    setTreeData(updateNode(treeData));

    // Update lists
    if (newIsMainChecked) {
      setToKnowCheck((prev) => removeItem(prev, node.data));
      setMainChecked((prev) => [...prev, node.data]);
    } else {
      setMainChecked((prev) => removeItem(prev, node.data));
    }
  };

  const handleCheckToKnowProcess = (node: TreeNode) => {
    const newIsToKnowChecked = !node.data.isToKnowChecked;

    // Update tree data
    const updateNode = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map((n) => {
        if (n.data.child === node.data.child) {
          return {
            ...n,
            data: {
              ...n.data,
              isMainChecked: false, // Uncheck main khi check toKnow
              isToKnowChecked: newIsToKnowChecked,
            },
          };
        }
        if (n.children) {
          return { ...n, children: updateNode(n.children) };
        }
        return n;
      });
    };
    setTreeData(updateNode(treeData));

    // Update lists
    if (newIsToKnowChecked) {
      setMainChecked((prev) => removeItem(prev, node.data));
      setToKnowCheck((prev) => [...prev, node.data]);
    } else {
      setToKnowCheck((prev) => removeItem(prev, node.data));
    }
  };

  const handleConfirm = () => {
    const convertType = (item: any) => ({
      ...item,
      type:
        typeof item.type === "number"
          ? item.type === 0
            ? "ORG"
            : "USER"
          : item.type,
    });
    const main = mainChecked.map(convertType);
    const toKnow = toKnowCheck.map(convertType);
    onConfirm(main, toKnow);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const renderTreeNode = (node: TreeNode, level: number = 0): JSX.Element => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = node.expanded;
    const paddingLeft = level * 20 + 12;
    const isUser = node.data.type === 1;

    return (
      <>
        <TableRow key={node.data.child} className="hover:bg-gray-50">
          <TableCell className="px-2 py-2 text-sm">
            <div
              className="flex items-center"
              style={{ paddingLeft: `${paddingLeft}px` }}
            >
              {/* Toggle Button */}
              <button
                onClick={() => toggleExpand(node)}
                className="w-4 h-4 flex items-center justify-center mr-1"
              >
                {hasChildren ? (
                  isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )
                ) : (
                  <span className="w-4 h-4"></span>
                )}
              </button>

              {/* Icon */}
              {!isUser ? (
                <Building2 className="w-4 h-4 text-red-500 mx-1" />
              ) : (
                <User className="w-4 h-4 text-blue-600 mx-1" />
              )}

              {/* Name */}
              <span>{node.data.name}</span>
            </div>
          </TableCell>

          {/* Main Checkbox - chỉ hiển thị cho user */}
          <TableCell className="text-center bg-[rgba(219,28,14,0.096)] w-32">
            {isUser && (
              <Checkbox
                checked={node.data.isMainChecked || false}
                onCheckedChange={() => handleCheckMainProcess(node)}
                disabled={node.data.disabled}
              />
            )}
          </TableCell>

          {/* ToKnow Checkbox - chỉ hiển thị cho user */}
          <TableCell className="text-center bg-[rgba(58,222,228,0.096)] w-32">
            {isUser && (
              <Checkbox
                checked={node.data.isToKnowChecked || false}
                onCheckedChange={() => handleCheckToKnowProcess(node)}
                disabled={node.data.disabled}
              />
            )}
          </TableCell>
        </TableRow>

        {/* Children */}
        {isExpanded &&
          hasChildren &&
          node.children!.map((child) => renderTreeNode(child, level + 1))}
      </>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <CustomDialogContent>
        <DialogHeader className="relative">
          <div className="flex items-center justify-between">
            <DialogTitle>Danh sách người nhận</DialogTitle>
            <Button
              variant="ghost"
              onClick={handleCancel}
              className="h-9 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto border rounded-lg">
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-9 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : treeData.length === 0 ? (
            <div className="flex items-center justify-center p-8 text-gray-500">
              Không có dữ liệu
            </div>
          ) : (
            <TableBase>
              <TableHeader className="sticky top-0 bg-[#E6F1FC]">
                <TableRow>
                  <TableHead className="px-4 py-3 text-center text-sm font-bold">
                    Phòng ban - Nhân viên
                  </TableHead>
                  <TableHead className="px-4 py-3 text-center text-sm font-bold w-32">
                    Thực hiện
                  </TableHead>
                  <TableHead className="px-4 py-3 text-center text-sm font-bold w-32">
                    Xem để biết
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {treeData.map((node) => renderTreeNode(node, 0))}
              </TableBody>
            </TableBase>
          )}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <Button
            onClick={handleConfirm}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            Chọn
          </Button>
          <Button variant="outline" onClick={handleCancel}>
            Hủy
          </Button>
        </div>
      </CustomDialogContent>
    </Dialog>
  );
}
