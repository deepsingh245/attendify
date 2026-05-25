# Attendify — Agent Orientation Guide

Read this file first. It gives you a complete picture of the codebase so you can work without exploratory searches.

---

## What This Project Is

Attendify is a **React + TypeScript** SPA for school attendance management. Three user roles — **Admin**, **Teacher**, and **Student** — each have their own dashboard and route set. Attendance can be marked manually or via **face recognition** (face-api.js / TensorFlow.js). The backend is entirely **Firebase** (Firestore + Auth + Storage).

---

## Tech Stack

| Layer | Technology |
|---|---|
| UI framework | React 18, TypeScript 5.6 |
| Build tool | Vite 6 |
| Styling | Tailwind CSS 3, tailwindcss-animate |
| Component library | shadcn/ui (Radix UI primitives) |
| Routing | React Router DOM v7 |
| Database | Firebase Firestore (`attendify-3` project) |
| Auth | Firebase Auth (`attendify-3` project) |
| File storage | Firebase Storage (`core-sfh` project — separate Firebase app) |
| Charts | Recharts |
| Tables | TanStack Table v8 |
| Notifications | Sonner (toast) |
| Face recognition | face-api.js (SSD MobileNetv1, Face Landmark 68, Face Recognition Net) |
| Icons | Lucide React |
| Theme | next-themes |

---

## Directory Structure

```
src/
├── App.tsx                         # Root: BrowserRouter + ThemeProvider + Toaster
├── appRoutes.tsx                   # All routes + auth state resolution (onAuthStateChanged)
│
├── firebase/
│   ├── firebaseUtils.ts            # Core Firestore CRUD + batch + query builder
│   ├── firebaseStorageUtils.ts     # Firebase Storage upload/get/delete (separate 'storage-app' instance)
│   ├── firebaseFunctionUtils.ts    # Firebase Cloud Functions calls
│   ├── studentUtils.ts             # Student-specific Firestore operations
│   ├── teachersUtils.ts            # Teacher-specific Firestore operations
│   ├── adminUtils.ts               # Admin + Class Firestore operations
│   ├── AttendanceUtils.ts          # Attendance CRUD (single + bulk)
│   ├── bulkDataUtils.ts            # Bulk import helpers
│   └── interfaces/
│       └── user.interface.ts       # ALL TypeScript interfaces (Teacher, Student, Admin, Class, AttendanceRecord)
│
├── services/
│   └── face-api.service.ts         # Face detection: loadModels, loadLabeledDescriptors, createFaceMatcher, detectAllFacesFromImage
│
├── constants/
│   └── constants.ts                # Collection names, AttendanceStatus, AuthErrorCode, LOCAL_STORAGE_KEYS
│
├── lib/
│   └── utils.ts                    # cn(), getCachedUser(), getCachedUserRole(), toast helpers
│
├── guards/
│   └── PrivateRoute.tsx            # Role-based route guard (checks user.role vs allowedRoles[])
│
├── hooks/
│   ├── use-mobile.tsx              # Responsive mobile breakpoint hook
│   └── useTheme.tsx                # Theme hook
│
├── components/
│   ├── layout/
│   │   ├── AppLayout.tsx           # Shell: AppSidebar + NavBar + <Outlet>
│   │   ├── AppSidebar.tsx          # Role-aware sidebar nav (reads role from localStorage cache)
│   │   ├── Navbar.tsx              # Top navbar with theme switcher
│   │   └── Breadcrumps.tsx         # Breadcrumb component
│   ├── modals/
│   │   ├── addUserModal.tsx        # Generic "Add user" modal
│   │   ├── basicAlert.tsx          # Simple alert/confirm dialog
│   │   └── selectAttendanceMethodModal.tsx  # Choose manual vs face recognition
│   ├── shared/
│   │   ├── GenericTable.tsx        # Reusable TanStack Table with pagination
│   │   ├── StatCard.tsx            # KPI statistic card (gradient background)
│   │   └── DropdownButton.tsx      # Dropdown button component
│   ├── charts/
│   │   ├── AreaChart.tsx           # Recharts area chart wrapper
│   │   └── BarChart.tsx            # Recharts bar chart wrapper (ChartBar)
│   ├── ui/                         # shadcn/ui primitives (do not hand-edit)
│   │   └── global-loader.tsx       # Full-screen loader shown during auth resolution
│   └── theme-provider.tsx          # next-themes provider wrapper
│
├── features/
│   ├── profile/
│   │   └── ProfilePage.tsx         # Shared profile page for all roles (photo upload, personal info)
│   └── dashboard/
│       ├── admin/
│       │   ├── AdminOverview.tsx   # Main admin dashboard (attendance overview, charts, alerts)
│       │   ├── attendance/         # Attendance stat cards, charts, alerts
│       │   ├── classes/            # ClassList, AdminClassDetail, student roster table
│       │   ├── students/           # AdminStudentDetail (attendance chart, face photos card), EditStudentModal, AddStudentModal
│       │   ├── teachers/           # TeachersList, AdminTeacherDetail
│       │   └── tickets/            # TicketsList, TicketRoute
│       ├── teacher/
│       │   ├── TeacherOverView.tsx # Teacher dashboard (class cards, timetable)
│       │   ├── TeacherClassOverview.tsx # Single class overview
│       │   ├── ClassDetail.tsx     # Attendance marking + face recognition panel + recognised students list
│       │   └── faceDetection.tsx   # Face recognition component (photo upload, canvas overlay, colour-coded boxes)
│       └── student/
│           ├── StudentOverview.tsx       # Dashboard: 4 stat cards + recent attendance + class info
│           ├── StudentAttendance.tsx     # Monthly stat cards + 6-month bar chart + day-by-day list
│           ├── StudentTimetable.tsx      # Weekly schedule derived from class assignment
│           ├── StudentClasses.tsx        # Per-class cards with attendance % rings
│           ├── StudentAttendanceHistory.tsx # Filterable/paginated attendance history table
│           └── StudentList.tsx           # Student listing (used by admin)
│
└── pages/
    ├── LoginPage.tsx               # Role selector + email/password form + guest login
    ├── SignUp.tsx                  # Signup form
    ├── Home.tsx                    # Redirects via RoleBasedHome
    └── NotFoundPage.tsx            # 404 page
```

