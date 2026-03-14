"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { RadarScanner } from '@/components/colony/radar-scanner';
import { CncToggle } from '@/components/colony/cnc-toggle';
import { FleetTelemetryFeed } from '@/components/colony/fleet-telemetry-feed';
import { Zap, Eye, Activity, TrendingUp, TriangleAlert as AlertTriangle, ChevronRight, Crosshair, Radio, Server, Shield } from 'lucide-react';

interface HubClientProps { locale: string }

interface VulnRow {
  id: string;
  target_url: string;
  target_name: string | null;
  vulnerability_type: string | null;
  severity: string | null;
  status: string;
  created_at: string;
}

const PODS = [
  { slug: 'conversion-catalyst', name: 'Conversion Catalyst', tagline: 'Revenue Leak Auditor',   href: '/pods/conversion-catalyst', color: '#39FF14', icon: Zap  },
  { slug: 'cyberhawk',           name: 'Cyberhawk',           tagline: 'Talon HUD Scanner',       href: '/pods/cyberhawk',           color: '#4A9EFF', icon: Eye  },
];

const SEVERITY_COLOR: Record<string, string> = {
  HIGH:      '#FF3B3B',
  MEDIUM:    '#FFB830',
  LOW:       '#39FF14',
  TECH_DEBT: '#4A9EFF',
};

function MetalPanel({
  children, className, accent,
}: { children: React.ReactNode; className?: string; accent?: string }) {
  return (
    <div
      className={`relative rounded-xl overflow-hidden ${className ?? ''}`}
      style={{
        background: 'linear-gradient(160deg, #252d3a 0%, #1a2130 45%, #111820 100%)',
        border: `1px solid ${accent ? `${accent}22` : 'rgba(255,255,255,0.06)'}`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.5), 0 6px 24px rgba(0,0,0,0.55)${accent ? `, 0 0 32px ${accent}0a` : ''}`,
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(255,255,255,0.008) 1px, rgba(255,255,255,0.008) 2px)',
        }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}

function StatBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</span>
        <span className="text-[9px] font-mono font-bold" style={{ color }}>{value}</span>
      </div>
      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.06)' }}>
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}aa, ${color})`, boxShadow: `0 0 6px ${color}66` }}
        />
      </div>
    </div>
  );
}

function LiveIndicator({ color = '#39FF14' }: { color?: string }) {
  return (
    <span className="relative flex items-center justify-center w-2 h-2">
      <span
        className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60"
        style={{ background: color }}
      />
      <span className="relative inline-flex rounded-full w-1.5 h-1.5" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
    </span>
  );
}

