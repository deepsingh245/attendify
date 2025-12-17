import { clsx, type ClassValue } from "clsx"
import { toast } from "sonner";
import { twMerge } from "tailwind-merge"
import { LOCAL_STORAGE_KEYS } from "@/constants/constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parse cached user from localStorage
 * @param userEmail - Optional email fallback if parsing fails
 * @returns Parsed user object with role, name, userName, or null
 */
export const getCachedUser = (userEmail?: string | null) => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEYS.USER);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as {
      id: string;
      role?: string;
      name?: string;
      userName?: string;
      email?: string;
    } | null;

    if (!parsed || !parsed.role) return null;

    const role = parsed.role as "admin" | "teacher" | "student";

    const displayName =
      parsed.name ||
      parsed.userName ||
      parsed.email ||
      userEmail ||
      "User";

    return {
      ...parsed, // keep original fields
      role,
      displayName,
    };
  } catch (err) {
    console.error("Error fetching cached user:", err);
    return null;
  }
};


/**
 * Get cached user role from localStorage
 * @returns Role string ('admin', 'teacher', 'student') or null
 */
export const getCachedUserRole = () => {
  try {
    return localStorage.getItem(LOCAL_STORAGE_KEYS.ROLE) as 'admin' | 'teacher' | 'student' | null;
  } catch (e) {
    console.error('Error reading cached role from localStorage:', e);
    return null;
  }
};

export const dangerToast = (message: string, options?: { position?: "top-center" | "top-left" | "top-right" | "bottom-center" | "bottom-left" | "bottom-right" }) => {
  toast.error(message, {
    position: "top-center",
    richColors: true,
    ...options,
  });
};

export const successToast = (message: string, options?: { position?: "top-center" | "top-left" | "top-right" | "bottom-center" | "bottom-left" | "bottom-right" }) => {
  toast.success(message, {
    position: "top-center",
    richColors: true,
    ...options,
  });
};

export const infoToast = (message: string, options?: { position?: "top-center" | "top-left" | "top-right" | "bottom-center" | "bottom-left" | "bottom-right" }) => {
  toast.info(message, {
    position: "top-center",
    richColors: true,
    ...options,
  });
};

export const warningToast = (message: string, options?: { position?: "top-center" | "top-left" | "top-right" | "bottom-center" | "bottom-left" | "bottom-right" }) => {
  toast.warning(message, {
    position: "top-center",
    richColors: true,
    ...options,
  });
};