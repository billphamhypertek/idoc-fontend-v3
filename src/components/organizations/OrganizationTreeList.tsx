"use client";

import { useEffect, useState, memo, useCallback } from "react";
import { ChevronRight, ChevronDown, Building2, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useOrgTree } from "@/hooks/data/dashboard.data";
import { OrgTreeNode } from "@/definitions/types/orgunit.type";
import { Button } from "../ui/button";
import OrganizationModal from "./OrganizationModal";

interface OrganizationTreeListProps {
  onSelectOrganization?: (org: OrgTreeNode) => void;
  selectedOrgId?: string;
  setTreeData?: (tree: any) => void;
  refreshTrigger?: number;
}

function OrganizationTreeList({
  onSelectOrganization,
  selectedOrgId,
  setTreeData,
  refreshTrigger,
}: OrganizationTreeListProps) {
  const { tree, isLoading, refetch } = useOrgTree();
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [createOrganizationModalOpen, setCreateOrganizationModalOpen] =
    useState(false);

  useEffect(() => {
    if (setTreeData) {
      setTreeData(tree);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tree]);

  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0) {
      refetch();
    }
  }, [refreshTrigger, refetch]);

  const toggleExpand = useCallback((orgId: string) => {
    setExpandedNodes((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(orgId)) {
        newSet.delete(orgId);
      } else {
        newSet.add(orgId);
      }
      return newSet;
    });
  }, []);

  const handleClickOrganization = useCallback(
    (org: OrgTreeNode) => {
      if (onSelectOrganization) {
        onSelectOrganization(org);
      }
    },
    [onSelectOrganization]
  );

  const TreeNode = ({
    node,
    level = 0,
  }: {
    node: OrgTreeNode;
    level?: number;
  }) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedOrgId === node.id;

    return (
      <div className="w-full">
        <div
          className={`flex items-center gap-2 py-2 px-2 cursor-pointer border-b ${
            isSelected ? "bg-blue-50 border-l-4 border-blue-500" : ""
          }`}
          style={{ paddingLeft: `${level * 20 + 8}px` }}
          onClick={() => handleClickOrganization(node)}
        >
          {hasChildren && (
            <Button
              className="p-0 h-4 w-4 flex items-center justify-center hover:bg-transparent hover:text-black bg-transparent border-none outline-none shadow-none text-black"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpand(node.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          )}
          {!hasChildren && <span className="w-4" />}
          <Building2 className="w-4 h-4 text-blue-600" />
          <span
            className={`text-sm break-all ${
              isSelected ? "font-semibold text-blue-700" : ""
            }`}
          >
            {node.name}
          </span>
        </div>
        {hasChildren && isExpanded && (
          <div>
            {node.children?.map((child) => (
              <TreeNode key={child.id} node={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full space-y-4">
      <div className="flex flex-col">
        <h2 className="text-lg font-bold">Đơn vị</h2>
        <p className="text-sm text-gray-500">Thông tin đơn vị</p>
      </div>
      <Card className="rounded-none">
        <CardContent className="py-6 px-3 flex flex-col space-y-4 items-center">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 text-sm font-medium w-fit"
            onClick={() => setCreateOrganizationModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm mới
          </Button>
          <div className="space-y-1 border w-full">
            {tree && tree.length > 0 ? (
              tree.map((org) => <TreeNode key={org.id} node={org} />)
            ) : (
              <p className="text-center text-gray-500 text-sm py-4 b">
                Không có dữ liệu đơn vị
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <OrganizationModal
        isOpen={createOrganizationModalOpen}
        onOpenChange={setCreateOrganizationModalOpen}
        onSuccess={() => {
          setCreateOrganizationModalOpen(false);
          refetch();
        }}
        isAddRootOrg={true}
      />
    </div>
  );
}

export default memo(OrganizationTreeList);
