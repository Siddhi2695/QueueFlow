import React from 'react';
import { TokenStatus, QueueStatus } from '../../types';

interface BadgeProps {
  status: TokenStatus | QueueStatus | string;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  const getStyles = () => {
    switch (status) {
      case 'Waiting':
        return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60';
      case 'Serving':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60 animate-pulse';
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60';
      case 'Cancelled':
        return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60';
      case 'active':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60';
      case 'closed':
        return 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  const getDotColor = () => {
    switch (status) {
      case 'Waiting':
        return 'bg-amber-500';
      case 'Serving':
        return 'bg-indigo-600';
      case 'Completed':
        return 'bg-emerald-500';
      case 'Cancelled':
        return 'bg-rose-500';
      case 'active':
        return 'bg-emerald-500';
      case 'closed':
        return 'bg-slate-400';
      default:
        return 'bg-slate-400';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-all ${getStyles()} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${getDotColor()}`} />
      {status === 'active' ? 'Active' : status === 'closed' ? 'Closed' : status}
    </span>
  );
};

