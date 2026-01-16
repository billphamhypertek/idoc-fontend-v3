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
    /** Page title displayed in header */
    title?: string;
    /** Page description/subtitle */
    description?: string;
}

export function PageLayout({
    children,
    activeModule = "doc-in",
    activeSubMenu = "doc-in",
    className,
    title,
    description,
}: PageLayoutProps) {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

    return (
        <div className="h-screen overflow-hidden bg-[hsl(var(--v3-background))]">
            {/* Sidebar */}
            <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} activeModule={activeModule} />

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
                    activeModule={activeModule}
                    activeSubMenu={activeSubMenu}
                />

                {/* Main Content - Scrollable */}
                <main className={cn("flex-1 p-6 overflow-y-auto", className)}>
                    {/* Page Header */}
                    {title && (
                        <div className="mb-6">
                            <div>
                                <h1 className="text-xl font-bold text-[hsl(var(--v3-card-foreground))]">
                                    {title}
                                </h1>
                                {description && (
                                    <p className="text-sm text-[hsl(var(--v3-muted-foreground))] mt-1">
                                        {description}
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                    {children}
                </main>
            </div>
        </div>
    );
}
