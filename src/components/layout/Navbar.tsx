import { Button } from "../ui/button";
import { ArrowLeftIcon, Bell, Menu } from "lucide-react";
import Breadcrumps from "./Breadcrumps";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { logout } from "@/firebase/firebaseUtils";
import { useNavigate, useLocation } from "react-router-dom";
import { useSidebar } from "@/components/ui/sidebar";
import { getCachedUser, getCachedUserRole } from "@/lib/utils";
// useState intentionally omitted for now

const NavBar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleSidebar } = useSidebar();

  const isHomePage = () => {
    const pathname = location.pathname;
    return pathname === '/admin' || pathname === '/teacher' || pathname === '/student';
  };

  const handleBackNavigation = () => {
    navigate(-1);
  };
 
  const cachedUser = getCachedUser();
  const role = getCachedUserRole();
  const initials = cachedUser?.displayName?.charAt(0).toUpperCase() || 'A';
  const logoutHandler = () => { 
    logout();
    console.log("Logout clicked");
  }
  const handleProfileClick = () => {
    if (role === 'admin') navigate('/admin/profile')
    else if (role === 'teacher') navigate('/teacher/profile')
    else if (role === 'student') navigate('/student/profile')
  }
  return (
    <div className="w-full px-2 sm:px-4 py-2 light:bg-white border-b light:border-gray-200 flex items-center justify-between gap-2 sm:gap-4 k:bg-gray-900 dark:border-gray-700">
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        <Button variant="outline" size="icon" onClick={() => toggleSidebar()} className="h-8 w-8 sm:h-10 sm:w-10 md:hidden">
          <Menu className="h-4 w-4" />
        </Button>
        {!isHomePage() && (
          <Button variant="outline" size="icon" onClick={handleBackNavigation} className="h-8 w-8 sm:h-10 sm:w-10">
            <ArrowLeftIcon className="h-4 w-4" />
          </Button>
        )}
         <div className="hidden sm:block"><Breadcrumps /></div>
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 sm:gap-3">
      {/* Hide search on mobile */}
      {/* <div className="hidden md:block">
        <SearchBar button={false} />
      </div> */}
        <DropdownMenu>
           <DropdownMenuTrigger>
            <div className="p-2 rounded-md hover:bg-gray-100"><Bell className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" /></div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>No Notifications</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="h-8 w-8 rounded-full bg-gray-700 flex items-center justify-center text-sm font-medium">{initials}</div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleProfileClick}>Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={logoutHandler}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default NavBar;
