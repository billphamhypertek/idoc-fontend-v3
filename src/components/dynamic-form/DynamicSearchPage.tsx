"use client";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import StatusBadge from "@/components/common/StatusBadge";
import { SearchInput } from "@/components/document-in/SearchInput";
import { Table } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Column } from "@/definitions";
import { STORAGE_KEYS } from "@/definitions/constants/storageKey.constant";
import { useGetDynamicFormMainQuery } from "@/hooks/data/form-dynamic.data";
import { useGetValueDynamicListFull } from "@/hooks/data/value-dynamic.data";
import { findIdByRouterPathSafe } from "@/utils/common.utils";
import { AlertCircle, Plus } from "lucide-react";
import AdvancedSearchDynamic, {
  DynamicFilters,
} from "@/components/dynamic-form/AdvancedSearchDynamic";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

interface DynamicSearchPageProps {
  type: string;
}

export default function DynamicSearchPage({ type }: DynamicSearchPageProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [selectedFormIdForList, setSelectedFormIdForList] = useState<
    number | null
  >(null);
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<DynamicFilters>({});
  const itemsPerPageRef = useRef(itemsPerPage);
  const pageParam = searchParams?.get("page") || "1";
  const sizeParam = searchParams?.get("size") || "10";
  const workflowId = params?.typeId as string;
  const typeWorkflow = type;

  const allModules = localStorage.getItem(STORAGE_KEYS.MODULES);
  const modules = allModules ? JSON.parse(allModules) : [];
  const moduleId = findIdByRouterPathSafe(modules, pathname || "");

  // Get parent module name based on moduleId
  const formLabel = useMemo(() => {
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
  }, [modules, moduleId]);

  const { data: dynamicForm, isLoading: isLoadingForm } =
    useGetDynamicFormMainQuery(Number(workflowId));
  const formId = dynamicForm?.data?.id;

  // Lấy danh sách forms
  const forms = useMemo(() => {
    return dynamicForm?.data || [];
  }, [dynamicForm?.data]);

  // Tự động chọn formId
  useEffect(() => {
    if (forms.length > 0 && selectedFormIdForList === null) {
      setSelectedFormIdForList(forms[0].id);
    }
  }, [forms, selectedFormIdForList]);

  // FormId để dùng trong param API
  const currentFormId = selectedFormIdForList || formId;

  useEffect(() => {
    const parsedPage = Number(pageParam);
    const parsedSize = Number(sizeParam);
    if (
      !Number.isNaN(parsedPage) &&
      parsedPage > 0 &&
      parsedPage !== currentPage
    ) {
      setCurrentPage(parsedPage);
    }
    if (
      !Number.isNaN(parsedSize) &&
      parsedSize > 0 &&
      parsedSize !== itemsPerPage
    ) {
      setItemsPerPage(parsedSize);
    }
  }, [pageParam, sizeParam]);

  useEffect(() => {
    itemsPerPageRef.current = itemsPerPage;
  }, [itemsPerPage]);

  const searchParams_useMemo = useMemo(
    () => ({
      page: currentPage,
      size: itemsPerPage,
      formId: currentFormId,
      search: searchText || undefined,
      moduleId: moduleId || undefined,
    }),
    [currentPage, itemsPerPage, currentFormId, searchText, moduleId]
  );

  const {
    data: searchData,
    isLoading,
    refetch,
  } = useGetValueDynamicListFull(
    searchParams_useMemo,
    appliedFilters,
    !!currentFormId && !isLoadingForm
  );

  const fieldList = searchData?.data?.fieldShowListDtoList || [];
  const fieldSearchList = searchData?.data?.fieldSearchDtoList || [];
  const objList = searchData?.data?.listValue?.objList || [];
  const totalElements = searchData?.data?.listValue?.totalElements || 0;

  // Get field details for selected form
  const fieldDetails = useMemo(() => {
    if (!dynamicForm?.data || !currentFormId) return [];
    const selectedForm = dynamicForm.data.find(
      (form: any) => form.id === currentFormId
    );
    return selectedForm?.fields || [];
  }, [dynamicForm?.data, currentFormId]);

  const columns: Column<any>[] = useMemo(() => {
    const cols: Column<any>[] = [
      {
        header: "STT",
        accessor: (_: any, index: number) => (
          <span className="text-xs font-medium">
            {(currentPage - 1) * itemsPerPage + index + 1}
          </span>
        ),
        className: "text-center py-2 w-16",
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
      accessor: (row: any) => (
        <StatusBadge status={row.status || "Chờ xử lý"} />
      ),
      className: "py-1 status-column",
    });

    return cols;
  }, [fieldList, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("page", String(page));
    params.set("size", String(itemsPerPageRef.current));
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleRowClick = (item: any) => {
    router.push(`/request/${workflowId}/search/detail/${item.id}`);
  };

  const handleApplyFilters = (filters: DynamicFilters) => {
    setAppliedFilters(filters);
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("page", "1");
    params.set("size", String(itemsPerPageRef.current));
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleResetFilters = () => {
    setAppliedFilters({});
    setCurrentPage(1);
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("page", "1");
    params.set("size", String(itemsPerPageRef.current));
    router.replace(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-4 p-4">
      <BreadcrumbNavigation
        items={[{ label: formLabel }]}
        currentPage="Tìm kiếm tra cứu"
        showHome={false}
      />
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1" />
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
        <Button
          onClick={() => setIsAdvancedSearchOpen(!isAdvancedSearchOpen)}
          variant="outline"
          className="h-9 px-4 text-sm font-medium bg-blue-600 hover:bg-blue-700 text-white hover:text-white"
        >
          <Plus
            className={`w-4 h-4 mr-2 transition-transform ${
              isAdvancedSearchOpen ? "rotate-45" : ""
            }`}
          />
          {isAdvancedSearchOpen ? "Thu gọn tìm kiếm" : "Tìm kiếm nâng cao"}
        </Button>
      </div>

      {isAdvancedSearchOpen && (
        <AdvancedSearchDynamic
          fieldSearchList={fieldSearchList}
          fieldDetails={fieldDetails}
          initialFilters={appliedFilters}
          appliedFilters={appliedFilters}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
        />
      )}

      <Table
        sortable={true}
        columns={columns}
        dataSource={isLoading ? [] : objList}
        itemsPerPage={itemsPerPage}
        currentPage={currentPage}
        totalItems={totalElements}
        onPageChange={handlePageChange}
        showPagination={true}
        bgColor="bg-white"
        onRowClick={handleRowClick}
        className="overflow-hidden"
        emptyText={
          <div className="flex flex-col items-center justify-center py-12">
            <AlertCircle className="w-12 h-12 text-gray-400 mb-3" />
            <p className="text-gray-500 text-sm">Không có dữ liệu</p>
          </div>
        }
        pageSizeOptions={[5, 10, 25, 50]}
        onItemsPerPageChange={(size) => {
          itemsPerPageRef.current = size;
          setCurrentPage(1);
          setItemsPerPage(size);

          const params = new URLSearchParams(searchParams?.toString() || "");
          params.set("page", "1");
          params.set("size", String(size));
          router.replace(`${pathname}?${params.toString()}`);
        }}
        loading={isLoading}
        onSort={(sortConfig) => {
          console.log("Sort changed:", sortConfig);
        }}
      />
    </div>
  );
}
