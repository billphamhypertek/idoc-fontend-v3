"use client";

import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBase,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Building, User, Users } from "lucide-react";
import FilterField from "@/components/common/FilterFiled";
import { Constant } from "@/definitions/constants/constant";
import { useGetCategoriesByCode } from "@/hooks/data/category.data";
import {
  useGetAllUsers,
  useGetPositionsByOrgId,
} from "@/hooks/data/process.data";
import { CategoryCode } from "@/definitions/types/category.type";
import {
  ConditionProcess,
  PositionResponse,
  ProcessRequest,
  UserInformationProcess,
} from "@/definitions/types/process.type";
import { handleError } from "@/utils/common.utils";
import { ToastUtils } from "@/utils/toast.utils";
import { Column } from "@/definitions";
import OrganizationTreeDialog from "./OrganizationTreeDialog";
import { OrgUserTreeNode } from "@/definitions/types/orgunit.type";
import {
  useGetFormConfigListQuery,
  useGetFormConfigSimpleListQuery,
} from "@/hooks/data/form-config.data";
import { useGetAllModulesQuery } from "@/hooks/data/module.data";

interface ConfigNodeDialogProps {
  isOpen: boolean;
  onClose: (opened: boolean) => void;
  selectedTaskId: string;
  process: ProcessRequest;
  onUpdateProcess: (process: ProcessRequest) => void;
  type?: "process" | "workflow";
}

// Constants
const EVALUTE_BCY = true; // Replace with actual constant
const ORG_MULTI_TRANSFER_BCY = true; // Replace with actual constant
const IMPORT_DOC_BOOK_BCY = true; // Replace with actual constant

const MAX_NODE_NAME_LENGTH = 255;

