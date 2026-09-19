import React from 'react';
import { Loader2 } from 'lucide-react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      className = '',
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed select-none min-h-[44px] cursor-pointer';

    const variantStyles = {
      primary:
        'bg-indigo-600 hover:bg-indigo-700 text-white focus-visible:ring-indigo-600 shadow-xs border border-transparent',
      secondary:
        'bg-slate-900 hover:bg-slate-800 text-white focus-visible:ring-slate-900 shadow-xs border border-transparent',
      outline:
        'border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 focus-visible:ring-indigo-600 shadow-xs',
      ghost:
        'bg-transparent hover:bg-slate-100 text-slate-700 hover:text-slate-900 focus-visible:ring-indigo-600',
      danger:
        'bg-rose-600 hover:bg-rose-700 text-white focus-visible:ring-rose-600 shadow-xs border border-transparent',
    };

    const sizeStyles = {
      sm: 'px-3.5 py-2 text-sm min-h-[38px]',
      md: 'px-4 py-2.5 text-sm min-h-[44px]',
      lg: 'px-6 py-3.5 text-base min-h-[48px]',
    };

    const isButtonDisabled = disabled || isLoading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isButtonDisabled}
        aria-disabled={isButtonDisabled}
        className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 mr-2 animate-spin text-current" aria-hidden="true" />
        ) : leftIcon ? (
          <span className="mr-2 inline-flex items-center" aria-hidden="true">
            {leftIcon}
          </span>
        ) : null}
        <span>{children}</span>
        {!isLoading && rightIcon && (
          <span className="ml-2 inline-flex items-center" aria-hidden="true">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';
