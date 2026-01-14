import React, { useEffect, useState } from "react";
import {
  CustomDialogContent,
  Dialog,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  EyeIcon,
  FileCheck,
  Paperclip,
  Save,
  Trash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { Column } from "@/definitions";
import { Table } from "@/components/ui/table";
import { DocumentTemplate } from "@/definitions/types/document.type";
import { Constant } from "@/definitions/constants/constant";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useDocumentTemplate,
  useDraftDocumentTemplate,
} from "@/hooks/data/common.data";
import { CommonService } from "@/services/common";
import { ToastUtils } from "@/utils/toast.utils";
import { viewFile } from "@/utils/file.utils";
import { getExtension } from "@/utils/common.utils";
import { Label } from "@/components/ui/label";
import { TemplateService } from "@/services/template.service";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";

interface Props {
  setData: (item: DocumentTemplate[]) => void;
  isOpen: boolean;
  onOpenChange: (v: boolean) => void;
  onClose: () => void;
  type?: string;
}

const tabValue = {
  TAB_VBM: "TAB_VBM",
  TAB_VBMN: "TAB_VBMN",
};
const typeList = [
  { value: "VAN_BAN_DI", name: "Văn bản đi" },
  { value: "VAN_BAN_NOI_BO", name: "Văn bản nội bộ" },
  { value: "VAN_BAN_SOAN_THAO", name: "Kế hoạch" },
  { value: "GIAO_VIEC", name: "Giao việc" },
];
const getTypeString = (
  value: string
): { value: string; name: string } | undefined => {
  return typeList.find((item) =>
    value ? item.value === value : item.value === typeTemplate
  );
};
const typeTemplate = Constant.TYPE_TEMPLATE.VAN_BAN_DI;

