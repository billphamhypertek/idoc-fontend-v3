"use client";

import DailyReport from "./DailyReport";
import { useState, useEffect } from "react";
import {
  useSearchUnconfirmedReport,
  useSearchVerifiedReport,
  useSearchTitleList,
  useSearchSignerList,
  useExportAllReports,
  useGetSignerReport,
  useExportReport,
  useApproveReport,
  useRejectReport,
  useDeleteReport,
} from "@/hooks/data/report-action.data";
import {
  REPORT_TYPE,
  SearchDailyReport,
  TabNames,
} from "@/definitions/types/report.type";
import { useRouter } from "next/navigation";
import { saveFile, canViewNoStatus, handleError } from "@/utils/common.utils";
import { viewFile, downloadFile } from "@/utils/file.utils";
import { Constant } from "@/definitions/constants/constant";
import { toast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../ui/tooltip";
import {
  Eye,
  Check,
  XCircle,
  Edit,
  Trash2,
  FileText,
  Paperclip,
} from "lucide-react";
import ConfirmDeleteDialog from "../common/ConfirmDeleteDialog";
import DailyReportAttachmentInfo from "./DailyReportAttachmentInfo";
import { Button } from "../ui/button";
import { ToastUtils } from "@/utils/toast.utils";

interface DailyReportPageProps {
  reportType: REPORT_TYPE;
}

export default function DailyReportPage({ reportType }: DailyReportPageProps) {
  const router = useRouter();
  const [showPagination, setShowPagination] = useState<boolean>(false);
  const [search, setSearch] = useState<SearchDailyReport>({
    reportType,
    type: "WEEK",
    organization: "",
  });

  const [currentPage, setCurrentPage] = useState<number>(1);
  const [currentTab, setCurrentTab] = useState<string>(
    TabNames.BAO_CAO_CHUA_XAC_THUC
  );

  const [searchField, setSearchField] = useState({
    page: 1,
    unConfirm: 1,
    confirm: 2,
    pageSize: 10,
    direction: "DESC",
    sortBy: "",
    currentTab: TabNames.BAO_CAO_CHUA_XAC_THUC,
  });

  const [showDialog, setShowDialog] = useState<boolean>(false);
  const [dialogConfig, setDialogConfig] = useState<{
    title: string;
    description: string;
    confirmText: string;
    cancelText: string;
    action: "approve" | "reject" | "delete";
    reportId: number;
  } | null>(null);

  // Attachment modal state
  const [showAttachmentModal, setShowAttachmentModal] =
    useState<boolean>(false);
  const [selectedReport, setSelectedReport] = useState<any>(null);

  const typeUrl = reportType === REPORT_TYPE.REPORT_GOV ? "gov" : "par";

  const getUnconfirmedSearchPayload = (): SearchDailyReport => ({
    ...search,
    organization: search.organization === "" ? "" : search.organization,
    status: searchField.unConfirm, // 1 = unconfirmed
  });

  const getVerifiedSearchPayload = (): SearchDailyReport => ({
    ...search,
    organization: search.organization === "" ? "" : search.organization,
    status: searchField.confirm, // 2 = confirmed
  });

  const { data: unconfirmedData, isLoading: isLoadingUnconfirmed } =
    useSearchUnconfirmedReport(
      getUnconfirmedSearchPayload(),
      currentPage,
      currentTab === TabNames.BAO_CAO_CHUA_XAC_THUC
    );

  const { data: verifiedData, isLoading: isLoadingVerified } =
    useSearchVerifiedReport(
      getVerifiedSearchPayload(),
      currentPage,
      currentTab === TabNames.BAO_CAO_DA_XAC_THUC
    );

  const { data: titleListData, isLoading: isLoadingTitleList } =
    useSearchTitleList(currentTab === TabNames.DANH_MUC_NHAN_DE);

  const { data: signerListData, isLoading: isLoadingSignerList } =
    useGetSignerReport(
      "",
      currentPage,
      searchField.pageSize,
      currentTab === TabNames.DANH_MUC_NGUOI_KY
    );

  const exportAllMutation = useExportAllReports();
  const exportReportMutation = useExportReport();
  const approveReportMutation = useApproveReport();
  const rejectReportMutation = useRejectReport();
  const deleteReportMutation = useDeleteReport();

  // Handlers
  const handleSearchChange = (searchUpdate: Partial<SearchDailyReport>) => {
    setSearch((prev) => ({ ...prev, ...searchUpdate }));
    setCurrentPage(1);
    setSearchField((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSearchField((prev) => ({ ...prev, page }));
  };

  const handleTabChange = (tabId: string) => {
    setCurrentTab(tabId);
    setCurrentPage(1);
    setSearchField((prev) => ({
      ...prev,
      currentTab: tabId as TabNames,
      page: 1,
    }));
  };

  const handleExportAll = async () => {
    let exportStatus: number;
    if (
      currentTab === TabNames.BAO_CAO_CHUA_XAC_THUC ||
      currentTab === TabNames.DANH_MUC_NHAN_DE
    ) {
      exportStatus = 1;
    } else {
      exportStatus = 2;
    }

    const exportPayload = {
      ...search,
      status: exportStatus,
    };

    const response = await exportAllMutation.mutateAsync(exportPayload);
    if (response) {
      saveFile("Tổng hợp báo cáo.docx", response);
    } else {
      ToastUtils.error("Lỗi khi tải xuống tổng hợp báo cáo");
    }
  };

  const handleInsertReport = () => {
    router.push(`/daily-report/${typeUrl}/report-insert`);
  };

  // New handlers for missing features
  const handleViewDetail = async (id: number) => {
    try {
      const response = await exportReportMutation.mutateAsync(id);
      if (response) {
        saveFile("Báo cáo.docx", response);
      } else {
        ToastUtils.error("Lỗi khi tải xuống báo cáo");
      }
    } catch (error) {
      ToastUtils.error("Lỗi khi tải xuống báo cáo");
    }
  };

  // Optimized function to handle all 3 actions with switch case
  const handleReportAction = (
    action: "approve" | "reject" | "delete",
    id: number
  ) => {
    const configs = {
      approve: {
        title: "Duyệt báo cáo",
        description: "Bạn có chắc chắn duyệt báo cáo này?",
        confirmText: "Duyệt",
        cancelText: "Hủy",
      },
      reject: {
        title: "Hủy duyệt báo cáo",
        description: "Bạn có chắc chắn hủy duyệt báo cáo này?",
        confirmText: "Hủy duyệt",
        cancelText: "Đóng",
      },
      delete: {
        title: "Xóa báo cáo",
        description: "Bạn có chắc chắn muốn xóa báo cáo này?",
        confirmText: "Xóa",
        cancelText: "Hủy",
      },
    };

    const config = configs[action];
    setDialogConfig({
      ...config,
      action,
      reportId: id,
    });
    setShowDialog(true);
  };

  const handleApproveReport = (id: number) => {
    handleReportAction("approve", id);
  };

  const handleRejectReport = (id: number) => {
    handleReportAction("reject", id);
  };

  const handleDeleteReport = (id: number) => {
    handleReportAction("delete", id);
  };

  const handleEditReport = (id: number) => {
    router.push(`/daily-report/${typeUrl}/report-update/${id}`);
  };

  const handleConfirmAction = async () => {
    if (!dialogConfig) return;

    try {
      switch (dialogConfig.action) {
        case "approve":
          await approveReportMutation.mutateAsync(dialogConfig.reportId);
          break;
        case "reject":
          await rejectReportMutation.mutateAsync(dialogConfig.reportId);
          break;
        case "delete":
          await deleteReportMutation.mutateAsync(dialogConfig.reportId);
          break;
        default:
          ToastUtils.error("Lỗi không xác định được hành động");
      }
    } catch (error) {
      handleError(error);
    } finally {
      setShowDialog(false);
      setDialogConfig(null);
    }
  };

  // Helper functions
  const isView = (fileName: string) => canViewNoStatus(fileName);

  const handleViewFile = async (file: any) => {
    try {
      await viewFile(file, Constant.ATTACHMENT_DOWNLOAD_TYPE.REPORT);
    } catch (error) {
      ToastUtils.error("Lỗi không tìm thấy tệp phù hợp");
    }
  };

  const handleDownloadFile = async (fileName: string, encrypt: boolean) => {
    try {
      await downloadFile(
        fileName,
        Constant.ATTACHMENT_DOWNLOAD_TYPE.REPORT,
        encrypt
      );
    } catch (error) {
      ToastUtils.error("Lỗi không tìm thấy tệp phù hợp");
    }
  };

  const handleOpenAttachmentInfo = (report: any) => {
    setSelectedReport(report);
    setShowAttachmentModal(true);
  };

  const handleCloseAttachmentModal = (open: boolean) => {
    setShowAttachmentModal(open);
    if (!open) {
      setSelectedReport(null);
    }
  };

  const isUnRead = (report: any) => {
    return (
      currentTab === TabNames.BAO_CAO_CHUA_XAC_THUC &&
      report &&
      report.read === false
    );
  };

  const getCurrentTabData = () => {
    switch (currentTab) {
      case TabNames.BAO_CAO_CHUA_XAC_THUC:
        return unconfirmedData?.objList || [];
      case TabNames.BAO_CAO_DA_XAC_THUC:
        return verifiedData?.objList || [];
      case TabNames.DANH_MUC_NHAN_DE:
        return titleListData || [];
      case TabNames.DANH_MUC_NGUOI_KY:
        return signerListData?.objList || [];
      default:
        return [];
    }
  };

  const getCurrentTabTotalItems = () => {
    switch (currentTab) {
      case TabNames.BAO_CAO_CHUA_XAC_THUC:
        return unconfirmedData?.totalRecord || 0;
      case TabNames.BAO_CAO_DA_XAC_THUC:
        return verifiedData?.totalRecord || 0;
      case TabNames.DANH_MUC_NHAN_DE:
        return titleListData?.length || 0;
      case TabNames.DANH_MUC_NGUOI_KY:
        return signerListData?.totalRecord || 0;
      default:
        return 0;
    }
  };

  const getCurrentTabLoading = () => {
    switch (currentTab) {
      case TabNames.BAO_CAO_CHUA_XAC_THUC:
        return isLoadingUnconfirmed;
      case TabNames.BAO_CAO_DA_XAC_THUC:
        return isLoadingVerified;
      case TabNames.DANH_MUC_NHAN_DE:
        return isLoadingTitleList;
      case TabNames.DANH_MUC_NGUOI_KY:
        return isLoadingSignerList;
      default:
        return false;
    }
  };

  const columns = [
    {
      header: "STT",
      accessor: (item: any, index: number) => (
        <span className="text-center text-sm">
          {(currentPage - 1) * 10 + index + 1}
        </span>
      ),
      className: "w-3 text-center border-r",
    },
    {
      header: "Tên báo cáo",
      accessor: (item: any) => (
        <span className={`${isUnRead(item) ? "font-bold" : ""}`}>
          {item.title}
        </span>
      ),
      className: "w-20 border-r text-start",
    },
    {
      header: "Đơn vị",
      accessor: (item: any) => item.parentOrgName,
      className: "w-10 text-center border-r",
    },
    {
      header: "Đính kèm",
      accessor: (item: any) => {
        if (!item.attachments || item.attachments.length === 0) {
          return <span className="text-gray-400">-</span>;
        }

        if (item.attachments.length === 1) {
          const attachment = item.attachments[0];
          return (
            <div className="flex justify-center">
              {isView(attachment.name) ? (
                <Button
                  onClick={() => handleViewFile(attachment)}
                  className="text-yellow-600 hover:text-yellow-800 bg-transparent shadow-none border-none hover:bg-transparent"
                  title={attachment.displayName}
                >
                  <Paperclip className="w-4 h-4 text-blue-600" />
                </Button>
              ) : (
                <Button
                  onClick={() =>
                    handleDownloadFile(attachment.name, attachment.encrypt)
                  }
                  className="text-yellow-600 hover:text-yellow-800 bg-transparent shadow-none border-none hover:bg-transparent"
                  title={attachment.displayName}
                >
                  <Paperclip className="w-4 h-4 text-blue-600" />
                </Button>
              )}
            </div>
          );
        }

        return (
          <div className="flex justify-center">
            <Button
              onClick={() => handleOpenAttachmentInfo(item)}
              className="text-yellow-600 hover:text-yellow-800 bg-transparent shadow-none border-none hover:bg-transparent"
              title={`${item.attachments.length} files`}
            >
              <Paperclip className="w-4 h-4 text-blue-600" />
            </Button>
          </div>
        );
      },
      className: "w-10 text-center border-r",
    },
    {
      header: "Ngày nhận",
      accessor: (item: any) => (
        <span className="text-center text-sm">
          {item.createDate
            ? new Date(item.createDate).toLocaleDateString("vi-VN")
            : ""}
        </span>
      ),
      className: "w-10 text-center border-r",
    },
    {
      header: "Ngày xác nhận",
      accessor: (item: any) => (
        <span className="text-center text-sm">
          {item.confirmDate
            ? new Date(item.confirmDate).toLocaleDateString("vi-VN")
            : ""}
        </span>
      ),
      className: "w-10 text-center border-r",
    },
    {
      header: "Thao tác",
      accessor: (item: any) => (
        <div className="flex justify-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  onClick={() => handleViewDetail(item.id)}
                  className="text-blue-600 hover:text-blue-800 p-1 bg-transparent shadow-none border-none hover:bg-transparent"
                  title="Xem chi tiết"
                >
                  <Eye className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Xem chi tiết</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {item.permissionDto?.approveButton && item.status === 1 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => handleApproveReport(item.id)}
                    className="text-green-600 hover:text-green-800 p-1 bg-transparent shadow-none border-none hover:bg-transparent"
                    title="Duyệt báo cáo"
                  >
                    <Check className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Duyệt báo cáo</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {item.permissionDto?.approveButton && item.status === 2 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => handleRejectReport(item.id)}
                    className="text-red-600 hover:text-red-800 p-1 bg-transparent shadow-none border-none hover:bg-transparent"
                    title="Hủy duyệt"
                  >
                    <XCircle className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Hủy duyệt</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {item.permissionDto?.editButton && item.status === 1 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => handleEditReport(item.id)}
                    className="text-blue-600 hover:text-blue-800 p-1 bg-transparent shadow-none border-none hover:bg-transparent"
                    title="Sửa"
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Sửa</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}

          {item.permissionDto?.deleteButton && item.status === 1 && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => handleDeleteReport(item.id)}
                    className="text-red-600 hover:text-red-800 p-1 bg-transparent shadow-none border-none hover:bg-transparent"
                    title="Xóa"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Xóa</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
      ),
      className: "w-10 text-center border-r",
    },
  ];

  const titleListColumns = [
    {
      header: "STT",
      accessor: (item: any, index: number) => (
        <span className="text-sm text-gray-600">{index + 1}</span>
      ),
      className: "w-3 text-center border-r",
    },
    {
      header: "Tên danh mục ",
      accessor: "name",
      className: "w-40 border-r text-start",
    },
    {
      header: "Mã danh mục",
      accessor: "syncCode",
      className: "w-5 text-center border-r",
    },
    {
      header: "Thứ tự ưu tiên",
      accessor: "order",
      className: "w-5 text-center border-r",
    },
  ];

  const signerListColumns = [
    {
      header: "STT",
      accessor: (item: any, index: number) => (
        <span className="text-sm text-gray-600">
          {(currentPage - 1) * searchField.pageSize + index + 1}
        </span>
      ),
      className: "w-3 text-center border-r",
    },
    {
      header: "Họ tên",
      accessor: "fullName",
      className: "w-20 border-r text-start",
    },
    {
      header: "Đơn vị",
      accessor: (item: any) => item.orgModel?.name,
      className: "w-10 text-center border-r",
    },
    {
      header: "Chức danh",
      accessor: (item: any) => item.positionModel?.name,
      className: "w-10 text-center border-r",
    },
  ];

  const getCurrentTabColumns = () => {
    switch (currentTab) {
      case TabNames.BAO_CAO_CHUA_XAC_THUC:
        return columns;
      case TabNames.BAO_CAO_DA_XAC_THUC:
        return columns;
      case TabNames.DANH_MUC_NHAN_DE:
        return titleListColumns;
      case TabNames.DANH_MUC_NGUOI_KY:
        return signerListColumns;
      default:
        return [];
    }
  };

  useEffect(() => {
    switch (currentTab) {
      case TabNames.BAO_CAO_CHUA_XAC_THUC:
      case TabNames.BAO_CAO_DA_XAC_THUC:
      case TabNames.DANH_MUC_NGUOI_KY:
        setShowPagination(true);
        break;
      case TabNames.DANH_MUC_NHAN_DE:
        setShowPagination(false);
        break;
      default:
        setShowPagination(false);
    }
  }, [currentTab]);

  const tabs = [
    {
      id: TabNames.BAO_CAO_CHUA_XAC_THUC,
      title: "Báo cáo chưa xác nhận",
      disabled: false,
    },
    {
      id: TabNames.BAO_CAO_DA_XAC_THUC,
      title: "Báo cáo đã xác nhận",
      disabled: false,
    },
    {
      id: TabNames.DANH_MUC_NHAN_DE,
      title: "Danh mục nhan đề",
      disabled: false,
    },
    {
      id: TabNames.DANH_MUC_NGUOI_KY,
      title: "Danh mục người ký",
      disabled: false,
    },
  ];

  return (
    <>
      <DailyReport
        columns={getCurrentTabColumns()}
        tabs={tabs}
        data={getCurrentTabData()}
        totalItems={getCurrentTabTotalItems()}
        currentPage={currentPage}
        isLoading={getCurrentTabLoading()}
        onSearchChange={handleSearchChange}
        onPageChange={handlePageChange}
        onTabChange={handleTabChange}
        onExportAll={handleExportAll}
        onInsertReport={handleInsertReport}
        showPagination={showPagination}
      />

      {/* Confirm Dialog */}
      {dialogConfig && (
        <ConfirmDeleteDialog
          isOpen={showDialog}
          onOpenChange={setShowDialog}
          onConfirm={handleConfirmAction}
          title={dialogConfig.title}
          description={dialogConfig.description}
          confirmText={dialogConfig.confirmText}
          cancelText={dialogConfig.cancelText}
        />
      )}

      {/* Attachment Modal */}
      {selectedReport && (
        <DailyReportAttachmentInfo
          attachments={selectedReport.attachments || []}
          isOpen={showAttachmentModal}
          onOpenChange={handleCloseAttachmentModal}
          constant={Constant.ATTACHMENT_DOWNLOAD_TYPE.REPORT}
        />
      )}
    </>
  );
}
