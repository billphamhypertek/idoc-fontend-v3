"use client";

import BreadcrumbNavigation from "../common/BreadcrumbNavigation";
import StatisticContent from "../task-dashboard/statistic/StatisticContent";

export default function TaskStatisticV2() {
  return (
    <div className="py-0 px-4 flex flex-col gap-4">
      <BreadcrumbNavigation
        items={[{ label: "Quản lý công việc", href: "/task-v2/statistic" }]}
        currentPage="Thống kê công việc"
        showHome={false}
      />

      <StatisticContent />
    </div>
  );
}
