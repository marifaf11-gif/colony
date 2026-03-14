import type { Locale } from '@/lib/i18n/config';
import { LoginClient } from './login-client';

interface PageProps {
  params: { locale: Locale };
}

export default function LoginPage({ params }: PageProps) {
  return <LoginClient locale={params.locale} />;
}
