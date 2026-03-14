"use client";

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getRecentLogs, subscribeToLogs } from '@/lib/agents/terminal-logger';
import { getTodayBudgetSummary, getAllTimeBounties } from '@/lib/agents/budget-tracker';
import { getArsenalTools, seedArsenal } from '@/lib/arsenal/loader';
import { selectWeapon } from '@/lib/arsenal/weaponry-selector';
import type { TerminalLog, AgentBudget, VulnerabilityLog } from '@/lib/agents/types';
import type { ArsenalTool } from '@/lib/arsenal/loader';
import { Crosshair, Zap, Shield, TrendingUp, Target, Activity, Play, Search, ChevronRight, ExternalLink, TriangleAlert as AlertTriangle } from 'lucide-react';

const AGENT_COLORS: Record<string, string> = {
  HOUND: '#39FF14',
  HAWK: '#4A9EFF',
  GENERAL: '#FFB830',
  SYSTEM: '#666',
  ARSENAL: '#FF69B4',
};

const SEV_COLORS: Record<string, string> = {
  Critical: '#FF0000',
  High: '#FF4500',
  Medium: '#FFA500',
  Low: '#39FF14',
};

function formatTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString('en-CA', {
      hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
    });
  } catch { return '--:--:--'; }
}

interface StrikeClientProps {
  locale: string;
}

