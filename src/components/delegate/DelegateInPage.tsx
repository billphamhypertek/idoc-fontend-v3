"use client";

import { useState, useEffect } from "react";
import BreadcrumbNavigation from "../common/BreadcrumbNavigation";
import DelegateInFilter from "./delegateInFilter";
import DelegateTable from "./delegateTable";
import { getDefaultDelegateInSearchField } from "@/utils/formValue.utils";
import { Constant } from "@/definitions/constants/constant";
import { THREAD_TYPE } from "@/definitions/constants/common.constant";
import { useGetDocumentByHandleTypeAndStatusQuery } from "@/hooks/data/delegate.data";
import { useGetStartNodes, useGetNextNodes } from "@/hooks/data/bpmn.data";
import { DocumentService } from "@/services/document.service";
import { Checkbox } from "../ui/checkbox";
import { File } from "lucide-react";
import dayjs from "dayjs";
import {
  addDeadlineWarningToTasks,
  getDeadlineWarningClasses,
} from "@/utils/deadline.utils";
import { useRouter } from "next/navigation";
import { canViewNoStatus, handleError } from "@/utils/common.utils";
import { uploadFileService } from "@/services/file.service";
import DailyReportAttachmentInfo from "../daily-report/DailyReportAttachmentInfo";
import { Button } from "../ui/button";
import ProgressControlDialog from "../common/ProgressControlDialog";
import RetakeDialog from "../common/RetakeDialog";
import InReject from "./popup/reject/InReject";
import InTransfer from "./popup/transfer/InTransfer";
import InTransferDone from "./popup/transferDone/InTransferDone";
import DocumentOutDeadline from "../document-out/DocumentOutDeadline";
import { RetakeService } from "@/services/retake.service";
import { toast } from "@/hooks/use-toast";
import {
  DelegateSearchTitles,
  DelegateTabNames,
} from "@/definitions/enums/delegate.enum";
import DocumentOutRetakeModal from "../retake/DocumentOutRetake";
import { ToastUtils } from "@/utils/toast.utils";

interface ButtonStatus {
  hideAll: boolean;
  rejectButton: boolean;
  doneButton: boolean;
  transferButton: boolean;
  retakeByStep: boolean;
  retakeButton: boolean;
  evaluteRequestButton: boolean;
  evaluteButton: boolean;
}

