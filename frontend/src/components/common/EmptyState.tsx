import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon = Inbox,
  title,
  description,
  actionText,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-900/50 rounded-2xl border border-slate-200/80 dark:border-slate-800 ${className}`}
    >
      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 text-slate-400 dark:text-slate-500 mb-4">
        <Icon className="w-8 h-8" />
      </div>
      <h4 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
        {title}
      </h4>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mb-5">
        {description}
      </p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 rounded-xl shadow-sm transition-all shadow-indigo-200 dark:shadow-none"
        >
          {actionText}
        </button>
      )}
    </div>
  );
};

