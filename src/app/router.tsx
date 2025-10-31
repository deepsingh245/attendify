import { Route, Routes } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import AdminOverview from '@/features/dashboard/admin/AdminOverview';
import TeacherClasses from '@/features/dashboard/teacher/TeacherClasses';
import StudentOverview from '@/features/dashboard/student/StudentOverview';
import LoginPage from '@/pages/LoginPage';
import SignUp from '@/pages/SignUp';
import TeacherOverView from '@/features/dashboard/teacher/TeacherOverView';

export default function AppRoutes() {
  return (
     <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUp />} />

      <Route element={<AppLayout />}>
        <Route path="/" element={<StudentOverview />} />
        <Route path="/admin" element={<AdminOverview />} />
        <Route path="/teacher" element={<TeacherOverView />} />
        <Route path="/teacher/class/:id" element={<TeacherClasses />} />
        <Route path="/student" element={<StudentOverview />} />
      </Route>
    </Routes>
  );
}