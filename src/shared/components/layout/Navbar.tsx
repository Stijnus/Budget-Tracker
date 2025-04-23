import {
  Bell,
  LogOut,
  Settings as SettingsIcon,
  HelpCircle,
  Search,
  User,
  Moon,
  Sun,
} from "lucide-react";
import { useAuth } from "../../../state/useAuth";
import { useLanguage } from "../../../providers/LanguageProvider";
import { useTheme } from "../../../providers/ThemeProvider";
import { Link, useLocation } from "react-router-dom";
import { QuickAddMenu } from "../QuickAddMenu";
import { ThemeToggle } from "../ThemeToggle";
import { LanguageSelector } from "../LanguageSelector";
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

export function Navbar() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const { theme, setTheme } = useTheme();
  const location = useLocation();

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;

    if (path === "/dashboard") return t("nav.dashboard");
    if (path === "/transactions") return t("nav.transactions");
    if (path === "/expenses") return t("nav.expenses");
    if (path === "/income") return t("nav.income");
    if (path === "/categories") return t("nav.categories");
    if (path === "/bills") return t("nav.bills");
    if (path === "/budgets") return t("nav.budgets");
    if (path === "/accounts") return t("nav.accounts");
    if (path === "/groups") return t("nav.groups");
    if (path === "/goals") return t("nav.goals");
    if (path === "/analytics") return t("nav.analytics");
    if (path === "/settings") return t("nav.settings");
    if (path === "/tags") return t("nav.tags");

    // For detail pages
    if (path.includes("/transactions/")) return t("nav.transactions");
    if (path.includes("/expenses/")) return t("nav.expenses");
    if (path.includes("/income/")) return t("nav.income");
    if (path.includes("/categories/")) return t("nav.categories");
    if (path.includes("/bills/")) return t("nav.bills");
    if (path.includes("/budgets/")) return t("nav.budgets");
    if (path.includes("/goals/")) return t("nav.goals");
    if (path.includes("/tags/")) return t("nav.tags");

    return t("app.name");
  };

  return (
    <header className="bg-background border-b shadow-sm h-16 sticky top-0 z-30">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        {/* Left side - Title based on current page */}
        <div>
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
                  className="text-muted-foreground hidden md:flex"
                >
                  <Search size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("common.search")}</p>
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
                <p>{t("common.help")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* Language Selector */}
          <LanguageSelector />

          {/* Notifications */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                >
                  <Bell size={18} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{t("common.notifications")}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

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
                    to="/settings"
                    className="flex w-full cursor-pointer items-center"
                  >
                    <User className="mr-2 h-4 w-4" />
                    <span>{t("settings.profile")}</span>
                  </Link>
                </DropdownMenuItem>

                {/* Settings */}
                <DropdownMenuItem asChild>
                  <Link
                    to="/settings"
                    className="flex w-full cursor-pointer items-center"
                  >
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    <span>{t("nav.settings")}</span>
                  </Link>
                </DropdownMenuItem>

                {/* Theme Toggle */}
                <DropdownMenuItem
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="cursor-pointer"
                >
                  {theme === "dark" ? (
                    <Sun className="mr-2 h-4 w-4" />
                  ) : (
                    <Moon className="mr-2 h-4 w-4" />
                  )}
                  <span>
                    {theme === "dark"
                      ? t("common.lightMode")
                      : t("common.darkMode")}
                  </span>
                </DropdownMenuItem>

                <DropdownMenuSeparator />

                {/* Logout */}
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="cursor-pointer text-destructive focus:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t("common.logout")}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link to="/login">{t("common.login")}</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
