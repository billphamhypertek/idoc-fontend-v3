# Story 1.2: Theme System & High Contrast Mode

Status: done

<!-- Note: Validation is optional. Run validate-create-story for quality check before dev-story. -->

## Epic Context

**Epic 1: Design System Foundation**

- Mục tiêu: Thiết lập nền tảng design tokens và theme system cho toàn bộ v3 components
- FRs covered: FR20 (Font size customization), FR24 (Theme customization)
- NFRs addressed: NFR9 (WCAG 2.1 AA), NFR10 (14px minimum), NFR14 (Design System based)

**Dependency:** Story 1.1 (Design Tokens Foundation) - ✅ **DONE**

## Story

As a **User (đặc biệt users 50+ tuổi)**,
I want **to switch between light, dark, and high-contrast themes**,
so that **I can customize the interface for my visual comfort and accessibility needs**.

## Acceptance Criteria

1. **GIVEN** the design tokens from Story 1.1 exist, **WHEN** story is complete, **THEN** `src/styles/v3/themes/` folder contains:
   - `default.css` - Light theme (default)
   - `dark.css` - Dark mode theme
   - `high-contrast.css` - High contrast accessibility theme
   - `index.css` - Barrel file importing all theme files

2. **GIVEN** the theme system, **WHEN** a theme is selected, **THEN** the `html` element has `data-theme` attribute set to the selected theme value:
   - `data-theme="light"` (default)
   - `data-theme="dark"`
   - `data-theme="high-contrast"`

3. **GIVEN** the dark theme, **WHEN** applied, **THEN** it includes:
   - Dark backgrounds: `--v3-color-background: 240 10% 10%`
   - Light text: `--v3-color-foreground: 0 0% 98%`
   - Adjusted primary/semantic colors for dark mode visibility
   - Card and popover backgrounds match dark theme
   - WCAG 2.1 AA contrast compliance on dark backgrounds

4. **GIVEN** the high-contrast theme, **WHEN** applied, **THEN** it includes:
   - Maximum contrast: pure white/black base
   - Bolder focus rings: increased width and brightness
   - Enhanced border visibility
   - Enlarged text emphasis where appropriate
   - WCAG 2.1 AAA contrast compliance (7:1 minimum)

5. **GIVEN** a user selects a theme, **WHEN** they close and reopen the app, **THEN** their theme preference persists via `localStorage` key `dhtn-v3-theme`

6. **GIVEN** themes are created, **WHEN** integrated, **THEN**:
   - Themes work alongside existing v2 styles without breaking
   - Theme CSS is imported AFTER design tokens in globals.css
   - `npm run build` succeeds without errors

## Tasks / Subtasks

