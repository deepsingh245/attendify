import { Route, Routes, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import PrivateRoute from "@/guards/PrivateRoute";
import AppLayout from "@/components/layout/AppLayout";
import AdminOverview from "@/features/dashboard/admin/AdminOverview";
import AdminTeacherDetail from "@/features/dashboard/admin/teachers/AdminTeacherDetail";
import AdminClassDetail from "@/features/dashboard/admin/classes/AdminClassDetail";
import AdminStudentDetail from "@/features/dashboard/admin/students/AdminStudentDetail";
import TeacherClasses from "@/features/dashboard/teacher/TeacherClasses";
import StudentOverview from "@/features/dashboard/student/StudentOverview";
import LoginPage from "@/pages/LoginPage";
import SignUp from "@/pages/SignUp";
import TeacherOverView from "@/features/dashboard/teacher/TeacherOverView";
import { getTeacherById } from "@/firebase/teachersUtils";
import { getStudentById } from "@/firebase/studentUtils";
import { Teacher, Student, Admin } from "@/firebase/interfaces/user.interface";
import { getAdminById } from "./firebase/adminUtils";
import { toast } from "sonner";
import TeachersList from "./features/dashboard/admin/teachers/TeachersList";
import ClassList from "./features/dashboard/admin/classes/ClassList";
import StudentList from "./features/dashboard/student/StudentList";
import TicketRoute from "./features/dashboard/admin/tickets/TicketRoute";
import TicketsList from "./features/dashboard/admin/tickets/TicketsList";

export default function AppRoutes() {
  // Resolve the authenticated user (teacher or student) once and share across the routes
  const [currentUser, setCurrentUser] = useState<
    Teacher | Student | Admin | null
  >(null);
  const [resolvingUser, setResolvingUser] = useState(true);

  const setUser = (user: Admin | Teacher | Student | null) => {
    localStorage.setItem("user", JSON.stringify(user));
    setCurrentUser(user);
  };
  
  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (user) => {
      console.log("🚀 ~ AppRoutes ~ user:", user);
      if (!user) {
        setUser(null);
        setResolvingUser(false);
        return;
      }

      try {
        const roleClaim = localStorage.getItem('attendify_role') as string | null;

        if (roleClaim === "teacher") {
          const teacher = await getTeacherById(user.uid);
          if (teacher) {
            setUser(teacher);
          }
        } else if (roleClaim === "student") {
          const student = await getStudentById(user.uid);
          if (student) {
            setUser(student);
          }
        } else if (roleClaim === "admin") {
          const admin = await getAdminById(user.uid);
          if (admin) {
            setUser(admin);
          }
        }
        else{
          toast.error("User role not recognized. Please log in again.");
          setUser(null);
        }
      } catch (err) {
        console.error("Error resolving current user:", err);
        setUser(null);
      } finally {
        setResolvingUser(false);
      }
    });

    return () => unsub();
  }, []);

  // Component to redirect the root/unknown routes to a role-based home using resolved currentUser
  function RoleBasedHome() {
    const roleClaim = localStorage.getItem('attendify_role') as string | null;
    if (resolvingUser) return null;
    if (!currentUser) return <Navigate to="/login" replace />;
    // If user has role field, use it. Teacher objects may be used for admin as well depending on data.

    if (roleClaim === "admin") return <Navigate to="/admin" replace />;
    if (roleClaim === "teacher") return <Navigate to="/teacher" replace />;
    if (roleClaim === "student") return <Navigate to="/student" replace />;
    // fallback
    return <Navigate to="/" replace />;
  }
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUp />} />

      <Route element={<AppLayout />}>
        {/* send root to a dynamic role-based home */}
        <Route path="/" element={<RoleBasedHome />} />

        {/* Admin routes - guarded */}
        <Route
          element={
            <PrivateRoute
              user={currentUser}
              allowedRoles={["admin"]}
              resolving={resolvingUser}
            />
          }
        >
          <Route path="/admin" element={<AdminOverview />} />
          <Route path="/admin/teachers/" element={<TeachersList />} />
          <Route path="/admin/teachers/:id" element={<AdminTeacherDetail />} />
          <Route path="/admin/classes" element={<ClassList />} />
          <Route path="/admin/classes/:id" element={<AdminClassDetail />} />
          <Route path="/admin/students" element={<StudentList />} />
          <Route path="/admin/students/:id" element={<AdminStudentDetail />} />
          <Route path="/admin/tickets" element={<TicketsList />} />
          <Route path="/admin/tickets/:id" element={<TicketRoute />} />
        </Route>

        {/* Teacher routes - guarded */}
        <Route
          element={
            <PrivateRoute
              user={currentUser}
              allowedRoles={["teacher"]}
              resolving={resolvingUser}
            />
          }
        >
          <Route path="/teacher" element={<TeacherOverView />} />
          <Route
            path="/teacher/classes"
            element={<Navigate to="/teacher/classes" />}
          />
          <Route path="/teacher/class/:id" element={<TeacherClasses />} />
          <Route path="/teacher/profile" element={<TeacherOverView />} />
        </Route>

        {/* Student routes - guarded */}
        <Route
          element={
            <PrivateRoute
              user={currentUser}
              allowedRoles={["student"]}
              resolving={resolvingUser}
            />
          }
        >
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
