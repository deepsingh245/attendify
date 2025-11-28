import React, { useEffect, useState } from 'react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarRail,
  
  useSidebar,
} from "@/components/ui/sidebar";
// ...existing code...
import { Link, useLocation } from "react-router-dom";

import { getAuth, onAuthStateChanged } from 'firebase/auth';

import { User, Shield, GraduationCap, Ticket, User2Icon } from "lucide-react";
import { getCachedUser } from "@/lib/utils";

export function AppSidebar({ ...props }) {
  const { state } = useSidebar();
  const location = useLocation();
  const pathname = location.pathname;
  const [role, setRole] = useState<'admin' | 'teacher' | 'student' | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setRole(null);
        setDisplayName(null);
        return;
      }

      // Prefer a cached user object written by the router/ login flow.
      // This avoids extra Firestore reads and keeps the sidebar snappy.
      const cachedUser = getCachedUser(user.email);
      if (cachedUser) {
        setRole(cachedUser.role as 'admin' | 'teacher' | 'student');
        setDisplayName(cachedUser.displayName);
        return;
      }

      // Fallback: use auth profile info (no role available)
      setRole(null);
      setDisplayName(user.displayName || user.email || 'User');
    });

    return () => unsub();
  }, []);

  // Build role-specific routes
  let menuRoutes: { path: string; label: string; icon: React.ComponentType<React.SVGProps<SVGSVGElement>> }[] = [];
  if (role === 'admin') {
    menuRoutes = [
      { path: '/admin', label: 'Overview', icon: Shield },
      { path: '/admin/teachers', label: 'Teachers', icon: User },
      { path: '/admin/classes', label: 'Classes', icon: GraduationCap },
      { path: '/admin/students', label: 'Students', icon: User2Icon },
      { path: '/admin/tickets', label: 'Tickets', icon: Ticket },
    ];
  } else if (role === 'teacher') {
    menuRoutes = [
      { path: '/teacher', label: 'Overview', icon: GraduationCap },
      // { path: '/teacher/class', label: 'Classes', icon: GraduationCap },
      { path: '/teacher/profile', label: 'Profile', icon: User },
    ];
  } else if (role === 'student') {
    menuRoutes = [
      { path: '/student', label: 'Overview', icon: User },
      { path: '/student/classes', label: 'My Classes', icon: GraduationCap },
      { path: '/student/profile', label: 'Profile', icon: User },
    ];
  } else {
    // fallback show top-level
    menuRoutes = [
      { path: '/admin', label: 'Admin', icon: Shield },
      { path: '/teacher', label: 'Teacher', icon: GraduationCap },
      { path: '/student', label: 'Student', icon: User },
    ];
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* Dark left rail with compact icon-only mode when collapsed */}
      <SidebarHeader>
        <div className="flex items-center justify-center w-full py-4">
          {state === 'collapsed' ? (
            <div className="h-10 w-10 rounded-full bg-white/10 text-white flex items-center justify-center font-bold">{displayName ? displayName.charAt(0).toUpperCase() : 'A'}</div>
          ) : (
            <div className="flex items-center gap-3 px-3 w-full">
              <div className="h-10 w-10 rounded-lg bg-white/10 text-white flex items-center justify-center font-bold">{displayName ? displayName.charAt(0).toUpperCase() : 'A'}</div>
              <div className="flex flex-col">
                <span className="font-semibold text-white">{displayName ?? 'Attendify'}</span>
                <span className="text-xs text-white/70">{role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Guest'}</span>
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent className=" text-white flex-1">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1 px-2">
              {menuRoutes.map((route) => {
                const to = route.path;
                const Icon = route.icon;
                // determine active state: exact or nested route
                const isActive = pathname === to;
                return (
                  <SidebarMenuItem key={to} className={`py-1 rounded-md ${isActive ? 'bg-white/10' : ''}`}>
                    <SidebarMenuButton asChild tooltip={route.label}>
                      <Link to={to} className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors w-full text-sm ${isActive ? 'text-white font-semibold' : 'text-white/90 hover:bg-white/5'}`}>
                        <Icon className="h-5 w-5" />
                        {state !== 'collapsed' && <span className="truncate">{route.label}</span>}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarRail />
      <SidebarFooter className="px-3 py-4">
        <div className="w-full">
          <button
            className="w-full flex items-center gap-3 px-3 py-2 rounded-md bg-white/5 hover:bg-white/10 text-white text-sm"
            onClick={() => {
              // perform logout and clear cached role/user
              try {
                localStorage.removeItem('attendify_role');
                localStorage.removeItem('user');
              } catch {
                // ignore
              }
              // navigate to login via full reload to clear any auth state
              window.location.href = '/login';
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7"/></svg>
            {state !== 'collapsed' && <span>Log Out</span>}
          </button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
