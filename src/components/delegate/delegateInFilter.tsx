"use client";

import {
  RotateCcw,
  Search,
  Calendar,
  Share,
  Building,
  CheckSquare,
  Reply,
  ArrowLeft,
  ChevronDown,
  CornerUpRight,
} from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useState } from "react";
import { Label } from "../ui/label";
import SelectCustom from "../common/SelectCustom";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Search as SearchIcon } from "lucide-react";
import { useGetCategoriesByCode } from "@/hooks/data/category.data";
import { Constant } from "@/definitions/constants/constant";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { SharedService } from "@/services/shared.service";

interface DelegateInFilterProps {
  onSearch?: (searchData: any) => void;
  onAdvancedSearch?: (searchData: any) => void;
  isAdvanceSearch?: boolean;
  onToggleAdvanceSearch?: (isAdvance: boolean) => void;
  onResetSearch?: () => void;
  onResetAdvancedFields?: () => void;
  buttonStatus?: {
    hideAll: boolean;
    rejectButton: boolean;
    doneButton: boolean;
    transferButton: boolean;
    retakeByStep: boolean;
    retakeButton: boolean;
    evaluteRequestButton: boolean;
    evaluteButton: boolean;
  };
  currentTab?: string;
  currentDocumentId?: any;
  currentDocument?: any;
  currentDeadline?: any;
  nodeStart?: any;
  listNextNode?: any[];
  listNextNodeOrg?: any[];
  getCurrentDocumentId?: () => string | null;
  isOrgTransferStatus?: (docId: string) => boolean;
  isCanFinishReceive?: (docId: string) => boolean;
  onOpenDeadlinePopup?: () => void;
  onOpenTransferPopup?: (node?: any) => void;
  onOpenOrgTransferPopup?: (node?: any) => void;
  onOpenProcessDonePopup?: (isFinishReceive: boolean) => void;
  onOpenRetakePopup?: (document?: any) => void;
  onOpenRejectPopup?: () => void;
  onOpenRetakeByStepPopup?: () => void;
}

