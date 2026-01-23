'use client';

import { InputHTMLAttributes, forwardRef, ReactNode } from 'react';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: ReactNode; // Akzeptiert String oder JSX (z.B. Links)
  error?: string;
  description?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className = '', label, error, description, id, ...props }, ref) => {
    const checkboxId = id || props.name;

    return (
      <div className="group">
        <label
          htmlFor={checkboxId}
          className={`
            flex items-start gap-3 cursor-pointer
            p-3 -m-3 rounded-[12px]
            transition-colors duration-200
            hover:bg-[#fafaf9]
            ${error ? 'bg-[#fee2e2]/50' : ''}
          `}
        >
          <div className="relative flex items-center justify-center flex-shrink-0 mt-0.5">
            <input
              ref={ref}
              id={checkboxId}
              type="checkbox"
              className={`
                peer appearance-none
                w-[22px] h-[22px] rounded-[6px]
                border-2 transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]
                cursor-pointer
                ${error
                  ? 'border-[#ef4444]'
                  : 'border-[#d6d3d1] hover:border-[#a8a29e] checked:border-transparent'
                }
                checked:bg-[#ef6a27]
                focus:outline-none focus:ring-4 focus:ring-[#ef6a27]/10
                ${className}
              `}
              {...props}
            />
            {/* Checkmark */}
            <svg
              className="absolute w-3.5 h-3.5 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity duration-200"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M5 12l5 5L20 7" />
            </svg>
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm text-[#38362d] leading-snug">
              {label}
              {props.required && (
                <span className="text-[#ef6a27] ml-0.5">*</span>
              )}
            </span>
            {description && (
              <p className="text-xs text-[#78716c] mt-1">{description}</p>
            )}
            {error && (
              <p className="mt-1.5 text-xs text-[#ef4444] flex items-center gap-1 animate-fade-in">
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
        </label>
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';
