"use client";
import React, { useState, useMemo, useEffect } from "react";
import { Column } from "@/definitions";
import { DocumentBook } from "@/definitions/types/document-book.type";
import { CategoryCode } from "@/definitions/types/category.type";
import {
  Edit,
  Lock,
  Unlock,
  RotateCcw,
  Search,
  Plus,
  Eye,
  Building,
  Calendar,
  FileText,
  Hash,
  Paperclip,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import SelectCustom from "@/components/common/SelectCustom";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import DocumentBookModal from "@/components/document-book/DocumentBookModal";
import SelectDocumentType from "@/components/document-book/SelectDocumentType";
import { useGetCategoriesByCode } from "@/hooks/data/category.data";
import { useGetOrganizations } from "@/hooks/data/organization.data";
import {
  useSearchDocumentBooks,
  useActiveDocumentBook,
  useDeactiveDocumentBook,
} from "@/hooks/data/document-book.data";
import { Constant } from "@/definitions/constants/constant";
import { ToastUtils } from "@/utils/toast.utils";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/definitions";
import { handleError } from "@/utils/common.utils";
import { getEncryptDocBookValue } from "@/utils/token.utils";
import { useUsbTokenWatcher } from "@/hooks/useUsbTokenWatcher";

interface SearchFields {
  name: string;
  type: number | null;
  status: boolean | null;
  year: string;
  encryptShowing: boolean;
  page: number;
  sortBy: string;
  direction: string;
  size: number;
}

const defaultSearchFields: SearchFields = {
  name: "",
  type: null,
  status: null,
  year: "",
  encryptShowing: getEncryptDocBookValue(),
  page: 1,
  sortBy: "",
  direction: Constant.SORT_TYPE.DECREASE,
  size: Constant.PAGING.SIZE,
};

export default function DocumentBookListPage() {
  const queryClient = useQueryClient();
  const {
    isCheckStartUsbTokenWatcherDocBook,
    enableEncryptionAndWatchDocBook,
    disableEncryptionDocBook,
  } = useUsbTokenWatcher();

  // State
  const [searchFields, setSearchFields] =
    useState<SearchFields>(defaultSearchFields);
  const [tempSearchFields, setTempSearchFields] =
    useState<SearchFields>(defaultSearchFields);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);
  const [selectedDocumentBook, setSelectedDocumentBook] =
    useState<DocumentBook | null>(null);
  const [confirmActiveDeactivate, setConfirmActiveDeactivate] =
    useState<boolean>(false);
  const [showDocumentBookModal, setShowDocumentBookModal] =
    useState<boolean>(false);
  const [isViewMode, setIsViewMode] = useState<boolean>(false);

  // Data hooks
  const { data: securityCategories } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.SECURITY
  );
  const { data: orgList } = useGetOrganizations({ active: true });

  // Mutations
  const { mutate: activeDocumentBook } = useActiveDocumentBook();
  const { mutate: deactiveDocumentBook } = useDeactiveDocumentBook();

  // Initialize USB token watcher if needed
  useEffect(() => {
    isCheckStartUsbTokenWatcherDocBook();
  }, [isCheckStartUsbTokenWatcherDocBook]);

  // Computed values
  const documentBookType = Constant.DOCUMENT_BOOK_TYPE;
  const statusOptions = Constant.STATUS;

  // Prepare search params for useQuery
  const searchParams = useMemo(() => {
    return {
      name: searchFields.name,
      type: searchFields.type ?? undefined,
      status: searchFields.status ?? undefined,
      year: searchFields.year ? parseInt(searchFields.year) : undefined,
      page: currentPage,
      sortBy: searchFields.sortBy,
      direction: searchFields.direction,
      size: itemsPerPage,
      encrypt: searchFields.encryptShowing.toString(),
    };
  }, [searchFields, currentPage, itemsPerPage]);

  // Use useQuery for search
  const {
    data: searchResult,
    isLoading,
    error,
  } = useSearchDocumentBooks(searchParams, true);

  // Extract data from search result
  const documentBooks = searchResult?.content || [];
  const totalItems = searchResult?.totalElements || 0;

  // Handlers
  const handleSearchSubmit = () => {
    setSearchFields({ ...tempSearchFields, page: 1 });
    setCurrentPage(1);
  };

  const handleSearchReset = () => {
    setSearchFields(defaultSearchFields);
    setTempSearchFields(defaultSearchFields);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  const handleSort = (fieldName: string) => {
    const newDirection =
      searchFields.direction === Constant.SORT_TYPE.DECREASE
        ? Constant.SORT_TYPE.INCREASE
        : Constant.SORT_TYPE.DECREASE;

    setSearchFields((prev) => ({
      ...prev,
      sortBy: fieldName,
      direction: newDirection,
    }));
  };

  const handleAddDocumentBook = () => {
    setSelectedDocumentBook(null);
    setIsViewMode(false);
    setShowDocumentBookModal(true);
  };

  const handleEditDocumentBook = (documentBook: DocumentBook) => {
    setSelectedDocumentBook(documentBook);
    setIsViewMode(!isCanUpdate(documentBook));
    setShowDocumentBookModal(true);
  };

  const handleActiveDeactivateDocumentBook = (documentBook: DocumentBook) => {
    setSelectedDocumentBook(documentBook);
    setConfirmActiveDeactivate(true);
  };

  const doActiveDeactivateDocumentBook = () => {
    if (!selectedDocumentBook) return;

    const mutation = selectedDocumentBook.active
      ? deactiveDocumentBook
      : activeDocumentBook;

    mutation(selectedDocumentBook.id!, {
      onSuccess: () => {
        ToastUtils.success(
          selectedDocumentBook.active
            ? "Ngưng kích hoạt sổ văn bản"
            : "Kích hoạt sổ văn bản"
        );
        queryClient.invalidateQueries({
          queryKey: [queryKeys.documentBooks.search],
        });
        setConfirmActiveDeactivate(false);
        setSelectedDocumentBook(null);
      },
      onError: (error) => {
        handleError(error);
        setConfirmActiveDeactivate(false);
        setSelectedDocumentBook(null);
      },
    });
  };

  // Helper functions
  const getOrgnameByID = (id: number) => {
    if (!orgList) return "";
    const org = orgList.find((item) => item.id === id);
    return org ? org.name : "";
  };

  const getBookTypeName = (bookType: number) => {
    const type = documentBookType.find((item) => item.code === bookType);
    return type ? type.name : "";
  };

  const isCanUpdate = (item: DocumentBook) => {
    // TODO: Implement permission check based on user org and item org
    return true;
  };

  // Table columns
  const documentBookColumns: Column<DocumentBook>[] = [
    {
      header: (
        <div className="flex justify-center items-center py-1">
          <span className="text-xs font-semibold">STT</span>
        </div>
      ),
      className: "text-center py-1 w-4",
      accessor: (_item: DocumentBook, index: number) => (
        <div className="flex justify-center items-center py-1">
          <span className="text-xs font-medium">
            {(currentPage - 1) * itemsPerPage + index + 1}
          </span>
        </div>
      ),
    },
    {
      header: (
        <div
          className="flex justify-center items-center py-1 cursor-pointer hover:text-blue-700"
          onClick={() => handleSort("NAME")}
        >
          <span className="text-xs font-semibold">Tên sổ văn bản</span>
        </div>
      ),
      className: "py-2 w-44",
      accessor: (documentBook: DocumentBook) => (
        <div className="flex items-center gap-2">
          <Paperclip className="w-4 h-4 text-blue-600" />
          <span className="text-sm">{documentBook.name}</span>
        </div>
      ),
    },
    {
      header: (
        <div
          className="flex justify-center items-center py-1 cursor-pointer hover:text-blue-700"
          onClick={() => handleSort("NUMBER_SIGN")}
        >
          <span className="text-xs font-semibold">Ký hiệu</span>
        </div>
      ),
      className: "text-center py-2 w-32",
      accessor: (documentBook: DocumentBook) => (
        <div className="flex items-center justify-center gap-2">
          <Hash className="w-4 h-4 text-gray-500" />
          <span className="text-sm">{documentBook.numberOrSign || ""}</span>
        </div>
      ),
    },
    {
      header: (
        <div
          className="flex justify-center items-center py-1 cursor-pointer hover:text-blue-700"
          onClick={() => handleSort("CURRENT_NUMBER")}
        >
          <span className="text-xs font-semibold">Số hiện tại</span>
        </div>
      ),
      className: "text-center py-2 w-24",
      accessor: (documentBook: DocumentBook) => (
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm">{documentBook.currentNumber}</span>
        </div>
      ),
    },
    {
      header: (
        <div
          className="flex justify-center items-center py-1 cursor-pointer hover:text-blue-700"
          onClick={() => handleSort("BOOK_TYPE")}
        >
          <span className="text-xs font-semibold">Loại sổ</span>
        </div>
      ),
      className: "py-2 w-32",
      accessor: (documentBook: DocumentBook) => (
        <span className="text-sm">
          {getBookTypeName(documentBook.bookType)}
        </span>
      ),
    },
    {
      header: (
        <div
          className="flex justify-center items-center py-1 cursor-pointer hover:text-blue-700"
          onClick={() => handleSort("YEAR")}
        >
          <span className="text-xs font-semibold">Năm</span>
        </div>
      ),
      className: "text-center py-2 w-20",
      accessor: (documentBook: DocumentBook) => (
        <div className="flex items-center justify-center gap-2">
          <Calendar className="w-4 h-4 text-gray-500" />
          <span className="text-sm">{documentBook.year}</span>
        </div>
      ),
    },
    {
      header: (
        <div
          className="flex justify-center items-center py-1 cursor-pointer hover:text-blue-700"
          onClick={() => handleSort("ACTIVE")}
        >
          <span className="text-xs font-semibold">Trạng thái</span>
        </div>
      ),
      className: "text-center py-2 w-24",
      accessor: (documentBook: DocumentBook) => (
        <Badge
          variant={documentBook.active ? "default" : "destructive"}
          className={cn(
            "text-xs cursor-pointer",
            documentBook.active
              ? "bg-green-100 text-green-800 border-green-200 hover:bg-green-200"
              : "bg-red-100 text-red-800 border-red-200 hover:bg-red-200"
          )}
        >
          {documentBook.active ? "Hoạt động" : "Không hoạt động"}
        </Badge>
      ),
    },
    {
      header: (
        <div className="flex justify-center items-center py-1">
          <span className="text-xs font-semibold">Đơn vị quản lý</span>
        </div>
      ),
      className: "py-2 w-32",
      accessor: (documentBook: DocumentBook) => (
        <div className="flex items-center gap-2">
          <Building className="w-4 h-4 text-gray-500" />
          <span className="text-sm">{documentBook.orgName || ""}</span>
        </div>
      ),
    },
    {
      header: (
        <div className="flex justify-center items-center py-1">
          <span className="text-xs font-semibold">Thao tác</span>
        </div>
      ),
      type: "actions",
      className: "text-center py-2 w-32",
      renderActions: (documentBook: DocumentBook) => (
        <TooltipProvider>
          <div className="flex items-center justify-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 hover:bg-green-100 rounded transition-colors"
                  onClick={() =>
                    handleActiveDeactivateDocumentBook(documentBook)
                  }
                  disabled={!isCanUpdate(documentBook)}
                >
                  {documentBook.active ? (
                    <Lock className="w-4 h-4 text-red-600" />
                  ) : (
                    <Unlock className="w-4 h-4 text-green-600" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{documentBook.active ? "Ngừng kích hoạt" : "Kích hoạt"}</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 hover:bg-blue-100 rounded transition-colors"
                  onClick={() => handleEditDocumentBook(documentBook)}
                >
                  {isCanUpdate(documentBook) ? (
                    <Edit className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-600" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isCanUpdate(documentBook) ? "Sửa" : "Xem"}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
      ),
    },
  ];

  return (
    <div className="space-y-4 p-3">
      <BreadcrumbNavigation
        items={[
          {
            href: "/users",
            label: "Quản trị hệ thống",
          },
        ]}
        currentPage="Quản lý sổ văn bản"
        showHome={false}
      />
      <div
        className="flex items-center justify-between border rounded-lg p-4"
        style={{ backgroundColor: "#E8E9EB" }}
      >
        <div>
          <div className="text-gray-900 text-lg font-bold">
            Quản lý sổ văn bản của đơn vị
          </div>
          <div className="text-gray-500 text-xs">
            Hiển thị thông tin danh sách sổ văn bản đến, văn bản đi của đơn vị
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 text-sm font-medium"
            onClick={handleAddDocumentBook}
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm mới
          </Button>
        </div>
      </div>

      {/* Search Form */}
      <div className="border rounded-lg p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="flex items-center gap-3">
            <label className="w-40 text-base font-semibold text-right">
              Hiển thị
            </label>
            <div className="flex-1 w-full min-w-0">
              <SelectCustom
                className="w-full"
                value={tempSearchFields.encryptShowing ? "true" : "false"}
                onChange={() => {
                  const newEncryptShowing = !tempSearchFields.encryptShowing;
                  setTempSearchFields((prev) => ({
                    ...prev,
                    encryptShowing: newEncryptShowing,
                  }));

                  // Save to localStorage/sessionStorage like Angular version
                  if (newEncryptShowing) {
                    enableEncryptionAndWatchDocBook();
                  } else {
                    disableEncryptionDocBook();
                  }

                  handleSearchSubmit();
                }}
                options={[
                  { label: "Văn bản thường", value: "false" },
                  { label: "Văn bản mật", value: "true" },
                ]}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="w-40 text-base font-semibold text-right">
              Tên sổ văn bản
            </label>
            <Input
              className="h-9 text-sm flex-1 w-full"
              placeholder="Tên sổ văn bản"
              value={tempSearchFields.name}
              onChange={(e) =>
                setTempSearchFields((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
            />
          </div>

          <div className="flex items-center gap-3 min-w-0">
            <label className="w-40 text-base font-semibold text-right flex-shrink-0">
              Năm
            </label>
            <Input
              className="h-9 text-sm flex-1 w-full min-w-0"
              type="number"
              placeholder="Năm"
              value={tempSearchFields.year}
              onChange={(e) =>
                setTempSearchFields((prev) => ({
                  ...prev,
                  year: e.target.value,
                }))
              }
            />
          </div>

          <div className="flex items-center gap-3">
            <label className="w-40 text-base font-semibold text-right">
              Loại sổ
            </label>
            <div className="flex-1 w-full min-w-0">
              <SelectCustom
                className="w-full"
                value={tempSearchFields.type?.toString() || "all"}
                onChange={(value: string | string[]) => {
                  const strValue = Array.isArray(value) ? value[0] : value;
                  if (strValue === "all") {
                    setTempSearchFields((prev) => ({
                      ...prev,
                      type: null,
                    }));
                  } else {
                    const numValue = parseInt(strValue);
                    setTempSearchFields((prev) => ({
                      ...prev,
                      type: isNaN(numValue) ? null : numValue,
                    }));
                  }
                }}
                options={[
                  { label: "--- Tất cả ---", value: "all" },
                  ...documentBookType.map((item) => ({
                    label: item.name,
                    value: item.code.toString(),
                  })),
                ]}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="w-40 text-base font-semibold text-right">
              Trạng thái
            </label>
            <div className="flex-1 w-full min-w-0">
              <SelectCustom
                className="w-full"
                value={tempSearchFields.status?.toString() || "all"}
                onChange={(value: string | string[]) => {
                  const strValue = Array.isArray(value) ? value[0] : value;
                  setTempSearchFields((prev) => ({
                    ...prev,
                    status: strValue === "all" ? null : strValue === "true",
                  }));
                }}
                options={[
                  { label: "--- Tất cả ---", value: "all" },
                  ...statusOptions.map((item) => ({
                    label: item.name,
                    value: item.value.toString(),
                  })),
                ]}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-center gap-2">
          <Button
            size="sm"
            onClick={handleSearchSubmit}
            className="h-9 px-3 text-xs bg-blue-600 hover:bg-blue-700 inline-flex items-center justify-center"
          >
            <Search className="w-3 h-3 mr-1" />
            <span className="leading-none">Tìm kiếm</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleSearchReset}
            className="h-9 px-3 text-xs inline-flex items-center justify-center"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            <span className="leading-none">Đặt lại</span>
          </Button>
        </div>
      </div>

      <Table
        sortable
        columns={documentBookColumns}
        dataSource={documentBooks}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        totalItems={totalItems}
        onPageChange={handlePageChange}
        showPagination
        bgColor="bg-white"
        rowClassName={(_item: DocumentBook, index: number) =>
          index % 2 === 0 ? "bg-white" : "bg-[#0000000d]"
        }
        emptyText={
          isLoading
            ? "Đang tải dữ liệu..."
            : error
              ? `Lỗi: ${error.message}`
              : "Không có dữ liệu sổ văn bản"
        }
        onItemsPerPageChange={handleItemsPerPageChange}
        loading={isLoading}
      />

      {/* Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={confirmActiveDeactivate}
        onOpenChange={setConfirmActiveDeactivate}
        onConfirm={doActiveDeactivateDocumentBook}
        title="Xác nhận"
        description={
          selectedDocumentBook?.active
            ? "Bạn có muốn ngừng kích hoạt sổ văn bản?"
            : "Bạn có muốn kích hoạt sổ văn bản?"
        }
        confirmText="Đồng ý"
        cancelText="Hủy"
      />

      {/* Document Book Modal */}
      <DocumentBookModal
        isOpen={showDocumentBookModal}
        onOpenChange={setShowDocumentBookModal}
        documentBook={selectedDocumentBook}
        isView={isViewMode}
        encryptShowing={searchFields.encryptShowing}
        onEncryptShowingChange={(value) => {
          setSearchFields((prev) => ({ ...prev, encryptShowing: value }));
          setTempSearchFields((prev) => ({ ...prev, encryptShowing: value }));
        }}
        onSuccess={() => {
          queryClient.invalidateQueries({
            queryKey: [queryKeys.documentBooks.search],
          });
        }}
      />
    </div>
  );
}
