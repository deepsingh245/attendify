import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import NavBar from './Navbar';
const AppLayout = ({ children }: { children?: React.ReactNode }) => {
  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1">
          <NavBar />
          <main className="overflow-y-auto p-4">
            {children ? children : <Outlet />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AppLayout;