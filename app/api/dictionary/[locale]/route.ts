import { NextRequest, NextResponse } from 'next/server';
import { locales } from '@/lib/i18n/config';
import type { Locale } from '@/lib/i18n/config';

export async function GET(
  _request: NextRequest,
  { params }: { params: { locale: string } }
) {
  const { locale } = params;

  if (!locales.includes(locale as Locale)) {
    return NextResponse.json({ error: 'Unsupported locale' }, { status: 400 });
  }

  try {
    const dict = await import(`@/locales/${locale}/common.json`).then((m) => m.default);
    return NextResponse.json(dict, {
      headers: { 'Cache-Control': 'public, max-age=3600' },
    });
  } catch {
    return NextResponse.json({ error: 'Dictionary not found' }, { status: 404 });
  }
}