---

## Routing

All routes live in [src/appRoutes.tsx](src/appRoutes.tsx). Auth state is resolved via `onAuthStateChanged` before rendering guarded routes.

```
/login                      → LoginPage            (public)
/signup                     → SignUp               (public)
/                           → RoleBasedHome        → redirects to /admin | /teacher | /student

/admin                      → AdminOverview        (role: admin)
/admin/teachers             → TeachersList
/admin/teachers/:id         → AdminTeacherDetail
/admin/classes              → ClassList
/admin/classes/:id          → AdminClassDetail
/admin/students             → StudentList
/admin/students/:id         → AdminStudentDetail
/admin/tickets              → TicketsList
/admin/tickets/:id          → TicketRoute
/admin/profile              → ProfilePage

/teacher                    → TeacherOverView      (role: teacher)
/teacher/class/:id          → TeacherClassOverview
/teacher/class/:id/attendance → ClassDetail
/teacher/profile            → ProfilePage

/student                    → StudentOverview      (role: student)
/student/attendance         → StudentAttendance
/student/timetable          → StudentTimetable
/student/classes            → StudentClasses
/student/attendance-history → StudentAttendanceHistory
/student/profile            → ProfilePage
```

**Auth flow:** `onAuthStateChanged` fires → reads role from `localStorage.getItem('attendify_role')` → fetches full user object from Firestore → stores in `useState(currentUser)` → `PrivateRoute` checks `user.role` against `allowedRoles`.

**Role is persisted** in two localStorage keys:
- `attendify_role` — the role string (`'admin'` | `'teacher'` | `'student'`)
- `user` — the full serialized user object (JSON)

Custom event `attendifyRoleChanged` triggers re-evaluation of role-based navigation (fired after login before redirect).

---

## Firestore Collections

Collection names are in [src/constants/constants.ts](src/constants/constants.ts) under the `Collections` enum.

### `students/{studentId}`
```typescript
interface Student {
  id: string
  userName: string
  email: string
  createdAt: string
  updatedAt: string
  role: 'student'
  classes: string[]           // array of class IDs enrolled
  classId: string             // primary class ID
  rollNo: number
  profilePictureUrl?: string
  faceImages?: string[]       // extra face photos for recognition (improves accuracy)
  lastLogin?: string
  isActive: boolean
  settings?: { theme: 'light' | 'dark'; notifications: boolean }
}
```

