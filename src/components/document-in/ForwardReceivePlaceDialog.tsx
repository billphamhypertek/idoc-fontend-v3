import React, { useEffect, useState, useMemo, useCallback } from "react";
import {
  CustomDialogContent,
  Dialog,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Building,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Forward,
  ListCheck,
  Users,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "../ui/input";
import type { Column, OrganizationItem } from "@/definitions";
import { Table } from "@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useForwardDocument } from "@/hooks/data/document-in.data";
import { handleError } from "@/utils/common.utils";

interface Props {
  docId: string;
  orgSent: OrganizationItem[];
  orgData: OrganizationItem[];
  isOpen: boolean;
  onOpenChange: (v: boolean) => void;
  onClose: () => void;
  onSuccess: () => void;
}

const mapBody = (items: OrganizationItem[]) => {
  return items.map((item) => ({
    receiveId: item.id,
    type: item.type === "organization" ? "ORG" : "USER",
  }));
};

// Memoized components để tối ưu performance
const OrganizationIcon = React.memo(({ type }: { type: string }) => {
  return type === "organization" ? (
    <Building className="w-4 h-4 mr-2 text-blue-600" />
  ) : (
    <Users className="w-4 h-4 mr-2 text-red-600" />
  );
});

OrganizationIcon.displayName = "OrganizationIcon";

const OrganizationItem = React.memo(
  ({
    item,
    level,
    isExpanded,
    onToggleExpanded,
    isChecked,
    onToggle,
  }: {
    item: OrganizationItem;
    level: number;
    isExpanded: boolean;
    onToggleExpanded: () => void;
    isChecked: boolean;
    onToggle: (checked: boolean) => void;
  }) => (
    <div className="flex items-center">
      {/* Icon dropdown với padding dựa trên level */}
      <div
        style={{ marginLeft: `${level * 25}px` }}
        className="flex items-center"
      >
        {item.children && item.children.length > 0 ? (
          <button
            onClick={onToggleExpanded}
            className="p-1 hover:bg-gray-100 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-400" />
            )}
          </button>
        ) : (
          <div style={{ width: "24px" }} />
        )}
      </div>
      <OrganizationIcon type={item.type} />
      <span className="text-sm font-medium text-gray-900 text-left">
        {item.name}
      </span>
    </div>
  )
);
OrganizationItem.displayName = "OrganizationItem";

const SelectedItemCard = React.memo(
  ({ item, onRemove }: { item: OrganizationItem; onRemove: () => void }) => {
    const isOrg = item.type === "organization";
    const colorClass = isOrg ? "text-blue-600" : "text-red-600";

    return (
      <div className="flex items-center justify-between gap-2 p-2 border rounded-md mb-2">
        <div className="flex justify-between items-center gap-2">
          <OrganizationIcon type={item.type} />
          <div className="truncate max-w-[150px] cursor-help flex items-center gap-1">
            <span className={`text-sm font-medium truncate ${colorClass}`}>
              {item.name}
            </span>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRemove}
          className="h-4 w-4 p-0 border-none outline-none shadow-none hover:bg-transparent"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>
    );
  }
);
SelectedItemCard.displayName = "SelectedItemCard";

