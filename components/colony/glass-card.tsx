"use client";

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  elevation?: 1 | 2 | 3 | 4;
}

export function GlassCard({
  children,
  className,
  elevation = 2,
}: GlassCardProps) {
  const elevationStyles = {
    1: 'shadow-outer-subtle',
    2: 'shadow-outer-raised',
    3: 'shadow-outer-floating',
    4: 'shadow-outer-modal',
  };

  return (
    <div
      className={cn(
        'relative rounded-xl overflow-hidden',
        'bg-card border border-border',
        elevationStyles[elevation],
        'backdrop-blur-glass',
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none" />
      <div className="relative">{children}</div>
    </div>
  );
}
