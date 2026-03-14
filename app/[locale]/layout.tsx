import '../globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { locales, type Locale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { LanguageProvider } from '@/lib/i18n/language-provider';
import { Toaster } from '@/components/ui/sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Colony OS',
  description: 'A skeuomorphic operating system interface',
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
