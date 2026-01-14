# ĐHTN - Architecture Documentation

## System Overview

**Hệ thống Quản lý Văn bản và Điều hành Tác nghiệp** is a government document management system for Ban Cơ yếu Chính phủ (Government Cipher Committee).

---

## Architecture Pattern

```
┌─────────────────────────────────────────────────────────────────────┐
│                          Next.js App Router                          │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐      │
│  │   Feature       │  │   Feature       │  │   Feature       │      │
│  │   Modules       │  │   Modules       │  │   Modules       │      │
│  │  (document-*)   │  │  (task-*)       │  │  (calendar-*)   │      │
│  └────────┬────────┘  └────────┬────────┘  └────────┬────────┘      │
│           │                    │                    │                │
│  ┌────────▼─────────────────────▼────────────────────▼────────┐      │
│  │                    Component Layer                          │      │
│  │   ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐       │      │
│  │   │   UI    │  │ Common  │  │ Dialogs │  │ Layouts │       │      │
│  │   │(Radix)  │  │         │  │         │  │         │       │      │
│  │   └─────────┘  └─────────┘  └─────────┘  └─────────┘       │      │
│  └────────────────────────────────────────────────────────────┘      │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐      │
│  │                    State Management                         │      │
│  │   ┌──────────┐  ┌──────────┐  ┌──────────┐                 │      │
│  │   │ Zustand  │  │  React   │  │  React   │                 │      │
│  │   │ (Global) │  │  Query   │  │  Context │                 │      │
│  │   └──────────┘  └──────────┘  └──────────┘                 │      │
│  └────────────────────────────────────────────────────────────┘      │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐      │
│  │                    Services Layer                           │      │
│  │   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │      │
│  │   │ Document │  │  Task    │  │  User/   │  │Encryption│   │      │
│  │   │ Services │  │ Services │  │  Auth    │  │ Services │   │      │
│  │   └──────────┘  └──────────┘  └──────────┘  └──────────┘   │      │
│  └────────────────────────────────────────────────────────────┘      │
│                                                                       │
│  ┌────────────────────────────────────────────────────────────┐      │
│  │                    API Layer (Axios)                        │      │
│  │   ┌────────────────────┐  ┌────────────────────┐           │      │
│  │   │ Protected Instance │  │  Public Instance   │           │      │
│  │   │ (JWT + Encrypt)    │  │                    │           │      │
│  │   └────────────────────┘  └────────────────────┘           │      │
│  └────────────────────────────────────────────────────────────┘      │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
                    ┌───────────────────────────────┐
                    │       Backend API Server      │
                    │   (NEXT_PUBLIC_API_HOST)      │
                    └───────────────────────────────┘
```

---

## Technology Stack

| Category           | Technology        | Version | Purpose                              |
| ------------------ | ----------------- | ------- | ------------------------------------ |
| **Framework**      | Next.js           | 14.2.32 | React meta-framework with App Router |
| **Language**       | TypeScript        | 5.x     | Type-safe JavaScript                 |
| **UI Runtime**     | React             | 18.x    | UI component library                 |
| **Styling**        | TailwindCSS       | 3.4.1   | Utility-first CSS                    |
| **UI Components**  | Radix UI          | Various | Accessible component primitives      |
| **State (Global)** | Zustand           | 5.0.8   | Lightweight global state             |
| **State (Server)** | React Query       | 5.86.0  | Server state management              |
| **Forms**          | React Hook Form   | 7.63.0  | Form state management                |
| **Validation**     | Zod               | 4.1.11  | Schema validation                    |
| **HTTP Client**    | Axios             | 1.11.0  | API communication                    |
| **i18n**           | next-intl         | 3.14.1  | Internationalization                 |
| **Charts**         | ECharts, Recharts | Latest  | Data visualization                   |
| **Workflow**       | BPMN-JS           | 18.8.0  | BPMN diagram editor                  |
| **PDF**            | @react-pdf-viewer | 3.12.0  | PDF document viewing                 |
| **Drag & Drop**    | @dnd-kit          | Various | Drag-drop interactions               |

---

## Directory Structure

