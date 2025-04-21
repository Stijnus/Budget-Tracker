import { Bell, User } from "lucide-react";
import { useAuth } from "../../../state/useAuth";
import { Link } from "react-router-dom";

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between h-16 px-4 md:px-6">
        {/* Left side - Title based on current page */}
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
        </div>

        {/* Right side - User menu and notifications */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <button className="p-2 text-gray-500 rounded-full hover:bg-gray-100">
            <Bell size={20} />
          </button>

          {/* User menu */}
          {user ? (
            <div className="relative group">
              <button className="flex items-center space-x-2 focus:outline-none">
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                  <User size={20} className="text-gray-500" />
                </div>
                <span className="hidden md:block text-sm font-medium text-gray-700">
                  {user?.user_metadata?.full_name || user?.email}
                </span>
              </button>

              {/* Dropdown menu */}
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 hidden group-hover:block">
                <Link
                  to="/settings"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Settings
                </Link>
                <button
                  onClick={() => logout()}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
