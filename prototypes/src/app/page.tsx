"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { ScheduleCard } from "@/components/dashboard/schedule-card";
import { IncomingDocumentsCard } from "@/components/dashboard/incoming-documents-card";
import { OutgoingDocumentsCard } from "@/components/dashboard/outgoing-documents-card";
import { AssignedTasksCard } from "@/components/dashboard/assigned-tasks-card";
import { PendingActionsCard } from "@/components/dashboard/pending-actions-card";
import { StatsSection } from "@/components/dashboard/stats-section";
import { cn } from "@/lib/utils";

export default function DashboardPage() {
  // Sidebar collapsed by default
  const [sidebarOpen, setSidebarOpen] = useState(false);
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

        {/* Main Content - Fill remaining height */}
        <main className="flex-1 p-6 flex flex-col gap-6 overflow-hidden">
          {/* Stats Overview - Fixed height */}
          <section className="shrink-0">
            <StatsSection />
          </section>

          {/* Dashboard Grid - Fill remaining space */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 grid-rows-[1fr_1fr] gap-6 min-h-0">
            {/* Row 1: Action Required, Schedule, Tasks - Equal height */}
            <div className="lg:col-span-4 min-h-0">
              <PendingActionsCard className="h-full" />
            </div>

            <div className="lg:col-span-4 min-h-0">
              <ScheduleCard className="h-full" />
            </div>

            <div className="lg:col-span-4 min-h-0">
              <AssignedTasksCard className="h-full" />
            </div>

            {/* Row 2: Documents - Equal height */}
            <div className="lg:col-span-6 min-h-0">
              <IncomingDocumentsCard className="h-full" />
            </div>

            <div className="lg:col-span-6 min-h-0">
              <OutgoingDocumentsCard className="h-full" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
