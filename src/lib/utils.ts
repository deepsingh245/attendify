import { clsx, type ClassValue } from "clsx"
import { toast } from "sonner";
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

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