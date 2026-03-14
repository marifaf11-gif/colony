import { NextRequest, NextResponse } from 'next/server';
import { createServerClient as createSupabaseServer } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';

export async function DELETE(request: NextRequest) {
  const cookieStore = cookies();

  const supabase = createSupabaseServer(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    }
  );

  const { data: { session }, error: sessionError } = await supabase.auth.getSession();

  if (sessionError || !session) {
    return NextResponse.json(
      { error: 'Unauthorized — a valid session is required.' },
      { status: 401 }
    );
  }

  const userId    = session.user.id;
  const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0].trim()
    ?? request.headers.get('x-real-ip')
    ?? null;

  const admin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sb = admin as any;

  const { data: auditRow } = await sb
    .from('gdpr_audit')
    .insert({ user_id: userId, status: 'pending', ip_address: ipAddress })
    .select('id')
    .maybeSingle();
  const auditId: string | null = auditRow?.id ?? null;

  const deletionLog: string[] = [];
  const errors: string[]      = [];

  const { data: userStrikes } = await sb
    .from('strikes')
    .select('id')
    .eq('created_by', userId);

  const strikeIds: string[] = (userStrikes ?? []).map((s: { id: string }) => s.id);

  if (strikeIds.length > 0) {
    const { error: paymentsErr } = await sb
      .from('payments')
      .delete()
      .in('strike_id', strikeIds);
    if (paymentsErr) errors.push(`payments: ${paymentsErr.message}`);
    else deletionLog.push(`payments (${strikeIds.length} strikes)`);

    const { error: notifErr } = await sb
      .from('notifications')
      .delete()
      .eq('user_id', userId);
    if (notifErr) errors.push(`notifications: ${notifErr.message}`);
    else deletionLog.push('notifications');

    const { error: strikesErr } = await sb
      .from('strikes')
      .delete()
      .in('id', strikeIds);
    if (strikesErr) errors.push(`strikes: ${strikesErr.message}`);
    else deletionLog.push(`strikes (${strikeIds.length})`);
  } else {
    deletionLog.push('strikes (none found)');
  }

  const { error: profileErr } = await sb
    .from('profiles')
    .delete()
    .eq('id', userId);
  if (profileErr) errors.push(`profile: ${profileErr.message}`);
  else deletionLog.push('profile');

  const { error: authErr } = await admin.auth.admin.deleteUser(userId);
  if (authErr) errors.push(`auth user: ${authErr.message}`);
  else deletionLog.push('auth user');

  const finalStatus = errors.length === 0 ? 'completed' : deletionLog.length > 0 ? 'partial' : 'failed';
  const timestamp   = new Date().toISOString();

  if (auditId) {
    await sb
      .from('gdpr_audit')
      .update({ status: finalStatus, deleted: deletionLog, errors })
      .eq('id', auditId);
  }

  if (errors.length > 0) {
    return NextResponse.json(
      {
        success: false,
        deleted: deletionLog,
        errors,
        audit_id: auditId,
        message: 'Partial deletion completed. Some records could not be removed — contact support.',
        timestamp,
      },
      { status: 207 }
    );
  }

  return NextResponse.json({
    success: true,
    deleted: deletionLog,
    audit_id: auditId,
    message: 'All personal data has been permanently deleted per your GDPR/Loi 25 right to erasure request.',
    timestamp,
  });
}
