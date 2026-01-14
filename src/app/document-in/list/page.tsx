"use client";
import AttachmentDialog from "@/components/common/AttachmentDialog";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import { EmptyDocument } from "@/components/common/EmptyDocument";
import FilterField from "@/components/common/FilterFiled";
import SelectCustom from "@/components/common/SelectCustom";
import { DoneHandler } from "@/components/document-in/doneHandler";
import ForwardReceivePlace from "@/components/document-in/ForwardReceivePlace";
import { RetakeDoneHandler } from "@/components/document-in/retakeDoneHandler";
import { SearchInput } from "@/components/document-in/SearchInput";
import { TaskGivingHandler } from "@/components/document-in/TaskGivingHandler";
import EncryptDisplaySelect from "@/components/document-out/EncryptDisplaySelect";
import { Button } from "@/components/ui/button";
import { CustomDatePicker } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Table } from "@/components/ui/table";
import { Constant } from "@/definitions/constants/constant";
import { CategoryCode } from "@/definitions/types/category.type";
import { DocAttachment, DocumentIn } from "@/definitions/types/document.type";
import { Column } from "@/definitions/types/table.type";
import { useGetCategoriesByCode } from "@/hooks/data/category.data";
import {
  useQuickKnowableRead,
  useQuickKnowableUnread,
  useToggleImportant,
} from "@/hooks/data/document-in.data";
import { useGetListOrgEnter } from "@/hooks/data/document-out.data";
import { cn } from "@/lib/utils";
import { EncryptionService } from "@/services/encryption.service";
import { SharedService } from "@/services/shared.service";
import useAuthStore from "@/stores/auth.store";
import { useEncryptStore } from "@/stores/encrypt.store";
import {
  formatDate,
  formatDateYMD,
  parseDateStringYMD,
} from "@/utils/datetime.utils";
import { getStatusColor } from "@/utils/status-colors.utils";
import { ToastUtils } from "@/utils/toast.utils";
import {
  ChevronDown,
  ChevronUp,
  Paperclip,
  RotateCcw,
  Search,
  Star,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const tabs = { CHO_XU_LY: "CHO_XU_LY", HOAN_THANH: "DA_XU_LY" };

const getRowId = (row: any): number | null => {
  const raw =
    row?.docId ??
    row?.id ??
    row?.documentId ??
    row?.docOutId ??
    row?.doc_in_id ??
    row?.doc_out_id ??
    null;
  if (raw == null) return null;
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
};

const advancedSearchInit = {
  startCreate: "",
  endCreate: "",
  startIssued: "",
  endIssued: "",
  docTypeId: "",
  sign: "",
  preview: "",
  important: "",
  userEnter: "",
  orgName: "",
  handleType: "",
  sortBy: "",
  direction: Constant.SORT_TYPE.DECREASE,
};
const baseFilter = {
  page: 1,
  sortBy: "",
  direction: Constant.SORT_TYPE.DECREASE,
  size: Constant.ITEMS_PER_PAGE,
};

const DATE_FILTER_OPTIONS = [
  { value: null, label: "Tất cả" },
  { value: 15, label: "15 ngày" },
  { value: 30, label: "30 ngày" },
];

export default function DocumentInList() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { isEncrypt } = useEncryptStore();
  const sp = useSearchParams();
  const currentTab = sp?.get("currentTab");
  const paramPage = sp?.get("page");
  const paramSize = sp?.get("size");
  useEffect(() => {
    if (currentTab) setActiveTab(currentTab);
    if (paramSize && paramPage) {
      setFilter((prev) => ({
        ...prev,
        page: Number(paramPage),
        size: Number(paramSize),
      }));
    }
  }, [sp]);

  const [activeTab, setActiveTab] = useState(tabs.CHO_XU_LY);

  const [filter, setFilter] = useState(baseFilter);

  const [searchQuery, setSearchQuery] = useState("");
  const [dateSearch, setDateSearch] = useState<number | null>(null);
  const [advancedSearch, setAdvancedSearch] = useState(advancedSearchInit);
  const [tempAdvancedSearch, setTempAdvancedSearch] =
    useState(advancedSearchInit);

  const [showSuggestions, setShowSuggestions] = useState({
    docTypeId: false,
  });
  const [docTypeInput, setDocTypeInput] = useState("");
  const [filteredDocTypeSuggestions, setFilteredDocTypeSuggestions] = useState<
    string[]
  >([]);
  const { data: orgIssued } = useGetListOrgEnter();

  const [isAdvancedSearchExpanded, setIsAdvancedSearchExpanded] =
    useState(false);
  const [isBasicSearch, setIsBasicSearch] = useState(true);
  const [hasSubmittedAdvancedSearch, setHasSubmittedAdvancedSearch] =
    useState(false);

  const handleDateSearchChange = (value: string) => {
    const numValue = value === "all" ? null : Number(value);
    setDateSearch(numValue);
  };

  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const [openAttach, setOpenAttach] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState<
    DocAttachment[]
  >([]);
  const [isCheckShowButton, setIsCheckShowButton] = useState(false); //migrate isCanHandleDoc vào isCheckShowButton

  const [docTypeCategory, setDocTypeCategory] = useState<CategoryCode[]>([]);
  const [docFieldCategory, setDocFieldCategory] = useState<CategoryCode[]>([]);

  const basicParam = {
    ...filter,
    q: searchQuery,
    dateSearch,
  };
  const advancedParams = {
    ...filter,
    ...advancedSearch,
    dateSearch,
  };

  const params = isBasicSearch ? basicParam : advancedParams;

  const [actualParams, setActualParams] = useState(params);

  useEffect(() => {
    if (isBasicSearch) {
      setActualParams(basicParam);
    } else if (hasSubmittedAdvancedSearch) {
      setActualParams(advancedParams);
    }
  }, [
    isBasicSearch,
    filter,
    searchQuery,
    dateSearch,
    advancedSearch,
    hasSubmittedAdvancedSearch,
  ]);

  const unreadQuery = useQuickKnowableUnread(actualParams);
  const readQuery = useQuickKnowableRead(actualParams);
  const currentQuery = activeTab === tabs.CHO_XU_LY ? unreadQuery : readQuery;
  const { data: currentData, isLoading, error, refetch } = currentQuery;
  const { data: docTypeCategoryData } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.DOC_TYPE
  );
  useEffect(() => {
    if (docTypeCategoryData) setDocTypeCategory(docTypeCategoryData);
  }, [docTypeCategoryData]);
  const { data: docFieldCategoryData } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.DOC_FIELDS
  );
  useEffect(() => {
    if (docFieldCategoryData) setDocFieldCategory(docFieldCategoryData);
  }, [docFieldCategoryData]);

  // Keep text input in sync with selected docTypeId
  useEffect(() => {
    if (!tempAdvancedSearch.docTypeId) {
      setDocTypeInput("");
      return;
    }
    const match = docTypeCategory.find(
      (c) => c.id.toString() === tempAdvancedSearch.docTypeId
    );
    setDocTypeInput(match?.name || "");
  }, [tempAdvancedSearch.docTypeId, docTypeCategory]);

  const filterDocTypes = (keyword: string = "") => {
    const base = ["Tất cả", ...docTypeCategory.map((c) => c.name)];
    const k = keyword.trim().toLowerCase();
    const data = k ? base.filter((n) => n.toLowerCase().includes(k)) : base;
    setFilteredDocTypeSuggestions(data);
    setShowSuggestions((p) => ({ ...p, docTypeId: true }));
  };

  const selectDocType = (label: string) => {
    setDocTypeInput(label);
    const matched = docTypeCategory.find((c) => c.name === label);
    setTempAdvancedSearch((prev) => ({
      ...prev,
      docTypeId: label === "Tất cả" ? "" : matched?.id?.toString() || "",
    }));
    setShowSuggestions((p) => ({ ...p, docTypeId: false }));
  };

  const { mutate: toggleImportant } = useToggleImportant();
  const setImportant = (r: DocumentIn | any) => {
    const id = getRowId(r);
    if (id == null) return ToastUtils.error("Không tìm thấy ID văn bản");
    toggleImportant(
      { docId: id, important: !Boolean(r.important) },
      {
        onSuccess: () => refetch(),
        onError: () =>
          ToastUtils.error("Không thể cập nhật trạng thái quan trọng"),
      }
    );
  };

  const draftHandleRequestsData = useMemo(
    () => currentData?.content ?? [],
    [currentData]
  );
  const totalItems = currentData?.totalElements || 0;

  const visibleIds = useMemo(
    () =>
      (draftHandleRequestsData || [])
        .map((r: any) => getRowId(r))
        .filter((x: any): x is number => x != null),
    [draftHandleRequestsData]
  );
  const allChecked =
    visibleIds.length > 0 &&
    visibleIds.every((id) => selectedItems.includes(id));
  const handleSelectAll = (checked: boolean) => {
    setSelectedItems((prev) =>
      checked
        ? prev.concat(visibleIds.filter((id) => !prev.includes(id)))
        : prev.filter((id) => !visibleIds.includes(id))
    );
  };
  const handleAdvancedSearchReset = () => {
    setIsBasicSearch(true);
    setTempAdvancedSearch(advancedSearchInit);
    setAdvancedSearch(advancedSearchInit);
    setHasSubmittedAdvancedSearch(false);
  };

  const handleAdvancedSearchSubmit = () => {
    setAdvancedSearch(tempAdvancedSearch);
    setIsBasicSearch(false);
    setHasSubmittedAdvancedSearch(true);
  };
  const handleAttachmentClick = (row: DocumentIn) => {
    setSelectedAttachments(row.attachments || []);
    setOpenAttach(true);
  };
  const handleItemPerPageChange = (s: number) => {
    setFilter((prev) => ({
      ...prev,
      page: 1,
      size: s,
    }));
    setSelectedItems([]);
    setTimeout(() => {
      router.push(`/document-in/list?page=1&size=${s}&currentTab=${activeTab}`);
    }, 0);
  };
  const handlePageChange = (p: number) => {
    setFilter((prev) => ({
      ...prev,
      page: p,
    }));
    setSelectedItems([]);
    router.push(
      `/document-in/list?page=${p}&size=${filter.size}&currentTab=${activeTab}`
    );
  };
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setFilter((prev) => ({
      ...prev,
      page: 1,
      size: 10,
    }));
    setSelectedItems([]);
    router.push(`/document-in/list?page=${1}&size=${10}&currentTab=${tab}`);
  };
  const handleSelectItem = (itemId: number, checked: boolean) => {
    setSelectedItems((prev) =>
      checked
        ? prev.includes(itemId)
          ? prev
          : [...prev, itemId]
        : prev.filter((x) => x !== itemId)
    );
  };

  const selectedItemsData = useMemo(() => {
    return draftHandleRequestsData.filter((item: any) =>
      selectedItems.includes(getRowId(item) || 0)
    );
  }, [draftHandleRequestsData, selectedItems]);

  const forwardButton =
    !isCheckShowButton && selectedItems.length > 0 && !isEncrypt;

  const transitionButton =
    !isCheckShowButton && selectedItems.length > 0
      ? selectedItems.length === 1 &&
        selectedItemsData.length > 0 &&
        selectedItemsData.every(
          (item: any) => item.canForward && item.status === "DA_BAN_HANH"
        )
      : false;

  const canAddTransferButton =
    !isCheckShowButton && selectedItems.length > 0
      ? selectedItems.length === 1 &&
        selectedItemsData.length > 0 &&
        selectedItemsData.every(
          (item: any) => item.canAddUser && item.status === "DA_BAN_HANH"
        )
      : false;

  const doneButton =
    !isCheckShowButton &&
    activeTab === tabs.CHO_XU_LY &&
    selectedItems.length > 0;

  const taskGivingButton =
    selectedItems.length === 1 && !isCheckShowButton
      ? user?.authoritys.find(
          (x) =>
            (x.authority == "LEADERSHIP" || x.authority == "LEADERSHIP_UNIT") &&
            x.active
        ) &&
        selectedItemsData.length > 0 &&
        selectedItemsData.every((item: any) => item.status === "DA_BAN_HANH")
      : false;

  const retakeDoneButton =
    activeTab === tabs.HOAN_THANH && selectedItems.length === 1 && !isEncrypt;

  useEffect(() => {
    SharedService.setCurrentMenuDocIn(Constant.DOCUMENT_IN_MENU.DOC_IN);
  }, [activeTab]);

  const handleSort = (key: string) => {
    if (isAdvancedSearchExpanded) {
      setAdvancedSearch((prev) => ({
        ...prev,
        sortBy: key,
        direction:
          prev.sortBy === key
            ? prev.direction === Constant.SORT_TYPE.DECREASE
              ? Constant.SORT_TYPE.INCREASE
              : Constant.SORT_TYPE.DECREASE
            : Constant.SORT_TYPE.DECREASE,
      }));
    } else {
      setFilter((prev) => ({
        ...prev,
        sortBy: key,
        direction:
          prev.sortBy === key
            ? prev.direction === Constant.SORT_TYPE.DECREASE
              ? Constant.SORT_TYPE.INCREASE
              : Constant.SORT_TYPE.DECREASE
            : Constant.SORT_TYPE.DECREASE,
      }));
    }
  };

  const getSortIcon = (field: string) => {
    const sortBy = isAdvancedSearchExpanded
      ? advancedSearch.sortBy
      : filter.sortBy;
    const direction = isAdvancedSearchExpanded
      ? advancedSearch.direction
      : filter.direction;
    if (sortBy !== field || !direction) return null;
    return direction === "ASC" ? (
      <ChevronUp className="w-4 h-4 text-blue-600" />
    ) : (
      <ChevronDown className="w-4 h-4 text-blue-600" />
    );
  };
  const draftHandleColumns: Column<DocumentIn>[] = [
    {
      header: "STT",
      className: "text-center w-[4%] min-w-[40px]",
      sortable: false,
      accessor: (item: DocumentIn, index: number) => (
        <div
          className="flex items-center justify-center gap-2"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-xs font-medium">
            {(filter.page - 1) * filter.size + index + 1}
          </span>
          <Checkbox
            checked={selectedItems.includes(getRowId(item) || 0)}
            onCheckedChange={(checked) =>
              handleSelectItem(getRowId(item) || 0, checked === true)
            }
          />
        </div>
      ),
    },
    {
      header: (
        <div
          className="flex justify-center items-center py-1 cursor-pointer"
          onClick={() => handleSort("IMPORTANT")}
        >
          <Star className="w-4 h-4 text-gray-400 mx-auto" />
          {getSortIcon("IMPORTANT")}
        </div>
      ),
      className: "text-center w-[4%] min-w-[40px]",
      sortKey: "IMPORTANT",
      sortable: false,
      accessor: (item: DocumentIn) => (
        <Star
          className={cn(
            "w-4 h-4 mx-auto cursor-pointer hover:opacity-70",
            item.important
              ? "fill-yellow-400 text-yellow-400 stroke-yellow-600 stroke-2"
              : "text-gray-400"
          )}
          onClick={(e) => {
            e.stopPropagation();
            setImportant(item);
          }}
        />
      ),
    },
    {
      header: (
        <div
          className="flex justify-center items-center py-1 cursor-pointer"
          onClick={() => handleSort("NUMBERSIGN")}
        >
          Số/Ký hiệu
        </div>
      ),
      className: "text-center w-[10%] min-w-[90px]",
      sortKey: "NUMBERSIGN",
      accessor: (i: any) => {
        const num = i?.numberInBook ?? "";
        const sign = i?.numberOrSign ?? "";
        if (num && sign) {
          return sign.startsWith(String(num)) ? sign : `${num}/${sign}`;
        }
        return num || sign;
      },
    },
    {
      header: (
        <div
          className="flex justify-center items-center py-1 cursor-pointer"
          onClick={() => handleSort("DOCTYPE")}
        >
          Loại văn bản
        </div>
      ),
      sortKey: "DOCTYPE",
      className: "text-center w-[8%] min-w-[90px]",
      accessor: (i: any) => i.docType2?.name ?? "",
    },
    {
      header: (
        <div
          className="flex justify-center items-center py-1 cursor-pointer"
          onClick={() => handleSort("USER_ENTER")}
        >
          Người tạo
        </div>
      ),
      sortKey: "USER_ENTER",
      className: "text-center w-[12%] min-w-[120px]",
      accessor: (i: any) => i.fullName ?? "",
    },
    {
      header: (
        <div
          className="flex justify-center items-center py-1 cursor-pointer"
          onClick={() => handleSort("DATEISSUED")}
        >
          Ngày ban hành
        </div>
      ),
      sortKey: "DATEISSUED",
      className: "text-center w-[8%] min-w-[90px] whitespace-nowrap",
      accessor: (i: any) => formatDate(i.dateIssued),
    },
    {
      header: (
        <div
          className="flex justify-center items-center py-1 cursor-pointer"
          onClick={() => handleSort("PREVIEW")}
        >
          Trích yếu
        </div>
      ),
      sortKey: "PREVIEW",
      className: "text-left w-[42%] min-w-[250px]",
      accessor: (item: DocumentIn) => (
        <span
          className="max-w-[700px] line-clamp-2 text-sm leading-relaxed text-ellipsis"
          title={item.preview}
        >
          {item.preview}
        </span>
      ),
    },
    {
      header: (
        <div
          className="flex justify-center items-center py-1 cursor-pointer"
          onClick={() => handleSort("STATUS")}
        >
          Trạng thái
        </div>
      ),
      sortKey: "STATUS",
      className: "text-center w-[8%] min-w-[80px]",
      accessor: (item: any) => (
        <span
          className={cn(
            "inline-flex items-center px-2 py-1 rounded border text-xs whitespace-nowrap font-semibold",
            getStatusColor(item.statusName)
          )}
        >
          {item.statusName}
        </span>
      ),
    },
    {
      header: "Đính kèm",
      className: "text-center w-[4%] min-w-[40px]",
      sortable: false,
      accessor: (item: DocumentIn) =>
        item.attachments?.length > 0 ? (
          <Paperclip
            className="w-4 h-4 text-blue-600 mx-auto cursor-pointer hover:opacity-70"
            onClick={(e) => {
              e.stopPropagation();
              handleAttachmentClick(item);
            }}
          />
        ) : null,
    },
  ];
  useEffect(() => {
    if (isEncrypt) {
      EncryptionService.isCheckStartUsbTokenWatcher();
    }
    setIsCheckShowButton(isEncrypt);
  }, [isEncrypt]);

  return (
    <div className="space-y-4 px-2">
      <div className="flex items-center justify-between">
        <BreadcrumbNavigation
          items={[
            {
              label: "Văn bản đi",
            },
          ]}
          currentPage="Danh sách văn bản đi"
          showHome={false}
          className="ml-3"
        />
        <div className="flex items-center gap-3">
          <SearchInput
            placeholder={"Tìm kiếm Số/Ký hiệu | Trích yếu"}
            value={searchQuery}
            setSearchInput={(v) => setSearchQuery(v)}
          />

          <SelectCustom
            options={DATE_FILTER_OPTIONS.map((option) => ({
              label: option.label,
              value: option.value?.toString() || "all",
            }))}
            value={dateSearch?.toString() || "all"}
            onChange={(val) => handleDateSearchChange(val as string)}
            className="w-32 h-8"
            placeholder="Lọc theo ngày"
          />

          <Button
            variant="outline"
            onClick={() =>
              setIsAdvancedSearchExpanded(!isAdvancedSearchExpanded)
            }
            className={cn(
              "h-8 py-1 px-3 text-xs transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700 hover:text-white border-none"
            )}
          >
            <Search className="w-4 h-4 mr-1" />
            {isAdvancedSearchExpanded
              ? "Thu gọn tìm kiếm"
              : "Tìm kiếm nâng cao"}
          </Button>
        </div>
      </div>

      <div className="p-3">
        {/* Advanced Search Section */}
        {isAdvancedSearchExpanded && (
          <div className="bg-white rounded-lg border mb-4">
            <h3 className="font-bold text-info mb-10 p-4 bg-blue-100 rounded-t-lg">
              Tìm kiếm nâng cao
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAdvancedSearchSubmit();
              }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 px-8">
                <div className="flex items-center gap-2">
                  <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                    Ngày tạo dự thảo, từ ngày
                  </Label>
                  <div className="flex-1 min-w-0">
                    <CustomDatePicker
                      selected={parseDateStringYMD(
                        tempAdvancedSearch.startCreate
                      )}
                      onChange={(date) =>
                        setTempAdvancedSearch((s) => ({
                          ...s,
                          startCreate: formatDateYMD(date),
                        }))
                      }
                      placeholder="dd/mm/yyyy"
                      disabledFuture
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                    Đến ngày
                  </Label>
                  <div className="flex-1 min-w-0">
                    <CustomDatePicker
                      selected={parseDateStringYMD(
                        tempAdvancedSearch.endCreate
                      )}
                      onChange={(date) =>
                        setTempAdvancedSearch((s) => ({
                          ...s,
                          endCreate: formatDateYMD(date),
                        }))
                      }
                      placeholder="dd/mm/yyyy"
                      disabledFuture
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                    Ngày ban hành, từ ngày
                  </Label>
                  <div className="flex-1 min-w-0">
                    <CustomDatePicker
                      selected={parseDateStringYMD(
                        tempAdvancedSearch.startIssued
                      )}
                      onChange={(date) =>
                        setTempAdvancedSearch((s) => ({
                          ...s,
                          startIssued: formatDateYMD(date),
                        }))
                      }
                      placeholder="dd/mm/yyyy"
                      disabledFuture
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                    đến ngày
                  </Label>
                  <div className="flex-1 min-w-0">
                    <CustomDatePicker
                      selected={parseDateStringYMD(
                        tempAdvancedSearch.endIssued
                      )}
                      onChange={(date) =>
                        setTempAdvancedSearch((s) => ({
                          ...s,
                          endIssued: formatDateYMD(date),
                        }))
                      }
                      placeholder="dd/mm/yyyy"
                      disabledFuture
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                    Loại văn bản
                  </Label>
                  <div className="flex-1 min-w-0 relative [&>div>label]:hidden [&>div]:space-y-0">
                    <FilterField
                      label=""
                      field="docTypeId"
                      value={docTypeInput}
                      placeholder="Chọn loại văn bản"
                      withSuggestions={true}
                      showSuggestions={showSuggestions.docTypeId}
                      suggestions={filteredDocTypeSuggestions}
                      onChange={(_, v) => {
                        setDocTypeInput(v);
                        filterDocTypes(v);
                      }}
                      onFocus={() => filterDocTypes("")}
                      onBlur={() => {
                        setTimeout(
                          () =>
                            setShowSuggestions((prev) => ({
                              ...prev,
                              docTypeId: false,
                            })),
                          150
                        );
                      }}
                      onSelectSuggestion={(_, v) => selectDocType(v)}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                    Người soạn thảo
                  </Label>
                  <Input
                    type="text"
                    value={tempAdvancedSearch.userEnter}
                    onChange={(e) =>
                      setTempAdvancedSearch((prev) => ({
                        ...prev,
                        userEnter: e.target.value,
                      }))
                    }
                    className="flex-1 min-w-0"
                    placeholder="Tìm kiếm người soạn thảo..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                    Đơn vị soạn thảo
                  </Label>
                  <div className="flex-1 min-w-0">
                    <SelectCustom
                      value={tempAdvancedSearch.orgName}
                      onChange={(v) => {
                        const value = String(Array.isArray(v) ? v[0] : v);
                        setTempAdvancedSearch((prev) => ({
                          ...prev,
                          orgName: value === "all" ? "" : value,
                        }));
                      }}
                      options={[
                        { label: "Tất cả", value: "all" },
                        ...(orgIssued || [])?.map((item) => ({
                          label: item.name,
                          value: item.id.toString(),
                        })),
                      ]}
                      placeholder="Chọn đơn vị"
                      type="single"
                      className="w-full"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                    Số/Ký hiệu
                  </Label>
                  <Input
                    type="text"
                    value={tempAdvancedSearch.sign}
                    onChange={(e) =>
                      setTempAdvancedSearch((prev) => ({
                        ...prev,
                        sign: e.target.value,
                      }))
                    }
                    className="flex-1 min-w-0"
                    placeholder="Nhập số/ký hiệu..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                    Trích yếu
                  </Label>
                  <Input
                    type="text"
                    value={tempAdvancedSearch.preview}
                    onChange={(e) =>
                      setTempAdvancedSearch((prev) => ({
                        ...prev,
                        preview: e.target.value,
                      }))
                    }
                    className="flex-1 min-w-0"
                    placeholder="Nhập từ khóa..."
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                    Văn bản quan trọng
                  </Label>
                  <div className="flex-1 min-w-0">
                    <SelectCustom
                      options={[
                        { label: "-- Chọn --", value: "all" },
                        { label: "Quan trọng", value: "true" },
                        { label: "Không quan trọng", value: "false" },
                      ]}
                      value={tempAdvancedSearch.important}
                      onChange={(v) => {
                        const value = String(Array.isArray(v) ? v[0] : v);
                        setTempAdvancedSearch((prev) => ({
                          ...prev,
                          important: value === "all" ? "" : value,
                        }));
                      }}
                      // placeholder="-- Chọn --"
                      className="w-full data-[placeholder]:text-black"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Label className="font-bold text-right w-48 flex-shrink-0 text-[14px]">
                    Vai trò
                  </Label>
                  <div className="flex-1 min-w-0">
                    <SelectCustom
                      value={tempAdvancedSearch.handleType}
                      onChange={(v) => {
                        const value = String(Array.isArray(v) ? v[0] : v);
                        setTempAdvancedSearch((prev) => ({
                          ...prev,
                          handleType: value === "all" ? "" : value,
                        }));
                      }}
                      options={[
                        { label: "Tất cả", value: "all" },
                        { label: "Xử lý chính", value: "MAIN" },
                        { label: "Phối hợp", value: "SUPPORT" },
                        { label: "Nhận để biết", value: "SHOW" },
                      ]}
                      placeholder="Chọn vai trò"
                      type="single"
                      className="w-full"
                    />
                  </div>
                </div>
              </div>

              {/* Search Actions */}
              <div className="flex items-center justify-center gap-3 my-6">
                <Button
                  type="submit"
                  size="sm"
                  className="h-9 px-3 text-xs bg-blue-600 hover:bg-blue-700"
                >
                  <Search className="w-4 h-4 mr-1" />
                  Tìm kiếm
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAdvancedSearchReset}
                  className="h-9 px-3 text-xs"
                >
                  <RotateCcw className="w-4 h-4 mr-1" />
                  Đặt lại
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Action Buttons */}
        {selectedItems.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            {/* Button Forward - Hiện khi có item được chọn và không encrypt */}
            {forwardButton && (
              <ForwardReceivePlace
                selectedItemId={selectedItems[0]}
                onSuccess={() => {
                  ToastUtils.success("Chuyển xử lý thành công");
                  setSelectedItems([]);
                  refetch();
                }}
              />
            )}

            {/* Button Chuyển tiếp - Chỉ hiện khi chọn 1 item, có canForward và status = DA_BAN_HANH */}
            {transitionButton && (
              <Button
                onClick={() => {
                  // TODO: Implement transition logic
                  console.log("Chuyển tiếp");
                }}
                className="h-9 px-3 text-xs"
              >
                Chuyển tiếp
              </Button>
            )}

            {/* Button Bổ sung xử lý - Chỉ hiện khi chọn 1 item, có canAddUser và status = DA_BAN_HANH */}
            {canAddTransferButton && (
              <Button
                onClick={() => {
                  // TODO: Implement add transfer logic
                  console.log("Bổ sung xử lý");
                }}
                className="h-9 px-3 text-xs"
              >
                Bổ sung xử lý
              </Button>
            )}

            {/* Button Hoàn thành - Hiện khi tab CHO_XU_LY và có item được chọn */}
            {doneButton && (
              <DoneHandler
                selectedItem={selectedItems}
                onSuccess={() => {
                  ToastUtils.success("Hoàn thành văn bản thành công!");
                  setSelectedItems([]);
                  refetch();
                }}
                allowMulti={false}
              />
            )}

            {/* Button Giao việc - Chỉ hiện khi chọn 1 item, có quyền và status = DA_BAN_HANH */}
            {taskGivingButton && (
              <TaskGivingHandler selectedItemId={selectedItems[0]} />
            )}

            {/* Button Thu hồi - Chỉ hiện khi tab HOAN_THANH và chọn 1 item */}
            {retakeDoneButton && (
              <RetakeDoneHandler
                selectedItemId={selectedItems[0]}
                type={false}
                onSuccess={() => {
                  setSelectedItems([]);
                  refetch();
                }}
              />
            )}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                activeTab === tabs.CHO_XU_LY
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => handleTabChange(tabs.CHO_XU_LY)}
            >
              Chờ xử lý
            </button>
            <button
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                activeTab === tabs.HOAN_THANH
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => handleTabChange(tabs.HOAN_THANH)}
            >
              Hoàn thành
            </button>
          </div>

          <EncryptDisplaySelect selectClassName="w-36 h-9 text-xs" />
        </div>
        <Table
          sortable={true}
          columns={draftHandleColumns}
          dataSource={draftHandleRequestsData}
          itemsPerPage={filter.size}
          currentPage={filter.page}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          showPagination
          bgColor="bg-white"
          rowClassName={(item, index) =>
            index % 2 === 0 ? "bg-white" : "bg-[#0000000d]"
          }
          className="overflow-hidden"
          emptyText={<EmptyDocument />}
          onRowClick={(item) => {
            const id = getRowId(item);
            if (id != null) {
              SharedService.setCurrentMenuDocIn(
                Constant.DOCUMENT_IN_MENU.DOC_IN
              );
              router.push(
                `/document-in/draft-handle/draft-detail/${id}?tab=${activeTab}`
              );
            } else ToastUtils.error("Không tìm thấy ID văn bản");
          }}
          onItemsPerPageChange={handleItemPerPageChange}
        />
      </div>

      <AttachmentDialog
        isOpen={openAttach}
        onOpenChange={setOpenAttach}
        attachments={selectedAttachments}
      />
    </div>
  );
}
