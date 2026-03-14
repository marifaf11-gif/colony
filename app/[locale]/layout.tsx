import '../globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { locales, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { LanguageProvider } from '@/lib/i18n/language-provider';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://colonyos.netlify.app';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Colony OS — Loi 25 Compliance Revenue Engine',
    template: '%s | Colony OS',
  },
  description:
    'Autonomous Loi 25 compliance scanning for Montréal businesses. Detect privacy violations, generate AI outreach, and close $299 CAD remediation deals on autopilot.',
  openGraph: {
    type: 'website',
    siteName: 'Colony OS',
    title: 'Colony OS — Loi 25 Compliance Revenue Engine',
    description:
      'Autonomous Loi 25 compliance scanning for Montréal businesses. Detect privacy violations, generate AI outreach, and close $299 CAD remediation deals on autopilot.',
  },
  robots: { index: true, follow: true },
};

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

interface RootLayoutProps {
  children: React.ReactNode;
  params: { locale: Locale };
}

export default async function RootLayout({
  children,
  params,
}: RootLayoutProps) {
  const { locale } = params;
  const dictionary = await getDictionary(locale);

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={inter.className}>
        <LanguageProvider initialLocale={locale} dictionary={dictionary}>
          {children}
          <Toaster />
        </LanguageProvider>
      </body>
    </html>
  );
}
