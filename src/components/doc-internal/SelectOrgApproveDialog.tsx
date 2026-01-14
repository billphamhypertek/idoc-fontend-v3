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
    check?: boolean;
  };
  expanded?: boolean;
  children?: TreeNode[];
}

interface OrgItem {
  parent: null;
  child: number;
  name: string;
  type: number | string; // 0 or 'ORG', 1 or 'USER'
  positionName?: string;
}

interface SelectOrgApproveDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedOrgs: OrgItem[];
  onConfirm: (orgs: OrgItem[]) => void;
}

export function SelectOrgApproveDialog({
  isOpen,
  onOpenChange,
  selectedOrgs,
  onConfirm,
}: SelectOrgApproveDialogProps) {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);
  const [mainChecked, setMainChecked] = useState<any[]>([]);

  // Gọi API với type = 3 giống Angular select-user-in-org
  const { data: orgListData = [], isLoading } = useGetAllUserByParentIdOrg(3);

  useEffect(() => {
    if (isOpen && orgListData.length > 0) {
      // Map selected orgs to have check property
      const listTree = orgListData.map((item: any) => ({
        ...item,
        check: selectedOrgs.some((org) => org.child === item.child),
      }));

      setMainChecked([...selectedOrgs]);
      createDataTree(listTree);
    }
  }, [isOpen, orgListData, selectedOrgs]);

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
      expanded: false,
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

  const handleCheckMainProcess = (node: TreeNode) => {
    // Toggle check
    const newCheck = !node.data.check;

    // Update tree data
    const updateNode = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map((n) => {
        if (n.data.child === node.data.child) {
          return { ...n, data: { ...n.data, check: newCheck } };
        }
        if (n.children) {
          return { ...n, children: updateNode(n.children) };
        }
        return n;
      });
    };
    setTreeData(updateNode(treeData));

    // Update mainChecked list
    if (newCheck) {
      setMainChecked((prev) => [...prev, node.data]);
    } else {
      setMainChecked((prev) =>
        prev.filter((item) => item.child !== node.data.child)
      );
    }
  };

  const handleConfirm = () => {
    // Convert type to string format like Angular: type > 0 ? 'USER' : 'ORG'
    const result = mainChecked.map((item) => ({
      ...item,
      type: item.type > 0 ? "USER" : "ORG",
    }));
    onConfirm(result);
    onOpenChange(false);
  };

  const handleCancel = () => {
    onOpenChange(false);
  };

  const renderTreeNode = (node: TreeNode, level: number = 0): JSX.Element => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = node.expanded;
    const paddingLeft = level * 20 + 12;

    return (
      <>
        <TableRow key={node.data.child} className="hover:bg-gray-50">
          {/* Cột 1: Phòng ban */}
          <TableCell className="px-2 py-2 text-sm">
            <div
              className="flex items-center"
              style={{ paddingLeft: `${paddingLeft}px` }}
            >
              {/* Nút toggle */}
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
              {node.data.type !== 1 ? (
                <Building2 className="w-4 h-4 text-red-500 mx-1" />
              ) : (
                <User className="w-4 h-4 text-blue-600 mx-1" />
              )}

              {/* Tên phòng ban / user */}
              <span>{node.data.name}</span>
            </div>
          </TableCell>

          {/* Cột 2: Checkbox phê duyệt */}
          <TableCell className="text-center bg-[rgba(219,28,14,0.096)] w-32">
            <Checkbox
              checked={node.data.check || false}
              onCheckedChange={() => handleCheckMainProcess(node)}
            />
          </TableCell>
        </TableRow>

        {/* Render con */}
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
            <DialogTitle>Người cho ý kiến</DialogTitle>
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
          <div className="max-h-[400px] overflow-y-auto">
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
                      Phòng ban
                    </TableHead>
                    <TableHead className="px-4 py-3 text-center text-sm font-bold w-32">
                      Phê duyệt
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {treeData.map((node) => renderTreeNode(node, 0))}
                </TableBody>
              </TableBase>
            )}
          </div>
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
