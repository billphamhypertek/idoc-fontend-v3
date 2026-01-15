"use client";

import Link from "next/link";
import Image from "next/image";
import {
    DashboardIcon,
    DownloadIcon,
    UploadIcon,
    FileTextIcon,
    CheckCircledIcon,
    TargetIcon,
    CalendarIcon,
    ClockIcon,
    BarChartIcon,
    Share2Icon,
    BookmarkFilledIcon,
    GearIcon,
    ExitIcon,
    HamburgerMenuIcon,
    Cross1Icon,
} from "@radix-ui/react-icons";
import { Car } from "lucide-react";
import { cn } from "@/lib/utils";
import { menuGroups } from "@/data/mock-data";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

// Custom Car icon wrapper to match Radix icon sizing
const CarIcon = ({ className }: { className?: string }) => (
    <Car className={className} strokeWidth={1.5} />
);

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
    Dashboard: DashboardIcon,
    Download: DownloadIcon,
    Upload: UploadIcon,
    File: FileTextIcon,
    CheckCircled: CheckCircledIcon,
    Target: TargetIcon,
    Calendar: CalendarIcon,
    Clock: ClockIcon,
    BarChart: BarChartIcon,
    Share2: Share2Icon,
    Car: CarIcon,
    BookmarkFilled: BookmarkFilledIcon,
};

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
}

export function Sidebar({ isOpen, onToggle }: SidebarProps) {
    return (
        <TooltipProvider delayDuration={0}>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={onToggle}
                />
            )}

            <aside
                className={cn(
                    "fixed left-0 top-0 z-50 h-screen bg-[hsl(var(--v3-sidebar-bg))] text-[hsl(var(--v3-sidebar-text))] transition-all duration-300 ease-in-out flex flex-col",
                    isOpen ? "w-[260px] translate-x-0" : "w-[260px] -translate-x-full lg:w-[68px] lg:translate-x-0"
                )}
            >
                {/* Logo & Toggle */}
                <div className="flex items-center justify-between px-3 py-3 border-b border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-10 h-10 shrink-0">
                            <Image
                                src="/logo.png"
                                alt="Cơ yếu Việt Nam"
                                width={40}
                                height={40}
                                className="object-contain"
                            />
                        </div>
                        {isOpen && (
                            <div className="flex flex-col min-w-0">
                                <span className="font-semibold text-white text-sm truncate">
                                    ĐHTN v3
                                </span>
                                <span className="text-xs text-white/60 truncate">
                                    Ban Cơ yếu Chính phủ
                                </span>
                            </div>
                        )}
                    </div>
                    {/* Close button - visible when open */}
                    {isOpen && (
                        <button
                            onClick={onToggle}
                            className="p-2 rounded-lg hover:bg-white/10 transition-colors lg:hidden"
                        >
                            <Cross1Icon className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-2 px-3">
                    {menuGroups.map((group, groupIndex) => (
                        <div key={group.id}>
                            {/* Separator between groups */}
                            {groupIndex > 0 && (
                                <div className="my-2 h-px bg-white/10" />
                            )}

                            <ul className="space-y-0.5">
                                {group.items.map((item) => {
                                    const Icon = iconMap[item.icon] || DashboardIcon;
                                    const menuButton = (
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                "flex items-center gap-3 px-3 py-2 rounded-lg transition-all group relative",
                                                !isOpen && "lg:justify-center lg:px-2",
                                                item.active
                                                    ? "bg-[hsl(var(--v3-sidebar-active))] text-white"
                                                    : "hover:bg-[hsl(var(--v3-sidebar-hover))] text-white/80 hover:text-white"
                                            )}
                                        >
                                            <Icon className="w-[18px] h-[18px] shrink-0" />
                                            {isOpen && (
                                                <>
                                                    <span className="flex-1 text-sm font-medium truncate">
                                                        {item.label}
                                                    </span>
                                                    {item.badge && (
                                                        <span className="flex items-center justify-center h-5 min-w-[20px] px-1.5 text-xs font-medium bg-[hsl(var(--v3-error))] text-white rounded-full">
                                                            {item.badge}
                                                        </span>
                                                    )}
                                                </>
                                            )}
                                            {!isOpen && item.badge && (
                                                <span className="absolute -top-1 -right-1 flex items-center justify-center h-4 min-w-[16px] px-1 text-[10px] font-medium bg-[hsl(var(--v3-error))] text-white rounded-full">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </Link>
                                    );

                                    return (
                                        <li key={item.id}>
                                            {!isOpen ? (
                                                <Tooltip>
                                                    <TooltipTrigger asChild>{menuButton}</TooltipTrigger>
                                                    <TooltipContent side="right" className="flex items-center gap-2">
                                                        {item.label}
                                                        {item.badge && (
                                                            <span className="flex items-center justify-center h-4 min-w-[16px] px-1 text-[10px] font-medium bg-[hsl(var(--v3-error))] text-white rounded-full">
                                                                {item.badge}
                                                            </span>
                                                        )}
                                                    </TooltipContent>
                                                </Tooltip>
                                            ) : (
                                                menuButton
                                            )}
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    ))}
                </nav>

                {/* Footer */}
                <div className="border-t border-white/10 p-3 space-y-1">
                    {!isOpen ? (
                        <>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button className="flex items-center justify-center w-full p-2.5 rounded-lg hover:bg-[hsl(var(--v3-sidebar-hover))] text-white/80 hover:text-white transition-colors">
                                        <GearIcon className="w-[18px] h-[18px]" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="right">Cài đặt</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <button className="flex items-center justify-center w-full p-2.5 rounded-lg hover:bg-[hsl(var(--v3-error))]/20 text-white/80 hover:text-[hsl(var(--v3-error))] transition-colors">
                                        <ExitIcon className="w-[18px] h-[18px]" />
                                    </button>
                                </TooltipTrigger>
                                <TooltipContent side="right">Đăng xuất</TooltipContent>
                            </Tooltip>
                        </>
                    ) : (
                        <>
                            <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-[hsl(var(--v3-sidebar-hover))] text-white/80 hover:text-white transition-colors">
                                <GearIcon className="w-[18px] h-[18px]" />
                                <span className="text-sm font-medium">Cài đặt</span>
                            </button>
                            <button className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-[hsl(var(--v3-error))]/20 text-white/80 hover:text-[hsl(var(--v3-error))] transition-colors">
                                <ExitIcon className="w-[18px] h-[18px]" />
                                <span className="text-sm font-medium">Đăng xuất</span>
                            </button>
                        </>
                    )}
                </div>
            </aside>
        </TooltipProvider>
    );
}

// Hamburger Menu Button for Header
export function SidebarToggle({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) {
    return (
        <button
            onClick={onClick}
            className="flex items-center justify-center w-9 h-9 rounded-lg hover:bg-[hsl(var(--v3-muted))] transition-colors"
            aria-label={isOpen ? "Đóng menu" : "Mở menu"}
        >
            <HamburgerMenuIcon className="w-5 h-5 text-[hsl(var(--v3-card-foreground))]" />
        </button>
    );
}