### `teachers/{teacherId}`
```typescript
interface Teacher {
  id: string
  userName: string
  email: string
  role: 'teacher'
  subject: string
  classes: { id: string; isAttendanceMarkedForToday: boolean; completed: boolean }[]
  profilePictureUrl?: string
  lastLogin?: string
  isActive: boolean
  settings?: { theme: 'light' | 'dark'; notifications: boolean }
}
```

### `admins/{adminId}`
```typescript
interface Admin {
  id: string
  userName: string
  email: string
  role: 'admin'
  profilePictureUrl?: string
  lastLogin?: string
  isActive: boolean
  settings?: { theme: 'light' | 'dark'; notifications: boolean }
}
```

### `classes/{classId}`
```typescript
interface Class {
  id: string
  className: string
  teacherId: string
  students: string[]          // array of student IDs
}
```

### `attendance/{recordId}`
```typescript
interface AttendanceRecord {
  studentId: string
  classId: string
  date: string                // format: "YYYY-MM-DD" (en-CA locale)
  status: 'Present' | 'Absent' | 'Leave' | 'Late'
}
```

---

## Firebase Utilities — Key Functions

### [src/firebase/firebaseUtils.ts](src/firebase/firebaseUtils.ts) — Core layer
All other utils import from this file.
- `login(email, password)` / `signup(email, password)` / `logout()` / `resetPassword(email)`
- `createAuthUser(email, password)` — creates user without affecting current session (secondary app)
- `addDocument<T>(collection, data)` — auto-ID
- `setDocument<T>(collection, docId, data)` — specific ID
- `getDocument(collection, docId)`
- `getCollection(collection)`
- `updateDocument<T>(collection, docId, data)`
- `deleteDocument(collection, docId)`
- `queryCollection(collection, field, value, op?)` — single-filter query
- `buildQuery(collection, filters[], order?, limitCount?)` — multi-filter query builder
- `batchWrite<T>(collection, operations[])` — Firestore batch (set/update/delete)

### [src/firebase/AttendanceUtils.ts](src/firebase/AttendanceUtils.ts)
- `getAllAttendance()` — all records
- `getAllAttendanceForStudent(studentId)` — all records for one student
- `getAttendanceForClassOnDate(classId, date)` — class attendance on a date
- `getAttendanceForStudentOnDate(studentId, date)` — upsert check
- `markAttendanceForStudent(studentId, date, status)` — upserts a single record
- `markAttendanceForMultipleStudents(attendanceList[])` — batch upsert

### [src/firebase/firebaseStorageUtils.ts](src/firebase/firebaseStorageUtils.ts)
Uses a **second Firebase app instance** (`'storage-app'`) with separate env vars (`VITE_FIREBASE_CORE_*`).
- `uploadFileToFirebaseStorage(file, destinationPath)` → `{ url, path }`
- `getStorageFileUrl(path)` → download URL
- `deleteStorageFile(path)`
- `StoragePaths.studentProfile(id)` → `attendify/students/{id}/profile.jpg`
- `StoragePaths.studentFace(id, timestamp)` → `attendify/students/{id}/faces/face_{ts}.jpg`
- `StoragePaths.teacherProfile(id)`, `StoragePaths.adminProfile(id)`

---

## Environment Variables

Two Firebase app configs used. No Supabase.

```
# Primary app — Auth + Firestore (attendify-3)
VITE_FIREBASE_API_KEY
VITE_FIREBASE_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID
VITE_FIREBASE_APP_ID
VITE_FIREBASE_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID

# Secondary app — Firebase Storage only (core-sfh)
VITE_FIREBASE_CORE_API_KEY
VITE_FIREBASE_CORE_AUTH_DOMAIN
VITE_FIREBASE_CORE_PROJECT_ID
VITE_FIREBASE_CORE_BUCKET
VITE_FIREBASE_CORE_MESSAGING_SENDER_ID
VITE_FIREBASE_CORE_APP_ID
```

---

## Face Recognition Service

[src/services/face-api.service.ts](src/services/face-api.service.ts) — wraps face-api.js.

Models live in `/public/models/` (loaded at runtime via `loadModels('/models')`):
- SSD MobileNetv1 (face detection)
- Face Landmark 68 (facial features)
- Face Recognition Net (descriptor generation)

