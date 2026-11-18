import React from 'react';
import { Menu, Home, ExternalLink, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { NotificationPopover } from './NotificationPopover';

export const TopHeader = ({ onMenuClick, title }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 h-16 flex items-center justify-between px-4 sm:px-6 shadow-xs">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
          aria-label="Open sidebar"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            title="Public Homepage"
            className="hidden sm:flex items-center text-slate-400 hover:text-slate-600 transition"
          >
            <Home className="w-4 h-4" />
          </Link>
          <span className="hidden sm:inline text-slate-300">/</span>
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            {title || 'Dashboard'}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notification Bell */}
        <NotificationPopover />

        <div className="h-6 w-px bg-slate-200" />

        {/* User identification */}
        <div className="flex items-center gap-2.5">
          <div className="hidden sm:block text-right">
            <p className="text-xs font-semibold text-slate-800 leading-tight">{user?.name}</p>
            <p className="text-[10px] text-slate-500 uppercase font-mono tracking-wider">
              {user?.role}
            </p>
          </div>
          <div className="w-8 h-8 rounded-full bg-[#245B8F] text-white flex items-center justify-center font-bold text-xs uppercase shadow-xs">
            {user?.name ? user.name[0] : 'U'}
          </div>
        </div>
      </div>
    </header>
  );
};