export function SelectTemplateDialog({
  setData,
  isOpen,
  onOpenChange,
  onClose,
  type = typeTemplate,
}: Props) {
  const [activeTab, setActiveTab] = useState(tabValue.TAB_VBM);
  const [currentPage, setCurrentPage] = useState(1);
  const [templateSelect, setTemplateSelect] = useState<DocumentTemplate[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] =
    useState<DocumentTemplate | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setCurrentPage(1);
      setTemplateSelect([]);
      setActiveTab(tabValue.TAB_VBM);
      setTemplateToDelete(null);
      setIsDeleting(false);
    }
  }, [isOpen]);

  // Rename dialog states
  const [confirmRenameDialogOpen, setConfirmRenameDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [templateToRename, setTemplateToRename] =
    useState<DocumentTemplate | null>(null);
  const [newFileName, setNewFileName] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const {
    data: templateData,
    isLoading: templateLoading,
    error: templateError,
    refetch: refetchTemplate,
  } = useDocumentTemplate({
    type: type,
    page: currentPage,
  });
  const {
    data: draftTemplateData,
    isLoading: draftTemplateLoading,
    error: draftTemplateError,
    refetch: refetchDraftTemplate,
  } = useDraftDocumentTemplate(
    {
      type: type,
      page: currentPage,
    },
    activeTab === tabValue.TAB_VBMN
  );
  const handleCancel = () => {
    onClose();
  };
  const handleSubmit = () => {
    if (activeTab === tabValue.TAB_VBM && templateSelect.length > 0) {
      // For template tab with selected items, show confirm dialog first
      setConfirmRenameDialogOpen(true);
    } else {
      // For draft tab or no selection, proceed normally
      setData(templateSelect);
      onClose();
    }
  };
  const handleToggle = (value: DocumentTemplate, checked: boolean) => {
    if (checked) {
      // Single select: replace with only this value
      setTemplateSelect([value]);
    } else {
      // Uncheck: remove it
      setTemplateSelect((prev) => prev.filter((item) => item !== value));
    }
  };
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setCurrentPage(1);
  };

  const handleViewFile = (item: any) => {
    viewFile(item, Constant.ATTACHMENT_DOWNLOAD_TYPE.TEMPLATE);
  };

  const handleDeleteClick = (item: DocumentTemplate) => {
    setTemplateToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!templateToDelete) return;

    setIsDeleting(true);
    try {
      await CommonService.deleteTemplate(type, templateToDelete.id.toString());

      // Show success toast
      ToastUtils.templateDeleteSuccess();

      // Remove from selection if it was selected
      setTemplateSelect((prev) =>
        prev.filter((template) => template.id !== templateToDelete.id)
      );

      // Reload the list
      if (activeTab === tabValue.TAB_VBM) {
        refetchTemplate();
      } else {
        refetchDraftTemplate();
      }

      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    } catch (error) {
      console.error("Error deleting template:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setTemplateToDelete(null);
  };

  // Rename functions
  const handleConfirmRename = () => {
    setConfirmRenameDialogOpen(false);
    const firstTemplate = templateSelect[0];
    setTemplateToRename(firstTemplate);
    setRenameDialogOpen(true);
  };

  const handleCancelRename = async () => {
    setConfirmRenameDialogOpen(false);
    const clonedTemplate: any = await Promise.all(
      templateSelect.map(async (template) => {
        const newName = `${template.displayName}`;
        return await TemplateService.cloneTemplate(type, template.id, newName);
      })
    );
    setData(clonedTemplate);
    onClose();
  };

  const handleRenameConfirm = async () => {
    if (!templateToRename || !newFileName.trim()) return;

    setIsUploading(true);
    try {
      const extension = getExtension(templateSelect?.[0].name) || "docx";
      // Call combined API that uploads file and applies template with new name
      const result = await CommonService.uploadAndApplyTemplate(
        type,
        templateToRename.id.toString(),
        newFileName.trim() + "." + extension
      );

      // Update the selected template with new name
      const renamedTemplate = {
        ...templateToRename,
        name: newFileName.trim() + "." + extension,
        displayName: newFileName.trim() + "." + extension,
        ...result, // Include any additional data from API response
      };

      // Replace the template in selection with renamed version
      setTemplateSelect((prev) =>
        prev.map((template) =>
          template === templateToRename ? renamedTemplate : template
        )
      );

      setRenameDialogOpen(false);
      setTemplateToRename(null);
      setNewFileName("");

      // Save and close dialog
      setData(
        templateSelect.map((template) =>
          template === templateToRename ? renamedTemplate : template
        )
      );
      onClose();

      ToastUtils.templateRenameSuccess();
    } catch (error) {
      console.error("Error uploading file and using template:", error);
      ToastUtils.templateRenameError();
    } finally {
      setIsUploading(false);
    }
  };

  const handleRenameCancel = () => {
    setRenameDialogOpen(false);
    setTemplateToRename(null);
    setNewFileName("");
  };

  const columns: Column<DocumentTemplate>[] = [
    {
      header: "STT",
      className: "text-center py-2 w-16",
      accessor: (item: DocumentTemplate, index: number) => (
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm font-medium">
            {(currentPage - 1) * Constant.PAGING.SIZE + index + 1}
          </span>
        </div>
      ),
    },
    {
      header: "Tên văn bản mẫu",
      className: "text-left py-2 w-32",
      accessor: (item: DocumentTemplate) => (
        <div className="flex items-center">
          <span className="text-sm font-medium">{item.displayName}</span>
        </div>
      ),
    },
    {
      header: "Loại văn bản mẫu",
      className: "text-center py-2 w-24",
      accessor: (item: DocumentTemplate) => (
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm font-medium">
            {getTypeString(item.docType)?.name}
          </span>
        </div>
      ),
    },
    {
      header: "Xem",
      className: "text-center py-2 w-16",
      accessor: (item: DocumentTemplate) => (
        <div className="flex items-center justify-center gap-2">
          <span className="text-sm font-medium">
            <EyeIcon
              className="w-4 h-4 cursor-pointer text-blue-600 hover:text-blue-800"
              onClick={() => handleViewFile(item)}
            />
          </span>
        </div>
      ),
    },
    {
      header: "Chọn",
      className: "text-center py-2 w-20",
      accessor: (item: DocumentTemplate) => (
        <div className="flex items-center justify-center gap-2">
          <Input
            type="checkbox"
            className="w-4 h-4"
            checked={templateSelect.includes(item)}
            onChange={(e) => {
              if (activeTab === tabValue.TAB_VBM) {
                // For template tab, normal toggle
                handleToggle(item, e.target.checked);
              } else {
                // For draft tab, normal toggle
                handleToggle(item, e.target.checked);
              }
            }}
          />
          {activeTab === tabValue.TAB_VBMN && (
            <Trash
              className="w-4 h-4 cursor-pointer text-red-600 hover:text-red-800"
              onClick={() => handleDeleteClick(item)}
            />
          )}
        </div>
      ),
    },
  ];
  const tableData =
    activeTab === tabValue.TAB_VBM
      ? (templateData?.content ?? [])
      : (draftTemplateData?.content ?? []);
  const totalElement =
    activeTab === tabValue.TAB_VBM
      ? (templateData?.totalElements ?? 0)
      : (draftTemplateData?.totalElements ?? 0);
  const totalPage =
    activeTab === tabValue.TAB_VBM
      ? (templateData?.totalPages ?? 0)
      : (draftTemplateData?.totalPages ?? 0);
  const tableLoading =
    activeTab === tabValue.TAB_VBM ? templateLoading : draftTemplateLoading;
  const tableError =
    activeTab === tabValue.TAB_VBM ? templateError : draftTemplateError;

  useEffect(() => {
    setTemplateSelect([]);
  }, [isOpen]);
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <CustomDialogContent className="max-w-5xl max-h-[75vh] overflow-y-auto">
        <DialogHeader className="pb-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <Paperclip className="w-4 h-4 mr-2 text-blue-600" />
                Chọn văn bản mẫu
              </DialogTitle>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="h-9 px-3 text-sm font-medium border-gray-300 hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Hủy
              </Button>
              <Button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-3 text-sm font-medium"
              >
                <Save className="w-4 h-4 mr-1" />
                Lưu
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-3 py-3">
          <Tabs
            value={activeTab}
            onValueChange={handleTabChange}
            className="mb-3"
          >
            <TabsList className="inline-flex h-9 w-auto p-1 bg-gray-100 rounded-lg">
              <TabsTrigger
                value={tabValue.TAB_VBM}
                className="px-4 py-1 text-sm font-medium rounded-md transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600"
              >
                Văn bản mẫu
              </TabsTrigger>
              <TabsTrigger
                value={tabValue.TAB_VBMN}
                className="px-4 py-1 text-sm font-medium rounded-md transition-all duration-200 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-blue-600"
              >
                Văn bản mẫu nháp
              </TabsTrigger>
            </TabsList>
            <TabsContent value={activeTab} className="mt-3">
              <Table
                sortable={true}
                columns={columns}
                dataSource={tableData}
                loading={tableLoading}
                totalItems={totalElement}
                itemsPerPage={10}
                showPagination={true}
                showPageSize={false}
                currentPage={currentPage}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </TabsContent>
          </Tabs>
        </div>
      </CustomDialogContent>

      {/* Delete Confirmation Dialog */}
      <ConfirmDeleteDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Hãy xác nhận"
        description="Bạn chắc chắn muốn xóa tệp này?"
        confirmText="Đồng ý"
        cancelText="Đóng"
        isLoading={isDeleting}
      />

      {/* Confirm Rename Dialog */}
      <Dialog
        open={confirmRenameDialogOpen}
        onOpenChange={setConfirmRenameDialogOpen}
      >
        <CustomDialogContent className="max-w-sm max-h-[40vh]">
          <DialogHeader className="pb-2">
            <DialogTitle className="text-base font-semibold text-gray-900">
              Hãy xác nhận
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <p className="text-sm text-gray-600">Bạn có muốn đổi tên tệp?</p>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleCancelRename}
              className="h-9 px-3 text-sm font-medium border-gray-300 hover:bg-gray-50"
            >
              Đóng
            </Button>
            <Button
              onClick={handleConfirmRename}
              className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-3 text-sm font-medium"
            >
              <FileCheck className="w-4 h-4" />
              Đồng ý
            </Button>
          </div>
        </CustomDialogContent>
      </Dialog>

      {/* Rename Dialog */}
      <Dialog open={renameDialogOpen} onOpenChange={setRenameDialogOpen}>
        <CustomDialogContent className="max-w-sm max-h-[50vh] !gap-2">
          <DialogHeader>
            <DialogTitle className="text-base font-semibold text-gray-900 mb-2">
              Đổi tên tệp
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="fileName" className="font-bold">
              Tên tệp
            </Label>
            <Input
              type="text"
              placeholder="Nhập tên tệp"
              value={newFileName}
              onChange={(e) => {
                setNewFileName(e.target.value);
              }}
              className="w-full !mt-[5px]"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={handleRenameCancel}
              className="h-9 px-3 text-sm font-medium border-gray-300 hover:bg-gray-50"
            >
              Hủy
            </Button>
            <Button
              onClick={handleRenameConfirm}
              className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-3 text-sm font-medium"
              disabled={!newFileName.trim() || isUploading}
            >
              {isUploading ? "Đang tải..." : "Lưu"}
            </Button>
          </div>
        </CustomDialogContent>
      </Dialog>
    </Dialog>
  );
}
