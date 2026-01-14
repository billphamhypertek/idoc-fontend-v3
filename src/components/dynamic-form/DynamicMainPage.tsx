"use client";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import StatusBadge from "@/components/common/StatusBadge";
import { SearchInput } from "@/components/document-in/SearchInput";
import { CompleteButton } from "@/components/room-request/CompleteButton";
import { RecallButton } from "@/components/room-request/RecallButton";
import { TransferHandler } from "@/components/room-request/transferHandler";
import { Table } from "@/components/ui/table";
import { Column } from "@/definitions";
import { STORAGE_KEYS } from "@/definitions/constants/storageKey.constant";
import {
  FORMHANLDESTATUS,
  FORMHANLDETYPE,
} from "@/definitions/enums/common.enum";
import { useGetDynamicFormMainQuery } from "@/hooks/data/form-dynamic.data";
import { useGetValueDynamicList } from "@/hooks/data/value-dynamic.data";
import { findIdByRouterPathSafe } from "@/utils/common.utils";
import { AlertCircle } from "lucide-react";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

interface DynamicMainPageProps {
  type: string;
}

export default function DynamicMainPage({ type }: DynamicMainPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useParams();

  const currentTabParam = searchParams?.get("currentTab") || "CHO_XU_LY";
  const activeTab =
    currentTabParam === "CHO_XU_LY"
      ? "pending"
      : currentTabParam === "DA_XU_LY"
        ? "processed"
        : currentTabParam === "HOAN_THANH"
          ? "completed"
          : "pending";

  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchText, setSearchText] = useState("");
  const [selectedFormIdForList, setSelectedFormIdForList] = useState<
    number | null
  >(null);
  const itemsPerPageRef = useRef(itemsPerPage);
  const pageParam = searchParams?.get("page") || "1";
  const sizeParam = searchParams?.get("size") || "10";

  const workflowId = params?.typeId as string;
  const typeWorkflow = type;

  const { data: dynamicForm, isLoading: isLoadingForm } =
    useGetDynamicFormMainQuery(Number(workflowId));
  const formId = dynamicForm?.data?.id;

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

  useEffect(() => {
    setCurrentPage(1);
    setSelectedItems([]);
    setItemsPerPage(10);
  }, [currentTabParam]);

  const pendingParams = useMemo(
    () => ({
      page: currentPage,
      size: itemsPerPage,
      formId: currentFormId,
      handleType: FORMHANLDETYPE.XU_LY_CHINH,
      handleStatus:
        FORMHANLDESTATUS.WAIT_HANDLE +
        "," +
        FORMHANLDESTATUS.REJECT +
        "," +
        FORMHANLDESTATUS.RECALL,

      search: searchText || undefined,
      moduleId: moduleId || undefined,
    }),
    [currentPage, itemsPerPage, currentFormId, searchText]
  );

  const {
    data: pendingData,
    isLoading: isPendingLoading,
    refetch: refetchPendingData,
  } = useGetValueDynamicList(pendingParams, !!currentFormId && !isLoadingForm);

  const processedParams = useMemo(
    () => ({
      page: currentPage,
      size: itemsPerPage,
      formId: currentFormId,
      handleType: FORMHANLDETYPE.XU_LY_CHINH,
      handleStatus: FORMHANLDESTATUS.HANDLED,

      search: searchText || undefined,
      moduleId: moduleId || undefined,
    }),
    [currentPage, itemsPerPage, currentFormId, searchText]
  );

  const {
    data: processedData,
    isLoading: isProcessedLoading,
    refetch: refetchProcessedData,
  } = useGetValueDynamicList(
    processedParams,
    !!currentFormId && !isLoadingForm
  );

  const completedParams = useMemo(
    () => ({
      page: currentPage,
      size: itemsPerPage,
      formId: currentFormId,
      handleType: FORMHANLDETYPE.XU_LY_CHINH,
      handleStatus: FORMHANLDESTATUS.DONE,
      search: searchText || undefined,
      moduleId: moduleId || undefined,
    }),
    [currentPage, itemsPerPage, currentFormId, searchText, moduleId]
  );

  const {
    data: completedData,
    isLoading: isCompletedLoading,
    refetch: refetchCompletedData,
  } = useGetValueDynamicList(
    completedParams,
    !!currentFormId && !isLoadingForm
  );

  const currentData =
    activeTab === "pending"
      ? pendingData
      : activeTab === "processed"
        ? processedData
        : completedData;

  const isCurrentLoading =
    activeTab === "pending"
      ? isPendingLoading
      : activeTab === "processed"
        ? isProcessedLoading
        : isCompletedLoading;

  const currentRefetch =
    activeTab === "pending"
      ? refetchPendingData
      : activeTab === "processed"
        ? refetchProcessedData
        : refetchCompletedData;

  const fieldList = currentData?.data?.fieldShowListDtoList || [];
  const objList = currentData?.data?.listValue?.objList || [];
  const totalElements = currentData?.data?.listValue?.totalElements || 0;
  const totalPages = currentData?.data?.listValue?.totalPages || 0;

  const pendingCount = pendingData?.data?.listValue?.totalRecord || 0;
  const processedCount = processedData?.data?.listValue?.totalRecord || 0;
  const completedCount = completedData?.data?.listValue?.totalRecord || 0;

  const selectedId = Number(selectedItems[0]) || null;
  const selectedItem = objList.find((item: any) => item.id === selectedId);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedItems([]);

    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("page", String(page));
    params.set("size", String(itemsPerPageRef.current));
    params.set("currentTab", currentTabParam);
    router.replace(`${pathname}?${params.toString()}`);
  };

  const handleSuccess = async () => {
    await currentRefetch();
    setSelectedItems([]);
  };

  const handleEdit = (item: any, e: React.MouseEvent) => {
    e.stopPropagation();
    router.push(`/request/${workflowId}/main/update/${item.id}`);
  };

  const handleRowClick = (item: any) => {
    router.push(`/request/${workflowId}/main/detail/${item.id}`);
  };

  const handleSelectRow = (selectedKeys: React.Key[]) => {
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
      accessor: (row: any) => (
        <StatusBadge status={row.status || "Chờ xử lý"} />
      ),
      className: "py-1 status-column",
    });
    return cols;
  }, [fieldList]);

  const showTransferButton =
    activeTab === "pending" && selectedItems.length === 1;
  const showRecallButton = activeTab === "pending" && selectedItems.length > 0;
  const showCompleteButton =
    activeTab === "pending" && selectedItems.length > 0;

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center justify-between gap-4 mb-4">
        <BreadcrumbNavigation
          items={[{ label: formLabel }]}
          currentPage="Xử lý chính"
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
            placeholder="Tìm kiếm phiếu"
            value={searchText}
            setSearchInput={(v) => {
              setSearchText(v);
              setCurrentPage(1);
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 flex-wrap">
        {showTransferButton && (
          <TransferHandler
            selectedItemId={selectedId}
            currentNode={selectedItem?.nodeId || null}
            formType={typeWorkflow}
            disabled={false}
            onSuccess={handleSuccess}
            formId={selectedFormIdForList?.toString() || ""}
          />
        )}

        {showRecallButton && (
          <RecallButton
            valueIds={selectedItems.map((id) => Number(id))}
            disabled={selectedItems.length === 0}
            onSuccess={handleSuccess}
          />
        )}

        {showCompleteButton && (
          <CompleteButton
            valueIds={selectedItems.map((id) => Number(id))}
            disabled={selectedItems.length === 0}
            onSuccess={handleSuccess}
          />
        )}
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8" aria-label="Tabs">
          <button
            onClick={() => {
              const params = new URLSearchParams();
              params.set("currentTab", "CHO_XU_LY");
              params.set("page", "1");
              params.set("size", String(itemsPerPageRef.current));
              router.replace(`${pathname}?${params.toString()}`);
            }}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${
                activeTab === "pending"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }
            `}
          >
            Chờ xử lý
            <span
              className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                activeTab === "pending"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {pendingCount}
            </span>
          </button>

          <button
            onClick={() => {
              const params = new URLSearchParams();
              params.set("currentTab", "DA_XU_LY");
              params.set("page", "1");
              params.set("size", String(itemsPerPageRef.current));
              router.replace(`${pathname}?${params.toString()}`);
            }}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${
                activeTab === "processed"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }
            `}
          >
            Đã xử lý
            <span
              className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                activeTab === "processed"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {processedCount}
            </span>
          </button>

          <button
            onClick={() => {
              const params = new URLSearchParams();
              params.set("currentTab", "HOAN_THANH");
              params.set("page", "1");
              params.set("size", String(itemsPerPageRef.current));
              router.replace(`${pathname}?${params.toString()}`);
            }}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${
                activeTab === "completed"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }
            `}
          >
            Hoàn thành
            <span
              className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                activeTab === "completed"
                  ? "bg-blue-100 text-blue-600"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {completedCount}
            </span>
          </button>
        </nav>
      </div>

      <Table
        sortable={true}
        columns={columns}
        dataSource={isCurrentLoading ? [] : objList}
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
        rowSelection={{
          selectedRowKeys: selectedItems,
          onChange: (keys) => {
            setSelectedItems(keys as string[]);
          },
          rowKey: "id",
        }}
        onItemsPerPageChange={(size) => {
          itemsPerPageRef.current = size;
          setCurrentPage(1);
          setItemsPerPage(size);

          const params = new URLSearchParams(searchParams?.toString() || "");
          params.set("page", "1");
          params.set("size", String(size));
          params.set("currentTab", currentTabParam);
          router.replace(`${pathname}?${params.toString()}`);
        }}
        loading={isCurrentLoading}
        onSort={(sortConfig) => {
          console.log("Sort changed:", sortConfig);
        }}
      />
    </div>
  );
}
