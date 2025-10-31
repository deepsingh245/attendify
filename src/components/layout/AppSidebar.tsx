import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
} from "@/components/ui/sidebar";
// ...existing code...
import { Link } from "react-router-dom";


import { User, Shield, GraduationCap } from "lucide-react";

export function AppSidebar() {
  const { state } = useSidebar();
  const routes = [
    { path: '/admin', label: 'Admin', icon: Shield },
    { path: '/teacher', label: 'Teacher', icon: GraduationCap },
    { path: '/student', label: 'Student', icon: User },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        {state === "collapsed" ? (
          <span className="font-bold text-lg text-right">A</span>
        ) : (
          <span className="font-bold text-lg">Attendify</span>
        )}
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {routes.map((route) => {
                const to = route.path;
                const Icon = route.icon;
                return (
                  <SidebarMenuItem key={to}>
                    <SidebarMenuButton asChild>
                      <Link to={to}>
                        <Icon />
                        {state !== "collapsed" && <span>{route.label}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        {state !== "collapsed" && <span className="text-xs">© 2025 Attendify</span>}
      </SidebarFooter>
    </Sidebar>
  );
}
