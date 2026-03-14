"use client";

import { useState } from 'react';
import { Download, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ScanResult } from '@/lib/pods/scan-engine';

interface TactileReportButtonProps {
  result: ScanResult;
  label: string;
  disabled?: boolean;
}

export function TactileReportButton({ result, label, disabled }: TactileReportButtonProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleGenerate = async () => {
    if (isGenerating || disabled) return;
    setIsGenerating(true);
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 120);

    try {
      const { generateProfitBlueprint } = await import('@/lib/pods/pdf-generator');
      await generateProfitBlueprint(result);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={handleGenerate}
      disabled={disabled || isGenerating}
      className={cn(
        'relative w-full flex items-center justify-center gap-3',
        'px-6 py-4 rounded-xl font-bold text-base',
        'transition-all duration-150 select-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        isPressed && 'translate-y-[2px]'
      )}
      style={{
        background: isGenerating
          ? 'linear-gradient(135deg, #1a4020 0%, #0f2515 100%)'
          : 'linear-gradient(135deg, #2a5c30 0%, #1a3d1e 50%, #0f2515 100%)',
        color: '#39FF14',
        border: '1px solid rgba(57,255,20,0.3)',
        boxShadow: isPressed
          ? 'inset 0 3px 6px rgba(0,0,0,0.5), 0 0 8px rgba(57,255,20,0.15)'
          : '0 4px 12px rgba(0,0,0,0.4), 0 0 20px rgba(57,255,20,0.15), inset 0 1px 0 rgba(57,255,20,0.2)',
        textShadow: '0 0 12px rgba(57,255,20,0.6)',
      }}
    >
      <div
        className="absolute inset-0 rounded-xl pointer-events-none"
        style={{
          background:
            'linear-gradient(135deg, rgba(57,255,20,0.08) 0%, transparent 60%)',
          boxShadow: 'inset 0 1px 0 rgba(57,255,20,0.15)',
        }}
      />

      {isGenerating ? (
        <>
          <Loader2 className="w-5 h-5 animate-spin" style={{ color: '#39FF14' }} />
          <span>Generating Blueprint...</span>
        </>
      ) : (
        <>
          <FileText className="w-5 h-5" style={{ filter: 'drop-shadow(0 0 4px #39FF14)' }} />
          <span>{label}</span>
          <Download className="w-4 h-4 ml-auto opacity-70" />
        </>
      )}
    </button>
  );
}
