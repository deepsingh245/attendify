import { Button } from "../ui/button";
import { ArrowLeftIcon, Bell, MessageSquare } from "lucide-react";
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
import { useNavigate } from "react-router-dom";
import { SearchBar } from "../ui/searchbar";
// useState intentionally omitted for now

const NavBar = () => {
  const navigate = useNavigate();
 
  const raw = typeof window !== 'undefined' ? localStorage.getItem('user') : null
  let initials = 'A'
  try {
    if (raw) {
      const parsed = JSON.parse(raw)
      const name = parsed?.userName || parsed?.name || parsed?.email
      if (name) initials = String(name).charAt(0).toUpperCase()
    }
  } catch {
    /* ignore */
  }
  const logoutHandler = () => { 
    logout();
    console.log("Logout clicked");
  }
  return (
    <div className="w-full px-4 py-2 light:bg-white border-b light:border-gray-200 flex items-center justify-between gap-4 k:bg-gray-900 dark:border-gray-700">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeftIcon />
        </Button>
         <Breadcrumps />
      </div>

      

      {/* Right actions */}
      <div className="flex items-center gap-3">
      {/* Center search */}
      <SearchBar button={false} />
        <DropdownMenu>
           <DropdownMenuTrigger>
            <div className="p-2 rounded-md hover:bg-gray-100"><Bell className="h-5 w-5 text-gray-600" /></div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>No Notifications</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger>
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">{initials}</div>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={logoutHandler}>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default NavBar;
