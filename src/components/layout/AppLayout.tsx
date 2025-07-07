// AppLayout.tsx
import { Outlet } from 'react-router-dom';
import { Sidebar, SidebarProvider, SidebarTrigger } from '../ui/sidebar';
import NavBar from './Navbar';

const AppLayout = () => {
  return (
    <div className="flex h-screen w-full">
     <SidebarProvider>
      <Sidebar />
      <main>
        <SidebarTrigger />
         <div className="flex flex-col">
        <NavBar />
        <main className="overflow-y-auto p-4 bg-gray-100">
          <Outlet />
        </main>
      </div>
      </main>
    </SidebarProvider>
     
    </div>
  );
};

export default AppLayout;