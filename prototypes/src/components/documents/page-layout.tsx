"use client";

import { useState, ReactNode } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { cn } from "@/lib/utils";

interface PageLayoutProps {
    children: ReactNode;
    activeModule?: string;
    activeSubMenu?: string;
    className?: string;
}

export function PageLayout({
    children,
    activeModule = "doc-in",
    activeSubMenu = "receive",
    className,
}: PageLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="min-h-screen bg-[hsl(var(--v3-background))]">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />

            {/* Main Content - Fluid layout */}
            <div
                className={cn(
                    "min-h-screen flex flex-col transition-all duration-300 ease-in-out",
                    sidebarOpen ? "lg:ml-[260px]" : "lg:ml-[68px]"
                )}
            >
                <Header
                    onToggleSidebar={toggleSidebar}
                    isSidebarOpen={sidebarOpen}
                    activeModule={activeModule}
                    activeSubMenu={activeSubMenu}
                />

                {/* Main Content */}
                <main className={cn("flex-1 p-4 lg:p-5", className)}>
                    {children}
                </main>
            </div>
        </div>
    );
}
