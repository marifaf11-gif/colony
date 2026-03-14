"use client";

import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { CreditCard, TrendingUp, CircleCheck as CheckCircle2, DollarSign } from 'lucide-react';

interface PaymentRow {
  id: string;
  strike_id: string | null;
  stripe_session_id: string;
  amount_cents: number;
  currency: string;
  status: string;
  customer_email: string | null;
  created_at: string;
}

function LiveDot({ color = '#39FF14' }: { color?: string }) {
  return (
    <span className="relative flex items-center justify-center w-2 h-2">
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-60" style={{ background: color }} />
      <span className="relative inline-flex rounded-full w-1.5 h-1.5" style={{ background: color }} />
    </span>
  );
}

export function PaymentsPanel() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);

  const load = useCallback(async () => {
    const sb = createClient();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data } = await (sb as any)
      .from('payments')
      .select('id, strike_id, stripe_session_id, amount_cents, currency, status, customer_email, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    if (data) setPayments(data as PaymentRow[]);
  }, []);

  useEffect(() => {
    load();
    const sb = createClient();
    const ch = sb
      .channel('payments-rt')
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .on('postgres_changes', { event: '*', schema: 'public', table: 'payments' } as any, load)
      .subscribe();
    return () => { sb.removeChannel(ch); };
  }, [load]);

  const totalCents   = payments.reduce((s, p) => s + (p.amount_cents ?? 0), 0);
  const confirmedCnt = payments.filter((p) => p.status === 'succeeded').length;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <DollarSign className="w-3.5 h-3.5" style={{ color: '#39FF14' }} />
        <p className="text-[9px] font-bold tracking-[0.22em] uppercase flex-1" style={{ color: 'rgba(255,255,255,0.25)' }}>
          CONFIRMED_REVENUE
        </p>
        <LiveDot color="#39FF14" />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg px-3 py-2 text-center"
          style={{ background: 'rgba(57,255,20,0.06)', border: '1px solid rgba(57,255,20,0.15)' }}>
          <p className="text-[8px] tracking-widest uppercase mb-1" style={{ color: 'rgba(255,255,255,0.25)' }}>COLLECTED</p>
          <p className="text-sm font-bold font-mono" style={{ color: '#39FF14', textShadow: '0 0 10px rgba(57,255,20,0.4)' }}>
            ${(totalCents / 100).toLocaleString('en-CA', { minimumFractionDigits: 2 })}
          </p>
        </div>
        <div className="rounded-lg px-3 py-2 text-center"
          style={{ background: 'rgba(74,158,255,0.06)', border: '1px solid rgba(74,158,255,0.15)' }}>
          <p className="text-[8px] tracking-widest uppercase mb-1" style={{ color: 'rgba(255,255,255,0.25)' }}>PAYMENTS</p>
          <p className="text-sm font-bold font-mono" style={{ color: '#4A9EFF' }}>{confirmedCnt}</p>
        </div>
      </div>

      {payments.length > 0 ? (
        <div className="space-y-1">
          {payments.slice(0, 3).map((p) => (
            <div key={p.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg"
              style={{ background: 'rgba(57,255,20,0.03)', border: '1px solid rgba(57,255,20,0.08)' }}>
              <CheckCircle2 className="w-3 h-3 shrink-0" style={{ color: '#39FF14' }} />
              <div className="flex-1 min-w-0">
                <p className="text-[9px] font-mono truncate" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  {p.customer_email ?? p.stripe_session_id.slice(0, 16) + '…'}
                </p>
              </div>
              <span className="text-[9px] font-bold font-mono shrink-0" style={{ color: '#39FF14' }}>
                ${(p.amount_cents / 100).toFixed(2)}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-4 text-center rounded-lg" style={{ border: '1px dashed rgba(57,255,20,0.12)' }}>
          <CreditCard className="w-5 h-5 mx-auto mb-1.5 opacity-20" style={{ color: '#39FF14' }} />
          <p className="text-[9px]" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Awaiting first payment
          </p>
          <p className="text-[8px] mt-0.5" style={{ color: 'rgba(255,255,255,0.12)' }}>
            Send a Stripe invoice to close the loop
          </p>
        </div>
      )}

      {payments.length > 0 && (
        <div className="flex items-center justify-between pt-1">
          <span className="text-[8px] tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.15)' }}>
            LAST {payments.length} PAYMENTS
          </span>
          <TrendingUp className="w-3 h-3" style={{ color: '#39FF14', opacity: 0.4 }} />
        </div>
      )}
    </div>
  );
}
