'use client';

import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const LoadingSpinner = () => (
  <svg
    className="animate-spin h-5 w-5"
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
  >
    <circle
      className="opacity-25"
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="4"
    />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
    />
  </svg>
);

const ArrowRight = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="transition-transform group-hover:translate-x-1"
  >
    <path d="M5 12h14M12 5l7 7-7 7" />
  </svg>
);

const ArrowLeft = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="transition-transform group-hover:-translate-x-1"
  >
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className = '',
      variant = 'primary',
      size = 'md',
      loading,
      icon,
      iconPosition = 'right',
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const baseStyles = `
      group relative inline-flex items-center justify-center gap-2
      font-semibold rounded-[10px] border-none cursor-pointer
      transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
      disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
      focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2
    `;

    const variants = {
      primary: `
        bg-[#ef6a27]
        text-white
        shadow-[0_2px_4px_rgba(239,106,39,0.2)]
        hover:bg-[#dc5a1a] hover:shadow-[0_4px_8px_rgba(239,106,39,0.25)]
        active:bg-[#c2410c] active:shadow-[0_1px_2px_rgba(239,106,39,0.2)]
        focus-visible:ring-[#ef6a27]/30
      `,
      secondary: `
        bg-[#3ca1ac]
        text-white
        shadow-[0_2px_4px_rgba(60,161,172,0.2)]
        hover:bg-[#329299] hover:shadow-[0_4px_8px_rgba(60,161,172,0.25)]
        active:bg-[#287f88]
        focus-visible:ring-[#3ca1ac]/30
      `,
      outline: `
        bg-transparent
        border-2 border-[#d6d3d1]
        text-[#38362d]
        hover:border-[#ef6a27] hover:text-[#ef6a27] hover:bg-[#fff7ed]
        focus-visible:ring-[#ef6a27]/20
      `,
      ghost: `
        bg-transparent
        text-[#78716c]
        hover:bg-[#f5f5f4] hover:text-[#38362d]
        focus-visible:ring-[#78716c]/20
      `,
    };

    const sizes = {
      sm: 'px-4 py-2 text-sm',
      md: 'px-6 py-3 text-base',
      lg: 'px-8 py-4 text-lg',
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || loading}
        {...props}
      >
        {/* Gradient overlay for hover effect */}
        <span
          className="absolute inset-0 rounded-[10px] bg-gradient-to-b from-white/15 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          aria-hidden="true"
        />

        {/* Content */}
        <span className="relative flex items-center gap-2">
          {loading ? (
            <>
              <LoadingSpinner />
              <span>Wird geladen...</span>
            </>
          ) : (
            <>
              {icon && iconPosition === 'left' && icon}
              {children}
              {icon && iconPosition === 'right' && icon}
            </>
          )}
        </span>
      </button>
    );
  }
);

Button.displayName = 'Button';

// Export arrow icons for convenience
export { ArrowRight, ArrowLeft };
