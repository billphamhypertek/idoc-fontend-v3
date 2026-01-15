---
stepsCompleted:
  [
    "step-01-init",
    "step-02-discovery",
    "step-03-success",
    "step-04-journeys",
    "step-05-domain",
    "step-06-innovation",
    "step-07-project-type",
    "step-08-scoping",
    "step-09-functional",
    "step-10-nfr",
    "step-11-final",
  ]
status: "complete"
inputDocuments:
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
workflowType: "prd"
documentCounts:
  briefs: 0
  research: 0
  brainstorming: 0
  projectDocs: 10
classification:
  projectType: "web_app"
  domain: "govtech"
  complexity: "high"
  projectContext: "brownfield"
  v3Goals:
    - "UI/UX Redesign (Premium Enterprise Look)"
    - "Performance Optimization (Frontend)"
  targetUsers:
    primary: "Lãnh đạo cấp cao (50+ tuổi)"
    secondary: "Nhân viên"
  uxPrinciples:
    - "Clear & Simple layout"
    - "One-click access for common tasks"
    - "No hunting for features"
    - "Modern but familiar patterns"
  performanceTargets:
    FCP: "<1.5s"
    TTI: "<3s"
    LCP: "<2.5s"
    bundleReduction: "30%"
scopeConstraint: "Frontend Only - API unchanged"
---

# Product Requirements Document - ĐHTN v3

**Author:** Binh
**Date:** 2026-01-14
**Scope:** Frontend UI Redesign (API giữ nguyên)

---

## Success Criteria

### User Success

| Tiêu chí                                    | Target     |
| ------------------------------------------- | ---------- |
| Lãnh đạo tìm văn bản cần duyệt              | ≤ 2 clicks |
| Màn hình chính hiển thị items quan trọng    | ≤ 10 items |
| Time to Learn (core tasks) cho người mới    | < 30 phút  |
| Người dùng 50+ tự thao tác không cần hỗ trợ | 90% tasks  |

### Business Success

| Mốc thời gian | Tiêu chí thành công                               |
| ------------- | ------------------------------------------------- |
| 3 tháng       | UI mới deploy thành công, 100% users sử dụng      |
| 6 tháng       | Feedback tích cực từ Trưởng Ban và các cục trưởng |

### Technical Success (Frontend Only)

| Metric                         | Target              |
| ------------------------------ | ------------------- |
| First Contentful Paint (FCP)   | < 1.5s              |
| Time to Interactive (TTI)      | < 3s                |
| Largest Contentful Paint (LCP) | < 2.5s              |
| Bundle size giảm               | 30% so với v2       |
| **API compatibility**          | **100% giữ nguyên** |

### Measurable Outcomes

- Dashboard hiển thị tất cả thông tin quan trọng trong 1 view
- Layout 2 khung (50%-50%) cho màn xử lý công việc
- Premium Enterprise Look với TailwindCSS + Radix UI

---

## Product Scope

### MVP - v3.0 (Frontend Only)

**UI/UX Redesign:**

- Giao diện Premium Enterprise Look
- TailwindCSS + Radix UI (customized)
- Dashboard theo vai trò (6 roles: Lãnh đạo Ban, Lãnh đạo đơn vị, Lãnh đạo phòng, Văn thư, Trợ lý, Admin)
- Layout 2 khung 50%-50% cho màn xử lý
- Responsive cho người dùng 50+ tuổi
- Theme customization (Dark/Light, primary color) với localStorage persistence

**Migration Strategy:**

> ⚠️ Components mới tạo trong folder `v3/` - không ghi đè v2
>
> - Pages chưa redesign vẫn sử dụng v2 components
> - Chuyển đổi dần dần theo từng Epic

**Performance Optimization (Frontend):**

- Code splitting và lazy loading
- Bundle size optimization
- Image optimization

**Scope Constraint:**

- ⚠️ **GIỮ NGUYÊN tất cả API calls**
- Không thay đổi backend logic
- Chỉ thay đổi presentation layer

### Growth Features (Sau MVP)

- Backend/API changes cho Báo cáo tuần tự động
- Bộ tính điểm đánh giá (thang 100)
- Task-v3 với Kanban cải tiến

### Vision (Tương lai)

- AI hỗ trợ phân loại văn bản
- Mobile-responsive cho lãnh đạo
- Trưởng Ban và các cục trưởng hài lòng với hệ thống mới

