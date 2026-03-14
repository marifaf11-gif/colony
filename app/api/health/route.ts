import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createServerClient();
    type AppStateRow = { id: number; is_scanning: boolean; updated_at: string };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await (supabase as any)
      .from('app_state')
      .select('id, is_scanning, updated_at')
      .eq('id', 1)
      .maybeSingle();
    const data  = result.data  as AppStateRow | null;
    const error = result.error as { message: string } | null;

    if (error || !data) {
      return NextResponse.json(
        { status: 'DOWN', reason: error?.message ?? 'app_state row missing' },
        { status: 503 }
      );
    }

    return NextResponse.json({
      status:      'OK',
      is_scanning: data.is_scanning,
      checked_at:  new Date().toISOString(),
      db_updated:  data.updated_at,
    });
  } catch (err) {
    return NextResponse.json(
      { status: 'DOWN', reason: String(err) },
      { status: 503 }
    );
  }
}
