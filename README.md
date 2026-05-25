# Attendify — Smart Attendance Management System

A comprehensive attendance management system built with **React**, **TypeScript**, **Firebase**, and **face recognition** (face-api.js). Three distinct user roles — Admin, Teacher, and Student — each with a full dashboard.

---

## Features

- **Multi-role authentication** — Admin, Teacher, Student (email/password via Firebase Auth)
- **Face recognition attendance** — upload a class photo, faces are detected and matched to students automatically
- **Multi-image training** — store multiple face photos per student for higher recognition accuracy
- **Real-time Firestore** — all attendance records sync instantly
- **Full student portal** — overview, attendance chart, timetable, class cards, history table, profile
- **Admin dashboard** — manage students, teachers, classes; view system-wide analytics
- **Teacher dashboard** — mark attendance manually or via face recognition; per-class stats
- **Light / dark / system theme** — persisted across sessions
- **Responsive UI** — Tailwind CSS with shadcn/ui

---

## System Architecture

```
Firebase Auth (attendify-3)  ←→  Firestore (attendify-3)  ←→  Firebase Storage (core-sfh)
        ↑                                 ↑                              ↑
   Login / session              Students, teachers,               Profile pictures
   resolution                  classes, attendance                + face photos
```

---

## User Roles

### Admin
- View system-wide attendance overview and charts
- Manage students (create, edit, view attendance history)
- Manage teachers and class assignments
- Add multiple face recognition photos per student
- Manage support tickets

### Teacher
- Overview of assigned classes with attendance stats
- Mark attendance: manual or via face recognition (photo upload)
- View per-class and per-student attendance history

### Student
- **Overview** — attendance rate, days present/absent, recent records, class info
- **Attendance** — monthly stat cards + 6-month bar chart + day-by-day list
- **Timetable** — weekly schedule derived from class assignment
- **My Classes** — per-class attendance rate with colour-coded progress rings
- **History** — paginated table of all records, filterable by month and status
- **Profile** — update personal details and profile photo

---

## Project Structure

```
src/
├── App.tsx                          # Root: BrowserRouter + ThemeProvider + Toaster
├── appRoutes.tsx                    # All routes + auth resolution (onAuthStateChanged)
│
├── firebase/
│   ├── firebaseUtils.ts             # Core Firestore CRUD + batch + query builder
│   ├── firebaseStorageUtils.ts      # Firebase Storage upload/get/delete (separate app)
│   ├── studentUtils.ts              # Student CRUD
│   ├── teachersUtils.ts             # Teacher + class CRUD
│   ├── adminUtils.ts                # Admin + class CRUD
│   ├── AttendanceUtils.ts           # Attendance read/write (single + bulk)
│   └── interfaces/user.interface.ts # All TypeScript interfaces
│
├── services/
│   └── face-api.service.ts          # Face recognition: load models, descriptors, match
│
├── components/
│   ├── layout/                      # AppLayout, AppSidebar, Navbar
│   ├── shared/                      # StatCard, GenericTable, DropdownButton
│   ├── charts/                      # BarChart, AreaChart (Recharts wrappers)
│   ├── modals/                      # AddUserModal, SelectAttendanceMethodModal
│   └── ui/                          # shadcn/ui primitives
│
├── features/
│   ├── dashboard/admin/             # AdminOverview, teachers, classes, students, tickets
│   ├── dashboard/teacher/           # TeacherOverView, ClassDetail, faceDetection
│   └── dashboard/student/           # StudentOverview, StudentAttendance, StudentTimetable,
│                                    # StudentClasses, StudentAttendanceHistory, StudentList
│
└── pages/                           # LoginPage, SignUp, NotFoundPage
```

---

## Routes

```
/login                      → LoginPage          (public)
/signup                     → SignUp             (public)
/                           → RoleBasedHome (redirects by role)

/admin                      → AdminOverview      (admin only)
/admin/teachers             → TeachersList
/admin/teachers/:id         → AdminTeacherDetail
/admin/classes              → ClassList
/admin/classes/:id          → AdminClassDetail
/admin/students             → StudentList
/admin/students/:id         → AdminStudentDetail
/admin/tickets              → TicketsList
/admin/profile              → ProfilePage

/teacher                    → TeacherOverView    (teacher only)
/teacher/class/:id          → TeacherClassOverview
/teacher/class/:id/attendance → ClassDetail (face recognition)
/teacher/profile            → ProfilePage

/student                    → StudentOverview    (student only)
/student/attendance         → StudentAttendance
/student/timetable          → StudentTimetable
/student/classes            → StudentClasses
/student/attendance-history → StudentAttendanceHistory
/student/profile            → ProfilePage
```

