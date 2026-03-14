"use client";

import { useState } from 'react';
import { TalonHud } from '@/components/pods/talon-hud';
import { DashboardSidebar } from '@/components/colony/dashboard-sidebar';
import { runCyberhawkScan, type CyberhawkStep, type CyberhawkResult } from '@/lib/pods/cyberhawk-engine';
import { TriangleAlert as AlertTriangle, Globe, Shield, Download, Loader as Loader2, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Locale } from '@/lib/i18n/config';

const SEVERITY_COLOR: Record<string, string> = {
  Critical: '#FF3B3B',
  High: '#E74C3C',
  Medium: '#FFB830',
  Low: '#39FF14',
};

const STEP_LABELS: Record<CyberhawkStep, string> = {
  idle: '',
  dns: 'Resolving DNS & WHOIS...',
  ports: 'Scanning Open Ports...',
  headers: 'Auditing HTTP Headers...',
  tech: 'Fingerprinting Technologies...',
  complete: 'Scan Complete',
};

interface CyberhawkClientProps {
  locale: Locale;
}

export function CyberhawkClient({ locale }: CyberhawkClientProps) {
  const [url, setUrl] = useState('');
  const [step, setStep] = useState<CyberhawkStep>('idle');
  const [result, setResult] = useState<CyberhawkResult | null>(null);
  const [error, setError] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const isScanning = step !== 'idle' && step !== 'complete';
  const isComplete = step === 'complete';
  const hudPhase = isComplete ? 'complete' : isScanning ? (step === 'headers' ? 'lock' : 'sweep') : 'idle';

  const handleScan = async () => {
    if (!url.trim() || isScanning) return;
    let normalized = url.trim();
    if (!normalized.startsWith('http')) normalized = 'https://' + normalized;

    setError('');
    setResult(null);
    setStep('idle');

    try {
      const res = await runCyberhawkScan(normalized, (s) => setStep(s));
      setResult(res);
    } catch {
      setError('Scan failed — check target URL');
      setStep('idle');
    }
  };

  const handleDownload = async () => {
    if (!result || isGeneratingPdf) return;
    setIsGeneratingPdf(true);
    try {
      const { generateGoldenTicket } = await import('@/lib/pods/cyberhawk-pdf');
      await generateGoldenTicket(result);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#070910' }}>
      <DashboardSidebar locale={locale} />

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, #0d2a4a 0%, #0a1e38 100%)',
                    border: '1px solid rgba(74,158,255,0.3)',
                    boxShadow: '0 0 16px rgba(74,158,255,0.2)',
                  }}
                >
                  <Shield className="w-5 h-5" style={{ color: '#4A9EFF' }} />
                </div>
                <div>
                  <h1
                    className="text-2xl font-bold text-white leading-none"
                    style={{ textShadow: '0 0 20px rgba(74,158,255,0.3)' }}
                  >
                    Cyberhawk
                  </h1>
                  <p className="text-sm text-white/35 mt-0.5">Talon HUD — Security Intelligence Pod</p>
                </div>
              </div>
            </div>

            {isComplete && result && (
              <button
                onClick={handleDownload}
                disabled={isGeneratingPdf}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-150 disabled:opacity-50"
                style={{
                  background: 'linear-gradient(135deg, #1a3a5c 0%, #0f2540 100%)',
                  color: '#4A9EFF',
                  border: '1px solid rgba(74,158,255,0.3)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4), 0 0 16px rgba(74,158,255,0.1)',
                  textShadow: '0 0 8px rgba(74,158,255,0.5)',
                }}
              >
                {isGeneratingPdf ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>{isGeneratingPdf ? 'Generating...' : 'Golden Ticket Report'}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            <div className="lg:col-span-3 space-y-4">
              <div
                className="rounded-xl p-5 space-y-4"
                style={{
                  background: 'linear-gradient(145deg, #111620 0%, #0a0e18 100%)',
                  border: '1px solid rgba(74,158,255,0.1)',
                  boxShadow: 'inset 0 1px 0 rgba(74,158,255,0.06), 0 4px 12px rgba(0,0,0,0.4)',
                }}
              >
                <div
                  className="flex items-center gap-2 rounded-xl px-4 py-1"
                  style={{
                    background: 'linear-gradient(145deg, #060a14 0%, #0a0e1a 100%)',
                    border: '1px solid rgba(74,158,255,0.12)',
                    boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.5)',
                  }}
                >
                  <Globe className="w-4 h-4 shrink-0" style={{ color: 'rgba(74,158,255,0.5)' }} />
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleScan()}
                    placeholder="https://target.com"
                    disabled={isScanning}
                    className="flex-1 bg-transparent text-sm py-3 outline-none text-white placeholder:text-white/20 disabled:cursor-not-allowed"
                    style={{ fontFamily: 'monospace', color: '#4A9EFF' }}
                  />
                </div>

                {error && (
                  <div className="flex items-center gap-2 text-red-400 text-sm">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  onClick={isComplete ? () => { setStep('idle'); setResult(null); setUrl(''); } : handleScan}
                  disabled={isScanning || (!isComplete && !url.trim())}
                  className={cn(
                    'w-full flex items-center justify-center gap-2',
                    'px-5 py-3 rounded-xl text-sm font-bold',
                    'transition-all duration-150',
                    'disabled:opacity-40 disabled:cursor-not-allowed'
                  )}
                  style={{
                    background: isScanning
                      ? 'linear-gradient(135deg, #0a1020 0%, #060c18 100%)'
                      : 'linear-gradient(135deg, #1e3a6e 0%, #0d2348 50%, #081830 100%)',
                    color: '#4A9EFF',
                    border: '1px solid rgba(74,158,255,0.3)',
                    boxShadow: isScanning
                      ? 'inset 0 2px 4px rgba(0,0,0,0.5)'
                      : '0 4px 12px rgba(0,0,0,0.4), 0 0 16px rgba(74,158,255,0.1), inset 0 1px 0 rgba(74,158,255,0.15)',
                    textShadow: '0 0 10px rgba(74,158,255,0.5)',
                  }}
                >
                  {isScanning ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="font-mono">{STEP_LABELS[step]}</span>
                    </>
                  ) : (
                    <>
                      <Shield className="w-4 h-4" />
                      <span>{isComplete ? 'New Scan' : 'Launch Talon Scan'}</span>
                    </>
                  )}
                </button>

                {isScanning && (
                  <div className="space-y-2">
                    {(['dns', 'ports', 'headers', 'tech'] as CyberhawkStep[]).map((s) => {
                      const order = ['dns', 'ports', 'headers', 'tech'];
                      const currentIdx = order.indexOf(step);
                      const thisIdx = order.indexOf(s);
                      const isDone = thisIdx < currentIdx;
                      const isActive = thisIdx === currentIdx;
                      return (
                        <div key={s} className="flex items-center gap-2.5">
                          <div
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{
                              background: isDone ? '#39FF14' : isActive ? '#4A9EFF' : 'rgba(255,255,255,0.1)',
                              boxShadow: isActive ? '0 0 6px #4A9EFF' : isDone ? '0 0 4px #39FF14' : 'none',
                              animation: isActive ? 'pulse 1s infinite' : 'none',
                            }}
                          />
                          <p
                            className="text-xs font-mono"
                            style={{
                              color: isDone ? '#39FF14' : isActive ? '#4A9EFF' : 'rgba(255,255,255,0.2)',
                            }}
                          >
                            {STEP_LABELS[s]}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {isComplete && result && (
                <div className="space-y-3">
                  <div
                    className="rounded-xl p-4 flex items-center gap-4"
                    style={{
                      background: `${SEVERITY_COLOR[result.threatLevel]}10`,
                      border: `1px solid ${SEVERITY_COLOR[result.threatLevel]}30`,
                    }}
                  >
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
                      style={{
                        background: `${SEVERITY_COLOR[result.threatLevel]}15`,
                        border: `2px solid ${SEVERITY_COLOR[result.threatLevel]}40`,
                      }}
                    >
                      <p
                        className="text-xl font-bold font-mono"
                        style={{
                          color: SEVERITY_COLOR[result.threatLevel],
                          textShadow: `0 0 12px ${SEVERITY_COLOR[result.threatLevel]}88`,
                        }}
                      >
                        {result.score}
                      </p>
                    </div>
                    <div>
                      <p
                        className="text-lg font-bold"
                        style={{ color: SEVERITY_COLOR[result.threatLevel] }}
                      >
                        {result.threatLevel} Threat Level
                      </p>
                      <p className="text-xs text-white/40 mt-0.5">
                        {result.findings.length} findings — Est. $
                        {result.totalRisk.toLocaleString('en-CA')} risk exposure
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {result.findings.map((f) => (
                      <div
                        key={f.id}
                        className="flex gap-3 p-3 rounded-lg"
                        style={{
                          background: `${SEVERITY_COLOR[f.severity]}08`,
                          border: `1px solid ${SEVERITY_COLOR[f.severity]}25`,
                        }}
                      >
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-white leading-snug">{f.title}</p>
                            {f.cve && (
                              <span
                                className="text-[9px] font-mono px-1.5 py-0.5 rounded"
                                style={{ color: '#4A9EFF', background: 'rgba(74,158,255,0.1)' }}
                              >
                                {f.cve}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-white/40 mt-1">{f.description}</p>
                          <p
                            className="text-[10px] font-bold uppercase mt-1.5"
                            style={{ color: 'rgba(255,255,255,0.25)' }}
                          >
                            {f.category}
                          </p>
                        </div>
                        <span
                          className="text-xs font-bold shrink-0"
                          style={{ color: SEVERITY_COLOR[f.severity] }}
                        >
                          {f.severity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="lg:col-span-2 space-y-4">
              <TalonHud
                phase={hudPhase}
                targetUrl={isScanning || isComplete ? (url || result?.url) : undefined}
                className="w-full h-72"
              />

              {isComplete && result && result.technologies.length > 0 && (
                <div
                  className="rounded-xl p-4"
                  style={{
                    background: 'linear-gradient(145deg, #111620 0%, #0a0e18 100%)',
                    border: '1px solid rgba(74,158,255,0.1)',
                  }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30 mb-3">
                    Detected Stack
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {result.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="text-xs px-2 py-1 rounded-md font-mono"
                        style={{
                          color: '#4A9EFF',
                          background: 'rgba(74,158,255,0.08)',
                          border: '1px solid rgba(74,158,255,0.15)',
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {!isComplete && !isScanning && (
                <div
                  className="rounded-xl p-5 space-y-3"
                  style={{
                    background: 'linear-gradient(145deg, #111620 0%, #0a0e18 100%)',
                    border: '1px solid rgba(74,158,255,0.08)',
                  }}
                >
                  <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/25">
                    Scan Capabilities
                  </p>
                  {[
                    'DNS & WHOIS Recon',
                    'HTTP Header Security Audit',
                    'Technology Fingerprinting',
                    'CVE Risk Assessment',
                    'Golden Ticket PDF Report',
                  ].map((cap) => (
                    <div key={cap} className="flex items-center gap-2">
                      <ChevronRight className="w-3 h-3 shrink-0" style={{ color: '#4A9EFF' }} />
                      <p className="text-xs text-white/45">{cap}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
