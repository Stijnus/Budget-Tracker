import {
  LogOut,
  Settings as SettingsIcon,
  HelpCircle,
  Search,
  User,
  Moon,
  Sun,
  Keyboard,
  Menu,
} from "lucide-react";
import { useAuth } from "../../../state/useAuth";
// Language provider import removed
import { useTheme } from "../../../providers/themeUtils";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { QuickAddMenu } from "../QuickAddMenu";
import { ThemeToggle } from "../ThemeToggle";
// Language selector import removed
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useState, useEffect, KeyboardEvent, FormEvent } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { NotificationCenter } from "../notifications/NotificationCenter";

export function Navbar() {
  const { user, logout } = useAuth();
  // Language hooks removed
  const { theme, setTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;

    if (path === "/dashboard") return "Dashboard";
    if (path === "/transactions") return "Transactions";
    if (path === "/expenses") return "Expenses";
    if (path === "/income") return "Income";
    if (path === "/categories") return "Categories";
    if (path === "/bills") return "Bills";
    if (path === "/budgets") return "Budgets";
    if (path === "/accounts") return "Accounts";
    if (path === "/groups") return "Groups";
    if (path === "/goals") return "Goals";
    if (path === "/analytics") return "Analytics";
    if (path === "/settings") return "Settings";
    if (path === "/tags") return "Tags";

    // For detail pages
    if (path.includes("/transactions/")) return "Transactions";
    if (path.includes("/expenses/")) return "Expenses";
    if (path.includes("/income/")) return "Income";
    if (path.includes("/categories/")) return "Categories";
    if (path.includes("/bills/")) return "Bills";
    if (path.includes("/budgets/")) return "Budgets";
    if (path.includes("/goals/")) return "Goals";
    if (path.includes("/tags/")) return "Tags";

    return "Name";
  };

  // Setup keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Command/Ctrl + K to open search
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsSearchOpen(true);
      }

      // Escape to close search
      if (e.key === "Escape" && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown as unknown as EventListener
    );
    return () =>
      window.removeEventListener(
        "keydown",
        handleKeyDown as unknown as EventListener
      );
  }, [isSearchOpen]);

  // Handle search query submission
  const handleSearch = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // Navigate to search results page with query parameter
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchOpen(false);
      setSearchQuery("");
    }
  };

  return (
    <>
      <header className="bg-background border-b shadow-sm h-16 sticky top-0 z-30">
        <div className="flex items-center justify-between h-full px-4 md:px-6">
          {/* Left side - Title based on current page and mobile menu toggle */}
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-muted-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu size={18} />
            </Button>
            <h1 className="text-xl font-semibold">{getPageTitle()}</h1>
          </div>

          {/* Right side - Actions and user menu */}
          <div className="flex items-center space-x-2">
            {/* Search */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground"
                    onClick={() => setIsSearchOpen(true)}
                  >
                    <Search size={18} />
                    <span className="sr-only">{"Search"}</span>
                    <kbd className="ml-2 hidden md:inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100">
                      <span className="text-xs">⌘</span>K
                    </kbd>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{"Search"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Quick Add Menu */}
            <QuickAddMenu />

            {/* Help */}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hidden md:flex"
                  >
                    <HelpCircle size={18} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{"Help"}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Language Selector removed */}

            {/* Notifications - Updated to use the new component */}
            <NotificationCenter />

            {/* User menu */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user?.user_metadata?.avatar_url}
                        alt="User"
                      />
                      <AvatarFallback className="bg-primary/10">
                        {user?.user_metadata?.full_name
                          ? user.user_metadata.full_name.charAt(0).toUpperCase()
                          : user.email?.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium leading-none">
                      {user?.user_metadata?.full_name || "User"}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />

                  {/* Profile */}
                  <DropdownMenuItem asChild>
                    <Link
                      to="/settings/profile"
                      className="flex w-full cursor-pointer items-center"
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>{"Profile"}</span>
                    </Link>
                  </DropdownMenuItem>

                  {/* Settings */}
                  <DropdownMenuItem asChild>
                    <Link
                      to="/settings"
                      className="flex w-full cursor-pointer items-center"
                    >
                      <SettingsIcon className="mr-2 h-4 w-4" />
                      <span>{"Settings"}</span>
                    </Link>
                  </DropdownMenuItem>

                  {/* Keyboard Shortcuts */}
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      // Implement keyboard shortcuts modal
                      // TODO: Add keyboard shortcuts modal
                    }}
                  >
                    <Keyboard className="mr-2 h-4 w-4" />
                    <span>{"KeyboardShortcuts"}</span>
                  </DropdownMenuItem>

                  {/* Theme Toggle */}
                  <DropdownMenuItem
                    onClick={() =>
                      setTheme(theme === "dark" ? "light" : "dark")
                    }
                    className="cursor-pointer"
                  >
                    {theme === "dark" ? (
                      <Sun className="mr-2 h-4 w-4" />
                    ) : (
                      <Moon className="mr-2 h-4 w-4" />
                    )}
                    <span>{theme === "dark" ? "LightMode" : "DarkMode"}</span>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  {/* Logout */}
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="cursor-pointer text-destructive focus:text-destructive"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>{"Logout"}</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button asChild variant="outline" size="sm">
                <Link to="/login">{"Login"}</Link>
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Search Dialog */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{"Search"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex items-center border rounded-md px-3 py-2">
              <Search className="h-4 w-4 text-muted-foreground mr-2" />
              <Input
                type="text"
                placeholder={"SearchPlaceholder"}
                className="border-0 p-0 shadow-none focus-visible:ring-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                autoFocus
              />
            </div>
            <div className="flex justify-between">
              <div className="flex gap-2">
                <Badge variant="outline">{"Transactions"}</Badge>
                <Badge variant="outline">{"Categories"}</Badge>
                <Badge variant="outline">{"Tags"}</Badge>
              </div>
              <Button type="submit" size="sm">
                {"Search"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
