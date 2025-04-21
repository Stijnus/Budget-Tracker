import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
  X 
} from 'lucide-react';

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Expenses', path: '/expenses', icon: <ArrowDownCircle size={20} /> },
    { name: 'Income', path: '/income', icon: <ArrowUpCircle size={20} /> },
    { name: 'Categories', path: '/categories', icon: <PieChart size={20} /> },
    { name: 'Budgets', path: '/budgets', icon: <Calendar size={20} /> },
    { name: 'Goals', path: '/goals', icon: <Target size={20} /> },
    { name: 'Analytics', path: '/analytics', icon: <BarChart3 size={20} /> },
    { name: 'Bills & Subscriptions', path: '/bills', icon: <Clock size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
  ];

  return (
    <>
      {/* Mobile menu button */}
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-white p-2 rounded-md shadow-md"
        onClick={toggleSidebar}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-center h-16 border-b">
            <h1 className="text-xl font-bold text-gray-800">Budget Tracker</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-4 py-3 text-gray-700 rounded-md hover:bg-gray-100 transition-colors ${
                      location.pathname === item.path ? 'bg-gray-100 font-medium' : ''
                    }`}
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="mr-3 text-gray-500">{item.icon}</span>
                    <span>{item.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Version */}
          <div className="p-4 border-t text-xs text-gray-500">
            <p>Version 1.0.0</p>
          </div>
        </div>
      </aside>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
}
