"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import RetakeOutFilter from "@/components/retake/RetakeOutFilter";
import RetakeTable from "@/components/retake/RetakeTable";
import RetakeDialog from "@/components/retake/RetakeDialog";
import UnretakeDialog from "@/components/retake/UnretakeDialog";
import {
  useRetakeOutSearchQuery,
  useRetakeOutAdvancedSearchQuery,
  useGetDocumentOut,
} from "@/hooks/data/retake-search.data";
import { useGetCategoriesByCode } from "@/hooks/data/category.data";
import { Constant } from "@/definitions/constants/constant";
import { DocumentService } from "@/services/document.service";
import {
  useGetListOrgEnter,
  useDeleteDocument,
} from "@/hooks/data/document-out.data";
import { RetakeService } from "@/services/retake.service";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import { handleError } from "@/utils/common.utils";
import { toast } from "@/hooks/use-toast";
import { getDefaultRetakeOutSearchField } from "@/utils/formValue.utils";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { LayoutPanelTop, Trash2, Undo2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ToastUtils } from "@/utils/toast.utils";

enum TabNames {
  COTHETHUHOI = "canRetake",
  DATHUHOI = "retook",
}

enum SearchTitle {
  UPDATEDATE = "UPDATEDATE",
  DATE_ISSUED = "DATE_ISSUED",
  NUMBER_ARRIVAL = "NUMBER_ARRIVAL",
  RETAKE_DATE = "RETAKE_DATE",
  NUMBER_SIGN = "NUMBER_SIGN",
  PREVIEW = "PREVIEW",
  PLACE_SEND = "PLACE_SEND",
}

