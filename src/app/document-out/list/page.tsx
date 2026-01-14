"use client";

import AttachmentDialog2 from "@/components/common/AttachmentDialog2";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import TooltipWrapper from "@/components/common/TooltipWrapper";
import EncryptDisplaySelect from "@/components/document-out/EncryptDisplaySelect";
import AdvancedSearch from "@/components/document-out/list/AdvancedSearch";
import TopActions from "@/components/document-out/list/TopActions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { queryKeys } from "@/definitions";
import { Constant } from "@/definitions/constants/constant";
import { SearchDocumentOutTitles } from "@/definitions/enums/document.enum";
import { DocumentOutItem } from "@/definitions/types/document-out.type";
import { Column } from "@/definitions/types/table.type";
import { useDeleteAttachmentByDocIdMutation } from "@/hooks/data/attachment.data";
import {
  useDeleteDocument,
  useFinishDocument,
  useRejectDocument,
} from "@/hooks/data/document-out.actions";
import {
  useGetAdvanceSearchIncoming,
  useGetBasicSearchIncoming,
  useGetCategoryWithCode,
  useGetWaitingSearch,
  useToggleImportant,
} from "@/hooks/data/document-out.data";
import { useFileViewer } from "@/hooks/useFileViewer";
import { cn } from "@/lib/utils";
import { Bpmn2Service } from "@/services/bpmn2.service";
import { DocumentOutService } from "@/services/document-out.service";
import { downloadFileTable } from "@/services/file.service";
import { canViewNoStatus, handleError } from "@/utils/common.utils";
import { ToastUtils } from "@/utils/toast.utils";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  ChevronUp,
  Download,
  FileText,
  Paperclip,
  Plus,
  RotateCcw,
  Search,
  Star,
  Trash2,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { ReactNode, useEffect, useMemo, useState } from "react";
import { EmptyDocument } from "@/components/common/EmptyDocument";
import { useEncryptStore } from "@/stores/encrypt.store";
import { EncryptionService } from "@/services/encryption.service";
import { SearchInput } from "@/components/document-in/SearchInput";

const useGetAdvanceSearchWaiting = useGetAdvanceSearchIncoming;

interface ExtendedColumn<T> extends Column<T> {
  render?: (record: T, index: number) => ReactNode;
  sortKey?: string;
}

enum TabNames {
  TIEPNHAN = "handleTab",
  CHOTIEPNHAN = "waitTab",
}

const defaultFilter = {
  docTypeId: "",
  docFieldsId: "",
  docStatusId: "",
  preview: "",
  isAdvanceSearch: false,
  text: "",
  important: "",
  expired: "",
  page: 1,
  sortBy: "",
  direction: Constant.SORT_TYPE.DECREASE,
  pageSize: Constant.ITEMS_PER_PAGE,
  currentTab: TabNames.TIEPNHAN,
};

const defaultAdvancedSearchField = {
  preview: "",
  docTypeId: "",
  important: "",
  expired: "",
};

const filterBasic = {
  text: "",
  page: 1,
  sortBy: "",
  direction: Constant.SORT_TYPE.DECREASE,
  size: Constant.ITEMS_PER_PAGE,
};