export default function DelegateInPage() {
  const router = useRouter();
  const ORG_MULTI_TRANSFER_BCY = Constant.ORG_MULTI_TRANSFER_BCY;

  // ==================== STATE ====================
  const [buttonStatus, setButtonStatus] = useState<ButtonStatus>({
    hideAll: false,
    rejectButton: false,
    doneButton: false,
    transferButton: false,
    retakeByStep: false,
    retakeButton: false,
    evaluteRequestButton: false,
    evaluteButton: false,
  });

  const [paging, setPaging] = useState({
    totalRecord: -1,
    currentPage: 1,
    itemsPerPage: Constant.ITEMS_PER_PAGE,
  });

  const [searchField, setSearchField] = useState(
    getDefaultDelegateInSearchField()
  );

  const [isAdvanceSearch, setIsAdvanceSearch] = useState(false);

  const [currentTab, setCurrentTab] = useState<DelegateTabNames>(
    DelegateTabNames.MAIN_HANDLE
  );

  const [selectedDocuments, setSelectedDocuments] = useState<any[]>([]);
  const [selectedList, setSelectedList] = useState<any[]>([]);
  const [currentDocument, setCurrentDocument] = useState<any>(null);
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(
    null
  );
  const [currentDeadline, setCurrentDeadline] = useState<any>(null);
  const [docCurrentNode, setDocCurrentNode] = useState<any>(null);

  const [nodeStart, setNodeStart] = useState<any>(null);
  const [listNextNode, setListNextNode] = useState<any[]>([]);
  const [listNextNodeOrg, setListNextNodeOrg] = useState<any[]>([]);
  const [listNextNodeDisplay, setListNextNodeDisplay] = useState<any[]>([]);

  const [waitDocumentTabs, setWaitDocumentTabs] = useState<
    {
      name: DelegateTabNames;
      disabled: boolean;
      title: string;
      data: any[];
    }[]
  >([
    {
      name: DelegateTabNames.MAIN_HANDLE,
      disabled: false,
      title: "Xử lý chính",
      data: [],
    },
    {
      name: DelegateTabNames.COMBINE_HANDLE,
      disabled: false,
      title: "Xử lý phối hợp",
      data: [],
    },
    {
      name: DelegateTabNames.HANDLED,
      disabled: false,
      title: "Đã xử lý",
      data: [],
    },
  ]);

  const [renderKey, setRenderKey] = useState(0);

  // BPMN Hooks
  const { data: startNodesData, refetch: refetchStartNodes } = useGetStartNodes(
    THREAD_TYPE.INCOMING,
    false,
    false
  );

  const { data: nextNodesData, refetch: refetchNextNodes } =
    useGetNextNodes(docCurrentNode);

  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [showProgressControlModal, setShowProgressControlModal] =
    useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [showTransferDoneModal, setShowTransferDoneModal] = useState(false);
  const [showRetakeModal, setShowRetakeModal] = useState(false);
  const [showDeadlineModal, setShowDeadlineModal] = useState(false);
  const [showRetakeByStepModal, setShowRetakeByStepModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);
  const [selectedNode, setSelectedNode] = useState<any>(null);
  const [isFinishReceive, setIsFinishReceive] = useState(false);
  const [special, setSpecial] = useState(false);

  // ==================== UTILITY FUNCTIONS ====================
  const getHandleTypeAndStatus = (tabType: string) => {
    switch (tabType) {
      case DelegateTabNames.MAIN_HANDLE:
        return {
          handleType: Constant.PERSON_HANDLE_TYPE.MAIN,
          status: Constant.DOCUMENT_STATUS_TYPE.WAIT_HANDLE,
          tabIndex: 0,
        };
      case DelegateTabNames.COMBINE_HANDLE:
        return {
          handleType: Constant.PERSON_HANDLE_TYPE.COMBINE,
          status: Constant.DOCUMENT_STATUS_TYPE.WAIT_HANDLE,
          tabIndex: 1,
        };
      case DelegateTabNames.HANDLED:
        return {
          handleType: Constant.PERSON_HANDLE_TYPE.MAIN_AND_COMBINE,
          status: Constant.DOCUMENT_STATUS_TYPE.HANDLED,
          tabIndex: 2,
        };
      default:
        return {
          handleType: Constant.PERSON_HANDLE_TYPE.MAIN,
          status: Constant.DOCUMENT_STATUS_TYPE.WAIT_HANDLE,
          tabIndex: 0,
        };
    }
  };

  const buildQueryParams = (isAdvancedSearch: boolean) => {
    let params: Record<string, any>;
    const listDateName: string[] = [];

    if (isAdvancedSearch) {
      params = {
        preview: searchField.preview.toString(),
        dayLeft: searchField.dayLeft,
        docFieldsId: searchField.docFieldsId,
        docTypeId: searchField.docTypeId,
        page: paging.currentPage.toString(),
        sortBy: searchField.sortBy,
        direction: searchField.direction,
        size: searchField.pageSize.toString(),
      };

      params = DocumentService.addDateToHttpParams(
        params,
        listDateName,
        searchField
      );
    } else {
      params = {
        text: searchField.quickSearchText.toString(),
        dayLeft: searchField.dayLeft,
        page: paging.currentPage.toString(),
        sortBy: searchField.sortBy,
        direction: searchField.direction,
        size: searchField.pageSize.toString(),
      };
    }

    for (const key of Object.keys(params)) {
      if (params[key] === "") {
        delete params[key];
      }
    }

    return params;
  };

  const getCurrentDocumentId = () => {
    if (
      Constant.MULTI_TRANSFER_H05 &&
      currentTab === DelegateTabNames.MAIN_HANDLE
    ) {
      if (selectedList.length > 0 && selectedList[0].doc != null) {
        return selectedList[0].docId;
      }
      return null;
    }
    return currentDocumentId;
  };

  const checkProcessDone = (nodes: any[]) => {
    if (!nodes || nodes.length === 0) {
      setButtonStatus((prev) => ({ ...prev, doneButton: false }));
      setListNextNodeDisplay([]);
      return;
    }

    const oldLength = nodes.length;

    const filteredNodes = nodes.filter((e: any) => !e.lastNode);
    setListNextNodeDisplay(filteredNodes);

    const hasDoneButton = filteredNodes.length !== oldLength;

    setButtonStatus((prev) => ({
      ...prev,
      doneButton: hasDoneButton,
    }));
  };

  const processStartNodes = (data: any[]) => {
    setNodeStart(data[0] || null);
    setListNextNode(data);

    const filteredOrg = data.filter((x: any) => x.allowMultiple);
    setListNextNodeOrg(filteredOrg);

    checkProcessDone(data);
  };

  const processNextNodes = (data: any[]) => {
    setListNextNode(data);

    const filteredOrg = data.filter((x: any) => x.allowMultiple);
    setListNextNodeOrg(filteredOrg);

    checkProcessDone(data);
  };

  useEffect(() => {
    if (startNodesData && currentDocumentId) {
      processStartNodes(startNodesData);
    }
  }, [startNodesData, currentDocumentId]);

  useEffect(() => {
    if (nextNodesData && currentDocumentId) {
      processNextNodes(nextNodesData);
    }
  }, [nextNodesData, currentDocumentId]);

  const doCheckShowDoneButton = async (docId?: string | null) => {
    const documentIdToUse = docId !== undefined ? docId : currentDocumentId;

    if (currentTab !== DelegateTabNames.HANDLED) {
      try {
        const tabParams = {
          [DelegateTabNames.MAIN_HANDLE]: "XU_LY_CHINH",
          [DelegateTabNames.COMBINE_HANDLE]: "XU_LY_PHOI_HOP",
          [DelegateTabNames.HANDLED]: "DA_XU_LY",
        };

        const res = await DocumentService.doGetHandleType(
          documentIdToUse || null,
          tabParams[currentTab]
        );

        if (res) {
          if (res.type == null || res.type == Constant.HANDLE_TYPE.SHOW) {
            setButtonStatus((prev) => ({ ...prev, hideAll: true }));
          } else if (
            res.type === Constant.HANDLE_TYPE.SUPPORT &&
            !(res.status == "DA_XU_LY_UQ")
          ) {
            setButtonStatus((prev) => ({
              ...prev,
              doneButton: true,
              transferButton: false,
            }));
          } else if (res.type == Constant.HANDLE_TYPE.MAIN) {
            setButtonStatus((prev) => ({
              ...prev,
              rejectButton: !(res.status == "DA_TRA_LAI" || !res.showReturnDoc),
              transferButton: res.status != "DA_TRA_LAI",
            }));
          }

          if (res.canRequestReview) {
            setButtonStatus((prev) => ({
              ...prev,
              evaluteRequestButton: true,
            }));
          }

          if (res.canReview) {
            setButtonStatus((prev) => ({ ...prev, evaluteButton: true }));
          }

          if (
            res.canRequestReview ||
            res.canReview ||
            res.status == "XIN_DANH_GIA"
          ) {
            setButtonStatus((prev) => ({
              ...prev,
              transferButton: false,
              doneButton: false,
            }));
          }
        }
      } catch (error) {
        handleError(error);
      }
    } else {
      try {
        const tabParams = {
          [DelegateTabNames.MAIN_HANDLE]: "XU_LY_CHINH",
          [DelegateTabNames.COMBINE_HANDLE]: "XU_LY_PHOI_HOP",
          [DelegateTabNames.HANDLED]: "DA_XU_LY",
        };

        const res = await DocumentService.doGetHandleType(
          documentIdToUse || null,
          tabParams[currentTab]
        );

        if (res) {
          if (currentTab == DelegateTabNames.HANDLED && res.canRetake) {
            setButtonStatus((prev) => ({ ...prev, retakeByStep: true }));
          } else {
            setButtonStatus((prev) => ({ ...prev, retakeByStep: false }));
          }

          if (res.canRequestReview) {
            setButtonStatus((prev) => ({
              ...prev,
              evaluteRequestButton: true,
            }));
          }

          if (res.canReview) {
            setButtonStatus((prev) => ({ ...prev, evaluteButton: true }));
          }

          if (
            res.canRequestReview ||
            res.canReview ||
            res.status == "XIN_DANH_GIA"
          ) {
            setButtonStatus((prev) => ({
              ...prev,
              transferButton: false,
              doneButton: false,
            }));
          }
        }
      } catch (error) {
        handleError(error);
      }
    }
  };

  useEffect(() => {
    if (
      currentDocumentId &&
      (startNodesData || nextNodesData) &&
      currentTab !== DelegateTabNames.HANDLED
    ) {
      const timer = setTimeout(() => {
        doCheckShowDoneButton(currentDocumentId);
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [startNodesData, nextNodesData, currentDocumentId, currentTab]);

  useEffect(() => {
    if (currentDocumentId && currentTab === DelegateTabNames.HANDLED) {
      const timer = setTimeout(() => {
        doCheckShowDoneButton(currentDocumentId);
      }, 50);

      return () => clearTimeout(timer);
    }
  }, [currentDocumentId, currentTab]);

  const isSelected = (doc: any[], id: string, document: any) => {
    setCurrentDocument(document);

    doc.forEach((x) => {
      if (x.docId === id && x.isChecked) {
        // ========== UNCHECK ==========
        x.isChecked = false;
        setCurrentDocumentId(null);
        setCurrentDeadline(null);
        setDocCurrentNode(null);
        setButtonStatus((prev) => ({
          ...prev,
          doneButton: false,
          rejectButton: false,
          retakeByStep: false,
          evaluteButton: false,
          evaluteRequestButton: false,
        }));

        if (
          Constant.MULTI_TRANSFER_H05 &&
          currentTab === DelegateTabNames.MAIN_HANDLE
        ) {
          for (let i = 0; i < selectedList.length; i++) {
            if (selectedList[i].docId === id) {
              selectedList.splice(i, 1);
            }
          }

          if (selectedList.length === 1) {
            setCurrentDocumentId(selectedList[0].docId);
            setCurrentDeadline(selectedList[0].deadline);
            setDocCurrentNode(selectedList[0].node);

            if (selectedList[0].node === null) {
              setNodeStart(null);
              setListNextNode([]);
              setListNextNodeOrg([]);
              refetchStartNodes();
            } else {
              setNodeStart(null);
              setListNextNode([]);
              setListNextNodeOrg([]);
              setDocCurrentNode(selectedList[0].node);
              refetchNextNodes();
            }
          } else if (selectedList.length === 0) {
            setCurrentDocumentId(null);
            setCurrentDeadline(null);
            setDocCurrentNode(null);
            setButtonStatus((prev) => ({
              ...prev,
              doneButton: false,
              rejectButton: false,
              retakeByStep: false,
              evaluteRequestButton: false,
              evaluteButton: false,
            }));
          }
        }
      } else if (x.docId === id && !x.isChecked) {
        // ========== CHECK ==========
        x.isChecked = true;
        if (
          Constant.MULTI_TRANSFER_H05 &&
          currentTab === DelegateTabNames.MAIN_HANDLE
        ) {
          setSelectedList((prev) => [...prev, document]);
        }
        setCurrentDocumentId(x.docId);
        setCurrentDeadline(x.deadline);
        setDocCurrentNode(x.node);
        setButtonStatus((prev) => ({
          ...prev,
          doneButton: false,
          rejectButton: false,
        }));

        if (x.node === null) {
          setNodeStart(null);
          setListNextNode([]);
          setListNextNodeOrg([]);
          refetchStartNodes();
        } else {
          setNodeStart(null);
          setListNextNode([]);
          setListNextNodeOrg([]);
          setDocCurrentNode(x.node);
          refetchNextNodes();
        }
      } else if (
        !Constant.MULTI_TRANSFER_H05 ||
        currentTab != DelegateTabNames.MAIN_HANDLE
      ) {
        x.isChecked = false;
      }
    });

    if (
      Constant.MULTI_TRANSFER_H05 &&
      currentTab === DelegateTabNames.MAIN_HANDLE
    ) {
      if (selectedList.length > 0) {
        selectedList.forEach((element) => {
          element.disable = element.node !== selectedList[0].node;
          if (!element.isChecked && !element.disable) {
            doCheckTransfer(element);
          }
        });
      } else {
        doc.forEach((element) => {
          element.disable = false;
        });
      }
      hideButton();
    }

    setWaitDocumentTabs((prev) =>
      prev.map((tab) =>
        tab.name === currentTab ? { ...tab, data: [...doc] } : tab
      )
    );

    setRenderKey((prev) => prev + 1);
  };

  const hideButton = () => {
    if (selectedList.length > 1) {
      setButtonStatus((prev) => ({
        ...prev,
        rejectButton: false,
        doneButton: false,
        retakeButton: false,
        retakeByStep: false,
        evaluteRequestButton: false,
        evaluteButton: false,
      }));
    }
  };

  const doCheckTransfer = async (document: any) => {
    try {
      const res = await DocumentService.doGetHandleType(document.docId);

      if (res) {
        document.transferButton = false;
        if (res.type == Constant.HANDLE_TYPE.MAIN) {
          document.transferButton = res.status != "DA_TRA_LAI";
        }
        if (
          res.canRequestReview ||
          res.canReview ||
          res.status == "XIN_DANH_GIA"
        ) {
          document.transferButton = false;
        }
        document.disable = document.transferButton == false;
      }
    } catch (error) {
      document.transferButton = false;
      document.disable = true;
    }
  };

  // ==================== SEARCH FUNCTIONS ====================
  const doBeforeLoadingResult = (currentPage: number) => {
    setSearchField((prev) => ({
      ...prev,
      page: currentPage,
    }));
    setPaging((prev) => ({
      ...prev,
      currentPage: currentPage,
    }));
  };

  const doAdvanceSearch = (pageNumber: number) => {
    setIsAdvanceSearch(true);
    setSearchField((prev) => ({
      ...prev,
      isAdvanceSearch: true,
    }));
    doBeforeLoadingResult(pageNumber);
  };

  const doBasicSearch = (pageNumber: number) => {
    setIsAdvanceSearch(false);
    setSearchField((prev) => ({
      ...prev,
      isAdvanceSearch: false,
    }));
    doBeforeLoadingResult(pageNumber);
  };

  const doSearch = (page: number, sortField = "") => {
    if (!page) {
      page = searchField.page;
    }

    if (sortField) {
      setSearchField((prev) => ({
        ...prev,
        sortBy: sortField,
      }));
      toggleSortType();
    }

    if (searchField.isAdvanceSearch) {
      doAdvanceSearch(page);
    } else {
      doBasicSearch(page);
    }
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

  // ==================== EVENT HANDLERS ====================
  const handleSearch = (searchData: any) => {
    setSearchField((prev) => ({
      ...prev,
      quickSearchText: searchData.quickSearchText,
      page: searchData.page || 1,
      isAdvanceSearch: false,
      currentTab: currentTab,
    }));
    doBasicSearch(searchData.page || 1);
  };

  const handleAdvancedSearch = (searchData: any) => {
    setSearchField((prev) => ({
      ...prev,
      preview: searchData.preview,
      docTypeId: searchData.docTypeId,
      page: searchData.page || 1,
      isAdvanceSearch: true,
      currentTab: currentTab,
    }));
    doAdvanceSearch(searchData.page || 1);
  };

  const handleToggleAdvanceSearch = (isAdvance: boolean) => {
    setIsAdvanceSearch(isAdvance);
    setSearchField((prev) => ({
      ...prev,
      isAdvanceSearch: isAdvance,
    }));
  };

  const handleResetSearch = () => {
    setSearchField(getDefaultDelegateInSearchField());
    setIsAdvanceSearch(false);
    doBasicSearch(1);
  };

  const handleResetAdvancedFields = () => {
    setSearchField((prev) => ({
      ...prev,
      preview: "",
      docTypeId: "",
    }));
  };

  const handleTabChange = (tabName: string) => {
    setCurrentTab(tabName as DelegateTabNames);
    setSelectedDocuments([]);
    setCurrentDocumentId(null);
    setCurrentDocument(null);
    setCurrentDeadline(null);
    setDocCurrentNode(null);
    setSelectedList([]);
    setButtonStatus({
      hideAll: false,
      rejectButton: false,
      doneButton: false,
      transferButton: false,
      retakeButton: false,
      retakeByStep: false,
      evaluteRequestButton: false,
      evaluteButton: false,
    });
    setSearchField((prev) => ({
      ...prev,
      currentTab: tabName,
      page: 1,
    }));
    setPaging((prev) => ({
      ...prev,
      currentPage: 1,
    }));
    doBasicSearch(1);
  };

  const handlePageChange = (page: number) => {
    setPaging((prev) => ({
      ...prev,
      currentPage: page,
    }));
    setSearchField((prev) => ({
      ...prev,
      page: page,
    }));
    doSearch(page);
  };

  const handlePageSizeChange = (size: number) => {
    setPaging((prev) => ({
      ...prev,
      itemsPerPage: size,
      currentPage: 1,
    }));
    setSearchField((prev) => ({
      ...prev,
      pageSize: size,
      page: 1,
    }));
    doSearch(1);
  };

  const handleSort = (field: string) => {
    setSearchField((prev) => ({
      ...prev,
      sortBy: field,
    }));
    toggleSortType();
    doSearch(paging.currentPage, field);
  };

  const handleViewDocument = (document: any) => {
    const isEvaluate = document.pstatusName == "Chờ đánh giá";
    const tabParams = {
      [DelegateTabNames.MAIN_HANDLE]: "XU_LY_CHINH",
      [DelegateTabNames.COMBINE_HANDLE]: "XU_LY_PHOI_HOP",
      [DelegateTabNames.HANDLED]: "DA_XU_LY",
    };

    const queryParams = new URLSearchParams({
      tab: tabParams[currentTab],
      orgTransfer: String(document.pstatus == "CHUYEN_DON_VI"),
      isEvaluate: String(isEvaluate),
    });

    router.push(
      `/document-out/main/detail/${document.docId}?${queryParams.toString()}`
    );
  };

  const handleSelectionChange = (
    selectedKeys: React.Key[],
    selectedRows: any[]
  ) => {
    setSelectedDocuments(selectedKeys);
  };

  const doOpenRejectPopup = () => {
    setShowRejectModal(true);
  };

  const doOpenTransferPopup = (node?: any) => {
    setSelectedNode(node);
    setSpecial(false);
    setShowTransferModal(true);
  };

  const doOpenOrgTransferPopup = (node?: any) => {
    setSelectedNode(node);
    setSpecial(true);
    setShowTransferModal(true);
  };

  const doOpenProcessDonePopup = (finishReceive: boolean) => {
    setIsFinishReceive(finishReceive);
    setShowTransferDoneModal(true);
  };

  const doOpenRetakePopup = (document?: any) => {
    setSelectedDocument(document);
    setShowRetakeModal(true);
  };

  const doOpenDeadlinePopup = () => {
    setShowDeadlineModal(true);
  };

  const isOrgTransferStatus = (docId: string) => {
    if (currentTab === DelegateTabNames.MAIN_HANDLE) {
      const currentTabData =
        waitDocumentTabs.find((tab) => tab.name === currentTab)?.data || [];
      return currentTabData.find(
        (x: any) => x.docId == docId && x.pstatus == "CHUYEN_DON_VI"
      )
        ? true
        : false;
    }
    return false;
  };

  const isCanFinishReceive = (docId: string) => {
    if (currentTab === DelegateTabNames.MAIN_HANDLE) {
      const currentTabData =
        waitDocumentTabs.find((tab) => tab.name === currentTab)?.data || [];
      return currentTabData.find((x: any) => x.docId == docId && x.canFinish)
        ? true
        : false;
    }
    return false;
  };

  const isView = (fileName: any) => {
    return canViewNoStatus(fileName);
  };

  const viewFile = async (file: any) => {
    try {
      await uploadFileService.viewFile(
        file,
        Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_OUT
      );
    } catch (error) {
      handleError(error);
    }
  };

  const downloadFile = async (fileName: any, encrypt: boolean) => {
    try {
      await uploadFileService.downloadFile(
        fileName,
        Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_OUT,
        encrypt
      );
    } catch (error) {
      handleError(error);
    }
  };

  const doOpenAttachmentInfo = (attachments: any[]) => {
    setSelectedDocument({ attachments });
    setShowAttachmentModal(true);
  };

  const openProgressControl = (document: any) => {
    setSelectedDocument(document);
    setShowProgressControlModal(true);
  };

  const handleRetakeDocOut = async (docId: string, comment: any) => {
    try {
      await RetakeService.doRetakeDocOut(docId, comment, false);
      ToastUtils.success("Thu hồi văn bản thành công");
      setShowRetakeByStepModal(false);
      setCurrentDocumentId(null);
      doBasicSearch(searchField.page);
    } catch (e) {
      handleError(e);
    }
  };

  const openRetakeByStepPopup = () => {
    setShowRetakeByStepModal(true);
  };

  // ==================== EFFECTS ====================
  useEffect(() => {
    setSearchField((prev) => ({
      ...prev,
      currentTab: currentTab,
    }));
  }, [currentTab]);

  // ==================== QUERY & DATA ====================
  const { handleType, status, tabIndex } = getHandleTypeAndStatus(currentTab);
  const queryParams = buildQueryParams(isAdvanceSearch);

  const {
    data: queryResult,
    isLoading,
    refetch: refetchDocuments,
  } = useGetDocumentByHandleTypeAndStatusQuery(handleType, status, queryParams);

  useEffect(() => {
    if (queryResult?.data) {
      setPaging((prev) => ({
        ...prev,
        totalRecord: queryResult.data?.totalRecord,
      }));

      setWaitDocumentTabs((prev) => {
        const updatedTabs = [...prev];
        updatedTabs[tabIndex] = {
          ...updatedTabs[tabIndex],
          data: queryResult.data?.objList || [],
        };
        return updatedTabs;
      });
    }
  }, [queryResult, tabIndex]);

  const currentTabData =
    waitDocumentTabs.find((tab) => tab.name === currentTab)?.data || [];

  // ==================== TABLE COLUMNS ====================
  const columns = [
    {
      header: "STT",
      sortable: false,
      className: "text-center w-16 border-r",
      noRowClick: true,
      accessor: (item: any, index: number) => (
        <div
          className={`flex items-center justify-center gap-2 ${item.deadlineWarning ? getDeadlineWarningClasses(item.deadlineWarning.color) : ""}`}
          onClick={(e) => e.stopPropagation()}
        >
          <span>
            {(paging.currentPage - 1) * paging.itemsPerPage + index + 1}
          </span>
          <Checkbox
            checked={item.isChecked || false}
            disabled={item.disable || false}
            onCheckedChange={(checked: boolean) => {
              isSelected(currentTabData, item.docId, item);
            }}
          />
        </div>
      ),
    },
    {
      header: "Số đến",
      className: "text-center w-32 border-r",
      sortable: true,
      sortKey: DelegateSearchTitles.NUMBER_ARRIVAL,
      accessor: (item: any, index: number) => (
        <span
          className={`cursor-pointer hover:text-blue-800 ${
            item.deadlineWarning
              ? getDeadlineWarningClasses(item.deadlineWarning.color)
              : "text-blue-600"
          }`}
          onClick={() => handleViewDocument(item)}
        >
          {item.numberArrivalStr || "-"}
        </span>
      ),
    },
    {
      header: "Trích yếu",
      className: "text-start w-32 border-r",
      sortable: true,
      sortKey: DelegateSearchTitles.PREVIEW,
      accessor: (item: any, index: number) => (
        <span
          className={`cursor-pointer hover:text-blue-800 ${
            item.deadlineWarning
              ? getDeadlineWarningClasses(item.deadlineWarning.color)
              : "text-blue-600"
          }`}
          onClick={() => handleViewDocument(item)}
        >
          {item.preview || "-"}
        </span>
      ),
    },
    {
      header: "Độ mật",
      className: "text-center w-32 border-r",
      sortable: true,
      sortKey: DelegateSearchTitles.SECURITY_NAME,
      accessor: (item: any, index: number) => (
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
      sortKey: DelegateSearchTitles.DELEGATER,
      accessor: (item: any, index: number) => (
        <span
          className={
            item.deadlineWarning
              ? getDeadlineWarningClasses(item.deadlineWarning.color)
              : ""
          }
        >
          {item.delegater || "-"}
        </span>
      ),
    },
    {
      header: "Hạn xử lý",
      className: "text-center w-32 border-r",
      sortable: true,
      sortKey: DelegateSearchTitles.DEADLINE,
      accessor: (item: any, index: number) => (
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
    ...(currentTab === DelegateTabNames.MAIN_HANDLE && ORG_MULTI_TRANSFER_BCY
      ? [
          {
            header: "Trạng thái xử lý",
            className: "text-center w-32 border-r",
            sortable: true,
            sortKey: DelegateSearchTitles.PROCESS_STATUS,
            noRowClick: true,
            accessor: (item: any, index: number) => (
              <span
                className={
                  item.deadlineWarning
                    ? getDeadlineWarningClasses(item.deadlineWarning.color)
                    : ""
                }
                onClick={(e) => {
                  e.stopPropagation();
                  router.push(`/document-out/main/detail/${item.docId}`);
                }}
              >
                {item.pstatusName || "-"}
              </span>
            ),
          },
        ]
      : []),
    {
      header: "Đính kèm",
      sortable: false,
      className: "text-center w-32 border-r",
      noRowClick: true,
      accessor: (item: any, index: number) => {
        if (!item.attachments || item.attachments.length === 0) {
          return "-";
        }

        if (item.attachments.length === 1) {
          const attachment = item.attachments[0];
          const canView = isView(attachment.name);

          return (
            <Button
              className="hover:text-yellow-600 cursor-pointer bg-transparent text-yellow-600 outline-none border-none shadow-none hover:bg-transparent"
              onClick={(e) => {
                e.stopPropagation();
                if (canView) {
                  viewFile(attachment);
                } else {
                  downloadFile(attachment.name, attachment.encrypt);
                }
              }}
              title={attachment.displayName}
            >
              <File className="w-4 h-4" />
            </Button>
          );
        }

        return (
          <Button
            className="hover:text-yellow-600 cursor-pointer bg-transparent text-yellow-600 outline-none border-none shadow-none hover:bg-transparent"
            onClick={(e) => {
              e.stopPropagation();
              doOpenAttachmentInfo(item.attachments);
            }}
            title={`${item.attachments.length} files`}
          >
            <File className="w-4 h-4" />
          </Button>
        );
      },
    },
    ...(currentTab !== DelegateTabNames.HANDLED
      ? [
          {
            header: "Tiến độ",
            className: "text-center w-32 border-r",
            sortable: true,
            sortKey: DelegateSearchTitles.PROGRESS,
            noRowClick: true,
            accessor: (item: any, index: number) => {
              const progressValue = item.progress || 0;
              return (
                <div
                  className="w-full flex items-center justify-center gap-2 flex-row-reverse cursor-pointer hover:bg-gray-50 rounded p-1"
                  onClick={(e) => {
                    e.stopPropagation();
                    openProgressControl(item);
                  }}
                  title={item.comment || `Tiến độ: ${progressValue}%`}
                >
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progressValue}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-600">
                    {progressValue}%
                  </span>
                </div>
              );
            },
          },
        ]
      : []),
  ];

  // ==================== RENDER ====================
  return (
    <div className="space-y-4 py-0 px-4">
      <BreadcrumbNavigation
        items={[{ label: "Tiện ích khác" }]}
        currentPage=" Ủy quyền xử lý - Văn bản đến"
        showHome={false}
      />
      <DelegateInFilter
        onSearch={handleSearch}
        onAdvancedSearch={handleAdvancedSearch}
        isAdvanceSearch={isAdvanceSearch}
        onToggleAdvanceSearch={handleToggleAdvanceSearch}
        onResetSearch={handleResetSearch}
        onResetAdvancedFields={handleResetAdvancedFields}
        buttonStatus={buttonStatus}
        currentTab={currentTab}
        currentDocumentId={getCurrentDocumentId()}
        currentDocument={currentDocument}
        currentDeadline={currentDeadline}
        nodeStart={nodeStart}
        listNextNode={listNextNodeDisplay}
        listNextNodeOrg={listNextNodeOrg}
        getCurrentDocumentId={getCurrentDocumentId}
        isOrgTransferStatus={isOrgTransferStatus}
        isCanFinishReceive={isCanFinishReceive}
        onOpenDeadlinePopup={doOpenDeadlinePopup}
        onOpenTransferPopup={doOpenTransferPopup}
        onOpenOrgTransferPopup={doOpenOrgTransferPopup}
        onOpenProcessDonePopup={doOpenProcessDonePopup}
        onOpenRetakePopup={doOpenRetakePopup}
        onOpenRejectPopup={doOpenRejectPopup}
        onOpenRetakeByStepPopup={() => setShowRetakeByStepModal(true)}
      />

      <DelegateTable
        key={renderKey}
        data={
          currentTab === DelegateTabNames.HANDLED
            ? currentTabData
            : addDeadlineWarningToTasks(currentTabData)
        }
        loading={isLoading}
        paging={paging}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onViewDocument={handleViewDocument}
        onSort={handleSort}
        sortBy={searchField.sortBy}
        sortDirection={
          searchField.direction === Constant.SORT_TYPE.INCREASE ? "ASC" : "DESC"
        }
        currentTab={currentTab}
        onTabChange={handleTabChange}
        tabs={waitDocumentTabs}
        selectedDocuments={selectedDocuments}
        onSelectionChange={handleSelectionChange}
        columns={columns}
        showDeadlineWarnings={true}
      />

      <DailyReportAttachmentInfo
        attachments={selectedDocument?.attachments || []}
        isOpen={showAttachmentModal}
        onOpenChange={(open) => {
          setShowAttachmentModal(open);
          if (!open) {
            setSelectedDocument(null);
          }
        }}
        constant={Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_OUT}
      />

      <ProgressControlDialog
        documentId={selectedDocument?.docId || ""}
        currentProgress={selectedDocument?.progress}
        currentTab={
          currentTab === DelegateTabNames.COMBINE_HANDLE
            ? "xu_ly_phoi_hop"
            : "xu_ly_chinh"
        }
        onSuccess={() => {
          setShowProgressControlModal(false);
          setSelectedDocument(null);
          refetchDocuments();
        }}
        isOpen={showProgressControlModal}
        onOpenChange={(open) => {
          setShowProgressControlModal(open);
          if (!open) {
            setSelectedDocument(null);
          }
        }}
      />

      <InReject
        isOpen={showRejectModal}
        onOpenChange={setShowRejectModal}
        documentId={currentDocumentId || ""}
        onSuccess={() => {
          setShowRejectModal(false);
          setCurrentDocumentId(null);
          setButtonStatus((prev) => ({ ...prev, rejectButton: false }));
          refetchDocuments();
        }}
      />

      <InTransfer
        isOpen={showTransferModal}
        onOpenChange={setShowTransferModal}
        documentId={getCurrentDocumentId() || ""}
        onSuccess={() => {
          setShowTransferModal(false);
          setSelectedNode(null);
          setCurrentDocumentId(null);
          setButtonStatus((prev) => ({ ...prev, transferButton: false }));
          setSelectedList([]);
          refetchDocuments();
        }}
        allowMultiple={selectedNode?.allowMultiple || false}
        special={special}
      />

      <InTransferDone
        isOpen={showTransferDoneModal}
        onOpenChange={setShowTransferDoneModal}
        documentId={currentDocumentId || ""}
        isFinishReceive={isFinishReceive}
        tab={
          currentTab === DelegateTabNames.COMBINE_HANDLE
            ? "XU_LY_PHOI_HOP"
            : "XU_LY_CHINH"
        }
        onSuccess={() => {
          setShowTransferDoneModal(false);
          setIsFinishReceive(false);
          setButtonStatus((prev) => ({ ...prev, doneButton: false }));
          setCurrentDocumentId(null);
          refetchDocuments();
        }}
      />

      <RetakeDialog
        isOpen={showRetakeByStepModal}
        onOpenChange={(open) => setShowRetakeByStepModal(open)}
        docId={currentDocumentId || ""}
        onRetake={handleRetakeDocOut}
      />

      <DocumentOutDeadline
        showDeadlineModal={showDeadlineModal}
        setShowDeadlineModal={setShowDeadlineModal}
        type="DELEGATE"
        docId={currentDocumentId || ""}
        currentDeadline={currentDeadline}
        onClose={() => setShowDeadlineModal(false)}
      />

      <DocumentOutRetakeModal
        isOpen={showRetakeModal}
        onOpenChange={setShowRetakeModal}
        onClose={(success) => {
          setShowRetakeModal(false);
          if (success) {
            setSelectedDocument(null);
            setCurrentDocumentId(null);
            refetchDocuments();
          }
        }}
        documentId={selectedDocument?.docId || currentDocumentId || ""}
        refetch={refetchDocuments}
      />
    </div>
  );
}
