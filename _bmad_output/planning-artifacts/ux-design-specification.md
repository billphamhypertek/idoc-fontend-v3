---
stepsCompleted: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
status: "complete"
inputDocuments:
  - _bmad_output/planning-artifacts/prd.md
  - _bmad_output/planning-artifacts/architecture.md
  - docs/index.md
  - docs/project-overview.md
  - docs/architecture.md
  - docs/data-models.md
  - docs/api-contracts.md
  - docs/component-inventory.md
  - docs/development-guide.md
  - docs/source-tree-analysis.md
  - docs/ref/20250114-MM.md
  - docs/ref/Proposal - DHTN v3.md
workflowType: "ux-design"
documentCounts:
  prd: 1
  architecture: 1
  projectDocs: 10
project_name: "ĐHTN v3"
user_name: "Binh"
date: "2026-01-14"
scope: "Frontend Only - UX/UI Redesign"
---

# UX Design Specification - ĐHTN v3

**Author:** Binh
**Date:** 2026-01-14

---

## Executive Summary

### Project Vision

**ĐHTN v3** là dự án Frontend UI Redesign cho hệ thống Quản lý Văn bản và Điều hành Tác nghiệp của Ban Cơ yếu Chính phủ. Mục tiêu chính:

- **Premium Enterprise Look** - Giao diện hiện đại, chuyên nghiệp
- **≤2 clicks** cho mọi tác vụ quan trọng
- **API unchanged 100%** - Chỉ thay đổi presentation layer

### Target Users (6 System Roles)

| Role                | Vai trò       | Nhu cầu UX                          | Dashboard Components          |
| ------------------- | ------------- | ----------------------------------- | ----------------------------- |
| **Lãnh đạo Ban**    | Ra quyết định | Duyệt nhanh, thấy ngay việc cần làm | ActionRequired, KeyTracking   |
| **Lãnh đạo đơn vị** | Phân công     | 1-click assign, workload matrix     | WorkloadMatrix, AssignedTasks |
| **Lãnh đạo phòng**  | Rà soát       | Báo cáo tuần, theo dõi tiến độ      | WeeklyReport, TeamProgress    |
| **Văn thư**         | Xử lý văn bản | Tiếp nhận, phân phối văn bản        | DocumentProcessing, Tracking  |
| **Trợ lý**          | Hỗ trợ        | To-do list, soạn thảo               | TodayWorkList, DraftingPanel  |
| **Admin**           | Quản trị      | Quản lý hệ thống                    | SystemStats, QuickAccess      |

**Đặc điểm:** 90% users 50+ tuổi, Desktop-first, Internal network

### Key Design Challenges

| Challenge                 | Impact                                  |
| ------------------------- | --------------------------------------- |
| **Accessibility 50+**     | Font 14px+, high contrast, ≤2 clicks    |
| **Role-based Dashboards** | 6 roles khác nhau trên 1 hệ thống       |
| **Split-screen Workflow** | Layout 50/50 cho xem + xử lý đồng thời  |
| **Information Density**   | ≤10 items nhưng đủ thông tin quan trọng |

### Design Opportunities

| Opportunity                 | Giá trị                          |
| --------------------------- | -------------------------------- |
| **Action Required Zone**    | Lãnh đạo thấy ngay việc cần làm  |
| **1-Click Assign**          | Giao việc trực tiếp từ dashboard |
| **Workload Matrix**         | Cân bằng nguồn lực các phòng     |
| **Premium Enterprise Feel** | Nâng tầm trải nghiệm             |

---

## Core User Experience

### Defining Experience

**Core User Actions per Persona:**

| Persona          | Core Action          | Frequency         |
| ---------------- | -------------------- | ----------------- |
| **Trưởng Ban**   | Duyệt & Ký văn bản   | Hàng ngày, urgent |
| **Cục trưởng**   | Phân công & Theo dõi | Hàng ngày         |
| **Trưởng phòng** | Rà soát & Phê duyệt  | Hàng ngày         |
| **Chuyên viên**  | Thực thi & Soạn thảo | All day           |

**Core Loop:** `Nhận việc → Xử lý → Chuyển tiếp` trong **≤2 clicks**

### Platform Strategy

