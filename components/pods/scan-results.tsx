"use client";

import { AlertTriangle, AlertCircle, Info, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ScanResult, ScanFinding, Severity } from '@/lib/pods/scan-engine';

const SEVERITY_CONFIG: Record<Severity, { icon: typeof AlertTriangle; color: string; bg: string; border: string }> = {
  High: {
    icon: AlertTriangle,
    color: 'text-red-400',
    bg: 'rgba(231,76,60,0.08)',
    border: 'rgba(231,76,60,0.25)',
  },
  Medium: {
    icon: AlertCircle,
    color: 'text-amber-400',
    bg: 'rgba(243,156,18,0.08)',
    border: 'rgba(243,156,18,0.25)',
  },
  Low: {
    icon: Info,
    color: 'text-blue-400',
    bg: 'rgba(74,158,255,0.08)',
    border: 'rgba(74,158,255,0.25)',
  },
};

function FindingCard({ finding }: { finding: ScanFinding }) {
  const cfg = SEVERITY_CONFIG[finding.severity];
  const Icon = cfg.icon;

  return (
    <div
      className="flex gap-3 p-3 rounded-lg transition-all duration-150"
      style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
    >
      <Icon className={cn('w-4 h-4 mt-0.5 shrink-0', cfg.color)} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white leading-snug">{finding.title}</p>
        <p className="text-xs text-white/50 mt-1 leading-relaxed">{finding.description}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className={cn('text-xs font-bold', cfg.color)}>{finding.severity}</p>
        <p className="text-xs font-mono text-emerald-400 mt-1">
          +${finding.impact.toLocaleString('en-CA')}
        </p>
      </div>
    </div>
  );
}

function ScoreBar({ label, score }: { label: string; score: number }) {
  const color =
    score >= 70 ? '#39FF14' : score >= 50 ? '#F39C12' : '#E74C3C';

  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-medium text-white/60 uppercase tracking-wider">{label}</span>
        <span className="text-sm font-bold font-mono" style={{ color }}>
          {score}
        </span>
      </div>
      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ background: 'rgba(255,255,255,0.06)', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${score}%`,
            background: `linear-gradient(90deg, ${color}80, ${color})`,
            boxShadow: `0 0 8px ${color}60`,
          }}
        />
      </div>
    </div>
  );
}

interface ScanResultsProps {
  result: ScanResult;
  labels: {
    vitals: string;
    conversion: string;
    seo: string;
    overall: string;
    severity: string;
    leakSeverity: string;
  };
}

export function ScanResults({ result, labels }: ScanResultsProps) {
  const highFindings = result.findings.filter((f) => f.severity === 'High');
  const medFindings = result.findings.filter((f) => f.severity === 'Medium');
  const lowFindings = result.findings.filter((f) => f.severity === 'Low');

  const severityColor: Record<Severity, string> = {
    High: '#E74C3C',
    Medium: '#F39C12',
    Low: '#39FF14',
  };

  return (
    <div className="space-y-6">
      <div
        className="rounded-xl p-5 space-y-3"
        style={{
          background: 'linear-gradient(145deg, #1a1c20 0%, #111315 100%)',
          border: '1px solid rgba(255,255,255,0.07)',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)',
        }}
      >
        <h3 className="text-xs font-semibold uppercase tracking-widest text-white/40">
          {labels.overall}
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <ScoreBar label={labels.vitals} score={result.scores.vitals} />
          <ScoreBar label={labels.conversion} score={result.scores.conversion} />
          <ScoreBar label={labels.seo} score={result.scores.seo} />
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs font-medium text-white/60 uppercase tracking-wider">{labels.overall}</span>
              <span
                className="text-sm font-bold font-mono"
                style={{ color: result.scores.overall >= 70 ? '#39FF14' : result.scores.overall >= 50 ? '#F39C12' : '#E74C3C' }}
              >
                {result.scores.overall}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div
                className="h-2 flex-1 rounded-full overflow-hidden"
                style={{ background: 'rgba(255,255,255,0.06)', boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.4)' }}
              >
                <div
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{
                    width: `${result.scores.overall}%`,
                    background: `linear-gradient(90deg, ${severityColor[result.severity]}80, ${severityColor[result.severity]})`,
                  }}
                />
              </div>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  color: severityColor[result.severity],
                  background: `${severityColor[result.severity]}15`,
                  border: `1px solid ${severityColor[result.severity]}40`,
                }}
              >
                {result.severity}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {highFindings.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-3 h-3" />
              High Impact ({highFindings.length})
            </p>
            {highFindings.map((f) => <FindingCard key={f.id} finding={f} />)}
          </div>
        )}
        {medFindings.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-amber-400 flex items-center gap-2">
              <AlertCircle className="w-3 h-3" />
              Medium Impact ({medFindings.length})
            </p>
            {medFindings.map((f) => <FindingCard key={f.id} finding={f} />)}
          </div>
        )}
        {lowFindings.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-400 flex items-center gap-2">
              <Info className="w-3 h-3" />
              Low Impact ({lowFindings.length})
            </p>
            {lowFindings.map((f) => <FindingCard key={f.id} finding={f} />)}
          </div>
        )}
      </div>
    </div>
  );
}
