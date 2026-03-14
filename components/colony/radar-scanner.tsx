"use client";

import { useEffect, useRef, useState } from 'react';

export interface RadarBlip {
  id: string;
  angle: number;
  radius: number;
  label: string;
  severity: 'high' | 'mid' | 'low';
  born: number;
}

interface RadarScannerProps {
  externalBlips?: RadarBlip[];
  onBlipClick?: (id: string) => void;
  highlightedId?: string | null;
}

const SEVERITY_COLOR = {
  high: '#FF3B3B',
  mid:  '#FFB830',
  low:  '#39FF14',
};

const SEED_BLIPS: RadarBlip[] = [
  { id: 's1', angle: 42,  radius: 0.55, label: 'plomberie-elite.ca',  severity: 'high', born: Date.now() },
  { id: 's2', angle: 130, radius: 0.38, label: 'reno-expert.qc.ca',   severity: 'mid',  born: Date.now() },
  { id: 's3', angle: 205, radius: 0.72, label: 'menuiserie-mtl.com',   severity: 'low',  born: Date.now() },
  { id: 's4', angle: 310, radius: 0.45, label: 'vitrier-rapide.ca',    severity: 'high', born: Date.now() },
  { id: 's5', angle: 275, radius: 0.62, label: 'electro-pro-qc.com',   severity: 'mid',  born: Date.now() },
];

const SPAWN_POOL = [
  { label: 'chauffage-mtl.ca',    severity: 'high' as const },
  { label: 'toiture-pro.qc.ca',   severity: 'mid'  as const },
  { label: 'isolation-ici.com',   severity: 'low'  as const },
  { label: 'peinture-elite.ca',   severity: 'high' as const },
  { label: 'pose-plancher.qc.ca', severity: 'mid'  as const },
  { label: 'serrurier-24h.ca',    severity: 'low'  as const },
];