| Aspect        | Decision       | Rationale                |
| ------------- | -------------- | ------------------------ |
| **Primary**   | Desktop Web    | 90% users dùng desktop   |
| **Secondary** | Tablet         | Họp, di chuyển           |
| **Fallback**  | Mobile         | Chỉ urgent approvals     |
| **Input**     | Mouse/Keyboard | Office environment       |
| **Offline**   | Không cần      | Internal network ổn định |

### Effortless Interactions

| Interaction               | Hiện tại                | Mục tiêu v3                 |
| ------------------------- | ----------------------- | --------------------------- |
| **Tìm văn bản cần duyệt** | Mở nhiều menu           | Dashboard hiển thị sẵn      |
| **Duyệt văn bản**         | Mở → Đọc → Menu → Duyệt | Đọc → 1-click Duyệt         |
| **Giao việc**             | Form popup phức tạp     | 1-click từ dòng tin         |
| **Theo dõi tiến độ**      | Vào report riêng        | Progress bar ngay dashboard |

### Critical Success Moments

| Moment              | Mô tả                                        | Success Indicator       |
| ------------------- | -------------------------------------------- | ----------------------- |
| **"Aha!" Moment**   | Lãnh đạo mở app, thấy ngay việc cần làm      | First 5 seconds         |
| **Efficiency Win**  | Duyệt 3 văn bản trong 5 phút (vs 30 phút cũ) | Task completion time    |
| **Control Feeling** | Cục trưởng thấy toàn cảnh workload           | Workload Matrix visible |
| **Trust Building**  | Không "lạc" trong hệ thống                   | ≤2 clicks anywhere      |

### Experience Principles

1. **"Thấy Ngay, Làm Ngay"** - Zero hunting for critical tasks
2. **"2 Clicks Max"** - Mọi tác vụ trong tầm tay
3. **"50+ Friendly"** - Font lớn, contrast cao, UI đơn giản
4. **"Dashboard-Centric"** - Mọi thứ bắt đầu từ dashboard

---

## Desired Emotional Response

### Primary Emotional Goals

| Cảm xúc       | Mô tả                     | Tại sao quan trọng            |
| ------------- | ------------------------- | ----------------------------- |
| **Kiểm soát** | "Tôi nắm được toàn cảnh"  | Lãnh đạo cần cảm giác làm chủ |
| **Tự tin**    | "Tôi biết phải làm gì"    | Không sợ sai, không ngại dùng |
| **Hiệu quả**  | "5 phút thay vì 30 phút"  | Thời gian quý báu             |
| **Tin cậy**   | "Hệ thống hoạt động đúng" | Không lo mất dữ liệu          |

### Emotional Journey Mapping

| Giai đoạn           | Cảm xúc mong muốn         | UX hỗ trợ                         |
| ------------------- | ------------------------- | --------------------------------- |
| **Đăng nhập**       | An tâm, quen thuộc        | USB Token + Remember me           |
| **Mở Dashboard**    | Rõ ràng, kiểm soát        | Action Required zone nổi bật      |
| **Xử lý văn bản**   | Tập trung, hiệu quả       | Split-screen 50/50                |
| **Hoàn thành task** | Hài lòng, tự hào          | Confirmation + Progress update    |
| **Gặp lỗi**         | Bình tĩnh, được hướng dẫn | Error message rõ ràng + next step |

### Micro-Emotions

| Mong muốn ✅   | Tránh ❌    |
| -------------- | ----------- |
| Confidence     | Confusion   |
| Trust          | Anxiety     |
| Accomplishment | Frustration |
| Control        | Overwhelm   |
| Clarity        | Hunting     |

### Design Implications

| Cảm xúc       | Thiết kế hỗ trợ                            |
| ------------- | ------------------------------------------ |
| **Kiểm soát** | Dashboard rõ ràng, ≤10 items, hierarchy rõ |
| **Tự tin**    | Font 14px+, icons có label, tooltips       |
| **Hiệu quả**  | 1-click actions, keyboard shortcuts        |
| **Tin cậy**   | Autosave indicator, confirmation dialogs   |
| **Bình tĩnh** | Muted colors, no aggressive animations     |

### Emotional Design Principles

