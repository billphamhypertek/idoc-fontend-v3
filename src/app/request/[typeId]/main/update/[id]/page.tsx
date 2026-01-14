"use client";
import React, { useMemo } from "react";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import { DynamicFormComponent } from "@/components/dynamic-form/DynamicFormComponent";
import { STORAGE_KEYS } from "@/definitions/constants/storageKey.constant";
import { useParams, usePathname, useSearchParams } from "next/navigation";
import { findIdByRouterPathSafe } from "@/utils/common.utils";

export default function DynamicRequestUpdatePage() {
  const params = useParams();
  const typeId = params?.typeId as string;
  const searchParams = useSearchParams();
  const formId = searchParams?.get("formId") || "";
  const id = params?.id || "";
  const pathname = usePathname();

  // Get parent module name based on moduleId
  const pageLabel = useMemo(() => {
    const allModules = localStorage.getItem(STORAGE_KEYS.MODULES);
    const modules = allModules ? JSON.parse(allModules) : [];
    const moduleId = findIdByRouterPathSafe(modules, pathname || "");

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
    if (currentModule?.parentId) {
      const parentModule = findModuleById(modules, currentModule.parentId);
      return parentModule?.name?.trim() || "Quản lý workflow";
    }
    return currentModule?.name?.trim() || "Quản lý workflow";
  }, []);

  return (
    <div className="pl-4 pr-4 space-y-4">
      <BreadcrumbNavigation
        items={[{ href: `/request/${typeId}/register`, label: pageLabel }]}
        currentPage="Cập nhật phiếu"
      />
      <DynamicFormComponent
        typeId={Number(typeId)}
        formId={Number(formId)}
        id={Number(id)}
      />
    </div>
  );
}
