"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import BreadcrumbNavigation from "../common/BreadcrumbNavigation";
import DelegateTable from "./delegateTable";
import DelegateOutFilter from "./delegateOutFilter";

import { Constant } from "@/definitions/constants/constant";
import { THREAD_TYPE } from "@/definitions/constants/common.constant";
import { getDefaultDelegateOutSearchField } from "@/utils/formValue.utils";
import {
  addDeadlineWarningToTasks,
  getDeadlineWarningClasses,
} from "@/utils/deadline.utils";
import { canViewNoStatus, handleError } from "@/utils/common.utils";

import { DelegateService } from "@/services/delegate.service";
import { useGetNextNodes, useGetStartNodes } from "@/hooks/data/bpmn.data";

import { DocumentOutService } from "@/services/document-out.service";
import { DocumentService } from "@/services/document.service";
import { uploadFileService } from "@/services/file.service";

import { Checkbox } from "../ui/checkbox";
import { Button } from "../ui/button";
import { File } from "lucide-react";
import dayjs from "dayjs";

import OutReject from "./popup/reject/OutReject";
import OutTransfer from "./popup/transfer/OutTransfer";
import OutTransferDone from "./popup/transferDone/OutTransferDone";
import ConfirmDeleteDialog from "../common/ConfirmDeleteDialog";
import RetakeDialog from "../common/RetakeDialog";
import DraftService from "@/services/draft.service";
import { RetakeService } from "@/services/retake.service";
import { toast } from "@/hooks/use-toast";
import { DocumentInService } from "@/services/document-in.service";
import { SearchTitles, TabNames } from "@/definitions/enums/delegate.enum";
import { ToastUtils } from "@/utils/toast.utils";

