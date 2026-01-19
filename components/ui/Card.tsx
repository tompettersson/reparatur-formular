'use client';

import { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  variant?: 'default' | 'elevated' | 'bordered';
}

export function Card({
  children,
  title,
  subtitle,
  icon,
  variant = 'default',
  className = '',
  ...props
}: CardProps) {
  const variants = {
    default: 'bg-white shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_6px_-1px_rgba(0,0,0,0.07),0_2px_4px_-1px_rgba(0,0,0,0.04)]',
    elevated: 'bg-white shadow-[0_10px_15px_-3px_rgba(0,0,0,0.08),0_4px_6px_-2px_rgba(0,0,0,0.04)] hover:shadow-[0_20px_25px_-5px_rgba(0,0,0,0.08),0_10px_10px_-5px_rgba(0,0,0,0.03)] hover:-translate-y-0.5',
    bordered: 'bg-white border-2 border-[#e7e5e4] hover:border-[#d6d3d1]',
  };

  return (
    <div
      className={`
        rounded-[16px] p-6
        border border-black/[0.03]
        transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
        ${variants[variant]}
        ${className}
      `}
      {...props}
    >
      {(title || subtitle || icon) && (
        <div className="flex items-start gap-4 mb-5 pb-5 border-b border-[#f5f5f4]">
          {icon && (
            <div className="flex-shrink-0 w-12 h-12 rounded-[12px] bg-[#fff7ed] flex items-center justify-center text-[#ef6a27]">
              {icon}
            </div>
          )}
          <div className="flex-1 min-w-0">
            {title && (
              <h3
                className="text-lg font-bold text-[#38362d] tracking-tight"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="text-sm text-[#78716c] mt-0.5">{subtitle}</p>
            )}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
