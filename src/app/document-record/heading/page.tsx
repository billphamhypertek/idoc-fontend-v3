"use client";

import React, { useMemo, useState, useEffect } from "react";
import dayjs from "dayjs";

import BreadcrumbNavigation from "@/components/common/BreadcrumbNavigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import SelectCustom from "@/components/common/SelectCustom";
import { Table } from "@/components/ui/table";
import { Column } from "@/definitions/types/table.type";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Search as SearchIcon,
  Folder,
  FileText,
  FileDown,
  Archive,
  ChevronRight,
  ChevronDown,
  Calendar as CalendarIcon,
  Paperclip,
  List,
} from "lucide-react";

import {
  useHeadingSearchInit,
  useHeadingFolderTree,
} from "@/hooks/document-record";
import {
  buildHeadingQueryParams,
  toUiTree,
} from "@/lib/document-record.transform";
import type {
  SearchInitData,
  HeadingSearchParams,
  UiTreeNode,
} from "@/definitions/types/document-record";
import { DocumentRecordService } from "@/services/document-record.service";
import { saveFile } from "@/utils/common.utils";

function downloadBlob(
  data: Blob | ArrayBuffer,
  filename: string,
  mime = "application/octet-stream"
) {
  const blob = data instanceof Blob ? data : new Blob([data], { type: mime });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}

