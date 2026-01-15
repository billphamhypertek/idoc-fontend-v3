/**
 * ĐHTN v3 Theme Utility
 *
 * Provides theme switching functionality with localStorage persistence.
 * Designed for users 50+ with accessibility as priority.
 *
 * Usage:
 *   import { initTheme, setTheme, getTheme } from '@/lib/theme';
 *
 *   // On app initialization (client-side only)
 *   initTheme();
 *
 *   // Switch theme programmatically
 *   setTheme('dark');
 *
 *   // Get current theme
 *   const currentTheme = getTheme();
 *
 * @see architecture.md#Design System Architecture
 */

/**
 * Available themes for ĐHTN v3
 */
export type Theme = "light" | "dark" | "high-contrast";

/**
 * localStorage key for theme persistence
 */
export const THEME_STORAGE_KEY = "dhtn-v3-theme";

/**
 * List of valid themes for validation
 */
const VALID_THEMES: readonly Theme[] = ["light", "dark", "high-contrast"];

/**
 * Check if a value is a valid Theme
 */
export function isValidTheme(value: unknown): value is Theme {
  return typeof value === "string" && VALID_THEMES.includes(value as Theme);
}

/**
 * Check if running in browser environment
 */
function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof document !== "undefined";
}

/**
 * Set the current theme
 *
 * Updates the data-theme attribute on the html element and
 * persists the choice to localStorage.
 *
 * Safe to call during SSR - will no-op on server.
 *
 * @param theme - The theme to apply ('light' | 'dark' | 'high-contrast')
 */
export function setTheme(theme: Theme): void {
  // SSR guard - do nothing on server
  if (!isBrowser()) {
    return;
  }

  if (!isValidTheme(theme)) {
    console.warn(`Invalid theme: ${theme}. Using 'light' as fallback.`);
    theme = "light";
  }

  // Apply theme to html element
  document.documentElement.setAttribute("data-theme", theme);

  // Persist to localStorage
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (error) {
    // localStorage might be unavailable (private browsing, etc.)
    console.warn("Unable to persist theme to localStorage:", error);
  }
}

/**
 * Get the current theme
 *
 * Returns the theme from localStorage if available,
 * otherwise returns 'light' as default.
 *
 * Safe to call during SSR - returns 'light' on server.
 *
 * @returns The current theme
 */
export function getTheme(): Theme {
  // SSR guard - return default on server
  if (!isBrowser()) {
    return "light";
  }

  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (isValidTheme(saved)) {
      return saved;
    }
  } catch (error) {
    // localStorage might be unavailable
    console.warn("Unable to read theme from localStorage:", error);
  }

  return "light";
}

/**
 * Initialize theme on app load
 *
 * Checks localStorage for saved preference, falls back to system preference,
 * and applies the theme to the document.
 *
 * Call this in your app's entry point (e.g., layout.tsx or app.tsx).
 * Safe to call during SSR - will no-op on server.
 */
export function initTheme(): void {
  // SSR guard - do nothing on server
  if (!isBrowser()) {
    return;
  }

  // Try to get saved theme from localStorage
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY);
    if (isValidTheme(saved)) {
      setTheme(saved);
      return;
    }
  } catch {
    // localStorage unavailable, continue to system preference
  }

  // Fall back to system preference
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    setTheme("dark");
  } else {
    setTheme("light");
  }
}

/**
 * Toggle between light and dark themes
 *
 * Convenience function for simple theme toggle buttons.
 * Does not cycle through high-contrast (use setTheme for that).
 *
 * Note: If current theme is high-contrast, toggles to light.
 *
 * @returns The new theme after toggling
 */
export function toggleTheme(): Theme {
  const current = getTheme();
  const next = current === "dark" ? "light" : "dark";
  setTheme(next);
  return next;
}

/**
 * Listen for system theme preference changes
 *
 * Call this to automatically update theme when user changes system preference.
 * Only applies if no explicit theme is saved in localStorage.
 *
 * Safe to call during SSR - returns no-op function on server.
 *
 * @returns Cleanup function to remove the listener
 */
export function watchSystemTheme(): () => void {
  // SSR guard - return no-op on server
  if (!isBrowser()) {
    return () => {};
  }

  const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

  const handler = (e: MediaQueryListEvent): void => {
    // Only apply system preference if user hasn't explicitly set a theme
    try {
      const saved = localStorage.getItem(THEME_STORAGE_KEY);
      if (!saved) {
        setTheme(e.matches ? "dark" : "light");
      }
    } catch {
      // localStorage unavailable, apply system preference
      setTheme(e.matches ? "dark" : "light");
    }
  };

  mediaQuery.addEventListener("change", handler);

  return () => {
    mediaQuery.removeEventListener("change", handler);
  };
}
