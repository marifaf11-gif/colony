"use client";

import { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

type CardVariant = 'metal' | 'dark-chrome' | 'glass';
type TrendDirection = 'up' | 'down' | 'neutral';

interface ConsoleCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { direction: TrendDirection; label: string };
  icon?: ReactNode;
  variant?: CardVariant;
  className?: string;
  badge?: { label: string; color: 'green' | 'amber' | 'red' };
  children?: ReactNode;
}

export function ConsoleCard({
  title,
  value,
  subtitle,
  trend,
  icon,
  variant = 'metal',
  className,
  badge,
  children,
}: ConsoleCardProps) {
  const variants: Record<CardVariant, string> = {
    metal: cn(
      'border border-metal-dark/60',
      'shadow-outer-raised shadow-highlight'
    ),
    'dark-chrome': cn(
      'border border-white/10',
      'shadow-outer-modal'
    ),
    glass: cn(
      'border border-white/15',
      'backdrop-blur-glass shadow-outer-floating shadow-highlight'
    ),
  };

  const backgrounds: Record<CardVariant, React.CSSProperties> = {
    metal: {
      background:
        'linear-gradient(145deg, #E8ECF0 0%, #C0C5CE 40%, #A0A5AE 100%)',
    },
    'dark-chrome': {
      background:
        'linear-gradient(145deg, #2a2d32 0%, #1a1c20 40%, #111315 100%)',
    },
    glass: {
      background: 'rgba(255, 255, 255, 0.07)',
    },
  };

  const textColor: Record<CardVariant, string> = {
    metal: 'text-foreground',
    'dark-chrome': 'text-white',
    glass: 'text-white',
  };

  const mutedColor: Record<CardVariant, string> = {
    metal: 'text-muted-foreground',
    'dark-chrome': 'text-zinc-400',
    glass: 'text-white/60',
  };

  const TrendIcon =
    trend?.direction === 'up'
      ? TrendingUp
      : trend?.direction === 'down'
      ? TrendingDown
      : Minus;

  const trendColor =
    trend?.direction === 'up'
      ? 'text-emerald-400'
      : trend?.direction === 'down'
      ? 'text-red-400'
      : 'text-zinc-400';

  const badgeColors = {
    green: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    amber: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
    red: 'bg-red-500/20 text-red-400 border-red-500/30',
  };

  return (
    <div
      className={cn(
        'relative rounded-xl p-5 overflow-hidden',
        variants[variant],
        className
      )}
      style={backgrounds[variant]}
    >
      {variant === 'dark-chrome' && (
        <>
          <div
            className="absolute inset-0 rounded-xl pointer-events-none"
            style={{
              background:
                'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, transparent 50%)',
            }}
          />
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{
              background:
                'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.25) 50%, transparent 100%)',
            }}
          />
        </>
      )}

      {variant === 'metal' && (
        <div
          className="absolute inset-0 rounded-xl pointer-events-none"
          style={{
            background:
              'linear-gradient(135deg, rgba(255,255,255,0.3) 0%, transparent 60%)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.6)',
          }}
        />
      )}

      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            {icon && (
              <div
                className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center',
                  variant === 'dark-chrome'
                    ? 'bg-white/10 text-white'
                    : 'bg-black/10 text-foreground'
                )}
              >
                {icon}
              </div>
            )}
            <p className={cn('text-xs font-semibold uppercase tracking-widest', mutedColor[variant])}>
              {title}
            </p>
          </div>
          {badge && (
            <span
              className={cn(
                'text-xs font-medium px-2 py-0.5 rounded-full border',
                badgeColors[badge.color]
              )}
            >
              {badge.label}
            </span>
          )}
        </div>

        <div className="mb-1">
          <span
            className={cn('text-3xl font-bold tracking-tight', textColor[variant])}
            style={
              variant === 'dark-chrome'
                ? {
                    textShadow: '0 0 20px rgba(74,158,255,0.4)',
                    fontVariantNumeric: 'tabular-nums',
                  }
                : { fontVariantNumeric: 'tabular-nums' }
            }
          >
            {value}
          </span>
        </div>

        {subtitle && (
          <p className={cn('text-sm mb-2', mutedColor[variant])}>{subtitle}</p>
        )}

        {trend && (
          <div className={cn('flex items-center gap-1 text-xs font-medium', trendColor)}>
            <TrendIcon className="w-3.5 h-3.5" />
            <span>{trend.label}</span>
          </div>
        )}

        {children && <div className="mt-3">{children}</div>}
      </div>
    </div>
  );
}