1. **"Không Làm Users Sợ"** - Avoid overwhelming, aggressive UI
2. **"Luôn Có Lối Thoát"** - Back button, undo, clear navigation
3. **"Khen Thưởng Nhẹ Nhàng"** - Subtle success confirmations
4. **"Hướng Dẫn, Không Phán Xét"** - Friendly error messages

---

## UX Pattern Analysis & Inspiration

### Inspiring Products Analysis

| Product             | Điểm học hỏi                                     | Applicable Pattern            |
| ------------------- | ------------------------------------------------ | ----------------------------- |
| **Microsoft Teams** | Navigation sidebar đơn giản, notification badges | Left sidebar với counts       |
| **Outlook**         | Split-view email reading, quick actions          | 50/50 layout, inline buttons  |
| **SAP Fiori**       | Enterprise dashboard, role-based views           | Tile-based dashboard per role |
| **Zoom**            | 1-click join, minimal UI                         | Large buttons, clear CTAs     |
| **WeChat Work**     | Approval flows, mobile-friendly actions          | Swipe actions, quick approve  |

### Transferable UX Patterns

**Navigation Patterns:**

| Pattern        | Source         | Apply to               |
| -------------- | -------------- | ---------------------- |
| Pinned sidebar | Teams/Outlook  | Main navigation        |
| Badge counts   | Messaging apps | Action Required counts |
| Breadcrumb     | SAP Fiori      | Document drill-down    |

**Interaction Patterns:**

| Pattern              | Source      | Apply to            |
| -------------------- | ----------- | ------------------- |
| Split-view           | Outlook     | Document processing |
| 1-click action       | Zoom        | Approval buttons    |
| Inline quick actions | Gmail       | Row-level actions   |
| Skeleton loading     | Modern apps | Page transitions    |

**Visual Patterns:**

| Pattern             | Source       | Apply to             |
| ------------------- | ------------ | -------------------- |
| Tile dashboard      | SAP Fiori    | Role-based dashboard |
| Status badges       | Jira         | Document status      |
| Progress indicators | Linear/Asana | Task progress        |

### Anti-Patterns to Avoid

| Anti-Pattern             | Tại sao tránh                    |
| ------------------------ | -------------------------------- |
| Dense data tables        | Users 50+ khó đọc, overwhelm     |
| Hidden menus (hamburger) | "Hunting" - vi phạm principle    |
| Tiny buttons             | Touch target quá nhỏ             |
| Aggressive animations    | Gây anxiety cho users lớn tuổi   |
| Complex multi-step forms | Gây confusion, vi phạm ≤2 clicks |

### Design Inspiration Strategy

**Adopt (Áp dụng nguyên bản):**

- Split-view layout từ Outlook
- Badge counts từ messaging apps
- 1-click actions từ Zoom

**Adapt (Điều chỉnh cho context):**

- SAP Fiori tiles → Đơn giản hóa, ≤10 items
- Teams sidebar → Role-specific sections
- Outlook quick actions → Font 14px+, nút lớn hơn

**Avoid (Tránh hoàn toàn):**

- Dense enterprise tables
- Hidden navigation
- Complex onboarding

---

## Design System Foundation

### Design System Choice

**Quyết định:** Themeable System - Hybrid (Radix UI + TailwindCSS + CSS Variables)

| Aspect            | Chi tiết                                |
| ----------------- | --------------------------------------- |
| **UI Primitives** | Radix UI (giữ từ v2)                    |
| **Styling**       | TailwindCSS 3.4 + CSS Custom Properties |
| **Theme System**  | CSS Variables cho runtime theming       |
| **Approach**      | Brownfield Design System Refresh        |

### Rationale for Selection

| Lý do                      | Giải thích                           |
| -------------------------- | ------------------------------------ |
| **Brownfield constraint**  | v2 đã dùng Radix UI + Tailwind       |
| **Accessibility built-in** | Radix UI accessible by default       |
| **Runtime theming**        | CSS Variables cho high-contrast mode |
| **Team familiarity**       | Team đã biết stack này               |
| **API unchanged**          | Không ảnh hưởng existing API layer   |

### Implementation Approach

