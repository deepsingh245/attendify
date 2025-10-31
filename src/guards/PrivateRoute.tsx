
import { Navigate, Outlet } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

// Checks if user is authenticated
const PrivateRoute = () => {
  const auth = getAuth();
  const user = auth.currentUser;

  // You can add more logic here for role-based access if needed
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
};

export default PrivateRoute;