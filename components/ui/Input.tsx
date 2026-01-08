'use client';

import { InputHTMLAttributes, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, hint, id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-semibold text-[#38362d] mb-2 tracking-tight"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {label}
            {props.required && (
              <span className="text-[#ef6a27] ml-0.5">*</span>
            )}
          </label>
        )}
        <div className="relative">
          <input
            ref={ref}
            id={inputId}
            className={`
              w-full px-4 py-3 rounded-[10px]
              bg-white text-[#38362d] placeholder-[#a8a29e]
              border-2 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
              ${error
                ? 'border-[#ef4444] focus:border-[#ef4444] focus:ring-4 focus:ring-[#ef4444]/10'
                : 'border-[#e7e5e4] hover:border-[#d6d3d1] focus:border-[#ef6a27] focus:ring-4 focus:ring-[#ef6a27]/10'
              }
              focus:outline-none
              disabled:bg-[#f5f5f4] disabled:cursor-not-allowed disabled:opacity-60
              ${className}
            `}
            {...props}
          />
          {/* Focus glow effect */}
          <div
            className={`
              absolute inset-0 rounded-[10px] pointer-events-none
              transition-opacity duration-300
              ${error
                ? 'shadow-[0_0_0_4px_rgba(239,68,68,0.1)]'
                : 'shadow-[0_0_0_4px_rgba(239,106,39,0.1)]'
              }
              opacity-0 peer-focus:opacity-100
            `}
          />
        </div>
        {hint && !error && (
          <p className="mt-2 text-xs text-[#78716c] flex items-center gap-1">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="opacity-60"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 16v-4M12 8h.01" />
            </svg>
            {hint}
          </p>
        )}
        {error && (
          <p className="mt-2 text-xs text-[#ef4444] flex items-center gap-1 animate-fade-in">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4M12 16h.01" />
            </svg>
            {error}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
