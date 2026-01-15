# Story 1.4: UI Preferences Store

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Epic Context

**Epic 1: Design System Foundation**

- Mục tiêu: Thiết lập nền tảng design tokens và theme system cho toàn bộ v3 components
- FRs covered: FR20 (Font size customization), FR24 (Theme + Primary color customization)
- NFRs addressed: NFR9 (WCAG 2.1 AA), NFR10 (14px minimum), NFR14 (Design System based)

**Dependencies:**

- Story 1.1 (Design Tokens Foundation) - ✅ **DONE**
- Story 1.2 (Theme System & High Contrast) - ✅ **DONE**
- Story 1.3 (Atomic Components) - ✅ **DONE**

## Story

As a **User (đặc biệt users 50+ tuổi)**,
I want **a UI Preferences Store that manages theme selection, primary color, font size, and accessibility settings**,
so that **my visual preferences persist across sessions and can be easily changed via UI controls**.

## Acceptance Criteria

1. **GIVEN** the theme utilities from Story 1.2 exist, **WHEN** story is complete, **THEN** `src/stores/uiPrefs.store.ts` exists with:
   - Theme state: `theme: 'light' | 'dark' | 'high-contrast'`
   - Primary color state: `primaryColor: 'blue' | 'teal' | 'purple' | 'gold'`
   - Font size state: `fontSize: 'default' | 'large' | 'extra-large'`
   - Actions: `setTheme()`, `setPrimaryColor()`, `setFontSize()`, `resetPreferences()`
   - Persisted to localStorage via Zustand persist middleware

2. **GIVEN** the UIPrefsStore, **WHEN** `setTheme(theme)` is called, **THEN**:
   - Store state updates with new theme
   - `document.documentElement.setAttribute('data-theme', theme)` is called
   - localStorage is updated via Zustand's persist middleware
   - SSR-safe: no DOM access during server rendering

3. **GIVEN** the UIPrefsStore, **WHEN** `setPrimaryColor(color)` is called, **THEN**:
   - Store state updates with new primary color
   - CSS custom property `--v3-color-primary` is updated with color HSL value
   - Primary-foreground and hover variants are also updated
   - localStorage persists the choice

4. **GIVEN** the UIPrefsStore, **WHEN** `setFontSize(size)` is called, **THEN**:
   - Store state updates with new font size
   - CSS custom property `--v3-font-scale` is applied to `document.documentElement`
   - Font scale values: `default: 1`, `large: 1.125`, `extra-large: 1.25`

5. **GIVEN** a user changes preferences, **WHEN** they refresh the page, **THEN**:
   - Theme, primary color, and font size preferences are restored from localStorage
   - DOM is hydrated with correct values
   - No flash of incorrect theme (FOUC prevention)
   - Old `dhtn-v3-theme` key is migrated to new store on first load

6. **GIVEN** the store, **WHEN** `resetPreferences()` is called, **THEN**:
   - Theme resets to system preference (via `prefers-color-scheme`)
   - Primary color resets to `blue` (default)
   - Font size resets to `default`
   - localStorage is cleared for UI preferences

7. **GIVEN** v3 atoms from Story 1.3, **WHEN** story is complete, **THEN** a `ThemeToggle` molecule component exists:
   - Located at `src/components/v3/molecules/ThemeToggle/`
   - Uses v3 Button atom with icon variant
   - Shows current theme icon (sun/moon/contrast)
   - Cycles through themes on click
   - Accessible: ARIA labels, keyboard navigable, displayName set

8. **GIVEN** v3 atoms from Story 1.3, **WHEN** story is complete, **THEN** a `FontSizeControl` molecule component exists:
   - Located at `src/components/v3/molecules/FontSizeControl/`
   - Shows 3 size options: A (default), A+ (large), A++ (extra-large)
   - Uses v3 Button atoms with appropriate sizes
   - Accessible: ARIA labels, indicates current selection, displayName set

