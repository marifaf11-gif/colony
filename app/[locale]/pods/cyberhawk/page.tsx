import type { Locale } from '@/lib/i18n/config';
import { CyberhawkClient } from './cyberhawk-client';

interface PageProps {
  params: { locale: Locale };
}

export default function CyberhawkPage({ params }: PageProps) {
  return <CyberhawkClient locale={params.locale} />;
}
