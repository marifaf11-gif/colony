"use client";

import { useState, useRef } from 'react';
import { useLanguage } from '@/lib/i18n/language-provider';
import { RevenueRadar } from '@/components/pods/revenue-radar';
import { NixieTracker } from '@/components/pods/nixie-tracker';
import { TactileReportButton } from '@/components/pods/tactile-report-button';
import { ScanResults } from '@/components/pods/scan-results';
import { ConsoleCard } from '@/components/colony/console-card';
import { DashboardSidebar } from '@/components/colony/dashboard-sidebar';
import { ModeToggle, type DashboardMode } from '@/components/colony/mode-toggle';
import { runScan, type ScanResult, type ScanStep } from '@/lib/pods/scan-engine';
import { persistLead } from '@/lib/pods/persist-lead';
import { AlertTriangle, Search, Globe, Activity, MousePointer } from 'lucide-react';
import type { Locale } from '@/lib/i18n/config';
import { cn } from '@/lib/utils';

interface ConversionCatalystClientProps {
  dictionary: Record<string, any>;
  locale: Locale;
}

function ScanInput({
  value,
  onChange,
  placeholder,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  disabled: boolean;
}) {
  return (
    <div
      className="flex items-center gap-2 rounded-xl px-4 py-1"
      style={{
        background: 'linear-gradient(145deg, #0d1117 0%, #111315 100%)',
        border: '1px solid rgba(255,255,255,0.08)',
        boxShadow: 'inset 0 2px 6px rgba(0,0,0,0.5), inset 0 -1px 0 rgba(255,255,255,0.03)',
      }}
    >
      <Globe className="w-4 h-4 text-white/30 shrink-0" />
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={cn(
          'flex-1 bg-transparent text-sm py-3 outline-none',
          'text-white placeholder:text-white/25',
          'disabled:cursor-not-allowed'
        )}
        style={{ fontFamily: 'monospace' }}
      />
    </div>
  );
}