9. **GIVEN** v3 atoms from Story 1.3, **WHEN** story is complete, **THEN** a `ColorSelector` molecule component exists:
   - Located at `src/components/v3/molecules/ColorSelector/`
   - Shows 4 color options: blue, teal, purple, gold
   - Each option is a colored circle/swatch button
   - Indicates current selection with ring/border
   - Accessible: ARIA labels, displayName set

10. **GIVEN** all components, **WHEN** inspected, **THEN**:
    - Build succeeds: `npm run build`
    - TypeScript has no errors
    - Components work correctly in dev server

> ⚠️ **Note:** Unit tests deferred - project has no jest/vitest configured yet.

## Tasks / Subtasks

- [x] **Task 1: Add font-scale token to typography.css** (AC: #4)
  - [x] Add `--v3-font-scale: 1;` to `:root` in `src/styles/v3/tokens/typography.css`
  - [x] This provides default value that store will override

- [x] **Task 2: Create UIPrefsStore** (AC: #1, #5)
  - [x] Create `src/stores/uiPrefs.store.ts`
  - [x] Define TypeScript interfaces: `UIPrefsState`, `FontSize`, `PrimaryColor`
  - [x] Re-export `Theme` type from `@/lib/theme`
  - [x] Implement Zustand store with `persist` middleware
  - [x] Storage key: `dhtn-v3-ui-prefs`
  - [x] Partialize state for persistence (theme, primaryColor, fontSize)
  - [x] Add migration logic for old `dhtn-v3-theme` key

- [x] **Task 3: Implement theme actions** (AC: #2, #5)
  - [x] Create `setTheme(theme: Theme)` action
  - [x] Integrate with existing `src/lib/theme.ts` utilities
  - [x] Add SSR guard for DOM access
  - [x] Add system preference detection for initial value

- [x] **Task 4: Implement primary color actions** (AC: #3)
  - [x] Create `setPrimaryColor(color: PrimaryColor)` action
  - [x] Define color HSL values: `{ blue: '220 95% 45%', teal: '173 80% 40%', purple: '262 83% 58%', gold: '45 100% 51%' }`
  - [x] Apply `--v3-color-primary`, `--v3-color-primary-foreground`, `--v3-color-ring` CSS properties
  - [x] Add SSR guard for DOM access

- [x] **Task 5: Implement font size actions** (AC: #4, #5)
  - [x] Create `setFontSize(size: FontSize)` action
  - [x] Define font scale values: `{ default: 1, large: 1.125, 'extra-large': 1.25 }`
  - [x] Apply `--v3-font-scale` CSS property to html element
  - [x] Add SSR guard for DOM access

- [x] **Task 6: Implement reset, initialization, and migration** (AC: #5, #6)
  - [x] Create `resetPreferences()` action
  - [x] Create `initPreferences()` for hydration
  - [x] Handle system preference detection via `prefers-color-scheme`
  - [x] Migrate old `dhtn-v3-theme` localStorage key if exists

- [x] **Task 7: Create ThemeToggle molecule** (AC: #7)
  - [x] Create `src/components/v3/molecules/ThemeToggle/` folder
  - [x] Create `ThemeToggle.tsx` using v3 Button atom (icon variant)
  - [x] Import icons from lucide-react: `Sun`, `Moon`, `Contrast`
  - [x] Implement theme cycling: light → dark → high-contrast → light
  - [x] Add ARIA label: `"Đổi theme"` with current state
  - [x] Add `ThemeToggle.displayName = "ThemeToggle"`
  - [x] Create `index.ts` barrel export

- [x] **Task 8: Create FontSizeControl molecule** (AC: #8)
  - [x] Create `src/components/v3/molecules/FontSizeControl/` folder
  - [x] Create `FontSizeControl.tsx` using v3 Button atoms
  - [x] Show 3 buttons: "A" (default), "A+" (large), "A++" (extra-large)
  - [x] Highlight current selection with variant/aria-pressed
  - [x] Add ARIA labels in Vietnamese
  - [x] Add `FontSizeControl.displayName = "FontSizeControl"`
  - [x] Create `index.ts` barrel export

- [x] **Task 9: Create ColorSelector molecule** (AC: #9)
  - [x] Create `src/components/v3/molecules/ColorSelector/` folder
  - [x] Create `ColorSelector.tsx` with 4 color swatch buttons
  - [x] Style swatches as 32x32px circles with the color
  - [x] Selected swatch has ring indicator
  - [x] Add ARIA labels: "Màu xanh dương", "Màu xanh ngọc", etc.
  - [x] Add `ColorSelector.displayName = "ColorSelector"`
  - [x] Create `index.ts` barrel export

- [x] **Task 10: Create molecules barrel export** (AC: #7, #8, #9, #10)
  - [x] Create `src/components/v3/molecules/index.ts`
  - [x] Export ThemeToggle, FontSizeControl, ColorSelector
  - [x] Verify imports work

- [x] **Task 11: Verify build and integration** (AC: #10)
  - [x] Run `npm run build` - verify no errors
  - [x] Test in dev server: theme switching works
  - [x] Test in dev server: primary color switching works
  - [x] Test in dev server: font size switching works
  - [x] Test persistence: refresh page, preferences restored
  - [x] Test migration: old theme key migrated correctly

## Dev Notes

### 🚨 CRITICAL: Existing Theme Utilities

**Story 1.2 already created `src/lib/theme.ts`** with these utilities:

- `setTheme(theme)` - applies theme to DOM and localStorage
- `getTheme()` - reads current theme
- `initTheme()` - initializes theme from localStorage/system preference
- `toggleTheme()` - toggles between light/dark
- `watchSystemTheme()` - listens for system preference changes

**REUSE these utilities in the store!** Do NOT duplicate DOM manipulation logic.

### FR24 Requirements (CRITICAL)

**From epics.md:** FR24 requires "Users can customize theme (dark/light mode, **primary color**) với localStorage persistence"

**Primary Color Options:**
| Color | HSL Value | Use Case |
|-------|-----------|----------|
| `blue` | `220 95% 45%` | Default - Premium Enterprise |
| `teal` | `173 80% 40%` | Fresh, modern alternative |
| `purple` | `262 83% 58%` | Creative, distinctive |
| `gold` | `45 100% 51%` | Elegant, traditional |

### Previous Story Intelligence

**From Story 1.2 (Theme System):**

- Theme switching via `[data-theme="dark"]` attribute on `<html>`
- localStorage key: `dhtn-v3-theme` (OLD - migrate this!)
- SSR guards with `isBrowser()` check
- System preference detection via `prefers-color-scheme`

**From Story 1.3 (Atomic Components):**

- v3 Button supports icon variant (h-11 w-11 for 44px touch target)
- v3 Button uses v3 tokens with loading state, asChild support
- Lucide React for icons

### Existing Store Pattern (from sideBar.store.ts)

```typescript
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface MyStore {
  myValue: string;
  setMyValue: (value: string) => void;
}

export const useMyStore = create<MyStore>()(
  persist(
    (set, get) => ({
      myValue: "initial",
      setMyValue: (value) => set({ myValue: value }),
    }),
    {
      name: "my-store-key",
      partialize: (state) => ({ myValue: state.myValue }),
    }
  )
);
```

### UIPrefsStore Structure

```typescript
// src/stores/uiPrefs.store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Theme, setTheme as applyTheme, THEME_STORAGE_KEY } from "@/lib/theme";

export type FontSize = "default" | "large" | "extra-large";
export type PrimaryColor = "blue" | "teal" | "purple" | "gold";

interface UIPrefsState {
  theme: Theme;
  primaryColor: PrimaryColor;
  fontSize: FontSize;

  setTheme: (theme: Theme) => void;
  setPrimaryColor: (color: PrimaryColor) => void;
  setFontSize: (fontSize: FontSize) => void;
  resetPreferences: () => void;
  initPreferences: () => void;
}

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

const STORAGE_KEY = "dhtn-v3-ui-prefs";
const OLD_THEME_KEY = "dhtn-v3-theme"; // For migration

const isBrowser = () =>
  typeof window !== "undefined" && typeof document !== "undefined";

// Migration: check for old theme key
function migrateOldThemeKey(): Theme | null {
  if (!isBrowser()) return null;
  try {
    const oldTheme = localStorage.getItem(OLD_THEME_KEY);
    if (oldTheme && ["light", "dark", "high-contrast"].includes(oldTheme)) {
      localStorage.removeItem(OLD_THEME_KEY); // Clean up old key
      return oldTheme as Theme;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export const useUIPrefsStore = create<UIPrefsState>()(
  persist(
    (set, get) => ({
      theme: "light",
      primaryColor: "blue",
      fontSize: "default",

      setTheme: (theme) => {
        if (isBrowser()) applyTheme(theme);
        set({ theme });
      },

      setPrimaryColor: (primaryColor) => {
        if (isBrowser()) {
          const hsl = PRIMARY_COLOR_VALUES[primaryColor];
          document.documentElement.style.setProperty("--v3-color-primary", hsl);
          document.documentElement.style.setProperty("--v3-ring-color", hsl);
        }
        set({ primaryColor });
      },

      setFontSize: (fontSize) => {
        if (isBrowser()) {
          document.documentElement.style.setProperty(
            "--v3-font-scale",
            String(FONT_SCALE_VALUES[fontSize])
          );
        }
        set({ fontSize });
      },

      resetPreferences: () => {
        if (isBrowser()) {
          const prefersDark = window.matchMedia(
            "(prefers-color-scheme: dark)"
          ).matches;
          const systemTheme = prefersDark ? "dark" : "light";
          applyTheme(systemTheme);
          document.documentElement.style.removeProperty("--v3-font-scale");
          document.documentElement.style.removeProperty("--v3-color-primary");
          document.documentElement.style.removeProperty("--v3-ring-color");
        }
        set({
          theme: isBrowser()
            ? window.matchMedia("(prefers-color-scheme: dark)").matches
              ? "dark"
              : "light"
            : "light",
          primaryColor: "blue",
          fontSize: "default",
        });
      },

      initPreferences: () => {
        const {
          theme,
          primaryColor,
          fontSize,
          setTheme,
          setPrimaryColor,
          setFontSize,
        } = get();
        // Check for migration
        const migratedTheme = migrateOldThemeKey();
        if (migratedTheme && migratedTheme !== theme) {
          setTheme(migratedTheme);
        } else {
          setTheme(theme);
        }
        setPrimaryColor(primaryColor);
        setFontSize(fontSize);
      },
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        theme: state.theme,
        primaryColor: state.primaryColor,
        fontSize: state.fontSize,
      }),
      skipHydration: true,
    }
  )
);
```

### ThemeToggle Component Pattern

```tsx
// src/components/v3/molecules/ThemeToggle/ThemeToggle.tsx
"use client";

import { Sun, Moon, Contrast } from "lucide-react";
import { Button } from "@/components/v3/atoms";
import { useUIPrefsStore } from "@/stores/uiPrefs.store";
import type { Theme } from "@/lib/theme";

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

export function ThemeToggle() {
  const { theme, setTheme } = useUIPrefsStore();
  const Icon = THEME_ICONS[theme];

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(THEME_CYCLE[theme])}
      aria-label={`Đổi theme (đang dùng: ${THEME_LABELS[theme]})`}
    >
      <Icon className="h-5 w-5" />
    </Button>
  );
}

ThemeToggle.displayName = "ThemeToggle";
```

### ColorSelector Component Pattern

```tsx
// src/components/v3/molecules/ColorSelector/ColorSelector.tsx
"use client";

import { useUIPrefsStore, type PrimaryColor } from "@/stores/uiPrefs.store";
import { cn } from "~/lib/utils";

const COLOR_OPTIONS: { value: PrimaryColor; label: string; hsl: string }[] = [
  { value: "blue", label: "Màu xanh dương", hsl: "220 95% 45%" },
  { value: "teal", label: "Màu xanh ngọc", hsl: "173 80% 40%" },
  { value: "purple", label: "Màu tím", hsl: "262 83% 58%" },
  { value: "gold", label: "Màu vàng", hsl: "45 100% 51%" },
];

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
            "h-8 w-8 rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
            primaryColor === value && "ring-2 ring-offset-2"
          )}
          style={{ backgroundColor: `hsl(${hsl})` }}
        />
      ))}
    </div>
  );
}

ColorSelector.displayName = "ColorSelector";
```

### FontSizeControl Component Pattern

```tsx
// src/components/v3/molecules/FontSizeControl/FontSizeControl.tsx
"use client";

import { Button } from "@/components/v3/atoms";
import { useUIPrefsStore, type FontSize } from "@/stores/uiPrefs.store";

const SIZE_OPTIONS: { value: FontSize; label: string; ariaLabel: string }[] = [
  { value: "default", label: "A", ariaLabel: "Cỡ chữ mặc định" },
  { value: "large", label: "A+", ariaLabel: "Cỡ chữ lớn" },
  { value: "extra-large", label: "A++", ariaLabel: "Cỡ chữ rất lớn" },
];

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
```

### Font Scale CSS Token

**Add to `src/styles/v3/tokens/typography.css`:**

```css
:root {
  /* ... existing tokens ... */

  /* Font scale multiplier - controlled by UIPrefsStore */
  --v3-font-scale: 1;
}
```

Components can then use: `font-size: calc(var(--v3-font-size-base) * var(--v3-font-scale));`

### Hydration & FOUC Prevention

```tsx
// In src/app/layout.tsx or a Provider component
"use client";
import { useEffect } from "react";
import { useUIPrefsStore } from "@/stores/uiPrefs.store";

export function UIPrefsProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    useUIPrefsStore.persist.rehydrate();
    useUIPrefsStore.getState().initPreferences();
  }, []);

  return <>{children}</>;
}
```

### v3 Component Architecture

```
src/components/v3/
├── atoms/                      # Story 1.3 (DONE)
│   └── ...
├── molecules/                  # Story 1.4
│   ├── ThemeToggle/
│   │   ├── ThemeToggle.tsx
│   │   └── index.ts
│   ├── FontSizeControl/
│   │   ├── FontSizeControl.tsx
│   │   └── index.ts
│   ├── ColorSelector/
│   │   ├── ColorSelector.tsx
│   │   └── index.ts
│   └── index.ts
└── ...
```

### Backward Compatibility

⚠️ **CRITICAL:**

- Existing `src/lib/theme.ts` utilities remain unchanged
- UIPrefsStore wraps/uses these utilities, doesn't replace them
- **Migration:** Old `dhtn-v3-theme` key is migrated to new store on first load

### Verification Checklist

| Test         | Command/Action                                             | Expected                     |
| ------------ | ---------------------------------------------------------- | ---------------------------- |
| Build        | `npm run build`                                            | ✅ No errors                 |
| Dev server   | `npm run dev`                                              | ✅ Runs without errors       |
| Store import | `import { useUIPrefsStore } from '@/stores/uiPrefs.store'` | ✅ Works                     |
| Theme switch | Use ThemeToggle                                            | ✅ Theme cycles correctly    |
| Color switch | Use ColorSelector                                          | ✅ Primary color updates     |
| Font size    | Use FontSizeControl                                        | ✅ `--v3-font-scale` updates |
| Persistence  | Set prefs → Refresh page                                   | ✅ Preferences restored      |
| Migration    | Set old key → Refresh                                      | ✅ Migrated to new store     |
| FOUC         | Hard refresh                                               | ✅ No flash of wrong theme   |

### References

- [epics.md#Epic 1](file:///_bmad_output/planning-artifacts/epics.md) - FR24 requires primary color
- [architecture.md#State Boundary](file:///_bmad_output/planning-artifacts/architecture.md) - Zustand for global UI
- [1-2-theme-system.md](file:///_bmad_output/implementation-artifacts/1-2-theme-system.md) - Theme utilities
- [1-3-atomic-components.md](file:///_bmad_output/implementation-artifacts/1-3-atomic-components.md) - v3 atoms
- [src/lib/theme.ts](file:///src/lib/theme.ts) - Existing theme utilities

### Project Structure Notes

- Store created at `src/stores/uiPrefs.store.ts`
- Molecules created at `src/components/v3/molecules/`
- Typography token updated at `src/styles/v3/tokens/typography.css`

## Dev Agent Record

### Agent Model Used

Gemini 2.5 Pro

### Debug Log References

- Build verification: `npm run build` - exit code 0 (success)

### Completion Notes List

- ✅ Added `--v3-font-scale: 1` token to typography.css for runtime font size control
- ✅ Created `uiPrefs.store.ts` with theme, primaryColor, fontSize state and all actions
- ✅ Implemented localStorage persistence via Zustand persist middleware (key: `dhtn-v3-ui-prefs`)
- ✅ Added migration logic for old `dhtn-v3-theme` localStorage key
- ✅ Created 3 molecule components: ThemeToggle, FontSizeControl, ColorSelector
- ✅ All components have displayName, ARIA labels in Vietnamese, proper accessibility
- ✅ Build passes with no TypeScript errors

### Change Log

| Date       | Change                                                              |
| ---------- | ------------------------------------------------------------------- |
| 2026-01-15 | Created story for Story 1.4 UI Preferences Store                    |
| 2026-01-15 | Added primary color customization per FR24 requirement              |
| 2026-01-15 | Added localStorage migration, font-scale token, displayName         |
| 2026-01-15 | Implemented all 11 tasks, build verified, ready for review          |
| 2026-01-15 | Code review: Fixed 6 issues (1 High, 3 Medium, 2 Low) - marked done |

### Senior Developer Review (AI)

**Review Date:** 2026-01-15
**Review Outcome:** ✅ Approved (after fixes)

**Issues Found & Resolved:**

- [x] **[HIGH] H1:** Added `--v3-color-primary-foreground` to AC#3 implementation
- [x] **[MEDIUM] M1:** Added SSR guard to `setPrimaryColor` action
- [x] **[MEDIUM] M2:** Documented exception for ColorSelector using native button
- [x] **[MEDIUM] M3:** Added type re-exports (FontSize, PrimaryColor, Theme) to molecules index
- [x] **[LOW] L1:** Added SSR guard to `setFontSize` action for consistency
- [x] **[LOW] L2:** Changed ColorSelector ring color to use v3 token variable

### File List

| Action | File Path                                                       |
| ------ | --------------------------------------------------------------- |
| MODIFY | src/styles/v3/tokens/typography.css                             |
| CREATE | src/stores/uiPrefs.store.ts                                     |
| CREATE | src/components/v3/molecules/ThemeToggle/ThemeToggle.tsx         |
| CREATE | src/components/v3/molecules/ThemeToggle/index.ts                |
| CREATE | src/components/v3/molecules/FontSizeControl/FontSizeControl.tsx |
| CREATE | src/components/v3/molecules/FontSizeControl/index.ts            |
| CREATE | src/components/v3/molecules/ColorSelector/ColorSelector.tsx     |
| CREATE | src/components/v3/molecules/ColorSelector/index.ts              |
| CREATE | src/components/v3/molecules/index.ts                            |
