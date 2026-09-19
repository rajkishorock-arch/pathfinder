import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Compass, LayoutDashboard, Target, CheckSquare, User, LogOut } from 'lucide-react';
import { useAuth } from '@/features/auth';

export const DashboardLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { name: 'Roadmap', href: '/dashboard/roadmap', icon: <Target className="w-5 h-5" /> },
    { name: 'Tasks', href: '/dashboard/tasks', icon: <CheckSquare className="w-5 h-5" /> },
    { name: 'Profile', href: '/dashboard/profile', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2 font-bold text-slate-900 text-lg">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Compass className="w-5 h-5" />
              </div>
              <span>Pathfinder</span>
            </Link>

            {/* Main Navigation Tabs */}
            <nav className="hidden md:flex space-x-1" aria-label="Dashboard tabs">
              {navItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg transition-colors min-h-[40px] ${
                      isActive
                        ? 'bg-indigo-50 text-indigo-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }`}
                  >
                    {item.icon}
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* User Status / Logout */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-slate-900">
                {user?.name || 'Student'}
              </span>
              <span className="text-xs text-slate-500">{user?.email || 'user@example.com'}</span>
            </div>
            <button
              type="button"
              onClick={logout}
              className="text-slate-500 hover:text-slate-700 p-2 rounded-lg border border-slate-200 hover:bg-slate-50 min-h-[40px] min-w-[40px] flex items-center justify-center"
              title="Log out"
              aria-label="Log out of account"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
    </div>
  );
};
