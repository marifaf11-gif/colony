"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { RadarScanner, type RadarBlip } from '@/components/colony/radar-scanner';
import { CncToggle } from '@/components/colony/cnc-toggle';
import { FleetTelemetryFeed } from '@/components/colony/fleet-telemetry-feed';
import { Zap, Eye, Activity, TrendingUp, ChevronRight, Crosshair, Radio, Server, Shield, Search, X, ExternalLink, Mail, MessageSquare, Loader as Loader2, CreditCard, Filter } from 'lucide-react';

interface HubClientProps { locale: string }

interface StrikeRow {
  id: string;
  company_name: string;
  website: string;
  contact_email: string | null;
  sector: string;
  city: string;
  tech_stack: string[];
  loi25_gaps: string[];
  severity: string;
  revenue_value: number;
  status: string;
  audit_data: Record<string, unknown>;
  email_draft: string | null;
  created_at: string;
}

const SEVERITY_COLOR: Record<string, string> = {
  HIGH:   '#FF3B3B',
  MEDIUM: '#FFB830',
  LOW:    '#39FF14',
};

const SEV_TO_BLIP: Record<string, 'high' | 'mid' | 'low'> = {
  HIGH: 'high', MEDIUM: 'mid', LOW: 'low',
};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;

function MetalPanel({ children, className, accent }: { children: React.ReactNode; className?: string; accent?: string }) {
  return (
    <div
      className={`relative rounded-xl overflow-hidden ${className ?? ''}`}
      style={{
        background: 'linear-gradient(160deg, #252d3a 0%, #1a2130 45%, #111820 100%)',
        border: `1px solid ${accent ? `${accent}22` : 'rgba(255,255,255,0.06)'}`,
        boxShadow: `inset 0 1px 0 rgba(255,255,255,0.06), inset 0 -1px 0 rgba(0,0,0,0.5), 0 6px 24px rgba(0,0,0,0.55)${accent ? `, 0 0 32px ${accent}0a` : ''}`,
      }}
    >
      <div className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 1px, rgba(255,255,255,0.008) 1px, rgba(255,255,255,0.008) 2px)' }}
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
        <div className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}aa, ${color})`, boxShadow: `0 0 6px ${color}66` }} />
      </div>
    </div>
  );
}

function LiveIndicator({ color = '#39FF14' }: { color?: string }) {
  return (
    <span className="relative flex items-center justify-center w-2 h-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: color }} />
      <span className="relative inline-flex rounded-full w-1.5 h-1.5" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
    </span>
  );
}

function AuditModal({ strike, onClose, onStrike }: { strike: StrikeRow; onClose: () => void; onStrike: (id: string) => void }) {
  const [striking, setStriking]         = useState(false);
  const [checkingOut, setCheckingOut]   = useState(false);
  const [strikeResult, setStrikeResult] = useState<{ gmail_draft_link?: string; whatsapp_link?: string } | null>(null);
  const col = SEVERITY_COLOR[strike.severity] ?? '#39FF14';

  const handleStrike = async () => {
    setStriking(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/strike-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ strike_id: strike.id }),
      });
      const data = await res.json();
      setStrikeResult(data);
      onStrike(strike.id);
    } catch {
      setStrikeResult({ gmail_draft_link: undefined, whatsapp_link: undefined });
    } finally {
      setStriking(false);
    }
  };

  const handleCheckout = async () => {
    setCheckingOut(true);
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ strike_id: strike.id }),
      });
      const data = await res.json();
      if (data.url) window.open(data.url, '_blank');
    } catch { /* silent */ }
    finally { setCheckingOut(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <MetalPanel className="w-full max-w-lg" accent={col}>
        <div className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: `1px solid ${col}18` }}>
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full" style={{ background: col, boxShadow: `0 0 8px ${col}` }} />
            <span className="text-sm font-bold text-white">{strike.company_name}</span>
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded tracking-widest"
              style={{ color: col, background: `${col}15`, border: `1px solid ${col}30` }}>
              {strike.severity}
            </span>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white/70 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '10px 14px' }}>
              <p className="text-[9px] tracking-widest uppercase mb-1" style={{ color: 'rgba(255,255,255,0.25)' }}>TARGET</p>
              <a href={strike.website} target="_blank" rel="noreferrer"
                className="text-[11px] font-mono flex items-center gap-1 hover:underline" style={{ color: '#4A9EFF' }}>
                {strike.website.replace('https://', '')}
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 8, padding: '10px 14px' }}>
              <p className="text-[9px] tracking-widest uppercase mb-1" style={{ color: 'rgba(255,255,255,0.25)' }}>BOUNTY</p>
              <p className="text-sm font-bold font-mono" style={{ color: '#39FF14', textShadow: '0 0 8px rgba(57,255,20,0.4)' }}>
                ${(strike.revenue_value / 100).toLocaleString('en-CA')}
              </p>
            </div>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '12px 14px' }}>
            <p className="text-[9px] tracking-widest uppercase mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>TECH STACK</p>
            <div className="flex flex-wrap gap-1.5">
              {(strike.tech_stack ?? []).map((t: string) => (
                <span key={t} className="text-[9px] px-2 py-0.5 rounded font-mono"
                  style={{ background: 'rgba(74,158,255,0.1)', border: '1px solid rgba(74,158,255,0.2)', color: '#4A9EFF' }}>
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div style={{ background: `${col}08`, border: `1px solid ${col}20`, borderRadius: 8, padding: '12px 14px' }}>
            <p className="text-[9px] tracking-widest uppercase mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
              LOI 25 GAPS ({(strike.loi25_gaps ?? []).length})
            </p>
            <div className="space-y-1.5">
              {(strike.loi25_gaps ?? []).slice(0, 5).map((gap: string, i: number) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="w-1 h-1 rounded-full mt-1.5 shrink-0" style={{ background: col }} />
                  <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.55)' }}>{gap}</p>
                </div>
              ))}
            </div>
          </div>

          {strike.contact_email && (
            <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 8, padding: '10px 14px' }}>
              <p className="text-[9px] tracking-widest uppercase mb-1" style={{ color: 'rgba(255,255,255,0.25)' }}>CONTACT</p>
              <p className="text-[11px] font-mono" style={{ color: 'rgba(255,255,255,0.6)' }}>{strike.contact_email}</p>
            </div>
          )}

          {strikeResult ? (
            <div style={{ background: 'rgba(57,255,20,0.06)', border: '1px solid rgba(57,255,20,0.2)', borderRadius: 8, padding: '14px' }}>
              <p className="text-[9px] font-bold tracking-widest uppercase mb-3" style={{ color: '#39FF14' }}>EMAIL STAGED — READY TO SEND</p>
              <div className="flex flex-wrap gap-2">
                {strikeResult.gmail_draft_link && (
                  <a href={strikeResult.gmail_draft_link} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold tracking-wider transition-all hover:scale-105"
                    style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff' }}>
                    <Mail className="w-3.5 h-3.5" />
                    OPEN GMAIL DRAFT
                  </a>
                )}
                {strikeResult.whatsapp_link && (
                  <a href={strikeResult.whatsapp_link} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold tracking-wider transition-all hover:scale-105"
                    style={{ background: 'rgba(37,211,102,0.1)', border: '1px solid rgba(37,211,102,0.25)', color: '#25D366' }}>
                    <MessageSquare className="w-3.5 h-3.5" />
                    WHATSAPP
                  </a>
                )}
                <button
                  onClick={handleCheckout}
                  disabled={checkingOut}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-[10px] font-bold tracking-wider transition-all hover:scale-105 disabled:opacity-50"
                  style={{ background: 'rgba(57,255,20,0.1)', border: '1px solid rgba(57,255,20,0.3)', color: '#39FF14' }}>
                  {checkingOut ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
                  SEND $299 INVOICE
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <button
                onClick={handleStrike}
                disabled={striking}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-[11px] font-bold tracking-widest uppercase transition-all hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg, #3a0d0d, #5a1a1a)', border: '1px solid rgba(255,59,59,0.4)', color: '#FF3B3B', boxShadow: '0 0 20px rgba(255,59,59,0.15)' }}>
                {striking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Crosshair className="w-4 h-4" />}
                {striking ? 'STAGING STRIKE...' : 'EXECUTE STRIKE — STAGE EMAIL'}
              </button>
              <button
                onClick={handleCheckout}
                disabled={checkingOut}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'rgba(57,255,20,0.06)', border: '1px solid rgba(57,255,20,0.2)', color: '#39FF14' }}>
                {checkingOut ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CreditCard className="w-3.5 h-3.5" />}
                {checkingOut ? 'CREATING INVOICE...' : 'SEND $299 STRIPE INVOICE'}
              </button>
            </div>
          )}
        </div>
      </MetalPanel>
    </div>
  );
}

export function HubClient({ locale }: HubClientProps) {
  const [strikes, setStrikes]               = useState<StrikeRow[]>([]);
  const [podToggles, setPodToggles]         = useState<Record<string, boolean>>({
    'cyberhawk': true, 'conversion-catalyst': true, 'scout': false, 'kaltrac-v2': false,
  });
  const [scanning, setScanning]             = useState(false);
  const [selectedStrike, setSelectedStrike] = useState<StrikeRow | null>(null);
  const [highlightedBlipId, setHighlightedBlipId] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState<'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'>('ALL');

  const loadStrikes = useCallback(async () => {
    const sb = createClient();
    const { data } = await sb
      .from('strikes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    if (data) setStrikes(data as StrikeRow[]);
  }, []);

  useEffect(() => {
    loadStrikes();
    const sb = createClient();

    sb.from('app_state').select('is_scanning').eq('id', 1).maybeSingle()
      .then(({ data }) => { if (data) setScanning((data as unknown as { is_scanning: boolean }).is_scanning); });

    const ch = sb
      .channel('hub-rt')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'strikes' }, loadStrikes)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'app_state' }, ({ new: row }) => {
        setScanning((row as { is_scanning: boolean }).is_scanning ?? false);
      })
      .subscribe();

    return () => { sb.removeChannel(ch); };
  }, [loadStrikes]);

  const runScout = useCallback(async () => {
    setScanning(true);
    try {
      await fetch(`${SUPABASE_URL}/functions/v1/scout-engine?action=scan&sector=all`, {
        headers: { 'Authorization': `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}` },
      });
      await loadStrikes();
    } catch { /* silent */ }
    setScanning(false);
  }, [loadStrikes]);

  useEffect(() => {
    if (podToggles['scout']) {
      runScout();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [podToggles['scout']]);

  const exportCsv = useCallback(() => {
    const header = 'company_name,website,sector,severity,revenue_value,status,created_at';
    const rows = strikes.map((s) =>
      [s.company_name, s.website, s.sector, s.severity, (s.revenue_value / 100).toFixed(2), s.status, s.created_at]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    );
    const csv  = [header, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `strikes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }, [strikes]);

  const handleBlipClick = useCallback((blipId: string) => {
    const strike = strikes.find((s) => s.id === blipId);
    if (strike) {
      setSelectedStrike(strike);
      setHighlightedBlipId(blipId);
    }
  }, [strikes]);

  const handleStrikeCompleted = useCallback(async (strikeId: string) => {
    await loadStrikes();
    setHighlightedBlipId(null);
  }, [loadStrikes]);

  const filteredStrikes = severityFilter === 'ALL'
    ? strikes
    : strikes.filter((s) => s.severity === severityFilter);

  const radarBlips: RadarBlip[] = strikes.map((s, i) => ({
    id:       s.id,
    angle:    (i * 67 + 30) % 360,
    radius:   0.25 + (i * 0.13) % 0.65,
    label:    s.company_name,
    severity: SEV_TO_BLIP[s.severity] ?? 'mid',
    born:     new Date(s.created_at).getTime(),
  }));

  const totalRevenue = strikes.reduce((sum, s) => {
    if (s.status === 'BOUNTY_PAID' || s.status === 'STAGED' || s.status === 'SENT') return sum + s.revenue_value;
    return sum;
  }, 0);

  const projectedRevenue = strikes.reduce((sum, s) => sum + s.revenue_value, 0);
  const highCount   = strikes.filter((s) => s.severity === 'HIGH').length;
  const medCount    = strikes.filter((s) => s.severity === 'MEDIUM').length;
  const computedBounty = highCount * 5000 + medCount * 2500;
  const activeCount = strikes.filter((s) => s.status === 'AUDITED' || s.status === 'DETECTED').length;

  return (
    <div className="flex-1 overflow-y-auto bg-[#0d1117]" style={{ fontFamily: '"JetBrains Mono", "Fira Code", monospace' }}>
      {selectedStrike && (
        <AuditModal
          strike={selectedStrike}
          onClose={() => { setSelectedStrike(null); setHighlightedBlipId(null); }}
          onStrike={handleStrikeCompleted}
        />
      )}

      <div className="px-6 py-4 flex items-center justify-between"
        style={{ background: 'linear-gradient(180deg, #141921 0%, transparent 100%)', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #1e3a5f, #0d1f38)', border: '1px solid rgba(74,158,255,0.3)', boxShadow: '0 0 12px rgba(74,158,255,0.2)' }}>
            <Radio className="w-4 h-4" style={{ color: '#4A9EFF' }} />
          </div>
          <div>
            <h1 className="text-sm font-bold text-white tracking-tighter leading-none">COLONY_OS // MISSION_CONTROL</h1>
            <p className="text-[9px] mt-0.5 tracking-[0.18em]" style={{ color: '#39FF14' }}>SYSTEM_STATUS: OPTIMAL // SECTOR: MONTREAL_QC</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            {scanning ? <Loader2 className="w-3 h-3 animate-spin" style={{ color: '#FFB830' }} /> : <LiveIndicator color="#39FF14" />}
            <span className="text-[9px] font-bold uppercase tracking-widest"
              style={{ color: scanning ? '#FFB830' : '#39FF14' }}>
              {scanning ? 'SCANNING...' : 'LIVE'}
            </span>
          </div>
          <div className="text-right">
            <p className="text-[9px] tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>BOUNTY_POOL</p>
            <p className="text-sm font-bold font-mono" style={{ color: '#FFB830', textShadow: '0 0 12px rgba(255,184,48,0.4)' }}>
              ${computedBounty.toLocaleString('en-CA')}
            </p>
          </div>
          <Link href={`/${locale}/core/strike`}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #3a0d0d, #5a1a1a)', border: '1px solid rgba(255,59,59,0.35)', color: '#FF3B3B', boxShadow: '0 0 12px rgba(255,59,59,0.15)' }}>
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
              <CncToggle label="CYBERHAWK"     color="blue"  checked={podToggles['cyberhawk']}           onChange={(v) => setPodToggles((p) => ({ ...p, cyberhawk: v }))}           sublabel="Talon HUD Scanner" />
              <CncToggle label="CONV.CATALYST" color="green" checked={podToggles['conversion-catalyst']} onChange={(v) => setPodToggles((p) => ({ ...p, 'conversion-catalyst': v }))} sublabel="Revenue Leak Auditor" />
              <CncToggle label="SCOUT_ENGINE"  color="amber" checked={podToggles['scout']}               onChange={(v) => setPodToggles((p) => ({ ...p, scout: v }))}               sublabel="MTL Business Scanner" />
              <CncToggle label="KALTRAC_V2"    color="red"   checked={podToggles['kaltrac-v2']}          onChange={(v) => setPodToggles((p) => ({ ...p, 'kaltrac-v2': v }))}          sublabel="Arsenal API Engine" />
            </div>
            {scanning && (
              <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                <div className="flex items-center gap-2">
                  <Loader2 className="w-3 h-3 animate-spin" style={{ color: '#FFB830' }} />
                  <p className="text-[9px] tracking-wider" style={{ color: '#FFB830' }}>SCOUT SCANNING MTL...</p>
                </div>
              </div>
            )}
          </MetalPanel>

          <MetalPanel className="p-4" accent="#4A9EFF">
            <p className="text-[9px] font-bold tracking-[0.22em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>SYS_TELEMETRY</p>
            <div className="space-y-3">
              <StatBar label="TARGETS FOUND"   value={strikes.length}  max={50}  color="#4A9EFF" />
              <StatBar label="HIGH SEVERITY"   value={highCount}        max={20}  color="#FF3B3B" />
              <StatBar label="MEDIUM SEVERITY" value={medCount}         max={30}  color="#FFB830" />
              <StatBar label="STRIKES STAGED"  value={strikes.filter((s) => s.status === 'STAGED').length} max={20} color="#39FF14" />
            </div>
          </MetalPanel>

          <MetalPanel className="p-4" accent="#39FF14">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-3.5 h-3.5" style={{ color: '#39FF14' }} />
              <p className="text-[9px] font-bold tracking-[0.18em] uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>AI_COORDINATOR</p>
              <LiveIndicator color="#39FF14" />
            </div>
            <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
              {strikes.length > 0
                ? `${activeCount} targets awaiting audit. ${highCount} HIGH severity Loi 25 violations detected in MTL sector.`
                : '"Toggle SCOUT_ENGINE to begin scanning Montreal sector for revenue leaks."'}
            </p>
            <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
              <div className="flex justify-between">
                <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.2)' }}>SECTOR</span>
                <span className="text-[9px] font-bold" style={{ color: '#4A9EFF' }}>MONTREAL_QC</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.2)' }}>PROJECTED</span>
                <span className="text-[9px] font-bold" style={{ color: '#39FF14' }}>
                  ${(projectedRevenue / 100).toLocaleString('en-CA')}
                </span>
              </div>
            </div>
          </MetalPanel>
        </div>

        <div className="col-span-5">
          <MetalPanel className="h-full" accent="#39FF14">
            <div className="flex items-center justify-between px-5 py-3"
              style={{ borderBottom: '1px solid rgba(57,255,20,0.08)' }}>
              <div className="flex items-center gap-2">
                <Crosshair className="w-3.5 h-3.5" style={{ color: '#39FF14' }} />
                <span className="text-[9px] font-bold tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  TACTICAL_RADAR // SECTOR_MTL
                </span>
              </div>
              <div className="flex items-center gap-3 text-[9px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                <span>CLICK BLIP TO AUDIT</span>
                <span style={{ color: 'rgba(57,255,20,0.5)' }}>■</span><span>LOW</span>
                <span style={{ color: 'rgba(255,184,48,0.5)' }}>■</span><span>MID</span>
                <span style={{ color: 'rgba(255,59,59,0.5)' }}>■</span><span>HIGH</span>
              </div>
            </div>

            <div className="flex items-center justify-center py-6">
              <RadarScanner
                externalBlips={radarBlips.length > 0 ? radarBlips : undefined}
                onBlipClick={handleBlipClick}
                highlightedId={highlightedBlipId}
              />
            </div>

            <div className="px-5 py-3 flex items-center justify-between"
              style={{ borderTop: '1px solid rgba(57,255,20,0.08)' }}>
              <span className="text-[9px] font-bold tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>
                TARGETS_TRACKED: {strikes.length || '—'}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-[9px] font-mono" style={{ color: '#39FF14' }}>
                  BOUNTY_POOL: ${computedBounty.toLocaleString('en-CA')}
                </span>
                <LiveIndicator color="#39FF14" />
              </div>
            </div>
          </MetalPanel>
        </div>

        <div className="col-span-4 space-y-4">
          <MetalPanel className="p-4" accent="#FF3B3B">
            <div className="flex items-center gap-2 mb-2">
              <Search className="w-3.5 h-3.5" style={{ color: '#FFB830' }} />
              <p className="text-[9px] font-bold tracking-[0.22em] uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>
                LIVE_STRIKES {strikes.length > 0 && `(${filteredStrikes.length}/${strikes.length})`}
              </p>
              {scanning && <Loader2 className="w-3 h-3 animate-spin" style={{ color: '#FFB830' }} />}
              <button onClick={exportCsv} title="Export CSV"
                className="ml-auto flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold tracking-wider transition-all hover:opacity-80"
                style={{ background: 'rgba(74,158,255,0.1)', border: '1px solid rgba(74,158,255,0.2)', color: '#4A9EFF' }}>
                <TrendingUp className="w-2.5 h-2.5" />
                CSV
              </button>
            </div>
            <div className="flex gap-1 mb-2">
              {(['ALL', 'HIGH', 'MEDIUM', 'LOW'] as const).map((sev) => {
                const sevColor = sev === 'HIGH' ? '#FF3B3B' : sev === 'MEDIUM' ? '#FFB830' : sev === 'LOW' ? '#39FF14' : 'rgba(255,255,255,0.4)';
                const active   = severityFilter === sev;
                return (
                  <button key={sev} onClick={() => setSeverityFilter(sev)}
                    className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-bold tracking-widest transition-all"
                    style={{
                      color:      active ? (sev === 'ALL' ? '#fff' : sevColor) : 'rgba(255,255,255,0.25)',
                      background: active ? (sev === 'ALL' ? 'rgba(255,255,255,0.08)' : `${sevColor}15`) : 'transparent',
                      border:     `1px solid ${active ? (sev === 'ALL' ? 'rgba(255,255,255,0.15)' : `${sevColor}35`) : 'rgba(255,255,255,0.06)'}`,
                    }}>
                    {sev !== 'ALL' && <Filter className="w-2 h-2" />}
                    {sev}
                  </button>
                );
              })}
            </div>
            <div className="space-y-1.5 max-h-[220px] overflow-y-auto">
              {filteredStrikes.length > 0 ? filteredStrikes.slice(0, 8).map((s) => {
                const col = SEVERITY_COLOR[s.severity] ?? '#39FF14';
                return (
                  <button key={s.id}
                    onClick={() => { setSelectedStrike(s); setHighlightedBlipId(s.id); }}
                    className="w-full text-left flex items-start gap-2.5 py-2 px-2 rounded-lg transition-all hover:bg-white/5"
                    style={{ border: `1px solid ${highlightedBlipId === s.id ? `${col}30` : 'transparent'}` }}>
                    <div className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: col, boxShadow: `0 0 4px ${col}` }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-bold truncate" style={{ color: 'rgba(255,255,255,0.75)' }}>{s.company_name}</p>
                      <p className="text-[9px] mt-0.5 truncate" style={{ color: 'rgba(255,255,255,0.25)' }}>{s.website.replace('https://', '')}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="text-[8px] font-bold px-1 py-0.5 rounded"
                        style={{ color: col, background: `${col}15`, border: `1px solid ${col}25` }}>
                        {s.severity}
                      </span>
                      <p className="text-[9px] mt-1 font-mono" style={{ color: '#39FF14' }}>
                        ${(s.revenue_value / 100).toLocaleString('en-CA')}
                      </p>
                    </div>
                  </button>
                );
              }) : (
                <div className="py-6 text-center">
                  <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
                    {strikes.length > 0 ? `No ${severityFilter} targets` : 'Toggle SCOUT_ENGINE to populate targets'}
                  </p>
                </div>
              )}
            </div>
          </MetalPanel>

          <MetalPanel className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Activity className="w-3.5 h-3.5" style={{ color: '#4A9EFF' }} />
              <p className="text-[9px] font-bold tracking-[0.22em] uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>FLEET_PODS</p>
            </div>
            <div className="space-y-2">
              {[
                { slug: 'conversion-catalyst', name: 'Conversion Catalyst', tagline: 'Revenue Leak Auditor', href: '/pods/conversion-catalyst', color: '#39FF14', Icon: Zap },
                { slug: 'cyberhawk',           name: 'Cyberhawk',           tagline: 'Talon HUD Scanner',    href: '/pods/cyberhawk',           color: '#4A9EFF', Icon: Eye },
              ].map(({ slug, name, tagline, href, color, Icon }) => {
                const isOn = podToggles[slug];
                return (
                  <Link key={slug} href={`/${locale}${href}`}
                    className="group flex items-center gap-3 p-3 rounded-lg transition-all duration-200"
                    style={{
                      background: isOn ? `${color}0a` : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${isOn ? `${color}25` : 'rgba(255,255,255,0.05)'}`,
                    }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                      style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                      <Icon className="w-4 h-4" style={{ color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-white">{name}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>{tagline}</p>
                    </div>
                    <span className="text-[8px] font-bold px-1.5 py-0.5 rounded tracking-widest"
                      style={{ color: isOn ? color : 'rgba(255,255,255,0.2)', background: isOn ? `${color}15` : 'rgba(255,255,255,0.04)', border: `1px solid ${isOn ? `${color}30` : 'rgba(255,255,255,0.06)'}` }}>
                      {isOn ? 'LIVE' : 'OFF'}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-0 group-hover:opacity-50 transition-opacity shrink-0" style={{ color }} />
                  </Link>
                );
              })}
            </div>
          </MetalPanel>

          <MetalPanel className="p-4">
            <p className="text-[9px] font-bold tracking-[0.22em] uppercase mb-3" style={{ color: 'rgba(255,255,255,0.25)' }}>FLEET_STREAM</p>
            <FleetTelemetryFeed />
          </MetalPanel>
        </div>
      </div>

      <div className="mx-6 mb-6 px-5 py-3 rounded-xl flex items-center gap-6"
        style={{ background: 'linear-gradient(160deg, #141921 0%, #0e1318 100%)', border: '1px solid rgba(255,255,255,0.04)', boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)' }}>
        {[
          { label: 'BOUNTY_POOL',      value: `$${computedBounty.toLocaleString('en-CA')}`,             color: '#39FF14' },
          { label: 'HIGH_THREATS',     value: highCount.toString(),                                      color: '#FF3B3B' },
          { label: 'MEDIUM_THREATS',   value: medCount.toString(),                                       color: '#FFB830' },
          { label: 'PROJECTED_REV',    value: `$${(projectedRevenue / 100).toLocaleString('en-CA')}`,   color: '#4A9EFF' },
          { label: 'STRIKES_STAGED',   value: strikes.filter((s) => s.status === 'STAGED').length.toString(), color: '#39FF14' },
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