---

## User Journeys

### Persona 1: Trưởng Ban Cơ yếu - "Anh Hùng" (55 tuổi)

**Tình huống:** Buổi sáng bận rộn, có cuộc họp lúc 9h, cần duyệt văn bản trước.

**Journey:**

> Anh Hùng mở màn hình điện thoại, thấy ngay Dashboard "Trung tâm Ra quyết định". Khu vực "Hành động ngay" hiển thị: 3 văn bản cần ký, 2 nhiệm vụ cần chỉ đạo. Bấm vào văn bản đầu tiên → Màn hình chia 50/50: Tờ trình bên trái, Dự thảo bên phải. Đọc nhanh, bấm "Ký duyệt & Phát hành". Xong 3 văn bản trong 5 phút thay vì 30 phút như trước.

**Reveals:** Dashboard lãnh đạo, layout 2 khung, nút ký duyệt nhanh

---

### Persona 2: Cục trưởng - "Chị Lan" (52 tuổi)

**Tình huống:** Chỉ đạo từ Trưởng Ban chuyển xuống, cần phân công cho các phòng.

**Journey:**

> Chị Lan nhận thông báo văn bản mới từ Ban. Mở Dashboard, thấy "Luồng chỉ đạo từ Ban" với nút "Giao việc" ngay tại dòng tin. Nhìn "Ma trận Phân công" - Phòng A đang có 15 việc, Phòng B chỉ có 5. Giao việc cho Phòng B để cân bằng nguồn lực. Theo dõi tiến độ qua thanh Progress Bar trên Dashboard.

**Reveals:** Ma trận phân công, nút giao việc 1-click, cảnh báo workload

---

### Persona 3: Trưởng phòng - "Anh Minh" (45 tuổi)

**Tình huống:** Thứ 5, cần nộp báo cáo tuần trước 17:00.

**Journey:**

> Anh Minh vào Dashboard, thấy widget "Trạng thái Báo cáo tuần" đang nhấp nháy. Hệ thống đã TỰ ĐỘNG quét tiến độ công việc và tạo bản Dự thảo. Anh chỉ cần rà soát, sửa vài dòng, bấm "Nộp báo cáo ngay". Xong trong 15 phút thay vì 2 tiếng soạn từ đầu.

**Reveals:** Báo cáo tuần tự động (Growth feature), nút nộp nổi bật

---

### Persona 4: Chuyên viên - "Em Hương" (28 tuổi)

**Tình huống:** Được giao soạn dự thảo văn bản đi từ văn bản đến.

**Journey:**

> Hương mở Dashboard, thấy danh sách "Việc hôm nay" - 3 task cụ thể. Bấm vào task đầu: Màn hình 2 khung - Trái là văn bản đến, Phải là khu vực soạn thảo. Bấm "Tạo văn bản đi" → Rich Text Editor mở ra ngay trong trình duyệt. Soạn xong → "Trình duyệt" → Gửi lên Trưởng phòng.

**Reveals:** To-Do list cá nhân, Rich Text Editor, trình duyệt 1-click

---

### Journey Requirements Summary

| Capability              | Journeys liên quan      |
| ----------------------- | ----------------------- |
| Dashboard theo vai trò  | Tất cả personas         |
| Layout 2 khung 50/50    | Trưởng Ban, Chuyên viên |
| Nút "Giao việc" 1-click | Cục trưởng              |
| Ma trận phân công       | Cục trưởng              |
| Báo cáo tuần tự động    | Trưởng phòng (Growth)   |
| Rich Text Editor        | Chuyên viên             |
| To-Do list cá nhân      | Chuyên viên             |

---

## Domain-Specific Requirements

**Domain:** Govtech (Government Technology)
**Complexity:** High
**Scope Constraint:** Frontend Only - API unchanged

### Accessibility & Usability (UI Layer)

| Requirement               | Priority    | Notes                             |
| ------------------------- | ----------- | --------------------------------- |
| Font size tối thiểu 14px  | Required    | Người dùng 50+ tuổi               |
| High contrast mode option | Recommended | Dễ đọc trong môi trường văn phòng |
| Responsive design         | Required    | Hỗ trợ nhiều kích thước màn hình  |

### Security (UI Layer)

