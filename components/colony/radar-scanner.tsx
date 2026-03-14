"use client";

import { useEffect, useRef, useState } from 'react';

interface RadarBlip {
  id: string;
  angle: number;
  radius: number;
  label: string;
  severity: 'high' | 'mid' | 'low';
  born: number;
}

const SEVERITY_COLOR = {
  high: '#FF3B3B',
  mid: '#FFB830',
  low: '#39FF14',
};

const INITIAL_BLIPS: RadarBlip[] = [
  { id: 'b1', angle: 42,  radius: 0.55, label: 'plomberie-elite.ca',  severity: 'high', born: Date.now() },
  { id: 'b2', angle: 130, radius: 0.38, label: 'reno-expert.qc.ca',  severity: 'mid',  born: Date.now() },
  { id: 'b3', angle: 205, radius: 0.72, label: 'menuiserie-mtl.com',  severity: 'low',  born: Date.now() },
  { id: 'b4', angle: 310, radius: 0.45, label: 'vitrier-rapide.ca',   severity: 'high', born: Date.now() },
  { id: 'b5', angle: 275, radius: 0.62, label: 'electro-pro-qc.com',  severity: 'mid',  born: Date.now() },
];

const CANDIDATE_BLIPS = [
  { label: 'chauffage-mtl.ca',    severity: 'high' as const },
  { label: 'toiture-pro.qc.ca',   severity: 'mid' as const },
  { label: 'isolation-ici.com',   severity: 'low' as const },
  { label: 'peinture-elite.ca',   severity: 'high' as const },
  { label: 'pose-plancher.qc.ca', severity: 'mid' as const },
  { label: 'serrurier-24h.ca',    severity: 'low' as const },
];

