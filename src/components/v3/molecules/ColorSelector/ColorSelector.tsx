"use client";

/**
 * ColorSelector - Molecule component for primary color selection
 *
 * Shows 4 color options: blue, teal, purple, gold
 * Each option is a 32x32px colored circle with ring indicator for selection
 *
 * NOTE: Uses native <button> instead of v3 Button atom because color swatches
 * require custom circular styling that differs from standard button patterns.
 */

import { useUIPrefsStore, type PrimaryColor } from "@/stores/uiPrefs.store";
import { cn } from "~/lib/utils";

// ============================================
// Constants
// ============================================

const COLOR_OPTIONS: {
  value: PrimaryColor;
  label: string;
  hsl: string;
}[] = [
  { value: "blue", label: "Màu xanh dương", hsl: "220 95% 45%" },
  { value: "teal", label: "Màu xanh ngọc", hsl: "173 80% 40%" },
  { value: "purple", label: "Màu tím", hsl: "262 83% 58%" },
  { value: "gold", label: "Màu vàng", hsl: "45 100% 51%" },
];

// ============================================
// Component
// ============================================

export function ColorSelector() {
  const { primaryColor, setPrimaryColor } = useUIPrefsStore();

  return (
    <div
      className="flex items-center gap-2"
      role="group"
      aria-label="Chọn màu chủ đạo"
    >
      {COLOR_OPTIONS.map(({ value, label, hsl }) => (
        <button
          key={value}
          type="button"
          onClick={() => setPrimaryColor(value)}
          aria-label={label}
          aria-pressed={primaryColor === value}
          className={cn(
            "h-8 w-8 rounded-full transition-all",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            "hover:scale-110",
            primaryColor === value &&
              "ring-2 ring-offset-2 ring-[hsl(var(--v3-foreground,0_0%_9%))]"
          )}
          style={{ backgroundColor: `hsl(${hsl})` }}
        />
      ))}
    </div>
  );
}

ColorSelector.displayName = "ColorSelector";
