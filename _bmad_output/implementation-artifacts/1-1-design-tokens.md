# Story 1.1: Design Tokens Foundation

Status: review

## Story

As a **Developer**,
I want **a comprehensive design tokens system with CSS Custom Properties**,
so that **all v3 components have consistent colors, typography, spacing, and effects that support runtime theming and accessibility**.

## Epic Context

**Epic 1: Design System Foundation**

- Mục tiêu: Thiết lập nền tảng design tokens và theme system cho toàn bộ v3 components
- FRs covered: FR20 (Font size customization), FR24 (Theme customization)
- NFRs addressed: NFR9 (WCAG 2.1 AA), NFR10 (14px minimum), NFR14 (Design System based)

## Acceptance Criteria

1. **GIVEN** no v3 tokens exist, **WHEN** story is complete, **THEN** `src/styles/v3/tokens/` folder contains:
   - `colors.css` - Premium Enterprise color palette with semantic tokens
   - `typography.css` - Font size scale with 14px base minimum
   - `spacing.css` - Consistent spacing scale (4px base unit)
   - `effects.css` - Shadows, focus rings, transitions, z-index
   - `index.css` - Barrel file importing all token files

2. **GIVEN** the color tokens, **WHEN** inspected, **THEN** they include:
   - Primary: Deep blue (`hsl(220 95% 45%)`) with hover/active states
   - Secondary: Neutral gray (`hsl(215 25% 27%)`)
   - Accent: Gold (`hsl(45 100% 51%)`)
   - Semantic: success, warning, error, info colors
   - Focus ring colors for keyboard accessibility
   - WCAG 2.1 AA compliant contrast ratios (4.5:1 minimum)

3. **GIVEN** typography tokens, **WHEN** inspected, **THEN** they include:
   - Base font size: 14px (Critical for 50+ users)
   - Font scale: xs(12px), sm(13px), base(14px), lg(16px), xl(18px), 2xl(22px), 3xl(28px)
   - Font family: **Roboto** (existing) as primary, with Inter as alternative
   - Line heights: tight(1.25), normal(1.5), relaxed(1.75)

4. **GIVEN** spacing tokens, **WHEN** inspected, **THEN** they include:
   - Base unit: 4px
   - Scale: 1(4px), 2(8px), 3(12px), 4(16px), 5(20px), 6(24px), 8(32px), 10(40px), 12(48px)
   - Layout tokens: sidebar-width(280px), content-max(1440px)
   - Border radius: sm, md, lg variants

5. **GIVEN** effects tokens, **WHEN** inspected, **THEN** they include:
   - Box shadows: sm, md, lg for elevation
   - Focus ring: width, offset, color for accessibility
   - Transitions: fast(150ms), normal(200ms), slow(300ms)
   - Z-index: base, dropdown, modal, toast layers

6. **GIVEN** tokens are created, **WHEN** imported in globals.css, **THEN** they work alongside existing `:root` variables without breaking v2 components

## Tasks / Subtasks

