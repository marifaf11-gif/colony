"use client";

import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Zap, Eye, Briefcase, ChevronRight } from 'lucide-react';
import { CncToggle } from './cnc-toggle';

interface PodDef {
  slug: string;
  name: string;
  tagline: string;
  href: string;
  icon: typeof Zap;
  color: 'green' | 'blue' | 'amber' | 'red';
  status: 'live' | 'beta' | 'offline';
}

const PODS: PodDef[] = [
  {
    slug: 'conversion-catalyst',
    name: 'Conversion Catalyst',
    tagline: 'Revenue Leak Auditor',
    href: '/pods/conversion-catalyst',
    icon: Zap,
    color: 'green',
    status: 'live',
  },
  {
    slug: 'cyberhawk',
    name: 'Cyberhawk',
    tagline: 'Talon HUD Scanner',
    href: '/pods/cyberhawk',
    icon: Eye,
    color: 'blue',
    status: 'live',
  },
  {
    slug: 'q-metier',
    name: 'Q-MÉTIER',
    tagline: 'Trade Intelligence',
    href: '/pods/q-metier',
    icon: Briefcase,
    color: 'amber',
    status: 'beta',
  },
];

const STATUS_BADGE: Record<PodDef['status'], { label: string; color: string }> = {
  live: { label: 'LIVE', color: '#39FF14' },
  beta: { label: 'BETA', color: '#FFB830' },
  offline: { label: 'OFFLINE', color: '#FF3B3B' },
};

interface PodSwitchboardProps {
  locale: string;
}

export function PodSwitchboard({ locale }: PodSwitchboardProps) {
  const [enabled, setEnabled] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(PODS.map((p) => [p.slug, p.status === 'live']))
  );

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{
        background: 'linear-gradient(160deg, #1e2530 0%, #141921 100%)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 16px rgba(0,0,0,0.5)',
      }}
    >
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{
          background: 'rgba(255,255,255,0.03)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div
          className="w-2 h-2 rounded-full"
          style={{ background: '#39FF14', boxShadow: '0 0 6px #39FF14' }}
        />
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
          Pod Switchboard
        </p>
      </div>

      <div className="p-3 space-y-1.5">
        {PODS.map((pod) => {
          const Icon = pod.icon;
          const badge = STATUS_BADGE[pod.status];
          const isOn = enabled[pod.slug] ?? false;

          return (
            <div key={pod.slug} className="space-y-0">
              <div
                className="rounded-lg overflow-hidden"
                style={{
                  background: isOn ? 'rgba(255,255,255,0.03)' : 'transparent',
                  border: '1px solid rgba(255,255,255,0.04)',
                }}
              >
                <div className="flex items-center gap-2 px-3 pt-2.5 pb-1">
                  <div
                    className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                    style={{
                      background: isOn
                        ? `rgba(${pod.color === 'green' ? '57,255,20' : pod.color === 'blue' ? '74,158,255' : '255,184,48'},0.15)`
                        : 'rgba(255,255,255,0.04)',
                      border: `1px solid ${isOn ? (pod.color === 'green' ? 'rgba(57,255,20,0.3)' : pod.color === 'blue' ? 'rgba(74,158,255,0.3)' : 'rgba(255,184,48,0.3)') : 'rgba(255,255,255,0.06)'}`,
                      transition: 'all 220ms',
                    }}
                  >
                    <Icon
                      className="w-3.5 h-3.5"
                      style={{
                        color: isOn
                          ? pod.color === 'green'
                            ? '#39FF14'
                            : pod.color === 'blue'
                            ? '#4A9EFF'
                            : '#FFB830'
                          : 'rgba(255,255,255,0.25)',
                        transition: 'color 220ms',
                      }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p
                        className="text-xs font-bold truncate"
                        style={{
                          color: isOn ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
                          transition: 'color 220ms',
                        }}
                      >
                        {pod.name}
                      </p>
                      <span
                        className="text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0"
                        style={{
                          color: badge.color,
                          background: `${badge.color}18`,
                          border: `1px solid ${badge.color}30`,
                        }}
                      >
                        {badge.label}
                      </span>
                    </div>
                    <p className="text-[10px] text-white/25 truncate">{pod.tagline}</p>
                  </div>
                  {isOn && (
                    <Link
                      href={`/${locale}${pod.href}`}
                      className="shrink-0 p-1 rounded opacity-60 hover:opacity-100 transition-opacity"
                    >
                      <ChevronRight className="w-3 h-3 text-white/60" />
                    </Link>
                  )}
                </div>
                <CncToggle
                  label={isOn ? 'ONLINE' : 'OFFLINE'}
                  checked={isOn}
                  onChange={(v) => setEnabled((prev) => ({ ...prev, [pod.slug]: v }))}
                  color={pod.color}
                  className="mx-2 mb-2 mt-1"
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