```
src/styles/
├── tokens/
│   ├── colors.css      # Premium Enterprise palette
│   ├── typography.css  # 14px+ base, accessibility
│   └── spacing.css     # Consistent grid system
├── themes/
│   ├── default.css     # Standard theme
│   └── high-contrast.css # Accessibility theme
└── globals.css         # Import all tokens
```

- Design tokens = CSS Custom Properties
- Tailwind config references CSS variables
- Theme switching via `data-theme` attribute
- Radix components restyled with new tokens

### Customization Strategy

| Component Type        | Strategy                            |
| --------------------- | ----------------------------------- |
| **Existing Radix**    | Restyle với new design tokens       |
| **Common UI**         | Restructure to Atomic Design        |
| **Role-specific**     | New compositions in `compositions/` |
| **Dashboard layouts** | New layout components               |

**Custom Components Needed:**

- `SplitScreenLayout` - 50/50 resizable
- `ActionRequiredSection` - Leader dashboard
- `WorkloadMatrix` - Department head view
- `TodayWorkList` - Staff to-do

---

## Defining Core Experience

### Defining Experience

**"Mở app, thấy ngay việc cần làm, xử lý trong 2 clicks"**

| Persona          | Defining Moment                                |
| ---------------- | ---------------------------------------------- |
| **Trưởng Ban**   | "Duyệt 3 văn bản trong 5 phút" (vs 30 phút cũ) |
| **Cục trưởng**   | "Giao việc 1-click, thấy workload toàn cảnh"   |
| **Trưởng phòng** | "Rà soát → Phê duyệt ngay"                     |
| **Chuyên viên**  | "To-do rõ ràng, làm xong tick off"             |

### User Mental Model

**Hiện tại (v2):**

- Mở sidebar → Tìm menu → Mở danh sách → Filter → Mở văn bản → Duyệt
- Cảm giác: "Tốn thời gian, không biết việc nào quan trọng"

**Kỳ vọng (v3):**

- Mở app → Thấy ngay → 1-click xử lý
- Cảm giác: "Kiểm soát, hiệu quả"

### Success Criteria

| Tiêu chí                       | Target                     |
| ------------------------------ | -------------------------- |
| **Time to First Action**       | < 5 seconds                |
| **Clicks to Complete Task**    | ≤ 2 clicks                 |
| **Items Visible on Dashboard** | ≤ 10 items                 |
| **User Confidence**            | "Tôi biết việc gì cần làm" |

### Experience Mechanics

**1. Initiation (Mở app):**

- Auto-redirect to role-specific dashboard
- Action Required zone nổi bật nhất

**2. Interaction (Xử lý):**

- Click item → Split-view opens
- Left: Document/Reference | Right: Action panel
- Primary action button always visible

**3. Feedback (Confirmation):**

- Success toast với summary
- Dashboard auto-updates
- Progress bar updates

**4. Completion (Kết thúc):**

- Return to dashboard
- Next item auto-highlighted
- Badge count giảm

---

## Visual Design Foundation

### Color System

**Primary Palette (Premium Enterprise):**

| Token                   | Color              | Usage                  |
| ----------------------- | ------------------ | ---------------------- |
| `--color-primary`       | `hsl(220 95% 45%)` | Primary actions, links |
| `--color-primary-hover` | `hsl(220 95% 40%)` | Hover states           |
| `--color-secondary`     | `hsl(215 25% 27%)` | Headers, sidebar       |
| `--color-accent`        | `hsl(45 100% 51%)` | Highlights, badges     |

**Semantic Colors:**

| Token             | Color              | Usage               |
| ----------------- | ------------------ | ------------------- |
| `--color-success` | `hsl(142 72% 29%)` | Completed, approved |
| `--color-warning` | `hsl(38 92% 50%)`  | Pending, attention  |
| `--color-error`   | `hsl(0 84% 60%)`   | Errors, rejected    |
| `--color-info`    | `hsl(199 89% 48%)` | Informational       |

**High Contrast Theme:** `data-theme="high-contrast"`

### Typography System

| Level     | Size | Weight | Usage                       |
| --------- | ---- | ------ | --------------------------- |
| **H1**    | 28px | 600    | Page titles                 |
| **H2**    | 22px | 600    | Section headers             |
| **H3**    | 18px | 500    | Card titles                 |
| **Body**  | 14px | 400    | Default text (50+ friendly) |
| **Small** | 12px | 400    | Captions only               |

