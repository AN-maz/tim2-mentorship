# Frontend Implementation Plan — LMS Gamifikasi

> **Sources:** `docs/API_CONTRACT.md` (46 endpoints), `docs/prototype.html` (complete UI simulation), `docs/classDiagram.plantuml`
> **Goal:** Enable frontend development without waiting for backend — full parallel execution with mock API.

---

## 1. Current State

### 1.1 What's Already Built
| File | Status | Notes |
|------|--------|-------|
| `src/main.jsx` | Done | BrowserRouter + StrictMode setup |
| `src/App.jsx` | Done | Routes: `/` (LandingPage), `/auth` (AuthView) |
| `src/components/landing-page/` | Done | Navbar, Hero, Features, Footer, Our-team, ReadyToAction, Why |
| `src/pages/auth/AuthView.jsx` | Done | Static form, no API integration |
| `src/pages/landingPage/LandingPage.jsx` | Done | Static landing page |

### 1.2 What's Missing
- **No API client** — AuthView has no API calls
- **No auth context** — No session/token management
- **No app-shell after login** — No dashboard, sidebar, or protected routes
- **No materi/kuis UI** — Pages 03-09 of prototype not implemented
- **No admin pages** — Admin panel not started
- **No shared components** — No reusable UI primitives
- **No mock API layer** — Can't develop without backend

### 1.3 Code Style Observations
- JSX with Tailwind CSS + custom colors (`primary`, `navy`)
- Functional components with `useState`
- Inline event handlers are acceptable
- React Router v7 for navigation

---

## 2. Target Page Structure & Route Map

| Route | Page Name | Auth Required | Role | API Endpoints (from API_CONTRACT.md) |
|-------|-----------|---------------|------|--------------------------------------|
| `/` | LandingPage | Public | — | Static |
| `/auth` | AuthView | Public | — | API-001, API-002, API-003, API-004 |
| `/dashboard` | DashboardPage | JWT | user | API-017 (leaderboard), API-018 (my-materi count) |
| `/materi` | MateriListPage | JWT | user | API-005 (list), API-007 (search) |
| `/materi/:id` | MateriDetailPage | JWT | user | API-005, API-006 (detail), API-008/009 (rating), API-010/011/012 (comments), API-013 (complete), API-014 (related quizzes) |
| `/kuis` | KuisListPage | JWT | user | API-014 (info) — **NEEDS CLARIFICATION: no public kuis list endpoint** |
| `/kuis/:id` | KuisTakePage | JWT | user | API-014 (info), API-015 (questions), API-016 (submit) |
| `/leaderboard` | LeaderboardPage | JWT | user | API-017 |
| `/kelola-materi` | KelolaMateriPage | JWT | user | API-018 (my-materi), API-019/020/021/022 |
| `/kelola-materi/edit/:id` | MateriFormPage | JWT | user | API-019 (get), API-020 (create), API-021 (update) |
| `/kelola-materi/buat` | MateriFormPage | JWT | user | API-020 |
| `/kelola-kuis` | KelolaKuisPage | JWT | user | API-023 (my-kuis), API-024/025/026/027 |
| `/kelola-kuis/edit/:id` | KuisFormPage | JWT | user | API-024 (get), API-025 (create), API-026 (update) |
| `/kelola-kuis/buat` | KuisFormPage | JWT | user | API-025 |
| `/admin` | AdminDashboard | JWT, admin | admin | API-028 (users count), API-033 (content count), API-039 (xp-config), API-041 (season) |
| `/admin/users` | AdminUsersPage | JWT, admin | admin | API-028 to API-032 |
| `/admin/moderasi` | AdminModerasiPage | JWT, admin | admin | API-033 to API-038 |
| `/admin/xp` | AdminXPPage | JWT, admin | admin | API-039 to API-046 |
| `/admin/logs` | AdminLogsPage | JWT, admin | admin | API-033 (history per content), AuditLog API needed |
| `/profil` | ProfilPage | JWT | user | API-001 (user info from token) |

---

## 3. Development Phases

### Phase 1: Infrastructure (Day 1)
1. **API Client** (`src/lib/api.js`) — axios instance with JWT interceptors
2. **Auth Context** (`src/context/AuthContext.jsx`) — token storage, login/logout, role checks
3. **Protected Routes** (`src/components/ProtectedRoute.jsx`) — JWT + role guards
4. **App Shell** (`src/layouts/AppLayout.jsx`) — sidebar + header (from prototype)
5. **Mock API** (`src/lib/mockApi.js`) — data from prototype.html, intercepts API calls