- [x] **Task 1: Create v3 themes folder structure** (AC: #1)
  - [x] Create `src/styles/v3/themes/` directory
  - [x] Create empty theme files: default.css, dark.css, high-contrast.css, index.css

- [x] **Task 2: Implement Default (Light) theme** (AC: #2)
  - [x] Create `default.css` with `:root, [data-theme="light"]` selectors
  - [x] Re-export all design token values as baseline (or just apply as default)
  - [x] Document as default theme
  - [x] Ensure no token overrides (tokens from colors.css are already light-mode values)

- [x] **Task 3: Implement Dark theme** (AC: #3)
  - [x] Create `dark.css` with `[data-theme="dark"]` selector
  - [x] Override surface colors: background, card, popover → dark variants
  - [x] Override foreground colors: text → light variants
  - [x] Adjust primary color lightness for dark mode visibility
  - [x] Adjust semantic colors (success, warning, error, info) for dark backgrounds
  - [x] Override border and input colors for dark mode
  - [x] Override chart colors: `--v3-color-chart-1` through `--v3-color-chart-5` for dark backgrounds
  - [x] Verify WCAG 2.1 AA compliance (4.5:1 minimum)

- [x] **Task 4: Implement High Contrast theme** (AC: #4)
  - [x] Create `high-contrast.css` with `[data-theme="high-contrast"]` selector
  - [x] Set maximum contrast: pure black (#000) text, pure white (#fff) background
  - [x] Increase focus ring width: `--v3-ring-width: 3px`
  - [x] Increase border visibility: stronger border colors
  - [x] Adjust primary color for maximum visibility
  - [x] Verify WCAG 2.1 AAA compliance (7:1 minimum)

- [x] **Task 5: Create theme index.css barrel file** (AC: #1)
  - [x] Import all theme files in correct order
  - [x] Add header documentation with usage notes

- [x] **Task 6: Integrate themes with globals.css** (AC: #6)
  - [x] Import theme index.css AFTER tokens import in globals.css
  - [x] Verify no conflicts with existing v2 variables
  - [x] Test build succeeds: `npm run build`

- [x] **Task 7: Create ThemeProvider utility (optional helper)** (AC: #2, #5)
  - [x] Create utility function to apply theme: `setTheme(theme: 'light' | 'dark' | 'high-contrast')`
  - [x] Create utility function to get current theme: `getTheme()`
  - [x] Implement localStorage persistence with key `dhtn-v3-theme`
  - [x] Add system preference detection: `prefers-color-scheme` media query
  - [x] Document usage in Dev Notes

## Dev Notes

### 🚨 CRITICAL: v2 Theme System Coexistence

**Existing v2 theme patterns in `globals.css`:**

- `.dark` class selector (lines 104-129) - NOT `data-theme` attribute
- `@media (prefers-color-scheme: dark)` media query (lines 61-67)

**Coexistence Strategy:**

- v3 themes use `[data-theme="..."]` attribute selector on `<html>`
- v2 components continue using `.dark` class (not affected)
- v3 `initTheme()` sets `data-theme` attribute ONLY - doesn't touch `.dark` class
- System `prefers-color-scheme` media query affects only v2 tokens (non-prefixed)
- v3 tokens (`--v3-*`) are NOT affected by existing media queries

**Theme switching mechanism:**

```css
/* v3 Theme: data-theme attribute on html element */
[data-theme="dark"] {
  --v3-color-background: 240 10% 10%;
  --v3-color-foreground: 0 0% 98%;
  /* ... override only --v3-* tokens */
}

/* v2 Theme (existing - DO NOT MODIFY): class selector */
.dark {
  --background: 240 10% 3.9%;
  /* ... non-prefixed tokens */
}
```

**Architecture Decision:** CSS Variables + `data-theme` attribute (from architecture.md#Design System Architecture)

### Previous Story Intelligence (1-1-design-tokens)

**From Story 1.1 learnings:**

- All tokens use `--v3-` prefix for v3 isolation
- HSL color format: `220 95% 45%` (not `hsl(...)`)
- Font family: Roboto as primary (existing codebase consistency)
- Build verified: `npm run build` passes

**Token Reference (from colors.css):**

```css
/* Primary */
--v3-color-primary: 220 95% 45%;
--v3-color-primary-foreground: 0 0% 100%;

/* Surfaces */
--v3-color-background: 0 0% 100%;
--v3-color-foreground: 240 10% 3.9%;
--v3-color-card: 0 0% 100%;
--v3-color-muted: 240 4.8% 95.9%;

/* Borders */
--v3-color-border: 240 5.9% 90%;
--v3-color-ring: 220 95% 45%;
```

### File Structure

```
src/styles/v3/
├── tokens/                   # From Story 1.1 (DONE)
│   ├── colors.css
│   ├── typography.css
│   ├── spacing.css
│   ├── effects.css
│   └── index.css
└── themes/                   # NEW in Story 1.2
    ├── default.css           # Light theme (baseline)
    ├── dark.css              # Dark mode
    ├── high-contrast.css     # Accessibility theme
    └── index.css             # Barrel import
```

### Theme Color Guidelines

**Dark Theme Color Mapping:**

| Token                         | Light Value      | Dark Value    |
| ----------------------------- | ---------------- | ------------- |
| `--v3-color-background`       | `0 0% 100%`      | `240 10% 10%` |
| `--v3-color-foreground`       | `240 10% 3.9%`   | `0 0% 98%`    |
| `--v3-color-card`             | `0 0% 100%`      | `240 10% 15%` |
| `--v3-color-muted`            | `240 4.8% 95.9%` | `240 4% 20%`  |
| `--v3-color-muted-foreground` | `240 3.8% 46.1%` | `240 5% 65%`  |
| `--v3-color-border`           | `240 5.9% 90%`   | `240 4% 25%`  |
| `--v3-color-primary`          | `220 95% 45%`    | `220 95% 55%` |
| `--v3-color-chart-1`          | `220 70% 50%`    | `220 70% 60%` |
| `--v3-color-chart-2`          | `160 60% 45%`    | `160 60% 55%` |
| `--v3-color-chart-3`          | `30 80% 55%`     | `30 80% 65%`  |
| `--v3-color-chart-4`          | `280 65% 60%`    | `280 65% 70%` |
| `--v3-color-chart-5`          | `340 75% 55%`    | `340 75% 65%` |

**High Contrast Theme Adjustments:**

| Token                   | Standard       | High Contrast |
| ----------------------- | -------------- | ------------- |
| `--v3-color-background` | `0 0% 100%`    | `0 0% 100%`   |
| `--v3-color-foreground` | `240 10% 3.9%` | `0 0% 0%`     |
| `--v3-color-border`     | `240 5.9% 90%` | `0 0% 0%`     |
| `--v3-ring-width`       | `2px`          | `3px`         |
| `--v3-ring-color`       | `220 95% 45%`  | `0 0% 0%`     |

### ThemeProvider Utility Pattern

**Location:** `src/lib/theme.ts` (suggested)

```typescript
// Theme utility for ĐHTN v3
const THEME_STORAGE_KEY = "dhtn-v3-theme";
type Theme = "light" | "dark" | "high-contrast";

export function setTheme(theme: Theme): void {
  document.documentElement.setAttribute("data-theme", theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

export function getTheme(): Theme {
  return (localStorage.getItem(THEME_STORAGE_KEY) as Theme) || "light";
}

export function initTheme(): void {
  const saved = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
  if (saved) {
    setTheme(saved);
    return;
  }
  // Fallback to system preference
  if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
    setTheme("dark");
  } else {
    setTheme("light");
  }
}
```

### Backward Compatibility

⚠️ **CRITICAL:** Do NOT modify existing v2 token values or theme files.

1. Create v3 theme files with `[data-theme]` selectors only
2. Import themes AFTER tokens in globals.css
3. v2 components continue working without data-theme attribute
4. v3 components will respect data-theme when attribute is set

### Integration Order in globals.css

```css
/* 1. Tailwind directives */
@tailwind base;
@tailwind components;
@tailwind utilities;

/* 2. Existing v2 styles (KEEP UNCHANGED) */
/* ... */

/* 3. v3 Design Tokens (from Story 1.1) */
@import "./v3/tokens/index.css";

/* 4. v3 Themes (NEW - Story 1.2) */
@import "./v3/themes/index.css";
```

### Verification Checklist

| Test                     | Command/Action                        | Expected                            |
| ------------------------ | ------------------------------------- | ----------------------------------- |
| Build                    | `npm run build`                       | ✅ No errors                        |
| Dev server               | `npm run dev`                         | ✅ Runs without errors              |
| Light theme              | No data-theme or `data-theme="light"` | ✅ Default appearance               |
| Dark theme               | `data-theme="dark"` on html           | ✅ Dark backgrounds, light text     |
| High contrast            | `data-theme="high-contrast"`          | ✅ Maximum contrast, bold borders   |
| Theme persistence        | Set theme → Refresh page              | ✅ Theme persists from localStorage |
| WCAG AA (dark)           | Contrast checker                      | ✅ 4.5:1 minimum                    |
| WCAG AAA (high-contrast) | Contrast checker                      | ✅ 7:1 minimum                      |
| v2 regression            | Load any existing page                | ✅ No changes to v2 UI              |

### References

- [architecture.md#Design System Architecture](file:///_bmad_output/planning-artifacts/architecture.md)
- [ux-design-specification.md#Visual Design Foundation](file:///_bmad_output/planning-artifacts/ux-design-specification.md)
- [prd.md#FR24 Theme Customization](file:///_bmad_output/planning-artifacts/prd.md)
- [1-1-design-tokens.md](file:///_bmad_output/implementation-artifacts/1-1-design-tokens.md) - Previous story
- [src/styles/v3/tokens/colors.css](file:///src/styles/v3/tokens/colors.css) - Token values

### Project Structure Notes

- Alignment with Atomic Design: Themes modify token values, not component styles
- v3 isolation via `--v3-` prefix maintained
- Theme utility in `src/lib/` following existing utils pattern

### Migration Notes

**Existing `ThemedStatCard.tsx`** uses inline `theme` prop with direct color values:

```typescript
style={{ background: theme.bg, color: theme.titleColor }}
```

→ Future v3 components should use CSS Variables `hsl(var(--v3-color-*))` instead of inline styles.

**Tailwind Dark Mode:** Project uses Tailwind, but v3 themes operate independently.

- Do NOT configure `darkMode: 'selector'` in tailwind.config for v3
- v3 uses `[data-theme]` CSS attribute selectors directly
- Tailwind's dark mode utilities (`.dark:*`) are for v2 only

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4 (Antigravity)

### Debug Log References

- Build log: `npm run build` - SUCCESS (Exit code 0)

### Completion Notes List

- ✅ Created v3 themes folder at `src/styles/v3/themes/`
- ✅ Implemented 3 themes: light (default), dark, high-contrast
- ✅ Dark theme uses `[data-theme="dark"]` with adjusted colors for WCAG AA
- ✅ High contrast theme uses `[data-theme="high-contrast"]` with WCAG AAA (7:1 ratio)
- ✅ Created index.css barrel with usage documentation
- ✅ Integrated themes into globals.css AFTER tokens import
- ✅ Created ThemeProvider utility at `src/lib/theme.ts` with:
  - `setTheme()`, `getTheme()`, `initTheme()`, `toggleTheme()`
  - localStorage persistence via `dhtn-v3-theme` key
  - System preference detection via `prefers-color-scheme`
  - `watchSystemTheme()` for dynamic preference changes
- ✅ Build passes successfully - no CSS compilation errors
- ⚠️ IDE lint warnings for `@tailwind` directives are expected (TailwindCSS syntax)

**Code Review Fixes Applied (2026-01-15):**

- ✅ H1: Fixed CSS indentation inconsistency in dark.css and high-contrast.css
- ✅ M1: Added SSR guard (`isBrowser()`) to all DOM-accessing functions in theme.ts
- ✅ M2: Simplified default.css to remove duplicate token values (inherits from :root)
- ⚠️ H2: Unit tests deferred - project has no test framework (jest/vitest) configured

### Change Log

- 2026-01-15: Implemented v3 theme system with dark mode and high-contrast accessibility theme
- 2026-01-15: Applied code review fixes (CSS indentation, SSR guard, simplified default.css)

### File List

| File                                     | Action | Notes                                                       |
| ---------------------------------------- | ------ | ----------------------------------------------------------- |
| `src/styles/v3/themes/default.css`       | NEW    | Light theme selector (simplified, inherits tokens)          |
| `src/styles/v3/themes/dark.css`          | NEW    | Dark mode with WCAG AA contrast compliance                  |
| `src/styles/v3/themes/high-contrast.css` | NEW    | Accessibility theme with WCAG AAA (7:1 ratio)               |
| `src/styles/v3/themes/index.css`         | NEW    | Barrel import with usage documentation                      |
| `src/lib/theme.ts`                       | NEW    | Theme utility with SSR guard, persistence, system detection |
| `src/app/globals.css`                    | MODIFY | Added v3 themes import after tokens                         |
