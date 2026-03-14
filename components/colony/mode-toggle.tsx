"use client";

import { Scale, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/lib/i18n/language-provider';

export type DashboardMode = 'legal' | 'profit';

interface ModeToggleProps {
  mode: DashboardMode;
  onChange: (mode: DashboardMode) => void;
}

export function ModeToggle({ mode, onChange }: ModeToggleProps) {
  const { t } = useLanguage();

  return (
    <div
      className="inline-flex rounded-xl p-1 gap-1"
      style={{
        background: 'linear-gradient(145deg, #1a1c20 0%, #111315 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow:
          'inset 0 2px 4px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.05)',
      }}
      role="group"
      aria-label="Dashboard mode selector"
    >
      {(
        [
          {
            value: 'legal' as DashboardMode,
            label: t('dashboard.legalMode'),
            icon: Scale,
            activeColor: '#4A9EFF',
            activeGlow: 'rgba(74,158,255,0.3)',
          },
          {
            value: 'profit' as DashboardMode,
            label: t('dashboard.profitMode'),
            icon: TrendingUp,
            activeColor: '#39FF14',
            activeGlow: 'rgba(57,255,20,0.3)',
          },
        ] as const
      ).map(({ value, label, icon: Icon, activeColor, activeGlow }) => {
        const isActive = mode === value;
        return (
          <button
            key={value}
            onClick={() => onChange(value)}
            className={cn(
              'relative flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold',
              'transition-all duration-200',
              isActive ? 'text-white' : 'text-white/40 hover:text-white/70'
            )}
            style={
              isActive
                ? {
                    background: `linear-gradient(135deg, rgba(255,255,255,0.12) 0%, rgba(255,255,255,0.06) 100%)`,
                    boxShadow: `0 0 12px ${activeGlow}, inset 0 1px 0 rgba(255,255,255,0.15)`,
                    border: `1px solid ${activeColor}40`,
                  }
                : {}
            }
          >
            <Icon
              className="w-4 h-4 shrink-0"
              style={{ color: isActive ? activeColor : 'inherit' }}
            />
            <span>{label}</span>
            {isActive && (
              <div
                className="absolute -inset-px rounded-lg pointer-events-none"
                style={{
                  background: `linear-gradient(135deg, ${activeColor}15 0%, transparent 100%)`,
                }}
              />
            )}
          </button>
        );
      })}
    </div>
  );
}
