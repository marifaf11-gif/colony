import { StrikeClient } from './strike-client';

interface Props {
  params: { locale: string };
}

export default function StrikePage({ params }: Props) {
  return <StrikeClient locale={params.locale} />;
}

export async function generateStaticParams() {
  return [
    { locale: 'en-CA' },
    { locale: 'fr-QC' },
    { locale: 'es' },
    { locale: 'de' },
    { locale: 'ja' },
  ];
}
