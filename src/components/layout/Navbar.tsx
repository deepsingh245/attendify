import { Button } from "../ui/button";
import { Settings } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SidebarTrigger } from "../ui/sidebar";
import Breadcrumps from "./Breadcrumps";

const NavBar = () => {
  
  return (
    <div className="w-full px-4 py-2 bg-white border-b border-gray-200 h-[50px] flex items-center gap-4 dark:bg-gray-900 dark:border-gray-700">
      <SidebarTrigger />
          <Breadcrumps />
      <div className="flex-1 flex justify-end">
        <div className="flex items-center gap-4">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div className="h-7 w-px bg-gray-200"></div>
          <Button
            variant="outline"
            size="icon"
            onClick={(e) => {
              e.preventDefault();
              console.log("clicked");
            }}
          >
            <Settings />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NavBar;
