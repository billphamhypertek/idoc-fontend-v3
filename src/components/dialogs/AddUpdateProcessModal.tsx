"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogContent,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";
import SelectCustom from "../common/SelectCustom";
import {
  Process,
  ProcessRequest,
  UserInformationProcess,
} from "@/definitions/types/process.type";
import { Input } from "../ui/input";
import { Checkbox } from "../ui/checkbox";
import DropdownTree from "../common/DropdownTree";
import { useGetAllOrganizationsQuery } from "@/hooks/data/clerical-org.data";
import { TreeNode } from "../common/OrgTreeSelect";
import OrganizationTreeDialog from "./OrganizationTreeDialog";
import { OrgUserTreeNode } from "@/definitions/types/orgunit.type";

const DOCUMENT_TYPES = [
  { id: "INCOMING", name: "Văn bản đến" },
  { id: "OUTCOMING", name: "Văn bản đi" },
  { id: "CONSULT", name: "Xin ý kiến văn bản đi" },
  { id: "WORD_EDITOR", name: "Soạn thảo văn bản" },
  { id: "EXAM_FOR_OTHERS", name: "Thử nghiệm" },
  { id: "CABINET_DRAFT", name: "Cabinet-Dự thảo" },
  { id: "ASSIGN", name: "Giao việc" },
];

const MAX_NAME_LENGTH = 100;

// MustBeAlphanumeric: reject special chars like <>@!#$%^&*()_+[]{}?:;|'"\,./~`-=
function isAlphanumeric(name: string) {
  const specialChars = "<>@!#$%^&*()_+[]{}?:;|'\"\\,./~`-=";
  for (const specialChar of specialChars) {
    if (name && name.includes(specialChar)) {
      return false;
    }
  }
  return true;
}

function isLengthMoreThan(numberLike: string) {
  return numberLike.toString().length > MAX_NAME_LENGTH;
}

// atLeastOneWord: must not be all numbers, must have at least 1 non-whitespace char
function isAtLeastOneWord(value: string) {
  if (
    value &&
    value.toString().trim().length > 0 &&
    Number.isNaN(Number(value.toString()))
  ) {
    return true;
  }
  return false;
}

interface AddUpdateProcessModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (process: ProcessRequest) => void;
  loading?: boolean;
  isEdit?: boolean;
  processData?: ProcessRequest | null;
  errorSubmit?: { [k: string]: string };
}