**Font Stack:** `Inter, -apple-system, BlinkMacSystemFont, sans-serif`

### Spacing & Layout Foundation

**Base Unit:** 4px

| Token       | Value | Usage           |
| ----------- | ----- | --------------- |
| `--space-1` | 4px   | Tight spacing   |
| `--space-2` | 8px   | Element spacing |
| `--space-3` | 12px  | Small gaps      |
| `--space-4` | 16px  | Default gap     |
| `--space-6` | 24px  | Section spacing |
| `--space-8` | 32px  | Large spacing   |

**Layout Grid:**

- Sidebar: 280px fixed
- Content: Fluid, max 1440px
- Split-view: 50%/50% resizable

### Accessibility Considerations

| Requirement        | Implementation          |
| ------------------ | ----------------------- |
| **Font minimum**   | 14px base               |
| **Contrast ratio** | 4.5:1 minimum (WCAG AA) |
| **Focus visible**  | `ring-2 ring-primary`   |
| **High contrast**  | Theme toggle            |
| **Touch targets**  | Minimum 44x44px         |

---

## Design Direction Decision

### Design Directions Explored

| Direction              | Mô tả                            | Status               |
| ---------------------- | -------------------------------- | -------------------- |
| **Premium Enterprise** | Clean, professional, muted tones | ✅ Đã chọn           |
| **Government Classic** | Traditional, formal, dark blues  | ❌ Không phù hợp     |
| **Modern Minimal**     | Stark, ultra-minimal             | ❌ Quá xa lạ cho 50+ |

### Chosen Direction: Premium Enterprise

| Element               | Implementation                            |
| --------------------- | ----------------------------------------- |
| **Overall Feel**      | Premium, professional, trustworthy        |
| **Color Mood**        | Deep blues + neutral grays + gold accents |
| **Layout Approach**   | Card-based dashboard, generous whitespace |
| **Density**           | Medium - balanced for readability         |
| **Typography**        | Clear hierarchy, 14px minimum             |
| **Interaction Style** | Subtle hover states, smooth transitions   |

### Design Rationale

| Reason                 | Explanation                             |
| ---------------------- | --------------------------------------- |
| **50+ Friendly**       | Large fonts, clear contrast, no hunting |
| **Government Context** | Professional but modern                 |
| **Premium Feel**       | Nâng tầm trải nghiệm                    |
| **Existing Stack**     | Align với Radix UI + Tailwind           |

### Implementation Approach

**Phase 1 - Foundation:** Design tokens, base theme
**Phase 2 - Components:** Atomic components, layouts
**Phase 3 - Compositions:** Role-based sections

---

## User Journey Flows

### Journey 1: Trưởng Ban - Duyệt văn bản nhanh

```mermaid
flowchart TD
    A[Đăng nhập] --> B[Dashboard Leader]
    B --> C{Action Required Zone}
    C --> D[3 văn bản cần ký]
    D --> E[Click văn bản đầu]
    E --> F[Split-view 50/50]
    F --> G[Đọc Tờ trình | Xem Dự thảo]
    G --> H{Quyết định}
    H -->|Đồng ý| I[Click "Ký duyệt & Phát hành"]
    H -->|Cần sửa| J[Click "Yêu cầu chỉnh sửa"]
    I --> K[Success Toast + Badge update]
    J --> K
    K --> L[Auto-highlight next item]
```

**Time target:** 5 phút cho 3 văn bản

### Journey 2: Cục trưởng - Phân công việc

```mermaid
flowchart TD
    A[Dashboard Cục trưởng] --> B[Văn bản từ Ban]
    B --> C[Click "Giao việc" 1-click]
    C --> D[Xem Workload Matrix]
    D --> E{Chọn phòng}
    E --> F[Phòng B - ít việc hơn]
    F --> G[Confirm assignment]
    G --> H[Progress bar updated]
```

### Journey 3: Trưởng phòng - Báo cáo tuần

