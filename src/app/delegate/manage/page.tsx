"use client";

import React, { useEffect, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table } from "@/components/ui/table";
import { Column } from "@/definitions/types/table.type";
import {
  Search,
  Plus,
  ChevronDown,
  ChevronUp,
  FileText,
  Edit2,
  Lock,
  Unlock,
  Eye,
  Download,
  RefreshCcw,
} from "lucide-react";
import { DelegateService } from "@/services/delegate.service";
import {
  Delegate,
  DelegateListResponse,
  DelegateSearchParams,
  DelegateAttachment,
} from "@/definitions/types/delegate.type";
import { ToastUtils } from "@/utils/toast.utils";
import { formatDateVN } from "@/utils/datetime.utils";
import { Constant } from "@/definitions/constants/constant";
import { uploadFileService } from "@/services/file.service";
import { DelegateModal } from "@/components/delegate/DelegateModal";
import AttachmentDialog from "@/components/common/AttachmentDialog";
import useAuthStore from "@/stores/auth.store";
import { CustomDatePicker } from "@/components/ui/calendar";
import { getExtension } from "@/utils/common.utils";

enum SearchTitles {
  NUMBER_SIGN = "NUMBER_SIGN",
  FROM_USER_ORDER = "FROM_USER_ORDER",
  TO_USER_ORDER = "TO_USER_ORDER",
  START_DATE = "START_DATE",
  END_DATE = "END_DATE",
}