| Requirement             | Status                   |
| ----------------------- | ------------------------ |
| Session timeout warning | Giữ nguyên từ v2         |
| Secure form handling    | Giữ nguyên - API handles |
| Audit log display       | UI component - style mới |

### Compliance Note

Các yêu cầu compliance về data residency, encryption, và security clearance được xử lý ở **Backend/API layer** và **không nằm trong scope** của dự án Frontend Redesign này.

---

## Web App Specific Requirements

### Browser Support Matrix

| Browser | Version | Priority                    |
| ------- | ------- | --------------------------- |
| Chrome  | 100+    | Primary                     |
| Edge    | 100+    | Secondary                   |
| Firefox | 100+    | Secondary                   |
| Safari  | N/A     | Not required (internal app) |

### Responsive Design

| Device  | Support Level | Notes                 |
| ------- | ------------- | --------------------- |
| Desktop | Full          | 90% users on desktop  |
| Tablet  | Nice to have  | Các cuộc họp          |
| Mobile  | Limited       | Urgent approvals only |

### Performance Targets

| Metric                         | Target             |
| ------------------------------ | ------------------ |
| First Contentful Paint (FCP)   | < 1.5s             |
| Time to Interactive (TTI)      | < 3s               |
| Largest Contentful Paint (LCP) | < 2.5s             |
| Bundle Size                    | Giảm 30% so với v2 |

### SEO Strategy

- **Not applicable** - Ứng dụng internal, đăng nhập bắt buộc

### Accessibility Level

| Requirement         | Target        |
| ------------------- | ------------- |
| WCAG Level          | 2.1 AA        |
| Font size minimum   | 14px          |
| High contrast mode  | Recommended   |
| Keyboard navigation | Basic support |

---

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Experience MVP - Focus vào trải nghiệm người dùng tốt hơn

**Scope Constraint:** Frontend Only - Không thay đổi API

### MVP Feature Set (Phase 1 - v3.0)

**Core User Journeys Supported:**

- Trưởng Ban: Duyệt văn bản nhanh (5 phút thay vì 30 phút)
- Cục trưởng: Giao việc 1-click, theo dõi workload
- Trưởng phòng: Rà soát và phê duyệt nhanh
- Chuyên viên: Thực thi và soạn thảo hiệu quả

**Must-Have Capabilities:**

| Feature                  | Priority  | User Journey            |
| ------------------------ | --------- | ----------------------- |
| Dashboard theo vai trò   | Must-Have | Tất cả                  |
| Layout 2 khung 50/50     | Must-Have | Trưởng Ban, Chuyên viên |
| Premium Enterprise Look  | Must-Have | Tất cả                  |
| Performance optimization | Must-Have | Tất cả                  |
| Nút giao việc 1-click    | Must-Have | Cục trưởng              |
| To-Do list cá nhân       | Must-Have | Chuyên viên             |

### Post-MVP Features

**Phase 2 (Growth - v3.x):**

- Báo cáo tuần tự động (Cần API change)
- Bộ tính điểm đánh giá (Cần API change)
- Kanban cải tiến task-v3 (Cần API change)

**Phase 3 (Expansion - Vision):**

- AI phân loại văn bản
- Mobile-responsive cho lãnh đạo

### Risk Mitigation Strategy

| Risk Type     | Risk                         | Mitigation                                   |
| ------------- | ---------------------------- | -------------------------------------------- |
| **Technical** | Performance không đạt target | Code splitting, lazy loading, tree shaking   |
| **UX**        | Users không quen UI mới      | Training sessions, onboarding flow nhẹ nhàng |
| **Adoption**  | Lãnh đạo không dùng hệ thống | Simplified UI, ≤2 clicks cho tất cả tasks    |

---

## Functional Requirements

### Dashboard & Navigation

- **FR1:** Users can view role-specific dashboard based on their position
- **FR2:** Leaders can see "Action Required" section with pending items
- **FR3:** Leaders can see "Key Tracking" section with pinned items
- **FR4:** Staff can see "Today's Work" to-do list with personal tasks
- **FR5:** Users can navigate between main sections with ≤2 clicks

### Document Processing View

- **FR6:** Users can view documents in split-screen layout (50/50)
- **FR7:** Leaders can view proposal/reference on left panel
- **FR8:** Leaders can view draft/action on right panel
- **FR9:** Users can collapse/expand panels for focus mode

