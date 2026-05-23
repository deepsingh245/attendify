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
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { logout } from "@/firebase/firebaseUtils";
import { useNavigate, useLocation } from "react-router-dom";
import { useSidebar } from "@/components/ui/sidebar";
import { getCachedUser, getCachedUserRole } from "@/lib/utils";

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
  const initials = cachedUser?.userName?.charAt(0).toUpperCase() || cachedUser?.displayName?.charAt(0).toUpperCase() || 'A';

  const logoutHandler = () => {
    logout();
  };

  const handleProfileClick = () => {
    if (role === 'admin') navigate('/admin/profile')
    else if (role === 'teacher') navigate('/teacher/profile')
    else if (role === 'student') navigate('/student/profile')
  };

  return (
    <div className="w-full px-2 sm:px-4 py-2 bg-background border-b border-border flex items-center justify-between gap-2 sm:gap-4">
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
      <div className="flex items-center gap-1 sm:gap-2">
        {/* Theme toggle */}
        <ThemeToggle />

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9">
              <Bell className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-muted-foreground">No notifications</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full p-0">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium text-muted-foreground">
                {initials}
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
