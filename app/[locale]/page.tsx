import { redirect } from 'next/navigation';
import type { Locale } from '@/lib/i18n/config';
import { createServerClient } from '@/lib/supabase/server';
import { LandingClient } from './landing-client';

export const dynamic = 'force-dynamic';

interface HomePageProps {
  params: { locale: Locale };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = params;

  const supabase = await createServerClient();
  const { data: { session } } = await supabase.auth.getSession();

  if (session) {
    redirect(`/${locale}/core/hub`);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = supabase as any;

  const [strikesRes, highRes] = await Promise.all([
    sb.from('strikes').select('id, revenue_value', { count: 'exact' }),
    sb.from('strikes').select('id', { count: 'exact' }).eq('severity', 'HIGH'),
  ]);

  const rows        = (strikesRes.data ?? []) as { revenue_value: number }[];
  const revenuePool = rows.reduce((sum: number, r: { revenue_value: number }) => sum + (r.revenue_value ?? 0), 0);

  const stats = {
    totalStrikes: strikesRes.count ?? rows.length,
    highSeverity: highRes.count ?? 0,
    revenuePool,
  };

  return <LandingClient locale={locale} stats={stats} />;
}