### Task Assignment UI

- **FR10:** Department heads can assign tasks with 1-click action
- **FR11:** Department heads can view workload matrix by department
- **FR12:** Users can view task progress via progress bar
- **FR13:** Users can pin/unpin important items for tracking

### Document Drafting

- **FR14:** Staff can create outgoing documents via Rich Text Editor
- **FR15:** Staff can submit drafts for approval to supervisors
- **FR16:** Users can view document history and versions

### Reporting UI

- **FR17:** Section heads can view weekly report status widget
- **FR18:** Section heads can review and submit reports via dedicated button
- **FR19:** Secretaries can view submission status by department

### User Experience

- **FR20:** Users can customize font size (accessibility)
- **FR21:** Users can receive session timeout warnings
- **FR22:** New users can learn core tasks within 30 minutes
- **FR23:** Users 50+ can complete 90% tasks without assistance

---

## Non-Functional Requirements

### Performance (NFR1-4)

| ID   | Requirement                    | Target | Priority |
| ---- | ------------------------------ | ------ | -------- |
| NFR1 | First Contentful Paint (FCP)   | < 1.5s | Critical |
| NFR2 | Time to Interactive (TTI)      | < 3s   | Critical |
| NFR3 | Largest Contentful Paint (LCP) | < 2.5s | Critical |
| NFR4 | Bundle size reduction vs v2    | ≥ 30%  | High     |

### Usability (NFR5-8)

| ID   | Requirement                      | Target     | Priority |
| ---- | -------------------------------- | ---------- | -------- |
| NFR5 | Time to Learn (core tasks)       | < 30 phút  | Critical |
| NFR6 | Task completion rate (users 50+) | ≥ 90%      | Critical |
| NFR7 | Steps to primary actions         | ≤ 2 clicks | High     |
| NFR8 | Dashboard items visible          | ≤ 10 items | High     |

### Accessibility (NFR9-11)

| ID    | Requirement                 | Target | Priority |
| ----- | --------------------------- | ------ | -------- |
| NFR9  | WCAG compliance level       | 2.1 AA | High     |
| NFR10 | Minimum font size           | 14px   | Critical |
| NFR11 | Keyboard navigation support | Basic  | Medium   |

### Compatibility (NFR12-13)

| ID    | Requirement                                | Target | Priority |
| ----- | ------------------------------------------ | ------ | -------- |
| NFR12 | API backward compatibility                 | 100%   | Critical |
| NFR13 | Browser support (Chrome/Edge/Firefox 100+) | Full   | High     |

### Maintainability (NFR14-15)

| ID    | Requirement                 | Target              | Priority |
| ----- | --------------------------- | ------------------- | -------- |
| NFR14 | Component reusability       | Design System based | High     |
| NFR15 | Code documentation coverage | ≥ 80%               | Medium   |

---

## Document Validation

### PRD Completeness Checklist

| Section                     | Status | Notes                                                  |
| --------------------------- | ------ | ------------------------------------------------------ |
| Success Criteria            | ✅     | User/Business/Technical metrics defined                |
| Product Scope               | ✅     | MVP/Growth/Vision phased                               |
| User Journeys               | ✅     | 4 personas with narrative stories                      |
| Domain Requirements         | ✅     | Govtech, Accessibility covered                         |
| Web App Requirements        | ✅     | Browser/Performance/Responsive                         |
| Functional Requirements     | ✅     | 23 FRs covering all journeys                           |
| Non-Functional Requirements | ✅     | 15 NFRs covering performance, usability, compatibility |

### Scope Validation

- ✅ **Frontend Only** - Không thay đổi API
- ✅ **API Compatibility** - 100% giữ nguyên
- ✅ **Target Users** - Lãnh đạo cấp cao (50+ tuổi)
- ✅ **Performance Targets** - FCP/TTI/LCP defined

### Next Steps

1. **UX Design** - Thiết kế chi tiết UI/UX với `/bmad-bmm-workflows-create-ux-design`
2. **Architecture** - Kiến trúc Frontend với `/bmad-bmm-workflows-create-architecture`
3. **Epics & Stories** - Phân rã features với `/bmad-bmm-workflows-create-epics-and-stories`

---

**Document Status:** ✅ **COMPLETE**
**Ready for:** UX Design Phase
