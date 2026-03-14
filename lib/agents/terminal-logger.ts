import { createClient } from '@/lib/supabase/client';
import type { AgentName, EventType, TerminalLog } from './types';

export async function logTerminal(
  agent: AgentName,
  event_type: EventType,
  message: string,
  opts: {
    target_url?: string;
    vulnerability_id?: string;
    metadata?: Record<string, unknown>;
  } = {}
): Promise<void> {
  try {
    const supabase = createClient();
    type AnyInsert = { from: (t: string) => { insert: (v: Record<string, unknown>) => Promise<unknown> } };
    await (supabase as unknown as AnyInsert).from('agent_terminal_logs').insert({
      agent,
      event_type,
      message,
      target_url: opts.target_url ?? null,
      vulnerability_id: opts.vulnerability_id ?? null,
      metadata: opts.metadata ?? {},
    });
  } catch {
  }
}

export async function getRecentLogs(limit = 50): Promise<TerminalLog[]> {
  const supabase = createClient();
  const { data } = await supabase
    .from('agent_terminal_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  return (data ?? []) as TerminalLog[];
}

export function subscribeToLogs(
  onLog: (log: TerminalLog) => void
): () => void {
  const supabase = createClient();
  const channel = supabase
    .channel('agent-terminal-realtime')
    .on(
      'postgres_changes',
      { event: 'INSERT', schema: 'public', table: 'agent_terminal_logs' },
      (payload) => onLog(payload.new as TerminalLog)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
