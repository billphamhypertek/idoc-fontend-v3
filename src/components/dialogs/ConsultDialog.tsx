import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogDescription,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableCell, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { OrganizationItem, TransferDialogProps } from "@/definitions";
import { cn } from "@/lib/utils";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  ArrowRight,
  Building,
  ChevronDown,
  ChevronLeft,
  MessageCircle,
  Users,
} from "lucide-react";
import React, { useState, useEffect } from "react";

// Custom DialogContent without close button
const CustomDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg",
        className
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
));
CustomDialogContent.displayName = DialogPrimitive.Content.displayName;

export function ConsultDialog({
  isOpen,
  onOpenChange,
  onClose,
  onSubmit,
  selectedRole,
  organizationData,
}: TransferDialogProps) {
  const [consultData, setConsultData] = useState({
    processingContent: "",
    mainProcessors: [] as number[],
  });
  const [error, setError] = useState<string>("");

  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  // Helper function to collect all IDs recursively
  const collectIds = (items: OrganizationItem[]): number[] => {
    const ids: number[] = [];
    items.forEach((i) => {
      ids.push(i.id);
      if (i.children) ids.push(...collectIds(i.children));
    });
    return ids;
  };

  // Expand all items when dialog opens
  useEffect(() => {
    if (isOpen && organizationData?.length) {
      setExpandedItems(new Set(collectIds(organizationData)));
    }
  }, [isOpen, organizationData]);

  const handleConsultSubmit = () => {
    if (consultData.mainProcessors.length === 0 || !selectedRole) {
      console.error("No processor or role selected");
      return;
    }

    if (consultData.processingContent.length > 2000) {
      setError("Nội dung xử lý không được dài quá 2000 kí tự");
      return;
    }
    onSubmit({
      processingContent: consultData.processingContent,
      mainProcessors: consultData.mainProcessors,
      selectedRoleId: selectedRole.id,
    });
    setConsultData({
      processingContent: "",
      mainProcessors: [],
    });
    onClose();
  };

  const handleConsultCancel = () => {
    setConsultData({
      processingContent: "",
      mainProcessors: [],
    });
    onClose();
  };

  // Helper function to get all children IDs recursively
  const getAllChildrenIds = (item: OrganizationItem): number[] => {
    const childrenIds: number[] = [];
    if (item.children) {
      item.children.forEach((child) => {
        childrenIds.push(child.id);
        childrenIds.push(...getAllChildrenIds(child));
      });
    }
    return childrenIds;
  };

  // Helper function to find parent ID
  const findParentId = (
    targetId: number,
    items: OrganizationItem[]
  ): number | null => {
    for (const item of items) {
      if (item.children) {
        for (const child of item.children) {
          if (child.id === targetId) {
            return item.id;
          }
          // Check recursively
          const found = findParentId(targetId, [child]);
          if (found) return found;
        }
      }
    }
    return null;
  };

  // Helper function to check if all children are selected
  const areAllChildrenSelected = (item: OrganizationItem): boolean => {
    if (!item.children || item.children.length === 0) return true;

    const allChildrenIds = getAllChildrenIds(item);
    return allChildrenIds.every((childId) =>
      consultData.mainProcessors.includes(childId)
    );
  };
  const handleMainProcessorToggle = (unitId: number) => {
    setConsultData((prev) => {
      const isSelected = prev.mainProcessors.includes(unitId);

      let newProcessors: number[] = [];

      // Nếu đang chọn lại thì bỏ chọn => xoá item
      if (isSelected) {
        newProcessors = prev.mainProcessors.filter((id) => id !== unitId);
      } else {
        newProcessors = [...prev.mainProcessors, unitId];
      }

      return {
        ...prev,
        mainProcessors: newProcessors,
      };
    });
  };

  // Helper function to find item by ID
  const findItemById = (
    id: number,
    items: OrganizationItem[]
  ): OrganizationItem | null => {
    for (const item of items) {
      if (item.id === id) return item;
      if (item.children) {
        const found = findItemById(id, item.children);
        if (found) return found;
      }
    }
    return null;
  };

  const toggleExpanded = (itemId: number) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const renderOrganization = (item: OrganizationItem, level: number = 0) => {
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;

    // Chỉ hiển thị checkbox cho level 2 (trung tâm) và level 3 (cá nhân)
    const canSelect = level >= 2;
    const isChecked =
      item.type === "person"
        ? consultData.mainProcessors.includes(item.id)
        : !!(
            item.leaderId && consultData.mainProcessors.includes(item.leaderId)
          );
    return (
      <React.Fragment key={item.id}>
        <TableRow className="hover:bg-gray-50">
          <TableCell className="py-3">
            <div
              className="flex items-center"
              style={{ paddingLeft: `${level * 20}px` }}
            >
              {item.type === "organization" ? (
                <Building className="w-4 h-4 mr-2 text-gray-600" />
              ) : (
                <Users className="w-4 h-4 mr-2 text-gray-600" />
              )}
              <span className="text-sm font-medium text-gray-900">
                {item.name}
              </span>
              {hasChildren && (
                <button
                  onClick={() => toggleExpanded(item.id)}
                  className="ml-2 p-1 hover:bg-gray-100 rounded"
                >
                  <ChevronDown
                    className={`w-4 h-4 text-gray-400 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>
              )}
            </div>
          </TableCell>
          <TableCell className="text-center py-3">
            {canSelect ? (
              <Checkbox
                checked={isChecked}
                onCheckedChange={() => handleMainProcessorToggle(item.id)}
              />
            ) : (
              <span className="text-xs text-gray-400">-</span>
            )}
          </TableCell>
        </TableRow>
        {hasChildren &&
          isExpanded &&
          item.children?.map((child) => renderOrganization(child, level + 1))}
      </React.Fragment>
    );
  };
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
      className: "py-3 w-3/4",
    },
    {
      header: "Xử lý chính",
      accessor: (item: OrganizationItem) => {
        const canSelect = item.level >= 2;
        const isChecked =
          item.type === "person"
            ? consultData.mainProcessors.includes(item.id)
            : !!(item.parentId && consultData.mainProcessors.includes(item.id));
        return canSelect ? (
          <Checkbox
            checked={isChecked}
            onCheckedChange={() => handleMainProcessorToggle(item.id)}
          />
        ) : (
          <span className="text-xs text-gray-400">-</span>
        );
      },
      className: "text-center py-3 w-1/4",
    },
  ];

  const flattenData = (
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
  };

  const tableData = flattenData(organizationData);

  const getSelectedNames = () => {
    return consultData.mainProcessors
      .map((id) => {
        const item = findItemById(id, organizationData);
        return item ? item.name : "";
      })
      .filter(Boolean)
      .join(", ");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <CustomDialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="pb-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl font-semibold text-gray-900 flex items-center">
                Luồng ý kiến
              </DialogTitle>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={handleConsultCancel}
                className="h-9 px-4 text-sm font-medium border-gray-300 hover:bg-gray-50"
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Hủy
              </Button>
              <Button
                disabled={consultData.mainProcessors.length === 0}
                onClick={handleConsultSubmit}
                className="bg-blue-600 hover:bg-blue-700 text-white h-9 px-4 text-sm font-medium"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Xin ý kiến
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Bảng chọn đơn vị/cá nhân */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <Table
              sortable={true}
              columns={columns}
              dataSource={tableData}
              showPagination={false}
              className="w-full"
            />
          </div>

          <div className="flex items-start gap-2 text-sm">
            <span className="font-bold text-red-500 whitespace-nowrap">
              Xử lý chính :
            </span>
            <span className="text-gray-900">{getSelectedNames()}</span>
          </div>

          {/* Nội dung xử lý */}
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
              value={consultData.processingContent}
              onChange={(e) => {
                if (e.target.value.length <= 2000) {
                  setError("");
                }
                setConsultData((prev) => ({
                  ...prev,
                  processingContent: e.target.value,
                }));
              }}
              className="min-h-[120px] resize-none"
            />
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          </div>
        </div>
      </CustomDialogContent>
    </Dialog>
  );
}
