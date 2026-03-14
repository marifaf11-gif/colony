import type { Locale } from '@/lib/i18n/config';
import { HubClient } from './hub-client';

interface PageProps {
  params: { locale: Locale };
}

export default function HubPage({ params }: PageProps) {
  return <HubClient locale={params.locale} />;
}
