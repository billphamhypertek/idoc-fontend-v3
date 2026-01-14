# ĐHTN - Source Tree Analysis

## Project Root Structure

```
idoc-fontend-v3/
├── .agent/               # Workflow and agent configurations
├── .claude/              # Claude AI configuration
├── .github/              # GitHub workflows
├── _bmad/                # BMad methodology files
├── _docs_/               # BMM documentation artifacts
├── i18n/                 # Internationalization configuration
│   └── request.ts
├── messages/             # i18n message files
│   ├── en.json
│   └── vi.json
├── public/               # Static assets
│   └── v3/               # Versioned public assets
├── src/                  # 【Main Source Code】
└── docs/                 # Generated documentation
```

---

## Source Directory (`src/`)

```
src/
│
├── api/                          # 【API Layer】
│   ├── axiosInstances.ts         # Protected/Public Axios instances
│   ├── base-axios-protected-request.ts
│   ├── base-axios-public-request.ts
│   ├── base-fetch-request.ts
│   └── index.ts                  # Exports: sendGet, sendPost, publicPost
│
├── app/                          # 【Next.js App Router - 43 Modules】
│   ├── layout.tsx               ⭐ Root layout (providers chain)
│   ├── page.tsx                 ⭐ Dashboard home
│   ├── globals.css
│   │
│   ├── login/                   # Authentication
│   ├── auto-login/              # Token-based auto login
│   │
│   ├── document-in/             # 📄 Incoming documents (14 files)
│   ├── document-out/            # 📤 Outgoing documents (42 files)
│   ├── doc-internal/            # 📋 Internal documents (12 files)
│   ├── document-book/           # 📚 Document registry
│   ├── document-record/         # 🗂️ Work records (6 files)
│   ├── document-sync/           # 🔄 Document synchronization
│   │
│   ├── task/                    # ✅ Task management (16 files)
│   ├── task-v2/                 # ✅ Task v2 (21 files)
│   │
│   ├── workflow-config/         # ⚙️ Workflow configuration (3 files)
│   ├── process/                 # 🔀 Process handling (3 files)
│   ├── delegate/                # 🔄 Delegation (3 files)
│   ├── delegate_flow/           # 🔄 Delegation flow
│   │
│   ├── calendar/                # 📅 Work calendar (10 files)
│   ├── daily-report/            # 📊 Daily reports (6 files)
│   ├── manage-watch-list/       # 👁️ Watch list (5 files)
│   ├── manage-vehicle/          # 🚗 Vehicle management (5 files)
│   │
│   ├── users/                   # 👤 User management (2 files)
│   ├── role/                    # 🔐 Role management
│   ├── organizations/           # 🏢 Organizations
│   ├── categories/              # 📂 Categories
│   ├── settings/                # ⚙️ Settings
│   ├── profile/                 # 👤 User profile
│   │
│   ├── retake/                  # ↩️ Document retake (4 files)
│   ├── track-doc/               # 📍 Document tracking (5 files)
│   ├── search-doc/              # 🔍 Search
│   ├── request/                 # 📝 Requests (9 files)
│   │
│   └── [other modules]/
│
├── components/                   # 【UI Components - 434 Files】
│   ├── ui/                      ⭐ Radix UI primitives (41 components)
│   │   ├── button.tsx, input.tsx, dialog.tsx, ...
│   │
│   ├── common/                  # Shared components (35 files)
│   │   ├── ErrorBoundary.tsx
│   │   └── ...
│   │
│   ├── layouts/                 # Layout components (3 files)
│   │   └── rootLayoutWrapper.tsx
│   │
│   ├── dialogs/                 # Modal dialogs (25 files)
│   ├── dashboard/               # Dashboard widgets (33 files)
│   │
│   └── [feature-components]/    # Feature-specific (35 categories)
│       ├── document-in/         # Document-in components (34 files)
│       ├── document-out/        # Document-out components (40 files)
│       ├── task/                # Task components (28 files)
│       └── ...
│
├── services/                     # 【Business Logic - 65 Files】
│   ├── api.service.ts           # Base API service
│   ├── document.service.ts     ⭐ Main document service (990 lines, 85 methods)
│   ├── document-in.service.ts   # Incoming documents
│   ├── document-out.service.ts  # Outgoing documents
│   ├── task.service.ts          # Task management
│   ├── taskv2.service.ts        # Task v2
│   ├── encryption.service.ts   ⭐ Encryption (31KB)
│   ├── decryption.service.ts   ⭐ Decryption (25KB)
│   ├── file.service.ts         ⭐ File handling (29KB)
│   ├── user.service.ts          # User management
│   └── ...
│
├── stores/                       # 【Zustand Stores - 6 Files】
│   ├── auth.store.ts           ⭐ Authentication (275 lines, persisted)
│   ├── encrypt.store.ts         # Encryption mode toggle
│   ├── loading.store.ts         # Global loading state
│   ├── pdf.store.ts             # PDF viewer state
│   ├── sideBar.store.ts         # Sidebar navigation
│   └── work-assign.store.ts     # Work assignment context
│
├── hooks/                        # 【Custom Hooks - 69 Files】
│   ├── auth/                    # Authentication hooks
│   ├── data/                    # Data fetching hooks (57 files)
│   ├── useFileViewer.ts         # File viewing logic
│   ├── useVgcaSign.ts          ⭐ VGCA digital signature (14KB)
│   └── ...
│
├── definitions/                  # 【Type Definitions - 59 Files】
│   ├── types/                   # TypeScript types (39 files)
│   │   ├── auth.type.ts
│   │   ├── document.type.ts
│   │   └── ...
│   ├── constants/               # Constants (9 files)
│   ├── enums/                   # Enumerations (6 files)
│   └── interfaces/              # Interfaces (4 files)
│
├── schemas/                      # 【Zod Schemas - 8 Files】
│   ├── profile.schema.ts
│   ├── calendar-room.schema.ts
│   └── ...
│
├── utils/                        # 【Utilities - 22 Files】
│   ├── authentication.utils.ts
│   ├── common.utils.ts
│   ├── cookies.utils.ts
│   └── ...
│
├── lib/                          # Library configurations
├── provider/                     # React Query provider
├── providers/                    # Auth provider
└── styles/                       # Global styles (3 files)
```

---

## Legend

| Symbol     | Meaning                     |
| ---------- | --------------------------- |
| ⭐         | Critical file / Entry point |
| 📄📤📋📚🗂️ | Document-related modules    |
| ✅         | Task-related modules        |
| ⚙️🔀🔄     | Workflow/Process modules    |
| 📅📊       | Calendar/Report modules     |
| 👤🔐🏢     | Admin/User modules          |

---

_Generated by BMad Document Project Workflow | 2026-01-14_
