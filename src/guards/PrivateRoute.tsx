
import { Admin, Student, Teacher } from '@/firebase/interfaces/user.interface';
import { Navigate, Outlet } from 'react-router-dom';

// Checks if user is authenticated
const PrivateRoute = ({
  user,
  allowedRoles,
  resolving,
}: {
  user?: Student | Admin | Teacher | null;
  allowedRoles: string[];
  resolving?: boolean;
}) => {
  // If currently resolving auth/role, don't redirect yet — let the parent show a loader
  if (resolving) return null;

  // If not authenticated, send to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If user exists but role not allowed, send to unauthorized
  const role = (user as unknown as Record<string, unknown>)?.role as string | undefined;
  if (!role || !allowedRoles.includes(role)) return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
};

export default PrivateRoute;