### Phase 2: Auth Pages (Day 1-2)
1. Update `AuthView.jsx` — connect to real API-001/API-003, Google OAuth (API-002/API-004)
2. Login → store token → redirect to `/dashboard`
3. Register → success → redirect to login

### Phase 3: User Pages (Day 2-4)
1. Dashboard — XP overview, recent activity, quick actions
2. Materi list — search + filter
3. Materi detail — markdown render, rating, comments, complete button
4. Kuis list — list all public quizzes
5. Kuis take — timer, questions, submit, results
6. Leaderboard — category tabs, pagination
7. Kelola Materi — CRUD with markdown editor
8. Kelola Kuis — CRUD with question builder
9. Profil — user info, XP summary

### Phase 4: Admin Pages (Day 4-5)
1. Admin Dashboard — overview stats
2. Admin Users — list, role change, suspend/unsuspend/delete
3. Admin Moderasi — list content, moderate/approve/delete
4. Admin XP & Ranked — config XP, rank tiers, reset season, recalculate

### Phase 5: Polish (Day 5-6)
1. Error boundaries
2. Loading skeletons
3. Toast notifications
4. Responsive testing

---

## 4. API Endpoint → Page Mapping

### Auth Module
```
POST /api/auth/login          → AuthView (login mode)
POST /api/auth/register       → AuthView (register mode)
POST /api/auth/google-login   → AuthView (Google button)
POST /api/auth/google-register → AuthView (Google button, new user)
```

### Materi Module
```
GET /api/materi               → MateriListPage, MateriDetailPage (related)
GET /api/materi/:id           → MateriDetailPage
GET /api/materi/search?keyword → MateriListPage (search)
GET /api/materi/my-materi     → KelolaMateriPage
GET /api/materi/:id/edit      → MateriFormPage (edit)
POST /api/materi              → MateriFormPage (create)
PUT /api/materi/:id           → MateriFormPage (update)
DELETE /api/materi/:id        → KelolaMateriPage (delete)
```

### Rating Module
```
POST /api/rating              → MateriDetailPage (give rating)
POST /api/rating/update       → MateriDetailPage (change rating, confirmed)
```

### Comment Module
```
POST /api/komentar            → MateriDetailPage (add comment)
PUT /api/komentar/:id         → MateriDetailPage (edit comment)
DELETE /api/komentar/:id      → MateriDetailPage (delete comment)
```

### Learning Module
```
POST /api/riwayat-belajar/complete → MateriDetailPage (tandai selesai)
```

### Kuis Module
```
GET /api/kuis/:id             → KuisTakePage (info)
GET /api/kuis/:id/soal        → KuisTakePage (questions)
POST /api/kuis/:id/submit     → KuisTakePage (submit)
GET /api/kuis/my-kuis         → KelolaKuisPage
GET /api/kuis/:id/edit        → KuisFormPage (edit)
POST /api/kuis                → KuisFormPage (create)
PUT /api/kuis/:id             → KuisFormPage (update)
DELETE /api/kuis/:id          → KelolaKuisPage (delete)
```

### Leaderboard Module
```
GET /api/leaderboard?category=total&period=all → LeaderboardPage
```

### Admin Module
```
GET /api/admin/users                     → AdminUsersPage
PUT /api/admin/users/:id/role            → AdminUsersPage (role dialog)
PUT /api/admin/users/:id/suspend         → AdminUsersPage (suspend dialog)
PUT /api/admin/users/:id/unsuspend       → AdminUsersPage
DELETE /api/admin/users/:id              → AdminUsersPage (delete confirm)

GET /api/admin/content                   → AdminModerasiPage
GET /api/admin/content/:id               → AdminModerasiPage (preview modal)
PUT /api/admin/content/:id/moderate      → AdminModerasiPage (hide dialog)
PUT /api/admin/content/:id/approve       → AdminModerasiPage (approve confirm)
DELETE /api/admin/content/:id            → AdminModerasiPage (delete confirm)
GET /api/admin/content/:id/history       → AdminModerasiPage (history modal)

GET /api/admin/xp-config                 → AdminXPPage
PUT /api/admin/xp-config                 → AdminXPPage (save config)
GET /api/admin/season/current            → AdminXPPage
POST /api/admin/season/reset             → AdminXPPage (reset dialog)
POST /api/admin/xp/recalculate           → AdminXPPage (start recalculate)
GET /api/admin/xp/recalculate/status     → AdminXPPage (poll progress)
GET /api/admin/rank-tiers                → AdminXPPage
PUT /api/admin/rank-tiers                → AdminXPPage (save thresholds)
```

