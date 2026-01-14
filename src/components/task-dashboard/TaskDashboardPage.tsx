"use client";

import BreadcrumbNavigation from "../common/BreadcrumbNavigation";
import TaskDashboardFilter from "./TaskDashboardFilter";

export default function TaskDashboardPage() {
  return (
    <div className="px-4 py-0 flex flex-col gap-4">
      <BreadcrumbNavigation
        items={[
          {
            label: "Quản lý công việc",
            href: "/task/dashboard",
          },
        ]}
        currentPage="Thống kê công việc"
        showHome={false}
      />

      <TaskDashboardFilter />
    </div>
  );
}