---

## Data Models

```typescript
interface Student {
  id: string
  userName: string
  email: string
  role: 'student'
  classes: string[]            // class IDs enrolled
  classId: string              // primary class
  rollNo: number
  profilePictureUrl?: string
  faceImages?: string[]        // extra face photos for recognition
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface Teacher {
  id: string
  userName: string
  email: string
  role: 'teacher'
  subject: string
  classes: { id: string; isAttendanceMarkedForToday: boolean; completed: boolean }[]
  profilePictureUrl?: string
  isActive: boolean
}

interface Class {
  id: string
  className: string
  teacherId: string
  students: string[]
}

interface AttendanceRecord {
  studentId: string
  classId: string
  date: string                 // "YYYY-MM-DD"
  status: 'Present' | 'Absent' | 'Leave' | 'Late'
}
```

---

## Face Recognition

The system uses **face-api.js** (TensorFlow.js) with three pre-trained models stored in `/public/models/`:
- **SSD MobileNetv1** — face detection
- **Face Landmark 68** — facial feature points
- **Face Recognition Net** — 128-dimension face descriptors for matching

### Flow

1. Teacher opens a class and selects "Take Attendance → Face Recognition"
2. Teacher uploads a group classroom photo
3. System loads models from `/public/models/`
4. For each student with a photo, all available images (`profilePictureUrl` + `faceImages[]`) are fetched as same-origin blobs and processed into descriptors
5. A `FaceMatcher` (threshold 0.55) is built from all descriptors
6. All faces in the uploaded photo are detected and matched
7. Matched students get colour-coded boxes (green ≥60%, amber 40–60%, red = unknown) with confidence %
8. Confirmed matches are submitted as "Present" attendance records

### Multi-Image Recognition

Adding extra face photos to a student (via Admin → Student Detail → Face Recognition Photos) improves accuracy. Each image yields an additional descriptor; face-api's `FaceMatcher` uses all descriptors for a label and picks the closest distance match.

### CORS Requirement

Firebase Storage must have CORS configured to allow `fetch()` from the browser:
```json
[{ "origin": ["*"], "method": ["GET"], "maxAgeSeconds": 3600 }]
```

---

## Firebase Storage Paths

```
attendify/students/{id}/profile.jpg          ← profile picture
attendify/students/{id}/faces/face_{ts}.jpg  ← face recognition photos
attendify/teachers/{id}/profile.jpg
attendify/admin/{id}/profile.jpg
```

---

## Environment Variables

Create a `.env` file in the project root:

```env
# Primary app — Auth + Firestore
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=

# Secondary app — Firebase Storage (separate project for image storage)
VITE_FIREBASE_CORE_API_KEY=
VITE_FIREBASE_CORE_AUTH_DOMAIN=
VITE_FIREBASE_CORE_PROJECT_ID=
VITE_FIREBASE_CORE_BUCKET=
VITE_FIREBASE_CORE_MESSAGING_SENDER_ID=
VITE_FIREBASE_CORE_APP_ID=
```

---

## Getting Started

```bash
# 1. Clone
git clone https://github.com/deepsingh245/Attendify.git
cd Attendify

# 2. Install dependencies
npm install

# 3. Create .env with your Firebase credentials (see above)

# 4. Start dev server
npm run dev

# 5. Production build
npm run build
```

---

## Dev Commands

```bash
npm run dev       # Vite dev server
npm run build     # Production build → /dist
npm run preview   # Preview production build locally
npm run lint      # ESLint
```

---

## Security

- Firebase Auth email/password — no credentials stored client-side
- Role-based route guards (`PrivateRoute` checks `user.role` vs `allowedRoles[]`)
- Role persisted in `localStorage` — cleared on logout
- Two isolated Firebase app instances — Auth/Firestore and Storage cannot cross-contaminate

---

**Made with ❤️ by Deep Singh**
