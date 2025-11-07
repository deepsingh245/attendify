import { Route, Routes, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import PrivateRoute from '@/guards/PrivateRoute';
import AppLayout from '@/components/layout/AppLayout';
import AdminOverview from '@/features/dashboard/admin/AdminOverview';
import TeacherClasses from '@/features/dashboard/teacher/TeacherClasses';
import StudentOverview from '@/features/dashboard/student/StudentOverview';
import LoginPage from '@/pages/LoginPage';
import SignUp from '@/pages/SignUp';
import TeacherOverView from '@/features/dashboard/teacher/TeacherOverView';
import { getTeacherById } from '@/firebase/teachersUtils';
import { getStudentById } from '@/firebase/studentUtils';
import { Teacher, Student, Admin } from '@/firebase/interfaces/user.interface';
import { teachersData } from '@/features/dashboard/teacher/teachersData';

export default function AppRoutes() {
  // Resolve the authenticated user (teacher or student) once and share across the routes
  const [currentUser, setCurrentUser] = useState<Teacher | Student | Admin | null>(null);
  const [resolvingUser, setResolvingUser] = useState(true);

  useEffect(() => {
    const auth = getAuth();
    console.log("🚀 ~ AppRoutes ~ auth:", auth)
    const unsub = onAuthStateChanged(auth, async (user) => {
      console.log("🚀 ~ AppRoutes ~ user:", user)
      if (!user) {
        setCurrentUser(null);
        setResolvingUser(false);
        return;
      }

      try {
        // Try teacher collection first (teachers or admins stored here)
        const teacher = await getTeacherById(user.uid);
        if (teacher) {
          setCurrentUser(teacher);
          setResolvingUser(false);
          return;
        }

        // Fallback to student
        const student = await getStudentById(user.uid);
        if (student) {
          setCurrentUser(student);
          setResolvingUser(false);
          return;
        }

        // Provide in-memory dummy users for guest accounts so role-based routing works
        if (user.email === 'guestteacher@attendify.ar') {
          setCurrentUser(teachersData.teachers[1]);
          return;
        }
  // debug: resolved a guest teacher fallback

        if (user.email === "guestadmin@attendify.ar") {
          setCurrentUser({
            id: "ghuestAdmin@attendify.ar",
            userName: "Guest Admin",
            email: "ghuestAdmin@attendify.ar",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            role: "admin",
            profilePictureUrl: "",
            lastLogin: "",
            isActive: true,
            settings: {
              theme: "dark",
              notifications: true,
            },
          });
          return;
        }

        if (user.email === 'gueststudent@attendify.ar') {
          setCurrentUser({
            id: 'gueststudent@attendify.ar',
            userName: 'Guest Student',
            email: 'gueststudent@attendify.ar',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            role: 'student',
            classes: ['guest-class'],
            profilePictureUrl: '',
            lastLogin: '',
            isActive: true,
            settings: {
              theme: 'dark',
              notifications: true,
            },
            // student-specific fields
            rollNo: 0,
            classId: 'guest-class',
          });
          return;
        }
        } catch (err) {
        console.error('Error resolving current user:', err);
        setCurrentUser(null);
      } finally {
        setResolvingUser(false);
      }
    });

    return () => unsub();
  }, []);

  // Component to redirect the root/unknown routes to a role-based home using resolved currentUser
  function RoleBasedHome() {
    if (resolvingUser) return null;
    if (!currentUser) return <Navigate to="/login" replace />;
    // If user has role field, use it. Teacher objects may be used for admin as well depending on data.
  const role = (currentUser as Record<string, unknown> | null)?.role as string | undefined;
  if (role === 'teacher') return <Navigate to="/teacher" replace />;
  if (role === 'student') return <Navigate to="/student" replace />;
    // fallback
    return <Navigate to="/" replace />;
  }
  // Build menuRoutes mapping (used by sidebar/navigation elsewhere)
  // Note: this is example mapping; routes here must be protected below using PrivateRoute
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUp />} />

      <Route element={<AppLayout />}>
        {/* send root to a dynamic role-based home */}
        <Route path="/" element={<RoleBasedHome />} />

        {/* Admin routes - guarded */}
  <Route element={<PrivateRoute user={currentUser} allowedRoles={["admin"]} resolving={resolvingUser} />}>
          <Route path="/admin" element={<AdminOverview />} />
          <Route path="/admin/teachers" element={<AdminOverview />} />
          <Route path="/admin/classes" element={<AdminOverview />} />
          <Route path="/admin/students" element={<AdminOverview />} />
        </Route>

        {/* Teacher routes - guarded */}
  <Route element={<PrivateRoute user={currentUser} allowedRoles={["teacher"]} resolving={resolvingUser} />}>
          <Route path="/teacher" element={<TeacherOverView />} />
          <Route path="/teacher/class" element={<Navigate to="/teacher" replace />} />
          <Route path="/teacher/class/:id" element={<TeacherClasses />} />
          <Route path="/teacher/profile" element={<TeacherOverView />} />
        </Route>

        {/* Student routes - guarded */}
  <Route element={<PrivateRoute user={currentUser} allowedRoles={["student"]} resolving={resolvingUser} />}>
          <Route path="/student" element={<StudentOverview />} />
          <Route path="/student/classes" element={<StudentOverview />} />
          <Route path="/student/profile" element={<StudentOverview />} />
        </Route>

        {/* catch-all unknown routes and send users to their role home */}
        <Route path="*" element={<RoleBasedHome />} />
      </Route>
    </Routes>
  );
}