const ConfigNodeDialog: React.FC<ConfigNodeDialogProps> = ({
  isOpen,
  onClose,
  selectedTaskId,
  process,
  onUpdateProcess,
  type = "process",
}) => {
  // State
  const [selectedTaskName, setSelectedTaskName] = useState("");
  const [nodeDescription, setNodeDescription] = useState("");
  const [allowMultiple, setAllowMultiple] = useState(false);
  const [reviewRequired, setReviewRequired] = useState(false);
  const [importDocBook, setImportDocBook] = useState(false);
  const [forceCloseBranch, setForceCloseBranch] = useState(false);
  const [calendarReview, setCalendarReview] = useState(false);
  const [signAppendix, setsignAppendix] = useState(false);
  const [checkButton, setCheckButton] = useState(false);
  const [nameButton, setNameButton] = useState("");
  const [selectedForm, setSelectedForm] = useState<string | undefined>(
    undefined
  );
  const [selectedModule, setSelectedModule] = useState<string | undefined>(
    undefined
  );
  const [selectedModuleName, setSelectedModuleName] = useState<string>("");
  const [showModuleSuggestions, setShowModuleSuggestions] = useState(false);

  const [dataMainChecked, setDataMainChecked] = useState<ConditionProcess[]>(
    []
  );
  const [positionsByOrg, setPositionsByOrg] = useState<PositionResponse[]>([]);
  const [positionsByOrgTotalRecord, setPositionsByOrgTotalRecord] =
    useState<number>(0);
  const [positionsByOrgTotalPage, setPositionsByOrgTotalPage] =
    useState<number>(0);
  const [currentOrgId, setCurrentOrgId] = useState<number>(0);
  const [currentPositionPage, setCurrentPositionPage] = useState<number>(1);
  const [currentPositionSelectedOrgId, setCurrentPositionSelectedOrgId] =
    useState<number[]>([]);
  const [selectedItems, setSelectedItems] = useState<OrgUserTreeNode[]>([]);
  // Modal states
  const [isUserOrgModalOpen, setIsUserOrgModalOpen] = useState(false);
  const [isPositionModalOpen, setIsPositionModalOpen] = useState(false);

  // Validation/Error state for node name
  const [nodeNameError, setNodeNameError] = useState("");
  const [nameButtonError, setNameButtonError] = useState("");

  const { data: orgTypeList } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.ORG_TYPE
  );
  const { data: users } = useGetAllUsers();
  const { mutate: getPositionsByOrgId } = useGetPositionsByOrgId();
  const params = {
    page: 1,
    size: 1000,
    text: "",
    categoryId: process?.categoryId || 0,
    active: true,
  };
  const { data: formConfigList } = useGetFormConfigSimpleListQuery(
    process?.categoryId?.toString() || "",
    ""
  );

  const { data: modules } = useGetAllModulesQuery(type === "workflow");

  // Pagination
  const [positionPaging, setPositionPaging] = useState({
    itemsPerPage: 10,
    currentPage: 1,
    totalRecord: 0,
  });

  // Filtered modules with hierarchy for search
  const filteredModules = React.useMemo(() => {
    if (!modules || modules.length === 0) return [];

    const searchValue = selectedModuleName?.toLowerCase() || "";
    if (!searchValue) return modules.filter((module) => !module.hide);

    // Filter modules and their submodules based on search
    return modules
      .filter((module) => !module.hide)
      .map((module) => {
        const moduleName = module.name?.toLowerCase() || "";
        const hasMatchingName = moduleName.includes(searchValue);

        let filteredSubModules: any[] = [];
        if (module.subModule && module.subModule.length > 0) {
          filteredSubModules = module.subModule.filter((sub: any) => {
            if (sub.hide) return false;
            const subName = sub.name?.toLowerCase() || "";
            const fullHierarchicalName = `${moduleName} > ${subName}`;
            return (
              subName.includes(searchValue) ||
              fullHierarchicalName.includes(searchValue)
            );
          });
        }

        // Include module if it has matching name or has matching submodules
        if (hasMatchingName || filteredSubModules.length > 0) {
          return {
            ...module,
            subModule:
              filteredSubModules.length > 0
                ? filteredSubModules
                : module.subModule,
          };
        }

        return null;
      })
      .filter(
        (module): module is NonNullable<typeof module> => module !== null
      );
  }, [modules, selectedModuleName]);

  // Module combobox handlers
  const handleModuleFocus = () => {
    setShowModuleSuggestions(true);
  };

  const handleModuleBlur = () => {
    setTimeout(() => setShowModuleSuggestions(false), 200);
  };

  const handleModuleSelect = (value?: string | undefined) => {
    if (value) {
      setSelectedModule(value);
    }
    setShowModuleSuggestions(false);
  };

  // Sync selectedModuleName with selectedModule
  React.useEffect(() => {
    if (selectedModule && modules) {
      // Find the module/submodule name by ID
      let moduleName = "";
      for (const m of modules) {
        if (m.hide) continue;

        if (m.subModule && m.subModule.length > 0) {
          const subModule = m.subModule.find(
            (sub: any) =>
              (sub.id || sub.moduleId)?.toString() === selectedModule &&
              !sub.hide
          );
          if (subModule) {
            moduleName = `${m.name} > ${subModule.name}`;
            break;
          }
        }

        if ((m.id || m.moduleId)?.toString() === selectedModule) {
          moduleName = m.name;
          break;
        }
      }
      setSelectedModuleName(moduleName);
    } else if (!selectedModule) {
      setSelectedModuleName("");
    }
  }, [selectedModule, modules]);

  // Initialize component
  useEffect(() => {
    if (isOpen && process) {
      setCurrentNodeAndConditions();
    }
  }, [isOpen, process, selectedTaskId]);
  const setCurrentNodeAndConditions = () => {
    if (!process?.nodes) return;

    const currentNode = process.nodes.find(
      (node) => node.ident === selectedTaskId
    );
    if (currentNode) {
      setSelectedTaskName(currentNode.name || "");
      setAllowMultiple(currentNode.allowMultiple || false);
      setReviewRequired(currentNode.reviewRequired || false);
      setImportDocBook(currentNode.importDocBook || false);
      setForceCloseBranch(currentNode.forceCloseBranch || false);
      setCalendarReview(currentNode.calendarReview || false);
      setsignAppendix(currentNode.signAppendix || false);
      setCheckButton((currentNode as any).checkButton || false);
      setNameButton((currentNode as any).nameButton || "");
      // Initialize dataMainChecked with current conditions
      const conditions = currentNode.conditions || [];
      setDataMainChecked(conditions);

      // Initialize form and menu
      setSelectedForm(
        (currentNode as any).formId
          ? (currentNode as any).formId.toString()
          : undefined
      );
      setSelectedModule(
        (currentNode as any).moduleId
          ? (currentNode as any).moduleId.toString()
          : undefined
      );
    }
  };

  const handleCheckboxChange = (field: string, value: boolean) => {
    switch (field) {
      case "allowMultiple":
        setAllowMultiple(value);
        break;
      case "reviewRequired":
        setReviewRequired(value);
        break;
      case "importDocBook":
        setImportDocBook(value);
        break;
      case "forceCloseBranch":
        setForceCloseBranch(value);
        break;
      case "calendarReview":
        setCalendarReview(value);
        break;
      case "signAppendix":
        setsignAppendix(value);
        break;
    }
  };

  const checkAllowConfig = (selectedUserOrOrg: ConditionProcess) => {
    setDataMainChecked((prev) =>
      prev.map((item) =>
        item.userId === selectedUserOrOrg.userId &&
        item.orgId === selectedUserOrOrg.orgId &&
        item.positionId === selectedUserOrOrg.positionId
          ? { ...item, allowConfig: !item.allowConfig }
          : item
      )
    );
  };

  const checkForceSameOrg = (selectedUserOrOrg: ConditionProcess) => {
    setDataMainChecked((prev) =>
      prev.map((item) =>
        item.userId === selectedUserOrOrg.userId &&
        item.orgId === selectedUserOrOrg.orgId &&
        item.positionId === selectedUserOrOrg.positionId
          ? { ...item, forceSameOrg: !item.forceSameOrg }
          : item
      )
    );
  };

  const handleSecurityChange = (
    selectedUserOrOrg: ConditionProcess,
    value: boolean
  ) => {
    setDataMainChecked((prev) =>
      prev.map((item) =>
        item.userId === selectedUserOrOrg.userId &&
        item.orgId === selectedUserOrOrg.orgId &&
        item.positionId === selectedUserOrOrg.positionId
          ? { ...item, security: value }
          : item
      )
    );
  };

  const handleOrgTypeChange = (
    selectedUserOrOrg: ConditionProcess,
    value: number
  ) => {
    setDataMainChecked((prev) =>
      prev.map((item) =>
        item.userId === selectedUserOrOrg.userId &&
        item.orgId === selectedUserOrOrg.orgId &&
        item.positionId === selectedUserOrOrg.positionId
          ? { ...item, orgType: value }
          : item
      )
    );
  };

  const uncheckSelectedUserOrOrg = (selectedUserOrOrg: ConditionProcess) => {
    setDataMainChecked((prev) =>
      prev.filter(
        (item) =>
          !(
            item.userId === selectedUserOrOrg.userId &&
            item.positionId === selectedUserOrOrg.positionId &&
            item.orgId === selectedUserOrOrg.orgId
          )
      )
    );
  };

  const openPositionModal = (orgId: string | number) => {
    setCurrentPositionPage(1);
    setCurrentOrgId(orgId as number);
    const currentPositionSelectedOrgId: number[] = [];
    dataMainChecked.forEach((item) => {
      if (item.orgId === orgId && item.positionId) {
        currentPositionSelectedOrgId.push(item.positionId as number);
      }
    });
    setCurrentPositionSelectedOrgId(currentPositionSelectedOrgId);
    getPositionsByOrgId(
      { orgId: orgId as number, page: 1 },
      {
        onSuccess: (data) => {
          setPositionsByOrg(data.objList);
          setPositionsByOrgTotalRecord(data.totalRecord);
          setPositionsByOrgTotalPage(data.totalPage);
        },
        onError: (error) => {
          setPositionsByOrg([]);
          setPositionsByOrgTotalRecord(0);
          setPositionsByOrgTotalPage(0);
          handleError(error);
        },
      }
    );

    setIsPositionModalOpen(true);
  };

  const handlePagePositionChange = (page: number) => {
    setCurrentPositionPage(page);
    getPositionsByOrgId(
      { orgId: currentOrgId, page: page },
      {
        onSuccess: (data) => {
          setPositionsByOrg(data.objList);
          setPositionsByOrgTotalRecord(data.totalRecord);
          setPositionsByOrgTotalPage(data.totalPage);
        },
        onError: (error) => {
          handleError(error);
        },
      }
    );
  };

  const isCheckedPosition = (
    positionId: number,
    currentPositionSelectedOrgId: number[]
  ) => {
    return currentPositionSelectedOrgId.includes(positionId);
  };

  const addOrRemovePosition = (position: PositionResponse) => {
    const isChecked = isCheckedPosition(
      position.positionId as number,
      currentPositionSelectedOrgId
    );

    if (isChecked) {
      setDataMainChecked((prev) =>
        prev.filter(
          (item) =>
            !(
              item.positionId === position.positionId &&
              item.orgId === position.orgId
            )
        )
      );
      setCurrentPositionSelectedOrgId(
        currentPositionSelectedOrgId.filter((id) => id !== position.positionId)
      );
    } else {
      const newPosition: ConditionProcess = {
        userId: null,
        positionId: position.positionId,
        positionName: position.positionName,
        orgName: position.orgName,
        orgId: position.orgId,
        active: true,
        allowConfig: false,
        forceSameOrg: false,
        security: false,
      };
      setDataMainChecked((prev) => [...prev, newPosition]);
      setCurrentPositionSelectedOrgId([
        ...currentPositionSelectedOrgId,
        position.positionId as number,
      ]);
    }
  };

  const saveInCurrentSelectedNode = () => {
    if (selectedTaskName.length > MAX_NODE_NAME_LENGTH) {
      setNodeNameError(
        `Tên node không được vượt quá ${MAX_NODE_NAME_LENGTH} ký tự.`
      );
      return;
    } else {
      setNodeNameError("");
    }

    if (type === "workflow" && !selectedModule) {
      ToastUtils.error("Vui lòng chọn module");
      return;
    }

    if (checkButton && !nameButton.trim()) {
      ToastUtils.error("Vui lòng nhập tên nút gửi khi đã chọn Hiển thị button");
      return;
    }

    if (!process?.nodes) return;
    const updatedProcess = {
      ...process,
      nodes: process.nodes.map((node) =>
        node.ident === selectedTaskId
          ? {
              ...node,
              name: selectedTaskName,
              allowMultiple,
              reviewRequired,
              importDocBook,
              calendarReview,
              signAppendix,
              forceCloseBranch,
              conditions: dataMainChecked,
              formId: selectedForm ? parseInt(selectedForm) : null,
              moduleId: selectedModule ? parseInt(selectedModule) : null,
              checkButton,
              nameButton,
            }
          : node
      ),
    };

    onUpdateProcess(updatedProcess);
    onClose(false);
  };

  const renderUserOrOrgIcon = (type: string) => {
    switch (type) {
      case "User":
        return <User className="w-4 h-4 text-blue-500" />;
      case "Org":
        return <Building className="w-4 h-4 text-red-500" />;
      case "Position":
        return <Users className="w-4 h-4 text-green-500" />;
      default:
        return null;
    }
  };

  const getUserNameById = (id: string | number) => {
    const user = users?.find((user) => user.id === id);
    return user?.fullName;
  };
  const getUserPositionNameById = (id: string | number) => {
    const user = users?.find((user) => user.id === id);
    return user?.positionName;
  };

  const handleSelectOrganization = (orgUser: OrgUserTreeNode) => {
    if (orgUser.type === "org") {
      const isChecked = selectedItems.some(
        (item) => item.orgId.toString() === orgUser.orgId.toString()
      );
      if (isChecked) {
        setSelectedItems(
          selectedItems.filter(
            (item) => item.orgId.toString() !== orgUser.orgId.toString()
          )
        );
        setDataMainChecked(
          dataMainChecked.filter(
            (item) => item.orgId?.toString() !== orgUser.orgId.toString()
          )
        );
      } else {
        setSelectedItems([...selectedItems, orgUser]);
        setDataMainChecked([
          ...dataMainChecked,
          {
            userId: null,
            orgId: Number(orgUser.orgId),
            orgName: orgUser.orgName,
            positionId: null,
            positionName: null,
            active: true,
            allowConfig: false,
            forceSameOrg: false,
            security: false,
          },
        ]);
      }
    } else {
      const isChecked = selectedItems.some(
        (item) => item.userId === orgUser.userId
      );
      if (isChecked) {
        setSelectedItems(
          selectedItems.filter((item) => item.userId !== orgUser.userId)
        );
        setDataMainChecked(
          dataMainChecked.filter((item) => item.userId !== orgUser.userId)
        );
      } else {
        setSelectedItems([...selectedItems, orgUser]);
        setDataMainChecked([
          ...dataMainChecked,
          {
            userId: orgUser.userId,
            orgId: Number(orgUser.orgId),
            orgName: orgUser.orgName,
            positionId: orgUser.positionId,
            positionName: orgUser.positionName,
            active: true,
            allowConfig: false,
            forceSameOrg: false,
            security: false,
          },
        ]);
      }
    }
  };

  const positionColumns: Column<PositionResponse>[] = [
    {
      header: "STT",
      className: "w-16 text-center border-r",
      accessor: (item: PositionResponse, index: number) => (
        <div className="flex items-center space-x-2">
          <Checkbox
            checked={isCheckedPosition(
              item.positionId,
              currentPositionSelectedOrgId
            )}
            onCheckedChange={() => addOrRemovePosition(item)}
          />
          <span className="text-sm">
            {(currentPositionPage - 1) * positionPaging.itemsPerPage +
              index +
              1}
          </span>
        </div>
      ),
    },
    {
      header: "Mã",
      accessor: (item: PositionResponse) => item.positionId,
      className: "w-10 text-center border-r",
    },
    {
      header: "Chức danh",
      className: "w-10 text-center border-r",
      accessor: (item: PositionResponse) => item.positionName,
    },
  ];
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center font-bold text-lg">
            Cấu Hình Thông Tin Node
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Node Configuration */}
          <Card>
            <CardContent className="p-4">
              <TableBase>
                <TableBody>
                  <TableRow className="bg-gray-50">
                    <TableCell className="font-medium">Tên Node</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Input
                          placeholder="Nhập tên node"
                          value={selectedTaskName}
                          onChange={(e) => {
                            setSelectedTaskName(e.target.value);
                            if (e.target.value.length <= MAX_NODE_NAME_LENGTH) {
                              setNodeNameError("");
                            } else {
                              setNodeNameError(
                                `Tên node không được vượt quá ${MAX_NODE_NAME_LENGTH} ký tự.`
                              );
                            }
                          }}
                          className={
                            nodeNameError
                              ? "border-red-500 focus:border-red-500 ring-red-500"
                              : ""
                          }
                        />
                        {nodeNameError && (
                          <span className="text-xs text-red-500">
                            {nodeNameError}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell></TableCell>
                  </TableRow>

                  {(ORG_MULTI_TRANSFER_BCY ||
                    EVALUTE_BCY ||
                    IMPORT_DOC_BOOK_BCY) &&
                  type === "workflow" ? (
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="forceCloseBranch"
                            checked={forceCloseBranch}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange(
                                "forceCloseBranch",
                                checked as boolean
                              )
                            }
                          />
                          <label
                            htmlFor="forceCloseBranch"
                            className="text-sm font-bold"
                          >
                            Hoàn thành
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="calendarReview"
                            checked={calendarReview}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange(
                                "calendarReview",
                                checked as boolean
                              )
                            }
                          />
                          <label
                            htmlFor="calendarReview"
                            className="text-sm font-bold"
                          >
                            Duyệt lịch
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="signAppendix"
                            checked={signAppendix}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange(
                                "signAppendix",
                                checked as boolean
                              )
                            }
                          />
                          <label
                            htmlFor="signAppendix"
                            className="text-sm font-bold"
                          >
                            Ký số
                          </label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="importDocBook"
                            checked={importDocBook}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange(
                                "importDocBook",
                                checked as boolean
                              )
                            }
                          />
                          <label
                            htmlFor="importDocBook"
                            className="text-sm font-bold"
                          >
                            Tiếp nhận
                          </label>
                        </div>
                        <div></div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="checkButton"
                              checked={checkButton}
                              onCheckedChange={(checked) => {
                                setCheckButton(checked as boolean);
                                if (!checked) {
                                  setNameButtonError("");
                                }
                              }}
                            />
                            <label
                              htmlFor="checkButton"
                              className="text-sm font-bold whitespace-nowrap"
                            >
                              Hiển thị button
                            </label>
                          </div>
                          <Input
                            placeholder="Nhập tên nút gửi"
                            value={nameButton}
                            onChange={(e) => setNameButton(e.target.value)}
                            disabled={!checkButton}
                            className="flex-1"
                          />
                        </div>
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  ) : (
                    <TableRow>
                      <TableCell></TableCell>
                      <TableCell className="space-y-2">
                        {ORG_MULTI_TRANSFER_BCY && (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="allowMultiple"
                              checked={allowMultiple}
                              onCheckedChange={(checked) =>
                                handleCheckboxChange(
                                  "allowMultiple",
                                  checked as boolean
                                )
                              }
                            />
                            <label
                              htmlFor="allowMultiple"
                              className="text-sm font-bold"
                            >
                              Chuyển nhiều đơn vị
                            </label>
                          </div>
                        )}
                        {EVALUTE_BCY && (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="reviewRequired"
                              checked={reviewRequired}
                              onCheckedChange={(checked) =>
                                handleCheckboxChange(
                                  "reviewRequired",
                                  checked as boolean
                                )
                              }
                            />
                            <label
                              htmlFor="reviewRequired"
                              className="text-sm font-bold"
                            >
                              Yêu cầu đánh giá
                            </label>
                          </div>
                        )}
                        {IMPORT_DOC_BOOK_BCY && (
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="importDocBook"
                              checked={importDocBook}
                              onCheckedChange={(checked) =>
                                handleCheckboxChange(
                                  "importDocBook",
                                  checked as boolean
                                )
                              }
                            />
                            <label
                              htmlFor="importDocBook"
                              className="text-sm font-bold"
                            >
                              Vào sổ văn bản
                            </label>
                          </div>
                        )}
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="forceCloseBranch"
                            checked={forceCloseBranch}
                            onCheckedChange={(checked) =>
                              handleCheckboxChange(
                                "forceCloseBranch",
                                checked as boolean
                              )
                            }
                          />
                          <label
                            htmlFor="forceCloseBranch"
                            className="text-sm font-bold"
                          >
                            Hoàn thành theo nhóm
                          </label>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="checkButton"
                              checked={checkButton}
                              onCheckedChange={(checked) => {
                                setCheckButton(checked as boolean);
                                if (!checked) {
                                  setNameButtonError("");
                                }
                              }}
                            />
                            <label
                              htmlFor="checkButton"
                              className="text-sm font-bold whitespace-nowrap"
                            >
                              Hiển thị button
                            </label>
                          </div>
                          <Input
                            placeholder="Nhập tên nút gửi"
                            value={nameButton}
                            onChange={(e) => setNameButton(e.target.value)}
                            disabled={!checkButton}
                            className="flex-1"
                          />
                        </div>
                      </TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </TableBase>
            </CardContent>
          </Card>

          {/* Form Configuration */}
          {type === "workflow" && (
            <Card>
              <CardHeader className="bg-gray-100">
                <CardTitle className="text-lg font-bold">
                  Cấu Hình Biểu Mẫu
                </CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Chọn Form</label>
                    <Select
                      value={selectedForm}
                      onValueChange={(value) => setSelectedForm(value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Chọn Form" />
                      </SelectTrigger>
                      <SelectContent>
                        {(formConfigList || []).map((form) => (
                          <SelectItem key={form.id} value={form.id.toString()}>
                            {form.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Chọn Module <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      {/* Search Input */}
                      <input
                        type="text"
                        value={selectedModuleName}
                        onChange={(e) => {
                          setSelectedModuleName(e.target.value);
                          // Clear selection if user clears the input
                          if (e.target.value === "") {
                            setSelectedModule(undefined);
                          }
                        }}
                        onFocus={() => setShowModuleSuggestions(true)}
                        onBlur={() =>
                          setTimeout(() => setShowModuleSuggestions(false), 200)
                        }
                        placeholder="Tìm kiếm Module..."
                        className="w-full h-9 px-3 border rounded-sm text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-400 border-gray-300"
                      />

                      {/* Clear button */}
                      {selectedModuleName && (
                        <button
                          type="button"
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500"
                          onClick={() => {
                            setSelectedModuleName("");
                            setSelectedModule(undefined);
                          }}
                        >
                          ✕
                        </button>
                      )}

                      {/* Dropdown with hierarchy */}
                      {showModuleSuggestions && filteredModules.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-sm shadow-lg max-h-48 overflow-y-auto">
                          {filteredModules.map((module) => {
                            if (!module || module.hide) return null;

                            // Check if module has visible submodules
                            const visibleSubModules =
                              module.subModule?.filter(
                                (sub: any) => !sub.hide
                              ) || [];

                            if (visibleSubModules.length > 0) {
                              // Module with submodules - show as group
                              return (
                                <div
                                  key={(
                                    module.id || module.moduleId
                                  )?.toString()}
                                  className="border-b border-gray-100 last:border-b-0"
                                >
                                  {/* Parent module - not clickable, bold */}
                                  <div className="px-3 py-2 bg-gray-50 text-sm font-semibold text-gray-700 cursor-default">
                                    {module.name}
                                  </div>
                                  {/* Child modules - clickable */}
                                  {visibleSubModules.map((subModule: any) => (
                                    <div
                                      key={(
                                        subModule.id || subModule.moduleId
                                      )?.toString()}
                                      className="px-6 py-2 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer"
                                      onMouseDown={() =>
                                        handleModuleSelect(
                                          (
                                            subModule.id || subModule.moduleId
                                          )?.toString()
                                        )
                                      }
                                    >
                                      {subModule.name}
                                    </div>
                                  ))}
                                </div>
                              );
                            } else {
                              // Standalone module - clickable
                              return (
                                <div
                                  key={(
                                    module.id || module.moduleId
                                  )?.toString()}
                                  className="px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 cursor-pointer"
                                  onMouseDown={() =>
                                    handleModuleSelect(
                                      (module.id || module.moduleId)?.toString()
                                    )
                                  }
                                >
                                  {module.name}
                                </div>
                              );
                            }
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Role Configuration */}
          <Card>
            <CardHeader className="bg-gray-100">
              <CardTitle className="text-lg font-bold">
                Cấu Hình Vai Trò
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <TableBase>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-16 text-center">STT</TableHead>
                      <TableHead>Đơn Vị</TableHead>
                      <TableHead>Chức Vụ</TableHead>
                      <TableHead>Họ Và Tên</TableHead>
                      <TableHead>Hạn xử lý văn bản</TableHead>
                      <TableHead className="text-center">
                        Chung đơn vị
                      </TableHead>
                      <TableHead className="text-center">Cấp đơn vị</TableHead>
                      {type !== "workflow" && (
                        <TableHead className="text-center">
                          Văn bản mật
                        </TableHead>
                      )}
                      <TableHead className="w-16 text-center">Xóa</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dataMainChecked.map((item, index) => (
                      <TableRow
                        key={`${item.userId}-${item.orgId}-${item.positionId || ""}`}
                      >
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center">
                            <Checkbox id={`checkbox-${index}`} />
                            <label
                              htmlFor={`checkbox-${index}`}
                              className="ml-2 text-sm"
                            >
                              {index + 1}
                            </label>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <span>{item.org?.name || item.orgName || ""}</span>
                          </div>
                        </TableCell>

                        <TableCell>
                          {item.userId ? (
                            getUserPositionNameById(item.userId)
                          ) : item.positionId ? (
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openPositionModal(item.orgId!)}
                              >
                                <Users className="w-4 h-4" />
                              </Button>
                              <span>
                                {item.position?.name || item.positionName || ""}
                              </span>
                            </div>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openPositionModal(item.orgId!)}
                            >
                              <Users className="w-4 h-4" />
                            </Button>
                          )}
                        </TableCell>

                        <TableCell>
                          {item.userId ? getUserNameById(item.userId) : ""}
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              checked={item.allowConfig}
                              onCheckedChange={() => checkAllowConfig(item)}
                            />
                            <span className="text-sm">Cho phép cấu hình</span>
                          </div>
                        </TableCell>

                        <TableCell className="text-center">
                          <Checkbox
                            checked={item.forceSameOrg}
                            onCheckedChange={() => checkForceSameOrg(item)}
                          />
                        </TableCell>

                        <TableCell className="text-center">
                          <Select
                            value={item.orgType?.toString() || "0"}
                            onValueChange={(value) =>
                              handleOrgTypeChange(item, Number(value))
                            }
                            disabled={item.userId ? true : false}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Chọn" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">Chọn</SelectItem>
                              {orgTypeList?.map((orgType: CategoryCode) => (
                                <SelectItem
                                  key={orgType.id}
                                  value={orgType.id?.toString() || ""}
                                >
                                  {orgType.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>

                        {type !== "workflow" && (
                          <TableCell className="text-center">
                            <Checkbox
                              checked={item.security || false}
                              onCheckedChange={(checked) =>
                                handleSecurityChange(item, checked as boolean)
                              }
                            />
                          </TableCell>
                        )}

                        <TableCell className="text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => uncheckSelectedUserOrOrg(item)}
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </TableBase>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex justify-center space-x-2 py-4">
            <Button
              variant="outline"
              onClick={() => {
                setSelectedItems(
                  dataMainChecked.map((item) => ({
                    orgId: item.orgId?.toString() || "",
                    userId: item.userId || 0,
                    type: item.userId ? "user" : "org",
                    orgName: item.orgName || "",
                    userName: item.userId
                      ? users?.find((user) => user.id === item.userId)
                          ?.userName || ""
                      : "",
                    fullName: item.userId
                      ? users?.find((user) => user.id === item.userId)
                          ?.fullName || ""
                      : "",
                    positionId: item.positionId || 0,
                    positionName: item.positionId
                      ? positionsByOrg.find(
                          (position) => position.positionId === item.positionId
                        )?.positionName || ""
                      : "",
                  }))
                );
                setIsUserOrgModalOpen(true);
              }}
            >
              Chọn Cá Nhân Đơn Vị
            </Button>
            <Button
              className="bg-blue-600 text-white hover:bg-blue-600"
              onClick={saveInCurrentSelectedNode}
            >
              Lưu
            </Button>
          </div>
        </div>

        {/* User/Organization Selection Modal */}
        <OrganizationTreeDialog
          isOpen={isUserOrgModalOpen}
          onClose={() => setIsUserOrgModalOpen(false)}
          onSelect={handleSelectOrganization}
          selectedItems={selectedItems}
          users={users || ([] as UserInformationProcess[])}
        />

        {/* Position Selection Modal */}
        <Dialog
          open={isPositionModalOpen}
          onOpenChange={setIsPositionModalOpen}
        >
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Chọn chức danh</DialogTitle>
            </DialogHeader>
            <div className="max-h-96 overflow-y-auto">
              <Table
                columns={positionColumns}
                dataSource={positionsByOrg}
                showPagination
                onPageChange={handlePagePositionChange}
                itemsPerPage={positionPaging.itemsPerPage}
                currentPage={currentPositionPage}
                totalItems={positionsByOrgTotalRecord}
                emptyText={
                  positionsByOrgTotalRecord === 0
                    ? "Không tồn tại chức danh trong đơn vị này"
                    : ""
                }
              />
            </div>
            <div className="flex justify-center">
              <Button
                onClick={() => {
                  setIsPositionModalOpen(false);
                  setCurrentPositionSelectedOrgId([]);
                  setCurrentPositionPage(1);
                  setPositionsByOrg([]);
                  setPositionsByOrgTotalRecord(0);
                  setPositionsByOrgTotalPage(0);
                }}
                className="bg-blue-600 text-white hover:bg-blue-600"
              >
                Xong
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </DialogContent>
    </Dialog>
  );
};

export default ConfigNodeDialog;
