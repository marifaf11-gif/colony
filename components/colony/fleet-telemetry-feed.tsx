"use client";

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

interface TelemetryEvent {
  id: string;
  pod_slug: string;
  event_type: string;
  kinks_found: number;
  revenue_earned: number;
  created_at: string;
}

const POD_COLORS: Record<string, string> = {
  'conversion-catalyst': '#39FF14',
  cyberhawk: '#4A9EFF',
  'q-metier': '#FFB830',
};

const MOCK_EVENTS: TelemetryEvent[] = [
  { id: '1', pod_slug: 'conversion-catalyst', event_type: 'report', kinks_found: 7, revenue_earned: 12400, created_at: new Date(Date.now() - 30000).toISOString() },
  { id: '2', pod_slug: 'cyberhawk', event_type: 'scan', kinks_found: 3, revenue_earned: 5200, created_at: new Date(Date.now() - 90000).toISOString() },
  { id: '3', pod_slug: 'conversion-catalyst', event_type: 'report', kinks_found: 11, revenue_earned: 18700, created_at: new Date(Date.now() - 180000).toISOString() },
  { id: '4', pod_slug: 'q-metier', event_type: 'analysis', kinks_found: 5, revenue_earned: 8900, created_at: new Date(Date.now() - 300000).toISOString() },
  { id: '5', pod_slug: 'cyberhawk', event_type: 'scan', kinks_found: 2, revenue_earned: 3100, created_at: new Date(Date.now() - 480000).toISOString() },
];

function timeAgo(isoDate: string) {
  const diff = (Date.now() - new Date(isoDate).getTime()) / 1000;
  if (diff < 60) return `${Math.floor(diff)}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  return `${Math.floor(diff / 3600)}h ago`;
}

export function FleetTelemetryFeed() {
  const [events, setEvents] = useState<TelemetryEvent[]>(MOCK_EVENTS);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 15000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const pods = ['conversion-catalyst', 'cyberhawk'];
    const newEvent: TelemetryEvent = {
      id: `live-${Date.now()}`,
      pod_slug: pods[Math.floor(Math.random() * pods.length)],
      event_type: Math.random() > 0.5 ? 'report' : 'scan',
      kinks_found: Math.floor(Math.random() * 12) + 1,
      revenue_earned: Math.floor(Math.random() * 20000) + 1000,
      created_at: new Date().toISOString(),
    };
    setEvents((prev) => [newEvent, ...prev].slice(0, 12));
  }, [tick]);

  return (
    <div
      className="rounded-xl overflow-hidden flex flex-col"
      style={{
        background: 'linear-gradient(160deg, #1a2030 0%, #111620 100%)',
        border: '1px solid rgba(255,255,255,0.06)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 4px 16px rgba(0,0,0,0.4)',
        minHeight: 300,
      }}
    >
      <div
        className="px-4 py-3 flex items-center gap-2 shrink-0"
        style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(255,255,255,0.02)' }}
      >
        <div
          className="w-2 h-2 rounded-full animate-pulse"
          style={{ background: '#39FF14', boxShadow: '0 0 6px #39FF14' }}
        />
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/40">
          Live Kink Feed
        </p>
        <span
          className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full"
          style={{ color: '#39FF14', background: 'rgba(57,255,20,0.1)', border: '1px solid rgba(57,255,20,0.2)' }}
        >
          STREAMING
        </span>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-white/[0.04]">
        {events.map((ev, i) => {
          const color = POD_COLORS[ev.pod_slug] ?? '#fff';
          return (
            <div
              key={ev.id}
              className={cn(
                'flex items-center gap-3 px-4 py-3 transition-all duration-300',
                i === 0 && 'bg-white/[0.03]'
              )}
            >
              <div
                className="w-1.5 h-1.5 rounded-full shrink-0"
                style={{ background: color, boxShadow: `0 0 4px ${color}` }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p
                    className="text-xs font-bold uppercase tracking-wider truncate"
                    style={{ color }}
                  >
                    {ev.pod_slug}
                  </p>
                  <span className="text-[10px] text-white/25 uppercase">{ev.event_type}</span>
                </div>
                <p className="text-xs text-white/35 mt-0.5">
                  {ev.kinks_found} kink{ev.kinks_found !== 1 ? 's' : ''} found
                </p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs font-bold font-mono" style={{ color: '#39FF14' }}>
                  +${ev.revenue_earned.toLocaleString('en-CA')}
                </p>
                <p className="text-[10px] text-white/25 mt-0.5">{timeAgo(ev.created_at)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
