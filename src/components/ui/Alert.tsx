import React from 'react';
import { AlertCircle, CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';

export interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({
  type = 'info',
  title,
  children,
  onClose,
  className = '',
}) => {
  const typeConfig = {
    info: {
      bg: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: <Info className="w-5 h-5 text-blue-600 shrink-0" aria-hidden="true" />,
    },
    success: {
      bg: 'bg-emerald-50 border-emerald-200 text-emerald-800',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" aria-hidden="true" />,
    },
    warning: {
      bg: 'bg-amber-50 border-amber-200 text-amber-800',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" aria-hidden="true" />,
    },
    error: {
      bg: 'bg-rose-50 border-rose-200 text-rose-800',
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" aria-hidden="true" />,
    },
  };

  const config = typeConfig[type];

  return (
    <div
      role="alert"
      className={`p-4 border rounded-lg flex items-start gap-3 ${config.bg} ${className}`}
    >
      {config.icon}
      <div className="flex-1 text-sm">
        {title && <h4 className="font-semibold mb-1">{title}</h4>}
        <div>{children}</div>
      </div>
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 rounded-md p-1 min-h-[32px] min-w-[32px] inline-flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
          aria-label="Close alert"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};
