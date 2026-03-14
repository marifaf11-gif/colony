"use client";

import { useLanguage } from '@/lib/i18n/language-provider';
import { MetalButton } from './metal-button';
import { GlassCard } from './glass-card';
import { Globe, Sparkles } from 'lucide-react';

interface ColonyWelcomeProps {
  dictionary: Record<string, any>;
}

export function ColonyWelcome({ dictionary }: ColonyWelcomeProps) {
  const { locale, setLocale, t } = useLanguage();

  const toggleLanguage = () => {
    setLocale(locale === 'en-CA' ? 'fr-QC' : 'en-CA');
  };

  return (
    <div className="min-h-screen bg-metal-base flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 mb-6 rounded-full bg-metal-gradient shadow-tactile">
            <Sparkles className="w-10 h-10 text-primary" />
          </div>

          <h1 className="text-5xl font-bold mb-4 text-foreground">
            {t('app.title')}
          </h1>

          <p className="text-xl text-muted-foreground mb-8">
            {t('app.description')}
          </p>
        </div>

        <GlassCard className="p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4 text-foreground">
            {t('common.welcome')}
          </h2>

          <p className="text-muted-foreground mb-6 leading-relaxed">
            Welcome to Colony OS, a demonstration of Skeuomorphism 2.0 design principles.
            This interface features tactile materials like brushed metal and frosted glass,
            physical depth through layered shadows, and realistic lighting effects.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-metal-highlight/50 rounded-lg p-4 shadow-inner-medium">
              <h3 className="font-semibold mb-2 text-foreground">3D Depth</h3>
              <p className="text-sm text-muted-foreground">
                Multi-layered shadows create realistic elevation and physical presence.
              </p>
            </div>

            <div className="bg-metal-highlight/50 rounded-lg p-4 shadow-inner-medium">
              <h3 className="font-semibold mb-2 text-foreground">Tactile Materials</h3>
              <p className="text-sm text-muted-foreground">
                Brushed metal, frosted glass, and physical textures throughout.
              </p>
            </div>

            <div className="bg-metal-highlight/50 rounded-lg p-4 shadow-inner-medium">
              <h3 className="font-semibold mb-2 text-foreground">Physical Lighting</h3>
              <p className="text-sm text-muted-foreground">
                Top-down light source with highlights and ambient shadows.
              </p>
            </div>

            <div className="bg-metal-highlight/50 rounded-lg p-4 shadow-inner-medium">
              <h3 className="font-semibold mb-2 text-foreground">Bilingual Support</h3>
              <p className="text-sm text-muted-foreground">
                Full support for English (Canada) and French (Québec).
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <MetalButton
              variant="primary"
              onClick={toggleLanguage}
              icon={<Globe className="w-5 h-5" />}
            >
              {locale === 'en-CA' ? 'Français' : 'English'}
            </MetalButton>

            <MetalButton variant="secondary">
              {t('navigation.dashboard')}
            </MetalButton>
          </div>
        </GlassCard>

        <div className="text-center text-sm text-muted-foreground">
          <p>
            Built with Next.js 15, TypeScript, Tailwind CSS 4, and Supabase
          </p>
        </div>
      </div>
    </div>
  );
}