export function ConversionCatalystClient({
  dictionary,
  locale,
}: ConversionCatalystClientProps) {
  const { t } = useLanguage();
  const [url, setUrl] = useState('');
  const [scanStep, setScanStep] = useState<ScanStep>('idle');
  const [result, setResult] = useState<ScanResult | null>(null);
  const [mode, setMode] = useState<DashboardMode>('profit');
  const [error, setError] = useState('');
  const abortRef = useRef(false);

  const pod = dictionary?.pod?.conversionCatalyst ?? {};
  const dash = dictionary?.dashboard ?? {};

  const isScanning = scanStep !== 'idle' && scanStep !== 'complete';
  const isComplete = scanStep === 'complete';

  const startScan = async () => {
    if (!url.trim()) return;

    let normalized = url.trim();
    if (!normalized.startsWith('http')) normalized = 'https://' + normalized;

    setError('');
    setResult(null);
    setScanStep('idle');
    abortRef.current = false;

    try {
      const scanResult = await runScan(normalized, (step) => {
        if (!abortRef.current) setScanStep(step);
      });

      setResult(scanResult);

      try {
        await persistLead(normalized, scanResult, locale);
      } catch {}
    } catch (e) {
      setError(t('errors.generic'));
      setScanStep('idle');
    }
  };

  const resetScan = () => {
    abortRef.current = true;
    setScanStep('idle');
    setResult(null);
    setUrl('');
  };

  const stepLabels: Record<ScanStep, string> = {
    idle: '',
    vitals: pod.coreVitals ?? 'Core Vitals',
    conversion: pod.conversionArch ?? 'Conversion Architecture',
    seo: pod.seoSurface ?? 'SEO Surface',
    complete: pod.scanComplete ?? 'Scan Complete',
  };

  return (
    <div
      className="flex h-screen overflow-hidden"
      style={{ background: '#0a0c10' }}
    >
      <DashboardSidebar locale={locale} />

      <main className="flex-1 overflow-y-auto">
        <div className="p-6 space-y-6 max-w-5xl mx-auto">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1
                className="text-2xl font-bold text-white"
                style={{ textShadow: '0 0 20px rgba(74,158,255,0.3)' }}
              >
                {pod.title ?? 'Conversion Catalyst'}
              </h1>
              <p className="text-sm text-white/40 mt-1">
                {pod.description ?? 'AI-driven SEO & Revenue Leak Auditor'}
              </p>
            </div>
            <ModeToggle mode={mode} onChange={setMode} />
          </div>

          {mode === 'profit' ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
              <div className="lg:col-span-2 space-y-5">
                <div
                  className="rounded-xl p-5 space-y-4"
                  style={{
                    background: 'linear-gradient(145deg, #1a1c20 0%, #111315 100%)',
                    border: '1px solid rgba(255,255,255,0.07)',
                    boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04), 0 4px 12px rgba(0,0,0,0.3)',
                  }}
                >
                  <ScanInput
                    value={url}
                    onChange={setUrl}
                    placeholder={pod.urlPlaceholder ?? 'https://your-site.com'}
                    disabled={isScanning}
                  />

                  {error && (
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <button
                    onClick={isComplete ? resetScan : startScan}
                    disabled={isScanning || (!isComplete && !url.trim())}
                    className={cn(
                      'w-full flex items-center justify-center gap-2',
                      'px-5 py-3 rounded-xl text-sm font-bold',
                      'transition-all duration-150',
                      'disabled:opacity-40 disabled:cursor-not-allowed'
                    )}
                    style={{
                      background: isScanning
                        ? 'linear-gradient(135deg, #1a3020 0%, #0d1f14 100%)'
                        : 'linear-gradient(135deg, #1e3a6e 0%, #0d2348 50%, #081830 100%)',
                      color: '#4A9EFF',
                      border: '1px solid rgba(74,158,255,0.3)',
                      boxShadow: isScanning
                        ? 'inset 0 2px 4px rgba(0,0,0,0.5)'
                        : '0 4px 12px rgba(0,0,0,0.4), 0 0 16px rgba(74,158,255,0.1), inset 0 1px 0 rgba(74,158,255,0.15)',
                      textShadow: '0 0 10px rgba(74,158,255,0.5)',
                    }}
                  >
                    <Search className="w-4 h-4" />
                    {isScanning
                      ? `${stepLabels[scanStep]}...`
                      : isComplete
                      ? 'New Scan'
                      : pod.startScan ?? 'Start Scan'}
                  </button>
                </div>

                {isComplete && result && (
                  <TactileReportButton
                    result={result}
                    label={pod.downloadReport ?? 'Download Profit Blueprint'}
                  />
                )}

                {isComplete && result && (
                  <ScanResults
                    result={result}
                    labels={{
                      vitals: pod.coreVitals ?? 'Core Vitals',
                      conversion: pod.conversionArch ?? 'Conversion Architecture',
                      seo: pod.seoSurface ?? 'SEO Surface',
                      overall: 'Overall',
                      severity: pod.leakSeverity ?? 'Leak Severity',
                      leakSeverity: pod.leakSeverity ?? 'Severity',
                    }}
                  />
                )}
              </div>

              <div className="space-y-4">
                <RevenueRadar scanStep={scanStep} className="w-full" />

                <NixieTracker
                  value={result?.totalLeakEstimate ?? 0}
                  label={pod.estimatedRevenue ?? 'Estimated Recoverable Revenue'}
                  prefix="$"
                  isAnimating={isScanning}
                />

                {isComplete && result && (
                  <div className="grid grid-cols-1 gap-3">
                    <ConsoleCard
                      title="Vitals Score"
                      value={`${result.scores.vitals}`}
                      variant="dark-chrome"
                      icon={<Activity className="w-4 h-4" />}
                      badge={{
                        label: result.scores.vitals >= 70 ? 'Good' : result.scores.vitals >= 50 ? 'Needs Work' : 'Critical',
                        color: result.scores.vitals >= 70 ? 'green' : result.scores.vitals >= 50 ? 'amber' : 'red',
                      }}
                    />
                    <ConsoleCard
                      title="CTA Score"
                      value={`${result.scores.conversion}`}
                      variant="dark-chrome"
                      icon={<MousePointer className="w-4 h-4" />}
                      badge={{
                        label: result.scores.conversion >= 70 ? 'Strong' : result.scores.conversion >= 50 ? 'Moderate' : 'Weak',
                        color: result.scores.conversion >= 70 ? 'green' : result.scores.conversion >= 50 ? 'amber' : 'red',
                      }}
                    />
                    <ConsoleCard
                      title={pod.leakSeverity ?? 'Leak Severity'}
                      value={result.severity}
                      variant="dark-chrome"
                      badge={{
                        label: result.severity,
                        color: result.severity === 'High' ? 'red' : result.severity === 'Medium' ? 'amber' : 'green',
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          ) : (
            <LegalComplianceView locale={locale} t={t} />
          )}
        </div>
      </main>
    </div>
  );
}

function LegalComplianceView({ locale, t }: { locale: Locale; t: (k: string) => string }) {
  const items = [
    {
      title: locale === 'fr-QC' ? 'Loi 25 — Québec' : 'Law 25 — Québec',
      status: locale === 'fr-QC' ? 'Révision requise' : 'Review Required',
      color: '#F39C12',
    },
    {
      title: 'CASL / LCAP',
      status: locale === 'fr-QC' ? 'Conforme' : 'Compliant',
      color: '#39FF14',
    },
    {
      title: 'AODA / WCAG 2.1',
      status: locale === 'fr-QC' ? 'Partiel' : 'Partial',
      color: '#F39C12',
    },
    {
      title: 'PIPEDA',
      status: locale === 'fr-QC' ? 'En révision' : 'Under Review',
      color: '#E74C3C',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
      {items.map((item) => (
        <div
          key={item.title}
          className="rounded-xl p-5"
          style={{
            background: 'linear-gradient(145deg, #1a1c20 0%, #111315 100%)',
            border: '1px solid rgba(255,255,255,0.07)',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
          }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-white">{item.title}</p>
              <p className="text-xs text-white/40 mt-1">
                {locale === 'fr-QC' ? 'Juridiction canadienne' : 'Canadian Jurisdiction'}
              </p>
            </div>
            <span
              className="text-xs font-bold px-2.5 py-1 rounded-full shrink-0"
              style={{
                color: item.color,
                background: `${item.color}15`,
                border: `1px solid ${item.color}40`,
              }}
            >
              {item.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
