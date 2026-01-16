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
import { typedMenuGroups, MenuItem } from "@/data/mock-data";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

// Custom Car icon wrapper to match Radix icon sizing
const CarIcon = ({ className }: { className?: string }) => (
    <Car className={className} strokeWidth={2} />
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
    Gear: GearIcon,
    Exit: ExitIcon,
};

interface SidebarProps {
    isOpen: boolean;
    onToggle: () => void;
    activeModule?: string;
}

export function Sidebar({ isOpen, onToggle, activeModule = "dashboard" }: SidebarProps) {
    // Get main menu items (excluding bottom group)
    const mainMenuGroups = typedMenuGroups.filter(group => group.id !== "bottom");
    // Get bottom group items
    const bottomGroup = typedMenuGroups.find(group => group.id === "bottom");
    const bottomItems: MenuItem[] = bottomGroup?.items || [];

    return (
        <TooltipProvider delayDuration={0}>
            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-40 lg:hidden"
                    onClick={onToggle}
                />
            )}

            <aside
                className={cn(
                    "fixed left-0 top-0 z-50 h-screen bg-white border-r border-black/5 transition-all duration-300 ease-in-out flex flex-col",
                    isOpen ? "w-[270px] translate-x-0" : "w-[270px] -translate-x-full lg:w-[80px] lg:translate-x-0"
                )}
            >
                {/* Logo & Brand */}
                <div className="flex items-center gap-3 px-5 py-5">
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
                            <span className="font-semibold text-[hsl(var(--v3-card-foreground))] text-[15px] leading-tight truncate">
                                Điều Hành Tác Nghiệp
                            </span>
                            <span className="text-xs text-[hsl(var(--v3-muted-foreground))] truncate">
                                Ban Cơ yếu Chính phủ
                            </span>
                        </div>
                    )}
                    {/* Close button - mobile only */}
                    {isOpen && (
                        <button
                            onClick={onToggle}
                            className="ml-auto p-2 rounded-lg hover:bg-[hsl(var(--v3-muted))] transition-colors lg:hidden"
                        >
                            <Cross1Icon className="w-4 h-4 text-[hsl(var(--v3-muted-foreground))]" />
                        </button>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 overflow-y-auto py-2 px-4 scrollbar-thin">
                    <ul className="space-y-1">
                        {mainMenuGroups.flatMap(group => group.items).map((item) => {
                            const Icon = iconMap[item.icon] || DashboardIcon;
                            const isActive = item.id === activeModule;
                            const menuButton = (
                                <Link
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 px-4 py-2.5 rounded-lg transition-all group relative",
                                        !isOpen && "lg:justify-center lg:px-3",
                                        isActive
                                            ? "bg-[hsl(var(--v3-primary))] text-white shadow-md"
                                            : "text-[hsl(var(--v3-muted-foreground))] hover:bg-[hsl(var(--v3-muted))] hover:text-[hsl(var(--v3-card-foreground))]"
                                    )}
                                >
                                    <Icon className={cn(
                                        "w-6 h-6 shrink-0",
                                        isActive ? "text-white" : "text-[hsl(var(--v3-card-foreground))] group-hover:text-[hsl(var(--v3-card-foreground))]"
                                    )} />
                                    {isOpen && (
                                        <>
                                            <span className="flex-1 text-sm font-medium truncate">
                                                {item.label}
                                            </span>
                                            {"badge" in item && item.badge && (
                                                <span className={cn(
                                                    "flex items-center justify-center h-5 min-w-[22px] px-1.5 text-xs font-semibold rounded-full",
                                                    isActive
                                                        ? "bg-white/20 text-white"
                                                        : "bg-[hsl(var(--v3-primary))] text-white"
                                                )}>
                                                    {item.badge}
                                                </span>
                                            )}
                                        </>
                                    )}
                                    {!isOpen && "badge" in item && item.badge && (
                                        <span className="absolute -top-0.5 -right-0.5 flex items-center justify-center h-4 min-w-[16px] px-1 text-[10px] font-bold bg-[hsl(var(--v3-primary))] text-white rounded-full">
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
                                                {"badge" in item && item.badge && (
                                                    <span className="flex items-center justify-center h-4 min-w-[16px] px-1 text-[10px] font-semibold bg-[hsl(var(--v3-primary))] text-white rounded-full">
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
                </nav>

                {/* Footer - Bottom Group Items */}
                <div className="border-t border-[hsl(var(--v3-border))] p-4 space-y-1">
                    {bottomItems.map((item) => {
                        const Icon = iconMap[item.icon] || GearIcon;
                        const isLogout = item.id === "logout";

                        const footerButton = (
                            <Link
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 w-full px-4 py-2.5 rounded-lg transition-colors",
                                    !isOpen && "lg:justify-center lg:px-3",
                                    isLogout
                                        ? "text-[hsl(var(--v3-card-foreground))] hover:bg-[hsl(var(--v3-error))]/10 hover:text-[hsl(var(--v3-error))]"
                                        : "text-[hsl(var(--v3-card-foreground))] hover:bg-[hsl(var(--v3-muted))] hover:text-[hsl(var(--v3-card-foreground))]"
                                )}
                            >
                                <Icon className="w-6 h-6" />
                                {isOpen && (
                                    <span className="text-sm font-medium">{item.label}</span>
                                )}
                            </Link>
                        );

                        return !isOpen ? (
                            <Tooltip key={item.id}>
                                <TooltipTrigger asChild>{footerButton}</TooltipTrigger>
                                <TooltipContent side="right">{item.label}</TooltipContent>
                            </Tooltip>
                        ) : (
                            <div key={item.id}>{footerButton}</div>
                        );
                    })}
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
            className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-[hsl(var(--v3-muted))] transition-colors"
            aria-label={isOpen ? "Đóng menu" : "Mở menu"}
        >
            <HamburgerMenuIcon className="w-5 h-5 text-[hsl(var(--v3-card-foreground))]" />
        </button>
    );
}