export function RadarScanner() {
  const [sweep, setSweep] = useState(0);
  const [blips, setBlips] = useState<RadarBlip[]>(INITIAL_BLIPS);
  const [highlighted, setHighlighted] = useState<string | null>(null);
  const sweepRef = useRef(0);
  const lastSpawnRef = useRef(0);

  useEffect(() => {
    let raf: number;
    const SPEED = 0.4;

    const tick = (ts: number) => {
      sweepRef.current = (sweepRef.current + SPEED) % 360;
      setSweep(sweepRef.current);

      if (ts - lastSpawnRef.current > 4200 + Math.random() * 3000) {
        lastSpawnRef.current = ts;
        const candidate = CANDIDATE_BLIPS[Math.floor(Math.random() * CANDIDATE_BLIPS.length)];
        const newBlip: RadarBlip = {
          id: `b-${ts}`,
          angle: Math.random() * 360,
          radius: 0.25 + Math.random() * 0.65,
          label: candidate.label,
          severity: candidate.severity,
          born: Date.now(),
        };
        setBlips((prev) => [...prev.slice(-10), newBlip]);
      }

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const SIZE = 320;
  const CX = SIZE / 2;
  const CY = SIZE / 2;
  const R = SIZE / 2 - 12;

  const sweepRad = (sweep * Math.PI) / 180;

  const blipOpacity = (blip: RadarBlip) => {
    const bAngle = blip.angle;
    let diff = ((sweepRef.current - bAngle + 360) % 360);
    if (diff > 180) diff = 0;
    const fade = diff < 140 ? 1 - diff / 140 : 0;
    return Math.max(0.08, fade);
  };

  const toXY = (angleDeg: number, r: number) => {
    const a = ((angleDeg - 90) * Math.PI) / 180;
    return { x: CX + r * Math.cos(a), y: CY + r * Math.sin(a) };
  };

  const SWEEPID = 'sweep-grad';
  const GLOWID  = 'glow-filter';

  return (
    <div
      className="relative select-none"
      style={{ width: SIZE, height: SIZE }}
    >
      <svg
        width={SIZE}
        height={SIZE}
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        style={{ overflow: 'visible' }}
      >
        <defs>
          <radialGradient id={SWEEPID} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#39FF14" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#39FF14" stopOpacity="0" />
          </radialGradient>
          <filter id={GLOWID} x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="2.5" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <filter id="blip-glow" x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
          <clipPath id="radar-clip">
            <circle cx={CX} cy={CY} r={R} />
          </clipPath>
        </defs>

        <circle cx={CX} cy={CY} r={R + 10}
          fill="none"
          stroke="rgba(255,255,255,0.04)"
          strokeWidth="1"
        />
        <circle cx={CX} cy={CY} r={R}
          fill="rgba(5,10,16,0.85)"
          stroke="rgba(57,255,20,0.18)"
          strokeWidth="1.5"
        />

        {[0.33, 0.55, 0.77, 1].map((f) => (
          <circle key={f}
            cx={CX} cy={CY} r={R * f}
            fill="none"
            stroke="rgba(57,255,20,0.07)"
            strokeWidth="0.75"
            strokeDasharray={f < 1 ? "4 6" : undefined}
          />
        ))}

        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i * 30 * Math.PI) / 180;
          return (
            <line key={i}
              x1={CX + 18 * Math.cos(a - Math.PI / 2)}
              y1={CY + 18 * Math.sin(a - Math.PI / 2)}
              x2={CX + R * Math.cos(a - Math.PI / 2)}
              y2={CY + R * Math.sin(a - Math.PI / 2)}
              stroke="rgba(57,255,20,0.06)"
              strokeWidth="0.6"
            />
          );
        })}

        {[0, 90, 180, 270].map((deg) => {
          const { x, y } = toXY(deg, R + 6);
          const labels: Record<number, string> = { 0: 'N', 90: 'E', 180: 'S', 270: 'W' };
          return (
            <text key={deg}
              x={x} y={y}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="rgba(57,255,20,0.35)"
              fontSize="9"
              fontFamily="monospace"
              fontWeight="700"
              letterSpacing="1"
            >
              {labels[deg]}
            </text>
          );
        })}

        <g clipPath="url(#radar-clip)">
          <path
            d={`M ${CX} ${CY} L ${CX + R * Math.cos(sweepRad - Math.PI / 2)} ${CY + R * Math.sin(sweepRad - Math.PI / 2)} A ${R} ${R} 0 0 0 ${CX + R * Math.cos(sweepRad - Math.PI / 2 - 1.4)} ${CY + R * Math.sin(sweepRad - Math.PI / 2 - 1.4)} Z`}
            fill="url(#sweep-grad)"
            opacity="0.9"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from={`0 ${CX} ${CY}`}
              to={`360 ${CX} ${CY}`}
              dur="3s"
              repeatCount="indefinite"
            />
          </path>

          <line
            x1={CX} y1={CY}
            x2={CX + R * Math.cos(sweepRad - Math.PI / 2)}
            y2={CY + R * Math.sin(sweepRad - Math.PI / 2)}
            stroke="#39FF14"
            strokeWidth="1.5"
            opacity="0.7"
            filter={`url(#${GLOWID})`}
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from={`0 ${CX} ${CY}`}
              to={`360 ${CX} ${CY}`}
              dur="3s"
              repeatCount="indefinite"
            />
          </line>

          {blips.map((blip) => {
            const { x, y } = toXY(blip.angle, blip.radius * R);
            const col = SEVERITY_COLOR[blip.severity];
            const op = blipOpacity(blip);
            const isHot = highlighted === blip.id;
            return (
              <g
                key={blip.id}
                style={{ cursor: 'pointer' }}
                onClick={() => setHighlighted(isHot ? null : blip.id)}
              >
                <circle cx={x} cy={y} r={isHot ? 8 : 5} fill={col} opacity={op * 0.18} />
                <circle cx={x} cy={y} r={isHot ? 4 : 2.5} fill={col} opacity={Math.max(0.3, op)}
                  filter="url(#blip-glow)"
                />
                <circle cx={x} cy={y} r={1.5} fill={col} opacity={1} />
                {(isHot || op > 0.5) && (
                  <text
                    x={x + 8} y={y - 4}
                    fill={col}
                    fontSize="7.5"
                    fontFamily="monospace"
                    fontWeight="600"
                    opacity={Math.max(0.4, op * 0.9)}
                  >
                    {blip.label}
                  </text>
                )}
              </g>
            );
          })}
        </g>

        <circle cx={CX} cy={CY} r={5}
          fill="none"
          stroke="rgba(57,255,20,0.5)"
          strokeWidth="1"
        />
        <circle cx={CX} cy={CY} r={2}
          fill="#39FF14"
          opacity="0.9"
        />
      </svg>

      <div
        className="absolute inset-0 rounded-full pointer-events-none"
        style={{
          background: 'radial-gradient(circle, transparent 60%, rgba(0,0,0,0.5) 100%)',
        }}
      />
    </div>
  );
}
