import React from 'react';
import {
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  UserCheck,
  Search,
  Wrench,
  ShieldCheck,
} from 'lucide-react';

export const StatusBadge = ({ status, size = 'md' }) => {
  const normalized = (status || '').toUpperCase();

  const configs = {
    SUBMITTED: {
      bg: 'bg-slate-100 text-slate-800 border-slate-300',
      icon: Search,
      label: 'Submitted',
    },
    'UNDER REVIEW': {
      bg: 'bg-amber-50 text-amber-900 border-amber-300 font-semibold',
      icon: Clock,
      label: 'Under Review',
    },
    ASSIGNED: {
      bg: 'bg-blue-50 text-blue-900 border-blue-300 font-semibold',
      icon: UserCheck,
      label: 'Assigned to Dept',
    },
    'IN PROGRESS': {
      bg: 'bg-sky-50 text-sky-900 border-sky-300 font-semibold',
      icon: Wrench,
      label: 'Work in Progress',
    },
    'RESOLUTION SUBMITTED': {
      bg: 'bg-indigo-50 text-indigo-900 border-indigo-300 font-semibold',
      icon: CheckCircle2,
      label: 'Resolution Submitted',
    },
    'CITIZEN VERIFICATION': {
      bg: 'bg-amber-100 text-amber-950 border-amber-400 font-bold',
      icon: ShieldCheck,
      label: 'Awaiting Citizen Sign-off',
    },
    RESOLVED: {
      bg: 'bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold',
      icon: CheckCircle2,
      label: 'Resolved & Verified',
    },
    REOPENED: {
      bg: 'bg-red-50 text-red-900 border-red-300 font-bold',
      icon: RotateCcw,
      label: 'Disputed & Reopened',
    },
  };

  const config = configs[normalized] || {
    bg: 'bg-slate-100 text-slate-800 border-slate-300',
    icon: Clock,
    label: status || 'Pending',
  };

  const Icon = config.icon;
  const sizeClasses =
    size === 'sm'
      ? 'px-2 py-0.5 text-[11px]'
      : size === 'lg'
      ? 'px-3 py-1.5 text-xs font-bold'
      : 'px-2.5 py-1 text-xs font-semibold';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border ${config.bg} ${sizeClasses} shadow-[0_1px_2px_rgba(0,0,0,0.04)]`}
    >
      <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5 stroke-[2]'} />
      <span>{config.label}</span>
    </span>
  );
};
