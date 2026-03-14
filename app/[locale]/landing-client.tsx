"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Shield, Zap, Eye, Radio, Crosshair, ChevronRight, TrendingUp, Lock, Globe, ChartBar as BarChart3, ArrowRight, Activity } from 'lucide-react';

interface LandingStats {
  totalStrikes: number;
  highSeverity: number;
  revenuePool: number;
}

interface LandingClientProps {
  locale: string;
  stats: LandingStats;
}

function useCountUp(target: number, duration = 1800, start = false) {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!start || target === 0) return;
    let startTime: number | null = null;
    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);
  return value;
}

function AnimatedStat({ label, value, prefix = '', suffix = '', color = '#39FF14' }: {
  label: string; value: number; prefix?: string; suffix?: string; color?: string;
}) {
  const ref   = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);
  const display = useCountUp(value, 1600, vis);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVis(true); }, { threshold: 0.3 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl font-bold font-mono mb-1" style={{ color, textShadow: `0 0 24px ${color}55` }}>
        {prefix}{display.toLocaleString('en-CA')}{suffix}
      </div>
      <div className="text-[10px] tracking-[0.2em] uppercase" style={{ color: 'rgba(255,255,255,0.35)' }}>{label}</div>
    </div>
  );
}

function PulsingDot({ color = '#39FF14' }: { color?: string }) {
  return (
    <span className="relative inline-flex w-2 h-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: color }} />
      <span className="relative inline-flex rounded-full w-2 h-2" style={{ background: color }} />
    </span>
  );
}

const GRID_STYLE = {
  backgroundImage: `
    linear-gradient(rgba(74,158,255,0.04) 1px, transparent 1px),
    linear-gradient(90deg, rgba(74,158,255,0.04) 1px, transparent 1px)
  `,
  backgroundSize: '40px 40px',
};

