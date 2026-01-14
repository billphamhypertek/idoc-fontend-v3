# ĐHTN - Development Guide

## Prerequisites

- **Node.js**: v18+ (LTS recommended)
- **Package Manager**: Yarn 1.22.22+ (specified in packageManager)
- **IDE**: VS Code recommended with TypeScript/ESLint extensions

---

## Getting Started

### 1. Clone Repository

```bash
git clone <repository-url>
cd idoc-fontend-v3
```

### 2. Install Dependencies

```bash
yarn install
```

### 3. Environment Setup

```bash
# Copy example environment file
cp .env.example .env.development

# Required environment variables:
# NEXT_PUBLIC_API_HOST=<backend-api-url>
```

### 4. Run Development Server

```bash
yarn dev
# Open http://localhost:3000
```

---

## Available Scripts

| Command              | Description                    |
| -------------------- | ------------------------------ |
| `yarn dev`           | Start development server       |
| `yarn build`         | Build for production           |
| `yarn start`         | Start production server        |
| `yarn build:staging` | Build with staging environment |
| `yarn start:staging` | Start with staging environment |
| `yarn lint`          | Run ESLint                     |
| `yarn lint:fix`      | Run ESLint with auto-fix       |
| `yarn type-check`    | Run TypeScript type checking   |
| `yarn format`        | Format code with Prettier      |
| `yarn format:check`  | Check code formatting          |

---

## Project Structure Quick Reference

```
src/
├── api/          → Axios instances (protected/public)
├── app/          → Next.js App Router pages (43 modules)
├── components/   → UI components (434 files)
├── services/     → Business logic services (65 files)
├── stores/       → Zustand state stores (6 stores)
├── hooks/        → Custom React hooks (69 files)
├── definitions/  → Types, constants, enums (59 files)
├── schemas/      → Zod validation schemas (8 files)
├── utils/        → Utility functions (22 files)
└── styles/       → Global styles
```

---

## Code Conventions

### File Naming

- Components: `PascalCase.tsx` (e.g., `DocumentList.tsx`)
- Services: `kebab-case.service.ts` (e.g., `document.service.ts`)
- Hooks: `camelCase.ts` with `use` prefix (e.g., `useDocumentList.ts`)
- Types: PascalCase in `.type.ts` files

### Import Aliases

```typescript
import { Component } from "@/components/..."; // → src/
import { Component } from "~/components/..."; // → src/
```

### Component Structure

```typescript
// Feature component example
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { DocumentService } from "@/services/document.service";

export function DocumentList() {
  const { data, isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: () => DocumentService.getAll(),
  });

  return (/* ... */);
}
```

---

## State Management Patterns

### 1. Global State (Zustand)

```typescript
// For authentication, UI state, etc.
import useAuthStore from "@/stores/auth.store";

const { user, login, logout } = useAuthStore();
```

### 2. Server State (React Query)

```typescript
// For API data fetching
import { useQuery, useMutation } from "@tanstack/react-query";

const { data } = useQuery({
  queryKey: ["documents", id],
  queryFn: () => DocumentService.getById(id),
});
```

### 3. Form State (React Hook Form)

```typescript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { documentSchema } from "@/schemas/document.schema";

const form = useForm({
  resolver: zodResolver(documentSchema),
});
```

---

## Adding New Features

### 1. Create Feature Module

```
src/app/new-feature/
├── page.tsx           # Main page
├── [id]/
│   └── page.tsx       # Detail page
└── components/        # Feature-specific components
```

### 2. Add Service

```typescript
// src/services/new-feature.service.ts
import { sendGet, sendPost } from "@/api";

export const NewFeatureService = {
  getAll: () => sendGet("/new-feature"),
  getById: (id: string) => sendGet(`/new-feature/${id}`),
  create: (data: any) => sendPost("/new-feature", data),
};
```

### 3. Add Types

```typescript
// src/definitions/types/new-feature.type.ts
export interface NewFeature {
  id: string;
  name: string;
  // ...
}
```

---

## Git Workflow

### Pre-commit Hooks (Husky)

- ESLint runs on staged files
- Prettier formats code

### Commit Convention

```bash
git commit -m "feat: add new document feature"
git commit -m "fix: resolve document loading issue"
git commit -m "refactor: simplify auth logic"
```

---

## Troubleshooting

### Canvas Module Error

If you see canvas-related errors:

```bash
# The project already has canvas in resolutions
# If issues persist, try:
yarn install --ignore-scripts
```

### Type Errors

```bash
yarn type-check
# Fix any reported type issues
```

### ESLint Issues

```bash
yarn lint:fix
```

---

_Generated by BMad Document Project Workflow | 2026-01-14_