- [x] **Task 1: Create v3 tokens folder structure** (AC: #1)
  - [x] Create `src/styles/v3/tokens/` directory
  - [x] Create empty token files: colors.css, typography.css, spacing.css, effects.css, index.css

- [x] **Task 2: Implement color tokens** (AC: #2)
  - [x] Define v3 primary color palette (deep blue)
  - [x] Add primary variants: default, hover, active, muted, foreground
  - [x] Add secondary and accent colors with foreground
  - [x] Add semantic colors: success, warning, error, info
  - [x] Add surface colors: background, card, popover
  - [x] Add border and input colors
  - [x] Add focus ring color token
  - [x] Document WCAG contrast compliance

- [x] **Task 3: Implement typography tokens** (AC: #3)
  - [x] Define font-family: Roboto as primary (matching existing), Inter as fallback
  - [x] Define font-size scale with 14px base
  - [x] Define line-height tokens
  - [x] Define font-weight tokens (400, 500, 600, 700)
  - [x] Add letter-spacing tokens

- [x] **Task 4: Implement spacing tokens** (AC: #4)
  - [x] Define spacing scale based on 4px unit
  - [x] Define layout tokens (sidebar-width, content-max, header-height)
  - [x] Define border-radius tokens (sm, md, lg, full)
  - [x] Define border-width tokens

- [x] **Task 5: Implement effects tokens** (AC: #5)
  - [x] Define box-shadow tokens (sm, md, lg)
  - [x] Define focus ring tokens (width, offset, color)
  - [x] Define transition tokens (duration, timing)
  - [x] Define z-index scale (base, dropdown, sticky, modal, toast)

- [x] **Task 6: Create index.css barrel file** (AC: #1)
  - [x] Import all token files in dependency order
  - [x] Add header documentation

- [x] **Task 7: Integration with globals.css** (AC: #6)
  - [x] Import v3 tokens in globals.css after existing tokens
  - [x] Verify no conflicts with v2 variables
  - [x] Test build succeeds

## Dev Notes

### ⚠️ CRITICAL: Font Family Decision

**Existing codebase uses Roboto:**

```css
/* From globals.css line 135, 143 */
font-family: Roboto, Arial, Helvetica, sans-serif;
```

**Decision:** Keep Roboto as primary for v3 to maintain consistency. Add Inter as secondary option for future migration.

```css
--v3-font-sans:
  "Roboto", "Inter", -apple-system, BlinkMacSystemFont, sans-serif;
```

### Architecture Patterns

- **Hybrid Design System:** CSS Variables + TailwindCSS aliases
- **Theme switching:** via `data-theme` attribute (prep for Story 1.2)
- **Prefix strategy:** All v3 tokens use `--v3-` prefix

### File Structure

```
src/styles/v3/tokens/
├── colors.css      # Color palette + semantic colors
├── typography.css  # Fonts, sizes, line-heights
├── spacing.css     # Spacing scale + layout + radius
├── effects.css     # Shadows, focus, transitions, z-index
└── index.css       # Barrel import
```

### Token Reference

```css
/* === COLORS === */
--v3-color-primary: 220 95% 45%;
--v3-color-primary-hover: 220 95% 40%;
--v3-color-primary-foreground: 0 0% 100%;
--v3-color-secondary: 215 25% 27%;
--v3-color-accent: 45 100% 51%;
--v3-color-success: 142 72% 29%;
--v3-color-warning: 38 92% 50%;
--v3-color-error: 0 84% 60%;
--v3-color-info: 199 89% 48%;

/* === TYPOGRAPHY === */
--v3-font-sans: "Roboto", "Inter", -apple-system, sans-serif;
--v3-font-size-base: 0.875rem; /* 14px CRITICAL */
--v3-line-height-normal: 1.5;

/* === SPACING === */
--v3-space-1: 0.25rem; /* 4px */
--v3-space-4: 1rem; /* 16px */
--v3-radius-md: 0.375rem;

/* === EFFECTS === */
--v3-shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
--v3-ring-width: 2px;
--v3-ring-offset: 2px;
--v3-ring-color: 220 95% 45%;
--v3-transition-normal: 200ms;
--v3-z-modal: 50;
```

### Backward Compatibility

⚠️ **CRITICAL:** Do NOT modify existing v2 token values in globals.css.

1. Create v3 tokens with `--v3-` prefix
2. Import v3 tokens AFTER existing tokens
3. v3 components use `--v3-*` tokens
4. v2 components continue using original tokens unchanged

### Verification Checklist

| Test              | Command/Action         | Expected                       |
| ----------------- | ---------------------- | ------------------------------ |
| Build             | `npm run build`        | ✅ No errors                   |
| Dev server        | `npm run dev`          | ✅ Runs without errors         |
| Visual regression | Load any existing page | ✅ No changes to v2 UI         |
| Token visibility  | DevTools → `:root`     | ✅ All `--v3-*` tokens present |
| Focus ring        | Tab through buttons    | ✅ Visible focus indicator     |

### References

- [architecture.md#Design System Architecture]
- [ux-design-specification.md#Visual Design Foundation]
- [prd.md#NFR9-NFR11 Accessibility]
- [globals.css] - Existing tokens
- [tailwind.config.ts] - Tailwind integration

## Dev Agent Record

### Agent Model Used

Claude Sonnet 4 (Antigravity)

### Debug Log References

- Build log: `npm run build` - SUCCESS (Exit code 0)
- Pre-existing TypeScript/ESLint warnings in v2 code (not related to this story)

### Completion Notes List

- ✅ Created v3 design tokens folder structure at `src/styles/v3/tokens/`
- ✅ Implemented 4 token files: colors, typography, spacing, effects
- ✅ Color palette includes Premium Enterprise theme with WCAG 2.1 AA compliance
- ✅ Typography uses Roboto font family (existing codebase) with 14px base
- ✅ Spacing based on 4px unit with comprehensive layout tokens
- ✅ Effects include focus rings for keyboard accessibility, shadows, z-index
- ✅ Integrated v3 tokens into globals.css with `--v3-` prefix for backward compatibility
- ✅ Build passes successfully - no CSS compilation errors
- ⚠️ IDE lint warnings for `@tailwind` directives are expected (TailwindCSS syntax)

### Change Log

- 2026-01-15: Initial implementation - created v3 design tokens foundation

### File List

| File                                  | Action | Notes                                                 |
| ------------------------------------- | ------ | ----------------------------------------------------- |
| `src/styles/v3/tokens/colors.css`     | NEW    | Premium Enterprise color palette with semantic colors |
| `src/styles/v3/tokens/typography.css` | NEW    | Font system with 14px base for 50+ accessibility      |
| `src/styles/v3/tokens/spacing.css`    | NEW    | 4px-based spacing scale + layout tokens               |
| `src/styles/v3/tokens/effects.css`    | NEW    | Shadows, focus rings, transitions, z-index            |
| `src/styles/v3/tokens/index.css`      | NEW    | Barrel import for all token files                     |
| `src/app/globals.css`                 | MODIFY | Added v3 tokens import after Tailwind directives      |
