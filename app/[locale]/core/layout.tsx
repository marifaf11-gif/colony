import { DashboardSidebar } from '@/components/colony/dashboard-sidebar';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { LanguageProvider } from '@/lib/i18n/language-provider';
import type { Locale } from '@/lib/i18n/config';

interface CoreLayoutProps {
  children: React.ReactNode;
  params: { locale: Locale };
}

export default async function CoreLayout({ children, params }: CoreLayoutProps) {
  const { locale } = params;
  const dictionary = await getDictionary(locale);

  return (
    <LanguageProvider initialLocale={locale} dictionary={dictionary}>
      <div
        className="flex h-screen overflow-hidden"
        style={{ background: '#0a0c10' }}
      >
        <DashboardSidebar locale={locale} />
        <main className="flex-1 overflow-hidden flex flex-col">
          {children}
        </main>
      </div>
    </LanguageProvider>
  );
}
