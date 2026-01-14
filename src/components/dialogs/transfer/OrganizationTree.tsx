import { Checkbox } from "@/components/ui/checkbox";
import { Table, TableCell, TableRow } from "@/components/ui/table";
import { Building, ChevronDown, Users } from "lucide-react";
import { OrganizationItem } from "@/definitions";
import React from "react";

interface OrganizationTreeProps {
  organizationData: OrganizationItem[];
  expandedItems: Set<number>;
  transferData: {
    mainProcessors: number[];
  };
  onToggleExpanded: (itemId: number) => void;
  onMainProcessorToggle: (unitId: number) => void;
}

export function OrganizationTree({
  organizationData,
  expandedItems,
  transferData,
  onToggleExpanded,
  onMainProcessorToggle,
}: OrganizationTreeProps) {
  const renderOrganization = (item: OrganizationItem, level: number = 0) => {
    const isExpanded = expandedItems.has(item.id);
    const hasChildren = item.children && item.children.length > 0;

    // Chỉ hiển thị checkbox cho level 2 (trung tâm) và level 3 (cá nhân)
    const canSelect = level >= 2;
    const isChecked =
      item.type === "person"
        ? transferData.mainProcessors.includes(item.id)
        : !!(
            item.leaderId && transferData.mainProcessors.includes(item.leaderId)
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
                  onClick={() => onToggleExpanded(item.id)}
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
                onCheckedChange={() => onMainProcessorToggle(item.id)}
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

  return <>{organizationData.map((item) => renderOrganization(item))}</>;
}