export function LandingClient({ locale, stats }: LandingClientProps) {
  const loginHref = `/${locale}/auth/login`;
  const hubHref   = `/${locale}/core/hub`;

  return (
    <div className="min-h-screen" style={{ background: '#080d12', fontFamily: '"JetBrains Mono", "Fira Code", ui-monospace, monospace', color: '#fff' }}>

      {/* NAV */}
      <nav className="fixed top-0 left-0 right-0 z-50" style={{ background: 'rgba(8,13,18,0.85)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(74,158,255,0.1)' }}>
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0d2040, #1a3a6e)', border: '1px solid rgba(74,158,255,0.4)', boxShadow: '0 0 16px rgba(74,158,255,0.2)' }}>
              <Radio className="w-4 h-4" style={{ color: '#4A9EFF' }} />
            </div>
            <span className="text-sm font-bold tracking-tighter">COLONY_OS</span>
            <span className="text-[9px] px-1.5 py-0.5 rounded tracking-widest" style={{ background: 'rgba(57,255,20,0.1)', border: '1px solid rgba(57,255,20,0.25)', color: '#39FF14' }}>v2.0</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            {['PODS', 'ARSENAL', 'PROTOCOL'].map((item) => (
              <span key={item} className="text-[10px] tracking-widest cursor-default" style={{ color: 'rgba(255,255,255,0.35)' }}>{item}</span>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href={loginHref}
              className="text-[10px] font-bold tracking-widest px-3 py-1.5 rounded-lg transition-all hover:opacity-80"
              style={{ color: 'rgba(255,255,255,0.5)', border: '1px solid rgba(255,255,255,0.1)' }}>
              SIGN IN
            </Link>
            <Link href={hubHref}
              className="text-[10px] font-bold tracking-widest px-4 py-1.5 rounded-lg transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #0d2040, #1a4a8a)', border: '1px solid rgba(74,158,255,0.4)', color: '#4A9EFF', boxShadow: '0 0 12px rgba(74,158,255,0.2)' }}>
              LAUNCH
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative pt-32 pb-24 overflow-hidden" style={GRID_STYLE}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(74,158,255,0.06) 0%, transparent 70%)' }} />

        <div className="max-w-5xl mx-auto px-6 text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-8"
            style={{ background: 'rgba(57,255,20,0.08)', border: '1px solid rgba(57,255,20,0.2)' }}>
            <PulsingDot color="#39FF14" />
            <span className="text-[9px] tracking-[0.25em] uppercase" style={{ color: '#39FF14' }}>LIVE — SCANNING MONTRÉAL SECTOR</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-6">
            <span style={{ color: '#fff' }}>TURN COMPLIANCE</span>
            <br />
            <span style={{ background: 'linear-gradient(135deg, #4A9EFF, #39FF14)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              GAPS INTO REVENUE
            </span>
          </h1>

          <p className="text-sm md:text-base max-w-2xl mx-auto mb-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Colony OS autonomously scans Montréal businesses for Loi 25 privacy violations, generates AI-crafted outreach, and closes $299 CAD remediation deals — on autopilot.
          </p>
          <p className="text-xs mb-12" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Scout Engine · Cyberhawk · Conversion Catalyst · Strike Command
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link href={hubHref}
              className="group flex items-center gap-3 px-8 py-4 rounded-xl text-sm font-bold tracking-widest uppercase transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #0d2040, #1a4a8a)', border: '1px solid rgba(74,158,255,0.5)', color: '#4A9EFF', boxShadow: '0 0 32px rgba(74,158,255,0.2)' }}>
              <Radio className="w-4 h-4" />
              LAUNCH MISSION CONTROL
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href={loginHref}
              className="flex items-center gap-2 px-6 py-4 rounded-xl text-sm font-bold tracking-widest uppercase transition-all hover:opacity-80"
              style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)' }}>
              CREATE ACCOUNT
            </Link>
          </div>

          {/* LIVE STATS */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <AnimatedStat label="Targets Detected"   value={stats.totalStrikes}             color="#4A9EFF" />
            <AnimatedStat label="High Severity"       value={stats.highSeverity}             color="#FF3B3B" />
            <AnimatedStat label="Bounty Pool"          value={Math.floor(stats.revenuePool / 100)} prefix="$" color="#39FF14" />
          </div>
        </div>
      </section>

      {/* STATUS BAR */}
      <div style={{ background: 'rgba(74,158,255,0.05)', borderTop: '1px solid rgba(74,158,255,0.1)', borderBottom: '1px solid rgba(74,158,255,0.1)' }}>
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between overflow-x-auto gap-8">
          {[
            { label: 'SECTOR',        value: 'MONTRÉAL_QC',   color: '#4A9EFF' },
            { label: 'REGULATION',    value: 'LOI_25 / C-11', color: '#FFB830' },
            { label: 'SCAN_CADENCE',  value: 'EVERY_4H',      color: '#39FF14' },
            { label: 'REMEDIATION',   value: '$299 CAD',      color: '#39FF14' },
            { label: 'DELIVERY_SLA',  value: '5_BIZ_DAYS',    color: '#4A9EFF' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center gap-2 shrink-0">
              <span className="text-[8px] tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>{label}</span>
              <span className="text-[9px] font-bold tracking-wider" style={{ color }}>{value}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <PulsingDot color="#39FF14" />
            <span className="text-[9px] font-bold tracking-widest" style={{ color: '#39FF14' }}>AUTONOMOUS</span>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="py-24" style={GRID_STYLE}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[9px] tracking-[0.3em] uppercase mb-3" style={{ color: '#4A9EFF' }}>SOVEREIGN LOOP PROTOCOL</p>
            <h2 className="text-3xl font-black tracking-tighter">THREE STEPS TO REVENUE</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                icon: Globe,
                title: 'SCOUT & DETECT',
                body: 'Scout Engine autonomously scans Montréal business registries and audits each website for Loi 25 violations — missing cookie banners, unencrypted forms, undisclosed data collection.',
                color: '#4A9EFF',
              },
              {
                step: '02',
                icon: Eye,
                title: 'AUDIT & RANK',
                body: 'Cyberhawk performs a deep technical audit and Conversion Catalyst scores each target by revenue potential. HIGH severity targets get prioritised for immediate outreach.',
                color: '#FFB830',
              },
              {
                step: '03',
                icon: Crosshair,
                title: 'STRIKE & COLLECT',
                body: 'Strike Command generates a personalised French pitch email, staged in Gmail or WhatsApp in one click. Client pays the $299 CAD Stripe invoice. Revenue logged automatically.',
                color: '#39FF14',
              },
            ].map(({ step, icon: Icon, title, body, color }) => (
              <div key={step} className="relative rounded-2xl p-6 transition-all hover:scale-[1.02]"
                style={{ background: 'linear-gradient(160deg, #111820 0%, #0d1117 100%)', border: `1px solid ${color}18`, boxShadow: `0 0 40px ${color}06` }}>
                <div className="text-[9px] font-bold tracking-widest mb-4" style={{ color: `${color}60` }}>STEP_{step}</div>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
                  style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                  <Icon className="w-5 h-5" style={{ color }} />
                </div>
                <h3 className="text-sm font-bold tracking-wider mb-3" style={{ color }}>{title}</h3>
                <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.45)' }}>{body}</p>
                <div className="absolute top-6 right-6 text-4xl font-black" style={{ color: `${color}08` }}>{step}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PODS */}
      <section className="py-24" style={{ background: 'linear-gradient(180deg, transparent, rgba(74,158,255,0.03), transparent)' }}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[9px] tracking-[0.3em] uppercase mb-3" style={{ color: '#4A9EFF' }}>FLEET PODS</p>
            <h2 className="text-3xl font-black tracking-tighter">THE ENGINE ROOM</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              {
                name: 'SCOUT ENGINE',
                tag: 'CORE POD',
                desc: 'Autonomous business registry crawler targeting Montréal SMBs. Discovers, profiles, and scores each prospect against Loi 25 compliance criteria. Runs on pg_cron every 4 hours without any human input.',
                metrics: [['SCAN CADENCE', '4h AUTO'], ['TARGET POOL', 'MTL SMB'], ['OUTPUT', 'STRIKES']],
                color: '#FFB830',
                icon: Radio,
                href: `/${locale}/core/hub`,
              },
              {
                name: 'CYBERHAWK',
                tag: 'AUDIT POD',
                desc: 'Deep technical audit engine. Reads live page source, identifies missing privacy policies, cookie consent banners, unencrypted inputs, and third-party trackers. Produces a structured Loi 25 gap report.',
                metrics: [['AUDIT TYPE', 'LOI 25'], ['TECH STACK', 'DETECTED'], ['REPORT', 'AUTO-GEN']],
                color: '#4A9EFF',
                icon: Eye,
                href: `/${locale}/pods/cyberhawk`,
              },
              {
                name: 'CONVERSION CATALYST',
                tag: 'REVENUE POD',
                desc: 'Revenue optimization auditor that detects friction in checkout flows, missing trust signals, and conversion leaks. Cross-sells the full compliance package to prospects already inside the funnel.',
                metrics: [['FOCUS', 'CHECKOUT'], ['UPSELL', 'ENABLED'], ['ROI TARGET', '>4x']],
                color: '#39FF14',
                icon: TrendingUp,
                href: `/${locale}/pods/conversion-catalyst`,
              },
              {
                name: 'STRIKE COMMAND',
                tag: 'OUTREACH POD',
                desc: 'One-click outreach execution. Generates bilingual (EN/FR) personalized emails leveraging Loi 25 urgency, stages them in Gmail, opens WhatsApp templates, and fires Stripe invoices directly from the HUD.',
                metrics: [['LANGUAGE', 'FR / EN'], ['CHANNEL', 'EMAIL+WA'], ['INVOICE', '$299 CAD']],
                color: '#FF3B3B',
                icon: Crosshair,
                href: `/${locale}/core/strike`,
              },
            ].map(({ name, tag, desc, metrics, color, icon: Icon, href }) => (
              <Link key={name} href={href}
                className="group block rounded-2xl p-6 transition-all hover:scale-[1.01]"
                style={{ background: 'linear-gradient(160deg, #111820 0%, #0d1117 100%)', border: `1px solid ${color}15`, boxShadow: `0 0 40px ${color}05` }}>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                      <Icon className="w-5 h-5" style={{ color }} />
                    </div>
                    <div>
                      <p className="text-xs font-bold tracking-wider" style={{ color }}>{name}</p>
                      <p className="text-[8px] tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>{tag}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-50 transition-all mt-1" style={{ color }} />
                </div>
                <p className="text-[11px] leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.45)' }}>{desc}</p>
                <div className="flex gap-3">
                  {metrics.map(([k, v]) => (
                    <div key={k} className="flex-1 px-2 py-1.5 rounded-lg text-center"
                      style={{ background: `${color}08`, border: `1px solid ${color}15` }}>
                      <p className="text-[7px] tracking-widest uppercase mb-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>{k}</p>
                      <p className="text-[9px] font-bold" style={{ color }}>{v}</p>
                    </div>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* LOI 25 BRIEF */}
      <section className="py-20">
        <div className="max-w-4xl mx-auto px-6">
          <div className="rounded-2xl p-8 md:p-12" style={{ background: 'linear-gradient(135deg, #0e1a2e, #091422)', border: '1px solid rgba(74,158,255,0.15)', boxShadow: '0 0 80px rgba(74,158,255,0.08)' }}>
            <div className="grid md:grid-cols-2 gap-10 items-center">
              <div>
                <p className="text-[9px] tracking-[0.3em] uppercase mb-3" style={{ color: '#4A9EFF' }}>INTELLIGENCE BRIEF</p>
                <h2 className="text-2xl font-black tracking-tighter mb-4">QUÉBEC LOI 25 —<br />THE $25M OPPORTUNITY</h2>
                <p className="text-[11px] leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  As of September 2023, Québec's Law 25 (Bill 64) is fully in force. Thousands of Montréal SMBs are non-compliant — exposed to fines up to $25M or 4% of worldwide revenue. Most haven't even started.
                </p>
                <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Colony OS automates the entire prospecting pipeline. Find the gap, pitch the fix, collect the fee — all without leaving the HUD.
                </p>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Max fine per violation',    value: '$25,000,000',   color: '#FF3B3B' },
                  { label: 'Alternative (% of revenue)', value: '4% worldwide', color: '#FFB830' },
                  { label: 'SMBs estimated non-compliant', value: '>60%',       color: '#FFB830' },
                  { label: 'Average remediation ticket',  value: '$299 CAD',    color: '#39FF14' },
                  { label: 'Colony OS strike rate',       value: 'Automated',   color: '#4A9EFF' },
                ].map(({ label, value, color }) => (
                  <div key={label} className="flex items-center justify-between px-4 py-2.5 rounded-xl"
                    style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <span className="text-[10px]" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</span>
                    <span className="text-[11px] font-bold font-mono" style={{ color }}>{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* TECH ARSENAL */}
      <section className="py-20" style={GRID_STYLE}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-12">
            <p className="text-[9px] tracking-[0.3em] uppercase mb-3" style={{ color: '#4A9EFF' }}>TECHNICAL ARSENAL</p>
            <h2 className="text-3xl font-black tracking-tighter">BUILT ON SOVEREIGN INFRASTRUCTURE</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Supabase Realtime', desc: 'Live radar updates', icon: Activity, color: '#39FF14' },
              { name: 'pg_cron + pg_net',  desc: 'Autonomous scans',   icon: Radio,    color: '#4A9EFF' },
              { name: 'Stripe Checkout',   desc: '$299 invoices',       icon: Lock,     color: '#FFB830' },
              { name: 'Next.js 13',        desc: 'i18n · FR · EN',      icon: Globe,    color: '#4A9EFF' },
              { name: 'Edge Functions',    desc: 'Deno · serverless',   icon: Zap,      color: '#39FF14' },
              { name: 'Vector Search',     desc: 'Arsenal AI engine',   icon: BarChart3, color: '#FF3B3B' },
              { name: 'Discord Bridge',    desc: 'Real-time alerts',    icon: Shield,   color: '#4A9EFF' },
              { name: 'pgvector',          desc: 'Semantic matching',   icon: TrendingUp, color: '#FFB830' },
            ].map(({ name, desc, icon: Icon, color }) => (
              <div key={name} className="rounded-xl p-4 transition-all hover:scale-[1.02]"
                style={{ background: 'linear-gradient(160deg, #111820 0%, #0d1117 100%)', border: `1px solid ${color}12` }}>
                <Icon className="w-5 h-5 mb-3" style={{ color }} />
                <p className="text-[10px] font-bold mb-1" style={{ color }}>{name}</p>
                <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.3)' }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-28">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="rounded-2xl px-8 py-16 relative overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #0a1628, #0d1f3a)', border: '1px solid rgba(74,158,255,0.2)', boxShadow: '0 0 120px rgba(74,158,255,0.1)' }}>
            <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 39px, rgba(74,158,255,0.03) 39px, rgba(74,158,255,0.03) 40px), repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(74,158,255,0.03) 39px, rgba(74,158,255,0.03) 40px)' }} />
            <div className="relative">
              <div className="flex items-center justify-center gap-2 mb-6">
                <PulsingDot color="#39FF14" />
                <span className="text-[9px] tracking-[0.25em] uppercase" style={{ color: '#39FF14' }}>SYSTEMS OPERATIONAL</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-4">
                READY TO MONETIZE<br />
                <span style={{ background: 'linear-gradient(135deg, #4A9EFF, #39FF14)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  QUÉBEC'S COMPLIANCE GAP?
                </span>
              </h2>
              <p className="text-[11px] mb-10 max-w-lg mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Create your account, connect your Stripe, and let the Sovereign Loop run. The Scout Engine has already identified targets. Your first strike is one click away.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href={loginHref}
                  className="group flex items-center gap-3 px-8 py-4 rounded-xl text-sm font-bold tracking-widest uppercase transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #0d2040, #1a4a8a)', border: '1px solid rgba(74,158,255,0.5)', color: '#4A9EFF', boxShadow: '0 0 32px rgba(74,158,255,0.25)' }}>
                  GET STARTED FREE
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href={hubHref}
                  className="flex items-center gap-2 px-6 py-4 rounded-xl text-sm font-bold tracking-widest uppercase transition-all hover:opacity-80"
                  style={{ border: '1px solid rgba(57,255,20,0.25)', color: '#39FF14' }}>
                  <Radio className="w-4 h-4" />
                  LIVE DEMO
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: '#060b10' }}>
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: 'rgba(74,158,255,0.1)', border: '1px solid rgba(74,158,255,0.2)' }}>
              <Radio className="w-3 h-3" style={{ color: '#4A9EFF' }} />
            </div>
            <span className="text-[10px] tracking-tighter font-bold" style={{ color: 'rgba(255,255,255,0.4)' }}>COLONY_OS</span>
            <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.2)' }}>// SOVEREIGN LOOP v2.0</span>
          </div>
          <p className="text-[9px] tracking-wider" style={{ color: 'rgba(255,255,255,0.2)' }}>
            SECTOR: MONTRÉAL_QC · REGULATION: LOI_25 · ALL SYSTEMS NOMINAL
          </p>
          <div className="flex items-center gap-4">
            <Link href={loginHref} className="text-[9px] tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>LOGIN</Link>
            <Link href={hubHref}   className="text-[9px] tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>HUB</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