export default function DocumentOutPage() {
  const { isEncrypt } = useEncryptStore();
  const router = useRouter();
  const sp = useSearchParams();
  const queryClient = useQueryClient();

  const [searchField, setSearchField] = useState(defaultFilter);
  const [tempAdvancedSearch, setTempAdvancedSearch] = useState(
    defaultAdvancedSearchField
  );
  const [isAdvancedSearchExpanded, setIsAdvancedSearchExpanded] =
    useState(false);
  const currentTab = sp?.get("currentTab");
  const paramPage = sp?.get("page");
  const paramSize = sp?.get("size");
  useEffect(() => {
    if (currentTab && paramPage && paramSize) {
      setSearchField((prev) => ({
        ...prev,
        currentTab: currentTab as TabNames,
        page: Number(paramPage),
        pageSize: Number(paramSize),
      }));
    }
  }, [sp]);

  const [filter, setFilter] = useState(filterBasic);
  const [currentDocumentId, setCurrentDocumentId] = useState<number[]>([]);
  const [selectList, setSelectList] = useState<any[]>([]);
  const [docCurrentNode, setDocCurrentNode] = useState<any>(null);
  const [nodeStart, setNodeStart] = useState<any>(null);
  const [listNextNode, setListNextNode] = useState<any[]>([]);
  const [isshowDoneButton, setIsshowDoneButton] = useState(false);
  const [canReceive, setCanReceive] = useState(false);
  const [isCanHandleDoc, setIsCanHandleDoc] = useState(true);
  const [handleData, setHandleData] = useState<any[]>([]);
  const [waitData, setWaitData] = useState<any[]>([]);
  const [handleTotal, setHandleTotal] = useState(0);
  const [waitTotal, setWaitTotal] = useState(0);
  const [openAttachmentDialog, setOpenAttachmentDialog] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState<any[]>([]);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [confirmReject, setConfirmReject] = useState(false);
  const [documentIdToDelete, setDocumentIdToDelete] = useState<number | null>(
    null
  );
  const { mutate: doFinishDocument } = useFinishDocument();
  const { mutate: doRejectDocument } = useRejectDocument();
  const { mutate: toggleImportant } = useToggleImportant();
  const { mutate: doDeleteDocument } = useDeleteDocument();
  const { mutate: doDeleteAttachmentByDocId } =
    useDeleteAttachmentByDocIdMutation();

  const { data: docTypeCategory = [] } = useGetCategoryWithCode(
    Constant.CATEGORYTYPE_CODE.DOC_TYPE
  );
  const { data: docFieldCategory = [] } = useGetCategoryWithCode(
    Constant.CATEGORYTYPE_CODE.DOC_FIELDS
  );

  const {
    data: basicSearchIncoming,
    isLoading: isLoadingBasicSearchIncoming,
    refetch: refetchBasicSearchIncoming,
  } = useGetBasicSearchIncoming(filter);
  const {
    data: advanceSearchIncoming,
    isLoading: isLoadingAdvanceSearchIncoming,
    refetch: refetchAdvanceSearchIncoming,
  } = useGetAdvanceSearchIncoming(searchField, searchField.isAdvanceSearch);
  const {
    data: waitingSearch,
    isLoading: isLoadingWaitingSearch,
    refetch: refetchWaitingSearch,
  } = useGetWaitingSearch(filter);
  const {
    data: advanceSearchWaiting,
    isLoading: isLoadingAdvanceSearchWaiting,
    refetch: refetchAdvanceSearchWaiting,
  } = useGetAdvanceSearchWaiting(searchField);

  const isView = (fileName: string) => canViewNoStatus(fileName);
  const { viewFile } = useFileViewer();
  const transformText = (value: string, limit: number) =>
    value.length > limit ? `${value.slice(0, Math.max(0, limit))}...` : value;

  useEffect(() => {
    if (!searchField.isAdvanceSearch) {
      const rawData = basicSearchIncoming?.objList || [];
      const data = DocumentOutService.addWarningColorToDocuments(rawData);
      setHandleData(data);
      setHandleTotal(basicSearchIncoming?.totalRecord || 0);
    }
  }, [basicSearchIncoming, searchField.isAdvanceSearch]);

  useEffect(() => {
    if (searchField.isAdvanceSearch) {
      const rawData = advanceSearchIncoming?.objList || [];
      const data = DocumentOutService.addWarningColorToDocuments(rawData);
      setHandleData(data);
      setHandleTotal(advanceSearchIncoming?.totalRecord || 0);
    }
  }, [advanceSearchIncoming, searchField.isAdvanceSearch]);

  useEffect(() => {
    if (!searchField.isAdvanceSearch) {
      const rawData = waitingSearch?.objList || [];
      const data = DocumentOutService.addWarningColorToDocuments(rawData);
      setWaitData(data);
      setWaitTotal(waitingSearch?.totalRecord || 0);
    }
  }, [waitingSearch, searchField.isAdvanceSearch]);

  useEffect(() => {
    if (searchField.isAdvanceSearch) {
      const rawData = advanceSearchWaiting?.objList || [];
      const data = DocumentOutService.addWarningColorToDocuments(rawData);
      setWaitData(data);
      setWaitTotal(advanceSearchWaiting?.totalRecord || 0);
    }
  }, [advanceSearchWaiting, searchField.isAdvanceSearch]);
  useEffect(() => {
    if (selectList.length > 0) {
      const selectedDocs = selectList;

      const hasWaitReceive = selectedDocs.some(
        (doc) => doc.status === "WAIT_RECEIVE" && !doc.confidential
      );
      setCanReceive(hasWaitReceive);

      if (selectedDocs.length === 1) {
        const doc = selectedDocs[0];
        setDocCurrentNode(doc.node);
        if (!doc.node) {
          getStartNode();
        } else {
          if (searchField.currentTab === TabNames.TIEPNHAN) {
            getStartNode();
          } else {
            getNextNode(doc.node);
          }
        }
      } else {
        const allSameNode = selectedDocs.every(
          (doc) => doc.node === selectedDocs[0].node
        );
        setDocCurrentNode(allSameNode ? selectedDocs[0].node : null);
        if (allSameNode && selectedDocs[0].node) {
          if (searchField.currentTab === TabNames.TIEPNHAN) {
            getStartNode();
          } else {
            getNextNode(selectedDocs[0].node);
          }
        } else {
          getStartNode();
        }
      }
    } else {
      setCurrentDocumentId([]);
      setDocCurrentNode(null);
      setCanReceive(false);
      setIsshowDoneButton(false);
    }
  }, [selectList, searchField.currentTab]);

  useEffect(() => {
    if (isEncrypt)
      EncryptionService.isCheckStartUsbTokenWatcher(() => {
        router.push("/document-out/list");
      });
    setIsCanHandleDoc(!isEncrypt);
  }, [isEncrypt]);

  const doLoadAllDocument = () => {
    doBasicSearch(1);
  };

  const pageChanged = (page: number) => {
    setSearchField({ ...searchField, page });
    setFilter((prev) => ({ ...prev, page }));
    router.push(
      `/document-out/list?page=${page}&size=${searchField.pageSize}&currentTab=${searchField.currentTab}`
    );
  };

  const changePageSize = (size: number) => {
    if (size !== filter.size) {
      setSearchField({ ...searchField, pageSize: size, page: 1 });
      setFilter((prev) => ({ ...prev, size, page: 1 }));
      router.push(
        `/document-out/list?page=1&size=${size}&currentTab=${searchField.currentTab}`
      );
    }
  };

  const doBeforeLoadingResult = (currentPage: number) => {
    setSearchField((prev) => ({ ...prev, page: currentPage }));
    setFilter({ ...filter, page: currentPage });
  };

  const doBasicSearchSubmit = (pageNumber: number) => {
    doBasicSearch(pageNumber);
  };

  const doBasicSearch = (pageNumber: number) => {
    setSearchField({ ...searchField, isAdvanceSearch: false });
    doBeforeLoadingResult(pageNumber);
    setFilter({
      text: searchField.text,
      page: pageNumber,
      sortBy: searchField.sortBy,
      direction: searchField.direction,
      size: searchField.pageSize,
    });
    setCanReceive(false);
    setSelectList([]);
  };

  const doAdvanceSearchSubmit = (pageNumber: number) => {
    setCurrentDocumentId([]);
    setSelectList([]);
    if (searchField.isAdvanceSearch) {
      doAdvanceSearch(pageNumber);
    } else {
      doBasicSearch(pageNumber);
    }
  };

  const doAdvanceSearch = (pageNumber: number) => {
    setSearchField({ ...searchField, isAdvanceSearch: true, page: pageNumber });
    doBeforeLoadingResult(pageNumber);
  };

  const doSearch = (page: number, sortField = "") => {
    if (!page) page = searchField.page;
    if (sortField) {
      if (searchField.isAdvanceSearch) {
        setSearchField((prev) => ({
          ...prev,
          sortBy: sortField,
          // Toggle like Angular regardless of switching column
          direction:
            prev.direction === Constant.SORT_TYPE.DECREASE
              ? Constant.SORT_TYPE.INCREASE
              : Constant.SORT_TYPE.DECREASE,
          page: 1,
        }));
      } else {
        setFilter((prev) => ({
          ...prev,
          sortBy: sortField,
          direction:
            prev.direction === Constant.SORT_TYPE.DECREASE
              ? Constant.SORT_TYPE.INCREASE
              : Constant.SORT_TYPE.DECREASE,
          page: 1,
        }));
      }
      // reset to page=1 in URL as Angular resets pagination on sort
      router.push(
        `/document-out/list?page=1&size=${searchField.pageSize}&currentTab=${searchField.currentTab}`
      );
    } else {
      pageChanged(page);
    }
  };

  const sortByField = (field: string) => {
    doSearch(searchField.page, field);
  };

  const showAdvanceSearch = () => {
    const newIsAdvance = !searchField.isAdvanceSearch;
    setSearchField({ ...searchField, isAdvanceSearch: newIsAdvance });
    setIsAdvancedSearchExpanded((prev) => {
      const next = !prev;
      if (next) {
        setTempAdvancedSearch({
          preview: searchField.preview,
          docTypeId: searchField.docTypeId,
          important: searchField.important,
          expired: searchField.expired,
        });
      }
      return next;
    });
  };

  // Nhận sự kiện sort từ Table (ASC/DESC) và cập nhật state để gọi API
  const onTableSort = (
    config: { key: string; direction: "asc" | "desc" | null } | null
  ) => {
    if (!config || !config.direction) return;
    const mappedDirection =
      config.direction === "asc"
        ? Constant.SORT_TYPE.INCREASE
        : Constant.SORT_TYPE.DECREASE;

    if (searchField.isAdvanceSearch) {
      setSearchField((prev) => ({
        ...prev,
        sortBy: config.key,
        direction: mappedDirection,
        page: 1,
      }));
    } else {
      setFilter((prev) => ({
        ...prev,
        sortBy: config.key,
        direction: mappedDirection,
        page: 1,
      }));
    }
    router.push(
      `/document-out/list?page=1&size=${searchField.pageSize}&currentTab=${searchField.currentTab}`
    );
  };

  const doCopyDocument = () => {
    const currentData =
      searchField.currentTab === TabNames.TIEPNHAN ? handleData : waitData;
    const selected = currentData.find((doc: any) => doc.isChecked);
    if (selected) {
      router.push(`/document-out/list/insert/${selected.docId}`);
    }
  };

  const doFinishDocuments = () => {
    doFinishDocument(currentDocumentId, {
      onSuccess: () => {
        ToastUtils.documentCompleteSuccess();
        doSearch(1);
        setSelectList([]);
        queryClient.invalidateQueries({
          queryKey: [queryKeys.documentOut.basicSearchIncoming],
        });
      },
      onError: () => {
        doSearch(1);
        setSelectList([]);
        ToastUtils.documentCompleteError();
      },
    });
  };

  const getStartNode = async () => {
    const data = await Bpmn2Service.getStartNode(Constant.THREAD_TYPE.INCOMING);
    setListNextNode(data);
    if (data.length === 1) {
      setNodeStart(data[0]);
    }
    checkProcessDone();
  };

  const getNextNode = (nodeId: number) => {
    Bpmn2Service.getNextNodes(nodeId).then((data) => {
      setListNextNode(data);
      checkProcessDone();
    });
  };

  const checkProcessDone = () => {
    const oldLength = listNextNode.length;
    setListNextNode((prev) => prev.filter((e: any) => !e.lastNode));
    setIsshowDoneButton(listNextNode.length !== oldLength);
  };

  const doOpenAttachmentInfo = (attachments: any[]) => {
    setSelectedAttachments(attachments);
    setOpenAttachmentDialog(true);
  };

  const toggleAllCheckboxes = (
    data: any[],
    setData: (d: any[]) => void,
    checked: boolean
  ) => {
    const validList = data.filter(
      (x) =>
        !!x &&
        (!x.confidential || searchField.currentTab === TabNames.CHOTIEPNHAN)
    );

    if (checked) {
      // Thêm tất cả items từ trang hiện tại
      const newKeys = validList.map((doc) => doc.docId);
      setCurrentDocumentId((prev) => {
        const combined = [...prev, ...newKeys];
        return Array.from(new Set(combined)); // Loại bỏ trùng lặp
      });
      setSelectList((prev) => {
        const combined = [...prev, ...validList];
        const uniqueMap = new Map(combined.map((item) => [item.docId, item]));
        return Array.from(uniqueMap.values());
      });
    } else {
      // Bỏ chọn tất cả items từ trang hiện tại
      const keysToRemove = validList.map((doc) => doc.docId);
      setCurrentDocumentId((prev) =>
        prev.filter((id) => !keysToRemove.includes(id))
      );
      setSelectList((prev) =>
        prev.filter((item) => !keysToRemove.includes(item.docId))
      );
    }
  };

  const isAllChecked = (data: any[]) => {
    const validList = data.filter(
      (x) => !!x && (!x.confidential || searchField.currentTab === "waitTab")
    );
    return (
      validList.length > 0 &&
      validList.every((doc) => currentDocumentId.includes(doc.docId))
    );
  };

  const onTabSelect = (nextId: string) => {
    setCanReceive(false);
    setCurrentDocumentId([]);
    setSelectList([]);
    doSearch(1);
    setSearchField({
      ...searchField,
      ...defaultAdvancedSearchField,
      currentTab: nextId as TabNames,
      page: 1,
      isAdvanceSearch: false,
    });
    setTimeout(() => {
      router.push(
        `/document-out/list?page=1&size=${searchField.pageSize}&currentTab=${nextId}`
      );
    }, 0);
  };

  const goToDetailPage = (document: any) => {
    doBeforeLoadingResult(searchField.page);
    router.push(
      `/document-out/list/update/${document.docId}?currentTab=${searchField.currentTab}`
    );
  };

  const confirmRejectDocument = () => {
    setConfirmReject(true);
  };

  const doReject = () => {
    doRejectDocument(currentDocumentId, {
      onSuccess: () => {
        ToastUtils.documentRejectSuccess();
        doSearch(1);
        setSelectList([]);
        setConfirmReject(false);
        queryClient.invalidateQueries({
          queryKey: [queryKeys.documentOut.waitingSearch],
        });
      },
      onError: () => {
        ToastUtils.documentRejectError();
      },
    });
  };

  const showConfirmDeleteDocument = (documentId: number) => {
    setDocumentIdToDelete(documentId);
    setIsDeleteConfirmOpen(true);
  };

  const handleClickDelete = async () => {
    if (documentIdToDelete !== null) {
      await doDeleteAttachmentByDocId(documentIdToDelete, {
        onSuccess: () => {
          ToastUtils.documentDeleteSuccess();
          doSearch(searchField.page);
          setIsDeleteConfirmOpen(false);
          setDocumentIdToDelete(null);
          refetchBasicSearchIncoming();
          refetchAdvanceSearchIncoming();
          refetchWaitingSearch();
          refetchAdvanceSearchWaiting();
        },
        onError: (err) => {
          handleError(err as any);
          setIsDeleteConfirmOpen(false);
          setDocumentIdToDelete(null);
        },
      });
      await doDeleteDocument(documentIdToDelete, {
        onSuccess: () => {
          ToastUtils.documentDeleteSuccess();
          doSearch(searchField.page);
          setSelectList([]);
          refetchBasicSearchIncoming();
          refetchAdvanceSearchIncoming();
          refetchWaitingSearch();
          refetchAdvanceSearchWaiting();
          setIsDeleteConfirmOpen(false);
          setDocumentIdToDelete(null);
        },
        onError: (err) => {
          handleError(err as any);
          setIsDeleteConfirmOpen(false);
          setDocumentIdToDelete(null);
        },
      });
    }
  };
  const SortHeader = (label: string) => {
    // Chỉ hiển thị nhãn; Table sẽ render icon sort và handle click
    return <span className="whitespace-normal leading-tight">{label}</span>;
  };

  const AttachmentCell = (record: any) => {
    return !record.confidential ? (
      record.attachments?.length === 1 ? (
        isView(record.attachments[0].name) ? (
          <TooltipWrapper title={record.attachments[0].displayName}>
            <Paperclip
              className="h-4 w-4 text-warning cursor-pointer text-blue-600"
              onClick={() =>
                viewFile(
                  record.attachments[0],
                  "",
                  true,
                  Constant.ATTACHMENT.DOWNLOAD
                )
              }
            />
          </TooltipWrapper>
        ) : (
          <TooltipWrapper title={record.attachments[0].displayName}>
            <Download
              className="h-4 w-4 text-warning cursor-pointer"
              onClick={() =>
                downloadFileTable(
                  record.attachments[0].name,
                  record.attachments[0].displayName
                )
              }
            />
          </TooltipWrapper>
        )
      ) : record.attachments?.length > 1 ? (
        <TooltipWrapper title={`${record.attachments.length} files`}>
          <Paperclip
            className="h-4 w-4 text-blue-600 text-warning cursor-pointer"
            onClick={() => doOpenAttachmentInfo(record.attachments)}
          />
        </TooltipWrapper>
      ) : null
    ) : (
      "*****"
    );
  };

  const PreviewCell = (record: any) => (
    <TooltipWrapper
      title={record.preview}
      className={
        "max-w-[700px] line-clamp-2 text-sm leading-relaxed text-ellipsis"
      }
    >
      {record.preview}
    </TooltipWrapper>
  );

  const buildColumns = (
    data: any[],
    setData: (d: any[]) => void,
    variant: "handle" | "wait"
  ): ExtendedColumn<any>[] => {
    const isHandle = variant === "handle";
    const cols: ExtendedColumn<any>[] = [
      {
        header: !isEncrypt ? (
          <input
            type="checkbox"
            checked={isAllChecked(data)}
            onChange={(e) =>
              toggleAllCheckboxes(data, setData, e.target.checked)
            }
          />
        ) : (
          "STT"
        ),
        type: !isEncrypt ? "checkbox" : undefined,
        sortable: false,
        accessor: (record: any, index: number) => {
          const page = searchField.isAdvanceSearch
            ? searchField.page
            : filter.page;
          const pageSize = searchField.isAdvanceSearch
            ? searchField.pageSize
            : filter.size;

          const checked = currentDocumentId.includes(record.docId);

          return isCanHandleDoc && !record.confidential && !isEncrypt ? (
            <input type="checkbox" checked={checked} readOnly />
          ) : (
            (page - 1) * pageSize + index + 1
          );
        },
        className: "text-center w-8 min-w-[32px]",
      },
      {
        header: <Star className="h-4 w-4 stroke-gray-400 stroke-2" />,
        type: "actions",
        sortKey: SearchDocumentOutTitles.IMPORTANT,
        renderActions: (record: any) =>
          !record.confidential ? (
            <button
              type="button"
              onClick={(e) => {
                toggleImportant({
                  docId: record.docId,
                  important: !record.important,
                });
              }}
              aria-label={record.important ? "Bỏ đánh dấu" : "Đánh dấu"}
              title={record.important ? "Bỏ đánh dấu" : "Đánh dấu"}
              className="inline-flex items-center justify-center"
            >
              <Star
                className={cn(
                  "h-4 w-4 cursor-pointer",
                  record.important
                    ? "fill-yellow-400 stroke-yellow-600 stroke-2"
                    : "stroke-gray-400 stroke-2"
                )}
              />
            </button>
          ) : (
            "*****"
          ),
        className: "text-center w-8 min-w-[32px]",
      },
      {
        header: SortHeader("Ngày văn bản"),
        sortKey: SearchDocumentOutTitles.DATE_ARRIVAL,
        accessor: (record: any) => (
          <a className="cursor-pointer" onClick={() => goToDetailPage(record)}>
            {record.confidential
              ? "*****"
              : new Date(record.dateArrival).toLocaleDateString("vi-VN")}
          </a>
        ),
        className: "text-center min-w-[60px] w-[5%] whitespace-normal",
      },
    ].filter(Boolean) as ExtendedColumn<any>[];

    if (isHandle) {
      cols.push(
        {
          header: SortHeader("Ngày vào sổ"),
          sortKey: SearchDocumentOutTitles.DATEISSUED,
          accessor: (record: DocumentOutItem) => (
            <a
              className="cursor-pointer"
              onClick={() => goToDetailPage(record)}
            >
              {record.confidential
                ? "*****"
                : record.dateIssued
                  ? new Date(record.dateIssued).toLocaleDateString("vi-VN")
                  : ""}
            </a>
          ),
          className: "text-center min-w-[60px] w-[5%] whitespace-normal",
        },
        {
          header: SortHeader("Số đến"),
          sortKey: SearchDocumentOutTitles.NUMBER_ARRIVAL,
          accessor: (record: DocumentOutItem) => (
            <a
              className="cursor-pointer"
              onClick={() => goToDetailPage(record)}
            >
              {record.numberArrival}
            </a>
          ),
          className: "text-left min-w-[60px] w-[5%] whitespace-normal",
        }
      );
    }

    cols.push(
      {
        header: SortHeader("Ngày nhận văn bản"),
        sortKey: SearchDocumentOutTitles.DATE_RECEIVED,
        accessor: (record) => (
          <a className="cursor-pointer" onClick={() => goToDetailPage(record)}>
            {new Date(record.receivedDate).toLocaleDateString("vi-VN")}
          </a>
        ),
        className: "text-center min-w-[60px] w-[5%] whitespace-normal",
      },
      {
        header: SortHeader("Số, KH của VB đến"),
        sortKey: SearchDocumentOutTitles.NUMBERSIGN,
        accessor: (record) => (
          <a className="cursor-pointer" onClick={() => goToDetailPage(record)}>
            {record.confidential ? "*****" : record.numberArrivalStr}
          </a>
        ),
        className: "text-left min-w-[80px] w-[6%] whitespace-normal",
      },
      {
        header: SortHeader("Trạng thái"),
        sortKey: SearchDocumentOutTitles.STATUS,
        accessor: (record) => {
          const getStatusColor = (statusId: number, statusName: string) => {
            if (statusId === 89) return "bg-red-500 text-white";
            if (statusName?.toLowerCase().includes("hoàn thành"))
              return "bg-green-500 text-white";
            if (statusName?.toLowerCase().includes("đang xử lý"))
              return "bg-blue-600 text-white";
            if (statusName?.toLowerCase().includes("chờ"))
              return "bg-yellow-500 text-white";
            if (statusName?.toLowerCase().includes("tiếp nhận"))
              return "bg-purple-500 text-white";
            return "bg-gray-500 text-white";
          };

          return (
            <div className="flex justify-center">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer hover:opacity-80 transition-opacity ${getStatusColor(record.docStatusId, record.docStatusName)}`}
                onClick={() => goToDetailPage(record)}
              >
                {record.docStatusName}
              </span>
            </div>
          );
        },
        className: "text-center min-w-[80px] w-[6%] whitespace-normal",
      }
    );

    if (!isHandle) {
      cols.push({
        header: SortHeader("Đơn vị chuyển"),
        sortKey: SearchDocumentOutTitles.ORGTRANSFER,
        accessor: (record: DocumentOutItem) => (
          <a className="cursor-pointer" onClick={() => goToDetailPage(record)}>
            {record?.orgTransfer}
          </a>
        ),
        className: "text-center min-w-[90px] w-[7%] whitespace-normal",
      });
    }

    cols.push({
      header: SortHeader("Trích yếu"),
      sortKey: SearchDocumentOutTitles.PREVIEW,
      accessor: (record) => PreviewCell(record),
      className: "text-left min-w-[100px] flex-1 whitespace-normal",
    });

    cols.push(
      {
        header: "Đính kèm",
        sortable: false,
        type: "actions" as const,
        renderActions: (record) => AttachmentCell(record),
        className: "text-center min-w-[50px] w-[3%] whitespace-normal",
      },
      {
        header: "Độ mật",
        sortable: false,
        accessor: (record) => (
          <span
            className={cn(
              record.securityName?.toLowerCase().includes("mật") &&
                "text-red-500 font-bold"
            )}
          >
            {record.securityName || ""}
          </span>
        ),
        className: "text-center min-w-[50px] w-[3%] whitespace-normal",
      },
      {
        header: "Độ khẩn",
        sortable: false,
        accessor: (record) => (
          <span
            className={cn(
              record.urgentName.toLowerCase() === "hỏa tốc" &&
                "text-red-500 font-bold"
            )}
          >
            {record.urgentName}
          </span>
        ),
        className: "text-center min-w-[50px] w-[3%] whitespace-normal",
      },
      ...(isHandle
        ? [
            {
              header: "Lý do trả lại",
              sortable: false,
              accessor: (record: DocumentOutItem) => (
                <TooltipWrapper title={record.reason}>
                  <a
                    className="cursor-pointer"
                    onClick={() => goToDetailPage(record)}
                  >
                    {record.confidential
                      ? "*****"
                      : transformText(record?.reason || "", 50)}
                  </a>
                </TooltipWrapper>
              ),
              className: "text-left min-w-[70px] w-[6%] whitespace-normal",
            },
          ]
        : []),
      {
        header: SortHeader("Hạn văn bản"),
        sortKey: SearchDocumentOutTitles.DEADLINE,
        accessor: (record) => {
          const renderDate = () => {
            if (record.confidential) return "*****";
            if (!record.deadline) return "";
            const dateStr = new Date(record.deadline).toLocaleDateString(
              "vi-VN"
            );
            if (record.deadline) {
              const now = new Date();
              const dl = new Date(record.deadline);
              const diff = Math.floor(
                (dl.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
              );
              const cls =
                diff < 0
                  ? "text-red-600 font-semibold"
                  : diff <= 2
                    ? "text-orange-500"
                    : "";
              return <span className={cls}>{dateStr}</span>;
            }
            return dateStr;
          };
          return (
            <a
              className="cursor-pointer"
              onClick={() => goToDetailPage(record)}
            >
              {renderDate()}
            </a>
          );
        },
        className: "text-left min-w-[60px] w-[5%] whitespace-normal",
      }
    );

    if (isHandle) {
      cols.push({
        header: "Thao tác",
        sortable: false,
        type: "actions" as const,
        renderActions: (record) => (
          <Button
            variant="ghost"
            onClick={() => showConfirmDeleteDocument(record.docId)}
            disabled={
              !!Constant.ORG_MULTI_TRANSFER_BCY && record.parentId != null
            }
          >
            <Trash2
              className={cn(
                "h-4 w-4",
                Constant.ORG_MULTI_TRANSFER_BCY &&
                  record.parentId != null &&
                  "text-muted"
              )}
            />
          </Button>
        ),
        className: "text-center min-w-[50px] w-[3%]",
      } as ExtendedColumn<any>);
    }

    return cols;
  };

  const handleColumns = useMemo(
    () => buildColumns(handleData, setHandleData, "handle"),
    [searchField.sortBy, searchField.direction, handleData, currentDocumentId]
  );
  const waitColumns = useMemo(
    () => buildColumns(waitData, setWaitData, "wait"),
    [searchField.sortBy, searchField.direction, waitData, currentDocumentId]
  );

  const tab1Title = Constant.ORG_MULTI_TRANSFER_BCY
    ? "Đã vào sổ"
    : "Chờ vào sổ";

  const handleLoading = searchField.isAdvanceSearch
    ? isLoadingAdvanceSearchIncoming
    : isLoadingBasicSearchIncoming;
  const waitLoading = searchField.isAdvanceSearch
    ? isLoadingAdvanceSearchWaiting
    : isLoadingWaitingSearch;
  return (
    <div className="pl-4 pr-4 space-y-4">
      <div className="flex items-center justify-between gap-4 mb-4">
        <BreadcrumbNavigation
          items={[
            {
              label: "Văn bản đến",
            },
          ]}
          currentPage="Danh sách văn bản đến"
          showHome={false}
        />

        <div className="flex items-center gap-3">
          <SearchInput
            placeholder="Tìm kiếm Số, KH của VB đến | Trích yếu"
            value={searchField.text}
            setSearchInput={(v) => {
              setFilter({
                ...filter,
                text: v,
              });
              setSearchField({
                ...defaultFilter,
                isAdvanceSearch: false,
              });
              setIsAdvancedSearchExpanded(false);
              setTempAdvancedSearch(defaultAdvancedSearchField);
            }}
          />

          {searchField.currentTab !== TabNames.CHOTIEPNHAN && (
            <Button
              onClick={showAdvanceSearch}
              className="h-8 py-1 px-3 text-xs transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700 hover:text-white border-none"
            >
              <Search className="mr-1 h-4 w-4" />
              {isAdvancedSearchExpanded
                ? "Thu gọn tìm kiếm"
                : "Tìm kiếm nâng cao"}
            </Button>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-4">
        <div className="flex items-center gap-2">
          <Button
            onClick={() => router.push("/document-out/list/insert")}
            className="h-9 px-3 text-sm text-white bg-blue-600 hover:bg-blue-700 hover:text-white"
          >
            <Plus className="mr-1 h-4 w-4" /> Thêm mới
          </Button>
          <TopActions
            currentTab={searchField.currentTab}
            isCanHandleDoc={isCanHandleDoc}
            currentDocumentIdLength={currentDocumentId.length}
            isAdvanceSearch={searchField.isAdvanceSearch}
            showReject={selectList.length > 0}
            onCopy={doCopyDocument}
            onFinish={doFinishDocuments}
            transferDisabled={selectList.length !== 1}
            onReject={() => confirmRejectDocument()}
            onToggleAdvanceSearch={showAdvanceSearch}
            selectedItemId={selectList[0]?.docId || null}
            currentNode={docCurrentNode || null}
            onSuccess={() => doSearch(1)}
            listNextNode={listNextNode}
          />
        </div>
      </div>

      {isAdvancedSearchExpanded &&
        searchField.currentTab !== TabNames.CHOTIEPNHAN && (
          <AdvancedSearch
            preview={tempAdvancedSearch.preview}
            onChangePreview={(v) =>
              setTempAdvancedSearch((prev) => ({ ...prev, preview: v }))
            }
            docTypeOptions={
              docTypeCategory
                ?.filter((item) => item.id !== null && item.id !== undefined)
                .map((item) => ({
                  id: String(item.id),
                  name: item.name,
                })) || []
            }
            docTypeId={tempAdvancedSearch.docTypeId}
            onChangeDocType={(val) =>
              setTempAdvancedSearch((prev) => ({
                ...prev,
                docTypeId: val === "all" ? "" : val,
              }))
            }
            important={tempAdvancedSearch.important}
            onChangeImportant={(v) =>
              setTempAdvancedSearch((prev) => ({ ...prev, important: v }))
            }
            expired={tempAdvancedSearch.expired}
            onChangeExpired={(v) =>
              setTempAdvancedSearch((prev) => ({ ...prev, expired: v }))
            }
            onSubmit={() => {
              setCurrentDocumentId([]);
              setSelectList([]);
              setSearchField((prev) => ({
                ...prev,
                ...tempAdvancedSearch,
                isAdvanceSearch: true,
                page: 1,
              }));
              setFilter((prev) => ({ ...prev, page: 1 }));
            }}
            extraBtn={
              <Button
                variant="outline"
                onClick={() => {
                  setTempAdvancedSearch(defaultAdvancedSearchField);
                  setSearchField((prev) => ({
                    ...prev,
                    ...defaultAdvancedSearchField,
                    isAdvanceSearch: false,
                    page: 1,
                  }));
                  setFilter((prev) => ({ ...prev, page: 1 }));
                  setIsAdvancedSearchExpanded(false);
                  setCanReceive(false);
                  setSelectList([]);
                }}
                className="h-9 px-4 text-sm font-medium"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Đặt lại
              </Button>
            }
          />
        )}

      {/* Status Tabs với Document Type Selector */}
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
          <button
            onClick={() => {
              onTabSelect(TabNames.TIEPNHAN);
              setIsAdvancedSearchExpanded(false);
              setTempAdvancedSearch(defaultAdvancedSearchField);
            }}
            className={cn(
              "flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded transition-all duration-200",
              searchField.currentTab === TabNames.TIEPNHAN
                ? "bg-white text-blue-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
            )}
          >
            {tab1Title}
          </button>
          {Constant.ORG_MULTI_TRANSFER_BCY && (
            <button
              onClick={() => {
                onTabSelect(TabNames.CHOTIEPNHAN);
                setIsAdvancedSearchExpanded(false);
                setTempAdvancedSearch(defaultAdvancedSearchField);
              }}
              className={cn(
                "flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded transition-all duration-200",
                searchField.currentTab === TabNames.CHOTIEPNHAN
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-600 hover:text-gray-900 hover:bg-white/50"
              )}
            >
              Chờ tiếp nhận
            </button>
          )}
        </div>

        <EncryptDisplaySelect
          onChange={() => {
            doAdvanceSearchSubmit(1);
          }}
          selectClassName="w-36 h-9 text-xs"
        />
      </div>

      <Tabs value={searchField.currentTab} onValueChange={onTabSelect}>
        <TabsList className="hidden">
          <TabsTrigger
            className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            value={TabNames.TIEPNHAN}
          >
            {tab1Title}
          </TabsTrigger>
          {Constant.ORG_MULTI_TRANSFER_BCY && (
            <TabsTrigger
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white"
              value={TabNames.CHOTIEPNHAN}
            >
              Chờ tiếp nhận
            </TabsTrigger>
          )}
        </TabsList>
        <TabsContent value={TabNames.TIEPNHAN}>
          <Table
            sortable={true}
            clientSort={false}
            onSort={onTableSort}
            columns={handleColumns}
            dataSource={handleData}
            loading={handleLoading}
            rowSelection={{
              selectedRowKeys: currentDocumentId.map(String),
              onChange: (keys, rows) => {
                const numericKeys = keys.map((k) => Number(k));
                setCurrentDocumentId(numericKeys);

                setSelectList((prev) => {
                  const currentPageIds = handleData.map((d) => d.docId);
                  const itemsFromOtherPages = prev.filter(
                    (item) => !currentPageIds.includes(item.docId)
                  );

                  const selectedFromCurrentPage = handleData.filter((d) =>
                    numericKeys.includes(d.docId)
                  );

                  return [...itemsFromOtherPages, ...selectedFromCurrentPage];
                });
              },
              rowKey: "docId",
            }}
            hasAllChange={true}
            totalItems={handleTotal}
            itemsPerPage={filter.size}
            currentPage={filter.page}
            onPageChange={pageChanged}
            onItemsPerPageChange={changePageSize}
            rowClassName={(record, index) =>
              index % 2 === 0
                ? "bg-white hover:!bg-white"
                : "bg-[#0000000d] hover:!bg-[#0000000d]"
            }
            pageSizeOptions={Constant.PAGE_SIZE_OPTION?.map(
              (item) => item.value
            )}
            onRowClick={(record) => goToDetailPage(record)}
            emptyText={<EmptyDocument />}
          />
        </TabsContent>
        {Constant.ORG_MULTI_TRANSFER_BCY && (
          <TabsContent value={TabNames.CHOTIEPNHAN}>
            <Table
              sortable={true}
              clientSort={false}
              onSort={onTableSort}
              columns={waitColumns}
              dataSource={waitData}
              loading={waitLoading}
              rowSelection={{
                selectedRowKeys: currentDocumentId.map(String),
                onChange: (keys, rows) => {
                  const numericKeys = keys.map((k) => Number(k));
                  setCurrentDocumentId(numericKeys);

                  setSelectList((prev) => {
                    const currentPageIds = waitData.map((d) => d.docId);
                    const itemsFromOtherPages = prev.filter(
                      (item) => !currentPageIds.includes(item.docId)
                    );

                    const selectedFromCurrentPage = waitData.filter((d) =>
                      numericKeys.includes(d.docId)
                    );

                    return [...itemsFromOtherPages, ...selectedFromCurrentPage];
                  });
                },
                rowKey: "docId",
              }}
              hasAllChange={true}
              totalItems={waitTotal}
              itemsPerPage={searchField.pageSize}
              currentPage={filter.page}
              onPageChange={pageChanged}
              onItemsPerPageChange={changePageSize}
              rowClassName={(record, index) =>
                index % 2 === 0
                  ? "bg-white hover:!bg-white"
                  : "bg-[#0000000d] hover:!bg-[#0000000d]"
              }
              pageSizeOptions={Constant.PAGE_SIZE_OPTION?.map(
                (item) => item.value
              )}
              onRowClick={(record) => goToDetailPage(record)}
            />
          </TabsContent>
        )}
      </Tabs>

      <AttachmentDialog2
        open={openAttachmentDialog}
        onOpenChange={setOpenAttachmentDialog}
        data={selectedAttachments}
      />

      <ConfirmDeleteDialog
        isOpen={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        onConfirm={handleClickDelete}
        title="Hãy xác nhận"
        description="Bạn có chắc chắn muốn xóa văn bản?"
        confirmText="Đồng ý"
        cancelText="Đóng"
      />
      <ConfirmDeleteDialog
        isOpen={confirmReject}
        onOpenChange={setConfirmReject}
        onConfirm={doReject}
        title="Hãy xác nhận"
        description="Bạn có chắc muốn từ chối"
        confirmText="Đồng ý"
        cancelText="Đóng"
      />
    </div>
  );
}
