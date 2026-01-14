"use client";

import { useState, useRef } from "react";
import {
  FolderPlus,
  FileText,
  Edit,
  Trash2,
  X,
  Folder,
  Power,
  Check,
} from "lucide-react";
import {
  useGetListHSCV,
  useCreateWorkProfile,
  useUpdateWorkProfile,
  useDeleteWorkProfile,
  useGetFolderDetailById,
  useAddDocument,
  useGetListVBByFolderId,
  useFinishHSCV,
} from "@/hooks/data/document-record.data";
import CreateWorkProfileModal from "@/components/common/CreateWorkProfileModal";
import EditWorkProfileModal from "@/components/document-record/EditWorkProfileModal";
import AddDocumentModal from "@/components/document-record/AddDocumentModal";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import { Button } from "@/components/ui/button";
import { Column } from "@/definitions/types/table.type";
import { WorkProfile } from "@/definitions/types/document-record";
import { formatDate } from "@/utils/datetime.utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table } from "@/components/ui/table";

interface HoSoModalProps {
  isOpen: boolean;
  onClose: () => void;
  folderId?: string;
  onRefresh?: () => void;
}

const HoSoModal: React.FC<HoSoModalProps> = ({
  isOpen,
  onClose,
  folderId,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState("DM_VAN_BAN_HS");
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [isAddDocumentModalOpen, setIsAddDocumentModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isFinishModalOpen, setIsFinishModalOpen] = useState(false);

  const { data: folderDetailData, isLoading: isLoadingFolderDetail } =
    useGetFolderDetailById(folderId || "", !!folderId);
  const { mutate: deleteWorkProfile, isPending: isDeleting } =
    useDeleteWorkProfile();
  const { mutate: finishHSCV, isPending: isFinishing } = useFinishHSCV();
  const { data: listVBData, isLoading: isLoadingListVB } =
    useGetListVBByFolderId(folderId || "", 10, 1, !!folderId);
  const folderDetail = folderDetailData?.folderDetail;
  const listTrack = folderDetailData?.listTrack || [];
  const listVB = listVBData?.objList || [];

  const hasData = folderDetail && Object.keys(folderDetail).length > 0;

  const handleAddDocument = () => {
    setIsAddDocumentModalOpen(true);
  };

  const handleDeleteProfile = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (folderId) {
      deleteWorkProfile(
        {
          folderId: "",
          id: folderId,
          iconType: "FOLDER",
        },
        {
          onSuccess: () => {
            setIsDeleteModalOpen(false);
            onClose();
            if (onRefresh) {
              onRefresh();
            }
          },
        }
      );
    }
  };

  const handleFinishHSCV = () => {
    setIsFinishModalOpen(true);
  };

  const handleConfirmFinish = () => {
    if (folderId) {
      finishHSCV(folderId, {
        onSuccess: () => {
          setIsFinishModalOpen(false);
          onRefresh?.();
        },
      });
    }
  };

  const handleAddDocumentSubmit = (data: any) => {
    setIsAddDocumentModalOpen(false);
  };

  const danhMucVanBanColumns: Column<any>[] = [
    {
      header: "STT",
      className: "text-center w-16",
      accessor: (_, index: number) => index + 1,
    },
    {
      header: "Số Kí hiệu",
      className: "text-left",
      accessor: () => "",
    },
    {
      header: "Ngày văn bản",
      className: "text-left cursor-pointer hover:bg-gray-100",
      accessor: (item: any) => {
        if (!item.ngayTao) return "";
        const date = new Date(item.ngayTao);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
      },
    },
    {
      header: "Trích yếu - nội dung",
      className: "text-left cursor-pointer hover:bg-gray-100",
      accessor: (item: any) => item.name || "",
    },
    {
      header: "Đơn vị ban hành",
      className: "text-left cursor-pointer hover:bg-gray-100",
      accessor: () => "",
    },
    {
      header: "Nội dung văn bản",
      className: "text-left cursor-pointer hover:bg-gray-100",
      accessor: () => "",
    },
  ];

  const lichSuColumns: Column<any>[] = [
    {
      header: "STT",
      className: "text-center w-16",
      accessor: (_, index: number) => index + 1,
    },
    {
      header: "Người tương tác",
      className: "text-left",
      accessor: (item: any) => item.personName,
    },
    {
      header: "Lí do",
      className: "text-left",
      accessor: (item: any) => item.comment || "",
    },
    {
      header: "Hành động",
      className: "text-left",
      accessor: (item: any) => item.actionName,
    },
    {
      header: "Thời gian",
      className: "text-left",
      accessor: (item: any) => {
        if (!item.updateDate) return "";
        const date = new Date(item.updateDate);
        const day = String(date.getDate()).padStart(2, "0");
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const year = date.getFullYear();
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");
        return `${day}/${month}/${year} - ${hours}:${minutes}:${seconds}`;
      },
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-full max-h-[90vh] flex flex-col">
        <DialogHeader className="flex items-center justify-between border-b pb-4">
          <DialogTitle className="text-lg font-bold">
            Thông tin hồ sơ
          </DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-auto">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="DM_VAN_BAN_HS">
                Danh mục văn bản trong hồ sơ
              </TabsTrigger>
              <TabsTrigger value="CHI_TIET_HS">
                Thông tin chi tiết hồ sơ
              </TabsTrigger>
            </TabsList>

            <div className="tab-content">
              <TabsContent value="DM_VAN_BAN_HS">
                <div className="overflow-x-auto">
                  <Table
                    columns={danhMucVanBanColumns}
                    dataSource={listVB}
                    emptyText="Không tồn tại văn bản"
                    showPagination={false}
                    loading={isLoadingListVB}
                  />
                </div>
              </TabsContent>

              <TabsContent value="CHI_TIET_HS">
                <div className="space-y-4">
                  {hasData && (
                    <Table
                      columns={[
                        {
                          header: "",
                          className: "text-right w-[120px] flex-shrink-0",
                          accessor: (item: any) => (
                            <label className="text-sm font-bold text-black">
                              {item.label}:
                            </label>
                          ),
                        },
                        {
                          header: "",
                          className: "text-left",
                          accessor: (item: any) => (
                            <label className="text-sm text-black font-medium">
                              {item.value}
                            </label>
                          ),
                        },
                      ]}
                      dataSource={[
                        {
                          label: "Tiêu đề hồ sơ",
                          value:
                            folderDetail?.title && folderDetail?.fileCode
                              ? `${folderDetail.title} - ${folderDetail.fileCode}`
                              : "",
                        },
                        {
                          label: "Số lượng hồ sơ",
                          value: folderDetail?.totalDoc || 0,
                        },
                        {
                          label: "Ngày tạo",
                          value: folderDetail?.createDate
                            ? formatDate(folderDetail.createDate)
                            : "",
                        },
                        {
                          label: "Người tạo",
                          value: folderDetail?.createBy || "",
                        },
                      ]}
                      emptyText="Không có thông tin"
                      showPagination={false}
                    />
                  )}

                  <Table
                    columns={lichSuColumns}
                    dataSource={listTrack}
                    emptyText="Không có lịch sử tương tác"
                    showPagination={false}
                    loading={isLoadingFolderDetail}
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
        <div className="flex items-center justify-end gap-2 p-4 border-t bg-gray-50">
          <Button
            onClick={handleAddDocument}
            className="flex items-center gap-2 border border-blue-600 bg-white text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
            variant="outline"
          >
            <FileText size={18} />
            Thêm tài liệu
          </Button>

          <Button
            className="flex items-center gap-2 border border-blue-600 bg-white text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
            variant="outline"
          >
            <Trash2 size={18} />
            Xóa tài liệu
          </Button>

          {listVB && listVB.length > 0 && (
            <Button
              className="flex items-center gap-2 border border-blue-600 bg-white text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
              variant="outline"
              onClick={handleFinishHSCV}
            >
              <Check size={18} className="stroke-current" />
              Kết thúc hồ sơ
            </Button>
          )}

          <Button
            variant="outline"
            onClick={onClose}
            className="flex items-center gap-2 border border-blue-600 bg-white text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
          >
            <Power size={16} className="text-red-500" />
            Đóng
          </Button>
        </div>
      </DialogContent>

      <AddDocumentModal
        isOpen={isAddDocumentModalOpen}
        onClose={() => setIsAddDocumentModalOpen(false)}
        onSubmit={handleAddDocumentSubmit}
        folderId={folderId}
      />

      <ConfirmDeleteDialog
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        title="Hãy xác nhận"
        description={`Bạn có chắc chắn muốn xóa hồ sơ "${folderDetail?.title}" không?`}
        confirmText="Đồng ý"
        cancelText="Đóng"
        isLoading={isDeleting}
      />

      <ConfirmDeleteDialog
        isOpen={isFinishModalOpen}
        onOpenChange={setIsFinishModalOpen}
        onConfirm={handleConfirmFinish}
        title="Hãy xác nhận"
        description="Hồ sơ sẽ được chuyển sang xét duyệt"
        confirmText="Đồng ý"
        cancelText="Đóng"
        isLoading={isFinishing}
      />
    </Dialog>
  );
};

const tabs = [
  { id: "DANG_GQUYET", label: "Hồ sơ đang giải quyết", tabValue: 1 },
  { id: "DA_GQUYET", label: "Hồ sơ đã giải quyết", tabValue: 2 },
];

const getWorkProfileColumns = (
  currentPage: number,
  itemsPerPage: number
): Column<WorkProfile>[] => [
  {
    header: "STT",
    className: "text-center w-16",
    accessor: (_, index: number) =>
      (currentPage - 1) * itemsPerPage + index + 1,
  },
  {
    header: "Tiêu đề hồ sơ",
    className: "text-left w-80",
    accessor: (item: WorkProfile) => {
      const fileCode = (item as any).fileCode || "";
      return fileCode ? `${item.title} - ${fileCode}` : item.title;
    },
  },
  {
    header: "Thời gian hồ sơ",
    className: "text-center w-32",
    accessor: (item: WorkProfile) => formatDate(item.createDate),
  },
  {
    header: "Thời hạn bảo quản",
    className: "text-center w-40",
    accessor: (item: WorkProfile) => item.maintenanceObj,
  },
  {
    header: "Người duyệt",
    className: "text-center w-40",
    accessor: (item: WorkProfile) => item.userApprove,
  },
];

const WorkProfileManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState("DANG_GQUYET");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddDocumentModalOpen, setIsAddDocumentModalOpen] = useState(false);
  const [isHoSoModalOpen, setIsHoSoModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<any>(null);

  const clickTimerRef = useRef<NodeJS.Timeout | null>(null);
  const clickCountRef = useRef(0);

  const activeTabData = tabs.find((tab) => tab.id === activeTab);
  const tabValue = activeTabData?.tabValue || 1;

  const { data, isLoading, error } = useGetListHSCV(
    tabValue,
    currentPage,
    itemsPerPage
  );
  const { mutate: createWorkProfile, isPending: isCreating } =
    useCreateWorkProfile();
  const { mutate: updateWorkProfile, isPending: isUpdating } =
    useUpdateWorkProfile();
  const { mutate: deleteWorkProfile, isPending: isDeleting } =
    useDeleteWorkProfile();

  const dataSource = data?.content || data?.objList || [];
  const totalItems = data?.totalRecord || data?.totalElements || 0;

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setCurrentPage(1);
    setSelectedProfile(null);
  };

  const handleAddProfile = () => {
    setIsCreateModalOpen(true);
  };

  const handleCreateProfile = (data: any) => {
    const formatDateToDisplay = (dateStr: string) => {
      if (!dateStr) return null;
      const [year, month, day] = dateStr.split("-");
      return `${day}/${month}/${year}`;
    };

    const apiData = {
      fileCode: data.code,
      year: parseInt(data.year),
      fileNotation: data.fileNumber,
      title: data.title,
      headingsId: parseInt(data.headingId),
      maintenance: parseInt(data.maintenance),
      rights: data.usageMode || null,
      language: data.language || null,
      startTime: formatDateToDisplay(data.startDate),
      endTime: formatDateToDisplay(data.endDate),
      informationSign: data.infoCode || null,
      description: data.description || null,
      keyword: data.keywords || null,
      pageNumber: data.sheetCount ? parseInt(data.sheetCount) : null,
      pageAmount: data.pageCount ? parseInt(data.pageCount) : null,
      totalReliability: data.physicalStatus || null,
    };

    createWorkProfile(
      { data: apiData, approverId: data.approverId },
      {
        onSuccess: () => {
          setIsCreateModalOpen(false);
          setCurrentPage(1);
          setSelectedProfile(null);
        },
      }
    );
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (size: number) => {
    setItemsPerPage(size);
    setCurrentPage(1);
  };

  const handleProfileSelect = (profile: any) => {
    clickCountRef.current += 1;

    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }

    if (clickCountRef.current === 1) {
      clickTimerRef.current = setTimeout(() => {
        setSelectedProfile(profile);
        clickCountRef.current = 0;
        clickTimerRef.current = null;
      }, 300);
    } else if (clickCountRef.current === 2) {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
        clickTimerRef.current = null;
      }
      clickCountRef.current = 0;
      setSelectedProfile(profile);
      setIsHoSoModalOpen(true);
    }
  };

  const handleRefreshData = () => {
    setCurrentPage(1);
    setSelectedProfile(null);
  };

  const handleAddDocument = () => {
    setIsAddDocumentModalOpen(true);
  };

  const handleEditProfile = () => {
    setIsEditModalOpen(true);
  };

  const handleUpdateProfile = (data: any) => {
    const formatDateToDisplay = (dateStr: string) => {
      if (!dateStr) return null;
      const [year, month, day] = dateStr.split("-");
      return `${day}/${month}/${year}`;
    };

    const apiData = {
      id: selectedProfile.id,
      fileCode: data.code,
      year: parseInt(data.year),
      fileNotation: data.fileNumber,
      title: data.title,
      headingsId: parseInt(data.headingId),
      maintenance: parseInt(data.maintenance),
      rights: data.usageMode || null,
      language: data.language || null,
      startTime: formatDateToDisplay(data.startDate),
      endTime: formatDateToDisplay(data.endDate),
      informationSign: data.infoCode || null,
      description: data.description || null,
      keyword: data.keywords || null,
      pageNumber: data.sheetCount ? parseInt(data.sheetCount) : null,
      pageAmount: data.pageCount ? parseInt(data.pageCount) : null,
      totalReliability: data.physicalStatus || null,
    };

    updateWorkProfile(
      { data: apiData, approverId: data.approverId },
      {
        onSuccess: () => {
          setIsEditModalOpen(false);
          setSelectedProfile(null);
        },
      }
    );
  };

  const handleDeleteProfile = () => {
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedProfile) {
      deleteWorkProfile(
        {
          folderId: "",
          id: selectedProfile.id.toString(),
          iconType: "FOLDER",
        },
        {
          onSuccess: () => {
            setIsDeleteModalOpen(false);
            setSelectedProfile(null);
            setCurrentPage(1);
          },
        }
      );
    }
  };

  const handleAddDocumentSubmit = (data: any) => {
    setIsAddDocumentModalOpen(false);
  };

  return (
    <div className="min-h-screen">
      <BreadcrumbNavigation
        items={[{ label: "Hồ sơ lưu trữ" }]}
        currentPage="Hồ sơ công việc"
        showHome={false}
        className="ml-4"
      />

      <div className="mx-auto py-6 px-4">
        <div className="bg-white rounded-lg shadow">
          <ul className="flex border-b" role="tablist">
            {tabs.map((tab) => (
              <li key={tab.id} className="mr-1">
                <Button
                  role="tab"
                  aria-selected={activeTab === tab.id}
                  aria-controls={`${tab.id}-panel`}
                  onClick={() => handleTabChange(tab.id)}
                  variant="ghost"
                  className={`rounded-none px-6 py-3 font-medium transition-colors ${
                    activeTab === tab.id
                      ? "text-blue-600 border-b-2 border-blue-600"
                      : "text-gray-600 hover:text-blue-600 hover:bg-transparent"
                  }`}
                >
                  {tab.label}
                </Button>
              </li>
            ))}
          </ul>
          <div className="p-6">
            {tabs.map((tab) => (
              <div
                key={tab.id}
                role="tabpanel"
                id={`${tab.id}-panel`}
                aria-labelledby={tab.id}
                className={activeTab === tab.id ? "block" : "hidden"}
              >
                {tab.id === "DANG_GQUYET" && (
                  <div className="flex flex-wrap gap-2 mb-4">
                    <Button
                      onClick={handleAddProfile}
                      className="flex items-center gap-2 border border-blue-600 bg-white text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                      variant="outline"
                    >
                      <FolderPlus size={18} />
                      Thêm hồ sơ
                    </Button>

                    {selectedProfile && (
                      <>
                        <Button
                          onClick={handleAddDocument}
                          className="flex items-center gap-2 border border-blue-600 bg-white text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                          variant="outline"
                        >
                          <FileText size={18} />
                          Thêm tài liệu
                        </Button>

                        <Button
                          onClick={handleEditProfile}
                          className="flex items-center gap-2 border border-blue-600 bg-white text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                          variant="outline"
                        >
                          <Edit size={18} />
                          Sửa hồ sơ
                        </Button>

                        <Button
                          onClick={handleDeleteProfile}
                          className="flex items-center gap-2 border border-blue-600 bg-white text-blue-600 hover:bg-blue-600 hover:text-white transition-colors"
                          variant="outline"
                        >
                          <Trash2 size={18} />
                          Xóa hồ sơ
                        </Button>
                      </>
                    )}
                  </div>
                )}

                <Table
                  columns={getWorkProfileColumns(currentPage, itemsPerPage)}
                  dataSource={dataSource}
                  emptyText="Không tồn tại văn bản"
                  loading={isLoading}
                  onRowClick={(record) => handleProfileSelect(record)}
                  currentPage={currentPage}
                  onPageChange={handlePageChange}
                  showPagination={true}
                  totalItems={totalItems}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={handleItemsPerPageChange}
                />

                {error && (
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-red-700">
                    Lỗi: {error.message}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <CreateWorkProfileModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateProfile}
      />

      <EditWorkProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateProfile}
        folderId={selectedProfile?.id || ""}
      />

      <ConfirmDeleteDialog
        isOpen={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        title="Hãy xác nhận"
        description={`Bạn có chắc chắn muốn xóa hồ sơ "${selectedProfile?.title}" không?`}
        confirmText="Đồng ý"
        cancelText="Đóng"
        isLoading={isDeleting}
      />

      <AddDocumentModal
        isOpen={isAddDocumentModalOpen}
        onClose={() => setIsAddDocumentModalOpen(false)}
        onSubmit={handleAddDocumentSubmit}
        folderId={selectedProfile?.id}
      />

      <HoSoModal
        isOpen={isHoSoModalOpen}
        onClose={() => setIsHoSoModalOpen(false)}
        folderId={selectedProfile?.id?.toString()}
        onRefresh={handleRefreshData}
      />
    </div>
  );
};

export default function WorkProfilePage() {
  return <WorkProfileManager />;
}
