"use client";

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Shield, Zap, Eye, Radio, Crosshair, ChevronRight, TrendingUp, Lock, Globe, ChartBar as BarChart3, ArrowRight, Activity } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

interface LandingStats {
  totalStrikes: number;
  highSeverity: number;
  revenuePool: number;
}

interface LandingClientProps {
  locale: string;
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
        {prefix}{display.toLocaleString('fr-CA')}{suffix}
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

export function LandingClient({ locale }: LandingClientProps) {
  const loginHref = `/${locale}/auth/login`;
  const hubHref   = `/${locale}/core/hub`;

  const [stats, setStats] = useState<LandingStats>({ totalStrikes: 0, highSeverity: 0, revenuePool: 0 });

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    (async () => {
      const [strikesRes, highRes] = await Promise.all([
        supabase.from('strikes').select('id, revenue_value', { count: 'exact' }),
        supabase.from('strikes').select('id', { count: 'exact' }).eq('severity', 'HIGH'),
      ]);
      const rows = (strikesRes.data ?? []) as { revenue_value: number }[];
      const revenuePool = rows.reduce((sum, r) => sum + (r.revenue_value ?? 0), 0);
      setStats({
        totalStrikes: strikesRes.count ?? rows.length,
        highSeverity: highRes.count ?? 0,
        revenuePool,
      });
    })();
  }, []);

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
            <span className="text-[9px] tracking-[0.25em] uppercase" style={{ color: '#39FF14' }}>EN DIRECT — BALAYAGE DU SECTEUR MONTRÉAL</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter leading-none mb-6">
            <span style={{ color: '#fff' }}>TRANSFORMEZ LA CONFORMITÉ</span>
            <br />
            <span style={{ background: 'linear-gradient(135deg, #4A9EFF, #39FF14)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              EN REVENUS
            </span>
          </h1>

          <p className="text-sm md:text-base max-w-2xl mx-auto mb-4 leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Colonie OS analyse automatiquement les entreprises montréalaises pour détecter les violations de la Loi 25, génère des propositions IA, et conclut des contrats de remédiation à 299 $ CAD — en autopilote.
          </p>
          <p className="text-xs mb-12" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Moteur Scout · Cyberchien · Catalyseur de Conversion · Commande de Frappe
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <Link href={hubHref}
              className="group flex items-center gap-3 px-8 py-4 rounded-xl text-sm font-bold tracking-widest uppercase transition-all hover:scale-105"
              style={{ background: 'linear-gradient(135deg, #0d2040, #1a4a8a)', border: '1px solid rgba(74,158,255,0.5)', color: '#4A9EFF', boxShadow: '0 0 32px rgba(74,158,255,0.2)' }}>
              <Radio className="w-4 h-4" />
              LANCER LE CENTRE DE COMMANDE
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link href={loginHref}
              className="flex items-center gap-2 px-6 py-4 rounded-xl text-sm font-bold tracking-widest uppercase transition-all hover:opacity-80"
              style={{ border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.45)' }}>
              CRÉER UN COMPTE
            </Link>
          </div>

          {/* LIVE STATS */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <AnimatedStat label="Cibles détectées"   value={stats.totalStrikes}             color="#4A9EFF" />
            <AnimatedStat label="Sévérité élevée"       value={stats.highSeverity}             color="#FF3B3B" />
            <AnimatedStat label="Fonds de primes"          value={Math.floor(stats.revenuePool / 100)} prefix="$" color="#39FF14" />
          </div>
        </div>
      </section>

      {/* STATUS BAR */}
      <div style={{ background: 'rgba(74,158,255,0.05)', borderTop: '1px solid rgba(74,158,255,0.1)', borderBottom: '1px solid rgba(74,158,255,0.1)' }}>
        <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between overflow-x-auto gap-8">
          {[
            { label: 'SECTEUR',        value: 'MONTRÉAL_QC',   color: '#4A9EFF' },
            { label: 'RÉGLEMENTATION', value: 'LOI_25 / C-11', color: '#FFB830' },
            { label: 'CADENCE',       value: 'CHAQUE_4H',      color: '#39FF14' },
            { label: 'REMÉDIATION',   value: '299 $ CAD',      color: '#39FF14' },
            { label: 'DÉLAI_SLA',     value: '5_JOURS_OUV',    color: '#4A9EFF' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center gap-2 shrink-0">
              <span className="text-[8px] tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>{label}</span>
              <span className="text-[9px] font-bold tracking-wider" style={{ color }}>{value}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 shrink-0 ml-auto">
            <PulsingDot color="#39FF14" />
            <span className="text-[9px] font-bold tracking-widest" style={{ color: '#39FF14' }}>AUTONOME</span>
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <section className="py-24" style={GRID_STYLE}>
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="text-[9px] tracking-[0.3em] uppercase mb-3" style={{ color: '#4A9EFF' }}>PROTOCOLE DE BOUCLE SOUVERAINE</p>
            <h2 className="text-3xl font-black tracking-tighter">TROIS ÉTAPES VERS LES REVENUS</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: '01',
                icon: Globe,
                title: 'REPÉRER & DÉTECTER',
                body: "Le moteur Scout analyse automatiquement les registres d'entreprises montréalaises et audite chaque site pour les violations de la Loi 25 — bannières de cookies manquantes, formulaires non chiffrés, collecte de données non déclarée.",
                color: '#4A9EFF',
              },
              {
                step: '02',
                icon: Eye,
                title: 'AUDITER & CLASSER',
                body: "Cyberchien effectue un audit technique approfondi et le Catalyseur de Conversion évalue chaque cible par potentiel de revenus. Les cibles de sévérité ÉLEVÉE sont priorisées pour une approche immédiate.",
                color: '#FFB830',
              },
              {
                step: '03',
                icon: Crosshair,
                title: 'FRAPPER & ENCAISSER',
                body: "La Commande de Frappe génère un courriel de prospection personnalisé en français, préparé dans Gmail ou WhatsApp en un clic. Le client paie la facture Stripe de 299 $ CAD. Revenus enregistrés automatiquement.",
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
            <p className="text-[9px] tracking-[0.3em] uppercase mb-3" style={{ color: '#4A9EFF' }}>MODULES DE FLOTTE</p>
            <h2 className="text-3xl font-black tracking-tighter">LA SALLE DES MACHINES</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              {
                name: 'MOTEUR SCOUT',
                tag: 'MODULE PRINCIPAL',
                desc: "Robot d'exploration autonome ciblant les PME montréalaises. Découvre, profile et évalue chaque prospect selon les critères de conformité Loi 25. Fonctionne via pg_cron toutes les 4 heures sans intervention humaine.",
                metrics: [['CADENCE', '4h AUTO'], ['CIBLES', 'PME MTL'], ['SORTIE', 'FRAPPES']],
                color: '#FFB830',
                icon: Radio,
                href: `/${locale}/core/hub`,
              },
              {
                name: 'CYBERCHIEN',
                tag: "MODULE D'AUDIT",
                desc: "Moteur d'audit technique approfondi. Lit le code source en direct, identifie les politiques de confidentialité manquantes, bannières de cookies, entrées non chiffrées et traqueurs tiers. Produit un rapport structuré de lacunes Loi 25.",
                metrics: [['AUDIT', 'LOI 25'], ['STACK', 'DÉTECTÉE'], ['RAPPORT', 'AUTO-GÉN']],
                color: '#4A9EFF',
                icon: Eye,
                href: `/${locale}/pods/cyberchien`,
              },
              {
                name: 'CATALYSEUR DE CONVERSION',
                tag: 'MODULE REVENUS',
                desc: "Auditeur d'optimisation des revenus qui détecte les frictions dans les parcours d'achat, les signaux de confiance manquants et les fuites de conversion. Vente croisée du forfait complet de conformité.",
                metrics: [['FOCUS', 'PAIEMENT'], ['VENTE+', 'ACTIVÉE'], ['ROI CIBLE', '>4x']],
                color: '#39FF14',
                icon: TrendingUp,
                href: `/${locale}/pods/conversion-catalyst`,
              },
              {
                name: 'COMMANDE DE FRAPPE',
                tag: 'MODULE PROSPECTION',
                desc: "Exécution de prospection en un clic. Génère des courriels personnalisés bilingues (FR/EN) exploitant l'urgence de la Loi 25, les prépare dans Gmail, ouvre les modèles WhatsApp et envoie les factures Stripe directement depuis le HUD.",
                metrics: [['LANGUE', 'FR / EN'], ['CANAL', 'COURRIEL+WA'], ['FACTURE', '299 $ CAD']],
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
                <p className="text-[9px] tracking-[0.3em] uppercase mb-3" style={{ color: '#4A9EFF' }}>BULLETIN DE RENSEIGNEMENT</p>
                <h2 className="text-2xl font-black tracking-tighter mb-4">LOI 25 DU QUÉBEC —<br />L'OPPORTUNITÉ DE 25 M$</h2>
                <p className="text-[11px] leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Depuis septembre 2023, la Loi 25 du Québec (projet de loi 64) est pleinement en vigueur. Des milliers de PME montréalaises sont non conformes — exposées à des amendes allant jusqu'à 25 M$ ou 4 % du chiffre d'affaires mondial. La plupart n'ont même pas commencé.
                </p>
                <p className="text-[11px] leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  Colonie OS automatise l'ensemble du pipeline de prospection. Trouver la lacune, proposer la solution, encaisser les frais — le tout sans quitter le HUD.
                </p>
              </div>
              <div className="space-y-3">
                {[
                  { label: 'Amende max par infraction',    value: '25 000 000 $',   color: '#FF3B3B' },
                  { label: 'Alternative (% du CA)',       value: '4 % mondial',   color: '#FFB830' },
                  { label: 'PME estimées non conformes',  value: '>60 %',         color: '#FFB830' },
                  { label: 'Ticket moyen de remédiation', value: '299 $ CAD',     color: '#39FF14' },
                  { label: 'Taux de frappe Colonie OS',   value: 'Automatisé',    color: '#4A9EFF' },
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
            <p className="text-[9px] tracking-[0.3em] uppercase mb-3" style={{ color: '#4A9EFF' }}>ARSENAL TECHNIQUE</p>
            <h2 className="text-3xl font-black tracking-tighter">BÂTI SUR UNE INFRASTRUCTURE SOUVERAINE</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Supabase Realtime', desc: 'Mises à jour radar en direct', icon: Activity, color: '#39FF14' },
              { name: 'pg_cron + pg_net',  desc: 'Analyses autonomes',        icon: Radio,    color: '#4A9EFF' },
              { name: 'Stripe Checkout',   desc: 'Factures 299 $',            icon: Lock,     color: '#FFB830' },
              { name: 'Next.js 13',        desc: 'i18n · FR · EN',            icon: Globe,    color: '#4A9EFF' },
              { name: 'Edge Functions',    desc: 'Deno · sans serveur',       icon: Zap,      color: '#39FF14' },
              { name: 'Recherche vectorielle', desc: 'Moteur IA Arsenal',     icon: BarChart3, color: '#FF3B3B' },
              { name: 'Pont Discord',      desc: 'Alertes en temps réel',     icon: Shield,   color: '#4A9EFF' },
              { name: 'pgvector',          desc: 'Correspondance sémantique', icon: TrendingUp, color: '#FFB830' },
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
                <span className="text-[9px] tracking-[0.25em] uppercase" style={{ color: '#39FF14' }}>SYSTÈMES OPÉRATIONNELS</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-black tracking-tighter mb-4">
                PRÊT À MONÉTISER<br />
                <span style={{ background: 'linear-gradient(135deg, #4A9EFF, #39FF14)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  L'ÉCART DE CONFORMITÉ DU QUÉBEC?
                </span>
              </h2>
              <p className="text-[11px] mb-10 max-w-lg mx-auto leading-relaxed" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Créez votre compte, connectez votre Stripe, et laissez la Boucle Souveraine tourner. Le Moteur Scout a déjà identifié des cibles. Votre première frappe est à un clic.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href={loginHref}
                  className="group flex items-center gap-3 px-8 py-4 rounded-xl text-sm font-bold tracking-widest uppercase transition-all hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, #0d2040, #1a4a8a)', border: '1px solid rgba(74,158,255,0.5)', color: '#4A9EFF', boxShadow: '0 0 32px rgba(74,158,255,0.25)' }}>
                  COMMENCER GRATUITEMENT
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <Link href={hubHref}
                  className="flex items-center gap-2 px-6 py-4 rounded-xl text-sm font-bold tracking-widest uppercase transition-all hover:opacity-80"
                  style={{ border: '1px solid rgba(57,255,20,0.25)', color: '#39FF14' }}>
                  <Radio className="w-4 h-4" />
                  DÉMO EN DIRECT
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
            <span className="text-[9px]" style={{ color: 'rgba(255,255,255,0.2)' }}>// BOUCLE SOUVERAINE v2.0</span>
          </div>
          <p className="text-[9px] tracking-wider" style={{ color: 'rgba(255,255,255,0.2)' }}>
            SECTEUR : MONTRÉAL_QC · RÉGLEMENTATION : LOI_25 · TOUS SYSTÈMES NOMINAUX
          </p>
          <div className="flex items-center gap-4">
            <Link href={loginHref} className="text-[9px] tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>CONNEXION</Link>
            <Link href={hubHref}   className="text-[9px] tracking-widest" style={{ color: 'rgba(255,255,255,0.25)' }}>HUB</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