export function StrikeClient({ locale: _locale }: StrikeClientProps) {
  const [targetUrl, setTargetUrl] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<TerminalLog[]>([]);
  const [vulns, setVulns] = useState<VulnerabilityLog[]>([]);
  const [budget, setBudget] = useState<AgentBudget[]>([]);
  const [allTimeBounties, setAllTimeBounties] = useState(0);
  const [arsenalTools, setArsenalTools] = useState<ArsenalTool[]>([]);
  const [weaponQuery, setWeaponQuery] = useState('');
  const [weaponResults, setWeaponResults] = useState<{ tool: ArsenalTool; score: number; reasoning: string }[]>([]);
  const [lastResult, setLastResult] = useState<{ vulnId: string; stripeLink: string; findings: number } | null>(null);

  const loadData = useCallback(async () => {
    const [logsData, budgetData, bountiesData, toolsData] = await Promise.all([
      getRecentLogs(40),
      getTodayBudgetSummary(),
      getAllTimeBounties(),
      getArsenalTools(),
    ]);
    setLogs(logsData.reverse());
    setBudget(budgetData);
    setAllTimeBounties(bountiesData);
    setArsenalTools(toolsData);

    await seedArsenal();

    const supabase = createClient();
    const { data } = await supabase
      .from('vulnerability_log')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    setVulns((data ?? []) as VulnerabilityLog[]);
  }, []);

  useEffect(() => {
    loadData();
    const unsub = subscribeToLogs((log) => {
      setLogs((prev) => [log, ...prev].slice(0, 60));
    });
    return unsub;
  }, [loadData]);

  const runStrike = async () => {
    if (!targetUrl.trim() || isRunning) return;
    setIsRunning(true);
    setLastResult(null);
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
      const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
      const res = await fetch(`${supabaseUrl}/functions/v1/strike-engine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${anonKey}`,
        },
        body: JSON.stringify({ target_url: targetUrl }),
      });
      const data = await res.json();
      if (data.success) {
        setLastResult({
          vulnId: data.vulnerability_id,
          stripeLink: data.stripe_link,
          findings: data.findings_count,
        });
        await loadData();
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsRunning(false);
    }
  };

  const runWeaponSearch = async () => {
    if (!weaponQuery.trim()) return;
    const results = await selectWeapon({ task: weaponQuery, topK: 3 });
    setWeaponResults(results);
  };

  const totalSpend = budget.reduce((s, b) => s + b.spend_usd, 0);
  const totalTokens = budget.reduce((s, b) => s + b.tokens_used, 0);
  const totalRequests = budget.reduce((s, b) => s + b.requests_made, 0);

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1
            className="text-2xl font-bold text-white leading-none flex items-center gap-3"
            style={{ textShadow: '0 0 20px rgba(255,69,0,0.3)' }}
          >
            <Crosshair className="w-6 h-6" style={{ color: '#FF4500' }} />
            Strike Engine
          </h1>
          <p className="text-sm text-white/40 mt-1.5">Autonomous Revenue Recovery — HOUND / HAWK / GENERAL</p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: '#FF4500', boxShadow: '0 0 8px #FF4500' }}
          />
          <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#FF4500' }}>
            {isRunning ? 'Strike in Progress' : 'Awaiting Target'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'All-Time Bounties', value: `$${(allTimeBounties / 1000).toFixed(1)}K`, icon: TrendingUp, color: '#39FF14' },
          { label: 'Vulns Discovered', value: vulns.length.toString(), icon: Target, color: '#FF4500' },
          { label: "Today's Spend", value: `$${totalSpend.toFixed(4)}`, icon: Activity, color: '#FFB830' },
          { label: 'API Requests', value: totalRequests.toString(), icon: Zap, color: '#4A9EFF' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-xl p-4"
            style={{
              background: 'linear-gradient(145deg, #1a1f28 0%, #111520 100%)',
              border: `1px solid ${color}20`,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-3.5 h-3.5" style={{ color }} />
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/25">{label}</span>
            </div>
            <div className="text-2xl font-bold font-mono" style={{ color }}>{value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          className="rounded-xl p-5"
          style={{
            background: 'linear-gradient(145deg, #1a1005 0%, #110a03 100%)',
            border: '1px solid rgba(255,69,0,0.2)',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Crosshair className="w-4 h-4" style={{ color: '#FF4500' }} />
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#FF4500' }}>
              Launch Strike
            </p>
          </div>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={targetUrl}
              onChange={(e) => setTargetUrl(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runStrike()}
              placeholder="https://target-domain.com"
              className="flex-1 bg-black/40 rounded-lg px-4 py-2.5 text-sm text-white placeholder-white/20 font-mono outline-none transition-all"
              style={{
                border: '1px solid rgba(255,69,0,0.2)',
              }}
              disabled={isRunning}
            />
            <button
              onClick={runStrike}
              disabled={isRunning || !targetUrl.trim()}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider transition-all disabled:opacity-40"
              style={{
                background: isRunning ? 'rgba(255,69,0,0.2)' : 'rgba(255,69,0,0.8)',
                border: '1px solid rgba(255,69,0,0.4)',
                color: '#fff',
              }}
            >
              {isRunning ? (
                <>
                  <div
                    className="w-3.5 h-3.5 rounded-full border-2 animate-spin"
                    style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: '#fff' }}
                  />
                  Running
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  Strike
                </>
              )}
            </button>
          </div>

          {isRunning && (
            <div
              className="rounded-lg p-3 font-mono text-xs"
              style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,69,0,0.1)' }}
            >
              <div className="flex items-center gap-2 text-white/60">
                <div
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{ background: '#39FF14', boxShadow: '0 0 4px #39FF14' }}
                />
                HOUND: Scanning {targetUrl}...
              </div>
            </div>
          )}

          {lastResult && !isRunning && (
            <div
              className="rounded-lg p-3 space-y-2"
              style={{ background: 'rgba(57,255,20,0.05)', border: '1px solid rgba(57,255,20,0.2)' }}
            >
              <div className="flex items-center gap-2 text-xs font-bold" style={{ color: '#39FF14' }}>
                <Zap className="w-3.5 h-3.5" />
                Strike Complete — {lastResult.findings} finding(s) logged
              </div>
              <a
                href={lastResult.stripeLink}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Remediation link generated
              </a>
            </div>
          )}
        </div>

        <div
          className="rounded-xl p-5"
          style={{
            background: 'linear-gradient(145deg, #050a1a 0%, #030710 100%)',
            border: '1px solid rgba(255,105,180,0.15)',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Search className="w-4 h-4" style={{ color: '#FF69B4' }} />
            <p className="text-xs font-bold uppercase tracking-widest" style={{ color: '#FF69B4' }}>
              WeaponrySelector
            </p>
          </div>

          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={weaponQuery}
              onChange={(e) => setWeaponQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && runWeaponSearch()}
              placeholder="Find emails for Quebec law firms..."
              className="flex-1 bg-black/40 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 outline-none"
              style={{ border: '1px solid rgba(255,105,180,0.15)' }}
            />
            <button
              onClick={runWeaponSearch}
              className="px-3 py-2 rounded-lg text-xs font-bold transition-all"
              style={{ background: 'rgba(255,105,180,0.15)', border: '1px solid rgba(255,105,180,0.2)', color: '#FF69B4' }}
            >
              Select
            </button>
          </div>

          <div className="space-y-2">
            {weaponResults.length > 0 ? weaponResults.map((r, i) => (
              <div
                key={r.tool.id}
                className="rounded-lg p-3"
                style={{
                  background: i === 0 ? 'rgba(255,105,180,0.07)' : 'rgba(255,255,255,0.02)',
                  border: i === 0 ? '1px solid rgba(255,105,180,0.2)' : '1px solid rgba(255,255,255,0.05)',
                }}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-white">{r.tool.name}</span>
                  {i === 0 && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,105,180,0.2)', color: '#FF69B4' }}>
                      TOP PICK
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-white/40 mb-1">{r.reasoning}</p>
                <div className="flex gap-2">
                  <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}>
                    {r.tool.category}
                  </span>
                  <span className="text-[9px] text-white/20">{(r.tool.success_rate * 100).toFixed(0)}% success</span>
                </div>
              </div>
            )) : arsenalTools.slice(0, 3).map((tool) => (
              <div
                key={tool.id}
                className="flex items-center gap-3 rounded-lg p-2.5"
                style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}
              >
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-white/70 truncate">{tool.name}</p>
                  <p className="text-[10px] text-white/25">{tool.category} · {(tool.success_rate * 100).toFixed(0)}% success</p>
                </div>
                <ChevronRight className="w-3 h-3 text-white/20 shrink-0" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div
          className="rounded-xl p-5"
          style={{
            background: 'linear-gradient(145deg, #0a0f0a 0%, #060908 100%)',
            border: '1px solid rgba(57,255,20,0.1)',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4" style={{ color: '#FF4500' }} />
            <p className="text-xs font-bold uppercase tracking-widest text-white/30">
              Vulnerability Log
            </p>
          </div>

          {vulns.length === 0 ? (
            <p className="text-xs text-white/20 text-center py-4">No kinks discovered yet. Launch a strike.</p>
          ) : (
            <div className="space-y-2">
              {vulns.slice(0, 6).map((v) => {
                const rawTitle = (v.raw_data?.['title'] as string | undefined) ?? v.vulnerability_type ?? 'Unknown';
                const impactEst = v.raw_data?.['impact_estimate'];
                const stripeLink = v.raw_data?.['stripe_link'] as string | undefined;
                return (
                  <div
                    key={v.id}
                    className="rounded-lg p-3"
                    style={{
                      borderLeft: `3px solid ${SEV_COLORS[v.severity ?? ''] ?? '#888'}`,
                      background: 'rgba(255,255,255,0.02)',
                    }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{rawTitle}</p>
                        <p className="text-[10px] text-white/30 mt-0.5 font-mono truncate">{v.target_url}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <span
                          className="text-[9px] font-bold px-1.5 py-0.5 rounded"
                          style={{ color: SEV_COLORS[v.severity ?? ''], background: `${SEV_COLORS[v.severity ?? '']}18` }}
                        >
                          {v.severity ?? 'Unknown'}
                        </span>
                        {impactEst != null && (
                          <p className="text-[10px] font-mono mt-1" style={{ color: '#39FF14' }}>
                            +${Number(impactEst).toLocaleString('en-CA')}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span
                        className="text-[9px] px-1.5 py-0.5 rounded"
                        style={{ background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.3)' }}
                      >
                        {v.status}
                      </span>
                      {stripeLink && (
                        <a
                          href={stripeLink}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[9px] flex items-center gap-1 transition-colors"
                          style={{ color: 'rgba(57,255,20,0.5)' }}
                        >
                          <ExternalLink className="w-2.5 h-2.5" />
                          $299
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div
          className="rounded-xl p-5"
          style={{
            background: 'linear-gradient(145deg, #0a0c14 0%, #060810 100%)',
            border: '1px solid rgba(74,158,255,0.1)',
          }}
        >
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4" style={{ color: '#FFB830' }} />
            <p className="text-xs font-bold uppercase tracking-widest text-white/30">
              The General — Budget Ledger
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: 'Tokens', value: totalTokens.toLocaleString(), color: '#4A9EFF' },
              { label: 'Requests', value: totalRequests.toString(), color: '#FFB830' },
              { label: 'USD Spent', value: `$${totalSpend.toFixed(4)}`, color: '#FF4500' },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="rounded-lg p-2.5 text-center"
                style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${color}20` }}
              >
                <div className="text-xs font-bold font-mono" style={{ color }}>{value}</div>
                <div className="text-[9px] text-white/20 mt-0.5">{label}</div>
              </div>
            ))}
          </div>

          {budget.length > 0 ? budget.map((b) => (
            <div
              key={b.agent_name}
              className="flex items-center gap-3 py-2"
              style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}
            >
              <span
                className="text-[10px] font-bold w-16 uppercase"
                style={{ color: AGENT_COLORS[b.agent_name.toUpperCase()] ?? '#888' }}
              >
                {b.agent_name}
              </span>
              <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${Math.min((b.spend_usd / 10) * 100, 100)}%`,
                    background: AGENT_COLORS[b.agent_name.toUpperCase()] ?? '#888',
                  }}
                />
              </div>
              <span className="text-[10px] font-mono text-white/30 w-16 text-right">
                ${b.spend_usd.toFixed(4)}
              </span>
            </div>
          )) : (
            <p className="text-xs text-white/20 text-center py-4">No budget activity today.</p>
          )}
        </div>
      </div>

      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: 'linear-gradient(180deg, #0a0f0a 0%, #06090a 100%)',
          border: '1px solid rgba(57,255,20,0.12)',
        }}
      >
        <div
          className="flex items-center gap-2 px-4 py-3"
          style={{ borderBottom: '1px solid rgba(57,255,20,0.08)' }}
        >
          <div
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: '#39FF14', boxShadow: '0 0 6px #39FF14' }}
          />
          <span className="text-[10px] font-bold uppercase tracking-[0.2em]" style={{ color: '#39FF14' }}>
            Cross-Agent Handoff Log
          </span>
        </div>
        <div className="p-2 max-h-64 overflow-y-auto" style={{ scrollbarWidth: 'none' }}>
          {logs.length === 0 ? (
            <p className="text-xs text-white/20 text-center py-4 font-mono">Awaiting agent activity...</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="flex gap-2 py-0.5 px-2 font-mono text-[11px] leading-5">
                <span className="shrink-0 text-white/20">{formatTime(log.created_at)}</span>
                <span
                  className="shrink-0 font-bold w-16"
                  style={{ color: AGENT_COLORS[log.agent] ?? '#888' }}
                >
                  {log.agent}
                </span>
                <span
                  className="shrink-0 font-bold w-24 text-[10px]"
                  style={{ color: '#666' }}
                >
                  {log.event_type}
                </span>
                <span className="text-white/50 truncate">{log.message}</span>
              </div>
            ))
          )}
        </div>
        <div
          className="px-4 py-2 flex items-center gap-1.5"
          style={{ borderTop: '1px solid rgba(57,255,20,0.06)' }}
        >
          <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#39FF14' }} />
          <span className="font-mono text-[10px] text-white/20">{`> colony-os strike-engine ready_`}</span>
        </div>
      </div>
    </div>
  );
}
