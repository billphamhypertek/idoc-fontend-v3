import React, { useState, useEffect } from "react";
import {
  CustomDialogContent,
  Dialog,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  TableBase,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  X,
  Eye,
  Trash2,
  FileCheck,
  ChevronLeft,
  ChevronRight,
  Paperclip,
} from "lucide-react";
import { uploadFileService } from "@/services/file.service";
import { ATTACHMENT_DOWNLOAD_TYPE } from "@/definitions/constants/common.constant";
import ChangeFilenameDialog from "./ChangeFilenameDialog";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import {
  TemplateService,
  TemplateParams,
  Template,
} from "@/services/template.service";
import { Constant } from "@/definitions/constants/constant";
import { handleError } from "@/utils/common.utils";

type TemplateDialogProps = {
  open: boolean;
  onClose: () => void;
  onSelectTemplate: (template: Template) => void;
};

const TemplateDialog: React.FC<TemplateDialogProps> = ({
  open,
  onClose,
  onSelectTemplate,
}) => {
  const [activeTab, setActiveTab] = useState("TAB_VBM");
  const [templateList, setTemplateList] = useState<Template[]>([]);
  const [templateDraftList, setTemplateDraftList] = useState<Template[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isChangeFilenameDialogOpen, setIsChangeFilenameDialogOpen] =
    useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(
    null
  );
  const [searchField, setSearchField] = useState<TemplateParams>({
    type: Constant.TYPE_TEMPLATE.GIAO_VIEC,
    page: 1,
    sortBy: "",
    totalRecord: 0,
    size: Constant.PAGING.SIZE,
  });

  useEffect(() => {
    if (open) {
      loadTemplates();
      setSelectedTemplate(null);
    }
  }, [open, activeTab, searchField.page]);

  const loadTemplates = async () => {
    setIsLoading(true);
    try {
      if (activeTab === "TAB_VBM") {
        const response = await TemplateService.getAll(searchField);
        setTemplateList(response.content || []);
        setSearchField((prev) => ({
          ...prev,
          totalRecord: response.totalElements,
        }));
      } else {
        const response = await TemplateService.getDraftTemplate(searchField);
        setTemplateDraftList(response.content || []);
        setSearchField((prev) => ({
          ...prev,
          totalRecord: response.totalElements,
        }));
      }
    } catch (error) {
      // Fallback to empty arrays on error
      if (activeTab === "TAB_VBM") {
        setTemplateList([]);
      } else {
        setTemplateDraftList([]);
      }
    } finally {
      setIsLoading(false);
      setSelectedTemplate(null);
    }
  };

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    setSearchTerm("");
    setSearchField((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setSearchField((prev) => ({ ...prev, page: newPage }));
  };

  const handleSelectChange = (template: Template) => {
    if (activeTab === "TAB_VBM") {
      setTemplateList((prev) =>
        prev.map((item) => ({
          ...item,
          checked: item.id === template.id ? !item.checked : false,
        }))
      );
    } else {
      setTemplateDraftList((prev) =>
        prev.map((item) => ({
          ...item,
          checked: item.id === template.id ? !item.checked : false,
        }))
      );
    }
  };

  const handleViewTemplate = (template: Template) => {
    uploadFileService.viewFile(template, ATTACHMENT_DOWNLOAD_TYPE.TEMPLATE);
  };

  const handleDeleteTemplate = (template: Template) => {
    setTemplateToDelete(template);
    setIsConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!templateToDelete) return;

    try {
      await TemplateService.deleteTemplate(
        Constant.TYPE_TEMPLATE.GIAO_VIEC,
        templateToDelete.id
      );
      // Reload the list after successful deletion
      await loadTemplates();
    } catch (error) {
      await handleError(error);
    } finally {
      setTemplateToDelete(null);
    }
  };

  const handleSaveTemplate = () => {
    const currentList =
      activeTab === "TAB_VBM" ? templateList : templateDraftList;
    const selectedTemplate = currentList.find((item) => item.checked);

    if (!selectedTemplate) {
      console.log("Bạn chưa chọn văn bản mẫu.");
      return;
    }

    if (activeTab === "TAB_VBMN") {
      // For draft templates, directly select without rename dialog
      onSelectTemplate(selectedTemplate);
      onClose();
      return;
    }

    // For regular templates (TAB_VBM), show rename dialog
    setSelectedTemplate(selectedTemplate);
    setIsChangeFilenameDialogOpen(true);
  };

  const handleRenameConfirm = async (newFileName: string) => {
    if (selectedTemplate) {
      try {
        const extension = selectedTemplate.name.split(".").pop();
        const newName = `${newFileName}.${extension}`;
        const clonedTemplate = await TemplateService.cloneTemplate(
          Constant.TYPE_TEMPLATE.GIAO_VIEC,
          selectedTemplate.id,
          newName
        );
        onSelectTemplate(clonedTemplate);
      } catch (error) {
        // Fallback to original template
        onSelectTemplate(selectedTemplate);
      }
    }
    setIsChangeFilenameDialogOpen(false);
    setSelectedTemplate(null);
    onClose();
  };

  const handleRenameCancel = () => {
    if (selectedTemplate) {
      onSelectTemplate(selectedTemplate);
    }
    setIsChangeFilenameDialogOpen(false);
    setSelectedTemplate(null);
    onClose();
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString("vi-VN");
  };

  const getTypeString = (docType: string) => {
    const typeMap: { [key: string]: string } = {
      VAN_BAN_DI: "Văn bản đi",
      VAN_BAN_NOI_BO: "Văn bản nội bộ",
      VAN_BAN_SOAN_THAO: "Kế hoạch",
      GIAO_VIEC: "Giao việc",
    };
    return typeMap[docType] || docType;
  };

  const currentList =
    activeTab === "TAB_VBM" ? templateList : templateDraftList;

  return (
    <>
      <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
        <CustomDialogContent
          className="sm:max-w-5xl max-h-[90vh] overflow-y-auto p-0 bg-gray-50"
          onInteractOutside={(e) => e.preventDefault()}
        >
          <DialogHeader className="px-6 py-4 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <div className="p-1.5 bg-green-100 rounded-lg">
                  <Paperclip className="w-4 h-4 text-blue-600" />
                </div>
                Chọn văn bản mẫu
              </DialogTitle>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex items-center gap-1 h-9 px-3 text-xs text-gray-600 border border-gray-200 hover:bg-gray-50 rounded-md font-medium transition-colors"
                >
                  <X className="w-3 h-3" />
                  Đóng
                </Button>
                <Button
                  onClick={handleSaveTemplate}
                  className="flex items-center gap-1 h-9 px-3 text-xs bg-blue-600 hover:bg-blue-700 rounded-md font-medium transition-colors"
                >
                  <FileCheck className="w-4 h-4 mr-2" />
                  Đồng ý
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="p-6">
            <Tabs
              value={activeTab}
              onValueChange={handleTabChange}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="TAB_VBM">Văn bản mẫu</TabsTrigger>
                <TabsTrigger value="TAB_VBMN">Văn bản mẫu nháp</TabsTrigger>
              </TabsList>

              <TabsContent value="TAB_VBM" className="mt-4">
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <TableBase>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="w-[60px] text-center text-gray-700 font-medium">
                          STT
                        </TableHead>
                        <TableHead className="text-gray-700 font-medium">
                          Tên văn bản mẫu
                        </TableHead>
                        <TableHead className="w-[200px] text-gray-700 font-medium">
                          Loại văn bản mẫu
                        </TableHead>
                        <TableHead className="w-[80px] text-center text-gray-700 font-medium">
                          Xem
                        </TableHead>
                        <TableHead className="w-[80px] text-center text-gray-700 font-medium">
                          Chọn
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-8 text-gray-500"
                          >
                            Đang tải danh sách mẫu...
                          </TableCell>
                        </TableRow>
                      ) : templateList.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-8 text-gray-500"
                          >
                            Không có dữ liệu
                          </TableCell>
                        </TableRow>
                      ) : (
                        templateList.map((template, index) => (
                          <TableRow
                            key={template.id}
                            className="hover:bg-gray-50"
                          >
                            <TableCell className="text-center text-sm text-gray-600">
                              {index + 1}
                            </TableCell>
                            <TableCell className="text-sm text-gray-900">
                              <div className="whitespace-pre-wrap">
                                {template.displayName || template.name}
                              </div>
                            </TableCell>
                            <TableCell className="text-center text-sm text-gray-600">
                              {getTypeString(template.docType || "")}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-9 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                                onClick={() => handleViewTemplate(template)}
                                title="Xem mẫu"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                checked={template.checked || false}
                                onCheckedChange={() =>
                                  handleSelectChange(template)
                                }
                              />
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </TableBase>

                  {/* Pagination for TAB_VBM */}
                  {templateList.length > 0 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(searchField.page - 1)}
                          disabled={searchField.page <= 1}
                          className="h-9 w-8 p-0"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-gray-700 px-2">
                          {searchField.page}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(searchField.page + 1)}
                          disabled={
                            searchField.page * searchField.size >=
                            searchField.totalRecord
                          }
                          className="h-9 w-8 p-0"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="TAB_VBMN" className="mt-4">
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <TableBase>
                    <TableHeader>
                      <TableRow className="bg-gray-50">
                        <TableHead className="w-[60px] text-center text-gray-700 font-medium">
                          STT
                        </TableHead>
                        <TableHead className="text-gray-700 font-medium">
                          Tên văn bản mẫu
                        </TableHead>
                        <TableHead className="w-[200px] text-gray-700 font-medium">
                          Loại văn bản mẫu
                        </TableHead>
                        <TableHead className="w-[80px] text-center text-gray-700 font-medium">
                          Chọn
                        </TableHead>
                        <TableHead className="w-[80px] text-center text-gray-700 font-medium">
                          Xem
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {isLoading ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-8 text-gray-500"
                          >
                            Đang tải danh sách mẫu...
                          </TableCell>
                        </TableRow>
                      ) : templateDraftList.length === 0 ? (
                        <TableRow>
                          <TableCell
                            colSpan={5}
                            className="text-center py-8 text-gray-500"
                          >
                            Không có dữ liệu
                          </TableCell>
                        </TableRow>
                      ) : (
                        templateDraftList.map((template, index) => (
                          <TableRow
                            key={template.id}
                            className="hover:bg-gray-50"
                          >
                            <TableCell className="text-center text-sm text-gray-600">
                              {index + 1}
                            </TableCell>
                            <TableCell className="text-sm text-gray-900">
                              <div className="whitespace-pre-wrap">
                                {template.displayName || template.name}
                              </div>
                            </TableCell>
                            <TableCell className="text-center text-sm text-gray-600">
                              {getTypeString(template.docType || "")}
                            </TableCell>
                            <TableCell className="text-center">
                              <Checkbox
                                checked={template.checked || false}
                                onCheckedChange={() =>
                                  handleSelectChange(template)
                                }
                              />
                            </TableCell>
                            <TableCell className="text-center">
                              <div className="flex items-center justify-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-9 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                                  onClick={() => handleViewTemplate(template)}
                                  title="Xem mẫu"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-9 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                                  onClick={() => handleDeleteTemplate(template)}
                                  title="Xóa mẫu"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </TableBase>

                  {/* Pagination for TAB_VBMN */}
                  {templateDraftList.length > 0 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(searchField.page - 1)}
                          disabled={searchField.page <= 1}
                          className="h-9 w-8 p-0"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm text-gray-700 px-2">
                          {searchField.page}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handlePageChange(searchField.page + 1)}
                          disabled={
                            searchField.page * searchField.size >=
                            searchField.totalRecord
                          }
                          className="h-9 w-8 p-0"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </CustomDialogContent>
      </Dialog>

      {/* Change Filename Dialog */}
      <ChangeFilenameDialog
        open={isChangeFilenameDialogOpen}
        onClose={() => setIsChangeFilenameDialogOpen(false)}
        onConfirm={handleRenameConfirm}
        onCancel={handleRenameCancel}
        originalFileName={
          selectedTemplate?.displayName || selectedTemplate?.name || ""
        }
      />

      {/* Confirm Delete Dialog */}
      <ConfirmDeleteDialog
        isOpen={isConfirmDeleteOpen}
        onOpenChange={setIsConfirmDeleteOpen}
        onConfirm={handleConfirmDelete}
        title="Xóa mẫu"
        description="Bạn chắc chắn muốn xóa tệp này?"
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </>
  );
};

export default TemplateDialog;
