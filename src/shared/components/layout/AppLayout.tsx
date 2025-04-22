import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";

interface AppLayoutProps {
  children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <Sidebar />

      {/* Main content */}
      <div className="flex flex-col flex-1 md:ml-64">
        {/* Navbar */}
        <Navbar />

        {/* Main content area */}
        <div className="flex-1 flex flex-col min-h-[calc(100vh-4rem)]">
          <main className="flex-1 p-4 md:p-6">{children}</main>

          {/* Footer */}
          <Footer />
        </div>
      </div>
    </div>
  );
}
