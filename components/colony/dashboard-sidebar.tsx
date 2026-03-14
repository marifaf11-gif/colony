"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { GlobeViewDynamic } from './globe-view-dynamic';
import { PodSwitchboard } from './pod-switchboard';
import { AgentTerminal } from './agent-terminal';
import { useLanguage } from '@/lib/i18n/language-provider';
import { localeNames, localeFlags, locales, type Locale } from '@/lib/i18n/config';
import {
  Globe,
  Settings,
  ChevronDown,
  Command,
  Crosshair,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardSidebarProps {
  locale: string;
}

export function DashboardSidebar({ locale }: DashboardSidebarProps) {
  const { t, setLocale } = useLanguage();
  const pathname = usePathname();
  const [langOpen, setLangOpen] = useState(false);

  const hubHref = `/${locale}/core/hub`;
  const hubActive = pathname === hubHref || pathname.startsWith(`/${locale}/core`);

  return (
    <aside
      className="flex flex-col h-full w-64 shrink-0"
      style={{
        background: 'linear-gradient(180deg, #171c24 0%, #0f1319 100%)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        boxShadow: '4px 0 24px rgba(0,0,0,0.5)',
      }}
    >
      <div className="px-4 py-5 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
            style={{
              background: 'linear-gradient(135deg, #4A9EFF 0%, #2a7ee8 100%)',
              boxShadow: '0 0 12px rgba(74,158,255,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
          >
            <Globe className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-white leading-none">Colony OS</p>
            <p className="text-xs text-white/40 mt-0.5">{t('dashboard.globalCommand')}</p>
          </div>
        </div>
      </div>

      <div className="px-3 py-4 border-b border-white/5">
        <GlobeViewDynamic className="w-full h-40" />
      </div>

      <div className="px-3 pt-4 pb-2">
        <Link
          href={hubHref}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-150"
          style={
            hubActive
              ? {
                  background: 'linear-gradient(135deg, rgba(74,158,255,0.18) 0%, rgba(74,158,255,0.05) 100%)',
                  boxShadow: 'inset 0 1px 0 rgba(74,158,255,0.2)',
                  border: '1px solid rgba(74,158,255,0.2)',
                  color: '#fff',
                }
              : {
                  color: 'rgba(255,255,255,0.5)',
                  border: '1px solid transparent',
                }
          }
        >
          <Command
            className="w-4 h-4 shrink-0"
            style={{ color: hubActive ? '#4A9EFF' : 'inherit' }}
          />
          <span>Mission Control</span>
          {hubActive && (
            <div
              className="ml-auto w-1.5 h-1.5 rounded-full"
              style={{ background: '#4A9EFF', boxShadow: '0 0 6px #4A9EFF' }}
            />
          )}
        </Link>
      </div>

      <div className="px-3 py-3 flex-1 overflow-y-auto min-h-0">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20 px-1 mb-2">
          Fleet
        </p>
        <PodSwitchboard locale={locale} />

        <div className="mt-4">
          <Link
            href={`/${locale}/core/strike`}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150 mb-3"
            style={{
              background: 'linear-gradient(135deg, rgba(255,69,0,0.12) 0%, rgba(255,69,0,0.04) 100%)',
              border: '1px solid rgba(255,69,0,0.2)',
              color: '#FF6B35',
            }}
          >
            <Crosshair className="w-3.5 h-3.5 shrink-0" style={{ color: '#FF4500' }} />
            <span>Strike Engine</span>
            <div
              className="ml-auto w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ background: '#FF4500', boxShadow: '0 0 4px #FF4500' }}
            />
          </Link>

          <AgentTerminal />
        </div>
      </div>

      <div className="px-3 py-4 border-t border-white/5 space-y-2">
        <div className="relative">
          <button
            onClick={() => setLangOpen((v) => !v)}
            className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-white/60 hover:text-white/80 hover:bg-white/5 transition-all"
          >
            <Globe className="w-4 h-4 shrink-0" />
            <span>{localeNames[locale as Locale] ?? locale}</span>
            <ChevronDown
              className={cn('w-3.5 h-3.5 ml-auto transition-transform', langOpen && 'rotate-180')}
            />
          </button>

          {langOpen && (
            <div
              className="absolute bottom-full left-0 right-0 mb-1 rounded-lg overflow-hidden z-50"
              style={{
                background: '#1a1c20',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 -8px 24px rgba(0,0,0,0.5)',
              }}
            >
              {locales.map((loc) => (
                <button
                  key={loc}
                  onClick={() => {
                    setLocale(loc);
                    setLangOpen(false);
                    window.location.href = `/${loc}/pods/conversion-catalyst`;
                  }}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors',
                    loc === locale
                      ? 'text-white bg-white/10'
                      : 'text-white/50 hover:text-white hover:bg-white/5'
                  )}
                >
                  <span className="text-base">{localeFlags[loc]}</span>
                  <span>{localeNames[loc]}</span>
                  {loc === locale && (
                    <div
                      className="ml-auto w-1.5 h-1.5 rounded-full"
                      style={{ background: '#4A9EFF' }}
                    />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        <Link
          href={`/${locale}`}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-all"
        >
          <Settings className="w-4 h-4" />
          <span>{t('common.settings')}</span>
        </Link>
      </div>
    </aside>
  );
}
