import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { ScrollArea } from "@/components/ui/scroll-area";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Navbar */}
        <Navbar />

        {/* Main content area */}
        <ScrollArea className="flex-1">
          <main className="p-4 md:p-6">{children}</main>
        </ScrollArea>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  );
}
