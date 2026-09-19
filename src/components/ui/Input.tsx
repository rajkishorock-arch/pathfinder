import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, leftIcon, rightIcon, id, className = '', ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || `input-${generatedId}`;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    const ariaDescribedBy = [
      error ? errorId : null,
      helperText ? helperId : null,
    ]
      .filter(Boolean)
      .join(' ') || undefined;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-slate-700 mb-1.5">
            {label}
            {props.required && <span className="text-rose-600 ml-1" aria-hidden="true">*</span>}
          </label>
        )}
        <div className="relative rounded-md shadow-xs">
          {leftIcon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            aria-invalid={Boolean(error)}
            aria-describedby={ariaDescribedBy}
            className={`w-full min-h-[44px] px-3.5 py-2.5 bg-white border text-slate-900 text-sm rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed ${
              leftIcon ? 'pl-10' : ''
            } ${rightIcon ? 'pr-10' : ''} ${
              error ? 'border-rose-500 focus:ring-rose-500 focus:border-rose-500' : 'border-slate-300'
            } ${className}`}
            {...props}
          />
          {rightIcon && (
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              {rightIcon}
            </div>
          )}
        </div>
        {error ? (
          <p id={errorId} className="mt-1.5 text-xs text-rose-600 font-medium" role="alert">
            {error}
          </p>
        ) : helperText ? (
          <p id={helperId} className="mt-1.5 text-xs text-slate-500">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = 'Input';
