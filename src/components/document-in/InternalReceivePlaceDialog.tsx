import React, {
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
  useCallback,
  useMemo,
} from "react";
import {
  CustomDialogContent,
  Dialog,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowRight,
  Building,
  Building2,
  ChevronDown,
  ChevronLeft,
  Save,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import { Column, OrganizationItem } from "@/definitions";
import { Table } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface Props {
  data: OrganizationItem[];
  setData: (items: OrganizationItem[]) => void;
  orgData: OrganizationItem[];
  isOpen: boolean;
  onOpenChange: (v: boolean) => void;
  onClose: () => void;
}

export function InteralReceivePlaceDialog({
  data,
  setData,
  orgData,
  isOpen,
  onOpenChange,
  onClose,
}: Props) {
  const [localSelect, setLocalSelect] = useState<OrganizationItem[]>(data);
  const handleCancel = useCallback(() => {
    setLocalSelect(data ?? []);
    onClose();
  }, [data, onClose]);

  useEffect(() => {
    if (isOpen) {
      setLocalSelect([]);
      setExpandedItems(new Set());
    }
  }, [isOpen]);

  const handleSubmit = useCallback(() => {
    setData(localSelect);
    onClose();
  }, [localSelect, setData, onClose]);

  const handleToggle = useCallback(
    (item: OrganizationItem, checked: boolean) => {
      setLocalSelect((prev) => {
        if (checked) {
          // add if not exists
          if (prev.some((i) => i.id === item.id)) return prev;
          return [...prev, item];
        } else {
          // remove if exists
          return prev.filter((i) => i.id !== item.id);
        }
      });
    },
    []
  );

  const toggleExpanded = useCallback((itemId: number) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  }, []);

  const handleRemoveSelected = useCallback((value: OrganizationItem) => {
    setLocalSelect((prev) => prev.filter((item) => item !== value));
  }, []);

  const handleClearAll = useCallback(() => {
    setLocalSelect([]);
  }, []);

  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  const getAllItemIds = useCallback((items: OrganizationItem[]): number[] => {
    return items.map((item) => item.id);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setLocalSelect(data ?? []);
    }
  }, [isOpen, data]);

  useEffect(() => {
    if (isOpen && orgData.length > 0) {
      const allIds = getAllItemIds(orgData);
      setExpandedItems(new Set(allIds));
    }
  }, [isOpen, orgData, getAllItemIds]);

  const flattenData = useCallback(
    (
      items: OrganizationItem[],
      level = 0
    ): (OrganizationItem & { level: number })[] => {
      return items.flatMap((item) => {
        const row = { ...item, level };
        const children =
          item.children && expandedItems.has(item.id)
            ? flattenData(item.children, level + 1)
            : [];
        return [row, ...children];
      });
    },
    [expandedItems]
  );

  const tableData = useMemo(() => flattenData(orgData), [flattenData, orgData]);

  const isAllChecked = useMemo(() => {
    return localSelect.length === tableData.length;
  }, [localSelect.length, tableData.length]);

  const toggleAllCheckboxes = useCallback(
    (checked: boolean) => {
      if (checked) {
        setLocalSelect(tableData);
      } else {
        setLocalSelect([]);
      }
    },
    [tableData]
  );
  const columns: Column<OrganizationItem>[] = useMemo(
    () => [
      {
        header: "Tên đơn vị, cá nhân",
        className: "text-left py-2 px-3",
        accessor: (item: OrganizationItem) => (
          <div
            className="flex items-center"
            style={{ paddingLeft: `${item.level * 25}px` }}
          >
            {item.children && item.children.length > 0 && (
              <button
                onClick={() => toggleExpanded(item.id)}
                className="mr-2 p-1 hover:bg-gray-100 rounded"
              >
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    expandedItems.has(item.id) ? "rotate-180" : ""
                  }`}
                />
              </button>
            )}
            {item.type === "organization" ? (
              <Building className="w-4 h-4 mr-2 text-blue-600" />
            ) : (
              <Users className="w-4 h-4 mr-2 text-red-600" />
            )}
            <span className="text-sm font-medium text-gray-900">
              {item.name}
            </span>
          </div>
        ),
      },
      {
        header: "Chức danh",
        className: "text-left py-2 px-3",
        accessor: (item: OrganizationItem) => (
          <div className="flex items-center">
            <span className="text-sm font-medium">
              {item.type === "person" ? item.positionName : ""}
            </span>
          </div>
        ),
      },
      {
        header: (
          <div className="flex items-center justify-center">
            <Input
              type="checkbox"
              className="w-4 h-4"
              checked={isAllChecked}
              onChange={(e) => toggleAllCheckboxes(e.target.checked)}
            />
          </div>
        ),
        className: "text-center py-2 w-20",
        accessor: (item: OrganizationItem) => (
          <div className="flex items-center justify-center">
            <Input
              type="checkbox"
              className="w-4 h-4"
              checked={localSelect.some((i) => i.id === item.id)}
              onChange={(e) => handleToggle(item, e.target.checked)}
            />
          </div>
        ),
      },
    ],
    [
      expandedItems,
      toggleExpanded,
      isAllChecked,
      toggleAllCheckboxes,
      localSelect,
      handleToggle,
    ]
  );

  // Memoized components for better performance
  const SelectedItemsList = useMemo(
    () => (
      <div className="space-y-2">
        {localSelect.length === 0 ? (
          <div className="text-xs text-gray-500">Chưa có mục nào được chọn</div>
        ) : (
          <TooltipProvider>
            {localSelect.map((item, idx) => {
              const isOrg = item.type === "organization";
              const colorClass = isOrg ? "text-blue-600" : "text-red-600";

              return (
                <Tooltip key={`${item.id}-${idx}`}>
                  <div className="flex items-center justify-between gap-2 p-2 border rounded-md">
                    <TooltipTrigger asChild>
                      <div className="truncate max-w-[180px] cursor-help flex items-center gap-1">
                        {isOrg ? (
                          <Building className={`w-4 h-4 ${colorClass}`} />
                        ) : (
                          <Users className={`w-4 h-4 ${colorClass}`} />
                        )}
                        <span
                          className={`text-sm font-medium truncate ${colorClass}`}
                        >
                          {item.name}
                        </span>
                      </div>
                    </TooltipTrigger>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveSelected(item)}
                        className="h-9 w-8 p-0"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <TooltipContent>
                    <p className="text-sm">{item.name}</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        )}
      </div>
    ),
    [localSelect, handleRemoveSelected]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <CustomDialogContent className="max-w-6xl h-[600px] flex flex-col overflow-hidden p-0">
        <DialogHeader className="pb-4 border-b border-gray-200 flex-shrink-0 px-6 pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center">
                <Building2 className="w-4 h-4 mr-2 text-blue-600" />
                Chuyển nơi nhận công văn
              </DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 text-sm font-medium"
              >
                <Save className="w-4 h-4 mr-1" />
                Xong
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                className="h-9 px-4 text-sm font-medium border-gray-300 hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Hủy
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Content with fixed height and scroll */}
        <div className="flex-1 overflow-hidden px-6 pb-6">
          <div className="grid grid-cols-3 gap-4 h-full pt-4">
            {/* LEFT: Table Section */}
            <div className="col-span-2 h-full overflow-hidden">
              <div className="h-full">
                <Table
                  sortable={true}
                  columns={columns}
                  dataSource={tableData}
                  showPagination={false}
                  showPageSize={false}
                  headerColor="bg-[#eaecf0]"
                  fixedHeader
                />
              </div>
            </div>

            {/* RIGHT: Selected Items Section */}
            <div className="col-span-1 h-full overflow-hidden">
              <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col h-full">
                <div className="flex items-center justify-between mb-3 flex-shrink-0">
                  <h3 className="text-sm font-semibold">
                    Nơi nhận công văn ({localSelect.length})
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleClearAll}
                    className="text-xs"
                  >
                    Xóa hết
                  </Button>
                </div>

                {/* Scrollable selected items list */}
                <div className="flex-1 overflow-y-auto min-h-0 pr-1">
                  {SelectedItemsList}
                </div>
              </div>
            </div>
          </div>
        </div>
      </CustomDialogContent>
    </Dialog>
  );
}
