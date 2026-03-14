import { getDictionary } from '@/lib/i18n/get-dictionary';
import type { Locale } from '@/lib/i18n/config';
import { redirect } from 'next/navigation';

interface HomePageProps {
  params: { locale: Locale };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = params;
  redirect(`/${locale}/pods/conversion-catalyst`);
}
