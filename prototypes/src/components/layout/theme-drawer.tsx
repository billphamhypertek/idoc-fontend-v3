"use client";

import { Cross2Icon, CheckIcon, MixerHorizontalIcon } from "@radix-ui/react-icons";
import { themePalettes } from "@/data/mock-data";
import { useTheme } from "@/lib/theme-context";
import { cn } from "@/lib/utils";

interface ThemeDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ThemeDrawer({ isOpen, onClose }: ThemeDrawerProps) {
    const { currentTheme, setTheme } = useTheme();

    return (
        <>
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/30 z-50 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Drawer */}
            <div
                className={cn(
                    "fixed top-0 right-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-[hsl(var(--v3-border))]">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-[hsl(var(--v3-primary))]/10 flex items-center justify-center">
                            <MixerHorizontalIcon className="w-5 h-5 text-[hsl(var(--v3-primary))]" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-[hsl(var(--v3-card-foreground))]">
                                Cài đặt giao diện
                            </h2>
                            <p className="text-xs text-[hsl(var(--v3-muted-foreground))]">
                                Tùy chỉnh màu sắc
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-[hsl(var(--v3-muted))] transition-colors"
                    >
                        <Cross2Icon className="w-5 h-5 text-[hsl(var(--v3-muted-foreground))]" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-5">
                    <h3 className="text-xs font-semibold text-[hsl(var(--v3-muted-foreground))] uppercase tracking-wider mb-4">
                        Màu chủ đạo
                    </h3>

                    <div className="grid grid-cols-3 gap-3">
                        {themePalettes.map((palette) => (
                            <button
                                key={palette.id}
                                onClick={() => setTheme(palette)}
                                className={cn(
                                    "relative flex flex-col items-center gap-2 p-3 rounded-lg border transition-all hover:shadow-md",
                                    currentTheme.id === palette.id
                                        ? "border-[hsl(var(--v3-primary))] bg-[hsl(var(--v3-primary))]/5 shadow-md"
                                        : "border-[hsl(var(--v3-border))] hover:border-[hsl(var(--v3-muted-foreground))]/30"
                                )}
                            >
                                {/* Color Preview */}
                                <div
                                    className="w-10 h-10 rounded-full shadow-md ring-2 ring-white"
                                    style={{ backgroundColor: `hsl(${palette.primary})` }}
                                />

                                {/* Label */}
                                <span className="text-xs font-medium text-[hsl(var(--v3-card-foreground))]">
                                    {palette.name}
                                </span>

                                {/* Selected indicator */}
                                {currentTheme.id === palette.id && (
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-[hsl(var(--v3-primary))] rounded-full flex items-center justify-center shadow-md">
                                        <CheckIcon className="w-3 h-3 text-white" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Preview Section */}
                    <div className="mt-6 pt-5 border-t border-[hsl(var(--v3-border))]">
                        <h3 className="text-xs font-semibold text-[hsl(var(--v3-muted-foreground))] uppercase tracking-wider mb-4">
                            Xem trước
                        </h3>
                        <div className="flex gap-3">
                            <button className="flex-1 py-2.5 text-sm font-semibold text-white bg-[hsl(var(--v3-primary))] rounded-lg hover:bg-[hsl(var(--v3-primary-hover))] transition-colors shadow-md">
                                Nút chính
                            </button>
                            <button className="flex-1 py-2.5 text-sm font-semibold text-[hsl(var(--v3-primary))] bg-[hsl(var(--v3-primary))]/10 rounded-lg hover:bg-[hsl(var(--v3-primary))]/20 transition-colors">
                                Nút phụ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
