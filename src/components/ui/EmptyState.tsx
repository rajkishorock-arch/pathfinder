import React from 'react';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      className={`text-center py-12 px-6 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 ${className}`}
    >
      {icon && (
        <div className="mx-auto w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-base font-semibold text-slate-900 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mx-auto mb-6">{description}</p>
      {action && <div className="inline-flex justify-center">{action}</div>}
    </div>
  );
};
