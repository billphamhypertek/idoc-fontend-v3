"use client";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import React, { useEffect, useState, useMemo } from "react";
import {
  ChevronUp,
  ChevronDown,
  Paperclip,
  Plus,
  RotateCcw,
  Search,
  Send,
  Star,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Table } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import {
  formatDate,
  formatDateYMD,
  parseDateStringYMD,
} from "@/utils/datetime.utils";
import {
  DocAttachment,
  DocSign,
  DocumentIn,
} from "@/definitions/types/document.type";
import { SearchInput } from "@/components/document-in/SearchInput";
import { useRouter, useSearchParams } from "next/navigation";
import { Column } from "@/definitions/types/table.type";
import AttachmentDialog from "@/components/common/AttachmentDialog";
import {
  useDeleteDraft,
  useDocumentInListIssued,
  useToggleImportant,
} from "@/hooks/data/document-in.data";
import { toast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import SelectCustom from "@/components/common/SelectCustom";
import FilterField from "@/components/common/FilterFiled";
import { useGetCategoriesByCode } from "@/hooks/data/category.data";
import { CategoryCode } from "@/definitions/types/category.type";
import ForwardReceivePlace from "@/components/document-in/ForwardReceivePlace";
import { ToastUtils } from "@/utils/toast.utils";
import { Constant } from "@/definitions/constants/constant";
import { SharedService } from "@/services/shared.service";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import EncryptDisplaySelect from "@/components/document-out/EncryptDisplaySelect";
import { EmptyDocument } from "@/components/common/EmptyDocument";
import { EncryptionService } from "@/services/encryption.service";
import { useEncryptStore } from "@/stores/encrypt.store";
import { CustomDatePicker } from "@/components/ui/calendar";
import { getStatusColor, getStatusStyle } from "@/utils/status-colors.utils";
import { TabNames } from "@/definitions/enums/document.enum";
import { Label } from "@/components/ui/label";

const tabs = { CHOBANHANH: "waitIssued", DABANHANH: "issued" };

const getSecurityColor = (status: string | undefined) => {
  const colorMap = {
    Thường: "bg-cyan-50 text-cyan-800 border-cyan-200",
    Mật: "bg-rose-200 text-rose-800 border-rose-200",
  };
  return (
    colorMap[status as keyof typeof colorMap] ||
    "bg-gray-50 text-gray-800 border-gray-200"
  );
};

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
  sortBy: "",
  direction: Constant.SORT_TYPE.DECREASE,
  startCreate: "",
  endCreate: "",
  docTypeId: "",
  sign: "",
  preview: "",
  important: "",
};
const baseFilter = {
  page: 1,
  sortBy: "",
  direction: Constant.SORT_TYPE.DECREASE,
  size: Constant.ITEMS_PER_PAGE,
};

