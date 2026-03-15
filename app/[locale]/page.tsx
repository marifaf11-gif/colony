import type { Locale } from '@/lib/i18n/config';
import { LandingClient } from './landing-client';

interface HomePageProps {
  params: { locale: Locale };
}

export default function HomePage({ params }: HomePageProps) {
  const { locale } = params;
  return <LandingClient locale={locale} />;
}
