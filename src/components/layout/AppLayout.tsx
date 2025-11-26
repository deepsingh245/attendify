import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import NavBar from './Navbar';
const AppLayout = ({ children }: { children?: React.ReactNode }) => {
  return (
    <SidebarProvider defaultOpen={false}>
      <div className="flex h-screen w-full">
        <AppSidebar />
        <div className="flex flex-col flex-1 min-w-0">
          <NavBar />
          <main className="overflow-y-auto p-2 sm:p-4 md:p-6 h-full w-full">
            {children ? children : <Outlet />}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default AppLayout;