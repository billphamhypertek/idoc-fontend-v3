"use client";

import BreadcrumbNavigation from "../common/BreadcrumbNavigation";
import TaskDashboardFilter from "./TaskDashboardFilter";

export default function TaskDashboardPhongPage() {
  return (
    <div className="px-4 py-0 flex flex-col gap-4">
      <BreadcrumbNavigation
        items={[
          {
            label: "Quản lý công việc",
            href: "/task/dashboard_phong",
          },
        ]}
        currentPage="Thống kê công việc của phòng"
        showHome={false}
      />

      <TaskDashboardFilter />
    </div>
  );
}