export function ForwardReceivePlaceDialog({
  docId,
  orgSent,
  orgData,
  isOpen,
  onOpenChange,
  onClose,
  onSuccess,
}: Props) {
  const [localSelect, setLocalSelect] = useState<OrganizationItem[]>([]);
  const [processingContent, setProcessingContent] = useState<string>("");
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const mutation = useForwardDocument();

  // Memoized functions để tránh re-render không cần thiết
  const handleCancel = useCallback(() => {
    onClose();
    setLocalSelect([]);
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      setLocalSelect([]);
      setProcessingContent("");
      setExpandedItems(new Set());
    }
  }, [isOpen]);

  const handleSubmit = useCallback(() => {
    if (processingContent.length > 2000) {
      return;
    }
    try {
      const body = {
        comment: processingContent,
        docId: docId,
        listReceive: mapBody(localSelect),
      };
      mutation.mutate(body);
      setLocalSelect([]);
    } catch (error) {
      handleError(error);
    }
    onSuccess();
    onClose();
  }, [processingContent, docId, localSelect, mutation, onSuccess, onClose]);

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

  const handleToggle = useCallback(
    (item: OrganizationItem, checked: boolean) => {
      setLocalSelect((prev) => {
        if (checked) {
          if (prev.some((i) => i.id === item.id)) return prev;
          return [...prev, item];
        } else {
          return prev.filter((i) => i.id !== item.id);
        }
      });
    },
    []
  );

  const handleRemoveSelected = useCallback((value: OrganizationItem) => {
    setLocalSelect((prev) => prev.filter((item) => item !== value));
  }, []);

  const toggleAllCheckboxes = useCallback((checked: boolean) => {
    if (checked) {
      setLocalSelect(tableData);
    } else {
      setLocalSelect([]);
    }
  }, []);

  // Memoized data để tránh tính toán lại không cần thiết
  const getAllItemIds = useCallback((items: OrganizationItem[]): number[] => {
    return items.map((item) => item.id);
  }, []);

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

  // Effect để expand tất cả khi mở dialog
  useEffect(() => {
    if (isOpen && orgData.length > 0) {
      const allIds = getAllItemIds(orgData);
      setExpandedItems(new Set(allIds));
    }
  }, [isOpen, orgData, getAllItemIds]);
  // Memoized columns để tránh re-render
  const columns: Column<OrganizationItem>[] = useMemo(
    () => [
      {
        header: "Tên đơn vị",
        className: "text-center py-2 w-[80%]",
        accessor: (item: OrganizationItem) => (
          <OrganizationItem
            item={item}
            level={item.level}
            isExpanded={expandedItems.has(item.id)}
            onToggleExpanded={() => toggleExpanded(item.id)}
            isChecked={localSelect.some((i) => i.id === item.id)}
            onToggle={(checked) => handleToggle(item, checked)}
          />
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
        className: "text-center py-2 w-[20%]",
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
      localSelect,
      toggleExpanded,
      handleToggle,
      isAllChecked,
      toggleAllCheckboxes,
    ]
  );

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <CustomDialogContent
        className="max-w-7xl max-h-[90vh] flex flex-col overflow-hidden"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="pb-3 border-b border-gray-200 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-lg font-semibold text-gray-900 flex items-center">
                {/* //<ListCheck className="w-4 h-4 mr-2 text-blue-600" /> */}
                Chuyển nơi nhận công văn
              </DialogTitle>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleCancel}
                className="h-9 px-3"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Hủy
              </Button>
              <Button
                onClick={handleSubmit}
                className="h-9 px-3 text-white border-0 hover:text-white bg-blue-600 hover:bg-blue-700"
              >
                <Forward className="w-4 h-4 mr-1" />
                Gửi xử lý
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="p-4 flex-1 min-h-0 flex flex-col overflow-y-auto">
          {/* Grid layout với spacing tối ưu */}
          <div className="grid grid-cols-4 gap-4 flex-1 min-h-0 overflow-hidden">
            {/* LEFT: Table */}
            <div className="col-span-2 flex flex-col min-h-0">
              <div className="flex-1 min-h-0">
                <Table
                  columns={columns}
                  dataSource={tableData}
                  showPagination={false}
                  showPageSize={false}
                  headerColor="bg-[#eaecf0]"
                  fixedHeader
                />
              </div>
            </div>

            {/* RIGHT: Đã gửi */}
            <div className="col-span-1 flex flex-col min-h-0">
              <div className="bg-white rounded-lg border border-gray-200 p-3 h-full flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold">
                    Đã gửi ({orgSent.length})
                  </h3>
                </div>
                <div className="flex-1 overflow-y-auto min-h-0 gap-2">
                  {orgSent.length === 0 ? (
                    <div className="text-xs text-gray-500">Chưa gửi</div>
                  ) : (
                    <TooltipProvider>
                      {orgSent.map((item, idx) => {
                        const isOrg = item.type === "organization";
                        const colorClass = isOrg
                          ? "text-blue-600"
                          : "text-red-600";
                        return (
                          <Tooltip key={idx}>
                            <div className="flex items-center gap-1 p-2 border rounded-md mb-2">
                              <TooltipTrigger asChild>
                                <div className="truncate max-w-[240px] cursor-help flex items-center gap-1">
                                  <OrganizationIcon type={item.type} />
                                  <span
                                    className={`text-xs font-medium truncate ${colorClass}`}
                                  >
                                    {item.name}
                                  </span>
                                </div>
                              </TooltipTrigger>
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
              </div>
            </div>

            {/* RIGHT: Đã chọn */}
            <div className="col-span-1 flex flex-col min-h-0">
              <div className="bg-white rounded-lg border border-gray-200 p-3 h-full flex flex-col min-h-0">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold">
                    Đã chọn ({localSelect.length})
                  </h3>
                  <Button
                    variant="ghost"
                    onClick={() => setLocalSelect([])}
                    className="text-xs h-5 px-2"
                  >
                    Xóa hết
                  </Button>
                </div>
                <div className="flex-1 overflow-y-auto min-h-0 gap-2 ">
                  {localSelect.length === 0 ? (
                    <div className="text-xs text-gray-500">
                      Chưa có mục nào được chọn
                    </div>
                  ) : (
                    <TooltipProvider>
                      {localSelect.map((item, idx) => (
                        <Tooltip key={idx}>
                          <SelectedItemCard
                            item={item}
                            onRemove={() => handleRemoveSelected(item)}
                          />
                          <TooltipContent>
                            <p className="text-sm">{item.name}</p>
                          </TooltipContent>
                        </Tooltip>
                      ))}
                    </TooltipProvider>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom: Processing content */}
          <div className="mt-4 bg-white rounded-lg border border-gray-200 p-3 shrink-0">
            <Label
              htmlFor="processingContent"
              className="text-sm font-semibold text-gray-900 mb-2 block"
            >
              Nội dung xử lý
            </Label>
            <Textarea
              id="processingContent"
              placeholder="Nhập nội dung xử lý..."
              value={processingContent}
              onChange={(e) => setProcessingContent(e.target.value)}
              className="min-h-[100px] resize-none"
            />
            {processingContent.length > 2000 && (
              <p className="text-sm text-red-600 mt-1">
                Nội dung xử lý không được dài quá 2000 ký tự
              </p>
            )}
          </div>
        </div>
      </CustomDialogContent>
    </Dialog>
  );
}