---

## 5. Component Architecture

### 5.1 Shared/UI Components (`src/components/ui/`)
| Component | Files | Notes |
|-----------|-------|-------|
| `Button` | Button.jsx | Variants: primary, secondary, danger, ghost |
| `Input` | Input.jsx | Text, email, password, number variants |
| `TextArea` | TextArea.jsx | |
| `Select` | Select.jsx | |
| `Modal` | Modal.jsx | |
| `Toast` | Toast.jsx + ToastProvider.jsx | |
| `Badge` | Badge.jsx | For roles, status, ranks |
| `StarRating` | StarRating.jsx | 1-5 stars, read-only or editable |
| `RankChip` | RankChip.jsx | Bronze/Silver/Gold/Platinum/Diamond |
| `XPBar` | XPBar.jsx | Progress bar with next rank |
| `Avatar` | Avatar.jsx | Initial-based, color-coded |
| `Loading` | Loading.jsx, Skeleton.jsx | |

### 5.2 Layout Components (`src/components/layout/`)
| Component | Files | Notes |
|-----------|-------|-------|
| `AppLayout` | AppLayout.jsx | Sidebar + Header + Outlet |
| `AdminLayout` | AdminLayout.jsx | Admin sidebar variant |
| `Sidebar` | Sidebar.jsx | Navigation with role-based items |
| `Header` | Header.jsx | Page title + season indicator |
| `ProtectedRoute` | ProtectedRoute.jsx | JWT + role guard |

### 5.3 Feature Components (`src/components/features/`)
| Feature | Components | Pages |
|---------|-----------|-------|
| Auth | AuthForm, GoogleButton | AuthView |
| Materi | MateriCard, MateriList, MateriContent, KomentarList, KomentarForm | MateriList, MateriDetail, KelolaMateri |
| Kuis | KuisCard, KuisForm, QuizPlayer, QuizResult | KuisList, KuisTake, KelolaKuis |
| Leaderboard | LeaderboardTable, LeaderboardTabs | Leaderboard |
| Dashboard | StatCards, ActivityFeed, QuickstartCards | Dashboard |
| Admin | UserTable, ContentTable, XPConfigForm, SeasonManager, LogsTable | Admin pages |

---

## 6. Mock API Layer

Since `prototype.html` already has all the data structures, create `src/lib/mockApi.js` that:

1. **Imports data** from `prototype.html` (convert to JS module)
2. **Mocks all 46 endpoints** with fake delays (500-1500ms)
3. **Intercepts axios** via mock adapter or conditional fetch wrapper

```js
// src/lib/mockApi.js
const mockData = {
  users: [...],      // from prototype DEFAULT_STATE.users
  materials: [...],  // from prototype DEFAULT_STATE.materials  
  quizzes: [...],    // from prototype DEFAULT_STATE.quizzes
  config: {...},     // XP config
  season: {...},
  // ...
};

// Export function that wraps fetch to use mock in dev
export const mockFetch = (url, options) => {
  // Map URL → mock handler
  // Return Promise that resolves to API response
};
```

**Key:** When `import.meta.env.DEV === true` and backend is unavailable, use mock. When backend is ready, switch to real API with zero component changes.

---

## 7. Data Types / TypeScript

Since the codebase uses plain JS (no TypeScript), define JSDoc types for IDE autocomplete:

```js
/**
 * @typedef {Object} Materi
 * @property {number} idMateri
 * @property {string} judulMateri
 * @property {string} kontenMarkdown
 * @property {string} idPenulis
 * @property {string} [tanggalEdit]
 * @property {number} totalDilihat
 * @property {number} [ratingRataRata]
 * @property {boolean} status_publik
 */
```

---

## 8. State Management Strategy

