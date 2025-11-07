import React, { useEffect, useState } from 'react';
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
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
// ...existing code...
import { Link } from "react-router-dom";

import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { getTeacherById } from '@/firebase/teachersUtils';
import { getStudentById } from '@/firebase/studentUtils';

import { User, Shield, GraduationCap } from "lucide-react";

export function AppSidebar({ ...props }) {
  const { state } = useSidebar();
  const [role, setRole] = useState<'admin' | 'teacher' | 'student' | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);

  useEffect(() => {
    const auth = getAuth();
    console.log("🚀 ~ AppSidebar ~ auth:", auth)
    const unsub = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setRole(null);
        setDisplayName(null);
        return;
      }

      // Try teacher
      try {
        const t = await getTeacherById(user.uid);
        if (t) {
          setRole('teacher');
          setDisplayName(t.userName || user.displayName || user.email || 'Teacher');
          return;
        }
      } catch (e) {
        console.error('Error checking teacher:', e);
      }

      try {
        const s = await getStudentById(user.uid);
        if (s) {
          setRole('student');
          setDisplayName(s.userName || user.displayName || user.email || 'Student');
          return;
        }
      } catch (e) {
        console.error('Error checking student:', e);
      }

      // Fallback: unknown role (maybe admin stored elsewhere). Keep null.
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
      { path: '/admin/students', label: 'Students', icon: User },
    ];
  } else if (role === 'teacher') {
    menuRoutes = [
      { path: '/teacher', label: 'Overview', icon: GraduationCap },
      { path: '/teacher/class', label: 'Classes', icon: GraduationCap },
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
      <SidebarHeader>
        <div className="flex items-center justify-between w-full">
          {state === 'collapsed' ? (
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-emerald-500 text-white flex items-center justify-center font-bold">{displayName ? displayName.charAt(0).toUpperCase() : 'A'}</div>
          ) : (
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-emerald-500 text-white flex items-center justify-center font-bold">{displayName ? displayName.charAt(0).toUpperCase() : 'A'}</div>
                <div className="flex flex-col">
                  <span className="font-semibold">{displayName ?? 'Attendify'}</span>
                  <span className="text-xs text-muted-foreground">{role ? role.charAt(0).toUpperCase() + role.slice(1) : 'Guest'}</span>
                </div>
              </div>
              <SidebarTrigger />
            </div>
          )}
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuRoutes.map((route) => {
                const to = route.path;
                const Icon = route.icon;
                return (
                  <SidebarMenuItem key={to}>
                    <SidebarMenuButton asChild tooltip={route.label}>
                      <Link to={to} className="flex items-center gap-2">
                        <Icon />
                        <span>{route.label}</span>
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
      <SidebarFooter>
        {state === 'collapsed' ? (
          <span className="text-xs">A</span>
        ) : (
          <span className="text-xs">© 2025 Attendify</span>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}
