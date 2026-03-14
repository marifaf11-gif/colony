"use client";

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Circle as XCircle, ArrowLeft, RefreshCw } from 'lucide-react';

function CancelContent({ locale }: { locale: string }) {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const strikeId     = searchParams.get('strike');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,59,59,0.05) 0%, #050505 60%)' }}>

      <div className="relative z-10 w-full max-w-md text-center space-y-8">
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-2 rounded-full"
            style={{ background: 'rgba(255,59,59,0.06)', border: '1px solid rgba(255,59,59,0.2)' }} />
          <XCircle className="w-12 h-12 relative z-10"
            style={{ color: '#FF3B3B', filter: 'drop-shadow(0 0 12px rgba(255,59,59,0.4))' }} />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-white">Checkout Cancelled</h1>
          <p className="text-base" style={{ color: 'rgba(255,255,255,0.4)' }}>
            No charge was made. You can return and retry at any time.
          </p>
        </div>

        <div className="rounded-2xl p-6 space-y-3"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <p className="text-[10px] text-left" style={{ color: 'rgba(255,255,255,0.3)' }}>
            The Stripe checkout session has expired or was closed. The target strike remains in{' '}
            <span className="font-mono" style={{ color: '#FFB830' }}>AUDITED</span> status and is
            ready to invoice again whenever you are.
          </p>
          {strikeId && (
            <div className="text-left">
              <p className="text-[9px] tracking-widest uppercase mb-1" style={{ color: 'rgba(255,255,255,0.2)' }}>STRIKE ID</p>
              <p className="text-[11px] font-mono" style={{ color: 'rgba(255,255,255,0.25)' }}>{strikeId}</p>
            </div>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push(`/${locale}/core/hub`)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}>
            <ArrowLeft className="w-4 h-4" />
            BACK TO MISSION CONTROL
          </button>
          <button
            onClick={() => router.push(`/${locale}/core/hub`)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'rgba(57,255,20,0.06)', border: '1px solid rgba(57,255,20,0.2)', color: '#39FF14' }}>
            <RefreshCw className="w-4 h-4" />
            RETRY INVOICE
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RemediationCancelPage({ params }: { params: { locale: string } }) {
  return (
    <Suspense>
      <CancelContent locale={params.locale} />
    </Suspense>
  );
}
