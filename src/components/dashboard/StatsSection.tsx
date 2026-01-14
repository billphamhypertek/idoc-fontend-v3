"use client";

import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Mail, SendHorizontal, ClipboardList } from "lucide-react";
import type { DocumentStats } from "@/definitions/types/personalStatus.type";
import type { ModuleNode } from "@/definitions/types/auth.type";
import { getModules } from "@/utils/authentication.utils";

interface Props {
  documentStats: DocumentStats | undefined;
  outgoingDocumentStats: DocumentStats | undefined;
  taskStats: DocumentStats | undefined;
  completedRate: string;
}

interface CardItem {
  label: string;
  code: string;
  count: number;
}

interface Card {
  moduleCode: string;
  moduleName: string;
  items: CardItem[];
  hasData: boolean;
}

const labelMap: Record<string, string> = {
  DOC_IN_MAIN: "Xử lý chính",
  DOC_IN_SUPPORT: "Phối hợp",
  DOC_IN_KNOW: "Nhận để biết",
  DOC_IN_WAIT_RECEIVE: "Tiếp nhận văn bản đến",
  DOC_IN_DIRECTION: "Chỉ đạo",
  DOC_IN_OPINION: "Ý kiến",
  DOC_IN_DELEGATE: "Ủy quyền",
  DOC_IN_INTERNAL: "Nội bộ",
  DOC_IN_IMPORTANT: "Văn bản quan trọng",
  DOC_IN_SEARCH: "Tra cứu văn bản",
  DOC_OUT_MAIN: "Xử lý chính",
  DOC_OUT_SUPPORT: "Phối hợp",
  DOC_OUT_KNOW: "Nhận để biết",
  DOC_OUT_WAIT_RECEIVE: "Chờ nhận",
  DOC_OUT_DIRECTION: "Chỉ đạo",
  DOC_OUT_OPINION: "Ý kiến",
  DOC_OUT_DELEGATE: "Ủy quyền",
  DOC_OUT_INTERNAL: "Nội bộ",
  DRAFT_LIST: "Văn bản trình ký",
  DRAFT_HANDLE: "Văn bản chờ xử lý",
  DRAFT_ISSUED: "Văn bản ban hành",
  DRAFT_IMPORTANT: "Văn bản quan trọng",
  DRAFT_SEARCH: "Tra cứu văn bản",
  TASK_MAIN: "Xử lý chính",
  TASK_SUPPORT: "Phối hợp xử lý",
  TASK_ASSIGN: "Việc đã giao",
  TASK_LIST_ORG: "Công việc cơ quan",
  TASK_FOLLOW: "Theo dõi công việc",
  TASK_SEARCH: "Tra cứu tìm kiếm",
  TASK_STATISTICS: "Thống kê công việc",
};

const mapStatsToCards = (
  documentStats: DocumentStats | undefined,
  outgoingDocumentStats: DocumentStats | undefined,
  taskStats: DocumentStats | undefined,
  userModules: ModuleNode[]
): Card[] => {
  const allowedModules = ["DOCUMENT_IN", "DOCUMENT_OUT", "TASK"];
  return userModules
    .filter((module: ModuleNode) => allowedModules.includes(module.code))
    .map((module: ModuleNode): Card => {
      let stats: DocumentStats | undefined;
      let prefix: string;

      if (module.code === "DOCUMENT_IN") {
        stats = documentStats;
        prefix = "DOC_IN_";
      } else if (module.code === "DOCUMENT_OUT") {
        stats = outgoingDocumentStats;
        prefix = "DRAFT_";
      } else if (module.code === "TASK") {
        stats = taskStats;
        prefix = "TASK_";
      } else {
        stats = undefined;
        prefix = "";
      }

      const allKeys = Object.keys(stats || {}).filter(
        (key) =>
          key.startsWith(prefix) &&
          (stats as unknown as Record<string, number>)?.[key] > 0 &&
          key !== "DOC_IN_KNOW"
      );

      const items: CardItem[] = allKeys.map((key) => ({
        label: labelMap[key] || key,
        code: key,
        count: (stats as unknown as Record<string, number>)[key],
      }));

      return {
        moduleCode: module.code,
        moduleName: module.name,
        items,
        hasData: !!stats && items.length > 0,
      };
    });
};