```mermaid
flowchart TD
    A[Dashboard Trưởng phòng] --> B[Widget "Báo cáo tuần"]
    B --> C[Hệ thống đã tạo draft]
    C --> D[Click "Rà soát"]
    D --> E[Review auto-generated content]
    E --> F{Action}
    F -->|OK| G[Click "Nộp báo cáo"]
    F -->|Sửa| H[Edit inline]
    H --> G
```

### Journey 4: Chuyên viên - Soạn văn bản đi

```mermaid
flowchart TD
    A[Dashboard Chuyên viên] --> B[To-Do: Việc hôm nay]
    B --> C[Click task đầu]
    C --> D[Split-view: VB đến | Soạn thảo]
    D --> E[Rich Text Editor]
    E --> F[Soạn nội dung]
    F --> G[Click "Trình duyệt"]
    G --> H[Gửi lên Trưởng phòng]
    H --> I[Task marked complete]
```

### Journey Patterns

| Pattern                  | Mô tả                            | Apply to        |
| ------------------------ | -------------------------------- | --------------- |
| **Dashboard Entry**      | Mọi journey bắt đầu từ dashboard | All             |
| **Split-view Action**    | 50/50 layout khi xử lý           | Processing      |
| **1-Click Quick Action** | Inline buttons trên items        | Assign, Approve |
| **Success + Auto-next**  | Toast + highlight next           | All completion  |

---

## Component Strategy

### Design System Components (Radix UI)

| Category       | Components                     | Customization      |
| -------------- | ------------------------------ | ------------------ |
| **Layout**     | Dialog, Popover, Scroll        | Restyle tokens     |
| **Navigation** | Tabs, Navigation Menu          | Role-based styling |
| **Form**       | Checkbox, Radio, Select, Input | Accessibility      |
| **Feedback**   | Toast, Alert Dialog, Progress  | Enterprise styling |

### Custom Components Needed

**Layout Components:**

| Component           | Purpose              | Priority |
| ------------------- | -------------------- | -------- |
| `SplitScreenLayout` | 50/50 resizable      | P0       |
| `DashboardLayout`   | Role-based container | P0       |
| `FocusModeLayout`   | Collapsed panel view | P1       |

**Dashboard Compositions:**

| Component               | Purpose             | User       |
| ----------------------- | ------------------- | ---------- |
| `ActionRequiredSection` | Việc cần làm ngay   | Leader     |
| `KeyTrackingWidget`     | Items đang theo dõi | Leader     |
| `WorkloadMatrix`        | Cân bằng workload   | Cục trưởng |
| `TodayWorkList`         | To-do list          | Staff      |

### Implementation Strategy

**Approach:**

- Radix primitives làm foundation
- Tailwind classes + design tokens
- Atomic Design: atoms → molecules → organisms

**Structure:**

```
src/components/
├── atoms/          # Button, Badge, Text
├── molecules/      # Card, FormField
├── organisms/      # DataTable, DocumentPanel
├── layouts/        # SplitScreen, Dashboard
└── compositions/   # Role-specific sections
```

### Implementation Roadmap

| Phase  | Components                       | Duration |
| ------ | -------------------------------- | -------- |
| **P1** | Design tokens, Theme, Base atoms | Week 1-2 |
| **P2** | SplitScreen, Dashboard layouts   | Week 3   |
| **P3** | Leader widgets, Staff to-do      | Week 4   |
| **P4** | Animations, testing              | Week 5   |

---

## Document Summary

| Section                    | Content                                             |
| -------------------------- | --------------------------------------------------- |
| Executive Summary          | Project Vision, Target Users (50+), Challenges      |
| Core User Experience       | Defining Experience, Mental Model, Success Criteria |
| Desired Emotional Response | Primary Goals, Journey Mapping, Design Implications |
| UX Pattern Analysis        | Inspiring Products, Transferable Patterns           |
| Design System Foundation   | Hybrid: Radix UI + TailwindCSS + CSS Variables      |
| Design Direction           | Premium Enterprise Look                             |
| Visual Foundation          | Colors, Typography 14px+, Spacing                   |
| User Journey Flows         | 4 personas with Mermaid diagrams                    |
| Component Strategy         | Custom components, Implementation roadmap           |

**Document Status:** ✅ **COMPLETE**

**Next Workflow:** `/bmad-bmm-workflows-create-epics-and-stories`
