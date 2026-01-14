import { Column } from "@/definitions/types/table.type";
import { cn } from "@/lib/utils";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
} from "lucide-react";
import * as React from "react";
import { Spinner } from "@/components/ui/shadcn-io/spinner";

type SortDirection = "asc" | "desc" | null;

interface SortConfig {
  key: string;
  direction: SortDirection;
}

interface TableProps<T> {
  columns: Column<T>[];
  dataSource: T[];
  className?: string;
  bgColor?: string;
  headerColor?: string;
  itemsPerPage?: number;
  onRowClick?: (record: T, index: number) => void;
  onRowDoubleClick?: (record: T, index: number) => void;
  onRowContextMenu?: (record: T, event: React.MouseEvent) => void;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  showPagination?: boolean;
  emptyText?: string | React.ReactNode;
  totalItems?: number;
  rowSelection?: {
    selectedRowKeys: React.Key[];
    onChange: (selectedKeys: React.Key[], selectedRows: T[]) => void;
    rowKey?: keyof T;
  };
  hasAllChange?: boolean;
  onItemsPerPageChange?: (size: number) => void;
  pageSizeOptions?: number[];
  loading?: boolean;
  showPageSize?: boolean;
  sortable?: boolean;
  onSort?: (sortConfig: SortConfig | null) => void;
  /** When false, disable client-side sorting (icons and onSort still work) */
  clientSort?: boolean;
  rowClassName?: (record: T, index: number) => string;
  rowTextColor?: (record: T, index: number) => string;
  /** Optional className applied to all body cells */
  cellClassName?: (record?: T, index?: number) => string;
  /** Enable fixed header with scrollable body */
  fixedHeader?: boolean;
  /** Maximum height for scrollable table body (e.g., "400px", "50vh") */
  maxHeight?: string;
  /** Minimum height for scrollable table body (e.g., "200px") */
  minHeight?: string;
}
function TableBase({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div
      data-slot="table-container"
      className="relative w-full overflow-x-auto"
    >
      <table
        data-slot="table"
        className={cn("w-full caption-bottom text-sm", className)}
        {...props}
      />
    </div>
  );
}
const Table = React.forwardRef(function Table<T>(
  {
    className,
    columns,
    dataSource,
    bgColor = "bg-white",
    headerColor = "bg-gray-50",
    itemsPerPage: controlledItemsPerPage,
    onRowClick,
    onRowDoubleClick,
    onRowContextMenu,
    currentPage: controlledCurrentPage,
    onPageChange,
    showPagination = true,
    emptyText,
    totalItems,
    rowSelection,
    hasAllChange = false,
    onItemsPerPageChange,
    pageSizeOptions: propPageSizeOptions = [10, 20, 50, 100],
    loading = false, // ✅ default false
    showPageSize = true,
    sortable = false,
    onSort,
    clientSort = true,
    rowClassName,
    rowTextColor,
    cellClassName,
    fixedHeader = false,
    maxHeight = "100%",
    minHeight,
    ...props
  }: TableProps<T>,
  ref: React.ForwardedRef<HTMLDivElement>
) {
  const [internalCurrentPage, setInternalCurrentPage] = React.useState(1);
  const [internalItemsPerPage, setInternalItemsPerPage] = React.useState(
    controlledItemsPerPage ?? 10
  );
  const [sortConfig, setSortConfig] = React.useState<SortConfig | null>(null);

  const [hasScroll, setHasScroll] = React.useState(false);
  const tableContainerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = tableContainerRef.current;
    if (!el) return;

    const checkScroll = () => {
      setHasScroll(el.scrollHeight > el.clientHeight);
    };

    checkScroll();
    window.addEventListener("resize", checkScroll);

    return () => window.removeEventListener("resize", checkScroll);
  }, [dataSource]);

  const effectiveCurrentPage =
    controlledCurrentPage !== undefined
      ? controlledCurrentPage
      : internalCurrentPage;

  const effectiveItemsPerPage =
    controlledItemsPerPage !== undefined
      ? controlledItemsPerPage
      : internalItemsPerPage;

  const setEffectiveCurrentPage = (page: number) => {
    if (controlledCurrentPage !== undefined) {
      onPageChange?.(page);
    } else {
      setInternalCurrentPage(page);
    }
  };

  const setEffectiveItemsPerPage = (size: number) => {
    if (controlledItemsPerPage !== undefined) {
      onItemsPerPageChange?.(size);
    } else {
      setInternalItemsPerPage(size);
    }
    setEffectiveCurrentPage(1);
  };

  const handleSort = (columnKey: string) => {
    if (!sortable) return;

    // Toggle 3 trạng thái: none -> asc -> desc -> none
    let newSort: SortConfig | null = null;
    if (!sortConfig || sortConfig.key !== columnKey || !sortConfig.direction) {
      // Chưa sort cột này -> ASC
      newSort = { key: columnKey, direction: "asc" };
    } else if (sortConfig.direction === "asc") {
      // ASC -> DESC
      newSort = { key: columnKey, direction: "desc" };
    } else if (sortConfig.direction === "desc") {
      // DESC -> NONE (reset)
      newSort = null;
    }

    setSortConfig(newSort);

    // Reset to first page when sorting changes
    setEffectiveCurrentPage(1);

    onSort?.(newSort);
  };

  const getSortIcon = (columnKey: string) => {
    if (!sortable || !sortConfig || sortConfig.key !== columnKey) {
      return null;
    }

    if (sortConfig.direction === "asc") {
      return <ChevronUp className="w-4 h-4 ml-1 inline" />;
    } else if (sortConfig.direction === "desc") {
      return <ChevronDown className="w-4 h-4 ml-1 inline" />;
    }

    return null;
  };

  // Sorting
  const sortedData = React.useMemo(() => {
    const sortableData = Array.isArray(dataSource) ? [...dataSource] : [];
    if (clientSort && sortConfig !== null) {
      const column = columns.find(
        (col) => (col.sortKey || String(col.header)) === sortConfig.key
      );
      if (column) {
        sortableData.sort((a, b) => {
          let aValue: unknown;
          let bValue: unknown;

          if (typeof column.accessor === "function") {
            aValue = column.accessor(a, 0);
            bValue = column.accessor(b, 0);
          } else if (typeof column.accessor === "string") {
            aValue = a[column.accessor as keyof T];
            bValue = b[column.accessor as keyof T];
          } else {
            return 0;
          }

          // Convert to string for alphabetical sorting
          const aStr = String(aValue || "").toLowerCase();
          const bStr = String(bValue || "").toLowerCase();

          if (aStr < bStr) return sortConfig.direction === "asc" ? -1 : 1;
          if (aStr > bStr) return sortConfig.direction === "asc" ? 1 : -1;
          return 0;
        });
      }
    }
    return sortableData;
  }, [dataSource, sortConfig, columns]);

  // Pagination
  const totalRecords = totalItems ?? sortedData?.length;
  const totalPages = Math.ceil(totalRecords / effectiveItemsPerPage);

  const startIndex = showPagination
    ? (effectiveCurrentPage - 1) * effectiveItemsPerPage
    : 0;
  const endIndex = showPagination
    ? startIndex + effectiveItemsPerPage
    : sortedData.length;
  // Decide slicing strategy:
  // - If totalItems is provided (server-side pagination) and current page data is already limited
  // to page size, do NOT slice again.
  // - Otherwise, slice client-side for local pagination.
  const isServerPaginated =
    totalItems !== undefined &&
    (sortedData.length <= effectiveItemsPerPage ||
      // Allow expanded items on current page (e.g., subtasks) - don't slice if reasonable size
      (sortedData.length > effectiveItemsPerPage &&
        sortedData.length <= effectiveItemsPerPage * 5));
  const currentData = isServerPaginated
    ? sortedData
    : sortedData.slice(startIndex, endIndex);

  // Row Selection
  const rowKey = rowSelection?.rowKey || ("id" as keyof T);
  const selectedRowKeys = rowSelection?.selectedRowKeys || [];

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allKeys = currentData.map((item) => String(item[rowKey]));
      rowSelection?.onChange(allKeys, currentData);
    } else {
      rowSelection?.onChange([], []);
    }
  };

  const handleSelectRow = (checked: boolean, record: T) => {
    let newSelected = [...selectedRowKeys];
    const key = String(record[rowKey]);
    if (checked) {
      newSelected.push(key);
    } else {
      newSelected = newSelected.filter((k) => k !== key);
    }
    rowSelection?.onChange(
      newSelected,
      dataSource.filter((d) => newSelected.includes(String(d[rowKey])))
    );
  };

  const isAllChecked =
    currentData.length > 0 &&
    currentData.every((item) => selectedRowKeys.includes(String(item[rowKey])));

  const isIndeterminate =
    currentData.some((item) =>
      selectedRowKeys.includes(String(item[rowKey]))
    ) && !isAllChecked;

  // Pagination items with ellipsis
  const paginationItems = React.useMemo(() => {
    const items: (number | string)[] = [];
    if (totalPages <= 1) {
      return [1];
    }

    items.push(1);

    if (effectiveCurrentPage > 3) {
      items.push("...");
    }

    for (
      let i = Math.max(2, effectiveCurrentPage - 1);
      i <= Math.min(totalPages - 1, effectiveCurrentPage + 1);
      i++
    ) {
      items.push(i);
    }

    if (effectiveCurrentPage < totalPages - 2) {
      items.push("...");
    }

    if (totalPages > 1) {
      items.push(totalPages);
    }

    return items;
  }, [effectiveCurrentPage, totalPages]);

  return (
    <div
      ref={ref || undefined}
      className={cn("w-full", fixedHeader && "h-full flex flex-col", className)}
      {...props}
    >
      <div
        className={cn(
          "relative w-full rounded-lg border border-[#e5e7eb]",
          fixedHeader ? "flex flex-col flex-1 min-h-0" : "overflow-auto"
        )}
        ref={tableContainerRef}
      >
        {fixedHeader ? (
          // Fixed header mode - separate header and scrollable body
          <>
            {/* Fixed Header */}
            <div className={cn("flex-shrink-0 pr-2", headerColor)}>
              <table
                className={cn(
                  "w-full caption-bottom text-sm border-collapse",
                  bgColor
                )}
                style={{ tableLayout: "fixed" }}
              >
                <colgroup>
                  {columns.map((column, index) => (
                    <col
                      key={index}
                      className={cn(
                        column.type === "checkbox" && "w-16",
                        column.className
                      )}
                    />
                  ))}
                </colgroup>
                <TableHeader
                  className={cn(
                    !hasScroll
                      ? "[&_th:last-child]:rounded-tr-lg"
                      : "[&_th:last-child]:rounded-none"
                  )}
                >
                  <TableRow>
                    {columns.map((column, index) => {
                      if (column.type === "checkbox") {
                        return (
                          <TableHead key={index} className="w-16 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-base font-semibold text-gray-700">
                                STT
                              </span>
                              {hasAllChange && (
                                <input
                                  type="checkbox"
                                  checked={isAllChecked}
                                  ref={(el) => {
                                    if (el) el.indeterminate = isIndeterminate;
                                  }}
                                  onChange={handleSelectAll}
                                />
                              )}
                            </div>
                          </TableHead>
                        );
                      }
                      const isColumnSortable =
                        sortable && column.sortable !== false;

                      return (
                        <TableHead
                          key={index}
                          className={cn(
                            isColumnSortable &&
                              "cursor-pointer select-none hover:bg-gray-100",
                            column.className
                          )}
                          onClick={() =>
                            isColumnSortable &&
                            handleSort(column.sortKey || String(column.header))
                          }
                        >
                          <div className="flex items-center justify-center h-full">
                            <span>{column.header}</span>
                            {isColumnSortable &&
                              getSortIcon(
                                column.sortKey || String(column.header)
                              )}
                          </div>
                        </TableHead>
                      );
                    })}
                  </TableRow>
                </TableHeader>
              </table>
            </div>

            {/* Scrollable Body */}
            <div
              className={cn(
                "flex-1 min-h-0 overflow-y-auto [&::-webkit-scrollbar]:absolute [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-gray-100 [&::-webkit-scrollbar-track]:border-gray-300 [&::-webkit-scrollbar-thumb]:bg-gray-400 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:border-gray-300 hover:[&::-webkit-scrollbar-thumb]:bg-gray-500"
              )}
              style={{
                maxHeight,
                minHeight,
              }}
            >
              <table
                className={cn(
                  "w-full caption-bottom text-sm border-collapse",
                  bgColor
                )}
                style={{ tableLayout: "fixed" }}
              >
                <colgroup>
                  {columns.map((column, index) => (
                    <col
                      key={index}
                      className={cn(
                        column.type === "checkbox" && "w-16",
                        column.className
                      )}
                    />
                  ))}
                </colgroup>

                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-40 text-center align-middle"
                      >
                        <div className="flex items-center justify-center">
                          <Spinner className="w-6 h-6 text-primary" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : currentData.length > 0 ? (
                    currentData.map((item, rowIndex) => (
                      <TableRow
                        key={rowIndex}
                        className={cn(
                          rowClassName?.(item, rowIndex),
                          rowTextColor?.(item, rowIndex),
                          onRowClick &&
                            "cursor-pointer hover:bg-blue-50 transition-colors"
                        )}
                        onContextMenu={(e) => onRowContextMenu?.(item, e)}
                      >
                        {columns.map((column, colIndex) => {
                          if (column.type === "checkbox") {
                            return (
                              <TableCell
                                key={colIndex}
                                className="text-center cursor-default"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <div className="flex items-center justify-center gap-1">
                                  <span className="text-base font-medium text-gray-600 min-w-[20px]">
                                    {startIndex + rowIndex + 1}
                                  </span>
                                  <input
                                    type="checkbox"
                                    checked={selectedRowKeys.includes(
                                      String(item[rowKey])
                                    )}
                                    onChange={(e) =>
                                      handleSelectRow(e.target.checked, item)
                                    }
                                  />
                                </div>
                              </TableCell>
                            );
                          }
                          if (column.type === "actions") {
                            return (
                              <TableCell
                                key={colIndex}
                                className={cn(
                                  "text-center cursor-default",
                                  column.className
                                )}
                                onClick={(e) => e.stopPropagation()}
                              >
                                {column.renderActions?.(item, rowIndex)}
                              </TableCell>
                            );
                          }
                          return (
                            <TableCell
                              key={colIndex}
                              className={cn(
                                column.className,
                                onRowClick &&
                                  !(column as any).noRowClick &&
                                  "cursor-pointer hover:text-blue-600 hover:underline transition-colors",
                                cellClassName?.(item, rowIndex)
                              )}
                              onClick={() => {
                                if (!(column as any).noRowClick) {
                                  onRowClick?.(item, startIndex + rowIndex);
                                }
                              }}
                            >
                              {typeof column.accessor === "function"
                                ? column.accessor(item, rowIndex)
                                : (item[
                                    column.accessor as keyof T
                                  ] as React.ReactNode)}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={columns.length}
                        className="h-24 text-center text-muted-foreground"
                      >
                        {emptyText || "Không tồn tại văn bản"}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </table>
            </div>
          </>
        ) : (
          // Normal mode without fixed header
          <table
            className={cn(
              "w-full caption-bottom text-sm border-collapse",
              bgColor
            )}
          >
            <TableHeader>
              <TableRow>
                {columns.map((column, index) => {
                  if (column.type === "checkbox") {
                    return (
                      <TableHead key={index} className="w-16 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <span className="text-base font-semibold text-gray-700">
                            STT
                          </span>
                          {hasAllChange && (
                            <input
                              type="checkbox"
                              checked={isAllChecked}
                              ref={(el) => {
                                if (el) el.indeterminate = isIndeterminate;
                              }}
                              onChange={handleSelectAll}
                            />
                          )}
                        </div>
                      </TableHead>
                    );
                  }
                  const isColumnSortable =
                    sortable && column.sortable !== false;

                  return (
                    <TableHead
                      key={index}
                      className={cn(
                        isColumnSortable &&
                          "cursor-pointer select-none hover:bg-gray-100",
                        column.className
                      )}
                      onClick={() =>
                        isColumnSortable &&
                        handleSort(column.sortKey || String(column.header))
                      }
                    >
                      <div className="flex items-center justify-center h-full">
                        <span>{column.header}</span>
                        {isColumnSortable &&
                          getSortIcon(column.sortKey || String(column.header))}
                      </div>
                    </TableHead>
                  );
                })}
              </TableRow>
            </TableHeader>

            <TableBody>
              {loading ? ( // ✅ khi loading
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-40 text-center align-middle"
                  >
                    <div className="flex items-center justify-center">
                      <Spinner className="w-6 h-6 text-primary" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : currentData.length > 0 ? (
                currentData.map((item, rowIndex) => (
                  <TableRow
                    key={rowIndex}
                    className={cn(
                      rowClassName?.(item, rowIndex), // Priority: custom row className first
                      rowTextColor?.(item, rowIndex), // Text color for the row
                      onRowClick &&
                        "cursor-pointer hover:bg-blue-50 transition-colors"
                    )}
                    onContextMenu={(e) => onRowContextMenu?.(item, e)}
                  >
                    {columns.map((column, colIndex) => {
                      if (column.type === "checkbox") {
                        return (
                          <TableCell
                            key={colIndex}
                            className="text-center cursor-default"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <div className="flex items-center justify-center gap-1">
                              <span className="text-base font-medium text-gray-600 min-w-[20px]">
                                {startIndex + rowIndex + 1}
                              </span>
                              <input
                                type="checkbox"
                                checked={selectedRowKeys.includes(
                                  String(item[rowKey])
                                )}
                                onChange={(e) =>
                                  handleSelectRow(e.target.checked, item)
                                }
                              />
                            </div>
                          </TableCell>
                        );
                      }
                      if (column.type === "actions") {
                        return (
                          <TableCell
                            key={colIndex}
                            className={cn(
                              "text-center cursor-default",
                              column.className
                            )}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {column.renderActions?.(item, rowIndex)}
                          </TableCell>
                        );
                      }
                      return (
                        <TableCell
                          key={colIndex}
                          className={cn(
                            column.className,
                            onRowClick &&
                              !(column as any).noRowClick &&
                              "cursor-pointer hover:text-blue-600 hover:underline transition-colors",
                            cellClassName?.(item, rowIndex)
                          )}
                          onClick={() => {
                            if (!(column as any).noRowClick) {
                              onRowClick?.(item, startIndex + rowIndex);
                            }
                          }}
                        >
                          {typeof column.accessor === "function"
                            ? column.accessor(item, rowIndex)
                            : (item[
                                column.accessor as keyof T
                              ] as React.ReactNode)}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center text-muted-foreground"
                  >
                    {emptyText || "Không tồn tại văn bản"}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </table>
        )}
      </div>

      {/* ✅ Pagination */}
      {!loading && showPagination && totalRecords > 0 && (
        <div className="flex items-center justify-between mt-3 px-1 pb-2">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setEffectiveCurrentPage(effectiveCurrentPage - 1)}
              disabled={effectiveCurrentPage === 1}
              className="h-9 px-2 text-base border border-gray-300 rounded-md flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline leading-none">Trước</span>
            </button>
            <div className="flex items-center gap-0.5 mx-1">
              {paginationItems.map((item, index) =>
                typeof item === "string" ? (
                  <span
                    key={index}
                    className="h-9 w-8 flex items-center justify-center text-base text-gray-400"
                  >
                    {item}
                  </span>
                ) : (
                  <button
                    key={index}
                    onClick={() => setEffectiveCurrentPage(item)}
                    className={cn(
                      "h-9 min-w-8 px-2 rounded-md text-base font-medium transition-colors border flex items-center justify-center",
                      effectiveCurrentPage === item
                        ? "bg-[#2199e8] text-white border-[#2199e8] shadow-sm"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                    )}
                  >
                    {item.toLocaleString()}
                  </button>
                )
              )}
            </div>
            <button
              onClick={() => setEffectiveCurrentPage(effectiveCurrentPage + 1)}
              disabled={effectiveCurrentPage === totalPages}
              className="h-9 px-2 text-base border border-gray-300 rounded-md flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
            >
              <span className="hidden sm:inline leading-none">Sau</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          {showPageSize && (
            <div className="flex items-center gap-2 text-base text-gray-600">
              <span>Hiển thị:</span>
              <div className="relative">
                <select
                  className="h-9 pl-2 pr-6 text-base border border-gray-300 rounded-md bg-white hover:border-gray-400 focus:border-[#2199e8] focus:ring-1 focus:ring-[#2199e8] transition-colors appearance-none cursor-pointer min-w-[50px]"
                  value={effectiveItemsPerPage}
                  onChange={(e) =>
                    setEffectiveItemsPerPage(Number(e?.target.value))
                  }
                >
                  {propPageSizeOptions.map((size) => (
                    <option key={size} value={size}>
                      {size}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              </div>
              <span>bản ghi</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}) as <T>(
  props: TableProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> }
) => JSX.Element;

// ✅ Subcomponents giữ nguyên
const TableHeader = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement> & { fixed?: boolean }
>(({ className, fixed, ...props }, ref) => (
  <thead
    ref={ref}
    className={cn(
      "bg-[#eaecf0] rounded-t-lg",
      "[&_tr]:border-b-2 [&_tr]:border-[#d1d5db]",
      "[&_th:first-child]:rounded-tl-lg [&_th:last-child]:rounded-tr-lg",
      fixed && "sticky top-0 z-10",
      className
    )}
    {...props}
  />
));
TableHeader.displayName = "TableHeader";

const TableBody = React.forwardRef<
  HTMLTableSectionElement,
  React.HTMLAttributes<HTMLTableSectionElement>
>(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn(
      "[&_tr:last-child]:border-0",
      "[&_tr:last-child_td:first-child]:rounded-bl-lg [&_tr:last-child_td:last-child]:rounded-br-lg",
      className
    )}
    {...props}
  />
));
TableBody.displayName = "TableBody";

const TableRow = React.forwardRef<
  HTMLTableRowElement,
  React.HTMLAttributes<HTMLTableRowElement>
>(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-[#e5e7eb] transition-colors hover:bg-gray-50",
      // Only apply even:bg-gray-50/50 if no custom background is provided
      !className?.includes("bg-") && "even:bg-gray-50/50",
      className
    )}
    {...props}
  />
));
TableRow.displayName = "TableRow";

const TableHead = React.forwardRef<
  HTMLTableCellElement,
  React.ThHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => {
  const hasWhitespaceNormal = className?.includes("whitespace-normal");
  return (
    <th
      ref={ref}
      className={cn(
        "font-semibold text-base",
        "bg-[#eaecf0] text-[#717680]",
        "px-3 py-2",
        "align-middle",
        !hasWhitespaceNormal && "whitespace-nowrap",
        "border-b border-r border-[#e5e7eb]",
        "[&:last-child]:border-r-0",
        className
      )}
      {...props}
    />
  );
});
TableHead.displayName = "TableHead";

const TableCell = React.forwardRef<
  HTMLTableCellElement,
  React.TdHTMLAttributes<HTMLTableCellElement>
>(({ className, ...props }, ref) => (
  <td
    ref={ref}
    className={cn(
      "px-3 py-2 align-middle text-base",
      "border-r border-[#e5e7eb]",
      "[&:last-child]:border-r-0",
      className
    )}
    {...props}
  />
));
TableCell.displayName = "TableCell";

export {
  Table,
  TableBase,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
};
