import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  AlertTriangle,
  BarChart3,
  Building2,
  Users,
  Search,
  CheckCircle2,
  Clock,
  LogOut,
  X,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import emblemOfIndiaGold from '../assets/emblem_of_india_gold.svg';

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const getRoleLinks = () => {
    if (!user) return [];

    if (user.role === 'admin') {
      return [
        { label: 'Control Center', path: '/admin', icon: LayoutDashboard },
        { label: 'All Complaints', path: '/admin/complaints', icon: FileText },
        { label: 'Overdue & Escalations', path: '/admin/overdue', icon: AlertTriangle },
        { label: 'Analytics & SLA', path: '/admin/analytics', icon: BarChart3 },
        { label: 'Departments', path: '/admin/departments', icon: Building2 },
        { label: 'Users Directory', path: '/admin/users', icon: Users },
      ];
    }

    if (user.role === 'official') {
      return [
        { label: 'Assigned Work orders', path: '/official', icon: LayoutDashboard },
        { label: 'Public Accountability', path: '/public-dashboard', icon: BarChart3 },
        { label: 'Track Case', path: '/track', icon: Search },
      ];
    }

    // Citizen
    return [
      { label: 'My Grievances', path: '/citizen', icon: LayoutDashboard },
      { label: 'Report New Issue', path: '/submit-complaint', icon: PlusCircle, highlight: true },
      { label: 'Track Any Case', path: '/track', icon: Search },
      { label: 'Public Accountability', path: '/public-dashboard', icon: BarChart3 },
    ];
  };

  const links = getRoleLinks();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#14243A] text-slate-300 flex flex-col border-r border-slate-800 transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between h-16 px-6 border-b border-slate-800/80 bg-[#0F1C2E]">
          <NavLink to="/" className="flex items-center gap-2.5">
            <img
              src={emblemOfIndiaGold}
              alt="State Emblem of India"
              className="h-9 w-auto object-contain filter drop-shadow-xs shrink-0"
            />
            <div>
              <span className="font-black text-lg text-white tracking-wider">JANSETU</span>
              <span className="block text-[9px] uppercase tracking-wider text-slate-400 font-medium">
                Civic Management
              </span>
            </div>
          </NavLink>
          <button
            type="button"
            onClick={onClose}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="px-5 py-4 border-b border-slate-800 bg-slate-900/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-slate-700 text-white font-bold flex items-center justify-center uppercase text-sm border border-slate-600">
              {user?.name ? user.name[0] : 'U'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-white truncate">{user?.name}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-[11px] uppercase tracking-wider font-mono text-slate-400">
                  {user?.role === 'admin'
                    ? 'Municipal Admin'
                    : user?.role === 'official'
                    ? user?.department?.name || 'Dept Official'
                    : 'Citizen Account'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.path === '/admin' || link.path === '/citizen' || link.path === '/official'}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition ${
                  isActive
                    ? 'bg-[#245B8F] text-white font-semibold shadow-xs'
                    : link.highlight
                    ? 'bg-red-950/40 text-red-300 hover:bg-red-900/50 border border-red-800/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`
              }
            >
              <link.icon className="w-4 h-4 shrink-0" />
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Bottom sign out */}
        <div className="p-3 border-t border-slate-800">
          <button
            type="button"
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-400 hover:text-red-300 hover:bg-red-950/30 transition"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>
    </>
  );
};
