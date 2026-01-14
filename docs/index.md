# ĐHTN - Project Documentation Index

> **Hệ thống Quản lý Văn bản và Điều hành Tác nghiệp**
> Ban Cơ yếu Chính phủ - Government Cipher Committee

---

## Project Overview

| Attribute            | Value                                          |
| -------------------- | ---------------------------------------------- |
| **Type**             | Monolith Web Application                       |
| **Framework**        | Next.js 14.2.32                                |
| **Language**         | TypeScript                                     |
| **UI Library**       | TailwindCSS + Radix UI                         |
| **State Management** | Zustand (6 stores) + React Query               |
| **Architecture**     | Component-based SPA with API integration layer |

---

## Quick Reference

- **Entry Point:** `src/app/layout.tsx`
- **Tech Stack:** Next.js 14, React 18, TypeScript, TailwindCSS, Radix UI
- **State:** Zustand (persisted) + React Query
- **API:** Axios with JWT Auth + Token Refresh + Encryption
- **i18n:** next-intl
- **Digital Signature:** VGCA Plugin (USB Token)

---

## Generated Documentation

### Core Architecture

- [Project Overview](./project-overview.md)
- [Architecture](./architecture.md)
- [Source Tree Analysis](./source-tree-analysis.md)

### Technical Details

- [API Contracts](./api-contracts.md)
- [Data Models & Services](./data-models.md)
- [Component Inventory](./component-inventory.md)

### Development

- [Development Guide](./development-guide.md)

---

## Feature Modules (43 modules)

### Document Management

- `document-in/` - Văn bản đến (Incoming documents)
- `document-out/` - Văn bản đi (Outgoing documents)
- `doc-internal/` - Văn bản nội bộ (Internal documents)
- `document-book/` - Sổ văn bản (Document registry)
- `document-record/` - Hồ sơ công việc (Work records)
- `document-sync/` - Đồng bộ văn bản (Document sync)

### Task & Workflow

- `task/` - Quản lý công việc (Task management)
- `task-v2/` - Phiên bản mới (Task v2)
- `workflow-config/` - Cấu hình quy trình (Workflow configuration)
- `process/` - Xử lý quy trình (Process handling)
- `delegate/` - Ủy quyền (Delegation)
- `delegate_flow/` - Luồng ủy quyền (Delegation flow)

### Scheduling & Planning

- `calendar/` - Lịch công tác (Work calendar)
- `daily-report/` - Báo cáo ngày (Daily reports)
- `manage-watch-list/` - Danh sách theo dõi (Watch list)
- `manage-vehicle/` - Quản lý phương tiện (Vehicle management)

### Administration

- `users/` - Quản lý người dùng (User management)
- `role/` - Phân quyền (Role management)
- `organizations/` - Đơn vị/Tổ chức (Organizations)
- `categories/` - Danh mục (Categories)
- `settings/` - Cài đặt (Settings)
- `module_manage/` - Quản lý module (Module management)

### Other Features

- `retake/` - Thu hồi văn bản (Document retake)
- `track-doc/` - Theo dõi văn bản (Document tracking)
- `search-doc/` - Tìm kiếm (Search)
- `notifications/` - Thông báo (Notifications)
- `form-config/` - Cấu hình biểu mẫu (Form configuration)
- `template/` - Mẫu văn bản (Templates)
- `request/` - Yêu cầu (Requests)
- `viewer/` - Xem tài liệu (Document viewer)
- `profile/` - Hồ sơ cá nhân (User profile)

---

## Services Layer (65 services)

| Category       | Services                                                                             | LOC     |
| -------------- | ------------------------------------------------------------------------------------ | ------- |
| **Document**   | document.service, document-in.service, document-out.service, document-record.service | ~80,000 |
| **Task**       | task.service, taskv2.service                                                         | ~35,000 |
| **User/Auth**  | user.service, profile.service, role.service                                          | ~19,000 |
| **Encryption** | encryption.service, decryption.service, signature.service                            | ~58,000 |
| **Calendar**   | calendar.service, usage.service                                                      | ~12,000 |
| **Vehicle**    | vehicle.service, watch-list.service                                                  | ~12,000 |
| **Workflow**   | workflow.service, workflow-config.service, process.service                           | ~6,000  |
| **File**       | file.service, upload-file.service, upload-encryption.service                         | ~51,000 |
| **Other**      | Various domain services                                                              | ~25,000 |

---

## State Management (6 Zustand Stores)

| Store               | Purpose                                     | Persistence |
| ------------------- | ------------------------------------------- | ----------- |
| `auth.store`        | Authentication, user info, roles, USB token | ✅ Yes      |
| `encrypt.store`     | Encryption mode toggle                      | No          |
| `loading.store`     | Global loading state                        | No          |
| `pdf.store`         | PDF viewer state                            | No          |
| `sideBar.store`     | Sidebar navigation state                    | No          |
| `work-assign.store` | Work assignment context                     | No          |

---

## Getting Started

```bash
# Install dependencies
yarn install

# Run development server
yarn dev

# Build for production
yarn build

# Start production server
yarn start
```

### Environment Setup

- Copy `.env.example` to `.env.development`
- Configure `NEXT_PUBLIC_API_HOST` for backend URL
- Ensure VGCA plugin is available for digital signature features

---

## Security Notes

- **JWT Authentication** with access token + refresh token
- **USB Token (VGCA)** support for hardware-based authentication
- **Document Encryption** with server-side encryption flag
- **Role-based Access Control** with dynamic module permissions
- **Government-grade security** requirements (Ban Cơ yếu Chính phủ)

---

_Generated by BMad Document Project Workflow_
_Scan Level: Exhaustive | Date: 2026-01-14_
