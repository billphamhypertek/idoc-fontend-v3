"use client";

import AttachmentDialog2 from "@/components/common/AttachmentDialog2";
import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import { SearchInput } from "@/components/document-in/SearchInput";
import AdvancedSearch from "@/components/document-out/list/AdvancedSearch";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";
import { Constant } from "@/definitions/constants/constant";
import type { DocumentOutItem } from "@/definitions/types/document-out.type";
import type { Column } from "@/definitions/types/table.type";
import {
  useFindBasicAllDoc,
  useGetImportantDocs,
  useToggleImportant,
} from "@/hooks/data/document-out.data";
import { useFileViewer } from "@/hooks/useFileViewer";
import { cn } from "@/lib/utils";
import { DocumentOutService } from "@/services/document-out.service";
import { generateExcelDocumentOut } from "@/services/export.service";
import { downloadFileTable } from "@/services/file.service";
import { canViewNoStatus } from "@/utils/common.utils";
import { formatDate } from "@/utils/datetime.utils";
import { ToastUtils } from "@/utils/toast.utils";
import { AlertCircle, Paperclip, RotateCcw, Search, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useState } from "react";
import { useGetCategoriesByCode } from "@/hooks/data/category.data";
import { EmptyDocument } from "@/components/common/EmptyDocument";
import EncryptDisplaySelect from "@/components/document-out/EncryptDisplaySelect";
import { useEncryptStore } from "@/stores/encrypt.store";
import { EncryptionService } from "@/services/encryption.service";

const defaultAdvanceSearchState = {
  preview: "",
  docTypeId: "",
  docFieldsId: "",
  important: "true",
  expired: "",
  encryptShowing: "false",
};

