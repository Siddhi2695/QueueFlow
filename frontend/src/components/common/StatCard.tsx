import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  color?: 'indigo' | 'emerald' | 'amber' | 'rose' | 'blue' | 'purple';
}

const colorMap = {
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400',
    border: 'border-slate-200/80 dark:border-slate-800',
  },
  emerald: {
    bg: 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400',
    border: 'border-slate-200/80 dark:border-slate-800',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400',
    border: 'border-slate-200/80 dark:border-slate-800',
  },
  rose: {
    bg: 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400',
    border: 'border-slate-200/80 dark:border-slate-800',
  },
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400',
    border: 'border-slate-200/80 dark:border-slate-800',
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400',
    border: 'border-slate-200/80 dark:border-slate-800',
  },
};

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'indigo',
}) => {
  const styles = colorMap[color];

  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-2xl p-6 border ${styles.border} shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl ${styles.bg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          {value}
        </h3>
        {subtitle && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
};

