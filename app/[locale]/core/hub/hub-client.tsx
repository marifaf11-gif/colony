"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { FleetTelemetryFeed } from '@/components/colony/fleet-telemetry-feed';
import { HubStatCard } from '@/components/colony/hub-stat-card';
import { GlobeViewDynamic } from '@/components/colony/globe-view-dynamic';
import { Activity, Zap, Eye, TrendingUp, TriangleAlert as AlertTriangle, ChevronRight } from 'lucide-react';

interface HubClientProps {
  locale: string;
}

const PODS = [
  {
    slug: 'conversion-catalyst',
    name: 'Conversion Catalyst',
    tagline: 'Revenue Leak Auditor',
    href: '/pods/conversion-catalyst',
    color: '#39FF14',
    icon: Zap,
    kinks: 127,
    revenue: 248600,
    status: 'live' as const,
  },
  {
    slug: 'cyberhawk',
    name: 'Cyberhawk',
    tagline: 'Talon HUD Scanner',
    href: '/pods/cyberhawk',
    color: '#4A9EFF',
    icon: Eye,
    kinks: 84,
    revenue: 159200,
    status: 'live' as const,
  },
];

export function HubClient({ locale }: HubClientProps) {
  const [totalRevenue, setTotalRevenue] = useState(408640);
  const [totalKinks, setTotalKinks] = useState(247);

  useEffect(() => {
    const timer = setInterval(() => {
      setTotalRevenue((v) => v + Math.floor(Math.random() * 800 + 200));
      setTotalKinks((v) => v + (Math.random() > 0.7 ? 1 : 0));
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold text-white leading-none"
            style={{ textShadow: '0 0 20px rgba(74,158,255,0.3)' }}
          >
            Mission Control
          </h1>
          <p className="text-sm text-white/40 mt-1.5">Colony OS — Fleet Command Centre</p>
        </div>

        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: '#39FF14', boxShadow: '0 0 8px #39FF14' }}
          />
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#39FF14' }}>
            All Systems Nominal
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <HubStatCard
          label="Total Revenue Recovered"
          value={`$${(totalRevenue / 1000).toFixed(1)}K`}
          sublabel="All-time across fleet"
          color="#39FF14"
        />
        <HubStatCard
          label="Kinks Identified"
          value={totalKinks.toString()}
          sublabel="Revenue leak vectors"
          color="#FFB830"
        />
        <HubStatCard
          label="Active Pods"
          value="2"
          sublabel="of 3 deployed"
          color="#4A9EFF"
        />
        <HubStatCard
          label="Avg. Impact / Scan"
          value="$1.6K"
          sublabel="Per kink resolved"
          color="#FF3B3B"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        <div className="lg:col-span-3 space-y-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25 mb-3">
              Fleet Pods
            </p>
            <div className="space-y-3">
              {PODS.map((pod) => {
                const Icon = pod.icon;
                return (
                  <Link
                    key={pod.slug}
                    href={`/${locale}${pod.href}`}
                    className="group flex items-center gap-4 p-4 rounded-xl transition-all duration-200"
                    style={{
                      background: 'linear-gradient(145deg, #1e2530 0%, #141921 100%)',
                      border: `1px solid ${pod.color}20`,
                      boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 2px 8px rgba(0,0,0,0.3)',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.border = `1px solid ${pod.color}50`;
                      (e.currentTarget as HTMLElement).style.boxShadow = `inset 0 1px 0 rgba(255,255,255,0.06), 0 4px 20px rgba(0,0,0,0.4), 0 0 20px ${pod.color}18`;
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.border = `1px solid ${pod.color}20`;
                      (e.currentTarget as HTMLElement).style.boxShadow = 'inset 0 1px 0 rgba(255,255,255,0.04), 0 2px 8px rgba(0,0,0,0.3)';
                    }}
                  >
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                      style={{
                        background: `${pod.color}18`,
                        border: `1px solid ${pod.color}30`,
                        boxShadow: `0 0 12px ${pod.color}20`,
                      }}
                    >
                      <Icon className="w-5 h-5" style={{ color: pod.color }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-white">{pod.name}</p>
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                          style={{ color: pod.color, background: `${pod.color}18`, border: `1px solid ${pod.color}30` }}
                        >
                          LIVE
                        </span>
                      </div>
                      <p className="text-xs text-white/35 mt-0.5">{pod.tagline}</p>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold font-mono" style={{ color: '#39FF14' }}>
                        +${(pod.revenue / 1000).toFixed(0)}K
                      </p>
                      <p className="text-[10px] text-white/30 mt-0.5">
                        {pod.kinks} kinks
                      </p>
                    </div>

                    <ChevronRight
                      className="w-4 h-4 shrink-0 opacity-0 group-hover:opacity-60 transition-opacity"
                      style={{ color: pod.color }}
                    />
                  </Link>
                );
              })}

              <div
                className="flex items-center gap-4 p-4 rounded-xl opacity-40"
                style={{
                  background: 'linear-gradient(145deg, #161c24 0%, #0f141b 100%)',
                  border: '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                >
                  <Activity className="w-5 h-5 text-white/20" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-white/40">Q-MÉTIER</p>
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ color: '#FFB830', background: 'rgba(255,184,48,0.1)', border: '1px solid rgba(255,184,48,0.2)' }}
                    >
                      BETA
                    </span>
                  </div>
                  <p className="text-xs text-white/20 mt-0.5">Trade Intelligence</p>
                </div>
                <TrendingUp className="w-4 h-4 text-white/20" />
              </div>
            </div>
          </div>

          <div
            className="rounded-xl p-4"
            style={{
              background: 'linear-gradient(145deg, #1e2530 0%, #141921 100%)',
              border: '1px solid rgba(255,255,255,0.05)',
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4" style={{ color: '#FFB830' }} />
              <p className="text-xs font-bold uppercase tracking-widest text-white/40">
                Fleet Alerts
              </p>
            </div>
            <div className="space-y-2">
              {[
                { msg: 'Conversion Catalyst detected 11 high-impact kinks on example.ca', time: '2m ago', color: '#FF3B3B' },
                { msg: 'Cyberhawk completed scan — $5.2K recovery opportunity', time: '12m ago', color: '#FFB830' },
                { msg: 'Fleet telemetry nominal — all pods reporting', time: '1h ago', color: '#39FF14' },
              ].map((alert, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <div
                    className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                    style={{ background: alert.color, boxShadow: `0 0 4px ${alert.color}` }}
                  />
                  <p className="text-xs text-white/50 flex-1">{alert.msg}</p>
                  <span className="text-[10px] text-white/20 shrink-0">{alert.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25 mb-3">
              Globe — Active Scans
            </p>
            <div
              className="rounded-xl overflow-hidden"
              style={{
                border: '1px solid rgba(74,158,255,0.15)',
                boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
              }}
            >
              <GlobeViewDynamic className="w-full h-48" />
            </div>
          </div>

          <FleetTelemetryFeed />
        </div>
      </div>
    </div>
  );
}
