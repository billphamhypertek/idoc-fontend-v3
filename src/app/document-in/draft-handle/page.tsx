"use client";
import AttachmentDialog from "@/components/common/AttachmentDialog";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import { EmptyDocument } from "@/components/common/EmptyDocument";
import FilterField from "@/components/common/FilterFiled";
import SelectCustom from "@/components/common/SelectCustom";
import { ConsultHandler } from "@/components/document-in/consultHandler";
import { DoneHandler } from "@/components/document-in/doneHandler";
import { RetakeHandler } from "@/components/document-in/retakeHandler";
import { ReturnHandler } from "@/components/document-in/returnHandler";
import { SearchInput } from "@/components/document-in/SearchInput";
import { TaskGivingHandler } from "@/components/document-in/TaskGivingHandler";
import { ToBookHandler } from "@/components/document-in/ToBookHandler";
import { TransferDocumentIn } from "@/components/document-in/TranferDocumentIn";
import EncryptDisplaySelect from "@/components/document-out/EncryptDisplaySelect";
import { Button } from "@/components/ui/button";
import { CustomDatePicker } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table } from "@/components/ui/table";
import { Constant } from "@/definitions/constants/constant";
import { DocAttachment, DocumentIn } from "@/definitions/types/document.type";
import { Column } from "@/definitions/types/table.type";
import {
  useGetNextConsultNodes,
  useSearchFlowNode,
} from "@/hooks/data/bpmn2.data";
import { useGetCategoriesByCode } from "@/hooks/data/category.data";
import {
  useCheckActionImportDocDocument,
  useCheckActionRetakeDocument,
  useDocumentInQuery,
  useToggleImportant,
} from "@/hooks/data/document-in.data";
import { cn } from "@/lib/utils";
import { EncryptionService } from "@/services/encryption.service";
import { SharedService } from "@/services/shared.service";
import useAuthStore from "@/stores/auth.store";
import { useEncryptStore } from "@/stores/encrypt.store";
import { createURLQueryString } from "@/utils/common.utils";
import {
  formatDate,
  formatDateYMD,
  parseDateStringYMD,
} from "@/utils/datetime.utils";
import { getStatusColor, getStatusStyle } from "@/utils/status-colors.utils";
import { ToastUtils } from "@/utils/toast.utils";
import {
  ChevronDown,
  ChevronUp,
  Paperclip,
  RotateCcw,
  Search,
  Star,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const tabs = {
  CHOXULY: "waitHandleTab",
  CHOCHOYKIEN: "waitCommentTab",
  DAXULY: "handledTab",
  DAHOANTHANH: "doneTab",
};

const defaultAdvanceSearchState = {
  startCreate: "",
  endCreate: "",
  endDate: "",
  docTypeId: "",
  sign: "",
  preview: "",
  important: "",
  userEnter: "",
  orgName: "",
  sortBy: "",
  direction: Constant.SORT_TYPE.DECREASE,
};

const DATE_FILTER_OPTIONS = [
  { value: null, label: "Tất cả" },
  { value: 15, label: "15 ngày" },
  { value: 30, label: "30 ngày" },
];

const RETAKE_BY_STEP_BCY = Constant.RETAKE_BY_STEP_BCY;
const IMPORT_DOC_BOOK_BCY = Constant.IMPORT_DOC_BOOK_BCY;

const getSecurityColor = (status: string) => {
  const colorMap = {
    Thường: "text-cyan-800",
    Mật: "text-red-800",
  };
  return colorMap[status as keyof typeof colorMap] || "text-gray-800";
};

export default function DocumentInDraftHandle() {
  const router = useRouter();
  const pathName = usePathname();
  const { user } = useAuthStore();
  const { isEncrypt } = useEncryptStore();
  const sp = useSearchParams();
  const currentTab = sp?.get("currentTab");
  const paramPage = sp?.get("page");
  const paramSize = sp?.get("size");

  const [activeTab, setActiveTab] = useState(tabs.CHOXULY);
  const [dateSearch, setDateSearch] = useState<number | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isAdvancedSearchExpanded, setIsAdvancedSearchExpanded] =
    useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [advancedSearch, setAdvancedSearch] = useState(
    defaultAdvanceSearchState
  );
  const [tempAdvancedSearch, setTempAdvancedSearch] = useState(
    defaultAdvanceSearchState
  );
  const [isBasicSearch, setIsBasicSearch] = useState(true);
  const [openAttach, setOpenAttach] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState<
    DocAttachment[]
  >([]);
  const [hasSubmittedAdvancedSearch, setHasSubmittedAdvancedSearch] =
    useState(false);

  const [isCanHandleDoc, setIsCanHandleDoc] = useState(false);
  useEffect(() => {
    if (currentTab) setActiveTab(currentTab);
    if (paramSize) setItemsPerPage(Number(paramSize));
    if (paramPage) setCurrentPage(Number(paramPage));
  }, [sp]);

  const baseParams = useMemo(
    () => ({
      q: searchQuery,
      page: currentPage,
      size: itemsPerPage,
      direction: "DESC",
      sortBy: "",
    }),
    [searchQuery, currentPage, itemsPerPage]
  );
  const advanceParams = useMemo(
    () => ({
      ...baseParams,
      startCreate: advancedSearch.startCreate,
      endCreate: advancedSearch.endCreate,
      docTypeId: advancedSearch.docTypeId,
      sign: advancedSearch.sign,
      preview: advancedSearch.preview,
      important: advancedSearch.important,
      userEnter: advancedSearch.userEnter,
      orgName: advancedSearch.orgName,
      sortBy: advancedSearch.sortBy,
      direction: advancedSearch.direction,
    }),
    [advancedSearch, baseParams]
  );

  const [actualFilter, setActualFilter] = useState(baseParams);

  useEffect(() => {
    if (isBasicSearch) {
      setActualFilter(baseParams);
    } else if (hasSubmittedAdvancedSearch) {
      setActualFilter(advanceParams);
    }
  }, [isBasicSearch, baseParams, advanceParams, hasSubmittedAdvancedSearch]);
  const { mutate: toggleImportant } = useToggleImportant();
  const setImportant = (r: DocumentIn) => {
    toggleImportant({ docId: r.docId, important: !Boolean(r.important) });
  };
  const [filter, setFilter] = useState(baseParams);

  const { data: docTypeCategory } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.DOC_TYPE
  );
  const [showSuggestions, setShowSuggestions] = useState({ docTypeId: false });
  const [docTypeInput, setDocTypeInput] = useState("");
  const [filteredDocTypeSuggestions, setFilteredDocTypeSuggestions] = useState<
    string[]
  >([]);
  const { data: docFieldCategory } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.DOC_FIELDS
  );

  const handleDateSearchChange = (value: string) => {
    const numValue = value === "all" ? null : Number(value);
    setDateSearch(numValue);
  };

  const compileAction = (tab: string) => {
    let action = "";
    if (tab == tabs.CHOXULY) {
      action = "waiting-handle";
    }
    // else if (tab == TabNames.CHOCHOYKIEN) {
    //   action = 'waiting-comment';
    // }
    else if (tab == tabs.DAXULY) {
      action = "handled";
    } else if (tab == tabs.DAHOANTHANH) {
      action = "issued";
    }
    return action;
  };
  const {
    data: currentData,
    isLoading,
    error,
    refetch,
  } = useDocumentInQuery(compileAction(activeTab), actualFilter, isBasicSearch);
  const totalItems = currentData?.totalElements || 0;
  const handleAttachmentClick = (row: DocumentIn) => {
    setSelectedAttachments(row.attachments || []);
    setOpenAttach(true);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedItems([]);
    setTimeout(() => {
      router.push(
        `/document-in/draft-handle?page=${page}&size=${itemsPerPage}&currentTab=${activeTab}`
      );
    }, 0);
  };
  const handleItemPerPageChange = (s: number) => {
    setItemsPerPage(s);
    setSelectedItems([]);
    setTimeout(() => {
      router.push(
        `/document-in/draft-handle?page=1&size=${s}&currentTab=${activeTab}`
      );
    }, 0);
  };

  const handleAdvancedSearchReset = () => {
    setIsBasicSearch(true);
    setTempAdvancedSearch(defaultAdvanceSearchState);
    setAdvancedSearch(defaultAdvanceSearchState);
    setHasSubmittedAdvancedSearch(false);
  };

  const handleAdvancedSearchSubmit = () => {
    setAdvancedSearch(tempAdvancedSearch);
    setIsBasicSearch(false);
    setHasSubmittedAdvancedSearch(true);
  };

  useEffect(() => {
    if (docTypeCategory && advancedSearch.docTypeId) {
      const selectedDocType = docTypeCategory.find(
        (c) => c.id.toString() === advancedSearch.docTypeId
      );
      if (selectedDocType) {
        setDocTypeInput(selectedDocType.name);
      }
    } else {
      setDocTypeInput("");
    }
  }, [advancedSearch.docTypeId, docTypeCategory]);

  const filterDocTypes = (keyword: string = "") => {
    const base = ["Tất cả", ...(docTypeCategory || []).map((c) => c.name)];
    const k = keyword.trim().toLowerCase();
    const data = k ? base.filter((n) => n.toLowerCase().includes(k)) : base;
    setFilteredDocTypeSuggestions(data);
    setShowSuggestions((p) => ({ ...p, docTypeId: true }));
  };

  const selectDocType = (selectedValue: string) => {
    setDocTypeInput(selectedValue);
    const matched = docTypeCategory?.find((c) => c.name === selectedValue);
    setTempAdvancedSearch((prev) => ({
      ...prev,
      docTypeId:
        selectedValue === "Tất cả" ? "" : matched?.id?.toString() || "",
    }));
    setShowSuggestions((p) => ({ ...p, docTypeId: false }));
  };

  const handleTabChange = (tab: string) => {
    router.push(`/document-in/draft-handle?page=1&size=10&currentTab=${tab}`);
    setActiveTab(tab);
    SharedService.setCurrentTabDocIn(tab);
    setCurrentPage(1);
    setSelectedItems([]);
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
  const { data: consultNodeData } = useGetNextConsultNodes(user);

  const currentItemParam = useMemo(
    () => ({
      docId: selectedItems[0],
      isDelegate: false,
    }),
    [selectedItems]
  );

  const isChuaXuLyTab = activeTab === tabs.CHOXULY;
  const { data: checkActionRetakeData } = useCheckActionRetakeDocument(
    currentItemParam,
    isChuaXuLyTab && selectedItems.length === 1
  );
  const { data: checkActionImportDocData } = useCheckActionImportDocDocument(
    { ...currentItemParam, tab: "CHO_XU_LY" },
    isChuaXuLyTab && selectedItems.length === 1
  );
  const flowNodeParam = useMemo(
    () => ({
      nodeId:
        currentData?.content.find((d) => d.docId === selectedItems[0])
          ?.nodeId ?? "",
      single: false,
    }),
    [selectedItems, currentData]
  );
  const { data: searchFlowNodeData } = useSearchFlowNode(
    flowNodeParam,
    flowNodeParam.nodeId === null
  );
  const statusWaitForConsult =
    currentData?.content.find((d) => d.docId === selectedItems[0])?.status ===
    "Chờ cho ý kiến";
  const isNumberInBookNull =
    currentData?.content.find((d) => d.docId === selectedItems[0])
      ?.numberInBook === null;
  const showBookImport =
    !!checkActionImportDocData?.importDocBook &&
    selectedItems.length === 1 &&
    IMPORT_DOC_BOOK_BCY &&
    isNumberInBookNull;

  const inBookButton = !isCanHandleDoc && isChuaXuLyTab && showBookImport;

  const consultButton =
    !isCanHandleDoc &&
    !!consultNodeData &&
    selectedItems.length === 1 &&
    isChuaXuLyTab;
  const transferButton =
    !isCanHandleDoc && isChuaXuLyTab && !statusWaitForConsult && !inBookButton;

  const doneButton =
    isChuaXuLyTab &&
    searchFlowNodeData?.length !=
      searchFlowNodeData?.filter((node) => !node.lastNode).length &&
    !showBookImport &&
    selectedItems.length < 2;
  const returnButton =
    !isCanHandleDoc && selectedItems.length === 1 && isChuaXuLyTab;
  const retakeButton =
    checkActionRetakeData?.canRetake && RETAKE_BY_STEP_BCY && isChuaXuLyTab;
  const taskGivingButton =
    !isCanHandleDoc &&
    activeTab === tabs.DAHOANTHANH &&
    user?.authoritys.find(
      (x) =>
        (x.authority == "LEADERSHIP" || x.authority == "LEADERSHIP_UNIT") &&
        x.active
    );
  const goToDetailPage = (item: DocumentIn) => {
    const consult = item.status == "Chờ cho ý kiến";
    const param = {
      tab: activeTab,
      consult: consult,
      previousUrl: pathName,
    };
    router.push(
      `/document-in/draft-handle/draft-detail/${item.docId}?${createURLQueryString(param)}`
    );
  };
  const handleSort = (field: string) => {
    if (isBasicSearch) {
      setFilter((prev) => ({
        ...prev,
        sortBy: field,
        direction:
          prev.sortBy === field &&
          prev.direction === Constant.SORT_TYPE.INCREASE
            ? Constant.SORT_TYPE.DECREASE
            : Constant.SORT_TYPE.INCREASE,
        page: 1,
      }));
    } else {
      setAdvancedSearch((prev) => ({
        ...prev,
        sortBy: field,
        direction:
          prev.sortBy === field &&
          prev.direction === Constant.SORT_TYPE.INCREASE
            ? Constant.SORT_TYPE.DECREASE
            : Constant.SORT_TYPE.INCREASE,
        page: 1,
      }));
    }
  };
  const getSortIcon = (field: string) => {
    const sortBy = isAdvancedSearchExpanded
      ? advancedSearch?.sortBy
      : filter?.sortBy;
    const direction = isAdvancedSearchExpanded
      ? advancedSearch?.direction
      : filter?.direction;
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
      className: "text-center w-[3%] min-w-[40px]",
      sortable: false,
      accessor: (item: DocumentIn, index: number) => (
        <div
          className="flex items-center justify-center gap-2 py-1"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-xs font-medium">
            {(currentPage - 1) * itemsPerPage + index + 1}
          </span>
          <Checkbox
            checked={selectedItems.includes(item.docId)}
            onCheckedChange={(checked) =>
              handleSelectItem(item.docId, checked === true)
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
      className: "text-center w-[3%] min-w-[40px]",
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
          onClick={() => handleSort("NUMBER_SIGN")}
        >
          Số/Ký hiệu
        </div>
      ),
      className: "text-center w-[7%] min-w-[85px]",
      sortKey: "NUMBER_SIGN",
      accessor: (item: DocumentIn) => {
        if (!item) return "";

        const numberOrSign = item.numberOrSign ?? "";
        const numberInBook = item.numberInBook?.toString() ?? "";

        return numberOrSign.includes(numberInBook)
          ? numberOrSign
          : numberInBook + numberOrSign;
      },
    },
    {
      header: (
        <div
          className="flex justify-center items-center py-1 cursor-pointer"
          onClick={() => handleSort("DOC_TYPE")}
        >
          Loại văn bản
        </div>
      ),
      className: "text-center w-[7%] min-w-[85px]",
      sortKey: "DOC_TYPE",
      accessor: (item: DocumentIn) => item.docType.name,
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
      className: "text-left w-[33%] min-w-[220px]",
      sortKey: "PREVIEW",
      accessor: (item: DocumentIn) => (
        <span
          className="text-sm line-clamp-2 cursor-help text-gray-900"
          title={item.preview}
        >
          {item.preview.length > 60
            ? `${item.preview.substring(0, 60)}...`
            : item.preview}
        </span>
      ),
    },
    {
      header: "Đính kèm",
      className: "text-center w-[3%] min-w-[40px]",
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
    {
      header: (
        <div
          className="flex justify-center items-center py-1 cursor-pointer"
          onClick={() => handleSort("USER_ENTER")}
        >
          Người tạo
        </div>
      ),
      className: "text-center w-[10%] min-w-[110px]",
      sortKey: "USER_ENTER",
      accessor: (item: DocumentIn) => item.userEnter.fullName,
    },
    {
      header: (
        <div
          className="flex justify-center items-center py-1 cursor-pointer"
          onClick={() => handleSort("CREATE_DATE")}
        >
          Ngày tạo
        </div>
      ),
      className: "text-center w-[5%] min-w-[85px] whitespace-nowrap",
      sortKey: "CREATE_DATE",
      accessor: (item: DocumentIn) => formatDate(item.createDate),
    },
    {
      header: (
        <div
          className="flex justify-center items-center py-1 cursor-pointer"
          onClick={() => handleSort("HANDLE_USER")}
        >
          Người xử lý
        </div>
      ),
      className: "text-center w-[10%] min-w-[110px]",
      sortKey: "HANDLE_USER",
      accessor: (item: DocumentIn) => item.handleUser.fullName,
    },
    {
      header: (
        <div
          className="flex justify-center items-center py-1 cursor-pointer"
          onClick={() => handleSort("HANDLE_DATE")}
        >
          Ngày xử lý
        </div>
      ),
      className: "text-center w-[5%] min-w-[85px] whitespace-nowrap",
      sortKey: "HANDLE_DATE",
      accessor: (item: DocumentIn) => formatDate(item.handleDate),
    },
    {
      header: (
        <div
          className="flex justify-center items-center py-1 cursor-pointer"
          onClick={() => handleSort("SECURITY")}
        >
          Độ mật
        </div>
      ),
      className: "text-center w-[4%] min-w-[60px]",
      sortKey: "SECURITY",
      accessor: (item: DocumentIn) => (
        <span
          className={cn(
            "text-xs whitespace-nowrap font-semibold",
            getSecurityColor(item.security.name)
          )}
        >
          {item.security.name}
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
      className: "text-center w-[6%] min-w-[75px]",
      accessor: (item: DocumentIn) => {
        return (
          <span
            className={cn(
              "inline-flex items-center px-2 py-1 rounded border text-xs whitespace-nowrap font-semibold",
              getStatusColor(item.docStatusName)
            )}
            style={getStatusStyle(item.docStatusName)}
          >
            {item.docStatusName}
          </span>
        );
      },
    },
  ];
  const draftHandleRequestsData = currentData?.content || [];

  useEffect(() => {
    if (isEncrypt) {
      EncryptionService.isCheckStartUsbTokenWatcher();
    }
    setIsCanHandleDoc(isEncrypt);
  }, [isEncrypt]);
  useEffect(() => {
    SharedService.setCurrentMenuDocIn(Constant.DOCUMENT_IN_MENU.HANDLE);
    SharedService.setCurrentTabDocIn(activeTab);
  }, [activeTab]);
  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <BreadcrumbNavigation
          items={[
            {
              label: "Văn bản đi",
            },
          ]}
          currentPage="Văn bản xử lý"
          showHome={false}
          className="ml-3"
        />
        <div className="flex items-center gap-3 mr-3">
          <SearchInput
            placeholder={"Tìm kiếm Số/Ký hiệu | Trích yếu | Tên đăng nhập"}
            value={searchQuery}
            setSearchInput={(input) => {
              setIsBasicSearch(true);
              setSearchQuery(input);
              setHasSubmittedAdvancedSearch(false);
            }}
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
              // isAdvancedSearchExpanded
              //   ? "bg-blue-50 border-blue-300 text-blue-700"
              //   : ""
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
                        setTimeout(() => {
                          setShowSuggestions((prev) => ({
                            ...prev,
                            docTypeId: false,
                          }));
                        }, 200);
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
                        ...(docFieldCategory || [])?.map((item) => ({
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
                      //placeholder="-- Chọn --"
                      className="w-full data-[placeholder]:text-black"
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
        {/* Bulk Actions and Document Type Selector */}
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            {/* Bulk Actions */}
            {selectedItems.length > 0 && (
              <>
                {transferButton && (
                  <TransferDocumentIn
                    selectedItemId={Number(selectedItems[0]) || null}
                    disabled={selectedItems.length === 0}
                    onSuccess={() => {
                      ToastUtils.transferSuccess();

                      setSelectedItems([]);
                      refetch();
                    }}
                    listNextNode={searchFlowNodeData ?? []}
                    isTransferDraft={true}
                  />
                )}

                {consultButton && (
                  <ConsultHandler
                    selectedItemId={Number(selectedItems[0]) || null}
                    currentNode={
                      currentData?.content?.find(
                        (item) => item.docId === Number(selectedItems[0])
                      )?.nodeId || null
                    }
                    consultNodeData={consultNodeData}
                    disabled={selectedItems.length === 0}
                    onSuccess={() => {
                      setSelectedItems([]);
                      refetch();
                    }}
                  />
                )}
                {returnButton && (
                  <ReturnHandler
                    selectedItemId={selectedItems[0]}
                    currentNode={
                      currentData?.content?.find(
                        (item) => item.docId === Number(selectedItems[0])
                      )?.nodeId ?? null
                    }
                    onSuccess={() => {
                      ToastUtils.documentReturnSuccess();
                      setSelectedItems([]);
                      refetch();
                    }}
                  />
                )}
                {retakeButton && (
                  <RetakeHandler
                    selectedItemId={selectedItems[0]}
                    onSuccess={() => {
                      ToastUtils.documentRetakeSuccess();
                      setSelectedItems([]);
                      refetch();
                    }}
                  />
                )}
                {inBookButton && (
                  <ToBookHandler
                    selectedItemId={Number(selectedItems[0]) || null}
                    onSuccess={() => {
                      ToastUtils.success("Vào sổ thành công!");

                      setSelectedItems([]);
                      refetch();
                    }}
                  />
                )}
                {doneButton && (
                  <DoneHandler
                    selectedItem={selectedItems}
                    onSuccess={() => {
                      ToastUtils.documentCompleteSuccess();
                      setSelectedItems([]);
                      refetch();
                    }}
                  />
                )}
                {taskGivingButton && (
                  <TaskGivingHandler selectedItemId={selectedItems[0]} />
                )}
              </>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                activeTab === tabs.CHOXULY
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => handleTabChange(tabs.CHOXULY)}
            >
              Chờ xử lý
            </button>
            <button
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                activeTab === tabs.DAXULY
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => handleTabChange(tabs.DAXULY)}
            >
              Đang xử lý
            </button>
            <button
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                activeTab === tabs.DAHOANTHANH
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => handleTabChange(tabs.DAHOANTHANH)}
            >
              Đã hoàn thành
            </button>
          </div>

          <EncryptDisplaySelect selectClassName="w-36 h-9 text-xs" />
        </div>

        {/* Table */}
        <Table
          sortable={true}
          columns={draftHandleColumns}
          dataSource={draftHandleRequestsData}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          showPagination={true}
          bgColor="bg-white"
          loading={isLoading}
          rowClassName={(item, index) => {
            const isUnread =
              activeTab === tabs.CHOXULY && item && item.read === false;
            const stripeClass = index % 2 === 0 ? "bg-white" : "bg-[#0000000d]";
            return isUnread ? `${stripeClass} font-bold` : stripeClass;
          }}
          emptyText={<EmptyDocument />}
          onRowClick={goToDetailPage}
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
