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
import {
  Upload,
  X,
  Send,
  Building2,
  User,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import { handleError, isExistFile } from "@/utils/common.utils";
import { getFileSizeString } from "@/utils/file.utils";
import { toast } from "@/hooks/use-toast";
import { Bpmn2Service } from "@/services/bpmn2.service";
import { OrganizationService } from "@/services/organization.service";
import { DelegateService } from "@/services/delegate.service";
import { DocumentInService } from "@/services/document-in.service";
import { Constant } from "@/definitions/constants/constant";
import DelegatedList from "../delegatedList";
import { ToastUtils } from "@/utils/toast.utils";

interface TreeNode {
  data: any;
  expanded?: boolean;
  children?: TreeNode[];
}

interface SelectedItem {
  type: "User" | "Org";
  id: string;
  name: string;
  positionName?: string;
  leaderId?: string;
  delegatedId?: string;
  delegatedName?: string;
}

interface OutTransferProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string | string[];
  fromUserId?: string;
  onSuccess?: () => void;
}

export default function OutTransfer({
  isOpen,
  onOpenChange,
  documentId,
  fromUserId,
  onSuccess,
}: OutTransferProps) {
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

  // Loading states
  const [userLoaded, setUserLoaded] = useState<boolean>(false);
  const [orgLoaded, setOrgLoaded] = useState<boolean>(false);

  // Delegated user selection states
  const [showDelegatedList, setShowDelegatedList] = useState<boolean>(false);
  const [currentRowData, setCurrentRowData] = useState<any>(null);
  const [currentPersonHandleType, setCurrentPersonHandleType] =
    useState<number>(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setTransferComment("");
      setSelectedFiles([]);
      setDataMainChecked([]);
      setValidFiles(true);
      setIsSubmitting(false);
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    try {
      // Load users by current node
      const users = await Bpmn2Service.getUsersByNode(
        Bpmn2Service.currentSelectedNodeID
      );
      const sortedUsers = users.sort(
        (a: any, b: any) => a.positionOrder - b.positionOrder
      );
      setUserList(sortedUsers);
      setUserLoaded(true);

      // Load organizations
      const orgs = await OrganizationService.getOrganizations({ active: true });
      setOrgList(orgs);
      setOrgLoaded(true);

      // Create tree structure
      createDataTree(orgs, sortedUsers);
    } catch (error) {
      handleError(error);
    }
  };

  const createDataTree = (orgs: any[], users: any[]) => {
    const processTreeData: TreeNode[] = [];
    const orgChildren: any[] = [];

    // Build organization tree
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
          if (parent.children) {
            checkParent(
              parent.children,
              listChildren.filter((child) => child.parentId !== parent.data.id)
            );
          }
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
    checkLeadExistInOrg(filteredTree);

    return filteredTree;
  };

  const getTreeByOrgID = (
    orgid: string,
    mainTree: TreeNode[]
  ): TreeNode | null => {
    for (let i = 0; i < mainTree.length; i++) {
      const parentTree = mainTree[i];
      if (searchTreeByID(orgid, parentTree)) {
        return parentTree;
      }
    }
    return null;
  };

  const searchTreeByID = (
    id: string,
    parentTree: TreeNode
  ): TreeNode | null => {
    if (id == parentTree.data.id) {
      return parentTree;
    }
    if (parentTree.children) {
      if (findOrgInChildren(id, parentTree.children)) {
        return parentTree;
      }
    }
    return null;
  };

  const findOrgInChildren = (id: string, childrenTree: TreeNode[]): boolean => {
    for (const element of childrenTree) {
      if (id == element.data.id && !element.data.hasOwnProperty("userName")) {
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

  const checkUserInOrgTree = (user: any, orgTree: TreeNode[]) => {
    for (const element of orgTree) {
      if (element) {
        if (
          user.org == element.data.id &&
          !element.data.hasOwnProperty("userName")
        ) {
          if (element.children) {
            if (!checkUserIsExistInTree(user.id, element.children)) {
              const userData = { data: user };
              element.children.unshift(userData);
            }
          } else {
            element.children = [];
            const userData = { data: user };
            element.children.unshift(userData);
          }
        } else if (element.children && element.children.length > 0) {
          checkUserInOrgTree(user, element.children);
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
        element.data.id == userID
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
          prettyOrgTree(showTree);
        } else if (node.children) {
          prettyOrgTree(node.children);
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
            (y) => y.data.hasOwnProperty("userName") && y.data.lead == true
          );
          x.data.haveLeader = !!child;
          if (x.data.haveLeader == true && child) {
            x.data.leaderId = child.data.id;
            x.data.leaderFullname = child.data.fullName;
            x.data.leaderPositionName = child.data.positionName;
          }
          checkLeadExistInOrg(x.children);
        }
      }
    });
  };

  const removeObjInTree = (
    obj: SelectedItem,
    tree: TreeNode[],
    type: number
  ) => {
    for (const element of tree) {
      if (
        (obj.type == "User" &&
          element.data.hasOwnProperty("userName") &&
          obj.id == element.data.id) ||
        (obj.type == "Org" &&
          !element.data.hasOwnProperty("userName") &&
          obj.leaderId == element.data.leaderId)
      ) {
        if (type == 0) {
          element.data.isMainChecked = false;
        }
        if (element.children) {
          removeObjInTree(obj, element.children, type);
        }
      } else if (element.children) {
        removeObjInTree(obj, element.children, type);
      }
    }
  };

  const mainRemove = (obj: SelectedItem) => {
    removeObjInTree(obj, showTree, 0);
    const newDataMainChecked = dataMainChecked.filter(
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
    setDataMainChecked(newDataMainChecked);
  };

  const displayDelegateListPopUp = (
    isChecked: boolean,
    rowData: any,
    delegateUsers: any[],
    personHandleType: number
  ) => {
    setCurrentRowData(rowData);
    setCurrentPersonHandleType(personHandleType);
    setShowDelegatedList(true);
  };

  const checkMainProcess = (isChecked: boolean, rowData: any) => {
    if (
      rowData.delegateUsers &&
      rowData.delegateUsers.length > 0 &&
      isChecked
    ) {
      displayDelegateListPopUp(
        isChecked,
        rowData,
        rowData.delegateUsers,
        Constant.PERSON_HANDLE_TYPE.MAIN
      );
    } else {
      chooseMain(isChecked, rowData);
    }
  };

  const chooseMain = (isChecked: boolean, rowData: any) => {
    const obj = rowData.hasOwnProperty("userName")
      ? {
          type: "User" as const,
          id: rowData.id,
          name: rowData.fullName,
          positionName: rowData.positionName,
        }
      : {
          type: "Org" as const,
          id: rowData.id,
          name: rowData.name,
          leaderId: rowData.leaderId,
        };

    if (isChecked) {
      if (dataMainChecked.length > 0) {
        mainRemove(dataMainChecked[0]);
      }
      setDataMainChecked([obj]);
    } else {
      const newDataMainChecked = dataMainChecked.filter(
        (item) => !(item.type == obj.type && item.id == obj.id)
      );
      setDataMainChecked(newDataMainChecked);
    }
  };

  const chooseDelegatedMain = (
    isChecked: boolean,
    rowData: any,
    delegatedUser: any
  ) => {
    const obj = {
      type: "User" as const,
      id: rowData.id,
      delegatedId: delegatedUser.delegateId,
      delegatedName: delegatedUser.fullName,
      name: `${delegatedUser.fullName} ủy quyền bởi ${rowData.fullName}`,
      positionName: rowData.positionName,
    };

    if (dataMainChecked.length > 0) {
      mainRemove(dataMainChecked[0]);
    }
    setDataMainChecked([obj]);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    // Validate file sizes
    const maxSize = 10 * 1024 * 1024; // 10MB
    const invalidFiles = Array.from(files).filter(
      (file) => file.size > maxSize
    );

    if (invalidFiles.length > 0) {
      setValidFiles(false);
      event.target.value = "";
      ToastUtils.error("Kích thước file không được vượt quá 10MB");
      return;
    }

    setValidFiles(true);
    const newFiles = Array.from(files).filter(
      (file) => !isExistFile(file.name, selectedFiles)
    );
    setSelectedFiles((prev) => [...prev, ...newFiles]);
    event.target.value = "";
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const doTransferHandleDocument = async () => {
    if (dataMainChecked.length === 0) {
      ToastUtils.error("Vui lòng chọn người xử lý chính");
      return;
    }

    setIsSubmitting(true);
    try {
      const main: string[] = [];
      dataMainChecked.forEach((x) => {
        if (x.type == "User") {
          main.push(x.id);
          if (x.delegatedId) {
            main.push(x.delegatedId);
          }
        } else {
          main.push(x.leaderId!);
        }
      });

      const params = {
        toUserId: main[0],
        delegateId: main[1] || "",
        nodeId: Bpmn2Service.currentSelectedNodeID,
      };

      if (Constant.MULTI_TRANSFER_H05) {
        const docIds = Array.isArray(documentId) ? documentId : [documentId];
        for (const docId of docIds) {
          await doTransferOne(docId, params);
        }
      } else {
        await doTransferOne(documentId as string, params);
      }
      ToastUtils.transferSuccess();

      onSuccess?.();
      onOpenChange(false);
    } catch (error) {
      handleError(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const doTransferOne = async (docId: string, params: any) => {
    await DocumentInService.doTransfer(
      parseInt(docId),
      params,
      transferComment
    );
  };

  const renderTreeTable = (
    nodes: TreeNode[],
    level: number = 0
  ): React.ReactNode => {
    return nodes.map((node, index) => (
      <React.Fragment key={`${node.data.id}-${index}`}>
        <tr className="hover:bg-gray-50">
          <td className="px-4 py-2">
            <div className="flex items-center">
              {node.children && node.children.length > 0 && (
                <button
                  type="button"
                  className="mr-2 p-1 hover:bg-gray-200 rounded"
                  onClick={() => {
                    const newTree = [...showTree];
                    toggleNodeExpanded(newTree, node.data.id);
                    setShowTree(newTree);
                  }}
                >
                  {node.expanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
              )}
              {!node.children && <div className="w-6" />}

              {node.data.name ? (
                <div className="flex items-center">
                  <Building2 className="w-4 h-4 text-red-500 mr-2" />
                  {node.data.name}
                </div>
              ) : (
                <div className="flex items-center">
                  <User className="w-4 h-4 text-blue-500 mr-2" />
                  {node.data.fullName}
                </div>
              )}
            </div>
          </td>
          <td className="px-4 py-2 text-center bg-red-50">
            {node.data.name && node.data.haveLeader == true && (
              <Checkbox
                checked={node.data.isMainChecked || false}
                onCheckedChange={(checked) => {
                  node.data.isMainChecked = checked;
                  checkMainProcess(checked as boolean, node.data);
                }}
              />
            )}
            {node.data.userName && (
              <Checkbox
                checked={node.data.isMainChecked || false}
                onCheckedChange={(checked) => {
                  node.data.isMainChecked = checked;
                  checkMainProcess(checked as boolean, node.data);
                }}
              />
            )}
          </td>
        </tr>
        {node.children &&
          node.expanded &&
          renderTreeTable(node.children, level + 1)}
      </React.Fragment>
    ));
  };

  const toggleNodeExpanded = (tree: TreeNode[], nodeId: string) => {
    for (const node of tree) {
      if (node.data.id === nodeId) {
        node.expanded = !node.expanded;
        return;
      }
      if (node.children) {
        toggleNodeExpanded(node.children, nodeId);
      }
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <CustomDialogContent className="max-w-6xl max-h-[90vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle>Chuyển xử lý</DialogTitle>
          </DialogHeader>

          {userLoaded && orgLoaded ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                {/* Organization Tree */}
                <div className="col-span-2">
                  <div
                    className="border rounded-lg overflow-hidden"
                    style={{ height: "400px" }}
                  >
                    <div className="overflow-auto h-full">
                      <table className="w-full">
                        <thead className="bg-gray-50 sticky top-0">
                          <tr>
                            <th className="px-4 py-2 text-left">
                              Tên đơn vị, cá nhân
                            </th>
                            <th className="px-4 py-2 text-center w-20">
                              Xử lý chính
                            </th>
                          </tr>
                        </thead>
                        <tbody>{renderTreeTable(showTree)}</tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Selected Items */}
                <div className="space-y-4">
                  <div
                    className="border rounded-lg overflow-hidden"
                    style={{ height: "400px" }}
                  >
                    <div className="bg-blue-50 px-4 py-2 border-b">
                      <span className="font-semibold text-blue-600">
                        Thông tin xử lý
                      </span>
                    </div>
                    <div className="p-2 overflow-auto h-full">
                      {dataMainChecked.length > 0 && (
                        <div className="space-y-2">
                          <div className="bg-white border rounded">
                            <div className="bg-gray-50 px-3 py-2 border-b">
                              <span className="font-medium">Xử lý chính</span>
                            </div>
                            <div className="p-2">
                              {dataMainChecked.map((item, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between py-1"
                                >
                                  <div className="flex items-center">
                                    {item.type === "User" ? (
                                      <User className="w-4 h-4 text-blue-500 mr-2" />
                                    ) : (
                                      <Building2 className="w-4 h-4 text-red-500 mr-2" />
                                    )}
                                    <span className="text-sm">{item.name}</span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => mainRemove(item)}
                                    className="text-red-500 hover:text-red-700 p-1"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Transfer Comment */}
              <div className="border rounded-lg">
                <div className="bg-blue-50 px-4 py-2 border-b">
                  <span className="font-semibold text-blue-600">
                    Nội dung xử lý
                  </span>
                </div>
                <div className="p-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="transferComment">
                        Nội dung chuyển xử lý
                      </Label>
                      <Textarea
                        id="transferComment"
                        value={transferComment}
                        onChange={(e) => setTransferComment(e.target.value)}
                        rows={3}
                        placeholder="Nhập nội dung chuyển xử lý..."
                        className="mt-1"
                      />
                    </div>

                    {/* File Upload */}
                    <div>
                      <Label htmlFor="fileUpload">Tệp đính kèm</Label>
                      <div className="mt-1">
                        <input
                          ref={fileInputRef}
                          type="file"
                          id="fileUpload"
                          multiple
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          Chọn tệp
                        </Button>
                        {!validFiles && (
                          <p className="text-red-500 text-sm mt-1">
                            Kích thước file không được vượt quá 10MB
                          </p>
                        )}
                        {selectedFiles.length > 0 && (
                          <div className="mt-2 space-y-1">
                            {selectedFiles.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center justify-between text-sm"
                              >
                                <span>
                                  {file.name} ({getFileSizeString(file.size)})
                                </span>
                                <button
                                  type="button"
                                  onClick={() => removeFile(index)}
                                  className="text-red-500 hover:text-red-700"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <div className="animate-spin rounded-full h-9 w-8 border-b-2 border-blue-500 mx-auto"></div>
                <p className="mt-2 text-gray-600">Đang tải dữ liệu...</p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={doTransferHandleDocument}
              disabled={dataMainChecked.length === 0 || isSubmitting}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Gửi xử lý
                </>
              )}
            </Button>
          </DialogFooter>
        </CustomDialogContent>
      </Dialog>

      {/* Delegated List Modal */}
      {showDelegatedList && (
        <DelegatedList
          isOpen={showDelegatedList}
          onOpenChange={setShowDelegatedList}
          delegatedUserList={currentRowData?.delegateUsers || []}
          personHandleType={currentPersonHandleType}
          onSelect={(result) => {
            if (result?.delegatedUser) {
              chooseDelegatedMain(true, currentRowData, result.delegatedUser);
            } else {
              chooseMain(true, currentRowData);
            }
          }}
          delegateType="OUT"
        />
      )}
    </>
  );
}
