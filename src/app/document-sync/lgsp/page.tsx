"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import DocumentSyncFilter from "@/components/document-sync/DocumentSyncFilter";
import DocumentSyncTable from "@/components/document-sync/DocumentSyncTable";
import DailyReportAttachmentInfo from "@/components/daily-report/DailyReportAttachmentInfo";
import {
  getDataEncryptDi,
  setDataEncryptDi,
  removeDataEncryptDi,
  isClericalDocumentOut,
} from "@/utils/token.utils";
import { isCheckStartUsbTokenWatcher } from "@/services/usbTokenService";
import { DocumentOutService } from "@/services/document-out.service";
import { DocumentService } from "@/services/document.service";
import { Constant } from "@/definitions/constants/constant";
import { useGetCategoriesByCode } from "@/hooks/data/category.data";
import { useGetDocumentBookByType } from "@/hooks/data/document-book.data";
import {
  useSearchLGSP,
  useToggleImportantDraftOut,
} from "@/hooks/data/draft.data";
import { handleError } from "@/utils/common.utils";
import { downloadFile, viewFile } from "@/utils/file.utils";
import { SharedService } from "@/services/shared.service";
import { toast } from "@/hooks/use-toast";
import { ToastUtils } from "@/utils/toast.utils";

enum TabNames {
  DUTHAO = "draft",
  DATRINHKY = "draftOnSign",
  DABANHANH = "draftIssued",
  CHOXULY = "waitHandleTab",
  CHOCHOYKIEN = "waitCommentTab",
  DAXULY = "handledTab",
  DABANHANH_DOC = "issued",
  CHOBANHANH = "waitIssued",
}

