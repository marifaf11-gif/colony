"use client";

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

type ScanStep = 'idle' | 'vitals' | 'conversion' | 'seo' | 'complete';

interface RevenueRadarProps {
  scanStep: ScanStep;
  className?: string;
}

const NEON = '#39FF14';
const NEON_DIM = 'rgba(57, 255, 20, 0.15)';

export function RevenueRadar({ scanStep, className }: RevenueRadarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const angleRef = useRef<number>(0);

  const isActive = scanStep !== 'idle' && scanStep !== 'complete';
  const isComplete = scanStep === 'complete';

  const stepAngles: Record<ScanStep, number> = {
    idle: 0,
    vitals: 120,
    conversion: 240,
    seo: 360,
    complete: 360,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const SIZE = 240;
    canvas.width = SIZE;
    canvas.height = SIZE;
    const cx = SIZE / 2;
    const cy = SIZE / 2;
    const RINGS = 4;

    let sweepAngle = 0;
    let frameCount = 0;

    const draw = () => {
      ctx.clearRect(0, 0, SIZE, SIZE);

      ctx.fillStyle = '#070d18';
      ctx.fillRect(0, 0, SIZE, SIZE);

      for (let r = 1; r <= RINGS; r++) {
        const radius = (cx * 0.85 * r) / RINGS;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.strokeStyle = isComplete ? 'rgba(57,255,20,0.4)' : 'rgba(57,255,20,0.12)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].forEach((a) => {
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + Math.cos(a) * cx * 0.9, cy + Math.sin(a) * cy * 0.9);
        ctx.strokeStyle = isComplete ? 'rgba(57,255,20,0.3)' : 'rgba(57,255,20,0.08)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      });

      if (isActive) {
        sweepAngle += 0.035;
        angleRef.current = sweepAngle;

        const sweepWidth = Math.PI / 2.5;

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, cx * 0.85, sweepAngle - sweepWidth, sweepAngle);
        ctx.closePath();

        const fillGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, cx * 0.85);
        fillGrad.addColorStop(0, 'rgba(57,255,20,0)');
        fillGrad.addColorStop(0.6, 'rgba(57,255,20,0.08)');
        fillGrad.addColorStop(1, 'rgba(57,255,20,0.2)');
        ctx.fillStyle = fillGrad;
        ctx.fill();
        ctx.restore();

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(
          cx + Math.cos(sweepAngle) * cx * 0.88,
          cy + Math.sin(sweepAngle) * cy * 0.88
        );
        ctx.strokeStyle = NEON;
        ctx.lineWidth = 1.5;
        ctx.shadowColor = NEON;
        ctx.shadowBlur = 8;
        ctx.stroke();
        ctx.restore();
      }

      if (isActive || isComplete) {
        frameCount++;
        const blips: Array<{ angle: number; dist: number; phase: number }> = [
          { angle: 0.8, dist: 0.55, phase: 0 },
          { angle: 2.1, dist: 0.72, phase: 0.5 },
          { angle: 3.8, dist: 0.38, phase: 1.0 },
          { angle: 5.0, dist: 0.65, phase: 1.5 },
          { angle: 1.5, dist: 0.45, phase: 0.8 },
        ];

        blips.forEach(({ angle, dist, phase }) => {
          const blipOpacity = isComplete
            ? 1
            : Math.max(0, Math.sin(sweepAngle - angle) * 2);
          if (blipOpacity <= 0.02 && !isComplete) return;

          const bx = cx + Math.cos(angle) * cx * 0.85 * dist;
          const by = cy + Math.sin(angle) * cy * 0.85 * dist;
          const pulse = isComplete
            ? 0.6 + 0.4 * Math.sin(frameCount * 0.05 + phase)
            : blipOpacity;

          ctx.save();
          ctx.beginPath();
          ctx.arc(bx, by, 3, 0, Math.PI * 2);
          ctx.fillStyle = NEON;
          ctx.globalAlpha = pulse;
          ctx.shadowColor = NEON;
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.restore();
        });
      }

      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fillStyle = NEON;
      ctx.shadowColor = NEON;
      ctx.shadowBlur = 12;
      ctx.fill();
      ctx.restore();

      animRef.current = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animRef.current);
  }, [isActive, isComplete]);

  const steps: { key: ScanStep; label: string }[] = [
    { key: 'vitals', label: 'Core' },
    { key: 'conversion', label: 'CTA' },
    { key: 'seo', label: 'SEO' },
  ];

  const stepIndex: Record<ScanStep, number> = {
    idle: -1,
    vitals: 0,
    conversion: 1,
    seo: 2,
    complete: 3,
  };

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      <div
        className="relative rounded-full p-2"
        style={{
          background: 'radial-gradient(ellipse at center, #0a1f10 0%, #070d18 100%)',
          boxShadow: isActive
            ? `0 0 30px rgba(57,255,20,0.25), 0 0 60px rgba(57,255,20,0.1), inset 0 0 20px rgba(57,255,20,0.05)`
            : '0 0 12px rgba(57,255,20,0.1)',
          border: '1px solid rgba(57,255,20,0.2)',
        }}
      >
        <canvas ref={canvasRef} className="rounded-full block" />

        {isActive && (
          <div
            className="absolute -inset-2 rounded-full pointer-events-none"
            style={{
              border: `1px solid rgba(57,255,20,0.3)`,
              animation: 'radar-ping 1.5s ease-out infinite',
            }}
          />
        )}
      </div>

      <div className="flex items-center gap-3">
        {steps.map((step, i) => {
          const current = stepIndex[scanStep];
          const done = current > i;
          const active = current === i;

          return (
            <div key={step.key} className="flex items-center gap-1.5">
              <div
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{
                  background: done || active ? NEON : 'rgba(57,255,20,0.15)',
                  boxShadow: active ? `0 0 8px ${NEON}` : done ? `0 0 4px ${NEON}` : 'none',
                }}
              />
              <span
                className="text-xs font-mono uppercase tracking-wider transition-colors duration-300"
                style={{ color: done || active ? NEON : 'rgba(57,255,20,0.3)' }}
              >
                {step.label}
              </span>
              {i < steps.length - 1 && (
                <div
                  className="w-4 h-px ml-1"
                  style={{ background: done ? NEON : 'rgba(57,255,20,0.15)' }}
                />
              )}
            </div>
          );
        })}
      </div>

      <style jsx>{`
        @keyframes radar-ping {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(1.15); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