export function HubClient({ locale }: HubClientProps) {
  const [vulns, setVulns]             = useState<VulnRow[]>([]);
  const [podToggles, setPodToggles]   = useState<Record<string, boolean>>({ 'cyberhawk': true, 'conversion-catalyst': true, 'q-metier': false, 'kaltrac-v2': false });
  const [totalRevenue, setTotalRevenue] = useState(408640);
  const [totalKinks, setTotalKinks]   = useState(247);
  const [scanCount, setScanCount]     = useState(1842);
  const [bountyTotal, setBountyTotal] = useState(2990);

  const loadVulns = useCallback(async () => {
    const sb = createClient();
    const { data } = await sb
      .from('vulnerability_log')
      .select('id,target_url,target_name,vulnerability_type,severity,status,created_at')
      .order('created_at', { ascending: false })
      .limit(6);
    if (data) setVulns(data as VulnRow[]);
  }, []);

  useEffect(() => {
    loadVulns();
    const sb = createClient();
    const ch = sb
      .channel('vulns-hub')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'vulnerability_log' }, loadVulns)
      .subscribe();
    return () => { sb.removeChannel(ch); };
  }, [loadVulns]);

  useEffect(() => {
    const t = setInterval(() => {
      setTotalRevenue((v) => v + Math.floor(Math.random() * 600 + 100));
      setTotalKinks((v) => v + (Math.random() > 0.7 ? 1 : 0));
      setScanCount((v) => v + (Math.random() > 0.5 ? 1 : 0));
      setBountyTotal((v) => v + Math.floor(Math.random() * 50));
    }, 7000);
    return () => clearInterval(t);
  }, []);

  const activeVulns   = vulns.filter((v) => v.status === 'DETECTED' || v.status === 'STRIKING').length;
  const resolvedVulns = vulns.filter((v) => v.status === 'BOUNTY_PAID').length;

  return (
    <div className="flex-1 overflow-y-auto bg-[#0d1117]" style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}>
      <div
        className="px-6 py-4 flex items-center justify-between"
        style={{
          background: 'linear-gradient(180deg, #141921 0%, transparent 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.04)',
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1e3a5f, #0d1f38)', border: '1px solid rgba(74,158,255,0.3)', boxShadow: '0 0 12px rgba(74,158,255,0.2)' }}
          >
            <Radio className="w-4 h-4" style={{ color: '#4A9EFF' }} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tighter leading-none">COLONY_OS // MISSION_CONTROL</h1>
            <p className="text-[9px] mt-0.5 tracking-[0.18em]" style={{ color: '#39FF14' }}>SYSTEM_STATUS: OPTIMAL // SECTOR: MONTREAL_QC</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <LiveIndicator color="#39FF14" />
            <span className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#39FF14' }}>LIVE</span>
          </div>
          <div className="text-right">
            <p className="text-[9px] tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>BOUNTY_POOL</p>
            <p className="text-sm font-bold font-mono" style={{ color: '#FFB830', textShadow: '0 0 12px rgba(255,184,48,0.4)' }}>
              ${bountyTotal.toLocaleString()}.00
            </p>
          </div>
          <Link
            href={`/${locale}/core/strike`}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #3a0d0d, #5a1a1a)', border: '1px solid rgba(255,59,59,0.35)', color: '#FF3B3B', boxShadow: '0 0 12px rgba(255,59,59,0.15)' }}
          >
            <Crosshair className="w-3.5 h-3.5" />
            STRIKE
          </Link>
        </div>
      </div>

      <div className="p-6 grid grid-cols-12 gap-5">
        <div className="col-span-3 space-y-4">
          <MetalPanel className="p-4">
            <p className="text-[9px] font-bold tracking-[0.22em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>POD_FLEET_REGISTRY</p>
            <div className="space-y-1.5">
              <CncToggle label="CYBERHAWK"      color="blue"  checked={podToggles['cyberhawk']}           onChange={(v) => setPodToggles((p) => ({ ...p, 'cyberhawk': v }))}           sublabel="Talon HUD Scanner" />
              <CncToggle label="CONV.CATALYST"  color="green" checked={podToggles['conversion-catalyst']} onChange={(v) => setPodToggles((p) => ({ ...p, 'conversion-catalyst': v }))} sublabel="Revenue Leak Auditor" />
              <CncToggle label="Q-MÉTIER"       color="amber" checked={podToggles['q-metier']}            onChange={(v) => setPodToggles((p) => ({ ...p, 'q-metier': v }))}            sublabel="Trade Intelligence" />
              <CncToggle label="KALTRAC_V2"     color="red"   checked={podToggles['kaltrac-v2']}          onChange={(v) => setPodToggles((p) => ({ ...p, 'kaltrac-v2': v }))}          sublabel="Arsenal API Engine" />
            </div>
          </MetalPanel>

          <MetalPanel className="p-4" accent="#4A9EFF">
            <p className="text-[9px] font-bold tracking-[0.22em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>SYS_TELEMETRY</p>
            <div className="space-y-3">
              <StatBar label="API CALLS / DAY"  value={scanCount}               max={3000} color="#4A9EFF" />
              <StatBar label="KINKS DETECTED"   value={totalKinks}              max={500}  color="#FFB830" />
              <StatBar label="RESOLVED"         value={resolvedVulns || 12}     max={50}   color="#39FF14" />
              <StatBar label="HIGH SEVERITY"    value={activeVulns || 8}        max={30}   color="#FF3B3B" />
            </div>
          </MetalPanel>

          <MetalPanel className="p-4" accent="#39FF14">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-3.5 h-3.5" style={{ color: '#39FF14' }} />
              <p className="text-[9px] font-bold tracking-[0.18em] uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>AI_COORDINATOR</p>
              <LiveIndicator color="#39FF14" />
            </div>
            <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
              "Scanning Quebec sector for revenue leaks. 3 high-impact targets in queue."
            </p>
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex justify-between">
                <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.2)' }}>MODEL</span>
                <span className="text-[9px] font-bold" style={{ color: '#4A9EFF' }}>GPT-4o</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.2)' }}>BUDGET_LEFT</span>
                <span className="text-[9px] font-bold" style={{ color: '#39FF14' }}>$4.82</span>
              </div>
            </div>
          </MetalPanel>
        </div>

        <div className="col-span-5">
          <MetalPanel className="h-full" accent="#39FF14">
            <div
              className="flex items-center justify-between px-5 py-3"
              style={{ borderBottom: '1px solid rgba(57,255,20,0.08)' }}
            >
              <div className="flex items-center gap-2">
                <Crosshair className="w-3.5 h-3.5" style={{ color: '#39FF14' }} />
                <span className="text-[9px] font-bold tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>TACTICAL_RADAR // SECTOR_MTL</span>
              </div>
              <div className="flex items-center gap-3 text-[9px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                <span>RANGE: 80KM</span>
                <span style={{ color: 'rgba(57,255,20,0.5)' }}>■</span><span>LOW</span>
                <span style={{ color: 'rgba(255,184,48,0.5)' }}>■</span><span>MID</span>
                <span style={{ color: 'rgba(255,59,59,0.5)' }}>■</span><span>HIGH</span>
              </div>
            </div>

            <div className="flex items-center justify-center py-6">
              <RadarScanner />
            </div>

            <div
              className="px-5 py-3 flex items-center justify-between"
              style={{ borderTop: '1px solid rgba(57,255,20,0.08)' }}
            >
              <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>
                TARGETS_TRACKED: {vulns.length + 5}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-[9px] font-mono" style={{ color: '#39FF14' }}>
                  REV_OPPORTUNITY: ${(totalRevenue / 1000).toFixed(1)}K
                </span>
                <LiveIndicator color="#39FF14" />
              </div>
            </div>
          </MetalPanel>
        </div>

        <div className="col-span-4 space-y-4">
          <MetalPanel className="p-4">
            <p className="text-[9px] font-bold tracking-[0.22em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>FLEET_PODS</p>
            <div className="space-y-2">
              {PODS.map((pod) => {
                const Icon = pod.icon;
                const isOn = podToggles[pod.slug];
                return (
                  <Link
                    key={pod.slug}
                    href={`/${locale}${pod.href}`}
                    className="group flex items-center gap-3 p-3 rounded-lg transition-all duration-200"
                    style={{
                      background: isOn ? `${pod.color}0a` : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isOn ? `${pod.color}25` : 'rgba(255,255,255,0.05)'}`,
                      boxShadow: isOn ? `inset 0 1px 0 rgba(255,255,255,0.05), 0 0 16px ${pod.color}0d` : 'none',
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${pod.color}15`, border: `1px solid ${pod.color}30` }}
                    >
                      <Icon className="w-4 h-4" style={{ color: pod.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white">{pod.name}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{pod.tagline}</p>
                    </div>
                    <span
                      className="text-[8px] font-bold px-1.5 py-0.5 rounded tracking-widest"
                      style={{
                        color:      isOn ? pod.color : 'rgba(255,255,255,0.2)',
                        background: isOn ? `${pod.color}15` : 'rgba(255,255,255,0.04)',
                        border:     `1px solid ${isOn ? `${pod.color}30` : 'rgba(255,255,255,0.06)'}`,
                      }}
                    >
                      {isOn ? 'LIVE' : 'OFF'}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 transition-opacity shrink-0" style={{ color: pod.color }} />
                  </Link>
                );
              })}

              <div
                className="flex items-center gap-3 p-3 rounded-lg opacity-35"
                style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)' }}
              >
                <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}>
                  <Activity className="w-4 h-4 text-white/20" />
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-white/40">Q-MÉTIER</p>
                  <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>Trade Intelligence</p>
                </div>
                <span className="text-[8px] font-bold px-1.5 py-0.5 rounded tracking-widest" style={{ color: '#FFB830', background: 'rgba(255,184,48,0.08)', border: '1px solid rgba(255,184,48,0.15)' }}>BETA</span>
              </div>
            </div>
          </MetalPanel>

          <MetalPanel className="p-4" accent="#FF3B3B">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-3.5 h-3.5" style={{ color: '#FFB830' }} />
              <p className="text-[9px] font-bold tracking-[0.22em] uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>
                LIVE_THREATS {vulns.length > 0 && `(${vulns.length})`}
              </p>
            </div>
            <div className="space-y-2">
              {vulns.length > 0 ? vulns.slice(0, 4).map((v) => {
                const col = SEVERITY_COLOR[v.severity ?? 'LOW'] ?? '#39FF14';
                return (
                  <div key={v.id} className="flex items-start gap-2.5 py-1">
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: col, boxShadow: `0 0 4px ${col}` }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] text-white/60 truncate">{v.target_name ?? v.target_url}</p>
                      <p className="text-[9px] mt-0.5" style={{ color: 'rgba(255,255,255,0.2)' }}>{v.vulnerability_type ?? 'UNKNOWN'}</p>
                    </div>
                    <span className="text-[8px] font-bold px-1 py-0.5 rounded shrink-0" style={{ color: col, background: `${col}15`, border: `1px solid ${col}25` }}>
                      {v.status}
                    </span>
                  </div>
                );
              }) : [
                { msg: 'Conversion Catalyst: 11 high-impact kinks on example.ca', time: '2m', color: '#FF3B3B' },
                { msg: 'Cyberhawk scan complete — $5.2K opportunity',              time: '12m', color: '#FFB830' },
                { msg: 'Fleet telemetry nominal — all pods reporting',              time: '1h',  color: '#39FF14' },
              ].map((a, i) => (
                <div key={i} className="flex items-start gap-2.5 py-1">
                  <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: a.color, boxShadow: `0 0 4px ${a.color}` }} />
                  <p className="text-[10px] text-white/50 flex-1">{a.msg}</p>
                  <span className="text-[9px] shrink-0" style={{ color: 'rgba(255,255,255,0.15)' }}>{a.time}</span>
                </div>
              ))}
            </div>
          </MetalPanel>

          <MetalPanel className="p-4">
            <p className="text-[9px] font-bold tracking-[0.22em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>FLEET_STREAM</p>
            <FleetTelemetryFeed />
          </MetalPanel>
        </div>
      </div>

      <div
        className="mx-6 mb-6 px-5 py-3 rounded-xl flex items-center gap-6"
        style={{
          background: 'linear-gradient(160deg, #141921 0%, #0e1318 100%)',
          border: '1px solid rgba(255,255,255,0.04)',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
        }}
      >
        {[
          { label: 'TOTAL_REV_RECOVERED', value: `$${(totalRevenue / 1000).toFixed(1)}K`, color: '#39FF14' },
          { label: 'KINKS_IDENTIFIED',    value: totalKinks.toString(),                    color: '#FFB830' },
          { label: 'SCANS_EXECUTED',      value: scanCount.toString(),                     color: '#4A9EFF' },
          { label: 'AVG_IMPACT_SCAN',     value: '$1.6K',                                  color: '#FF3B3B' },
          { label: 'PODS_ACTIVE',         value: `${Object.values(podToggles).filter(Boolean).length} / 4`, color: '#39FF14' },
        ].map((stat) => (
          <div key={stat.label} className="flex-1 min-w-0">
            <p className="text-[9px] tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>{stat.label}</p>
            <p className="text-sm font-bold font-mono mt-0.5" style={{ color: stat.color, textShadow: `0 0 10px ${stat.color}55` }}>{stat.value}</p>
          </div>
        ))}
        <div className="flex items-center gap-2 shrink-0">
          <Server className="w-4 h-4" style={{ color: 'rgba(255,255,255,0.15)' }} />
          <TrendingUp className="w-4 h-4" style={{ color: '#39FF14' }} />
          <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: '#39FF14' }}>NOMINAL</span>
        </div>
      </div>
    </div>
  );
}
