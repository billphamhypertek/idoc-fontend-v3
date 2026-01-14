import React, { useState, useEffect } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Dialog,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { OrganizationItem, TransferDialogProps } from "@/definitions";
import { Table } from "@/components/ui/table";
import {
  Building,
  Users,
  ChevronDown,
  ArrowRight,
  ChevronLeft,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
// Clean reimplementation: Single main selection (user or org leader) + comment
const CustomDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 grid w-full max-w-4xl -translate-x-1/2 -translate-y-1/2 gap-4 border bg-background p-6 shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
));
CustomDialogContent.displayName = DialogPrimitive.Content.displayName;
export function TransferDialog({
  isOpen,
  onOpenChange,
  onClose,
  onSubmit,
  selectedRole,
  organizationData,
  defaultExpanded = true, // Thêm prop defaultExpanded với mặc định là true (mở)
}: TransferDialogProps) {
  const [processingContent, setProcessingContent] = useState("");
  const [processingContentError, setProcessingContentError] = useState<
    string | null
  >(null);
  const MAX_PROCESSING_LENGTH = 2000;
  const [mainSelected, setMainSelected] = useState<null | {
    type: "User" | "Org";
    id: number;
    leaderId?: number;
    name: string;
    positionName?: string;
  }>(null);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const collectIds = (items: OrganizationItem[]): number[] => {
    const ids: number[] = [];
    items.forEach((i) => {
      ids.push(i.id);
      if (i.children) ids.push(...collectIds(i.children));
    });
    return ids;
  };
  useEffect(() => {
    if (isOpen && organizationData?.length) {
      if (defaultExpanded) {
        // Nếu defaultExpanded là true, mở tất cả các node
        setExpandedItems(new Set(collectIds(organizationData)));
      } else {
        // Nếu defaultExpanded là false, đóng tất cả, chỉ hiển thị cấp đầu tiên
        setExpandedItems(new Set());
      }
    }
  }, [isOpen, organizationData, defaultExpanded]);
  const toggleExpanded = (id: number) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };
  const toggleMain = (item: OrganizationItem) => {
    if (item.type === "person") {
      setMainSelected((prev) =>
        prev && prev.type === "User" && prev.id === item.id
          ? null
          : { type: "User", id: item.id, name: item.name }
      );
    } else if (item.type === "organization" && item.leaderId) {
      setMainSelected((prev) =>
        prev && prev.type === "Org" && prev.id === item.id
          ? null
          : {
              type: "Org",
              id: item.id,
              leaderId: item.leaderId,
              name: (item as any).leaderFullname || item.name,
              positionName: (item as any).leaderPositionName,
            }
      );
    }
  };
  const handleSubmit = () => {
    if (!mainSelected || !selectedRole) return;
    if (processingContentError) return;
    onSubmit({
      processingContent,
      mainProcessors: [
        mainSelected.type === "User"
          ? mainSelected.id
          : (mainSelected.leaderId as number),
      ],
      selectedRoleId: selectedRole.id,
    });
    setProcessingContent("");
    setMainSelected(null);
    onClose();
  };
  const handleCancel = () => {
    setProcessingContent("");
    setMainSelected(null);
    onClose();
  };
  // Flatten for table usage respecting expansion
  const flatten = (
    items: OrganizationItem[],
    level = 0
  ): (OrganizationItem & { level: number })[] =>
    items.flatMap((it) => [
      { ...it, level },
      ...(expandedItems.has(it.id) && it.children
        ? flatten(it.children, level + 1)
        : []),
    ]);
  const data = flatten(organizationData || []);
  const columns = [
    {
      header: "Tên đơn vị, cá nhân",
      accessor: (item: OrganizationItem & { level: number }) => (
        <div className="flex items-center">
          {/* Khoảng cách thụt vào theo cấp độ */}
          <div style={{ width: item.level * 24 }} />
          {/* Icon dropdown hoặc placeholder */}
          <div className="w-6 flex justify-center">
            {item.children && item.children.length > 0 ? (
              <button
                type="button"
                onClick={() => toggleExpanded(item.id)}
                className="p-1 hover:bg-gray-100 rounded"
              >
                <ChevronDown
                  className={`w-4 h-4 text-gray-400 transition-transform ${
                    expandedItems.has(item.id) ? "rotate-180" : ""
                  }`}
                />
              </button>
            ) : (
              <div className="w-4 h-4" />
            )}
          </div>
          {/* Icon loại */}
          <div className="w-6 flex justify-center mr-2">
            {item.type === "organization" ? (
              <Building className="w-4 h-4 text-gray-600" />
            ) : (
              <Users className="w-4 h-4 text-gray-600" />
            )}
          </div>
          {/* Tên */}
          <span className="text-sm font-medium text-gray-900">{item.name}</span>
        </div>
      ),
      className: "py-2 w-3/4",
    },
    {
      header: "Xử lý chính",
      accessor: (item: OrganizationItem & { level: number }) => {
        // Chỉ hiển thị checkbox cho user (person), không hiển thị cho organization
        if (item.type !== "person") {
          return null;
        }
        const isChecked =
          !!mainSelected &&
          mainSelected.type === "User" &&
          mainSelected.id === item.id;
        return (
          <Checkbox
            checked={isChecked}
            onCheckedChange={() => toggleMain(item)}
          />
        );
      },
      className: "text-center py-2 w-1/4",
    },
  ];
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <CustomDialogContent
        className="max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center">
                <Users className="w-4 h-4 mr-2 text-blue-600" />
                Trình lãnh đạo
              </DialogTitle>
              <p className="text-sm text-gray-500 mt-1">
                Chuyển xử lý cho: {selectedRole?.name}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                disabled={!mainSelected || !!processingContentError}
                onClick={handleSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 text-sm font-medium"
              >
                <ArrowRight className="w-4 h-4 mr-1" /> Gửi xử lý
              </Button>
              <Button
                variant="outline"
                onClick={handleCancel}
                className="h-9 px-4 text-sm font-medium border-gray-300 hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Hủy
              </Button>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <Table
              sortable={true}
              columns={columns}
              dataSource={data}
              showPagination={false}
              className="w-full"
            />
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-4">
            <Label
              htmlFor="processingContent"
              className="text-sm font-semibold text-gray-900 mb-3 block"
            >
              Nội dung xử lý
            </Label>
            <Textarea
              id="processingContent"
              placeholder="Nhập nội dung xử lý..."
              value={processingContent}
              onChange={(e) => {
                const v = e.target.value;
                if (v.length > MAX_PROCESSING_LENGTH) {
                  setProcessingContent(v.slice(0, MAX_PROCESSING_LENGTH));
                  setProcessingContentError(
                    "Nội dung xử lý không được dài quá 2000 ký tự"
                  );
                } else {
                  setProcessingContent(v);
                  setProcessingContentError(null);
                }
              }}
              className="min-h-[120px] resize-none"
            />
            {processingContentError && (
              <p className="text-xs text-red-600 mt-2">
                {processingContentError}
              </p>
            )}
            <div className="mt-4">
              <Label className="text-sm font-semibold text-gray-900 mb-2 block">
                Xử lý chính đã chọn
              </Label>
              {mainSelected ? (
                <div className="flex items-center justify-between rounded border px-3 py-2 bg-gray-50 text-sm">
                  <span className="truncate max-w-[80%]">
                    {mainSelected.type === "User" ? (
                      <>
                        <span className="text-blue-600 mr-1">Người:</span>
                        {mainSelected.name}
                      </>
                    ) : (
                      <>
                        <span className="text-green-600 mr-1">Đơn vị:</span>
                        {mainSelected.name}
                      </>
                    )}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 px-2 text-xs"
                    onClick={() => setMainSelected(null)}
                  >
                    Bỏ chọn
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-gray-500 italic">
                  Chưa chọn xử lý chính
                </p>
              )}
            </div>
          </div>
        </div>
      </CustomDialogContent>
    </Dialog>
  );
}