export function RadarScanner({ externalBlips, onBlipClick, highlightedId }: RadarScannerProps) {
  const [sweep, setSweep]   = useState(0);
  const [seeds, setSeeds]   = useState<RadarBlip[]>(SEED_BLIPS);
  const sweepRef            = useRef(0);
  const lastSpawnRef        = useRef(0);

  const activeBlips: RadarBlip[] = externalBlips && externalBlips.length > 0
    ? externalBlips
    : seeds;

  useEffect(() => {
    let raf: number;
    const tick = (ts: number) => {
      sweepRef.current = (sweepRef.current + 0.4) % 360;
      setSweep(sweepRef.current);

      if (!externalBlips && ts - lastSpawnRef.current > 4500 + Math.random() * 3000) {
        lastSpawnRef.current = ts;
        const c = SPAWN_POOL[Math.floor(Math.random() * SPAWN_POOL.length)];
        setSeeds((prev) => [
          ...prev.slice(-10),
          { id: `s-${ts}`, angle: Math.random() * 360, radius: 0.25 + Math.random() * 0.65, label: c.label, severity: c.severity, born: Date.now() },
        ]);
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [externalBlips]);

  const SIZE = 320;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const R  = SIZE / 2 - 12;

  const toXY = (angleDeg: number, r: number) => {
    const a = ((angleDeg - 90) * Math.PI) / 180;
    return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
  };

  const blipOpacity = (blip: RadarBlip) => {
    let diff = ((sweepRef.current - blip.angle + 360) % 360);
    if (diff > 180) diff = 0;
    return Math.max(0.1, diff < 140 ? 1 - diff / 140 : 0);
  };

  return (
    <div className="relative select-none" style={{ width: SIZE, height: SIZE }}>
      <svg width={SIZE} height={SIZE} viewBox={`0 0 ${SIZE} ${SIZE}`} style={{ overflow: 'visible' }}>
        <defs>
          <filter id="rf-glow">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="rf-blip-glow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <clipPath id="rc-clip">
            <circle cx={CX} cy={CY} r={R} />
          </clipPath>
        </defs>

        <circle cx={CX} cy={CY} r={R + 10} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth="1" />
        <circle cx={CX} cy={CY} r={R} fill="rgba(5,10,16,0.85)" stroke="rgba(57,255,20,0.18)" strokeWidth="1.5" />

        {[0.33, 0.55, 0.77, 1].map((f) => (
          <circle key={f} cx={CX} cy={CY} r={R * f} fill="none"
            stroke="rgba(57,255,20,0.07)" strokeWidth="0.75"
            strokeDasharray={f < 1 ? "4 6" : undefined}
          />
        ))}

        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          return (
            <line key={i}
              x1={CX + 18 * Math.cos(a - Math.PI / 2)} y1={CY + 18 * Math.sin(a - Math.PI / 2)}
              x2={CX + R  * Math.cos(a - Math.PI / 2)} y2={CY + R  * Math.sin(a - Math.PI / 2)}
              stroke="rgba(57,255,20,0.06)" strokeWidth="0.6"
            />
          );
        })}

        {[0, 90, 180, 270].map((deg) => {
          const { x, y } = toXY(deg, R + 6);
          const labels: Record<number, string> = { 0: 'N', 90: 'E', 180: 'S', 270: 'W' };
          return (
            <text key={deg} x={x} y={y} textAnchor="middle" dominantBaseline="middle"
              fill="rgba(57,255,20,0.35)" fontSize="9" fontFamily="monospace" fontWeight="700" letterSpacing="1">
              {labels[deg]}
            </text>
          );
        })}

        <g clipPath="url(#rc-clip)">
          <path
            d={(() => {
              const sweepRad = (sweep * Math.PI) / 180;
              const ex = CX + R * Math.cos(sweepRad - Math.PI / 2);
              const ey = CY + R * Math.sin(sweepRad - Math.PI / 2);
              const tx = CX + R * Math.cos(sweepRad - Math.PI / 2 - 1.4);
              const ty = CY + R * Math.sin(sweepRad - Math.PI / 2 - 1.4);
              return `M ${CX} ${CY} L ${ex} ${ey} A ${R} ${R} 0 0 0 ${tx} ${ty} Z`;
            })()}
            fill="rgba(57,255,20,0.06)"
          />

          <line
            x1={CX} y1={CY}
            x2={CX + R * Math.cos((sweep * Math.PI) / 180 - Math.PI / 2)}
            y2={CY + R * Math.sin((sweep * Math.PI) / 180 - Math.PI / 2)}
            stroke="#39FF14" strokeWidth="1.5" opacity="0.7"
            filter="url(#rf-glow)"
          />

          {activeBlips.map((blip) => {
            const { x, y } = toXY(blip.angle, blip.radius * R);
            const col      = SEVERITY_COLOR[blip.severity];
            const op       = blipOpacity(blip);
            const isHot    = highlightedId === blip.id;
            return (
              <g key={blip.id} style={{ cursor: onBlipClick ? 'pointer' : 'default' }}
                onClick={() => onBlipClick?.(blip.id)}>
                <circle cx={x} cy={y} r={isHot ? 9 : 5} fill={col} opacity={op * 0.18} />
                <circle cx={x} cy={y} r={isHot ? 4.5 : 2.5} fill={col}
                  opacity={Math.max(0.3, op)} filter="url(#rf-blip-glow)" />
                <circle cx={x} cy={y} r={1.5} fill={col} opacity={1} />
                {isHot && (
                  <circle cx={x} cy={y} r={12} fill="none" stroke={col}
                    strokeWidth="1" opacity="0.6" strokeDasharray="3 3" />
                )}
                {(isHot || op > 0.5) && (
                  <text x={x + 9} y={y - 4} fill={col} fontSize="7.5"
                    fontFamily="monospace" fontWeight="600"
                    opacity={Math.max(0.4, op * 0.9)}>
                    {blip.label}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        <circle cx={CX} cy={CY} r={5}  fill="none" stroke="rgba(57,255,20,0.5)" strokeWidth="1" />
        <circle cx={CX} cy={CY} r={2}  fill="#39FF14" opacity="0.9" />
      </svg>

      <div className="absolute inset-0 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, transparent 60%, rgba(0,0,0,0.5) 100%)' }}
      />
    </div>
  );
}
