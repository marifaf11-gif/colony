import { getDictionary } from '@/lib/i18n/get-dictionary';
import type { Locale } from '@/lib/i18n/config';
import { ConversionCatalystClient } from './conversion-catalyst-client';

interface PageProps {
  params: { locale: Locale };
}

export default async function ConversionCatalystPage({ params }: PageProps) {
  const { locale } = params;
  const dict = await getDictionary(locale);

  return <ConversionCatalystClient dictionary={dict} locale={locale} />;
}
