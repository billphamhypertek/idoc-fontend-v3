"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronDown,
  ChevronRight,
  Plus,
  Save,
  Edit,
  Trash2,
} from "lucide-react";
import {
  FlatModule,
  Module,
  ModuleDetail,
} from "@/definitions/types/module.type";
import { ToastUtils } from "@/utils/toast.utils";
import ConfirmDeleteDialog from "@/components/common/ConfirmDeleteDialog";
import ModuleDialog from "@/components/module/ModuleDialog";
import {
  useDeleteModule,
  useGetAllModulesQuery,
  useGetDetailModule,
  useUpdateModule,
  useUpdateShowHideModule,
} from "@/hooks/data/module.data";
import { Column, queryKeys } from "@/definitions";
import { Table } from "@/components/ui/table";
import { useQueryClient } from "@tanstack/react-query";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";

export default function ModuleManagePage() {
  const queryClient = useQueryClient();
  const [listModule, setListModule] = useState<Module[]>([]);
  const [flatModules, setFlatModules] = useState<FlatModule[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [moduleIdToDelete, setModuleIdToDelete] = useState<number | null>(null);
  const [moduleDialogOpen, setModuleDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<ModuleDetail>(
    {} as ModuleDetail
  );
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<number | null>(null);

  const {
    data: modules,
    isLoading: isLoadingModules,
    error: errorModules,
  } = useGetAllModulesQuery();

  // needed so that refetch triggers query when id changes due to how TanStack Query works
  const { data: moduleDetail, isLoading: isLoadingModuleDetail } =
    useGetDetailModule(selectedModuleId ?? 0);
  const { mutate: doUpdateShowHideModule } = useUpdateShowHideModule();
  const { mutate: doUpdateModule } = useUpdateModule();
  const { mutate: doDeleteModule } = useDeleteModule();
  // Effect to update editingModule data into the modal when new detail received
  useEffect(() => {
    if (isEditMode && moduleDetail && moduleDialogOpen) {
      setEditingModule(moduleDetail);
    }
  }, [moduleDetail, isEditMode, moduleDialogOpen]);

  useEffect(() => {
    if (modules) {
      const updatedModules = modules.map((menu) => ({
        ...menu,
        isChecked: !menu.hide,
        isParent: menu.subModule && menu.subModule.length > 0,
        subModule:
          menu.subModule?.map((sub) => ({
            ...sub,
            isChecked: !sub.hide,
            isParent: sub.subModule && sub.subModule.length > 0,
          })) || [],
      }));

      setListModule(updatedModules);
      flattenTree(updatedModules);
    }
  }, [modules]);

  const flattenTree = (modules: Module[]) => {
    const flat: FlatModule[] = [];

    const walk = (
      items: Module[],
      level = 0,
      parentId: number | null = null
    ) => {
      for (const item of items) {
        const hasChild = item.subModule && item.subModule.length > 0;
        const node: FlatModule = {
          ...item,
          level,
          parentId,
          isExpanded: true,
          isParent: hasChild,
          isChecked: item.isChecked ?? !item.hide,
        };

        flat.push(node);

        if (hasChild && item.subModule) {
          walk(item.subModule, level + 1, item.id);
        }
      }
    };

    walk(modules);
    setFlatModules(flat);
  };

  const isVisible = (item: FlatModule): boolean => {
    if (item.level === 0) return true;

    const parent = flatModules.find((p) => p.id === item.parentId);
    return parent ? parent.isExpanded && isVisible(parent) : false;
  };

  const toggle = (item: FlatModule) => {
    setFlatModules((prev) =>
      prev.map((module) =>
        module.id === item.id
          ? { ...module, isExpanded: !module.isExpanded }
          : module
      )
    );
  };

  const updateChildrenCheckbox = (
    modules: Module[],
    parentId: number,
    checked: boolean
  ): Module[] => {
    return modules.map((module) => {
      if (module.id === parentId) {
        return {
          ...module,
          isChecked: checked,
          hide: !checked,
          subModule: module.subModule.map((sub) => ({
            ...sub,
            isChecked: checked,
            hide: !checked,
          })),
        };
      }
      if (module.subModule && module.subModule.length > 0) {
        return {
          ...module,
          subModule: updateChildrenCheckbox(
            module.subModule,
            parentId,
            checked
          ),
        };
      }
      return module;
    });
  };

  const updateListModule = (
    modules: Module[],
    targetId: number,
    checked: boolean
  ): Module[] => {
    return modules.map((module) => {
      if (module.id === targetId) {
        return {
          ...module,
          isChecked: checked,
          hide: !checked,
          subModule: module.subModule.map((sub) => ({
            ...sub,
            isChecked: checked,
            hide: !checked,
          })),
        };
      }
      if (module.subModule && module.subModule.length > 0) {
        return {
          ...module,
          subModule: updateListModule(module.subModule, targetId, checked),
        };
      }
      return module;
    });
  };

  const handleCheckboxChange = (item: FlatModule, checked: boolean) => {
    // Cập nhật listModule trước
    const updatedListModule = updateListModule(listModule, item.id, checked);
    setListModule(updatedListModule);

    // Sau đó flatten lại để cập nhật flatModules
    flattenTree(updatedListModule);
  };

  const doSave = async () => {
    doUpdateShowHideModule(
      { payload: listModule },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: [queryKeys.module.getAll],
          });
          ToastUtils.updateModuleSuccess();
        },
        onError: () => {
          ToastUtils.updateModuleError();
        },
      }
    );
  };

  // Sửa lại doOpenEdit để refetch và lấy data mới nhất cho dialog
  const doOpenEdit = async (id: number) => {
    setSelectedModuleId(id);
    setModuleDialogOpen(true);
    setIsEditMode(true);
  };

  const doOpenAdd = (moduleData?: Module) => {
    setEditingModule(moduleData as any); // Could be undefined but used as new data object
    setIsEditMode(!!moduleData);
    setModuleDialogOpen(true);
  };

  const handleModuleSave = async (module: ModuleDetail) => {
    doUpdateModule(
      { payload: module },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: [queryKeys.module.getAll],
          });
          setEditingModule({} as ModuleDetail);
          setIsEditMode(false);
          setModuleDialogOpen(false);
          setSelectedModuleId(null);
          ToastUtils.updateModuleSuccess();
        },
        onError: () => {
          ToastUtils.updateModuleError();
        },
      }
    );
  };

  const doDelete = (id: number) => {
    setModuleIdToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!moduleIdToDelete) return;
    doDeleteModule(
      { id: moduleIdToDelete },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({
            queryKey: [queryKeys.module.getAll],
          });
          setModuleIdToDelete(null);
          setDeleteDialogOpen(false);
          ToastUtils.deleteModuleSuccess();
        },
        onError: () => {
          ToastUtils.deleteModuleError();
        },
      }
    );
  };

  const INDENT_PER_LEVEL = 24; // pixels

  const moduleColumns: Column<FlatModule>[] = [
    {
      header: "",
      className: "py-2 w-[10px] text-center",
      accessor: (item: FlatModule) => {
        if (item.isParent) {
          return (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => toggle(item)}
              className="flex items-center space-x-2 p-0 h-auto min-w-0"
              style={{
                marginLeft: item.level ? INDENT_PER_LEVEL * item.level : 0,
              }}
            >
              {item.isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </Button>
          );
        } else {
          // Non-parent: still indent so all rows align
          return (
            <span
              style={{
                display: "inline-block",
                width: 24,
                marginLeft: item.level ? INDENT_PER_LEVEL * item.level : 0,
              }}
            />
          );
        }
      },
    },
    {
      header: "Tên module",
      className: "py-2 text-left",
      accessor: (item: FlatModule) => (
        <div
          style={{
            paddingLeft: item.level ? INDENT_PER_LEVEL * item.level : 0,
            transition: "padding-left 0.2s",
          }}
        >
          {item.name}
        </div>
      ),
    },
    {
      header: "Hiển thị",
      className: "py-2 w-30 text-center",
      accessor: (item: FlatModule) => {
        return (
          <Checkbox
            checked={item.isChecked}
            onCheckedChange={(checked) =>
              handleCheckboxChange(item, checked as boolean)
            }
          />
        );
      },
    },
    {
      header: "Thao tác",
      type: "actions",
      className: "py-2 w-24 text-center",
      renderActions: (item: FlatModule) => (
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => doOpenEdit(item.id)}
            className="bg-blue-50 hover:bg-blue-100"
            disabled={isLoadingModuleDetail && selectedModuleId === item.id}
          >
            <Edit className="w-4 h-4 mr-1" />
            Sửa
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => doDelete(item.id as number)}
            className="bg-red-50 hover:bg-red-100 text-red-600"
          >
            <Trash2 className="w-4 h-4 mr-1" />
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  const visibleModules = flatModules.filter(isVisible);

  return (
    <div className="container mx-auto px-4">
      <BreadcrumbNavigation
        items={[
          {
            href: "/",
            label: "Quản trị hệ thống",
          },
        ]}
        currentPage="Quản lý Module"
        showHome={false}
      />
      <div
        className="flex justify-between items-center border rounded-lg p-4 mt-4"
        style={{ backgroundColor: "#E8E9EB" }}
      >
        <div>
          <h4 className="text-lg font-semibold mb-1">Quản lý Module</h4>
          <p className="text-sm text-muted-foreground">
            Cho phép thay đổi thứ tự menu và cấu hình menu ngang
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => doOpenAdd()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="w-4 h-4 mr-2" />
            Thêm mới
          </Button>
          <Button
            onClick={doSave}
            disabled={loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Save className="w-4 h-4 mr-2" />
            Lưu lại
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto mt-4">
        <Table
          dataSource={visibleModules}
          columns={moduleColumns}
          className="w-full border-collapse border border-gray-300"
          bgColor="bg-white"
          loading={isLoadingModules}
          showPagination={false}
          sortable={false}
          rowClassName={(item: FlatModule) =>
            item.level === 0 ? "bg-blue-100" : "bg-white"
          }
          emptyText={
            isLoadingModules
              ? "Đang tải dữ liệu..."
              : errorModules
                ? `Lỗi: ${errorModules.message}`
                : "Không tồn tại module"
          }
        />
      </div>

      <div className="mt-4">
        <Button
          onClick={doSave}
          disabled={loading}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Save className="w-4 h-4 mr-2" />
          Lưu
        </Button>
      </div>

      <ConfirmDeleteDialog
        isOpen={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa"
        description="Bạn có muốn xóa module này không?"
        confirmText="Xóa"
        cancelText="Hủy"
        isLoading={loading}
      />

      <ModuleDialog
        isOpen={moduleDialogOpen}
        onOpenChange={setModuleDialogOpen}
        onSave={handleModuleSave}
        moduleData={editingModule}
        isEdit={isEditMode}
        loading={isLoadingModuleDetail}
        listModule={listModule}
      />
    </div>
  );
}
