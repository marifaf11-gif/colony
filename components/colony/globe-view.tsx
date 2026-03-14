"use client";

import { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

const HOTSPOTS = [
  { lat: 43.7, lng: -79.4 },
  { lat: 48.8, lng: 2.3 },
  { lat: 35.7, lng: 139.7 },
  { lat: -33.9, lng: 151.2 },
  { lat: 51.5, lng: -0.1 },
  { lat: 1.3, lng: 103.8 },
];

const GRID_LINES = 8;

function latLngToSvg(lat: number, lng: number, cx: number, cy: number, r: number) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lng + 180) * Math.PI) / 180;
  const x = cx + r * Math.sin(phi) * Math.cos(theta - Math.PI);
  const y = cy + r * Math.cos(phi);
  return { x, y };
}

interface GlobeViewProps {
  className?: string;
}

export function GlobeView({ className }: GlobeViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rotationRef = useRef(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg) return;

    const cx = 120;
    const cy = 120;
    const r = 90;

    const animate = () => {
      rotationRef.current += 0.002;
      const offset = rotationRef.current;

      const hotspotGroup = svg.querySelector('#hotspots');
      if (hotspotGroup) {
        hotspotGroup.innerHTML = '';
        HOTSPOTS.forEach((hs, i) => {
          const adjustedLng = hs.lng + offset * (180 / Math.PI);
          const { x, y } = latLngToSvg(hs.lat, adjustedLng, cx, cy, r);
          const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          dot.setAttribute('cx', String(x));
          dot.setAttribute('cy', String(y));
          dot.setAttribute('r', '3');
          dot.setAttribute('fill', '#39FF14');
          dot.setAttribute('opacity', '0.9');
          const glow = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
          glow.setAttribute('cx', String(x));
          glow.setAttribute('cy', String(y));
          glow.setAttribute('r', '6');
          glow.setAttribute('fill', 'none');
          glow.setAttribute('stroke', '#39FF14');
          glow.setAttribute('stroke-width', '1');
          glow.setAttribute('opacity', String(0.3 + 0.2 * Math.sin(Date.now() / 600 + i)));
          hotspotGroup.appendChild(glow);
          hotspotGroup.appendChild(dot);
        });
      }

      const gridGroup = svg.querySelector('#grid');
      if (gridGroup) {
        gridGroup.innerHTML = '';
        for (let i = 0; i < GRID_LINES; i++) {
          const lng = (i / GRID_LINES) * 360 + offset * (180 / Math.PI);
          const pathData: string[] = [];
          for (let lat = -80; lat <= 80; lat += 5) {
            const { x, y } = latLngToSvg(lat, lng, cx, cy, r);
            pathData.push(`${lat === -80 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
          }
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute('d', pathData.join(' '));
          path.setAttribute('stroke', '#4A9EFF');
          path.setAttribute('stroke-width', '0.4');
          path.setAttribute('fill', 'none');
          path.setAttribute('opacity', '0.18');
          gridGroup.appendChild(path);
        }
        for (let j = 1; j < 6; j++) {
          const lat = -75 + j * 30;
          const pathData: string[] = [];
          for (let lng2 = 0; lng2 <= 360; lng2 += 5) {
            const adjustedLng2 = lng2 + offset * (180 / Math.PI);
            const { x, y } = latLngToSvg(lat, adjustedLng2, cx, cy, r);
            pathData.push(`${lng2 === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`);
          }
          const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
          path.setAttribute('d', pathData.join(' ') + ' Z');
          path.setAttribute('stroke', '#4A9EFF');
          path.setAttribute('stroke-width', '0.4');
          path.setAttribute('fill', 'none');
          path.setAttribute('opacity', '0.12');
          gridGroup.appendChild(path);
        }
      }

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        'relative rounded-xl overflow-hidden flex items-center justify-center',
        className
      )}
      style={{
        background: 'radial-gradient(ellipse at center, #0d1f35 0%, #070d18 100%)',
        border: '1px solid rgba(74,158,255,0.15)',
      }}
    >
      <div
        className="absolute inset-x-0 top-0 h-8 rounded-t-xl z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(7,13,24,0.8), transparent)' }}
      />
      <div
        className="absolute inset-x-0 bottom-0 h-8 rounded-b-xl z-10 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(7,13,24,0.8), transparent)' }}
      />

      <svg
        ref={svgRef}
        viewBox="0 0 240 240"
        width="100%"
        height="100%"
        style={{ maxWidth: 320 }}
      >
        <defs>
          <radialGradient id="globeGrad" cx="40%" cy="35%" r="65%">
            <stop offset="0%" stopColor="#1a3a5c" />
            <stop offset="100%" stopColor="#070d18" />
          </radialGradient>
          <radialGradient id="atmosphereGrad" cx="50%" cy="50%" r="50%">
            <stop offset="75%" stopColor="transparent" />
            <stop offset="100%" stopColor="rgba(74,158,255,0.08)" />
          </radialGradient>
          <clipPath id="globeClip">
            <circle cx="120" cy="120" r="90" />
          </clipPath>
        </defs>

        <circle cx="120" cy="120" r="90" fill="url(#globeGrad)" />

        <circle cx="120" cy="120" r="90" fill="none" stroke="#4A9EFF" strokeWidth="0.5" opacity="0.2" />

        <g id="grid" clipPath="url(#globeClip)" />
        <g id="hotspots" clipPath="url(#globeClip)" />

        <circle cx="120" cy="120" r="105" fill="url(#atmosphereGrad)" />

        <ellipse
          cx="100"
          cy="88"
          rx="22"
          ry="12"
          fill="white"
          opacity="0.04"
          transform="rotate(-30 100 88)"
        />
      </svg>

      <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 z-20 pointer-events-none">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: '#39FF14',
              boxShadow: '0 0 6px #39FF14',
              opacity: 0.8,
              animation: `gpulse 2s ease-in-out ${i * 0.3}s infinite`,
            }}
          />
        ))}
      </div>

      <style>{`
        @keyframes gpulse {
          0%, 100% { opacity: 0.4; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.4); }
        }
      `}</style>
    </div>
  );
}
