"use client";

import React, {
  useState,
  useMemo,
  useCallback,
  useRef,
  useEffect,
} from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  CustomDialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileCheck, X, ChevronDown } from "lucide-react";
import { ClericalOrg } from "@/definitions/types/clerical-org.type";
import OrgTreeSelect, { TreeNode } from "../common/OrgTreeSelect";
import { Organization } from "@/definitions/types/task-assign.type";
import { cn } from "@/lib/utils";

interface ClericalOrgUpdateModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (clericalOrg: ClericalOrg) => void;
  clericalOrgData: ClericalOrg;
  isEdit?: boolean;
  loading?: boolean;
  organizations: Organization[];
}

export default function ClericalOrgUpdateModal({
  isOpen,
  onOpenChange,
  onSave,
  clericalOrgData,
  isEdit = false,
  loading = false,
  organizations,
}: ClericalOrgUpdateModalProps) {
  const [formData, setFormData] = useState<ClericalOrg>(clericalOrgData);

  const handleInputChange = (field: keyof ClericalOrg, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    onSave(formData);
    onOpenChange(false);
  };

  const convertToTree = (orgs: any[]): TreeNode[] => {
    if (!orgs) return [];

    const orgMap = new Map();
    const rootNodes: TreeNode[] = [];

    // Create map of all organizations
    orgs.forEach((org) => {
      orgMap.set(org.id, {
        id: org.id,
        name: org.name,
        parentId: org.parentId,
        children: [],
      });
    });

    // Build tree structure
    orgs.forEach((org) => {
      const node = orgMap.get(org.id);
      if (org.parentId && orgMap.has(org.parentId)) {
        const parent = orgMap.get(org.parentId);
        parent.children.push(node);
      } else {
        rootNodes.push(node);
      }
    });

    return rootNodes;
  };

  // Flatten tree to get all nodes
  const flattenTree = useCallback((nodes: TreeNode[]): TreeNode[] => {
    let result: TreeNode[] = [];
    nodes.forEach((node) => {
      result.push(node);
      if (node.children && node.children.length > 0) {
        result = result.concat(flattenTree(node.children));
      }
    });
    return result;
  }, []);

  // Get selected organizations
  const selectedOrgs = useMemo(() => {
    if (
      !formData.orgIds ||
      !Array.isArray(formData.orgIds) ||
      formData.orgIds.length === 0
    ) {
      return [];
    }
    const allNodes = flattenTree(convertToTree(organizations || []));
    return allNodes.filter((node) => formData.orgIds.includes(node.id));
  }, [formData.orgIds, organizations, flattenTree]);

  // Handle remove single organization
  const handleRemoveOrg = (orgId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const currentValue = Array.isArray(formData.orgIds) ? formData.orgIds : [];
    const newValue = currentValue.filter((id) => id !== orgId);
    handleInputChange("orgIds", newValue);
  };

  // Handle remove all organizations
  const handleRemoveAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    handleInputChange("orgIds", []);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <CustomDialogContent className="sm:max-w-[704px] max-h-[90vh] overflow-y-auto overflow-x-hidden">
        <DialogHeader className="text-black -m-6 mb-0 p-4 rounded-t-lg">
          <div className="flex items-center relative">
            <DialogTitle className="text-black flex-1 text-left border-b py-3 flex items-center">
              Cấp quyền văn thư đơn vị
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-gray-600 hover:bg-gray-100 p-1 h-auto flex items-center justify-center ml-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 min-w-0">
            <div className="space-y-2 min-w-0">
              <Label htmlFor="fullName" className="font-semibold">
                Họ và tên
              </Label>
              <Input
                id="fullName"
                value={formData.userInfo.fullName || ""}
                placeholder="Nhập họ và tên"
                disabled
                className="bg-gray-200 text-black min-w-0 w-full h-10 leading-10"
              />
            </div>

            <div className="space-y-2 min-w-0">
              <Label htmlFor="positionName" className="font-semibold">
                Chức vụ
              </Label>
              <Input
                id="positionName"
                value={formData.userInfo.positionName || ""}
                placeholder="Nhập chức vụ"
                disabled
                className="bg-gray-200 text-black min-w-0 w-full h-10 leading-10"
              />
            </div>

            {/* Đường dẫn */}
            <div className="space-y-2 min-w-0">
              <Label htmlFor="orgName" className="font-semibold">
                Đơn vị
              </Label>
              <Input
                id="orgName"
                value={formData.userInfo.orgName || ""}
                placeholder="Nhập đơn vị"
                disabled
                className="bg-gray-200 text-black min-w-0 w-full h-10 leading-10"
              />
            </div>

            {/* Đường dẫn */}
            <div className="space-y-2 min-w-0 md:col-span-2">
              <Label htmlFor="orgIds" className="font-semibold">
                Đơn vị được phân quyền
              </Label>
              <div className="relative group">
                <OrgTreeSelect
                  value={formData.orgIds}
                  onChange={(value) => handleInputChange("orgIds", value)}
                  dataSource={convertToTree(organizations || [])}
                  placeholder="Chọn đơn vị"
                  multiple={true}
                  className={cn(
                    "text-black min-w-0 w-full",
                    selectedOrgs.length > 0 &&
                      "[&>div:first-child]:relative [&>div:first-child]:h-auto [&>div:first-child]:min-h-[40px] [&>div:first-child]:py-2 [&>div:first-child>span]:opacity-0"
                  )}
                />
                {/* Custom labels overlay - positioned to match only the input display div (first child) */}
                {selectedOrgs.length > 0 && (
                  <div
                    className="absolute top-0 left-0 w-full pointer-events-none"
                    style={{
                      zIndex: 1,
                      height: "40px",
                    }}
                  >
                    <div className="relative w-full h-full">
                      <div className="absolute inset-0 flex items-center px-3 py-2 gap-2 flex-wrap overflow-x-auto overflow-y-hidden pr-10 pointer-events-none">
                        {selectedOrgs.map((org) => (
                          <div
                            key={org.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-md text-sm pointer-events-auto flex-shrink-0"
                          >
                            <span className="whitespace-nowrap">
                              {org.name}
                            </span>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveOrg(org.id, e);
                              }}
                              className="hover:bg-blue-200 rounded p-0.5 transition-colors flex-shrink-0"
                              title="Xóa"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                      {/* Clear all button on hover */}
                      <button
                        type="button"
                        onClick={handleRemoveAll}
                        className="absolute right-8 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-200 rounded pointer-events-auto z-20"
                        title="Xóa tất cả"
                      >
                        <X className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="border-t pt-4">
          <Button
            onClick={handleSave}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 min-w-0"
          >
            {loading ? (
              "Đang lưu..."
            ) : (
              <>
                <FileCheck className="w-4 h-4 mr-2" />
                Đồng ý
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="min-w-0"
          >
            <X className="w-4 h-4 mr-2" />
            Đóng
          </Button>
        </DialogFooter>
      </CustomDialogContent>
    </Dialog>
  );
}