**Key functions:**
- `loadModels(modelPath)` — loads all three models from path
- `loadLabeledDescriptors(students[])` — for each student, fetches ALL images (`profilePictureUrl` + every `faceImages[]` entry) via blob URL (avoids canvas CORS taint), runs `detectSingleFace`, collects all successful descriptors into `LabeledFaceDescriptors`. More images = better accuracy.
- `createFaceMatcher(descriptors, threshold=0.55)` — returns null if no valid descriptors
- `detectAllFacesFromImage(imgEl)` — runs full detection + landmarks + descriptors on uploaded image
- `bufferToImage` — re-exported from face-api for file → HTMLImageElement conversion

**Image loading:** `loadImageFromUrl(url)` fetches the URL as a `Blob`, creates a same-origin `objectURL`, loads it into an `HTMLImageElement`, then revokes the URL. This avoids canvas CORS taint when the Firebase Storage CORS policy is set.

**CORS requirement:** Firebase Storage bucket (`core-sfh`) must have GET CORS configured with `Access-Control-Allow-Origin: *`.

**Face detection flow (teacher attendance):**
1. Teacher uploads a class group photo
2. `loadLabeledDescriptors` builds descriptors from all student photos
3. `detectAllFacesFromImage` finds every face in the uploaded photo
4. `FaceMatcher.findBestMatch` compares each detected face against all descriptors
5. `drawDetections` draws colour-coded boxes on a canvas overlay with confidence % labels
   - Distance < 0.4 → green (high confidence)
   - 0.4–0.55 → amber (medium confidence)
   - ≥ 0.55 / unknown → red
6. Recognised student IDs are returned to ClassDetail which submits attendance

**Canvas alignment:** The `<img>` uses `object-contain` CSS. `drawDetections` accounts for the letterbox offset using `offsetWidth/offsetHeight` and uniform scale math so boxes align with actual faces.

---

## Shared Utilities — [src/lib/utils.ts](src/lib/utils.ts)

- `cn(...inputs)` — Tailwind class merge (clsx + tailwind-merge)
- `getCachedUser(email?)` — parse full user from `localStorage['user']`; returns `{ id, role, displayName, ...fields }`
- `getCachedUserRole()` — read role from `localStorage['attendify_role']`
- `dangerToast(msg)` / `successToast(msg)` / `infoToast(msg)` / `warningToast(msg)` — sonner wrappers

---

## UI Conventions

- **shadcn/ui** components in [src/components/ui/](src/components/ui/) — do not hand-edit; install via `npx shadcn@latest add <component>`.
- Theme uses CSS variables (`--background`, `--foreground`, `--muted`, `--border`, etc.) — all components must use these, not hardcoded Tailwind colour classes like `bg-slate-900`.
- Tailwind alias `@/` → `src/` (configured in `tsconfig.app.json`).
- Toasts: always use `successToast` / `dangerToast` helpers from `src/lib/utils.ts` — not raw `toast()`.
- Tables: use `GenericTable` for TanStack-powered tables; plain `<Table>` (shadcn) for simpler read-only displays.
- Current user in page components: `getCachedUser()` from `src/lib/utils.ts` — reads from localStorage cache set by `appRoutes.tsx` after auth resolution.

---

## Key Patterns to Know

1. **Auth state is in `appRoutes.tsx`**, not a context provider. `currentUser` is passed as prop to `PrivateRoute`. Don't look for an `AuthContext`.
2. **Role is cached in localStorage**, not derived from the JWT. Set before redirect after login so sidebar and routes resolve correctly.
3. **Two Firebase app instances**: `app` (Auth + Firestore) and `firebaseStorageApp` (Storage only). Use the right util file — importing from the wrong one uses the wrong Firebase project.
4. **Date format**: attendance dates always use `'en-CA'` locale string (`YYYY-MM-DD`) before any Firestore write or query.
5. **Teacher's `classes` field** is `{ id, isAttendanceMarkedForToday, completed }[]` — not a plain string array like Student's `classes: string[]`.
6. **`batchWrite`** requires an explicit `id` for `update` and `delete` operations; `set` without an `id` auto-generates one.
7. **Student `faceImages`** is an optional `string[]` of Firebase Storage URLs. Adding more photos improves face recognition accuracy because `FaceMatcher` evaluates all descriptors per label.
8. **No Supabase** — all file storage is Firebase Storage via `firebaseStorageUtils.ts` using the `core-sfh` project credentials.

---

## Dev Commands

```bash
npm run dev       # Start Vite dev server (http://localhost:5173)
npm run build     # Production build → /dist
npm run preview   # Preview production build
npm run lint      # ESLint check
```
