import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  Search,
  Plus,
  BarChart3,
  User,
  LayoutDashboard,
  Shield,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const MobileBottomNav = () => {
  const { user, isAuthenticated } = useAuth();
  const location = useLocation();

  const getDashboardPath = () => {
    if (!isAuthenticated || !user) return '/login';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'official') return '/official';
    return '/citizen';
  };

  const dashboardPath = getDashboardPath();

  return (
    <nav
      aria-label="Mobile Navigation"
      className="fixed bottom-0 inset-x-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#E8EAF0] shadow-[0_-4px_24px_rgba(23,36,58,0.06)] block md:hidden transition-transform duration-200"
    >
      <div className="max-w-md mx-auto px-4 py-2 flex items-center justify-between text-[11px] font-semibold text-[#64748B]">
        {/* 1. Home */}
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              isActive ? 'text-[#8F1238] font-bold' : 'hover:text-[#17243A] active:scale-95'
            }`
          }
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </NavLink>

        {/* 2. Track */}
        <NavLink
          to="/track"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              isActive ? 'text-[#8F1238] font-bold' : 'hover:text-[#17243A] active:scale-95'
            }`
          }
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span>Track</span>
        </NavLink>

        {/* 3. Central Report Button (Raised burgundy circular button with white plus) */}
        <div className="flex-1 flex justify-center -mt-6">
          <NavLink
            to="/submit-complaint"
            className={({ isActive }) =>
              `w-14 h-14 rounded-full flex flex-col items-center justify-center text-white shadow-[0_8px_20px_rgba(143,18,56,0.35)] transition-all active:scale-90 ring-4 ring-white ${
                isActive
                  ? 'bg-[#650D2B]'
                  : 'bg-[#8F1238] hover:bg-[#650D2B]'
              }`
            }
            title="Report Civic Issue"
          >
            <Plus className="w-6 h-6 stroke-[2.6]" />
            <span className="text-[9px] font-extrabold tracking-tight -mt-0.5">Report</span>
          </NavLink>
        </div>

        {/* 4. Public SLA */}
        <NavLink
          to="/public-dashboard"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              isActive ? 'text-[#8F1238] font-bold' : 'hover:text-[#17243A] active:scale-95'
            }`
          }
        >
          <BarChart3 className="w-5 h-5 mb-0.5" />
          <span>Public SLA</span>
        </NavLink>

        {/* 5. Sign In / Account */}
        <NavLink
          to={dashboardPath}
          className={({ isActive }) =>
            `flex flex-col items-center justify-center flex-1 py-1 transition-colors ${
              isActive || (dashboardPath !== '/login' && location.pathname.startsWith(dashboardPath))
                ? 'text-[#8F1238] font-bold'
                : 'hover:text-[#17243A] active:scale-95'
            }`
          }
        >
          {isAuthenticated ? (
            user?.role === 'admin' ? (
              <Shield className="w-5 h-5 mb-0.5" />
            ) : (
              <LayoutDashboard className="w-5 h-5 mb-0.5" />
            )
          ) : (
            <User className="w-5 h-5 mb-0.5" />
          )}
          <span>{isAuthenticated ? 'Portal' : 'Sign In'}</span>
        </NavLink>
      </div>

      {/* Safe Area Inset Support */}
      <div className="h-[env(safe-area-inset-bottom,0px)]" />
    </nav>
  );
};
