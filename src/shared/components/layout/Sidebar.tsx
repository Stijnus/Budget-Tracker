import { useState } from "react";
import { useLanguage } from "../../../providers/LanguageProvider";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  LayoutDashboard,
  ArrowDownCircle,
  ArrowUpCircle,
  PieChart,
  Calendar,
  Target,
  BarChart3,
  Clock,
  Settings,
  Menu,
  Tag,
} from "lucide-react";

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { t } = useLanguage();

  // No longer needed with Sheet component
  // const toggleSidebar = () => {
  //   setIsOpen(!isOpen);
  // };

  const navItems = [
    {
      name: t("nav.dashboard"),
      path: "/dashboard",
      icon: <LayoutDashboard size={20} />,
    },
    {
      name: t("nav.expenses"),
      path: "/expenses",
      icon: <ArrowDownCircle size={20} />,
    },
    {
      name: t("nav.income"),
      path: "/income",
      icon: <ArrowUpCircle size={20} />,
    },
    {
      name: t("nav.categories"),
      path: "/categories",
      icon: <PieChart size={20} />,
    },
    { name: t("nav.budgets"), path: "/budgets", icon: <Calendar size={20} /> },
    { name: t("nav.tags"), path: "/tags", icon: <Tag size={20} /> },
    { name: t("nav.goals"), path: "/goals", icon: <Target size={20} /> },
    {
      name: t("nav.analytics"),
      path: "/analytics",
      icon: <BarChart3 size={20} />,
    },
    {
      name: t("nav.bills"),
      path: "/bills",
      icon: <Clock size={20} />,
    },
    {
      name: t("nav.settings"),
      path: "/settings",
      icon: <Settings size={20} />,
    },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild className="md:hidden">
          <Button
            variant="outline"
            size="icon"
            className="fixed top-4 left-4 z-50 md:hidden bg-background shadow-md"
          >
            <Menu size={20} />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <MobileSidebar
            navItems={navItems}
            pathname={location.pathname}
            onClose={() => setIsOpen(false)}
            t={t}
          />
        </SheetContent>
      </Sheet>

      {/* Desktop Sidebar */}
      <aside className="hidden md:block fixed inset-y-0 left-0 z-40 w-64 border-r bg-background shadow-sm">
        <DesktopSidebar
          navItems={navItems}
          pathname={location.pathname}
          t={t}
        />
      </aside>
    </>
  );
}

interface SidebarProps {
  navItems: {
    name: string;
    path: string;
    icon: JSX.Element;
  }[];
  pathname: string;
  onClose?: () => void;
  t: (key: string) => string;
}

function MobileSidebar({ navItems, pathname, onClose, t }: SidebarProps) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b">
        <h1 className="text-xl font-bold">{t("app.name")}</h1>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <div className="py-4">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors",
                  pathname === item.path
                    ? "bg-accent font-medium"
                    : "text-muted-foreground"
                )}
                onClick={onClose}
              >
                <span
                  className={cn(
                    "mr-3",
                    pathname === item.path
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </ScrollArea>

      {/* Version */}
      <div className="p-4 border-t text-xs text-muted-foreground">
        <p>Version 1.0.0</p>
      </div>
    </div>
  );
}

function DesktopSidebar({ navItems, pathname, t }: SidebarProps) {
  return (
    <div className="flex flex-col h-full w-full">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b">
        <h1 className="text-xl font-bold">{t("app.name")}</h1>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1">
        <div className="py-4">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-2 text-sm rounded-md hover:bg-accent transition-colors",
                  pathname === item.path
                    ? "bg-accent font-medium"
                    : "text-muted-foreground"
                )}
              >
                <span
                  className={cn(
                    "mr-3",
                    pathname === item.path
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {item.icon}
                </span>
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>
      </ScrollArea>

      {/* Version */}
      <div className="p-4 border-t text-xs text-muted-foreground">
        <p>Version 1.0.0</p>
      </div>
    </div>
  );
}
