"use client";

import { useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface MetalButtonProps {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'success' | 'destructive';
  onClick?: () => void;
  disabled?: boolean;
  icon?: ReactNode;
  className?: string;
}

export function MetalButton({
  children,
  variant = 'primary',
  onClick,
  disabled = false,
  icon,
  className,
}: MetalButtonProps) {
  const [isPressed, setIsPressed] = useState(false);

  const variantStyles = {
    primary: 'bg-primary text-primary-foreground hover:brightness-110',
    secondary: 'bg-secondary text-secondary-foreground hover:brightness-110',
    success: 'bg-success text-success-foreground hover:brightness-110',
    destructive: 'bg-destructive text-destructive-foreground hover:brightness-110',
  };

  const handlePress = () => {
    if (!disabled) {
      setIsPressed(true);
      onClick?.();
      setTimeout(() => setIsPressed(false), 150);
    }
  };

  return (
    <button
      onClick={handlePress}
      disabled={disabled}
      className={cn(
        'relative px-6 py-3 rounded-lg font-medium',
        'transition-all duration-150',
        'shadow-tactile',
        'active:shadow-inner-medium',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'flex items-center justify-center gap-2',
        variantStyles[variant],
        isPressed && 'translate-y-[2px] shadow-inner-medium',
        className
      )}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
}
