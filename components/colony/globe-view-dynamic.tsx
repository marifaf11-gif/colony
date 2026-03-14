"use client";

import dynamic from 'next/dynamic';
import { cn } from '@/lib/utils';

const GlobeViewInner = dynamic(
  () => import('./globe-view').then((mod) => mod.GlobeView),
  {
    ssr: false,
    loading: () => (
      <div
        className="w-full h-full rounded-xl flex items-center justify-center"
        style={{
          background: 'radial-gradient(ellipse at center, #0d1f35 0%, #070d18 100%)',
          border: '1px solid rgba(74,158,255,0.1)',
        }}
      >
        <div className="flex flex-col items-center gap-2">
          <div
            className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: 'rgba(74,158,255,0.3)', borderTopColor: 'transparent' }}
          />
          <span className="text-xs font-mono" style={{ color: 'rgba(74,158,255,0.4)' }}>
            INIT
          </span>
        </div>
      </div>
    ),
  }
);

interface GlobeViewDynamicProps {
  className?: string;
}

export function GlobeViewDynamic({ className }: GlobeViewDynamicProps) {
  return <GlobeViewInner className={className} />;
}
