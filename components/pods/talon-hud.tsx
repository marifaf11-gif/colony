"use client";

import { useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

type ScanPhase = 'idle' | 'sweep' | 'lock' | 'complete';

interface TalonHudProps {
  phase: ScanPhase;
  targetUrl?: string;
  className?: string;
}

function drawHud(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  frame: number,
  phase: ScanPhase
) {
  ctx.clearRect(0, 0, w, h);

  const cx = w / 2;
  const cy = h / 2;
  const maxR = Math.min(w, h) * 0.44;

  const alpha = phase === 'idle' ? 0.4 : 1;

  ctx.save();

  for (let i = 1; i <= 4; i++) {
    const r = maxR * (i / 4);
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(74,158,255,${0.08 * alpha})`;
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  ctx.strokeStyle = `rgba(74,158,255,${0.12 * alpha})`;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(cx - maxR, cy);
  ctx.lineTo(cx + maxR, cy);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(cx, cy - maxR);
  ctx.lineTo(cx, cy + maxR);
  ctx.stroke();

  for (let a = 0; a < 360; a += 45) {
    const rad = (a * Math.PI) / 180;
    ctx.beginPath();
    ctx.moveTo(cx + maxR * 0.9 * Math.cos(rad), cy + maxR * 0.9 * Math.sin(rad));
    ctx.lineTo(cx + maxR * Math.cos(rad), cy + maxR * Math.sin(rad));
    ctx.strokeStyle = `rgba(74,158,255,${0.2 * alpha})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  if (phase === 'sweep' || phase === 'lock') {
    const sweepAngle = ((frame * 3) % 360) * (Math.PI / 180);

    {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(sweepAngle);
      const sweepGrad = ctx.createLinearGradient(0, 0, maxR, 0);
      sweepGrad.addColorStop(0, 'rgba(74,158,255,0.55)');
      sweepGrad.addColorStop(1, 'rgba(74,158,255,0)');
      ctx.fillStyle = sweepGrad;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, maxR, -0.35, 0.35);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(
      cx + maxR * Math.cos(sweepAngle),
      cy + maxR * Math.sin(sweepAngle)
    );
    ctx.strokeStyle = 'rgba(74,158,255,0.85)';
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  const crossSize = 14;
  ctx.strokeStyle = `rgba(74,158,255,${0.7 * alpha})`;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(cx - crossSize, cy);
  ctx.lineTo(cx + crossSize, cy);
  ctx.moveTo(cx, cy - crossSize);
  ctx.lineTo(cx, cy + crossSize);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, 3, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(74,158,255,${0.9 * alpha})`;
  ctx.fill();

  if (phase === 'lock' || phase === 'complete') {
    const blips = [
      { a: 30, r: 0.55 },
      { a: 140, r: 0.7 },
      { a: 210, r: 0.4 },
      { a: 310, r: 0.65 },
    ];

    blips.forEach(({ a, r }, i) => {
      const rad = (a * Math.PI) / 180;
      const bx = cx + maxR * r * Math.cos(rad);
      const by = cy + maxR * r * Math.sin(rad);
      const pulse = 0.5 + 0.5 * Math.sin(frame * 0.05 + i);

      ctx.beginPath();
      ctx.arc(bx, by, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255,59,59,${0.8 + 0.2 * pulse})`;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(bx, by, 6 + pulse * 3, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255,59,59,${0.3 * pulse})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    });
  }

  if (phase === 'complete') {
    ctx.strokeStyle = 'rgba(57,255,20,0.7)';
    ctx.lineWidth = 2;
    const lockR = maxR * 0.3;
    ctx.beginPath();
    ctx.moveTo(cx - lockR, cy - lockR);
    ctx.lineTo(cx - lockR, cy - lockR * 0.4);
    ctx.strokeRect(cx - lockR, cy - lockR, lockR * 2, lockR * 2);
  }

  ctx.restore();
}

export function TalonHud({ phase, targetUrl, className }: TalonHudProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const frameRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = () => {
      frameRef.current++;
      const { width: w, height: h } = canvas.getBoundingClientRect();
      canvas.width = w * window.devicePixelRatio;
      canvas.height = h * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
      drawHud(ctx, w, h, frameRef.current, phase);
      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [phase]);

  return (
    <div
      className={cn('relative rounded-xl overflow-hidden flex items-center justify-center', className)}
      style={{
        background: 'radial-gradient(ellipse at center, #051020 0%, #020810 100%)',
        border: '1px solid rgba(74,158,255,0.15)',
        boxShadow: '0 0 40px rgba(74,158,255,0.08), inset 0 0 60px rgba(0,0,0,0.6)',
      }}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(74,158,255,0.015) 2px, rgba(74,158,255,0.015) 3px)',
        }}
      />

      <canvas ref={canvasRef} className="w-full h-full" />

      {targetUrl && phase !== 'idle' && (
        <div
          className="absolute bottom-3 left-3 right-3 flex items-center gap-2"
          style={{
            background: 'rgba(5,10,20,0.85)',
            border: '1px solid rgba(74,158,255,0.2)',
            borderRadius: 6,
            padding: '4px 10px',
          }}
        >
          <div
            className="w-1.5 h-1.5 rounded-full shrink-0"
            style={{
              background: phase === 'complete' ? '#39FF14' : '#4A9EFF',
              boxShadow: `0 0 6px ${phase === 'complete' ? '#39FF14' : '#4A9EFF'}`,
              animation: phase !== 'complete' ? 'pulse 1s infinite' : 'none',
            }}
          />
          <p
            className="text-[10px] font-mono truncate"
            style={{ color: 'rgba(74,158,255,0.7)' }}
          >
            {targetUrl}
          </p>
          <span
            className="text-[10px] font-bold uppercase shrink-0"
            style={{
              color: phase === 'complete' ? '#39FF14' : '#4A9EFF',
            }}
          >
            {phase === 'sweep' ? 'SWEEPING' : phase === 'lock' ? 'LOCKING' : 'LOCKED'}
          </span>
        </div>
      )}

      {phase === 'idle' && (
        <div className="absolute inset-0 flex items-center justify-center">
          <p
            className="text-xs font-mono uppercase tracking-[0.3em]"
            style={{ color: 'rgba(74,158,255,0.3)' }}
          >
            TALON HUD — STANDBY
          </p>
        </div>
      )}
    </div>
  );
}