| Concern | Tool | Rationale |
|---------|------|-----------|
| Server data (API responses) | **TanStack Query** | Caching, background refetch, optimistic updates, retries |
| Auth (token, user, role) | **React Context** | Simple, need global access + persist to localStorage |
| Form state | **React Hook Form** | Less re-renders, built-in validation |
| UI state (modal open, search query) | **useState/useReducer** | Local to components where needed |

> **Note:** React Query is not currently installed. Add it in Phase 1.

---

## 9. Open Questions (from API_CONTRACT.md)

Resolve these before implementation:
1. **GET /api/kuis** — No public quiz list endpoint exists. Need to either create one or reuse materi list.
2. **Comment listing** — API_CONTRACT item #1: Should `GET /api/materi/:id` include comments inline?
3. **Admin logs** — No dedicated audit log endpoint. Need to reuse `GET /api/admin/content/:id/history` or create new.

---

## 10. File Structure (Target)

```
frontend/src/
├── assets/              # icons, images
├── components/
│   ├── layout/          # AppLayout, Sidebar, Header, ProtectedRoute
│   ├── ui/              # Button, Input, Modal, Toast, StarRating, etc.
│   ├── features/        # MateriCard, KuisCard, QuizPlayer, ActivityFeed
│   └── landing-page/    # (existing) Navbar, Hero, etc.
├── context/
│   ├── AuthContext.jsx  # Auth provider + useAuth hook
│   └── ToastContext.jsx # Toast provider
├── hooks/
│   ├── useAuth.js       # Auth state hooks
│   ├── useApi.js        # Wrapper around React Query
│   └── useDebounce.js   # For search
├── lib/
│   ├── api.js           # Axios instance with interceptors
│   ├── mockApi.js       # Mock adapter
│   └── types.js         # JSDoc typedefs
├── pages/
│   ├── auth/
│   │   └── AuthView.jsx (existing, update)
│   ├── landingPage/
│   │   └── LandingPage.jsx (existing)
│   ├── dashboard/
│   │   └── DashboardPage.jsx
│   ├── materi/
│   │   ├── MateriListPage.jsx
│   │   └── MateriDetailPage.jsx
│   ├── kuis/
│   │   ├── KuisListPage.jsx
│   │   └── KuisTakePage.jsx
│   ├── leaderboard/
│   │   └── LeaderboardPage.jsx
│   ├── kelola/
│   │   ├── KelolaMateriPage.jsx
│   │   ├── MateriFormPage.jsx
│   │   ├── KelolaKuisPage.jsx
│   │   └── KuisFormPage.jsx
│   └── admin/
│       ├── AdminDashboard.jsx
│       ├── AdminUsersPage.jsx
│       ├── AdminModerasiPage.jsx
│       ├── AdminXPPage.jsx
│       └── AdminLogsPage.jsx
├── layouts/
│   ├── AppLayout.jsx      # User app shell
│   └── AdminLayout.jsx    # Admin app shell
├── App.jsx               (existing, update with protected routes)
├── main.jsx               (existing)
└── index.css              (existing)
```

---

## 11. Implementation Priority

| Priority | Pages/Features | Why |
|----------|---------------|-----|
| **P1** | Auth, Dashboard, App Shell | Foundation for all other pages |
| **P1** | Materi list + detail | Most used feature |
| **P2** | Kuis list + take | Core gamification |
| **P2** | Leaderboard | Key gamification feature |
| **P3** | Kelola Materi/Kuis | Creator workflow |
| **P3** | Admin pages | Admin-only features |

---

## 12. Key Design Patterns

### API Client Pattern
```js
// All API calls go through api.js with interceptors
// Token auto-injected, 401 → redirect to login

// Example: fetching materi
const { data, isLoading } = useQuery({
  queryKey: ['materi', id],
  queryFn: () => api.get(`/materi/${id}`),
  staleTime: 5 * 60 * 1000, // 5 min cache
});
```

### Form Pattern
```js
// React Hook Form + Zod
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(materiSchema),
  defaultValues: materiData,
});
```

### Page Pattern
```jsx
// 1. Fetch data with React Query
// 2. Show loading skeleton
// 3. Show error state if failed
// 4. Render page with data
export default function MateriDetailPage() {
  const { id } = useParams();
  const { data, isLoading, error } = useMateri(id);
  
  if (isLoading) return <MateriDetailSkeleton />;
  if (error) return <ErrorMessage error={error} retry={() => refetch()} />;
  
  return <MateriDetailContent materi={data.data} />;
}
```
