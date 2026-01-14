"use client";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import { SearchInput } from "@/components/document-in/SearchInput";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Paperclip,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table } from "@/components/ui/table";
import AttachmentDialog from "@/components/common/AttachmentDialog";
import { useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { DocAttachment, DocSign } from "@/definitions/types/document.type";
import { Column } from "@/definitions";
import { Checkbox } from "@/components/ui/checkbox";
import {
  formatDate,
  formatDateYMD,
  parseDateStringYMD,
} from "@/utils/datetime.utils";
import {
  useCheckActionRetakeDocument,
  useDeleteDraft,
  useDocumentInListDocSign,
  useDocumentInListIssued,
  useToggleImportant,
} from "@/hooks/data/document-in.data";
import { Constant } from "@/definitions/constants/constant";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import { ToastUtils } from "@/utils/toast.utils";
import { DoneHandler } from "@/components/document-in/doneHandler";
import { RetakeHandler } from "@/components/document-in/retakeHandler";
import {
  useGetNextConsultNodes,
  useGetStartNode,
  useSearchFlowNode,
} from "@/hooks/data/bpmn2.data";
import { ConsultHandler } from "@/components/document-in/consultHandler";
import useAuthStore from "@/stores/auth.store";
import { canViewNoStatus, handleError } from "@/utils/common.utils";
import { SharedService } from "@/services/shared.service";
import { TransferDocumentIn } from "@/components/document-in/TranferDocumentIn";
import SelectCustom from "@/components/common/SelectCustom";
import FilterField from "@/components/common/FilterFiled";
import { useGetCategoriesByCode } from "@/hooks/data/category.data";
import EncryptDisplaySelect from "@/components/document-out/EncryptDisplaySelect";
import { EmptyDocument } from "@/components/common/EmptyDocument";
import { useEncryptStore } from "@/stores/encrypt.store";
import { EncryptionService } from "@/services/encryption.service";
import { CustomDatePicker } from "@/components/ui/calendar";
import { getStatusColor, getStatusStyle } from "@/utils/status-colors.utils";
import { downloadFile, viewFile } from "@/utils/file.utils";
import DailyReportAttachmentInfo from "@/components/daily-report/DailyReportAttachmentInfo";
import { Label } from "@/components/ui/label";

const tabs = {
  DU_THAO: "draft",
  DA_TRINH_KY: "draftOnSign",
  DA_BAN_HANH: "draftIssued",
};
const baseFilter = {
  page: 1,
  sortBy: "",
  direction: Constant.SORT_TYPE.DECREASE,
  size: Constant.ITEMS_PER_PAGE,
};

const advanceSearchInit = {
  startCreate: "",
  endCreate: "",
  docTypeId: "",
  sign: "",
  preview: "",
  important: "",
  sortBy: "",
  direction: Constant.SORT_TYPE.DECREASE,
};
const basicSearchInit = {
  text: "",
};

export default function DocumentInDraftList() {
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

  const [activeTab, setActiveTab] = useState(tabs.DU_THAO);
  const [filter, setFilter] = useState(baseFilter);
  const [basicSearch, setBasicSearch] = useState(basicSearchInit);

  const [isAdvancedSearchExpanded, setIsAdvancedSearchExpanded] =
    useState(false);
  const [isBasicSearch, setIsBasicSearch] = useState(true);
  const [hasSubmittedAdvancedSearch, setHasSubmittedAdvancedSearch] =
    useState(false);
  const [advancedSearch, setAdvancedSearch] = useState(advanceSearchInit);
  const [tempAdvancedSearch, setTempAdvancedSearch] =
    useState(advanceSearchInit);
  const [openAttach, setOpenAttach] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState<
    DocAttachment[]
  >([]);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [documentIdToDelete, setDocumentIdToDelete] = useState<number | null>(
    null
  );
  const [isCheckShowButton, setIsCheckShowButton] = useState(false);

  const HIDE_BTN_RETAKE_H05 = Constant.HIDE_BTN_RETAKE_H05;

  // DocType suggestions state
  const [showSuggestions, setShowSuggestions] = useState({
    docTypeId: false,
  });
  const [docTypeInput, setDocTypeInput] = useState("");
  const [filteredDocTypeSuggestions, setFilteredDocTypeSuggestions] = useState<
    string[]
  >([]);

  const deleteMutation = useDeleteDraft();
  const { data: docTypeCategory } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.DOC_TYPE
  );

  const { mutate: toggleImportant } = useToggleImportant();
  const setImportant = (r: DocSign) => {
    toggleImportant({ docId: r.docOutId, important: !Boolean(r.important) });
  };
  const params = useMemo(
    () =>
      isBasicSearch
        ? { ...filter, ...basicSearch }
        : { ...filter, ...advancedSearch },
    [isBasicSearch, filter, basicSearch, advancedSearch]
  );

  const [actualParams, setActualParams] = useState(params);

  useEffect(() => {
    if (isBasicSearch) {
      setActualParams({ ...filter, ...basicSearch });
    } else if (hasSubmittedAdvancedSearch) {
      setActualParams({ ...filter, ...advancedSearch });
    }
  }, [
    isBasicSearch,
    filter,
    basicSearch,
    advancedSearch,
    hasSubmittedAdvancedSearch,
  ]);

  const {
    data: docSignData,
    isLoading: docSignLoading,
    error: docSignError,
    refetch: docSignRefetch,
  } = useDocumentInListDocSign(actualParams);
  const actionUrl =
    activeTab === tabs.DA_TRINH_KY
      ? "1"
      : activeTab === tabs.DA_BAN_HANH
        ? "2"
        : "";
  const {
    data: listIssuedData,
    isLoading: listIssuedLoading,
    error: listIssuedError,
    refetch: listIssuedRefetch,
  } = useDocumentInListIssued(actionUrl, actualParams);

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

  const handleAdvancedSearchSubmit = () => {
    setAdvancedSearch(tempAdvancedSearch);
    setIsBasicSearch(false);
    setHasSubmittedAdvancedSearch(true);
  };
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setFilter((prev) => ({
      ...prev,
      page: 1,
      size: 10,
    }));
    setSelectedItems([]);
    router.push(
      `/document-in/draft-list?page=${1}&size=${10}&currentTab=${tab}`
    );
  };
  const handleAttachmentClick = (row: DocSign) => {
    const attachDrafts = row.attachments.filter(
      (attach: any) =>
        attach.attachmentType == Constant.DOCUMENT_IN_FILE_TYPE.DRAFT
    );
    setSelectedAttachments(attachDrafts || []);
    setOpenAttach(true);
  };

  const handlePageChange = (p: number) => {
    setFilter((prev) => ({
      ...prev,
      page: p,
    }));
    setSelectedItems([]);
    router.push(
      `/document-in/draft-list?page=${p}&size=${filter.size}&currentTab=${activeTab}`
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
        `/document-in/draft-list?page=1&size=${s}&currentTab=${activeTab}`
      );
    }, 0);
  };

  const handleAdvancedSearchReset = () => {
    setIsBasicSearch(true);
    setTempAdvancedSearch(advanceSearchInit);
    setAdvancedSearch(advanceSearchInit);
    setHasSubmittedAdvancedSearch(false);
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
  const getSortIcon = (field: string) => {
    if (filter.sortBy !== field) {
      return null; // Không hiển thị icon khi chưa sort
    }
    // return filter.direction === Constant.SORT_TYPE.INCREASE ? (
    //   <ArrowUp className="w-4 h-4 ml-1 text-blue-600" />
    // ) : (
    //   <ArrowDown className="w-4 h-4 ml-1 text-blue-600" />
    // );
  };
  const doDeleteDocument = (documentId: number) => {
    setDocumentIdToDelete(documentId);
    setIsDeleteConfirmOpen(true);
  };

  const handleClickDelete = () => {
    deleteMutation.mutate(String(documentIdToDelete), {
      onSuccess: () => {
        console.log("Xoá thành công");
        ToastUtils.documentReturnSuccess();
        setIsDeleteConfirmOpen(false);
        setDocumentIdToDelete(null);
      },
      onError: (err) => {
        handleError(err);
      },
    });
  };

  const isView = (fileName: string) => {
    return canViewNoStatus(fileName);
  };

  const handleViewFile = async (file: any) => {
    try {
      await viewFile(file, Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_IN);
    } catch (error) {
      ToastUtils.error("Lỗi không tìm thấy tệp phù hợp");
    }
  };

  const handleDownloadFile = async (fileName: string, encrypt: boolean) => {
    try {
      await downloadFile(
        fileName,
        Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_IN,
        encrypt
      );
    } catch (error) {
      ToastUtils.error("Lỗi không tìm thấy tệp phù hợp");
    }
  };

  const loading =
    activeTab === tabs.DU_THAO ? docSignLoading : listIssuedLoading;
  const error = activeTab === tabs.DU_THAO ? docSignError : listIssuedError;
  const refetch =
    activeTab === tabs.DU_THAO ? docSignRefetch : listIssuedRefetch;

  const baseColumns: Column<DocSign>[] = [
    {
      header: "STT",
      className: "text-center w-[3%] min-w-[40px]",
      sortable: false,
      accessor: (item: DocSign, index: number) => (
        <div
          className="flex items-center justify-center gap-2 py-1"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-xs font-medium">
            {(filter.page - 1) * filter.size + index + 1}
          </span>
          <Checkbox
            checked={selectedItems.includes(item.docOutId)}
            onCheckedChange={(checked) =>
              handleSelectItem(item.docOutId, checked === true)
            }
          />
        </div>
      ),
    },
    {
      header: (
        <div
          className="flex justify-center items-center py-1 cursor-pointer"
          onClick={() => handleSort("important")}
        >
          <Star className="w-4 h-4 text-gray-400 mx-auto" />
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
          {getSortIcon("NUMBERSIGN")}
        </div>
      ),
      sortKey: "NUMBERSIGN",
      className: "text-center w-[7%] min-w-[85px] font-semibold",
      accessor: (item: DocSign) => {
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
          className="flex justify-center items-center py-1 cursor-pointer hover:text-blue-700"
          onClick={() => handleSort("docTypeName")}
        >
          Loại văn bản
          {getSortIcon("docTypeName")}
        </div>
      ),
      className: "text-center w-[7%] min-w-[85px]",
      sortKey: "docTypeName",
      accessor: (item: DocSign) => item.docTypeName,
    },
    {
      header: (
        <div
          className="flex justify-center items-center py-1 cursor-pointer hover:text-blue-700"
          onClick={() => handleSort("personEnter")}
        >
          Người tạo
          {getSortIcon("personEnter")}
        </div>
      ),
      className: "text-center w-[12%] min-w-[110px]",
      sortKey: "personEnter",
      accessor: (item: DocSign) => item.personEnter,
    },
    {
      header: (
        <div
          className="flex justify-center items-center py-1 cursor-pointer hover:text-blue-700"
          onClick={() => handleSort("createDate")}
        >
          Ngày tạo
          {getSortIcon("createDate")}
        </div>
      ),
      className: "text-center w-[5%] min-w-[85px] whitespace-nowrap",
      sortKey: "createDate",
      accessor: (item: DocSign) => formatDate(item.createDate),
    },
  ];
  const trailingColumns: Column<DocSign>[] = [
    {
      header: (
        <div
          className="flex justify-start items-center py-1 cursor-pointer hover:text-blue-700"
          onClick={() => handleSort("preview")}
        >
          Trích yếu
          {getSortIcon("preview")}
        </div>
      ),
      className: "text-left w-[38%] min-w-[250px]",
      sortKey: "preview",
      accessor: (item: DocSign) => (
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
      accessor: (item: DocSign) => {
        const attachDrafts = item.attachments.filter(
          (attach: any) =>
            attach.attachmentType == Constant.DOCUMENT_IN_FILE_TYPE.DRAFT
        );
        return (
          <>
            {attachDrafts?.length === 1 && (
              // <Paperclip
              //   className="w-4 h-4 text-blue-600 mx-auto cursor-pointer hover:opacity-70"
              //   onClick={(e) => {
              //     e.stopPropagation();
              //     handleAttachmentClick(item);
              //   }}
              // />
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isView(attachDrafts[0].name)) {
                    handleViewFile(attachDrafts[0]);
                  } else {
                    handleDownloadFile(
                      attachDrafts[0].name,
                      attachDrafts[0].encrypt ?? false
                    );
                  }
                }}
                className="text-yellow-600 hover:text-yellow-800"
                title={attachDrafts[0].displayName}
              >
                <Paperclip className="w-4 h-4 text-blue-600" />
              </Button>
            )}
            {attachDrafts?.length > 1 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAttachmentClick(item);
                }}
                title={`${attachDrafts.length} files`}
              >
                <Paperclip className="w-4 h-4 text-blue-600" />
              </Button>
            )}
          </>
        );
      },
    },
    {
      header: (
        <div
          className="flex justify-center items-center py-1 cursor-pointer hover:text-blue-700"
          onClick={() => handleSort("status")}
        >
          Trạng thái
          {getSortIcon("status")}
        </div>
      ),
      className: "text-center w-[7%] min-w-[75px]",
      sortKey: "status",
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
  ];
  const duThaoColumns: Column<DocSign>[] = [
    ...baseColumns,
    ...trailingColumns,
    {
      header: "Thao tác",
      sortable: false,
      type: "actions" as const,
      className: "text-center py-2 w-[3%] min-w-[70px]",
      renderActions: (item) => (
        <div className="flex items-center justify-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-7 p-0 hover:bg-blue-50"
            onClick={() =>
              router.push(
                `/document-in/draft-list/draft-update/${item.docOutId}`
              )
            }
          >
            <Pencil className="h-4 w-4 text-blue-600" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-7 p-0 hover:bg-red-50"
            onClick={() => doDeleteDocument(item.docOutId)}
          >
            <Trash2 className="h-4 w-4 text-red-600" />
          </Button>
        </div>
      ),
    },
  ];
  const trinhKyColumns: Column<DocSign>[] = [
    ...baseColumns,
    {
      header: (
        <div
          className="flex justify-center items-center py-1 cursor-pointer hover:text-blue-700"
          onClick={() => handleSort("personHandle")}
        >
          Người xử lý
          {getSortIcon("personHandle")}
        </div>
      ),
      className: "text-center w-[12%] min-w-[110px]",
      sortKey: "personHandle",
      accessor: (item: DocSign) => item.personHandle,
    },
    ...trailingColumns,
  ];
  const hoanThanhColumns: Column<DocSign>[] = [
    ...baseColumns,
    ...trailingColumns,
  ];
  const tableColumns: Column<DocSign>[] =
    activeTab === tabs.DU_THAO
      ? duThaoColumns
      : activeTab === tabs.DA_TRINH_KY
        ? trinhKyColumns
        : hoanThanhColumns;
  const docSignRequestData = docSignData?.objList || [];
  const listIssuedRequestData = listIssuedData?.objList || [];
  const currentData =
    activeTab === tabs.DU_THAO ? docSignRequestData : listIssuedRequestData;
  const totalItems =
    activeTab === tabs.DU_THAO
      ? docSignData?.totalRecord || 0
      : listIssuedData?.totalRecord || 0;
  const currentItemParam = useMemo(
    () => ({
      docId: selectedItems[0],
      isDelegate: false,
    }),
    [selectedItems]
  );
  const { data: consultNodeData } = useGetStartNode(
    Constant.THREAD_TYPE.CONSULT
  );

  const { data: checkActionRetakeData } = useCheckActionRetakeDocument(
    currentItemParam,
    activeTab === tabs.DU_THAO && selectedItems.length === 1
  );

  const flowNodeParam = useMemo(
    () => ({
      nodeId:
        currentData?.find((d) => d.docOutId === selectedItems[0])?.nodeId ?? "",
      single: false,
    }),
    [selectedItems, currentData]
  );
  const { data: searchFlowNodeData } = useSearchFlowNode(
    flowNodeParam,
    !flowNodeParam.nodeId || selectedItems.length === 0
  );

  // Logic giống Angular:
  // Button "Chuyển xử lý": Hiển thị khi có listNextNode và currentDraftId (có ít nhất 1 item được chọn)
  // Button "Hoàn thành xử lý": Chỉ hiển thị khi chọn 1 item (selectedList.length < 2)
  const transferButton =
    !isCheckShowButton &&
    activeTab === tabs.DU_THAO &&
    selectedItems.length > 0 &&
    searchFlowNodeData &&
    searchFlowNodeData.length > 0;
  const doneButton =
    !isCheckShowButton &&
    activeTab === tabs.DU_THAO &&
    searchFlowNodeData &&
    searchFlowNodeData.length !=
      searchFlowNodeData?.filter((node) => !node.lastNode).length &&
    selectedItems.length === 1;
  const retakeButton =
    !isCheckShowButton &&
    !HIDE_BTN_RETAKE_H05 &&
    activeTab === tabs.DA_TRINH_KY &&
    currentData?.find((item) => item.docOutId === Number(selectedItems[0]))
      ?.status === Constant.DOCUMENT_STATUS.IN_PROCESS;
  const consultButton =
    !isCheckShowButton &&
    !!consultNodeData &&
    selectedItems.length === 1 &&
    activeTab === tabs.DU_THAO;
  useEffect(() => {
    if (isEncrypt) {
      EncryptionService.isCheckStartUsbTokenWatcher(() => {
        router.push("/document-in/draft-list");
      });
    }
    setIsCheckShowButton(isEncrypt);
  }, [isEncrypt]);

  useEffect(() => {
    SharedService.setCurrentMenuDocIn(Constant.DOCUMENT_IN_MENU.DRAFT);
    SharedService.setCurrentTabDocIn(activeTab);
  }, [activeTab]);
  return (
    <div className="space-y-4 px-4">
      <div className="flex items-center justify-between">
        <BreadcrumbNavigation
          items={[
            {
              label: "Văn bản đi",
            },
          ]}
          currentPage="Danh sách dự thảo"
          showHome={false}
          className="ml-3"
        />
        <div className="flex items-center gap-3">
          <SearchInput
            placeholder={"Tìm kiếm Số/Ký hiệu | Trích yếu"}
            value={basicSearch.text}
            setSearchInput={(input) => {
              setIsBasicSearch(true);
              setBasicSearch((prev) => ({
                ...prev,
                text: input,
              }));
            }}
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
                    Số/Ký hiệu
                  </Label>
                  <Input
                    name="sign"
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
                    name="preview"
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

        {/* Bulk Actions */}
        <div className="flex items-center gap-2 mb-4">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-3 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={() => router.push("/document-in/draft-list/draft-insert")}
          >
            <Plus className="w-4 h-4 mr-1" />
            Thêm mới dự thảo
          </Button>

          {transferButton && (
            <TransferDocumentIn
              selectedItemId={selectedItems[0]}
              listNextNode={searchFlowNodeData ?? []}
              onSuccess={() => {
                ToastUtils.transferSuccess();

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
          {consultButton && (
            <ConsultHandler
              selectedItemId={Number(selectedItems[0]) || null}
              currentNode={
                currentData?.find(
                  (item) => item.docOutId === Number(selectedItems[0])
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
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
            <button
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                activeTab === tabs.DU_THAO
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => handleTabChange(tabs.DU_THAO)}
            >
              Dự thảo
            </button>
            <button
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                activeTab === tabs.DA_TRINH_KY
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => handleTabChange(tabs.DA_TRINH_KY)}
            >
              Đã trình ký
            </button>
            <button
              className={`px-3 py-1 text-xs rounded-md transition-colors ${
                activeTab === tabs.DA_BAN_HANH
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-800"
              }`}
              onClick={() => handleTabChange(tabs.DA_BAN_HANH)}
            >
              Đã ban hành
            </button>
          </div>

          <div className="flex items-center gap-3">
            {selectedItems.length > 0 && (
              <div className="text-sm text-blue-600 font-medium">
                Đã chọn {selectedItems.length} văn bản
              </div>
            )}
            <EncryptDisplaySelect selectClassName="w-36 h-9 text-xs" />
          </div>
        </div>

        {/* Table */}
        <Table
          sortable={true}
          columns={tableColumns}
          dataSource={currentData}
          itemsPerPage={filter.size}
          currentPage={filter.page}
          totalItems={totalItems}
          onPageChange={handlePageChange}
          showPagination={true}
          bgColor="bg-white"
          rowClassName={(item, index) =>
            index % 2 === 0 ? "bg-white" : "bg-gray-50"
          }
          emptyText={<EmptyDocument />}
          onRowClick={(item) => {
            router.push(
              `/document-in/draft-list/draft-detail/${item.docOutId}`
            );
          }}
          onItemsPerPageChange={handleItemPerPageChange}
          loading={loading}
        />
      </div>
      <DailyReportAttachmentInfo
        isOpen={openAttach}
        onOpenChange={setOpenAttach}
        attachments={selectedAttachments}
        constant={Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_IN}
      />
      <ConfirmDeleteDialog
        isOpen={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        onConfirm={handleClickDelete}
        title="Bạn có chắc chắn muốn xóa?"
        description="Thao tác này sẽ xóa văn bản đã chọn. Hành động không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  );
}
