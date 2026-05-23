import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import AppRoutes from './appRoutes';
import { ThemeProvider } from './components/theme-provider';
import { Toaster } from 'sonner';

// createBrowserRouter (a "data router") is required for useBlocker and other
// data-router APIs used inside the app.  AppRoutes still uses <Routes>/<Route>
// internally which works fine as a descendant of a data router.
const router = createBrowserRouter([
  { path: '*', element: <AppShell /> },
]);

function AppShell() {
  return (
    <ThemeProvider>
      <AppRoutes />
      <Toaster />
    </ThemeProvider>
  );
}

export default function App() {
  return <RouterProvider router={router} />;
}
