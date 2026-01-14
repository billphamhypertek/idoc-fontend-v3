import { Module } from "@/definitions/types/module.type";
import { ChevronDown, ChevronRight } from "lucide-react";
import { SelectItem } from "@/components/ui/select";
import React from "react";

export interface TreeSelectItemProps {
  modules: Module[];
  level?: number;
  expandedIds: Set<number>;
  toggleExpand: (id: number) => void;
  excludeModuleId?: number | null;
  setSelect?: (id: number | null) => void;
  maxDepth?: number;
}

const Indent: React.FC<{ level: number }> = ({ level }) => (
  <span style={{ display: "inline-block", width: `${level * 1.2}em` }} />
);

export const TreeSelectItems: React.FC<TreeSelectItemProps> = ({
  modules,
  level = 0,
  expandedIds,
  toggleExpand,
  excludeModuleId = null,
  setSelect,
  maxDepth = 2,
}) => {
  return (
    <>
      {modules.map((module) => {
        if (module.id === excludeModuleId) return null;
        const hasChildren =
          Array.isArray(module.subModule) &&
          module.subModule.length > 0 &&
          level < maxDepth;

        return (
          <React.Fragment key={module.id}>
            <div className="flex items-center group hover:bg-gray-50 p-1 rounded-sm">
              <Indent level={level} />
              {hasChildren ? (
                <button
                  type="button"
                  className="mr-1 -ml-2 p-0.5"
                  tabIndex={-1}
                  aria-label="Toggle"
                  onClick={() => toggleExpand(module.id)}
                >
                  {expandedIds.has(module.id) ? (
                    <ChevronDown className="w-4 h-4 text-blue-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              ) : (
                <span style={{ width: 18 }} />
              )}

              <SelectItem
                value={module.id.toString()}
                key={module.id}
                onClick={() => {
                  if (setSelect) setSelect(module.id);
                }}
                className="flex-grow"
              >
                {module.name}
              </SelectItem>
            </div>
            {hasChildren && expandedIds.has(module.id) && (
              <TreeSelectItems
                modules={module.subModule}
                level={level + 1}
                expandedIds={expandedIds}
                toggleExpand={toggleExpand}
                excludeModuleId={excludeModuleId}
                setSelect={setSelect}
                maxDepth={maxDepth}
                // showResetButton prop removed
              />
            )}
          </React.Fragment>
        );
      })}
    </>
  );
};
