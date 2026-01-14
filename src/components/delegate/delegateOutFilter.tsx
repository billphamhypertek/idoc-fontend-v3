"use client";

import { useState } from "react";
import {
  Search,
  Share,
  ArrowLeft,
  CheckSquare,
  ChevronDown,
  Building,
  RotateCcw,
} from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Label } from "../ui/label";
import { CustomDatePicker } from "../ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import SelectCustom from "../common/SelectCustom";
import { Constant } from "@/definitions/constants/constant";
import { useGetCategoriesByCode } from "@/hooks/data/category.data";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useGetListOrgEnter } from "@/hooks/data/document-out.data";
import { Textarea } from "../ui/textarea";

interface DelegateOutFilterProps {
  // Search handlers
  onSearch?: (data: any) => void;
  onAdvancedSearch?: (data: any) => void;
  isAdvanceSearch?: boolean;
  onToggleAdvanceSearch?: (isAdvance: boolean) => void;
  onResetSearch?: () => void;

  // Action handlers
  onOpenTransferPopup?: (node?: any) => void;
  onOpenRejectPopup?: () => void;
  onOpenDonePopup?: () => void;
  onOpenRetakeByStepPopup?: () => void;

  // States/controls
  currentTab?: string;
  currentDraftId?: string | null;
  selectedListLength?: number;
  isShowDoneButton?: boolean;
  retakeByStepEnabled?: boolean;
  listNextNode?: any[];
}

