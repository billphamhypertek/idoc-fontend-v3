"use client";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import StatusBadge from "@/components/common/StatusBadge";
import { SearchInput } from "@/components/document-in/SearchInput";
import { TransferHandler } from "@/components/room-request/transferHandler";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";
import { Column } from "@/definitions";
import { STORAGE_KEYS } from "@/definitions/constants/storageKey.constant";
import {
  FORMHANLDESTATUS,
  FORMHANLDETYPE,
} from "@/definitions/enums/common.enum";
import { useGetDynamicFormQuery } from "@/hooks/data/form-dynamic.data";
import {
  useDeleteValueDynamicByIds,
  useGetValueDynamicList,
} from "@/hooks/data/value-dynamic.data";
import { cn } from "@/lib/utils";
import { findIdByRouterPathSafe } from "@/utils/common.utils";
import { ToastUtils } from "@/utils/toast.utils";
import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, Plus, Trash2 } from "lucide-react";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";

interface RoomRequest {
  id: string;
  meetingContent: string;
  participants: string;
  chairperson: string;
  quantity: number;
  startTime: string;
  contact: string;
  organization: string;
  status: string;
}

interface DynamicRegisterPageProps {
  type: string;
}

export default function DynamicRegisterPage({
  type,
}: DynamicRegisterPageProps) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [showFormSelect, setShowFormSelect] = useState(false);
  const [selectedFormIdForList, setSelectedFormIdForList] = useState<
    number | null
  >(null);
  const searchParams = useSearchParams();
  const formIdFromUrl = searchParams?.get("formId");
  const deleteValueDynamicByIds = useDeleteValueDynamicByIds();
  const allModules = localStorage.getItem(STORAGE_KEYS.MODULES);
  const modules = allModules ? JSON.parse(allModules) : [];
  const moduleId = findIdByRouterPathSafe(modules, pathname || "");
  const workflowId = params?.typeId as string;
  const typeWorkflow = type;

  // Get parent module name based on moduleId - tính toán động
  const formLabel = useMemo(() => {
    // Find module by ID in nested structure
    const findModuleById = (moduleList: any[], id: number): any => {
      for (const m of moduleList) {
        if (m.id === id) return m;
        if (m.subModule && m.subModule.length > 0) {
          const found = findModuleById(m.subModule, id);
          if (found) return found;
        }
      }
      return null;
    };

    if (!moduleId) return "Quản lý workflow";

    const currentModule = findModuleById(modules, moduleId);

    // Nếu module hiện tại có parentId, tìm module cha và lấy name
    if (currentModule?.parentId) {
      const parentModule = findModuleById(modules, currentModule.parentId);
      return parentModule?.name?.trim() || "Quản lý workflow";
    }

    // Nếu không có parentId, module hiện tại chính là module cha
    return currentModule?.name?.trim() || "Quản lý workflow";
  }, [modules, moduleId]);

  const { data: dynamicForm, isLoading: isLoadingForm } =
    useGetDynamicFormQuery(Number(workflowId));

  const formId = dynamicForm?.data?.id;

  // Lấy danh sách forms - giả sử API trả về array hoặc single object
  const forms = useMemo(() => {
    return dynamicForm?.data || [];
  }, [dynamicForm?.data]);
  // Tự động chọn formId: ưu tiên formId từ URL, nếu không có thì chọn form đầu tiên
  useEffect(() => {
    if (forms.length > 0 && selectedFormIdForList === null) {
      // Ưu tiên formId từ URL nếu có
      if (formIdFromUrl) {
        const formIdNumber = Number(formIdFromUrl);
        const formExists = forms.find((f: any) => f.id === formIdNumber);
        if (formExists) {
          setSelectedFormIdForList(formIdNumber);
          return;
        }
      }
      // Nếu không có formId từ URL hoặc không tìm thấy, chọn form đầu tiên
      setSelectedFormIdForList(forms[0].id);
    }
  }, [forms, selectedFormIdForList, formIdFromUrl]);

  // FormId để dùng trong param API
  const currentFormId = selectedFormIdForList || formId;
  const param = useMemo(
    () => ({
      page: currentPage,
      size: itemsPerPage,
      formId: currentFormId,
      handleType: FORMHANLDETYPE.XU_LY_CHINH,
      handleStatus: FORMHANLDESTATUS.NEW,
      search: searchText || undefined,
      moduleId: moduleId || undefined,
    }),
    [currentPage, itemsPerPage, currentFormId, searchText, moduleId]
  );

  const {
    data: valueDynamicData,
    isLoading,
    refetch,
  } = useGetValueDynamicList(param, !!currentFormId && !isLoadingForm);

  type AnyObject = Record<string, any>;

  const renderObjectList = (objList: AnyObject[]) => {
    if (!Array.isArray(objList)) return [];

    return objList.map((item) => {
      const renderedItem: AnyObject = {};

      Object.entries(item).forEach(([key, value]) => {
        if (value === null || value === undefined) {
          renderedItem[key] = "";
          return;
        }

        // Array object → join displayName
        if (Array.isArray(value)) {
          renderedItem[key] = value
            .map((v) => v?.displayName)
            .filter(Boolean)
            .join(", ");
          return;
        }

        // Object → lấy displayName
        if (typeof value === "object") {
          renderedItem[key] = value?.displayName ?? "";
          return;
        }

        // Primitive
        renderedItem[key] = String(value);
      });

      return renderedItem;
    });
  };

  const fieldList = valueDynamicData?.data?.fieldShowListDtoList || [];
  const objList =
    renderObjectList(valueDynamicData?.data?.listValue?.objList) || [];

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      "Chờ duyệt": {
        variant: "outline" as const,
        className: "text-yellow-600 border-yellow-200 bg-yellow-50",
      },
      "Đã duyệt": {
        variant: "outline" as const,
        className: "text-green-600 border-green-200 bg-green-50",
      },
      "Đang xử lý": {
        variant: "outline" as const,
        className: "text-blue-600 border-blue-200 bg-blue-50",
      },
      "Từ chối": {
        variant: "outline" as const,
        className: "text-red-600 border-red-200 bg-red-50",
      },
      "Hoàn thành": {
        variant: "outline" as const,
        className: "text-gray-600 border-gray-200 bg-gray-50",
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] ||
      statusConfig["Chờ duyệt"];

    return (
      <Badge
        variant={config.variant}
        className={cn("text-xs font-medium", config.className)}
      >
        {status}
      </Badge>
    );
  };

  const handleEdit = (item: RoomRequest, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/request/${workflowId}/register/update/${item.id}`);
  };

  const handleDelete = (item: RoomRequest, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedItems([item.id]);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (selectedItems.length === 0) return;

    const itemIdsToDelete = selectedItems.map((id) => Number(id));
    deleteValueDynamicByIds.mutate(itemIdsToDelete, {
      onSuccess: async () => {
        ToastUtils.success("Xóa phiếu thành công");
        setSelectedItems([]);
        setIsDeleteConfirmOpen(false);
        await refetch();
      },
      onError: (error) => {
        console.error("Lỗi khi xóa:", error);
        setIsDeleteConfirmOpen(false);
      },
    });
  };

  const handleRowClick = (item: any) => {
    console.log("Chi tiết phiếu:", item.id);
    router.push(`/request/${workflowId}/register/detail/${item.id}`);
  };

  const handleSuccess = async () => {
    await queryClient.invalidateQueries({ queryKey: ["valueDynamic"] });
    setSelectedItems([]);
  };

  const handleSelectRow = (selectedKeys: React.Key[], selectedRows: any[]) => {
    setSelectedItems(selectedKeys as string[]);
  };

  const columns: Column<any>[] = useMemo(() => {
    const cols: Column<any>[] = [
      {
        header: "STT",
        type: "checkbox",
        className: "w-16 text-center py-1",
      },
    ];

    fieldList.forEach((field: { name: string; label: string }) => {
      cols.push({
        header: field.label,
        accessor: (row: any) =>
          row[field.name] !== undefined && row[field.name] !== null
            ? row[field.name]
            : "-",
        className: "min-w-[150px]",
      });
    });

    cols.push({
      header: "Trạng thái",
      accessor: () => <StatusBadge status={"Tạo mới"} />,
      className: "py-1 status-column",
    });
    cols.push({
      header: "Thao tác",
      type: "actions",
      className: "text-center w-[80px]",
      sortable: false,
      renderActions: (item: any) => (
        <div className="flex items-center justify-center gap-1">
          <button
            onClick={(e) => handleDelete(item, e)}
            className="p-1 text-red-600 hover:bg-red-50 rounded"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ),
    });

    return cols;
  }, [fieldList, currentPage, itemsPerPage, selectedItems]);

  const handleTransferSuccess = async () => {
    await refetch();
    ToastUtils.success("Chuyển xử lý phiếu thành công");
  };

  const handleAddNewClick = () => {
    if (forms.length === 1) {
      // Nếu chỉ có 1 form, redirect trực tiếp
      router.push(
        `/request/${workflowId}/register/insert?formId=${forms[0].id}`
      );
    } else if (forms.length > 1) {
      // Nếu có nhiều forms, hiện select
      setShowFormSelect(!showFormSelect);
    } else {
      ToastUtils.error("Không tìm thấy form để tạo phiếu");
    }
  };

  const handleFormSelect = (formId: string) => {
    if (formId) {
      router.push(`/request/${workflowId}/register/insert?formId=${formId}`);
    }
  };

  // Đóng form select khi click bên ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (showFormSelect && !target.closest(".relative")) {
        setShowFormSelect(false);
      }
    };

    if (showFormSelect) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [showFormSelect]);

  return (
    <div className="pl-4 pr-4 space-y-4">
      <div className="flex items-center justify-between gap-4 mb-4">
        <BreadcrumbNavigation
          items={[
            {
              label: formLabel,
            },
          ]}
          currentPage="Phiếu đăng ký"
          showHome={false}
        />
        <div className="flex items-center gap-3">
          {forms.length > 1 && (
            <select
              value={selectedFormIdForList || ""}
              onChange={(e) => {
                setSelectedFormIdForList(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="h-9 px-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {forms.map((form: any) => (
                <option key={form.id} value={form.id}>
                  {form.name || `Form ${form.id}`}
                </option>
              ))}
            </select>
          )}
          <SearchInput
            placeholder="Tìm kiếm"
            value={searchText}
            setSearchInput={(v) => {
              setSearchText(v);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4 min-h-9">
        <div className="relative">
          <Button
            onClick={handleAddNewClick}
            className="h-9 px-3 text-white border-0 bg-blue-600 hover:bg-blue-700 hover:text-white"
          >
            <Plus className="w-4 h-4 mr-1" />
            Thêm mới phiếu
          </Button>

          {showFormSelect && forms.length > 1 && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-md shadow-lg z-10">
              <div className="p-2">
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Chọn loại phiếu:
                </p>
                <div className="space-y-1">
                  {forms.map((form: any) => (
                    <button
                      key={form.id}
                      onClick={() => handleFormSelect(form.id)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 rounded transition-colors"
                    >
                      {form.name || `Form ${form.id}`}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        <TransferHandler
          selectedItemId={Number(selectedItems[0]) || null}
          currentNode={null}
          formType={typeWorkflow}
          disabled={selectedItems.length === 0}
          onSuccess={handleTransferSuccess}
          formId={currentFormId?.toString() || ""}
        />
      </div>

      <Table
        columns={columns}
        dataSource={isLoading ? [] : objList}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        itemsPerPage={itemsPerPage}
        onItemsPerPageChange={setItemsPerPage}
        showPagination={true}
        showPageSize={true}
        pageSizeOptions={[5, 10, 20, 50]}
        onRowClick={handleRowClick}
        rowSelection={{
          selectedRowKeys: selectedItems,
          onChange: handleSelectRow,
          rowKey: "id",
        }}
        hasAllChange={true}
        emptyText={
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-gray-500 text-sm">Không có dữ liệu</p>
          </div>
        }
        sortable={true}
        clientSort={true}
        className="bg-white"
      />

      <ConfirmDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        title="Xác nhận xóa"
        description={`Bạn có chắc chắn muốn xóa ${selectedItems.length} phiếu đã chọn?`}
        onConfirm={handleDeleteConfirm}
        confirmText="Xóa"
        cancelText="Hủy"
        variant="destructive"
      />
    </div>
  );
}