export default function HeadingPage() {
  const [form, setForm] = useState<HeadingSearchParams>({
    text: "",
    yearFolders: "",
    typeFolders: "",
    maintenance: "-1",
    from: "",
    to: "",
  });

  const [fromDateOpen, setFromDateOpen] = useState(false);
  const [toDateOpen, setToDateOpen] = useState(false);

  const onChange = <K extends keyof HeadingSearchParams>(
    key: K,
    value: HeadingSearchParams[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  // Helper function: Convert yyyy-MM-DD to Date object
  const parseFormDate = (dateStr: string): Date | undefined => {
    if (!dateStr) return undefined;
    const date = dayjs(dateStr, "YYYY-MM-DD").toDate();
    return isNaN(date.getTime()) ? undefined : date;
  };

  // Helper function: Convert Date to yyyy-MM-DD format
  const formatFormDate = (date: Date | undefined): string => {
    if (!date) return "";
    return dayjs(date).format("YYYY-MM-DD");
  };

  // Helper function: Format yyyy-MM-DD to dd/MM/yyyy for display
  const formatDisplayDate = (dateStr: string): string => {
    if (!dateStr) return "";
    const date = dayjs(dateStr, "YYYY-MM-DD");
    return date.isValid() ? date.format("DD/MM/YYYY") : dateStr;
  };

  const handleEnterKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      doSearch();
    }
  };

  const { data: init, isLoading: initLoading } = useHeadingSearchInit();
  const params = useMemo(() => buildHeadingQueryParams(form), [form]);

  const {
    data: rawTree,
    isFetching: treeLoading,
    refetch,
  } = useHeadingFolderTree(params);

  const tree: UiTreeNode[] = useMemo(() => toUiTree(rawTree), [rawTree]);

  // Helper function to collect all node IDs recursively
  const getAllNodeIds = (nodes: UiTreeNode[]): Set<string | number> => {
    const ids = new Set<string | number>();
    const collectIds = (nodes: UiTreeNode[]) => {
      nodes.forEach((node) => {
        if (node.children && node.children.length > 0) {
          ids.add(node.id);
          collectIds(node.children);
        }
      });
    };
    collectIds(nodes);
    return ids;
  };

  // Auto expand all nodes when tree is loaded
  useEffect(() => {
    if (tree.length > 0) {
      const allIds = getAllNodeIds(tree);
      setExpanded(allIds);
    }
  }, [tree]);

  const doSearch = () => refetch();

  const doExportHeading = async () => {
    const file = await DocumentRecordService.exportHeading(params);
    saveFile("Danh_muc_ho_so.doc", file);
  };

  const doDownloadFolder = async () => {
    const file = await DocumentRecordService.exportFolder(params);
    saveFile("Phieu_muc_luc_ho_so_tai_lieu_nop_luu.doc", file);
  };

  const doViewNode = (node: UiTreeNode) => {
    console.log("Xem:", node);
  };

  const [expanded, setExpanded] = useState<Set<string | number>>(
    () => new Set()
  );

  const toggle = (id: string | number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

  // Flatten tree to array for Table component
  const flatTree = useMemo(() => {
    const flattenTree = (
      nodes: UiTreeNode[],
      depth = 0,
      parentPath: string[] = []
    ): Array<UiTreeNode & { depth: number; path: string[] }> => {
      const result: Array<UiTreeNode & { depth: number; path: string[] }> = [];
      nodes.forEach((node) => {
        const currentPath = [...parentPath, String(node.id)];
        const hasChildren = (node.children?.length ?? 0) > 0;
        const isOpen = expanded.has(node.id);

        result.push({
          ...node,
          depth,
          path: currentPath,
        });

        if (hasChildren && isOpen) {
          result.push(...flattenTree(node.children!, depth + 1, currentPath));
        }
      });
      return result;
    };
    return flattenTree(tree);
  }, [tree, expanded]);

  const columns: Column<UiTreeNode & { depth: number; path: string[] }>[] = [
    {
      header: "Tên đề mục/nhóm hồ sơ",
      className: "text-left",
      accessor: (item) => {
        const hasChildren = (item.children?.length ?? 0) > 0;
        const isOpen = expanded.has(item.id);
        return (
          <div
            className="flex items-center"
            style={{ paddingLeft: item.depth ? item.depth * 24 : 8 }}
          >
            {hasChildren ? (
              <button
                type="button"
                className="mr-1 p-1 rounded hover:bg-gray-100"
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(item.id);
                }}
                aria-label={isOpen ? "Thu gọn" : "Mở rộng"}
              >
                {isOpen ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </button>
            ) : (
              <span className="w-6" />
            )}

            <span className="mr-2 inline-block align-middle">
              {item.icon === "folder" ? (
                <Folder className="w-4 h-4 text-amber-600" />
              ) : (
                <List className="w-4 h-4 text-blue-600" />
              )}
            </span>

            <span className="align-middle">{item.label}</span>
          </div>
        );
      },
    },
    {
      header: "Thời hạn",
      className: "text-center w-40",
      accessor: (item) => item.maintenance ?? "",
    },
    {
      header: "Người tạo",
      className: "text-center w-48",
      accessor: (item) => item.creator ?? "",
    },
    {
      header: "Thao tác",
      className: "text-center w-32",
      accessor: () => "",
    },
  ];

  const years = (init as SearchInitData | undefined)?.yearFolders ?? [];
  const types = (init as SearchInitData | undefined)?.typeFolders ?? [];
  const maints = (init as SearchInitData | undefined)?.maintenances ?? [];

  return (
    <div className="p-4">
      <div className="mb-3">
        <BreadcrumbNavigation
          items={[{ label: "Hồ sơ", href: "#" }]}
          currentPage="Danh mục hồ sơ"
          showHome={false}
          className="ml-1"
        />
      </div>

      <div className="rounded-lg border bg-white p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <label className="text-sm font-semibold">Tên hồ sơ/đề mục</label>
            <Input
              className="mt-1 h-9 w-full"
              placeholder="Tìm kiếm tên hồ sơ/đề mục"
              value={form.text ?? ""}
              onChange={(e) => onChange("text", e.target.value)}
              onKeyDown={handleEnterKey}
            />
          </div>
          <div className="w-auto min-w-[120px]">
            <label className="text-sm font-semibold">Năm hồ sơ</label>
            <Input
              list="years"
              className="mt-1 h-9 w-auto min-w-[120px]"
              placeholder="Năm hồ sơ"
              value={form.yearFolders ?? ""}
              onChange={(e) => onChange("yearFolders", e.target.value)}
              onKeyDown={handleEnterKey}
            />
            <datalist id="years">
              {years.map((y) => (
                <option key={String(y)} value={String(y)} />
              ))}
            </datalist>
          </div>

          <div className="w-auto min-w-[150px]">
            <label className="text-sm font-semibold">Số/ký hiệu</label>
            <Input
              list="types"
              className="mt-1 h-9 w-auto min-w-[150px]"
              placeholder="Số/ký hiệu hồ sơ"
              value={form.typeFolders ?? ""}
              onChange={(e) => onChange("typeFolders", e.target.value)}
              onKeyDown={handleEnterKey}
            />
            <datalist id="types">
              {types.map((t) => (
                <option key={t} value={t} />
              ))}
            </datalist>
          </div>

          <div className="w-auto min-w-[160px]">
            <label className="text-sm font-semibold">Thời hạn bảo quản</label>
            <div className="flex-1 min-w-0">
              <SelectCustom
                className="mt-1 h-9 w-auto min-w-[160px]"
                type="single"
                options={[
                  { label: "Tất cả", value: "-1" },
                  ...maints.map((m) => ({
                    label: m.label,
                    value: String(m.id),
                  })),
                ]}
                value={String(form.maintenance ?? "-1")}
                onChange={(val) =>
                  onChange(
                    "maintenance",
                    Array.isArray(val) ? (val[0] ?? "-1") : (val ?? "-1")
                  )
                }
                placeholder="--- Chọn ---"
              />
            </div>
          </div>

          <div className="flex-1 min-w-[300px]">
            <label className="text-sm font-semibold">Thời gian nộp lưu</label>
            <div className="mt-1 grid grid-cols-2 gap-3">
              <div className="relative w-full">
                <Input
                  type="text"
                  className="h-9 pr-8 w-full"
                  value={formatDisplayDate(form.from ?? "")}
                  placeholder="Từ ngày"
                  onChange={(e) => {
                    // Allow manual input in dd/mm/yyyy format
                    const value = e.target.value;
                    if (value === "") {
                      onChange("from", "");
                      return;
                    }
                    // Try to parse dd/mm/yyyy
                    const parts = value.split("/");
                    if (parts.length === 3) {
                      const day = parts[0];
                      const month = parts[1];
                      const year = parts[2];
                      if (
                        day.length === 2 &&
                        month.length === 2 &&
                        year.length === 4
                      ) {
                        const dateStr = `${year}-${month}-${day}`;
                        if (dayjs(dateStr, "YYYY-MM-DD").isValid()) {
                          onChange("from", dateStr);
                        }
                      }
                    }
                  }}
                  onKeyDown={handleEnterKey}
                />
                <Popover open={fromDateOpen} onOpenChange={setFromDateOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer z-10"
                    >
                      <CalendarIcon className="w-4 h-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={parseFormDate(form.from ?? "")}
                      onSelect={(date) => {
                        if (date) {
                          onChange("from", formatFormDate(date));
                          setFromDateOpen(false);
                        }
                      }}
                      disabled={{ after: new Date() }}
                      required={false}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="relative w-full">
                <Input
                  type="text"
                  className="h-9 pr-8 w-full"
                  value={formatDisplayDate(form.to ?? "")}
                  placeholder="Đến ngày"
                  onChange={(e) => {
                    // Allow manual input in dd/mm/yyyy format
                    const value = e.target.value;
                    if (value === "") {
                      onChange("to", "");
                      return;
                    }
                    // Try to parse dd/mm/yyyy
                    const parts = value.split("/");
                    if (parts.length === 3) {
                      const day = parts[0];
                      const month = parts[1];
                      const year = parts[2];
                      if (
                        day.length === 2 &&
                        month.length === 2 &&
                        year.length === 4
                      ) {
                        const dateStr = `${year}-${month}-${day}`;
                        if (dayjs(dateStr, "YYYY-MM-DD").isValid()) {
                          onChange("to", dateStr);
                        }
                      }
                    }
                  }}
                  onKeyDown={handleEnterKey}
                />
                <Popover open={toDateOpen} onOpenChange={setToDateOpen}>
                  <PopoverTrigger asChild>
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer z-10"
                    >
                      <CalendarIcon className="w-4 h-4" />
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={parseFormDate(form.to ?? "")}
                      onSelect={(date) => {
                        if (date) {
                          onChange("to", formatFormDate(date));
                          setToDateOpen(false);
                        }
                      }}
                      disabled={{ after: new Date() }}
                      required={false}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 justify-center">
          <Button
            onClick={doSearch}
            disabled={initLoading || treeLoading}
            style={{
              backgroundColor: "oklch(62.3% 0.214 259.815)",
              color: "white",
            }}
          >
            <SearchIcon className="w-4 h-4 mr-1" />
            Tìm kiếm
          </Button>
          <Button
            variant="secondary"
            onClick={doExportHeading}
            style={{
              backgroundColor: "oklch(62.3% 0.214 259.815)",
              color: "white",
            }}
          >
            <FileDown className="w-4 h-4 mr-1" />
            Xuất đề mục
          </Button>
          <Button
            variant="secondary"
            onClick={doDownloadFolder}
            style={{
              backgroundColor: "oklch(62.3% 0.214 259.815)",
              color: "white",
            }}
          >
            <Archive className="w-4 h-4 mr-1" />
            Xuất hồ sơ nộp lưu
          </Button>
        </div>

        <div className="mt-4">
          <Table
            columns={columns}
            dataSource={flatTree}
            loading={initLoading || treeLoading}
            showPagination={false}
            emptyText={
              !treeLoading && tree.length === 0
                ? "Không có dữ liệu."
                : "Không tồn tại văn bản"
            }
            rowClassName={() => ""}
          />
        </div>
      </div>
    </div>
  );
}