export default function DelegateInFilter({
  onSearch,
  onAdvancedSearch,
  isAdvanceSearch = false,
  onToggleAdvanceSearch,
  onResetSearch,
  onResetAdvancedFields,
  buttonStatus,
  currentTab,
  currentDocumentId,
  currentDocument,
  currentDeadline,
  nodeStart,
  listNextNode,
  listNextNodeOrg,
  getCurrentDocumentId,
  isOrgTransferStatus,
  isCanFinishReceive,
  onOpenDeadlinePopup,
  onOpenTransferPopup,
  onOpenOrgTransferPopup,
  onOpenProcessDonePopup,
  onOpenRetakePopup,
  onOpenRejectPopup,
  onOpenRetakeByStepPopup,
}: DelegateInFilterProps) {
  const [searchField, setSearchField] = useState({
    quickSearchText: "",
    preview: "",
    docTypeId: "",
    isAdvanceSearch: isAdvanceSearch,
  });

  const { data: doLoadDocTypeCategory } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.DOC_TYPE
  );

  const [docTypeOpen, setDocTypeOpen] = useState(false);
  const [docTypeQuery, setDocTypeQuery] = useState("");
  const docTypeOptions = (doLoadDocTypeCategory || []).map((item: any) => ({
    label: item.name,
    value: String(item.id),
  }));
  const filteredDocTypes = docTypeOptions.filter((opt: any) =>
    opt.label.toLowerCase().includes(docTypeQuery.toLowerCase())
  );

  const toggleAdvancedSearch = () => {
    const newAdvanceState = !isAdvanceSearch;
    onToggleAdvanceSearch?.(newAdvanceState);
    setSearchField((prev) => ({
      ...prev,
      isAdvanceSearch: newAdvanceState,
    }));
  };

  const handleDocTypeChange = (value: string) => {
    setSearchField((prev) => ({ ...prev, docTypeId: value }));
    setDocTypeOpen(false);
    setDocTypeQuery("");
  };

  const handleAdvancedSearch = () => {
    const searchData = {
      ...searchField,
      page: 1,
    };
    onAdvancedSearch?.(searchData);
  };

  const handleQuickSearch = () => {
    onSearch?.({
      quickSearchText: searchField.quickSearchText,
      page: 1,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (searchField.isAdvanceSearch) {
        setSearchField((prev) => ({
          ...prev,
          isAdvanceSearch: false,
          preview: "",
          docTypeId: "",
        }));
        onToggleAdvanceSearch?.(false);
        onResetAdvancedFields?.();

        setTimeout(() => {
          handleQuickSearch();
        }, 100);
      } else {
        handleQuickSearch();
      }
    }
  };

  const checkSharedService = () => {
    return SharedService.isOfCurrentUser(currentDocument?.createdBy);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2">
          {getCurrentDocumentId?.() != null && currentDeadline != null && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenDeadlinePopup}
                className="bg-blue-50 text-blue-700 hover:bg-blue-100"
              >
                <Calendar className="w-4 h-4 mr-1" />
                Gia hạn xử lý
              </Button>
            </>
          )}

          {currentTab === "MAIN_HANDLE" &&
            (() => {
              const hasNodeCondition =
                (nodeStart && getCurrentDocumentId?.() != null) ||
                (listNextNode &&
                  listNextNode.length > 0 &&
                  getCurrentDocumentId?.() != null);

              const enableButton =
                (!Constant.ORG_MULTI_TRANSFER_BCY &&
                  buttonStatus?.transferButton &&
                  hasNodeCondition) ||
                (Constant.ORG_MULTI_TRANSFER_BCY &&
                  !isOrgTransferStatus?.(getCurrentDocumentId?.() || "") &&
                  buttonStatus?.transferButton &&
                  hasNodeCondition);

              if (enableButton) {
                return (
                  <>
                    {nodeStart && getCurrentDocumentId?.() != null && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                          >
                            <CornerUpRight className="w-4 h-4 mr-1" />
                            Chuyển xử lý
                            <ChevronDown className="w-4 h-4 ml-1" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => onOpenTransferPopup?.(nodeStart)}
                          >
                            {nodeStart.name || "Chưa đặt tên"}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}

                    {listNextNode &&
                      listNextNode.length > 0 &&
                      getCurrentDocumentId?.() != null && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                            >
                              <CornerUpRight className="w-4 h-4 mr-1" />
                              Chuyển xử lý
                              <ChevronDown className="w-4 h-4 ml-1" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {listNextNode.map((node, index) => (
                              <DropdownMenuItem
                                key={index}
                                onClick={() => onOpenTransferPopup?.(node)}
                              >
                                {node.name != null && node.name != ""
                                  ? node.name
                                  : "Chưa đặt tên"}
                              </DropdownMenuItem>
                            ))}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                  </>
                );
              }

              return (
                <Button
                  variant="outline"
                  size="sm"
                  disabled={true}
                  className="bg-gray-50 text-gray-400"
                >
                  <CornerUpRight className="w-4 h-4 mr-1" />
                  Chuyển xử lý
                </Button>
              );
            })()}

          {Constant.ORG_MULTI_TRANSFER_BCY &&
            currentTab === "MAIN_HANDLE" &&
            isOrgTransferStatus?.(getCurrentDocumentId?.() || "") &&
            ((nodeStart && getCurrentDocumentId?.() != null) ||
              (listNextNodeOrg &&
                listNextNodeOrg.length &&
                getCurrentDocumentId?.() != null)) && (
              <>
                {nodeStart && getCurrentDocumentId?.() != null && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                      >
                        <Building className="w-4 h-4 mr-1" />
                        Chuyển đơn vị
                        <ChevronDown className="w-4 h-4 ml-1" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuItem
                        onClick={() => onOpenOrgTransferPopup?.(nodeStart)}
                      >
                        {nodeStart.name || "Chưa đặt tên"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {listNextNodeOrg &&
                  listNextNodeOrg.length > 0 &&
                  getCurrentDocumentId?.() != null && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                        >
                          <Building className="w-4 h-4 mr-1" />
                          Chuyển đơn vị
                          <ChevronDown className="w-4 h-4 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        {listNextNodeOrg.map((node, index) => (
                          <DropdownMenuItem
                            key={index}
                            onClick={() => onOpenOrgTransferPopup?.(node)}
                          >
                            {node.name != null && node.name != ""
                              ? node.name
                              : "Chưa đặt tên"}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
              </>
            )}

          {(currentTab === "MAIN_HANDLE" || currentTab === "COMBINE_HANDLE") &&
            buttonStatus?.doneButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenProcessDonePopup?.(false)}
                className="bg-blue-50 text-blue-700 hover:bg-blue-100"
              >
                <CheckSquare className="w-4 h-4 mr-1" />
                Hoàn thành xử lý
              </Button>
            )}

          {Constant.ORG_MULTI_TRANSFER_BCY &&
            currentTab === "MAIN_HANDLE" &&
            getCurrentDocumentId?.() != null &&
            isOrgTransferStatus?.(getCurrentDocumentId?.() || "") &&
            isCanFinishReceive?.(getCurrentDocumentId?.() || "") && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenProcessDonePopup?.(true)}
                className="bg-blue-50 text-blue-700 hover:bg-blue-100"
              >
                <CheckSquare className="w-4 h-4 mr-1" />
                Hoàn thành văn bản
              </Button>
            )}

          {currentDocumentId != null &&
            currentDocument?.canRetake &&
            checkSharedService() && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenRetakePopup?.(currentDocument)}
                className="bg-blue-50 text-blue-700 hover:bg-blue-100"
              >
                <Reply className="w-4 h-4 mr-1" />
                Thu hồi
              </Button>
            )}

          {!buttonStatus?.hideAll && buttonStatus?.rejectButton && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenRejectPopup}
              className="bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Trả lại
            </Button>
          )}

          {Constant.RETAKE_BY_STEP_BCY && buttonStatus?.retakeByStep && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenRetakeByStepPopup}
              className="bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              <Reply className="w-4 h-4 mr-1" />
              Thu hồi
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 w-4 h-4" />
            <Input
              name="quickSearchText"
              value={searchField.quickSearchText}
              onChange={(e) =>
                setSearchField((prev) => ({
                  ...prev,
                  quickSearchText: e.target.value,
                }))
              }
              onKeyPress={handleKeyPress}
              placeholder="Tìm kiếm theo Số, KH của văn bản đến | Trích yếu"
              className="pl-10 w-80"
            />
          </div>
          <Button
            onClick={toggleAdvancedSearch}
            variant="outline"
            size="sm"
            className="bg-white text-black"
          >
            <Search className="w-4 h-4" />
            Tìm kiếm nâng cao
          </Button>
        </div>
      </div>

      {isAdvanceSearch && (
        <div className="mb-3 py-10 px-10 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="space-y-6 mb-6 flex flex-col items-center">
            <div className="flex items-center gap-4 w-2/3">
              <Label className="text-md font-bold w-24 flex-shrink-0">
                Trích yếu
              </Label>
              <div className="flex-1">
                <Input
                  type="text"
                  value={searchField.preview}
                  onChange={(e) =>
                    setSearchField((prev) => ({
                      ...prev,
                      preview: e.target.value,
                    }))
                  }
                  className="h-9 text-sm bg-background w-full"
                  placeholder="Nhập từ khóa..."
                />
              </div>
            </div>
            <div className="flex items-center gap-4 w-2/3">
              <Label className="text-md font-bold w-24 flex-shrink-0">
                Loại văn bản
              </Label>
              <div className="flex-1">
                <Popover open={docTypeOpen} onOpenChange={setDocTypeOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-9 text-sm bg-background w-1/2 justify-between"
                    >
                      {docTypeOptions.find(
                        (o: any) => o.value === searchField.docTypeId
                      )?.label || "Chọn loại văn bản"}
                      <ChevronDown className="w-4 h-4 ml-2" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-[320px] p-2" align="start">
                    <Input
                      type="text"
                      value={docTypeQuery}
                      onChange={(e) => setDocTypeQuery(e.target.value)}
                      placeholder=""
                      className="h-9 text-sm bg-background w-full"
                    />
                    <div className="max-h-60 overflow-auto text-sm">
                      {filteredDocTypes.length === 0 && (
                        <div className="p-2 text-gray-500">
                          Không có dữ liệu
                        </div>
                      )}
                      {filteredDocTypes.map((opt: any) => (
                        <div
                          key={opt.value}
                          className="px-3 py-2 hover:bg-gray-100 cursor-pointer rounded"
                          onClick={() => handleDocTypeChange(opt.value)}
                        >
                          {opt.label}
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Button
              size="sm"
              onClick={handleAdvancedSearch}
              className="h-9 px-3 text-xs bg-blue-600 hover:bg-blue-700"
            >
              <Search className="w-4 h-4 mr-1" />
              Tìm kiếm
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchField({
                  quickSearchText: "",
                  preview: "",
                  docTypeId: "",
                  isAdvanceSearch: false,
                });
                onResetAdvancedFields?.();
                onResetSearch?.();
              }}
              className="h-9 px-3 text-xs"
            >
              <RotateCcw className="w-4 h-4 mr-1" />
              Đặt lại
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
