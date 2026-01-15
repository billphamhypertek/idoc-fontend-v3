"use client";

/**
 * FontSizeControl - Molecule component for font size selection
 *
 * Shows 3 size options: A (default), A+ (large), A++ (extra-large)
 * Uses v3 Button atoms with visual indication of current selection
 */

import { Button } from "@/components/v3/atoms";
import { useUIPrefsStore, type FontSize } from "@/stores/uiPrefs.store";

// ============================================
// Constants
// ============================================

const SIZE_OPTIONS: { value: FontSize; label: string; ariaLabel: string }[] = [
  { value: "default", label: "A", ariaLabel: "Cỡ chữ mặc định" },
  { value: "large", label: "A+", ariaLabel: "Cỡ chữ lớn" },
  { value: "extra-large", label: "A++", ariaLabel: "Cỡ chữ rất lớn" },
];

// ============================================
// Component
// ============================================

export function FontSizeControl() {
  const { fontSize, setFontSize } = useUIPrefsStore();

  return (
    <div
      className="flex items-center gap-1"
      role="group"
      aria-label="Điều chỉnh cỡ chữ"
    >
      {SIZE_OPTIONS.map(({ value, label, ariaLabel }) => (
        <Button
          key={value}
          variant={fontSize === value ? "default" : "ghost"}
          size="sm"
          onClick={() => setFontSize(value)}
          aria-pressed={fontSize === value}
          aria-label={ariaLabel}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}

FontSizeControl.displayName = "FontSizeControl";
