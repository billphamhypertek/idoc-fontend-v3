"use client";

/**
 * ThemeToggle - Molecule component for cycling through themes
 *
 * Cycles: light → dark → high-contrast → light
 * Uses v3 Button atom with icon variant
 */

import { Sun, Moon, Contrast } from "lucide-react";
import { Button } from "@/components/v3/atoms";
import { useUIPrefsStore } from "@/stores/uiPrefs.store";
import type { Theme } from "@/lib/theme";

// ============================================
// Constants
// ============================================

const THEME_ICONS: Record<
  Theme,
  React.ComponentType<{ className?: string }>
> = {
  light: Sun,
  dark: Moon,
  "high-contrast": Contrast,
};

const THEME_LABELS: Record<Theme, string> = {
  light: "Sáng",
  dark: "Tối",
  "high-contrast": "Tương phản cao",
};

const THEME_CYCLE: Record<Theme, Theme> = {
  light: "dark",
  dark: "high-contrast",
  "high-contrast": "light",
};

// ============================================
// Component
// ============================================

export function ThemeToggle() {
  const { theme, setTheme } = useUIPrefsStore();
  const Icon = THEME_ICONS[theme];

  const handleClick = () => {
    setTheme(THEME_CYCLE[theme]);
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleClick}
      aria-label={`Đổi theme (đang dùng: ${THEME_LABELS[theme]})`}
    >
      <Icon className="h-5 w-5" />
    </Button>
  );
}

ThemeToggle.displayName = "ThemeToggle";
