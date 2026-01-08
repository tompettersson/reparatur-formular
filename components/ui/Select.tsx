'use client';

import { SelectHTMLAttributes, forwardRef } from 'react';

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  hint?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, hint, options, placeholder, id, ...props }, ref) => {
    const selectId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={selectId}
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
          <select
            ref={ref}
            id={selectId}
            className={`
              w-full px-4 py-3 rounded-[10px]
              bg-white text-[#38362d]
              border-2 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
              appearance-none cursor-pointer
              ${error
                ? 'border-[#ef4444] focus:border-[#ef4444] focus:ring-4 focus:ring-[#ef4444]/10'
                : 'border-[#e7e5e4] hover:border-[#d6d3d1] focus:border-[#ef6a27] focus:ring-4 focus:ring-[#ef6a27]/10'
              }
              focus:outline-none
              disabled:bg-[#f5f5f4] disabled:cursor-not-allowed disabled:opacity-60
              pr-12
              ${className}
            `}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {/* Custom dropdown icon */}
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#78716c]">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
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

Select.displayName = 'Select';
