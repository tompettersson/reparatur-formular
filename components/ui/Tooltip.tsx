'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';

interface TooltipProps {
  content: ReactNode;
  children?: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click';
  maxWidth?: number;
}

// Info icon for standalone tooltip triggers
const InfoIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

export function Tooltip({
  content,
  children,
  position = 'top',
  trigger = 'hover',
  maxWidth = 280,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();

      let top = 0;
      let left = 0;

      switch (position) {
        case 'top':
          top = -tooltipRect.height - 8;
          left = (triggerRect.width - tooltipRect.width) / 2;
          break;
        case 'bottom':
          top = triggerRect.height + 8;
          left = (triggerRect.width - tooltipRect.width) / 2;
          break;
        case 'left':
          top = (triggerRect.height - tooltipRect.height) / 2;
          left = -tooltipRect.width - 8;
          break;
        case 'right':
          top = (triggerRect.height - tooltipRect.height) / 2;
          left = triggerRect.width + 8;
          break;
      }

      setTooltipPosition({ top, left });
    }
  }, [isVisible, position]);

  // Close on outside click for click trigger
  useEffect(() => {
    if (trigger === 'click' && isVisible) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          triggerRef.current &&
          !triggerRef.current.contains(event.target as Node) &&
          tooltipRef.current &&
          !tooltipRef.current.contains(event.target as Node)
        ) {
          setIsVisible(false);
        }
      };

      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [trigger, isVisible]);

  const handleMouseEnter = () => {
    if (trigger === 'hover') setIsVisible(true);
  };

  const handleMouseLeave = () => {
    if (trigger === 'hover') setIsVisible(false);
  };

  const handleClick = () => {
    if (trigger === 'click') setIsVisible(!isVisible);
  };

  return (
    <div className="relative inline-flex items-center">
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className={`
          inline-flex items-center justify-center
          ${trigger === 'click' ? 'cursor-pointer' : 'cursor-help'}
          text-[#78716c] hover:text-[#ef6a27] transition-colors duration-200
        `}
      >
        {children || <InfoIcon />}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          className="
            absolute z-50
            px-3 py-2.5
            bg-[#38362d] text-white
            text-sm leading-relaxed
            rounded-lg shadow-lg
            animate-tooltip-fade-in
            pointer-events-auto
          "
          style={{
            top: tooltipPosition.top,
            left: tooltipPosition.left,
            maxWidth: maxWidth,
            minWidth: 180,
          }}
        >
          {/* Arrow */}
          <div
            className={`
              absolute w-2.5 h-2.5 bg-[#38362d] transform rotate-45
              ${position === 'top' ? 'bottom-[-5px] left-1/2 -translate-x-1/2' : ''}
              ${position === 'bottom' ? 'top-[-5px] left-1/2 -translate-x-1/2' : ''}
              ${position === 'left' ? 'right-[-5px] top-1/2 -translate-y-1/2' : ''}
              ${position === 'right' ? 'left-[-5px] top-1/2 -translate-y-1/2' : ''}
            `}
          />
          {content}
        </div>
      )}
    </div>
  );
}

// Field label with integrated tooltip
interface TooltipLabelProps {
  label: string;
  tooltip: ReactNode;
  required?: boolean;
}

export function TooltipLabel({ label, tooltip, required }: TooltipLabelProps) {
  return (
    <div className="flex items-center gap-1.5 mb-2">
      <label
        className="text-sm font-semibold text-[#38362d]"
        style={{ fontFamily: 'var(--font-display)' }}
      >
        {label}
        {required && <span className="text-[#ef6a27] ml-0.5">*</span>}
      </label>
      <Tooltip content={tooltip} position="top" trigger="click">
        <InfoIcon />
      </Tooltip>
    </div>
  );
}

export default Tooltip;