export default function DocumentSyncLgspPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [searchDocuments, setSearchDocuments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [paging, setPaging] = useState({
    totalRecord: 0,
    currentPage: 1,
  });
  const [sorting, setSorting] = useState({
    sortBy: "",
    direction: Constant.SORT_TYPE.INCREASE as "ASC" | "DESC",
  });
  const [showAttachmentModal, setShowAttachmentModal] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<any>(null);

  const [searchField, setSearchField] = useState({
    numberOrSign: "",
    preview: "",
    docType: "",
    bookOut: "",
    personEnter: "",
    startIssued: null,
    endIssued: null,
    startCreate: null,
    endCreate: null,
    orgExe: "",
    docFieldsId: "",
    quickSearchText: "",
    important: "",
    isAdvanceSearch: false,
    outsideReceive: "",
    outsideRecv: "",
    page: 1,
    sortBy: "",
    direction: Constant.SORT_TYPE.DECREASE,
    pageSize: Constant.PAGING.SIZE,
  });

  const { data: docTypeCategory = [] } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.DOC_TYPE
  );
  const { data: docFieldsCategory = [] } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.DOC_FIELDS
  );
  const { data: bookCategory = [] } = useGetDocumentBookByType(
    Constant.DOCUMENT_BOOK_TYPE[1].code
  );
  const { data: outSideList = [] } = useSearchLGSP(
    searchField.outsideReceive || "",
    1,
    searchField.isAdvanceSearch
  );
  const toggleImportantMutation = useToggleImportantDraftOut();

  useEffect(() => {
    const initializeComponent = async () => {
      const encryptData = getDataEncryptDi();
      if (encryptData != null && encryptData === "true") {
        isCheckStartUsbTokenWatcher();
      }

      const params = searchParams
        ? Object.fromEntries(searchParams.entries())
        : {};
      if (Object.keys(params).length > 0) {
        const listDateName = [
          "endCreate",
          "startCreate",
          "startIssued",
          "endIssued",
        ];
        const updatedSearchField =
          DocumentService.transferValueFromParamstoSearchField(
            { ...searchField },
            params,
            listDateName
          );
        setSearchField(updatedSearchField as typeof searchField);
        setPaging((prev) => ({ ...prev, currentPage: +params.page || 1 }));
        await doSearch(+params.page || 1);
      } else {
        const currentPageUrl = pathname;
        const currentPage = localStorage.getItem(`page${currentPageUrl}`);
        const currentSearchField = localStorage.getItem(
          `searchField${currentPageUrl}`
        );

        if (currentSearchField) {
          const currentSearchFieldLoaded = JSON.parse(currentSearchField);
          if (
            currentSearchFieldLoaded &&
            !currentSearchFieldLoaded.isAdvanceSearch
          ) {
            setSearchField(currentSearchFieldLoaded);
            await doSearch(+(currentPage || 1));
          } else if (
            currentSearchFieldLoaded &&
            currentSearchFieldLoaded.isAdvanceSearch
          ) {
            setSearchField(currentSearchFieldLoaded);
            await doSearch(+currentSearchFieldLoaded.page || 1);
          } else {
            await doSearch(1);
          }
        } else {
          await doSearch(1);
        }

        localStorage.setItem("previousUrl", currentPageUrl || "");
      }
    };

    initializeComponent();
  }, [searchParams]);

  const doOpenDetailDocument = async (document: any) => {
    const isClerical = isClericalDocumentOut();
    switch (document.docStatusEnum) {
      case "DU_THAO":
        switch (document.statusHandleEnum) {
          case "CHO_Y_KIEN":
            await SharedService.setCurrentMenuDocIn(
              Constant.DOCUMENT_IN_MENU.HANDLE
            );
            await SharedService.setCurrentTabDocIn(TabNames.CHOCHOYKIEN);
            break;

          case "DA_Y_KIEN":
          case "DA_XU_LY":
            await SharedService.setCurrentMenuDocIn(
              Constant.DOCUMENT_IN_MENU.HANDLE
            );
            await SharedService.setCurrentTabDocIn(TabNames.DAXULY);
            break;

          case "DA_TRINH_KY":
            await SharedService.setCurrentMenuDocIn(
              Constant.DOCUMENT_IN_MENU.DRAFT
            );
            await SharedService.setCurrentTabDocIn(TabNames.DATRINHKY);
            break;

          case "CHO_XU_LY":
          case "BI_TRA_LAI":
            await SharedService.setCurrentMenuDocIn(
              Constant.DOCUMENT_IN_MENU.HANDLE
            );
            await SharedService.setCurrentTabDocIn(TabNames.CHOXULY);
            break;

          default:
            await SharedService.setCurrentMenuDocIn(
              Constant.DOCUMENT_IN_MENU.DRAFT
            );
            await SharedService.setCurrentTabDocIn(TabNames.DUTHAO);
        }
        break;

      case "DANG_XU_LY":
        switch (document.statusHandleEnum) {
          case "DA_TRINH_KY":
            await SharedService.setCurrentMenuDocIn(
              Constant.DOCUMENT_IN_MENU.DRAFT
            );
            await SharedService.setCurrentTabDocIn(TabNames.DATRINHKY);
            break;

          case "CHO_XU_LY":
          case "CHO_Y_KIEN":
            await SharedService.setCurrentMenuDocIn(
              Constant.DOCUMENT_IN_MENU.HANDLE
            );
            await SharedService.setCurrentTabDocIn(TabNames.CHOXULY);
            break;

          case "DA_Y_KIEN":
          case "DA_XU_LY":
            await SharedService.setCurrentMenuDocIn(
              Constant.DOCUMENT_IN_MENU.HANDLE
            );
            await SharedService.setCurrentTabDocIn(TabNames.DAXULY);
            break;

          default:
            await SharedService.setCurrentMenuDocIn(
              Constant.DOCUMENT_IN_MENU.HANDLE
            );
            await SharedService.setCurrentTabDocIn(TabNames.CHOXULY);
        }
        break;

      case "CHO_BAN_HANH":
        await SharedService.setCurrentMenuDocIn(
          isClerical
            ? Constant.DOCUMENT_IN_MENU.ISSUED
            : Constant.DOCUMENT_IN_MENU.DRAFT
        );
        await SharedService.setCurrentTabDocIn(
          isClerical ? TabNames.CHOBANHANH : TabNames.DATRINHKY
        );
        break;

      case "DA_BAN_HANH":
        await SharedService.setCurrentMenuDocIn(
          isClerical
            ? Constant.DOCUMENT_IN_MENU.ISSUED
            : Constant.DOCUMENT_IN_MENU.DRAFT
        );
        await SharedService.setCurrentTabDocIn(
          isClerical ? TabNames.DABANHANH_DOC : TabNames.DATRINHKY
        );
        break;

      case "BI_TRA_LAI":
      case "THU_HOI_XL":
        switch (document.statusHandleEnum) {
          case "CHO_Y_KIEN":
            await SharedService.setCurrentMenuDocIn(
              Constant.DOCUMENT_IN_MENU.HANDLE
            );
            await SharedService.setCurrentTabDocIn(TabNames.CHOCHOYKIEN);
            break;

          case "DA_Y_KIEN":
            await SharedService.setCurrentMenuDocIn(
              Constant.DOCUMENT_IN_MENU.HANDLE
            );
            await SharedService.setCurrentTabDocIn(TabNames.DAXULY);
            break;

          default:
            await SharedService.setCurrentMenuDocIn(
              Constant.DOCUMENT_IN_MENU.DRAFT
            );
            await SharedService.setCurrentTabDocIn(TabNames.DUTHAO);
        }
        break;

      default:
        break;
    }

    const url = `/document-in/search/draft-detail/${document.docOutId}`;
    router.push(url);
  };

  const doSearch = async (page: number, sortField = "") => {
    if (!page) {
      page = searchField.page;
    }

    if (sortField) {
      setSearchField((prev) => ({ ...prev, sortBy: sortField }));
      toggleSortType();
    }

    if (searchField.isAdvanceSearch) {
      await doAdvanceSearch(searchField, page);
    } else {
      await doBasicSearch(searchField, page);
    }
  };

  const doAdvanceSearch = async (searchData: any, currentPage: number) => {
    setPaging((prev) => ({ ...prev, currentPage }));

    const body = {
      numberOrSign: searchData.numberOrSign || null,
      preview: searchData.preview,
      docTypeId: searchData.docType,
      bookId: searchData.bookOut,
      startIssued: searchData.startIssued,
      endIssued: searchData.endIssued,
      outsideRecv: searchData.outsideReceive,
      page: currentPage,
      size: searchData.pageSize,
      sortBy: [],
    };

    setLoading(true);
    try {
      const data = await DocumentOutService.searchDocumentSyncLgsp(body);
      setPaging((prev) => ({ ...prev, totalRecord: data.totalRecord }));
      setSearchDocuments(data.objList || []);
      checkListReceive(data.objList || []);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const doBasicSearch = async (searchData: any, pageNumber: number) => {
    setPaging((prev) => ({ ...prev, currentPage: pageNumber }));

    const body = {
      text: searchData.quickSearchText || null,
      page: pageNumber,
      size: searchData.pageSize,
      sortBy: [],
    };

    setLoading(true);
    try {
      const data = await DocumentOutService.searchDocumentSyncLgsp(body);
      setPaging((prev) => ({ ...prev, totalRecord: data.totalRecord }));
      setSearchDocuments(data.objList || []);
      checkListReceive(data.objList || []);
    } catch (error) {
      handleError(error);
    } finally {
      setLoading(false);
    }
  };

  const toggleSortType = () => {
    setSorting((prev) => ({
      ...prev,
      direction:
        prev.direction === Constant.SORT_TYPE.DECREASE
          ? (Constant.SORT_TYPE.INCREASE as "ASC" | "DESC")
          : (Constant.SORT_TYPE.DECREASE as "ASC" | "DESC"),
    }));
  };

  const checkListReceive = (documents: any[]) => {
    if (!documents) return;

    documents.forEach((document) => {
      const numberOfSubOrg = (document["listReceive"] || []).filter(
        (item: any) =>
          item.type === "ORG" && item.parentOrgId === 2 && item.orgId !== 451
      ).length;
      const filteredListReceive: any[] = [];
      let isAddedShortName = false;

      (document["listReceive"] || []).forEach((item: any) => {
        if (
          item["parentOrgId"] === 2 &&
          item["numberOfSubOrgOfParentOrg"] - 1 === numberOfSubOrg &&
          item["orgId"] !== 451
        ) {
          if (!isAddedShortName) {
            isAddedShortName = true;
            filteredListReceive.push({
              type: "ORG",
              orgName: "Các cơ quan, đơn vị thuộc Ban",
            });
          }
        } else {
          filteredListReceive.push(item);
        }
      });
      document["listReceive"] = filteredListReceive;
    });
  };

  const handleSearch = async (searchData: any) => {
    const updatedSearchField = { ...searchField, ...searchData };
    setSearchField(updatedSearchField);
    await doBasicSearch(updatedSearchField, searchData.page || 1);
  };

  const handleAdvancedSearch = async (searchData: any) => {
    const updatedSearchField = { ...searchField, ...searchData };
    setSearchField(updatedSearchField);
    await doAdvanceSearch(updatedSearchField, searchData.page || 1);
  };

  const handlePageChange = (page: number) => {
    doSearch(page);
  };

  const handlePageSizeChange = async (size: number) => {
    const updated = { ...searchField, pageSize: size, page: 1 };
    setSearchField(updated);
    if (updated.isAdvanceSearch) {
      await doAdvanceSearch(updated, 1);
    } else {
      await doBasicSearch(updated, 1);
    }
  };

  const handleViewDocument = async (document: any) => {
    await doOpenDetailDocument(document);
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

  const handleViewFile = async (file: any) => {
    try {
      await viewFile(file, Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_IN);
    } catch (error) {
      ToastUtils.error("Lỗi không tìm thấy tệp phù hợp");
    }
  };

  const handleAttachmentInfo = (document: any) => {
    setSelectedDocument(document);
    setShowAttachmentModal(true);
  };

  const handleCloseAttachmentModal = (open: boolean) => {
    setShowAttachmentModal(open);
    if (!open) {
      setSelectedDocument(null);
    }
  };

  const handleSort = (field: string) => {
    setSorting((prev) => ({ ...prev, sortBy: field }));
    toggleSortType();
    doSearch(searchField.page, field);
  };

  const handleChangeImportantStatus = async (document: any) => {
    try {
      await toggleImportantMutation.mutateAsync({
        docId: document.docOutId,
        important: !document.important,
      });
      setSearchDocuments((prev) =>
        prev.map((doc) =>
          doc.docOutId === document.docOutId
            ? { ...doc, important: !doc.important }
            : doc
        )
      );
    } catch (error) {
      handleError(error);
    }
  };

  const handleLoadOutSideReceiveList = async () => {
    if (searchField.isAdvanceSearch) {
      return outSideList || [];
    }
    return [];
  };

  const handleToggleAdvanceSearch = (isAdvance: boolean) => {
    setSearchField((prev) => ({
      ...prev,
      isAdvanceSearch: isAdvance,
    }));
  };

  const handleOutsideReceiveFocus = () => {
    if (searchField.isAdvanceSearch && !searchField.outsideReceive) {
      setSearchField((prev) => ({ ...prev, outsideReceive: " " }));
    }
  };

  return (
    <div className="space-y-4 px-4">
      <BreadcrumbNavigation
        items={[
          {
            href: "/",
            label: "Đồng bộ văn bản",
          },
        ]}
        currentPage="Danh sách LGSP"
        showHome={false}
      />
      <DocumentSyncFilter
        title="Danh sách LGSP"
        onSearch={handleSearch}
        onAdvancedSearch={handleAdvancedSearch}
        docTypeCategory={docTypeCategory}
        bookCategory={bookCategory}
        docFieldsCategory={docFieldsCategory}
        onLoadOutSideReceiveList={handleLoadOutSideReceiveList}
        outSideList={outSideList}
        isAdvanceSearch={searchField.isAdvanceSearch}
        onToggleAdvanceSearch={handleToggleAdvanceSearch}
        onOutsideReceiveFocus={handleOutsideReceiveFocus}
        onOutsideReceiveChange={(text) =>
          setSearchField((prev) => ({ ...prev, outsideReceive: text }))
        }
      />

      <DocumentSyncTable
        searchDocuments={searchDocuments}
        loading={loading}
        paging={paging}
        itemsPerPage={searchField.pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onViewDocument={handleViewDocument}
        onDownloadFile={handleDownloadFile}
        onViewFile={handleViewFile}
        onAttachmentInfo={handleAttachmentInfo}
        onSort={handleSort}
        sortBy={sorting.sortBy}
        sortDirection={sorting.direction}
        onChangeImportantStatus={handleChangeImportantStatus}
      />

      {/* Attachment Modal */}
      {selectedDocument && (
        <DailyReportAttachmentInfo
          attachments={selectedDocument.attachDrafts || []}
          isOpen={showAttachmentModal}
          onOpenChange={handleCloseAttachmentModal}
          constant={Constant.ATTACHMENT_DOWNLOAD_TYPE.DOCUMENT_IN}
        />
      )}
    </div>
  );
}