```
src/
├── api/                  # Axios instances and request handlers
│   ├── axiosInstances.ts # Protected/Public Axios with interceptors
│   ├── base-axios-*.ts   # Request wrappers
│   └── index.ts          # Exports
│
├── app/                  # Next.js App Router pages
│   ├── layout.tsx        # Root layout with providers
│   ├── page.tsx          # Dashboard home
│   ├── document-in/      # Incoming documents (14 files)
│   ├── document-out/     # Outgoing documents (42 files)
│   ├── task/             # Task management (16 files)
│   ├── task-v2/          # Task v2 (21 files)
│   ├── workflow-config/  # Workflow configuration
│   └── ... (43 feature modules)
│
├── components/           # Reusable component library (434 files)
│   ├── ui/               # Radix UI primitives (41 components)
│   ├── common/           # Shared components (35 files)
│   ├── dialogs/          # Modal dialogs (25 files)
│   ├── layouts/          # Layout components
│   └── [feature]/        # Feature-specific components
│
├── services/             # Business logic services (65 files)
│   ├── document.service.ts      # Document operations
│   ├── task.service.ts          # Task operations
│   ├── encryption.service.ts    # Encryption/decryption
│   └── ...
│
├── stores/               # Zustand state stores (6 files)
│   ├── auth.store.ts     # Authentication state (persisted)
│   ├── encrypt.store.ts  # Encryption mode
│   └── ...
│
├── hooks/                # Custom React hooks (69 files)
│   ├── auth/             # Authentication hooks
│   ├── data/             # Data fetching hooks (57 files)
│   └── ...
│
├── definitions/          # Type definitions (59 files)
│   ├── types/            # TypeScript types (39 files)
│   ├── constants/        # App constants (9 files)
│   ├── enums/            # Enumerations (6 files)
│   └── interfaces/       # Interfaces (4 files)
│
├── schemas/              # Zod validation schemas (8 files)
├── utils/                # Utility functions (22 files)
├── lib/                  # Library configurations
└── styles/               # Global styles (3 files)
```

---

## Authentication Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Authentication Flow                        │
├──────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────┐       ┌─────────────┐       ┌─────────────┐  │
│  │   Login     │       │   Login     │       │   Auto      │  │
│  │  (Password) │       │ (USB Token) │       │   Login     │  │
│  └──────┬──────┘       └──────┬──────┘       └──────┬──────┘  │
│         │                     │                     │          │
│         ▼                     ▼                     ▼          │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                  AuthStore (Zustand)                     │  │
│  │  • user info      • token management                     │  │
│  │  • roles/modules  • encryption state                     │  │
│  └─────────────────────────────────────────────────────────┘  │
│                              │                                 │
│                              ▼                                 │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              Protected Axios Instance                    │  │
│  │  • Auto-attach JWT Bearer token                          │  │
│  │  • Auto-refresh on 401                                   │  │
│  │  • Encryption flag injection                             │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
└──────────────────────────────────────────────────────────────┘
```

### Authentication Methods

1. **Username/Password** - Traditional login via `/users/login`
2. **USB Token (VGCA)** - Hardware token login via `/users/login/tk`
3. **Auto Login** - Token-based session restoration

### Token Management

- **Access Token**: Stored in localStorage, attached to all protected requests
- **Refresh Token**: Stored in cookies, used for token renewal
- **Encryption Mode**: Controlled via `encrypt.store`, appends `?encrypt=true` to requests

---

## Data Flow Patterns

### 1. Server State (React Query)

```typescript
// Custom hooks in /hooks/data/
const { data, isLoading } = useDocumentList(params);
```

### 2. Global State (Zustand)

```typescript
// Persistent auth state
const { user, login, logout } = useAuthStore();
```

### 3. Form State (React Hook Form + Zod)

```typescript
const form = useForm<Schema>({
  resolver: zodResolver(schema),
});
```

---

## Security Considerations

| Aspect             | Implementation                                     |
| ------------------ | -------------------------------------------------- |
| **Authentication** | JWT tokens with refresh mechanism                  |
| **Hardware Auth**  | USB Token (VGCA) integration                       |
| **Encryption**     | Server-side encryption toggle via query param      |
| **RBAC**           | Module-based permissions per user role             |
| **Session**        | Persisted auth state, auto-logout on token failure |
| **XSS Protection** | React's built-in sanitization                      |

---

## Integration Points

### External Systems

- **Backend API**: `NEXT_PUBLIC_API_HOST`
- **VGCA Plugin**: `/v3/assets/js/vgcaplugin.js` (digital signature)

### Key API Endpoints

| Prefix                  | Purpose                          |
| ----------------------- | -------------------------------- |
| `/users/*`              | Authentication & user management |
| `/documents/*`          | Document operations              |
| `/tasks/*`              | Task management                  |
| `/workflow/*`           | Workflow engine                  |
| `/calendar2/*`          | Calendar operations              |
| `/vehicle-usage-plan/*` | Vehicle management               |

---

_Generated by BMad Document Project Workflow_
_Scan Level: Exhaustive | Date: 2026-01-14_
