import { Route, Routes, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import PrivateRoute from "@/guards/PrivateRoute";
import AppLayout from "@/components/layout/AppLayout";
import AdminOverview from "@/features/dashboard/admin/AdminOverview";
import AdminTeacherDetail from "@/features/dashboard/admin/teachers/AdminTeacherDetail";
import AdminClassDetail from "@/features/dashboard/admin/classes/AdminClassDetail";
import AdminStudentDetail from "@/features/dashboard/admin/students/AdminStudentDetail";
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
import ProfilePage from "./features/profile/ProfilePage";
import ClassDetail from "./features/dashboard/teacher/ClassDetail";
import GlobalLoader from "./components/ui/global-loader";
import { LOCAL_STORAGE_KEYS } from "@/constants/constants";
import { getCachedUserRole } from "@/lib/utils";

export default function AppRoutes() {
  const [currentUser, setCurrentUser] = useState<
    Teacher | Student | Admin | null
  >(null);
  const [resolvingUser, setResolvingUser] = useState(true);

  const setUser = (user: Admin | Teacher | Student | null) => {
    localStorage.setItem("user", JSON.stringify(user));
    setCurrentUser(user);
  };
  const auth = getAuth();
  
useEffect(() => {
  setResolvingUser(true);

  const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
    if (!firebaseUser) {
      setUser(null);
      setResolvingUser(false);
      return;
    }

    try {
      const role = localStorage.getItem(LOCAL_STORAGE_KEYS.ROLE);

      let resolvedUser = null;

      switch (role) {
        case "teacher":
          resolvedUser = await getTeacherById(firebaseUser.uid);
          break;
        case "student":
          resolvedUser = await getStudentById(firebaseUser.uid);
          break;
        case "admin":
          resolvedUser = await getAdminById(firebaseUser.uid);
          break;
        default:
          toast.error("User role not recognized. Please log in again.");
      }

      setUser(resolvedUser);
    } catch (err) {
      console.error("Error resolving current user:", err);
      setUser(null);
    } finally {
      setResolvingUser(false); // <--- only AFTER async fetch finishes
    }
  });

  return () => unsub();
}, [auth]);


  function RoleBasedHome() {
    const roleClaim = getCachedUserRole();
    if (resolvingUser) return null;
    if (!currentUser) return <Navigate to="/login" replace />;
    // If user has role field, use it. Teacher objects may be used for admin as well depending on data.

    if (roleClaim === "admin") return <Navigate to="/admin" replace />;
    if (roleClaim === "teacher") return <Navigate to="/teacher" replace />;
    if (roleClaim === "student") return <Navigate to="/student" replace />;

    return <Navigate to="/" replace />;
  }

  return (
    <>
      <GlobalLoader show={resolvingUser} />
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUp />} />

      <Route element={<AppLayout />}>
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
          <Route path="/admin/profile" element={<ProfilePage />} />
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
          <Route path="/teacher/class/:id" element={<ClassDetail />} />
          <Route path="/teacher/profile" element={<ProfilePage />} />
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
          <Route path="/student/profile" element={<ProfilePage />} />
        </Route>

        {/* catch-all unknown routes and send users to their role home */}
        <Route path="*" element={<RoleBasedHome />} />
      </Route>
    </Routes>
    </>
  );
}
