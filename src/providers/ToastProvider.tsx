import { Toaster } from "sonner";
import { useTheme } from "./themeUtils";

export function ToastProvider() {
  const { theme } = useTheme();
  
  return (
    <Toaster 
      position="top-right"
      toastOptions={{
        style: { 
          background: "var(--background)",
          color: "var(--foreground)",
          border: "1px solid var(--border)"
        },
      }}
      theme={theme === "system" ? "system" : theme as "light" | "dark"}
      closeButton
      richColors
    />
  );
}
