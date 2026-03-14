import { createClient } from '@/lib/supabase/client';
import type { ScanResult } from './scan-engine';

export async function persistLead(url: string, result: ScanResult, locale: string): Promise<void> {
  const supabase = createClient();

  await supabase
    .from('global_leads' as never)
    .insert({
      url,
      detected_language: result.detectedLanguage,
      total_leak_estimate: result.totalLeakEstimate,
      severity: result.severity,
      scores: result.scores,
      findings: result.findings,
      locale,
    } as never);
}