export default function ImportantDocumentsPage() {
  const { isEncrypt } = useEncryptStore();

  const router = useRouter();
  const { viewFile } = useFileViewer();
  const { mutate: toggleImportant } = useToggleImportant();
  const { data: docTypeCategory } = useGetCategoriesByCode(
    Constant.CATEGORYTYPE_CODE.DOC_TYPE
  );

  const [page, setPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [quickSearch, setQuickSearch] = useState(false);
  const [text, setText] = useState("");
  const [isAdvancedSearchExpanded, setIsAdvancedSearchExpanded] =
    useState(false);
  const [advancedSearch, setAdvancedSearch] = useState(
    defaultAdvanceSearchState
  );
  const [tempAdvancedSearch, setTempAdvancedSearch] = useState(
    defaultAdvanceSearchState
  );
  const [openAttach, setOpenAttach] = useState(false);
  const [selectedAttachments, setSelectedAttachments] = useState<any[]>([]);
  const [sortBy, setSortBy] = useState("");
  const [sortDirection, setSortDirection] = useState<"ASC" | "DESC">("DESC");

  useEffect(() => {
    if (isEncrypt) {
      EncryptionService.isCheckStartUsbTokenWatcher();
    }
  }, [isEncrypt]);

  const params = useMemo(() => {
    if (!quickSearch) {
      return {
        dayLeft: "",
        page,
        sortBy,
        direction: sortDirection,
        posId: "",
        size: itemsPerPage,
        important: "true",
        preview: advancedSearch.preview,
        docTypeId: advancedSearch.docTypeId,
        docFieldsId: advancedSearch.docFieldsId,
        expired: advancedSearch.expired,
      };
    } else {
      return {
        text,
        page,
        sortBy,
        direction: sortDirection,
        size: itemsPerPage,
      };
    }
  }, [
    text,
    page,
    itemsPerPage,
    advancedSearch,
    quickSearch,
    sortBy,
    sortDirection,
  ]);

  const { data, isLoading, isError, error } = useGetImportantDocs(
    params,
    !quickSearch
  );

  const { data: dataSearch } = useFindBasicAllDoc(params, quickSearch);

  const rawRows = !quickSearch
    ? (data?.objList ?? [])
    : (dataSearch?.objList ?? []);
  const total = !quickSearch
    ? (data?.totalRecord ?? 0)
    : (dataSearch?.totalRecord ?? 0);

  const handleExportExcel = async () => {
    try {
      const query = isAdvancedSearchExpanded
        ? {
            sortBy: "",
            direction: "DESC",
            dayLeft: "",
            posId: "",
            important: "true",
            preview: advancedSearch.preview,
            docTypeId: advancedSearch.docTypeId,
            docFieldsId: advancedSearch.docFieldsId,
            expired: advancedSearch.expired,
          }
        : {
            text,
            sortBy: "",
            direction: "DESC",
          };

      const data = await DocumentOutService.exportExcelDocumentIn(query);
      const list: any[] = Array.isArray(data) ? data : (data?.objList ?? []);

      const excelJson: any[] = [];
      let index = 0;
      list.forEach((r) => {
        excelJson.push([
          ++index,
          r.dateIssued
            ? new Date(r.dateIssued).toLocaleDateString("vi-VN")
            : r.handleDate
              ? new Date(r.handleDate).toLocaleDateString("vi-VN")
              : "",
          r.numberArrivalStr ?? r.numberOrSign ?? "",
          r.placeSend ?? r.parentPlaceSend ?? "",
          r.numberArrival ?? "",
          r.dateArrival
            ? new Date(r.dateArrival).toLocaleDateString("vi-VN")
            : "",
          r.preview ?? "",
          r.orgExe ?? "",
          r.deadline ? new Date(r.deadline).toLocaleDateString("vi-VN") : "",
        ]);
      });

      const header = [
        "STT",
        "Ngày ban hành",
        "Số/Ký hiệu",
        "Đơn vị ban hành",
        "Số đến",
        "Ngày văn bản",
        "Trích yếu",
        "Đơn vị XL",
        "Hạn văn bản",
      ];

      await generateExcelDocumentOut(
        "SỔ IN BÁO CÁO VĂN BẢN ĐẾN",
        header,
        excelJson,
        "THONG_KE_VAN_BAN_DEN",
        Array.isArray(list) ? list.length : 0,
        null,
        null
      );
    } catch (err: any) {
      ToastUtils.error(err?.message || "Có lỗi xảy ra khi export Excel");
    }
  };

  const rows = rawRows; // Use raw data from API (server-side sorting)

  // Handler for sort from Table component
  const handleSort = (
    config: { key: string; direction: "asc" | "desc" | null } | null
  ) => {
    if (!config || !config.direction) {
      setSortBy("");
      setSortDirection("DESC");
    } else {
      const mappedDirection = config.direction === "asc" ? "ASC" : "DESC";
      setSortBy(config.key);
      setSortDirection(mappedDirection);
    }
    setPage(1); // Reset to page 1 when sorting
  };

  const columns: Column<DocumentOutItem>[] = [
    {
      header: "STT",
      accessor: (_r, idx) => (page - 1) * itemsPerPage + idx + 1,
      sortable: false,
      className: "text-center w-[70px]",
    },
    {
      header: <Star className="h-4 w-4 text-gray-400 mx-auto" />,
      type: "actions",
      className: "text-center w-10",
      sortable: false,
      renderActions: (r) => {
        const starred = Boolean(r.important);
        return (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleImportant({
                docId: r.docId,
                important: !starred,
              });
            }}
            aria-label={starred ? "Bỏ đánh dấu" : "Đánh dấu"}
            title={starred ? "Bỏ đánh dấu" : "Đánh dấu"}
            className="inline-flex items-center justify-center"
          >
            <Star
              className={cn(
                "w-4 h-4 mx-auto cursor-pointer hover:opacity-70",
                r.important
                  ? "fill-yellow-400 text-yellow-400 stroke-yellow-600 stroke-2"
                  : "text-gray-400"
              )}
            />
          </button>
        );
      },
    },
    {
      header: "Số đến",
      sortKey: "NUMBER_ARRIVAL",
      accessor: (r) => {
        const value = String(r.numberArrival ?? "");
        return (
          <span className="block truncate" title={value}>
            {value}
          </span>
        );
      },
      className: "text-center w-[80px]",
    },
    {
      header: "Ngày văn bản",
      sortKey: "DATE_ARRIVAL",
      accessor: (r) => formatDate(r.dateArrival),
      className: "text-center whitespace-nowrap tabular-nums w-32",
    },
    {
      header: "Ngày vào sổ",
      sortKey: "DATEISSUED",
      accessor: (r) => formatDate(r.dateIssued),
      className: "text-center whitespace-nowrap tabular-nums w-32",
    },
    {
      header: "Ngày nhận văn bản",
      sortKey: "DATE_RECEIVED",
      accessor: (r) => formatDate(r.receivedDate),
      className: "text-center whitespace-nowrap tabular-nums w-32",
    },
    {
      header: "Số, KH của VB đến",
      sortKey: "NUMBERSIGN",
      accessor: (r) => {
        const value = r.numberArrivalStr ?? "";
        return (
          <span className="block truncate" title={value}>
            {value}
          </span>
        );
      },
      className: "text-left w-[180px]",
    },
    {
      header: "Trích yếu",
      sortKey: "PREVIEW",
      accessor: (r) => {
        const value = r.preview ?? "";
        return (
          <div
            className="max-w-[700px] line-clamp-2 text-sm leading-relaxed text-ellipsis"
            title={value}
          >
            {value}
          </div>
        );
      },
      className: "text-left min-w-[300px] w-[45%]",
    },
    {
      header: "Đơn vị ban hành",
      sortKey: "ORG_ISSUED_NAME",
      accessor: (r) => {
        const value = r.placeSend ?? r.parentPlaceSend ?? "";
        return (
          <span className="block truncate" title={value}>
            {value}
          </span>
        );
      },
      className: "text-left w-[220px]",
    },
    {
      header: "Đơn vị XL",
      sortable: false,
      accessor: (r) => {
        const value = r.orgExe ?? "";
        return (
          <span className="block truncate" title={value}>
            {value}
          </span>
        );
      },
      className: "text-left w-[220px]",
    },
    {
      header: "Hạn văn bản",
      sortKey: "DEADLINE",
      accessor: (r) => formatDate(r.deadline),
      className: "text-center whitespace-nowrap tabular-nums w-40",
    },
    {
      header: "File",
      sortable: false,
      accessor: (r) =>
        (r.attachments?.length ?? 0) > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={async (e) => {
              e.stopPropagation();
              if (r.attachments?.length === 1) {
                const attachment = r.attachments[0];
                if (canViewNoStatus(attachment.name)) {
                  await viewFile(
                    attachment,
                    "",
                    true,
                    Constant.ATTACHMENT.DOWNLOAD
                  );
                } else {
                  await downloadFileTable(
                    attachment.name,
                    attachment?.displayName ?? ""
                  );
                }
                return;
              } else {
                setSelectedAttachments(r.attachments || []);
                setOpenAttach(true);
              }
            }}
            className="flex items-center justify-center text-blue-600 hover:underline hover:bg-transparent"
            title={`Có ${r.attachments?.length} tệp đính kèm`}
          >
            <Paperclip className="w-4 h-4 text-white-600" />
          </Button>
        ) : (
          ""
        ),
      className: "text-center w-[70px]",
    },
  ];

  if (isError) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex flex-col items-center gap-3 py-8">
          <AlertCircle className="w-12 h-12 text-red-400" />
          <div className="text-center">
            <p className="text-red-500 font-medium">Lỗi tải dữ liệu</p>
            <p className="text-sm text-red-400">{(error as Error)?.message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 space-y-4">
      {/* Breadcrumb và Search cùng hàng */}
      <div className="flex items-center justify-between gap-4">
        <BreadcrumbNavigation
          items={[
            {
              label: "Văn bản đến",
            },
          ]}
          currentPage="Văn bản quan trọng"
          showHome={false}
        />

        <div className="flex items-center gap-3">
          <SearchInput
            placeholder="Tìm kiếm Số, KH của VB đến | Trích yếu"
            value={text}
            setSearchInput={(value) => {
              setQuickSearch(true);
              setText(value);
              setPage(1);
              setIsAdvancedSearchExpanded(false);
              setAdvancedSearch(defaultAdvanceSearchState);

              if (value.trim() === "") {
                setQuickSearch(false);
                setAdvancedSearch(defaultAdvanceSearchState);
                setPage(1);
              }
            }}
          />

          <Button
            onClick={() => {
              const newExpanded = !isAdvancedSearchExpanded;
              setIsAdvancedSearchExpanded(newExpanded);
              if (!newExpanded) {
                setAdvancedSearch(defaultAdvanceSearchState);
                setPage(1);
              }
            }}
            className="h-8 py-1 px-3 text-xs transition-all duration-200 bg-blue-600 text-white hover:bg-blue-700 hover:text-white border-none"
          >
            <Search className="mr-1 h-4 w-4" />
            {isAdvancedSearchExpanded
              ? "Thu gọn tìm kiếm"
              : "Tìm kiếm nâng cao"}
          </Button>
        </div>
      </div>
      <div className="w-full flex justify-end">
        <EncryptDisplaySelect selectClassName="w-36 h-9 text-xs" />
      </div>
      {isAdvancedSearchExpanded && (
        <AdvancedSearch
          preview={tempAdvancedSearch.preview}
          onChangePreview={(v) => {
            setTempAdvancedSearch((p) => ({
              ...p,
              preview: v,
            }));
          }}
          docTypeOptions={
            docTypeCategory
              ?.filter((item) => item.id !== null && item.id !== undefined)
              .map((item) => ({
                id: String(item.id),
                name: item.name,
              })) || []
          }
          docTypeId={tempAdvancedSearch.docTypeId}
          onChangeDocType={(val) => {
            setTempAdvancedSearch((p) => ({
              ...p,
              docTypeId: val === "all" ? "" : val,
            }));
          }}
          expired={tempAdvancedSearch.expired}
          onChangeExpired={(val) => {
            setTempAdvancedSearch((p) => ({
              ...p,
              expired: val,
            }));
          }}
          onSubmit={() => {
            setAdvancedSearch(tempAdvancedSearch);
            setQuickSearch(false);
            setPage(1);
          }}
          extraBtn={
            <>
              <Button
                variant="outline"
                onClick={() => {
                  setQuickSearch(false);
                  setTempAdvancedSearch(defaultAdvanceSearchState);
                  setAdvancedSearch(defaultAdvanceSearchState);
                  setPage(1);
                }}
                className="h-9 px-4 text-sm font-medium"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Đặt lại
              </Button>
              <Button
                className="h-9 px-3 text-xs bg-blue-600 hover:bg-blue-700 text-white"
                onClick={handleExportExcel}
                disabled={rows.length <= 0}
              >
                Xuất Excel
              </Button>
            </>
          }
        />
      )}

      <Table<DocumentOutItem>
        sortable={true}
        clientSort={false}
        onSort={handleSort}
        columns={columns}
        dataSource={rows}
        itemsPerPage={itemsPerPage}
        currentPage={page}
        onPageChange={setPage}
        totalItems={total}
        showPagination
        emptyText={<EmptyDocument />}
        loading={isLoading}
        hasAllChange
        onItemsPerPageChange={(n) => {
          setItemsPerPage(n);
          setPage(1);
        }}
        rowSelection={undefined}
        rowClassName={() => {
          return "hover:!bg-white";
        }}
        bgColor={"bg-white"}
        onRowClick={(r) => {
          router.push(`/document-out/search/detail/${r.docId}`);
        }}
      />

      <AttachmentDialog2
        open={openAttach}
        onOpenChange={setOpenAttach}
        data={selectedAttachments}
      />
    </div>
  );
}
