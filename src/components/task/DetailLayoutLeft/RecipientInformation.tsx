"use client";

import { useState, useMemo, useEffect, useCallback } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import ProcessTableCard from "@/components/document-out/ProcessTableCard";
import { useGetTracking } from "@/hooks/data/task.data";
import { flattenProcess } from "@/utils/common.utils";
import { useGetTrackingV2 } from "@/hooks/data/taskv2.data";

interface RecipientInformationProps {
  taskId: number;
  isV2?: boolean;
}

const getProgressBarColor = (percentage: number) => {
  if (percentage === 100) return "bg-green-500";
  if (percentage >= 75) return "bg-blue-600";
  if (percentage >= 50) return "bg-yellow-500";
  if (percentage >= 25) return "bg-orange-500";
  return "bg-red-500";
};

const ProgressBar = ({ progress }: { progress: number }) => {
  const percentage = Math.min(Math.max(progress || 0, 0), 100);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-gray-700">{percentage}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${getProgressBarColor(percentage)}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default function RecipientInformation({
  taskId,
  isV2 = false,
}: RecipientInformationProps) {
  const [collapseTrackingState, setCollapseTrackingState] = useState(true);

  const [expandedSet, setExpandedSet] = useState<Set<string>>(new Set());
  const toggleExpanded = (path: string) => {
    setExpandedSet((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const { data: trackingData } = useGetTracking(taskId, !isV2);

  const { data: trackingDataV2 } = useGetTrackingV2(taskId, isV2);

  const trackingDataMerged = isV2 ? trackingDataV2 : trackingData;

  // Function to collect all paths with children recursively
  const getAllPathsWithChildren = useCallback(
    (
      nodes: { data: any; children?: { data: any }[] }[],
      basePath: string = "0"
    ): Set<string> => {
      const paths = new Set<string>();
      nodes.forEach((node, index) => {
        const path = node?.data?.pid || `${basePath}-${index}`;
        if (node.children && node.children.length > 0) {
          paths.add(path);
          // Recursively get children paths
          const childPaths = getAllPathsWithChildren(node.children, path);
          childPaths.forEach((p) => paths.add(p));
        }
      });
      return paths;
    },
    []
  );

  // Auto-expand all nodes when trackingData is loaded
  useEffect(() => {
    if (trackingDataMerged && trackingDataMerged.length > 0) {
      const allPaths = getAllPathsWithChildren(trackingDataMerged);
      setExpandedSet(allPaths);
    }
  }, [trackingDataMerged, getAllPathsWithChildren]);

  const trackingColumns = [
    {
      accessorKey: "frInfo",
      header: "Người gửi/nhận",
      accessor: (row: any) => (
        <div
          className="flex items-start"
          style={{ paddingLeft: `${row?.level * 12}px` }}
        >
          <div className="mr-2">
            {row?.children?.length ? (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleExpanded(row?.data?.pid ?? row?.path ?? "");
                }}
                className="p-1 hover:bg-gray-100 rounded"
                aria-label={
                  !expandedSet.has(row?.data?.pid ?? row?.path ?? "")
                    ? "Collapse"
                    : "Expand"
                }
              >
                {expandedSet.has(row?.data?.pid ?? row?.path ?? "") ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>
            ) : (
              <span className="w-4 inline-block" />
            )}
          </div>
          <div>
            {row?.data?.frUserFullName === row?.data?.toUserFullName ? (
              <div>{row?.data?.frUserFullName}</div>
            ) : (
              <div>
                <div>{row?.data?.toUserFullName}</div>
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      accessorKey: "typeName",
      header: "Loại",
      accessor: (row: any) => row?.data?.typeName,
    },
    {
      accessorKey: "statusName",
      header: "Trạng thái",
      accessor: (row: any) => row?.data?.statusName,
    },
    {
      accessorKey: "progress",
      header: "Tiến độ",
      accessor: (row: any) => {
        return <ProgressBar progress={row?.data?.progress || 0} />;
      },
    },
  ];

  const processedTrackingData = useMemo(() => {
    return flattenProcess(trackingDataMerged || [], 0, "0", expandedSet);
  }, [trackingDataMerged, expandedSet]);

  return (
    <div className="col-span-full mt-8">
      <ProcessTableCard
        title="Thông tin gửi nhận"
        collapse={collapseTrackingState}
        onToggle={() => setCollapseTrackingState(!collapseTrackingState)}
        columns={trackingColumns}
        data={processedTrackingData}
      />
    </div>
  );
}
