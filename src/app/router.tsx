import { Route, Routes } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import LoginPage from '@/pages/LoginPage';
import Home from '@/pages/Home';
import SignUp from '@/pages/SignUp';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/app" element={<AppLayout />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignUp />} />
    </Routes>
  );
}