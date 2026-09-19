import React from 'react';

export interface ProgressBarProps {
  value: number; // 0 to 100
  label?: string;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  color?: 'indigo' | 'emerald' | 'amber';
  className?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  label,
  showPercentage = true,
  size = 'md',
  color = 'indigo',
  className = '',
}) => {
  const normalizedValue = Math.min(100, Math.max(0, value));

  const heightStyles = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const colorStyles = {
    indigo: 'bg-indigo-600',
    emerald: 'bg-emerald-600',
    amber: 'bg-amber-600',
  };

  return (
    <div className={`w-full ${className}`}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center text-xs font-medium text-slate-700 mb-1.5">
          <span>{label}</span>
          {showPercentage && <span>{Math.round(normalizedValue)}%</span>}
        </div>
      )}
      <div
        className={`w-full bg-slate-200 rounded-full overflow-hidden ${heightStyles[size]}`}
        role="progressbar"
        aria-valuenow={normalizedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label || 'Progress'}
      >
        <div
          className={`${heightStyles[size]} ${colorStyles[color]} transition-all duration-300 ease-out rounded-full`}
          style={{ width: `${normalizedValue}%` }}
        />
      </div>
    </div>
  );
};
