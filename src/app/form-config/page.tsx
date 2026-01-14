"use client";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import SelectCustom from "@/components/common/SelectCustom";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import { Button } from "@/components/ui/button";
import {
  useGetFormConfigListQuery,
  useAddFormConfig,
  useUpdateFormConfig,
  useToggleActiveFormConfig,
  useDeleteFormConfig,
  useGetFormConfigTypeListQuery,
} from "@/hooks/data/form-config.data";
import { useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/definitions/constants/queryKey.constants";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import {
  ChevronDown,
  ChevronRight,
  Edit,
  FileText,
  Plus,
  Trash2,
  Unlock,
  Lock,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ToastUtils } from "@/utils/toast.utils";

export default function FormConfigPage() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [params, setParams] = useState({
    page: 1,
    size: 10,
    text: "",
    formType: "",
  });

  const [selectedFormId, setSelectedFormId] = useState<string | number | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formToDelete, setFormToDelete] = useState<number | null>(null);

  // New form dialog states
  const [isNewFormDialogOpen, setIsNewFormDialogOpen] = useState(false);
  const [newFormName, setNewFormName] = useState("");
  const [newFormDescription, setNewFormDescription] = useState("");
  const [newFormType, setNewFormType] = useState<number>(0);
  const [newFormActive, setNewFormActive] = useState<boolean>(true);
  const [newFormIsCategory, setNewFormIsCategory] = useState<boolean>(false);
  const [newFormParentId, setNewFormParentId] = useState<number | null>(null);
  const [editingFormId, setEditingFormId] = useState<number | null>(null);
  const [expandedParentIds, setExpandedParentIds] = useState<number[]>([]);
  const toggleActiveFormConfig = useToggleActiveFormConfig();
  const [formTypes, setFormTypes] = useState<
    Array<{ label: string; value: string }>
  >([]);

  const toggleParent = (parentId: number) => {
    setExpandedParentIds((prev) =>
      prev.includes(parentId)
        ? prev.filter((id) => id !== parentId)
        : [...prev, parentId]
    );
  };

  // Fetch form config list
  const { data: formConfigData, isLoading } = useGetFormConfigListQuery(params);

  // Mock data for visual testing
  const mockData = [
    {
      id: 1,
      name: "Quản lý nhân sự",
      description: "Thư mục chứa các form nhân sự",
      formType: "QLNS",
      active: true,
      isCategory: true,
      parentId: null,
    },
    {
      id: 2,
      name: "Đăng ký nghỉ phép",
      description: "Form đăng ký nghỉ phép năm",
      formType: "QLNS",
      active: true,
      isCategory: false,
      parentId: 1,
    },
    {
      id: 3,
      name: "Đánh giá thử việc",
      description: "Form đánh giá nhân viên mới",
      formType: "QLNS",
      active: false,
      isCategory: false,
      parentId: 1,
    },
    {
      id: 4,
      name: "Quản lý tài sản",
      description: "Thư mục chứa các form tài sản",
      formType: "QLTS",
      active: true,
      isCategory: false,
      parentId: null,
    },
  ];

  // Use real data from API if available, fallback to mock data
  const formConfigs = useMemo(() => {
    const list = formConfigData?.content || mockData;
    // Simple sorting to put children after parents
    const result: any[] = [];
    const parents = list.filter((f) => !f.parentId);
    const children = list.filter((f) => f.parentId);

    parents.forEach((parent) => {
      result.push(parent);
      if (expandedParentIds.includes(parent.id)) {
        const childs = children.filter((c) => c.parentId === parent.id);
        result.push(...childs);
      }
    });

    // Add any children whose parents are not in the list (if any)
    const orphanChildren = children.filter(
      (c) => !parents.find((p) => p.id === c.parentId)
    );
    result.push(...orphanChildren);

    return result;
  }, [formConfigData?.content, expandedParentIds, mockData]);

  // Mutations
  const addFormMutation = useAddFormConfig();
  const { data: getFormConfigTypeListQuery } = useGetFormConfigTypeListQuery();
  const updateFormMutation = useUpdateFormConfig();
  const deleteFormMutation = useDeleteFormConfig();
  const [isLoadingFormTypes, setIsLoadingFormTypes] = useState(false);

  // Handle form selection
  const handleFormSelect = (formId: string) => {
    setSelectedFormId(formId);
  };
  // Handle delete form (toggle active/deactive)
  const handleDeleteForm = async () => {
    if (formToDelete) {
      try {
        await deleteFormMutation.mutateAsync({ id: formToDelete });
        // Refetch the list
        queryClient.invalidateQueries({
          queryKey: [queryKeys.formConfig.list],
        });
        if (selectedFormId === formToDelete) {
          setSelectedFormId(null);
        }
        setIsDeleteDialogOpen(false);
        setFormToDelete(null);
      } catch (error) {
        console.error("Error toggling form status:", error);
      }
    }
  };

  // Pagination handlers
  const handlePageChange = (page: number) => {
    setParams((prev) => ({ ...prev, page: page }));
  };

  const handlePageSizeChange = (size: number) => {
    setParams((prev) => ({ ...prev, size: size, currentPage: 1 }));
  };

  useEffect(() => {
    setFormTypes(
      getFormConfigTypeListQuery?.map((item) => ({
        label: item.name,
        value: item.id.toString(),
      })) || []
    );
  }, [getFormConfigTypeListQuery, setFormTypes]);

  // Handle create new form
  const handleCreateNewForm = async () => {
    if (!newFormName.trim()) {
      ToastUtils.error("Vui lòng nhập tên form");
      return;
    }
    if (!newFormType) {
      ToastUtils.error("Vui lòng chọn loại form");
      return;
    }

    try {
      if (editingFormId) {
        await updateFormMutation.mutateAsync(
          {
            id: editingFormId,
            payload: {
              name: newFormName,
              description: newFormDescription,
              categoryId: newFormType,
              active: newFormActive,
              isCategory: newFormIsCategory,
              parentId: newFormParentId,
            },
          },
          {
            onSuccess: () => {
              ToastUtils.success("Cập nhật form thành công!");
              queryClient.invalidateQueries({
                queryKey: [queryKeys.formConfig.list],
              });
            },
          }
        );
      } else {
        await addFormMutation.mutateAsync(
          {
            payload: {
              name: newFormName,
              description: newFormDescription,
              categoryId: newFormType,
              active: newFormActive,
              isCategory: newFormIsCategory,
              parentId: newFormParentId,
            },
          },
          {
            onSuccess: () => {
              ToastUtils.success("Tạo form thành công!");
              queryClient.invalidateQueries({
                queryKey: [queryKeys.formConfig.list],
              });
            },
          }
        );
      }

      setNewFormName("");
      setNewFormDescription("");
      setNewFormType(0);
      setNewFormActive(true);
      setNewFormIsCategory(false);
      setNewFormParentId(null);
      setEditingFormId(null);
      setIsNewFormDialogOpen(false);
    } catch (error: any) {
      console.error("Error creating form:", error);
      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Có lỗi xảy ra khi tạo form";
      ToastUtils.error(errorMessage);
    }
  };

  // Field preview and properties moved to components
  return (
    <div className="space-y-4 px-4">
      <BreadcrumbNavigation
        items={[{ href: "/form-config", label: "Quản trị hệ thống" }]}
        currentPage="Cấu hình form xử lý"
      />

      <div className="space-y-4">
        {/* Forms List */}
        <div className="bg-white overflow-hidden shadow-sm">
          <div className="px-4 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border rounded-lg border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-md flex items-center justify-center">
                  <FileText className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-sm font-semibold text-gray-900">
                  Danh sách form
                </h2>
              </div>
              <Button
                onClick={() => {
                  setNewFormParentId(null);
                  setNewFormIsCategory(false);
                  setIsNewFormDialogOpen(true);
                }}
                className="h-8 px-3 text-xs bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-sm"
              >
                <Plus className="w-3.5 h-3.5 mr-1.5" />
                Tạo form mới
              </Button>
            </div>
          </div>
          <div className="overflow-x-auto py-4">
            <Table
              columns={[
                {
                  header: "STT",
                  className: "w-16 text-center",
                  accessor: (_: any, rowIndex: number) => (
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${
                        selectedFormId &&
                        formConfigs[rowIndex]?.id === selectedFormId
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-600"
                      }`}
                    >
                      {(params.page - 1) * params.size + rowIndex + 1}
                    </span>
                  ),
                },
                {
                  header: <p>Tên form</p>,
                  className: "min-w-[150px]",
                  accessor: (record: any) => {
                    const isExpanded = expandedParentIds.includes(record.id);
                    const hasChildren = mockData.some(
                      (c) => c.parentId === record.id
                    );

                    return (
                      <div className="flex items-center gap-2">
                        {!record.parentId && (
                          <div
                            className="w-6 h-6 flex items-center justify-center cursor-pointer hover:bg-gray-100 rounded-md transition-colors"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleParent(record.id);
                            }}
                          >
                            {hasChildren &&
                              (isExpanded ? (
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-gray-500" />
                              ))}
                          </div>
                        )}
                        <div
                          className={`w-2 h-2 rounded-full ${
                            selectedFormId === record.id
                              ? "bg-blue-500"
                              : "bg-gray-300"
                          } ${record.parentId ? "ml-12" : ""}`}
                        />
                        <span
                          className={`text-sm font-medium ${
                            selectedFormId === record.id
                              ? "text-blue-900"
                              : "text-gray-900"
                          }`}
                        >
                          {record.name}
                        </span>
                      </div>
                    );
                  },
                },
                {
                  header: "Loại form",
                  className: "w-32 text-center",
                  accessor: (record: any) => (
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-gray-900`}
                      >
                        {record.formType}
                      </span>
                    </div>
                  ),
                },
                {
                  header: "Trạng thái",
                  className: "w-32 text-center",
                  accessor: (record: any) => (
                    <div className="flex flex-col items-center gap-1">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          record.active
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {record.active ? "Hoạt động" : "Không hoạt động"}
                      </span>
                    </div>
                  ),
                },
                {
                  header: "Thao tác",
                  type: "actions" as any,
                  className: "w-32 text-center",
                  renderActions: (record: any) => (
                    <div className="flex items-center justify-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="sm"
                        className={`h-7 w-7 p-0 rounded-md transition-all duration-200                       
                            text-blue-600 hover:bg-blue-100" 
                        }`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (record.isCategory) {
                            // Open modal for editing category/folder info
                            setEditingFormId(record.id);
                            setNewFormName(record.name);
                            setNewFormDescription(record.description || "");
                            setNewFormType(record.categoryId);
                            setNewFormActive(record.active);
                            setNewFormIsCategory(record.isCategory);
                            setNewFormParentId(record.parentId);
                            setIsNewFormDialogOpen(true);
                          } else {
                            router.push(`/form-config/${record.id}/edit`);
                          }
                        }}
                        title={
                          record.isCategory
                            ? "Chỉnh sửa thư mục"
                            : "Thiết kế form"
                        }
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-1 hover:bg-green-100 rounded transition-colors"
                        title={record.active ? "Ngừng kích hoạt" : "Kích hoạt"}
                        onClick={() => {
                          toggleActiveFormConfig.mutate({ id: record.id });
                        }}
                      >
                        {record.active ? (
                          <Unlock className="h-4 w-4 text-green-600" />
                        ) : (
                          <Lock className="h-4 w-4 text-red-600" />
                        )}
                      </Button>
                      {record.isCategory && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 rounded-md text-green-600 hover:bg-green-100"
                          onClick={(e) => {
                            e.stopPropagation();
                            setNewFormParentId(record.id);
                            setNewFormIsCategory(false);
                            setIsNewFormDialogOpen(true);
                          }}
                          title="Thêm form con"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={record.isUse}
                        className={`h-7 w-7 p-0 rounded-md transition-all duration-200  text-red-600 hover:bg-red-100`}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!record.isUse) {
                            setFormToDelete(record.id);
                            setIsDeleteDialogOpen(true);
                          }
                        }}
                        title={record.isUse ? "Đang được sử dụng" : "Xóa"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ),
                },
              ]}
              dataSource={formConfigs as any}
              emptyText="Không có dữ liệu"
              totalItems={formConfigData?.totalElements || formConfigs.length}
              currentPage={params.page}
              itemsPerPage={params.size}
              onPageChange={handlePageChange}
              onItemsPerPageChange={handlePageSizeChange}
              showPagination
              showPageSize
              pageSizeOptions={[10, 20, 50, 100]}
              loading={isLoading}
              bgColor="bg-white"
              onRowClick={(record: any) => handleFormSelect(record.id)}
              rowClassName={(record: any) =>
                `cursor-pointer transition-all duration-200 border-b border-gray-100 ${
                  selectedFormId === record.id
                    ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 shadow-sm"
                    : "hover:bg-gray-50/50"
                }`
              }
            />
          </div>
        </div>
      </div>

      {/* New Form Dialog */}
      <Dialog open={isNewFormDialogOpen} onOpenChange={setIsNewFormDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {editingFormId ? "Chỉnh sửa form" : "Tạo form mới"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label
                htmlFor="newFormName"
                className="text-sm font-medium text-gray-700"
              >
                Tên Form <span className="text-red-500">*</span>
              </Label>
              <Input
                id="newFormName"
                value={newFormName}
                onChange={(e) => setNewFormName(e.target.value)}
                placeholder="Nhập tên form"
                className="h-10"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="newFormDescription"
                className="text-sm font-medium text-gray-700"
              >
                Mô tả
              </Label>
              <Textarea
                id="newFormDescription"
                value={newFormDescription}
                onChange={(e) => setNewFormDescription(e.target.value)}
                placeholder="Nhập mô tả form"
                rows={3}
                className="text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="newFormType"
                className="text-sm font-medium text-gray-700"
              >
                Loại Form <span className="text-red-500">*</span>
              </Label>
              {isLoadingFormTypes ? (
                <div className="h-10 flex items-center justify-center border border-gray-200 rounded">
                  <span className="text-sm text-gray-500">Đang tải...</span>
                </div>
              ) : (
                <SelectCustom
                  options={formTypes}
                  value={newFormType?.toString()}
                  onChange={(val) => setNewFormType(Number(val || ""))}
                  placeholder="Chọn loại form"
                  className="h-10"
                />
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-6">
                {/* <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="newFormIsCategory"
                    checked={newFormIsCategory}
                    onChange={(e) => {
                      setNewFormIsCategory(e.target.checked);
                      if (e.target.checked) {
                        setNewFormParentId(null);
                      }
                    }}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <Label
                    htmlFor="newFormIsCategory"
                    className="text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    Là thư mục cha
                  </Label>
                </div> */}

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="newFormActive"
                    checked={newFormActive}
                    onChange={(e) => setNewFormActive(e.target.checked)}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <Label
                    htmlFor="newFormActive"
                    className="text-sm font-medium text-gray-700 cursor-pointer"
                  >
                    Hoạt động
                  </Label>
                </div>
              </div>

              {/* {!newFormIsCategory && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">
                    Thư mục cha
                  </Label>
                  <SelectCustom
                    options={[
                      { label: "Không có", value: "null" },
                      ...formConfigs
                        .filter((f: any) => f.isCategory)
                        .map((f: any) => ({
                          label: f.name,
                          value: f.id.toString(),
                        })),
                    ]}
                    value={newFormParentId?.toString() || "null"}
                    onChange={(val) =>
                      setNewFormParentId(val === "null" ? null : Number(val))
                    }
                    placeholder="Chọn thư mục cha"
                    className="h-10"
                  />
                </div>
              )} */}
            </div>

            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <Button
                variant="outline"
                onClick={() => {
                  setIsNewFormDialogOpen(false);
                  setNewFormName("");
                  setNewFormDescription("");
                  setNewFormType(0);
                  setNewFormActive(true);
                  setNewFormIsCategory(false);
                  setNewFormParentId(null);
                  setEditingFormId(null);
                }}
                className="h-9"
              >
                Hủy
              </Button>
              <Button
                onClick={handleCreateNewForm}
                disabled={
                  addFormMutation.isPending || updateFormMutation.isPending
                }
                className="h-9 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {addFormMutation.isPending || updateFormMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                    {editingFormId ? "Đang cập nhật..." : "Đang tạo..."}
                  </>
                ) : editingFormId ? (
                  "Cập nhật"
                ) : (
                  "Tạo mới"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Form Dialog */}
      <ConfirmDeleteDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);
          if (!open) {
            setFormToDelete(null);
          }
        }}
        onConfirm={handleDeleteForm}
        title="Xác nhận xóa form"
        description="Bạn có chắc chắn muốn xóa form này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        cancelText="Hủy"
      />
    </div>
  );
}
