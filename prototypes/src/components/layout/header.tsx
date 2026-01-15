"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Palette } from "lucide-react";
import { currentUser, subMenuItems } from "@/data/mock-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { SidebarToggle } from "./sidebar";
import { ThemeDrawer } from "./theme-drawer";
import { cn } from "@/lib/utils";

interface HeaderProps {
    onToggleSidebar: () => void;
    isSidebarOpen: boolean;
    activeModule?: string;
    activeSubMenu?: string;
}

export function Header({
    onToggleSidebar,
    isSidebarOpen,
    activeModule = "dashboard",
    activeSubMenu = "personal"
}: HeaderProps) {
    const [themeDrawerOpen, setThemeDrawerOpen] = useState(false);

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .substring(0, 2)
            .toUpperCase();
    };

    const currentSubMenuItems = subMenuItems[activeModule] || [];

    return (
        <TooltipProvider>
            <header className="sticky top-0 z-30 flex items-center h-14 px-4 lg:px-5 bg-white border-b border-[hsl(var(--v3-border))]">
                {/* Left: Hamburger */}
                <div className="shrink-0">
                    <SidebarToggle onClick={onToggleSidebar} isOpen={isSidebarOpen} />
                </div>

                {/* Middle: Sub Menu Items */}
                <nav className="flex-1 flex items-center gap-1 ml-2 overflow-x-auto scrollbar-thin">
                    {currentSubMenuItems.map((item) => (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={cn(
                                "shrink-0 px-3 py-1.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
                                activeSubMenu === item.id
                                    ? "text-[hsl(var(--v3-primary))] bg-[hsl(var(--v3-primary))]/10"
                                    : "text-[hsl(var(--v3-muted-foreground))] hover:text-[hsl(var(--v3-card-foreground))] hover:bg-[hsl(var(--v3-muted))]"
                            )}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Right: Actions */}
                <div className="shrink-0 flex items-center gap-1 ml-2">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-[hsl(var(--v3-muted))] transition-colors">
                                <Bell className="w-5 h-5 text-[hsl(var(--v3-muted-foreground))]" />
                                <span className="absolute top-1 right-1 flex items-center justify-center w-4 h-4 text-[9px] font-bold text-white bg-[hsl(var(--v3-error))] rounded-full">
                                    5
                                </span>
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>Thông báo</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => setThemeDrawerOpen(true)}
                                className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-[hsl(var(--v3-muted))] transition-colors"
                            >
                                <Palette className="w-5 h-5 text-[hsl(var(--v3-muted-foreground))]" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>Cài đặt giao diện</TooltipContent>
                    </Tooltip>

                    <div className="w-px h-6 bg-[hsl(var(--v3-border))] mx-1" />

                    <button className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-[hsl(var(--v3-muted))] transition-colors">
                        <Avatar className="h-7 w-7">
                            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                            <AvatarFallback className="text-xs">
                                {getInitials(currentUser.name)}
                            </AvatarFallback>
                        </Avatar>
                        <span className="hidden lg:block text-sm font-medium text-[hsl(var(--v3-card-foreground))]">
                            {currentUser.name.split(" ").pop()}
                        </span>
                    </button>
                </div>
            </header>

            {/* Theme Drawer */}
            <ThemeDrawer
                isOpen={themeDrawerOpen}
                onClose={() => setThemeDrawerOpen(false)}
            />
        </TooltipProvider>
    );
}
