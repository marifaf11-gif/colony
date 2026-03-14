"use client";

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CircleCheck as CheckCircle2, ArrowRight, Shield } from 'lucide-react';

function SuccessContent({ locale }: { locale: string }) {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const strikeId     = searchParams.get('strike');
  const [countdown, setCountdown] = useState(6);

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((n) => {
        if (n <= 1) {
          clearInterval(interval);
          router.push(`/${locale}/core/hub`);
        }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [locale, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4"
      style={{ background: 'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(57,255,20,0.07) 0%, #050505 60%)' }}>

      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 28 }).map((_, i) => (
          <div key={i} className="absolute rounded-full animate-ping"
            style={{
              width: Math.random() * 3 + 1,
              height: Math.random() * 3 + 1,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              background: '#39FF14',
              opacity: Math.random() * 0.3 + 0.05,
              animationDuration: `${Math.random() * 3 + 2}s`,
              animationDelay: `${Math.random() * 2}s`,
            }} />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md text-center space-y-8">
        <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full animate-ping"
            style={{ background: 'rgba(57,255,20,0.12)', animationDuration: '2s' }} />
          <div className="absolute inset-2 rounded-full"
            style={{ background: 'rgba(57,255,20,0.08)', border: '1px solid rgba(57,255,20,0.3)' }} />
          <CheckCircle2 className="w-12 h-12 relative z-10"
            style={{ color: '#39FF14', filter: 'drop-shadow(0 0 16px rgba(57,255,20,0.7))' }} />
        </div>

        <div className="space-y-3">
          <h1 className="text-3xl font-bold tracking-tight text-white">Payment Confirmed</h1>
          <p className="text-base" style={{ color: 'rgba(255,255,255,0.5)' }}>
            $299.00 CAD remediation bounty received
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase"
            style={{ background: 'rgba(57,255,20,0.1)', border: '1px solid rgba(57,255,20,0.25)', color: '#39FF14' }}>
            <Shield className="w-3 h-3" />
            LOI 25 REMEDIATION INITIATED
          </div>
        </div>

        <div className="rounded-2xl p-6 space-y-4"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}>
          <div className="grid grid-cols-2 gap-3 text-left">
            <div>
              <p className="text-[9px] tracking-widest uppercase mb-1" style={{ color: 'rgba(255,255,255,0.2)' }}>STATUS</p>
              <p className="text-sm font-bold" style={{ color: '#39FF14' }}>BOUNTY PAID</p>
            </div>
            <div>
              <p className="text-[9px] tracking-widest uppercase mb-1" style={{ color: 'rgba(255,255,255,0.2)' }}>TIMELINE</p>
              <p className="text-sm font-bold text-white">5 Business Days</p>
            </div>
            {strikeId && (
              <div className="col-span-2">
                <p className="text-[9px] tracking-widest uppercase mb-1" style={{ color: 'rgba(255,255,255,0.2)' }}>STRIKE ID</p>
                <p className="text-[11px] font-mono" style={{ color: 'rgba(255,255,255,0.35)' }}>{strikeId}</p>
              </div>
            )}
          </div>
          <div className="rounded-lg px-4 py-3"
            style={{ background: 'rgba(57,255,20,0.04)', border: '1px dashed rgba(57,255,20,0.15)' }}>
            <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
              A compliance remediation report will be prepared and all identified Loi 25 / GDPR gaps will be addressed. You will be notified once remediation is complete.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => router.push(`/${locale}/core/hub`)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold tracking-wider transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, rgba(57,255,20,0.15), rgba(57,255,20,0.08))', border: '1px solid rgba(57,255,20,0.35)', color: '#39FF14', boxShadow: '0 0 24px rgba(57,255,20,0.1)' }}>
            RETURN TO MISSION CONTROL
            <ArrowRight className="w-4 h-4" />
          </button>
          <p className="text-[9px] tracking-widest" style={{ color: 'rgba(255,255,255,0.2)' }}>
            AUTO-REDIRECT IN {countdown}s
          </p>
        </div>
      </div>
    </div>
  );
}

export default function RemediationSuccessPage({ params }: { params: { locale: string } }) {
  return (
    <Suspense>
      <SuccessContent locale={params.locale} />
    </Suspense>
  );
}