export default function DocumentInDraftIssued() {
  const router = useRouter();
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

  const [activeTab, setActiveTab] = useState(tabs.CHOBANHANH);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const [filter, setFilter] = useState(baseFilter);
  const [searchQuery, setSearchQuery] = useState("");
  const [advancedSearch, setAdvancedSearch] = useState(advancedSearchInit);
  const [tempAdvancedSearch, setTempAdvancedSearch] =
    useState(advancedSearchInit);

  const [isAdvancedSearchExpanded, setIsAdvancedSearchExpanded] =
    useState(false);
  const [isBasicSearch, setIsBasicSearch] = useState(true);
  const [hasSubmittedAdvancedSearch, setHasSubmittedAdvancedSearch] =
    useState(false);

  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const [openAttach, setOpenAttach] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState<
    DocAttachment[]
  >([]);

  const [docTypeCategory, setDocTypeCategory] = useState<CategoryCode[]>([]);

  // DocType suggestions state
  const [showSuggestions, setShowSuggestions] = useState({
    docTypeId: false,
  });
  const [docTypeInput, setDocTypeInput] = useState("");
  const [isCheckShowButton, setIsCheckShowButton] = useState(false);
  const [filteredDocTypeSuggestions, setFilteredDocTypeSuggestions] = useState<
    string[]
  >([]);

  const deleteMutation = useDeleteDraft();

  const basicParam = useMemo(
    () => ({
      ...filter,
      text: searchQuery,
    }),
    [filter, searchQuery]
  );

  const advancedParams = useMemo(
    () => ({
      ...filter,
      text: searchQuery,
      ...advancedSearch,
    }),
    [filter, advancedSearch, searchQuery]
  );

  const [actualParams, setActualParams] = useState(basicParam);

  useEffect(() => {
    if (isBasicSearch) {
      setActualParams(basicParam);
    } else if (hasSubmittedAdvancedSearch) {
      setActualParams(advancedParams);
    }
  }, [isBasicSearch, basicParam, advancedParams, hasSubmittedAdvancedSearch]);

  const actionUrl =
    activeTab === tabs.CHOBANHANH
      ? "3"
      : activeTab === tabs.DABANHANH
        ? "4"
        : "";

  const {
    data: currentData,
    isLoading,
    error,
    refetch,
  } = useDocumentInListIssued(actionUrl, actualParams);
  const { data: docTypeCategoryData } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.DOC_TYPE
  );
  useEffect(() => {
    if (docTypeCategoryData) setDocTypeCategory(docTypeCategoryData);
  }, [docTypeCategoryData]);

  useEffect(() => {
    SharedService.setCurrentTabDocIn(activeTab as TabNames);
  }, [activeTab]);

  // Keep text input in sync with selected docTypeId
  useEffect(() => {
    if (!tempAdvancedSearch.docTypeId) {
      setDocTypeInput("");
      return;
    }
    const match = docTypeCategory?.find(
      (c) => c.id.toString() === tempAdvancedSearch.docTypeId
    );
    setDocTypeInput(match?.name || "");
  }, [tempAdvancedSearch.docTypeId, docTypeCategory]);

  const filterDocTypes = (keyword: string = "") => {
    const base = ["Tất cả", ...(docTypeCategory || []).map((c) => c.name)];
    const k = keyword.trim().toLowerCase();
    const data = k ? base.filter((n) => n.toLowerCase().includes(k)) : base;
    setFilteredDocTypeSuggestions(data);
    setShowSuggestions((p) => ({ ...p, docTypeId: true }));
  };

  const selectDocType = (label: string) => {
    setDocTypeInput(label);
    const matched = docTypeCategory?.find((c) => c.name === label);
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

  const tableData = currentData?.objList ?? [];
  const totalItems = currentData?.totalRecord || 0;

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
  const handleAttachmentClick = (row: DocSign) => {
    setSelectedAttachments(row.attachments || []);
    setOpenAttach(true);
  };
  const handlePageChange = (p: number) => {
    setFilter((prev) => ({
      ...prev,
      page: p,
    }));
    setSelectedItems([]);
    router.push(
      `/document-in/draft-issued?page=${p}&size=${filter.size}&currentTab=${activeTab}`
    );
  };
  const handleItemPerPageChange = (s: number) => {
    setFilter((prev) => ({
      ...prev,
      page: 1,
      size: s,
    }));
    setSelectedItems([]);
    setTimeout(() => {
      router.push(
        `/document-in/draft-issued?page=1&size=${s}&currentTab=${activeTab}`
      );
    }, 0);
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setFilter((prev) => ({
      ...prev,
      page: 1,
    }));
    setSelectedItems([]);
    router.push(`/document-in/draft-issued?page=1&size=10&currentTab=${tab}`);
  };

  const handleSort = (field: string) => {
    if (isAdvancedSearchExpanded) {
      setAdvancedSearch((prev) => ({
        ...prev,
        sortBy: field,
        direction:
          prev.sortBy === field
            ? prev.direction === Constant.SORT_TYPE.DECREASE
              ? Constant.SORT_TYPE.INCREASE
              : Constant.SORT_TYPE.DECREASE
            : Constant.SORT_TYPE.DECREASE,
        page: 1,
      }));
    } else {
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
    }
  };
  const handleSelectItem = (itemId: number, checked: boolean) => {
    setSelectedItems(checked ? [itemId] : []); // allow only 1 item
  };
  const forwardButton = selectedItems.length > 0;
  const handleIssueClick = () => {
    if (selectedItems.length > 0 && selectedItems.length === 1) {
      router.push(
        `/document-in/draft-issued/issued-update/${selectedItems[0]}`
      );
    } else {
      // disabled because only 1 item can be selected
    }
  };
  const handleDeleteClick = () => {
    if (!(tableData && tableData.length > 0)) {
      ToastUtils.xoaVanBanFail();
      return;
    }
    const findingItem = tableData.find(
      (item) => item.docOutId === selectedItems[0]
    );
    if (
      !(
        findingItem &&
        findingItem.docStatusEnum == "CHO_BAN_HANH" &&
        findingItem.attachments.length == 0
      )
    ) {
      ToastUtils.xoaVanBanFail();
      return;
    }
    setIsConfirmDialogOpen(true);
  };
  const handleDeleteConfirm = () => {
    deleteMutation.mutate(String(selectedItems[0]), {
      onSuccess: () => {
        ToastUtils.success("Xoá văn bản thành công");
        setSelectedItems([]);
        refetch();
      },
    });
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
  const draftHandleColumns: Column<DocSign>[] = [
    {
      header: "STT",
      className: "text-center w-[3%] min-w-[40px]",
      sortable: false,
      accessor: (item: DocSign, index: number) => (
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
      className: "text-center w-[3%] min-w-[40px]",
      sortKey: "IMPORTANT",
      sortable: false,
      accessor: (item: DocSign) => (
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
      className: "text-center w-[10%] min-w-[85px]",
      sortKey: "NUMBERSIGN",
      accessor: (i: DocSign) => {
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
          onClick={() => handleSort("DOC_TYPE")}
        >
          Loại văn bản
        </div>
      ),
      className: "text-center w-[7%] min-w-[85px]",
      sortKey: "DOC_TYPE",
      accessor: (i: DocSign) => i.docTypeName,
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
      className: "text-center w-[12%] min-w-[110px]",
      sortKey: "USER_ENTER",
      accessor: (i: DocSign) => i.personEnter,
    },
    {
      header: (
        <div
          className="flex justify-center items-center py-1 cursor-pointer"
          onClick={() =>
            handleSort(
              activeTab === tabs.CHOBANHANH ? "CREATEDATE" : "CREATEDATE"
            )
          }
        >
          {activeTab === tabs.CHOBANHANH ? "Ngày tạo" : "Ngày ban hành"}
        </div>
      ),
      className: "text-center w-[5%] min-w-[85px] whitespace-nowrap",
      sortKey: activeTab === tabs.CHOBANHANH ? "CREATEDATE" : "CREATEDATE",
      accessor: (i: DocSign) =>
        formatDate(activeTab === tabs.CHOBANHANH ? i.createDate : i.dateIssued),
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
      className: "text-left w-[39%] min-w-[250px]",
      sortKey: "PREVIEW",
      accessor: (item: DocSign) => (
        <span
          className="max-w-[700px] line-clamp-2 text-sm leading-relaxed text-ellipsis"
          title={item.preview}
        >
          {item.preview}
        </span>
      ),
    },
    {
      header: "Đính kèm",
      className: "text-center w-[3%] min-w-[40px]",
      sortable: false,
      accessor: (item: DocSign) =>
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
          onClick={() => handleSort("STATUS")}
        >
          Trạng thái
        </div>
      ),
      className: "text-center w-[7%] min-w-[75px]",
      sortKey: "STATUS",
      accessor: (item: DocSign) => (
        <span
          className={cn(
            "inline-flex items-center px-2 py-1 rounded border text-xs whitespace-nowrap font-semibold",
            getStatusColor(item.status)
          )}
          style={getStatusStyle(item.status)}
        >
          {item.status}
        </span>
      ),
    },
    {
      header: (
        <div
          className="flex justify-center items-center py-1 cursor-pointer"
          onClick={() => handleSort("SECURITY_NAME")}
        >
          Độ mật
        </div>
      ),
      className: "text-center w-[4%] min-w-[60px]",
      sortKey: "SECURITY_NAME",
      accessor: (item: DocSign) => (
        <span
          className={cn(
            "inline-flex items-center px-2 py-1 rounded border text-xs whitespace-nowrap font-semibold",
            getSecurityColor(item.securityName)
          )}
        >
          {item.securityName}
        </span>
      ),
    },
    {
      header: "Ghi chú",
      className: "text-center w-[7%] min-w-[80px]",
      sortable: false,
      accessor: (item: DocSign) => item.note,
    },
  ];
  useEffect(() => {
    SharedService.setCurrentMenuDocIn(Constant.DOCUMENT_IN_MENU.ISSUED);
  }, []);
  useEffect(() => {
    if (isEncrypt) {
      EncryptionService.isCheckStartUsbTokenWatcher(() => {
        router.push("/document-in/draft-issued");
      });
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
          currentPage="Văn bản ban hành"
          showHome={false}
          className="ml-3"
        />
        <div className="flex items-center gap-3">
          <SearchInput
            placeholder={"Tìm kiếm Số/Ký hiệu | Trích yếu"}
            value={searchQuery}
            setSearchInput={(v) => {
              setSearchQuery(v);
              setIsBasicSearch(true);
              setHasSubmittedAdvancedSearch(false);
            }}
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
                      placeholder="-- Chọn --"
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
        {activeTab === tabs.CHOBANHANH && (
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="outline"
              className="text-white border-0 h-9 px-3 text-xs disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 hover:text-white"
              onClick={() =>
                router.push("/document-in/draft-issued/issued-insert")
              }
            >
              <Plus className="w-4 h-4 mr-1" />
              Thêm mới ban hành
            </Button>
            {selectedItems.length > 0 && !isCheckShowButton && (
              <>
                <Button
                  variant="outline"
                  className="text-white border-0 h-9 px-3 text-xs disabled:opacity-50 disabled:cursor-not-allowed bg-blue-600 hover:bg-blue-700 hover:text-white"
                  onClick={() => handleIssueClick()}
                >
                  <Send className="w-4 h-4 mr-1" />
                  Ban Hành
                </Button>
                <Button
                  variant="outline"
                  className="text-white border-0 h-9 px-3 text-xs disabled:opacity-50 disabled:cursor-not-allowed bg-[#ef6e6e] hover:bg-[#eb4c4c]"
                  onClick={() => handleDeleteClick()}
                >
                  <Trash2 className="w-4 h-4 mr-1" />
                  Xóa văn bản
                </Button>
              </>
            )}
          </div>
        )}
        {activeTab === tabs.DABANHANH &&
          !isCheckShowButton &&
          selectedItems.length > 0 && (
            <div className="flex items-center gap-2 mb-4">
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
            </div>
          )}

        {/* Tab Navigation */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                activeTab === tabs.CHOBANHANH
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => handleTabChange(tabs.CHOBANHANH)}
            >
              Chờ xử lý
            </button>
            <button
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                activeTab === tabs.DABANHANH
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => handleTabChange(tabs.DABANHANH)}
            >
              Hoàn thành
            </button>
          </div>

          <EncryptDisplaySelect
            onChange={() => {
              handlePageChange(1);
            }}
            selectClassName="w-36 h-9 text-xs"
          />
        </div>
        <Table
          sortable={true}
          columns={draftHandleColumns}
          dataSource={tableData}
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
                Constant.DOCUMENT_IN_MENU.ISSUED
              );
              router.push(`/document-in/draft-handle/draft-detail/${id}`);
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
      <ConfirmDeleteDialog
        isOpen={isConfirmDialogOpen}
        onOpenChange={setIsConfirmDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Hãy xác nhận"
        description="Bạn có chắc chắn muốn xóa văn bản?"
        confirmText="Đồng ý"
        cancelText="Hủy"
      />
    </div>
  );
}