export default function AddUpdateProcessModal({
  isOpen,
  onOpenChange,
  onSave,
  loading = false,
  isEdit = false,
  processData,
  errorSubmit,
}: AddUpdateProcessModalProps) {
  const { data: organizations } = useGetAllOrganizationsQuery();
  const [isMounted, setIsMounted] = useState(false);
  const [isUserOrgModalOpen, setIsUserOrgModalOpen] = useState(false);
  const [selectedItems, setSelectedItems] = useState<OrgUserTreeNode[]>([]);
  const [formData, setFormData] = useState<ProcessRequest>({
    name: "",
    orgId: 2,
    orgName: "Ban Cơ yếu Chính phủ",
    typeDocument: "INCOMING",
    active: false,
    content: "",
    nodes: [],
    org: null,
    clientId: 0,
    createBy: 0,
    createDate: 0,
    startNodeIds: [],
  });
  // track "request is in progress" for handleSave, to fix update errors after async call
  const [internalErrors, setInternalErrors] = useState<{ [k: string]: string }>(
    {}
  );
  const [submitted, setSubmitted] = useState(false);

  // Track mounting for tree conversion
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (isEdit) {
        setFormData(processData as ProcessRequest);
        setSelectedItems([
          {
            type: "org",
            orgId: processData?.orgId?.toString() || "",
            orgName: processData?.org?.name || "",
            userId: null,
            userName: "",
            fullName: "",
            positionId: null,
            positionName: null,
          },
        ]);
      } else {
        setFormData({
          name: "",
          orgId: 2,
          orgName: "",
          typeDocument: "INCOMING",
          active: false,
          content: "",
          nodes: [],
          org: null,
          clientId: 0,
          createBy: 0,
          createDate: 0,
          startNodeIds: [],
        });
      }
      setSelectedItems([
        {
          type: "org",
          orgId: "2",
          orgName: "Ban Cơ yếu Chính phủ",
          userId: null,
          userName: "",
          fullName: "",
          positionId: null,
          positionName: null,
        },
      ]);
      setInternalErrors({});
      setSubmitted(false);
    }
  }, [isOpen, isEdit, processData]);

  // Whenever errorSubmit from parent changes (happens after async submit fails), update errors if form was submitted
  useEffect(() => {
    if (submitted && errorSubmit && Object.keys(errorSubmit).length > 0) {
      setInternalErrors(errorSubmit);
    }
  }, [errorSubmit, submitted]);

  const handleInputChange = (field: keyof Process, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setInternalErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const validate = () => {
    const name = formData.name || "";
    const orgName = selectedItems[0]?.orgName || "";
    const typeDocument = formData.typeDocument || "";
    const errorObj: { [k: string]: string } = {};

    if (!isAtLeastOneWord(name)) {
      errorObj.name = "Tên luồng phải chứa ít nhất 1 chữ cái";
    } else if (!isAlphanumeric(name)) {
      errorObj.name = "Tên luồng chỉ bao gồm chữ và số";
    } else if (isLengthMoreThan(name)) {
      errorObj.name = `Tên luồng không được dài quá ${MAX_NAME_LENGTH} ký tự`;
    }
    if (!orgName) {
      errorObj.orgName = "Phạm vi hoạt động không được để trống";
    }
    if (!typeDocument) {
      errorObj.typeDocument = "Loại đối tượng không được để trống";
    }
    return errorObj;
  };

  const handleSave = () => {
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setInternalErrors(newErrors);
      return;
    }
    setSubmitted(true);
    onSave(formData);
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

  const treeData = useMemo(() => {
    if (!isMounted || !organizations) return [];
    return convertToTree(organizations);
  }, [isMounted, organizations]);

  const handleSelectOrganization = (orgUser: OrgUserTreeNode) => {
    if (orgUser.type === "org") {
      handleInputChange("orgId", orgUser.orgId);
      const isChecked = selectedItems.some(
        (item) => item.orgId.toString() === orgUser.orgId.toString()
      );
      if (isChecked) {
        setSelectedItems(
          selectedItems.filter(
            (item) => item.orgId.toString() !== orgUser.orgId.toString()
          )
        );
      } else {
        setSelectedItems([orgUser]);
        setInternalErrors((prev) => ({ ...prev, orgName: "" }));
      }
    }
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[160vh] overflow-x-hidden">
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="font-bold">
                {isEdit ? "Cập nhật luồng" : "Thêm mới luồng"}
              </DialogTitle>
            </div>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="font-bold">
                  Tên luồng<span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  placeholder="Nhập tên luồng"
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  required
                  className={`h-9${internalErrors.name ? " border-red-500 focus:border-red-500 ring-red-500" : ""}`}
                  autoComplete="off"
                />
                {internalErrors.name && (
                  <div className="text-xs text-red-500 mt-1">
                    {internalErrors.name}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="typeDocument" className="font-bold">
                  Loại đối tượng<span className="text-red-500">*</span>
                </Label>
                <SelectCustom
                  options={DOCUMENT_TYPES.map((item: any) => ({
                    label: item.name,
                    value: item.id,
                  }))}
                  value={formData.typeDocument || ""}
                  onChange={(value: string | string[]) =>
                    handleInputChange("typeDocument", value)
                  }
                  placeholder="Chọn loại đối tượng"
                  className={`w-full h-9${internalErrors.typeDocument ? " border-red-500 focus:border-red-500 ring-red-500" : ""}`}
                />
                {internalErrors.typeDocument && (
                  <div className="text-xs text-red-500 mt-1">
                    {internalErrors.typeDocument}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="orgName" className="font-bold">
                  Phạm vị hoạt động<span className="text-red-500">*</span>
                </Label>
                <Input
                  value={selectedItems[0]?.orgName || ""}
                  onClick={(e) => {
                    e.preventDefault();
                    setIsUserOrgModalOpen(true);
                  }}
                  placeholder="-- Chọn đơn vị --"
                  className={`w-full h-9${internalErrors.orgName ? " border-red-500 focus:border-red-500 ring-red-500" : ""}`}
                />
                {internalErrors.orgName && (
                  <div className="text-xs text-red-500 mt-1">
                    {internalErrors.orgName}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="active" className="font-bold">
                    Hoạt động
                  </Label>
                  <Checkbox
                    id="active"
                    checked={formData.active}
                    onCheckedChange={(checked) =>
                      handleInputChange("active", checked)
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t pt-4">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 h-9"
            >
              {loading ? (
                "Đang lưu..."
              ) : (
                <>
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Lưu lại
                </>
              )}
            </Button>
            <Button
              className="h-9"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              <X className="w-4 h-4 mr-2" />
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <OrganizationTreeDialog
        isOpen={isUserOrgModalOpen}
        onClose={() => setIsUserOrgModalOpen(false)}
        onSelect={handleSelectOrganization}
        selectedItems={selectedItems}
        users={[] as UserInformationProcess[]}
      />
    </div>
  );
}
