import React from 'react';
import { AlertCircle, AlertOctagon, Info, ShieldAlert } from 'lucide-react';

export const PriorityBadge = ({ level, score, showScore = false, size = 'md' }) => {
  const normalized = (level || '').toLowerCase();

  const configs = {
    critical: {
      bg: 'bg-red-50 text-red-950 border-red-300 font-bold',
      dot: 'bg-red-600',
      icon: AlertOctagon,
      label: 'Critical SLA',
    },
    high: {
      bg: 'bg-amber-50 text-amber-950 border-amber-300 font-bold',
      dot: 'bg-amber-600',
      icon: ShieldAlert,
      label: 'High SLA',
    },
    medium: {
      bg: 'bg-blue-50 text-blue-950 border-blue-300 font-semibold',
      dot: 'bg-blue-600',
      icon: AlertCircle,
      label: 'Medium SLA',
    },
    low: {
      bg: 'bg-slate-100 text-slate-800 border-slate-300 font-semibold',
      dot: 'bg-slate-500',
      icon: Info,
      label: 'Standard SLA',
    },
  };

  const config = configs[normalized] || configs.medium;

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
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
      {showScore && score !== undefined && (
        <span className="ml-1 font-mono text-[10px] bg-white/90 px-1 py-0.2 rounded border border-current/20 font-bold">
          {score} pts
        </span>
      )}
    </span>
  );
};
