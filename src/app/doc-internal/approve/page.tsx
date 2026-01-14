"use client";

import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Constant } from "@/definitions/constants/constant";
import {
  useApproveDocInternal,
  useDeleteDocInternal,
  useGetListDocInternal,
} from "@/hooks/data/doc-internal.data";
import { cn } from "@/lib/utils";
import { SharedService } from "@/services/shared.service";
import { ToastUtils } from "@/utils/toast.utils";
import { getUserInfo } from "@/utils/token.utils";
import {
  CheckCircle,
  ChevronDown,
  ChevronUp,
  Edit,
  RotateCcw,
  Search,
  Trash2,
  XCircle,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

enum TabNames {
  CHODUYET = "wait-approve",
  DADUYET = "approved",
}

enum SearchTitles {
  PREVIEW = "PREVIEW",
  NUMBER_OR_SIGN = "NUMBERSIGN",
  DATE_APPROVE = "DATE_APPROVE",
  DATE_CREATE = "CREATEDATE",
  USER_ENTER = "USER_ENTER",
}

const defaultSearchField = {
  currentTab: Constant.DOC_INTERNAL_TAB_INDEX.WAIT,
  numberOrSign: "",
  preview: "",
  isAdvanceSearch: false,
  quickSearchText: "",
  page: 1,
  sortBy: "",
  direction: Constant.SORT_TYPE.DECREASE,
  pageSize: Constant.ITEMS_PER_PAGE,
};

export default function DocInternalApprovePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchField, setSearchField] = useState(defaultSearchField);
  const [tempSearchParams, setTempSearchParams] = useState({
    numberOrSign: "",
    preview: "",
  });
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [userInfoId, setUserInfoId] = useState<string | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isApproveConfirmOpen, setIsApproveConfirmOpen] = useState(false);
  const [isRejectConfirmOpen, setIsRejectConfirmOpen] = useState(false);
  const [documentIdToDelete, setDocumentIdToDelete] = useState<number | null>(
    null
  );
  const [documentToApprove, setDocumentToApprove] = useState<any | null>(null);
  const [documentIdToReject, setDocumentIdToReject] = useState<number | null>(
    null
  );
  const hasInitialized = useRef(false);

  const { mutate: doDeleteDocument } = useDeleteDocInternal();
  const { mutate: doApproveDoc } = useApproveDocInternal();

  // Query data for WAIT tab (Chờ cho ý kiến)
  const { data: waitData, isLoading: isWaitLoading } = useGetListDocInternal({
    tab: String(Constant.DOC_INTERNAL_TAB_INDEX.WAIT),
    text: searchField.quickSearchText,
    numberOrSign: searchField.numberOrSign,
    preview: searchField.preview,
    page:
      searchField.currentTab === Constant.DOC_INTERNAL_TAB_INDEX.WAIT
        ? searchField.page
        : 1,
    sortBy: searchField.sortBy,
    direction: searchField.direction,
    size: searchField.pageSize,
  });

  // Query data for DOING tab (Đang cho ý kiến)
  const { data: doingData, isLoading: isDoingLoading } = useGetListDocInternal({
    tab: String(Constant.DOC_INTERNAL_TAB_INDEX.DOING),
    text: searchField.quickSearchText,
    numberOrSign: searchField.numberOrSign,
    preview: searchField.preview,
    page:
      searchField.currentTab === Constant.DOC_INTERNAL_TAB_INDEX.DOING
        ? searchField.page
        : 1,
    sortBy: searchField.sortBy,
    direction: searchField.direction,
    size: searchField.pageSize,
  });
  useEffect(() => {
    SharedService.setCurrentMenuDocInternal("");
  }, []);

  useEffect(() => {
    const userInfo = getUserInfo();
    if (userInfo) {
      const parsed = JSON.parse(userInfo);
      setUserInfoId(parsed.id);
      setCurrentUserId(parsed.id);
    }

    const params = Object.fromEntries(searchParams?.entries() || []);
    if (params.t) {
      const tabMap: Record<string, string> = {
        "wait-approve": Constant.DOC_INTERNAL_TAB_INDEX.WAIT,
        approved: Constant.DOC_INTERNAL_TAB_INDEX.DOING,
      };
      setSearchField((prev) => ({
        ...prev,
        currentTab: tabMap[params.t] || Constant.DOC_INTERNAL_TAB_INDEX.WAIT,
      }));
    }
  }, [searchParams]);

  // Sync tempSearchParams with searchField on mount
  useEffect(() => {
    if (!hasInitialized.current) {
      setTempSearchParams({
        numberOrSign: searchField.numberOrSign,
        preview: searchField.preview,
      });
      hasInitialized.current = true;
    }
  }, [searchField.numberOrSign, searchField.preview]);

  const getTabName = () => {
    const tabs = [
      {
        name: TabNames.CHODUYET,
        tabIndex: Constant.DOC_INTERNAL_TAB_INDEX.WAIT,
      },
      {
        name: TabNames.DADUYET,
        tabIndex: Constant.DOC_INTERNAL_TAB_INDEX.DOING,
      },
    ];
    const result = tabs.find(
      (item) => item.tabIndex === searchField.currentTab
    );
    return result?.name || TabNames.CHODUYET;
  };

  const getCurrentData = () => {
    switch (searchField.currentTab) {
      case Constant.DOC_INTERNAL_TAB_INDEX.WAIT:
        return waitData?.content || [];
      case Constant.DOC_INTERNAL_TAB_INDEX.DOING:
        return doingData?.content || [];
      default:
        return [];
    }
  };

  const getCurrentTotal = () => {
    switch (searchField.currentTab) {
      case Constant.DOC_INTERNAL_TAB_INDEX.WAIT:
        return waitData?.totalElements || 0;
      case Constant.DOC_INTERNAL_TAB_INDEX.DOING:
        return doingData?.totalElements || 0;
      default:
        return 0;
    }
  };

  const getCurrentLoading = () => {
    switch (searchField.currentTab) {
      case Constant.DOC_INTERNAL_TAB_INDEX.WAIT:
        return isWaitLoading;
      case Constant.DOC_INTERNAL_TAB_INDEX.DOING:
        return isDoingLoading;
      default:
        return false;
    }
  };

  const sortByField = (fieldName: string) => {
    setSearchField((prev) => ({
      ...prev,
      sortBy: fieldName,
      direction:
        prev.sortBy === fieldName
          ? prev.direction === Constant.SORT_TYPE.DECREASE
            ? Constant.SORT_TYPE.INCREASE
            : Constant.SORT_TYPE.DECREASE
          : Constant.SORT_TYPE.DECREASE,
      page: 1,
    }));
  };

  const doSearch = (page: number, isAdvanceSearch = false) => {
    setSearchField((prev) => ({
      ...prev,
      page,
      isAdvanceSearch,
    }));
  };

  const handleSearchSubmit = () => {
    setSearchField((prev) => ({
      ...prev,
      numberOrSign: tempSearchParams.numberOrSign,
      preview: tempSearchParams.preview,
      page: 1,
      isAdvanceSearch: true,
    }));
  };

  const handleSearchReset = () => {
    setTempSearchParams({
      numberOrSign: "",
      preview: "",
    });
    setSearchField((prev) => ({
      ...prev,
      numberOrSign: "",
      preview: "",
      page: 1,
      isAdvanceSearch: false,
    }));
  };

  const doEditDoc = (doc: any) => {
    router.push(`/doc-internal/update/${doc.id}`);
  };

  const showConfirmDeleteDocument = (doc: any) => {
    setDocumentIdToDelete(doc.id);
    setIsDeleteConfirmOpen(true);
  };

  const doDelectDoc = () => {
    if (documentIdToDelete !== null) {
      doDeleteDocument(documentIdToDelete, {
        onSuccess: () => {
          ToastUtils.success("Xóa văn bản thành công");
          setIsDeleteConfirmOpen(false);
          setDocumentIdToDelete(null);
        },
        onError: () => {
          ToastUtils.error("Xóa văn bản thất bại");
          setIsDeleteConfirmOpen(false);
          setDocumentIdToDelete(null);
        },
      });
    }
  };

  const showApproveConfirm = (doc: any) => {
    setDocumentToApprove(doc);
    setIsApproveConfirmOpen(true);
  };

  const showRejectConfirm = (docId: number) => {
    setDocumentIdToReject(docId);
    setIsRejectConfirmOpen(true);
  };

  const checkSignAndApprove = (doc: any) => {
    if (doc.docStatus === "NB_LANH_DAO_KY") {
      return true;
    }
    return false;
  };

  const doApproveDocument = () => {
    if (documentToApprove) {
      const isSign = checkSignAndApprove(documentToApprove);
      doApproveDoc(
        {
          docId: documentToApprove.id,
          comment: "",
          files: [],
          accept: true,
        },
        {
          onSuccess: () => {
            if (isSign) {
              ToastUtils.success("Ký duyệt văn bản thành công");
            } else {
              ToastUtils.success("Cho ý kiến văn bản thành công");
            }
            setIsApproveConfirmOpen(false);
            setDocumentToApprove(null);
            doSearch(searchField.page);
          },
          onError: () => {
            ToastUtils.error("Thao tác thất bại");
            setIsApproveConfirmOpen(false);
            setDocumentToApprove(null);
          },
        }
      );
    }
  };

  const doRejectDocument = () => {
    if (documentIdToReject) {
      doApproveDoc(
        {
          docId: documentIdToReject,
          comment: "",
          files: [],
          accept: false,
        },
        {
          onSuccess: () => {
            ToastUtils.success("Từ chối văn bản thành công");
            setIsRejectConfirmOpen(false);
            setDocumentIdToReject(null);
            doSearch(searchField.page);
          },
          onError: () => {
            ToastUtils.error("Từ chối văn bản thất bại");
            setIsRejectConfirmOpen(false);
            setDocumentIdToReject(null);
          },
        }
      );
    }
  };

  const gotoDetailPage = (doc: any) => {
    SharedService.setCurrentMenuDocInternal(searchField.currentTab);
    router.push(`/doc-internal/approve/detail/${doc.id}`);
  };

  const checkPermissionEdit = (doc: any) => {
    if (
      doc.createBy &&
      doc.createBy === currentUserId &&
      doc.docStatus !== "NB_BAN_HANH" &&
      doc.docStatus !== "NB_CHO_DUYET" &&
      doc.docStatus !== "NB_LANH_DAO_KY"
    ) {
      return true;
    }
    return false;
  };

  const getLabelStatus = (status: string) => {
    switch (status) {
      case "NB_DU_THAO":
        return "bg-blue-600 text-white";
      case "NB_CHO_DUYET":
        return "bg-yellow-500 text-white";
      case "NB_TRA_LAI":
        return "bg-red-500 text-white";
      case "NB_LANH_DAO_KY":
        return "bg-yellow-500 text-white";
      case "NB_BAN_HANH":
        return "bg-green-500 text-white";
      case "NB_THU_HOI":
        return "bg-red-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const pageChanged = (page: number) => {
    doSearch(page);
  };

  const changePageSize = (size: number) => {
    setSearchField((prev) => ({
      ...prev,
      pageSize: size,
      page: 1,
    }));
  };

  const onTabSelect = (value: string) => {
    const tabMap: Record<string, string> = {
      [TabNames.CHODUYET]: Constant.DOC_INTERNAL_TAB_INDEX.WAIT,
      [TabNames.DADUYET]: Constant.DOC_INTERNAL_TAB_INDEX.DOING,
    };
    setSearchField((prev) => ({
      ...prev,
      currentTab: tabMap[value] || Constant.DOC_INTERNAL_TAB_INDEX.WAIT,
      page: 1,
    }));
  };

  const SortHeader = (label: string, sortKey?: string) => (
    <div
      className="flex items-center justify-center gap-1 cursor-pointer"
      onClick={() => sortKey && sortByField(sortKey)}
    >
      {label}
      {sortKey &&
        searchField.sortBy === sortKey &&
        (searchField.direction === Constant.SORT_TYPE.INCREASE ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        ))}
    </div>
  );

  const columns = [
    {
      header: "STT",
      accessor: (_: any, index: number) => (
        <span>
          {(searchField.page - 1) * searchField.pageSize + (index + 1)}
        </span>
      ),
      className: "text-center w-20",
    },
    {
      header: SortHeader("Trích yếu", SearchTitles.PREVIEW),
      accessor: (record: any) => (
        <a
          className="cursor-pointer hover:text-blue-600 hover:underline transition-all"
          onClick={() => gotoDetailPage(record)}
        >
          {record.preview}
        </a>
      ),
      className: "text-left w-80",
    },
    {
      header: SortHeader("Người tạo", SearchTitles.USER_ENTER),
      accessor: (record: any) => (
        <a
          className="cursor-pointer hover:text-blue-600 hover:underline transition-all"
          onClick={() => gotoDetailPage(record)}
        >
          {record.userCreateName}
        </a>
      ),
      className: "text-left w-40",
      show:
        searchField.currentTab === Constant.DOC_INTERNAL_TAB_INDEX.WAIT ||
        searchField.currentTab === Constant.DOC_INTERNAL_TAB_INDEX.DOING,
    },
    {
      header: SortHeader("Ngày văn bản", SearchTitles.DATE_CREATE),
      accessor: (record: any) => (
        <a
          className="cursor-pointer hover:text-blue-600 hover:underline transition-all"
          onClick={() => gotoDetailPage(record)}
        >
          {record.createDate
            ? new Date(record.createDate).toLocaleDateString("vi-VN")
            : ""}
        </a>
      ),
      className: "text-center w-32",
    },
    {
      header: SortHeader("Ngày cho ý kiến", SearchTitles.DATE_APPROVE),
      accessor: (record: any) => (
        <a
          className="cursor-pointer hover:text-blue-600 hover:underline transition-all"
          onClick={() => gotoDetailPage(record)}
        >
          {record.approveDate
            ? new Date(record.approveDate).toLocaleDateString("vi-VN")
            : ""}
        </a>
      ),
      className: "text-center w-32",
    },
    {
      header: SortHeader("Số văn bản", SearchTitles.NUMBER_OR_SIGN),
      accessor: (record: any) => (
        <a
          className="cursor-pointer hover:text-blue-600 hover:underline transition-all"
          onClick={() => gotoDetailPage(record)}
        >
          {record.numberOrSign || ""}
        </a>
      ),
      className: "text-center w-32",
    },
    {
      header: "Trạng thái",
      accessor: (record: any) => (
        <div className="flex justify-center">
          <span
            className={cn(
              "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap cursor-pointer hover:opacity-80 transition-opacity",
              getLabelStatus(record.docStatus)
            )}
            onClick={() => gotoDetailPage(record)}
          >
            {record.docStatusName}
          </span>
        </div>
      ),
      className: "text-center w-32",
      noRowClick: true,
    },
    // {
    //   header: "Thao tác",
    //   type: "actions" as const,
    //   renderActions: (record: any) => (
    //     <div className="flex gap-2 justify-center">
    //       {searchField.currentTab === Constant.DOC_INTERNAL_TAB_INDEX.WAIT && (
    //         <>
    //           <Button
    //             variant="ghost"
    //             size="sm"
    //             onClick={() => showApproveConfirm(record)}
    //             title={checkSignAndApprove(record) ? "Ký duyệt" : "Cho ý kiến"}
    //           >
    //             <CheckCircle className="h-4 w-4 text-success" />
    //           </Button>
    //           {/* Uncomment if reject is needed
    //           <Button
    //             variant="ghost"
    //             size="sm"
    //             onClick={() => showRejectConfirm(record.id)}
    //             title="Từ chối"
    //           >
    //             <XCircle className="h-4 w-4 text-danger" />
    //           </Button>
    //           */}
    //         </>
    //       )}
    //       {(searchField.currentTab === Constant.DOC_INTERNAL_TAB_INDEX.DOING ||
    //         searchField.currentTab ===
    //           Constant.DOC_INTERNAL_TAB_INDEX.RETURN) &&
    //         (checkPermissionEdit(record) ? (
    //           <>
    //             <Button
    //               variant="ghost"
    //               size="sm"
    //               onClick={() => doEditDoc(record)}
    //             >
    //               <Edit className="h-4 w-4 text-info" />
    //             </Button>
    //             <Button
    //               variant="ghost"
    //               size="sm"
    //               onClick={() => showConfirmDeleteDocument(record)}
    //             >
    //               <Trash2 className="h-4 w-4 text-danger" />
    //             </Button>
    //           </>
    //         ) : (
    //           <>
    //             <Button variant="ghost" size="sm" disabled>
    //               <Edit className="h-4 w-4 text-muted" />
    //             </Button>
    //             <Button variant="ghost" size="sm" disabled>
    //               <Trash2 className="h-4 w-4 text-muted" />
    //             </Button>
    //           </>
    //         ))}
    //     </div>
    //   ),
    //   className: "text-center w-32",
    // },
  ].filter((col: any) => col.show !== false);

  return (
    <div className="pl-4 pr-4 space-y-4">
      <div className="flex items-center justify-between gap-4 mb-4">
        <BreadcrumbNavigation
          items={[
            {
              label: "Văn bản nội bộ",
            },
          ]}
          currentPage="Văn bản xin ý kiến"
          showHome={false}
        />
      </div>

      {/* Search Section */}
      <div className="border rounded-lg p-4 mb-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearchSubmit();
          }}
        >
          <div className="flex flex-col md:flex-row items-end md:items-end justify-center gap-4">
            {/* Số văn bản */}
            <div className="flex flex-row items-center gap-2 w-full md:w-1/3">
              <label className="text-sm font-bold text-black whitespace-nowrap">
                Số văn bản:
              </label>
              <Input
                type="text"
                maxLength={50}
                placeholder="Số văn bản"
                value={tempSearchParams.numberOrSign}
                onChange={(e) =>
                  setTempSearchParams((prev) => ({
                    ...prev,
                    numberOrSign: e.target.value,
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearchSubmit();
                  }
                }}
              />
            </div>

            {/* Trích yếu */}
            <div className="flex flex-row items-center gap-2 w-full md:w-1/3">
              <label className="text-sm font-bold text-black whitespace-nowrap">
                Trích yếu:
              </label>
              <Input
                type="text"
                maxLength={50}
                placeholder="Trích yếu"
                value={tempSearchParams.preview}
                onChange={(e) =>
                  setTempSearchParams((prev) => ({
                    ...prev,
                    preview: e.target.value,
                  }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleSearchSubmit();
                  }
                }}
              />
            </div>

            {/* Nút tìm kiếm và đặt lại */}
            <div className="flex w-full md:w-auto justify-end md:justify-start gap-2">
              <Button
                type="submit"
                className="w-full md:w-auto h-9 px-4 text-sm font-medium bg-blue-600 hover:bg-blue-700 focus:outline-none focus-visible:ring-gray-300 focus-visible:ring-opacity-50 leading-none inline-flex items-center gap-2"
              >
                <Search className="h-4 w-4" /> Tìm kiếm
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSearchReset}
                className="w-full md:w-auto h-9 px-4 text-sm font-medium inline-flex items-center gap-2"
              >
                <RotateCcw className="h-4 w-4" /> Đặt lại
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* Tabs */}
      <Tabs value={getTabName()} onValueChange={onTabSelect}>
        <TabsList>
          <TabsTrigger
            value={TabNames.CHODUYET}
            className="data-[state=active]:text-blue-600"
          >
            Chờ cho ý kiến
          </TabsTrigger>
          <TabsTrigger
            value={TabNames.DADUYET}
            className="data-[state=active]:text-blue-600"
          >
            Đang cho ý kiến
          </TabsTrigger>
        </TabsList>

        <TabsContent value={TabNames.CHODUYET}>
          <Table
            columns={columns}
            dataSource={getCurrentData()}
            loading={getCurrentLoading()}
            totalItems={getCurrentTotal()}
            itemsPerPage={searchField.pageSize}
            currentPage={searchField.page}
            onPageChange={pageChanged}
            onItemsPerPageChange={changePageSize}
            pageSizeOptions={Constant.PAGE_SIZE_OPTION?.map(
              (item) => item.value
            )}
            onRowClick={(record) => gotoDetailPage(record)}
            rowClassName={(record, index) =>
              index % 2 === 0 ? "bg-white" : "bg-gray-50"
            }
          />
        </TabsContent>

        <TabsContent value={TabNames.DADUYET}>
          <Table
            columns={columns}
            dataSource={getCurrentData()}
            loading={getCurrentLoading()}
            totalItems={getCurrentTotal()}
            itemsPerPage={searchField.pageSize}
            currentPage={searchField.page}
            onPageChange={pageChanged}
            onItemsPerPageChange={changePageSize}
            pageSizeOptions={Constant.PAGE_SIZE_OPTION?.map(
              (item) => item.value
            )}
            onRowClick={(record) => gotoDetailPage(record)}
            rowClassName={(record, index) =>
              index % 2 === 0 ? "bg-white" : "bg-gray-50"
            }
          />
        </TabsContent>
      </Tabs>

      <ConfirmDeleteDialog
        isOpen={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        onConfirm={doDelectDoc}
        title="Xác nhận xóa"
        description="Bạn có chắc chắn muốn xóa văn bản này?"
        confirmText="Xóa"
        cancelText="Hủy"
      />

      <ConfirmDeleteDialog
        isOpen={isApproveConfirmOpen}
        onOpenChange={setIsApproveConfirmOpen}
        onConfirm={doApproveDocument}
        title="Xác nhận"
        description={
          documentToApprove && checkSignAndApprove(documentToApprove)
            ? "Bạn có chắc chắn muốn ký duyệt văn bản này?"
            : "Bạn có chắc chắn muốn cho ý kiến văn bản này?"
        }
        confirmText="Đồng ý"
        cancelText="Hủy"
      />

      <ConfirmDeleteDialog
        isOpen={isRejectConfirmOpen}
        onOpenChange={setIsRejectConfirmOpen}
        onConfirm={doRejectDocument}
        title="Xác nhận từ chối"
        description="Bạn có chắc chắn muốn từ chối văn bản này?"
        confirmText="Từ chối"
        cancelText="Hủy"
      />
    </div>
  );
}