export default function RetakeOut() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [currentTab, setCurrentTab] = useState(TabNames.COTHETHUHOI);
  const [isAdvanceSearch, setIsAdvanceSearch] = useState(false);
  const [selectedDocuments, setSelectedDocuments] = useState<React.Key[]>([]);
  const [currentDocumentId, setCurrentDocumentId] = useState<string | null>(
    null
  );
  const [currentDocument, setCurrentDocument] = useState<any>(null);
  const [searchField, setSearchField] = useState(
    getDefaultRetakeOutSearchField()
  );

  const [searchList, setSearchList] = useState<any[]>([]);

  const [querySearchParams, setQuerySearchParams] = useState<any>(null);
  const [isSearchEnabled, setIsSearchEnabled] = useState(false);
  const [filterKey, setFilterKey] = useState(0);

  const [isRetakeDialogOpen, setIsRetakeDialogOpen] = useState(false);
  const [isUnretakeDialogOpen, setIsUnretakeDialogOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);

  const { data: doLoadPlaceSendCategory } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.ORG_SEND
  );
  const deleteDocumentMutation = useDeleteDocument();

  // Use hook for initial document loading
  const { data: initialDocumentData, refetch: refetchInitial } =
    useGetDocumentOut(searchField.page, !isSearchEnabled);

  const {
    data: searchData,
    refetch: refetchSearch,
    isLoading: isSearchLoading,
  } = useRetakeOutSearchQuery(
    querySearchParams || {},
    currentTab,
    isSearchEnabled && !searchField.isAdvanceSearch
  );

  const {
    data: advancedSearchData,
    refetch: refetchAdvancedSearch,
    isLoading: isAdvancedSearchLoading,
  } = useRetakeOutAdvancedSearchQuery(
    querySearchParams || {},
    currentTab,
    isSearchEnabled && searchField.isAdvanceSearch
  );

  const pageSizeRef = useRef<number>(
    getDefaultRetakeOutSearchField().pageSize || Constant.ITEMS_PER_PAGE
  );
  const totalRecord = useMemo(() => {
    if (isSearchEnabled) {
      if (searchField.isAdvanceSearch) {
        return advancedSearchData?.data?.totalElements || 0;
      }
      return searchData?.data?.totalElements || 0;
    }
    return initialDocumentData?.data?.totalElements || 0;
  }, [
    isSearchEnabled,
    searchField.isAdvanceSearch,
    advancedSearchData?.data?.totalElements,
    searchData?.data?.totalElements,
    initialDocumentData?.data?.totalElements,
  ]);

  useEffect(() => {
    if (initialDocumentData?.data) {
      setSearchList(initialDocumentData.data.content);
    }
  }, [initialDocumentData]);

  useEffect(() => {
    if (searchData?.data) {
      setSearchList(searchData.data.content);
    }
  }, [searchData, searchField.pageSize]);

  useEffect(() => {
    if (advancedSearchData?.data) {
      setSearchList(advancedSearchData.data.content);
    }
  }, [advancedSearchData, searchField.pageSize]);

  useEffect(() => {
    // Đồng bộ ref pageSize theo state mới nhất
    if (searchField.pageSize) {
      pageSizeRef.current = searchField.pageSize;
    }
  }, [searchField.pageSize]);

  // Helper cập nhật URL qua router.push
  const pushWithParams = (params: Record<string, any>) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        query.set(key, String(value));
      }
    });
    const url = `${window.location.pathname}?${query.toString()}`;
    router.push(url);
  };

  // Đồng bộ SearchFilter mỗi khi URL params thay đổi
  useEffect(() => {
    const params = searchParams
      ? Object.fromEntries(searchParams.entries())
      : {};
    if (Object.keys(params).length === 0) return;

    const listDateName = ["startIssued", "endIssued"];
    const updatedSearchFieldObj =
      DocumentService.transferValueFromParamstoSearchField(
        { ...searchField },
        params,
        listDateName
      );
    const parsedPage = params.page
      ? parseInt(String(params.page), 10)
      : searchField.page || 1;
    const parsedPageSize = params.size
      ? parseInt(String(params.size), 10)
      : searchField.pageSize || Constant.ITEMS_PER_PAGE;
    pageSizeRef.current = parsedPageSize;
    setSearchField({
      ...(updatedSearchFieldObj as typeof searchField),
      page: parsedPage,
      pageSize: parsedPageSize,
    });
    doSearch(parsedPage);
  }, [searchParams]);

  const doSearch = async (page: number, sortField = "") => {
    if (!page) {
      page = searchField.page || 1;
    }

    if (sortField) {
      setSearchField((prev) => ({
        ...prev,
        sortBy: sortField,
      }));
    }

    if (searchField.isAdvanceSearch) {
      await doAdvanceSearch(page);
    } else {
      await doBasicSearch(page);
    }
  };

  const doAdvanceSearch = async (
    pageNumber: number,
    tabName?: string,
    pageSize?: number
  ) => {
    setSearchField((prev) => ({
      ...prev,
      isAdvanceSearch: true,
      page: pageNumber,
      pageSize: pageSize ?? prev.pageSize,
    }));

    // Dùng ref để tránh lệch 1 nhịp kích thước trang
    const currentPageSize =
      pageSize ?? pageSizeRef.current ?? Constant.ITEMS_PER_PAGE;

    // Cập nhật URL bằng router.push
    pushWithParams({
      numberOrSign: searchField.numberOrSign || "",
      preview: searchField.preview || "",
      page: pageNumber.toString(),
      orgIssuedName: searchField.orgIssuedName || "",
      numberArrival: searchField.numberArrival || "",
      sortBy: searchField.sortBy || "",
      direction: searchField.direction || "DESC",
      size: currentPageSize,
      ...(searchField.startIssued && {
        startIssued: dayjs(searchField.startIssued).format("YYYY-MM-DD"),
      }),
      ...(searchField.endIssued && {
        endIssued: dayjs(searchField.endIssued).format("YYYY-MM-DD"),
      }),
    });

    const params: Record<string, any> = {
      numberOrSign: searchField.numberOrSign || "",
      preview: searchField.preview || "",
      page: pageNumber.toString(),
      orgIssuedName: searchField.orgIssuedName || "",
      numberArrival: searchField.numberArrival || "",
      sortBy: searchField.sortBy || "",
      direction: searchField.direction || "DESC",
      size: currentPageSize,
    };

    if (searchField.startIssued) {
      params.startIssued = dayjs(searchField.startIssued).format("YYYY-MM-DD");
    }
    if (searchField.endIssued) {
      params.endIssued = dayjs(searchField.endIssued).format("YYYY-MM-DD");
    }

    setQuerySearchParams(params);
    setIsSearchEnabled(true);
  };

  const doBasicSearch = async (
    pageNumber: number,
    tabName?: string,
    pageSize?: number
  ) => {
    setSearchField((prev) => ({
      ...prev,
      isAdvanceSearch: false,
      page: pageNumber,
      pageSize: pageSize ?? prev.pageSize,
    }));

    // Dùng ref để tránh lệch 1 nhịp kích thước trang
    const currentPageSize =
      pageSize ?? pageSizeRef.current ?? Constant.ITEMS_PER_PAGE;

    // Cập nhật URL bằng router.push
    pushWithParams({
      q: searchField.quickSearchText || "",
      sortBy: searchField.sortBy || "",
      direction: searchField.direction || "DESC",
      size: currentPageSize,
      page: pageNumber.toString(),
    });

    const params: Record<string, any> = {
      q: searchField.quickSearchText || "",
      sortBy: searchField.sortBy || "",
      direction: searchField.direction || "DESC",
      size: currentPageSize,
      page: pageNumber.toString(),
    };

    setQuerySearchParams(params);
    setIsSearchEnabled(true);
  };

  const handleResetSearch = () => {
    setSearchField(getDefaultRetakeOutSearchField());
    setSearchList([]);
    setSelectedDocuments([]);
    setCurrentDocumentId(null);
    setCurrentDocument(null);

    setQuerySearchParams(null);
    setIsSearchEnabled(false);

    setFilterKey((prev) => prev + 1);
  };

  const handleResetAdvancedFields = () => {
    setSearchField((prev) => ({
      ...prev,
      preview: "",
      numberOrSign: "",
      startIssued: null as Date | null,
      endIssued: null as Date | null,
      orgIssuedName: "",
      numberArrival: "",
    }));
  };

  const handleSearch = (searchData: any) => {
    setSearchField((prev) => ({ ...prev, ...searchData }));
    const params = {
      q: searchData.quickSearchText || "",
      sortBy: searchField.sortBy || "",
      direction: searchField.direction || "DESC",
      size: searchField.pageSize || 10,
      page: 1,
      retaked: currentTab === TabNames.DATHUHOI,
    };
    setQuerySearchParams(params);
    setIsSearchEnabled(true);
  };

  const handleAdvancedSearch = (searchData: any) => {
    setSearchField((prev) => ({ ...prev, ...searchData }));
    const params: any = {
      numberOrSign: searchData.numberOrSign || searchField.numberOrSign || "",
      preview: searchData.preview || searchField.preview || "",
      page: 1,
      numberArrival:
        searchData.numberArrival || searchField.numberArrival || "",
      orgIssuedName:
        searchData.orgIssuedName || searchField.orgIssuedName || "",
      sortBy: searchField.sortBy || "",
      direction: searchField.direction || "DESC",
      size: searchField.pageSize || 10,
      retaked: currentTab === TabNames.DATHUHOI,
    };

    if (searchData.startIssued || searchField.startIssued) {
      params.startIssued = dayjs(
        searchData.startIssued || searchField.startIssued
      ).format("YYYY-MM-DD");
    }
    if (searchData.endIssued || searchField.endIssued) {
      params.endIssued = dayjs(
        searchData.endIssued || searchField.endIssued
      ).format("YYYY-MM-DD");
    }

    setQuerySearchParams(params);
    setIsSearchEnabled(true);
  };

  const handlePageChange = (page: number) => {
    if (searchField.isAdvanceSearch) {
      doAdvanceSearch(page);
    } else {
      doBasicSearch(page);
    }
  };

  const handlePageSizeChange = (pageSize: number) => {
    // Cập nhật ref trước để tránh stale khi push URL
    pageSizeRef.current = pageSize;
    setSearchField((prev) => ({ ...prev, pageSize, page: 1 }));
    if (searchField.isAdvanceSearch) {
      doAdvanceSearch(1, undefined, pageSize);
    } else {
      doBasicSearch(1, undefined, pageSize);
    }
  };

  const handleViewDocument = (document: any) => {
    router.push(`/retake/out/detail/${document.id}`);
  };

  const handleSort = (field: string) => {
    if (field === "STT" || field === "Thu hồi" || field === "Thao tác") {
      return;
    }

    let sortField = field;

    switch (field) {
      case "numberArrival":
      case "Số đến":
        sortField = SearchTitle.NUMBER_ARRIVAL;
        break;
      case "dateIssued":
      case "Ngày ban hành":
        sortField = SearchTitle.DATE_ISSUED;
        break;
      case "numberOrSign":
      case "Số/Ký hiệu":
        sortField = SearchTitle.NUMBER_SIGN;
        break;
      case "preview":
      case "Trích yếu":
        sortField = SearchTitle.PREVIEW;
        break;
      case "placeSend":
      case "Đơn vị ban hành":
        sortField = SearchTitle.PLACE_SEND;
        break;
      default:
        if (Object.values(SearchTitle).includes(field as SearchTitle)) {
          sortField = field;
        }
        break;
    }

    setSearchField((prev) => {
      const newDirection =
        prev.direction === Constant.SORT_TYPE.DECREASE
          ? Constant.SORT_TYPE.INCREASE
          : Constant.SORT_TYPE.DECREASE;
      return { ...prev, sortBy: sortField, direction: newDirection };
    });
    if (searchField.isAdvanceSearch) {
      doAdvanceSearch(searchField.page || 1);
    } else {
      doBasicSearch(searchField.page || 1);
    }
  };

  const handleTabChange = (tabName: string) => {
    setCurrentTab(tabName as TabNames);
    setSearchField((prev) => ({ ...prev, currentTab: tabName }));

    setSearchList((prevList: any[]) => {
      return prevList.map((item: any) => ({ ...item, isChecked: false }));
    });
    setCurrentDocumentId(null);
    setCurrentDocument(null);

    setSearchField({
      ...getDefaultRetakeOutSearchField(),
      currentTab: tabName,
    });

    doBasicSearch(1, tabName);
  };

  const handleSelectionChange = (selectedKeys: React.Key[]) => {
    if (selectedKeys.length > 0) {
      const targetItem = searchList.find((doc) => doc.id === selectedKeys[0]);
      const isCurrentlyChecked = targetItem?.isChecked || false;
      const willBeChecked = !isCurrentlyChecked;

      setSearchList((prevList: any[]) => {
        return prevList.map((item: any) => {
          if (item.id === selectedKeys[0]) {
            return { ...item, isChecked: willBeChecked };
          } else {
            return { ...item, isChecked: false };
          }
        });
      });

      setSelectedDocuments(selectedKeys);

      if (willBeChecked) {
        setCurrentDocumentId(selectedKeys[0] as string);
        setCurrentDocument(targetItem);
      } else {
        setCurrentDocumentId(null);
        setCurrentDocument(null);
      }
    } else {
      setCurrentDocumentId(null);
      setCurrentDocument(null);
    }
  };

  const handleRetakeDocument = (document: any) => {
    setCurrentDocumentId(document.id);
    setCurrentDocument(document);
    setIsRetakeDialogOpen(true);
  };

  const handleUnretakeDocument = (document: any) => {
    setCurrentDocumentId(document.id);
    setCurrentDocument(document);
    setIsUnretakeDialogOpen(true);
  };

  const handleDeleteDocument = (documentId: string) => {
    setDocumentToDelete(documentId);
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!documentToDelete) return;

    try {
      await deleteDocumentMutation.mutateAsync(parseInt(documentToDelete));
      ToastUtils.success("Xóa văn bản thành công");

      setCurrentDocument(null);
      setCurrentDocumentId(null);
      setSelectedDocuments([]);
      setIsConfirmDeleteOpen(false);
      setDocumentToDelete(null);

      // Refetch data based on current state
      if (isSearchEnabled) {
        if (searchField.isAdvanceSearch) {
          await refetchAdvancedSearch();
        } else {
          await refetchSearch();
        }
      } else {
        await refetchInitial();
      }
    } catch (error) {
      handleError(error);
    }
  };

  const tabs = [
    { name: TabNames.COTHETHUHOI, title: "Danh sách văn bản", disabled: false },
    { name: TabNames.DATHUHOI, title: "Đã thu hồi", disabled: false },
  ];

  const columns = [
    {
      header: "STT",
      accessorKey: "index",
      sortable: false,
      className: "text-center w-16",
      accessor: (item: any, index: number) => (
        <div className="flex items-center justify-center gap-2">
          <span>
            {(searchField.page || 1) * searchField.pageSize -
              searchField.pageSize +
              index +
              1}
          </span>
          <Input
            type="checkbox"
            checked={item.isChecked || false}
            onChange={(e) => {
              e.stopPropagation();
              handleSelectionChange([item.id]);
            }}
            className="form-check-input w-3 h-3"
          />
        </div>
      ),
    },
    {
      header: "Số đến",
      accessorKey: "numberArrival",
      className: "text-center w-32",
      accessor: (item: any) => (
        <span
          className="text-center cursor-pointer text-black group-hover:text-blue-600 hover:underline transition-colors"
          onClick={() => handleViewDocument(item)}
        >
          {item.numberArrivalStr || ""}
        </span>
      ),
    },
    {
      header: "Ngày ban hành",
      accessorKey: "dateIssued",
      className: "text-center w-32",
      accessor: (item: any) => (
        <span
          className="text-center cursor-pointer text-black group-hover:text-blue-600 hover:underline transition-colors"
          onClick={() => handleViewDocument(item)}
        >
          {item.dateIssued ? dayjs(item.dateIssued).format("DD/MM/YYYY") : ""}
        </span>
      ),
    },
    {
      header: "Số/Ký hiệu",
      accessorKey: "numberOrSign",
      className: "text-center w-32",
      accessor: (item: any) => (
        <span
          className="text-center cursor-pointer text-black group-hover:text-blue-600 hover:underline transition-colors"
          onClick={() => handleViewDocument(item)}
        >
          {item.numberOrSign || "-"}
        </span>
      ),
    },
    {
      header: "Trích yếu",
      accessorKey: "preview",
      className: "text-start w-32 [&>th>div]:justify-start",
      accessor: (item: any) => (
        <div
          className="cursor-pointer text-black group-hover:text-blue-600 hover:underline transition-colors"
          onClick={() => handleViewDocument(item)}
        >
          {item.preview || ""}
        </div>
      ),
    },
    {
      header: "Đơn vị ban hành",
      accessorKey: "placeSend",
      className: "text-center w-32",
      accessor: (item: any) => (
        <span
          className="text-center cursor-pointer text-black group-hover:text-blue-600 hover:underline transition-colors"
          onClick={() => handleViewDocument(item)}
        >
          {item.placeSend || ""}
        </span>
      ),
    },
    {
      header: currentTab === TabNames.COTHETHUHOI ? "Thu hồi" : "Thao tác",
      accessorKey: "action",
      sortable: false,
      className: "text-center w-32",
      accessor: (item: any) => {
        if (currentTab === TabNames.COTHETHUHOI) {
          return (
            <div className="text-center">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRetakeDocument(item);
                }}
                className="bg-transparent shadow-none border-none hover:bg-transparent"
              >
                <Undo2 className="w-4 h-4 mr-1" />
              </Button>
            </div>
          );
        } else {
          return (
            <div className="text-center d-flex justify-content-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleUnretakeDocument(item);
                }}
                className="bg-transparent shadow-none border-none hover:bg-transparent p-0"
              >
                <LayoutPanelTop className="w-4 h-4" />
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteDocument(item.id);
                }}
                className="bg-transparent shadow-none border-none hover:bg-transparent"
              >
                <Trash2 className="w-4 h-4 mr-1 text-red-500" />
              </Button>
            </div>
          );
        }
      },
    },
  ];

  return (
    <div className="space-y-4 p-4">
      <BreadcrumbNavigation
        items={[
          {
            href: "/",
            label: "Thu hồi văn bản",
          },
        ]}
        currentPage="Thu hồi văn bản đến"
        showHome={false}
      />
      <RetakeOutFilter
        key={filterKey}
        onSearch={handleSearch}
        onAdvancedSearch={handleAdvancedSearch}
        isAdvanceSearch={isAdvanceSearch}
        onToggleAdvanceSearch={setIsAdvanceSearch}
        docTypeCategory={doLoadPlaceSendCategory}
        currentDocumentId={currentDocumentId}
        currentDocument={currentDocument}
        currentTab={currentTab}
        onRetakeDocument={handleRetakeDocument}
        onUnretakeDocument={handleUnretakeDocument}
        onResetSearch={handleResetSearch}
        onResetAdvancedFields={handleResetAdvancedFields}
        title="Thu hồi văn bản đến"
      />

      <RetakeTable
        documents={searchList}
        loading={false}
        paging={{
          totalRecord: totalRecord,
          currentPage: searchField.page || 1,
          itemsPerPage: searchField.pageSize || Constant.ITEMS_PER_PAGE,
        }}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onViewDocument={handleViewDocument}
        onSort={handleSort}
        sortBy={searchField.sortBy}
        sortDirection={searchField.direction as "ASC" | "DESC"}
        currentTab={currentTab}
        onTabChange={handleTabChange}
        tabs={tabs}
        selectedDocuments={selectedDocuments}
        onSelectionChange={handleSelectionChange}
        columns={columns}
      />

      <RetakeDialog
        isOpen={isRetakeDialogOpen}
        onOpenChange={setIsRetakeDialogOpen}
        onClose={(success) => {
          setIsRetakeDialogOpen(false);
        }}
        documentId={currentDocumentId || ""}
        type="out"
        isFromRetakeModule={true}
        refetch={refetchSearch}
      />

      <UnretakeDialog
        isOpen={isUnretakeDialogOpen}
        onOpenChange={setIsUnretakeDialogOpen}
        onClose={(success) => {
          setIsUnretakeDialogOpen(false);
        }}
        documentId={currentDocumentId || ""}
        type="out"
        refetch={refetchSearch}
      />

      <ConfirmDeleteDialog
        isOpen={isConfirmDeleteOpen}
        onOpenChange={setIsConfirmDeleteOpen}
        onConfirm={handleConfirmDelete}
        title="Hãy xác nhận"
        description="Bạn có chắc chắn muốn xóa văn bản?"
        confirmText="Đồng ý"
        cancelText="Đóng"
        isLoading={deleteDocumentMutation.isPending}
      />
    </div>
  );
}
