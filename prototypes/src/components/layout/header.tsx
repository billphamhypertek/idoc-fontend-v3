"use client";

import { useState } from "react";
import Link from "next/link";
import { BellIcon, MixerHorizontalIcon } from "@radix-ui/react-icons";
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
            <header className="sticky top-0 z-30 flex items-center h-16 px-5 bg-white border-b border-black/5">
                {/* Left: Hamburger */}
                <div className="shrink-0">
                    <SidebarToggle onClick={onToggleSidebar} isOpen={isSidebarOpen} />
                </div>

                {/* Middle: Sub Menu Items */}
                <nav className="flex-1 flex items-center gap-1 ml-4 overflow-x-auto scrollbar-thin">
                    {currentSubMenuItems.map((item) => (
                        <Link
                            key={item.id}
                            href={item.href}
                            className={cn(
                                "shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
                                activeSubMenu === item.id
                                    ? "text-white bg-[hsl(var(--v3-primary))] shadow-md"
                                    : "text-[hsl(var(--v3-muted-foreground))] hover:text-[hsl(var(--v3-card-foreground))] hover:bg-[hsl(var(--v3-muted))]"
                            )}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Right: Search + Actions */}
                <div className="shrink-0 flex items-center gap-3 ml-4">


                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button className="relative flex items-center justify-center w-10 h-10 rounded-lg hover:bg-[hsl(var(--v3-muted))] transition-colors">
                                <BellIcon className="w-5 h-5 text-[hsl(var(--v3-muted-foreground))]" />
                                <span className="absolute top-1.5 right-1.5 flex items-center justify-center w-4 h-4 text-[10px] font-bold text-white bg-[hsl(var(--v3-primary))] rounded-full">
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
                                className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-[hsl(var(--v3-muted))] transition-colors"
                            >
                                <MixerHorizontalIcon className="w-5 h-5 text-[hsl(var(--v3-muted-foreground))]" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>Cài đặt giao diện</TooltipContent>
                    </Tooltip>

                    <div className="w-px h-8 bg-[hsl(var(--v3-border))] mx-1" />

                    <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[hsl(var(--v3-muted))] transition-colors">
                        <Avatar className="h-8 w-8 ring-2 ring-[hsl(var(--v3-border))]">
                            <AvatarImage src={currentUser.avatar} alt={currentUser.name} />
                            <AvatarFallback className="text-xs bg-[hsl(var(--v3-primary))] text-white font-semibold">
                                {getInitials(currentUser.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="hidden lg:flex flex-col items-start">
                            <span className="text-sm font-semibold text-[hsl(var(--v3-card-foreground))]">
                                {currentUser.name.split(" ").slice(-2).join(" ")}
                            </span>
                            <span className="text-xs text-[hsl(var(--v3-muted-foreground))]">
                                {currentUser.role}
                            </span>
                        </div>
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