export default function DelegateManagePage() {
  const { user } = useAuthStore();
  const currentTime = new Date().getTime();

  // States
  const [loading, setLoading] = useState(false);
  const [delegateList, setDelegateList] = useState<Delegate[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [isAdvancedSearch, setIsAdvancedSearch] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDelegate, setSelectedDelegate] = useState<Delegate | null>(
    null
  );
  const [isEditMode, setIsEditMode] = useState(false);
  const [openAttachmentDialog, setOpenAttachmentDialog] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState<
    DelegateAttachment[]
  >([]);

  // Search fields - this is for display only
  const [searchInput, setSearchInput] = useState("");

  // Actual search params used for API calls
  const [searchField, setSearchField] = useState<DelegateSearchParams>({
    page: 1,
    size: Constant.ITEMS_PER_PAGE,
    sortBy: "",
    direction: Constant.SORT_TYPE.DECREASE,
    q: "",
    numberOrSign: "",
    fromUser: "",
    toUser: "",
    startDate: "",
    endDate: "",
    isShowAll: false, // Service will convert to 'false' string for API
  });

  // Advanced search fields - display only
  const [advancedSearch, setAdvancedSearch] = useState({
    numberOrSign: "",
    fromUser: "",
    toUser: "",
    startDate: null as Date | null,
    endDate: null as Date | null,
  });

  // Actual advanced search params used for API calls
  const [appliedAdvancedSearch, setAppliedAdvancedSearch] = useState({
    numberOrSign: "",
    fromUser: "",
    toUser: "",
    startDate: null as Date | null,
    endDate: null as Date | null,
  });

  // Load data - only depend on actual search params
  const loadDelegateList = useCallback(async () => {
    setLoading(true);
    try {
      let response: DelegateListResponse;
      if (isAdvancedSearch) {
        const params: DelegateSearchParams = {
          ...searchField,
          numberOrSign: appliedAdvancedSearch.numberOrSign || undefined,
          fromUser: appliedAdvancedSearch.fromUser || undefined,
          toUser: appliedAdvancedSearch.toUser || undefined,
          startDate: appliedAdvancedSearch.startDate
            ? appliedAdvancedSearch.startDate.toISOString().split("T")[0]
            : undefined,
          endDate: appliedAdvancedSearch.endDate
            ? appliedAdvancedSearch.endDate.toISOString().split("T")[0]
            : undefined,
        };
        response = await DelegateService.searchAdvanceDelegate(params);
      } else if (searchField.q) {
        response = await DelegateService.searchBasicDelegate(searchField);
      } else {
        // Ensure isShowAll is set to false for normal list view (service converts to 'false' string)
        const params = { ...searchField, isShowAll: false };
        response = await DelegateService.getDelegateList(params);
      }
      setDelegateList(response.content || []);
      setTotalItems(response.totalElements || 0);
    } catch (error: any) {
      ToastUtils.error(error?.message || "Không thể tải danh sách ủy quyền");
    } finally {
      setLoading(false);
    }
  }, [
    searchField.page,
    searchField.size,
    searchField.sortBy,
    searchField.direction,
    searchField.q,
    isAdvancedSearch,
    appliedAdvancedSearch.numberOrSign,
    appliedAdvancedSearch.fromUser,
    appliedAdvancedSearch.toUser,
    appliedAdvancedSearch.startDate,
    appliedAdvancedSearch.endDate,
  ]);

  // Load data on mount and when search params change
  useEffect(() => {
    loadDelegateList();
  }, [loadDelegateList]);

  // Handlers
  const handleBasicSearch = () => {
    setSearchField((prev) => ({ ...prev, q: searchInput, page: 1 }));
    setIsAdvancedSearch(false);
  };

  const handleAdvancedSearch = () => {
    setAppliedAdvancedSearch(advancedSearch);
    setSearchField((prev) => ({ ...prev, page: 1 }));
    setIsAdvancedSearch(true);
  };

  const handleSort = (field: string) => {
    const newDirection =
      searchField.sortBy === field &&
      searchField.direction === Constant.SORT_TYPE.DECREASE
        ? Constant.SORT_TYPE.INCREASE
        : Constant.SORT_TYPE.DECREASE;
    setSearchField((prev) => ({
      ...prev,
      sortBy: field,
      direction: newDirection,
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setSearchField((prev) => ({ ...prev, page }));
  };

  const handlePageSizeChange = (size: number) => {
    setSearchField((prev) => ({ ...prev, size, page: 1 }));
  };

  const handleAddDelegate = () => {
    setSelectedDelegate(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };

  const handleEditDelegate = (index: number) => {
    const delegate = delegateList[index];
    // Check giống v1: chỉ cho edit nếu currentTime <= endDate
    if (delegate.endDate) {
      const endDate = new Date(delegate.endDate);
      const endTime = endDate.getTime();
      if (currentTime > endTime) {
        // Không cho edit nếu đã hết hạn - giống v1 HTML line 256
        return;
      }
    }
    setSelectedDelegate(delegate);
    setIsEditMode(true);
    setIsModalOpen(true);
  };

  const handleActiveDeactive = async (id: number) => {
    try {
      const result = await DelegateService.activeAndDeactive(id);
      // Message động dựa trên active status giống v1
      const message = result?.active
        ? "Mở khóa ủy quyền thành công"
        : "Khóa ủy quyền thành công";
      ToastUtils.success(message);
      loadDelegateList();
    } catch (error: any) {
      ToastUtils.error(error?.message || "Không thể cập nhật trạng thái");
    }
  };

  const handleViewFile = (file: DelegateAttachment) => {
    // Convert DelegateAttachment to file object format expected by viewFile
    const fileObj = {
      name: file.name,
      id: file.id?.toString(),
      encrypt: file.url ? false : undefined, // Adjust based on your data structure
    };
    uploadFileService.viewFile(
      fileObj,
      Constant.ATTACHMENT_DOWNLOAD_TYPE.DELEGATE
    );
  };

  const handleDownloadFile = (fileName: string) => {
    uploadFileService.downloadFile(
      fileName,
      Constant.ATTACHMENT_DOWNLOAD_TYPE.DELEGATE
    );
  };

  const handleViewAttachments = (attachments: DelegateAttachment[]) => {
    setSelectedAttachments(attachments);
    setOpenAttachmentDialog(true);
  };

  const canViewFile = (fileName: string): boolean => {
    // Check if file can be viewed (similar to canViewNoStatus in Angular)
    const extension = getExtension(fileName);
    if (!extension) return false;
    const ext = extension.toLowerCase();
    const viewableExtensions = [
      "pdf",
      "jpg",
      "jpeg",
      "png",
      "gif",
      "bmp",
      "doc",
      "docx",
      "xls",
      "xlsx",
      "ppt",
      "pptx",
    ];
    return viewableExtensions.includes(ext);
  };

  const getFileSizeString = (size: number): string => {
    const KB = size / 1024;
    const MB = KB / 1024;
    if (MB >= 0.1) {
      return `${MB.toFixed(2)} MB`;
    }
    if (KB > 0) {
      return `${KB.toFixed(2)} KB`;
    }
    return "";
  };

  // Table columns
  const columns: Column<Delegate>[] = [
    {
      header: "STT",
      accessor: (_r, idx) =>
        ((searchField.page || 1) - 1) * (searchField.size || 10) + idx + 1,
      className: "text-center w-16",
    },
    {
      header: (
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => handleSort(SearchTitles.NUMBER_SIGN)}
        >
          Số văn bản ủy quyền
          {searchField.sortBy === SearchTitles.NUMBER_SIGN &&
            (searchField.direction === Constant.SORT_TYPE.DECREASE ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            ))}
        </div>
      ),
      accessor: (r) => r.numberOrSign || "",
      className: "text-center",
    },
    {
      header: (
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => handleSort(SearchTitles.FROM_USER_ORDER)}
        >
          Người ủy quyền
          {searchField.sortBy === SearchTitles.FROM_USER_ORDER &&
            (searchField.direction === Constant.SORT_TYPE.DECREASE ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            ))}
        </div>
      ),
      accessor: (r) => r.fromUserName || "",
      className: "text-center",
    },
    {
      header: (
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => handleSort(SearchTitles.TO_USER_ORDER)}
        >
          Người được ủy quyền
          {searchField.sortBy === SearchTitles.TO_USER_ORDER &&
            (searchField.direction === Constant.SORT_TYPE.DECREASE ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            ))}
        </div>
      ),
      accessor: (r) => r.toUserName || "",
      className: "text-center",
    },
    {
      header: (
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => handleSort(SearchTitles.START_DATE)}
        >
          Ngày bắt đầu
          {searchField.sortBy === SearchTitles.START_DATE &&
            (searchField.direction === Constant.SORT_TYPE.DECREASE ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            ))}
        </div>
      ),
      accessor: (r) => (r.startDate ? formatDateVN(new Date(r.startDate)) : ""),
      className: "text-center",
    },
    {
      header: (
        <div
          className="flex items-center gap-1 cursor-pointer"
          onClick={() => handleSort(SearchTitles.END_DATE)}
        >
          Ngày kết thúc
          {searchField.sortBy === SearchTitles.END_DATE &&
            (searchField.direction === Constant.SORT_TYPE.DECREASE ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronUp className="w-4 h-4" />
            ))}
        </div>
      ),
      accessor: (r) => (r.endDate ? formatDateVN(new Date(r.endDate)) : ""),
      className: "text-center",
    },
    {
      header: "Đính kèm",
      accessor: (r) => {
        const attachments = r.attachments || [];
        if (attachments.length === 0) return null;
        if (attachments.length === 1) {
          const attachment = attachments[0];
          const viewable = canViewFile(attachment.name);
          return (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() =>
                  viewable
                    ? handleViewFile(attachment)
                    : handleDownloadFile(attachment.name)
                }
                className="text-yellow-600 hover:text-yellow-700"
                title={attachment.displayName || attachment.name}
              >
                <FileText className="w-4 h-4" />
              </button>
            </div>
          );
        }
        return (
          <div className="flex items-center justify-center">
            <button
              onClick={() => handleViewAttachments(attachments)}
              className="text-yellow-600 hover:text-yellow-700"
              title={`${attachments.length} files`}
            >
              <FileText className="w-4 h-4" />
            </button>
          </div>
        );
      },
      className: "text-center",
    },
    {
      header: "Thao tác",
      type: "actions",
      renderActions: (r, _idx) => {
        // Logic giống v1: chỉ cho action nếu currentTime <= endDate
        // Nếu hết hạn thì không hiển thị action buttons hoặc disable
        const endDate = r.endDate ? new Date(r.endDate) : null;
        const endTime = endDate ? endDate.getTime() : null;
        const canAction = endTime ? currentTime <= endTime : true;

        // Nếu hết hạn, không render buttons (giống v1 line 256, 261, 266)
        if (endTime && currentTime > endTime) {
          return (
            <div className="flex items-center justify-center gap-2">
              <button
                disabled
                className="p-1 text-gray-400 cursor-not-allowed"
                title="Không thể thao tác - ủy quyền đã hết hạn"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          );
        }

        return (
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => {
                const idx = delegateList.findIndex((d) => d.id === r.id);
                if (idx >= 0) handleEditDelegate(idx);
              }}
              className="p-1 text-blue-600 hover:text-blue-700"
              title="Cập nhật"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            {r.active ? (
              <button
                onClick={() => r.id && handleActiveDeactive(r.id)}
                className="p-1 text-green-600 hover:text-green-700"
                title="Khóa ủy quyền"
              >
                <Lock className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => r.id && handleActiveDeactive(r.id)}
                className="p-1 text-red-600 hover:text-red-700"
                title="Mở khóa ủy quyền"
              >
                <Unlock className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      },
      className: "text-center",
    },
  ];

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header with search */}
        <div className="p-4 border-b border-gray-200 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-1">
              Quản lý ủy quyền
            </h4>
            <p className="text-sm text-gray-500">
              Hiển thị thông tin danh sách ủy quyền
            </p>
          </div>
          <div className="flex w-full lg:w-auto items-center gap-2">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Tìm kiếm Số/Ký hiệu | Trích yếu"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleBasicSearch();
                }}
                className="pl-10 h-8"
              />
            </div>
            <Button
              className="bg-blue-600 hover:bg-blue-600 text-white hover:text-white"
              onClick={handleBasicSearch}
              variant="outline"
            >
              Tìm kiếm
            </Button>
            <Button
              className="bg-blue-600 hover:bg-blue-600 text-white hover:text-white"
              variant="outline"
              onClick={() => {
                setIsAdvancedSearch(!isAdvancedSearch);
                if (isAdvancedSearch) {
                  setAdvancedSearch(appliedAdvancedSearch);
                }
              }}
            >
              {isAdvancedSearch ? (
                <>
                  <ChevronUp className="w-4 h-4 mr-2" />
                  Thu gọn tìm kiếm
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 mr-2" />
                  Tìm kiếm nâng cao
                </>
              )}
            </Button>
            <Button
              onClick={handleAddDelegate}
              className="bg-blue-600 hover:bg-blue-700 text-white hover:text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm mới
            </Button>
          </div>
        </div>

        {/* Advanced Search */}
        <div className="p-4 border-b border-gray-200">
          {/* Advanced Search */}
          {isAdvancedSearch && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h5 className="font-bold text-gray-700 mb-4">
                Tìm kiếm nâng cao
              </h5>
              <div className="space-y-4 mb-4">
                {/* Row 1: Số văn bản ủy quyền - full width */}
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-1">
                    Số văn bản ủy quyền
                  </label>
                  <Input
                    value={advancedSearch.numberOrSign}
                    onChange={(e) =>
                      setAdvancedSearch((prev) => ({
                        ...prev,
                        numberOrSign: e.target.value,
                      }))
                    }
                    placeholder="Nhập số văn bản"
                    className="bg-white"
                  />
                </div>

                {/* Row 2: Ngày bắt đầu + Ngày kết thúc */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Ngày bắt đầu
                    </label>
                    <CustomDatePicker
                      selected={advancedSearch.startDate}
                      onChange={(date) =>
                        setAdvancedSearch((prev) => ({
                          ...prev,
                          startDate: date,
                        }))
                      }
                      placeholder="dd/mm/yyyy"
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Ngày kết thúc
                    </label>
                    <CustomDatePicker
                      selected={advancedSearch.endDate}
                      onChange={(date) =>
                        setAdvancedSearch((prev) => ({
                          ...prev,
                          endDate: date,
                        }))
                      }
                      placeholder="dd/mm/yyyy"
                      className="bg-white"
                    />
                  </div>
                </div>

                {/* Row 3: Người ủy quyền + Người được ủy quyền */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Người ủy quyền
                    </label>
                    <Input
                      value={String(advancedSearch.fromUser || "")}
                      onChange={(e) =>
                        setAdvancedSearch((prev) => ({
                          ...prev,
                          fromUser: e.target.value,
                        }))
                      }
                      placeholder="Nhập tên người ủy quyền"
                      className="bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-1">
                      Người được ủy quyền
                    </label>
                    <Input
                      value={String(advancedSearch.toUser || "")}
                      onChange={(e) =>
                        setAdvancedSearch((prev) => ({
                          ...prev,
                          toUser: e.target.value,
                        }))
                      }
                      placeholder="Nhập tên người được ủy quyền"
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-center gap-2">
                <Button
                  onClick={handleAdvancedSearch}
                  className="bg-blue-600 hover:bg-blue-700 text-white hover:text-white"
                >
                  <Search className="w-4 h-4 mr-2" />
                  Tìm kiếm
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setAdvancedSearch({
                      numberOrSign: "",
                      fromUser: "",
                      toUser: "",
                      startDate: null,
                      endDate: null,
                    });
                  }}
                >
                  <RefreshCcw className="w-4 h-4 mr-2" />
                  Đặt lại
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="p-4">
          <Table
            columns={columns}
            dataSource={delegateList}
            loading={loading}
            currentPage={searchField.page}
            onPageChange={handlePageChange}
            totalItems={totalItems}
            onItemsPerPageChange={handlePageSizeChange}
            pageSizeOptions={[10, 20, 50, 100]}
            showPageSize={true}
            emptyText="Không tồn tại dữ liệu"
          />
        </div>
      </div>

      {/* Delegate Modal */}
      <DelegateModal
        isOpen={isModalOpen}
        onOpenChange={setIsModalOpen}
        delegate={selectedDelegate}
        isEdit={isEditMode}
        onSuccess={() => {
          loadDelegateList();
          setIsModalOpen(false);
        }}
      />

      {/* Attachment Dialog */}
      <AttachmentDialog
        isOpen={openAttachmentDialog}
        onOpenChange={setOpenAttachmentDialog}
        attachments={selectedAttachments.map((a) => ({
          id: a.id,
          name: a.name,
          fileName: a.displayName || a.name,
        }))}
      />
    </div>
  );
}
