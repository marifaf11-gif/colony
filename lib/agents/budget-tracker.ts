import { createClient } from '@/lib/supabase/client';
import type { AgentBudget } from './types';

const MAX_DAILY_SPEND_USD = 10;

function budgetTable(supabase: ReturnType<typeof createClient>) {
  return supabase.from('agent_budget') as ReturnType<typeof supabase.from<'agent_budget', never>>;
}

export async function trackSpend(
  agentName: string,
  spendUsd: number,
  tokensUsed: number,
  bountiesIdentified = 0
): Promise<void> {
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data: existing } = await (supabase as ReturnType<typeof createClient> & { from: (t: string) => ReturnType<typeof supabase.from> })
    .from('agent_budget')
    .select('id, spend_usd, tokens_used, requests_made, bounties_identified')
    .eq('agent_name', agentName)
    .eq('date', today)
    .maybeSingle() as { data: Record<string, number> | null };

  const row = {
    agent_name: agentName,
    date: today,
    spend_usd: (existing?.spend_usd ?? 0) + spendUsd,
    tokens_used: (existing?.tokens_used ?? 0) + tokensUsed,
    requests_made: (existing?.requests_made ?? 0) + 1,
    bounties_identified: (existing?.bounties_identified ?? 0) + bountiesIdentified,
    ...(existing?.id ? { id: existing.id } : {}),
  };

  await (supabase as unknown as { from: (t: string) => { upsert: (v: unknown) => Promise<unknown> } })
    .from('agent_budget')
    .upsert(row);
}

export async function checkBudget(
  agentName: string
): Promise<{ allowed: boolean; spentToday: number; remaining: number }> {
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data } = await supabase
    .from('agent_budget')
    .select('spend_usd')
    .eq('agent_name', agentName)
    .eq('date', today)
    .maybeSingle();

  const spentToday = (data as { spend_usd?: number } | null)?.spend_usd ?? 0;
  const remaining = MAX_DAILY_SPEND_USD - spentToday;
  return { allowed: remaining > 0, spentToday, remaining };
}

export async function getTodayBudgetSummary(): Promise<AgentBudget[]> {
  const supabase = createClient();
  const today = new Date().toISOString().slice(0, 10);

  const { data } = await supabase
    .from('agent_budget')
    .select('*')
    .eq('date', today)
    .order('spend_usd', { ascending: false });

  return (data ?? []) as unknown as AgentBudget[];
}

export async function getAllTimeBounties(): Promise<number> {
  const supabase = createClient();
  const { data } = await supabase
    .from('agent_budget')
    .select('bounties_identified');

  return (data as { bounties_identified?: number }[] ?? [])
    .reduce((sum, r) => sum + (r.bounties_identified ?? 0), 0);
}