const StatsSection: React.FC<Props> = ({
  documentStats,
  outgoingDocumentStats,
  taskStats,
  completedRate,
}) => {
  const [userModules, setUserModules] = useState<ModuleNode[]>([]);
  const router = useRouter();

  useEffect(() => {
    setUserModules(getModules() || []);
  }, []);

  // Memoize expensive computations
  const cards = useMemo(
    () =>
      mapStatsToCards(
        documentStats,
        outgoingDocumentStats,
        taskStats,
        userModules
      ),
    [documentStats, outgoingDocumentStats, taskStats, userModules]
  );

  const moduleOrder = useMemo(
    () => ["DOCUMENT_IN", "DOCUMENT_OUT", "TASK"],
    []
  );

  const getRoute = useCallback((moduleCode: string, code: string) => {
    if (moduleCode === "DOCUMENT_IN") {
      if (code === "DOC_IN_WAIT_RECEIVE") return "/document-out/list";
      if (code === "DOC_IN_MAIN") return "/document-out/main";
      if (code === "DOC_IN_SUPPORT") return "/document-out/combine";
      if (code === "DOC_IN_IMPORTANT") return "/document-out/important";
      if (code === "DOC_IN_OPINION") return "/document-out/opinion";
      if (code === "DOC_IN_SEARCH") return "/document-out/search";
    } else if (moduleCode === "DOCUMENT_OUT") {
      if (code === "DRAFT_LIST") return "/document-in/draft-list";
      if (code === "DRAFT_HANDLE") return "/document-in/draft-handle";
      if (code === "DRAFT_IMPORTANT") return "/document-in/important";
      if (code === "DRAFT_ISSUED") return "/document-in/draft-issued";
      if (code === "DRAFT_SEARCH") return "/document-in/search";
    } else if (moduleCode === "TASK") {
      if (code === "TASK_ASSIGN") return "/task/assign";
      if (code === "TASK_MAIN") return "/task/work";
      if (code === "TASK_SUPPORT") return "/task/combination";
      if (code === "TASK_LIST_ORG") return "/task/listTaskOrg";
      if (code === "TASK_FOLLOW") return "/task/follow";
      if (code === "TASK_SEARCH") return "/task/search";
      if (code === "TASK_STATISTICS") return "/task/statistics";
    }
    return null;
  }, []);

  const cardStyles = useMemo(
    () => ({
      DOCUMENT_IN: {
        bgClass: "bg-gradient-to-br from-blue-50 to-blue-100",
        totalColor: "text-blue-400",
        textColor: "text-blue-400",
        icon: <Mail className="w-6 h-6" />,
        title: "Số liệu Văn bản đến",
      },
      DOCUMENT_OUT: {
        bgClass: "bg-gradient-to-br from-yellow-50 to-yellow-100",
        totalColor: "text-orange-500",
        textColor: "text-orange-500",
        icon: <SendHorizontal className="w-6 h-6" />,
        title: "Số liệu Văn bản đi",
      },
      TASK: {
        bgClass: "bg-gradient-to-br from-green-50 to-green-100",
        totalColor: "text-green-600",
        textColor: "text-green-600",
        icon: <ClipboardList className="w-6 h-6" />,
        title: "Số liệu quản lý công việc",
      },
    }),
    []
  );

  // Sort function for DOCUMENT_IN items
  const sortDocumentInItems = useCallback((items: CardItem[]) => {
    const order = [
      "DOC_IN_WAIT_RECEIVE", // Tiếp nhận văn bản đến
      "DOC_IN_MAIN", // Xử lý chính
      "DOC_IN_SUPPORT", // Phối hợp
    ];

    return items.sort((a, b) => {
      const aIndex = order.indexOf(a.code);
      const bIndex = order.indexOf(b.code);

      // Nếu cả hai đều có trong order, sort theo thứ tự
      if (aIndex !== -1 && bIndex !== -1) {
        return aIndex - bIndex;
      }

      // Nếu chỉ a có trong order, a lên trước
      if (aIndex !== -1) return -1;

      // Nếu chỉ b có trong order, b lên trước
      if (bIndex !== -1) return 1;

      // Nếu cả hai đều không có trong order, giữ nguyên thứ tự ban đầu
      return 0;
    });
  }, []);

  // Memoize rendered items for each card
  const renderedCards = useMemo(() => {
    return moduleOrder.map((moduleCode) => {
      const card = cards.find((c) => c.moduleCode === moduleCode);
      if (!card) return null;

      const style = cardStyles[moduleCode as keyof typeof cardStyles];
      const total = card.items.reduce(
        (sum: number, item: CardItem) => sum + item.count,
        0
      );

      // Apply sorting for DOCUMENT_IN
      const sortedItems =
        card.moduleCode === "DOCUMENT_IN"
          ? sortDocumentInItems([...card.items])
          : card.items;

      return (
        <div
          key={card.moduleCode}
          className={`bg-white border border-gray-200 shadow-lg p-5 rounded-xl ${style.bgClass}`}
        >
          {/* Header với icon và title */}
          <div className="flex items-center gap-3 mb-4">
            {style.icon}
            <h3 className="text-xl font-bold text-gray-900">{style.title}</h3>
          </div>

          {/* Content */}
          {card.hasData ? (
            <div className="space-y-3">
              {/* Total count với size lớn hơn */}
              {total > 0 && (
                <div className="flex justify-between items-center py-2 px-3 bg-white/70 rounded-lg">
                  <span className="text-base font-medium text-gray-700">
                    Tổng số
                  </span>
                  <span
                    className={`text-3xl md:text-4xl font-extrabold ${style.totalColor}`}
                  >
                    {total}
                  </span>
                </div>
              )}

              {/* Items list - simplified without nested divs */}
              <div className="space-y-1">
                {sortedItems.map((item: CardItem) => {
                  const itemRoute = getRoute(card.moduleCode, item.code);
                  const isClickable = itemRoute && item.count > 0;

                  return (
                    <div
                      key={item.code}
                      className={`flex justify-between text-base py-2 px-3 rounded-lg transition-all ${
                        isClickable ? "hover:bg-white/50 cursor-pointer" : ""
                      }`}
                      onClick={
                        isClickable ? () => router.push(itemRoute!) : undefined
                      }
                    >
                      <span className="text-gray-700 font-medium">
                        {item.label}
                      </span>
                      <span className={`font-bold text-xl ${style.textColor}`}>
                        {item.count}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Completion rate cho TASK */}
              {card.moduleCode === "TASK" && parseFloat(completedRate) > 0 && (
                <div className="mt-4 py-2 px-3 bg-white/70 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Tiến độ hoàn thành
                    </span>
                    <span className={`text-lg font-bold ${style.textColor}`}>
                      {completedRate}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-green-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${completedRate}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-lg text-gray-600 font-medium">
                Không tìm thấy dữ liệu
              </p>
            </div>
          )}
        </div>
      );
    });
  }, [
    cards,
    cardStyles,
    moduleOrder,
    completedRate,
    getRoute,
    router,
    sortDocumentInItems,
  ]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{renderedCards}</div>
  );
};

export default StatsSection;