export default function DelegateOutPage() {
  const router = useRouter();

  // ==================== STATE ====================
  const [paging, setPaging] = useState({
    totalRecord: -1,
    currentPage: 1,
    itemsPerPage: Constant.ITEMS_PER_PAGE,
  });

  const [searchField, setSearchField] = useState(
    getDefaultDelegateOutSearchField()
  );
  const [isAdvanceSearch, setIsAdvanceSearch] = useState(false);

  const [currentTab, setCurrentTab] = useState<TabNames>(TabNames.CHOXULY);
  const [selectedDocuments, setSelectedDocuments] = useState<any[]>([]);
  const [selectedList, setSelectedList] = useState<any[]>([]);
  const [currentDraft, setCurrentDraft] = useState<any>(null);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);

  const [listNextNode, setListNextNode] = useState<any[]>([]);
  const [docCurrentNode, setDocCurrentNode] = useState<any>(null);
  const [isShowDoneButton, setIsShowDoneButton] = useState(false);

  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showTransferDoneModal, setShowTransferDoneModal] = useState(false);
  const [showRetakeByStepModal, setShowRetakeByStepModal] = useState(false);
  const [isOpenConfirmDeleteDialog, setIsOpenConfirmDeleteDialog] =
    useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  const [retakeByStepButton, setRetakeByStepButton] = useState(false);

  const [renderKey, setRenderKey] = useState(0);

  const { data: startNodesData, refetch: refetchStartNodes } = useGetStartNodes(
    THREAD_TYPE.OUTCOMING,
    false,
    false
  );
  const { data: nextNodesData, refetch: refetchNextNodes } =
    useGetNextNodes(docCurrentNode);

  // ==================== QUERY & DATA ====================

  const buildQueryParams = (isAdvancedSearch: boolean) => {
    let params: Record<string, any> = {};

    if (isAdvancedSearch) {
      params = {
        sign: searchField.numberOrSign,
        preview: searchField.preview,
        page: paging.currentPage.toString(),
        docTypeId: searchField.docTypeId,
        docFieldId: searchField.docFieldsId,
        orgName: searchField.orgName,
        userEnter: searchField.userEnter,
        sortBy: searchField.sortBy,
        direction: searchField.direction,
        size: searchField.pageSize.toString(),
      };

      params = DocumentService.addDateToHttpParams(
        params,
        ["startDate", "endDate"],
        searchField as any
      );
    } else {
      params = {
        q: searchField.quickSearchText?.toString?.() || "",
        page: paging.currentPage.toString(),
        sortBy: searchField.sortBy,
        direction: searchField.direction,
        size: searchField.pageSize.toString(),
      };
    }

    for (const key of Object.keys(params)) {
      if (params[key] === "") delete params[key];
    }
    return params;
  };

  const [isLoading, setIsLoading] = useState(false);

  const fetchList = async () => {
    try {
      setIsLoading(true);
      const params = buildQueryParams(isAdvanceSearch);
      let data: any;
      if (isAdvanceSearch) {
        data = await DelegateService.searchAdvancedOutDraft(currentTab, params);
      } else if (searchField.quickSearchText || searchField.sortBy) {
        data = await DelegateService.searchBasicOutDraft(currentTab, params);
      } else {
        data = await DelegateService.getOutDraftList(currentTab);
      }
      const total = data?.totalElements ?? data?.totalRecord ?? 0;
      const list = data?.content ?? data?.objList ?? [];
      setPaging((prev) => ({ ...prev, totalRecord: Number(total) }));
      setWaitDraftTabs((prev) => {
        const idx = currentTab === TabNames.CHOXULY ? 0 : 1;
        const updated = [...prev];
        updated[idx] = { ...updated[idx], data: list } as any;
        return updated;
      });
    } catch (e) {
      handleError(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [
    currentTab,
    isAdvanceSearch,
    paging.currentPage,
    searchField.sortBy,
    searchField.direction,
    searchField.pageSize,
    searchField.quickSearchText,
    searchField.numberOrSign,
    searchField.preview,
    searchField.docTypeId,
    searchField.docFieldsId,
    searchField.orgName,
    searchField.userEnter,
    searchField.startDate,
    searchField.endDate,
  ]);

  // ==================== TABS ====================
  const [waitDraftTabs, setWaitDraftTabs] = useState<
    { name: TabNames; disabled: boolean; title: string; data: any[] }[]
  >([
    { name: TabNames.CHOXULY, disabled: false, title: "Chờ xử lý", data: [] },
    { name: TabNames.DAXULY, disabled: false, title: "Đã xử lý", data: [] },
  ]);

  const currentTabData =
    waitDraftTabs.find((t) => t.name === currentTab)?.data || [];

  // ==================== EFFECTS ====================
  useEffect(() => {
    setSearchField((prev) => ({ ...prev, currentTab }));
  }, [currentTab]);

  useEffect(() => {
    if (startNodesData) {
      setListNextNode(startNodesData);
      checkProcessDone(startNodesData);
    }
  }, [startNodesData]);

  useEffect(() => {
    if (nextNodesData) {
      setListNextNode(nextNodesData);
      checkProcessDone(nextNodesData);
    }
  }, [nextNodesData]);

  // ==================== SEARCH / PAGING ====================
  const doBeforeLoadingResult = (currentPage: number) => {
    setSearchField((prev) => ({ ...prev, page: currentPage }));
    setPaging((prev) => ({ ...prev, currentPage }));
  };

  const doAdvanceSearch = (pageNumber: number) => {
    setIsAdvanceSearch(true);
    setSearchField((prev) => ({ ...prev, isAdvanceSearch: true }));
    doBeforeLoadingResult(pageNumber);
  };

  const doBasicSearch = (pageNumber: number) => {
    setIsAdvanceSearch(false);
    setSearchField((prev) => ({ ...prev, isAdvanceSearch: false }));
    doBeforeLoadingResult(pageNumber);
  };

  const doSearch = (page: number, sortField = "") => {
    if (!page) page = searchField.page;
    if (sortField) {
      setSearchField((prev) => ({ ...prev, sortBy: sortField }));
      toggleSortType();
    }
    if (searchField.isAdvanceSearch) doAdvanceSearch(page);
    else doBasicSearch(page);
  };

  const toggleSortType = () => {
    if (Constant.SORT_TYPE.DECREASE === searchField.direction) {
      setSearchField((prev) => ({
        ...prev,
        direction: Constant.SORT_TYPE.INCREASE,
      }));
    } else {
      setSearchField((prev) => ({
        ...prev,
        direction: Constant.SORT_TYPE.DECREASE,
      }));
    }
  };

  const handlePageChange = (page: number) => {
    setPaging((prev) => ({ ...prev, currentPage: page }));
    setSearchField((prev) => ({ ...prev, page }));
    doSearch(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPaging((prev) => ({ ...prev, itemsPerPage: size, currentPage: 1 }));
    setSearchField((prev) => ({ ...prev, pageSize: size, page: 1 }));
    doSearch(1);
  };

  const handleSort = (field: string) => {
    setSearchField((prev) => ({ ...prev, sortBy: field }));
    toggleSortType();
    doSearch(paging.currentPage, field);
  };

  const handleTabChange = (tabName: string) => {
    setCurrentTab(tabName as TabNames);
    setSelectedDocuments([]);
    setSearchField((prev) => ({ ...prev, currentTab: tabName, page: 1 }));
    setPaging((prev) => ({ ...prev, currentPage: 1 }));
    doBasicSearch(1);
  };

  // ==================== SELECTION ====================
  const isSelected = (data: any[], id: string, row: any) => {
    if (!data) return;

    const updated = data.map((x) => {
      if (x.docId == id && x.isChecked) {
        const updatedItem = { ...x, isChecked: false };
        setCurrentDraftId(null);
        setCurrentDraft(null);
        setRetakeByStepButton(false);
        if (Constant.MULTI_TRANSFER_H05 && currentTab === TabNames.CHOXULY) {
          setSelectedList((prev) => prev.filter((i) => i.docId !== id));
        }
        return updatedItem;
      } else if (x.docId == id && !x.isChecked) {
        const updatedItem = { ...x, isChecked: true };
        if (Constant.MULTI_TRANSFER_H05 && currentTab === TabNames.CHOXULY) {
          setSelectedList((prev) => [...prev, row]);
        }
        setCurrentDraftId(x.docId);
        setCurrentDraft(x);
        if (!x.nodeId) {
          setDocCurrentNode(null);
          refetchStartNodes();
        } else {
          setDocCurrentNode(x.nodeId);
          refetchNextNodes();
        }
        return updatedItem;
      } else if (
        !Constant.MULTI_TRANSFER_H05 ||
        currentTab !== TabNames.CHOXULY
      ) {
        return { ...x, isChecked: false };
      }
      return x;
    });

    setWaitDraftTabs((prev) =>
      prev.map((tab) =>
        tab.name === currentTab ? { ...tab, data: updated } : tab
      )
    );

    setRenderKey((k) => k + 1);

    if (Constant.MULTI_TRANSFER_H05 && currentTab === TabNames.CHOXULY) {
      if (selectedList.length > 0) {
        updated.forEach((element: any) => {
          element.disable = element.nodeId != selectedList[0]?.nodeId;
        });
      } else {
        updated.forEach((element: any) => {
          element.disable = false;
        });
      }
    }

    if (currentDraftId != null && currentTab == TabNames.DAXULY) {
      checkButtonRetakeByStep();
    }
  };

  // ==================== HELPERS ====================
  const checkProcessDone = (nodes: any[]) => {
    const oldLength = nodes?.length || 0;
    const filtered = (nodes || []).filter((e: any) => !e.lastNode);
    setListNextNode(filtered);
    setIsShowDoneButton((filtered?.length ?? 0) !== oldLength);
  };

  const isView = (fileName: any) => canViewNoStatus(fileName);

  const viewFile = async (file: any) => {
    try {
      await uploadFileService.viewFile(
        file,
        Constant.ATTACHMENT_DOWNLOAD_TYPE.DELEGATE
      );
    } catch (e) {
      handleError(e);
    }
  };

  const downloadFile = async (fileName: any, encrypt: boolean) => {
    try {
      await uploadFileService.downloadFile(
        fileName,
        Constant.ATTACHMENT_DOWNLOAD_TYPE.DELEGATE,
        encrypt
      );
    } catch (e) {
      handleError(e);
    }
  };

  const checkButtonRetakeByStep = async () => {
    try {
      const res = await RetakeService.checkButtonRetakeByStep(
        currentDraftId || "",
        false
      );
      if (res && res.canRetake) {
        setRetakeByStepButton(true);
      } else {
        setRetakeByStepButton(false);
      }
    } catch (e) {
      handleError(e);
    }
  };

  // ==================== ACTIONS ====================
  const doDeleteDocument = (docId: string) => {
    setDeleteTargetId(docId);
    setIsOpenConfirmDeleteDialog(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await DocumentInService.deleteDraft(deleteTargetId);
      ToastUtils.success("Xóa dự thảo thành công");
      setDeleteTargetId(null);
      fetchList();
    } catch (e) {
      handleError(e);
    }
  };

  const handleRetakeDocOut = async (docId: string, comment: any) => {
    try {
      await RetakeService.doRetakeDocIn(docId, comment);
      ToastUtils.success("Thu hồi văn bản thành công");
      setShowRetakeByStepModal(false);
      setCurrentDraftId(null);
      doBasicSearch(searchField.page);
    } catch (e) {
      handleError(e);
    }
  };

  // ==================== TABLE COLUMNS ====================
  const columns = [
    {
      header: "STT",
      sortable: false,
      className: "text-center w-16 border-r",
      accessor: (item: any, index: number) => (
        <div
          className={`flex items-center justify-center gap-2 ${
            item.deadlineWarning
              ? getDeadlineWarningClasses(item.deadlineWarning.color)
              : ""
          }`}
        >
          <span>
            {(paging.currentPage - 1) * paging.itemsPerPage + index + 1}
          </span>
          <Checkbox
            checked={item.isChecked || false}
            disabled={item.disable || false}
            onCheckedChange={() => {
              isSelected(currentTabData, item.docId, item);
            }}
          />
        </div>
      ),
    },
    {
      header: "Số ký hiệu",
      className: "text-center w-32 border-r",
      sortable: true,
      sortKey: SearchTitles.NUMBERSIGN,
      accessor: (item: any) => (
        <span
          className={`cursor-pointer hover:text-blue-800 ${
            item.deadlineWarning
              ? getDeadlineWarningClasses(item.deadlineWarning.color)
              : "text-blue-600"
          }`}
          onClick={() => router.push(`/document-out/main/detail/${item.docId}`)}
        >
          {item.numberOrSign || item.numberSign || "-"}
        </span>
      ),
    },
    {
      header: "Trích yếu",
      className: "text-start w-32 border-r",
      sortable: true,
      sortKey: SearchTitles.PREVIEW,
      accessor: (item: any) => (
        <span
          className={`cursor-pointer hover:text-blue-800 ${
            item.deadlineWarning
              ? getDeadlineWarningClasses(item.deadlineWarning.color)
              : "text-blue-600"
          }`}
          onClick={() => router.push(`/document-out/main/detail/${item.docId}`)}
        >
          {item.preview || "-"}
        </span>
      ),
    },
    {
      header: "Độ mật",
      className: "text-center w-32 border-r",
      sortable: true,
      sortKey: SearchTitles.SECURITY_NAME,
      accessor: (item: any) => (
        <span
          className={
            item.deadlineWarning
              ? getDeadlineWarningClasses(item.deadlineWarning.color)
              : ""
          }
        >
          {item.securityName || "-"}
        </span>
      ),
    },
    {
      header: "Người ủy quyền",
      className: "text-center w-48 border-r",
      sortable: true,
      sortKey: SearchTitles.DELEGATE_USER,
      accessor: (item: any) => (
        <span
          className={
            item.deadlineWarning
              ? getDeadlineWarningClasses(item.deadlineWarning.color)
              : ""
          }
        >
          {item.delegater || item.delegateUser || "-"}
        </span>
      ),
    },
    {
      header: "Hạn xử lý",
      className: "text-center w-32 border-r",
      sortable: true,
      sortKey: SearchTitles.HANDLE_DATE,
      accessor: (item: any) => (
        <span
          className={
            item.deadlineWarning
              ? getDeadlineWarningClasses(item.deadlineWarning.color)
              : ""
          }
        >
          {item.deadline ? dayjs(item.deadline).format("DD/MM/YYYY") : "-"}
        </span>
      ),
    },
    {
      header: "Đính kèm",
      sortable: false,
      className: "text-center w-32 border-r",
      accessor: (item: any) => {
        if (!item.attachments || item.attachments.length === 0) return "-";
        if (item.attachments.length === 1) {
          const attachment = item.attachments[0];
          const canView = isView(attachment.name);
          return (
            <Button
              className="hover:text-yellow-600 cursor-pointer"
              onClick={() => {
                if (canView) viewFile(attachment);
                else downloadFile(attachment.name, attachment.encrypt);
              }}
              title={attachment.displayName}
            >
              <File className="w-4 h-4" />
            </Button>
          );
        }
        return (
          <Button
            className="hover:text-yellow-600 cursor-pointer"
            title={`${item.attachments.length} files`}
          >
            <File className="w-4 h-4" />
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-4 py-0 px-4">
      <BreadcrumbNavigation
        items={[{ label: "Tiện ích khác" }]}
        currentPage=" Ủy quyền xử lý - Văn bản đi"
        showHome={false}
      />

      <DelegateOutFilter
        onSearch={(searchData) => {
          setSearchField((prev) => ({
            ...prev,
            quickSearchText: searchData.quickSearchText,
            page: searchData.page || 1,
            isAdvanceSearch: false,
            currentTab: currentTab,
          }));
          doBasicSearch(searchData.page || 1);
        }}
        onAdvancedSearch={(searchData) => {
          setSearchField((prev) => ({
            ...prev,
            startDate: searchData.startDate,
            endDate: searchData.endDate,
            docTypeId: searchData.docTypeId,
            numberOrSign: searchData.numberOrSign,
            userEnter: searchData.userEnter,
            orgName: searchData.orgName,
            preview: searchData.preview,
            page: searchData.page || 1,
            isAdvanceSearch: true,
            currentTab: currentTab,
          }));
          doAdvanceSearch(searchData.page || 1);
        }}
        isAdvanceSearch={isAdvanceSearch}
        onToggleAdvanceSearch={(isAdvance) => {
          setIsAdvanceSearch(isAdvance);
          setSearchField((prev) => ({ ...prev, isAdvanceSearch: isAdvance }));
        }}
        onResetSearch={() => {
          setSearchField(getDefaultDelegateOutSearchField());
          setIsAdvanceSearch(false);
          doBasicSearch(1);
        }}
        onOpenTransferPopup={() => setShowTransferModal(true)}
        onOpenRejectPopup={() => setShowRejectModal(true)}
        onOpenDonePopup={() => setShowTransferDoneModal(true)}
        onOpenRetakeByStepPopup={() => setShowRetakeByStepModal(true)}
        currentTab={currentTab}
        currentDraftId={currentDraftId}
        selectedListLength={selectedList.length}
        isShowDoneButton={isShowDoneButton}
        retakeByStepEnabled={retakeByStepButton}
        listNextNode={listNextNode}
      />

      <DelegateTable
        key={renderKey}
        data={addDeadlineWarningToTasks(currentTabData)}
        loading={isLoading}
        paging={paging}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSort={handleSort}
        sortBy={searchField.sortBy}
        sortDirection={
          searchField.direction === Constant.SORT_TYPE.INCREASE ? "ASC" : "DESC"
        }
        currentTab={currentTab}
        onTabChange={handleTabChange}
        tabs={waitDraftTabs}
        selectedDocuments={selectedDocuments}
        onSelectionChange={(keys, rows) => setSelectedDocuments(keys)}
        columns={columns}
        showDeadlineWarnings={false}
      />

      <OutReject
        isOpen={showRejectModal}
        onOpenChange={setShowRejectModal}
        documentId={currentDraftId || ""}
        onSuccess={() => {
          setShowRejectModal(false);
          setCurrentDraftId(null);
          doBasicSearch(searchField.page);
        }}
      />

      <OutTransfer
        isOpen={showTransferModal}
        onOpenChange={setShowTransferModal}
        documentId={currentDraftId || ""}
        onSuccess={() => {
          setShowTransferModal(false);
          setCurrentDraftId(null);
          setSelectedList([]);
          doBasicSearch(searchField.page);
        }}
      />

      <OutTransferDone
        isOpen={showTransferDoneModal}
        onOpenChange={setShowTransferDoneModal}
        documentId={currentDraftId || ""}
        onSuccess={() => {
          setShowTransferDoneModal(false);
          setCurrentDraftId(null);
          doBasicSearch(searchField.page);
        }}
      />

      <RetakeDialog
        isOpen={showRetakeByStepModal}
        onOpenChange={setShowRetakeByStepModal}
        docId={currentDraftId || ""}
        onRetake={handleRetakeDocOut}
      />

      <ConfirmDeleteDialog
        isOpen={isOpenConfirmDeleteDialog}
        onOpenChange={setIsOpenConfirmDeleteDialog}
        onConfirm={handleConfirmDelete}
        title="Xác nhận xóa"
        description="Bạn có chắc chắn muốn xóa dự thảo này?"
        confirmText="Xóa"
      />
    </div>
  );
}
