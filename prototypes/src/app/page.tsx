"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { StatsSection } from "@/components/dashboard/stats-section";
import {
  DocumentTrendChart,
  ScheduleSummary,
  DocumentStatusDonut,
  TaskStatusDonut,
  ReportsProgress,
  QuickActionsBadge,
  WeeklyTrendChart,
} from "@/components/dashboard-v2";
import { cn } from "@/lib/utils";

// Old components - commented out for reference
// import { ScheduleCard } from "@/components/dashboard/schedule-card";
// import { IncomingDocumentsCard } from "@/components/dashboard/incoming-documents-card";
// import { OutgoingDocumentsCard } from "@/components/dashboard/outgoing-documents-card";
// import { AssignedTasksCard } from "@/components/dashboard/assigned-tasks-card";
// import { PendingActionsCard } from "@/components/dashboard/pending-actions-card";
// import { TopDepartments, Leaderboard } from "@/components/dashboard-v2";

export default function DashboardPage() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSubMenu, setActiveSubMenu] = useState("personal");

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="h-screen overflow-hidden bg-[hsl(var(--v3-background))]">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

      {/* Main Content - Fluid layout */}
      <div
        className={cn(
          "h-screen flex flex-col transition-all duration-300 ease-in-out",
          sidebarOpen ? "lg:ml-[270px]" : "lg:ml-[80px]"
        )}
      >
        <Header
          onToggleSidebar={toggleSidebar}
          isSidebarOpen={sidebarOpen}
          activeModule="dashboard"
          activeSubMenu={activeSubMenu}
        />

        {/* Main Content - Scrollable */}
        <main className="flex-1 p-6 overflow-y-auto">
          <div className="space-y-6">
            {/* Row 1: 4 Stats Cards - Nhiệm vụ, VB đến, VB đi, Báo cáo */}
            <section>
              <StatsSection />
            </section>

            {/* Row 2: 3 Equal - Cần xử lý ngay, Trạng thái nhiệm vụ, Lịch hôm nay */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <QuickActionsBadge />
              <TaskStatusDonut />
              <ScheduleSummary />
            </section>

            {/* Row 3: Small (1/3) + Wide (2/3) - Trạng thái VB đến, Xu hướng công việc */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <DocumentStatusDonut />
              <WeeklyTrendChart className="lg:col-span-2" />
            </section>

            {/* Row 4: Wide (2/3) + Small (1/3) - VB theo thời gian, Tiến độ báo cáo */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <DocumentTrendChart className="lg:col-span-2" />
              <ReportsProgress />
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
