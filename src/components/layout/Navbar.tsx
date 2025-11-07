import { Button } from "../ui/button";
import { ArrowLeftIcon, Settings } from "lucide-react";
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

const NavBar = () => {
  const today = new Date();
  const logoutHandler = () => {
    logout();
    console.log("Logout clicked");
  }
  return (
    <div className="w-full px-4 py-2 bg-white border-b border-gray-200 h-[50px] flex items-center gap-4 dark:bg-gray-900 dark:border-gray-700">
      <Button variant="outline" size="icon">
        <ArrowLeftIcon />
      </Button>
      <Breadcrumps />
      <div className="flex-1 flex justify-end">
        <div className="flex items-center gap-4">
          <div className="flex">
            {today.toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <div className="h-7 w-px bg-gray-200"></div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Settings className="h-5 w-5" />
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
    </div>
  );
};

export default NavBar;