export default function DelegateOutFilter({
  onSearch,
  onAdvancedSearch,
  isAdvanceSearch = false,
  onToggleAdvanceSearch,
  onResetSearch,
  onOpenTransferPopup,
  onOpenRejectPopup,
  onOpenDonePopup,
  onOpenRetakeByStepPopup,
  currentTab,
  currentDraftId,
  selectedListLength = 0,
  isShowDoneButton = false,
  retakeByStepEnabled = false,
  listNextNode = [],
}: DelegateOutFilterProps) {
  const [searchField, setSearchField] = useState({
    quickSearchText: "",
    startDate: null as Date | null,
    endDate: null as Date | null,
    docTypeId: "",
    numberOrSign: "",
    userEnter: "",
    orgName: "",
    preview: "",
    isAdvanceSearch: isAdvanceSearch,
  });

  const { data: docTypeCategory } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.DOC_TYPE
  );

  const { data: orgList } = useGetListOrgEnter();

  const [docTypeOpen, setDocTypeOpen] = useState(false);
  const [docTypeQuery, setDocTypeQuery] = useState("");
  const docTypeOptions = (docTypeCategory || []).map((item: any) => ({
    label: item.name,
    value: String(item.id),
  }));
  const filteredDocTypes = docTypeOptions.filter((opt: any) =>
    opt.label.toLowerCase().includes(docTypeQuery.toLowerCase())
  );

  const toggleAdvancedSearch = () => {
    const newAdvanceState = !isAdvanceSearch;
    onToggleAdvanceSearch?.(newAdvanceState);
    setSearchField((prev) => ({ ...prev, isAdvanceSearch: newAdvanceState }));
  };

  const handleQuickSearch = () => {
    onSearch?.({ quickSearchText: searchField.quickSearchText, page: 1 });
  };

  const handleAdvancedSearch = () => {
    onAdvancedSearch?.({
      startDate: searchField.startDate,
      endDate: searchField.endDate,
      docTypeId: searchField.docTypeId,
      numberOrSign: searchField.numberOrSign,
      userEnter: searchField.userEnter,
      orgName: searchField.orgName,
      preview: searchField.preview,
      page: 1,
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      if (searchField.isAdvanceSearch) {
        // turn off advanced + reset advanced fields, then trigger quick search
        setSearchField((prev) => ({
          ...prev,
          isAdvanceSearch: false,
          preview: "",
          docTypeId: "",
          numberOrSign: "",
          userEnter: "",
          orgName: "",
        }));
        onToggleAdvanceSearch?.(false);
        setTimeout(() => handleQuickSearch(), 100);
      } else {
        handleQuickSearch();
      }
    }
  };

  const handleDocTypeChange = (value: string | string[]) => {
    const newDocTypeId = Array.isArray(value) ? value[0] : value;
    setSearchField((prev) => ({ ...prev, docTypeId: newDocTypeId }));
  };

  const handleOrgNameChange = (value: string | string[]) => {
    const newOrgName = Array.isArray(value) ? value[0] : value;
    setSearchField((prev) => ({ ...prev, orgName: newOrgName }));
  };

  const normalizeToNoon = (date?: Date | null) =>
    date
      ? new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          12,
          0,
          0,
          0
        )
      : null;

  const handleStartDateChange = (date: Date | null) => {
    const nd = normalizeToNoon(date);
    setSearchField((p) => ({
      ...p,
      startDate: nd,
      endDate: p.endDate && nd && p.endDate < nd ? null : p.endDate,
    }));
  };

  const handleEndDateChange = (date: Date | null) => {
    const nd = normalizeToNoon(date);
    setSearchField((p) => ({ ...p, endDate: nd }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex gap-2">
          {/* Chuyển xử lý */}
          {currentTab === "waitHandleTab" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-blue-50 text-blue-700 hover:bg-blue-100"
                  disabled={!listNextNode?.length || !currentDraftId}
                >
                  <Share className="w-4 h-4 mr-1" />
                  Chuyển xử lý
                  <ChevronDown className="w-4 h-4 ml-1" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {listNextNode?.map((node, idx) => (
                  <DropdownMenuItem
                    key={idx}
                    onClick={() => onOpenTransferPopup?.(node)}
                  >
                    {node?.name ? node.name : "Chưa đặt tên"}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {/* Trả lại */}
          {currentTab === "waitHandleTab" && (
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenRejectPopup}
              disabled={!currentDraftId || (selectedListLength ?? 0) > 1}
              className="bg-blue-50 text-blue-700 hover:bg-blue-100"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Trả lại
            </Button>
          )}

          {/* Thu hồi theo bước */}
          {currentTab === "waitHandleTab" &&
            Constant.RETAKE_BY_STEP_BCY &&
            retakeByStepEnabled && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenRetakeByStepPopup}
                className="bg-blue-50 text-blue-700 hover:bg-blue-100"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Thu hồi
              </Button>
            )}

          {/* Hoàn thành xử lý */}
          {currentTab === "waitHandleTab" &&
            isShowDoneButton &&
            currentDraftId &&
            (selectedListLength ?? 0) < 2 && (
              <Button
                variant="outline"
                size="sm"
                onClick={onOpenDonePopup}
                className="bg-blue-50 text-blue-700 hover:bg-blue-100"
              >
                <CheckSquare className="w-4 h-4 mr-1" />
                Hoàn thành xử lý
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
          <div className="mb-6 grid w-full grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center gap-4 w-full">
              <Label className="text-md font-bold w-40 flex-shrink-0 text-right">
                Ngày tạo dự thảo, từ ngày
              </Label>
              <div className="flex-1">
                <CustomDatePicker
                  selected={searchField.startDate}
                  onChange={handleStartDateChange}
                  placeholder="dd/mm/yyyy"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 w-full">
              <Label className="text-md font-bold w-40 flex-shrink-0 text-right">
                đến ngày
              </Label>
              <div className="flex-1">
                <CustomDatePicker
                  selected={searchField.endDate}
                  onChange={handleEndDateChange}
                  placeholder="dd/mm/yyyy"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 w-full">
              <Label className="text-md font-bold w-40 flex-shrink-0 text-right">
                Loại văn bản
              </Label>
              <div className="flex-1">
                <Popover open={docTypeOpen} onOpenChange={setDocTypeOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="h-9 text-sm bg-background w-full justify-between"
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
                          onClick={() => {
                            handleDocTypeChange(opt.value);
                            setDocTypeOpen(false);
                            setDocTypeQuery("");
                          }}
                        >
                          {opt.label}
                        </div>
                      ))}
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="flex items-center gap-4 w-full">
              <Label className="text-md font-bold w-40 flex-shrink-0 text-right">
                Số/Ký hiệu
              </Label>
              <div className="flex-1">
                <Input
                  value={searchField.numberOrSign}
                  onChange={(e) =>
                    setSearchField((p) => ({
                      ...p,
                      numberOrSign: e.target.value,
                    }))
                  }
                  className="h-9 text-sm bg-background w-full"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 w-full">
              <Label className="text-md font-bold w-40 flex-shrink-0 text-right">
                Người soạn thảo
              </Label>
              <div className="flex-1">
                <Input
                  value={searchField.userEnter}
                  onChange={(e) =>
                    setSearchField((p) => ({ ...p, userEnter: e.target.value }))
                  }
                  className="h-9 text-sm bg-background w-full"
                />
              </div>
            </div>

            <div className="flex items-center gap-4 w-full">
              <Label className="text-md font-bold w-40 flex-shrink-0 text-right">
                Đơn vị soạn thảo
              </Label>
              <div className="flex-1">
                <SelectCustom
                  options={[
                    { label: "-- Chọn --", value: "all" },
                    ...(orgList?.map((item: any) => ({
                      label: item.name,
                      value: item.id.toString(),
                    })) || []),
                  ]}
                  value={searchField.orgName}
                  onChange={handleOrgNameChange}
                  placeholder="Chọn đơn vị"
                  className="h-9 text-sm bg-background w-full"
                />
              </div>
            </div>

            <div className="flex items-start gap-4 w-full">
              <Label className="text-md font-bold w-40 flex-shrink-0 text-right pt-2">
                Trích yếu
              </Label>
              <div className="flex-1">
                <Textarea
                  rows={3}
                  value={searchField.preview}
                  onChange={(e) =>
                    setSearchField((p) => ({ ...p, preview: e.target.value }))
                  }
                  className="text-sm bg-background w-full"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            <Button
              size="sm"
              onClick={handleAdvancedSearch}
              className="h-9 px-3 text-xs bg-blue-600 hover:bg-blue-700"
            >
              <Search className="w-4 h-4 mr-1" /> Tìm kiếm
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchField({
                  quickSearchText: "",
                  startDate: null,
                  endDate: null,
                  docTypeId: "",
                  numberOrSign: "",
                  userEnter: "",
                  orgName: "",
                  preview: "",
                  isAdvanceSearch: false,
                });
                onResetSearch?.();
              }}
              className="h-9 px-3 text-xs"
            >
              <RotateCcw className="w-4 h-4 mr-1" /> Đặt lại
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
