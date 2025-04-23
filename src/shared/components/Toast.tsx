import { Toaster } from "@/components/ui/toaster";
import { useTheme } from "../../providers/ThemeProvider";

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const { theme } = useTheme();
  
  return (
    <>
      {children}
      <Toaster />
    </>
  );
}
