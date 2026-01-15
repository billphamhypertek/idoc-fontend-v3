"use client";

import { X, Check, Palette } from "lucide-react";
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
                    className="fixed inset-0 bg-black/50 z-50 transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Drawer */}
            <div
                className={cn(
                    "fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out",
                    isOpen ? "translate-x-0" : "translate-x-full"
                )}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-[hsl(var(--v3-border))]">
                    <div className="flex items-center gap-2">
                        <Palette className="w-5 h-5 text-[hsl(var(--v3-primary))]" />
                        <h2 className="font-semibold text-[hsl(var(--v3-card-foreground))]">
                            Cài đặt giao diện
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-[hsl(var(--v3-muted))] transition-colors"
                    >
                        <X className="w-5 h-5 text-[hsl(var(--v3-muted-foreground))]" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4">
                    <h3 className="text-sm font-medium text-[hsl(var(--v3-muted-foreground))] mb-3">
                        Chọn màu chủ đạo
                    </h3>

                    <div className="grid grid-cols-2 gap-3">
                        {themePalettes.map((palette) => (
                            <button
                                key={palette.id}
                                onClick={() => setTheme(palette)}
                                className={cn(
                                    "relative flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all hover:shadow-md",
                                    currentTheme.id === palette.id
                                        ? "border-[hsl(var(--v3-primary))] bg-[hsl(var(--v3-primary))]/5"
                                        : "border-[hsl(var(--v3-border))] hover:border-[hsl(var(--v3-primary))]/50"
                                )}
                            >
                                {/* Color Preview */}
                                <div className="flex gap-1">
                                    <div
                                        className="w-8 h-8 rounded-full shadow-sm"
                                        style={{ backgroundColor: `hsl(${palette.primary})` }}
                                    />
                                    <div
                                        className="w-8 h-8 rounded-full shadow-sm"
                                        style={{ backgroundColor: `hsl(${palette.sidebar})` }}
                                    />
                                </div>

                                {/* Label */}
                                <span className="text-xs font-medium text-[hsl(var(--v3-card-foreground))]">
                                    {palette.name}
                                </span>

                                {/* Selected indicator */}
                                {currentTheme.id === palette.id && (
                                    <div className="absolute top-2 right-2 w-5 h-5 bg-[hsl(var(--v3-primary))] rounded-full flex items-center justify-center">
                                        <Check className="w-3 h-3 text-white" />
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Preview Section */}
                    <div className="mt-6 pt-4 border-t border-[hsl(var(--v3-border))]">
                        <h3 className="text-sm font-medium text-[hsl(var(--v3-muted-foreground))] mb-3">
                            Xem trước
                        </h3>
                        <div className="flex gap-2">
                            <button className="flex-1 py-2 text-sm font-medium text-white bg-[hsl(var(--v3-primary))] rounded-lg hover:bg-[hsl(var(--v3-primary-hover))] transition-colors">
                                Nút chính
                            </button>
                            <button className="flex-1 py-2 text-sm font-medium text-[hsl(var(--v3-primary))] bg-[hsl(var(--v3-primary))]/10 rounded-lg hover:bg-[hsl(var(--v3-primary))]/20 transition-colors">
                                Nút phụ
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
