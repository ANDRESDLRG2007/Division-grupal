import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionProps {
  title: React.ReactNode;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  title,
  leading,
  trailing,
  children,
  defaultOpen = false,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className={className}>
      <button
        type="button"
        onClick={() => setIsOpen(open => !open)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-3 text-left"
      >
        <span className="flex min-w-0 items-center gap-3">
          {leading}
          <span className="min-w-0">{title}</span>
        </span>
        <span className="flex shrink-0 items-center gap-3">
          {trailing}
          <ChevronDown
            size={17}
            className={`text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          />
        </span>
      </button>
      {isOpen && <div className="mt-3">{children}</div>}
    </div>
  );
};