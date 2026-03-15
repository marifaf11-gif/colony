import type { Locale } from '@/lib/i18n/config';
import { CyberchienClient } from './cyberchien-client';

interface PageProps {
  params: { locale: Locale };
}

export default function CyberchienPage({ params }: PageProps) {
  return <CyberchienClient locale={params.locale} />;
}
