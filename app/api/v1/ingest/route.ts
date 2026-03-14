import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Pod-Key',
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 200, headers: corsHeaders });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pod_slug, event_type, kinks_found, revenue_earned, metadata } = body;

    if (!pod_slug) {
      return NextResponse.json(
        { error: 'pod_slug is required' },
        { status: 400, headers: corsHeaders }
      );
    }

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: (list) => {
            try {
              list.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {}
          },
        },
      }
    );

    const sourceIp =
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      'unknown';

    const { error } = await (supabase as any)
      .from('pod_telemetry')
      .insert({
        pod_slug,
        event_type: event_type ?? 'report',
        kinks_found: kinks_found ?? 0,
        revenue_earned: revenue_earned ?? 0,
        metadata: metadata ?? {},
        source_ip: sourceIp,
        api_version: 'v1',
      });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to persist telemetry' },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      { ok: true, received: { pod_slug, kinks_found, revenue_earned } },
      { status: 201, headers: corsHeaders }
    );
  } catch {
    return NextResponse.json(
      { error: 'Invalid request body' },
      { status: 400, headers: corsHeaders }
    );
  }
}
