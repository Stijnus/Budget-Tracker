import {
  Bell,
  LogOut,
  Settings as SettingsIcon,
  HelpCircle,
  Search,
  User,
} from "lucide-react";
import { useAuth } from "../../../state/useAuth";
import { Link } from "react-router-dom";
import { QuickAddMenu } from "../QuickAddMenu";
import { ThemeToggle } from "../ThemeToggle";
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

  return (
    <header className="bg-background border-b shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Left side - Title based on current page */}
        <div>
          <h1 className="text-xl font-semibold">Dashboard</h1>
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
                <p>Search</p>
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
                <p>Help</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Theme Toggle */}
          <ThemeToggle />
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
                <p>Notifications</p>
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
                <DropdownMenuItem asChild>
                  <Link
                    to="/settings"
                    className="flex w-full cursor-pointer items-center"
                  >
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => logout()}
                  className="cursor-pointer"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button asChild variant="outline" size="sm">
              <Link to="/login">Login</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
