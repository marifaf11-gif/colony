"use client";

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface CncToggleProps {
  label: string;
  sublabel?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onChange?: (checked: boolean) => void;
  color?: 'green' | 'blue' | 'amber' | 'red';
  disabled?: boolean;
  className?: string;
}

const COLOR_MAP = {
  green: {
    on: '#39FF14',
    onGlow: 'rgba(57,255,20,0.55)',
    onBg: 'rgba(57,255,20,0.12)',
    trackOn: 'linear-gradient(90deg, #1a3d1e, #2a5c30)',
    indicator: '#39FF14',
  },
  blue: {
    on: '#4A9EFF',
    onGlow: 'rgba(74,158,255,0.55)',
    onBg: 'rgba(74,158,255,0.12)',
    trackOn: 'linear-gradient(90deg, #0d2a4a, #1a4a7a)',
    indicator: '#4A9EFF',
  },
  amber: {
    on: '#FFB830',
    onGlow: 'rgba(255,184,48,0.55)',
    onBg: 'rgba(255,184,48,0.12)',
    trackOn: 'linear-gradient(90deg, #3a2d00, #5a4500)',
    indicator: '#FFB830',
  },
  red: {
    on: '#FF3B3B',
    onGlow: 'rgba(255,59,59,0.55)',
    onBg: 'rgba(255,59,59,0.12)',
    trackOn: 'linear-gradient(90deg, #3a0d0d, #5a1a1a)',
    indicator: '#FF3B3B',
  },
};

export function CncToggle({
  label,
  sublabel,
  checked: controlledChecked,
  defaultChecked = false,
  onChange,
  color = 'green',
  disabled = false,
  className,
}: CncToggleProps) {
  const [internalChecked, setInternalChecked] = useState(defaultChecked);
  const isControlled = controlledChecked !== undefined;
  const isOn = isControlled ? controlledChecked : internalChecked;
  const cfg = COLOR_MAP[color];

  const handleToggle = () => {
    if (disabled) return;
    const next = !isOn;
    if (!isControlled) setInternalChecked(next);
    onChange?.(next);
  };

  return (
    <div
      className={cn('flex items-center justify-between gap-4 py-2.5 px-3 rounded-lg', className)}
      style={{
        background: isOn ? cfg.onBg : 'rgba(255,255,255,0.02)',
        border: `1px solid ${isOn ? cfg.onGlow : 'rgba(255,255,255,0.05)'}`,
        transition: 'all 220ms cubic-bezier(0.4,0,0.2,1)',
      }}
    >
      <div className="flex-1 min-w-0">
        <p
          className="text-xs font-semibold uppercase tracking-widest truncate"
          style={{
            color: isOn ? cfg.on : 'rgba(255,255,255,0.45)',
            textShadow: isOn ? `0 0 8px ${cfg.onGlow}` : 'none',
            transition: 'color 220ms, text-shadow 220ms',
          }}
        >
          {label}
        </p>
        {sublabel && (
          <p className="text-xs truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>
            {sublabel}
          </p>
        )}
      </div>

      <button
        role="switch"
        aria-checked={isOn}
        onClick={handleToggle}
        disabled={disabled}
        className="relative shrink-0 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed"
        style={{ width: 44, height: 24 }}
      >
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: isOn ? cfg.trackOn : 'linear-gradient(90deg, #111620, #1a2030)',
            border: `1px solid ${isOn ? cfg.onGlow : 'rgba(255,255,255,0.08)'}`,
            boxShadow: isOn
              ? `inset 0 2px 4px rgba(0,0,0,0.5), 0 0 10px ${cfg.onBg}`
              : 'inset 0 2px 6px rgba(0,0,0,0.6)',
            transition: 'all 220ms cubic-bezier(0.4,0,0.2,1)',
          }}
        />

        <div
          className="absolute top-[3px] rounded-full"
          style={{
            width: 18,
            height: 18,
            left: isOn ? 'calc(100% - 21px)' : 3,
            background: isOn
              ? `radial-gradient(circle at 40% 35%, ${cfg.on}, ${cfg.indicator}bb)`
              : 'radial-gradient(circle at 40% 35%, #4a5568, #2d3748)',
            boxShadow: isOn
              ? `0 0 8px ${cfg.onGlow}, 0 1px 3px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.2)`
              : '0 1px 3px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1)',
            border: isOn
              ? `1px solid ${cfg.on}44`
              : '1px solid rgba(255,255,255,0.08)',
            transition: 'left 220ms cubic-bezier(0.34,1.56,0.64,1), background 220ms, box-shadow 220ms',
          }}
        />

        <div
          className="absolute top-[3px] rounded-full pointer-events-none"
          style={{
            width: 18,
            height: 18,
            left: isOn ? 'calc(100% - 21px)' : 3,
            background: 'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.25), transparent 60%)',
            transition: 'left 220ms cubic-bezier(0.34,1.56,0.64,1)',
          }}
        />
      </button>
    </div>
  );
}
