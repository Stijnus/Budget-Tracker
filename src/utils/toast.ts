import { toast } from "@/hooks/use-toast";
// Translations loader import removed
import { ToastActionElement } from "@/components/ui/toast";

type ToastType = "success" | "error" | "info" | "warning";
type ToastVariant = "default" | "destructive"; // Match the actual variants from toast component

interface ToastOptions {
  type?: ToastType;
  title?: string;
  description?: string;
  action?: ToastActionElement;
  duration?: number;
}

// Map toast types to variants
const typeToVariant: Record<ToastType, ToastVariant> = {
  success: "default",
  error: "destructive",
  info: "default",
  warning: "default",
};

// Map toast types to CSS classes for custom styling
const typeToClassName: Record<ToastType, string> = {
  success:
    "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800",
  error: "", // Uses the destructive variant
  info: "bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800",
  warning:
    "bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800",
};

/**
 * Show a toast notification with translation support
 */
export function showToast(options: ToastOptions) {
  const { type = "success", title, description, action, duration } = options;

  return toast({
    variant: typeToVariant[type],
    className: typeToClassName[type],
    title: title,
    description: description,
    action: action,
    duration: duration,
  });
}

/**
 * Show a success toast for item creation
 */
export function showItemCreatedToast(itemType: string) {
  return showToast({
    type: "success",
    title: "Success",
    description: `${itemType} created successfully`,
    duration: 3000,
  });
}

/**
 * Show a success toast for item update
 */
export function showItemUpdatedToast(itemType: string) {
  return showToast({
    type: "success",
    title: "Success",
    description: `${itemType} updated successfully`,
    duration: 3000,
  });
}

/**
 * Show a success toast for item deletion
 */
export function showItemDeletedToast(itemType: string) {
  return showToast({
    type: "success",
    title: "Success",
    description: `${itemType} deleted successfully`,
    duration: 3000,
  });
}

/**
 * Show an error toast
 */
export function showErrorToast(message?: string) {
  return showToast({
    type: "error",
    title: "Error",
    description: message || "Something went wrong",
    duration: 5000,
  });
}
