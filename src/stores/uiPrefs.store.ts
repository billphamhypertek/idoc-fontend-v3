/**
 * ĐHTN v3 UI Preferences Store
 *
 * Manages user preferences for theme, primary color, and font size.
 * Persists preferences to localStorage with Zustand persist middleware.
 *
 * @see FR20 - Font size customization
 * @see FR24 - Theme + Primary color customization
 */

import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type Theme,
  setTheme as applyTheme,
  THEME_STORAGE_KEY,
} from "@/lib/theme";

// ============================================
// Types
// ============================================

export type FontSize = "default" | "large" | "extra-large";
export type PrimaryColor = "blue" | "teal" | "purple" | "gold";

export { type Theme };

export interface UIPrefsState {
  // State
  theme: Theme;
  primaryColor: PrimaryColor;
  fontSize: FontSize;

  // Actions
  setTheme: (theme: Theme) => void;
  setPrimaryColor: (color: PrimaryColor) => void;
  setFontSize: (fontSize: FontSize) => void;
  resetPreferences: () => void;
  initPreferences: () => void;
}

// ============================================
// Constants
// ============================================

const STORAGE_KEY = "dhtn-v3-ui-prefs";
const OLD_THEME_KEY = THEME_STORAGE_KEY; // "dhtn-v3-theme" - for migration

const FONT_SCALE_VALUES: Record<FontSize, number> = {
  default: 1,
  large: 1.125,
  "extra-large": 1.25,
};

const PRIMARY_COLOR_VALUES: Record<PrimaryColor, string> = {
  blue: "220 95% 45%",
  teal: "173 80% 40%",
  purple: "262 83% 58%",
  gold: "45 100% 51%",
};

// ============================================
// Utilities
// ============================================

/**
 * SSR guard - check if running in browser
 */
function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

/**
 * Migrate old theme key to new store format
 * Returns the old theme value if found, null otherwise
 */
function migrateOldThemeKey(): Theme | null {
  if (!isBrowser()) return null;

  try {
    const oldTheme = localStorage.getItem(OLD_THEME_KEY);
    if (oldTheme && ["light", "dark", "high-contrast"].includes(oldTheme)) {
      // Remove old key after reading
      localStorage.removeItem(OLD_THEME_KEY);
      return oldTheme as Theme;
    }
  } catch {
    // Ignore localStorage errors
  }

  return null;
}

/**
 * Apply primary color to CSS custom properties
 */
function applyPrimaryColor(color: PrimaryColor): void {
  if (!isBrowser()) return;

  const hsl = PRIMARY_COLOR_VALUES[color];
  document.documentElement.style.setProperty("--v3-color-primary", hsl);
  document.documentElement.style.setProperty(
    "--v3-color-primary-foreground",
    "0 0% 100%"
  ); // White foreground for all primary colors
  document.documentElement.style.setProperty("--v3-ring-color", hsl);
}

/**
 * Apply font scale to CSS custom property
 */
function applyFontScale(fontSize: FontSize): void {
  if (!isBrowser()) return;

  const scale = FONT_SCALE_VALUES[fontSize];
  document.documentElement.style.setProperty("--v3-font-scale", String(scale));
}

/**
 * Remove custom CSS properties (for reset)
 */
function removeCustomProperties(): void {
  if (!isBrowser()) return;

  document.documentElement.style.removeProperty("--v3-color-primary");
  document.documentElement.style.removeProperty(
    "--v3-color-primary-foreground"
  );
  document.documentElement.style.removeProperty("--v3-ring-color");
  document.documentElement.style.removeProperty("--v3-font-scale");
}

/**
 * Get system theme preference
 */
function getSystemTheme(): Theme {
  if (!isBrowser()) return "light";

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

// ============================================
// Store
// ============================================

export const useUIPrefsStore = create<UIPrefsState>()(
  persist(
    (set, get) => ({
      // Initial state
      theme: "light",
      primaryColor: "blue",
      fontSize: "default",

      // Actions
      setTheme: (theme: Theme) => {
        if (isBrowser()) {
          applyTheme(theme);
        }
        set({ theme });
      },

      setPrimaryColor: (primaryColor: PrimaryColor) => {
        if (isBrowser()) {
          applyPrimaryColor(primaryColor);
        }
        set({ primaryColor });
      },

      setFontSize: (fontSize: FontSize) => {
        if (isBrowser()) {
          applyFontScale(fontSize);
        }
        set({ fontSize });
      },

      resetPreferences: () => {
        const systemTheme = getSystemTheme();
        if (isBrowser()) {
          applyTheme(systemTheme);
          removeCustomProperties();
        }
        set({
          theme: systemTheme,
          primaryColor: "blue",
          fontSize: "default",
        });
      },

      initPreferences: () => {
        const state = get();

        // Check for migration from old theme key
        const migratedTheme = migrateOldThemeKey();
        const themeToApply = migratedTheme ?? state.theme;

        // Apply all preferences
        if (isBrowser()) {
          applyTheme(themeToApply);
          applyPrimaryColor(state.primaryColor);
          applyFontScale(state.fontSize);
        }

        // Update state if migration occurred
        if (migratedTheme && migratedTheme !== state.theme) {
          set({ theme: migratedTheme });
        }
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        theme: state.theme,
        primaryColor: state.primaryColor,
        fontSize: state.fontSize,
      }),
      // Skip automatic hydration to prevent FOUC - we'll manually rehydrate
      skipHydration: true,
    }
  )
);
