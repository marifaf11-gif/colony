"use client";

import { cn } from '@/lib/utils';

interface HubStatCardProps {
  label: string;
  value: string;
  sublabel?: string;
  color?: string;
  glowColor?: string;
  className?: string;
}

export function HubStatCard({ label, value, sublabel, color = '#4A9EFF', glowColor, className }: HubStatCardProps) {
  const glow = glowColor ?? `${color}33`;

  return (
    <div
      className={cn('rounded-xl px-5 py-4 flex flex-col gap-1', className)}
      style={{
        background: 'linear-gradient(145deg, #1e2530 0%, #141921 100%)',
        border: `1px solid ${color}28`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 16px rgba(0,0,0,0.4), 0 0 20px ${glow}`,
      }}
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: 'rgba(255,255,255,0.35)' }}>
        {label}
      </p>
      <p
        className="text-2xl font-bold font-mono leading-none"
        style={{ color, textShadow: `0 0 16px ${color}88` }}
      >
        {value}
      </p>
      {sublabel && (
        <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.3)' }}>
          {sublabel}
        </p>
      )}
    </div>
  );
}
