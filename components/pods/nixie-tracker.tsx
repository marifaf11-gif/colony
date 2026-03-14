"use client";

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

interface NixieTrackerProps {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
  className?: string;
  isAnimating?: boolean;
}

function NixieDigit({ char, lit }: { char: string; lit: boolean }) {
  return (
    <span
      className="inline-block font-mono text-4xl w-10 text-center select-none"
      style={{
        color: lit ? '#FF8C00' : '#1a0a00',
        textShadow: lit
          ? '0 0 8px #FF8C00, 0 0 20px rgba(255,140,0,0.6), 0 0 40px rgba(255,100,0,0.3)'
          : 'none',
        fontFamily: '"Courier New", monospace',
        fontWeight: 700,
        transition: 'color 0.12s ease, text-shadow 0.12s ease',
        letterSpacing: '-0.02em',
      }}
    >
      {char}
    </span>
  );
}

function NixieSeparator({ label }: { label?: string }) {
  return (
    <span
      className="inline-block font-mono text-2xl select-none mx-0.5"
      style={{
        color: '#FF6600',
        textShadow: '0 0 6px rgba(255,102,0,0.7)',
        fontFamily: '"Courier New", monospace',
      }}
    >
      {label ?? ','}
    </span>
  );
}

export function NixieTracker({
  value,
  label,
  prefix = '$',
  suffix,
  className,
  isAnimating = false,
}: NixieTrackerProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const animFrameRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    if (value === 0) {
      setDisplayValue(0);
      return;
    }

    let start = displayValue;
    const diff = value - start;
    const duration = 1800;
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(start + diff * eased));

      if (progress < 1) {
        animFrameRef.current = setTimeout(
          () => requestAnimationFrame(animate),
          16
        );
      }
    };

    requestAnimationFrame(animate);
    return () => {
      if (animFrameRef.current) clearTimeout(animFrameRef.current);
    };
  }, [value]);

  const scrambledRef = useRef<ReturnType<typeof setInterval>>();
  const [scramble, setScramble] = useState('');

  useEffect(() => {
    if (isAnimating) {
      scrambledRef.current = setInterval(() => {
        setScramble(
          String(Math.floor(Math.random() * 1000000))
            .padStart(7, '0')
            .slice(0, 7)
        );
      }, 60);
    } else {
      if (scrambledRef.current) clearInterval(scrambledRef.current);
      setScramble('');
    }
    return () => {
      if (scrambledRef.current) clearInterval(scrambledRef.current);
    };
  }, [isAnimating]);

  const formatted = isAnimating
    ? scramble
    : displayValue.toLocaleString('en-CA', { maximumFractionDigits: 0 });

  const chars = (prefix + formatted + (suffix || '')).split('');

  return (
    <div
      className={cn('relative rounded-xl p-5 overflow-hidden', className)}
      style={{
        background:
          'linear-gradient(145deg, #1a0a00 0%, #120600 50%, #0a0300 100%)',
        border: '1px solid #2a1200',
        boxShadow:
          'inset 0 2px 4px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.5), 0 0 20px rgba(255,100,0,0.08)',
      }}
    >
      <div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          background:
            'linear-gradient(135deg, rgba(255,80,0,0.06) 0%, transparent 60%)',
          boxShadow: 'inset 0 1px 0 rgba(255,100,0,0.15)',
        }}
      />

      <div className="absolute inset-2 rounded-lg pointer-events-none"
        style={{
          border: '1px solid rgba(255,80,0,0.08)',
          background: 'rgba(0,0,0,0.4)',
        }}
      />

      <div className="relative z-10">
        <p
          className="text-xs font-semibold uppercase tracking-widest mb-3"
          style={{ color: 'rgba(255,100,0,0.5)' }}
        >
          {label}
        </p>

        <div className="flex items-center gap-0.5 flex-wrap">
          {chars.map((char, i) => {
            if (char === ',' || char === '.') {
              return <NixieSeparator key={i} label={char} />;
            }
            const isNum = char >= '0' && char <= '9';
            const isCurrency = char === '$' || char === '€' || char === '¥' || char === '£';
            return (
              <NixieDigit
                key={i}
                char={char}
                lit={isNum || isCurrency || isAnimating}
              />
            );
          })}
        </div>

        <div className="mt-3 flex items-center gap-2">
          {isAnimating ? (
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <div
                  key={i}
                  className="w-1.5 h-1.5 rounded-full"
                  style={{
                    background: '#FF6600',
                    boxShadow: '0 0 4px #FF6600',
                    animation: `nixie-blink 0.6s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
              <span
                className="text-xs font-mono ml-1"
                style={{ color: 'rgba(255,102,0,0.6)' }}
              >
                CALCULATING...
              </span>
            </div>
          ) : value > 0 ? (
            <div
              className="w-2 h-2 rounded-full"
              style={{
                background: '#39FF14',
                boxShadow: '0 0 8px #39FF14',
                animation: 'nixie-pulse 2s ease-in-out infinite',
              }}
            />
          ) : null}
        </div>
      </div>

      <style jsx>{`
        @keyframes nixie-blink {
          0%, 100% { opacity: 0.3; }
          50% { opacity: 1; }
        }
        @keyframes nixie-pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
      `}</style>
    </div>
  );
}
